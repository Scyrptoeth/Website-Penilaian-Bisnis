import type { DcfForecastRow, FinancialStatementSnapshot, FormulaTrace, MethodOutput } from "./types";

type DcfOptions = {
  terminalGrowth?: number;
  wacc?: number;
  includeWorkingCapitalChange?: boolean;
  debtLikeTaxPayable?: boolean;
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

export function calculateAam(snapshot: FinancialStatementSnapshot): MethodOutput {
  const totalAssets = adjustedTotalAssets(snapshot);
  const totalLiabilities = adjustedTotalLiabilities(snapshot);
  const equityValue = totalAssets - totalLiabilities;
  const traces: FormulaTrace[] = [
    {
      label: "Adjusted total assets",
      formula: "Input total assets atau jumlah komponen asset jika total assets kosong",
      value: totalAssets,
      note: "FMV adjustment tetap nol sampai independent asset appraisal tersedia.",
    },
    {
      label: "Total liabilities",
      formula: "Input total liabilities atau jumlah komponen liability jika total liabilities kosong",
      value: totalLiabilities,
      note: "AAM mengurangkan seluruh liabilities, termasuk tax payable.",
    },
    {
      label: "Equity Value 100% - AAM",
      formula: "Adjusted total assets - total liabilities",
      value: equityValue,
      note: "DLOM/DLOC tidak diterapkan.",
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
      label: "Operating NWC",
      formula: "(AR + inventory) - (AP + other payable)",
      value: nwc,
      note: "Cash, deposit, employee receivable, tax payable, dan debt dikeluarkan.",
    },
    {
      label: "Net operating tangible assets",
      formula: "Fixed assets net + operating NWC",
      value: netOperatingTangibleAssets,
      note: "Operating tangible asset base untuk EEM.",
    },
    {
      label: "Normalized NOPLAT",
      formula: "Commercial EBIT x (1 - statutory tax rate)",
      value: noplat,
      note: "Menggunakan commercial earning power dan statutory tax 22%.",
    },
    {
      label: "Excess earnings",
      formula: "NOPLAT - (NTA x required return on NTA)",
      value: excessEarnings,
      note: "Required return dibebankan pada operating tangible assets.",
    },
    {
      label: "Equity Value 100% - EEM",
      formula: "NTA + capitalized excess earnings + non-operating assets - interest-bearing debt",
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
  const includeWorkingCapitalChange = options.includeWorkingCapitalChange ?? true;
  const wacc = options.wacc ?? snapshot.wacc;
  const startYear = forecastStartYear(snapshot);

  for (let period = 1; period <= 5; period += 1) {
    const revenue = previousRevenue * (1 + snapshot.revenueGrowth);
    const cogs = revenue * snapshot.cogsMargin;
    const ga = revenue * snapshot.gaMargin;
    const depreciation = revenue * snapshot.depreciationMargin;
    const ebit = revenue - cogs - ga - depreciation;
    const noplat = ebit * (1 - snapshot.taxRate);
    const ar = (revenue * snapshot.arDays) / 365;
    const inventory = (cogs * snapshot.inventoryDays) / 365;
    const ap = (cogs * snapshot.apDays) / 365;
    const otherPayable = (ga * snapshot.otherPayableDays) / 365;
    const operatingNwc = ar + inventory - ap - otherPayable;
    const changeInNwc = includeWorkingCapitalChange ? operatingNwc - previousNwc : 0;
    const maintenanceCapex = depreciation;
    const freeCashFlow = noplat + depreciation - maintenanceCapex - changeInNwc;
    const discountBase = 1 + wacc;
    const discountFactor = discountBase > 0 ? 1 / Math.pow(discountBase, period) : 0;
    const presentValue = freeCashFlow * discountFactor;

    rows.push({
      year: startYear + period,
      revenue,
      ebit,
      noplat,
      operatingNwc,
      changeInNwc,
      freeCashFlow,
      discountFactor,
      presentValue,
    });

    previousRevenue = revenue;
    previousNwc = operatingNwc;
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
      label: "Explicit PV of FCFF",
      formula: "Sum yearly FCFF / (1 + WACC)^n",
      value: explicitPv,
      note: "Explicit forecast lima tahun berbasis historical margins dan operating WC days.",
    },
    {
      label: "PV terminal value",
      formula: "[Final FCFF x (1 + g) / (WACC - g)] / (1 + WACC)^5",
      value: terminalPv,
      note: "Base terminal growth adalah 0%.",
    },
    {
      label: "Non-operating assets",
      formula: "Surplus cash or cash balances + marketable securities + employee receivable + non-operating fixed assets",
      value: nonOperatingAssets(snapshot),
      note: "Judgment berdampak tinggi; sensitivitas minimum operating cash diperlukan.",
    },
    {
      label: "Equity Value 100% - DCF",
      formula: "Enterprise value + non-operating assets - interest-bearing debt",
      value: equityValue,
      note: "DLOM/DLOC tidak diterapkan.",
    },
  ];

  return { method: "DCF", equityValue, traces, forecast };
}

export function calculateAllMethods(snapshot: FinancialStatementSnapshot) {
  const dcf = calculateDcf(snapshot);
  const dcfNegativeGrowth = calculateDcf(snapshot, { terminalGrowth: -0.06200163015727912 });
  const dcfGrowth3 = calculateDcf(snapshot, { terminalGrowth: 0.03 });
  const dcfNoIncrementalWorkingCapital = calculateDcf(snapshot, { includeWorkingCapitalChange: false });
  const dcfTaxPayableDebtLike = calculateDcf(snapshot, { debtLikeTaxPayable: true });
  const eemTaxPayableDebtLike = {
    ...calculateEem(snapshot),
    equityValue: calculateEem(snapshot).equityValue - snapshot.taxPayable,
  };

  return {
    aam: calculateAam(snapshot),
    eem: calculateEem(snapshot),
    dcf,
    sensitivities: {
      dcfNegativeGrowth,
      dcfGrowth3,
      dcfNoIncrementalWorkingCapital,
      dcfTaxPayableDebtLike,
      eemTaxPayableDebtLike,
    },
    operatingWorkingCapital: operatingWorkingCapital(snapshot),
    nonOperatingAssets: nonOperatingAssets(snapshot),
    interestBearingDebt: interestBearingDebt(snapshot),
    normalizedNoplat: normalizedNoplat(snapshot),
    adjustedTotalAssets: adjustedTotalAssets(snapshot),
    adjustedTotalLiabilities: adjustedTotalLiabilities(snapshot),
  };
}

function forecastStartYear(snapshot: FinancialStatementSnapshot): number {
  const yearMatch = snapshot.valuationDate.match(/\b(19|20)\d{2}\b/);
  return yearMatch ? Number(yearMatch[0]) : 2021;
}
