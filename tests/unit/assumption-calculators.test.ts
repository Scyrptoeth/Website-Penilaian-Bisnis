import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildRequiredReturnOnNtaSuggestion,
  calculateRequiredReturnOnNtaAssumption,
  calculateWaccAssumption,
  calculateWaccComparableBetaAssumption,
} from "../../src/lib/valuation/assumption-calculators";
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

  it("lets explicit fallback capital weights override smart comparable weights", () => {
    const assumptions = {
      ...emptyAssumptions,
      taxRate: "22%",
      waccRiskFreeRate: "6%",
      waccEquityRiskPremium: "7%",
      waccRatingBasedDefaultSpread: "0%",
      waccCountryRiskPremium: "0%",
      waccSpecificRiskPremium: "0%",
      waccPreTaxCostOfDebt: "9%",
      waccDebtWeight: "25%",
      waccEquityWeight: "75%",
      waccComparable1Name: "Comparable A",
      waccComparable1BetaLevered: "1",
      waccComparable1MarketCap: "100",
      waccComparable1Debt: "100",
    };

    const comparableBeta = calculateWaccComparableBetaAssumption(assumptions);
    const calculation = calculateWaccAssumption(assumptions);

    assert.ok(comparableBeta.capitalWeights);
    assert.ok(calculation);
    assertAlmostEqual(comparableBeta.capitalWeights.debtWeight, 0.25, 1e-12);
    assertAlmostEqual(comparableBeta.capitalWeights.equityWeight, 0.75, 1e-12);
    assertAlmostEqual(calculation.debtWeight, 0.25, 1e-12);
    assertAlmostEqual(calculation.equityWeight, 0.75, 1e-12);
  });

  it("keeps required return on NTA capacity inputs user-evidence driven while deriving Kd and Ke from WACC", () => {
    const balances = {
      accountReceivable: 191_055_111,
      employeeReceivable: 21_000_000,
      inventory: 0,
      fixedAssetsNet: 16_011_357_394,
    };
    const suggestion = buildRequiredReturnOnNtaSuggestion({
      ...balances,
      waccCalculation: {
        afterTaxCostOfDebt: 0.06864,
        costOfEquity: 0.124537,
      },
    });

    assert.equal(suggestion.fields.requiredReturnReceivablesCapacity?.value, null);
    assert.equal(suggestion.fields.requiredReturnReceivablesCapacity?.canAutoApply, false);
    assert.equal(suggestion.fields.requiredReturnInventoryCapacity?.value, null);
    assert.equal(suggestion.fields.requiredReturnFixedAssetCapacity?.value, null);
    assert.equal(suggestion.fields.requiredReturnAdditionalCapacity?.value, null);
    assert.equal(suggestion.fields.requiredReturnAfterTaxDebtCost?.value, 0.06864);
    assert.equal(suggestion.fields.requiredReturnAfterTaxDebtCost?.canAutoApply, true);
    assert.equal(suggestion.fields.requiredReturnEquityCost?.value, 0.124537);
    assert.equal(suggestion.fields.requiredReturnEquityCost?.canAutoApply, true);
    assert.deepEqual(suggestion.waitingFor, []);
    assert.doesNotMatch(JSON.stringify(suggestion), /BORROWING CAP|DISCOUNT RATE|BALANCE SHEET/);

    const calculation = calculateRequiredReturnOnNtaAssumption(
      {
        ...emptyAssumptions,
        requiredReturnReceivablesCapacity: "1",
        requiredReturnInventoryCapacity: "0",
        requiredReturnFixedAssetCapacity: "0.7",
        requiredReturnAdditionalCapacity: "21000000",
        requiredReturnAfterTaxDebtCost: "0.06864",
        requiredReturnEquityCost: "0.124537",
      },
      balances,
    );

    assert.ok(calculation);
    assert.equal(calculation.basis, "capacity_evidence");
    assertAlmostEqual(calculation.tangibleAssetBase, 16_202_412_505, 1e-6);
    assertAlmostEqual(calculation.debtCapacity, 11_420_005_286.8, 1e-6);
    assertAlmostEqual(calculation.requiredReturn, 0.08513891435570048, 1e-12);
  });

  it("falls back to WACC capital structure when NTA capacity evidence is unavailable", () => {
    const calculation = calculateRequiredReturnOnNtaAssumption(
      {
        ...emptyAssumptions,
        taxRate: "22%",
        waccRiskFreeRate: "6%",
        waccBeta: "1",
        waccEquityRiskPremium: "7%",
        waccRatingBasedDefaultSpread: "0%",
        waccCountryRiskPremium: "0%",
        waccSpecificRiskPremium: "0%",
        waccPreTaxCostOfDebt: "9%",
        waccDebtWeight: "25%",
        waccEquityWeight: "75%",
        requiredReturnAfterTaxDebtCost: "7,02%",
        requiredReturnEquityCost: "13%",
      },
      {
        accountReceivable: 100,
        inventory: 0,
        fixedAssetsNet: 900,
      },
    );

    assert.ok(calculation);
    assert.equal(calculation.basis, "wacc_capital_structure");
    assertAlmostEqual(calculation.tangibleAssetBase, 1000, 1e-12);
    assertAlmostEqual(calculation.debtCapacity, 250, 1e-12);
    assertAlmostEqual(calculation.debtWeight, 0.25, 1e-12);
    assertAlmostEqual(calculation.equityWeight, 0.75, 1e-12);
    assertAlmostEqual(calculation.requiredReturn, 0.11505, 1e-12);
  });
});
