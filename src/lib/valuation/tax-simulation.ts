import type { CaseProfile, CaseProfileDerived } from "./case-model";
import { parseInputNumber } from "./case-model";
import type { DlocPfcCalculation } from "./dloc-pfc";
import type { DlomCalculation } from "./dlom";
import type { FinancialStatementSnapshot, FormulaTrace, MethodOutput, ValuationMethod } from "./types";

export type TaxSimulationState = {
  primaryMethod: ValuationMethod | "";
  applyDlom: boolean;
  applyDlocPfc: boolean;
  useDlocPfcOverride: boolean;
  dlocPfcRate: string;
  dlocPfcOverrideReason: string;
  reportedTransferValue: string;
  note: string;
};

export type TaxSimulationMethodRow = {
  method: ValuationMethod;
  isPrimary: boolean;
  baseEquityValue: number;
  dlomRate: number;
  dlomAdjustment: number;
  valueAfterDlom: number;
  dlocPfcRate: number;
  dlocPfcAdjustment: number;
  dlocPfcSource: string;
  marketValueOfEquity100: number;
  sharePercentage: number;
  marketValueOfTransferredInterest: number;
  reportedTransferValue: number;
  potentialTaxableDifference: number;
  potentialTax: number;
  taxBasisLabel: string;
  traces: FormulaTrace[];
};

export type TaxSimulationResult = {
  primaryMethod: ValuationMethod | "";
  primaryRow: TaxSimulationMethodRow | null;
  rows: TaxSimulationMethodRow[];
  warnings: string[];
};

export function createEmptyTaxSimulationState(): TaxSimulationState {
  return {
    primaryMethod: "",
    applyDlom: false,
    applyDlocPfc: false,
    useDlocPfcOverride: false,
    dlocPfcRate: "",
    dlocPfcOverrideReason: "",
    reportedTransferValue: "",
    note: "",
  };
}

export function buildSampleTaxSimulationState(): TaxSimulationState {
  return {
    primaryMethod: "AAM",
    applyDlom: true,
    applyDlocPfc: true,
    useDlocPfcOverride: false,
    dlocPfcRate: "",
    dlocPfcOverrideReason: "",
    reportedTransferValue: "1.600.000.000",
    note: "Sample workbook default: AAM sebagai primary method; DLOM dan DLOC/PFC dihitung sebagai scenario layer.",
  };
}

export function calculateTaxSimulation({
  methods,
  dlom,
  dlocPfc,
  state,
  caseProfile,
  caseProfileDerived,
  snapshot,
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
  const dlocPfcRateResolution = resolveDlocPfcRate(state, dlocPfc);
  const dlocPfcRate = dlocPfcRateResolution.rate;
  const dlomRate = state.applyDlom && dlom.isComplete ? dlom.dlomRate : 0;
  const rows = methods.map((method): TaxSimulationMethodRow => {
    const dlomAdjustment = -(method.equityValue * dlomRate);
    const valueAfterDlom = method.equityValue + dlomAdjustment;
    const dlocPfcAdjustment = -(valueAfterDlom * dlocPfcRate);
    const marketValueOfEquity100 = valueAfterDlom + dlocPfcAdjustment;
    const marketValueOfTransferredInterest = marketValueOfEquity100 * sharePercentage;
    const potentialTaxableDifference = Math.max(0, marketValueOfTransferredInterest - reportedTransferValue);
    const taxComputation = calculatePotentialTax(potentialTaxableDifference, caseProfile.subjectTaxpayerType, snapshot.taxRate);

    return {
      method: method.method,
      isPrimary: state.primaryMethod === method.method,
      baseEquityValue: method.equityValue,
      dlomRate,
      dlomAdjustment,
      valueAfterDlom,
      dlocPfcRate,
      dlocPfcAdjustment,
      dlocPfcSource: dlocPfcRateResolution.sourceLabel,
      marketValueOfEquity100,
      sharePercentage,
      marketValueOfTransferredInterest,
      reportedTransferValue,
      potentialTaxableDifference,
      potentialTax: taxComputation.tax,
      taxBasisLabel: taxComputation.label,
      traces: [
        {
          label: `${method.method} base equity value`,
          formula: "Nilai ekuitas 100% sebelum DLOM/DLOC/PFC",
          value: method.equityValue,
          note: "Diambil dari base valuation; tidak dimutasi oleh scenario layer.",
        },
        {
          label: "DLOM adjustment",
          formula: "Base equity value x DLOM rate x -1",
          value: dlomAdjustment,
          note: state.applyDlom ? "DLOM aktif di simulasi pajak." : "DLOM tidak diterapkan pada simulasi ini.",
        },
        {
          label: "DLOC/PFC adjustment",
          formula: "Equity value after DLOM x DLOC/PFC signed rate x -1",
          value: dlocPfcAdjustment,
          note: state.applyDlocPfc
            ? `${dlocPfcRateResolution.sourceLabel}. DLOC positif menurunkan nilai; PFC negatif menaikkan nilai melalui multiplier -1.`
            : "DLOC/PFC belum diterapkan.",
        },
        {
          label: "Market value of transferred interest",
          formula: "Market value of 100% equity x percentage of shares/capital valued",
          value: marketValueOfTransferredInterest,
          note: "Persentase berasal dari Data Awal.",
        },
        {
          label: "Potensi pengalihan belum dikenakan pajak",
          formula: "Max(0, market value of transferred interest - nilai pengalihan dilaporkan)",
          value: potentialTaxableDifference,
          note: taxComputation.label,
        },
      ],
    };
  });

  const warnings = buildWarnings({ state, dlom, dlocPfc, sharePercentage, reportedTransferValue, dlocPfcRateResolution });
  const primaryRow = rows.find((row) => row.method === state.primaryMethod) ?? null;

  return {
    primaryMethod: state.primaryMethod,
    primaryRow,
    rows,
    warnings,
  };
}

export function normalizeTaxSimulationState(value: TaxSimulationState): TaxSimulationState {
  const empty = createEmptyTaxSimulationState();
  const primaryMethod = value.primaryMethod === "AAM" || value.primaryMethod === "EEM" || value.primaryMethod === "DCF" ? value.primaryMethod : "";

  return {
    primaryMethod,
    applyDlom: typeof value.applyDlom === "boolean" ? value.applyDlom : empty.applyDlom,
    applyDlocPfc: typeof value.applyDlocPfc === "boolean" ? value.applyDlocPfc : empty.applyDlocPfc,
    useDlocPfcOverride: typeof value.useDlocPfcOverride === "boolean" ? value.useDlocPfcOverride : empty.useDlocPfcOverride,
    dlocPfcRate: typeof value.dlocPfcRate === "string" ? value.dlocPfcRate : empty.dlocPfcRate,
    dlocPfcOverrideReason: typeof value.dlocPfcOverrideReason === "string" ? value.dlocPfcOverrideReason : empty.dlocPfcOverrideReason,
    reportedTransferValue: typeof value.reportedTransferValue === "string" ? value.reportedTransferValue : empty.reportedTransferValue,
    note: typeof value.note === "string" ? value.note : empty.note,
  };
}

export function resolveDlocPfcRate(
  state: TaxSimulationState,
  dlocPfc: DlocPfcCalculation,
): { rate: number; sourceLabel: string; usesOverride: boolean; hasValidOverride: boolean } {
  if (!state.applyDlocPfc) {
    return { rate: 0, sourceLabel: "DLOC/PFC tidak aktif", usesOverride: false, hasValidOverride: false };
  }

  const overrideInput = state.dlocPfcRate.trim();
  const overrideReason = state.dlocPfcOverrideReason.trim();
  const hasValidOverride = state.useDlocPfcOverride && overrideInput !== "" && overrideReason !== "";

  if (hasValidOverride) {
    return {
      rate: parseRateInput(overrideInput),
      sourceLabel: `Override manual dengan alasan: ${overrideReason}`,
      usesOverride: true,
      hasValidOverride: true,
    };
  }

  if (dlocPfc.isComplete) {
    return {
      rate: dlocPfc.signedRate,
      sourceLabel: `Rate otomatis dari tab DLOC/PFC (${dlocPfc.adjustmentType})`,
      usesOverride: false,
      hasValidOverride: false,
    };
  }

  return {
    rate: 0,
    sourceLabel: "DLOC/PFC belum lengkap dan override valid belum tersedia",
    usesOverride: false,
    hasValidOverride: false,
  };
}

function calculatePotentialTax(
  taxableDifference: number,
  subjectTaxpayerType: string,
  corporateTaxRate: number,
): { tax: number; label: string } {
  if (taxableDifference <= 0) {
    return { tax: 0, label: "Tidak ada potensi kurang bayar karena selisih pengalihan tidak positif." };
  }

  if (subjectTaxpayerType === "Badan") {
    return {
      tax: taxableDifference * corporateTaxRate,
      label: `Subjek badan: potensi pajak memakai tarif pajak aktif ${formatRate(corporateTaxRate)}.`,
    };
  }

  const brackets = [
    { cap: 60_000_000, rate: 0.05 },
    { cap: 190_000_000, rate: 0.15 },
    { cap: Infinity, rate: 0.25 },
  ];
  let remaining = taxableDifference;
  let tax = 0;

  for (const bracket of brackets) {
    const taxable = Math.min(remaining, bracket.cap);

    if (taxable <= 0) {
      break;
    }

    tax += taxable * bracket.rate;
    remaining -= taxable;
  }

  return {
    tax,
    label: "Subjek orang pribadi: bracket workbook 5% sampai 60 juta, 15% untuk 190 juta berikutnya, dan 25% untuk sisa selisih.",
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
  dlocPfcRateResolution,
}: {
  state: TaxSimulationState;
  dlom: DlomCalculation;
  dlocPfc: DlocPfcCalculation;
  sharePercentage: number;
  reportedTransferValue: number;
  dlocPfcRateResolution: ReturnType<typeof resolveDlocPfcRate>;
}): string[] {
  const warnings: string[] = [];

  if (!state.primaryMethod) {
    warnings.push("Primary Method belum dipilih; summary final tidak akan mengunci angka potensi pajak.");
  }

  if (state.applyDlom && !dlom.isComplete) {
    warnings.push("Apply DLOM aktif, tetapi modul DLOM belum lengkap sehingga rate DLOM diperlakukan 0%.");
  }

  if (state.applyDlocPfc && !dlocPfc.isComplete && !dlocPfcRateResolution.hasValidOverride) {
    warnings.push("Apply DLOC/PFC aktif, tetapi questionnaire DLOC/PFC belum lengkap dan override beralasan belum tersedia; rate diperlakukan 0%.");
  }

  if (state.applyDlocPfc && state.useDlocPfcOverride && state.dlocPfcRate.trim() === "") {
    warnings.push("Override DLOC/PFC aktif, tetapi rate override belum diisi.");
  }

  if (state.applyDlocPfc && state.useDlocPfcOverride && state.dlocPfcOverrideReason.trim() === "") {
    warnings.push("Override DLOC/PFC aktif, tetapi alasan override wajib diisi untuk audit trail.");
  }

  if (state.applyDlocPfc && dlocPfc.adjustmentType === "DLOC" && dlocPfcRateResolution.rate < 0) {
    warnings.push("DLOC dari kepemilikan minoritas seharusnya memakai signed rate positif agar adjustment menurunkan nilai.");
  }

  if (state.applyDlocPfc && dlocPfc.adjustmentType === "PFC" && dlocPfcRateResolution.rate > 0) {
    warnings.push("PFC dari kepemilikan mayoritas seharusnya memakai signed rate negatif agar adjustment menaikkan nilai.");
  }

  if (sharePercentage <= 0 || sharePercentage > 1) {
    warnings.push("Persentase saham/modal yang dinilai belum valid di Data Awal.");
  }

  if (reportedTransferValue <= 0) {
    warnings.push("Nilai pengalihan saham yang dilaporkan belum tersedia.");
  }

  return warnings;
}

function parseRateInput(input: string): number {
  const value = parseInputNumber(input);

  return input.includes("%") || Math.abs(value) > 1 ? value / 100 : value;
}

function formatRate(value: number): string {
  return `${Math.round(value * 100)}%`;
}
