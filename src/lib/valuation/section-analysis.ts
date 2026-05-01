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
    sectionRow("bank-loan-short-section", "Bank Loan - Short Term"),
    valueRow(periodAnalyses, "short-beginning", "Beginning", "Prior period ending short-term bank loan", "Prior ending balance", (item) => item.loanMovement.shortTermBeginning),
    valueRow(periodAnalyses, "short-addition", "Addition", "Positive movement in short-term bank loan", "max(Ending - Beginning, 0)", (item) => item.loanMovement.shortTermAddition),
    valueRow(periodAnalyses, "short-repayment", "Repayment", "Negative movement in short-term bank loan", "min(Ending - Beginning, 0)", (item) => item.loanMovement.shortTermRepayment),
    valueRow(periodAnalyses, "short-ending", "Ending", "Mapped BANK_LOAN_SHORT_TERM", "Beginning + addition + repayment", (item) => item.loanMovement.shortTermEnding, "subtotal"),
    sectionRow("bank-loan-long-section", "Bank Loan - Long Term"),
    valueRow(periodAnalyses, "long-beginning", "Beginning", "Prior period ending long-term bank loan", "Prior ending balance", (item) => item.loanMovement.longTermBeginning),
    valueRow(periodAnalyses, "long-addition", "Addition", "Positive movement in long-term bank loan", "max(Ending - Beginning, 0)", (item) => item.loanMovement.longTermAddition),
    valueRow(periodAnalyses, "long-repayment", "Repayment", "Negative movement in long-term bank loan", "min(Ending - Beginning, 0)", (item) => item.loanMovement.longTermRepayment),
    valueRow(periodAnalyses, "long-ending", "Ending", "Mapped BANK_LOAN_LONG_TERM / INTEREST_BEARING_DEBT", "Beginning + addition + repayment", (item) => item.loanMovement.longTermEnding, "subtotal"),
    valueRow(periodAnalyses, "interest-payable", "Interest payable", "Mapped INTEREST_PAYABLE", "Input balance", (item) => item.snapshot.interestPayable),
    valueRow(periodAnalyses, "interest-bearing-debt", "Interest-bearing debt", "Debt bridge", "Short-term bank loan + long-term bank loan", (item) => interestBearingDebt(item.snapshot), "subtotal"),
  ];
}

function buildCashFlowRows(periodAnalyses: PeriodAnalysis[]): AnalysisRow[] {
  return [
    valueRow(periodAnalyses, "ebitda", "EBITDA", "Corrected model", "Commercial EBIT + depreciation add-back", (item) => item.ebitda),
    valueRow(periodAnalyses, "operating-tax", "Operating tax cash flow", "Input or normalized fallback", "Corporate tax input, otherwise -(EBIT x tax rate)", (item) => item.snapshot.corporateTax || -item.normalizedTaxOnEbit),
    sectionRow("wc-section", "Changes in Operating Working Capital"),
    valueRow(periodAnalyses, "oca-change", "Operating current assets", "AR + inventory movement", "-(current OCA - prior OCA)", (item) =>
      item.previousSnapshot ? -(operatingCurrentAssets(item.snapshot) - operatingCurrentAssets(item.previousSnapshot)) : null,
    ),
    valueRow(periodAnalyses, "ocl-change", "Operating current liabilities", "AP + other payable movement", "Current OCL - prior OCL", (item) =>
      item.previousSnapshot ? operatingCurrentLiabilities(item.snapshot) - operatingCurrentLiabilities(item.previousSnapshot) : null,
    ),
    valueRow(periodAnalyses, "wc-change", "Working capital cash-flow effect", "Corrected operating WC", "OCA change + OCL change", (item) =>
      item.previousSnapshot ? item.workingCapitalCashFlowEffect : null,
      "subtotal",
    ),
    valueRow(periodAnalyses, "cfo", "Cash Flow from Operations", "Corrected model", "EBITDA + operating tax + operating WC change", (item) =>
      item.previousSnapshot ? item.cashFlowFromOperations : null,
      "subtotal",
    ),
    valueRow(periodAnalyses, "non-operating-income", "Cash Flow from Non Operations", "Mapped NON_OPERATING_INCOME", "Non-operating income / expense", (item) => item.snapshot.nonOperatingIncome),
    valueRow(periodAnalyses, "capex", "Cash Flow from Investment / Capex", "Fixed asset schedule or inferred movement", "-capital expenditure", (item) =>
      item.previousSnapshot ? -item.capitalExpenditure : null,
    ),
    valueRow(periodAnalyses, "cf-before-financing", "Cash Flow before Financing", "Corrected model", "CFO + non-operating income - capex", (item) =>
      item.previousSnapshot ? item.cashFlowFromOperations + item.snapshot.nonOperatingIncome - item.capitalExpenditure : null,
      "subtotal",
    ),
    sectionRow("financing-section", "Financing"),
    valueRow(periodAnalyses, "equity-injection", "Equity injection movement", "Paid-up/additional capital movement", "Current capital - prior capital", (item) =>
      item.previousSnapshot
        ? item.snapshot.paidUpCapital + item.snapshot.additionalPaidInCapital - (item.previousSnapshot.paidUpCapital + item.previousSnapshot.additionalPaidInCapital)
        : null,
    ),
    valueRow(periodAnalyses, "new-loan", "New loan", "Payables schedule", "Positive debt movement", (item) =>
      item.previousSnapshot ? item.loanMovement.shortTermAddition + item.loanMovement.longTermAddition : null,
    ),
    valueRow(periodAnalyses, "interest-payment", "Interest payment", "Mapped INTEREST_EXPENSE", "Interest expense cash-flow line", (item) => item.snapshot.interestExpense),
    valueRow(periodAnalyses, "interest-income", "Interest income", "Mapped INTEREST_INCOME", "Interest income cash-flow line", (item) => item.snapshot.interestIncome),
    valueRow(periodAnalyses, "principal-repayment", "Principal repayment", "Payables schedule", "Negative debt movement", (item) =>
      item.previousSnapshot ? item.loanMovement.shortTermRepayment + item.loanMovement.longTermRepayment : null,
    ),
    valueRow(periodAnalyses, "cff", "Cash Flow from Financing", "Corrected movement bridge", "Equity movement + new loan + interest + principal repayment", (item) =>
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
    valueRow(periodAnalyses, "net-cash-flow", "Net Cash Flow", "Corrected model", "Cash flow before financing + CFF", (item) =>
      item.previousSnapshot ? item.correctedNetCashFlow : null,
      "subtotal",
    ),
    valueRow(periodAnalyses, "cash-movement", "Cash movement check", "Cash on hand + cash on bank", "Ending cash - prior cash", (item) => item.cashMovement),
    valueRow(periodAnalyses, "cash-gap", "Cash roll-forward gap", "Audit check", "Corrected net cash flow - cash movement", (item) => item.cashFlowRollforwardGap, "warning"),
  ];
}

function buildNoplatRows(periodAnalyses: PeriodAnalysis[]): AnalysisRow[] {
  return [
    valueRow(periodAnalyses, "pbt", "Profit Before Tax", "Corrected operating bridge", "EBIT + interest income + interest expense + non-operating income", (item) =>
      item.snapshot.ebit + item.snapshot.interestIncome + item.snapshot.interestExpense + item.snapshot.nonOperatingIncome,
    ),
    valueRow(periodAnalyses, "add-interest", "Add: Interest Expenses", "Mapped INTEREST_EXPENSE", "-interest expense", (item) => -item.snapshot.interestExpense),
    valueRow(periodAnalyses, "less-interest-income", "Less: Interest Income", "Mapped INTEREST_INCOME", "-interest income", (item) => -item.snapshot.interestIncome),
    valueRow(periodAnalyses, "less-non-operating", "Less: Non Operating Income", "Mapped NON_OPERATING_INCOME", "-non-operating income / expense", (item) => -item.snapshot.nonOperatingIncome),
    valueRow(periodAnalyses, "ebit", "Commercial EBIT", "Corrected model", "Operating EBIT after excluding financing/non-operating items", (item) => item.snapshot.ebit, "subtotal"),
    valueRow(periodAnalyses, "tax-on-ebit", "Statutory Tax on EBIT", "Assumptions", "Commercial EBIT x statutory tax rate", (item) => item.normalizedTaxOnEbit),
    valueRow(periodAnalyses, "tax-shields-excluded", "Tax shields / non-operating tax effects excluded", "Corrected valuation basis", "0", () => 0),
    valueRow(periodAnalyses, "noplat", "NOPLAT", "Corrected model", "Commercial EBIT - statutory tax on EBIT", (item) => item.normalizedNoplat, "subtotal"),
  ];
}

function buildFcfRows(periodAnalyses: PeriodAnalysis[]): AnalysisRow[] {
  return [
    valueRow(periodAnalyses, "noplat", "NOPLAT", "Corrected NOPLAT", "Commercial EBIT x (1 - tax rate)", (item) => item.normalizedNoplat),
    valueRow(periodAnalyses, "depreciation", "Add: Depreciation", "Mapped depreciation / fixed asset schedule", "-depreciation expense", (item) => item.depreciationAddback),
    valueRow(periodAnalyses, "gross-cash-flow", "Gross Cash Flow", "Corrected model", "NOPLAT + depreciation", (item) => item.normalizedNoplat + item.depreciationAddback, "subtotal"),
    sectionRow("wc-section", "Changes in Working Capital"),
    valueRow(periodAnalyses, "oca-change", "(Increase) Decrease in Operating Current Assets", "AR + inventory movement", "-(current OCA - prior OCA)", (item) =>
      item.previousSnapshot ? -(operatingCurrentAssets(item.snapshot) - operatingCurrentAssets(item.previousSnapshot)) : null,
    ),
    valueRow(periodAnalyses, "ocl-change", "Increase (Decrease) in Operating Current Liabilities", "AP + other payable movement", "Current OCL - prior OCL", (item) =>
      item.previousSnapshot ? operatingCurrentLiabilities(item.snapshot) - operatingCurrentLiabilities(item.previousSnapshot) : null,
    ),
    valueRow(periodAnalyses, "wc-total", "Total Net Changes in Working Capital", "Corrected operating WC", "OCA change + OCL change", (item) =>
      item.previousSnapshot ? item.workingCapitalCashFlowEffect : null,
      "subtotal",
    ),
    valueRow(periodAnalyses, "capex", "Less: Capital Expenditures", "Fixed asset schedule or inferred movement", "-capital expenditure", (item) =>
      item.previousSnapshot ? -item.capitalExpenditure : null,
    ),
    valueRow(periodAnalyses, "gross-investment", "Gross Investment", "Corrected model", "Working capital cash-flow effect - capex", (item) =>
      item.previousSnapshot ? item.workingCapitalCashFlowEffect - item.capitalExpenditure : null,
      "subtotal",
    ),
    valueRow(periodAnalyses, "fcf", "Free Cash Flow", "Corrected model", "NOPLAT + depreciation + WC effect - capex", (item) =>
      item.previousSnapshot ? item.freeCashFlow : null,
      "subtotal",
    ),
  ];
}

function buildRatioRows(periodAnalyses: PeriodAnalysis[]): RatioRow[] {
  const rows: RatioRow[] = [
    ratioRow(periodAnalyses, "gross-margin", "Gross Profit Margin", "Income Statement", "Gross profit / revenue", "percent", (item) =>
      safeRatio(item.snapshot.revenue + item.snapshot.cogs, item.snapshot.revenue),
    ),
    ratioRow(periodAnalyses, "ebitda-margin", "EBITDA Margin", "Corrected model", "EBITDA / revenue", "percent", (item) => safeRatio(item.ebitda, item.snapshot.revenue)),
    ratioRow(periodAnalyses, "ebit-margin", "EBIT Margin", "Corrected model", "Commercial EBIT / revenue", "percent", (item) =>
      safeRatio(item.snapshot.ebit, item.snapshot.revenue),
    ),
    ratioRow(periodAnalyses, "net-profit-margin", "Net Profit Margin", "Income Statement", "Commercial NPAT / revenue", "percent", (item) =>
      safeRatio(item.snapshot.commercialNpat, item.snapshot.revenue),
    ),
    ratioRow(periodAnalyses, "roa", "Return on Assets", "Corrected model", "Commercial NPAT / total assets", "percent", (item) =>
      safeRatio(item.snapshot.commercialNpat, item.snapshot.totalAssets),
    ),
    ratioRow(periodAnalyses, "roe", "Return on Equity", "Corrected model", "Commercial NPAT / book equity", "percent", (item) =>
      safeRatio(item.snapshot.commercialNpat, item.snapshot.bookEquity),
    ),
    ratioRow(periodAnalyses, "current-ratio", "Current Ratio", "Balance Sheet", "Current assets / current liabilities", "multiple", (item) =>
      safeRatio(item.snapshot.currentAssets, item.snapshot.currentLiabilities),
    ),
    ratioRow(periodAnalyses, "quick-ratio", "Quick Ratio", "Balance Sheet", "(Cash + AR) / current liabilities", "multiple", (item) =>
      safeRatio(item.snapshot.cashOnHand + item.snapshot.cashOnBankDeposit + item.snapshot.accountReceivable, item.snapshot.currentLiabilities),
    ),
    ratioRow(periodAnalyses, "cash-ratio", "Cash Ratio", "Balance Sheet", "Cash / current liabilities", "multiple", (item) =>
      safeRatio(item.snapshot.cashOnHand + item.snapshot.cashOnBankDeposit, item.snapshot.currentLiabilities),
    ),
    ratioRow(periodAnalyses, "debt-assets", "Debt to Assets Ratio", "Balance Sheet", "Total liabilities / total assets", "percent", (item) =>
      safeRatio(item.snapshot.totalLiabilities, item.snapshot.totalAssets),
    ),
    ratioRow(periodAnalyses, "debt-equity", "Debt to Equity Ratio", "Balance Sheet", "Total liabilities / book equity", "multiple", (item) =>
      safeRatio(item.snapshot.totalLiabilities, item.snapshot.bookEquity),
    ),
    ratioRow(periodAnalyses, "capitalization-ratio", "Capitalization Ratio", "Debt bridge", "Long-term debt / (long-term debt + book equity)", "percent", (item) =>
      safeRatio(item.snapshot.bankLoanLongTerm, item.snapshot.bankLoanLongTerm + item.snapshot.bookEquity),
    ),
    ratioRow(periodAnalyses, "interest-coverage", "Interest Coverage", "Income Statement", "EBIT / interest expense", "multiple", (item) =>
      item.snapshot.interestExpense ? Math.abs(item.snapshot.ebit / item.snapshot.interestExpense) : null,
    ),
    ratioRow(periodAnalyses, "equity-assets", "Equity to Total Assets", "Balance Sheet", "Book equity / total assets", "percent", (item) =>
      safeRatio(item.snapshot.bookEquity, item.snapshot.totalAssets),
    ),
    ratioRow(periodAnalyses, "ocf-sales", "Operating Cash Flow / Sales", "Corrected Cash Flow Statement", "CFO / revenue", "percent", (item) =>
      item.previousSnapshot ? safeRatio(item.cashFlowFromOperations, item.snapshot.revenue) : null,
    ),
  ];

  return rows;
}

function buildRoicRows(periodAnalyses: PeriodAnalysis[]): AnalysisRow[] {
  return [
    valueRow(periodAnalyses, "noplat", "NOPLAT", "Corrected NOPLAT", "Commercial EBIT x (1 - tax rate)", (item) => item.normalizedNoplat),
    valueRow(periodAnalyses, "total-assets", "Total assets in Balance Sheet", "Balance Sheet", "Mapped total assets or derived component total", (item) => item.snapshot.totalAssets),
    valueRow(periodAnalyses, "non-operating-assets", "Less: non-operating assets", "Corrected classification", "Cash/deposit + employee receivable + surplus assets + non-operating fixed assets", (item) =>
      -nonOperatingAssets(item.snapshot),
    ),
    valueRow(periodAnalyses, "operating-nwc", "Operating working capital", "Corrected classification", "AR + inventory - AP - other payable", (item) => item.operatingWorkingCapital),
    valueRow(periodAnalyses, "fixed-assets-net", "Operating fixed assets, net", "Fixed asset model", "Fixed assets net unless idle assets are identified", (item) => item.snapshot.fixedAssetsNet),
    valueRow(periodAnalyses, "invested-capital-end", "Invested capital at end of year", "Corrected model", "Fixed assets net + operating working capital", (item) => item.investedCapitalEnd, "subtotal"),
    valueRow(periodAnalyses, "invested-capital-beginning", "Invested capital at beginning of year", "Corrected model", "Prior period invested capital end", (item) => item.investedCapitalBeginning),
    valueRow(periodAnalyses, "roic", "ROIC", "Corrected model", "NOPLAT / beginning invested capital", (item) => item.roic, "subtotal"),
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
