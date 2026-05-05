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
    assert.equal(readiness.valuationEemDcf.isReady, false);
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
    assert.ok(readiness.valuationAam.missing.some((item) => item.targetTab === "balance"));
    assert.ok(readiness.valuationAam.missing.every((item) => item.targetTab !== "wacc" && item.targetTab !== "eemDcfAssumptions"));
    assert.ok(readiness.valuationEemDcf.missing.some((item) => item.targetTab === "income"));
    assert.ok(readiness.projectedIncome.missing.some((item) => item.targetTab === "income"));
    assert.ok(readiness.projectedIncome.missing.some((item) => item.targetTab === "eemDcfAssumptions"));
    assert.ok(readiness.projectedBalance.missing.some((item) => item.targetTab === "balance"));
    assert.ok(readiness.projectedCashFlow.missing.some((item) => item.targetTab === "eemDcfAssumptions"));
    assert.ok(readiness.dlom.missing.some((item) => item.targetTab === "periods"));
    assert.ok(readiness.noplatFcf.missing.some((item) => item.targetTab === "eemDcfAssumptions"));
    assert.ok(readiness.payablesCashFlow.fulfilled.some((item) => item.targetTab === "periods"));
    assert.ok(readiness.valuationAam.missing.every((item) => item.targetTab !== "mapping"));
    assert.ok(readiness.valuationEemDcf.missing.every((item) => item.targetTab !== "mapping"));
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
    assert.equal(readiness.ratiosCapital.isReady, true);
    assert.equal(readiness.valuationAam.isReady, true);
    assert.equal(readiness.valuationEemDcf.isReady, true);
    assert.equal(readiness.projectedIncome.isReady, true);
    assert.equal(readiness.projectedBalance.isReady, true);
    assert.equal(readiness.projectedFixedAssets.isReady, true);
    assert.equal(readiness.projectedCashFlow.isReady, true);
    assert.equal(readiness.dlom.isReady, true);
    assert.equal(readiness.dlocPfc.isReady, true);
    assert.equal(readiness.taxSimulation.isReady, true);
    assert.equal(readiness.ratiosCapital.warnings.length, 0);
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
