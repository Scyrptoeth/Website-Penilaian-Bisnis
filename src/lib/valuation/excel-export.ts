import * as XLSX from "xlsx";
import { interestBearingDebt, operatingWorkingCapital } from "./calculations";
import { calculateWaccAssumption, type WaccCalculation } from "./assumption-calculators";
import { categoryLabelMap } from "./category-options";
import { getPeriodYearOffset, parseInputNumber, statementLabels, type AccountRow, type AssumptionState, type CaseProfile, type CaseProfileDerived, type FixedAssetScheduleRow, type FixedAssetScheduleSummary, type MappedRow, type Period } from "./case-model";
import { valuationDriverGovernancePolicy } from "./valuation-driver-governance-policy";
import { formatKluOptionLabel, getKluSectorRecord } from "./klu-sector";
import { applyBlueFontToXlsxCells, prepareXlsxForExcelRecalculation, type XlsxCellRef } from "./xlsx-style-patcher";
import type { AamAdjustmentLine, AamAdjustmentModel } from "./aam-adjustments";
import type { DlocPfcCalculation } from "./dloc-pfc";
import type { DlomCalculation } from "./dlom";
import type { SectionAnalysis } from "./section-analysis";
import type { TaxSimulationResult, TaxSimulationState } from "./tax-simulation";
import type { AccountCategory, FinancialStatementSnapshot, FormulaTrace, ValuationMethod } from "./types";
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
  sourceOriginEntries?: TemplateOriginEntry[];
  blueCells?: XlsxCellRef[];
};

type SheetCell = string | number | boolean | null | XLSX.CellObject;
type SheetRow = SheetCell[];
type SheetRefs = Record<string, string>;
type MethodRefs = Record<ValuationMethod, string>;
type TemplateSourceOrigin = "website-sourced" | "web-derived" | "template-default" | "template-formula" | "deferred/unmapped";
type TemplatePatchStatus = "mapped" | "formula-neutralized" | "formula-corrected" | "cached-formula";
type TemplateCellStatus = TemplatePatchStatus | "template-default" | "template-formula" | "deferred/unmapped";
type TemplateFontMark = "default" | "blue";

type TemplateOriginEntry = {
  sheet: string;
  cell: string;
  label: string;
  value: string | number;
  source: string;
  status: TemplateCellStatus;
  previousFormula: string;
  sourceOrigin: TemplateSourceOrigin;
  fontMark: TemplateFontMark;
};

type TemplatePatch = TemplateOriginEntry & {
  status: TemplatePatchStatus;
};

type TemplateUnmapped = {
  field: string;
  value: string | number;
  reason: string;
};

const currencyFormat = '#,##0;[Red](#,##0);"-"';
const numberFormat = '#,##0.00;[Red](#,##0.00);"-"';
const integerFormat = '#,##0;[Red](#,##0);"-"';
const percentFormat = '0.00%;[Red](0.00%);"-"';
const templateWorkbookUrl = "/templates/kkp-saham-final-account-category-review-update.xlsx";

const caseProfileLabels: Record<keyof CaseProfile, string> = {
  objectTaxpayerName: "Nama Wajib Pajak Objek",
  objectBusinessKlu: "KLU sesuai Appportal",
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

export function buildValuationTemplateWorkbook(input: ValuationExcelExportInput, templateData: ArrayBuffer | Uint8Array): WorkbookBuild {
  const exportedAt = input.exportedAt ?? new Date();
  const workbook = XLSX.read(templateData, { type: "array", cellFormula: true, cellStyles: true, cellNF: true });
  const patches: TemplatePatch[] = [];
  const unmapped: TemplateUnmapped[] = [];

  workbook.Props = {
    ...(workbook.Props ?? {}),
    Title: "Penilaian Valuasi Bisnis Export XLSX V2",
    Subject: "Full template clone generated from active website state",
    Author: "Penilaian Bisnis II",
    Company: input.caseProfile.objectTaxpayerName || "Penilaian Bisnis II",
    CreatedDate: exportedAt,
  };

  patchHomeSheet(workbook, input, patches);
  patchFixedAssetTemplateSheet(workbook, input, patches, unmapped);
  patchBalanceSheetTemplateSheet(workbook, input, patches);
  patchIncomeStatementTemplateSheet(workbook, input, patches);
  patchKeyDriversTemplateSheet(workbook, input, patches, unmapped);
  patchWaccTemplateSheet(workbook, input, patches);
  patchDiscountRateTemplateSheet(workbook, input, patches, unmapped);
  patchDlomTemplateSheet(workbook, input, patches);
  patchDlocPfcTemplateSheet(workbook, input, patches);
  patchTaxSimulationTemplateSheet(workbook, input, patches);
  patchTemplateAssumptionSheets(workbook, input, patches);
  patchAamTemplateSheet(workbook, input, patches);
  patchTemplateFormulaCaches(workbook, input, patches);
  recordDeferredHighImpactTemplateGaps(input, unmapped);
  const sourceOriginEntries = buildTemplateOriginEntries(workbook, patches);
  const blueCells = sourceOriginEntries
    .filter((entry) => entry.fontMark === "blue")
    .map((entry): XlsxCellRef => ({ sheet: entry.sheet, cell: entry.cell }));

  appendTemplateAuditSheet(workbook, input, sourceOriginEntries, unmapped, exportedAt);

  return {
    workbook,
    filename: buildTemplateWorkbookFilename(input.caseProfile.objectTaxpayerName, exportedAt),
    sourceOriginEntries,
    blueCells,
  };
}

export function writeValuationTemplateWorkbook(input: ValuationExcelExportInput, templateData: ArrayBuffer | Uint8Array) {
  const build = buildValuationTemplateWorkbook(input, templateData);
  const workbookData = XLSX.write(build.workbook, { bookType: "xlsx", compression: true, type: "array", cellStyles: true }) as ArrayBuffer;
  const recalculationReadyData = prepareXlsxForExcelRecalculation(workbookData);
  const data = applyBlueFontToXlsxCells(recalculationReadyData, build.blueCells ?? []);

  return {
    ...build,
    data,
  };
}

export async function downloadValuationTemplateWorkbook(input: ValuationExcelExportInput): Promise<void> {
  const response = await fetch(templateWorkbookUrl);

  if (!response.ok) {
    throw new Error(`Template workbook tidak bisa dimuat (${response.status}).`);
  }

  const templateData = await response.arrayBuffer();
  const { data, filename } = writeValuationTemplateWorkbook(input, templateData);

  downloadXlsxBytes(data, filename);
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
  const kluRecord = getKluSectorRecord(input.caseProfile.objectBusinessKlu);
  const rows: SheetRow[] = [
    ["Field", "Input Value", "Derived / Status", "Source"],
    ["Exported at", exportedAt.toISOString(), "", "System"],
    ...typedEntries(input.caseProfile)
      .filter(([key]) => key !== "objectTaxpayerNpwp")
      .map(([key, value]): SheetRow => [
        caseProfileLabels[key],
        value,
        key === "objectBusinessKlu" && kluRecord ? `${kluRecord.title} | ${kluRecord.confidence}` : "",
        key === "companySector" ? "Derived from selected KLU" : "User input",
      ]),
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

function patchHomeSheet(workbook: XLSX.WorkBook, input: ValuationExcelExportInput, patches: TemplatePatch[]) {
  const profile = input.caseProfile;
  const kluRecord = getKluSectorRecord(profile.objectBusinessKlu);
  const kluLabel = kluRecord ? formatKluOptionLabel(kluRecord) : profile.objectBusinessKlu;

  writeTemplateCell(workbook, patches, "HOME", "B4", profile.objectTaxpayerName, "Nama Objek Pajak", "Case profile");
  writeTemplateCell(workbook, patches, "HOME", "A5", "KLU sesuai Appportal", "KLU label", "Case profile");
  writeTemplateCell(workbook, patches, "HOME", "B5", kluLabel, "KLU sesuai Appportal", "Case profile");
  writeTemplateCell(workbook, patches, "HOME", "B6", profile.companySector, "Sektor Perusahaan", "Case profile");
  writeTemplateCell(workbook, patches, "HOME", "B7", profile.companyType, "Jenis Perusahaan", "Case profile");
  writeTemplateCell(workbook, patches, "HOME", "B9", profile.subjectTaxpayerName, "Nama Subjek Pajak", "Case profile");
  writeTemplateCell(workbook, patches, "HOME", "B10", profile.subjectTaxpayerNpwp, "NPWP Subjek Pajak", "Case profile");
  writeTemplateCell(workbook, patches, "HOME", "B11", profile.subjectTaxpayerType, "Jenis Subjek Pajak", "Case profile");
  writeTemplateCell(workbook, patches, "HOME", "B12", profile.shareOwnershipType, "Jenis Kepemilikan Saham", "Case profile");
  writeTemplateCell(workbook, patches, "HOME", "B14", profile.transferType, "Jenis Peralihan", "Case profile");
  writeTemplateCell(workbook, patches, "HOME", "B15", parseInputNumber(profile.capitalBaseFull), "Capital base 100%", "Case profile");
  writeTemplateCell(workbook, patches, "HOME", "B16", parseInputNumber(profile.capitalBaseValued), "Capital base valued", "Case profile");
  writeTemplateCell(workbook, patches, "HOME", "B19", parseInputNumber(profile.transactionYear), "Tahun Transaksi Pengalihan", "Case profile");
  writeTemplateCell(workbook, patches, "HOME", "B22", profile.valuationObject, "Objek Penilaian", "Case profile");
}

function patchFixedAssetTemplateSheet(
  workbook: XLSX.WorkBook,
  input: ValuationExcelExportInput,
  patches: TemplatePatch[],
  unmapped: TemplateUnmapped[],
) {
  const templateRows = [
    { key: "land", label: "Land", acquisitionBeginningRow: 8, acquisitionAdditionsRow: 17, depreciationBeginningRow: 36, depreciationAdditionsRow: 45 },
    { key: "building", label: "Building", acquisitionBeginningRow: 9, acquisitionAdditionsRow: 18, depreciationBeginningRow: 37, depreciationAdditionsRow: 46 },
    { key: "equipment", label: "Equipment, Laboratory, & Machinery", acquisitionBeginningRow: 10, acquisitionAdditionsRow: 19, depreciationBeginningRow: 38, depreciationAdditionsRow: 47 },
    { key: "vehicle", label: "Vehicle & Heavy Equipment", acquisitionBeginningRow: 11, acquisitionAdditionsRow: 20, depreciationBeginningRow: 39, depreciationAdditionsRow: 48 },
    { key: "officeInventory", label: "Office Inventory", acquisitionBeginningRow: 12, acquisitionAdditionsRow: 21, depreciationBeginningRow: 40, depreciationAdditionsRow: 49 },
    { key: "electrical", label: "Electrical", acquisitionBeginningRow: 13, acquisitionAdditionsRow: 22, depreciationBeginningRow: 41, depreciationAdditionsRow: 50 },
  ] as const;
  const matchedRowIds = new Set<string>();

  templateRows.forEach((templateRow) => {
    const scheduleRow = input.fixedAssetSchedule.rows.find((item) => matchesTemplateAssetClass(item.row.assetName, templateRow.key));

    if (!scheduleRow) {
      return;
    }

    matchedRowIds.add(scheduleRow.row.id);
    [
      templateRow.acquisitionBeginningRow,
      templateRow.acquisitionAdditionsRow,
      templateRow.acquisitionBeginningRow + 18,
      templateRow.depreciationBeginningRow,
      templateRow.depreciationAdditionsRow,
      templateRow.depreciationBeginningRow + 18,
      templateRow.depreciationBeginningRow + 27,
    ].forEach((rowNumber) => {
      writeTemplateCell(workbook, patches, "FIXED ASSET", `B${rowNumber}`, scheduleRow.row.assetName || templateRow.label, `${templateRow.label} class label`, "Fixed asset schedule");
    });

    input.periods.forEach((period) => {
      const column = templateColumnForPeriod(period);

      if (!column) {
        return;
      }

      const amounts = scheduleRow.amounts[period.id];

      if (!amounts) {
        return;
      }

      const source = `Fixed asset schedule: ${scheduleRow.row.assetName || templateRow.label} / ${period.label}`;

      if (getPeriodYearOffset(period) === -2) {
        writeTemplateCell(workbook, patches, "FIXED ASSET", `${column}${templateRow.acquisitionBeginningRow}`, amounts.acquisitionBeginning, `${templateRow.label} acquisition beginning`, source);
        writeTemplateCell(workbook, patches, "FIXED ASSET", `${column}${templateRow.depreciationBeginningRow}`, amounts.depreciationBeginning, `${templateRow.label} depreciation beginning`, source);
      }

      writeTemplateCell(workbook, patches, "FIXED ASSET", `${column}${templateRow.acquisitionAdditionsRow}`, amounts.acquisitionAdditions, `${templateRow.label} acquisition additions`, source);
      writeTemplateCell(workbook, patches, "FIXED ASSET", `${column}${templateRow.depreciationAdditionsRow}`, amounts.depreciationAdditions, `${templateRow.label} depreciation additions`, source);
    });
  });

  input.fixedAssetSchedule.rows.forEach((item) => {
    if (!matchedRowIds.has(item.row.id)) {
      unmapped.push({
        field: `Fixed asset class: ${item.row.assetName || item.row.id}`,
        value: input.periods.map((period) => `${period.label} net=${item.amounts[period.id]?.netValue ?? 0}`).join("; "),
        reason: "No clear matching fixed asset class row in template V2.",
      });
    }
  });

  if (!input.fixedAssetSchedule.hasInput && input.snapshot.fixedAssetsNet !== 0) {
    unmapped.push({
      field: "Direct fixed asset net value",
      value: input.snapshot.fixedAssetsNet,
      reason: "Template V2 expects fixed asset roll-forward components; direct net fixed asset rows are not enough to safely patch the schedule.",
    });
  }
}

function patchBalanceSheetTemplateSheet(workbook: XLSX.WorkBook, input: ValuationExcelExportInput, patches: TemplatePatch[]) {
  const rows: Array<{ row: number; label: string; categories: AccountCategory[]; absolute?: boolean }> = [
    { row: 8, label: "Cash on Hands", categories: ["CASH_ON_HAND"], absolute: true },
    { row: 9, label: "Cash on Bank", categories: ["CASH_ON_BANK"], absolute: true },
    { row: 10, label: "Account Receivable", categories: ["ACCOUNT_RECEIVABLE"], absolute: true },
    { row: 11, label: "Other Receivable", categories: ["EMPLOYEE_RECEIVABLE"], absolute: true },
    { row: 12, label: "Inventory", categories: ["INVENTORY"], absolute: true },
    { row: 13, label: "Others Current Assets", categories: ["CURRENT_ASSET", "EXCESS_CASH", "MARKETABLE_SECURITIES", "SURPLUS_ASSET_CASH"], absolute: true },
    { row: 22, label: "Non Current Assets", categories: ["NON_CURRENT_ASSET", "NON_OPERATING_FIXED_ASSETS"], absolute: true },
    { row: 23, label: "Intangible Assets", categories: ["INTANGIBLE_ASSETS"], absolute: true },
    { row: 30, label: "Bank Loan-Short Term", categories: ["BANK_LOAN_SHORT_TERM"], absolute: true },
    { row: 31, label: "Account Payables", categories: ["ACCOUNT_PAYABLE"], absolute: true },
    { row: 32, label: "Tax Payable", categories: ["TAX_PAYABLE"], absolute: true },
    { row: 33, label: "Other Payables", categories: ["OTHER_PAYABLE", "INTEREST_PAYABLE"], absolute: true },
    { row: 37, label: "Bank Loan-Long Term", categories: ["BANK_LOAN_LONG_TERM", "INTEREST_BEARING_DEBT"], absolute: true },
    { row: 38, label: "Related Party Payable & Employee Benefits", categories: ["NON_CURRENT_LIABILITIES"], absolute: true },
    { row: 42, label: "Paid Up Capital", categories: ["MODAL_DISETOR"], absolute: true },
    { row: 43, label: "Additional Paid In Capital", categories: ["PENAMBAHAN_MODAL_DISETOR"], absolute: true },
    { row: 45, label: "Retained Earnings Surplus", categories: ["RETAINED_EARNINGS_SURPLUS"], absolute: true },
  ];

  rows.forEach((mapping) => patchPeriodCategoryValues(workbook, input, patches, "BALANCE SHEET", mapping.row, mapping.label, mapping.categories, mapping.absolute ?? false));
}

function patchIncomeStatementTemplateSheet(workbook: XLSX.WorkBook, input: ValuationExcelExportInput, patches: TemplatePatch[]) {
  const rows: Array<{ row: number; label: string; categories: AccountCategory[] }> = [
    { row: 6, label: "Revenue", categories: ["REVENUE"] },
    { row: 7, label: "Cost of Good Sold", categories: ["COST_OF_GOOD_SOLD"] },
    { row: 12, label: "Other Operating Expense", categories: ["OPERATING_EXPENSE", "SELLING_EXPENSE"] },
    { row: 13, label: "General & Administrative Overheads", categories: ["GENERAL_ADMINISTRATIVE_OVERHEADS"] },
    { row: 26, label: "Interest Income", categories: ["INTEREST_INCOME"] },
    { row: 27, label: "Interest Expense", categories: ["INTEREST_EXPENSE"] },
    { row: 30, label: "Non Operating Income", categories: ["NON_OPERATING_INCOME"] },
    { row: 33, label: "Corporate Tax", categories: ["CORPORATE_TAX"] },
  ];

  rows.forEach((mapping) => patchPeriodCategoryValues(workbook, input, patches, "INCOME STATEMENT", mapping.row, mapping.label, mapping.categories, false));
}

function patchKeyDriversTemplateSheet(
  workbook: XLSX.WorkBook,
  input: ValuationExcelExportInput,
  patches: TemplatePatch[],
  unmapped: TemplateUnmapped[],
) {
  writeTemplateCell(workbook, patches, "KEY DRIVERS", "C11", input.snapshot.taxRate, "Corporate Tax Rate", "Resolved assumptions");
  patchProjectionDriverRow(workbook, patches, "KEY DRIVERS", 28, input.snapshot.arDays, "AR days", "Resolved assumptions / historical driver");
  patchProjectionDriverRow(workbook, patches, "KEY DRIVERS", 29, input.snapshot.inventoryDays, "Inventory days", "Resolved assumptions / historical driver");
  patchProjectionDriverRow(workbook, patches, "KEY DRIVERS", 30, input.snapshot.apDays, "Account payable days", "Resolved assumptions / historical driver");

  if (input.snapshot.otherPayableDays !== 0) {
    unmapped.push({
      field: "Other payable days",
      value: input.snapshot.otherPayableDays,
      reason: "Template KEY DRIVERS has AR, inventory, and AP rows but no clear separate other payable days row.",
    });
  }

  if (input.snapshot.revenueGrowth !== 0) {
    ["E", "F", "G", "H", "I", "J"].forEach((column) => {
      writeTemplateCell(workbook, patches, "KEY DRIVERS", `${column}15`, input.snapshot.revenueGrowth, "Sales volume increment", "Resolved revenue growth");
      writeTemplateCell(
        workbook,
        patches,
        "KEY DRIVERS",
        `${column}18`,
        0,
        "Sales price increment",
        "No separate website price-growth state; web revenue growth is mapped once through volume increment.",
        "deferred/unmapped",
      );
    });
  }
}

function patchWaccTemplateSheet(workbook: XLSX.WorkBook, input: ValuationExcelExportInput, patches: TemplatePatch[]) {
  writeTemplateRateIfPresent(workbook, patches, "WACC", "B4", input.resolvedAssumptions.waccEquityRiskPremium, "Equity Risk Premium");
  writeTemplateRateIfPresent(workbook, patches, "WACC", "B5", input.resolvedAssumptions.waccRatingBasedDefaultSpread, "Rating Based Default Spread");
  writeTemplateRateIfPresent(workbook, patches, "WACC", "B6", input.resolvedAssumptions.waccRiskFreeRate, "Risk Free (SUN)");
  writeTemplateTextIfPresent(workbook, patches, "WACC", "A11", input.resolvedAssumptions.waccComparable1Name, "Comparable 1 name");
  writeTemplateRateIfPresent(workbook, patches, "WACC", "B11", input.resolvedAssumptions.waccComparable1BetaLevered, "Comparable 1 beta levered");
  writeTemplateNumberIfPresent(workbook, patches, "WACC", "C11", input.resolvedAssumptions.waccComparable1MarketCap, "Comparable 1 market cap");
  writeTemplateNumberIfPresent(workbook, patches, "WACC", "D11", input.resolvedAssumptions.waccComparable1Debt, "Comparable 1 debt");
  writeTemplateTextIfPresent(workbook, patches, "WACC", "A12", input.resolvedAssumptions.waccComparable2Name, "Comparable 2 name");
  writeTemplateRateIfPresent(workbook, patches, "WACC", "B12", input.resolvedAssumptions.waccComparable2BetaLevered, "Comparable 2 beta levered");
  writeTemplateNumberIfPresent(workbook, patches, "WACC", "C12", input.resolvedAssumptions.waccComparable2MarketCap, "Comparable 2 market cap");
  writeTemplateNumberIfPresent(workbook, patches, "WACC", "D12", input.resolvedAssumptions.waccComparable2Debt, "Comparable 2 debt");
  writeTemplateTextIfPresent(workbook, patches, "WACC", "A13", input.resolvedAssumptions.waccComparable3Name, "Comparable 3 name");
  writeTemplateRateIfPresent(workbook, patches, "WACC", "B13", input.resolvedAssumptions.waccComparable3BetaLevered, "Comparable 3 beta levered");
  writeTemplateNumberIfPresent(workbook, patches, "WACC", "C13", input.resolvedAssumptions.waccComparable3MarketCap, "Comparable 3 market cap");
  writeTemplateNumberIfPresent(workbook, patches, "WACC", "D13", input.resolvedAssumptions.waccComparable3Debt, "Comparable 3 debt");
  writeTemplateRateIfPresent(workbook, patches, "WACC", "B27", input.resolvedAssumptions.waccBankPerseroInvestmentLoanRate, "Bank Persero investment loan rate");
  writeTemplateRateIfPresent(workbook, patches, "WACC", "B28", input.resolvedAssumptions.waccBankSwastaInvestmentLoanRate, "Bank Swasta investment loan rate");
  writeTemplateRateIfPresent(workbook, patches, "WACC", "B29", input.resolvedAssumptions.waccBankUmumInvestmentLoanRate, "Bank Umum investment loan rate");
  writeTemplateCell(workbook, patches, "WACC", "E22", input.snapshot.wacc, "Weighted Average Cost of Capital", "Resolved WACC used by web valuation engine");
}

function patchDiscountRateTemplateSheet(
  workbook: XLSX.WorkBook,
  input: ValuationExcelExportInput,
  patches: TemplatePatch[],
  unmapped: TemplateUnmapped[],
) {
  const calculation = resolveTemplateDiscountRateCalculation(input.resolvedAssumptions);

  writeTemplateCell(workbook, patches, "DISCOUNT RATE", "C2", input.snapshot.taxRate, "Tax Rate", "Resolved tax assumption", "web-derived");
  writeTemplateRateInputIfPresent(workbook, patches, "DISCOUNT RATE", "C3", input.resolvedAssumptions.waccRiskFreeRate, "Risk Free", "Risk-free rate from resolved WACC assumptions");
  writeTemplateRateInputIfPresent(workbook, patches, "DISCOUNT RATE", "C5", input.resolvedAssumptions.waccEquityRiskPremium, "Equity Risk Premium (Rating)", "Equity risk premium from resolved WACC assumptions");

  if (calculation) {
    const debtToEquity = calculation.equityWeight > 0 ? calculation.debtWeight / calculation.equityWeight : 0;
    const formulaCompatibleCountrySpread = finiteNumber(-calculation.countryRiskAdjustment);
    const rawDefaultSpread = input.resolvedAssumptions.waccRatingBasedDefaultSpread.trim()
      ? parseInputNumber(input.resolvedAssumptions.waccRatingBasedDefaultSpread)
      : null;
    const spreadOrigin: TemplateSourceOrigin =
      rawDefaultSpread !== null && nearlyEqual(formulaCompatibleCountrySpread, rawDefaultSpread) ? "website-sourced" : "web-derived";
    const unleveredBeta = calculation.beta / (1 + (1 - input.snapshot.taxRate) * debtToEquity);
    const debtWaccComponent = calculation.debtWeight * calculation.afterTaxCostOfDebt;
    const equityWaccComponent = calculation.equityWeight * calculation.costOfEquity;
    const componentWacc = debtWaccComponent + equityWaccComponent;

    writeTemplateCell(workbook, patches, "DISCOUNT RATE", "C4", calculation.beta, "Beta", "Resolved WACC beta after comparable/governance rules", "web-derived");
    writeTemplateCell(
      workbook,
      patches,
      "DISCOUNT RATE",
      "C6",
      formulaCompatibleCountrySpread,
      "Country Default Spread (Based on Rating)",
      "Formula-compatible country/default spread used by resolved WACC calculation",
      spreadOrigin,
    );
    writeTemplateCell(workbook, patches, "DISCOUNT RATE", "C8", debtToEquity, "DER industry", "Debt/equity ratio from resolved WACC weights", "web-derived");
    refreshTemplateFormulaCachedValue(workbook, patches, "DISCOUNT RATE", "H1", unleveredBeta, "Unlevered beta", "Resolved WACC calculation cached while preserving template formula");
    refreshTemplateFormulaCachedValue(workbook, patches, "DISCOUNT RATE", "H2", calculation.beta, "Levered beta", "Resolved WACC calculation cached while preserving template formula");
    refreshTemplateFormulaCachedValue(workbook, patches, "DISCOUNT RATE", "H3", calculation.costOfEquity, "Cost of equity", "Resolved WACC calculation cached while preserving template formula");
    refreshTemplateFormulaCachedValue(workbook, patches, "DISCOUNT RATE", "H4", calculation.afterTaxCostOfDebt, "After-tax cost of debt", "Resolved WACC calculation cached while preserving template formula");
    refreshTemplateFormulaCachedValue(workbook, patches, "DISCOUNT RATE", "F7", calculation.debtWeight, "Debt weight", "Resolved WACC calculation cached while preserving template formula");
    refreshTemplateFormulaCachedValue(workbook, patches, "DISCOUNT RATE", "G7", calculation.afterTaxCostOfDebt, "Debt cost", "Resolved WACC calculation cached while preserving template formula");
    refreshTemplateFormulaCachedValue(workbook, patches, "DISCOUNT RATE", "F8", calculation.equityWeight, "Equity weight", "Resolved WACC calculation cached while preserving template formula");
    refreshTemplateFormulaCachedValue(workbook, patches, "DISCOUNT RATE", "G8", calculation.costOfEquity, "Equity cost", "Resolved WACC calculation cached while preserving template formula");
    refreshTemplateFormulaCachedValue(workbook, patches, "DISCOUNT RATE", "H7", debtWaccComponent, "Debt WACC component", "Resolved WACC calculation cached while preserving template formula");
    refreshTemplateFormulaCachedValue(workbook, patches, "DISCOUNT RATE", "H8", equityWaccComponent, "Equity WACC component", "Resolved WACC calculation cached while preserving template formula");
    refreshTemplateFormulaCachedValue(workbook, patches, "DISCOUNT RATE", "C9", calculation.costOfEquity, "CoE", "Resolved WACC calculation cached while preserving template formula");
    refreshTemplateFormulaCachedValue(workbook, patches, "DISCOUNT RATE", "C10", calculation.afterTaxCostOfDebt, "CoD", "Resolved WACC calculation cached while preserving template formula");

    if (nearlyEqual(componentWacc, input.snapshot.wacc)) {
      refreshTemplateFormulaCachedValue(workbook, patches, "DISCOUNT RATE", "H10", input.snapshot.wacc, "Weighted Average Cost of Capital (WACC)", "Resolved WACC calculation cached while preserving template formula");
      refreshTemplateFormulaCachedValue(workbook, patches, "DISCOUNT RATE", "C11", input.snapshot.wacc, "WACC", "Resolved WACC calculation cached while preserving template formula");
    } else {
      writeTemplateCell(workbook, patches, "DISCOUNT RATE", "H10", input.snapshot.wacc, "Weighted Average Cost of Capital (WACC)", "Resolved WACC override used by web valuation engine", "web-derived");
      writeTemplateCell(workbook, patches, "DISCOUNT RATE", "C11", input.snapshot.wacc, "WACC", "Resolved WACC override used by web valuation engine", "web-derived");
    }
  } else {
    unmapped.push({
      field: "DISCOUNT RATE WACC components",
      value: input.snapshot.wacc,
      reason: "Resolved assumptions do not contain enough inputs to safely rebuild the template CAPM component table; final WACC anchor remains mapped on WACC/STAT sheets.",
    });
  }

  if (input.resolvedAssumptions.waccPreTaxCostOfDebt.trim()) {
    writeTemplateCell(
      workbook,
      patches,
      "DISCOUNT RATE",
      "C7",
      parseInputNumber(input.resolvedAssumptions.waccPreTaxCostOfDebt),
      "Debt Rate",
      "Pre-tax cost of debt from resolved WACC assumptions",
    );
  } else if (calculation) {
    writeTemplateCell(workbook, patches, "DISCOUNT RATE", "C7", calculation.preTaxCostOfDebt, "Debt Rate", "Pre-tax cost of debt derived from resolved WACC assumptions", "web-derived");
  }

  writeTemplateCell(workbook, patches, "DISCOUNT RATE", "C12", input.snapshot.terminalGrowth, "Growth", "Resolved terminal growth used by web valuation engine", "web-derived");
}

function patchDlomTemplateSheet(workbook: XLSX.WorkBook, input: ValuationExcelExportInput, patches: TemplatePatch[]) {
  const factorCells = ["F7", "F9", "F11", "F13", "F15", "F17", "F19", "F21", "F23", "F25"];

  input.dlomCalculation.factors.forEach((factor, index) => {
    writeTemplateCell(workbook, patches, "DLOM", factorCells[index], factor.answer, factor.factor, "DLOM questionnaire");
  });
  writeTemplateCell(workbook, patches, "DLOM", "C30", dlomTemplateCompanyMarketability(input.caseProfile.companyType), "DLOM company marketability basis", "Case profile / DLOM basis");
  writeTemplateCell(workbook, patches, "DLOM", "C31", input.dlomCalculation.interestBasis || input.caseProfile.shareOwnershipType, "DLOM interest basis", "DLOM calculation");
}

function patchDlocPfcTemplateSheet(workbook: XLSX.WorkBook, input: ValuationExcelExportInput, patches: TemplatePatch[]) {
  const factorCells = ["E7", "E9", "E11", "E13", "E15"];

  input.dlocPfcCalculation.factors.forEach((factor, index) => {
    writeTemplateCell(workbook, patches, "DLOC(PFC)", factorCells[index], factor.answer, factor.factor, "DLOC/PFC questionnaire");
  });
  writeTemplateFormulaCell(
    workbook,
    patches,
    "DLOC(PFC)",
    "B20",
    'IF(LOWER(HOME!B7)="tertutup","DLOC Perusahaan tertutup ","DLOC Perusahaan terbuka ")',
    dlocTemplateCompanyBasis(input.caseProfile.companyType),
    "DLOC/PFC company basis",
    "Formula patched to keep the template logic traceable while handling case differences in HOME!B7.",
  );
  writeTemplateCell(workbook, patches, "DLOC(PFC)", "B21", input.caseProfile.shareOwnershipType, "DLOC/PFC ownership basis", "Case profile");
}

function patchTaxSimulationTemplateSheet(workbook: XLSX.WorkBook, input: ValuationExcelExportInput, patches: TemplatePatch[]) {
  writeTemplateCell(workbook, patches, "SIMULASI POTENSI PAJAK", "C1", input.taxSimulation.primaryMethod || "AAM", "Primary valuation method", "Tax simulation state");

  if (input.taxSimulation.reportedTransferValue.trim()) {
    writeTemplateCell(workbook, patches, "SIMULASI POTENSI PAJAK", "E14", parseInputNumber(input.taxSimulation.reportedTransferValue), "Reported transfer value", "Tax simulation override");
  }
}

function patchTemplateAssumptionSheets(workbook: XLSX.WorkBook, input: ValuationExcelExportInput, patches: TemplatePatch[]) {
  const statAssumptionsSheet = ["STAT", "ASSUMPTIONS"].join("_");
  const waccFormula = ["WACC", "E22"].join("!");

  writeTemplateCell(workbook, patches, statAssumptionsSheet, "B5", input.snapshot.taxRate, "Statutory corporate tax rate", "Resolved tax assumption");
  writeTemplateFormulaCell(workbook, patches, statAssumptionsSheet, "B6", waccFormula, input.snapshot.wacc, "Source WACC", "Resolved WACC used by web valuation engine");
  writeTemplateCell(workbook, patches, statAssumptionsSheet, "B8", input.snapshot.terminalGrowth, "Base terminal growth", "Resolved terminal growth");
  writeTemplateCell(workbook, patches, statAssumptionsSheet, "B9", input.snapshot.revenueGrowth, "Revenue growth", "Resolved revenue growth");
  writeTemplateCell(workbook, patches, statAssumptionsSheet, "B10", input.snapshot.requiredReturnOnNta, "Return on net tangible assets", "Resolved required return on NTA");
}

function patchAamTemplateSheet(workbook: XLSX.WorkBook, input: ValuationExcelExportInput, patches: TemplatePatch[]) {
  const adjustmentCells: Record<string, string> = {
    "cash-on-hand": "D9",
    "cash-on-bank-deposit": "D10",
    "account-receivable": "D11",
    "employee-receivable": "D12",
    inventory: "D13",
    "marketable-securities": "D14",
    "excess-cash": "D14",
    "surplus-asset-cash": "D14",
    "other-current-assets": "D14",
    "fixed-assets-net": "D20",
    "non-operating-fixed-assets": "D21",
    "other-non-current-assets": "D21",
    "intangible-assets": "D23",
    "bank-loan-short-term": "D28",
    "account-payable": "D29",
    "tax-payable": "D30",
    "other-payable": "D31",
    "interest-payable": "D31",
    "bank-loan-long-term": "D35",
    "other-non-current-liabilities": "D36",
  };
  const combinedAdjustments = new Map<string, { label: string; value: number }>();

  [...input.aamAdjustmentModel.assetLines, ...input.aamAdjustmentModel.liabilityLines].forEach((line) => {
    const cellAddress = adjustmentCells[line.id];

    if (!cellAddress || line.isBridgeLine) {
      return;
    }

    const existing = combinedAdjustments.get(cellAddress);
    combinedAdjustments.set(cellAddress, {
      label: existing ? `${existing.label}; ${line.label}` : line.label,
      value: (existing?.value ?? 0) + line.adjustment,
    });
  });

  combinedAdjustments.forEach((item, cellAddress) => {
    writeTemplateCell(workbook, patches, "AAM", cellAddress, item.value, `AAM fair-value adjustment: ${item.label}`, "AAM adjustment model");
  });
}

function patchTemplateFormulaCaches(workbook: XLSX.WorkBook, input: ValuationExcelExportInput, patches: TemplatePatch[]) {
  const adjustedInterestBearingDebt = adjustedAamInterestBearingDebt(input);
  const aamNettAssetValue = input.results.aam.equityValue + adjustedInterestBearingDebt;

  refreshTemplateFormulaCachedValue(workbook, patches, "AAM", "E51", aamNettAssetValue, "AAM nett asset value before interest-bearing debt", "Web AAM bridge cached while preserving template formula");
  refreshTemplateFormulaCachedValue(workbook, patches, "AAM", "E52", adjustedInterestBearingDebt, "AAM interest-bearing debt", "Web AAM bridge cached while preserving template formula");
  refreshTemplateFormulaCachedValue(workbook, patches, "AAM", "E53", input.results.aam.equityValue, "AAM equity value", "Web valuation engine result cached while preserving template formula");
  refreshTemplateFormulaCachedValue(workbook, patches, "AAM", "E55", input.results.aam.equityValue, "AAM equity value after DLOM bridge", "Web AAM bridge cached while preserving template formula");
  refreshTemplateFormulaCachedValue(workbook, patches, "AAM", "E57", input.results.aam.equityValue, "AAM market value of equity 100%", "Web AAM bridge cached while preserving template formula");
  refreshTemplateFormulaCachedValue(workbook, patches, "AAM", "E59", input.results.aam.equityValue, "AAM market value of 100% equity", "Web AAM bridge cached while preserving template formula");
  refreshTemplateFormulaCachedValue(workbook, patches, "AAM", "E60", aamValuePerShare(input), "AAM value per share", "Web AAM bridge cached while preserving template formula");
  refreshTemplateFormulaCachedValue(workbook, patches, "EEM", "D34", input.results.eem.equityValue, "EEM equity value", "Web valuation engine result cached while preserving template formula");
  refreshTemplateFormulaCachedValue(workbook, patches, "DCF", "C33", input.results.dcf.equityValue, "DCF equity value", "Web valuation engine result cached while preserving template formula");
  refreshTemplateFormulaCachedValue(workbook, patches, "STAT_EEM", "B22", input.results.eem.equityValue, "STAT EEM equity value", "Web valuation engine result cached while preserving template formula");
  refreshTemplateFormulaCachedValue(workbook, patches, "STAT_DCF", "B39", input.results.dcf.equityValue, "STAT DCF equity value", "Web valuation engine result cached while preserving template formula");

  const primaryTaxRow = input.taxSimulationResult.primaryRow;

  if (!primaryTaxRow) {
    return;
  }

  refreshTemplateFormulaCachedValue(workbook, patches, "SIMULASI POTENSI PAJAK", "E1", primaryTaxRow.baseEquityValue, "Tax simulation base equity value", "Primary tax simulation row");
  refreshTemplateFormulaCachedValue(workbook, patches, "SIMULASI POTENSI PAJAK", "D3", -primaryTaxRow.dlomRate, "Tax simulation DLOM rate", "Primary tax simulation row");
  refreshTemplateFormulaCachedValue(workbook, patches, "SIMULASI POTENSI PAJAK", "E3", primaryTaxRow.dlomAdjustment, "Tax simulation DLOM adjustment", "Primary tax simulation row");
  refreshTemplateFormulaCachedValue(workbook, patches, "SIMULASI POTENSI PAJAK", "E4", primaryTaxRow.valueAfterDlom, "Tax simulation value after DLOM", "Primary tax simulation row");
  refreshTemplateFormulaCachedValue(workbook, patches, "SIMULASI POTENSI PAJAK", "D6", -primaryTaxRow.dlocPfcRate, "Tax simulation DLOC/PFC rate", "Primary tax simulation row");
  refreshTemplateFormulaCachedValue(workbook, patches, "SIMULASI POTENSI PAJAK", "E6", primaryTaxRow.dlocPfcAdjustment, "Tax simulation DLOC/PFC adjustment", "Primary tax simulation row");
  refreshTemplateFormulaCachedValue(workbook, patches, "SIMULASI POTENSI PAJAK", "E7", primaryTaxRow.marketValueOfEquity100, "Tax simulation market value of equity 100%", "Primary tax simulation row");
  refreshTemplateFormulaCachedValue(workbook, patches, "SIMULASI POTENSI PAJAK", "E11", primaryTaxRow.marketValueOfEquity100, "Tax simulation market value of equity 100% bridge", "Primary tax simulation row");
  refreshTemplateFormulaCachedValue(workbook, patches, "SIMULASI POTENSI PAJAK", "E12", primaryTaxRow.sharePercentage, "Tax simulation share percentage", "Primary tax simulation row");
  refreshTemplateFormulaCachedValue(workbook, patches, "SIMULASI POTENSI PAJAK", "E13", primaryTaxRow.marketValueOfTransferredInterest, "Tax simulation transferred-interest market value", "Primary tax simulation row");
  if (!input.taxSimulation.reportedTransferValue.trim()) {
    refreshTemplateFormulaCachedValue(workbook, patches, "SIMULASI POTENSI PAJAK", "E14", primaryTaxRow.reportedTransferValue, "Tax simulation reported transfer value", "Primary tax simulation row");
  }
  refreshTemplateFormulaCachedValue(workbook, patches, "SIMULASI POTENSI PAJAK", "E15", primaryTaxRow.transferValueDifference, "Tax simulation transfer value difference", "Primary tax simulation row");
  refreshTemplateFormulaCachedValue(workbook, patches, "SIMULASI POTENSI PAJAK", "E17", input.caseProfile.subjectTaxpayerType || primaryTaxRow.taxBasisLabel, "Tax simulation taxpayer type", "Primary tax simulation row");
  refreshTemplateFormulaCachedValue(
    workbook,
    patches,
    "SIMULASI POTENSI PAJAK",
    "E18",
    primaryTaxRow.appliedTaxYear ?? primaryTaxRow.requestedTaxYear ?? 0,
    "Tax simulation applied tax year",
    "Primary tax simulation row",
  );
}

function resolveTemplateDiscountRateCalculation(assumptions: AssumptionState): WaccCalculation | null {
  const calculation = calculateWaccAssumption(assumptions);

  if (!calculation || assumptions.wacc.trim() || !assumptions.waccSource.startsWith("market-suggestion")) {
    return calculation;
  }

  const { lowBetaThreshold, minimumReviewableRate, smartSuggestionBetaFloor } = valuationDriverGovernancePolicy.wacc;
  const needsGovernedBase =
    calculation.wacc < minimumReviewableRate ||
    calculation.beta < lowBetaThreshold ||
    calculation.costOfEquity < calculation.afterTaxCostOfDebt;

  if (!needsGovernedBase) {
    return calculation;
  }

  const riskFreeRate = assumptions.waccRiskFreeRate.trim() ? parseInputNumber(assumptions.waccRiskFreeRate) : null;
  const equityRiskPremium = assumptions.waccEquityRiskPremium.trim() ? parseInputNumber(assumptions.waccEquityRiskPremium) : null;

  if (riskFreeRate === null || equityRiskPremium === null) {
    return calculation;
  }

  const beta = Math.max(calculation.beta, smartSuggestionBetaFloor);
  const countryRiskAdjustment = Math.max(0, calculation.countryRiskAdjustment);
  const costOfEquity = riskFreeRate + beta * equityRiskPremium + countryRiskAdjustment;
  const wacc = calculation.debtWeight * calculation.afterTaxCostOfDebt + calculation.equityWeight * costOfEquity;

  return {
    ...calculation,
    beta,
    countryRiskAdjustment,
    costOfEquity,
    wacc,
  };
}

function adjustedAamInterestBearingDebt(input: ValuationExcelExportInput): number {
  const interestDebtAdjustment = input.aamAdjustmentModel.liabilityLines
    .filter((line) => line.id === "bank-loan-short-term" || line.id === "bank-loan-long-term")
    .reduce((sum, line) => sum + line.adjustment, 0);

  return interestBearingDebt(input.snapshot) + interestDebtAdjustment;
}

function aamValuePerShare(input: ValuationExcelExportInput): number {
  const capitalBaseFull = parseInputNumber(input.caseProfile.capitalBaseFull);

  return capitalBaseFull > 0 ? input.results.aam.equityValue / capitalBaseFull : 0;
}

function recordDeferredHighImpactTemplateGaps(input: ValuationExcelExportInput, unmapped: TemplateUnmapped[]) {
  unmapped.push({
    field: "Projection sheets full row-level rebuild",
    value: "PROY LR / PROY BALANCE SHEET / PROY CASH FLOW STATEMENT / PROY NOPLAT / PROY FIXED ASSETS",
    reason: "Projection sheets retain the legacy template formula graph. V2 patches upstream anchors and DCF/STAT_DCF cached outputs, but a row-level projection rewrite is deferred until workbook parity is reviewer-approved.",
  });

  const primaryTaxRow = input.taxSimulationResult.primaryRow;

  if (!primaryTaxRow) {
    return;
  }

  unmapped.push({
    field: "Tax regime detail outputs",
    value: primaryTaxRow.potentialTax,
    reason: `The template tax sheet has a compact value bridge only. Detailed ${primaryTaxRow.taxBasisLabel}, rounded taxable income ${primaryTaxRow.taxableIncomeRounded}, effective tax rate, brackets, and source-law fields remain in the web tax engine/audit until a safe template destination exists.`,
  });
}

function buildTemplateOriginEntries(workbook: XLSX.WorkBook, patches: TemplatePatch[]): TemplateOriginEntry[] {
  const patchKeys = new Set(patches.map((patch) => templateCellKey(patch.sheet, patch.cell)));
  const entries: TemplateOriginEntry[] = [...patches];

  workbook.SheetNames.forEach((sheetName) => {
    if (sheetName === "PVB_EXPORT_V2_AUDIT") {
      return;
    }

    const worksheet = workbook.Sheets[sheetName];
    const rangeText = worksheet?.["!ref"];

    if (!worksheet || !rangeText) {
      return;
    }

    const range = XLSX.utils.decode_range(rangeText);

    for (let rowIndex = range.s.r; rowIndex <= range.e.r; rowIndex += 1) {
      for (let columnIndex = range.s.c; columnIndex <= range.e.c; columnIndex += 1) {
        const cellAddress = XLSX.utils.encode_cell({ r: rowIndex, c: columnIndex });

        if (patchKeys.has(templateCellKey(sheetName, cellAddress))) {
          continue;
        }

        const cell = worksheet[cellAddress];

        if (!cell || !isTemplateDataCell(cell)) {
          continue;
        }

        const sourceOrigin: TemplateSourceOrigin = cell.f ? "template-formula" : "template-default";
        entries.push({
          sheet: sheetName,
          cell: cellAddress,
          label: templateCellLabel(worksheet, rowIndex, columnIndex),
          value: templateOriginCellValue(cell),
          source: cell.f ? "Template formula retained from reference workbook" : "Template default/reference value retained from reference workbook",
          status: sourceOrigin,
          previousFormula: typeof cell.f === "string" ? cell.f : "",
          sourceOrigin,
          fontMark: "blue",
        });
      }
    }
  });

  return entries;
}

function isTemplateDataCell(cell: XLSX.CellObject): boolean {
  if (cell.t === "n" || cell.t === "b") {
    return true;
  }

  return typeof cell.f === "string" && (typeof cell.v === "number" || typeof cell.v === "string" || typeof cell.v === "boolean");
}

function templateOriginCellValue(cell: XLSX.CellObject): string | number {
  if (typeof cell.v === "number" || typeof cell.v === "string") {
    return cell.v;
  }

  if (typeof cell.v === "boolean") {
    return cell.v ? "TRUE" : "FALSE";
  }

  return "";
}

function templateCellLabel(worksheet: XLSX.WorkSheet, rowIndex: number, columnIndex: number): string {
  const sameRowLabel = findLeftTextCell(worksheet, rowIndex, columnIndex);

  if (sameRowLabel) {
    return sameRowLabel;
  }

  const aboveCell = worksheet[XLSX.utils.encode_cell({ r: rowIndex - 1, c: columnIndex })];

  if (typeof aboveCell?.v === "string" && !aboveCell.f) {
    return aboveCell.v;
  }

  return "Template data cell";
}

function findLeftTextCell(worksheet: XLSX.WorkSheet, rowIndex: number, columnIndex: number): string {
  for (let nextColumnIndex = columnIndex - 1; nextColumnIndex >= 0; nextColumnIndex -= 1) {
    const cell = worksheet[XLSX.utils.encode_cell({ r: rowIndex, c: nextColumnIndex })];

    if (typeof cell?.v === "string" && !cell.f) {
      return cell.v;
    }
  }

  return "";
}

function templateCellKey(sheet: string, cell: string): string {
  return `${sheet}!${cell}`;
}

function fontMarkForSourceOrigin(sourceOrigin: TemplateSourceOrigin): TemplateFontMark {
  return sourceOrigin === "template-default" || sourceOrigin === "template-formula" || sourceOrigin === "deferred/unmapped" ? "blue" : "default";
}

function appendTemplateAuditSheet(
  workbook: XLSX.WorkBook,
  input: ValuationExcelExportInput,
  originEntries: TemplateOriginEntry[],
  unmapped: TemplateUnmapped[],
  exportedAt: Date,
) {
  const rows: SheetRow[] = [
    ["Export XLSX V2 Audit"],
    ["Generated at", exportedAt.toISOString()],
    ["Template", templateWorkbookUrl],
    ["Basis", "Full template clone; main input cells are patched from active website state; formulas and layout are preserved where possible."],
    ["Object taxpayer", input.caseProfile.objectTaxpayerName || "-"],
    ["Active period", input.periods.find((period) => period.id === input.activePeriodId)?.label ?? input.activePeriodId],
    [],
    ["Source-Origin Matrix"],
    ["Sheet", "Cell", "Label", "Value", "Source", "Source Origin", "Status", "Font Mark", "Previous Formula"],
    ...originEntries.map((entry): SheetRow => [entry.sheet, entry.cell, entry.label, entry.value, entry.source, entry.sourceOrigin, entry.status, entry.fontMark, entry.previousFormula]),
    [],
    ["Unmapped / Deferred Fields"],
    ["Field", "Value", "Source Origin", "Status", "Reason"],
    ...unmapped.map((item): SheetRow => [item.field, item.value, "deferred/unmapped", "deferred/unmapped", item.reason]),
    [],
    ["Validation"],
    ["Check", "Status"],
    ...input.validationChecks.map((check): SheetRow => [check.label, check.ok ? "OK" : "Needs review"]),
    [],
    ["Formula Preservation / Recalculation"],
    ["Behavior", "Status", "Detail"],
    ["Template formulas", "Preserved where not patched", "Formula cells retained from the template are classified as template-formula and marked with blue font unless a web-derived cache is explicitly refreshed."],
    ["Cached values", "Refreshed for key outputs", "AAM, EEM, DCF, STAT_EEM, STAT_DCF, and selected tax bridge output cells keep formulas and receive web-engine cached values."],
    ["Browser recalculation", "Not available", "The browser export library writes formulas but does not evaluate the workbook formula graph."],
    ["Excel recalculation metadata", "Not guaranteed", "Open the workbook in Excel or another spreadsheet engine for authoritative recalculation after export."],
    [],
    ["Tax Simulation Warnings"],
    ...input.taxSimulationResult.warnings.map((warning): SheetRow => [warning]),
  ];
  const worksheet = XLSX.utils.aoa_to_sheet(rows);
  worksheet["!cols"] = [{ wch: 24 }, { wch: 18 }, { wch: 42 }, { wch: 24 }, { wch: 56 }, { wch: 22 }, { wch: 24 }, { wch: 14 }, { wch: 56 }];

  appendSheet(workbook, "PVB_EXPORT_V2_AUDIT", worksheet);
}

function patchPeriodCategoryValues(
  workbook: XLSX.WorkBook,
  input: ValuationExcelExportInput,
  patches: TemplatePatch[],
  sheet: string,
  row: number,
  label: string,
  categories: AccountCategory[],
  absolute: boolean,
) {
  input.periods.forEach((period) => {
    const column = templateColumnForPeriod(period);

    if (!column) {
      return;
    }

    const value = aggregateMappedRows(input.mappedRows, period.id, categories);
    const normalizedValue = absolute ? Math.abs(value) : value;

    writeTemplateCell(workbook, patches, sheet, `${column}${row}`, normalizedValue, label, `${period.label}: ${categories.join(", ")}`);
  });
}

function patchProjectionDriverRow(
  workbook: XLSX.WorkBook,
  patches: TemplatePatch[],
  sheet: string,
  row: number,
  value: number,
  label: string,
  source: string,
) {
  ["D", "E", "F", "G", "H", "I", "J"].forEach((column) => {
    writeTemplateCell(workbook, patches, sheet, `${column}${row}`, value, label, source);
  });
}

function writeTemplateCell(
  workbook: XLSX.WorkBook,
  patches: TemplatePatch[],
  sheet: string,
  cellAddress: string,
  value: string | number,
  label: string,
  source: string,
  sourceOrigin: TemplateSourceOrigin = "website-sourced",
) {
  const worksheet = workbook.Sheets[sheet];

  if (!worksheet) {
    return;
  }

  const existing = worksheet[cellAddress] ?? {};
  const previousFormula = typeof existing.f === "string" ? existing.f : "";
  const nextCell: XLSX.CellObject = {
    ...existing,
    t: typeof value === "number" ? "n" : "s",
    v: typeof value === "number" ? finiteNumber(value) : value,
  };

  delete nextCell.f;
  delete nextCell.w;
  worksheet[cellAddress] = nextCell;
  patches.push({
    sheet,
    cell: cellAddress,
    label,
    value,
    source,
    status: previousFormula ? "formula-neutralized" : "mapped",
    previousFormula,
    sourceOrigin,
    fontMark: fontMarkForSourceOrigin(sourceOrigin),
  });
}

function writeTemplateFormulaCell(
  workbook: XLSX.WorkBook,
  patches: TemplatePatch[],
  sheet: string,
  cellAddress: string,
  formula: string,
  cachedValue: string | number,
  label: string,
  source: string,
  sourceOrigin: TemplateSourceOrigin = "web-derived",
) {
  const worksheet = workbook.Sheets[sheet];

  if (!worksheet) {
    return;
  }

  const existing = worksheet[cellAddress] ?? {};
  const previousFormula = typeof existing.f === "string" ? existing.f : "";
  const nextCell: XLSX.CellObject = {
    ...existing,
    t: typeof cachedValue === "number" ? "n" : "s",
    v: typeof cachedValue === "number" ? finiteNumber(cachedValue) : cachedValue,
    f: formula,
  };

  delete nextCell.w;
  worksheet[cellAddress] = nextCell;
  patches.push({
    sheet,
    cell: cellAddress,
    label,
    value: cachedValue,
    source,
    status: "formula-corrected",
    previousFormula,
    sourceOrigin,
    fontMark: fontMarkForSourceOrigin(sourceOrigin),
  });
}

function refreshTemplateFormulaCachedValue(
  workbook: XLSX.WorkBook,
  patches: TemplatePatch[],
  sheet: string,
  cellAddress: string,
  cachedValue: string | number,
  label: string,
  source: string,
) {
  const worksheet = workbook.Sheets[sheet];

  if (!worksheet) {
    return;
  }

  const existing = worksheet[cellAddress];
  const previousFormula = typeof existing?.f === "string" ? existing.f : "";

  if (!previousFormula) {
    writeTemplateCell(workbook, patches, sheet, cellAddress, cachedValue, label, source, "web-derived");
    return;
  }

  const nextCell: XLSX.CellObject = {
    ...existing,
    t: typeof cachedValue === "number" ? "n" : "s",
    v: typeof cachedValue === "number" ? finiteNumber(cachedValue) : cachedValue,
    f: previousFormula,
  };

  delete nextCell.w;
  worksheet[cellAddress] = nextCell;
  patches.push({
    sheet,
    cell: cellAddress,
    label,
    value: cachedValue,
    source,
    status: "cached-formula",
    previousFormula,
    sourceOrigin: "web-derived",
    fontMark: "default",
  });
}

function writeTemplateTextIfPresent(
  workbook: XLSX.WorkBook,
  patches: TemplatePatch[],
  sheet: string,
  cellAddress: string,
  value: string,
  label: string,
) {
  if (!value.trim()) {
    return;
  }

  writeTemplateCell(workbook, patches, sheet, cellAddress, value, label, "Resolved WACC assumptions");
}

function writeTemplateRateInputIfPresent(
  workbook: XLSX.WorkBook,
  patches: TemplatePatch[],
  sheet: string,
  cellAddress: string,
  value: string,
  label: string,
  source: string,
) {
  if (!value.trim()) {
    return;
  }

  writeTemplateCell(workbook, patches, sheet, cellAddress, parseInputNumber(value), label, source);
}

function writeTemplateNumberIfPresent(
  workbook: XLSX.WorkBook,
  patches: TemplatePatch[],
  sheet: string,
  cellAddress: string,
  value: string,
  label: string,
) {
  if (!value.trim()) {
    return;
  }

  writeTemplateCell(workbook, patches, sheet, cellAddress, parseInputNumber(value), label, "Resolved WACC assumptions");
}

function writeTemplateRateIfPresent(
  workbook: XLSX.WorkBook,
  patches: TemplatePatch[],
  sheet: string,
  cellAddress: string,
  value: string,
  label: string,
) {
  writeTemplateNumberIfPresent(workbook, patches, sheet, cellAddress, value, label);
}

function aggregateMappedRows(mappedRows: MappedRow[], periodId: string, categories: AccountCategory[]): number {
  return mappedRows.reduce((sum, item) => {
    if (!categories.includes(item.effectiveCategory)) {
      return sum;
    }

    return sum + parseInputNumber(item.row.values[periodId] ?? "");
  }, 0);
}

function templateColumnForPeriod(period: Period): "C" | "D" | "E" | null {
  const yearOffset = getPeriodYearOffset(period);

  if (yearOffset === -2) {
    return "C";
  }

  if (yearOffset === -1) {
    return "D";
  }

  if (yearOffset === 0) {
    return "E";
  }

  return null;
}

function matchesTemplateAssetClass(assetName: string, key: string): boolean {
  const normalized = assetName.toLowerCase();

  if (key === "land") {
    return normalized.includes("land") || normalized.includes("tanah");
  }

  if (key === "building") {
    return normalized.includes("building") || normalized.includes("bangunan");
  }

  if (key === "equipment") {
    return normalized.includes("equipment") || normalized.includes("laboratory") || normalized.includes("machinery") || normalized.includes("sarana") || normalized.includes("prasarana");
  }

  if (key === "vehicle") {
    return normalized.includes("vehicle") || normalized.includes("heavy") || normalized.includes("kendaraan") || normalized.includes("alat berat");
  }

  if (key === "officeInventory") {
    return normalized.includes("office") || normalized.includes("inventory") || normalized.includes("inventaris");
  }

  if (key === "electrical") {
    return normalized.includes("electrical") || normalized.includes("listrik");
  }

  return false;
}

function dlomTemplateCompanyMarketability(companyType: string): string {
  return companyType === "Terbuka (Tbk)" ? "DLOM Perusahaan terbuka " : "DLOM Perusahaan tertutup ";
}

function dlocTemplateCompanyBasis(companyType: string): string {
  return companyType === "Terbuka (Tbk)" ? "DLOC Perusahaan terbuka " : "DLOC Perusahaan tertutup ";
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
  if (Object.is(value, -0)) {
    return 0;
  }

  return Number.isFinite(value) ? value : 0;
}

function nearlyEqual(left: number, right: number): boolean {
  return Math.abs(left - right) < 1e-9;
}

function createSheet(rows: SheetRow[], widths: number[]) {
  const worksheet = XLSX.utils.aoa_to_sheet(rows);
  worksheet["!cols"] = widths.map((wch) => ({ wch }));

  return { worksheet };
}

function appendSheet(workbook: XLSX.WorkBook, name: string, worksheet: XLSX.WorkSheet) {
  XLSX.utils.book_append_sheet(workbook, worksheet, name);
}

function downloadXlsxBytes(data: Uint8Array, filename: string) {
  const buffer = new ArrayBuffer(data.byteLength);
  new Uint8Array(buffer).set(data);
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = "none";
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
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

  return `${companyPart}-valuation-export-v1-${datePart}.xlsx`;
}

function buildTemplateWorkbookFilename(companyName: string, exportedAt: Date): string {
  const datePart = exportedAt.toISOString().slice(0, 10);
  const companyPart = slugify(companyName || "penilaian-valuasi-bisnis");

  return `${companyPart}-valuation-export-v2-template-clone-${datePart}.xlsx`;
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
