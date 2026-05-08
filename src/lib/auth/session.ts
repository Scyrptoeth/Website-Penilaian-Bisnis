import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { type NextResponse } from "next/server";
import { ensureAuthSchema, getAuthSql, isAuthDatabaseConfigured } from "./database";
import { type AuthRole, normalizeAuthRole } from "./roles";

export const AUTH_SESSION_COOKIE_NAME = "pvb_session";
export const AUTH_SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export type AuthSession = {
  userId: string;
  role: AuthRole;
  tokenHash: string;
  expiresAt: Date;
};

type AuthSessionRow = {
  user_id: string;
  role: string | null;
  expires_at: Date | string;
};

export async function getCurrentAuthSession(): Promise<AuthSession | null> {
  if (isLocalAuthBypassEnabled()) {
    return {
      userId: "E2E-LOCAL",
      role: "user",
      tokenHash: "local-auth-bypass",
      expiresAt: new Date(Date.now() + AUTH_SESSION_MAX_AGE_SECONDS * 1000),
    };
  }

  if (!isAuthDatabaseConfigured()) {
    return null;
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_SESSION_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  try {
    return await getAuthSessionByToken(token);
  } catch (error) {
    console.error("Failed to read authentication session.", error);
    return null;
  }
}

export async function getAuthSessionByToken(token: string): Promise<AuthSession | null> {
  const tokenHash = hashSessionToken(token);
  await ensureAuthSchema();

  const sql = getAuthSql();
  const rows = (await sql`
    SELECT sessions.user_id, users.role, sessions.expires_at
    FROM pvb_auth_sessions sessions
    INNER JOIN pvb_auth_users users ON users.user_id = sessions.user_id
    WHERE sessions.token_hash = ${tokenHash}
      AND sessions.expires_at > NOW()
      AND users.is_active = TRUE
    LIMIT 1
  `) as AuthSessionRow[];

  const session = rows[0];

  if (!session) {
    return null;
  }

  return {
    userId: session.user_id,
    role: normalizeAuthRole(session.role),
    tokenHash,
    expiresAt: new Date(session.expires_at),
  };
}

export async function deleteUserSessions(userId: string): Promise<void> {
  await ensureAuthSchema();

  const sql = getAuthSql();

  await sql`
    DELETE FROM pvb_auth_sessions
    WHERE user_id = ${userId}
  `;
}

export async function createAuthSession(userId: string): Promise<{ token: string; expiresAt: Date }> {
  await ensureAuthSchema();

  const sql = getAuthSql();
  const token = randomBytes(32).toString("base64url");
  const tokenHash = hashSessionToken(token);
  const expiresAt = new Date(Date.now() + AUTH_SESSION_MAX_AGE_SECONDS * 1000);

  await sql`
    INSERT INTO pvb_auth_sessions (token_hash, user_id, expires_at)
    VALUES (${tokenHash}, ${userId}, ${expiresAt.toISOString()})
  `;

  return { token, expiresAt };
}

export async function deleteAuthSessionByToken(token: string): Promise<void> {
  await ensureAuthSchema();

  const sql = getAuthSql();
  const tokenHash = hashSessionToken(token);

  await sql`
    DELETE FROM pvb_auth_sessions
    WHERE token_hash = ${tokenHash}
  `;
}

export async function deleteOtherUserSessions(userId: string, activeTokenHash: string): Promise<void> {
  await ensureAuthSchema();

  const sql = getAuthSql();

  await sql`
    DELETE FROM pvb_auth_sessions
    WHERE user_id = ${userId}
      AND token_hash <> ${activeTokenHash}
  `;
}

export async function pruneExpiredAuthSessions(): Promise<void> {
  await ensureAuthSchema();

  const sql = getAuthSql();

  await sql`
    DELETE FROM pvb_auth_sessions
    WHERE expires_at <= NOW()
  `;
}

export function setAuthSessionCookie(response: NextResponse, token: string): void {
  response.cookies.set({
    name: AUTH_SESSION_COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: AUTH_SESSION_MAX_AGE_SECONDS,
  });
}

export function clearAuthSessionCookie(response: NextResponse): void {
  response.cookies.set({
    name: AUTH_SESSION_COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
}

function hashSessionToken(token: string): string {
  return createHash("sha256").update(token).digest("base64url");
}

function isLocalAuthBypassEnabled(): boolean {
  return process.env.PVB_AUTH_BYPASS === "1" && process.env.NODE_ENV !== "production";
}
