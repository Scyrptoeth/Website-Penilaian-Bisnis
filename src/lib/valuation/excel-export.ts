import * as XLSX from "xlsx";
import { operatingWorkingCapital } from "./calculations";
import { categoryLabelMap } from "./category-options";
import { parseInputNumber, statementLabels, type AccountRow, type AssumptionState, type CaseProfile, type CaseProfileDerived, type FixedAssetScheduleRow, type FixedAssetScheduleSummary, type MappedRow, type Period } from "./case-model";
import type { AamAdjustmentLine, AamAdjustmentModel } from "./aam-adjustments";
import type { DlocPfcCalculation } from "./dloc-pfc";
import type { DlomCalculation } from "./dlom";
import type { SectionAnalysis } from "./section-analysis";
import type { TaxSimulationResult, TaxSimulationState } from "./tax-simulation";
import type { FinancialStatementSnapshot, FormulaTrace, ValuationMethod } from "./types";
import type { ValidationCheck } from "./validation-checks";
import type { WorkbenchReadiness } from "./readiness";
import type { calculateAllMethods } from "./calculations";

type CalculationResults = ReturnType<typeof calculateAllMethods>;

export type ValuationExcelExportInput = {
  periods: Period[];
  activePeriodId: string;
  rows: AccountRow[];
  mappedRows: MappedRow[];
  fixedAssetScheduleRows: FixedAssetScheduleRow[];
  fixedAssetSchedule: FixedAssetScheduleSummary;
  assumptions: AssumptionState;
  resolvedAssumptions: AssumptionState;
  caseProfile: CaseProfile;
  caseProfileDerived: CaseProfileDerived;
  snapshot: FinancialStatementSnapshot;
  aamAdjustmentModel: AamAdjustmentModel;
  results: CalculationResults;
  dlomCalculation: DlomCalculation;
  dlocPfcCalculation: DlocPfcCalculation;
  taxSimulation: TaxSimulationState;
  taxSimulationResult: TaxSimulationResult;
  sectionAnalysis: SectionAnalysis;
  readiness: WorkbenchReadiness;
  validationChecks: ValidationCheck[];
  exportedAt?: Date;
};

type WorkbookBuild = {
  workbook: XLSX.WorkBook;
  filename: string;
};

type SheetCell = string | number | boolean | null | XLSX.CellObject;
type SheetRow = SheetCell[];
type SheetRefs = Record<string, string>;
type MethodRefs = Record<ValuationMethod, string>;

const currencyFormat = '#,##0;[Red](#,##0);"-"';
const numberFormat = '#,##0.00;[Red](#,##0.00);"-"';
const integerFormat = '#,##0;[Red](#,##0);"-"';
const percentFormat = '0.00%;[Red](0.00%);"-"';

const caseProfileLabels: Record<keyof CaseProfile, string> = {
  objectTaxpayerName: "Nama Wajib Pajak Objek",
  objectTaxpayerNpwp: "NPWP Wajib Pajak Objek",
  companySector: "Sektor Perusahaan",
  companyType: "Jenis Perusahaan",
  subjectTaxpayerName: "Nama Subjek Pajak",
  subjectTaxpayerNpwp: "NPWP Subjek Pajak",
  subjectTaxpayerType: "Jenis Subjek Pajak",
  shareOwnershipType: "Jenis Kepemilikan",
  transferType: "Jenis Pengalihan",
  capitalBaseFull: "Basis modal/saham 100%",
  capitalBaseValued: "Basis modal/saham dinilai",
  transactionYear: "Tahun transaksi",
  valuationObject: "Objek penilaian",
};

const assumptionLabels: Record<keyof AssumptionState, string> = {
  taxRate: "Tarif pajak",
  taxRateSource: "Sumber tarif pajak",
  taxRateOverrideReason: "Alasan override tarif pajak",
  terminalGrowth: "Terminal growth",
  terminalGrowthSource: "Sumber terminal growth",
  terminalGrowthOverrideReason: "Alasan terminal growth",
  terminalGrowthDownside: "Terminal growth downside",
  terminalGrowthUpside: "Terminal growth upside",
  revenueGrowth: "Revenue growth",
  wacc: "WACC manual",
  waccSource: "Sumber WACC",
  waccOverrideReason: "Alasan WACC",
  waccRiskFreeRate: "Risk-free rate",
  waccBeta: "Beta",
  waccEquityRiskPremium: "Equity risk premium",
  waccRatingBasedDefaultSpread: "Rating-based default spread",
  waccCountryRiskPremium: "Country risk premium",
  waccSpecificRiskPremium: "Specific risk premium",
  waccPreTaxCostOfDebt: "Pre-tax cost of debt",
  waccBankPerseroInvestmentLoanRate: "SBDK investasi bank persero",
  waccBankSwastaInvestmentLoanRate: "SBDK investasi bank swasta",
  waccBankUmumInvestmentLoanRate: "SBDK investasi bank umum",
  waccDebtWeight: "Debt weight",
  waccEquityWeight: "Equity weight",
  waccDebtMarketValue: "Debt market value",
  waccEquityMarketValue: "Equity market value",
  waccComparable1Name: "Comparable 1",
  waccComparable1BetaLevered: "Comparable 1 beta levered",
  waccComparable1MarketCap: "Comparable 1 market cap",
  waccComparable1Debt: "Comparable 1 debt",
  waccComparable2Name: "Comparable 2",
  waccComparable2BetaLevered: "Comparable 2 beta levered",
  waccComparable2MarketCap: "Comparable 2 market cap",
  waccComparable2Debt: "Comparable 2 debt",
  waccComparable3Name: "Comparable 3",
  waccComparable3BetaLevered: "Comparable 3 beta levered",
  waccComparable3MarketCap: "Comparable 3 market cap",
  waccComparable3Debt: "Comparable 3 debt",
  requiredReturnOnNta: "Required return on NTA",
  requiredReturnOnNtaSource: "Sumber required return on NTA",
  requiredReturnOnNtaOverrideReason: "Alasan required return on NTA",
  requiredReturnReceivablesCapacity: "Kapasitas piutang",
  requiredReturnInventoryCapacity: "Kapasitas persediaan",
  requiredReturnFixedAssetCapacity: "Kapasitas aset tetap",
  requiredReturnAdditionalCapacity: "Kapasitas tambahan",
  requiredReturnAfterTaxDebtCost: "After-tax cost of debt",
  requiredReturnEquityCost: "Cost of equity",
  arDays: "AR days",
  inventoryDays: "Inventory days",
  apDays: "AP days",
  otherPayableDays: "Other payable days",
};

export function buildValuationWorkbook(input: ValuationExcelExportInput): WorkbookBuild {
  const exportedAt = input.exportedAt ?? new Date();
  const filename = buildWorkbookFilename(input.caseProfile.objectTaxpayerName, exportedAt);
  const workbook = XLSX.utils.book_new();
  workbook.Props = {
    Title: "Penilaian Valuasi Bisnis Export",
    Subject: "Audit workbook generated from active website state",
    Author: "Penilaian Bisnis II",
    Company: input.caseProfile.objectTaxpayerName || "Penilaian Bisnis II",
    CreatedDate: exportedAt,
  };

  const snapshotSheet = buildSnapshotSheet(input);
  const aamSheet = buildAamSheet(input, snapshotSheet.refs);
  const eemSheet = buildEemSheet(input, snapshotSheet.refs);
  const dcfSheet = buildDcfSheet(input, snapshotSheet.refs);
  const discountSheet = buildDlomDlocSheet(input);
  const methodRefs: MethodRefs = {
    AAM: aamSheet.refs.equityValue,
    EEM: eemSheet.refs.equityValue,
    DCF: dcfSheet.refs.equityValue,
  };
  const taxSheet = buildTaxSimulationSheet(input, methodRefs);
  const summarySheet = buildSummarySheet(input, methodRefs, taxSheet.refs, exportedAt);
  const caseProfileSheet = buildCaseProfileSheet(input, exportedAt);
  const inputSheet = buildInputSheet(input);
  const fixedAssetSheet = buildFixedAssetSheet(input);
  const assumptionSheet = buildAssumptionSheet(input);
  const analysisSheet = buildSectionAnalysisSheet(input);
  const auditSheet = buildAuditTraceSheet(input);

  appendSheet(workbook, "00_Summary", summarySheet.worksheet);
  appendSheet(workbook, "01_Case_Profile", caseProfileSheet.worksheet);
  appendSheet(workbook, "02_Inputs", inputSheet.worksheet);
  appendSheet(workbook, "03_Fixed_Assets", fixedAssetSheet.worksheet);
  appendSheet(workbook, "04_Assumptions", assumptionSheet.worksheet);
  appendSheet(workbook, "05_Snapshot", snapshotSheet.worksheet);
  appendSheet(workbook, "06_AAM", aamSheet.worksheet);
  appendSheet(workbook, "07_EEM", eemSheet.worksheet);
  appendSheet(workbook, "08_DCF", dcfSheet.worksheet);
  appendSheet(workbook, "09_DLOM_DLOC", discountSheet.worksheet);
  appendSheet(workbook, "10_Tax_Simulation", taxSheet.worksheet);
  appendSheet(workbook, "11_Section_Analysis", analysisSheet.worksheet);
  appendSheet(workbook, "12_Audit_Trace", auditSheet.worksheet);

  return { workbook, filename };
}

export function downloadValuationWorkbook(input: ValuationExcelExportInput): void {
  const { workbook, filename } = buildValuationWorkbook(input);

  XLSX.writeFile(workbook, filename, { compression: true });
}

function buildSummarySheet(input: ValuationExcelExportInput, methodRefs: MethodRefs, taxRefs: SheetRefs, exportedAt: Date) {
  const rows: SheetRow[] = [
    ["Penilaian Bisnis II - Workbook Export"],
    ["Generated at", exportedAt.toISOString()],
    ["Export basis", "Active website state. Layout is purpose-built for audit review and does not copy the reference Excel workbook format."],
    [],
    ["Case", "Value"],
    ["Object taxpayer", input.caseProfile.objectTaxpayerName || "-"],
    ["Subject taxpayer", input.caseProfile.subjectTaxpayerName || "-"],
    ["Valuation date", input.snapshot.valuationDate || "-"],
    ["Transaction year", input.caseProfile.transactionYear || "-"],
    ["Capital/share proportion", numberCell(input.caseProfileDerived.capitalProportion ?? 0, "percent")],
    [],
    ["Base valuation", "Formula", "Value", "Note"],
    ["AAM equity value", methodRefs.AAM, formulaCell(methodRefs.AAM, input.results.aam.equityValue, "currency"), "Asset Accumulation Method before DLOM/DLOC/PFC."],
    ["EEM equity value", methodRefs.EEM, formulaCell(methodRefs.EEM, input.results.eem.equityValue, "currency"), "Excess Earnings Method before DLOM/DLOC/PFC."],
    ["DCF equity value", methodRefs.DCF, formulaCell(methodRefs.DCF, input.results.dcf.equityValue, "currency"), "DCF before DLOM/DLOC/PFC."],
    [],
    ["Discount / tax simulation", "Formula", "Value", "Note"],
    ["DLOM rate", "'09_DLOM_DLOC'!$C$11", formulaCell("'09_DLOM_DLOC'!$C$11", input.dlomCalculation.dlomRate, "percent"), input.dlomCalculation.status],
    ["DLOC/PFC signed rate", "'09_DLOM_DLOC'!$C$31", formulaCell("'09_DLOM_DLOC'!$C$31", input.dlocPfcCalculation.signedRate, "percent"), input.dlocPfcCalculation.status],
    [
      "Primary potential tax",
      taxRefs.primaryPotentialTax || "",
      taxRefs.primaryPotentialTax ? formulaCell(taxRefs.primaryPotentialTax, input.taxSimulationResult.primaryRow?.potentialTax ?? 0, "currency") : numberCell(0, "currency"),
      input.taxSimulationResult.primaryRow ? `${input.taxSimulationResult.primaryRow.method} / ${input.taxSimulationResult.primaryRow.basisLabel}` : "Primary method belum dipilih.",
    ],
    [],
    ["Validation snapshot", "Status"],
    ...input.validationChecks.map((check): SheetRow => [check.label, check.ok ? "OK" : "Needs review"]),
  ];

  return createSheet(rows, [28, 32, 18, 58]);
}

function buildCaseProfileSheet(input: ValuationExcelExportInput, exportedAt: Date) {
  const rows: SheetRow[] = [
    ["Field", "Input Value", "Derived / Status", "Source"],
    ["Exported at", exportedAt.toISOString(), "", "System"],
    ...typedEntries(input.caseProfile).map(([key, value]): SheetRow => [caseProfileLabels[key], value, "", "User input"]),
    ["Cut-off date", "", input.caseProfileDerived.cutOffDate || "-", "Derived from transaction year"],
    ["First projection end date", "", input.caseProfileDerived.firstProjectionEndDate || "-", "Derived from transaction year"],
    ["Capital proportion label", "", input.caseProfileDerived.capitalProportionLabel, "Derived"],
    ["Capital proportion", "", numberCell(input.caseProfileDerived.capitalProportion ?? 0, "percent"), input.caseProfileDerived.capitalProportionStatus],
  ];

  return createSheet(rows, [32, 28, 28, 34]);
}

function buildInputSheet(input: ValuationExcelExportInput) {
  const periods = input.periods;
  const rows: SheetRow[] = [
    ["Statement", "Account Name", "Category Override", "Effective Category", "Mapping Confidence", "Needs Review", ...periods.map((period) => period.label), "Mapping Reason"],
    ...input.mappedRows.map((item): SheetRow => [
      statementLabels[item.row.statement],
      item.row.accountName,
      item.row.categoryOverride ? readableCategory(item.row.categoryOverride) : "",
      readableCategory(item.effectiveCategory),
      item.mapping.confidence,
      item.mapping.needsReview ? "Yes" : "No",
      ...periods.map((period) => numberCell(parseInputNumber(item.row.values[period.id] ?? ""), "currency")),
      item.mapping.reason,
    ]),
  ];

  return createSheet(rows, [16, 46, 24, 24, 16, 14, ...periods.map(() => 16), 52]);
}

function buildFixedAssetSheet(input: ValuationExcelExportInput) {
  const periods = input.periods;
  const rows: SheetRow[] = [["Class", "Metric", ...periods.map((period) => period.label), "Formula / Source"]];

  input.fixedAssetSchedule.rows.forEach((computed) => {
    const metrics: Array<[string, keyof typeof computed.amounts[string], string]> = [
      ["Acquisition beginning", "acquisitionBeginning", "First period input; later periods roll forward from prior ending"],
      ["Acquisition additions", "acquisitionAdditions", "User input"],
      ["Acquisition ending", "acquisitionEnding", "Beginning + additions"],
      ["Depreciation beginning", "depreciationBeginning", "First period input; later periods roll forward from prior ending"],
      ["Depreciation additions", "depreciationAdditions", "User input"],
      ["Depreciation ending", "depreciationEnding", "Beginning + additions"],
      ["Net book value", "netValue", "Acquisition ending - depreciation ending"],
    ];

    metrics.forEach(([label, key, source]) => {
      rows.push([
        computed.row.assetName || "-",
        label,
        ...periods.map((period) => numberCell(computed.amounts[period.id]?.[key] ?? 0, "currency")),
        source,
      ]);
    });
  });

  rows.push([]);
  rows.push(["Total", "Metric", ...periods.map((period) => period.label), "Formula / Source"]);
  const totalMetrics: Array<[string, keyof FixedAssetScheduleSummary["totals"][string], string]> = [
    ["Acquisition beginning", "acquisitionBeginning", "Sum of classes"],
    ["Acquisition additions", "acquisitionAdditions", "Sum of classes"],
    ["Acquisition ending", "acquisitionEnding", "Sum of classes"],
    ["Depreciation beginning", "depreciationBeginning", "Sum of classes"],
    ["Depreciation additions", "depreciationAdditions", "Sum of classes"],
    ["Depreciation ending", "depreciationEnding", "Sum of classes"],
    ["Net book value", "netValue", "Acquisition ending - depreciation ending"],
  ];

  totalMetrics.forEach(([label, key, source]) => {
    rows.push([
      "Total",
      label,
      ...periods.map((period) => numberCell(input.fixedAssetSchedule.totals[period.id]?.[key] ?? 0, "currency")),
      source,
    ]);
  });

  return createSheet(rows, [32, 24, ...periods.map(() => 18), 42]);
}

function buildAssumptionSheet(input: ValuationExcelExportInput) {
  const rows: SheetRow[] = [
    ["Assumption", "Raw Input", "Resolved Value", "Value Type"],
    ...typedEntries(input.assumptions).map(([key, rawValue]): SheetRow => {
      const resolvedValue = input.resolvedAssumptions[key];
      const parsed = parseInputNumber(resolvedValue);
      const isNumeric = resolvedValue.trim() !== "" && Number.isFinite(parsed);
      const isRate = key.toLowerCase().includes("rate") || key.toLowerCase().includes("growth") || key.toLowerCase().includes("wacc") || key.toLowerCase().includes("return") || key.toLowerCase().includes("beta") || key.toLowerCase().includes("weight");

      return [
        assumptionLabels[key],
        rawValue,
        isNumeric ? numberCell(parsed, isRate ? "percent" : "number") : resolvedValue,
        isNumeric ? (isRate ? "rate/percent" : "number") : "text/source",
      ];
    }),
  ];

  return createSheet(rows, [38, 28, 24, 18]);
}

function buildSnapshotSheet(input: ValuationExcelExportInput) {
  const rows: SheetRow[] = [["Key", "Metric", "Value", "Formula / Source"]];
  const refs: SheetRefs = {};

  const add = (key: string, label: string, value: number | string, source: string, format: "currency" | "percent" | "number" = "currency", formula?: string) => {
    const rowIndex = rows.length;
    refs[key] = sheetCell("05_Snapshot", rowIndex, 2);
    rows.push([key, label, typeof value === "number" ? (formula ? formulaCell(formula, value, format) : numberCell(value, format)) : value, source]);
  };

  add("taxRate", "Tax rate", input.snapshot.taxRate, "Resolved assumption", "percent");
  add("terminalGrowth", "Terminal growth", input.snapshot.terminalGrowth, "Resolved assumption", "percent");
  add("revenueGrowth", "Revenue growth", input.snapshot.revenueGrowth, "Resolved assumption or historical driver", "percent");
  add("wacc", "WACC", input.snapshot.wacc, "Resolved assumption", "percent");
  add("requiredReturnOnNta", "Required return on NTA", input.snapshot.requiredReturnOnNta, "Resolved assumption", "percent");
  add("cogsMargin", "COGS margin", input.snapshot.cogsMargin, "Historical average driver", "percent");
  add("gaMargin", "GA margin", input.snapshot.gaMargin, "Historical average driver", "percent");
  add("depreciationMargin", "Depreciation margin", input.snapshot.depreciationMargin, "Historical average driver", "percent");
  add("arDays", "AR days", input.snapshot.arDays, "Input or historical driver", "number");
  add("inventoryDays", "Inventory days", input.snapshot.inventoryDays, "Input or historical driver", "number");
  add("apDays", "AP days", input.snapshot.apDays, "Input or historical driver", "number");
  add("otherPayableDays", "Other payable days", input.snapshot.otherPayableDays, "Input or historical driver", "number");
  add("cashOnHand", "Cash on hand", input.snapshot.cashOnHand, "Mapped balance sheet");
  add("cashOnBankDeposit", "Cash on bank / deposit", input.snapshot.cashOnBankDeposit, "Mapped balance sheet");
  add("accountReceivable", "Account receivable", input.snapshot.accountReceivable, "Mapped balance sheet");
  add("employeeReceivable", "Employee receivable", input.snapshot.employeeReceivable, "Mapped balance sheet");
  add("inventory", "Inventory", input.snapshot.inventory, "Mapped balance sheet");
  add("fixedAssetsNet", "Fixed assets net", input.snapshot.fixedAssetsNet, "Mapped balance sheet or fixed asset schedule");
  add("nonOperatingFixedAssets", "Non-operating fixed assets", input.snapshot.nonOperatingFixedAssets, "Mapped balance sheet");
  add("intangibleAssets", "Intangible assets", input.snapshot.intangibleAssets, "Mapped balance sheet");
  add("excessCash", "Excess cash", input.snapshot.excessCash, "Mapped balance sheet");
  add("marketableSecurities", "Marketable securities", input.snapshot.marketableSecurities, "Mapped balance sheet");
  add("surplusAssetCash", "Surplus asset cash", input.snapshot.surplusAssetCash, "Mapped balance sheet");
  add("bankLoanShortTerm", "Bank loan short term", input.snapshot.bankLoanShortTerm, "Mapped balance sheet");
  add("accountPayable", "Account payable", input.snapshot.accountPayable, "Mapped balance sheet");
  add("taxPayable", "Tax payable", input.snapshot.taxPayable, "Mapped balance sheet");
  add("otherPayable", "Other payable", input.snapshot.otherPayable, "Mapped balance sheet");
  add("interestPayable", "Interest payable", input.snapshot.interestPayable, "Mapped balance sheet");
  add("bankLoanLongTerm", "Bank loan long term", input.snapshot.bankLoanLongTerm, "Mapped balance sheet");
  add("paidUpCapital", "Paid up capital", input.snapshot.paidUpCapital, "Mapped balance sheet");
  add("additionalPaidInCapital", "Additional paid-in capital", input.snapshot.additionalPaidInCapital, "Mapped balance sheet");
  add("retainedEarningsSurplus", "Retained earnings surplus", input.snapshot.retainedEarningsSurplus, "Mapped balance sheet");
  add("retainedEarningsCurrentProfit", "Current profit in equity", input.snapshot.retainedEarningsCurrentProfit, "Mapped balance sheet");
  add("revenue", "Revenue", input.snapshot.revenue, "Mapped income statement");
  add("cogs", "COGS", input.snapshot.cogs, "Mapped income statement");
  add("sellingExpense", "Selling expense", input.snapshot.sellingExpense, "Mapped income statement");
  add("gaOverheads", "General and administrative overheads", input.snapshot.gaOverheads, "Mapped income statement");
  add("depreciation", "Depreciation", input.snapshot.depreciation, "Mapped income statement or fixed asset schedule");
  add("ebit", "EBIT", input.snapshot.ebit, "EBIT override or revenue + expenses");
  add("corporateTax", "Corporate tax", input.snapshot.corporateTax, "Mapped income statement");
  add("commercialNpat", "Commercial NPAT", input.snapshot.commercialNpat, "Mapped income statement");
  add("interestIncome", "Interest income", input.snapshot.interestIncome, "Mapped income statement");
  add("interestExpense", "Interest expense", input.snapshot.interestExpense, "Mapped income statement");
  add("nonOperatingIncome", "Non-operating income", input.snapshot.nonOperatingIncome, "Mapped income statement");
  add("currentAssets", "Current assets", input.snapshot.currentAssets, "Derived from components", "currency");
  add("nonCurrentAssets", "Non-current assets", input.snapshot.nonCurrentAssets, "Derived from components", "currency");
  add("totalAssets", "Total assets", input.snapshot.totalAssets, "Input total assets or derived total", "currency");
  add("currentLiabilities", "Current liabilities", input.snapshot.currentLiabilities, "Derived from components", "currency");
  add("nonCurrentLiabilities", "Non-current liabilities", input.snapshot.nonCurrentLiabilities, "Derived from components", "currency");
  add("totalLiabilities", "Total liabilities", input.snapshot.totalLiabilities, "Input total liabilities or derived total", "currency");
  add("bookEquity", "Book equity", input.snapshot.bookEquity, "Paid-up capital + additional capital + retained earnings + current profit", "currency", `${refs.paidUpCapital}+${refs.additionalPaidInCapital}+${refs.retainedEarningsSurplus}+${refs.retainedEarningsCurrentProfit}`);
  add("operatingWorkingCapital", "Operating working capital", operatingWorkingCapital(input.snapshot), "(AR + inventory) - (AP + other payable)", "currency", `(${refs.accountReceivable}+${refs.inventory})-(${refs.accountPayable}+${refs.otherPayable})`);
  add("nonOperatingAssets", "Non-operating assets", input.results.nonOperatingAssets, "Cash/deposit + surplus assets + employee receivable + non-operating fixed assets", "currency", `${refs.cashOnHand}+${refs.cashOnBankDeposit}+${refs.excessCash}+${refs.surplusAssetCash}+${refs.marketableSecurities}+${refs.employeeReceivable}+${refs.nonOperatingFixedAssets}`);
  add("interestBearingDebt", "Interest-bearing debt", input.results.interestBearingDebt, "Short-term + long-term bank debt", "currency", `${refs.bankLoanShortTerm}+${refs.bankLoanLongTerm}`);
  add("normalizedNoplat", "Normalized NOPLAT", input.results.normalizedNoplat, "EBIT x (1 - tax rate)", "currency", `${refs.ebit}*(1-${refs.taxRate})`);

  return { ...createSheet(rows, [24, 36, 18, 60]), refs };
}

function buildAamSheet(input: ValuationExcelExportInput, snapshotRefs: SheetRefs) {
  const rows: SheetRow[] = [["Asset Accumulation Method (AAM)"]];
  const refs: SheetRefs = {};
  const assetSum = appendAamLines(rows, "Asset adjustments", input.aamAdjustmentModel.assetLines);
  const liabilitySum = appendAamLines(rows, "Liability adjustments", input.aamAdjustmentModel.liabilityLines);

  rows.push([]);
  rows.push(["Equity reconciliation", "Value"]);
  input.aamAdjustmentModel.equityLines.forEach((line) => rows.push([line.label, numberCell(line.value, "currency")]));

  rows.push([]);
  rows.push(["AAM calculation", "Formula", "Value", "Note"]);
  appendMetricRow(rows, refs, "historicalAssets", "Historical assets", snapshotRefs.totalAssets, input.aamAdjustmentModel.historicalAssetTotal, "currency", "Input total assets or derived total assets from Snapshot.");
  appendMetricRow(rows, refs, "assetAdjustment", "Asset adjustment", assetSum, input.aamAdjustmentModel.assetAdjustmentTotal, "currency", "Sum of editable AAM asset adjustment cells.");
  appendMetricRow(rows, refs, "adjustedAssets", "Adjusted assets", `${refs.historicalAssets}+${refs.assetAdjustment}`, input.aamAdjustmentModel.adjustedAssetTotal, "currency", "Historical assets + asset adjustment.");
  appendMetricRow(rows, refs, "historicalLiabilities", "Historical liabilities", snapshotRefs.totalLiabilities, input.aamAdjustmentModel.historicalLiabilityTotal, "currency", "Input total liabilities or derived total liabilities from Snapshot.");
  appendMetricRow(rows, refs, "liabilityAdjustment", "Liability adjustment", liabilitySum, input.aamAdjustmentModel.liabilityAdjustmentTotal, "currency", "Sum of editable AAM liability adjustment cells.");
  appendMetricRow(rows, refs, "adjustedLiabilities", "Adjusted liabilities", `${refs.historicalLiabilities}+${refs.liabilityAdjustment}`, input.aamAdjustmentModel.adjustedLiabilityTotal, "currency", "Historical liabilities + liability adjustment.");
  appendMetricRow(rows, refs, "equityValue", "AAM equity value", `${refs.adjustedAssets}-${refs.adjustedLiabilities}`, input.results.aam.equityValue, "currency", "DLOM/DLOC/PFC are not applied in base AAM.");

  return { ...createSheet(rows, [26, 34, 22, 18, 18, 18, 54]), refs };
}

function buildEemSheet(input: ValuationExcelExportInput, snapshotRefs: SheetRefs) {
  const rows: SheetRow[] = [["Excess Earnings Method (EEM)"], [], ["Metric", "Formula", "Value", "Note"]];
  const refs: SheetRefs = {};
  const snapshot = input.snapshot;
  const operatingNwc = operatingWorkingCapital(snapshot);
  const netOperatingTangibleAssets = snapshot.fixedAssetsNet + operatingNwc;
  const requiredReturn = netOperatingTangibleAssets * snapshot.requiredReturnOnNta;
  const excessEarnings = input.results.normalizedNoplat - requiredReturn;
  const capitalizationRate = snapshot.wacc - snapshot.terminalGrowth;
  const capitalizedExcess = capitalizationRate > 0 ? excessEarnings / capitalizationRate : 0;
  const enterpriseValue = netOperatingTangibleAssets + capitalizedExcess;

  appendMetricRow(rows, refs, "operatingNwc", "Operating NWC", `(${snapshotRefs.accountReceivable}+${snapshotRefs.inventory})-(${snapshotRefs.accountPayable}+${snapshotRefs.otherPayable})`, operatingNwc, "currency", "Cash, deposit, employee receivable, tax payable, and debt are excluded.");
  appendMetricRow(rows, refs, "netOperatingTangibleAssets", "Net operating tangible assets", `${snapshotRefs.fixedAssetsNet}+${refs.operatingNwc}`, netOperatingTangibleAssets, "currency", "Fixed assets net + operating NWC.");
  appendMetricRow(rows, refs, "noplat", "Normalized NOPLAT", `${snapshotRefs.ebit}*(1-${snapshotRefs.taxRate})`, input.results.normalizedNoplat, "currency", "Commercial EBIT after statutory tax.");
  appendMetricRow(rows, refs, "requiredReturn", "Required return", `${refs.netOperatingTangibleAssets}*${snapshotRefs.requiredReturnOnNta}`, requiredReturn, "currency", "Return required on net tangible assets.");
  appendMetricRow(rows, refs, "excessEarnings", "Excess earnings", `${refs.noplat}-${refs.requiredReturn}`, excessEarnings, "currency", "NOPLAT - required return.");
  appendMetricRow(rows, refs, "capitalizationRate", "Capitalization rate", `${snapshotRefs.wacc}-${snapshotRefs.terminalGrowth}`, capitalizationRate, "percent", "WACC - terminal growth.");
  appendMetricRow(rows, refs, "capitalizedExcess", "Capitalized excess earnings", `IF(${refs.capitalizationRate}>0,${refs.excessEarnings}/${refs.capitalizationRate},0)`, capitalizedExcess, "currency", "Excess earnings / capitalization rate.");
  appendMetricRow(rows, refs, "enterpriseValue", "Enterprise value", `${refs.netOperatingTangibleAssets}+${refs.capitalizedExcess}`, enterpriseValue, "currency", "NTA + capitalized excess earnings.");
  appendMetricRow(rows, refs, "nonOperatingAssets", "Non-operating assets", snapshotRefs.nonOperatingAssets, input.results.nonOperatingAssets, "currency", "Surplus/non-operating assets added to equity bridge.");
  appendMetricRow(rows, refs, "interestBearingDebt", "Interest-bearing debt", snapshotRefs.interestBearingDebt, input.results.interestBearingDebt, "currency", "Interest-bearing debt deducted in EV-to-equity bridge.");
  appendMetricRow(rows, refs, "equityValue", "EEM equity value", `${refs.enterpriseValue}+${refs.nonOperatingAssets}-${refs.interestBearingDebt}`, input.results.eem.equityValue, "currency", "DLOM/DLOC/PFC are not applied in base EEM.");

  return { ...createSheet(rows, [32, 48, 18, 58]), refs };
}

function buildDcfSheet(input: ValuationExcelExportInput, snapshotRefs: SheetRefs) {
  const rows: SheetRow[] = [
    ["Discounted Cash Flow (DCF)"],
    [],
    ["Forecast year", "Revenue", "COGS", "GA", "Depreciation", "EBIT", "NOPLAT", "AR", "Inventory", "AP", "Other payable", "Operating NWC", "Change in NWC", "FCFF", "Discount factor", "PV FCFF"],
  ];
  const refs: SheetRefs = {};
  const forecast = input.results.dcf.forecast;
  const forecastStart = rows.length;
  let previousRevenue = snapshotRefs.revenue;
  let previousNwc = snapshotRefs.operatingWorkingCapital;

  forecast.forEach((row, index) => {
    const rowIndex = rows.length;
    const revenueRef = localCell(rowIndex, 1);
    const cogsRef = localCell(rowIndex, 2);
    const gaRef = localCell(rowIndex, 3);
    const depreciationRef = localCell(rowIndex, 4);
    const ebitRef = localCell(rowIndex, 5);
    const noplatRef = localCell(rowIndex, 6);
    const arRef = localCell(rowIndex, 7);
    const inventoryRef = localCell(rowIndex, 8);
    const apRef = localCell(rowIndex, 9);
    const otherPayableRef = localCell(rowIndex, 10);
    const nwcRef = localCell(rowIndex, 11);
    const changeNwcRef = localCell(rowIndex, 12);
    const fcfRef = localCell(rowIndex, 13);
    const discountFactorRef = localCell(rowIndex, 14);

    rows.push([
      row.year,
      formulaCell(`${previousRevenue}*(1+${snapshotRefs.revenueGrowth})`, row.revenue, "currency"),
      formulaCell(`${revenueRef}*${snapshotRefs.cogsMargin}`, row.revenue * input.snapshot.cogsMargin, "currency"),
      formulaCell(`${revenueRef}*${snapshotRefs.gaMargin}`, row.revenue * input.snapshot.gaMargin, "currency"),
      formulaCell(`${revenueRef}*${snapshotRefs.depreciationMargin}`, row.revenue * input.snapshot.depreciationMargin, "currency"),
      formulaCell(`${revenueRef}-${cogsRef}-${gaRef}-${depreciationRef}`, row.ebit, "currency"),
      formulaCell(`${ebitRef}*(1-${snapshotRefs.taxRate})`, row.noplat, "currency"),
      formulaCell(`${revenueRef}*${snapshotRefs.arDays}/365`, (row.revenue * input.snapshot.arDays) / 365, "currency"),
      formulaCell(`${cogsRef}*${snapshotRefs.inventoryDays}/365`, (row.revenue * input.snapshot.cogsMargin * input.snapshot.inventoryDays) / 365, "currency"),
      formulaCell(`${cogsRef}*${snapshotRefs.apDays}/365`, (row.revenue * input.snapshot.cogsMargin * input.snapshot.apDays) / 365, "currency"),
      formulaCell(`${gaRef}*${snapshotRefs.otherPayableDays}/365`, (row.revenue * input.snapshot.gaMargin * input.snapshot.otherPayableDays) / 365, "currency"),
      formulaCell(`${arRef}+${inventoryRef}-${apRef}-${otherPayableRef}`, row.operatingNwc, "currency"),
      formulaCell(`${nwcRef}-${previousNwc}`, row.changeInNwc, "currency"),
      formulaCell(`${noplatRef}+${depreciationRef}-${depreciationRef}-${changeNwcRef}`, row.freeCashFlow, "currency"),
      formulaCell(`1/POWER(1+${snapshotRefs.wacc},${index + 1})`, row.discountFactor, "number"),
      formulaCell(`${fcfRef}*${discountFactorRef}`, row.presentValue, "currency"),
    ]);

    previousRevenue = localCell(rowIndex, 1);
    previousNwc = localCell(rowIndex, 11);
  });

  const pvRange = `${localCell(forecastStart, 15)}:${localCell(rows.length - 1, 15)}`;
  const finalFcfRef = localCell(rows.length - 1, 13);
  rows.push([]);
  rows.push(["DCF calculation", "Formula", "Value", "Note"]);
  appendMetricRow(rows, refs, "explicitPv", "PV explicit FCFF", `SUM(${pvRange})`, input.results.dcf.forecast.reduce((sum, row) => sum + row.presentValue, 0), "currency", "Sum of present value of explicit forecast FCFF.");
  appendMetricRow(rows, refs, "terminalValue", "Terminal value", `IF(${snapshotRefs.wacc}>${snapshotRefs.terminalGrowth},${finalFcfRef}*(1+${snapshotRefs.terminalGrowth})/(${snapshotRefs.wacc}-${snapshotRefs.terminalGrowth}),0)`, terminalValue(input.snapshot, input.results.dcf.forecast.at(-1)?.freeCashFlow ?? 0), "currency", "Gordon growth model.");
  appendMetricRow(rows, refs, "terminalPv", "PV terminal value", `${refs.terminalValue}/POWER(1+${snapshotRefs.wacc},5)`, terminalPv(input.snapshot, input.results.dcf.forecast.at(-1)?.freeCashFlow ?? 0), "currency", "Discounted terminal value.");
  appendMetricRow(rows, refs, "enterpriseValue", "Enterprise value", `${refs.explicitPv}+${refs.terminalPv}`, input.results.dcf.equityValue - input.results.nonOperatingAssets + input.results.interestBearingDebt, "currency", "Explicit PV + terminal PV.");
  appendMetricRow(rows, refs, "nonOperatingAssets", "Non-operating assets", snapshotRefs.nonOperatingAssets, input.results.nonOperatingAssets, "currency", "Added to equity bridge.");
  appendMetricRow(rows, refs, "interestBearingDebt", "Interest-bearing debt", snapshotRefs.interestBearingDebt, input.results.interestBearingDebt, "currency", "Deducted in EV-to-equity bridge.");
  appendMetricRow(rows, refs, "equityValue", "DCF equity value", `${refs.enterpriseValue}+${refs.nonOperatingAssets}-${refs.interestBearingDebt}`, input.results.dcf.equityValue, "currency", "DLOM/DLOC/PFC are not applied in base DCF.");

  rows.push([]);
  rows.push(["Sensitivity", "Value", "Source"]);
  rows.push(["DCF terminal downside", numberCell(input.results.sensitivities.dcfTerminalDownside.equityValue, "currency"), "Terminal growth downside"]);
  rows.push(["DCF terminal upside", numberCell(input.results.sensitivities.dcfTerminalUpside.equityValue, "currency"), "Terminal growth upside"]);
  rows.push(["DCF no incremental working capital", numberCell(input.results.sensitivities.dcfNoIncrementalWorkingCapital.equityValue, "currency"), "Working capital change disabled"]);
  rows.push(["DCF tax payable debt-like", numberCell(input.results.sensitivities.dcfTaxPayableDebtLike.equityValue, "currency"), "Tax payable deducted as debt-like sensitivity"]);

  return { ...createSheet(rows, [14, 18, 16, 16, 16, 16, 16, 16, 16, 16, 16, 18, 18, 18, 14, 18]), refs };
}

function buildDlomDlocSheet(input: ValuationExcelExportInput) {
  const rows: SheetRow[] = [
    ["DLOM Summary", "Formula / Source", "Value", "Note"],
    ["Company marketability", "Derived from company type", input.dlomCalculation.companyMarketability || "-", input.dlomCalculation.companyMarketabilitySource],
    ["Interest basis", "Derived from ownership type or override", input.dlomCalculation.interestBasis || "-", input.dlomCalculation.interestBasisSource],
    ["Range min", "DLOM range", numberCell(input.dlomCalculation.rangeMin, "percent"), input.dlomCalculation.rangeLabel],
    ["Range max", "DLOM range", numberCell(input.dlomCalculation.rangeMax, "percent"), input.dlomCalculation.rangeLabel],
    ["Range spread", "Range max - range min", formulaCell("C5-C4", input.dlomCalculation.rangeSpread, "percent"), ""],
    ["Total score", "SUM factor scores", numberCell(input.dlomCalculation.totalScore, "number"), ""],
    ["Max score", "Number of factors", input.dlomCalculation.maxScore, ""],
    ["Answered count", 'COUNTIF factor status = "answered"', input.dlomCalculation.factors.filter((factor) => factor.status === "answered").length, ""],
    ["Status", "Derived completeness", input.dlomCalculation.status, input.dlomCalculation.taxpayerResistance],
    ["DLOM rate", "IF(answered count = max score, range min + total score / max score x range spread, 0)", formulaCell("IF(C9=C8,C4+(C7/C8)*C6,0)", input.dlomCalculation.dlomRate, "percent"), "Base valuation methods are before DLOM."],
    [],
    ["DLOM Factors", "Answer", "Score", "Status", "Recommendation", "Evidence / Override"],
    ...input.dlomCalculation.factors.map((factor): SheetRow => [
      `${factor.no}. ${factor.factor}`,
      factor.answer,
      numberCell(factor.score, "number"),
      factor.status,
      factor.recommendation.answer || "-",
      factor.isOverride ? `Override dari rekomendasi. Evidence: ${factor.recommendation.evidence}` : factor.recommendation.evidence,
    ]),
    [],
    ["DLOC/PFC Summary", "Formula / Source", "Value", "Note"],
    ["Company basis", "Derived from company type", input.dlocPfcCalculation.companyBasis || "-", ""],
    ["Adjustment type", "Minoritas = DLOC; Mayoritas = PFC", input.dlocPfcCalculation.adjustmentType || "-", ""],
    ["Range min", "DLOC/PFC range", numberCell(input.dlocPfcCalculation.rangeMin, "percent"), input.dlocPfcCalculation.rangeLabel],
    ["Range max", "DLOC/PFC range", numberCell(input.dlocPfcCalculation.rangeMax, "percent"), input.dlocPfcCalculation.rangeLabel],
    ["Range spread", "Range max - range min", formulaCell("C25-C24", input.dlocPfcCalculation.rangeSpread, "percent"), ""],
    ["Total score", "SUM factor scores", numberCell(input.dlocPfcCalculation.totalScore, "number"), ""],
    ["Max score", "Number of factors", input.dlocPfcCalculation.maxScore, ""],
    ["Unsigned rate", "IF(complete, range min + total score / max score x range spread, 0)", formulaCell("IF(C28>0,C24+(C27/C28)*C26,0)", input.dlocPfcCalculation.unsignedRate, "percent"), input.dlocPfcCalculation.status],
    ["Signed rate", 'IF(adjustment type = "PFC", -unsigned rate, unsigned rate)', formulaCell('IF(C23="PFC",-C29,C29)', input.dlocPfcCalculation.signedRate, "percent"), "Signed rate used in tax simulation."],
    ["Adjustment multiplier", "-Signed rate", formulaCell("-C30", input.dlocPfcCalculation.adjustmentMultiplier, "percent"), input.dlocPfcCalculation.taxpayerResistance],
    [],
    ["DLOC/PFC Factors", "Answer", "Score", "Status", "Override Reason", "Evidence Basis"],
    ...input.dlocPfcCalculation.factors.map((factor): SheetRow => [
      `${factor.no}. ${factor.factor}`,
      factor.answer,
      numberCell(factor.score, "number"),
      factor.status,
      factor.overrideReason,
      factor.evidenceBasis,
    ]),
  ];

  return createSheet(rows, [34, 28, 18, 16, 28, 54]);
}

function buildTaxSimulationSheet(input: ValuationExcelExportInput, methodRefs: MethodRefs) {
  const rows: SheetRow[] = [
    ["Basis", "Method", "Primary", "Base Equity", "DLOM Rate", "DLOM Adjustment", "Value After DLOM", "DLOC/PFC Rate", "DLOC/PFC Adjustment", "Market Value 100%", "Share %", "Transferred Interest", "Reported Value", "Difference", "Taxable Difference", "Taxable Rounded", "Potential Tax", "Effective Tax Rate", "Tax Year", "Tax Source"],
  ];
  const refs: SheetRefs = {};
  const allRows = [...input.taxSimulationResult.baselineRows, ...input.taxSimulationResult.scenarioRows];

  allRows.forEach((row) => {
    const rowIndex = rows.length;
    const baseRef = localCell(rowIndex, 3);
    const dlomRateRef = localCell(rowIndex, 4);
    const dlomAdjRef = localCell(rowIndex, 5);
    const afterDlomRef = localCell(rowIndex, 6);
    const dlocRateRef = localCell(rowIndex, 7);
    const dlocAdjRef = localCell(rowIndex, 8);
    const marketValueRef = localCell(rowIndex, 9);
    const shareRef = localCell(rowIndex, 10);
    const transferredRef = localCell(rowIndex, 11);
    const reportedRef = localCell(rowIndex, 12);
    const differenceRef = localCell(rowIndex, 13);
    const taxableRef = localCell(rowIndex, 14);
    const roundedRef = localCell(rowIndex, 15);
    const effectiveRateRef = localCell(rowIndex, 17);
    const isFinalPrimary = row.basis === input.taxSimulationResult.finalBasis && row.method === input.taxSimulationResult.primaryMethod;

    if (isFinalPrimary) {
      refs.primaryPotentialTax = sheetCell("10_Tax_Simulation", rowIndex, 16);
      refs.primaryTransferredInterest = sheetCell("10_Tax_Simulation", rowIndex, 11);
    }

    rows.push([
      row.basisLabel,
      row.method,
      isFinalPrimary ? "Final primary" : row.isPrimary ? "Primary alternate basis" : "",
      formulaCell(methodRefs[row.method], row.baseEquityValue, "currency"),
      numberCell(row.dlomRate, "percent"),
      formulaCell(`-${baseRef}*${dlomRateRef}`, row.dlomAdjustment, "currency"),
      formulaCell(`${baseRef}+${dlomAdjRef}`, row.valueAfterDlom, "currency"),
      numberCell(row.dlocPfcRate, "percent"),
      formulaCell(`-${afterDlomRef}*${dlocRateRef}`, row.dlocPfcAdjustment, "currency"),
      formulaCell(`${afterDlomRef}+${dlocAdjRef}`, row.marketValueOfEquity100, "currency"),
      numberCell(row.sharePercentage, "percent"),
      formulaCell(`${marketValueRef}*${shareRef}`, row.marketValueOfTransferredInterest, "currency"),
      numberCell(row.reportedTransferValue, "currency"),
      formulaCell(`${transferredRef}-${reportedRef}`, row.transferValueDifference, "currency"),
      formulaCell(`MAX(0,${differenceRef})`, row.potentialTaxableDifference, "currency"),
      formulaCell(`FLOOR(${taxableRef},1000)`, row.taxableIncomeRounded, "currency"),
      formulaCell(`${roundedRef}*${effectiveRateRef}`, row.potentialTax, "currency"),
      numberCell(row.effectiveTaxRate, "percent"),
      row.appliedTaxYear ?? "",
      row.taxSourceLegalBasis || row.taxBasisLabel,
    ]);
  });

  rows.push([]);
  rows.push(["Tax Brackets", "Basis", "Method", "Bracket", "Rate", "Taxable Amount", "Tax"]);
  allRows.forEach((methodRow) => {
    methodRow.taxBrackets.forEach((bracket) => {
      rows.push([
        "",
        methodRow.basisLabel,
        methodRow.method,
        bracket.label,
        numberCell(bracket.rate, "percent"),
        numberCell(bracket.taxableAmount, "currency"),
        numberCell(bracket.tax, "currency"),
      ]);
    });
  });

  return { ...createSheet(rows, [20, 10, 18, 18, 12, 18, 18, 14, 18, 18, 12, 20, 18, 18, 18, 18, 18, 14, 12, 48]), refs };
}

function buildSectionAnalysisSheet(input: ValuationExcelExportInput) {
  const periods = input.sectionAnalysis.periods;
  const rows: SheetRow[] = [["Section", "Key", "Label", "Source", "Formula", ...periods.map((period) => period.label), "Note"]];
  const appendRows = (section: string, analysisRows: SectionAnalysis["payablesRows"]) => {
    analysisRows.forEach((row) => {
      rows.push([
        section,
        row.key,
        row.label,
        row.source,
        row.formula,
        ...periods.map((period) => analysisValueCell(row.values[period.id] ?? null)),
        row.note || row.kind || "",
      ]);
    });
  };

  appendRows("Payables", input.sectionAnalysis.payablesRows);
  appendRows("Cash Flow", input.sectionAnalysis.cashFlowRows);
  appendRows("NOPLAT", input.sectionAnalysis.noplatRows);
  appendRows("FCF", input.sectionAnalysis.fcfRows);
  appendRows("ROIC", input.sectionAnalysis.roicRows);
  input.sectionAnalysis.ratioRows.forEach((row) => {
    rows.push([
      "Ratios",
      row.key,
      row.label,
      row.source,
      row.formula,
      ...periods.map((period) => analysisValueCell(row.values[period.id] ?? null, row.display === "percent" ? "percent" : "number")),
      row.note || `Average: ${row.average ?? "n/a"}`,
    ]);
  });

  return createSheet(rows, [18, 22, 34, 34, 48, ...periods.map(() => 16), 42]);
}

function buildAuditTraceSheet(input: ValuationExcelExportInput) {
  const rows: SheetRow[] = [["Section", "Type", "Label", "Formula / Status", "Value", "Note / Detail"]];
  const appendTrace = (section: string, trace: FormulaTrace) => {
    rows.push([section, "Formula trace", trace.label, trace.formula, numberCell(trace.value, trace.valueFormat === "percent" ? "percent" : trace.valueFormat === "number" ? "number" : "currency"), trace.note]);
  };

  input.results.aam.traces.forEach((trace) => appendTrace("AAM", trace));
  input.results.eem.traces.forEach((trace) => appendTrace("EEM", trace));
  input.results.dcf.traces.forEach((trace) => appendTrace("DCF", trace));
  input.dlomCalculation.traces.forEach((trace) => appendTrace("DLOM", trace));
  input.dlocPfcCalculation.traces.forEach((trace) => appendTrace("DLOC/PFC", trace));
  input.taxSimulationResult.rows.forEach((row) => row.traces.forEach((trace) => appendTrace(`Tax Simulation ${row.basisLabel} ${row.method}`, trace)));

  Object.values(input.readiness).forEach((section) => {
    rows.push([section.title, "Readiness", "Section readiness", section.isReady ? "Ready" : "Needs input", section.isReady ? 1 : 0, ""]);
    section.missing.forEach((item) => rows.push([section.title, "Missing", item.label, item.targetLabel, "", item.detail || ""]));
    section.warnings.forEach((item) => rows.push([section.title, "Warning", item.label, item.targetLabel, "", item.detail || ""]));
  });

  input.validationChecks.forEach((check) => rows.push(["Validation", "Check", check.label, check.ok ? "OK" : "Needs review", check.ok ? 1 : 0, ""]));
  input.taxSimulationResult.warnings.forEach((warning) => rows.push(["Tax Simulation", "Warning", warning, "Needs review", "", ""]));

  return createSheet(rows, [24, 18, 38, 58, 18, 68]);
}

function appendAamLines(rows: SheetRow[], title: string, lines: AamAdjustmentLine[]): string {
  rows.push([]);
  rows.push([title]);
  rows.push(["Section", "Line", "Source", "Historical", "Adjustment", "Adjusted", "Note", "Review"]);
  const firstLineRow = rows.length;

  lines.forEach((line) => {
    const rowIndex = rows.length;
    const historicalRef = localCell(rowIndex, 3);
    const adjustmentRef = localCell(rowIndex, 4);
    rows.push([
      line.section,
      line.label,
      line.source,
      numberCell(line.historical, "currency"),
      numberCell(line.adjustment, "currency"),
      formulaCell(`${historicalRef}+${adjustmentRef}`, line.adjusted, "currency"),
      line.note,
      line.requiresNote ? "Needs note" : "OK",
    ]);
  });

  const lastLineRow = rows.length - 1;
  rows.push([
    "Total",
    title,
    "",
    formulaCell(`SUM(${localCell(firstLineRow, 3)}:${localCell(lastLineRow, 3)})`, lines.reduce((sum, line) => sum + line.historical, 0), "currency"),
    formulaCell(`SUM(${localCell(firstLineRow, 4)}:${localCell(lastLineRow, 4)})`, lines.reduce((sum, line) => sum + line.adjustment, 0), "currency"),
    formulaCell(`SUM(${localCell(firstLineRow, 5)}:${localCell(lastLineRow, 5)})`, lines.reduce((sum, line) => sum + line.adjusted, 0), "currency"),
    "",
    "",
  ]);

  return sheetCell("06_AAM", rows.length - 1, 4);
}

function appendMetricRow(
  rows: SheetRow[],
  refs: SheetRefs,
  key: string,
  label: string,
  formula: string,
  value: number,
  format: "currency" | "percent" | "number",
  note: string,
) {
  const rowIndex = rows.length;
  refs[key] = sheetCell(currentSheetNameFromRows(rows), rowIndex, 2);
  rows.push([label, formula, formulaCell(formula, value, format), note]);
}

function currentSheetNameFromRows(rows: SheetRow[]): string {
  const title = rows[0]?.[0];

  if (title === "Asset Accumulation Method (AAM)") {
    return "06_AAM";
  }

  if (title === "Excess Earnings Method (EEM)") {
    return "07_EEM";
  }

  if (title === "Discounted Cash Flow (DCF)") {
    return "08_DCF";
  }

  return "05_Snapshot";
}

function terminalValue(snapshot: FinancialStatementSnapshot, finalFcf: number): number {
  const denominator = snapshot.wacc - snapshot.terminalGrowth;

  return denominator > 0 ? (finalFcf * (1 + snapshot.terminalGrowth)) / denominator : 0;
}

function terminalPv(snapshot: FinancialStatementSnapshot, finalFcf: number): number {
  return snapshot.wacc > -1 ? terminalValue(snapshot, finalFcf) / Math.pow(1 + snapshot.wacc, 5) : 0;
}

function analysisValueCell(value: number | null, format: "currency" | "percent" | "number" = "currency"): SheetCell {
  return value === null || !Number.isFinite(value) ? "" : numberCell(value, format);
}

function formulaCell(formula: string, value: number, format: "currency" | "percent" | "number" = "currency"): XLSX.CellObject {
  return {
    t: "n",
    f: formula,
    v: finiteNumber(value),
    z: format === "percent" ? percentFormat : format === "number" ? numberFormat : currencyFormat,
  };
}

function numberCell(value: number, format: "currency" | "percent" | "number" = "currency"): XLSX.CellObject {
  return {
    t: "n",
    v: finiteNumber(value),
    z: format === "percent" ? percentFormat : format === "number" ? numberFormat : format === "currency" ? currencyFormat : integerFormat,
  };
}

function finiteNumber(value: number): number {
  return Number.isFinite(value) ? value : 0;
}

function createSheet(rows: SheetRow[], widths: number[]) {
  const worksheet = XLSX.utils.aoa_to_sheet(rows);
  worksheet["!cols"] = widths.map((wch) => ({ wch }));

  return { worksheet };
}

function appendSheet(workbook: XLSX.WorkBook, name: string, worksheet: XLSX.WorkSheet) {
  XLSX.utils.book_append_sheet(workbook, worksheet, name);
}

function localCell(rowIndex: number, columnIndex: number): string {
  return XLSX.utils.encode_cell({ r: rowIndex, c: columnIndex });
}

function sheetCell(sheetName: string, rowIndex: number, columnIndex: number): string {
  return `'${sheetName}'!$${XLSX.utils.encode_col(columnIndex)}$${rowIndex + 1}`;
}

function buildWorkbookFilename(companyName: string, exportedAt: Date): string {
  const datePart = exportedAt.toISOString().slice(0, 10);
  const companyPart = slugify(companyName || "penilaian-valuasi-bisnis");

  return `${companyPart}-valuation-export-${datePart}.xlsx`;
}

function slugify(value: string): string {
  const slug = value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

  return slug || "penilaian-valuasi-bisnis";
}

function typedEntries<T extends Record<string, string>>(value: T): Array<[keyof T, string]> {
  return Object.entries(value) as Array<[keyof T, string]>;
}

function readableCategory(category: string): string {
  return categoryLabelMap.get(category as never) ?? category;
}
