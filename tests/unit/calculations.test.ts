import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  aamLiabilityBasis,
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
    assert.equal(aam.equityValue, snapshot.totalAssets - aamLiabilityBasis(snapshot));
  });

  it("uses only balance-sheet bank loan categories as the AAM liability basis", () => {
    const aamSnapshot = {
      ...snapshot,
      bankLoanShortTerm: 700_000,
      bankLoanLongTerm: 1_300_000,
      aamBankLoanShortTerm: 700_000,
      aamBankLoanLongTerm: 500_000,
      accountPayable: 2_000_000,
      taxPayable: 900_000,
      otherPayable: 800_000,
      interestPayable: 300_000,
      totalLiabilities: 9_999_999,
    };
    const aam = calculateAam(aamSnapshot);

    assert.equal(aamLiabilityBasis(aamSnapshot), 1_200_000);
    assert.equal(aam.equityValue, aamSnapshot.totalAssets - 1_200_000);
    assert.equal(aam.traces.find((trace) => trace.label === "Liabilitas historis basis AAM")?.value, 1_200_000);
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
      assertAlmostEqual(row.otherIncomeCharge, row.interestIncome + row.interestExpense, 0.01);
      assertAlmostEqual(row.nonOperatingIncome, row.revenue * snapshot.nonOperatingIncomeRevenueMargin, 0.01);
      assertAlmostEqual(row.accountingProfitBeforeTax, row.ebit + row.otherIncomeCharge + row.nonOperatingIncome, 0.01);
      assertAlmostEqual(row.accountingNetProfitAfterTax, row.accountingProfitBeforeTax - row.accountingTaxOnPbt, 0.01);
      assertAlmostEqual(row.noplatBridgeInterestExpenseAddBack, -row.interestExpense, 0.01);
      assertAlmostEqual(row.noplatBridgeInterestIncomeDeduction, -row.interestIncome, 0.01);
      assertAlmostEqual(row.noplatBridgeNonOperatingIncomeDeduction, -row.nonOperatingIncome, 0.01);
      assertAlmostEqual(row.noplatBridgeOperatingEbit, row.ebit, 0.01);
      assertAlmostEqual(row.noplatBridgeTaxOnEbit, row.statutoryTaxOnEbit, 0.01);
      assertAlmostEqual(row.noplatBridgeNoplat, row.noplat, 0.01);
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
      assertAlmostEqual(row.taxPayableScheduleControl, 0, 0.01);
      assertAlmostEqual(
        row.taxCashPaidImpliedByPayableSchedule,
        row.taxPayableBeginning + row.taxExpenseAccrued - row.taxPayable,
        0.01,
      );
      assertAlmostEqual(row.cashTaxVarianceToSchedule, row.taxCashPaidImpliedByPayableSchedule - row.cashTaxPaid, 0.01);
      assertAlmostEqual(row.debtEndingBalance, row.bankLoanShortTerm + row.bankLoanLongTerm, 0.01);
      assertAlmostEqual(row.debtBalanceSheetMovement, row.debtEndingBalance - row.debtBeginningBalance, 0.01);
      assertAlmostEqual(row.debtDrawdownFromBalanceSheet, Math.max(0, row.debtBalanceSheetMovement), 0.01);
      assertAlmostEqual(row.debtRepaymentFromBalanceSheet, Math.min(0, row.debtBalanceSheetMovement), 0.01);
      assertAlmostEqual(row.cashPolicyGap, row.cashEndingBalance - row.cashPolicyTarget, 0.01);
      assertAlmostEqual(row.cashPolicySurplus, Math.max(0, row.cashPolicyGap), 0.01);
      assertAlmostEqual(row.cashPolicyFundingNeed, Math.max(0, -row.cashPolicyGap), 0.01);
      assertAlmostEqual(row.cashFlowFromOperations, row.grossCashFlow - row.changeInNwc, 0.01);
      assertAlmostEqual(row.nonOperatingCashFlow, row.nonOperatingIncome, 0.01);
      assertAlmostEqual(row.cashFlowFromInvestment, -row.capitalExpenditure, 0.01);
      assertAlmostEqual(row.cashFlowBeforeFinancing, row.cashFlowFromOperations + row.nonOperatingCashFlow + row.cashFlowFromInvestment, 0.01);
      assertAlmostEqual(row.interestExpenseCashFlow, row.interestExpense, 0.01);
      assertAlmostEqual(row.interestIncomeCashFlow, row.interestIncome, 0.01);
      assertAlmostEqual(
        row.cashFlowFromFinancing,
        row.equityInjection + row.newLoan + row.interestExpenseCashFlow + row.interestIncomeCashFlow + row.principalRepayment,
        0.01,
      );
      assertAlmostEqual(
        row.cashFlowFromFinancing,
        row.equityInjection +
          row.debtBalanceSheetMovement +
          row.scheduledDividendDistribution +
          row.interestExpenseCashFlow +
          row.interestIncomeCashFlow +
          row.unallocatedFinancingInflow +
          row.unallocatedFinancingOutflow,
        0.01,
      );
      assertAlmostEqual(row.financingScheduleControl, 0, 0.01);
      assertAlmostEqual(row.netCashFlow, row.cashEndingBalance - row.cashBeginningBalance, 0.01);
      assertAlmostEqual(row.cashFlowControl, 0, 1);
      assertAlmostEqual(row.freeCashFlow, row.grossCashFlow - row.grossInvestment, 0.01);
      assertAlmostEqual(row.freeCashFlow, row.cashFlowFromOperations + row.cashFlowFromInvestment, 0.01);
      assertAlmostEqual(row.presentValue, row.freeCashFlow * row.discountFactor, 0.01);
      assert.ok(Number.isFinite(row.freeCashFlow));
      assert.ok(Number.isFinite(row.presentValue));
      assert.ok(Number.isFinite(row.interestIncome));
      assert.ok(Number.isFinite(row.interestExpense));
      assert.ok(Number.isFinite(row.nonOperatingIncome));
      assert.ok(Number.isFinite(row.unallocatedFinancingCashFlow));
      assert.ok(Number.isFinite(row.cashTaxVarianceToSchedule));
      assert.ok(Number.isFinite(row.cashPolicyGap));
    });
  });

  it("keeps interest and non-operating projection lines presentation-only for DCF value", () => {
    const base = calculateDcf(snapshot);
    const presentationAdjusted = calculateDcf({
      ...snapshot,
      interestIncomeCashYield: snapshot.interestIncomeCashYield + 0.25,
      interestIncomeRevenueMargin: snapshot.interestIncomeRevenueMargin + 0.1,
      interestExpenseDebtRate: 0,
      interestExpenseRevenueMargin: snapshot.interestExpenseRevenueMargin - 0.05,
      nonOperatingIncomeRevenueMargin: 0.03,
    });

    assert.notEqual(presentationAdjusted.forecast[0].interestIncome, base.forecast[0].interestIncome);
    assert.notEqual(presentationAdjusted.forecast[0].interestExpense, base.forecast[0].interestExpense);
    assert.notEqual(presentationAdjusted.forecast[0].nonOperatingIncome, base.forecast[0].nonOperatingIncome);
    assert.notEqual(presentationAdjusted.forecast[0].accountingProfitBeforeTax, base.forecast[0].accountingProfitBeforeTax);
    assert.notEqual(presentationAdjusted.forecast[0].accountingNetProfitAfterTax, base.forecast[0].accountingNetProfitAfterTax);
    assert.notEqual(presentationAdjusted.forecast[0].cashFlowFromFinancing, base.forecast[0].cashFlowFromFinancing);
    assertAlmostEqual(presentationAdjusted.equityValue, base.equityValue, 0.01);

    presentationAdjusted.forecast.forEach((row, index) => {
      assertAlmostEqual(row.noplat, base.forecast[index].noplat, 0.01);
      assertAlmostEqual(row.noplatBridgeOperatingEbit, base.forecast[index].ebit, 0.01);
      assertAlmostEqual(row.noplatBridgeNoplat, base.forecast[index].noplat, 0.01);
      assertAlmostEqual(row.freeCashFlow, base.forecast[index].freeCashFlow, 0.01);
      assertAlmostEqual(row.presentValue, base.forecast[index].presentValue, 0.01);
      assertAlmostEqual(row.nonOperatingCashFlow, row.nonOperatingIncome, 0.01);
      assertAlmostEqual(row.interestExpenseCashFlow, row.interestExpense, 0.01);
      assertAlmostEqual(row.interestIncomeCashFlow, row.interestIncome, 0.01);
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
    assert.equal(allMethods.projectionGovernance.governedEquityValue, allMethods.dcf.equityValue);
    assert.equal(allMethods.projectionGovernance.activeEngine, "balance-reconciled");
    assert.equal(allMethods.projectionGovernance.sensitivityEngine, "historical-derived");
    assert.equal(allMethods.incomeProjectionRelianceGovernance.governedEquityValue, allMethods.dcf.equityValue);
    assert.equal(allMethods.incomeProjectionRelianceGovernance.activeBasis, "current-dcf");
    assert.equal(allMethods.incomeProjectionRelianceGovernance.stressBasis, "accounting-presentation-stress");
    assert.ok(allMethods.incomeProjectionRelianceGovernance.items.some((item) => item.id === "presentation-stress-variance"));
    assertAlmostEqual(allMethods.sensitivities.eemTaxPayableDebtLike.equityValue, allMethods.eem.equityValue - snapshot.taxPayable, 0.01);
  });

  it("keeps the baseline DCF as fallback when historical projection controls are unreasonable", () => {
    const stressedSnapshot = {
      ...snapshot,
      cashToRevenueRatio: 2,
      taxPayableToTaxExpenseRatio: 5,
      dividendPayoutRatio: 1,
      historicalProjectionYearCount: 1,
    };
    const results = calculateAllMethods(stressedSnapshot);

    assert.equal(results.projectionGovernance.decision, "baseline-fallback");
    assert.equal(results.projectionGovernance.level, "critical");
    assert.equal(results.projectionGovernance.governedEquityValue, results.dcf.equityValue);
    assert.notEqual(results.sensitivities.dcfHistoricalDerivedProjection.equityValue, results.dcf.equityValue);
    assert.ok(results.projectionGovernance.items.some((item) => item.level === "critical"));
  });

  it("keeps current DCF as fallback when accounting presentation reliance is unreasonable", () => {
    const stressedSnapshot = {
      ...snapshot,
      interestIncomeCashYield: 0.25,
      interestIncomeRevenueMargin: 0.2,
      interestExpenseRevenueMargin: -0.08,
      nonOperatingIncomeRevenueMargin: 0.12,
    };
    const results = calculateAllMethods(stressedSnapshot);

    assert.equal(results.incomeProjectionRelianceGovernance.decision, "current-dcf-fallback");
    assert.equal(results.incomeProjectionRelianceGovernance.level, "critical");
    assert.equal(results.incomeProjectionRelianceGovernance.governedEquityValue, results.dcf.equityValue);
    assert.notEqual(results.incomeProjectionRelianceGovernance.presentationStressEquityValue, results.dcf.equityValue);
    assert.ok(results.incomeProjectionRelianceGovernance.items.some((item) => item.level === "critical"));
  });

  it("keeps reviewer income projection scenarios explicit and baseline DCF protected", () => {
    const base = calculateDcf(snapshot);
    const firstYear = base.forecast[0].year;
    const scenario = calculateDcf(snapshot, {
      incomeProjectionOverrides: {
        [firstYear]: {
          revenueGrowth: snapshot.revenueGrowth + 0.03,
          grossProfitMargin: 0.45,
          operatingExpenseMargin: 0.12,
          depreciationMargin: 0.03,
        },
      },
      incomeProjectionPresentation: {
        cashYield: 0.04,
        debtRate: 0.09,
        interestIncomeRevenueMargin: 0.01,
        interestExpenseRevenueMargin: -0.02,
        nonOperatingPolicy: "recurring",
      },
    });
    const scenarioFirstYear = scenario.forecast[0];

    assert.notEqual(scenarioFirstYear.revenue, base.forecast[0].revenue);
    assertAlmostEqual(scenarioFirstYear.grossProfit, scenarioFirstYear.revenue * 0.45, 0.01);
    assertAlmostEqual(scenarioFirstYear.operatingExpenses, scenarioFirstYear.revenue * 0.12, 0.01);
    assertAlmostEqual(scenarioFirstYear.depreciation, scenarioFirstYear.revenue * 0.03, 0.01);
    assertAlmostEqual(calculateAllMethods(snapshot).dcf.equityValue, base.equityValue, 0.01);

    const presentationOnlyScenario = calculateDcf(snapshot, {
      incomeProjectionPresentation: {
        cashYield: 0.04,
        debtRate: 0.09,
        interestIncomeRevenueMargin: 0.01,
        interestExpenseRevenueMargin: -0.02,
        nonOperatingPolicy: "recurring",
      },
    });

    assertAlmostEqual(presentationOnlyScenario.equityValue, base.equityValue, 0.01);
    assertAlmostEqual(presentationOnlyScenario.forecast[0].freeCashFlow, base.forecast[0].freeCashFlow, 0.01);
    assert.notEqual(presentationOnlyScenario.forecast[0].interestIncome, base.forecast[0].interestIncome);
  });
});
