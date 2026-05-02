import { expect, test, type Page } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();
  await expect(page.getByTestId("valuation-workbench")).toBeVisible();
});

test("period workflow, scoped categories, and display-only balance sheet classification", async ({ page }) => {
  await expect(page.locator(".mobile-workflow-tabs")).toBeHidden();
  await expect(workflowNav(page).getByRole("button", { name: "Data Awal" })).toHaveAttribute("aria-current", "page");
  await expect(page.getByTestId("case-profile-panel")).toBeVisible();
  await page.getByLabel("Sektor Perusahaan").selectOption("Basic Materials");
  await page.getByLabel("Tahun Transaksi Pengalihan").fill("2022");
  await expect(page.getByText("31 Desember 2021").first()).toBeVisible();
  await expect(page.getByLabel("Tanggal valuasi")).toHaveValue("2021-12-31");
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

  await openWorkflowTab(page, "WACC");
  await expect(page.getByLabel("Comparable 1")).toHaveValue(/Indal Aluminium Industry Tbk\. \(Data Pembanding Bersifat Ideal\)/);
  await expect(page.getByLabel("BL 1")).toHaveValue("0,261");
  await expect(page.getByLabel("Market Cap 1")).toHaveValue("117.849.604.096");

  await openWorkflowTab(page, "Neraca & Fixed Asset");
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

  await openWorkflowTab(page, "Laba Rugi");
  await page.getByRole("button", { name: "Income Statement" }).first().click();
  const incomeRow = page.getByTestId("income-account-table-row").last();
  await expect(incomeRow.getByLabel("Kategori utama").locator("option", { hasText: "Account payable" })).toHaveCount(0);
  await incomeRow.getByLabel("Nama akun").fill("Corporate Tax");
  await incomeRow.getByLabel("Tahun Y amount").fill("436128347");
  await expect(incomeRow).toContainText("Saran: Corporate Tax");
  await expect(incomeRow.getByLabel("Tahun Y amount")).toHaveValue("-436.128.347");
  await expect(page.getByTestId("income-statement-report-table")).toContainText("Corporate Tax");
  await expect(page.getByTestId("income-statement-report-table")).toContainText("-436.128.347");

  await page.getByRole("button", { name: "Income Statement" }).last().click();
  await expect(page.getByTestId("income-account-table-row")).toHaveCount(2);
});

test("fixed asset schedule remains empty until user adds a class and then rolls forward values", async ({ page }) => {
  await page.getByRole("button", { name: /Tambah Y-1/ }).click();
  await openWorkflowTab(page, "Neraca & Fixed Asset");
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

test("AAM valuation remains available without WACC or EEM/DCF driver inputs", async ({ page }) => {
  await page.getByLabel("Tanggal valuasi").fill("2021-12-31");
  await openWorkflowTab(page, "Neraca & Fixed Asset");
  await page.getByRole("button", { name: "Balance Sheet" }).first().click();
  let balanceRow = page.getByTestId("balance-account-table-row").last();
  await balanceRow.getByLabel("Nama akun").fill("Kas");
  await balanceRow.getByLabel("Tahun Y amount").fill("1000000");
  await page.getByRole("button", { name: "Balance Sheet" }).first().click();
  balanceRow = page.getByTestId("balance-account-table-row").last();
  await balanceRow.getByLabel("Nama akun").fill("Utang usaha");
  await balanceRow.getByLabel("Tahun Y amount").fill("250000");

  await openWorkflowTab(page, "Valuasi AAM");
  await expect(page.getByText("Asset accumulation method")).toBeVisible();
  await expect(page.getByText("Tidak diperlukan")).toBeVisible();

  await openWorkflowTab(page, "Valuasi EEM/DCF");
  await expect(page.getByTestId("readiness-valuationEemDcf")).toContainText("Masih diperlukan");
});

test("added analysis sections use readiness gates before sample data and render corrected workbook bridges after loading sample", async ({ page }) => {
  await openWorkflowTab(page, "NOPLAT & FCF");
  await expect(page.getByTestId("readiness-noplatFcf")).toBeVisible();
  await expect(page.getByTestId("readiness-noplatFcf")).toContainText("Masih diperlukan");
  await page.getByTestId("readiness-noplatFcf").getByRole("link", { name: /Isi Laba Rugi/ }).first().click();
  await expect(workflowNav(page).getByRole("button", { name: "Laba Rugi" })).toHaveAttribute("aria-current", "page");

  await page.getByRole("button", { name: "Muat contoh workbook" }).click();
  await openWorkflowTab(page, "Payables & Cash Flow");
  await expect(page.getByText("Corrected cash-flow bridge")).toBeVisible();
  await expect(page.getByText(/3\.150\.000\.000/).first()).toBeVisible();

  await openWorkflowTab(page, "NOPLAT & FCF");
  await expect(page.getByText("Free cash flow to firm")).toBeVisible();
  await expect(page.getByText("Commercial statutory basis")).toBeVisible();

  await openWorkflowTab(page, "Ratios & Capital Efficiency");
  await expect(page.getByText("Capital efficiency bridge")).toBeVisible();
  await expect(page.getByText("Corrected NOPLAT basis")).toBeVisible();
});

test("WACC and EEM/DCF assumptions expose source-backed suggestions, calculators, and active valuation sources", async ({ page }) => {
  await page.getByLabel("Sektor Perusahaan").selectOption("Consumer Cyclicals");
  await page.getByLabel("Tanggal valuasi").fill("2023-12-31");
  await openWorkflowTab(page, "Asumsi EEM/DCF");

  const taxCard = page.getByTestId("assumption-card-tax-rate");
  await expect(taxCard).toContainText("Statutory general 2023");
  await taxCard.getByRole("button", { name: /Statutory general 2023/ }).click();
  await expect(taxCard.getByLabel("Manual override")).toHaveValue("0,22");
  await expect(page.getByTestId("terminal-growth-suggestion-card")).toContainText("Consumer Cyclicals");
  await expect(page.getByTestId("terminal-growth-suggestion-card")).toContainText("118/121");
  await page.getByRole("button", { name: "Terapkan sector suggestion" }).click();
  await expect(page.getByLabel("Base terminal growth")).toHaveValue("0");
  await expect(page.getByLabel("Downside terminal growth")).toHaveValue("-0,05");
  await expect(page.getByLabel("Upside terminal growth")).toHaveValue("0,02");

  await openWorkflowTab(page, "WACC");
  await expect(page.getByTestId("wacc-suggestion-card")).toContainText("2023");
  await expect(page.getByTestId("wacc-suggestion-card")).toContainText("Equity Risk Premium");
  await page.getByRole("button", { name: /Terapkan suggestion 2023/ }).click();
  await expect(page.getByTestId("wacc-calculator")).toContainText("Rating-based default spread");
  await expect(page.getByTestId("wacc-comparable-table")).toContainText("Perusahaan Pembanding");
  await expect(page.getByTestId("wacc-capital-structure-table")).toContainText("Struktur Kapital");

  await page.getByRole("button", { name: "Muat contoh workbook" }).click();
  await openWorkflowTab(page, "WACC");
  await expect(page.getByTestId("wacc-calculator")).toContainText("WACC calculator");
  await expect(page.getByTestId("wacc-calculator")).toContainText("Risk-free rate");
  await openWorkflowTab(page, "Asumsi EEM/DCF");
  await expect(page.getByTestId("terminal-growth-calculator")).toContainText("Terminal growth governance");
  await expect(page.getByTestId("required-return-on-nta-calculator")).toContainText("Receivables capacity");
  await expect(page.getByTestId("required-return-on-nta-calculator")).not.toContainText("BORROWING CAP");
  await expect(page.locator("body")).not.toContainText("STAT_ASSUMPTIONS");

  await openWorkflowTab(page, "Valuasi EEM/DCF");
  await expect(page.getByLabel("Driver aktif valuasi")).toContainText("Calculated from WACC inputs");
  await expect(page.getByLabel("Driver aktif valuasi")).toContainText("Calculated from NTA capacity inputs");
});

test("legacy positive income-statement expense drafts migrate once and remain user-editable", async ({ page }) => {
  await page.evaluate(() => {
    window.localStorage.setItem(
      "penilaian-valuasi-bisnis.workbench.v1",
      JSON.stringify({
        version: 1,
        savedAt: "2026-05-01T00:00:00.000Z",
        periods: [{ id: "p1", label: "Tahun Y", valuationDate: "", yearOffset: 0 }],
        activePeriodId: "p1",
        rows: [
          {
            id: "legacy-cogs",
            statement: "income_statement",
            accountName: "Beban pokok penjualan",
            categoryOverride: "COST_OF_GOOD_SOLD",
            balanceSheetClassification: "",
            labelOverrides: [],
            values: { p1: "100" },
          },
        ],
        isFixedAssetScheduleEnabled: false,
        fixedAssetScheduleRows: [],
        assumptions: {
          taxRate: "",
          terminalGrowth: "",
          revenueGrowth: "",
          wacc: "",
          requiredReturnOnNta: "",
          arDays: "",
          inventoryDays: "",
          apDays: "",
          otherPayableDays: "",
        },
      }),
    );
  });
  await page.reload();
  await openWorkflowTab(page, "Laba Rugi");

  const amountInput = page.getByTestId("income-account-table-row").last().getByLabel("Tahun Y amount");
  await expect(amountInput).toHaveValue("-100");
  await amountInput.press("Home");
  await amountInput.press("Delete");
  await expect(amountInput).toHaveValue("100");
  await expect.poll(() => page.evaluate(() => JSON.parse(window.localStorage.getItem("penilaian-valuasi-bisnis.workbench.v1") ?? "{}").version)).toBe(3);

  await page.reload();
  await openWorkflowTab(page, "Laba Rugi");
  await expect(page.getByTestId("income-account-table-row").last().getByLabel("Tahun Y amount")).toHaveValue("100");
});

test("localStorage persistence, fixed header, and root overflow checks remain stable", async ({ page }) => {
  await openWorkflowTab(page, "Neraca & Fixed Asset");
  await page.getByTitle("Sembunyikan sidebar").click();
  await expect.poll(() => page.evaluate(() => window.localStorage.getItem("penilaian-valuasi-bisnis.sidebar.v1"))).toBe("collapsed");
  await page.getByRole("button", { name: "Balance Sheet" }).first().click();
  await page.getByTestId("balance-account-table-row").last().getByLabel("Nama akun").fill("Piutang usaha");
  await page.reload();

  await expect(page.getByTestId("sidebar-rail")).toBeVisible();
  await page.getByRole("button", { name: "Tampilkan sidebar" }).click();
  await openWorkflowTab(page, "Neraca & Fixed Asset");
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
  await expect(page.locator(".mobile-workflow-tabs")).toBeVisible();
  expect(await hasNoRootHorizontalOverflow(page)).toBe(true);
});

async function getTotalAssetsText(page: Page) {
  const totalAssetsRow = page.getByTestId("balance-sheet-position-table").locator("tr.total-row").filter({ hasText: "Total Aset" }).first();
  return totalAssetsRow.locator(".numeric-cell").last().innerText();
}

function workflowNav(page: Page) {
  return page.getByRole("navigation", { name: "Bagian model" });
}

async function openWorkflowTab(page: Page, name: string) {
  await workflowNav(page).getByRole("button", { name }).click();
}

async function hasNoRootHorizontalOverflow(page: Page) {
  return page.evaluate(() => {
    const documentElement = document.documentElement;
    return documentElement.scrollWidth <= documentElement.clientWidth && document.body.scrollWidth <= document.body.clientWidth;
  });
}
