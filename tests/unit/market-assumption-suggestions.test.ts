import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  averageInvestmentLoanRate,
  getMarketAssumptionSuggestion,
  getSupportedMarketSuggestionYears,
  marketAssumptionSuggestions,
} from "../../src/lib/valuation/market-assumption-suggestions";

describe("market assumption suggestions", () => {
  it("covers the requested valuation years from 2020 through 2025", () => {
    assert.deepEqual(getSupportedMarketSuggestionYears(), [2020, 2021, 2022, 2023, 2024, 2025]);
    assert.equal(marketAssumptionSuggestions.length, 6);
  });

  it("selects annual WACC inputs from valuation date year", () => {
    const suggestion = getMarketAssumptionSuggestion("31/12/2023");

    assert.equal(suggestion?.year, 2023);
    assert.ok((suggestion?.metrics.equityRiskPremium.value ?? 0) > 0);
    assert.ok((suggestion?.metrics.ratingBasedDefaultSpread.value ?? 0) > 0);
    assert.ok((suggestion?.metrics.riskFreeSun.value ?? 0) > 0);
    assert.ok(averageInvestmentLoanRate(suggestion!) > 0);
  });

  it("uses source-backed annual OJK SBDK debt-rate suggestions for 2020 through 2025", () => {
    const suggestion2020 = getMarketAssumptionSuggestion("2020-12-31");
    const suggestion2025 = getMarketAssumptionSuggestion("2025-06-30");

    assert.equal(suggestion2020?.metrics.bankPerseroInvestmentLoan.value, 0.100312);
    assert.equal(suggestion2020?.metrics.bankPemdaInvestmentLoan.value, 0.088967);
    assert.equal(suggestion2020?.metrics.bankSwastaInvestmentLoan.value, 0.096151);
    assert.equal(suggestion2020?.metrics.bankAsingInvestmentLoan.value, 0.071066);
    assert.equal(suggestion2020?.metrics.bankCampuranInvestmentLoan.value, 0.088044);
    assert.equal(suggestion2020?.metrics.bankUmumInvestmentLoan.value, 0.096399);
    assert.equal(suggestion2025?.metrics.bankPerseroInvestmentLoan.value, 0.085767);
    assert.equal(suggestion2025?.metrics.bankPemdaInvestmentLoan.value, 0.08509);
    assert.equal(suggestion2025?.metrics.bankSwastaInvestmentLoan.value, 0.083734);
    assert.equal(suggestion2025?.metrics.bankAsingInvestmentLoan.value, 0.065745);
    assert.equal(suggestion2025?.metrics.bankCampuranInvestmentLoan.value, 0.080354);
    assert.equal(suggestion2025?.metrics.bankUmumInvestmentLoan.value, 0.083859);
    assert.match(suggestion2025?.metrics.bankUmumInvestmentLoan.method ?? "", /Januari-Juni 2025/);
    assert.match(suggestion2025?.metrics.bankUmumInvestmentLoan.source ?? "", /OJK SBDK/);
  });

  it("keeps each suggestion source-backed", () => {
    const suggestion = getMarketAssumptionSuggestion("2025-12-31");

    assert.ok(suggestion);
    Object.values(suggestion.metrics).forEach((metric) => {
      assert.match(metric.sourceUrl, /^https:\/\//);
      assert.notEqual(metric.method.trim(), "");
      assert.notEqual(metric.note.trim(), "");
    });
  });
});
