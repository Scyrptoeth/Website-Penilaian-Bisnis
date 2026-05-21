import type { AssumptionState } from "./case-model";
import { valuationDriverGovernancePolicy } from "./valuation-driver-governance-policy";

export type WaccCalculation = {
  riskFreeRate: number;
  equityRiskPremium: number;
  costOfEquity: number;
  afterTaxCostOfDebt: number;
  debtWeight: number;
  equityWeight: number;
  beta: number;
  preTaxCostOfDebt: number;
  ratingBasedDefaultSpread: number;
  countryRiskAdjustment: number;
  comparableBeta?: WaccComparableBetaCalculation;
  bankLoanRate?: WaccBankLoanRateCalculation;
  wacc: number;
};

export type WaccBankLoanRateRow = {
  key: keyof AssumptionState;
  label: string;
  sourceCell: string;
  value: number | null;
};

export type WaccBankLoanRateCalculation = {
  basis: "workbook-five-bank" | "system-three-bank";
  basisLabel: string;
  rows: WaccBankLoanRateRow[];
  rawAverageRate: number;
  roundedRate: number;
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
  basis: "capacity_evidence" | "wacc_capital_structure" | "all_equity";
  basisLabel: string;
};

export type RequiredReturnOnNtaBalances = {
  accountReceivable: number;
  employeeReceivable?: number;
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
  const bankLoanRate = calculateWaccBankLoanRateAssumption(assumptions);
  const preTaxCostOfDebt = readRateInput(assumptions.waccPreTaxCostOfDebt) ?? bankLoanRate?.roundedRate ?? null;
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
    riskFreeRate,
    equityRiskPremium,
    costOfEquity,
    afterTaxCostOfDebt,
    debtWeight: weights.debtWeight,
    equityWeight: weights.equityWeight,
    beta,
    preTaxCostOfDebt,
    ratingBasedDefaultSpread,
    countryRiskAdjustment: countryRiskPremium + specificRiskPremium,
    comparableBeta,
    bankLoanRate: bankLoanRate ?? undefined,
    wacc,
  };
}

export function calculateWaccBankLoanRateAssumption(assumptions: AssumptionState): WaccBankLoanRateCalculation | null {
  const hasWorkbookGranularInput =
    hasAssumptionInput(assumptions, "waccBankPemdaInvestmentLoanRate") ||
    hasAssumptionInput(assumptions, "waccBankAsingInvestmentLoanRate") ||
    hasAssumptionInput(assumptions, "waccBankCampuranInvestmentLoanRate");
  const rows = hasWorkbookGranularInput ? buildWorkbookBankLoanRateRows(assumptions) : buildSystemBankLoanRateRows(assumptions);
  const validRates = rows.map((row) => row.value).filter((value): value is number => value !== null);

  if (validRates.length === 0) {
    return null;
  }

  const rawAverageRate = validRates.reduce((sum, value) => sum + value, 0) / validRates.length;

  return {
    basis: hasWorkbookGranularInput ? "workbook-five-bank" : "system-three-bank",
    basisLabel: hasWorkbookGranularInput ? "Rata-rata debt rate lima kelompok bank" : "Saran SBDK OJK / input bank tersedia",
    rows,
    rawAverageRate,
    roundedRate: roundDiscountRateDebtRate(rawAverageRate),
  };
}

export function roundDiscountRateDebtRate(rate: number): number {
  return Math.round(rate * 1000) / 1000;
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
  const explicitCapitalWeights = readCapitalWeights(assumptions.waccDebtWeight, assumptions.waccEquityWeight);
  const comparableCapitalWeights =
    aggregateMarketCap !== null && aggregateDebt !== null && aggregateMarketCap + aggregateDebt > 0
      ? {
          debtWeight: aggregateDebt / (aggregateDebt + aggregateMarketCap),
          equityWeight: aggregateMarketCap / (aggregateDebt + aggregateMarketCap),
        }
      : null;
  const capitalWeights =
    explicitCapitalWeights
    ?? comparableCapitalWeights
    ?? readCapitalWeightsFromValues(assumptions.waccDebtMarketValue, assumptions.waccEquityMarketValue);
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
  const accountReceivable = positive(balances.accountReceivable) + positive(balances.employeeReceivable ?? 0);
  const inventory = positive(balances.inventory);
  const fixedAssetsNet = positive(balances.fixedAssetsNet);
  const tangibleAssetBase = accountReceivable + inventory + fixedAssetsNet;

  if (afterTaxDebtCost === null || equityReturn === null || tangibleAssetBase <= 0) {
    return null;
  }

  const hasCapacityEvidence =
    (accountReceivable <= 0 || receivablesCapacity !== null) &&
    (inventory <= 0 || inventoryCapacity !== null) &&
    (fixedAssetsNet <= 0 || fixedAssetCapacity !== null);

  if (hasCapacityEvidence) {
    const debtCapacity =
      accountReceivable * (receivablesCapacity ?? 0) +
      inventory * (inventoryCapacity ?? 0) +
      fixedAssetsNet * (fixedAssetCapacity ?? 0) +
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
      basis: "capacity_evidence",
      basisLabel: "Model kapasitas BORROWING CAP",
    };
  }

  const waccCalculation = calculateWaccAssumption(assumptions);

  if (waccCalculation) {
    const debtWeight = waccCalculation.debtWeight;
    const equityWeight = waccCalculation.equityWeight;
    const debtCapacity = tangibleAssetBase * debtWeight;
    const requiredReturn = debtWeight * afterTaxDebtCost + equityWeight * equityReturn;

    return {
      tangibleAssetBase,
      debtCapacity,
      debtWeight,
      equityWeight,
      requiredReturn,
      basis: "wacc_capital_structure",
      basisLabel: "Fallback struktur kapital WACC",
    };
  }

  const requiredReturn = equityReturn;

  return {
    tangibleAssetBase,
    debtCapacity: 0,
    debtWeight: 0,
    equityWeight: 1,
    requiredReturn,
    basis: "all_equity",
    basisLabel: "Fallback konservatif seluruh ekuitas",
  };
}

export function buildRequiredReturnOnNtaSuggestion({
  accountReceivable,
  employeeReceivable,
  inventory,
  fixedAssetsNet,
  waccCalculation,
}: RequiredReturnOnNtaSuggestionInputs): RequiredReturnOnNtaSuggestion {
  const policy = valuationDriverGovernancePolicy.requiredReturnOnNta;
  const receivables = positive(accountReceivable) + positive(employeeReceivable);
  const inventoryBase = positive(inventory);
  const fixedAssetBase = positive(fixedAssetsNet);
  const fields: RequiredReturnOnNtaSuggestion["fields"] = {
    requiredReturnReceivablesCapacity: {
      key: "requiredReturnReceivablesCapacity",
      label: "Kapasitas piutang",
      value: receivables > 0 ? policy.receivablesCapacityProxy : null,
      source: "Dihitung dari Neraca aktif dan struktur BORROWING CAP",
      basis: "Jumlah piutang menggabungkan account receivable dan other/employee receivable seperti BORROWING CAP.",
      formula: "Jumlah piutang x kapasitas piutang",
      note: "Workbook memakai borrowing capacity piutang sama dengan jumlah piutang, sehingga rasio menjadi 100% bila saldo piutang tersedia. Review aging dan ketertertagihan sebelum dipakai final.",
      status: receivables > 0 ? "auto" : "waiting",
      canAutoApply: true,
    },
    requiredReturnInventoryCapacity: {
      key: "requiredReturnInventoryCapacity",
      label: "Kapasitas persediaan",
      value: inventoryBase > 0 ? policy.inventoryCapacityProxy : 0,
      source: "Dihitung dari Neraca aktif dan struktur BORROWING CAP",
      basis: inventoryBase > 0
        ? "Workbook memakai borrowing capacity persediaan sama dengan jumlah persediaan, sehingga rasio menjadi 100% bila saldo persediaan tersedia."
        : "Inventory aktif nol; formula workbook memakai 0 bila denominator inventory tidak tersedia.",
      formula: "Persediaan eligible x kapasitas persediaan",
      note: inventoryBase > 0
        ? "Saran mengikuti workbook untuk rekonsiliasi. Override bila ada lender haircut, aging, slow-moving inventory, atau bukti kelayakan agunan yang lebih kuat."
        : "Inventory aktif masih nol, sehingga saran sistem adalah 0% dan tidak menambah kapasitas utang.",
      status: "auto",
      canAutoApply: true,
    },
    requiredReturnFixedAssetCapacity: {
      key: "requiredReturnFixedAssetCapacity",
      label: "Kapasitas aset tetap",
      value: fixedAssetBase > 0 ? policy.fixedAssetCapacityProxy : null,
      source: "Dihitung dari Aset Tetap aktif, struktur BORROWING CAP, dan referensi PBI/OJK agunan",
      basis: "Workbook memakai 70% atas aset tetap neto; PBI/OJK collateral-recognition dipakai sebagai proxy formal yang tetap perlu review kasus.",
      formula: "Aset tetap neto x kapasitas aset tetap",
      note: "Saran sistem memakai 70% atas aset tetap neto sebagai proxy berbasis rujukan. Override bila appraisal, covenant, umur/manfaat aset, nilai likuidasi, atau pledgeability menunjukkan haircut berbeda.",
      status: fixedAssetBase > 0 ? "auto" : "waiting",
      canAutoApply: true,
    },
    requiredReturnAdditionalCapacity: {
      key: "requiredReturnAdditionalCapacity",
      label: "Jumlah kapasitas tambahan",
      value: 0,
      source: "Input manual penilai di luar struktur BORROWING CAP",
      basis: "Piutang tambahan sudah masuk Jumlah Piutang; kapasitas tambahan hanya untuk agunan berwujud lain yang didukung bukti terpisah.",
      formula: "Jumlah eligible manual ditambahkan ke kapasitas utang",
      note: "Gunakan 0 bila tidak ada kapasitas berwujud tambahan yang didukung bukti, agar tidak double-count dengan piutang, inventory, atau fixed assets.",
      status: "auto",
      canAutoApply: false,
    },
  };
  const waitingFor: string[] = [];

  if (waccCalculation) {
    fields.requiredReturnAfterTaxDebtCost = {
      key: "requiredReturnAfterTaxDebtCost",
      label: "After-tax debt cost",
      value: waccCalculation.afterTaxCostOfDebt,
      source: "Dihitung dari input WACC aktif",
      basis: "Pre-tax debt cost dan tarif pajak aktif",
      formula: "Kd after tax = pre-tax debt rate x (1 - tax rate)",
      note: "Ditarik dari input WACC aktif agar cost of debt konsisten dengan DCF/EEM. Tetap dapat dioverride bila NTA capital charge memakai debt-cost basis berbeda.",
      status: "auto",
      canAutoApply: true,
    };
    fields.requiredReturnEquityCost = {
      key: "requiredReturnEquityCost",
      label: "Return ekuitas aset berwujud",
      value: waccCalculation.costOfEquity,
      source: "Dihitung dari DISCOUNT RATE dan tab WACC aktif",
      basis: "Risk-free rate, beta, ERP, rating-based default spread, dan penyesuaian risiko eksplisit.",
      formula: "Ke = risk-free rate + beta x ERP + country/company risk adjustment",
      note: "Nilai ini merekonsiliasi DISCOUNT RATE sebagai biaya modal ekuitas dan mengalir ke Return ekuitas aset berwujud pada BORROWING CAP. Override hanya jika return aset berwujud memakai basis terpisah.",
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
    summary: "Sistem menurunkan borrowing capacity dari Jumlah Piutang, Persediaan, Aset Tetap, Kd, dan Ke. Review atau override capacity rate bila bukti kasus memberi haircut yang lebih tepat.",
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

function buildWorkbookBankLoanRateRows(assumptions: AssumptionState): WaccBankLoanRateRow[] {
  return [
    bankLoanRateRow(assumptions, "waccBankPerseroInvestmentLoanRate", "Bank Persero", "L6"),
    bankLoanRateRow(assumptions, "waccBankPemdaInvestmentLoanRate", "Bank Pemda", "L7"),
    bankLoanRateRow(assumptions, "waccBankSwastaInvestmentLoanRate", "Bank Swasta Nasional", "L8"),
    bankLoanRateRow(assumptions, "waccBankAsingInvestmentLoanRate", "Bank Asing", "L9"),
    bankLoanRateRow(assumptions, "waccBankCampuranInvestmentLoanRate", "Bank Campuran", "L10"),
  ];
}

function buildSystemBankLoanRateRows(assumptions: AssumptionState): WaccBankLoanRateRow[] {
  return [
    bankLoanRateRow(assumptions, "waccBankPerseroInvestmentLoanRate", "Bank Persero", "Sistem"),
    bankLoanRateRow(assumptions, "waccBankSwastaInvestmentLoanRate", "Bank Swasta", "Sistem"),
    bankLoanRateRow(assumptions, "waccBankUmumInvestmentLoanRate", "Bank Umum", "Sistem"),
  ];
}

function bankLoanRateRow(
  assumptions: AssumptionState,
  key: keyof AssumptionState,
  label: string,
  sourceCell: string,
): WaccBankLoanRateRow {
  return {
    key,
    label,
    sourceCell,
    value: readRateInput(readAssumptionInput(assumptions, key)),
  };
}

function hasAssumptionInput(assumptions: AssumptionState, key: keyof AssumptionState): boolean {
  return readAssumptionInput(assumptions, key).trim() !== "";
}

function readAssumptionInput(assumptions: AssumptionState, key: keyof AssumptionState): string {
  const value = assumptions[key];
  return typeof value === "string" ? value : "";
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
