import type { DcfForecastRow, FinancialStatementSnapshot, FormulaTrace, MethodOutput } from "./types";

type DcfOptions = {
  terminalGrowth?: number;
  wacc?: number;
  includeWorkingCapitalChange?: boolean;
  debtLikeTaxPayable?: boolean;
  fixedAssetProjection?: Record<number, DcfFixedAssetProjectionInput>;
  fixedAssetProjectionSource?: string;
  projectionEngine?: "balance-reconciled" | "historical-derived";
};

type AamOptions = {
  assetAdjustment?: number;
  liabilityAdjustment?: number;
  missingAdjustmentNotes?: number;
};

type CalculationOptions = {
  aam?: AamOptions;
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

export function normalizedNoplat(snapshot: FinancialStatementSnapshot): number {
  return snapshot.ebit * (1 - snapshot.taxRate);
}

export function calculateAam(snapshot: FinancialStatementSnapshot, options: AamOptions = {}): MethodOutput {
  const historicalAssets = adjustedTotalAssets(snapshot);
  const historicalLiabilities = adjustedTotalLiabilities(snapshot);
  const assetAdjustment = options.assetAdjustment ?? 0;
  const liabilityAdjustment = options.liabilityAdjustment ?? 0;
  const totalAssets = historicalAssets + assetAdjustment;
  const totalLiabilities = historicalLiabilities + liabilityAdjustment;
  const equityValue = totalAssets - totalLiabilities;
  const traces: FormulaTrace[] = [
    {
      label: "Aset historis basis AAM",
      formula: "Input total aset atau jumlah komponen aset bila total aset kosong",
      value: historicalAssets,
      note: "Basis historis berasal dari Neraca & Aset Tetap pada periode aktif.",
    },
    {
      label: "Penyesuaian aset AAM",
      formula: "Jumlah kolom Penyesuaian untuk pos aset AAM",
      value: assetAdjustment,
      note: "Nilai positif menaikkan aset disesuaikan; nilai negatif menurunkan aset disesuaikan.",
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
      label: "Total aset disesuaikan",
      formula: "Aset historis + penyesuaian aset",
      value: totalAssets,
      note: "Adjustment AAM tidak mengubah snapshot global untuk EEM/DCF.",
    },
    {
      label: "Total liabilitas disesuaikan",
      formula: "Liabilitas historis + penyesuaian liabilitas",
      value: totalLiabilities,
      note: "Adjustment AAM hanya berlaku di metode AAM dan jejak audit AAM.",
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

export function calculateEem(snapshot: FinancialStatementSnapshot): MethodOutput {
  const nwc = operatingWorkingCapital(snapshot);
  const netOperatingTangibleAssets = snapshot.fixedAssetsNet + nwc;
  const noplat = normalizedNoplat(snapshot);
  const requiredReturn = netOperatingTangibleAssets * snapshot.requiredReturnOnNta;
  const excessEarnings = noplat - requiredReturn;
  const capitalizationRate = snapshot.wacc - snapshot.terminalGrowth;
  const capitalizedExcess = capitalizationRate > 0 ? excessEarnings / capitalizationRate : 0;
  const enterpriseValue = netOperatingTangibleAssets + capitalizedExcess;
  const equityValue = enterpriseValue + nonOperatingAssets(snapshot) - interestBearingDebt(snapshot);

  const traces: FormulaTrace[] = [
    {
      label: "Operating NWC (modal kerja operasional bersih)",
      formula: "(AR + inventory) - (AP + other payable)",
      value: nwc,
      note: "Cash, deposit, employee receivable, tax payable, dan debt dikeluarkan.",
    },
    {
      label: "Aset berwujud operasional neto",
      formula: "Aset tetap neto + operating NWC",
      value: netOperatingTangibleAssets,
      note: "Basis aset berwujud operasional untuk EEM.",
    },
    {
      label: "NOPLAT ternormalisasi",
      formula: "EBIT komersial x (1 - tarif pajak statutory)",
      value: noplat,
      note: "Menggunakan earning power komersial dan tarif pajak statutory aktif.",
    },
    {
      label: "Excess earnings (laba lebih)",
      formula: "NOPLAT - (NTA x required return on NTA)",
      value: excessEarnings,
      note: "Required return dibebankan pada aset berwujud operasional.",
    },
    {
      label: "Nilai Ekuitas 100% - EEM",
      formula: "NTA + excess earnings yang dikapitalisasi + aset non-operasional - utang berbunga",
      value: equityValue,
      note: "DLOM/DLOC tidak diterapkan.",
    },
  ];

  return { method: "EEM", equityValue, traces };
}

export function buildDcfForecast(snapshot: FinancialStatementSnapshot, options: DcfOptions = {}): DcfForecastRow[] {
  const rows: DcfForecastRow[] = [];
  let previousRevenue = snapshot.revenue;
  let previousNwc = operatingWorkingCapital(snapshot);
  let previousFixedAssetsNet = snapshot.fixedAssetsNet;
  let previousFixedAssetGross = snapshot.fixedAssetAcquisition || snapshot.fixedAssetsNet + snapshot.accumulatedDepreciation;
  let previousAccumulatedDepreciation = snapshot.accumulatedDepreciation;
  let previousRetainedEarningsEnding = snapshot.retainedEarningsSurplus + snapshot.retainedEarningsCurrentProfit;
  let previousTaxPayableEnding = snapshot.taxPayable;
  const includeWorkingCapitalChange = options.includeWorkingCapitalChange ?? true;
  const useHistoricalDerivedProjection = options.projectionEngine === "historical-derived";
  const wacc = options.wacc ?? snapshot.wacc;
  const startYear = forecastStartYear(snapshot);
  const baseCash = snapshot.cashOnHand + snapshot.cashOnBankDeposit;
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
    const revenue = previousRevenue * (1 + snapshot.revenueGrowth);
    const cogs = revenue * snapshot.cogsMargin;
    const operatingExpenses = revenue * snapshot.gaMargin;
    const depreciation = fixedAssetProjection?.depreciation ?? revenue * snapshot.depreciationMargin;
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
    const operatingCurrentAssets = ar + inventory;
    const operatingCurrentLiabilities = ap + otherPayable;
    const operatingNwc = operatingCurrentAssets - operatingCurrentLiabilities;
    const changeInNwc = includeWorkingCapitalChange ? operatingNwc - previousNwc : 0;
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
    const retainedEarningsSurplus = previousRetainedEarningsEnding;
    let dividendDistribution = useHistoricalDerivedProjection
      ? Math.max(0, projectedNetIncome * Math.max(0, snapshot.dividendPayoutRatio))
      : 0;
    let retainedEarningsEnding = retainedEarningsSurplus + projectedNetIncome - dividendDistribution;
    let shareholdersEquity = paidUpCapital + additionalPaidInCapital + retainedEarningsEnding;
    const nonCashAssets =
      ar + employeeReceivable + inventory + otherCurrentAssets + fixedAssetsEnding + otherNonCurrentAssets + intangibleAssets;
    const baseCashPolicyRatio = snapshot.cashToRevenueRatio || (previousRevenue ? baseCash / previousRevenue : 0);
    let cashTotal = useHistoricalDerivedProjection ? Math.max(0, revenue * baseCashPolicyRatio) : 0;
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
      cashTotal = Math.max(0, balancingCash);
      financingPlug = Math.max(0, -balancingCash);
    }

    const cashOnHand = cashTotal * cashOnHandShare;
    const cashOnBankDeposit = cashTotal - cashOnHand;
    const bankLoanShortTerm = snapshot.bankLoanShortTerm + financingPlug;
    const currentAssets = cashTotal + ar + employeeReceivable + inventory + otherCurrentAssets;
    const nonCurrentAssets = fixedAssetsEnding + otherNonCurrentAssets + intangibleAssets;
    const totalAssets = currentAssets + nonCurrentAssets;
    const currentLiabilities = bankLoanShortTerm + ap + taxPayable + projectedOtherPayable;
    const liabilitiesAndEquity = currentLiabilities + nonCurrentLiabilities + shareholdersEquity;
    const balanceControl = totalAssets - liabilitiesAndEquity;
    const grossCashFlow = (useHistoricalDerivedProjection ? cashTaxAdjustedNoplat : noplat) + depreciation;
    const grossInvestment = maintenanceCapex + changeInNwc;
    const freeCashFlow = grossCashFlow - grossInvestment;
    const cashBeginningBalance = previousCashEndingBalance;
    const cashFlowFromOperations = grossCashFlow - changeInNwc;
    const nonOperatingCashFlow = 0;
    const cashFlowFromInvestment = -maintenanceCapex;
    const cashFlowBeforeFinancing = cashFlowFromOperations + nonOperatingCashFlow + cashFlowFromInvestment;
    const cashEndingBalance = cashTotal;
    const cashFlowFromFinancing = cashEndingBalance - cashBeginningBalance - cashFlowBeforeFinancing;
    const equityInjection = 0;
    const newLoan = Math.max(0, cashFlowFromFinancing);
    const interestExpenseCashFlow = 0;
    const interestIncomeCashFlow = 0;
    const principalRepayment = Math.min(0, cashFlowFromFinancing);
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
      cashOnHand,
      cashOnBankDeposit,
      accountReceivable: ar,
      employeeReceivable,
      inventory,
      otherCurrentAssets,
      currentAssets,
      operatingCurrentAssets,
      accountPayable: ap,
      taxPayable,
      otherPayable: projectedOtherPayable,
      bankLoanShortTerm,
      currentLiabilities,
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
      otherNonCurrentLiabilities,
      nonCurrentLiabilities,
      paidUpCapital,
      additionalPaidInCapital,
      retainedEarningsSurplus,
      dividendDistribution,
      retainedEarningsEnding,
      shareholdersEquity,
      liabilitiesAndEquity,
      balanceControl,
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
    previousNwc = operatingNwc;
    previousFixedAssetsNet = fixedAssetsEnding;
    previousFixedAssetGross = fixedAssetGross;
    previousAccumulatedDepreciation = accumulatedDepreciation;
    previousRetainedEarningsEnding = retainedEarningsEnding;
    previousCashEndingBalance = cashEndingBalance;
    previousTaxPayableEnding = taxPayable;
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
      note: "Terminal growth berasal dari input skenario dasar pengguna dan wajib lebih rendah dari WACC.",
    },
    {
      label: "Aset non-operasional",
      formula: "Surplus cash atau saldo kas + surat berharga + piutang karyawan + aset tetap non-operasional",
      value: nonOperatingAssets(snapshot),
      note: "Judgment berdampak tinggi; sensitivitas minimum operating cash diperlukan.",
    },
    {
      label: "Nilai Ekuitas 100% - DCF",
      formula: "Enterprise value + aset non-operasional - utang berbunga",
      value: equityValue,
      note: "DLOM/DLOC tidak diterapkan.",
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
  const eemTaxPayableDebtLike = {
    ...calculateEem(snapshot),
    equityValue: calculateEem(snapshot).equityValue - snapshot.taxPayable,
  };

  return {
    aam: calculateAam(snapshot, options.aam),
    eem: calculateEem(snapshot),
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
    operatingWorkingCapital: operatingWorkingCapital(snapshot),
    nonOperatingAssets: nonOperatingAssets(snapshot),
    interestBearingDebt: interestBearingDebt(snapshot),
    normalizedNoplat: normalizedNoplat(snapshot),
    adjustedTotalAssets: adjustedTotalAssets(snapshot),
    adjustedTotalLiabilities: adjustedTotalLiabilities(snapshot),
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

function forecastStartYear(snapshot: FinancialStatementSnapshot): number {
  const yearMatch = snapshot.valuationDate.match(/\b(19|20)\d{2}\b/);
  return yearMatch ? Number(yearMatch[0]) : 2021;
}

function positiveResidual(total: number, knownComponents: number): number {
  return Math.max(0, total - knownComponents);
}

function safeRatio(numerator: number, denominator: number): number {
  return denominator ? numerator / denominator : 0;
}

function safeAbsRatio(numerator: number, denominator: number): number {
  const base = Math.abs(denominator);
  return base ? Math.abs(numerator) / base : Math.abs(numerator) > 0 ? Number.POSITIVE_INFINITY : 0;
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
