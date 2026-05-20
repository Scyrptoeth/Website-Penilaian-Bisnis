import type { AccountCategory } from "./types";
import type { StatementType } from "./case-model";

export const accountLabelDefinitions = [
  { id: "source:balance-sheet", label: "Neraca", group: "Sumber" },
  { id: "source:income-statement", label: "Laba Rugi", group: "Sumber" },
  { id: "source:fixed-asset", label: "Jadwal Aset Tetap", group: "Sumber" },
  { id: "fs:asset", label: "Aset", group: "Struktur laporan" },
  { id: "fs:current-asset", label: "Aset Lancar", group: "Struktur laporan" },
  { id: "fs:non-current-asset", label: "Aset Tidak Lancar", group: "Struktur laporan" },
  { id: "fs:liability", label: "Liabilitas", group: "Struktur laporan" },
  { id: "fs:current-liability", label: "Liabilitas Lancar", group: "Struktur laporan" },
  { id: "fs:non-current-liability", label: "Liabilitas Tidak Lancar", group: "Struktur laporan" },
  { id: "fs:equity", label: "Ekuitas", group: "Struktur laporan" },
  { id: "fs:revenue", label: "Pendapatan", group: "Struktur laporan" },
  { id: "fs:expense", label: "Beban", group: "Struktur laporan" },
  { id: "fs:cash", label: "Kas", group: "Substansi akun" },
  { id: "fs:fixed-asset", label: "Aset Tetap", group: "Substansi akun" },
  { id: "fs:intangible", label: "Aset Tak Berwujud", group: "Substansi akun" },
  { id: "treatment:operating", label: "Operasional", group: "Perlakuan valuasi" },
  { id: "treatment:non-operating", label: "Non-operasional", group: "Perlakuan valuasi" },
  { id: "treatment:financing", label: "Pendanaan", group: "Perlakuan valuasi" },
  { id: "treatment:equity", label: "Ekuitas", group: "Perlakuan valuasi" },
  { id: "treatment:debt-like", label: "Setara utang (debt-like)", group: "Perlakuan valuasi" },
  { id: "treatment:working-capital", label: "Modal Kerja", group: "Perlakuan valuasi" },
  { id: "formula:neraca", label: "Neraca", group: "Penggunaan formula" },
  { id: "formula:fixed-asset", label: "Aset Tetap", group: "Penggunaan formula" },
  { id: "formula:aam", label: "AAM", group: "Penggunaan formula" },
  { id: "formula:eem", label: "EEM", group: "Penggunaan formula" },
  { id: "formula:dcf", label: "DCF", group: "Penggunaan formula" },
  { id: "formula:noplat", label: "NOPLAT", group: "Penggunaan formula" },
  { id: "formula:nta", label: "NTA", group: "Penggunaan formula" },
  { id: "formula:excess-earnings", label: "Excess Earnings", group: "Penggunaan formula" },
  { id: "formula:fcff", label: "FCFF", group: "Penggunaan formula" },
  { id: "sign:debit-positive", label: "Debit positif", group: "Perilaku tanda" },
  { id: "sign:credit-positive", label: "Kredit positif", group: "Perilaku tanda" },
  { id: "sign:contra-negative", label: "Kontra negatif", group: "Perilaku tanda" },
  { id: "sign:expense-negative", label: "Beban negatif", group: "Perilaku tanda" },
  { id: "sign:bridge-negative", label: "Bridge negatif", group: "Perilaku tanda" },
  { id: "review:judgment", label: "Perlu judgment", group: "Tinjauan" },
  { id: "review:sak-ifrs", label: "Tinjauan SAK/IFRS", group: "Tinjauan" },
] as const;

export type AccountLabelId = (typeof accountLabelDefinitions)[number]["id"];

export type CategoryPlacement =
  | "Aset"
  | "Liabilitas"
  | "Ekuitas"
  | "Laba rugi"
  | "Aset tetap"
  | "Arus kas"
  | "Tinjauan";

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
  let placement: CategoryPlacement = "Tinjauan";
  let treatment = "Tinjauan";
  let signBehavior = "Review manual";

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
    signBehavior = "Aset debit positif";
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
    signBehavior = "Liabilitas kredit positif";
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
    treatment = "Ekuitas";
    signBehavior = "Ekuitas kredit positif";
  }

  if (revenueCategories.has(category)) {
    placement = "Laba rugi";
    labels.push("fs:revenue", "formula:noplat", "formula:dcf", "sign:credit-positive");
    signBehavior = "Pendapatan kredit positif";
  }

  if (expenseCategories.has(category)) {
    placement = "Laba rugi";
    labels.push("fs:expense", "formula:noplat", "formula:dcf", "sign:expense-negative");
    signBehavior = "Beban mengurangi laba";
  }

  if (operatingCategories.has(category)) {
    treatment = "Operasional";
    labels.push("treatment:operating");
  }

  if (nonOperatingCategories.has(category)) {
    treatment = "Non-operasional";
    labels.push("treatment:non-operating", "formula:eem", "formula:dcf");
  }

  if (debtLikeCategories.has(category)) {
    treatment = "Setara utang";
    labels.push("treatment:debt-like", "formula:eem", "formula:dcf", "sign:bridge-negative");
    signBehavior = "Bridge utang negatif";
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
      placement = "Aset tetap";
    }
  }

  if (category === "ACCUMULATED_DEPRECIATION") {
    labels.push("sign:contra-negative");
    signBehavior = "Kontra aset disajikan negatif";
  }

  if (category === "INTANGIBLE_ASSETS") {
    labels.push("fs:intangible", "formula:excess-earnings", "review:sak-ifrs");
    treatment = "Tinjauan";
  }

  if (dcfOperatingDriverCategories.has(category)) {
    formulaUsage.push("formula:dcf", "formula:fcff");
  }

  if (category === "REVENUE" || expenseCategories.has(category)) {
    formulaUsage.push("formula:noplat");
  }

  if (category === "CORPORATE_TAX") {
    placement = "Laba rugi";
    treatment = "Beban pajak";
    signBehavior = "Beban mengurangi laba";
    labels.push("fs:expense", "sign:expense-negative", "review:judgment");
  }

  if (fixedAssetCategories.has(category)) {
    formulaUsage.push("formula:fixed-asset", "formula:nta");
  }

  if (category === "WORKING_CAPITAL") {
    placement = "Arus kas";
    treatment = "Modal kerja";
    labels.push("treatment:working-capital", "formula:dcf", "formula:fcff", "review:judgment");
  }

  if (category.startsWith("CASH_FLOW_")) {
    placement = "Arus kas";
    treatment = "Audit saja";
    labels.push("formula:fcff", "review:judgment");
    signBehavior = "Hanya sumber audit";
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
