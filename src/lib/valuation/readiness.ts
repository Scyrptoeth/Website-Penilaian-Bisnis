import type {
  AccountRow,
  AssumptionState,
  CaseProfile,
  CaseProfileDerived,
  FixedAssetScheduleSummary,
  MappedRow,
  Period,
} from "./case-model";
import { calculateRequiredReturnOnNtaAssumption, calculateWaccAssumption } from "./assumption-calculators";
import type { DlocPfcCalculation } from "./dloc-pfc";
import { resolveDlocPfcRate, type TaxSimulationState } from "./tax-simulation";
import type { AccountCategory, FinancialStatementSnapshot } from "./types";

export type WorkbenchSectionId =
  | "periods"
  | "balance"
  | "income"
  | "mapping"
  | "wacc"
  | "eemDcfAssumptions"
  | "valuationAam"
  | "valuationEemDcf"
  | "dlom"
  | "dlocPfc"
  | "taxSimulation"
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
  caseProfile,
  caseProfileDerived,
  dlocPfc,
  taxSimulation,
}: {
  periods: Period[];
  rows: AccountRow[];
  mappedRows: MappedRow[];
  assumptions: AssumptionState;
  snapshot: FinancialStatementSnapshot;
  fixedAssetSchedule: FixedAssetScheduleSummary;
  caseProfile: CaseProfile;
  caseProfileDerived: CaseProfileDerived;
  dlocPfc: DlocPfcCalculation;
  taxSimulation: TaxSimulationState;
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
  const hasWacc = assumptions.wacc.trim() !== "" || calculateWaccAssumption(assumptions) !== null;
  const hasWaccMarketInputs =
    assumptions.waccRiskFreeRate.trim() !== "" &&
    assumptions.waccEquityRiskPremium.trim() !== "" &&
    (assumptions.waccBeta.trim() !== "" ||
      (assumptions.waccComparable1BetaLevered.trim() !== "" &&
        assumptions.waccComparable1MarketCap.trim() !== "" &&
        assumptions.waccComparable1Debt.trim() !== "")) &&
    (assumptions.waccPreTaxCostOfDebt.trim() !== "" ||
      assumptions.waccBankPerseroInvestmentLoanRate.trim() !== "" ||
      assumptions.waccBankSwastaInvestmentLoanRate.trim() !== "" ||
      assumptions.waccBankUmumInvestmentLoanRate.trim() !== "");
  const hasTerminalGrowth = assumptions.terminalGrowth.trim() !== "";
  const hasRequiredReturn =
    assumptions.requiredReturnOnNta.trim() !== "" ||
    calculateRequiredReturnOnNtaAssumption(assumptions, {
      accountReceivable: snapshot.accountReceivable,
      inventory: snapshot.inventory,
      fixedAssetsNet: snapshot.fixedAssetsNet,
    }) !== null;
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

  const period = criterion(hasPeriod, "Periode aktif tersedia", "periods", "Isi Data Awal");
  const comparativePeriod = criterion(hasComparativePeriod, "Minimal dua periode untuk movement dan cash-flow bridge", "periods", "Tambah Periode");
  const balance = criterion(hasBalanceInput, "Data neraca / fixed asset tersedia", "balance", "Isi Neraca");
  const income = criterion(hasIncomeInput, "Data laba rugi tersedia", "income", "Isi Laba Rugi");
  const mapped = criterion(hasMappedAccount, "Akun sudah dipetakan atau siap ditinjau", "mapping", "Review Mapping");
  const anyAccount = criterion(hasAnyAccountInput, "Minimal satu akun/schedule sudah diinput", "balance", "Isi Akun");
  const taxRateForEemDcf = criterion(hasTaxRate, "Tarif pajak tersedia", "eemDcfAssumptions", "Isi Asumsi EEM/DCF");
  const taxRateForWacc = criterion(hasTaxRate, "Tarif pajak untuk after-tax cost of debt tersedia", "eemDcfAssumptions", "Isi Tarif Pajak");
  const wacc = criterion(hasWacc, "WACC tersedia", "wacc", "Isi WACC");
  const waccMarketInputs = criterion(hasWaccMarketInputs, "Input pasar WACC tersedia", "wacc", "Lengkapi WACC");
  const terminalGrowth = criterion(hasTerminalGrowth, "Terminal growth tersedia", "eemDcfAssumptions", "Isi Asumsi EEM/DCF");
  const requiredReturn = criterion(hasRequiredReturn, "Required return on NTA tersedia", "eemDcfAssumptions", "Isi Asumsi EEM/DCF");
  const workingCapitalDays = criterion(hasWorkingCapitalDays, "Driver hari modal kerja tersedia", "eemDcfAssumptions", "Isi Driver");
  const operatingWorkingCapital = criterion(
    hasOperatingWorkingCapitalBasis,
    "Basis operating working capital tersedia: AR/persediaan/AP/utang lain-lain",
    "balance",
    "Isi Neraca",
  );
  const fixedAssetOrDepreciation = criterion(
    hasFixedAssetOrDepreciationBasis,
    "Basis penyusutan/capex tersedia dari fixed asset atau beban penyusutan",
    "balance",
    "Isi Aset Tetap",
  );
  const dlocPfcRateResolution = resolveDlocPfcRate(taxSimulation, dlocPfc);
  const hasCompanyType = criterion(caseProfile.companyType.trim() !== "", "Jenis Perusahaan tersedia untuk basis DLOM dan rentang DLOC/PFC", "periods", "Isi Data Awal");
  const hasShareOwnershipType = criterion(
    caseProfile.shareOwnershipType.trim() !== "",
    "Jenis Kepemilikan Saham tersedia untuk basis interest DLOM dan status DLOC/PFC",
    "periods",
    "Isi Data Awal",
  );
  const hasDlocPfcAnswers = criterion(dlocPfc.factors.every((factor) => factor.status === "answered"), "Questionnaire DLOC/PFC lengkap", "dlocPfc", "Isi DLOC/PFC");
  const primaryMethod = criterion(taxSimulation.primaryMethod !== "", "Primary Method simulasi pajak dipilih", "taxSimulation", "Pilih Primary Method");
  const reportedTransferValue = criterion(
    taxSimulation.reportedTransferValue.trim() !== "" || caseProfile.capitalBaseValued.trim() !== "",
    "Nilai pengalihan dilaporkan tersedia",
    "taxSimulation",
    "Isi Nilai Pengalihan",
  );
  const shareRatio = criterion(
    caseProfileDerived.capitalProportionStatus === "valid",
    "Porsi saham/modal yang dinilai valid",
    "periods",
    "Isi Data Awal",
  );
  const dlocPfcReadyForTax = criterion(
    !taxSimulation.applyDlocPfc || dlocPfc.isComplete || dlocPfcRateResolution.hasValidOverride,
    "DLOC/PFC siap dipakai atau override beralasan tersedia",
    "dlocPfc",
    "Lengkapi DLOC/PFC",
  );

  return {
    periods: status("periods", "Data Awal", [period]),
    balance: status("balance", "Neraca & Aset Tetap", [period]),
    income: status("income", "Laba Rugi", [period, income]),
    mapping: status("mapping", "Pemetaan & Label", [anyAccount, mapped]),
    wacc: status("wacc", "WACC", [period, taxRateForWacc, waccMarketInputs, wacc]),
    eemDcfAssumptions: status("eemDcfAssumptions", "Asumsi EEM/DCF", [period], [
      taxRateForEemDcf,
      wacc,
      terminalGrowth,
      requiredReturn,
      workingCapitalDays,
    ]),
    valuationAam: status("valuationAam", "Penilaian AAM", [period, balance, mapped]),
    valuationEemDcf: status("valuationEemDcf", "Penilaian EEM/DCF", [
      period,
      balance,
      income,
      taxRateForEemDcf,
      wacc,
      terminalGrowth,
      requiredReturn,
      mapped,
    ]),
    dlom: status("dlom", "DLOM", [period, hasCompanyType, hasShareOwnershipType], [balance, income]),
    dlocPfc: status("dlocPfc", "DLOC/PFC", [period, hasCompanyType, hasShareOwnershipType, hasDlocPfcAnswers]),
    taxSimulation: status("taxSimulation", "Simulasi Potensi Pajak", [period], [
      balance,
      income,
      primaryMethod,
      reportedTransferValue,
      shareRatio,
      dlocPfcReadyForTax,
    ]),
    payablesCashFlow: status("payablesCashFlow", "Utang & Arus Kas", [
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
      taxRateForEemDcf,
      operatingWorkingCapital,
      fixedAssetOrDepreciation,
      mapped,
    ]),
    ratiosCapital: status("ratiosCapital", "Rasio & Efisiensi Modal", [period, balance, income, mapped], [comparativePeriod]),
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
