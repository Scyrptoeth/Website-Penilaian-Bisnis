import assert from "node:assert/strict";
import { test } from "node:test";
import {
  applyAccountRowOrder,
  moveAccountRowByOffset,
  moveAccountRowToTarget,
} from "../../src/lib/valuation/balance-sheet-row-order";
import { rowFixture } from "./test-utils";

test("reorders only the selected balance sheet rows and preserves unrelated slots", () => {
  const rows = [
    rowFixture({ id: "asset-a", accountName: "Kas", category: "CASH_ON_HAND", values: {} }),
    rowFixture({ id: "income", accountName: "Pendapatan", category: "REVENUE", statement: "income_statement", values: {} }),
    rowFixture({ id: "asset-b", accountName: "Piutang", category: "ACCOUNT_RECEIVABLE", values: {} }),
    rowFixture({ id: "liability", accountName: "Utang usaha", category: "ACCOUNT_PAYABLE", values: {} }),
  ];

  const reordered = applyAccountRowOrder(rows, ["asset-b", "asset-a"]);

  assert.deepEqual(reordered.map((row) => row.id), ["asset-b", "income", "asset-a", "liability"]);
});

test("moves an account one position for keyboard-accessible controls", () => {
  assert.deepEqual(moveAccountRowByOffset(["cash", "receivable", "inventory"], "receivable", -1), [
    "receivable",
    "cash",
    "inventory",
  ]);
  assert.deepEqual(moveAccountRowByOffset(["cash", "receivable", "inventory"], "cash", -1), [
    "cash",
    "receivable",
    "inventory",
  ]);
});

test("moves a dragged account to the target position in either direction", () => {
  assert.deepEqual(moveAccountRowToTarget(["cash", "receivable", "inventory"], "cash", "inventory"), [
    "receivable",
    "inventory",
    "cash",
  ]);
  assert.deepEqual(moveAccountRowToTarget(["cash", "receivable", "inventory"], "inventory", "cash"), [
    "inventory",
    "cash",
    "receivable",
  ]);
});
