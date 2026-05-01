import { expect, test, type Page } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();
  await expect(page.getByTestId("valuation-workbench")).toBeVisible();
});

test("period workflow, scoped categories, and display-only balance sheet classification", async ({ page }) => {
  await expect(page.getByTestId("period-card")).toHaveCount(1);
  await page.getByRole("button", { name: /Tambah Y-1/ }).click();
  await page.getByRole("button", { name: /Tambah Y-2/ }).click();
  await expect(page.getByTestId("period-card")).toHaveCount(3);

  const periodCards = await page.getByTestId("period-card").evaluateAll((cards) =>
    cards.map((card) => ({
      offset: card.getAttribute("data-year-offset"),
      label: (card.querySelector("label input") as HTMLInputElement | null)?.value,
      dateInputCount: card.querySelectorAll('input[type="date"]').length,
    })),
  );

  expect(periodCards).toEqual([
    { offset: "-2", label: "Tahun Y-2", dateInputCount: 0 },
    { offset: "-1", label: "Tahun Y-1", dateInputCount: 0 },
    { offset: "0", label: "Tahun Y", dateInputCount: 1 },
  ]);
  await expect(page.locator('[data-testid="period-card"][data-year-offset="0"]').getByTitle("Tahun Y tidak bisa dihapus")).toBeDisabled();

  await page.getByRole("tab", { name: "Neraca & Fixed Asset" }).click();
  await page.getByRole("button", { name: "Balance Sheet" }).first().click();
  const balanceRow = page.getByTestId("balance-account-table-row").last();
  await balanceRow.getByLabel("Nama akun").fill("Kas");
  await balanceRow.getByLabel("Tahun Y amount").fill("1000");
  await expect(balanceRow).toContainText("Saran: Cash on Hand");
  await expect(balanceRow.getByLabel("Kategori utama").locator("option", { hasText: "Revenue" })).toHaveCount(0);

  const totalBefore = await getTotalAssetsText(page);
  await balanceRow.getByLabel("Klasifikasi neraca").selectOption("non_current_asset");
  await expect(page.getByTestId("balance-sheet-position-table")).toContainText("Non-current Asset");
  await expect.poll(() => getTotalAssetsText(page)).toBe(totalBefore);

  await page.getByRole("tab", { name: "Laba Rugi" }).click();
  await page.getByRole("button", { name: "Income Statement" }).click();
  const incomeRow = page.getByTestId("income-account-table-row").last();
  await expect(incomeRow.getByLabel("Kategori utama").locator("option", { hasText: "Account payable" })).toHaveCount(0);
});

test("fixed asset schedule remains empty until user adds a class and then rolls forward values", async ({ page }) => {
  await page.getByRole("button", { name: /Tambah Y-1/ }).click();
  await page.getByRole("tab", { name: "Neraca & Fixed Asset" }).click();
  await page.getByRole("button", { name: "Fixed Asset Schedule" }).click();
  await expect(page.getByTestId("fixed-asset-empty")).toBeVisible();

  await page.getByRole("button", { name: "Tambah kelas aset" }).click();
  await expect(page.getByTestId("fixed-asset-row")).toHaveCount(2);

  const acquisition = page.getByTestId("fixed-asset-acquisition-table");
  const depreciation = page.getByTestId("fixed-asset-depreciation-table");
  await acquisition.getByLabel("Asset class").fill("Factory equipment");
  await acquisition.getByLabel("A. Acquisition Costs Tahun Y-1 Beginning").fill("100");
  await acquisition.getByLabel("A. Acquisition Costs Tahun Y-1 Additions").fill("50");
  await acquisition.getByLabel("A. Acquisition Costs Tahun Y Additions").fill("20");
  await depreciation.getByLabel("B. Depreciation Tahun Y-1 Beginning").fill("10");
  await depreciation.getByLabel("B. Depreciation Tahun Y-1 Additions").fill("5");
  await depreciation.getByLabel("B. Depreciation Tahun Y Additions").fill("8");

  await expect(page.getByTestId("fixed-asset-net-value-table")).toContainText("135");
  await expect(page.getByTestId("fixed-asset-net-value-table")).toContainText("147");
  await expect(page.getByTestId("balance-sheet-position-table")).toContainText("Fixed Assets, Net");
});

test("localStorage persistence, fixed header, and root overflow checks remain stable", async ({ page }) => {
  await page.getByRole("tab", { name: "Neraca & Fixed Asset" }).click();
  await page.getByTitle("Sembunyikan sidebar").click();
  await expect.poll(() => page.evaluate(() => window.localStorage.getItem("penilaian-valuasi-bisnis.sidebar.v1"))).toBe("collapsed");
  await page.getByRole("button", { name: "Balance Sheet" }).first().click();
  await page.getByTestId("balance-account-table-row").last().getByLabel("Nama akun").fill("Piutang usaha");
  await page.reload();

  await expect(page.getByTestId("sidebar-rail")).toBeVisible();
  await page.getByRole("button", { name: "Tampilkan sidebar" }).click();
  await page.getByRole("tab", { name: "Neraca & Fixed Asset" }).click();
  await expect(page.getByTestId("balance-account-table-row").last().getByLabel("Nama akun")).toHaveValue("Piutang usaha");

  for (let index = 0; index < 12; index += 1) {
    await page.getByRole("button", { name: "Balance Sheet" }).first().click();
  }
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  const headerBox = await page.getByTestId("workspace-header").boundingBox();
  expect(headerBox?.y ?? 999).toBeLessThanOrEqual(2);

  expect(await hasNoRootHorizontalOverflow(page)).toBe(true);
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByTestId("workspace-header")).toBeVisible();
  expect(await hasNoRootHorizontalOverflow(page)).toBe(true);
});

async function getTotalAssetsText(page: Page) {
  const totalAssetsRow = page.getByTestId("balance-sheet-position-table").locator("tr.total-row").filter({ hasText: "Total Aset" }).first();
  return totalAssetsRow.locator(".numeric-cell").last().innerText();
}

async function hasNoRootHorizontalOverflow(page: Page) {
  return page.evaluate(() => {
    const documentElement = document.documentElement;
    return documentElement.scrollWidth <= documentElement.clientWidth && document.body.scrollWidth <= document.body.clientWidth;
  });
}
