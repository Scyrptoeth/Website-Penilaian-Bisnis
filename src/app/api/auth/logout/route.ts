import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  AUTH_SESSION_COOKIE_NAME,
  clearAuthSessionCookie,
  deleteAuthSessionByToken,
} from "@/lib/auth/session";
import { isAuthDatabaseConfigured } from "@/lib/auth/database";

export const runtime = "nodejs";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_SESSION_COOKIE_NAME)?.value;

  if (token && isAuthDatabaseConfigured()) {
    await deleteAuthSessionByToken(token);
  }

  clearAuthSessionCookie(response);

  return response;
}
