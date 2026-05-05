"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Banknote,
  Calculator,
  CalendarDays,
  CheckCircle2,
  Download,
  Eraser,
  FileSearch,
  FileText,
  GitBranch,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Redo2,
  TableProperties,
  Trash2,
  Undo2,
} from "lucide-react";
import { accountMappingRules } from "@/lib/valuation/account-taxonomy";
import {
  applyBalanceSheetClassificationToDisplayLabels,
  balanceSheetClassificationLabelMap,
  balanceSheetClassificationValueSet,
  getBalanceSheetClassificationOptions,
  getEffectiveBalanceSheetClassification,
  inferBalanceSheetClassification,
} from "@/lib/valuation/balance-sheet-classification";
import { buildBalanceSheetView, groupBalanceSheetLines, type BalanceSheetView } from "@/lib/valuation/balance-sheet-view";
import {
  buildIncomeStatementView,
  formatIncomeStatementInputValue,
  type IncomeStatementView,
} from "@/lib/valuation/income-statement-view";
import {
  accountLabelDefinitions,
  getAccountLabelDefinition,
  getCategoryLabelProfile,
  resolveAccountLabels,
  sanitizeAccountLabels,
  type AccountLabelId,
} from "@/lib/valuation/account-labels";
import {
  buildDcfForecast,
  calculateAllMethods,
  normalizedNoplat,
  type DcfFixedAssetProjectionInput,
} from "@/lib/valuation/calculations";
import {
  aamAdjustmentLineIds,
  buildAamAdjustmentModel,
  type AamAdjustmentLine,
  type AamAdjustmentState,
} from "@/lib/valuation/aam-adjustments";
import {
  buildFixedAssetScheduleSummary,
  buildCaseProfileDerived,
  buildSampleFixedAssetScheduleRows,
  buildSampleCaseProfile,
  buildSampleAssumptions,
  buildSamplePeriods,
  buildSampleRows,
  buildSnapshot,
  companySectorOptions,
  companyTypeOptions,
  createFixedAssetScheduleRow,
  createHistoricalPeriod,
  createRow,
  emptyCaseProfile,
  emptyAssumptions,
  ensureFixedAssetSchedulePeriods,
  fixedAssetScheduleValueKeys,
  getChronologicalPeriods,
  getDefaultActivePeriod,
  getNextHistoricalPeriodOffset,
  getPeriodLabel,
  getPeriodYearOffset,
  initialPeriods,
  mapRow,
  normalizePeriods,
  parseInputNumber,
  shareOwnershipTypeOptions,
  subjectTaxpayerTypeOptions,
  statementLabels,
  transferTypeOptions,
  valuationObjectOptions,
  type AccountRow,
  type AssumptionState,
  type BalanceSheetClassification,
  type CaseProfile,
  type CaseProfileDerived,
  type FixedAssetPeriodAmounts,
  type FixedAssetScheduleRow,
  type FixedAssetScheduleSummary,
  type FixedAssetScheduleValueKey,
  type MappedRow,
  type Period,
  type StatementType,
} from "@/lib/valuation/case-model";
import { categoryLabelMap, categoryOptions, categoryOptionsByStatement } from "@/lib/valuation/category-options";
import { formatDisplayDate, formatEditableNumber, formatIdr, formatInputNumber, formatPercent, formatScore } from "@/lib/valuation/format";
import {
  formatKluOptionLabel,
  getKluSectorRecord,
  normalizeKluCode,
  searchKluSectorRecords,
  type KluSectorRecord,
} from "@/lib/valuation/klu-sector";
import { buildWorkbenchReadiness, type SectionReadiness, type WorkbenchReadiness, type WorkbenchSectionId } from "@/lib/valuation/readiness";
import {
  buildSectionAnalysis,
  type AnalysisRow,
  type AnalysisValue,
  type CashFlowOverrideEntry,
  type CashFlowOverrideState,
  type CashFlowOverrideStatus,
  type CashFlowStatementRow,
  type PeriodAnalysis,
  type RatioRow,
  type SectionAnalysis,
} from "@/lib/valuation/section-analysis";
import { buildValidationChecks } from "@/lib/valuation/validation-checks";
import { downloadValuationTemplateWorkbook } from "@/lib/valuation/excel-export";
import { saveValuationPdfExportPayload } from "@/lib/valuation/pdf-export";
import {
  buildFixedAssetProjection,
  fixedAssetProjectionClassLabels,
  type FixedAssetProjectionMode,
  type FixedAssetProjectionSummary,
} from "@/lib/valuation/fixed-asset-projection";
import {
  buildSampleDlomState,
  calculateDlom,
  createEmptyDlomState,
  dlomFactorDefinitions,
  normalizeDlomState,
  workbookUpdateDlomBasisOverride,
  type DlomBasisOverride,
  type DlomFactorId,
  type DlomState,
  type DlomCalculation,
} from "@/lib/valuation/dlom";
import {
  buildSampleDlocPfcState,
  calculateDlocPfc,
  createEmptyDlocPfcState,
  dlocPfcFactorDefinitions,
  normalizeDlocPfcState,
  type DlocPfcCalculation,
  type DlocPfcFactorId,
  type DlocPfcState,
} from "@/lib/valuation/dloc-pfc";
import {
  buildSampleTaxSimulationState,
  calculateTaxSimulation,
  createEmptyTaxSimulationState,
  normalizeTaxSimulationState,
  type TaxSimulationFinalBasis,
  type TaxSimulationResult,
  type TaxSimulationState,
} from "@/lib/valuation/tax-simulation";
import {
  buildAssumptionGovernance,
  type AssumptionGovernanceItem,
  type AssumptionGovernanceResult,
  type AssumptionGovernanceTarget,
} from "@/lib/valuation/assumption-governance";
import {
  buildTaxRateCandidates,
  requiredReturnOnNtaInputReferences,
  terminalGrowthInputReferences,
  waccInputReferences,
  type AssumptionCandidate,
  type AssumptionReference,
} from "@/lib/valuation/assumption-candidates";
import {
  averageInvestmentLoanRate,
  getMarketAssumptionSuggestion,
  getSupportedMarketSuggestionYears,
  type MarketAssumptionSuggestion,
} from "@/lib/valuation/market-assumption-suggestions";
import {
  buildRequiredReturnOnNtaSuggestion,
  calculateWaccBankLoanRateAssumption,
  calculateRequiredReturnOnNtaAssumption,
  calculateWaccComparableBetaAssumption,
  calculateWaccAssumption,
  readRateInput,
  roundDiscountRateDebtRate,
  type RequiredReturnOnNtaSuggestion,
  type RequiredReturnOnNtaSuggestionField,
  type RequiredReturnOnNtaSuggestionKey,
  type WaccBankLoanRateCalculation,
  type WaccComparableBetaCalculation,
  type RequiredReturnOnNtaCalculation,
  type WaccCalculation,
} from "@/lib/valuation/assumption-calculators";
import {
  findIdxComparableByLabel,
  formatIdxComparableLabel,
  getIdxComparablesBySector,
  getSuggestedIdxComparables,
  type IdxComparableCompany,
} from "@/lib/valuation/idx-comparable-suggestions";
import {
  buildTerminalGrowthSuggestion,
  type TerminalGrowthSuggestion,
} from "@/lib/valuation/terminal-growth-suggestions";
import type { AccountCategory, DcfForecastRow, FinancialStatementSnapshot, FormulaTrace, ValuationMethod } from "@/lib/valuation/types";
const confidenceBandLabels: Record<ReturnType<typeof mapRow>["mapping"]["confidenceBand"], string> = {
  high: "Tinggi",
  medium: "Sedang",
  low: "Rendah",
  none: "Tidak ada",
};
const categoryValueSet = new Set<AccountCategory>(categoryOptions.map((option) => option.value));
const statementValueSet = new Set<StatementType>(["balance_sheet", "income_statement", "fixed_asset"]);
const assumptionKeys: Array<keyof AssumptionState> = [
  "taxRate",
  "taxRateSource",
  "taxRateOverrideReason",
  "terminalGrowth",
  "terminalGrowthSource",
  "terminalGrowthOverrideReason",
  "terminalGrowthDownside",
  "terminalGrowthUpside",
  "revenueGrowth",
  "wacc",
  "waccSource",
  "waccOverrideReason",
  "waccRiskFreeRate",
  "waccBeta",
  "waccEquityRiskPremium",
  "waccRatingBasedDefaultSpread",
  "waccCountryRiskPremium",
  "waccSpecificRiskPremium",
  "waccPreTaxCostOfDebt",
  "waccBankPerseroInvestmentLoanRate",
  "waccBankPemdaInvestmentLoanRate",
  "waccBankSwastaInvestmentLoanRate",
  "waccBankAsingInvestmentLoanRate",
  "waccBankCampuranInvestmentLoanRate",
  "waccBankUmumInvestmentLoanRate",
  "waccDebtWeight",
  "waccEquityWeight",
  "waccDebtMarketValue",
  "waccEquityMarketValue",
  "waccComparable1Name",
  "waccComparable1BetaLevered",
  "waccComparable1MarketCap",
  "waccComparable1Debt",
  "waccComparable2Name",
  "waccComparable2BetaLevered",
  "waccComparable2MarketCap",
  "waccComparable2Debt",
  "waccComparable3Name",
  "waccComparable3BetaLevered",
  "waccComparable3MarketCap",
  "waccComparable3Debt",
  "requiredReturnOnNta",
  "requiredReturnOnNtaSource",
  "requiredReturnOnNtaOverrideReason",
  "requiredReturnReceivablesCapacity",
  "requiredReturnInventoryCapacity",
  "requiredReturnFixedAssetCapacity",
  "requiredReturnAdditionalCapacity",
  "requiredReturnAfterTaxDebtCost",
  "requiredReturnEquityCost",
  "arDays",
  "inventoryDays",
  "apDays",
  "otherPayableDays",
];

const caseProfileKeys: Array<keyof CaseProfile> = [
  "objectTaxpayerName",
  "objectBusinessKlu",
  "objectTaxpayerNpwp",
  "companySector",
  "companyType",
  "subjectTaxpayerName",
  "subjectTaxpayerNpwp",
  "subjectTaxpayerType",
  "shareOwnershipType",
  "transferType",
  "capitalBaseFull",
  "capitalBaseValued",
  "transactionYear",
  "valuationObject",
];

type DriverAssumptionKey = "taxRate" | "terminalGrowth" | "wacc" | "requiredReturnOnNta";

const assumptionSourceKeyByDriver: Record<DriverAssumptionKey, keyof AssumptionState> = {
  taxRate: "taxRateSource",
  terminalGrowth: "terminalGrowthSource",
  wacc: "waccSource",
  requiredReturnOnNta: "requiredReturnOnNtaSource",
};

const assumptionReasonKeyByDriver: Record<DriverAssumptionKey, keyof AssumptionState> = {
  taxRate: "taxRateOverrideReason",
  terminalGrowth: "terminalGrowthOverrideReason",
  wacc: "waccOverrideReason",
  requiredReturnOnNta: "requiredReturnOnNtaOverrideReason",
};

const manualSourceByDriver: Record<DriverAssumptionKey, string> = {
  taxRate: "manual-tax-rate",
  terminalGrowth: "manual-terminal-growth",
  wacc: "manual-wacc",
  requiredReturnOnNta: "manual-required-return-on-nta",
};

type AutoWaccCapitalValues = {
  debtMarketValue: number;
  equityMarketValue: number;
};

type WaccComparableSlot = {
  name: keyof AssumptionState;
  beta: keyof AssumptionState;
  marketCap: keyof AssumptionState;
  debt: keyof AssumptionState;
};

const waccComparableSlots: WaccComparableSlot[] = [
  { name: "waccComparable1Name", beta: "waccComparable1BetaLevered", marketCap: "waccComparable1MarketCap", debt: "waccComparable1Debt" },
  { name: "waccComparable2Name", beta: "waccComparable2BetaLevered", marketCap: "waccComparable2MarketCap", debt: "waccComparable2Debt" },
  { name: "waccComparable3Name", beta: "waccComparable3BetaLevered", marketCap: "waccComparable3MarketCap", debt: "waccComparable3Debt" },
];

const requiredReturnSuggestionOrder: RequiredReturnOnNtaSuggestionKey[] = [
  "requiredReturnReceivablesCapacity",
  "requiredReturnInventoryCapacity",
  "requiredReturnFixedAssetCapacity",
  "requiredReturnAdditionalCapacity",
  "requiredReturnAfterTaxDebtCost",
  "requiredReturnEquityCost",
];

const WORKBENCH_STORAGE_KEY = "penilaian-valuasi-bisnis.workbench.v1";
const WORKBENCH_SCROLL_STORAGE_KEY = "penilaian-valuasi-bisnis.scroll.v1";
const WORKBENCH_SIDEBAR_STORAGE_KEY = "penilaian-valuasi-bisnis.sidebar.v1";
const WORKBENCH_STORAGE_VERSION = 13;
const defaultFixedAssetProjectionMode: FixedAssetProjectionMode = "workbook-formula";

type PersistedWorkbenchState = {
  version: typeof WORKBENCH_STORAGE_VERSION;
  savedAt: string;
  periods: Period[];
  activePeriodId: string;
  rows: AccountRow[];
  isFixedAssetScheduleEnabled: boolean;
  fixedAssetScheduleRows: FixedAssetScheduleRow[];
  fixedAssetProjectionMode: FixedAssetProjectionMode;
  aamAdjustments: AamAdjustmentState;
  assumptions: AssumptionState;
  caseProfile: CaseProfile;
  dlom: DlomState;
  dlocPfc: DlocPfcState;
  taxSimulation: TaxSimulationState;
  cashFlowOverrides: CashFlowOverrideState;
};

type WorkbenchCoreState = Omit<PersistedWorkbenchState, "version" | "savedAt">;

type WorkflowTabId = WorkbenchSectionId;

declare global {
  interface Window {
    __PVB_TEST_HOOKS__?: {
      loadSampleWorkbook: () => void;
    };
  }
}

const workflowTabs: Array<{ id: WorkflowTabId; label: string }> = [
  { id: "periods", label: "Data Awal" },
  { id: "balance", label: "Neraca & Aset Tetap" },
  { id: "income", label: "Laba Rugi" },
  { id: "wacc", label: "WACC" },
  { id: "eemDcfAssumptions", label: "Asumsi EEM/DCF" },
  { id: "valuationAam", label: "Penilaian AAM" },
  { id: "valuationEemDcf", label: "Penilaian EEM/DCF" },
  { id: "projectedIncome", label: "Proyeksi Laba Rugi" },
  { id: "projectedBalance", label: "Proyeksi Neraca" },
  { id: "projectedFixedAssets", label: "Proyeksi Aset Tetap" },
  { id: "projectedCashFlow", label: "Proyeksi Cash Flow Statement" },
  { id: "dlom", label: "DLOM" },
  { id: "dlocPfc", label: "DLOC/PFC" },
  { id: "taxSimulation", label: "Simulasi Potensi Pajak" },
  { id: "cashFlowStatement", label: "Cash Flow Statement" },
  { id: "payablesCashFlow", label: "Utang & Arus Kas" },
  { id: "noplatFcf", label: "NOPLAT & FCF" },
  { id: "ratiosCapital", label: "Rasio & Efisiensi Modal" },
  { id: "audit", label: "Audit" },
];

const MAX_HISTORY_STEPS = 80;

export function ValuationWorkbench() {
  const [periods, setPeriods] = useState<Period[]>(initialPeriods);
  const [activePeriodId, setActivePeriodId] = useState(initialPeriods[0].id);
  const [rows, setRows] = useState<AccountRow[]>([]);
  const [isFixedAssetScheduleEnabled, setIsFixedAssetScheduleEnabled] = useState(false);
  const [fixedAssetScheduleRows, setFixedAssetScheduleRows] = useState<FixedAssetScheduleRow[]>([]);
  const [fixedAssetProjectionMode, setFixedAssetProjectionMode] = useState<FixedAssetProjectionMode>(defaultFixedAssetProjectionMode);
  const [aamAdjustments, setAamAdjustments] = useState<AamAdjustmentState>({});
  const [assumptions, setAssumptions] = useState<AssumptionState>(emptyAssumptions);
  const [caseProfile, setCaseProfile] = useState<CaseProfile>(emptyCaseProfile);
  const [dlom, setDlom] = useState<DlomState>(createEmptyDlomState);
  const [dlocPfc, setDlocPfc] = useState<DlocPfcState>(createEmptyDlocPfcState);
  const [taxSimulation, setTaxSimulation] = useState<TaxSimulationState>(createEmptyTaxSimulationState);
  const [cashFlowOverrides, setCashFlowOverrides] = useState<CashFlowOverrideState>({});
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isDraftRestored, setIsDraftRestored] = useState(false);
  const [activeWorkflowTab, setActiveWorkflowTab] = useState<WorkflowTabId>("periods");
  const [undoStack, setUndoStack] = useState<WorkbenchCoreState[]>([]);
  const [redoStack, setRedoStack] = useState<WorkbenchCoreState[]>([]);
  const [isTemplateExporting, setIsTemplateExporting] = useState(false);

  const mappedRows = useMemo(() => rows.map((row) => mapRow(row)), [rows]);
  const caseProfileDerived = useMemo(() => buildCaseProfileDerived(caseProfile), [caseProfile]);
  const activePeriod = periods.find((period) => period.id === activePeriodId) ?? getDefaultActivePeriod(periods);
  const effectiveValuationDate = caseProfileDerived.cutOffDate || activePeriod?.valuationDate || "";
  const sectorComparableOptions = useMemo(() => getIdxComparablesBySector(caseProfile.companySector), [caseProfile.companySector]);
  const sectorComparableSuggestions = useMemo(() => getSuggestedIdxComparables(caseProfile.companySector), [caseProfile.companySector]);
  const balanceSheetRows = useMemo(() => mappedRows.filter((item) => item.row.statement === "balance_sheet"), [mappedRows]);
  const incomeStatementRows = useMemo(() => mappedRows.filter((item) => item.row.statement === "income_statement"), [mappedRows]);
  const fixedAssetSchedule = useMemo(
    () => buildFixedAssetScheduleSummary(periods, fixedAssetScheduleRows),
    [fixedAssetScheduleRows, periods],
  );
  const accountingSnapshot = useMemo(
    () => buildSnapshot(periods, activePeriodId, rows, assumptions, fixedAssetScheduleRows),
    [periods, activePeriodId, rows, assumptions, fixedAssetScheduleRows],
  );
  const autoWaccCapitalValues = useMemo(
    () => ({
      debtMarketValue: accountingSnapshot.currentLiabilities + accountingSnapshot.nonCurrentLiabilities || accountingSnapshot.totalLiabilities,
      equityMarketValue: accountingSnapshot.bookEquity,
    }),
    [
      accountingSnapshot.bookEquity,
      accountingSnapshot.currentLiabilities,
      accountingSnapshot.nonCurrentLiabilities,
      accountingSnapshot.totalLiabilities,
    ],
  );
  const waccResolvedAssumptions = useMemo(
    () => resolveAutoWaccCapitalValues(assumptions, autoWaccCapitalValues),
    [assumptions, autoWaccCapitalValues],
  );
  const waccCalculation = useMemo(() => calculateWaccAssumption(waccResolvedAssumptions), [waccResolvedAssumptions]);
  const waccComparableBeta = useMemo(() => calculateWaccComparableBetaAssumption(waccResolvedAssumptions), [waccResolvedAssumptions]);
  const requiredReturnSuggestion = useMemo(
    () =>
      buildRequiredReturnOnNtaSuggestion({
        accountReceivable: accountingSnapshot.accountReceivable,
        employeeReceivable: accountingSnapshot.employeeReceivable,
        inventory: accountingSnapshot.inventory,
        fixedAssetsNet: accountingSnapshot.fixedAssetsNet,
        waccCalculation,
      }),
    [
      accountingSnapshot.accountReceivable,
      accountingSnapshot.employeeReceivable,
      accountingSnapshot.fixedAssetsNet,
      accountingSnapshot.inventory,
      waccCalculation,
    ],
  );
  const resolvedAssumptions = useMemo(
    () => resolveAutoRequiredReturnOnNtaValues(waccResolvedAssumptions, requiredReturnSuggestion),
    [requiredReturnSuggestion, waccResolvedAssumptions],
  );
  const snapshot = useMemo(
    () => buildSnapshot(periods, activePeriodId, rows, resolvedAssumptions, fixedAssetScheduleRows),
    [periods, activePeriodId, rows, resolvedAssumptions, fixedAssetScheduleRows],
  );
  const aamAdjustmentModel = useMemo(() => buildAamAdjustmentModel(snapshot, aamAdjustments), [aamAdjustments, snapshot]);
  const baseDcfForecast = useMemo(() => buildDcfForecast(snapshot), [snapshot]);
  const fixedAssetProjection = useMemo(
    () => buildFixedAssetProjection(baseDcfForecast, periods, activePeriodId, fixedAssetSchedule, { preferredMode: fixedAssetProjectionMode }),
    [activePeriodId, baseDcfForecast, fixedAssetProjectionMode, fixedAssetSchedule, periods],
  );
  const dcfFixedAssetProjection = useMemo(
    () => buildDcfFixedAssetProjectionInput(fixedAssetProjection),
    [fixedAssetProjection],
  );
  const results = useMemo(
    () =>
      calculateAllMethods(snapshot, {
        aam: {
          assetAdjustment: aamAdjustmentModel.assetAdjustmentTotal,
          liabilityAdjustment: aamAdjustmentModel.liabilityAdjustmentTotal,
          missingAdjustmentNotes: aamAdjustmentModel.missingNoteCount,
        },
        dcf: dcfFixedAssetProjection
          ? {
              fixedAssetProjection: dcfFixedAssetProjection,
              fixedAssetProjectionSource: fixedAssetProjection.source,
            }
          : undefined,
      }),
    [
      aamAdjustmentModel.assetAdjustmentTotal,
      aamAdjustmentModel.liabilityAdjustmentTotal,
      aamAdjustmentModel.missingNoteCount,
      dcfFixedAssetProjection,
      fixedAssetProjection.source,
      snapshot,
    ],
  );
  const dlomCalculation = useMemo(() => calculateDlom(dlom, snapshot, caseProfile), [caseProfile, dlom, snapshot]);
  const dlocPfcCalculation = useMemo(() => calculateDlocPfc(dlocPfc, caseProfile), [caseProfile, dlocPfc]);
  const taxSimulationResult = useMemo(
    () =>
      calculateTaxSimulation({
        methods: [results.aam, results.eem, results.dcf],
        dlom: dlomCalculation,
        dlocPfc: dlocPfcCalculation,
        state: taxSimulation,
        caseProfile,
        caseProfileDerived,
        snapshot,
      }),
    [caseProfile, caseProfileDerived, dlocPfcCalculation, dlomCalculation, results.aam, results.dcf, results.eem, snapshot, taxSimulation],
  );
  const sectionAnalysis = useMemo(
    () => buildSectionAnalysis(periods, rows, assumptions, fixedAssetScheduleRows, cashFlowOverrides),
    [periods, rows, assumptions, fixedAssetScheduleRows, cashFlowOverrides],
  );
  const balanceSheetView = useMemo(
    () => buildBalanceSheetView(periods, mappedRows, fixedAssetSchedule),
    [fixedAssetSchedule, mappedRows, periods],
  );
  const incomeStatementView = useMemo(
    () => buildIncomeStatementView(periods, incomeStatementRows, fixedAssetSchedule),
    [fixedAssetSchedule, incomeStatementRows, periods],
  );
  const eemDcfMethodCards = [results.eem, results.dcf];
  const taxRateCandidates = useMemo(() => buildTaxRateCandidates(effectiveValuationDate), [effectiveValuationDate]);
  const marketSuggestion = useMemo(
    () => getMarketAssumptionSuggestion(effectiveValuationDate),
    [effectiveValuationDate],
  );
  const requiredReturnCalculation = useMemo(
    () =>
      calculateRequiredReturnOnNtaAssumption(resolvedAssumptions, {
        accountReceivable: snapshot.accountReceivable,
        inventory: snapshot.inventory,
        fixedAssetsNet: snapshot.fixedAssetsNet,
      }),
    [resolvedAssumptions, snapshot.accountReceivable, snapshot.fixedAssetsNet, snapshot.inventory],
  );
  const assumptionGovernance = useMemo(
    () =>
      buildAssumptionGovernance({
        snapshot,
        waccCalculation,
        requiredReturnCalculation,
        dcfTraces: results.dcf.traces,
        hasRevenueGrowthOverride: assumptions.revenueGrowth.trim() !== "",
      }),
    [assumptions.revenueGrowth, requiredReturnCalculation, results.dcf.traces, snapshot, waccCalculation],
  );
  const terminalGrowthSuggestion = useMemo(
    () =>
      buildTerminalGrowthSuggestion({
        sector: caseProfile.companySector,
        revenue: snapshot.revenue,
        netProfit: snapshot.commercialNpat || normalizedNoplat(snapshot),
        wacc: snapshot.wacc,
        existingDownside: readRateInput(assumptions.terminalGrowthDownside),
        existingUpside: readRateInput(assumptions.terminalGrowthUpside),
      }),
    [
      assumptions.terminalGrowthDownside,
      assumptions.terminalGrowthUpside,
      caseProfile.companySector,
      snapshot,
    ],
  );
  const rawWaccValue = waccCalculation?.wacc ?? readRateInput(assumptions.wacc);
  const rawTerminalGrowthValue = readRateInput(assumptions.terminalGrowth);
  const rawRequiredReturnValue = requiredReturnCalculation?.requiredReturn ?? readRateInput(assumptions.requiredReturnOnNta);
  const isGovernedWacc = rawWaccValue !== null && Math.abs(rawWaccValue - snapshot.wacc) > 0.0001;
  const isGovernedTerminalGrowth = rawTerminalGrowthValue !== null && Math.abs(rawTerminalGrowthValue - snapshot.terminalGrowth) > 0.0001;
  const isGovernedRequiredReturn = rawRequiredReturnValue !== null && Math.abs(rawRequiredReturnValue - snapshot.requiredReturnOnNta) > 0.0001;
  const assumptionDriverSummaries = [
    buildAssumptionDriverSummary("Tarif pajak", assumptions.taxRate, assumptions.taxRateSource, taxRateCandidates),
    buildCalculatedDriverSummary(
      "WACC",
      snapshot.wacc,
      isGovernedWacc ? "Basis governed dari input pasar" : waccCalculation ? "Dihitung dari input WACC" : sourceLabelFromManual(assumptions.wacc),
    ),
    buildCalculatedDriverSummary(
      "Terminal growth",
      snapshot.terminalGrowth,
      isGovernedTerminalGrowth
        ? "Basis governed dengan cap dari saran sektor"
        : assumptions.terminalGrowthSource === terminalGrowthSuggestion?.sourceId
        ? "Saran terkalibrasi sektor dengan band downside/upside"
        : assumptions.terminalGrowth.trim() ? "Base case pengguna dengan input sensitivitas" : "Belum dipilih",
    ),
    buildCalculatedDriverSummary(
      "Required return on NTA",
      snapshot.requiredReturnOnNta,
      isGovernedRequiredReturn
        ? "Proxy kapasitas aset berwujud yang di-govern"
        : requiredReturnCalculation ? requiredReturnCalculation.basisLabel : sourceLabelFromManual(assumptions.requiredReturnOnNta),
    ),
  ];
  const nextHistoricalPeriodLabel = getPeriodLabel(getNextHistoricalPeriodOffset(periods)).replace("Tahun ", "");
  const equityBookComponents =
    snapshot.paidUpCapital +
    snapshot.additionalPaidInCapital +
    snapshot.retainedEarningsSurplus +
    snapshot.retainedEarningsCurrentProfit;
  const balanceSheetGap = results.adjustedTotalAssets - results.adjustedTotalLiabilities - equityBookComponents;
  const hasAnyInput =
    rows.length > 0 ||
    fixedAssetScheduleRows.length > 0 ||
    fixedAssetSchedule.hasInput ||
    Object.values(aamAdjustments).some((entry) => entry.adjustment.trim() !== "" || entry.note.trim() !== "") ||
    periods.length !== 1 ||
    periods.some(
      (period) =>
        getPeriodYearOffset(period) !== 0 ||
        period.label !== getPeriodLabel(0) ||
        period.valuationDate,
    ) ||
    Object.values(caseProfile).some((value) => value.trim() !== "") ||
    Object.values(assumptions).some((value) => value.trim() !== "") ||
    hasCashFlowOverrideInput(cashFlowOverrides) ||
    hasDlomInput(dlom) ||
    hasDlocPfcInput(dlocPfc) ||
    hasTaxSimulationInput(taxSimulation);
  const checks = buildValidationChecks(rows, mappedRows, resolvedAssumptions, snapshot, balanceSheetGap, fixedAssetSchedule);
  const readiness = useMemo(
    () =>
      buildWorkbenchReadiness({
        periods,
        rows,
        mappedRows,
        assumptions: resolvedAssumptions,
        snapshot,
        fixedAssetSchedule,
        caseProfile,
        caseProfileDerived,
        dlocPfc: dlocPfcCalculation,
        taxSimulation,
      }),
    [caseProfile, caseProfileDerived, dlocPfcCalculation, fixedAssetSchedule, mappedRows, periods, resolvedAssumptions, rows, snapshot, taxSimulation],
  );

  function getCurrentCoreState(): WorkbenchCoreState {
    return {
      periods,
      activePeriodId,
      rows,
      isFixedAssetScheduleEnabled,
      fixedAssetScheduleRows,
      fixedAssetProjectionMode,
      aamAdjustments,
      assumptions,
      caseProfile,
      dlom,
      dlocPfc,
      taxSimulation,
      cashFlowOverrides,
    };
  }

  function applyCoreState(state: WorkbenchCoreState) {
    setPeriods(state.periods);
    setActivePeriodId(state.activePeriodId);
    setRows(state.rows);
    setIsFixedAssetScheduleEnabled(state.isFixedAssetScheduleEnabled);
    setFixedAssetScheduleRows(state.fixedAssetScheduleRows);
    setFixedAssetProjectionMode(state.fixedAssetProjectionMode);
    setAamAdjustments(state.aamAdjustments);
    setAssumptions(state.assumptions);
    setCaseProfile(state.caseProfile);
    setDlom(state.dlom);
    setDlocPfc(state.dlocPfc);
    setTaxSimulation(state.taxSimulation);
    setCashFlowOverrides(state.cashFlowOverrides);
  }

  function commitCoreState(update: (current: WorkbenchCoreState) => WorkbenchCoreState) {
    const current = cloneCoreState(getCurrentCoreState());
    const next = cloneCoreState(update(current));

    if (JSON.stringify(current) === JSON.stringify(next)) {
      return;
    }

    setUndoStack((stack) => [...stack.slice(-(MAX_HISTORY_STEPS - 1)), current]);
    setRedoStack([]);
    applyCoreState(next);
  }

  function undoCoreChange() {
    const previous = undoStack[undoStack.length - 1];

    if (!previous) {
      return;
    }

    setUndoStack((stack) => stack.slice(0, -1));
    setRedoStack((stack) => [cloneCoreState(getCurrentCoreState()), ...stack].slice(0, MAX_HISTORY_STEPS));
    applyCoreState(cloneCoreState(previous));
  }

  function redoCoreChange() {
    const next = redoStack[0];

    if (!next) {
      return;
    }

    setRedoStack((stack) => stack.slice(1));
    setUndoStack((stack) => [...stack.slice(-(MAX_HISTORY_STEPS - 1)), cloneCoreState(getCurrentCoreState())]);
    applyCoreState(cloneCoreState(next));
  }

  function navigateToWorkflowTab(tabId: WorkflowTabId) {
    setActiveWorkflowTab(tabId);

    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0 });
    }
  }

  function navigateToGovernanceTarget(target: AssumptionGovernanceTarget) {
    navigateToWorkflowTab(target);
  }

  useEffect(() => {
    const storedState = readPersistedWorkbenchState();

    if (storedState) {
      const nextPeriods = normalizePeriods(storedState.periods.length > 0 ? storedState.periods : initialPeriods);
      const defaultActivePeriod = getDefaultActivePeriod(nextPeriods);
      const nextActivePeriodId = nextPeriods.some((period) => period.id === storedState.activePeriodId)
        ? storedState.activePeriodId
        : (defaultActivePeriod?.id ?? nextPeriods[0].id);

      setPeriods(nextPeriods);
      setActivePeriodId(nextActivePeriodId);
      setRows(storedState.rows);
      setIsFixedAssetScheduleEnabled(storedState.isFixedAssetScheduleEnabled || storedState.fixedAssetScheduleRows.length > 0);
      setFixedAssetScheduleRows(storedState.fixedAssetScheduleRows);
      setFixedAssetProjectionMode(storedState.fixedAssetProjectionMode);
      setAamAdjustments(storedState.aamAdjustments);
      setAssumptions(storedState.assumptions);
      setCaseProfile(storedState.caseProfile);
      setDlom(storedState.dlom);
      setDlocPfc(storedState.dlocPfc);
      setTaxSimulation(storedState.taxSimulation);
      setCashFlowOverrides(storedState.cashFlowOverrides);
      setUndoStack([]);
      setRedoStack([]);
    }

    setIsSidebarCollapsed(readStoredSidebarState());
    setIsDraftRestored(true);
  }, []);

  useEffect(() => {
    if (!isDraftRestored) {
      return;
    }

    persistWorkbenchState({
      version: WORKBENCH_STORAGE_VERSION,
      savedAt: new Date().toISOString(),
      periods,
      activePeriodId,
      rows,
      isFixedAssetScheduleEnabled,
      fixedAssetScheduleRows,
      fixedAssetProjectionMode,
      aamAdjustments,
      assumptions,
      caseProfile,
      dlom,
      dlocPfc,
      taxSimulation,
      cashFlowOverrides,
    });
  }, [
    aamAdjustments,
    activePeriodId,
    assumptions,
    cashFlowOverrides,
    caseProfile,
    dlocPfc,
    dlom,
    fixedAssetScheduleRows,
    fixedAssetProjectionMode,
    isDraftRestored,
    isFixedAssetScheduleEnabled,
    periods,
    rows,
    taxSimulation,
  ]);

  useEffect(() => {
    if (!isDraftRestored) {
      return;
    }

    safeSetLocalStorage(WORKBENCH_SIDEBAR_STORAGE_KEY, isSidebarCollapsed ? "collapsed" : "expanded");
  }, [isDraftRestored, isSidebarCollapsed]);

  useEffect(() => {
    if (!isDraftRestored || typeof window === "undefined") {
      return;
    }

    const storedScrollY = readStoredScrollPosition();

    if (storedScrollY > 0) {
      window.setTimeout(() => window.scrollTo({ top: storedScrollY }), 0);
      window.setTimeout(() => window.scrollTo({ top: storedScrollY }), 120);
    }
  }, [isDraftRestored]);

  useEffect(() => {
    if (!isDraftRestored || typeof window === "undefined") {
      return;
    }

    let animationFrame = 0;
    const saveScrollNow = () => safeSetLocalStorage(WORKBENCH_SCROLL_STORAGE_KEY, String(window.scrollY));
    const saveScrollPosition = () => {
      if (animationFrame) {
        return;
      }

      animationFrame = window.requestAnimationFrame(() => {
        animationFrame = 0;
        saveScrollNow();
      });
    };

    window.addEventListener("scroll", saveScrollPosition, { passive: true });
    window.addEventListener("beforeunload", saveScrollNow);

    return () => {
      window.removeEventListener("scroll", saveScrollPosition);
      window.removeEventListener("beforeunload", saveScrollNow);

      if (animationFrame) {
        window.cancelAnimationFrame(animationFrame);
      }
    };
  }, [isDraftRestored]);

  function addPeriod() {
    commitCoreState((current) => {
      const period = createHistoricalPeriod(current.periods);
      const nextPeriods = normalizePeriods([...current.periods, period]);

      return {
        ...current,
        periods: nextPeriods,
        rows: current.rows.map((row) => ({ ...row, values: { ...row.values, [period.id]: "" } })),
        fixedAssetScheduleRows: ensureFixedAssetSchedulePeriods(current.fixedAssetScheduleRows, nextPeriods),
        activePeriodId: nextPeriods.some((item) => item.id === current.activePeriodId)
          ? current.activePeriodId
          : (getDefaultActivePeriod(nextPeriods)?.id ?? period.id),
      };
    });
  }

  function updatePeriod(id: string, patch: Partial<Period>) {
    commitCoreState((current) => ({
      ...current,
      periods: current.periods.map((period) => (period.id === id ? { ...period, ...patch } : period)),
    }));
  }

  function updateCaseProfile(key: keyof CaseProfile, value: string) {
    commitCoreState((current) => {
      let nextCaseProfile = { ...current.caseProfile, [key]: formatCaseProfileValue(key, value) };

      if (key === "objectBusinessKlu") {
        const previousKluRecord = getKluSectorRecord(current.caseProfile.objectBusinessKlu);
        const kluRecord = getKluSectorRecord(nextCaseProfile.objectBusinessKlu);
        const shouldFollowKluSector =
          current.caseProfile.companySector === "" || current.caseProfile.companySector === previousKluRecord?.sector;

        if (shouldFollowKluSector) {
          nextCaseProfile = { ...nextCaseProfile, companySector: kluRecord?.sector ?? "" };
        }
      }

      const derived = buildCaseProfileDerived(nextCaseProfile);
      const nextPeriods =
        key === "transactionYear" && derived.cutOffDate
          ? current.periods.map((period) =>
              getPeriodYearOffset(period) === 0 ? { ...period, valuationDate: derived.cutOffDate } : period,
            )
          : current.periods;
      const shouldRefreshSectorSuggestions =
        (key === "companySector" || key === "objectBusinessKlu") && nextCaseProfile.companySector !== current.caseProfile.companySector;
      const nextAssumptions =
        shouldRefreshSectorSuggestions
          ? applyIdxComparableSuggestions(current.assumptions, nextCaseProfile.companySector, "empty-only")
          : current.assumptions;

      return {
        ...current,
        periods: nextPeriods,
        caseProfile: nextCaseProfile,
        assumptions: nextAssumptions,
      };
    });
  }

  function removePeriod(id: string) {
    commitCoreState((current) => {
      const periodToRemove = current.periods.find((period) => period.id === id);

      if (!periodToRemove || current.periods.length === 1 || getPeriodYearOffset(periodToRemove) === 0) {
        return current;
      }

      const nextPeriods = normalizePeriods(current.periods.filter((period) => period.id !== id));
      const defaultActivePeriod = getDefaultActivePeriod(nextPeriods);
      const rows = current.rows.map((row) => {
        const values = { ...row.values };
        delete values[id];
        return { ...row, values };
      });
      const fixedAssetScheduleRows = current.fixedAssetScheduleRows.map((row) => {
        const values = { ...row.values };
        delete values[id];
        return { ...row, values };
      });

      return {
        ...current,
        periods: nextPeriods,
        rows,
        fixedAssetScheduleRows,
        cashFlowOverrides: removeCashFlowOverridePeriod(current.cashFlowOverrides, id),
        activePeriodId:
          current.activePeriodId === id ? (defaultActivePeriod?.id ?? nextPeriods[nextPeriods.length - 1].id) : current.activePeriodId,
      };
    });
  }

  function activatePeriod(id: string) {
    commitCoreState((current) => (current.periods.some((period) => period.id === id) ? { ...current, activePeriodId: id } : current));
  }

  function addRow(statement: StatementType = "balance_sheet") {
    commitCoreState((current) => ({ ...current, rows: [...current.rows, createRow(statement, current.periods)] }));
  }

  function addFixedAssetScheduleRow() {
    commitCoreState((current) => ({
      ...current,
      fixedAssetScheduleRows: [...current.fixedAssetScheduleRows, createFixedAssetScheduleRow(current.periods)],
    }));
  }

  function updateFixedAssetScheduleRow(id: string, patch: Partial<FixedAssetScheduleRow>) {
    commitCoreState((current) => ({
      ...current,
      fixedAssetScheduleRows: current.fixedAssetScheduleRows.map((row) => (row.id === id ? { ...row, ...patch } : row)),
    }));
  }

  function updateFixedAssetScheduleValue(rowId: string, periodId: string, key: FixedAssetScheduleValueKey, value: string) {
    commitCoreState((current) => ({
      ...current,
      fixedAssetScheduleRows: current.fixedAssetScheduleRows.map((row) =>
        row.id === rowId
          ? {
              ...row,
              values: {
                ...row.values,
                [periodId]: {
                  ...(row.values[periodId] ?? emptyFixedAssetInputValues()),
                  [key]: formatEditableNumber(value),
                },
              },
            }
          : row,
      ),
    }));
  }

  function removeFixedAssetScheduleRow(id: string) {
    commitCoreState((current) => ({
      ...current,
      fixedAssetScheduleRows: current.fixedAssetScheduleRows.filter((row) => row.id !== id),
    }));
  }

  function updateAamAdjustment(lineId: string, patch: Partial<AamAdjustmentState[string]>) {
    commitCoreState((current) => {
      const currentEntry = current.aamAdjustments[lineId] ?? { adjustment: "", note: "" };
      const nextEntry = {
        ...currentEntry,
        ...patch,
        adjustment: patch.adjustment !== undefined ? formatEditableNumber(patch.adjustment) : currentEntry.adjustment,
      };
      const nextAdjustments = { ...current.aamAdjustments };

      if (!nextEntry.adjustment.trim() && !nextEntry.note.trim()) {
        delete nextAdjustments[lineId];
      } else {
        nextAdjustments[lineId] = nextEntry;
      }

      return {
        ...current,
        aamAdjustments: nextAdjustments,
      };
    });
  }

  function updateRow(id: string, patch: Partial<AccountRow>) {
    commitCoreState((current) => ({
      ...current,
      rows: current.rows.map((row) => (row.id === id ? { ...row, ...patch } : row)),
    }));
  }

  function updateRowValue(rowId: string, periodId: string, value: string) {
    commitCoreState((current) => ({
      ...current,
      rows: current.rows.map((row) => {
        if (row.id !== rowId) {
          return row;
        }

        const effectiveCategory = mapRow(row).effectiveCategory;
        const formattedValue = formatIncomeStatementInputValue(effectiveCategory, row.statement, row.values[periodId] ?? "", value);

        return { ...row, values: { ...row.values, [periodId]: formattedValue } };
      }),
    }));
  }

  function removeRow(id: string) {
    commitCoreState((current) => ({ ...current, rows: current.rows.filter((row) => row.id !== id) }));
  }

  function toggleRowLabel(rowId: string, labelId: AccountLabelId) {
    commitCoreState((current) => ({
      ...current,
      rows: current.rows.map((row) => {
        if (row.id !== rowId) {
          return row;
        }

        const currentLabels = new Set(row.labelOverrides ?? []);

        if (currentLabels.has(labelId)) {
          currentLabels.delete(labelId);
        } else {
          currentLabels.add(labelId);
        }

        return { ...row, labelOverrides: Array.from(currentLabels) };
      }),
    }));
  }

  function updateAssumption(key: keyof AssumptionState, value: string) {
    commitCoreState((current) => ({
      ...current,
      assumptions: markManualAssumptionSource({ ...current.assumptions, [key]: formatEditableNumber(value) }, key),
    }));
  }

  function updateAssumptionText(key: keyof AssumptionState, value: string) {
    commitCoreState((current) => ({
      ...current,
      assumptions: { ...current.assumptions, [key]: value },
    }));
  }

  function updateDlomFactor(id: DlomFactorId, patch: Partial<DlomState["factors"][DlomFactorId]>) {
    commitCoreState((current) => ({
      ...current,
      dlom: normalizeDlomState({
        ...current.dlom,
        factors: {
          ...current.dlom.factors,
          [id]: {
            ...current.dlom.factors[id],
            ...patch,
          },
        },
      }),
    }));
  }

  function updateDlocPfcFactor(id: DlocPfcFactorId, patch: Partial<DlocPfcState["factors"][DlocPfcFactorId]>) {
    commitCoreState((current) => ({
      ...current,
      dlocPfc: normalizeDlocPfcState({
        ...current.dlocPfc,
        factors: {
          ...current.dlocPfc.factors,
          [id]: {
            ...current.dlocPfc.factors[id],
            ...patch,
          },
        },
      }),
    }));
  }

  function updateTaxSimulation(patch: Partial<TaxSimulationState>) {
    commitCoreState((current) => ({
      ...current,
      taxSimulation: normalizeTaxSimulationState({
        ...current.taxSimulation,
        ...patch,
        reportedTransferValue:
          patch.reportedTransferValue !== undefined
            ? formatEditableNumber(patch.reportedTransferValue)
            : current.taxSimulation.reportedTransferValue,
        dlocPfcRate:
          patch.dlocPfcRate !== undefined ? formatEditableNumber(patch.dlocPfcRate) : current.taxSimulation.dlocPfcRate,
        dlocPfcOverrideReason:
          patch.dlocPfcOverrideReason !== undefined ? patch.dlocPfcOverrideReason : current.taxSimulation.dlocPfcOverrideReason,
      }),
    }));
  }

  function updateCashFlowOverride(rowKey: string, periodId: string, patch: Partial<CashFlowOverrideEntry>) {
    commitCoreState((current) => {
      const currentEntry = current.cashFlowOverrides[rowKey]?.[periodId] ?? { value: "", reason: "", updatedAt: "" };
      const nextEntry: CashFlowOverrideEntry = {
        ...currentEntry,
        ...patch,
        value: patch.value !== undefined ? formatEditableNumber(patch.value) : currentEntry.value,
        updatedAt: new Date().toISOString(),
      };
      const nextOverrides = { ...current.cashFlowOverrides };
      const nextRowOverrides = { ...(nextOverrides[rowKey] ?? {}) };

      if (!nextEntry.value.trim()) {
        delete nextRowOverrides[periodId];
      } else {
        nextRowOverrides[periodId] = nextEntry;
      }

      if (Object.keys(nextRowOverrides).length === 0) {
        delete nextOverrides[rowKey];
      } else {
        nextOverrides[rowKey] = nextRowOverrides;
      }

      return {
        ...current,
        cashFlowOverrides: nextOverrides,
      };
    });
  }

  function updateWaccComparableName(slot: WaccComparableSlot, value: string) {
    commitCoreState((current) => {
      const selectedComparable = findIdxComparableByLabel(current.caseProfile.companySector, value);

      return {
        ...current,
        assumptions: selectedComparable
          ? applyIdxComparableToSlot(current.assumptions, slot, selectedComparable)
          : { ...current.assumptions, [slot.name]: value },
      };
    });
  }

  function applySectorComparableSuggestions() {
    commitCoreState((current) => ({
      ...current,
      assumptions: applyIdxComparableSuggestions(current.assumptions, current.caseProfile.companySector, "replace"),
    }));
  }

  function applyAssumptionCandidate(key: DriverAssumptionKey, candidate: AssumptionCandidate) {
    const sourceKey = assumptionSourceKeyByDriver[key];
    const reasonKey = assumptionReasonKeyByDriver[key];

    commitCoreState((current) => ({
      ...current,
      assumptions: {
        ...current.assumptions,
        [key]: formatInputNumber(candidate.value),
        [sourceKey]: candidate.id,
        [reasonKey]: "",
      },
    }));
  }

  function applyWaccMarketSuggestion(suggestion: MarketAssumptionSuggestion) {
    const averageDebtRate = roundDiscountRateDebtRate(averageInvestmentLoanRate(suggestion));
    const sourceNote = `Saran sistem tahunan ${suggestion.year}; ERP/default spread dari Damodaran, proxy SUN dari bukti pasar, dan debt rate dari rata-rata SBDK korporasi OJK.`;

    commitCoreState((current) => ({
      ...current,
      assumptions: {
        ...current.assumptions,
        waccRiskFreeRate: formatInputNumber(suggestion.metrics.riskFreeSun.value),
        waccEquityRiskPremium: formatInputNumber(suggestion.metrics.equityRiskPremium.value),
        waccRatingBasedDefaultSpread: formatInputNumber(suggestion.metrics.ratingBasedDefaultSpread.value),
        waccCountryRiskPremium: formatInputNumber(-suggestion.metrics.ratingBasedDefaultSpread.value),
        waccSpecificRiskPremium: current.assumptions.waccSpecificRiskPremium.trim() || formatInputNumber(0),
        waccPreTaxCostOfDebt: formatInputNumber(averageDebtRate),
        waccBankPerseroInvestmentLoanRate: formatInputNumber(suggestion.metrics.bankPerseroInvestmentLoan.value),
        waccBankPemdaInvestmentLoanRate: "",
        waccBankSwastaInvestmentLoanRate: formatInputNumber(suggestion.metrics.bankSwastaInvestmentLoan.value),
        waccBankAsingInvestmentLoanRate: "",
        waccBankCampuranInvestmentLoanRate: "",
        waccBankUmumInvestmentLoanRate: formatInputNumber(suggestion.metrics.bankUmumInvestmentLoan.value),
        waccSource: `market-suggestion-${suggestion.year}`,
        waccOverrideReason: sourceNote,
      },
    }));
  }

  function applyTerminalGrowthSuggestion(suggestion: TerminalGrowthSuggestion) {
    commitCoreState((current) => ({
      ...current,
      assumptions: {
        ...current.assumptions,
        terminalGrowth: formatInputNumber(suggestion.baseGrowth),
        terminalGrowthDownside: formatInputNumber(suggestion.downsideGrowth),
        terminalGrowthUpside: formatInputNumber(suggestion.upsideGrowth),
        terminalGrowthSource: suggestion.sourceId,
        terminalGrowthOverrideReason: suggestion.reason,
      },
    }));
  }

  function loadSample() {
    const samplePeriods = buildSamplePeriods();
    const sampleFixedAssetScheduleRows = buildSampleFixedAssetScheduleRows();
    commitCoreState((current) => ({
      ...current,
      periods: samplePeriods,
      activePeriodId: "p2021",
      rows: buildSampleRows().filter((row) => row.id !== "sample-fixed-net"),
      isFixedAssetScheduleEnabled: true,
      fixedAssetScheduleRows: sampleFixedAssetScheduleRows,
      fixedAssetProjectionMode: defaultFixedAssetProjectionMode,
      aamAdjustments: {},
      assumptions: buildSampleAssumptions(),
      caseProfile: buildSampleCaseProfile(),
      dlom: buildSampleDlomState(),
      dlocPfc: buildSampleDlocPfcState(),
      taxSimulation: buildSampleTaxSimulationState(),
      cashFlowOverrides: {},
    }));
  }

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.__PVB_TEST_HOOKS__ = {
      loadSampleWorkbook: loadSample,
    };

    return () => {
      delete window.__PVB_TEST_HOOKS__;
    };
  });

  function getExportInput() {
    return {
      periods,
      activePeriodId,
      rows,
      mappedRows,
      fixedAssetScheduleRows,
      fixedAssetSchedule,
      assumptions,
      resolvedAssumptions,
      caseProfile,
      caseProfileDerived,
      snapshot,
      aamAdjustmentModel,
      results,
      dlomCalculation,
      dlocPfcCalculation,
      taxSimulation,
      taxSimulationResult,
      sectionAnalysis,
      readiness,
      validationChecks: checks,
    };
  }

  async function exportWorkbook() {
    if (isTemplateExporting) {
      return;
    }

    setIsTemplateExporting(true);

    try {
      await downloadValuationTemplateWorkbook(getExportInput());
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Export XLSX gagal dijalankan.");
    } finally {
      setIsTemplateExporting(false);
    }
  }

  function exportPdfReport() {
    try {
      saveValuationPdfExportPayload(getExportInput());
      window.open("/export/pdf", "_blank", "noopener,noreferrer");
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Export PDF gagal dijalankan.");
    }
  }

  function resetForm() {
    clearPersistedWorkbenchState();
    commitCoreState(() => ({
      periods: initialPeriods,
      activePeriodId: initialPeriods[0].id,
      rows: [],
      isFixedAssetScheduleEnabled: false,
      fixedAssetScheduleRows: [],
      fixedAssetProjectionMode: defaultFixedAssetProjectionMode,
      aamAdjustments: {},
      assumptions: emptyAssumptions,
      caseProfile: emptyCaseProfile,
      dlom: createEmptyDlomState(),
      dlocPfc: createEmptyDlocPfcState(),
      taxSimulation: createEmptyTaxSimulationState(),
      cashFlowOverrides: {},
    }));

    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0 });
    }
  }

  return (
    <main className={isSidebarCollapsed ? "app-shell sidebar-collapsed" : "app-shell"} data-testid="valuation-workbench">
      {isSidebarCollapsed ? (
        <div className="sidebar-rail" aria-label="Navigasi ringkas" data-testid="sidebar-rail">
          <button
            className="sidebar-toggle"
            type="button"
            onClick={() => setIsSidebarCollapsed(false)}
            aria-label="Tampilkan sidebar"
            title="Tampilkan sidebar"
          >
            <PanelLeftOpen size={18} />
          </button>
        </div>
      ) : (
        <aside className="sidebar">
          <div className="brand-block">
            <div className="brand-mark">B-2</div>
            <div className="brand-copy">
              <h1>PENILAIAN BISNIS II</h1>
            </div>
            <button
              className="sidebar-toggle"
              type="button"
              onClick={() => setIsSidebarCollapsed(true)}
              aria-label="Sembunyikan sidebar"
              title="Sembunyikan sidebar"
            >
              <PanelLeftClose size={18} />
            </button>
          </div>
          <nav className="nav-list" aria-label="Bagian model">
            {workflowTabs.map((item) => (
              <button
                className={activeWorkflowTab === item.id ? "active" : ""}
                type="button"
                onClick={() => setActiveWorkflowTab(item.id)}
                aria-current={activeWorkflowTab === item.id ? "page" : undefined}
                key={item.id}
              >
                {item.label}
              </button>
            ))}
          </nav>
        </aside>
      )}

      <section className="workspace">
        <div className="sticky-workspace-header" data-testid="workspace-header">
          <header className="topbar toolbar-only">
            <div className="toolbar">
              <button className="icon-button" type="button" onClick={undoCoreChange} disabled={undoStack.length === 0} title="Undo perubahan data">
                <Undo2 size={18} />
              </button>
              <button className="icon-button" type="button" onClick={redoCoreChange} disabled={redoStack.length === 0} title="Redo perubahan data">
                <Redo2 size={18} />
              </button>
              <button className="button secondary" type="button" onClick={exportWorkbook} disabled={isTemplateExporting} aria-busy={isTemplateExporting}>
                <Download size={18} />
                {isTemplateExporting ? "Menyiapkan XLSX" : "Export XLSX"}
              </button>
              <button className="button secondary" type="button" onClick={exportPdfReport}>
                <FileText size={18} />
                Export PDF
              </button>
              <button className="button ghost" type="button" onClick={resetForm} disabled={!hasAnyInput}>
                <Eraser size={18} />
                Reset
              </button>
            </div>
          </header>

          <div className="workflow-tabs mobile-workflow-tabs" role="tablist" aria-label="Workflow penilaian">
            {workflowTabs.map((tab) => (
              <button
                className={activeWorkflowTab === tab.id ? "active" : ""}
                type="button"
                role="tab"
                aria-selected={activeWorkflowTab === tab.id}
                onClick={() => setActiveWorkflowTab(tab.id)}
                key={tab.id}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {activeWorkflowTab === "periods" ? (
        <section id="periods" className="panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Langkah 1</p>
              <h3>Data Awal</h3>
            </div>
            <button className="button secondary" type="button" onClick={addPeriod}>
              <Plus size={18} />
              Tambah {nextHistoricalPeriodLabel}
            </button>
          </div>
          <ReadinessPanel status={readiness.periods} onNavigate={navigateToWorkflowTab} />
          <CaseProfilePanel
            profile={caseProfile}
            derived={caseProfileDerived}
            onChange={updateCaseProfile}
          />
          <div className="period-section-heading">
            <div>
              <p className="eyebrow">Periode penilaian</p>
              <h4>Periode input laporan keuangan</h4>
            </div>
            {caseProfileDerived.cutOffDate ? (
              <span className="status-pill">Cut off {formatDisplayDate(caseProfileDerived.cutOffDate)}</span>
            ) : null}
          </div>
          <div className="period-grid">
            {periods.map((period) => {
              const isValuationYear = getPeriodYearOffset(period) === 0;
              const canRemovePeriod = !isValuationYear && periods.length > 1;
              const periodCardClassName = [
                "period-card",
                isValuationYear ? "valuation-year" : "historical-year",
                period.id === activePeriodId ? "active" : "",
              ]
                .filter(Boolean)
                .join(" ");

              return (
                <div className={periodCardClassName} data-testid="period-card" data-year-offset={getPeriodYearOffset(period)} key={period.id}>
                  <CalendarDays size={18} />
                  <label>
                    <span>Label</span>
                    <input value={period.label} onChange={(event) => updatePeriod(period.id, { label: event.target.value })} />
                  </label>
                  {isValuationYear ? (
                    <label>
                      <span>Tanggal penilaian</span>
                      <input
                        type="date"
                        value={period.valuationDate}
                        onChange={(event) => updatePeriod(period.id, { valuationDate: event.target.value })}
                      />
                    </label>
                  ) : null}
                  <div className="period-actions">
                    <button className="icon-button" type="button" onClick={() => activatePeriod(period.id)} title="Gunakan periode ini">
                      <CheckCircle2 size={18} />
                    </button>
                    <button
                      className="icon-button danger"
                      type="button"
                      onClick={() => removePeriod(period.id)}
                      disabled={!canRemovePeriod}
                      title={isValuationYear ? "Tahun Y tidak bisa dihapus" : "Hapus periode"}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
        ) : null}

        {activeWorkflowTab === "balance" ? (
        <section id="accounts" className="panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Langkah 2</p>
              <h3>Neraca dan aset tetap</h3>
            </div>
          </div>
          <ReadinessPanel status={readiness.balance} onNavigate={navigateToWorkflowTab} />

          <FixedAssetScheduleEditor
            periods={periods}
            schedule={fixedAssetSchedule}
            onAddRow={addFixedAssetScheduleRow}
            onRemoveRow={removeFixedAssetScheduleRow}
            onUpdateRow={updateFixedAssetScheduleRow}
            onUpdateValue={updateFixedAssetScheduleValue}
          />

          <div className="subpanel-heading account-input-heading">
            <div>
              <p className="eyebrow">Neraca</p>
              <h4>Akun neraca manual</h4>
            </div>
            <button className="button secondary" type="button" onClick={() => addRow("balance_sheet")}>
              <Plus size={18} />
              Tambah akun neraca
            </button>
          </div>

          <AccountInputTable
            emptyMessage="Belum ada akun neraca. Tambahkan baris dari tombol Tambah akun neraca di atas."
            mappedRows={balanceSheetRows}
            periods={periods}
            testId="balance-account-table"
            onRemoveRow={removeRow}
            onToggleLabel={toggleRowLabel}
            onUpdateRow={updateRow}
            onUpdateRowValue={updateRowValue}
          />

          <div className="account-input-footer">
            <button className="button secondary" type="button" onClick={() => addRow("balance_sheet")}>
              <Plus size={18} />
              Tambah akun neraca
            </button>
          </div>

          <BalanceSheetPositionTable periods={periods} view={balanceSheetView} />
        </section>
        ) : null}

        {activeWorkflowTab === "income" ? (
        <section id="income" className="panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Langkah 2B</p>
              <h3>Laba rugi dan driver operasi</h3>
            </div>
            <button className="button secondary" type="button" onClick={() => addRow("income_statement")}>
              <Plus size={18} />
              Tambah akun laba rugi
            </button>
          </div>
          <ReadinessPanel status={readiness.income} onNavigate={navigateToWorkflowTab} />
          <AccountInputTable
            emptyMessage="Belum ada akun laba rugi. Tambahkan baris akun laba rugi."
            mappedRows={incomeStatementRows}
            periods={periods}
            testId="income-account-table"
            onRemoveRow={removeRow}
            onToggleLabel={toggleRowLabel}
            onUpdateRow={updateRow}
            onUpdateRowValue={updateRowValue}
          />
          <div className="account-input-footer">
            <button className="button secondary" type="button" onClick={() => addRow("income_statement")}>
              <Plus size={18} />
              Tambah akun laba rugi
            </button>
          </div>
          <IncomeStatementReportTable periods={periods} view={incomeStatementView} />
        </section>
        ) : null}

        {activeWorkflowTab === "mapping" ? (
        <section id="mapping" className="split-panel">
          <article className="panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Langkah 3</p>
                <h3>Tinjauan pemetaan</h3>
              </div>
              <div className="status-pill muted">
                <GitBranch size={18} />
                {accountMappingRules.length} aturan
              </div>
            </div>
            <ReadinessPanel status={readiness.mapping} onNavigate={navigateToWorkflowTab} />
            <MappingTable mappedRows={mappedRows} />
          </article>
        </section>
        ) : null}

        {activeWorkflowTab === "wacc" ? (
        <section id="wacc" className="panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">WACC</p>
              <h3>Biaya modal rata-rata tertimbang (WACC)</h3>
            </div>
          </div>
          <ReadinessPanel status={readiness.wacc} onNavigate={navigateToWorkflowTab} />
          <WaccMarketSuggestionPanel
            suggestion={marketSuggestion}
            valuationDate={effectiveValuationDate}
            onApply={applyWaccMarketSuggestion}
          />
          <WaccCalculatorPanel
            assumptions={assumptions}
            calculation={waccCalculation}
            comparableBeta={waccComparableBeta}
            companySector={caseProfile.companySector}
            comparableOptions={sectorComparableOptions}
            comparableSuggestions={sectorComparableSuggestions}
            autoCapitalValues={autoWaccCapitalValues}
            governance={assumptionGovernance}
            onChange={updateAssumption}
            onComparableNameChange={updateWaccComparableName}
            onApplyComparableSuggestions={applySectorComparableSuggestions}
            onReasonChange={(value) => updateAssumptionText("waccOverrideReason", value)}
          />
        </section>
        ) : null}

        {activeWorkflowTab === "eemDcfAssumptions" ? (
        <section id="eem-dcf-assumptions" className="panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Asumsi EEM/DCF</p>
              <h3>Driver kapitalisasi dan proyeksi</h3>
            </div>
          </div>
          <ReadinessPanel status={readiness.eemDcfAssumptions} onNavigate={navigateToWorkflowTab} />
          <AssumptionDriverMatrix drivers={assumptionDriverSummaries} />
          <div className="assumption-tax-row">
            <AssumptionDriverCard
              label="Tarif pajak"
              value={assumptions.taxRate}
              sourceId={assumptions.taxRateSource}
              reason={assumptions.taxRateOverrideReason}
              candidates={taxRateCandidates}
              emptyCandidateText="Isi tahun transaksi di Data Awal atau tanggal penilaian untuk memunculkan tarif statutory umum."
              manualHint="Override fasilitas khusus wajib diberi alasan."
              testIdSlug="tax-rate"
              onSelect={(candidate) => applyAssumptionCandidate("taxRate", candidate)}
              onValueChange={(value) => updateAssumption("taxRate", value)}
              onReasonChange={(value) => updateAssumptionText("taxRateOverrideReason", value)}
            />
          </div>
          <div className="assumption-calculator-grid">
            <TerminalGrowthPanel
              assumptions={assumptions}
              wacc={snapshot.wacc}
              suggestion={terminalGrowthSuggestion}
              governance={assumptionGovernance}
              onChange={updateAssumption}
              onApplySuggestion={applyTerminalGrowthSuggestion}
              onReasonChange={(value) => updateAssumptionText("terminalGrowthOverrideReason", value)}
            />
            <RequiredReturnOnNtaPanel
              assumptions={assumptions}
              calculation={requiredReturnCalculation}
              suggestion={requiredReturnSuggestion}
              balances={{
                accountReceivable: snapshot.accountReceivable,
                inventory: snapshot.inventory,
                fixedAssetsNet: snapshot.fixedAssetsNet,
              }}
              governance={assumptionGovernance}
              onChange={updateAssumption}
              onReasonChange={(value) => updateAssumptionText("requiredReturnOnNtaOverrideReason", value)}
            />
          </div>
          <DriverOverrideGuidance />
          <div className="assumption-form-grid compact-driver-grid">
            <AssumptionInput
              label="Override pertumbuhan pendapatan (opsional)"
              value={assumptions.revenueGrowth}
              suggestion={{
                value: formatOptionalDriverSuggestionInput(snapshot.revenueGrowth, "rate"),
                displayValue: formatPercent(snapshot.revenueGrowth),
                kind: "rate",
              }}
              note={buildOptionalDriverNote({
                inputValue: assumptions.revenueGrowth,
                effectiveLabel: formatPercent(snapshot.revenueGrowth),
                fallbackSource: "histori pendapatan aktif",
              })}
              onChange={(value) => updateAssumption("revenueGrowth", value)}
              onApplySuggestion={(value) => updateAssumption("revenueGrowth", value)}
            />
            <AssumptionInput
              label="Hari piutang / AR days (override opsional)"
              value={assumptions.arDays}
              suggestion={{
                value: formatOptionalDriverSuggestionInput(snapshot.arDays, "number"),
                displayValue: formatDays(snapshot.arDays),
                kind: "number",
              }}
              note={buildOptionalDriverNote({
                inputValue: assumptions.arDays,
                effectiveLabel: formatDays(snapshot.arDays),
                fallbackSource: "saldo piutang dan pendapatan historis",
              })}
              onChange={(value) => updateAssumption("arDays", value)}
              onApplySuggestion={(value) => updateAssumption("arDays", value)}
            />
            <AssumptionInput
              label="Hari persediaan (override opsional)"
              value={assumptions.inventoryDays}
              suggestion={{
                value: formatOptionalDriverSuggestionInput(snapshot.inventoryDays, "number"),
                displayValue: formatDays(snapshot.inventoryDays),
                kind: "number",
              }}
              note={buildOptionalDriverNote({
                inputValue: assumptions.inventoryDays,
                effectiveLabel: formatDays(snapshot.inventoryDays),
                fallbackSource: "saldo persediaan dan COGS historis",
              })}
              onChange={(value) => updateAssumption("inventoryDays", value)}
              onApplySuggestion={(value) => updateAssumption("inventoryDays", value)}
            />
            <AssumptionInput
              label="Hari utang usaha / AP days (override opsional)"
              value={assumptions.apDays}
              suggestion={{
                value: formatOptionalDriverSuggestionInput(snapshot.apDays, "number"),
                displayValue: formatDays(snapshot.apDays),
                kind: "number",
              }}
              note={buildOptionalDriverNote({
                inputValue: assumptions.apDays,
                effectiveLabel: formatDays(snapshot.apDays),
                fallbackSource: "saldo utang usaha dan COGS historis",
              })}
              onChange={(value) => updateAssumption("apDays", value)}
              onApplySuggestion={(value) => updateAssumption("apDays", value)}
            />
            <AssumptionInput
              label="Hari utang lain-lain (override opsional)"
              value={assumptions.otherPayableDays}
              suggestion={{
                value: formatOptionalDriverSuggestionInput(snapshot.otherPayableDays, "number"),
                displayValue: formatDays(snapshot.otherPayableDays),
                kind: "number",
              }}
              note={buildOptionalDriverNote({
                inputValue: assumptions.otherPayableDays,
                effectiveLabel: formatDays(snapshot.otherPayableDays),
                fallbackSource: "saldo utang lain-lain dan beban operasional historis",
              })}
              onChange={(value) => updateAssumption("otherPayableDays", value)}
              onApplySuggestion={(value) => updateAssumption("otherPayableDays", value)}
            />
          </div>
        </section>
        ) : null}

        {activeWorkflowTab === "valuationAam" ? (
        readiness.valuationAam.isReady ? (
        <>
        <section id="aam-summary" className="section-grid">
          <article className="metric-card">
            <div className="card-title">
              <Calculator size={20} />
              <span>AAM</span>
            </div>
            <strong>{formatIdr(results.aam.equityValue)}</strong>
            <p>{activePeriod?.label || "Periode aktif"} · Nilai Ekuitas 100%</p>
          </article>
          <article className="metric-card">
            <div className="card-title">
              <Banknote size={20} />
              <span>Neraca basis</span>
            </div>
            <strong>{formatIdr(aamAdjustmentModel.historicalEquityValue)}</strong>
            <p>Aset historis dikurangi seluruh liabilitas historis; tidak memakai WACC, tarif pajak, terminal growth, atau required return on NTA.</p>
          </article>
          <article className="metric-card">
            <div className="card-title">
              <TableProperties size={20} />
              <span>Penyesuaian bersih</span>
            </div>
            <strong>{formatIdr(aamAdjustmentModel.assetAdjustmentTotal - aamAdjustmentModel.liabilityAdjustmentTotal)}</strong>
            <p>
              {aamAdjustmentModel.missingNoteCount > 0
                ? `${aamAdjustmentModel.missingNoteCount} penyesuaian masih perlu catatan.`
                : "Semua penyesuaian non-zero sudah memiliki catatan."}
            </p>
          </article>
        </section>

        <section id="aam-adjustments" className="panel aam-adjustment-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Penyesuaian AAM</p>
              <h3>Historis + Penyesuaian = Disesuaikan</h3>
            </div>
            <TableProperties size={22} />
          </div>
          {aamAdjustmentModel.missingNoteCount > 0 ? (
            <div className="aam-adjustment-warning" role="status">
              <AlertTriangle size={16} />
              <span>Penyesuaian AAM bernilai tidak nol wajib memiliki catatan/alasan agar jejak audit lengkap.</span>
            </div>
          ) : null}
          <AamAdjustmentTable
            title="Aset"
            lines={aamAdjustmentModel.assetLines}
            historicalTotal={aamAdjustmentModel.historicalAssetTotal}
            adjustmentTotal={aamAdjustmentModel.assetAdjustmentTotal}
            adjustedTotal={aamAdjustmentModel.adjustedAssetTotal}
            onUpdate={updateAamAdjustment}
          />
          <AamAdjustmentTable
            title="Liabilitas"
            lines={aamAdjustmentModel.liabilityLines}
            historicalTotal={aamAdjustmentModel.historicalLiabilityTotal}
            adjustmentTotal={aamAdjustmentModel.liabilityAdjustmentTotal}
            adjustedTotal={aamAdjustmentModel.adjustedLiabilityTotal}
            onUpdate={updateAamAdjustment}
          />
        </section>

        <section id="aam" className="split-panel">
          <article className="panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Jejak AAM</p>
                <h3>Asset Accumulation Method (AAM)</h3>
              </div>
              <Banknote size={22} />
            </div>
            <FormulaList traces={results.aam.traces} />
          </article>
          <article className="panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Rekonsiliasi</p>
                <h3>Ekuitas dan cakupan metode</h3>
              </div>
              <FileSearch size={22} />
            </div>
            <MetricTraceGrid
              metrics={[
                ["Ekuitas buku", formatIdr(aamAdjustmentModel.bookEquity)],
                ["Selisih nilai AAM disesuaikan ke ekuitas buku", formatIdr(aamAdjustmentModel.adjustedBookEquityGap)],
                ["Tidak diperlukan", "WACC, terminal growth, tarif pajak, required return on NTA"],
                ["Cakupan adjustment", "Hanya memengaruhi AAM; EEM/DCF tetap memakai snapshot historis/normalized"],
              ]}
            />
            <AamEquityReconciliation lines={aamAdjustmentModel.equityLines} />
          </article>
        </section>
        </>
        ) : (
          <ReadinessPanel status={readiness.valuationAam} onNavigate={navigateToWorkflowTab} force />
        )
        ) : null}

        {activeWorkflowTab === "valuationEemDcf" ? (
        readiness.valuationEemDcf.isReady ? (
        <>
        <section id="eem-dcf-summary" className="section-grid">
          {eemDcfMethodCards.map((method) => (
            <article className="metric-card" key={method.method}>
              <div className="card-title">
                <Calculator size={20} />
                <span>{method.method}</span>
              </div>
              <strong>{formatIdr(method.equityValue)}</strong>
              <p>{activePeriod?.label || "Periode aktif"} · Nilai Ekuitas 100%</p>
            </article>
          ))}
        </section>

        <section className="active-driver-strip" aria-label="Driver aktif penilaian">
          {assumptionDriverSummaries.map((driver) => (
            <div key={driver.label}>
              <span>{driver.label}</span>
              <strong>{driver.valueLabel}</strong>
              <small>{driver.sourceLabel}</small>
            </div>
          ))}
        </section>

        <section className={`assumption-audit-panel ${assumptionGovernance.level}`} aria-label="Audit asumsi material EEM dan DCF">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Mesin tata kelola asumsi</p>
              <h3>{assumptionGovernance.title}</h3>
              <small>{assumptionGovernance.summary}</small>
            </div>
            <em className={`source-badge ${assumptionGovernance.level === "critical" ? "warning" : assumptionGovernance.level === "review" ? "sensitivity" : "recommended"}`}>
              {assumptionGovernance.criticalCount} kritis · {assumptionGovernance.reviewCount} tinjauan
            </em>
          </div>
          <div className="assumption-audit-grid">
            {assumptionGovernance.items.map((item) => (
              <AssumptionGovernanceCard item={item} key={item.id} onNavigate={navigateToGovernanceTarget} />
            ))}
          </div>
        </section>

        <section className="review-band compact-review">
          <div>
            <p className="eyebrow">Pemeriksaan model</p>
            <h3>Kesiapan</h3>
          </div>
          <div className="risk-grid">
            {checks.map((check) => (
              <div className={check.ok ? "risk-item ok-item" : "risk-item"} key={check.label}>
                {check.ok ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
                <span>{check.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Sensitivitas</p>
              <h3>Cakupan skenario pengguna</h3>
            </div>
          </div>
          <div className="sensitivity-grid">
            <div>
              <span>DCF - skenario dasar</span>
              <strong data-testid="dcf-base-equity-value">{formatIdr(results.dcf.equityValue)}</strong>
            </div>
            <div>
              <span>DCF - terminal downside</span>
              <strong>{formatIdr(results.sensitivities.dcfTerminalDownside.equityValue)}</strong>
            </div>
            <div>
              <span>DCF - terminal upside</span>
              <strong>{formatIdr(results.sensitivities.dcfTerminalUpside.equityValue)}</strong>
            </div>
            <div>
              <span>DCF tanpa WC incremental</span>
              <strong>{formatIdr(results.sensitivities.dcfNoIncrementalWorkingCapital.equityValue)}</strong>
            </div>
            <div>
              <span>DCF utang pajak debt-like</span>
              <strong>{formatIdr(results.sensitivities.dcfTaxPayableDebtLike.equityValue)}</strong>
            </div>
            <div>
              <span>EEM utang pajak debt-like</span>
              <strong>{formatIdr(results.sensitivities.eemTaxPayableDebtLike.equityValue)}</strong>
            </div>
          </div>
        </section>

        <section id="eem" className="split-panel">
          <article className="panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Jejak EEM</p>
                <h3>Excess Earnings Method (EEM)</h3>
              </div>
              <FileSearch size={22} />
            </div>
            <FormulaList traces={results.eem.traces} />
          </article>

          <article className="panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Jejak DCF</p>
                <h3>Discounted Cash Flow (DCF)</h3>
              </div>
              <TableProperties size={22} />
            </div>
            <FormulaList traces={results.dcf.traces} />
          </article>
        </section>

        <section id="dcf" className="split-panel">
          <article className="panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Proyeksi</p>
                <h3>Proyeksi FCFF</h3>
              </div>
            </div>
            <div className="compact-table">
              {results.dcf.forecast.map((row) => (
                <div className="forecast-row" key={row.year}>
                  <span>{row.year}</span>
                  <strong>{formatIdr(row.freeCashFlow)}</strong>
                  <small>PV {formatIdr(row.presentValue)}</small>
                </div>
              ))}
            </div>
          </article>
        </section>
        </>
        ) : (
          <ReadinessPanel status={readiness.valuationEemDcf} onNavigate={navigateToWorkflowTab} force />
        )
        ) : null}

        {activeWorkflowTab === "projectedIncome" ? (
          readiness.projectedIncome.isReady ? (
            <ProjectionStatementSection kind="income" forecast={results.dcf.forecast} snapshot={snapshot} />
          ) : (
            <ReadinessPanel status={readiness.projectedIncome} onNavigate={navigateToWorkflowTab} force />
          )
        ) : null}

        {activeWorkflowTab === "projectedBalance" ? (
          readiness.projectedBalance.isReady ? (
            <ProjectionStatementSection kind="balance" forecast={results.dcf.forecast} snapshot={snapshot} />
          ) : (
            <ReadinessPanel status={readiness.projectedBalance} onNavigate={navigateToWorkflowTab} force />
          )
        ) : null}

        {activeWorkflowTab === "projectedFixedAssets" ? (
          readiness.projectedFixedAssets.isReady ? (
            <ProjectionStatementSection
              kind="fixedAssets"
              forecast={results.dcf.forecast}
              snapshot={snapshot}
              fixedAssetProjection={fixedAssetProjection}
              fixedAssetProjectionMode={fixedAssetProjectionMode}
              onFixedAssetProjectionModeChange={(mode) =>
                commitCoreState((current) => ({
                  ...current,
                  fixedAssetProjectionMode: mode,
                }))
              }
            />
          ) : (
            <ReadinessPanel status={readiness.projectedFixedAssets} onNavigate={navigateToWorkflowTab} force />
          )
        ) : null}

        {activeWorkflowTab === "projectedCashFlow" ? (
          readiness.projectedCashFlow.isReady ? (
            <ProjectionStatementSection kind="cashFlow" forecast={results.dcf.forecast} snapshot={snapshot} />
          ) : (
            <ReadinessPanel status={readiness.projectedCashFlow} onNavigate={navigateToWorkflowTab} force />
          )
        ) : null}

        {activeWorkflowTab === "dlom" ? (
          <DlomSection
            dlom={dlom}
            calculation={dlomCalculation}
            readiness={readiness.dlom}
            onNavigate={navigateToWorkflowTab}
            onUpdateFactor={updateDlomFactor}
          />
        ) : null}

        {activeWorkflowTab === "dlocPfc" ? (
          <DlocPfcSection
            calculation={dlocPfcCalculation}
            readiness={readiness.dlocPfc}
            onNavigate={navigateToWorkflowTab}
            onUpdateFactor={updateDlocPfcFactor}
          />
        ) : null}

        {activeWorkflowTab === "taxSimulation" ? (
          <TaxSimulationSection
            state={taxSimulation}
            result={taxSimulationResult}
            dlom={dlomCalculation}
            dlocPfc={dlocPfcCalculation}
            caseProfileDerived={caseProfileDerived}
            readiness={readiness.taxSimulation}
            onNavigate={navigateToWorkflowTab}
            onUpdate={updateTaxSimulation}
          />
        ) : null}

        {activeWorkflowTab === "cashFlowStatement" ? (
          readiness.cashFlowStatement.isReady ? (
            <CashFlowStatementSection
              analysis={sectionAnalysis}
              readiness={readiness.cashFlowStatement}
              onNavigate={navigateToWorkflowTab}
              onUpdateOverride={updateCashFlowOverride}
            />
          ) : (
            <ReadinessPanel status={readiness.cashFlowStatement} onNavigate={navigateToWorkflowTab} force />
          )
        ) : null}

        {activeWorkflowTab === "payablesCashFlow" ? (
          readiness.payablesCashFlow.isReady ? (
            <PayablesCashFlowSection analysis={sectionAnalysis} />
          ) : (
            <ReadinessPanel status={readiness.payablesCashFlow} onNavigate={navigateToWorkflowTab} force />
          )
        ) : null}

        {activeWorkflowTab === "noplatFcf" ? (
          readiness.noplatFcf.isReady ? (
            <NoplatFcfSection analysis={sectionAnalysis} />
          ) : (
            <ReadinessPanel status={readiness.noplatFcf} onNavigate={navigateToWorkflowTab} force />
          )
        ) : null}

        {activeWorkflowTab === "ratiosCapital" ? (
          readiness.ratiosCapital.isReady ? (
            <RatiosCapitalSection analysis={sectionAnalysis} readiness={readiness.ratiosCapital} onNavigate={navigateToWorkflowTab} />
          ) : (
            <ReadinessPanel status={readiness.ratiosCapital} onNavigate={navigateToWorkflowTab} force />
          )
        ) : null}

        {activeWorkflowTab === "audit" ? (
        <section id="audit" className="panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Status model terhitung</p>
              <h3>Snapshot audit</h3>
            </div>
          </div>
          <ReadinessOverview readiness={readiness} onNavigate={navigateToWorkflowTab} />
          <dl className="assumption-grid">
            <div>
              <dt>Periode aktif</dt>
              <dd>{activePeriod?.label || "Belum diisi"}</dd>
            </div>
            <div>
              <dt>Tanggal penilaian</dt>
              <dd>{formatDisplayDate(snapshot.valuationDate) || "Belum diisi"}</dd>
            </div>
            <div>
              <dt>Akun terpetakan</dt>
              <dd>{mappedRows.filter((item) => item.effectiveCategory !== "UNMAPPED").length}</dd>
            </div>
            <div>
              <dt>Total aset disesuaikan</dt>
              <dd>{formatIdr(results.adjustedTotalAssets)}</dd>
            </div>
            <div>
              <dt>Nilai buku bersih aset tetap</dt>
              <dd>{formatIdr(snapshot.fixedAssetsNet)}</dd>
            </div>
            <div>
              <dt>Total liabilitas disesuaikan</dt>
              <dd>{formatIdr(results.adjustedTotalLiabilities)}</dd>
            </div>
            <div>
              <dt>Komponen ekuitas buku</dt>
              <dd>{formatIdr(equityBookComponents)}</dd>
            </div>
            <div>
              <dt>Selisih neraca</dt>
              <dd>{formatIdr(balanceSheetGap)}</dd>
            </div>
            <div>
              <dt>Commercial EBIT</dt>
              <dd>{formatIdr(snapshot.ebit)}</dd>
            </div>
            <div>
              <dt>Tarif pajak</dt>
              <dd>{formatPercent(snapshot.taxRate)}</dd>
            </div>
            <div>
              <dt>Driver pertumbuhan pendapatan</dt>
              <dd>{formatPercent(snapshot.revenueGrowth)}</dd>
            </div>
            <div>
              <dt>Driver margin COGS</dt>
              <dd>{formatPercent(snapshot.cogsMargin)}</dd>
            </div>
            <div>
              <dt>Driver margin opex</dt>
              <dd>{formatPercent(snapshot.gaMargin)}</dd>
            </div>
            <div>
              <dt>Driver margin penyusutan</dt>
              <dd>{formatPercent(snapshot.depreciationMargin)}</dd>
            </div>
            <div>
              <dt>Operating working capital</dt>
              <dd>{formatIdr(results.operatingWorkingCapital)}</dd>
            </div>
            <div>
              <dt>Utang berbunga</dt>
              <dd>{formatIdr(results.interestBearingDebt)}</dd>
            </div>
          </dl>
        </section>
        ) : null}
      </section>
    </main>
  );
}

function ReadinessPanel({
  status,
  onNavigate,
  force = false,
}: {
  status: SectionReadiness;
  onNavigate: (tabId: WorkflowTabId) => void;
  force?: boolean;
}) {
  if (!force && status.isReady && status.warnings.length === 0) {
    return null;
  }

  const hasBlockingItems = status.missing.length > 0;

  return (
    <section className={hasBlockingItems ? "readiness-panel blocking" : "readiness-panel"} data-testid={`readiness-${status.id}`}>
      <div className="readiness-heading">
        <div>
          <p className="eyebrow">{hasBlockingItems ? "Data belum lengkap" : "Kesiapan data"}</p>
          <h3>{hasBlockingItems ? `${status.title} belum dapat ditampilkan penuh` : `${status.title} siap diproses`}</h3>
        </div>
        <span className={hasBlockingItems ? "badge warning" : "badge ok"}>{hasBlockingItems ? "Perlu dilengkapi" : "Siap"}</span>
      </div>

      {hasBlockingItems ? (
        <div className="readiness-list">
          <h4>Masih diperlukan</h4>
          {status.missing.map((item) => (
            <a
              href={`#${item.targetTab}`}
              className="readiness-link"
              onClick={(event) => {
                event.preventDefault();
                onNavigate(item.targetTab);
              }}
              key={`${item.label}-${item.targetTab}`}
            >
              <span>
                {item.label}
                {item.detail ? <small>{item.detail}</small> : null}
              </span>
              <strong>
                {item.targetLabel}
                <ArrowRight size={14} />
              </strong>
            </a>
          ))}
        </div>
      ) : null}

      {status.warnings.length > 0 ? (
        <div className="readiness-list warning-list">
          <h4>Peringatan</h4>
          {status.warnings.map((item) => (
            <a
              href={`#${item.targetTab}`}
              className="readiness-link"
              onClick={(event) => {
                event.preventDefault();
                onNavigate(item.targetTab);
              }}
              key={`${item.label}-${item.targetTab}`}
            >
              <span>{item.label}</span>
              <strong>
                {item.targetLabel}
                <ArrowRight size={14} />
              </strong>
            </a>
          ))}
        </div>
      ) : null}

      {status.fulfilled.length > 0 ? (
        <div className="readiness-list fulfilled-list">
          <h4>Sudah terpenuhi</h4>
          <div className="fulfilled-grid">
            {status.fulfilled.map((item) => (
              <span className="fulfilled-item" key={`${item.label}-${item.targetTab}`}>
                <CheckCircle2 size={14} />
                {item.label}
              </span>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}

function ReadinessOverview({ readiness, onNavigate }: { readiness: WorkbenchReadiness; onNavigate: (tabId: WorkflowTabId) => void }) {
  return (
    <section className="readiness-overview" data-testid="readiness-overview">
      {workflowTabs.map((tab) => {
        const status = readiness[tab.id];
        const unresolvedCount = status.missing.length + status.warnings.length;

        return (
          <button
            className={status.isReady && status.warnings.length === 0 ? "readiness-overview-item ready" : "readiness-overview-item"}
            type="button"
            onClick={() => onNavigate(tab.id)}
            key={tab.id}
          >
            {status.isReady && status.warnings.length === 0 ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
            <span>{tab.label}</span>
            <strong>{unresolvedCount === 0 ? "Siap" : `${unresolvedCount} item`}</strong>
          </button>
        );
      })}
    </section>
  );
}

function DlomSection({
  dlom,
  calculation,
  readiness,
  onNavigate,
  onUpdateFactor,
}: {
  dlom: DlomState;
  calculation: DlomCalculation;
  readiness: SectionReadiness;
  onNavigate: (tabId: WorkflowTabId) => void;
  onUpdateFactor: (id: DlomFactorId, patch: Partial<DlomState["factors"][DlomFactorId]>) => void;
}) {
  return (
    <>
      <section className="section-grid dlom-summary-grid" data-testid="dlom-summary">
        <article className="metric-card">
          <div className="card-title">
            <Calculator size={20} />
            <span>DLOM Objek Penilaian</span>
          </div>
          <strong>{calculation.isComplete ? formatPercent(calculation.dlomRate) : "Belum lengkap"}</strong>
          <p>Scenario layer; base AAM/EEM/DCF tetap sebelum DLOM.</p>
        </article>
        <article className="metric-card">
          <div className="card-title">
            <TableProperties size={20} />
            <span>Jumlah skor</span>
          </div>
          <strong>
            {formatNumber(calculation.totalScore)} / {formatNumber(calculation.maxScore)}
          </strong>
          <p>Baseline workbook: 10 faktor dengan skor 0, 0,5, atau 1.</p>
        </article>
        <article className="metric-card">
          <div className="card-title">
            <AlertTriangle size={20} />
            <span>Status & resistensi WP</span>
          </div>
          <strong>{calculation.status}</strong>
          <p>Potensi resistensi wajib pajak: {calculation.taxpayerResistance}.</p>
        </article>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Discount Lack of Marketability</p>
            <h3>Basis dan rentang DLOM</h3>
          </div>
          <FileSearch size={22} />
        </div>
        <ReadinessPanel status={readiness} onNavigate={onNavigate} />
        <div className="dlom-control-grid" data-testid="dlom-basis-grid">
          <DlomBasisField
            label="Basis marketability"
            value={calculation.companyMarketability || "Isi Data Awal"}
          />
          <DlomBasisField
            label="Basis interest yang dinilai"
            value={calculation.interestBasis || "Isi Data Awal"}
          />
          <DlomBasisField label="Rentang DLOM" value={calculation.rangeLabel} />
        </div>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Scoring workbook</p>
            <h3>Faktor, rekomendasi, dan override</h3>
          </div>
        </div>
        <div className="table-wrap dlom-table-wrap">
          <table className="dlom-table" data-testid="dlom-factor-table">
            <colgroup>
              <col className="dlom-no-column" />
              <col className="dlom-factor-column" />
              <col className="dlom-answer-column" />
              <col className="dlom-score-column" />
              <col className="dlom-evidence-column" />
              <col className="dlom-override-column" />
            </colgroup>
            <thead>
              <tr>
                <th>No.</th>
                <th>Faktor</th>
                <th>Jawaban final</th>
                <th className="numeric-cell">Skor</th>
                <th>Rekomendasi & evidence</th>
                <th>Keterangan Tambahan</th>
              </tr>
            </thead>
            <tbody>
              {calculation.factors.map((factor) => {
                const input = dlom.factors[factor.id];

                return (
                  <tr key={factor.id}>
                    <td>{factor.no}</td>
                    <td>
                      <strong>{factor.factor}</strong>
                      <span>{factor.prompt}</span>
                      <span>Basis bukti: {factor.evidenceBasis}</span>
                    </td>
                    <td>
                      <select
                        aria-label={`Jawaban DLOM ${factor.factor}`}
                        value={input.answer}
                        onChange={(event) => onUpdateFactor(factor.id, { answer: event.target.value })}
                      >
                        <option value="">Pilih</option>
                        {factor.options.map((option) => (
                          <option value={option.label} key={option.label}>
                            {option.label} · skor {formatNumber(option.score)}
                          </option>
                        ))}
                      </select>
                      {factor.status === "missing" ? <span className="badge warning">Belum lengkap</span> : <span className="badge ok">Terisi</span>}
                      {factor.isOverride ? <span className="badge warning">Override rekomendasi</span> : null}
                    </td>
                    <td className="numeric-cell">{formatNumber(factor.score)}</td>
                    <td>
                      <strong>{factor.recommendation.answer || "Manual"}</strong>
                      <span>{formatScore(factor.recommendation.confidence)} confidence · {factor.recommendation.source}</span>
                      <span>{factor.recommendation.evidence}</span>
                    </td>
                    <td>
                      <textarea
                        aria-label={`Keterangan Tambahan ${factor.factor}`}
                        value={input.overrideReason}
                        onChange={(event) => onUpdateFactor(factor.id, { overrideReason: event.target.value })}
                        placeholder="Catatan reviewer, dokumen pendukung, atau alasan judgement."
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

function DlocPfcSection({
  calculation,
  readiness,
  onNavigate,
  onUpdateFactor,
}: {
  calculation: DlocPfcCalculation;
  readiness: SectionReadiness;
  onNavigate: (tabId: WorkflowTabId) => void;
  onUpdateFactor: (id: DlocPfcFactorId, patch: Partial<DlocPfcState["factors"][DlocPfcFactorId]>) => void;
}) {
  return (
    <>
      <section className="section-grid dlom-summary-grid" data-testid="dloc-pfc-summary">
        <article className="metric-card">
          <div className="card-title">
            <Calculator size={20} />
            <span>DLOC/PFC Objek Penilaian</span>
          </div>
          <strong>{calculation.isComplete ? formatPercent(calculation.signedRate) : "Belum lengkap"}</strong>
          <p>{calculation.adjustmentType || "Status"} berasal dari Jenis Kepemilikan Saham di Data Awal.</p>
        </article>
        <article className="metric-card">
          <div className="card-title">
            <TableProperties size={20} />
            <span>Jumlah skor</span>
          </div>
          <strong>
            {formatNumber(calculation.totalScore)} / {formatNumber(calculation.maxScore)}
          </strong>
          <p>Questionnaire workbook: 5 faktor dengan skor 0, 0,5, atau 1.</p>
        </article>
        <article className="metric-card">
          <div className="card-title">
            <AlertTriangle size={20} />
            <span>Status & resistensi WP</span>
          </div>
          <strong>{calculation.status}</strong>
          <p>Potensi resistensi wajib pajak: {calculation.taxpayerResistance}.</p>
        </article>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Discount Lack of Control / Premium for Control</p>
            <h3>Basis dan rentang DLOC/PFC</h3>
          </div>
          <GitBranch size={22} />
        </div>
        <ReadinessPanel status={readiness} onNavigate={onNavigate} />
        <div className="dlom-control-grid" data-testid="dloc-pfc-basis-grid">
          <DerivedCaseField label="Jenis Perusahaan" value={calculation.companyBasis || "Isi Data Awal"} />
          <DerivedCaseField label="Status adjustment" value={calculation.adjustmentType || "Isi Data Awal"} />
          <DerivedCaseField label="Rentang DLOC/PFC" value={calculation.rangeLabel} />
        </div>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Questionnaire workbook</p>
            <h3>Faktor kendali dan skor</h3>
          </div>
        </div>
        <div className="table-wrap dlom-table-wrap">
          <table className="dlom-table dloc-pfc-table" data-testid="dloc-pfc-factor-table">
            <colgroup>
              <col className="dloc-pfc-no-column" />
              <col className="dloc-pfc-factor-column" />
              <col className="dloc-pfc-answer-column" />
              <col className="dloc-pfc-score-column" />
              <col className="dloc-pfc-evidence-column" />
              <col className="dloc-pfc-reviewer-column" />
            </colgroup>
            <thead>
              <tr>
                <th>No.</th>
                <th>Faktor</th>
                <th>Jawaban final</th>
                <th className="numeric-cell">Skor</th>
                <th>Basis bukti</th>
                <th>Keterangan Tambahan</th>
              </tr>
            </thead>
            <tbody>
              {calculation.factors.map((factor) => (
                <tr key={factor.id}>
                  <td>{factor.no}</td>
                  <td>
                    <strong>{factor.factor}</strong>
                    <span>{factor.prompt}</span>
                  </td>
                  <td>
                    <select
                      aria-label={`Jawaban DLOC/PFC ${factor.factor}`}
                      value={factor.answer}
                      onChange={(event) => onUpdateFactor(factor.id, { answer: event.target.value })}
                    >
                      <option value="">Pilih</option>
                      {factor.options.map((option) => (
                        <option value={option.label} key={option.label}>
                          {option.label} · skor {formatNumber(option.score)}
                        </option>
                      ))}
                    </select>
                    {factor.status === "missing" ? <span className="badge warning">Belum lengkap</span> : <span className="badge ok">Terisi</span>}
                  </td>
                  <td className="numeric-cell">{formatNumber(factor.score)}</td>
                  <td>
                    <span>{factor.evidenceBasis}</span>
                  </td>
                  <td>
                    <textarea
                      aria-label={`Keterangan Tambahan DLOC/PFC ${factor.factor}`}
                      value={factor.overrideReason}
                      onChange={(event) => onUpdateFactor(factor.id, { overrideReason: event.target.value })}
                      placeholder="Dokumen pendukung, judgement reviewer, atau referensi pemeriksaan."
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}

function TaxSimulationSection({
  state,
  result,
  dlom,
  dlocPfc,
  caseProfileDerived,
  readiness,
  onNavigate,
  onUpdate,
}: {
  state: TaxSimulationState;
  result: TaxSimulationResult;
  dlom: DlomCalculation;
  dlocPfc: DlocPfcCalculation;
  caseProfileDerived: CaseProfileDerived;
  readiness: SectionReadiness;
  onNavigate: (tabId: WorkflowTabId) => void;
  onUpdate: (patch: Partial<TaxSimulationState>) => void;
}) {
  const primaryRow = result.primaryRow;
  const baselinePrimaryRow = result.baselinePrimaryRow;
  const scenarioPrimaryRow = result.scenarioPrimaryRow;
  const taxYearLabel =
    result.taxYearResolution.appliedYear === null
      ? "Belum tersedia"
      : result.taxYearResolution.isNearestYear
        ? `${result.taxYearResolution.requestedYear} -> ${result.taxYearResolution.appliedYear}`
        : `${result.taxYearResolution.appliedYear}`;
  const selectedBasisLabel = result.finalBasis === "manualScenario" ? "Skenario manual" : "Baseline otomatis";

  return (
    <>
      <section className="section-grid tax-summary-grid" data-testid="tax-simulation-summary">
        <article className="metric-card">
          <div className="card-title">
            <Calculator size={20} />
            <span>Primary Method</span>
          </div>
          <strong>{state.primaryMethod || "Not selected"}</strong>
          <p>Final memakai {selectedBasisLabel}; sample workbook memakai AAM.</p>
        </article>
        <article className="metric-card">
          <div className="card-title">
            <Banknote size={20} />
            <span>Potensi pajak final</span>
          </div>
          <strong>{primaryRow ? formatIdr(primaryRow.potentialTax) : "Belum dikunci"}</strong>
          <p>{primaryRow ? primaryRow.taxBasisLabel : "Pilih Primary Method untuk summary/report."}</p>
        </article>
        <article className="metric-card">
          <div className="card-title">
            <GitBranch size={20} />
            <span>Baseline otomatis</span>
          </div>
          <strong>{dlom.isComplete ? `DLOM ${formatPercent(dlom.dlomRate)}` : "DLOM 0%"}</strong>
          <p>
            DLOC/PFC:{" "}
            {dlocPfc.isComplete ? `${dlocPfc.adjustmentType || "Adjustment"} ${formatPercent(dlocPfc.signedRate)}` : "Belum lengkap"}
            .
          </p>
        </article>
        <article className="metric-card">
          <div className="card-title">
            <CalendarDays size={20} />
            <span>Tahun pajak</span>
          </div>
          <strong>{taxYearLabel}</strong>
          <p>Diambil dari cut-off: Tahun Transaksi Pengalihan - 1.</p>
        </article>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Workbook-linked controls</p>
            <h3>Simulasi Potensi Pajak</h3>
          </div>
          <TableProperties size={22} />
        </div>
        <ReadinessPanel status={readiness} onNavigate={onNavigate} />
        <div className="tax-control-grid">
          <label className="field">
            <span>Primary Method</span>
            <select value={state.primaryMethod} onChange={(event) => onUpdate({ primaryMethod: event.target.value as ValuationMethod | "" })}>
              <option value="">Not selected</option>
              <option value="AAM">AAM</option>
              <option value="EEM">EEM</option>
              <option value="DCF">DCF</option>
            </select>
          </label>
          <label className="field">
            <span>Basis final</span>
            <select value={state.finalBasis} onChange={(event) => onUpdate({ finalBasis: event.target.value as TaxSimulationFinalBasis })}>
              <option value="baseline">Baseline otomatis</option>
              <option value="manualScenario">Skenario manual</option>
            </select>
          </label>
          <label className="field">
            <span>Nilai pengalihan saham yang dilaporkan</span>
            <input
              inputMode="decimal"
              value={state.reportedTransferValue}
              onChange={(event) => onUpdate({ reportedTransferValue: event.target.value })}
              placeholder="Fallback dari Data Awal bila kosong"
            />
          </label>
          <DerivedCaseField label="Tahun Pajak Legal" value={taxYearLabel} state={result.taxYearResolution.appliedYear === null ? "invalid" : "neutral"} />
          <DerivedCaseField label="DLOM baseline" value={dlom.isComplete ? formatPercent(dlom.dlomRate) : "Belum lengkap"} />
          <DerivedCaseField label="DLOC/PFC baseline" value={dlocPfc.isComplete ? `${dlocPfc.adjustmentType} ${formatPercent(dlocPfc.signedRate)}` : "Belum lengkap"} />
          <DerivedCaseField label={caseProfileDerived.capitalProportionLabel} value={formatCaseProfileProportion(caseProfileDerived)} />
          <DerivedCaseField label="Resistensi keseluruhan" value={result.overallResistance} state={result.overallResistance === "Belum lengkap" ? "invalid" : "neutral"} />
          <label className="field">
            <span>Skenario DLOM</span>
            <input inputMode="decimal" value={state.scenarioDlomRate} onChange={(event) => onUpdate({ scenarioDlomRate: event.target.value })} placeholder="Default baseline" />
          </label>
          <label className="field">
            <span>Skenario DLOC/PFC</span>
            <input inputMode="decimal" value={state.scenarioDlocPfcRate} onChange={(event) => onUpdate({ scenarioDlocPfcRate: event.target.value })} placeholder="Input positif; sistem tentukan DLOC/PFC" />
          </label>
        </div>
        <details className="audit-disclosure">
          <summary>Catatan audit skenario</summary>
          <div className="audit-disclosure-grid">
            <label className="field">
              <span>Catatan skenario manual</span>
              <textarea
                value={state.scenarioReason}
                onChange={(event) => onUpdate({ scenarioReason: event.target.value })}
                placeholder="Isi bila skenario manual dipakai sebagai basis final; tidak mengubah tab DLOM atau DLOC/PFC."
              />
            </label>
            <label className="field">
              <span>Catatan simulasi</span>
              <textarea value={state.note} onChange={(event) => onUpdate({ note: event.target.value })} placeholder="Dasar pemilihan metode, posisi DLOM, dan catatan review pajak." />
            </label>
          </div>
        </details>
      </section>

      {result.warnings.length > 0 ? (
        <section className="review-band compact-review">
          <div>
            <p className="eyebrow">Pemeriksaan simulasi</p>
            <h3>Perlu tinjauan</h3>
          </div>
          <div className="risk-grid">
            {result.warnings.map((warning) => (
              <div className="risk-item" key={warning}>
                <AlertTriangle size={18} />
                <span>{warning}</span>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="split-panel">
        <article className="panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Baseline otomatis</p>
              <h3>Linked ke DLOM dan DLOC/PFC</h3>
            </div>
          </div>
          <MetricTraceGrid
            metrics={[
              ["Potensi pajak", baselinePrimaryRow ? formatIdr(baselinePrimaryRow.potentialTax) : "Pilih Primary Method"],
              ["Nilai wajar pengalihan", baselinePrimaryRow ? formatIdr(baselinePrimaryRow.marketValueOfTransferredInterest) : "Belum tersedia"],
              ["PKP dibulatkan", baselinePrimaryRow ? formatIdr(baselinePrimaryRow.taxableIncomeRounded) : "Belum tersedia"],
              ["Sumber tarif", baselinePrimaryRow ? `${baselinePrimaryRow.taxSourceTitle} ${baselinePrimaryRow.appliedTaxYear ?? ""}` : "Belum tersedia"],
            ]}
          />
        </article>
        <article className="panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Skenario manual</p>
              <h3>What-if tanpa mengubah tab asal</h3>
            </div>
          </div>
          <MetricTraceGrid
            metrics={[
              ["Potensi pajak", scenarioPrimaryRow ? formatIdr(scenarioPrimaryRow.potentialTax) : "Pilih Primary Method"],
              ["DLOM skenario", scenarioPrimaryRow ? formatPercent(scenarioPrimaryRow.dlomRate) : "Default baseline"],
              ["DLOC/PFC skenario", scenarioPrimaryRow ? formatPercent(scenarioPrimaryRow.dlocPfcRate) : "Default baseline"],
              ["Basis final", result.finalBasis === "manualScenario" ? "Dipakai untuk summary" : "Pembanding saja"],
            ]}
          />
        </article>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Comparison table</p>
            <h3>AAM, EEM, dan DCF berdampingan</h3>
          </div>
          <span className="badge muted">{selectedBasisLabel}</span>
        </div>
        <div className="table-wrap tax-table-wrap">
          <table className="tax-simulation-table" data-testid="tax-simulation-table">
            <thead>
              <tr>
                <th>Metode</th>
                <th>Basis</th>
                <th className="numeric-cell">Base equity</th>
                <th className="numeric-cell">DLOM</th>
                <th className="numeric-cell">After DLOM</th>
                <th className="numeric-cell">DLOC/PFC</th>
                <th className="numeric-cell">Market value 100%</th>
                <th className="numeric-cell">Porsi</th>
                <th className="numeric-cell">Nilai pengalihan wajar</th>
                <th className="numeric-cell">Dilaporkan</th>
                <th className="numeric-cell">Selisih aktual</th>
                <th className="numeric-cell">PKP simulasi</th>
                <th className="numeric-cell">Potensi pajak</th>
              </tr>
            </thead>
            <tbody>
              {result.rows.map((row) => (
                <tr className={row.isPrimary ? "primary-method-row" : ""} key={row.method}>
                  <td>
                    <strong>{row.method}</strong>
                    {row.isPrimary ? <span className="badge ok">Primary</span> : <span>Comparison</span>}
                  </td>
                  <td>
                    {row.basisLabel}
                    <span>{row.isNearestTaxYear ? `Tarif ${row.requestedTaxYear} -> ${row.appliedTaxYear}` : `Tarif ${row.appliedTaxYear ?? "-"}`}</span>
                  </td>
                  <td className="numeric-cell">{formatIdr(row.baseEquityValue)}</td>
                  <td className="numeric-cell">
                    {formatPercent(row.dlomRate)}
                    <span>{formatIdr(row.dlomAdjustment)}</span>
                  </td>
                  <td className="numeric-cell">{formatIdr(row.valueAfterDlom)}</td>
                  <td className="numeric-cell">
                    {formatPercent(row.dlocPfcRate)}
                    <span>{formatIdr(row.dlocPfcAdjustment)}</span>
                  </td>
                  <td className="numeric-cell">{formatIdr(row.marketValueOfEquity100)}</td>
                  <td className="numeric-cell">{formatPercent(row.sharePercentage)}</td>
                  <td className="numeric-cell">{formatIdr(row.marketValueOfTransferredInterest)}</td>
                  <td className="numeric-cell">{formatIdr(row.reportedTransferValue)}</td>
                  <td className="numeric-cell">{formatIdr(row.transferValueDifference)}</td>
                  <td className="numeric-cell">
                    {formatIdr(row.potentialTaxableDifference)}
                  </td>
                  <td className="numeric-cell">
                    <strong>{formatIdr(row.potentialTax)}</strong>
                    <span>{row.taxSourceLegalBasis}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Formula trace</p>
            <h3>{primaryRow ? `${primaryRow.method} primary method` : "Primary Method belum dipilih"}</h3>
          </div>
        </div>
        {primaryRow ? <FormulaList traces={primaryRow.traces} /> : <div className="empty-state">Pilih Primary Method untuk melihat jejak formula final.</div>}
        <details className="audit-disclosure compact">
          <summary>Jejak audit basis perhitungan</summary>
          <MetricTraceGrid
            metrics={[
              ["Base AAM/EEM/DCF", "Before DLOM dan before DLOC/PFC"],
              ["Urutan adjustment", "Base -> DLOM -> DLOC/PFC -> porsi saham/modal -> selisih -> PKP"],
              ["Basis final default", "Baseline otomatis"],
              ["Skenario manual", "Tidak mengubah tab DLOM dan DLOC/PFC"],
            ]}
          />
        </details>
      </section>

      {primaryRow?.taxBrackets.length ? (
        <section className="panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Tax rate database</p>
              <h3>Layer perhitungan pajak</h3>
            </div>
            {primaryRow.taxSourceUrl ? (
              <a className="button secondary" href={primaryRow.taxSourceUrl} target="_blank" rel="noreferrer">
                <FileSearch size={18} />
                Sumber
              </a>
            ) : null}
          </div>
          <div className="table-wrap tax-bracket-table-wrap">
            <table className="tax-bracket-table" data-testid="tax-bracket-table">
              <thead>
                <tr>
                  <th>Layer</th>
                  <th className="numeric-cell">PKP</th>
                  <th className="numeric-cell">Tarif</th>
                  <th className="numeric-cell">Pajak</th>
                </tr>
              </thead>
              <tbody>
                {primaryRow.taxBrackets.map((bracket) => (
                  <tr key={`${bracket.label}-${bracket.rate}`}>
                    <td>{bracket.label}</td>
                    <td className="numeric-cell">{formatIdr(bracket.taxableAmount)}</td>
                    <td className="numeric-cell">{formatPercent(bracket.rate)}</td>
                    <td className="numeric-cell">{formatIdr(bracket.tax)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="total-row tax-total-row">
                  <td>Total potensi pajak</td>
                  <td className="numeric-cell">{formatIdr(primaryRow.taxableIncomeRounded)}</td>
                  <td className="numeric-cell">-</td>
                  <td className="numeric-cell">{formatIdr(primaryRow.potentialTax)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
          <details className="audit-disclosure compact">
            <summary>Detail sumber tarif dan dasar hukum</summary>
            <MetricTraceGrid
              metrics={[
                ["Dasar hukum", primaryRow.taxSourceLegalBasis],
                ["Sumber tarif", primaryRow.taxSourceTitle],
                ["Catatan", primaryRow.taxSourceNote],
                ["Effective rate", formatPercent(primaryRow.effectiveTaxRate)],
              ]}
            />
          </details>
        </section>
      ) : null}
    </>
  );
}

type DcfProjectionDisplay = "currency" | "percent" | "multiple";
type DcfProjectionStatus = "calculated" | "review" | "requiresInput" | "notModeled";
type ProjectionStatementKind = "income" | "balance" | "fixedAssets" | "cashFlow";

type DcfProjectionLine = {
  key: string;
  label: string;
  source: string | ((context: DcfProjectionContext) => string);
  formula: string;
  status?: DcfProjectionStatus | ((context: DcfProjectionContext) => DcfProjectionStatus);
  workbookReference?: string;
  display?: DcfProjectionDisplay;
  kind?: "section" | "subtotal";
  note?: string | ((context: DcfProjectionContext) => string | undefined);
  value?: (row: DcfForecastRow, index: number, context: DcfProjectionContext) => number | null;
};

type DcfProjectionContext = {
  forecast: DcfForecastRow[];
  snapshot: FinancialStatementSnapshot;
  fixedAssetProjection?: FixedAssetProjectionSummary;
};

type DcfProjectionConfig = {
  eyebrow: string;
  title: string;
  badge: string;
  summary: string;
  rows: DcfProjectionLine[];
  testId: string;
};

const projectionStatusLabels: Record<DcfProjectionStatus, string> = {
  calculated: "Terhitung",
  review: "Review",
  requiresInput: "Perlu input",
  notModeled: "Belum dimodelkan",
};

const projectionStatusClassNames: Record<DcfProjectionStatus, string> = {
  calculated: "ok",
  review: "warning",
  requiresInput: "warning",
  notModeled: "muted",
};

const dcfIncomeProjectionRows: DcfProjectionLine[] = [
  {
    key: "revenue",
    label: "Revenue",
    source: "PROY LR / engine DCF",
    formula: "Revenue t-1 x (1 + revenue growth)",
    status: "calculated",
    workbookReference: "PROY LR row 8",
    value: (row) => row.revenue,
  },
  {
    key: "revenue-growth",
    label: "Revenue Growth",
    source: "Driver pertumbuhan pendapatan aktif",
    formula: "Revenue t / Revenue t-1 - 1",
    status: "calculated",
    workbookReference: "PROY LR row 9",
    display: "percent",
    value: (row, index, context) => growthValue(row.revenue, previousRevenue(index, context)),
  },
  {
    key: "cogs",
    label: "Cost of Good Sold",
    source: "Margin historis / override driver",
    formula: "Revenue x margin COGS",
    status: "calculated",
    workbookReference: "PROY LR row 10",
    value: (row) => row.cogs,
  },
  {
    key: "gross-profit",
    label: "Gross Profit",
    source: "Engine DCF",
    formula: "Revenue - COGS",
    status: "calculated",
    workbookReference: "PROY LR row 11",
    value: (row) => row.grossProfit,
    kind: "subtotal",
  },
  {
    key: "gross-profit-margin",
    label: "Gross Profit Margin",
    source: "Engine DCF",
    formula: "Gross profit / revenue",
    status: "calculated",
    workbookReference: "PROY LR row 12",
    display: "percent",
    value: (row) => divideOrNull(row.grossProfit, row.revenue),
  },
  sectionProjectionLine("operating-expenses-section", "Operating Expenses:"),
  {
    key: "operating-expenses-other",
    label: "Others",
    source: "Perlu input",
    formula: "Manual operating expense line; belum menjadi driver engine",
    status: "requiresInput",
    workbookReference: "PROY LR row 15",
    note: "Engine saat ini memakai total G&A/opex, bukan rincian others.",
  },
  {
    key: "ga-overheads",
    label: "General & Administrative Overheads",
    source: "Margin historis / override driver",
    formula: "Revenue x margin opex",
    status: "calculated",
    workbookReference: "PROY LR row 16",
    value: (row) => row.operatingExpenses,
  },
  {
    key: "operating-expenses",
    label: "Operating Expenses (Exclude Depreciation)",
    source: "Subtotal operating expenses",
    formula: "Others + General & Administrative Overheads",
    status: "review",
    workbookReference: "PROY LR row 17",
    value: (row) => row.operatingExpenses,
    kind: "subtotal",
    note: "Subtotal berasal dari opex engine karena rincian others belum dimodelkan.",
  },
  {
    key: "ebitda",
    label: "EBITDA",
    source: "Engine DCF",
    formula: "EBIT + depreciation",
    status: "calculated",
    workbookReference: "PROY LR row 19",
    value: (row) => row.ebit + row.depreciation,
    kind: "subtotal",
  },
  {
    key: "depreciation",
    label: "Depreciation",
    source: "Margin historis / fixed asset basis",
    formula: "Revenue x margin penyusutan",
    status: "calculated",
    workbookReference: "PROY LR row 22",
    value: (row) => row.depreciation,
  },
  {
    key: "depreciation-growth",
    label: "Depreciation Growth",
    source: "Engine DCF",
    formula: "Depreciation t / depreciation t-1 - 1",
    status: "calculated",
    workbookReference: "PROY LR row 23",
    display: "percent",
    value: (row, index, context) => growthValue(row.depreciation, previousDepreciation(index, context)),
  },
  {
    key: "ebit",
    label: "EBIT",
    source: "PROY LR / engine DCF",
    formula: "Gross Profit - Operating Expenses - Depreciation",
    status: "calculated",
    workbookReference: "PROY LR row 25",
    value: (row) => row.ebit,
    kind: "subtotal",
  },
  {
    key: "ebit-margin",
    label: "EBIT Margin",
    source: "Engine DCF",
    formula: "EBIT / revenue",
    status: "calculated",
    workbookReference: "PROY LR row 26",
    display: "percent",
    value: (row) => divideOrNull(row.ebit, row.revenue),
  },
  sectionProjectionLine("other-income-section", "Other Income/(Charge)"),
  projectionNotModeledLine(
    "interest-income",
    "Interest Income",
    "Interest income dikeluarkan dari NOPLAT/FCFF dan membutuhkan input terpisah bila ingin full income statement.",
    "PROY LR row 29",
  ),
  projectionNotModeledLine("interest-income-growth", "Interest Income Growth", "Butuh proyeksi interest income.", "PROY LR row 30", "percent"),
  projectionNotModeledLine("interest-expense", "Interest Expense", "Interest expense dikeluarkan dari NOPLAT/FCFF.", "PROY LR row 31"),
  projectionNotModeledLine("interest-expense-growth", "Interest Expense Growth", "Butuh proyeksi interest expense.", "PROY LR row 32", "percent"),
  projectionNotModeledLine("other-income-charge", "Other Income/(Charge)", "Butuh proyeksi other income/charge.", "PROY LR row 33"),
  projectionNotModeledLine("non-operating-income", "Non Operating Income", "Non-operating income dikeluarkan dari operating DCF.", "PROY LR row 34"),
  {
    key: "profit-before-tax",
    label: "Profit Before Tax",
    source: "Operating DCF basis",
    formula: "EBIT; financing and non-operating items excluded",
    status: "review",
    workbookReference: "PROY LR row 36",
    value: (row) => row.ebit,
    kind: "subtotal",
    note: "PBT proyeksi memakai basis operasi karena interest/non-operating items belum dimodelkan di FCFF.",
  },
  {
    key: "corporate-tax",
    label: "Corporate Tax",
    source: "Asumsi statutory tax",
    formula: "EBIT x tax rate as deduction",
    status: "calculated",
    workbookReference: "PROY LR row 37",
    value: (row) => -row.statutoryTaxOnEbit,
  },
  {
    key: "net-profit-after-tax",
    label: "Net Profit After Tax / NOPLAT",
    source: "Commercial statutory operating basis",
    formula: "EBIT - statutory tax on EBIT",
    status: "calculated",
    workbookReference: "PROY LR row 39",
    value: (row) => row.noplat,
    kind: "subtotal",
  },
  {
    key: "net-profit-margin",
    label: "Net Profit After Tax Margin",
    source: "Engine DCF",
    formula: "NPAT / revenue",
    status: "calculated",
    workbookReference: "PROY LR row 40",
    display: "percent",
    value: (row) => divideOrNull(row.noplat, row.revenue),
  },
];

const dcfBalanceProjectionRows: DcfProjectionLine[] = [
  sectionProjectionLine("assets-section", "ASSETS"),
  sectionProjectionLine("current-assets-section", "Current Assets"),
  projectionInputLine("cash-on-hands", "Cash on Hands", "Kas operasional belum diproyeksikan dari driver DCF.", "PROY BALANCE SHEET row 9"),
  projectionInputLine("cash-on-hands-growth", "Cash on Hands Growth", "Butuh proyeksi kas di tangan per periode.", "PROY BALANCE SHEET row 10", "percent"),
  projectionInputLine("cash-in-banks", "Cash in Banks", "Kas bank/deposito belum diproyeksikan dari driver DCF.", "PROY BALANCE SHEET row 11"),
  projectionInputLine("cash-in-banks-growth", "Cash in Banks Growth", "Butuh proyeksi kas bank/deposito per periode.", "PROY BALANCE SHEET row 12", "percent"),
  {
    key: "account-receivable",
    label: "Account Receivable",
    source: "PROY BALANCE SHEET / DCF working capital",
    formula: "Revenue x AR days / 365",
    status: "calculated",
    workbookReference: "PROY BALANCE SHEET row 13",
    value: (row) => row.accountReceivable,
  },
  {
    key: "account-receivable-growth",
    label: "Account Receivable Growth",
    source: "DCF working capital",
    formula: "AR t / AR t-1 - 1",
    status: "calculated",
    workbookReference: "PROY BALANCE SHEET row 14",
    display: "percent",
    value: (row, index, context) => growthValue(row.accountReceivable, previousAccountReceivable(index, context)),
  },
  projectionInputLine("other-receivable", "Other Receivable", "Piutang lain-lain belum menjadi driver DCF.", "PROY BALANCE SHEET row 15"),
  projectionInputLine("other-receivable-growth", "Other Receivable Growth", "Butuh proyeksi piutang lain-lain.", "PROY BALANCE SHEET row 16", "percent"),
  {
    key: "inventory",
    label: "Inventory",
    source: "PROY BALANCE SHEET / DCF working capital",
    formula: "COGS x inventory days / 365",
    status: "calculated",
    workbookReference: "PROY BALANCE SHEET row 17",
    value: (row) => row.inventory,
  },
  {
    key: "inventory-growth",
    label: "Inventory Growth",
    source: "DCF working capital",
    formula: "Inventory t / inventory t-1 - 1",
    status: "calculated",
    workbookReference: "PROY BALANCE SHEET row 18",
    display: "percent",
    value: (row, index, context) => growthValue(row.inventory, previousInventory(index, context)),
  },
  projectionNotModeledLine("other-current-assets", "Others", "Other current assets belum menjadi driver DCF.", "PROY BALANCE SHEET row 19"),
  projectionNotModeledLine("other-current-assets-growth", "Others Growth", "Butuh input other current assets.", "PROY BALANCE SHEET row 20", "percent"),
  {
    key: "operating-current-assets",
    label: "Current Assets",
    source: "Subtotal operating current assets",
    formula: "AR + inventory; cash and other current assets require separate input",
    status: "review",
    workbookReference: "PROY BALANCE SHEET row 21",
    value: (row) => row.operatingCurrentAssets,
    kind: "subtotal",
    note: "Subtotal bersifat parsial karena kas dan other current assets belum diproyeksikan.",
  },
  sectionProjectionLine("non-current-assets-section", "Non Current Assets"),
  sectionProjectionLine("fixed-asset-section", "Fixed Asset"),
  {
    key: "fixed-assets-beginning",
    label: "Beginning",
    source: "PROY FIXED ASSETS / engine DCF",
    formula: "Prior year fixed assets net",
    status: "calculated",
    workbookReference: "PROY BALANCE SHEET row 25",
    value: (row) => row.fixedAssetsBeginning,
  },
  projectionNotModeledLine("accumulated-depreciations", "Accumulated Depreciations", "Gross acquisition and accumulated depreciation roll-forward need asset schedule detail.", "PROY BALANCE SHEET row 26"),
  projectionNotModeledLine("accumulated-depreciations-growth", "Accumulated Depreciations Growth", "Butuh accumulated depreciation per periode.", "PROY BALANCE SHEET row 27", "percent"),
  {
    key: "fixed-assets-net",
    label: "Fixed Assets, Net",
    source: "PROY FIXED ASSETS / engine DCF",
    formula: "Beginning net fixed assets + capex - depreciation",
    status: "calculated",
    workbookReference: "PROY BALANCE SHEET row 28",
    value: (row) => row.fixedAssetsEnding,
    kind: "subtotal",
  },
  projectionNotModeledLine("other-non-current-asset", "Other Non Current Asset", "Other non-current assets belum menjadi driver DCF.", "PROY BALANCE SHEET row 29"),
  projectionNotModeledLine("intangible-assets", "Intangible Assets", "Recognized intangible assets require separate input.", "PROY BALANCE SHEET row 30"),
  {
    key: "total-non-current-assets",
    label: "Total Non Current Asset",
    source: "Subtotal fixed asset net modeled",
    formula: "Fixed assets net + modeled non-current assets",
    status: "review",
    workbookReference: "PROY BALANCE SHEET row 31",
    value: (row) => row.fixedAssetsEnding,
    kind: "subtotal",
    note: "Subtotal bersifat parsial karena other non-current asset dan intangible belum diproyeksikan.",
  },
  {
    key: "total-assets",
    label: "ASSETS",
    source: "Subtotal modeled assets",
    formula: "Operating current assets + fixed assets net",
    status: "review",
    workbookReference: "PROY BALANCE SHEET row 33",
    value: (row) => row.operatingCurrentAssets + row.fixedAssetsEnding,
    kind: "subtotal",
    note: "Belum full balance sheet karena kas dan sebagian aset non-operasional perlu input.",
  },
  sectionProjectionLine("liabilities-equity-section", "LIABILITIES & EQUITY"),
  sectionProjectionLine("current-liabilities-section", "Current Liabilities"),
  projectionInputLine("bank-loan-short-term", "Bank Loan-Short Term", "Pinjaman baru/pelunasan belum diproyeksikan otomatis.", "PROY BALANCE SHEET row 37"),
  {
    key: "account-payable",
    label: "Account Payables",
    source: "PROY BALANCE SHEET / DCF working capital",
    formula: "COGS x AP days / 365",
    status: "calculated",
    workbookReference: "PROY BALANCE SHEET row 39",
    value: (row) => row.accountPayable,
  },
  projectionInputLine("tax-payable", "Tax Payable", "Timing utang pajak membutuhkan asumsi pembayaran pajak.", "PROY BALANCE SHEET row 41"),
  {
    key: "other-payable",
    label: "Others",
    source: "PROY BALANCE SHEET / DCF working capital",
    formula: "Operating expenses x other payable days / 365",
    status: "calculated",
    workbookReference: "PROY BALANCE SHEET row 43",
    value: (row) => row.otherPayable,
  },
  {
    key: "operating-current-liabilities",
    label: "Current Liabilities",
    source: "Subtotal operating current liabilities",
    formula: "AP + other payable",
    status: "review",
    workbookReference: "PROY BALANCE SHEET row 45",
    value: (row) => row.operatingCurrentLiabilities,
    kind: "subtotal",
    note: "Subtotal bersifat parsial karena loan dan tax payable membutuhkan input tambahan.",
  },
  sectionProjectionLine("non-current-liabilities-section", "Non Current Liabilities"),
  projectionInputLine("bank-loan-long-term", "Bank Loan-Long Term", "Pinjaman jangka panjang membutuhkan jadwal utang.", "PROY BALANCE SHEET row 48"),
  projectionNotModeledLine("other-non-current-liabilities", "Other Non Current Liabilites", "Other non-current liabilities belum menjadi driver DCF.", "PROY BALANCE SHEET row 50"),
  projectionInputLine("non-current-liabilities", "Non Current Liabilities", "Butuh jadwal liabilitas jangka panjang.", "PROY BALANCE SHEET row 52"),
  sectionProjectionLine("shareholders-equity-section", "Shareholders' Equity"),
  projectionInputLine("paid-up-capital", "Paid Up Capital", "Butuh asumsi setoran/modal dan aksi korporasi proyeksi.", "PROY BALANCE SHEET row 55"),
  sectionProjectionLine("retained-earnings-section", "Retained Earnings"),
  projectionInputLine("retained-surplus", "Surplus", "Butuh saldo laba awal dan kebijakan distribusi laba.", "PROY BALANCE SHEET row 57"),
  {
    key: "retained-current-profit",
    label: "Current Profit",
    source: "PROY LR / engine DCF",
    formula: "Projected NPAT / NOPLAT before distribution policy",
    status: "review",
    workbookReference: "PROY BALANCE SHEET row 58",
    value: (row) => row.noplat,
    note: "Belum menjadi retained earnings ending karena dividend/distribution policy belum dimodelkan.",
  },
  projectionInputLine("retained-earnings-ending", "Retained Earnings, Ending Balance", "Butuh saldo laba awal dan distribusi/dividen.", "PROY BALANCE SHEET row 59"),
  projectionInputLine("shareholders-equity", "Shareholders' Equity", "Butuh proyeksi modal dan retained earnings lengkap.", "PROY BALANCE SHEET row 60"),
  projectionInputLine("liabilities-equity", "LIABILITES & EQUITY", "Butuh proyeksi liabilitas dan ekuitas lengkap.", "PROY BALANCE SHEET row 62"),
  projectionInputLine("balance-control", "Balance Control", "Full projected balance sheet belum lengkap.", "PROY BALANCE SHEET row 63"),
];

function buildDcfFixedAssetProjectionRows(projection?: FixedAssetProjectionSummary): DcfProjectionLine[] {
  const classLabels = projection?.rows.length ? projection.rows.map((row) => row.assetName) : fixedAssetProjectionClassLabels;
  const source = (context: DcfProjectionContext) => context.fixedAssetProjection?.source ?? "Perlu input";
  const status = (context: DcfProjectionContext) => fixedAssetProjectionStatus(context.fixedAssetProjection);
  const note = (context: DcfProjectionContext) => context.fixedAssetProjection?.note;
  const valueFor =
    (assetIndex: number, key: keyof FixedAssetPeriodAmounts) =>
    (row: DcfForecastRow, _index: number, context: DcfProjectionContext) =>
      context.fixedAssetProjection?.rows[assetIndex]?.amounts[row.year]?.[key] ?? null;
  const totalValueFor =
    (key: keyof FixedAssetPeriodAmounts) =>
    (row: DcfForecastRow, _index: number, context: DcfProjectionContext) =>
      context.fixedAssetProjection?.totals[row.year]?.[key] ?? null;

  return [
  sectionProjectionLine("fixed-asset-schedules", "Fixed Asset Schedules"),
  sectionProjectionLine("acquisition-costs", "A. Acquisition Costs"),
  sectionProjectionLine("acquisition-beginning", "Beginning"),
  ...classLabels.map((label, index) => ({
    key: `acquisition-beginning-${index}`,
    label,
    source,
    formula: "Prior year acquisition ending by asset class",
    status,
    workbookReference: "PROY FIXED ASSETS rows 8-13",
    note,
    value: valueFor(index, "acquisitionBeginning"),
  })),
  {
    key: "acquisition-beginning-total",
    label: "Total",
    source,
    formula: "Sum acquisition beginning by asset class",
    status,
    workbookReference: "PROY FIXED ASSETS row 14",
    note,
    value: (row, _index, context) => context.fixedAssetProjection?.totals[row.year]?.acquisitionBeginning ?? null,
    kind: "subtotal",
  },
  sectionProjectionLine("acquisition-additions", "Additions"),
  ...classLabels.map((label, index) => ({
    key: `acquisition-additions-${index}`,
    label,
    source,
    formula: "DCF maintenance capex x historical depreciation allocation weight",
    status,
    workbookReference: "PROY FIXED ASSETS rows 17-22",
    note,
    value: valueFor(index, "acquisitionAdditions"),
  })),
  {
    key: "capital-expenditure",
    label: "Total",
    source,
    formula: "Sum acquisition additions by asset class",
    status,
    workbookReference: "PROY FIXED ASSETS row 23",
    note,
    value: totalValueFor("acquisitionAdditions"),
    kind: "subtotal",
  },
  sectionProjectionLine("acquisition-ending", "Ending"),
  ...classLabels.map((label, index) => ({
    key: `acquisition-ending-${index}`,
    label,
    source,
    formula: "Acquisition beginning + acquisition additions",
    status,
    workbookReference: "PROY FIXED ASSETS rows 26-31",
    note,
    value: valueFor(index, "acquisitionEnding"),
  })),
  {
    key: "acquisition-ending-total",
    label: "Total",
    source,
    formula: "Sum acquisition ending by asset class",
    status,
    workbookReference: "PROY FIXED ASSETS row 32",
    note,
    value: (row, _index, context) => context.fixedAssetProjection?.totals[row.year]?.acquisitionEnding ?? null,
    kind: "subtotal",
  },
  sectionProjectionLine("depreciation-section", "B. Depreciation"),
  sectionProjectionLine("depreciation-beginning", "Beginning"),
  ...classLabels.map((label, index) => ({
    key: `depreciation-beginning-${index}`,
    label,
    source,
    formula: "Prior year accumulated depreciation ending by asset class",
    status,
    workbookReference: "PROY FIXED ASSETS rows 36-41",
    note,
    value: valueFor(index, "depreciationBeginning"),
  })),
  {
    key: "depreciation-beginning-total",
    label: "Total",
    source,
    formula: "Sum depreciation beginning by asset class",
    status,
    workbookReference: "PROY FIXED ASSETS row 42",
    note,
    value: (row, _index, context) => context.fixedAssetProjection?.totals[row.year]?.depreciationBeginning ?? null,
    kind: "subtotal",
  },
  sectionProjectionLine("depreciation-additions", "Additions"),
  ...classLabels.map((label, index) => ({
    key: `depreciation-additions-${index}`,
    label,
    source,
    formula: "Projected depreciation x historical depreciation allocation weight",
    status,
    workbookReference: "PROY FIXED ASSETS rows 45-50",
    note,
    value: valueFor(index, "depreciationAdditions"),
  })),
  {
    key: "depreciation-additions-total",
    label: "Total",
    source,
    formula: "Sum depreciation additions by asset class",
    status,
    workbookReference: "PROY FIXED ASSETS row 51",
    note,
    value: totalValueFor("depreciationAdditions"),
    kind: "subtotal",
  },
  sectionProjectionLine("depreciation-ending", "Ending"),
  ...classLabels.map((label, index) => ({
    key: `depreciation-ending-${index}`,
    label,
    source,
    formula: "Depreciation beginning + depreciation additions",
    status,
    workbookReference: "PROY FIXED ASSETS rows 54-59",
    note,
    value: valueFor(index, "depreciationEnding"),
  })),
  {
    key: "depreciation-ending-total",
    label: "Total",
    source,
    formula: "Sum depreciation ending by asset class",
    status,
    workbookReference: "PROY FIXED ASSETS row 60",
    note,
    value: (row, _index, context) => context.fixedAssetProjection?.totals[row.year]?.depreciationEnding ?? null,
    kind: "subtotal",
  },
  sectionProjectionLine("net-value-fixed-assets", "Net Value Fixed Assets"),
  ...classLabels.map((label, index) => ({
    key: `net-value-${index}`,
    label,
    source,
    formula: "Acquisition ending - depreciation ending",
    status,
    workbookReference: "PROY FIXED ASSETS rows 63-68",
    note,
    value: valueFor(index, "netValue"),
  })),
  {
    key: "fixed-assets-ending",
    label: "Total",
    source,
    formula: "Sum net fixed assets by asset class",
    status,
    workbookReference: "PROY FIXED ASSETS row 69",
    note,
    value: totalValueFor("netValue"),
    kind: "subtotal",
  },
  ];
}

function fixedAssetProjectionStatus(projection?: FixedAssetProjectionSummary): DcfProjectionStatus {
  if (!projection?.hasProjection) {
    return "requiresInput";
  }

  return projection.diagnostics.some((diagnostic) => diagnostic.severity === "warning") ? "review" : "calculated";
}

function describeFixedAssetProjectionSummary(projection: FixedAssetProjectionSummary): string {
  const modeLabel = formatFixedAssetProjectionMode(projection.mode);
  const warningCount = projection.diagnostics.filter((diagnostic) => diagnostic.severity === "warning").length;

  if (projection.mode === "workbook-formula") {
    return warningCount > 0
      ? `${modeLabel} aktif mengikuti PROY FIXED ASSETS workbook UPDATE dan menjadi driver DCF; ada ${warningCount} warning model yang perlu direview.`
      : `${modeLabel} aktif mengikuti PROY FIXED ASSETS workbook UPDATE dan menjadi driver DCF.`;
  }

  return `${modeLabel} aktif sebagai baseline maintenance capex dan menjadi driver DCF.`;
}

function formatFixedAssetProjectionMode(mode: FixedAssetProjectionSummary["mode"]): string {
  return mode === "workbook-formula" ? "Formula KKP UPDATE" : "DCF proxy";
}

function buildDcfFixedAssetProjectionInput(
  projection: FixedAssetProjectionSummary,
): Record<number, DcfFixedAssetProjectionInput> | undefined {
  if (!projection.hasProjection) {
    return undefined;
  }

  return Object.fromEntries(
    Object.entries(projection.totals).map(([year, amounts]) => [
      Number(year),
      {
        depreciation: amounts.depreciationAdditions,
        capitalExpenditure: amounts.acquisitionAdditions,
        fixedAssetsEnding: amounts.netValue,
      },
    ]),
  );
}

const dcfCashFlowProjectionRows: DcfProjectionLine[] = [
  {
    key: "ebitda",
    label: "EBITDA",
    source: "PROY LR / engine DCF",
    formula: "EBIT + depreciation",
    status: "calculated",
    workbookReference: "PROY CASH FLOW STATEMENT row 5",
    value: (row) => row.ebit + row.depreciation,
  },
  {
    key: "corporate-tax",
    label: "Corporate Tax",
    source: "Asumsi statutory tax",
    formula: "EBIT x tax rate as cash tax deduction",
    status: "calculated",
    workbookReference: "PROY CASH FLOW STATEMENT row 6",
    value: (row) => -row.statutoryTaxOnEbit,
  },
  sectionProjectionLine("changes-working-capital", "Changes in Working Capital"),
  {
    key: "operating-current-assets-change",
    label: "Operating Current Assets (AR + Inventory)",
    source: "PROY BALANCE SHEET",
    formula: "-((AR + inventory) t - (AR + inventory) t-1)",
    status: "calculated",
    workbookReference: "PROY CASH FLOW STATEMENT row 8",
    value: (_row, index, context) => operatingCurrentAssetsCashEffect(index, context),
  },
  {
    key: "operating-current-liabilities-change",
    label: "Operating Current Liabilities (AP + Other Payable)",
    source: "PROY BALANCE SHEET",
    formula: "(AP + other payable) t - (AP + other payable) t-1",
    status: "calculated",
    workbookReference: "PROY CASH FLOW STATEMENT row 9",
    value: (_row, index, context) => operatingCurrentLiabilitiesCashEffect(index, context),
  },
  {
    key: "working-capital",
    label: "Working Capital",
    source: "DCF, Changes Working Capital",
    formula: "Operating current assets cash effect + operating current liabilities cash effect",
    status: "calculated",
    workbookReference: "PROY CASH FLOW STATEMENT row 10",
    value: (row) => -row.changeInNwc,
    kind: "subtotal",
  },
  {
    key: "cash-flow-from-operations",
    label: "Cash Flow from Operations",
    source: "PROY CASH FLOW STATEMENT / engine DCF",
    formula: "EBITDA - statutory tax + changes in working capital",
    status: "calculated",
    workbookReference: "PROY CASH FLOW STATEMENT row 11",
    value: (row) => row.grossCashFlow - row.changeInNwc,
    kind: "subtotal",
  },
  projectionNotModeledLine("cash-flow-from-non-operations", "Cash Flow from Non Operations", "Non-operating cash flow belum diproyeksikan dalam FCFF operasi.", "PROY CASH FLOW STATEMENT row 13"),
  {
    key: "capital-expenditure",
    label: "Cash Flow from Investment (Capital Expenditure)",
    source: "PROY FIXED ASSETS / engine DCF",
    formula: "-capital expenditure",
    status: "calculated",
    workbookReference: "PROY CASH FLOW STATEMENT row 17",
    value: (row) => -row.capitalExpenditure,
  },
  {
    key: "cash-flow-before-financing",
    label: "Cash Flow before Financing",
    source: "FCFF bridge",
    formula: "Cash flow from operations + non-operating cash flow - capex",
    status: "review",
    workbookReference: "PROY CASH FLOW STATEMENT row 19",
    value: (row) => row.freeCashFlow,
    kind: "subtotal",
    note: "Sama dengan FCFF karena non-operating cash flow belum diproyeksikan.",
  },
  sectionProjectionLine("financing-section", "Financing"),
  projectionInputLine("equity-injection", "Equity Injection", "Butuh asumsi setoran modal proyeksi.", "PROY CASH FLOW STATEMENT row 22"),
  projectionInputLine("new-loan", "New Loan", "Butuh jadwal utang baru.", "PROY CASH FLOW STATEMENT row 23"),
  projectionNotModeledLine("interest-expense", "Interest Expense", "Financing cash flow tidak dipakai dalam FCFF operasi.", "PROY CASH FLOW STATEMENT row 24"),
  projectionNotModeledLine("interest-income", "Interest Income", "Financing/non-operating cash flow tidak dipakai dalam FCFF operasi.", "PROY CASH FLOW STATEMENT row 25"),
  projectionInputLine("principal-repayment", "Principal Repayment", "Butuh jadwal pelunasan pokok pinjaman.", "PROY CASH FLOW STATEMENT row 26"),
  projectionInputLine("cash-flow-from-financing", "Cash Flow from Financing", "Butuh seluruh jadwal pendanaan.", "PROY CASH FLOW STATEMENT row 28"),
  projectionInputLine("net-cash-flow", "Net Cash Flow", "Butuh proyeksi financing dan cash roll-forward lengkap.", "PROY CASH FLOW STATEMENT row 30"),
  projectionInputLine("cash-beginning-balance", "Cash-Beginning Balance", "Butuh saldo kas awal proyeksi.", "PROY CASH FLOW STATEMENT row 32"),
  projectionInputLine("cash-ending-balance", "Cash-Ending Balance", "Butuh cash roll-forward penuh.", "PROY CASH FLOW STATEMENT row 33"),
  projectionInputLine("cash-ending-in-bank", "Cash Ending in Bank", "Butuh alokasi kas akhir ke bank/deposito.", "PROY CASH FLOW STATEMENT row 35"),
  projectionInputLine("cash-ending-in-cash-on-hand", "Cash Ending in Cash on Hand", "Butuh alokasi kas akhir ke kas di tangan.", "PROY CASH FLOW STATEMENT row 36"),
];

const dcfProjectionConfigs: Record<ProjectionStatementKind, DcfProjectionConfig> = {
  income: {
    eyebrow: "PROY LR",
    title: "Proyeksi Laba Rugi",
    badge: "Revenue, margin, EBIT",
    summary: "Struktur mengikuti sheet PROY LR; angka dihitung ulang dari driver revenue, margin historis, dan tarif pajak aktif.",
    rows: dcfIncomeProjectionRows,
    testId: "dcf-income-projection-table",
  },
  balance: {
    eyebrow: "PROY BALANCE SHEET",
    title: "Proyeksi Neraca",
    badge: "Operating WC + partial BS",
    summary: "Struktur mengikuti sheet PROY BALANCE SHEET; baris tanpa driver sistem ditahan sebagai kebutuhan input, bukan diisi angka asumtif.",
    rows: dcfBalanceProjectionRows,
    testId: "dcf-balance-projection-table",
  },
  fixedAssets: {
    eyebrow: "PROY FIXED ASSETS",
    title: "Proyeksi Aset Tetap",
    badge: "Capex, depreciation, NBV",
    summary: "Struktur mengikuti sheet PROY FIXED ASSETS; beginning, additions, ending, depreciation, dan nilai buku neto dihitung dengan roll-forward per kelas aset.",
    rows: [],
    testId: "dcf-fixed-asset-projection-table",
  },
  cashFlow: {
    eyebrow: "PROY CASH FLOW STATEMENT",
    title: "Proyeksi Cash Flow Statement",
    badge: "CFO, WC, capex",
    summary: "Struktur mengikuti sheet PROY CASH FLOW STATEMENT; cash flow before financing terhubung ke FCFF, sedangkan financing dan cash roll-forward penuh menunggu input.",
    rows: dcfCashFlowProjectionRows,
    testId: "dcf-cash-flow-projection-table",
  },
};

function ProjectionStatementSection({
  kind,
  forecast,
  snapshot,
  fixedAssetProjection,
  fixedAssetProjectionMode = defaultFixedAssetProjectionMode,
  onFixedAssetProjectionModeChange,
}: {
  kind: ProjectionStatementKind;
  forecast: DcfForecastRow[];
  snapshot: FinancialStatementSnapshot;
  fixedAssetProjection?: FixedAssetProjectionSummary;
  fixedAssetProjectionMode?: FixedAssetProjectionMode;
  onFixedAssetProjectionModeChange?: (mode: FixedAssetProjectionMode) => void;
}) {
  const config =
    kind === "fixedAssets"
      ? {
          ...dcfProjectionConfigs.fixedAssets,
          summary: fixedAssetProjection?.hasProjection
            ? describeFixedAssetProjectionSummary(fixedAssetProjection)
            : "Struktur mengikuti sheet PROY FIXED ASSETS; detail per kelas aset membutuhkan jadwal historis agar angka proyeksi dapat dihitung.",
          rows: buildDcfFixedAssetProjectionRows(fixedAssetProjection),
        }
      : dcfProjectionConfigs[kind];
  const firstForecast = forecast[0] ?? null;
  const finalForecast = forecast.at(-1) ?? null;
  const horizonLabel = firstForecast && finalForecast ? `${firstForecast.year}-${finalForecast.year}` : "Perlu data";

  return (
    <>
      <section id={`${kind}-projection-summary`} className="section-grid">
        <article className="metric-card">
          <div className="card-title">
            <TableProperties size={20} />
            <span>{config.eyebrow}</span>
          </div>
          <strong>{config.title}</strong>
          <p>{config.summary}</p>
        </article>
        <article className="metric-card">
          <div className="card-title">
            <CalendarDays size={20} />
            <span>Horizon</span>
          </div>
          <strong>{horizonLabel}</strong>
          <p>Proyeksi lima tahun dimulai setelah tanggal penilaian aktif.</p>
        </article>
        <article className="metric-card">
          <div className="card-title">
            <FileSearch size={20} />
            <span>Status audit</span>
          </div>
          <strong>Formula-driven</strong>
          <p>Formula tersedia di detail audit; tabel utama hanya menampilkan sumber, status, dan angka.</p>
        </article>
      </section>

      {kind === "fixedAssets" ? (
        <>
          <FixedAssetProjectionModeSelector
            mode={fixedAssetProjectionMode}
            onChange={onFixedAssetProjectionModeChange}
            disabled={!fixedAssetProjection?.hasProjection}
          />
          <FixedAssetProjectionDriverStrip forecast={forecast} fixedAssetProjection={fixedAssetProjection} />
        </>
      ) : (
        <section className="active-driver-strip" aria-label={`Driver aktif ${config.title}`}>
          <div>
            <span>Revenue growth</span>
            <strong>{formatPercent(snapshot.revenueGrowth)}</strong>
            <small>Driver pertumbuhan pendapatan aktif</small>
          </div>
          <div>
            <span>Tax rate</span>
            <strong>{formatPercent(snapshot.taxRate)}</strong>
            <small>Statutory tax untuk NOPLAT</small>
          </div>
          <div>
            <span>WACC</span>
            <strong>{formatPercent(snapshot.wacc)}</strong>
            <small>Discount factor dan nilai terminal</small>
          </div>
          <div>
            <span>Terminal growth</span>
            <strong>{formatPercent(snapshot.terminalGrowth)}</strong>
            <small>Dipakai di nilai terminal DCF</small>
          </div>
        </section>
      )}

      <DcfProjectionPanel config={config} forecast={forecast} snapshot={snapshot} fixedAssetProjection={fixedAssetProjection} />
    </>
  );
}

function FixedAssetProjectionModeSelector({
  mode,
  onChange,
  disabled = false,
}: {
  mode: FixedAssetProjectionMode;
  onChange?: (mode: FixedAssetProjectionMode) => void;
  disabled?: boolean;
}) {
  const options: Array<{ mode: FixedAssetProjectionMode; label: string; description: string }> = [
    {
      mode: "workbook-formula",
      label: "Formula KKP UPDATE",
      description: "Additions dan depresiasi mengikuti roll-forward historis PROY FIXED ASSETS.",
    },
    {
      mode: "dcf-proxy",
      label: "DCF proxy",
      description: "Capex mengikuti maintenance capex DCF dan depresiasi berbasis margin revenue.",
    },
  ];

  return (
    <section className="projection-mode-panel" aria-label="Sistematika Proyeksi Aset Tetap">
      <div>
        <p className="eyebrow">Sistematika aktif</p>
        <strong>{formatFixedAssetProjectionMode(mode)}</strong>
      </div>
      <div className="projection-mode-toggle" role="radiogroup" aria-label="Pilih sistematika Proyeksi Aset Tetap">
        {options.map((option) => (
          <button
            aria-checked={mode === option.mode}
            className={mode === option.mode ? "selected" : ""}
            disabled={disabled}
            key={option.mode}
            onClick={() => onChange?.(option.mode)}
            role="radio"
            type="button"
          >
            <span>{option.label}</span>
            <small>{option.description}</small>
          </button>
        ))}
      </div>
    </section>
  );
}

function FixedAssetProjectionDriverStrip({
  forecast,
  fixedAssetProjection,
}: {
  forecast: DcfForecastRow[];
  fixedAssetProjection?: FixedAssetProjectionSummary;
}) {
  const firstForecastYear = forecast[0]?.year;
  const warningCount = fixedAssetProjection?.diagnostics.filter((diagnostic) => diagnostic.severity === "warning").length ?? 0;

  return (
    <section className="active-driver-strip" aria-label="Driver aktif Proyeksi Aset Tetap">
      <div>
        <span>Mode aktif</span>
        <strong>{fixedAssetProjection ? formatFixedAssetProjectionMode(fixedAssetProjection.mode) : "Perlu input"}</strong>
        <small>{fixedAssetProjection?.source ?? "Butuh jadwal aset tetap historis"}</small>
      </div>
      <div>
        <span>Dampak ke DCF</span>
        <strong>{fixedAssetProjection?.hasProjection ? "Aktif" : "Belum aktif"}</strong>
        <small>Mode terpilih menjadi driver depresiasi, capex, fixed assets ending, dan FCFF.</small>
      </div>
      <div>
        <span>Capex awal</span>
        <strong>{firstForecastYear && fixedAssetProjection?.totals[firstForecastYear] ? formatIdr(fixedAssetProjection.totals[firstForecastYear].acquisitionAdditions) : "—"}</strong>
        <small>Capital expenditure tahun proyeksi pertama yang masuk DCF.</small>
      </div>
      <div>
        <span>Review flags</span>
        <strong>{warningCount}</strong>
        <small>{warningCount > 0 ? "Ada risiko model yang perlu direview." : "Tidak ada warning material."}</small>
      </div>
    </section>
  );
}

function DcfProjectionPanel({
  config,
  forecast,
  snapshot,
  fixedAssetProjection,
}: {
  config: DcfProjectionConfig;
  forecast: DcfForecastRow[];
  snapshot: FinancialStatementSnapshot;
  fixedAssetProjection?: FixedAssetProjectionSummary;
}) {
  const context = { forecast, snapshot, fixedAssetProjection };
  const traceRows = config.rows.filter((line) => line.kind !== "section");

  return (
    <article className="panel dcf-projection-panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">{config.eyebrow}</p>
          <h3>{config.title}</h3>
        </div>
        <span className="status-pill muted">{config.badge}</span>
      </div>
      {config.testId === "dcf-fixed-asset-projection-table" && fixedAssetProjection?.diagnostics.length ? (
        <div className="projection-diagnostics" role="status">
          {fixedAssetProjection.diagnostics.map((diagnostic) => (
            <span className={diagnostic.severity === "warning" ? "status-pill warning" : "status-pill muted"} key={diagnostic.code}>
              {diagnostic.message}
            </span>
          ))}
        </div>
      ) : null}
      <div className="table-wrap">
        <table className="analysis-table dcf-projection-table" data-testid={config.testId}>
          <thead>
            <tr>
              <th>Pos</th>
              <th>Sumber</th>
              <th>Status</th>
              {forecast.map((row) => (
                <th className="period-column" key={row.year}>
                  {row.year}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {config.rows.map((line) => {
              if (line.kind === "section") {
                return (
                  <tr className="analysis-section-row" key={line.key}>
                    <td colSpan={forecast.length + 3}>{line.label}</td>
                  </tr>
                );
              }

              const lineSource = resolveProjectionLineSource(line, context);
              const lineStatus = resolveProjectionLineStatus(line, context);
              const lineNote = resolveProjectionLineNote(line, context);

              return (
                <tr className={line.kind === "subtotal" ? "analysis-total-row" : ""} key={line.key}>
                  <td>
                    <strong>{line.label}</strong>
                    {lineNote ? <span>{lineNote}</span> : null}
                  </td>
                  <td>{lineSource}</td>
                  <td>
                    <ProjectionStatusBadge status={lineStatus} />
                  </td>
                  {forecast.map((row, index) => (
                    <td className="numeric-cell period-column" key={`${line.key}-${row.year}`}>
                      {formatProjectionValue(readProjectionValue(line, row, index, context), line.display)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <details className="audit-disclosure compact projection-trace-disclosure">
        <summary>Detail formula dan referensi audit</summary>
        <div className="table-wrap projection-trace-wrap">
          <table className="analysis-table projection-trace-table" data-testid={`${config.testId}-trace`}>
            <thead>
              <tr>
                <th>Pos</th>
                <th>Referensi</th>
                <th>Formula</th>
                <th>Catatan</th>
              </tr>
            </thead>
            <tbody>
              {traceRows.map((line) => (
                <tr key={`${line.key}-trace`}>
                  <td>{line.label}</td>
                  <td>{line.workbookReference ?? config.eyebrow}</td>
                  <td>
                    <code>{line.formula}</code>
                  </td>
                  <td>{resolveProjectionLineNote(line, context) ?? projectionStatusLabels[resolveProjectionLineStatus(line, context)]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </article>
  );
}

function resolveProjectionLineSource(line: DcfProjectionLine, context: DcfProjectionContext): string {
  return typeof line.source === "function" ? line.source(context) : line.source;
}

function resolveProjectionLineStatus(line: DcfProjectionLine, context: DcfProjectionContext): DcfProjectionStatus {
  if (!line.status) {
    return "calculated";
  }

  return typeof line.status === "function" ? line.status(context) : line.status;
}

function resolveProjectionLineNote(line: DcfProjectionLine, context: DcfProjectionContext): string | undefined {
  return typeof line.note === "function" ? line.note(context) : line.note;
}

function ProjectionStatusBadge({ status }: { status: DcfProjectionStatus }) {
  return <span className={`status-pill ${projectionStatusClassNames[status]}`}>{projectionStatusLabels[status]}</span>;
}

function readProjectionValue(
  line: DcfProjectionLine,
  row: DcfForecastRow,
  index: number,
  context: DcfProjectionContext,
): number | null {
  if (!line.value) {
    return null;
  }

  const value = line.value(row, index, context);

  return Number.isFinite(value) ? value : null;
}

function formatProjectionValue(value: number | null, display: DcfProjectionDisplay = "currency"): string {
  if (value === null || !Number.isFinite(value)) {
    return "—";
  }

  if (display === "percent") {
    return formatPercent(value);
  }

  if (display === "multiple") {
    return `${value.toFixed(2)}x`;
  }

  return formatIdr(value);
}

function sectionProjectionLine(key: string, label: string): DcfProjectionLine {
  return {
    key,
    label,
    source: "",
    formula: "",
    status: "calculated",
    kind: "section",
  };
}

function projectionInputLine(
  key: string,
  label: string,
  note: string,
  workbookReference: string,
  display?: DcfProjectionDisplay,
): DcfProjectionLine {
  return {
    key,
    label,
    source: "Perlu input",
    formula: "Requires explicit projection input before a reliable value can be shown",
    status: "requiresInput",
    workbookReference,
    display,
    note,
  };
}

function projectionNotModeledLine(
  key: string,
  label: string,
  note: string,
  workbookReference: string,
  display?: DcfProjectionDisplay,
): DcfProjectionLine {
  return {
    key,
    label,
    source: "Belum dimodelkan",
    formula: "No current system driver; keep blank until modeled or entered",
    status: "notModeled",
    workbookReference,
    display,
    note,
  };
}

function previousRevenue(index: number, context: DcfProjectionContext): number {
  return index === 0 ? context.snapshot.revenue : context.forecast[index - 1]?.revenue ?? 0;
}

function previousDepreciation(index: number, context: DcfProjectionContext): number {
  return index === 0 ? context.snapshot.depreciation : context.forecast[index - 1]?.depreciation ?? 0;
}

function previousAccountReceivable(index: number, context: DcfProjectionContext): number {
  return index === 0 ? context.snapshot.accountReceivable : context.forecast[index - 1]?.accountReceivable ?? 0;
}

function previousInventory(index: number, context: DcfProjectionContext): number {
  return index === 0 ? context.snapshot.inventory : context.forecast[index - 1]?.inventory ?? 0;
}

function previousOperatingCurrentAssets(index: number, context: DcfProjectionContext): number {
  return index === 0
    ? context.snapshot.accountReceivable + context.snapshot.inventory
    : context.forecast[index - 1]?.operatingCurrentAssets ?? 0;
}

function previousOperatingCurrentLiabilities(index: number, context: DcfProjectionContext): number {
  return index === 0
    ? context.snapshot.accountPayable + context.snapshot.otherPayable
    : context.forecast[index - 1]?.operatingCurrentLiabilities ?? 0;
}

function growthValue(current: number, previous: number): number | null {
  if (!Number.isFinite(current) || !Number.isFinite(previous) || previous === 0) {
    return null;
  }

  return current / previous - 1;
}

function divideOrNull(numerator: number, denominator: number): number | null {
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator) || denominator === 0) {
    return null;
  }

  return numerator / denominator;
}

function operatingCurrentAssetsCashEffect(index: number, context: DcfProjectionContext): number {
  const current = context.forecast[index]?.operatingCurrentAssets ?? 0;
  const previous = previousOperatingCurrentAssets(index, context);

  return -(current - previous);
}

function operatingCurrentLiabilitiesCashEffect(index: number, context: DcfProjectionContext): number {
  const current = context.forecast[index]?.operatingCurrentLiabilities ?? 0;
  const previous = previousOperatingCurrentLiabilities(index, context);

  return current - previous;
}

const cashFlowStatementSectionLabels: Record<CashFlowStatementRow["section"], string> = {
  operating: "Arus kas operasi",
  working_capital: "Perubahan modal kerja operasional",
  investing: "Non-operasi dan investasi",
  financing: "Pendanaan",
  cash_reconciliation: "Rekonsiliasi kas",
};

function CashFlowStatementSection({
  analysis,
  readiness,
  onNavigate,
  onUpdateOverride,
}: {
  analysis: SectionAnalysis;
  readiness: SectionReadiness;
  onNavigate: (tabId: WorkflowTabId) => void;
  onUpdateOverride: (rowKey: string, periodId: string, patch: Partial<CashFlowOverrideEntry>) => void;
}) {
  const latest = getLatestPeriodAnalysis(analysis);
  const latestPeriodId = latest?.period.id ?? "";
  const netCashFlow = analysis.cashFlowStatementRows.find((row) => row.key === "net-cash-flow")?.values[latestPeriodId] ?? null;
  const cashGap = analysis.cashFlowStatementRows.find((row) => row.key === "cash-rollforward-gap")?.values[latestPeriodId] ?? null;
  const overrideCount = analysis.cashFlowStatementRows.reduce(
    (count, row) => count + Object.values(row.overrideStatuses).filter((status) => status === "applied").length,
    0,
  );
  const reviewableRowCount = analysis.cashFlowStatementRows.filter((row) => row.isOverridable).length;

  return (
    <>
      <ReadinessPanel status={readiness} onNavigate={onNavigate} />

      <section className="split-panel cash-flow-review-grid">
        <article className="panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">CASH FLOW STATEMENT</p>
              <h3>Review arus kas historis</h3>
            </div>
            <span className="status-pill muted">Derived + controlled override</span>
          </div>
          <EngineAuditReference
            sourceLabel="Workbook reference + mesin kasus aktif"
            summary="Struktur mengikuti sheet CASH FLOW STATEMENT, tetapi angka dihitung ulang dari Neraca, Laba Rugi, Aset Tetap, dan asumsi aktif."
            metrics={[
              { label: "Net cash flow", value: netCashFlow },
              { label: "Cash roll-forward gap", value: cashGap },
              { label: "Override diterapkan", value: overrideCount, display: "number" },
              { label: "Baris reviewable", value: reviewableRowCount, display: "number" },
            ]}
            notes={[
              "Override numerik langsung memengaruhi final value saat nilai override diisi.",
              "Subtotal memakai final value agar pengguna dapat melihat dampak override ke rekonsiliasi.",
              "Formula dan sumber bisnis ditampilkan di setiap baris agar angka tidak muncul tanpa konteks.",
            ]}
          />
        </article>

        <article className="panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Interoperabilitas</p>
              <h3>Koneksi EEM/DCF</h3>
            </div>
            <span className="status-pill muted">BS · IS · FA · assumptions</span>
          </div>
          <EngineAuditReference
            sourceLabel="Mesin valuasi"
            summary="Cash-flow statement historis menjadi jembatan review untuk kualitas input EEM/DCF, bukan default production fixture."
            metrics={[
              { label: "CFO historis", value: latest?.cashFlowFromOperations ?? null },
              { label: "FCFF historis", value: latest?.freeCashFlow ?? null },
              { label: "Operating WC", value: latest?.operatingWorkingCapital ?? null },
              { label: "Capex", value: latest ? -latest.capitalExpenditure : null },
            ]}
            notes={[
              "EEM tetap memakai NTA, NOPLAT, required return, aset non-operasional, dan debt sesuai engine.",
              "DCF tetap memakai FCFF formula-driven dan driver proyeksi; tab ini membantu audit angka historis.",
              "Cash beginning periode awal dapat di-seed manual bila workbook/source memiliki opening cash sebelum periode pertama.",
            ]}
          />
        </article>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Detail statement</p>
            <h3>Calculated · override · final · trace</h3>
          </div>
          <span className="status-pill muted">Audit-ready table</span>
        </div>
        <CashFlowStatementTable rows={analysis.cashFlowStatementRows} periods={analysis.periods} onUpdateOverride={onUpdateOverride} />
      </section>
    </>
  );
}

function CashFlowStatementTable({
  rows,
  periods,
  onUpdateOverride,
}: {
  rows: CashFlowStatementRow[];
  periods: Period[];
  onUpdateOverride: (rowKey: string, periodId: string, patch: Partial<CashFlowOverrideEntry>) => void;
}) {
  return (
    <div className="table-wrap cash-flow-statement-wrap">
      <table className="analysis-table cash-flow-statement-table">
        <colgroup>
          <col className="cash-flow-pos-col" />
          <col className="cash-flow-trace-col" />
          <col className="cash-flow-status-col" />
          {periods.flatMap((period) => [
            <col className="cash-flow-period-col" key={`${period.id}-calculated-col`} />,
            <col className="cash-flow-period-col" key={`${period.id}-override-col`} />,
            <col className="cash-flow-period-col" key={`${period.id}-final-col`} />,
          ])}
        </colgroup>
        <thead>
          <tr>
            <th rowSpan={2}>Pos</th>
            <th rowSpan={2}>Trace</th>
            <th rowSpan={2}>Status</th>
            {periods.map((period) => (
              <th className="period-column" colSpan={3} key={period.id}>
                {period.label || "Periode"}
              </th>
            ))}
          </tr>
          <tr>
            {periods.flatMap((period) => [
              <th className="period-column" key={`${period.id}-calculated`}>
                Calculated
              </th>,
              <th className="period-column" key={`${period.id}-override`}>
                Override
              </th>,
              <th className="period-column" key={`${period.id}-final`}>
                Final
              </th>,
            ])}
          </tr>
        </thead>
        <tbody>
          {rows.flatMap((row, index) => {
            const sectionChanged = index === 0 || rows[index - 1]?.section !== row.section;
            const rowClassName =
              row.kind === "subtotal" ? "analysis-total-row" : row.kind === "warning" ? "analysis-warning-row" : "";
            const rowCells = (
              <tr className={rowClassName} key={row.key}>
                <td>
                  <strong>{row.label}</strong>
                  {row.note ? <span>{row.note}</span> : null}
                </td>
                <td>
                  <span>{row.source}</span>
                  <code>{row.formula}</code>
                </td>
                <td>
                  <CashFlowReliabilityBadge row={row} />
                </td>
                {periods.flatMap((period) => {
                  const status = row.overrideStatuses[period.id] ?? "none";
                  const validationMessage = row.validationMessages[period.id] ?? "";
                  const statusLabel = cashFlowOverrideStatusLabel(status);

                  return [
                    <td className="numeric-cell period-column" key={`${row.key}-${period.id}-calculated`}>
                      {formatAnalysisValue(row.calculatedValues[period.id] ?? null, "currency")}
                    </td>,
                    <td className="override-cell period-column" key={`${row.key}-${period.id}-override`}>
                      {row.isOverridable ? (
                        <div className="cash-flow-override-stack">
                          <input
                            aria-label={`Override ${row.label} ${period.label || "Periode"}`}
                            inputMode="decimal"
                            placeholder="Nilai"
                            value={row.overrideInputs[period.id] ?? ""}
                            onChange={(event) => onUpdateOverride(row.key, period.id, { value: event.target.value })}
                          />
                          {statusLabel ? <span className={`override-status ${status}`}>{statusLabel}</span> : null}
                          {validationMessage ? <small className="warning-text">{validationMessage}</small> : null}
                        </div>
                      ) : (
                        <span className="status-pill muted">Formula locked</span>
                      )}
                    </td>,
                    <td className="numeric-cell period-column" key={`${row.key}-${period.id}-final`}>
                      <strong>{formatAnalysisValue(row.values[period.id] ?? null, "currency")}</strong>
                    </td>,
                  ];
                })}
              </tr>
            );

            return sectionChanged
              ? [
                  <tr className="analysis-section-row" key={`${row.section}-section`}>
                    <td colSpan={periods.length * 3 + 3}>{cashFlowStatementSectionLabels[row.section]}</td>
                  </tr>,
                  rowCells,
                ]
              : [rowCells];
          })}
        </tbody>
      </table>
    </div>
  );
}

function CashFlowReliabilityBadge({ row }: { row: CashFlowStatementRow }) {
  const label =
    row.reliability === "derived"
      ? "Derived"
      : row.reliability === "review"
        ? "Reviewable"
        : "Reconciliation";
  const className =
    row.reliability === "derived"
      ? "status-pill ok"
      : row.reliability === "review"
        ? "status-pill warning"
        : "status-pill muted";

  return (
    <span className={className}>
      {label}
      {row.isOverridable ? " · override" : ""}
    </span>
  );
}

function cashFlowOverrideStatusLabel(status: CashFlowOverrideStatus): string {
  if (status === "applied") {
    return "Override diterapkan";
  }

  if (status === "not_allowed") {
    return "Formula locked";
  }

  return "";
}

function PayablesCashFlowSection({ analysis }: { analysis: SectionAnalysis }) {
  const latest = getLatestPeriodAnalysis(analysis);
  const equityMovement =
    latest?.previousSnapshot
      ? latest.snapshot.paidUpCapital +
        latest.snapshot.additionalPaidInCapital -
        (latest.previousSnapshot.paidUpCapital + latest.previousSnapshot.additionalPaidInCapital)
      : null;

  return (
    <>
      <section className="split-panel">
        <article className="panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">ACC PAYABLES</p>
              <h3>Jadwal mutasi pinjaman dan utang</h3>
            </div>
            <span className="status-pill muted">Basis mutasi terkoreksi</span>
          </div>
          <AnalysisTable rows={analysis.payablesRows} periods={analysis.periods} />
        </article>

        <article className="panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Referensi audit sistem</p>
              <h3>Pemeriksaan mutasi arus kas</h3>
            </div>
          </div>
          <EngineAuditReference
            sourceLabel="Mesin kasus aktif"
            summary="Nilai referensi dihitung ulang dari periode aktif, bukan disalin dari prototype workbook."
            metrics={[
              { label: "Mutasi setoran ekuitas", value: equityMovement },
              { label: "Selisih roll-forward kas", value: latest?.cashFlowRollforwardGap ?? null },
              {
                label: "Utang berbunga",
                value: latest ? latest.loanMovement.shortTermEnding + latest.loanMovement.longTermEnding : null,
              },
            ]}
            notes={[
              "Pendanaan memakai mutasi modal disetor dan tambahan modal antarperiode.",
              "Selisih kas membandingkan arus kas bersih terkoreksi dengan mutasi kas di tangan plus bank.",
              "Utang bersumber dari pinjaman bank dan line utang berbunga yang sudah dipetakan.",
            ]}
          />
        </article>
      </section>

      <section className="panel">
        <div className="panel-heading">
            <div>
              <p className="eyebrow">CASH FLOW STATEMENT</p>
              <h3>Bridge arus kas terkoreksi</h3>
            </div>
          <span className="status-pill muted">Movement antar periode</span>
        </div>
        <AnalysisTable rows={analysis.cashFlowRows} periods={analysis.periods} />
      </section>
    </>
  );
}

function NoplatFcfSection({ analysis }: { analysis: SectionAnalysis }) {
  const latest = getLatestPeriodAnalysis(analysis);

  return (
    <>
      <section className="split-panel">
        <article className="panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">NOPLAT</p>
              <h3>Normalized Operating Profit After Tax (NOPLAT)</h3>
            </div>
            <span className="status-pill muted">Basis statutory komersial</span>
          </div>
          <AnalysisTable rows={analysis.noplatRows} periods={analysis.periods} />
        </article>

        <article className="panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Referensi audit sistem</p>
              <h3>Bridge NOPLAT</h3>
            </div>
          </div>
          <EngineAuditReference
            sourceLabel="Mesin kasus aktif"
            summary="Laba operasi dinormalisasi dari line laba rugi yang sudah dipetakan dan asumsi pajak aktif."
            metrics={[
              { label: "NPAT komersial", value: latest?.snapshot.commercialNpat ?? null },
              { label: "NOPLAT ternormalisasi", value: latest?.normalizedNoplat ?? null },
              { label: "Free Cash Flow (FCF)", value: latest?.freeCashFlow ?? null },
            ]}
            notes={[
              "Bunga dan item non-operasional dikeluarkan dari NOPLAT.",
              "Pajak memakai tarif statutory aktif atau asumsi tarif pajak yang telah ditinjau.",
              "FCFF memakai NOPLAT, add-back penyusutan, mutasi working capital, dan capex.",
            ]}
          />
        </article>
      </section>

      <section className="panel">
        <div className="panel-heading">
            <div>
              <p className="eyebrow">FCF</p>
              <h3>Free Cash Flow to Firm (FCFF)</h3>
          </div>
          <span className="status-pill muted">NOPLAT + penyusutan + WC - capex</span>
        </div>
        <AnalysisTable rows={analysis.fcfRows} periods={analysis.periods} />
      </section>
    </>
  );
}

function RatiosCapitalSection({
  analysis,
  readiness,
  onNavigate,
}: {
  analysis: SectionAnalysis;
  readiness: SectionReadiness;
  onNavigate: (tabId: WorkflowTabId) => void;
}) {
  const latest = getLatestPeriodAnalysis(analysis);

  return (
    <>
      <ReadinessPanel status={readiness} onNavigate={onNavigate} />

      <section className="panel">
        <div className="panel-heading">
            <div>
              <p className="eyebrow">FINANCIAL RATIO</p>
              <h3>Profitabilitas · likuiditas · leverage · arus kas</h3>
          </div>
          <span className="status-pill muted">Rata-rata mengikuti periode tersedia</span>
        </div>
        <RatioTable rows={analysis.ratioRows} periods={analysis.periods} />
      </section>

      <section className="split-panel">
        <article className="panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">ROIC</p>
              <h3>Bridge efisiensi modal</h3>
            </div>
            <span className="status-pill muted">Basis NOPLAT terkoreksi</span>
          </div>
          <AnalysisTable rows={analysis.roicRows} periods={analysis.periods} percentRowKeys={new Set(["roic"])} />
        </article>

        <article className="panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Referensi audit sistem</p>
              <h3>Basis kapital ROIC</h3>
            </div>
          </div>
          <EngineAuditReference
            sourceLabel="Mesin kasus aktif"
            summary="Referensi efisiensi modal dihitung ulang dari klasifikasi kasus aktif."
            metrics={[
              { label: "Operating NWC", value: latest?.operatingWorkingCapital ?? null },
              { label: "Invested capital akhir", value: latest?.investedCapitalEnd ?? null },
              { label: "ROIC", value: latest?.roic ?? null, display: "percent" },
            ]}
            notes={[
              "Operating NWC memakai piutang usaha plus persediaan dikurangi utang usaha dan utang lain-lain.",
              "Invested capital menggabungkan aset tetap neto dan operating working capital.",
              "ROIC memakai invested capital awal saat periode pembanding tersedia.",
            ]}
          />
        </article>
      </section>
    </>
  );
}

function AnalysisTable({
  rows,
  periods,
  percentRowKeys = new Set<string>(),
}: {
  rows: AnalysisRow[];
  periods: Period[];
  percentRowKeys?: Set<string>;
}) {
  return (
    <div className="table-wrap">
      <table className="analysis-table">
        <thead>
          <tr>
            <th>Pos</th>
            <th>Sumber</th>
            <th>Formula</th>
            {periods.map((period) => (
              <th className="period-column" key={period.id}>
                {period.label || "Periode"}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            if (row.kind === "section") {
              return (
                <tr className="analysis-section-row" key={row.key}>
                  <td colSpan={periods.length + 3}>{row.label}</td>
                </tr>
              );
            }

            const rowClassName =
              row.kind === "subtotal" ? "analysis-total-row" : row.kind === "warning" ? "analysis-warning-row" : "";

            return (
              <tr className={rowClassName} key={row.key}>
                <td>{row.label}</td>
                <td>{row.source}</td>
                <td>
                  <code>{row.formula}</code>
                  {row.note ? <span>{row.note}</span> : null}
                </td>
                {periods.map((period) => (
                  <td className="numeric-cell period-column" key={period.id}>
                    {formatAnalysisValue(row.values[period.id] ?? null, percentRowKeys.has(row.key) ? "percent" : "currency")}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function RatioTable({ rows, periods }: { rows: RatioRow[]; periods: Period[] }) {
  return (
    <div className="table-wrap">
      <table className="analysis-table ratio-table">
        <thead>
          <tr>
            <th>Rasio</th>
            <th>Formula</th>
            {periods.map((period) => (
              <th className="period-column" key={period.id}>
                {period.label || "Periode"}
              </th>
            ))}
            <th>Rata-rata</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.key}>
              <td>
                {row.label}
                <span>{row.source}</span>
              </td>
              <td>
                <code>{row.formula}</code>
              </td>
              {periods.map((period) => (
                <td className="numeric-cell period-column" key={period.id}>
                  {formatAnalysisValue(row.values[period.id] ?? null, row.display)}
                </td>
              ))}
              <td className="numeric-cell period-column">{formatAnalysisValue(row.average, row.display)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

type EngineAuditMetric = {
  label: string;
  value: AnalysisValue;
  display?: "currency" | "percent" | "multiple" | "number";
};

function getLatestPeriodAnalysis(analysis: SectionAnalysis): PeriodAnalysis | null {
  return analysis.periodAnalyses[analysis.periodAnalyses.length - 1] ?? null;
}

function EngineAuditReference({
  sourceLabel,
  summary,
  metrics,
  notes,
}: {
  sourceLabel: string;
  summary: string;
  metrics: EngineAuditMetric[];
  notes: string[];
}) {
  return (
    <div className="audit-reference">
      <div className="audit-reference-source">
        <strong>{sourceLabel}</strong>
        <span>{summary}</span>
      </div>
      <div className="audit-reference-grid">
        {metrics.map((metric) => (
          <div key={metric.label}>
            <span>{metric.label}</span>
            <strong>{formatAnalysisValue(metric.value, metric.display ?? "currency")}</strong>
          </div>
        ))}
      </div>
      <ul>
        {notes.map((note) => (
          <li key={note}>{note}</li>
        ))}
      </ul>
    </div>
  );
}

function formatAnalysisValue(value: AnalysisValue, display: "currency" | "percent" | "multiple" | "number"): string {
  if (value === null || !Number.isFinite(value)) {
    return "Perlu data pembanding";
  }

  if (display === "number") {
    return Intl.NumberFormat("id-ID").format(value);
  }

  if (display === "percent") {
    return formatPercent(value);
  }

  if (display === "multiple") {
    return `${value.toFixed(2)}x`;
  }

  return formatIdr(value);
}

function readPersistedWorkbenchState(): PersistedWorkbenchState | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(WORKBENCH_STORAGE_KEY);

    if (!raw) {
      return null;
    }

    const parsed: unknown = JSON.parse(raw);

    if (!isRecord(parsed) || typeof parsed.version !== "number" || parsed.version < 1 || parsed.version > WORKBENCH_STORAGE_VERSION) {
      return null;
    }

    const periods = normalizePeriods(sanitizePeriods(parsed.periods));
    const rows = parsed.version < 2 ? migrateLegacyIncomeStatementSigns(sanitizeRows(parsed.rows)) : sanitizeRows(parsed.rows);
    const fixedAssetScheduleRows = ensureFixedAssetSchedulePeriods(sanitizeFixedAssetScheduleRows(parsed.fixedAssetScheduleRows), periods);
    const aamAdjustments = sanitizeAamAdjustments(parsed.aamAdjustments);
    const assumptions = sanitizeAssumptions(parsed.assumptions);
    const caseProfile = sanitizeCaseProfile(parsed.caseProfile);
    const dlom = migrateWorkbookUpdateDlomBasisIfNeeded({
      version: parsed.version,
      dlom: sanitizeDlomState(parsed.dlom),
      caseProfile,
      rows,
    });
    const dlocPfc = sanitizeDlocPfcState(parsed.dlocPfc);
    const taxSimulation = sanitizeTaxSimulationState(parsed.taxSimulation);
    const cashFlowOverrides = sanitizeCashFlowOverrides(parsed.cashFlowOverrides);
    const activePeriodId = typeof parsed.activePeriodId === "string" ? parsed.activePeriodId : "";
    const fixedAssetProjectionMode = sanitizeFixedAssetProjectionMode(parsed.fixedAssetProjectionMode);
    const isFixedAssetScheduleEnabled =
      typeof parsed.isFixedAssetScheduleEnabled === "boolean" ? parsed.isFixedAssetScheduleEnabled : fixedAssetScheduleRows.length > 0;

    return {
      version: WORKBENCH_STORAGE_VERSION,
      savedAt: typeof parsed.savedAt === "string" ? parsed.savedAt : "",
      periods,
      activePeriodId,
      rows,
      isFixedAssetScheduleEnabled,
      fixedAssetScheduleRows,
      fixedAssetProjectionMode,
      aamAdjustments,
      assumptions,
      caseProfile,
      dlom,
      dlocPfc,
      taxSimulation,
      cashFlowOverrides,
    };
  } catch {
    return null;
  }
}

function migrateLegacyIncomeStatementSigns(rows: AccountRow[]): AccountRow[] {
  return rows.map((row) => {
    if (row.statement !== "income_statement") {
      return row;
    }

    const effectiveCategory = mapRow(row).effectiveCategory;
    const values = Object.fromEntries(
      Object.entries(row.values).map(([periodId, value]) => [
        periodId,
        formatIncomeStatementInputValue(effectiveCategory, row.statement, "", value),
      ]),
    );

    return { ...row, values };
  });
}

function persistWorkbenchState(state: PersistedWorkbenchState) {
  safeSetLocalStorage(WORKBENCH_STORAGE_KEY, JSON.stringify(state));
}

function clearPersistedWorkbenchState() {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.removeItem(WORKBENCH_STORAGE_KEY);
    window.localStorage.removeItem(WORKBENCH_SCROLL_STORAGE_KEY);
  } catch {
    // Storage can be unavailable in private or restricted browser contexts.
  }
}

function safeSetLocalStorage(key: string, value: string) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Ignore quota or browser policy errors; the app should remain usable.
  }
}

function readStoredScrollPosition(): number {
  if (typeof window === "undefined") {
    return 0;
  }

  try {
    const value = Number(window.localStorage.getItem(WORKBENCH_SCROLL_STORAGE_KEY));
    return Number.isFinite(value) ? Math.max(0, value) : 0;
  } catch {
    return 0;
  }
}

function readStoredSidebarState(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    return window.localStorage.getItem(WORKBENCH_SIDEBAR_STORAGE_KEY) === "collapsed";
  } catch {
    return false;
  }
}

function sanitizePeriods(value: unknown): Period[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((period): Period[] => {
    if (!isRecord(period) || typeof period.id !== "string") {
      return [];
    }

    return [
      {
        id: period.id,
        label: typeof period.label === "string" ? period.label : "",
        valuationDate: typeof period.valuationDate === "string" ? period.valuationDate : "",
        yearOffset: readFiniteNumber(period.yearOffset),
      },
    ];
  });
}

function sanitizeRows(value: unknown): AccountRow[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((row): AccountRow[] => {
    if (!isRecord(row) || typeof row.id !== "string" || typeof row.accountName !== "string") {
      return [];
    }

    const statement = statementValueSet.has(row.statement as StatementType) ? (row.statement as StatementType) : "balance_sheet";
    const categoryOverride =
      row.categoryOverride === "" || categoryValueSet.has(row.categoryOverride as AccountCategory)
        ? (row.categoryOverride as AccountCategory | "")
        : "";

    return [
      {
        id: row.id,
        statement,
        accountName: row.accountName,
        categoryOverride,
        balanceSheetClassification:
          statement === "balance_sheet" && balanceSheetClassificationValueSet.has(row.balanceSheetClassification as BalanceSheetClassification)
            ? (row.balanceSheetClassification as BalanceSheetClassification)
            : "",
        labelOverrides: sanitizeAccountLabels(row.labelOverrides),
        values: sanitizeStringRecord(row.values),
      },
    ];
  });
}

function cloneCoreState(state: WorkbenchCoreState): WorkbenchCoreState {
  return JSON.parse(JSON.stringify(state)) as WorkbenchCoreState;
}

function sanitizeFixedAssetProjectionMode(value: unknown): FixedAssetProjectionMode {
  return value === "dcf-proxy" || value === "workbook-formula" ? value : defaultFixedAssetProjectionMode;
}

function sanitizeFixedAssetScheduleRows(value: unknown): FixedAssetScheduleRow[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((row): FixedAssetScheduleRow[] => {
    if (!isRecord(row) || typeof row.id !== "string") {
      return [];
    }

    const values = isRecord(row.values)
      ? Object.fromEntries(
          Object.entries(row.values).flatMap(([periodId, periodValues]) => {
            if (!isRecord(periodValues)) {
              return [];
            }

            return [
              [
                periodId,
                Object.fromEntries(
                  fixedAssetScheduleValueKeys.map((key) => [key, typeof periodValues[key] === "string" ? periodValues[key] : ""]),
                ) as Record<FixedAssetScheduleValueKey, string>,
              ],
            ];
          }),
        )
      : {};

    return [
      {
        id: row.id,
        assetName: typeof row.assetName === "string" ? row.assetName : "",
        values,
      },
    ];
  });
}

function sanitizeAamAdjustments(value: unknown): AamAdjustmentState {
  if (!isRecord(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value).flatMap(([lineId, entry]) => {
      if (!aamAdjustmentLineIds.has(lineId) || !isRecord(entry)) {
        return [];
      }

      const adjustment = typeof entry.adjustment === "string" ? formatEditableNumber(entry.adjustment) : "";
      const note = typeof entry.note === "string" ? entry.note : "";

      if (!adjustment.trim() && !note.trim()) {
        return [];
      }

      return [[lineId, { adjustment, note }]];
    }),
  );
}

function sanitizeAssumptions(value: unknown): AssumptionState {
  const source = isRecord(value) ? value : {};
  return Object.fromEntries(
    assumptionKeys.map((key) => [key, typeof source[key] === "string" ? source[key] : ""]),
  ) as AssumptionState;
}

function sanitizeCaseProfile(value: unknown): CaseProfile {
  const source = isRecord(value) ? value : {};
  const profile = Object.fromEntries(
    caseProfileKeys.map((key) => [key, typeof source[key] === "string" ? source[key] : ""]),
  ) as CaseProfile;
  const kluRecord = getKluSectorRecord(profile.objectBusinessKlu);
  const validCompanySector = companySectorOptions.includes(profile.companySector) ? profile.companySector : "";

  if (!validCompanySector && kluRecord) {
    return { ...profile, companySector: kluRecord.sector };
  }

  return { ...profile, companySector: validCompanySector };
}

function sanitizeDlomState(value: unknown): DlomState {
  if (!isRecord(value)) {
    return createEmptyDlomState();
  }

  let basisOverride: DlomBasisOverride | null = null;

  if (isRecord(value.basisOverride)) {
    const interestBasis = typeof value.basisOverride.interestBasis === "string" ? value.basisOverride.interestBasis : "";

    if (interestBasis === "Minoritas" || interestBasis === "Mayoritas") {
      basisOverride = {
        interestBasis,
        sourceLabel: typeof value.basisOverride.sourceLabel === "string" ? value.basisOverride.sourceLabel : "",
      };
    }
  }
  const factorSource = isRecord(value.factors) ? value.factors : {};
  const factors = Object.fromEntries(
    dlomFactorDefinitions.map((definition) => {
      const input = factorSource[definition.id];
      const inputRecord = isRecord(input) ? input : {};
      const answer = typeof inputRecord.answer === "string" ? inputRecord.answer : "";
      const overrideReason = typeof inputRecord.overrideReason === "string" ? inputRecord.overrideReason : "";

      return [definition.id, { answer, overrideReason }];
    }),
  ) as DlomState["factors"];

  return normalizeDlomState({ factors, basisOverride });
}

function migrateWorkbookUpdateDlomBasisIfNeeded({
  version,
  dlom,
  caseProfile,
  rows,
}: {
  version: number;
  dlom: DlomState;
  caseProfile: CaseProfile;
  rows: AccountRow[];
}): DlomState {
  if (version >= WORKBENCH_STORAGE_VERSION || dlom.basisOverride || !isLegacySampleWorkbookDraft(caseProfile, dlom, rows)) {
    return dlom;
  }

  return normalizeDlomState({
    ...dlom,
    basisOverride: workbookUpdateDlomBasisOverride,
  });
}

function isLegacySampleWorkbookDraft(caseProfile: CaseProfile, dlom: DlomState, rows: AccountRow[]): boolean {
  if (
    caseProfile.objectTaxpayerName !== "Makmur Jaya Sejati Raya" ||
    caseProfile.companyType !== "Tertutup" ||
    caseProfile.shareOwnershipType !== "Minoritas"
  ) {
    return false;
  }

  if (!hasWorkbookUpdateDlomRows(rows) || !hasWorkbookUpdateDlomAnswers(dlom)) {
    return false;
  }

  return true;
}

function hasWorkbookUpdateDlomAnswers(dlom: DlomState): boolean {
  const sampleDlom = buildSampleDlomState();

  return dlomFactorDefinitions.every((definition) => {
    const current = dlom.factors[definition.id];
    const sample = sampleDlom.factors[definition.id];

    return current.answer === sample.answer;
  });
}

function hasWorkbookUpdateDlomRows(rows: AccountRow[]): boolean {
  const rowIds = new Set(rows.map((row) => row.id));

  if (rowIds.has("sample-revenue") && rowIds.has("sample-cash-hand")) {
    return true;
  }

  return (
    rows.some((row) => rowLooksLikeWorkbookValue(row, ["revenue", "penjualan"], 16_663_916_100)) &&
    rows.some((row) => rowLooksLikeWorkbookValue(row, ["cash", "kas"], 717_848_795))
  );
}

function rowLooksLikeWorkbookValue(row: AccountRow, labelHints: string[], expectedValue: number): boolean {
  const normalizedName = row.accountName.toLowerCase();

  if (!labelHints.some((hint) => normalizedName.includes(hint))) {
    return false;
  }

  return Object.values(row.values).some((value) => Math.abs(parseInputNumber(value) - expectedValue) < 1);
}

function sanitizeDlocPfcState(value: unknown): DlocPfcState {
  if (!isRecord(value)) {
    return createEmptyDlocPfcState();
  }

  const factorSource = isRecord(value.factors) ? value.factors : {};
  const factors = Object.fromEntries(
    dlocPfcFactorDefinitions.map((definition) => {
      const input = factorSource[definition.id];
      const inputRecord = isRecord(input) ? input : {};
      const answer = typeof inputRecord.answer === "string" ? inputRecord.answer : "";
      const overrideReason = typeof inputRecord.overrideReason === "string" ? inputRecord.overrideReason : "";

      return [definition.id, { answer, overrideReason }];
    }),
  ) as DlocPfcState["factors"];

  return normalizeDlocPfcState({ factors });
}

function sanitizeTaxSimulationState(value: unknown): TaxSimulationState {
  if (!isRecord(value)) {
    return createEmptyTaxSimulationState();
  }

  return normalizeTaxSimulationState({
    primaryMethod: typeof value.primaryMethod === "string" ? (value.primaryMethod as ValuationMethod | "") : "",
    finalBasis: value.finalBasis === "manualScenario" ? "manualScenario" : "baseline",
    scenarioDlomRate: typeof value.scenarioDlomRate === "string" ? formatEditableNumber(value.scenarioDlomRate) : "",
    scenarioDlocPfcRate: typeof value.scenarioDlocPfcRate === "string" ? formatEditableNumber(value.scenarioDlocPfcRate) : "",
    scenarioReason: typeof value.scenarioReason === "string" ? value.scenarioReason : "",
    applyDlom: typeof value.applyDlom === "boolean" ? value.applyDlom : true,
    applyDlocPfc: typeof value.applyDlocPfc === "boolean" ? value.applyDlocPfc : true,
    useDlocPfcOverride: typeof value.useDlocPfcOverride === "boolean" ? value.useDlocPfcOverride : false,
    dlocPfcRate: typeof value.dlocPfcRate === "string" ? formatEditableNumber(value.dlocPfcRate) : "",
    dlocPfcOverrideReason: typeof value.dlocPfcOverrideReason === "string" ? value.dlocPfcOverrideReason : "",
    reportedTransferValue: typeof value.reportedTransferValue === "string" ? formatEditableNumber(value.reportedTransferValue) : "",
    note: typeof value.note === "string" ? value.note : "",
  });
}

function hasDlomInput(value: DlomState): boolean {
  return Boolean(value.basisOverride) || Object.values(value.factors).some((factor) => factor.answer.trim() !== "" || factor.overrideReason.trim() !== "");
}

function hasDlocPfcInput(value: DlocPfcState): boolean {
  return Object.values(value.factors).some((factor) => factor.answer.trim() !== "" || factor.overrideReason.trim() !== "");
}

function hasTaxSimulationInput(value: TaxSimulationState): boolean {
  return (
    value.primaryMethod !== "" ||
    value.finalBasis !== "baseline" ||
    value.scenarioDlomRate.trim() !== "" ||
    value.scenarioDlocPfcRate.trim() !== "" ||
    value.scenarioReason.trim() !== "" ||
    value.useDlocPfcOverride ||
    value.dlocPfcRate.trim() !== "" ||
    value.dlocPfcOverrideReason.trim() !== "" ||
    value.reportedTransferValue.trim() !== "" ||
    value.note.trim() !== ""
  );
}

function sanitizeCashFlowOverrides(value: unknown): CashFlowOverrideState {
  if (!isRecord(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value).flatMap(([rowKey, periodEntries]) => {
      if (!isRecord(periodEntries)) {
        return [];
      }

      const sanitizedPeriodEntries = Object.fromEntries(
        Object.entries(periodEntries).flatMap(([periodId, entry]) => {
          if (!isRecord(entry)) {
            return [];
          }

          const valueInput = typeof entry.value === "string" ? formatEditableNumber(entry.value) : "";
          const reason = typeof entry.reason === "string" ? entry.reason : "";
          const updatedAt = typeof entry.updatedAt === "string" ? entry.updatedAt : "";

          return valueInput.trim() || reason.trim()
            ? [[periodId, { value: valueInput, reason, updatedAt } satisfies CashFlowOverrideEntry]]
            : [];
        }),
      );

      return Object.keys(sanitizedPeriodEntries).length > 0 ? [[rowKey, sanitizedPeriodEntries]] : [];
    }),
  );
}

function hasCashFlowOverrideInput(value: CashFlowOverrideState): boolean {
  return Object.values(value).some((row) =>
    Object.values(row).some((entry) => entry.value.trim() !== "" || entry.reason.trim() !== ""),
  );
}

function removeCashFlowOverridePeriod(value: CashFlowOverrideState, periodId: string): CashFlowOverrideState {
  return Object.fromEntries(
    Object.entries(value).flatMap(([rowKey, periodEntries]) => {
      const nextEntries = { ...periodEntries };
      delete nextEntries[periodId];
      return Object.keys(nextEntries).length > 0 ? [[rowKey, nextEntries]] : [];
    }),
  );
}

function sanitizeStringRecord(value: unknown): Record<string, string> {
  if (!isRecord(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value).filter((entry): entry is [string, string] => typeof entry[1] === "string"),
  );
}

function readFiniteNumber(value: unknown): number {
  const numericValue = typeof value === "number" || typeof value === "string" ? Number(value) : Number.NaN;
  return Number.isFinite(numericValue) ? numericValue : Number.NaN;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function BalanceSheetPositionTable({ periods, view }: { periods: Period[]; view: BalanceSheetView }) {
  if (!view.hasRows) {
    return null;
  }

  return (
    <div className="balance-sheet-position">
      <div className="subpanel-heading">
        <div>
          <p className="eyebrow">Neraca</p>
          <h4>Posisi Aset · Liabilitas · Ekuitas</h4>
        </div>
        <span className="status-pill muted">{view.hasFixedAssetScheduleLines ? "Termasuk fixed asset otomatis" : "Dikelompokkan otomatis"}</span>
      </div>
      <div className="table-wrap">
        <table className="balance-sheet-table" data-testid="balance-sheet-position-table">
          <thead>
            <tr>
              <th>Pos</th>
              <th>Detail</th>
              <th>Akun / komponen</th>
              <th>Sumber</th>
              {periods.map((period) => (
                <th className="period-column" key={period.id}>
                  {period.label || "Periode"}
                </th>
              ))}
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {view.sections.map((section) => (
              <Fragment key={section.title}>
                <tr className="balance-section-row">
                  <td colSpan={periods.length + 5}>{section.title}</td>
                </tr>
                {section.lines.length === 0 ? (
                  <tr>
                    <td>{section.title}</td>
                    <td colSpan={periods.length + 4}>Belum ada akun pada kelompok ini.</td>
                  </tr>
                ) : (
                  groupBalanceSheetLines(section.lines).map((group) => (
                    <Fragment key={`${section.title}-${group.key}`}>
                      <tr className="balance-detail-row">
                        <td>{section.title}</td>
                        <td colSpan={periods.length + 4}>{group.label}</td>
                      </tr>
                      {group.lines.map((line, index) => (
                        <tr key={`${section.title}-${group.key}-${line.label}-${index}`}>
                          <td>{section.title}</td>
                          <td>{balanceSheetClassificationLabelMap.get(line.balanceSheetClassification as BalanceSheetClassification) ?? group.label}</td>
                          <td>
                            <strong>{line.label}</strong>
                            <span>{line.category}</span>
                          </td>
                          <td>{line.source}</td>
                          {periods.map((period) => (
                            <td className="numeric-cell period-column" key={period.id}>
                              {formatInputNumber(line.values[period.id] ?? 0)}
                            </td>
                          ))}
                          <td>
                            <span className={line.isDerived ? "badge ok" : line.isOverride ? "badge warning" : "badge muted"}>
                              {line.isDerived ? "Otomatis" : line.isOverride ? "Override" : "Input"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </Fragment>
                  ))
                )}
                <tr className="total-row">
                  <td>{section.title}</td>
                  <td>Total</td>
                  <td>{section.totalLabel}</td>
                  <td>Model</td>
                  {periods.map((period) => (
                    <td className="numeric-cell period-column" key={period.id}>
                      {formatInputNumber(section.totalValues[period.id] ?? 0)}
                    </td>
                  ))}
                  <td />
                </tr>
              </Fragment>
            ))}
            <tr className="total-row balance-liabilities-equity-row">
              <td>Liabilitas + Ekuitas</td>
              <td>Total</td>
              <td>Total Liabilitas + Ekuitas</td>
              <td>Model</td>
              {periods.map((period) => (
                <td className="numeric-cell period-column" key={period.id}>
                  {formatInputNumber(view.totalLiabilitiesAndEquity[period.id] ?? 0)}
                </td>
              ))}
              <td />
            </tr>
            <tr className="balance-check-row">
              <td>Cek Kesesuaian</td>
              <td>Model</td>
              <td>Aset - (Liabilitas + Ekuitas)</td>
              <td>Model</td>
              {periods.map((period) => {
                const value = view.balanceGap[period.id] ?? 0;
                const isBalanced = Math.abs(value) <= Math.max(1, Math.abs(view.totalAssets[period.id] ?? 0) * 0.001);

                return (
                  <td className={isBalanced ? "numeric-cell period-column ok-text" : "numeric-cell period-column warning-text"} key={period.id}>
                    {formatInputNumber(value)}
                  </td>
                );
              })}
              <td />
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function IncomeStatementReportTable({ periods, view }: { periods: Period[]; view: IncomeStatementView }) {
  if (!view.hasRows) {
    return null;
  }

  return (
    <div className="income-statement-report">
      <div className="subpanel-heading">
        <div>
          <p className="eyebrow">Laporan Laba Rugi</p>
          <h4>Pendapatan · EBITDA · EBIT · NPAT</h4>
        </div>
        <span className="status-pill muted">Terstruktur dari mapping akun</span>
      </div>
      <div className="table-wrap">
        <table className="income-statement-table" data-testid="income-statement-report-table">
          <thead>
            <tr>
              <th>Pos</th>
              <th>Sumber</th>
              {periods.map((period) => (
                <th className="period-column" key={period.id}>
                  {period.label || "Periode"}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {view.lines.map((line) => {
              if (line.kind === "section") {
                return (
                  <tr className="income-section-row" data-line-key={line.key} key={line.key}>
                    <td colSpan={periods.length + 2}>{line.label}</td>
                  </tr>
                );
              }

              const rowClassName = line.kind === "subtotal" ? "income-total-row" : line.kind === "derived" ? "income-derived-row" : "";

              return (
                <tr className={rowClassName} data-line-key={line.key} key={line.key}>
                  <td>{line.label}</td>
                  <td>{line.source}</td>
                  {periods.map((period) => (
                    <td className="numeric-cell period-column" key={period.id}>
                      {formatInputNumber(line.values[period.id] ?? 0)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AccountInputTable({
  emptyMessage,
  mappedRows,
  periods,
  testId,
  onRemoveRow,
  onToggleLabel,
  onUpdateRow,
  onUpdateRowValue,
}: {
  emptyMessage: string;
  mappedRows: MappedRow[];
  periods: Period[];
  testId: string;
  onRemoveRow: (id: string) => void;
  onToggleLabel: (rowId: string, labelId: AccountLabelId) => void;
  onUpdateRow: (id: string, patch: Partial<AccountRow>) => void;
  onUpdateRowValue: (rowId: string, periodId: string, value: string) => void;
}) {
  if (mappedRows.length === 0) {
    return <div className="empty-state">{emptyMessage}</div>;
  }

  const hasBalanceSheetClassificationColumn = mappedRows.some((item) => item.row.statement === "balance_sheet");

  return (
    <div className="table-wrap" data-testid={`${testId}-wrap`}>
      <table className={hasBalanceSheetClassificationColumn ? "account-entry-table balance-entry-table" : "account-entry-table"} data-testid={testId}>
        <thead>
          <tr>
            <th>Sumber</th>
            {hasBalanceSheetClassificationColumn ? <th className="balance-classification-column">Klasifikasi neraca</th> : null}
            <th>Nama akun dari laporan</th>
            <th>Kategori utama</th>
            <th>Label & dampak</th>
            {periods.map((period) => (
              <th key={period.id}>{period.label || "Periode"}</th>
            ))}
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {mappedRows.map((item) => {
            const { row, mapping, effectiveCategory } = item;
            const balanceSheetClassification = getEffectiveBalanceSheetClassification(item);
            const balanceSheetClassificationOptionsForRow = getBalanceSheetClassificationOptions(effectiveCategory);

            return (
              <tr data-testid={`${testId}-row`} key={row.id}>
                <td>
                  <select
                    aria-label="Sumber laporan"
                    value={row.statement}
                    onChange={(event) =>
                      onUpdateRow(row.id, {
                        statement: event.target.value as StatementType,
                        categoryOverride: "",
                        balanceSheetClassification: "",
                      })
                    }
                  >
                    {Object.entries(statementLabels).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </td>
                {hasBalanceSheetClassificationColumn ? (
                  <td className="balance-classification-column">
                    {row.statement === "balance_sheet" ? (
                      <div className="balance-classification-cell">
                        <select
                          aria-label="Klasifikasi neraca"
                          value={balanceSheetClassification}
                          onChange={(event) =>
                            onUpdateRow(row.id, { balanceSheetClassification: event.target.value as BalanceSheetClassification | "" })
                          }
                        >
                          <option value="">Pilih detail neraca</option>
                          {balanceSheetClassificationOptionsForRow.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        <span className="row-hint">
                          {balanceSheetClassification
                            ? `Detail: ${balanceSheetClassificationLabelMap.get(balanceSheetClassification)}`
                            : "Khusus neraca"}
                        </span>
                      </div>
                    ) : (
                      <span className="row-hint">Tidak berlaku</span>
                    )}
                  </td>
                ) : null}
                <td>
                  <input
                    className="account-name-input"
                    aria-label="Nama akun"
                    placeholder="Ketik nama akun sesuai laporan"
                    value={row.accountName}
                    onChange={(event) => onUpdateRow(row.id, { accountName: event.target.value })}
                  />
                  <span className={mapping.needsReview || effectiveCategory === "UNMAPPED" ? "row-hint warning-text" : "row-hint ok-text"}>
                    Saran: {mapping.displayName} · {formatScore(mapping.confidence)}
                  </span>
                </td>
                <td>
                  <select
                    aria-label="Kategori utama"
                    value={row.categoryOverride || effectiveCategory}
                    onChange={(event) => {
                      const nextCategory = event.target.value as AccountCategory;

                      onUpdateRow(row.id, {
                        categoryOverride: nextCategory,
                        balanceSheetClassification:
                          row.statement === "balance_sheet" ? inferBalanceSheetClassification(nextCategory) : "",
                      });
                    }}
                  >
                    {getCategoryOptionsForStatement(row.statement).map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {!row.categoryOverride && mapping.category !== effectiveCategory && mapping.category !== "UNMAPPED" ? (
                    <span className="row-hint warning-text">Belum auto-apply karena perlu ditinjau.</span>
                  ) : null}
                </td>
                <td>
                  <AccountLabelImpactCell item={item} onToggleLabel={onToggleLabel} />
                </td>
                {periods.map((period) => (
                  <td key={period.id}>
                    <input
                      aria-label={`${period.label || "Periode"} amount`}
                      inputMode="decimal"
                      placeholder="0"
                      value={row.values[period.id] ?? ""}
                      onChange={(event) => onUpdateRowValue(row.id, period.id, event.target.value)}
                    />
                  </td>
                ))}
                <td>
                  <button className="icon-button danger" type="button" onClick={() => onRemoveRow(row.id)} title="Hapus akun">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function getCategoryOptionsForStatement(statement: StatementType): Array<{ value: AccountCategory; label: string }> {
  const allowedCategories = categoryOptionsByStatement[statement] ?? categoryOptionsByStatement.balance_sheet;

  return categoryOptions.filter((option) => allowedCategories.has(option.value));
}

function AccountLabelImpactCell({ item, onToggleLabel }: { item: MappedRow; onToggleLabel: (rowId: string, labelId: AccountLabelId) => void }) {
  const { row, mapping, effectiveCategory } = item;
  const profile = getCategoryLabelProfile(effectiveCategory);
  const labels = resolveAccountLabels(row.statement, effectiveCategory, row.labelOverrides);
  const defaultLabels = new Set(resolveAccountLabels(row.statement, effectiveCategory));
  const balanceSheetClassification = getEffectiveBalanceSheetClassification(item);
  const displayLabels = applyBalanceSheetClassificationToDisplayLabels(row.statement, labels, balanceSheetClassification);
  const visibleLabels = displayLabels.slice(0, 7);

  return (
    <div className="label-impact-cell">
      <div className="impact-chip-row">
        <span className="impact-chip">Posisi: {profile.placement}</span>
        {balanceSheetClassification ? <span className="impact-chip">Detail: {balanceSheetClassificationLabelMap.get(balanceSheetClassification)}</span> : null}
        <span className="impact-chip">Perlakuan: {profile.treatment}</span>
        <span className="impact-chip">Tanda: {profile.signBehavior}</span>
        {row.categoryOverride ? <span className="impact-chip warning">Override manual</span> : null}
        {mapping.needsReview || effectiveCategory === "UNMAPPED" ? <span className="impact-chip warning">Perlu ditinjau</span> : null}
      </div>
      <div className="label-chip-row">
        {visibleLabels.map((labelId) => (
          <span className="label-chip" key={labelId}>
            {getAccountLabelDefinition(labelId)?.label ?? labelId}
          </span>
        ))}
        {displayLabels.length > visibleLabels.length ? <span className="label-chip muted">+{displayLabels.length - visibleLabels.length}</span> : null}
      </div>
      {mapping.alternatives.length > 0 ? (
        <span className="row-hint">Alternatif: {mapping.alternatives.map((candidate) => `${candidate.displayName} ${formatScore(candidate.confidence)}`).join(", ")}</span>
      ) : null}
      <details className="label-editor">
        <summary>Edit label pendukung</summary>
        <div className="label-picker">
          {accountLabelDefinitions.map((definition) => {
            const checked = labels.includes(definition.id);
            const disabled = defaultLabels.has(definition.id);

            return (
              <label key={definition.id}>
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={disabled}
                  onChange={() => onToggleLabel(row.id, definition.id)}
                />
                <span>{definition.label}</span>
              </label>
            );
          })}
        </div>
      </details>
    </div>
  );
}

function MappingTable({ mappedRows }: { mappedRows: MappedRow[] }) {
  if (mappedRows.length === 0) {
    return <div className="empty-state">Belum ada akun untuk ditinjau.</div>;
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Nama akun</th>
            <th>Sumber</th>
            <th>Saran pemetaan</th>
            <th>Kategori efektif</th>
            <th>Label sistem</th>
            <th>Tingkat keyakinan</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {mappedRows.map(({ row, mapping, effectiveCategory }) => {
            const needsReview = effectiveCategory === "UNMAPPED" || (!row.categoryOverride && mapping.needsReview);
            const displayLabels = applyBalanceSheetClassificationToDisplayLabels(
              row.statement,
              resolveAccountLabels(row.statement, effectiveCategory, row.labelOverrides),
              row.statement === "balance_sheet" ? getEffectiveBalanceSheetClassification({ row, mapping, effectiveCategory }) : "",
            );

            return (
              <tr key={row.id}>
                <td>
                  <strong>{row.accountName || "Belum diisi"}</strong>
                  <span>{mapping.reason}</span>
                </td>
                <td>{statementLabels[row.statement]}</td>
                <td>
                  {mapping.displayName}
                  {mapping.alternatives.length > 0 ? (
                    <span>Alternatif: {mapping.alternatives.map((item) => `${item.displayName} ${formatScore(item.confidence)}`).join(", ")}</span>
                  ) : null}
                </td>
                <td>{categoryLabelMap.get(effectiveCategory) ?? effectiveCategory}</td>
                <td>
                  <div className="label-chip-row compact">
                    {displayLabels.slice(0, 5).map((labelId) => (
                      <span className="label-chip" key={labelId}>
                        {getAccountLabelDefinition(labelId)?.label ?? labelId}
                      </span>
                    ))}
                  </div>
                </td>
                <td>
                  {formatScore(mapping.confidence)}
                  <span>{confidenceBandLabels[mapping.confidenceBand]}</span>
                </td>
                <td>
                  <span className={needsReview ? "badge warning" : "badge ok"}>{needsReview ? "Perlu ditinjau" : "Diterima"}</span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function AssumptionDriverMatrix({
  drivers,
}: {
  drivers: Array<{ label: string; valueLabel: string; sourceLabel: string }>;
}) {
  return (
    <section className="assumption-driver-matrix" aria-label="Ringkasan driver penilaian">
      {drivers.map((driver) => (
        <div key={driver.label}>
          <span>{driver.label}</span>
          <strong>{driver.valueLabel}</strong>
          <small>{driver.sourceLabel}</small>
        </div>
      ))}
    </section>
  );
}

function CaseProfilePanel({
  profile,
  derived,
  onChange,
}: {
  profile: CaseProfile;
  derived: CaseProfileDerived;
  onChange: (key: keyof CaseProfile, value: string) => void;
}) {
  const kluRecord = getKluSectorRecord(profile.objectBusinessKlu);

  return (
    <div className="data-awal-grid" data-testid="case-profile-panel">
      <article className="data-awal-card">
        <div className="input-section-title">
          <FileSearch size={16} />
          <h4>Identitas Objek Pajak</h4>
        </div>
        <div className="input-grid">
          <CaseProfileInput label="Nama Objek Pajak" value={profile.objectTaxpayerName} onChange={(value) => onChange("objectTaxpayerName", value)} />
          <KluProfileCombobox value={profile.objectBusinessKlu} selectedRecord={kluRecord} onChange={(value) => onChange("objectBusinessKlu", value)} />
          <KluSectorField
            sector={profile.companySector}
            selectedRecord={kluRecord}
            rawKlu={profile.objectBusinessKlu}
            onChange={(value) => onChange("companySector", value)}
          />
          <CaseProfileSelect label="Jenis Perusahaan" value={profile.companyType} options={companyTypeOptions} onChange={(value) => onChange("companyType", value)} />
        </div>
      </article>

      <article className="data-awal-card">
        <div className="input-section-title">
          <Banknote size={16} />
          <h4>Identitas Subjek Pajak</h4>
        </div>
        <div className="input-grid">
          <CaseProfileInput label="Nama Subjek Pajak" value={profile.subjectTaxpayerName} onChange={(value) => onChange("subjectTaxpayerName", value)} />
          <CaseProfileInput label="NPWP Subjek Pajak" value={profile.subjectTaxpayerNpwp} onChange={(value) => onChange("subjectTaxpayerNpwp", value)} />
          <CaseProfileSelect
            label="Jenis Subjek Pajak"
            value={profile.subjectTaxpayerType}
            options={subjectTaxpayerTypeOptions}
            onChange={(value) => onChange("subjectTaxpayerType", value)}
          />
          <CaseProfileSelect
            label="Jenis Kepemilikan Saham"
            value={profile.shareOwnershipType}
            options={shareOwnershipTypeOptions}
            onChange={(value) => onChange("shareOwnershipType", value)}
          />
        </div>
      </article>

      <article className="data-awal-card wide">
        <div className="input-section-title">
          <Calculator size={16} />
          <h4>Transaksi dan Objek Penilaian</h4>
        </div>
        <div className="case-transaction-grid">
          <CaseProfileSelect
            label="Jenis Peralihan yang Diketahui"
            value={profile.transferType}
            options={transferTypeOptions}
            onChange={(value) => onChange("transferType", value)}
          />
          <CaseProfileInput
            label={derived.capitalBaseFullLabel}
            value={profile.capitalBaseFull}
            inputMode="decimal"
            onChange={(value) => onChange("capitalBaseFull", value)}
          />
          <CaseProfileInput
            label={derived.capitalBaseValuedLabel}
            value={profile.capitalBaseValued}
            inputMode="decimal"
            onChange={(value) => onChange("capitalBaseValued", value)}
          />
          <DerivedCaseField
            label={derived.capitalProportionLabel}
            value={formatCaseProfileProportion(derived)}
            state={derived.capitalProportionStatus === "invalid" ? "invalid" : "neutral"}
          />
          <CaseProfileInput
            label="Tahun Transaksi Pengalihan"
            value={profile.transactionYear}
            inputMode="numeric"
            onChange={(value) => onChange("transactionYear", value)}
          />
          <DerivedCaseField label="Tanggal cut-off" value={formatDerivedDate(derived.cutOffDate)} />
          <DerivedCaseField label="Akhir Periode Proyeksi Pertama" value={formatDerivedDate(derived.firstProjectionEndDate)} />
          <CaseProfileSelect label="Objek Penilaian" value={profile.valuationObject} options={valuationObjectOptions} onChange={(value) => onChange("valuationObject", value)} />
        </div>
      </article>
    </div>
  );
}

function CaseProfileInput({
  label,
  value,
  inputMode = "text",
  onChange,
}: {
  label: string;
  value: string;
  inputMode?: "text" | "decimal" | "numeric";
  onChange: (value: string) => void;
}) {
  const inputId = `case-profile-${slugifyLabel(label)}`;

  return (
    <label className="field" htmlFor={inputId}>
      <span>{label}</span>
      <input id={inputId} inputMode={inputMode} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function KluProfileCombobox({
  value,
  selectedRecord,
  onChange,
}: {
  value: string;
  selectedRecord: KluSectorRecord | null;
  onChange: (value: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const inputId = "case-profile-klu-sesuai-appportal";
  const listboxId = "case-profile-klu-suggestions";
  const suggestions = useMemo(() => searchKluSectorRecords(value, 8), [value]);
  const hasInvalidFullCode = value.length === 5 && !selectedRecord;
  const shouldShowSuggestions = isOpen && suggestions.length > 0 && selectedRecord?.code !== value;
  const selectedLabel = selectedRecord ? formatKluOptionLabel(selectedRecord) : undefined;

  return (
    <div className={hasInvalidFullCode ? "field klu-field invalid" : "field klu-field"}>
      <label htmlFor={inputId}>KLU sesuai Appportal</label>
      <input
        aria-autocomplete="list"
        aria-controls={listboxId}
        aria-expanded={shouldShowSuggestions}
        aria-invalid={hasInvalidFullCode}
        id={inputId}
        inputMode="numeric"
        placeholder="Ketik 5 digit KLU"
        role="combobox"
        title={selectedLabel}
        value={value}
        onBlur={() => window.setTimeout(() => setIsOpen(false), 120)}
        onChange={(event) => {
          onChange(normalizeKluCode(event.target.value));
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
      />
      {shouldShowSuggestions ? (
        <div className="klu-suggestion-list" id={listboxId} role="listbox">
          {suggestions.map((record) => (
            <button
              aria-selected={record.code === selectedRecord?.code}
              key={record.code}
              role="option"
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                onChange(record.code);
                setIsOpen(false);
              }}
            >
              <strong>{record.code}</strong>
              <span>{record.title}</span>
              <small>{record.sector}</small>
            </button>
          ))}
        </div>
      ) : null}
      {hasInvalidFullCode ? (
        <small className="field-help" role="alert">
          KLU tidak ditemukan dalam daftar KBLI 2020.
        </small>
      ) : null}
    </div>
  );
}

function KluSectorField({
  sector,
  selectedRecord,
  rawKlu,
  onChange,
}: {
  sector: string;
  selectedRecord: KluSectorRecord | null;
  rawKlu: string;
  onChange: (value: string) => void;
}) {
  const inputId = "case-profile-company-sector";
  const isInvalidFullCode = rawKlu.length === 5 && !selectedRecord;
  const suggestedSector = selectedRecord?.sector ?? "";
  const isManualOverride = Boolean(selectedRecord && sector && sector !== suggestedSector);
  const sectorMetadata = selectedRecord
    ? isManualOverride
      ? `Override manual. Saran KLU ${selectedRecord.code}: ${suggestedSector}. Confidence: ${selectedRecord.confidence}${
          selectedRecord.reviewNote ? ` - ${selectedRecord.reviewNote}` : ""
        }`
      : `Mengikuti saran KLU ${selectedRecord.code}. Confidence: ${selectedRecord.confidence}${selectedRecord.reviewNote ? ` - ${selectedRecord.reviewNote}` : ""}`
    : "Pilih sektor manual, atau isi KLU valid agar saran sektor terisi otomatis.";

  return (
    <label className={isInvalidFullCode ? "field derived-sector-field invalid" : "field derived-sector-field"} htmlFor={inputId}>
      <span>Sektor Perusahaan</span>
      <select
        aria-invalid={isInvalidFullCode}
        data-testid="company-sector-derived"
        id={inputId}
        title={sectorMetadata}
        value={sector}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">{isInvalidFullCode ? "KLU tidak ditemukan" : "Pilih sektor"}</option>
        {companySectorOptions.map((option) => (
          <option value={option} key={option}>
            {option}
          </option>
        ))}
      </select>
      {isInvalidFullCode ? (
        <small className="field-help" role="alert">
          KLU tidak ditemukan dalam daftar KBLI 2020.
        </small>
      ) : null}
    </label>
  );
}

function CaseProfileSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  const inputId = `case-profile-${slugifyLabel(label)}`;

  return (
    <label className="field" htmlFor={inputId}>
      <span>{label}</span>
      <select id={inputId} value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="">Pilih</option>
        {options.map((option) => (
          <option value={option} key={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function DerivedCaseField({
  label,
  value,
  state = "neutral",
}: {
  label: string;
  value: string;
  state?: "neutral" | "invalid";
}) {
  return (
    <div className={state === "invalid" ? "derived-field invalid" : "derived-field"}>
      <span>{label}</span>
      <output>{value}</output>
    </div>
  );
}

function DlomBasisField({ label, value }: { label: string; value: string }) {
  return (
    <div className="derived-field dlom-derived-field">
      <span>{label}</span>
      <output>{value}</output>
    </div>
  );
}

function WaccMarketSuggestionPanel({
  suggestion,
  valuationDate,
  onApply,
}: {
  suggestion: MarketAssumptionSuggestion | null;
  valuationDate: string;
  onApply: (suggestion: MarketAssumptionSuggestion) => void;
}) {
  const supportedYears = getSupportedMarketSuggestionYears();

  if (!suggestion) {
    return (
      <article className="assumption-calculator-card wacc-suggestion-card" data-testid="wacc-suggestion-card">
        <AssumptionCalculatorHeader
          label="Saran otomatis"
          value="Belum tersedia"
          impact={`Data tersedia untuk ${supportedYears[0]}-${supportedYears[supportedYears.length - 1]}`}
        />
        <p className="assumption-empty-note">
          {valuationDate.trim()
            ? "Tanggal penilaian berada di luar library tahunan 2018-2025."
            : "Isi Tahun Transaksi Pengalihan di Data Awal atau tanggal penilaian untuk memunculkan saran WACC tahunan."}
        </p>
      </article>
    );
  }

  return (
    <article className="assumption-calculator-card wacc-suggestion-card" data-testid="wacc-suggestion-card">
      <AssumptionCalculatorHeader
        label="Saran otomatis"
        value={`${suggestion.year}`}
      />
      <div className="table-wrap wacc-source-table">
        <table>
          <thead>
            <tr>
              <th>Input</th>
              <th className="numeric-cell">Saran</th>
              <th>Status</th>
              <th>Metode</th>
              <th>Sumber</th>
            </tr>
          </thead>
          <tbody>
            {Object.values(suggestion.metrics).map((metric) => (
              <tr key={metric.key}>
                <td>{metric.label}</td>
                <td className="numeric-cell">{formatPercent(metric.value)}</td>
                <td>
                  <span className="source-status-pill">Saran sistem</span>
                </td>
                <td>
                  {metric.method}
                  <span>{metric.note}</span>
                </td>
                <td>
                  <a href={metric.sourceUrl} target="_blank" rel="noreferrer">
                    {metric.source}
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button className="button secondary" type="button" onClick={() => onApply(suggestion)}>
        <CheckCircle2 size={18} />
        Terapkan Saran {suggestion.year}
      </button>
    </article>
  );
}

function WaccCalculatorPanel({
  assumptions,
  calculation,
  comparableBeta,
  companySector,
  comparableOptions,
  comparableSuggestions,
  autoCapitalValues,
  governance,
  onChange,
  onComparableNameChange,
  onApplyComparableSuggestions,
  onReasonChange,
}: {
  assumptions: AssumptionState;
  calculation: WaccCalculation | null;
  comparableBeta: WaccComparableBetaCalculation;
  companySector: string;
  comparableOptions: IdxComparableCompany[];
  comparableSuggestions: IdxComparableCompany[];
  autoCapitalValues: AutoWaccCapitalValues;
  governance: AssumptionGovernanceResult;
  onChange: (key: keyof AssumptionState, value: string) => void;
  onComparableNameChange: (slot: WaccComparableSlot, value: string) => void;
  onApplyComparableSuggestions: () => void;
  onReasonChange: (value: string) => void;
}) {
  const waccGovernanceItems = governance.items.filter((item) => item.target === "wacc");
  const bankLoanRate = calculateWaccBankLoanRateAssumption(assumptions);

  return (
    <article className="assumption-calculator-card wide" data-testid="wacc-calculator">
      <AssumptionCalculatorHeader
        label="Kalkulator WACC"
        value={calculation ? formatPercent(calculation.wacc) : formatRateInput(assumptions.wacc)}
      />
      <InlineGovernanceList title="Tata kelola WACC" items={waccGovernanceItems} />
      <div className="calculator-input-grid">
        <AssumptionInput label="Risk-free rate (tingkat bebas risiko)" value={assumptions.waccRiskFreeRate} onChange={(value) => onChange("waccRiskFreeRate", value)} />
        <AssumptionInput
          label="Equity risk premium (premi risiko ekuitas)"
          value={assumptions.waccEquityRiskPremium}
          onChange={(value) => onChange("waccEquityRiskPremium", value)}
        />
        <AssumptionInput
          label="Rating-based default spread (RBDS)"
          value={assumptions.waccRatingBasedDefaultSpread}
          onChange={(value) => onChange("waccRatingBasedDefaultSpread", value)}
        />
        <AssumptionInput
          label="Penyesuaian RBDS pada Ke"
          value={assumptions.waccCountryRiskPremium}
          note="Untuk parity workbook: Ke = Rf + Beta x ERP - RBDS, sehingga RBDS disimpan sebagai adjustment negatif."
          onChange={(value) => onChange("waccCountryRiskPremium", value)}
        />
        <AssumptionInput
          label="Premi risiko spesifik"
          value={assumptions.waccSpecificRiskPremium}
          onChange={(value) => onChange("waccSpecificRiskPremium", value)}
        />
        <AssumptionInput
          label="Fallback beta (jika beta pembanding tidak lengkap)"
          value={assumptions.waccBeta}
          note="Dipakai hanya jika beta relevered dari pembanding tidak tersedia; isi dengan beta manual yang memiliki sumber dan justifikasi penilai."
          onChange={(value) => onChange("waccBeta", value)}
        />
      </div>
      <WaccComparableTable
        assumptions={assumptions}
        comparableBeta={comparableBeta}
        companySector={companySector}
        comparableOptions={comparableOptions}
        comparableSuggestions={comparableSuggestions}
        onChange={onChange}
        onComparableNameChange={onComparableNameChange}
        onApplyComparableSuggestions={onApplyComparableSuggestions}
      />
      <div className="calculator-input-grid">
        <AssumptionInput
          label="Debt rate Bank Persero"
          value={assumptions.waccBankPerseroInvestmentLoanRate}
          note="Saran sistem memakai rata-rata tahunan SBDK korporasi OJK sebagai proxy pre-tax debt rate."
          onChange={(value) => onChange("waccBankPerseroInvestmentLoanRate", value)}
        />
        <AssumptionInput
          label="Debt rate Bank Pemda"
          value={assumptions.waccBankPemdaInvestmentLoanRate}
          onChange={(value) => onChange("waccBankPemdaInvestmentLoanRate", value)}
        />
        <AssumptionInput
          label="Debt rate Bank Swasta"
          value={assumptions.waccBankSwastaInvestmentLoanRate}
          note="Saran sistem memakai rata-rata tahunan SBDK korporasi OJK untuk bank non-Persero."
          onChange={(value) => onChange("waccBankSwastaInvestmentLoanRate", value)}
        />
        <AssumptionInput
          label="Debt rate Bank Asing"
          value={assumptions.waccBankAsingInvestmentLoanRate}
          onChange={(value) => onChange("waccBankAsingInvestmentLoanRate", value)}
        />
        <AssumptionInput
          label="Debt rate Bank Campuran"
          value={assumptions.waccBankCampuranInvestmentLoanRate}
          onChange={(value) => onChange("waccBankCampuranInvestmentLoanRate", value)}
        />
        <AssumptionInput
          label="Debt rate Bank Umum / proxy"
          value={assumptions.waccBankUmumInvestmentLoanRate}
          note="Dipakai untuk smart suggestion tiga-rate bila input granular workbook lima bank belum tersedia."
          onChange={(value) => onChange("waccBankUmumInvestmentLoanRate", value)}
        />
        <AssumptionInput
          label="Override pre-tax cost of debt"
          value={assumptions.waccPreTaxCostOfDebt}
          onChange={(value) => onChange("waccPreTaxCostOfDebt", value)}
        />
      </div>
      <WaccCapitalStructureTable assumptions={assumptions} calculation={calculation} autoCapitalValues={autoCapitalValues} onChange={onChange} />
      <DiscountRateAnalysisPanel assumptions={assumptions} calculation={calculation} bankLoanRate={bankLoanRate} />
      <MetricTraceGrid
        metrics={[
          ["Beta terpakai", calculation ? formatNumber(calculation.beta) : "Belum dihitung"],
          ["Cost of equity", calculation ? formatPercent(calculation.costOfEquity) : "Belum dihitung"],
          ["Pre-tax cost of debt", calculation ? formatPercent(calculation.preTaxCostOfDebt) : "Belum dihitung"],
          ["After-tax cost of debt", calculation ? formatPercent(calculation.afterTaxCostOfDebt) : "Belum dihitung"],
          ["Formula", "E/(D+E) x Ke + D/(D+E) x Kd(1-t)"],
        ]}
      />
      <ReferenceList references={waccInputReferences} />
      <AssumptionReasonField
        id="assumption-wacc-support"
        label="Bukti / dasar pendukung"
        placeholder="Sumber risk-free rate, beta, ERP, debt rate, dan bobot struktur modal."
        value={assumptions.waccOverrideReason}
        onChange={onReasonChange}
      />
    </article>
  );
}

function WaccComparableTable({
  assumptions,
  comparableBeta,
  companySector,
  comparableOptions,
  comparableSuggestions,
  onChange,
  onComparableNameChange,
  onApplyComparableSuggestions,
}: {
  assumptions: AssumptionState;
  comparableBeta: WaccComparableBetaCalculation;
  companySector: string;
  comparableOptions: IdxComparableCompany[];
  comparableSuggestions: IdxComparableCompany[];
  onChange: (key: keyof AssumptionState, value: string) => void;
  onComparableNameChange: (slot: WaccComparableSlot, value: string) => void;
  onApplyComparableSuggestions: () => void;
}) {
  return (
    <div className="wacc-comparable-block" data-testid="wacc-comparable-table">
      <div className="wacc-comparable-toolbar">
        <div>
          <strong>Perusahaan Pembanding</strong>
          <span>
            {companySector
              ? `${companySector} · ${comparableOptions.length} emiten tersedia · ${comparableSuggestions.length} prioritas ideal/moderat`
              : "Isi KLU sesuai Appportal di Data Awal"}
          </span>
        </div>
        <button className="button ghost compact-button" type="button" onClick={onApplyComparableSuggestions} disabled={comparableSuggestions.length === 0}>
          Terapkan Saran
        </button>
      </div>
      <div className="table-wrap wacc-model-table">
        <table>
          <thead>
            <tr>
              <th>Perusahaan Pembanding</th>
              <th>BL</th>
              <th>Market cap</th>
              <th>Debt</th>
              <th>BU</th>
            </tr>
          </thead>
          <tbody>
            {waccComparableSlots.map((keys, index) => {
              const row = comparableBeta.rows[index];

              return (
                <tr key={keys.name}>
                  <td>
                    <ComparableNameInput
                      index={index + 1}
                      value={assumptions[keys.name]}
                      options={comparableOptions}
                      onChange={(value) => onComparableNameChange(keys, value)}
                    />
                  </td>
                  <td>
                    <AssumptionInput label={`BL ${index + 1}`} value={assumptions[keys.beta]} onChange={(value) => onChange(keys.beta, value)} />
                  </td>
                  <td>
                    <AssumptionInput
                      label={`Market cap ${index + 1}`}
                      value={assumptions[keys.marketCap]}
                      onChange={(value) => onChange(keys.marketCap, value)}
                    />
                  </td>
                  <td>
                    <AssumptionInput label={`Debt ${index + 1}`} value={assumptions[keys.debt]} onChange={(value) => onChange(keys.debt, value)} />
                  </td>
                  <td className="numeric-cell">{row?.unleveredBeta !== null && row?.unleveredBeta !== undefined ? formatNumber(row.unleveredBeta) : "Belum dihitung"}</td>
                </tr>
              );
            })}
            <tr className="total-row">
              <td>Rata-rata / Relevered Beta</td>
              <td>{comparableBeta.averageUnleveredBeta !== null ? formatNumber(comparableBeta.averageUnleveredBeta) : "Belum dihitung"}</td>
              <td colSpan={2}>
                {comparableBeta.capitalWeights
                  ? `${formatPercent(comparableBeta.capitalWeights.debtWeight)} utang / ${formatPercent(comparableBeta.capitalWeights.equityWeight)} ekuitas`
                  : "Bobot struktur kapital belum tersedia."}
              </td>
              <td className="numeric-cell">{comparableBeta.releveredBeta !== null ? formatNumber(comparableBeta.releveredBeta) : "Belum dihitung"}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ComparableNameInput({
  index,
  value,
  options,
  onChange,
}: {
  index: number;
  value: string;
  options: IdxComparableCompany[];
  onChange: (value: string) => void;
}) {
  const inputId = `assumption-comparable-${index}`;
  const listId = `${inputId}-options`;

  return (
    <label className="field" htmlFor={inputId}>
      <span>{`Pembanding ${index}`}</span>
      <input
        id={inputId}
        list={listId}
        placeholder="Pilih emiten sektor yang sama"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      <datalist id={listId}>
        {options.map((company) => {
          const label = formatIdxComparableLabel(company);
          return <option value={label} key={`${company.sector}-${company.comparable}-${company.quality}`} />;
        })}
      </datalist>
      {value.trim() ? <small className="comparable-selected-label">{value}</small> : null}
    </label>
  );
}

function WaccCapitalStructureTable({
  assumptions,
  calculation,
  autoCapitalValues,
  onChange,
}: {
  assumptions: AssumptionState;
  calculation: WaccCalculation | null;
  autoCapitalValues: AutoWaccCapitalValues;
  onChange: (key: keyof AssumptionState, value: string) => void;
}) {
  const debtMarketValue = assumptions.waccDebtMarketValue.trim() || formatAutoCapitalValue(autoCapitalValues.debtMarketValue);
  const equityMarketValue = assumptions.waccEquityMarketValue.trim() || formatAutoCapitalValue(autoCapitalValues.equityMarketValue);
  const debtWeightInput = assumptions.waccDebtWeight.trim() || formatAutoCapitalWeight(calculation?.debtWeight);
  const equityWeightInput = assumptions.waccEquityWeight.trim() || formatAutoCapitalWeight(calculation?.equityWeight);
  const isDebtAuto = !assumptions.waccDebtMarketValue.trim() && autoCapitalValues.debtMarketValue > 0;
  const isEquityAuto = !assumptions.waccEquityMarketValue.trim() && autoCapitalValues.equityMarketValue > 0;
  const debtWeightNote = buildAutoCapitalWeightNote(assumptions.waccDebtWeight, calculation?.debtWeight);
  const equityWeightNote = buildAutoCapitalWeightNote(assumptions.waccEquityWeight, calculation?.equityWeight);

  return (
    <div className="table-wrap wacc-model-table" data-testid="wacc-capital-structure-table">
      <table>
        <thead>
          <tr>
            <th>Struktur Kapital</th>
            <th>Nilai</th>
            <th>Bobot (%) Pasar</th>
            <th>Biaya Mdl (%)</th>
            <th>WACC</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Hutang</td>
            <td>
              <AssumptionInput label="Nilai pasar utang" value={debtMarketValue} onChange={(value) => onChange("waccDebtMarketValue", value)} />
              {isDebtAuto ? <small className="auto-source-note">Auto Neraca: liabilitas lancar + liabilitas tidak lancar.</small> : null}
            </td>
            <td>
              <AssumptionInput label="Fallback bobot utang" value={debtWeightInput} note={debtWeightNote} onChange={(value) => onChange("waccDebtWeight", value)} />
            </td>
            <td>{calculation ? formatPercent(calculation.afterTaxCostOfDebt) : "Belum dihitung"}</td>
            <td>{calculation ? formatPercent(calculation.debtWeight * calculation.afterTaxCostOfDebt) : "Belum dihitung"}</td>
          </tr>
          <tr>
            <td>Ekuitas</td>
            <td>
              <AssumptionInput label="Nilai pasar ekuitas" value={equityMarketValue} onChange={(value) => onChange("waccEquityMarketValue", value)} />
              {isEquityAuto ? <small className="auto-source-note">Auto Neraca: book equity aktif.</small> : null}
            </td>
            <td>
              <AssumptionInput label="Fallback bobot ekuitas" value={equityWeightInput} note={equityWeightNote} onChange={(value) => onChange("waccEquityWeight", value)} />
            </td>
            <td>{calculation ? formatPercent(calculation.costOfEquity) : "Belum dihitung"}</td>
            <td>{calculation ? formatPercent(calculation.equityWeight * calculation.costOfEquity) : "Belum dihitung"}</td>
          </tr>
          <tr className="total-row">
            <td>Biaya Modal Rata-rata Tertimbang (WACC)</td>
            <td colSpan={3}>Hutang + Ekuitas</td>
            <td>{calculation ? formatPercent(calculation.wacc) : formatRateInput(assumptions.wacc)}</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function DiscountRateAnalysisPanel({
  assumptions,
  calculation,
  bankLoanRate,
}: {
  assumptions: AssumptionState;
  calculation: WaccCalculation | null;
  bankLoanRate: WaccBankLoanRateCalculation | null;
}) {
  const taxRate = parseRateInput(assumptions.taxRate);
  const riskFreeRate = parseRateInput(assumptions.waccRiskFreeRate);
  const betaInput = assumptions.waccBeta.trim() ? parseInputNumber(assumptions.waccBeta) : calculation?.beta ?? null;
  const equityRiskPremium = parseRateInput(assumptions.waccEquityRiskPremium);
  const ratingBasedDefaultSpread = parseRateInput(assumptions.waccRatingBasedDefaultSpread);
  const explicitDebtRate = parseRateInput(assumptions.waccPreTaxCostOfDebt);
  const isMarketSuggestionApplied = assumptions.waccSource.startsWith("market-suggestion");
  const debtToEquity = calculation && calculation.equityWeight > 0 ? calculation.debtWeight / calculation.equityWeight : null;
  const unleveredBeta = calculation && taxRate !== null && debtToEquity !== null ? calculation.beta / (1 + (1 - taxRate) * debtToEquity) : null;
  const debtComponent = calculation ? calculation.debtWeight * calculation.afterTaxCostOfDebt : null;
  const equityComponent = calculation ? calculation.equityWeight * calculation.costOfEquity : null;
  const terminalGrowth = parseRateInput(assumptions.terminalGrowth);
  const workbookDebtFormula = bankLoanRate?.basis === "workbook-five-bank" ? "ROUND(AVERAGE(L6:L10)/100,3)" : "ROUND(average input bank rate,3)";
  const debtRateNote = explicitDebtRate !== null && !isMarketSuggestionApplied
    ? "Override pre-tax cost of debt aktif; bank average tetap ditampilkan sebagai cross-check."
    : bankLoanRate
      ? `${bankLoanRate.basisLabel}: rata-rata mentah ${formatPrecisePercent(bankLoanRate.rawAverageRate, 3)} dan nilai WACC ${formatPercent(bankLoanRate.roundedRate)}.`
      : "Lengkapi debt rate atau input pinjaman investasi bank.";
  const debtRateSource =
    explicitDebtRate !== null && !isMarketSuggestionApplied
      ? "Override manual"
      : isMarketSuggestionApplied
        ? "Saran sistem diterapkan"
        : "Saran sistem / input bank";
  const rows = [
    {
      component: "Tax rate",
      workbookRef: "C2",
      workbookFormula: "Input tarif pajak",
      method: "Tarif pajak aktif dipakai untuk relevering beta dan menghitung biaya utang setelah pajak.",
      value: formatOptionalRate(taxRate),
      source: "Input penilai / saran pajak",
      note: "Interoperable dengan asumsi pajak tahunan yang tersedia di sistem.",
    },
    {
      component: "Risk free",
      workbookRef: "C3",
      workbookFormula: "Input risk-free rate",
      method: "Tingkat bebas risiko menjadi basis awal cost of equity sebelum premi risiko ekuitas.",
      value: formatOptionalRate(riskFreeRate),
      source: "Input penilai / saran pasar",
      note: "Gunakan yield SUN pada tanggal penilaian bila tersedia.",
    },
    {
      component: "Beta",
      workbookRef: "C4 / H2",
      workbookFormula: "BL = BU x (1 + (1 - t) x DER)",
      method: "Beta aktif berasal dari pembanding sektor yang dire-lever sesuai struktur kapital; fallback manual hanya dipakai bila data pembanding belum lengkap.",
      value: formatOptionalNumber(betaInput),
      source: "Hasil pembanding / input manual",
      note: "Nama formula workbook disimpan di detail audit.",
    },
    {
      component: "Equity risk premium",
      workbookRef: "C5",
      workbookFormula: "Input ERP",
      method: "Premi risiko ekuitas dikalikan beta untuk mengukur tambahan return ekuitas.",
      value: formatOptionalRate(equityRiskPremium),
      source: "Input penilai / saran pasar",
      note: "Saran sistem memakai referensi Damodaran/NYU karena tidak tersedia sebagai tarif pemerintah.",
    },
    {
      component: "RBDS adjustment",
      workbookRef: "C6",
      workbookFormula: "Ke = Rf + Beta x ERP - RBDS",
      method: "Cost of equity mengikuti parity workbook: risk-free rate ditambah beta dikali ERP, lalu dikurangi rating-based default spread adjustment.",
      value: formatOptionalRate(ratingBasedDefaultSpread),
      source: "Input penilai / saran pasar",
      note: "Override treatment wajib diberi dasar profesional.",
    },
    {
      component: "Debt rate",
      workbookRef: "C7 / L11",
      workbookFormula: workbookDebtFormula,
      method: "Jika override kosong, sistem memakai rata-rata debt rate bank yang tersedia lalu membulatkannya sesuai workbook.",
      value: formatOptionalRate(explicitDebtRate ?? calculation?.preTaxCostOfDebt ?? null),
      source: debtRateSource,
      note: debtRateNote,
    },
    {
      component: "DER industry",
      workbookRef: "C8",
      workbookFormula: "D/E = debt weight / equity weight",
      method: "Rasio utang terhadap ekuitas diturunkan dari bobot struktur modal aktif.",
      value: formatOptionalNumber(debtToEquity),
      source: "Hasil formula",
      note: "Mengikuti bobot pasar WACC yang sedang aktif.",
    },
    {
      component: "Unlevered beta",
      workbookRef: "H1",
      workbookFormula: "BU = BL / (1 + (1 - t) x DER)",
      method: "Beta tidak berutang dihitung ulang dari beta aktif, pajak, dan struktur kapital.",
      value: formatOptionalNumber(unleveredBeta),
      source: "Hasil formula",
      note: "Ditampilkan untuk parity dengan sheet DISCOUNT RATE.",
    },
    {
      component: "Cost of equity",
      workbookRef: "H3 / C9",
      workbookFormula: "Ke = C3 + (H2 x C5) - C6",
      method: "Return ekuitas dihitung dari risk-free rate, beta, ERP, dan penyesuaian default spread.",
      value: formatOptionalRate(calculation?.costOfEquity ?? null),
      source: "Hasil formula",
      note: "Nilai ini juga menjadi basis return ekuitas NTA bila disarankan.",
    },
    {
      component: "After-tax cost of debt",
      workbookRef: "H4 / C10",
      workbookFormula: "Kd = debt rate x (1 - tax rate)",
      method: "Biaya utang setelah pajak dihitung dari debt rate aktif setelah efek tax shield.",
      value: formatOptionalRate(calculation?.afterTaxCostOfDebt ?? null),
      source: "Hasil formula",
      note: "Konsisten dengan EEM/DCF dan required return on NTA.",
    },
    {
      component: "Debt weight",
      workbookRef: "F7",
      workbookFormula: "DER / (1 + DER)",
      method: "Bobot utang memakai struktur kapital pasar atau fallback penilai.",
      value: formatOptionalRate(calculation?.debtWeight ?? null),
      source: "Hasil formula / input manual",
      note: "Dipakai untuk kontribusi WACC sisi utang.",
    },
    {
      component: "Equity weight",
      workbookRef: "F8",
      workbookFormula: "1 - debt weight",
      method: "Bobot ekuitas adalah sisa struktur kapital setelah bobot utang.",
      value: formatOptionalRate(calculation?.equityWeight ?? null),
      source: "Hasil formula / input manual",
      note: "Dipakai untuk kontribusi WACC sisi ekuitas.",
    },
    {
      component: "Debt WACC",
      workbookRef: "H7",
      workbookFormula: "F7 x G7",
      method: "Kontribusi utang dihitung dari bobot utang dikali after-tax cost of debt.",
      value: formatOptionalRate(debtComponent),
      source: "Hasil formula",
      note: "Komponen pembentuk WACC final.",
    },
    {
      component: "Equity WACC",
      workbookRef: "H8",
      workbookFormula: "F8 x G8",
      method: "Kontribusi ekuitas dihitung dari bobot ekuitas dikali cost of equity.",
      value: formatOptionalRate(equityComponent),
      source: "Hasil formula",
      note: "Komponen pembentuk WACC final.",
    },
    {
      component: "WACC",
      workbookRef: "H10 / C11",
      workbookFormula: "Debt WACC + Equity WACC",
      method: "WACC adalah penjumlahan kontribusi biaya modal utang dan ekuitas.",
      value: formatOptionalRate(calculation?.wacc ?? parseRateInput(assumptions.wacc)),
      source: "Hasil formula / override WACC",
      note: "Mengalir ke EEM capitalization rate dan DCF discount rate.",
    },
    {
      component: "Growth reference",
      workbookRef: "C12",
      workbookFormula: "Linked growth reference",
      method: "Terminal growth ditampilkan sebagai referensi interoperabilitas untuk DCF, bukan input pembentuk WACC.",
      value: formatOptionalRate(terminalGrowth),
      source: "Input DCF / saran sektor",
      note: "Tetap dipantau karena WACC harus lebih besar dari terminal growth.",
    },
  ];

  return (
    <section className="discount-rate-analysis-card" data-testid="discount-rate-analysis">
      <div className="discount-rate-heading">
        <div>
          <span>Discount Rate Analysis (CAPM)</span>
          <strong>Ringkasan perhitungan WACC berbasis CAPM</strong>
        </div>
        <small>Formula source-of-truth tetap workbook UPDATE, sheet DISCOUNT RATE; detail teknis tersedia di audit.</small>
      </div>
      <div className="bank-loan-rate-strip" aria-label="Ringkasan debt rate pinjaman investasi">
        {bankLoanRate ? (
          <>
            <div>
              <span>Dasar debt rate</span>
              <strong>{bankLoanRate.basisLabel}</strong>
            </div>
            <div>
              <span>Rata-rata mentah</span>
              <strong>{formatPrecisePercent(bankLoanRate.rawAverageRate, 3)}</strong>
            </div>
            <div>
              <span>Nilai untuk WACC</span>
              <strong>{formatPercent(bankLoanRate.roundedRate)}</strong>
            </div>
          </>
        ) : (
          <div>
            <span>Dasar debt rate</span>
            <strong>Belum ada input pinjaman investasi bank</strong>
          </div>
        )}
      </div>
      <div className="table-wrap discount-rate-trace-table">
        <table>
          <thead>
            <tr>
              <th>Komponen</th>
              <th>Metode</th>
              <th>Nilai aktif</th>
              <th>Status & sumber</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.component}>
                <td>
                  <strong>{row.component}</strong>
                  <span>{row.note}</span>
                </td>
                <td>{row.method}</td>
                <td className="numeric-cell">{row.value}</td>
                <td>{row.source}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {bankLoanRate ? (
        <div className="table-wrap discount-rate-bank-table">
          <table>
            <thead>
              <tr>
                <th>Basis debt rate</th>
                <th>Status</th>
                <th className="numeric-cell">Nilai aktif</th>
              </tr>
            </thead>
            <tbody>
              {bankLoanRate.rows.map((row) => (
                <tr key={row.key}>
                  <td>{row.label}</td>
                  <td>{row.sourceCell === "Sistem" ? "Saran sistem / input aktif" : "Workbook DISCOUNT RATE"}</td>
                  <td className="numeric-cell">{formatOptionalRate(row.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
      <details className="audit-disclosure compact workbook-audit-disclosure">
        <summary>Detail audit workbook</summary>
        <div className="table-wrap discount-rate-audit-table">
          <table>
            <thead>
              <tr>
                <th>Komponen</th>
                <th>Referensi workbook</th>
                <th>Formula teknis</th>
                <th>Catatan audit</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={`${row.component}-audit`}>
                  <td>{row.component}</td>
                  <td>
                    <code>{row.workbookRef}</code>
                  </td>
                  <td>
                    <code>{row.workbookFormula}</code>
                  </td>
                  <td>{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {bankLoanRate ? (
          <div className="table-wrap discount-rate-audit-table">
            <table>
              <thead>
                <tr>
                  <th>Input debt rate</th>
                  <th>Referensi teknis</th>
                  <th className="numeric-cell">Nilai aktif</th>
                </tr>
              </thead>
              <tbody>
                {bankLoanRate.rows.map((row) => (
                  <tr key={`${row.key}-audit`}>
                    <td>{row.label}</td>
                    <td>
                      <code>{row.sourceCell}</code>
                    </td>
                    <td className="numeric-cell">{formatOptionalRate(row.value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </details>
    </section>
  );
}

function TerminalGrowthPanel({
  assumptions,
  wacc,
  suggestion,
  governance,
  onChange,
  onApplySuggestion,
  onReasonChange,
}: {
  assumptions: AssumptionState;
  wacc: number;
  suggestion: TerminalGrowthSuggestion | null;
  governance: AssumptionGovernanceResult;
  onChange: (key: keyof AssumptionState, value: string) => void;
  onApplySuggestion: (suggestion: TerminalGrowthSuggestion) => void;
  onReasonChange: (value: string) => void;
}) {
  const baseGrowth = readRateInput(assumptions.terminalGrowth);
  const hasInvalidSpread = baseGrowth !== null && wacc > 0 && baseGrowth >= wacc;
  const assumptionGovernanceItems = governance.items.filter((item) => item.target === "eemDcfAssumptions");

  return (
    <article className="assumption-calculator-card wide" data-testid="terminal-growth-calculator">
      <AssumptionCalculatorHeader
        label="Tata kelola terminal growth"
        value={formatRateInput(assumptions.terminalGrowth)}
        impact="DCF terminal value dan EEM capitalization spread"
      />
      <InlineGovernanceList title="Tata kelola asumsi EEM/DCF" items={assumptionGovernanceItems} />
      <TerminalGrowthSuggestionBlock suggestion={suggestion} onApply={onApplySuggestion} />
      <div className="calculator-input-grid">
        <AssumptionInput label="Terminal growth dasar" value={assumptions.terminalGrowth} onChange={(value) => onChange("terminalGrowth", value)} />
        <AssumptionInput
          label="Terminal growth skenario bawah"
          value={assumptions.terminalGrowthDownside}
          onChange={(value) => onChange("terminalGrowthDownside", value)}
        />
        <AssumptionInput
          label="Terminal growth skenario atas"
          value={assumptions.terminalGrowthUpside}
          onChange={(value) => onChange("terminalGrowthUpside", value)}
        />
      </div>
      <MetricTraceGrid
        metrics={[
          ["Spread WACC", baseGrowth !== null && wacc > 0 ? formatPercent(wacc - baseGrowth) : "Belum dihitung"],
          ["Validasi", hasInvalidSpread ? "Terminal growth harus di bawah WACC" : "Spread valid bila WACC tersedia"],
          ["Formula", "Nilai terminal = FCFF final x (1 + g) / (WACC - g)"],
        ]}
      />
      <ReferenceList references={terminalGrowthInputReferences} />
      <AssumptionReasonField
        id="assumption-terminal-growth-support"
        label="Basis asumsi"
        placeholder="Dasar long-term growth, industri, inflasi, reinvestment, atau scenario memo."
        value={assumptions.terminalGrowthOverrideReason}
        onChange={onReasonChange}
      />
      {hasInvalidSpread ? <small className="field-warning">Terminal growth base tidak boleh sama dengan atau lebih tinggi dari WACC.</small> : null}
    </article>
  );
}

function TerminalGrowthSuggestionBlock({
  suggestion,
  onApply,
}: {
  suggestion: TerminalGrowthSuggestion | null;
  onApply: (suggestion: TerminalGrowthSuggestion) => void;
}) {
  if (!suggestion) {
    return (
      <div className="terminal-growth-suggestion" data-testid="terminal-growth-suggestion-card">
        <div className="terminal-growth-suggestion-heading">
          <div>
        <span>Saran otomatis</span>
            <strong>Bukti sektor belum tersedia</strong>
          </div>
          <em className="source-badge manual">Menunggu sektor</em>
        </div>
        <p className="assumption-empty-note">Saran muncul setelah sektor perusahaan sesuai klasifikasi IDX tersedia di Data Awal.</p>
      </div>
    );
  }

  const { evidence } = suggestion;

  return (
    <div className="terminal-growth-suggestion" data-testid="terminal-growth-suggestion-card">
      <div className="terminal-growth-suggestion-heading">
        <div>
          <span>Saran otomatis</span>
          <strong>{evidence.sector}</strong>
        </div>
        <em className="source-badge sensitivity">
          {suggestion.confidence} evidence
        </em>
      </div>
      <div className="terminal-growth-suggestion-grid" aria-label="Bukti sektor terminal growth">
        <div>
          <span>Base</span>
          <strong>{formatPercent(suggestion.baseGrowth)}</strong>
          <small>{suggestion.quality} kasus sektor</small>
        </div>
        <div>
          <span>Downside</span>
          <strong>{formatPercent(suggestion.downsideGrowth)}</strong>
          <small>Band stres</small>
        </div>
        <div>
          <span>Upside</span>
          <strong>{formatPercent(suggestion.upsideGrowth)}</strong>
          <small>Dibatasi di bawah WACC</small>
        </div>
        <div>
          <span>Kelompok pembanding</span>
          <strong>
            {evidence.validCompanies}/{evidence.totalCompanies}
          </strong>
          <small>{formatPercent(evidence.positiveProfitRatio)} laba positif</small>
        </div>
        <div>
          <span>Median margin laba bersih</span>
          <strong>{formatPercent(evidence.medianNetMargin)}</strong>
          <small>
            IQR {formatPercent(evidence.p25NetMargin)} - {formatPercent(evidence.p75NetMargin)}
          </small>
        </div>
        <div>
          <span>Target vs sektor</span>
          <strong>{suggestion.companyRevenueScale === null ? "N/A" : `${formatNumber(suggestion.companyRevenueScale)}x`}</strong>
          <small>Skala revenue</small>
        </div>
      </div>
      <dl className="driver-trace">
        <div>
          <dt>Sumber</dt>
          <dd>{suggestion.source}</dd>
        </div>
        <div>
          <dt>Basis</dt>
          <dd>{suggestion.reason}</dd>
        </div>
      </dl>
      <button className="button secondary" type="button" onClick={() => onApply(suggestion)}>
        <CheckCircle2 size={18} />
        Gunakan saran sektor
      </button>
    </div>
  );
}

function RequiredReturnOnNtaPanel({
  assumptions,
  calculation,
  suggestion,
  balances,
  governance,
  onChange,
  onReasonChange,
}: {
  assumptions: AssumptionState;
  calculation: RequiredReturnOnNtaCalculation | null;
  suggestion: RequiredReturnOnNtaSuggestion;
  balances: { accountReceivable: number; inventory: number; fixedAssetsNet: number };
  governance: AssumptionGovernanceResult;
  onChange: (key: keyof AssumptionState, value: string) => void;
  onReasonChange: (value: string) => void;
}) {
  const suggestedValue = (key: RequiredReturnOnNtaSuggestionKey) => formatRequiredReturnSuggestionInput(suggestion.fields[key]);
  const ntaGovernanceItems = governance.items.filter((item) => item.id === "nta-return-fallback");

  return (
    <article className="assumption-calculator-card wide" data-testid="required-return-on-nta-calculator">
      <AssumptionCalculatorHeader
        label="Kalkulator required return on NTA"
        value={calculation ? formatPercent(calculation.requiredReturn) : formatRateInput(assumptions.requiredReturnOnNta)}
        impact="EEM capital charge atas operating net tangible assets"
      />
      <InlineGovernanceList title="Tata kelola return NTA" items={ntaGovernanceItems} />
      <div className="driver-basis-strip">
        <div>
          <span>Piutang usaha</span>
          <strong>{formatIdr(balances.accountReceivable)}</strong>
        </div>
        <div>
          <span>Persediaan</span>
          <strong>{formatIdr(balances.inventory)}</strong>
        </div>
        <div>
          <span>Aset tetap neto</span>
          <strong>{formatIdr(balances.fixedAssetsNet)}</strong>
        </div>
      </div>
      <RequiredReturnOnNtaSuggestionBlock suggestion={suggestion} />
      <div className="calculator-input-grid">
        <AssumptionInput
          label="Kapasitas piutang"
          value={assumptions.requiredReturnReceivablesCapacity}
          suggestion={buildRequiredReturnInputSuggestion(suggestion.fields.requiredReturnReceivablesCapacity, "rate")}
          note={buildSuggestionInputNote(assumptions.requiredReturnReceivablesCapacity, suggestion.fields.requiredReturnReceivablesCapacity)}
          onChange={(value) => onChange("requiredReturnReceivablesCapacity", value)}
          onApplySuggestion={(value) => onChange("requiredReturnReceivablesCapacity", value)}
        />
        <AssumptionInput
          label="Kapasitas persediaan"
          value={assumptions.requiredReturnInventoryCapacity}
          suggestion={buildRequiredReturnInputSuggestion(suggestion.fields.requiredReturnInventoryCapacity, "rate")}
          note={buildSuggestionInputNote(assumptions.requiredReturnInventoryCapacity, suggestion.fields.requiredReturnInventoryCapacity)}
          onChange={(value) => onChange("requiredReturnInventoryCapacity", value)}
          onApplySuggestion={(value) => onChange("requiredReturnInventoryCapacity", value)}
        />
        <AssumptionInput
          label="Kapasitas aset tetap"
          value={assumptions.requiredReturnFixedAssetCapacity}
          suggestion={buildRequiredReturnInputSuggestion(suggestion.fields.requiredReturnFixedAssetCapacity, "rate")}
          note={buildSuggestionInputNote(assumptions.requiredReturnFixedAssetCapacity, suggestion.fields.requiredReturnFixedAssetCapacity)}
          onChange={(value) => onChange("requiredReturnFixedAssetCapacity", value)}
          onApplySuggestion={(value) => onChange("requiredReturnFixedAssetCapacity", value)}
        />
        <AssumptionInput
          label="Jumlah kapasitas tambahan"
          value={assumptions.requiredReturnAdditionalCapacity}
          suggestion={buildRequiredReturnInputSuggestion(suggestion.fields.requiredReturnAdditionalCapacity, "number")}
          note={buildSuggestionInputNote(assumptions.requiredReturnAdditionalCapacity, suggestion.fields.requiredReturnAdditionalCapacity)}
          onChange={(value) => onChange("requiredReturnAdditionalCapacity", value)}
          onApplySuggestion={(value) => onChange("requiredReturnAdditionalCapacity", value)}
        />
        <AssumptionInput
          label="After-tax debt cost"
          value={assumptions.requiredReturnAfterTaxDebtCost || suggestedValue("requiredReturnAfterTaxDebtCost")}
          note={buildSuggestionInputNote(assumptions.requiredReturnAfterTaxDebtCost, suggestion.fields.requiredReturnAfterTaxDebtCost)}
          onChange={(value) => onChange("requiredReturnAfterTaxDebtCost", value)}
        />
        <AssumptionInput
          label="Return ekuitas aset berwujud"
          value={assumptions.requiredReturnEquityCost || suggestedValue("requiredReturnEquityCost")}
          note={buildSuggestionInputNote(assumptions.requiredReturnEquityCost, suggestion.fields.requiredReturnEquityCost)}
          onChange={(value) => onChange("requiredReturnEquityCost", value)}
        />
      </div>
      <MetricTraceGrid
        metrics={[
          ["Basis", calculation ? calculation.basisLabel : "Belum dihitung"],
          ["Basis aset berwujud", calculation ? formatIdr(calculation.tangibleAssetBase) : "Belum dihitung"],
          ["Kapasitas utang", calculation ? formatIdr(calculation.debtCapacity) : "Belum dihitung"],
          ["Bobot kapasitas", calculation ? `${formatPercent(calculation.debtWeight)} utang / ${formatPercent(calculation.equityWeight)} ekuitas` : "Belum dihitung"],
          ["Formula", calculation ? formatRequiredReturnFormulaLabel(calculation) : "Bobot utang x Kd + bobot ekuitas x Ke"],
        ]}
      />
      <ReferenceList references={requiredReturnOnNtaInputReferences} />
      <AssumptionReasonField
        id="assumption-required-return-support"
        label="Bukti / dasar pendukung"
        placeholder="Sumber capacity rate, biaya modal hutang, dan return ekuitas aset berwujud."
        value={assumptions.requiredReturnOnNtaOverrideReason}
        onChange={onReasonChange}
      />
    </article>
  );
}

function RequiredReturnOnNtaSuggestionBlock({ suggestion }: { suggestion: RequiredReturnOnNtaSuggestion }) {
  const suggestedFields = requiredReturnSuggestionOrder
    .map((key) => suggestion.fields[key])
    .filter((field): field is RequiredReturnOnNtaSuggestionField => Boolean(field));

  return (
    <div className="terminal-growth-suggestion required-return-suggestion" data-testid="required-return-suggestion-card">
      <div className="terminal-growth-suggestion-heading">
        <div>
          <span>Panduan input</span>
          <strong>Basis required return on NTA</strong>
        </div>
        <em className={`source-badge ${suggestion.waitingFor.length === 0 ? "manual" : "sensitivity"}`}>
          {suggestion.waitingFor.length === 0 ? "saran sistem" : "butuh input"}
        </em>
      </div>
      <p className="assumption-empty-note">{suggestion.summary}</p>
      <div className="terminal-growth-suggestion-grid required-return-suggestion-grid" aria-label="Saran otomatis required return on NTA">
        {suggestedFields.map((field) => (
          <div key={field.key}>
            <span>{field.label}</span>
            <strong>{formatRequiredReturnSuggestionDisplay(field)}</strong>
            <small>{field.basis}</small>
            <small>{field.formula}</small>
          </div>
        ))}
      </div>
      <dl className="driver-trace">
        <div>
          <dt>Input yang dibutuhkan</dt>
          <dd>Capacity rate untuk piutang, persediaan, dan aset tetap; tambahan kapasitas bila ada; Kd dan Ke dari WACC atau override beralasan.</dd>
        </div>
        <div>
          <dt>Status</dt>
          <dd>{suggestion.waitingFor.length > 0 ? suggestion.waitingFor.join(" ") : "Biaya modal tersedia dari WACC. Jika capacity evidence belum tersedia, struktur kapital WACC menjadi fallback."}</dd>
        </div>
      </dl>
    </div>
  );
}

function formatRequiredReturnFormulaLabel(calculation: RequiredReturnOnNtaCalculation): string {
  if (calculation.basis === "capacity_evidence") {
    return "Bobot utang kapasitas x Kd + bobot ekuitas x Ke";
  }

  if (calculation.basis === "wacc_capital_structure") {
    return "Bobot utang WACC x Kd + bobot ekuitas WACC x Ke";
  }

  return "100% ekuitas x Ke";
}

function AssumptionCalculatorHeader({ label, value, impact }: { label: string; value: string; impact?: string }) {
  return (
    <div className="assumption-calculator-heading">
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
      {impact ? <small>{impact}</small> : null}
    </div>
  );
}

function MetricTraceGrid({ metrics }: { metrics: Array<[string, string]> }) {
  return (
    <dl className="metric-trace-grid">
      {metrics.map(([label, value]) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function AamAdjustmentTable({
  title,
  lines,
  historicalTotal,
  adjustmentTotal,
  adjustedTotal,
  onUpdate,
}: {
  title: string;
  lines: AamAdjustmentLine[];
  historicalTotal: number;
  adjustmentTotal: number;
  adjustedTotal: number;
  onUpdate: (lineId: string, patch: Partial<AamAdjustmentState[string]>) => void;
}) {
  return (
    <div className="aam-adjustment-section" data-testid={`aam-adjustment-${slugifyLabel(title)}`}>
      <div className="subpanel-heading">
        <div>
          <span>{title}</span>
          <h4>{formatIdr(adjustedTotal)}</h4>
        </div>
        <small>{formatIdr(historicalTotal)} historis · {formatIdr(adjustmentTotal)} penyesuaian</small>
      </div>
      <div className="table-wrap aam-adjustment-table-wrap">
        <table className="aam-adjustment-table">
          <thead>
            <tr>
              <th>Kelompok</th>
              <th>Akun / pos</th>
              <th>Historis</th>
              <th>Penyesuaian</th>
              <th>Disesuaikan</th>
              <th>Catatan / alasan</th>
            </tr>
          </thead>
          <tbody>
            {lines.map((line) => (
              <tr className={line.requiresNote ? "aam-row-needs-note" : ""} key={line.id}>
                <td>
                  {line.section}
                  {line.isBridgeLine ? <span className="badge warning">Rekonsiliasi total</span> : null}
                </td>
                <td>
                  <strong>{line.label}</strong>
                  <span>{line.source}</span>
                </td>
                <td className="numeric-cell">{formatIdr(line.historical)}</td>
                <td>
                  <input
                    aria-label={`Penyesuaian ${line.label}`}
                    inputMode="decimal"
                    placeholder="0"
                    value={line.adjustmentInput}
                    onChange={(event) => onUpdate(line.id, { adjustment: event.target.value })}
                  />
                </td>
                <td className="numeric-cell">{formatIdr(line.adjusted)}</td>
                <td>
                  <textarea
                    aria-label={`Catatan ${line.label}`}
                    className={line.requiresNote ? "aam-note warning" : "aam-note"}
                    placeholder="Catatan jika ada adjustment"
                    value={line.note}
                    onChange={(event) => onUpdate(line.id, { note: event.target.value })}
                    rows={1}
                  />
                  {line.requiresNote ? <small className="field-warning">Catatan wajib untuk adjustment non-zero.</small> : null}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={2}>Total {title.toLowerCase()}</td>
              <td className="numeric-cell">{formatIdr(historicalTotal)}</td>
              <td className="numeric-cell">{formatIdr(adjustmentTotal)}</td>
              <td className="numeric-cell">{formatIdr(adjustedTotal)}</td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

function AamEquityReconciliation({ lines }: { lines: Array<{ label: string; value: number }> }) {
  return (
    <div className="aam-equity-reconciliation">
      {lines.map((line) => (
        <div key={line.label}>
          <span>{line.label}</span>
          <strong>{formatIdr(line.value)}</strong>
        </div>
      ))}
    </div>
  );
}

function InlineGovernanceList({ title, items }: { title: string; items: AssumptionGovernanceItem[] }) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="inline-governance-list">
      <strong>{title}</strong>
      {items.map((item) => (
        <div className={`inline-governance-item ${item.level}`} key={item.id}>
          {item.level === "ok" ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
          <span>{item.message}</span>
        </div>
      ))}
    </div>
  );
}

function AssumptionGovernanceCard({
  item,
  onNavigate,
}: {
  item: AssumptionGovernanceItem;
  onNavigate: (target: AssumptionGovernanceTarget) => void;
}) {
  return (
    <div className={`assumption-audit-item ${item.level}`}>
      {item.level === "ok" ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
      <div>
        <span>{item.label}</span>
        <strong>{item.valueLabel}</strong>
        <small>{item.message}</small>
        <small>{item.action}</small>
      </div>
      <button className="button ghost compact-button" type="button" onClick={() => onNavigate(item.target)}>
        Tinjau
      </button>
    </div>
  );
}

function ReferenceList({ references }: { references: AssumptionReference[] }) {
  return (
    <div className="assumption-reference-list">
      {references.map((reference) => (
        <div key={reference.label}>
          <span>{reference.label}</span>
          <small>{reference.treatment}</small>
        </div>
      ))}
    </div>
  );
}

function AssumptionReasonField({
  id,
  label,
  placeholder,
  value,
  onChange,
}: {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="field manual-reason-field" htmlFor={id}>
      <span>{label}</span>
      <textarea
        id={id}
        className="manual-reason-input"
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function AssumptionDriverCard({
  label,
  value,
  sourceId,
  reason,
  candidates,
  emptyCandidateText,
  manualHint,
  testIdSlug,
  onSelect,
  onValueChange,
  onReasonChange,
}: {
  label: string;
  value: string;
  sourceId: string;
  reason: string;
  candidates: AssumptionCandidate[];
  emptyCandidateText: string;
  manualHint: string;
  testIdSlug?: string;
  onSelect: (candidate: AssumptionCandidate) => void;
  onValueChange: (value: string) => void;
  onReasonChange: (value: string) => void;
}) {
  const activeCandidate = candidates.find((candidate) => candidate.id === sourceId);
  const isManual = sourceId.startsWith("manual-") || (value.trim() !== "" && !activeCandidate);
  const needsReason = isManual && value.trim() !== "" && reason.trim() === "";
  const inputId = `assumption-${slugifyLabel(label)}-manual`;
  const reasonId = `assumption-${slugifyLabel(label)}-reason`;

  return (
    <article className="assumption-driver-card" data-testid={`assumption-card-${testIdSlug ?? slugifyLabel(label)}`}>
      <div className="assumption-driver-heading">
        <div>
          <span>{label}</span>
          <strong>{formatRateInput(value)}</strong>
        </div>
        <em className={activeCandidate ? `source-badge ${activeCandidate.status}` : "source-badge manual"}>
          {activeCandidate?.status === "recommended" ? "Aktif" : activeCandidate?.status ?? "Manual"}
        </em>
      </div>
      <p className="assumption-source-line">{activeCandidate ? sourceLabel(activeCandidate) : sourceLabelFromManual(value)}</p>
      <div className="candidate-list" aria-label={`Kandidat ${label}`}>
        {candidates.length > 0 ? (
          candidates.map((candidate) => (
            <button
              className={candidate.id === sourceId ? "candidate-button active" : "candidate-button"}
              key={candidate.id}
              type="button"
              onClick={() => onSelect(candidate)}
            >
              <span>
                {candidate.label}
                {candidate.sourceCell ? <small>{candidate.sourceCell}</small> : null}
              </span>
              <strong>{formatPercent(candidate.value)}</strong>
            </button>
          ))
        ) : (
          <p className="assumption-empty-note">{emptyCandidateText}</p>
        )}
      </div>
      <dl className="driver-trace">
        <div>
          <dt>Formula</dt>
          <dd>{activeCandidate?.formula ?? "Override manual"}</dd>
        </div>
        <div>
          <dt>Catatan</dt>
          <dd>{activeCandidate?.note ?? manualHint}</dd>
        </div>
      </dl>
      <label className="field manual-driver-field" htmlFor={inputId}>
        <span>Override manual</span>
        <input
          id={inputId}
          inputMode="decimal"
          placeholder="Opsional"
          value={value}
          onChange={(event) => onValueChange(event.target.value)}
          aria-describedby={isManual ? reasonId : undefined}
        />
      </label>
      {isManual ? (
        <label className="field manual-reason-field" htmlFor={reasonId}>
          <span>Alasan override</span>
          <textarea
            id={reasonId}
            className="manual-reason-input"
            placeholder={manualHint}
            value={reason}
            onChange={(event) => onReasonChange(event.target.value)}
          />
          {needsReason ? <small className="field-warning">Alasan wajib diisi untuk override manual.</small> : null}
        </label>
      ) : null}
    </article>
  );
}

function DriverOverrideGuidance() {
  return (
    <div className="driver-override-guidance" data-testid="driver-override-guidance">
      <strong>Override opsional, bukan angka wajib</strong>
      <span>
        Kosongkan driver di bawah untuk memakai fallback sistem dari data historis aktif. Isi hanya jika ada dasar yang lebih kuat, seperti
        proyeksi manajemen, kontrak, data industri, atau analisis penilai.
      </span>
    </div>
  );
}

type OptionalDriverSuggestionKind = "number" | "rate";

type OptionalDriverSuggestion = {
  value: string;
  displayValue: string;
  kind: OptionalDriverSuggestionKind;
};

function AssumptionInput({
  label,
  value,
  note,
  suggestion,
  onChange,
  onApplySuggestion,
}: {
  label: string;
  value: string;
  note?: string;
  suggestion?: OptionalDriverSuggestion;
  onChange: (value: string) => void;
  onApplySuggestion?: (value: string) => void;
}) {
  const inputId = `assumption-${slugifyLabel(label)}`;
  const hasSuggestion = Boolean(suggestion?.value.trim() && onApplySuggestion);
  const isSuggestionApplied =
    hasSuggestion && suggestion ? isOptionalDriverSuggestionApplied(value, suggestion.value, suggestion.kind) : false;

  return (
    <div className="field assumption-input-field">
      <div className="assumption-input-heading">
        <label htmlFor={inputId}>{label}</label>
        {hasSuggestion && suggestion && onApplySuggestion ? (
          <button
            className="suggestion-apply-button"
            type="button"
            onClick={() => onApplySuggestion(suggestion.value)}
            disabled={isSuggestionApplied}
            title={isSuggestionApplied ? `${suggestion.displayValue} sudah dipakai` : `Isi dengan ${suggestion.displayValue}`}
            aria-label={isSuggestionApplied ? `Nilai sistem sudah dipakai untuk ${label}` : `Gunakan nilai sistem untuk ${label}`}
          >
            <CheckCircle2 aria-hidden="true" size={12} />
            {isSuggestionApplied ? "Dipakai" : "Gunakan nilai sistem"}
          </button>
        ) : null}
      </div>
      <input id={inputId} inputMode="decimal" placeholder="Opsional" value={value} onChange={(event) => onChange(event.target.value)} />
      {note ? <small className="auto-source-note">{note}</small> : null}
    </div>
  );
}

function buildOptionalDriverNote({
  inputValue,
  effectiveLabel,
  fallbackSource,
}: {
  inputValue: string;
  effectiveLabel: string;
  fallbackSource: string;
}): string {
  if (inputValue.trim()) {
    return `Nilai dipakai: ${effectiveLabel} - nilai eksplisit di field. Pastikan dasar pendukung tersedia jika berbeda dari fallback historis.`;
  }

  return `Nilai dipakai: ${effectiveLabel} - fallback sistem dari ${fallbackSource}. Biarkan kosong jika tidak ada dasar override yang lebih kuat.`;
}

function formatOptionalDriverSuggestionInput(value: number, kind: OptionalDriverSuggestionKind): string {
  if (!Number.isFinite(value)) {
    return "";
  }

  return formatInputNumber(kind === "rate" ? value * 100 : value);
}

function isOptionalDriverSuggestionApplied(currentValue: string, suggestionValue: string, kind: OptionalDriverSuggestionKind): boolean {
  if (!currentValue.trim() || !suggestionValue.trim()) {
    return false;
  }

  const currentNumber = kind === "rate" ? parseRateInput(currentValue) : parseInputNumber(currentValue);
  const suggestionNumber = kind === "rate" ? parseRateInput(suggestionValue) : parseInputNumber(suggestionValue);

  if (currentNumber === null || suggestionNumber === null) {
    return false;
  }

  return Math.abs(currentNumber - suggestionNumber) < 1e-10;
}

function formatDays(value: number): string {
  return `${new Intl.NumberFormat("id-ID", { maximumFractionDigits: 2 }).format(value)} hari`;
}

function formatCaseProfileValue(key: keyof CaseProfile, value: string): string {
  if (key === "objectBusinessKlu") {
    return normalizeKluCode(value);
  }

  if (key === "capitalBaseFull" || key === "capitalBaseValued") {
    return formatEditableNumber(value);
  }

  if (key === "transactionYear") {
    return value.replace(/\D/g, "").slice(0, 4);
  }

  return value;
}

function formatCaseProfileProportion(derived: CaseProfileDerived): string {
  if (derived.capitalProportionStatus === "empty") {
    return "Belum dihitung";
  }

  if (derived.capitalProportionStatus === "invalid" || derived.capitalProportion === null) {
    return "Data Tidak Valid";
  }

  return formatPercent(derived.capitalProportion);
}

function formatDerivedDate(value: string): string {
  return value ? formatDisplayDate(value) : "Belum dihitung";
}

function formatAutoCapitalValue(value: number): string {
  return value > 0 ? formatInputNumber(value) : "";
}

function formatAutoCapitalWeight(value: number | undefined): string {
  return typeof value === "number" && Number.isFinite(value) ? formatInputNumber(value) : "";
}

function buildAutoCapitalWeightNote(currentValue: string, value: number | undefined): string | undefined {
  if (currentValue.trim() || typeof value !== "number" || !Number.isFinite(value)) {
    return undefined;
  }

  return `Auto aktif: ${formatPercent(value)}. Edit bila basis struktur kapital berbeda.`;
}

function resolveAutoWaccCapitalValues(assumptions: AssumptionState, autoCapitalValues: AutoWaccCapitalValues): AssumptionState {
  return {
    ...assumptions,
    waccDebtMarketValue: assumptions.waccDebtMarketValue.trim() || formatAutoCapitalValue(autoCapitalValues.debtMarketValue),
    waccEquityMarketValue: assumptions.waccEquityMarketValue.trim() || formatAutoCapitalValue(autoCapitalValues.equityMarketValue),
  };
}

function resolveAutoRequiredReturnOnNtaValues(
  assumptions: AssumptionState,
  suggestion: RequiredReturnOnNtaSuggestion,
): AssumptionState {
  return requiredReturnSuggestionOrder.reduce((nextAssumptions, key) => {
    const field = suggestion.fields[key];

    if (!field?.canAutoApply || field.value === null || nextAssumptions[key].trim()) {
      return nextAssumptions;
    }

    return {
      ...nextAssumptions,
      [key]: formatInputNumber(field.value),
    };
  }, assumptions);
}

function formatRequiredReturnSuggestionInput(field: RequiredReturnOnNtaSuggestionField | undefined): string {
  return field?.canAutoApply && field.value !== null ? formatInputNumber(field.value) : "";
}

function buildRequiredReturnInputSuggestion(
  field: RequiredReturnOnNtaSuggestionField | undefined,
  kind: OptionalDriverSuggestionKind,
): OptionalDriverSuggestion | undefined {
  if (!field || field.value === null) {
    return undefined;
  }

  return {
    value: formatOptionalDriverSuggestionInput(field.value, kind),
    displayValue: formatRequiredReturnSuggestionDisplay(field),
    kind,
  };
}

function formatRequiredReturnSuggestionDisplay(field: RequiredReturnOnNtaSuggestionField): string {
  if (field.value === null) {
    return "Perlu input";
  }

  if (field.key === "requiredReturnAdditionalCapacity") {
    return formatIdr(field.value);
  }

  return formatPercent(field.value);
}

function buildSuggestionInputNote(currentValue: string, field: RequiredReturnOnNtaSuggestionField | undefined): string | undefined {
  if (!field || currentValue.trim()) {
    return undefined;
  }

  const prefix = field.value !== null ? (field.canAutoApply ? "Auto aktif" : "Saran sistem") : "Input";
  return `${prefix}: ${field.basis}. ${field.note}`;
}

function applyIdxComparableSuggestions(
  assumptions: AssumptionState,
  sector: string,
  mode: "empty-only" | "replace",
): AssumptionState {
  const suggestions = getSuggestedIdxComparables(sector);

  if (suggestions.length === 0) {
    return assumptions;
  }

  return waccComparableSlots.reduce((nextAssumptions, slot, index) => {
    const suggestion = suggestions[index];

    if (!suggestion || (mode === "empty-only" && String(nextAssumptions[slot.name]).trim())) {
      return nextAssumptions;
    }

    return applyIdxComparableToSlot(nextAssumptions, slot, suggestion);
  }, assumptions);
}

function applyIdxComparableToSlot(
  assumptions: AssumptionState,
  slot: WaccComparableSlot,
  company: IdxComparableCompany,
): AssumptionState {
  return {
    ...assumptions,
    [slot.name]: formatIdxComparableLabel(company),
    [slot.beta]: company.betaLevered !== null ? formatInputNumber(company.betaLevered) : "",
    [slot.marketCap]: company.marketCap !== null ? formatInputNumber(company.marketCap) : "",
    [slot.debt]: company.debt !== null ? formatInputNumber(company.debt) : "",
  };
}

function markManualAssumptionSource(assumptions: AssumptionState, key: keyof AssumptionState): AssumptionState {
  if (!isDriverAssumptionKey(key)) {
    return assumptions;
  }

  return {
    ...assumptions,
    [assumptionSourceKeyByDriver[key]]: manualSourceByDriver[key],
  };
}

function isDriverAssumptionKey(key: keyof AssumptionState): key is DriverAssumptionKey {
  return key === "taxRate" || key === "terminalGrowth" || key === "wacc" || key === "requiredReturnOnNta";
}

function buildAssumptionDriverSummary(label: string, value: string, sourceId: string, candidates: AssumptionCandidate[]) {
  const candidate = candidates.find((item) => item.id === sourceId);

  return {
    label,
    valueLabel: formatRateInput(value),
    sourceLabel: candidate ? sourceLabel(candidate) : sourceLabelFromManual(value),
  };
}

function buildCalculatedDriverSummary(label: string, value: number | null, sourceLabel: string) {
  return {
    label,
    valueLabel: value === null ? "Belum dipilih" : formatPercent(value),
    sourceLabel,
  };
}

function sourceLabel(candidate: AssumptionCandidate): string {
  const source = candidate.sourceCell ? `${candidate.source} · ${candidate.sourceCell}` : candidate.source;
  return `${candidate.label} · ${source}`;
}

function sourceLabelFromManual(value: string): string {
  return value.trim() ? "Input langsung dari data legacy/contoh" : "Belum dipilih";
}

function formatRateInput(input: string): string {
  const rate = parseRateInput(input);
  return rate === null ? "Belum dipilih" : formatPercent(rate);
}

function formatOptionalRate(value: number | null | undefined): string {
  return value === null || value === undefined || !Number.isFinite(value) ? "Belum tersedia" : formatPercent(value);
}

function formatPrecisePercent(value: number, maximumFractionDigits: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "percent",
    maximumFractionDigits,
  }).format(value);
}

function formatOptionalNumber(value: number | null | undefined): string {
  return value === null || value === undefined || !Number.isFinite(value) ? "Belum tersedia" : formatNumber(value);
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 4,
  }).format(value);
}

function parseRateInput(input: string): number | null {
  if (!input.trim()) {
    return null;
  }

  const value = parseInputNumber(input);
  return input.includes("%") || Math.abs(value) > 1 ? value / 100 : value;
}

function slugifyLabel(label: string): string {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function emptyFixedAssetInputValues(): Record<FixedAssetScheduleValueKey, string> {
  return {
    acquisitionBeginning: "",
    acquisitionAdditions: "",
    depreciationBeginning: "",
    depreciationAdditions: "",
  };
}

function emptyFixedAssetAmounts(): FixedAssetPeriodAmounts {
  return {
    acquisitionBeginning: 0,
    acquisitionAdditions: 0,
    acquisitionEnding: 0,
    depreciationBeginning: 0,
    depreciationAdditions: 0,
    depreciationEnding: 0,
    netValue: 0,
  };
}

function FixedAssetScheduleEditor({
  periods,
  schedule,
  onAddRow,
  onRemoveRow,
  onUpdateRow,
  onUpdateValue,
}: {
  periods: Period[];
  schedule: FixedAssetScheduleSummary;
  onAddRow: () => void;
  onRemoveRow: (id: string) => void;
  onUpdateRow: (id: string, patch: Partial<FixedAssetScheduleRow>) => void;
  onUpdateValue: (rowId: string, periodId: string, key: FixedAssetScheduleValueKey, value: string) => void;
}) {
  const chronologicalPeriods = getChronologicalPeriods(periods);
  const firstPeriodId = chronologicalPeriods[0]?.id ?? periods[0]?.id;

  return (
    <div className="fixed-asset-editor" data-testid="fixed-asset-editor">
      <div className="subpanel-heading">
        <div>
          <p className="eyebrow">Jadwal Aset Tetap</p>
        </div>
        <div className="toolbar">
          <span className="status-pill muted">Saldo akhir dan nilai neto otomatis</span>
          <button className="button ghost compact-button" type="button" onClick={onAddRow}>
            <Plus size={16} />
            Tambah kelas aset
          </button>
        </div>
      </div>

      {schedule.rows.length === 0 ? (
        <div className="empty-state" data-testid="fixed-asset-empty">Belum ada kelas aset. Gunakan tombol Tambah kelas aset untuk mulai menginput aset tetap.</div>
      ) : (
        <>
          <FixedAssetSectionTable
            title="A. Biaya Perolehan"
            beginningKey="acquisitionBeginning"
            additionsKey="acquisitionAdditions"
            endingKey="acquisitionEnding"
            firstPeriodId={firstPeriodId}
            periods={periods}
            schedule={schedule}
            onRemoveRow={onRemoveRow}
            onUpdateRow={onUpdateRow}
            onUpdateValue={onUpdateValue}
          />
          <FixedAssetSectionTable
            title="B. Penyusutan"
            beginningKey="depreciationBeginning"
            additionsKey="depreciationAdditions"
            endingKey="depreciationEnding"
            firstPeriodId={firstPeriodId}
            periods={periods}
            schedule={schedule}
            onUpdateRow={onUpdateRow}
            onUpdateValue={onUpdateValue}
          />
          <FixedAssetNetValueTable periods={periods} schedule={schedule} />
        </>
      )}
    </div>
  );
}

function FixedAssetSectionTable({
  title,
  periods,
  schedule,
  firstPeriodId,
  beginningKey,
  additionsKey,
  endingKey,
  onRemoveRow,
  onUpdateRow,
  onUpdateValue,
}: {
  title: string;
  periods: Period[];
  schedule: FixedAssetScheduleSummary;
  firstPeriodId: string | undefined;
  beginningKey: "acquisitionBeginning" | "depreciationBeginning";
  additionsKey: "acquisitionAdditions" | "depreciationAdditions";
  endingKey: "acquisitionEnding" | "depreciationEnding";
  onRemoveRow?: (id: string) => void;
  onUpdateRow: (id: string, patch: Partial<FixedAssetScheduleRow>) => void;
  onUpdateValue: (rowId: string, periodId: string, key: FixedAssetScheduleValueKey, value: string) => void;
}) {
  const getPeriodGroupClassName = (periodIndex: number, position: "start" | "middle" | "end") =>
    [
      "fixed-asset-period-cell",
      periodIndex === 0 ? "first-period-group" : "",
      position === "start" ? "period-group-start" : "",
      position === "end" ? "period-group-end" : "",
    ]
      .filter(Boolean)
      .join(" ");

  return (
    <div className="fixed-asset-section">
      <h5>{title}</h5>
      <div className="table-wrap fixed-asset-table-wrap">
        <table className="fixed-asset-table" data-testid={title.startsWith("A.") ? "fixed-asset-acquisition-table" : "fixed-asset-depreciation-table"}>
          <thead>
            <tr>
              <th className="fixed-asset-asset-column" rowSpan={2}>Kelas aset</th>
              {periods.map((period, periodIndex) => (
                <th className={`${getPeriodGroupClassName(periodIndex, "end")} fixed-asset-period-group-heading`} colSpan={3} key={period.id}>
                  {period.label || "Periode"}
                </th>
              ))}
            </tr>
            <tr>
              {periods.map((period, periodIndex) => (
                <Fragment key={period.id}>
                  <th className={getPeriodGroupClassName(periodIndex, "start")}>Saldo awal</th>
                  <th className={getPeriodGroupClassName(periodIndex, "middle")}>Penambahan</th>
                  <th className={getPeriodGroupClassName(periodIndex, "end")}>Saldo akhir</th>
                </Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            {schedule.rows.map(({ row, amounts }) => (
              <tr data-testid="fixed-asset-row" key={row.id}>
                <td className="fixed-asset-asset-column">
                  <div className="asset-name-cell">
                    <input
                      aria-label="Kelas aset"
                      value={row.assetName}
                      onChange={(event) => onUpdateRow(row.id, { assetName: event.target.value })}
                      placeholder="Nama kelas aset"
                    />
                    {onRemoveRow ? (
                      <button className="icon-button danger" type="button" onClick={() => onRemoveRow(row.id)} title="Hapus kelas aset">
                        <Trash2 size={16} />
                      </button>
                    ) : null}
                  </div>
                </td>
                {periods.map((period, periodIndex) => {
                  const values = row.values[period.id] ?? emptyFixedAssetInputValues();
                  const computed = amounts[period.id] ?? emptyFixedAssetAmounts();
                  const isManualBeginning = period.id === firstPeriodId;

                  return (
                    <Fragment key={period.id}>
                      <td className={getPeriodGroupClassName(periodIndex, "start")}>
                        {isManualBeginning ? (
                          <input
                            aria-label={`${title} ${period.label || "Periode"} Saldo awal`}
                            inputMode="decimal"
                            value={values[beginningKey] ?? ""}
                            onChange={(event) => onUpdateValue(row.id, period.id, beginningKey, event.target.value)}
                            placeholder="0"
                          />
                        ) : (
                          <output>{formatInputNumber(computed[beginningKey])}</output>
                        )}
                      </td>
                      <td className={getPeriodGroupClassName(periodIndex, "middle")}>
                        <input
                          aria-label={`${title} ${period.label || "Periode"} Penambahan`}
                          inputMode="decimal"
                          value={values[additionsKey] ?? ""}
                          onChange={(event) => onUpdateValue(row.id, period.id, additionsKey, event.target.value)}
                          placeholder="0"
                        />
                      </td>
                      <td className={getPeriodGroupClassName(periodIndex, "end")}>
                        <output>{formatInputNumber(computed[endingKey])}</output>
                      </td>
                    </Fragment>
                  );
                })}
              </tr>
            ))}
            <tr className="total-row">
              <td className="fixed-asset-asset-column">Total</td>
              {periods.map((period, periodIndex) => {
                const totals = schedule.totals[period.id] ?? emptyFixedAssetAmounts();

                return (
                  <Fragment key={period.id}>
                    <td className={getPeriodGroupClassName(periodIndex, "start")}>{formatInputNumber(totals[beginningKey])}</td>
                    <td className={getPeriodGroupClassName(periodIndex, "middle")}>{formatInputNumber(totals[additionsKey])}</td>
                    <td className={getPeriodGroupClassName(periodIndex, "end")}>{formatInputNumber(totals[endingKey])}</td>
                  </Fragment>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FixedAssetNetValueTable({ periods, schedule }: { periods: Period[]; schedule: FixedAssetScheduleSummary }) {
  const getNetValuePeriodClassName = (periodIndex: number) =>
    ["fixed-asset-period-cell", periodIndex === 0 ? "first-period-group" : "", "period-group-start", "period-group-end"]
      .filter(Boolean)
      .join(" ");

  return (
    <div className="fixed-asset-section">
      <h5>C. Nilai Buku Neto Aset Tetap</h5>
      <div className="table-wrap fixed-asset-table-wrap">
        <table className="fixed-asset-table net-value-table" data-testid="fixed-asset-net-value-table">
          <thead>
            <tr>
              <th className="fixed-asset-asset-column">Kelas aset</th>
              {periods.map((period, periodIndex) => (
                <th className={getNetValuePeriodClassName(periodIndex)} key={period.id}>{period.label || "Periode"}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {schedule.rows.map(({ row, amounts }) => (
              <tr key={row.id}>
                <td className="fixed-asset-asset-column">{row.assetName || "Belum dinamai"}</td>
                {periods.map((period, periodIndex) => {
                  const computed = amounts[period.id] ?? emptyFixedAssetAmounts();

                  return (
                    <td className={getNetValuePeriodClassName(periodIndex)} key={period.id}>
                      <output>{formatInputNumber(computed.netValue)}</output>
                    </td>
                  );
                })}
              </tr>
            ))}
            <tr className="total-row">
              <td className="fixed-asset-asset-column">Total</td>
              {periods.map((period, periodIndex) => (
                <td className={getNetValuePeriodClassName(periodIndex)} key={period.id}>{formatInputNumber((schedule.totals[period.id] ?? emptyFixedAssetAmounts()).netValue)}</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FormulaList({ traces }: { traces: FormulaTrace[] }) {
  return (
    <div className="formula-list">
      {traces.map((trace) => (
        <div className="formula-row" key={trace.label}>
          <div>
            <strong>{trace.label}</strong>
            <code>{trace.formula}</code>
            <p>{trace.note}</p>
          </div>
          <span>{formatFormulaTraceValue(trace)}</span>
        </div>
      ))}
    </div>
  );
}

function formatFormulaTraceValue(trace: FormulaTrace): string {
  if (trace.valueFormat === "percent") {
    return formatPercent(trace.value);
  }

  if (trace.valueFormat === "number") {
    return formatNumber(trace.value);
  }

  return formatIdr(trace.value);
}
