import { isAuthDatabaseConfigured } from "./database";
import { getCurrentAuthSession, type AuthSession } from "./session";
import { isSuperAdminUser } from "./roles";

export type SuperAdminAuthResult =
  | {
      status: "ok";
      session: AuthSession;
    }
  | {
      status: "unconfigured" | "unauthenticated" | "forbidden";
    };

export async function getSuperAdminAuthResult(): Promise<SuperAdminAuthResult> {
  if (!isAuthDatabaseConfigured()) {
    return { status: "unconfigured" };
  }

  const session = await getCurrentAuthSession();

  if (!session) {
    return { status: "unauthenticated" };
  }

  if (!isSuperAdminSession(session)) {
    return { status: "forbidden" };
  }

  return { status: "ok", session };
}

export function isSuperAdminSession(session: Pick<AuthSession, "userId" | "role">): boolean {
  return isSuperAdminUser(session.userId, session.role);
}
