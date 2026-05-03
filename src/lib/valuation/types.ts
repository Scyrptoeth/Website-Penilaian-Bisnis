export type ValuationMethod = "AAM" | "EEM" | "DCF";

export type AccountCategory =
  | "UNMAPPED"
  | "BANK_LOAN_SHORT_TERM"
  | "BANK_LOAN_LONG_TERM"
  | "CURRENT_ASSET"
  | "TOTAL_ASSETS"
  | "CASH"
  | "CASH_ON_HAND"
  | "CASH_ON_BANK"
  | "ACCOUNT_RECEIVABLE"
  | "EMPLOYEE_RECEIVABLE"
  | "INVENTORY"
  | "FIXED_ASSET"
  | "FIXED_ASSET_ACQUISITION"
  | "ACCUMULATED_DEPRECIATION"
  | "DEPRECIATION_EXPENSE"
  | "NON_CURRENT_ASSET"
  | "INTANGIBLE_ASSETS"
  | "CURRENT_LIABILITIES"
  | "NON_CURRENT_LIABILITIES"
  | "TOTAL_LIABILITIES"
  | "ACCOUNT_PAYABLE"
  | "TAX_PAYABLE"
  | "OTHER_PAYABLE"
  | "MODAL_DISETOR"
  | "PENAMBAHAN_MODAL_DISETOR"
  | "RETAINED_EARNINGS_SURPLUS"
  | "RETAINED_EARNINGS_CURRENT_PROFIT"
  | "REVENUE"
  | "COST_OF_GOOD_SOLD"
  | "SELLING_EXPENSE"
  | "GENERAL_ADMINISTRATIVE_OVERHEADS"
  | "OPERATING_EXPENSE"
  | "EBIT"
  | "COMMERCIAL_NPAT"
  | "CORPORATE_TAX"
  | "INTEREST_INCOME"
  | "INTEREST_EXPENSE"
  | "NON_OPERATING_INCOME"
  | "WORKING_CAPITAL"
  | "CASH_FLOW_FROM_FINANCING"
  | "CASH_FLOW_FROM_OPERATIONS"
  | "CASH_FLOW_FROM_NON_OPERATIONS"
  | "CASH_FLOW_AVAILABLE_TO_INVESTOR"
  | "NON_OPERATING_FIXED_ASSETS"
  | "EXCESS_CASH"
  | "MARKETABLE_SECURITIES"
  | "INTEREST_PAYABLE"
  | "INTEREST_BEARING_DEBT"
  | "SURPLUS_ASSET_CASH";

export type MappingTreatment =
  | "operating"
  | "non_operating"
  | "financing"
  | "equity"
  | "debt"
  | "liability"
  | "review";

export interface AccountMappingRule {
  category: AccountCategory;
  displayName: string;
  aliases: string[];
  includeKeywords: string[];
  excludeKeywords?: string[];
  treatment: MappingTreatment;
  valuationImpact: string[];
  reviewNote: string;
}

export interface AccountMappingResult {
  sourceLabel: string;
  normalizedLabel: string;
  category: AccountCategory;
  displayName: string;
  confidence: number;
  confidenceBand: "high" | "medium" | "low" | "none";
  treatment: MappingTreatment;
  valuationImpact: string[];
  reason: string;
  needsReview: boolean;
  matchedKeywords: string[];
  excludedKeywords: string[];
  statementCompatible: boolean | null;
  alternatives: AccountMappingAlternative[];
}

export interface AccountMappingAlternative {
  category: AccountCategory;
  displayName: string;
  confidence: number;
  treatment: MappingTreatment;
}

export interface FinancialStatementSnapshot {
  valuationDate: string;
  taxRate: number;
  terminalGrowth: number;
  terminalGrowthDownside?: number;
  terminalGrowthUpside?: number;
  revenueGrowth: number;
  wacc: number;
  requiredReturnOnNta: number;
  cogsMargin: number;
  gaMargin: number;
  depreciationMargin: number;
  arDays: number;
  inventoryDays: number;
  apDays: number;
  otherPayableDays: number;
  cashOnHand: number;
  cashOnBankDeposit: number;
  accountReceivable: number;
  employeeReceivable: number;
  inventory: number;
  fixedAssetsNet: number;
  nonOperatingFixedAssets: number;
  intangibleAssets: number;
  excessCash: number;
  marketableSecurities: number;
  surplusAssetCash: number;
  currentAssets: number;
  nonCurrentAssets: number;
  totalAssets: number;
  bankLoanShortTerm: number;
  accountPayable: number;
  taxPayable: number;
  otherPayable: number;
  interestPayable: number;
  bankLoanLongTerm: number;
  currentLiabilities: number;
  nonCurrentLiabilities: number;
  totalLiabilities: number;
  paidUpCapital: number;
  additionalPaidInCapital: number;
  retainedEarningsSurplus: number;
  retainedEarningsCurrentProfit: number;
  bookEquity: number;
  commercialNpat: number;
  revenue: number;
  cogs: number;
  sellingExpense: number;
  gaOverheads: number;
  depreciation: number;
  ebit: number;
  corporateTax: number;
  interestIncome: number;
  interestExpense: number;
  nonOperatingIncome: number;
}

export interface FormulaTrace {
  label: string;
  formula: string;
  value: number;
  note: string;
  valueFormat?: "currency" | "percent" | "number";
}

export interface MethodOutput {
  method: ValuationMethod;
  equityValue: number;
  traces: FormulaTrace[];
}

export interface DcfForecastRow {
  year: number;
  revenue: number;
  ebit: number;
  noplat: number;
  operatingNwc: number;
  changeInNwc: number;
  freeCashFlow: number;
  discountFactor: number;
  presentValue: number;
}
