import { neon } from "@neondatabase/serverless";

let telemetrySqlClient: ReturnType<typeof neon> | null = null;
let telemetrySchemaPromise: Promise<void> | null = null;

export type ExportTelemetryType = "pdf" | "xlsx" | "json";

export type DeveloperFeedbackRow = {
  id: number;
  feedback_text: string;
  source_tab: string;
  created_at: Date | string;
};

export type ExportCountRow = {
  export_type: ExportTelemetryType;
  export_scope: string;
  export_count: string | number;
  last_exported_at: Date | string;
};

export function isTelemetryDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

export function getTelemetrySql(): ReturnType<typeof neon> {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required for telemetry.");
  }

  if (!telemetrySqlClient) {
    telemetrySqlClient = neon(databaseUrl);
  }

  return telemetrySqlClient;
}

export async function ensureTelemetrySchema(): Promise<void> {
  if (!telemetrySchemaPromise) {
    telemetrySchemaPromise = createTelemetrySchema().catch((error) => {
      telemetrySchemaPromise = null;
      throw error;
    });
  }

  return telemetrySchemaPromise;
}

async function createTelemetrySchema(): Promise<void> {
  const sql = getTelemetrySql();

  await sql`
    CREATE TABLE IF NOT EXISTS pvb_anonymous_feedback (
      id BIGSERIAL PRIMARY KEY,
      feedback_text TEXT NOT NULL,
      source_tab TEXT NOT NULL DEFAULT 'Data Awal',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS pvb_anonymous_feedback_created_at_idx
    ON pvb_anonymous_feedback (created_at DESC)
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS pvb_export_events (
      id BIGSERIAL PRIMARY KEY,
      export_type TEXT NOT NULL,
      export_scope TEXT NOT NULL DEFAULT 'all',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS pvb_export_events_type_scope_idx
    ON pvb_export_events (export_type, export_scope, created_at DESC)
  `;
}
