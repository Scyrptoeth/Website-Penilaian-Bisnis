import {
  interestBearingDebt,
  nonOperatingAssets,
  normalizedNoplat,
} from "./calculations";
import type { AccountCategory, DcfForecastRow, FinancialStatementSnapshot, MethodOutput } from "./types";

export type DcfAuditValueFormat = "currency" | "percent" | "number" | "factor";

export type DcfAuditPeriod = {
  key: string;
  label: string;
  year: number | null;
  role: "historical" | "projection";
  includedInExplicitPv: boolean;
};

export type DcfAuditTrailRow = {
  id: string;
  label: string;
  formula: string;
  workbookReference: string;
  sourceTabs: string[];
  accountCategories: AccountCategory[];
  note: string;
  valueFormat: DcfAuditValueFormat;
  values: Array<number | null>;
};

export type DcfAuditBridgeRow = {
  id: string;
  label: string;
  formula: string;
  workbookReference: string;
  sourceTabs: string[];
  accountCategories: AccountCategory[];
  note: string;
  value: number;
  valueFormat: DcfAuditValueFormat;
};

export type DcfHistoricalAuditInputs = {
  periodLabel?: string;
  year?: number | null;
  depreciation: number;
  currentAssetMovement: number;
  currentLiabilityMovement: number;
  capitalExpenditures: number;
};

export type DcfAuditTrailInput = {
  snapshot: FinancialStatementSnapshot;
  dcf: MethodOutput & { forecast: DcfForecastRow[] };
  historical: DcfHistoricalAuditInputs;
  terminalGrowth: number;
  wacc: number;
  includeWorkingCapitalChange: boolean;
  debtLikeTaxPayable?: number;
};

export type DcfAuditTrail = {
  periods: DcfAuditPeriod[];
  rows: DcfAuditTrailRow[];
  bridgeRows: DcfAuditBridgeRow[];
  interoperabilityTabs: string[];
};

type DcfAuditProjectionValues = {
  noplat: number;
  depreciation: number;
  grossCashFlow: number;
  currentAssetMovement: number;
  currentLiabilityMovement: number;
  totalNetChangesInWorkingCapital: number;
  capitalExpenditures: number;
  grossInvestment: number;
  freeCashFlow: number;
  discountFactor: number;
  presentValue: number;
};

const dcfInteroperabilityTabs = [
  "NOPLAT & FCF",
  "Aset Tetap",
  "Cash Flow Statement",
  "Proyeksi Laba Rugi",
  "Proyeksi Aset Tetap",
  "Proyeksi Cash Flow Statement",
  "WACC",
  "Asumsi EEM/DCF",
  "Neraca",
  "ROIC",
];

export function buildDcfAuditTrail({
  snapshot,
  dcf,
  historical,
  terminalGrowth,
  wacc,
  includeWorkingCapitalChange,
  debtLikeTaxPayable = 0,
}: DcfAuditTrailInput): DcfAuditTrail {
  const historicalYear = historical.year ?? getHistoricalYear(snapshot, dcf.forecast);
  const periods: DcfAuditPeriod[] = [
    {
      key: "historical",
      label: historical.periodLabel || (historicalYear ? `${historicalYear} (Y)` : "Tahun Y"),
      year: historicalYear,
      role: "historical",
      includedInExplicitPv: false,
    },
    ...dcf.forecast.map((row, index) => ({
      key: `projection-${index + 1}`,
      label: `${row.year} (Y+${index + 1})`,
      year: row.year,
      role: "projection" as const,
      includedInExplicitPv: true,
    })),
  ];

  const projectionValues = buildProjectionValues(dcf.forecast, includeWorkingCapitalChange);
  const historicalValues = buildHistoricalValues(snapshot, historical, includeWorkingCapitalChange);
  const allValues = [historicalValues, ...projectionValues];
  const explicitPv = dcf.forecast.reduce((sum, row) => sum + row.presentValue, 0);
  const finalFreeCashFlow = dcf.forecast.at(-1)?.freeCashFlow ?? 0;
  const finalDiscountFactor = dcf.forecast.at(-1)?.discountFactor ?? 0;
  const terminalDenominator = wacc - terminalGrowth;
  const terminalValue = terminalDenominator > 0 ? (finalFreeCashFlow * (1 + terminalGrowth)) / terminalDenominator : 0;
  const terminalPv = terminalValue * finalDiscountFactor;
  const enterpriseValue = explicitPv + terminalPv;
  const surplusAssetCash = nonOperatingAssets(snapshot) - snapshot.nonOperatingFixedAssets;
  const bridgeDebt = interestBearingDebt(snapshot);

  return {
    periods,
    rows: [
      row({
        id: "dcf-noplat",
        label: "NOPLAT",
        formula: "EBIT operasi - pajak penghasilan badan",
        workbookReference: "DCF!C7:H7 -> NOPLAT!E19 dan PROY NOPLAT!D19:H19",
        sourceTabs: ["NOPLAT & FCF", "Proyeksi Laba Rugi"],
        accountCategories: [
          "REVENUE",
          "COST_OF_GOOD_SOLD",
          "SELLING_EXPENSE",
          "GENERAL_ADMINISTRATIVE_OVERHEADS",
          "DEPRECIATION_EXPENSE",
          "EBIT",
          "CORPORATE_TAX",
        ],
        note: "Basis operasi DCF; financing dan non-operating items tidak masuk NOPLAT.",
        values: allValues.map((item) => item.noplat),
      }),
      row({
        id: "dcf-depreciation",
        label: "Depreciation",
        formula: "Depreciation add-back dari jadwal aset tetap",
        workbookReference: "DCF!C8:H8 -> FIXED ASSET!E51 dan PROY FIXED ASSETS!D51:H51",
        sourceTabs: ["Aset Tetap", "Proyeksi Aset Tetap"],
        accountCategories: ["DEPRECIATION_EXPENSE", "FIXED_ASSET", "ACCUMULATED_DEPRECIATION"],
        note: "Add-back non-cash expense yang direkonsiliasi ke roll-forward aset tetap.",
        values: allValues.map((item) => item.depreciation),
      }),
      row({
        id: "dcf-gross-cash-flow",
        label: "Gross Cash Flow",
        formula: "NOPLAT + Depreciation",
        workbookReference: "DCF!C9:H9",
        sourceTabs: ["NOPLAT & FCF", "Proyeksi Laba Rugi", "Proyeksi Aset Tetap"],
        accountCategories: ["EBIT", "CORPORATE_TAX", "DEPRECIATION_EXPENSE"],
        note: "Cash flow operasi sebelum perubahan modal kerja dan capex.",
        values: allValues.map((item) => item.grossCashFlow),
      }),
      row({
        id: "dcf-current-asset-movement",
        label: "(Increase) Decrease in Current Asset",
        formula: "Saldo OCA awal - saldo OCA akhir",
        workbookReference: "DCF!C12:H12 -> CASH FLOW STATEMENT!E8 dan PROY CASH FLOW STATEMENT!D8:H8",
        sourceTabs: ["Cash Flow Statement", "Proyeksi Cash Flow Statement", "Proyeksi Neraca"],
        accountCategories: ["ACCOUNT_RECEIVABLE", "INVENTORY", "WORKING_CAPITAL"],
        note: "OCA DCF mengecualikan kas, piutang karyawan, pajak, dan debt-like accounts.",
        values: allValues.map((item) => item.currentAssetMovement),
      }),
      row({
        id: "dcf-current-liability-movement",
        label: "Increase (Decrease) in Current Liabilities",
        formula: "Saldo OCL akhir - saldo OCL awal",
        workbookReference: "DCF!C13:H13 -> CASH FLOW STATEMENT!E9 dan PROY CASH FLOW STATEMENT!D9:H9",
        sourceTabs: ["Cash Flow Statement", "Proyeksi Cash Flow Statement", "Proyeksi Neraca"],
        accountCategories: ["ACCOUNT_PAYABLE", "OTHER_PAYABLE", "WORKING_CAPITAL"],
        note: "OCL DCF hanya utang operasi; bank loan, bunga, dan pajak dipisahkan dari working capital.",
        values: allValues.map((item) => item.currentLiabilityMovement),
      }),
      row({
        id: "dcf-total-net-wc",
        label: "Total Net Changes in Working Capital",
        formula: "(Increase) decrease current asset + increase (decrease) current liabilities",
        workbookReference: "DCF!C14:H14",
        sourceTabs: ["Cash Flow Statement", "Proyeksi Cash Flow Statement"],
        accountCategories: ["WORKING_CAPITAL", "ACCOUNT_RECEIVABLE", "INVENTORY", "ACCOUNT_PAYABLE", "OTHER_PAYABLE"],
        note: includeWorkingCapitalChange
          ? "Nilai modal kerja operasi aktif mengalir ke FCFF."
          : "Basis DCF aktif mengecualikan incremental working capital; baris ini dipaksa nol oleh scenario engine.",
        values: allValues.map((item) => item.totalNetChangesInWorkingCapital),
      }),
      row({
        id: "dcf-capex",
        label: "Capital Expenditures",
        formula: "Additions aset tetap x -1",
        workbookReference: "DCF!C16:H16 -> FIXED ASSET!E23 dan PROY FIXED ASSETS!D23:H23",
        sourceTabs: ["Aset Tetap", "Proyeksi Aset Tetap"],
        accountCategories: ["FIXED_ASSET", "FIXED_ASSET_ACQUISITION"],
        note: "Disajikan negatif karena capex adalah arus kas keluar.",
        values: allValues.map((item) => item.capitalExpenditures),
      }),
      row({
        id: "dcf-gross-investment",
        label: "Gross Investment",
        formula: "Total net changes in working capital + capital expenditures",
        workbookReference: "DCF!C18:H18",
        sourceTabs: ["Proyeksi Aset Tetap", "Proyeksi Cash Flow Statement"],
        accountCategories: ["WORKING_CAPITAL", "FIXED_ASSET_ACQUISITION"],
        note: "Bridge investasi operasi dalam konvensi workbook DCF.",
        values: allValues.map((item) => item.grossInvestment),
      }),
      row({
        id: "dcf-free-cash-flow",
        label: "Free Cash Flow",
        formula: "Gross cash flow + gross investment",
        workbookReference: "DCF!C20:H20",
        sourceTabs: ["NOPLAT & FCF", "Proyeksi Cash Flow Statement", "Penilaian DCF"],
        accountCategories: ["EBIT", "CORPORATE_TAX", "DEPRECIATION_EXPENSE", "WORKING_CAPITAL", "FIXED_ASSET_ACQUISITION"],
        note: "FCFF proyeksi yang menjadi basis PV eksplisit dan terminal value.",
        values: allValues.map((item) => item.freeCashFlow),
      }),
      row({
        id: "dcf-discount-factor",
        label: "Discount Factor",
        formula: "1 / (1 + WACC)^n",
        workbookReference: "DCF!B23:H23 -> discount-rate source row H10",
        sourceTabs: ["WACC", "Asumsi EEM/DCF"],
        accountCategories: [],
        note: "Tahun Y ditampilkan sebagai pembanding historis; hanya periode Y+1 sampai Y+5 yang dijumlahkan ke PV eksplisit.",
        values: allValues.map((item) => item.discountFactor),
        valueFormat: "factor",
      }),
      row({
        id: "dcf-pv-free-cash-flow",
        label: "PV of Free Cash Flow",
        formula: "Free Cash Flow x Discount Factor",
        workbookReference: "DCF!D24:H24",
        sourceTabs: ["Penilaian DCF", "WACC"],
        accountCategories: ["CASH_FLOW_AVAILABLE_TO_INVESTOR"],
        note: "PV Tahun Y adalah benchmark historis dan tidak masuk Total PV FCF explicit period.",
        values: allValues.map((item) => item.presentValue),
      }),
    ],
    bridgeRows: [
      bridgeRow({
        id: "dcf-total-explicit-pv",
        label: "Total PV FCF Explicit Period",
        formula: "SUM(PV of Free Cash Flow Y+1:Y+5)",
        workbookReference: "DCF!C25",
        sourceTabs: ["Penilaian DCF"],
        accountCategories: ["CASH_FLOW_AVAILABLE_TO_INVESTOR"],
        note: "Hanya PV periode proyeksi yang masuk enterprise value.",
        value: explicitPv,
      }),
      bridgeRow({
        id: "dcf-growth-rate",
        label: "Growth Rate",
        formula: "Terminal growth aktif",
        workbookReference: "DCF!B26 -> GROWTH RATE!C14",
        sourceTabs: ["Asumsi EEM/DCF"],
        accountCategories: [],
        note: "Wajib lebih rendah dari WACC agar terminal denominator valid.",
        value: terminalGrowth,
        valueFormat: "percent",
      }),
      bridgeRow({
        id: "dcf-terminal-value",
        label: "Terminal Value",
        formula: "FCFF final x (1 + g) / (WACC - g)",
        workbookReference: "DCF!C27",
        sourceTabs: ["Penilaian DCF", "WACC", "Asumsi EEM/DCF"],
        accountCategories: ["CASH_FLOW_AVAILABLE_TO_INVESTOR"],
        note: "Gordon growth terminal value dari FCFF tahun proyeksi terakhir.",
        value: terminalValue,
      }),
      bridgeRow({
        id: "dcf-pv-terminal-value",
        label: "PV of Terminal Value",
        formula: "Terminal value x discount factor final",
        workbookReference: "DCF!C28",
        sourceTabs: ["Penilaian DCF", "WACC"],
        accountCategories: ["CASH_FLOW_AVAILABLE_TO_INVESTOR"],
        note: "Nilai terminal didiskonto memakai timing yang sama dengan periode eksplisit.",
        value: terminalPv,
      }),
      bridgeRow({
        id: "dcf-enterprise-value",
        label: "Enterprise Value",
        formula: "Total PV FCF explicit period + PV of terminal value",
        workbookReference: "DCF!C29",
        sourceTabs: ["Penilaian DCF"],
        accountCategories: [],
        note: "Nilai operasi sebelum bridge ke equity value.",
        value: enterpriseValue,
      }),
      bridgeRow({
        id: "dcf-interest-bearing-debt",
        label: "Interest Bearing Debt",
        formula: "Bank loan short term + bank loan long term",
        workbookReference: "DCF!C30 -> BALANCE SHEET!F30 + BALANCE SHEET!F37",
        sourceTabs: ["Neraca", "Jadwal Utang"],
        accountCategories: ["BANK_LOAN_SHORT_TERM", "BANK_LOAN_LONG_TERM", "INTEREST_BEARING_DEBT"],
        note: "Dikurangkan dari enterprise value pada bridge ke ekuitas.",
        value: bridgeDebt,
      }),
      bridgeRow({
        id: "dcf-surplus-asset-cash",
        label: "Surplus Asset Cash",
        formula: "Cash/deposit + excess cash + marketable securities + employee receivable",
        workbookReference: "DCF!C31 -> ROIC!D10",
        sourceTabs: ["Neraca", "ROIC"],
        accountCategories: [
          "CASH_ON_HAND",
          "CASH_ON_BANK",
          "EXCESS_CASH",
          "MARKETABLE_SECURITIES",
          "OTHER_RECEIVABLE",
          "EMPLOYEE_RECEIVABLE",
          "SURPLUS_ASSET_CASH",
        ],
        note: "Aset kas/non-operasional yang ditambahkan kembali setelah enterprise value.",
        value: surplusAssetCash,
      }),
      bridgeRow({
        id: "dcf-idle-non-operating-asset",
        label: "Idle Non Operating Aset (Building)",
        formula: "Idle/non-operating fixed assets",
        workbookReference: "DCF!C32 -> ROIC!D9",
        sourceTabs: ["Neraca", "ROIC", "Aset Tetap"],
        accountCategories: ["NON_OPERATING_FIXED_ASSETS"],
        note: "Nol kecuali bukti penggunaan aset mengidentifikasi aset idle/non-operasional.",
        value: snapshot.nonOperatingFixedAssets,
      }),
      ...(debtLikeTaxPayable > 0
        ? [
            bridgeRow({
              id: "dcf-debt-like-tax-payable",
              label: "Debt-like Tax Payable",
              formula: "Tax payable treated as debt-like liability",
              workbookReference: "Scenario DCF aktif",
              sourceTabs: ["Neraca", "Simulasi Potensi Pajak"],
              accountCategories: ["TAX_PAYABLE"],
              note: "Muncul hanya ketika basis DCF aktif menganggap utang pajak sebagai debt-like liability.",
              value: debtLikeTaxPayable,
            }),
          ]
        : []),
      bridgeRow({
        id: "dcf-equity-value",
        label: "Equity Value (100%)",
        formula:
          debtLikeTaxPayable > 0
            ? "Enterprise value + surplus asset cash + idle non-operating asset - interest bearing debt - debt-like tax payable"
            : "Enterprise value + surplus asset cash + idle non-operating asset - interest bearing debt",
        workbookReference: "DCF!C33",
        sourceTabs: ["Penilaian DCF"],
        accountCategories: [],
        note: "Nilai ekuitas 100%; DLOM/DLOC tidak diterapkan di base DCF.",
        value: dcf.equityValue,
      }),
    ],
    interoperabilityTabs: dcfInteroperabilityTabs,
  };
}

function buildHistoricalValues(
  snapshot: FinancialStatementSnapshot,
  historical: DcfHistoricalAuditInputs,
  includeWorkingCapitalChange: boolean,
): DcfAuditProjectionValues {
  const noplat = normalizedNoplat(snapshot);
  const depreciation = historical.depreciation;
  const grossCashFlow = noplat + depreciation;
  const currentAssetMovement = includeWorkingCapitalChange ? historical.currentAssetMovement : 0;
  const currentLiabilityMovement = includeWorkingCapitalChange ? historical.currentLiabilityMovement : 0;
  const totalNetChangesInWorkingCapital = currentAssetMovement + currentLiabilityMovement;
  const capitalExpenditures = historical.capitalExpenditures;
  const grossInvestment = totalNetChangesInWorkingCapital + capitalExpenditures;
  const freeCashFlow = grossCashFlow + grossInvestment;

  return {
    noplat,
    depreciation,
    grossCashFlow,
    currentAssetMovement,
    currentLiabilityMovement,
    totalNetChangesInWorkingCapital,
    capitalExpenditures,
    grossInvestment,
    freeCashFlow,
    discountFactor: 1,
    presentValue: freeCashFlow,
  };
}

function buildProjectionValues(forecast: DcfForecastRow[], includeWorkingCapitalChange: boolean): DcfAuditProjectionValues[] {
  return forecast.map((forecastRow) => {
    const currentAssetMovement = includeWorkingCapitalChange
      ? forecastRow.operatingCurrentAssetsBeginning - forecastRow.operatingCurrentAssets
      : 0;
    const currentLiabilityMovement = includeWorkingCapitalChange
      ? forecastRow.operatingCurrentLiabilities - forecastRow.operatingCurrentLiabilitiesBeginning
      : 0;
    const totalNetChangesInWorkingCapital = currentAssetMovement + currentLiabilityMovement;
    const capitalExpenditures = -forecastRow.capitalExpenditure;
    const grossInvestment = totalNetChangesInWorkingCapital + capitalExpenditures;
    const noplat = forecastRow.grossCashFlow - forecastRow.depreciation;

    return {
      noplat,
      depreciation: forecastRow.depreciation,
      grossCashFlow: forecastRow.grossCashFlow,
      currentAssetMovement,
      currentLiabilityMovement,
      totalNetChangesInWorkingCapital,
      capitalExpenditures,
      grossInvestment,
      freeCashFlow: forecastRow.freeCashFlow,
      discountFactor: forecastRow.discountFactor,
      presentValue: forecastRow.presentValue,
    };
  });
}

function row(input: Omit<DcfAuditTrailRow, "valueFormat"> & { valueFormat?: DcfAuditValueFormat }): DcfAuditTrailRow {
  return {
    valueFormat: "currency",
    ...input,
  };
}

function bridgeRow(input: Omit<DcfAuditBridgeRow, "valueFormat"> & { valueFormat?: DcfAuditValueFormat }): DcfAuditBridgeRow {
  return {
    valueFormat: "currency",
    ...input,
  };
}

function getHistoricalYear(snapshot: FinancialStatementSnapshot, forecast: DcfForecastRow[]): number | null {
  const parsedYear = Number.parseInt(snapshot.valuationDate.slice(0, 4), 10);

  if (Number.isFinite(parsedYear)) {
    return parsedYear;
  }

  const firstForecastYear = forecast[0]?.year;
  return firstForecastYear ? firstForecastYear - 1 : null;
}
