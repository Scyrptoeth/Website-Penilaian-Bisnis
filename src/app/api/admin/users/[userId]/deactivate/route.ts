import { NextResponse } from "next/server";
import { getSuperAdminAuthResult } from "@/lib/auth/admin";
import { adminAuthFailureResponse } from "@/lib/auth/admin-route-helpers";
import { ensureAuthSchema, getAuthSql } from "@/lib/auth/database";
import { isSuperAdminUser, normalizeAuthRole } from "@/lib/auth/roles";
import { deleteUserSessions } from "@/lib/auth/session";
import { validateManagedUserId } from "@/lib/auth/user-validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type DeactivateParams = {
  params: Promise<{
    userId: string;
  }>;
};

type DeactivateUserRow = {
  user_id: string;
  role: string | null;
  is_active: boolean;
};

export async function POST(_request: Request, { params }: DeactivateParams) {
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

  if (userId === authResult.session.userId) {
    return NextResponse.json({ message: "SuperAdmin tidak dapat menonaktifkan akunnya sendiri." }, { status: 400 });
  }

  await ensureAuthSchema();

  const sql = getAuthSql();
  const rows = (await sql`
    SELECT user_id, role, is_active
    FROM pvb_auth_users
    WHERE user_id = ${userId}
    LIMIT 1
  `) as DeactivateUserRow[];
  const user = rows[0];

  if (!user) {
    return NextResponse.json({ message: "Pengguna tidak ditemukan." }, { status: 404 });
  }

  if (isSuperAdminUser(user.user_id, user.role)) {
    return NextResponse.json({ message: "Akun SuperAdmin tidak dapat dinonaktifkan dari panel pengguna." }, { status: 400 });
  }

  if (!user.is_active) {
    return NextResponse.json({ ok: true, userId: user.user_id, role: normalizeAuthRole(user.role), alreadyInactive: true });
  }

  await sql`
    UPDATE pvb_auth_users
    SET is_active = FALSE,
        password_updated_at = NOW()
    WHERE user_id = ${userId}
  `;
  await deleteUserSessions(userId);

  return NextResponse.json({ ok: true, userId: user.user_id, role: normalizeAuthRole(user.role) });
}
