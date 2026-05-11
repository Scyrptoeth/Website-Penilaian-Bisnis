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

test("keeps appending digits after Indonesian thousands separators in integer inputs", () => {
  let value = "";

  for (const digit of "1234567890") {
    value = formatEditableInteger(`${value}${digit}`);
  }

  assert.equal(value, "1.234.567.890");
  assert.equal(formatEditableInteger("1.2345"), "12.345");
  assert.equal(formatEditableInteger("12.3456"), "123.456");
  assert.equal(formatEditableInteger("123.4567"), "1.234.567");
});

test("accepts pasted integer amounts with US separators", () => {
  assert.equal(formatEditableInteger("1,234,567"), "1.234.567");
  assert.equal(formatEditableInteger("5,280,000,000"), "5.280.000.000");
  assert.equal(formatEditableInteger("1,234,567.89"), "1.234.567");
  assert.equal(formatEditableInteger("-1,610,000,000"), "-1.610.000.000");
  assert.equal(formatEditableInteger("Rp 5,280,000,000"), "5.280.000.000");
});
