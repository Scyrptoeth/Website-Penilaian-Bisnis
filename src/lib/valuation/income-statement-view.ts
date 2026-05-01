import { aggregateForPeriod, parseInputNumber, type FixedAssetScheduleSummary, type MappedRow, type Period } from "./case-model";
import { formatEditableNumber } from "./format";
import type { AccountCategory } from "./types";

export type IncomeStatementLineKind = "input" | "subtotal" | "section" | "derived";

export type IncomeStatementLine = {
  key: string;
  label: string;
  kind: IncomeStatementLineKind;
  source: string;
  values: Record<string, number>;
};

export type IncomeStatementView = {
  lines: IncomeStatementLine[];
  hasRows: boolean;
};

export const defaultNegativeIncomeCategories = new Set<AccountCategory>([
  "COST_OF_GOOD_SOLD",
  "SELLING_EXPENSE",
  "GENERAL_ADMINISTRATIVE_OVERHEADS",
  "OPERATING_EXPENSE",
  "DEPRECIATION_EXPENSE",
  "INTEREST_EXPENSE",
  "CORPORATE_TAX",
]);

export function shouldDefaultNegativeIncomeCategory(category: AccountCategory): boolean {
  return defaultNegativeIncomeCategories.has(category);
}

export function formatIncomeStatementInputValue(category: AccountCategory, statement: string, previousValue: string, nextValue: string): string {
  const formattedValue = formatEditableNumber(nextValue);

  if (!shouldDefaultNegativeIncomeValue(category, statement, previousValue, formattedValue)) {
    return formattedValue;
  }

  return `-${formattedValue}`;
}

export function shouldDefaultNegativeIncomeValue(category: AccountCategory, statement: string, previousValue: string, nextValue: string): boolean {
  if (statement !== "income_statement" || !defaultNegativeIncomeCategories.has(category) || previousValue.trim() !== "") {
    return false;
  }

  const trimmed = nextValue.trim();

  if (!trimmed || trimmed.startsWith("-") || trimmed.startsWith("+")) {
    return false;
  }

  return parseInputNumber(trimmed) > 0;
}

export function buildIncomeStatementView(
  periods: Period[],
  mappedRows: MappedRow[],
  fixedAssetSchedule: FixedAssetScheduleSummary,
): IncomeStatementView {
  const incomeRows = mappedRows.filter((item) => item.row.statement === "income_statement" && item.effectiveCategory !== "UNMAPPED");
  const valuesFor = (getValue: (period: Period) => number) => Object.fromEntries(periods.map((period) => [period.id, getValue(period)]));
  const byCategory = (period: Period, ...categories: AccountCategory[]) => aggregateForPeriod(incomeRows, period.id, categories);
  const depreciationSource = (period: Period) => {
    const manualDepreciation = byCategory(period, "DEPRECIATION_EXPENSE");

    if (manualDepreciation !== 0) {
      return manualDepreciation;
    }

    return fixedAssetSchedule.hasInput ? -Math.abs(fixedAssetSchedule.totals[period.id]?.depreciationAdditions ?? 0) : 0;
  };
  const revenue = valuesFor((period) => byCategory(period, "REVENUE"));
  const cogs = valuesFor((period) => byCategory(period, "COST_OF_GOOD_SOLD"));
  const grossProfit = valuesFor((period) => value(revenue, period) + value(cogs, period));
  const operatingExpenses = valuesFor((period) =>
    byCategory(period, "SELLING_EXPENSE", "GENERAL_ADMINISTRATIVE_OVERHEADS", "OPERATING_EXPENSE"),
  );
  const ebitda = valuesFor((period) => value(grossProfit, period) + value(operatingExpenses, period));
  const depreciation = valuesFor(depreciationSource);
  const ebit = valuesFor((period) => {
    const override = byCategory(period, "EBIT");
    return override || value(ebitda, period) + value(depreciation, period);
  });
  const otherIncomesCharges = valuesFor((period) => byCategory(period, "INTEREST_INCOME", "INTEREST_EXPENSE"));
  const nonOperatingIncome = valuesFor((period) => byCategory(period, "NON_OPERATING_INCOME"));
  const profitBeforeTax = valuesFor((period) => value(ebit, period) + value(otherIncomesCharges, period) + value(nonOperatingIncome, period));
  const corporateTax = valuesFor((period) => byCategory(period, "CORPORATE_TAX"));
  const netProfitAfterTax = valuesFor((period) => {
    const explicitNpat = byCategory(period, "COMMERCIAL_NPAT");
    return explicitNpat || value(profitBeforeTax, period) + value(corporateTax, period);
  });

  return {
    hasRows: incomeRows.length > 0 || fixedAssetSchedule.hasInput,
    lines: [
      { key: "revenue", label: "Revenue", kind: "input", source: "Input akun", values: revenue },
      { key: "cogs", label: "Cost of Goods Sold", kind: "input", source: "Input akun", values: cogs },
      { key: "gross-profit", label: "Gross Profit", kind: "subtotal", source: "Revenue + COGS", values: grossProfit },
      { key: "operating-expenses-section", label: "Operating Expenses", kind: "section", source: "", values: zeroValues(periods) },
      { key: "operating-expenses", label: "Operating Expenses", kind: "input", source: "Selling + G&A + operating expense", values: operatingExpenses },
      { key: "ebitda", label: "EBITDA", kind: "subtotal", source: "Gross Profit + Operating Expenses", values: ebitda },
      {
        key: "depreciation",
        label: "Depreciation",
        kind: "derived",
        source: fixedAssetSchedule.hasInput ? "Fixed Asset Schedule / manual override" : "Input akun",
        values: depreciation,
      },
      { key: "ebit", label: "EBIT", kind: "subtotal", source: "EBITDA + Depreciation", values: ebit },
      { key: "other-incomes-charges-section", label: "Other Incomes/(Charges)", kind: "section", source: "", values: zeroValues(periods) },
      { key: "other-incomes-charges", label: "Other Incomes/(Charges)", kind: "input", source: "Interest income + interest expense", values: otherIncomesCharges },
      { key: "non-operating-income", label: "Non Operating Income", kind: "input", source: "Input akun", values: nonOperatingIncome },
      { key: "profit-before-tax", label: "Profit Before Tax", kind: "subtotal", source: "EBIT + other items", values: profitBeforeTax },
      { key: "corporate-tax", label: "Corporate Tax", kind: "input", source: "Input akun", values: corporateTax },
      { key: "net-profit-after-tax", label: "Net Profit After Tax", kind: "subtotal", source: "PBT + Corporate Tax", values: netProfitAfterTax },
    ],
  };
}

function value(values: Record<string, number>, period: Period) {
  return values[period.id] ?? 0;
}

function zeroValues(periods: Period[]) {
  return Object.fromEntries(periods.map((period) => [period.id, 0]));
}
