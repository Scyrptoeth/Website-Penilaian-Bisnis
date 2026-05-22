import type { AamAdjustmentModel } from "./aam-adjustments";
import type { calculateAllMethods, DcfTerminalTreatment } from "./calculations";
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
import type { FinancialStatementSnapshot } from "./types";
import type { ValidationCheck } from "./validation-checks";
import {
  defaultValuationExportScope,
  resolveValuationExportScope,
  valuationExportScopes,
  type ValuationExportScope,
  type ValuationExportScopeId,
} from "./export-scopes";

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
  activeEemReturnOnTangibleAssetBasis?: string;
  activeEemReturnOnTangibleAssetLabel?: string;
  activeEemReturnOnTangibleAssetSummary?: string;
  activeEemBasis?: string;
  activeEemBasisLabel?: string;
  activeEemBasisSummary?: string;
  activeDcfBasis?: string;
  activeDcfBasisLabel?: string;
  activeDcfBasisSummary?: string;
  activeDcfProjectionHorizonYears?: number;
  activeDcfTerminalTreatment?: DcfTerminalTreatment;
  activeDcfTerminalTreatmentLabel?: string;
  activeDcfTerminalTreatmentSummary?: string;
  activeDcfTerminalTreatmentReason?: string;
  activeDcfTerminalValue?: number;
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

export type ValuationPdfExportScopeId = ValuationExportScopeId;

export type ValuationPdfExportScope = ValuationExportScope;

export const pdfExportStorageKey = "penilaian-valuasi-bisnis.pdf-export.v1";

export const valuationPdfExportScopes: ValuationPdfExportScope[] = valuationExportScopes.map((scope) =>
  scope.id === "all" ? { ...scope, description: "Default gabungan lengkap untuk membandingkan seluruh metode penilaian dalam satu PDF." } : scope,
);

export const defaultValuationPdfExportScope =
  valuationPdfExportScopes.find((scope) => scope.id === defaultValuationExportScope.id) ?? valuationPdfExportScopes[0];

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
  const resolved = resolveValuationExportScope(scope);
  return valuationPdfExportScopes.find((item) => item.id === resolved.id) ?? defaultValuationPdfExportScope;
}

export function buildPdfExportFilename(
  taxpayerName: string,
  scopeId: ValuationPdfExportScopeId,
  exportedAt = new Date(),
): string {
  const scope = resolveValuationPdfExportScope(scopeId);
  const taxpayerSlug = slugifyFilenamePart(taxpayerName || "workbench");
  const scopeSlug = scope.id === "all" ? "aam-eem-dcf" : scope.id;
  const dateSlug = formatLocalDateSlug(exportedAt);

  return `penilaian-bisnis-${taxpayerSlug}-${scopeSlug}-${dateSlug}.pdf`;
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

function formatLocalDateSlug(value: Date): string {
  const year = String(value.getFullYear()).padStart(4, "0");
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function slugifyFilenamePart(value: string): string {
  const slug = value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "workbench";
}
