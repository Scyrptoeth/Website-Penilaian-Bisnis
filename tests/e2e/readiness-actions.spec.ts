import { expect, test, type Locator, type Page } from "@playwright/test";

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
  await openWorkflowTab(page, "Cash Flow Statement");
  await expect(page.getByTestId("readiness-cashFlowStatement").locator(".readiness-list").first()).not.toContainText("Basis penyusutan/capex");
  await openWorkflowTab(page, "NOPLAT & FCF");
  await expect(page.getByTestId("readiness-noplatFcf").locator(".readiness-list").first()).not.toContainText("Basis penyusutan/capex");

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

  await openWorkflowTab(page, "WACC");
  const waccReadiness = page.getByTestId("readiness-wacc");
  await waccReadiness.getByRole("link", { name: /Lengkapi WACC/ }).click();
  const waccSuggestionAction = page.locator('[data-guidance-target="wacc-market-suggestion"]');
  await expect(waccSuggestionAction).toHaveClass(/action-guidance/);
  await expect(waccSuggestionAction.locator(".action-guidance-badge")).toContainText("Aksi dibutuhkan");

  await waccReadiness.getByRole("link", { name: /Isi WACC/ }).click();
  const waccManualAction = page.locator('[data-guidance-target="wacc-active-basis"]');
  await expect(waccManualAction).toHaveClass(/action-guidance/);
  await expect(waccManualAction.locator(".action-guidance-badge")).toContainText("Aksi dibutuhkan");

  await openWorkflowTab(page, "WACC");
  await page.getByTestId("readiness-wacc").getByRole("link", { name: /Isi Tarif Pajak/ }).click();
  const waccTaxRateAction = page.locator('[data-guidance-target="tax-rate-statutory"]');
  await expect(waccTaxRateAction).toHaveClass(/action-guidance/);
  await expect(waccTaxRateAction.locator(".action-guidance-badge")).toContainText("Aksi dibutuhkan");

  await openWorkflowTab(page, "Asumsi EEM/DCF");
  await page.getByTestId("readiness-eemDcfAssumptions").getByRole("link", { name: /Isi Driver/ }).click();
  const workingCapitalAction = page.locator('[data-guidance-target="working-capital-driver"]');
  await expect(workingCapitalAction).toHaveClass(/action-guidance/);
  await expect(workingCapitalAction.locator(".action-guidance-badge")).toContainText("Aksi dibutuhkan");
});

test("destructive Data Awal and Aset Tetap actions require confirmation", async ({ page }) => {
  await page.getByRole("button", { name: /Tambah Y-1/ }).click();
  await expect(page.getByTestId("period-card")).toHaveCount(2);

  const historicalPeriod = page.locator('[data-testid="period-card"][data-year-offset="-1"]');
  await historicalPeriod.getByTitle("Hapus periode").click();
  await expect(page.getByRole("dialog", { name: /Hapus periode Tahun Y-1/ })).toBeVisible();
  await page.getByRole("dialog").getByRole("button", { name: "Batal" }).click();
  await expect(page.getByTestId("period-card")).toHaveCount(2);
  await historicalPeriod.getByTitle("Hapus periode").click();
  await page.getByRole("dialog").getByRole("button", { name: "Hapus periode" }).click();
  await expect(page.getByTestId("period-card")).toHaveCount(1);

  await openWorkflowTab(page, "Aset Tetap");
  await page.getByRole("button", { name: "Tambah kelas aset" }).click();
  await expect(page.getByTestId("fixed-asset-acquisition-table").getByTestId("fixed-asset-row")).toHaveCount(1);
  await page.getByTitle("Hapus kelas aset").click();
  await expect(page.getByRole("dialog", { name: "Hapus kelas aset?" })).toBeVisible();
  await page.getByRole("dialog").getByRole("button", { name: "Batal" }).click();
  await expect(page.getByTestId("fixed-asset-acquisition-table").getByTestId("fixed-asset-row")).toHaveCount(1);
  await page.getByTitle("Hapus kelas aset").click();
  await page.getByRole("dialog").getByRole("button", { name: "Hapus kelas aset" }).click();
  await expect(page.getByTestId("fixed-asset-empty")).toBeVisible();
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

test("readiness actions guide exact targets for tax simulation, DLOM, and DLOC/PFC", async ({ page }) => {
  await openWorkflowTab(page, "Simulasi Potensi Pajak");
  const taxSimulationReadiness = page.getByTestId("readiness-taxSimulation");
  await expect(taxSimulationReadiness).toHaveClass(/blocking/);

  await taxSimulationReadiness.getByRole("link", { name: /Pilih Primary Method/ }).click();
  await expectActionGuidance(page.getByRole("combobox", { name: "Primary Method" }));

  await openWorkflowTab(page, "Simulasi Potensi Pajak");
  await taxSimulationReadiness.getByRole("link", { name: /Isi Nilai Pengalihan/ }).click();
  await expectActionGuidance(page.getByLabel(/Jumlah Modal Disetor yang Dinilai|Jumlah Saham yang Dinilai/));

  await openWorkflowTab(page, "Simulasi Potensi Pajak");
  await taxSimulationReadiness.getByRole("link", { name: /Isi Data Awal/ }).click();
  await expectActionGuidance(page.getByLabel(/Jumlah Modal Disetor 100%|Jumlah Saham Beredar 100%/));

  await openWorkflowTab(page, "DLOM");
  const dlomReadiness = page.getByTestId("readiness-dlom");
  await dlomReadiness.getByRole("link", { name: /Isi DLOM/ }).click();
  await expectActionGuidance(page.getByRole("combobox", { name: /Jawaban DLOM/ }).first());

  await openWorkflowTab(page, "DLOC/PFC");
  const dlocPfcReadiness = page.getByTestId("readiness-dlocPfc");
  await dlocPfcReadiness.getByRole("link", { name: /Isi DLOC\/PFC/ }).click();
  await expectActionGuidance(page.getByRole("combobox", { name: /Jawaban DLOC\/PFC/ }).first());

  await openWorkflowTab(page, "DLOC/PFC");
  await dlocPfcReadiness.getByRole("link", { name: /Isi Data Awal/ }).first().click();
  await expect(
    page
      .getByLabel("Jenis Perusahaan")
      .evaluate((element) => Boolean(element.closest(".action-guidance")) || Boolean(element.closest("[data-guidance-target]"))),
  ).resolves.toBe(true);
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

async function expectActionGuidance(locator: Locator) {
  await expect(
    locator.evaluate((element) => {
      const current = element as Element;

      return (
        current.classList.contains("action-guidance") ||
        current.closest(".action-guidance") !== null ||
        current.querySelector(".action-guidance") !== null
      );
    }),
  ).resolves.toBe(true);
}

async function openWorkflowTab(page: Page, name: string) {
  await workflowNav(page).getByRole("button", { name, exact: true }).click();
}
