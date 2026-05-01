import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildFixedAssetScheduleSummary,
  buildSampleAssumptions,
  buildSamplePeriods,
  buildSampleRows,
  buildSnapshot,
  emptyAssumptions,
  initialPeriods,
  mapRow,
  type AccountRow,
} from "../../src/lib/valuation/case-model";
import { buildWorkbenchReadiness } from "../../src/lib/valuation/readiness";

describe("workbench readiness", () => {
  it("blocks derived valuation tabs with targeted missing input links on a blank case", () => {
    const rows: AccountRow[] = [];
    const mappedRows = rows.map(mapRow);
    const fixedAssetSchedule = buildFixedAssetScheduleSummary(initialPeriods, []);
    const snapshot = buildSnapshot(initialPeriods, initialPeriods[0].id, rows, emptyAssumptions);
    const readiness = buildWorkbenchReadiness({
      periods: initialPeriods,
      rows,
      mappedRows,
      assumptions: emptyAssumptions,
      snapshot,
      fixedAssetSchedule,
    });

    assert.equal(readiness.valuation.isReady, false);
    assert.equal(readiness.payablesCashFlow.isReady, false);
    assert.equal(readiness.noplatFcf.isReady, false);
    assert.ok(readiness.valuation.missing.some((item) => item.targetTab === "balance"));
    assert.ok(readiness.valuation.missing.some((item) => item.targetTab === "income"));
    assert.ok(readiness.noplatFcf.missing.some((item) => item.targetTab === "assumptions"));
    assert.ok(readiness.payablesCashFlow.fulfilled.some((item) => item.targetTab === "periods"));
  });

  it("marks sample workbook-derived data ready for the added analysis sections", () => {
    const periods = buildSamplePeriods();
    const rows = buildSampleRows();
    const mappedRows = rows.map(mapRow);
    const assumptions = buildSampleAssumptions();
    const fixedAssetSchedule = buildFixedAssetScheduleSummary(periods, []);
    const snapshot = buildSnapshot(periods, "p2021", rows, assumptions);
    const readiness = buildWorkbenchReadiness({
      periods,
      rows,
      mappedRows,
      assumptions,
      snapshot,
      fixedAssetSchedule,
    });

    assert.equal(readiness.payablesCashFlow.isReady, true);
    assert.equal(readiness.noplatFcf.isReady, true);
    assert.equal(readiness.ratiosCapital.isReady, true);
    assert.equal(readiness.ratiosCapital.warnings.length, 0);
  });
});
