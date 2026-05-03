import type { CaseProfile, CaseProfileDerived } from "./case-model";
import { parseInputNumber } from "./case-model";
import type { DlomCalculation } from "./dlom";
import type { FinancialStatementSnapshot, FormulaTrace, MethodOutput, ValuationMethod } from "./types";

export type TaxSimulationState = {
  primaryMethod: ValuationMethod | "";
  applyDlom: boolean;
  applyDlocPfc: boolean;
  dlocPfcRate: string;
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
    dlocPfcRate: "",
    reportedTransferValue: "",
    note: "",
  };
}

export function buildSampleTaxSimulationState(): TaxSimulationState {
  return {
    primaryMethod: "AAM",
    applyDlom: true,
    applyDlocPfc: false,
    dlocPfcRate: "",
    reportedTransferValue: "1.600.000.000",
    note: "Sample workbook default: AAM sebagai primary method; DLOM dihitung sebagai scenario layer.",
  };
}

export function calculateTaxSimulation({
  methods,
  dlom,
  state,
  caseProfile,
  caseProfileDerived,
  snapshot,
}: {
  methods: MethodOutput[];
  dlom: DlomCalculation;
  state: TaxSimulationState;
  caseProfile: CaseProfile;
  caseProfileDerived: CaseProfileDerived;
  snapshot: FinancialStatementSnapshot;
}): TaxSimulationResult {
  const sharePercentage = caseProfileDerived.capitalProportionStatus === "valid" ? caseProfileDerived.capitalProportion ?? 0 : 0;
  const reportedTransferValue = readReportedTransferValue(state, caseProfile);
  const dlocPfcRate = state.applyDlocPfc ? parseRateInput(state.dlocPfcRate) : 0;
  const dlomRate = state.applyDlom && dlom.isComplete ? dlom.dlomRate : 0;
  const rows = methods.map((method): TaxSimulationMethodRow => {
    const dlomAdjustment = -(method.equityValue * dlomRate);
    const valueAfterDlom = method.equityValue + dlomAdjustment;
    const dlocPfcAdjustment = valueAfterDlom * dlocPfcRate;
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
          formula: "Equity value after DLOM x DLOC/PFC rate",
          value: dlocPfcAdjustment,
          note: state.applyDlocPfc ? "Layer DLOC/PFC aktif; logic detail dapat diperluas pada fase berikutnya." : "DLOC/PFC belum diterapkan.",
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

  const warnings = buildWarnings({ state, dlom, sharePercentage, reportedTransferValue, dlocPfcRate });
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
    dlocPfcRate: typeof value.dlocPfcRate === "string" ? value.dlocPfcRate : empty.dlocPfcRate,
    reportedTransferValue: typeof value.reportedTransferValue === "string" ? value.reportedTransferValue : empty.reportedTransferValue,
    note: typeof value.note === "string" ? value.note : empty.note,
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
  sharePercentage,
  reportedTransferValue,
  dlocPfcRate,
}: {
  state: TaxSimulationState;
  dlom: DlomCalculation;
  sharePercentage: number;
  reportedTransferValue: number;
  dlocPfcRate: number;
}): string[] {
  const warnings: string[] = [];

  if (!state.primaryMethod) {
    warnings.push("Primary Method belum dipilih; summary final tidak akan mengunci angka potensi pajak.");
  }

  if (state.applyDlom && !dlom.isComplete) {
    warnings.push("Apply DLOM aktif, tetapi modul DLOM belum lengkap sehingga rate DLOM diperlakukan 0%.");
  }

  if (state.applyDlocPfc && dlocPfcRate === 0) {
    warnings.push("Apply DLOC/PFC aktif, tetapi rate masih 0%; layer disiapkan sebagai placeholder sampai konsep DLOC/PFC lengkap.");
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
