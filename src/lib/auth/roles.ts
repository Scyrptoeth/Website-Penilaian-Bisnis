export const SUPER_ADMIN_USER_ID = "830300970";

export const AUTH_ROLES = ["user", "super_admin"] as const;

export type AuthRole = (typeof AUTH_ROLES)[number];

export function normalizeAuthRole(value: unknown): AuthRole {
  return value === "super_admin" ? "super_admin" : "user";
}

export function isSuperAdminUser(userId: string, role?: unknown): boolean {
  return userId === SUPER_ADMIN_USER_ID || normalizeAuthRole(role) === "super_admin";
}
