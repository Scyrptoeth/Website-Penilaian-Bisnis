import type { CaseProfile, CaseProfileDerived } from "./case-model";
import { parseInputNumber } from "./case-model";
import type { DlocPfcCalculation } from "./dloc-pfc";
import type { DlomCalculation } from "./dlom";
import {
  calculateTaxByRegime,
  resolveTaxRateRegime,
  type ProgressiveTaxComputationBracket,
  type TaxComputation,
  type TaxYearResolution,
} from "./tax-rates";
import type { FinancialStatementSnapshot, FormulaTrace, MethodOutput, ValuationMethod } from "./types";

export type TaxSimulationFinalBasis = "baseline" | "manualScenario";
export type TaxpayerResistance = "Tinggi" | "Moderat" | "Rendah" | "Belum lengkap";

export type TaxSimulationState = {
  primaryMethod: ValuationMethod | "";
  finalBasis: TaxSimulationFinalBasis;
  scenarioDlomRate: string;
  scenarioDlocPfcRate: string;
  scenarioReason: string;
  reportedTransferValue: string;
  note: string;
  applyDlom: boolean;
  applyDlocPfc: boolean;
  useDlocPfcOverride: boolean;
  dlocPfcRate: string;
  dlocPfcOverrideReason: string;
};

export type TaxSimulationBasis = {
  id: TaxSimulationFinalBasis;
  label: string;
  dlomRate: number;
  dlomSource: string;
  dlocPfcRate: number;
  dlocPfcSource: string;
  isManual: boolean;
};

export type TaxSimulationMethodRow = {
  basis: TaxSimulationFinalBasis;
  basisLabel: string;
  method: ValuationMethod;
  isPrimary: boolean;
  baseEquityValue: number;
  dlomRate: number;
  dlomAdjustment: number;
  dlomSource: string;
  valueAfterDlom: number;
  dlocPfcRate: number;
  dlocPfcAdjustment: number;
  dlocPfcSource: string;
  marketValueOfEquity100: number;
  sharePercentage: number;
  marketValueOfTransferredInterest: number;
  reportedTransferValue: number;
  transferValueDifference: number;
  potentialTaxableDifference: number;
  taxableIncomeRounded: number;
  potentialTax: number;
  effectiveTaxRate: number;
  requestedTaxYear: number | null;
  appliedTaxYear: number | null;
  isNearestTaxYear: boolean;
  taxBasisLabel: string;
  taxSourceTitle: string;
  taxSourceLegalBasis: string;
  taxSourceUrl: string;
  taxSourceNote: string;
  taxBrackets: ProgressiveTaxComputationBracket[];
  traces: FormulaTrace[];
};

export type TaxSimulationResult = {
  finalBasis: TaxSimulationFinalBasis;
  primaryMethod: ValuationMethod | "";
  primaryRow: TaxSimulationMethodRow | null;
  baselinePrimaryRow: TaxSimulationMethodRow | null;
  scenarioPrimaryRow: TaxSimulationMethodRow | null;
  rows: TaxSimulationMethodRow[];
  baselineRows: TaxSimulationMethodRow[];
  scenarioRows: TaxSimulationMethodRow[];
  overallResistance: TaxpayerResistance;
  taxYearResolution: TaxYearResolution;
  warnings: string[];
};

export function createEmptyTaxSimulationState(): TaxSimulationState {
  return {
    primaryMethod: "",
    finalBasis: "baseline",
    scenarioDlomRate: "",
    scenarioDlocPfcRate: "",
    scenarioReason: "",
    reportedTransferValue: "",
    note: "",
    applyDlom: true,
    applyDlocPfc: true,
    useDlocPfcOverride: false,
    dlocPfcRate: "",
    dlocPfcOverrideReason: "",
  };
}

export function buildSampleTaxSimulationState(): TaxSimulationState {
  return {
    primaryMethod: "AAM",
    finalBasis: "baseline",
    scenarioDlomRate: "",
    scenarioDlocPfcRate: "",
    scenarioReason: "",
    reportedTransferValue: "1.600.000.000",
    note: "Sample workbook default: AAM sebagai primary method; DLOM dan DLOC/PFC otomatis dari tab asal.",
    applyDlom: true,
    applyDlocPfc: true,
    useDlocPfcOverride: false,
    dlocPfcRate: "",
    dlocPfcOverrideReason: "",
  };
}

export function calculateTaxSimulation({
  methods,
  dlom,
  dlocPfc,
  state,
  caseProfile,
  caseProfileDerived,
}: {
  methods: MethodOutput[];
  dlom: DlomCalculation;
  dlocPfc: DlocPfcCalculation;
  state: TaxSimulationState;
  caseProfile: CaseProfile;
  caseProfileDerived: CaseProfileDerived;
  snapshot: FinancialStatementSnapshot;
}): TaxSimulationResult {
  const sharePercentage = caseProfileDerived.capitalProportionStatus === "valid" ? caseProfileDerived.capitalProportion ?? 0 : 0;
  const reportedTransferValue = readReportedTransferValue(state, caseProfile);
  const requestedTaxYear = resolveRequestedTaxYear(caseProfile, caseProfileDerived);
  const taxYearResolution = resolveTaxRateRegime(requestedTaxYear);
  const baselineBasis = buildBaselineBasis(dlom, dlocPfc);
  const scenarioBasis = buildScenarioBasis(state, dlocPfc, baselineBasis);
  const overallResistance = combineTaxpayerResistance(dlom.taxpayerResistance, dlocPfc.taxpayerResistance);
  const baselineRows = buildRows({
    methods,
    basis: baselineBasis,
    state,
    caseProfile,
    sharePercentage,
    reportedTransferValue,
    requestedTaxYear,
  });
  const scenarioRows = buildRows({
    methods,
    basis: scenarioBasis,
    state,
    caseProfile,
    sharePercentage,
    reportedTransferValue,
    requestedTaxYear,
  });
  const finalBasis = state.finalBasis === "manualScenario" ? "manualScenario" : "baseline";
  const rows = finalBasis === "manualScenario" ? scenarioRows : baselineRows;
  const primaryRow = rows.find((row) => row.method === state.primaryMethod) ?? null;
  const baselinePrimaryRow = baselineRows.find((row) => row.method === state.primaryMethod) ?? null;
  const scenarioPrimaryRow = scenarioRows.find((row) => row.method === state.primaryMethod) ?? null;
  const warnings = buildWarnings({
    state,
    dlom,
    dlocPfc,
    sharePercentage,
    reportedTransferValue,
    requestedTaxYear,
    taxYearResolution,
    caseProfile,
  });

  return {
    finalBasis,
    primaryMethod: state.primaryMethod,
    primaryRow,
    baselinePrimaryRow,
    scenarioPrimaryRow,
    rows,
    baselineRows,
    scenarioRows,
    overallResistance,
    taxYearResolution,
    warnings,
  };
}

export function normalizeTaxSimulationState(value: TaxSimulationState): TaxSimulationState {
  const empty = createEmptyTaxSimulationState();
  const primaryMethod = value.primaryMethod === "AAM" || value.primaryMethod === "EEM" || value.primaryMethod === "DCF" ? value.primaryMethod : "";
  const legacyScenarioRate = typeof value.dlocPfcRate === "string" ? value.dlocPfcRate : "";
  const legacyScenarioReason = typeof value.dlocPfcOverrideReason === "string" ? value.dlocPfcOverrideReason : "";

  return {
    primaryMethod,
    finalBasis: value.finalBasis === "manualScenario" ? "manualScenario" : "baseline",
    scenarioDlomRate: typeof value.scenarioDlomRate === "string" ? value.scenarioDlomRate : "",
    scenarioDlocPfcRate: typeof value.scenarioDlocPfcRate === "string" ? value.scenarioDlocPfcRate : legacyScenarioRate,
    scenarioReason: typeof value.scenarioReason === "string" ? value.scenarioReason : legacyScenarioReason,
    reportedTransferValue: typeof value.reportedTransferValue === "string" ? value.reportedTransferValue : empty.reportedTransferValue,
    note: typeof value.note === "string" ? value.note : empty.note,
    applyDlom: true,
    applyDlocPfc: true,
    useDlocPfcOverride: typeof value.useDlocPfcOverride === "boolean" ? value.useDlocPfcOverride : empty.useDlocPfcOverride,
    dlocPfcRate: legacyScenarioRate,
    dlocPfcOverrideReason: legacyScenarioReason,
  };
}

export function resolveDlocPfcRate(
  _state: TaxSimulationState,
  dlocPfc: DlocPfcCalculation,
): { rate: number; sourceLabel: string; usesOverride: boolean; hasValidOverride: boolean } {
  if (dlocPfc.isComplete) {
    return {
      rate: dlocPfc.signedRate,
      sourceLabel: `DLOC/PFC otomatis dari tab DLOC/PFC (${dlocPfc.adjustmentType})`,
      usesOverride: false,
      hasValidOverride: true,
    };
  }

  return {
    rate: 0,
    sourceLabel: "DLOC/PFC belum lengkap; baseline otomatis memakai 0% sementara",
    usesOverride: false,
    hasValidOverride: false,
  };
}

export function combineTaxpayerResistance(dlomResistance: TaxpayerResistance, dlocPfcResistance: TaxpayerResistance): TaxpayerResistance {
  if (dlomResistance === "Belum lengkap" || dlocPfcResistance === "Belum lengkap") {
    return "Belum lengkap";
  }

  if (dlomResistance === "Tinggi" && dlocPfcResistance === "Rendah") {
    return "Moderat";
  }

  if (dlomResistance === "Rendah" && dlocPfcResistance === "Tinggi") {
    return "Moderat";
  }

  if (dlomResistance === "Tinggi" || dlocPfcResistance === "Tinggi") {
    return "Tinggi";
  }

  if (dlomResistance === "Moderat" || dlocPfcResistance === "Moderat") {
    return "Moderat";
  }

  return "Rendah";
}

function buildRows({
  methods,
  basis,
  state,
  caseProfile,
  sharePercentage,
  reportedTransferValue,
  requestedTaxYear,
}: {
  methods: MethodOutput[];
  basis: TaxSimulationBasis;
  state: TaxSimulationState;
  caseProfile: CaseProfile;
  sharePercentage: number;
  reportedTransferValue: number;
  requestedTaxYear: number | null;
}): TaxSimulationMethodRow[] {
  return methods.map((method): TaxSimulationMethodRow => {
    const dlomAdjustment = -(method.equityValue * basis.dlomRate);
    const valueAfterDlom = method.equityValue + dlomAdjustment;
    const dlocPfcAdjustment = -(valueAfterDlom * basis.dlocPfcRate);
    const marketValueOfEquity100 = valueAfterDlom + dlocPfcAdjustment;
    const marketValueOfTransferredInterest = marketValueOfEquity100 * sharePercentage;
    const transferValueDifference = marketValueOfTransferredInterest - reportedTransferValue;
    const potentialTaxableDifference = Math.max(0, transferValueDifference);
    const taxComputation = calculateTaxByRegime(potentialTaxableDifference, resolveTaxpayerKind(caseProfile.subjectTaxpayerType), requestedTaxYear);

    return {
      basis: basis.id,
      basisLabel: basis.label,
      method: method.method,
      isPrimary: state.primaryMethod === method.method,
      baseEquityValue: method.equityValue,
      dlomRate: basis.dlomRate,
      dlomAdjustment,
      dlomSource: basis.dlomSource,
      valueAfterDlom,
      dlocPfcRate: basis.dlocPfcRate,
      dlocPfcAdjustment,
      dlocPfcSource: basis.dlocPfcSource,
      marketValueOfEquity100,
      sharePercentage,
      marketValueOfTransferredInterest,
      reportedTransferValue,
      transferValueDifference,
      potentialTaxableDifference,
      taxableIncomeRounded: taxComputation.taxableIncomeRounded,
      potentialTax: taxComputation.tax,
      effectiveTaxRate: taxComputation.effectiveRate,
      requestedTaxYear: taxComputation.requestedYear,
      appliedTaxYear: taxComputation.appliedYear,
      isNearestTaxYear: taxComputation.isNearestYear,
      taxBasisLabel: taxComputation.label,
      taxSourceTitle: taxComputation.source?.title ?? "Sumber tarif belum tersedia",
      taxSourceLegalBasis: taxComputation.source?.legalBasis ?? "Tahun pajak belum lengkap",
      taxSourceUrl: taxComputation.source?.url ?? "",
      taxSourceNote: taxComputation.source?.note ?? "",
      taxBrackets: taxComputation.brackets,
      traces: buildTraces({ method, basis, rowValues: { dlomAdjustment, valueAfterDlom, dlocPfcAdjustment, marketValueOfEquity100, marketValueOfTransferredInterest, transferValueDifference }, taxComputation }),
    };
  });
}

function buildTraces({
  method,
  basis,
  rowValues,
  taxComputation,
}: {
  method: MethodOutput;
  basis: TaxSimulationBasis;
  rowValues: {
    dlomAdjustment: number;
    valueAfterDlom: number;
    dlocPfcAdjustment: number;
    marketValueOfEquity100: number;
    marketValueOfTransferredInterest: number;
    transferValueDifference: number;
  };
  taxComputation: TaxComputation;
}): FormulaTrace[] {
  return [
    {
      label: `${method.method} base equity value`,
      formula: "Nilai ekuitas 100% sebelum DLOM/DLOC/PFC",
      value: method.equityValue,
      note: "Diambil dari base valuation; tidak dimutasi oleh scenario layer.",
    },
    {
      label: "DLOM adjustment",
      formula: "Base equity value x DLOM rate x -1",
      value: rowValues.dlomAdjustment,
      note: basis.dlomSource,
    },
    {
      label: "Equity value after DLOM",
      formula: "Base equity value + DLOM adjustment",
      value: rowValues.valueAfterDlom,
      note: basis.label,
    },
    {
      label: "DLOC/PFC adjustment",
      formula: "Equity value after DLOM x DLOC/PFC signed rate x -1",
      value: rowValues.dlocPfcAdjustment,
      note: basis.dlocPfcSource,
    },
    {
      label: "Market value of transferred interest",
      formula: "Market value of 100% equity x percentage of shares/capital valued",
      value: rowValues.marketValueOfTransferredInterest,
      note: "Persentase berasal dari Data Awal.",
    },
    {
      label: "Selisih nilai wajar vs dilaporkan",
      formula: "Market value of transferred interest - nilai pengalihan dilaporkan",
      value: rowValues.transferValueDifference,
      note: "Selisih aktual tetap ditampilkan walaupun negatif.",
    },
    {
      label: "PKP simulasi pajak",
      formula: "PKP positif dibulatkan ke bawah sampai ribuan",
      value: taxComputation.taxableIncomeRounded,
      note: taxComputation.label,
    },
  ];
}

function buildBaselineBasis(dlom: DlomCalculation, dlocPfc: DlocPfcCalculation): TaxSimulationBasis {
  return {
    id: "baseline",
    label: "Baseline otomatis",
    dlomRate: dlom.isComplete ? dlom.dlomRate : 0,
    dlomSource: dlom.isComplete ? "DLOM otomatis dari tab DLOM." : "DLOM belum lengkap; baseline otomatis memakai 0% sementara.",
    dlocPfcRate: dlocPfc.isComplete ? dlocPfc.signedRate : 0,
    dlocPfcSource: dlocPfc.isComplete
      ? `DLOC/PFC otomatis dari tab DLOC/PFC (${dlocPfc.adjustmentType}).`
      : "DLOC/PFC belum lengkap; baseline otomatis memakai 0% sementara.",
    isManual: false,
  };
}

function buildScenarioBasis(state: TaxSimulationState, dlocPfc: DlocPfcCalculation, baseline: TaxSimulationBasis): TaxSimulationBasis {
  const scenarioDlomRate = readOptionalRate(state.scenarioDlomRate);
  const scenarioDlocPfcRate = readOptionalRate(state.scenarioDlocPfcRate);
  const dlocPfcAdjustmentType = dlocPfc.adjustmentType || "DLOC";
  const signedDlocPfcRate =
    scenarioDlocPfcRate === null
      ? baseline.dlocPfcRate
      : dlocPfcAdjustmentType === "PFC"
        ? -Math.abs(scenarioDlocPfcRate)
        : Math.abs(scenarioDlocPfcRate);

  return {
    id: "manualScenario",
    label: "Skenario manual",
    dlomRate: scenarioDlomRate === null ? baseline.dlomRate : Math.abs(scenarioDlomRate),
    dlomSource:
      scenarioDlomRate === null
        ? "Belum ada override skenario; memakai DLOM baseline otomatis."
        : "Override skenario di tab Simulasi Potensi Pajak; tidak mengubah tab DLOM.",
    dlocPfcRate: signedDlocPfcRate,
    dlocPfcSource:
      scenarioDlocPfcRate === null
        ? "Belum ada override skenario; memakai DLOC/PFC baseline otomatis."
        : `Override skenario di tab Simulasi Potensi Pajak; input positif diperlakukan sebagai ${dlocPfcAdjustmentType}.`,
    isManual: true,
  };
}

function readReportedTransferValue(state: TaxSimulationState, caseProfile: CaseProfile): number {
  const overrideValue = parseInputNumber(state.reportedTransferValue);

  if (overrideValue > 0) {
    return overrideValue;
  }

  return parseInputNumber(caseProfile.capitalBaseValued);
}

function buildWarnings({
  state,
  dlom,
  dlocPfc,
  sharePercentage,
  reportedTransferValue,
  requestedTaxYear,
  taxYearResolution,
  caseProfile,
}: {
  state: TaxSimulationState;
  dlom: DlomCalculation;
  dlocPfc: DlocPfcCalculation;
  sharePercentage: number;
  reportedTransferValue: number;
  requestedTaxYear: number | null;
  taxYearResolution: TaxYearResolution;
  caseProfile: CaseProfile;
}): string[] {
  const warnings: string[] = [];

  if (!state.primaryMethod) {
    warnings.push("Primary Method belum dipilih; summary final tidak akan mengunci angka potensi pajak.");
  }

  if (!dlom.isComplete) {
    warnings.push("Baseline otomatis wajib mengambil DLOM dari tab DLOM, tetapi modul DLOM belum lengkap sehingga rate sementara 0%.");
  }

  if (!dlocPfc.isComplete) {
    warnings.push("Baseline otomatis wajib mengambil DLOC/PFC dari tab DLOC/PFC, tetapi questionnaire belum lengkap sehingga rate sementara 0%.");
  }

  if (state.finalBasis === "manualScenario" && state.scenarioReason.trim() === "") {
    warnings.push("Basis final memakai Skenario manual; catatan skenario sebaiknya diisi untuk audit trail.");
  }

  if (sharePercentage <= 0 || sharePercentage > 1) {
    warnings.push("Persentase saham/modal yang dinilai belum valid di Data Awal.");
  }

  if (reportedTransferValue <= 0) {
    warnings.push("Nilai pengalihan saham yang dilaporkan belum tersedia.");
  }

  if (caseProfile.subjectTaxpayerType !== "Orang Pribadi" && caseProfile.subjectTaxpayerType !== "Badan") {
    warnings.push("Jenis Subjek Pajak belum dipilih; simulasi tarif memakai Orang Pribadi sebagai default sementara.");
  }

  if (requestedTaxYear === null) {
    warnings.push("Tahun Pajak belum dapat ditentukan dari Tahun Transaksi Pengalihan di Data Awal.");
  }

  if (taxYearResolution.isNearestYear && taxYearResolution.requestedYear !== null && taxYearResolution.appliedYear !== null) {
    warnings.push(`Tahun Pajak ${taxYearResolution.requestedYear} berada di luar database 2020-2025; engine memakai tahun terdekat ${taxYearResolution.appliedYear}.`);
  }

  return warnings;
}

function resolveTaxpayerKind(subjectTaxpayerType: string): "individual" | "corporate" {
  return subjectTaxpayerType === "Badan" ? "corporate" : "individual";
}

function resolveRequestedTaxYear(caseProfile: CaseProfile, caseProfileDerived: CaseProfileDerived): number | null {
  const cutOffYear = readYear(caseProfileDerived.cutOffDate);

  if (cutOffYear !== null) {
    return cutOffYear;
  }

  const transactionYear = readYear(caseProfile.transactionYear);

  return transactionYear === null ? null : transactionYear - 1;
}

function readOptionalRate(input: string): number | null {
  if (!input.trim()) {
    return null;
  }

  return parseRateInput(input);
}

function parseRateInput(input: string): number {
  const value = parseInputNumber(input);

  return input.includes("%") || Math.abs(value) > 1 ? value / 100 : value;
}

function readYear(value: string): number | null {
  const match = /\b(19\d{2}|20\d{2})\b/.exec(value.trim());

  return match ? Number(match[1]) : null;
}
