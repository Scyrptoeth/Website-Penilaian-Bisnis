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
import type { DlomCalculation } from "./dlom";
import type { DlocPfcCalculation } from "./dloc-pfc";
import type { TaxSimulationState } from "./tax-simulation";
import type { AccountCategory, FinancialStatementSnapshot } from "./types";

export type WorkbenchSectionId =
  | "periods"
  | "balance"
  | "fixedAssets"
  | "income"
  | "mapping"
  | "wacc"
  | "eemDcfAssumptions"
  | "valuationAam"
  | "valuationEem"
  | "valuationDcf"
  | "projectedIncome"
  | "projectedBalance"
  | "projectedFixedAssets"
  | "projectedCashFlow"
  | "dlom"
  | "dlocPfc"
  | "taxSimulation"
  | "cashFlowStatement"
  | "payablesCashFlow"
  | "noplatFcf"
  | "financialRatio"
  | "roic"
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
  dlom,
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
  dlom: DlomCalculation;
  dlocPfc: DlocPfcCalculation;
  taxSimulation: TaxSimulationState;
}): WorkbenchReadiness {
  const categorySet = new Set(mappedRows.map((item) => item.effectiveCategory));
  const hasPeriod = periods.length > 0;
  const hasComparativePeriod = periods.length >= 2;
  const hasAnyAccountInput = rows.length > 0 || fixedAssetSchedule.hasInput;
  const hasMappedAccount = mappedRows.some((item) => item.effectiveCategory !== "UNMAPPED") || fixedAssetSchedule.hasInput;
  const hasManualBalanceInput =
    rows.some((row) => row.statement === "balance_sheet") || snapshot.totalAssets !== 0 || snapshot.totalLiabilities !== 0;
  const hasBalanceInput = hasManualBalanceInput || fixedAssetSchedule.hasInput;
  const hasIncomeInput =
    rows.some((row) => row.statement === "income_statement") || snapshot.revenue !== 0 || snapshot.ebit !== 0 || snapshot.commercialNpat !== 0;
  const hasBalanceRows = rows.some((row) => row.statement === "balance_sheet") || fixedAssetSchedule.hasInput;
  const hasIncomeRowsOnly = rows.some((row) => row.statement === "income_statement") && !hasBalanceRows;
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
      assumptions.waccBankPemdaInvestmentLoanRate.trim() !== "" ||
      assumptions.waccBankSwastaInvestmentLoanRate.trim() !== "" ||
      assumptions.waccBankAsingInvestmentLoanRate.trim() !== "" ||
      assumptions.waccBankCampuranInvestmentLoanRate.trim() !== "" ||
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
  const hasFixedAssetOrDepreciationBasis =
    fixedAssetSchedule.rows.length > 0 ||
    fixedAssetSchedule.hasInput ||
    snapshot.fixedAssetsNet !== 0 ||
    hasAnyCategory(categorySet, ["FIXED_ASSET", "FIXED_ASSET_ACQUISITION", "ACCUMULATED_DEPRECIATION", "DEPRECIATION_EXPENSE"]);

  const period = criterion(hasPeriod, "Periode aktif tersedia", "periods", "Isi Data Awal");
  const comparativePeriod = criterion(hasComparativePeriod, "Minimal dua periode untuk movement dan cash-flow bridge", "periods", "Tambah Periode");
  const balanceTabInput = criterion(hasManualBalanceInput, "Data neraca tersedia", "balance", "Isi Neraca");
  const fixedAssetTabInput = criterion(
    fixedAssetSchedule.rows.length > 0 || fixedAssetSchedule.hasInput || hasFixedAssetOrDepreciationBasis,
    "Data aset tetap tersedia",
    "fixedAssets",
    "Isi Aset Tetap",
  );
  const balance = criterion(hasBalanceInput, "Data neraca atau aset tetap tersedia", "balance", "Isi Neraca");
  const income = criterion(hasIncomeInput, "Data laba rugi tersedia", "income", "Isi Laba Rugi");
  const mapped = criterion(
    hasMappedAccount,
    "Akun sudah dikategorikan atau siap ditinjau",
    hasIncomeRowsOnly ? "income" : "balance",
    "Tinjau Kategori Akun",
  );
  const anyAccount = criterion(hasAnyAccountInput, "Minimal satu akun/schedule sudah diinput", "balance", "Isi Akun");
  const taxRateForEemDcf = criterion(hasTaxRate, "Tarif pajak tersedia", "eemDcfAssumptions", "Isi Asumsi EEM/DCF");
  const taxRateForWacc = criterion(hasTaxRate, "Tarif pajak untuk after-tax cost of debt tersedia", "eemDcfAssumptions", "Isi Tarif Pajak");
  const wacc = criterion(hasWacc, "WACC tersedia", "wacc", "Isi WACC");
  const waccMarketInputs = criterion(hasWaccMarketInputs, "Input pasar WACC tersedia", "wacc", "Lengkapi WACC");
  const terminalGrowth = criterion(hasTerminalGrowth, "Terminal growth tersedia", "eemDcfAssumptions", "Isi Asumsi EEM/DCF");
  const requiredReturn = criterion(hasRequiredReturn, "Required return on NTA tersedia", "eemDcfAssumptions", "Isi Asumsi EEM/DCF");
  const workingCapitalDays = criterion(hasWorkingCapitalDays, "Driver hari modal kerja tersedia", "eemDcfAssumptions", "Isi Driver");
  const fixedAssetOrDepreciation = criterion(
    hasFixedAssetOrDepreciationBasis,
    "Basis penyusutan/capex tersedia dari fixed asset atau beban penyusutan",
    "fixedAssets",
    "Isi Aset Tetap",
  );
  const hasCompanyType = criterion(caseProfile.companyType.trim() !== "", "Jenis Perusahaan tersedia untuk basis DLOM dan rentang DLOC/PFC", "periods", "Isi Data Awal");
  const hasShareOwnershipType = criterion(
    caseProfile.shareOwnershipType.trim() !== "",
    "Jenis Kepemilikan Saham tersedia untuk basis interest DLOM dan status DLOC/PFC",
    "periods",
    "Isi Data Awal",
  );
  const hasDlocPfcAnswers = criterion(dlocPfc.factors.every((factor) => factor.status === "answered"), "Questionnaire DLOC/PFC lengkap", "dlocPfc", "Isi DLOC/PFC");
  const hasDlomAnswers = criterion(dlom.factors.every((factor) => factor.status === "answered"), "Questionnaire DLOM lengkap", "dlom", "Isi DLOM");
  const primaryMethod = criterion(taxSimulation.primaryMethod !== "", "Primary Method simulasi pajak dipilih", "taxSimulation", "Pilih Primary Method");
  const reportedTransferValue = criterion(
    taxSimulation.reportedTransferValue.trim() !== "" || (caseProfileDerived.capitalBaseValuedAmount ?? 0) > 0,
    "Nilai pengalihan dilaporkan tersedia",
    "periods",
    "Isi Nilai Pengalihan",
  );
  const shareValuePerShare = criterion(
    !caseProfileDerived.isShareTransfer || caseProfileDerived.shareValuePerShareStatus === "valid",
    "Nilai Saham Per Lembar tersedia untuk peralihan berbasis lembar saham",
    "periods",
    "Isi Data Awal",
  );
  const shareRatio = criterion(
    caseProfileDerived.capitalProportionStatus === "valid",
    "Porsi saham/modal yang dinilai valid",
    "periods",
    "Isi Data Awal",
  );
  const dlocPfcReadyForTax = criterion(
    dlocPfc.isComplete || (taxSimulation.finalBasis === "manualScenario" && taxSimulation.scenarioDlocPfcRate.trim() !== ""),
    "DLOC/PFC otomatis tersedia atau skenario manual memiliki rate pembanding",
    "dlocPfc",
    "Lengkapi DLOC/PFC",
  );
  const dlomReadyForTax = criterion(
    dlom.isComplete || (taxSimulation.finalBasis === "manualScenario" && taxSimulation.scenarioDlomRate.trim() !== ""),
    "DLOM otomatis tersedia atau skenario manual memiliki rate pembanding",
    "dlom",
    "Lengkapi DLOM",
  );

  return {
    periods: status("periods", "Data Awal", [period]),
    balance: status("balance", "Neraca", [period, balanceTabInput]),
    fixedAssets: status("fixedAssets", "Aset Tetap", [period, fixedAssetTabInput]),
    income: status("income", "Laba Rugi", [period, income]),
    mapping: status("mapping", "Kategorisasi Akun", [anyAccount, mapped]),
    wacc: status("wacc", "WACC", [period, taxRateForWacc, waccMarketInputs, wacc]),
    eemDcfAssumptions: status("eemDcfAssumptions", "Asumsi EEM/DCF", [period], [
      taxRateForEemDcf,
      wacc,
      terminalGrowth,
      requiredReturn,
      workingCapitalDays,
    ]),
    valuationAam: status("valuationAam", "Penilaian AAM", [period, balance]),
    valuationEem: status("valuationEem", "Penilaian EEM", [
      period,
      balance,
      income,
      taxRateForEemDcf,
      wacc,
      terminalGrowth,
      requiredReturn,
    ]),
    valuationDcf: status("valuationDcf", "Penilaian DCF", [
      period,
      balance,
      income,
      taxRateForEemDcf,
      wacc,
      terminalGrowth,
      requiredReturn,
    ]),
    projectedIncome: status("projectedIncome", "Proyeksi Laba Rugi", [
      period,
      income,
      taxRateForEemDcf,
    ]),
    projectedBalance: status("projectedBalance", "Proyeksi Neraca", [
      period,
      balance,
      income,
      workingCapitalDays,
      fixedAssetOrDepreciation,
    ]),
    projectedFixedAssets: status("projectedFixedAssets", "Proyeksi Aset Tetap", [
      period,
      balance,
      fixedAssetOrDepreciation,
    ]),
    projectedCashFlow: status("projectedCashFlow", "Proyeksi Cash Flow Statement", [
      period,
      balance,
      income,
      taxRateForEemDcf,
      workingCapitalDays,
      fixedAssetOrDepreciation,
    ]),
    dlom: status("dlom", "DLOM", [period, hasCompanyType, hasShareOwnershipType, hasDlomAnswers]),
    dlocPfc: status("dlocPfc", "DLOC/PFC", [period, hasCompanyType, hasShareOwnershipType, hasDlocPfcAnswers]),
    taxSimulation: status("taxSimulation", "Simulasi Potensi Pajak", [period, shareValuePerShare], [
      balance,
      income,
      primaryMethod,
      reportedTransferValue,
      shareRatio,
      dlomReadyForTax,
      dlocPfcReadyForTax,
    ]),
    cashFlowStatement: status("cashFlowStatement", "Cash Flow Statement", [
      period,
      comparativePeriod,
      balance,
      income,
      fixedAssetOrDepreciation,
    ]),
    payablesCashFlow: status("payablesCashFlow", "Jadwal Utang", [
      period,
      comparativePeriod,
      balance,
      income,
    ]),
    noplatFcf: status("noplatFcf", "NOPLAT & FCF", [
      period,
      comparativePeriod,
      income,
      taxRateForEemDcf,
      fixedAssetOrDepreciation,
    ]),
    financialRatio: status("financialRatio", "Financial Ratio", [period, balance, income], [comparativePeriod]),
    roic: status("roic", "ROIC", [period, balance, income], [comparativePeriod]),
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
