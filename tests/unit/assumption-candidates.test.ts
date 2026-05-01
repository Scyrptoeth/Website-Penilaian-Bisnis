import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildTaxRateCandidates,
  getStatutoryCorporateTaxRateSuggestion,
  requiredReturnOnNtaCandidates,
  terminalGrowthCandidates,
  waccCandidates,
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

  it("exposes workbook-derived driver candidates with audit source cells", () => {
    assert.equal(waccCandidates.find((candidate) => candidate.id === "source-discount-rate")?.value, 0.11463062037189403);
    assert.equal(terminalGrowthCandidates.find((candidate) => candidate.id === "base-zero")?.value, 0);
    assert.equal(requiredReturnOnNtaCandidates[0].sourceCell, "BORROWING CAP!F14 / STAT_ASSUMPTIONS!B10");
  });
});
