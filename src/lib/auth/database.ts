import { neon } from "@neondatabase/serverless";

let sqlClient: ReturnType<typeof neon> | null = null;
let schemaPromise: Promise<void> | null = null;

export function isAuthDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

export function getAuthSql(): ReturnType<typeof neon> {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required for authentication.");
  }

  if (!sqlClient) {
    sqlClient = neon(databaseUrl);
  }

  return sqlClient;
}

export async function ensureAuthSchema(): Promise<void> {
  if (!schemaPromise) {
    schemaPromise = createAuthSchema().catch((error) => {
      schemaPromise = null;
      throw error;
    });
  }

  return schemaPromise;
}

async function createAuthSchema(): Promise<void> {
  const sql = getAuthSql();

  await sql`
    CREATE TABLE IF NOT EXISTS pvb_auth_users (
      user_id TEXT PRIMARY KEY,
      password_hash TEXT NOT NULL,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      password_seeded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      password_changed_at TIMESTAMPTZ,
      password_updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS pvb_auth_sessions (
      token_hash TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES pvb_auth_users(user_id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      expires_at TIMESTAMPTZ NOT NULL
    )
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS pvb_auth_sessions_user_id_idx
    ON pvb_auth_sessions (user_id)
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS pvb_auth_sessions_expires_at_idx
    ON pvb_auth_sessions (expires_at)
  `;
}
