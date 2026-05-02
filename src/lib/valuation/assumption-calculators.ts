import type { AssumptionState } from "./case-model";

export type WaccCalculation = {
  costOfEquity: number;
  afterTaxCostOfDebt: number;
  debtWeight: number;
  equityWeight: number;
  beta: number;
  preTaxCostOfDebt: number;
  ratingBasedDefaultSpread: number;
  countryRiskAdjustment: number;
  comparableBeta?: WaccComparableBetaCalculation;
  wacc: number;
};

export type WaccComparableBetaRow = {
  index: 1 | 2 | 3;
  name: string;
  betaLevered: number | null;
  marketCap: number | null;
  debt: number | null;
  unleveredBeta: number | null;
};

export type WaccComparableBetaCalculation = {
  rows: WaccComparableBetaRow[];
  averageUnleveredBeta: number | null;
  aggregateMarketCap: number | null;
  aggregateDebt: number | null;
  capitalWeights: { debtWeight: number; equityWeight: number } | null;
  releveredBeta: number | null;
};

export type RequiredReturnOnNtaCalculation = {
  tangibleAssetBase: number;
  debtCapacity: number;
  debtWeight: number;
  equityWeight: number;
  requiredReturn: number;
};

export type RequiredReturnOnNtaBalances = {
  accountReceivable: number;
  inventory: number;
  fixedAssetsNet: number;
};

export type RequiredReturnOnNtaSuggestionKey =
  | "requiredReturnReceivablesCapacity"
  | "requiredReturnInventoryCapacity"
  | "requiredReturnFixedAssetCapacity"
  | "requiredReturnAdditionalCapacity"
  | "requiredReturnAfterTaxDebtCost"
  | "requiredReturnEquityCost";

export type RequiredReturnOnNtaSuggestionField = {
  key: RequiredReturnOnNtaSuggestionKey;
  label: string;
  value: number | null;
  source: string;
  basis: string;
  formula: string;
  note: string;
  status: "user_input" | "auto" | "waiting";
  canAutoApply: boolean;
};

export type RequiredReturnOnNtaSuggestion = {
  fields: Partial<Record<RequiredReturnOnNtaSuggestionKey, RequiredReturnOnNtaSuggestionField>>;
  summary: string;
  waitingFor: string[];
};

export type RequiredReturnOnNtaSuggestionInputs = RequiredReturnOnNtaBalances & {
  employeeReceivable: number;
  waccCalculation: Pick<WaccCalculation, "afterTaxCostOfDebt" | "costOfEquity"> | null;
};

export function calculateWaccAssumption(assumptions: AssumptionState): WaccCalculation | null {
  const taxRate = readRateInput(assumptions.taxRate);
  const riskFreeRate = readRateInput(assumptions.waccRiskFreeRate);
  const comparableBeta = calculateWaccComparableBetaAssumption(assumptions);
  const beta = comparableBeta.releveredBeta ?? readNumberInput(assumptions.waccBeta);
  const equityRiskPremium = readRateInput(assumptions.waccEquityRiskPremium);
  const ratingBasedDefaultSpread = readRateInput(assumptions.waccRatingBasedDefaultSpread) ?? 0;
  const countryRiskPremium = readRateInput(assumptions.waccCountryRiskPremium) ?? -ratingBasedDefaultSpread;
  const specificRiskPremium = readRateInput(assumptions.waccSpecificRiskPremium) ?? 0;
  const preTaxCostOfDebt = readRateInput(assumptions.waccPreTaxCostOfDebt) ?? readAverageBankInvestmentLoanRate(assumptions);
  const weights = comparableBeta.capitalWeights
    ?? readCapitalWeightsFromValues(assumptions.waccDebtMarketValue, assumptions.waccEquityMarketValue)
    ?? readCapitalWeights(assumptions.waccDebtWeight, assumptions.waccEquityWeight);

  if (
    taxRate === null ||
    riskFreeRate === null ||
    beta === null ||
    equityRiskPremium === null ||
    preTaxCostOfDebt === null ||
    !weights
  ) {
    return null;
  }

  const costOfEquity = riskFreeRate + beta * equityRiskPremium + countryRiskPremium + specificRiskPremium;
  const afterTaxCostOfDebt = preTaxCostOfDebt * (1 - taxRate);
  const wacc = weights.debtWeight * afterTaxCostOfDebt + weights.equityWeight * costOfEquity;

  return {
    costOfEquity,
    afterTaxCostOfDebt,
    debtWeight: weights.debtWeight,
    equityWeight: weights.equityWeight,
    beta,
    preTaxCostOfDebt,
    ratingBasedDefaultSpread,
    countryRiskAdjustment: countryRiskPremium + specificRiskPremium,
    comparableBeta,
    wacc,
  };
}

export function calculateWaccComparableBetaAssumption(assumptions: AssumptionState): WaccComparableBetaCalculation {
  const taxRate = readRateInput(assumptions.taxRate) ?? 0;
  const rows: WaccComparableBetaRow[] = [
    buildComparableBetaRow(1, assumptions.waccComparable1Name, assumptions.waccComparable1BetaLevered, assumptions.waccComparable1MarketCap, assumptions.waccComparable1Debt, taxRate),
    buildComparableBetaRow(2, assumptions.waccComparable2Name, assumptions.waccComparable2BetaLevered, assumptions.waccComparable2MarketCap, assumptions.waccComparable2Debt, taxRate),
    buildComparableBetaRow(3, assumptions.waccComparable3Name, assumptions.waccComparable3BetaLevered, assumptions.waccComparable3MarketCap, assumptions.waccComparable3Debt, taxRate),
  ];
  const aggregateMarketCap = sumComparableValues(rows.map((row) => row.marketCap));
  const aggregateDebt = sumComparableValues(rows.map((row) => row.debt));
  const capitalWeights =
    aggregateMarketCap !== null && aggregateDebt !== null && aggregateMarketCap + aggregateDebt > 0
      ? {
          debtWeight: aggregateDebt / (aggregateDebt + aggregateMarketCap),
          equityWeight: aggregateMarketCap / (aggregateDebt + aggregateMarketCap),
        }
      : readCapitalWeightsFromValues(assumptions.waccDebtMarketValue, assumptions.waccEquityMarketValue);
  const validUnleveredBetas = rows
    .map((row) => row.unleveredBeta)
    .filter((value): value is number => value !== null && Number.isFinite(value));
  const averageUnleveredBeta =
    validUnleveredBetas.length > 0
      ? validUnleveredBetas.reduce((sum, value) => sum + value, 0) / validUnleveredBetas.length
      : null;
  const releveredBeta =
    averageUnleveredBeta !== null && capitalWeights && capitalWeights.equityWeight > 0
      ? averageUnleveredBeta * (1 + (1 - taxRate) * (capitalWeights.debtWeight / capitalWeights.equityWeight))
      : null;

  return {
    rows,
    averageUnleveredBeta,
    aggregateMarketCap,
    aggregateDebt,
    capitalWeights,
    releveredBeta,
  };
}

export function calculateRequiredReturnOnNtaAssumption(
  assumptions: AssumptionState,
  balances: RequiredReturnOnNtaBalances,
): RequiredReturnOnNtaCalculation | null {
  const receivablesCapacity = readRateInput(assumptions.requiredReturnReceivablesCapacity);
  const inventoryCapacity = readRateInput(assumptions.requiredReturnInventoryCapacity);
  const fixedAssetCapacity = readRateInput(assumptions.requiredReturnFixedAssetCapacity);
  const additionalCapacity = readNumberInput(assumptions.requiredReturnAdditionalCapacity) ?? 0;
  const afterTaxDebtCost = readRateInput(assumptions.requiredReturnAfterTaxDebtCost);
  const equityReturn = readRateInput(assumptions.requiredReturnEquityCost);
  const tangibleAssetBase = positive(balances.accountReceivable) + positive(balances.inventory) + positive(balances.fixedAssetsNet);

  if (
    receivablesCapacity === null ||
    inventoryCapacity === null ||
    fixedAssetCapacity === null ||
    afterTaxDebtCost === null ||
    equityReturn === null ||
    tangibleAssetBase <= 0
  ) {
    return null;
  }

  const debtCapacity =
    positive(balances.accountReceivable) * receivablesCapacity +
    positive(balances.inventory) * inventoryCapacity +
    positive(balances.fixedAssetsNet) * fixedAssetCapacity +
    additionalCapacity;
  const debtWeight = clamp(debtCapacity / tangibleAssetBase, 0, 1);
  const equityWeight = 1 - debtWeight;
  const requiredReturn = debtWeight * afterTaxDebtCost + equityWeight * equityReturn;

  return {
    tangibleAssetBase,
    debtCapacity,
    debtWeight,
    equityWeight,
    requiredReturn,
  };
}

export function buildRequiredReturnOnNtaSuggestion({
  accountReceivable,
  employeeReceivable,
  inventory,
  fixedAssetsNet,
  waccCalculation,
}: RequiredReturnOnNtaSuggestionInputs): RequiredReturnOnNtaSuggestion {
  const fields: RequiredReturnOnNtaSuggestion["fields"] = {
    requiredReturnReceivablesCapacity: {
      key: "requiredReturnReceivablesCapacity",
      label: "Receivables capacity",
      value: null,
      source: "User evidence",
      basis: "Trade receivable borrowing-base or collateral advance rate",
      formula: "Eligible account receivable x receivables capacity",
      note: "Isi dari kebijakan kreditur, borrowing-base certificate, aging piutang tertagih, atau judgment penilai atas kualitas piutang dagang.",
      status: "user_input",
      canAutoApply: false,
    },
    requiredReturnInventoryCapacity: {
      key: "requiredReturnInventoryCapacity",
      label: "Inventory capacity",
      value: null,
      source: "User evidence",
      basis: "Inventory borrowing-base or pledgeability rate",
      formula: "Eligible inventory x inventory capacity",
      note: positive(inventory) > 0
        ? "Isi dari lender haircut, aging persediaan, tingkat usang/rusak, perputaran stok, dan bukti apakah inventory dapat dijaminkan."
        : "Inventory aktif masih nol. Isi 0% bila memang tidak ada inventory eligible, atau lengkapi Neraca bila inventory seharusnya ada.",
      status: "user_input",
      canAutoApply: false,
    },
    requiredReturnFixedAssetCapacity: {
      key: "requiredReturnFixedAssetCapacity",
      label: "Fixed asset capacity",
      value: null,
      source: "User evidence",
      basis: "Fixed-asset collateral haircut or appraisal-supported capacity rate",
      formula: "Fixed assets net x fixed asset capacity",
      note: "Isi dari appraisal aset, kebijakan loan-to-value, covenant kreditur, umur/manfaat aset, dan apakah aset tersebut benar-benar operating/pledgeable.",
      status: "user_input",
      canAutoApply: false,
    },
    requiredReturnAdditionalCapacity: {
      key: "requiredReturnAdditionalCapacity",
      label: "Additional capacity amount",
      value: null,
      source: "User evidence",
      basis: "Other eligible tangible capacity not already captured in AR, inventory, or fixed assets",
      formula: "Manual eligible amount added to debt capacity",
      note: positive(employeeReceivable) > 0
        ? "Terdapat other/employee receivable pada Neraca aktif. Masukkan hanya jika penilai menyimpulkan saldo tersebut eligible sebagai kapasitas tambahan."
        : "Gunakan hanya untuk kapasitas berwujud tambahan yang didukung bukti, agar tidak double-count dengan AR, inventory, atau fixed assets.",
      status: "user_input",
      canAutoApply: false,
    },
  };
  const waitingFor: string[] = [];

  if (waccCalculation) {
    fields.requiredReturnAfterTaxDebtCost = {
      key: "requiredReturnAfterTaxDebtCost",
      label: "After-tax debt cost",
      value: waccCalculation.afterTaxCostOfDebt,
      source: "Calculated from active WACC inputs",
      basis: "Pre-tax debt cost and active tax rate",
      formula: "Kd after tax = pre-tax debt rate x (1 - tax rate)",
      note: "Ditarik dari input WACC aktif agar cost of debt konsisten dengan DCF/EEM. Tetap dapat dioverride bila NTA capital charge memakai debt-cost basis berbeda.",
      status: "auto",
      canAutoApply: true,
    };
    fields.requiredReturnEquityCost = {
      key: "requiredReturnEquityCost",
      label: "Tangible equity return",
      value: waccCalculation.costOfEquity,
      source: "Calculated from active WACC inputs",
      basis: "Risk-free rate, beta, ERP, and explicit risk adjustments",
      formula: "Ke = risk-free rate + beta x ERP + country/company risk adjustment",
      note: "Ditarik dari input WACC aktif agar equity return konsisten dengan DCF/EEM. Override hanya jika return ekuitas aset berwujud memakai basis terpisah.",
      status: "auto",
      canAutoApply: true,
    };
  } else {
    waitingFor.push("Lengkapi Tax Rate dan WACC agar Kd after tax serta Ke bisa disarankan otomatis.");
  }

  if (positive(accountReceivable) <= 0 && positive(inventory) <= 0 && positive(fixedAssetsNet) <= 0) {
    waitingFor.push("Isi Neraca atau Fixed Asset agar tangible asset base NTA tersedia.");
  }

  return {
    fields,
    summary: "Isi capacity rate dari bukti kasus aktif; biaya modal dapat ditarik dari WACC agar NTA capital charge tetap konsisten dan audit-friendly.",
    waitingFor,
  };
}

export function readRateInput(input: string): number | null {
  if (!input.trim()) {
    return null;
  }

  const value = readNumberInput(input);

  if (value === null) {
    return null;
  }

  return input.includes("%") || Math.abs(value) > 1 ? value / 100 : value;
}

export function readNumberInput(input: string): number | null {
  const trimmed = input.trim();

  if (!trimmed) {
    return null;
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
  return Number.isFinite(parsed) ? parsed : null;
}

function readCapitalWeights(debtWeightInput: string, equityWeightInput: string): { debtWeight: number; equityWeight: number } | null {
  const debtWeight = readRateInput(debtWeightInput);
  const equityWeight = readRateInput(equityWeightInput);

  if (debtWeight === null && equityWeight === null) {
    return null;
  }

  const resolvedDebtWeight = debtWeight ?? 1 - (equityWeight ?? 0);
  const resolvedEquityWeight = equityWeight ?? 1 - resolvedDebtWeight;
  const weightSum = resolvedDebtWeight + resolvedEquityWeight;

  if (
    resolvedDebtWeight < 0 ||
    resolvedDebtWeight > 1 ||
    resolvedEquityWeight < 0 ||
    resolvedEquityWeight > 1 ||
    Math.abs(weightSum - 1) > 0.0001
  ) {
    return null;
  }

  return {
    debtWeight: resolvedDebtWeight,
    equityWeight: resolvedEquityWeight,
  };
}

function readCapitalWeightsFromValues(debtValueInput: string, equityValueInput: string): { debtWeight: number; equityWeight: number } | null {
  const debtValue = readNumberInput(debtValueInput);
  const equityValue = readNumberInput(equityValueInput);

  if (debtValue === null || equityValue === null) {
    return null;
  }

  const total = positive(debtValue) + positive(equityValue);

  if (total <= 0) {
    return null;
  }

  return {
    debtWeight: positive(debtValue) / total,
    equityWeight: positive(equityValue) / total,
  };
}

function readAverageBankInvestmentLoanRate(assumptions: AssumptionState): number | null {
  const rates = [
    readRateInput(assumptions.waccBankPerseroInvestmentLoanRate),
    readRateInput(assumptions.waccBankSwastaInvestmentLoanRate),
    readRateInput(assumptions.waccBankUmumInvestmentLoanRate),
  ].filter((value): value is number => value !== null);

  if (rates.length === 0) {
    return null;
  }

  return rates.reduce((sum, value) => sum + value, 0) / rates.length;
}

function buildComparableBetaRow(
  index: 1 | 2 | 3,
  name: string,
  betaInput: string,
  marketCapInput: string,
  debtInput: string,
  taxRate: number,
): WaccComparableBetaRow {
  const betaLevered = readNumberInput(betaInput);
  const marketCap = readNumberInput(marketCapInput);
  const debt = readNumberInput(debtInput);
  const unleveredBeta =
    betaLevered !== null && marketCap !== null && marketCap > 0 && debt !== null
      ? betaLevered / (1 + (1 - taxRate) * (positive(debt) / positive(marketCap)))
      : null;

  return {
    index,
    name,
    betaLevered,
    marketCap,
    debt,
    unleveredBeta,
  };
}

function positive(value: number): number {
  return Math.max(Math.abs(value), 0);
}

function sumComparableValues(values: Array<number | null>): number | null {
  const validValues = values.filter((value): value is number => value !== null && Number.isFinite(value));

  if (validValues.length === 0) {
    return null;
  }

  return validValues.reduce((sum, value) => sum + positive(value), 0);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
