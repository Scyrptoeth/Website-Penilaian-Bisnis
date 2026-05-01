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
  const weights = readCapitalWeightsFromValues(assumptions.waccDebtMarketValue, assumptions.waccEquityMarketValue)
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
  const targetWeights = readCapitalWeightsFromValues(assumptions.waccDebtMarketValue, assumptions.waccEquityMarketValue);
  const rows: WaccComparableBetaRow[] = [
    buildComparableBetaRow(1, assumptions.waccComparable1Name, assumptions.waccComparable1BetaLevered, assumptions.waccComparable1MarketCap, assumptions.waccComparable1Debt, taxRate),
    buildComparableBetaRow(2, assumptions.waccComparable2Name, assumptions.waccComparable2BetaLevered, assumptions.waccComparable2MarketCap, assumptions.waccComparable2Debt, taxRate),
    buildComparableBetaRow(3, assumptions.waccComparable3Name, assumptions.waccComparable3BetaLevered, assumptions.waccComparable3MarketCap, assumptions.waccComparable3Debt, taxRate),
  ];
  const validUnleveredBetas = rows
    .map((row) => row.unleveredBeta)
    .filter((value): value is number => value !== null && Number.isFinite(value));
  const averageUnleveredBeta =
    validUnleveredBetas.length > 0
      ? validUnleveredBetas.reduce((sum, value) => sum + value, 0) / validUnleveredBetas.length
      : null;
  const releveredBeta =
    averageUnleveredBeta !== null && targetWeights && targetWeights.equityWeight > 0
      ? averageUnleveredBeta * (1 + (1 - taxRate) * (targetWeights.debtWeight / targetWeights.equityWeight))
      : null;

  return {
    rows,
    averageUnleveredBeta,
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

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
