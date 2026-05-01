import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getCategoryLabelProfile, isAccountLabelId, resolveAccountLabels } from "../../src/lib/valuation/account-labels";

describe("account label profiles", () => {
  it("marks interest-bearing debt as bridge-negative financing support", () => {
    const profile = getCategoryLabelProfile("BANK_LOAN_SHORT_TERM");

    assert.equal(profile.treatment, "Debt-like");
    assert.equal(profile.signBehavior, "Debt bridge negative");
    assert.equal(profile.labels.includes("formula:eem"), true);
    assert.equal(profile.labels.includes("formula:dcf"), true);
  });

  it("keeps cash-on-hand labels on balance-sheet formulas without duplicating overrides", () => {
    const labels = resolveAccountLabels("balance_sheet", "CASH_ON_HAND", ["formula:aam", "formula:aam"]);

    assert.equal(labels.includes("source:balance-sheet"), true);
    assert.equal(labels.includes("formula:aam"), true);
    assert.equal(labels.includes("formula:neraca"), true);
    assert.equal(new Set(labels).size, labels.length);
  });

  it("keeps corporate tax as a report bridge instead of a valuation formula driver", () => {
    const profile = getCategoryLabelProfile("CORPORATE_TAX");
    const labels = resolveAccountLabels("income_statement", "CORPORATE_TAX");

    assert.equal(profile.placement, "Laba rugi");
    assert.equal(profile.treatment, "Tax expense");
    assert.equal(profile.signBehavior, "Expense reduces earnings");
    assert.equal(labels.includes("source:income-statement"), true);
    assert.equal(labels.includes("formula:noplat"), false);
    assert.equal(labels.includes("formula:dcf"), false);
  });

  it("validates account label ids from the system taxonomy only", () => {
    assert.equal(isAccountLabelId("fs:current-asset"), true);
    assert.equal(isAccountLabelId("free-form-user-label"), false);
  });
});
