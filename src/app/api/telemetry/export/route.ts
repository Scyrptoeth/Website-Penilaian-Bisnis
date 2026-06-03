import { NextResponse } from "next/server";
import { readJsonBody } from "@/lib/auth/admin-route-helpers";
import {
  ensureTelemetrySchema,
  getTelemetrySql,
  isTelemetryDatabaseConfigured,
  type ExportTelemetryType,
} from "@/lib/telemetry/database";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const exportTypes = new Set<ExportTelemetryType>(["pdf", "xlsx", "json"]);
const maxScopeLength = 80;

export async function POST(request: Request) {
  if (!isTelemetryDatabaseConfigured()) {
    return NextResponse.json({ message: "Storage export counter belum terhubung." }, { status: 503 });
  }

  const body = await readJsonBody(request);
  const exportType = typeof body?.exportType === "string" ? body.exportType.trim().toLowerCase() : "";
  const exportScope = typeof body?.exportScope === "string" ? body.exportScope.trim().slice(0, maxScopeLength) : "all";

  if (!exportTypes.has(exportType as ExportTelemetryType)) {
    return NextResponse.json({ message: "Jenis export tidak valid." }, { status: 400 });
  }

  await ensureTelemetrySchema();

  const sql = getTelemetrySql();

  await sql`
    INSERT INTO pvb_export_events (export_type, export_scope)
    VALUES (${exportType}, ${exportScope || "all"})
  `;

  return NextResponse.json({ ok: true });
}
