import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildFixedAssetScheduleSummary,
  buildSampleAssumptions,
  buildSampleCaseProfile,
  buildCaseProfileDerived,
  buildSamplePeriods,
  buildSampleRows,
  buildSnapshot,
  createFixedAssetScheduleRow,
  emptyAssumptions,
  emptyCaseProfile,
  initialPeriods,
  mapRow,
  type AccountRow,
} from "../../src/lib/valuation/case-model";
import { buildSampleDlocPfcState, calculateDlocPfc, createEmptyDlocPfcState } from "../../src/lib/valuation/dloc-pfc";
import { buildWorkbenchReadiness } from "../../src/lib/valuation/readiness";
import { buildSampleTaxSimulationState, createEmptyTaxSimulationState } from "../../src/lib/valuation/tax-simulation";

describe("workbench readiness", () => {
  it("blocks derived valuation tabs with targeted missing input links on a blank case", () => {
    const rows: AccountRow[] = [];
    const mappedRows = rows.map(mapRow);
    const fixedAssetSchedule = buildFixedAssetScheduleSummary(initialPeriods, []);
    const snapshot = buildSnapshot(initialPeriods, initialPeriods[0].id, rows, emptyAssumptions);
    const dlocPfc = calculateDlocPfc(createEmptyDlocPfcState(), emptyCaseProfile);
    const readiness = buildWorkbenchReadiness({
      periods: initialPeriods,
      rows,
      mappedRows,
      assumptions: emptyAssumptions,
      snapshot,
      fixedAssetSchedule,
      caseProfile: emptyCaseProfile,
      caseProfileDerived: buildCaseProfileDerived(emptyCaseProfile),
      dlocPfc,
      taxSimulation: createEmptyTaxSimulationState(),
    });

    assert.equal(readiness.valuationAam.isReady, false);
    assert.equal(readiness.balance.isReady, false);
    assert.equal(readiness.fixedAssets.isReady, false);
    assert.equal(readiness.valuationEem.isReady, false);
    assert.equal(readiness.valuationDcf.isReady, false);
    assert.equal(readiness.projectedIncome.isReady, false);
    assert.equal(readiness.projectedBalance.isReady, false);
    assert.equal(readiness.projectedFixedAssets.isReady, false);
    assert.equal(readiness.projectedCashFlow.isReady, false);
    assert.equal(readiness.wacc.isReady, false);
    assert.equal(readiness.dlom.isReady, false);
    assert.equal(readiness.dlocPfc.isReady, false);
    assert.equal(readiness.taxSimulation.isReady, true);
    assert.ok(readiness.taxSimulation.warnings.some((item) => item.targetTab === "taxSimulation"));
    assert.equal(readiness.payablesCashFlow.isReady, false);
    assert.equal(readiness.noplatFcf.isReady, false);
    assert.equal(readiness.financialRatio.isReady, false);
    assert.equal(readiness.roic.isReady, false);
    assert.ok(readiness.valuationAam.missing.some((item) => item.targetTab === "balance"));
    assert.ok(readiness.balance.missing.some((item) => item.targetTab === "balance"));
    assert.ok(readiness.fixedAssets.missing.some((item) => item.targetTab === "fixedAssets"));
    assert.ok(readiness.valuationAam.missing.every((item) => item.targetTab !== "wacc" && item.targetTab !== "eemDcfAssumptions"));
    assert.ok(readiness.valuationEem.missing.some((item) => item.targetTab === "income"));
    assert.ok(readiness.valuationDcf.missing.some((item) => item.targetTab === "income"));
    assert.ok(readiness.projectedIncome.missing.some((item) => item.targetTab === "income"));
    assert.ok(readiness.projectedIncome.missing.some((item) => item.targetTab === "eemDcfAssumptions"));
    assert.ok(readiness.projectedBalance.missing.some((item) => item.targetTab === "balance"));
    assert.ok(readiness.projectedFixedAssets.missing.some((item) => item.targetTab === "fixedAssets"));
    assert.ok(readiness.projectedCashFlow.missing.some((item) => item.targetTab === "eemDcfAssumptions"));
    assert.ok(readiness.projectedIncome.missing.every((item) => item.label !== "Akun sudah dikategorikan atau siap ditinjau"));
    assert.ok(readiness.projectedBalance.missing.every((item) => item.label !== "Basis operating working capital tersedia: AR/persediaan/AP/utang lain-lain"));
    assert.ok(readiness.projectedBalance.missing.every((item) => item.label !== "Akun sudah dikategorikan atau siap ditinjau"));
    assert.ok(readiness.projectedFixedAssets.missing.every((item) => item.label !== "Akun sudah dikategorikan atau siap ditinjau"));
    assert.ok(readiness.projectedCashFlow.missing.every((item) => item.label !== "Basis operating working capital tersedia: AR/persediaan/AP/utang lain-lain"));
    assert.ok(readiness.projectedCashFlow.missing.every((item) => item.label !== "Akun sudah dikategorikan atau siap ditinjau"));
    assert.ok(readiness.dlom.missing.some((item) => item.targetTab === "periods"));
    assert.ok(readiness.noplatFcf.missing.some((item) => item.targetTab === "eemDcfAssumptions"));
    assert.ok(readiness.cashFlowStatement.missing.every((item) => item.label !== "Basis operating working capital tersedia: AR/persediaan/AP/utang lain-lain"));
    assert.ok(readiness.cashFlowStatement.missing.every((item) => item.label !== "Akun sudah dikategorikan atau siap ditinjau"));
    assert.ok(readiness.payablesCashFlow.missing.every((item) => item.label !== "Basis operating working capital tersedia: AR/persediaan/AP/utang lain-lain"));
    assert.ok(readiness.payablesCashFlow.missing.every((item) => item.label !== "Akun sudah dikategorikan atau siap ditinjau"));
    assert.ok(readiness.noplatFcf.missing.every((item) => item.label !== "Basis operating working capital tersedia: AR/persediaan/AP/utang lain-lain"));
    assert.ok(readiness.noplatFcf.missing.every((item) => item.label !== "Akun sudah dikategorikan atau siap ditinjau"));
    assert.ok(readiness.payablesCashFlow.fulfilled.some((item) => item.targetTab === "periods"));
    assert.ok(readiness.valuationAam.missing.every((item) => item.targetTab !== "mapping"));
    assert.ok(readiness.valuationEem.missing.every((item) => item.targetTab !== "mapping"));
    assert.ok(readiness.valuationDcf.missing.every((item) => item.targetTab !== "mapping"));
  });

  it("treats an empty fixed asset schedule row as enough to hide the fixed asset input reminder", () => {
    const rows: AccountRow[] = [];
    const mappedRows = rows.map(mapRow);
    const fixedAssetSchedule = buildFixedAssetScheduleSummary(initialPeriods, [createFixedAssetScheduleRow(initialPeriods)]);
    const snapshot = buildSnapshot(initialPeriods, initialPeriods[0].id, rows, emptyAssumptions);
    const dlocPfc = calculateDlocPfc(createEmptyDlocPfcState(), emptyCaseProfile);
    const readiness = buildWorkbenchReadiness({
      periods: initialPeriods,
      rows,
      mappedRows,
      assumptions: emptyAssumptions,
      snapshot,
      fixedAssetSchedule,
      caseProfile: emptyCaseProfile,
      caseProfileDerived: buildCaseProfileDerived(emptyCaseProfile),
      dlocPfc,
      taxSimulation: createEmptyTaxSimulationState(),
    });

    assert.equal(readiness.fixedAssets.isReady, true);
    assert.equal(readiness.fixedAssets.missing.length, 0);
  });

  it("treats an initialized fixed asset schedule as enough for downstream cash-flow reminders", () => {
    const periods = buildSamplePeriods();
    const rows: AccountRow[] = [
      {
        id: "balance-row",
        statement: "balance_sheet",
        accountName: "Neraca manual",
        categoryOverride: "",
        balanceSheetClassification: "",
        labelOverrides: [],
        values: { p2020: "900000", p2021: "1000000" },
      },
      {
        id: "income-row",
        statement: "income_statement",
        accountName: "Laba rugi manual",
        categoryOverride: "",
        balanceSheetClassification: "",
        labelOverrides: [],
        values: { p2020: "200000", p2021: "250000" },
      },
    ];
    const assumptions = { ...emptyAssumptions, taxRate: "22%" };
    const mappedRows = rows.map(mapRow);
    const fixedAssetSchedule = buildFixedAssetScheduleSummary(periods, [createFixedAssetScheduleRow(periods)]);
    const snapshot = buildSnapshot(periods, "p2021", rows, assumptions);
    const dlocPfc = calculateDlocPfc(createEmptyDlocPfcState(), emptyCaseProfile);
    const readiness = buildWorkbenchReadiness({
      periods,
      rows,
      mappedRows,
      assumptions,
      snapshot,
      fixedAssetSchedule,
      caseProfile: emptyCaseProfile,
      caseProfileDerived: buildCaseProfileDerived(emptyCaseProfile),
      dlocPfc,
      taxSimulation: createEmptyTaxSimulationState(),
    });

    assert.equal(readiness.cashFlowStatement.missing.some((item) => item.targetTab === "fixedAssets"), false);
    assert.equal(readiness.noplatFcf.missing.some((item) => item.targetTab === "fixedAssets"), false);
  });

  it("does not block Financial Ratio and ROIC only for account mapping review", () => {
    const periods = buildSamplePeriods();
    const rows: AccountRow[] = [
      {
        id: "balance-row",
        statement: "balance_sheet",
        accountName: "Neraca manual",
        categoryOverride: "",
        balanceSheetClassification: "",
        labelOverrides: [],
        values: { p2020: "900000", p2021: "1000000" },
      },
      {
        id: "income-row",
        statement: "income_statement",
        accountName: "Laba rugi manual",
        categoryOverride: "",
        balanceSheetClassification: "",
        labelOverrides: [],
        values: { p2020: "200000", p2021: "250000" },
      },
    ];
    const mappedRows = rows.map(mapRow);
    const fixedAssetSchedule = buildFixedAssetScheduleSummary(periods, []);
    const snapshot = buildSnapshot(periods, "p2021", rows, emptyAssumptions);
    const dlocPfc = calculateDlocPfc(createEmptyDlocPfcState(), emptyCaseProfile);
    const readiness = buildWorkbenchReadiness({
      periods,
      rows,
      mappedRows,
      assumptions: emptyAssumptions,
      snapshot,
      fixedAssetSchedule,
      caseProfile: emptyCaseProfile,
      caseProfileDerived: buildCaseProfileDerived(emptyCaseProfile),
      dlocPfc,
      taxSimulation: createEmptyTaxSimulationState(),
    });

    assert.equal(readiness.financialRatio.isReady, true);
    assert.equal(readiness.roic.isReady, true);
    assert.equal(readiness.financialRatio.missing.some((item) => item.label === "Akun sudah dikategorikan atau siap ditinjau"), false);
    assert.equal(readiness.roic.missing.some((item) => item.label === "Akun sudah dikategorikan atau siap ditinjau"), false);
  });

  it("marks sample workbook-derived data ready for the added analysis sections", () => {
    const periods = buildSamplePeriods();
    const rows = buildSampleRows();
    const mappedRows = rows.map(mapRow);
    const assumptions = buildSampleAssumptions();
    const caseProfile = buildSampleCaseProfile();
    const caseProfileDerived = buildCaseProfileDerived(caseProfile);
    const dlocPfc = calculateDlocPfc(buildSampleDlocPfcState(), caseProfile);
    const fixedAssetSchedule = buildFixedAssetScheduleSummary(periods, []);
    const snapshot = buildSnapshot(periods, "p2021", rows, assumptions);
    const readiness = buildWorkbenchReadiness({
      periods,
      rows,
      mappedRows,
      assumptions,
      snapshot,
      fixedAssetSchedule,
      caseProfile,
      caseProfileDerived,
      dlocPfc,
      taxSimulation: buildSampleTaxSimulationState(),
    });

    assert.equal(readiness.payablesCashFlow.isReady, true);
    assert.equal(readiness.noplatFcf.isReady, true);
    assert.equal(readiness.financialRatio.isReady, true);
    assert.equal(readiness.roic.isReady, true);
    assert.equal(readiness.valuationAam.isReady, true);
    assert.equal(readiness.fixedAssets.isReady, true);
    assert.equal(readiness.valuationEem.isReady, true);
    assert.equal(readiness.valuationDcf.isReady, true);
    assert.equal(readiness.projectedIncome.isReady, true);
    assert.equal(readiness.projectedBalance.isReady, true);
    assert.equal(readiness.projectedFixedAssets.isReady, true);
    assert.equal(readiness.projectedCashFlow.isReady, true);
    assert.equal(readiness.dlom.isReady, true);
    assert.equal(readiness.dlocPfc.isReady, true);
    assert.equal(readiness.taxSimulation.isReady, true);
    assert.equal(readiness.financialRatio.warnings.length, 0);
    assert.equal(readiness.roic.warnings.length, 0);
  });

  it("flags share-transfer tax simulation when share value per share is missing", () => {
    const periods = buildSamplePeriods();
    const rows = buildSampleRows();
    const mappedRows = rows.map(mapRow);
    const assumptions = buildSampleAssumptions();
    const caseProfile = {
      ...buildSampleCaseProfile(),
      transferType: "Lembar Saham",
      capitalBaseFull: "5.280",
      capitalBaseValued: "1.610",
      shareValuePerShare: "",
    };
    const caseProfileDerived = buildCaseProfileDerived(caseProfile);
    const dlocPfc = calculateDlocPfc(buildSampleDlocPfcState(), caseProfile);
    const fixedAssetSchedule = buildFixedAssetScheduleSummary(periods, []);
    const snapshot = buildSnapshot(periods, "p2021", rows, assumptions);
    const readiness = buildWorkbenchReadiness({
      periods,
      rows,
      mappedRows,
      assumptions,
      snapshot,
      fixedAssetSchedule,
      caseProfile,
      caseProfileDerived,
      dlocPfc,
      taxSimulation: { ...buildSampleTaxSimulationState(), reportedTransferValue: "" },
    });

    assert.equal(readiness.taxSimulation.isReady, false);
    assert.ok(readiness.taxSimulation.missing.some((item) => item.label.includes("Nilai Saham Per Lembar")));
  });

  it("lets projected income stand alone without working-capital or fixed-asset gates", () => {
    const activePeriodId = initialPeriods[0].id;
    const rows: AccountRow[] = [
      {
        id: "income-revenue",
        statement: "income_statement",
        accountName: "Revenue",
        categoryOverride: "REVENUE",
        balanceSheetClassification: "",
        labelOverrides: [],
        values: { [activePeriodId]: "1000000" },
      },
      {
        id: "income-ebit",
        statement: "income_statement",
        accountName: "EBIT",
        categoryOverride: "EBIT",
        balanceSheetClassification: "",
        labelOverrides: [],
        values: { [activePeriodId]: "250000" },
      },
    ];
    const mappedRows = rows.map(mapRow);
    const fixedAssetSchedule = buildFixedAssetScheduleSummary(initialPeriods, []);
    const assumptions = { ...emptyAssumptions, taxRate: "22%" };
    const snapshot = buildSnapshot(initialPeriods, activePeriodId, rows, assumptions);
    const dlocPfc = calculateDlocPfc(createEmptyDlocPfcState(), emptyCaseProfile);
    const readiness = buildWorkbenchReadiness({
      periods: initialPeriods,
      rows,
      mappedRows,
      assumptions,
      snapshot,
      fixedAssetSchedule,
      caseProfile: emptyCaseProfile,
      caseProfileDerived: buildCaseProfileDerived(emptyCaseProfile),
      dlocPfc,
      taxSimulation: createEmptyTaxSimulationState(),
    });

    assert.equal(readiness.projectedIncome.isReady, true);
    assert.equal(readiness.projectedBalance.isReady, false);
    assert.equal(readiness.projectedFixedAssets.isReady, false);
    assert.equal(readiness.projectedCashFlow.isReady, false);
  });
});
