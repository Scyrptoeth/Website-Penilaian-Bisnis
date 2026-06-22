import assert from "node:assert/strict";
import { test } from "node:test";
import { mapAccount } from "../../src/lib/valuation/account-taxonomy";
import {
  getBalanceSheetPositionGroupKey,
  groupBalanceSheetInputRows,
} from "../../src/lib/valuation/balance-sheet-classification";
import type { MappedRow } from "../../src/lib/valuation/case-model";
import type { AccountCategory } from "../../src/lib/valuation/types";
import { rowFixture } from "./test-utils";

function mappedRow(
  id: string,
  accountName: string,
  effectiveCategory: AccountCategory,
): MappedRow {
  return {
    row: rowFixture({
      id,
      accountName,
      category: effectiveCategory,
      values: { p0: "0", p1: "0" },
    }),
    mapping: mapAccount(accountName, "balance_sheet"),
    effectiveCategory,
  };
}

test("balance sheet input rows are grouped by accounting position in stable order", () => {
  const rows = [
    mappedRow("liability", "Utang usaha", "ACCOUNT_PAYABLE"),
    mappedRow("equity", "Modal disetor", "MODAL_DISETOR"),
    mappedRow("asset", "Persediaan", "INVENTORY"),
  ];

  const groups = groupBalanceSheetInputRows(rows);

  assert.deepEqual(groups.map((group) => group.key), ["asset", "liability", "equity"]);
  assert.deepEqual(groups.map((group) => group.rows.map((item) => item.row.id)), [
    ["asset"],
    ["liability"],
    ["equity"],
  ]);
});

test("manual balance sheet detail controls the displayed top-level group", () => {
  const row = mappedRow("reviewed", "Akun dalam peninjauan", "UNMAPPED");
  row.row.balanceSheetClassification = "non_current_liability";

  assert.equal(getBalanceSheetPositionGroupKey(row), "liability");
});

test("unmapped rows remain visible in a review group", () => {
  const row = mappedRow("unmapped", "", "UNMAPPED");

  const groups = groupBalanceSheetInputRows([row]);

  assert.equal(groups[0]?.key, "unclassified");
  assert.equal(groups[0]?.rows[0]?.row.id, "unmapped");
});
