import {
  buildFixedAssetScheduleSummary,
  buildSnapshot,
  getChronologicalPeriods,
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
