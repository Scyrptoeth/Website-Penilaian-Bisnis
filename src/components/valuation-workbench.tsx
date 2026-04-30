"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
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
  TableProperties,
  Trash2,
  Upload,
} from "lucide-react";
import { accountMappingRules } from "@/lib/valuation/account-taxonomy";
import { calculateAllMethods } from "@/lib/valuation/calculations";
import {
  buildDefaultFixedAssetScheduleRows,
  buildFixedAssetScheduleSummary,
  buildSampleAssumptions,
  buildSamplePeriods,
  buildSampleRows,
  buildSnapshot,
  createFixedAssetScheduleRow,
  createRow,
  emptyAssumptions,
  ensureFixedAssetSchedulePeriods,
  fixedAssetScheduleValueKeys,
  getChronologicalPeriods,
  initialPeriods,
  mapRow,
  statementLabels,
  type AccountRow,
  type AssumptionState,
  type FixedAssetPeriodAmounts,
  type FixedAssetScheduleRow,
  type FixedAssetScheduleSummary,
  type FixedAssetScheduleValueKey,
  type MappedRow,
  type Period,
  type StatementType,
} from "@/lib/valuation/case-model";
import { formatDisplayDate, formatEditableNumber, formatIdr, formatInputNumber, formatPercent, formatScore } from "@/lib/valuation/format";
import type { AccountCategory, FinancialStatementSnapshot, FormulaTrace } from "@/lib/valuation/types";

const categoryOptions: Array<{ value: AccountCategory; label: string }> = [
  { value: "UNMAPPED", label: "Perlu ditinjau / belum dipetakan" },
  { value: "TOTAL_ASSETS", label: "Total assets override" },
  { value: "CURRENT_ASSET", label: "Current asset - broad" },
  { value: "CASH_ON_HAND", label: "Cash on hand / kas" },
  { value: "CASH_ON_BANK", label: "Cash on bank / deposit" },
  { value: "ACCOUNT_RECEIVABLE", label: "Account receivable" },
  { value: "EMPLOYEE_RECEIVABLE", label: "Employee / related-party receivable" },
  { value: "INVENTORY", label: "Inventory" },
  { value: "FIXED_ASSET", label: "Fixed asset net value" },
  { value: "FIXED_ASSET_ACQUISITION", label: "Fixed asset acquisition cost" },
  { value: "ACCUMULATED_DEPRECIATION", label: "Accumulated depreciation" },
  { value: "INTANGIBLE_ASSETS", label: "Intangible assets" },
  { value: "NON_CURRENT_ASSET", label: "Non-current asset - broad" },
  { value: "TOTAL_LIABILITIES", label: "Total liabilities override" },
  { value: "CURRENT_LIABILITIES", label: "Current liabilities - broad" },
  { value: "BANK_LOAN_SHORT_TERM", label: "Bank loan - short term" },
  { value: "ACCOUNT_PAYABLE", label: "Account payable" },
  { value: "TAX_PAYABLE", label: "Tax payable" },
  { value: "OTHER_PAYABLE", label: "Other payable" },
  { value: "BANK_LOAN_LONG_TERM", label: "Bank loan - long term" },
  { value: "NON_CURRENT_LIABILITIES", label: "Non-current liabilities - broad" },
  { value: "MODAL_DISETOR", label: "Modal disetor" },
  { value: "PENAMBAHAN_MODAL_DISETOR", label: "Penambahan modal disetor" },
  { value: "RETAINED_EARNINGS_SURPLUS", label: "Retained earnings surplus" },
  { value: "RETAINED_EARNINGS_CURRENT_PROFIT", label: "Retained earnings current profit" },
  { value: "REVENUE", label: "Revenue" },
  { value: "COST_OF_GOOD_SOLD", label: "Cost of goods sold" },
  { value: "SELLING_EXPENSE", label: "Selling expense" },
  { value: "GENERAL_ADMINISTRATIVE_OVERHEADS", label: "General & administrative expense" },
  { value: "OPERATING_EXPENSE", label: "Operating expense - other" },
  { value: "DEPRECIATION_EXPENSE", label: "Depreciation expense" },
  { value: "EBIT", label: "Commercial EBIT override" },
  { value: "COMMERCIAL_NPAT", label: "Commercial NPAT" },
  { value: "INTEREST_INCOME", label: "Interest income" },
  { value: "INTEREST_EXPENSE", label: "Interest expense" },
  { value: "NON_OPERATING_INCOME", label: "Non-operating income / expense" },
  { value: "NON_OPERATING_FIXED_ASSETS", label: "Non-operating fixed assets" },
  { value: "EXCESS_CASH", label: "Excess cash" },
  { value: "MARKETABLE_SECURITIES", label: "Marketable securities" },
  { value: "INTEREST_PAYABLE", label: "Interest payable" },
  { value: "INTEREST_BEARING_DEBT", label: "Interest-bearing debt" },
  { value: "SURPLUS_ASSET_CASH", label: "Surplus asset cash" },
  { value: "WORKING_CAPITAL", label: "Working capital support" },
  { value: "CASH_FLOW_FROM_FINANCING", label: "Cash flow from financing" },
  { value: "CASH_FLOW_FROM_OPERATIONS", label: "Cash flow from operations" },
  { value: "CASH_FLOW_FROM_NON_OPERATIONS", label: "Cash flow from non-operations" },
  { value: "CASH_FLOW_AVAILABLE_TO_INVESTOR", label: "Cash flow available to investor" },
];

const categoryLabelMap = new Map(categoryOptions.map((option) => [option.value, option.label]));
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
  "terminalGrowth",
  "revenueGrowth",
  "wacc",
  "requiredReturnOnNta",
  "arDays",
  "inventoryDays",
  "apDays",
  "otherPayableDays",
];
const WORKBENCH_STORAGE_KEY = "penilaian-valuasi-bisnis.workbench.v1";
const WORKBENCH_SCROLL_STORAGE_KEY = "penilaian-valuasi-bisnis.scroll.v1";
const WORKBENCH_SIDEBAR_STORAGE_KEY = "penilaian-valuasi-bisnis.sidebar.v1";
const WORKBENCH_STORAGE_VERSION = 1;

type PersistedWorkbenchState = {
  version: typeof WORKBENCH_STORAGE_VERSION;
  savedAt: string;
  periods: Period[];
  activePeriodId: string;
  rows: AccountRow[];
  fixedAssetScheduleRows: FixedAssetScheduleRow[];
  assumptions: AssumptionState;
};

const sectionLinks = [
  { href: "#periods", label: "Periode" },
  { href: "#accounts", label: "Akun" },
  { href: "#mapping", label: "Pemetaan" },
  { href: "#summary", label: "Ringkasan" },
  { href: "#aam", label: "AAM" },
  { href: "#eem", label: "EEM" },
  { href: "#dcf", label: "DCF" },
  { href: "#audit", label: "Audit" },
];

export function ValuationWorkbench() {
  const [periods, setPeriods] = useState<Period[]>(initialPeriods);
  const [activePeriodId, setActivePeriodId] = useState(initialPeriods[0].id);
  const [rows, setRows] = useState<AccountRow[]>([]);
  const [fixedAssetScheduleRows, setFixedAssetScheduleRows] = useState<FixedAssetScheduleRow[]>([]);
  const [assumptions, setAssumptions] = useState<AssumptionState>(emptyAssumptions);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isDraftRestored, setIsDraftRestored] = useState(false);

  const mappedRows = useMemo(() => rows.map((row) => mapRow(row)), [rows]);
  const fixedAssetSchedule = useMemo(
    () => buildFixedAssetScheduleSummary(periods, fixedAssetScheduleRows),
    [fixedAssetScheduleRows, periods],
  );
  const snapshot = useMemo(
    () => buildSnapshot(periods, activePeriodId, rows, assumptions, fixedAssetScheduleRows),
    [periods, activePeriodId, rows, assumptions, fixedAssetScheduleRows],
  );
  const results = useMemo(() => calculateAllMethods(snapshot), [snapshot]);
  const methodCards = [results.aam, results.eem, results.dcf];
  const activePeriod = periods.find((period) => period.id === activePeriodId) ?? periods[0];
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
    periods.some((period) => period.label !== "Tahun 1" || period.valuationDate) ||
    Object.values(assumptions).some((value) => value.trim() !== "");
  const checks = buildValidationChecks(rows, mappedRows, assumptions, snapshot, balanceSheetGap, fixedAssetSchedule);

  useEffect(() => {
    const storedState = readPersistedWorkbenchState();

    if (storedState) {
      const nextPeriods = storedState.periods.length > 0 ? storedState.periods : initialPeriods;
      const nextActivePeriodId = nextPeriods.some((period) => period.id === storedState.activePeriodId)
        ? storedState.activePeriodId
        : nextPeriods[0].id;

      setPeriods(nextPeriods);
      setActivePeriodId(nextActivePeriodId);
      setRows(storedState.rows);
      setFixedAssetScheduleRows(storedState.fixedAssetScheduleRows);
      setAssumptions(storedState.assumptions);
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
      fixedAssetScheduleRows,
      assumptions,
    });
  }, [activePeriodId, assumptions, fixedAssetScheduleRows, isDraftRestored, periods, rows]);

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
    const period: Period = {
      id: `p${Date.now()}`,
      label: `Tahun ${periods.length + 1}`,
      valuationDate: "",
    };
    const nextPeriods = [...periods, period];

    setPeriods(nextPeriods);
    setFixedAssetScheduleRows((current) => ensureFixedAssetSchedulePeriods(current, nextPeriods));
    setActivePeriodId(period.id);
  }

  function updatePeriod(id: string, patch: Partial<Period>) {
    setPeriods((current) => current.map((period) => (period.id === id ? { ...period, ...patch } : period)));
  }

  function removePeriod(id: string) {
    if (periods.length === 1) {
      return;
    }

    const nextPeriods = periods.filter((period) => period.id !== id);
    setPeriods(nextPeriods);
    setRows((current) =>
      current.map((row) => {
        const { [id]: _removed, ...values } = row.values;
        return { ...row, values };
      }),
    );
    setFixedAssetScheduleRows((current) =>
      current.map((row) => {
        const { [id]: _removed, ...values } = row.values;
        return { ...row, values };
      }),
    );

    if (activePeriodId === id) {
      setActivePeriodId(nextPeriods[nextPeriods.length - 1].id);
    }
  }

  function addRow(statement: StatementType = "balance_sheet") {
    setRows((current) => [createRow(statement, periods), ...current]);
  }

  function loadFixedAssetTemplate() {
    setFixedAssetScheduleRows((current) => {
      const existingNames = new Set(current.map((row) => normalizeAssetName(row.assetName)).filter(Boolean));
      const missingTemplateRows = buildDefaultFixedAssetScheduleRows(periods).filter((row) => !existingNames.has(normalizeAssetName(row.assetName)));

      if (current.length === 0) {
        return missingTemplateRows;
      }

      return missingTemplateRows.length > 0 ? [...current, ...missingTemplateRows] : current;
    });
  }

  function addFixedAssetScheduleRow() {
    setFixedAssetScheduleRows((current) => [createFixedAssetScheduleRow(periods), ...current]);
  }

  function updateFixedAssetScheduleRow(id: string, patch: Partial<FixedAssetScheduleRow>) {
    setFixedAssetScheduleRows((current) => current.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  }

  function updateFixedAssetScheduleValue(rowId: string, periodId: string, key: FixedAssetScheduleValueKey, value: string) {
    setFixedAssetScheduleRows((current) =>
      current.map((row) =>
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
    );
  }

  function removeFixedAssetScheduleRow(id: string) {
    setFixedAssetScheduleRows((current) => current.filter((row) => row.id !== id));
  }

  function updateRow(id: string, patch: Partial<AccountRow>) {
    setRows((current) => current.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  }

  function updateRowValue(rowId: string, periodId: string, value: string) {
    setRows((current) =>
      current.map((row) =>
        row.id === rowId ? { ...row, values: { ...row.values, [periodId]: formatEditableNumber(value) } } : row,
      ),
    );
  }

  function removeRow(id: string) {
    setRows((current) => current.filter((row) => row.id !== id));
  }

  function updateAssumption(key: keyof AssumptionState, value: string) {
    setAssumptions((current) => ({ ...current, [key]: formatEditableNumber(value) }));
  }

  function loadSample() {
    const samplePeriods = buildSamplePeriods();
    setPeriods(samplePeriods);
    setActivePeriodId("p2021");
    setRows(buildSampleRows());
    setFixedAssetScheduleRows([]);
    setAssumptions(buildSampleAssumptions());
  }

  function resetForm() {
    clearPersistedWorkbenchState();
    setPeriods(initialPeriods);
    setActivePeriodId(initialPeriods[0].id);
    setRows([]);
    setFixedAssetScheduleRows([]);
    setAssumptions(emptyAssumptions);

    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0 });
    }
  }

  return (
    <main className={isSidebarCollapsed ? "app-shell sidebar-collapsed" : "app-shell"}>
      {isSidebarCollapsed ? (
        <div className="sidebar-rail" aria-label="Navigasi ringkas">
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
            {sectionLinks.map((item) => (
              <a href={item.href} key={item.href}>
                {item.label}
              </a>
            ))}
          </nav>
        </aside>
      )}

      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">100% equity · controlling marketable basis · no DLOM/DLOC</p>
            <h2>Input Akun Fleksibel</h2>
          </div>
          <div className="toolbar">
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

        <section id="periods" className="panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Langkah 1</p>
              <h3>Periode input</h3>
            </div>
            <button className="button secondary" type="button" onClick={addPeriod}>
              <Plus size={18} />
              Tambah periode
            </button>
          </div>
          <div className="period-grid">
            {periods.map((period) => (
              <div className={period.id === activePeriodId ? "period-card active" : "period-card"} key={period.id}>
                <CalendarDays size={18} />
                <label>
                  <span>Label</span>
                  <input value={period.label} onChange={(event) => updatePeriod(period.id, { label: event.target.value })} />
                </label>
                <label>
                  <span>Tanggal valuasi</span>
                  <input
                    type="date"
                    value={period.valuationDate}
                    onChange={(event) => updatePeriod(period.id, { valuationDate: event.target.value })}
                  />
                </label>
                <div className="period-actions">
                  <button className="icon-button" type="button" onClick={() => setActivePeriodId(period.id)} title="Gunakan periode ini">
                    <CheckCircle2 size={18} />
                  </button>
                  <button
                    className="icon-button danger"
                    type="button"
                    onClick={() => removePeriod(period.id)}
                    disabled={periods.length === 1}
                    title="Hapus periode"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="accounts" className="panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Langkah 2</p>
              <h3>Akun dan nilai historis</h3>
            </div>
            <div className="toolbar">
              <button className="button secondary" type="button" onClick={() => addRow("balance_sheet")}>
                <Plus size={18} />
                Balance Sheet
              </button>
              <button className="button secondary" type="button" onClick={() => addRow("income_statement")}>
                <Plus size={18} />
                Income Statement
              </button>
              <button className="button secondary" type="button" onClick={loadFixedAssetTemplate}>
                <Plus size={18} />
                Fixed Asset Schedule
              </button>
            </div>
          </div>

          {fixedAssetScheduleRows.length > 0 ? (
            <FixedAssetScheduleEditor
              periods={periods}
              schedule={fixedAssetSchedule}
              onAddRow={addFixedAssetScheduleRow}
              onRemoveRow={removeFixedAssetScheduleRow}
              onUpdateRow={updateFixedAssetScheduleRow}
              onUpdateValue={updateFixedAssetScheduleValue}
            />
          ) : null}

          {rows.length === 0 ? (
            <div className="empty-state">
              {fixedAssetScheduleRows.length > 0 ? "Belum ada akun manual tambahan." : "Belum ada akun. Tambahkan baris dari tombol di atas."}
            </div>
          ) : (
            <div className="table-wrap">
              <table className="account-entry-table">
                <thead>
                  <tr>
                    <th>Sumber</th>
                    <th>Nama akun dari laporan</th>
                    <th>Kategori perhitungan</th>
                    {periods.map((period) => (
                      <th key={period.id}>{period.label || "Periode"}</th>
                    ))}
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {mappedRows.map(({ row, mapping, effectiveCategory }) => (
                    <tr key={row.id}>
                      <td>
                        <select
                          value={row.statement}
                          onChange={(event) => updateRow(row.id, { statement: event.target.value as StatementType })}
                        >
                          {Object.entries(statementLabels).map(([value, label]) => (
                            <option key={value} value={value}>
                              {label}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <input
                          className="account-name-input"
                          placeholder="Ketik nama akun sesuai laporan"
                          value={row.accountName}
                          onChange={(event) => updateRow(row.id, { accountName: event.target.value })}
                        />
                        <span className={mapping.needsReview ? "row-hint warning-text" : "row-hint ok-text"}>
                          {mapping.displayName} · {formatScore(mapping.confidence)}
                        </span>
                      </td>
                      <td>
                        <select
                          value={row.categoryOverride || effectiveCategory}
                          onChange={(event) => updateRow(row.id, { categoryOverride: event.target.value as AccountCategory })}
                        >
                          {categoryOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </td>
                      {periods.map((period) => (
                        <td key={period.id}>
                          <input
                            inputMode="decimal"
                            placeholder="0"
                            value={row.values[period.id] ?? ""}
                            onChange={(event) => updateRowValue(row.id, period.id, event.target.value)}
                          />
                        </td>
                      ))}
                      <td>
                        <button className="icon-button danger" type="button" onClick={() => removeRow(row.id)} title="Hapus akun">
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

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
            <MappingTable mappedRows={mappedRows} />
          </article>

          <article className="panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Asumsi</p>
                <h3>Driver model</h3>
              </div>
            </div>
            <div className="assumption-form-grid">
              <AssumptionInput label="Tax rate" value={assumptions.taxRate} onChange={(value) => updateAssumption("taxRate", value)} />
              <AssumptionInput label="Revenue growth override" value={assumptions.revenueGrowth} onChange={(value) => updateAssumption("revenueGrowth", value)} />
              <AssumptionInput label="Terminal growth" value={assumptions.terminalGrowth} onChange={(value) => updateAssumption("terminalGrowth", value)} />
              <AssumptionInput label="WACC" value={assumptions.wacc} onChange={(value) => updateAssumption("wacc", value)} />
              <AssumptionInput
                label="Required return on NTA"
                value={assumptions.requiredReturnOnNta}
                onChange={(value) => updateAssumption("requiredReturnOnNta", value)}
              />
              <AssumptionInput label="AR days" value={assumptions.arDays} onChange={(value) => updateAssumption("arDays", value)} />
              <AssumptionInput label="Inventory days" value={assumptions.inventoryDays} onChange={(value) => updateAssumption("inventoryDays", value)} />
              <AssumptionInput label="AP days" value={assumptions.apDays} onChange={(value) => updateAssumption("apDays", value)} />
              <AssumptionInput
                label="Other payable days"
                value={assumptions.otherPayableDays}
                onChange={(value) => updateAssumption("otherPayableDays", value)}
              />
            </div>
          </article>
        </section>

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

        <section id="audit" className="panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">Status model terhitung</p>
              <h3>Snapshot audit</h3>
            </div>
          </div>
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
      </section>
    </main>
  );
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

    if (!isRecord(parsed) || parsed.version !== WORKBENCH_STORAGE_VERSION) {
      return null;
    }

    const periods = sanitizePeriods(parsed.periods);
    const rows = sanitizeRows(parsed.rows);
    const fixedAssetScheduleRows = ensureFixedAssetSchedulePeriods(sanitizeFixedAssetScheduleRows(parsed.fixedAssetScheduleRows), periods);
    const assumptions = sanitizeAssumptions(parsed.assumptions);
    const activePeriodId = typeof parsed.activePeriodId === "string" ? parsed.activePeriodId : "";

    return {
      version: WORKBENCH_STORAGE_VERSION,
      savedAt: typeof parsed.savedAt === "string" ? parsed.savedAt : "",
      periods,
      activePeriodId,
      rows,
      fixedAssetScheduleRows,
      assumptions,
    };
  } catch {
    return null;
  }
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
        values: sanitizeStringRecord(row.values),
      },
    ];
  });
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

function normalizeAssetName(value: string): string {
  return value.trim().toLowerCase();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
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
            <th>Tingkat keyakinan</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {mappedRows.map(({ row, mapping, effectiveCategory }) => {
            const needsReview = effectiveCategory === "UNMAPPED" || (!row.categoryOverride && mapping.needsReview);

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

function AssumptionInput({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input inputMode="decimal" placeholder="Opsional" value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
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
    <div className="fixed-asset-editor">
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
        <table className="fixed-asset-table">
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
              <tr key={row.id}>
                <td>
                  <div className="asset-name-cell">
                    <input
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
        <table className="fixed-asset-table net-value-table">
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

function buildValidationChecks(
  rows: AccountRow[],
  mappedRows: MappedRow[],
  assumptions: AssumptionState,
  snapshot: FinancialStatementSnapshot,
  balanceSheetGap: number,
  fixedAssetSchedule: FixedAssetScheduleSummary,
): Array<{ label: string; ok: boolean }> {
  const hasEquityComponents =
    snapshot.paidUpCapital !== 0 ||
    snapshot.additionalPaidInCapital !== 0 ||
    snapshot.retainedEarningsSurplus !== 0 ||
    snapshot.retainedEarningsCurrentProfit !== 0;
  const balanceTolerance = Math.max(1, Math.abs(snapshot.totalAssets) * 0.001);
  const hasManualFixedAssetNet = mappedRows.some((item) => item.effectiveCategory === "FIXED_ASSET");
  const checks = [
    { label: "Akun sudah diinput", ok: rows.length > 0 || fixedAssetSchedule.hasInput },
    {
      label: "Pemetaan siap ditinjau",
      ok: fixedAssetSchedule.hasInput || mappedRows.some((item) => item.effectiveCategory !== "UNMAPPED"),
    },
    { label: "Neraca terisi", ok: snapshot.totalAssets !== 0 || snapshot.totalLiabilities !== 0 },
    { label: "Balance check", ok: !hasEquityComponents || Math.abs(balanceSheetGap) <= balanceTolerance },
    { label: "Laba rugi terisi", ok: snapshot.revenue !== 0 || snapshot.ebit !== 0 },
    { label: "Tax rate", ok: assumptions.taxRate.trim() !== "" },
    { label: "WACC", ok: assumptions.wacc.trim() !== "" },
  ];

  if (fixedAssetSchedule.hasInput) {
    checks.push(
      { label: "Jadwal aset tetap otomatis", ok: snapshot.fixedAssetsNet !== 0 },
      { label: "Tidak double count fixed asset", ok: !hasManualFixedAssetNet },
    );
  }

  return checks;
}
