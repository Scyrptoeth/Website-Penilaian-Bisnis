import type { PeriodAnalysis, SectionAnalysis } from "./section-analysis";

export type InvestedCapitalGrowthRateRow = {
  periodId: string;
  periodLabel: string;
  netFixedAssetsEnd: number;
  netCurrentAssetsEnd: number;
  netFixedAssetsBeginning: number;
  netCurrentAssetsBeginning: number;
  totalNetInvestment: number;
  totalInvestedCapitalBeginning: number;
  growthRate: number;
};

export type InvestedCapitalGrowthRateSuggestion = {
  sourceId: string;
  source: string;
  sourceArtifact: string;
  baseGrowth: number;
  downsideGrowth: number;
  upsideGrowth: number;
  rawAverageGrowth: number;
  rows: InvestedCapitalGrowthRateRow[];
  interoperabilityTabs: string[];
  reason: string;
  cappedByWacc: boolean;
};

const sourceId = "invested-capital-growth-rate";
const sourceArtifact = "KKP-SAHAM-IRWAN-DJAJA.xlsx / sheet GROWTH RATE";
const interoperabilityTabs = ["Aset Tetap", "Neraca", "ROIC", "Asumsi EEM/DCF"];

export function buildInvestedCapitalGrowthRateSuggestion(
  analysis: SectionAnalysis,
  wacc: number,
): InvestedCapitalGrowthRateSuggestion | null {
  const roicInvestedCapitalBeginningValues =
    analysis.roicRows.find((row) => row.key === "invested-capital-beginning")?.values ?? {};
  const rows = analysis.periodAnalyses
    .map((item) => buildGrowthRateRow(item, roicInvestedCapitalBeginningValues[item.period.id] ?? null))
    .filter((row): row is InvestedCapitalGrowthRateRow => Boolean(row));

  if (rows.length === 0) {
    return null;
  }

  const growthRates = rows.map((row) => row.growthRate);
  const rawAverageGrowth = growthRates.reduce((sum, value) => sum + value, 0) / growthRates.length;
  const baseGrowth = capTerminalGrowthBelowWacc(rawAverageGrowth, wacc);
  const downsideGrowth = Math.min(baseGrowth, Math.min(...growthRates));
  const upsideGrowth = Math.max(baseGrowth, capTerminalGrowthBelowWacc(Math.max(...growthRates), wacc));
  const cappedByWacc = Math.abs(baseGrowth - rawAverageGrowth) > 1e-10 || Math.max(...growthRates) !== upsideGrowth;

  return {
    sourceId,
    source: "Growth Rate berbasis invested capital",
    sourceArtifact,
    baseGrowth,
    downsideGrowth,
    upsideGrowth,
    rawAverageGrowth,
    rows,
    interoperabilityTabs,
    cappedByWacc,
    reason: buildReason(rows, rawAverageGrowth, baseGrowth, cappedByWacc),
  };
}

function buildGrowthRateRow(item: PeriodAnalysis, investedCapitalBeginning: number | null): InvestedCapitalGrowthRateRow | null {
  if (!item.previousSnapshot) {
    return null;
  }

  if (!investedCapitalBeginning || investedCapitalBeginning === 0) {
    return null;
  }

  const netFixedAssetsEnd = item.snapshot.fixedAssetsNet;
  const netCurrentAssetsEnd = item.snapshot.currentAssets;
  const netFixedAssetsBeginning = item.previousSnapshot.fixedAssetsNet;
  const netCurrentAssetsBeginning = item.previousSnapshot.currentAssets;
  const totalNetInvestment =
    netFixedAssetsEnd +
    netCurrentAssetsEnd -
    netFixedAssetsBeginning -
    netCurrentAssetsBeginning;
  const growthRate = totalNetInvestment / investedCapitalBeginning;

  if (!Number.isFinite(growthRate)) {
    return null;
  }

  return {
    periodId: item.period.id,
    periodLabel: item.period.label,
    netFixedAssetsEnd,
    netCurrentAssetsEnd,
    netFixedAssetsBeginning,
    netCurrentAssetsBeginning,
    totalNetInvestment,
    totalInvestedCapitalBeginning: investedCapitalBeginning,
    growthRate,
  };
}

function capTerminalGrowthBelowWacc(value: number, wacc: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  if (!Number.isFinite(wacc) || wacc <= 0 || value < wacc) {
    return value;
  }

  return Math.max(Math.min(wacc - 0.005, value), -0.2);
}

function buildReason(
  rows: InvestedCapitalGrowthRateRow[],
  rawAverageGrowth: number,
  baseGrowth: number,
  cappedByWacc: boolean,
): string {
  const periodList = rows.map((row) => row.periodLabel).join(", ");
  const capNote = cappedByWacc
    ? " Nilai aktif dibatasi agar tetap lebih rendah dari WACC."
    : "";

  return `Growth rate dihitung otomatis dari ${rows.length} periode historis (${periodList}) dengan formula Total Net Investment / Total Invested Capital Beginning. Total Net Investment mengambil net fixed assets dan current assets dari Aset Tetap/Neraca; denominator mengikuti invested capital awal dari ROIC. Average mentah ${(rawAverageGrowth * 100).toFixed(2)}%, base growth aktif ${(baseGrowth * 100).toFixed(2)}%.${capNote}`;
}
