import { NextResponse } from "next/server";
import { ensureAuthSchema, getAuthSql, isAuthDatabaseConfigured } from "@/lib/auth/database";
import { hashPassword, validateNewPassword, verifyPassword } from "@/lib/auth/password";
import { deleteOtherUserSessions, getCurrentAuthSession } from "@/lib/auth/session";

export const runtime = "nodejs";

type PasswordUserRow = {
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

  const session = await getCurrentAuthSession();

  if (!session) {
    return NextResponse.json({ message: "Sesi login sudah berakhir. Silakan login ulang." }, { status: 401 });
  }

  const body = await readJsonBody(request);
  const currentPassword = typeof body?.currentPassword === "string" ? body.currentPassword : "";
  const newPassword = typeof body?.newPassword === "string" ? body.newPassword : "";
  const confirmPassword = typeof body?.confirmPassword === "string" ? body.confirmPassword : "";

  if (!currentPassword || !newPassword || !confirmPassword) {
    return NextResponse.json({ message: "Isi password saat ini, password baru, dan konfirmasi password." }, { status: 400 });
  }

  if (newPassword !== confirmPassword) {
    return NextResponse.json({ message: "Konfirmasi password baru tidak sama." }, { status: 400 });
  }

  const validationMessage = validateNewPassword(session.userId, newPassword);

  if (validationMessage) {
    return NextResponse.json({ message: validationMessage }, { status: 400 });
  }

  await ensureAuthSchema();

  const sql = getAuthSql();
  const rows = (await sql`
    SELECT user_id, password_hash, is_active
    FROM pvb_auth_users
    WHERE user_id = ${session.userId}
    LIMIT 1
  `) as PasswordUserRow[];
  const user = rows[0];

  if (!user || !user.is_active) {
    return NextResponse.json({ message: "Akun tidak aktif. Hubungi administrator aplikasi." }, { status: 403 });
  }

  const isCurrentPasswordValid = await verifyPassword(currentPassword, user.password_hash);

  if (!isCurrentPasswordValid) {
    return NextResponse.json({ message: "Password saat ini tidak sesuai." }, { status: 401 });
  }

  const nextPasswordHash = await hashPassword(newPassword);

  await sql`
    UPDATE pvb_auth_users
    SET password_hash = ${nextPasswordHash},
        password_changed_at = NOW(),
        password_updated_at = NOW()
    WHERE user_id = ${session.userId}
  `;
  await deleteOtherUserSessions(session.userId, session.tokenHash);

  return NextResponse.json({ ok: true });
}

async function readJsonBody(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const body: unknown = await request.json();
    return body && typeof body === "object" && !Array.isArray(body) ? (body as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}
