import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  averageInvestmentLoanRate,
  getMarketAssumptionSuggestion,
  getSupportedMarketSuggestionYears,
  marketAssumptionSuggestions,
} from "../../src/lib/valuation/market-assumption-suggestions";

describe("market assumption suggestions", () => {
  it("covers the requested valuation years from 2018 through 2025", () => {
    assert.deepEqual(getSupportedMarketSuggestionYears(), [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025]);
    assert.equal(marketAssumptionSuggestions.length, 8);
  });

  it("selects annual WACC inputs from valuation date year", () => {
    const suggestion = getMarketAssumptionSuggestion("31/12/2023");

    assert.equal(suggestion?.year, 2023);
    assert.ok((suggestion?.metrics.equityRiskPremium.value ?? 0) > 0);
    assert.ok((suggestion?.metrics.ratingBasedDefaultSpread.value ?? 0) > 0);
    assert.ok((suggestion?.metrics.riskFreeSun.value ?? 0) > 0);
    assert.ok(averageInvestmentLoanRate(suggestion!) > 0);
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
