import { mapAccount } from "./account-taxonomy";
import { formatInputNumber } from "./format";
import { sampleCase } from "./sample-case";
import type { AccountCategory, FinancialStatementSnapshot } from "./types";

export type StatementType = "balance_sheet" | "income_statement" | "fixed_asset";

export type Period = {
  id: string;
  label: string;
  valuationDate: string;
};

export type AccountRow = {
  id: string;
  statement: StatementType;
  accountName: string;
  categoryOverride: AccountCategory | "";
  values: Record<string, string>;
};

export type AssumptionState = {
  taxRate: string;
  terminalGrowth: string;
  revenueGrowth: string;
  wacc: string;
  requiredReturnOnNta: string;
  arDays: string;
  inventoryDays: string;
  apDays: string;
  otherPayableDays: string;
};

export type MappedRow = {
  row: AccountRow;
  mapping: ReturnType<typeof mapAccount>;
  effectiveCategory: AccountCategory;
};

export const initialPeriods: Period[] = [{ id: "p1", label: "Tahun 1", valuationDate: "" }];

export const emptyAssumptions: AssumptionState = {
  taxRate: "",
  terminalGrowth: "",
  revenueGrowth: "",
  wacc: "",
  requiredReturnOnNta: "",
  arDays: "",
  inventoryDays: "",
  apDays: "",
  otherPayableDays: "",
};

export const statementLabels: Record<StatementType, string> = {
  balance_sheet: "Balance Sheet",
  income_statement: "Income Statement",
  fixed_asset: "Fixed Asset Schedule",
};

export function mapRow(row: AccountRow): MappedRow {
  const mapping = mapAccount(row.accountName, row.statement);
  return {
    row,
    mapping,
    effectiveCategory: row.categoryOverride || mapping.category,
  };
}

export function createRow(statement: StatementType, periods: Period[]): AccountRow {
  return {
    id: `r${Date.now()}${Math.random().toString(16).slice(2)}`,
    statement,
    accountName: "",
    categoryOverride: "",
    values: Object.fromEntries(periods.map((period) => [period.id, ""])),
  };
}

export function buildSamplePeriods(): Period[] {
  return [
    { id: "p2019", label: "2019", valuationDate: "2019-12-31" },
    { id: "p2020", label: "2020", valuationDate: "2020-12-31" },
    { id: "p2021", label: "2021", valuationDate: sampleCase.valuationDate },
  ];
}

export function buildSampleAssumptions(): AssumptionState {
  return {
    taxRate: formatInputNumber(sampleCase.taxRate),
    terminalGrowth: formatInputNumber(sampleCase.terminalGrowth),
    revenueGrowth: formatInputNumber(sampleCase.revenueGrowth),
    wacc: formatInputNumber(sampleCase.wacc),
    requiredReturnOnNta: formatInputNumber(sampleCase.requiredReturnOnNta),
    arDays: formatInputNumber(sampleCase.arDays),
    inventoryDays: formatInputNumber(sampleCase.inventoryDays),
    apDays: formatInputNumber(sampleCase.apDays),
    otherPayableDays: formatInputNumber(sampleCase.otherPayableDays),
  };
}

export function buildSampleRows(): AccountRow[] {
  const row = (
    id: string,
    statement: StatementType,
    accountName: string,
    categoryOverride: AccountCategory,
    values: Record<string, number>,
  ): AccountRow => ({
    id,
    statement,
    accountName,
    categoryOverride,
    values: Object.fromEntries(Object.entries(values).map(([periodId, value]) => [periodId, formatInputNumber(Math.abs(value))])),
  });

  return [
    row("sample-cash-hand", "balance_sheet", "Kas", "CASH_ON_HAND", {
      p2019: 44_887_819,
      p2020: 151_468_119,
      p2021: sampleCase.cashOnHand,
    }),
    row("sample-cash-bank", "balance_sheet", "Bank Danamon dan deposito", "CASH_ON_BANK", {
      p2019: 374_140_018,
      p2020: 572_440_850,
      p2021: sampleCase.cashOnBankDeposit,
    }),
    row("sample-ar", "balance_sheet", "Piutang usaha", "ACCOUNT_RECEIVABLE", {
      p2019: 248_591_028,
      p2020: 675_378_320,
      p2021: sampleCase.accountReceivable,
    }),
    row("sample-employee-ar", "balance_sheet", "Piutang karyawan", "EMPLOYEE_RECEIVABLE", {
      p2019: 38_700_000,
      p2020: 18_000_000,
      p2021: sampleCase.employeeReceivable,
    }),
    row("sample-inventory", "balance_sheet", "Persediaan", "INVENTORY", { p2019: 0, p2020: 0, p2021: 0 }),
    row("sample-fixed-net", "fixed_asset", "Nilai buku aset tetap", "FIXED_ASSET", {
      p2019: 17_964_211_763,
      p2020: 16_993_087_735,
      p2021: sampleCase.fixedAssetsNet,
    }),
    row("sample-total-assets", "balance_sheet", "Total aset", "TOTAL_ASSETS", {
      p2019: 18_670_530_628,
      p2020: 18_410_375_024,
      p2021: sampleCase.totalAssets,
    }),
    row("sample-ap", "balance_sheet", "Utang usaha", "ACCOUNT_PAYABLE", {
      p2019: 1_349_091_893,
      p2020: 722_586_680,
      p2021: sampleCase.accountPayable,
    }),
    row("sample-tax", "balance_sheet", "Utang pajak", "TAX_PAYABLE", {
      p2019: 99_403_988,
      p2020: 250_347_400,
      p2021: sampleCase.taxPayable,
    }),
    row("sample-other-payable", "balance_sheet", "Utang lain-lain", "OTHER_PAYABLE", {
      p2019: 397_739_810,
      p2020: 295_472_920,
      p2021: sampleCase.otherPayable,
    }),
    row("sample-total-liabilities", "balance_sheet", "Total liabilitas", "TOTAL_LIABILITIES", {
      p2019: 1_846_235_691,
      p2020: 1_268_407_000,
      p2021: sampleCase.totalLiabilities,
    }),
    row("sample-paid-up-capital", "balance_sheet", "Modal disetor", "MODAL_DISETOR", {
      p2019: 5_280_000_000,
      p2020: 5_280_000_000,
      p2021: sampleCase.paidUpCapital,
    }),
    row("sample-additional-capital", "balance_sheet", "Penambahan modal disetor", "PENAMBAHAN_MODAL_DISETOR", {
      p2019: 3_550_000_000,
      p2020: 3_150_000_000,
      p2021: sampleCase.additionalPaidInCapital,
    }),
    row("sample-retained-surplus", "balance_sheet", "Saldo laba ditahan", "RETAINED_EARNINGS_SURPLUS", {
      p2019: 7_374_691_251,
      p2020: 7_994_294_936,
      p2021: sampleCase.retainedEarningsSurplus,
    }),
    row("sample-retained-current-profit", "balance_sheet", "Laba tahun berjalan neraca", "RETAINED_EARNINGS_CURRENT_PROFIT", {
      p2019: 619_603_684,
      p2020: 1_205_375_265,
      p2021: sampleCase.retainedEarningsCurrentProfit,
    }),
    row("sample-revenue", "income_statement", "Penjualan", "REVENUE", {
      p2019: 9_335_637_236,
      p2020: 11_406_787_320,
      p2021: sampleCase.revenue,
    }),
    row("sample-cogs", "income_statement", "Beban pokok penjualan", "COST_OF_GOOD_SOLD", {
      p2019: -6_880_608_086,
      p2020: -7_565_752_910,
      p2021: sampleCase.cogs,
    }),
    row("sample-ga", "income_statement", "Beban umum dan administrasi", "GENERAL_ADMINISTRATIVE_OVERHEADS", {
      p2019: -1_420_583_785,
      p2020: -1_809_878_908,
      p2021: sampleCase.gaOverheads,
    }),
    row("sample-depreciation", "income_statement", "Beban penyusutan", "DEPRECIATION_EXPENSE", {
      p2019: -353_481_575,
      p2020: -1_120_799_028,
      p2021: sampleCase.depreciation,
    }),
    row("sample-ebit", "income_statement", "Laba usaha komersial", "EBIT", {
      p2019: 680_963_790,
      p2020: 910_356_474,
      p2021: sampleCase.ebit,
    }),
    row("sample-interest-income", "income_statement", "Pendapatan bunga deposito", "INTEREST_INCOME", {
      p2019: 81_394_069,
      p2020: 11_803_933,
      p2021: sampleCase.interestIncome,
    }),
    row("sample-interest-expense", "income_statement", "Beban bunga", "INTEREST_EXPENSE", {
      p2019: -16_278_814,
      p2020: -1_361_128,
      p2021: sampleCase.interestExpense,
    }),
    row("sample-other-income", "income_statement", "Pendapatan/beban lain-lain", "NON_OPERATING_INCOME", {
      p2019: 0,
      p2020: 0,
      p2021: sampleCase.nonOperatingIncome,
    }),
    row("sample-commercial-npat", "income_statement", "Laba bersih komersial", "COMMERCIAL_NPAT", {
      p2019: 440_745_074,
      p2020: 754_862_153,
      p2021: sampleCase.commercialNpat,
    }),
  ];
}

export function buildSnapshot(
  periods: Period[],
  activePeriodId: string,
  rows: AccountRow[],
  assumptions: AssumptionState,
): FinancialStatementSnapshot {
  const activePeriod = periods.find((period) => period.id === activePeriodId) ?? periods[0];
  const mappedRows = rows.map(mapRow);
  const aggregate = (periodId: string, ...categories: AccountCategory[]) =>
    aggregateForPeriod(mappedRows, periodId, categories);
  const activeAggregate = (...categories: AccountCategory[]) => aggregate(activePeriodId, ...categories);
  const historicalDrivers = deriveHistoricalDrivers(periods, mappedRows);

  const cashOnHand = amount(activeAggregate("CASH_ON_HAND"));
  const cashOnBankDeposit = amount(activeAggregate("CASH_ON_BANK"));
  const accountReceivable = amount(activeAggregate("ACCOUNT_RECEIVABLE"));
  const employeeReceivable = amount(activeAggregate("EMPLOYEE_RECEIVABLE"));
  const inventory = amount(activeAggregate("INVENTORY"));
  const fixedAssetNetDirect = amount(activeAggregate("FIXED_ASSET"));
  const fixedAssetAcquisition = amount(activeAggregate("FIXED_ASSET_ACQUISITION"));
  const accumulatedDepreciation = amount(activeAggregate("ACCUMULATED_DEPRECIATION"));
  const fixedAssetsNet = fixedAssetNetDirect || Math.max(0, fixedAssetAcquisition - accumulatedDepreciation);
  const nonOperatingFixedAssets = amount(activeAggregate("NON_OPERATING_FIXED_ASSETS"));
  const intangibleAssets = amount(activeAggregate("INTANGIBLE_ASSETS"));
  const excessCash = amount(activeAggregate("EXCESS_CASH"));
  const marketableSecurities = amount(activeAggregate("MARKETABLE_SECURITIES"));
  const surplusAssetCash = amount(activeAggregate("SURPLUS_ASSET_CASH"));
  const broadAssets = amount(activeAggregate("CURRENT_ASSET", "NON_CURRENT_ASSET"));
  const totalAssetsOverride = amount(activeAggregate("TOTAL_ASSETS"));
  const derivedTotalAssets =
    cashOnHand +
    cashOnBankDeposit +
    accountReceivable +
    employeeReceivable +
    inventory +
    fixedAssetsNet +
    nonOperatingFixedAssets +
    intangibleAssets +
    excessCash +
    marketableSecurities +
    surplusAssetCash +
    broadAssets;

  const bankLoanShortTerm = amount(activeAggregate("BANK_LOAN_SHORT_TERM"));
  const accountPayable = amount(activeAggregate("ACCOUNT_PAYABLE"));
  const taxPayable = amount(activeAggregate("TAX_PAYABLE"));
  const otherPayable = amount(activeAggregate("OTHER_PAYABLE"));
  const bankLoanLongTerm = amount(activeAggregate("BANK_LOAN_LONG_TERM", "INTEREST_BEARING_DEBT"));
  const broadLiabilities = amount(activeAggregate("CURRENT_LIABILITIES", "NON_CURRENT_LIABILITIES", "INTEREST_PAYABLE"));
  const totalLiabilitiesOverride = amount(activeAggregate("TOTAL_LIABILITIES"));
  const derivedTotalLiabilities = bankLoanShortTerm + accountPayable + taxPayable + otherPayable + bankLoanLongTerm + broadLiabilities;

  const revenue = amount(activeAggregate("REVENUE"));
  const cogsAmount = amount(activeAggregate("COST_OF_GOOD_SOLD"));
  const sellingExpense = amount(activeAggregate("SELLING_EXPENSE"));
  const gaOverheads = amount(activeAggregate("GENERAL_ADMINISTRATIVE_OVERHEADS", "OPERATING_EXPENSE"));
  const depreciation = amount(activeAggregate("DEPRECIATION_EXPENSE"));
  const ebitOverride = activeAggregate("EBIT");
  const computedEbit = revenue - cogsAmount - sellingExpense - gaOverheads - depreciation;
  const ebit = ebitOverride ? ebitOverride : computedEbit;

  return {
    valuationDate: activePeriod?.valuationDate || activePeriod?.label || "",
    taxRate: parseRate(assumptions.taxRate),
    terminalGrowth: parseRate(assumptions.terminalGrowth),
    revenueGrowth: parseRate(assumptions.revenueGrowth) || historicalDrivers.revenueGrowth,
    wacc: parseRate(assumptions.wacc),
    requiredReturnOnNta: parseRate(assumptions.requiredReturnOnNta),
    cogsMargin: historicalDrivers.cogsMargin || (revenue ? cogsAmount / revenue : 0),
    gaMargin: historicalDrivers.gaMargin || (revenue ? (sellingExpense + gaOverheads) / revenue : 0),
    depreciationMargin: historicalDrivers.depreciationMargin || (revenue ? depreciation / revenue : 0),
    arDays: parseInputNumber(assumptions.arDays) || historicalDrivers.arDays,
    inventoryDays: parseInputNumber(assumptions.inventoryDays) || historicalDrivers.inventoryDays,
    apDays: parseInputNumber(assumptions.apDays) || historicalDrivers.apDays,
    otherPayableDays: parseInputNumber(assumptions.otherPayableDays) || historicalDrivers.otherPayableDays,
    cashOnHand,
    cashOnBankDeposit,
    accountReceivable,
    employeeReceivable,
    inventory,
    fixedAssetsNet,
    nonOperatingFixedAssets,
    intangibleAssets,
    excessCash,
    marketableSecurities,
    surplusAssetCash,
    totalAssets: totalAssetsOverride || derivedTotalAssets,
    bankLoanShortTerm,
    accountPayable,
    taxPayable,
    otherPayable,
    bankLoanLongTerm,
    totalLiabilities: totalLiabilitiesOverride || derivedTotalLiabilities,
    paidUpCapital: amount(activeAggregate("MODAL_DISETOR")),
    additionalPaidInCapital: amount(activeAggregate("PENAMBAHAN_MODAL_DISETOR")),
    retainedEarningsSurplus: amount(activeAggregate("RETAINED_EARNINGS_SURPLUS")),
    retainedEarningsCurrentProfit: amount(activeAggregate("RETAINED_EARNINGS_CURRENT_PROFIT")),
    commercialNpat: amount(activeAggregate("COMMERCIAL_NPAT")),
    revenue,
    cogs: -cogsAmount,
    sellingExpense: -sellingExpense,
    gaOverheads: -gaOverheads,
    depreciation: -depreciation,
    ebit,
    interestIncome: activeAggregate("INTEREST_INCOME"),
    interestExpense: -amount(activeAggregate("INTEREST_EXPENSE")),
    nonOperatingIncome: activeAggregate("NON_OPERATING_INCOME"),
  };
}

export function aggregateForPeriod(mappedRows: MappedRow[], periodId: string, categories: AccountCategory[]): number {
  return mappedRows.reduce((sum, item) => {
    if (!categories.includes(item.effectiveCategory)) {
      return sum;
    }

    return sum + parseInputNumber(item.row.values[periodId] ?? "");
  }, 0);
}

export function deriveHistoricalDrivers(periods: Period[], mappedRows: MappedRow[]) {
  const periodMetrics = periods.map((period) => {
    const aggregate = (...categories: AccountCategory[]) => aggregateForPeriod(mappedRows, period.id, categories);
    const revenue = amount(aggregate("REVENUE"));
    const cogs = amount(aggregate("COST_OF_GOOD_SOLD"));
    const selling = amount(aggregate("SELLING_EXPENSE"));
    const ga = amount(aggregate("GENERAL_ADMINISTRATIVE_OVERHEADS", "OPERATING_EXPENSE"));
    const depreciation = amount(aggregate("DEPRECIATION_EXPENSE"));
    const ar = amount(aggregate("ACCOUNT_RECEIVABLE"));
    const inventory = amount(aggregate("INVENTORY"));
    const ap = amount(aggregate("ACCOUNT_PAYABLE"));
    const otherPayable = amount(aggregate("OTHER_PAYABLE"));

    return {
      revenue,
      cogs,
      selling,
      ga,
      depreciation,
      ar,
      inventory,
      ap,
      otherPayable,
    };
  });

  const revenues = periodMetrics.map((metric) => metric.revenue).filter((value) => value > 0);
  const revenueGrowth =
    revenues.length >= 2 && revenues[0] > 0 ? Math.pow(revenues[revenues.length - 1] / revenues[0], 1 / (revenues.length - 1)) - 1 : 0;

  return {
    revenueGrowth,
    cogsMargin: averageRatio(periodMetrics, (metric) => metric.cogs, (metric) => metric.revenue),
    gaMargin: averageRatio(periodMetrics, (metric) => metric.selling + metric.ga, (metric) => metric.revenue),
    depreciationMargin: averageRatio(periodMetrics, (metric) => metric.depreciation, (metric) => metric.revenue),
    arDays: averageRatio(periodMetrics, (metric) => metric.ar * 365, (metric) => metric.revenue),
    inventoryDays: averageRatio(periodMetrics, (metric) => metric.inventory * 365, (metric) => metric.cogs),
    apDays: averageRatio(periodMetrics, (metric) => metric.ap * 365, (metric) => metric.cogs),
    otherPayableDays: averageRatio(periodMetrics, (metric) => metric.otherPayable * 365, (metric) => metric.selling + metric.ga),
  };
}

export function parseInputNumber(input: string): number {
  const trimmed = input.trim();

  if (!trimmed) {
    return 0;
  }

  let normalized = trimmed.replace(/\s/g, "").replace(/rp/gi, "");
  const isNegative = normalized.startsWith("-");
  normalized = normalized.replace(/-/g, "");
  const commaCount = normalized.split(",").length - 1;
  const dotCount = normalized.split(".").length - 1;

  if (commaCount > 0 && dotCount > 0) {
    const lastComma = normalized.lastIndexOf(",");
    const integerPart = normalized.slice(0, lastComma).replace(/\./g, "").replace(/\D/g, "");
    const decimalPart = normalized.slice(lastComma + 1).replace(/\D/g, "");
    normalized = `${integerPart}.${decimalPart}`;
  } else if (commaCount > 1) {
    normalized = normalized.replace(/,/g, "");
  } else if (commaCount === 1) {
    const [integerPart = "", fractionalPart = ""] = normalized.split(",");
    normalized = `${integerPart.replace(/\./g, "").replace(/\D/g, "")}.${fractionalPart.replace(/\D/g, "")}`;
  } else if (dotCount > 1) {
    normalized = normalized.replace(/\./g, "");
  } else if (dotCount === 1) {
    const [, fractionalPart = ""] = normalized.split(".");
    normalized = fractionalPart.length === 3 ? normalized.replace(".", "") : normalized;
  }

  const parsed = Number(`${isNegative ? "-" : ""}${normalized.replace(/[^0-9.]/g, "")}`);
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseRate(input: string): number {
  const value = parseInputNumber(input);
  return input.includes("%") || Math.abs(value) > 1 ? value / 100 : value;
}

function amount(value: number): number {
  return Math.abs(value);
}

function averageRatio<T>(items: T[], numerator: (item: T) => number, denominator: (item: T) => number): number {
  const ratios = items
    .map((item) => {
      const base = denominator(item);
      return base ? numerator(item) / base : null;
    })
    .filter((value): value is number => value !== null && Number.isFinite(value));

  return ratios.length ? ratios.reduce((sum, value) => sum + value, 0) / ratios.length : 0;
}
