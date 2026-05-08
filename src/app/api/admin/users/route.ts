import { NextResponse } from "next/server";
import { getSuperAdminAuthResult } from "@/lib/auth/admin";
import { adminAuthFailureResponse, readJsonBody } from "@/lib/auth/admin-route-helpers";
import { ensureAuthSchema, getAuthSql } from "@/lib/auth/database";
import { hashPassword, validateNewPassword } from "@/lib/auth/password";
import { normalizeAuthRole, SUPER_ADMIN_USER_ID } from "@/lib/auth/roles";
import { deleteUserSessions } from "@/lib/auth/session";
import { validateManagedUserId } from "@/lib/auth/user-validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type AdminUserRow = {
  user_id: string;
  role: string | null;
  is_active: boolean;
  has_default_password: boolean;
  password_seeded_at: Date | string | null;
  password_changed_at: Date | string | null;
  password_updated_at: Date | string | null;
};

type ExistingUserRow = {
  user_id: string;
  is_active: boolean;
};

export async function GET() {
  const authResult = await getSuperAdminAuthResult();
  const authFailure = adminAuthFailureResponse(authResult);

  if (authFailure) {
    return authFailure;
  }

  await ensureAuthSchema();

  const sql = getAuthSql();
  const rows = (await sql`
    SELECT
      user_id,
      role,
      is_active,
      default_password_hash IS NOT NULL AS has_default_password,
      password_seeded_at,
      password_changed_at,
      password_updated_at
    FROM pvb_auth_users
    ORDER BY
      CASE WHEN user_id = ${SUPER_ADMIN_USER_ID} THEN 0 ELSE 1 END,
      is_active DESC,
      user_id ASC
  `) as AdminUserRow[];

  return NextResponse.json({
    users: rows.map((row) => ({
      userId: row.user_id,
      role: normalizeAuthRole(row.role),
      isActive: row.is_active,
      hasDefaultPassword: row.has_default_password,
      passwordSeededAt: row.password_seeded_at,
      passwordChangedAt: row.password_changed_at,
      passwordUpdatedAt: row.password_updated_at,
    })),
  });
}

export async function POST(request: Request) {
  const authResult = await getSuperAdminAuthResult();
  const authFailure = adminAuthFailureResponse(authResult);

  if (authFailure) {
    return authFailure;
  }

  const body = await readJsonBody(request);
  const userId = typeof body?.userId === "string" ? body.userId.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  const userIdValidationMessage = validateManagedUserId(userId);

  if (userIdValidationMessage) {
    return NextResponse.json({ message: userIdValidationMessage }, { status: 400 });
  }

  const passwordValidationMessage = validateNewPassword(userId, password);

  if (passwordValidationMessage) {
    return NextResponse.json({ message: passwordValidationMessage }, { status: 400 });
  }

  await ensureAuthSchema();

  const sql = getAuthSql();
  const existingRows = (await sql`
    SELECT user_id, is_active
    FROM pvb_auth_users
    WHERE user_id = ${userId}
    LIMIT 1
  `) as ExistingUserRow[];
  const existingUser = existingRows[0];

  if (existingUser?.is_active) {
    return NextResponse.json({ message: "Pengguna dengan NIP Pendek tersebut sudah aktif." }, { status: 409 });
  }

  const passwordHash = await hashPassword(password);
  const role = userId === SUPER_ADMIN_USER_ID ? "super_admin" : "user";

  if (existingUser) {
    await sql`
      UPDATE pvb_auth_users
      SET password_hash = ${passwordHash},
          default_password_hash = ${passwordHash},
          role = CASE
            WHEN user_id = ${SUPER_ADMIN_USER_ID} THEN 'super_admin'
            ELSE role
          END,
          is_active = TRUE,
          password_seeded_at = NOW(),
          password_changed_at = NULL,
          password_updated_at = NOW()
      WHERE user_id = ${userId}
    `;
    await deleteUserSessions(userId);
  } else {
    await sql`
      INSERT INTO pvb_auth_users (user_id, password_hash, default_password_hash, role, is_active, password_seeded_at, password_updated_at)
      VALUES (${userId}, ${passwordHash}, ${passwordHash}, ${role}, TRUE, NOW(), NOW())
    `;
  }

  return NextResponse.json({ ok: true, userId, role });
}
