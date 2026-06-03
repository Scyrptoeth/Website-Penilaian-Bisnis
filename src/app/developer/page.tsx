import { redirect } from "next/navigation";
import { isSuperAdminSession } from "@/lib/auth/admin";
import { getCurrentAuthSession } from "@/lib/auth/session";
import {
  ensureTelemetrySchema,
  getTelemetrySql,
  isTelemetryDatabaseConfigured,
  type DeveloperFeedbackRow,
  type ExportCountRow,
} from "@/lib/telemetry/database";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export default async function DeveloperPage() {
  const session = await getCurrentAuthSession();

  if (!session) {
    redirect("/");
  }

  if (!isSuperAdminSession(session)) {
    return (
      <main className="developer-page">
        <section className="developer-panel">
          <p className="eyebrow">Developer</p>
          <h1>Akses SuperAdmin diperlukan</h1>
          <p>Dashboard feedback dan export counter hanya tersedia untuk developer/SuperAdmin.</p>
        </section>
      </main>
    );
  }

  if (!isTelemetryDatabaseConfigured()) {
    return (
      <main className="developer-page">
        <section className="developer-panel">
          <p className="eyebrow">Developer</p>
          <h1>Storage belum terhubung</h1>
          <p>Set `DATABASE_URL` untuk menampilkan feedback anonim dan jumlah export.</p>
        </section>
      </main>
    );
  }

  await ensureTelemetrySchema();

  const sql = getTelemetrySql();
  const feedbackRows = (await sql`
      SELECT id, feedback_text, source_tab, created_at
      FROM pvb_anonymous_feedback
      ORDER BY created_at DESC
      LIMIT 50
    `) as DeveloperFeedbackRow[];
  const exportCountRows = (await sql`
      SELECT
        export_type,
        export_scope,
        COUNT(*) AS export_count,
        MAX(created_at) AS last_exported_at
      FROM pvb_export_events
      GROUP BY export_type, export_scope
      ORDER BY export_type ASC, export_scope ASC
    `) as ExportCountRow[];

  const totalExports = exportCountRows.reduce((sum, row) => sum + Number(row.export_count), 0);

  return (
    <main className="developer-page">
      <section className="developer-hero">
        <div>
          <p className="eyebrow">Developer</p>
          <h1>Feedback & Export Counter</h1>
          <p>Ringkasan feedback anonim dan estimasi penggunaan export website.</p>
        </div>
        <div className="developer-total-card">
          <span>Total export</span>
          <strong>{totalExports.toLocaleString("id-ID")}</strong>
        </div>
      </section>

      <section className="developer-panel">
        <div className="developer-section-heading">
          <div>
            <p className="eyebrow">Telemetry</p>
            <h2>Jumlah export</h2>
          </div>
        </div>
        {exportCountRows.length ? (
          <div className="developer-table-wrap">
            <table className="developer-table">
              <thead>
                <tr>
                  <th>Jenis</th>
                  <th>Scope</th>
                  <th>Jumlah</th>
                  <th>Terakhir</th>
                </tr>
              </thead>
              <tbody>
                {exportCountRows.map((row) => (
                  <tr key={`${row.export_type}-${row.export_scope}`}>
                    <td>{row.export_type.toUpperCase()}</td>
                    <td>{row.export_scope}</td>
                    <td>{Number(row.export_count).toLocaleString("id-ID")}</td>
                    <td>{formatTelemetryDate(row.last_exported_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="developer-empty">Belum ada export yang tercatat.</p>
        )}
      </section>

      <section className="developer-panel">
        <div className="developer-section-heading">
          <div>
            <p className="eyebrow">Feedback anonim</p>
            <h2>Masukan pengguna terbaru</h2>
          </div>
          <span className="status-pill muted">{feedbackRows.length} terbaru</span>
        </div>
        {feedbackRows.length ? (
          <div className="developer-feedback-list">
            {feedbackRows.map((row) => (
              <article className="developer-feedback-item" key={row.id}>
                <p>{row.feedback_text}</p>
                <small>
                  {row.source_tab} - {formatTelemetryDate(row.created_at)}
                </small>
              </article>
            ))}
          </div>
        ) : (
          <p className="developer-empty">Belum ada feedback yang masuk.</p>
        )}
      </section>
    </main>
  );
}

function formatTelemetryDate(value: Date | string): string {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Jakarta",
  }).format(new Date(value));
}
