import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";

const scrypt = promisify(scryptCallback);
const PASSWORD_HASH_PREFIX = "scrypt$v1";
const PASSWORD_KEY_LENGTH = 64;
const PASSWORD_SALT_BYTES = 16;

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(PASSWORD_SALT_BYTES).toString("base64url");
  const key = (await scrypt(password, salt, PASSWORD_KEY_LENGTH)) as Buffer;

  return `${PASSWORD_HASH_PREFIX}$${salt}$${key.toString("base64url")}`;
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const parts = storedHash.split("$");

  if (parts.length !== 4 || `${parts[0]}$${parts[1]}` !== PASSWORD_HASH_PREFIX) {
    return false;
  }

  const [, , salt, expectedHash] = parts;
  const expected = Buffer.from(expectedHash, "base64url");
  const actual = (await scrypt(password, salt, expected.length)) as Buffer;

  if (actual.length !== expected.length) {
    return false;
  }

  return timingSafeEqual(actual, expected);
}

export function validateNewPassword(userId: string, newPassword: string): string | null {
  if (newPassword.length < 6 || newPassword.length > 64) {
    return "Password baru harus terdiri dari 6 sampai 64 karakter.";
  }

  if (newPassword === userId) {
    return "Password baru tidak boleh sama dengan NIP Pendek.";
  }

  return null;
}
