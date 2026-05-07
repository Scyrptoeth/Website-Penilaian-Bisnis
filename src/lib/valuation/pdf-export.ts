import type { AamAdjustmentModel } from "./aam-adjustments";
import type { calculateAllMethods } from "./calculations";
import type {
  AccountRow,
  AssumptionState,
  CaseProfile,
  CaseProfileDerived,
  FixedAssetScheduleRow,
  FixedAssetScheduleSummary,
  MappedRow,
  Period,
} from "./case-model";
import type { DlocPfcCalculation } from "./dloc-pfc";
import type { DlomCalculation } from "./dlom";
import type { WorkbenchReadiness } from "./readiness";
import type { SectionAnalysis } from "./section-analysis";
import type { TaxSimulationResult, TaxSimulationState } from "./tax-simulation";
import type { FinancialStatementSnapshot, ValuationMethod } from "./types";
import type { ValidationCheck } from "./validation-checks";

type CalculationResults = ReturnType<typeof calculateAllMethods>;

export type ValuationPdfExportInput = {
  periods: Period[];
  activePeriodId: string;
  rows: AccountRow[];
  mappedRows: MappedRow[];
  fixedAssetScheduleRows: FixedAssetScheduleRow[];
  fixedAssetSchedule: FixedAssetScheduleSummary;
  assumptions: AssumptionState;
  resolvedAssumptions: AssumptionState;
  caseProfile: CaseProfile;
  caseProfileDerived: CaseProfileDerived;
  snapshot: FinancialStatementSnapshot;
  aamAdjustmentModel: AamAdjustmentModel;
  results: CalculationResults;
  baseResults?: CalculationResults;
  activeWaccBasis?: string;
  activeWaccBasisLabel?: string;
  activeWaccBasisSummary?: string;
  activeDcfBasis?: string;
  activeDcfBasisLabel?: string;
  activeDcfBasisSummary?: string;
  dlomCalculation: DlomCalculation;
  dlocPfcCalculation: DlocPfcCalculation;
  taxSimulation: TaxSimulationState;
  taxSimulationResult: TaxSimulationResult;
  sectionAnalysis: SectionAnalysis;
  readiness: WorkbenchReadiness;
  validationChecks: ValidationCheck[];
  exportedAt?: Date;
};

export type ValuationPdfExportPayload = {
  schemaVersion: 2;
  generatedAt: string;
  scope: ValuationPdfExportScope;
  input: ValuationPdfExportInput;
};

export type ValuationPdfExportScopeId = "aam" | "eem" | "dcf" | "all";

export type ValuationPdfExportScope = {
  id: ValuationPdfExportScopeId;
  label: string;
  title: string;
  methods: ValuationMethod[];
  description: string;
};

export const pdfExportStorageKey = "penilaian-valuasi-bisnis.pdf-export.v1";

export const valuationPdfExportScopes: ValuationPdfExportScope[] = [
  {
    id: "aam",
    label: "Penilaian AAM",
    title: "Laporan Penilaian AAM",
    methods: ["AAM"],
    description: "Asset Accumulation Method, neraca terkait, penyesuaian aset/liabilitas, diskon, dan simulasi pajak AAM.",
  },
  {
    id: "eem",
    label: "Penilaian EEM",
    title: "Laporan Penilaian EEM",
    methods: ["EEM"],
    description: "Excess Earnings Method, driver NTA/NOPLAT, asumsi EEM, diskon, dan simulasi pajak EEM.",
  },
  {
    id: "dcf",
    label: "Penilaian DCF",
    title: "Laporan Penilaian DCF",
    methods: ["DCF"],
    description: "Discounted Cash Flow, driver WACC/terminal growth, sensitivitas DCF, diskon, dan simulasi pajak DCF.",
  },
  {
    id: "all",
    label: "AAM + EEM + DCF",
    title: "Laporan Gabungan AAM, EEM, dan DCF",
    methods: ["AAM", "EEM", "DCF"],
    description: "Default gabungan lengkap untuk membandingkan seluruh metode penilaian dalam satu PDF.",
  },
];

export const defaultValuationPdfExportScope = valuationPdfExportScopes.find((scope) => scope.id === "all") ?? valuationPdfExportScopes[0];

export function saveValuationPdfExportPayload(
  input: ValuationPdfExportInput,
  scopeId: ValuationPdfExportScopeId = defaultValuationPdfExportScope.id,
): ValuationPdfExportPayload {
  const payload: ValuationPdfExportPayload = {
    schemaVersion: 2,
    generatedAt: new Date().toISOString(),
    scope: resolveValuationPdfExportScope(scopeId),
    input,
  };

  if (typeof window === "undefined") {
    return payload;
  }

  window.localStorage.setItem(pdfExportStorageKey, JSON.stringify(payload));

  return payload;
}

export function readValuationPdfExportPayload(): ValuationPdfExportPayload | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(pdfExportStorageKey);

    if (!raw) {
      return null;
    }

    const parsed: unknown = JSON.parse(raw);

    if (!isPdfExportPayload(parsed)) {
      return null;
    }

    return normalizeValuationPdfExportPayload(parsed);
  } catch {
    return null;
  }
}

export function resolveValuationPdfExportScope(scope: ValuationPdfExportScopeId | Partial<ValuationPdfExportScope> | null | undefined): ValuationPdfExportScope {
  const scopeId = typeof scope === "string" ? scope : scope?.id;
  return valuationPdfExportScopes.find((item) => item.id === scopeId) ?? defaultValuationPdfExportScope;
}

function normalizeValuationPdfExportPayload(value: unknown): ValuationPdfExportPayload | null {
  if (!isPdfExportPayload(value)) {
    return null;
  }

  return {
    schemaVersion: 2,
    generatedAt: value.generatedAt,
    scope: resolveValuationPdfExportScope(value.scope),
    input: value.input,
  };
}

function isPdfExportPayload(value: unknown): value is Omit<ValuationPdfExportPayload, "schemaVersion" | "scope"> & {
  schemaVersion: 1 | 2;
  scope?: Partial<ValuationPdfExportScope> | ValuationPdfExportScopeId;
} {
  if (!value || typeof value !== "object") {
    return false;
  }

  const payload = value as {
    schemaVersion?: unknown;
    generatedAt?: unknown;
    input?: unknown;
  };

  return (payload.schemaVersion === 1 || payload.schemaVersion === 2) && typeof payload.generatedAt === "string" && Boolean(payload.input);
}
