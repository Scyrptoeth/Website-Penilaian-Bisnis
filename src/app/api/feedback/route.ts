import { NextResponse } from "next/server";
import { readJsonBody } from "@/lib/auth/admin-route-helpers";
import { ensureTelemetrySchema, getTelemetrySql, isTelemetryDatabaseConfigured } from "@/lib/telemetry/database";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const maxFeedbackLength = 1200;

export async function POST(request: Request) {
  if (!isTelemetryDatabaseConfigured()) {
    return NextResponse.json({ message: "Storage feedback belum terhubung. Hubungi developer aplikasi." }, { status: 503 });
  }

  const body = await readJsonBody(request);
  const feedbackText = typeof body?.feedback === "string" ? body.feedback.trim() : "";

  if (feedbackText.length < 4) {
    return NextResponse.json({ message: "Feedback terlalu singkat. Tulis minimal 4 karakter." }, { status: 400 });
  }

  if (feedbackText.length > maxFeedbackLength) {
    return NextResponse.json({ message: `Feedback maksimal ${maxFeedbackLength} karakter.` }, { status: 400 });
  }

  await ensureTelemetrySchema();

  const sql = getTelemetrySql();

  await sql`
    INSERT INTO pvb_anonymous_feedback (feedback_text, source_tab)
    VALUES (${feedbackText}, 'Data Awal')
  `;

  return NextResponse.json({ ok: true });
}
