import { resolveAccountLabels } from "./account-labels";
import { categoryLabelMap } from "./category-options";
import { parseInputNumber, statementLabels } from "./case-model";
import {
  filterMappedRowsByValuationScope,
  resolveValuationExportScope,
  valuationExportScopes,
  type ValuationExportScope,
  type ValuationExportScopeId,
} from "./export-scopes";
import type { AnalysisRow } from "./section-analysis";
import type { TaxSimulationMethodRow } from "./tax-simulation";
import type { MethodOutput, ValuationMethod } from "./types";
import type { ValuationPdfExportInput } from "./pdf-export";

export type ValuationXlsxExportScopeId = ValuationExportScopeId;

export type XlsxCellValue = string | number | boolean | null | undefined;

export type XlsxSheet = {
  name: string;
  rows: XlsxCellValue[][];
};

export type ValuationXlsxWorkbook = {
  scope: ValuationExportScope;
  generatedAt: string;
  sheets: XlsxSheet[];
};

export type ValuationXlsxFile = {
  filename: string;
  bytes: Uint8Array;
  workbook: ValuationXlsxWorkbook;
};

type ReportMetric = {
  label: string;
  value: XlsxCellValue;
  note?: string;
};

const xlsxMimeType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

export function createValuationXlsxFile(
  input: ValuationPdfExportInput,
  scopeId: ValuationXlsxExportScopeId,
  exportedAt = new Date(),
): ValuationXlsxFile {
  const workbook = buildValuationXlsxWorkbook(input, scopeId, exportedAt);

  return {
    filename: buildXlsxExportFilename(input.caseProfile.objectTaxpayerName, workbook.scope.id, exportedAt),
    bytes: encodeXlsxWorkbook(workbook.sheets),
    workbook,
  };
}

export function buildValuationXlsxBlob(file: ValuationXlsxFile): Blob {
  const bytes = new Uint8Array(file.bytes);

  return new Blob([bytes.buffer as ArrayBuffer], { type: xlsxMimeType });
}

export function buildValuationXlsxWorkbook(
  input: ValuationPdfExportInput,
  scopeId: ValuationXlsxExportScopeId,
  exportedAt = new Date(),
): ValuationXlsxWorkbook {
  const scope = resolveValuationExportScope(scopeId);
  const scopedMappedRows = filterMappedRowsByValuationScope(input.mappedRows, scope);
  const methodOutputById: Record<ValuationMethod, MethodOutput> = {
    AAM: input.results.aam,
    EEM: input.results.eem,
    DCF: input.results.dcf,
  };
  const methodOutputs = scope.methods.map((method) => methodOutputById[method]);
  const scopedTaxRows = buildScopedTaxRows(input.taxSimulationResult.rows, input.taxSimulationResult.baselineRows, scope);
  const periods = input.sectionAnalysis.periods.length > 0 ? input.sectionAnalysis.periods : input.periods;
  const baseResults = input.baseResults ?? input.results;
  const sheets: XlsxSheet[] = [
    {
      name: "Summary",
      rows: buildSummaryRows(input, scope, exportedAt),
    },
    {
      name: "Method Summary",
      rows: buildMethodSummaryRows(methodOutputs, scopedTaxRows),
    },
    {
      name: "Drivers",
      rows: buildDriverRows(input, scope),
    },
    {
      name: "Source Accounts",
      rows: [
        [
          "Statement",
          "Account",
          "Category",
          "Treatment",
          "Confidence",
          "Review Required",
          "Labels",
          "Mapping Reason",
          ...periods.map((period) => period.label),
        ],
        ...scopedMappedRows.map((item) => [
          statementLabels[item.row.statement],
          item.row.accountName,
          categoryLabelMap.get(item.effectiveCategory) ?? item.effectiveCategory,
          item.mapping.treatment,
          item.mapping.confidence,
          item.mapping.needsReview ? "Yes" : "No",
          resolveAccountLabels(item.row.statement, item.effectiveCategory, item.row.labelOverrides).join(", "),
          item.mapping.reason,
          ...periods.map((period) => parseInputNumber(item.row.values[period.id] ?? "")),
        ]),
      ],
    },
  ];

  if (input.fixedAssetSchedule.hasInput) {
    sheets.push({
      name: "Fixed Assets",
      rows: buildFixedAssetRows(input),
    });
  }

  if (scope.methods.some((method) => method === "EEM" || method === "DCF")) {
    sheets.push({
      name: "EEM DCF Analysis",
      rows: [
        ...buildAnalysisRows("NOPLAT", input.sectionAnalysis.noplatRows, periods),
        [],
        ...buildAnalysisRows("FCF", input.sectionAnalysis.fcfRows, periods),
        [],
        ...buildAnalysisRows("Financial Ratio", input.sectionAnalysis.ratioRows, periods),
        [],
        ...buildAnalysisRows("ROIC", input.sectionAnalysis.roicRows, periods),
      ],
    });
    sheets.push({
      name: "Cash Flow",
      rows: [
        ...buildAnalysisRows("Payables", input.sectionAnalysis.payablesRows, periods),
        [],
        ...buildAnalysisRows("Cash Flow Statement", input.sectionAnalysis.cashFlowStatementRows, periods),
      ],
    });
  }

  if (scope.methods.includes("AAM")) {
    sheets.push({
      name: "AAM Adjustments",
      rows: buildAamAdjustmentRows(input),
    });
  }

  if (scope.methods.includes("EEM")) {
    sheets.push({
      name: "EEM Sensitivity",
      rows: [
        ["Scenario", "Equity Value 100%", "Audit Note"],
        [
          "EEM - skenario dasar",
          input.results.eem.equityValue,
          "NTA + excess earnings yang dikapitalisasi + aset non-operasional - utang berbunga.",
        ],
        [
          "EEM utang pajak debt-like",
          input.results.sensitivities.eemTaxPayableDebtLike.equityValue,
          "Utang pajak diperlakukan sebagai debt-like sensitivity.",
        ],
      ],
    });
  }

  if (scope.methods.includes("DCF")) {
    sheets.push({
      name: "DCF Sensitivity",
      rows: buildDcfSensitivityRows(input, baseResults),
    });
    sheets.push({
      name: "DCF Forecast",
      rows: buildDcfForecastRows(input),
    });
  }

  sheets.push({
    name: "Formula Trace",
    rows: buildFormulaTraceRows(methodOutputs),
  });

  sheets.push({
    name: "Tax Simulation",
    rows: buildTaxSimulationRows(scopedTaxRows),
  });

  return {
    scope,
    generatedAt: exportedAt.toISOString(),
    sheets: sheets.filter((sheet) => sheet.rows.length > 0),
  };
}

export function buildXlsxExportFilename(
  taxpayerName: string,
  scopeId: ValuationXlsxExportScopeId,
  exportedAt = new Date(),
): string {
  const scope = resolveValuationExportScope(scopeId);
  const taxpayerSlug = slugify(taxpayerName || "workbench");
  const scopeSlug = scope.id === "all" ? "aam-eem-dcf" : scope.id;
  const dateSlug = exportedAt.toISOString().slice(0, 10);

  return `penilaian-bisnis-${taxpayerSlug}-${scopeSlug}-${dateSlug}.xlsx`;
}

export function encodeXlsxWorkbook(sheets: XlsxSheet[]): Uint8Array {
  const usedSheetNames = new Set<string>();
  const normalizedSheets = sheets.map((sheet, index) => ({
    ...sheet,
    name: normalizeSheetName(sheet.name, index, usedSheetNames),
  }));
  const sharedStrings: string[] = [];
  const sharedStringIndex = new Map<string, number>();
  const worksheetEntries = normalizedSheets.map((sheet, index) => ({
    path: `xl/worksheets/sheet${index + 1}.xml`,
    content: buildWorksheetXml(sheet.rows, sharedStrings, sharedStringIndex),
  }));
  const entries: ZipEntryInput[] = [
    { path: "[Content_Types].xml", content: buildContentTypesXml(normalizedSheets.length) },
    { path: "_rels/.rels", content: buildRootRelationshipsXml() },
    { path: "docProps/app.xml", content: buildAppXml(normalizedSheets.map((sheet) => sheet.name)) },
    { path: "docProps/core.xml", content: buildCoreXml(new Date()) },
    { path: "xl/workbook.xml", content: buildWorkbookXml(normalizedSheets.map((sheet) => sheet.name)) },
    { path: "xl/_rels/workbook.xml.rels", content: buildWorkbookRelationshipsXml(normalizedSheets.length) },
    { path: "xl/styles.xml", content: buildStylesXml() },
    { path: "xl/sharedStrings.xml", content: buildSharedStringsXml(sharedStrings) },
    ...worksheetEntries,
  ];

  return createZip(entries);
}

function buildSummaryRows(input: ValuationPdfExportInput, scope: ValuationExportScope, exportedAt: Date): XlsxCellValue[][] {
  return [
    ["Penilaian Bisnis II - Export XLSX", scope.title],
    ["Scope", scope.label],
    ["Metode", scope.methods.join(" / ")],
    ["Dibuat", exportedAt.toISOString()],
    ["Deskripsi", scope.description],
    [],
    ["Nama Objek Pajak", input.caseProfile.objectTaxpayerName || "-"],
    ["NPWP Objek Pajak", input.caseProfile.objectTaxpayerNpwp || "-"],
    ["KLU", input.caseProfile.objectBusinessKlu || "-"],
    ["Sektor Perusahaan", input.caseProfile.companySector || "-"],
    ["Nama Subjek Pajak", input.caseProfile.subjectTaxpayerName || "-"],
    ["NPWP Subjek Pajak", input.caseProfile.subjectTaxpayerNpwp || "-"],
    ["Jenis Kepemilikan", input.caseProfile.shareOwnershipType || "-"],
    ["Jenis Peralihan", input.caseProfile.transferType || "-"],
    ["Tahun Transaksi", input.caseProfile.transactionYear || "-"],
    ["Objek Penilaian", input.caseProfile.valuationObject || "-"],
    ["Tanggal cut-off", input.caseProfileDerived.cutOffDate || "-"],
    ["Akhir Periode Proyeksi Pertama", input.caseProfileDerived.firstProjectionEndDate || "-"],
    [],
    ["Active WACC Basis", input.activeWaccBasisLabel || input.activeWaccBasis || "-"],
    ["Active WACC Summary", input.activeWaccBasisSummary || "-"],
    ["Active DCF Basis", scope.methods.includes("DCF") ? input.activeDcfBasisLabel || input.activeDcfBasis || "-" : "Tidak termasuk scope"],
    ["Active DCF Summary", scope.methods.includes("DCF") ? input.activeDcfBasisSummary || "-" : "Tidak termasuk scope"],
  ];
}

function buildMethodSummaryRows(methodOutputs: MethodOutput[], taxRows: TaxSimulationMethodRow[]): XlsxCellValue[][] {
  return [
    ["Method", "Equity Value 100%", "Transferred Interest Value", "Potential Tax", "Primary"],
    ...methodOutputs.map((output) => {
      const taxRow = taxRows.find((row) => row.method === output.method) ?? null;

      return [
        output.method,
        output.equityValue,
        taxRow?.marketValueOfTransferredInterest ?? null,
        taxRow?.potentialTax ?? null,
        taxRow?.isPrimary ? "Yes" : "No",
      ];
    }),
  ];
}

function buildDriverRows(input: ValuationPdfExportInput, scope: ValuationExportScope): XlsxCellValue[][] {
  return [
    ["Driver", "Value", "Note"],
    ...buildDriverMetrics(input, scope).map((metric) => [metric.label, metric.value, metric.note ?? ""]),
  ];
}

function buildDriverMetrics(input: ValuationPdfExportInput, scope: ValuationExportScope): ReportMetric[] {
  const metrics: ReportMetric[] = [
    { label: "Tax rate", value: input.snapshot.taxRate, note: input.resolvedAssumptions.taxRateSource || input.assumptions.taxRateSource },
  ];

  if (scope.methods.includes("AAM")) {
    metrics.push(
      { label: "Aset historis AAM", value: input.aamAdjustmentModel.historicalAssetTotal },
      { label: "Liabilitas historis AAM", value: input.aamAdjustmentModel.historicalLiabilityTotal },
      { label: "Penyesuaian aset AAM", value: input.aamAdjustmentModel.assetAdjustmentTotal },
      { label: "Penyesuaian liabilitas AAM", value: input.aamAdjustmentModel.liabilityAdjustmentTotal },
    );
  }

  if (scope.methods.includes("EEM")) {
    metrics.push(
      { label: "Required return on NTA", value: input.snapshot.requiredReturnOnNta },
      { label: "Operating working capital", value: input.results.operatingWorkingCapital },
      { label: "Non-operating assets", value: input.results.nonOperatingAssets },
    );
  }

  if (scope.methods.some((method) => method === "EEM" || method === "DCF")) {
    metrics.push({
      label: "WACC",
      value: input.snapshot.wacc,
      note: input.activeWaccBasisLabel || input.resolvedAssumptions.waccSource || input.assumptions.waccSource,
    });
  }

  if (scope.methods.includes("DCF")) {
    metrics.push(
      { label: "Basis DCF aktif", value: input.activeDcfBasisLabel || "DCF - skenario dasar", note: input.activeDcfBasisSummary || "Default sistem" },
      {
        label: "Terminal growth",
        value: input.snapshot.terminalGrowth,
        note: input.resolvedAssumptions.terminalGrowthSource || input.assumptions.terminalGrowthSource,
      },
      { label: "Revenue growth", value: input.snapshot.revenueGrowth },
      { label: "Nilai aktif DCF", value: input.results.dcf.equityValue, note: input.results.projectionGovernance.title },
    );
  }

  return uniqueMetrics(metrics);
}

function buildFixedAssetRows(input: ValuationPdfExportInput): XlsxCellValue[][] {
  const periods = input.sectionAnalysis.periods.length > 0 ? input.sectionAnalysis.periods : input.periods;

  return [
    [
      "Asset",
      "Period",
      "Acquisition Beginning",
      "Acquisition Additions",
      "Acquisition Ending",
      "Depreciation Beginning",
      "Depreciation Additions",
      "Depreciation Ending",
      "Net Value",
    ],
    ...input.fixedAssetSchedule.rows.flatMap((item) =>
      periods.map((period) => {
        const amounts = item.amounts[period.id];

        return [
          item.row.assetName || "-",
          period.label,
          amounts?.acquisitionBeginning ?? null,
          amounts?.acquisitionAdditions ?? null,
          amounts?.acquisitionEnding ?? null,
          amounts?.depreciationBeginning ?? null,
          amounts?.depreciationAdditions ?? null,
          amounts?.depreciationEnding ?? null,
          amounts?.netValue ?? null,
        ];
      }),
    ),
    [],
    ["Total"],
    ...periods.map((period) => {
      const amounts = input.fixedAssetSchedule.totals[period.id];

      return [
        "Total",
        period.label,
        amounts?.acquisitionBeginning ?? null,
        amounts?.acquisitionAdditions ?? null,
        amounts?.acquisitionEnding ?? null,
        amounts?.depreciationBeginning ?? null,
        amounts?.depreciationAdditions ?? null,
        amounts?.depreciationEnding ?? null,
        amounts?.netValue ?? null,
      ];
    }),
  ];
}

function buildAnalysisRows(title: string, rows: AnalysisRow[], periods: ValuationPdfExportInput["periods"]): XlsxCellValue[][] {
  return [
    [title],
    ["Kind", "Key", "Label", "Source", "Formula", "Note", ...periods.map((period) => period.label)],
    ...rows.map((row) => [
      row.kind ?? "value",
      row.key,
      row.label,
      row.source,
      row.formula,
      row.note ?? "",
      ...periods.map((period) => row.values[period.id] ?? null),
    ]),
  ];
}

function buildAamAdjustmentRows(input: ValuationPdfExportInput): XlsxCellValue[][] {
  const lines = [...input.aamAdjustmentModel.assetLines, ...input.aamAdjustmentModel.liabilityLines];

  return [
    ["Role", "Section", "Line", "Source", "Historical", "Adjustment", "Adjusted", "Requires Note", "Note"],
    ...lines.map((line) => [
      line.role === "asset" ? "Aset" : "Liabilitas",
      line.section,
      line.label,
      line.source,
      line.historical,
      line.adjustment,
      line.adjusted,
      line.requiresNote ? "Yes" : "No",
      line.note || (line.requiresNote ? "Catatan penyesuaian belum diisi." : ""),
    ]),
    [],
    ["Metric", "Value"],
    ["Total aset historis", input.aamAdjustmentModel.historicalAssetTotal],
    ["Total penyesuaian aset", input.aamAdjustmentModel.assetAdjustmentTotal],
    ["Total liabilitas historis", input.aamAdjustmentModel.historicalLiabilityTotal],
    ["Total penyesuaian liabilitas", input.aamAdjustmentModel.liabilityAdjustmentTotal],
    ["Nilai ekuitas AAM", input.aamAdjustmentModel.adjustedEquityValue],
    ["Catatan wajib belum lengkap", input.aamAdjustmentModel.missingNoteCount],
  ];
}

function buildDcfSensitivityRows(
  input: ValuationPdfExportInput,
  baseResults: NonNullable<ValuationPdfExportInput["baseResults"]>,
): XlsxCellValue[][] {
  return [
    ["Scenario", "Value", "Audit Note"],
    ["Basis DCF aktif", input.results.dcf.equityValue, input.activeDcfBasisSummary || "Default sistem."],
    ["DCF - skenario dasar", baseResults.dcf.equityValue, "Nilai dasar dari engine FCFF/WACC."],
    ["DCF - terminal downside", baseResults.sensitivities.dcfTerminalDownside.equityValue, "Terminal growth downside."],
    ["DCF - terminal upside", baseResults.sensitivities.dcfTerminalUpside.equityValue, "Terminal growth upside."],
    ["DCF tanpa WC incremental", baseResults.sensitivities.dcfNoIncrementalWorkingCapital.equityValue, "Perubahan modal kerja dinonaktifkan."],
    ["DCF utang pajak debt-like", baseResults.sensitivities.dcfTaxPayableDebtLike.equityValue, "Utang pajak dikurangkan sebagai debt-like sensitivity."],
    [
      "DCF - proyeksi neraca berbasis historis",
      baseResults.sensitivities.dcfHistoricalDerivedProjection.equityValue,
      "Kebijakan kas, utang pajak, dan roll-forward ekuitas diturunkan dari historis.",
    ],
    ["Nilai DCF governed aktif", input.results.projectionGovernance.governedEquityValue, input.results.projectionGovernance.summary],
    ["Variance governance proyeksi DCF", input.results.projectionGovernance.relativeVariance, input.results.projectionGovernance.title],
  ];
}

function buildDcfForecastRows(input: ValuationPdfExportInput): XlsxCellValue[][] {
  return [
    [
      "Year",
      "Revenue",
      "COGS",
      "Gross Profit",
      "Operating Expenses",
      "Depreciation",
      "EBIT",
      "Tax on EBIT",
      "NOPLAT",
      "Change in NWC",
      "Capital Expenditure",
      "Free Cash Flow",
      "Discount Factor",
      "Present Value",
      "Cash Ending",
      "Operating NWC",
      "Balance Control",
      "Cash Flow Control",
    ],
    ...input.results.dcf.forecast.map((row) => [
      row.year,
      row.revenue,
      row.cogs,
      row.grossProfit,
      row.operatingExpenses,
      row.depreciation,
      row.ebit,
      row.statutoryTaxOnEbit,
      row.noplat,
      row.changeInNwc,
      row.capitalExpenditure,
      row.freeCashFlow,
      row.discountFactor,
      row.presentValue,
      row.cashEndingBalance,
      row.operatingNwc,
      row.balanceControl,
      row.cashFlowControl,
    ]),
  ];
}

function buildFormulaTraceRows(methodOutputs: MethodOutput[]): XlsxCellValue[][] {
  return [
    ["Method", "Trace", "Formula", "Value", "Value Format", "Note"],
    ...methodOutputs.flatMap((method) => method.traces.map((trace) => [method.method, trace.label, trace.formula, trace.value, trace.valueFormat ?? "currency", trace.note])),
  ];
}

function buildTaxSimulationRows(rows: TaxSimulationMethodRow[]): XlsxCellValue[][] {
  return [
    [
      "Method",
      "Basis",
      "Base Equity Value",
      "DLOM Rate",
      "DLOC/PFC Rate",
      "Transferred Interest Value",
      "Reported Transfer Value",
      "Taxable Difference",
      "Potential Tax",
      "Effective Tax Rate",
      "Primary",
      "Legal Basis",
    ],
    ...rows.map((row) => [
      row.method,
      row.basisLabel,
      row.baseEquityValue,
      row.dlomRate,
      row.dlocPfcRate,
      row.marketValueOfTransferredInterest,
      row.reportedTransferValue,
      row.transferValueDifference,
      row.potentialTax,
      row.effectiveTaxRate,
      row.isPrimary ? "Yes" : "No",
      row.taxSourceLegalBasis || row.taxBasisLabel,
    ]),
  ];
}

function buildScopedTaxRows(
  activeRows: TaxSimulationMethodRow[],
  baselineRows: TaxSimulationMethodRow[],
  scope: ValuationExportScope,
): TaxSimulationMethodRow[] {
  return scope.methods.flatMap((method) => {
    const row = activeRows.find((item) => item.method === method) ?? baselineRows.find((item) => item.method === method);
    return row ? [row] : [];
  });
}

function uniqueMetrics(metrics: ReportMetric[]): ReportMetric[] {
  const seen = new Set<string>();

  return metrics.filter((metric) => {
    if (seen.has(metric.label)) {
      return false;
    }

    seen.add(metric.label);
    return true;
  });
}

function slugify(value: string): string {
  const slug = value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "workbench";
}

function normalizeSheetName(name: string, index: number, usedNames: Set<string>): string {
  const fallback = `Sheet ${index + 1}`;
  const cleaned = (name || fallback).replace(/[\[\]:*?/\\]/g, " ").trim() || fallback;
  let candidate = cleaned.slice(0, 31);
  let suffix = 1;

  while (usedNames.has(candidate)) {
    const suffixText = ` ${suffix}`;
    candidate = `${cleaned.slice(0, 31 - suffixText.length)}${suffixText}`;
    suffix += 1;
  }

  usedNames.add(candidate);
  return candidate;
}

function buildWorksheetXml(
  rows: XlsxCellValue[][],
  sharedStrings: string[],
  sharedStringIndex: Map<string, number>,
): string {
  const body = rows
    .map((row, rowIndex) => {
      const rowNumber = rowIndex + 1;
      const cells = row
        .map((value, columnIndex) => buildCellXml(value, columnIndex + 1, rowNumber, rowIndex <= 1, sharedStrings, sharedStringIndex))
        .join("");

      return `<row r="${rowNumber}">${cells}</row>`;
    })
    .join("");
  const maxColumnCount = Math.max(1, ...rows.map((row) => row.length));
  const dimension = `A1:${cellReference(maxColumnCount, Math.max(rows.length, 1))}`;

  return xmlDocument(
    `<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><dimension ref="${dimension}"/><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><sheetFormatPr defaultRowHeight="15"/><cols>${buildColumnWidths(maxColumnCount)}</cols><sheetData>${body}</sheetData></worksheet>`,
  );
}

function buildCellXml(
  value: XlsxCellValue,
  columnNumber: number,
  rowNumber: number,
  isHeader: boolean,
  sharedStrings: string[],
  sharedStringIndex: Map<string, number>,
): string {
  if (value === null || value === undefined || value === "") {
    return "";
  }

  const reference = cellReference(columnNumber, rowNumber);
  const style = isHeader ? ' s="1"' : "";

  if (typeof value === "number" && Number.isFinite(value)) {
    return `<c r="${reference}"${style}><v>${value}</v></c>`;
  }

  if (typeof value === "boolean") {
    return `<c r="${reference}" t="b"${style}><v>${value ? 1 : 0}</v></c>`;
  }

  const text = String(value);
  const sharedIndex = getSharedStringIndex(text, sharedStrings, sharedStringIndex);

  return `<c r="${reference}" t="s"${style}><v>${sharedIndex}</v></c>`;
}

function buildColumnWidths(columnCount: number): string {
  return Array.from({ length: columnCount }, (_, index) => {
    const width = index === 0 ? 24 : index === 1 ? 28 : 18;
    return `<col min="${index + 1}" max="${index + 1}" width="${width}" customWidth="1"/>`;
  }).join("");
}

function getSharedStringIndex(value: string, sharedStrings: string[], sharedStringIndex: Map<string, number>): number {
  const existingIndex = sharedStringIndex.get(value);

  if (existingIndex !== undefined) {
    return existingIndex;
  }

  const nextIndex = sharedStrings.length;
  sharedStrings.push(value);
  sharedStringIndex.set(value, nextIndex);
  return nextIndex;
}

function buildContentTypesXml(sheetCount: number): string {
  const sheetOverrides = Array.from(
    { length: sheetCount },
    (_, index) =>
      `<Override PartName="/xl/worksheets/sheet${index + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`,
  ).join("");

  return xmlDocument(
    `<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/><Override PartName="/xl/sharedStrings.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml"/><Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/><Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>${sheetOverrides}</Types>`,
  );
}

function buildRootRelationshipsXml(): string {
  return xmlDocument(
    `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/></Relationships>`,
  );
}

function buildWorkbookXml(sheetNames: string[]): string {
  const sheets = sheetNames
    .map((name, index) => `<sheet name="${escapeXmlAttribute(name)}" sheetId="${index + 1}" r:id="rId${index + 1}"/>`)
    .join("");

  return xmlDocument(
    `<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><workbookPr date1904="false"/><sheets>${sheets}</sheets></workbook>`,
  );
}

function buildWorkbookRelationshipsXml(sheetCount: number): string {
  const sheetRelationships = Array.from(
    { length: sheetCount },
    (_, index) =>
      `<Relationship Id="rId${index + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet${index + 1}.xml"/>`,
  ).join("");
  const styleId = sheetCount + 1;
  const sharedStringId = sheetCount + 2;

  return xmlDocument(
    `<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${sheetRelationships}<Relationship Id="rId${styleId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/><Relationship Id="rId${sharedStringId}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings" Target="sharedStrings.xml"/></Relationships>`,
  );
}

function buildSharedStringsXml(strings: string[]): string {
  const items = strings.map((item) => `<si><t${/^\s|\s$/.test(item) ? ' xml:space="preserve"' : ""}>${escapeXmlText(item)}</t></si>`).join("");

  return xmlDocument(`<sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" count="${strings.length}" uniqueCount="${strings.length}">${items}</sst>`);
}

function buildStylesXml(): string {
  return xmlDocument(
    `<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="2"><font><sz val="11"/><color theme="1"/><name val="Calibri"/><family val="2"/></font><font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/><family val="2"/></font></fonts><fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF0F766E"/><bgColor indexed="64"/></patternFill></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1"/></cellXfs><cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles><dxfs count="0"/><tableStyles count="0" defaultTableStyle="TableStyleMedium2" defaultPivotStyle="PivotStyleLight16"/></styleSheet>`,
  );
}

function buildAppXml(sheetNames: string[]): string {
  const titles = sheetNames.map((name) => `<vt:lpstr>${escapeXmlText(name)}</vt:lpstr>`).join("");

  return xmlDocument(
    `<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes"><Application>Penilaian Bisnis II</Application><DocSecurity>0</DocSecurity><ScaleCrop>false</ScaleCrop><HeadingPairs><vt:vector size="2" baseType="variant"><vt:variant><vt:lpstr>Worksheets</vt:lpstr></vt:variant><vt:variant><vt:i4>${sheetNames.length}</vt:i4></vt:variant></vt:vector></HeadingPairs><TitlesOfParts><vt:vector size="${sheetNames.length}" baseType="lpstr">${titles}</vt:vector></TitlesOfParts></Properties>`,
  );
}

function buildCoreXml(createdAt: Date): string {
  const timestamp = createdAt.toISOString();

  return xmlDocument(
    `<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:creator>Penilaian Bisnis II</dc:creator><cp:lastModifiedBy>Penilaian Bisnis II</cp:lastModifiedBy><dcterms:created xsi:type="dcterms:W3CDTF">${timestamp}</dcterms:created><dcterms:modified xsi:type="dcterms:W3CDTF">${timestamp}</dcterms:modified></cp:coreProperties>`,
  );
}

function cellReference(columnNumber: number, rowNumber: number): string {
  let column = "";
  let remaining = columnNumber;

  while (remaining > 0) {
    const modulo = (remaining - 1) % 26;
    column = String.fromCharCode(65 + modulo) + column;
    remaining = Math.floor((remaining - modulo - 1) / 26);
  }

  return `${column}${rowNumber}`;
}

function xmlDocument(content: string): string {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>${content}`;
}

function escapeXmlText(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function escapeXmlAttribute(value: string): string {
  return escapeXmlText(value);
}

type ZipEntryInput = {
  path: string;
  content: string;
};

type PreparedZipEntry = {
  pathBytes: Uint8Array;
  contentBytes: Uint8Array;
  crc: number;
  offset: number;
};

const textEncoder = new TextEncoder();
const crcTable = buildCrcTable();

function createZip(entries: ZipEntryInput[]): Uint8Array {
  const prepared: PreparedZipEntry[] = [];
  const localParts: Uint8Array[] = [];
  let offset = 0;

  for (const entry of entries) {
    const pathBytes = textEncoder.encode(entry.path);
    const contentBytes = textEncoder.encode(entry.content);
    const crc = crc32(contentBytes);
    const localHeader = new Uint8Array(30 + pathBytes.length);
    const view = new DataView(localHeader.buffer);

    writeUint32(view, 0, 0x04034b50);
    writeUint16(view, 4, 20);
    writeUint16(view, 6, 0);
    writeUint16(view, 8, 0);
    writeUint16(view, 10, 0);
    writeUint16(view, 12, 0);
    writeUint32(view, 14, crc);
    writeUint32(view, 18, contentBytes.length);
    writeUint32(view, 22, contentBytes.length);
    writeUint16(view, 26, pathBytes.length);
    writeUint16(view, 28, 0);
    localHeader.set(pathBytes, 30);

    prepared.push({ pathBytes, contentBytes, crc, offset });
    localParts.push(localHeader, contentBytes);
    offset += localHeader.length + contentBytes.length;
  }

  const centralDirectoryStart = offset;
  const centralParts: Uint8Array[] = [];

  for (const entry of prepared) {
    const centralHeader = new Uint8Array(46 + entry.pathBytes.length);
    const view = new DataView(centralHeader.buffer);

    writeUint32(view, 0, 0x02014b50);
    writeUint16(view, 4, 20);
    writeUint16(view, 6, 20);
    writeUint16(view, 8, 0);
    writeUint16(view, 10, 0);
    writeUint16(view, 12, 0);
    writeUint16(view, 14, 0);
    writeUint32(view, 16, entry.crc);
    writeUint32(view, 20, entry.contentBytes.length);
    writeUint32(view, 24, entry.contentBytes.length);
    writeUint16(view, 28, entry.pathBytes.length);
    writeUint16(view, 30, 0);
    writeUint16(view, 32, 0);
    writeUint16(view, 34, 0);
    writeUint16(view, 36, 0);
    writeUint32(view, 38, 0);
    writeUint32(view, 42, entry.offset);
    centralHeader.set(entry.pathBytes, 46);

    centralParts.push(centralHeader);
    offset += centralHeader.length;
  }

  const centralDirectorySize = offset - centralDirectoryStart;
  const endOfCentralDirectory = new Uint8Array(22);
  const endView = new DataView(endOfCentralDirectory.buffer);

  writeUint32(endView, 0, 0x06054b50);
  writeUint16(endView, 4, 0);
  writeUint16(endView, 6, 0);
  writeUint16(endView, 8, prepared.length);
  writeUint16(endView, 10, prepared.length);
  writeUint32(endView, 12, centralDirectorySize);
  writeUint32(endView, 16, centralDirectoryStart);
  writeUint16(endView, 20, 0);

  return concatUint8Arrays([...localParts, ...centralParts, endOfCentralDirectory]);
}

function concatUint8Arrays(parts: Uint8Array[]): Uint8Array {
  const totalLength = parts.reduce((sum, part) => sum + part.length, 0);
  const output = new Uint8Array(totalLength);
  let offset = 0;

  for (const part of parts) {
    output.set(part, offset);
    offset += part.length;
  }

  return output;
}

function writeUint16(view: DataView, offset: number, value: number): void {
  view.setUint16(offset, value, true);
}

function writeUint32(view: DataView, offset: number, value: number): void {
  view.setUint32(offset, value >>> 0, true);
}

function buildCrcTable(): Uint32Array {
  const table = new Uint32Array(256);

  for (let index = 0; index < 256; index += 1) {
    let value = index;

    for (let bit = 0; bit < 8; bit += 1) {
      value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
    }

    table[index] = value >>> 0;
  }

  return table;
}

function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;

  for (const byte of bytes) {
    crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  }

  return (crc ^ 0xffffffff) >>> 0;
}

export const valuationXlsxExportScopes = valuationExportScopes;
