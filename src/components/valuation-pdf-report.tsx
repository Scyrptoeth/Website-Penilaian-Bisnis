"use client";

import { useEffect, useState } from "react";
import { Banknote, Calculator, FileSearch, Printer, type LucideIcon } from "lucide-react";
import { buildBalanceSheetView, groupBalanceSheetLines, type BalanceSheetLine } from "@/lib/valuation/balance-sheet-view";
import { categoryLabelMap } from "@/lib/valuation/category-options";
import { parseInputNumber, type CaseProfileDerived, type MappedRow, type Period } from "@/lib/valuation/case-model";
import { formatDisplayDate, formatIdr, formatPercent } from "@/lib/valuation/format";
import { readValuationPdfExportPayload, type ValuationPdfExportPayload } from "@/lib/valuation/pdf-export";
import type { TaxSimulationMethodRow } from "@/lib/valuation/tax-simulation";
import type { FormulaTrace, MethodOutput, ValuationMethod } from "@/lib/valuation/types";

type ReportMetric = {
  label: string;
  value: string;
  note?: string;
};

type ReportField = {
  label: string;
  value: string;
};

type MethodSummaryRow = {
  method: ValuationMethod;
  equityValue100: number;
  transferredEquityValue: number | null;
  potentialTax: number | null;
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
  const periods = input.sectionAnalysis.periods.length > 0 ? input.sectionAnalysis.periods : input.periods;
  const methodOutputs: MethodOutput[] = [input.results.aam, input.results.eem, input.results.dcf];
  const methodSummaries = buildMethodSummaries(input.taxSimulationResult.rows, input.taxSimulationResult.baselineRows, methodOutputs);
  const transferredEquityHeader = `Nilai Ekuitas (${formatCapitalProportion(input.caseProfileDerived)})`;
  const primaryTaxRow = input.taxSimulationResult.primaryRow;
  const balanceSheetView = buildBalanceSheetView(periods, input.mappedRows, input.fixedAssetSchedule);
  const driverMetrics: ReportMetric[] = [
    { label: "Tax rate", value: formatPercent(input.snapshot.taxRate), note: input.resolvedAssumptions.taxRateSource || input.assumptions.taxRateSource },
    { label: "WACC", value: formatPercent(input.snapshot.wacc), note: input.resolvedAssumptions.waccSource || input.assumptions.waccSource },
    { label: "Terminal growth", value: formatPercent(input.snapshot.terminalGrowth), note: input.resolvedAssumptions.terminalGrowthSource || input.assumptions.terminalGrowthSource },
    { label: "Revenue growth", value: formatPercent(input.snapshot.revenueGrowth) },
    { label: "Required return on NTA", value: formatPercent(input.snapshot.requiredReturnOnNta) },
    { label: "Operating working capital", value: formatIdr(input.results.operatingWorkingCapital) },
  ];
  const taxMetrics = primaryTaxRow ? buildTaxMetrics(primaryTaxRow) : [];

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
          <CaseProfileSummary payload={payload} />
        </ReportSection>

        <ReportSection title="Ringkasan Metode">
          <table className="pdf-report-table">
            <thead>
              <tr>
                <th>Metode</th>
                <th>Nilai Ekuitas 100%</th>
                <th>{transferredEquityHeader}</th>
                <th>Potensi Pajak</th>
              </tr>
            </thead>
            <tbody>
              {methodSummaries.map((row) => (
                <tr key={row.method}>
                  <td>{row.method}</td>
                  <td className="numeric-cell">{formatIdr(row.equityValue100)}</td>
                  <td className="numeric-cell">{formatNullableIdr(row.transferredEquityValue)}</td>
                  <td className="numeric-cell">{formatNullableIdr(row.potentialTax)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </ReportSection>

        <ReportSection title="Asumsi dan Driver">
          <MetricGrid metrics={driverMetrics} />
        </ReportSection>

        <ReportSection title="Laporan Neraca">
          <BalanceSheetReportTable view={balanceSheetView} periods={periods} />
        </ReportSection>

        <ReportSection title="Laporan Laba Rugi" className="page-break-before">
          <FinancialStatementTable rows={input.mappedRows.filter((item) => item.row.statement === "income_statement")} periods={periods} />
        </ReportSection>

        {input.fixedAssetSchedule.hasInput ? (
          <ReportSection title="Laporan Daftar Aset">
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

        <ReportSection title="Ringkasan">
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
              {methodOutputs.flatMap((method) => [
                <tr className={`trace-method-row method-${method.method.toLowerCase()}`} key={`${method.method}-header`}>
                  <td colSpan={4}>Metode {method.method}</td>
                </tr>,
                ...method.traces.map((trace) => (
                  <tr key={`${method.method}-${trace.label}`}>
                    <td>{method.method}</td>
                    <td>{trace.label}</td>
                    <td>{trace.formula}</td>
                    <td className="numeric-cell">{formatTraceValue(trace)}</td>
                  </tr>
                )),
              ])}
            </tbody>
          </table>
        </ReportSection>

        <ReportSection title="DLOM dan DLOC/PFC">
          <MetricGrid
            metrics={[
              { label: "DLOM Basis", value: input.dlomCalculation.companyMarketability || "-", note: input.dlomCalculation.interestBasis || "-" },
              { label: "DLOM Rate", value: formatPercent(input.dlomCalculation.dlomRate), note: input.dlomCalculation.status },
              { label: "DLOC/PFC Basis", value: input.dlocPfcCalculation.adjustmentType || "-", note: input.dlocPfcCalculation.companyBasis || "-" },
              { label: "DLOC/PFC Rate", value: formatPercent(input.dlocPfcCalculation.signedRate), note: input.dlocPfcCalculation.status },
            ]}
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

function CaseProfileSummary({ payload }: { payload: ValuationPdfExportPayload }) {
  const { caseProfile, caseProfileDerived } = payload.input;
  const objectFields: ReportField[] = [
    { label: "Nama Objek Pajak", value: caseProfile.objectTaxpayerName || "-" },
    { label: "NPWP Objek Pajak", value: caseProfile.objectTaxpayerNpwp || "-" },
    { label: "Sektor Perusahaan", value: caseProfile.companySector || "-" },
    { label: "Jenis Perusahaan", value: caseProfile.companyType || "-" },
  ];
  const subjectFields: ReportField[] = [
    { label: "Nama Subjek Pajak", value: caseProfile.subjectTaxpayerName || "-" },
    { label: "NPWP Subjek Pajak", value: caseProfile.subjectTaxpayerNpwp || "-" },
    { label: "Jenis Subjek Pajak", value: caseProfile.subjectTaxpayerType || "-" },
    { label: "Jenis Kepemilikan Saham", value: caseProfile.shareOwnershipType || "-" },
  ];
  const transactionFields: ReportField[] = [
    { label: "Jenis Peralihan yang Diketahui", value: caseProfile.transferType || "-" },
    { label: caseProfileDerived.capitalBaseFullLabel, value: caseProfile.capitalBaseFull || "-" },
    { label: caseProfileDerived.capitalBaseValuedLabel, value: caseProfile.capitalBaseValued || "-" },
    { label: caseProfileDerived.capitalProportionLabel, value: formatCapitalProportion(caseProfileDerived) },
    { label: "Tahun Transaksi Pengalihan", value: caseProfile.transactionYear || "-" },
    { label: "Tanggal cut-off", value: formatDerivedDate(caseProfileDerived.cutOffDate) },
    { label: "Akhir Periode Proyeksi Pertama", value: formatDerivedDate(caseProfileDerived.firstProjectionEndDate) },
    { label: "Objek Penilaian", value: caseProfile.valuationObject || "-" },
  ];

  return (
    <div className="pdf-report-data-awal-grid">
      <ReadOnlyDataCard title="Identitas Objek Pajak" icon={FileSearch} fields={objectFields} />
      <ReadOnlyDataCard title="Identitas Subjek Pajak" icon={Banknote} fields={subjectFields} />
      <ReadOnlyDataCard title="Transaksi dan Objek Penilaian" icon={Calculator} fields={transactionFields} wide />
    </div>
  );
}

function ReadOnlyDataCard({
  title,
  icon: Icon,
  fields,
  wide = false,
}: {
  title: string;
  icon: LucideIcon;
  fields: ReportField[];
  wide?: boolean;
}) {
  return (
    <article className={wide ? "pdf-report-data-card wide" : "pdf-report-data-card"}>
      <h3>
        <Icon size={14} />
        {title}
      </h3>
      <dl className="pdf-report-field-grid">
        {fields.map((field) => (
          <div key={field.label}>
            <dt>{field.label}</dt>
            <dd>{field.value}</dd>
          </div>
        ))}
      </dl>
    </article>
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

function BalanceSheetReportTable({
  view,
  periods,
}: {
  view: ReturnType<typeof buildBalanceSheetView>;
  periods: Period[];
}) {
  if (!view.hasRows) {
    return <p className="pdf-report-note">Data neraca belum tersedia.</p>;
  }

  return (
    <table className="pdf-report-table financial balance-sheet">
      <thead>
        <tr>
          <th>Pos</th>
          <th>Detail</th>
          <th>Akun / komponen</th>
          {periods.map((period) => (
            <th key={period.id}>{period.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {view.sections.flatMap((section) => {
          const groups = groupBalanceSheetLines(section.lines);

          return [
            <tr className="statement-section-row" key={`${section.title}-section`}>
              <td>{section.title}</td>
              <td colSpan={periods.length + 2} />
            </tr>,
            ...groups.flatMap((group) => [
              <tr className="statement-group-row" key={`${section.title}-${group.key}`}>
                <td>{section.title}</td>
                <td>{group.label}</td>
                <td colSpan={periods.length + 1} />
              </tr>,
              ...group.lines.map((line, lineIndex) => (
                <BalanceSheetLineRow
                  key={`${section.title}-${group.key}-${line.categoryId}-${lineIndex}`}
                  line={line}
                  sectionTitle={section.title}
                  groupLabel={group.label}
                  periods={periods}
                />
              )),
            ]),
            <tr className="subtotal-row" key={`${section.title}-total`}>
              <td>{section.title}</td>
              <td>Total</td>
              <td>{section.totalLabel}</td>
              {periods.map((period) => (
                <td className="numeric-cell" key={period.id}>
                  {formatIdr(section.totalValues[period.id] ?? 0)}
                </td>
              ))}
            </tr>,
          ];
        })}
        <tr className="subtotal-row">
          <td>Liabilitas + Ekuitas</td>
          <td>Total</td>
          <td>Total Liabilitas + Ekuitas</td>
          {periods.map((period) => (
            <td className="numeric-cell" key={period.id}>
              {formatIdr(view.totalLiabilitiesAndEquity[period.id] ?? 0)}
            </td>
          ))}
        </tr>
        <tr className="balance-check-row">
          <td>Cek Kesesuaian</td>
          <td>Model</td>
          <td>Aset - (Liabilitas + Ekuitas)</td>
          {periods.map((period) => (
            <td className="numeric-cell" key={period.id}>
              {formatIdr(view.balanceGap[period.id] ?? 0)}
            </td>
          ))}
        </tr>
      </tbody>
    </table>
  );
}

function BalanceSheetLineRow({
  line,
  sectionTitle,
  groupLabel,
  periods,
}: {
  line: BalanceSheetLine;
  sectionTitle: string;
  groupLabel: string;
  periods: Period[];
}) {
  return (
    <tr>
      <td>{sectionTitle}</td>
      <td>{groupLabel}</td>
      <td>
        <strong>{line.label}</strong>
        <small>{line.category}</small>
      </td>
      {periods.map((period) => (
        <td className="numeric-cell" key={period.id}>
          {formatIdr(line.values[period.id] ?? 0)}
        </td>
      ))}
    </tr>
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

function formatTraceValue(trace: FormulaTrace): string {
  if (trace.valueFormat === "percent") {
    return formatPercent(trace.value);
  }

  if (trace.valueFormat === "number") {
    return trace.value.toLocaleString("id-ID", { maximumFractionDigits: 2 });
  }

  return formatIdr(trace.value);
}

function buildMethodSummaries(activeRows: TaxSimulationMethodRow[], baselineRows: TaxSimulationMethodRow[], methodOutputs: MethodOutput[]): MethodSummaryRow[] {
  return methodOutputs.map((output) => {
    const taxRow = activeRows.find((row) => row.method === output.method) ?? baselineRows.find((row) => row.method === output.method) ?? null;

    return {
      method: output.method,
      equityValue100: output.equityValue,
      transferredEquityValue: taxRow?.marketValueOfTransferredInterest ?? null,
      potentialTax: taxRow?.potentialTax ?? null,
    };
  });
}

function formatNullableIdr(value: number | null): string {
  return value === null ? "-" : formatIdr(value);
}

function formatCapitalProportion(derived: CaseProfileDerived): string {
  if (derived.capitalProportionStatus === "empty") {
    return "Belum dihitung";
  }

  if (derived.capitalProportionStatus === "invalid" || derived.capitalProportion === null) {
    return "Data tidak valid";
  }

  return formatPercent(derived.capitalProportion);
}

function formatDerivedDate(value: string): string {
  return value ? formatDisplayDate(value) : "Belum dihitung";
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
