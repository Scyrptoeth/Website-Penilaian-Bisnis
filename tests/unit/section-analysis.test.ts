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

  it("builds detailed cash-flow statement rows with workbook trace metadata", () => {
    const cfo = analysis.cashFlowStatementRows.find((row) => row.key === "cfo");
    const equityInjection = analysis.cashFlowStatementRows.find((row) => row.key === "equity-injection");

    assert.ok(cfo);
    assert.ok(equityInjection);
    assert.equal(cfo.workbookReference, "CFS!11");
    assert.equal(equityInjection.isOverridable, true);
    assert.equal(equityInjection.workbookReference, "CFS!22; BALANCE SHEET!42,43");
    assert.equal(equityInjection.values.p2021, -3_150_000_000);
  });

  it("applies cash-flow overrides only when audit reason is present and recomputes final subtotals", () => {
    const withoutReason = buildSectionAnalysis(periods, rows, assumptions, [], {
      "non-operating-income": {
        p2021: { value: "100.000.000", reason: "", updatedAt: "2026-05-05T00:00:00.000Z" },
      },
    });
    const pendingNonOperating = withoutReason.cashFlowStatementRows.find((row) => row.key === "non-operating-income");

    assert.ok(pendingNonOperating);
    assert.equal(pendingNonOperating.overrideStatuses.p2021, "reason_required");
    assert.equal(pendingNonOperating.values.p2021, pendingNonOperating.calculatedValues.p2021);

    const withReason = buildSectionAnalysis(periods, rows, assumptions, [], {
      "non-operating-income": {
        p2021: { value: "100.000.000", reason: "Management cash-flow ledger support", updatedAt: "2026-05-05T00:00:00.000Z" },
      },
    });
    const appliedNonOperating = withReason.cashFlowStatementRows.find((row) => row.key === "non-operating-income");
    const beforeFinancing = withReason.cashFlowStatementRows.find((row) => row.key === "cash-flow-before-financing");

    assert.ok(appliedNonOperating);
    assert.ok(beforeFinancing);
    assert.equal(appliedNonOperating.overrideStatuses.p2021, "applied");
    assert.equal(appliedNonOperating.values.p2021, 100_000_000);
    assert.equal(
      beforeFinancing.values.p2021,
      Number(withReason.cashFlowStatementRows.find((row) => row.key === "cfo")?.values.p2021) + 100_000_000 + Number(withReason.cashFlowStatementRows.find((row) => row.key === "capex")?.values.p2021),
    );
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
