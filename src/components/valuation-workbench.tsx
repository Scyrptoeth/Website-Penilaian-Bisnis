"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Banknote,
  Calculator,
  CalendarDays,
  CheckCircle2,
  Eraser,
  FileSearch,
  GitBranch,
  PanelLeftClose,
  PanelLeftOpen,
  Plus,
  Redo2,
  TableProperties,
  Trash2,
  Undo2,
  Upload,
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
import { calculateAllMethods } from "@/lib/valuation/calculations";
import {
  buildFixedAssetScheduleSummary,
  buildSampleAssumptions,
  buildSamplePeriods,
  buildSampleRows,
  buildSnapshot,
  createFixedAssetScheduleRow,
  createHistoricalPeriod,
  createRow,
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
  statementLabels,
  type AccountRow,
  type AssumptionState,
  type BalanceSheetClassification,
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
import { buildWorkbenchReadiness, type SectionReadiness, type WorkbenchReadiness, type WorkbenchSectionId } from "@/lib/valuation/readiness";
import { buildSectionAnalysis, type AnalysisRow, type AnalysisValue, type RatioRow, type SectionAnalysis } from "@/lib/valuation/section-analysis";
import { buildValidationChecks } from "@/lib/valuation/validation-checks";
import { workbookAuditFixture } from "@/lib/valuation/workbook-audit-fixture";
import {
  buildTaxRateCandidates,
  requiredReturnOnNtaCandidates,
  terminalGrowthCandidates,
  waccCandidates,
  type AssumptionCandidate,
} from "@/lib/valuation/assumption-candidates";
import type { AccountCategory, FormulaTrace } from "@/lib/valuation/types";
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
  "revenueGrowth",
  "wacc",
  "waccSource",
  "waccOverrideReason",
  "requiredReturnOnNta",
  "requiredReturnOnNtaSource",
  "requiredReturnOnNtaOverrideReason",
  "arDays",
  "inventoryDays",
  "apDays",
  "otherPayableDays",
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
const WORKBENCH_STORAGE_KEY = "penilaian-valuasi-bisnis.workbench.v1";
const WORKBENCH_SCROLL_STORAGE_KEY = "penilaian-valuasi-bisnis.scroll.v1";
const WORKBENCH_SIDEBAR_STORAGE_KEY = "penilaian-valuasi-bisnis.sidebar.v1";
const WORKBENCH_STORAGE_VERSION = 2;

type PersistedWorkbenchState = {
  version: typeof WORKBENCH_STORAGE_VERSION;
  savedAt: string;
  periods: Period[];
  activePeriodId: string;
  rows: AccountRow[];
  isFixedAssetScheduleEnabled: boolean;
  fixedAssetScheduleRows: FixedAssetScheduleRow[];
  assumptions: AssumptionState;
};

type WorkbenchCoreState = Omit<PersistedWorkbenchState, "version" | "savedAt">;

type WorkflowTabId = WorkbenchSectionId;

const workflowTabs: Array<{ id: WorkflowTabId; label: string }> = [
  { id: "periods", label: "Periode" },
  { id: "balance", label: "Neraca & Fixed Asset" },
  { id: "income", label: "Laba Rugi" },
  { id: "mapping", label: "Mapping & Label" },
  { id: "assumptions", label: "Asumsi & Driver" },
  { id: "valuation", label: "Valuasi" },
  { id: "payablesCashFlow", label: "Payables & Cash Flow" },
  { id: "noplatFcf", label: "NOPLAT & FCF" },
  { id: "ratiosCapital", label: "Ratios & Capital Efficiency" },
  { id: "audit", label: "Audit" },
];

const MAX_HISTORY_STEPS = 80;

export function ValuationWorkbench() {
  const [periods, setPeriods] = useState<Period[]>(initialPeriods);
  const [activePeriodId, setActivePeriodId] = useState(initialPeriods[0].id);
  const [rows, setRows] = useState<AccountRow[]>([]);
  const [isFixedAssetScheduleEnabled, setIsFixedAssetScheduleEnabled] = useState(false);
  const [fixedAssetScheduleRows, setFixedAssetScheduleRows] = useState<FixedAssetScheduleRow[]>([]);
  const [assumptions, setAssumptions] = useState<AssumptionState>(emptyAssumptions);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isDraftRestored, setIsDraftRestored] = useState(false);
  const [activeWorkflowTab, setActiveWorkflowTab] = useState<WorkflowTabId>("periods");
  const [undoStack, setUndoStack] = useState<WorkbenchCoreState[]>([]);
  const [redoStack, setRedoStack] = useState<WorkbenchCoreState[]>([]);

  const mappedRows = useMemo(() => rows.map((row) => mapRow(row)), [rows]);
  const balanceSheetRows = useMemo(() => mappedRows.filter((item) => item.row.statement === "balance_sheet"), [mappedRows]);
  const incomeStatementRows = useMemo(() => mappedRows.filter((item) => item.row.statement === "income_statement"), [mappedRows]);
  const fixedAssetSchedule = useMemo(
    () => buildFixedAssetScheduleSummary(periods, fixedAssetScheduleRows),
    [fixedAssetScheduleRows, periods],
  );
  const shouldShowFixedAssetSchedule = isFixedAssetScheduleEnabled || fixedAssetScheduleRows.length > 0;
  const snapshot = useMemo(
    () => buildSnapshot(periods, activePeriodId, rows, assumptions, fixedAssetScheduleRows),
    [periods, activePeriodId, rows, assumptions, fixedAssetScheduleRows],
  );
  const results = useMemo(() => calculateAllMethods(snapshot), [snapshot]);
  const sectionAnalysis = useMemo(
    () => buildSectionAnalysis(periods, rows, assumptions, fixedAssetScheduleRows),
    [periods, rows, assumptions, fixedAssetScheduleRows],
  );
  const balanceSheetView = useMemo(
    () => buildBalanceSheetView(periods, mappedRows, fixedAssetSchedule),
    [fixedAssetSchedule, mappedRows, periods],
  );
  const incomeStatementView = useMemo(
    () => buildIncomeStatementView(periods, incomeStatementRows, fixedAssetSchedule),
    [fixedAssetSchedule, incomeStatementRows, periods],
  );
  const methodCards = [results.aam, results.eem, results.dcf];
  const activePeriod = periods.find((period) => period.id === activePeriodId) ?? getDefaultActivePeriod(periods);
  const taxRateCandidates = useMemo(() => buildTaxRateCandidates(activePeriod?.valuationDate ?? ""), [activePeriod?.valuationDate]);
  const assumptionDriverSummaries = [
    buildAssumptionDriverSummary("Tax rate", assumptions.taxRate, assumptions.taxRateSource, taxRateCandidates),
    buildAssumptionDriverSummary("WACC", assumptions.wacc, assumptions.waccSource, waccCandidates),
    buildAssumptionDriverSummary("Terminal growth", assumptions.terminalGrowth, assumptions.terminalGrowthSource, terminalGrowthCandidates),
    buildAssumptionDriverSummary(
      "Required return on NTA",
      assumptions.requiredReturnOnNta,
      assumptions.requiredReturnOnNtaSource,
      requiredReturnOnNtaCandidates,
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
    isFixedAssetScheduleEnabled ||
    fixedAssetScheduleRows.length > 0 ||
    fixedAssetSchedule.hasInput ||
    periods.length !== 1 ||
    periods.some(
      (period) =>
        getPeriodYearOffset(period) !== 0 ||
        period.label !== getPeriodLabel(0) ||
        period.valuationDate,
    ) ||
    Object.values(assumptions).some((value) => value.trim() !== "");
  const checks = buildValidationChecks(rows, mappedRows, assumptions, snapshot, balanceSheetGap, fixedAssetSchedule);
  const readiness = useMemo(
    () => buildWorkbenchReadiness({ periods, rows, mappedRows, assumptions, snapshot, fixedAssetSchedule }),
    [assumptions, fixedAssetSchedule, mappedRows, periods, rows, snapshot],
  );

  function getCurrentCoreState(): WorkbenchCoreState {
    return {
      periods,
      activePeriodId,
      rows,
      isFixedAssetScheduleEnabled,
      fixedAssetScheduleRows,
      assumptions,
    };
  }

  function applyCoreState(state: WorkbenchCoreState) {
    setPeriods(state.periods);
    setActivePeriodId(state.activePeriodId);
    setRows(state.rows);
    setIsFixedAssetScheduleEnabled(state.isFixedAssetScheduleEnabled);
    setFixedAssetScheduleRows(state.fixedAssetScheduleRows);
    setAssumptions(state.assumptions);
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
      setAssumptions(storedState.assumptions);
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
      assumptions,
    });
  }, [activePeriodId, assumptions, fixedAssetScheduleRows, isDraftRestored, isFixedAssetScheduleEnabled, periods, rows]);

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

  function loadFixedAssetTemplate() {
    commitCoreState((current) => ({ ...current, isFixedAssetScheduleEnabled: true }));
  }

  function addFixedAssetScheduleRow() {
    commitCoreState((current) => ({
      ...current,
      isFixedAssetScheduleEnabled: true,
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

  function loadSample() {
    const samplePeriods = buildSamplePeriods();
    commitCoreState((current) => ({
      ...current,
      periods: samplePeriods,
      activePeriodId: "p2021",
      rows: buildSampleRows(),
      isFixedAssetScheduleEnabled: false,
      fixedAssetScheduleRows: [],
      assumptions: buildSampleAssumptions(),
    }));
  }

  function resetForm() {
    clearPersistedWorkbenchState();
    commitCoreState(() => ({
      periods: initialPeriods,
      activePeriodId: initialPeriods[0].id,
      rows: [],
      isFixedAssetScheduleEnabled: false,
      fixedAssetScheduleRows: [],
      assumptions: emptyAssumptions,
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
            <div className="brand-mark">PVB</div>
            <div className="brand-copy">
              <p className="eyebrow">Penilaian Valuasi Bisnis</p>
              <h1>Ruang Kerja Dinamis</h1>
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
          <header className="topbar">
            <div>
              <p className="eyebrow">100% equity · controlling marketable basis · no DLOM/DLOC</p>
              <h2>Input Akun Fleksibel</h2>
            </div>
            <div className="toolbar">
              <button className="icon-button" type="button" onClick={undoCoreChange} disabled={undoStack.length === 0} title="Undo perubahan data">
                <Undo2 size={18} />
              </button>
              <button className="icon-button" type="button" onClick={redoCoreChange} disabled={redoStack.length === 0} title="Redo perubahan data">
                <Redo2 size={18} />
              </button>
              <button className="button secondary" type="button" onClick={loadSample}>
                <Upload size={18} />
                Muat contoh workbook
              </button>
              <button className="button ghost" type="button" onClick={resetForm} disabled={!hasAnyInput}>
                <Eraser size={18} />
                Kosongkan
              </button>
            </div>
          </header>

          <div className="workflow-tabs mobile-workflow-tabs" role="tablist" aria-label="Workflow valuasi">
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
              <h3>Periode input</h3>
            </div>
            <button className="button secondary" type="button" onClick={addPeriod}>
              <Plus size={18} />
              Tambah {nextHistoricalPeriodLabel}
            </button>
          </div>
          <ReadinessPanel status={readiness.periods} onNavigate={navigateToWorkflowTab} />
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
                      <span>Tanggal valuasi</span>
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
              <h3>Neraca dan fixed asset</h3>
            </div>
            <div className="toolbar">
              <button className="button secondary" type="button" onClick={loadFixedAssetTemplate}>
                <Plus size={18} />
                Fixed Asset Schedule
              </button>
            </div>
          </div>
          <ReadinessPanel status={readiness.balance} onNavigate={navigateToWorkflowTab} />

          {shouldShowFixedAssetSchedule ? (
            <FixedAssetScheduleEditor
              periods={periods}
              schedule={fixedAssetSchedule}
              onAddRow={addFixedAssetScheduleRow}
              onRemoveRow={removeFixedAssetScheduleRow}
              onUpdateRow={updateFixedAssetScheduleRow}
              onUpdateValue={updateFixedAssetScheduleValue}
            />
          ) : null}

          <div className="subpanel-heading account-input-heading">
            <div>
              <p className="eyebrow">Balance Sheet</p>
              <h4>Akun neraca manual</h4>
            </div>
            <button className="button secondary" type="button" onClick={() => addRow("balance_sheet")}>
              <Plus size={18} />
              Balance Sheet
            </button>
          </div>

          <AccountInputTable
            emptyMessage="Belum ada akun neraca. Tambahkan baris dari tombol Balance Sheet di atas."
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
              Balance Sheet
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
              Income Statement
            </button>
          </div>
          <ReadinessPanel status={readiness.income} onNavigate={navigateToWorkflowTab} />
          <AccountInputTable
            emptyMessage="Belum ada akun laba rugi. Tambahkan baris Income Statement."
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
              Income Statement
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

        {activeWorkflowTab === "assumptions" ? (
        <section id="assumptions" className="panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Asumsi</p>
              <h3>Driver model</h3>
            </div>
          </div>
          <ReadinessPanel status={readiness.assumptions} onNavigate={navigateToWorkflowTab} />
          <div className="assumption-control-grid">
            <AssumptionDriverCard
              label="Tax rate"
              value={assumptions.taxRate}
              sourceId={assumptions.taxRateSource}
              reason={assumptions.taxRateOverrideReason}
              candidates={taxRateCandidates}
              emptyCandidateText="Isi tanggal valuasi di tab Periode untuk memunculkan statutory general rate."
              manualHint="Override fasilitas khusus wajib diberi alasan."
              onSelect={(candidate) => applyAssumptionCandidate("taxRate", candidate)}
              onValueChange={(value) => updateAssumption("taxRate", value)}
              onReasonChange={(value) => updateAssumptionText("taxRateOverrideReason", value)}
            />
            <AssumptionDriverCard
              label="WACC"
              value={assumptions.wacc}
              sourceId={assumptions.waccSource}
              reason={assumptions.waccOverrideReason}
              candidates={waccCandidates}
              emptyCandidateText="Belum ada kandidat WACC."
              manualHint="Pilih kandidat aktif atau isi override beralasan."
              onSelect={(candidate) => applyAssumptionCandidate("wacc", candidate)}
              onValueChange={(value) => updateAssumption("wacc", value)}
              onReasonChange={(value) => updateAssumptionText("waccOverrideReason", value)}
            />
            <AssumptionDriverCard
              label="Terminal growth"
              value={assumptions.terminalGrowth}
              sourceId={assumptions.terminalGrowthSource}
              reason={assumptions.terminalGrowthOverrideReason}
              candidates={terminalGrowthCandidates}
              emptyCandidateText="Belum ada skenario terminal growth."
              manualHint="Terminal growth adalah assumption/sensitivity; override wajib dijelaskan."
              onSelect={(candidate) => applyAssumptionCandidate("terminalGrowth", candidate)}
              onValueChange={(value) => updateAssumption("terminalGrowth", value)}
              onReasonChange={(value) => updateAssumptionText("terminalGrowthOverrideReason", value)}
            />
            <AssumptionDriverCard
              label="Required return on NTA"
              value={assumptions.requiredReturnOnNta}
              sourceId={assumptions.requiredReturnOnNtaSource}
              reason={assumptions.requiredReturnOnNtaOverrideReason}
              candidates={requiredReturnOnNtaCandidates}
              emptyCandidateText="Belum ada kandidat required return."
              manualHint="Override required return berdampak langsung ke EEM."
              onSelect={(candidate) => applyAssumptionCandidate("requiredReturnOnNta", candidate)}
              onValueChange={(value) => updateAssumption("requiredReturnOnNta", value)}
              onReasonChange={(value) => updateAssumptionText("requiredReturnOnNtaOverrideReason", value)}
            />
          </div>
          <div className="assumption-form-grid compact-driver-grid">
            <AssumptionInput label="Revenue growth override" value={assumptions.revenueGrowth} onChange={(value) => updateAssumption("revenueGrowth", value)} />
            <AssumptionInput label="AR days" value={assumptions.arDays} onChange={(value) => updateAssumption("arDays", value)} />
            <AssumptionInput label="Inventory days" value={assumptions.inventoryDays} onChange={(value) => updateAssumption("inventoryDays", value)} />
            <AssumptionInput label="AP days" value={assumptions.apDays} onChange={(value) => updateAssumption("apDays", value)} />
            <AssumptionInput
              label="Other payable days"
              value={assumptions.otherPayableDays}
              onChange={(value) => updateAssumption("otherPayableDays", value)}
            />
          </div>
        </section>
        ) : null}

        {activeWorkflowTab === "valuation" ? (
        readiness.valuation.isReady ? (
        <>
        <section id="summary" className="section-grid">
          {methodCards.map((method) => (
            <article className="metric-card" key={method.method}>
              <div className="card-title">
                <Calculator size={20} />
                <span>{method.method}</span>
              </div>
              <strong>{formatIdr(method.equityValue)}</strong>
              <p>{activePeriod?.label || "Periode aktif"} · Equity Value 100%</p>
            </article>
          ))}
        </section>

        <section className="active-driver-strip" aria-label="Driver aktif valuasi">
          {assumptionDriverSummaries.map((driver) => (
            <div key={driver.label}>
              <span>{driver.label}</span>
              <strong>{driver.valueLabel}</strong>
              <small>{driver.sourceLabel}</small>
            </div>
          ))}
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
              <h3>Cakupan skenario final Excel</h3>
            </div>
          </div>
          <div className="sensitivity-grid">
            <div>
              <span>DCF base</span>
              <strong>{formatIdr(results.dcf.equityValue)}</strong>
            </div>
            <div>
              <span>DCF g -6,20%</span>
              <strong>{formatIdr(results.sensitivities.dcfNegativeGrowth.equityValue)}</strong>
            </div>
            <div>
              <span>DCF g 3%</span>
              <strong>{formatIdr(results.sensitivities.dcfGrowth3.equityValue)}</strong>
            </div>
            <div>
              <span>DCF no incremental WC</span>
              <strong>{formatIdr(results.sensitivities.dcfNoIncrementalWorkingCapital.equityValue)}</strong>
            </div>
            <div>
              <span>DCF tax payable debt-like</span>
              <strong>{formatIdr(results.sensitivities.dcfTaxPayableDebtLike.equityValue)}</strong>
            </div>
            <div>
              <span>EEM tax payable debt-like</span>
              <strong>{formatIdr(results.sensitivities.eemTaxPayableDebtLike.equityValue)}</strong>
            </div>
          </div>
        </section>

        <section id="aam" className="split-panel">
          <article className="panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">AAM trace</p>
                <h3>Asset accumulation method</h3>
              </div>
              <Banknote size={22} />
            </div>
            <FormulaList traces={results.aam.traces} />
          </article>

          <article id="eem" className="panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">EEM trace</p>
                <h3>Excess earning method</h3>
              </div>
              <FileSearch size={22} />
            </div>
            <FormulaList traces={results.eem.traces} />
          </article>
        </section>

        <section id="dcf" className="split-panel">
          <article className="panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">DCF trace</p>
                <h3>Discounted cash flow</h3>
              </div>
              <TableProperties size={22} />
            </div>
            <FormulaList traces={results.dcf.traces} />
          </article>

          <article className="panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Proyeksi</p>
                <h3>FCFF projection</h3>
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
          <ReadinessPanel status={readiness.valuation} onNavigate={navigateToWorkflowTab} force />
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
              <dt>Tanggal valuasi</dt>
              <dd>{formatDisplayDate(snapshot.valuationDate) || "Belum diisi"}</dd>
            </div>
            <div>
              <dt>Akun terpetakan</dt>
              <dd>{mappedRows.filter((item) => item.effectiveCategory !== "UNMAPPED").length}</dd>
            </div>
            <div>
              <dt>Adjusted total assets</dt>
              <dd>{formatIdr(results.adjustedTotalAssets)}</dd>
            </div>
            <div>
              <dt>Fixed asset net value</dt>
              <dd>{formatIdr(snapshot.fixedAssetsNet)}</dd>
            </div>
            <div>
              <dt>Adjusted total liabilities</dt>
              <dd>{formatIdr(results.adjustedTotalLiabilities)}</dd>
            </div>
            <div>
              <dt>Book equity components</dt>
              <dd>{formatIdr(equityBookComponents)}</dd>
            </div>
            <div>
              <dt>Balance sheet gap</dt>
              <dd>{formatIdr(balanceSheetGap)}</dd>
            </div>
            <div>
              <dt>Commercial EBIT</dt>
              <dd>{formatIdr(snapshot.ebit)}</dd>
            </div>
            <div>
              <dt>Tax rate</dt>
              <dd>{formatPercent(snapshot.taxRate)}</dd>
            </div>
            <div>
              <dt>Revenue growth driver</dt>
              <dd>{formatPercent(snapshot.revenueGrowth)}</dd>
            </div>
            <div>
              <dt>COGS margin driver</dt>
              <dd>{formatPercent(snapshot.cogsMargin)}</dd>
            </div>
            <div>
              <dt>Opex margin driver</dt>
              <dd>{formatPercent(snapshot.gaMargin)}</dd>
            </div>
            <div>
              <dt>Depreciation margin driver</dt>
              <dd>{formatPercent(snapshot.depreciationMargin)}</dd>
            </div>
            <div>
              <dt>Operating working capital</dt>
              <dd>{formatIdr(results.operatingWorkingCapital)}</dd>
            </div>
            <div>
              <dt>Interest-bearing debt</dt>
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

function PayablesCashFlowSection({ analysis }: { analysis: SectionAnalysis }) {
  return (
    <>
      <section className="split-panel">
        <article className="panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">ACC PAYABLES</p>
              <h3>Debt and payable movement schedule</h3>
            </div>
            <span className="status-pill muted">Corrected movement basis</span>
          </div>
          <AnalysisTable rows={analysis.payablesRows} periods={analysis.periods} />
        </article>

        <article className="panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Workbook audit reference</p>
              <h3>Cash-flow source issue</h3>
            </div>
          </div>
          <WorkbookAuditReference keys={["equityInjectionSource", "correctedEquityInjectionMovement", "cashFlowRollforwardGap"]} />
        </article>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">CASH FLOW STATEMENT</p>
            <h3>Corrected cash-flow bridge</h3>
          </div>
          <span className="status-pill muted">Movement antar periode</span>
        </div>
        <AnalysisTable rows={analysis.cashFlowRows} periods={analysis.periods} />
      </section>
    </>
  );
}

function NoplatFcfSection({ analysis }: { analysis: SectionAnalysis }) {
  return (
    <>
      <section className="split-panel">
        <article className="panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">NOPLAT</p>
              <h3>Normalized operating profit after tax</h3>
            </div>
            <span className="status-pill muted">Commercial statutory basis</span>
          </div>
          <AnalysisTable rows={analysis.noplatRows} periods={analysis.periods} />
        </article>

        <article className="panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Workbook audit reference</p>
              <h3>NOPLAT bridge</h3>
            </div>
          </div>
          <WorkbookAuditReference keys={["sourceNoplat", "normalizedNoplat", "sourceFcf2021"]} />
        </article>
      </section>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">FCF</p>
            <h3>Free cash flow to firm</h3>
          </div>
          <span className="status-pill muted">NOPLAT + depreciation + WC - capex</span>
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
  return (
    <>
      <ReadinessPanel status={readiness} onNavigate={onNavigate} />

      <section className="panel">
        <div className="panel-heading">
          <div>
            <p className="eyebrow">FINANCIAL RATIO</p>
            <h3>Profitability · liquidity · leverage · cash flow</h3>
          </div>
          <span className="status-pill muted">Average mengikuti periode tersedia</span>
        </div>
        <RatioTable rows={analysis.ratioRows} periods={analysis.periods} />
      </section>

      <section className="split-panel">
        <article className="panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">ROIC</p>
              <h3>Capital efficiency bridge</h3>
            </div>
            <span className="status-pill muted">Corrected NOPLAT basis</span>
          </div>
          <AnalysisTable rows={analysis.roicRows} periods={analysis.periods} percentRowKeys={new Set(["roic"])} />
        </article>

        <article className="panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Workbook audit reference</p>
              <h3>ROIC cash classification</h3>
            </div>
          </div>
          <WorkbookAuditReference keys={["sourceRoicExcessCash", "operatingNwc2021", "correctedEem", "correctedDcf"]} />
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
            <th>Ratio</th>
            <th>Formula</th>
            {periods.map((period) => (
              <th className="period-column" key={period.id}>
                {period.label || "Periode"}
              </th>
            ))}
            <th>Average</th>
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

function WorkbookAuditReference({ keys }: { keys: Array<keyof typeof workbookAuditFixture.values> }) {
  return (
    <div className="audit-reference">
      <div className="audit-reference-source">
        <strong>{workbookAuditFixture.sourceWorkbook}</strong>
        <span>{workbookAuditFixture.sourceSummary}</span>
      </div>
      <div className="audit-reference-grid">
        {keys.map((key) => (
          <div key={key}>
            <span>{formatFixtureLabel(key)}</span>
            <strong>{formatIdr(workbookAuditFixture.values[key])}</strong>
          </div>
        ))}
      </div>
      <ul>
        {workbookAuditFixture.notes.map((note) => (
          <li key={note}>{note}</li>
        ))}
      </ul>
    </div>
  );
}

function formatAnalysisValue(value: AnalysisValue, display: "currency" | "percent" | "multiple"): string {
  if (value === null || !Number.isFinite(value)) {
    return "Perlu data pembanding";
  }

  if (display === "percent") {
    return formatPercent(value);
  }

  if (display === "multiple") {
    return `${value.toFixed(2)}x`;
  }

  return formatIdr(value);
}

function formatFixtureLabel(key: keyof typeof workbookAuditFixture.values): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/2021/g, " 2021")
    .replace(/\b\w/g, (match) => match.toUpperCase())
    .trim();
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
    const assumptions = sanitizeAssumptions(parsed.assumptions);
    const activePeriodId = typeof parsed.activePeriodId === "string" ? parsed.activePeriodId : "";
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
      assumptions,
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

function sanitizeAssumptions(value: unknown): AssumptionState {
  const source = isRecord(value) ? value : {};
  return Object.fromEntries(
    assumptionKeys.map((key) => [key, typeof source[key] === "string" ? source[key] : ""]),
  ) as AssumptionState;
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
            <tr className="balance-check-row">
              <td>Check</td>
              <td>Model</td>
              <td>Assets - Liabilities - Equity</td>
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
          <h4>Revenue · EBITDA · EBIT · Net Profit After Tax</h4>
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
                            : "Khusus Balance Sheet"}
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
        <span className="impact-chip">Treatment: {profile.treatment}</span>
        <span className="impact-chip">Sign: {profile.signBehavior}</span>
        {row.categoryOverride ? <span className="impact-chip warning">Manual override</span> : null}
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

function AssumptionDriverCard({
  label,
  value,
  sourceId,
  reason,
  candidates,
  emptyCandidateText,
  manualHint,
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
    <article className="assumption-driver-card" data-testid={`assumption-card-${slugifyLabel(label)}`}>
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
      <div className="candidate-list" aria-label={`${label} candidates`}>
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
          <dd>{activeCandidate?.formula ?? "Manual override"}</dd>
        </div>
        <div>
          <dt>Catatan</dt>
          <dd>{activeCandidate?.note ?? manualHint}</dd>
        </div>
      </dl>
      <label className="field manual-driver-field" htmlFor={inputId}>
        <span>Manual override</span>
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

function AssumptionInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  const inputId = `assumption-${slugifyLabel(label)}`;

  return (
    <label className="field" htmlFor={inputId}>
      <span>{label}</span>
      <input id={inputId} inputMode="decimal" placeholder="Opsional" value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
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

function sourceLabel(candidate: AssumptionCandidate): string {
  const source = candidate.sourceCell ? `${candidate.source} · ${candidate.sourceCell}` : candidate.source;
  return `${candidate.label} · ${source}`;
}

function sourceLabelFromManual(value: string): string {
  return value.trim() ? "Manual override / legacy input" : "Belum dipilih";
}

function formatRateInput(input: string): string {
  const rate = parseRateInput(input);
  return rate === null ? "Belum dipilih" : formatPercent(rate);
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
          <p className="eyebrow">Fixed Asset Schedule</p>
          <h4>A. Acquisition Costs · B. Depreciation · Net Value</h4>
        </div>
        <div className="toolbar">
          <span className="status-pill muted">Ending dan net value otomatis</span>
          <button className="button ghost compact-button" type="button" onClick={onAddRow}>
            <Plus size={16} />
            Tambah kelas aset
          </button>
        </div>
      </div>

      {schedule.rows.length === 0 ? (
        <div className="empty-state" data-testid="fixed-asset-empty">Belum ada kelas aset. Gunakan tombol Tambah kelas aset untuk mulai menginput fixed asset.</div>
      ) : (
        <>
          <FixedAssetSectionTable
            title="A. Acquisition Costs"
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
            title="B. Depreciation"
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
  return (
    <div className="fixed-asset-section">
      <h5>{title}</h5>
      <div className="table-wrap fixed-asset-table-wrap">
        <table className="fixed-asset-table" data-testid={title.startsWith("A.") ? "fixed-asset-acquisition-table" : "fixed-asset-depreciation-table"}>
          <thead>
            <tr>
              <th rowSpan={2}>Asset class</th>
              {periods.map((period) => (
                <th colSpan={3} key={period.id}>
                  {period.label || "Periode"}
                </th>
              ))}
            </tr>
            <tr>
              {periods.map((period) => (
                <Fragment key={period.id}>
                  <th>Beginning</th>
                  <th>Additions</th>
                  <th>Ending</th>
                </Fragment>
              ))}
            </tr>
          </thead>
          <tbody>
            {schedule.rows.map(({ row, amounts }) => (
              <tr data-testid="fixed-asset-row" key={row.id}>
                <td>
                  <div className="asset-name-cell">
                    <input
                      aria-label="Asset class"
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
                {periods.map((period) => {
                  const values = row.values[period.id] ?? emptyFixedAssetInputValues();
                  const computed = amounts[period.id] ?? emptyFixedAssetAmounts();
                  const isManualBeginning = period.id === firstPeriodId;

                  return (
                    <Fragment key={period.id}>
                      <td>
                        {isManualBeginning ? (
                          <input
                            aria-label={`${title} ${period.label || "Periode"} Beginning`}
                            inputMode="decimal"
                            value={values[beginningKey] ?? ""}
                            onChange={(event) => onUpdateValue(row.id, period.id, beginningKey, event.target.value)}
                            placeholder="0"
                          />
                        ) : (
                          <output>{formatInputNumber(computed[beginningKey])}</output>
                        )}
                      </td>
                      <td>
                        <input
                          aria-label={`${title} ${period.label || "Periode"} Additions`}
                          inputMode="decimal"
                          value={values[additionsKey] ?? ""}
                          onChange={(event) => onUpdateValue(row.id, period.id, additionsKey, event.target.value)}
                          placeholder="0"
                        />
                      </td>
                      <td>
                        <output>{formatInputNumber(computed[endingKey])}</output>
                      </td>
                    </Fragment>
                  );
                })}
              </tr>
            ))}
            <tr className="total-row">
              <td>Total</td>
              {periods.map((period) => {
                const totals = schedule.totals[period.id] ?? emptyFixedAssetAmounts();

                return (
                  <Fragment key={period.id}>
                    <td>{formatInputNumber(totals[beginningKey])}</td>
                    <td>{formatInputNumber(totals[additionsKey])}</td>
                    <td>{formatInputNumber(totals[endingKey])}</td>
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
  return (
    <div className="fixed-asset-section">
      <h5>Net Value Fixed Assets</h5>
      <div className="table-wrap fixed-asset-table-wrap">
        <table className="fixed-asset-table net-value-table" data-testid="fixed-asset-net-value-table">
          <thead>
            <tr>
              <th>Asset class</th>
              {periods.map((period) => (
                <th key={period.id}>{period.label || "Periode"}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {schedule.rows.map(({ row, amounts }) => (
              <tr key={row.id}>
                <td>{row.assetName || "Belum dinamai"}</td>
                {periods.map((period) => {
                  const computed = amounts[period.id] ?? emptyFixedAssetAmounts();

                  return (
                    <td key={period.id}>
                      <output>{formatInputNumber(computed.netValue)}</output>
                    </td>
                  );
                })}
              </tr>
            ))}
            <tr className="total-row">
              <td>Total</td>
              {periods.map((period) => (
                <td key={period.id}>{formatInputNumber((schedule.totals[period.id] ?? emptyFixedAssetAmounts()).netValue)}</td>
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
          <span>{formatIdr(trace.value)}</span>
        </div>
      ))}
    </div>
  );
}
