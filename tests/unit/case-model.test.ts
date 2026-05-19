import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildCaseProfileDerived,
  buildFixedAssetScheduleSummary,
  buildSnapshot,
  deriveHistoricalDrivers,
  emptyAssumptions,
  emptyCaseProfile,
  getDefaultActivePeriod,
  getNextHistoricalPeriodOffset,
  mapRow,
  normalizePeriods,
  parseInputNumber,
  type FixedAssetScheduleRow,
} from "../../src/lib/valuation/case-model";
import { aamLiabilityBasis } from "../../src/lib/valuation/calculations";
import { assertAlmostEqual, basePeriods, rowFixture } from "./test-utils";

describe("case model", () => {
  it("rolls fixed asset beginning balances forward chronologically", () => {
    const scheduleRow: FixedAssetScheduleRow = {
      id: "fa1",
      assetName: "Factory equipment",
      values: {
        p0: {
          acquisitionBeginning: "100",
          acquisitionAdditions: "50",
          depreciationBeginning: "10",
          depreciationAdditions: "5",
        },
        p1: {
          acquisitionBeginning: "",
          acquisitionAdditions: "20",
          depreciationBeginning: "",
          depreciationAdditions: "8",
        },
      },
    };
    const summary = buildFixedAssetScheduleSummary(basePeriods, [scheduleRow]);

    assert.equal(summary.hasInput, true);
    assert.equal(summary.totals.p0.acquisitionEnding, 150);
    assert.equal(summary.totals.p0.depreciationEnding, 15);
    assert.equal(summary.totals.p0.netValue, 135);
    assert.equal(summary.totals.p1.acquisitionBeginning, 150);
    assert.equal(summary.totals.p1.acquisitionEnding, 170);
    assert.equal(summary.totals.p1.depreciationBeginning, 15);
    assert.equal(summary.totals.p1.depreciationEnding, 23);
    assert.equal(summary.totals.p1.netValue, 147);
  });

  it("feeds structured fixed asset net value into the active snapshot", () => {
    const scheduleRow: FixedAssetScheduleRow = {
      id: "fa1",
      assetName: "Factory equipment",
      values: {
        p0: {
          acquisitionBeginning: "100",
          acquisitionAdditions: "50",
          depreciationBeginning: "10",
          depreciationAdditions: "5",
        },
        p1: {
          acquisitionBeginning: "",
          acquisitionAdditions: "20",
          depreciationBeginning: "",
          depreciationAdditions: "8",
        },
      },
    };
    const snapshot = buildSnapshot(basePeriods, "p1", [], emptyAssumptions, [scheduleRow]);

    assert.equal(snapshot.fixedAssetsNet, 147);
    assert.equal(snapshot.totalAssets, 147);
  });

  it("keeps the AAM bank-loan basis separate from generic interest-bearing debt", () => {
    const rows = [
      rowFixture({ id: "bank-short", accountName: "Pinjaman bank jangka pendek", category: "BANK_LOAN_SHORT_TERM", values: { p1: "50" } }),
      rowFixture({ id: "bank-long", accountName: "Pinjaman bank jangka panjang", category: "BANK_LOAN_LONG_TERM", values: { p1: "300" } }),
      rowFixture({ id: "bond", accountName: "Obligasi", category: "INTEREST_BEARING_DEBT", values: { p1: "700" } }),
      rowFixture({ id: "ap", accountName: "Utang usaha", category: "ACCOUNT_PAYABLE", values: { p1: "250" } }),
    ];
    const snapshot = buildSnapshot(basePeriods, "p1", rows, emptyAssumptions);

    assert.equal(snapshot.bankLoanLongTerm, 1_000);
    assert.equal(snapshot.aamBankLoanLongTerm, 300);
    assert.equal(aamLiabilityBasis(snapshot), 350);
    assert.equal(snapshot.totalLiabilities, 1_300);
  });

  it("keeps historical periods ordered by yearOffset, not mutable labels", () => {
    const normalized = normalizePeriods([
      { id: "p1", label: "Tahun Y", valuationDate: "", yearOffset: 0 },
      { id: "p0", label: "Tahun Y-1", valuationDate: "", yearOffset: -1 },
    ]);

    assert.deepEqual(
      normalized.map((period) => period.label),
      ["Tahun Y-1", "Tahun Y"],
    );
    assert.equal(getNextHistoricalPeriodOffset(normalized), -2);
    assert.equal(getDefaultActivePeriod(normalized)?.label, "Tahun Y");
  });

  it("derives historical drivers from chronological financial rows", () => {
    const mappedRows = [
      rowFixture({ id: "revenue", statement: "income_statement", accountName: "Penjualan", category: "REVENUE", values: { p0: "100", p1: "120" } }),
      rowFixture({
        id: "cogs",
        statement: "income_statement",
        accountName: "Beban pokok",
        category: "COST_OF_GOOD_SOLD",
        values: { p0: "-40", p1: "-60" },
      }),
      rowFixture({
        id: "ga",
        statement: "income_statement",
        accountName: "Beban umum",
        category: "GENERAL_ADMINISTRATIVE_OVERHEADS",
        values: { p0: "-10", p1: "-12" },
      }),
      rowFixture({ id: "ar", accountName: "Piutang usaha", category: "ACCOUNT_RECEIVABLE", values: { p0: "20", p1: "24" } }),
      rowFixture({ id: "ap", accountName: "Utang usaha", category: "ACCOUNT_PAYABLE", values: { p0: "8", p1: "12" } }),
    ].map(mapRow);

    const drivers = deriveHistoricalDrivers([...basePeriods].reverse(), mappedRows);

    assertAlmostEqual(drivers.revenueGrowth, 0.2, 1e-12);
    assertAlmostEqual(drivers.cogsMargin, 0.45, 1e-12);
    assertAlmostEqual(drivers.gaMargin, 0.1, 1e-12);
    assertAlmostEqual(drivers.arDays, 73, 1e-12);
    assertAlmostEqual(drivers.apDays, 73, 1e-12);
  });

  it("derives depreciation margin from the fixed asset schedule when depreciation rows are absent", () => {
    const mappedRows = [
      rowFixture({ id: "revenue", statement: "income_statement", accountName: "Penjualan", category: "REVENUE", values: { p0: "100", p1: "120" } }),
    ].map(mapRow);
    const schedule = buildFixedAssetScheduleSummary(basePeriods, [
      {
        id: "fa1",
        assetName: "Factory equipment",
        values: {
          p0: {
            acquisitionBeginning: "100",
            acquisitionAdditions: "50",
            depreciationBeginning: "10",
            depreciationAdditions: "5",
          },
          p1: {
            acquisitionBeginning: "",
            acquisitionAdditions: "20",
            depreciationBeginning: "",
            depreciationAdditions: "8",
          },
        },
      },
    ]);

    const drivers = deriveHistoricalDrivers(basePeriods, mappedRows, schedule);

    assertAlmostEqual(drivers.depreciationMargin, (5 / 100 + 8 / 120) / 2, 1e-12);
  });

  it("derives initial case formulas from workbook HOME inputs", () => {
    const derived = buildCaseProfileDerived({
      ...emptyCaseProfile,
      transferType: "Modal Disetor",
      capitalBaseFull: "5.280.000.000",
      capitalBaseValued: "1.600.000.000",
      transactionYear: "2022",
    });

    assert.equal(derived.capitalBaseFullLabel, "Jumlah Modal Disetor 100%");
    assert.equal(derived.capitalBaseValuedLabel, "Jumlah Modal Disetor yang Dinilai");
    assert.equal(derived.capitalProportionStatus, "valid");
    assert.equal(derived.capitalBaseAmountStatus, "valid");
    assertAlmostEqual(derived.capitalProportion ?? 0, 1_600_000_000 / 5_280_000_000, 1e-12);
    assert.equal(derived.capitalBaseFullAmount, 5_280_000_000);
    assert.equal(derived.capitalBaseValuedAmount, 1_600_000_000);
    assert.equal(derived.cutOffDate, "2021-12-31");
    assert.equal(derived.firstProjectionEndDate, "2022-12-31");
  });

  it("switches capital labels for share-transfer input and requires share value for rupiah amounts", () => {
    const missingShareValue = buildCaseProfileDerived({
      ...emptyCaseProfile,
      transferType: "Lembar Saham",
      capitalBaseFull: "5.280",
      capitalBaseValued: "1.610",
    });

    assert.equal(missingShareValue.capitalBaseFullLabel, "Jumlah Saham Beredar 100%");
    assert.equal(missingShareValue.capitalBaseValuedLabel, "Jumlah Saham yang Dinilai");
    assert.equal(missingShareValue.capitalProportionStatus, "valid");
    assert.equal(missingShareValue.shareValuePerShareStatus, "empty");
    assert.equal(missingShareValue.capitalBaseAmountStatus, "invalid");
    assert.equal(missingShareValue.capitalBaseValuedAmount, null);

    const derived = buildCaseProfileDerived({
      ...emptyCaseProfile,
      transferType: "Lembar Saham",
      capitalBaseFull: "5.280",
      capitalBaseValued: "1.610",
      shareValuePerShare: "1.000.000",
    });

    assert.equal(derived.capitalBaseFullLabel, "Jumlah Saham Beredar 100%");
    assert.equal(derived.capitalBaseValuedLabel, "Jumlah Saham yang Dinilai");
    assert.equal(derived.capitalProportionStatus, "valid");
    assert.equal(derived.shareValuePerShareStatus, "valid");
    assert.equal(derived.capitalBaseAmountStatus, "valid");
    assertAlmostEqual(derived.capitalProportion ?? 0, 1_610 / 5_280, 1e-12);
    assert.equal(derived.capitalBaseFullAmount, 5_280_000_000);
    assert.equal(derived.capitalBaseValuedAmount, 1_610_000_000);
  });

  it("flags share-transfer proportions above 100% even when share value is valid", () => {
    const derived = buildCaseProfileDerived({
      ...emptyCaseProfile,
      transferType: "Lembar Saham",
      capitalBaseFull: "100",
      capitalBaseValued: "120",
      shareValuePerShare: "1.000",
    });

    assert.equal(derived.capitalProportionStatus, "invalid");
    assert.equal(derived.capitalBaseAmountStatus, "invalid");
  });

  it("parses Indonesian and common accounting number inputs", () => {
    assert.equal(parseInputNumber("Rp 1.250.000,50"), 1_250_000.5);
    assert.equal(parseInputNumber("(ignored)"), 0);
    assert.equal(parseInputNumber("-1.250"), -1_250);
  });
});
