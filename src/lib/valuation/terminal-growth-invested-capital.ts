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
  averageGrowth: number;
  lastYearGrowth: number;
  rows: InvestedCapitalGrowthRateRow[];
  interoperabilityTabs: string[];
  reason: string;
};

const sourceId = "invested-capital-growth-rate";
const sourceArtifact = "KKP-SAHAM-IRWAN-DJAJA.xlsx / sheet GROWTH RATE";
const interoperabilityTabs = ["Aset Tetap", "Neraca", "ROIC", "Asumsi EEM/DCF"];

export function buildInvestedCapitalGrowthRateSuggestion(
  analysis: SectionAnalysis,
  _wacc: number, // Intentionally kept for backwards compatibility but unused
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
  const averageGrowth = growthRates.reduce((sum, value) => sum + value, 0) / growthRates.length;
  const lastYearGrowth = growthRates[growthRates.length - 1];

  return {
    sourceId,
    source: "Growth Rate berbasis invested capital",
    sourceArtifact,
    averageGrowth,
    lastYearGrowth,
    rows,
    interoperabilityTabs,
    reason: buildReason(rows, averageGrowth),
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

function buildReason(
  rows: InvestedCapitalGrowthRateRow[],
  averageGrowth: number,
): string {
  const periodList = rows.map((row) => row.periodLabel).join(", ");

  return `Growth rate dihitung otomatis dari ${rows.length} periode historis (${periodList}) dengan formula Total Net Investment / Total Invested Capital Beginning. Total Net Investment mengambil net fixed assets dan current assets dari Aset Tetap/Neraca; denominator mengikuti invested capital awal dari ROIC. Average ${(averageGrowth * 100).toFixed(2)}%.`;
}