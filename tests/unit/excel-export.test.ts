import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import type { WorkSheet } from "xlsx";
import { buildAamAdjustmentModel } from "../../src/lib/valuation/aam-adjustments";
import { calculateAllMethods } from "../../src/lib/valuation/calculations";
import {
  buildCaseProfileDerived,
  buildFixedAssetScheduleSummary,
  buildSampleAssumptions,
  buildSampleCaseProfile,
  buildSamplePeriods,
  buildSampleRows,
  buildSnapshot,
  mapRow,
  type FixedAssetScheduleRow,
} from "../../src/lib/valuation/case-model";
import { buildSampleDlocPfcState, calculateDlocPfc } from "../../src/lib/valuation/dloc-pfc";
import { buildSampleDlomState, calculateDlom } from "../../src/lib/valuation/dlom";
import { buildValuationTemplateWorkbook, buildValuationWorkbook, type ValuationExcelExportInput } from "../../src/lib/valuation/excel-export";
import { buildWorkbenchReadiness } from "../../src/lib/valuation/readiness";
import { buildSectionAnalysis } from "../../src/lib/valuation/section-analysis";
import { buildSampleTaxSimulationState, calculateTaxSimulation } from "../../src/lib/valuation/tax-simulation";
import { buildValidationChecks } from "../../src/lib/valuation/validation-checks";

describe("valuation Excel export", () => {
  it("builds a multi-sheet workbook with editable formulas for key valuation outputs", () => {
    const input = buildSampleExportInput();
    const { workbook, filename } = buildValuationWorkbook(input);

    assert.match(filename, /valuation-export-v1-2026-05-03\.xlsx$/);
    assert.deepEqual(workbook.SheetNames, [
      "00_Summary",
      "01_Case_Profile",
      "02_Inputs",
      "03_Fixed_Assets",
      "04_Assumptions",
      "05_Snapshot",
      "06_AAM",
      "07_EEM",
      "08_DCF",
      "09_DLOM_DLOC",
      "10_Tax_Simulation",
      "11_Section_Analysis",
      "12_Audit_Trace",
    ]);

    assert.match(findFormulaByLabel(workbook.Sheets["06_AAM"], "AAM equity value"), /-/);
    assert.match(findFormulaByLabel(workbook.Sheets["07_EEM"], "EEM equity value"), /\+/);
    assert.match(findFormulaByLabel(workbook.Sheets["08_DCF"], "DCF equity value"), /\+/);
    assert.equal(workbook.Sheets["10_Tax_Simulation"]["Q2"].f, "P2*R2");
  });

  it("builds a template-clone V2 workbook while preserving the reference sheets and formulas", () => {
    const templateData = readFileSync("public/templates/kkp-saham-final-account-category-review-update.xlsx");
    const { workbook, filename } = buildValuationTemplateWorkbook(buildSampleExportInput(), templateData);

    assert.match(filename, /valuation-export-v2-template-clone-2026-05-03\.xlsx$/);
    assert.equal(workbook.SheetNames.length, 69);
    assert.equal(workbook.SheetNames[0], "CATATAN FINAL");
    assert.ok(workbook.SheetNames.includes("BALANCE SHEET"));
    assert.ok(workbook.SheetNames.includes("INCOME STATEMENT"));
    assert.ok(workbook.SheetNames.includes("AAM"));
    assert.ok(workbook.SheetNames.includes("DCF"));
    assert.ok(workbook.SheetNames.includes("SIMULASI POTENSI PAJAK"));
    assert.equal(workbook.SheetNames.at(-1), "PVB_EXPORT_V2_AUDIT");
    assert.equal(workbook.Sheets.HOME.B4.v, "Makmur Jaya Sejati Raya");
    assert.equal(workbook.Sheets.HOME.B19.v, 2022);
    assert.equal(workbook.Sheets["BALANCE SHEET"].E8.v, 717848795);
    assert.equal(workbook.Sheets["INCOME STATEMENT"].E6.v, 16663916100);
    assert.equal(workbook.Sheets.DLOM.F34.f, "LEFT(C32,3)+(F33/F31*F32)");
    assert.equal(workbook.Sheets["DLOC(PFC)"].B20.f, 'IF(LOWER(HOME!B7)="tertutup","DLOC Perusahaan tertutup ","DLOC Perusahaan terbuka ")');
    assert.equal(workbook.Sheets["SIMULASI POTENSI PAJAK"].E1.f, 'IF(C1="AAM", AAM!E53, IF(C1="EEM", EEM!D34, IF(C1="DCF", DCF!C33, "")))');
    assert.equal(workbook.Sheets.PVB_EXPORT_V2_AUDIT.A1.v, "Export XLSX V2 Audit");
  });
});

function buildSampleExportInput(): ValuationExcelExportInput {
    const periods = buildSamplePeriods();
    const rows = buildSampleRows();
    const mappedRows = rows.map(mapRow);
    const assumptions = buildSampleAssumptions();
    const caseProfile = buildSampleCaseProfile();
    const caseProfileDerived = buildCaseProfileDerived(caseProfile);
    const fixedAssetScheduleRows: FixedAssetScheduleRow[] = [];
    const fixedAssetSchedule = buildFixedAssetScheduleSummary(periods, fixedAssetScheduleRows);
    const snapshot = buildSnapshot(periods, "p2021", rows, assumptions, fixedAssetScheduleRows);
    const aamAdjustmentModel = buildAamAdjustmentModel(snapshot, {});
    const results = calculateAllMethods(snapshot, {
      aam: {
        assetAdjustment: aamAdjustmentModel.assetAdjustmentTotal,
        liabilityAdjustment: aamAdjustmentModel.liabilityAdjustmentTotal,
        missingAdjustmentNotes: aamAdjustmentModel.missingNoteCount,
      },
    });
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
    const validationChecks = buildValidationChecks(rows, mappedRows, assumptions, snapshot, balanceSheetGap, fixedAssetSchedule);
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
      activePeriodId: "p2021",
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
      dlomCalculation,
      dlocPfcCalculation,
      taxSimulation,
      taxSimulationResult,
      sectionAnalysis,
      readiness,
      validationChecks,
      exportedAt: new Date("2026-05-03T00:00:00.000Z"),
    };
}

function findFormulaByLabel(sheet: WorkSheet, label: string): string {
  const rangeText = sheet["!ref"];
  assert.ok(rangeText);
  const range = decodeRange(rangeText);

  for (let row = range.s.r; row <= range.e.r; row += 1) {
    const labelCell = sheet[encodeCell(row, 0)];

    if (labelCell?.v === label) {
      const formulaCell = sheet[encodeCell(row, 2)];
      assert.equal(typeof formulaCell?.f, "string");

      return formulaCell.f;
    }
  }

  assert.fail(`Formula row not found for ${label}`);
}

function decodeRange(ref: string) {
  const [start, end] = ref.split(":");

  return { s: decodeCell(start), e: decodeCell(end ?? start) };
}

function decodeCell(ref: string) {
  const match = /^([A-Z]+)(\d+)$/.exec(ref);
  assert.ok(match);
  const column = match[1].split("").reduce((sum, char) => sum * 26 + char.charCodeAt(0) - 64, 0) - 1;

  return { c: column, r: Number(match[2]) - 1 };
}

function encodeCell(row: number, column: number): string {
  let value = column + 1;
  let label = "";

  while (value > 0) {
    const mod = (value - 1) % 26;
    label = String.fromCharCode(65 + mod) + label;
    value = Math.floor((value - mod) / 26);
  }

  return `${label}${row + 1}`;
}
