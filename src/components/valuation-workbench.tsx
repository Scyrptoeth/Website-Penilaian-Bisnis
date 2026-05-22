"use client";

import { Fragment, useEffect, useMemo, useRef, useState, type ChangeEvent, type CSSProperties } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Banknote,
  Calculator,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Eraser,
  FileBraces,
  FileSearch,
  FileSpreadsheet,
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
import { AuthSidebarActions } from "@/components/auth-sidebar-actions";
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
  calculateDcf,
  defaultProjectionHorizonYears,
  maximumProjectionHorizonYears,
  minimumProjectionHorizonYears,
  normalizedNoplat,
  normalizeDcfTerminalTreatment,
  normalizeProjectionHorizonYears,
  type DcfOptions,
  type DcfFixedAssetProjectionInput,
  type DcfTerminalTreatment,
  type DcfWorkingCapitalCurrentAssetKey,
  type DcfWorkingCapitalCurrentLiabilityKey,
  type DcfWorkingCapitalInclusionOptions,
  type IncomeProjectionPresentationAssumptionsInput,
  type IncomeProjectionRelianceDecision,
  type IncomeProjectionRelianceGovernanceResult,
  type IncomeProjectionYearOverrideInput,
  type NonOperatingIncomeProjectionPolicy,
  type ProjectionGovernanceMetric,
} from "@/lib/valuation/calculations";
import {
  aamAdjustmentLineIds,
  buildAamAdjustmentModel,
  type AamAdjustmentLine,
  type AamAdjustmentModel,
  type AamAdjustmentState,
} from "@/lib/valuation/aam-adjustments";
import { buildEemCalculationOptions } from "@/lib/valuation/eem-drivers";
import {
  buildFixedAssetScheduleSummary,
  buildSampleDebtScheduleInputs,
  buildCaseProfileDerived,
  buildSampleFixedAssetScheduleRows,
  buildSampleCaseProfile,
  buildSampleAssumptions,
  buildSamplePeriods,
  buildSampleRows,
  buildSnapshot,
  companySectorOptions,
  companyTypeOptions,
  createEmptyDebtScheduleInputs,
  createFixedAssetScheduleRow,
  createHistoricalPeriod,
  createRow,
  debtScheduleInputKeys,
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
  resolveEffectiveWaccBasis,
  resolveWaccCalculationForBasis,
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
  type DebtScheduleInputKey,
  type DebtScheduleInputState,
  type DebtSchedulePeriodInput,
  type FixedAssetPeriodAmounts,
  type FixedAssetScheduleRow,
  type FixedAssetScheduleSummary,
  type FixedAssetScheduleValueKey,
  type MappedRow,
  type Period,
  type StatementType,
  type WaccBasis,
} from "@/lib/valuation/case-model";
import { categoryLabelMap, categoryOptions, categoryOptionsByStatement } from "@/lib/valuation/category-options";
import {
  formatDisplayDate,
  formatEditableInteger,
  formatEditableNumber,
  formatIdr,
  formatInputNumber,
  formatPercent,
  formatPercentFixed,
  formatRateInputNumber,
  formatScore,
} from "@/lib/valuation/format";
import {
  formatKluOptionLabel,
  getKluSectorRecord,
  normalizeKluCode,
  searchKluSectorRecords,
  type KluSectorRecord,
} from "@/lib/valuation/klu-sector";
import {
  buildWorkbenchReadiness,
  type ReadinessItem,
  type SectionReadiness,
  type WorkbenchReadiness,
  type WorkbenchSectionId,
} from "@/lib/valuation/readiness";
import {
  buildSectionAnalysis,
  buildCashFlowWorkingCapitalAccountCandidates,
  isCashFlowWorkingCapitalRowKey,
  type AnalysisRow,
  type AnalysisValue,
  type CashFlowAccountInclusionState,
  type CashFlowOverrideEntry,
  type CashFlowOverrideState,
  type CashFlowOverrideStatus,
  type CashFlowStatementRow,
  type CashFlowWorkingCapitalAccountCandidates,
  type CashFlowWorkingCapitalAccountCandidate,
  type CashFlowWorkingCapitalRowKey,
  type RatioRow,
  type SectionAnalysis,
} from "@/lib/valuation/section-analysis";
import {
  getDebtScheduleDetailLabel,
  getDebtScheduleRuleLabel,
  getDebtScheduleSourceLabel,
  getDebtScheduleSourcePillLabel,
} from "@/lib/valuation/debt-schedule-display";
import { buildValidationChecks } from "@/lib/valuation/validation-checks";
import {
  buildPdfExportFilename,
  saveValuationPdfExportPayload,
  valuationPdfExportScopes,
  type ValuationPdfExportScopeId,
} from "@/lib/valuation/pdf-export";
import {
  buildValuationXlsxBlob,
  createValuationXlsxFile,
  valuationXlsxExportScopes,
  type ValuationXlsxExportScopeId,
} from "@/lib/valuation/xlsx-export";
import {
  buildFixedAssetProjection,
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
  getIdxComparableDatasetResolution,
  getIdxComparableDatasetUseStatus,
  getSuggestedIdxComparables,
  type IdxComparableCompany,
} from "@/lib/valuation/idx-comparable-suggestions";
import {
  buildTerminalGrowthSuggestion,
  type TerminalGrowthSuggestion,
} from "@/lib/valuation/terminal-growth-suggestions";
import {
  buildInvestedCapitalGrowthRateSuggestion,
  type InvestedCapitalGrowthRateSuggestion,
} from "@/lib/valuation/terminal-growth-invested-capital";
import {
  buildDcfAuditTrail,
  type DcfAuditBridgeRow,
  type DcfAuditTrail,
  type DcfAuditTrailRow,
  type DcfAuditValueFormat,
} from "@/lib/valuation/dcf-audit-trail";
import { buildEemTaxPayableDebtLikeNote, eemSensitivityContext } from "@/lib/valuation/eem-sensitivity-context";
import type { AccountCategory, DcfForecastRow, FinancialStatementSnapshot, FormulaTrace, MethodOutput, ValuationMethod } from "@/lib/valuation/types";
const confidenceBandLabels: Record<ReturnType<typeof mapRow>["mapping"]["confidenceBand"], string> = {
  high: "Tinggi",
  medium: "Sedang",
  low: "Rendah",
  none: "Tidak ada",
};
const incomeProjectionRelianceDecisionLabel: Record<IncomeProjectionRelianceDecision, string> = {
  "eligible-for-approval": "Eligible approval",
  "review-only": "Review-only",
  "current-dcf-fallback": "Fallback aktif",
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

const preciseAssumptionKeys = new Set<keyof AssumptionState>([
  "taxRate",
  "terminalGrowth",
  "terminalGrowthDownside",
  "terminalGrowthUpside",
  "revenueGrowth",
  "wacc",
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
  "waccComparable1BetaLevered",
  "waccComparable2BetaLevered",
  "waccComparable3BetaLevered",
  "requiredReturnOnNta",
  "requiredReturnReceivablesCapacity",
  "requiredReturnInventoryCapacity",
  "requiredReturnFixedAssetCapacity",
  "requiredReturnAfterTaxDebtCost",
  "requiredReturnEquityCost",
]);

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
  "shareValuePerShare",
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
const WORKBENCH_STORAGE_VERSION = 21;
const WORKSPACE_MANIFEST_STORAGE_KEY = "penilaian-valuasi-bisnis.workspaces.v1";
const WORKSPACE_DATA_STORAGE_PREFIX = "penilaian-valuasi-bisnis.workspace.";
const WORKSPACE_DATA_STORAGE_SUFFIX = ".v1";
const WORKSPACE_STORAGE_VERSION = 1;
const DEFAULT_WORKSPACE_ID = "workspace-default";
const DEFAULT_WORKSPACE_NAME = "Workspace Utama";
const JSON_EXPORT_SCHEMA_ID = "penilaian-valuasi-bisnis.full-workbench-json";
const JSON_EXPORT_SCHEMA_VERSION = 1;
const defaultFixedAssetProjectionMode: FixedAssetProjectionMode = "workbook-formula";
const defaultActiveWaccBasis: WaccBasis = "governed";

type ActiveEemBasis = "base" | "taxPayableDebtLike";
type EemReturnOnTangibleAssetBasis = "requiredReturnOnNta" | "equityCost";

type ActiveDcfBasis =
  | "base"
  | "terminalDownside"
  | "terminalUpside"
  | "noIncrementalWorkingCapital"
  | "taxPayableDebtLike"
  | "historicalDerivedProjection";

type DcfOutput = ReturnType<typeof calculateDcf>;
type CalculationResults = ReturnType<typeof calculateAllMethods>;
type ActiveDcfSelection = {
  basis: ActiveDcfBasis;
  label: string;
  shortLabel: string;
  summary: string;
  dcf: DcfOutput;
  terminalGrowth: number;
  terminalTreatment: DcfTerminalTreatment;
  terminalValueOverride?: number;
  residualValue?: number;
  includeWorkingCapitalChange: boolean;
  debtLikeTaxPayable: number;
  projectionHorizonYears: number;
  projectionEngineLabel: string;
};
type ActiveEemSelection = {
  basis: ActiveEemBasis;
  label: string;
  shortLabel: string;
  summary: string;
  eem: MethodOutput;
  debtLikeTaxPayable: number;
};
type EemReturnOnTangibleAssetChoice = {
  value: EemReturnOnTangibleAssetBasis;
  label: string;
  shortLabel: string;
  summary: string;
  formula: string;
};
type EemReturnOnTangibleAssetSelection = EemReturnOnTangibleAssetChoice & {
  rate: number;
  sourceLabel: string;
};

type IncomeProjectionOverrideField = "revenueGrowth" | "grossProfitMargin" | "operatingExpenseMargin" | "depreciationMargin";

type IncomeProjectionYearOverrideState = Record<IncomeProjectionOverrideField, string> & {
  reason: string;
  updatedAt: string;
};

type IncomeProjectionReviewerDecision = "pending" | "approved" | "rejected";

type IncomeProjectionReviewerDecisionState = {
  decision: IncomeProjectionReviewerDecision;
  reason: string;
  updatedAt: string;
};

type IncomeProjectionNonOperatingPolicyState = {
  policy: NonOperatingIncomeProjectionPolicy;
  reason: string;
  updatedAt: string;
};

type IncomeProjectionPresentationAssumptionKey =
  | "cashYield"
  | "debtRate"
  | "interestIncomeRevenueMargin"
  | "interestExpenseRevenueMargin";

type IncomeProjectionPresentationAssumptionState = Record<IncomeProjectionPresentationAssumptionKey, string> & {
  reason: string;
  updatedAt: string;
};

type IncomeProjectionAuditEvent = {
  id: string;
  createdAt: string;
  actor: "system" | "reviewer";
  action: string;
  field: string;
  priorValue: string;
  newValue: string;
  reason: string;
  impact: string;
};

type IncomeProjectionControlState = {
  yearlyOverrides: Record<string, IncomeProjectionYearOverrideState>;
  reviewerDecision: IncomeProjectionReviewerDecisionState;
  nonOperatingPolicy: IncomeProjectionNonOperatingPolicyState;
  presentationAssumptions: IncomeProjectionPresentationAssumptionState;
  auditEvents: IncomeProjectionAuditEvent[];
};

type IncomeProjectionScenarioResult = {
  dcf: ReturnType<typeof calculateDcf>;
  options: DcfOptions;
  hasScenarioInput: boolean;
  activeEquityValue: number;
  absoluteVariance: number;
  relativeVariance: number;
  level: "ok" | "review" | "critical";
  activeBasis: "baseline-dcf" | "reviewer-approved-scenario";
  summary: string;
};

type ProjectionEntityLife = "going-concern" | "finite-life";

type ProjectionPlanningState = {
  horizonYears: string;
  entityLife: ProjectionEntityLife;
  terminalTreatment: DcfTerminalTreatment;
  terminalValue: string;
  terminalTreatmentReason: string;
};

type PersistedWorkbenchState = {
  version: typeof WORKBENCH_STORAGE_VERSION;
  savedAt: string;
  periods: Period[];
  activePeriodId: string;
  rows: AccountRow[];
  isFixedAssetScheduleEnabled: boolean;
  fixedAssetScheduleRows: FixedAssetScheduleRow[];
  debtScheduleInputs: DebtScheduleInputState;
  fixedAssetProjectionMode: FixedAssetProjectionMode;
  activeWaccBasis: WaccBasis;
  eemReturnOnTangibleAssetBasis: EemReturnOnTangibleAssetBasis;
  activeEemBasis: ActiveEemBasis;
  activeDcfBasis: ActiveDcfBasis;
  projectionPlanning: ProjectionPlanningState;
  aamAdjustments: AamAdjustmentState;
  assumptions: AssumptionState;
  caseProfile: CaseProfile;
  dlom: DlomState;
  dlocPfc: DlocPfcState;
  taxSimulation: TaxSimulationState;
  cashFlowOverrides: CashFlowOverrideState;
  cashFlowAccountInclusions: CashFlowAccountInclusionState;
  incomeProjectionControls: IncomeProjectionControlState;
};

type ValuationJsonExportPayload = {
  schema: typeof JSON_EXPORT_SCHEMA_ID;
  schemaVersion: typeof JSON_EXPORT_SCHEMA_VERSION;
  appStorageVersion: typeof WORKBENCH_STORAGE_VERSION;
  exportedAt: string;
  appName: "Penilaian Bisnis II";
  data: PersistedWorkbenchState;
};

type ValuationJsonImportSummary = {
  fileName: string;
  caseName: string;
  exportedAt: string;
  periodCount: number;
  accountRowCount: number;
  fixedAssetClassCount: number;
  debtScheduleInputCount: number;
  cashFlowOverrideCount: number;
  incomeProjectionAuditCount: number;
  hasSensitiveData: boolean;
};

type ValuationJsonImportCandidate = {
  state: PersistedWorkbenchState;
  summary: ValuationJsonImportSummary;
};

type WorkbenchCoreState = Omit<PersistedWorkbenchState, "version" | "savedAt">;

type WorkspaceMetadata = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
};

type WorkspaceManifest = {
  version: typeof WORKSPACE_STORAGE_VERSION;
  activeWorkspaceId: string;
  workspaces: WorkspaceMetadata[];
};

type WorkspaceStorageSnapshot = {
  manifest: WorkspaceManifest;
  activeState: PersistedWorkbenchState;
};

type WorkflowTabId = WorkbenchSectionId;
type GuidanceTarget =
  | "add-period"
  | "case-capital-base-valued"
  | "case-capital-proportion"
  | "case-company-type"
  | "case-share-ownership-type"
  | "dlom-questionnaire"
  | "dloc-pfc-questionnaire"
  | "tax-primary-method"
  | "tax-rate-statutory"
  | "wacc-market-suggestion"
  | "wacc-active-basis"
  | "terminal-growth-suggestion"
  | "required-return-on-nta"
  | "working-capital-driver";
type WorkflowTab = {
  id: WorkflowTabId;
  label: string;
  methods: ValuationMethod[];
};
type WorkflowTabGroup = {
  label: string;
  tabs: WorkflowTab[];
};
type SourceFocusKey =
  | "aam-nta-source"
  | "assumption-required-return-on-nta"
  | "wacc-required-return-on-nta";
type SourceFocusTarget = {
  tabId: WorkflowTabId;
  sourceLabel: string;
  traceId: string;
  traceLabel: string;
  targetKey?: SourceFocusKey;
};
type TraceSourceChip = {
  label: string;
  tabId: WorkflowTabId;
  targetKey?: SourceFocusKey;
};

declare global {
  interface Window {
    __PVB_TEST_HOOKS__?: {
      loadSampleWorkbook: () => void;
    };
  }
}

const aamOnlyMethods: ValuationMethod[] = ["AAM"];
const eemOnlyMethods: ValuationMethod[] = ["EEM"];
const dcfOnlyMethods: ValuationMethod[] = ["DCF"];
const eemDcfMethods: ValuationMethod[] = ["EEM", "DCF"];
const allValuationMethods: ValuationMethod[] = ["AAM", "EEM", "DCF"];
const dcfSensitivityContext = {
  base: "Skenario utama memakai WACC, terminal growth, modal kerja incremental, dan struktur utang aktif.",
  terminalDownside: "Mengganti terminal growth ke downside; pembeda utama ada pada nilai terminal yang lebih konservatif.",
  terminalUpside: "Mengganti terminal growth ke upside; pembeda utama ada pada nilai terminal yang lebih tinggi.",
  noIncrementalWorkingCapital: "Menghilangkan perubahan modal kerja incremental untuk membaca dampak kebutuhan atau release working capital.",
  taxPayableDebtLike: "Memperlakukan utang pajak sebagai kewajiban debt-like yang dikurangkan dari enterprise value.",
  historicalDerivedProjection: "Menguji proyeksi neraca historis: kas, utang pajak, dan ekuitas di-roll-forward dari data historis user.",
} as const;

const activeEemBasisOptions: Array<{
  value: ActiveEemBasis;
  label: string;
  shortLabel: string;
  summary: string;
}> = [
  {
    value: "base",
    label: eemSensitivityContext.base.label,
    shortLabel: "Skenario dasar",
    summary: eemSensitivityContext.base.note,
  },
  {
    value: "taxPayableDebtLike",
    label: eemSensitivityContext.taxPayableDebtLike.label,
    shortLabel: "Utang pajak debt-like",
    summary: eemSensitivityContext.taxPayableDebtLike.note,
  },
];

const activeEemBasisLabels = Object.fromEntries(activeEemBasisOptions.map((option) => [option.value, option])) as Record<
  ActiveEemBasis,
  (typeof activeEemBasisOptions)[number]
>;
const defaultActiveEemBasis: ActiveEemBasis = "base";

const eemReturnOnTangibleAssetChoices: EemReturnOnTangibleAssetChoice[] = [
  {
    value: "requiredReturnOnNta",
    label: "Kalkulator required return on NTA",
    shortLabel: "Blended NTA",
    summary: "Weighted return dari kapasitas utang dan ekuitas atas operating net tangible assets.",
    formula: "Bobot utang kapasitas x Kd + bobot ekuitas x Ke",
  },
  {
    value: "equityCost",
    label: "Return ekuitas aset berwujud",
    shortLabel: "Ke aset berwujud",
    summary: "Biaya modal ekuitas aset berwujud dari WACC/DISCOUNT RATE.",
    formula: "Ke = risk-free rate + beta x ERP + risk adjustment",
  },
];
const eemReturnOnTangibleAssetChoiceLabels = Object.fromEntries(
  eemReturnOnTangibleAssetChoices.map((choice) => [choice.value, choice]),
) as Record<EemReturnOnTangibleAssetBasis, EemReturnOnTangibleAssetChoice>;
const defaultEemReturnOnTangibleAssetBasis: EemReturnOnTangibleAssetBasis = "requiredReturnOnNta";

const activeDcfBasisOptions: Array<{
  value: ActiveDcfBasis;
  label: string;
  shortLabel: string;
  summary: string;
}> = [
  {
    value: "base",
    label: "DCF - skenario dasar",
    shortLabel: "Skenario dasar",
    summary: dcfSensitivityContext.base,
  },
  {
    value: "terminalDownside",
    label: "DCF - terminal downside",
    shortLabel: "Terminal downside",
    summary: dcfSensitivityContext.terminalDownside,
  },
  {
    value: "terminalUpside",
    label: "DCF - terminal upside",
    shortLabel: "Terminal upside",
    summary: dcfSensitivityContext.terminalUpside,
  },
  {
    value: "noIncrementalWorkingCapital",
    label: "DCF tanpa WC incremental",
    shortLabel: "Tanpa WC incremental",
    summary: dcfSensitivityContext.noIncrementalWorkingCapital,
  },
  {
    value: "taxPayableDebtLike",
    label: "DCF utang pajak debt-like",
    shortLabel: "Utang pajak debt-like",
    summary: dcfSensitivityContext.taxPayableDebtLike,
  },
  {
    value: "historicalDerivedProjection",
    label: "DCF - proyeksi neraca berbasis historis",
    shortLabel: "Proyeksi historis",
    summary: dcfSensitivityContext.historicalDerivedProjection,
  },
];

const activeDcfBasisLabels = Object.fromEntries(activeDcfBasisOptions.map((option) => [option.value, option])) as Record<
  ActiveDcfBasis,
  (typeof activeDcfBasisOptions)[number]
>;
const defaultActiveDcfBasis: ActiveDcfBasis = "base";

const defaultProjectionPlanning: ProjectionPlanningState = {
  horizonYears: String(defaultProjectionHorizonYears),
  entityLife: "going-concern",
  terminalTreatment: "going-concern-terminal-value",
  terminalValue: "",
  terminalTreatmentReason: "",
};

const projectionEntityLifeOptions: Array<{ value: ProjectionEntityLife; label: string; description: string }> = [
  {
    value: "going-concern",
    label: "Going concern",
    description: "Default: explicit forecast diikuti terminal value.",
  },
  {
    value: "finite-life",
    label: "Finite-life entity",
    description: "Gunakan saat umur entitas/proyek terbatas dan terminal harus eksplisit.",
  },
];

const terminalTreatmentOptions: Array<{
  value: DcfTerminalTreatment;
  label: string;
  description: string;
  finiteLifeRecommended: boolean;
}> = [
  {
    value: "going-concern-terminal-value",
    label: "Default terminal value",
    description: "Gordon Growth, paling sesuai untuk going concern.",
    finiteLifeRecommended: false,
  },
  {
    value: "no-terminal-value",
    label: "No terminal value",
    description: "Paling konservatif untuk finite-life tanpa residual yang dapat dibuktikan.",
    finiteLifeRecommended: true,
  },
  {
    value: "residual-liquidation-value",
    label: "Residual/liquidation value",
    description: "Gunakan jika ada nilai sisa aset, kontrak, atau liquidation value yang supportable.",
    finiteLifeRecommended: true,
  },
  {
    value: "reviewer-approved-terminal",
    label: "Reviewer-approved terminal",
    description: "Terminal eksplisit berbasis memo reviewer dan audit trail.",
    finiteLifeRecommended: true,
  },
];

const terminalTreatmentLabels = Object.fromEntries(terminalTreatmentOptions.map((option) => [option.value, option])) as Record<
  DcfTerminalTreatment,
  (typeof terminalTreatmentOptions)[number]
>;

const activeWaccBasisOptions: Array<{
  value: WaccBasis;
  label: string;
  shortLabel: string;
  summary: string;
}> = [
  {
    value: "governed",
    label: "Governed WACC",
    shortLabel: "Governed",
    summary: "Default sistem. Smart suggestion berisiko tetap di-normalisasi sebelum masuk EEM/DCF.",
  },
  {
    value: "raw",
    label: "Raw calculated WACC",
    shortLabel: "Raw",
    summary: "Sensitivitas review. Memakai hasil kalkulasi komponen tanpa beta floor/governance WACC.",
  },
  {
    value: "manual",
    label: "Manual WACC",
    shortLabel: "Manual",
    summary: "Override reviewer. Aktif hanya jika field WACC manual diisi dan didukung alasan.",
  },
];

const activeWaccBasisLabels = Object.fromEntries(activeWaccBasisOptions.map((option) => [option.value, option])) as Record<
  WaccBasis,
  (typeof activeWaccBasisOptions)[number]
>;

const workflowTabRegistry = {
  periods: { id: "periods", label: "Data Awal", methods: allValuationMethods },
  balance: { id: "balance", label: "Neraca", methods: allValuationMethods },
  fixedAssets: { id: "fixedAssets", label: "Aset Tetap", methods: allValuationMethods },
  income: { id: "income", label: "Laba Rugi", methods: eemDcfMethods },
  mapping: { id: "mapping", label: "Kategorisasi Akun", methods: allValuationMethods },
  wacc: { id: "wacc", label: "WACC", methods: eemDcfMethods },
  eemDcfAssumptions: { id: "eemDcfAssumptions", label: "Asumsi EEM/DCF", methods: eemDcfMethods },
  valuationAam: { id: "valuationAam", label: "Penilaian AAM", methods: aamOnlyMethods },
  valuationEem: { id: "valuationEem", label: "Penilaian EEM", methods: eemOnlyMethods },
  valuationDcf: { id: "valuationDcf", label: "Penilaian DCF", methods: dcfOnlyMethods },
  projectedIncome: { id: "projectedIncome", label: "Proyeksi Laba Rugi", methods: dcfOnlyMethods },
  projectedBalance: { id: "projectedBalance", label: "Proyeksi Neraca", methods: dcfOnlyMethods },
  projectedFixedAssets: { id: "projectedFixedAssets", label: "Proyeksi Aset Tetap", methods: dcfOnlyMethods },
  projectedCashFlow: { id: "projectedCashFlow", label: "Proyeksi Cash Flow Statement", methods: dcfOnlyMethods },
  dlom: { id: "dlom", label: "DLOM", methods: allValuationMethods },
  dlocPfc: { id: "dlocPfc", label: "DLOC/PFC", methods: allValuationMethods },
  taxSimulation: { id: "taxSimulation", label: "Simulasi Potensi Pajak", methods: allValuationMethods },
  cashFlowStatement: { id: "cashFlowStatement", label: "Cash Flow Statement", methods: eemDcfMethods },
  payablesCashFlow: { id: "payablesCashFlow", label: "Jadwal Utang", methods: eemDcfMethods },
  noplatFcf: { id: "noplatFcf", label: "NOPLAT & FCF", methods: eemDcfMethods },
  financialRatio: { id: "financialRatio", label: "Financial Ratio", methods: eemDcfMethods },
  roic: { id: "roic", label: "ROIC", methods: eemDcfMethods },
  audit: { id: "audit", label: "Audit", methods: allValuationMethods },
} satisfies Record<WorkflowTabId, WorkflowTab>;

const workflowNavigationGroups: WorkflowTabGroup[] = [
  {
    label: "Input Data",
    tabs: [workflowTabRegistry.periods, workflowTabRegistry.fixedAssets, workflowTabRegistry.balance, workflowTabRegistry.income],
  },
  {
    label: "Analisis EEM/DCF",
    tabs: [
      workflowTabRegistry.cashFlowStatement,
      workflowTabRegistry.payablesCashFlow,
      workflowTabRegistry.noplatFcf,
      workflowTabRegistry.financialRatio,
      workflowTabRegistry.roic,
    ],
  },
  {
    label: "Asumsi",
    tabs: [workflowTabRegistry.wacc, workflowTabRegistry.eemDcfAssumptions],
  },
  {
    label: "Proyeksi DCF",
    tabs: [
      workflowTabRegistry.projectedFixedAssets,
      workflowTabRegistry.projectedBalance,
      workflowTabRegistry.projectedIncome,
      workflowTabRegistry.projectedCashFlow,
    ],
  },
  {
    label: "Penilaian",
    tabs: [workflowTabRegistry.valuationAam, workflowTabRegistry.valuationEem, workflowTabRegistry.valuationDcf],
  },
  {
    label: "Diskon & Pajak",
    tabs: [workflowTabRegistry.dlom, workflowTabRegistry.dlocPfc, workflowTabRegistry.taxSimulation],
  },
  {
    label: "Review",
    tabs: [workflowTabRegistry.audit],
  },
];
const workflowNavigationTabs = workflowNavigationGroups.flatMap((group) => group.tabs);
const workflowTabIdByLabel = new Map<WorkflowTab["label"], WorkflowTabId>(
  workflowNavigationTabs.map((tab) => [tab.label, tab.id]),
);
const traceSourceTabAliases = new Map<string, WorkflowTabId>([
  ["Diskon & Pajak", "taxSimulation"],
  ["Simulasi Potensi Pajak", "taxSimulation"],
]);

const incomeProjectionOverrideFields: Array<{
  key: IncomeProjectionOverrideField;
  label: string;
  basis: "rate";
}> = [
  { key: "revenueGrowth", label: "Revenue growth", basis: "rate" },
  { key: "grossProfitMargin", label: "Gross margin", basis: "rate" },
  { key: "operatingExpenseMargin", label: "Opex margin", basis: "rate" },
  { key: "depreciationMargin", label: "Depreciation", basis: "rate" },
];

const incomeProjectionPresentationAssumptionFields: Array<{
  key: IncomeProjectionPresentationAssumptionKey;
  label: string;
}> = [
  { key: "cashYield", label: "Cash/deposit yield" },
  { key: "debtRate", label: "Debt cost rate" },
  { key: "interestIncomeRevenueMargin", label: "Interest income / revenue" },
  { key: "interestExpenseRevenueMargin", label: "Interest expense / revenue" },
];

const nonOperatingPolicyOptions: Array<{ value: NonOperatingIncomeProjectionPolicy; label: string; description: string }> = [
  {
    value: "auto",
    label: "Auto historical recurrence",
    description: "Sistem memakai recurring signed ratio yang sudah disaring dari histori.",
  },
  {
    value: "recurring",
    label: "Reviewer recurring",
    description: "Reviewer menetapkan pos non-operating sebagai recurring dan supportable.",
  },
  {
    value: "non-recurring",
    label: "Non-recurring",
    description: "Pos non-operating dikunci nol dalam proyeksi presentasi.",
  },
];

const reviewerDecisionOptions: Array<{ value: IncomeProjectionReviewerDecision; label: string }> = [
  { value: "pending", label: "Pending review" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

const MAX_HISTORY_STEPS = 80;

type ConfirmationDialogState = {
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void;
};

type ValuationWorkbenchProps = {
  authUserId?: string;
  isSuperAdmin?: boolean;
};

export function ValuationWorkbench({ authUserId, isSuperAdmin = false }: ValuationWorkbenchProps) {
  const [periods, setPeriods] = useState<Period[]>(initialPeriods);
  const [activePeriodId, setActivePeriodId] = useState(initialPeriods[0].id);
  const [rows, setRows] = useState<AccountRow[]>([]);
  const [isFixedAssetScheduleEnabled, setIsFixedAssetScheduleEnabled] = useState(false);
  const [fixedAssetScheduleRows, setFixedAssetScheduleRows] = useState<FixedAssetScheduleRow[]>([]);
  const [debtScheduleInputs, setDebtScheduleInputs] = useState<DebtScheduleInputState>(() => createEmptyDebtScheduleInputs(initialPeriods));
  const [fixedAssetProjectionMode, setFixedAssetProjectionMode] = useState<FixedAssetProjectionMode>(defaultFixedAssetProjectionMode);
  const [activeWaccBasis, setActiveWaccBasis] = useState<WaccBasis>(defaultActiveWaccBasis);
  const [eemReturnOnTangibleAssetBasis, setEemReturnOnTangibleAssetBasis] = useState<EemReturnOnTangibleAssetBasis>(
    defaultEemReturnOnTangibleAssetBasis,
  );
  const [activeEemBasis, setActiveEemBasis] = useState<ActiveEemBasis>(defaultActiveEemBasis);
  const [activeDcfBasis, setActiveDcfBasis] = useState<ActiveDcfBasis>(defaultActiveDcfBasis);
  const [projectionPlanning, setProjectionPlanning] = useState<ProjectionPlanningState>(defaultProjectionPlanning);
  const [aamAdjustments, setAamAdjustments] = useState<AamAdjustmentState>({});
  const [assumptions, setAssumptions] = useState<AssumptionState>(emptyAssumptions);
  const [caseProfile, setCaseProfile] = useState<CaseProfile>(emptyCaseProfile);
  const [dlom, setDlom] = useState<DlomState>(createEmptyDlomState);
  const [dlocPfc, setDlocPfc] = useState<DlocPfcState>(createEmptyDlocPfcState);
  const [taxSimulation, setTaxSimulation] = useState<TaxSimulationState>(createEmptyTaxSimulationState);
  const [cashFlowOverrides, setCashFlowOverrides] = useState<CashFlowOverrideState>({});
  const [cashFlowAccountInclusions, setCashFlowAccountInclusions] = useState<CashFlowAccountInclusionState>({});
  const [incomeProjectionControls, setIncomeProjectionControls] = useState<IncomeProjectionControlState>(
    createEmptyIncomeProjectionControls,
  );
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isDraftRestored, setIsDraftRestored] = useState(false);
  const [workspaces, setWorkspaces] = useState<WorkspaceMetadata[]>([
    {
      id: DEFAULT_WORKSPACE_ID,
      name: DEFAULT_WORKSPACE_NAME,
      createdAt: "",
      updatedAt: "",
    },
  ]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState(DEFAULT_WORKSPACE_ID);
  const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = useState(false);
  const [renamingWorkspaceId, setRenamingWorkspaceId] = useState<string | null>(null);
  const [workspaceNameDraft, setWorkspaceNameDraft] = useState("");
  const [activeWorkflowTab, setActiveWorkflowTab] = useState<WorkflowTabId>("periods");
  const [undoStack, setUndoStack] = useState<WorkbenchCoreState[]>([]);
  const [redoStack, setRedoStack] = useState<WorkbenchCoreState[]>([]);
  const [isPdfExportMenuOpen, setIsPdfExportMenuOpen] = useState(false);
  const [isXlsxExportMenuOpen, setIsXlsxExportMenuOpen] = useState(false);
  const [isJsonMenuOpen, setIsJsonMenuOpen] = useState(false);
  const [isJsonImporting, setIsJsonImporting] = useState(false);
  const [pendingConfirmation, setPendingConfirmation] = useState<ConfirmationDialogState | null>(null);
  const [guidanceTarget, setGuidanceTarget] = useState<GuidanceTarget | null>(null);
  const [sourceFocusTarget, setSourceFocusTarget] = useState<SourceFocusTarget | null>(null);
  const workspaceMenuRef = useRef<HTMLDivElement>(null);
  const pdfExportMenuRef = useRef<HTMLDivElement>(null);
  const xlsxExportMenuRef = useRef<HTMLDivElement>(null);
  const jsonMenuRef = useRef<HTMLDivElement>(null);
  const jsonImportInputRef = useRef<HTMLInputElement>(null);

  const activeWorkspace = workspaces.find((workspace) => workspace.id === activeWorkspaceId) ?? workspaces[0];
  const activeWorkflowTabItem = workflowTabRegistry[activeWorkflowTab] ?? workflowTabRegistry.periods;
  const mappedRows = useMemo(() => rows.map((row) => mapRow(row)), [rows]);
  const caseProfileDerived = useMemo(() => buildCaseProfileDerived(caseProfile), [caseProfile]);
  const activePeriod = periods.find((period) => period.id === activePeriodId) ?? getDefaultActivePeriod(periods);
  const effectiveValuationDate = caseProfileDerived.cutOffDate || activePeriod?.valuationDate || "";
  const sectorComparableOptions = useMemo(
    () => getIdxComparablesBySector(caseProfile.companySector, { valuationDate: effectiveValuationDate }),
    [caseProfile.companySector, effectiveValuationDate],
  );
  const sectorComparableSuggestions = useMemo(
    () => getSuggestedIdxComparables(caseProfile.companySector, 3, { valuationDate: effectiveValuationDate }),
    [caseProfile.companySector, effectiveValuationDate],
  );
  const balanceSheetRows = useMemo(() => mappedRows.filter((item) => item.row.statement === "balance_sheet"), [mappedRows]);
  const incomeStatementRows = useMemo(() => mappedRows.filter((item) => item.row.statement === "income_statement"), [mappedRows]);
  const fixedAssetSchedule = useMemo(
    () => buildFixedAssetScheduleSummary(periods, fixedAssetScheduleRows),
    [fixedAssetScheduleRows, periods],
  );
  const accountingSnapshot = useMemo(
    () => buildSnapshot(periods, activePeriodId, rows, assumptions, fixedAssetScheduleRows, { debtScheduleInputs }),
    [periods, activePeriodId, rows, assumptions, fixedAssetScheduleRows, debtScheduleInputs],
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
  const rawWaccCalculation = useMemo(() => calculateWaccAssumption(waccResolvedAssumptions), [waccResolvedAssumptions]);
  const effectiveActiveWaccBasis = useMemo(
    () => resolveEffectiveWaccBasis(waccResolvedAssumptions, activeWaccBasis),
    [activeWaccBasis, waccResolvedAssumptions],
  );
  const waccCalculation = useMemo(
    () => resolveWaccCalculationForBasis(waccResolvedAssumptions, effectiveActiveWaccBasis, rawWaccCalculation),
    [effectiveActiveWaccBasis, rawWaccCalculation, waccResolvedAssumptions],
  );
  const waccComparableBeta = useMemo(() => calculateWaccComparableBetaAssumption(waccResolvedAssumptions), [waccResolvedAssumptions]);
  const requiredReturnSuggestion = useMemo(
    () =>
      buildRequiredReturnOnNtaSuggestion({
        accountReceivable: accountingSnapshot.accountReceivable,
        employeeReceivable: accountingSnapshot.employeeReceivable,
        inventory: accountingSnapshot.inventory,
        fixedAssetsNet: accountingSnapshot.fixedAssetsNet,
        waccCalculation: rawWaccCalculation,
      }),
    [
      accountingSnapshot.accountReceivable,
      accountingSnapshot.employeeReceivable,
      accountingSnapshot.fixedAssetsNet,
      accountingSnapshot.inventory,
      rawWaccCalculation,
    ],
  );
  const resolvedAssumptions = useMemo(
    () => resolveAutoRequiredReturnOnNtaValues(waccResolvedAssumptions, requiredReturnSuggestion),
    [requiredReturnSuggestion, waccResolvedAssumptions],
  );
  const snapshot = useMemo(
    () =>
      buildSnapshot(periods, activePeriodId, rows, resolvedAssumptions, fixedAssetScheduleRows, {
        waccBasis: effectiveActiveWaccBasis,
        debtScheduleInputs,
      }),
    [periods, activePeriodId, rows, resolvedAssumptions, fixedAssetScheduleRows, effectiveActiveWaccBasis, debtScheduleInputs],
  );
  const aamAdjustmentModel = useMemo(() => buildAamAdjustmentModel(snapshot, aamAdjustments), [aamAdjustments, snapshot]);
  const dcfWorkingCapitalInclusionOptions = useMemo(
    () => buildDcfWorkingCapitalInclusionOptions(cashFlowAccountInclusions),
    [cashFlowAccountInclusions],
  );
  const dcfProjectionWorkingCapitalCandidates = useMemo(
    () => buildDcfProjectionWorkingCapitalCandidates(cashFlowAccountInclusions),
    [cashFlowAccountInclusions],
  );
  const projectionPlanningDcfOptions = useMemo(
    () => buildProjectionPlanningDcfOptions(projectionPlanning),
    [projectionPlanning],
  );
  const projectionHorizonYears = projectionPlanningDcfOptions.projectionHorizonYears ?? defaultProjectionHorizonYears;
  const baseDcfForecast = useMemo(
    () => buildDcfForecast(snapshot, { ...projectionPlanningDcfOptions, workingCapitalInclusions: dcfWorkingCapitalInclusionOptions }),
    [dcfWorkingCapitalInclusionOptions, projectionPlanningDcfOptions, snapshot],
  );
  const fixedAssetProjection = useMemo(
    () => buildFixedAssetProjection(baseDcfForecast, periods, activePeriodId, fixedAssetSchedule, { preferredMode: fixedAssetProjectionMode }),
    [activePeriodId, baseDcfForecast, fixedAssetProjectionMode, fixedAssetSchedule, periods],
  );
  const dcfFixedAssetProjection = useMemo(
    () => buildDcfFixedAssetProjectionInput(fixedAssetProjection),
    [fixedAssetProjection],
  );
  const eemEquityCostRate = useMemo(
    () => readRateInput(resolvedAssumptions.requiredReturnEquityCost),
    [resolvedAssumptions.requiredReturnEquityCost],
  );
  const eemReturnOnTangibleAssetSelection = useMemo(
    () =>
      buildEemReturnOnTangibleAssetSelection({
        basis: eemReturnOnTangibleAssetBasis,
        requiredReturnOnNta: snapshot.requiredReturnOnNta,
        equityCost: eemEquityCostRate,
        hasEquityCostOverride: assumptions.requiredReturnEquityCost.trim() !== "",
      }),
    [assumptions.requiredReturnEquityCost, eemEquityCostRate, eemReturnOnTangibleAssetBasis, snapshot.requiredReturnOnNta],
  );
  const sectionAnalysis = useMemo(
    () =>
      buildSectionAnalysis(
        periods,
        rows,
        assumptions,
        fixedAssetScheduleRows,
        cashFlowOverrides,
        debtScheduleInputs,
        cashFlowAccountInclusions,
      ),
    [periods, rows, assumptions, fixedAssetScheduleRows, cashFlowOverrides, debtScheduleInputs, cashFlowAccountInclusions],
  );
  const cashFlowWorkingCapitalAccountCandidates = useMemo(
    () => buildCashFlowWorkingCapitalAccountCandidates(rows, cashFlowAccountInclusions),
    [cashFlowAccountInclusions, rows],
  );
  const eemCalculationOptions = useMemo(
    () =>
      buildEemCalculationOptions({
        activePeriodId,
        aamAdjustmentModel,
        sectionAnalysis,
        fixedAssetSchedule,
        capitalizationRate: snapshot.wacc,
        returnOnTangibleAsset: eemReturnOnTangibleAssetSelection.rate,
        returnOnTangibleAssetLabel: eemReturnOnTangibleAssetSelection.label,
        returnOnTangibleAssetSource:
          eemReturnOnTangibleAssetSelection.value === "equityCost" ? "equity-cost" : "required-return-on-nta",
      }),
    [activePeriodId, aamAdjustmentModel, eemReturnOnTangibleAssetSelection, fixedAssetSchedule, sectionAnalysis, snapshot.wacc],
  );
  const results = useMemo(
    () =>
      calculateAllMethods(snapshot, {
        aam: {
          assetAdjustment: aamAdjustmentModel.assetAdjustmentTotal,
          liabilityAdjustment: aamAdjustmentModel.liabilityAdjustmentTotal,
          equityManualAdjustment: aamAdjustmentModel.equityManualAdjustmentTotal,
          equityRevaluationAdjustment: aamAdjustmentModel.equityRevaluationAdjustment,
          equityAdjustment: aamAdjustmentModel.equityAdjustmentTotal,
          adjustedBookEquityGap: aamAdjustmentModel.adjustedBookEquityGap,
          missingAdjustmentNotes: aamAdjustmentModel.missingNoteCount,
        },
        eem: eemCalculationOptions,
        dcf: dcfFixedAssetProjection
          ? {
              ...projectionPlanningDcfOptions,
              workingCapitalInclusions: dcfWorkingCapitalInclusionOptions,
              fixedAssetProjection: dcfFixedAssetProjection,
              fixedAssetProjectionSource: fixedAssetProjection.source,
            }
          : { ...projectionPlanningDcfOptions, workingCapitalInclusions: dcfWorkingCapitalInclusionOptions },
      }),
    [
      aamAdjustmentModel.assetAdjustmentTotal,
      aamAdjustmentModel.adjustedBookEquityGap,
      aamAdjustmentModel.equityAdjustmentTotal,
      aamAdjustmentModel.equityManualAdjustmentTotal,
      aamAdjustmentModel.equityRevaluationAdjustment,
      aamAdjustmentModel.liabilityAdjustmentTotal,
      aamAdjustmentModel.missingNoteCount,
      dcfFixedAssetProjection,
      dcfWorkingCapitalInclusionOptions,
      eemCalculationOptions,
      fixedAssetProjection.source,
      projectionPlanningDcfOptions,
      snapshot,
    ],
  );
  const eemTaxPayableDebtLikeDifference = results.eem.equityValue - results.sensitivities.eemTaxPayableDebtLike.equityValue;
  const activeEemSelection = useMemo(
    () => buildActiveEemSelection(results, activeEemBasis, snapshot),
    [activeEemBasis, results, snapshot],
  );
  const activeEem = activeEemSelection.eem;
  const baseActiveDcfSelection = useMemo(
    () => buildActiveDcfSelection(results, activeDcfBasis, snapshot, projectionPlanningDcfOptions),
    [activeDcfBasis, projectionPlanningDcfOptions, results, snapshot],
  );
  const baseActiveDcf = baseActiveDcfSelection.dcf;
  const incomeProjectionScenario = useMemo(
    () =>
      buildIncomeProjectionScenario({
        snapshot,
        baselineEquityValue: baseActiveDcf.equityValue,
        controls: incomeProjectionControls,
        activeDcfOptions: {
          ...projectionPlanningDcfOptions,
          ...buildActiveDcfBasisDcfOptions(activeDcfBasis, snapshot),
          workingCapitalInclusions: dcfWorkingCapitalInclusionOptions,
        },
        fixedAssetProjection: dcfFixedAssetProjection,
        fixedAssetProjectionSource: dcfFixedAssetProjection ? fixedAssetProjection.source : undefined,
      }),
    [
      activeDcfBasis,
      dcfFixedAssetProjection,
      dcfWorkingCapitalInclusionOptions,
      baseActiveDcf.equityValue,
      fixedAssetProjection.source,
      incomeProjectionControls,
      projectionPlanningDcfOptions,
      snapshot,
    ],
  );
  const activeDcfSelection = useMemo(
    () => buildIncomeProjectionActiveDcfSelection(baseActiveDcfSelection, incomeProjectionScenario),
    [baseActiveDcfSelection, incomeProjectionScenario],
  );
  const activeDcf = activeDcfSelection.dcf;
  const activeResults = useMemo(
    () => ({ ...results, eem: activeEem, dcf: activeDcf }),
    [activeDcf, activeEem, results],
  );
  const dlomCalculation = useMemo(() => calculateDlom(dlom, snapshot, caseProfile), [caseProfile, dlom, snapshot]);
  const dlocPfcCalculation = useMemo(() => calculateDlocPfc(dlocPfc, caseProfile), [caseProfile, dlocPfc]);
  const taxSimulationResult = useMemo(
    () =>
      calculateTaxSimulation({
        methods: [results.aam, activeEem, activeDcf],
        dlom: dlomCalculation,
        dlocPfc: dlocPfcCalculation,
        state: taxSimulation,
        caseProfile,
        caseProfileDerived,
        snapshot,
      }),
    [activeDcf, activeEem, caseProfile, caseProfileDerived, dlocPfcCalculation, dlomCalculation, results.aam, snapshot, taxSimulation],
  );
  const balanceSheetView = useMemo(
    () => buildBalanceSheetView(periods, mappedRows, fixedAssetSchedule),
    [fixedAssetSchedule, mappedRows, periods],
  );
  const incomeStatementView = useMemo(
    () => buildIncomeStatementView(periods, incomeStatementRows, fixedAssetSchedule),
    [fixedAssetSchedule, incomeStatementRows, periods],
  );
  const eemNetOperatingTangibleAssets = findTraceValueById(activeEem.traces, "eem-net-tangible-asset-value");
  const eemExcessEarnings = findTraceValueById(activeEem.traces, "eem-excess-earning");
  const dcfExplicitPv = findTraceValue(activeDcf.traces, "PV eksplisit FCFF");
  const dcfTerminalPv = findTraceValue(activeDcf.traces, "PV nilai terminal");
  const dcfAuditTrail = useMemo(
    () =>
      buildDcfAuditTrail({
        snapshot,
        dcf: activeDcf,
        historical: {
          periodLabel: activePeriod?.label,
          year: getYearFromDate(activePeriod?.valuationDate),
          depreciation: eemCalculationOptions.depreciationAddBack ?? 0,
          currentAssetMovement: eemCalculationOptions.currentAssetMovement ?? 0,
          currentLiabilityMovement: eemCalculationOptions.currentLiabilityMovement ?? 0,
          capitalExpenditures: eemCalculationOptions.capitalExpenditures ?? 0,
        },
        terminalGrowth: activeDcfSelection.terminalGrowth,
        wacc: snapshot.wacc,
        terminalTreatment: activeDcfSelection.terminalTreatment,
        terminalValueOverride: activeDcfSelection.terminalValueOverride,
        residualValue: activeDcfSelection.residualValue,
        includeWorkingCapitalChange: activeDcfSelection.includeWorkingCapitalChange,
        debtLikeTaxPayable: activeDcfSelection.debtLikeTaxPayable,
      }),
    [
      activeDcf,
      activeDcfSelection.debtLikeTaxPayable,
      activeDcfSelection.includeWorkingCapitalChange,
      activeDcfSelection.residualValue,
      activeDcfSelection.terminalGrowth,
      activeDcfSelection.terminalTreatment,
      activeDcfSelection.terminalValueOverride,
      activePeriod?.label,
      activePeriod?.valuationDate,
      eemCalculationOptions.capitalExpenditures,
      eemCalculationOptions.currentAssetMovement,
      eemCalculationOptions.currentLiabilityMovement,
      eemCalculationOptions.depreciationAddBack,
      snapshot,
    ],
  );
  const activeDcfVariance = activeDcf.equityValue - results.dcf.equityValue;
  const activeDcfRelativeVariance = safeAbsoluteRatio(activeDcfVariance, results.dcf.equityValue);
  const taxRateCandidates = useMemo(() => buildTaxRateCandidates(effectiveValuationDate), [effectiveValuationDate]);
  const marketSuggestion = useMemo(
    () => getMarketAssumptionSuggestion(effectiveValuationDate),
    [effectiveValuationDate],
  );
  const requiredReturnCalculation = useMemo(
    () =>
      calculateRequiredReturnOnNtaAssumption(resolvedAssumptions, {
        accountReceivable: snapshot.accountReceivable,
        employeeReceivable: snapshot.employeeReceivable,
        inventory: snapshot.inventory,
        fixedAssetsNet: snapshot.fixedAssetsNet,
      }),
    [resolvedAssumptions, snapshot.accountReceivable, snapshot.employeeReceivable, snapshot.fixedAssetsNet, snapshot.inventory],
  );
  const assumptionGovernance = useMemo(
    () =>
      buildAssumptionGovernance({
        snapshot,
        waccCalculation: rawWaccCalculation,
        requiredReturnCalculation,
        dcfTraces: activeDcf.traces,
        hasRevenueGrowthOverride: assumptions.revenueGrowth.trim() !== "",
      }),
    [activeDcf.traces, assumptions.revenueGrowth, rawWaccCalculation, requiredReturnCalculation, snapshot],
  );
  const eemAssumptionGovernance = useMemo(
    () => scopeAssumptionGovernance(assumptionGovernance, (item) => item.target !== "valuationDcf", "EEM"),
    [assumptionGovernance],
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
  const investedCapitalGrowthSuggestion = useMemo(
    () => buildInvestedCapitalGrowthRateSuggestion(sectionAnalysis, snapshot.wacc),
    [sectionAnalysis, snapshot.wacc],
  );
  const rawWaccValue = rawWaccCalculation?.wacc ?? readRateInput(assumptions.wacc);
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
      formatWaccBasisSourceLabel(activeWaccBasis, effectiveActiveWaccBasis, isGovernedWacc, rawWaccCalculation, assumptions.wacc),
    ),
    buildCalculatedDriverSummary(
      "Terminal growth",
      snapshot.terminalGrowth,
      isGovernedTerminalGrowth
        ? "Basis governed dengan cap dari sumber pendukung"
        : assumptions.terminalGrowthSource === investedCapitalGrowthSuggestion?.sourceId
        ? "Growth Rate invested capital dari Aset Tetap/Neraca/ROIC"
        : assumptions.terminalGrowthSource === terminalGrowthSuggestion?.sourceId
        ? "Saran terkalibrasi sektor dengan band downside/upside"
        : assumptions.terminalGrowth.trim() ? "Base case pengguna dengan input sensitivitas" : "Belum dipilih",
      formatTerminalGrowthPercent,
    ),
    buildCalculatedDriverSummary(
      "Required return on NTA",
      snapshot.requiredReturnOnNta,
      isGovernedRequiredReturn
        ? "Proxy kapasitas aset berwujud yang di-govern"
      : requiredReturnCalculation ? requiredReturnCalculation.basisLabel : sourceLabelFromManual(assumptions.requiredReturnOnNta),
    ),
  ];
  const eemDriverSummaries = assumptionDriverSummaries.map((driver) =>
    driver.label === "Required return on NTA"
      ? {
          ...driver,
          label: "Return on Tangible Asset",
          valueLabel: formatPercentFixed(eemReturnOnTangibleAssetSelection.rate, 2),
          sourceLabel: eemReturnOnTangibleAssetSelection.label,
        }
      : driver,
  );
  const dcfDriverSummaries = assumptionDriverSummaries.map((driver) =>
    driver.label === "Terminal growth"
      ? {
          ...driver,
          valueLabel: formatTerminalGrowthPercent(activeDcfSelection.terminalGrowth),
          sourceLabel: activeDcfBasis === "base" ? driver.sourceLabel : activeDcfSelection.label,
        }
      : driver,
  );
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
    hasDebtScheduleInput(debtScheduleInputs) ||
    hasCashFlowOverrideInput(cashFlowOverrides) ||
    hasCashFlowAccountInclusionInput(cashFlowAccountInclusions) ||
    hasIncomeProjectionControlInput(incomeProjectionControls) ||
    activeWaccBasis !== defaultActiveWaccBasis ||
    eemReturnOnTangibleAssetBasis !== defaultEemReturnOnTangibleAssetBasis ||
    activeEemBasis !== defaultActiveEemBasis ||
    activeDcfBasis !== defaultActiveDcfBasis ||
    hasProjectionPlanningInput(projectionPlanning) ||
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
        dlom: dlomCalculation,
        dlocPfc: dlocPfcCalculation,
        taxSimulation,
      }),
    [caseProfile, caseProfileDerived, dlocPfcCalculation, dlomCalculation, fixedAssetSchedule, mappedRows, periods, resolvedAssumptions, rows, snapshot, taxSimulation],
  );

  useEffect(() => {
    if (!pendingConfirmation) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setPendingConfirmation(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [pendingConfirmation]);

  function getCurrentCoreState(): WorkbenchCoreState {
    return {
      periods,
      activePeriodId,
      rows,
      isFixedAssetScheduleEnabled,
      fixedAssetScheduleRows,
      debtScheduleInputs,
      fixedAssetProjectionMode,
      activeWaccBasis,
      eemReturnOnTangibleAssetBasis,
      activeEemBasis,
      activeDcfBasis,
      projectionPlanning,
      aamAdjustments,
      assumptions,
      caseProfile,
      dlom,
      dlocPfc,
      taxSimulation,
      cashFlowOverrides,
      cashFlowAccountInclusions,
      incomeProjectionControls,
    };
  }

  function applyCoreState(state: WorkbenchCoreState) {
    setPeriods(state.periods);
    setActivePeriodId(state.activePeriodId);
    setRows(state.rows);
    setIsFixedAssetScheduleEnabled(state.isFixedAssetScheduleEnabled);
    setFixedAssetScheduleRows(state.fixedAssetScheduleRows);
    setDebtScheduleInputs(state.debtScheduleInputs);
    setFixedAssetProjectionMode(state.fixedAssetProjectionMode);
    setActiveWaccBasis(state.activeWaccBasis);
    setEemReturnOnTangibleAssetBasis(state.eemReturnOnTangibleAssetBasis);
    setActiveEemBasis(state.activeEemBasis);
    setActiveDcfBasis(state.activeDcfBasis);
    setProjectionPlanning(state.projectionPlanning);
    setAamAdjustments(state.aamAdjustments);
    setAssumptions(state.assumptions);
    setCaseProfile(state.caseProfile);
    setDlom(state.dlom);
    setDlocPfc(state.dlocPfc);
    setTaxSimulation(state.taxSimulation);
    setCashFlowOverrides(state.cashFlowOverrides);
    setCashFlowAccountInclusions(state.cashFlowAccountInclusions);
    setIncomeProjectionControls(state.incomeProjectionControls);
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

  function saveActiveWorkspaceNow(workspaceList = workspaces, workspaceId = activeWorkspaceId) {
    const savedAt = new Date().toISOString();
    const persistedState = buildPersistedWorkbenchState(getCurrentCoreState(), savedAt);
    const nextWorkspaces = markWorkspaceSaved(workspaceList, workspaceId, savedAt);

    persistWorkspaceState(workspaceId, persistedState);
    persistWorkspaceManifest({
      version: WORKSPACE_STORAGE_VERSION,
      activeWorkspaceId: workspaceId,
      workspaces: nextWorkspaces,
    });
    persistLegacyWorkbenchMirror(persistedState);

    return persistedState;
  }

  function applyWorkspaceState(workspaceId: string, state: PersistedWorkbenchState) {
    setActiveWorkspaceId(workspaceId);
    applyCoreState(buildRestoredCoreState(state));
    setUndoStack([]);
    setRedoStack([]);
    setActiveWorkflowTab("periods");

    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0 });
    }
  }

  function switchWorkspace(workspaceId: string) {
    if (workspaceId === activeWorkspaceId) {
      setIsWorkspaceMenuOpen(false);
      return;
    }

    saveActiveWorkspaceNow();

    const targetState = readWorkspaceState(workspaceId) ?? buildPersistedWorkbenchState(buildEmptyCoreState(), new Date().toISOString());

    persistWorkspaceManifest({
      version: WORKSPACE_STORAGE_VERSION,
      activeWorkspaceId: workspaceId,
      workspaces,
    });
    applyWorkspaceState(workspaceId, targetState);
    persistLegacyWorkbenchMirror(targetState);
    setIsWorkspaceMenuOpen(false);
    setRenamingWorkspaceId(null);
  }

  function createEmptyWorkspace() {
    const createdAt = new Date().toISOString();
    const workspaceId = createWorkspaceId();
    const workspace: WorkspaceMetadata = {
      id: workspaceId,
      name: buildUniqueWorkspaceName("Workspace Baru", workspaces),
      createdAt,
      updatedAt: createdAt,
    };
    const nextWorkspaces = [...workspaces, workspace];
    const state = buildPersistedWorkbenchState(buildEmptyCoreState(), createdAt);

    saveActiveWorkspaceNow(workspaces, activeWorkspaceId);
    persistWorkspaceState(workspaceId, state);
    persistWorkspaceManifest({
      version: WORKSPACE_STORAGE_VERSION,
      activeWorkspaceId: workspaceId,
      workspaces: nextWorkspaces,
    });
    persistLegacyWorkbenchMirror(state);
    setWorkspaces(nextWorkspaces);
    applyWorkspaceState(workspaceId, state);
    setIsWorkspaceMenuOpen(false);
  }

  function duplicateActiveWorkspace() {
    const createdAt = new Date().toISOString();
    const sourceName = activeWorkspace?.name || DEFAULT_WORKSPACE_NAME;
    const workspaceId = createWorkspaceId();
    const workspace: WorkspaceMetadata = {
      id: workspaceId,
      name: buildUniqueWorkspaceName(`${sourceName} - Salinan`, workspaces),
      createdAt,
      updatedAt: createdAt,
    };
    const nextWorkspaces = [...workspaces, workspace];
    const state = buildPersistedWorkbenchState(getCurrentCoreState(), createdAt);

    saveActiveWorkspaceNow(workspaces, activeWorkspaceId);
    persistWorkspaceState(workspaceId, state);
    persistWorkspaceManifest({
      version: WORKSPACE_STORAGE_VERSION,
      activeWorkspaceId: workspaceId,
      workspaces: nextWorkspaces,
    });
    persistLegacyWorkbenchMirror(state);
    setWorkspaces(nextWorkspaces);
    applyWorkspaceState(workspaceId, state);
    setIsWorkspaceMenuOpen(false);
  }

  function startRenameWorkspace(workspace: WorkspaceMetadata) {
    setRenamingWorkspaceId(workspace.id);
    setWorkspaceNameDraft(workspace.name);
  }

  function commitWorkspaceRename(workspaceId: string) {
    const trimmedName = workspaceNameDraft.trim();

    if (!trimmedName) {
      return;
    }

    const nextWorkspaces = workspaces.map((workspace) =>
      workspace.id === workspaceId
        ? {
            ...workspace,
            name: buildUniqueWorkspaceName(trimmedName, workspaces.filter((item) => item.id !== workspaceId)),
            updatedAt: new Date().toISOString(),
          }
        : workspace,
    );

    setWorkspaces(nextWorkspaces);
    persistWorkspaceManifest({
      version: WORKSPACE_STORAGE_VERSION,
      activeWorkspaceId,
      workspaces: nextWorkspaces,
    });
    setRenamingWorkspaceId(null);
    setWorkspaceNameDraft("");
    setIsWorkspaceMenuOpen(false);
  }

  function requestDeleteWorkspace(workspaceId: string) {
    const workspace = workspaces.find((item) => item.id === workspaceId);

    if (!workspace || workspaces.length <= 1) {
      return;
    }

    setIsWorkspaceMenuOpen(false);
    setRenamingWorkspaceId(null);
    setPendingConfirmation({
      title: `Hapus workspace "${workspace.name}"?`,
      description: "Data lokal workspace ini akan dihapus dari browser ini. Workspace lain tidak akan terdampak.",
      confirmLabel: "Hapus workspace",
      onConfirm: () => executeDeleteWorkspace(workspaceId),
    });
  }

  function executeDeleteWorkspace(workspaceId: string) {
    const nextWorkspaces = workspaces.filter((workspace) => workspace.id !== workspaceId);

    if (nextWorkspaces.length === 0) {
      return;
    }

    removeWorkspaceState(workspaceId);

    if (workspaceId === activeWorkspaceId) {
      const nextActiveWorkspaceId = nextWorkspaces[0].id;
      const nextState = readWorkspaceState(nextActiveWorkspaceId) ?? buildPersistedWorkbenchState(buildEmptyCoreState(), new Date().toISOString());

      setWorkspaces(nextWorkspaces);
      persistWorkspaceManifest({
        version: WORKSPACE_STORAGE_VERSION,
        activeWorkspaceId: nextActiveWorkspaceId,
        workspaces: nextWorkspaces,
      });
      persistLegacyWorkbenchMirror(nextState);
      applyWorkspaceState(nextActiveWorkspaceId, nextState);
      return;
    }

    setWorkspaces(nextWorkspaces);
    persistWorkspaceManifest({
      version: WORKSPACE_STORAGE_VERSION,
      activeWorkspaceId,
      workspaces: nextWorkspaces,
    });
  }

  function navigateToWorkflowTab(
    tabId: WorkflowTabId,
    options: { preserveGuidance?: boolean; preserveSourceFocus?: boolean } = {},
  ) {
    setActiveWorkflowTab(tabId);
    if (!options.preserveGuidance) {
      setGuidanceTarget(null);
    }
    if (!options.preserveSourceFocus) {
      setSourceFocusTarget(null);
    }

    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0 });
    }
  }

  function navigateToTraceSource(target: SourceFocusTarget) {
    setSourceFocusTarget(target);
    navigateToWorkflowTab(target.tabId, { preserveSourceFocus: true });
  }

  function navigateToGovernanceTarget(target: AssumptionGovernanceTarget) {
    navigateToWorkflowTab(target);
  }

  function clearGuidanceTarget(target: GuidanceTarget) {
    if (guidanceTarget === target) {
      setGuidanceTarget(null);
    }
  }

  function handleReadinessAction(item: ReadinessItem): boolean {
    if (item.targetTab === "periods" && item.targetLabel === "Tambah Periode") {
      navigateToWorkflowTab("periods", { preserveGuidance: true });
      setGuidanceTarget("add-period");
      return true;
    }

    if (item.targetTab === "periods" && item.label === "Jenis Perusahaan tersedia untuk basis DLOM dan rentang DLOC/PFC") {
      navigateToWorkflowTab("periods", { preserveGuidance: true });
      setGuidanceTarget("case-company-type");
      return true;
    }

    if (item.targetTab === "periods" && item.label === "Jenis Kepemilikan Saham tersedia untuk basis interest DLOM dan status DLOC/PFC") {
      navigateToWorkflowTab("periods", { preserveGuidance: true });
      setGuidanceTarget("case-share-ownership-type");
      return true;
    }

    if (item.targetTab === "periods" && item.targetLabel === "Isi Nilai Pengalihan") {
      navigateToWorkflowTab("periods", { preserveGuidance: true });
      setGuidanceTarget("case-capital-base-valued");
      return true;
    }

    if (item.targetTab === "periods" && item.label === "Porsi saham/modal yang dinilai valid") {
      navigateToWorkflowTab("periods", { preserveGuidance: true });
      setGuidanceTarget("case-capital-proportion");
      return true;
    }

    if (item.targetTab === "taxSimulation" && item.targetLabel === "Pilih Primary Method") {
      navigateToWorkflowTab("taxSimulation", { preserveGuidance: true });
      setGuidanceTarget("tax-primary-method");
      return true;
    }

    if (item.targetTab === "dlom" && (item.targetLabel === "Isi DLOM" || item.targetLabel === "Lengkapi DLOM")) {
      navigateToWorkflowTab("dlom", { preserveGuidance: true });
      setGuidanceTarget("dlom-questionnaire");
      return true;
    }

    if (item.targetTab === "dlocPfc" && (item.targetLabel === "Isi DLOC/PFC" || item.targetLabel === "Lengkapi DLOC/PFC")) {
      navigateToWorkflowTab("dlocPfc", { preserveGuidance: true });
      setGuidanceTarget("dloc-pfc-questionnaire");
      return true;
    }

    if (item.targetTab === "eemDcfAssumptions" && item.label === "Tarif pajak tersedia") {
      navigateToWorkflowTab("eemDcfAssumptions", { preserveGuidance: true });
      setGuidanceTarget("tax-rate-statutory");
      return true;
    }

    if (item.targetTab === "eemDcfAssumptions" && item.targetLabel === "Isi Tarif Pajak") {
      navigateToWorkflowTab("eemDcfAssumptions", { preserveGuidance: true });
      setGuidanceTarget("tax-rate-statutory");
      return true;
    }

    if (item.targetTab === "balance" && item.targetLabel === "Isi Neraca") {
      navigateToWorkflowTab("balance");
      addRow("balance_sheet");
      return true;
    }

    if (item.targetTab === "fixedAssets" && item.targetLabel === "Isi Aset Tetap") {
      navigateToWorkflowTab("fixedAssets");
      addFixedAssetScheduleRow();
      return true;
    }

    if (item.targetTab === "wacc" && item.label === "Input pasar WACC tersedia") {
      navigateToWorkflowTab("wacc", { preserveGuidance: true });
      setGuidanceTarget("wacc-market-suggestion");
      return true;
    }

    if (item.targetTab === "wacc" && item.label === "WACC tersedia") {
      navigateToWorkflowTab("wacc", { preserveGuidance: true });
      setGuidanceTarget("wacc-active-basis");
      return true;
    }

    if (item.targetTab === "eemDcfAssumptions" && item.label === "Terminal growth tersedia") {
      navigateToWorkflowTab("eemDcfAssumptions", { preserveGuidance: true });
      setGuidanceTarget("terminal-growth-suggestion");
      return true;
    }

    if (item.targetTab === "eemDcfAssumptions" && item.label === "Required return on NTA tersedia") {
      navigateToWorkflowTab("eemDcfAssumptions", { preserveGuidance: true });
      setGuidanceTarget("required-return-on-nta");
      return true;
    }

    if (item.targetTab === "eemDcfAssumptions" && item.label === "Driver hari modal kerja tersedia") {
      navigateToWorkflowTab("eemDcfAssumptions", { preserveGuidance: true });
      setGuidanceTarget("working-capital-driver");
      return true;
    }

    if (item.targetTab === "income" && item.targetLabel === "Isi Laba Rugi") {
      navigateToWorkflowTab("income");
      addRow("income_statement");
      return true;
    }

    return false;
  }

  useEffect(() => {
    if (!guidanceTarget || typeof document === "undefined") {
      return;
    }

    const target = document.querySelector<HTMLElement>(`[data-guidance-target="${guidanceTarget}"]`);
    if (!target) {
      return;
    }

    const prefersReducedMotion =
      typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.setTimeout(() => {
      target.scrollIntoView({ block: "center", behavior: prefersReducedMotion ? "auto" : "smooth" });
    }, 80);
  }, [activeWorkflowTab, guidanceTarget]);

  useEffect(() => {
    if (!sourceFocusTarget || activeWorkflowTab !== sourceFocusTarget.tabId) {
      return;
    }

    const selector = sourceFocusTarget.targetKey
      ? `[data-source-focus-target="${sourceFocusTarget.targetKey}"]`
      : activeWorkflowTab === "valuationEem"
        ? `[data-source-focus-row="${sourceFocusTarget.traceId}"]`
        : "";

    if (!selector) {
      return;
    }

    const target = document.querySelector<HTMLElement>(selector);
    if (!target) {
      return;
    }

    const prefersReducedMotion =
      typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.setTimeout(() => {
      target.scrollIntoView({ block: "center", behavior: prefersReducedMotion ? "auto" : "smooth" });
    }, 80);
  }, [activeWorkflowTab, sourceFocusTarget]);

  useEffect(() => {
    const storedWorkspace = readPersistedWorkspaceSnapshot();

    setWorkspaces(storedWorkspace.manifest.workspaces);
    setActiveWorkspaceId(storedWorkspace.manifest.activeWorkspaceId);
    applyCoreState(buildRestoredCoreState(storedWorkspace.activeState));
    setUndoStack([]);
    setRedoStack([]);

    setIsSidebarCollapsed(readStoredSidebarState());
    setIsDraftRestored(true);
  }, []);

  useEffect(() => {
    if (!isDraftRestored) {
      return;
    }

    const savedAt = new Date().toISOString();
    const persistedState = buildPersistedWorkbenchState(
      {
        periods,
        activePeriodId,
        rows,
        isFixedAssetScheduleEnabled,
        fixedAssetScheduleRows,
        debtScheduleInputs,
        fixedAssetProjectionMode,
        activeWaccBasis,
        eemReturnOnTangibleAssetBasis,
        activeDcfBasis,
        activeEemBasis,
        projectionPlanning,
        aamAdjustments,
        assumptions,
        caseProfile,
        dlom,
        dlocPfc,
        taxSimulation,
        cashFlowOverrides,
        cashFlowAccountInclusions,
        incomeProjectionControls,
      },
      savedAt,
    );
    const nextWorkspaces = markWorkspaceSaved(workspaces, activeWorkspaceId, savedAt);

    persistWorkspaceState(activeWorkspaceId, persistedState);
    persistWorkspaceManifest({
      version: WORKSPACE_STORAGE_VERSION,
      activeWorkspaceId,
      workspaces: nextWorkspaces,
    });
    persistLegacyWorkbenchMirror(persistedState);
  }, [
    aamAdjustments,
    activeWaccBasis,
    eemReturnOnTangibleAssetBasis,
    activeDcfBasis,
    activeEemBasis,
    activePeriodId,
    activeWorkspaceId,
    assumptions,
    cashFlowAccountInclusions,
    cashFlowOverrides,
    caseProfile,
    debtScheduleInputs,
    dlocPfc,
    dlom,
    fixedAssetScheduleRows,
    fixedAssetProjectionMode,
    incomeProjectionControls,
    isDraftRestored,
    isFixedAssetScheduleEnabled,
    periods,
    projectionPlanning,
    rows,
    taxSimulation,
    workspaces,
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

  useEffect(() => {
    if (!isWorkspaceMenuOpen || typeof document === "undefined") {
      return;
    }

    const closeOnOutsidePointer = (event: MouseEvent) => {
      const target = event.target;

      if (target instanceof Node && workspaceMenuRef.current?.contains(target)) {
        return;
      }

      setIsWorkspaceMenuOpen(false);
      setRenamingWorkspaceId(null);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsWorkspaceMenuOpen(false);
        setRenamingWorkspaceId(null);
      }
    };

    document.addEventListener("mousedown", closeOnOutsidePointer);
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("mousedown", closeOnOutsidePointer);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isWorkspaceMenuOpen]);

  useEffect(() => {
    if ((!isPdfExportMenuOpen && !isXlsxExportMenuOpen && !isJsonMenuOpen) || typeof document === "undefined") {
      return;
    }

    const closeOnOutsidePointer = (event: MouseEvent) => {
      const target = event.target;

      if (
        target instanceof Node &&
        (
          pdfExportMenuRef.current?.contains(target) ||
          xlsxExportMenuRef.current?.contains(target) ||
          jsonMenuRef.current?.contains(target)
        )
      ) {
        return;
      }

      setIsPdfExportMenuOpen(false);
      setIsXlsxExportMenuOpen(false);
      setIsJsonMenuOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsPdfExportMenuOpen(false);
        setIsXlsxExportMenuOpen(false);
        setIsJsonMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", closeOnOutsidePointer);
    document.addEventListener("keydown", closeOnEscape);

    return () => {
      document.removeEventListener("mousedown", closeOnOutsidePointer);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isPdfExportMenuOpen, isXlsxExportMenuOpen, isJsonMenuOpen]);

  function addPeriod() {
    if (guidanceTarget === "add-period") {
      setGuidanceTarget(null);
    }

    commitCoreState((current) => {
      const period = createHistoricalPeriod(current.periods);
      const nextPeriods = normalizePeriods([...current.periods, period]);

      return {
        ...current,
        periods: nextPeriods,
        rows: current.rows.map((row) => ({ ...row, values: { ...row.values, [period.id]: "" } })),
        fixedAssetScheduleRows: ensureFixedAssetSchedulePeriods(current.fixedAssetScheduleRows, nextPeriods),
        debtScheduleInputs: ensureDebtScheduleInputPeriods(current.debtScheduleInputs, nextPeriods),
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
    if (
      (key === "companyType" && guidanceTarget === "case-company-type") ||
      (key === "shareOwnershipType" && guidanceTarget === "case-share-ownership-type") ||
      (key === "capitalBaseValued" && guidanceTarget === "case-capital-base-valued") ||
      ((key === "capitalBaseFull" || key === "capitalBaseValued") && guidanceTarget === "case-capital-proportion")
    ) {
      setGuidanceTarget(null);
    }

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
      const nextComparableValuationDate = resolveComparableValuationDate(nextCaseProfile, nextPeriods, current.activePeriodId);
      const nextAssumptions =
        shouldRefreshSectorSuggestions
          ? applyIdxComparableSuggestions(current.assumptions, nextCaseProfile.companySector, "empty-only", nextComparableValuationDate)
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
    const periodToRemove = periods.find((period) => period.id === id);

    if (!periodToRemove || periods.length === 1 || getPeriodYearOffset(periodToRemove) === 0) {
      return;
    }

    setPendingConfirmation({
      title: `Hapus periode ${periodToRemove.label || "ini"}?`,
      description:
        "Seluruh nilai akun, jadwal aset tetap, dan override cash-flow pada periode ini akan dihapus dari model aktif. Tindakan ini dapat dibatalkan melalui Undo.",
      confirmLabel: "Hapus periode",
      onConfirm: () => deletePeriod(id),
    });
  }

  function deletePeriod(id: string) {
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
      const debtScheduleInputs = { ...current.debtScheduleInputs };
      delete debtScheduleInputs[id];

      return {
        ...current,
        periods: nextPeriods,
        rows,
        fixedAssetScheduleRows,
        debtScheduleInputs,
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
                  [key]: formatEditableInteger(value),
                },
              },
            }
          : row,
      ),
    }));
  }

  function removeFixedAssetScheduleRow(id: string) {
    const fixedAssetRow = fixedAssetScheduleRows.find((row) => row.id === id);
    const assetName = fixedAssetRow?.assetName.trim() || "kelas aset ini";

    setPendingConfirmation({
      title: "Hapus kelas aset?",
      description: `Kelas aset ${assetName} beserta biaya perolehan dan penyusutannya akan dihapus dari jadwal aset tetap aktif. Tindakan ini dapat dibatalkan melalui Undo.`,
      confirmLabel: "Hapus kelas aset",
      onConfirm: () => deleteFixedAssetScheduleRow(id),
    });
  }

  function deleteFixedAssetScheduleRow(id: string) {
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
        adjustment: patch.adjustment !== undefined ? formatEditableInteger(patch.adjustment) : currentEntry.adjustment,
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
    const row = rows.find((item) => item.id === id);
    const accountName = row?.accountName.trim() || "baris akun ini";
    const statementLabel = row ? statementLabels[row.statement] : "laporan keuangan";

    setPendingConfirmation({
      title: "Hapus akun?",
      description: `Akun ${accountName} pada ${statementLabel} akan dihapus dari model aktif. Tindakan ini memengaruhi perhitungan sampai Anda membatalkannya melalui Undo.`,
      confirmLabel: "Hapus akun",
      onConfirm: () => deleteRow(id),
    });
  }

  function deleteRow(id: string) {
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
      assumptions: markManualAssumptionSource({ ...current.assumptions, [key]: formatAssumptionInput(key, value) }, key),
    }));
  }

  function updateAssumptionText(key: keyof AssumptionState, value: string) {
    commitCoreState((current) => ({
      ...current,
      assumptions: { ...current.assumptions, [key]: value },
    }));
  }

  function updateDlomFactor(id: DlomFactorId, patch: Partial<DlomState["factors"][DlomFactorId]>) {
    if (guidanceTarget === "dlom-questionnaire" && typeof patch.answer === "string" && patch.answer.trim() !== "") {
      setGuidanceTarget(null);
    }

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
    if (guidanceTarget === "dloc-pfc-questionnaire" && typeof patch.answer === "string" && patch.answer.trim() !== "") {
      setGuidanceTarget(null);
    }

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
    if (guidanceTarget === "tax-primary-method" && typeof patch.primaryMethod === "string" && patch.primaryMethod.trim() !== "") {
      setGuidanceTarget(null);
    }

    commitCoreState((current) => ({
      ...current,
      taxSimulation: normalizeTaxSimulationState({
        ...current.taxSimulation,
        ...patch,
        reportedTransferValue:
          patch.reportedTransferValue !== undefined
            ? formatEditableInteger(patch.reportedTransferValue)
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
        value: patch.value !== undefined ? formatEditableInteger(patch.value) : currentEntry.value,
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

  function toggleCashFlowAccountInclusion(rowKey: CashFlowWorkingCapitalRowKey, accountRowId: string, included: boolean) {
    commitCoreState((current) => {
      const nextInclusions: CashFlowAccountInclusionState = { ...current.cashFlowAccountInclusions };
      nextInclusions[rowKey] = {
        ...(nextInclusions[rowKey] ?? {}),
        [accountRowId]: included,
      };

      return {
        ...current,
        cashFlowAccountInclusions: nextInclusions,
      };
    });
  }

  function updateDebtScheduleInput(periodId: string, key: DebtScheduleInputKey, value: string) {
    commitCoreState((current) => {
      const nextInputs = { ...current.debtScheduleInputs };
      const nextPeriodInput: DebtSchedulePeriodInput = { ...(nextInputs[periodId] ?? {}) };
      const nextValue = formatEditableNumber(value);

      if (nextValue.trim()) {
        nextPeriodInput[key] = nextValue;
      } else {
        delete nextPeriodInput[key];
      }

      if (Object.keys(nextPeriodInput).length > 0) {
        nextInputs[periodId] = nextPeriodInput;
      } else {
        delete nextInputs[periodId];
      }

      return {
        ...current,
        debtScheduleInputs: ensureDebtScheduleInputPeriods(nextInputs, current.periods),
      };
    });
  }

  function updateIncomeProjectionYearOverride(year: number, key: IncomeProjectionOverrideField, value: string) {
    commitCoreState((current) => {
      const yearKey = String(year);
      const now = new Date().toISOString();
      const currentEntry = current.incomeProjectionControls.yearlyOverrides[yearKey] ?? createEmptyIncomeProjectionYearOverride();
      const nextValue = formatEditableNumber(value);
      const nextEntry: IncomeProjectionYearOverrideState = {
        ...currentEntry,
        [key]: nextValue,
        updatedAt: now,
      };
      const yearlyOverrides = writeIncomeProjectionYearOverride(
        current.incomeProjectionControls.yearlyOverrides,
        yearKey,
        nextEntry,
      );
      const auditEvents =
        nextValue === currentEntry[key]
          ? current.incomeProjectionControls.auditEvents
          : [
              ...current.incomeProjectionControls.auditEvents,
              createIncomeProjectionAuditEvent({
                action: "yearly_override_updated",
                field: `${year}.${key}`,
                priorValue: currentEntry[key],
                newValue: nextValue,
                reason: currentEntry.reason,
                impact: "Reviewer-owned yearly override scenario; baseline DCF remains protected until governance approval.",
              }),
            ];

      return {
        ...current,
        incomeProjectionControls: {
          ...current.incomeProjectionControls,
          yearlyOverrides,
          auditEvents,
        },
      };
    });
  }

  function updateIncomeProjectionYearOverrideReason(year: number, reason: string) {
    commitCoreState((current) => {
      const yearKey = String(year);
      const currentEntry = current.incomeProjectionControls.yearlyOverrides[yearKey] ?? createEmptyIncomeProjectionYearOverride();
      const nextEntry: IncomeProjectionYearOverrideState = {
        ...currentEntry,
        reason,
        updatedAt: new Date().toISOString(),
      };

      return {
        ...current,
        incomeProjectionControls: {
          ...current.incomeProjectionControls,
          yearlyOverrides: writeIncomeProjectionYearOverride(
            current.incomeProjectionControls.yearlyOverrides,
            yearKey,
            nextEntry,
          ),
        },
      };
    });
  }

  function updateIncomeProjectionReviewerDecision(patch: Partial<IncomeProjectionReviewerDecisionState>) {
    commitCoreState((current) => {
      const now = new Date().toISOString();
      const currentDecision = current.incomeProjectionControls.reviewerDecision;
      const nextDecision: IncomeProjectionReviewerDecisionState = {
        ...currentDecision,
        ...patch,
        updatedAt: now,
      };
      const auditEvents =
        patch.decision && patch.decision !== currentDecision.decision
          ? [
              ...current.incomeProjectionControls.auditEvents,
              createIncomeProjectionAuditEvent({
                action: "reviewer_decision_updated",
                field: "reviewerDecision.decision",
                priorValue: currentDecision.decision,
                newValue: patch.decision,
                reason: currentDecision.reason,
                impact: "Reviewer decision controls whether scenario can be relied upon; critical variance still falls back to current DCF.",
              }),
            ]
          : current.incomeProjectionControls.auditEvents;

      return {
        ...current,
        incomeProjectionControls: {
          ...current.incomeProjectionControls,
          reviewerDecision: nextDecision,
          auditEvents,
        },
      };
    });
  }

  function updateIncomeProjectionNonOperatingPolicy(patch: Partial<IncomeProjectionNonOperatingPolicyState>) {
    commitCoreState((current) => {
      const now = new Date().toISOString();
      const currentPolicy = current.incomeProjectionControls.nonOperatingPolicy;
      const nextPolicy: IncomeProjectionNonOperatingPolicyState = {
        ...currentPolicy,
        ...patch,
        updatedAt: now,
      };
      const auditEvents =
        patch.policy && patch.policy !== currentPolicy.policy
          ? [
              ...current.incomeProjectionControls.auditEvents,
              createIncomeProjectionAuditEvent({
                action: "non_operating_policy_updated",
                field: "nonOperatingPolicy.policy",
                priorValue: currentPolicy.policy,
                newValue: patch.policy,
                reason: currentPolicy.reason,
                impact: "Controls recurring vs non-recurring non-operating income in presentation scenario.",
              }),
            ]
          : current.incomeProjectionControls.auditEvents;

      return {
        ...current,
        incomeProjectionControls: {
          ...current.incomeProjectionControls,
          nonOperatingPolicy: nextPolicy,
          auditEvents,
        },
      };
    });
  }

  function updateIncomeProjectionPresentationAssumption(key: IncomeProjectionPresentationAssumptionKey, value: string) {
    commitCoreState((current) => {
      const now = new Date().toISOString();
      const currentAssumptions = current.incomeProjectionControls.presentationAssumptions;
      const nextValue = formatEditableNumber(value);
      const nextAssumptions: IncomeProjectionPresentationAssumptionState = {
        ...currentAssumptions,
        [key]: nextValue,
        updatedAt: now,
      };
      const auditEvents =
        nextValue === currentAssumptions[key]
          ? current.incomeProjectionControls.auditEvents
          : [
              ...current.incomeProjectionControls.auditEvents,
              createIncomeProjectionAuditEvent({
                action: "presentation_assumption_updated",
                field: `presentationAssumptions.${key}`,
                priorValue: currentAssumptions[key],
                newValue: nextValue,
                reason: currentAssumptions.reason,
                impact: "Reviewer-owned cash/debt/yield presentation scenario; operating FCFF bridge remains formula-driven.",
              }),
            ];

      return {
        ...current,
        incomeProjectionControls: {
          ...current.incomeProjectionControls,
          presentationAssumptions: nextAssumptions,
          auditEvents,
        },
      };
    });
  }

  function updateIncomeProjectionPresentationAssumptionReason(reason: string) {
    commitCoreState((current) => ({
      ...current,
      incomeProjectionControls: {
        ...current.incomeProjectionControls,
        presentationAssumptions: {
          ...current.incomeProjectionControls.presentationAssumptions,
          reason,
          updatedAt: new Date().toISOString(),
        },
      },
    }));
  }

  function updateProjectionPlanning(patch: Partial<ProjectionPlanningState>) {
    commitCoreState((current) => {
      const nextProjectionPlanning = normalizeProjectionPlanningPatch(current.projectionPlanning, patch);

      return {
        ...current,
        projectionPlanning: nextProjectionPlanning,
      };
    });
  }

  function applyIncomeProjectionSmartSuggestions() {
    const forecast = activeDcf.forecast;
    const now = new Date().toISOString();
    const suggestedReason = "Auto smart suggestion dari baseline forecast, snapshot, dan input interoperabel.";

    commitCoreState((current) => {
      const yearlyOverrides = Object.fromEntries(
        forecast.map((row, index) => {
          const yearKey = String(row.year);
          const currentEntry = current.incomeProjectionControls.yearlyOverrides[yearKey] ?? createEmptyIncomeProjectionYearOverride();
          const nextEntry: IncomeProjectionYearOverrideState = {
            ...currentEntry,
            revenueGrowth: formatRateInputNumber(readIncomeProjectionDefaultRate("revenueGrowth", row, index, forecast, snapshot)),
            grossProfitMargin: formatRateInputNumber(readIncomeProjectionDefaultRate("grossProfitMargin", row, index, forecast, snapshot)),
            operatingExpenseMargin: formatRateInputNumber(readIncomeProjectionDefaultRate("operatingExpenseMargin", row, index, forecast, snapshot)),
            depreciationMargin: formatRateInputNumber(readIncomeProjectionDefaultRate("depreciationMargin", row, index, forecast, snapshot)),
            reason: currentEntry.reason.trim() || suggestedReason,
            updatedAt: now,
          };

          return [yearKey, nextEntry];
        }),
      ) as Record<string, IncomeProjectionYearOverrideState>;
      const currentPresentation = current.incomeProjectionControls.presentationAssumptions;
      const presentationAssumptions: IncomeProjectionPresentationAssumptionState = {
        ...currentPresentation,
        cashYield: formatRateInputNumber(readIncomeProjectionPresentationDefault("cashYield", snapshot)),
        debtRate: formatRateInputNumber(readIncomeProjectionPresentationDefault("debtRate", snapshot)),
        interestIncomeRevenueMargin: formatRateInputNumber(readIncomeProjectionPresentationDefault("interestIncomeRevenueMargin", snapshot)),
        interestExpenseRevenueMargin: formatRateInputNumber(readIncomeProjectionPresentationDefault("interestExpenseRevenueMargin", snapshot)),
        reason: currentPresentation.reason.trim() || suggestedReason,
        updatedAt: now,
      };

      return {
        ...current,
        incomeProjectionControls: {
          ...current.incomeProjectionControls,
          yearlyOverrides,
          presentationAssumptions,
          auditEvents: [
            ...current.incomeProjectionControls.auditEvents,
            createIncomeProjectionAuditEvent({
              action: "smart_suggestions_applied",
              field: "incomeProjectionControls.autoSmartSuggestions",
              priorValue: summarizeIncomeProjectionAppliedState(current.incomeProjectionControls),
              newValue: `${forecast.length} yearly override rows + ${incomeProjectionPresentationAssumptionFields.length} presentation assumptions`,
              reason: "Pengguna menerapkan semua auto smart suggestion.",
              impact: "Menyalin suggestion interoperabel ke scenario reviewer; baseline DCF tetap protected sampai approval dan variance check valid.",
            }),
          ],
        },
      };
    });
  }

  function updateWaccComparableName(slot: WaccComparableSlot, value: string) {
    commitCoreState((current) => {
      const selectedComparable = findIdxComparableByLabel(current.caseProfile.companySector, value, {
        valuationDate: resolveComparableValuationDate(current.caseProfile, current.periods, current.activePeriodId),
      });

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
      assumptions: applyIdxComparableSuggestions(
        current.assumptions,
        current.caseProfile.companySector,
        "replace",
        resolveComparableValuationDate(current.caseProfile, current.periods, current.activePeriodId),
      ),
    }));
  }

  function applyAssumptionCandidate(key: DriverAssumptionKey, candidate: AssumptionCandidate) {
    if (key === "taxRate" && candidate.id === "statutory-general" && guidanceTarget === "tax-rate-statutory") {
      setGuidanceTarget(null);
    }

    const sourceKey = assumptionSourceKeyByDriver[key];
    const reasonKey = assumptionReasonKeyByDriver[key];

    commitCoreState((current) => ({
      ...current,
      assumptions: {
        ...current.assumptions,
        [key]: formatRateInputNumber(candidate.value),
        [sourceKey]: candidate.id,
        [reasonKey]: "",
      },
    }));
  }

  function applyWaccMarketSuggestion(suggestion: MarketAssumptionSuggestion) {
    clearGuidanceTarget("wacc-market-suggestion");
    const averageDebtRate = roundDiscountRateDebtRate(averageInvestmentLoanRate(suggestion));
    const sourceNote = `Saran sistem tahunan ${suggestion.year}; ERP/default spread dari Damodaran, proxy SUN dari bukti pasar, dan debt rate dari rata-rata SBDK korporasi OJK untuk lima kelompok bank: Persero, Pemda/BPD, Swasta, Asing/KCBA, dan Campuran.`;

    commitCoreState((current) => ({
      ...current,
      activeWaccBasis: "governed",
      assumptions: {
        ...current.assumptions,
        wacc: "",
        waccRiskFreeRate: formatRateInputNumber(suggestion.metrics.riskFreeSun.value),
        waccEquityRiskPremium: formatRateInputNumber(suggestion.metrics.equityRiskPremium.value),
        waccRatingBasedDefaultSpread: formatRateInputNumber(suggestion.metrics.ratingBasedDefaultSpread.value),
        waccCountryRiskPremium: formatRateInputNumber(-suggestion.metrics.ratingBasedDefaultSpread.value),
        waccSpecificRiskPremium: current.assumptions.waccSpecificRiskPremium.trim() || formatRateInputNumber(0),
        waccPreTaxCostOfDebt: formatRateInputNumber(averageDebtRate),
        waccBankPerseroInvestmentLoanRate: formatRateInputNumber(suggestion.metrics.bankPerseroInvestmentLoan.value),
        waccBankPemdaInvestmentLoanRate: formatRateInputNumber(suggestion.metrics.bankPemdaInvestmentLoan.value),
        waccBankSwastaInvestmentLoanRate: formatRateInputNumber(suggestion.metrics.bankSwastaInvestmentLoan.value),
        waccBankAsingInvestmentLoanRate: formatRateInputNumber(suggestion.metrics.bankAsingInvestmentLoan.value),
        waccBankCampuranInvestmentLoanRate: formatRateInputNumber(suggestion.metrics.bankCampuranInvestmentLoan.value),
        waccBankUmumInvestmentLoanRate: formatRateInputNumber(suggestion.metrics.bankUmumInvestmentLoan.value),
        waccSource: `market-suggestion-${suggestion.year}`,
        waccOverrideReason: sourceNote,
      },
    }));
  }

  function applyTerminalGrowthSuggestion(suggestion: TerminalGrowthSuggestion) {
    clearGuidanceTarget("terminal-growth-suggestion");
    commitCoreState((current) => ({
      ...current,
      assumptions: {
        ...current.assumptions,
        terminalGrowth: formatRateInputNumber(suggestion.baseGrowth),
        terminalGrowthDownside: formatRateInputNumber(suggestion.downsideGrowth),
        terminalGrowthUpside: formatRateInputNumber(suggestion.upsideGrowth),
        terminalGrowthSource: suggestion.sourceId,
        terminalGrowthOverrideReason: suggestion.reason,
      },
    }));
  }

  function applyInvestedCapitalGrowthSuggestion(suggestion: InvestedCapitalGrowthRateSuggestion) {
    clearGuidanceTarget("terminal-growth-suggestion");
    commitCoreState((current) => ({
      ...current,
      assumptions: {
        ...current.assumptions,
        terminalGrowth: formatRateInputNumber(suggestion.baseGrowth),
        terminalGrowthDownside: formatRateInputNumber(suggestion.downsideGrowth),
        terminalGrowthUpside: formatRateInputNumber(suggestion.upsideGrowth),
        terminalGrowthSource: suggestion.sourceId,
        terminalGrowthOverrideReason: suggestion.reason,
      },
    }));
  }

  function loadSample() {
    const samplePeriods = buildSamplePeriods();
    const sampleFixedAssetScheduleRows = buildSampleFixedAssetScheduleRows();
    const sampleAssumptions = buildSampleAssumptions();
    commitCoreState((current) => ({
      ...current,
      periods: samplePeriods,
      activePeriodId: "p2021",
      rows: buildSampleRows().filter((row) => row.id !== "sample-fixed-net"),
      isFixedAssetScheduleEnabled: true,
      fixedAssetScheduleRows: sampleFixedAssetScheduleRows,
      debtScheduleInputs: buildSampleDebtScheduleInputs(),
      fixedAssetProjectionMode: defaultFixedAssetProjectionMode,
      activeWaccBasis: inferInitialWaccBasis(sampleAssumptions),
      eemReturnOnTangibleAssetBasis: defaultEemReturnOnTangibleAssetBasis,
      activeEemBasis: defaultActiveEemBasis,
      activeDcfBasis: defaultActiveDcfBasis,
      projectionPlanning: { ...defaultProjectionPlanning },
      aamAdjustments: {},
      assumptions: sampleAssumptions,
      caseProfile: buildSampleCaseProfile(),
      dlom: buildSampleDlomState(),
      dlocPfc: buildSampleDlocPfcState(),
      taxSimulation: buildSampleTaxSimulationState(),
      cashFlowOverrides: {},
      cashFlowAccountInclusions: {},
      incomeProjectionControls: createEmptyIncomeProjectionControls(),
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
      results: activeResults,
      baseResults: results,
      activeWaccBasis: effectiveActiveWaccBasis,
      activeWaccBasisLabel: activeWaccBasisLabels[effectiveActiveWaccBasis].label,
      activeWaccBasisSummary: activeWaccBasisLabels[effectiveActiveWaccBasis].summary,
      activeEemReturnOnTangibleAssetBasis: eemReturnOnTangibleAssetSelection.value,
      activeEemReturnOnTangibleAssetLabel: eemReturnOnTangibleAssetSelection.label,
      activeEemReturnOnTangibleAssetSummary: eemReturnOnTangibleAssetSelection.summary,
      activeEemBasis,
      activeEemBasisLabel: activeEemSelection.label,
      activeEemBasisSummary: activeEemSelection.summary,
      activeDcfBasis,
      activeDcfBasisLabel: activeDcfSelection.label,
      activeDcfBasisSummary: activeDcfSelection.summary,
      activeDcfProjectionHorizonYears: activeDcfSelection.projectionHorizonYears,
      activeDcfTerminalTreatment: activeDcfSelection.terminalTreatment,
      activeDcfTerminalTreatmentLabel:
        terminalTreatmentLabels[activeDcfSelection.terminalTreatment]?.label ?? "Default terminal value",
      activeDcfTerminalTreatmentSummary:
        terminalTreatmentLabels[activeDcfSelection.terminalTreatment]?.description ?? "Terminal value mengikuti growth/WACC.",
      activeDcfTerminalTreatmentReason: projectionPlanning.terminalTreatmentReason,
      activeDcfTerminalValue: activeDcfSelection.terminalValueOverride ?? activeDcfSelection.residualValue,
      dlomCalculation,
      dlocPfcCalculation,
      taxSimulation,
      taxSimulationResult,
      sectionAnalysis,
      readiness,
      validationChecks: checks,
    };
  }

  function exportPdfReport(scopeId: ValuationPdfExportScopeId) {
    try {
      const payload = saveValuationPdfExportPayload(getExportInput(), scopeId);
      const filename = buildPdfExportFilename(payload.input.caseProfile.objectTaxpayerName, payload.scope.id);
      const query = new URLSearchParams({ filename });

      setIsPdfExportMenuOpen(false);
      window.open(`/export/pdf?${query.toString()}`, "_blank", "noopener,noreferrer");
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Export PDF gagal dijalankan.");
    }
  }

  function exportXlsxReport(scopeId: ValuationXlsxExportScopeId) {
    try {
      const file = createValuationXlsxFile(getExportInput(), scopeId);
      const blob = buildValuationXlsxBlob(file);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      link.download = file.filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setIsXlsxExportMenuOpen(false);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Export XLSX gagal dijalankan.");
    }
  }

  function exportJsonDraft() {
    try {
      downloadValuationJsonExport(getCurrentCoreState());
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Export JSON gagal dijalankan.");
    } finally {
      setIsJsonMenuOpen(false);
    }
  }

  function requestJsonImport() {
    setIsJsonMenuOpen(false);
    jsonImportInputRef.current?.click();
  }

  function handleJsonImportInputChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];

    if (!file) {
      return;
    }

    void importJsonDraft(file);
  }

  async function importJsonDraft(file: File) {
    setIsJsonImporting(true);

    try {
      const candidate = parseValuationJsonImport(await file.text(), file.name);

      setPendingConfirmation({
        title: "Import JSON sebagai workspace baru?",
        description: formatJsonImportConfirmationDescription(candidate.summary),
        confirmLabel: "Import JSON",
        onConfirm: () => executeJsonImport(candidate),
      });
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Import JSON gagal dijalankan.");
    } finally {
      setIsJsonImporting(false);

      if (jsonImportInputRef.current) {
        jsonImportInputRef.current.value = "";
      }
    }
  }

  function executeJsonImport(candidate: ValuationJsonImportCandidate) {
    const createdAt = new Date().toISOString();
    const workspaceId = createWorkspaceId();
    const importedState: PersistedWorkbenchState = {
      ...candidate.state,
      version: WORKBENCH_STORAGE_VERSION,
      savedAt: createdAt,
    };
    const workspace: WorkspaceMetadata = {
      id: workspaceId,
      name: buildUniqueWorkspaceName(buildImportedWorkspaceName(candidate.summary), workspaces),
      createdAt,
      updatedAt: createdAt,
    };
    const nextWorkspaces = [...workspaces, workspace];

    saveActiveWorkspaceNow(workspaces, activeWorkspaceId);
    persistWorkspaceState(workspaceId, importedState);
    persistWorkspaceManifest({
      version: WORKSPACE_STORAGE_VERSION,
      activeWorkspaceId: workspaceId,
      workspaces: nextWorkspaces,
    });
    persistLegacyWorkbenchMirror(importedState);
    setWorkspaces(nextWorkspaces);
    applyWorkspaceState(workspaceId, importedState);
  }

  function resetForm() {
    setPendingConfirmation({
      title: "Reset seluruh model?",
      description: "Semua input, asumsi, proyeksi, dan override di workspace aktif akan dikosongkan. Workspace lain tidak akan terdampak.",
      confirmLabel: "Reset",
      onConfirm: executeResetForm,
    });
  }

  function executeResetForm() {
    clearPersistedWorkbenchState();
    commitCoreState(() => buildEmptyCoreState());

    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0 });
    }
  }

  return (
    <main className={isSidebarCollapsed ? "app-shell sidebar-collapsed" : "app-shell"} data-testid="valuation-workbench">
      {pendingConfirmation ? (
        <div className="confirmation-dialog-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget) {
            setPendingConfirmation(null);
          }
        }}>
          <section
            aria-describedby="confirmation-dialog-description"
            aria-labelledby="confirmation-dialog-title"
            aria-modal="true"
            className="confirmation-dialog"
            role="dialog"
          >
            <div className="confirmation-dialog-icon" aria-hidden="true">
              <AlertTriangle size={18} />
            </div>
            <div className="confirmation-dialog-copy">
              <h2 id="confirmation-dialog-title">{pendingConfirmation.title}</h2>
              <p id="confirmation-dialog-description">{pendingConfirmation.description}</p>
            </div>
            <div className="confirmation-dialog-actions">
              <button className="button ghost" type="button" onClick={() => setPendingConfirmation(null)} autoFocus>
                Batal
              </button>
              <button
                className="button danger"
                type="button"
                onClick={() => {
                  const action = pendingConfirmation.onConfirm;
                  setPendingConfirmation(null);
                  action();
                }}
              >
                {pendingConfirmation.confirmLabel}
              </button>
            </div>
          </section>
        </div>
      ) : null}
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
            {workflowNavigationGroups.map((group) => (
              <div className="nav-group" role="group" aria-label={group.label} key={group.label}>
                <p className="nav-group-label">{group.label}</p>
                <div className="nav-group-items">
                  {group.tabs.map((item) => (
                    <button
                      className={[
                        activeWorkflowTab === item.id ? "active" : "",
                        sourceFocusTarget?.tabId === item.id ? "source-focus-tab" : "",
                      ]
                        .filter(Boolean)
                        .join(" ")}
                      type="button"
                      onClick={() => navigateToWorkflowTab(item.id)}
                      aria-current={activeWorkflowTab === item.id ? "page" : undefined}
                      aria-label={item.label}
                      title={`${item.label}: ${formatMethodList(item.methods)}`}
                      key={item.id}
                    >
                      <span className="workflow-tab-label">{item.label}</span>
                      <WorkflowMethodBadges methods={item.methods} />
                    </button>
                  ))}
                  {group.label === "Review" && authUserId ? <AuthSidebarActions userId={authUserId} isSuperAdmin={isSuperAdmin} /> : null}
                </div>
              </div>
            ))}
          </nav>
        </aside>
      )}

      <section className="workspace">
        <div className="sticky-workspace-header" data-testid="workspace-header">
          <header className="topbar">
            <div className="topbar-context">
              <div className="workspace-switcher" ref={workspaceMenuRef}>
                <button
                  className="workspace-switcher-trigger"
                  type="button"
                  onClick={() => setIsWorkspaceMenuOpen((isOpen) => !isOpen)}
                  disabled={!isDraftRestored}
                  aria-haspopup="menu"
                  aria-expanded={isWorkspaceMenuOpen}
                  aria-label={`Workspace aktif: ${activeWorkspace?.name || DEFAULT_WORKSPACE_NAME}`}
                  title="Kelola workspace lokal"
                >
                  <GitBranch size={16} />
                  <span className="workspace-switcher-name">{activeWorkspace?.name || DEFAULT_WORKSPACE_NAME}</span>
                  <span className="workspace-count">{workspaces.length}</span>
                  <ChevronDown size={14} />
                </button>
                {isWorkspaceMenuOpen ? (
                  <div className="workspace-menu" role="menu" aria-label="Kelola workspace lokal">
                    <div className="workspace-menu-heading">
                      <span>Workspace lokal</span>
                      <small>Data tersimpan terpisah di browser ini</small>
                    </div>
                    <div className="workspace-menu-list">
                      {workspaces.map((workspace) => {
                        const isActive = workspace.id === activeWorkspaceId;
                        const isRenaming = renamingWorkspaceId === workspace.id;

                        return (
                          <div className={isActive ? "workspace-menu-item active" : "workspace-menu-item"} key={workspace.id}>
                            {isRenaming ? (
                              <form className="workspace-rename-form" onSubmit={(event) => {
                                event.preventDefault();
                                commitWorkspaceRename(workspace.id);
                              }}>
                                <input
                                  value={workspaceNameDraft}
                                  onChange={(event) => setWorkspaceNameDraft(event.target.value)}
                                  onKeyDown={(event) => {
                                    if (event.key === "Escape") {
                                      setRenamingWorkspaceId(null);
                                      setWorkspaceNameDraft("");
                                    }
                                  }}
                                  aria-label={`Nama workspace ${workspace.name}`}
                                  autoFocus
                                />
                                <button className="icon-button" type="submit" title="Simpan nama workspace" aria-label="Simpan nama workspace">
                                  <CheckCircle2 size={16} />
                                </button>
                              </form>
                            ) : (
                              <>
                                <button
                                  className="workspace-menu-switch"
                                  type="button"
                                  role="menuitem"
                                  onClick={() => switchWorkspace(workspace.id)}
                                  aria-current={isActive ? "true" : undefined}
                                  title={workspace.name}
                                >
                                  <span>{workspace.name}</span>
                                  <small>{isActive ? "Aktif" : "Klik untuk pindah"}</small>
                                </button>
                                <div className="workspace-item-actions">
                                  <button
                                    className="workspace-text-action"
                                    type="button"
                                    onClick={() => startRenameWorkspace(workspace)}
                                    title="Rename workspace"
                                  >
                                    Rename
                                  </button>
                                  <button
                                    className="workspace-text-action danger"
                                    type="button"
                                    onClick={() => requestDeleteWorkspace(workspace.id)}
                                    disabled={workspaces.length <= 1}
                                    title={workspaces.length <= 1 ? "Minimal satu workspace harus tersedia" : "Hapus workspace"}
                                  >
                                    Hapus
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <div className="workspace-menu-actions">
                      <button className="button secondary" type="button" onClick={createEmptyWorkspace}>
                        <Plus size={16} />
                        Workspace kosong
                      </button>
                      <button className="button ghost" type="button" onClick={duplicateActiveWorkspace}>
                        <FileText size={16} />
                        Duplikasi aktif
                      </button>
                    </div>
                  </div>
                ) : null}
              </div>
              <div className="active-workflow-context" aria-label={`Konteks metode ${activeWorkflowTabItem.label}`}>
                <span>{activeWorkflowTabItem.label}</span>
                <WorkflowMethodBadges methods={activeWorkflowTabItem.methods} />
              </div>
            </div>
            {authUserId ? (
              <div className="mobile-auth-actions" aria-label="Aksi akun">
                <AuthSidebarActions userId={authUserId} isSuperAdmin={isSuperAdmin} />
              </div>
            ) : null}
            <div className="toolbar">
              <button className="icon-button" type="button" onClick={undoCoreChange} disabled={undoStack.length === 0} title="Undo perubahan data">
                <Undo2 size={18} />
              </button>
              <button className="icon-button" type="button" onClick={redoCoreChange} disabled={redoStack.length === 0} title="Redo perubahan data">
                <Redo2 size={18} />
              </button>
              <div className="export-menu" ref={pdfExportMenuRef}>
                <button
                  className="button secondary export-menu-trigger"
                  type="button"
                  onClick={() => {
                    setIsXlsxExportMenuOpen(false);
                    setIsJsonMenuOpen(false);
                    setIsPdfExportMenuOpen((isOpen) => !isOpen);
                  }}
                  disabled={!isDraftRestored}
                  aria-haspopup="menu"
                  aria-expanded={isPdfExportMenuOpen}
                >
                  <FileText size={18} />
                  Export PDF
                  <ChevronDown size={14} />
                </button>
                {isPdfExportMenuOpen ? (
                  <div className="export-menu-panel" role="menu" aria-label="Pilihan export PDF">
                    {valuationPdfExportScopes.map((scope) => (
                      <button
                        className={scope.id === "all" ? "export-menu-item default" : "export-menu-item"}
                        type="button"
                        role="menuitem"
                        aria-label={`Export PDF ${scope.label}`}
                        onClick={() => exportPdfReport(scope.id)}
                        key={scope.id}
                      >
                        <span>{scope.label}</span>
                        <small>{scope.description}</small>
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
              <div className="export-menu" ref={xlsxExportMenuRef}>
                <button
                  className="button secondary export-menu-trigger"
                  type="button"
                  onClick={() => {
                    setIsPdfExportMenuOpen(false);
                    setIsJsonMenuOpen(false);
                    setIsXlsxExportMenuOpen((isOpen) => !isOpen);
                  }}
                  disabled={!isDraftRestored}
                  aria-haspopup="menu"
                  aria-expanded={isXlsxExportMenuOpen}
                >
                  <FileSpreadsheet size={18} />
                  Export XLSX
                  <ChevronDown size={14} />
                </button>
                {isXlsxExportMenuOpen ? (
                  <div className="export-menu-panel" role="menu" aria-label="Pilihan export XLSX">
                    {valuationXlsxExportScopes.map((scope) => (
                      <button
                        className={scope.id === "all" ? "export-menu-item default" : "export-menu-item"}
                        type="button"
                        role="menuitem"
                        aria-label={`Export XLSX ${scope.label}`}
                        onClick={() => exportXlsxReport(scope.id)}
                        key={scope.id}
                      >
                        <span>{scope.label}</span>
                        <small>{scope.description}</small>
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
              <div className="export-menu" ref={jsonMenuRef}>
                <button
                  className="button secondary export-menu-trigger"
                  type="button"
                  onClick={() => {
                    setIsPdfExportMenuOpen(false);
                    setIsXlsxExportMenuOpen(false);
                    setIsJsonMenuOpen((isOpen) => !isOpen);
                  }}
                  disabled={!isDraftRestored || isJsonImporting}
                  aria-busy={isJsonImporting}
                  aria-haspopup="menu"
                  aria-expanded={isJsonMenuOpen}
                >
                  <FileBraces size={18} />
                  JSON
                  <ChevronDown size={14} />
                </button>
                {isJsonMenuOpen ? (
                  <div className="export-menu-panel compact" role="menu" aria-label="Pilihan JSON">
                    <button
                      className="export-menu-item"
                      type="button"
                      role="menuitem"
                      aria-label="Export JSON"
                      onClick={exportJsonDraft}
                    >
                      <span>Export</span>
                      <small>Simpan seluruh workspace aktif sebagai file JSON.</small>
                    </button>
                    <button
                      className="export-menu-item"
                      type="button"
                      role="menuitem"
                      aria-label="Import JSON"
                      onClick={requestJsonImport}
                      disabled={isJsonImporting}
                    >
                      <span>{isJsonImporting ? "Membaca" : "Import"}</span>
                      <small>Muat file JSON sebagai workspace baru.</small>
                    </button>
                  </div>
                ) : null}
              </div>
              <input
                ref={jsonImportInputRef}
                data-testid="json-import-input"
                type="file"
                accept="application/json,.json"
                onChange={handleJsonImportInputChange}
                className="file-input-hidden"
                aria-label="Import JSON workbench"
              />
              <button className="button ghost" type="button" onClick={resetForm} disabled={!isDraftRestored || !hasAnyInput}>
                <Eraser size={18} />
                Reset
              </button>
            </div>
          </header>

          <div className="workflow-tabs mobile-workflow-tabs" role="tablist" aria-label="Workflow penilaian">
            {workflowNavigationTabs.map((tab) => (
              <button
                className={[
                  activeWorkflowTab === tab.id ? "active" : "",
                  sourceFocusTarget?.tabId === tab.id ? "source-focus-tab" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                type="button"
                role="tab"
                aria-selected={activeWorkflowTab === tab.id}
                aria-label={tab.label}
                title={`${tab.label}: ${formatMethodList(tab.methods)}`}
                onClick={() => navigateToWorkflowTab(tab.id)}
                key={tab.id}
              >
                <span className="workflow-tab-label">{tab.label}</span>
                <WorkflowMethodBadges methods={tab.methods} />
              </button>
            ))}
          </div>
          {sourceFocusTarget && activeWorkflowTab === sourceFocusTarget.tabId ? (
            <div className="source-focus-strip" data-testid="source-focus-strip" role="status">
              <span>Sumber aktif</span>
              <strong>{workflowTabRegistry[sourceFocusTarget.tabId].label}</strong>
              <small>{sourceFocusTarget.traceLabel}</small>
            </div>
          ) : null}
        </div>

        {activeWorkflowTab === "periods" ? (
        <section id="periods" className="panel">
          <ReadinessPanel status={readiness.periods} onNavigate={navigateToWorkflowTab} onAction={handleReadinessAction} />
          <CaseProfilePanel
            profile={caseProfile}
            derived={caseProfileDerived}
            guidanceTarget={guidanceTarget}
            onChange={updateCaseProfile}
          />
          <div className="period-section-heading">
            <div>
              <p className="eyebrow">Periode penilaian</p>
              <h4>Periode input laporan keuangan</h4>
            </div>
            <div className="period-section-actions">
              {caseProfileDerived.cutOffDate ? (
                <span className="status-pill">Cut off {formatDisplayDate(caseProfileDerived.cutOffDate)}</span>
              ) : null}
              <button
                className={`button secondary ${guidanceTarget === "add-period" ? "action-guidance" : ""}`}
                data-guidance-target={guidanceTarget === "add-period" ? "add-period" : undefined}
                type="button"
                onClick={addPeriod}
              >
                <Plus size={18} />
                Tambah {nextHistoricalPeriodLabel}
                {guidanceTarget === "add-period" ? <span className="action-guidance-badge">Aksi dibutuhkan</span> : null}
              </button>
            </div>
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
        <section id="balance" className="panel">
          <ReadinessPanel status={readiness.balance} onNavigate={navigateToWorkflowTab} onAction={handleReadinessAction} />

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
            hideStatementColumn
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

        {activeWorkflowTab === "fixedAssets" ? (
        <section id="fixedAssets" className="panel">
          <ReadinessPanel status={readiness.fixedAssets} onNavigate={navigateToWorkflowTab} onAction={handleReadinessAction} />

          <FixedAssetScheduleEditor
            periods={periods}
            schedule={fixedAssetSchedule}
            onAddRow={addFixedAssetScheduleRow}
            onRemoveRow={removeFixedAssetScheduleRow}
            onUpdateRow={updateFixedAssetScheduleRow}
            onUpdateValue={updateFixedAssetScheduleValue}
          />
        </section>
        ) : null}

        {activeWorkflowTab === "income" ? (
        <section id="income" className="panel">
          <ReadinessPanel status={readiness.income} onNavigate={navigateToWorkflowTab} onAction={handleReadinessAction} />

          <div className="subpanel-heading account-input-heading">
            <div>
              <p className="eyebrow">Laba Rugi</p>
              <h4>Laba rugi dan driver operasi</h4>
            </div>
            <button className="button secondary" type="button" onClick={() => addRow("income_statement")}>
              <Plus size={18} />
              Tambah akun laba rugi
            </button>
          </div>

          <AccountInputTable
            emptyMessage="Belum ada akun laba rugi. Tambahkan baris dari tombol Tambah akun laba rugi di atas."
            hideStatementColumn
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
            <ReadinessPanel status={readiness.mapping} onNavigate={navigateToWorkflowTab} onAction={handleReadinessAction} />
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
          <ReadinessPanel status={readiness.wacc} onNavigate={navigateToWorkflowTab} onAction={handleReadinessAction} />
          <WaccMarketSuggestionPanel
            guidanceTarget={guidanceTarget === "wacc-market-suggestion" ? "wacc-market-suggestion" : undefined}
            suggestion={marketSuggestion}
            valuationDate={effectiveValuationDate}
            onApply={applyWaccMarketSuggestion}
          />
          <WaccBasisControl
            activeBasis={activeWaccBasis}
            effectiveBasis={effectiveActiveWaccBasis}
            activeWacc={snapshot.wacc}
            guidanceTarget={guidanceTarget === "wacc-active-basis" ? "wacc-active-basis" : undefined}
            sourceFocusTarget={sourceFocusTarget}
            rawCalculation={rawWaccCalculation}
            governedCalculation={resolveWaccCalculationForBasis(waccResolvedAssumptions, "governed", rawWaccCalculation)}
            manualWacc={readRateInput(assumptions.wacc)}
            terminalGrowth={snapshot.terminalGrowth}
            onBasisChange={(basis) => {
              clearGuidanceTarget("wacc-active-basis");
              commitCoreState((current) => ({
                ...current,
                activeWaccBasis: basis,
              }));
            }}
            onManualWaccChange={(value) => {
              clearGuidanceTarget("wacc-active-basis");
              commitCoreState((current) => ({
                ...current,
                activeWaccBasis: "manual",
                assumptions: {
                  ...current.assumptions,
                  wacc: formatEditableNumber(value),
                  waccSource: "manual-wacc",
                },
              }));
            }}
          />
          <WaccCalculatorPanel
            assumptions={assumptions}
            calculation={waccCalculation}
            comparableBeta={waccComparableBeta}
            companySector={caseProfile.companySector}
            comparableOptions={sectorComparableOptions}
            comparableSuggestions={sectorComparableSuggestions}
            valuationDate={effectiveValuationDate}
            autoCapitalValues={autoWaccCapitalValues}
            governance={assumptionGovernance}
            marketGuidanceTarget={!marketSuggestion && guidanceTarget === "wacc-market-suggestion" ? "wacc-market-suggestion" : undefined}
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
          <ReadinessPanel status={readiness.eemDcfAssumptions} onNavigate={navigateToWorkflowTab} onAction={handleReadinessAction} />
          <AssumptionDriverMatrix drivers={assumptionDriverSummaries} sourceFocusTarget={sourceFocusTarget} />
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
              guidanceCandidateId="statutory-general"
              guidanceTarget={guidanceTarget === "tax-rate-statutory" ? "tax-rate-statutory" : undefined}
            />
          </div>
          <div className="assumption-calculator-grid">
            <TerminalGrowthPanel
              assumptions={assumptions}
              wacc={snapshot.wacc}
              suggestion={terminalGrowthSuggestion}
              investedCapitalSuggestion={investedCapitalGrowthSuggestion}
              governance={assumptionGovernance}
              guidanceTarget={guidanceTarget === "terminal-growth-suggestion" ? "terminal-growth-suggestion" : undefined}
              onChange={updateAssumption}
              onApplySuggestion={applyTerminalGrowthSuggestion}
              onApplyInvestedCapitalSuggestion={applyInvestedCapitalGrowthSuggestion}
              onReasonChange={(value) => updateAssumptionText("terminalGrowthOverrideReason", value)}
              onGuidanceComplete={clearGuidanceTarget}
            />
            <RequiredReturnOnNtaPanel
              assumptions={assumptions}
              calculation={requiredReturnCalculation}
              suggestion={requiredReturnSuggestion}
              waccCalculation={rawWaccCalculation}
              balances={{
                accountReceivable: snapshot.accountReceivable,
                employeeReceivable: snapshot.employeeReceivable,
                inventory: snapshot.inventory,
                fixedAssetsNet: snapshot.fixedAssetsNet,
              }}
              governance={assumptionGovernance}
              guidanceTarget={guidanceTarget === "required-return-on-nta" ? "required-return-on-nta" : undefined}
              onChange={updateAssumption}
              onReasonChange={(value) => updateAssumptionText("requiredReturnOnNtaOverrideReason", value)}
              onGuidanceComplete={clearGuidanceTarget}
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
              guidanceTarget={guidanceTarget === "working-capital-driver" ? "working-capital-driver" : undefined}
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
              inputMode="numeric"
              onChange={(value) => updateAssumption("arDays", value)}
              onApplySuggestion={(value) => updateAssumption("arDays", value)}
              onGuidanceComplete={clearGuidanceTarget}
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
              inputMode="numeric"
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
              inputMode="numeric"
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
              inputMode="numeric"
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
                : `Revaluasi otomatis Ekuitas: ${formatIdr(aamAdjustmentModel.equityRevaluationAdjustment)}.`}
            </p>
          </article>
        </section>

        <section
          id="aam-adjustments"
          className={[
            "panel aam-adjustment-panel",
            sourceFocusTarget?.tabId === "valuationAam" && sourceFocusTarget.targetKey === "aam-nta-source"
              ? "source-focus-target"
              : "",
          ]
            .filter(Boolean)
            .join(" ")}
          data-source-focus-target="aam-nta-source"
          data-testid="aam-nta-source-target"
        >
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
          <AamAdjustmentTable
            title="Ekuitas"
            lines={aamAdjustmentModel.equityLines}
            historicalTotal={aamAdjustmentModel.historicalEquityTotal}
            adjustmentTotal={aamAdjustmentModel.equityAdjustmentTotal}
            adjustedTotal={aamAdjustmentModel.adjustedBookEquity}
            onUpdate={updateAamAdjustment}
          />
          <AamBalanceControl model={aamAdjustmentModel} />
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
            <AamFormulaList traces={results.aam.traces} />
          </article>
        </section>
        </>
        ) : (
          <ReadinessPanel status={readiness.valuationAam} onNavigate={navigateToWorkflowTab} onAction={handleReadinessAction} force />
        )
        ) : null}

        {activeWorkflowTab === "valuationEem" ? (
        readiness.valuationEem.isReady ? (
        <>
        <section id="eem-summary" className="section-grid">
          <article className="metric-card">
            <div className="card-title">
              <Calculator size={20} />
              <span>EEM</span>
            </div>
            <strong data-testid="eem-active-summary-equity-value">{formatIdr(activeEem.equityValue)}</strong>
            <p>{activePeriod?.label || "Periode aktif"} · Nilai Ekuitas 100% · {activeEemSelection.shortLabel}</p>
          </article>
          <article className="metric-card">
            <div className="card-title">
              <TableProperties size={20} />
              <span>NTA operasional</span>
            </div>
            <strong>{formatIdr(eemNetOperatingTangibleAssets)}</strong>
            <p>Total aset AAM disesuaikan tanpa kas dikurangi total liabilitas AAM disesuaikan tanpa utang bank.</p>
          </article>
          <article className="metric-card">
            <div className="card-title">
              <FileSearch size={20} />
              <span>Excess earning</span>
            </div>
            <strong>{formatIdr(eemExcessEarnings)}</strong>
            <p>NOPLAT dikurangi required return atas NTA; basis goodwill ekonomi EEM.</p>
          </article>
        </section>

        <section className="panel eem-return-basis-panel" data-testid="eem-return-on-tangible-asset-basis-control">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Return on Tangible Asset</p>
              <h3>Pilihan rate aktif EEM</h3>
            </div>
            <Calculator size={22} />
          </div>
          <div className="eem-return-basis-control">
            <label className="field">
              <span>Basis Return on Tangible Asset</span>
              <select
                aria-label="Basis Return on Tangible Asset"
                value={eemReturnOnTangibleAssetBasis}
                onChange={(event) =>
                  commitCoreState((current) => ({
                    ...current,
                    eemReturnOnTangibleAssetBasis: sanitizeEemReturnOnTangibleAssetBasis(event.target.value),
                  }))
                }
              >
                {eemReturnOnTangibleAssetChoices.map((choice) => (
                  <option key={choice.value} value={choice.value}>
                    {choice.label}
                  </option>
                ))}
              </select>
            </label>
            <div>
              <span>Rate aktif</span>
              <strong data-testid="eem-active-return-on-tangible-asset">
                {formatPercentFixed(eemReturnOnTangibleAssetSelection.rate, 2)}
              </strong>
              <small>{eemReturnOnTangibleAssetSelection.summary}</small>
            </div>
            <div>
              <span>Dampak formula</span>
              <strong>NTA x rate aktif</strong>
              <small>{eemReturnOnTangibleAssetSelection.formula}</small>
            </div>
          </div>
          <div className="eem-return-basis-options" aria-label="Opsi Return on Tangible Asset EEM">
            {eemReturnOnTangibleAssetChoices.map((choice) => {
              const isActive = choice.value === eemReturnOnTangibleAssetSelection.value;
              const displayRate = choice.value === "equityCost"
                ? eemEquityCostRate
                : snapshot.requiredReturnOnNta;

              return (
                <button
                  key={choice.value}
                  type="button"
                  className={isActive ? "active" : ""}
                  onClick={() =>
                    commitCoreState((current) => ({
                      ...current,
                      eemReturnOnTangibleAssetBasis: choice.value,
                    }))
                  }
                >
                  <span>{choice.label}</span>
                  <strong>{displayRate === null ? "Belum tersedia" : formatPercentFixed(displayRate, 2)}</strong>
                  <small>{choice.summary}</small>
                </button>
              );
            })}
          </div>
        </section>

        <section className="active-driver-strip" aria-label="Driver aktif penilaian">
          <div>
            <span>Basis EEM aktif</span>
            <strong data-testid="eem-active-basis-label">{activeEemSelection.shortLabel}</strong>
            <small>{activeEemBasis === "base" ? "Default sistem dipertahankan" : "Skenario terpilih user menjadi basis aktif"}</small>
          </div>
          {eemDriverSummaries.map((driver) => (
            <div key={driver.label}>
              <span>{driver.label}</span>
              <strong>{driver.valueLabel}</strong>
              <small>{driver.sourceLabel}</small>
            </div>
          ))}
        </section>

        <AssumptionGovernancePanel
          ariaLabel="Audit asumsi material EEM"
          governance={eemAssumptionGovernance}
          onNavigate={navigateToGovernanceTarget}
        />

        <section className="panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Sensitivitas EEM</p>
              <h3>Debt-like tax payable scenario</h3>
            </div>
          </div>
          <div className="dcf-active-basis-control eem-active-basis-control" data-testid="eem-active-basis-control">
            <label className="field">
              <span>Basis EEM aktif</span>
              <select
                value={activeEemBasis}
                onChange={(event) =>
                  commitCoreState((current) => ({
                    ...current,
                    activeEemBasis: sanitizeActiveEemBasis(event.target.value),
                  }))
                }
              >
                {activeEemBasisOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <div>
              <span>Nilai aktif</span>
              <strong data-testid="eem-active-equity-value">{formatIdr(activeEem.equityValue)}</strong>
              <small>{activeEemSelection.summary}</small>
            </div>
            <div>
              <span>Selisih vs skenario dasar</span>
              <strong>{formatIdr(activeEem.equityValue - results.eem.equityValue)}</strong>
              <small>
                {activeEemBasis === "base"
                  ? "Tidak ada penyesuaian debt-like yang aktif."
                  : `Utang pajak dikurangkan sebagai debt-like: ${formatIdr(activeEemSelection.debtLikeTaxPayable)}.`}
              </small>
            </div>
          </div>
          <div className="sensitivity-grid two-column eem-sensitivity-grid" data-testid="eem-sensitivity-grid">
            <div className={activeEemBasis === "base" ? "active-sensitivity" : ""}>
              <span>{eemSensitivityContext.base.label}</span>
              <strong data-testid="eem-base-equity-value">{formatIdr(results.eem.equityValue)}</strong>
              <small>{eemSensitivityContext.base.note}</small>
            </div>
            <div className={activeEemBasis === "taxPayableDebtLike" ? "active-sensitivity" : ""}>
              <span>{eemSensitivityContext.taxPayableDebtLike.label}</span>
              <strong data-testid="eem-tax-payable-debt-like-equity-value">
                {formatIdr(results.sensitivities.eemTaxPayableDebtLike.equityValue)}
              </strong>
              <small>{buildEemTaxPayableDebtLikeNote(formatIdr(eemTaxPayableDebtLikeDifference))}</small>
            </div>
          </div>
          <div className="eem-sensitivity-bridge" data-testid="eem-tax-payable-difference-driver">
            <span>{eemSensitivityContext.differenceDriver.label}</span>
            <strong>{formatIdr(eemTaxPayableDebtLikeDifference)}</strong>
            <small>{eemSensitivityContext.differenceDriver.note}</small>
          </div>
        </section>

        <section id="eem" className="eem-trace-section">
          <article className="panel eem-trace-panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Jejak EEM</p>
                <h3>Excess Earnings Method (EEM)</h3>
              </div>
              <FileSearch size={22} />
            </div>
            <EemTraceTable
              traces={activeEem.traces}
              sourceFocusTarget={sourceFocusTarget}
              onSourceNavigate={navigateToTraceSource}
            />
          </article>
        </section>
        </>
        ) : (
          <ReadinessPanel status={readiness.valuationEem} onNavigate={navigateToWorkflowTab} onAction={handleReadinessAction} force />
        )
        ) : null}

        {activeWorkflowTab === "valuationDcf" ? (
        readiness.valuationDcf.isReady ? (
        <>
        <section id="dcf-summary" className="section-grid">
          <article className="metric-card">
            <div className="card-title">
              <Calculator size={20} />
              <span>DCF</span>
            </div>
            <strong data-testid="dcf-active-equity-value">{formatIdr(activeDcf.equityValue)}</strong>
            <p>{activePeriod?.label || "Periode aktif"} · {activeDcfSelection.label}</p>
          </article>
          <article className="metric-card">
            <div className="card-title">
              <TableProperties size={20} />
              <span>PV FCFF eksplisit</span>
            </div>
            <strong>{formatIdr(dcfExplicitPv)}</strong>
            <p>Jumlah present value FCFF eksplisit, sejalan dengan row Total PV FCF pada sheet DCF.</p>
          </article>
          <article className="metric-card">
            <div className="card-title">
              <FileSearch size={20} />
              <span>PV terminal value</span>
            </div>
            <strong>{formatIdr(dcfTerminalPv)}</strong>
            <p>Nilai terminal terdiskonto; driver utama untuk governance proyeksi DCF.</p>
          </article>
        </section>

        <section className="active-driver-strip" aria-label="Driver aktif penilaian">
          <div>
            <span>Basis DCF aktif</span>
            <strong data-testid="dcf-active-basis-label">{activeDcfSelection.shortLabel}</strong>
            <small>
              {incomeProjectionScenario.activeBasis === "reviewer-approved-scenario"
                ? "Scenario Proyeksi Laba Rugi reviewer menjadi basis aktif"
                : activeDcfBasis === "base"
                  ? "Default sistem dipertahankan"
                  : "Skenario terpilih user menjadi basis aktif"}
            </small>
          </div>
          {dcfDriverSummaries.map((driver) => (
            <div key={driver.label}>
              <span>{driver.label}</span>
              <strong>{driver.valueLabel}</strong>
              <small>{driver.sourceLabel}</small>
            </div>
          ))}
        </section>

        <ProjectionPlanningPanel
          planning={projectionPlanning}
          horizonYears={projectionHorizonYears}
          activeDcfSelection={activeDcfSelection}
          onChange={updateProjectionPlanning}
        />

        <section className="panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Sensitivitas DCF</p>
              <h3>Cakupan skenario pengguna</h3>
            </div>
          </div>
          <div className="dcf-active-basis-control" data-testid="dcf-active-basis-control">
            <label className="field">
              <span>Basis DCF aktif</span>
              <select
                value={activeDcfBasis}
                onChange={(event) =>
                  commitCoreState((current) => ({
                    ...current,
                    activeDcfBasis: sanitizeActiveDcfBasis(event.target.value),
                  }))
                }
              >
                {activeDcfBasisOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <div>
              <span>Nilai aktif</span>
              <strong>{formatIdr(activeDcf.equityValue)}</strong>
              <small>{activeDcfSelection.summary}</small>
            </div>
            <div>
              <span>Selisih vs skenario dasar</span>
              <strong>{formatIdr(activeDcfVariance)}</strong>
              <small>{formatPercent(activeDcfRelativeVariance)}</small>
            </div>
          </div>
          <div className="sensitivity-grid" data-testid="dcf-sensitivity-grid">
            <div className={activeDcfBasis === "base" ? "active-sensitivity" : ""} data-testid="dcf-sensitivity-base">
              <span>DCF - skenario dasar</span>
              <strong data-testid="dcf-base-equity-value">{formatIdr(results.dcf.equityValue)}</strong>
              <small>{dcfSensitivityContext.base}</small>
            </div>
            <div className={activeDcfBasis === "terminalDownside" ? "active-sensitivity" : ""} data-testid="dcf-sensitivity-terminal-downside">
              <span>DCF - terminal downside</span>
              <strong data-testid="dcf-terminal-downside-equity-value">{formatIdr(results.sensitivities.dcfTerminalDownside.equityValue)}</strong>
              <small>{dcfSensitivityContext.terminalDownside}</small>
            </div>
            <div className={activeDcfBasis === "terminalUpside" ? "active-sensitivity" : ""} data-testid="dcf-sensitivity-terminal-upside">
              <span>DCF - terminal upside</span>
              <strong data-testid="dcf-terminal-upside-equity-value">{formatIdr(results.sensitivities.dcfTerminalUpside.equityValue)}</strong>
              <small>{dcfSensitivityContext.terminalUpside}</small>
            </div>
            <div className={activeDcfBasis === "noIncrementalWorkingCapital" ? "active-sensitivity" : ""} data-testid="dcf-sensitivity-no-incremental-wc">
              <span>DCF tanpa WC incremental</span>
              <strong data-testid="dcf-no-incremental-wc-equity-value">{formatIdr(results.sensitivities.dcfNoIncrementalWorkingCapital.equityValue)}</strong>
              <small>{dcfSensitivityContext.noIncrementalWorkingCapital}</small>
            </div>
            <div className={activeDcfBasis === "taxPayableDebtLike" ? "active-sensitivity" : ""} data-testid="dcf-sensitivity-tax-payable-debt-like">
              <span>DCF utang pajak debt-like</span>
              <strong data-testid="dcf-tax-payable-debt-like-equity-value">{formatIdr(results.sensitivities.dcfTaxPayableDebtLike.equityValue)}</strong>
              <small>{dcfSensitivityContext.taxPayableDebtLike}</small>
            </div>
            <div className={activeDcfBasis === "historicalDerivedProjection" ? "active-sensitivity" : ""} data-testid="dcf-sensitivity-historical-projection">
              <span>DCF - proyeksi neraca berbasis historis</span>
              <strong data-testid="dcf-historical-projection-equity-value">{formatIdr(results.sensitivities.dcfHistoricalDerivedProjection.equityValue)}</strong>
              <small>{dcfSensitivityContext.historicalDerivedProjection}</small>
            </div>
          </div>
        </section>

        <section id="dcf" className="dcf-audit-section">
          <DcfAuditTrailPanel
            auditTrail={dcfAuditTrail}
            onSourceNavigate={(tabId) => navigateToWorkflowTab(tabId)}
          />
        </section>
        </>
        ) : (
          <ReadinessPanel status={readiness.valuationDcf} onNavigate={navigateToWorkflowTab} onAction={handleReadinessAction} force />
        )
        ) : null}

        {activeWorkflowTab === "projectedIncome" ? (
          readiness.projectedIncome.isReady ? (
            <ProjectionStatementSection
              kind="income"
              forecast={activeDcf.forecast}
              snapshot={snapshot}
              activeDcfSelection={activeDcfSelection}
              activeWaccBasisLabel={activeWaccBasisLabels[effectiveActiveWaccBasis].shortLabel}
              incomeProjectionRelianceGovernance={results.incomeProjectionRelianceGovernance}
              incomeProjectionControls={incomeProjectionControls}
              incomeProjectionScenario={incomeProjectionScenario}
              onIncomeProjectionYearOverrideChange={updateIncomeProjectionYearOverride}
              onIncomeProjectionYearOverrideReasonChange={updateIncomeProjectionYearOverrideReason}
              onIncomeProjectionReviewerDecisionChange={updateIncomeProjectionReviewerDecision}
              onIncomeProjectionNonOperatingPolicyChange={updateIncomeProjectionNonOperatingPolicy}
              onIncomeProjectionPresentationAssumptionChange={updateIncomeProjectionPresentationAssumption}
              onIncomeProjectionPresentationAssumptionReasonChange={updateIncomeProjectionPresentationAssumptionReason}
              onApplyIncomeProjectionSmartSuggestions={applyIncomeProjectionSmartSuggestions}
            />
          ) : (
            <ReadinessPanel status={readiness.projectedIncome} onNavigate={navigateToWorkflowTab} onAction={handleReadinessAction} force />
          )
        ) : null}

        {activeWorkflowTab === "projectedBalance" ? (
          readiness.projectedBalance.isReady ? (
            <ProjectionStatementSection
              kind="balance"
              forecast={activeDcf.forecast}
              snapshot={snapshot}
              activeDcfSelection={activeDcfSelection}
              activeWaccBasisLabel={activeWaccBasisLabels[effectiveActiveWaccBasis].shortLabel}
            />
          ) : (
            <ReadinessPanel status={readiness.projectedBalance} onNavigate={navigateToWorkflowTab} onAction={handleReadinessAction} force />
          )
        ) : null}

        {activeWorkflowTab === "projectedFixedAssets" ? (
          readiness.projectedFixedAssets.isReady ? (
            <ProjectionStatementSection
              kind="fixedAssets"
              forecast={activeDcf.forecast}
              snapshot={snapshot}
              activeDcfSelection={activeDcfSelection}
              activeWaccBasisLabel={activeWaccBasisLabels[effectiveActiveWaccBasis].shortLabel}
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
            <ReadinessPanel status={readiness.projectedFixedAssets} onNavigate={navigateToWorkflowTab} onAction={handleReadinessAction} force />
          )
        ) : null}

        {activeWorkflowTab === "projectedCashFlow" ? (
          readiness.projectedCashFlow.isReady ? (
            <ProjectionStatementSection
              kind="cashFlow"
              forecast={activeDcf.forecast}
              snapshot={snapshot}
              activeDcfSelection={activeDcfSelection}
              activeWaccBasisLabel={activeWaccBasisLabels[effectiveActiveWaccBasis].shortLabel}
              workingCapitalCandidates={dcfProjectionWorkingCapitalCandidates}
              onToggleWorkingCapitalInclusion={toggleCashFlowAccountInclusion}
            />
          ) : (
            <ReadinessPanel status={readiness.projectedCashFlow} onNavigate={navigateToWorkflowTab} onAction={handleReadinessAction} force />
          )
        ) : null}

        {activeWorkflowTab === "dlom" ? (
          <DlomSection
            dlom={dlom}
            calculation={dlomCalculation}
            guidanceTarget={guidanceTarget === "dlom-questionnaire" ? "dlom-questionnaire" : undefined}
            readiness={readiness.dlom}
            onNavigate={navigateToWorkflowTab}
            onAction={handleReadinessAction}
            onUpdateFactor={updateDlomFactor}
          />
        ) : null}

        {activeWorkflowTab === "dlocPfc" ? (
          <DlocPfcSection
            calculation={dlocPfcCalculation}
            guidanceTarget={guidanceTarget === "dloc-pfc-questionnaire" ? "dloc-pfc-questionnaire" : undefined}
            readiness={readiness.dlocPfc}
            onNavigate={navigateToWorkflowTab}
            onAction={handleReadinessAction}
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
            guidanceTarget={guidanceTarget === "tax-primary-method" ? "tax-primary-method" : undefined}
            readiness={readiness.taxSimulation}
            onNavigate={navigateToWorkflowTab}
            onAction={handleReadinessAction}
            onUpdate={updateTaxSimulation}
          />
        ) : null}

        {activeWorkflowTab === "cashFlowStatement" ? (
          readiness.cashFlowStatement.isReady ? (
            <CashFlowStatementSection
              analysis={sectionAnalysis}
              accountCandidates={cashFlowWorkingCapitalAccountCandidates}
              readiness={readiness.cashFlowStatement}
              onNavigate={navigateToWorkflowTab}
              onToggleAccountInclusion={toggleCashFlowAccountInclusion}
              onUpdateOverride={updateCashFlowOverride}
            />
          ) : (
            <ReadinessPanel status={readiness.cashFlowStatement} onNavigate={navigateToWorkflowTab} onAction={handleReadinessAction} force />
          )
        ) : null}

        {activeWorkflowTab === "payablesCashFlow" ? (
          readiness.payablesCashFlow.isReady ? (
            <DebtScheduleSection
              analysis={sectionAnalysis}
              debtScheduleInputs={debtScheduleInputs}
              onUpdateDebtScheduleInput={updateDebtScheduleInput}
            />
          ) : (
            <ReadinessPanel status={readiness.payablesCashFlow} onNavigate={navigateToWorkflowTab} onAction={handleReadinessAction} force />
          )
        ) : null}

        {activeWorkflowTab === "noplatFcf" ? (
          readiness.noplatFcf.isReady ? (
            <NoplatFcfSection analysis={sectionAnalysis} onUpdateOverride={updateCashFlowOverride} />
          ) : (
            <ReadinessPanel status={readiness.noplatFcf} onNavigate={navigateToWorkflowTab} onAction={handleReadinessAction} force />
          )
        ) : null}

        {activeWorkflowTab === "financialRatio" ? (
          readiness.financialRatio.isReady ? (
            <FinancialRatioSection analysis={sectionAnalysis} readiness={readiness.financialRatio} onNavigate={navigateToWorkflowTab} />
          ) : (
            <ReadinessPanel status={readiness.financialRatio} onNavigate={navigateToWorkflowTab} onAction={handleReadinessAction} force />
          )
        ) : null}

        {activeWorkflowTab === "roic" ? (
          readiness.roic.isReady ? (
            <RoicSection analysis={sectionAnalysis} readiness={readiness.roic} onNavigate={navigateToWorkflowTab} />
          ) : (
            <ReadinessPanel status={readiness.roic} onNavigate={navigateToWorkflowTab} onAction={handleReadinessAction} force />
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
  onAction,
  force = false,
}: {
  status: SectionReadiness;
  onNavigate: (tabId: WorkflowTabId) => void;
  onAction?: (item: ReadinessItem) => boolean;
  force?: boolean;
}) {
  if (!force && status.isReady && status.warnings.length === 0) {
    return null;
  }

  const requiredItems = [...status.missing, ...status.warnings];
  const hasRequiredItems = requiredItems.length > 0;
  const panelClassName = ["readiness-panel", hasRequiredItems ? "blocking" : ""].filter(Boolean).join(" ");
  const eyebrow = hasRequiredItems ? "Data belum lengkap" : "Kesiapan data";
  const heading = hasRequiredItems
    ? `${status.title} belum dapat ditampilkan penuh`
    : `${status.title} siap diproses`;
  const badgeClassName = hasRequiredItems ? "badge danger" : "badge ok";
  const badgeLabel = hasRequiredItems ? "Perlu dilengkapi" : "Siap";
  const activateReadinessItem = (item: ReadinessItem) => {
    if (onAction?.(item)) {
      return;
    }

    onNavigate(item.targetTab);
  };

  return (
    <section className={panelClassName} data-testid={`readiness-${status.id}`}>
      <div className="readiness-heading">
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h3>{heading}</h3>
        </div>
        <span className={badgeClassName}>{badgeLabel}</span>
      </div>

      {hasRequiredItems ? (
        <div className="readiness-list">
          <h4>Masih diperlukan</h4>
          {requiredItems.map((item) => (
            <a
              href={`#${item.targetTab}`}
              className="readiness-link"
              onClick={(event) => {
                event.preventDefault();
                activateReadinessItem(item);
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
      {workflowNavigationTabs.map((tab) => {
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
            <span className="readiness-overview-label">
              <span>{tab.label}</span>
              <WorkflowMethodBadges methods={tab.methods} />
            </span>
            <strong>{unresolvedCount === 0 ? "Siap" : `${unresolvedCount} item`}</strong>
          </button>
        );
      })}
    </section>
  );
}

function WorkflowMethodBadges({ methods }: { methods: ValuationMethod[] }) {
  return (
    <span className="method-badge-list" aria-hidden="true">
      {methods.map((method) => (
        <span className={`method-badge method-badge-${method.toLowerCase()}`} key={method}>
          {method}
        </span>
      ))}
    </span>
  );
}

function formatMethodList(methods: ValuationMethod[]): string {
  return methods.join(" / ");
}

function DlomSection({
  dlom,
  calculation,
  guidanceTarget,
  readiness,
  onNavigate,
  onAction,
  onUpdateFactor,
}: {
  dlom: DlomState;
  calculation: DlomCalculation;
  guidanceTarget?: GuidanceTarget;
  readiness: SectionReadiness;
  onNavigate: (tabId: WorkflowTabId) => void;
  onAction: (item: ReadinessItem) => boolean;
  onUpdateFactor: (id: DlomFactorId, patch: Partial<DlomState["factors"][DlomFactorId]>) => void;
}) {
  const guidanceFactorId =
    guidanceTarget === "dlom-questionnaire" ? calculation.factors.find((factor) => factor.status === "missing")?.id : undefined;

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
          <p>Baseline penilaian: 10 faktor dengan skor 0, 0,5, atau 1.</p>
        </article>
        <article className="metric-card">
          <div className="card-title">
            <AlertTriangle size={20} />
            <span>Status & resistensi WP</span>
          </div>
          <strong>{calculation.taxpayerResistance}</strong>
          <p>Posisi DLOM dalam rentang: {calculation.status}.</p>
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
        <ReadinessPanel status={readiness} onNavigate={onNavigate} onAction={onAction} />
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
            <p className="eyebrow">Skoring model</p>
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
                        className={factor.id === guidanceFactorId ? "action-guidance" : undefined}
                        data-guidance-target={factor.id === guidanceFactorId ? guidanceTarget : undefined}
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
                      {factor.id === guidanceFactorId ? <span className="action-guidance-badge">Aksi dibutuhkan</span> : null}
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
  guidanceTarget,
  readiness,
  onNavigate,
  onAction,
  onUpdateFactor,
}: {
  calculation: DlocPfcCalculation;
  guidanceTarget?: GuidanceTarget;
  readiness: SectionReadiness;
  onNavigate: (tabId: WorkflowTabId) => void;
  onAction: (item: ReadinessItem) => boolean;
  onUpdateFactor: (id: DlocPfcFactorId, patch: Partial<DlocPfcState["factors"][DlocPfcFactorId]>) => void;
}) {
  const guidanceFactorId =
    guidanceTarget === "dloc-pfc-questionnaire" ? calculation.factors.find((factor) => factor.status === "missing")?.id : undefined;

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
          <p>Kuesioner penilaian: 5 faktor dengan skor 0, 0,5, atau 1.</p>
        </article>
        <article className="metric-card">
          <div className="card-title">
            <AlertTriangle size={20} />
            <span>Status & resistensi WP</span>
          </div>
          <strong>{calculation.taxpayerResistance}</strong>
          <p>Posisi DLOC/PFC dalam rentang: {calculation.status}.</p>
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
        <ReadinessPanel status={readiness} onNavigate={onNavigate} onAction={onAction} />
        <div className="dlom-control-grid" data-testid="dloc-pfc-basis-grid">
          <DerivedCaseField label="Jenis Perusahaan" value={calculation.companyBasis || "Isi Data Awal"} />
          <DerivedCaseField label="Status adjustment" value={calculation.adjustmentType || "Isi Data Awal"} />
          <DerivedCaseField label="Rentang DLOC/PFC" value={calculation.rangeLabel} />
        </div>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Kuesioner model</p>
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
                      className={factor.id === guidanceFactorId ? "action-guidance" : undefined}
                      data-guidance-target={factor.id === guidanceFactorId ? guidanceTarget : undefined}
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
                    {factor.id === guidanceFactorId ? <span className="action-guidance-badge">Aksi dibutuhkan</span> : null}
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
  guidanceTarget,
  readiness,
  onNavigate,
  onAction,
  onUpdate,
}: {
  state: TaxSimulationState;
  result: TaxSimulationResult;
  dlom: DlomCalculation;
  dlocPfc: DlocPfcCalculation;
  caseProfileDerived: CaseProfileDerived;
  guidanceTarget?: GuidanceTarget;
  readiness: SectionReadiness;
  onNavigate: (tabId: WorkflowTabId) => void;
  onAction: (item: ReadinessItem) => boolean;
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
  const isPrimaryMethodGuidance = guidanceTarget === "tax-primary-method";

  return (
    <>
      <section className="section-grid tax-summary-grid" data-testid="tax-simulation-summary">
        <article className="metric-card">
          <div className="card-title">
            <Calculator size={20} />
            <span>Primary Method</span>
          </div>
          <strong>{state.primaryMethod || "Not selected"}</strong>
          <p>Final memakai {selectedBasisLabel}; data contoh memakai AAM.</p>
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
            <p className="eyebrow">Kontrol skenario</p>
            <h3>Simulasi Potensi Pajak</h3>
          </div>
          <TableProperties size={22} />
        </div>
        <ReadinessPanel status={readiness} onNavigate={onNavigate} onAction={onAction} />
        <div className="tax-control-grid">
          <label className={["field", isPrimaryMethodGuidance ? "action-guidance" : ""].filter(Boolean).join(" ")} data-guidance-target={isPrimaryMethodGuidance ? guidanceTarget : undefined}>
            <span>Primary Method</span>
            <select value={state.primaryMethod} onChange={(event) => onUpdate({ primaryMethod: event.target.value as ValuationMethod | "" })}>
              <option value="">Not selected</option>
              <option value="AAM">AAM</option>
              <option value="EEM">EEM</option>
              <option value="DCF">DCF</option>
            </select>
            {isPrimaryMethodGuidance ? <span className="action-guidance-badge">Aksi dibutuhkan</span> : null}
          </label>
          <label className="field">
            <span>Basis final</span>
            <select value={state.finalBasis} onChange={(event) => onUpdate({ finalBasis: event.target.value as TaxSimulationFinalBasis })}>
              <option value="baseline">Baseline otomatis</option>
              <option value="manualScenario">Skenario manual</option>
            </select>
          </label>
          <DerivedCaseField label="Tahun Cut Off" value={taxYearLabel} state={result.taxYearResolution.appliedYear === null ? "invalid" : "neutral"} />
          <DerivedCaseField label="DLOM baseline" value={dlom.isComplete ? formatPercent(dlom.dlomRate) : "Belum lengkap"} />
          <DerivedCaseField label="DLOC/PFC baseline" value={dlocPfc.isComplete ? `${dlocPfc.adjustmentType} ${formatPercent(dlocPfc.signedRate)}` : "Belum lengkap"} />
          <DerivedCaseField label={caseProfileDerived.capitalProportionLabel} value={formatCaseProfileProportion(caseProfileDerived)} />
          <DerivedCaseField
            label="Nilai pengalihan dari Data Awal"
            value={formatCaseProfileAmount(caseProfileDerived.capitalBaseValuedAmount, caseProfileDerived.capitalBaseAmountStatus)}
            state={caseProfileDerived.capitalBaseAmountStatus === "invalid" ? "invalid" : "neutral"}
          />
          <DerivedCaseField label="Resistensi keseluruhan" value={result.overallResistance} state={result.overallResistance === "Belum lengkap" ? "invalid" : "neutral"} />
          <label className="field">
            <span>DLOM Skenario Manual</span>
            <input inputMode="decimal" value={state.scenarioDlomRate} onChange={(event) => onUpdate({ scenarioDlomRate: event.target.value })} placeholder="Default baseline" />
          </label>
          <label className="field">
            <span>DLOC/PFC Skenario Manual</span>
            <input inputMode="decimal" value={state.scenarioDlocPfcRate} onChange={(event) => onUpdate({ scenarioDlocPfcRate: event.target.value })} placeholder="Input positif; sistem tentukan DLOC/PFC" />
          </label>
        </div>
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
              ["DLOM Skenario Manual", scenarioPrimaryRow ? formatPercent(scenarioPrimaryRow.dlomRate) : "Default baseline"],
              ["DLOC/PFC Skenario Manual", scenarioPrimaryRow ? formatPercent(scenarioPrimaryRow.dlocPfcRate) : "Default baseline"],
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
type DcfProjectionStatus = "calculated" | "scheduleDriven" | "review" | "requiresInput" | "notModeled";
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

type DcfProjectionWorkingCapitalCandidate =
  | {
      rowKey: "oca-change";
      id: string;
      key: DcfWorkingCapitalCurrentAssetKey;
      label: string;
      categoryLabel: string;
      defaultIncluded: boolean;
      included: boolean;
    }
  | {
      rowKey: "ocl-change";
      id: string;
      key: DcfWorkingCapitalCurrentLiabilityKey;
      label: string;
      categoryLabel: string;
      defaultIncluded: boolean;
      included: boolean;
    };

type DcfProjectionWorkingCapitalCandidates = Record<CashFlowWorkingCapitalRowKey, DcfProjectionWorkingCapitalCandidate[]>;

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
  scheduleDriven: "Schedule-driven",
  review: "Review",
  requiresInput: "Perlu input",
  notModeled: "Belum dimodelkan",
};

const projectionStatusClassNames: Record<DcfProjectionStatus, string> = {
  calculated: "ok",
  scheduleDriven: "ok",
  review: "warning",
  requiresInput: "warning",
  notModeled: "muted",
};

const dcfProjectionCurrentAssetCandidates: Array<Omit<Extract<DcfProjectionWorkingCapitalCandidate, { rowKey: "oca-change" }>, "included">> = [
  {
    rowKey: "oca-change",
    id: "projection:cashOnHand",
    key: "cashOnHand",
    label: "Cash on Hand",
    categoryLabel: "Kas di tangan",
    defaultIncluded: false,
  },
  {
    rowKey: "oca-change",
    id: "projection:cashOnBankDeposit",
    key: "cashOnBankDeposit",
    label: "Cash on Bank",
    categoryLabel: "Kas bank/deposito",
    defaultIncluded: false,
  },
  {
    rowKey: "oca-change",
    id: "projection:accountReceivable",
    key: "accountReceivable",
    label: "Account Receivable",
    categoryLabel: "Piutang usaha",
    defaultIncluded: true,
  },
  {
    rowKey: "oca-change",
    id: "projection:employeeReceivable",
    key: "employeeReceivable",
    label: "Other Receivable",
    categoryLabel: "Piutang lain/karyawan",
    defaultIncluded: false,
  },
  {
    rowKey: "oca-change",
    id: "projection:inventory",
    key: "inventory",
    label: "Inventory",
    categoryLabel: "Persediaan",
    defaultIncluded: true,
  },
  {
    rowKey: "oca-change",
    id: "projection:otherCurrentAssets",
    key: "otherCurrentAssets",
    label: "Others",
    categoryLabel: "Aset lancar lain",
    defaultIncluded: false,
  },
];

const dcfProjectionCurrentLiabilityCandidates: Array<Omit<Extract<DcfProjectionWorkingCapitalCandidate, { rowKey: "ocl-change" }>, "included">> = [
  {
    rowKey: "ocl-change",
    id: "projection:bankLoanShortTerm",
    key: "bankLoanShortTerm",
    label: "Bank Loan-Short Term",
    categoryLabel: "Pinjaman bank jangka pendek",
    defaultIncluded: false,
  },
  {
    rowKey: "ocl-change",
    id: "projection:accountPayable",
    key: "accountPayable",
    label: "Account Payables",
    categoryLabel: "Utang usaha",
    defaultIncluded: true,
  },
  {
    rowKey: "ocl-change",
    id: "projection:taxPayable",
    key: "taxPayable",
    label: "Tax Payable",
    categoryLabel: "Utang pajak",
    defaultIncluded: false,
  },
  {
    rowKey: "ocl-change",
    id: "projection:otherPayable",
    key: "otherPayable",
    label: "Others",
    categoryLabel: "Utang lain Proyeksi Neraca",
    defaultIncluded: true,
  },
  {
    rowKey: "ocl-change",
    id: "projection:bankLoanLongTerm",
    key: "bankLoanLongTerm",
    label: "Bank Loan-Long Term",
    categoryLabel: "Utang berbunga jangka panjang opsional",
    defaultIncluded: false,
  },
];

function buildDcfProjectionWorkingCapitalCandidates(
  inclusions: CashFlowAccountInclusionState,
): DcfProjectionWorkingCapitalCandidates {
  return {
    "oca-change": dcfProjectionCurrentAssetCandidates.map((candidate) => ({
      ...candidate,
      included: inclusions["oca-change"]?.[candidate.id] ?? candidate.defaultIncluded,
    })),
    "ocl-change": dcfProjectionCurrentLiabilityCandidates.map((candidate) => ({
      ...candidate,
      included: inclusions["ocl-change"]?.[candidate.id] ?? candidate.defaultIncluded,
    })),
  };
}

function buildDcfWorkingCapitalInclusionOptions(
  inclusions: CashFlowAccountInclusionState,
): DcfWorkingCapitalInclusionOptions {
  const projectionCandidates = buildDcfProjectionWorkingCapitalCandidates(inclusions);

  return {
    currentAssets: Object.fromEntries(
      projectionCandidates["oca-change"].map((candidate) => [candidate.key, candidate.included]),
    ) as Partial<Record<DcfWorkingCapitalCurrentAssetKey, boolean>>,
    currentLiabilities: Object.fromEntries(
      projectionCandidates["ocl-change"].map((candidate) => [candidate.key, candidate.included]),
    ) as Partial<Record<DcfWorkingCapitalCurrentLiabilityKey, boolean>>,
  };
}

const dcfIncomeProjectionRows: DcfProjectionLine[] = [
  {
    key: "revenue",
    label: "Revenue",
    source: "Proyeksi laba rugi",
    formula: "Revenue t-1 x (1 + revenue growth)",
    status: "calculated",
    workbookReference: "IS-REV-01",
    value: (row) => row.revenue,
  },
  {
    key: "revenue-growth",
    label: "Revenue Growth",
    source: "Driver pertumbuhan pendapatan aktif",
    formula: "Revenue t / Revenue t-1 - 1",
    status: "calculated",
    workbookReference: "IS-REV-02",
    display: "percent",
    value: (row, index, context) => growthValue(row.revenue, previousRevenue(index, context)),
  },
  {
    key: "cogs",
    label: "Cost of Good Sold",
    source: "Margin historis / override driver",
    formula: "Revenue x margin COGS",
    status: "calculated",
    workbookReference: "IS-COGS-01",
    value: (row) => row.cogs,
  },
  {
    key: "gross-profit",
    label: "Gross Profit",
    source: "Engine DCF",
    formula: "Revenue - COGS",
    status: "calculated",
    workbookReference: "IS-GP-01",
    value: (row) => row.grossProfit,
    kind: "subtotal",
  },
  {
    key: "gross-profit-margin",
    label: "Gross Profit Margin",
    source: "Engine DCF",
    formula: "Gross profit / revenue",
    status: "calculated",
    workbookReference: "IS-GP-02",
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
    workbookReference: "IS-OPEX-01",
    note: "Engine saat ini memakai total G&A/opex, bukan rincian others.",
  },
  {
    key: "ga-overheads",
    label: "General & Administrative Overheads",
    source: "Margin historis / override driver",
    formula: "Revenue x margin opex",
    status: "calculated",
    workbookReference: "IS-OPEX-02",
    value: (row) => row.operatingExpenses,
  },
  {
    key: "operating-expenses",
    label: "Operating Expenses (Exclude Depreciation)",
    source: "Subtotal operating expenses",
    formula: "Others + General & Administrative Overheads",
    status: "review",
    workbookReference: "IS-OPEX-03",
    value: (row) => row.operatingExpenses,
    kind: "subtotal",
    note: "Subtotal berasal dari opex engine karena rincian others belum tersedia sebagai driver terpisah.",
  },
  {
    key: "ebitda",
    label: "EBITDA",
    source: "Engine DCF",
    formula: "EBIT + depreciation",
    status: "calculated",
    workbookReference: "IS-EBITDA-01",
    value: (row) => row.ebit + row.depreciation,
    kind: "subtotal",
  },
  {
    key: "depreciation",
    label: "Depreciation",
    source: "Margin historis / fixed asset basis",
    formula: "Revenue x margin penyusutan",
    status: "calculated",
    workbookReference: "IS-DEP-01",
    value: (row) => row.depreciation,
  },
  {
    key: "depreciation-growth",
    label: "Depreciation Growth",
    source: "Engine DCF",
    formula: "Depreciation t / depreciation t-1 - 1",
    status: "calculated",
    workbookReference: "IS-DEP-02",
    display: "percent",
    value: (row, index, context) => growthValue(row.depreciation, previousDepreciation(index, context)),
  },
  {
    key: "ebit",
    label: "EBIT",
    source: "Proyeksi laba rugi",
    formula: "Gross Profit - Operating Expenses - Depreciation",
    status: "calculated",
    workbookReference: "IS-EBIT-01",
    value: (row) => row.ebit,
    kind: "subtotal",
  },
  {
    key: "ebit-margin",
    label: "EBIT Margin",
    source: "Engine DCF",
    formula: "EBIT / revenue",
    status: "calculated",
    workbookReference: "IS-EBIT-02",
    display: "percent",
    value: (row) => divideOrNull(row.ebit, row.revenue),
  },
  sectionProjectionLine("other-income-section", "Other Income/(Charge)"),
  {
    key: "interest-income",
    label: "Interest Income",
    source: "Yield kas/deposito atau margin pendapatan historis",
    formula: "Projected cash balance x historical cash yield; fallback revenue x historical margin",
    status: "review",
    workbookReference: "IS-NOI-01",
    value: (row) => row.interestIncome,
    note: "Presentation-only untuk laporan laba rugi penuh; dikecualikan dari NOPLAT, FCFF, dan nilai DCF utama.",
  },
  {
    key: "interest-income-growth",
    label: "Interest Income Growth",
    source: "Presentation-only projection",
    formula: "Interest income t / interest income t-1 - 1",
    status: "review",
    workbookReference: "IS-NOI-02",
    display: "percent",
    value: (row, index, context) => growthValue(row.interestIncome, previousInterestIncome(index, context)),
    note: "Indikator tren saja; bukan driver valuasi operasi.",
  },
  {
    key: "interest-expense",
    label: "Interest Expense",
    source: "Debt rate atau margin biaya historis",
    formula: "Interest-bearing debt x cost of debt; fallback revenue x historical finance-charge margin",
    status: "review",
    workbookReference: "IS-NOI-03",
    value: (row) => row.interestExpense,
    note: "Presentation-only untuk laporan laba rugi penuh; dikecualikan dari FCFF karena DCF utama memakai WACC.",
  },
  {
    key: "interest-expense-growth",
    label: "Interest Expense Growth",
    source: "Presentation-only projection",
    formula: "Interest expense t / interest expense t-1 - 1",
    status: "review",
    workbookReference: "IS-NOI-04",
    display: "percent",
    value: (row, index, context) => growthValue(row.interestExpense, previousInterestExpense(index, context)),
    note: "Indikator tren saja; bukan driver valuasi operasi.",
  },
  {
    key: "other-income-charge",
    label: "Other Income/(Charge)",
    source: "Presentation-only subtotal",
    formula: "Interest income + interest expense",
    status: "review",
    workbookReference: "IS-NOI-05",
    value: (row) => row.otherIncomeCharge,
    note: "Subtotal tampilan; tidak mengubah operating PBT/NOPLAT untuk DCF.",
  },
  {
    key: "non-operating-income",
    label: "Non Operating Income",
    source: "Conservative non-operating projection",
    formula: "0 unless recurring historical margin is supportable",
    status: "review",
    workbookReference: "IS-NOI-06",
    value: (row) => row.nonOperatingIncome,
    note: "Default konservatif; aset/pendapatan non-operasional dinilai terpisah bila material.",
  },
  sectionProjectionLine("full-income-statement-section", "Full Income Statement Presentation"),
  {
    key: "accounting-profit-before-tax",
    label: "Profit Before Tax",
    source: "Full income statement presentation",
    formula: "EBIT + Other Income/(Charge) + Non Operating Income",
    status: "review",
    workbookReference: "IS-PBT-01",
    value: (row) => row.accountingProfitBeforeTax,
    kind: "subtotal",
    note: "Accounting presentation; tidak menjadi basis langsung FCFF/WACC.",
  },
  {
    key: "presentation-corporate-tax",
    label: "Corporate Tax",
    source: "Presentation tax on accounting PBT",
    formula: "Profit Before Tax x statutory tax rate as deduction",
    status: "review",
    workbookReference: "IS-TAX-01",
    value: (row) => -row.accountingTaxOnPbt,
    note: "Presentation-only; DCF tetap memakai statutory tax on operating EBIT.",
  },
  {
    key: "accounting-net-profit-after-tax",
    label: "Accounting Net Profit After Tax",
    source: "Full income statement presentation",
    formula: "Profit Before Tax - presentation corporate tax",
    status: "review",
    workbookReference: "IS-NPAT-01",
    value: (row) => row.accountingNetProfitAfterTax,
    kind: "subtotal",
    note: "NPAT presentasi; dipisahkan dari NOPLAT agar basis DCF tidak tercampur dengan financing/non-operating items.",
  },
  {
    key: "accounting-net-profit-margin",
    label: "Accounting Net Profit After Tax Margin",
    source: "Full income statement presentation",
    formula: "Accounting NPAT / revenue",
    status: "review",
    workbookReference: "IS-NPAT-02",
    display: "percent",
    value: (row) => divideOrNull(row.accountingNetProfitAfterTax, row.revenue),
  },
  sectionProjectionLine("operating-to-noplat-bridge-section", "Operating to NOPLAT Bridge"),
  {
    key: "bridge-accounting-pbt",
    label: "Accounting Profit Before Tax",
    source: "Bridge starting point",
    formula: "Full income statement PBT",
    status: "review",
    workbookReference: "BR-NOPLAT-01",
    value: (row) => row.accountingProfitBeforeTax,
    note: "Bridge menunjukkan rekonsiliasi dari presentasi accounting ke basis operasi DCF.",
  },
  {
    key: "bridge-interest-expense-add-back",
    label: "Add Back: Interest Expense",
    source: "Operating bridge adjustment",
    formula: "-Interest expense",
    status: "review",
    workbookReference: "BR-NOPLAT-02",
    value: (row) => row.noplatBridgeInterestExpenseAddBack,
    note: "Mengeluarkan dampak struktur pendanaan dari basis FCFF/WACC.",
  },
  {
    key: "bridge-interest-income-deduction",
    label: "Less: Interest Income",
    source: "Operating bridge adjustment",
    formula: "-Interest income",
    status: "review",
    workbookReference: "BR-NOPLAT-03",
    value: (row) => row.noplatBridgeInterestIncomeDeduction,
    note: "Pendapatan kas/deposito dipisahkan dari earning power operasi.",
  },
  {
    key: "bridge-non-operating-deduction",
    label: "Less: Non Operating Income",
    source: "Operating bridge adjustment",
    formula: "-Non operating income",
    status: "review",
    workbookReference: "BR-NOPLAT-04",
    value: (row) => row.noplatBridgeNonOperatingIncomeDeduction,
    note: "Item non-operasional tidak menjadi driver NOPLAT operasi.",
  },
  {
    key: "bridge-operating-ebit",
    label: "Operating EBIT",
    source: "Bridge output",
    formula: "Accounting PBT + add back interest expense - interest income - non operating income",
    status: "calculated",
    workbookReference: "BR-NOPLAT-05",
    value: (row) => row.noplatBridgeOperatingEbit,
    kind: "subtotal",
    note: "Harus rekonsiliasi kembali ke EBIT operasi yang dipakai DCF.",
  },
  {
    key: "bridge-tax-on-ebit",
    label: "Statutory Tax on Operating EBIT",
    source: "Asumsi statutory tax",
    formula: "Operating EBIT x statutory tax rate as deduction",
    status: "calculated",
    workbookReference: "BR-NOPLAT-06",
    value: (row) => -row.noplatBridgeTaxOnEbit,
  },
  {
    key: "bridge-noplat",
    label: "NOPLAT",
    source: "DCF operating basis",
    formula: "Operating EBIT - statutory tax on operating EBIT",
    status: "calculated",
    workbookReference: "BR-NOPLAT-07",
    value: (row) => row.noplatBridgeNoplat,
    kind: "subtotal",
    note: "Nilai ini yang masuk FCFF; menjaga sistem DCF saat ini tetap menjadi basis utama.",
  },
  {
    key: "noplat-margin",
    label: "NOPLAT Margin",
    source: "DCF operating basis",
    formula: "NOPLAT / revenue",
    status: "calculated",
    workbookReference: "BR-NOPLAT-08",
    display: "percent",
    value: (row) => divideOrNull(row.noplatBridgeNoplat, row.revenue),
  },
];

const dcfBalanceProjectionRows: DcfProjectionLine[] = [
  sectionProjectionLine("assets-section", "ASSETS"),
  sectionProjectionLine("current-assets-section", "Current Assets"),
  {
    key: "cash-on-hands",
    label: "Cash on Hands",
    source: "Kebijakan kas & penyeimbang neraca",
    formula: "Max(minimum operating cash, balancing cash) x porsi kas di tangan historis",
    status: "review",
    workbookReference: "BS-CA-01",
    value: (row) => row.cashOnHand,
    note: "Kas menjaga minimum operating cash berbasis rasio historis; kebutuhan pendanaan tambahan masuk ke plug utang jangka pendek.",
  },
  {
    key: "cash-on-hands-growth",
    label: "Cash on Hands Growth",
    source: "Kebijakan kas & penyeimbang neraca",
    formula: "Cash on hands t / cash on hands t-1 - 1",
    status: "review",
    workbookReference: "BS-CA-02",
    display: "percent",
    value: (row, index, context) =>
      growthValue(row.cashOnHand, previousForecastValue(index, context, "cashOnHand", context.snapshot.cashOnHand)),
  },
  {
    key: "cash-in-banks",
    label: "Cash in Banks",
    source: "Kebijakan kas & penyeimbang neraca",
    formula: "Total kas kebijakan/penyeimbang - cash on hands",
    status: "review",
    workbookReference: "BS-CA-03",
    value: (row) => row.cashOnBankDeposit,
    note: "Alokasi bank/deposito mengikuti porsi historis sampai tersedia kebijakan kas yang lebih spesifik.",
  },
  {
    key: "cash-in-banks-growth",
    label: "Cash in Banks Growth",
    source: "Kebijakan kas & penyeimbang neraca",
    formula: "Cash in banks t / cash in banks t-1 - 1",
    status: "review",
    workbookReference: "BS-CA-04",
    display: "percent",
    value: (row, index, context) =>
      growthValue(row.cashOnBankDeposit, previousForecastValue(index, context, "cashOnBankDeposit", context.snapshot.cashOnBankDeposit)),
  },
  {
    key: "account-receivable",
    label: "Account Receivable",
    source: "Driver modal kerja",
    formula: "Revenue x AR days / 365",
    status: "calculated",
    workbookReference: "BS-CA-05",
    value: (row) => row.accountReceivable,
  },
  {
    key: "account-receivable-growth",
    label: "Account Receivable Growth",
    source: "Driver modal kerja",
    formula: "AR t / AR t-1 - 1",
    status: "calculated",
    workbookReference: "BS-CA-06",
    display: "percent",
    value: (row, index, context) => growthValue(row.accountReceivable, previousAccountReceivable(index, context)),
  },
  {
    key: "other-receivable",
    label: "Other Receivable",
    source: "Saldo non-operasional konstan",
    formula: "Saldo akhir historis dibawa tetap sampai ada driver baru",
    status: "review",
    workbookReference: "BS-CA-07",
    value: (row) => row.employeeReceivable,
    note: "Piutang non-dagang tidak masuk modal kerja operasi; default carry-forward ditandai review.",
  },
  {
    key: "other-receivable-growth",
    label: "Other Receivable Growth",
    source: "Saldo non-operasional konstan",
    formula: "Other receivable t / other receivable t-1 - 1",
    status: "review",
    workbookReference: "BS-CA-08",
    display: "percent",
    value: (row, index, context) =>
      growthValue(row.employeeReceivable, previousForecastValue(index, context, "employeeReceivable", context.snapshot.employeeReceivable)),
  },
  {
    key: "inventory",
    label: "Inventory",
    source: "Driver modal kerja",
    formula: "COGS x inventory days / 365",
    status: "calculated",
    workbookReference: "BS-CA-09",
    value: (row) => row.inventory,
  },
  {
    key: "inventory-growth",
    label: "Inventory Growth",
    source: "Driver modal kerja",
    formula: "Inventory t / inventory t-1 - 1",
    status: "calculated",
    workbookReference: "BS-CA-10",
    display: "percent",
    value: (row, index, context) => growthValue(row.inventory, previousInventory(index, context)),
  },
  {
    key: "other-current-assets",
    label: "Others",
    source: "Residual aset lancar historis",
    formula: "Current assets historis - cash - AR - other receivable - inventory",
    status: "review",
    workbookReference: "BS-CA-11",
    value: (row) => row.otherCurrentAssets,
    note: "Residual aset lancar dibawa tetap agar proyeksi neraca lengkap tanpa mencampurnya ke modal kerja operasi.",
  },
  {
    key: "other-current-assets-growth",
    label: "Others Growth",
    source: "Residual aset lancar historis",
    formula: "Other current assets t / other current assets t-1 - 1",
    status: "review",
    workbookReference: "BS-CA-12",
    display: "percent",
    value: (row, index, context) =>
      growthValue(row.otherCurrentAssets, previousForecastValue(index, context, "otherCurrentAssets", row.otherCurrentAssets)),
  },
  {
    key: "operating-current-assets",
    label: "Current Assets",
    source: "Subtotal aset lancar",
    formula: "Cash + AR + other receivable + inventory + other current assets",
    status: "calculated",
    workbookReference: "BS-CA-13",
    value: (row) => row.currentAssets,
    kind: "subtotal",
  },
  sectionProjectionLine("non-current-assets-section", "Non Current Assets"),
  sectionProjectionLine("fixed-asset-section", "Fixed Asset"),
  {
    key: "fixed-assets-beginning",
    label: "Beginning",
    source: "Jadwal aset tetap",
    formula: "Gross fixed asset roll-forward after additions",
    status: "calculated",
    workbookReference: "BS-NCA-01",
    value: (row) => row.fixedAssetGross,
  },
  {
    key: "accumulated-depreciations",
    label: "Accumulated Depreciations",
    source: "Jadwal aset tetap",
    formula: "-accumulated depreciation ending",
    status: "calculated",
    workbookReference: "BS-NCA-02",
    value: (row) => -row.accumulatedDepreciation,
  },
  {
    key: "accumulated-depreciations-growth",
    label: "Accumulated Depreciations Growth",
    source: "Jadwal aset tetap",
    formula: "Accumulated depreciation t / accumulated depreciation t-1 - 1",
    status: "calculated",
    workbookReference: "BS-NCA-03",
    display: "percent",
    value: (row, index, context) =>
      growthValue(
        row.accumulatedDepreciation,
        previousForecastValue(index, context, "accumulatedDepreciation", context.snapshot.accumulatedDepreciation),
      ),
  },
  {
    key: "fixed-assets-net",
    label: "Fixed Assets, Net",
    source: "Jadwal aset tetap",
    formula: "Gross fixed assets - accumulated depreciation",
    status: "calculated",
    workbookReference: "BS-NCA-04",
    value: (row) => row.fixedAssetsEnding,
    kind: "subtotal",
  },
  {
    key: "other-non-current-asset",
    label: "Other Non Current Asset",
    source: "Residual aset tidak lancar historis",
    formula: "Non-current assets historis - fixed assets net - intangible assets",
    status: "review",
    workbookReference: "BS-NCA-05",
    value: (row) => row.otherNonCurrentAssets,
    note: "Residual aset tidak lancar dibawa tetap sampai ada pemetaan aset non-operasional yang lebih rinci.",
  },
  {
    key: "intangible-assets",
    label: "Intangible Assets",
    source: "Saldo aset takberwujud",
    formula: "Saldo akhir historis dibawa tetap",
    status: "review",
    workbookReference: "BS-NCA-06",
    value: (row) => row.intangibleAssets,
    note: "Aset takberwujud diakui hanya jika ada saldo sumber; economic intangible tetap ditangani di metode EEM.",
  },
  {
    key: "total-non-current-assets",
    label: "Total Non Current Asset",
    source: "Subtotal aset tidak lancar",
    formula: "Fixed assets net + other non-current assets + intangible assets",
    status: "calculated",
    workbookReference: "BS-NCA-07",
    value: (row) => row.nonCurrentAssets,
    kind: "subtotal",
  },
  {
    key: "total-assets",
    label: "ASSETS",
    source: "Total aset proyeksi",
    formula: "Current assets + total non-current assets",
    status: "calculated",
    workbookReference: "BS-A-01",
    value: (row) => row.totalAssets,
    kind: "subtotal",
  },
  sectionProjectionLine("liabilities-equity-section", "LIABILITIES & EQUITY"),
  sectionProjectionLine("current-liabilities-section", "Current Liabilities"),
  {
    key: "bank-loan-short-term",
    label: "Bank Loan-Short Term",
    source: "Saldo utang + financing plug",
    formula: "Short-term loan historis + financing plug bila balancing cash negatif",
    status: "review",
    workbookReference: "BS-CL-01",
    value: (row) => row.bankLoanShortTerm,
    note: "Financing plug hanya aktif jika proyeksi menghasilkan kebutuhan pendanaan; nol berarti tidak ada pinjaman tambahan.",
  },
  {
    key: "account-payable",
    label: "Account Payables",
    source: "Driver modal kerja",
    formula: "COGS x AP days / 365",
    status: "calculated",
    workbookReference: "BS-CL-02",
    value: (row) => row.accountPayable,
  },
  {
    key: "tax-payable",
    label: "Tax Payable",
    source: "Akrual pajak berjalan",
    formula: "max(EBIT x tax rate, 0)",
    status: "review",
    workbookReference: "BS-CL-03",
    value: (row) => row.taxPayable,
    note: "Utang pajak diproyeksikan sebagai akrual akhir periode dan tetap dikeluarkan dari modal kerja operasi DCF.",
  },
  {
    key: "other-payable",
    label: "Others",
    source: "Driver modal kerja",
    formula: "Operating expenses x other payable days / 365 + interest payable carry-forward",
    status: "calculated",
    workbookReference: "BS-CL-04",
    value: (row) => row.otherPayable,
  },
  {
    key: "operating-current-liabilities",
    label: "Current Liabilities",
    source: "Subtotal liabilitas lancar",
    formula: "Short-term bank loan + AP + tax payable + other payable",
    status: "calculated",
    workbookReference: "BS-CL-05",
    value: (row) => row.currentLiabilities,
    kind: "subtotal",
  },
  sectionProjectionLine("non-current-liabilities-section", "Non Current Liabilities"),
  {
    key: "bank-loan-long-term",
    label: "Bank Loan-Long Term",
    source: "Saldo utang berbunga konstan",
    formula: "Saldo akhir historis dibawa tetap sampai ada jadwal utang",
    status: "review",
    workbookReference: "BS-NCL-01",
    value: (row) => row.bankLoanLongTerm,
  },
  {
    key: "other-non-current-liabilities",
    label: "Other Non Current Liabilites",
    source: "Residual liabilitas tidak lancar historis",
    formula: "Non-current liabilities historis - long-term bank loan",
    status: "review",
    workbookReference: "BS-NCL-02",
    value: (row) => row.otherNonCurrentLiabilities,
  },
  {
    key: "non-current-liabilities",
    label: "Non Current Liabilities",
    source: "Subtotal liabilitas tidak lancar",
    formula: "Long-term bank loan + other non-current liabilities",
    status: "calculated",
    workbookReference: "BS-NCL-03",
    value: (row) => row.nonCurrentLiabilities,
    kind: "subtotal",
  },
  sectionProjectionLine("shareholders-equity-section", "Shareholders' Equity"),
  {
    key: "paid-up-capital",
    label: "Paid Up Capital",
    source: "Jadwal modal konstan",
    formula: "Saldo akhir historis dibawa tetap sampai ada aksi korporasi",
    status: "review",
    workbookReference: "BS-EQ-01",
    value: (row) => row.paidUpCapital,
  },
  {
    key: "additional-paid-in-capital",
    label: "Additional Paid-in Capital",
    source: "Jadwal modal konstan",
    formula: "Saldo tambahan modal disetor dibawa tetap",
    status: "review",
    workbookReference: "BS-EQ-02",
    value: (row) => row.additionalPaidInCapital,
  },
  sectionProjectionLine("retained-earnings-section", "Retained Earnings"),
  {
    key: "retained-surplus",
    label: "Surplus",
    source: "Roll-forward saldo laba",
    formula: "Retained earnings ending t-1; dividend/distribution default 0",
    status: "calculated",
    workbookReference: "BS-EQ-03",
    value: (row) => row.retainedEarningsSurplus,
    note: "Default tidak membagikan dividen karena belum ada input distribusi; perubahan kebijakan harus menjadi override terpisah.",
  },
  {
    key: "retained-current-profit",
    label: "Current Profit",
    source: "Proyeksi laba rugi",
    formula: "Projected NPAT / NOPLAT before distribution policy",
    status: "calculated",
    workbookReference: "BS-EQ-04",
    value: (row) => row.noplat,
  },
  {
    key: "retained-earnings-ending",
    label: "Retained Earnings, Ending Balance",
    source: "Roll-forward saldo laba",
    formula: "Surplus + current profit - dividend/distribution",
    status: "calculated",
    workbookReference: "BS-EQ-05",
    value: (row) => row.retainedEarningsEnding,
    kind: "subtotal",
  },
  {
    key: "shareholders-equity",
    label: "Shareholders' Equity",
    source: "Subtotal ekuitas",
    formula: "Paid up capital + additional paid-in capital + retained earnings ending",
    status: "calculated",
    workbookReference: "BS-EQ-06",
    value: (row) => row.shareholdersEquity,
    kind: "subtotal",
  },
  {
    key: "liabilities-equity",
    label: "LIABILITIES & EQUITY",
    source: "Total liabilitas dan ekuitas",
    formula: "Current liabilities + non-current liabilities + shareholders' equity",
    status: "calculated",
    workbookReference: "BS-LE-01",
    value: (row) => row.liabilitiesAndEquity,
    kind: "subtotal",
  },
  {
    key: "balance-control",
    label: "Balance Control",
    source: "Kontrol integrasi neraca",
    formula: "Total assets - liabilities & equity",
    status: (context) => (context.forecast.every((row) => Math.abs(row.balanceControl) <= 1) ? "calculated" : "review"),
    workbookReference: "BS-CHK-01",
    value: (row) => row.balanceControl,
    kind: "subtotal",
    note: "Harus nol atau dalam toleransi pembulatan agar proyeksi neraca terintegrasi.",
  },
];

function buildDcfFixedAssetProjectionRows(projection?: FixedAssetProjectionSummary): DcfProjectionLine[] {
  const classLabels = projection?.rows.map((row) => row.assetName) ?? [];
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
    workbookReference: "Aset tetap / biaya perolehan awal",
    note,
    value: valueFor(index, "acquisitionBeginning"),
  })),
  {
    key: "acquisition-beginning-total",
    label: "Total",
    source,
    formula: "Sum acquisition beginning by asset class",
    status,
    workbookReference: "Aset tetap / total biaya perolehan awal",
    note,
    value: (row, _index, context) => context.fixedAssetProjection?.totals[row.year]?.acquisitionBeginning ?? null,
    kind: "subtotal",
  },
  sectionProjectionLine("acquisition-additions", "Additions"),
  ...classLabels.map((label, index) => ({
    key: `acquisition-additions-${index}`,
    label,
    source,
    formula: "Active fixed asset projection mode determines acquisition additions by asset class",
    status,
    workbookReference: "Aset tetap / additions",
    note,
    value: valueFor(index, "acquisitionAdditions"),
  })),
  {
    key: "capital-expenditure",
    label: "Total",
    source,
    formula: "Sum acquisition additions by asset class",
    status,
    workbookReference: "Aset tetap / total additions",
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
    workbookReference: "Aset tetap / biaya perolehan akhir",
    note,
    value: valueFor(index, "acquisitionEnding"),
  })),
  {
    key: "acquisition-ending-total",
    label: "Total",
    source,
    formula: "Sum acquisition ending by asset class",
    status,
    workbookReference: "Aset tetap / total biaya perolehan akhir",
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
    workbookReference: "Aset tetap / akumulasi penyusutan awal",
    note,
    value: valueFor(index, "depreciationBeginning"),
  })),
  {
    key: "depreciation-beginning-total",
    label: "Total",
    source,
    formula: "Sum depreciation beginning by asset class",
    status,
    workbookReference: "Aset tetap / total akumulasi penyusutan awal",
    note,
    value: (row, _index, context) => context.fixedAssetProjection?.totals[row.year]?.depreciationBeginning ?? null,
    kind: "subtotal",
  },
  sectionProjectionLine("depreciation-additions", "Additions"),
  ...classLabels.map((label, index) => ({
    key: `depreciation-additions-${index}`,
    label,
    source,
    formula: "Active fixed asset projection mode determines depreciation additions by asset class",
    status,
    workbookReference: "Aset tetap / penyusutan tahun berjalan",
    note,
    value: valueFor(index, "depreciationAdditions"),
  })),
  {
    key: "depreciation-additions-total",
    label: "Total",
    source,
    formula: "Sum depreciation additions by asset class",
    status,
    workbookReference: "Aset tetap / total penyusutan tahun berjalan",
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
    workbookReference: "Aset tetap / akumulasi penyusutan akhir",
    note,
    value: valueFor(index, "depreciationEnding"),
  })),
  {
    key: "depreciation-ending-total",
    label: "Total",
    source,
    formula: "Sum depreciation ending by asset class",
    status,
    workbookReference: "Aset tetap / total akumulasi penyusutan akhir",
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
    workbookReference: "Aset tetap / nilai buku neto",
    note,
    value: valueFor(index, "netValue"),
  })),
  {
    key: "fixed-assets-ending",
    label: "Total",
    source,
    formula: "Sum net fixed assets by asset class",
    status,
    workbookReference: "Aset tetap / total nilai buku neto",
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
      ? `${modeLabel} aktif mengikuti roll-forward aset tetap historis dan menjadi driver DCF; ada ${warningCount} warning model yang perlu direview.`
      : `${modeLabel} aktif mengikuti roll-forward aset tetap historis dan menjadi driver DCF.`;
  }

  return `${modeLabel} aktif sebagai baseline maintenance capex dan menjadi driver DCF.`;
}

function formatFixedAssetProjectionMode(mode: FixedAssetProjectionSummary["mode"]): string {
  return mode === "workbook-formula" ? "Roll-forward Historis" : "Proksi DCF";
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
        fixedAssetGross: amounts.acquisitionEnding,
        accumulatedDepreciation: amounts.depreciationEnding,
        fixedAssetsEnding: amounts.netValue,
      },
    ]),
  );
}

const cfsScheduleAbsoluteMateriality = 1_000_000;

function cfsScheduleMateriality(row: DcfForecastRow, revenueRatio = 0.01): number {
  return Math.max(cfsScheduleAbsoluteMateriality, Math.abs(row.revenue) * revenueRatio);
}

function hasMaterialCfsScheduleValue(
  context: DcfProjectionContext,
  value: (row: DcfForecastRow) => number,
  revenueRatio = 0.01,
): boolean {
  return context.forecast.some((row) => Math.abs(value(row)) > cfsScheduleMateriality(row, revenueRatio));
}

function cfsScheduleStatus(
  context: DcfProjectionContext,
  value: (row: DcfForecastRow) => number,
  revenueRatio = 0.01,
): DcfProjectionStatus {
  return hasMaterialCfsScheduleValue(context, value, revenueRatio) ? "review" : "scheduleDriven";
}

function cfsControlStatus(context: DcfProjectionContext, value: (row: DcfForecastRow) => number): DcfProjectionStatus {
  return context.forecast.every((row) => Math.abs(value(row)) <= 1) ? "scheduleDriven" : "review";
}

const dcfCashFlowProjectionRows: DcfProjectionLine[] = [
  {
    key: "ebitda",
    label: "EBITDA",
    source: "Proyeksi laba rugi",
    formula: "EBIT + depreciation",
    status: "calculated",
    workbookReference: "CF-OPS-01",
    value: (row) => row.ebit + row.depreciation,
  },
  {
    key: "corporate-tax",
    label: "Corporate Tax",
    source: "Asumsi statutory tax",
    formula: "EBIT x tax rate as cash tax deduction",
    status: "calculated",
    workbookReference: "CF-OPS-02",
    value: (row) => -row.statutoryTaxOnEbit,
  },
  sectionProjectionLine("changes-working-capital", "Changes in Working Capital"),
  {
    key: "operating-current-assets-change",
    label: "(Kenaikan) penurunan aset lancar operasional",
    source: "Proyeksi neraca",
    formula: "-(aset lancar terpilih t - aset lancar terpilih t-1)",
    status: "calculated",
    workbookReference: "CF-WC-01",
    value: (_row, index, context) => operatingCurrentAssetsCashEffect(index, context),
  },
  {
    key: "operating-current-liabilities-change",
    label: "Kenaikan (penurunan) liabilitas lancar operasional",
    source: "Proyeksi neraca",
    formula: "liabilitas terpilih t - liabilitas terpilih t-1",
    status: "calculated",
    workbookReference: "CF-WC-02",
    value: (_row, index, context) => operatingCurrentLiabilitiesCashEffect(index, context),
  },
  {
    key: "working-capital",
    label: "Working Capital",
    source: "DCF, Changes Working Capital",
    formula: "Operating current assets cash effect + operating current liabilities cash effect",
    status: "calculated",
    workbookReference: "CF-WC-03",
    value: (row) => -row.changeInNwc,
    kind: "subtotal",
  },
  {
    key: "cash-flow-from-operations",
    label: "Cash Flow from Operations",
    source: "Proyeksi arus kas",
    formula: "EBITDA - statutory tax + changes in working capital",
    status: "calculated",
    workbookReference: "CF-OPS-03",
    value: (row) => row.cashFlowFromOperations,
    kind: "subtotal",
  },
  {
    key: "cash-flow-from-non-operations",
    label: "Cash Flow from Non Operations",
    source: "Proyeksi laba rugi",
    formula: "Projected non-operating income cash flow",
    status: "calculated",
    workbookReference: "CF-NONOPS-01",
    value: (row) => row.nonOperatingCashFlow,
    note: "Arus kas presentasi mengikuti proyeksi non-operasional; nilai DCF utama tetap memakai operating FCFF.",
  },
  {
    key: "capital-expenditure",
    label: "Cash Flow from Investment (Capital Expenditure)",
    source: "Proyeksi Aset Tetap / engine DCF",
    formula: "-capital expenditure",
    status: "calculated",
    workbookReference: "CF-INV-01",
    value: (row) => row.cashFlowFromInvestment,
  },
  {
    key: "cash-flow-before-financing",
    label: "Cash Flow before Financing",
    source: "Cash flow statement bridge",
    formula: "Cash flow from operations + non-operating cash flow - capex",
    status: "calculated",
    workbookReference: "CF-FCFF-01",
    value: (row) => row.cashFlowBeforeFinancing,
    kind: "subtotal",
    note: "Subtotal arus kas sebelum pendanaan; FCFF valuasi tetap ditelusuri terpisah dari item non-operasional.",
  },
  sectionProjectionLine("financing-section", "Financing"),
  {
    key: "equity-injection",
    label: "Equity Injection",
    source: "Movement modal disetor",
    formula: "Paid-up capital and additional paid-in capital t - t-1",
    status: "calculated",
    workbookReference: "CF-FIN-01",
    value: (row) => row.equityInjection,
    note: "Nol berarti tidak ada setoran modal baru yang diproyeksikan pada tahun tersebut.",
  },
  {
    key: "new-loan",
    label: "Financing Inflow / Balance Plug",
    source: "Residual financing schedule",
    formula: "max(Cash flow from financing - known financing cash flows, 0)",
    status: "calculated",
    workbookReference: "CF-FIN-02",
    value: (row) => row.newLoan,
    note: "Plug positif menunjukkan arus masuk pendanaan/timing yang belum dialokasikan ke jadwal utang, ekuitas, pajak, atau kebijakan kas eksplisit.",
  },
  {
    key: "interest-expense",
    label: "Interest Expense",
    source: "Proyeksi laba rugi",
    formula: "Projected interest expense cash flow",
    status: "calculated",
    workbookReference: "CF-FIN-03",
    value: (row) => row.interestExpenseCashFlow,
    note: "Presentation cash flow; tidak masuk operating FCFF karena DCF utama memakai WACC.",
  },
  {
    key: "interest-income",
    label: "Interest Income",
    source: "Proyeksi laba rugi",
    formula: "Projected interest income cash flow",
    status: "calculated",
    workbookReference: "CF-FIN-04",
    value: (row) => row.interestIncomeCashFlow,
    note: "Presentation cash flow dari kas/deposito; nilai operasi DCF tetap memisahkan pendapatan bunga.",
  },
  {
    key: "principal-repayment",
    label: "Principal Repayment / Distribution Plug",
    source: "Residual financing schedule",
    formula: "min(Cash flow from financing - known financing cash flows, 0)",
    status: "calculated",
    workbookReference: "CF-FIN-05",
    value: (row) => row.principalRepayment,
    note: "Plug negatif menunjukkan arus keluar pendanaan/distribusi tersirat yang belum dialokasikan ke pelunasan, dividen, atau kebijakan kas.",
  },
  {
    key: "cash-flow-from-financing",
    label: "Cash Flow from Financing",
    source: "Rekonsiliasi kas dan financing schedule",
    formula: "Equity injection + financing inflow + interest expense + interest income + principal repayment",
    status: (context) => (context.forecast.every((row) => Math.abs(row.cashFlowControl) <= 1) ? "calculated" : "review"),
    workbookReference: "CF-FIN-06",
    value: (row) => row.cashFlowFromFinancing,
    kind: "subtotal",
    note: "Baris ini tetap merekonsiliasi cash roll-forward, sementara residual pendanaan dipisahkan ke inflow atau repayment/distribution plug.",
  },
  {
    key: "net-cash-flow",
    label: "Net Cash Flow",
    source: "Cash roll-forward",
    formula: "Cash flow before financing + cash flow from financing",
    status: "calculated",
    workbookReference: "CF-CASH-01",
    value: (row) => row.netCashFlow,
    kind: "subtotal",
  },
  {
    key: "cash-beginning-balance",
    label: "Cash-Beginning Balance",
    source: "Saldo kas tahun sebelumnya",
    formula: "Ending cash t-1; untuk tahun pertama memakai kas historis",
    status: "calculated",
    workbookReference: "CF-CASH-02",
    value: (row) => row.cashBeginningBalance,
  },
  {
    key: "cash-ending-balance",
    label: "Cash-Ending Balance",
    source: "Proyeksi neraca",
    formula: "Beginning cash + net cash flow",
    status: "calculated",
    workbookReference: "CF-CASH-03",
    value: (row) => row.cashEndingBalance,
    kind: "subtotal",
  },
  {
    key: "cash-ending-in-bank",
    label: "Cash Ending in Bank",
    source: "Alokasi kas neraca",
    formula: "Cash ending - cash on hand",
    status: "calculated",
    workbookReference: "CF-CASH-04",
    value: (row) => row.cashOnBankDeposit,
  },
  {
    key: "cash-ending-in-cash-on-hand",
    label: "Cash Ending in Cash on Hand",
    source: "Alokasi kas neraca",
    formula: "Cash ending x porsi kas di tangan historis",
    status: "calculated",
    workbookReference: "CF-CASH-05",
    value: (row) => row.cashOnHand,
  },
  {
    key: "cash-flow-control",
    label: "Cash Flow Control",
    source: "Kontrol integrasi arus kas",
    formula: "Beginning cash + CFO + CFI + CFF - ending cash",
    status: (context) => (context.forecast.every((row) => Math.abs(row.cashFlowControl) <= 1) ? "calculated" : "review"),
    workbookReference: "CF-CHK-01",
    value: (row) => row.cashFlowControl,
    kind: "subtotal",
    note: "Harus nol atau dalam toleransi pembulatan agar arus kas dan neraca saling rekonsiliasi.",
  },
  sectionProjectionLine("schedule-safeguards", "Integrated Schedule Safeguards"),
  {
    key: "fcff-preservation-control",
    label: "FCFF Preservation Control",
    source: "DCF safeguard",
    formula: "FCFF - (cash flow from operations + cash flow from investment)",
    status: (context) => cfsControlStatus(context, (row) => row.freeCashFlow - (row.cashFlowFromOperations + row.cashFlowFromInvestment)),
    workbookReference: "DCF-FCFF-GUARD-01",
    value: (row) => row.freeCashFlow - (row.cashFlowFromOperations + row.cashFlowFromInvestment),
    kind: "subtotal",
    note: "Harus nol agar schedule CFS tidak mengubah FCFF/WACC valuation stream.",
  },
  sectionProjectionLine("tax-payable-schedule", "Tax Payable Schedule"),
  {
    key: "tax-payable-beginning",
    label: "Tax Payable Beginning",
    source: "Projected balance sheet",
    formula: "Tax payable ending t-1; first year uses historical tax payable",
    status: "scheduleDriven",
    workbookReference: "CF-TAX-01",
    value: (row) => row.taxPayableBeginning,
  },
  {
    key: "tax-expense-accrued",
    label: "Current Tax Expense Accrued",
    source: "Proyeksi laba rugi",
    formula: "max(EBIT x statutory tax rate, 0)",
    status: "scheduleDriven",
    workbookReference: "CF-TAX-02",
    value: (row) => row.taxExpenseAccrued,
  },
  {
    key: "tax-cash-paid-implied",
    label: "Cash Tax Paid - Implied by Payable",
    source: "Tax payable roll-forward",
    formula: "Beginning tax payable + current tax expense - ending tax payable",
    status: "scheduleDriven",
    workbookReference: "CF-TAX-03",
    value: (row) => -row.taxCashPaidImpliedByPayableSchedule,
    note: "Diagnostic arus kas pajak berbasis utang pajak; belum mengganti cash tax FCFF baseline.",
  },
  {
    key: "cash-tax-variance-to-schedule",
    label: "Cash Tax Variance vs DCF Cash Tax",
    source: "Tax schedule diagnostic",
    formula: "Implied cash tax paid - DCF cash tax paid",
    status: (context) => cfsScheduleStatus(context, (row) => row.cashTaxVarianceToSchedule, 0.005),
    workbookReference: "CF-TAX-04",
    value: (row) => row.cashTaxVarianceToSchedule,
    note: "Variance material tetap review agar DCF baseline tidak berubah tanpa approval.",
  },
  {
    key: "tax-payable-ending",
    label: "Tax Payable Ending",
    source: "Projected balance sheet",
    formula: "Projected tax payable ending",
    status: "scheduleDriven",
    workbookReference: "CF-TAX-05",
    value: (row) => row.taxPayable,
  },
  {
    key: "tax-payable-schedule-control",
    label: "Tax Payable Roll-forward Control",
    source: "Tax payable roll-forward",
    formula: "Beginning payable + tax expense - implied cash tax paid - ending payable",
    status: (context) => cfsControlStatus(context, (row) => row.taxPayableScheduleControl),
    workbookReference: "CF-TAX-CHK",
    value: (row) => row.taxPayableScheduleControl,
    kind: "subtotal",
  },
  sectionProjectionLine("debt-distribution-schedule", "Debt & Distribution Schedule"),
  {
    key: "debt-beginning-balance",
    label: "Interest-Bearing Debt Beginning",
    source: "Projected balance sheet",
    formula: "Short-term debt + long-term debt ending t-1",
    status: "scheduleDriven",
    workbookReference: "CF-DEBT-01",
    value: (row) => row.debtBeginningBalance,
  },
  {
    key: "debt-balance-sheet-movement",
    label: "Debt Movement from Balance Sheet",
    source: "Projected balance sheet",
    formula: "Ending interest-bearing debt - beginning interest-bearing debt",
    status: "scheduleDriven",
    workbookReference: "CF-DEBT-02",
    value: (row) => row.debtBalanceSheetMovement,
    note: "Positif berarti drawdown utang; negatif berarti pelunasan utang yang terkonfirmasi di neraca.",
  },
  {
    key: "debt-ending-balance",
    label: "Interest-Bearing Debt Ending",
    source: "Projected balance sheet",
    formula: "Projected short-term debt + projected long-term debt",
    status: "scheduleDriven",
    workbookReference: "CF-DEBT-03",
    value: (row) => row.debtEndingBalance,
  },
  {
    key: "scheduled-dividend-distribution",
    label: "Dividend / Distribution Scheduled",
    source: "Equity roll-forward",
    formula: "-projected dividend distribution",
    status: "scheduleDriven",
    workbookReference: "CF-EQ-01",
    value: (row) => row.scheduledDividendDistribution,
    note: "Default nol kecuali engine historical-derived menurunkan payout dari pergerakan ekuitas historis.",
  },
  {
    key: "unallocated-financing-inflow",
    label: "Unallocated Financing Inflow",
    source: "Financing schedule diagnostic",
    formula: "max(CFF - known schedule cash flows, 0)",
    status: (context) => cfsScheduleStatus(context, (row) => row.unallocatedFinancingInflow),
    workbookReference: "CF-FIN-REVIEW-01",
    value: (row) => row.unallocatedFinancingInflow,
    note: "Residual positif belum terikat ke debt/equity/tax/cash policy schedule eksplisit.",
  },
  {
    key: "unallocated-financing-outflow",
    label: "Unallocated Repayment / Distribution Outflow",
    source: "Financing schedule diagnostic",
    formula: "min(CFF - known schedule cash flows, 0)",
    status: (context) => cfsScheduleStatus(context, (row) => row.unallocatedFinancingOutflow),
    workbookReference: "CF-FIN-REVIEW-02",
    value: (row) => row.unallocatedFinancingOutflow,
    note: "Residual negatif belum terikat ke debt repayment, dividend/distribution, atau cash policy eksplisit.",
  },
  {
    key: "financing-schedule-control",
    label: "Financing Schedule Control",
    source: "Debt/equity schedule bridge",
    formula: "CFF - known schedule cash flows - unallocated residual",
    status: (context) => cfsControlStatus(context, (row) => row.financingScheduleControl),
    workbookReference: "CF-FIN-CHK",
    value: (row) => row.financingScheduleControl,
    kind: "subtotal",
  },
  sectionProjectionLine("cash-policy-schedule", "Cash Policy Schedule"),
  {
    key: "target-operating-cash",
    label: "Target Operating Cash",
    source: "Historical cash-to-revenue ratio",
    formula: "Revenue x historical cash-to-revenue ratio",
    status: "scheduleDriven",
    workbookReference: "CF-CASH-POL-01",
    value: (row) => row.cashPolicyTarget,
  },
  {
    key: "cash-policy-gap",
    label: "Cash Policy Gap",
    source: "Cash policy diagnostic",
    formula: "Cash ending - target operating cash",
    status: (context) => cfsScheduleStatus(context, (row) => row.cashPolicyGap),
    workbookReference: "CF-CASH-POL-02",
    value: (row) => row.cashPolicyGap,
    note: "Gap positif menunjukkan cash surplus relatif terhadap kebijakan historis; gap negatif menunjukkan funding need.",
  },
  {
    key: "cash-policy-surplus",
    label: "Cash Policy Surplus",
    source: "Cash policy diagnostic",
    formula: "max(cash ending - target operating cash, 0)",
    status: (context) => cfsScheduleStatus(context, (row) => row.cashPolicySurplus),
    workbookReference: "CF-CASH-POL-03",
    value: (row) => row.cashPolicySurplus,
  },
  {
    key: "cash-policy-funding-need",
    label: "Cash Policy Funding Need",
    source: "Cash policy diagnostic",
    formula: "max(target operating cash - cash ending, 0)",
    status: (context) => cfsScheduleStatus(context, (row) => row.cashPolicyFundingNeed),
    workbookReference: "CF-CASH-POL-04",
    value: (row) => row.cashPolicyFundingNeed,
  },
];

const dcfProjectionConfigs: Record<ProjectionStatementKind, DcfProjectionConfig> = {
  income: {
    eyebrow: "MODEL LABA RUGI",
    title: "Proyeksi Laba Rugi",
    badge: "Full IS + NOPLAT bridge",
    summary:
      "Angka dihitung ulang dari driver revenue, margin historis, tarif pajak aktif, projection presentation items, dan bridge operasi ke NOPLAT.",
    rows: dcfIncomeProjectionRows,
    testId: "dcf-income-projection-table",
  },
  balance: {
    eyebrow: "MODEL NERACA",
    title: "Proyeksi Neraca",
    badge: "Integrated BS",
    summary: "Neraca proyeksi dihitung dari driver operasi, jadwal aset tetap, roll-forward ekuitas, kontrol balancing, dan rekonsiliasi arus kas.",
    rows: dcfBalanceProjectionRows,
    testId: "dcf-balance-projection-table",
  },
  fixedAssets: {
    eyebrow: "PROYEKSI ASET TETAP",
    title: "Proyeksi Aset Tetap",
    badge: "Capex, depreciation, NBV",
    summary: "Struktur roll-forward aset tetap; beginning, additions, ending, depreciation, dan nilai buku neto dihitung per kelas aset.",
    rows: [],
    testId: "dcf-fixed-asset-projection-table",
  },
  cashFlow: {
    eyebrow: "MODEL ARUS KAS",
    title: "Proyeksi Cash Flow Statement",
    badge: "Schedule-driven guardrails",
    summary:
      "Arus kas direkonsiliasi ke ending cash neraca dan diperkaya dengan schedule pajak, utang, distribusi, cash policy, serta kontrol perlindungan FCFF DCF.",
    rows: dcfCashFlowProjectionRows,
    testId: "dcf-cash-flow-projection-table",
  },
};

function ProjectionPlanningPanel({
  planning,
  horizonYears,
  activeDcfSelection,
  onChange,
}: {
  planning: ProjectionPlanningState;
  horizonYears: number;
  activeDcfSelection: ActiveDcfSelection;
  onChange: (patch: Partial<ProjectionPlanningState>) => void;
}) {
  const isFiniteLife = planning.entityLife === "finite-life";
  const showTerminalValueInput =
    planning.terminalTreatment === "residual-liquidation-value" ||
    planning.terminalTreatment === "reviewer-approved-terminal";
  const terminalTreatmentLabel = terminalTreatmentLabels[planning.terminalTreatment]?.label ?? "Default terminal value";

  return (
    <section className="projection-planning-panel" aria-label="Pengaturan horizon dan terminal DCF">
      <div className="projection-planning-summary">
        <p className="eyebrow">Planning DCF</p>
        <strong>{horizonYears} tahun eksplisit</strong>
        <span>{terminalTreatmentLabel}</span>
      </div>
      <label className="field">
        <span>Horizon proyeksi</span>
        <input
          aria-label="Horizon proyeksi"
          min={minimumProjectionHorizonYears}
          max={maximumProjectionHorizonYears}
          step={1}
          type="number"
          value={planning.horizonYears}
          onChange={(event) => onChange({ horizonYears: event.target.value })}
        />
        <small className="field-help">Default 5 tahun; rentang {minimumProjectionHorizonYears}-{maximumProjectionHorizonYears} tahun.</small>
      </label>
      <label className="field">
        <span>Entity life</span>
        <select
          aria-label="Entity life"
          value={planning.entityLife}
          onChange={(event) => onChange({ entityLife: event.target.value as ProjectionEntityLife })}
        >
          {projectionEntityLifeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <small className="field-help">
          {projectionEntityLifeOptions.find((option) => option.value === planning.entityLife)?.description}
        </small>
      </label>
      <label className="field">
        <span>Terminal treatment</span>
        <select
          aria-label="Terminal treatment"
          value={planning.terminalTreatment}
          onChange={(event) => onChange({ terminalTreatment: event.target.value as DcfTerminalTreatment })}
          disabled={!isFiniteLife}
        >
          {terminalTreatmentOptions
            .filter((option) => isFiniteLife || option.value === "going-concern-terminal-value")
            .map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
        </select>
        <small className="field-help">
          {terminalTreatmentLabels[planning.terminalTreatment]?.description}
        </small>
      </label>
      {showTerminalValueInput ? (
        <label className="field">
          <span>Terminal/residual value</span>
          <input
            aria-label="Terminal/residual value"
            inputMode="decimal"
            value={planning.terminalValue}
            onChange={(event) => onChange({ terminalValue: event.target.value })}
          />
          <small className="field-help">Nilai akan didiskonto pada tahun proyeksi terakhir.</small>
        </label>
      ) : null}
      {isFiniteLife ? (
        <label className="field projection-planning-reason">
          <span>Alasan terminal treatment</span>
          <textarea
            aria-label="Alasan terminal treatment"
            rows={2}
            value={planning.terminalTreatmentReason}
            onChange={(event) => onChange({ terminalTreatmentReason: event.target.value })}
          />
        </label>
      ) : null}
      <div className="projection-planning-status">
        <span>Basis aktif</span>
        <strong>{activeDcfSelection.shortLabel}</strong>
        <small>
          {activeDcfSelection.terminalTreatment === "going-concern-terminal-value"
            ? "Terminal value mengikuti growth/WACC."
            : terminalTreatmentLabels[activeDcfSelection.terminalTreatment]?.description}
        </small>
      </div>
    </section>
  );
}

function ProjectionStatementSection({
  kind,
  forecast,
  snapshot,
  activeDcfSelection,
  activeWaccBasisLabel,
  fixedAssetProjection,
  fixedAssetProjectionMode = defaultFixedAssetProjectionMode,
  onFixedAssetProjectionModeChange,
  incomeProjectionRelianceGovernance,
  incomeProjectionControls,
  incomeProjectionScenario,
  onIncomeProjectionYearOverrideChange,
  onIncomeProjectionYearOverrideReasonChange,
  onIncomeProjectionReviewerDecisionChange,
  onIncomeProjectionNonOperatingPolicyChange,
  onIncomeProjectionPresentationAssumptionChange,
  onIncomeProjectionPresentationAssumptionReasonChange,
  onApplyIncomeProjectionSmartSuggestions,
  workingCapitalCandidates,
  onToggleWorkingCapitalInclusion,
}: {
  kind: ProjectionStatementKind;
  forecast: DcfForecastRow[];
  snapshot: FinancialStatementSnapshot;
  activeDcfSelection: ActiveDcfSelection;
  activeWaccBasisLabel: string;
  fixedAssetProjection?: FixedAssetProjectionSummary;
  fixedAssetProjectionMode?: FixedAssetProjectionMode;
  onFixedAssetProjectionModeChange?: (mode: FixedAssetProjectionMode) => void;
  incomeProjectionRelianceGovernance?: IncomeProjectionRelianceGovernanceResult;
  incomeProjectionControls?: IncomeProjectionControlState;
  incomeProjectionScenario?: IncomeProjectionScenarioResult;
  onIncomeProjectionYearOverrideChange?: (year: number, key: IncomeProjectionOverrideField, value: string) => void;
  onIncomeProjectionYearOverrideReasonChange?: (year: number, reason: string) => void;
  onIncomeProjectionReviewerDecisionChange?: (patch: Partial<IncomeProjectionReviewerDecisionState>) => void;
  onIncomeProjectionNonOperatingPolicyChange?: (patch: Partial<IncomeProjectionNonOperatingPolicyState>) => void;
  onIncomeProjectionPresentationAssumptionChange?: (key: IncomeProjectionPresentationAssumptionKey, value: string) => void;
  onIncomeProjectionPresentationAssumptionReasonChange?: (reason: string) => void;
  onApplyIncomeProjectionSmartSuggestions?: () => void;
  workingCapitalCandidates?: DcfProjectionWorkingCapitalCandidates;
  onToggleWorkingCapitalInclusion?: (rowKey: CashFlowWorkingCapitalRowKey, accountRowId: string, included: boolean) => void;
}) {
  const config =
    kind === "fixedAssets"
      ? {
          ...dcfProjectionConfigs.fixedAssets,
          summary: fixedAssetProjection?.hasProjection
            ? describeFixedAssetProjectionSummary(fixedAssetProjection)
            : "Detail per kelas aset membutuhkan jadwal historis agar angka proyeksi dapat dihitung.",
          rows: buildDcfFixedAssetProjectionRows(fixedAssetProjection),
        }
      : dcfProjectionConfigs[kind];
  const scenarioPreviewForecast =
    kind === "income" && incomeProjectionScenario?.hasScenarioInput ? incomeProjectionScenario.dcf.forecast : null;
  const displayForecast = scenarioPreviewForecast ?? forecast;
  const firstForecast = displayForecast[0] ?? null;
  const finalForecast = displayForecast.at(-1) ?? null;
  const horizonLabel = firstForecast && finalForecast ? `${firstForecast.year}-${finalForecast.year}` : "Perlu data";
  const displayedRevenueGrowth = readDisplayedRevenueGrowth(displayForecast, snapshot);

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
          <p>Proyeksi {activeDcfSelection.projectionHorizonYears} tahun dimulai setelah tanggal penilaian aktif.</p>
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
          <section className="active-driver-strip" aria-label={`Basis aktif ${config.title}`}>
            <div>
              <span>Basis DCF aktif</span>
              <strong>{activeDcfSelection.shortLabel}</strong>
              <small>{activeDcfSelection.projectionEngineLabel}</small>
            </div>
            <div>
              <span>Terminal growth aktif</span>
              <strong>{formatTerminalGrowthPercent(activeDcfSelection.terminalGrowth)}</strong>
              <small>{terminalTreatmentLabels[activeDcfSelection.terminalTreatment]?.label ?? "Dipakai di nilai terminal DCF"}</small>
            </div>
            <div>
              <span>Working capital</span>
              <strong>{activeDcfSelection.includeWorkingCapitalChange ? "Incremental" : "Diabaikan"}</strong>
              <small>Perlakuan perubahan modal kerja pada FCFF</small>
            </div>
          </section>
          <FixedAssetProjectionModeSelector
            mode={fixedAssetProjectionMode}
            onChange={onFixedAssetProjectionModeChange}
            disabled={!fixedAssetProjection?.hasProjection}
          />
          <FixedAssetProjectionDriverStrip forecast={displayForecast} fixedAssetProjection={fixedAssetProjection} />
        </>
      ) : (
        <section className="active-driver-strip" aria-label={`Driver aktif ${config.title}`}>
          <div>
            <span>Basis DCF aktif</span>
            <strong>{activeDcfSelection.shortLabel}</strong>
            <small>{activeDcfSelection.projectionEngineLabel}</small>
          </div>
          <div>
            <span>Revenue growth</span>
            <strong>{formatPercent(displayedRevenueGrowth)}</strong>
            <small>{scenarioPreviewForecast ? "Scenario reviewer live preview" : "Driver pertumbuhan pendapatan aktif"}</small>
          </div>
          <div>
            <span>Tax rate</span>
            <strong>{formatPercent(snapshot.taxRate)}</strong>
            <small>Statutory tax untuk NOPLAT</small>
          </div>
          <div>
            <span>WACC</span>
            <strong>{formatPercent(snapshot.wacc)}</strong>
            <small>{activeWaccBasisLabel} basis untuk discount factor dan nilai terminal</small>
          </div>
          <div>
            <span>Terminal growth aktif</span>
            <strong>{formatTerminalGrowthPercent(activeDcfSelection.terminalGrowth)}</strong>
            <small>{terminalTreatmentLabels[activeDcfSelection.terminalTreatment]?.label ?? "Dipakai di nilai terminal DCF"}</small>
          </div>
          <div>
            <span>Working capital</span>
            <strong>{activeDcfSelection.includeWorkingCapitalChange ? "Incremental" : "Diabaikan"}</strong>
            <small>Perlakuan perubahan modal kerja pada FCFF</small>
          </div>
        </section>
      )}

      {kind === "income" && incomeProjectionRelianceGovernance ? (
        <IncomeProjectionReliancePanel governance={incomeProjectionRelianceGovernance} />
      ) : null}

      {kind === "income" && incomeProjectionControls && incomeProjectionScenario ? (
        <IncomeProjectionControlsPanel
          controls={incomeProjectionControls}
          forecast={forecast}
          scenario={incomeProjectionScenario}
          snapshot={snapshot}
          onYearOverrideChange={onIncomeProjectionYearOverrideChange}
          onYearOverrideReasonChange={onIncomeProjectionYearOverrideReasonChange}
          onReviewerDecisionChange={onIncomeProjectionReviewerDecisionChange}
          onNonOperatingPolicyChange={onIncomeProjectionNonOperatingPolicyChange}
          onPresentationAssumptionChange={onIncomeProjectionPresentationAssumptionChange}
          onPresentationAssumptionReasonChange={onIncomeProjectionPresentationAssumptionReasonChange}
          onApplySmartSuggestions={onApplyIncomeProjectionSmartSuggestions}
        />
      ) : null}

      <DcfProjectionPanel
        config={config}
        forecast={displayForecast}
        snapshot={snapshot}
        fixedAssetProjection={fixedAssetProjection}
        workingCapitalCandidates={kind === "cashFlow" ? workingCapitalCandidates : undefined}
        onToggleWorkingCapitalInclusion={kind === "cashFlow" ? onToggleWorkingCapitalInclusion : undefined}
      />
    </>
  );
}

function IncomeProjectionReliancePanel({ governance }: { governance: IncomeProjectionRelianceGovernanceResult }) {
  return (
    <div className={`projection-governance-panel ${governance.level}`} data-testid="income-projection-reliance-governance">
      <div className="projection-governance-heading">
        <div>
          <span>Governance final report reliance</span>
          <strong>{governance.title}</strong>
          <small>{governance.summary}</small>
        </div>
        <em className={`source-badge ${governance.level === "critical" ? "warning" : governance.level === "review" ? "sensitivity" : "recommended"}`}>
          {incomeProjectionRelianceDecisionLabel[governance.decision]}
        </em>
      </div>
      <div className="projection-governance-grid">
        <div>
          <span>Nilai DCF aktif</span>
          <strong>{formatIdr(governance.governedEquityValue)}</strong>
          <small>Current FCFF/WACC tetap menjadi fallback</small>
        </div>
        <div>
          <span>Stress accounting presentation</span>
          <strong>{formatIdr(governance.presentationStressEquityValue)}</strong>
          <small>Stress test, bukan nilai aktif</small>
        </div>
        <div>
          <span>Selisih stress vs current DCF</span>
          <strong>{formatIdr(governance.absoluteVariance)}</strong>
          <small>{formatPercent(governance.relativeVariance)}</small>
        </div>
      </div>
      <div className="projection-governance-checks">
        {governance.items.map((item) => (
          <div className={`projection-governance-check ${item.level}`} key={item.id}>
            {item.level === "ok" ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
            <div>
              <span>{item.label}</span>
              <strong>{formatProjectionGovernanceValue(item)}</strong>
              <small>{item.threshold} · {item.note}</small>
            </div>
          </div>
        ))}
      </div>
      <div className="projection-governance-trace" aria-label="Jejak final report reliance Proyeksi Laba Rugi">
        {governance.traces.map((trace) => (
          <div key={trace.label}>
            <span>{trace.label}</span>
            <strong>{formatFormulaTraceValue(trace)}</strong>
            <small>{trace.note}</small>
          </div>
        ))}
      </div>
    </div>
  );
}

function IncomeProjectionControlsPanel({
  controls,
  forecast,
  scenario,
  snapshot,
  onYearOverrideChange,
  onYearOverrideReasonChange,
  onReviewerDecisionChange,
  onNonOperatingPolicyChange,
  onPresentationAssumptionChange,
  onPresentationAssumptionReasonChange,
  onApplySmartSuggestions,
}: {
  controls: IncomeProjectionControlState;
  forecast: DcfForecastRow[];
  scenario: IncomeProjectionScenarioResult;
  snapshot: FinancialStatementSnapshot;
  onYearOverrideChange?: (year: number, key: IncomeProjectionOverrideField, value: string) => void;
  onYearOverrideReasonChange?: (year: number, reason: string) => void;
  onReviewerDecisionChange?: (patch: Partial<IncomeProjectionReviewerDecisionState>) => void;
  onNonOperatingPolicyChange?: (patch: Partial<IncomeProjectionNonOperatingPolicyState>) => void;
  onPresentationAssumptionChange?: (key: IncomeProjectionPresentationAssumptionKey, value: string) => void;
  onPresentationAssumptionReasonChange?: (reason: string) => void;
  onApplySmartSuggestions?: () => void;
}) {
  return (
    <article className="panel income-projection-controls-panel" data-testid="income-projection-controls">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">System development governance</p>
          <h3>Income projection reviewer controls</h3>
        </div>
        <div className="panel-heading-actions">
          <SmartSuggestionBadge label="Smart suggestion editable" state="available" />
          <button className="button secondary compact-button" onClick={onApplySmartSuggestions} type="button">
            <CheckCircle2 size={14} />
            Terapkan semua smart suggestion
          </button>
          <span className={`status-pill ${scenario.level === "critical" ? "warning" : "muted"}`}>
            {scenario.activeBasis === "reviewer-approved-scenario" ? "Approved scenario" : "Baseline protected"}
          </span>
        </div>
      </div>

      <div className="projection-governance-grid">
        <div>
          <span>Scenario DCF</span>
          <strong>{formatIdr(scenario.dcf.equityValue)}</strong>
          <small>{scenario.hasScenarioInput ? "Reviewer-owned scenario" : "Belum ada override reviewer"}</small>
        </div>
        <div>
          <span>Variance vs baseline</span>
          <strong>{formatIdr(scenario.absoluteVariance)}</strong>
          <small>{formatPercent(scenario.relativeVariance)}</small>
        </div>
        <div>
          <span>Reviewer decision</span>
          <strong>{formatReviewerDecision(controls.reviewerDecision.decision)}</strong>
          <small>{scenario.summary}</small>
        </div>
      </div>

      <div className="table-wrap">
        <table className="analysis-table compact-input-table" data-testid="income-projection-yearly-overrides">
          <thead>
            <tr>
              <th>Yearly override</th>
              {incomeProjectionOverrideFields.map((field) => (
                <th key={field.key}>{field.label}</th>
              ))}
              <th>Reason</th>
            </tr>
          </thead>
          <tbody>
            {forecast.map((row, index) => {
              const yearKey = String(row.year);
              const entry = controls.yearlyOverrides[yearKey] ?? createEmptyIncomeProjectionYearOverride();

              return (
                <tr key={row.year}>
                  <td>
                    <strong>{row.year}</strong>
                    <span>{formatIncomeProjectionYearDefaultSummary(row, index, forecast, snapshot)}</span>
                  </td>
                  {incomeProjectionOverrideFields.map((field) => (
                    <td key={field.key}>
                      <input
                        aria-label={`${field.label} override ${row.year}`}
                        inputMode="decimal"
                        onChange={(event) => onYearOverrideChange?.(row.year, field.key, event.target.value)}
                        placeholder={formatRateInputNumber(readIncomeProjectionDefaultRate(field.key, row, index, forecast, snapshot))}
                        type="text"
                        value={entry[field.key]}
                      />
                    </td>
                  ))}
                  <td>
                    <input
                      aria-label={`Reason override ${row.year}`}
                      onChange={(event) => onYearOverrideReasonChange?.(row.year, event.target.value)}
                      placeholder="Basis reviewer"
                      type="text"
                      value={entry.reason}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <section className="section-grid income-projection-control-grid">
        <div className="input-panel">
          <div className="panel-heading compact">
            <div>
              <p className="eyebrow">Recurring policy</p>
              <h4>Recurring vs non-recurring non-operating income</h4>
            </div>
          </div>
          <label>
            <span>Policy</span>
            <select
              onChange={(event) =>
                onNonOperatingPolicyChange?.({ policy: event.target.value as NonOperatingIncomeProjectionPolicy })
              }
              value={controls.nonOperatingPolicy.policy}
            >
              {nonOperatingPolicyOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <p>{nonOperatingPolicyOptions.find((option) => option.value === controls.nonOperatingPolicy.policy)?.description}</p>
          <label>
            <span>Reason</span>
            <textarea
              onChange={(event) => onNonOperatingPolicyChange?.({ reason: event.target.value })}
              rows={3}
              value={controls.nonOperatingPolicy.reason}
            />
          </label>
        </div>

        <div className="input-panel">
          <div className="panel-heading compact">
            <div>
              <p className="eyebrow">Debt/cash/yield</p>
              <h4>Reviewer-owned presentation assumptions</h4>
            </div>
          </div>
          {incomeProjectionPresentationAssumptionFields.map((field) => (
            <label key={field.key}>
              <span>{field.label}</span>
              <input
                inputMode="decimal"
                onChange={(event) => onPresentationAssumptionChange?.(field.key, event.target.value)}
                placeholder={formatRateInputNumber(readIncomeProjectionPresentationDefault(field.key, snapshot))}
                type="text"
                value={controls.presentationAssumptions[field.key]}
              />
            </label>
          ))}
          <label>
            <span>Reason</span>
            <textarea
              onChange={(event) => onPresentationAssumptionReasonChange?.(event.target.value)}
              rows={3}
              value={controls.presentationAssumptions.reason}
            />
          </label>
        </div>

        <div className="input-panel">
          <div className="panel-heading compact">
            <div>
              <p className="eyebrow">Reviewer approval/rejection</p>
              <h4>Income projection reliance decision</h4>
            </div>
          </div>
          <label>
            <span>Decision</span>
            <select
              onChange={(event) =>
                onReviewerDecisionChange?.({ decision: event.target.value as IncomeProjectionReviewerDecision })
              }
              value={controls.reviewerDecision.decision}
            >
              {reviewerDecisionOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            <span>Reason</span>
            <textarea
              onChange={(event) => onReviewerDecisionChange?.({ reason: event.target.value })}
              rows={6}
              value={controls.reviewerDecision.reason}
            />
          </label>
        </div>
      </section>

    </article>
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
      label: "Roll-forward Historis",
      description: "Additions dan depresiasi mengikuti tren historis jadwal aset tetap.",
    },
    {
      mode: "dcf-proxy",
      label: "Proksi DCF",
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

function readDisplayedRevenueGrowth(forecast: DcfForecastRow[], snapshot: FinancialStatementSnapshot): number {
  const firstForecast = forecast[0];

  if (!firstForecast) {
    return snapshot.revenueGrowth;
  }

  return growthValue(firstForecast.revenue, snapshot.revenue) ?? snapshot.revenueGrowth;
}

function DcfProjectionPanel({
  config,
  forecast,
  snapshot,
  fixedAssetProjection,
  workingCapitalCandidates,
  onToggleWorkingCapitalInclusion,
}: {
  config: DcfProjectionConfig;
  forecast: DcfForecastRow[];
  snapshot: FinancialStatementSnapshot;
  fixedAssetProjection?: FixedAssetProjectionSummary;
  workingCapitalCandidates?: DcfProjectionWorkingCapitalCandidates;
  onToggleWorkingCapitalInclusion?: (rowKey: CashFlowWorkingCapitalRowKey, accountRowId: string, included: boolean) => void;
}) {
  const context = { forecast, snapshot, fixedAssetProjection };
  const tableStyle = { "--projection-table-min-width": `${612 + forecast.length * 178}px` } as CSSProperties;

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
      <div className="table-wrap dcf-projection-table-wrap" data-testid={`${config.testId}-wrap`}>
        <table className="analysis-table dcf-projection-table" data-testid={config.testId} style={tableStyle}>
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
              const workingCapitalRowKey = getDcfProjectionWorkingCapitalRowKey(line.key);

              return (
                <tr className={line.kind === "subtotal" ? "analysis-total-row" : ""} key={line.key}>
                  <td>
                    <strong>{line.label}</strong>
                    {lineNote ? <span>{lineNote}</span> : null}
                    {workingCapitalRowKey && workingCapitalCandidates && onToggleWorkingCapitalInclusion ? (
                      <DcfProjectionWorkingCapitalDisclosure
                        rowKey={workingCapitalRowKey}
                        candidates={workingCapitalCandidates[workingCapitalRowKey]}
                        onToggle={onToggleWorkingCapitalInclusion}
                      />
                    ) : null}
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

    </article>
  );
}

function getDcfProjectionWorkingCapitalRowKey(lineKey: string): CashFlowWorkingCapitalRowKey | null {
  if (lineKey === "operating-current-assets-change") {
    return "oca-change";
  }

  if (lineKey === "operating-current-liabilities-change") {
    return "ocl-change";
  }

  return null;
}

function DcfProjectionWorkingCapitalDisclosure({
  rowKey,
  candidates,
  onToggle,
}: {
  rowKey: CashFlowWorkingCapitalRowKey;
  candidates: DcfProjectionWorkingCapitalCandidate[];
  onToggle: (rowKey: CashFlowWorkingCapitalRowKey, accountRowId: string, included: boolean) => void;
}) {
  const includedCount = candidates.filter((candidate) => candidate.included).length;
  const rowLabel =
    rowKey === "oca-change"
      ? "(Kenaikan) penurunan aset lancar operasional"
      : "Kenaikan (penurunan) liabilitas lancar operasional";

  return (
    <details className="cash-flow-account-disclosure projection-account-disclosure" data-testid={`projection-account-disclosure-${rowKey}`}>
      <summary>
        <span>Basis akun Proyeksi Neraca</span>
        <strong>{`${includedCount}/${candidates.length} disertakan`}</strong>
      </summary>
      <div className="cash-flow-account-picker projection-account-picker">
        {candidates.map((candidate) => (
          <label data-testid={`projection-account-option-${rowKey}-${candidate.id}`} key={candidate.id}>
            <input
              aria-label={`Sertakan ${candidate.label} dalam ${rowLabel}`}
              checked={candidate.included}
              type="checkbox"
              onChange={(event) => onToggle(rowKey, candidate.id, event.target.checked)}
            />
            <span>
              <strong>{candidate.label}</strong>
              <small>{candidate.categoryLabel}</small>
            </span>
          </label>
        ))}
      </div>
    </details>
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

function buildIncomeProjectionScenario({
  snapshot,
  baselineEquityValue,
  controls,
  activeDcfOptions,
  fixedAssetProjection,
  fixedAssetProjectionSource,
}: {
  snapshot: FinancialStatementSnapshot;
  baselineEquityValue: number;
  controls: IncomeProjectionControlState;
  activeDcfOptions?: DcfOptions;
  fixedAssetProjection?: Record<number, DcfFixedAssetProjectionInput>;
  fixedAssetProjectionSource?: string;
}): IncomeProjectionScenarioResult {
  const controlOptions = buildIncomeProjectionControlDcfOptions(controls);
  const options: DcfOptions = {
    ...activeDcfOptions,
    ...(fixedAssetProjection
      ? {
          fixedAssetProjection,
          fixedAssetProjectionSource,
        }
      : {}),
    ...controlOptions,
  };
  const dcf = calculateDcf(snapshot, options);
  const hasScenarioInput = hasIncomeProjectionControlInput(controls);
  const absoluteVariance = dcf.equityValue - baselineEquityValue;
  const relativeVariance = safeAbsoluteRatio(absoluteVariance, baselineEquityValue);
  const level = relativeVariance > 0.15 ? "critical" : relativeVariance > 0.05 ? "review" : "ok";
  const approvedScenario = hasScenarioInput && controls.reviewerDecision.decision === "approved" && level !== "critical";
  const activeBasis = approvedScenario ? "reviewer-approved-scenario" : "baseline-dcf";
  const summary = !hasScenarioInput
    ? "Baseline DCF dipertahankan; belum ada scenario input reviewer."
    : controls.reviewerDecision.decision === "rejected"
    ? "Reviewer menolak reliance scenario; current DCF tetap fallback."
    : level === "critical"
    ? "Variance scenario melewati batas kritis; current DCF tetap fallback."
    : approvedScenario
    ? "Reviewer approval tersimpan; scenario tersedia sebagai basis reliance reviewer."
    : "Scenario masih pending review; current DCF tetap fallback.";

  return {
    dcf,
    options,
    hasScenarioInput,
    activeEquityValue: approvedScenario ? dcf.equityValue : baselineEquityValue,
    absoluteVariance,
    relativeVariance,
    level,
    activeBasis,
    summary,
  };
}

function buildIncomeProjectionActiveDcfSelection(
  baseSelection: ActiveDcfSelection,
  scenario: IncomeProjectionScenarioResult,
): ActiveDcfSelection {
  if (scenario.activeBasis !== "reviewer-approved-scenario") {
    return baseSelection;
  }

  return {
    ...baseSelection,
    label: "Reviewer-approved income projection scenario",
    shortLabel: "Reviewer scenario",
    summary: scenario.summary,
    dcf: scenario.dcf,
    projectionEngineLabel: "Reviewer-approved income projection overrides",
  };
}

function buildActiveDcfSelection(
  results: CalculationResults,
  basis: ActiveDcfBasis,
  snapshot: FinancialStatementSnapshot,
  options: DcfOptions = {},
): ActiveDcfSelection {
  const option = activeDcfBasisLabels[basis] ?? activeDcfBasisLabels[defaultActiveDcfBasis];
  const dcf = resolveActiveDcf(results, basis);
  const terminalGrowth =
    basis === "terminalDownside"
      ? snapshot.terminalGrowthDownside ?? snapshot.terminalGrowth
      : basis === "terminalUpside"
        ? snapshot.terminalGrowthUpside ?? snapshot.terminalGrowth
        : snapshot.terminalGrowth;
  const includeWorkingCapitalChange = basis !== "noIncrementalWorkingCapital";
  const terminalTreatment = normalizeDcfTerminalTreatment(options.terminalTreatment);
  const projectionEngineLabel =
    basis === "historicalDerivedProjection"
      ? "Projection engine historis-terturunkan"
      : "Projection engine balance-reconciled";

  return {
    basis,
    label: option.label,
    shortLabel: option.shortLabel,
    summary: option.summary,
    dcf,
    terminalGrowth,
    terminalTreatment,
    terminalValueOverride: options.terminalValueOverride,
    residualValue: options.residualValue,
    includeWorkingCapitalChange,
    debtLikeTaxPayable: basis === "taxPayableDebtLike" ? snapshot.taxPayable : 0,
    projectionHorizonYears: normalizeProjectionHorizonYears(options.projectionHorizonYears),
    projectionEngineLabel,
  };
}

function buildActiveEemSelection(
  results: CalculationResults,
  basis: ActiveEemBasis,
  snapshot: FinancialStatementSnapshot,
): ActiveEemSelection {
  const option = activeEemBasisLabels[basis] ?? activeEemBasisLabels[defaultActiveEemBasis];
  const eem = resolveActiveEem(results, basis, snapshot);

  return {
    basis,
    label: option.label,
    shortLabel: option.shortLabel,
    summary: option.summary,
    eem,
    debtLikeTaxPayable: basis === "taxPayableDebtLike" ? snapshot.taxPayable : 0,
  };
}

function buildEemReturnOnTangibleAssetSelection({
  basis,
  requiredReturnOnNta,
  equityCost,
  hasEquityCostOverride,
}: {
  basis: EemReturnOnTangibleAssetBasis;
  requiredReturnOnNta: number;
  equityCost: number | null;
  hasEquityCostOverride: boolean;
}): EemReturnOnTangibleAssetSelection {
  const requestedChoice =
    eemReturnOnTangibleAssetChoiceLabels[basis] ??
    eemReturnOnTangibleAssetChoiceLabels[defaultEemReturnOnTangibleAssetBasis];

  if (requestedChoice.value === "equityCost" && equityCost !== null) {
    return {
      ...requestedChoice,
      rate: equityCost,
      sourceLabel: hasEquityCostOverride ? "Override Return ekuitas aset berwujud" : "Auto WACC/DISCOUNT RATE",
    };
  }

  return {
    ...requestedChoice,
    rate: requiredReturnOnNta,
    sourceLabel: requestedChoice.value === "requiredReturnOnNta"
      ? "Model kapasitas BORROWING CAP"
      : "Fallback ke kalkulator required return on NTA",
  };
}

function buildActiveDcfBasisDcfOptions(basis: ActiveDcfBasis, snapshot: FinancialStatementSnapshot): DcfOptions {
  if (basis === "terminalDownside") {
    return { terminalGrowth: snapshot.terminalGrowthDownside ?? snapshot.terminalGrowth };
  }

  if (basis === "terminalUpside") {
    return { terminalGrowth: snapshot.terminalGrowthUpside ?? snapshot.terminalGrowth };
  }

  if (basis === "noIncrementalWorkingCapital") {
    return { includeWorkingCapitalChange: false };
  }

  if (basis === "taxPayableDebtLike") {
    return { debtLikeTaxPayable: true };
  }

  if (basis === "historicalDerivedProjection") {
    return { projectionEngine: "historical-derived" };
  }

  return {};
}

function resolveActiveEem(results: CalculationResults, basis: ActiveEemBasis, snapshot: FinancialStatementSnapshot): MethodOutput {
  if (basis !== "taxPayableDebtLike") {
    return results.eem;
  }

  const debtLikeOutput = results.sensitivities.eemTaxPayableDebtLike;

  return {
    ...debtLikeOutput,
    traces: [
      ...results.eem.traces,
      {
        id: "eem-active-basis-adjustment",
        label: "Penyesuaian basis aktif EEM",
        formula: eemSensitivityContext.taxPayableDebtLike.formula,
        value: debtLikeOutput.equityValue,
        note: buildEemTaxPayableDebtLikeNote(formatIdr(snapshot.taxPayable)),
        sourceTabs: ["Penilaian EEM", "Simulasi Potensi Pajak"],
        accountCategories: ["TAX_PAYABLE"],
        workbookReference: "Sensitivity layer: EEM base - tax payable",
        treatment: "Active sensitivity adjustment",
        traceLevel: "final",
      },
    ],
  };
}

function resolveActiveDcf(results: CalculationResults, basis: ActiveDcfBasis): DcfOutput {
  if (basis === "terminalDownside") {
    return results.sensitivities.dcfTerminalDownside;
  }

  if (basis === "terminalUpside") {
    return results.sensitivities.dcfTerminalUpside;
  }

  if (basis === "noIncrementalWorkingCapital") {
    return results.sensitivities.dcfNoIncrementalWorkingCapital;
  }

  if (basis === "taxPayableDebtLike") {
    return results.sensitivities.dcfTaxPayableDebtLike;
  }

  if (basis === "historicalDerivedProjection") {
    return results.sensitivities.dcfHistoricalDerivedProjection;
  }

  return results.dcf;
}

function buildIncomeProjectionControlDcfOptions(controls: IncomeProjectionControlState): Pick<
  DcfOptions,
  "incomeProjectionOverrides" | "incomeProjectionPresentation"
> {
  const yearlyOverrides = Object.fromEntries(
    Object.entries(controls.yearlyOverrides).flatMap(([yearKey, entry]) => {
      const year = Number(yearKey);

      if (!Number.isFinite(year)) {
        return [];
      }

      const override: IncomeProjectionYearOverrideInput = {};

      incomeProjectionOverrideFields.forEach((field) => {
        const value = readRateInput(entry[field.key]);

        if (value !== null) {
          override[field.key] = value;
        }
      });

      return Object.keys(override).length ? [[year, override]] : [];
    }),
  ) as Record<number, IncomeProjectionYearOverrideInput>;

  const presentation: IncomeProjectionPresentationAssumptionsInput = {
    nonOperatingPolicy: controls.nonOperatingPolicy.policy,
  };

  incomeProjectionPresentationAssumptionFields.forEach((field) => {
    const value = readRateInput(controls.presentationAssumptions[field.key]);

    if (value !== null) {
      presentation[field.key] = value;
    }
  });

  return {
    incomeProjectionOverrides: Object.keys(yearlyOverrides).length ? yearlyOverrides : undefined,
    incomeProjectionPresentation: hasIncomeProjectionPresentationInput(controls) ? presentation : undefined,
  };
}

function readIncomeProjectionDefaultRate(
  field: IncomeProjectionOverrideField,
  row: DcfForecastRow,
  index: number,
  forecast: DcfForecastRow[],
  snapshot: FinancialStatementSnapshot,
): number {
  if (field === "revenueGrowth") {
    const previousRevenue = index === 0 ? snapshot.revenue : forecast[index - 1]?.revenue ?? 0;
    return previousRevenue ? row.revenue / previousRevenue - 1 : snapshot.revenueGrowth;
  }

  if (field === "grossProfitMargin") {
    return safeRatioForDisplay(row.grossProfit, row.revenue);
  }

  if (field === "operatingExpenseMargin") {
    return safeRatioForDisplay(row.operatingExpenses, row.revenue);
  }

  return safeRatioForDisplay(row.depreciation, row.revenue);
}

function readIncomeProjectionPresentationDefault(
  key: IncomeProjectionPresentationAssumptionKey,
  snapshot: FinancialStatementSnapshot,
): number {
  if (key === "cashYield") {
    return snapshot.interestIncomeCashYield;
  }

  if (key === "debtRate") {
    return snapshot.interestExpenseDebtRate;
  }

  if (key === "interestIncomeRevenueMargin") {
    return snapshot.interestIncomeRevenueMargin;
  }

  return snapshot.interestExpenseRevenueMargin;
}

function formatIncomeProjectionYearDefaultSummary(
  row: DcfForecastRow,
  index: number,
  forecast: DcfForecastRow[],
  snapshot: FinancialStatementSnapshot,
): string {
  const growth = readIncomeProjectionDefaultRate("revenueGrowth", row, index, forecast, snapshot);
  const grossMargin = readIncomeProjectionDefaultRate("grossProfitMargin", row, index, forecast, snapshot);

  return `Base growth ${formatPercent(growth)} · gross margin ${formatPercent(grossMargin)}`;
}

function formatReviewerDecision(value: IncomeProjectionReviewerDecision): string {
  return reviewerDecisionOptions.find((option) => option.value === value)?.label ?? "Pending review";
}

function safeAbsoluteRatio(numerator: number, denominator: number): number {
  const base = Math.abs(denominator);
  return base ? Math.abs(numerator) / base : Math.abs(numerator) > 0 ? Number.POSITIVE_INFINITY : 0;
}

function safeRatioForDisplay(numerator: number, denominator: number): number {
  return denominator ? numerator / denominator : 0;
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

function formatProjectionGovernanceValue(item: ProjectionGovernanceMetric): string {
  if (!Number.isFinite(item.value)) {
    return "Tidak terbatas";
  }

  if (item.valueFormat === "currency") {
    return formatIdr(item.value);
  }

  if (item.valueFormat === "percent") {
    return formatPercent(item.value);
  }

  return formatNumber(item.value);
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

function previousRevenue(index: number, context: DcfProjectionContext): number {
  return index === 0 ? context.snapshot.revenue : context.forecast[index - 1]?.revenue ?? 0;
}

function previousDepreciation(index: number, context: DcfProjectionContext): number {
  return index === 0 ? context.snapshot.depreciation : context.forecast[index - 1]?.depreciation ?? 0;
}

function previousInterestIncome(index: number, context: DcfProjectionContext): number {
  return index === 0 ? context.snapshot.interestIncome : context.forecast[index - 1]?.interestIncome ?? 0;
}

function previousInterestExpense(index: number, context: DcfProjectionContext): number {
  return index === 0 ? context.snapshot.interestExpense : context.forecast[index - 1]?.interestExpense ?? 0;
}

function previousAccountReceivable(index: number, context: DcfProjectionContext): number {
  return index === 0 ? context.snapshot.accountReceivable : context.forecast[index - 1]?.accountReceivable ?? 0;
}

function previousInventory(index: number, context: DcfProjectionContext): number {
  return index === 0 ? context.snapshot.inventory : context.forecast[index - 1]?.inventory ?? 0;
}

function previousForecastValue<K extends keyof DcfForecastRow>(
  index: number,
  context: DcfProjectionContext,
  field: K,
  snapshotValue: number,
): number {
  if (index === 0) {
    return snapshotValue;
  }

  const previous = context.forecast[index - 1]?.[field];

  return typeof previous === "number" ? previous : snapshotValue;
}

function previousOperatingCurrentAssets(index: number, context: DcfProjectionContext): number {
  return context.forecast[index]?.operatingCurrentAssetsBeginning ??
    (index === 0
      ? context.snapshot.accountReceivable + context.snapshot.inventory
      : context.forecast[index - 1]?.operatingCurrentAssets ?? 0);
}

function previousOperatingCurrentLiabilities(index: number, context: DcfProjectionContext): number {
  return context.forecast[index]?.operatingCurrentLiabilitiesBeginning ??
    (index === 0
      ? context.snapshot.accountPayable + context.snapshot.otherPayable
      : context.forecast[index - 1]?.operatingCurrentLiabilities ?? 0);
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
  accountCandidates,
  readiness,
  onNavigate,
  onToggleAccountInclusion,
  onUpdateOverride,
}: {
  analysis: SectionAnalysis;
  accountCandidates: CashFlowWorkingCapitalAccountCandidates;
  readiness: SectionReadiness;
  onNavigate: (tabId: WorkflowTabId) => void;
  onToggleAccountInclusion: (rowKey: CashFlowWorkingCapitalRowKey, accountRowId: string, included: boolean) => void;
  onUpdateOverride: (rowKey: string, periodId: string, patch: Partial<CashFlowOverrideEntry>) => void;
}) {
  return (
    <>
      <ReadinessPanel status={readiness} onNavigate={onNavigate} />

      <section className="panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">Detail statement</p>
            <h3>Calculated · override · final · trace</h3>
          </div>
          <span className="status-pill muted">Audit-ready table</span>
        </div>
        <CashFlowStatementTable
          rows={analysis.cashFlowStatementRows}
          periods={analysis.periods}
          accountCandidates={accountCandidates}
          onToggleAccountInclusion={onToggleAccountInclusion}
          onUpdateOverride={onUpdateOverride}
        />
      </section>
    </>
  );
}

function CashFlowStatementTable({
  rows,
  periods,
  accountCandidates,
  onToggleAccountInclusion,
  onUpdateOverride,
}: {
  rows: CashFlowStatementRow[];
  periods: Period[];
  accountCandidates: CashFlowWorkingCapitalAccountCandidates;
  onToggleAccountInclusion: (rowKey: CashFlowWorkingCapitalRowKey, accountRowId: string, included: boolean) => void;
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
            const workingCapitalRowKey = isCashFlowWorkingCapitalRowKey(row.key) ? row.key : null;
            const rowCells = (
              <tr className={rowClassName} data-testid={`cash-flow-row-${row.key}`} key={row.key}>
                <td>
                  <strong>{row.label}</strong>
                  {row.note ? <span>{row.note}</span> : null}
                  {workingCapitalRowKey ? (
                    <CashFlowAccountInclusionDisclosure
                      rowKey={workingCapitalRowKey}
                      candidates={accountCandidates[workingCapitalRowKey]}
                      onToggle={onToggleAccountInclusion}
                    />
                  ) : null}
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
                    <td className="numeric-cell period-column" data-testid={`cash-flow-${row.key}-${period.id}-calculated`} key={`${row.key}-${period.id}-calculated`}>
                      {formatAnalysisValue(row.calculatedValues[period.id] ?? null, "currency")}
                    </td>,
                    <td className="override-cell period-column" key={`${row.key}-${period.id}-override`}>
                      {row.isOverridable ? (
                        <div className="cash-flow-override-stack">
                          <input
                            aria-label={`Override ${row.label} ${period.label || "Periode"}`}
                            inputMode="numeric"
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
                    <td className="numeric-cell period-column" data-testid={`cash-flow-${row.key}-${period.id}-final`} key={`${row.key}-${period.id}-final`}>
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

function CashFlowAccountInclusionDisclosure({
  rowKey,
  candidates,
  onToggle,
}: {
  rowKey: CashFlowWorkingCapitalRowKey;
  candidates: CashFlowWorkingCapitalAccountCandidate[];
  onToggle: (rowKey: CashFlowWorkingCapitalRowKey, accountRowId: string, included: boolean) => void;
}) {
  const includedCount = candidates.filter((candidate) => candidate.included).length;
  const rowLabel =
    rowKey === "oca-change"
      ? "(Kenaikan) penurunan aset lancar operasional"
      : "Kenaikan (penurunan) liabilitas lancar operasional";

  return (
    <details className="cash-flow-account-disclosure" data-testid={`cash-flow-account-disclosure-${rowKey}`}>
      <summary>
        <span>Basis akun Neraca</span>
        <strong>{`${includedCount}/${candidates.length} disertakan`}</strong>
      </summary>
      <div className="cash-flow-account-picker">
        {candidates.length > 0 ? (
          candidates.map((candidate) => (
            <label data-testid={`cash-flow-account-option-${rowKey}-${candidate.rowId}`} key={candidate.rowId}>
              <input
                aria-label={`Sertakan ${candidate.accountName} dalam ${rowLabel}`}
                checked={candidate.included}
                type="checkbox"
                onChange={(event) => onToggle(rowKey, candidate.rowId, event.target.checked)}
              />
              <span>
                <strong>{candidate.accountName}</strong>
                <small>{candidate.categoryLabel}</small>
              </span>
            </label>
          ))
        ) : (
          <p>Tidak ada akun kandidat di Neraca.</p>
        )}
      </div>
    </details>
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

function DebtScheduleSection({
  analysis,
  debtScheduleInputs,
  onUpdateDebtScheduleInput,
}: {
  analysis: SectionAnalysis;
  debtScheduleInputs: DebtScheduleInputState;
  onUpdateDebtScheduleInput: (periodId: string, key: DebtScheduleInputKey, value: string) => void;
}) {
  return (
    <section className="panel debt-schedule-panel" data-testid="debt-schedule-section">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Utang dan pinjaman</p>
          <h3>Jadwal mutasi pinjaman dan utang</h3>
        </div>
        <span className="status-pill muted">Input pengguna + otomatis + Neraca</span>
      </div>
      <div className="debt-schedule-note">
        <span className="source-status-pill manual">Input pengguna</span>
        <span className="source-status-pill formula">Dihitung otomatis</span>
        <span className="source-status-pill interoperable">Terhubung Neraca</span>
      </div>
      <DebtScheduleTable
        rows={analysis.payablesRows}
        periods={analysis.periods}
        debtScheduleInputs={debtScheduleInputs}
        onUpdateDebtScheduleInput={onUpdateDebtScheduleInput}
      />
    </section>
  );
}

function DebtScheduleTable({
  rows,
  periods,
  debtScheduleInputs,
  onUpdateDebtScheduleInput,
}: {
  rows: AnalysisRow[];
  periods: Period[];
  debtScheduleInputs: DebtScheduleInputState;
  onUpdateDebtScheduleInput: (periodId: string, key: DebtScheduleInputKey, value: string) => void;
}) {
  return (
    <div className="table-wrap">
      <table className="analysis-table debt-schedule-table">
        <thead>
          <tr>
            <th>Pos</th>
            <th>Sumber</th>
            <th>Aturan</th>
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
            const ruleDetail = getDebtScheduleDetailLabel(row);

            return (
              <tr className={rowClassName} key={row.key}>
                <td>
                  {row.label}
                  {row.note ? <span className="debt-row-note">{row.note}</span> : null}
                </td>
                <td>
                  {row.sourceType ? <DebtScheduleSourcePill sourceType={row.sourceType} /> : null}
                  <span>{getDebtScheduleSourceLabel(row)}</span>
                </td>
                <td>
                  <strong className="debt-schedule-rule">{getDebtScheduleRuleLabel(row)}</strong>
                  {ruleDetail ? <span className="debt-schedule-detail">{ruleDetail}</span> : null}
                </td>
                {periods.map((period) => {
                  const isEditable =
                    Boolean(row.editableInputKey) &&
                    (!row.editablePeriodIds || row.editablePeriodIds.includes(period.id));
                  const inputValue = row.editableInputKey ? (debtScheduleInputs[period.id]?.[row.editableInputKey] ?? "") : "";
                  const value = row.values[period.id] ?? null;

                  return (
                    <td className={isEditable ? "override-cell period-column" : "numeric-cell period-column"} key={period.id}>
                      {isEditable && row.editableInputKey ? (
                        <div className="debt-schedule-input-stack">
                          <input
                            aria-label={`${row.label} ${period.label || "Periode"}`}
                            inputMode="decimal"
                            value={inputValue}
                            onChange={(event) => onUpdateDebtScheduleInput(period.id, row.editableInputKey as DebtScheduleInputKey, event.target.value)}
                          />
                          {!inputValue.trim() && value ? <span>Model: {formatDebtScheduleValue(value, row.valueFormat)}</span> : null}
                        </div>
                      ) : (
                        formatDebtScheduleValue(value, row.valueFormat)
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function DebtScheduleSourcePill({ sourceType }: { sourceType: NonNullable<AnalysisRow["sourceType"]> }) {
  return <span className={`source-status-pill ${sourceType}`}>{getDebtScheduleSourcePillLabel(sourceType)}</span>;
}

function formatDebtScheduleValue(value: AnalysisValue, valueFormat: AnalysisRow["valueFormat"] = "currency"): string {
  if (value === null || !Number.isFinite(value)) {
    return "—";
  }

  return valueFormat === "percent" ? formatPercent(value) : formatAnalysisValue(value, "currency");
}

function NoplatFcfSection({
  analysis,
  onUpdateOverride,
}: {
  analysis: SectionAnalysis;
  onUpdateOverride: (rowKey: string, periodId: string, patch: Partial<CashFlowOverrideEntry>) => void;
}) {
  return (
    <>
      <section className="panel" data-testid="noplat-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">NOPLAT</p>
            <h3>Normalized Operating Profit After Tax (NOPLAT)</h3>
          </div>
          <span className="status-pill muted">Read only Laba Rugi</span>
        </div>
        <AnalysisTable rows={analysis.noplatRows} periods={analysis.periods} />
      </section>

      <section className="panel" data-testid="fcf-panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">FCF</p>
            <h3>Free Cash Flow to Firm (FCFF)</h3>
          </div>
          <span className="status-pill muted">Interoperable + editable CFS rows</span>
        </div>
        <FcfTable
          rows={analysis.fcfRows}
          periods={analysis.periods}
          cashFlowStatementRows={analysis.cashFlowStatementRows}
          onUpdateOverride={onUpdateOverride}
        />
      </section>
    </>
  );
}

function FcfTable({
  rows,
  periods,
  cashFlowStatementRows,
  onUpdateOverride,
}: {
  rows: AnalysisRow[];
  periods: Period[];
  cashFlowStatementRows: CashFlowStatementRow[];
  onUpdateOverride: (rowKey: string, periodId: string, patch: Partial<CashFlowOverrideEntry>) => void;
}) {
  const cashFlowRowsByKey = new Map(cashFlowStatementRows.map((row) => [row.key, row]));

  return (
    <div className="table-wrap">
      <table className="analysis-table fcf-analysis-table">
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
            const cashFlowRow = cashFlowRowsByKey.get(row.key);
            const isEditable = Boolean(cashFlowRow?.isOverridable && (row.key === "oca-change" || row.key === "ocl-change"));

            return (
              <tr className={rowClassName} key={row.key}>
                <td>
                  <strong>{row.label}</strong>
                  {row.note ? <span>{row.note}</span> : null}
                </td>
                <td>
                  {row.sourceType ? <AnalysisSourcePill sourceType={row.sourceType} /> : null}
                  <span>{row.source}</span>
                  {row.lockReason ? <small className="debt-schedule-detail">{row.lockReason}</small> : null}
                </td>
                <td>{row.formula}</td>
                {periods.map((period) => {
                  const value = row.values[period.id] ?? null;
                  const inputValue = cashFlowRow?.overrideInputs[period.id] ?? "";
                  const calculatedValue = cashFlowRow?.calculatedValues[period.id] ?? null;

                  return (
                    <td className={isEditable ? "override-cell period-column" : "numeric-cell period-column"} key={period.id}>
                      {isEditable ? (
                        <div className="fcf-override-stack">
                          <input
                            aria-label={`Override ${row.label} ${period.label || "Periode"} dari NOPLAT & FCF`}
                            inputMode="numeric"
                            placeholder="Nilai override"
                            value={inputValue}
                            onChange={(event) => onUpdateOverride(row.key, period.id, { value: event.target.value })}
                          />
                          <span>Final: {formatAnalysisValue(value, "currency")}</span>
                          <small>Model: {formatAnalysisValue(calculatedValue, "currency")}</small>
                        </div>
                      ) : (
                        formatAnalysisValue(value, "currency")
                      )}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function AnalysisSourcePill({ sourceType }: { sourceType: NonNullable<AnalysisRow["sourceType"]> }) {
  const label =
    sourceType === "manual"
      ? "Editable"
      : sourceType === "formula"
        ? "Otomatis"
        : sourceType === "interoperable"
          ? "Terhubung"
          : "Fallback";

  return <span className={`source-status-pill ${sourceType}`}>{label}</span>;
}

function FinancialRatioSection({
  analysis,
  readiness,
  onNavigate,
}: {
  analysis: SectionAnalysis;
  readiness: SectionReadiness;
  onNavigate: (tabId: WorkflowTabId) => void;
}) {
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
    </>
  );
}

function RoicSection({
  analysis,
  readiness,
  onNavigate,
}: {
  analysis: SectionAnalysis;
  readiness: SectionReadiness;
  onNavigate: (tabId: WorkflowTabId) => void;
}) {
  return (
    <>
      <ReadinessPanel status={readiness} onNavigate={onNavigate} />

      <section className="roic-section-stack">
        <article className="panel roic-table-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">ROIC</p>
              <h3>Bridge efisiensi modal</h3>
            </div>
            <span className="status-pill muted">Basis NOPLAT terkoreksi</span>
          </div>
          <AnalysisTable rows={analysis.roicRows} periods={analysis.periods} percentRowKeys={new Set(["roic"])} />
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
            <th className="numeric-cell period-column">Rata-rata</th>
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

function readPersistedWorkspaceSnapshot(): WorkspaceStorageSnapshot {
  const manifest = readWorkspaceManifest();

  if (manifest) {
    const activeWorkspaceId = manifest.workspaces.some((workspace) => workspace.id === manifest.activeWorkspaceId)
      ? manifest.activeWorkspaceId
      : manifest.workspaces[0].id;
    const activeState =
      readWorkspaceState(activeWorkspaceId) ??
      readLegacyPersistedWorkbenchState() ??
      buildPersistedWorkbenchState(buildEmptyCoreState(), new Date().toISOString());
    const normalizedManifest = {
      ...manifest,
      activeWorkspaceId,
    };

    persistWorkspaceManifest(normalizedManifest);
    persistWorkspaceState(activeWorkspaceId, activeState);
    persistLegacyWorkbenchMirror(activeState);

    return {
      manifest: normalizedManifest,
      activeState,
    };
  }

  const legacyState = readLegacyPersistedWorkbenchState();
  const createdAt = legacyState?.savedAt || new Date().toISOString();
  const workspaceId = createWorkspaceId();
  const activeState = legacyState ?? buildPersistedWorkbenchState(buildEmptyCoreState(), createdAt);
  const workspace: WorkspaceMetadata = {
    id: workspaceId,
    name: buildWorkspaceNameFromState(activeState, DEFAULT_WORKSPACE_NAME),
    createdAt,
    updatedAt: createdAt,
  };
  const migratedManifest: WorkspaceManifest = {
    version: WORKSPACE_STORAGE_VERSION,
    activeWorkspaceId: workspaceId,
    workspaces: [workspace],
  };

  persistWorkspaceManifest(migratedManifest);
  persistWorkspaceState(workspaceId, activeState);
  persistLegacyWorkbenchMirror(activeState);

  return {
    manifest: migratedManifest,
    activeState,
  };
}

function readLegacyPersistedWorkbenchState(): PersistedWorkbenchState | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(WORKBENCH_STORAGE_KEY);

    if (!raw) {
      return null;
    }

    const parsed: unknown = JSON.parse(raw);

    return normalizeWorkbenchStatePayload(parsed);
  } catch {
    return null;
  }
}

function readWorkspaceManifest(): WorkspaceManifest | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(WORKSPACE_MANIFEST_STORAGE_KEY);

    if (!raw) {
      return null;
    }

    const parsed: unknown = JSON.parse(raw);

    if (!isRecord(parsed) || parsed.version !== WORKSPACE_STORAGE_VERSION || !Array.isArray(parsed.workspaces)) {
      return null;
    }

    const workspaces = parsed.workspaces.flatMap((workspace): WorkspaceMetadata[] => {
      if (!isRecord(workspace) || typeof workspace.id !== "string" || typeof workspace.name !== "string") {
        return [];
      }

      const name = workspace.name.trim();

      if (!workspace.id || !name) {
        return [];
      }

      return [
        {
          id: workspace.id,
          name,
          createdAt: typeof workspace.createdAt === "string" ? workspace.createdAt : "",
          updatedAt: typeof workspace.updatedAt === "string" ? workspace.updatedAt : "",
        },
      ];
    });
    const uniqueWorkspaces = dedupeWorkspaces(workspaces);

    if (uniqueWorkspaces.length === 0) {
      return null;
    }

    const activeWorkspaceId =
      typeof parsed.activeWorkspaceId === "string" && uniqueWorkspaces.some((workspace) => workspace.id === parsed.activeWorkspaceId)
        ? parsed.activeWorkspaceId
        : uniqueWorkspaces[0].id;

    return {
      version: WORKSPACE_STORAGE_VERSION,
      activeWorkspaceId,
      workspaces: uniqueWorkspaces,
    };
  } catch {
    return null;
  }
}

function readWorkspaceState(workspaceId: string): PersistedWorkbenchState | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(getWorkspaceDataStorageKey(workspaceId));

    if (!raw) {
      return null;
    }

    const parsed: unknown = JSON.parse(raw);

    return normalizeWorkbenchStatePayload(parsed);
  } catch {
    return null;
  }
}

function normalizeWorkbenchStatePayload(value: unknown): PersistedWorkbenchState | null {
  if (!isRecord(value) || typeof value.version !== "number" || value.version < 1 || value.version > WORKBENCH_STORAGE_VERSION) {
    return null;
  }

  const periods = normalizePeriods(sanitizePeriods(value.periods));
  const rows = value.version < 2 ? migrateLegacyIncomeStatementSigns(sanitizeRows(value.rows)) : sanitizeRows(value.rows);
  const fixedAssetScheduleRows = ensureFixedAssetSchedulePeriods(sanitizeFixedAssetScheduleRows(value.fixedAssetScheduleRows), periods);
  const debtScheduleInputs = ensureDebtScheduleInputPeriods(sanitizeDebtScheduleInputs(value.debtScheduleInputs), periods);
  const aamAdjustments = sanitizeAamAdjustments(value.aamAdjustments);
  const assumptions = sanitizeAssumptions(value.assumptions);
  const caseProfile = sanitizeCaseProfile(value.caseProfile);
  const dlom = migrateWorkbookUpdateDlomBasisIfNeeded({
    version: value.version,
    dlom: sanitizeDlomState(value.dlom),
    caseProfile,
    rows,
  });
  const dlocPfc = sanitizeDlocPfcState(value.dlocPfc);
  const taxSimulation = sanitizeTaxSimulationState(value.taxSimulation);
  const cashFlowOverrides = sanitizeCashFlowOverrides(value.cashFlowOverrides);
  const cashFlowAccountInclusions = sanitizeCashFlowAccountInclusions(value.cashFlowAccountInclusions);
  const incomeProjectionControls = sanitizeIncomeProjectionControls(value.incomeProjectionControls);
  const activePeriodId = typeof value.activePeriodId === "string" ? value.activePeriodId : "";
  const fixedAssetProjectionMode = sanitizeFixedAssetProjectionMode(value.fixedAssetProjectionMode);
  const activeWaccBasis =
    value.activeWaccBasis === undefined
      ? inferInitialWaccBasis(assumptions)
      : sanitizeWaccBasis(value.activeWaccBasis);
  const eemReturnOnTangibleAssetBasis = sanitizeEemReturnOnTangibleAssetBasis(value.eemReturnOnTangibleAssetBasis);
  const activeEemBasis = sanitizeActiveEemBasis(value.activeEemBasis);
  const activeDcfBasis = sanitizeActiveDcfBasis(value.activeDcfBasis);
  const projectionPlanning = sanitizeProjectionPlanning(value.projectionPlanning);
  const isFixedAssetScheduleEnabled =
    typeof value.isFixedAssetScheduleEnabled === "boolean" ? value.isFixedAssetScheduleEnabled : fixedAssetScheduleRows.length > 0;

  return {
    version: WORKBENCH_STORAGE_VERSION,
    savedAt: typeof value.savedAt === "string" ? value.savedAt : "",
    periods,
    activePeriodId,
    rows,
    isFixedAssetScheduleEnabled,
    fixedAssetScheduleRows,
    debtScheduleInputs,
    fixedAssetProjectionMode,
    activeWaccBasis,
    eemReturnOnTangibleAssetBasis,
    activeEemBasis,
    activeDcfBasis,
    projectionPlanning,
    aamAdjustments,
    assumptions,
    caseProfile,
    dlom,
    dlocPfc,
    taxSimulation,
    cashFlowOverrides,
    cashFlowAccountInclusions,
    incomeProjectionControls,
  };
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

function buildEmptyCoreState(): WorkbenchCoreState {
  return {
    periods: initialPeriods.map((period) => ({ ...period })),
    activePeriodId: initialPeriods[0].id,
    rows: [],
    isFixedAssetScheduleEnabled: false,
    fixedAssetScheduleRows: [],
    debtScheduleInputs: createEmptyDebtScheduleInputs(initialPeriods),
    fixedAssetProjectionMode: defaultFixedAssetProjectionMode,
    activeWaccBasis: defaultActiveWaccBasis,
    eemReturnOnTangibleAssetBasis: defaultEemReturnOnTangibleAssetBasis,
    activeEemBasis: defaultActiveEemBasis,
    activeDcfBasis: defaultActiveDcfBasis,
    projectionPlanning: { ...defaultProjectionPlanning },
    aamAdjustments: {},
    assumptions: { ...emptyAssumptions },
    caseProfile: { ...emptyCaseProfile },
    dlom: createEmptyDlomState(),
    dlocPfc: createEmptyDlocPfcState(),
    taxSimulation: createEmptyTaxSimulationState(),
    cashFlowOverrides: {},
    cashFlowAccountInclusions: {},
    incomeProjectionControls: createEmptyIncomeProjectionControls(),
  };
}

function buildPersistedWorkbenchState(coreState: WorkbenchCoreState, savedAt: string): PersistedWorkbenchState {
  return {
    version: WORKBENCH_STORAGE_VERSION,
    savedAt,
    ...cloneCoreState(coreState),
  };
}

function persistWorkspaceManifest(manifest: WorkspaceManifest) {
  safeSetLocalStorage(WORKSPACE_MANIFEST_STORAGE_KEY, JSON.stringify(manifest));
}

function persistWorkspaceState(workspaceId: string, state: PersistedWorkbenchState) {
  safeSetLocalStorage(getWorkspaceDataStorageKey(workspaceId), JSON.stringify(state));
}

function persistLegacyWorkbenchMirror(state: PersistedWorkbenchState) {
  safeSetLocalStorage(WORKBENCH_STORAGE_KEY, JSON.stringify(state));
}

function removeWorkspaceState(workspaceId: string) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.removeItem(getWorkspaceDataStorageKey(workspaceId));
  } catch {
    // Storage can be unavailable in private or restricted browser contexts.
  }
}

function getWorkspaceDataStorageKey(workspaceId: string): string {
  return `${WORKSPACE_DATA_STORAGE_PREFIX}${workspaceId}${WORKSPACE_DATA_STORAGE_SUFFIX}`;
}

function markWorkspaceSaved(workspaces: WorkspaceMetadata[], workspaceId: string, savedAt: string): WorkspaceMetadata[] {
  return workspaces.map((workspace) =>
    workspace.id === workspaceId
      ? {
          ...workspace,
          updatedAt: savedAt,
        }
      : workspace,
  );
}

function createWorkspaceId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `workspace-${crypto.randomUUID()}`;
  }

  return `workspace-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function buildWorkspaceNameFromState(state: PersistedWorkbenchState, fallback: string): string {
  const objectName = state.caseProfile.objectTaxpayerName.trim();
  const subjectName = state.caseProfile.subjectTaxpayerName.trim();

  return objectName || subjectName || fallback;
}

function buildImportedWorkspaceName(summary: ValuationJsonImportSummary): string {
  if (summary.caseName && summary.caseName !== "Tanpa nama objek") {
    return summary.caseName;
  }

  const fileName = summary.fileName
    .replace(/\.json$/i, "")
    .replace(/[-_]+/g, " ")
    .trim();

  return fileName || "Workspace Import";
}

function buildUniqueWorkspaceName(baseName: string, existingWorkspaces: WorkspaceMetadata[]): string {
  const normalizedBaseName = baseName.trim() || DEFAULT_WORKSPACE_NAME;
  const existingNames = new Set(existingWorkspaces.map((workspace) => workspace.name.trim().toLowerCase()));

  if (!existingNames.has(normalizedBaseName.toLowerCase())) {
    return normalizedBaseName;
  }

  for (let index = 2; index < 1000; index += 1) {
    const candidate = `${normalizedBaseName} ${index}`;

    if (!existingNames.has(candidate.toLowerCase())) {
      return candidate;
    }
  }

  return `${normalizedBaseName} ${Date.now().toString(36)}`;
}

function dedupeWorkspaces(workspaces: WorkspaceMetadata[]): WorkspaceMetadata[] {
  const seen = new Set<string>();
  const uniqueWorkspaces: WorkspaceMetadata[] = [];

  for (const workspace of workspaces) {
    if (seen.has(workspace.id)) {
      continue;
    }

    seen.add(workspace.id);
    uniqueWorkspaces.push(workspace);
  }

  return uniqueWorkspaces;
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

function buildRestoredCoreState(state: PersistedWorkbenchState): WorkbenchCoreState {
  const nextPeriods = normalizePeriods(state.periods.length > 0 ? state.periods : initialPeriods);
  const defaultActivePeriod = getDefaultActivePeriod(nextPeriods);
  const activePeriodId = nextPeriods.some((period) => period.id === state.activePeriodId)
    ? state.activePeriodId
    : (defaultActivePeriod?.id ?? nextPeriods[0].id);

  return {
    periods: nextPeriods,
    activePeriodId,
    rows: state.rows,
    isFixedAssetScheduleEnabled: state.isFixedAssetScheduleEnabled || state.fixedAssetScheduleRows.length > 0,
    fixedAssetScheduleRows: state.fixedAssetScheduleRows,
    debtScheduleInputs: ensureDebtScheduleInputPeriods(state.debtScheduleInputs, nextPeriods),
    fixedAssetProjectionMode: state.fixedAssetProjectionMode,
    activeWaccBasis: state.activeWaccBasis,
    eemReturnOnTangibleAssetBasis: state.eemReturnOnTangibleAssetBasis,
    activeEemBasis: state.activeEemBasis,
    activeDcfBasis: state.activeDcfBasis,
    projectionPlanning: state.projectionPlanning,
    aamAdjustments: state.aamAdjustments,
    assumptions: state.assumptions,
    caseProfile: state.caseProfile,
    dlom: state.dlom,
    dlocPfc: state.dlocPfc,
    taxSimulation: state.taxSimulation,
    cashFlowOverrides: state.cashFlowOverrides,
    cashFlowAccountInclusions: state.cashFlowAccountInclusions,
    incomeProjectionControls: state.incomeProjectionControls,
  };
}

function buildValuationJsonExportPayload(coreState: WorkbenchCoreState, exportedAt = new Date()): ValuationJsonExportPayload {
  const exportedAtIso = exportedAt.toISOString();

  return {
    schema: JSON_EXPORT_SCHEMA_ID,
    schemaVersion: JSON_EXPORT_SCHEMA_VERSION,
    appStorageVersion: WORKBENCH_STORAGE_VERSION,
    exportedAt: exportedAtIso,
    appName: "Penilaian Bisnis II",
    data: {
      version: WORKBENCH_STORAGE_VERSION,
      savedAt: exportedAtIso,
      ...cloneCoreState(coreState),
    },
  };
}

function downloadValuationJsonExport(coreState: WorkbenchCoreState) {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return;
  }

  const payload = buildValuationJsonExportPayload(coreState);
  const blob = new Blob([`${JSON.stringify(payload, null, 2)}\n`], { type: "application/json;charset=utf-8" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = buildJsonExportFilename(payload.data.caseProfile.objectTaxpayerName, payload.exportedAt);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

function parseValuationJsonImport(raw: string, fileName: string): ValuationJsonImportCandidate {
  let parsed: unknown;

  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("File JSON tidak valid atau rusak.");
  }

  const source = readValuationJsonImportSource(parsed);
  const sourceVersion = readImportedWorkbenchVersion(source.data);

  if (sourceVersion > WORKBENCH_STORAGE_VERSION) {
    throw new Error("File JSON dibuat dari versi aplikasi yang lebih baru dan belum bisa diimpor di versi ini.");
  }

  const state = normalizeWorkbenchStatePayload(source.data);

  if (!state) {
    throw new Error("Struktur JSON tidak sesuai dengan format workbench Penilaian Bisnis II.");
  }

  return {
    state,
    summary: buildJsonImportSummary(state, source.exportedAt, fileName),
  };
}

function readValuationJsonImportSource(value: unknown): { data: unknown; exportedAt: string } {
  if (!isRecord(value)) {
    throw new Error("File JSON tidak berisi payload workbench yang valid.");
  }

  if (value.schema === JSON_EXPORT_SCHEMA_ID) {
    if (value.schemaVersion !== JSON_EXPORT_SCHEMA_VERSION || !("data" in value)) {
      throw new Error("Schema JSON tidak didukung oleh versi aplikasi ini.");
    }

    return {
      data: value.data,
      exportedAt: typeof value.exportedAt === "string" ? value.exportedAt : "",
    };
  }

  if (typeof value.version === "number") {
    return {
      data: value,
      exportedAt: typeof value.savedAt === "string" ? value.savedAt : "",
    };
  }

  throw new Error("File JSON bukan export workbench Penilaian Bisnis II.");
}

function readImportedWorkbenchVersion(value: unknown): number {
  return isRecord(value) && typeof value.version === "number" ? value.version : Number.NaN;
}

function buildJsonImportSummary(state: PersistedWorkbenchState, exportedAt: string, fileName: string): ValuationJsonImportSummary {
  const caseName = state.caseProfile.objectTaxpayerName.trim() || "Tanpa nama objek";
  const debtScheduleInputCount = Object.values(state.debtScheduleInputs).reduce(
    (total, periodInput) => total + Object.values(periodInput).filter((value) => typeof value === "string" && value.trim() !== "").length,
    0,
  );
  const cashFlowOverrideCount = Object.values(state.cashFlowOverrides).reduce(
    (total, periodEntries) => total + Object.keys(periodEntries).length,
    0,
  );

  return {
    fileName,
    caseName,
    exportedAt,
    periodCount: state.periods.length,
    accountRowCount: state.rows.length,
    fixedAssetClassCount: state.fixedAssetScheduleRows.length,
    debtScheduleInputCount,
    cashFlowOverrideCount,
    incomeProjectionAuditCount: state.incomeProjectionControls.auditEvents.length,
    hasSensitiveData: Boolean(state.caseProfile.objectTaxpayerNpwp.trim() || state.caseProfile.subjectTaxpayerNpwp.trim()),
  };
}

function formatJsonImportConfirmationDescription(summary: ValuationJsonImportSummary): string {
  const exportedAt = summary.exportedAt ? ` Export dibuat ${formatDisplayDate(summary.exportedAt.slice(0, 10)) || summary.exportedAt}.` : "";
  const sensitiveDataNote = summary.hasSensitiveData
    ? " File ini memuat data lengkap termasuk NPWP bila tersedia."
    : " File ini tetap memuat seluruh data angka dan asumsi model.";

  return `File ${summary.fileName} berisi ${summary.accountRowCount} akun, ${summary.periodCount} periode, ${summary.fixedAssetClassCount} kelas aset tetap, ${summary.debtScheduleInputCount} input jadwal utang, ${summary.cashFlowOverrideCount} override cash-flow, dan ${summary.incomeProjectionAuditCount} audit proyeksi untuk ${summary.caseName}.${exportedAt} Workspace baru akan dibuat dan workspace aktif saat ini tetap tersimpan.${sensitiveDataNote}`;
}

function buildJsonExportFilename(caseName: string, exportedAt: string): string {
  const datePart = exportedAt.slice(0, 10) || "export";
  const normalizedCaseName = caseName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);

  return `penilaian-bisnis-${normalizedCaseName || "workbench"}-${datePart}.json`;
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
        values: Object.fromEntries(
          Object.entries(sanitizeStringRecord(row.values)).map(([periodId, value]) => [periodId, formatEditableInteger(value)]),
        ),
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

function sanitizeWaccBasis(value: unknown): WaccBasis {
  return typeof value === "string" && value in activeWaccBasisLabels
    ? (value as WaccBasis)
    : defaultActiveWaccBasis;
}

function inferInitialWaccBasis(assumptions: AssumptionState): WaccBasis {
  return assumptions.wacc.trim() ? "manual" : defaultActiveWaccBasis;
}

function sanitizeActiveEemBasis(value: unknown): ActiveEemBasis {
  return typeof value === "string" && value in activeEemBasisLabels
    ? (value as ActiveEemBasis)
    : defaultActiveEemBasis;
}

function sanitizeEemReturnOnTangibleAssetBasis(value: unknown): EemReturnOnTangibleAssetBasis {
  return typeof value === "string" && value in eemReturnOnTangibleAssetChoiceLabels
    ? (value as EemReturnOnTangibleAssetBasis)
    : defaultEemReturnOnTangibleAssetBasis;
}

function sanitizeActiveDcfBasis(value: unknown): ActiveDcfBasis {
  return typeof value === "string" && value in activeDcfBasisLabels
    ? (value as ActiveDcfBasis)
    : defaultActiveDcfBasis;
}

function sanitizeProjectionPlanning(value: unknown): ProjectionPlanningState {
  if (!isRecord(value)) {
    return { ...defaultProjectionPlanning };
  }

  const entityLife = value.entityLife === "finite-life" ? "finite-life" : "going-concern";
  const requestedTerminalTreatment = normalizeDcfTerminalTreatment(value.terminalTreatment);
  const terminalTreatment =
    entityLife === "finite-life" && requestedTerminalTreatment === "going-concern-terminal-value"
      ? "no-terminal-value"
      : entityLife === "going-concern"
        ? "going-concern-terminal-value"
        : requestedTerminalTreatment;

  return {
    horizonYears: String(normalizeProjectionHorizonYears(value.horizonYears)),
    entityLife,
    terminalTreatment,
    terminalValue: typeof value.terminalValue === "string" ? formatEditableNumber(value.terminalValue) : "",
    terminalTreatmentReason: typeof value.terminalTreatmentReason === "string" ? value.terminalTreatmentReason : "",
  };
}

function normalizeProjectionPlanningPatch(
  current: ProjectionPlanningState,
  patch: Partial<ProjectionPlanningState>,
): ProjectionPlanningState {
  const next: ProjectionPlanningState = {
    ...current,
    ...patch,
  };
  const entityLife = next.entityLife === "finite-life" ? "finite-life" : "going-concern";
  const terminalTreatment =
    entityLife === "going-concern"
      ? "going-concern-terminal-value"
      : patch.entityLife === "finite-life" && current.terminalTreatment === "going-concern-terminal-value"
        ? "no-terminal-value"
        : normalizeDcfTerminalTreatment(next.terminalTreatment);

  return {
    horizonYears: String(normalizeProjectionHorizonYears(next.horizonYears)),
    entityLife,
    terminalTreatment,
    terminalValue: formatEditableNumber(next.terminalValue),
    terminalTreatmentReason: next.terminalTreatmentReason,
  };
}

function buildProjectionPlanningDcfOptions(planning: ProjectionPlanningState): DcfOptions {
  const horizonYears = normalizeProjectionHorizonYears(planning.horizonYears);
  const terminalTreatment = normalizeDcfTerminalTreatment(planning.terminalTreatment);
  const terminalValue = parseInputNumber(planning.terminalValue);

  return {
    projectionHorizonYears: horizonYears,
    terminalTreatment,
    ...(terminalTreatment === "residual-liquidation-value" ? { residualValue: terminalValue } : {}),
    ...(terminalTreatment === "reviewer-approved-terminal" ? { terminalValueOverride: terminalValue } : {}),
  };
}

function hasProjectionPlanningInput(planning: ProjectionPlanningState): boolean {
  return (
    normalizeProjectionHorizonYears(planning.horizonYears) !== defaultProjectionHorizonYears ||
    planning.entityLife !== defaultProjectionPlanning.entityLife ||
    planning.terminalTreatment !== defaultProjectionPlanning.terminalTreatment ||
    planning.terminalValue.trim() !== "" ||
    planning.terminalTreatmentReason.trim() !== ""
  );
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
                  fixedAssetScheduleValueKeys.map((key) => [
                    key,
                    typeof periodValues[key] === "string" ? formatEditableInteger(periodValues[key]) : "",
                  ]),
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

function sanitizeDebtScheduleInputs(value: unknown): DebtScheduleInputState {
  if (!isRecord(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value).flatMap(([periodId, periodInput]) => {
      if (!isRecord(periodInput)) {
        return [];
      }

      const sanitizedInput = Object.fromEntries(
        debtScheduleInputKeys.flatMap((key) => {
          const rawValue = periodInput[key];
          const value = typeof rawValue === "string" ? formatEditableNumber(rawValue) : "";

          return value.trim() ? [[key, value]] : [];
        }),
      ) as DebtSchedulePeriodInput;

      return Object.keys(sanitizedInput).length > 0 ? [[periodId, sanitizedInput]] : [];
    }),
  );
}

function ensureDebtScheduleInputPeriods(inputs: DebtScheduleInputState, periods: Period[]): DebtScheduleInputState {
  return Object.fromEntries(
    periods.map((period) => [
      period.id,
      Object.fromEntries(
        debtScheduleInputKeys.flatMap((key) => {
          const value = inputs[period.id]?.[key] ?? "";
          return value.trim() ? [[key, value]] : [];
        }),
      ) as DebtSchedulePeriodInput,
    ]).filter(([, periodInput]) => Object.keys(periodInput as DebtSchedulePeriodInput).length > 0),
  ) as DebtScheduleInputState;
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

      const adjustment = typeof entry.adjustment === "string" ? formatEditableInteger(entry.adjustment) : "";
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
    assumptionKeys.map((key) => [
      key,
      typeof source[key] === "string"
        ? isNumericAssumptionKey(key) ? formatAssumptionInput(key, source[key]) : source[key]
        : "",
    ]),
  ) as AssumptionState;
}

function sanitizeCaseProfile(value: unknown): CaseProfile {
  const source = isRecord(value) ? value : {};
  const profile = Object.fromEntries(
    caseProfileKeys.map((key) => [key, typeof source[key] === "string" ? formatCaseProfileValue(key, source[key]) : ""]),
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
    reportedTransferValue: typeof value.reportedTransferValue === "string" ? formatEditableInteger(value.reportedTransferValue) : "",
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

          const valueInput = typeof entry.value === "string" ? formatEditableInteger(entry.value) : "";
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

function sanitizeCashFlowAccountInclusions(value: unknown): CashFlowAccountInclusionState {
  if (!isRecord(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value).flatMap(([rowKey, accountEntries]) => {
      if (!isCashFlowWorkingCapitalRowKey(rowKey) || !isRecord(accountEntries)) {
        return [];
      }

      const sanitizedAccountEntries = Object.fromEntries(
        Object.entries(accountEntries).flatMap(([accountRowId, included]) =>
          typeof included === "boolean" ? [[accountRowId, included]] : [],
        ),
      );

      return Object.keys(sanitizedAccountEntries).length > 0 ? [[rowKey, sanitizedAccountEntries]] : [];
    }),
  );
}

function hasCashFlowAccountInclusionInput(value: CashFlowAccountInclusionState): boolean {
  return Object.values(value).some((row) => row && Object.keys(row).length > 0);
}

function hasDebtScheduleInput(value: DebtScheduleInputState): boolean {
  return Object.values(value).some((periodInput) =>
    Object.values(periodInput).some((entry) => typeof entry === "string" && entry.trim() !== ""),
  );
}

function createEmptyIncomeProjectionYearOverride(): IncomeProjectionYearOverrideState {
  return {
    revenueGrowth: "",
    grossProfitMargin: "",
    operatingExpenseMargin: "",
    depreciationMargin: "",
    reason: "",
    updatedAt: "",
  };
}

function createEmptyIncomeProjectionPresentationAssumptions(): IncomeProjectionPresentationAssumptionState {
  return {
    cashYield: "",
    debtRate: "",
    interestIncomeRevenueMargin: "",
    interestExpenseRevenueMargin: "",
    reason: "",
    updatedAt: "",
  };
}

function createEmptyIncomeProjectionControls(): IncomeProjectionControlState {
  return {
    yearlyOverrides: {},
    reviewerDecision: {
      decision: "pending",
      reason: "",
      updatedAt: "",
    },
    nonOperatingPolicy: {
      policy: "auto",
      reason: "",
      updatedAt: "",
    },
    presentationAssumptions: createEmptyIncomeProjectionPresentationAssumptions(),
    auditEvents: [],
  };
}

function hasIncomeProjectionControlInput(value: IncomeProjectionControlState): boolean {
  return (
    Object.values(value.yearlyOverrides).some(hasIncomeProjectionYearOverrideInput) ||
    value.reviewerDecision.decision !== "pending" ||
    value.reviewerDecision.reason.trim() !== "" ||
    value.nonOperatingPolicy.policy !== "auto" ||
    value.nonOperatingPolicy.reason.trim() !== "" ||
    hasIncomeProjectionPresentationInput(value) ||
    value.auditEvents.length > 0
  );
}

function hasIncomeProjectionPresentationInput(value: IncomeProjectionControlState): boolean {
  return (
    value.presentationAssumptions.cashYield.trim() !== "" ||
    value.presentationAssumptions.debtRate.trim() !== "" ||
    value.presentationAssumptions.interestIncomeRevenueMargin.trim() !== "" ||
    value.presentationAssumptions.interestExpenseRevenueMargin.trim() !== "" ||
    value.presentationAssumptions.reason.trim() !== "" ||
    value.nonOperatingPolicy.policy !== "auto" ||
    value.nonOperatingPolicy.reason.trim() !== ""
  );
}

function hasIncomeProjectionYearOverrideInput(value: IncomeProjectionYearOverrideState): boolean {
  return (
    value.revenueGrowth.trim() !== "" ||
    value.grossProfitMargin.trim() !== "" ||
    value.operatingExpenseMargin.trim() !== "" ||
    value.depreciationMargin.trim() !== "" ||
    value.reason.trim() !== ""
  );
}

function writeIncomeProjectionYearOverride(
  current: Record<string, IncomeProjectionYearOverrideState>,
  yearKey: string,
  entry: IncomeProjectionYearOverrideState,
): Record<string, IncomeProjectionYearOverrideState> {
  const next = { ...current };

  if (hasIncomeProjectionYearOverrideInput(entry)) {
    next[yearKey] = entry;
  } else {
    delete next[yearKey];
  }

  return next;
}

function createIncomeProjectionAuditEvent({
  action,
  field,
  priorValue,
  newValue,
  reason,
  impact,
}: Omit<IncomeProjectionAuditEvent, "id" | "createdAt" | "actor">): IncomeProjectionAuditEvent {
  const createdAt = new Date().toISOString();

  return {
    id: `income-projection-audit-${createdAt}-${Math.random().toString(36).slice(2, 10)}`,
    createdAt,
    actor: "reviewer",
    action,
    field,
    priorValue,
    newValue,
    reason,
    impact,
  };
}

function summarizeIncomeProjectionAppliedState(value: IncomeProjectionControlState): string {
  const yearlyOverrideCount = Object.values(value.yearlyOverrides).filter(hasIncomeProjectionYearOverrideInput).length;
  const presentationCount = incomeProjectionPresentationAssumptionFields.filter(
    (field) => value.presentationAssumptions[field.key].trim() !== "",
  ).length;

  return `${yearlyOverrideCount} yearly override rows + ${presentationCount} presentation assumptions`;
}

function sanitizeIncomeProjectionControls(value: unknown): IncomeProjectionControlState {
  if (!isRecord(value)) {
    return createEmptyIncomeProjectionControls();
  }

  const yearlyOverrides = isRecord(value.yearlyOverrides)
    ? Object.fromEntries(
        Object.entries(value.yearlyOverrides).flatMap(([yearKey, entry]) => {
          if (!Number.isFinite(Number(yearKey)) || !isRecord(entry)) {
            return [];
          }

          const sanitizedEntry: IncomeProjectionYearOverrideState = {
            revenueGrowth: typeof entry.revenueGrowth === "string" ? formatEditableNumber(entry.revenueGrowth) : "",
            grossProfitMargin: typeof entry.grossProfitMargin === "string" ? formatEditableNumber(entry.grossProfitMargin) : "",
            operatingExpenseMargin:
              typeof entry.operatingExpenseMargin === "string" ? formatEditableNumber(entry.operatingExpenseMargin) : "",
            depreciationMargin: typeof entry.depreciationMargin === "string" ? formatEditableNumber(entry.depreciationMargin) : "",
            reason: typeof entry.reason === "string" ? entry.reason : "",
            updatedAt: typeof entry.updatedAt === "string" ? entry.updatedAt : "",
          };

          return hasIncomeProjectionYearOverrideInput(sanitizedEntry) ? [[yearKey, sanitizedEntry]] : [];
        }),
      )
    : {};
  const reviewerDecisionInput = isRecord(value.reviewerDecision) ? value.reviewerDecision : {};
  const reviewerDecision =
    reviewerDecisionInput.decision === "approved" || reviewerDecisionInput.decision === "rejected"
      ? reviewerDecisionInput.decision
      : "pending";
  const nonOperatingPolicyInput = isRecord(value.nonOperatingPolicy) ? value.nonOperatingPolicy : {};
  const nonOperatingPolicy =
    nonOperatingPolicyInput.policy === "recurring" || nonOperatingPolicyInput.policy === "non-recurring"
      ? nonOperatingPolicyInput.policy
      : "auto";
  const presentationInput = isRecord(value.presentationAssumptions) ? value.presentationAssumptions : {};
  const auditEvents = Array.isArray(value.auditEvents)
    ? value.auditEvents.flatMap((event, index): IncomeProjectionAuditEvent[] => {
        if (!isRecord(event)) {
          return [];
        }

        return [
          {
            id: typeof event.id === "string" && event.id.trim() ? event.id : `income-projection-audit-import-${index}`,
            createdAt: typeof event.createdAt === "string" ? event.createdAt : "",
            actor: event.actor === "system" ? "system" : "reviewer",
            action: typeof event.action === "string" ? event.action : "",
            field: typeof event.field === "string" ? event.field : "",
            priorValue: typeof event.priorValue === "string" ? event.priorValue : "",
            newValue: typeof event.newValue === "string" ? event.newValue : "",
            reason: typeof event.reason === "string" ? event.reason : "",
            impact: typeof event.impact === "string" ? event.impact : "",
          },
        ];
      })
    : [];

  return {
    yearlyOverrides,
    reviewerDecision: {
      decision: reviewerDecision,
      reason: typeof reviewerDecisionInput.reason === "string" ? reviewerDecisionInput.reason : "",
      updatedAt: typeof reviewerDecisionInput.updatedAt === "string" ? reviewerDecisionInput.updatedAt : "",
    },
    nonOperatingPolicy: {
      policy: nonOperatingPolicy,
      reason: typeof nonOperatingPolicyInput.reason === "string" ? nonOperatingPolicyInput.reason : "",
      updatedAt: typeof nonOperatingPolicyInput.updatedAt === "string" ? nonOperatingPolicyInput.updatedAt : "",
    },
    presentationAssumptions: {
      cashYield: typeof presentationInput.cashYield === "string" ? formatEditableNumber(presentationInput.cashYield) : "",
      debtRate: typeof presentationInput.debtRate === "string" ? formatEditableNumber(presentationInput.debtRate) : "",
      interestIncomeRevenueMargin:
        typeof presentationInput.interestIncomeRevenueMargin === "string"
          ? formatEditableNumber(presentationInput.interestIncomeRevenueMargin)
          : "",
      interestExpenseRevenueMargin:
        typeof presentationInput.interestExpenseRevenueMargin === "string"
          ? formatEditableNumber(presentationInput.interestExpenseRevenueMargin)
          : "",
      reason: typeof presentationInput.reason === "string" ? presentationInput.reason : "",
      updatedAt: typeof presentationInput.updatedAt === "string" ? presentationInput.updatedAt : "",
    },
    auditEvents,
  };
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
  hideStatementColumn = false,
  mappedRows,
  periods,
  testId,
  onRemoveRow,
  onToggleLabel,
  onUpdateRow,
  onUpdateRowValue,
}: {
  emptyMessage: string;
  hideStatementColumn?: boolean;
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
  const showStatementColumn = !hideStatementColumn;
  const tableClassName = [
    "account-entry-table",
    hasBalanceSheetClassificationColumn ? "balance-entry-table" : "",
    showStatementColumn ? "" : "no-source-entry-table",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="table-wrap" data-testid={`${testId}-wrap`}>
      <table className={tableClassName} data-testid={testId}>
        <thead>
          <tr>
            {showStatementColumn ? <th className="source-column">Sumber</th> : null}
            {!showStatementColumn ? <th className="account-name-column">Nama akun dari laporan</th> : null}
            {hasBalanceSheetClassificationColumn ? <th className="balance-classification-column">Klasifikasi neraca</th> : null}
            {showStatementColumn ? <th className="account-name-column">Nama akun dari laporan</th> : null}
            <th className="category-column">Kategori utama</th>
            <th className="label-impact-column">Label & dampak</th>
            {periods.map((period) => (
              <th className="period-entry-column" key={period.id}>{period.label || "Periode"}</th>
            ))}
            <th className="action-column">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {mappedRows.map((item) => {
            const { row, mapping, effectiveCategory } = item;
            const balanceSheetClassification = getEffectiveBalanceSheetClassification(item);
            const balanceSheetClassificationOptionsForRow = getBalanceSheetClassificationOptions(effectiveCategory);
            const statementCell = showStatementColumn ? (
              <td className="source-column">
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
            ) : null;
            const accountNameCell = (
              <td className="account-name-column">
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
            );
            const balanceSheetClassificationCell = hasBalanceSheetClassificationColumn ? (
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
            ) : null;

            return (
              <tr data-testid={`${testId}-row`} key={row.id}>
                {statementCell}
                {!showStatementColumn ? accountNameCell : null}
                {balanceSheetClassificationCell}
                {showStatementColumn ? accountNameCell : null}
                <td className="category-column">
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
                <td className="label-impact-column">
                  <AccountLabelImpactCell item={item} onToggleLabel={onToggleLabel} />
                </td>
                {periods.map((period) => (
                  <td className="period-entry-column" key={period.id}>
                    <input
                      aria-label={`${period.label || "Periode"} amount`}
                      inputMode="numeric"
                      placeholder="0"
                      value={row.values[period.id] ?? ""}
                      onChange={(event) => onUpdateRowValue(row.id, period.id, event.target.value)}
                    />
                  </td>
                ))}
                <td className="action-column">
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
  sourceFocusTarget,
}: {
  drivers: Array<{ label: string; valueLabel: string; sourceLabel: string }>;
  sourceFocusTarget: SourceFocusTarget | null;
}) {
  return (
    <section className="assumption-driver-matrix" aria-label="Ringkasan driver penilaian" data-testid="assumption-driver-matrix">
      {drivers.map((driver) => {
        const isRequiredReturnDriver = driver.label === "Required return on NTA";
        const isSourceFocusTarget =
          isRequiredReturnDriver &&
          sourceFocusTarget?.tabId === "eemDcfAssumptions" &&
          sourceFocusTarget.targetKey === "assumption-required-return-on-nta";

        return (
          <div
            className={isSourceFocusTarget ? "source-focus-target" : undefined}
            data-source-focus-target={isRequiredReturnDriver ? "assumption-required-return-on-nta" : undefined}
            data-testid={isRequiredReturnDriver ? "required-return-source-target" : undefined}
            key={driver.label}
          >
            <span>{driver.label}</span>
            <strong>{driver.valueLabel}</strong>
            <small>{driver.sourceLabel}</small>
          </div>
        );
      })}
    </section>
  );
}

function CaseProfilePanel({
  profile,
  derived,
  guidanceTarget,
  onChange,
}: {
  profile: CaseProfile;
  derived: CaseProfileDerived;
  guidanceTarget: GuidanceTarget | null;
  onChange: (key: keyof CaseProfile, value: string) => void;
}) {
  const kluRecord = getKluSectorRecord(profile.objectBusinessKlu);
  const isShareTransfer = derived.isShareTransfer;
  const shareValuePerShareState =
    isShareTransfer && derived.shareValuePerShareStatus !== "valid" && profile.shareValuePerShare.trim() !== "" ? "invalid" : "neutral";
  const shareValuePerShareHelp =
    isShareTransfer && derived.shareValuePerShareStatus !== "valid"
      ? "Wajib diisi untuk mengubah lembar saham menjadi nilai rupiah penuh."
      : undefined;

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
          <CaseProfileSelect
            label="Jenis Perusahaan"
            value={profile.companyType}
            options={companyTypeOptions}
            guidanceTarget={guidanceTarget === "case-company-type" ? "case-company-type" : undefined}
            onChange={(value) => onChange("companyType", value)}
          />
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
            guidanceTarget={guidanceTarget === "case-share-ownership-type" ? "case-share-ownership-type" : undefined}
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
            inputMode="numeric"
            guidanceTarget={guidanceTarget === "case-capital-proportion" ? "case-capital-proportion" : undefined}
            onChange={(value) => onChange("capitalBaseFull", value)}
          />
          <CaseProfileInput
            label={derived.capitalBaseValuedLabel}
            value={profile.capitalBaseValued}
            inputMode="numeric"
            guidanceTarget={
              guidanceTarget === "case-capital-base-valued" || guidanceTarget === "case-capital-proportion"
                ? guidanceTarget
                : undefined
            }
            onChange={(value) => onChange("capitalBaseValued", value)}
          />
          {isShareTransfer ? (
            <CaseProfileInput
              label="Nilai Saham Per Lembar"
              value={profile.shareValuePerShare}
              inputMode="numeric"
              state={shareValuePerShareState}
              help={shareValuePerShareHelp}
              onChange={(value) => onChange("shareValuePerShare", value)}
            />
          ) : null}
          <DerivedCaseField
            label={derived.capitalProportionLabel}
            value={formatCaseProfileProportion(derived)}
            state={derived.capitalProportionStatus === "invalid" ? "invalid" : "neutral"}
          />
          {isShareTransfer ? (
            <>
              <DerivedCaseField
                label={derived.capitalBaseFullAmountLabel}
                value={formatCaseProfileAmount(derived.capitalBaseFullAmount, derived.capitalBaseAmountStatus)}
                state={derived.capitalBaseAmountStatus === "invalid" ? "invalid" : "neutral"}
              />
              <DerivedCaseField
                label={derived.capitalBaseValuedAmountLabel}
                value={formatCaseProfileAmount(derived.capitalBaseValuedAmount, derived.capitalBaseAmountStatus)}
                state={derived.capitalBaseAmountStatus === "invalid" ? "invalid" : "neutral"}
              />
            </>
          ) : null}
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
  state = "neutral",
  help,
  guidanceTarget,
  onChange,
}: {
  label: string;
  value: string;
  inputMode?: "text" | "decimal" | "numeric";
  state?: "neutral" | "invalid";
  help?: string;
  guidanceTarget?: GuidanceTarget;
  onChange: (value: string) => void;
}) {
  const inputId = `case-profile-${slugifyLabel(label)}`;
  const isGuidanceTarget = Boolean(guidanceTarget);

  return (
    <label
      className={[state === "invalid" ? "field invalid" : "field", isGuidanceTarget ? "action-guidance" : ""].filter(Boolean).join(" ")}
      data-guidance-target={guidanceTarget}
      htmlFor={inputId}
    >
      <span>{label}</span>
      <input
        aria-invalid={state === "invalid"}
        id={inputId}
        inputMode={inputMode}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      {isGuidanceTarget ? <span className="action-guidance-badge">Aksi dibutuhkan</span> : null}
      {help ? (
        <small className="field-help" role={state === "invalid" ? "alert" : undefined}>
          {help}
        </small>
      ) : null}
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
      ) : selectedRecord ? (
        <SmartSuggestionBadge
          label={isManualOverride ? "Saran KLU tersedia, sektor diedit manual" : "Saran KLU otomatis, dapat diedit"}
          state={isManualOverride ? "available" : "auto"}
        />
      ) : null}
    </label>
  );
}

function CaseProfileSelect({
  label,
  value,
  options,
  guidanceTarget,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  guidanceTarget?: GuidanceTarget;
  onChange: (value: string) => void;
}) {
  const inputId = `case-profile-${slugifyLabel(label)}`;
  const isGuidanceTarget = Boolean(guidanceTarget);

  return (
    <label className={["field", isGuidanceTarget ? "action-guidance" : ""].filter(Boolean).join(" ")} data-guidance-target={guidanceTarget} htmlFor={inputId}>
      <span>{label}</span>
      <select id={inputId} value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="">Pilih</option>
        {options.map((option) => (
          <option value={option} key={option}>
            {option}
          </option>
        ))}
      </select>
      {isGuidanceTarget ? <span className="action-guidance-badge">Aksi dibutuhkan</span> : null}
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
  guidanceTarget,
  suggestion,
  valuationDate,
  onApply,
}: {
  guidanceTarget?: GuidanceTarget;
  suggestion: MarketAssumptionSuggestion | null;
  valuationDate: string;
  onApply: (suggestion: MarketAssumptionSuggestion) => void;
}) {
  const supportedYears = getSupportedMarketSuggestionYears();
  const isGuidanceTarget = guidanceTarget === "wacc-market-suggestion";

  if (!suggestion) {
    return (
      <article
        className={`assumption-calculator-card wacc-suggestion-card ${isGuidanceTarget ? "action-guidance" : ""}`}
        data-guidance-target={isGuidanceTarget ? guidanceTarget : undefined}
        data-testid="wacc-suggestion-card"
      >
        <AssumptionCalculatorHeader
          label="Saran otomatis"
          value="Belum tersedia"
          impact={`Data tersedia untuk ${supportedYears[0]}-${supportedYears[supportedYears.length - 1]}`}
        />
        <p className="assumption-empty-note">
          {valuationDate.trim()
            ? "Tanggal penilaian berada di luar library tahunan 2020-2025."
            : "Isi Tahun Transaksi Pengalihan di Data Awal atau tanggal penilaian untuk memunculkan saran WACC tahunan."}
        </p>
        {isGuidanceTarget ? <span className="action-guidance-badge">Aksi dibutuhkan</span> : null}
      </article>
    );
  }

  return (
    <article className="assumption-calculator-card wacc-suggestion-card" data-testid="wacc-suggestion-card">
      <AssumptionCalculatorHeader
        label="Saran otomatis"
        value={`${suggestion.year}`}
      />
      <SmartSuggestionBadge label="Saran pasar otomatis, dapat diedit setelah diterapkan" state="available" />
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
                  <span className="source-status-pill smart">Saran sistem</span>
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
      <button
        className={`button secondary ${isGuidanceTarget ? "action-guidance" : ""}`}
        data-guidance-target={isGuidanceTarget ? guidanceTarget : undefined}
        type="button"
        onClick={() => onApply(suggestion)}
      >
        <CheckCircle2 size={18} />
        Terapkan Saran {suggestion.year}
        {isGuidanceTarget ? <span className="action-guidance-badge">Aksi dibutuhkan</span> : null}
      </button>
    </article>
  );
}

function WaccBasisControl({
  activeBasis,
  effectiveBasis,
  activeWacc,
  guidanceTarget,
  sourceFocusTarget,
  rawCalculation,
  governedCalculation,
  manualWacc,
  terminalGrowth,
  onBasisChange,
  onManualWaccChange,
}: {
  activeBasis: WaccBasis;
  effectiveBasis: WaccBasis;
  activeWacc: number;
  guidanceTarget?: GuidanceTarget;
  sourceFocusTarget: SourceFocusTarget | null;
  rawCalculation: WaccCalculation | null;
  governedCalculation: WaccCalculation | null;
  manualWacc: number | null;
  terminalGrowth: number;
  onBasisChange: (basis: WaccBasis) => void;
  onManualWaccChange: (value: string) => void;
}) {
  const manualIsWaiting = activeBasis === "manual" && manualWacc === null;
  const isSourceFocusTarget =
    sourceFocusTarget?.tabId === "wacc" && sourceFocusTarget.targetKey === "wacc-required-return-on-nta";
  const optionValue = (basis: WaccBasis) => {
    if (basis === "raw") {
      return rawCalculation ? formatPercentFixed(rawCalculation.wacc, 2) : "Belum dihitung";
    }

    if (basis === "manual") {
      return manualWacc === null ? "Perlu input" : formatPercentFixed(manualWacc, 2);
    }

    return governedCalculation ? formatPercentFixed(governedCalculation.wacc, 2) : "Belum dihitung";
  };

  return (
    <article
      className={[
        "assumption-calculator-card wide wacc-basis-card",
        isSourceFocusTarget ? "source-focus-target" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      data-source-focus-target="wacc-required-return-on-nta"
      data-testid="wacc-basis-control"
    >
      <AssumptionCalculatorHeader
        label="Basis WACC aktif"
        value={formatPercentFixed(activeWacc, 2)}
        impact={`${activeWaccBasisLabels[effectiveBasis].label} mengalir ke EEM/DCF`}
      />
      <div className="wacc-basis-grid" role="radiogroup" aria-label="Basis WACC aktif">
        {activeWaccBasisOptions.map((option) => (
          <label className={activeBasis === option.value ? "wacc-basis-option active" : "wacc-basis-option"} key={option.value}>
            <input
              checked={activeBasis === option.value}
              name="active-wacc-basis"
              type="radio"
              value={option.value}
              onChange={() => onBasisChange(option.value)}
            />
            <span>{option.label}</span>
            <strong>{optionValue(option.value)}</strong>
            <small>{option.summary}</small>
          </label>
        ))}
      </div>
      <div className="wacc-basis-manual-row">
        <AssumptionInput
          label="Manual WACC reviewer"
          value={manualWacc === null ? "" : formatRateInputNumber(manualWacc)}
          guidanceTarget={guidanceTarget}
          note="Mengisi nilai ini otomatis memilih basis Manual WACC. Kosongkan atau pilih basis lain untuk kembali ke kalkulasi sistem."
          onChange={onManualWaccChange}
        />
        <div className={manualIsWaiting ? "wacc-basis-status warning" : "wacc-basis-status"}>
          <span>Spread kapitalisasi aktif</span>
          <strong>{formatPercentFixed(activeWacc - terminalGrowth, 2)}</strong>
          <small>
            {manualIsWaiting
              ? "Manual WACC belum diisi; sistem menjaga basis governed sampai angka tersedia."
              : "EEM dan terminal DCF memakai WACC aktif dikurangi terminal growth aktif."}
          </small>
        </div>
      </div>
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
  valuationDate,
  autoCapitalValues,
  governance,
  marketGuidanceTarget,
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
  valuationDate: string;
  autoCapitalValues: AutoWaccCapitalValues;
  governance: AssumptionGovernanceResult;
  marketGuidanceTarget?: GuidanceTarget;
  onChange: (key: keyof AssumptionState, value: string) => void;
  onComparableNameChange: (slot: WaccComparableSlot, value: string) => void;
  onApplyComparableSuggestions: () => void;
  onReasonChange: (value: string) => void;
}) {
  const waccGovernanceItems = governance.items.filter((item) => item.target === "wacc");
  const bankLoanRate = calculateWaccBankLoanRateAssumption(assumptions);
  const hasMarketSuggestionApplied = assumptions.waccSource.startsWith("market-suggestion");
  const marketSuggestionLabel = hasMarketSuggestionApplied ? "Saran pasar otomatis, dapat diedit" : undefined;
  const marketSuggestionState = hasMarketSuggestionApplied ? "applied" : undefined;

  return (
    <article className="assumption-calculator-card wide" data-testid="wacc-calculator">
      <AssumptionCalculatorHeader
        label="Kalkulator WACC"
        value={calculation ? formatPercentFixed(calculation.wacc, 2) : formatRateInput(assumptions.wacc)}
      />
      <InlineGovernanceList title="Tata kelola WACC" items={waccGovernanceItems} />
      <div className="calculator-input-grid wacc-primary-input-grid">
        <AssumptionInput
          label="Risk-free rate (tingkat bebas risiko)"
          value={assumptions.waccRiskFreeRate}
          guidanceTarget={marketGuidanceTarget}
          smartSuggestionLabel={marketSuggestionLabel}
          smartSuggestionState={marketSuggestionState}
          onChange={(value) => onChange("waccRiskFreeRate", value)}
        />
        <AssumptionInput
          label="Equity risk premium (premi risiko ekuitas)"
          value={assumptions.waccEquityRiskPremium}
          smartSuggestionLabel={marketSuggestionLabel}
          smartSuggestionState={marketSuggestionState}
          onChange={(value) => onChange("waccEquityRiskPremium", value)}
        />
        <AssumptionInput
          label="Rating-based default spread (RBDS)"
          value={assumptions.waccRatingBasedDefaultSpread}
          smartSuggestionLabel={marketSuggestionLabel}
          smartSuggestionState={marketSuggestionState}
          onChange={(value) => onChange("waccRatingBasedDefaultSpread", value)}
        />
        <AssumptionInput
          label="Penyesuaian RBDS pada Ke"
          value={assumptions.waccCountryRiskPremium}
          note="Untuk konsistensi model: Ke = Rf + Beta x ERP - RBDS, sehingga RBDS disimpan sebagai adjustment negatif."
          smartSuggestionLabel={marketSuggestionLabel}
          smartSuggestionState={marketSuggestionState}
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
        valuationDate={valuationDate}
        onChange={onChange}
        onComparableNameChange={onComparableNameChange}
        onApplyComparableSuggestions={onApplyComparableSuggestions}
      />
      <div className="calculator-input-grid">
        <AssumptionInput
          label="Debt rate Bank Persero"
          value={assumptions.waccBankPerseroInvestmentLoanRate}
          note="Saran sistem memakai rata-rata tahunan SBDK korporasi OJK sebagai proxy pre-tax debt rate."
          smartSuggestionLabel={marketSuggestionLabel}
          smartSuggestionState={marketSuggestionState}
          onChange={(value) => onChange("waccBankPerseroInvestmentLoanRate", value)}
        />
        <AssumptionInput
          label="Debt rate Bank Pemda"
          value={assumptions.waccBankPemdaInvestmentLoanRate}
          note="Saran sistem memakai rata-rata tahunan SBDK korporasi OJK untuk Bank Pembangunan Daerah/BPD."
          smartSuggestionLabel={marketSuggestionLabel}
          smartSuggestionState={marketSuggestionState}
          onChange={(value) => onChange("waccBankPemdaInvestmentLoanRate", value)}
        />
        <AssumptionInput
          label="Debt rate Bank Swasta"
          value={assumptions.waccBankSwastaInvestmentLoanRate}
          note="Saran sistem memakai rata-rata tahunan SBDK korporasi OJK untuk bank non-Persero."
          smartSuggestionLabel={marketSuggestionLabel}
          smartSuggestionState={marketSuggestionState}
          onChange={(value) => onChange("waccBankSwastaInvestmentLoanRate", value)}
        />
        <AssumptionInput
          label="Debt rate Bank Asing"
          value={assumptions.waccBankAsingInvestmentLoanRate}
          note="Saran sistem memakai rata-rata tahunan SBDK korporasi OJK untuk kantor cabang bank asing/KCBA."
          smartSuggestionLabel={marketSuggestionLabel}
          smartSuggestionState={marketSuggestionState}
          onChange={(value) => onChange("waccBankAsingInvestmentLoanRate", value)}
        />
        <AssumptionInput
          label="Debt rate Bank Campuran"
          value={assumptions.waccBankCampuranInvestmentLoanRate}
          note="Saran sistem memakai rata-rata tahunan SBDK korporasi OJK untuk bank campuran/joint venture."
          smartSuggestionLabel={marketSuggestionLabel}
          smartSuggestionState={marketSuggestionState}
          onChange={(value) => onChange("waccBankCampuranInvestmentLoanRate", value)}
        />
        <AssumptionInput
          label="Debt rate Bank Umum / proxy"
          value={assumptions.waccBankUmumInvestmentLoanRate}
          note="Dipakai untuk smart suggestion tiga-rate bila input granular lima bank belum tersedia."
          smartSuggestionLabel={marketSuggestionLabel}
          smartSuggestionState={marketSuggestionState}
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
          ["Basis WACC", "Bobot utang dan ekuitas dikalikan dengan biaya modal aktif masing-masing."],
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
  valuationDate,
  onChange,
  onComparableNameChange,
  onApplyComparableSuggestions,
}: {
  assumptions: AssumptionState;
  comparableBeta: WaccComparableBetaCalculation;
  companySector: string;
  comparableOptions: IdxComparableCompany[];
  comparableSuggestions: IdxComparableCompany[];
  valuationDate: string;
  onChange: (key: keyof AssumptionState, value: string) => void;
  onComparableNameChange: (slot: WaccComparableSlot, value: string) => void;
  onApplyComparableSuggestions: () => void;
}) {
  const datasetResolution = getIdxComparableDatasetResolution(valuationDate);
  const datasetMetadata = datasetResolution.snapshot.metadata;
  const datasetStatus = getIdxComparableDatasetUseStatus(valuationDate);
  const datasetStatusClassName = ["wacc-comparable-source-warning", datasetStatus.level].join(" ");

  return (
    <div className="wacc-comparable-block" data-testid="wacc-comparable-table">
      <div className="wacc-comparable-toolbar">
        <div>
          <strong>Perusahaan Pembanding</strong>
          <span>
            {companySector
              ? `${companySector} · ${comparableOptions.length} emiten tersedia · ${comparableSuggestions.length} rekomendasi teratas ideal/moderat`
              : "Isi KLU sesuai Appportal di Data Awal"}
          </span>
        </div>
        <button className="button secondary compact-button" type="button" onClick={onApplyComparableSuggestions} disabled={comparableSuggestions.length === 0}>
          Terapkan Saran
        </button>
      </div>
      <div className="wacc-comparable-source" data-testid="wacc-comparable-source" data-snapshot-id={datasetMetadata.id}>
        <div className="wacc-comparable-source-main">
          <span className="source-status-pill smart">IDX peer snapshot</span>
          <span>
            Snapshot per {formatDisplayDate(datasetMetadata.asOfDate)} · {datasetMetadata.rowCount} catatan pembanding · toleransi{" "}
            {datasetMetadata.tolerancePercent}% sektor
          </span>
        </div>
        <small>
          {datasetMetadata.metricBasis} {datasetMetadata.coverageNote} Sumber: {datasetMetadata.processedFile}; diambil {datasetMetadata.fetchedAtWib} WIB.
        </small>
      </div>
      <div className={datasetStatusClassName} data-testid="wacc-comparable-source-warning" role="status">
        {datasetStatus.level === "warning" ? <AlertTriangle size={16} aria-hidden="true" /> : <FileSearch size={16} aria-hidden="true" />}
        <div>
          <strong>{datasetStatus.label}</strong>
          <span>{datasetStatus.message}</span>
        </div>
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
                      inputMode="numeric"
                      onChange={(value) => onChange(keys.marketCap, value)}
                    />
                  </td>
                  <td>
                    <AssumptionInput label={`Debt ${index + 1}`} value={assumptions[keys.debt]} inputMode="numeric" onChange={(value) => onChange(keys.debt, value)} />
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
  const isDebtWeightAuto = !assumptions.waccDebtWeight.trim() && calculation?.debtWeight !== null && calculation?.debtWeight !== undefined;
  const isEquityWeightAuto = !assumptions.waccEquityWeight.trim() && calculation?.equityWeight !== null && calculation?.equityWeight !== undefined;
  const debtWeightNote = buildAutoCapitalWeightNote(assumptions.waccDebtWeight, calculation?.debtWeight);
  const equityWeightNote = buildAutoCapitalWeightNote(assumptions.waccEquityWeight, calculation?.equityWeight);

  return (
    <div className="table-wrap wacc-model-table wacc-capital-structure-table" data-testid="wacc-capital-structure-table">
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
              <AssumptionInput
                label="Nilai pasar utang"
                value={debtMarketValue}
                suggestion={
                  isDebtAuto
                    ? {
                        value: formatInputNumber(autoCapitalValues.debtMarketValue),
                        displayValue: formatIdr(autoCapitalValues.debtMarketValue),
                        kind: "number",
                      }
                    : undefined
                }
                smartSuggestionLabel={isDebtAuto ? "Auto Neraca, dapat diedit" : undefined}
                smartSuggestionState={isDebtAuto ? "auto" : undefined}
                inputMode="numeric"
                note={isDebtAuto ? "Auto Neraca: liabilitas lancar + liabilitas tidak lancar." : undefined}
                onChange={(value) => onChange("waccDebtMarketValue", value)}
              />
            </td>
            <td>
              <AssumptionInput
                label="Fallback bobot utang"
                value={debtWeightInput}
                suggestion={
                  isDebtWeightAuto && calculation
                    ? {
                        value: formatOptionalDriverSuggestionInput(calculation.debtWeight, "rate"),
                        displayValue: formatPercent(calculation.debtWeight),
                        kind: "rate",
                      }
                    : undefined
                }
                smartSuggestionLabel={isDebtWeightAuto ? "Bobot otomatis, dapat diedit" : undefined}
                smartSuggestionState={isDebtWeightAuto ? "auto" : undefined}
                note={debtWeightNote}
                onChange={(value) => onChange("waccDebtWeight", value)}
              />
            </td>
            <td>{calculation ? formatPercent(calculation.afterTaxCostOfDebt) : "Belum dihitung"}</td>
            <td>{calculation ? formatPercent(calculation.debtWeight * calculation.afterTaxCostOfDebt) : "Belum dihitung"}</td>
          </tr>
          <tr>
            <td>Ekuitas</td>
            <td>
              <AssumptionInput
                label="Nilai pasar ekuitas"
                value={equityMarketValue}
                suggestion={
                  isEquityAuto
                    ? {
                        value: formatInputNumber(autoCapitalValues.equityMarketValue),
                        displayValue: formatIdr(autoCapitalValues.equityMarketValue),
                        kind: "number",
                      }
                    : undefined
                }
                smartSuggestionLabel={isEquityAuto ? "Auto Neraca, dapat diedit" : undefined}
                smartSuggestionState={isEquityAuto ? "auto" : undefined}
                inputMode="numeric"
                note={isEquityAuto ? "Auto Neraca: book equity aktif." : undefined}
                onChange={(value) => onChange("waccEquityMarketValue", value)}
              />
            </td>
            <td>
              <AssumptionInput
                label="Fallback bobot ekuitas"
                value={equityWeightInput}
                suggestion={
                  isEquityWeightAuto && calculation
                    ? {
                        value: formatOptionalDriverSuggestionInput(calculation.equityWeight, "rate"),
                        displayValue: formatPercent(calculation.equityWeight),
                        kind: "rate",
                      }
                    : undefined
                }
                smartSuggestionLabel={isEquityWeightAuto ? "Bobot otomatis, dapat diedit" : undefined}
                smartSuggestionState={isEquityWeightAuto ? "auto" : undefined}
                note={equityWeightNote}
                onChange={(value) => onChange("waccEquityWeight", value)}
              />
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
  const technicalDebtFormula = bankLoanRate?.basis === "workbook-five-bank" ? "ROUND(AVERAGE(L6:L10)/100,3)" : "ROUND(average input bank rate,3)";
  const debtRateNote = explicitDebtRate !== null && !isMarketSuggestionApplied
    ? "Override pre-tax cost of debt aktif; bank average tetap ditampilkan sebagai cross-check."
    : bankLoanRate
      ? `${bankLoanRate.basisLabel}: rata-rata mentah ${formatPrecisePercent(bankLoanRate.rawAverageRate, 3)} dan nilai untuk WACC ${formatPercent(bankLoanRate.roundedRate)}.`
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
      note: "Detail teknis disimpan di audit.",
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
      method: "Cost of equity menjaga konsistensi model: risk-free rate ditambah beta dikali ERP, lalu dikurangi rating-based default spread adjustment.",
      value: formatOptionalRate(ratingBasedDefaultSpread),
      source: "Input penilai / saran pasar",
      note: "Override treatment wajib diberi dasar profesional.",
    },
    {
      component: "Debt rate",
      workbookRef: "C7 / L11",
      workbookFormula: technicalDebtFormula,
      method: "Jika override kosong, sistem memakai rata-rata debt rate bank yang tersedia lalu membulatkannya sesuai aturan model.",
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
      source: "Hasil perhitungan",
      note: "Mengikuti bobot pasar WACC yang sedang aktif.",
    },
    {
      component: "Unlevered beta",
      workbookRef: "H1",
      workbookFormula: "BU = BL / (1 + (1 - t) x DER)",
      method: "Beta tidak berutang dihitung ulang dari beta aktif, pajak, dan struktur kapital.",
      value: formatOptionalNumber(unleveredBeta),
      source: "Hasil perhitungan",
      note: "Ditampilkan untuk rekonsiliasi teknis.",
    },
    {
      component: "Cost of equity",
      workbookRef: "H3 / C9",
      workbookFormula: "Ke = C3 + (H2 x C5) - C6",
      method: "Return ekuitas dihitung dari risk-free rate, beta, ERP, dan penyesuaian default spread.",
      value: formatOptionalRate(calculation?.costOfEquity ?? null),
      source: "Hasil perhitungan",
      note: "Nilai ini juga menjadi basis return ekuitas NTA bila disarankan.",
    },
    {
      component: "After-tax cost of debt",
      workbookRef: "H4 / C10",
      workbookFormula: "Kd = debt rate x (1 - tax rate)",
      method: "Biaya utang setelah pajak dihitung dari debt rate aktif setelah efek tax shield.",
      value: formatOptionalRate(calculation?.afterTaxCostOfDebt ?? null),
      source: "Hasil perhitungan",
      note: "Konsisten dengan EEM/DCF dan required return on NTA.",
    },
    {
      component: "Debt weight",
      workbookRef: "F7",
      workbookFormula: "DER / (1 + DER)",
      method: "Bobot utang memakai struktur kapital pasar atau fallback penilai.",
      value: formatOptionalRate(calculation?.debtWeight ?? null),
      source: "Hasil perhitungan / input manual",
      note: "Dipakai untuk kontribusi WACC sisi utang.",
    },
    {
      component: "Equity weight",
      workbookRef: "F8",
      workbookFormula: "1 - debt weight",
      method: "Bobot ekuitas adalah sisa struktur kapital setelah bobot utang.",
      value: formatOptionalRate(calculation?.equityWeight ?? null),
      source: "Hasil perhitungan / input manual",
      note: "Dipakai untuk kontribusi WACC sisi ekuitas.",
    },
    {
      component: "Debt WACC",
      workbookRef: "H7",
      workbookFormula: "F7 x G7",
      method: "Kontribusi utang dihitung dari bobot utang dikali after-tax cost of debt.",
      value: formatOptionalRate(debtComponent),
      source: "Hasil perhitungan",
      note: "Komponen pembentuk WACC final.",
    },
    {
      component: "Equity WACC",
      workbookRef: "H8",
      workbookFormula: "F8 x G8",
      method: "Kontribusi ekuitas dihitung dari bobot ekuitas dikali cost of equity.",
      value: formatOptionalRate(equityComponent),
      source: "Hasil perhitungan",
      note: "Komponen pembentuk WACC final.",
    },
    {
      component: "WACC",
      workbookRef: "H10 / C11",
      workbookFormula: "Debt WACC + Equity WACC",
      method: "WACC adalah penjumlahan kontribusi biaya modal utang dan ekuitas.",
      value: formatOptionalRate(calculation?.wacc ?? parseRateInput(assumptions.wacc)),
      source: "Hasil perhitungan / override WACC",
      note: "Mengalir ke EEM capitalization rate dan DCF discount rate.",
    },
    {
      component: "Growth reference",
      workbookRef: "C12",
      workbookFormula: "Linked growth reference",
      method: "Terminal growth ditampilkan sebagai referensi interoperabilitas untuk DCF, bukan input pembentuk WACC.",
      value: formatOptionalTerminalGrowthRate(terminalGrowth),
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
        <small>Detail audit tersedia untuk rekonsiliasi teknis dan dihitung ulang dari input aktif.</small>
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
              <th className="numeric-cell">Nilai Aktif</th>
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
                  <td>{row.sourceCell === "Sistem" ? "Saran sistem / input aktif" : "Input granular"}</td>
                  <td className="numeric-cell">{formatOptionalRate(row.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}

function TerminalGrowthPanel({
  assumptions,
  wacc,
  suggestion,
  investedCapitalSuggestion,
  governance,
  guidanceTarget,
  onChange,
  onApplySuggestion,
  onApplyInvestedCapitalSuggestion,
  onReasonChange,
  onGuidanceComplete,
}: {
  assumptions: AssumptionState;
  wacc: number;
  suggestion: TerminalGrowthSuggestion | null;
  investedCapitalSuggestion: InvestedCapitalGrowthRateSuggestion | null;
  governance: AssumptionGovernanceResult;
  guidanceTarget?: GuidanceTarget;
  onChange: (key: keyof AssumptionState, value: string) => void;
  onApplySuggestion: (suggestion: TerminalGrowthSuggestion) => void;
  onApplyInvestedCapitalSuggestion: (suggestion: InvestedCapitalGrowthRateSuggestion) => void;
  onReasonChange: (value: string) => void;
  onGuidanceComplete?: (target: GuidanceTarget) => void;
}) {
  const baseGrowth = readRateInput(assumptions.terminalGrowth);
  const hasInvalidSpread = baseGrowth !== null && wacc > 0 && baseGrowth >= wacc;
  const assumptionGovernanceItems = governance.items.filter((item) => item.target === "eemDcfAssumptions");
  const hasTerminalGrowthSuggestionApplied = Boolean(assumptions.terminalGrowthSource.trim());
  const terminalGrowthSmartLabel = hasTerminalGrowthSuggestionApplied ? "Saran sektor otomatis, dapat diedit" : undefined;
  const terminalGrowthSmartState = hasTerminalGrowthSuggestionApplied ? "applied" : undefined;

  return (
    <article className="assumption-calculator-card wide" data-testid="terminal-growth-calculator">
      <AssumptionCalculatorHeader
        label="Tata kelola terminal growth"
        value={formatTerminalGrowthRateInput(assumptions.terminalGrowth)}
        impact="DCF terminal value dan EEM capitalization spread"
      />
      <InlineGovernanceList title="Tata kelola asumsi EEM/DCF" items={assumptionGovernanceItems} />
      <InvestedCapitalGrowthSuggestionBlock
        activeSourceId={assumptions.terminalGrowthSource}
        guidanceTarget={guidanceTarget}
        suggestion={investedCapitalSuggestion}
        onApply={onApplyInvestedCapitalSuggestion}
      />
      <TerminalGrowthSuggestionBlock guidanceTarget={guidanceTarget} suggestion={suggestion} onApply={onApplySuggestion} />
      <div className="calculator-input-grid">
        <AssumptionInput
          label="Terminal growth dasar"
          value={assumptions.terminalGrowth}
          guidanceTarget={!suggestion ? guidanceTarget : undefined}
          smartSuggestionLabel={terminalGrowthSmartLabel}
          smartSuggestionState={terminalGrowthSmartState}
          onChange={(value) => onChange("terminalGrowth", value)}
          onGuidanceComplete={onGuidanceComplete}
        />
        <AssumptionInput
          label="Terminal growth skenario bawah"
          value={assumptions.terminalGrowthDownside}
          smartSuggestionLabel={terminalGrowthSmartLabel}
          smartSuggestionState={terminalGrowthSmartState}
          onChange={(value) => onChange("terminalGrowthDownside", value)}
        />
        <AssumptionInput
          label="Terminal growth skenario atas"
          value={assumptions.terminalGrowthUpside}
          smartSuggestionLabel={terminalGrowthSmartLabel}
          smartSuggestionState={terminalGrowthSmartState}
          onChange={(value) => onChange("terminalGrowthUpside", value)}
        />
      </div>
      <MetricTraceGrid
        metrics={[
          ["Spread WACC", baseGrowth !== null && wacc > 0 ? formatPercent(wacc - baseGrowth) : "Belum dihitung"],
          ["Validasi", hasInvalidSpread ? "Terminal growth harus di bawah WACC" : "Spread valid bila WACC tersedia"],
          ["Metode", "Nilai terminal diproses engine DCF dari FCFF final, WACC, dan terminal growth aktif"],
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

function InvestedCapitalGrowthSuggestionBlock({
  activeSourceId,
  guidanceTarget,
  suggestion,
  onApply,
}: {
  activeSourceId: string;
  guidanceTarget?: GuidanceTarget;
  suggestion: InvestedCapitalGrowthRateSuggestion | null;
  onApply: (suggestion: InvestedCapitalGrowthRateSuggestion) => void;
}) {
  const isGuidanceTarget = guidanceTarget === "terminal-growth-suggestion";

  if (!suggestion) {
    return (
      <div className={`terminal-growth-suggestion invested-growth-suggestion ${isGuidanceTarget ? "action-guidance" : ""}`}>
        <div className="terminal-growth-suggestion-heading">
          <div>
            <span>Referensi utama baru</span>
            <strong>Growth Rate berbasis invested capital</strong>
          </div>
          <em className="source-badge sensitivity">butuh histori</em>
        </div>
        <p className="assumption-empty-note">
          Minimal dua periode historis diperlukan agar net investment dan invested capital awal dapat dihitung otomatis.
        </p>
      </div>
    );
  }

  const isApplied = activeSourceId === suggestion.sourceId;

  return (
    <div
      className={`terminal-growth-suggestion invested-growth-suggestion ${isGuidanceTarget ? "action-guidance" : ""}`}
      data-guidance-target={isGuidanceTarget ? guidanceTarget : undefined}
      data-testid="invested-capital-growth-suggestion-card"
    >
      <div className="terminal-growth-suggestion-heading">
        <div>
          <span>Referensi utama baru</span>
          <strong>Growth Rate berbasis invested capital</strong>
        </div>
        <em className={`source-badge ${isApplied ? "smart" : "recommended"}`}>
          {isApplied ? "dipakai" : "primary evidence"}
        </em>
      </div>
      <p className="assumption-empty-note">
        Read-only dari Aset Tetap, Neraca, dan ROIC. Tidak ada angka workbook yang di-hardcode; workbook hanya menjadi pola formula.
      </p>
      <div className="terminal-growth-suggestion-grid invested-growth-summary" aria-label="Ringkasan growth rate invested capital">
        <div>
          <span>Base growth</span>
          <strong>{formatPercentFixed(suggestion.baseGrowth, 2)}</strong>
          <small>Average growth rate historis{suggestion.cappedByWacc ? ", dibatasi di bawah WACC" : ""}</small>
        </div>
        <div>
          <span>Downside / upside</span>
          <strong>
            {formatPercentFixed(suggestion.downsideGrowth, 2)} / {formatPercentFixed(suggestion.upsideGrowth, 2)}
          </strong>
          <small>Rentang dari observasi historis valid</small>
        </div>
        <div>
          <span>Interoperabilitas</span>
          <strong>{suggestion.interoperabilityTabs.join(" -> ")}</strong>
          <small>{suggestion.sourceArtifact}</small>
        </div>
      </div>
      <div className="table-wrap invested-growth-table-wrap">
        <table className="invested-growth-table" aria-label="Perhitungan read-only growth rate berbasis invested capital">
          <thead>
            <tr>
              <th>Periode</th>
              <th>NFA akhir</th>
              <th>NCA akhir</th>
              <th>NFA awal</th>
              <th>NCA awal</th>
              <th>Total net investment</th>
              <th>IC awal</th>
              <th>Growth rate</th>
            </tr>
          </thead>
          <tbody>
            {suggestion.rows.map((row) => (
              <tr key={row.periodId}>
                <td>{row.periodLabel}</td>
                <td className="numeric-cell">{formatIdr(row.netFixedAssetsEnd)}</td>
                <td className="numeric-cell">{formatIdr(row.netCurrentAssetsEnd)}</td>
                <td className="numeric-cell">{formatIdr(row.netFixedAssetsBeginning)}</td>
                <td className="numeric-cell">{formatIdr(row.netCurrentAssetsBeginning)}</td>
                <td className="numeric-cell">{formatIdr(row.totalNetInvestment)}</td>
                <td className="numeric-cell">{formatIdr(row.totalInvestedCapitalBeginning)}</td>
                <td className="numeric-cell">{formatPercentFixed(row.growthRate, 2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button
        className="button secondary full-width"
        type="button"
        onClick={() => onApply(suggestion)}
        disabled={isApplied}
      >
        <CheckCircle2 aria-hidden="true" size={14} />
        {isApplied ? "Growth rate invested capital dipakai" : "Gunakan growth rate invested capital"}
      </button>
    </div>
  );
}

function TerminalGrowthSuggestionBlock({
  guidanceTarget,
  suggestion,
  onApply,
}: {
  guidanceTarget?: GuidanceTarget;
  suggestion: TerminalGrowthSuggestion | null;
  onApply: (suggestion: TerminalGrowthSuggestion) => void;
}) {
  const isGuidanceTarget = guidanceTarget === "terminal-growth-suggestion";

  if (!suggestion) {
    return (
      <div
        className={`terminal-growth-suggestion ${isGuidanceTarget ? "action-guidance" : ""}`}
        data-guidance-target={isGuidanceTarget ? guidanceTarget : undefined}
        data-testid="terminal-growth-suggestion-card"
      >
        <div className="terminal-growth-suggestion-heading">
          <div>
            <span>Saran otomatis</span>
            <strong>Bukti sektor belum tersedia</strong>
          </div>
          <em className="source-badge manual">Menunggu sektor</em>
        </div>
        <p className="assumption-empty-note">Saran muncul setelah sektor perusahaan sesuai klasifikasi IDX tersedia di Data Awal.</p>
        {isGuidanceTarget ? <span className="action-guidance-badge">Aksi dibutuhkan</span> : null}
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
        <em className="source-badge smart">
          {suggestion.confidence} evidence
        </em>
      </div>
      <div className="terminal-growth-suggestion-grid" aria-label="Bukti sektor terminal growth">
        <div>
          <span>Base</span>
          <strong>{formatTerminalGrowthPercent(suggestion.baseGrowth)}</strong>
          <small>{suggestion.quality} kasus sektor</small>
        </div>
        <div>
          <span>Downside</span>
          <strong>{formatTerminalGrowthPercent(suggestion.downsideGrowth)}</strong>
          <small>Band stres</small>
        </div>
        <div>
          <span>Upside</span>
          <strong>{formatTerminalGrowthPercent(suggestion.upsideGrowth)}</strong>
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
      <button
        className={`button secondary ${isGuidanceTarget ? "action-guidance" : ""}`}
        data-guidance-target={isGuidanceTarget ? guidanceTarget : undefined}
        type="button"
        onClick={() => onApply(suggestion)}
      >
        <CheckCircle2 size={18} />
        Gunakan saran sektor
        {isGuidanceTarget ? <span className="action-guidance-badge">Aksi dibutuhkan</span> : null}
      </button>
    </div>
  );
}

function RequiredReturnOnNtaPanel({
  assumptions,
  calculation,
  suggestion,
  waccCalculation,
  balances,
  governance,
  guidanceTarget,
  onChange,
  onReasonChange,
  onGuidanceComplete,
}: {
  assumptions: AssumptionState;
  calculation: RequiredReturnOnNtaCalculation | null;
  suggestion: RequiredReturnOnNtaSuggestion;
  waccCalculation: WaccCalculation | null;
  balances: { accountReceivable: number; employeeReceivable: number; inventory: number; fixedAssetsNet: number };
  governance: AssumptionGovernanceResult;
  guidanceTarget?: GuidanceTarget;
  onChange: (key: keyof AssumptionState, value: string) => void;
  onReasonChange: (value: string) => void;
  onGuidanceComplete?: (target: GuidanceTarget) => void;
}) {
  const suggestedValue = (key: RequiredReturnOnNtaSuggestionKey) => formatRequiredReturnSuggestionInput(suggestion.fields[key]);
  const ntaGovernanceItems = governance.items.filter((item) => item.id === "nta-return-fallback");
  const afterTaxDebtCostSuggestion = buildRequiredReturnInputSuggestion(suggestion.fields.requiredReturnAfterTaxDebtCost, "rate");
  const equityCostSuggestion = buildRequiredReturnInputSuggestion(suggestion.fields.requiredReturnEquityCost, "rate");
  const afterTaxDebtCostIsAuto = Boolean(!assumptions.requiredReturnAfterTaxDebtCost.trim() && afterTaxDebtCostSuggestion?.value.trim());
  const equityCostIsAuto = Boolean(!assumptions.requiredReturnEquityCost.trim() && equityCostSuggestion?.value.trim());
  const receivablesBase = Math.max(0, balances.accountReceivable) + Math.max(0, balances.employeeReceivable);
  const equityCostValue =
    readRateInput(assumptions.requiredReturnEquityCost) ?? suggestion.fields.requiredReturnEquityCost?.value ?? waccCalculation?.costOfEquity ?? null;

  return (
    <article className="assumption-calculator-card wide" data-testid="required-return-on-nta-calculator">
      <AssumptionCalculatorHeader
        label="Kalkulator required return on NTA"
        value={calculation ? formatPercentFixed(calculation.requiredReturn, 2) : formatRateInput(assumptions.requiredReturnOnNta)}
        impact="EEM capital charge atas operating net tangible assets"
      />
      <InlineGovernanceList title="Tata kelola return NTA" items={ntaGovernanceItems} />
      <div className="driver-basis-strip">
        <div>
          <span>Jumlah piutang</span>
          <strong>{formatIdr(receivablesBase)}</strong>
          <small>Account receivable + other/employee receivable.</small>
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
      <div className="required-return-meaning-note" data-testid="required-return-meaning-note">
        <div>
          <span>Kalkulator required return on NTA</span>
          <strong>{calculation ? formatPercentFixed(calculation.requiredReturn, 2) : "Belum dihitung"}</strong>
          <small>Blended return: bobot utang kapasitas x Kd + bobot ekuitas x Ke. Nilai ini menjadi default Return on Tangible Asset EEM.</small>
        </div>
        <div>
          <span>Return ekuitas aset berwujud</span>
          <strong>{equityCostValue === null ? "Belum tersedia" : formatPercentFixed(equityCostValue, 2)}</strong>
          <small>Ke / biaya modal ekuitas aset berwujud dari WACC. Nilai ini dapat dipilih juga sebagai Return on Tangible Asset di Penilaian EEM.</small>
        </div>
      </div>
      <RequiredReturnOnNtaSuggestionBlock suggestion={suggestion} />
      <div className="calculator-input-grid">
        <AssumptionInput
          label="Kapasitas piutang"
          value={assumptions.requiredReturnReceivablesCapacity}
          guidanceTarget={guidanceTarget}
          suggestion={buildRequiredReturnInputSuggestion(suggestion.fields.requiredReturnReceivablesCapacity, "rate")}
          note={buildSuggestionInputNote(assumptions.requiredReturnReceivablesCapacity, suggestion.fields.requiredReturnReceivablesCapacity)}
          onChange={(value) => onChange("requiredReturnReceivablesCapacity", value)}
          onApplySuggestion={(value) => onChange("requiredReturnReceivablesCapacity", value)}
          onGuidanceComplete={onGuidanceComplete}
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
          inputMode="numeric"
          onChange={(value) => onChange("requiredReturnAdditionalCapacity", value)}
          onApplySuggestion={(value) => onChange("requiredReturnAdditionalCapacity", value)}
        />
        <AssumptionInput
          label="After-tax debt cost"
          value={assumptions.requiredReturnAfterTaxDebtCost || suggestedValue("requiredReturnAfterTaxDebtCost")}
          suggestion={afterTaxDebtCostSuggestion}
          smartSuggestionLabel={afterTaxDebtCostIsAuto ? "Nilai otomatis dari WACC, dapat diedit" : undefined}
          smartSuggestionState={afterTaxDebtCostIsAuto ? "auto" : undefined}
          note={buildSuggestionInputNote(assumptions.requiredReturnAfterTaxDebtCost, suggestion.fields.requiredReturnAfterTaxDebtCost)}
          onChange={(value) => onChange("requiredReturnAfterTaxDebtCost", value)}
        />
        <AssumptionInput
          label="Return ekuitas aset berwujud"
          value={assumptions.requiredReturnEquityCost || suggestedValue("requiredReturnEquityCost")}
          suggestion={equityCostSuggestion}
          smartSuggestionLabel={equityCostIsAuto ? "Nilai otomatis dari WACC, dapat diedit" : undefined}
          smartSuggestionState={equityCostIsAuto ? "auto" : undefined}
          note={buildSuggestionInputNote(assumptions.requiredReturnEquityCost, suggestion.fields.requiredReturnEquityCost)}
          onChange={(value) => onChange("requiredReturnEquityCost", value)}
        />
      </div>
      <RequiredReturnEquityTrace
        field={suggestion.fields.requiredReturnEquityCost}
        waccCalculation={waccCalculation}
      />
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

function RequiredReturnEquityTrace({
  field,
  waccCalculation,
}: {
  field: RequiredReturnOnNtaSuggestionField | undefined;
  waccCalculation: WaccCalculation | null;
}) {
  const equityReturn = field?.value ?? waccCalculation?.costOfEquity ?? null;
  const rows = [
    {
      component: "Risk-free rate",
      value: formatOptionalRate(waccCalculation?.riskFreeRate),
      source: "Tab WACC",
      formula: "DISCOUNT RATE C3",
    },
    {
      component: "Beta",
      value: formatOptionalNumber(waccCalculation?.beta),
      source: "Comparable / input WACC",
      formula: "DISCOUNT RATE C4 atau relevered beta H2",
    },
    {
      component: "Equity risk premium",
      value: formatOptionalRate(waccCalculation?.equityRiskPremium),
      source: "Dataset pasar / input WACC",
      formula: "DISCOUNT RATE C5",
    },
    {
      component: "RBDS / risk adjustment",
      value: formatOptionalRate(waccCalculation?.countryRiskAdjustment),
      source: "Rating spread dan penyesuaian risiko eksplisit",
      formula: "DISCOUNT RATE C6 + premi risiko spesifik",
    },
    {
      component: "Return ekuitas aset berwujud",
      value: equityReturn === null ? "Belum tersedia" : formatPercentFixed(equityReturn, 2),
      source: field?.source ?? "Tab WACC",
      formula: "Ke mengalir ke BORROWING CAP biaya modal ekuitas",
    },
  ];

  return (
    <section className="required-return-equity-trace" data-testid="required-return-equity-cost-trace">
      <div>
        <span>Trace Return Ekuitas Aset Berwujud</span>
        <strong>DISCOUNT RATE → BORROWING CAP → Asumsi EEM/DCF</strong>
        <small>
          Ke dihitung di WACC/CAPM, dipakai sebagai biaya modal ekuitas pada borrowing capacity, lalu masuk required return on NTA.
        </small>
      </div>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Komponen</th>
              <th>Nilai</th>
              <th>Sumber</th>
              <th>Formula / interoperabilitas</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.component}>
                <td>{row.component}</td>
                <td className="numeric-cell">{row.value}</td>
                <td>{row.source}</td>
                <td>
                  <code>{row.formula}</code>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
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
        <em className={`source-badge ${suggestion.waitingFor.length === 0 ? "smart" : "sensitivity"}`}>
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
          <dd>{suggestion.waitingFor.length > 0 ? suggestion.waitingFor.join(" ") : "Biaya modal dan model kapasitas tersedia. Review capacity rate bila bukti agunan atau covenant menunjukkan haircut berbeda."}</dd>
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
                  {line.isReadOnly ? (
                    <div className="aam-readonly-value" aria-label={`Penyesuaian ${line.label}`}>
                      <strong>{formatIdr(line.adjustment)}</strong>
                      {line.readOnlyReason ? <small>{line.readOnlyReason}</small> : null}
                    </div>
                  ) : (
                    <input
                      aria-label={`Penyesuaian ${line.label}`}
                      inputMode="numeric"
                      placeholder="0"
                      value={line.adjustmentInput}
                      onChange={(event) => onUpdate(line.id, { adjustment: event.target.value })}
                    />
                  )}
                </td>
                <td className="numeric-cell">{formatIdr(line.adjusted)}</td>
                <td>
                  {line.isReadOnly ? (
                    <span className="aam-readonly-note">{line.note || line.readOnlyReason || "-"}</span>
                  ) : (
                    <textarea
                      aria-label={`Catatan ${line.label}`}
                      className={line.requiresNote ? "aam-note warning" : "aam-note"}
                      placeholder="Catatan jika ada adjustment"
                      value={line.note}
                      onChange={(event) => onUpdate(line.id, { note: event.target.value })}
                      rows={1}
                    />
                  )}
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

const aamBalanceTolerance = 0.5;

function AamBalanceControl({ model }: { model: AamAdjustmentModel }) {
  const isHistoricalBalanced = Math.abs(model.historicalBalanceGap) < aamBalanceTolerance;
  const isAdjustedBalanced = Math.abs(model.adjustedBalanceGap) < aamBalanceTolerance;
  const statusLabel = isHistoricalBalanced && isAdjustedBalanced ? "Balance" : "Tidak balance";
  const statusClassName = isHistoricalBalanced && isAdjustedBalanced ? "ok" : "warning";
  const liabilityEquityRows = [
    {
      label: "Total Aset",
      historical: model.historicalAssetTotal,
      adjustment: model.assetAdjustmentTotal,
      adjusted: model.adjustedAssetTotal,
      note: "Sisi aset AAM.",
    },
    {
      label: "Total Liabilitas + Ekuitas",
      historical: model.historicalLiabilityEquityTotal,
      adjustment: model.liabilityEquityAdjustmentTotal,
      adjusted: model.adjustedLiabilityEquityTotal,
      note: "Sisi liabilitas dan ekuitas setelah revaluasi otomatis.",
    },
    {
      label: "Selisih balance",
      historical: model.historicalBalanceGap,
      adjustment: model.adjustedBalanceGap - model.historicalBalanceGap,
      adjusted: model.adjustedBalanceGap,
      note: isAdjustedBalanced ? "Total aset sama dengan liabilitas + ekuitas." : "Selisih perlu ditinjau pada mapping atau input neraca.",
    },
  ];

  return (
    <div className="aam-adjustment-section aam-balance-control" data-testid="aam-adjustment-liabilitas-ekuitas">
      <div className="subpanel-heading">
        <div>
          <span>Liabilitas + Ekuitas</span>
          <h4>{formatIdr(model.adjustedLiabilityEquityTotal)}</h4>
        </div>
        <small>
          {formatIdr(model.historicalLiabilityEquityTotal)} historis · {formatIdr(model.liabilityEquityAdjustmentTotal)} penyesuaian
        </small>
      </div>
      <div className={`aam-balance-status ${statusClassName}`} role="status">
        {statusClassName === "ok" ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
        <span>{statusLabel}</span>
        <small>Selisih setelah penyesuaian: {formatIdr(model.adjustedBalanceGap)}</small>
      </div>
      <div className="table-wrap aam-adjustment-table-wrap">
        <table className="aam-adjustment-table aam-balance-table" aria-label="Kontrol balance AAM">
          <thead>
            <tr>
              <th>Komponen</th>
              <th>Historis</th>
              <th>Penyesuaian</th>
              <th>Disesuaikan</th>
              <th>Status / catatan</th>
            </tr>
          </thead>
          <tbody>
            {liabilityEquityRows.map((row) => (
              <tr key={row.label}>
                <td>
                  <strong>{row.label}</strong>
                </td>
                <td className="numeric-cell">{formatIdr(row.historical)}</td>
                <td className="numeric-cell">{formatIdr(row.adjustment)}</td>
                <td className="numeric-cell">{formatIdr(row.adjusted)}</td>
                <td>{row.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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

function AssumptionGovernancePanel({
  ariaLabel,
  governance,
  onNavigate,
}: {
  ariaLabel: string;
  governance: AssumptionGovernanceResult;
  onNavigate: (target: AssumptionGovernanceTarget) => void;
}) {
  return (
    <section className={`assumption-audit-panel ${governance.level}`} aria-label={ariaLabel}>
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Mesin tata kelola asumsi</p>
          <h3>{governance.title}</h3>
          <small>{governance.summary}</small>
        </div>
        <em className={`source-badge ${governance.level === "critical" ? "warning" : governance.level === "review" ? "sensitivity" : "recommended"}`}>
          {governance.criticalCount} kritis · {governance.reviewCount} tinjauan
        </em>
      </div>
      <div className="assumption-audit-grid">
        {governance.items.map((item) => (
          <AssumptionGovernanceCard item={item} key={item.id} onNavigate={onNavigate} />
        ))}
      </div>
    </section>
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
  guidanceCandidateId,
  guidanceTarget,
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
  guidanceCandidateId?: string;
  guidanceTarget?: GuidanceTarget;
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
          candidates.map((candidate) => {
            const isGuidanceTarget = Boolean(guidanceTarget && candidate.id === guidanceCandidateId);

            return (
              <button
                className={[
                  "candidate-button",
                  candidate.status === "recommended" ? "recommended" : "",
                  candidate.id === sourceId ? "active" : "",
                  isGuidanceTarget ? "action-guidance" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                data-guidance-target={isGuidanceTarget ? guidanceTarget : undefined}
                key={candidate.id}
                type="button"
                onClick={() => onSelect(candidate)}
              >
                <span>
                  {candidate.label}
                  {candidate.sourceCell ? <small>{candidate.sourceCell}</small> : null}
                </span>
                <strong>{formatPercent(candidate.value)}</strong>
                {isGuidanceTarget ? <em className="action-guidance-badge">Aksi dibutuhkan</em> : null}
              </button>
            );
          })
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

type SmartSuggestionState = "available" | "applied" | "auto";

function SmartSuggestionBadge({ label, state = "available" }: { label: string; state?: SmartSuggestionState }) {
  return <span className={`smart-suggestion-badge ${state}`}>{label}</span>;
}

function AssumptionInput({
  label,
  value,
  note,
  suggestion,
  smartSuggestionLabel,
  smartSuggestionState,
  guidanceTarget,
  inputMode = "decimal",
  onChange,
  onApplySuggestion,
  onGuidanceComplete,
}: {
  label: string;
  value: string;
  note?: string;
  suggestion?: OptionalDriverSuggestion;
  smartSuggestionLabel?: string;
  smartSuggestionState?: SmartSuggestionState;
  guidanceTarget?: GuidanceTarget;
  inputMode?: "decimal" | "numeric";
  onChange: (value: string) => void;
  onApplySuggestion?: (value: string) => void;
  onGuidanceComplete?: (target: GuidanceTarget) => void;
}) {
  const inputId = `assumption-${slugifyLabel(label)}`;
  const hasSuggestionSource = Boolean(suggestion?.value.trim());
  const canApplySuggestion = Boolean(hasSuggestionSource && onApplySuggestion);
  const isGuidanceTarget = Boolean(guidanceTarget);
  const isSuggestionApplied =
    canApplySuggestion && suggestion ? isOptionalDriverSuggestionApplied(value, suggestion.value, suggestion.kind) : false;
  const resolvedSmartState = smartSuggestionState ?? (hasSuggestionSource ? (isSuggestionApplied ? "applied" : "available") : undefined);
  const resolvedSmartLabel =
    smartSuggestionLabel ??
    (resolvedSmartState === "applied"
      ? "Saran otomatis dipakai, dapat diedit"
      : resolvedSmartState === "auto"
        ? "Nilai otomatis, dapat diedit"
        : resolvedSmartState
          ? "Saran otomatis tersedia"
          : "");
  const fieldClassName = [
    "field assumption-input-field",
    resolvedSmartState ? `smart-suggestion-field ${resolvedSmartState}` : "",
    isGuidanceTarget && !canApplySuggestion ? "action-guidance" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={fieldClassName} data-guidance-target={isGuidanceTarget && !canApplySuggestion ? guidanceTarget : undefined}>
      <div className="assumption-input-heading">
        <label htmlFor={inputId}>{label}</label>
        {resolvedSmartState ? <SmartSuggestionBadge label={resolvedSmartLabel} state={resolvedSmartState} /> : null}
        {canApplySuggestion && suggestion && onApplySuggestion ? (
          <button
            className={`suggestion-apply-button ${isGuidanceTarget ? "action-guidance" : ""}`}
            data-guidance-target={isGuidanceTarget ? guidanceTarget : undefined}
            type="button"
            onClick={() => {
              onApplySuggestion(suggestion.value);
              if (guidanceTarget) {
                onGuidanceComplete?.(guidanceTarget);
              }
            }}
            disabled={isSuggestionApplied}
            title={isSuggestionApplied ? `${suggestion.displayValue} sudah dipakai` : `Isi dengan ${suggestion.displayValue}`}
            aria-label={isSuggestionApplied ? `Nilai sistem sudah dipakai untuk ${label}` : `Gunakan nilai sistem untuk ${label}`}
          >
            <CheckCircle2 aria-hidden="true" size={12} />
            {isSuggestionApplied ? "Dipakai" : "Gunakan nilai sistem"}
            {isGuidanceTarget ? <span className="action-guidance-badge">Aksi dibutuhkan</span> : null}
          </button>
        ) : null}
        {isGuidanceTarget && !canApplySuggestion ? <span className="action-guidance-badge">Aksi dibutuhkan</span> : null}
      </div>
      <input
        className={resolvedSmartState ? "smart-suggestion-input" : undefined}
        id={inputId}
        inputMode={inputMode}
        placeholder="Opsional"
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
          if (guidanceTarget) {
            onGuidanceComplete?.(guidanceTarget);
          }
        }}
      />
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

  return kind === "rate" ? formatRateInputNumber(value * 100) : formatInputNumber(value);
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
  return `${formatInputNumber(value)} hari`;
}

function formatCaseProfileValue(key: keyof CaseProfile, value: string): string {
  if (key === "objectBusinessKlu") {
    return normalizeKluCode(value);
  }

  if (key === "capitalBaseFull" || key === "capitalBaseValued" || key === "shareValuePerShare") {
    return formatEditableInteger(value);
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

function formatCaseProfileAmount(value: number | null, status: CaseProfileDerived["capitalBaseAmountStatus"]): string {
  if (status === "empty") {
    return "Belum dihitung";
  }

  if (status === "invalid" || value === null) {
    return "Data Tidak Valid";
  }

  return formatIdr(value);
}

function formatDerivedDate(value: string): string {
  return value ? formatDisplayDate(value) : "Belum dihitung";
}

function formatAutoCapitalValue(value: number): string {
  return value > 0 ? formatInputNumber(value) : "";
}

function formatAutoCapitalWeight(value: number | undefined): string {
  return typeof value === "number" && Number.isFinite(value) ? formatRateInputNumber(value) : "";
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
      [key]: preciseAssumptionKeys.has(key) ? formatRateInputNumber(field.value) : formatInputNumber(field.value),
    };
  }, assumptions);
}

function formatRequiredReturnSuggestionInput(field: RequiredReturnOnNtaSuggestionField | undefined): string {
  if (!field?.canAutoApply || field.value === null) {
    return "";
  }

  return preciseAssumptionKeys.has(field.key) ? formatRateInputNumber(field.value) : formatInputNumber(field.value);
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
  const basis = field.basis.replace(/\.+$/, "");
  return `${prefix}: ${basis}. ${field.note}`;
}

function applyIdxComparableSuggestions(
  assumptions: AssumptionState,
  sector: string,
  mode: "empty-only" | "replace",
  valuationDate: string,
): AssumptionState {
  const suggestions = getSuggestedIdxComparables(sector, 3, { valuationDate });

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

function resolveComparableValuationDate(caseProfile: CaseProfile, periods: Period[], activePeriodId: string): string {
  const derived = buildCaseProfileDerived(caseProfile);
  const activePeriod = periods.find((period) => period.id === activePeriodId) ?? getDefaultActivePeriod(periods);

  return derived.cutOffDate || activePeriod?.valuationDate || "";
}

function applyIdxComparableToSlot(
  assumptions: AssumptionState,
  slot: WaccComparableSlot,
  company: IdxComparableCompany,
): AssumptionState {
  return {
    ...assumptions,
    [slot.name]: formatIdxComparableLabel(company),
    [slot.beta]: company.betaLevered !== null ? formatRateInputNumber(company.betaLevered) : "",
    [slot.marketCap]: company.marketCap !== null ? formatInputNumber(company.marketCap) : "",
    [slot.debt]: company.debt !== null ? formatInputNumber(company.debt) : "",
  };
}

function formatAssumptionInput(key: keyof AssumptionState, value: string): string {
  return preciseAssumptionKeys.has(key) ? formatEditableNumber(value) : formatEditableInteger(value);
}

function isNumericAssumptionKey(key: keyof AssumptionState): boolean {
  const keyName = String(key);
  return !keyName.endsWith("Source") && !keyName.endsWith("OverrideReason") && !keyName.endsWith("Name");
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

function buildCalculatedDriverSummary(
  label: string,
  value: number | null,
  sourceLabel: string,
  formatter: (value: number) => string = formatPercent,
) {
  return {
    label,
    valueLabel: value === null ? "Belum dipilih" : formatter(value),
    sourceLabel,
  };
}

function formatWaccBasisSourceLabel(
  requestedBasis: WaccBasis,
  effectiveBasis: WaccBasis,
  isGovernedWacc: boolean,
  rawCalculation: WaccCalculation | null,
  manualWaccInput: string,
): string {
  if (requestedBasis === "manual" && effectiveBasis !== "manual") {
    return "Manual WACC kosong; fallback governed aktif";
  }

  if (effectiveBasis === "manual") {
    return "Manual WACC reviewer";
  }

  if (effectiveBasis === "raw") {
    return rawCalculation ? "Raw calculated WACC aktif" : sourceLabelFromManual(manualWaccInput);
  }

  return isGovernedWacc ? "Governed WACC dari input pasar" : rawCalculation ? "Calculated WACC aktif" : sourceLabelFromManual(manualWaccInput);
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

function formatTerminalGrowthRateInput(input: string): string {
  const rate = parseRateInput(input);
  return rate === null ? "Belum dipilih" : formatTerminalGrowthPercent(rate);
}

function formatOptionalRate(value: number | null | undefined): string {
  return value === null || value === undefined || !Number.isFinite(value) ? "Belum tersedia" : formatPercentFixed(value, 2);
}

function formatOptionalTerminalGrowthRate(value: number | null | undefined): string {
  return value === null || value === undefined || !Number.isFinite(value) ? "Belum tersedia" : formatTerminalGrowthPercent(value);
}

function formatPrecisePercent(value: number, maximumFractionDigits: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "percent",
    maximumFractionDigits,
  }).format(value);
}

function formatTerminalGrowthPercent(value: number): string {
  return formatPercentFixed(value, 2);
}

function formatOptionalNumber(value: number | null | undefined): string {
  return value === null || value === undefined || !Number.isFinite(value) ? "Belum tersedia" : formatNumber(value);
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 4,
  }).format(value);
}

function getYearFromDate(dateValue: string | undefined): number | null {
  if (!dateValue) {
    return null;
  }

  const year = Number.parseInt(dateValue.slice(0, 4), 10);
  return Number.isFinite(year) ? year : null;
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
          <button className="button secondary" type="button" onClick={onAddRow}>
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

      <div className="account-input-footer">
        <button className="button secondary" type="button" onClick={onAddRow}>
          <Plus size={16} />
          Tambah kelas aset
        </button>
      </div>
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
        <table className="fixed-asset-table fixed-asset-rollforward-table" data-testid={title.startsWith("A.") ? "fixed-asset-acquisition-table" : "fixed-asset-depreciation-table"}>
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
                            inputMode="numeric"
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
                          inputMode="numeric"
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

const aamAssetTraceLabels = new Set(["Aset historis basis AAM", "Penyesuaian aset AAM", "Total aset disesuaikan"]);
const aamLiabilityTraceLabels = new Set(["Liabilitas historis basis AAM", "Penyesuaian liabilitas AAM", "Total liabilitas disesuaikan"]);
const aamEquityTraceLabels = new Set([
  "Ekuitas historis basis AAM",
  "Penyesuaian ekuitas manual AAM",
  "Changes on Asset Revaluation",
  "Total ekuitas disesuaikan",
  "Total liabilitas + ekuitas disesuaikan",
  "Selisih balance AAM",
]);

function AamFormulaList({ traces }: { traces: FormulaTrace[] }) {
  const assetTraces = traces.filter((trace) => aamAssetTraceLabels.has(trace.label));
  const liabilityTraces = traces.filter((trace) => aamLiabilityTraceLabels.has(trace.label));
  const finalTraces = traces.filter(
    (trace) => !aamAssetTraceLabels.has(trace.label) && !aamLiabilityTraceLabels.has(trace.label) && !aamEquityTraceLabels.has(trace.label),
  );

  return (
    <div className="formula-list formula-list-aam">
      {assetTraces.length ? (
        <div className="formula-group formula-group-assets" aria-label="Kelompok aset AAM">
          {assetTraces.map((trace) => renderFormulaRow(trace))}
        </div>
      ) : null}
      {liabilityTraces.length ? (
        <div className="formula-group formula-group-liabilities" aria-label="Kelompok liabilitas AAM">
          {liabilityTraces.map((trace) => renderFormulaRow(trace))}
        </div>
      ) : null}
      {finalTraces.map((trace) => renderFormulaRow(trace, "formula-row-final"))}
    </div>
  );
}

function EemTraceTable({
  traces,
  sourceFocusTarget,
  onSourceNavigate,
}: {
  traces: FormulaTrace[];
  sourceFocusTarget: SourceFocusTarget | null;
  onSourceNavigate: (target: SourceFocusTarget) => void;
}) {
  return (
    <div className="eem-trace-table-wrap" data-testid="eem-trace-table">
      <table className="eem-trace-table" aria-label="Jejak rinci perhitungan EEM">
        <thead>
          <tr>
            <th scope="col">Komponen</th>
            <th scope="col">Nilai aktif</th>
            <th scope="col">Sumber dan akun</th>
          </tr>
        </thead>
        <tbody>
          {traces.map((trace) => {
            const traceId = trace.id ?? trace.label;
            const sourceChips = getPrimaryTraceSourceChips(trace);
            const sourceKind = getTraceSourceKind(trace);
            const isFocusedRow =
              sourceFocusTarget?.tabId === "valuationEem" && sourceFocusTarget.traceId === traceId;

            return (
              <tr
                className={isFocusedRow ? "source-focus-row" : ""}
                key={traceId}
                data-testid="eem-trace-row"
                data-source-focus-row={traceId}
              >
                <td>
                  <div className="eem-trace-component">
                    <strong>{trace.label}</strong>
                    <p>{trace.note}</p>
                  </div>
                </td>
                <td className="eem-trace-value">{formatFormulaTraceValue(trace)}</td>
                <td>
                  <div className="eem-trace-source-stack">
                    <div className="eem-trace-meta-row" aria-label={`Jenis sumber ${trace.label}`}>
                      <span className={`eem-trace-origin-badge ${sourceKind.className}`}>{sourceKind.label}</span>
                    </div>
                    {sourceChips.length > 0 ? (
                      <div className="eem-trace-chip-row" aria-label={`Tab sumber ${trace.label}`}>
                        {sourceChips.map((chip) => {
                          const isFocusedChip =
                            sourceFocusTarget?.traceId === traceId && sourceFocusTarget.sourceLabel === chip.label;

                          return (
                          <button
                            className={isFocusedChip ? "active" : ""}
                            data-testid="eem-source-chip"
                            key={`${chip.tabId}-${chip.label}`}
                            type="button"
                            onClick={() =>
                              onSourceNavigate({
                                tabId: chip.tabId,
                                sourceLabel: chip.label,
                                traceId,
                                traceLabel: trace.label,
                                targetKey: chip.targetKey,
                              })
                            }
                            aria-label={`Buka sumber ${chip.label} untuk ${trace.label}`}
                          >
                            {chip.label}
                          </button>
                          );
                        })}
                      </div>
                    ) : null}
                    <TraceFormula formula={trace.formula} traceLabel={trace.label} />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function DcfAuditTrailPanel({
  auditTrail,
  onSourceNavigate,
}: {
  auditTrail: DcfAuditTrail;
  onSourceNavigate: (tabId: WorkflowTabId) => void;
}) {
  const tableStyle = { "--dcf-audit-table-min-width": `${660 + auditTrail.periods.length * 164}px` } as CSSProperties;

  return (
    <article className="panel dcf-audit-panel" data-testid="dcf-audit-trail">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Jejak DCF</p>
          <h3>Discounted Cash Flow (DCF)</h3>
        </div>
        <TableProperties size={22} />
      </div>
      <div className="dcf-interoperability-strip" aria-label="Tab interoperabilitas DCF">
        {auditTrail.interoperabilityTabs.map((tab) => {
          const tabId = resolveTraceSourceTabId(tab);

          return tabId ? (
            <button key={tab} type="button" onClick={() => onSourceNavigate(tabId)}>
              {tab}
            </button>
          ) : (
            <span key={tab}>{tab}</span>
          );
        })}
      </div>
      <div className="dcf-audit-table-wrap" data-testid="dcf-audit-table-wrap">
        <table className="dcf-audit-table" aria-label="Jejak rinci Discounted Cash Flow" style={tableStyle}>
          <thead>
            <tr>
              <th className="dcf-audit-component-column" scope="col">Komponen</th>
              {auditTrail.periods.map((period) => (
                <th className="dcf-audit-period-column" scope="col" key={period.key}>
                  <span>{period.label}</span>
                  {!period.includedInExplicitPv ? <small>benchmark</small> : null}
                </th>
              ))}
              <th className="dcf-audit-source-column" scope="col">Sumber dan audit</th>
            </tr>
          </thead>
          <tbody>
            {auditTrail.rows.map((row) => (
              <DcfAuditTrailTableRow
                key={row.id}
                periods={auditTrail.periods}
                row={row}
                onSourceNavigate={onSourceNavigate}
              />
            ))}
          </tbody>
        </table>
      </div>
      <div className="dcf-bridge-grid" aria-label="Bridge enterprise value ke equity value DCF">
        {auditTrail.bridgeRows.map((row) => (
          <DcfBridgeItem key={row.id} row={row} onSourceNavigate={onSourceNavigate} />
        ))}
      </div>
    </article>
  );
}

function DcfAuditTrailTableRow({
  periods,
  row,
  onSourceNavigate,
}: {
  periods: DcfAuditTrail["periods"];
  row: DcfAuditTrailRow;
  onSourceNavigate: (tabId: WorkflowTabId) => void;
}) {
  return (
    <tr data-testid="dcf-audit-row">
      <td className="dcf-audit-component-column">
        <div className="dcf-audit-component">
          <strong>{row.label}</strong>
          <p>{row.note}</p>
        </div>
      </td>
      {periods.map((period, index) => (
        <td
          className={period.includedInExplicitPv ? "dcf-audit-period-column" : "dcf-audit-period-column dcf-audit-benchmark-cell"}
          key={period.key}
        >
          <span>{formatDcfAuditValue(row.values[index] ?? null, row.valueFormat)}</span>
        </td>
      ))}
      <td className="dcf-audit-source-column">
        <DcfAuditSourceStack row={row} onSourceNavigate={onSourceNavigate} />
      </td>
    </tr>
  );
}

function DcfBridgeItem({
  row,
  onSourceNavigate,
}: {
  row: DcfAuditBridgeRow;
  onSourceNavigate: (tabId: WorkflowTabId) => void;
}) {
  return (
    <div className={row.id === "dcf-equity-value" ? "dcf-bridge-item dcf-bridge-item-final" : "dcf-bridge-item"}>
      <div>
        <span>{row.label}</span>
        <strong>{formatDcfAuditValue(row.value, row.valueFormat)}</strong>
      </div>
      <p>{row.note}</p>
      <DcfAuditSourceStack row={row} onSourceNavigate={onSourceNavigate} compact />
    </div>
  );
}

function DcfAuditSourceStack({
  row,
  onSourceNavigate,
  compact = false,
}: {
  row: Pick<DcfAuditTrailRow, "formula" | "workbookReference" | "sourceTabs" | "accountCategories" | "label">;
  onSourceNavigate: (tabId: WorkflowTabId) => void;
  compact?: boolean;
}) {
  return (
    <div className={compact ? "dcf-audit-source-stack compact" : "dcf-audit-source-stack"}>
      <div className="eem-trace-chip-row" aria-label={`Tab sumber ${row.label}`}>
        {row.sourceTabs.map((sourceTab) => {
          const tabId = resolveTraceSourceTabId(sourceTab);

          return tabId ? (
            <button
              key={sourceTab}
              type="button"
              onClick={() => onSourceNavigate(tabId)}
              aria-label={`Buka ${sourceTab} untuk ${row.label}`}
            >
              {sourceTab}
            </button>
          ) : (
            <span key={sourceTab}>{sourceTab}</span>
          );
        })}
      </div>
      <div className="dcf-readable-source">
        <span>Sumber sistem</span>
        <strong>{summarizeTraceCalculation(row.label)}</strong>
        <small>Sumber data ditarik otomatis dari tab interoperabilitas dan kategori akun terkait.</small>
      </div>
      <details className="dcf-technical-trace">
        <summary>Detail audit teknis</summary>
        <TraceFormula formula={row.formula} traceLabel={row.label} />
        <code>{row.workbookReference}</code>
      </details>
      {row.accountCategories.length > 0 ? (
        <div className="dcf-account-chip-row" aria-label={`Akun terkait ${row.label}`}>
          {row.accountCategories.map((category) => (
            <span key={category}>{formatAccountCategoryName(category)}</span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function summarizeTraceCalculation(label: string): string {
  const normalizedLabel = label.toLowerCase();

  if (normalizedLabel.includes("terminal")) {
    return "Nilai terminal diproses dari FCFF final, WACC, dan terminal growth aktif.";
  }

  if (normalizedLabel.includes("enterprise value")) {
    return "Enterprise value diproses dari PV FCFF eksplisit dan PV terminal value.";
  }

  if (normalizedLabel.includes("equity value")) {
    return "Nilai ekuitas diproses dari enterprise value, aset non-operasional, dan kewajiban debt-like.";
  }

  if (normalizedLabel.includes("working capital") || normalizedLabel.includes("current asset") || normalizedLabel.includes("current liabilities")) {
    return "Perubahan modal kerja diproses dari akun lancar operasional yang terpilih.";
  }

  if (normalizedLabel.includes("free cash flow") || normalizedLabel.includes("fcff")) {
    return "FCFF diproses dari arus operasi, modal kerja, dan investasi aset tetap.";
  }

  if (normalizedLabel.includes("noplat")) {
    return "NOPLAT diproses dari laba operasi dan pajak badan.";
  }

  if (normalizedLabel.includes("depreciation")) {
    return "Penyusutan diproses dari jadwal aset tetap dan proyeksi aset tetap.";
  }

  if (normalizedLabel.includes("debt")) {
    return "Utang berbunga diproses dari Neraca dan Jadwal Utang.";
  }

  if (normalizedLabel.includes("asset")) {
    return "Aset terkait diproses dari Neraca, ROIC, dan klasifikasi akun.";
  }

  return "Nilai diproses otomatis oleh engine DCF dari sumber data terhubung.";
}

function TraceFormula({ formula, traceLabel }: { formula: string; traceLabel: string }) {
  const tokens = tokenizeTraceFormula(formula);

  return (
    <div className="eem-trace-equation" aria-label={`Formula ${traceLabel}`}>
      <span className="eem-trace-equation-label">Rumus</span>
      <span className="eem-trace-equation-flow">
        {tokens.map((token, index) =>
          token.isOperator ? (
            <span className="operator" key={`${token.value}-${index}`}>
              {token.value}
            </span>
          ) : (
            <span key={`${token.value}-${index}`}>{token.value}</span>
          ),
        )}
      </span>
    </div>
  );
}

function FormulaList({ traces }: { traces: FormulaTrace[] }) {
  return (
    <div className="formula-list">
      {traces.map((trace) => renderFormulaRow(trace))}
    </div>
  );
}

function renderFormulaRow(trace: FormulaTrace, extraClassName?: string) {
  const className = extraClassName ? `formula-row ${extraClassName}` : "formula-row";

  return (
    <div className={className} key={trace.id ?? trace.label}>
      <div>
        <strong>{trace.label}</strong>
        <code>{trace.formula}</code>
        <p>{trace.note}</p>
      </div>
      <span>{formatFormulaTraceValue(trace)}</span>
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

function formatDcfAuditValue(value: number | null, valueFormat: DcfAuditValueFormat): string {
  if (value === null || !Number.isFinite(value)) {
    return "-";
  }

  if (valueFormat === "percent") {
    return formatPercent(value);
  }

  if (valueFormat === "factor") {
    return new Intl.NumberFormat("id-ID", {
      minimumFractionDigits: 4,
      maximumFractionDigits: 4,
    }).format(value);
  }

  if (valueFormat === "number") {
    return formatNumber(value);
  }

  return formatIdr(value);
}

function formatAccountCategoryName(category: AccountCategory): string {
  return accountMappingRules.find((rule) => rule.category === category)?.displayName ?? category.replaceAll("_", " ");
}

const traceFormulaOperatorLabels: Record<string, string> = {
  "+": "+",
  "-": "-",
  x: "×",
  X: "×",
  "*": "×",
  "/": "÷",
  ">": ">",
  "<": "<",
  ">=": ">=",
  "<=": "<=",
};

function getTraceSourceKind(trace: FormulaTrace): { label: string; className: string } {
  if (trace.traceLevel === "assumption") {
    return { label: "Asumsi", className: "assumption" };
  }

  if (trace.traceLevel === "bridge" || trace.traceLevel === "input") {
    return { label: "Read Only", className: "readonly" };
  }

  return { label: "Perhitungan", className: "formula" };
}

function resolveTraceSourceTabId(label: string): WorkflowTabId | null {
  return traceSourceTabAliases.get(label) ?? workflowTabIdByLabel.get(label) ?? null;
}

function getPrimaryTraceSourceChips(trace: FormulaTrace): TraceSourceChip[] {
  if (trace.id === "eem-net-tangible-asset-value") {
    return [buildTraceSourceChip("Penilaian AAM", "aam-nta-source")].filter(
      (chip): chip is TraceSourceChip => Boolean(chip),
    );
  }

  if (trace.id === "eem-return-on-tangible-asset") {
    const chips = [
      buildTraceSourceChip("Asumsi EEM/DCF", "assumption-required-return-on-nta"),
      buildTraceSourceChip("WACC", "wacc-required-return-on-nta"),
    ];

    return chips.filter((chip): chip is TraceSourceChip => Boolean(chip));
  }

  const labels = getPrimaryTraceSourceLabels(trace);

  return labels
    .map((label) => buildTraceSourceChip(label))
    .filter((chip): chip is TraceSourceChip => Boolean(chip));
}

function buildTraceSourceChip(label: string, targetKey?: SourceFocusKey): TraceSourceChip | null {
  const tabId = resolveTraceSourceTabId(label);

  return tabId ? { label, tabId, targetKey } : null;
}

function getPrimaryTraceSourceLabels(trace: FormulaTrace): string[] {
  const sourceTabs = trace.sourceTabs ?? [];
  const withoutAuditOnlyLabels = sourceTabs.filter((label) => label !== "Kategorisasi Akun");

  if (withoutAuditOnlyLabels[0] === "Penilaian AAM") {
    return ["Penilaian AAM"];
  }

  if (trace.id === "eem-capitalization-rate" && withoutAuditOnlyLabels.includes("WACC")) {
    return ["WACC"];
  }

  return withoutAuditOnlyLabels;
}

function tokenizeTraceFormula(formula: string): Array<{ value: string; isOperator: boolean }> {
  return formula
    .split(/(\s(?:\+|-|x|X|\*|\/|>|<|>=|<=)\s)/g)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const operator = traceFormulaOperatorLabels[part];
      return { value: operator ?? part, isOperator: Boolean(operator) };
    });
}

function findTraceValueById(traces: FormulaTrace[], id: string, fallback = 0): number {
  return traces.find((trace) => trace.id === id)?.value ?? fallback;
}

function findTraceValue(traces: FormulaTrace[], label: string): number {
  return traces.find((trace) => trace.label === label)?.value ?? 0;
}

function scopeAssumptionGovernance(
  governance: AssumptionGovernanceResult,
  includeItem: (item: AssumptionGovernanceItem) => boolean,
  methodLabel: string,
): AssumptionGovernanceResult {
  const matchingItems = governance.items.filter(includeItem);
  const items: AssumptionGovernanceItem[] =
    matchingItems.length > 0
      ? matchingItems
      : [
          {
            id: `governance-clear-${methodLabel.toLowerCase()}`,
            label: `Tata kelola asumsi ${methodLabel}`,
            valueLabel: "Tidak ada isu material",
            level: "ok",
            message: `Driver shared EEM/DCF tidak memiliki isu material khusus ${methodLabel}.`,
            action: "Tetap dokumentasikan bukti final dalam laporan.",
            target: "eemDcfAssumptions",
          },
        ];
  const criticalCount = items.filter((item) => item.level === "critical").length;
  const reviewCount = items.filter((item) => item.level === "review").length;
  const level: AssumptionGovernanceResult["level"] = criticalCount > 0 ? "critical" : reviewCount > 0 ? "review" : "ok";

  return {
    ...governance,
    items,
    criticalCount,
    reviewCount,
    level,
    title:
      level === "critical"
        ? `Asumsi ${methodLabel} berisiko tinggi`
        : level === "review"
          ? `Asumsi ${methodLabel} perlu ditinjau`
          : `Tata kelola asumsi ${methodLabel} memadai`,
    summary:
      level === "critical"
        ? `Driver aktif ${methodLabel} dapat dihitung, tetapi belum layak menjadi base case final tanpa perbaikan atau tinjauan asumsi.`
        : level === "review"
          ? `Driver aktif ${methodLabel} membutuhkan dokumentasi peninjau sebelum final.`
          : `Driver aktif ${methodLabel} melewati threshold awal dan tetap perlu bukti pendukung final.`,
  };
}
