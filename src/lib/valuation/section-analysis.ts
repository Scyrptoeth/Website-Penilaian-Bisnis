import {
  buildFixedAssetScheduleSummary,
  buildSnapshot,
  getChronologicalPeriods,
  parseInputNumber,
  type AccountRow,
  type AssumptionState,
  type FixedAssetScheduleRow,
  type Period,
} from "./case-model";
import {
  interestBearingDebt,
  nonOperatingAssets,
  normalizedNoplat,
  operatingCurrentAssets,
  operatingCurrentLiabilities,
  operatingWorkingCapital,
} from "./calculations";
import type { FinancialStatementSnapshot } from "./types";

export type AnalysisValue = number | null;

export type AnalysisRow = {
  key: string;
  label: string;
  source: string;
  formula: string;
  values: Record<string, AnalysisValue>;
  note?: string;
  kind?: "section" | "subtotal" | "warning";
};

export type CashFlowOverrideEntry = {
  value: string;
  reason: string;
  updatedAt: string;
};

export type CashFlowOverrideState = Record<string, Record<string, CashFlowOverrideEntry>>;

export type CashFlowOverrideStatus = "none" | "applied" | "not_allowed";

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

export type PeriodAnalysis = {
  period: Period;
  snapshot: FinancialStatementSnapshot;
  previousSnapshot: FinancialStatementSnapshot | null;
  operatingCurrentAssets: number;
  operatingCurrentLiabilities: number;
  operatingWorkingCapital: number;
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

export function buildSectionAnalysis(
  periods: Period[],
  rows: AccountRow[],
  assumptions: AssumptionState,
  fixedAssetScheduleRows: FixedAssetScheduleRow[] = [],
  cashFlowOverrides: CashFlowOverrideState = {},
): SectionAnalysis {
  const chronologicalPeriods = getChronologicalPeriods(periods);
  const fixedAssetSchedule = buildFixedAssetScheduleSummary(periods, fixedAssetScheduleRows);
  const snapshots = new Map(
    chronologicalPeriods.map((period) => [period.id, buildSnapshot(periods, period.id, rows, assumptions, fixedAssetScheduleRows)]),
  );

  const periodAnalyses = chronologicalPeriods.map((period, index): PeriodAnalysis => {
    const snapshot = snapshots.get(period.id) ?? buildSnapshot(periods, period.id, rows, assumptions, fixedAssetScheduleRows);
    const previousPeriod = chronologicalPeriods[index - 1];
    const previousSnapshot = previousPeriod ? (snapshots.get(previousPeriod.id) ?? null) : null;
    const scheduleAmounts = fixedAssetSchedule.totals[period.id];
    const depreciationAddback = Math.max(0, -snapshot.depreciation);
    const capitalExpenditure = fixedAssetSchedule.hasInput
      ? Math.abs(scheduleAmounts?.acquisitionAdditions ?? 0)
      : inferCapitalExpenditure(snapshot, previousSnapshot, depreciationAddback);
    const currentOperatingAssets = operatingCurrentAssets(snapshot);
    const currentOperatingLiabilities = operatingCurrentLiabilities(snapshot);
    const previousOperatingAssets = previousSnapshot ? operatingCurrentAssets(previousSnapshot) : currentOperatingAssets;
    const previousOperatingLiabilities = previousSnapshot ? operatingCurrentLiabilities(previousSnapshot) : currentOperatingLiabilities;
    const changeInOperatingCurrentAssets = previousSnapshot ? -(currentOperatingAssets - previousOperatingAssets) : 0;
    const changeInOperatingCurrentLiabilities = previousSnapshot ? currentOperatingLiabilities - previousOperatingLiabilities : 0;
    const workingCapitalCashFlowEffect = changeInOperatingCurrentAssets + changeInOperatingCurrentLiabilities;
    const normalizedTaxOnEbit = snapshot.ebit * snapshot.taxRate;
    const noplat = normalizedNoplat(snapshot);
    const ebitda = snapshot.ebit + depreciationAddback;
    const operatingTaxCashFlow = snapshot.corporateTax || -normalizedTaxOnEbit;
    const cashFlowFromOperations = ebitda + operatingTaxCashFlow + workingCapitalCashFlowEffect;
    const capitalExpenditureCashFlow = -capitalExpenditure;
    const freeCashFlow = noplat + depreciationAddback + workingCapitalCashFlowEffect + capitalExpenditureCashFlow;
    const investedCapitalEnd = snapshot.fixedAssetsNet + operatingWorkingCapital(snapshot);
    const previousInvestedCapitalEnd = previousSnapshot ? previousSnapshot.fixedAssetsNet + operatingWorkingCapital(previousSnapshot) : null;
    const cashTotal = snapshot.cashOnHand + snapshot.cashOnBankDeposit;
    const previousCashTotal = previousSnapshot ? previousSnapshot.cashOnHand + previousSnapshot.cashOnBankDeposit : null;
    const cashMovement = previousCashTotal === null ? null : cashTotal - previousCashTotal;
    const loanMovement = buildLoanMovement(snapshot, previousSnapshot);
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
      operatingWorkingCapital: operatingWorkingCapital(snapshot),
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
      roic: previousInvestedCapitalEnd ? noplat / previousInvestedCapitalEnd : null,
      cashMovement,
      correctedNetCashFlow,
      cashFlowRollforwardGap,
      loanMovement,
    };
  });

  return {
    periods: chronologicalPeriods,
    periodAnalyses,
    payablesRows: buildPayablesRows(periodAnalyses),
    cashFlowRows: buildCashFlowRows(periodAnalyses),
    cashFlowStatementRows: buildCashFlowStatementRows(periodAnalyses, cashFlowOverrides),
    noplatRows: buildNoplatRows(periodAnalyses),
    fcfRows: buildFcfRows(periodAnalyses),
    ratioRows: buildRatioRows(periodAnalyses),
    roicRows: buildRoicRows(periodAnalyses),
  };
}

function buildPayablesRows(periodAnalyses: PeriodAnalysis[]): AnalysisRow[] {
  return [
    sectionRow("bank-loan-short-section", "Pinjaman bank jangka pendek"),
    valueRow(periodAnalyses, "short-beginning", "Saldo awal", "Saldo akhir pinjaman jangka pendek periode sebelumnya", "Saldo akhir periode sebelumnya", (item) => item.loanMovement.shortTermBeginning),
    valueRow(periodAnalyses, "short-addition", "Penambahan", "Mutasi positif pinjaman bank jangka pendek", "max(Saldo akhir - saldo awal, 0)", (item) => item.loanMovement.shortTermAddition),
    valueRow(periodAnalyses, "short-repayment", "Pembayaran kembali", "Mutasi negatif pinjaman bank jangka pendek", "min(Saldo akhir - saldo awal, 0)", (item) => item.loanMovement.shortTermRepayment),
    valueRow(periodAnalyses, "short-ending", "Saldo akhir", "Terpetakan pinjaman bank jangka pendek", "Saldo awal + penambahan + pembayaran kembali", (item) => item.loanMovement.shortTermEnding, "subtotal"),
    sectionRow("bank-loan-long-section", "Pinjaman bank jangka panjang"),
    valueRow(periodAnalyses, "long-beginning", "Saldo awal", "Saldo akhir pinjaman jangka panjang periode sebelumnya", "Saldo akhir periode sebelumnya", (item) => item.loanMovement.longTermBeginning),
    valueRow(periodAnalyses, "long-addition", "Penambahan", "Mutasi positif pinjaman bank jangka panjang", "max(Saldo akhir - saldo awal, 0)", (item) => item.loanMovement.longTermAddition),
    valueRow(periodAnalyses, "long-repayment", "Pembayaran kembali", "Mutasi negatif pinjaman bank jangka panjang", "min(Saldo akhir - saldo awal, 0)", (item) => item.loanMovement.longTermRepayment),
    valueRow(periodAnalyses, "long-ending", "Saldo akhir", "Terpetakan pinjaman bank jangka panjang / utang berbunga", "Saldo awal + penambahan + pembayaran kembali", (item) => item.loanMovement.longTermEnding, "subtotal"),
    valueRow(periodAnalyses, "interest-payable", "Utang bunga", "Terpetakan utang bunga", "Saldo input", (item) => item.snapshot.interestPayable),
    valueRow(periodAnalyses, "interest-bearing-debt", "Utang berbunga", "Debt bridge", "Pinjaman bank jangka pendek + pinjaman bank jangka panjang", (item) => interestBearingDebt(item.snapshot), "subtotal"),
  ];
}

function buildCashFlowRows(periodAnalyses: PeriodAnalysis[]): AnalysisRow[] {
  return [
    valueRow(periodAnalyses, "ebitda", "EBITDA", "Model terkoreksi", "EBIT komersial + add-back penyusutan", (item) => item.ebitda),
    valueRow(periodAnalyses, "operating-tax", "Arus kas pajak operasional", "Input atau fallback ternormalisasi", "Input pajak badan, jika kosong -(EBIT x tarif pajak)", (item) => item.snapshot.corporateTax || -item.normalizedTaxOnEbit),
    sectionRow("wc-section", "Perubahan Operating Working Capital"),
    valueRow(periodAnalyses, "oca-change", "Aset lancar operasional", "Mutasi AR + persediaan", "-(OCA kini - OCA sebelumnya)", (item) =>
      item.previousSnapshot ? -(operatingCurrentAssets(item.snapshot) - operatingCurrentAssets(item.previousSnapshot)) : null,
    ),
    valueRow(periodAnalyses, "ocl-change", "Liabilitas lancar operasional", "Mutasi AP + utang lain-lain", "OCL kini - OCL sebelumnya", (item) =>
      item.previousSnapshot ? operatingCurrentLiabilities(item.snapshot) - operatingCurrentLiabilities(item.previousSnapshot) : null,
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
      item.previousSnapshot ? -item.capitalExpenditure : null,
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
    isOverridable: true,
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
    isOverridable: true,
    calculate: (item) => item.snapshot.corporateTax || -item.normalizedTaxOnEbit,
  },
  {
    key: "oca-change",
    label: "(Kenaikan) penurunan aset lancar operasional",
    section: "working_capital",
    source: "Balance Sheet AR + inventory",
    formula: "-((AR + inventory) kini - (AR + inventory) sebelumnya)",
    workbookReference: "CFS!8; BALANCE SHEET!10,12",
    reliability: "derived",
    isOverridable: true,
    calculate: (item) =>
      item.previousSnapshot ? -(operatingCurrentAssets(item.snapshot) - operatingCurrentAssets(item.previousSnapshot)) : null,
  },
  {
    key: "ocl-change",
    label: "Kenaikan (penurunan) liabilitas lancar operasional",
    section: "working_capital",
    source: "Balance Sheet AP + utang lain-lain",
    formula: "(AP + other payable) kini - (AP + other payable) sebelumnya",
    workbookReference: "CFS!9; BALANCE SHEET!31,33",
    reliability: "derived",
    isOverridable: true,
    calculate: (item) =>
      item.previousSnapshot ? operatingCurrentLiabilities(item.snapshot) - operatingCurrentLiabilities(item.previousSnapshot) : null,
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
    isOverridable: true,
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
    isOverridable: true,
    calculate: (item) => (item.previousSnapshot ? -item.capitalExpenditure : null),
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
    isOverridable: true,
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
    isOverridable: true,
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
      const isOverrideApplied = spec.isOverridable && hasOverrideInput;
      const finalValue = isOverrideApplied ? overrideValue : calculatedValue;
      const status: CashFlowOverrideStatus = !spec.isOverridable
        ? "not_allowed"
        : isOverrideApplied
          ? "applied"
          : "none";

      finalValues[spec.key] = finalValue;

      const row = rows[index];
      row.calculatedValues[item.period.id] = calculatedValue;
      row.overrideInputs[item.period.id] = overrideInput;
      row.overrideValues[item.period.id] = isOverrideApplied ? overrideValue : null;
      row.overrideReasons[item.period.id] = overrideReason;
      row.overrideStatuses[item.period.id] = status;
      row.overrideUpdatedAt[item.period.id] = overrideEntry?.updatedAt ?? "";
      row.validationMessages[item.period.id] = "";
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
    valueRow(periodAnalyses, "tax-on-ebit", "Pajak statutory atas EBIT", "Asumsi", "EBIT komersial x tarif pajak statutory", (item) => item.normalizedTaxOnEbit),
    valueRow(periodAnalyses, "tax-shields-excluded", "Tax shield / efek pajak non-operasional dikeluarkan", "Basis valuasi terkoreksi", "0", () => 0),
    valueRow(periodAnalyses, "noplat", "NOPLAT", "Model terkoreksi", "EBIT komersial - pajak statutory atas EBIT", (item) => item.normalizedNoplat, "subtotal"),
  ];
}

function buildFcfRows(periodAnalyses: PeriodAnalysis[]): AnalysisRow[] {
  return [
    valueRow(periodAnalyses, "noplat", "NOPLAT", "NOPLAT terkoreksi", "EBIT komersial x (1 - tarif pajak)", (item) => item.normalizedNoplat),
    valueRow(periodAnalyses, "depreciation", "Tambah: penyusutan", "Penyusutan terpetakan / jadwal aset tetap", "-beban penyusutan", (item) => item.depreciationAddback),
    valueRow(periodAnalyses, "gross-cash-flow", "Arus kas bruto", "Model terkoreksi", "NOPLAT + penyusutan", (item) => item.normalizedNoplat + item.depreciationAddback, "subtotal"),
    sectionRow("wc-section", "Perubahan Working Capital"),
    valueRow(periodAnalyses, "oca-change", "(Kenaikan) penurunan aset lancar operasional", "Mutasi AR + persediaan", "-(OCA kini - OCA sebelumnya)", (item) =>
      item.previousSnapshot ? -(operatingCurrentAssets(item.snapshot) - operatingCurrentAssets(item.previousSnapshot)) : null,
    ),
    valueRow(periodAnalyses, "ocl-change", "Kenaikan (penurunan) liabilitas lancar operasional", "Mutasi AP + utang lain-lain", "OCL kini - OCL sebelumnya", (item) =>
      item.previousSnapshot ? operatingCurrentLiabilities(item.snapshot) - operatingCurrentLiabilities(item.previousSnapshot) : null,
    ),
    valueRow(periodAnalyses, "wc-total", "Total perubahan neto working capital", "Operating WC terkoreksi", "Perubahan OCA + perubahan OCL", (item) =>
      item.previousSnapshot ? item.workingCapitalCashFlowEffect : null,
      "subtotal",
    ),
    valueRow(periodAnalyses, "capex", "Kurang: capital expenditures", "Jadwal aset tetap atau mutasi terinferensi", "-capital expenditure", (item) =>
      item.previousSnapshot ? -item.capitalExpenditure : null,
    ),
    valueRow(periodAnalyses, "gross-investment", "Investasi bruto", "Model terkoreksi", "Dampak arus kas modal kerja - capex", (item) =>
      item.previousSnapshot ? item.workingCapitalCashFlowEffect - item.capitalExpenditure : null,
      "subtotal",
    ),
    valueRow(periodAnalyses, "fcf", "Free Cash Flow (FCF)", "Model terkoreksi", "NOPLAT + penyusutan + dampak WC - capex", (item) =>
      item.previousSnapshot ? item.freeCashFlow : null,
      "subtotal",
    ),
  ];
}

function buildRatioRows(periodAnalyses: PeriodAnalysis[]): RatioRow[] {
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
    ),
  ];

  return rows;
}

function buildRoicRows(periodAnalyses: PeriodAnalysis[]): AnalysisRow[] {
  return [
    valueRow(periodAnalyses, "noplat", "NOPLAT", "NOPLAT terkoreksi", "EBIT komersial x (1 - tarif pajak)", (item) => item.normalizedNoplat),
    valueRow(periodAnalyses, "total-assets", "Total aset dalam neraca", "Neraca", "Total aset terpetakan atau total komponen turunan", (item) => item.snapshot.totalAssets),
    valueRow(periodAnalyses, "non-operating-assets", "Kurang: aset non-operasional", "Klasifikasi terkoreksi", "Kas/deposito + piutang karyawan + aset surplus + aset tetap non-operasional", (item) =>
      -nonOperatingAssets(item.snapshot),
    ),
    valueRow(periodAnalyses, "operating-nwc", "Operating working capital", "Klasifikasi terkoreksi", "AR + persediaan - AP - utang lain-lain", (item) => item.operatingWorkingCapital),
    valueRow(periodAnalyses, "fixed-assets-net", "Aset tetap operasional neto", "Model aset tetap", "Aset tetap neto kecuali aset idle teridentifikasi", (item) => item.snapshot.fixedAssetsNet),
    valueRow(periodAnalyses, "invested-capital-end", "Invested capital akhir tahun", "Model terkoreksi", "Aset tetap neto + operating working capital", (item) => item.investedCapitalEnd, "subtotal"),
    valueRow(periodAnalyses, "invested-capital-beginning", "Invested capital awal tahun", "Model terkoreksi", "Invested capital akhir periode sebelumnya", (item) => item.investedCapitalBeginning),
    valueRow(periodAnalyses, "roic", "ROIC", "Model terkoreksi", "NOPLAT / invested capital awal", (item) => item.roic, "subtotal"),
  ];
}

function valueRow(
  periodAnalyses: PeriodAnalysis[],
  key: string,
  label: string,
  source: string,
  formula: string,
  value: (item: PeriodAnalysis) => AnalysisValue,
  kind?: AnalysisRow["kind"],
  note?: string,
): AnalysisRow {
  return {
    key,
    label,
    source,
    formula,
    values: Object.fromEntries(periodAnalyses.map((item) => [item.period.id, value(item)])),
    kind,
    note,
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
): RatioRow {
  const values = Object.fromEntries(periodAnalyses.map((item) => [item.period.id, value(item)]));
  const numericValues = Object.values(values).filter((item): item is number => item !== null && Number.isFinite(item));

  return {
    key,
    label,
    source,
    formula,
    values,
    display,
    average: numericValues.length ? numericValues.reduce((sum, item) => sum + item, 0) / numericValues.length : null,
  };
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

function buildLoanMovement(snapshot: FinancialStatementSnapshot, previousSnapshot: FinancialStatementSnapshot | null): PeriodAnalysis["loanMovement"] {
  const shortTermBeginning = previousSnapshot?.bankLoanShortTerm ?? 0;
  const longTermBeginning = previousSnapshot?.bankLoanLongTerm ?? 0;
  const shortTermEnding = snapshot.bankLoanShortTerm;
  const longTermEnding = snapshot.bankLoanLongTerm;
  const shortTermDelta = shortTermEnding - shortTermBeginning;
  const longTermDelta = longTermEnding - longTermBeginning;

  return {
    shortTermBeginning,
    shortTermAddition: Math.max(shortTermDelta, 0),
    shortTermRepayment: Math.min(shortTermDelta, 0),
    shortTermEnding,
    longTermBeginning,
    longTermAddition: Math.max(longTermDelta, 0),
    longTermRepayment: Math.min(longTermDelta, 0),
    longTermEnding,
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

  return Math.max(0, snapshot.fixedAssetsNet - previousSnapshot.fixedAssetsNet + depreciationAddback);
}

function safeRatio(numerator: number, denominator: number): number | null {
  if (!denominator) {
    return null;
  }

  const ratio = numerator / denominator;
  return Number.isFinite(ratio) ? ratio : null;
}
