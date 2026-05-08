import { NextResponse } from "next/server";
import { getSuperAdminAuthResult } from "@/lib/auth/admin";
import { adminAuthFailureResponse } from "@/lib/auth/admin-route-helpers";
import { ensureAuthSchema, getAuthSql } from "@/lib/auth/database";
import { normalizeAuthRole } from "@/lib/auth/roles";
import { deleteUserSessions } from "@/lib/auth/session";
import { validateManagedUserId } from "@/lib/auth/user-validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ResetPasswordParams = {
  params: Promise<{
    userId: string;
  }>;
};

type ResetUserRow = {
  user_id: string;
  role: string | null;
  is_active: boolean;
  default_password_hash: string | null;
};

export async function POST(_request: Request, { params }: ResetPasswordParams) {
  const authResult = await getSuperAdminAuthResult();

  if (authResult.status !== "ok") {
    return adminAuthFailureResponse(authResult)!;
  }

  const { userId: rawUserId } = await params;
  const userId = decodeURIComponent(rawUserId).trim();
  const userIdValidationMessage = validateManagedUserId(userId);

  if (userIdValidationMessage) {
    return NextResponse.json({ message: userIdValidationMessage }, { status: 400 });
  }

  await ensureAuthSchema();

  const sql = getAuthSql();
  const rows = (await sql`
    SELECT user_id, role, is_active, default_password_hash
    FROM pvb_auth_users
    WHERE user_id = ${userId}
    LIMIT 1
  `) as ResetUserRow[];
  const user = rows[0];

  if (!user) {
    return NextResponse.json({ message: "Pengguna tidak ditemukan." }, { status: 404 });
  }

  if (!user.is_active) {
    return NextResponse.json({ message: "Pengguna tidak aktif. Aktifkan kembali akun sebelum reset password." }, { status: 400 });
  }

  if (!user.default_password_hash) {
    return NextResponse.json(
      { message: "Default password belum tersedia. Jalankan seed/backfill dari workbook daftar user terlebih dahulu." },
      { status: 409 },
    );
  }

  await sql`
    UPDATE pvb_auth_users
    SET password_hash = default_password_hash,
        password_changed_at = NULL,
        password_updated_at = NOW()
    WHERE user_id = ${userId}
  `;
  await deleteUserSessions(userId);

  return NextResponse.json({
    ok: true,
    userId: user.user_id,
    role: normalizeAuthRole(user.role),
    signedOutCurrentSession: user.user_id === authResult.session.userId,
  });
}
