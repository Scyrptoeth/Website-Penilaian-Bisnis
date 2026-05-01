import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { calculateWaccAssumption, calculateWaccComparableBetaAssumption } from "../../src/lib/valuation/assumption-calculators";
import { emptyAssumptions } from "../../src/lib/valuation/case-model";
import { assertAlmostEqual } from "./test-utils";

describe("assumption calculators", () => {
  it("derives WACC from comparable beta, market capital structure, and bank loan rates", () => {
    const assumptions = {
      ...emptyAssumptions,
      taxRate: "22%",
      waccRiskFreeRate: "6%",
      waccEquityRiskPremium: "7%",
      waccRatingBasedDefaultSpread: "2%",
      waccSpecificRiskPremium: "0%",
      waccBankPerseroInvestmentLoanRate: "8%",
      waccBankSwastaInvestmentLoanRate: "9%",
      waccBankUmumInvestmentLoanRate: "10%",
      waccDebtMarketValue: "25",
      waccEquityMarketValue: "75",
      waccComparable1Name: "Comparable A",
      waccComparable1BetaLevered: "1,2",
      waccComparable1MarketCap: "100",
      waccComparable1Debt: "20",
      waccComparable2Name: "Comparable B",
      waccComparable2BetaLevered: "0,9",
      waccComparable2MarketCap: "200",
      waccComparable2Debt: "40",
      waccComparable3Name: "Comparable C",
      waccComparable3BetaLevered: "0,8",
      waccComparable3MarketCap: "300",
      waccComparable3Debt: "30",
    };

    const comparableBeta = calculateWaccComparableBetaAssumption(assumptions);
    const calculation = calculateWaccAssumption(assumptions);

    assert.ok(comparableBeta.averageUnleveredBeta);
    assert.ok(comparableBeta.releveredBeta);
    assert.equal(comparableBeta.aggregateMarketCap, 600);
    assert.equal(comparableBeta.aggregateDebt, 90);
    assert.ok(calculation);
    assertAlmostEqual(calculation.debtWeight, 90 / 690, 1e-12);
    assertAlmostEqual(calculation.equityWeight, 600 / 690, 1e-12);
    assertAlmostEqual(calculation.preTaxCostOfDebt, 0.09, 1e-12);
    assertAlmostEqual(calculation.ratingBasedDefaultSpread, 0.02, 1e-12);
    assert.equal(Number.isFinite(calculation.wacc), true);
  });
});
