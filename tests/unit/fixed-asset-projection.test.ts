import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildFixedAssetScheduleSummary, type FixedAssetScheduleRow } from "../../src/lib/valuation/case-model";
import {
  buildFixedAssetProjection,
  fixedAssetProjectionClassLabels,
} from "../../src/lib/valuation/fixed-asset-projection";
import type { DcfForecastRow } from "../../src/lib/valuation/types";
import { assertAlmostEqual, basePeriods } from "./test-utils";

describe("fixed asset projection", () => {
  it("rolls forward class-level acquisition, depreciation, and net book value from active schedule", () => {
    const schedule = buildFixedAssetScheduleSummary(basePeriods, [
      fixedAssetRow(fixedAssetProjectionClassLabels[2], [
        ["100", "50", "10", "5"],
        ["", "20", "", "8"],
      ]),
      fixedAssetRow(fixedAssetProjectionClassLabels[3], [
        ["200", "0", "20", "10"],
        ["", "0", "", "12"],
      ]),
    ]);
    const forecast = [
      forecastRow({ year: 2022, capitalExpenditure: 100, depreciation: 80, fixedAssetsBeginning: 305, fixedAssetsEnding: 325 }),
      forecastRow({ year: 2023, capitalExpenditure: 120, depreciation: 90, fixedAssetsBeginning: 325, fixedAssetsEnding: 355 }),
    ];

    const projection = buildFixedAssetProjection(forecast, basePeriods, "p1", schedule);
    const equipment = projection.rows.find((row) => row.assetName === fixedAssetProjectionClassLabels[2]);
    const vehicle = projection.rows.find((row) => row.assetName === fixedAssetProjectionClassLabels[3]);

    assert.equal(projection.hasProjection, true);
    assert.equal(equipment?.amounts[2022].acquisitionBeginning, 170);
    assertAlmostEqual(equipment?.amounts[2022].acquisitionAdditions ?? 0, 40, 1e-9);
    assertAlmostEqual(equipment?.amounts[2022].depreciationAdditions ?? 0, 32, 1e-9);
    assertAlmostEqual(vehicle?.amounts[2022].acquisitionAdditions ?? 0, 60, 1e-9);
    assertAlmostEqual(vehicle?.amounts[2022].depreciationAdditions ?? 0, 48, 1e-9);
    assertAlmostEqual(projection.totals[2022].netValue, 325, 1e-9);
    assertAlmostEqual(projection.totals[2023].acquisitionAdditions, 120, 1e-9);
    assertAlmostEqual(projection.totals[2023].depreciationAdditions, 90, 1e-9);
    assertAlmostEqual(projection.totals[2023].netValue, 355, 1e-9);
  });

  it("keeps projection unavailable when no historical fixed asset schedule exists", () => {
    const schedule = buildFixedAssetScheduleSummary(basePeriods, []);
    const projection = buildFixedAssetProjection([forecastRow({ year: 2022, capitalExpenditure: 100, depreciation: 80 })], basePeriods, "p1", schedule);

    assert.equal(projection.hasProjection, false);
    assert.equal(projection.source, "Perlu input");
    assert.equal(projection.rows.length, fixedAssetProjectionClassLabels.length);
    assert.deepEqual(projection.totals, {});
  });
});

function fixedAssetRow(assetName: string, values: Array<[string, string, string, string]>): FixedAssetScheduleRow {
  return {
    id: `fa-${assetName}`,
    assetName,
    values: {
      p0: fixedAssetValues(values[0]),
      p1: fixedAssetValues(values[1]),
    },
  };
}

function fixedAssetValues([acquisitionBeginning, acquisitionAdditions, depreciationBeginning, depreciationAdditions]: [string, string, string, string]) {
  return {
    acquisitionBeginning,
    acquisitionAdditions,
    depreciationBeginning,
    depreciationAdditions,
  };
}

function forecastRow(patch: Partial<DcfForecastRow> & { year: number }): DcfForecastRow {
  const { year, ...rest } = patch;

  return {
    year,
    revenue: 0,
    cogs: 0,
    grossProfit: 0,
    operatingExpenses: 0,
    depreciation: 0,
    ebit: 0,
    statutoryTaxOnEbit: 0,
    noplat: 0,
    accountReceivable: 0,
    inventory: 0,
    operatingCurrentAssets: 0,
    accountPayable: 0,
    otherPayable: 0,
    operatingCurrentLiabilities: 0,
    operatingNwc: 0,
    changeInNwc: 0,
    fixedAssetsBeginning: 0,
    capitalExpenditure: 0,
    fixedAssetsEnding: 0,
    grossCashFlow: 0,
    grossInvestment: 0,
    freeCashFlow: 0,
    discountFactor: 0,
    presentValue: 0,
    ...rest,
  };
}
