import {
  buildDebtScheduleSummary,
  buildFixedAssetScheduleSummary,
  buildSnapshot,
  getChronologicalPeriods,
  mapRow,
  parseInputNumber,
  type AccountRow,
  type AssumptionState,
  type DebtScheduleInputKey,
  type DebtScheduleInputState,
  type DebtSchedulePeriodAmounts,
  type FixedAssetScheduleRow,
  type Period,
} from "./case-model";
import { categoryLabelMap } from "./category-options";
import {
  corporateTaxExpenseForNoplat,
  interestBearingDebt,
  nonOperatingAssets,
  normalizedNoplat,
} from "./calculations";
import type { AccountCategory, FinancialStatementSnapshot } from "./types";

export type AnalysisValue = number | null;

export type AnalysisRow = {
  key: string;
  label: string;
  source: string;
  formula: string;
  values: Record<string, AnalysisValue>;
  note?: string;
  kind?: "section" | "subtotal" | "warning";
  sourceType?: "manual" | "formula" | "interoperable" | "fallback";
  editableInputKey?: DebtScheduleInputKey;
  editablePeriodIds?: string[];
  valueFormat?: "currency" | "percent";
  lockReason?: string;
  isComparativeOverrideable?: boolean;
  calculatedValues?: Record<string, AnalysisValue>;
  overrideAllowedByPeriod?: Record<string, boolean>;
  overrideInputs?: Record<string, string>;
  overrideStatuses?: Record<string, CashFlowOverrideStatus>;
  validationMessages?: Record<string, string>;
};

export type CashFlowOverrideEntry = {
  value: string;
  reason: string;
  updatedAt: string;
};

export type CashFlowOverrideState = Record<string, Record<string, CashFlowOverrideEntry>>;
export type AnalysisValueOverrideState = Record<string, Record<string, CashFlowOverrideEntry>>;
export type AnalysisValueOverrideSection = "ratio" | "roic";

export type CashFlowOverrideStatus = "none" | "applied" | "not_allowed";

export type CashFlowWorkingCapitalRowKey = "oca-change" | "ocl-change";

export type CashFlowAccountInclusionState = Partial<Record<CashFlowWorkingCapitalRowKey, Record<string, boolean>>>;

export type CashFlowWorkingCapitalAccountCandidate = {
  rowId: string;
  accountName: string;
  effectiveCategory: AccountCategory;
  categoryLabel: string;
  defaultIncluded: boolean;
  included: boolean;
  values: Record<string, string>;
};

export type CashFlowWorkingCapitalAccountCandidates = Record<
  CashFlowWorkingCapitalRowKey,
  CashFlowWorkingCapitalAccountCandidate[]
>;

export type CashFlowStatementSection =
  | "operating"
  | "working_capital"
  | "investing"
  | "financing"
  | "cash_reconciliation";

export type CashFlowStatementRow = AnalysisRow & {
  section: CashFlowStatementSection;
  workbookReference: string;
  reliability: "derived" | "review" | "reconciliation";
  isOverridable: boolean;
  overrideAllowedByPeriod: Record<string, boolean>;
  calculatedValues: Record<string, AnalysisValue>;
  overrideInputs: Record<string, string>;
  overrideValues: Record<string, AnalysisValue>;
  overrideReasons: Record<string, string>;
  overrideStatuses: Record<string, CashFlowOverrideStatus>;
  overrideUpdatedAt: Record<string, string>;
  validationMessages: Record<string, string>;
};

export type RatioRow = AnalysisRow & {
  display: "percent" | "multiple" | "currency";
  average: AnalysisValue;
};

export const cashFlowWorkingCapitalRowKeys = ["oca-change", "ocl-change"] as const;

export function buildAnalysisValueOverrideKey(section: AnalysisValueOverrideSection, rowKey: string): string {
  return `${section}:${rowKey}`;
}

const ocaCandidateCategories = new Set<AccountCategory>([
  "CURRENT_ASSET",
  "CASH",
  "CASH_ON_HAND",
  "CASH_ON_BANK",
  "ACCOUNT_RECEIVABLE",
  "OTHER_RECEIVABLE",
  "EMPLOYEE_RECEIVABLE",
  "INVENTORY",
  "EXCESS_CASH",
  "MARKETABLE_SECURITIES",
  "SURPLUS_ASSET_CASH",
]);

const oclCandidateCategories = new Set<AccountCategory>([
  "CURRENT_LIABILITIES",
  "BANK_LOAN_SHORT_TERM",
  "ACCOUNT_PAYABLE",
  "TAX_PAYABLE",
  "OTHER_PAYABLE",
  "INTEREST_PAYABLE",
  "BANK_LOAN_LONG_TERM",
  "INTEREST_BEARING_DEBT",
]);

const defaultIncludedWorkingCapitalCategories: Record<CashFlowWorkingCapitalRowKey, Set<AccountCategory>> = {
  "oca-change": new Set(["ACCOUNT_RECEIVABLE", "INVENTORY"]),
  "ocl-change": new Set(["ACCOUNT_PAYABLE", "OTHER_PAYABLE"]),
};

export type PeriodAnalysis = {
  period: Period;
  snapshot: FinancialStatementSnapshot;
  previousSnapshot: FinancialStatementSnapshot | null;
  operatingCurrentAssets: number;
  operatingCurrentLiabilities: number;
  operatingWorkingCapital: number;
  changeInOperatingCurrentAssets: number;
  changeInOperatingCurrentLiabilities: number;
  depreciationAddback: number;
  capitalExpenditure: number;
  normalizedTaxOnEbit: number;
  normalizedNoplat: number;
  ebitda: number;
  workingCapitalCashFlowEffect: number;
  cashFlowFromOperations: number;
  freeCashFlow: number;
  investedCapitalEnd: number;
  investedCapitalBeginning: number | null;
  roic: number | null;
  cashMovement: number | null;
  correctedNetCashFlow: number;
  cashFlowRollforwardGap: number | null;
  debtSchedule: DebtSchedulePeriodAmounts;
  loanMovement: {
    shortTermBeginning: number;
    shortTermAddition: number;
    shortTermRepayment: number;
    shortTermEnding: number;
    longTermBeginning: number;
    longTermAddition: number;
    longTermRepayment: number;
    longTermEnding: number;
  };
};

export type SectionAnalysis = {
  periods: Period[];
  periodAnalyses: PeriodAnalysis[];
  payablesRows: AnalysisRow[];
  cashFlowRows: AnalysisRow[];
  cashFlowStatementRows: CashFlowStatementRow[];
  noplatRows: AnalysisRow[];
  fcfRows: AnalysisRow[];
  ratioRows: RatioRow[];
  roicRows: AnalysisRow[];
};

export function isCashFlowWorkingCapitalRowKey(value: string): value is CashFlowWorkingCapitalRowKey {
  return cashFlowWorkingCapitalRowKeys.includes(value as CashFlowWorkingCapitalRowKey);
}

export function buildCashFlowWorkingCapitalAccountCandidates(
  rows: AccountRow[],
  inclusions: CashFlowAccountInclusionState = {},
): CashFlowWorkingCapitalAccountCandidates {
  const mappedBalanceRows = rows.map(mapRow).filter((item) => item.row.statement === "balance_sheet");

  return {
    "oca-change": mappedBalanceRows
      .filter((item) => ocaCandidateCategories.has(item.effectiveCategory) || item.row.balanceSheetClassification === "current_asset")
      .map((item) => buildCashFlowWorkingCapitalCandidate("oca-change", item.row, item.effectiveCategory, inclusions)),
    "ocl-change": mappedBalanceRows
      .filter(
        (item) =>
          oclCandidateCategories.has(item.effectiveCategory) ||
          item.row.balanceSheetClassification === "current_liability",
      )
      .map((item) => buildCashFlowWorkingCapitalCandidate("ocl-change", item.row, item.effectiveCategory, inclusions)),
  };
}

function buildCashFlowWorkingCapitalCandidate(
  rowKey: CashFlowWorkingCapitalRowKey,
  row: AccountRow,
  effectiveCategory: AccountCategory,
  inclusions: CashFlowAccountInclusionState,
): CashFlowWorkingCapitalAccountCandidate {
  const explicitIncluded = inclusions[rowKey]?.[row.id];
  const defaultIncluded = defaultIncludedWorkingCapitalCategories[rowKey].has(effectiveCategory);

  return {
    rowId: row.id,
    accountName: row.accountName || "(Akun tanpa nama)",
    effectiveCategory,
    categoryLabel: categoryLabelMap.get(effectiveCategory) ?? effectiveCategory,
    defaultIncluded,
    included: typeof explicitIncluded === "boolean" ? explicitIncluded : defaultIncluded,
    values: row.values,
  };
}

function sumIncludedWorkingCapitalAccounts(candidates: CashFlowWorkingCapitalAccountCandidate[], periodId: string): number {
  return candidates.reduce(
    (sum, candidate) => sum + (candidate.included ? parseInputNumber(candidate.values[periodId] ?? "") : 0),
    0,
  );
}

export function buildSectionAnalysis(
  periods: Period[],
  rows: AccountRow[],
  assumptions: AssumptionState,
  fixedAssetScheduleRows: FixedAssetScheduleRow[] = [],
  cashFlowOverrides: CashFlowOverrideState = {},
  debtScheduleInputs: DebtScheduleInputState = {},
  cashFlowAccountInclusions: CashFlowAccountInclusionState = {},
  analysisValueOverrides: AnalysisValueOverrideState = {},
): SectionAnalysis {
  const chronologicalPeriods = getChronologicalPeriods(periods);
  const fixedAssetSchedule = buildFixedAssetScheduleSummary(periods, fixedAssetScheduleRows);
  const debtSchedule = buildDebtScheduleSummary(periods, rows, debtScheduleInputs);
  const workingCapitalAccountCandidates = buildCashFlowWorkingCapitalAccountCandidates(rows, cashFlowAccountInclusions);
  const snapshots = new Map(
    chronologicalPeriods.map((period) => [
      period.id,
      buildSnapshot(periods, period.id, rows, assumptions, fixedAssetScheduleRows, { debtScheduleInputs }),
    ]),
  );

  const periodAnalyses = chronologicalPeriods.map((period, index): PeriodAnalysis => {
    const snapshot =
      snapshots.get(period.id) ?? buildSnapshot(periods, period.id, rows, assumptions, fixedAssetScheduleRows, { debtScheduleInputs });
    const previousPeriod = chronologicalPeriods[index - 1];
    const previousSnapshot = previousPeriod ? (snapshots.get(previousPeriod.id) ?? null) : null;
    const scheduleAmounts = fixedAssetSchedule.totals[period.id];
    const depreciationAddback = fixedAssetSchedule.hasInput
      ? -(scheduleAmounts?.depreciationAdditions ?? 0)
      : Math.max(0, -snapshot.depreciation);
    const capitalExpenditure = fixedAssetSchedule.hasInput
      ? (scheduleAmounts?.acquisitionAdditions ?? 0)
      : inferCapitalExpenditure(snapshot, previousSnapshot, depreciationAddback);
    const currentOperatingAssets = sumIncludedWorkingCapitalAccounts(workingCapitalAccountCandidates["oca-change"], period.id);
    const currentOperatingLiabilities = sumIncludedWorkingCapitalAccounts(workingCapitalAccountCandidates["ocl-change"], period.id);
    const previousOperatingAssets = previousPeriod
      ? sumIncludedWorkingCapitalAccounts(workingCapitalAccountCandidates["oca-change"], previousPeriod.id)
      : currentOperatingAssets;
    const previousOperatingLiabilities = previousPeriod
      ? sumIncludedWorkingCapitalAccounts(workingCapitalAccountCandidates["ocl-change"], previousPeriod.id)
      : currentOperatingLiabilities;
    const changeInOperatingCurrentAssets = previousSnapshot ? -(currentOperatingAssets - previousOperatingAssets) : 0;
    const changeInOperatingCurrentLiabilities = previousSnapshot ? currentOperatingLiabilities - previousOperatingLiabilities : 0;
    const workingCapitalCashFlowEffect = changeInOperatingCurrentAssets + changeInOperatingCurrentLiabilities;
    const normalizedTaxOnEbit = corporateTaxExpenseForNoplat(snapshot);
    const noplat = normalizedNoplat(snapshot);
    const ebitda = snapshot.ebit + depreciationAddback;
    const operatingTaxCashFlow = snapshot.corporateTax || -normalizedTaxOnEbit;
    const cashFlowFromOperations = ebitda + operatingTaxCashFlow + workingCapitalCashFlowEffect;
    const capitalExpenditureCashFlow = -capitalExpenditure;
    const freeCashFlow = noplat + depreciationAddback + workingCapitalCashFlowEffect + capitalExpenditureCashFlow;
    const selectedOperatingWorkingCapital = currentOperatingAssets - currentOperatingLiabilities;
    const previousSelectedOperatingWorkingCapital = previousSnapshot ? previousOperatingAssets - previousOperatingLiabilities : null;
    const investedCapitalEnd = snapshot.fixedAssetsNet + selectedOperatingWorkingCapital;
    const previousInvestedCapitalEnd = previousSnapshot
      ? previousSnapshot.fixedAssetsNet + (previousSelectedOperatingWorkingCapital ?? 0)
      : null;
    const cashTotal = snapshot.cashOnHand + snapshot.cashOnBankDeposit;
    const previousCashTotal = previousSnapshot ? previousSnapshot.cashOnHand + previousSnapshot.cashOnBankDeposit : null;
    const cashMovement = previousCashTotal === null ? null : cashTotal - previousCashTotal;
    const debtScheduleAmounts = debtSchedule.periods[period.id] ?? createEmptyDebtSchedulePeriodAmounts();
    const loanMovement = buildLoanMovement(debtScheduleAmounts);
    const equityInjectionMovement = previousSnapshot
      ? snapshot.paidUpCapital + snapshot.additionalPaidInCapital - (previousSnapshot.paidUpCapital + previousSnapshot.additionalPaidInCapital)
      : 0;
    const newLoan = loanMovement.shortTermAddition + loanMovement.longTermAddition;
    const principalRepayment = loanMovement.shortTermRepayment + loanMovement.longTermRepayment;
    const cashFlowBeforeFinancing = cashFlowFromOperations + snapshot.nonOperatingIncome + capitalExpenditureCashFlow;
    const cashFlowFromFinancing = equityInjectionMovement + newLoan + snapshot.interestExpense + snapshot.interestIncome + principalRepayment;
    const correctedNetCashFlow = cashFlowBeforeFinancing + cashFlowFromFinancing;
    const cashFlowRollforwardGap = cashMovement === null ? null : correctedNetCashFlow - cashMovement;

    return {
      period,
      snapshot,
      previousSnapshot,
      operatingCurrentAssets: currentOperatingAssets,
      operatingCurrentLiabilities: currentOperatingLiabilities,
      operatingWorkingCapital: selectedOperatingWorkingCapital,
      changeInOperatingCurrentAssets,
      changeInOperatingCurrentLiabilities,
      depreciationAddback,
      capitalExpenditure,
      normalizedTaxOnEbit,
      normalizedNoplat: noplat,
      ebitda,
      workingCapitalCashFlowEffect,
      cashFlowFromOperations,
      freeCashFlow,
      investedCapitalEnd,
      investedCapitalBeginning: previousInvestedCapitalEnd,
      roic: previousInvestedCapitalEnd ? freeCashFlow / previousInvestedCapitalEnd : null,
      cashMovement,
      correctedNetCashFlow,
      cashFlowRollforwardGap,
      debtSchedule: debtScheduleAmounts,
      loanMovement,
    };
  });

  const cashFlowStatementRows = buildCashFlowStatementRows(periodAnalyses, cashFlowOverrides);
  const fcfRows = buildFcfRows(periodAnalyses, cashFlowStatementRows);

  return {
    periods: chronologicalPeriods,
    periodAnalyses,
    payablesRows: buildPayablesRows(periodAnalyses),
    cashFlowRows: buildCashFlowRows(periodAnalyses),
    cashFlowStatementRows,
    noplatRows: buildNoplatRows(periodAnalyses),
    fcfRows,
    ratioRows: buildRatioRows(periodAnalyses, analysisValueOverrides),
    roicRows: buildRoicRows(periodAnalyses, analysisValueOverrides, fcfRows),
  };
}

function buildPayablesRows(periodAnalyses: PeriodAnalysis[]): AnalysisRow[] {
  const firstPeriodId = periodAnalyses[0]?.period.id;

  return [
    sectionRow("trade-payables-section", "Utang usaha dan operasional"),
    valueRow(periodAnalyses, "account-payable", "Utang usaha", "Terpetakan account payable", "Saldo input", (item) => item.snapshot.accountPayable, undefined, undefined, {
      sourceType: "interoperable",
      lockReason: "Diambil dari Neraca agar operating working capital tetap konsisten.",
    }),
    valueRow(periodAnalyses, "tax-payable", "Utang pajak", "Terpetakan tax payable", "Saldo input", (item) => item.snapshot.taxPayable, undefined, undefined, {
      sourceType: "interoperable",
      lockReason: "Diambil dari Neraca dan dipakai untuk sensitivitas debt-like.",
    }),
    valueRow(periodAnalyses, "other-payable", "Utang lain-lain", "Terpetakan other payable", "Saldo input", (item) => item.snapshot.otherPayable, undefined, undefined, {
      sourceType: "interoperable",
      lockReason: "Diambil dari Neraca agar operating working capital tetap konsisten.",
    }),
    valueRow(periodAnalyses, "operating-current-liabilities", "Utang operasi", "Operating working capital bridge", "Akun liabilitas terpilih CFS", (item) =>
      item.operatingCurrentLiabilities,
      "subtotal",
      undefined,
      {
        sourceType: "formula",
        lockReason: "Formula operating WC mengikuti checklist CFS liabilitas lancar operasional.",
      },
    ),
    sectionRow("bank-loan-short-section", "Pinjaman bank jangka pendek"),
    valueRow(periodAnalyses, "short-rate", "Tingkat pinjaman / rate", "Input manual ACC PAYABLES row 8", "Parameter rate; label workbook lama: Principal", (item) => item.debtSchedule.shortTermLoanRate, undefined, "Bukan saldo pokok.", {
      sourceType: "manual",
      editableInputKey: "shortTermLoanRate",
      valueFormat: "percent",
    }),
    valueRow(periodAnalyses, "short-beginning", "Saldo awal", "Saldo akhir pinjaman jangka pendek periode sebelumnya", "Saldo akhir periode sebelumnya", (item) => item.loanMovement.shortTermBeginning, undefined, undefined, {
      sourceType: "formula",
      lockReason: "Formula roll-forward dari saldo akhir periode sebelumnya.",
    }),
    valueRow(periodAnalyses, "short-addition", "Penambahan", "Balance Sheet row pinjaman jangka pendek", "Saldo BS kini - saldo BS sebelumnya", (item) => item.loanMovement.shortTermAddition, undefined, undefined, {
      sourceType: "interoperable",
      lockReason: "Mengikuti formula ACC PAYABLES row 10 dari Balance Sheet.",
    }),
    valueRow(periodAnalyses, "short-repayment", "Pembayaran kembali", "Input manual ACC PAYABLES row 11", "Nilai manual; gunakan negatif untuk pelunasan", (item) => item.loanMovement.shortTermRepayment, undefined, undefined, {
      sourceType: "manual",
      editableInputKey: "shortTermRepayment",
    }),
    valueRow(periodAnalyses, "short-ending", "Saldo akhir", "Formula jadwal jangka pendek", "Saldo awal + penambahan + pembayaran kembali", (item) => item.loanMovement.shortTermEnding, "subtotal", undefined, {
      sourceType: "formula",
      lockReason: "Formula SUM seperti ACC PAYABLES row 12.",
    }),
    valueRow(periodAnalyses, "short-interest-payable", "Utang bunga jangka pendek", "Input manual ACC PAYABLES row 14", "Saldo input", (item) => item.debtSchedule.shortTermInterestPayable, undefined, undefined, {
      sourceType: "manual",
      editableInputKey: "shortTermInterestPayable",
    }),
    sectionRow("bank-loan-long-section", "Pinjaman bank jangka panjang"),
    valueRow(periodAnalyses, "long-rate", "Tingkat pinjaman / rate", "Input manual ACC PAYABLES row 17", "Parameter rate; label workbook lama: Principal", (item) => item.debtSchedule.longTermLoanRate, undefined, "Bukan saldo pokok.", {
      sourceType: "manual",
      editableInputKey: "longTermLoanRate",
      valueFormat: "percent",
    }),
    valueRow(periodAnalyses, "long-beginning", "Saldo awal", "Input awal lalu roll-forward", "Periode pertama manual; periode berikutnya saldo akhir sebelumnya", (item) => item.loanMovement.longTermBeginning, undefined, undefined, {
      sourceType: "manual",
      editableInputKey: "longTermBeginning",
      editablePeriodIds: firstPeriodId ? [firstPeriodId] : [],
      lockReason: "Periode lanjutan dikunci oleh formula roll-forward.",
    }),
    valueRow(periodAnalyses, "long-addition", "Penambahan", "Input manual ACC PAYABLES row 19", "Nilai manual; fallback Neraca bila jadwal manual belum diisi", (item) => item.loanMovement.longTermAddition, undefined, undefined, {
      sourceType: "manual",
      editableInputKey: "longTermAddition",
    }),
    valueRow(periodAnalyses, "long-repayment", "Pembayaran kembali", "Input manual ACC PAYABLES row 20", "Nilai manual; gunakan negatif untuk pelunasan", (item) => item.loanMovement.longTermRepayment, undefined, undefined, {
      sourceType: "manual",
      editableInputKey: "longTermRepayment",
    }),
    valueRow(periodAnalyses, "long-ending", "Saldo akhir", "Formula jadwal jangka panjang", "Saldo awal + penambahan + pembayaran kembali", (item) => item.loanMovement.longTermEnding, "subtotal", undefined, {
      sourceType: "formula",
      lockReason: "Formula SUM seperti ACC PAYABLES row 21.",
    }),
    valueRow(periodAnalyses, "long-interest-payable", "Utang bunga jangka panjang", "Input manual ACC PAYABLES row 23", "Saldo input", (item) => item.debtSchedule.longTermInterestPayable, undefined, undefined, {
      sourceType: "manual",
      editableInputKey: "longTermInterestPayable",
    }),
    valueRow(periodAnalyses, "interest-payable", "Utang bunga", "Schedule / Neraca", "Utang bunga jangka pendek + jangka panjang; fallback saldo Neraca", (item) => item.snapshot.interestPayable, "subtotal", undefined, {
      sourceType: "formula",
      lockReason: "Formula gabungan input schedule atau fallback akun utang bunga.",
    }),
    valueRow(periodAnalyses, "interest-bearing-debt", "Utang berbunga", "Debt bridge", "Pinjaman bank jangka pendek + pinjaman bank jangka panjang", (item) => interestBearingDebt(item.snapshot), "subtotal", undefined, {
      sourceType: "formula",
      lockReason: "Formula EV-to-equity bridge.",
    }),
    valueRow(
      periodAnalyses,
      "total-debt-schedule",
      "Total jadwal utang",
      "Saldo utang terpetakan",
      "Utang usaha + utang pajak + utang lain-lain + utang bunga + utang berbunga",
      (item) =>
        item.snapshot.accountPayable +
        item.snapshot.taxPayable +
        item.snapshot.otherPayable +
        item.snapshot.interestPayable +
        interestBearingDebt(item.snapshot),
      "subtotal",
      undefined,
      {
        sourceType: "formula",
        lockReason: "Formula total jadwal utang dan payable.",
      },
    ),
  ];
}

function buildCashFlowRows(periodAnalyses: PeriodAnalysis[]): AnalysisRow[] {
  return [
    valueRow(periodAnalyses, "ebitda", "EBITDA", "Model terkoreksi", "EBIT komersial + add-back penyusutan", (item) => item.ebitda),
    valueRow(periodAnalyses, "operating-tax", "Arus kas pajak operasional", "Input atau fallback ternormalisasi", "Input pajak badan, jika kosong -(EBIT x tarif pajak)", (item) => item.snapshot.corporateTax || -item.normalizedTaxOnEbit),
    sectionRow("wc-section", "Perubahan Operating Working Capital"),
    valueRow(periodAnalyses, "oca-change", "Aset lancar operasional", "Mutasi akun aset lancar terpilih", "-(OCA terpilih kini - OCA terpilih sebelumnya)", (item) =>
      item.previousSnapshot ? item.changeInOperatingCurrentAssets : null,
    ),
    valueRow(periodAnalyses, "ocl-change", "Liabilitas lancar operasional", "Mutasi akun liabilitas terpilih", "OCL terpilih kini - OCL terpilih sebelumnya", (item) =>
      item.previousSnapshot ? item.changeInOperatingCurrentLiabilities : null,
    ),
    valueRow(periodAnalyses, "wc-change", "Dampak arus kas modal kerja", "Operating WC terkoreksi", "Perubahan OCA + perubahan OCL", (item) =>
      item.previousSnapshot ? item.workingCapitalCashFlowEffect : null,
      "subtotal",
    ),
    valueRow(periodAnalyses, "cfo", "Arus kas dari operasi", "Model terkoreksi", "EBITDA + pajak operasional + perubahan operating WC", (item) =>
      item.previousSnapshot ? item.cashFlowFromOperations : null,
      "subtotal",
    ),
    valueRow(periodAnalyses, "non-operating-income", "Arus kas non-operasional", "Terpetakan pendapatan / beban non-operasional", "Pendapatan / beban non-operasional", (item) => item.snapshot.nonOperatingIncome),
    valueRow(periodAnalyses, "capex", "Arus kas investasi / capex", "Jadwal aset tetap atau mutasi terinferensi", "-capital expenditure", (item) =>
      -item.capitalExpenditure,
    ),
    valueRow(periodAnalyses, "cf-before-financing", "Arus kas sebelum pendanaan", "Model terkoreksi", "CFO + pendapatan non-operasional - capex", (item) =>
      item.previousSnapshot ? item.cashFlowFromOperations + item.snapshot.nonOperatingIncome - item.capitalExpenditure : null,
      "subtotal",
    ),
    sectionRow("financing-section", "Pendanaan"),
    valueRow(periodAnalyses, "equity-injection", "Mutasi setoran ekuitas", "Mutasi modal disetor/tambahan modal", "Modal kini - modal sebelumnya", (item) =>
      item.previousSnapshot
        ? item.snapshot.paidUpCapital + item.snapshot.additionalPaidInCapital - (item.previousSnapshot.paidUpCapital + item.previousSnapshot.additionalPaidInCapital)
        : null,
    ),
    valueRow(periodAnalyses, "new-loan", "Pinjaman baru", "Jadwal utang", "Mutasi utang positif", (item) =>
      item.previousSnapshot ? item.loanMovement.shortTermAddition + item.loanMovement.longTermAddition : null,
    ),
    valueRow(periodAnalyses, "interest-payment", "Pembayaran bunga", "Terpetakan beban bunga", "Line arus kas beban bunga", (item) => item.snapshot.interestExpense),
    valueRow(periodAnalyses, "interest-income", "Pendapatan bunga", "Terpetakan pendapatan bunga", "Line arus kas pendapatan bunga", (item) => item.snapshot.interestIncome),
    valueRow(periodAnalyses, "principal-repayment", "Pembayaran pokok pinjaman", "Jadwal utang", "Mutasi utang negatif", (item) =>
      item.previousSnapshot ? item.loanMovement.shortTermRepayment + item.loanMovement.longTermRepayment : null,
    ),
    valueRow(periodAnalyses, "cff", "Arus kas dari pendanaan", "Bridge mutasi terkoreksi", "Mutasi ekuitas + pinjaman baru + bunga + pembayaran pokok", (item) =>
      item.previousSnapshot
        ? item.snapshot.paidUpCapital +
          item.snapshot.additionalPaidInCapital -
          (item.previousSnapshot.paidUpCapital + item.previousSnapshot.additionalPaidInCapital) +
          item.loanMovement.shortTermAddition +
          item.loanMovement.longTermAddition +
          item.snapshot.interestExpense +
          item.snapshot.interestIncome +
          item.loanMovement.shortTermRepayment +
          item.loanMovement.longTermRepayment
        : null,
      "subtotal",
    ),
    valueRow(periodAnalyses, "net-cash-flow", "Arus kas bersih", "Model terkoreksi", "Arus kas sebelum pendanaan + CFF", (item) =>
      item.previousSnapshot ? item.correctedNetCashFlow : null,
      "subtotal",
    ),
    valueRow(periodAnalyses, "cash-movement", "Pemeriksaan mutasi kas", "Kas di tangan + bank", "Kas akhir - kas sebelumnya", (item) => item.cashMovement),
    valueRow(periodAnalyses, "cash-gap", "Selisih roll-forward kas", "Pemeriksaan audit", "Arus kas bersih terkoreksi - mutasi kas", (item) => item.cashFlowRollforwardGap, "warning"),
  ];
}

type CashFlowStatementRowSpec = Pick<
  CashFlowStatementRow,
  "key" | "label" | "source" | "formula" | "section" | "workbookReference" | "reliability" | "isOverridable" | "kind" | "note"
> & {
  calculate: (item: PeriodAnalysis, finalValues: Record<string, AnalysisValue>) => AnalysisValue;
  requiresComparativePeriodOverride?: boolean;
};

const cashFlowStatementRowSpecs: CashFlowStatementRowSpec[] = [
  {
    key: "ebitda",
    label: "EBITDA",
    section: "operating",
    source: "Laba Rugi + add-back penyusutan",
    formula: "EBIT komersial + penyusutan",
    workbookReference: "CFS!5; INCOME STATEMENT!18",
    reliability: "derived",
    isOverridable: false,
    calculate: (item) => item.ebitda,
  },
  {
    key: "operating-tax",
    label: "Corporate tax cash flow",
    section: "operating",
    source: "Input pajak badan atau statutory fallback",
    formula: "Pajak badan input; jika kosong -(EBIT x tarif pajak)",
    workbookReference: "CFS!6; INCOME STATEMENT!33",
    reliability: "review",
    isOverridable: false,
    calculate: (item) => item.snapshot.corporateTax || -item.normalizedTaxOnEbit,
  },
  {
    key: "oca-change",
    label: "(Kenaikan) penurunan aset lancar operasional",
    section: "working_capital",
    source: "Akun aset lancar terpilih dari Neraca",
    formula: "-(OCA terpilih kini - OCA terpilih sebelumnya)",
    workbookReference: "CFS!8; BALANCE SHEET current-asset inclusion policy",
    reliability: "derived",
    isOverridable: true,
    requiresComparativePeriodOverride: true,
    calculate: (item) => (item.previousSnapshot ? item.changeInOperatingCurrentAssets : null),
  },
  {
    key: "ocl-change",
    label: "Kenaikan (penurunan) liabilitas lancar operasional",
    section: "working_capital",
    source: "Akun liabilitas terpilih dari Neraca",
    formula: "OCL terpilih kini - OCL terpilih sebelumnya",
    workbookReference: "CFS!9; BALANCE SHEET current-liability inclusion policy",
    reliability: "derived",
    isOverridable: true,
    requiresComparativePeriodOverride: true,
    calculate: (item) => (item.previousSnapshot ? item.changeInOperatingCurrentLiabilities : null),
  },
  {
    key: "working-capital-effect",
    label: "Net working capital cash-flow effect",
    section: "working_capital",
    source: "Subtotal working capital final",
    formula: "Perubahan OCA + perubahan OCL",
    workbookReference: "CFS!10",
    reliability: "reconciliation",
    isOverridable: false,
    kind: "subtotal",
    calculate: (_item, finalValues) => sumNullable(finalValues["oca-change"], finalValues["ocl-change"]),
  },
  {
    key: "cfo",
    label: "Cash flow from operations",
    section: "working_capital",
    source: "Subtotal operating cash flow final",
    formula: "EBITDA + pajak operasional + perubahan OCA + perubahan OCL",
    workbookReference: "CFS!11",
    reliability: "reconciliation",
    isOverridable: false,
    kind: "subtotal",
    calculate: (_item, finalValues) =>
      sumNullable(finalValues.ebitda, finalValues["operating-tax"], finalValues["oca-change"], finalValues["ocl-change"]),
  },
  {
    key: "non-operating-income",
    label: "Non-operating cash flow",
    section: "investing",
    source: "Pendapatan/beban non-operasional terpetakan",
    formula: "Pendapatan / beban non-operasional",
    workbookReference: "CFS!13; INCOME STATEMENT!30",
    reliability: "review",
    isOverridable: false,
    calculate: (item) => item.snapshot.nonOperatingIncome,
  },
  {
    key: "capex",
    label: "Capital expenditure",
    section: "investing",
    source: "Jadwal aset tetap atau inferensi aset tetap",
    formula: "-capital expenditure",
    workbookReference: "CFS!17; FIXED ASSET!23",
    reliability: "review",
    isOverridable: false,
    calculate: (item) => -item.capitalExpenditure,
  },
  {
    key: "cash-flow-before-financing",
    label: "Cash flow before financing",
    section: "investing",
    source: "Subtotal sebelum pendanaan final",
    formula: "CFO + non-operating cash flow + capex",
    workbookReference: "CFS!19",
    reliability: "reconciliation",
    isOverridable: false,
    kind: "subtotal",
    calculate: (_item, finalValues) => sumNullable(finalValues.cfo, finalValues["non-operating-income"], finalValues.capex),
  },
  {
    key: "equity-injection",
    label: "Equity injection movement",
    section: "financing",
    source: "Mutasi modal disetor + tambahan modal",
    formula: "(Paid-up capital + additional paid-in capital) kini - sebelumnya",
    workbookReference: "CFS!22; BALANCE SHEET!42,43",
    reliability: "review",
    isOverridable: true,
    requiresComparativePeriodOverride: true,
    note: "Memakai movement antarperiode, bukan saldo akhir workbook.",
    calculate: (item) =>
      item.previousSnapshot
        ? item.snapshot.paidUpCapital +
          item.snapshot.additionalPaidInCapital -
          (item.previousSnapshot.paidUpCapital + item.previousSnapshot.additionalPaidInCapital)
        : null,
  },
  {
    key: "new-loan",
    label: "New loan",
    section: "financing",
    source: "Debt bridge pinjaman bank",
    formula: "Penambahan pinjaman jangka pendek + jangka panjang",
    workbookReference: "CFS!23; ACC PAYABLES!10,19",
    reliability: "review",
    isOverridable: true,
    requiresComparativePeriodOverride: true,
    calculate: (item) => (item.previousSnapshot ? item.loanMovement.shortTermAddition + item.loanMovement.longTermAddition : null),
  },
  {
    key: "interest-payment",
    label: "Interest payment",
    section: "financing",
    source: "Beban bunga terpetakan",
    formula: "Beban bunga",
    workbookReference: "CFS!24; INCOME STATEMENT!27",
    reliability: "review",
    isOverridable: false,
    calculate: (item) => item.snapshot.interestExpense,
  },
  {
    key: "interest-income",
    label: "Interest income",
    section: "financing",
    source: "Pendapatan bunga terpetakan",
    formula: "Pendapatan bunga",
    workbookReference: "CFS!25; INCOME STATEMENT!26",
    reliability: "review",
    isOverridable: false,
    calculate: (item) => item.snapshot.interestIncome,
  },
  {
    key: "principal-repayment",
    label: "Principal repayment",
    section: "financing",
    source: "Debt bridge pinjaman bank",
    formula: "Pembayaran pokok pinjaman jangka pendek + jangka panjang",
    workbookReference: "CFS!26; ACC PAYABLES!20",
    reliability: "review",
    isOverridable: true,
    requiresComparativePeriodOverride: true,
    calculate: (item) => (item.previousSnapshot ? item.loanMovement.shortTermRepayment + item.loanMovement.longTermRepayment : null),
  },
  {
    key: "cash-flow-from-financing",
    label: "Cash flow from financing",
    section: "financing",
    source: "Subtotal financing final",
    formula: "Equity injection + new loan + interest payment + interest income + principal repayment",
    workbookReference: "CFS!28",
    reliability: "reconciliation",
    isOverridable: false,
    kind: "subtotal",
    calculate: (_item, finalValues) =>
      sumNullable(
        finalValues["equity-injection"],
        finalValues["new-loan"],
        finalValues["interest-payment"],
        finalValues["interest-income"],
        finalValues["principal-repayment"],
      ),
  },
  {
    key: "net-cash-flow",
    label: "Net cash flow",
    section: "cash_reconciliation",
    source: "Subtotal seluruh cash-flow final",
    formula: "Cash flow before financing + cash flow from financing",
    workbookReference: "CFS!30",
    reliability: "reconciliation",
    isOverridable: false,
    kind: "subtotal",
    calculate: (_item, finalValues) => sumNullable(finalValues["cash-flow-before-financing"], finalValues["cash-flow-from-financing"]),
  },
  {
    key: "cash-beginning",
    label: "Cash at beginning of period",
    section: "cash_reconciliation",
    source: "Saldo kas akhir periode sebelumnya atau seed manual",
    formula: "Kas akhir periode sebelumnya; periode awal dapat di-seed manual",
    workbookReference: "CFS!32",
    reliability: "review",
    isOverridable: true,
    requiresComparativePeriodOverride: true,
    calculate: (item) => (item.previousSnapshot ? item.previousSnapshot.cashOnHand + item.previousSnapshot.cashOnBankDeposit : null),
  },
  {
    key: "cash-on-bank",
    label: "Cash on bank / deposit ending",
    section: "cash_reconciliation",
    source: "Balance Sheet cash on bank/deposit",
    formula: "Cash on bank + deposit",
    workbookReference: "CFS!35; BALANCE SHEET!9",
    reliability: "derived",
    isOverridable: false,
    calculate: (item) => item.snapshot.cashOnBankDeposit,
  },
  {
    key: "cash-on-hand",
    label: "Cash on hand ending",
    section: "cash_reconciliation",
    source: "Balance Sheet cash on hand",
    formula: "Cash on hand",
    workbookReference: "CFS!36; BALANCE SHEET!8",
    reliability: "derived",
    isOverridable: false,
    calculate: (item) => item.snapshot.cashOnHand,
  },
  {
    key: "cash-ending",
    label: "Cash at end of period",
    section: "cash_reconciliation",
    source: "Subtotal kas akhir final",
    formula: "Cash on bank/deposit + cash on hand",
    workbookReference: "CFS!33",
    reliability: "reconciliation",
    isOverridable: false,
    kind: "subtotal",
    calculate: (_item, finalValues) => sumNullable(finalValues["cash-on-bank"], finalValues["cash-on-hand"]),
  },
  {
    key: "cash-movement",
    label: "Cash movement per balance sheet",
    section: "cash_reconciliation",
    source: "Cash ending - cash beginning",
    formula: "Kas akhir - kas awal",
    workbookReference: "CFS!33 - CFS!32",
    reliability: "reconciliation",
    isOverridable: false,
    calculate: (_item, finalValues) => sumNullable(finalValues["cash-ending"], negateNullable(finalValues["cash-beginning"])),
  },
  {
    key: "cash-rollforward-gap",
    label: "Cash roll-forward gap",
    section: "cash_reconciliation",
    source: "Audit reconciliation",
    formula: "Net cash flow - cash movement",
    workbookReference: "System audit check",
    reliability: "reconciliation",
    isOverridable: false,
    kind: "warning",
    calculate: (_item, finalValues) => sumNullable(finalValues["net-cash-flow"], negateNullable(finalValues["cash-movement"])),
  },
];

function buildCashFlowStatementRows(
  periodAnalyses: PeriodAnalysis[],
  cashFlowOverrides: CashFlowOverrideState,
): CashFlowStatementRow[] {
  const rows = cashFlowStatementRowSpecs.map(
    (spec): CashFlowStatementRow => ({
      key: spec.key,
      label: spec.label,
      source: spec.source,
      formula: spec.formula,
      section: spec.section,
      workbookReference: spec.workbookReference,
      reliability: spec.reliability,
      isOverridable: spec.isOverridable,
      overrideAllowedByPeriod: {},
      kind: spec.kind,
      note: spec.note,
      values: {},
      calculatedValues: {},
      overrideInputs: {},
      overrideValues: {},
      overrideReasons: {},
      overrideStatuses: {},
      overrideUpdatedAt: {},
      validationMessages: {},
    }),
  );

  for (const item of periodAnalyses) {
    const finalValues: Record<string, AnalysisValue> = {};

    cashFlowStatementRowSpecs.forEach((spec, index) => {
      const calculatedValue = spec.calculate(item, finalValues);
      const overrideEntry = cashFlowOverrides[spec.key]?.[item.period.id];
      const overrideInput = overrideEntry?.value ?? "";
      const overrideReason = overrideEntry?.reason ?? "";
      const hasOverrideInput = overrideInput.trim() !== "";
      const overrideValue = hasOverrideInput ? parseInputNumber(overrideInput) : null;
      const isCellOverridable = Boolean(
        spec.isOverridable &&
          spec.requiresComparativePeriodOverride &&
          !item.previousSnapshot &&
          (calculatedValue === null || !Number.isFinite(calculatedValue)),
      );
      const isOverrideApplied = isCellOverridable && hasOverrideInput;
      const finalValue = isOverrideApplied ? overrideValue : calculatedValue;
      const status: CashFlowOverrideStatus = !isCellOverridable
        ? "not_allowed"
        : isOverrideApplied
          ? "applied"
          : "none";

      finalValues[spec.key] = finalValue;

      const row = rows[index];
      row.overrideAllowedByPeriod[item.period.id] = isCellOverridable;
      row.calculatedValues[item.period.id] = calculatedValue;
      row.overrideInputs[item.period.id] = overrideInput;
      row.overrideValues[item.period.id] = isOverrideApplied ? overrideValue : null;
      row.overrideReasons[item.period.id] = overrideReason;
      row.overrideStatuses[item.period.id] = status;
      row.overrideUpdatedAt[item.period.id] = overrideEntry?.updatedAt ?? "";
      row.validationMessages[item.period.id] =
        !isCellOverridable && hasOverrideInput ? "Override hanya aktif saat baris memerlukan data pembanding." : "";
      row.values[item.period.id] = finalValue;
    });
  }

  return rows;
}

function buildNoplatRows(periodAnalyses: PeriodAnalysis[]): AnalysisRow[] {
  return [
    valueRow(periodAnalyses, "pbt", "Laba sebelum pajak", "Bridge operasional terkoreksi", "EBIT + pendapatan bunga + beban bunga + pendapatan non-operasional", (item) =>
      item.snapshot.ebit + item.snapshot.interestIncome + item.snapshot.interestExpense + item.snapshot.nonOperatingIncome,
    ),
    valueRow(periodAnalyses, "add-interest", "Tambah: beban bunga", "Terpetakan beban bunga", "-beban bunga", (item) => -item.snapshot.interestExpense),
    valueRow(periodAnalyses, "less-interest-income", "Kurang: pendapatan bunga", "Terpetakan pendapatan bunga", "-pendapatan bunga", (item) => -item.snapshot.interestIncome),
    valueRow(periodAnalyses, "less-non-operating", "Kurang: pendapatan non-operasional", "Terpetakan pendapatan / beban non-operasional", "-pendapatan / beban non-operasional", (item) => -item.snapshot.nonOperatingIncome),
    valueRow(periodAnalyses, "ebit", "EBIT komersial", "Model terkoreksi", "EBIT operasional setelah mengecualikan item pendanaan/non-operasional", (item) => item.snapshot.ebit, "subtotal"),
    valueRow(
      periodAnalyses,
      "tax-on-ebit",
      "Pajak penghasilan badan",
      "Read only Laba Rugi",
      "Nilai akun Pajak penghasilan badan dari Laba Rugi; fallback EBIT x tarif pajak jika belum tersedia",
      (item) => item.normalizedTaxOnEbit,
    ),
    valueRow(periodAnalyses, "tax-shields-excluded", "Tax shield / efek pajak non-operasional dikeluarkan", "Basis valuasi terkoreksi", "0", () => 0),
    valueRow(periodAnalyses, "noplat", "NOPLAT", "Model terkoreksi", "EBIT komersial - pajak penghasilan badan", (item) => item.normalizedNoplat, "subtotal"),
  ];
}

function buildFcfRows(periodAnalyses: PeriodAnalysis[], cashFlowStatementRows: CashFlowStatementRow[]): AnalysisRow[] {
  const cashFlowValuesByRowKey = new Map(cashFlowStatementRows.map((row) => [row.key, row.values]));
  const cashFlowValue = (rowKey: string, periodId: string): AnalysisValue => cashFlowValuesByRowKey.get(rowKey)?.[periodId] ?? null;
  const grossCashFlow = (item: PeriodAnalysis): AnalysisValue => item.normalizedNoplat + item.depreciationAddback;
  const capitalExpenditureCashFlow = (item: PeriodAnalysis): AnalysisValue => -item.capitalExpenditure;
  const grossInvestment = (item: PeriodAnalysis): AnalysisValue =>
    sumNullable(cashFlowValue("working-capital-effect", item.period.id), capitalExpenditureCashFlow(item));
  const freeCashFlow = (item: PeriodAnalysis): AnalysisValue =>
    sumNullable(grossCashFlow(item), grossInvestment(item));

  return [
    valueRow(periodAnalyses, "noplat", "NOPLAT", "NOPLAT terkoreksi", "EBIT komersial - pajak penghasilan badan", (item) => item.normalizedNoplat, undefined, undefined, {
      sourceType: "interoperable",
      lockReason: "Mengikuti sub-bagian NOPLAT.",
    }),
    valueRow(periodAnalyses, "depreciation", "Tambah: penyusutan", "Penyusutan terpetakan / jadwal aset tetap", "beban penyusutan", (item) => item.depreciationAddback, undefined, undefined, {
      sourceType: "interoperable",
      lockReason: "Mengikuti Aset Tetap atau jadwal aset tetap.",
    }),
    valueRow(periodAnalyses, "gross-cash-flow", "Arus kas bruto", "Model terkoreksi", "NOPLAT + penyusutan", grossCashFlow, "subtotal", undefined, {
      sourceType: "formula",
      lockReason: "Formula dari NOPLAT dan penyusutan.",
    }),
    sectionRow("wc-section", "Perubahan Working Capital"),
    valueRow(periodAnalyses, "oca-change", "(Kenaikan) penurunan aset lancar operasional", "Cash Flow Statement", "Final CFS row: -(aset lancar terpilih kini - sebelumnya)", (item) =>
      cashFlowValue("oca-change", item.period.id),
      undefined,
      "Editable melalui override Cash Flow Statement dan checklist akun Neraca.",
      {
        sourceType: "manual",
        lockReason: "Nilai final mengikuti baris CFS yang dapat direview/override.",
      },
    ),
    valueRow(periodAnalyses, "ocl-change", "Kenaikan (penurunan) liabilitas lancar operasional", "Cash Flow Statement", "Final CFS row: liabilitas terpilih kini - sebelumnya", (item) =>
      cashFlowValue("ocl-change", item.period.id),
      undefined,
      "Editable melalui override Cash Flow Statement dan checklist akun Neraca.",
      {
        sourceType: "manual",
        lockReason: "Nilai final mengikuti baris CFS yang dapat direview/override.",
      },
    ),
    valueRow(periodAnalyses, "wc-total", "Total perubahan neto working capital", "Cash Flow Statement", "Final CFS row: perubahan OCA + perubahan OCL", (item) =>
      cashFlowValue("working-capital-effect", item.period.id),
      "subtotal",
      undefined,
      {
        sourceType: "formula",
        lockReason: "Subtotal mengikuti final baris CFS OCA/OCL.",
      },
    ),
    valueRow(periodAnalyses, "capex", "Kurang: capital expenditures", "Jadwal aset tetap atau mutasi terinferensi", "-capital expenditure", capitalExpenditureCashFlow, undefined, undefined, {
      sourceType: "interoperable",
      lockReason: "Mengikuti Aset Tetap / jadwal aset tetap.",
    }),
    valueRow(periodAnalyses, "gross-investment", "Investasi bruto", "Model terkoreksi", "Dampak arus kas modal kerja + capex", grossInvestment, "subtotal", undefined, {
      sourceType: "formula",
      lockReason: "Formula dari final working capital dan capex.",
    }),
    valueRow(periodAnalyses, "fcf", "Free Cash Flow (FCF)", "Model terkoreksi", "Arus kas bruto + investasi bruto", freeCashFlow, "subtotal", undefined, {
      sourceType: "formula",
      lockReason: "Formula FCF mengikuti workbook FCF: Gross Cash Flow + Gross Investment.",
    }),
  ];
}

function buildRatioRows(periodAnalyses: PeriodAnalysis[], analysisValueOverrides: AnalysisValueOverrideState): RatioRow[] {
  const rows: RatioRow[] = [
    ratioRow(periodAnalyses, "gross-margin", "Margin laba kotor", "Laba Rugi", "Laba kotor / revenue", "percent", (item) =>
      safeRatio(item.snapshot.revenue + item.snapshot.cogs, item.snapshot.revenue),
    ),
    ratioRow(periodAnalyses, "ebitda-margin", "Margin EBITDA", "Model terkoreksi", "EBITDA / revenue", "percent", (item) => safeRatio(item.ebitda, item.snapshot.revenue)),
    ratioRow(periodAnalyses, "ebit-margin", "Margin EBIT", "Model terkoreksi", "EBIT komersial / revenue", "percent", (item) =>
      safeRatio(item.snapshot.ebit, item.snapshot.revenue),
    ),
    ratioRow(periodAnalyses, "net-profit-margin", "Margin laba bersih", "Laba Rugi", "NPAT komersial / revenue", "percent", (item) =>
      safeRatio(item.snapshot.commercialNpat, item.snapshot.revenue),
    ),
    ratioRow(periodAnalyses, "roa", "Return on Assets (ROA)", "Model terkoreksi", "NPAT komersial / total aset", "percent", (item) =>
      safeRatio(item.snapshot.commercialNpat, item.snapshot.totalAssets),
    ),
    ratioRow(periodAnalyses, "roe", "Return on Equity (ROE)", "Model terkoreksi", "NPAT komersial / book equity", "percent", (item) =>
      safeRatio(item.snapshot.commercialNpat, item.snapshot.bookEquity),
    ),
    ratioRow(periodAnalyses, "current-ratio", "Rasio lancar (Current Ratio)", "Neraca", "Aset lancar / liabilitas lancar", "multiple", (item) =>
      safeRatio(item.snapshot.currentAssets, item.snapshot.currentLiabilities),
    ),
    ratioRow(periodAnalyses, "quick-ratio", "Rasio cepat (Quick Ratio)", "Neraca", "(Kas + AR) / liabilitas lancar", "multiple", (item) =>
      safeRatio(item.snapshot.cashOnHand + item.snapshot.cashOnBankDeposit + item.snapshot.accountReceivable, item.snapshot.currentLiabilities),
    ),
    ratioRow(periodAnalyses, "cash-ratio", "Rasio kas", "Neraca", "Kas / liabilitas lancar", "multiple", (item) =>
      safeRatio(item.snapshot.cashOnHand + item.snapshot.cashOnBankDeposit, item.snapshot.currentLiabilities),
    ),
    ratioRow(periodAnalyses, "debt-assets", "Debt to Assets Ratio (DAR)", "Neraca", "Total liabilitas / total aset", "percent", (item) =>
      safeRatio(item.snapshot.totalLiabilities, item.snapshot.totalAssets),
    ),
    ratioRow(periodAnalyses, "debt-equity", "Debt to Equity Ratio (DER)", "Neraca", "Total liabilitas / book equity", "multiple", (item) =>
      safeRatio(item.snapshot.totalLiabilities, item.snapshot.bookEquity),
    ),
    ratioRow(periodAnalyses, "capitalization-ratio", "Capitalization Ratio", "Bridge utang", "Utang jangka panjang / (utang jangka panjang + book equity)", "percent", (item) =>
      safeRatio(item.snapshot.bankLoanLongTerm, item.snapshot.bankLoanLongTerm + item.snapshot.bookEquity),
    ),
    ratioRow(periodAnalyses, "interest-coverage", "Interest Coverage Ratio (ICR)", "Laba Rugi", "EBIT / beban bunga", "multiple", (item) =>
      item.snapshot.interestExpense ? Math.abs(item.snapshot.ebit / item.snapshot.interestExpense) : null,
    ),
    ratioRow(periodAnalyses, "equity-assets", "Equity to Total Assets", "Neraca", "Book equity / total aset", "percent", (item) =>
      safeRatio(item.snapshot.bookEquity, item.snapshot.totalAssets),
    ),
    ratioRow(periodAnalyses, "ocf-sales", "Operating Cash Flow / Sales", "Laporan arus kas terkoreksi", "CFO / revenue", "percent", (item) =>
      item.previousSnapshot ? safeRatio(item.cashFlowFromOperations, item.snapshot.revenue) : null,
      analysisValueOverrides,
      true,
    ),
    ratioRow(periodAnalyses, "fcf-ocf", "FCF / Operating Cash Ratio", "Laporan arus kas terkoreksi", "FCF / operating cash flow", "percent", (item) =>
      item.previousSnapshot ? safeRatio(item.freeCashFlow, item.cashFlowFromOperations) : null,
      analysisValueOverrides,
      true,
    ),
    ratioRow(
      periodAnalyses,
      "short-term-debt-coverage",
      "Short Term Debt Coverage",
      "Bridge utang jangka pendek",
      "Operating cash flow / bank loan short term",
      "multiple",
      (item) => (item.previousSnapshot ? safeRatio(item.cashFlowFromOperations, item.snapshot.bankLoanShortTerm) : null),
      analysisValueOverrides,
      true,
    ),
    ratioRow(periodAnalyses, "capex-coverage", "Capex Coverage", "Laporan arus kas terkoreksi", "Operating cash flow / capex", "multiple", (item) =>
      item.previousSnapshot ? safeRatio(item.cashFlowFromOperations, item.capitalExpenditure) : null,
      analysisValueOverrides,
      true,
    ),
  ];

  return rows;
}

function buildRoicRows(
  periodAnalyses: PeriodAnalysis[],
  analysisValueOverrides: AnalysisValueOverrideState,
  fcfRows: AnalysisRow[],
): AnalysisRow[] {
  const fcfValues = fcfRows.find((row) => row.key === "fcf")?.values ?? {};
  const investedCapitalEndValues = Object.fromEntries(
    periodAnalyses.map((item) => [item.period.id, item.snapshot.totalAssets - nonOperatingAssets(item.snapshot)]),
  );
  const investedCapitalBeginning = valueRow(
    periodAnalyses,
    "invested-capital-beginning",
    "Invested capital awal tahun",
    "Model terkoreksi",
    "Invested capital akhir periode sebelumnya",
    (item, index) => {
      const previousPeriodId = periodAnalyses[index - 1]?.period.id;
      return previousPeriodId ? investedCapitalEndValues[previousPeriodId] ?? null : null;
    },
    undefined,
    undefined,
    {},
    {
      section: "roic",
      display: "currency",
      overrides: analysisValueOverrides,
      comparativeOverride: true,
    },
  );
  const roic = valueRow(
    periodAnalyses,
    "roic",
    "ROIC",
    "Model terkoreksi",
    "FCF / invested capital awal",
    (item) => {
      const beginning = investedCapitalBeginning.values[item.period.id];
      const fcf = fcfValues[item.period.id];
      return beginning && fcf !== null && Number.isFinite(fcf) ? fcf / beginning : null;
    },
    "subtotal",
    undefined,
    {},
    {
      section: "roic",
      display: "percent",
      overrides: analysisValueOverrides,
      comparativeOverride: true,
      allowFirstPeriodOverride: true,
    },
  );

  return [
    valueRow(periodAnalyses, "fcf", "Free Cash Flow (FCF)", "NOPLAT & FCF", "Arus kas bruto + investasi bruto", (item) => fcfValues[item.period.id] ?? null),
    valueRow(periodAnalyses, "total-assets", "Total aset dalam neraca", "Neraca", "Total aset terpetakan atau total komponen turunan", (item) => item.snapshot.totalAssets),
    valueRow(periodAnalyses, "non-operating-assets", "Kurang: aset non-operasional", "Klasifikasi terkoreksi", "Kas/deposito + piutang karyawan + aset surplus + aset tetap non-operasional", (item) =>
      -nonOperatingAssets(item.snapshot),
    ),
    valueRow(periodAnalyses, "invested-capital-end", "Invested capital akhir tahun", "Model terkoreksi", "Total aset dalam neraca + Kurang: aset non-operasional", (item) =>
      investedCapitalEndValues[item.period.id] ?? null,
      "subtotal",
    ),
    investedCapitalBeginning,
    roic,
  ];
}

function valueRow(
  periodAnalyses: PeriodAnalysis[],
  key: string,
  label: string,
  source: string,
  formula: string,
  value: (item: PeriodAnalysis, index: number) => AnalysisValue,
  kind?: AnalysisRow["kind"],
  note?: string,
  extra: Partial<Omit<AnalysisRow, "key" | "label" | "source" | "formula" | "values" | "kind" | "note">> = {},
  overrideConfig?: {
    section: AnalysisValueOverrideSection;
    display: "currency" | "percent" | "multiple";
    overrides: AnalysisValueOverrideState;
    comparativeOverride: boolean;
    allowFirstPeriodOverride?: boolean;
  },
): AnalysisRow {
  const overrideKey = overrideConfig ? buildAnalysisValueOverrideKey(overrideConfig.section, key) : "";
  const calculatedValues = Object.fromEntries(periodAnalyses.map((item, index) => [item.period.id, value(item, index)]));
  const overrideInputs: Record<string, string> = {};
  const overrideAllowedByPeriod: Record<string, boolean> = {};
  const overrideStatuses: Record<string, CashFlowOverrideStatus> = {};
  const validationMessages: Record<string, string> = {};
  const values = Object.fromEntries(
    periodAnalyses.map((item) => {
      const calculatedValue = calculatedValues[item.period.id] ?? null;
      const overrideEntry = overrideConfig?.overrides[overrideKey]?.[item.period.id];
      const overrideInput = overrideEntry?.value ?? "";
      const hasOverrideInput = overrideInput.trim() !== "";
      const isCellOverridable = Boolean(
        overrideConfig?.comparativeOverride &&
          !item.previousSnapshot &&
          (overrideConfig.allowFirstPeriodOverride || calculatedValue === null || !Number.isFinite(calculatedValue)),
      );
      const overrideValue =
        hasOverrideInput && overrideConfig ? parseAnalysisOverrideInput(overrideInput, overrideConfig.display) : null;
      const isOverrideApplied = isCellOverridable && hasOverrideInput;

      overrideInputs[item.period.id] = overrideInput;
      overrideAllowedByPeriod[item.period.id] = isCellOverridable;
      overrideStatuses[item.period.id] = !isCellOverridable ? "not_allowed" : isOverrideApplied ? "applied" : "none";
      validationMessages[item.period.id] =
        !isCellOverridable && hasOverrideInput ? "Override hanya aktif saat baris memerlukan data pembanding." : "";

      return [item.period.id, isOverrideApplied ? overrideValue : calculatedValue];
    }),
  );

  return {
    key,
    label,
    source,
    formula,
    values,
    kind,
    note,
    ...(overrideConfig
      ? {
          isComparativeOverrideable: overrideConfig.comparativeOverride,
          calculatedValues,
          overrideAllowedByPeriod,
          overrideInputs,
          overrideStatuses,
          validationMessages,
        }
      : {}),
    ...extra,
  };
}

function sumNullable(...values: AnalysisValue[]): AnalysisValue {
  if (values.some((value) => value === null || !Number.isFinite(value))) {
    return null;
  }

  return (values as number[]).reduce((sum, value) => sum + value, 0);
}

function negateNullable(value: AnalysisValue): AnalysisValue {
  return value === null || !Number.isFinite(value) ? null : -value;
}

function ratioRow(
  periodAnalyses: PeriodAnalysis[],
  key: string,
  label: string,
  source: string,
  formula: string,
  display: RatioRow["display"],
  value: (item: PeriodAnalysis) => AnalysisValue,
  analysisValueOverrides: AnalysisValueOverrideState = {},
  comparativeOverride = false,
): RatioRow {
  const overrideKey = buildAnalysisValueOverrideKey("ratio", key);
  const calculatedValues = Object.fromEntries(periodAnalyses.map((item) => [item.period.id, value(item)]));
  const overrideInputs: Record<string, string> = {};
  const overrideAllowedByPeriod: Record<string, boolean> = {};
  const overrideStatuses: Record<string, CashFlowOverrideStatus> = {};
  const validationMessages: Record<string, string> = {};
  const values = Object.fromEntries(
    periodAnalyses.map((item) => {
      const calculatedValue = calculatedValues[item.period.id] ?? null;
      const overrideEntry = analysisValueOverrides[overrideKey]?.[item.period.id];
      const overrideInput = overrideEntry?.value ?? "";
      const hasOverrideInput = overrideInput.trim() !== "";
      const isCellOverridable = Boolean(
        comparativeOverride && !item.previousSnapshot && (calculatedValue === null || !Number.isFinite(calculatedValue)),
      );
      const overrideValue = hasOverrideInput ? parseAnalysisOverrideInput(overrideInput, display) : null;
      const isOverrideApplied = isCellOverridable && hasOverrideInput;

      overrideInputs[item.period.id] = overrideInput;
      overrideAllowedByPeriod[item.period.id] = isCellOverridable;
      overrideStatuses[item.period.id] = !isCellOverridable ? "not_allowed" : isOverrideApplied ? "applied" : "none";
      validationMessages[item.period.id] =
        !isCellOverridable && hasOverrideInput ? "Override hanya aktif saat baris memerlukan data pembanding." : "";

      return [item.period.id, isOverrideApplied ? overrideValue : calculatedValue];
    }),
  );
  const numericValues = Object.values(values).filter((item): item is number => item !== null && Number.isFinite(item));

  return {
    key,
    label,
    source,
    formula,
    values,
    display,
    average: numericValues.length ? numericValues.reduce((sum, item) => sum + item, 0) / numericValues.length : null,
    ...(comparativeOverride
      ? {
          isComparativeOverrideable: true,
          calculatedValues,
          overrideAllowedByPeriod,
          overrideInputs,
          overrideStatuses,
          validationMessages,
        }
      : {}),
  };
}

function parseAnalysisOverrideInput(input: string, display: "currency" | "percent" | "multiple"): AnalysisValue {
  if (!input.trim()) {
    return null;
  }

  const parsed = parseInputNumber(input);
  return display === "percent" ? parsed / 100 : parsed;
}

function sectionRow(key: string, label: string): AnalysisRow {
  return {
    key,
    label,
    source: "",
    formula: "",
    values: {},
    kind: "section",
  };
}

function buildLoanMovement(debtSchedule: DebtSchedulePeriodAmounts): PeriodAnalysis["loanMovement"] {
  return {
    shortTermBeginning: debtSchedule.shortTermBeginning,
    shortTermAddition: debtSchedule.shortTermAddition,
    shortTermRepayment: debtSchedule.shortTermRepayment,
    shortTermEnding: debtSchedule.shortTermEnding,
    longTermBeginning: debtSchedule.longTermBeginning,
    longTermAddition: debtSchedule.longTermAddition,
    longTermRepayment: debtSchedule.longTermRepayment,
    longTermEnding: debtSchedule.longTermEnding,
  };
}

function createEmptyDebtSchedulePeriodAmounts(): DebtSchedulePeriodAmounts {
  return {
    shortTermLoanRate: 0,
    shortTermBeginning: 0,
    shortTermAddition: 0,
    shortTermRepayment: 0,
    shortTermEnding: 0,
    shortTermInterestPayable: 0,
    longTermLoanRate: 0,
    longTermBeginning: 0,
    longTermAddition: 0,
    longTermRepayment: 0,
    longTermEnding: 0,
    longTermInterestPayable: 0,
    interestPayable: 0,
    interestBearingDebt: 0,
    totalDebtSchedule: 0,
    usesManualLongTermSchedule: false,
    usesManualInterestPayable: false,
  };
}

function inferCapitalExpenditure(
  snapshot: FinancialStatementSnapshot,
  previousSnapshot: FinancialStatementSnapshot | null,
  depreciationAddback: number,
): number {
  if (!previousSnapshot) {
    return 0;
  }

  return snapshot.fixedAssetsNet - previousSnapshot.fixedAssetsNet + depreciationAddback;
}

function safeRatio(numerator: number, denominator: number): number | null {
  if (!denominator) {
    return null;
  }

  const ratio = numerator / denominator;
  return Number.isFinite(ratio) ? ratio : null;
}
