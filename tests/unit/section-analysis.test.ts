import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { normalizedNoplat } from "../../src/lib/valuation/calculations";
import { buildSampleAssumptions, buildSamplePeriods, buildSampleRows, buildSnapshot } from "../../src/lib/valuation/case-model";
import { buildSectionAnalysis } from "../../src/lib/valuation/section-analysis";
import { assertAlmostEqual } from "./test-utils";

const periods = buildSamplePeriods();
const rows = buildSampleRows();
const assumptions = buildSampleAssumptions();
const analysis = buildSectionAnalysis(periods, rows, assumptions);
const snapshot = buildSnapshot(periods, "p2021", rows, assumptions);

describe("section analysis", () => {
  it("builds corrected NOPLAT rows from commercial EBIT and statutory tax", () => {
    const noplat = analysis.noplatRows.find((row) => row.key === "noplat");

    assert.ok(noplat);
    assertAlmostEqual(Number(noplat.values.p2021), normalizedNoplat(snapshot), 0.01);
    assert.equal(analysis.noplatRows.find((row) => row.key === "tax-shields-excluded")?.values.p2021, 0);
  });

  it("builds FCF from NOPLAT, depreciation, operating WC movement, and capex", () => {
    const periodAnalysis = analysis.periodAnalyses.find((item) => item.period.id === "p2021");
    const fcf = analysis.fcfRows.find((row) => row.key === "fcf");

    assert.ok(periodAnalysis);
    assert.ok(fcf);
    assertAlmostEqual(Number(fcf.values.p2021), periodAnalysis.freeCashFlow, 0.01);
    assert.equal(fcf.values.p2019, null);
  });

  it("keeps payables and cash-flow movement formula-derived instead of workbook-ending-balance driven", () => {
    const shortTermDebtEnding = analysis.payablesRows.find((row) => row.key === "short-ending");
    const equityInjectionMovement = analysis.cashFlowRows.find((row) => row.key === "equity-injection");

    assert.ok(shortTermDebtEnding);
    assert.ok(equityInjectionMovement);
    assert.equal(shortTermDebtEnding.values.p2021, 0);
    assert.equal(equityInjectionMovement.values.p2021, -3_150_000_000);
  });

  it("computes ROIC from NOPLAT over beginning corrected invested capital", () => {
    const roic = analysis.roicRows.find((row) => row.key === "roic");
    const periodAnalysis = analysis.periodAnalyses.find((item) => item.period.id === "p2021");

    assert.ok(roic);
    assert.ok(periodAnalysis);
    assert.equal(roic.values.p2019, null);
    assertAlmostEqual(Number(roic.values.p2021), periodAnalysis.roic ?? 0, 1e-12);
  });
});
