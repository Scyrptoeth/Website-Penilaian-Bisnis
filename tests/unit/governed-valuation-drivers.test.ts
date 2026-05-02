import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { calculateAllMethods } from "../../src/lib/valuation/calculations";
import {
  buildSampleAssumptions,
  buildSamplePeriods,
  buildSampleRows,
  buildSnapshot,
  deriveHistoricalDrivers,
  mapRow,
  type AccountRow,
  type FixedAssetScheduleRow,
  type StatementType,
} from "../../src/lib/valuation/case-model";
import { sampleCase } from "../../src/lib/valuation/sample-case";
import type { AccountCategory } from "../../src/lib/valuation/types";
import { assertAlmostEqual } from "./test-utils";

const correctedTargets = {
  aam: 13_701_055_249,
  eem: 19_886_438_291,
  dcf: 34_009_467_930,
};

describe("governed valuation drivers", () => {
  it("normalizes high-risk smart suggestions before they become base EEM/DCF outputs", () => {
    const snapshot = buildSnapshot(browserStatePeriods, "p1", buildBrowserStateRows(), buildHighRiskSmartSuggestionAssumptions(), buildBrowserStateFixedAssetRows());
    const results = calculateAllMethods(snapshot);

    assertWithinSpread(results.aam.equityValue, correctedTargets.aam, 0.01);
    assertWithinSpread(results.eem.equityValue, correctedTargets.eem, 0.2);
    assertWithinSpread(results.dcf.equityValue, correctedTargets.dcf, 0.2);

    assert.ok(snapshot.wacc >= 0.08);
    assert.equal(snapshot.terminalGrowth, 0);
    assertAlmostEqual(snapshot.revenueGrowth, 0.22185417359762538, 1e-12);
    assert.ok(snapshot.requiredReturnOnNta > 0.08);
  });

  it("uses the lowest non-negative historical growth observation when CAGR is too high for an unreviewed auto-driver", () => {
    const drivers = deriveHistoricalDrivers(buildSamplePeriods(), buildSampleRows().map(mapRow));

    assertAlmostEqual(drivers.revenueGrowth, 0.3360310497701928, 1e-12);
    assertAlmostEqual(drivers.governedRevenueGrowth, 0.22185417359762538, 1e-12);
  });

  it("preserves explicit workbook-methodology overrides without re-governing them", () => {
    const snapshot = buildSnapshot(buildSamplePeriods(), "p2021", buildSampleRows(), buildSampleAssumptions());
    const results = calculateAllMethods(snapshot);

    assertAlmostEqual(snapshot.wacc, sampleCase.wacc, 1e-8);
    assertAlmostEqual(snapshot.terminalGrowth, sampleCase.terminalGrowth, 1e-12);
    assertAlmostEqual(snapshot.revenueGrowth, sampleCase.revenueGrowth, 1e-8);
    assertAlmostEqual(snapshot.requiredReturnOnNta, sampleCase.requiredReturnOnNta, 1e-8);
    assertWithinSpread(results.aam.equityValue, correctedTargets.aam, 0.01);
    assertWithinSpread(results.eem.equityValue, correctedTargets.eem, 0.01);
    assertWithinSpread(results.dcf.equityValue, correctedTargets.dcf, 0.01);
  });
});

const browserStatePeriods = [
  { id: "py2-1777681791752", label: "2019", valuationDate: "", yearOffset: -2 },
  { id: "py1-1777681784335", label: "2020", valuationDate: "", yearOffset: -1 },
  { id: "p1", label: "2021", valuationDate: "2021-12-31", yearOffset: 0 },
];

function buildBrowserStateRows(): AccountRow[] {
  return [
    row("balance_sheet", "Cash on Hands (Kas + Kas)", "", ["44.887.819", "151.468.119", "717.848.795"]),
    row("balance_sheet", "Cash on Bank (Bank Danomon A/C 006600669813 + Deposito Bank Danamon)", "", ["374.140.018", "572.440.850", "337.031.731"]),
    row("balance_sheet", "Account Receivable (Piutang Dagang)", "", ["248.591.028", "675.378.320", "191.055.111"]),
    row("balance_sheet", "Other Receivable (Piutang Karyawan)", "", ["38.700.000", "18.000.000", "21.000.000"]),
    row("balance_sheet", "Inventory", "", ["0", "0", "0"]),
    row("balance_sheet", "Others", "CURRENT_ASSET", ["0", "0", "0"]),
    row("balance_sheet", "Non Current Assets", "NON_CURRENT_ASSET", ["0", "0", "0"]),
    row("balance_sheet", "Intangible Assets", "", ["0", "0", "0"]),
    row("balance_sheet", "Bank Loan-Short Term", "", ["0", "0", "0"]),
    row("balance_sheet", "Account Payables (Hutang Dagang)", "", ["1.349.091.893", "722.586.680", "1.823.364.600"]),
    row("balance_sheet", "Tax Payable (Hutang PPh Pasal 29 + Hutang PPh Pasal 25 + Hutang PPh Pasal 21 + Hutang PPN + PPN dan PPh 29)", "", [
      "99.403.988",
      "250.347.400",
      "678.518.254",
    ]),
    row("balance_sheet", "Others (Hutang Gaji Karyawan)", "OTHER_PAYABLE", ["397.739.810", "295.472.920", "1.075.354.928"]),
    row("balance_sheet", "Bank Loan-Long Term", "", ["0", "0", "0"]),
    row("balance_sheet", "Related Party acc. Payable & Employee Benefits", "NON_CURRENT_LIABILITIES", ["0", "0", "0"]),
    row("balance_sheet", "Paid Up Capital (Modal Disetor)", "", ["5.280.000.000", "5.280.000.000", "5.280.000.000"]),
    row("balance_sheet", "Addition (Uang Muka Setoran Modal)", "PENAMBAHAN_MODAL_DISETOR", ["3.550.000.000", "3.150.000.000", "0"]),
    row("balance_sheet", "Surplus (Laba di Tahan (TA) + Laba Ditahan Tahun Lalu - Deviden)", "RETAINED_EARNINGS_SURPLUS", [
      "7.374.691.251",
      "7.994.294.936",
      "6.698.715.227",
    ]),
    row("balance_sheet", "Current Profit - Commercial NPAT (Laba Bersih Komersial)", "RETAINED_EARNINGS_CURRENT_PROFIT", [
      "440.745.074",
      "754.862.153",
      "1.838.106.527",
    ]),
    row("income_statement", "Revenue (Penjualan)", "REVENUE", ["9.335.637.236", "11.406.787.320", "16.663.916.100"]),
    row("income_statement", "Cost of Good Sold (Pupuk + Obat-Obatan + Ongkos Angkut Pembelian TBS + Langsir & Muat TBS + Gaji Pegawai Bag. Lapangan + Keperluan Lapangan + Bibit Sawit)", "", [
      "-6.880.608.086",
      "-7.565.752.910",
      "-10.779.658.214",
    ]),
    row("income_statement", "Others", "OPERATING_EXPENSE", ["0", "0", "0"]),
    row("income_statement", "General & Administrative Overheads (Iuran & Retribusi + BBM + STNK & Pajak Kendaraan + Spare Parts Kendaraan + Perjalanan Dinas + Pem. & Perawatan Sarana & Prasarana + Gaji Pegawai Bag. Administrasi + Adm. Bank + Rek. Listrik + Keperluan Kantor + STP + PBB + Pemeliharaan Mess + Notaris)", "", [
      "-1.420.583.785",
      "-1.809.878.908",
      "-2.641.095.104",
    ]),
    row("income_statement", "Interest Income (Pendapatan Jasa Giro + Pendapatan Bagi Hasil (Bank) + Pendapatan Bunga Deposito)", "", [
      "81.394.069",
      "11.803.933",
      "13.957.341",
    ]),
    row("income_statement", "Interest Expense (Beban Jasa Giro + Beban Lain-Lain)", "INTEREST_EXPENSE", ["-16.278.814", "-1.361.128", "-942.033"]),
    row("income_statement", "Non Operating Income (Pendapatan Lain-Lain - Beban Lain-Lain)", "", ["0", "0", "-212.875"]),
    row("income_statement", "Corporate Tax", "", ["-305.333.971", "-165.937.126", "-436.128.347"]),
  ];
}

function buildBrowserStateFixedAssetRows(): FixedAssetScheduleRow[] {
  return [
    fixedAssetRow("Office Inventory (Inventaris Tanaman Sawit + Inventaris Tanaman Sawit (TA))", [
      ["3.720.800.000", "6.424.709.610", "754.572.077", "96.535.873"],
      ["", "0", "", "887.557.596"],
      ["10.145.509.610", "0", "1.738.665.546", "776.612.890"],
    ]),
    fixedAssetRow("Vehicle & Heavy Equipment (Alat Berat + Kendaraan)", [
      ["1.785.472.728", "275.000.000", "1.433.114.708", "204.862.713"],
      ["", "147.500.000", "", "188.370.924"],
      ["2.207.972.728", "0", "1.826.348.345", "158.340.567"],
    ]),
    fixedAssetRow("Equipment, Laboratory, & Machinery (Sarana & Prasarana)", [
      ["176.449.500", "0", "141.871.766", "13.163.777"],
      ["", "0", "", "10.861.752"],
      ["176.449.500", "0", "165.897.295", "10.552.203"],
    ]),
    fixedAssetRow("Building (Bangunan Mess/Barak + Bangunan Mess/Barak (TA) + Lapangan + Kantor)", [
      ["541.512.951", "110.000.000", "203.967.215", "38.919.212"],
      ["", "2.175.000", "", "34.008.756"],
      ["653.687.951", "0", "276.895.183", "36.224.681"],
    ]),
    fixedAssetRow("Land (Tanah Lahan Sawit + Tanah Lahan Sawit (TA))", [
      ["4.451.763.925", "3.365.510.390", "0", "0"],
      ["", "0", "", "0"],
      ["7.817.274.315", "0", "0", "0"],
    ]),
  ];
}

function buildHighRiskSmartSuggestionAssumptions() {
  return {
    ...buildSampleAssumptions(),
    terminalGrowth: "0,005",
    terminalGrowthSource: "sector-terminal-growth-basic-materials",
    revenueGrowth: "",
    wacc: "",
    waccSource: "market-suggestion-2021",
    waccRiskFreeRate: "0,0606",
    waccBeta: "",
    waccEquityRiskPremium: "0,06122466",
    waccRatingBasedDefaultSpread: "0,01619665",
    waccCountryRiskPremium: "-0,01619665",
    waccSpecificRiskPremium: "0",
    waccPreTaxCostOfDebt: "0,085",
    waccDebtWeight: "",
    waccEquityWeight: "",
    waccDebtMarketValue: "3.577.237.782",
    waccEquityMarketValue: "13.816.821.754",
    waccComparable1Name: "Indal Aluminium Industry Tbk. (Data Pembanding Bersifat Ideal)",
    waccComparable1BetaLevered: "0,261",
    waccComparable1MarketCap: "117.849.604.096",
    waccComparable1Debt: "739.453.566.976",
    waccComparable2Name: "ESSA Industries Indonesia Tbk. (Data Pembanding Bersifat Moderat)",
    waccComparable2BetaLevered: "0,084",
    waccComparable2MarketCap: "14.987.468.734.464",
    waccComparable2Debt: "179.264",
    waccComparable3Name: "Tembaga Mulia Semanan Tbk. (Data Pembanding Bersifat Moderat)",
    waccComparable3BetaLevered: "0,282",
    waccComparable3MarketCap: "1.002.838.228.992",
    waccComparable3Debt: "56.569.300",
    requiredReturnOnNta: "",
    requiredReturnOnNtaSource: "",
    requiredReturnReceivablesCapacity: "",
    requiredReturnInventoryCapacity: "",
    requiredReturnFixedAssetCapacity: "",
    requiredReturnAdditionalCapacity: "",
    requiredReturnAfterTaxDebtCost: "0,0663",
    requiredReturnEquityCost: "0,053107603",
  };
}

function row(statement: StatementType, accountName: string, categoryOverride: AccountCategory | "", values: [string, string, string]): AccountRow {
  return {
    id: `browser-${accountName}`,
    statement,
    accountName,
    categoryOverride,
    balanceSheetClassification: "",
    labelOverrides: [],
    values: {
      "py2-1777681791752": values[0],
      "py1-1777681784335": values[1],
      p1: values[2],
    },
  };
}

function fixedAssetRow(assetName: string, values: Array<[string, string, string, string]>): FixedAssetScheduleRow {
  return {
    id: `browser-fa-${assetName}`,
    assetName,
    values: {
      "py2-1777681791752": fixedAssetValues(values[0]),
      "py1-1777681784335": fixedAssetValues(values[1]),
      p1: fixedAssetValues(values[2]),
    },
  };
}

function fixedAssetValues([acquisitionBeginning, acquisitionAdditions, depreciationBeginning, depreciationAdditions]: [string, string, string, string]) {
  return {
    acquisitionBeginning,
    acquisitionAdditions,
    depreciationBeginning,
    depreciationAdditions,
  };
}

function assertWithinSpread(actual: number, expected: number, maxSpread: number) {
  const spread = Math.abs(actual - expected) / Math.abs(expected);

  assert.ok(spread <= maxSpread, `expected ${actual} to be within ${maxSpread * 100}% of ${expected}; spread ${spread * 100}%`);
}
