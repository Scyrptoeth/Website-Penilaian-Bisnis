import { loadEnvConfig } from "@next/env";
import { readSheet } from "read-excel-file/node";
import { ensureAuthSchema, getAuthSql } from "../src/lib/auth/database";
import { hashPassword } from "../src/lib/auth/password";

type SeedUser = {
  userId: string;
  password: string;
};

const defaultWorkbookPath = "/Users/persiapantubel/Desktop/codex/penilaian-bisnis/daftar-user-dan-password.xlsx";

async function main() {
  loadEnvConfig(process.cwd());

  const args = process.argv.slice(2);
  const deactivateMissing = args.includes("--deactivate-missing");
  const workbookPath = args.find((arg) => !arg.startsWith("--")) ?? defaultWorkbookPath;
  const users = await readUsersFromWorkbook(workbookPath);

  if (users.length === 0) {
    throw new Error("Workbook tidak berisi user yang dapat disimpan.");
  }

  await ensureAuthSchema();

  const sql = getAuthSql();
  const seededUserIds = new Set<string>();

  for (const [index, user] of users.entries()) {
    const passwordHash = await hashPassword(user.password);
    seededUserIds.add(user.userId);

    await sql`
      INSERT INTO pvb_auth_users (user_id, password_hash, is_active, password_seeded_at, password_updated_at)
      VALUES (${user.userId}, ${passwordHash}, TRUE, NOW(), NOW())
      ON CONFLICT (user_id) DO UPDATE
      SET password_hash = CASE
            WHEN pvb_auth_users.password_changed_at IS NULL THEN EXCLUDED.password_hash
            ELSE pvb_auth_users.password_hash
          END,
          is_active = TRUE,
          password_seeded_at = NOW(),
          password_updated_at = CASE
            WHEN pvb_auth_users.password_changed_at IS NULL THEN NOW()
            ELSE pvb_auth_users.password_updated_at
          END
    `;

    if ((index + 1) % 50 === 0 || index === users.length - 1) {
      console.log(`Seeded ${index + 1}/${users.length} users`);
    }
  }

  if (deactivateMissing) {
    const existingUsers = (await sql`SELECT user_id FROM pvb_auth_users`) as Array<{ user_id: string }>;
    let deactivatedCount = 0;

    for (const existingUser of existingUsers) {
      if (seededUserIds.has(existingUser.user_id)) {
        continue;
      }

      await sql`
        UPDATE pvb_auth_users
        SET is_active = FALSE,
            password_updated_at = NOW()
        WHERE user_id = ${existingUser.user_id}
      `;
      deactivatedCount += 1;
    }

    console.log(`Deactivated ${deactivatedCount} users missing from the workbook.`);
  }

  console.log(`Auth seed completed for ${users.length} users.`);
}

async function readUsersFromWorkbook(workbookPath: string): Promise<SeedUser[]> {
  const rows = await readSheet(workbookPath);
  const [headerRow, ...dataRows] = rows;

  if (!headerRow) {
    throw new Error("Workbook kosong.");
  }

  const headers = headerRow.map((cell) => normalizeHeader(cellToString(cell)));
  const userIdColumnIndex = headers.indexOf("nip pendek");
  const passwordColumnIndex = headers.indexOf("password");

  if (userIdColumnIndex === -1 || passwordColumnIndex === -1) {
    throw new Error('Workbook harus memiliki kolom "NIP Pendek" dan "Password".');
  }

  const users: SeedUser[] = [];
  const seenUserIds = new Set<string>();

  dataRows.forEach((row, rowIndex) => {
    const userId = cellToString(row[userIdColumnIndex]);
    const password = cellToString(row[passwordColumnIndex]);

    if (!userId && !password) {
      return;
    }

    if (!userId || !password) {
      throw new Error(`Baris ${rowIndex + 2} memiliki NIP Pendek atau Password kosong.`);
    }

    if (seenUserIds.has(userId)) {
      throw new Error(`Baris ${rowIndex + 2} memiliki NIP Pendek duplikat.`);
    }

    seenUserIds.add(userId);
    users.push({ userId, password });
  });

  return users;
}

function normalizeHeader(value: string): string {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

function cellToString(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  if (typeof value === "number" && Number.isInteger(value)) {
    return value.toString();
  }

  return String(value).trim();
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
