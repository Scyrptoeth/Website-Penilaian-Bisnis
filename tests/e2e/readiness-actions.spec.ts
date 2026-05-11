import { expect, test, type Page } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();
  await expect(page.getByTestId("valuation-workbench")).toBeVisible();
});

test("readiness action links add the expected editable input rows", async ({ page }) => {
  await openWorkflowTab(page, "Laba Rugi");
  const incomeReadiness = page.getByTestId("readiness-income");
  await expect(incomeReadiness).toHaveClass(/blocking/);
  await expect(incomeReadiness.locator(".badge.danger")).toContainText("Perlu dilengkapi");
  await incomeReadiness.getByRole("link", { name: /Isi Laba Rugi/ }).click();
  await expect(page.getByTestId("income-account-table-row")).toHaveCount(1);

  await openWorkflowTab(page, "Aset Tetap");
  await page.getByTestId("readiness-fixedAssets").getByRole("link", { name: /Isi Aset Tetap/ }).click();
  await expect(page.getByTestId("fixed-asset-acquisition-table")).toBeVisible();
  await expect(page.getByTestId("fixed-asset-acquisition-table").getByTestId("fixed-asset-row")).toHaveCount(1);
  await expect(page.getByTestId("readiness-fixedAssets")).toHaveCount(0);

  await openWorkflowTab(page, "Neraca");
  await page.getByTestId("readiness-balance").getByRole("link", { name: /Isi Neraca/ }).click();
  await expect(page.getByTestId("balance-account-table-row")).toHaveCount(1);
});

test("readiness links highlight the exact target action after navigation", async ({ page }) => {
  await openWorkflowTab(page, "Cash Flow Statement");
  const cashFlowReadiness = page.getByTestId("readiness-cashFlowStatement");
  await expect(cashFlowReadiness).not.toContainText("Basis operating working capital");
  await expect(cashFlowReadiness).not.toContainText("Akun sudah dikategorikan");

  await cashFlowReadiness.getByRole("link", { name: /Tambah Periode/ }).click();
  const addPeriodButton = page.getByRole("button", { name: /Tambah Y-1/ });
  await expect(addPeriodButton).toHaveClass(/action-guidance/);
  await expect(addPeriodButton.locator(".action-guidance-badge")).toContainText("Aksi dibutuhkan");
  await addPeriodButton.click();
  await expect(page.locator('[data-guidance-target="add-period"]')).toHaveCount(0);
  await expect(page.getByTestId("period-card")).toHaveCount(2);
  await page.getByLabel("Tanggal penilaian").fill("2021-12-31");

  await openWorkflowTab(page, "Jadwal Utang");
  await expect(page.getByTestId("readiness-payablesCashFlow")).not.toContainText("Basis operating working capital");
  await expect(page.getByTestId("readiness-payablesCashFlow")).not.toContainText("Akun sudah dikategorikan");

  await openWorkflowTab(page, "NOPLAT & FCF");
  const noplatReadiness = page.getByTestId("readiness-noplatFcf");
  await expect(noplatReadiness).not.toContainText("Basis operating working capital");
  await expect(noplatReadiness).not.toContainText("Akun sudah dikategorikan");

  await noplatReadiness.getByRole("link", { name: /Isi Asumsi EEM\/DCF/ }).click();
  const statutoryCandidate = page.locator('[data-guidance-target="tax-rate-statutory"]');
  await expect(statutoryCandidate).toHaveClass(/action-guidance/);
  await expect(statutoryCandidate).toContainText("Tarif umum statutory 2021");
  await expect(statutoryCandidate.locator(".action-guidance-badge")).toContainText("Aksi dibutuhkan");
});

test("suggestion actions use accent styling instead of plain white buttons", async ({ page }) => {
  await page.getByLabel("Tanggal penilaian").fill("2021-12-31");

  await openWorkflowTab(page, "WACC");
  await expect(page.getByRole("button", { name: "Terapkan Saran", exact: true })).toHaveClass(/secondary/);

  await openWorkflowTab(page, "Asumsi EEM/DCF");
  const recommendedCandidate = page.locator(".candidate-button.recommended").first();
  await expect(recommendedCandidate).toBeVisible();
  await expect(recommendedCandidate).toContainText("Tarif umum statutory 2021");
});

test("system suggestion badges do not push Data Awal controls out of alignment", async ({ page }) => {
  await page.getByLabel("KLU sesuai Appportal").fill("10110");
  await expect(page.getByTestId("company-sector-derived")).toHaveValue("Consumer Non-Cyclicals");
  await expect(page.locator(".derived-sector-field .smart-suggestion-badge")).toContainText("Saran KLU otomatis");

  const sectorTop = await page.getByTestId("company-sector-derived").evaluate((element) => Math.round(element.getBoundingClientRect().top));
  const companyTypeTop = await page.getByLabel("Jenis Perusahaan").evaluate((element) => Math.round(element.getBoundingClientRect().top));

  expect(Math.abs(sectorTop - companyTypeTop)).toBeLessThanOrEqual(1);
});

function workflowNav(page: Page) {
  return page.getByRole("navigation", { name: "Bagian model" });
}

async function openWorkflowTab(page: Page, name: string) {
  await workflowNav(page).getByRole("button", { name, exact: true }).click();
}
