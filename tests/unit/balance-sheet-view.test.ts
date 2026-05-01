import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { calculateAam } from "../../src/lib/valuation/calculations";
import {
  buildFixedAssetScheduleSummary,
  buildSnapshot,
  emptyAssumptions,
  mapRow,
  type FixedAssetScheduleRow,
} from "../../src/lib/valuation/case-model";
import {
  getBalanceSheetClassificationOptions,
  getEffectiveBalanceSheetClassification,
  inferBalanceSheetClassification,
} from "../../src/lib/valuation/balance-sheet-classification";
import { buildBalanceSheetView, groupBalanceSheetLines } from "../../src/lib/valuation/balance-sheet-view";
import { buildValidationChecks } from "../../src/lib/valuation/validation-checks";
import { basePeriods, rowFixture } from "./test-utils";

describe("balance sheet classification and view", () => {
  it("infers structured balance-sheet classifications from formula categories", () => {
    assert.equal(inferBalanceSheetClassification("TOTAL_ASSETS"), "asset_total");
    assert.equal(inferBalanceSheetClassification("FIXED_ASSET"), "non_current_asset");
    assert.equal(inferBalanceSheetClassification("ACCUMULATED_DEPRECIATION"), "non_current_asset");
    assert.equal(inferBalanceSheetClassification("ACCOUNT_PAYABLE"), "current_liability");
    assert.equal(inferBalanceSheetClassification("BANK_LOAN_LONG_TERM"), "non_current_liability");
    assert.equal(inferBalanceSheetClassification("MODAL_DISETOR"), "equity");

    assert.deepEqual(
      getBalanceSheetClassificationOptions("REVENUE").map((option) => option.value),
      ["current_asset", "non_current_asset", "current_liability", "non_current_liability"],
    );
  });

  it("rejects invalid display overrides and falls back to formula category inference", () => {
    const mapped = mapRow(
      rowFixture({
        id: "total-assets",
        accountName: "Total aset",
        category: "TOTAL_ASSETS",
        balanceSheetClassification: "current_asset",
        values: { p1: "1.000" },
      }),
    );

    assert.equal(getEffectiveBalanceSheetClassification(mapped), "asset_total");
  });

  it("keeps balanceSheetClassification display-only for valuation formulas", () => {
    const currentAssetRow = rowFixture({
      id: "cash",
      accountName: "Kas",
      category: "CASH_ON_HAND",
      balanceSheetClassification: "current_asset",
      values: { p0: "0", p1: "1.000" },
    });
    const nonCurrentDisplayRow = { ...currentAssetRow, balanceSheetClassification: "non_current_asset" as const };
    const currentSnapshot = buildSnapshot(basePeriods, "p1", [currentAssetRow], emptyAssumptions);
    const nonCurrentSnapshot = buildSnapshot(basePeriods, "p1", [nonCurrentDisplayRow], emptyAssumptions);
    const view = buildBalanceSheetView(basePeriods, [mapRow(nonCurrentDisplayRow)], buildFixedAssetScheduleSummary(basePeriods, []));
    const grouped = groupBalanceSheetLines(view.sections[0].lines);

    assert.equal(currentSnapshot.totalAssets, nonCurrentSnapshot.totalAssets);
    assert.equal(calculateAam(currentSnapshot).equityValue, calculateAam(nonCurrentSnapshot).equityValue);
    assert.equal(view.totalAssets.p1, 1_000);
    assert.equal(grouped[0].key, "non_current_asset");
  });

  it("shows fixed asset detail rows without double-counting Beginning and Accumulated Depreciations", () => {
    const scheduleRow: FixedAssetScheduleRow = {
      id: "fa1",
      assetName: "Factory equipment",
      values: {
        p0: {
          acquisitionBeginning: "1.000",
          acquisitionAdditions: "0",
          depreciationBeginning: "100",
          depreciationAdditions: "0",
        },
        p1: {
          acquisitionBeginning: "",
          acquisitionAdditions: "250",
          depreciationBeginning: "",
          depreciationAdditions: "150",
        },
      },
    };
    const schedule = buildFixedAssetScheduleSummary(basePeriods, [scheduleRow]);
    const cash = rowFixture({ id: "cash", accountName: "Kas", category: "CASH_ON_HAND", values: { p0: "0", p1: "500" } });
    const view = buildBalanceSheetView(basePeriods, [mapRow(cash)], schedule);
    const assetLines = view.sections[0].lines;

    assert.equal(assetLines.some((line) => line.label === "Beginning" && line.affectsTotal === false), true);
    assert.equal(assetLines.some((line) => line.label === "Accumulated Depreciations" && line.affectsTotal === false), true);
    assert.equal(assetLines.some((line) => line.label === "Fixed Assets, Net" && line.affectsTotal !== false), true);
    assert.equal(view.totalAssets.p1, 1_500);
  });

  it("flags manual fixed asset net rows when a structured schedule is also active", () => {
    const scheduleRow: FixedAssetScheduleRow = {
      id: "fa1",
      assetName: "Factory equipment",
      values: {
        p0: {
          acquisitionBeginning: "0",
          acquisitionAdditions: "0",
          depreciationBeginning: "0",
          depreciationAdditions: "0",
        },
        p1: {
          acquisitionBeginning: "1.000",
          acquisitionAdditions: "0",
          depreciationBeginning: "0",
          depreciationAdditions: "0",
        },
      },
    };
    const fixedAssetNet = rowFixture({
      id: "manual-fixed-net",
      accountName: "Nilai buku aset tetap",
      category: "FIXED_ASSET",
      values: { p0: "0", p1: "1.000" },
    });
    const schedule = buildFixedAssetScheduleSummary(basePeriods, [scheduleRow]);
    const mappedRows = [mapRow(fixedAssetNet)];
    const snapshot = buildSnapshot(basePeriods, "p1", [fixedAssetNet], { ...emptyAssumptions, taxRate: "22%", wacc: "10%" }, [scheduleRow]);
    const checks = buildValidationChecks([fixedAssetNet], mappedRows, { ...emptyAssumptions, taxRate: "22%", wacc: "10%" }, snapshot, 0, schedule);

    assert.equal(checks.find((check) => check.label === "Tidak double count fixed asset")?.ok, false);
  });
});
