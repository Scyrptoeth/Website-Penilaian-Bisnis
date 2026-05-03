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
    assert.ok(readiness.dlom.missing.some((item) => item.targetTab === "periods"));
    assert.ok(readiness.noplatFcf.missing.some((item) => item.targetTab === "eemDcfAssumptions"));
    assert.ok(readiness.payablesCashFlow.fulfilled.some((item) => item.targetTab === "periods"));
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
    assert.equal(readiness.dlom.isReady, true);
    assert.equal(readiness.dlocPfc.isReady, true);
    assert.equal(readiness.taxSimulation.isReady, true);
    assert.equal(readiness.ratiosCapital.warnings.length, 0);
  });
});
