"use client";

import { useEffect, useState } from "react";
import { Banknote, Calculator, FileSearch, Printer, type LucideIcon } from "lucide-react";
import { buildBalanceSheetView, groupBalanceSheetLines, type BalanceSheetLine } from "@/lib/valuation/balance-sheet-view";
import { categoryLabelMap } from "@/lib/valuation/category-options";
import { parseInputNumber, type CaseProfileDerived, type MappedRow, type Period } from "@/lib/valuation/case-model";
import { isMajorityShareOwnership } from "@/lib/valuation/dloc-pfc";
import { formatDisplayDate, formatIdr, formatInputNumber, formatPercent, formatPercentFixed } from "@/lib/valuation/format";
import { formatKluOptionLabel, getKluSectorRecord } from "@/lib/valuation/klu-sector";
import {
  readValuationPdfExportPayload,
  resolveValuationPdfExportScope,
  type ValuationPdfExportPayload,
  type ValuationPdfExportScope,
} from "@/lib/valuation/pdf-export";
import { filterMappedRowsByValuationScope } from "@/lib/valuation/export-scopes";
import { buildEemTaxPayableDebtLikeNote, eemSensitivityContext } from "@/lib/valuation/eem-sensitivity-context";
import {
  getDebtScheduleDetailLabel,
  getDebtScheduleRuleLabel,
  getDebtScheduleSourceLabel,
} from "@/lib/valuation/debt-schedule-display";
import type { TaxSimulationMethodRow } from "@/lib/valuation/tax-simulation";
import type { AnalysisRow } from "@/lib/valuation/section-analysis";
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
  const scope = resolveValuationPdfExportScope(payload.scope);
  const periods = input.sectionAnalysis.periods.length > 0 ? input.sectionAnalysis.periods : input.periods;
  const methodOutputById: Record<ValuationMethod, MethodOutput> = {
    AAM: input.results.aam,
    EEM: input.results.eem,
    DCF: input.results.dcf,
  };
  const methodOutputs = scope.methods.map((method) => methodOutputById[method]);
  const methodSummaries = buildMethodSummaries(input.taxSimulationResult.rows, input.taxSimulationResult.baselineRows, methodOutputs);
  const transferredEquityHeader = `Nilai Ekuitas (${formatCapitalProportion(input.caseProfileDerived)})`;
  const scopedTaxRows = buildScopedTaxRows(input.taxSimulationResult.rows, input.taxSimulationResult.baselineRows, scope);
  const primaryTaxRow = input.taxSimulationResult.primaryRow && scope.methods.includes(input.taxSimulationResult.primaryRow.method)
    ? input.taxSimulationResult.primaryRow
    : (scopedTaxRows[0] ?? null);
  const scopedMappedRows = filterMappedRowsByValuationScope(input.mappedRows, scope);
  const incomeStatementRows = scopedMappedRows.filter((item) => item.row.statement === "income_statement");
  const balanceSheetView = buildBalanceSheetView(periods, scopedMappedRows, input.fixedAssetSchedule);
  const driverMetrics = buildDriverMetrics(payload, scope);
  const taxMetrics = primaryTaxRow ? buildTaxMetrics(primaryTaxRow, input.taxSimulationResult.overallResistance) : [];
  const isCombinedScope = scope.id === "all";

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
          <h1>{scope.title}</h1>
          <dl>
            <div>
              <dt>Wajib Pajak Objek</dt>
              <dd>{input.caseProfile.objectTaxpayerName || "-"}</dd>
            </div>
            <div>
              <dt>Scope Export</dt>
              <dd>{scope.label}</dd>
            </div>
            <div>
              <dt>Dibuat</dt>
              <dd>{generatedAt}</dd>
            </div>
          </dl>
          <p className="pdf-report-scope-note">{scope.description}</p>
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

        <ReportSection title={isCombinedScope ? "Laporan Neraca" : `Laporan Neraca Terkait ${scope.label}`}>
          <p className="pdf-report-note">
            {isCombinedScope ? "Tabel menampilkan seluruh akun neraca." : "Tabel disaring memakai label metode dan sumber data yang relevan untuk scope export ini."}
          </p>
          <BalanceSheetReportTable view={balanceSheetView} periods={periods} showBalanceCheck={isCombinedScope} />
        </ReportSection>

        {incomeStatementRows.length > 0 ? (
          <ReportSection title={isCombinedScope ? "Laporan Laba Rugi" : `Laporan Laba Rugi Terkait ${scope.label}`} className="page-break-before">
            <FinancialStatementTable rows={incomeStatementRows} periods={periods} />
          </ReportSection>
        ) : null}

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

        <ReportSection title="Jadwal Utang">
          <p className="pdf-report-note">
            Baris manual berasal dari input jadwal, sedangkan nilai otomatis dan koneksi Neraca tetap terkunci.
          </p>
          <AnalysisReportTable rows={input.sectionAnalysis.payablesRows} periods={periods} />
        </ReportSection>

        {scope.methods.includes("AAM") ? (
          <ReportSection title="Penyesuaian AAM">
            <AamAdjustmentReportTable payload={payload} />
          </ReportSection>
        ) : null}

        {scope.methods.includes("EEM") ? (
          <ReportSection title="Sensitivitas EEM">
            <EemSensitivityReportTable payload={payload} />
          </ReportSection>
        ) : null}

        {scope.methods.includes("DCF") ? (
          <ReportSection title="Sensitivitas DCF">
            <DcfSensitivityReportTable payload={payload} />
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
              { label: "DLOM Rate", value: formatPercent(input.dlomCalculation.dlomRate), note: `Resistensi WP: ${input.dlomCalculation.taxpayerResistance}; posisi: ${input.dlomCalculation.status}` },
              ...(isMajorityShareOwnership(input.caseProfile.shareOwnershipType)
                ? [
                    {
                      label: "DLOC/PFC",
                      value: "Tidak berlaku — Saham Mayoritas",
                      note: "PFC tidak diperhitungkan; penilaian hanya memerlukan DLOM.",
                    },
                  ]
                : [
                    { label: "DLOC/PFC Basis", value: input.dlocPfcCalculation.adjustmentType || "-", note: input.dlocPfcCalculation.companyBasis || "-" },
                    { label: "DLOC/PFC Rate", value: input.dlocPfcCalculation.adjustmentType === "PFC" ? formatPercent(Math.abs(input.dlocPfcCalculation.signedRate)) : formatPercent(input.dlocPfcCalculation.signedRate), note: `Resistensi WP: ${input.dlocPfcCalculation.taxpayerResistance}; posisi: ${input.dlocPfcCalculation.status}` },
                  ]),
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
                    <th>Metode</th>
                    <th>Basis</th>
                    <th>Nilai Ekuitas 100%</th>
                    <th>{transferredEquityHeader}</th>
                    <th>Potensi Pajak</th>
                  </tr>
                </thead>
                <tbody>
                  {scopedTaxRows.map((row) => (
                    <tr className={row.isPrimary ? `trace-method-row method-${row.method.toLowerCase()}` : ""} key={`${row.method}-${row.basis}`}>
                      <td>{row.method}</td>
                      <td>{row.basisLabel}</td>
                      <td className="numeric-cell">{formatIdr(row.baseEquityValue)}</td>
                      <td className="numeric-cell">{formatIdr(row.marketValueOfTransferredInterest)}</td>
                      <td className="numeric-cell">{formatIdr(row.potentialTax)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
  const kluRecord = getKluSectorRecord(caseProfile.objectBusinessKlu);
  const objectFields: ReportField[] = [
    { label: "Nama Objek Pajak", value: caseProfile.objectTaxpayerName || "-" },
    { label: "KLU sesuai Appportal", value: kluRecord ? formatKluOptionLabel(kluRecord) : caseProfile.objectBusinessKlu || "-" },
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
    ...(caseProfileDerived.isShareTransfer
      ? [
          { label: "Nilai Saham Per Lembar", value: caseProfile.shareValuePerShare || "-" },
          {
            label: caseProfileDerived.capitalBaseFullAmountLabel,
            value: formatCaseProfileAmount(caseProfileDerived.capitalBaseFullAmount, caseProfileDerived.capitalBaseAmountStatus),
          },
          {
            label: caseProfileDerived.capitalBaseValuedAmountLabel,
            value: formatCaseProfileAmount(caseProfileDerived.capitalBaseValuedAmount, caseProfileDerived.capitalBaseAmountStatus),
          },
        ]
      : []),
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

function AamAdjustmentReportTable({ payload }: { payload: ValuationPdfExportPayload }) {
  const { aamAdjustmentModel } = payload.input;
  const lines = [...aamAdjustmentModel.assetLines, ...aamAdjustmentModel.liabilityLines, ...aamAdjustmentModel.equityLines];

  return (
    <>
      <table className="pdf-report-table compact">
        <thead>
          <tr>
            <th>Peran</th>
            <th>Pos</th>
            <th>Historis</th>
            <th>Penyesuaian</th>
            <th>Setelah penyesuaian</th>
            <th>Catatan</th>
          </tr>
        </thead>
        <tbody>
          {lines.map((line) => (
            <tr key={line.id}>
              <td>{formatAamAdjustmentRole(line.role)}</td>
              <td>
                <strong>{line.label}</strong>
                <small>{line.source}</small>
              </td>
              <td className="numeric-cell">{formatIdr(line.historical)}</td>
              <td className="numeric-cell">{formatIdr(line.adjustment)}</td>
              <td className="numeric-cell">{formatIdr(line.adjusted)}</td>
              <td>{line.note || (line.requiresNote ? "Catatan penyesuaian belum diisi." : "-")}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <MetricGrid
        metrics={[
          { label: "Total aset historis", value: formatIdr(aamAdjustmentModel.historicalAssetTotal) },
          { label: "Total penyesuaian aset", value: formatIdr(aamAdjustmentModel.assetAdjustmentTotal) },
          { label: "Total liabilitas historis", value: formatIdr(aamAdjustmentModel.historicalLiabilityTotal) },
          { label: "Total penyesuaian liabilitas", value: formatIdr(aamAdjustmentModel.liabilityAdjustmentTotal) },
          { label: "Total ekuitas historis", value: formatIdr(aamAdjustmentModel.historicalEquityTotal) },
          { label: "Changes on Asset Revaluation", value: formatIdr(aamAdjustmentModel.equityRevaluationAdjustment) },
          { label: "Total ekuitas disesuaikan", value: formatIdr(aamAdjustmentModel.adjustedBookEquity) },
          { label: "Total liabilitas + ekuitas disesuaikan", value: formatIdr(aamAdjustmentModel.adjustedLiabilityEquityTotal) },
          { label: "Selisih balance AAM", value: formatIdr(aamAdjustmentModel.adjustedBalanceGap) },
          { label: "Nilai ekuitas AAM", value: formatIdr(aamAdjustmentModel.adjustedEquityValue) },
          { label: "Catatan wajib belum lengkap", value: String(aamAdjustmentModel.missingNoteCount) },
        ]}
      />
    </>
  );
}

function formatAamAdjustmentRole(role: "asset" | "liability" | "equity") {
  if (role === "asset") {
    return "Aset";
  }

  if (role === "liability") {
    return "Liabilitas";
  }

  return "Ekuitas";
}

function EemSensitivityReportTable({ payload }: { payload: ValuationPdfExportPayload }) {
  const { input } = payload;
  const baseResults = input.baseResults ?? input.results;
  const rows = [
    {
      label: eemSensitivityContext.base.label,
      value: baseResults.eem.equityValue,
      note: `${eemSensitivityContext.base.note} Formula: ${eemSensitivityContext.base.formula}.`,
    },
    {
      label: eemSensitivityContext.taxPayableDebtLike.label,
      value: input.results.sensitivities.eemTaxPayableDebtLike.equityValue,
      note: `${buildEemTaxPayableDebtLikeNote(formatIdr(baseResults.eem.equityValue - input.results.sensitivities.eemTaxPayableDebtLike.equityValue))} Formula: ${eemSensitivityContext.taxPayableDebtLike.formula}.`,
    },
  ];

  return (
    <table className="pdf-report-table compact">
      <thead>
        <tr>
          <th>Skenario</th>
          <th>Nilai Ekuitas 100%</th>
          <th>Catatan audit</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.label}>
            <td>{row.label}</td>
            <td className="numeric-cell">{formatIdr(row.value)}</td>
            <td>{row.note}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function DcfSensitivityReportTable({ payload }: { payload: ValuationPdfExportPayload }) {
  const { input } = payload;
  const baseResults = input.baseResults ?? input.results;
  const rows: Array<{ label: string; value: string; note: string }> = [
    {
      label: "Basis DCF aktif",
      value: formatIdr(input.results.dcf.equityValue),
      note: input.activeDcfBasisSummary || "Default sistem.",
    },
    {
      label: "Horizon proyeksi DCF",
      value: `${input.activeDcfProjectionHorizonYears ?? input.results.dcf.forecast.length} tahun`,
      note: "Horizon eksplisit yang dipakai tab proyeksi dan nilai DCF.",
    },
    {
      label: "Terminal treatment",
      value: input.activeDcfTerminalTreatmentLabel || "Default terminal value",
      note: input.activeDcfTerminalTreatmentReason || input.activeDcfTerminalTreatmentSummary || "Terminal value mengikuti growth/WACC.",
    },
    { label: "DCF - skenario dasar", value: formatIdr(baseResults.dcf.equityValue), note: "Nilai dasar dari engine FCFF/WACC." },
    {
      label: "DCF tanpa WC incremental",
      value: formatIdr(baseResults.sensitivities.dcfNoIncrementalWorkingCapital.equityValue),
      note: "Perubahan modal kerja dinonaktifkan.",
    },
    {
      label: "DCF utang pajak debt-like",
      value: formatIdr(baseResults.sensitivities.dcfTaxPayableDebtLike.equityValue),
      note: "Utang pajak dikurangkan sebagai debt-like sensitivity.",
    },
    {
      label: "DCF - proyeksi neraca berbasis historis",
      value: formatIdr(baseResults.sensitivities.dcfHistoricalDerivedProjection.equityValue),
      note: "Kebijakan kas, utang pajak, dan roll-forward ekuitas diturunkan dari historis.",
    },
    {
      label: "Nilai DCF governed aktif",
      value: formatIdr(input.results.projectionGovernance.governedEquityValue),
      note: input.results.projectionGovernance.summary,
    },
    {
      label: "Variance governance proyeksi DCF",
      value: formatPercent(input.results.projectionGovernance.relativeVariance),
      note: input.results.projectionGovernance.title,
    },
  ];

  return (
    <>
      <table className="pdf-report-table compact">
        <thead>
          <tr>
            <th>Skenario</th>
            <th>Nilai</th>
            <th>Catatan audit</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.label}>
              <td>{row.label}</td>
              <td className="numeric-cell">{row.value}</td>
              <td>{row.note}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <table className="pdf-report-table compact">
        <thead>
          <tr>
            <th>Tahun</th>
            <th>Revenue</th>
            <th>EBIT</th>
            <th>FCFF</th>
            <th>PV FCFF</th>
          </tr>
        </thead>
        <tbody>
          {input.results.dcf.forecast.map((row) => (
            <tr key={row.year}>
              <td>{row.year}</td>
              <td className="numeric-cell">{formatIdr(row.revenue)}</td>
              <td className="numeric-cell">{formatIdr(row.ebit)}</td>
              <td className="numeric-cell">{formatIdr(row.freeCashFlow)}</td>
              <td className="numeric-cell">{formatIdr(row.presentValue)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

function BalanceSheetReportTable({
  view,
  periods,
  showBalanceCheck = true,
}: {
  view: ReturnType<typeof buildBalanceSheetView>;
  periods: Period[];
  showBalanceCheck?: boolean;
}) {
  const visibleSections = view.sections.filter((section) => section.lines.length > 0);

  if (!view.hasRows || visibleSections.length === 0) {
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
        {visibleSections.flatMap((section) => {
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
        {showBalanceCheck ? (
          <>
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
          </>
        ) : null}
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

function AnalysisReportTable({ rows, periods }: { rows: AnalysisRow[]; periods: Period[] }) {
  return (
    <table className="pdf-report-table compact financial">
      <thead>
        <tr>
          <th>Pos</th>
          <th>Sumber</th>
          <th>Aturan</th>
          {periods.map((period) => (
            <th key={period.id}>{period.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) =>
          row.kind === "section" ? (
            <tr className="subtotal-row" key={row.key}>
              <td colSpan={periods.length + 3}>{row.label}</td>
            </tr>
          ) : (
            <tr key={row.key}>
              <td>{row.label}</td>
              <td>{getDebtScheduleSourceLabel(row)}</td>
              <td>{formatDebtScheduleReportRule(row)}</td>
              {periods.map((period) => (
                <td className="numeric-cell" key={period.id}>
                  {formatAnalysisReportValue(row.values[period.id] ?? null, row.valueFormat)}
                </td>
              ))}
            </tr>
          ),
        )}
      </tbody>
    </table>
  );
}

function formatDebtScheduleReportRule(row: AnalysisRow): string {
  const detail = getDebtScheduleDetailLabel(row);

  return detail ? `${getDebtScheduleRuleLabel(row)}. ${detail}` : getDebtScheduleRuleLabel(row);
}

function formatAnalysisReportValue(value: number | null, valueFormat: AnalysisRow["valueFormat"] = "currency"): string {
  if (value === null || !Number.isFinite(value)) {
    return "-";
  }

  return valueFormat === "percent" ? formatPercent(value) : formatIdr(value);
}

function formatTraceValue(trace: FormulaTrace): string {
  if (trace.valueFormat === "percent") {
    return formatPercent(trace.value);
  }

  if (trace.valueFormat === "number") {
    return formatInputNumber(trace.value);
  }

  return formatIdr(trace.value);
}

function findTraceValueById(output: MethodOutput, id: string, fallback = 0): number {
  return output.traces.find((trace) => trace.id === id)?.value ?? fallback;
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

function buildDriverMetrics(payload: ValuationPdfExportPayload, scope: ValuationPdfExportScope): ReportMetric[] {
  const { input } = payload;
  const metrics: ReportMetric[] = [
    { label: "Tax rate", value: formatPercent(input.snapshot.taxRate), note: input.resolvedAssumptions.taxRateSource || input.assumptions.taxRateSource },
  ];

  if (scope.methods.includes("AAM")) {
    metrics.push(
      { label: "Aset historis AAM", value: formatIdr(input.aamAdjustmentModel.historicalAssetTotal) },
      { label: "Liabilitas historis AAM", value: formatIdr(input.aamAdjustmentModel.historicalLiabilityTotal) },
      { label: "Liabilitas + Ekuitas AAM", value: formatIdr(input.aamAdjustmentModel.adjustedLiabilityEquityTotal) },
      { label: "Selisih balance AAM", value: formatIdr(input.aamAdjustmentModel.adjustedBalanceGap) },
    );
  }

  if (scope.methods.includes("EEM")) {
    const activeReturnOnTangibleAsset = findTraceValueById(input.results.eem, "eem-return-on-tangible-asset", input.snapshot.requiredReturnOnNta);

    metrics.push(
      { label: "Basis EEM aktif", value: input.activeEemBasisLabel || eemSensitivityContext.base.label, note: input.activeEemBasisSummary || eemSensitivityContext.base.note },
      { label: "Nilai aktif EEM", value: formatIdr(input.results.eem.equityValue), note: input.activeEemBasisLabel || eemSensitivityContext.base.label },
      { label: "Required return on NTA", value: formatPercent(input.snapshot.requiredReturnOnNta) },
      {
        label: "Return on Tangible Asset aktif",
        value: formatPercent(activeReturnOnTangibleAsset),
        note: input.activeEemReturnOnTangibleAssetLabel || "Kalkulator required return on NTA",
      },
      { label: "Nett Tangible Asset Value", value: formatIdr(findTraceValueById(input.results.eem, "eem-net-tangible-asset-value")) },
      { label: "Non-operating assets", value: formatIdr(input.results.nonOperatingAssets) },
    );
  }

  if (scope.methods.some((method) => method === "EEM" || method === "DCF")) {
    metrics.push({ label: "WACC", value: formatPercent(input.snapshot.wacc), note: input.activeWaccBasisLabel || input.resolvedAssumptions.waccSource || input.assumptions.waccSource });
  }

  if (scope.methods.includes("DCF")) {
    metrics.push(
      { label: "Basis DCF aktif", value: input.activeDcfBasisLabel || "DCF - skenario dasar", note: input.activeDcfBasisSummary || "Default sistem" },
      {
        label: "Horizon proyeksi DCF",
        value: `${input.activeDcfProjectionHorizonYears ?? input.results.dcf.forecast.length} tahun`,
        note: "Periode proyeksi eksplisit yang dihitung engine DCF.",
      },
      {
        label: "Terminal treatment",
        value: input.activeDcfTerminalTreatmentLabel || "Default terminal value",
        note: input.activeDcfTerminalTreatmentSummary || "Terminal value mengikuti growth/WACC.",
      },
      {
        label: "Terminal growth",
        value: formatPercentFixed(input.snapshot.terminalGrowth),
        note: input.resolvedAssumptions.terminalGrowthSource || input.assumptions.terminalGrowthSource,
      },
      { label: "Revenue growth", value: formatPercent(input.snapshot.revenueGrowth) },
      { label: "Nilai aktif DCF", value: formatIdr(input.results.projectionGovernance.governedEquityValue), note: input.results.projectionGovernance.title },
    );
  }

  return uniqueMetrics(metrics);
}

function buildScopedTaxRows(activeRows: TaxSimulationMethodRow[], baselineRows: TaxSimulationMethodRow[], scope: ValuationPdfExportScope): TaxSimulationMethodRow[] {
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

function formatCaseProfileAmount(value: number | null, status: CaseProfileDerived["capitalBaseAmountStatus"]): string {
  if (status === "empty") {
    return "Belum dihitung";
  }

  if (status === "invalid" || value === null) {
    return "Data tidak valid";
  }

  return formatIdr(value);
}

function formatDerivedDate(value: string): string {
  return value ? formatDisplayDate(value) : "Belum dihitung";
}

function buildTaxMetrics(row: TaxSimulationMethodRow, overallResistance: string): ReportMetric[] {
  return [
    { label: "Primary method", value: row.method },
    { label: "Basis final", value: row.basisLabel },
    { label: "Resistensi keseluruhan", value: overallResistance },
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
