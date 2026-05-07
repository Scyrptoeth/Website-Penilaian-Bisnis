import assert from "node:assert/strict";
import test from "node:test";
import { formatEditableInteger, formatEditableNumber, formatIdr, formatInputNumber, formatRateInputNumber } from "../../src/lib/valuation/format";

test("formats non-rate values without decimal fractions", () => {
  assert.equal(formatInputNumber(1_234.56), "1.235");
  assert.doesNotMatch(formatIdr(1_234.56), /,\d/);
});

test("sanitizes editable non-rate values to integers while preserving rate precision", () => {
  assert.equal(formatEditableInteger("Rp 1.234,56"), "1.234");
  assert.equal(formatEditableInteger("1234.56"), "1.234");
  assert.equal(formatEditableNumber("1234,56"), "1.234,56");
  assert.equal(formatRateInputNumber(0.1125), "0,1125");
});
