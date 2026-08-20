import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { calculateDlocPfc, createEmptyDlocPfcState, isMajorityShareOwnership } from "../../src/lib/valuation/dloc-pfc";
import { calculateTaxSimulation, createEmptyTaxSimulationState } from "../../src/lib/valuation/tax-simulation";
import type { CaseProfile } from "../../src/lib/valuation/case-model";

const baseCaseProfile: CaseProfile = {
  objectTaxpayerName: "PT Test",
  objectBusinessKlu: "",
  objectTaxpayerNpwp: "",
  companySector: "",
  companyType: "Tertutup",
  subjectTaxpayerName: "Subjek Test",
  subjectTaxpayerNpwp: "",
  subjectTaxpayerType: "Badan",
  shareOwnershipType: "Minoritas",
  transferType: "Modal Disetor",
  capitalBaseFull: "1000000000",
  capitalBaseValued: "1000000000",
  shareValuePerShare: "",
  transactionYear: "2025",
  valuationObject: "",
};

describe("isMajorityShareOwnership", () => {
  it("returns true for Mayoritas", () => {
    assert.equal(isMajorityShareOwnership("Mayoritas"), true);
  });

  it("returns false for Minoritas", () => {
    assert.equal(isMajorityShareOwnership("Minoritas"), false);
  });

  it("returns false for empty string", () => {
    assert.equal(isMajorityShareOwnership(""), false);
  });
});

describe("calculateDlocPfc with Mayoritas", () => {
  it("bypasses PFC: isComplete=false, signedRate=0", () => {
    const state = createEmptyDlocPfcState();
    const profile: CaseProfile = { ...baseCaseProfile, shareOwnershipType: "Mayoritas" };
    const result = calculateDlocPfc(state, profile);

    assert.equal(result.isComplete, false);
    assert.equal(Object.is(result.signedRate, 0) || Object.is(result.signedRate, -0), true);
    assert.equal(Object.is(result.adjustmentMultiplier, 0) || Object.is(result.adjustmentMultiplier, -0), true);
    assert.equal(result.status, "Belum lengkap");
    assert.equal(result.taxpayerResistance, "Belum lengkap");
  });

  it("trace notes explain the bypass", () => {
    const state = createEmptyDlocPfcState();
    const profile: CaseProfile = { ...baseCaseProfile, shareOwnershipType: "Mayoritas" };
    const result = calculateDlocPfc(state, profile);

    const jenisTrace = result.traces.find((t) => t.label === "Jenis DLOC/PFC");
    assert.ok(jenisTrace?.note.includes("Saham Mayoritas"));
    assert.ok(jenisTrace?.note.includes("PFC tidak diperhitungkan"));
  });
});

describe("calculateDlocPfc with Minoritas (existing behavior preserved)", () => {
  it("computes DLOC normally when complete", () => {
    const state = createEmptyDlocPfcState();
    state.factors.shareholderAgreement.answer = "Ada";
    state.factors.minorityShareholderLoss.answer = "Rendah";
    state.factors.controllingShareholderAction.answer = "Rendah";
    state.factors.managementAppointment.answer = "Tidak Ada";
    state.factors.operationalControl.answer = "Tidak";

    const profile: CaseProfile = { ...baseCaseProfile, shareOwnershipType: "Minoritas" };
    const result = calculateDlocPfc(state, profile);

    assert.equal(result.adjustmentType, "DLOC");
    assert.equal(result.isComplete, true);
    assert.ok(result.signedRate > 0);
  });
});

describe("calculateTaxSimulation with Mayoritas", () => {
  it("excludes PFC from warnings and uses 0% DLOC/PFC rate", () => {
    const profile: CaseProfile = { ...baseCaseProfile, shareOwnershipType: "Mayoritas" };
    const dlocPfc = calculateDlocPfc(createEmptyDlocPfcState(), profile);
    const dlom = {
      companyMarketability: "Tertutup",
      interestBasis: "Minoritas",
      dlomRate: 0.2,
      status: "Rendah",
      taxpayerResistance: "Rendah",
      isComplete: true,
      factors: [],
      traces: [],
      rangeLabel: "20% - 35%",
      rangeMin: 0.2,
      rangeMax: 0.35,
      rangeSpread: 0.15,
      totalScore: 0,
      maxScore: 5,
      unsignedRate: 0.2,
      adjustmentMultiplier: 0,
    } as unknown as import("../../src/lib/valuation/dlom").DlomCalculation;
    const state = createEmptyTaxSimulationState();
    state.primaryMethod = "AAM";

    const result = calculateTaxSimulation({
      methods: [{ method: "AAM", equityValue: 1000000000, traces: [] }],
      dlom,
      dlocPfc,
      state,
      caseProfile: profile,
      caseProfileDerived: {
        capitalProportionStatus: "valid",
        capitalProportion: 1,
        capitalBaseValuedAmount: 1000000000,
        cutOffDate: "2024-12-31",
        isShareTransfer: false,
        shareValuePerShareStatus: "invalid",
        capitalBaseAmountStatus: "valid",
        capitalBaseFullAmount: 1000000000,
        capitalBaseFullAmountLabel: "",
        capitalBaseValuedAmountLabel: "",
        capitalProportionLabel: "",
        firstProjectionEndDate: "",
      } as unknown as import("../../src/lib/valuation/case-model").CaseProfileDerived,
      snapshot: {} as unknown as import("../../src/lib/valuation/types").FinancialStatementSnapshot,
    });

    // No DLOC/PFC warning for Mayoritas
    const dlocWarning = result.warnings.find((w) => w.includes("DLOC/PFC"));
    assert.equal(dlocWarning, undefined);

    // DLOC/PFC rate should be 0
    const aamRow = result.rows.find((r) => r.method === "AAM");
    assert.equal(aamRow?.dlocPfcRate, 0);
    assert.equal(Math.abs(aamRow?.dlocPfcAdjustment ?? 0), 0);
    assert.equal(aamRow?.marketValueOfEquity100, aamRow?.valueAfterDlom);
  });

  it("scenario DLOC/PFC input is ignored for Mayoritas", () => {
    const profile: CaseProfile = { ...baseCaseProfile, shareOwnershipType: "Mayoritas" };
    const dlocPfc = calculateDlocPfc(createEmptyDlocPfcState(), profile);
    const dlom = {
      companyMarketability: "Tertutup",
      interestBasis: "Minoritas",
      dlomRate: 0.2,
      status: "Rendah",
      taxpayerResistance: "Rendah",
      isComplete: true,
      factors: [],
      traces: [],
      rangeLabel: "20% - 35%",
      rangeMin: 0.2,
      rangeMax: 0.35,
      rangeSpread: 0.15,
      totalScore: 0,
      maxScore: 5,
      unsignedRate: 0.2,
      adjustmentMultiplier: 0,
    } as unknown as import("../../src/lib/valuation/dlom").DlomCalculation;
    const state = createEmptyTaxSimulationState();
    state.primaryMethod = "AAM";
    state.finalBasis = "manualScenario";
    state.scenarioDlocPfcRate = "0.15"; // Should be ignored

    const result = calculateTaxSimulation({
      methods: [{ method: "AAM", equityValue: 1000000000, traces: [] }],
      dlom,
      dlocPfc,
      state,
      caseProfile: profile,
      caseProfileDerived: {
        capitalProportionStatus: "valid",
        capitalProportion: 1,
        capitalBaseValuedAmount: 1000000000,
        cutOffDate: "2024-12-31",
        isShareTransfer: false,
        shareValuePerShareStatus: "invalid",
        capitalBaseAmountStatus: "valid",
        capitalBaseFullAmount: 1000000000,
        capitalBaseFullAmountLabel: "",
        capitalBaseValuedAmountLabel: "",
        capitalProportionLabel: "",
        firstProjectionEndDate: "",
      } as unknown as import("../../src/lib/valuation/case-model").CaseProfileDerived,
      snapshot: {} as unknown as import("../../src/lib/valuation/types").FinancialStatementSnapshot,
    });

    const scenarioRow = result.scenarioRows.find((r) => r.method === "AAM");
    assert.equal(scenarioRow?.dlocPfcRate, 0);
    assert.ok(scenarioRow?.dlocPfcSource.includes("Mayoritas"));
  });

  it("overall resistance follows DLOM only for Mayoritas", () => {
    const profile: CaseProfile = { ...baseCaseProfile, shareOwnershipType: "Mayoritas" };
    const dlocPfc = calculateDlocPfc(createEmptyDlocPfcState(), profile);
    const dlom = {
      companyMarketability: "Tertutup",
      interestBasis: "Minoritas",
      dlomRate: 0.2,
      status: "Rendah",
      taxpayerResistance: "Tinggi",
      isComplete: true,
      factors: [],
      traces: [],
      rangeLabel: "20% - 35%",
      rangeMin: 0.2,
      rangeMax: 0.35,
      rangeSpread: 0.15,
      totalScore: 0,
      maxScore: 5,
      unsignedRate: 0.2,
      adjustmentMultiplier: 0,
    } as unknown as import("../../src/lib/valuation/dlom").DlomCalculation;
    const state = createEmptyTaxSimulationState();
    state.primaryMethod = "AAM";

    const result = calculateTaxSimulation({
      methods: [{ method: "AAM", equityValue: 1000000000, traces: [] }],
      dlom,
      dlocPfc,
      state,
      caseProfile: profile,
      caseProfileDerived: {
        capitalProportionStatus: "valid",
        capitalProportion: 1,
        capitalBaseValuedAmount: 1000000000,
        cutOffDate: "2024-12-31",
        isShareTransfer: false,
        shareValuePerShareStatus: "invalid",
        capitalBaseAmountStatus: "valid",
        capitalBaseFullAmount: 1000000000,
        capitalBaseFullAmountLabel: "",
        capitalBaseValuedAmountLabel: "",
        capitalProportionLabel: "",
        firstProjectionEndDate: "",
      } as unknown as import("../../src/lib/valuation/case-model").CaseProfileDerived,
      snapshot: {} as unknown as import("../../src/lib/valuation/types").FinancialStatementSnapshot,
    });

    assert.equal(result.overallResistance, "Tinggi");
  });
});
