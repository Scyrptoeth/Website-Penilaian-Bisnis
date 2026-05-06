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
  it("uses historical roll-forward mode by default and keeps DCF proxy as fallback", () => {
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
    assert.equal(projection.mode, "workbook-formula");
    assert.equal(projection.source, "Roll-forward aset tetap historis");
    assert.equal(equipment?.amounts[2022].acquisitionBeginning, 170);
    assertAlmostEqual(equipment?.amounts[2022].acquisitionAdditions ?? 0, 8, 1e-9);
    assertAlmostEqual(equipment?.amounts[2022].depreciationAdditions ?? 0, 12.8, 1e-9);
    assertAlmostEqual(vehicle?.amounts[2022].acquisitionAdditions ?? 0, 0, 1e-9);
    assertAlmostEqual(vehicle?.amounts[2022].depreciationAdditions ?? 0, 14.4, 1e-9);
    assertAlmostEqual(projection.totals[2022].acquisitionAdditions, 8, 1e-9);
    assertAlmostEqual(projection.totals[2022].depreciationAdditions, 27.2, 1e-9);
    assertAlmostEqual(projection.totals[2022].netValue, 285.8, 1e-9);
    assert.equal(projection.fallback?.mode, "dcf-proxy");
    assertAlmostEqual(projection.fallback?.totals[2022].netValue ?? 0, 325, 1e-9);
    assertAlmostEqual(projection.reconciliation[2022].capitalExpenditureDelta, -92, 1e-9);
  });

  it("can preserve the DCF proxy projection mode explicitly", () => {
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

    const projection = buildFixedAssetProjection(forecast, basePeriods, "p1", schedule, { preferredMode: "dcf-proxy" });
    const equipment = projection.rows.find((row) => row.assetName === fixedAssetProjectionClassLabels[2]);
    const vehicle = projection.rows.find((row) => row.assetName === fixedAssetProjectionClassLabels[3]);

    assert.equal(projection.mode, "dcf-proxy");
    assert.equal(projection.source, "Proksi DCF berbasis jadwal aset tetap");
    assertAlmostEqual(equipment?.amounts[2022].acquisitionAdditions ?? 0, 40, 1e-9);
    assertAlmostEqual(equipment?.amounts[2022].depreciationAdditions ?? 0, 32, 1e-9);
    assertAlmostEqual(vehicle?.amounts[2022].acquisitionAdditions ?? 0, 60, 1e-9);
    assertAlmostEqual(vehicle?.amounts[2022].depreciationAdditions ?? 0, 48, 1e-9);
    assertAlmostEqual(projection.totals[2022].netValue, 325, 1e-9);
    assertAlmostEqual(projection.totals[2023].acquisitionAdditions, 120, 1e-9);
    assertAlmostEqual(projection.totals[2023].depreciationAdditions, 90, 1e-9);
    assertAlmostEqual(projection.totals[2023].netValue, 355, 1e-9);
    assert.equal(projection.fallback?.mode, "workbook-formula");
  });

  it("keeps projection unavailable when no historical fixed asset schedule exists", () => {
    const schedule = buildFixedAssetScheduleSummary(basePeriods, []);
    const projection = buildFixedAssetProjection([forecastRow({ year: 2022, capitalExpenditure: 100, depreciation: 80 })], basePeriods, "p1", schedule);

    assert.equal(projection.hasProjection, false);
    assert.equal(projection.mode, "workbook-formula");
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
    cashTaxPaid: 0,
    noplat: 0,
    projectedNetIncome: 0,
    interestIncome: 0,
    interestExpense: 0,
    otherIncomeCharge: 0,
    nonOperatingIncome: 0,
    cashOnHand: 0,
    cashOnBankDeposit: 0,
    accountReceivable: 0,
    employeeReceivable: 0,
    inventory: 0,
    otherCurrentAssets: 0,
    currentAssets: 0,
    operatingCurrentAssets: 0,
    accountPayable: 0,
    taxPayable: 0,
    otherPayable: 0,
    bankLoanShortTerm: 0,
    currentLiabilities: 0,
    operatingCurrentLiabilities: 0,
    operatingNwc: 0,
    changeInNwc: 0,
    fixedAssetsBeginning: 0,
    fixedAssetGross: 0,
    accumulatedDepreciation: 0,
    capitalExpenditure: 0,
    fixedAssetsEnding: 0,
    otherNonCurrentAssets: 0,
    intangibleAssets: 0,
    nonCurrentAssets: 0,
    totalAssets: 0,
    bankLoanLongTerm: 0,
    otherNonCurrentLiabilities: 0,
    nonCurrentLiabilities: 0,
    paidUpCapital: 0,
    additionalPaidInCapital: 0,
    retainedEarningsSurplus: 0,
    dividendDistribution: 0,
    retainedEarningsEnding: 0,
    shareholdersEquity: 0,
    liabilitiesAndEquity: 0,
    balanceControl: 0,
    cashBeginningBalance: 0,
    cashFlowFromOperations: 0,
    nonOperatingCashFlow: 0,
    cashFlowFromInvestment: 0,
    cashFlowBeforeFinancing: 0,
    equityInjection: 0,
    newLoan: 0,
    interestExpenseCashFlow: 0,
    interestIncomeCashFlow: 0,
    principalRepayment: 0,
    cashFlowFromFinancing: 0,
    netCashFlow: 0,
    cashEndingBalance: 0,
    cashFlowControl: 0,
    grossCashFlow: 0,
    grossInvestment: 0,
    freeCashFlow: 0,
    discountFactor: 0,
    presentValue: 0,
    ...rest,
  };
}
