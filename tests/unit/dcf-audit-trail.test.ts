import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { calculateDcf, normalizedNoplat } from "../../src/lib/valuation/calculations";
import { buildDcfAuditTrail } from "../../src/lib/valuation/dcf-audit-trail";
import { buildSampleAssumptions, buildSamplePeriods, buildSampleRows, buildSnapshot } from "../../src/lib/valuation/case-model";
import { assertAlmostEqual } from "./test-utils";

const periods = buildSamplePeriods();
const rows = buildSampleRows();
const assumptions = buildSampleAssumptions();
const snapshot = buildSnapshot(periods, "p2021", rows, assumptions);
const dcf = calculateDcf(snapshot);

describe("DCF audit trail", () => {
  it("builds workbook-referenced DCF rows from calculated engine values", () => {
    const historical = {
      periodLabel: "2021 (Y)",
      year: 2021,
      depreciation: 125,
      currentAssetMovement: -45,
      currentLiabilityMovement: 20,
      capitalExpenditures: -80,
    };
    const trail = buildDcfAuditTrail({
      snapshot,
      dcf,
      historical,
      terminalGrowth: snapshot.terminalGrowth,
      wacc: snapshot.wacc,
      includeWorkingCapitalChange: true,
    });
    const freeCashFlow = getRow(trail, "dcf-free-cash-flow");
    const discountFactor = getRow(trail, "dcf-discount-factor");
    const explicitPv = getBridgeRow(trail, "dcf-total-explicit-pv");
    const terminalValue = getBridgeRow(trail, "dcf-terminal-value");
    const expectedHistoricalFcf =
      normalizedNoplat(snapshot) +
      historical.depreciation +
      historical.currentAssetMovement +
      historical.currentLiabilityMovement +
      historical.capitalExpenditures;
    const expectedTerminalValue =
      (dcf.forecast.at(-1)?.freeCashFlow ?? 0) *
      (1 + snapshot.terminalGrowth) /
      (snapshot.wacc - snapshot.terminalGrowth);

    assert.equal(trail.periods.length, 6);
    assert.equal(trail.periods[0].includedInExplicitPv, false);
    assert.equal(trail.periods[1].includedInExplicitPv, true);
    assert.equal(freeCashFlow.workbookReference, "DCF!C20:H20");
    assert.ok(freeCashFlow.sourceTabs.includes("Proyeksi Cash Flow Statement"));
    assert.ok(freeCashFlow.accountCategories.includes("WORKING_CAPITAL"));
    assertAlmostEqual(freeCashFlow.values[0] ?? 0, expectedHistoricalFcf, 1e-9);
    assertAlmostEqual(freeCashFlow.values[1] ?? 0, dcf.forecast[0].freeCashFlow, 1e-9);
    assert.equal(discountFactor.valueFormat, "factor");
    assertAlmostEqual(explicitPv.value, dcf.forecast.reduce((sum, row) => sum + row.presentValue, 0), 1e-9);
    assertAlmostEqual(terminalValue.value, expectedTerminalValue, 1e-6);
  });

  it("keeps no-incremental-working-capital scenario trace at zero WC movement", () => {
    const noWcDcf = calculateDcf(snapshot, { includeWorkingCapitalChange: false });
    const trail = buildDcfAuditTrail({
      snapshot,
      dcf: noWcDcf,
      historical: {
        periodLabel: "2021 (Y)",
        year: 2021,
        depreciation: 125,
        currentAssetMovement: -45,
        currentLiabilityMovement: 20,
        capitalExpenditures: -80,
      },
      terminalGrowth: snapshot.terminalGrowth,
      wacc: snapshot.wacc,
      includeWorkingCapitalChange: false,
    });
    const currentAssetMovement = getRow(trail, "dcf-current-asset-movement");
    const currentLiabilityMovement = getRow(trail, "dcf-current-liability-movement");
    const totalWorkingCapital = getRow(trail, "dcf-total-net-wc");

    assert.deepEqual(currentAssetMovement.values, [0, 0, 0, 0, 0, 0]);
    assert.deepEqual(currentLiabilityMovement.values, [0, 0, 0, 0, 0, 0]);
    assert.deepEqual(totalWorkingCapital.values, [0, 0, 0, 0, 0, 0]);
    assert.match(totalWorkingCapital.note, /mengecualikan incremental working capital/);
  });
});

function getRow(trail: ReturnType<typeof buildDcfAuditTrail>, id: string) {
  const row = trail.rows.find((item) => item.id === id);
  assert.ok(row);
  return row;
}

function getBridgeRow(trail: ReturnType<typeof buildDcfAuditTrail>, id: string) {
  const row = trail.bridgeRows.find((item) => item.id === id);
  assert.ok(row);
  return row;
}
