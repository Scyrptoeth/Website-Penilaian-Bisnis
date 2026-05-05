import type {
  FixedAssetComputedRow,
  FixedAssetPeriodAmounts,
  FixedAssetScheduleSummary,
  Period,
} from "./case-model";
import { getChronologicalPeriods } from "./case-model";
import type { DcfForecastRow } from "./types";

export const fixedAssetProjectionClassLabels = [
  "Land (Tanah Lahan Sawit + Tanah Lahan Sawit (TA))",
  "Building (Bangunan Mess/Barak + Bangunan Mess/Barak (TA) + Lapangan + Kantor)",
  "Equipment, Laboratory, & Machinery (Sarana & Prasarana)",
  "Vehicle & Heavy Equipment (Alat Berat + Kendaraan)",
  "Office Inventory (Inventaris Tanaman Sawit + Inventaris Tanaman Sawit (TA))",
  "Electrical",
];

export type FixedAssetProjectionMode = "workbook-formula" | "dcf-proxy";

export type FixedAssetProjectionDiagnostic = {
  code: "negative-net-value" | "zero-additions";
  severity: "info" | "warning";
  message: string;
};

export type FixedAssetProjectionReconciliation = {
  capitalExpenditureDelta: number;
  depreciationDelta: number;
  netValueDelta: number;
  dcfCapitalExpenditure: number;
  dcfDepreciation: number;
  dcfNetValue: number;
};

export type FixedAssetProjectionRow = {
  assetName: string;
  amounts: Record<number, FixedAssetPeriodAmounts>;
  capexWeight: number;
  depreciationWeight: number;
  acquisitionAdditionsGrowthRate: number;
  depreciationAdditionsGrowthRate: number;
  hasHistoricalBasis: boolean;
};

export type FixedAssetProjectionSummary = {
  mode: FixedAssetProjectionMode;
  rows: FixedAssetProjectionRow[];
  totals: Record<number, FixedAssetPeriodAmounts>;
  hasProjection: boolean;
  source: string;
  note: string;
  diagnostics: FixedAssetProjectionDiagnostic[];
  reconciliation: Record<number, FixedAssetProjectionReconciliation>;
  fallback?: FixedAssetProjectionScenario;
};

export type FixedAssetProjectionOptions = {
  preferredMode?: FixedAssetProjectionMode;
};

type ProjectionBasisRow = {
  assetName: string;
  activeAmounts: FixedAssetPeriodAmounts;
  historicalAmounts: FixedAssetPeriodAmounts[];
  hasHistoricalBasis: boolean;
};

export type FixedAssetProjectionScenario = {
  mode: FixedAssetProjectionMode;
  rows: FixedAssetProjectionRow[];
  totals: Record<number, FixedAssetPeriodAmounts>;
  hasProjection: boolean;
  source: string;
  note: string;
  diagnostics: FixedAssetProjectionDiagnostic[];
};

const emptyAmounts: FixedAssetPeriodAmounts = {
  acquisitionBeginning: 0,
  acquisitionAdditions: 0,
  acquisitionEnding: 0,
  depreciationBeginning: 0,
  depreciationAdditions: 0,
  depreciationEnding: 0,
  netValue: 0,
};

export function buildFixedAssetProjection(
  forecast: DcfForecastRow[],
  periods: Period[],
  activePeriodId: string,
  schedule: FixedAssetScheduleSummary,
  options: FixedAssetProjectionOptions = {},
): FixedAssetProjectionSummary {
  const rows = buildProjectionBasisRows(periods, activePeriodId, schedule);
  const hasProjection = schedule.hasInput && rows.some((row) => row.hasHistoricalBasis);

  if (!hasProjection) {
    return {
      mode: "workbook-formula",
      rows: rows.map((row) => ({
        assetName: row.assetName,
        amounts: {},
        capexWeight: 0,
        depreciationWeight: 0,
        acquisitionAdditionsGrowthRate: 0,
        depreciationAdditionsGrowthRate: 0,
        hasHistoricalBasis: row.hasHistoricalBasis,
      })),
      totals: {},
      hasProjection: false,
      source: "Perlu input",
      note: "Butuh jadwal aset tetap historis agar roll-forward per kelas aset dapat dihitung.",
      diagnostics: [],
      reconciliation: {},
    };
  }

  const workbookFormula = buildWorkbookFormulaProjection(forecast, rows);
  const dcfProxy = buildDcfProxyProjection(forecast, rows);
  const primary = options.preferredMode === "dcf-proxy" ? dcfProxy : workbookFormula;
  const fallback = primary.mode === "workbook-formula" ? dcfProxy : workbookFormula;
  const reconciliation = buildProjectionReconciliation(forecast, primary, dcfProxy);

  return {
    ...primary,
    diagnostics: primary.diagnostics,
    reconciliation,
    fallback,
  };
}

function buildDcfProxyProjection(forecast: DcfForecastRow[], rows: ProjectionBasisRow[]): FixedAssetProjectionScenario {
  const depreciationWeights = normalizeWeights(rows, (row) => row.activeAmounts.depreciationAdditions);
  const fallbackDepreciationWeights =
    depreciationWeights ?? normalizeWeights(rows, (row) => row.activeAmounts.depreciationEnding);
  const capexWeights =
    fallbackDepreciationWeights ??
    normalizeWeights(rows, (row) => row.activeAmounts.netValue) ??
    normalizeWeights(rows, (row) => row.activeAmounts.acquisitionEnding) ??
    equalWeights(rows.length);
  const resolvedDepreciationWeights = fallbackDepreciationWeights ?? capexWeights;
  const projectedRows: FixedAssetProjectionRow[] = rows.map((row, rowIndex) => {
    const amounts: Record<number, FixedAssetPeriodAmounts> = {};
    let priorAcquisitionEnding = row.activeAmounts.acquisitionEnding;
    let priorDepreciationEnding = row.activeAmounts.depreciationEnding;

    forecast.forEach((forecastRow) => {
      const acquisitionBeginning = priorAcquisitionEnding;
      const acquisitionAdditions = forecastRow.capitalExpenditure * capexWeights[rowIndex];
      const acquisitionEnding = acquisitionBeginning + acquisitionAdditions;
      const depreciationBeginning = priorDepreciationEnding;
      const depreciationAdditions = forecastRow.depreciation * resolvedDepreciationWeights[rowIndex];
      const depreciationEnding = depreciationBeginning + depreciationAdditions;
      const netValue = acquisitionEnding - depreciationEnding;

      amounts[forecastRow.year] = {
        acquisitionBeginning,
        acquisitionAdditions,
        acquisitionEnding,
        depreciationBeginning,
        depreciationAdditions,
        depreciationEnding,
        netValue,
      };

      priorAcquisitionEnding = acquisitionEnding;
      priorDepreciationEnding = depreciationEnding;
    });

    return {
      assetName: row.assetName,
      amounts,
      capexWeight: capexWeights[rowIndex],
      depreciationWeight: resolvedDepreciationWeights[rowIndex],
      hasHistoricalBasis: row.hasHistoricalBasis,
      acquisitionAdditionsGrowthRate: 0,
      depreciationAdditionsGrowthRate: 0,
    };
  });

  return {
    mode: "dcf-proxy",
    rows: projectedRows,
    totals: buildProjectionTotals(forecast, projectedRows),
    hasProjection: true,
    source: "Jadwal Aset Tetap + alokasi DCF",
    note: "Beginning mengikuti ending tahun sebelumnya; additions dan penyusutan dialokasikan dari total engine DCF berdasarkan bobot penyusutan historis.",
    diagnostics: [],
  };
}

function buildWorkbookFormulaProjection(forecast: DcfForecastRow[], rows: ProjectionBasisRow[]): FixedAssetProjectionScenario {
  const capexWeights =
    normalizeWeights(rows, (row) => row.activeAmounts.acquisitionAdditions) ??
    normalizeWeights(rows, (row) => row.activeAmounts.netValue) ??
    normalizeWeights(rows, (row) => row.activeAmounts.acquisitionEnding) ??
    equalWeights(rows.length);
  const depreciationWeights =
    normalizeWeights(rows, (row) => row.activeAmounts.depreciationAdditions) ??
    normalizeWeights(rows, (row) => row.activeAmounts.depreciationEnding) ??
    equalWeights(rows.length);
  const projectedRows: FixedAssetProjectionRow[] = rows.map((row, rowIndex) => {
    const amounts: Record<number, FixedAssetPeriodAmounts> = {};
    const acquisitionAdditionsGrowthRate = resolveHistoricalGrowthRate(row.historicalAmounts, "acquisitionAdditions");
    const depreciationAdditionsGrowthRate = resolveHistoricalGrowthRate(row.historicalAmounts, "depreciationAdditions");
    let priorAcquisitionEnding = row.activeAmounts.acquisitionEnding;
    let priorAcquisitionAdditions = row.activeAmounts.acquisitionAdditions;
    let priorDepreciationEnding = row.activeAmounts.depreciationEnding;
    let priorDepreciationAdditions = row.activeAmounts.depreciationAdditions;

    forecast.forEach((forecastRow) => {
      const acquisitionBeginning = priorAcquisitionEnding;
      const acquisitionAdditions = priorAcquisitionAdditions * (1 + acquisitionAdditionsGrowthRate);
      const acquisitionEnding = acquisitionBeginning + acquisitionAdditions;
      const depreciationBeginning = priorDepreciationEnding;
      const depreciationAdditions = priorDepreciationAdditions * (1 + depreciationAdditionsGrowthRate);
      const depreciationEnding = depreciationBeginning + depreciationAdditions;
      const netValue = acquisitionEnding - depreciationEnding;

      amounts[forecastRow.year] = {
        acquisitionBeginning,
        acquisitionAdditions,
        acquisitionEnding,
        depreciationBeginning,
        depreciationAdditions,
        depreciationEnding,
        netValue,
      };

      priorAcquisitionEnding = acquisitionEnding;
      priorAcquisitionAdditions = acquisitionAdditions;
      priorDepreciationEnding = depreciationEnding;
      priorDepreciationAdditions = depreciationAdditions;
    });

    return {
      assetName: row.assetName,
      amounts,
      capexWeight: capexWeights[rowIndex],
      depreciationWeight: depreciationWeights[rowIndex],
      acquisitionAdditionsGrowthRate,
      depreciationAdditionsGrowthRate,
      hasHistoricalBasis: row.hasHistoricalBasis,
    };
  });
  const totals = buildProjectionTotals(forecast, projectedRows);

  return {
    mode: "workbook-formula",
    rows: projectedRows,
    totals,
    hasProjection: true,
    source: "Formula KKP UPDATE.xlsx",
    note: "Beginning mengikuti ending tahun sebelumnya; additions dan penyusutan mengikuti tren historis jadwal aset tetap seperti PROY FIXED ASSETS workbook UPDATE, dengan guard atas tren outlier.",
    diagnostics: buildWorkbookFormulaDiagnostics(forecast, projectedRows, totals),
  };
}

function buildProjectionBasisRows(
  periods: Period[],
  activePeriodId: string,
  schedule: FixedAssetScheduleSummary,
): ProjectionBasisRow[] {
  const chronologicalPeriods = getChronologicalPeriods(periods);
  const activePeriod = periods.find((period) => period.id === activePeriodId) ?? chronologicalPeriods.at(-1);
  const activeId = activePeriod?.id ?? activePeriodId;
  const activeIndex = Math.max(
    0,
    chronologicalPeriods.findIndex((period) => period.id === activeId),
  );
  const historicalPeriods = chronologicalPeriods.slice(0, activeIndex + 1);
  const rowsByLabel = new Map<string, FixedAssetComputedRow>();
  const usedLabels = new Set<string>();

  schedule.rows.forEach((row) => {
    rowsByLabel.set(normalizeAssetLabel(row.row.assetName), row);
  });

  const templateRows = fixedAssetProjectionClassLabels.map((assetName) => {
    const normalized = normalizeAssetLabel(assetName);
    const row = rowsByLabel.get(normalized);
    usedLabels.add(normalized);

    return {
      assetName,
      activeAmounts: row?.amounts[activeId] ?? emptyAmounts,
      historicalAmounts: row ? historicalPeriods.map((period) => row.amounts[period.id] ?? emptyAmounts) : [],
      hasHistoricalBasis: Boolean(row),
    };
  });

  const extraRows = schedule.rows
    .filter((row) => !usedLabels.has(normalizeAssetLabel(row.row.assetName)))
    .map((row) => ({
      assetName: row.row.assetName || "Kelas aset lain",
      activeAmounts: row.amounts[activeId] ?? emptyAmounts,
      historicalAmounts: historicalPeriods.map((period) => row.amounts[period.id] ?? emptyAmounts),
      hasHistoricalBasis: true,
    }));

  return [...templateRows, ...extraRows];
}

function buildProjectionTotals(
  forecast: DcfForecastRow[],
  rows: FixedAssetProjectionRow[],
): Record<number, FixedAssetPeriodAmounts> {
  return Object.fromEntries(
    forecast.map((forecastRow) => {
      const total = rows.reduce(
        (sum, row) => addAmounts(sum, row.amounts[forecastRow.year] ?? emptyAmounts),
        { ...emptyAmounts },
      );

      return [forecastRow.year, total];
    }),
  );
}

function addAmounts(first: FixedAssetPeriodAmounts, second: FixedAssetPeriodAmounts): FixedAssetPeriodAmounts {
  return {
    acquisitionBeginning: first.acquisitionBeginning + second.acquisitionBeginning,
    acquisitionAdditions: first.acquisitionAdditions + second.acquisitionAdditions,
    acquisitionEnding: first.acquisitionEnding + second.acquisitionEnding,
    depreciationBeginning: first.depreciationBeginning + second.depreciationBeginning,
    depreciationAdditions: first.depreciationAdditions + second.depreciationAdditions,
    depreciationEnding: first.depreciationEnding + second.depreciationEnding,
    netValue: first.netValue + second.netValue,
  };
}

function normalizeWeights(rows: ProjectionBasisRow[], getValue: (row: ProjectionBasisRow) => number): number[] | null {
  const bases = rows.map((row) => positive(getValue(row)));
  const total = bases.reduce((sum, value) => sum + value, 0);

  if (total <= 0) {
    return null;
  }

  return bases.map((value) => value / total);
}

function resolveHistoricalGrowthRate(
  historicalAmounts: FixedAssetPeriodAmounts[],
  key: "acquisitionAdditions" | "depreciationAdditions",
): number {
  const growthRates = historicalAmounts
    .slice(1)
    .map((amounts, index) => {
      const previousValue = historicalAmounts[index]?.[key] ?? 0;
      const currentValue = amounts[key];

      if (!Number.isFinite(previousValue) || previousValue === 0 || !Number.isFinite(currentValue)) {
        return 0;
      }

      return currentValue / previousValue - 1;
    });

  if (growthRates.length === 0) {
    return 0;
  }

  const averageGrowth = growthRates.reduce((sum, value) => sum + value, 0) / growthRates.length;
  const latestGrowth = growthRates.at(-1) ?? averageGrowth;

  if (Math.abs(averageGrowth) > 1 && Math.abs(latestGrowth) <= 1) {
    return latestGrowth;
  }

  return Number.isFinite(averageGrowth) ? averageGrowth : 0;
}

function buildProjectionReconciliation(
  forecast: DcfForecastRow[],
  primary: FixedAssetProjectionScenario,
  dcfProxy: FixedAssetProjectionScenario,
): Record<number, FixedAssetProjectionReconciliation> {
  return Object.fromEntries(
    forecast.map((forecastRow) => {
      const primaryTotal = primary.totals[forecastRow.year] ?? emptyAmounts;
      const dcfTotal = dcfProxy.totals[forecastRow.year] ?? emptyAmounts;

      return [
        forecastRow.year,
        {
          capitalExpenditureDelta: primaryTotal.acquisitionAdditions - dcfTotal.acquisitionAdditions,
          depreciationDelta: primaryTotal.depreciationAdditions - dcfTotal.depreciationAdditions,
          netValueDelta: primaryTotal.netValue - dcfTotal.netValue,
          dcfCapitalExpenditure: dcfTotal.acquisitionAdditions,
          dcfDepreciation: dcfTotal.depreciationAdditions,
          dcfNetValue: dcfTotal.netValue,
        },
      ];
    }),
  );
}

function buildWorkbookFormulaDiagnostics(
  forecast: DcfForecastRow[],
  rows: FixedAssetProjectionRow[],
  totals: Record<number, FixedAssetPeriodAmounts>,
): FixedAssetProjectionDiagnostic[] {
  const diagnostics: FixedAssetProjectionDiagnostic[] = [];
  const negativeRows = rows
    .flatMap((row) =>
      forecast
        .filter((forecastRow) => (row.amounts[forecastRow.year]?.netValue ?? 0) < 0)
        .map((forecastRow) => `${row.assetName} ${forecastRow.year}`),
    )
    .slice(0, 3);

  if (negativeRows.length > 0) {
    diagnostics.push({
      code: "negative-net-value",
      severity: "warning",
      message: `Nilai buku neto negatif terdeteksi pada ${negativeRows.join(", ")}; reviewer perlu menilai umur manfaat, disposal, atau cap depresiasi.`,
    });
  }

  if (forecast.length > 0 && forecast.every((forecastRow) => Math.abs(totals[forecastRow.year]?.acquisitionAdditions ?? 0) < 1)) {
    diagnostics.push({
      code: "zero-additions",
      severity: "info",
      message: "Formula workbook menghasilkan additions nol karena additions periode aktif nol; mode DCF proxy tetap tersedia sebagai baseline maintenance capex.",
    });
  }

  return diagnostics;
}

function equalWeights(length: number): number[] {
  if (length <= 0) {
    return [];
  }

  return Array.from({ length }, () => 1 / length);
}

function positive(value: number): number {
  return Number.isFinite(value) && value > 0 ? value : 0;
}

function normalizeAssetLabel(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}
