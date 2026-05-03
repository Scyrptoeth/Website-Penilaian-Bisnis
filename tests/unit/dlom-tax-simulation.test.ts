import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { calculateAllMethods } from "../../src/lib/valuation/calculations";
import {
  buildSampleAssumptions,
  buildSampleCaseProfile,
  buildSamplePeriods,
  buildSampleRows,
  buildCaseProfileDerived,
  buildSnapshot,
} from "../../src/lib/valuation/case-model";
import { buildSampleDlomState, calculateDlom, createEmptyDlomState } from "../../src/lib/valuation/dlom";
import {
  buildSampleTaxSimulationState,
  calculateTaxSimulation,
  createEmptyTaxSimulationState,
} from "../../src/lib/valuation/tax-simulation";
import { assertAlmostEqual } from "./test-utils";

const periods = buildSamplePeriods();
const rows = buildSampleRows();
const assumptions = buildSampleAssumptions();
const caseProfile = buildSampleCaseProfile();
const caseProfileDerived = buildCaseProfileDerived(caseProfile);
const snapshot = buildSnapshot(periods, "p2021", rows, assumptions);
const methods = calculateAllMethods(snapshot);

describe("DLOM and tax simulation scenario layer", () => {
  it("reproduces the workbook DLOM score and rate for the sample case", () => {
    const dlom = calculateDlom(buildSampleDlomState(), snapshot);

    assert.equal(dlom.isComplete, true);
    assert.equal(dlom.rangeLabel, "20% - 40%");
    assert.equal(dlom.totalScore, 2.5);
    assertAlmostEqual(dlom.dlomRate, 0.25, 1e-12);
    assert.equal(dlom.status, "Rendah");
    assert.equal(dlom.taxpayerResistance, "Tinggi");
  });

  it("keeps base method values clean while tax simulation applies DLOM after method comparison", () => {
    const dlom = calculateDlom(buildSampleDlomState(), snapshot);
    const simulation = calculateTaxSimulation({
      methods: [methods.aam, methods.eem, methods.dcf],
      dlom,
      state: buildSampleTaxSimulationState(),
      caseProfile,
      caseProfileDerived,
      snapshot,
    });
    const aam = simulation.rows.find((row) => row.method === "AAM");

    assert.ok(aam);
    assert.equal(simulation.primaryMethod, "AAM");
    assertAlmostEqual(aam.baseEquityValue, methods.aam.equityValue, 0.01);
    assertAlmostEqual(aam.dlomRate, 0.25, 1e-12);
    assertAlmostEqual(aam.valueAfterDlom, methods.aam.equityValue * 0.75, 0.01);
    assertAlmostEqual(aam.sharePercentage, 1_600_000_000 / 5_280_000_000, 1e-12);
    assertAlmostEqual(aam.marketValueOfTransferredInterest, methods.aam.equityValue * 0.75 * aam.sharePercentage, 0.01);
    assert.ok(aam.potentialTaxableDifference > 0);
    assert.ok(aam.potentialTax > 0);
    assert.equal(methods.aam.traces.some((trace) => trace.note.includes("DLOM/DLOC tidak diterapkan")), true);
  });

  it("warns instead of silently finalizing blank-case tax simulation", () => {
    const dlom = calculateDlom(createEmptyDlomState(), snapshot);
    const simulation = calculateTaxSimulation({
      methods: [methods.aam, methods.eem, methods.dcf],
      dlom,
      state: createEmptyTaxSimulationState(),
      caseProfile: { ...caseProfile, capitalBaseFull: "", capitalBaseValued: "" },
      caseProfileDerived: buildCaseProfileDerived({ ...caseProfile, capitalBaseFull: "", capitalBaseValued: "" }),
      snapshot,
    });

    assert.equal(simulation.primaryRow, null);
    assert.ok(simulation.warnings.some((warning) => warning.includes("Primary Method belum dipilih")));
    assert.ok(simulation.warnings.some((warning) => warning.includes("Persentase saham")));
  });
});
