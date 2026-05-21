import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildInvestedCapitalGrowthRateSuggestion } from "../../src/lib/valuation/terminal-growth-invested-capital";
import type { PeriodAnalysis, SectionAnalysis } from "../../src/lib/valuation/section-analysis";
import type { FinancialStatementSnapshot } from "../../src/lib/valuation/types";
import { assertAlmostEqual } from "./test-utils";

describe("invested capital terminal growth suggestion", () => {
  it("calculates growth rate from read-only fixed asset, current asset, and ROIC inputs", () => {
    const analysis = sectionAnalysisFixture([
      periodAnalysisFixture({
        id: "p2021",
        label: "2021",
        fixedAssetsNet: 288_285_486_180,
        currentAssets: 621_945_086_892,
      }),
      periodAnalysisFixture({
        id: "p2022",
        label: "2022",
        fixedAssetsNet: 273_458_306_815,
        currentAssets: 688_963_549_268,
        previousFixedAssetsNet: 288_285_486_180,
        previousCurrentAssets: 621_945_086_892,
        investedCapitalBeginning: 912_942_610_151,
      }),
      periodAnalysisFixture({
        id: "p2023",
        label: "2023",
        fixedAssetsNet: 258_569_868_041,
        currentAssets: 790_626_824_542,
        previousFixedAssetsNet: 273_458_306_815,
        previousCurrentAssets: 688_963_549_268,
        investedCapitalBeginning: 951_112_823_704,
      }),
    ]);

    const suggestion = buildInvestedCapitalGrowthRateSuggestion(analysis, 0.1146);

    assert.ok(suggestion);
    assert.equal(suggestion.rows.length, 2);
    assertAlmostEqual(suggestion.rows[0].totalNetInvestment, 52_191_283_011, 0.5);
    assertAlmostEqual(suggestion.rows[0].growthRate, 0.05716819702650049, 1e-12);
    assertAlmostEqual(suggestion.rows[1].growthRate, 0.09123506101207356, 1e-12);
    assertAlmostEqual(suggestion.baseGrowth, 0.07420162901928702, 1e-12);
    assert.equal(suggestion.sourceId, "invested-capital-growth-rate");
    assert.match(suggestion.reason, /Total Net Investment/);
  });

  it("caps base growth below WACC when historical average would break terminal value denominator", () => {
    const analysis = sectionAnalysisFixture([
      periodAnalysisFixture({
        id: "p2022",
        label: "2022",
        fixedAssetsNet: 120,
        currentAssets: 130,
      }),
      periodAnalysisFixture({
        id: "p2023",
        label: "2023",
        fixedAssetsNet: 180,
        currentAssets: 190,
        previousFixedAssetsNet: 120,
        previousCurrentAssets: 130,
        investedCapitalBeginning: 300,
      }),
    ]);

    const suggestion = buildInvestedCapitalGrowthRateSuggestion(analysis, 0.1);

    assert.ok(suggestion);
    assert.equal(suggestion.cappedByWacc, true);
    assertAlmostEqual(suggestion.rawAverageGrowth, 0.4);
    assertAlmostEqual(suggestion.baseGrowth, 0.095);
    assert.ok(suggestion.upsideGrowth < 0.1);
  });
});

function sectionAnalysisFixture(periodAnalyses: PeriodAnalysis[]): SectionAnalysis {
  return {
    periods: periodAnalyses.map((item) => item.period),
    periodAnalyses,
    payablesRows: [],
    cashFlowRows: [],
    cashFlowStatementRows: [],
    noplatRows: [],
    fcfRows: [],
    ratioRows: [],
    roicRows: [],
  };
}

function periodAnalysisFixture({
  id,
  label,
  fixedAssetsNet,
  currentAssets,
  previousFixedAssetsNet,
  previousCurrentAssets,
  investedCapitalBeginning = null,
}: {
  id: string;
  label: string;
  fixedAssetsNet: number;
  currentAssets: number;
  previousFixedAssetsNet?: number;
  previousCurrentAssets?: number;
  investedCapitalBeginning?: number | null;
}): PeriodAnalysis {
  const snapshot = snapshotFixture(fixedAssetsNet, currentAssets);
  const previousSnapshot =
    previousFixedAssetsNet === undefined || previousCurrentAssets === undefined
      ? null
      : snapshotFixture(previousFixedAssetsNet, previousCurrentAssets);

  return {
    period: { id, label, valuationDate: "", yearOffset: 0 },
    snapshot,
    previousSnapshot,
    operatingCurrentAssets: currentAssets,
    operatingCurrentLiabilities: 0,
    operatingWorkingCapital: currentAssets,
    changeInOperatingCurrentAssets: 0,
    changeInOperatingCurrentLiabilities: 0,
    depreciationAddback: 0,
    capitalExpenditure: 0,
    normalizedTaxOnEbit: 0,
    normalizedNoplat: 0,
    ebitda: 0,
    workingCapitalCashFlowEffect: 0,
    cashFlowFromOperations: 0,
    freeCashFlow: 0,
    investedCapitalEnd: fixedAssetsNet + currentAssets,
    investedCapitalBeginning,
    roic: null,
    cashMovement: null,
    correctedNetCashFlow: 0,
    cashFlowRollforwardGap: null,
    debtSchedule: {
      shortTermLoanRate: 0,
      shortTermBeginning: 0,
      shortTermAddition: 0,
      shortTermRepayment: 0,
      shortTermEnding: 0,
      shortTermInterestPayable: 0,
      longTermLoanRate: 0,
      longTermBeginning: 0,
      longTermAddition: 0,
      longTermRepayment: 0,
      longTermEnding: 0,
      longTermInterestPayable: 0,
      interestPayable: 0,
      interestBearingDebt: 0,
      totalDebtSchedule: 0,
      usesManualLongTermSchedule: false,
      usesManualInterestPayable: false,
    },
    loanMovement: {
      shortTermBeginning: 0,
      shortTermAddition: 0,
      shortTermRepayment: 0,
      shortTermEnding: 0,
      longTermBeginning: 0,
      longTermAddition: 0,
      longTermRepayment: 0,
      longTermEnding: 0,
    },
  };
}

function snapshotFixture(fixedAssetsNet: number, currentAssets: number): FinancialStatementSnapshot {
  return {
    valuationDate: "",
    taxRate: 0,
    terminalGrowth: 0,
    revenueGrowth: 0,
    wacc: 0,
    requiredReturnOnNta: 0,
    cogsMargin: 0,
    gaMargin: 0,
    depreciationMargin: 0,
    arDays: 0,
    inventoryDays: 0,
    apDays: 0,
    otherPayableDays: 0,
    cashToRevenueRatio: 0,
    taxPayableToTaxExpenseRatio: 0,
    commercialNpatMargin: 0,
    dividendPayoutRatio: 0,
    historicalProjectionYearCount: 0,
    interestIncomeCashYield: 0,
    interestIncomeRevenueMargin: 0,
    interestExpenseDebtRate: 0,
    interestExpenseRevenueMargin: 0,
    nonOperatingIncomeRevenueMargin: 0,
    cashOnHand: 0,
    cashOnBankDeposit: 0,
    accountReceivable: currentAssets,
    employeeReceivable: 0,
    inventory: 0,
    fixedAssetAcquisition: fixedAssetsNet,
    accumulatedDepreciation: 0,
    fixedAssetsNet,
    nonOperatingFixedAssets: 0,
    intangibleAssets: 0,
    excessCash: 0,
    marketableSecurities: 0,
    surplusAssetCash: 0,
    currentAssets,
    nonCurrentAssets: fixedAssetsNet,
    totalAssets: fixedAssetsNet + currentAssets,
    bankLoanShortTerm: 0,
    accountPayable: 0,
    taxPayable: 0,
    otherPayable: 0,
    interestPayable: 0,
    bankLoanLongTerm: 0,
    currentLiabilities: 0,
    nonCurrentLiabilities: 0,
    totalLiabilities: 0,
    paidUpCapital: 0,
    additionalPaidInCapital: 0,
    retainedEarningsSurplus: 0,
    retainedEarningsCurrentProfit: 0,
    bookEquity: 0,
    commercialNpat: 0,
    revenue: 0,
    cogs: 0,
    sellingExpense: 0,
    gaOverheads: 0,
    depreciation: 0,
    ebit: 0,
    corporateTax: 0,
    hasCorporateTaxInput: false,
    interestIncome: 0,
    interestExpense: 0,
    nonOperatingIncome: 0,
  };
}
