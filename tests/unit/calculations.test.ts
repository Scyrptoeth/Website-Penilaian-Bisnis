import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  calculateAam,
  calculateAllMethods,
  calculateDcf,
  calculateEem,
  buildDcfForecast,
  interestBearingDebt,
  nonOperatingAssets,
  normalizedNoplat,
  operatingWorkingCapital,
} from "../../src/lib/valuation/calculations";
import { buildSampleAssumptions, buildSamplePeriods, buildSampleRows, buildSnapshot } from "../../src/lib/valuation/case-model";
import { assertAlmostEqual } from "./test-utils";

const periods = buildSamplePeriods();
const rows = buildSampleRows();
const assumptions = buildSampleAssumptions();
const snapshot = buildSnapshot(periods, "p2021", rows, assumptions);

describe("valuation calculations", () => {
  it("calculates AAM from adjusted assets less liabilities", () => {
    const aam = calculateAam(snapshot);

    assert.equal(aam.method, "AAM");
    assert.equal(aam.equityValue, snapshot.totalAssets - snapshot.totalLiabilities);
  });

  it("calculates EEM from NTA, required return, and non-operating bridge", () => {
    const eem = calculateEem(snapshot);
    const nta = snapshot.fixedAssetsNet + operatingWorkingCapital(snapshot);
    const excessEarnings = normalizedNoplat(snapshot) - nta * snapshot.requiredReturnOnNta;
    const expected = nta + excessEarnings / (snapshot.wacc - snapshot.terminalGrowth) + nonOperatingAssets(snapshot) - interestBearingDebt(snapshot);

    assert.equal(eem.method, "EEM");
    assertAlmostEqual(eem.equityValue, expected, 0.01);
  });

  it("builds a deterministic five-year DCF forecast from valuation year", () => {
    const forecast = buildDcfForecast(snapshot);

    assert.equal(forecast.length, 5);
    forecast.forEach((row, index) => {
      assert.equal(row.year, 2022 + index);
      assertAlmostEqual(row.discountFactor, 1 / Math.pow(1 + snapshot.wacc, index + 1), 1e-12);
      assertAlmostEqual(row.grossProfit, row.revenue - row.cogs, 0.01);
      assertAlmostEqual(row.ebit, row.grossProfit - row.operatingExpenses - row.depreciation, 0.01);
      assertAlmostEqual(row.noplat, row.ebit - row.statutoryTaxOnEbit, 0.01);
      assertAlmostEqual(row.cashTaxPaid, row.statutoryTaxOnEbit, 0.01);
      assertAlmostEqual(row.projectedNetIncome, row.noplat, 0.01);
      assertAlmostEqual(row.dividendDistribution, 0, 0.01);
      assertAlmostEqual(row.operatingNwc, row.operatingCurrentAssets - row.operatingCurrentLiabilities, 0.01);
      assertAlmostEqual(row.currentAssets, row.cashOnHand + row.cashOnBankDeposit + row.accountReceivable + row.employeeReceivable + row.inventory + row.otherCurrentAssets, 0.01);
      assertAlmostEqual(row.fixedAssetsEnding, row.fixedAssetGross - row.accumulatedDepreciation, 0.01);
      assertAlmostEqual(row.totalAssets, row.currentAssets + row.nonCurrentAssets, 0.01);
      assertAlmostEqual(row.currentLiabilities, row.bankLoanShortTerm + row.accountPayable + row.taxPayable + row.otherPayable, 0.01);
      assertAlmostEqual(row.shareholdersEquity, row.paidUpCapital + row.additionalPaidInCapital + row.retainedEarningsEnding, 0.01);
      assertAlmostEqual(row.liabilitiesAndEquity, row.currentLiabilities + row.nonCurrentLiabilities + row.shareholdersEquity, 0.01);
      assertAlmostEqual(row.balanceControl, 0, 1);
      assertAlmostEqual(row.cashEndingBalance, row.cashOnHand + row.cashOnBankDeposit, 0.01);
      assertAlmostEqual(row.cashFlowFromOperations, row.grossCashFlow - row.changeInNwc, 0.01);
      assertAlmostEqual(row.cashFlowFromInvestment, -row.capitalExpenditure, 0.01);
      assertAlmostEqual(row.cashFlowBeforeFinancing, row.cashFlowFromOperations + row.nonOperatingCashFlow + row.cashFlowFromInvestment, 0.01);
      assertAlmostEqual(row.netCashFlow, row.cashEndingBalance - row.cashBeginningBalance, 0.01);
      assertAlmostEqual(row.cashFlowControl, 0, 1);
      assertAlmostEqual(row.freeCashFlow, row.grossCashFlow - row.grossInvestment, 0.01);
      assertAlmostEqual(row.freeCashFlow, row.cashFlowBeforeFinancing, 0.01);
      assertAlmostEqual(row.presentValue, row.freeCashFlow * row.discountFactor, 0.01);
      assert.ok(Number.isFinite(row.freeCashFlow));
      assert.ok(Number.isFinite(row.presentValue));
    });
  });

  it("keeps forecast operating performance stable when working-capital movement is disabled", () => {
    const base = calculateDcf(snapshot);
    const noIncrementalWorkingCapital = calculateDcf(snapshot, { includeWorkingCapitalChange: false });

    noIncrementalWorkingCapital.forecast.forEach((row, index) => {
      assert.equal(row.changeInNwc, 0);
      assertAlmostEqual(row.revenue, base.forecast[index].revenue, 0.01);
      assertAlmostEqual(row.ebit, base.forecast[index].ebit, 0.01);
      assertAlmostEqual(row.noplat, base.forecast[index].noplat, 0.01);
      assertAlmostEqual(row.discountFactor, base.forecast[index].discountFactor, 1e-12);
    });
  });

  it("uses fixed asset projection inputs as DCF drivers when provided", () => {
    const base = calculateDcf(snapshot);
    const fixedAssetProjection = Object.fromEntries(
      base.forecast.map((row, index) => [
        row.year,
        {
          depreciation: row.depreciation * 0.5,
          capitalExpenditure: row.capitalExpenditure * 0.25,
          fixedAssetsEnding: snapshot.fixedAssetsNet - (index + 1) * 100_000_000,
        },
      ]),
    );
    const projected = calculateDcf(snapshot, {
      fixedAssetProjection,
      fixedAssetProjectionSource: "Roll-forward aset tetap historis",
    });

    assertAlmostEqual(projected.forecast[0].depreciation, base.forecast[0].depreciation * 0.5, 0.01);
    assertAlmostEqual(projected.forecast[0].capitalExpenditure, base.forecast[0].capitalExpenditure * 0.25, 0.01);
    assertAlmostEqual(projected.forecast[0].fixedAssetsEnding, snapshot.fixedAssetsNet - 100_000_000, 0.01);
    assert.notEqual(projected.equityValue, base.equityValue);
    assert.equal(projected.traces[0].note.includes("Roll-forward aset tetap historis"), true);
  });

  it("keeps the historical-derived projection as a separate DCF sensitivity", () => {
    const base = calculateDcf(snapshot);
    const historicalDerived = calculateDcf(snapshot, { projectionEngine: "historical-derived" });

    assert.notEqual(historicalDerived.equityValue, base.equityValue);
    historicalDerived.forecast.forEach((row) => {
      assertAlmostEqual(row.cashEndingBalance, row.revenue * snapshot.cashToRevenueRatio, 0.01);
      assertAlmostEqual(row.balanceControl, 0, 1);
      assertAlmostEqual(row.cashFlowControl, 0, 1);
      assert.ok(row.cashTaxPaid >= 0);
      assert.ok(row.projectedNetIncome >= 0);
    });
  });

  it("keeps DCF and EEM sensitivities explicit and formula-derived", () => {
    const baseDcf = calculateDcf(snapshot);
    const taxPayableDebtLikeDcf = calculateDcf(snapshot, { debtLikeTaxPayable: true });
    const allMethods = calculateAllMethods(snapshot);

    assertAlmostEqual(taxPayableDebtLikeDcf.equityValue, baseDcf.equityValue - snapshot.taxPayable, 0.01);
    assert.ok(allMethods.sensitivities.dcfTerminalDownside);
    assert.ok(allMethods.sensitivities.dcfTerminalUpside);
    assert.ok(allMethods.sensitivities.dcfNoIncrementalWorkingCapital);
    assert.ok(allMethods.sensitivities.dcfTaxPayableDebtLike);
    assert.ok(allMethods.sensitivities.dcfHistoricalDerivedProjection);
    assert.ok(allMethods.sensitivities.eemTaxPayableDebtLike);
    assertAlmostEqual(allMethods.sensitivities.eemTaxPayableDebtLike.equityValue, allMethods.eem.equityValue - snapshot.taxPayable, 0.01);
  });
});
