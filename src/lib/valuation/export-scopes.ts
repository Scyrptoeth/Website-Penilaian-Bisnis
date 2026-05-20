import { resolveAccountLabels } from "./account-labels";
import type { MappedRow } from "./case-model";
import type { ValuationMethod } from "./types";

export type ValuationExportScopeId = "aam" | "eem" | "dcf" | "all";

export type ValuationExportScope = {
  id: ValuationExportScopeId;
  label: string;
  title: string;
  methods: ValuationMethod[];
  description: string;
};

export const valuationExportScopes: ValuationExportScope[] = [
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
    description: "Default gabungan lengkap untuk membandingkan seluruh metode penilaian dalam satu export.",
  },
];

export const defaultValuationExportScope = valuationExportScopes.find((scope) => scope.id === "all") ?? valuationExportScopes[0];

export function resolveValuationExportScope(
  scope: ValuationExportScopeId | Partial<ValuationExportScope> | null | undefined,
): ValuationExportScope {
  const scopeId = typeof scope === "string" ? scope : scope?.id;
  return valuationExportScopes.find((item) => item.id === scopeId) ?? defaultValuationExportScope;
}

export function filterMappedRowsByValuationScope(rows: MappedRow[], scope: ValuationExportScope): MappedRow[] {
  if (scope.id === "all") {
    return rows;
  }

  return rows.filter((item) => isMappedRowRelevantToMethods(item, scope.methods));
}

export function isMappedRowRelevantToMethods(item: MappedRow, methods: ValuationMethod[]): boolean {
  const labels = new Set(resolveAccountLabels(item.row.statement, item.effectiveCategory, item.row.labelOverrides));

  return methods.some((method) => {
    if (method === "AAM") {
      return labels.has("formula:aam") || item.row.statement === "fixed_asset";
    }

    if (method === "EEM") {
      return (
        labels.has("formula:eem") ||
        labels.has("formula:nta") ||
        labels.has("formula:noplat") ||
        labels.has("formula:excess-earnings") ||
        labels.has("treatment:working-capital") ||
        labels.has("treatment:non-operating") ||
        labels.has("treatment:debt-like")
      );
    }

    return (
      labels.has("formula:dcf") ||
      labels.has("formula:fcff") ||
      labels.has("formula:noplat") ||
      labels.has("formula:fixed-asset") ||
      labels.has("treatment:working-capital") ||
      labels.has("treatment:non-operating") ||
      labels.has("treatment:debt-like") ||
      labels.has("fs:cash")
    );
  });
}
