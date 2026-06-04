import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildAamAdjustmentModel } from "../../src/lib/valuation/aam-adjustments";
import { calculateAllMethods } from "../../src/lib/valuation/calculations";
import {
  buildFixedAssetScheduleSummary,
  buildSampleAssumptions,
  buildSampleFixedAssetScheduleRows,
  buildSamplePeriods,
  buildSampleRows,
  buildSnapshot,
} from "../../src/lib/valuation/case-model";
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
    assert.equal(model.equityManualAdjustmentTotal, 0);
    assert.equal(model.equityRevaluationAdjustment, 1_250_000);
    assert.equal(model.equityAdjustmentTotal, 1_250_000);
    assert.equal(model.liabilityEquityAdjustmentTotal, model.assetAdjustmentTotal);
    assert.equal(model.adjustedEquityValue, model.historicalEquityValue + 1_250_000);
    assert.equal(model.adjustedBookEquity, model.bookEquity + 1_250_000);
    assert.equal(model.adjustedLiabilityEquityTotal, model.historicalLiabilityEquityTotal + model.assetAdjustmentTotal);
    assert.equal(model.adjustedBalanceGap, model.historicalBalanceGap);
    assert.equal(model.missingNoteCount, 0);
  });

  it("details fixed assets net by active-year fixed asset schedule rows for granular AAM adjustments", () => {
    const fixedAssetScheduleRows = buildSampleFixedAssetScheduleRows();
    const fixedAssetSchedule = buildFixedAssetScheduleSummary(periods, fixedAssetScheduleRows);
    const scheduleSnapshot = buildSnapshot(
      periods,
      "p2021",
      buildSampleRows().filter((row) => row.id !== "sample-fixed-net"),
      buildSampleAssumptions(),
      fixedAssetScheduleRows,
    );
    const officeInventoryLineId = "fixed-asset-schedule:sample-fa-office-inventory";
    const model = buildAamAdjustmentModel(
      scheduleSnapshot,
      {
        [officeInventoryLineId]: { adjustment: "500.000", note: "Independent appraisal for office inventory" },
      },
      { fixedAssetSchedule, activePeriodId: "p2021" },
    );

    const fixedAssetLines = model.assetLines.filter((line) => line.id.startsWith("fixed-asset-schedule:"));
    const officeInventoryLine = fixedAssetLines.find((line) => line.id === officeInventoryLineId);

    assert.equal(fixedAssetLines.length, fixedAssetScheduleRows.length);
    assert.equal(model.assetLines.some((line) => line.id === "fixed-assets-net"), false);
    assert.equal(
      fixedAssetLines.reduce((total, line) => total + line.historical, 0),
      fixedAssetSchedule.totals.p2021.netValue,
    );
    assert.equal(scheduleSnapshot.fixedAssetsNet, fixedAssetSchedule.totals.p2021.netValue);
    assert.equal(officeInventoryLine?.historical, fixedAssetSchedule.rows[0].amounts.p2021.netValue);
    assert.equal(officeInventoryLine?.adjustment, 500_000);
    assert.equal(model.assetAdjustmentTotal, 500_000);
  });

  it("builds read-only Changes on Asset Revaluation from asset, liability, and equity adjustment signs", () => {
    const model = buildAamAdjustmentModel(snapshot, {
      "fixed-assets-net": { adjustment: "1.000.000", note: "Independent appraisal uplift" },
      "account-payable": { adjustment: "250.000", note: "Liability fair value uplift" },
      "paid-up-capital": { adjustment: "-100.000", note: "Capital correction" },
    });
    const revaluationLine = model.equityLines.find((line) => line.id === "changes-on-asset-revaluation");

    assert.equal(model.assetAdjustmentTotal, 1_000_000);
    assert.equal(model.liabilityAdjustmentTotal, 250_000);
    assert.equal(model.equityManualAdjustmentTotal, -100_000);
    assert.equal(model.equityRevaluationAdjustment, 850_000);
    assert.equal(revaluationLine?.label, "Changes on Asset Revaluation");
    assert.equal(revaluationLine?.isReadOnly, true);
    assert.equal(revaluationLine?.adjustment, 850_000);
    assert.equal(model.equityAdjustmentTotal, 750_000);
    assert.equal(model.liabilityEquityAdjustmentTotal, 1_000_000);
    assert.equal(model.adjustedBookEquity, model.bookEquity + 750_000);
    assert.equal(model.adjustedBalanceGap, model.historicalBalanceGap);
  });

  it("flags non-zero adjustments without audit notes", () => {
    const model = buildAamAdjustmentModel(snapshot, {
      inventory: { adjustment: "-100.000", note: "" },
      "retained-earnings-current-profit": { adjustment: "25.000", note: "" },
    });

    assert.equal(model.missingNoteCount, 2);
    assert.equal(model.assetLines.find((line) => line.id === "inventory")?.requiresNote, true);
    assert.equal(model.equityLines.find((line) => line.id === "retained-earnings-current-profit")?.requiresNote, true);
    assert.equal(model.equityLines.find((line) => line.id === "changes-on-asset-revaluation")?.requiresNote, false);
  });

  it("lets EEM consume AAM adjusted asset and liability bases while DCF remains unchanged", () => {
    const baseline = calculateAllMethods(snapshot);
    const model = buildAamAdjustmentModel(snapshot, {
      "fixed-assets-net": { adjustment: "1.000.000", note: "Independent appraisal uplift" },
      "account-payable": { adjustment: "-250.000", note: "Post-cutoff settlement evidence" },
    });
    const adjusted = calculateAllMethods(snapshot, {
      aam: {
        assetAdjustment: model.assetAdjustmentTotal,
        liabilityAdjustment: model.liabilityAdjustmentTotal,
        equityManualAdjustment: model.equityManualAdjustmentTotal,
        equityRevaluationAdjustment: model.equityRevaluationAdjustment,
        equityAdjustment: model.equityAdjustmentTotal,
        adjustedBookEquityGap: model.adjustedBookEquityGap,
        missingAdjustmentNotes: model.missingNoteCount,
      },
      eem: {
        adjustedAssetsExcludingCash:
          model.adjustedAssetTotal -
          (model.assetLines.find((line) => line.id === "cash-on-hand")?.adjusted ?? 0) -
          (model.assetLines.find((line) => line.id === "cash-on-bank-deposit")?.adjusted ?? 0),
        adjustedLiabilitiesExcludingDebt:
          model.adjustedLiabilityTotal -
          (model.liabilityLines.find((line) => line.id === "bank-loan-short-term")?.adjusted ?? 0) -
          (model.liabilityLines.find((line) => line.id === "bank-loan-long-term")?.adjusted ?? 0),
        capitalizationRate: snapshot.wacc,
      },
    });

    assertAlmostEqual(adjusted.aam.equityValue, baseline.aam.equityValue + 1_250_000, 0.01);
    assert.notEqual(adjusted.eem.equityValue, baseline.eem.equityValue);
    assertAlmostEqual(adjusted.dcf.equityValue, baseline.dcf.equityValue, 0.01);
  });
});
