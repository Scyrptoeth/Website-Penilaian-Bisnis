import { neon } from "@neondatabase/serverless";
import { SUPER_ADMIN_USER_ID } from "./roles";

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
      role TEXT NOT NULL DEFAULT 'user',
      default_password_hash TEXT,
      password_seeded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      password_changed_at TIMESTAMPTZ,
      password_updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `;

  await sql`
    ALTER TABLE pvb_auth_users
    ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user'
  `;

  await sql`
    ALTER TABLE pvb_auth_users
    ADD COLUMN IF NOT EXISTS default_password_hash TEXT
  `;

  await sql`
    UPDATE pvb_auth_users
    SET role = 'super_admin'
    WHERE user_id = ${SUPER_ADMIN_USER_ID}
      AND role <> 'super_admin'
  `;

  await sql`
    UPDATE pvb_auth_users
    SET default_password_hash = password_hash
    WHERE default_password_hash IS NULL
      AND password_changed_at IS NULL
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
