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

export type FixedAssetProjectionRow = {
  assetName: string;
  amounts: Record<number, FixedAssetPeriodAmounts>;
  capexWeight: number;
  depreciationWeight: number;
  hasHistoricalBasis: boolean;
};

export type FixedAssetProjectionSummary = {
  rows: FixedAssetProjectionRow[];
  totals: Record<number, FixedAssetPeriodAmounts>;
  hasProjection: boolean;
  source: string;
  note: string;
};

type ProjectionBasisRow = {
  assetName: string;
  activeAmounts: FixedAssetPeriodAmounts;
  hasHistoricalBasis: boolean;
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
): FixedAssetProjectionSummary {
  const rows = buildProjectionBasisRows(periods, activePeriodId, schedule);
  const hasProjection = schedule.hasInput && rows.some((row) => row.hasHistoricalBasis);

  if (!hasProjection) {
    return {
      rows: rows.map((row) => ({
        assetName: row.assetName,
        amounts: {},
        capexWeight: 0,
        depreciationWeight: 0,
        hasHistoricalBasis: row.hasHistoricalBasis,
      })),
      totals: {},
      hasProjection: false,
      source: "Perlu input",
      note: "Butuh jadwal aset tetap historis agar roll-forward per kelas aset dapat dihitung.",
    };
  }

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
    };
  });

  return {
    rows: projectedRows,
    totals: buildProjectionTotals(forecast, projectedRows),
    hasProjection: true,
    source: "Jadwal Aset Tetap + alokasi DCF",
    note: "Beginning mengikuti ending tahun sebelumnya; additions dan penyusutan dialokasikan dari total engine DCF berdasarkan bobot penyusutan historis.",
  };
}

function buildProjectionBasisRows(
  periods: Period[],
  activePeriodId: string,
  schedule: FixedAssetScheduleSummary,
): ProjectionBasisRow[] {
  const activePeriod = periods.find((period) => period.id === activePeriodId) ?? getChronologicalPeriods(periods).at(-1);
  const activeId = activePeriod?.id ?? activePeriodId;
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
      hasHistoricalBasis: Boolean(row),
    };
  });

  const extraRows = schedule.rows
    .filter((row) => !usedLabels.has(normalizeAssetLabel(row.row.assetName)))
    .map((row) => ({
      assetName: row.row.assetName || "Kelas aset lain",
      activeAmounts: row.amounts[activeId] ?? emptyAmounts,
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
