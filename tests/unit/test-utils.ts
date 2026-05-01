import assert from "node:assert/strict";
import type { AccountRow, BalanceSheetClassification, Period, StatementType } from "../../src/lib/valuation/case-model";
import type { AccountCategory } from "../../src/lib/valuation/types";

export function assertAlmostEqual(actual: number, expected: number, tolerance = 0.0001) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `expected ${actual} to be within ${tolerance} of ${expected}`);
}

export function rowFixture({
  id,
  statement = "balance_sheet",
  accountName,
  category,
  values,
  balanceSheetClassification = "",
}: {
  id: string;
  statement?: StatementType;
  accountName: string;
  category: AccountCategory;
  values: Record<string, string>;
  balanceSheetClassification?: BalanceSheetClassification | "";
}): AccountRow {
  return {
    id,
    statement,
    accountName,
    categoryOverride: category,
    balanceSheetClassification,
    labelOverrides: [],
    values,
  };
}

export const basePeriods: Period[] = [
  { id: "p0", label: "Tahun Y-1", valuationDate: "", yearOffset: -1 },
  { id: "p1", label: "Tahun Y", valuationDate: "2021-12-31", yearOffset: 0 },
];
