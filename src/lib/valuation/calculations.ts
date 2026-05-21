import type { AccountCategory, DcfForecastRow, FinancialStatementSnapshot, FormulaTrace, MethodOutput } from "./types";

export type IncomeProjectionYearOverrideInput = {
  revenueGrowth?: number;
  grossProfitMargin?: number;
  operatingExpenseMargin?: number;
  depreciationMargin?: number;
};

export type NonOperatingIncomeProjectionPolicy = "auto" | "recurring" | "non-recurring";

export type IncomeProjectionPresentationAssumptionsInput = {
  cashYield?: number;
  debtRate?: number;
  interestIncomeRevenueMargin?: number;
  interestExpenseRevenueMargin?: number;
  nonOperatingPolicy?: NonOperatingIncomeProjectionPolicy;
};

export type DcfWorkingCapitalCurrentAssetKey =
  | "cashOnHand"
  | "cashOnBankDeposit"
  | "accountReceivable"
  | "employeeReceivable"
  | "inventory"
  | "otherCurrentAssets";

export type DcfWorkingCapitalCurrentLiabilityKey =
  | "bankLoanShortTerm"
  | "accountPayable"
  | "taxPayable"
  | "otherPayable"
  | "bankLoanLongTerm";

export type DcfWorkingCapitalInclusionOptions = {
  currentAssets?: Partial<Record<DcfWorkingCapitalCurrentAssetKey, boolean>>;
  currentLiabilities?: Partial<Record<DcfWorkingCapitalCurrentLiabilityKey, boolean>>;
};

export type DcfOptions = {
  terminalGrowth?: number;
  wacc?: number;
  includeWorkingCapitalChange?: boolean;
  debtLikeTaxPayable?: boolean;
  workingCapitalInclusions?: DcfWorkingCapitalInclusionOptions;
  fixedAssetProjection?: Record<number, DcfFixedAssetProjectionInput>;
  fixedAssetProjectionSource?: string;
  projectionEngine?: "balance-reconciled" | "historical-derived";
  incomeProjectionOverrides?: Record<number, IncomeProjectionYearOverrideInput>;
  incomeProjectionPresentation?: IncomeProjectionPresentationAssumptionsInput;
};

type AamOptions = {
  assetAdjustment?: number;
  liabilityAdjustment?: number;
  equityManualAdjustment?: number;
  equityRevaluationAdjustment?: number;
  equityAdjustment?: number;
  adjustedBookEquityGap?: number;
  missingAdjustmentNotes?: number;
};

export type EemOptions = {
  adjustedAssetsExcludingCash?: number;
  adjustedLiabilitiesExcludingDebt?: number;
  depreciationAddBack?: number;
  currentAssetMovement?: number;
  currentLiabilityMovement?: number;
  capitalExpenditures?: number;
  capitalizationRate?: number;
  returnOnTangibleAsset?: number;
  returnOnTangibleAssetLabel?: string;
  returnOnTangibleAssetSource?: "required-return-on-nta" | "equity-cost";
};

type CalculationOptions = {
  aam?: AamOptions;
  eem?: EemOptions;
  dcf?: DcfOptions;
};

export type DcfFixedAssetProjectionInput = {
  depreciation: number;
  capitalExpenditure: number;
  fixedAssetGross?: number;
  accumulatedDepreciation?: number;
  fixedAssetsEnding: number;
};

export type ProjectionGovernanceLevel = "ok" | "review" | "critical";

export type ProjectionGovernanceDecision = "eligible-for-review" | "sensitivity-only" | "baseline-fallback";

export type ProjectionGovernanceMetric = {
  id: string;
  label: string;
  value: number;
  valueFormat: "currency" | "percent" | "number";
  level: ProjectionGovernanceLevel;
  threshold: string;
  note: string;
};

export type DcfProjectionGovernanceResult = {
  level: ProjectionGovernanceLevel;
  decision: ProjectionGovernanceDecision;
  title: string;
  summary: string;
  activeEngine: "balance-reconciled";
  sensitivityEngine: "historical-derived";
  governedEquityValue: number;
  baselineEquityValue: number;
  historicalDerivedEquityValue: number;
  absoluteVariance: number;
  relativeVariance: number;
  items: ProjectionGovernanceMetric[];
  traces: FormulaTrace[];
};

export type IncomeProjectionRelianceDecision = "eligible-for-approval" | "review-only" | "current-dcf-fallback";

export type IncomeProjectionRelianceGovernanceResult = {
  level: ProjectionGovernanceLevel;
  decision: IncomeProjectionRelianceDecision;
  title: string;
  summary: string;
  activeBasis: "current-dcf";
  stressBasis: "accounting-presentation-stress";
  governedEquityValue: number;
  currentDcfEquityValue: number;
  presentationStressEquityValue: number;
  absoluteVariance: number;
  relativeVariance: number;
  items: ProjectionGovernanceMetric[];
  traces: FormulaTrace[];
};

export function adjustedTotalAssets(snapshot: FinancialStatementSnapshot): number {
  const componentTotal =
    snapshot.cashOnHand +
    snapshot.cashOnBankDeposit +
    snapshot.accountReceivable +
    snapshot.employeeReceivable +
    snapshot.inventory +
    snapshot.fixedAssetsNet +
    snapshot.nonOperatingFixedAssets +
    snapshot.intangibleAssets +
    snapshot.excessCash +
    snapshot.marketableSecurities +
    snapshot.surplusAssetCash;

  return snapshot.totalAssets || componentTotal;
}

export function adjustedTotalLiabilities(snapshot: FinancialStatementSnapshot): number {
  const componentTotal =
    snapshot.bankLoanShortTerm +
    snapshot.accountPayable +
    snapshot.taxPayable +
    snapshot.otherPayable +
    snapshot.interestPayable +
    snapshot.bankLoanLongTerm;

  return snapshot.totalLiabilities || componentTotal;
}

export function operatingCurrentAssets(snapshot: FinancialStatementSnapshot): number {
  return snapshot.accountReceivable + snapshot.inventory;
}

export function operatingCurrentLiabilities(snapshot: FinancialStatementSnapshot): number {
  return snapshot.accountPayable + snapshot.otherPayable;
}

export function operatingWorkingCapital(snapshot: FinancialStatementSnapshot): number {
  return operatingCurrentAssets(snapshot) - operatingCurrentLiabilities(snapshot);
}

function isDcfWorkingCapitalCurrentAssetIncluded(
  inclusions: DcfWorkingCapitalInclusionOptions | undefined,
  key: DcfWorkingCapitalCurrentAssetKey,
): boolean {
  const explicit = inclusions?.currentAssets?.[key];

  if (typeof explicit === "boolean") {
    return explicit;
  }

  return key === "accountReceivable" || key === "inventory";
}

function isDcfWorkingCapitalCurrentLiabilityIncluded(
  inclusions: DcfWorkingCapitalInclusionOptions | undefined,
  key: DcfWorkingCapitalCurrentLiabilityKey,
): boolean {
  const explicit = inclusions?.currentLiabilities?.[key];

  if (typeof explicit === "boolean") {
    return explicit;
  }

  return key === "accountPayable" || key === "otherPayable";
}

function snapshotOtherCurrentAssets(snapshot: FinancialStatementSnapshot): number {
  return positiveResidual(
    snapshot.currentAssets,
    snapshot.cashOnHand +
      snapshot.cashOnBankDeposit +
      snapshot.accountReceivable +
      snapshot.employeeReceivable +
      snapshot.inventory,
  );
}

function selectedSnapshotWorkingCapitalComponents(
  snapshot: FinancialStatementSnapshot,
  inclusions: DcfWorkingCapitalInclusionOptions | undefined,
): { currentAssets: number; currentLiabilities: number } {
  const currentAssets =
    (isDcfWorkingCapitalCurrentAssetIncluded(inclusions, "cashOnHand") ? snapshot.cashOnHand : 0) +
    (isDcfWorkingCapitalCurrentAssetIncluded(inclusions, "cashOnBankDeposit") ? snapshot.cashOnBankDeposit : 0) +
    (isDcfWorkingCapitalCurrentAssetIncluded(inclusions, "accountReceivable") ? snapshot.accountReceivable : 0) +
    (isDcfWorkingCapitalCurrentAssetIncluded(inclusions, "employeeReceivable") ? snapshot.employeeReceivable : 0) +
    (isDcfWorkingCapitalCurrentAssetIncluded(inclusions, "inventory") ? snapshot.inventory : 0) +
    (isDcfWorkingCapitalCurrentAssetIncluded(inclusions, "otherCurrentAssets") ? snapshotOtherCurrentAssets(snapshot) : 0);
  const currentLiabilities =
    (isDcfWorkingCapitalCurrentLiabilityIncluded(inclusions, "bankLoanShortTerm") ? snapshot.bankLoanShortTerm : 0) +
    (isDcfWorkingCapitalCurrentLiabilityIncluded(inclusions, "accountPayable") ? snapshot.accountPayable : 0) +
    (isDcfWorkingCapitalCurrentLiabilityIncluded(inclusions, "taxPayable") ? snapshot.taxPayable : 0) +
    (isDcfWorkingCapitalCurrentLiabilityIncluded(inclusions, "otherPayable") ? snapshot.otherPayable + snapshot.interestPayable : 0) +
    (isDcfWorkingCapitalCurrentLiabilityIncluded(inclusions, "bankLoanLongTerm") ? snapshot.bankLoanLongTerm : 0);

  return { currentAssets, currentLiabilities };
}

function selectedForecastCurrentAssets(
  inclusions: DcfWorkingCapitalInclusionOptions | undefined,
  values: Record<DcfWorkingCapitalCurrentAssetKey, number>,
): number {
  return (Object.entries(values) as Array<[DcfWorkingCapitalCurrentAssetKey, number]>).reduce(
    (sum, [key, value]) => sum + (isDcfWorkingCapitalCurrentAssetIncluded(inclusions, key) ? value : 0),
    0,
  );
}

function selectedForecastCurrentLiabilities(
  inclusions: DcfWorkingCapitalInclusionOptions | undefined,
  values: Record<DcfWorkingCapitalCurrentLiabilityKey, number>,
): number {
  return (Object.entries(values) as Array<[DcfWorkingCapitalCurrentLiabilityKey, number]>).reduce(
    (sum, [key, value]) => sum + (isDcfWorkingCapitalCurrentLiabilityIncluded(inclusions, key) ? value : 0),
    0,
  );
}

export function nonOperatingAssets(snapshot: FinancialStatementSnapshot): number {
  return (
    snapshot.cashOnHand +
    snapshot.cashOnBankDeposit +
    snapshot.excessCash +
    snapshot.surplusAssetCash +
    snapshot.marketableSecurities +
    snapshot.employeeReceivable +
    snapshot.nonOperatingFixedAssets
  );
}

export function interestBearingDebt(snapshot: FinancialStatementSnapshot): number {
  return snapshot.bankLoanShortTerm + snapshot.bankLoanLongTerm;
}

export function corporateTaxExpenseForNoplat(snapshot: FinancialStatementSnapshot): number {
  return snapshot.hasCorporateTaxInput ? Math.abs(snapshot.corporateTax) : snapshot.ebit * snapshot.taxRate;
}

export function normalizedNoplat(snapshot: FinancialStatementSnapshot): number {
  return snapshot.ebit - corporateTaxExpenseForNoplat(snapshot);
}

const eemTangibleAssetCategories: AccountCategory[] = [
  "FIXED_ASSET",
  "ACCOUNT_RECEIVABLE",
  "INVENTORY",
  "ACCOUNT_PAYABLE",
  "OTHER_PAYABLE",
];

const eemIncomeCategories: AccountCategory[] = [
  "EBIT",
  "REVENUE",
  "COST_OF_GOOD_SOLD",
  "SELLING_EXPENSE",
  "GENERAL_ADMINISTRATIVE_OVERHEADS",
  "OPERATING_EXPENSE",
  "DEPRECIATION_EXPENSE",
];

const eemNonOperatingAssetCategories: AccountCategory[] = [
  "CASH_ON_HAND",
  "CASH_ON_BANK",
  "OTHER_RECEIVABLE",
  "EMPLOYEE_RECEIVABLE",
  "EXCESS_CASH",
  "SURPLUS_ASSET_CASH",
  "MARKETABLE_SECURITIES",
  "NON_OPERATING_FIXED_ASSETS",
];

const eemDebtCategories: AccountCategory[] = [
  "BANK_LOAN_SHORT_TERM",
  "BANK_LOAN_LONG_TERM",
  "INTEREST_BEARING_DEBT",
];

export function calculateAam(snapshot: FinancialStatementSnapshot, options: AamOptions = {}): MethodOutput {
  const historicalAssets = adjustedTotalAssets(snapshot);
  const historicalLiabilities = adjustedTotalLiabilities(snapshot);
  const assetAdjustment = options.assetAdjustment ?? 0;
  const liabilityAdjustment = options.liabilityAdjustment ?? 0;
  const equityManualAdjustment = options.equityManualAdjustment ?? 0;
  const equityRevaluationAdjustment = options.equityRevaluationAdjustment ?? assetAdjustment - liabilityAdjustment - equityManualAdjustment;
  const equityAdjustment = options.equityAdjustment ?? equityManualAdjustment + equityRevaluationAdjustment;
  const totalAssets = historicalAssets + assetAdjustment;
  const totalLiabilities = historicalLiabilities + liabilityAdjustment;
  const adjustedBookEquity = snapshot.bookEquity + equityAdjustment;
  const totalLiabilitiesAndEquity = totalLiabilities + adjustedBookEquity;
  const balanceGap = totalAssets - totalLiabilitiesAndEquity;
  const equityValue = totalAssets - totalLiabilities;
  const traces: FormulaTrace[] = [
    {
      label: "Aset historis basis AAM",
      formula: "Input total aset atau jumlah komponen aset bila total aset kosong",
      value: historicalAssets,
      note: "Basis historis berasal dari tab Neraca dan Aset Tetap pada periode aktif.",
    },
    {
      label: "Penyesuaian aset AAM",
      formula: "Jumlah kolom Penyesuaian untuk pos aset AAM",
      value: assetAdjustment,
      note: "Nilai positif menaikkan aset disesuaikan; nilai negatif menurunkan aset disesuaikan.",
    },
    {
      label: "Total aset disesuaikan",
      formula: "Aset historis + penyesuaian aset",
      value: totalAssets,
      note: "Adjustment AAM tidak mengubah snapshot global untuk EEM/DCF.",
    },
    {
      label: "Liabilitas historis basis AAM",
      formula: "Input total liabilitas atau jumlah komponen liabilitas bila total liabilitas kosong",
      value: historicalLiabilities,
      note: "AAM mengurangkan seluruh liabilitas, termasuk utang pajak dan utang berbunga.",
    },
    {
      label: "Penyesuaian liabilitas AAM",
      formula: "Jumlah kolom Penyesuaian untuk pos liabilitas AAM",
      value: liabilityAdjustment,
      note: "Nilai positif menaikkan liabilitas; nilai negatif menurunkan liabilitas.",
    },
    {
      label: "Total liabilitas disesuaikan",
      formula: "Liabilitas historis + penyesuaian liabilitas",
      value: totalLiabilities,
      note: "Adjustment AAM hanya berlaku di metode AAM dan jejak audit AAM.",
    },
    {
      label: "Ekuitas historis basis AAM",
      formula: "Modal disetor + tambahan modal disetor + saldo laba + laba tahun berjalan",
      value: snapshot.bookEquity,
      note: "Basis ekuitas berasal dari pos ekuitas Neraca pada periode aktif.",
    },
    {
      label: "Penyesuaian ekuitas manual AAM",
      formula: "Jumlah kolom Penyesuaian untuk pos ekuitas AAM selain Changes on Asset Revaluation",
      value: equityManualAdjustment,
      note: "Nilai positif menaikkan pos ekuitas manual; baris revaluasi otomatis mengimbangi dengan tanda berlawanan.",
    },
    {
      label: "Changes on Asset Revaluation",
      formula: "Penyesuaian aset - penyesuaian liabilitas - penyesuaian ekuitas manual",
      value: equityRevaluationAdjustment,
      note: "Baris read-only agar Ekuitas merekonsiliasi dampak penyesuaian Aset, Liabilitas, dan Ekuitas.",
    },
    {
      label: "Total ekuitas disesuaikan",
      formula: "Ekuitas historis + penyesuaian ekuitas manual + Changes on Asset Revaluation",
      value: adjustedBookEquity,
      note:
        options.adjustedBookEquityGap && Math.abs(options.adjustedBookEquityGap) >= 0.5
          ? `Masih terdapat selisih rekonsiliasi ekuitas ${options.adjustedBookEquityGap}.`
          : "Setelah revaluasi otomatis, ekuitas mengikuti perubahan bersih aset dan liabilitas.",
    },
    {
      label: "Total liabilitas + ekuitas disesuaikan",
      formula: "Total liabilitas disesuaikan + total ekuitas disesuaikan",
      value: totalLiabilitiesAndEquity,
      note: "Kontrol persamaan neraca AAM untuk memastikan sisi kredit terbaca utuh.",
    },
    {
      label: "Selisih balance AAM",
      formula: "Total aset disesuaikan - total liabilitas + ekuitas disesuaikan",
      value: balanceGap,
      note:
        Math.abs(balanceGap) < 0.5
          ? "Total aset sama dengan total liabilitas + ekuitas."
          : "Selisih menunjukkan neraca sumber atau mapping AAM belum balance.",
    },
    {
      label: "Nilai Ekuitas 100% - AAM",
      formula: "Total aset disesuaikan - total liabilitas disesuaikan",
      value: equityValue,
      note:
        options.missingAdjustmentNotes && options.missingAdjustmentNotes > 0
          ? `${options.missingAdjustmentNotes} penyesuaian masih perlu catatan/alasan. DLOM/DLOC tidak diterapkan.`
          : "DLOM/DLOC tidak diterapkan.",
    },
  ];

  return { method: "AAM", equityValue, traces };
}

export function calculateEem(snapshot: FinancialStatementSnapshot, options: EemOptions = {}): MethodOutput {
  const adjustedAssetsExcludingCash =
    options.adjustedAssetsExcludingCash ?? adjustedTotalAssets(snapshot) - snapshot.cashOnHand - snapshot.cashOnBankDeposit;
  const adjustedLiabilitiesExcludingDebt =
    options.adjustedLiabilitiesExcludingDebt ?? adjustedTotalLiabilities(snapshot) - interestBearingDebt(snapshot);
  const netOperatingTangibleAssets = adjustedAssetsExcludingCash - adjustedLiabilitiesExcludingDebt;
  const noplat = normalizedNoplat(snapshot);
  const depreciationAddBack = options.depreciationAddBack ?? Math.max(0, -snapshot.depreciation);
  const grossCashFlow = noplat + depreciationAddBack;
  const currentAssetMovement = options.currentAssetMovement ?? 0;
  const currentLiabilityMovement = options.currentLiabilityMovement ?? 0;
  const totalNetChangesInWorkingCapital = currentAssetMovement + currentLiabilityMovement;
  const capitalExpenditures = options.capitalExpenditures ?? 0;
  const grossInvestment = totalNetChangesInWorkingCapital + capitalExpenditures;
  const freeCashFlow = grossCashFlow + grossInvestment;
  const returnOnTangibleAsset = options.returnOnTangibleAsset ?? snapshot.requiredReturnOnNta;
  const returnOnTangibleAssetLabel = options.returnOnTangibleAssetLabel ?? "Kalkulator required return on NTA";
  const isEquityCostReturnOnTangibleAsset = options.returnOnTangibleAssetSource === "equity-cost";
  const requiredReturn = netOperatingTangibleAssets * returnOnTangibleAsset;
  const excessEarnings = freeCashFlow - requiredReturn;
  const capitalizationRate = options.capitalizationRate ?? snapshot.wacc;
  const capitalizedExcess = capitalizationRate > 0 ? excessEarnings / capitalizationRate : 0;
  const enterpriseValue = netOperatingTangibleAssets + capitalizedExcess;
  const nonOperatingAssetValue = nonOperatingAssets(snapshot);
  const interestBearingDebtValue = interestBearingDebt(snapshot);
  const equityValue = enterpriseValue + nonOperatingAssetValue - interestBearingDebtValue;

  const traces: FormulaTrace[] = [
    {
      id: "eem-net-tangible-asset-value",
      label: "Nett Tangible Asset Value",
      formula: "Total aset disesuaikan AAM tanpa cash on hand/bank - total liabilitas disesuaikan AAM tanpa bank loan ST/LT",
      value: netOperatingTangibleAssets,
      note: "Basis aset berwujud EEM memakai total AAM disesuaikan tahun aktif; cash on hand/bank dan bank loan short/long term dikeluarkan dari dasar NTA.",
      sourceTabs: ["Penilaian AAM", "Neraca", "Aset Tetap", "Kategorisasi Akun"],
      accountCategories: [
        "TOTAL_ASSETS",
        "TOTAL_LIABILITIES",
        "CASH_ON_HAND",
        "CASH_ON_BANK",
        "BANK_LOAN_SHORT_TERM",
        "BANK_LOAN_LONG_TERM",
      ],
      workbookReference: "EEM!D7 / AAM adjusted total assets/liabilities, excluding cash and bank loans",
      treatment: "Operating tangible asset base",
      traceLevel: "subtotal",
    },
    {
      id: "eem-return-on-tangible-asset",
      label: "Return on Tangible Asset",
      formula: isEquityCostReturnOnTangibleAsset
        ? "Return ekuitas aset berwujud aktif"
        : "Kalkulator required return on NTA aktif",
      value: returnOnTangibleAsset,
      note: isEquityCostReturnOnTangibleAsset
        ? "Rate memakai Ke / biaya modal ekuitas aset berwujud dari WACC, sesuai pilihan reviewer di Penilaian EEM."
        : "Rate memakai blended return dari kapasitas utang dan ekuitas atas NTA, sesuai pilihan reviewer di Penilaian EEM.",
      valueFormat: "percent",
      sourceTabs: isEquityCostReturnOnTangibleAsset ? ["WACC", "Asumsi EEM/DCF"] : ["Asumsi EEM/DCF", "WACC"],
      workbookReference: isEquityCostReturnOnTangibleAsset
        ? "DISCOUNT RATE Ke / BORROWING CAP equity cost"
        : "EEM!C8 / STAT_EEM!B15 / assumptions driver / BORROWING CAP F14",
      treatment: returnOnTangibleAssetLabel,
      traceLevel: "assumption",
    },
    {
      id: "eem-earning-return-on-nta",
      label: "Earning Return on Nett Tangible Asset",
      formula: "NTA x return on tangible asset",
      value: requiredReturn,
      note: "Capital charge untuk aset berwujud operasional sebelum menghitung excess earning.",
      sourceTabs: ["Penilaian EEM", "Asumsi EEM/DCF"],
      accountCategories: eemTangibleAssetCategories,
      workbookReference: "EEM!D9",
      treatment: "Tangible asset capital charge",
      traceLevel: "calculation",
    },
    {
      id: "eem-noplat",
      label: "NOPLAT",
      formula: "EBIT komersial - pajak penghasilan badan",
      value: noplat,
      note: "Earning power komersial; pajak penghasilan badan dibaca dari Laba Rugi tahun aktif bila tersedia, lalu interest income, interest expense, dan non-operating income dikeluarkan dari operasi.",
      sourceTabs: ["Laba Rugi", "NOPLAT & FCF", "Asumsi EEM/DCF"],
      accountCategories: eemIncomeCategories,
      workbookReference: "EEM!D12 / STAT_EEM!B14 / INCOME STATEMENT!E22 / tax assumption",
      treatment: "Operating after-tax earnings",
      traceLevel: "calculation",
    },
    {
      id: "eem-depreciation",
      label: "Depreciation",
      formula: "Penambahan pada B. Penyusutan tahun aktif",
      value: depreciationAddBack,
      note: "Add-back depresiasi mengikuti baris penambahan penyusutan pada jadwal aset tetap tahun aktif.",
      sourceTabs: ["Laba Rugi", "Aset Tetap", "Penilaian EEM"],
      accountCategories: ["DEPRECIATION_EXPENSE", "ACCUMULATED_DEPRECIATION"],
      workbookReference: "EEM!D13 / FIXED ASSET B. Depreciation - Additions",
      treatment: "Fixed asset schedule add-back",
      traceLevel: "bridge",
    },
    {
      id: "eem-gross-cash-flow",
      label: "Gross Cash Flow",
      formula: "NOPLAT + depreciation",
      value: grossCashFlow,
      note: "Arus kas bruto EEM menjumlahkan NOPLAT dan add-back depresiasi tahun aktif.",
      sourceTabs: ["NOPLAT & FCF", "Penilaian EEM"],
      accountCategories: [...eemIncomeCategories, "DEPRECIATION_EXPENSE"],
      workbookReference: "EEM!D14",
      treatment: "Cash-flow bridge subtotal",
      traceLevel: "subtotal",
    },
    {
      id: "eem-increase-decrease-current-asset",
      label: "(Increase) Decrease in Current Asset",
      formula: "Baris CFS: (Kenaikan) penurunan aset lancar operasional",
      value: currentAssetMovement,
      note: "Mengambil nilai final tahun aktif dari Cash Flow Statement, termasuk checklist akun aset lancar dan override reviewer bila ada.",
      sourceTabs: ["Cash Flow Statement"],
      accountCategories: [
        "CURRENT_ASSET",
        "CASH_ON_HAND",
        "CASH_ON_BANK",
        "ACCOUNT_RECEIVABLE",
        "OTHER_RECEIVABLE",
        "EMPLOYEE_RECEIVABLE",
        "INVENTORY",
        "EXCESS_CASH",
        "MARKETABLE_SECURITIES",
        "SURPLUS_ASSET_CASH",
      ],
      workbookReference: "EEM!D17 / CASH FLOW STATEMENT working-capital OCA row",
      treatment: "Cash-flow statement driver",
      traceLevel: "bridge",
    },
    {
      id: "eem-increase-decrease-current-liabilities",
      label: "Increase (Decrease) in Current Liabilities",
      formula: "Baris CFS: Kenaikan (penurunan) liabilitas lancar operasional",
      value: currentLiabilityMovement,
      note: "Mengambil nilai final tahun aktif dari Cash Flow Statement, termasuk checklist akun liabilitas lancar dan override reviewer bila ada.",
      sourceTabs: ["Cash Flow Statement"],
      accountCategories: [
        "CURRENT_LIABILITIES",
        "BANK_LOAN_SHORT_TERM",
        "ACCOUNT_PAYABLE",
        "TAX_PAYABLE",
        "OTHER_PAYABLE",
        "INTEREST_PAYABLE",
        "BANK_LOAN_LONG_TERM",
        "INTEREST_BEARING_DEBT",
      ],
      workbookReference: "EEM!D18 / CASH FLOW STATEMENT working-capital OCL row",
      treatment: "Cash-flow statement driver",
      traceLevel: "bridge",
    },
    {
      id: "eem-total-net-changes-working-capital",
      label: "Total Net Changes in Working Capital",
      formula: "(Increase) decrease in current asset + increase (decrease) in current liabilities",
      value: totalNetChangesInWorkingCapital,
      note: "Subtotal modal kerja bersih mengikuti instruksi workbook review: baris aset lancar ditambah baris liabilitas lancar.",
      sourceTabs: ["NOPLAT & FCF", "Penilaian EEM"],
      accountCategories: [
        "CURRENT_ASSET",
        "CASH_ON_HAND",
        "CASH_ON_BANK",
        "ACCOUNT_RECEIVABLE",
        "OTHER_RECEIVABLE",
        "EMPLOYEE_RECEIVABLE",
        "INVENTORY",
        "EXCESS_CASH",
        "MARKETABLE_SECURITIES",
        "SURPLUS_ASSET_CASH",
        "CURRENT_LIABILITIES",
        "BANK_LOAN_SHORT_TERM",
        "ACCOUNT_PAYABLE",
        "TAX_PAYABLE",
        "OTHER_PAYABLE",
        "INTEREST_PAYABLE",
        "BANK_LOAN_LONG_TERM",
        "INTEREST_BEARING_DEBT",
      ],
      workbookReference: "EEM!D19",
      treatment: "Cash-flow bridge subtotal",
      traceLevel: "subtotal",
    },
    {
      id: "eem-capital-expenditures",
      label: "Capital Expenditures",
      formula: "Penambahan pada A. Biaya Perolehan tahun aktif",
      value: capitalExpenditures,
      note: "Capex EEM mengikuti penambahan biaya perolehan aset tetap tahun aktif; nilai disajikan sebagai efek arus kas investasi.",
      sourceTabs: ["Aset Tetap", "Proyeksi Aset Tetap", "Penilaian EEM"],
      accountCategories: ["FIXED_ASSET", "FIXED_ASSET_ACQUISITION", "ACCUMULATED_DEPRECIATION"],
      workbookReference: "EEM!D21 / FIXED ASSET A. Acquisition Costs - Additions",
      treatment: "Fixed asset schedule driver",
      traceLevel: "bridge",
    },
    {
      id: "eem-gross-investment",
      label: "Gross Investment",
      formula: "Total net changes in working capital + capital expenditures",
      value: grossInvestment,
      note: "Signed reinvestment bridge yang ditambahkan ke gross cash flow untuk mendapat FCF EEM.",
      sourceTabs: ["NOPLAT & FCF", "Proyeksi Aset Tetap", "Penilaian EEM"],
      accountCategories: ["ACCOUNT_RECEIVABLE", "INVENTORY", "ACCOUNT_PAYABLE", "OTHER_PAYABLE", "FIXED_ASSET"],
      workbookReference: "EEM!D23",
      treatment: "Cash-flow bridge subtotal",
      traceLevel: "subtotal",
    },
    {
      id: "eem-free-cash-flow",
      label: "Free Cash Flow",
      formula: "Gross cash flow + gross investment",
      value: freeCashFlow,
      note: "FCF EEM menjadi earning base sebelum tangible asset capital charge.",
      sourceTabs: ["NOPLAT & FCF", "Penilaian EEM"],
      accountCategories: [...eemIncomeCategories, ...eemTangibleAssetCategories],
      workbookReference: "EEM!D25",
      treatment: "EEM earning base",
      traceLevel: "calculation",
    },
    {
      id: "eem-excess-earning",
      label: "Excess Earning",
      formula: "Free cash flow - earning return on NTA",
      value: excessEarnings,
      note: "Laba lebih yang dianggap dihasilkan oleh aset tidak berwujud/ekonomi goodwill.",
      sourceTabs: ["Penilaian EEM", "NOPLAT & FCF", "Asumsi EEM/DCF"],
      accountCategories: [...eemIncomeCategories, ...eemTangibleAssetCategories],
      workbookReference: "EEM!D27 / STAT_EEM!B17",
      treatment: "Intangible earnings premium",
      traceLevel: "calculation",
    },
    {
      id: "eem-capitalization-rate",
      label: "Capitalization Rate",
      formula: "Basis WACC aktif",
      value: capitalizationRate,
      note: "Rate kapitalisasi EEM mengikuti Basis WACC Aktif dari tab WACC.",
      valueFormat: "percent",
      sourceTabs: ["WACC", "Asumsi EEM/DCF"],
      workbookReference: "EEM!C28 / WACC active basis",
      treatment: "Assumption driver",
      traceLevel: "assumption",
    },
    {
      id: "eem-capitalized-excess-earning",
      label: "Capitalized Excess Earning",
      formula: "IF(capitalization rate > 0, excess earning / capitalization rate, 0)",
      value: capitalizedExcess,
      note: "Kapitalisasi laba lebih; rate nol/negatif ditahan ke nol untuk mencegah nilai tidak valid.",
      sourceTabs: ["Penilaian EEM", "Asumsi EEM/DCF"],
      accountCategories: [...eemIncomeCategories, ...eemTangibleAssetCategories],
      workbookReference: "EEM!D29 / STAT_EEM!B19",
      treatment: "Capitalized intangible value",
      traceLevel: "calculation",
    },
    {
      id: "eem-enterprise-value",
      label: "Enterprise Value",
      formula: "NTA + capitalized excess earning",
      value: enterpriseValue,
      note: "Nilai operasi sebelum bridge aset non-operasional dan utang berbunga.",
      sourceTabs: ["Penilaian EEM"],
      accountCategories: [...eemTangibleAssetCategories, ...eemIncomeCategories],
      workbookReference: "EEM!D31 / STAT_EEM!B20",
      treatment: "Operating enterprise value",
      traceLevel: "subtotal",
    },
    {
      id: "eem-interest-bearing-debt",
      label: "Interest Bearing Debt",
      formula: "Pinjaman bank jangka pendek + pinjaman bank jangka panjang",
      value: interestBearingDebtValue,
      note: "Debt dikeluarkan dari operating WC dan dikurangkan dari enterprise value pada bridge ekuitas; workbook EEM menyajikan row ini dengan tanda negatif.",
      sourceTabs: ["Neraca", "Jadwal Utang"],
      accountCategories: eemDebtCategories,
      workbookReference: "EEM!D32 / STAT_EEM!B21 / BALANCE SHEET!E30,E37",
      treatment: "Deducted in equity bridge",
      traceLevel: "bridge",
    },
    {
      id: "eem-non-operating-asset",
      label: "Non Operating Asset",
      formula: "Cash/deposit + surplus cash + marketable securities + employee receivable + non-operating fixed assets",
      value: nonOperatingAssetValue,
      note: "Aset non-operasional ditambahkan setelah EV; minimum operating cash tetap area judgment reviewer.",
      sourceTabs: ["Neraca", "Kategorisasi Akun", "Penilaian EEM"],
      accountCategories: eemNonOperatingAssetCategories,
      workbookReference: "EEM!D33 / STAT_EEM!B11 / BALANCE SHEET!E8,E9,E11",
      treatment: "Added after enterprise value",
      traceLevel: "bridge",
    },
    {
      id: "eem-equity-value-100",
      label: "Equity Value (100%)",
      formula: "Enterprise value + non-operating asset - interest-bearing debt",
      value: equityValue,
      note: "DLOM/DLOC tidak diterapkan pada base EEM; skenario utang pajak debt-like ditampilkan sebagai sensitivitas terpisah.",
      sourceTabs: ["Penilaian EEM", "Diskon & Pajak"],
      accountCategories: [...eemNonOperatingAssetCategories, ...eemDebtCategories],
      workbookReference: "EEM!D34 / STAT_EEM!B22",
      treatment: "Final 100% equity bridge",
      traceLevel: "final",
    },
  ];

  return { method: "EEM", equityValue, traces };
}

export function buildDcfForecast(snapshot: FinancialStatementSnapshot, options: DcfOptions = {}): DcfForecastRow[] {
  const rows: DcfForecastRow[] = [];
  const selectedHistoricalWorkingCapital = selectedSnapshotWorkingCapitalComponents(
    snapshot,
    options.workingCapitalInclusions,
  );
  let previousRevenue = snapshot.revenue;
  let previousOperatingCurrentAssets = selectedHistoricalWorkingCapital.currentAssets;
  let previousOperatingCurrentLiabilities = selectedHistoricalWorkingCapital.currentLiabilities;
  let previousNwc = previousOperatingCurrentAssets - previousOperatingCurrentLiabilities;
  let previousFixedAssetsNet = snapshot.fixedAssetsNet;
  let previousFixedAssetGross = snapshot.fixedAssetAcquisition || snapshot.fixedAssetsNet + snapshot.accumulatedDepreciation;
  let previousAccumulatedDepreciation = snapshot.accumulatedDepreciation;
  let previousRetainedEarningsEnding = snapshot.retainedEarningsSurplus + snapshot.retainedEarningsCurrentProfit;
  let previousTaxPayableEnding = snapshot.taxPayable;
  let previousCapitalBalance = snapshot.paidUpCapital + snapshot.additionalPaidInCapital;
  let previousDebtEndingBalance = interestBearingDebt(snapshot);
  let previousShareholdersEquityEnding =
    snapshot.paidUpCapital + snapshot.additionalPaidInCapital + previousRetainedEarningsEnding;
  const includeWorkingCapitalChange = options.includeWorkingCapitalChange ?? true;
  const useHistoricalDerivedProjection = options.projectionEngine === "historical-derived";
  const wacc = options.wacc ?? snapshot.wacc;
  const startYear = forecastStartYear(snapshot);
  const baseCash = snapshot.cashOnHand + snapshot.cashOnBankDeposit;
  const interestIncomeCashYield =
    finiteOption(options.incomeProjectionPresentation?.cashYield) ??
    (snapshot.interestIncomeCashYield || safeRatio(snapshot.interestIncome, baseCash));
  const interestIncomeRevenueMargin =
    finiteOption(options.incomeProjectionPresentation?.interestIncomeRevenueMargin) ??
    (snapshot.interestIncomeRevenueMargin || safeRatio(snapshot.interestIncome, snapshot.revenue));
  const baseInterestBearingDebt = interestBearingDebt(snapshot);
  const interestExpenseDebtRate =
    finiteOption(options.incomeProjectionPresentation?.debtRate) ??
    (snapshot.interestExpenseDebtRate ||
      (baseInterestBearingDebt > 0 ? safeAbsRatio(snapshot.interestExpense, baseInterestBearingDebt) : 0));
  const interestExpenseRevenueMargin =
    finiteOption(options.incomeProjectionPresentation?.interestExpenseRevenueMargin) ??
    (snapshot.interestExpenseRevenueMargin || safeRatio(snapshot.interestExpense, snapshot.revenue));
  const nonOperatingIncomeRevenueMargin = resolveNonOperatingIncomeRevenueMargin(
    snapshot,
    options.incomeProjectionPresentation?.nonOperatingPolicy,
  );
  let previousCashEndingBalance = baseCash;
  const cashOnHandShare = baseCash > 0 ? snapshot.cashOnHand / baseCash : 0;
  const otherCurrentAssetsBase = positiveResidual(
    snapshot.currentAssets,
    snapshot.cashOnHand +
      snapshot.cashOnBankDeposit +
      snapshot.accountReceivable +
      snapshot.employeeReceivable +
      snapshot.inventory,
  );
  const otherNonCurrentAssetsBase = positiveResidual(
    snapshot.nonCurrentAssets,
    snapshot.fixedAssetsNet + snapshot.intangibleAssets,
  );
  const otherNonCurrentLiabilitiesBase = positiveResidual(snapshot.nonCurrentLiabilities, snapshot.bankLoanLongTerm);

  for (let period = 1; period <= 5; period += 1) {
    const year = startYear + period;
    const fixedAssetProjection = options.fixedAssetProjection?.[year];
    const incomeProjectionOverride = options.incomeProjectionOverrides?.[year];
    const revenueGrowth = finiteOption(incomeProjectionOverride?.revenueGrowth) ?? snapshot.revenueGrowth;
    const grossProfitMargin = finiteOption(incomeProjectionOverride?.grossProfitMargin);
    const operatingExpenseMargin = finiteOption(incomeProjectionOverride?.operatingExpenseMargin);
    const depreciationMargin = finiteOption(incomeProjectionOverride?.depreciationMargin);
    const revenue = previousRevenue * (1 + revenueGrowth);
    const cogs = grossProfitMargin === undefined ? revenue * snapshot.cogsMargin : revenue * (1 - grossProfitMargin);
    const operatingExpenses = revenue * (operatingExpenseMargin ?? snapshot.gaMargin);
    const depreciation = depreciationMargin === undefined
      ? fixedAssetProjection?.depreciation ?? revenue * snapshot.depreciationMargin
      : revenue * depreciationMargin;
    const grossProfit = revenue - cogs;
    const ebit = grossProfit - operatingExpenses - depreciation;
    const statutoryTaxOnEbit = ebit * snapshot.taxRate;
    const taxExpenseForPayable = Math.max(0, statutoryTaxOnEbit);
    const historicalTaxPayableTarget = taxExpenseForPayable * Math.max(0, snapshot.taxPayableToTaxExpenseRatio || 1);
    const maximumTaxPayable = previousTaxPayableEnding + taxExpenseForPayable;
    const taxPayable = useHistoricalDerivedProjection
      ? Math.min(maximumTaxPayable, historicalTaxPayableTarget)
      : Math.max(0, statutoryTaxOnEbit);
    const cashTaxPaid = useHistoricalDerivedProjection ? Math.max(0, maximumTaxPayable - taxPayable) : statutoryTaxOnEbit;
    const noplat = ebit - statutoryTaxOnEbit;
    const cashTaxAdjustedNoplat = ebit - cashTaxPaid;
    const projectedNetIncome = useHistoricalDerivedProjection && snapshot.commercialNpatMargin
      ? revenue * snapshot.commercialNpatMargin
      : noplat;
    const ar = (revenue * snapshot.arDays) / 365;
    const inventory = (cogs * snapshot.inventoryDays) / 365;
    const ap = (cogs * snapshot.apDays) / 365;
    const otherPayable = (operatingExpenses * snapshot.otherPayableDays) / 365;
    const maintenanceCapex = fixedAssetProjection?.capitalExpenditure ?? depreciation;
    const fixedAssetsBeginning = previousFixedAssetsNet;
    const fixedAssetGross = fixedAssetProjection?.fixedAssetGross ?? previousFixedAssetGross + maintenanceCapex;
    const accumulatedDepreciation = fixedAssetProjection?.accumulatedDepreciation ?? previousAccumulatedDepreciation + depreciation;
    const fixedAssetsEnding =
      fixedAssetProjection?.fixedAssetsEnding ?? Math.max(0, fixedAssetGross - accumulatedDepreciation);
    const employeeReceivable = snapshot.employeeReceivable;
    const otherCurrentAssets = otherCurrentAssetsBase;
    const otherNonCurrentAssets = otherNonCurrentAssetsBase;
    const intangibleAssets = snapshot.intangibleAssets;
    const projectedOtherPayable = otherPayable + snapshot.interestPayable;
    const bankLoanLongTerm = snapshot.bankLoanLongTerm;
    const otherNonCurrentLiabilities = otherNonCurrentLiabilitiesBase;
    const nonCurrentLiabilities = bankLoanLongTerm + otherNonCurrentLiabilities;
    const paidUpCapital = snapshot.paidUpCapital;
    const additionalPaidInCapital = snapshot.additionalPaidInCapital;
    const shareholdersEquityBeginning = previousShareholdersEquityEnding;
    const retainedEarningsSurplus = previousRetainedEarningsEnding;
    let dividendDistribution = useHistoricalDerivedProjection
      ? Math.max(0, projectedNetIncome * Math.max(0, snapshot.dividendPayoutRatio))
      : 0;
    let retainedEarningsEnding = retainedEarningsSurplus + projectedNetIncome - dividendDistribution;
    let shareholdersEquity = paidUpCapital + additionalPaidInCapital + retainedEarningsEnding;
    const nonCashAssets =
      ar + employeeReceivable + inventory + otherCurrentAssets + fixedAssetsEnding + otherNonCurrentAssets + intangibleAssets;
    const baseCashPolicyRatio = snapshot.cashToRevenueRatio || (previousRevenue ? baseCash / previousRevenue : 0);
    const cashPolicyTarget = Math.max(0, revenue * baseCashPolicyRatio);
    let cashTotal = useHistoricalDerivedProjection ? cashPolicyTarget : 0;
    let financingPlug = 0;

    if (useHistoricalDerivedProjection) {
      const totalAssetsBeforePlug = cashTotal + nonCashAssets;
      const liabilitiesAndEquityBeforePlug =
        snapshot.bankLoanShortTerm + ap + taxPayable + projectedOtherPayable + nonCurrentLiabilities + shareholdersEquity;
      const balanceGap = totalAssetsBeforePlug - liabilitiesAndEquityBeforePlug;

      if (balanceGap >= 0) {
        financingPlug = balanceGap;
      } else {
        dividendDistribution += -balanceGap;
        retainedEarningsEnding -= -balanceGap;
        shareholdersEquity = paidUpCapital + additionalPaidInCapital + retainedEarningsEnding;
      }
    } else {
      const baseLiabilitiesAndEquity =
        snapshot.bankLoanShortTerm + ap + taxPayable + projectedOtherPayable + nonCurrentLiabilities + shareholdersEquity;
      const balancingCash = baseLiabilitiesAndEquity - nonCashAssets;
      cashTotal = Math.max(cashPolicyTarget, balancingCash);
      financingPlug = Math.max(0, cashTotal + nonCashAssets - baseLiabilitiesAndEquity);
    }

    const cashOnHand = cashTotal * cashOnHandShare;
    const cashOnBankDeposit = cashTotal - cashOnHand;
    const bankLoanShortTerm = snapshot.bankLoanShortTerm + financingPlug;
    const debtBeginningBalance = previousDebtEndingBalance;
    const debtEndingBalance = bankLoanShortTerm + bankLoanLongTerm;
    const debtBalanceSheetMovement = debtEndingBalance - debtBeginningBalance;
    const debtDrawdownFromBalanceSheet = Math.max(0, debtBalanceSheetMovement);
    const debtRepaymentFromBalanceSheet = Math.min(0, debtBalanceSheetMovement);
    const interestIncome = projectInterestIncome(cashTotal, revenue, interestIncomeCashYield, interestIncomeRevenueMargin);
    const interestExpense = projectInterestExpense(bankLoanShortTerm + bankLoanLongTerm, revenue, interestExpenseDebtRate, interestExpenseRevenueMargin);
    const otherIncomeCharge = interestIncome + interestExpense;
    const nonOperatingIncome = revenue * nonOperatingIncomeRevenueMargin;
    const nonOperatingCashFlow = nonOperatingIncome;
    const accountingProfitBeforeTax = ebit + otherIncomeCharge + nonOperatingIncome;
    const accountingTaxOnPbt = accountingProfitBeforeTax * snapshot.taxRate;
    const accountingNetProfitAfterTax = accountingProfitBeforeTax - accountingTaxOnPbt;
    const noplatBridgeInterestExpenseAddBack = -interestExpense;
    const noplatBridgeInterestIncomeDeduction = -interestIncome;
    const noplatBridgeNonOperatingIncomeDeduction = -nonOperatingIncome;
    const noplatBridgeOperatingEbit =
      accountingProfitBeforeTax +
      noplatBridgeInterestExpenseAddBack +
      noplatBridgeInterestIncomeDeduction +
      noplatBridgeNonOperatingIncomeDeduction;
    const noplatBridgeTaxOnEbit = statutoryTaxOnEbit;
    const noplatBridgeNoplat = noplatBridgeOperatingEbit - noplatBridgeTaxOnEbit;
    const currentAssets = cashTotal + ar + employeeReceivable + inventory + otherCurrentAssets;
    const nonCurrentAssets = fixedAssetsEnding + otherNonCurrentAssets + intangibleAssets;
    const totalAssets = currentAssets + nonCurrentAssets;
    const currentLiabilities = bankLoanShortTerm + ap + taxPayable + projectedOtherPayable;
    const liabilitiesAndEquity = currentLiabilities + nonCurrentLiabilities + shareholdersEquity;
    const balanceControl = totalAssets - liabilitiesAndEquity;
    const shareholdersEquityMovement = shareholdersEquity - shareholdersEquityBeginning;
    const taxPayableBeginning = previousTaxPayableEnding;
    const taxExpenseAccrued = taxExpenseForPayable;
    const taxCashPaidImpliedByPayableSchedule = taxPayableBeginning + taxExpenseAccrued - taxPayable;
    const taxPayableScheduleControl =
      taxPayableBeginning + taxExpenseAccrued - taxCashPaidImpliedByPayableSchedule - taxPayable;
    const operatingCurrentAssetsBeginning = previousOperatingCurrentAssets;
    const operatingCurrentLiabilitiesBeginning = previousOperatingCurrentLiabilities;
    const operatingCurrentAssets = selectedForecastCurrentAssets(options.workingCapitalInclusions, {
      cashOnHand,
      cashOnBankDeposit,
      accountReceivable: ar,
      employeeReceivable,
      inventory,
      otherCurrentAssets,
    });
    const operatingCurrentLiabilities = selectedForecastCurrentLiabilities(options.workingCapitalInclusions, {
      bankLoanShortTerm,
      accountPayable: ap,
      taxPayable,
      otherPayable: projectedOtherPayable,
      bankLoanLongTerm,
    });
    const operatingNwc = operatingCurrentAssets - operatingCurrentLiabilities;
    const changeInNwc = includeWorkingCapitalChange ? operatingNwc - previousNwc : 0;
    const grossCashFlow = (useHistoricalDerivedProjection ? cashTaxAdjustedNoplat : noplat) + depreciation;
    const grossInvestment = maintenanceCapex + changeInNwc;
    const freeCashFlow = grossCashFlow - grossInvestment;
    const cashBeginningBalance = previousCashEndingBalance;
    const cashFlowFromOperations = grossCashFlow - changeInNwc;
    const cashFlowFromInvestment = -maintenanceCapex;
    const cashFlowBeforeFinancing = cashFlowFromOperations + nonOperatingCashFlow + cashFlowFromInvestment;
    const cashEndingBalance = cashTotal;
    const cashFlowFromFinancing = cashEndingBalance - cashBeginningBalance - cashFlowBeforeFinancing;
    const capitalBalance = paidUpCapital + additionalPaidInCapital;
    const equityInjection = capitalBalance - previousCapitalBalance;
    const interestExpenseCashFlow = interestExpense;
    const interestIncomeCashFlow = interestIncome;
    const residualFinancingCashFlow = cashFlowFromFinancing - equityInjection - interestExpenseCashFlow - interestIncomeCashFlow;
    const newLoan = Math.max(0, residualFinancingCashFlow);
    const principalRepayment = Math.min(0, residualFinancingCashFlow);
    const scheduledDividendDistribution = -dividendDistribution;
    const unallocatedFinancingCashFlow =
      cashFlowFromFinancing -
      equityInjection -
      debtBalanceSheetMovement -
      scheduledDividendDistribution -
      interestExpenseCashFlow -
      interestIncomeCashFlow;
    const unallocatedFinancingInflow = Math.max(0, unallocatedFinancingCashFlow);
    const unallocatedFinancingOutflow = Math.min(0, unallocatedFinancingCashFlow);
    const financingScheduleControl =
      cashFlowFromFinancing -
      equityInjection -
      debtBalanceSheetMovement -
      scheduledDividendDistribution -
      interestExpenseCashFlow -
      interestIncomeCashFlow -
      unallocatedFinancingInflow -
      unallocatedFinancingOutflow;
    const netCashFlow = cashEndingBalance - cashBeginningBalance;
    const cashFlowControl =
      cashBeginningBalance +
      cashFlowFromOperations +
      nonOperatingCashFlow +
      cashFlowFromInvestment +
      cashFlowFromFinancing -
      cashEndingBalance;
    const discountBase = 1 + wacc;
    const discountFactor = discountBase > 0 ? 1 / Math.pow(discountBase, period) : 0;
    const presentValue = freeCashFlow * discountFactor;
    const cashPolicyGap = cashEndingBalance - cashPolicyTarget;
    const cashPolicySurplus = Math.max(0, cashPolicyGap);
    const cashPolicyFundingNeed = Math.max(0, -cashPolicyGap);
    const cashTaxVarianceToSchedule = taxCashPaidImpliedByPayableSchedule - cashTaxPaid;

    rows.push({
      year,
      revenue,
      cogs,
      grossProfit,
      operatingExpenses,
      depreciation,
      ebit,
      statutoryTaxOnEbit,
      cashTaxPaid,
      noplat,
      projectedNetIncome,
      interestIncome,
      interestExpense,
      otherIncomeCharge,
      nonOperatingIncome,
      accountingProfitBeforeTax,
      accountingTaxOnPbt,
      accountingNetProfitAfterTax,
      noplatBridgeInterestExpenseAddBack,
      noplatBridgeInterestIncomeDeduction,
      noplatBridgeNonOperatingIncomeDeduction,
      noplatBridgeOperatingEbit,
      noplatBridgeTaxOnEbit,
      noplatBridgeNoplat,
      cashOnHand,
      cashOnBankDeposit,
      accountReceivable: ar,
      employeeReceivable,
      inventory,
      otherCurrentAssets,
      currentAssets,
      operatingCurrentAssetsBeginning,
      operatingCurrentAssets,
      accountPayable: ap,
      taxPayable,
      otherPayable: projectedOtherPayable,
      bankLoanShortTerm,
      currentLiabilities,
      operatingCurrentLiabilitiesBeginning,
      operatingCurrentLiabilities,
      operatingNwc,
      changeInNwc,
      fixedAssetsBeginning,
      fixedAssetGross,
      accumulatedDepreciation,
      capitalExpenditure: maintenanceCapex,
      fixedAssetsEnding,
      otherNonCurrentAssets,
      intangibleAssets,
      nonCurrentAssets,
      totalAssets,
      bankLoanLongTerm,
      debtBeginningBalance,
      debtEndingBalance,
      debtBalanceSheetMovement,
      debtDrawdownFromBalanceSheet,
      debtRepaymentFromBalanceSheet,
      otherNonCurrentLiabilities,
      nonCurrentLiabilities,
      paidUpCapital,
      additionalPaidInCapital,
      shareholdersEquityBeginning,
      shareholdersEquityMovement,
      retainedEarningsSurplus,
      dividendDistribution,
      retainedEarningsEnding,
      shareholdersEquity,
      liabilitiesAndEquity,
      balanceControl,
      taxPayableBeginning,
      taxExpenseAccrued,
      taxCashPaidImpliedByPayableSchedule,
      taxPayableScheduleControl,
      cashTaxVarianceToSchedule,
      cashPolicyTarget,
      cashPolicyGap,
      cashPolicySurplus,
      cashPolicyFundingNeed,
      cashBeginningBalance,
      cashFlowFromOperations,
      nonOperatingCashFlow,
      cashFlowFromInvestment,
      cashFlowBeforeFinancing,
      equityInjection,
      newLoan,
      interestExpenseCashFlow,
      interestIncomeCashFlow,
      principalRepayment,
      scheduledDividendDistribution,
      unallocatedFinancingCashFlow,
      unallocatedFinancingInflow,
      unallocatedFinancingOutflow,
      financingScheduleControl,
      cashFlowFromFinancing,
      netCashFlow,
      cashEndingBalance,
      cashFlowControl,
      grossCashFlow,
      grossInvestment,
      freeCashFlow,
      discountFactor,
      presentValue,
    });

    previousRevenue = revenue;
    previousOperatingCurrentAssets = operatingCurrentAssets;
    previousOperatingCurrentLiabilities = operatingCurrentLiabilities;
    previousNwc = operatingNwc;
    previousFixedAssetsNet = fixedAssetsEnding;
    previousFixedAssetGross = fixedAssetGross;
    previousAccumulatedDepreciation = accumulatedDepreciation;
    previousRetainedEarningsEnding = retainedEarningsEnding;
    previousCashEndingBalance = cashEndingBalance;
    previousTaxPayableEnding = taxPayable;
    previousCapitalBalance = capitalBalance;
    previousDebtEndingBalance = debtEndingBalance;
    previousShareholdersEquityEnding = shareholdersEquity;
  }

  return rows;
}

export function calculateDcf(
  snapshot: FinancialStatementSnapshot,
  options: DcfOptions = {},
): MethodOutput & { forecast: DcfForecastRow[] } {
  const forecast = buildDcfForecast(snapshot, options);
  const explicitPv = forecast.reduce((sum, row) => sum + row.presentValue, 0);
  const finalFcf = forecast[forecast.length - 1]?.freeCashFlow ?? 0;
  const terminalGrowth = options.terminalGrowth ?? snapshot.terminalGrowth;
  const wacc = options.wacc ?? snapshot.wacc;
  const terminalDenominator = wacc - terminalGrowth;
  const terminalValue = terminalDenominator > 0 ? (finalFcf * (1 + terminalGrowth)) / terminalDenominator : 0;
  const terminalPv = wacc > -1 ? terminalValue / Math.pow(1 + wacc, forecast.length) : 0;
  const enterpriseValue = explicitPv + terminalPv;
  const debtLikeTaxPayable = options.debtLikeTaxPayable ? snapshot.taxPayable : 0;
  const equityValue = enterpriseValue + nonOperatingAssets(snapshot) - interestBearingDebt(snapshot) - debtLikeTaxPayable;

  const traces: FormulaTrace[] = [
    {
      label: "PV eksplisit FCFF",
      formula: "Jumlah FCFF tahunan / (1 + WACC)^n",
      value: explicitPv,
      note: options.projectionEngine === "historical-derived"
        ? `Skenario pembanding memakai kebijakan kas, jadwal utang pajak, dan roll-forward ekuitas yang diturunkan dari ${snapshot.historicalProjectionYearCount || 1} periode historis pengguna.`
        : options.fixedAssetProjectionSource
        ? `Proyeksi eksplisit lima tahun memakai ${options.fixedAssetProjectionSource} untuk depresiasi, capex, dan aset tetap neto.`
        : "Proyeksi eksplisit lima tahun berbasis margin historis dan operating WC days.",
    },
    {
      label: "PV nilai terminal",
      formula: "[FCFF final x (1 + g) / (WACC - g)] / (1 + WACC)^5",
      value: terminalPv,
      note: options.terminalGrowth === undefined
        ? "Terminal growth berasal dari input skenario dasar pengguna dan wajib lebih rendah dari WACC."
        : "Terminal growth berasal dari skenario DCF aktif dan wajib lebih rendah dari WACC.",
    },
    {
      label: "Aset non-operasional",
      formula: "Surplus cash atau saldo kas + surat berharga + piutang karyawan + aset tetap non-operasional",
      value: nonOperatingAssets(snapshot),
      note: "Judgment berdampak tinggi; sensitivitas minimum operating cash diperlukan.",
    },
    {
      label: "Nilai Ekuitas 100% - DCF",
      formula: options.debtLikeTaxPayable
        ? "Enterprise value + aset non-operasional - utang berbunga - utang pajak debt-like"
        : "Enterprise value + aset non-operasional - utang berbunga",
      value: equityValue,
      note: options.debtLikeTaxPayable
        ? "DLOM/DLOC tidak diterapkan; utang pajak diperlakukan sebagai kewajiban debt-like dalam skenario aktif."
        : "DLOM/DLOC tidak diterapkan.",
    },
  ];

  return { method: "DCF", equityValue, traces, forecast };
}

export function calculateAllMethods(snapshot: FinancialStatementSnapshot, options: CalculationOptions = {}) {
  const dcfOptions = options.dcf ?? {};
  const dcf = calculateDcf(snapshot, dcfOptions);
  const dcfTerminalDownside = calculateDcf(snapshot, {
    ...dcfOptions,
    terminalGrowth: snapshot.terminalGrowthDownside ?? snapshot.terminalGrowth,
  });
  const dcfTerminalUpside = calculateDcf(snapshot, {
    ...dcfOptions,
    terminalGrowth: snapshot.terminalGrowthUpside ?? snapshot.terminalGrowth,
  });
  const dcfNoIncrementalWorkingCapital = calculateDcf(snapshot, { ...dcfOptions, includeWorkingCapitalChange: false });
  const dcfTaxPayableDebtLike = calculateDcf(snapshot, { ...dcfOptions, debtLikeTaxPayable: true });
  const dcfHistoricalDerivedProjection = calculateDcf(snapshot, { ...dcfOptions, projectionEngine: "historical-derived" });
  const projectionGovernance = buildDcfProjectionGovernance(snapshot, dcf, dcfHistoricalDerivedProjection);
  const incomeProjectionRelianceGovernance = buildIncomeProjectionRelianceGovernance(snapshot, dcf);
  const eem = calculateEem(snapshot, options.eem);
  const eemTaxPayableDebtLike = {
    ...eem,
    equityValue: eem.equityValue - snapshot.taxPayable,
  };

  return {
    aam: calculateAam(snapshot, options.aam),
    eem,
    dcf,
    sensitivities: {
      dcfTerminalDownside,
      dcfTerminalUpside,
      dcfNoIncrementalWorkingCapital,
      dcfTaxPayableDebtLike,
      dcfHistoricalDerivedProjection,
      eemTaxPayableDebtLike,
    },
    projectionGovernance,
    incomeProjectionRelianceGovernance,
    operatingWorkingCapital: operatingWorkingCapital(snapshot),
    nonOperatingAssets: nonOperatingAssets(snapshot),
    interestBearingDebt: interestBearingDebt(snapshot),
    normalizedNoplat: normalizedNoplat(snapshot),
    adjustedTotalAssets: adjustedTotalAssets(snapshot),
    adjustedTotalLiabilities: adjustedTotalLiabilities(snapshot),
  };
}

function buildIncomeProjectionRelianceGovernance(
  snapshot: FinancialStatementSnapshot,
  baseline: MethodOutput & { forecast: DcfForecastRow[] },
): IncomeProjectionRelianceGovernanceResult {
  const presentationStressEquityValue = calculateAccountingPresentationStressEquityValue(snapshot, baseline.forecast);
  const absoluteVariance = presentationStressEquityValue - baseline.equityValue;
  const relativeVariance = safeAbsRatio(absoluteVariance, baseline.equityValue);
  const interestBearingDebtBalance = interestBearingDebt(snapshot);
  const maximumInterestIncomeRevenueRatio = maxForecastRatio(baseline.forecast, (row) => row.interestIncome, (row) => row.revenue);
  const maximumInterestExpenseRevenueRatio = maxForecastRatio(baseline.forecast, (row) => row.interestExpense, (row) => row.revenue);
  const unsupportedDebtCostRatio = interestBearingDebtBalance <= 0 ? maximumInterestExpenseRevenueRatio : 0;
  const maximumNonOperatingRevenueRatio = maxForecastRatio(baseline.forecast, (row) => row.nonOperatingIncome, (row) => row.revenue);
  const maximumAccountingNpatBridgeGap = maxForecastRatio(
    baseline.forecast,
    (row) => row.accountingNetProfitAfterTax - row.noplat,
    (row) => row.revenue,
  );

  const items: ProjectionGovernanceMetric[] = [
    {
      id: "presentation-stress-variance",
      label: "Stress DCF accounting presentation vs current DCF",
      value: relativeVariance,
      valueFormat: "percent",
      level: thresholdLevel(relativeVariance, 0.05, 0.15),
      threshold: "Review >5%; fallback >15%",
      note:
        absoluteVariance === 0
          ? "Accounting presentation tidak mengubah stress value."
          : `Jika accounting NPAT dipakai sebagai FCFF, nilai indikatif ${absoluteVariance > 0 ? "lebih tinggi" : "lebih rendah"} dari DCF saat ini.`,
    },
    {
      id: "historical-period-count",
      label: "Jumlah periode historis pendukung",
      value: snapshot.historicalProjectionYearCount,
      valueFormat: "number",
      level: snapshot.historicalProjectionYearCount >= 3 ? "ok" : snapshot.historicalProjectionYearCount >= 2 ? "review" : "critical",
      threshold: "Minimal 3 periode untuk final reliance awal",
      note: "Reliance final membutuhkan histori cukup sebelum approval reviewer diberikan.",
    },
    {
      id: "interest-income-yield",
      label: "Yield kas/deposito historis",
      value: Math.abs(snapshot.interestIncomeCashYield),
      valueFormat: "percent",
      level: thresholdLevel(Math.abs(snapshot.interestIncomeCashYield), 0.08, 0.15),
      threshold: "Review >8%; fallback >15%",
      note: "Yield tinggi dapat menandakan projected cash bukan seluruhnya deposito produktif atau ada outlier historis.",
    },
    {
      id: "interest-income-materiality",
      label: "Interest income / revenue maksimum",
      value: maximumInterestIncomeRevenueRatio,
      valueFormat: "percent",
      level: thresholdLevel(maximumInterestIncomeRevenueRatio, 0.02, 0.05),
      threshold: "Review >2%; fallback >5%",
      note: "Mengukur apakah pendapatan bunga menjadi terlalu material terhadap earning power operasi.",
    },
    {
      id: "interest-expense-without-debt",
      label: "Interest expense tanpa utang berbunga",
      value: unsupportedDebtCostRatio,
      valueFormat: "percent",
      level: thresholdLevel(unsupportedDebtCostRatio, 0.0025, 0.01),
      threshold: "Review >0,25%; fallback >1%",
      note:
        interestBearingDebtBalance > 0
          ? "Beban bunga memiliki basis utang berbunga historis."
          : "Jika tidak ada saldo utang berbunga, beban bunga hanya boleh menjadi presentation line immaterial.",
    },
    {
      id: "non-operating-recurrence",
      label: "Non-operating income / revenue maksimum",
      value: maximumNonOperatingRevenueRatio,
      valueFormat: "percent",
      level: thresholdLevel(maximumNonOperatingRevenueRatio, 0.01, 0.03),
      threshold: "Review >1%; fallback >3%",
      note:
        snapshot.nonOperatingIncomeRevenueMargin === 0
          ? "Sistem mengunci non-operating projection ke nol karena tidak ada pola recurring yang supportable."
          : "Non-operating projection hanya layak dipakai jika recurring dan tidak volatil.",
    },
    {
      id: "accounting-npat-vs-noplat",
      label: "Accounting NPAT vs NOPLAT gap maksimum",
      value: maximumAccountingNpatBridgeGap,
      valueFormat: "percent",
      level: thresholdLevel(maximumAccountingNpatBridgeGap, 0.05, 0.1),
      threshold: "Review >5%; fallback >10%",
      note: "Gap besar menunjukkan accounting presentation tidak boleh dipakai langsung sebagai basis FCFF.",
    },
    {
      id: "cash-deposit-policy",
      label: "Cash / revenue historis",
      value: snapshot.cashToRevenueRatio,
      valueFormat: "percent",
      level: thresholdLevel(snapshot.cashToRevenueRatio, 0.35, 0.6),
      threshold: "Review >35%; fallback >60%",
      note: "Cash policy tinggi dapat membuat interest income projection terlalu tinggi jika seluruh kas dianggap produktif.",
    },
  ];

  const level = highestGovernanceLevel(items.map((item) => item.level));
  const decision: IncomeProjectionRelianceDecision =
    level === "critical" ? "current-dcf-fallback" : level === "review" ? "review-only" : "eligible-for-approval";
  const title =
    decision === "current-dcf-fallback"
      ? "Fallback current DCF aktif"
      : decision === "review-only"
      ? "Historical-only baseline perlu approval"
      : "Historical-only baseline eligible";
  const summary =
    decision === "current-dcf-fallback"
      ? "Kontrol reliance menemukan risiko nilai terlalu tinggi/rendah atau dukungan historis lemah. Sistem mempertahankan DCF saat ini sebagai nilai aktif."
      : decision === "review-only"
      ? "Projection tetap berasal dari histori pengguna, tetapi final report reliance menunggu approval reviewer dan audit trail."
      : "Projection historis berada dalam batas awal. Current DCF tetap aktif dan dapat disetujui sebagai basis final setelah reviewer approval.";

  const traces: FormulaTrace[] = [
    {
      label: "Nilai DCF aktif",
      formula: "Current FCFF/WACC DCF",
      value: baseline.equityValue,
      note: "Nilai ini tetap menjadi fallback dan basis aktif sampai reviewer approval selesai.",
    },
    {
      label: "Stress accounting presentation",
      formula: "Accounting NPAT + depreciation - capex - change in NWC; discounted with WACC",
      value: presentationStressEquityValue,
      note: "Stress test saja untuk mendeteksi risiko jika accounting presentation keliru dijadikan FCFF.",
    },
    {
      label: "Selisih stress vs current DCF",
      formula: "ABS(stress value - current DCF) / ABS(current DCF)",
      value: relativeVariance,
      valueFormat: "percent",
      note: "Jika selisih melewati ambang batas, current DCF tetap menjadi fallback.",
    },
  ];

  return {
    level,
    decision,
    title,
    summary,
    activeBasis: "current-dcf",
    stressBasis: "accounting-presentation-stress",
    governedEquityValue: baseline.equityValue,
    currentDcfEquityValue: baseline.equityValue,
    presentationStressEquityValue,
    absoluteVariance,
    relativeVariance,
    items,
    traces,
  };
}

function buildDcfProjectionGovernance(
  snapshot: FinancialStatementSnapshot,
  baseline: MethodOutput & { forecast: DcfForecastRow[] },
  historicalDerived: MethodOutput & { forecast: DcfForecastRow[] },
): DcfProjectionGovernanceResult {
  const absoluteVariance = historicalDerived.equityValue - baseline.equityValue;
  const relativeVariance = safeAbsRatio(absoluteVariance, baseline.equityValue);
  const maximumBalanceControlRatio = maxForecastRatio(historicalDerived.forecast, (row) => row.balanceControl, (row) => row.totalAssets);
  const maximumCashFlowControlRatio = maxForecastRatio(historicalDerived.forecast, (row) => row.cashFlowControl, (row) => row.revenue);
  const maximumFinancingPlugRatio = maxForecastRatio(historicalDerived.forecast, (row) => row.newLoan, (row) => row.revenue);
  const maximumCashRatio = Math.max(
    0,
    ...historicalDerived.forecast.map((row) => safeRatio(row.cashEndingBalance, row.revenue)),
    snapshot.cashToRevenueRatio,
  );

  const items: ProjectionGovernanceMetric[] = [
    {
      id: "dcf-variance",
      label: "Selisih nilai DCF historis vs baseline",
      value: relativeVariance,
      valueFormat: "percent",
      level: thresholdLevel(relativeVariance, 0.2, 0.35),
      threshold: "Review >20%; fallback >35%",
      note:
        absoluteVariance === 0
          ? "Hasil historical-derived sama dengan baseline."
          : `Historical-derived ${absoluteVariance > 0 ? "lebih tinggi" : "lebih rendah"} dari baseline.`,
    },
    {
      id: "historical-period-count",
      label: "Jumlah periode historis pendukung",
      value: snapshot.historicalProjectionYearCount,
      valueFormat: "number",
      level: snapshot.historicalProjectionYearCount >= 3 ? "ok" : snapshot.historicalProjectionYearCount >= 2 ? "review" : "critical",
      threshold: "Minimal 3 periode untuk keyakinan awal",
      note: "Semakin pendek histori, semakin besar risiko pola historis tidak representatif.",
    },
    {
      id: "cash-policy",
      label: "Cash / revenue maksimum",
      value: maximumCashRatio,
      valueFormat: "percent",
      level: thresholdLevel(maximumCashRatio, 0.35, 0.6),
      threshold: "Review >35%; fallback >60%",
      note: "Mengukur apakah kebijakan kas historis membuat projected cash terlalu dominan.",
    },
    {
      id: "tax-payable-schedule",
      label: "Tax payable / tax expense",
      value: snapshot.taxPayableToTaxExpenseRatio,
      valueFormat: "number",
      level: thresholdLevel(snapshot.taxPayableToTaxExpenseRatio, 2, 4),
      threshold: "Review >2x; fallback >4x",
      note: "Rasio tinggi dapat menandakan timing pembayaran pajak tidak cukup dijelaskan oleh histori.",
    },
    {
      id: "dividend-policy",
      label: "Dividend payout historis",
      value: snapshot.dividendPayoutRatio,
      valueFormat: "percent",
      level: thresholdLevel(snapshot.dividendPayoutRatio, 0.75, 0.95),
      threshold: "Review >75%; fallback >95%",
      note: "Dividend payout tinggi dapat menekan retained earnings dan mengubah proyeksi ekuitas.",
    },
    {
      id: "financing-plug",
      label: "Financing plug / revenue maksimum",
      value: maximumFinancingPlugRatio,
      valueFormat: "percent",
      level: thresholdLevel(maximumFinancingPlugRatio, 0.25, 0.5),
      threshold: "Review >25%; fallback >50%",
      note: "Mengukur seberapa besar pembiayaan implisit dibutuhkan untuk menjaga proyeksi tetap balance.",
    },
    {
      id: "balance-control",
      label: "Balance control maksimum",
      value: maximumBalanceControlRatio,
      valueFormat: "percent",
      level: thresholdLevel(maximumBalanceControlRatio, 0.0001, 0.001),
      threshold: "Review >0,01%; fallback >0,10%",
      note: "Validasi bahwa total aset tetap sama dengan total liabilitas dan ekuitas.",
    },
    {
      id: "cash-flow-control",
      label: "Cash-flow control maksimum",
      value: maximumCashFlowControlRatio,
      valueFormat: "percent",
      level: thresholdLevel(maximumCashFlowControlRatio, 0.0001, 0.001),
      threshold: "Review >0,01%; fallback >0,10%",
      note: "Validasi ending cash terhadap opening cash dan seluruh arus kas.",
    },
  ];

  const level = highestGovernanceLevel(items.map((item) => item.level));
  const decision: ProjectionGovernanceDecision =
    level === "critical" ? "baseline-fallback" : level === "review" ? "sensitivity-only" : "eligible-for-review";
  const title =
    decision === "baseline-fallback"
      ? "Fallback baseline aktif"
      : decision === "sensitivity-only"
      ? "Sensitivitas historis perlu review"
      : "Sensitivitas historis dalam batas awal";
  const summary =
    decision === "baseline-fallback"
      ? "Nilai DCF berbasis historis berada di luar batas kewajaran awal. Sistem mempertahankan baseline saat ini sebagai nilai utama dan memakai hasil historis hanya sebagai alarm sensitivitas."
      : decision === "sensitivity-only"
      ? "Nilai DCF berbasis historis tidak otomatis menggantikan baseline. Hasilnya tetap sebagai sensitivitas sampai reviewer menyetujui driver dan alasan pemakaiannya."
      : "Nilai DCF berbasis historis lolos kontrol awal. Baseline tetap aktif, tetapi hasil ini layak dipertimbangkan setelah approval reviewer.";

  const traces: FormulaTrace[] = [
    {
      label: "Nilai DCF baseline aktif",
      formula: "Engine proyeksi neraca baseline",
      value: baseline.equityValue,
      note: "Nilai ini tetap menjadi DCF utama dan menjadi fallback ketika sensitivity historis tidak wajar.",
    },
    {
      label: "Nilai DCF proyeksi historis",
      formula: "Engine proyeksi historis-terturunkan",
      value: historicalDerived.equityValue,
      note: "Nilai ini berasal dari driver historis pengguna dan diperlakukan sebagai sensitivitas/governance evidence.",
    },
    {
      label: "Selisih relatif governance",
      formula: "ABS(DCF historis - DCF baseline) / ABS(DCF baseline)",
      value: relativeVariance,
      valueFormat: "percent",
      note: "Selisih di atas ambang batas membuat baseline tetap menjadi solusi fallback.",
    },
  ];

  return {
    level,
    decision,
    title,
    summary,
    activeEngine: "balance-reconciled",
    sensitivityEngine: "historical-derived",
    governedEquityValue: baseline.equityValue,
    baselineEquityValue: baseline.equityValue,
    historicalDerivedEquityValue: historicalDerived.equityValue,
    absoluteVariance,
    relativeVariance,
    items,
    traces,
  };
}

function calculateAccountingPresentationStressEquityValue(
  snapshot: FinancialStatementSnapshot,
  forecast: DcfForecastRow[],
): number {
  if (!forecast.length) {
    return 0;
  }

  const explicitPv = forecast.reduce((sum, row) => {
    const stressFreeCashFlow =
      row.accountingNetProfitAfterTax + row.depreciation - row.capitalExpenditure - row.changeInNwc;
    return sum + stressFreeCashFlow * row.discountFactor;
  }, 0);
  const finalRow = forecast[forecast.length - 1];
  const finalStressFreeCashFlow =
    finalRow.accountingNetProfitAfterTax + finalRow.depreciation - finalRow.capitalExpenditure - finalRow.changeInNwc;
  const terminalDenominator = snapshot.wacc - snapshot.terminalGrowth;
  const terminalValue =
    terminalDenominator > 0 ? (finalStressFreeCashFlow * (1 + snapshot.terminalGrowth)) / terminalDenominator : 0;
  const terminalPv = snapshot.wacc > -1 ? terminalValue / Math.pow(1 + snapshot.wacc, forecast.length) : 0;
  const enterpriseValue = explicitPv + terminalPv;

  return enterpriseValue + nonOperatingAssets(snapshot) - interestBearingDebt(snapshot);
}

function forecastStartYear(snapshot: FinancialStatementSnapshot): number {
  const yearMatch = snapshot.valuationDate.match(/\b(19|20)\d{2}\b/);
  return yearMatch ? Number(yearMatch[0]) : 2021;
}

function positiveResidual(total: number, knownComponents: number): number {
  return Math.max(0, total - knownComponents);
}

function finiteOption(value: number | undefined): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function resolveNonOperatingIncomeRevenueMargin(
  snapshot: FinancialStatementSnapshot,
  policy: NonOperatingIncomeProjectionPolicy | undefined,
): number {
  if (policy === "non-recurring") {
    return 0;
  }

  if (policy === "recurring") {
    return snapshot.nonOperatingIncomeRevenueMargin || safeRatio(snapshot.nonOperatingIncome, snapshot.revenue);
  }

  return snapshot.nonOperatingIncomeRevenueMargin || 0;
}

function safeRatio(numerator: number, denominator: number): number {
  return denominator ? numerator / denominator : 0;
}

function safeAbsRatio(numerator: number, denominator: number): number {
  const base = Math.abs(denominator);
  return base ? Math.abs(numerator) / base : Math.abs(numerator) > 0 ? Number.POSITIVE_INFINITY : 0;
}

function projectInterestIncome(cashBalance: number, revenue: number, cashYield: number, revenueMargin: number): number {
  if (cashBalance > 0 && cashYield !== 0) {
    return cashBalance * cashYield;
  }

  return revenue * revenueMargin;
}

function projectInterestExpense(interestBearingDebtBalance: number, revenue: number, debtRate: number, revenueMargin: number): number {
  if (interestBearingDebtBalance > 0 && debtRate > 0) {
    return -interestBearingDebtBalance * debtRate;
  }

  return revenue * revenueMargin;
}

function maxForecastRatio(
  forecast: DcfForecastRow[],
  numerator: (row: DcfForecastRow) => number,
  denominator: (row: DcfForecastRow) => number,
): number {
  return forecast.reduce((max, row) => Math.max(max, safeAbsRatio(numerator(row), denominator(row))), 0);
}

function thresholdLevel(value: number, reviewThreshold: number, criticalThreshold: number): ProjectionGovernanceLevel {
  if (!Number.isFinite(value) || value >= criticalThreshold) {
    return "critical";
  }

  return value >= reviewThreshold ? "review" : "ok";
}

function highestGovernanceLevel(levels: ProjectionGovernanceLevel[]): ProjectionGovernanceLevel {
  if (levels.includes("critical")) {
    return "critical";
  }

  return levels.includes("review") ? "review" : "ok";
}
