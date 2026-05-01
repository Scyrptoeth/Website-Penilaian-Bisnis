import type {
  AccountRow,
  AssumptionState,
  FixedAssetScheduleSummary,
  MappedRow,
  Period,
} from "./case-model";
import type { AccountCategory, FinancialStatementSnapshot } from "./types";

export type WorkbenchSectionId =
  | "periods"
  | "balance"
  | "income"
  | "mapping"
  | "assumptions"
  | "valuation"
  | "payablesCashFlow"
  | "noplatFcf"
  | "ratiosCapital"
  | "audit";

export type ReadinessItem = {
  label: string;
  targetTab: WorkbenchSectionId;
  targetLabel: string;
  detail?: string;
};

export type SectionReadiness = {
  id: WorkbenchSectionId;
  title: string;
  isReady: boolean;
  fulfilled: ReadinessItem[];
  missing: ReadinessItem[];
  warnings: ReadinessItem[];
};

export type WorkbenchReadiness = Record<WorkbenchSectionId, SectionReadiness>;

type Criterion = ReadinessItem & {
  ok: boolean;
};

export function buildWorkbenchReadiness({
  periods,
  rows,
  mappedRows,
  assumptions,
  snapshot,
  fixedAssetSchedule,
}: {
  periods: Period[];
  rows: AccountRow[];
  mappedRows: MappedRow[];
  assumptions: AssumptionState;
  snapshot: FinancialStatementSnapshot;
  fixedAssetSchedule: FixedAssetScheduleSummary;
}): WorkbenchReadiness {
  const categorySet = new Set(mappedRows.map((item) => item.effectiveCategory));
  const hasPeriod = periods.length > 0;
  const hasComparativePeriod = periods.length >= 2;
  const hasAnyAccountInput = rows.length > 0 || fixedAssetSchedule.hasInput;
  const hasMappedAccount = mappedRows.some((item) => item.effectiveCategory !== "UNMAPPED") || fixedAssetSchedule.hasInput;
  const hasBalanceInput =
    rows.some((row) => row.statement === "balance_sheet") ||
    fixedAssetSchedule.hasInput ||
    snapshot.totalAssets !== 0 ||
    snapshot.totalLiabilities !== 0;
  const hasIncomeInput =
    rows.some((row) => row.statement === "income_statement") || snapshot.revenue !== 0 || snapshot.ebit !== 0 || snapshot.commercialNpat !== 0;
  const hasTaxRate = assumptions.taxRate.trim() !== "";
  const hasWacc = assumptions.wacc.trim() !== "";
  const hasTerminalGrowth = assumptions.terminalGrowth.trim() !== "";
  const hasRequiredReturn = assumptions.requiredReturnOnNta.trim() !== "";
  const hasWorkingCapitalDays =
    assumptions.arDays.trim() !== "" ||
    assumptions.inventoryDays.trim() !== "" ||
    assumptions.apDays.trim() !== "" ||
    assumptions.otherPayableDays.trim() !== "";
  const hasOperatingWorkingCapitalBasis = hasAnyCategory(categorySet, [
    "ACCOUNT_RECEIVABLE",
    "INVENTORY",
    "ACCOUNT_PAYABLE",
    "OTHER_PAYABLE",
  ]);
  const hasFixedAssetOrDepreciationBasis =
    fixedAssetSchedule.hasInput ||
    snapshot.fixedAssetsNet !== 0 ||
    hasAnyCategory(categorySet, ["FIXED_ASSET", "FIXED_ASSET_ACQUISITION", "ACCUMULATED_DEPRECIATION", "DEPRECIATION_EXPENSE"]);

  const period = criterion(hasPeriod, "Periode aktif tersedia", "periods", "Isi Periode");
  const comparativePeriod = criterion(hasComparativePeriod, "Minimal dua periode untuk movement dan cash-flow bridge", "periods", "Tambah Periode");
  const balance = criterion(hasBalanceInput, "Data neraca / fixed asset tersedia", "balance", "Isi Neraca");
  const income = criterion(hasIncomeInput, "Data laba rugi tersedia", "income", "Isi Laba Rugi");
  const mapped = criterion(hasMappedAccount, "Akun sudah dipetakan atau siap ditinjau", "mapping", "Review Mapping");
  const anyAccount = criterion(hasAnyAccountInput, "Minimal satu akun/schedule sudah diinput", "balance", "Isi Akun");
  const taxRate = criterion(hasTaxRate, "Tax rate tersedia", "assumptions", "Isi Asumsi");
  const wacc = criterion(hasWacc, "WACC tersedia", "assumptions", "Isi Asumsi");
  const terminalGrowth = criterion(hasTerminalGrowth, "Terminal growth tersedia", "assumptions", "Isi Asumsi");
  const requiredReturn = criterion(hasRequiredReturn, "Required return on NTA tersedia", "assumptions", "Isi Asumsi");
  const workingCapitalDays = criterion(hasWorkingCapitalDays, "Driver working-capital days tersedia", "assumptions", "Isi Driver");
  const operatingWorkingCapital = criterion(
    hasOperatingWorkingCapitalBasis,
    "Basis operating working capital tersedia: AR/inventory/AP/other payable",
    "balance",
    "Isi Neraca",
  );
  const fixedAssetOrDepreciation = criterion(
    hasFixedAssetOrDepreciationBasis,
    "Basis depreciation/capex tersedia dari fixed asset atau depreciation expense",
    "balance",
    "Isi Fixed Asset",
  );

  return {
    periods: status("periods", "Periode", [period]),
    balance: status("balance", "Neraca & Fixed Asset", [period]),
    income: status("income", "Laba Rugi", [period, income]),
    mapping: status("mapping", "Mapping & Label", [anyAccount, mapped]),
    assumptions: status("assumptions", "Asumsi & Driver", [period], [taxRate, wacc, terminalGrowth, requiredReturn, workingCapitalDays]),
    valuation: status("valuation", "Valuasi", [period, balance, income, taxRate, wacc, terminalGrowth, requiredReturn, mapped]),
    payablesCashFlow: status("payablesCashFlow", "Payables & Cash Flow", [
      period,
      comparativePeriod,
      balance,
      income,
      operatingWorkingCapital,
      mapped,
    ]),
    noplatFcf: status("noplatFcf", "NOPLAT & FCF", [
      period,
      comparativePeriod,
      income,
      taxRate,
      operatingWorkingCapital,
      fixedAssetOrDepreciation,
      mapped,
    ]),
    ratiosCapital: status("ratiosCapital", "Ratios & Capital Efficiency", [period, balance, income, mapped], [comparativePeriod]),
    audit: status("audit", "Audit", []),
  };
}

function criterion(ok: boolean, label: string, targetTab: WorkbenchSectionId, targetLabel: string, detail?: string): Criterion {
  return { ok, label, targetTab, targetLabel, detail };
}

function status(
  id: WorkbenchSectionId,
  title: string,
  required: Criterion[],
  warnings: Criterion[] = [],
): SectionReadiness {
  return {
    id,
    title,
    isReady: required.every((item) => item.ok),
    fulfilled: required.filter((item) => item.ok).map(toReadinessItem),
    missing: required.filter((item) => !item.ok).map(toReadinessItem),
    warnings: warnings.filter((item) => !item.ok).map(toReadinessItem),
  };
}

function toReadinessItem(item: Criterion): ReadinessItem {
  return {
    label: item.label,
    targetTab: item.targetTab,
    targetLabel: item.targetLabel,
    detail: item.detail,
  };
}

function hasAnyCategory(categorySet: Set<AccountCategory>, categories: AccountCategory[]): boolean {
  return categories.some((category) => categorySet.has(category));
}
