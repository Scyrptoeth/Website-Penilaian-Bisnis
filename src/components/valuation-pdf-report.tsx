"use client";

import { useEffect, useState } from "react";
import { Printer } from "lucide-react";
import { categoryLabelMap } from "@/lib/valuation/category-options";
import { parseInputNumber, type MappedRow, type Period } from "@/lib/valuation/case-model";
import { formatDisplayDate, formatIdr, formatPercent } from "@/lib/valuation/format";
import { readValuationPdfExportPayload, type ValuationPdfExportPayload } from "@/lib/valuation/pdf-export";
import type { TaxSimulationMethodRow } from "@/lib/valuation/tax-simulation";
import type { FormulaTrace, MethodOutput, ValuationMethod } from "@/lib/valuation/types";

type ReportMetric = {
  label: string;
  value: string;
  note?: string;
};

export function ValuationPdfReport() {
  const [payload, setPayload] = useState<ValuationPdfExportPayload | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    setPayload(readValuationPdfExportPayload());
    setHasLoaded(true);
  }, []);

  const generatedAt = formatGeneratedAt(payload?.generatedAt);

  if (!hasLoaded) {
    return <main className="pdf-report-page" data-testid="pdf-report-loading" />;
  }

  if (!payload) {
    return (
      <main className="pdf-report-page" data-testid="pdf-report-empty">
        <section className="pdf-report-sheet">
          <h1>Export PDF belum tersedia</h1>
          <p>Buka laporan ini melalui tombol Export PDF di workbench aktif agar data penilaian terbaru ikut terbawa.</p>
        </section>
      </main>
    );
  }

  const { input } = payload;
  const activePeriod = input.periods.find((period) => period.id === input.activePeriodId);
  const periods = input.sectionAnalysis.periods.length > 0 ? input.sectionAnalysis.periods : input.periods;
  const methodOutputs: MethodOutput[] = [input.results.aam, input.results.eem, input.results.dcf];
  const methods: Array<{ method: ValuationMethod; value: number; traceCount: number }> = [
    { method: "AAM", value: input.results.aam.equityValue, traceCount: input.results.aam.traces.length },
    { method: "EEM", value: input.results.eem.equityValue, traceCount: input.results.eem.traces.length },
    { method: "DCF", value: input.results.dcf.equityValue, traceCount: input.results.dcf.traces.length },
  ];
  const primaryTaxRow = input.taxSimulationResult.primaryRow;
  const caseMetrics: ReportMetric[] = [
    { label: "Objek pajak", value: input.caseProfile.objectTaxpayerName || "-" },
    { label: "NPWP objek", value: input.caseProfile.objectTaxpayerNpwp || "-" },
    { label: "Subjek pajak", value: input.caseProfile.subjectTaxpayerName || "-" },
    { label: "Jenis subjek", value: input.caseProfile.subjectTaxpayerType || "-" },
    { label: "Sektor", value: input.caseProfile.companySector || "-" },
    { label: "Tanggal valuasi", value: formatDisplayDate(activePeriod?.valuationDate ?? "") || activePeriod?.label || "-" },
    { label: "Tahun transaksi", value: input.caseProfile.transactionYear || "-" },
    { label: "Objek penilaian", value: input.caseProfile.valuationObject || "-" },
  ];
  const driverMetrics: ReportMetric[] = [
    { label: "Tax rate", value: formatPercent(input.snapshot.taxRate), note: input.resolvedAssumptions.taxRateSource || input.assumptions.taxRateSource },
    { label: "WACC", value: formatPercent(input.snapshot.wacc), note: input.resolvedAssumptions.waccSource || input.assumptions.waccSource },
    { label: "Terminal growth", value: formatPercent(input.snapshot.terminalGrowth), note: input.resolvedAssumptions.terminalGrowthSource || input.assumptions.terminalGrowthSource },
    { label: "Revenue growth", value: formatPercent(input.snapshot.revenueGrowth) },
    { label: "Required return on NTA", value: formatPercent(input.snapshot.requiredReturnOnNta) },
    { label: "Operating working capital", value: formatIdr(input.results.operatingWorkingCapital) },
  ];
  const taxMetrics = primaryTaxRow ? buildTaxMetrics(primaryTaxRow) : [];
  const validationNeedsReview = input.validationChecks.filter((check) => !check.ok);
  const readinessWarnings = Object.values(input.readiness).flatMap((section) =>
    section.warnings.map((warning) => `${section.title}: ${warning.label}`),
  );
  const readinessMissing = Object.values(input.readiness).flatMap((section) =>
    section.missing.map((missing) => `${section.title}: ${missing.label}`),
  );

  return (
    <main className="pdf-report-page" data-testid="pdf-report">
      <div className="pdf-report-actions" aria-label="Aksi laporan PDF">
        <button className="button secondary" type="button" onClick={() => window.print()}>
          <Printer size={18} />
          Cetak / Simpan PDF
        </button>
      </div>

      <article className="pdf-report-sheet">
        <header className="pdf-report-cover">
          <p>PENILAIAN BISNIS II</p>
          <h1>Laporan Ringkas Penilaian Valuasi Bisnis</h1>
          <dl>
            <div>
              <dt>Wajib Pajak Objek</dt>
              <dd>{input.caseProfile.objectTaxpayerName || "-"}</dd>
            </div>
            <div>
              <dt>Dibuat</dt>
              <dd>{generatedAt}</dd>
            </div>
          </dl>
        </header>

        <ReportSection title="Data Awal">
          <MetricGrid metrics={caseMetrics} />
        </ReportSection>

        <ReportSection title="Ringkasan Metode">
          <table className="pdf-report-table">
            <thead>
              <tr>
                <th>Metode</th>
                <th>Nilai Ekuitas 100%</th>
                <th>Trace</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {methods.map((method) => (
                <tr key={method.method}>
                  <td>{method.method}</td>
                  <td className="numeric-cell">{formatIdr(method.value)}</td>
                  <td className="numeric-cell">{method.traceCount}</td>
                  <td>Base method sebelum DLOM/DLOC/PFC</td>
                </tr>
              ))}
            </tbody>
          </table>
        </ReportSection>

        <ReportSection title="Asumsi dan Driver">
          <MetricGrid metrics={driverMetrics} />
        </ReportSection>

        <ReportSection title="Laporan Keuangan Historis">
          <FinancialStatementTable rows={input.mappedRows.filter((item) => item.row.statement === "balance_sheet")} periods={periods} />
        </ReportSection>

        <ReportSection title="Laba Rugi Historis" className="page-break-before">
          <FinancialStatementTable rows={input.mappedRows.filter((item) => item.row.statement === "income_statement")} periods={periods} />
        </ReportSection>

        {input.fixedAssetSchedule.hasInput ? (
          <ReportSection title="Jadwal Aset Tetap">
            <table className="pdf-report-table financial">
              <thead>
                <tr>
                  <th>Kelas aset</th>
                  {periods.map((period) => (
                    <th key={period.id}>Nilai buku {period.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {input.fixedAssetSchedule.rows.map(({ row, amounts }) => (
                  <tr key={row.id}>
                    <td>{row.assetName}</td>
                    {periods.map((period) => (
                      <td className="numeric-cell" key={period.id}>
                        {formatIdr(amounts[period.id]?.netValue ?? 0)}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr className="subtotal-row">
                  <td>Total nilai buku</td>
                  {periods.map((period) => (
                    <td className="numeric-cell" key={period.id}>
                      {formatIdr(input.fixedAssetSchedule.totals[period.id]?.netValue ?? 0)}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </ReportSection>
        ) : null}

        <ReportSection title="Jejak Perhitungan Metode">
          <table className="pdf-report-table compact trace">
            <thead>
              <tr>
                <th>Metode</th>
                <th>Trace</th>
                <th>Formula</th>
                <th>Nilai</th>
              </tr>
            </thead>
            <tbody>
              {methodOutputs.flatMap((method) =>
                method.traces.map((trace) => (
                  <tr key={`${method.method}-${trace.label}`}>
                    <td>{method.method}</td>
                    <td>{trace.label}</td>
                    <td>{trace.formula}</td>
                    <td className="numeric-cell">{formatTraceValue(trace)}</td>
                  </tr>
                )),
              )}
            </tbody>
          </table>
        </ReportSection>

        <ReportSection title="DLOM dan DLOC/PFC">
          <MetricGrid
            metrics={[
              { label: "DLOM basis", value: input.dlomCalculation.companyMarketability || "-", note: input.dlomCalculation.interestBasis || "-" },
              { label: "DLOM range", value: input.dlomCalculation.rangeLabel },
              { label: "DLOM rate", value: formatPercent(input.dlomCalculation.dlomRate), note: input.dlomCalculation.status },
              { label: "DLOC/PFC basis", value: input.dlocPfcCalculation.adjustmentType || "-", note: input.dlocPfcCalculation.companyBasis || "-" },
              { label: "DLOC/PFC range", value: input.dlocPfcCalculation.rangeLabel },
              { label: "DLOC/PFC signed rate", value: formatPercent(input.dlocPfcCalculation.signedRate), note: input.dlocPfcCalculation.status },
            ]}
          />
          <FactorTable
            title="Faktor DLOM"
            rows={input.dlomCalculation.factors.map((factor) => ({
              key: factor.id,
              factor: factor.factor,
              answer: factor.answer || "-",
              score: factor.score,
              status: factor.status,
            }))}
          />
          <FactorTable
            title="Faktor DLOC/PFC"
            rows={input.dlocPfcCalculation.factors.map((factor) => ({
              key: factor.id,
              factor: factor.factor,
              answer: factor.answer || "-",
              score: factor.score,
              status: factor.status,
            }))}
          />
        </ReportSection>

        <ReportSection title="Simulasi Potensi Pajak" className="avoid-break">
          {primaryTaxRow ? (
            <>
              <MetricGrid metrics={taxMetrics} />
              <table className="pdf-report-table compact">
                <thead>
                  <tr>
                    <th>Bracket / Basis</th>
                    <th>Tarif</th>
                    <th>PKP</th>
                    <th>Pajak</th>
                  </tr>
                </thead>
                <tbody>
                  {primaryTaxRow.taxBrackets.map((bracket) => (
                    <tr key={`${bracket.label}-${bracket.rate}`}>
                      <td>{bracket.label}</td>
                      <td className="numeric-cell">{formatPercent(bracket.rate)}</td>
                      <td className="numeric-cell">{formatIdr(bracket.taxableAmount)}</td>
                      <td className="numeric-cell">{formatIdr(bracket.tax)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="pdf-report-note">
                {primaryTaxRow.taxSourceLegalBasis || primaryTaxRow.taxBasisLabel}
                {primaryTaxRow.taxSourceUrl ? ` | ${primaryTaxRow.taxSourceUrl}` : ""}
              </p>
            </>
          ) : (
            <p className="pdf-report-note">Primary Method belum dipilih sehingga ringkasan pajak final belum dikunci.</p>
          )}
        </ReportSection>

        <ReportSection title="Audit dan Catatan Review">
          <AuditList
            title="Validation checks"
            items={validationNeedsReview.map((check) => check.label)}
            emptyText="Semua validation check utama berstatus OK."
          />
          <AuditList title="Readiness missing" items={readinessMissing} emptyText="Tidak ada readiness input yang hilang." />
          <AuditList title="Readiness warnings" items={readinessWarnings} emptyText="Tidak ada readiness warning aktif." />
          <AuditList title="Tax simulation warnings" items={input.taxSimulationResult.warnings} emptyText="Tidak ada warning pajak aktif." />
        </ReportSection>
      </article>
    </main>
  );
}

function ReportSection({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={["pdf-report-section", className].filter(Boolean).join(" ")}>
      <h2>{title}</h2>
      {children}
    </section>
  );
}

function MetricGrid({ metrics }: { metrics: ReportMetric[] }) {
  return (
    <dl className="pdf-report-metric-grid">
      {metrics.map((metric) => (
        <div key={metric.label}>
          <dt>{metric.label}</dt>
          <dd>{metric.value}</dd>
          {metric.note ? <small>{metric.note}</small> : null}
        </div>
      ))}
    </dl>
  );
}

function FinancialStatementTable({ title, rows, periods }: { title?: string; rows: MappedRow[]; periods: Period[] }) {
  return (
    <div className="pdf-report-table-block">
      {title ? <h3>{title}</h3> : null}
      <table className="pdf-report-table financial">
        <thead>
          <tr>
            <th>Akun</th>
            <th>Kategori</th>
            {periods.map((period) => (
              <th key={period.id}>{period.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(({ row, effectiveCategory }) => (
            <tr key={row.id}>
              <td>{row.accountName}</td>
              <td>{categoryLabelMap.get(effectiveCategory) ?? effectiveCategory}</td>
              {periods.map((period) => (
                <td className="numeric-cell" key={period.id}>
                  {formatIdr(parseInputNumber(row.values[period.id] ?? ""))}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FactorTable({
  title,
  rows,
}: {
  title: string;
  rows: Array<{ key: string; factor: string; answer: string; score: number; status: string }>;
}) {
  return (
    <div className="pdf-report-table-block">
      <h3>{title}</h3>
      <table className="pdf-report-table compact factor">
        <thead>
          <tr>
            <th>Faktor</th>
            <th>Jawaban</th>
            <th>Skor</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.key}>
              <td>{row.factor}</td>
              <td>{row.answer}</td>
              <td className="numeric-cell">{row.score.toLocaleString("id-ID", { maximumFractionDigits: 2 })}</td>
              <td>{row.status === "answered" ? "Terisi" : "Belum lengkap"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AuditList({ title, items, emptyText }: { title: string; items: string[]; emptyText: string }) {
  return (
    <div className="pdf-report-audit-list">
      <h3>{title}</h3>
      {items.length > 0 ? (
        <ul>
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : (
        <p>{emptyText}</p>
      )}
    </div>
  );
}

function formatTraceValue(trace: FormulaTrace): string {
  if (trace.valueFormat === "percent") {
    return formatPercent(trace.value);
  }

  if (trace.valueFormat === "number") {
    return trace.value.toLocaleString("id-ID", { maximumFractionDigits: 2 });
  }

  return formatIdr(trace.value);
}

function buildTaxMetrics(row: TaxSimulationMethodRow): ReportMetric[] {
  return [
    { label: "Primary method", value: row.method },
    { label: "Basis final", value: row.basisLabel },
    { label: "Market value interest", value: formatIdr(row.marketValueOfTransferredInterest) },
    { label: "Nilai dilaporkan", value: formatIdr(row.reportedTransferValue) },
    { label: "Selisih nilai", value: formatIdr(row.transferValueDifference) },
    { label: "PKP dibulatkan", value: formatIdr(row.taxableIncomeRounded) },
    { label: "Potensi pajak", value: formatIdr(row.potentialTax) },
    { label: "Effective tax rate", value: formatPercent(row.effectiveTaxRate) },
  ];
}

function formatGeneratedAt(value: string | undefined): string {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(value));
}
