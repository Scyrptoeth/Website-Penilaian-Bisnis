import { expect, test, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import * as XLSX from "xlsx";
import { getCellFontRgbFromXlsx, getWorkbookCalcPrAttributesFromXlsx, hasXlsxEntry } from "../helpers/xlsx-style";

test.beforeEach(async ({ page }) => {
  await page.goto("/");
  await page.evaluate(() => window.localStorage.clear());
  await page.reload();
  await expect(page.getByTestId("valuation-workbench")).toBeVisible();
});

test("period workflow, scoped categories, and display-only balance sheet classification", async ({ page }) => {
  await expect(page.locator(".mobile-workflow-tabs")).toBeHidden();
  await expect(workflowNav(page).getByRole("button", { name: "Data Awal" })).toHaveAttribute("aria-current", "page");
  await expect(workflowNav(page).getByRole("button", { name: "Pemetaan & Label" })).toHaveCount(0);
  await expect(page.getByTestId("case-profile-panel")).toBeVisible();
  await expect(page.getByRole("button", { name: /Buat checkpoint/i })).toHaveCount(0);
  await expect(page.getByRole("button", { name: /Kembali checkpoint/i })).toHaveCount(0);
  await page.getByLabel("KLU sesuai Appportal").fill("07102");
  await expect(page.getByTestId("company-sector-derived")).toHaveText("Basic Materials");
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

  await openWorkflowTab(page, "Neraca & Aset Tetap");
  await page.getByRole("button", { name: "Tambah akun neraca" }).first().click();
  const balanceRow = page.getByTestId("balance-account-table-row").last();
  await expect(balanceRow.getByLabel("Klasifikasi neraca").locator("option", { hasText: "Ekuitas" })).toHaveCount(1);
  await balanceRow.getByLabel("Nama akun").fill("Kas");
  await balanceRow.getByLabel("Tahun Y amount").fill("1000");
  await expect(balanceRow).toContainText("Saran: Kas di tangan");
  await expect(balanceRow.getByLabel("Kategori utama").locator("option", { hasText: "Pendapatan usaha" })).toHaveCount(0);

  const totalBefore = await getTotalAssetsText(page);
  await balanceRow.getByLabel("Klasifikasi neraca").selectOption("non_current_asset");
  await expect(page.getByTestId("balance-sheet-position-table")).toContainText("Aset tidak lancar");
  await expect(page.getByTestId("balance-sheet-position-table")).toContainText("Total Liabilitas + Ekuitas");
  await expect(page.getByTestId("balance-sheet-position-table")).toContainText("Cek Kesesuaian");
  await expect.poll(() => getTotalAssetsText(page)).toBe(totalBefore);

  await openWorkflowTab(page, "Laba Rugi");
  await page.getByRole("button", { name: "Tambah akun laba rugi" }).first().click();
  const incomeRow = page.getByTestId("income-account-table-row").last();
  await expect(incomeRow.getByLabel("Kategori utama").locator("option", { hasText: "Utang usaha" })).toHaveCount(0);
  await incomeRow.getByLabel("Nama akun").fill("Pajak penghasilan badan");
  await incomeRow.getByLabel("Tahun Y amount").fill("436128347");
  await expect(incomeRow).toContainText("Saran: Pajak penghasilan badan");
  await expect(incomeRow.getByLabel("Tahun Y amount")).toHaveValue("-436.128.347");
  await expect(page.getByTestId("income-statement-report-table")).toContainText("Pajak penghasilan badan");
  await expect(page.getByTestId("income-statement-report-table")).toContainText("-436.128.347");

  await page.getByRole("button", { name: "Tambah akun laba rugi" }).last().click();
  await expect(page.getByTestId("income-account-table-row")).toHaveCount(2);
});

test("fixed asset schedule remains empty until user adds a class and then rolls forward values", async ({ page }) => {
  await page.getByRole("button", { name: /Tambah Y-1/ }).click();
  await openWorkflowTab(page, "Neraca & Aset Tetap");
  await expect(page.getByRole("button", { name: "Jadwal Aset Tetap" })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "A. Biaya Perolehan · B. Penyusutan · Nilai Buku Neto" })).toHaveCount(0);
  await expect(page.getByTestId("fixed-asset-empty")).toBeVisible();

  await page.getByRole("button", { name: "Tambah kelas aset" }).click();
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
  await expect(page.getByTestId("balance-sheet-position-table")).toContainText("Nilai buku bersih aset tetap");
  expect(await hasNoRootHorizontalOverflow(page)).toBe(true);
});

test("AAM valuation remains available without WACC or EEM/DCF driver inputs", async ({ page }) => {
  await page.getByLabel("Tanggal penilaian").fill("2021-12-31");
  await openWorkflowTab(page, "Neraca & Aset Tetap");
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
  await page.getByLabel("Penyesuaian Kas di tangan").fill("100000");
  await expect(page.getByText("1 penyesuaian masih perlu catatan.")).toBeVisible();
  await page.getByLabel("Catatan Kas di tangan").fill("FMV cash count after cut-off");
  await expect(page.getByText("Semua penyesuaian non-zero sudah memiliki catatan.")).toBeVisible();
  await expect(page.getByTestId("aam-adjustment-aset")).toContainText("1.100.000");
  await expect(page.getByText(/850\.000/).first()).toBeVisible();
  await expect(page.getByText("Tidak diperlukan")).toBeVisible();

  await openWorkflowTab(page, "Penilaian EEM/DCF");
  await expect(page.getByTestId("readiness-valuationEemDcf")).toContainText("Masih diperlukan");

  await page.reload();
  await expect(page.getByTestId("valuation-workbench")).toBeVisible();
  await openWorkflowTab(page, "Penilaian AAM");
  await expect(page.getByLabel("Penyesuaian Kas di tangan")).toHaveValue("100.000");
  await expect(page.getByLabel("Catatan Kas di tangan")).toHaveValue("FMV cash count after cut-off");
});

test("added analysis sections use readiness gates before sample data and render formula-derived bridges after loading sample", async ({ page }) => {
  await openWorkflowTab(page, "NOPLAT & FCF");
  await expect(page.getByTestId("readiness-noplatFcf")).toBeVisible();
  await expect(page.getByTestId("readiness-noplatFcf")).toContainText("Masih diperlukan");
  await page.getByTestId("readiness-noplatFcf").getByRole("link", { name: /Isi Laba Rugi/ }).first().click();
  await expect(workflowNav(page).getByRole("button", { name: "Laba Rugi" })).toHaveAttribute("aria-current", "page");

  await page.getByRole("button", { name: "Muat contoh workbook" }).click();
  await openWorkflowTab(page, "Utang & Arus Kas");
  await expect(page.getByText("Bridge arus kas terkoreksi")).toBeVisible();
  await expect(page.getByText("Referensi audit sistem")).toBeVisible();
  await expect(page.locator("body")).not.toContainText("Workbook audit reference");
  await expect(page.getByText(/3\.150\.000\.000/).first()).toBeVisible();

  await openWorkflowTab(page, "NOPLAT & FCF");
  await expect(page.getByText("Free Cash Flow to Firm (FCFF)")).toBeVisible();
  await expect(page.getByText("Basis statutory komersial")).toBeVisible();
  await expect(page.getByText("Referensi audit sistem")).toBeVisible();

  await openWorkflowTab(page, "Rasio & Efisiensi Modal");
  await expect(page.getByText("Bridge efisiensi modal")).toBeVisible();
  await expect(page.getByText("Basis NOPLAT terkoreksi")).toBeVisible();
  await expect(page.getByText("Referensi audit sistem")).toBeVisible();
});

test("DLOM and tax simulation render workbook-derived scenario layer after loading sample", async ({ page }) => {
  await openWorkflowTab(page, "DLOM");
  await expect(page.getByTestId("dlom-basis-grid")).toContainText("Isi Data Awal");
  await expect(page.getByTestId("dlom-basis-grid").locator("select")).toHaveCount(0);
  await expect(page.getByTestId("dlom-summary")).toContainText("Belum lengkap");
  await expect(page.getByTestId("dlom-factor-table")).toContainText("Belum lengkap");

  await page.getByRole("button", { name: "Muat contoh workbook" }).click();

  await openWorkflowTab(page, "DLOM");
  await expect(page.getByTestId("dlom-basis-grid")).toContainText("DLOM Perusahaan tertutup");
  await expect(page.getByTestId("dlom-basis-grid")).toContainText("Mayoritas");
  await expect(page.getByTestId("dlom-basis-grid")).toContainText("20% - 40%");
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
  await expect(page.getByTestId("dlom-summary")).toContainText("25%");
  await expect(page.getByTestId("dlom-summary")).toContainText("Rendah");
  await expect(page.getByTestId("dlom-factor-table")).toContainText("Keterangan Tambahan");
  await expect(page.getByTestId("dlom-factor-table")).not.toContainText("Alasan override");
  await expect(page.getByTestId("dlom-factor-table")).toContainText("Entry Barrier Perijinan Usaha");
  await expect(page.getByTestId("dlom-factor-table")).toContainText("Terisi");
  await expect(page.getByLabel("Jawaban DLOM Profitabilitas (EBITDA)")).toHaveValue("Diatas");

  await page.setViewportSize({ width: 2430, height: 1350 });
  await openWorkflowTab(page, "DLOC/PFC");
  await expect(page.getByTestId("dloc-pfc-summary")).toContainText("34%");
  await expect(page.getByTestId("dloc-pfc-summary")).toContainText("Rendah");
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

  await openWorkflowTab(page, "Simulasi Potensi Pajak");
  await expect(page.getByTestId("tax-simulation-summary")).toContainText("AAM");
  await expect(page.getByTestId("tax-simulation-summary")).toContainText("DLOM 25%");
  await expect(page.getByTestId("tax-simulation-summary")).toContainText("DLOC 34%");
  await expect(page.getByTestId("tax-simulation-table")).toContainText("AAM");
  await expect(page.getByTestId("tax-simulation-table")).toContainText("EEM");
  await expect(page.getByTestId("tax-simulation-table")).toContainText("DCF");
  await expect(page.getByTestId("tax-simulation-table")).toContainText("Primary");
  await expect(page.getByTestId("tax-simulation-table")).not.toContainText("Rate otomatis dari tab DLOC/PFC");
  await expect(page.getByTestId("tax-simulation-table")).not.toContainText("Dibulatkan:");
  await expect(page.getByText("AAM primary method")).toBeVisible();
  await expect(page.getByLabel("Catatan skenario manual")).not.toBeVisible();
  await expect(page.getByText("Jejak audit basis perhitungan")).toBeVisible();
  await expect(page.getByText("Hubungan ke base valuation")).toHaveCount(0);
  await expect(page.getByText("Detail sumber tarif dan dasar hukum")).toBeVisible();
  await expect(page.getByTestId("tax-bracket-table")).toContainText("Total potensi pajak");
  await expect(page.getByText("Effective rate")).not.toBeVisible();

  await page.getByLabel("Basis final").selectOption("manualScenario");
  await page.getByLabel("Skenario DLOM").fill("0,1");
  await page.getByLabel("Skenario DLOC/PFC").fill("0,2");
  await page.getByText("Catatan audit skenario").click();
  await page.getByLabel("Catatan skenario manual").fill("Reviewer what-if");
  await expect(page.getByTestId("tax-simulation-summary")).toContainText("Final memakai Skenario manual");
  await expect(page.getByTestId("tax-simulation-table")).toContainText("Skenario manual");
  await expect(page.getByText("DLOM skenario")).toBeVisible();
  await page.getByText("Detail sumber tarif dan dasar hukum").click();
  await expect(page.getByText("Effective rate")).toBeVisible();
});

test("legacy workbook-like DLOM drafts migrate to workbook UPDATE basis without showing formula UI", async ({ page }) => {
  await page.addInitScript(({ key, state }) => {
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
  await expect(page.getByTestId("dlom-basis-grid")).toContainText("Mayoritas");
  await expect(page.getByTestId("dlom-basis-grid")).toContainText("20% - 40%");
  await expect(page.getByTestId("dlom-basis-grid")).not.toContainText("Workbook UPDATE DLOM!C31");
  await expect(page.getByTestId("dlom-basis-grid")).not.toContainText("Formula");
  await expect(page.getByTestId("dlom-summary")).toContainText("25%");
  await expect.poll(() => page.evaluate(() => JSON.parse(window.localStorage.getItem("penilaian-valuasi-bisnis.workbench.v1") ?? "{}").version)).toBe(11);
});

test("exports the active workbench state through the primary template-clone XLSX workflow", async ({ page }) => {
  await page.getByRole("button", { name: "Muat contoh workbook" }).click();
  await expect(page.getByRole("button", { name: "Export XLSX" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Export PDF" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Export XLSX V1" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Export XLSX V2" })).toHaveCount(0);

  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Export XLSX" }).click();
  const download = await downloadPromise;
  const downloadPath = await download.path();

  assertDownloadPath(downloadPath);
  expect(download.suggestedFilename()).toMatch(/valuation-export-v2-template-clone-\d{4}-\d{2}-\d{2}\.xlsx$/);

  const workbook = XLSX.readFile(downloadPath, { cellFormula: true });
  expect(workbook.SheetNames).toHaveLength(69);
  expect(workbook.SheetNames[0]).toBe("CATATAN FINAL");
  expect(workbook.SheetNames).toContain("BALANCE SHEET");
  expect(workbook.SheetNames).toContain("INCOME STATEMENT");
  expect(workbook.SheetNames).toContain("AAM");
  expect(workbook.SheetNames).toContain("DCF");
  expect(workbook.SheetNames).toContain("SIMULASI POTENSI PAJAK");
  expect(workbook.SheetNames.at(-1)).toBe("PVB_EXPORT_V2_AUDIT");
  expect(workbook.Sheets.HOME.B4.v).toBe("Makmur Jaya Sejati Raya");
  expect(workbook.Sheets["BALANCE SHEET"].E8.v).toBe(717848795);
  expect(workbook.Sheets["INCOME STATEMENT"].E6.v).toBe(16663916100);
  expect(workbook.Sheets.STAT_ASSUMPTIONS.B6.f).toBe("WACC!E22");
  expect(workbook.Sheets.STAT_ASSUMPTIONS.B9.v).toBeCloseTo(0.22757714145120844);
  expect(workbook.Sheets.AAM.E53.f).toBe("E51-E52");
  expect(workbook.Sheets.EEM.D34.f).toBe("D31+D32+D33");
  expect(workbook.Sheets.DCF.C33.f).toBe("SUM(C29:C32)");
  expect(workbook.Sheets.DLOM.F34.f).toBe("LEFT(C32,3)+(F33/F31*F32)");
  expect(workbook.Sheets["DLOC(PFC)"].B20.f).toBe('IF(LOWER(HOME!B7)="tertutup","DLOC Perusahaan tertutup ","DLOC Perusahaan terbuka ")');
  expect(workbook.Sheets.PVB_EXPORT_V2_AUDIT.A1.v).toBe("Export XLSX V2 Audit");
  expect(workbook.Sheets.PVB_EXPORT_V2_AUDIT.F9.v).toBe("Source Origin");
  expect(workbook.Sheets.PVB_EXPORT_V2_AUDIT.G9.v).toBe("Status");
  expect(workbook.Sheets.PVB_EXPORT_V2_AUDIT.H9.v).toBe("Font Mark");
  expect(workbook.Sheets.PVB_EXPORT_V2_AUDIT.I9.v).toBe("Previous Formula");

  const downloadedXlsx = readFileSync(downloadPath);
  const calcPr = getWorkbookCalcPrAttributesFromXlsx(downloadedXlsx);
  expect(getCellFontRgbFromXlsx(downloadedXlsx, "KEY DRIVERS", "E18")).toBe("FF0000FF");
  expect(getCellFontRgbFromXlsx(downloadedXlsx, "DLOM", "F34")).toBe("FF0000FF");
  expect(getCellFontRgbFromXlsx(downloadedXlsx, "SIMULASI POTENSI PAJAK", "C3")).toBe("FF0000FF");
  expect(getCellFontRgbFromXlsx(downloadedXlsx, "HOME", "B4")).not.toBe("FF0000FF");
  expect(calcPr.fullCalcOnLoad).toBe("1");
  expect(calcPr.forceFullCalc).toBe("1");
  expect(hasXlsxEntry(downloadedXlsx, "xl/calcChain.xml")).toBe(false);
});

test("exports the active workbench state to a print-ready PDF report view", async ({ page }) => {
  const fixtureState = JSON.parse(readFileSync("tests/fixtures/export-xlsx-v2-workbench-state.json", "utf8")) as unknown;
  await page.evaluate(
    ({ key, state }) => {
      window.localStorage.setItem(key, JSON.stringify(state));
    },
    { key: "penilaian-valuasi-bisnis.workbench.v1", state: fixtureState },
  );
  await page.reload();
  await expect(page.getByTestId("valuation-workbench")).toBeVisible();

  const popupPromise = page.waitForEvent("popup");
  await page.getByRole("button", { name: "Export PDF" }).click();
  const reportPage = await popupPromise;
  await reportPage.waitForLoadState("domcontentloaded");

  await expect(reportPage).toHaveURL(/\/export\/pdf$/);
  await expect(reportPage.getByTestId("pdf-report")).toBeVisible();
  await expect(reportPage.getByRole("heading", { name: "Laporan Ringkas Penilaian Valuasi Bisnis" })).toBeVisible();
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
  await expect(reportPage.getByRole("columnheader", { name: "Sumber" })).toHaveCount(0);
  await expect(reportPage.getByRole("heading", { name: "Laporan Laba Rugi" })).toBeVisible();
  await expect(reportPage.getByRole("heading", { name: "Laporan Daftar Aset" })).toBeVisible();
  await expect(reportPage.getByRole("heading", { name: "Ringkasan", exact: true })).toBeVisible();
  await expect(reportPage.getByText("Metode AAM")).toBeVisible();
  await expect(reportPage.getByText("Metode EEM")).toBeVisible();
  await expect(reportPage.getByText("Metode DCF")).toBeVisible();
  await expect(reportPage.getByRole("heading", { name: "DLOM dan DLOC/PFC" })).toBeVisible();
  await expect(reportPage.getByText("DLOM Basis")).toBeVisible();
  await expect(reportPage.getByText("DLOC/PFC Rate")).toBeVisible();
  await expect(reportPage.getByRole("heading", { name: "Simulasi Potensi Pajak" })).toBeVisible();
  await expect(reportPage.getByRole("heading", { name: "Audit dan Catatan Review" })).toHaveCount(0);
  await expect(reportPage.getByRole("button", { name: "Cetak / Simpan PDF" })).toBeVisible();

  await reportPage.close();
});

test("WACC and EEM/DCF assumptions expose source-backed suggestions, calculators, and active valuation sources", async ({ page }) => {
  await page.getByLabel("KLU sesuai Appportal").fill("45101");
  await expect(page.getByTestId("company-sector-derived")).toHaveText("Consumer Cyclicals");
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
  await expect(page.getByTestId("wacc-suggestion-card")).not.toContainText("Input pasar tahunan");
  await page.getByRole("button", { name: /Isi input pasar 2023/ }).click();
  await expect(page.getByTestId("wacc-calculator")).toContainText("Default spread berbasis rating");
  await expect(page.getByTestId("wacc-calculator")).toContainText("isi dengan beta manual yang memiliki sumber dan justifikasi penilai");
  await expect(page.getByTestId("wacc-calculator")).not.toContainText("DCF discount rate dan EEM capitalization rate");
  await expect(page.getByTestId("wacc-calculator")).not.toContainText("DISCOUNT RATE");
  await expect(page.getByTestId("wacc-comparable-table")).toContainText("Perusahaan Pembanding");
  await expect(page.getByTestId("wacc-capital-structure-table")).toContainText("Struktur Kapital");
  await page.getByTestId("wacc-comparable-table").getByRole("button", { name: "Terapkan Saran" }).click();
  await expect(page.getByLabel("Fallback bobot utang")).toHaveValue(/0,\d+/);
  await expect(page.getByLabel("Fallback bobot ekuitas")).toHaveValue(/0,\d+/);
  await page.getByLabel("Fallback bobot utang").fill("0,25");
  await page.getByLabel("Fallback bobot ekuitas").fill("0,75");
  await expect(page.getByTestId("wacc-comparable-table")).toContainText("25% utang / 75% ekuitas");

  await openWorkflowTab(page, "Asumsi EEM/DCF");
  await expect(page.getByTestId("required-return-suggestion-card")).toContainText("Basis required return on NTA");
  await expect(page.getByTestId("required-return-suggestion-card")).toContainText("Perlu input");
  await expect(page.getByLabel("Kapasitas aset tetap")).toHaveValue("");
  await expect(page.getByLabel("After-tax debt cost")).toHaveValue("0,0702");
  await expect(page.getByTestId("required-return-on-nta-calculator")).not.toContainText("BORROWING CAP");
  await expect(page.getByTestId("required-return-on-nta-calculator")).not.toContainText("DISCOUNT RATE");

  await page.getByRole("button", { name: "Muat contoh workbook" }).click();
  await openWorkflowTab(page, "WACC");
  await expect(page.getByTestId("wacc-calculator")).toContainText("Kalkulator WACC");
  await expect(page.getByTestId("wacc-calculator")).toContainText("Risk-free rate");
  await openWorkflowTab(page, "Asumsi EEM/DCF");
  await expect(page.getByTestId("terminal-growth-calculator")).toContainText("Tata kelola terminal growth");
  await expect(page.getByTestId("required-return-on-nta-calculator")).toContainText("Kapasitas piutang");
  await expect(page.getByTestId("required-return-suggestion-card")).toContainText("Basis required return on NTA");
  await expect(page.getByTestId("required-return-suggestion-card")).toContainText("Perlu input");
  await expect(page.getByLabel("Kapasitas aset tetap")).toHaveValue("0,7");
  await expect(page.getByLabel("After-tax debt cost")).toHaveValue("0,06864");
  await expect(page.getByTestId("required-return-on-nta-calculator")).not.toContainText("BORROWING CAP");
  await expect(page.getByTestId("required-return-on-nta-calculator")).not.toContainText("DISCOUNT RATE");

  await page.getByLabel("Kapasitas piutang").fill("");
  await page.getByLabel("Kapasitas persediaan").fill("");
  await page.getByLabel("Kapasitas aset tetap").fill("");
  await page.getByLabel("Jumlah kapasitas tambahan").fill("");
  await expect(page.getByTestId("required-return-on-nta-calculator")).toContainText("Fallback struktur kapital WACC");
  await expect(page.getByTestId("required-return-on-nta-calculator")).toContainText("Bobot utang WACC x Kd");
  await expect(page.locator("body")).not.toContainText("STAT_ASSUMPTIONS");

  await openWorkflowTab(page, "Penilaian EEM/DCF");
  await expect(page.getByLabel("Driver aktif penilaian")).toContainText("Dihitung dari input WACC");
  await expect(page.getByLabel("Driver aktif penilaian")).toContainText("Proxy kapasitas aset berwujud yang di-govern");
});

test("legacy positive income-statement expense drafts migrate once and remain user-editable", async ({ page }) => {
  await page.addInitScript(({ key, markerKey, state }) => {
    if (window.sessionStorage.getItem(markerKey)) {
      return;
    }
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
  await expect.poll(() => page.evaluate(() => JSON.parse(window.localStorage.getItem("penilaian-valuasi-bisnis.workbench.v1") ?? "{}").version)).toBe(11);

  await page.reload();
  await openWorkflowTab(page, "Laba Rugi");
  await expect(page.getByTestId("income-account-table-row").last().getByLabel("Tahun Y amount")).toHaveValue("100");
});

test("localStorage persistence, fixed header, and root overflow checks remain stable", async ({ page }) => {
  await openWorkflowTab(page, "Neraca & Aset Tetap");
  await page.getByTitle("Sembunyikan sidebar").click();
  await expect.poll(() => page.evaluate(() => window.localStorage.getItem("penilaian-valuasi-bisnis.sidebar.v1"))).toBe("collapsed");
  await page.getByRole("button", { name: "Tambah akun neraca" }).first().click();
  await page.getByTestId("balance-account-table-row").last().getByLabel("Nama akun").fill("Piutang usaha");
  await page.reload();

  await expect(page.getByTestId("sidebar-rail")).toBeVisible();
  await page.getByRole("button", { name: "Tampilkan sidebar" }).click();
  await openWorkflowTab(page, "Neraca & Aset Tetap");
  await expect(page.getByTestId("balance-account-table-row").last().getByLabel("Nama akun")).toHaveValue("Piutang usaha");

  for (let index = 0; index < 12; index += 1) {
    await page.getByRole("button", { name: "Tambah akun neraca" }).first().click();
  }
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  const headerBox = await page.getByTestId("workspace-header").boundingBox();
  expect(headerBox?.y ?? 999).toBeLessThanOrEqual(2);
  const panelBox = await page.locator(".workspace > .panel").first().boundingBox();
  expect(Math.abs((headerBox?.x ?? 0) - (panelBox?.x ?? 0))).toBeLessThanOrEqual(1);

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

function assertDownloadPath(path: string | null): asserts path is string {
  expect(path).not.toBeNull();
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
