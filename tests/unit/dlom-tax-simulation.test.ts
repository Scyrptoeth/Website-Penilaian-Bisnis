import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { calculateAllMethods } from "../../src/lib/valuation/calculations";
import {
  buildSampleAssumptions,
  buildSampleCaseProfile,
  buildCaseProfileDerived,
  buildSamplePeriods,
  buildSampleRows,
  buildSnapshot,
} from "../../src/lib/valuation/case-model";
import { buildSampleDlocPfcState, calculateDlocPfc, createEmptyDlocPfcState } from "../../src/lib/valuation/dloc-pfc";
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
const dlocPfc = calculateDlocPfc(buildSampleDlocPfcState(), caseProfile);

describe("DLOM and tax simulation scenario layer", () => {
  it("reproduces the workbook DLOM score and rate for the sample case", () => {
    const dlom = calculateDlom(buildSampleDlomState(), snapshot, caseProfile);

    assert.equal(dlom.isComplete, true);
    assert.equal(dlom.companyMarketability, "DLOM Perusahaan tertutup");
    assert.equal(dlom.interestBasis, "Minoritas");
    assert.equal(dlom.rangeLabel, "30% - 50%");
    assert.equal(dlom.totalScore, 2.5);
    assertAlmostEqual(dlom.dlomRate, 0.35, 1e-12);
    assert.equal(dlom.status, "Rendah");
    assert.equal(dlom.taxpayerResistance, "Tinggi");
  });

  it("keeps DLOM incomplete when the Data Awal basis is missing", () => {
    const blankBasisDlom = calculateDlom(buildSampleDlomState(), snapshot, {
      ...caseProfile,
      companyType: "",
      shareOwnershipType: "",
    });

    assert.equal(blankBasisDlom.companyMarketability, "");
    assert.equal(blankBasisDlom.interestBasis, "");
    assert.equal(blankBasisDlom.rangeLabel, "Belum lengkap");
    assert.equal(blankBasisDlom.isComplete, false);
    assert.equal(blankBasisDlom.dlomRate, 0);
  });

  it("calculates DLOC/PFC from Data Awal and workbook questionnaire without mutating base valuation", () => {
    assert.equal(dlocPfc.isComplete, true);
    assert.equal(dlocPfc.adjustmentType, "DLOC");
    assert.equal(dlocPfc.rangeLabel, "30% - 70%");
    assert.equal(dlocPfc.totalScore, 0.5);
    assertAlmostEqual(dlocPfc.unsignedRate, 0.34, 1e-12);
    assertAlmostEqual(dlocPfc.signedRate, 0.34, 1e-12);
    assert.equal(dlocPfc.status, "Rendah");
    assert.equal(dlocPfc.taxpayerResistance, "Tinggi");
  });

  it("switches DLOC/PFC to negative PFC for majority ownership so the tax layer increases value", () => {
    const majorityCaseProfile = { ...caseProfile, shareOwnershipType: "Mayoritas" };
    const majorityPfc = calculateDlocPfc(buildSampleDlocPfcState(), majorityCaseProfile);
    const dlom = calculateDlom(buildSampleDlomState(), snapshot, majorityCaseProfile);
    const simulation = calculateTaxSimulation({
      methods: [methods.aam],
      dlom,
      dlocPfc: majorityPfc,
      state: buildSampleTaxSimulationState(),
      caseProfile: majorityCaseProfile,
      caseProfileDerived,
      snapshot,
    });
    const aam = simulation.rows[0];

    assert.equal(majorityPfc.adjustmentType, "PFC");
    assertAlmostEqual(majorityPfc.signedRate, -0.34, 1e-12);
    assert.ok(aam.dlocPfcAdjustment > 0);
    assert.ok(aam.marketValueOfEquity100 > aam.valueAfterDlom);
  });

  it("keeps base method values clean while tax simulation applies DLOM after method comparison", () => {
    const dlom = calculateDlom(buildSampleDlomState(), snapshot, caseProfile);
    const simulation = calculateTaxSimulation({
      methods: [methods.aam, methods.eem, methods.dcf],
      dlom,
      dlocPfc,
      state: buildSampleTaxSimulationState(),
      caseProfile,
      caseProfileDerived,
      snapshot,
    });
    const aam = simulation.rows.find((row) => row.method === "AAM");

    assert.ok(aam);
    assert.equal(simulation.primaryMethod, "AAM");
    assertAlmostEqual(aam.baseEquityValue, methods.aam.equityValue, 0.01);
    assertAlmostEqual(aam.dlomRate, 0.35, 1e-12);
    assertAlmostEqual(aam.valueAfterDlom, methods.aam.equityValue * (1 - dlom.dlomRate), 0.01);
    assertAlmostEqual(aam.dlocPfcRate, 0.34, 1e-12);
    assertAlmostEqual(aam.dlocPfcAdjustment, -(methods.aam.equityValue * (1 - dlom.dlomRate) * 0.34), 0.01);
    assertAlmostEqual(aam.sharePercentage, 1_600_000_000 / 5_280_000_000, 1e-12);
    assertAlmostEqual(aam.marketValueOfTransferredInterest, methods.aam.equityValue * (1 - dlom.dlomRate) * (1 - 0.34) * aam.sharePercentage, 0.01);
    assert.ok(aam.potentialTaxableDifference > 0);
    assert.ok(aam.potentialTax > 0);
    assert.equal(methods.aam.traces.some((trace) => trace.note.includes("DLOM/DLOC tidak diterapkan")), true);
  });

  it("warns instead of silently finalizing blank-case tax simulation", () => {
    const dlom = calculateDlom(createEmptyDlomState(), snapshot, caseProfile);
    const simulation = calculateTaxSimulation({
      methods: [methods.aam, methods.eem, methods.dcf],
      dlom,
      dlocPfc: calculateDlocPfc(createEmptyDlocPfcState(), caseProfile),
      state: createEmptyTaxSimulationState(),
      caseProfile: { ...caseProfile, capitalBaseFull: "", capitalBaseValued: "" },
      caseProfileDerived: buildCaseProfileDerived({ ...caseProfile, capitalBaseFull: "", capitalBaseValued: "" }),
      snapshot,
    });

    assert.equal(simulation.primaryRow, null);
    assert.ok(simulation.warnings.some((warning) => warning.includes("Primary Method belum dipilih")));
    assert.ok(simulation.warnings.some((warning) => warning.includes("Persentase saham")));
  });

  it("requires a complete DLOC/PFC questionnaire or a reasoned override before applying the tax layer", () => {
    const dlom = calculateDlom(createEmptyDlomState(), snapshot, caseProfile);
    const incompleteDlocPfc = calculateDlocPfc(createEmptyDlocPfcState(), caseProfile);
    const simulation = calculateTaxSimulation({
      methods: [methods.aam],
      dlom,
      dlocPfc: incompleteDlocPfc,
      state: { ...createEmptyTaxSimulationState(), applyDlocPfc: true, primaryMethod: "AAM" },
      caseProfile,
      caseProfileDerived,
      snapshot,
    });
    const overrideSimulation = calculateTaxSimulation({
      methods: [methods.aam],
      dlom,
      dlocPfc: incompleteDlocPfc,
      state: {
        ...createEmptyTaxSimulationState(),
        applyDlocPfc: true,
        useDlocPfcOverride: true,
        dlocPfcRate: "0,2",
        dlocPfcOverrideReason: "Reviewer benchmark adjustment",
        primaryMethod: "AAM",
      },
      caseProfile,
      caseProfileDerived,
      snapshot,
    });

    assert.equal(simulation.rows[0].dlocPfcRate, 0);
    assert.ok(simulation.warnings.some((warning) => warning.includes("questionnaire DLOC/PFC belum lengkap")));
    assertAlmostEqual(overrideSimulation.rows[0].dlocPfcRate, 0.2, 1e-12);
    assert.equal(overrideSimulation.warnings.some((warning) => warning.includes("override")), false);
  });
});
