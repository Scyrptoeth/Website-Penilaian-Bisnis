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

  it("validates account label ids from the system taxonomy only", () => {
    assert.equal(isAccountLabelId("fs:current-asset"), true);
    assert.equal(isAccountLabelId("free-form-user-label"), false);
  });
});
