import type { AssumptionState } from "./case-model";

export type WaccCalculation = {
  costOfEquity: number;
  afterTaxCostOfDebt: number;
  debtWeight: number;
  equityWeight: number;
  wacc: number;
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
  const beta = readNumberInput(assumptions.waccBeta);
  const equityRiskPremium = readRateInput(assumptions.waccEquityRiskPremium);
  const countryRiskPremium = readRateInput(assumptions.waccCountryRiskPremium) ?? 0;
  const specificRiskPremium = readRateInput(assumptions.waccSpecificRiskPremium) ?? 0;
  const preTaxCostOfDebt = readRateInput(assumptions.waccPreTaxCostOfDebt);
  const weights = readCapitalWeights(assumptions.waccDebtWeight, assumptions.waccEquityWeight);

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
    wacc,
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

function positive(value: number): number {
  return Math.max(Math.abs(value), 0);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
