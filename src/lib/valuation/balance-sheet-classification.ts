import type { AccountLabelId } from "./account-labels";
import type { BalanceSheetClassification, MappedRow, StatementType } from "./case-model";
import type { AccountCategory } from "./types";

export const balanceSheetClassificationOptions: Array<{ value: BalanceSheetClassification; label: string }> = [
  { value: "current_asset", label: "Current Asset" },
  { value: "non_current_asset", label: "Non-current Asset" },
  { value: "asset_total", label: "Total Asset / Override" },
  { value: "current_liability", label: "Current Liability" },
  { value: "non_current_liability", label: "Non-current Liability" },
  { value: "liability_total", label: "Total Liability / Override" },
  { value: "equity", label: "Equity" },
];

export const balanceSheetClassificationLabelMap = new Map(balanceSheetClassificationOptions.map((option) => [option.value, option.label]));
export const balanceSheetClassificationValueSet = new Set<BalanceSheetClassification>(balanceSheetClassificationOptions.map((option) => option.value));

export const assetCategories = new Set<AccountCategory>([
  "CASH_ON_HAND",
  "CASH_ON_BANK",
  "ACCOUNT_RECEIVABLE",
  "EMPLOYEE_RECEIVABLE",
  "INVENTORY",
  "CURRENT_ASSET",
  "FIXED_ASSET",
  "FIXED_ASSET_ACQUISITION",
  "ACCUMULATED_DEPRECIATION",
  "NON_CURRENT_ASSET",
  "NON_OPERATING_FIXED_ASSETS",
  "INTANGIBLE_ASSETS",
  "EXCESS_CASH",
  "MARKETABLE_SECURITIES",
  "SURPLUS_ASSET_CASH",
  "TOTAL_ASSETS",
]);

export const liabilityCategories = new Set<AccountCategory>([
  "BANK_LOAN_SHORT_TERM",
  "ACCOUNT_PAYABLE",
  "TAX_PAYABLE",
  "OTHER_PAYABLE",
  "CURRENT_LIABILITIES",
  "BANK_LOAN_LONG_TERM",
  "NON_CURRENT_LIABILITIES",
  "INTEREST_PAYABLE",
  "INTEREST_BEARING_DEBT",
  "TOTAL_LIABILITIES",
]);

export const equityCategories = new Set<AccountCategory>([
  "MODAL_DISETOR",
  "PENAMBAHAN_MODAL_DISETOR",
  "RETAINED_EARNINGS_SURPLUS",
  "RETAINED_EARNINGS_CURRENT_PROFIT",
]);

const balanceSheetClassificationLabelIds: Partial<Record<BalanceSheetClassification, AccountLabelId>> = {
  current_asset: "fs:current-asset",
  non_current_asset: "fs:non-current-asset",
  current_liability: "fs:current-liability",
  non_current_liability: "fs:non-current-liability",
  equity: "fs:equity",
};

const balanceSheetDetailLabelIds = new Set<AccountLabelId>([
  "fs:current-asset",
  "fs:non-current-asset",
  "fs:current-liability",
  "fs:non-current-liability",
  "fs:equity",
]);

export function inferBalanceSheetClassification(category: AccountCategory): BalanceSheetClassification | "" {
  if (category === "TOTAL_ASSETS") {
    return "asset_total";
  }

  if (category === "TOTAL_LIABILITIES") {
    return "liability_total";
  }

  if (
    category === "CURRENT_ASSET" ||
    category === "CASH_ON_HAND" ||
    category === "CASH_ON_BANK" ||
    category === "ACCOUNT_RECEIVABLE" ||
    category === "EMPLOYEE_RECEIVABLE" ||
    category === "INVENTORY" ||
    category === "EXCESS_CASH" ||
    category === "MARKETABLE_SECURITIES" ||
    category === "SURPLUS_ASSET_CASH"
  ) {
    return "current_asset";
  }

  if (
    category === "NON_CURRENT_ASSET" ||
    category === "FIXED_ASSET" ||
    category === "FIXED_ASSET_ACQUISITION" ||
    category === "ACCUMULATED_DEPRECIATION" ||
    category === "NON_OPERATING_FIXED_ASSETS" ||
    category === "INTANGIBLE_ASSETS"
  ) {
    return "non_current_asset";
  }

  if (
    category === "CURRENT_LIABILITIES" ||
    category === "BANK_LOAN_SHORT_TERM" ||
    category === "ACCOUNT_PAYABLE" ||
    category === "TAX_PAYABLE" ||
    category === "OTHER_PAYABLE" ||
    category === "INTEREST_PAYABLE"
  ) {
    return "current_liability";
  }

  if (category === "NON_CURRENT_LIABILITIES" || category === "BANK_LOAN_LONG_TERM" || category === "INTEREST_BEARING_DEBT") {
    return "non_current_liability";
  }

  if (equityCategories.has(category)) {
    return "equity";
  }

  return "";
}

export function getBalanceSheetClassificationOptions(category: AccountCategory): Array<{ value: BalanceSheetClassification; label: string }> {
  if (category === "TOTAL_ASSETS") {
    return balanceSheetClassificationOptions.filter((option) => option.value === "asset_total");
  }

  if (category === "TOTAL_LIABILITIES") {
    return balanceSheetClassificationOptions.filter((option) => option.value === "liability_total");
  }

  if (assetCategories.has(category)) {
    return balanceSheetClassificationOptions.filter((option) => option.value === "current_asset" || option.value === "non_current_asset");
  }

  if (liabilityCategories.has(category)) {
    return balanceSheetClassificationOptions.filter((option) => option.value === "current_liability" || option.value === "non_current_liability");
  }

  if (equityCategories.has(category)) {
    return balanceSheetClassificationOptions.filter((option) => option.value === "equity");
  }

  return balanceSheetClassificationOptions.filter(
    (option) =>
      option.value === "current_asset" ||
      option.value === "non_current_asset" ||
      option.value === "current_liability" ||
      option.value === "non_current_liability",
  );
}

export function getEffectiveBalanceSheetClassification(item: MappedRow): BalanceSheetClassification | "" {
  const options = getBalanceSheetClassificationOptions(item.effectiveCategory);
  const allowedValues = new Set(options.map((option) => option.value));
  const override = item.row.balanceSheetClassification;

  if (override && allowedValues.has(override)) {
    return override;
  }

  return inferBalanceSheetClassification(item.effectiveCategory);
}

export function applyBalanceSheetClassificationToDisplayLabels(
  statement: StatementType,
  labels: AccountLabelId[],
  classification: BalanceSheetClassification | "",
): AccountLabelId[] {
  const classificationLabelId = classification ? balanceSheetClassificationLabelIds[classification] : undefined;

  if (statement !== "balance_sheet" || !classificationLabelId) {
    return labels;
  }

  return Array.from(new Set([...labels.filter((labelId) => !balanceSheetDetailLabelIds.has(labelId)), classificationLabelId]));
}
