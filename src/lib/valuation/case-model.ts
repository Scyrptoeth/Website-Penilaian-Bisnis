import { mapAccount, shouldAutoApplyMapping } from "./account-taxonomy";
import { calculateRequiredReturnOnNtaAssumption, calculateWaccAssumption, readRateInput } from "./assumption-calculators";
import { formatInputNumber } from "./format";
import { sampleCase } from "./sample-case";
import type { AccountCategory, FinancialStatementSnapshot } from "./types";
import type { AccountLabelId } from "./account-labels";

export type StatementType = "balance_sheet" | "income_statement" | "fixed_asset";

export type BalanceSheetClassification =
  | "current_asset"
  | "non_current_asset"
  | "asset_total"
  | "current_liability"
  | "non_current_liability"
  | "liability_total"
  | "equity";

export type Period = {
  id: string;
  label: string;
  valuationDate: string;
  yearOffset: number;
};

export type AccountRow = {
  id: string;
  statement: StatementType;
  accountName: string;
  categoryOverride: AccountCategory | "";
  balanceSheetClassification: BalanceSheetClassification | "";
  labelOverrides: AccountLabelId[];
  values: Record<string, string>;
};

export type FixedAssetScheduleValueKey =
  | "acquisitionBeginning"
  | "acquisitionAdditions"
  | "depreciationBeginning"
  | "depreciationAdditions";

export type FixedAssetScheduleRow = {
  id: string;
  assetName: string;
  values: Record<string, Record<FixedAssetScheduleValueKey, string>>;
};

export type FixedAssetPeriodAmounts = {
  acquisitionBeginning: number;
  acquisitionAdditions: number;
  acquisitionEnding: number;
  depreciationBeginning: number;
  depreciationAdditions: number;
  depreciationEnding: number;
  netValue: number;
};

export type FixedAssetComputedRow = {
  row: FixedAssetScheduleRow;
  amounts: Record<string, FixedAssetPeriodAmounts>;
};

export type FixedAssetScheduleSummary = {
  rows: FixedAssetComputedRow[];
  totals: Record<string, FixedAssetPeriodAmounts>;
  hasInput: boolean;
};

export type AssumptionState = {
  taxRate: string;
  taxRateSource: string;
  taxRateOverrideReason: string;
  terminalGrowth: string;
  terminalGrowthSource: string;
  terminalGrowthOverrideReason: string;
  terminalGrowthDownside: string;
  terminalGrowthUpside: string;
  revenueGrowth: string;
  wacc: string;
  waccSource: string;
  waccOverrideReason: string;
  waccRiskFreeRate: string;
  waccBeta: string;
  waccEquityRiskPremium: string;
  waccCountryRiskPremium: string;
  waccSpecificRiskPremium: string;
  waccPreTaxCostOfDebt: string;
  waccDebtWeight: string;
  waccEquityWeight: string;
  requiredReturnOnNta: string;
  requiredReturnOnNtaSource: string;
  requiredReturnOnNtaOverrideReason: string;
  requiredReturnReceivablesCapacity: string;
  requiredReturnInventoryCapacity: string;
  requiredReturnFixedAssetCapacity: string;
  requiredReturnAdditionalCapacity: string;
  requiredReturnAfterTaxDebtCost: string;
  requiredReturnEquityCost: string;
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

export const valuationYearOffset = 0;

export const initialPeriods: Period[] = [{ id: "p1", label: "Tahun Y", valuationDate: "", yearOffset: valuationYearOffset }];

export const fixedAssetScheduleValueKeys: FixedAssetScheduleValueKey[] = [
  "acquisitionBeginning",
  "acquisitionAdditions",
  "depreciationBeginning",
  "depreciationAdditions",
];

export const emptyAssumptions: AssumptionState = {
  taxRate: "",
  taxRateSource: "",
  taxRateOverrideReason: "",
  terminalGrowth: "",
  terminalGrowthSource: "",
  terminalGrowthOverrideReason: "",
  terminalGrowthDownside: "",
  terminalGrowthUpside: "",
  revenueGrowth: "",
  wacc: "",
  waccSource: "",
  waccOverrideReason: "",
  waccRiskFreeRate: "",
  waccBeta: "",
  waccEquityRiskPremium: "",
  waccCountryRiskPremium: "",
  waccSpecificRiskPremium: "",
  waccPreTaxCostOfDebt: "",
  waccDebtWeight: "",
  waccEquityWeight: "",
  requiredReturnOnNta: "",
  requiredReturnOnNtaSource: "",
  requiredReturnOnNtaOverrideReason: "",
  requiredReturnReceivablesCapacity: "",
  requiredReturnInventoryCapacity: "",
  requiredReturnFixedAssetCapacity: "",
  requiredReturnAdditionalCapacity: "",
  requiredReturnAfterTaxDebtCost: "",
  requiredReturnEquityCost: "",
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
  const autoAppliedCategory = shouldAutoApplyMapping(mapping) ? mapping.category : "UNMAPPED";

  return {
    row,
    mapping,
    effectiveCategory: row.categoryOverride || autoAppliedCategory,
  };
}

export function createRow(statement: StatementType, periods: Period[]): AccountRow {
  return {
    id: `r${Date.now()}${Math.random().toString(16).slice(2)}`,
    statement,
    accountName: "",
    categoryOverride: "",
    balanceSheetClassification: "",
    labelOverrides: [],
    values: Object.fromEntries(periods.map((period) => [period.id, ""])),
  };
}

export function createFixedAssetScheduleRow(periods: Period[], assetName = ""): FixedAssetScheduleRow {
  return {
    id: `fa${Date.now()}${Math.random().toString(16).slice(2)}`,
    assetName,
    values: Object.fromEntries(periods.map((period) => [period.id, createEmptyFixedAssetValues()])),
  };
}

export function ensureFixedAssetSchedulePeriods(rows: FixedAssetScheduleRow[], periods: Period[]): FixedAssetScheduleRow[] {
  return rows.map((row) => ({
    ...row,
    values: Object.fromEntries(
      periods.map((period) => [
        period.id,
        {
          ...createEmptyFixedAssetValues(),
          ...(row.values[period.id] ?? {}),
        },
      ]),
    ),
  }));
}

export function createHistoricalPeriod(periods: Period[]): Period {
  const yearOffset = getNextHistoricalPeriodOffset(periods);

  return {
    id: `py${Math.abs(yearOffset)}-${Date.now()}`,
    label: getPeriodLabel(yearOffset),
    valuationDate: "",
    yearOffset,
  };
}

export function getPeriodLabel(yearOffset: number): string {
  if (yearOffset === valuationYearOffset) {
    return "Tahun Y";
  }

  return `Tahun Y-${Math.abs(yearOffset)}`;
}

export function getPeriodYearOffset(period: Pick<Period, "label" | "valuationDate"> & Partial<Pick<Period, "yearOffset">>): number {
  if (typeof period.yearOffset === "number" && Number.isFinite(period.yearOffset)) {
    return Math.trunc(period.yearOffset);
  }

  return parsePeriodLabelYearOffset(period.label) ?? valuationYearOffset;
}

export function getNextHistoricalPeriodOffset(periods: Period[]): number {
  const existingOffsets = new Set(periods.map((period) => getPeriodYearOffset(period)));
  let candidate = -1;

  while (existingOffsets.has(candidate)) {
    candidate -= 1;
  }

  return candidate;
}

export function normalizePeriods(periods: Period[]): Period[] {
  const dateOffsets = inferYearOffsetsFromDates(periods);
  const normalizedPeriods = periods.map((period, index) => {
    const parsedLabelOffset = parsePeriodLabelYearOffset(period.label);
    const fallbackOffset = dateOffsets.get(period.id) ?? -index;
    const yearOffset =
      typeof period.yearOffset === "number" && Number.isFinite(period.yearOffset)
        ? Math.trunc(period.yearOffset)
        : (parsedLabelOffset ?? fallbackOffset);
    const legacyDefaultLabel = /^tahun\s+\d+$/i.test(period.label.trim());
    const label = period.label.trim() && !legacyDefaultLabel ? period.label : getPeriodLabel(yearOffset);

    return {
      ...period,
      label,
      yearOffset,
    };
  });

  return getChronologicalPeriods(normalizedPeriods);
}

export function getDefaultActivePeriod(periods: Period[]): Period | undefined {
  const chronologicalPeriods = getChronologicalPeriods(periods);

  return (
    chronologicalPeriods.find((period) => getPeriodYearOffset(period) === valuationYearOffset) ??
    chronologicalPeriods[chronologicalPeriods.length - 1] ??
    periods[0]
  );
}

export function getChronologicalPeriods(periods: Period[]): Period[] {
  return periods
    .map((period, index) => ({ period, index, timestamp: Date.parse(`${period.valuationDate}T00:00:00`) }))
    .sort((a, b) => {
      const yearOffsetDifference = getPeriodYearOffset(a.period) - getPeriodYearOffset(b.period);

      if (yearOffsetDifference !== 0) {
        return yearOffsetDifference;
      }

      const firstTime = Number.isFinite(a.timestamp) ? a.timestamp : Number.POSITIVE_INFINITY;
      const secondTime = Number.isFinite(b.timestamp) ? b.timestamp : Number.POSITIVE_INFINITY;

      if (firstTime !== secondTime) {
        return firstTime - secondTime;
      }

      return a.index - b.index;
    })
    .map((item) => item.period);
}

export function buildFixedAssetScheduleSummary(periods: Period[], rows: FixedAssetScheduleRow[]): FixedAssetScheduleSummary {
  const chronologicalPeriods = getChronologicalPeriods(periods);
  const totals = Object.fromEntries(
    periods.map((period) => [
      period.id,
      {
        acquisitionBeginning: 0,
        acquisitionAdditions: 0,
        acquisitionEnding: 0,
        depreciationBeginning: 0,
        depreciationAdditions: 0,
        depreciationEnding: 0,
        netValue: 0,
      },
    ]),
  ) as Record<string, FixedAssetPeriodAmounts>;
  let hasInput = false;

  const computedRows = rows.map((row): FixedAssetComputedRow => {
    const amounts: Record<string, FixedAssetPeriodAmounts> = {};
    let priorAcquisitionEnding = 0;
    let priorDepreciationEnding = 0;

    chronologicalPeriods.forEach((period, index) => {
      const periodValues = row.values[period.id] ?? createEmptyFixedAssetValues();
      const acquisitionBeginning = index === 0 ? parseInputNumber(periodValues.acquisitionBeginning) : priorAcquisitionEnding;
      const acquisitionAdditions = parseInputNumber(periodValues.acquisitionAdditions);
      const acquisitionEnding = acquisitionBeginning + acquisitionAdditions;
      const depreciationBeginning = index === 0 ? parseInputNumber(periodValues.depreciationBeginning) : priorDepreciationEnding;
      const depreciationAdditions = parseInputNumber(periodValues.depreciationAdditions);
      const depreciationEnding = depreciationBeginning + depreciationAdditions;
      const netValue = acquisitionEnding - depreciationEnding;

      if (
        fixedAssetScheduleValueKeys.some((key) => (periodValues[key] ?? "").trim() !== "") ||
        acquisitionEnding !== 0 ||
        depreciationEnding !== 0
      ) {
        hasInput = true;
      }

      amounts[period.id] = {
        acquisitionBeginning,
        acquisitionAdditions,
        acquisitionEnding,
        depreciationBeginning,
        depreciationAdditions,
        depreciationEnding,
        netValue,
      };

      totals[period.id].acquisitionBeginning += acquisitionBeginning;
      totals[period.id].acquisitionAdditions += acquisitionAdditions;
      totals[period.id].acquisitionEnding += acquisitionEnding;
      totals[period.id].depreciationBeginning += depreciationBeginning;
      totals[period.id].depreciationAdditions += depreciationAdditions;
      totals[period.id].depreciationEnding += depreciationEnding;
      totals[period.id].netValue += netValue;

      priorAcquisitionEnding = acquisitionEnding;
      priorDepreciationEnding = depreciationEnding;
    });

    return { row, amounts };
  });

  return { rows: computedRows, totals, hasInput };
}

export function buildSamplePeriods(): Period[] {
  return [
    { id: "p2019", label: "2019", valuationDate: "2019-12-31", yearOffset: -2 },
    { id: "p2020", label: "2020", valuationDate: "2020-12-31", yearOffset: -1 },
    { id: "p2021", label: "2021", valuationDate: sampleCase.valuationDate, yearOffset: valuationYearOffset },
  ];
}

export function buildSampleAssumptions(): AssumptionState {
  return {
    taxRate: formatInputNumber(sampleCase.taxRate),
    taxRateSource: "statutory-general",
    taxRateOverrideReason: "",
    terminalGrowth: formatInputNumber(sampleCase.terminalGrowth),
    terminalGrowthSource: "sample-workbook-terminal-growth",
    terminalGrowthOverrideReason: "",
    terminalGrowthDownside: formatInputNumber(-0.06200163015727912),
    terminalGrowthUpside: formatInputNumber(0.03),
    revenueGrowth: formatInputNumber(sampleCase.revenueGrowth),
    wacc: formatInputNumber(sampleCase.wacc),
    waccSource: "computed-wacc",
    waccOverrideReason: "",
    waccRiskFreeRate: formatInputNumber(0.064795),
    waccBeta: formatInputNumber(1.09),
    waccEquityRiskPremium: formatInputNumber(0.0738),
    waccCountryRiskPremium: formatInputNumber(-0.0207),
    waccSpecificRiskPremium: formatInputNumber(0),
    waccPreTaxCostOfDebt: formatInputNumber(0.088),
    waccDebtWeight: formatInputNumber(0.17722560473918053),
    waccEquityWeight: formatInputNumber(0.8227743952608195),
    requiredReturnOnNta: formatInputNumber(sampleCase.requiredReturnOnNta),
    requiredReturnOnNtaSource: "computed-required-return-on-nta",
    requiredReturnOnNtaOverrideReason: "",
    requiredReturnReceivablesCapacity: formatInputNumber(1),
    requiredReturnInventoryCapacity: formatInputNumber(0),
    requiredReturnFixedAssetCapacity: formatInputNumber(0.7),
    requiredReturnAdditionalCapacity: formatInputNumber(sampleCase.employeeReceivable),
    requiredReturnAfterTaxDebtCost: formatInputNumber(0.06864),
    requiredReturnEquityCost: formatInputNumber(0.124537),
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
    balanceSheetClassification: "",
    labelOverrides: [],
    values: Object.fromEntries(
      Object.entries(values).map(([periodId, value]) => [
        periodId,
        formatInputNumber(statement === "income_statement" ? value : Math.abs(value)),
      ]),
    ),
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
    row("sample-corporate-tax", "income_statement", "Corporate Tax", "CORPORATE_TAX", {
      p2019: -305_333_971,
      p2020: -165_937_126,
      p2021: sampleCase.corporateTax,
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
  fixedAssetScheduleRows: FixedAssetScheduleRow[] = [],
): FinancialStatementSnapshot {
  const activePeriod = periods.find((period) => period.id === activePeriodId) ?? getDefaultActivePeriod(periods);
  const effectiveActivePeriodId = activePeriod?.id ?? activePeriodId;
  const mappedRows = rows.map(mapRow);
  const fixedAssetSchedule = buildFixedAssetScheduleSummary(periods, fixedAssetScheduleRows);
  const fixedAssetScheduleAmounts = fixedAssetSchedule.totals[effectiveActivePeriodId];
  const aggregate = (periodId: string, ...categories: AccountCategory[]) =>
    aggregateForPeriod(mappedRows, periodId, categories);
  const activeAggregate = (...categories: AccountCategory[]) => aggregate(effectiveActivePeriodId, ...categories);
  const historicalDrivers = deriveHistoricalDrivers(periods, mappedRows);

  const cashOnHand = amount(activeAggregate("CASH_ON_HAND"));
  const cashOnBankDeposit = amount(activeAggregate("CASH_ON_BANK"));
  const accountReceivable = amount(activeAggregate("ACCOUNT_RECEIVABLE"));
  const employeeReceivable = amount(activeAggregate("EMPLOYEE_RECEIVABLE"));
  const inventory = amount(activeAggregate("INVENTORY"));
  const fixedAssetNetDirect = amount(activeAggregate("FIXED_ASSET"));
  const fixedAssetScheduleNet = fixedAssetSchedule.hasInput ? amount(fixedAssetScheduleAmounts?.netValue ?? 0) : 0;
  const fixedAssetAcquisition =
    amount(activeAggregate("FIXED_ASSET_ACQUISITION")) + (fixedAssetSchedule.hasInput ? amount(fixedAssetScheduleAmounts?.acquisitionEnding ?? 0) : 0);
  const accumulatedDepreciation =
    amount(activeAggregate("ACCUMULATED_DEPRECIATION")) + (fixedAssetSchedule.hasInput ? amount(fixedAssetScheduleAmounts?.depreciationEnding ?? 0) : 0);
  const fixedAssetsNet = fixedAssetNetDirect + fixedAssetScheduleNet || Math.max(0, fixedAssetAcquisition - accumulatedDepreciation);
  const nonOperatingFixedAssets = amount(activeAggregate("NON_OPERATING_FIXED_ASSETS"));
  const intangibleAssets = amount(activeAggregate("INTANGIBLE_ASSETS"));
  const excessCash = amount(activeAggregate("EXCESS_CASH"));
  const marketableSecurities = amount(activeAggregate("MARKETABLE_SECURITIES"));
  const surplusAssetCash = amount(activeAggregate("SURPLUS_ASSET_CASH"));
  const broadCurrentAssets = amount(activeAggregate("CURRENT_ASSET"));
  const broadNonCurrentAssets = amount(activeAggregate("NON_CURRENT_ASSET"));
  const totalAssetsOverride = amount(activeAggregate("TOTAL_ASSETS"));
  const derivedCurrentAssets =
    cashOnHand +
    cashOnBankDeposit +
    accountReceivable +
    employeeReceivable +
    inventory +
    excessCash +
    marketableSecurities +
    surplusAssetCash +
    broadCurrentAssets;
  const derivedNonCurrentAssets = fixedAssetsNet + nonOperatingFixedAssets + intangibleAssets + broadNonCurrentAssets;
  const derivedTotalAssets =
    derivedCurrentAssets +
    derivedNonCurrentAssets;

  const bankLoanShortTerm = amount(activeAggregate("BANK_LOAN_SHORT_TERM"));
  const accountPayable = amount(activeAggregate("ACCOUNT_PAYABLE"));
  const taxPayable = amount(activeAggregate("TAX_PAYABLE"));
  const otherPayable = amount(activeAggregate("OTHER_PAYABLE"));
  const interestPayable = amount(activeAggregate("INTEREST_PAYABLE"));
  const bankLoanLongTerm = amount(activeAggregate("BANK_LOAN_LONG_TERM", "INTEREST_BEARING_DEBT"));
  const broadCurrentLiabilities = amount(activeAggregate("CURRENT_LIABILITIES"));
  const broadNonCurrentLiabilities = amount(activeAggregate("NON_CURRENT_LIABILITIES"));
  const totalLiabilitiesOverride = amount(activeAggregate("TOTAL_LIABILITIES"));
  const derivedCurrentLiabilities = bankLoanShortTerm + accountPayable + taxPayable + otherPayable + interestPayable + broadCurrentLiabilities;
  const derivedNonCurrentLiabilities = bankLoanLongTerm + broadNonCurrentLiabilities;
  const derivedTotalLiabilities = derivedCurrentLiabilities + derivedNonCurrentLiabilities;

  const revenue = activeAggregate("REVENUE");
  const cogsAmount = activeAggregate("COST_OF_GOOD_SOLD");
  const sellingExpense = activeAggregate("SELLING_EXPENSE");
  const gaOverheads = activeAggregate("GENERAL_ADMINISTRATIVE_OVERHEADS", "OPERATING_EXPENSE");
  const fixedAssetScheduleDepreciation = fixedAssetSchedule.hasInput ? -amount(fixedAssetScheduleAmounts?.depreciationAdditions ?? 0) : 0;
  const depreciationInput = activeAggregate("DEPRECIATION_EXPENSE");
  const depreciation = depreciationInput || fixedAssetScheduleDepreciation;
  const ebitOverride = activeAggregate("EBIT");
  const computedEbit = revenue + cogsAmount + sellingExpense + gaOverheads + depreciation;
  const ebit = ebitOverride ? ebitOverride : computedEbit;
  const corporateTax = activeAggregate("CORPORATE_TAX");

  const paidUpCapital = amount(activeAggregate("MODAL_DISETOR"));
  const additionalPaidInCapital = amount(activeAggregate("PENAMBAHAN_MODAL_DISETOR"));
  const retainedEarningsSurplus = amount(activeAggregate("RETAINED_EARNINGS_SURPLUS"));
  const retainedEarningsCurrentProfit = amount(activeAggregate("RETAINED_EARNINGS_CURRENT_PROFIT"));
  const waccCalculation = calculateWaccAssumption(assumptions);
  const requiredReturnCalculation = calculateRequiredReturnOnNtaAssumption(assumptions, {
    accountReceivable,
    inventory,
    fixedAssetsNet,
  });

  return {
    valuationDate: activePeriod?.valuationDate || activePeriod?.label || "",
    taxRate: parseRate(assumptions.taxRate),
    terminalGrowth: parseRate(assumptions.terminalGrowth),
    terminalGrowthDownside: readRateInput(assumptions.terminalGrowthDownside) ?? undefined,
    terminalGrowthUpside: readRateInput(assumptions.terminalGrowthUpside) ?? undefined,
    revenueGrowth: parseRate(assumptions.revenueGrowth) || historicalDrivers.revenueGrowth,
    wacc: waccCalculation?.wacc ?? parseRate(assumptions.wacc),
    requiredReturnOnNta: requiredReturnCalculation?.requiredReturn ?? parseRate(assumptions.requiredReturnOnNta),
    cogsMargin: historicalDrivers.cogsMargin || (revenue ? -cogsAmount / revenue : 0),
    gaMargin: historicalDrivers.gaMargin || (revenue ? -(sellingExpense + gaOverheads) / revenue : 0),
    depreciationMargin: historicalDrivers.depreciationMargin || (revenue ? -depreciation / revenue : 0),
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
    currentAssets: derivedCurrentAssets,
    nonCurrentAssets: derivedNonCurrentAssets,
    totalAssets: totalAssetsOverride || derivedTotalAssets,
    bankLoanShortTerm,
    accountPayable,
    taxPayable,
    otherPayable,
    interestPayable,
    bankLoanLongTerm,
    currentLiabilities: derivedCurrentLiabilities,
    nonCurrentLiabilities: derivedNonCurrentLiabilities,
    totalLiabilities: totalLiabilitiesOverride || derivedTotalLiabilities,
    paidUpCapital,
    additionalPaidInCapital,
    retainedEarningsSurplus,
    retainedEarningsCurrentProfit,
    bookEquity: paidUpCapital + additionalPaidInCapital + retainedEarningsSurplus + retainedEarningsCurrentProfit,
    commercialNpat: amount(activeAggregate("COMMERCIAL_NPAT")),
    revenue,
    cogs: cogsAmount,
    sellingExpense,
    gaOverheads,
    depreciation,
    ebit,
    corporateTax,
    interestIncome: activeAggregate("INTEREST_INCOME"),
    interestExpense: activeAggregate("INTEREST_EXPENSE"),
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
  const chronologicalPeriods = getChronologicalPeriods(periods);
  const periodMetrics = chronologicalPeriods.map((period) => {
    const aggregate = (...categories: AccountCategory[]) => aggregateForPeriod(mappedRows, period.id, categories);
    const revenue = aggregate("REVENUE");
    const cogs = aggregate("COST_OF_GOOD_SOLD");
    const selling = aggregate("SELLING_EXPENSE");
    const ga = aggregate("GENERAL_ADMINISTRATIVE_OVERHEADS", "OPERATING_EXPENSE");
    const depreciation = aggregate("DEPRECIATION_EXPENSE");
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
    cogsMargin: averageRatio(periodMetrics, (metric) => -metric.cogs, (metric) => metric.revenue),
    gaMargin: averageRatio(periodMetrics, (metric) => -(metric.selling + metric.ga), (metric) => metric.revenue),
    depreciationMargin: averageRatio(periodMetrics, (metric) => -metric.depreciation, (metric) => metric.revenue),
    arDays: averageRatio(periodMetrics, (metric) => metric.ar * 365, (metric) => metric.revenue),
    inventoryDays: averageRatio(periodMetrics, (metric) => metric.inventory * 365, (metric) => Math.abs(metric.cogs)),
    apDays: averageRatio(periodMetrics, (metric) => metric.ap * 365, (metric) => Math.abs(metric.cogs)),
    otherPayableDays: averageRatio(periodMetrics, (metric) => metric.otherPayable * 365, (metric) => Math.abs(metric.selling + metric.ga)),
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

function parsePeriodLabelYearOffset(label: string): number | null {
  const trimmed = label.trim();
  const relativeYearMatch = /^tahun\s+y(?:\s*-\s*(\d+))?$/i.exec(trimmed);

  if (relativeYearMatch) {
    return relativeYearMatch[1] ? -Number(relativeYearMatch[1]) : valuationYearOffset;
  }

  const legacyYearMatch = /^tahun\s+(\d+)$/i.exec(trimmed);

  if (legacyYearMatch) {
    return -(Number(legacyYearMatch[1]) - 1);
  }

  return null;
}

function inferYearOffsetsFromDates(periods: Period[]): Map<string, number> {
  const datedPeriods = periods.flatMap((period) => {
    const timestamp = Date.parse(`${period.valuationDate}T00:00:00`);

    if (!Number.isFinite(timestamp)) {
      return [];
    }

    return [{ id: period.id, year: new Date(timestamp).getFullYear() }];
  });

  if (datedPeriods.length === 0) {
    return new Map();
  }

  const valuationYear = Math.max(...datedPeriods.map((period) => period.year));

  return new Map(datedPeriods.map((period) => [period.id, Math.min(valuationYearOffset, period.year - valuationYear)]));
}

function createEmptyFixedAssetValues(): Record<FixedAssetScheduleValueKey, string> {
  return {
    acquisitionBeginning: "",
    acquisitionAdditions: "",
    depreciationBeginning: "",
    depreciationAdditions: "",
  };
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
