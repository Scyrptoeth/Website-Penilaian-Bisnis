import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildTerminalGrowthSuggestion,
  getSectorFinancialEvidence,
  listSectorFinancialEvidence,
} from "../../src/lib/valuation/terminal-growth-suggestions";
import { assertAlmostEqual } from "./test-utils";

describe("terminal growth suggestions", () => {
  it("builds a conservative sector-calibrated band for weaker profitability sectors", () => {
    const suggestion = buildTerminalGrowthSuggestion({
      sector: "Consumer Cyclicals",
      revenue: 16_663_916_100,
      netProfit: 1_838_106_527,
      wacc: 0.11463062037189403,
      existingDownside: -0.06200163015727912,
      existingUpside: 0.03,
    });

    assert.ok(suggestion);
    assert.equal(suggestion.quality, "cautious");
    assert.equal(suggestion.confidence, "high");
    assertAlmostEqual(suggestion.baseGrowth, 0, 1e-12);
    assertAlmostEqual(suggestion.downsideGrowth, -0.06200163015727912, 1e-12);
    assertAlmostEqual(suggestion.upsideGrowth, 0.03, 1e-12);
    assert.match(suggestion.reason, /Bukti sektor Consumer Cyclicals/);
  });

  it("allows a modest positive base for strong sector evidence while keeping growth below WACC", () => {
    const suggestion = buildTerminalGrowthSuggestion({
      sector: "Energy",
      revenue: 2_000_000_000_000,
      netProfit: 150_000_000_000,
      wacc: 0.025,
    });

    assert.ok(suggestion);
    assert.equal(suggestion.quality, "strong");
    assertAlmostEqual(suggestion.baseGrowth, 0.01, 1e-12);
    assertAlmostEqual(suggestion.upsideGrowth, 0.02, 1e-12);
    assert.ok(suggestion.upsideGrowth < 0.025);
  });

  it("returns no suggestion until a supported IDX sector is available", () => {
    assert.equal(buildTerminalGrowthSuggestion({ sector: "", revenue: 0, netProfit: 0, wacc: 0 }), null);
    assert.equal(getSectorFinancialEvidence("Unknown Sector"), null);
    assert.equal(listSectorFinancialEvidence().length, 11);
  });
});
