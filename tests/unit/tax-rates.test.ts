import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { calculateTaxByRegime, resolveTaxRateRegime } from "../../src/lib/valuation/tax-rates";
import { assertAlmostEqual } from "./test-utils";

describe("tax rate database", () => {
  it("uses pre-HPP individual progressive brackets for tax year 2021", () => {
    const tax = calculateTaxByRegime(600_000_000, "individual", 2021);

    assert.equal(tax.appliedYear, 2021);
    assert.equal(tax.source?.legalBasis.includes("UU 36/2008"), true);
    assert.equal(tax.brackets.length, 4);
    assert.equal(tax.brackets[0].taxableAmount, 50_000_000);
    assert.equal(tax.brackets[3].rate, 0.3);
    assertAlmostEqual(tax.tax, 125_000_000, 0.01);
  });

  it("uses HPP individual progressive brackets for tax year 2022 onward", () => {
    const tax = calculateTaxByRegime(6_000_000_000, "individual", 2022);

    assert.equal(tax.appliedYear, 2022);
    assert.equal(tax.source?.legalBasis.includes("UU 7/2021"), true);
    assert.equal(tax.brackets.length, 5);
    assert.equal(tax.brackets[0].taxableAmount, 60_000_000);
    assert.equal(tax.brackets[4].rate, 0.35);
    assertAlmostEqual(tax.tax, 1_794_000_000, 0.01);
  });

  it("uses the general corporate 22% rate for supported 2020-2025 years", () => {
    const tax2020 = calculateTaxByRegime(1_000_000_000, "corporate", 2020);
    const tax2025 = calculateTaxByRegime(1_000_000_000, "corporate", 2025);

    assert.equal(tax2020.appliedYear, 2020);
    assert.equal(tax2025.appliedYear, 2025);
    assertAlmostEqual(tax2020.tax, 220_000_000, 0.01);
    assertAlmostEqual(tax2025.tax, 220_000_000, 0.01);
  });

  it("rounds PKP down to full thousands and clamps unsupported years to nearest supported year", () => {
    const tax = calculateTaxByRegime(60_000_999, "individual", 2022);
    const past = resolveTaxRateRegime(2019);
    const future = resolveTaxRateRegime(2026);

    assert.equal(tax.taxableIncomeRounded, 60_000_000);
    assert.equal(past.appliedYear, 2020);
    assert.equal(past.isNearestYear, true);
    assert.equal(future.appliedYear, 2025);
    assert.equal(future.isNearestYear, true);
  });
});
