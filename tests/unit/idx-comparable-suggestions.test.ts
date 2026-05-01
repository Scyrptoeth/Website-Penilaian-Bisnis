import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  findIdxComparableByLabel,
  formatIdxComparableLabel,
  getIdxComparablesBySector,
  getSuggestedIdxComparables,
} from "../../src/lib/valuation/idx-comparable-suggestions";

describe("idx comparable suggestions", () => {
  it("limits comparable options to the selected sector", () => {
    const basicMaterials = getIdxComparablesBySector("Basic Materials");

    assert.equal(basicMaterials.length > 0, true);
    assert.equal(basicMaterials.every((company) => company.sector === "Basic Materials"), true);
  });

  it("prioritizes ideal comparables before moderate comparables", () => {
    const suggestions = getSuggestedIdxComparables("Basic Materials");

    assert.equal(suggestions.length, 3);
    assert.equal(suggestions[0].quality, "Data Pembanding Bersifat Ideal");
    assert.equal(suggestions.slice(1).every((company) => company.quality === "Data Pembanding Bersifat Moderat"), true);
  });

  it("round-trips displayed names with quality suffixes", () => {
    const [company] = getSuggestedIdxComparables("Basic Materials");
    const label = formatIdxComparableLabel(company);

    assert.match(label, /\(Data Pembanding Bersifat Ideal\)$/);
    assert.deepEqual(findIdxComparableByLabel("Basic Materials", label), company);
  });
});
