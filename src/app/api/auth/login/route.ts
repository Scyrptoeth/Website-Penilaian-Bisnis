import { NextResponse } from "next/server";
import { ensureAuthSchema, getAuthSql, isAuthDatabaseConfigured } from "@/lib/auth/database";
import { verifyPassword } from "@/lib/auth/password";
import { createAuthSession, pruneExpiredAuthSessions, setAuthSessionCookie } from "@/lib/auth/session";

export const runtime = "nodejs";

type LoginUserRow = {
  user_id: string;
  password_hash: string;
  is_active: boolean;
};

export async function POST(request: Request) {
  if (!isAuthDatabaseConfigured()) {
    return NextResponse.json(
      { message: "Database login belum terhubung. Hubungi administrator aplikasi." },
      { status: 503 },
    );
  }

  const body = await readJsonBody(request);
  const userId = typeof body?.userId === "string" ? body.userId.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (!userId || !password) {
    return NextResponse.json({ message: "Isi NIP Pendek dan Password Pengguna." }, { status: 400 });
  }

  await ensureAuthSchema();

  const sql = getAuthSql();
  const rows = (await sql`
    SELECT user_id, password_hash, is_active
    FROM pvb_auth_users
    WHERE user_id = ${userId}
    LIMIT 1
  `) as LoginUserRow[];
  const user = rows[0];
  const isValidPassword = user ? await verifyPassword(password, user.password_hash) : false;

  if (!user || !user.is_active || !isValidPassword) {
    return NextResponse.json({ message: "NIP Pendek atau Password Pengguna tidak sesuai." }, { status: 401 });
  }

  await pruneExpiredAuthSessions();
  const session = await createAuthSession(user.user_id);
  const response = NextResponse.json({ ok: true, userId: user.user_id });
  setAuthSessionCookie(response, session.token);

  return response;
}

async function readJsonBody(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const body: unknown = await request.json();
    return body && typeof body === "object" && !Array.isArray(body) ? (body as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}
