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
import { buildValuationTemplateWorkbook, buildValuationWorkbook, writeValuationTemplateWorkbook, type ValuationExcelExportInput } from "../../src/lib/valuation/excel-export";
import { buildWorkbenchReadiness } from "../../src/lib/valuation/readiness";
import { buildSectionAnalysis } from "../../src/lib/valuation/section-analysis";
import { buildSampleTaxSimulationState, calculateTaxSimulation } from "../../src/lib/valuation/tax-simulation";
import { buildValidationChecks } from "../../src/lib/valuation/validation-checks";
import workbenchStateFixture from "../fixtures/export-xlsx-v2-workbench-state.json";
import { buildExportInputFromWorkbenchFixture, type WorkbenchFixtureState } from "../helpers/valuation-export-input";
import { getCellFontRgbFromXlsx, getWorkbookCalcPrAttributesFromXlsx, hasXlsxEntry } from "../helpers/xlsx-style";

describe("valuation Excel export", () => {
  it("still builds the legacy V1 audit workbook for internal fallback coverage", () => {
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

  it("builds the primary template-clone XLSX workbook while preserving formulas and recording mapping status", () => {
    const templateData = readFileSync("public/templates/kkp-saham-final-account-category-review-update.xlsx");
    const input = buildSampleExportInput();
    const { workbook, filename, blueCells, sourceOriginEntries } = buildValuationTemplateWorkbook(input, templateData);

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
    assert.equal(workbook.Sheets.HOME.A5.v, "KLU sesuai Appportal");
    assert.equal(workbook.Sheets.HOME.B5.v, "01262 - PERKEBUNAN BUAH KELAPA SAWIT");
    assert.equal(workbook.Sheets.HOME.B6.v, "Consumer Non-Cyclicals");
    assert.equal(workbook.Sheets.HOME.B19.v, 2022);
    assert.equal(workbook.Sheets["BALANCE SHEET"].E8.v, 717848795);
    assert.equal(workbook.Sheets["INCOME STATEMENT"].E6.v, 16663916100);
    assert.equal(workbook.Sheets.STAT_ASSUMPTIONS.B5.v, input.snapshot.taxRate);
    assert.equal(workbook.Sheets.STAT_ASSUMPTIONS.B6.f, "WACC!E22");
    assert.equal(workbook.Sheets.STAT_ASSUMPTIONS.B6.v, input.snapshot.wacc);
    assert.equal(workbook.Sheets.STAT_ASSUMPTIONS.B9.v, input.snapshot.revenueGrowth);
    assert.equal(workbook.Sheets.STAT_ASSUMPTIONS.B10.v, input.snapshot.requiredReturnOnNta);
    assert.equal(workbook.Sheets.AAM.E53.f, "E51-E52");
    assert.equal(workbook.Sheets.AAM.E53.v, input.results.aam.equityValue);
    assert.equal(workbook.Sheets.EEM.D34.f, "D31+D32+D33");
    assert.equal(workbook.Sheets.EEM.D34.v, input.results.eem.equityValue);
    assert.equal(workbook.Sheets.DCF.C33.f, "SUM(C29:C32)");
    assert.equal(workbook.Sheets.DCF.C33.v, input.results.dcf.equityValue);
    assert.equal(workbook.Sheets.DLOM.F34.f, "LEFT(C32,3)+(F33/F31*F32)");
    assert.equal(workbook.Sheets["DLOC(PFC)"].B20.f, 'IF(LOWER(HOME!B7)="tertutup","DLOC Perusahaan tertutup ","DLOC Perusahaan terbuka ")');
    assert.equal(workbook.Sheets["SIMULASI POTENSI PAJAK"].E1.f, 'IF(C1="AAM", AAM!E53, IF(C1="EEM", EEM!D34, IF(C1="DCF", DCF!C33, "")))');
    assert.equal(workbook.Sheets["SIMULASI POTENSI PAJAK"].E1.v, input.taxSimulationResult.primaryRow?.baseEquityValue);
    assert.equal(workbook.Sheets.PVB_EXPORT_V2_AUDIT.A1.v, "Export XLSX V2 Audit");
    assert.equal(workbook.Sheets.PVB_EXPORT_V2_AUDIT.F9.v, "Source Origin");
    assert.equal(workbook.Sheets.PVB_EXPORT_V2_AUDIT.G9.v, "Status");
    assert.equal(workbook.Sheets.PVB_EXPORT_V2_AUDIT.H9.v, "Font Mark");
    assert.equal(workbook.Sheets.PVB_EXPORT_V2_AUDIT.I9.v, "Previous Formula");
    assertAuditContains(workbook.Sheets.PVB_EXPORT_V2_AUDIT, "HOME", "B4", "mapped", "website-sourced", "default");
    assertAuditContains(workbook.Sheets.PVB_EXPORT_V2_AUDIT, "STAT_ASSUMPTIONS", "B6", "formula-corrected", "web-derived", "default");
    assertAuditContains(workbook.Sheets.PVB_EXPORT_V2_AUDIT, "AAM", "E53", "cached-formula", "web-derived", "default");
    assertAuditContains(workbook.Sheets.PVB_EXPORT_V2_AUDIT, "BALANCE SHEET", "E8", "formula-neutralized", "website-sourced", "default");
    assertAuditContains(workbook.Sheets.PVB_EXPORT_V2_AUDIT, "KEY DRIVERS", "E18", "mapped", "deferred/unmapped", "blue");
    assertAuditContains(workbook.Sheets.PVB_EXPORT_V2_AUDIT, "DLOM", "F34", "template-formula", "template-formula", "blue");
    assertAuditContains(workbook.Sheets.PVB_EXPORT_V2_AUDIT, "SIMULASI POTENSI PAJAK", "C3", "template-formula", "template-formula", "blue");
    assertAuditContains(workbook.Sheets.PVB_EXPORT_V2_AUDIT, "DISCOUNT RATE", "C3", "mapped", "website-sourced", "default");
    assertAuditContains(workbook.Sheets.PVB_EXPORT_V2_AUDIT, "DISCOUNT RATE", "L6", "template-default", "template-default", "blue");
    assert.ok(blueCells?.some((cell) => cell.sheet === "DLOM" && cell.cell === "F34"));
    assert.ok(blueCells?.some((cell) => cell.sheet === "SIMULASI POTENSI PAJAK" && cell.cell === "C3"));
    assert.ok(sourceOriginEntries?.some((entry) => entry.sheet === "HOME" && entry.cell === "B4" && entry.sourceOrigin === "website-sourced"));
  });

  it("writes blue font styles to non-website V2 cells through XLSX XML post-processing", () => {
    const templateData = readFileSync("public/templates/kkp-saham-final-account-category-review-update.xlsx");
    const input = buildSampleExportInput();
    const { data } = writeValuationTemplateWorkbook(input, templateData);
    const calcPr = getWorkbookCalcPrAttributesFromXlsx(data);

    assert.equal(getCellFontRgbFromXlsx(data, "KEY DRIVERS", "E18"), "FF0000FF");
    assert.equal(getCellFontRgbFromXlsx(data, "DLOM", "F34"), "FF0000FF");
    assert.equal(getCellFontRgbFromXlsx(data, "SIMULASI POTENSI PAJAK", "C3"), "FF0000FF");
    assert.equal(getCellFontRgbFromXlsx(data, "DISCOUNT RATE", "L6"), "FF0000FF");
    assert.notEqual(getCellFontRgbFromXlsx(data, "HOME", "B4"), "FF0000FF");
    assert.notEqual(getCellFontRgbFromXlsx(data, "AAM", "E53"), "FF0000FF");
    assert.notEqual(getCellFontRgbFromXlsx(data, "DISCOUNT RATE", "C3"), "FF0000FF");
    assert.equal(calcPr.calcMode, "auto");
    assert.equal(calcPr.calcOnSave, "1");
    assert.equal(calcPr.forceFullCalc, "1");
    assert.equal(calcPr.fullCalcOnLoad, "1");
    assert.equal(hasXlsxEntry(data, "xl/calcChain.xml"), false);
  });

  it("uses the provided website workbench JSON fixture as the V2 export audit source", () => {
    const templateData = readFileSync("public/templates/kkp-saham-final-account-category-review-update.xlsx");
    const input = buildExportInputFromWorkbenchFixture(workbenchStateFixture as unknown as WorkbenchFixtureState);
    const { workbook, sourceOriginEntries } = buildValuationTemplateWorkbook(input, templateData);
    const { data } = writeValuationTemplateWorkbook(input, templateData);

    assert.equal(input.caseProfile.companySector, "Basic Materials");
    assert.equal(input.caseProfile.objectBusinessKlu, "07102");
    assert.equal(input.caseProfile.subjectTaxpayerName, "Erick Kurniawan");
    assert.equal(input.resolvedAssumptions.terminalGrowth, "0,005");
    assert.equal(input.snapshot.terminalGrowth, 0);
    assert.equal(input.dlomCalculation.interestBasis, "Mayoritas");
    assert.equal(workbook.Sheets.HOME.B4.v, "Makmur Jaya Sejati Raya");
    assert.equal(workbook.Sheets.HOME.B5.v, "07102 - PERTAMBANGAN BIJIH BESI");
    assert.equal(workbook.Sheets.HOME.B9.v, "Erick Kurniawan");
    assert.equal(workbook.Sheets.HOME.B16.v, 1610000000);
    assert.equal(workbook.Sheets["FIXED ASSET"].B8.v, "Land (Tanah Lahan Sawit + Tanah Lahan Sawit (TA))");
    assert.equal(workbook.Sheets["FIXED ASSET"].C8.v, 4451763925);
    assert.equal(workbook.Sheets["BALANCE SHEET"].E8.v, 717848795);
    assert.equal(workbook.Sheets["INCOME STATEMENT"].E6.v, 16663916100);
    assert.equal(workbook.Sheets.WACC.A11.v, "Indal Aluminium Industry Tbk. (Data Pembanding Bersifat Ideal)");
    assert.equal(workbook.Sheets.WACC.E22.v, input.snapshot.wacc);
    assert.equal(workbook.Sheets["DISCOUNT RATE"].C3.v, 0.0606);
    assert.equal(workbook.Sheets["DISCOUNT RATE"].C4.v, 1);
    assert.equal(workbook.Sheets["DISCOUNT RATE"].C5.v, 0.06122466);
    assert.equal(workbook.Sheets["DISCOUNT RATE"].C6.v, 0);
    assert.equal(workbook.Sheets["DISCOUNT RATE"].C7.v, 0.085);
    assert.equal(workbook.Sheets["DISCOUNT RATE"].H10.v, input.snapshot.wacc);
    assert.equal(workbook.Sheets["DISCOUNT RATE"].C11.v, input.snapshot.wacc);
    assert.equal(workbook.Sheets["DISCOUNT RATE"].C12.v, input.snapshot.terminalGrowth);
    assert.equal(workbook.Sheets.STAT_ASSUMPTIONS.B8.v, 0);
    assert.equal(workbook.Sheets.AAM.E51.v, input.results.aam.equityValue);
    assert.equal(workbook.Sheets.AAM.E52.v, 0);
    assert.equal(workbook.Sheets.AAM.E60.v, input.results.aam.equityValue / 5280000000);
    assert.equal(workbook.Sheets.DLOM.C31.v, "Mayoritas");
    assert.equal(workbook.Sheets["DLOC(PFC)"].B21.v, "Minoritas");
    assert.equal(workbook.Sheets["SIMULASI POTENSI PAJAK"].E12.v, input.taxSimulationResult.primaryRow?.sharePercentage);
    assert.equal(workbook.Sheets["SIMULASI POTENSI PAJAK"].E14.v, 1610000000);
    assert.equal(workbook.Sheets["SIMULASI POTENSI PAJAK"].E15.v, input.taxSimulationResult.primaryRow?.transferValueDifference);
    assertAuditContains(workbook.Sheets.PVB_EXPORT_V2_AUDIT, "HOME", "B9", "mapped", "website-sourced", "default");
    assertAuditContains(workbook.Sheets.PVB_EXPORT_V2_AUDIT, "DLOM", "C31", "mapped", "website-sourced", "default");
    assertAuditContains(workbook.Sheets.PVB_EXPORT_V2_AUDIT, "DISCOUNT RATE", "C3", "mapped", "website-sourced", "default");
    assertAuditContains(workbook.Sheets.PVB_EXPORT_V2_AUDIT, "DISCOUNT RATE", "C6", "mapped", "web-derived", "default");
    assertAuditContains(workbook.Sheets.PVB_EXPORT_V2_AUDIT, "SIMULASI POTENSI PAJAK", "E14", "cached-formula", "web-derived", "default");
    assertAuditContains(workbook.Sheets.PVB_EXPORT_V2_AUDIT, "DLOM", "F34", "template-formula", "template-formula", "blue");
    assertAuditContains(workbook.Sheets.PVB_EXPORT_V2_AUDIT, "SIMULASI POTENSI PAJAK", "C3", "template-formula", "template-formula", "blue");
    assertDeferredContains(workbook.Sheets.PVB_EXPORT_V2_AUDIT, "Projection sheets full row-level rebuild");
    assertDeferredContains(workbook.Sheets.PVB_EXPORT_V2_AUDIT, "Tax regime detail outputs");
    assertDeferredContains(workbook.Sheets.PVB_EXPORT_V2_AUDIT, "Other payable days");
    assert.ok(sourceOriginEntries?.some((entry) => entry.sheet === "STAT_ASSUMPTIONS" && entry.cell === "B6" && entry.sourceOrigin === "web-derived"));
    assert.notEqual(getCellFontRgbFromXlsx(data, "DISCOUNT RATE", "C3"), "FF0000FF");
    assert.notEqual(getCellFontRgbFromXlsx(data, "SIMULASI POTENSI PAJAK", "E14"), "FF0000FF");
    assert.equal(getCellFontRgbFromXlsx(data, "DLOM", "F34"), "FF0000FF");
    assert.equal(getCellFontRgbFromXlsx(data, "SIMULASI POTENSI PAJAK", "C3"), "FF0000FF");
    assert.equal(getCellFontRgbFromXlsx(data, "DISCOUNT RATE", "L6"), "FF0000FF");
    assert.notEqual(getCellFontRgbFromXlsx(data, "HOME", "B9"), "FF0000FF");
    assert.notEqual(getCellFontRgbFromXlsx(data, "STAT_ASSUMPTIONS", "B6"), "FF0000FF");
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

function assertAuditContains(sheet: WorkSheet, sheetName: string, cellAddress: string, status: string, sourceOrigin?: string, fontMark?: string) {
  const rangeText = sheet["!ref"];
  assert.ok(rangeText);
  const range = decodeRange(rangeText);

  for (let row = range.s.r; row <= range.e.r; row += 1) {
    if (
      sheet[encodeCell(row, 0)]?.v === sheetName &&
      sheet[encodeCell(row, 1)]?.v === cellAddress &&
      (!sourceOrigin || sheet[encodeCell(row, 5)]?.v === sourceOrigin) &&
      sheet[encodeCell(row, 6)]?.v === status &&
      (!fontMark || sheet[encodeCell(row, 7)]?.v === fontMark)
    ) {
      return;
    }
  }

  assert.fail(`Audit row not found for ${sheetName}!${cellAddress} with ${status}`);
}

function assertDeferredContains(sheet: WorkSheet, field: string) {
  const rangeText = sheet["!ref"];
  assert.ok(rangeText);
  const range = decodeRange(rangeText);

  for (let row = range.s.r; row <= range.e.r; row += 1) {
    if (
      sheet[encodeCell(row, 0)]?.v === field &&
      sheet[encodeCell(row, 2)]?.v === "deferred/unmapped" &&
      sheet[encodeCell(row, 3)]?.v === "deferred/unmapped"
    ) {
      return;
    }
  }

  assert.fail(`Deferred audit row not found for ${field}`);
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
