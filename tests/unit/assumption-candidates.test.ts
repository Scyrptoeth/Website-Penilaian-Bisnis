import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildTaxRateCandidates,
  getStatutoryCorporateTaxRateSuggestion,
  requiredReturnOnNtaInputReferences,
  terminalGrowthInputReferences,
  waccInputReferences,
} from "../../src/lib/valuation/assumption-candidates";

describe("assumption candidates", () => {
  it("suggests statutory general corporate tax rates by valuation year", () => {
    assert.equal(getStatutoryCorporateTaxRateSuggestion("2019-12-31")?.rate, 0.25);
    assert.equal(getStatutoryCorporateTaxRateSuggestion("31/12/2021")?.rate, 0.22);
    assert.equal(getStatutoryCorporateTaxRateSuggestion("2023-12-31")?.rate, 0.22);
    assert.equal(getStatutoryCorporateTaxRateSuggestion("")?.rate, undefined);
  });

  it("keeps special tax facilities out of the default statutory candidate", () => {
    const [candidate] = buildTaxRateCandidates("2021-12-31");

    assert.equal(candidate.id, "statutory-general");
    assert.equal(candidate.value, 0.22);
    assert.match(candidate.note, /override beralasan/i);
  });

  it("exposes input-first driver references without workbook source cells", () => {
    assert.ok(waccInputReferences.some((reference) => reference.label === "Utang berbunga"));
    assert.ok(terminalGrowthInputReferences.some((reference) => reference.label === "Invested capital"));
    assert.ok(requiredReturnOnNtaInputReferences.some((reference) => reference.label === "Kapasitas pinjaman"));

    const serialized = JSON.stringify({
      waccInputReferences,
      terminalGrowthInputReferences,
      requiredReturnOnNtaInputReferences,
    });

    assert.doesNotMatch(serialized, /STAT_ASSUMPTIONS|BORROWING CAP|GROWTH RATE|DISCOUNT RATE|WACC!/);
  });
});
