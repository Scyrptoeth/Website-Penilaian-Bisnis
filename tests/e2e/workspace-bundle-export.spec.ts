import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";

const manifestKey = "penilaian-valuasi-bisnis.workspaces.v1";

test("legacy app exports every workspace in one migration bundle", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByTestId("valuation-workbench")).toBeVisible();

  await page.getByTitle("Kelola workspace lokal").click();
  await page.getByRole("button", { name: "Workspace kosong", exact: true }).click();
  await expect
    .poll(() =>
      page.evaluate((key) => {
        const raw = window.localStorage.getItem(key);
        return raw ? JSON.parse(raw).workspaces.length : 0;
      }, manifestKey),
    )
    .toBe(2);

  await page.getByRole("button", { name: "JSON", exact: true }).click();
  await expect(page.getByRole("menuitem", { name: "Export Workspace Tunggal" })).toContainText("Workspace yang sedang aktif");
  await expect(page.getByRole("menuitem", { name: "Import Workspace Tunggal" })).toContainText(
    "Tambahkan satu workspace dari file JSON",
  );
  await expect(page.getByRole("menuitem", { name: "Export Seluruh Workspace" })).toContainText(
    "Semua workspace dalam satu file",
  );

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("menuitem", { name: "Export Seluruh Workspace" }).click();
  const download = await downloadPromise;
  const downloadPath = await download.path();

  expect(download.suggestedFilename()).toMatch(/^penilaian-bisnis-semua-workspace-\d{4}-\d{2}-\d{2}\.json$/);
  expect(downloadPath).not.toBeNull();
  const payload = JSON.parse(await readFile(downloadPath!, "utf8"));
  expect(payload.schema).toBe("penilaian-valuasi-bisnis.workspace-bundle");
  expect(payload.schemaVersion).toBe(1);
  expect(payload.sourceAppStorageVersion).toBe(22);
  expect(payload.workspaces).toHaveLength(2);
  expect(payload.workspaces.every((workspace: { data?: { version?: number } }) => workspace.data?.version === 22)).toBe(true);
  expect(payload.workspaces.some((workspace: { id: string }) => workspace.id === payload.activeWorkspaceId)).toBe(true);
});
