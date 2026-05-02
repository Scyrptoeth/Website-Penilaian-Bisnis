import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildAamAdjustmentModel } from "../../src/lib/valuation/aam-adjustments";
import { calculateAllMethods } from "../../src/lib/valuation/calculations";
import { buildSampleAssumptions, buildSamplePeriods, buildSampleRows, buildSnapshot } from "../../src/lib/valuation/case-model";
import { assertAlmostEqual } from "./test-utils";

const periods = buildSamplePeriods();
const snapshot = buildSnapshot(periods, "p2021", buildSampleRows(), buildSampleAssumptions());

describe("AAM adjustments", () => {
  it("builds historis, penyesuaian, and disesuaikan rows from the active balance sheet snapshot", () => {
    const model = buildAamAdjustmentModel(snapshot, {
      "fixed-assets-net": { adjustment: "1.000.000", note: "Independent appraisal uplift" },
      "account-payable": { adjustment: "-250.000", note: "Post-cutoff settlement evidence" },
    });

    const fixedAssetLine = model.assetLines.find((line) => line.id === "fixed-assets-net");
    const payableLine = model.liabilityLines.find((line) => line.id === "account-payable");

    assert.equal(fixedAssetLine?.historical, snapshot.fixedAssetsNet);
    assert.equal(fixedAssetLine?.adjustment, 1_000_000);
    assert.equal(fixedAssetLine?.adjusted, snapshot.fixedAssetsNet + 1_000_000);
    assert.equal(payableLine?.adjustment, -250_000);
    assert.equal(model.assetAdjustmentTotal, 1_000_000);
    assert.equal(model.liabilityAdjustmentTotal, -250_000);
    assert.equal(model.adjustedEquityValue, model.historicalEquityValue + 1_250_000);
    assert.equal(model.missingNoteCount, 0);
  });

  it("flags non-zero adjustments without audit notes", () => {
    const model = buildAamAdjustmentModel(snapshot, {
      inventory: { adjustment: "-100.000", note: "" },
    });

    assert.equal(model.missingNoteCount, 1);
    assert.equal(model.assetLines.find((line) => line.id === "inventory")?.requiresNote, true);
  });

  it("keeps AAM adjustments scoped to AAM and leaves EEM/DCF unchanged", () => {
    const baseline = calculateAllMethods(snapshot);
    const model = buildAamAdjustmentModel(snapshot, {
      "fixed-assets-net": { adjustment: "1.000.000", note: "Independent appraisal uplift" },
      "account-payable": { adjustment: "-250.000", note: "Post-cutoff settlement evidence" },
    });
    const adjusted = calculateAllMethods(snapshot, {
      aam: {
        assetAdjustment: model.assetAdjustmentTotal,
        liabilityAdjustment: model.liabilityAdjustmentTotal,
        missingAdjustmentNotes: model.missingNoteCount,
      },
    });

    assertAlmostEqual(adjusted.aam.equityValue, baseline.aam.equityValue + 1_250_000, 0.01);
    assertAlmostEqual(adjusted.eem.equityValue, baseline.eem.equityValue, 0.01);
    assertAlmostEqual(adjusted.dcf.equityValue, baseline.dcf.equityValue, 0.01);
  });
});
