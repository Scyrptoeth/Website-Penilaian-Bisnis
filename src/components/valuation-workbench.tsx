"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Banknote,
  Calculator,
  CalendarDays,
  CheckCircle2,
  Eraser,
  FileSearch,
  GitBranch,
  Plus,
  TableProperties,
  Trash2,
  Upload,
} from "lucide-react";
import { accountMappingRules } from "@/lib/valuation/account-taxonomy";
import { calculateAllMethods } from "@/lib/valuation/calculations";
import {
  buildSampleAssumptions,
  buildSamplePeriods,
  buildSampleRows,
  buildSnapshot,
  createRow,
  emptyAssumptions,
  initialPeriods,
  mapRow,
  statementLabels,
  type AccountRow,
  type AssumptionState,
  type MappedRow,
  type Period,
  type StatementType,
} from "@/lib/valuation/case-model";
import { formatIdr, formatPercent, formatScore } from "@/lib/valuation/format";
import type { AccountCategory, FinancialStatementSnapshot, FormulaTrace } from "@/lib/valuation/types";

const categoryOptions: Array<{ value: AccountCategory; label: string }> = [
  { value: "UNMAPPED", label: "Review / belum dimapping" },
  { value: "TOTAL_ASSETS", label: "Total assets override" },
  { value: "CURRENT_ASSET", label: "Current asset - broad" },
  { value: "CASH_ON_HAND", label: "Cash on hand / kas" },
  { value: "CASH_ON_BANK", label: "Cash on bank / deposit" },
  { value: "ACCOUNT_RECEIVABLE", label: "Account receivable" },
  { value: "EMPLOYEE_RECEIVABLE", label: "Employee receivable" },
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

export function ValuationWorkbench() {
  const [periods, setPeriods] = useState<Period[]>(initialPeriods);
  const [activePeriodId, setActivePeriodId] = useState(initialPeriods[0].id);
  const [rows, setRows] = useState<AccountRow[]>([]);
  const [assumptions, setAssumptions] = useState<AssumptionState>(emptyAssumptions);

  const mappedRows = useMemo(() => rows.map((row) => mapRow(row)), [rows]);
  const snapshot = useMemo(() => buildSnapshot(periods, activePeriodId, rows, assumptions), [periods, activePeriodId, rows, assumptions]);
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
    periods.some((period) => period.label !== "Year 1" || period.valuationDate) ||
    Object.values(assumptions).some((value) => value.trim() !== "");
  const checks = buildValidationChecks(rows, mappedRows, assumptions, snapshot, balanceSheetGap);

  function addPeriod() {
    const period: Period = {
      id: `p${Date.now()}`,
      label: `Year ${periods.length + 1}`,
      valuationDate: "",
    };

    setPeriods((current) => [...current, period]);
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

    if (activePeriodId === id) {
      setActivePeriodId(nextPeriods[nextPeriods.length - 1].id);
    }
  }

  function addRow(statement: StatementType = "balance_sheet") {
    setRows((current) => [...current, createRow(statement, periods)]);
  }

  function updateRow(id: string, patch: Partial<AccountRow>) {
    setRows((current) => current.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  }

  function updateRowValue(rowId: string, periodId: string, value: string) {
    setRows((current) =>
      current.map((row) =>
        row.id === rowId ? { ...row, values: { ...row.values, [periodId]: value } } : row,
      ),
    );
  }

  function removeRow(id: string) {
    setRows((current) => current.filter((row) => row.id !== id));
  }

  function updateAssumption(key: keyof AssumptionState, value: string) {
    setAssumptions((current) => ({ ...current, [key]: value }));
  }

  function loadSample() {
    const samplePeriods = buildSamplePeriods();
    setPeriods(samplePeriods);
    setActivePeriodId("p2021");
    setRows(buildSampleRows());
    setAssumptions(buildSampleAssumptions());
  }

  function resetForm() {
    setPeriods(initialPeriods);
    setActivePeriodId(initialPeriods[0].id);
    setRows([]);
    setAssumptions(emptyAssumptions);
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <div className="brand-mark">PVB</div>
          <div>
            <p className="eyebrow">Penilaian Valuasi Bisnis</p>
            <h1>Dynamic Workbench</h1>
          </div>
        </div>
        <nav className="nav-list" aria-label="Model sections">
          {["Periods", "Accounts", "Mapping", "Summary", "AAM", "EEM", "DCF", "Audit"].map((item) => (
            <a href={`#${item.toLowerCase()}`} key={item}>
              {item}
            </a>
          ))}
        </nav>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">100% equity · controlling marketable basis · no DLOM/DLOC</p>
            <h2>Flexible Account Input</h2>
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
              <p className="eyebrow">Step 1</p>
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
                    placeholder="YYYY-MM-DD"
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
              <p className="eyebrow">Step 2</p>
              <h3>Akun dan nilai historis</h3>
            </div>
            <div className="toolbar">
              <button className="button secondary" type="button" onClick={() => addRow("balance_sheet")}>
                <Plus size={18} />
                Neraca
              </button>
              <button className="button secondary" type="button" onClick={() => addRow("income_statement")}>
                <Plus size={18} />
                Laba rugi
              </button>
              <button className="button secondary" type="button" onClick={() => addRow("fixed_asset")}>
                <Plus size={18} />
                Aset tetap
              </button>
            </div>
          </div>

          {rows.length === 0 ? (
            <div className="empty-state">Belum ada akun. Tambahkan baris dari tombol di atas.</div>
          ) : (
            <div className="table-wrap">
              <table className="account-entry-table">
                <thead>
                  <tr>
                    <th>Source</th>
                    <th>Nama akun dari laporan</th>
                    <th>Kategori perhitungan</th>
                    {periods.map((period) => (
                      <th key={period.id}>{period.label || "Period"}</th>
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
                <p className="eyebrow">Step 3</p>
                <h3>Review mapping</h3>
              </div>
              <div className="status-pill muted">
                <GitBranch size={18} />
                {accountMappingRules.length} rule
              </div>
            </div>
            <MappingTable mappedRows={mappedRows} />
          </article>

          <article className="panel">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">Assumptions</p>
                <h3>Model drivers</h3>
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
              <p>{activePeriod?.label || "Active period"} · Equity Value 100%</p>
            </article>
          ))}
        </section>

        <section className="review-band compact-review">
          <div>
            <p className="eyebrow">Model checks</p>
            <h3>Readiness</h3>
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
              <p className="eyebrow">Sensitivity</p>
              <h3>Excel-final scenario coverage</h3>
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
                <p className="eyebrow">Forecast</p>
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
              <p className="eyebrow">Computed model state</p>
              <h3>Audit snapshot</h3>
            </div>
          </div>
          <dl className="assumption-grid">
            <div>
              <dt>Active period</dt>
              <dd>{activePeriod?.label || "Belum diisi"}</dd>
            </div>
            <div>
              <dt>Valuation date</dt>
              <dd>{snapshot.valuationDate || "Belum diisi"}</dd>
            </div>
            <div>
              <dt>Mapped accounts</dt>
              <dd>{mappedRows.filter((item) => item.effectiveCategory !== "UNMAPPED").length}</dd>
            </div>
            <div>
              <dt>Adjusted total assets</dt>
              <dd>{formatIdr(results.adjustedTotalAssets)}</dd>
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

function MappingTable({ mappedRows }: { mappedRows: MappedRow[] }) {
  if (mappedRows.length === 0) {
    return <div className="empty-state">Belum ada akun untuk direview.</div>;
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Nama akun</th>
            <th>Source</th>
            <th>Suggested mapping</th>
            <th>Effective category</th>
            <th>Confidence</th>
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
                <td>{mapping.displayName}</td>
                <td>{categoryLabelMap.get(effectiveCategory) ?? effectiveCategory}</td>
                <td>{formatScore(mapping.confidence)}</td>
                <td>
                  <span className={needsReview ? "badge warning" : "badge ok"}>{needsReview ? "Review" : "Accepted"}</span>
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
      <input inputMode="decimal" placeholder="Optional" value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
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
): Array<{ label: string; ok: boolean }> {
  const hasEquityComponents =
    snapshot.paidUpCapital !== 0 ||
    snapshot.additionalPaidInCapital !== 0 ||
    snapshot.retainedEarningsSurplus !== 0 ||
    snapshot.retainedEarningsCurrentProfit !== 0;
  const balanceTolerance = Math.max(1, Math.abs(snapshot.totalAssets) * 0.001);

  return [
    { label: "Akun sudah diinput", ok: rows.length > 0 },
    { label: "Mapping siap direview", ok: mappedRows.some((item) => item.effectiveCategory !== "UNMAPPED") },
    { label: "Neraca terisi", ok: snapshot.totalAssets !== 0 || snapshot.totalLiabilities !== 0 },
    { label: "Balance check", ok: !hasEquityComponents || Math.abs(balanceSheetGap) <= balanceTolerance },
    { label: "Laba rugi terisi", ok: snapshot.revenue !== 0 || snapshot.ebit !== 0 },
    { label: "Tax rate", ok: assumptions.taxRate.trim() !== "" },
    { label: "WACC", ok: assumptions.wacc.trim() !== "" },
  ];
}
