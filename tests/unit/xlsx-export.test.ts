import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildAamAdjustmentModel } from "../../src/lib/valuation/aam-adjustments";
import { calculateAllMethods } from "../../src/lib/valuation/calculations";
import {
  buildCaseProfileDerived,
  buildFixedAssetScheduleSummary,
  buildSampleAssumptions,
  buildSampleCaseProfile,
  buildSampleFixedAssetScheduleRows,
  buildSamplePeriods,
  buildSampleRows,
  buildSnapshot,
  mapRow,
} from "../../src/lib/valuation/case-model";
import { buildSampleDlocPfcState, calculateDlocPfc } from "../../src/lib/valuation/dloc-pfc";
import { buildSampleDlomState, calculateDlom } from "../../src/lib/valuation/dlom";
import { buildSectionAnalysis } from "../../src/lib/valuation/section-analysis";
import { buildSampleTaxSimulationState, calculateTaxSimulation } from "../../src/lib/valuation/tax-simulation";
import { buildValidationChecks } from "../../src/lib/valuation/validation-checks";
import { buildWorkbenchReadiness } from "../../src/lib/valuation/readiness";
import { buildValuationXlsxWorkbook, createValuationXlsxFile, type XlsxCellValue } from "../../src/lib/valuation/xlsx-export";
import type { ValuationPdfExportInput } from "../../src/lib/valuation/pdf-export";

const exportedAt = new Date("2026-05-07T10:00:00.000Z");

describe("valuation XLSX export", () => {
  it("builds AAM-only workbook sheets without EEM or DCF sections", () => {
    const workbook = buildValuationXlsxWorkbook(buildSampleExportInput(), "aam", exportedAt);
    const sheetNames = workbook.sheets.map((sheet) => sheet.name);

    assert.equal(workbook.scope.id, "aam");
    assert.ok(sheetNames.includes("Calculation Model"));
    assert.ok(sheetNames.includes("AAM Adjustments"));
    assert.ok(sheetNames.includes("Formula Trace"));
    assert.ok(sheetNames.includes("DLOM"));
    assert.ok(sheetNames.includes("DLOC PFC"));
    assert.equal(sheetNames.includes("EEM Sensitivity"), false);
    assert.equal(sheetNames.includes("DCF Sensitivity"), false);
    assert.equal(sheetNames.includes("DCF Forecast"), false);
    assert.equal(workbook.sheets.find((sheet) => sheet.name === "Formula Trace")?.rows.slice(1).every((row) => row[0] === "AAM"), true);
    assert.ok(countFormulaCells(workbook.sheets.flatMap((sheet) => sheet.rows)) > 40);
  });

  it("builds DCF workbook sheets with active scenario metadata and scoped traces", () => {
    const workbook = buildValuationXlsxWorkbook(buildSampleExportInput(), "dcf", exportedAt);
    const sheetNames = workbook.sheets.map((sheet) => sheet.name);
    const summaryRows = workbook.sheets.find((sheet) => sheet.name === "Summary")?.rows ?? [];

    assert.equal(workbook.scope.id, "dcf");
    assert.ok(sheetNames.includes("DCF Sensitivity"));
    assert.ok(sheetNames.includes("DCF Forecast"));
    assert.equal(sheetNames.includes("AAM Adjustments"), false);
    assert.equal(sheetNames.includes("EEM Sensitivity"), false);
    assert.ok(summaryRows.some((row) => row[0] === "Active DCF Basis" && row[1] === "DCF - skenario dasar"));
    assert.equal(workbook.sheets.find((sheet) => sheet.name === "Formula Trace")?.rows.slice(1).every((row) => row[0] === "DCF"), true);
    assert.ok(countFormulaCells(workbook.sheets.find((sheet) => sheet.name === "DCF Forecast")?.rows ?? []) >= 35);
    assert.ok(countFormulaCells(workbook.sheets.find((sheet) => sheet.name === "DLOM")?.rows ?? []) >= 15);
    assert.ok(countFormulaCells(workbook.sheets.find((sheet) => sheet.name === "DLOC PFC")?.rows ?? []) >= 10);
  });

  it("encodes a valid OOXML zip package with a scoped XLSX filename", () => {
    const file = createValuationXlsxFile(buildSampleExportInput(), "all", exportedAt);

    assert.match(file.filename, /^penilaian-bisnis-makmur-jaya-sejati-raya-aam-eem-dcf-2026-05-07\.xlsx$/);
    assert.equal(file.bytes[0], 0x50);
    assert.equal(file.bytes[1], 0x4b);
    assert.equal(file.bytes[2], 0x03);
    assert.equal(file.bytes[3], 0x04);
    assert.ok(file.bytes.length > 10_000);
    const xml = new TextDecoder().decode(file.bytes);

    assert.ok(xml.includes("<f>"));
    assert.ok(xml.includes('formatCode="#,##0;[Red](#,##0);0"'));
    assert.ok(xml.includes('formatCode="0.00%;[Red](0.00%);0.00%"'));
    assert.ok(xml.includes(' s="2"'));
    assert.ok(xml.includes(' s="3"'));
    assert.ok(xml.includes('cellXfs count="8"'));
    assert.ok(xml.includes('wrapText="1"'));
    assert.ok(xml.includes('vertical="top"'));
    assert.ok(xml.includes('bestFit="1"'));
    assert.ok(xml.includes('customHeight="1"'));
    assert.ok(extractColumnWidths(xml).some((width) => width > 28));
    assert.ok(extractColumnWidths(xml).every((width) => width <= 40));
    assert.doesNotMatch(xml, /(^|[^A-Z])IFS\(/);
    assert.doesNotMatch(xml, /(^|[^A-Z])SWITCH\(/);
    assert.doesNotMatch(xml, /(^|[^A-Z])FLOOR\(/);
  });
});

function countFormulaCells(rows: XlsxCellValue[][]): number {
  return rows.flat().filter((cell) => Boolean(cell && typeof cell === "object" && "formula" in cell)).length;
}

function extractColumnWidths(xml: string): number[] {
  return Array.from(xml.matchAll(/<col [^>]*width="([^"]+)"/g), (match) => Number(match[1]));
}

function buildSampleExportInput(): ValuationPdfExportInput {
  const periods = buildSamplePeriods();
  const activePeriodId = "p2021";
  const rows = buildSampleRows();
  const mappedRows = rows.map(mapRow);
  const fixedAssetScheduleRows = buildSampleFixedAssetScheduleRows();
  const fixedAssetSchedule = buildFixedAssetScheduleSummary(periods, fixedAssetScheduleRows);
  const assumptions = buildSampleAssumptions();
  const snapshot = buildSnapshot(periods, activePeriodId, rows, assumptions, fixedAssetScheduleRows);
  const aamAdjustmentModel = buildAamAdjustmentModel(snapshot, {});
  const results = calculateAllMethods(snapshot, {
    aam: {
      assetAdjustment: aamAdjustmentModel.assetAdjustmentTotal,
      liabilityAdjustment: aamAdjustmentModel.liabilityAdjustmentTotal,
      missingAdjustmentNotes: aamAdjustmentModel.missingNoteCount,
    },
  });
  const caseProfile = buildSampleCaseProfile();
  const caseProfileDerived = buildCaseProfileDerived(caseProfile);
  const dlomCalculation = calculateDlom(buildSampleDlomState(), snapshot, caseProfile);
  const dlocPfcCalculation = calculateDlocPfc(buildSampleDlocPfcState(), caseProfile);
  const taxSimulation = buildSampleTaxSimulationState();
  const taxSimulationResult = calculateTaxSimulation({
    methods: [results.aam, results.eem, results.dcf],
    dlom: dlomCalculation,
    dlocPfc: dlocPfcCalculation,
    state: taxSimulation,
    caseProfile,
    caseProfileDerived,
    snapshot,
  });
  const sectionAnalysis = buildSectionAnalysis(periods, rows, assumptions, fixedAssetScheduleRows);
  const equityBookComponents =
    snapshot.paidUpCapital +
    snapshot.additionalPaidInCapital +
    snapshot.retainedEarningsSurplus +
    snapshot.retainedEarningsCurrentProfit;
  const balanceSheetGap = results.adjustedTotalAssets - results.adjustedTotalLiabilities - equityBookComponents;
  const readiness = buildWorkbenchReadiness({
    periods,
    rows,
    mappedRows,
    assumptions,
    snapshot,
    fixedAssetSchedule,
    caseProfile,
    caseProfileDerived,
    dlocPfc: dlocPfcCalculation,
    taxSimulation,
  });

  return {
    periods,
    activePeriodId,
    rows,
    mappedRows,
    fixedAssetScheduleRows,
    fixedAssetSchedule,
    assumptions,
    resolvedAssumptions: assumptions,
    caseProfile,
    caseProfileDerived,
    snapshot,
    aamAdjustmentModel,
    results,
    baseResults: results,
    activeWaccBasis: "governed",
    activeWaccBasisLabel: "Governed WACC",
    activeWaccBasisSummary: "Default sistem.",
    activeDcfBasis: "base",
    activeDcfBasisLabel: "DCF - skenario dasar",
    activeDcfBasisSummary: "Skenario utama memakai WACC, terminal growth, modal kerja incremental, dan struktur utang aktif.",
    dlomCalculation,
    dlocPfcCalculation,
    taxSimulation,
    taxSimulationResult,
    sectionAnalysis,
    readiness,
    validationChecks: buildValidationChecks(rows, mappedRows, assumptions, snapshot, balanceSheetGap, fixedAssetSchedule),
    exportedAt,
  };
}
