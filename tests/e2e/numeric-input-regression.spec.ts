import { expect, test, type Page } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await loginIfAuthGateVisible(page);
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();
  await loginIfAuthGateVisible(page);
  await expect(page.getByTestId("valuation-workbench")).toBeVisible();
});

test("integer amount fields keep accepting typed digits after thousands separators", async ({ page }) => {
  const fullCapitalInput = page.getByLabel("Jumlah Modal Disetor 100%");
  const valuedCapitalInput = page.getByLabel("Jumlah Modal Disetor yang Dinilai");

  await fullCapitalInput.fill("5,280,000,000");
  await valuedCapitalInput.fill("Rp 1,610,000,000");
  await expect(fullCapitalInput).toHaveValue("5.280.000.000");
  await expect(valuedCapitalInput).toHaveValue("1.610.000.000");

  await fullCapitalInput.fill("");
  await valuedCapitalInput.fill("");
  await fullCapitalInput.pressSequentially("5280000000");
  await valuedCapitalInput.pressSequentially("1610000000");
  await expect(fullCapitalInput).toHaveValue("5.280.000.000");
  await expect(valuedCapitalInput).toHaveValue("1.610.000.000");
  await expect(page.getByTestId("case-profile-panel")).toContainText("30,49%");
  await page.getByRole("button", { name: /Tambah Y-1/ }).click();

  await openWorkflowTab(page, "Neraca");
  await page.getByRole("button", { name: "Tambah akun neraca" }).first().click();
  const balanceRow = page.getByTestId("balance-account-table-row").last();
  await balanceRow.getByLabel("Nama akun").fill("Kas");
  await balanceRow.getByLabel("Tahun Y amount").pressSequentially("1234567890");
  await expect(balanceRow.getByLabel("Tahun Y amount")).toHaveValue("1.234.567.890");

  await openWorkflowTab(page, "Aset Tetap");
  await page.getByRole("button", { name: "Tambah kelas aset" }).click();
  const acquisition = page.getByTestId("fixed-asset-acquisition-table");
  await acquisition.getByLabel("Kelas aset").fill("Factory equipment");
  await acquisition.getByLabel("A. Biaya Perolehan Tahun Y-1 Saldo awal").pressSequentially("9876543210");
  await expect(acquisition.getByLabel("A. Biaya Perolehan Tahun Y-1 Saldo awal")).toHaveValue("9.876.543.210");
});

async function loginIfAuthGateVisible(page: Page) {
  const loginPanel = page.getByTestId("auth-login-panel");
  const isLoginVisible = await loginPanel.isVisible({ timeout: 1_000 }).catch(() => false);

  if (!isLoginVisible) {
    return;
  }

  const userId = process.env.PVB_E2E_USER_ID;
  const password = process.env.PVB_E2E_PASSWORD;

  if (!userId || !password) {
    throw new Error("PVB_E2E_USER_ID and PVB_E2E_PASSWORD are required when e2e tests target an auth-gated deployment.");
  }

  await page.getByLabel("NIP Pendek", { exact: true }).fill(userId);
  await page.getByLabel("Password Pengguna").fill(password);
  await page.getByRole("button", { name: "Masuk" }).click();
  await expect(page.getByTestId("valuation-workbench")).toBeVisible();
}

function workflowNav(page: Page) {
  return page.getByRole("navigation", { name: "Bagian model" });
}

async function openWorkflowTab(page: Page, name: string) {
  await workflowNav(page).getByRole("button", { name, exact: true }).click();
}
