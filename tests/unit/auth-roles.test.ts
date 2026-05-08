import assert from "node:assert/strict";
import test from "node:test";
import { isSuperAdminUser, normalizeAuthRole, SUPER_ADMIN_USER_ID } from "@/lib/auth/roles";
import { validateManagedUserId } from "@/lib/auth/user-validation";

test("auth role helpers preserve the configured SuperAdmin fallback", () => {
  assert.equal(SUPER_ADMIN_USER_ID, "830300970");
  assert.equal(isSuperAdminUser("830300970", "user"), true);
  assert.equal(isSuperAdminUser("123456789", "super_admin"), true);
  assert.equal(isSuperAdminUser("123456789", "user"), false);
});

test("auth role normalization rejects unknown roles safely", () => {
  assert.equal(normalizeAuthRole("super_admin"), "super_admin");
  assert.equal(normalizeAuthRole("owner"), "user");
  assert.equal(normalizeAuthRole(null), "user");
});

test("managed user ids reject empty, too long, and unsafe path characters", () => {
  assert.equal(validateManagedUserId(""), "Isi NIP Pendek atau ID Pengguna.");
  assert.equal(validateManagedUserId("a".repeat(65)), "NIP Pendek atau ID Pengguna maksimal 64 karakter.");
  assert.equal(
    validateManagedUserId("123/456"),
    "NIP Pendek atau ID Pengguna tidak boleh berisi karakter kontrol atau garis miring.",
  );
  assert.equal(validateManagedUserId("830300970"), null);
});
