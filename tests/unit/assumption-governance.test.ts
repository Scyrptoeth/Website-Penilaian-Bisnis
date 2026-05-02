import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildAssumptionGovernance } from "../../src/lib/valuation/assumption-governance";
import { calculateAllMethods } from "../../src/lib/valuation/calculations";
import { sampleCase } from "../../src/lib/valuation/sample-case";
import type { RequiredReturnOnNtaCalculation, WaccCalculation } from "../../src/lib/valuation/assumption-calculators";

describe("assumption governance", () => {
  it("flags high-risk smart suggestions before users treat them as base case", () => {
    const snapshot = {
      ...sampleCase,
      wacc: 0.05365648,
      terminalGrowth: 0.005,
      revenueGrowth: 0.33603105,
      requiredReturnOnNta: 0.05365648,
    };
    const results = calculateAllMethods(snapshot);
    const waccCalculation: WaccCalculation = {
      wacc: 0.05365648,
      beta: 0.141653,
      costOfEquity: 0.05307603,
      preTaxCostOfDebt: 0.085,
      afterTaxCostOfDebt: 0.0663,
      debtWeight: 0.04389393,
      equityWeight: 0.95610607,
      ratingBasedDefaultSpread: 0.01619665,
      countryRiskAdjustment: -0.01619665,
    };
    const requiredReturnCalculation: RequiredReturnOnNtaCalculation = {
      tangibleAssetBase: 16_202_412_505,
      debtCapacity: 711_187_565,
      debtWeight: 0.04389393,
      equityWeight: 0.95610607,
      requiredReturn: 0.05365648,
      basis: "wacc_capital_structure",
      basisLabel: "WACC capital structure fallback",
    };

    const governance = buildAssumptionGovernance({
      snapshot,
      waccCalculation,
      requiredReturnCalculation,
      dcfTraces: results.dcf.traces,
      hasRevenueGrowthOverride: false,
    });

    assert.equal(governance.level, "critical");
    assert.ok(governance.criticalCount >= 5);
    assert.ok(governance.items.some((item) => item.id === "wacc-low"));
    assert.ok(governance.items.some((item) => item.id === "auto-revenue-growth"));
    assert.ok(governance.items.some((item) => item.id === "terminal-weight"));
    assert.ok(governance.items.some((item) => item.id === "nta-return-fallback"));
  });

  it("clears initial thresholds for the workbook-style governed sample assumptions", () => {
    const results = calculateAllMethods(sampleCase);
    const waccCalculation: WaccCalculation = {
      wacc: sampleCase.wacc,
      beta: 1.09,
      costOfEquity: 0.124537,
      preTaxCostOfDebt: 0.088,
      afterTaxCostOfDebt: 0.06864,
      debtWeight: 0.17722560473918053,
      equityWeight: 0.8227743952608195,
      ratingBasedDefaultSpread: 0.0207,
      countryRiskAdjustment: -0.0207,
    };
    const requiredReturnCalculation: RequiredReturnOnNtaCalculation = {
      tangibleAssetBase: 16_202_412_505,
      debtCapacity: 11_420_005_286.8,
      debtWeight: 0.704822999733908,
      equityWeight: 0.295177000266092,
      requiredReturn: sampleCase.requiredReturnOnNta,
      basis: "capacity_evidence",
      basisLabel: "Capacity evidence",
    };

    const governance = buildAssumptionGovernance({
      snapshot: sampleCase,
      waccCalculation,
      requiredReturnCalculation,
      dcfTraces: results.dcf.traces,
      hasRevenueGrowthOverride: true,
    });

    assert.equal(governance.level, "ok");
    assert.equal(governance.criticalCount, 0);
    assert.equal(governance.items[0].id, "governance-clear");
  });
});
