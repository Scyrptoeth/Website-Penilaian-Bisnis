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

  await openWorkflowTab(page, "Neraca");
  await page.getByTestId("readiness-balance").getByRole("link", { name: /Isi Neraca/ }).click();
  await expect(page.getByTestId("balance-account-table-row")).toHaveCount(1);
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

function workflowNav(page: Page) {
  return page.getByRole("navigation", { name: "Bagian model" });
}

async function openWorkflowTab(page: Page, name: string) {
  await workflowNav(page).getByRole("button", { name, exact: true }).click();
}
