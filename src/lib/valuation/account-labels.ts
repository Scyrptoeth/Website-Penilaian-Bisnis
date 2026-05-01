import type { AccountCategory } from "./types";
import type { StatementType } from "./case-model";

export const accountLabelDefinitions = [
  { id: "source:balance-sheet", label: "Balance Sheet", group: "Sumber" },
  { id: "source:income-statement", label: "Income Statement", group: "Sumber" },
  { id: "source:fixed-asset", label: "Fixed Asset Schedule", group: "Sumber" },
  { id: "fs:asset", label: "Asset", group: "Struktur laporan" },
  { id: "fs:current-asset", label: "Current Asset", group: "Struktur laporan" },
  { id: "fs:non-current-asset", label: "Non-current Asset", group: "Struktur laporan" },
  { id: "fs:liability", label: "Liability", group: "Struktur laporan" },
  { id: "fs:current-liability", label: "Current Liability", group: "Struktur laporan" },
  { id: "fs:non-current-liability", label: "Non-current Liability", group: "Struktur laporan" },
  { id: "fs:equity", label: "Equity", group: "Struktur laporan" },
  { id: "fs:revenue", label: "Revenue", group: "Struktur laporan" },
  { id: "fs:expense", label: "Expense", group: "Struktur laporan" },
  { id: "fs:cash", label: "Cash", group: "Substansi akun" },
  { id: "fs:fixed-asset", label: "Fixed Asset", group: "Substansi akun" },
  { id: "fs:intangible", label: "Intangible Asset", group: "Substansi akun" },
  { id: "treatment:operating", label: "Operating", group: "Treatment valuasi" },
  { id: "treatment:non-operating", label: "Non-operating", group: "Treatment valuasi" },
  { id: "treatment:financing", label: "Financing", group: "Treatment valuasi" },
  { id: "treatment:equity", label: "Equity", group: "Treatment valuasi" },
  { id: "treatment:debt-like", label: "Debt-like", group: "Treatment valuasi" },
  { id: "treatment:working-capital", label: "Working Capital", group: "Treatment valuasi" },
  { id: "formula:neraca", label: "Neraca", group: "Formula usage" },
  { id: "formula:fixed-asset", label: "Fixed Asset", group: "Formula usage" },
  { id: "formula:aam", label: "AAM", group: "Formula usage" },
  { id: "formula:eem", label: "EEM", group: "Formula usage" },
  { id: "formula:dcf", label: "DCF", group: "Formula usage" },
  { id: "formula:noplat", label: "NOPLAT", group: "Formula usage" },
  { id: "formula:nta", label: "NTA", group: "Formula usage" },
  { id: "formula:excess-earnings", label: "Excess Earnings", group: "Formula usage" },
  { id: "formula:fcff", label: "FCFF", group: "Formula usage" },
  { id: "sign:debit-positive", label: "Debit positive", group: "Sign behavior" },
  { id: "sign:credit-positive", label: "Credit positive", group: "Sign behavior" },
  { id: "sign:contra-negative", label: "Contra negative", group: "Sign behavior" },
  { id: "sign:expense-negative", label: "Expense negative", group: "Sign behavior" },
  { id: "sign:bridge-negative", label: "Bridge negative", group: "Sign behavior" },
  { id: "review:judgment", label: "Needs judgment", group: "Review" },
  { id: "review:sak-ifrs", label: "SAK/IFRS review", group: "Review" },
] as const;

export type AccountLabelId = (typeof accountLabelDefinitions)[number]["id"];

export type CategoryPlacement =
  | "Aset"
  | "Liabilitas"
  | "Ekuitas"
  | "Laba rugi"
  | "Fixed Asset"
  | "Cash Flow"
  | "Review";

export type CategoryLabelProfile = {
  placement: CategoryPlacement;
  treatment: string;
  signBehavior: string;
  labels: AccountLabelId[];
  formulaUsage: AccountLabelId[];
};

const accountLabelIdSet = new Set<AccountLabelId>(accountLabelDefinitions.map((item) => item.id));

const statementLabels: Record<StatementType, AccountLabelId> = {
  balance_sheet: "source:balance-sheet",
  income_statement: "source:income-statement",
  fixed_asset: "source:fixed-asset",
};

const currentAssetCategories = new Set<AccountCategory>([
  "CURRENT_ASSET",
  "CASH",
  "CASH_ON_HAND",
  "CASH_ON_BANK",
  "ACCOUNT_RECEIVABLE",
  "EMPLOYEE_RECEIVABLE",
  "INVENTORY",
  "EXCESS_CASH",
  "MARKETABLE_SECURITIES",
  "SURPLUS_ASSET_CASH",
]);

const nonCurrentAssetCategories = new Set<AccountCategory>([
  "FIXED_ASSET",
  "FIXED_ASSET_ACQUISITION",
  "ACCUMULATED_DEPRECIATION",
  "NON_CURRENT_ASSET",
  "NON_OPERATING_FIXED_ASSETS",
  "INTANGIBLE_ASSETS",
]);

const currentLiabilityCategories = new Set<AccountCategory>([
  "CURRENT_LIABILITIES",
  "BANK_LOAN_SHORT_TERM",
  "ACCOUNT_PAYABLE",
  "TAX_PAYABLE",
  "OTHER_PAYABLE",
  "INTEREST_PAYABLE",
]);

const nonCurrentLiabilityCategories = new Set<AccountCategory>([
  "NON_CURRENT_LIABILITIES",
  "BANK_LOAN_LONG_TERM",
  "INTEREST_BEARING_DEBT",
]);

const equityCategories = new Set<AccountCategory>([
  "MODAL_DISETOR",
  "PENAMBAHAN_MODAL_DISETOR",
  "RETAINED_EARNINGS_SURPLUS",
  "RETAINED_EARNINGS_CURRENT_PROFIT",
]);

const revenueCategories = new Set<AccountCategory>(["REVENUE", "INTEREST_INCOME", "NON_OPERATING_INCOME"]);
const expenseCategories = new Set<AccountCategory>([
  "COST_OF_GOOD_SOLD",
  "SELLING_EXPENSE",
  "GENERAL_ADMINISTRATIVE_OVERHEADS",
  "OPERATING_EXPENSE",
  "DEPRECIATION_EXPENSE",
  "INTEREST_EXPENSE",
]);

const operatingCategories = new Set<AccountCategory>([
  "ACCOUNT_RECEIVABLE",
  "INVENTORY",
  "FIXED_ASSET",
  "FIXED_ASSET_ACQUISITION",
  "ACCUMULATED_DEPRECIATION",
  "ACCOUNT_PAYABLE",
  "OTHER_PAYABLE",
  "REVENUE",
  "COST_OF_GOOD_SOLD",
  "SELLING_EXPENSE",
  "GENERAL_ADMINISTRATIVE_OVERHEADS",
  "OPERATING_EXPENSE",
  "DEPRECIATION_EXPENSE",
  "EBIT",
  "COMMERCIAL_NPAT",
]);

const nonOperatingCategories = new Set<AccountCategory>([
  "CASH_ON_BANK",
  "EMPLOYEE_RECEIVABLE",
  "NON_OPERATING_FIXED_ASSETS",
  "EXCESS_CASH",
  "MARKETABLE_SECURITIES",
  "SURPLUS_ASSET_CASH",
  "INTEREST_INCOME",
  "NON_OPERATING_INCOME",
]);

const debtLikeCategories = new Set<AccountCategory>([
  "BANK_LOAN_SHORT_TERM",
  "BANK_LOAN_LONG_TERM",
  "INTEREST_PAYABLE",
  "INTEREST_BEARING_DEBT",
  "TAX_PAYABLE",
]);

const workingCapitalCategories = new Set<AccountCategory>([
  "ACCOUNT_RECEIVABLE",
  "INVENTORY",
  "ACCOUNT_PAYABLE",
  "OTHER_PAYABLE",
  "WORKING_CAPITAL",
]);

const cashCategories = new Set<AccountCategory>(["CASH", "CASH_ON_HAND", "CASH_ON_BANK", "EXCESS_CASH", "SURPLUS_ASSET_CASH"]);
const fixedAssetCategories = new Set<AccountCategory>([
  "FIXED_ASSET",
  "FIXED_ASSET_ACQUISITION",
  "ACCUMULATED_DEPRECIATION",
  "NON_OPERATING_FIXED_ASSETS",
  "DEPRECIATION_EXPENSE",
]);

const dcfOperatingDriverCategories = new Set<AccountCategory>([
  "REVENUE",
  "COST_OF_GOOD_SOLD",
  "SELLING_EXPENSE",
  "GENERAL_ADMINISTRATIVE_OVERHEADS",
  "OPERATING_EXPENSE",
  "DEPRECIATION_EXPENSE",
  "ACCOUNT_RECEIVABLE",
  "INVENTORY",
  "ACCOUNT_PAYABLE",
  "OTHER_PAYABLE",
]);

export function isAccountLabelId(value: unknown): value is AccountLabelId {
  return typeof value === "string" && accountLabelIdSet.has(value as AccountLabelId);
}

export function getAccountLabelDefinition(id: AccountLabelId) {
  return accountLabelDefinitions.find((item) => item.id === id);
}

export function getCategoryLabelProfile(category: AccountCategory): CategoryLabelProfile {
  const labels: AccountLabelId[] = [];
  const formulaUsage: AccountLabelId[] = [];
  let placement: CategoryPlacement = "Review";
  let treatment = "Review";
  let signBehavior = "Manual review";

  if (category === "UNMAPPED") {
    return {
      placement,
      treatment,
      signBehavior,
      labels: ["review:judgment"],
      formulaUsage,
    };
  }

  if (currentAssetCategories.has(category) || nonCurrentAssetCategories.has(category) || category === "TOTAL_ASSETS") {
    placement = "Aset";
    labels.push("fs:asset", "formula:neraca", "formula:aam", "sign:debit-positive");
    signBehavior = "Asset debit positive";
  }

  if (currentAssetCategories.has(category)) {
    labels.push("fs:current-asset");
  }

  if (nonCurrentAssetCategories.has(category)) {
    labels.push("fs:non-current-asset");
  }

  if (currentLiabilityCategories.has(category) || nonCurrentLiabilityCategories.has(category) || category === "TOTAL_LIABILITIES") {
    placement = "Liabilitas";
    labels.push("fs:liability", "formula:neraca", "formula:aam", "sign:credit-positive");
    signBehavior = "Liability credit positive";
  }

  if (currentLiabilityCategories.has(category)) {
    labels.push("fs:current-liability");
  }

  if (nonCurrentLiabilityCategories.has(category)) {
    labels.push("fs:non-current-liability");
  }

  if (equityCategories.has(category)) {
    placement = "Ekuitas";
    labels.push("fs:equity", "formula:neraca", "sign:credit-positive");
    treatment = "Equity";
    signBehavior = "Equity credit positive";
  }

  if (revenueCategories.has(category)) {
    placement = "Laba rugi";
    labels.push("fs:revenue", "formula:noplat", "formula:dcf", "sign:credit-positive");
    signBehavior = "Income credit positive";
  }

  if (expenseCategories.has(category)) {
    placement = "Laba rugi";
    labels.push("fs:expense", "formula:noplat", "formula:dcf", "sign:expense-negative");
    signBehavior = "Expense reduces earnings";
  }

  if (operatingCategories.has(category)) {
    treatment = "Operating";
    labels.push("treatment:operating");
  }

  if (nonOperatingCategories.has(category)) {
    treatment = "Non-operating";
    labels.push("treatment:non-operating", "formula:eem", "formula:dcf");
  }

  if (debtLikeCategories.has(category)) {
    treatment = "Debt-like";
    labels.push("treatment:debt-like", "formula:eem", "formula:dcf", "sign:bridge-negative");
    signBehavior = "Debt bridge negative";
  }

  if (workingCapitalCategories.has(category)) {
    labels.push("treatment:working-capital", "formula:dcf", "formula:fcff");
  }

  if (cashCategories.has(category)) {
    labels.push("fs:cash");
  }

  if (fixedAssetCategories.has(category)) {
    labels.push("fs:fixed-asset", "formula:fixed-asset", "formula:nta");
    if (category !== "DEPRECIATION_EXPENSE") {
      placement = "Fixed Asset";
    }
  }

  if (category === "ACCUMULATED_DEPRECIATION") {
    labels.push("sign:contra-negative");
    signBehavior = "Contra asset shown negative";
  }

  if (category === "INTANGIBLE_ASSETS") {
    labels.push("fs:intangible", "formula:excess-earnings", "review:sak-ifrs");
    treatment = "Review";
  }

  if (dcfOperatingDriverCategories.has(category)) {
    formulaUsage.push("formula:dcf", "formula:fcff");
  }

  if (category === "REVENUE" || expenseCategories.has(category)) {
    formulaUsage.push("formula:noplat");
  }

  if (category === "CORPORATE_TAX") {
    placement = "Laba rugi";
    treatment = "Tax expense";
    signBehavior = "Expense reduces earnings";
    labels.push("fs:expense", "sign:expense-negative", "review:judgment");
  }

  if (fixedAssetCategories.has(category)) {
    formulaUsage.push("formula:fixed-asset", "formula:nta");
  }

  if (category === "WORKING_CAPITAL") {
    placement = "Cash Flow";
    treatment = "Working capital";
    labels.push("treatment:working-capital", "formula:dcf", "formula:fcff", "review:judgment");
  }

  if (category.startsWith("CASH_FLOW_")) {
    placement = "Cash Flow";
    treatment = "Audit only";
    labels.push("formula:fcff", "review:judgment");
    signBehavior = "Audit source only";
  }

  return {
    placement,
    treatment,
    signBehavior,
    labels: uniqueLabels(labels),
    formulaUsage: uniqueLabels(formulaUsage),
  };
}

export function resolveAccountLabels(statement: StatementType, category: AccountCategory, overrides: AccountLabelId[] = []): AccountLabelId[] {
  const profile = getCategoryLabelProfile(category);
  return uniqueLabels([statementLabels[statement], ...profile.labels, ...profile.formulaUsage, ...overrides]);
}

export function sanitizeAccountLabels(labels: unknown): AccountLabelId[] {
  if (!Array.isArray(labels)) {
    return [];
  }

  return uniqueLabels(labels.filter(isAccountLabelId));
}

function uniqueLabels(labels: AccountLabelId[]): AccountLabelId[] {
  return Array.from(new Set(labels));
}
