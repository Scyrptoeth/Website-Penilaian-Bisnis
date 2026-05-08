import assert from "node:assert/strict";
import test from "node:test";
import { hashPassword, validateNewPassword, verifyPassword } from "@/lib/auth/password";

test("password hashes verify only the matching password", async () => {
  const hash = await hashPassword("initial-1234");

  assert.equal(await verifyPassword("initial-1234", hash), true);
  assert.equal(await verifyPassword("wrong-password", hash), false);
});

test("new password validation enforces length and rejects NIP Pendek reuse", () => {
  assert.equal(validateNewPassword("123456", "abcde"), "Password baru harus terdiri dari 6 sampai 64 karakter.");
  assert.equal(validateNewPassword("123456", "123456"), "Password baru tidak boleh sama dengan NIP Pendek.");
  assert.equal(validateNewPassword("123456", "new-password"), null);
});
