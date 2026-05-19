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
    const bankLoanSnapshot = {
      ...snapshot,
      bankLoanShortTerm: 1_000_000,
      bankLoanLongTerm: 750_000,
      aamBankLoanShortTerm: 1_000_000,
      aamBankLoanLongTerm: 750_000,
      accountPayable: 2_000_000,
      taxPayable: 500_000,
      otherPayable: 300_000,
      totalLiabilities: 4_550_000,
    };
    const model = buildAamAdjustmentModel(bankLoanSnapshot, {
      "fixed-assets-net": { adjustment: "1.000.000", note: "Independent appraisal uplift" },
      "bank-loan-short-term": { adjustment: "-250.000", note: "Post-cutoff bank settlement evidence" },
    });

    const fixedAssetLine = model.assetLines.find((line) => line.id === "fixed-assets-net");
    const shortBankLoanLine = model.liabilityLines.find((line) => line.id === "bank-loan-short-term");

    assert.equal(fixedAssetLine?.historical, bankLoanSnapshot.fixedAssetsNet);
    assert.equal(fixedAssetLine?.adjustment, 1_000_000);
    assert.equal(fixedAssetLine?.adjusted, bankLoanSnapshot.fixedAssetsNet + 1_000_000);
    assert.equal(shortBankLoanLine?.adjustment, -250_000);
    assert.equal(model.historicalLiabilityTotal, 1_750_000);
    assert.equal(model.liabilityLines.some((line) => line.id === "account-payable"), false);
    assert.equal(model.liabilityLines.some((line) => line.id === "tax-payable"), false);
    assert.equal(model.liabilityLines.some((line) => line.id === "liability-total-bridge"), false);
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
      "bank-loan-long-term": { adjustment: "-250.000", note: "Post-cutoff bank settlement evidence" },
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
