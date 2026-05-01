import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildFixedAssetScheduleSummary, mapRow, type FixedAssetScheduleRow } from "../../src/lib/valuation/case-model";
import {
  buildIncomeStatementView,
  formatIncomeStatementInputValue,
  shouldDefaultNegativeIncomeCategory,
  type IncomeStatementView,
} from "../../src/lib/valuation/income-statement-view";
import { basePeriods, rowFixture } from "./test-utils";

describe("income statement view", () => {
  it("builds the workbook-style profit and loss bridge from mapped rows and fixed asset depreciation", () => {
    const scheduleRow: FixedAssetScheduleRow = {
      id: "fa1",
      assetName: "Factory equipment",
      values: {
        p0: {
          acquisitionBeginning: "500",
          acquisitionAdditions: "0",
          depreciationBeginning: "0",
          depreciationAdditions: "40",
        },
        p1: {
          acquisitionBeginning: "",
          acquisitionAdditions: "0",
          depreciationBeginning: "",
          depreciationAdditions: "50",
        },
      },
    };
    const fixedAssetSchedule = buildFixedAssetScheduleSummary(basePeriods, [scheduleRow]);
    const mappedRows = [
      rowFixture({ id: "revenue", statement: "income_statement", accountName: "Revenue", category: "REVENUE", values: { p0: "900", p1: "1000" } }),
      rowFixture({
        id: "cogs",
        statement: "income_statement",
        accountName: "COGS",
        category: "COST_OF_GOOD_SOLD",
        values: { p0: "-300", p1: "-400" },
      }),
      rowFixture({
        id: "ga",
        statement: "income_statement",
        accountName: "G&A",
        category: "GENERAL_ADMINISTRATIVE_OVERHEADS",
        values: { p0: "-80", p1: "-100" },
      }),
      rowFixture({
        id: "interest-income",
        statement: "income_statement",
        accountName: "Interest income",
        category: "INTEREST_INCOME",
        values: { p0: "10", p1: "20" },
      }),
      rowFixture({
        id: "interest-expense",
        statement: "income_statement",
        accountName: "Interest expense",
        category: "INTEREST_EXPENSE",
        values: { p0: "-2", p1: "-5" },
      }),
      rowFixture({
        id: "non-op",
        statement: "income_statement",
        accountName: "Non operating income",
        category: "NON_OPERATING_INCOME",
        values: { p0: "0", p1: "-10" },
      }),
      rowFixture({
        id: "tax",
        statement: "income_statement",
        accountName: "Corporate Tax",
        category: "CORPORATE_TAX",
        values: { p0: "-90", p1: "-100" },
      }),
    ].map(mapRow);

    const view = buildIncomeStatementView(basePeriods, mappedRows, fixedAssetSchedule);

    assert.equal(view.hasRows, true);
    assert.equal(lineValue(view, "gross-profit", "p1"), 600);
    assert.equal(lineValue(view, "operating-expenses", "p1"), -100);
    assert.equal(lineValue(view, "ebitda", "p1"), 500);
    assert.equal(lineValue(view, "depreciation", "p1"), -50);
    assert.equal(lineValue(view, "ebit", "p1"), 450);
    assert.equal(lineValue(view, "other-incomes-charges", "p1"), 15);
    assert.equal(lineValue(view, "profit-before-tax", "p1"), 455);
    assert.equal(lineValue(view, "corporate-tax", "p1"), -100);
    assert.equal(lineValue(view, "net-profit-after-tax", "p1"), 355);
  });

  it("defaults expense-like income statement input to negative only on first entry", () => {
    assert.equal(shouldDefaultNegativeIncomeCategory("COST_OF_GOOD_SOLD"), true);
    assert.equal(formatIncomeStatementInputValue("COST_OF_GOOD_SOLD", "income_statement", "", "100"), "-100");
    assert.equal(formatIncomeStatementInputValue("COST_OF_GOOD_SOLD", "income_statement", "-100", "100"), "100");
    assert.equal(formatIncomeStatementInputValue("REVENUE", "income_statement", "", "100"), "100");
    assert.equal(formatIncomeStatementInputValue("TAX_PAYABLE", "balance_sheet", "", "100"), "100");
  });
});

function lineValue(view: IncomeStatementView, key: string, periodId: string): number {
  const line = view.lines.find((item) => item.key === key);

  assert.ok(line, `expected line ${key} to exist`);
  return line.values[periodId] ?? 0;
}
