import { expect, test, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";

const workbenchStorageKey = "penilaian-valuasi-bisnis.workbench.v1";
const workspaceManifestStorageKey = "penilaian-valuasi-bisnis.workspaces.v1";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await loginIfAuthGateVisible(page);
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();
  await loginIfAuthGateVisible(page);
  await expect(page.getByTestId("valuation-workbench")).toBeVisible();
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
  await page.getByLabel("Password Pengguna", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Masuk" }).click();
  await expect(page.getByTestId("valuation-workbench")).toBeVisible();
}

async function loadSampleWorkbook(page: Page) {
  await expect
    .poll(() =>
      page.evaluate(() =>
        Boolean((window as Window & { __PVB_TEST_HOOKS__?: { loadSampleWorkbook: () => void } }).__PVB_TEST_HOOKS__?.loadSampleWorkbook),
      ),
    )
    .toBe(true);
  await page.evaluate(() =>
    (window as Window & { __PVB_TEST_HOOKS__?: { loadSampleWorkbook: () => void } }).__PVB_TEST_HOOKS__?.loadSampleWorkbook(),
  );
}

async function loadPersistedWorkbenchFixture(page: Page) {
  const fixtureState = JSON.parse(readFileSync("tests/fixtures/report-workbench-state.json", "utf8")) as unknown;

  await page.addInitScript(
    ({ key, state }) => {
      window.localStorage.clear();
      window.localStorage.setItem(key, JSON.stringify(state));
    },
    { key: workbenchStorageKey, state: fixtureState },
  );
  await page.reload();
  await expect(page.getByTestId("valuation-workbench")).toBeVisible();
  await expect(page.getByLabel("Nama Objek Pajak")).toHaveValue("Makmur Jaya Sejati Raya");
  await expect
    .poll(() =>
      page.evaluate((key) => {
        const raw = window.localStorage.getItem(key);
        return raw ? JSON.parse(raw).workspaces?.length : 0;
      }, workspaceManifestStorageKey),
    )
    .toBe(1);
}

async function readIncomeProjectionRowCells(page: Page, rowLabel: string) {
  const cells = await page.getByTestId("dcf-income-projection-table").locator("tbody tr").evaluateAll((rows, label) => {
    const row = rows.find((candidate) => candidate.querySelector("td strong")?.textContent?.trim() === label);

    return row ? Array.from(row.querySelectorAll("td")).map((cell) => cell.textContent?.trim() ?? "") : [];
  }, rowLabel);

  if (!cells.length) {
    throw new Error(`Income projection row not found: ${rowLabel}`);
  }

  return cells;
}

function parseDisplayedNumber(value: string) {
  const normalized = value.replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", ".");
  const parsed = Number(normalized);

  if (!Number.isFinite(parsed)) {
    throw new Error(`Unable to parse displayed number: ${value}`);
  }

  return parsed;
}

test("JSON export and import round-trip the full workbench draft", async ({ page }) => {
  await loadSampleWorkbook(page);
  await expect(page.getByLabel("Nama Objek Pajak")).toHaveValue("Makmur Jaya Sejati Raya");

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "JSON" }).click();
  await expect(page.getByRole("menu", { name: "Pilihan JSON" })).toBeVisible();
  await expect(page.getByRole("menuitem", { name: "Export JSON" })).toBeVisible();
  await expect(page.getByRole("menuitem", { name: "Import JSON" })).toBeVisible();
  await page.getByRole("menuitem", { name: "Export JSON" }).click();
  const download = await downloadPromise;
  const downloadPath = await download.path();

  expect(download.suggestedFilename()).toMatch(/^penilaian-bisnis-makmur-jaya-sejati-raya-\d{4}-\d{2}-\d{2}\.json$/);
  expect(downloadPath).toBeTruthy();

  const payload = JSON.parse(readFileSync(downloadPath ?? "", "utf8")) as {
    schema?: string;
    schemaVersion?: number;
    data?: {
      version?: number;
      activeDcfBasis?: string;
      activeEemBasis?: string;
      fixedAssetProjectionMode?: string;
      debtScheduleInputs?: Record<string, Record<string, string>>;
      cashFlowOverrides?: unknown;
      incomeProjectionControls?: unknown;
      caseProfile?: { objectTaxpayerName?: string };
      rows?: unknown[];
    };
  };

  expect(payload.schema).toBe("penilaian-valuasi-bisnis.full-workbench-json");
  expect(payload.schemaVersion).toBe(1);
  expect(payload.data?.version).toBe(18);
  expect(payload.data?.caseProfile?.objectTaxpayerName).toBe("Makmur Jaya Sejati Raya");
  expect(payload.data?.rows?.length).toBeGreaterThan(0);
  expect(payload.data?.fixedAssetProjectionMode).toBe("workbook-formula");
  expect(payload.data?.debtScheduleInputs?.p2021?.shortTermLoanRate).toBe("0,13");
  expect(payload.data?.activeEemBasis).toBe("base");
  expect(payload.data?.activeDcfBasis).toBe("base");
  expect(payload.data).toHaveProperty("cashFlowOverrides");
  expect(payload.data).toHaveProperty("incomeProjectionControls");

  await page.locator(".toolbar").getByRole("button", { name: "Reset" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Reset" }).click();
  await expect(page.getByLabel("Nama Objek Pajak")).toHaveValue("");

  const fileChooserPromise = page.waitForEvent("filechooser");
  await page.getByRole("button", { name: "JSON" }).click();
  await page.getByRole("menuitem", { name: "Import JSON" }).click();
  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles(downloadPath ?? "");
  await expect(page.getByRole("dialog", { name: "Import JSON sebagai workspace baru?" })).toBeVisible();
  await expect(page.getByRole("dialog")).toContainText("Makmur Jaya Sejati Raya");
  await expect(page.getByRole("dialog")).toContainText("input jadwal utang");
  await page.getByRole("dialog").getByRole("button", { name: "Import JSON" }).click();

  await expect(page.getByLabel("Nama Objek Pajak")).toHaveValue("Makmur Jaya Sejati Raya");
  await expect(page.getByRole("button", { name: /Workspace aktif: Makmur Jaya Sejati Raya/ })).toBeVisible();
  await expect(page.locator(".toolbar").getByRole("button", { name: "Reset" })).toBeEnabled();
  await expect
    .poll(() =>
      page.evaluate((key) => {
        const raw = window.localStorage.getItem(key);
        return raw ? JSON.parse(raw).caseProfile.objectTaxpayerName : "";
      }, workbenchStorageKey),
    )
    .toBe("Makmur Jaya Sejati Raya");
  await expect
    .poll(() =>
      page.evaluate((key) => {
        const raw = window.localStorage.getItem(key);
        return raw ? JSON.parse(raw).workspaces?.length : 0;
      }, workspaceManifestStorageKey),
    )
    .toBe(2);
});

test("local workspaces isolate active valuation drafts across create, rename, duplicate, delete, and reload", async ({ page }) => {
  await page.getByLabel("Nama Objek Pajak").fill("PT Alpha Valuasi");
  await page.getByRole("button", { name: /Workspace aktif: Workspace Utama/ }).click();
  await page.getByRole("button", { name: "Workspace kosong" }).click();
  await expect(page.getByRole("button", { name: /Workspace aktif: Workspace Baru/ })).toBeVisible();
  await expect(page.getByLabel("Nama Objek Pajak")).toHaveValue("");

  await page.getByLabel("Nama Objek Pajak").fill("PT Beta Skenario");
  await page.getByRole("button", { name: /Workspace aktif: Workspace Baru/ }).click();
  await page.getByRole("menu", { name: "Kelola workspace lokal" }).locator(".workspace-menu-item", { hasText: "Workspace Baru" }).getByRole("button", { name: "Rename" }).click();
  await page.getByLabel("Nama workspace Workspace Baru").fill("Skenario Beta");
  await page.getByRole("button", { name: "Simpan nama workspace" }).click();
  await expect(page.getByRole("button", { name: /Workspace aktif: Skenario Beta/ })).toBeVisible();

  await page.getByRole("button", { name: /Workspace aktif: Skenario Beta/ }).click();
  await page.getByRole("button", { name: "Duplikasi aktif" }).click();
  await expect(page.getByRole("button", { name: /Workspace aktif: Skenario Beta - Salinan/ })).toBeVisible();
  await expect(page.getByLabel("Nama Objek Pajak")).toHaveValue("PT Beta Skenario");

  await page.getByRole("button", { name: /Workspace aktif: Skenario Beta - Salinan/ }).click();
  await page.getByRole("menu", { name: "Kelola workspace lokal" }).locator(".workspace-menu-item", { hasText: "Skenario Beta - Salinan" }).getByRole("button", { name: "Hapus" }).click();
  await page.getByRole("dialog", { name: /Hapus workspace/ }).getByRole("button", { name: "Hapus workspace" }).click();
  await expect(page.getByRole("button", { name: /Workspace aktif: Workspace Utama/ })).toBeVisible();
  await expect(page.getByLabel("Nama Objek Pajak")).toHaveValue("PT Alpha Valuasi");

  await page.getByRole("button", { name: /Workspace aktif: Workspace Utama/ }).click();
  await page.getByRole("menu", { name: "Kelola workspace lokal" }).locator(".workspace-menu-item", { hasText: "Skenario Beta" }).getByRole("menuitem").click();
  await expect(page.getByLabel("Nama Objek Pajak")).toHaveValue("PT Beta Skenario");
  await page.reload();
  await expect(page.getByRole("button", { name: /Workspace aktif: Skenario Beta/ })).toBeVisible();
  await expect(page.getByLabel("Nama Objek Pajak")).toHaveValue("PT Beta Skenario");
  await expect
    .poll(() =>
      page.evaluate((key) => {
        const raw = window.localStorage.getItem(key);
        return raw ? JSON.parse(raw).workspaces?.map((workspace: { name: string }) => workspace.name).sort() : [];
      }, workspaceManifestStorageKey),
    )
    .toEqual(["Skenario Beta", "Workspace Utama"]);
});

test("period workflow, scoped categories, and display-only balance sheet classification", async ({ page }) => {
  await expect(page.locator(".mobile-workflow-tabs")).toBeHidden();
  await expect(page.locator(".brand-mark")).toHaveText("B-2");
  await expect(page.getByRole("button", { name: "Muat contoh workbook" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Kosongkan" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Export XLSX" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Export PDF" })).toBeVisible();
  await expect(page.getByRole("button", { name: "JSON" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Reset" })).toBeDisabled();
  await expect(workflowNav(page).getByRole("button", { name: "Data Awal" })).toHaveAttribute("aria-current", "page");
  await expect(workflowNav(page).getByRole("button", { name: "Neraca", exact: true })).toBeVisible();
  await expect(workflowNav(page).getByRole("button", { name: "Aset Tetap", exact: true })).toBeVisible();
  await expect(workflowNav(page).getByText("Input Data", { exact: true })).toBeVisible();
  await expect(workflowNav(page).getByText("Penilaian", { exact: true })).toBeVisible();
  await expect(workflowNav(page).getByText("Proyeksi DCF", { exact: true })).toBeVisible();
  await expect(workflowNav(page).getByText("Analisis EEM/DCF", { exact: true })).toBeVisible();
  await expect(workflowNav(page).getByText("Diskon & Pajak", { exact: true })).toBeVisible();
  await expect(workflowNav(page).getByText("Review", { exact: true })).toBeVisible();
  const sidebarGroupLabels = await workflowNav(page)
    .locator(".nav-group-label")
    .evaluateAll((labels) => labels.map((label) => label.textContent?.trim() ?? ""));
  expect(sidebarGroupLabels).toEqual(["Input Data", "Analisis EEM/DCF", "Asumsi", "Proyeksi DCF", "Penilaian", "Diskon & Pajak", "Review"]);
  const sidebarTabLabels = await workflowNav(page)
    .getByRole("button")
    .evaluateAll((buttons) => buttons.map((button) => button.getAttribute("aria-label")));
  expect(sidebarTabLabels).toEqual([
    "Data Awal",
    "Aset Tetap",
    "Neraca",
    "Laba Rugi",
    "Cash Flow Statement",
    "Jadwal Utang",
    "NOPLAT & FCF",
    "Financial Ratio",
    "ROIC",
    "WACC",
    "Asumsi EEM/DCF",
    "Proyeksi Aset Tetap",
    "Proyeksi Neraca",
    "Proyeksi Laba Rugi",
    "Proyeksi Cash Flow Statement",
    "Penilaian AAM",
    "Penilaian EEM",
    "Penilaian DCF",
    "DLOM",
    "DLOC/PFC",
    "Simulasi Potensi Pajak",
    "Audit",
    "Ganti Password",
    "Keluar",
  ]);
  const authActionTextLefts = await workflowNav(page)
    .locator(".auth-sidebar-actions .auth-nav-action span")
    .evaluateAll((labels) => labels.map((label) => Math.round(label.getBoundingClientRect().left)));
  expect(Math.max(...authActionTextLefts) - Math.min(...authActionTextLefts)).toBeLessThanOrEqual(1);
  await expect(workflowNav(page).getByRole("button", { name: "Neraca", exact: true }).locator(".method-badge")).toHaveText(["AAM", "EEM", "DCF"]);
  await expect(workflowNav(page).getByRole("button", { name: "Laba Rugi", exact: true }).locator(".method-badge")).toHaveText(["EEM", "DCF"]);
  await expect(workflowNav(page).getByRole("button", { name: "Kategorisasi Akun", exact: true })).toHaveCount(0);
  await expect(workflowNav(page).getByRole("button", { name: "Penilaian AAM", exact: true }).locator(".method-badge")).toHaveText(["AAM"]);
  await expect(workflowNav(page).getByRole("button", { name: "Neraca & Aset Tetap", exact: true })).toHaveCount(0);
  await expect(workflowNav(page).getByRole("button", { name: "Pemetaan & Label" })).toHaveCount(0);
  await expect(page.getByTestId("case-profile-panel")).toBeVisible();
  await expect(page.getByRole("button", { name: /Buat checkpoint/i })).toHaveCount(0);
  await expect(page.getByRole("button", { name: /Kembali checkpoint/i })).toHaveCount(0);
  await page.getByLabel("KLU sesuai Appportal").fill("07102");
  await expect(page.getByTestId("company-sector-derived")).toHaveValue("Basic Materials");
  await expect(page.getByTestId("case-profile-panel").getByText("PERTAMBANGAN BIJIH BESI")).toHaveCount(0);
  await expect(page.getByTestId("case-profile-panel").getByText(/Otomatis dari KLU/)).toHaveCount(0);
  await page.getByLabel("Tahun Transaksi Pengalihan").fill("2022");
  await expect(page.getByText("31 Desember 2021").first()).toBeVisible();
  await expect(page.getByLabel("Tanggal penilaian")).toHaveValue("2021-12-31");
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
  await expect(page.getByLabel("Pembanding 1")).toHaveValue(/Indal Aluminium Industry Tbk\. \(Data Pembanding Bersifat Ideal\)/);
  await expect(page.getByLabel("BL 1")).toHaveValue("0,261");
  await expect(page.getByLabel("Market Cap 1")).toHaveValue("117.849.604.096");

  await openWorkflowTab(page, "Neraca");
  await page.getByRole("button", { name: "Tambah akun neraca" }).first().click();
  const balanceHeaders = await page.getByTestId("balance-account-table").locator("thead th").evaluateAll((headers) =>
    headers.map((header) => header.textContent?.trim() ?? ""),
  );
  expect(balanceHeaders.slice(0, 4)).toEqual(["Nama akun dari laporan", "Klasifikasi neraca", "Kategori utama", "Label & dampak"]);
  expect(balanceHeaders).not.toContain("Sumber");
  const balanceRow = page.getByTestId("balance-account-table-row").last();
  await expect(balanceRow.getByLabel("Sumber laporan")).toHaveCount(0);
  await expect(balanceRow.getByLabel("Klasifikasi neraca").locator("option", { hasText: "Ekuitas" })).toHaveCount(1);
  await balanceRow.getByLabel("Nama akun").fill("Kas");
  await balanceRow.getByLabel("Tahun Y amount").fill("1000,75");
  await expect(balanceRow.getByLabel("Tahun Y amount")).toHaveValue("1.000");
  await expect(balanceRow).toContainText("Saran: Kas di tangan");
  await expect(balanceRow.getByLabel("Kategori utama").locator("option", { hasText: "Pendapatan usaha" })).toHaveCount(0);

  const totalBefore = await getTotalAssetsText(page);
  await balanceRow.getByLabel("Klasifikasi neraca").selectOption("non_current_asset");
  await expect(page.getByTestId("balance-sheet-position-table")).toContainText("Aset tidak lancar");
  await expect(page.getByTestId("balance-sheet-position-table")).toContainText("Total Liabilitas + Ekuitas");
  await expect(page.getByTestId("balance-sheet-position-table")).toContainText("Cek Kesesuaian");
  await expect.poll(() => getTotalAssetsText(page)).toBe(totalBefore);
  await balanceRow.getByTitle("Hapus akun").click();
  await expect(page.getByRole("dialog", { name: "Hapus akun?" })).toBeVisible();
  await page.getByRole("dialog").getByRole("button", { name: "Batal" }).click();
  await expect(page.getByTestId("balance-account-table-row")).toHaveCount(1);
  await balanceRow.getByTitle("Hapus akun").click();
  await page.getByRole("dialog").getByRole("button", { name: "Hapus akun" }).click();
  await expect(page.getByTestId("balance-account-table-row")).toHaveCount(0);

  await openWorkflowTab(page, "Laba Rugi");
  const incomePanel = page.locator("#income");
  await expect(incomePanel.getByText("Langkah 2C")).toHaveCount(0);
  await expect(incomePanel.getByRole("button", { name: "Tambah akun laba rugi" })).toHaveCount(2);
  await page.getByRole("button", { name: "Tambah akun laba rugi" }).first().click();
  const incomeHeaders = await page.getByTestId("income-account-table").locator("thead th").evaluateAll((headers) =>
    headers.map((header) => header.textContent?.trim() ?? ""),
  );
  expect(incomeHeaders.slice(0, 3)).toEqual(["Nama akun dari laporan", "Kategori utama", "Label & dampak"]);
  expect(incomeHeaders).not.toContain("Sumber");
  const incomeRow = page.getByTestId("income-account-table-row").last();
  await expect(incomeRow.getByLabel("Sumber laporan")).toHaveCount(0);
  await expect(incomeRow.getByLabel("Kategori utama").locator("option", { hasText: "Utang usaha" })).toHaveCount(0);
  await incomeRow.getByLabel("Nama akun").fill("Pajak penghasilan badan");
  await incomeRow.getByLabel("Tahun Y amount").fill("436128347");
  await expect(incomeRow).toContainText("Saran: Pajak penghasilan badan");
  await expect(incomeRow.getByLabel("Tahun Y amount")).toHaveValue("-436.128.347");
  await expect(page.getByTestId("income-statement-report-table")).toContainText("Pajak penghasilan badan");
  await expect(page.getByTestId("income-statement-report-table")).toContainText("-436.128.347");

  await page.getByRole("button", { name: "Tambah akun laba rugi" }).last().click();
  await expect(page.getByTestId("income-account-table-row")).toHaveCount(2);
  await page.locator(".toolbar").getByRole("button", { name: "Reset" }).click();
  await expect(page.getByRole("dialog", { name: "Reset seluruh model?" })).toBeVisible();
  await page.getByRole("dialog").getByRole("button", { name: "Batal" }).click();
  await expect(page.getByTestId("income-account-table-row")).toHaveCount(2);
  await page.locator(".toolbar").getByRole("button", { name: "Reset" }).click();
  await page.getByRole("dialog").getByRole("button", { name: "Reset" }).click();
  await expect(page.getByTestId("income-account-table-row")).toHaveCount(0);
  await expect(page.locator(".toolbar").getByRole("button", { name: "Reset" })).toBeDisabled();
});

test("fixed asset schedule remains empty until user adds a class and then rolls forward values", async ({ page }) => {
  await page.getByRole("button", { name: /Tambah Y-1/ }).click();
  await openWorkflowTab(page, "Aset Tetap");
  const fixedAssetsPanel = page.locator("#fixedAssets");
  await expect(fixedAssetsPanel.getByText("Langkah 2B")).toHaveCount(0);
  await expect(fixedAssetsPanel.getByRole("heading", { name: "Aset Tetap", exact: true })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Jadwal Aset Tetap" })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "A. Biaya Perolehan · B. Penyusutan · Nilai Buku Neto" })).toHaveCount(0);
  await expect(page.getByTestId("readiness-fixedAssets")).toBeVisible();
  await expect(page.getByTestId("readiness-fixedAssets")).toContainText("Aset Tetap belum dapat ditampilkan penuh");
  await expect(page.getByTestId("fixed-asset-empty")).toBeVisible();
  await expect(fixedAssetsPanel.getByRole("button", { name: "Tambah kelas aset" })).toHaveCount(2);
  await expect(fixedAssetsPanel.getByRole("button", { name: "Tambah kelas aset" }).first()).toHaveCSS("background-color", "rgb(15, 118, 110)");

  await page.getByRole("button", { name: "Tambah kelas aset" }).first().click();
  await expect(page.getByTestId("fixed-asset-row")).toHaveCount(2);
  await expect(page.getByRole("heading", { name: "C. Nilai Buku Neto Aset Tetap" })).toBeVisible();

  const acquisition = page.getByTestId("fixed-asset-acquisition-table");
  const depreciation = page.getByTestId("fixed-asset-depreciation-table");
  const firstPeriodColumnWidths = await acquisition.evaluate((table) =>
    Array.from(table.querySelectorAll("thead tr:nth-child(2) th"))
      .slice(0, 3)
      .map((cell) => Math.round(cell.getBoundingClientRect().width)),
  );
  expect(Math.max(...firstPeriodColumnWidths) - Math.min(...firstPeriodColumnWidths)).toBeLessThanOrEqual(2);
  await acquisition.getByLabel("Kelas aset").fill("Factory equipment");
  await acquisition.getByLabel("A. Biaya Perolehan Tahun Y-1 Saldo awal").fill("100");
  await acquisition.getByLabel("A. Biaya Perolehan Tahun Y-1 Penambahan").fill("50");
  await acquisition.getByLabel("A. Biaya Perolehan Tahun Y Penambahan").fill("20");
  await depreciation.getByLabel("B. Penyusutan Tahun Y-1 Saldo awal").fill("10");
  await depreciation.getByLabel("B. Penyusutan Tahun Y-1 Penambahan").fill("5");
  await depreciation.getByLabel("B. Penyusutan Tahun Y Penambahan").fill("8");

  await expect(page.getByTestId("fixed-asset-net-value-table")).toContainText("135");
  await expect(page.getByTestId("fixed-asset-net-value-table")).toContainText("147");
  const netValuePeriodWidths = await page.getByTestId("fixed-asset-net-value-table").evaluate((table) =>
    Array.from(table.querySelectorAll("thead th:not(.fixed-asset-asset-column)")).map((cell) => Math.round(cell.getBoundingClientRect().width)),
  );
  expect(Math.max(...netValuePeriodWidths) - Math.min(...netValuePeriodWidths)).toBeLessThanOrEqual(2);
  await openWorkflowTab(page, "Neraca");
  await expect(page.getByTestId("balance-sheet-position-table")).toContainText("Nilai buku bersih aset tetap");
  expect(await hasNoRootHorizontalOverflow(page)).toBe(true);
});

test("fixed asset roll-forward tables reveal current year with three periods", async ({ page }) => {
  await page.getByLabel("Tahun Transaksi Pengalihan").fill("2022");
  await page.getByRole("button", { name: /Tambah Y-1/ }).click();
  await page.getByRole("button", { name: /Tambah Y-2/ }).click();
  await openWorkflowTab(page, "Aset Tetap");
  await page.getByRole("button", { name: "Tambah kelas aset" }).first().click();

  for (const testId of ["fixed-asset-acquisition-table", "fixed-asset-depreciation-table"]) {
    const visibility = await page.getByTestId(testId).evaluate((table) => {
      const wrapper = table.closest(".fixed-asset-table-wrap");
      const currentYearHeading = Array.from(table.querySelectorAll("thead tr:first-child th.fixed-asset-period-group-heading")).at(-1);
      const assetColumn = table.querySelector("thead th.fixed-asset-asset-column");

      if (!(wrapper instanceof HTMLElement) || !(currentYearHeading instanceof HTMLElement) || !(assetColumn instanceof HTMLElement)) {
        return null;
      }

      const wrapperRect = wrapper.getBoundingClientRect();
      const headingRect = currentYearHeading.getBoundingClientRect();
      const assetRect = assetColumn.getBoundingClientRect();

      return {
        assetColumnWidth: Math.round(assetRect.width),
        currentYearLabel: currentYearHeading.textContent?.trim() ?? "",
        visiblePixels: Math.round(wrapperRect.right - headingRect.left),
      };
    });

    expect(visibility).not.toBeNull();
    expect(visibility?.currentYearLabel).toMatch(/^(2021|Tahun Y)$/);
    expect(visibility?.assetColumnWidth).toBeLessThanOrEqual(280);
    expect(visibility?.visiblePixels).toBeGreaterThanOrEqual(40);
  }
});

test("AAM valuation remains available without WACC or EEM/DCF driver inputs", async ({ page }) => {
  await page.getByLabel("Tanggal penilaian").fill("2021-12-31");
  await openWorkflowTab(page, "Neraca");
  await page.getByRole("button", { name: "Tambah akun neraca" }).first().click();
  let balanceRow = page.getByTestId("balance-account-table-row").last();
  await balanceRow.getByLabel("Nama akun").fill("Kas");
  await balanceRow.getByLabel("Tahun Y amount").fill("1000000");
  await page.getByRole("button", { name: "Tambah akun neraca" }).first().click();
  balanceRow = page.getByTestId("balance-account-table-row").last();
  await balanceRow.getByLabel("Nama akun").fill("Utang usaha");
  await balanceRow.getByLabel("Tahun Y amount").fill("250000");

  await openWorkflowTab(page, "Penilaian AAM");
  await expect(page.getByText("Asset Accumulation Method (AAM)")).toBeVisible();
  await expect(page.getByText("Historis + Penyesuaian = Disesuaikan")).toBeVisible();
  await expect(page.getByTestId("aam-adjustment-aset")).toContainText("Kas di tangan");
  await expect(page.getByTestId("aam-adjustment-ekuitas")).toContainText("Changes on Asset Revaluation");
  await expect(page.getByTestId("aam-adjustment-ekuitas").locator('input[aria-label="Penyesuaian Changes on Asset Revaluation"]')).toHaveCount(0);
  await expect(page.getByTestId("aam-adjustment-liabilitas-ekuitas")).toContainText("Liabilitas + Ekuitas");
  await expect(page.getByTestId("aam-adjustment-liabilitas-ekuitas")).toContainText("Selisih balance");
  await expect(page.getByTestId("aam-adjustment-liabilitas-ekuitas")).toContainText("Tidak balance");
  await page.getByLabel("Penyesuaian Kas di tangan").fill("100000");
  await expect(page.getByText("1 penyesuaian masih perlu catatan.")).toBeVisible();
  await expect(page.getByTestId("aam-adjustment-ekuitas")).toContainText("100.000");
  await page.getByLabel("Catatan Kas di tangan").fill("FMV cash count after cut-off");
  await expect(page.getByText("Revaluasi otomatis Ekuitas: Rp 100.000.")).toBeVisible();
  await expect(page.getByTestId("aam-adjustment-aset")).toContainText("1.100.000");
  await expect(page.getByText(/850\.000/).first()).toBeVisible();
  await expect(page.locator("#aam")).not.toContainText("Ekuitas historis basis AAM");
  await expect(page.locator("#aam")).not.toContainText("Changes on Asset Revaluation");
  await expect(page.locator("#aam")).not.toContainText("Total liabilitas + ekuitas disesuaikan");
  await expect(page.locator("#aam")).not.toContainText("Selisih balance AAM");
  await expect(page.getByRole("heading", { name: "Ekuitas dan cakupan metode" })).toHaveCount(0);

  await openWorkflowTab(page, "Penilaian EEM");
  await expect(page.getByTestId("readiness-valuationEem")).toContainText("Masih diperlukan");
  await openWorkflowTab(page, "Penilaian DCF");
  await expect(page.getByTestId("readiness-valuationDcf")).toContainText("Masih diperlukan");

  await page.reload();
  await expect(page.getByTestId("valuation-workbench")).toBeVisible();
  await openWorkflowTab(page, "Penilaian AAM");
  await expect(page.getByLabel("Penyesuaian Kas di tangan")).toHaveValue("100.000");
  await expect(page.getByLabel("Catatan Kas di tangan")).toHaveValue("FMV cash count after cut-off");
  await expect(page.getByTestId("aam-adjustment-ekuitas")).toContainText("Changes on Asset Revaluation");
  await expect(page.getByTestId("aam-adjustment-ekuitas")).toContainText("100.000");
  await expect(page.getByTestId("aam-adjustment-liabilitas-ekuitas")).toContainText("Tidak balance");
});

test("added analysis sections use readiness gates before sample data and render formula-derived bridges after loading sample", async ({ page }) => {
  await openWorkflowTab(page, "NOPLAT & FCF");
  await expect(page.getByTestId("readiness-noplatFcf")).toBeVisible();
  await expect(page.getByTestId("readiness-noplatFcf")).toContainText("Masih diperlukan");
  await page.getByTestId("readiness-noplatFcf").getByRole("link", { name: /Isi Laba Rugi/ }).first().click();
  await expect(workflowNav(page).getByRole("button", { name: "Laba Rugi", exact: true })).toHaveAttribute("aria-current", "page");
  await openWorkflowTab(page, "Proyeksi Laba Rugi");
  await expect(page.getByTestId("readiness-projectedIncome")).toBeVisible();
  await expect(page.getByTestId("readiness-projectedIncome")).toContainText("Masih diperlukan");

  await loadSampleWorkbook(page);
  await openWorkflowTab(page, "Cash Flow Statement");
  await expect(page.getByText("Review arus kas historis")).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Koneksi EEM/DCF" })).toHaveCount(0);
  await expect(page.getByText("Calculated · override · final · trace")).toBeVisible();
  const cashFlowStatementTable = page.locator("table.cash-flow-statement-table");
  await expect(cashFlowStatementTable).not.toContainText(/CFS!\d/);
  await expect(cashFlowStatementTable).not.toContainText("Auto");
  await expect(page.getByLabel("Alasan override Non-operating cash flow 2021")).toHaveCount(0);
  await page.getByRole("textbox", { name: "Override Non-operating cash flow 2021", exact: true }).fill("100000000");
  await expect(cashFlowStatementTable.getByText("Override diterapkan", { exact: true })).toBeVisible();
  await expect(page.getByText("100.000.000").first()).toBeVisible();

  await openWorkflowTab(page, "Jadwal Utang");
  const debtScheduleSection = page.getByTestId("debt-schedule-section");
  await expect(debtScheduleSection.getByText("Utang dan pinjaman", { exact: true })).toBeVisible();
  await expect(debtScheduleSection.getByText("Bridge arus kas terkoreksi")).toHaveCount(0);
  await expect(debtScheduleSection.getByText("CASH FLOW STATEMENT")).toHaveCount(0);
  await expect(debtScheduleSection.getByText("Referensi audit sistem")).toHaveCount(0);
  await expect(debtScheduleSection.getByText("Total jadwal utang", { exact: true })).toBeVisible();
  const debtScheduleLegend = debtScheduleSection.locator(".debt-schedule-note");
  await expect(debtScheduleLegend.getByText("Input pengguna", { exact: true })).toBeVisible();
  await expect(debtScheduleLegend.getByText("Dihitung otomatis", { exact: true })).toBeVisible();
  await expect(debtScheduleLegend.getByText("Terhubung Neraca", { exact: true })).toBeVisible();
  await expect(debtScheduleSection).not.toContainText("ACC PAYABLES");
  await expect(debtScheduleSection).not.toContainText("Formula SUM");
  await expect(debtScheduleSection).not.toContainText("Balance Sheet row");
  await expect(debtScheduleSection).not.toContainText("Input manual");
  await expect(debtScheduleSection).not.toContainText("Formula / aturan");
  const shortRateRow = debtScheduleSection.locator("tbody tr").filter({ hasText: "Tarif pinjaman untuk jadwal" }).first();
  await expect(shortRateRow.getByRole("textbox").first()).toHaveValue("0,13");
  await expect(shortRateRow).toContainText("Parameter tarif; bukan saldo pokok pinjaman.");
  const shortBeginningRow = debtScheduleSection.locator("tbody tr").filter({ hasText: "Saldo awal mengikuti periode sebelumnya" }).first();
  await expect(shortBeginningRow.getByRole("textbox")).toHaveCount(0);
  const shortAdditionRow = debtScheduleSection.locator("tbody tr").filter({ hasText: "Penambahan mengikuti perubahan pinjaman di Neraca" }).first();
  await expect(shortAdditionRow.getByRole("textbox")).toHaveCount(0);
  await expect(page.locator("body")).not.toContainText("Workbook audit reference");

  await openWorkflowTab(page, "NOPLAT & FCF");
  await expect(page.getByText("Free Cash Flow to Firm (FCFF)")).toBeVisible();
  await expect(page.getByText("Basis statutory komersial")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Bridge NOPLAT" })).toHaveCount(0);
  await expect(page.getByTestId("noplat-audit-panel")).toHaveCount(0);
  const noplatBox = await page.getByTestId("noplat-panel").boundingBox();
  const fcfBox = await page.getByTestId("fcf-panel").boundingBox();
  expect(noplatBox).not.toBeNull();
  expect(fcfBox).not.toBeNull();
  expect(fcfBox!.y).toBeGreaterThan(noplatBox!.y + noplatBox!.height - 1);

  await openWorkflowTab(page, "Proyeksi Laba Rugi");
  await expect(page.getByRole("heading", { name: "Proyeksi Laba Rugi" })).toBeVisible();
  await expect(page.getByTestId("dcf-income-projection-table")).toContainText("Revenue");
  await expect(page.getByTestId("dcf-income-projection-table")).toContainText("2026");
  await expect(page.getByTestId("dcf-income-projection-table")).toContainText("Full Income Statement Presentation");
  await expect(page.getByTestId("dcf-income-projection-table")).toContainText("Accounting Net Profit After Tax");
  await expect(page.getByTestId("dcf-income-projection-table")).toContainText("Operating to NOPLAT Bridge");
  await expect(page.getByTestId("dcf-income-projection-table")).toContainText("Add Back: Interest Expense");
  await expect(page.getByTestId("dcf-income-projection-table")).toContainText("NOPLAT");
  await expect(page.getByTestId("income-projection-reliance-governance")).toContainText("Governance final report reliance");
  await expect(page.getByTestId("income-projection-reliance-governance")).toContainText("Current FCFF/WACC tetap menjadi fallback");
  await expect(page.getByTestId("income-projection-reliance-governance")).toContainText("Stress accounting presentation");
  await expect(page.getByTestId("income-projection-controls")).toContainText("Income projection reviewer controls");
  await expect(page.getByTestId("income-projection-controls")).toContainText("Yearly override");
  await expect(page.getByTestId("income-projection-controls")).toContainText("Recurring vs non-recurring non-operating income");
  await expect(page.getByTestId("income-projection-controls")).toContainText("Debt/cash/yield");
  await expect(page.getByTestId("income-projection-controls")).toContainText("Reviewer approval/rejection");
  await expect(page.getByTestId("income-projection-audit-events")).toHaveCount(0);
  await page.getByRole("button", { name: /Terapkan semua smart suggestion/ }).click();
  await expect(page.getByLabel("Revenue growth override 2022")).toHaveValue(/.+/);
  await expect(page.getByLabel("Gross margin override 2022")).toHaveValue(/.+/);
  await expect(page.getByLabel("Opex margin override 2022")).toHaveValue(/.+/);
  await expect(page.getByLabel("Depreciation override 2022")).toHaveValue(/.+/);
  await expect(page.getByLabel("Cash/deposit yield")).toHaveValue(/.+/);
  await expect(page.getByLabel("Interest expense / revenue")).toHaveValue(/.+/);
  await expect(page.getByTestId("income-projection-audit-events")).toHaveCount(0);
  const approvalSafeRevenueGrowth = await page.getByLabel("Revenue growth override 2022").inputValue();
  const approvalSafeGrossMargin = await page.getByLabel("Gross margin override 2022").inputValue();
  const approvalSafeOpexMargin = await page.getByLabel("Opex margin override 2022").inputValue();
  const approvalSafeDepreciation = await page.getByLabel("Depreciation override 2022").inputValue();
  const firstYearRevenueBeforeOverride = parseDisplayedNumber((await readIncomeProjectionRowCells(page, "Revenue"))[3]);
  await expect.poll(() => page.evaluate((key) => {
    const raw = window.localStorage.getItem(key);
    const state = raw ? JSON.parse(raw) : {};
    return state?.incomeProjectionControls?.auditEvents?.some((event: { field?: string }) =>
      event.field === "incomeProjectionControls.autoSmartSuggestions",
    );
  }, workbenchStorageKey)).toBe(true);
  await page.getByLabel("Revenue growth override 2022").fill("0,50");
  await page.getByLabel("Gross margin override 2022").fill("0,60");
  await page.getByLabel("Opex margin override 2022").fill("0,10");
  await page.getByLabel("Depreciation override 2022").fill("0,04");
  await expect.poll(async () => (await readIncomeProjectionRowCells(page, "Revenue Growth"))[3]).toBe("50%");
  const scenarioRevenue = parseDisplayedNumber((await readIncomeProjectionRowCells(page, "Revenue"))[3]);
  expect(scenarioRevenue).toBeGreaterThan(firstYearRevenueBeforeOverride);
  await expect.poll(async () => (await readIncomeProjectionRowCells(page, "Gross Profit Margin"))[3]).toBe("60%");
  const scenarioOpex = parseDisplayedNumber((await readIncomeProjectionRowCells(page, "General & Administrative Overheads"))[3]);
  const scenarioDepreciation = parseDisplayedNumber((await readIncomeProjectionRowCells(page, "Depreciation"))[3]);
  expect(Math.abs(scenarioOpex - scenarioRevenue * 0.1)).toBeLessThanOrEqual(1);
  expect(Math.abs(scenarioDepreciation - scenarioRevenue * 0.04)).toBeLessThanOrEqual(1);
  await expect.poll(() => page.evaluate((key) => {
    const raw = window.localStorage.getItem(key);
    const state = raw ? JSON.parse(raw) : {};
    return state?.incomeProjectionControls?.auditEvents?.some((event: { field?: string }) =>
      event.field === "2022.revenueGrowth",
    );
  }, workbenchStorageKey)).toBe(true);
  await page.getByLabel("Revenue growth override 2022").fill(approvalSafeRevenueGrowth);
  await page.getByLabel("Gross margin override 2022").fill(approvalSafeGrossMargin);
  await page.getByLabel("Opex margin override 2022").fill(approvalSafeOpexMargin);
  await page.getByLabel("Depreciation override 2022").fill(approvalSafeDepreciation);
  await page.getByTestId("income-projection-controls").getByLabel("Decision").selectOption("approved");
  const approvedScenarioDcfValue = await page
    .getByTestId("income-projection-controls")
    .locator(".projection-governance-grid > div", { hasText: "Scenario DCF" })
    .locator("strong")
    .innerText();
  await expect.poll(() => page.evaluate((key) => {
    const raw = window.localStorage.getItem(key);
    const state = raw ? JSON.parse(raw) : {};
    return state?.incomeProjectionControls?.auditEvents?.some((event: { field?: string }) =>
      event.field === "reviewerDecision.decision",
    );
  }, workbenchStorageKey)).toBe(true);
  await expect(page.getByTestId("dcf-income-projection-table")).not.toContainText("Revenue t-1");
  await expect(page.getByTestId("dcf-income-projection-table")).not.toContainText(/belum dimodelkan/i);
  await expect(page.getByTestId("dcf-income-projection-table")).toContainText("Presentation-only");
  await expect(page.getByTestId("dcf-income-projection-table")).not.toContainText(/KKP|Excel|Workbook/i);
  await expect(page.getByText("Detail formula dan referensi audit")).toHaveCount(0);
  await expect(page.getByTestId("dcf-income-projection-table-trace")).toHaveCount(0);

  await openWorkflowTab(page, "Penilaian DCF");
  await expect(page.getByTestId("dcf-active-basis-label")).toHaveText("Reviewer scenario");
  await expect(page.getByTestId("dcf-active-equity-value")).toHaveText(approvedScenarioDcfValue);
  await openWorkflowTab(page, "Proyeksi Laba Rugi");
  await page.getByTestId("income-projection-controls").getByLabel("Decision").selectOption("pending");

  await openWorkflowTab(page, "Proyeksi Neraca");
  await expect(page.getByRole("heading", { name: "Proyeksi Neraca" })).toBeVisible();
  await expect(page.getByTestId("dcf-balance-projection-table")).toContainText("Current Assets");
  await expect(page.getByTestId("dcf-balance-projection-table")).toContainText("Balance Control");
  await expect(page.getByTestId("dcf-balance-projection-table")).not.toContainText("Perlu input");
  await expect(page.getByTestId("dcf-balance-projection-table")).not.toContainText(/belum dimodelkan/i);
  await expect(page.getByText("Detail formula dan referensi audit")).toHaveCount(0);
  await expect(page.getByTestId("dcf-balance-projection-table-trace")).toHaveCount(0);

  await openWorkflowTab(page, "Penilaian DCF");
  await expect(page.getByTestId("dcf-sensitivity-historical-projection")).toContainText("DCF - proyeksi neraca berbasis historis");
  await expect(page.getByTestId("dcf-sensitivity-base")).toContainText("Skenario utama memakai WACC");
  await expect(page.getByTestId("dcf-sensitivity-terminal-downside")).toContainText("terminal growth ke downside");
  await expect(page.getByTestId("dcf-sensitivity-terminal-upside")).toContainText("terminal growth ke upside");
  await expect(page.getByTestId("dcf-sensitivity-no-incremental-wc")).toContainText("perubahan modal kerja incremental");
  await expect(page.getByTestId("dcf-sensitivity-tax-payable-debt-like")).toContainText("utang pajak sebagai kewajiban debt-like");
  await expect(page.getByTestId("dcf-sensitivity-historical-projection")).toContainText("di-roll-forward dari data historis user");
  await expect(page.getByRole("heading", { name: "Kesiapan DCF" })).toHaveCount(0);
  const baseDcfValue = await page.getByTestId("dcf-base-equity-value").textContent();
  const noIncrementalWcValue = await page.getByTestId("dcf-no-incremental-wc-equity-value").textContent();
  await expect(page.getByTestId("dcf-active-equity-value")).toHaveText(baseDcfValue ?? "");
  await page.getByLabel("Basis DCF aktif").selectOption("noIncrementalWorkingCapital");
  await expect(page.getByTestId("dcf-active-basis-label")).toContainText("Tanpa WC incremental");
  await expect(page.getByTestId("dcf-active-equity-value")).toHaveText(noIncrementalWcValue ?? "");
  await expect(page.getByTestId("dcf-sensitivity-no-incremental-wc")).toHaveClass(/active-sensitivity/);
  await openWorkflowTab(page, "Proyeksi Cash Flow Statement");
  const projectionDriverStrip = page.locator(".active-driver-strip").filter({ hasText: "Basis DCF aktif" }).first();
  await expect(projectionDriverStrip).toContainText("Tanpa WC incremental");
  await expect(projectionDriverStrip).toContainText("Working capital");
  await expect(projectionDriverStrip).toContainText("Diabaikan");
  await openWorkflowTab(page, "Simulasi Potensi Pajak");
  await page.locator(".tax-control-grid").getByLabel("Primary Method").selectOption("DCF");
  await expect(page.getByTestId("tax-simulation-table")).toContainText(noIncrementalWcValue ?? "");
  await openWorkflowTab(page, "Penilaian DCF");
  await page.getByLabel("Basis DCF aktif").selectOption("base");
  await expect(page.getByTestId("dcf-active-equity-value")).toHaveText(baseDcfValue ?? "");
  await expect(page.getByTestId("dcf-projection-governance")).toContainText("Governance proyeksi DCF");
  await expect(page.getByTestId("dcf-projection-governance")).toContainText("Fallback");
  const historicalRollForwardDcfValue = await page.getByTestId("dcf-base-equity-value").textContent();

  await openWorkflowTab(page, "Proyeksi Aset Tetap");
  await expect(page.getByRole("heading", { name: "Proyeksi Aset Tetap" })).toBeVisible();
  await expect(page.getByTestId("dcf-fixed-asset-projection-table")).toContainText("A. Acquisition Costs");
  await expect(page.getByTestId("dcf-fixed-asset-projection-table")).toContainText("Net Value Fixed Assets");
  await expect(page.getByTestId("dcf-fixed-asset-projection-table")).toContainText("Roll-forward aset tetap historis");
  await expect(page.getByTestId("dcf-fixed-asset-projection-table")).toContainText("Office Inventory");
  await expect(page.getByTestId("dcf-fixed-asset-projection-table")).not.toContainText("Electrical");
  await expect(page.getByRole("radio", { name: /Roll-forward Historis/ })).toHaveAttribute("aria-checked", "true");
  await expect(page.getByTestId("dcf-fixed-asset-projection-table")).not.toContainText("Delta vs DCF capex");
  await expect(page.getByTestId("dcf-fixed-asset-projection-table")).not.toContainText(/belum dimodelkan/i);
  await expect(page.getByTestId("dcf-fixed-asset-projection-table")).not.toContainText("Perlu input");
  await expect(page.getByText("Detail formula dan referensi audit")).toHaveCount(0);
  await expect(page.getByTestId("dcf-fixed-asset-projection-table-trace")).toHaveCount(0);
  await page.getByRole("radio", { name: /Proksi DCF/ }).click();
  await expect(page.getByRole("radio", { name: /Proksi DCF/ })).toHaveAttribute("aria-checked", "true");
  await expect(page.getByTestId("dcf-fixed-asset-projection-table")).toContainText("Proksi DCF berbasis jadwal aset tetap");
  await openWorkflowTab(page, "Penilaian DCF");
  await expect.poll(() => page.getByTestId("dcf-base-equity-value").textContent()).not.toBe(historicalRollForwardDcfValue);

  await openWorkflowTab(page, "Proyeksi Cash Flow Statement");
  await expect(page.getByRole("heading", { name: "Proyeksi Cash Flow Statement" })).toBeVisible();
  await expect(page.getByTestId("dcf-cash-flow-projection-table")).toContainText("Cash Flow before Financing");
  await expect(page.getByTestId("dcf-cash-flow-projection-table")).toContainText("Cash Flow Control");
  await expect(page.getByTestId("dcf-cash-flow-projection-table")).toContainText("Integrated Schedule Safeguards");
  await expect(page.getByTestId("dcf-cash-flow-projection-table")).toContainText("FCFF Preservation Control");
  await expect(page.getByTestId("dcf-cash-flow-projection-table")).toContainText("Tax Payable Schedule");
  await expect(page.getByTestId("dcf-cash-flow-projection-table")).toContainText("Debt & Distribution Schedule");
  await expect(page.getByTestId("dcf-cash-flow-projection-table")).toContainText("Cash Policy Schedule");
  await expect(page.getByTestId("dcf-cash-flow-projection-table")).toContainText("Schedule-driven");
  await expect(page.getByTestId("dcf-cash-flow-projection-table")).toContainText("Unallocated");
  await expect(page.getByTestId("dcf-cash-flow-projection-table")).toContainText("2026");
  await expect(page.getByTestId("dcf-cash-flow-projection-table")).not.toContainText("Perlu input");
  await expect(page.getByTestId("dcf-cash-flow-projection-table")).not.toContainText(/belum dimodelkan/i);
  await expect(page.getByText("Detail formula dan referensi audit")).toHaveCount(0);
  await expect(page.getByTestId("dcf-cash-flow-projection-table-trace")).toHaveCount(0);

  await openWorkflowTab(page, "Financial Ratio");
  const ratioTable = page.locator("table.ratio-table");
  await expect(ratioTable).toContainText("FCF / Operating Cash Ratio");
  await expect(ratioTable).toContainText("Short Term Debt Coverage");
  await expect(ratioTable).toContainText("Capex Coverage");
  await expect(ratioTable).toContainText("Operating cash flow / capex");
  await expect(ratioTable.locator("thead th").last()).toHaveCSS("text-align", "right");
  await expect(ratioTable.locator("tbody tr").first().locator("td").last()).toHaveCSS("text-align", "right");
  await expect(page.getByRole("heading", { name: "Bridge efisiensi modal" })).toHaveCount(0);

  await openWorkflowTab(page, "ROIC");
  await expect(page.getByText("Bridge efisiensi modal")).toBeVisible();
  await expect(page.getByText("Basis NOPLAT terkoreksi")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Basis kapital ROIC" })).toHaveCount(0);
  await expect(page.locator(".roic-table-panel")).toBeVisible();
  const roicLayout = await page.evaluate(() => {
    const tablePanel = document.querySelector(".roic-table-panel");
    const tableWrap = document.querySelector(".roic-table-panel .table-wrap");
    const workspace = document.querySelector(".workspace");

    if (!(tablePanel instanceof HTMLElement) || !(tableWrap instanceof HTMLElement) || !(workspace instanceof HTMLElement)) {
      return null;
    }

    const tablePanelBox = tablePanel.getBoundingClientRect();
    const tableWrapBox = tableWrap.getBoundingClientRect();
    const workspaceBox = workspace.getBoundingClientRect();

    return {
      tablePanelBottom: tablePanelBox.bottom,
      tableWrapWidth: tableWrapBox.width,
      workspaceWidth: workspaceBox.width,
    };
  });
  expect(roicLayout).not.toBeNull();
  expect(roicLayout?.tablePanelBottom ?? 0).toBeGreaterThan(0);
  expect(roicLayout?.tableWrapWidth ?? 0).toBeGreaterThan((roicLayout?.workspaceWidth ?? 0) * 0.7);
  expect(await hasNoRootHorizontalOverflow(page)).toBe(true);

  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator(".mobile-workflow-tabs")).toBeVisible();
  await expect(page.locator(".roic-audit-panel")).toHaveCount(0);
  expect(await hasNoRootHorizontalOverflow(page)).toBe(true);
});

test("DLOM and tax simulation render workbook-derived scenario layer after loading sample", async ({ page }) => {
  await openWorkflowTab(page, "DLOM");
  await expect(page.getByTestId("dlom-basis-grid")).toContainText("Isi Data Awal");
  await expect(page.getByTestId("dlom-basis-grid").locator("select")).toHaveCount(0);
  await expect(page.getByTestId("dlom-summary")).toContainText("Belum lengkap");
  await expect(page.getByTestId("dlom-factor-table")).toContainText("Belum lengkap");

  await loadSampleWorkbook(page);

  await openWorkflowTab(page, "DLOM");
  await expect(page.getByTestId("dlom-basis-grid")).toContainText("DLOM Perusahaan tertutup");
  await expect(page.getByTestId("dlom-basis-grid")).toContainText("Minoritas");
  await expect(page.getByTestId("dlom-basis-grid")).toContainText("30% - 50%");
  await expect(page.getByTestId("dlom-basis-grid")).not.toContainText("Terhubung dari Jenis Perusahaan");
  await expect(page.getByTestId("dlom-basis-grid")).not.toContainText("Workbook UPDATE DLOM!C31");
  await expect(page.getByTestId("dlom-basis-grid")).not.toContainText("Formula");
  await expect(page.getByTestId("dlom-basis-grid")).not.toContainText("DLOM!F34");
  await expect(page.getByText("Range minimum")).toHaveCount(0);
  await expect(page.getByText("Range maksimum")).toHaveCount(0);
  await expect(page.getByText("Selisih rentang")).toHaveCount(0);
  await expect(page.getByText("DLOM resmi")).toHaveCount(0);
  const dlomBasisLayout = await page.getByTestId("dlom-basis-grid").locator(".derived-field").evaluateAll((fields) =>
    fields.map((field) => {
      const rect = field.getBoundingClientRect();

      return { top: Math.round(rect.top), height: Math.round(rect.height) };
    }),
  );
  expect(dlomBasisLayout).toHaveLength(3);
  expect(
    Math.max(...dlomBasisLayout.map((field) => field.top)) - Math.min(...dlomBasisLayout.map((field) => field.top)),
  ).toBeLessThanOrEqual(1);
  expect(
    Math.max(...dlomBasisLayout.map((field) => field.height)) - Math.min(...dlomBasisLayout.map((field) => field.height)),
  ).toBeLessThanOrEqual(1);
  await expect(page.getByRole("heading", { name: "DLOM trace" })).toHaveCount(0);
  await expect(page.getByTestId("dlom-summary")).toContainText("35%");
  await expect(page.getByTestId("dlom-summary")).toContainText("Tinggi");
  await expect(page.getByTestId("dlom-summary")).toContainText("Posisi DLOM dalam rentang: Rendah");
  await expect(page.getByTestId("dlom-factor-table")).toContainText("Keterangan Tambahan");
  await expect(page.getByTestId("dlom-factor-table")).not.toContainText("Alasan override");
  await expect(page.getByTestId("dlom-factor-table")).toContainText("Entry Barrier Perijinan Usaha");
  await expect(page.getByTestId("dlom-factor-table")).toContainText("Terisi");
  await expect(page.getByLabel("Jawaban DLOM Profitabilitas (EBITDA)")).toHaveValue("Diatas");

  await page.setViewportSize({ width: 2430, height: 1350 });
  await openWorkflowTab(page, "DLOC/PFC");
  await expect(page.getByTestId("dloc-pfc-summary")).toContainText("34%");
  await expect(page.getByTestId("dloc-pfc-summary")).toContainText("Tinggi");
  await expect(page.getByTestId("dloc-pfc-summary")).toContainText("Posisi DLOC/PFC dalam rentang: Rendah");
  await expect(page.getByTestId("dloc-pfc-basis-grid")).toContainText("Rentang DLOC/PFC");
  await expect(page.getByTestId("dloc-pfc-basis-grid")).toContainText("30% - 70%");
  await expect(page.getByTestId("dloc-pfc-basis-grid")).not.toContainText("Rentang workbook");
  await expect(page.getByTestId("dloc-pfc-basis-grid")).not.toContainText("Sign convention");
  await expect(page.getByText("DLOC positif turun; PFC negatif naik")).toHaveCount(0);
  await expect(page.getByText("Unsigned rate")).toHaveCount(0);
  await expect(page.getByText("Signed rate")).toHaveCount(0);
  await expect(page.getByText("Hubungan ke simulasi pajak")).toHaveCount(0);
  await expect(page.getByText("Audit position")).toHaveCount(0);
  await expect(page.getByTestId("dloc-pfc-factor-table")).toContainText("Perjanjian antara Pemegang Saham");
  await expect(page.getByTestId("dloc-pfc-factor-table")).toContainText("Keterangan Tambahan");
  await expect(page.getByTestId("dloc-pfc-factor-table")).not.toContainText("Catatan reviewer");
  await expect(page.getByLabel("Jawaban DLOC/PFC Penunjukkan Manajemen")).toHaveValue("Sebagian");
  await expect(page.getByRole("heading", { name: "DLOC/PFC trace" })).toHaveCount(0);

  const dlocPfcColumnWidths = await page.getByTestId("dloc-pfc-factor-table").evaluate((table) =>
    Array.from(table.querySelectorAll("thead th")).map((cell) => Math.round(cell.getBoundingClientRect().width)),
  );
  expect(dlocPfcColumnWidths[2]).toBeLessThanOrEqual(240);
  expect(dlocPfcColumnWidths[3]).toBeLessThanOrEqual(80);
  expect(dlocPfcColumnWidths[5]).toBeGreaterThanOrEqual(360);
  expect(await tableFitsWrapper(page, "dloc-pfc-factor-table")).toBe(true);

  await openWorkflowTab(page, "Penilaian AAM");
  await expect(page.getByRole("heading", { name: "Ekuitas dan cakupan metode" })).toHaveCount(0);

  await openWorkflowTab(page, "Simulasi Potensi Pajak");
  await expect(page.getByText("Tahun Cut Off").locator("..")).toContainText("2021");
  await expect(page.getByText("Tahun Pajak Legal")).toHaveCount(0);
  await expect(page.getByText("Nilai pengalihan dari Data Awal").locator("..")).toContainText(/Rp\s*1\.600\.000\.000/);
  await expect(page.getByText("Nilai pengalihan dilaporkan (override)")).not.toBeVisible();
  await expect(page.getByText("Advanced override nilai pengalihan")).toHaveCount(0);
  await expect(page.getByTestId("tax-simulation-summary")).toContainText("AAM");
  await expect(page.getByTestId("tax-simulation-summary")).toContainText("DLOM 35%");
  await expect(page.getByTestId("tax-simulation-summary")).toContainText("DLOC 34%");
  await expect(page.getByTestId("tax-simulation-table")).toContainText("AAM");
  await expect(page.getByTestId("tax-simulation-table")).toContainText("EEM");
  await expect(page.getByTestId("tax-simulation-table")).toContainText("DCF");
  await expect(page.getByTestId("tax-simulation-table")).toContainText("Primary");
  await expect(page.getByTestId("tax-simulation-table")).not.toContainText("Rate otomatis dari tab DLOC/PFC");
  await expect(page.getByTestId("tax-simulation-table")).not.toContainText("Dibulatkan:");
  await expect(page.getByTestId("tax-simulation-table")).not.toContainText("UU 36/2008 Pasal 17 ayat (1) huruf a");
  await expect(page.getByText("AAM primary method")).toBeVisible();
  await expect(page.getByLabel("Catatan skenario manual")).not.toBeVisible();
  await expect(page.getByText("Jejak audit basis perhitungan")).toHaveCount(0);
  await expect(page.getByText("Hubungan ke base valuation")).toHaveCount(0);
  await expect(page.getByText("Detail sumber tarif dan dasar hukum")).toBeVisible();
  await expect(page.getByTestId("tax-bracket-table")).toContainText("Total potensi pajak");
  await expect(page.getByText("Effective rate")).not.toBeVisible();

  await page.getByLabel("Basis final").selectOption("manualScenario");
  await page.getByLabel("DLOM Skenario Manual").fill("0,1");
  await page.getByLabel("DLOC/PFC Skenario Manual").fill("0,2");
  await expect(page.getByText("Catatan audit skenario")).toHaveCount(0);
  await expect(page.getByTestId("tax-simulation-summary")).toContainText("Final memakai Skenario manual");
  await expect(page.getByTestId("tax-simulation-table")).toContainText("Skenario manual");
  await expect(page.locator("dt").filter({ hasText: "DLOM Skenario Manual" })).toBeVisible();
  await expect(page.locator("dt").filter({ hasText: "DLOC/PFC Skenario Manual" })).toBeVisible();
  await page.getByText("Detail sumber tarif dan dasar hukum").click();
  await expect(page.getByText("Effective rate")).toBeVisible();
});

test("share-transfer input keeps shares as quantity and passes derived rupiah value to tax simulation", async ({ page }) => {
  await loadSampleWorkbook(page);

  await workflowNav(page).getByRole("button", { name: "Data Awal" }).click();
  await page.getByLabel("Jenis Peralihan yang Diketahui").selectOption("Lembar Saham");
  await page.getByLabel("Jumlah Saham Beredar 100%").fill("5280");
  await page.getByLabel("Jumlah Saham yang Dinilai").fill("1610");
  await expect(page.getByText("Nilai Saham Per Lembar")).toBeVisible();
  await expect(page.getByText("Nilai Saham yang Dinilai").locator("..")).toContainText("Data Tidak Valid");

  await page.getByLabel("Nilai Saham Per Lembar").fill("1000000");
  await expect(page.getByTestId("case-profile-panel")).toContainText(/Rp\s*1\.610\.000\.000/);
  await expect(page.getByTestId("case-profile-panel")).toContainText("30,49%");

  await openWorkflowTab(page, "Simulasi Potensi Pajak");
  await expect(page.getByText("Nilai pengalihan dilaporkan (override)")).not.toBeVisible();
  await expect(page.getByText("Nilai pengalihan dari Data Awal").locator("..")).toContainText(/Rp\s*1\.610\.000\.000/);
  await expect(page.getByText("Advanced override nilai pengalihan")).toHaveCount(0);
  await expect(page.getByTestId("tax-simulation-table")).toContainText(/Rp\s*1\.610\.000\.000/);
  await expect(page.getByTestId("tax-simulation-table")).not.toContainText("Rp1.610,00");
});

test("legacy workbook-like DLOM drafts migrate to workbook UPDATE basis without showing formula UI", async ({ page }) => {
  await page.addInitScript(({ key, state }) => {
    window.localStorage.clear();
    window.localStorage.setItem(key, JSON.stringify(state));
  }, {
    key: "penilaian-valuasi-bisnis.workbench.v1",
    state: {
      version: 9,
      savedAt: "2026-05-03T00:00:00.000Z",
      periods: [{ id: "p2021", label: "2021", valuationDate: "2021-12-31", yearOffset: 0 }],
      activePeriodId: "p2021",
      rows: [
        {
          id: "manual-cash-hand",
          statement: "balance_sheet",
          accountName: "Cash on Hands (Kas + Kas)",
          categoryOverride: "",
          balanceSheetClassification: "",
          labelOverrides: [],
          values: { p2021: "717.848.795" },
        },
        {
          id: "manual-revenue",
          statement: "income_statement",
          accountName: "Revenue (Penjualan)",
          categoryOverride: "REVENUE",
          balanceSheetClassification: "",
          labelOverrides: [],
          values: { p2021: "16.663.916.100" },
        },
      ],
      isFixedAssetScheduleEnabled: false,
      fixedAssetScheduleRows: [],
      caseProfile: {
        objectTaxpayerName: "Makmur Jaya Sejati Raya",
        companyType: "Tertutup",
        shareOwnershipType: "Minoritas",
      },
      dlom: {
        factors: {
          licenseEntryBarrier: { answer: "Ada", overrideReason: "" },
          scaleEntryBarrier: { answer: "Segmen Tertentu", overrideReason: "" },
          dividendPolicy: { answer: "Kadang-kadang", overrideReason: "" },
          profitability: { answer: "Diatas", overrideReason: "" },
          netIncomeVolatility: { answer: "Tidak, Meningkat", overrideReason: "" },
          capitalStructure: { answer: "Rata-rata", overrideReason: "" },
          liquidity: { answer: "Rata-rata", overrideReason: "" },
          salesGrowth: { answer: "Lebih Besar", overrideReason: "" },
          companyProspect: { answer: "Seperti Saat Ini", overrideReason: "" },
          managementQuality: { answer: "Ya", overrideReason: "" },
        },
      },
    },
  });
  await page.reload();
  await expect(page.getByTestId("valuation-workbench")).toBeVisible();

  await openWorkflowTab(page, "DLOM");
  await expect(page.getByTestId("dlom-basis-grid")).toContainText("Minoritas");
  await expect(page.getByTestId("dlom-basis-grid")).toContainText("30% - 50%");
  await expect(page.getByTestId("dlom-basis-grid")).not.toContainText("Workbook UPDATE DLOM!C31");
  await expect(page.getByTestId("dlom-basis-grid")).not.toContainText("Formula");
  await expect(page.getByTestId("dlom-summary")).toContainText("35%");
  await expect.poll(() => page.evaluate(() => JSON.parse(window.localStorage.getItem("penilaian-valuasi-bisnis.workbench.v1") ?? "{}").version)).toBe(18);
});

test("exports the active workbench state to a print-ready PDF report view", async ({ page }) => {
  await loadPersistedWorkbenchFixture(page);

  await page.getByRole("button", { name: "Export PDF" }).click();
  await expect(page.getByRole("menu", { name: "Pilihan export PDF" })).toBeVisible();
  await expect(page.getByRole("menuitem", { name: "Export PDF Penilaian AAM" })).toBeVisible();
  await expect(page.getByRole("menuitem", { name: "Export PDF Penilaian EEM" })).toBeVisible();
  await expect(page.getByRole("menuitem", { name: "Export PDF Penilaian DCF" })).toBeVisible();
  const popupPromise = page.waitForEvent("popup");
  await page.getByRole("menuitem", { name: "Export PDF AAM + EEM + DCF" }).click();
  const reportPage = await popupPromise;
  await reportPage.waitForLoadState("domcontentloaded");

  await expect(reportPage).toHaveURL(/\/export\/pdf\?filename=penilaian-bisnis-makmur-jaya-sejati-raya-aam-eem-dcf-\d{4}-\d{2}-\d{2}\.pdf$/);
  await expect(reportPage.getByTestId("pdf-report")).toBeVisible();
  await expect(reportPage).toHaveTitle(/^penilaian-bisnis-makmur-jaya-sejati-raya-aam-eem-dcf-\d{4}-\d{2}-\d{2}\.pdf$/);
  await expect(reportPage.getByRole("heading", { name: "Laporan Gabungan AAM, EEM, dan DCF" })).toBeVisible();
  await expect(reportPage.getByText("Scope Export")).toBeVisible();
  await expect(reportPage.getByText("AAM + EEM + DCF")).toBeVisible();
  await expect(reportPage.getByText("Makmur Jaya Sejati Raya").first()).toBeVisible();
  await expect(reportPage.getByRole("heading", { name: "Identitas Objek Pajak" })).toBeVisible();
  await expect(reportPage.getByText("Jenis Kepemilikan Saham")).toBeVisible();
  await expect(reportPage.getByText("Akhir Periode Proyeksi Pertama")).toBeVisible();
  await expect(reportPage.getByRole("heading", { name: "Ringkasan Metode" })).toBeVisible();
  const methodSection = reportPage.locator(".pdf-report-section").filter({ has: reportPage.getByRole("heading", { name: "Ringkasan Metode" }) });
  await expect(methodSection.getByRole("columnheader", { name: "Nilai Ekuitas (30,49%)" })).toBeVisible();
  await expect(methodSection.getByRole("columnheader", { name: "Potensi Pajak" })).toBeVisible();
  await expect(methodSection.getByRole("columnheader", { name: "Trace" })).toHaveCount(0);
  await expect(methodSection.getByRole("columnheader", { name: "Status" })).toHaveCount(0);
  await expect(reportPage.getByRole("heading", { name: "Laporan Neraca" })).toBeVisible();
  const balanceSheetSection = reportPage.locator(".pdf-report-section").filter({ has: reportPage.getByRole("heading", { name: "Laporan Neraca" }) });
  await expect(balanceSheetSection.getByRole("columnheader", { name: "Sumber" })).toHaveCount(0);
  await expect(reportPage.getByRole("heading", { name: "Laporan Laba Rugi" })).toBeVisible();
  await expect(reportPage.getByRole("heading", { name: "Laporan Daftar Aset" })).toBeVisible();
  await expect(reportPage.getByRole("heading", { name: "Jadwal Utang" })).toBeVisible();
  const debtScheduleReportSection = reportPage.locator(".pdf-report-section").filter({ has: reportPage.getByRole("heading", { name: "Jadwal Utang" }) });
  await expect(debtScheduleReportSection.getByRole("columnheader", { name: "Sumber" })).toBeVisible();
  await expect(reportPage.getByRole("heading", { name: "Penyesuaian AAM" })).toBeVisible();
  await expect(reportPage.getByRole("heading", { name: "Sensitivitas EEM" })).toBeVisible();
  const eemSensitivitySection = reportPage.locator(".pdf-report-section").filter({ has: reportPage.getByRole("heading", { name: "Sensitivitas EEM" }) });
  await expect(eemSensitivitySection).toContainText("EEM - skenario dasar");
  await expect(eemSensitivitySection).toContainText("EEM - utang pajak debt-like");
  await expect(eemSensitivitySection).toContainText("selisih terhadap dasar sama dengan saldo utang pajak");
  await expect(reportPage.getByRole("heading", { name: "Sensitivitas DCF" })).toBeVisible();
  await expect(reportPage.getByRole("heading", { name: "Ringkasan", exact: true })).toBeVisible();
  await expect(reportPage.getByText("Metode AAM")).toBeVisible();
  await expect(reportPage.getByText("Metode EEM")).toBeVisible();
  await expect(reportPage.getByText("Metode DCF")).toBeVisible();
  await expect(reportPage.getByRole("heading", { name: "DLOM dan DLOC/PFC" })).toBeVisible();
  await expect(reportPage.getByText("DLOM Basis")).toBeVisible();
  await expect(reportPage.getByText("DLOC/PFC Rate")).toBeVisible();
  await expect(reportPage.getByText("Resistensi keseluruhan")).toBeVisible();
  await expect(reportPage.getByText("Resistensi WP: Tinggi").first()).toBeVisible();
  await expect(reportPage.getByRole("heading", { name: "Simulasi Potensi Pajak" })).toBeVisible();
  await expect(reportPage.getByRole("heading", { name: "Audit dan Catatan Review" })).toHaveCount(0);
  await expect(reportPage.getByRole("button", { name: "Cetak / Simpan PDF" })).toBeVisible();

  await reportPage.close();
});

test("active EEM basis can switch to tax payable debt-like and flows to tax simulation", async ({ page }) => {
  await loadPersistedWorkbenchFixture(page);
  await openWorkflowTab(page, "Penilaian EEM");

  const baseEemValue = await page.getByTestId("eem-base-equity-value").textContent();
  const debtLikeEemValue = await page.getByTestId("eem-tax-payable-debt-like-equity-value").textContent();

  await expect(page.getByTestId("eem-active-basis-label")).toContainText("Skenario dasar");
  await expect(page.getByTestId("eem-active-equity-value")).toHaveText(baseEemValue ?? "");
  await page.getByLabel("Basis EEM aktif").selectOption("taxPayableDebtLike");
  await expect(page.getByTestId("eem-active-basis-label")).toContainText("Utang pajak debt-like");
  await expect(page.getByTestId("eem-active-equity-value")).toHaveText(debtLikeEemValue ?? "");
  await expect(page.getByTestId("eem-active-summary-equity-value")).toHaveText(debtLikeEemValue ?? "");
  await expect(page.getByTestId("eem-sensitivity-grid").locator(".active-sensitivity")).toContainText("EEM - utang pajak debt-like");
  await expect(page.getByText("Penyesuaian basis aktif EEM")).toBeVisible();
  await expect(page.getByTestId("eem-trace-row")).toHaveCount(21);
  await expect(page.getByTestId("eem-trace-table")).toContainText("Equity Value (100%)");
  await expect(page.getByTestId("eem-trace-table")).toContainText("Acuan workbook");
  await expect(page.getByTestId("eem-trace-table")).not.toContainText("STAT_EEM");
  await expect(page.getByTestId("eem-trace-table")).not.toContainText("EEM!D");
  await expect(page.locator("#eem code")).toHaveCount(0);
  await expect(page.getByTestId("eem-sensitivity-grid").locator("code")).toHaveCount(0);

  await openWorkflowTab(page, "Simulasi Potensi Pajak");
  await page.locator(".tax-control-grid").getByLabel("Primary Method").selectOption("EEM");
  await expect(page.getByTestId("tax-simulation-table")).toContainText(debtLikeEemValue ?? "");
  await expect
    .poll(() =>
      page.evaluate((key) => {
        const raw = window.localStorage.getItem(key);
        return raw ? JSON.parse(raw).activeEemBasis : null;
      }, workbenchStorageKey),
    )
    .toBe("taxPayableDebtLike");
});

test("exports method-scoped PDF reports for AAM, EEM, and DCF", async ({ page }) => {
  await loadPersistedWorkbenchFixture(page);

  await page.getByRole("button", { name: "Export PDF" }).click();
  const aamPopupPromise = page.waitForEvent("popup");
  await page.getByRole("menuitem", { name: "Export PDF Penilaian AAM" }).click();
  const aamReportPage = await aamPopupPromise;
  await aamReportPage.waitForLoadState("domcontentloaded");

  await expect(aamReportPage.getByRole("heading", { name: "Laporan Penilaian AAM" })).toBeVisible();
  await expect(aamReportPage).toHaveTitle(/^penilaian-bisnis-makmur-jaya-sejati-raya-aam-\d{4}-\d{2}-\d{2}\.pdf$/);
  await expect(aamReportPage.locator(".pdf-report-cover").getByText("Penilaian AAM", { exact: true })).toBeVisible();
  await expect(aamReportPage.getByRole("heading", { name: "Penyesuaian AAM" })).toBeVisible();
  await expect(aamReportPage.getByRole("heading", { name: "Sensitivitas EEM" })).toHaveCount(0);
  await expect(aamReportPage.getByRole("heading", { name: "Sensitivitas DCF" })).toHaveCount(0);
  await expect(aamReportPage.getByRole("heading", { name: "Laporan Laba Rugi" })).toHaveCount(0);
  const aamTraceSection = aamReportPage.locator(".pdf-report-section").filter({ has: aamReportPage.getByRole("heading", { name: "Ringkasan", exact: true }) });
  await expect(aamTraceSection.getByText("Metode AAM")).toBeVisible();
  await expect(aamTraceSection.getByText("Metode EEM")).toHaveCount(0);
  await expect(aamTraceSection.getByText("Metode DCF")).toHaveCount(0);
  await aamReportPage.close();

  await page.getByRole("button", { name: "Export PDF" }).click();
  const eemPopupPromise = page.waitForEvent("popup");
  await page.getByRole("menuitem", { name: "Export PDF Penilaian EEM" }).click();
  const eemReportPage = await eemPopupPromise;
  await eemReportPage.waitForLoadState("domcontentloaded");

  await expect(eemReportPage.getByRole("heading", { name: "Laporan Penilaian EEM" })).toBeVisible();
  await expect(eemReportPage).toHaveTitle(/^penilaian-bisnis-makmur-jaya-sejati-raya-eem-\d{4}-\d{2}-\d{2}\.pdf$/);
  const eemSensitivitySection = eemReportPage.locator(".pdf-report-section").filter({
    has: eemReportPage.getByRole("heading", { name: "Sensitivitas EEM" }),
  });
  await expect(eemSensitivitySection).toBeVisible();
  await expect(eemSensitivitySection.getByRole("row", { name: /EEM - skenario dasar/ })).toBeVisible();
  await expect(eemSensitivitySection.getByRole("row", { name: /EEM - utang pajak debt-like/ })).toBeVisible();
  await expect(eemSensitivitySection.getByText("selisih terhadap dasar sama dengan saldo utang pajak")).toBeVisible();
  await expect(eemReportPage.getByRole("heading", { name: "Penyesuaian AAM" })).toHaveCount(0);
  await expect(eemReportPage.getByRole("heading", { name: "Sensitivitas DCF" })).toHaveCount(0);
  const eemTraceSection = eemReportPage.locator(".pdf-report-section").filter({ has: eemReportPage.getByRole("heading", { name: "Ringkasan", exact: true }) });
  await expect(eemTraceSection.getByText("Metode AAM")).toHaveCount(0);
  await expect(eemTraceSection.getByText("Metode EEM")).toBeVisible();
  await expect(eemTraceSection.getByText("Metode DCF")).toHaveCount(0);
  await eemReportPage.close();

  await page.getByRole("button", { name: "Export PDF" }).click();
  const dcfPopupPromise = page.waitForEvent("popup");
  await page.getByRole("menuitem", { name: "Export PDF Penilaian DCF" }).click();
  const dcfReportPage = await dcfPopupPromise;
  await dcfReportPage.waitForLoadState("domcontentloaded");

  await expect(dcfReportPage.getByRole("heading", { name: "Laporan Penilaian DCF" })).toBeVisible();
  await expect(dcfReportPage).toHaveTitle(/^penilaian-bisnis-makmur-jaya-sejati-raya-dcf-\d{4}-\d{2}-\d{2}\.pdf$/);
  await expect(dcfReportPage.getByRole("heading", { name: "Sensitivitas DCF" })).toBeVisible();
  await expect(dcfReportPage.getByText("DCF - terminal downside")).toBeVisible();
  await expect(dcfReportPage.getByText("DCF tanpa WC incremental")).toBeVisible();
  await expect(dcfReportPage.getByRole("heading", { name: "Penyesuaian AAM" })).toHaveCount(0);
  const dcfTraceSection = dcfReportPage.locator(".pdf-report-section").filter({ has: dcfReportPage.getByRole("heading", { name: "Ringkasan", exact: true }) });
  await expect(dcfTraceSection.getByText("Metode AAM")).toHaveCount(0);
  await expect(dcfTraceSection.getByText("Metode EEM")).toHaveCount(0);
  await expect(dcfTraceSection.getByText("Metode DCF")).toBeVisible();

  await dcfReportPage.close();
});

test("exports method-scoped XLSX workbooks", async ({ page }) => {
  await loadPersistedWorkbenchFixture(page);

  await page.getByRole("button", { name: "Export XLSX" }).click();
  await expect(page.getByRole("menu", { name: "Pilihan export XLSX" })).toBeVisible();
  await expect(page.getByRole("menuitem", { name: "Export XLSX Penilaian AAM" })).toBeVisible();
  await expect(page.getByRole("menuitem", { name: "Export XLSX Penilaian EEM" })).toBeVisible();
  await expect(page.getByRole("menuitem", { name: "Export XLSX Penilaian DCF" })).toBeVisible();
  await expect(page.getByRole("menuitem", { name: "Export XLSX AAM + EEM + DCF" })).toBeVisible();

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("menuitem", { name: "Export XLSX Penilaian DCF" }).click();
  const download = await downloadPromise;
  const downloadPath = await download.path();

  expect(download.suggestedFilename()).toMatch(/^penilaian-bisnis-makmur-jaya-sejati-raya-dcf-\d{4}-\d{2}-\d{2}\.xlsx$/);
  expect(downloadPath).toBeTruthy();

  const bytes = readFileSync(downloadPath ?? "");
  expect(bytes[0]).toBe(0x50);
  expect(bytes[1]).toBe(0x4b);
  expect(bytes[2]).toBe(0x03);
  expect(bytes[3]).toBe(0x04);
  expect(bytes.length).toBeGreaterThan(10_000);
  const xlsxXml = bytes.toString("utf8");
  const columnWidths = Array.from(xlsxXml.matchAll(/<col [^>]*width="([^"]+)"/g), (match) => Number(match[1]));

  expect(xlsxXml).toContain("<f>");
  expect(xlsxXml).toContain('name="DLOM"');
  expect(xlsxXml).toContain('name="DLOC PFC"');
  expect(xlsxXml).toContain('formatCode="#,##0;[Red](#,##0);0"');
  expect(xlsxXml).toContain('formatCode="0.00%;[Red](0.00%);0.00%"');
  expect(xlsxXml).toContain('wrapText="1"');
  expect(xlsxXml).toContain('customHeight="1"');
  expect(xlsxXml).toContain('bestFit="1"');
  expect(columnWidths.some((width) => width > 28)).toBe(true);
  expect(columnWidths.every((width) => width <= 40)).toBe(true);
  expect(xlsxXml).not.toMatch(/(^|[^A-Z])IFS\(/);
  expect(xlsxXml).not.toMatch(/(^|[^A-Z])SWITCH\(/);
  expect(xlsxXml).not.toMatch(/(^|[^A-Z])FLOOR\(/);
});

test("company sector can be manually overridden after KLU suggestion", async ({ page }) => {
  await page.getByLabel("KLU sesuai Appportal").fill("07102");
  await expect(page.getByLabel("Sektor Perusahaan")).toHaveValue("Basic Materials");

  await page.getByLabel("Sektor Perusahaan").selectOption("Energy");
  await expect(page.getByLabel("Sektor Perusahaan")).toHaveValue("Energy");
  await expect(page.getByTestId("company-sector-derived")).toHaveAttribute("title", /Override manual/);

  await page.getByLabel("KLU sesuai Appportal").fill("45101");
  await expect(page.getByLabel("Sektor Perusahaan")).toHaveValue("Energy");
  await expect(page.getByTestId("company-sector-derived")).toHaveAttribute("title", /Saran KLU 45101: Consumer Cyclicals/);
});

test("WACC and EEM/DCF assumptions expose source-backed suggestions, calculators, and active valuation sources", async ({ page }) => {
  await page.getByLabel("KLU sesuai Appportal").fill("45101");
  await expect(page.getByTestId("company-sector-derived")).toHaveValue("Consumer Cyclicals");
  await page.getByLabel("Tanggal penilaian").fill("2023-12-31");
  await openWorkflowTab(page, "Asumsi EEM/DCF");

  const taxCard = page.getByTestId("assumption-card-tax-rate");
  await expect(taxCard).toContainText("Tarif umum statutory 2023");
  await taxCard.getByRole("button", { name: /Tarif umum statutory 2023/ }).click();
  await expect(taxCard.getByLabel("Override manual")).toHaveValue("0,22");
  await expect(page.getByTestId("terminal-growth-suggestion-card")).toContainText("Consumer Cyclicals");
  await expect(page.getByTestId("terminal-growth-suggestion-card")).toContainText("118/121");
  await page.getByRole("button", { name: "Gunakan saran sektor" }).click();
  await expect(page.getByLabel("Terminal growth dasar")).toHaveValue("0");
  await expect(page.getByLabel("Terminal growth skenario bawah")).toHaveValue("-0,05");
  await expect(page.getByLabel("Terminal growth skenario atas")).toHaveValue("0,02");

  await openWorkflowTab(page, "WACC");
  await expect(page.getByTestId("wacc-suggestion-card")).toContainText("2023");
  await expect(page.getByTestId("wacc-suggestion-card")).toContainText("Equity Risk Premium");
  await expect(page.getByTestId("wacc-suggestion-card")).toContainText("Debt rate Bank Pemda");
  await expect(page.getByTestId("wacc-suggestion-card")).toContainText("Debt rate Bank Asing");
  await expect(page.getByTestId("wacc-suggestion-card")).toContainText("Debt rate Bank Campuran");
  await expect(page.getByTestId("wacc-suggestion-card")).not.toContainText("Input pasar tahunan");
  await page.getByRole("button", { name: /Terapkan Saran 2023/ }).click();
  await expect(page.getByLabel("Debt rate Bank Pemda")).toHaveValue("0,081637");
  await expect(page.getByLabel("Debt rate Bank Asing")).toHaveValue("0,067702");
  await expect(page.getByLabel("Debt rate Bank Campuran")).toHaveValue("0,079978");
  await expect(page.getByTestId("wacc-calculator")).toContainText("Rating-based default spread (RBDS)");
  await expect(page.getByTestId("wacc-calculator")).toContainText("isi dengan beta manual yang memiliki sumber dan justifikasi penilai");
  await expect(page.getByTestId("wacc-calculator")).not.toContainText("DCF discount rate dan EEM capitalization rate");
  await expect(page.getByTestId("discount-rate-analysis")).toContainText("Discount Rate Analysis (CAPM)");
  await expect(page.getByTestId("discount-rate-analysis")).not.toContainText("Detail audit teknis");
  await expect(page.getByTestId("wacc-comparable-table")).toContainText("Perusahaan Pembanding");
  await expect(page.getByTestId("wacc-comparable-source")).toContainText("IDX peer snapshot");
  await expect(page.getByTestId("wacc-comparable-source")).toContainText("Snapshot per 31 Desember 2023");
  await expect(page.getByTestId("wacc-comparable-source")).toContainText("return bulanan saham IDX");
  await expect(page.getByTestId("wacc-comparable-source-warning")).toContainText("Snapshot sesuai tanggal penilaian");
  await expect(page.getByTestId("wacc-comparable-source-warning")).toContainText("31 Des 2023");
  await expect(page.getByTestId("wacc-capital-structure-table")).toContainText("Struktur Kapital");
  await page.getByTestId("wacc-comparable-table").getByRole("button", { name: "Terapkan Saran" }).click();
  await expect(page.getByLabel("Fallback bobot utang")).toHaveValue(/0,\d+/);
  await expect(page.getByLabel("Fallback bobot ekuitas")).toHaveValue(/0,\d+/);
  await page.getByLabel("Fallback bobot utang").fill("0,25");
  await page.getByLabel("Fallback bobot ekuitas").fill("0,75");
  await expect(page.getByTestId("wacc-comparable-table")).toContainText("25% utang / 75% ekuitas");

  await openWorkflowTab(page, "Asumsi EEM/DCF");
  const receivablesCapacityInput = page.locator("#assumption-kapasitas-piutang");
  const inventoryCapacityInput = page.locator("#assumption-kapasitas-persediaan");
  const fixedAssetCapacityInput = page.locator("#assumption-kapasitas-aset-tetap");
  const additionalCapacityInput = page.locator("#assumption-jumlah-kapasitas-tambahan");
  await expect(page.getByTestId("required-return-suggestion-card")).toContainText("Basis required return on NTA");
  await expect(page.getByTestId("required-return-suggestion-card")).toContainText("Perlu input");
  await expect(fixedAssetCapacityInput).toHaveValue("");
  await expect(page.getByRole("button", { name: "Gunakan nilai sistem untuk Kapasitas aset tetap" })).toHaveCount(0);
  await expect(page.getByLabel("After-tax debt cost")).toHaveValue("0,06162");
  await expect(page.getByTestId("required-return-on-nta-calculator")).not.toContainText("BORROWING CAP");
  await expect(page.getByTestId("required-return-on-nta-calculator")).not.toContainText("DISCOUNT RATE");

  await loadSampleWorkbook(page);
  await openWorkflowTab(page, "WACC");
  await expect(page.getByTestId("wacc-calculator")).toContainText("Kalkulator WACC");
  await expect(page.getByTestId("wacc-calculator")).toContainText("Risk-free rate");
  await expect(
    page.getByLabel("Nilai pasar utang").locator("xpath=ancestor::div[contains(@class, 'assumption-input-field')][1]"),
  ).toContainText(
    "Auto Neraca: liabilitas lancar + liabilitas tidak lancar.",
  );
  await expect(
    page.getByLabel("Nilai pasar ekuitas").locator("xpath=ancestor::div[contains(@class, 'assumption-input-field')][1]"),
  ).toContainText(
    "Auto Neraca: book equity aktif.",
  );
  const waccBasisControl = page.getByTestId("wacc-basis-control");
  await expect(waccBasisControl).toContainText("Governed WACC");
  await expect(waccBasisControl).toContainText("Raw calculated WACC");
  await expect(waccBasisControl).toContainText("Manual WACC");
  await waccBasisControl.locator('input[value="raw"]').check();
  await expect(waccBasisControl).toContainText("Raw calculated WACC mengalir ke EEM/DCF");
  await expect.poll(() => page.evaluate(() => JSON.parse(window.localStorage.getItem("penilaian-valuasi-bisnis.workbench.v1") ?? "{}").activeWaccBasis)).toBe("raw");
  await waccBasisControl.getByLabel("Manual WACC reviewer").fill("0,09");
  await expect(waccBasisControl).toContainText("Manual WACC mengalir ke EEM/DCF");
  await expect.poll(() => page.evaluate(() => JSON.parse(window.localStorage.getItem("penilaian-valuasi-bisnis.workbench.v1") ?? "{}").activeWaccBasis)).toBe("manual");
  await expect(page.getByTestId("discount-rate-analysis")).toContainText("Rata-rata mentah");
  await expect(page.getByTestId("discount-rate-analysis")).toContainText("8,804%");
  await expect(page.getByTestId("discount-rate-analysis")).toContainText("8,8%");
  await openWorkflowTab(page, "Asumsi EEM/DCF");
  await expect(page.getByTestId("terminal-growth-calculator")).toContainText("Tata kelola terminal growth");
  await expect(page.getByTestId("required-return-on-nta-calculator")).toContainText("Kapasitas piutang");
  await expect(page.getByTestId("required-return-suggestion-card")).toContainText("Basis required return on NTA");
  await expect(page.getByTestId("required-return-suggestion-card")).toContainText("100%");
  await expect(page.getByTestId("required-return-suggestion-card")).toContainText("70%");
  await expect(fixedAssetCapacityInput).toHaveValue("0,7");
  await expect(page.getByLabel("After-tax debt cost")).toHaveValue("0,06864");
  await expect(page.getByTestId("required-return-on-nta-calculator")).not.toContainText("BORROWING CAP");
  await expect(page.getByTestId("required-return-on-nta-calculator")).not.toContainText("DISCOUNT RATE");

  const receivablesCapacityAppliedButton = page.getByRole("button", {
    name: "Nilai sistem sudah dipakai untuk Kapasitas piutang",
  });
  const receivablesCapacitySuggestionButton = page.getByRole("button", {
    name: "Gunakan nilai sistem untuk Kapasitas piutang",
  });
  await expect(receivablesCapacityAppliedButton).toBeDisabled();
  await receivablesCapacityInput.fill("");
  await expect(receivablesCapacitySuggestionButton).toBeEnabled();
  await receivablesCapacitySuggestionButton.click();
  await expect(receivablesCapacityInput).toHaveValue("100");
  await expect(receivablesCapacityAppliedButton).toBeDisabled();

  const revenueGrowthAppliedButton = page.getByRole("button", {
    name: "Nilai sistem sudah dipakai untuk Override pertumbuhan pendapatan (opsional)",
  });
  const revenueGrowthSuggestionButton = page.getByRole("button", {
    name: "Gunakan nilai sistem untuk Override pertumbuhan pendapatan (opsional)",
  });
  const revenueGrowthOverrideInput = page.locator("#assumption-override-pertumbuhan-pendapatan-opsional");
  const revenueGrowthOverrideField = revenueGrowthOverrideInput.locator("xpath=..");
  await expect(revenueGrowthAppliedButton).toBeDisabled();
  await revenueGrowthOverrideInput.fill("");
  await expect(revenueGrowthSuggestionButton).toBeEnabled();
  await revenueGrowthSuggestionButton.click();
  await expect(revenueGrowthOverrideInput).toHaveValue(/\d/);
  await expect(revenueGrowthAppliedButton).toBeDisabled();
  await expect(revenueGrowthOverrideField.locator(".auto-source-note")).toContainText("nilai eksplisit di field");

  await receivablesCapacityInput.fill("");
  await inventoryCapacityInput.fill("");
  await fixedAssetCapacityInput.fill("");
  await additionalCapacityInput.fill("");
  await expect(page.getByTestId("required-return-on-nta-calculator")).toContainText("Fallback struktur kapital WACC");
  await expect(page.getByTestId("required-return-on-nta-calculator")).toContainText("Bobot utang WACC x Kd");
  await expect(page.locator("body")).not.toContainText("STAT_ASSUMPTIONS");

  await openWorkflowTab(page, "Penilaian EEM");
  await expect(page.getByRole("heading", { name: "Excess Earnings Method (EEM)" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Kesiapan EEM" })).toHaveCount(0);
  await expect(page.getByLabel("Driver aktif penilaian")).toContainText("Manual WACC reviewer");
  await expect(page.getByLabel("Driver aktif penilaian")).toContainText("Proxy kapasitas aset berwujud yang di-govern");
  await expect(page.getByTestId("eem-sensitivity-grid")).toContainText("EEM - skenario dasar");
  await expect(page.getByTestId("eem-sensitivity-grid")).toContainText("EEM - utang pajak debt-like");
  await expect(page.getByTestId("eem-sensitivity-grid")).toContainText("sebelum utang pajak diperlakukan sebagai kewajiban debt-like");
  await expect(page.getByTestId("eem-sensitivity-grid")).toContainText("selisih terhadap dasar sama dengan saldo utang pajak");
  await expect(page.getByTestId("eem-base-equity-value")).toBeVisible();
  await expect(page.getByTestId("eem-tax-payable-debt-like-equity-value")).toBeVisible();
  await expect(page.getByTestId("eem-tax-payable-difference-driver")).toContainText("Driver selisih");
  await expect(page.getByTestId("eem-trace-row")).toHaveCount(20);
  await expect(page.getByTestId("eem-trace-table")).toContainText("Nett Tangible Asset Value");
  await expect(page.getByTestId("eem-trace-table")).toContainText("Acuan workbook");
  await expect(page.getByTestId("eem-trace-table")).toContainText("Akun aktif");
  await expect(page.getByTestId("eem-trace-table")).not.toContainText("STAT_EEM");
  await expect(page.getByTestId("eem-trace-table")).not.toContainText("EEM!D");
  await expect(page.locator("#eem code")).toHaveCount(0);
  await expect(page.getByTestId("eem-sensitivity-grid").locator("code")).toHaveCount(0);
  await openWorkflowTab(page, "Penilaian DCF");
  await expect(page.getByRole("heading", { name: "Kesiapan DCF" })).toHaveCount(0);
  await expect(page.getByLabel("Driver aktif penilaian")).toContainText("Manual WACC reviewer");
  await expect(page.getByLabel("Driver aktif penilaian")).toContainText("Proxy kapasitas aset berwujud yang di-govern");
});

test("terminal growth renders with two decimals across EEM/DCF and projection tabs", async ({ page }) => {
  const fixtureState = JSON.parse(readFileSync("tests/fixtures/report-workbench-state.json", "utf8")) as unknown;
  await page.addInitScript(({ key, state }) => {
    window.localStorage.clear();
    window.localStorage.setItem(key, JSON.stringify(state));
  }, {
    key: "penilaian-valuasi-bisnis.workbench.v1",
    state: fixtureState,
  });
  await page.reload();
  await expect(page.getByTestId("valuation-workbench")).toBeVisible();

  await openWorkflowTab(page, "Asumsi EEM/DCF");
  await expect(page.getByTestId("terminal-growth-calculator")).toContainText("0,50%");
  await expect(page.getByTestId("assumption-driver-matrix")).toContainText("0,50%");
  await page.locator("#assumption-hari-piutang-ar-days-override-opsional").fill("4");
  await openWorkflowTab(page, "Penilaian EEM");
  await expect(page.getByLabel("Driver aktif penilaian")).toContainText("0,50%");
  await openWorkflowTab(page, "Penilaian DCF");
  await expect(page.getByLabel("Driver aktif penilaian")).toContainText("0,50%");
  await openWorkflowTab(page, "Proyeksi Laba Rugi");
  await expect(page.getByLabel("Driver aktif Proyeksi Laba Rugi")).toContainText("0,50%");
  await openWorkflowTab(page, "Proyeksi Neraca");
  await expect(page.getByLabel("Driver aktif Proyeksi Neraca")).toContainText("0,50%");
  await openWorkflowTab(page, "Proyeksi Cash Flow Statement");
  await expect(page.getByLabel("Driver aktif Proyeksi Cash Flow Statement")).toContainText("0,50%");
});

test("legacy positive income-statement expense drafts migrate once and remain user-editable", async ({ page }) => {
  await page.addInitScript(({ key, markerKey, state }) => {
    if (window.sessionStorage.getItem(markerKey)) {
      return;
    }
    window.localStorage.clear();
    window.localStorage.setItem(key, JSON.stringify(state));
    window.sessionStorage.setItem(markerKey, "1");
  }, {
    key: "penilaian-valuasi-bisnis.workbench.v1",
    markerKey: "penilaian-valuasi-bisnis.legacy-fixture-applied",
    state: {
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
    },
  });
  await page.reload();
  await openWorkflowTab(page, "Laba Rugi");

  const amountInput = page.getByTestId("income-account-table-row").last().getByLabel("Tahun Y amount");
  await expect(amountInput).toHaveValue("-100");
  await amountInput.press("Home");
  await amountInput.press("Delete");
  await expect(amountInput).toHaveValue("100");
  await expect.poll(() => page.evaluate(() => JSON.parse(window.localStorage.getItem("penilaian-valuasi-bisnis.workbench.v1") ?? "{}").version)).toBe(18);

  await page.reload();
  await openWorkflowTab(page, "Laba Rugi");
  await expect(page.getByTestId("income-account-table-row").last().getByLabel("Tahun Y amount")).toHaveValue("100");
});

test("localStorage persistence, fixed header, and root overflow checks remain stable", async ({ page }) => {
  await openWorkflowTab(page, "Neraca");
  await page.getByTitle("Sembunyikan sidebar").click();
  await expect.poll(() => page.evaluate(() => window.localStorage.getItem("penilaian-valuasi-bisnis.sidebar.v1"))).toBe("collapsed");
  await page.getByRole("button", { name: "Tambah akun neraca" }).first().click();
  await page.getByTestId("balance-account-table-row").last().getByLabel("Nama akun").fill("Piutang usaha");
  await page.reload();

  await expect(page.getByTestId("sidebar-rail")).toBeVisible();
  await page.getByRole("button", { name: "Tampilkan sidebar" }).click();
  await openWorkflowTab(page, "Neraca");
  await expect(page.getByTestId("balance-account-table-row").last().getByLabel("Nama akun")).toHaveValue("Piutang usaha");

  for (let index = 0; index < 12; index += 1) {
    await page.getByRole("button", { name: "Tambah akun neraca" }).first().click();
  }
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  const headerBox = await page.getByTestId("workspace-header").boundingBox();
  expect(headerBox?.y ?? 999).toBeLessThanOrEqual(2);
  const panelBox = await page.locator(".workspace > .panel").first().boundingBox();
  expect(Math.abs((headerBox?.x ?? 0) - (panelBox?.x ?? 0))).toBeLessThanOrEqual(1);
  const sidebarBox = await page.locator(".sidebar").boundingBox();
  expect(sidebarBox?.y ?? 999).toBeLessThanOrEqual(1);
  await expect(page.locator(".brand-block")).toBeVisible();
  await expect(workflowNav(page).getByRole("button", { name: "Audit", exact: true })).toBeVisible();

  expect(await hasNoRootHorizontalOverflow(page)).toBe(true);
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.getByTestId("workspace-header")).toBeVisible();
  await expect(page.locator(".mobile-workflow-tabs")).toBeVisible();
  await expect(page.locator(".mobile-workflow-tabs").getByRole("tab", { name: "Kategorisasi Akun", exact: true })).toHaveCount(0);
  expect(await hasNoRootHorizontalOverflow(page)).toBe(true);
});

test("WACC comparable provenance remains readable on mobile tabs", async ({ page }) => {
  await page.getByLabel("KLU sesuai Appportal").fill("45101");
  await expect(page.getByTestId("company-sector-derived")).toHaveValue("Consumer Cyclicals");
  await page.getByLabel("Tanggal penilaian").fill("2023-12-31");
  await page.setViewportSize({ width: 390, height: 844 });

  const mobileTabs = page.locator(".mobile-workflow-tabs");
  await expect(mobileTabs).toBeVisible();
  await mobileTabs.getByRole("tab", { name: "WACC", exact: true }).click();
  await expect(page.getByTestId("wacc-comparable-source")).toContainText("Snapshot per 31 Desember 2023");
  await expect(page.getByTestId("wacc-comparable-source-warning")).toContainText("Snapshot sesuai tanggal penilaian");
  await expect(page.getByTestId("wacc-comparable-source-warning")).toContainText("31 Des 2023");
  expect(await hasNoRootHorizontalOverflow(page)).toBe(true);

  const provenanceFitsViewport = await page.evaluate(() => {
    const source = document.querySelector('[data-testid="wacc-comparable-source"]');
    const warning = document.querySelector('[data-testid="wacc-comparable-source-warning"]');

    if (!(source instanceof HTMLElement) || !(warning instanceof HTMLElement)) {
      return false;
    }

    return source.scrollWidth <= source.clientWidth && warning.scrollWidth <= warning.clientWidth;
  });

  expect(provenanceFitsViewport).toBe(true);
});

async function getTotalAssetsText(page: Page) {
  const totalAssetsRow = page.getByTestId("balance-sheet-position-table").locator("tr.total-row").filter({ hasText: "Total Aset" }).first();
  return totalAssetsRow.locator(".numeric-cell").last().innerText();
}

function workflowNav(page: Page) {
  return page.getByRole("navigation", { name: "Bagian model" });
}

async function openWorkflowTab(page: Page, name: string) {
  await workflowNav(page).getByRole("button", { name, exact: true }).click();
}

async function hasNoRootHorizontalOverflow(page: Page) {
  return page.evaluate(() => {
    const documentElement = document.documentElement;
    return documentElement.scrollWidth <= documentElement.clientWidth && document.body.scrollWidth <= document.body.clientWidth;
  });
}

async function tableFitsWrapper(page: Page, testId: string) {
  return page.getByTestId(testId).evaluate((table) => {
    const wrapper = table.closest(".table-wrap");
    if (!(wrapper instanceof HTMLElement)) {
      return false;
    }

    return table.scrollWidth <= wrapper.clientWidth + 1;
  });
}
