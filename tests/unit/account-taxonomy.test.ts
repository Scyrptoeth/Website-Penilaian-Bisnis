import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { mapAccount, normalizeAccountLabel, shouldAutoApplyMapping } from "../../src/lib/valuation/account-taxonomy";
import { mapRow } from "../../src/lib/valuation/case-model";
import { rowFixture } from "./test-utils";

describe("account taxonomy mapping", () => {
  it("maps common Indonesian cash labels with high-confidence auto-apply", () => {
    const mapping = mapAccount("Kas", "balance_sheet");

    assert.equal(mapping.category, "CASH_ON_HAND");
    assert.equal(mapping.confidenceBand, "high");
    assert.equal(mapping.needsReview, false);
    assert.equal(shouldAutoApplyMapping(mapping), true);
  });

  it("normalizes common accounting abbreviations before mapping", () => {
    assert.equal(normalizeAccountLabel("A/R"), "account receivable");

    const mapping = mapAccount("A/R", "balance_sheet");
    assert.equal(mapping.category, "ACCOUNT_RECEIVABLE");
    assert.equal(mapping.statementCompatible, true);
  });

  it("requires review when lexical evidence conflicts with statement context", () => {
    const mapping = mapAccount("Utang usaha", "income_statement");

    assert.equal(mapping.category, "ACCOUNT_PAYABLE");
    assert.equal(mapping.statementCompatible, false);
    assert.equal(mapping.needsReview, true);
    assert.equal(shouldAutoApplyMapping(mapping), false);
  });

  it("maps corporate tax to the income-statement tax row without treating tax payable as an expense", () => {
    const incomeTax = mapAccount("Corporate Tax", "income_statement");
    const taxPayable = mapAccount("Hutang pajak", "balance_sheet");

    assert.equal(incomeTax.category, "CORPORATE_TAX");
    assert.equal(incomeTax.confidenceBand, "high");
    assert.equal(incomeTax.statementCompatible, true);
    assert.equal(shouldAutoApplyMapping(incomeTax), true);
    assert.equal(taxPayable.category, "TAX_PAYABLE");
    assert.equal(taxPayable.statementCompatible, true);
  });

  it("keeps empty labels unmapped", () => {
    const mapping = mapAccount("", "balance_sheet");

    assert.equal(mapping.category, "UNMAPPED");
    assert.equal(mapping.confidence, 0);
    assert.equal(mapping.confidenceBand, "none");
    assert.equal(mapping.needsReview, true);
  });

  it("lets explicit category override beat an otherwise valid suggestion", () => {
    const mapped = mapRow(
      rowFixture({
        id: "cash-as-debt",
        accountName: "Kas",
        category: "BANK_LOAN_SHORT_TERM",
        values: { p1: "100" },
      }),
    );

    assert.equal(mapped.mapping.category, "CASH_ON_HAND");
    assert.equal(mapped.effectiveCategory, "BANK_LOAN_SHORT_TERM");
  });
});
