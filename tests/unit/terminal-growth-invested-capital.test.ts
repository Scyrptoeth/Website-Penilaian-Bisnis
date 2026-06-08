import assert from "node:assert/strict";
import { test } from "node:test";
import { buildInvestedCapitalGrowthRateSuggestion } from "../../src/lib/valuation/terminal-growth-invested-capital";
import type { PeriodAnalysis, SectionAnalysis } from "../../src/lib/valuation/section-analysis";

test("invested capital growth uses read-only ROIC beginning capital", () => {
  const previousSnapshot = {
    fixedAssetsNet: 400,
    currentAssets: 500,
  };
  const currentSnapshot = {
    fixedAssetsNet: 450,
    currentAssets: 540,
  };
  const currentPeriod = {
    period: { id: "2022", label: "2022", valuationDate: "2022-12-31", yearOffset: 1 },
    snapshot: currentSnapshot,
    previousSnapshot,
    investedCapitalBeginning: 700,
  } as unknown as PeriodAnalysis;
  const analysis = {
    periodAnalyses: [
      {
        period: { id: "2021", label: "2021", valuationDate: "2021-12-31", yearOffset: 0 },
        snapshot: previousSnapshot,
        previousSnapshot: null,
        investedCapitalBeginning: null,
      } as unknown as PeriodAnalysis,
      currentPeriod,
    ],
    roicRows: [
      {
        key: "invested-capital-beginning",
        label: "Invested capital awal tahun",
        source: "Model terkoreksi",
        formula: "Invested capital akhir periode sebelumnya",
        values: {
          "2021": null,
          "2022": 900,
        },
      },
    ],
  } as unknown as SectionAnalysis;

  const suggestion = buildInvestedCapitalGrowthRateSuggestion(analysis, 0.2);

  assert.ok(suggestion);
  assert.equal(suggestion.rows[0]?.totalInvestedCapitalBeginning, 900);
  assert.equal(suggestion.rows[0]?.growthRate, 0.1);
});
