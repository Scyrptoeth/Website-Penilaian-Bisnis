import { chromium } from "@playwright/test";
import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const jsonPath = process.env.PVB_MANUAL_JSON;
const baseUrl = process.env.PVB_MANUAL_BASE_URL || "http://127.0.0.1:3100";
const loginUrl = process.env.PVB_MANUAL_LOGIN_URL || "";
const mode = process.env.PVB_MANUAL_CAPTURE || "all";
const buildDir = process.env.PVB_MANUAL_BUILD_DIR || path.join(rootDir, ".manual-build", "user-manual");
const screenshotDir = path.join(buildDir, "screenshots");
const htmlPath = path.join(buildDir, "buku-panduan-penggunaan-aplikasi-penilaian-bisnis-ii.html");
const outputPdfPath = path.join(rootDir, "public", "buku-panduan-penggunaan-aplikasi-penilaian-bisnis-ii.pdf");

const screenshotPlan = [
  {
    id: "login",
    file: "01-login.png",
    title: "Halaman login pengguna",
    caption: "Pengguna masuk memakai NIP Pendek dan Password Pengguna sebelum membuka workbench.",
  },
  {
    id: "manual-button",
    file: "02-buku-panduan-button.png",
    title: "Tombol Buku Panduan",
    caption: "Tombol Buku Panduan berada di atas Ganti Password dan membuka PDF statis pada tab baru.",
  },
  {
    id: "data-awal",
    file: "03-data-awal.png",
    title: "Data Awal dan profil kasus",
    caption: "Data Awal memuat profil objek pajak, subjek pajak, tahun transaksi, nilai saham, dan periode laporan keuangan.",
  },
  {
    id: "workspace",
    file: "04-workspace-menu.png",
    title: "Workspace lokal",
    caption: "Workspace lokal memisahkan data antar kasus di browser, termasuk opsi workspace kosong, duplikasi, rename, dan hapus.",
  },
  {
    id: "toolbar",
    file: "05-toolbar-cadangan.png",
    title: "Toolbar kerja dan cadangan data",
    caption: "Toolbar menyediakan Undo, Redo, Export PDF, Export XLSX, menu cadangan data, dan Reset.",
  },
  {
    id: "neraca",
    file: "06-neraca.png",
    title: "Input Neraca",
    caption: "Tab Neraca memuat akun neraca manual, kategori akun, label, dan nilai per periode.",
  },
  {
    id: "aset-tetap",
    file: "07-aset-tetap.png",
    title: "Input Aset Tetap",
    caption: "Tab Aset Tetap memuat kelas aset, biaya perolehan, penambahan, akumulasi penyusutan, dan penyusutan berjalan.",
  },
  {
    id: "laba-rugi",
    file: "08-laba-rugi.png",
    title: "Input Laba Rugi",
    caption: "Tab Laba Rugi memuat akun pendapatan, beban, pajak, dan driver operasi per periode.",
  },
  {
    id: "cash-flow-statement",
    file: "09-cash-flow-statement.png",
    title: "Cash Flow Statement",
    caption: "Tab Cash Flow Statement menampilkan arus kas proyeksi, rekonsiliasi, dan kontrol schedule.",
  },
  {
    id: "jadwal-utang",
    file: "10-jadwal-utang.png",
    title: "Jadwal Utang",
    caption: "Tab Jadwal Utang menampilkan movement utang, distribusi, dan diagnostic schedule.",
  },
  {
    id: "noplat-fcf",
    file: "11-noplat-fcf.png",
    title: "NOPLAT dan FCF",
    caption: "Tab NOPLAT & FCF menampilkan bridge dari operasi ke free cash flow.",
  },
  {
    id: "financial-ratio",
    file: "12-financial-ratio.png",
    title: "Financial Ratio",
    caption: "Tab Financial Ratio menampilkan rasio keuangan yang membantu review kewajaran model.",
  },
  {
    id: "roic",
    file: "13-roic.png",
    title: "ROIC",
    caption: "Tab ROIC menampilkan return on invested capital dan indikator profitabilitas operasi.",
  },
  {
    id: "wacc",
    file: "14-wacc.png",
    title: "WACC",
    caption: "Tab WACC memuat smart suggestion pasar, pilihan basis WACC, dan kalkulator biaya modal.",
  },
  {
    id: "asumsi",
    file: "15-asumsi-eem-dcf.png",
    title: "Asumsi EEM dan DCF",
    caption: "Tab Asumsi EEM/DCF memuat tarif pajak, terminal growth, required return on NTA, dan driver modal kerja.",
  },
  {
    id: "proyeksi-aset-tetap",
    file: "16-proyeksi-aset-tetap.png",
    title: "Proyeksi Aset Tetap",
    caption: "Tab Proyeksi Aset Tetap menampilkan roll-forward biaya perolehan, penyusutan, dan nilai buku neto.",
  },
  {
    id: "proyeksi-neraca",
    file: "17-proyeksi-neraca.png",
    title: "Proyeksi Neraca",
    caption: "Tab Proyeksi Neraca menampilkan aset, liabilitas, ekuitas, dan balance control.",
  },
  {
    id: "proyeksi-laba-rugi",
    file: "18-proyeksi-laba-rugi.png",
    title: "Proyeksi Laba Rugi",
    caption: "Tab Proyeksi Laba Rugi menampilkan forecast, governance, dan kontrol scenario reviewer.",
  },
  {
    id: "proyeksi-cash-flow",
    file: "19-proyeksi-cash-flow.png",
    title: "Proyeksi Cash Flow Statement",
    caption: "Tab Proyeksi Cash Flow Statement menampilkan operating, investing, financing, dan cash control.",
  },
  {
    id: "aam",
    file: "20-penilaian-aam.png",
    title: "Penilaian AAM",
    caption: "Tab Penilaian AAM menampilkan nilai ekuitas, basis neraca, penyesuaian, dan jejak formula.",
  },
  {
    id: "eem",
    file: "21-penilaian-eem.png",
    title: "Penilaian EEM",
    caption: "Tab Penilaian EEM menampilkan nilai aktif, NTA operasional, excess earning, dan sensitivitas utang pajak.",
  },
  {
    id: "dcf",
    file: "22-penilaian-dcf.png",
    title: "Penilaian DCF",
    caption: "Tab Penilaian DCF menampilkan nilai aktif, PV FCFF eksplisit, PV terminal value, dan basis skenario.",
  },
  {
    id: "dlom",
    file: "23-dlom.png",
    title: "DLOM",
    caption: "Tab DLOM memuat kuesioner diskon marketability dan basis interest yang digunakan.",
  },
  {
    id: "dloc-pfc",
    file: "24-dloc-pfc.png",
    title: "DLOC/PFC",
    caption: "Tab DLOC/PFC memuat faktor lack of control atau premium for control sesuai karakter kepemilikan.",
  },
  {
    id: "pajak",
    file: "25-simulasi-potensi-pajak.png",
    title: "Simulasi Potensi Pajak",
    caption: "Tab Simulasi Potensi Pajak memakai metode utama, basis final, diskon aktif, dan nilai pengalihan.",
  },
  {
    id: "audit",
    file: "26-audit.png",
    title: "Audit",
    caption: "Tab Audit merangkum status model, snapshot audit, readiness, dan kontrol validasi.",
  },
  {
    id: "export-pdf",
    file: "27-export-pdf-menu.png",
    title: "Menu Export PDF",
    caption: "Export PDF menyediakan scope AAM, EEM, DCF, dan gabungan lengkap.",
  },
  {
    id: "export-xlsx",
    file: "28-export-xlsx-menu.png",
    title: "Menu Export XLSX",
    caption: "Export XLSX menyediakan workbook dengan scope yang sama untuk review angka dan formula.",
  },
];

const caseProfileLabels = {
  objectTaxpayerName: "Nama Objek Pajak",
  objectBusinessKlu: "KLU Objek Pajak",
  objectTaxpayerNpwp: "NPWP Objek Pajak",
  companySector: "Sektor Perusahaan",
  companyType: "Jenis Perusahaan",
  subjectTaxpayerName: "Nama Subjek Pajak",
  subjectTaxpayerNpwp: "NPWP Subjek Pajak",
  subjectTaxpayerType: "Jenis Subjek Pajak",
  shareOwnershipType: "Jenis Kepemilikan Saham",
  transferType: "Jenis Pengalihan",
  capitalBaseFull: "Nilai Saham Penuh",
  capitalBaseValued: "Nilai Saham yang Dinilai",
  shareValuePerShare: "Nilai Saham per Lembar",
  transactionYear: "Tahun Transaksi",
  valuationObject: "Objek Penilaian",
};

const assumptionLabels = {
  taxRate: "Tarif pajak",
  terminalGrowth: "Terminal growth",
  terminalGrowthDownside: "Terminal growth downside",
  terminalGrowthUpside: "Terminal growth upside",
  wacc: "WACC manual",
  revenueGrowth: "Override pertumbuhan pendapatan",
  arDays: "Hari piutang",
  inventoryDays: "Hari persediaan",
  apDays: "Hari utang usaha",
  otherPayableDays: "Hari utang lain-lain",
  requiredReturnOnNta: "Required return on NTA",
  waccRiskFreeRate: "Risk-free rate",
  waccEquityRiskPremium: "Equity risk premium",
  waccRatingBasedDefaultSpread: "Rating based default spread",
  waccCountryRiskPremium: "Country risk premium",
  waccSpecificRiskPremium: "Specific risk premium",
  waccPreTaxCostOfDebt: "Pre-tax cost of debt",
  waccEquityMarketValue: "Equity market value",
  waccDebtMarketValue: "Debt market value",
  waccEquityWeight: "Equity weight",
  waccDebtWeight: "Debt weight",
  waccBeta: "Beta",
};

await mkdir(screenshotDir, { recursive: true });

if (!jsonPath) {
  throw new Error("PVB_MANUAL_JSON is required and must point to the dummy workbench JSON file.");
}

if ((mode === "all" || mode === "workbench") && baseUrl) {
  await captureWorkbenchScreenshots();
}

if ((mode === "all" || mode === "login") && loginUrl) {
  await captureLoginScreenshot();
}

await buildManualPdf();

async function captureLoginScreenshot() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
  const page = await context.newPage();

  try {
    await page.goto(loginUrl, { waitUntil: "networkidle" });
    await page.screenshot({ path: screenshotPath("login"), fullPage: false });
  } finally {
    await browser.close();
  }
}

async function captureWorkbenchScreenshots() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
  const page = await context.newPage();

  try {
    await page.goto(baseUrl, { waitUntil: "networkidle" });
    await page.getByTestId("valuation-workbench").waitFor({ state: "visible", timeout: 30_000 });
    await capture(page, "manual-button");

    await openJsonImportDialog(page);
    await page.getByRole("button", { name: "Import JSON", exact: true }).click();
    await page.getByText("Contoh Nama Objek Pajak").first().waitFor({ state: "visible", timeout: 20_000 });
    await capture(page, "data-awal");

    await page.getByRole("button", { name: /Workspace aktif:/ }).click();
    await capture(page, "workspace");
    await page.keyboard.press("Escape");

    await page.getByRole("button", { name: "JSON", exact: true }).click();
    await capture(page, "toolbar");
    await page.keyboard.press("Escape");

    await captureTab(page, "Neraca", "neraca");
    await captureTab(page, "Aset Tetap", "aset-tetap");
    await captureTab(page, "Laba Rugi", "laba-rugi");
    await captureTab(page, "Cash Flow Statement", "cash-flow-statement");
    await captureTab(page, "Jadwal Utang", "jadwal-utang");
    await captureTab(page, "NOPLAT & FCF", "noplat-fcf");
    await captureTab(page, "Financial Ratio", "financial-ratio");
    await captureTab(page, "ROIC", "roic");
    await captureTab(page, "WACC", "wacc");
    await captureTab(page, "Asumsi EEM/DCF", "asumsi");
    await captureTab(page, "Proyeksi Aset Tetap", "proyeksi-aset-tetap");
    await captureTab(page, "Proyeksi Neraca", "proyeksi-neraca");
    await captureTab(page, "Proyeksi Laba Rugi", "proyeksi-laba-rugi");
    await captureTab(page, "Proyeksi Cash Flow Statement", "proyeksi-cash-flow");
    await captureTab(page, "Penilaian AAM", "aam");
    await captureTab(page, "Penilaian EEM", "eem");
    await captureTab(page, "Penilaian DCF", "dcf");
    await captureTab(page, "DLOM", "dlom");
    await captureTab(page, "DLOC/PFC", "dloc-pfc");
    await captureTab(page, "Simulasi Potensi Pajak", "pajak");
    await captureTab(page, "Audit", "audit");

    await page.getByRole("button", { name: "Export PDF", exact: true }).click();
    await capture(page, "export-pdf");
    await page.keyboard.press("Escape");

    await page.getByRole("button", { name: "Export XLSX", exact: true }).click();
    await capture(page, "export-xlsx");
  } finally {
    await browser.close();
  }
}

async function openJsonImportDialog(page) {
  await page.getByRole("button", { name: "JSON", exact: true }).click();
  await page.getByTestId("json-import-input").setInputFiles(jsonPath);
  await page.getByRole("dialog").waitFor({ state: "visible", timeout: 20_000 });
}

async function captureTab(page, tabName, screenshotId) {
  const sidebarButton = page.locator("aside .nav-list button").filter({ hasText: tabName }).first();
  if ((await sidebarButton.count()) > 0) {
    await sidebarButton.click();
  } else {
    await page.getByRole("button", { name: new RegExp(escapeRegExp(tabName), "i") }).first().click();
  }
  await page.waitForTimeout(500);
  await capture(page, screenshotId);
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function capture(page, screenshotId) {
  const item = screenshotPlan.find((entry) => entry.id === screenshotId);
  if (!item) {
    throw new Error(`Unknown screenshot id: ${screenshotId}`);
  }
  await page.screenshot({ path: screenshotPath(screenshotId), fullPage: false });
}

function screenshotPath(screenshotId) {
  const item = screenshotPlan.find((entry) => entry.id === screenshotId);
  if (!item) {
    throw new Error(`Unknown screenshot id: ${screenshotId}`);
  }
  return path.join(screenshotDir, item.file);
}

async function buildManualPdf() {
  const payload = JSON.parse(await readFile(jsonPath, "utf8"));
  const html = await renderManualHtml(payload);

  await writeFile(htmlPath, html);

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });

  try {
    await page.setContent(html, { waitUntil: "networkidle" });
    await page.pdf({
      path: outputPdfPath,
      format: "A4",
      printBackground: true,
      margin: { top: "14mm", right: "12mm", bottom: "16mm", left: "12mm" },
      preferCSSPageSize: true,
    });
  } finally {
    await browser.close();
  }
}

async function renderManualHtml(payload) {
  const data = payload.data;
  const periods = Array.isArray(data.periods) ? data.periods : [];
  const rows = Array.isArray(data.rows) ? data.rows : [];
  const balanceRows = rows.filter((row) => row.statement === "balance_sheet");
  const incomeRows = rows.filter((row) => row.statement === "income_statement");
  const fixedAssetRows = Array.isArray(data.fixedAssetScheduleRows) ? data.fixedAssetScheduleRows : [];
  const screenshotSections = await renderScreenshotSections();
  const manualGeneratedAt = new Date();

  return `<!doctype html>
<html lang="id">
<head>
  <meta charset="utf-8">
  <title>Buku Panduan Penggunaan Aplikasi Penilaian Bisnis II</title>
  <style>${manualCss()}</style>
</head>
<body>
  <section class="cover">
    <p class="eyebrow">Buku Panduan Penggunaan</p>
    <h1>Buku Panduan Penggunaan Aplikasi Penilaian Bisnis II</h1>
    <p class="cover-subtitle">Panduan pengguna untuk workflow non-admin dengan data contoh latihan yang diinput secara manual.</p>
    <dl class="cover-meta">
      <div><dt>Aplikasi</dt><dd>${escapeHtml(payload.appName || "Penilaian Bisnis II")}</dd></div>
      <div><dt>Data contoh</dt><dd>${escapeHtml(data.caseProfile?.objectTaxpayerName || "Contoh Nama Objek Pajak")}</dd></div>
      <div><dt>Tanggal penyusunan</dt><dd>${escapeHtml(formatDateTime(manualGeneratedAt.toISOString()))}</dd></div>
      <div><dt>Cakupan</dt><dd>Pengguna biasa, input manual, perhitungan, review, dan ekspor</dd></div>
    </dl>
  </section>

  <section class="chapter">
    <h2>1. Ruang Lingkup Panduan</h2>
    <p>Panduan ini menjelaskan penggunaan fitur pengguna biasa pada Aplikasi Penilaian Bisnis II. Fitur admin dan super admin tidak dibahas karena pengelolaan website dilakukan oleh pengelola aplikasi.</p>
    <p>Data contoh dalam panduan ini adalah data latihan. Gunakan tabel input pada setiap bab sebagai acuan ketika mengisi data satu per satu di aplikasi.</p>
    <table>
      <tbody>
        <tr><th>Nama objek pajak contoh</th><td>${escapeHtml(data.caseProfile?.objectTaxpayerName || "Contoh Nama Objek Pajak")}</td></tr>
        <tr><th>Nama subjek pajak contoh</th><td>${escapeHtml(data.caseProfile?.subjectTaxpayerName || "Contoh Nama Subjek Pajak")}</td></tr>
        <tr><th>Jumlah periode</th><td>${periods.length}</td></tr>
        <tr><th>Jumlah akun neraca</th><td>${balanceRows.length}</td></tr>
        <tr><th>Jumlah akun laba rugi</th><td>${incomeRows.length}</td></tr>
        <tr><th>Jumlah kelas aset tetap</th><td>${fixedAssetRows.length}</td></tr>
      </tbody>
    </table>
  </section>

  <section class="chapter">
    <h2>2. Ringkasan Fungsi Utama</h2>
    ${renderFeatureSummary()}
  </section>

  <section class="chapter">
    <h2>3. Screenshot Workflow Utama</h2>
    <p>Screenshot berikut menunjukkan tahap utama penggunaan aplikasi setelah data contoh dimasukkan ke workspace aktif.</p>
    ${screenshotSections}
  </section>

  <section class="chapter">
    <h2>4. Langkah Penggunaan Ringkas</h2>
    ${renderUsageSteps()}
  </section>

  <section class="chapter">
    <h2>5. Input Profil Kasus</h2>
    <p>Isi Data Awal sesuai tabel berikut. Field yang kosong pada kasus nyata dapat disesuaikan dengan dokumen pendukung yang tersedia.</p>
    ${renderCaseProfileTable(data.caseProfile || {})}
  </section>

  <section class="chapter">
    <h2>6. Input Periode Laporan Keuangan</h2>
    <p>Gunakan tombol tambah periode untuk membuat periode historis, lalu isi label dan tanggal penilaian sesuai tabel berikut.</p>
    ${renderPeriodsTable(periods, data.activePeriodId)}
  </section>

  ${renderAccountRowsChapter({
    title: "7. Input Neraca Satu per Satu",
    intro: "Tambahkan baris akun neraca, isi nama akun, pilih kategori utama atau override bila diperlukan, lalu isi nilai untuk setiap periode.",
    rows: balanceRows,
    periods,
    chunkSizes: [9, 9],
  })}

  ${renderAccountRowsChapter({
    title: "8. Input Laba Rugi Satu per Satu",
    intro: "Tambahkan baris akun laba rugi, isi nama akun, pilih kategori utama atau override bila diperlukan, lalu isi nilai untuk setiap periode.",
    rows: incomeRows,
    periods,
    chunkSizes: [3, 3, 2],
  })}

  ${renderFixedAssetRowsChapter({
    title: "9. Input Jadwal Aset Tetap Satu per Satu",
    intro: "Tambahkan kelas aset tetap, lalu isi biaya perolehan awal, penambahan biaya perolehan, akumulasi penyusutan awal, dan penyusutan berjalan untuk setiap periode.",
    rows: fixedAssetRows,
    periods,
    chunkSizes: [2, 3],
  })}

  <section class="chapter">
    <h2>10. Asumsi, Smart Suggestion, dan Driver</h2>
    <p>Bagian ini memuat seluruh asumsi yang perlu diperiksa pada tab WACC dan Asumsi EEM/DCF. Field kosong berarti aplikasi memakai hasil kalkulasi otomatis atau fallback sistem sesuai konteks tab.</p>
    ${renderKeyValueTable(data.assumptions || {}, assumptionLabels)}
  </section>

  <section class="chapter">
    <h2>11. Skenario Aktif dan Pengaturan Model</h2>
    ${renderScenarioTable(data)}
  </section>

  <section class="chapter">
    <h2>12. DLOM</h2>
    ${renderDlomTable(data.dlom || {})}
  </section>

  <section class="chapter">
    <h2>13. DLOC/PFC</h2>
    ${renderDlocPfcTable(data.dlocPfc || {})}
  </section>

  <section class="chapter">
    <h2>14. Simulasi Potensi Pajak</h2>
    ${renderKeyValueTable(data.taxSimulation || {}, {})}
  </section>

  ${renderIncomeProjectionControlsChapter(data.incomeProjectionControls || {})}

  <section class="chapter">
    <h2>16. AAM Adjustment dan Cash Flow Override</h2>
    ${renderObjectSummary("AAM adjustment", data.aamAdjustments)}
    ${renderObjectSummary("Cash flow override", data.cashFlowOverrides)}
  </section>

</body>
</html>`;
}

async function renderScreenshotSections() {
  const blocks = [];

  for (const shot of screenshotPlan) {
    const absolutePath = path.join(screenshotDir, shot.file);
    if (!existsSync(absolutePath)) {
      continue;
    }
    const dataUri = await imageToDataUri(absolutePath);
    blocks.push(`
      <figure class="screenshot">
        <img src="${dataUri}" alt="${escapeHtml(shot.title)}">
        <figcaption><strong>${escapeHtml(shot.title)}</strong><span>${escapeHtml(shot.caption)}</span></figcaption>
      </figure>
    `);
  }

  return blocks.join("\n");
}

async function imageToDataUri(absolutePath) {
  const image = await readFile(absolutePath);
  return `data:image/png;base64,${image.toString("base64")}`;
}

function renderFeatureSummary() {
  const rows = [
    ["Login", "Masuk memakai NIP Pendek dan Password Pengguna."],
    ["Buku Panduan", "Membuka file PDF statis pada tab baru dari sidebar atau area aksi akun."],
    ["Ganti Password", "Mengubah password pengguna sendiri dengan validasi panjang dan konfirmasi."],
    ["Keluar", "Mengakhiri sesi dan kembali ke halaman login."],
    ["Workspace lokal", "Membuat, menduplikasi, mengganti nama, menghapus, dan berpindah workspace lokal."],
    ["Undo dan Redo", "Membatalkan atau mengulang perubahan data pada workspace aktif."],
    ["Input Data Awal", "Mengisi profil kasus, objek pajak, subjek pajak, transaksi, nilai saham, dan periode."],
    ["Neraca", "Mengisi akun neraca dan nilai per periode."],
    ["Laba Rugi", "Mengisi akun laba rugi dan nilai per periode."],
    ["Aset Tetap", "Mengisi jadwal biaya perolehan dan penyusutan per kelas aset."],
    ["Kategorisasi dan label akun", "Meninjau kategori utama, category override, label pendukung, dan dampaknya pada perhitungan."],
    ["WACC", "Menggunakan smart suggestion pasar atau override manual dengan alasan."],
    ["Asumsi EEM/DCF", "Mengatur tarif pajak, terminal growth, required return on NTA, dan driver modal kerja."],
    ["AAM, EEM, DCF", "Melihat hasil nilai, sensitivitas, dan jejak formula."],
    ["Proyeksi", "Meninjau proyeksi laba rugi, neraca, aset tetap, cash flow, jadwal utang, NOPLAT, ratio, dan ROIC."],
    ["DLOM dan DLOC/PFC", "Mengisi faktor diskon atau premium sesuai karakter transaksi."],
    ["Simulasi Potensi Pajak", "Menghitung potensi pajak berdasarkan metode utama dan nilai pengalihan."],
    ["Export PDF, XLSX, dan cadangan JSON", "Membuat laporan, workbook, serta file cadangan untuk memindahkan atau memulihkan workspace."],
    ["Reset", "Mengosongkan workspace aktif setelah konfirmasi."],
  ];
  return renderArrayTable(["Fungsi", "Kegunaan"], rows);
}

function renderUsageSteps() {
  const steps = [
    ["1", "Login ke aplikasi memakai NIP Pendek dan Password Pengguna."],
    ["2", "Buka tombol Buku Panduan bila perlu membaca instruksi di tab baru."],
    ["3", "Isi Data Awal sesuai tabel Profil Kasus, termasuk objek pajak, subjek pajak, jenis perusahaan, jenis pengalihan, nilai saham, dan tahun transaksi."],
    ["4", "Atur periode laporan keuangan. Pastikan tahun penilaian aktif dan periode historis sudah sesuai label yang dibutuhkan."],
    ["5", "Masuk ke tab Neraca. Tambahkan seluruh akun neraca satu per satu, pilih kategori utama atau override bila perlu, lalu isi nilai per periode."],
    ["6", "Masuk ke tab Laba Rugi. Tambahkan seluruh akun laba rugi satu per satu, pilih kategori utama atau override bila perlu, lalu isi nilai per periode."],
    ["7", "Masuk ke tab Aset Tetap. Tambahkan setiap kelas aset tetap, lalu isi biaya perolehan dan penyusutan per periode."],
    ["8", "Periksa kategori utama, label pendukung, dan dampak label pada baris Neraca dan Laba Rugi."],
    ["9", "Buka WACC dan Asumsi EEM/DCF. Gunakan smart suggestion atau isi override dengan alasan audit."],
    ["10", "Buka Penilaian AAM, Penilaian EEM, dan Penilaian DCF untuk melihat nilai, sensitivitas, dan formula trace."],
    ["11", "Buka Proyeksi DCF, Diskon & Pajak, dan Audit untuk melakukan final check."],
    ["12", "Export PDF atau XLSX sesuai scope. Gunakan cadangan JSON hanya untuk backup atau pemindahan workspace bila diperlukan."],
  ];
  return renderArrayTable(["Tahap", "Instruksi"], steps);
}

function renderCaseProfileTable(profile) {
  const rows = Object.keys(caseProfileLabels).map((key) => [caseProfileLabels[key], key, displayValue(profile[key])]);
  return renderArrayTable(["Field", "Field aplikasi", "Nilai contoh"], rows);
}

function renderPeriodsTable(periods, activePeriodId) {
  const rows = periods.map((period) => [
    period.id,
    period.label,
    period.valuationDate || "",
    String(period.yearOffset ?? ""),
    period.id === activePeriodId ? "Aktif" : "",
  ]);
  return renderArrayTable(["ID", "Label", "Tanggal penilaian", "Year offset", "Status"], rows);
}

function renderAccountRowsChapter({ title, intro, rows, periods, chunkSizes }) {
  return splitRowsBySizes(rows, chunkSizes)
    .map((chunk, index) => {
      const suffix = index === 0 ? "" : " (lanjutan)";
      const introText = index === 0 ? `<p>${escapeHtml(intro)}</p>` : "";
      return `
  <section class="chapter landscape-chapter">
    <h2>${escapeHtml(title + suffix)}</h2>
    ${introText}
    ${renderAccountRowsTable(chunk, periods)}
  </section>`;
    })
    .join("");
}

function renderFixedAssetRowsChapter({ title, intro, rows, periods, chunkSizes }) {
  return splitRowsBySizes(rows, chunkSizes)
    .map((chunk, index) => {
      const suffix = index === 0 ? "" : " (lanjutan)";
      const introText = index === 0 ? `<p>${escapeHtml(intro)}</p>` : "";
      return `
  <section class="chapter landscape-chapter">
    <h2>${escapeHtml(title + suffix)}</h2>
    ${introText}
    ${renderFixedAssetRowsTable(chunk, periods)}
  </section>`;
    })
    .join("");
}

function splitRowsBySizes(rows, sizes) {
  const chunks = [];
  let start = 0;
  for (const size of sizes) {
    chunks.push(rows.slice(start, start + size));
    start += size;
  }
  if (start < rows.length) {
    chunks[chunks.length - 1].push(...rows.slice(start));
  }
  return chunks.filter((chunk) => chunk.length > 0);
}

function renderAccountRowsTable(rows, periods) {
  const headers = ["Akun", "Category override", "Klasifikasi neraca", "Label"];
  const periodHeaders = periods.map((period) => period.label || period.id);
  const tableRows = rows.map((row) => [
    row.accountName,
    row.categoryOverride || "",
    row.balanceSheetClassification || "",
    Array.isArray(row.labelOverrides) && row.labelOverrides.length ? row.labelOverrides.join(", ") : "",
    ...periods.map((period) => displayValue(row.values?.[period.id])),
  ]);
  return renderArrayTable([...headers, ...periodHeaders], tableRows);
}

function renderFixedAssetRowsTable(rows, periods) {
  const headers = ["Kelas aset"];
  const valueKeys = [
    ["acquisitionBeginning", "Biaya perolehan awal"],
    ["acquisitionAdditions", "Penambahan biaya perolehan"],
    ["depreciationBeginning", "Akumulasi penyusutan awal"],
    ["depreciationAdditions", "Penyusutan berjalan"],
  ];
  for (const period of periods) {
    for (const [, label] of valueKeys) {
      headers.push(`${period.label || period.id} - ${label}`);
    }
  }
  const tableRows = rows.map((row) => {
    const values = [row.assetName || ""];
    for (const period of periods) {
      for (const [key] of valueKeys) {
        values.push(displayValue(row.values?.[period.id]?.[key]));
      }
    }
    return values;
  });
  return renderArrayTable(headers, tableRows);
}

function renderScenarioTable(data) {
  const rows = [
    ["activePeriodId", data.activePeriodId],
    ["activeWaccBasis", data.activeWaccBasis],
    ["activeEemBasis", data.activeEemBasis],
    ["activeDcfBasis", data.activeDcfBasis],
    ["fixedAssetProjectionMode", data.fixedAssetProjectionMode],
    ["isFixedAssetScheduleEnabled", String(data.isFixedAssetScheduleEnabled)],
    ["version", data.version],
    ["savedAt", formatDateTime(data.savedAt)],
  ];
  return renderArrayTable(["Pengaturan", "Nilai"], rows);
}

function renderDlomTable(dlom) {
  const basisRows = Object.entries(dlom.basisOverride || {}).map(([key, value]) => [key, displayValue(value)]);
  const factorRows = Object.entries(dlom.factors || {}).map(([key, value]) => [
    key,
    displayValue(value.answer),
    displayValue(value.overrideReason),
  ]);
  return `
    <h3>Basis override</h3>
    ${renderArrayTable(["Field", "Nilai"], basisRows)}
    <h3>Faktor DLOM</h3>
    ${renderArrayTable(["Faktor", "Jawaban", "Alasan override"], factorRows)}
  `;
}

function renderDlocPfcTable(dlocPfc) {
  const factorRows = Object.entries(dlocPfc.factors || {}).map(([key, value]) => [
    key,
    displayValue(value.answer),
    displayValue(value.overrideReason),
  ]);
  return renderArrayTable(["Faktor", "Jawaban", "Alasan override"], factorRows);
}

function renderIncomeProjectionControlsChapter(controls) {
  const yearly = controls.yearlyOverrides || {};
  const yearlyRows = Object.entries(yearly).map(([year, value]) => [
    year,
    value.revenueGrowth,
    value.grossProfitMargin,
    value.operatingExpenseMargin,
    value.depreciationMargin,
    value.reason,
    formatDateTime(value.updatedAt),
  ]);
  const auditRows = Array.isArray(controls.auditEvents)
    ? controls.auditEvents.map((event) => [
        formatDateTime(event.createdAt),
        event.actor,
        event.action,
        event.field,
        event.priorValue,
        event.newValue,
        event.reason,
        event.impact,
      ])
    : [];
  const auditChunks = splitRowsBySizes(auditRows, [4, Math.max(1, auditRows.length - 4)]);
  return `
  <section class="chapter landscape-chapter">
    <h2>15. Kontrol Proyeksi Laba Rugi</h2>
    <h3>Yearly override</h3>
    ${renderArrayTable(["Tahun", "Revenue growth", "Gross margin", "Opex margin", "Depreciation margin", "Reason", "Updated at"], yearlyRows)}
  </section>

  <section class="chapter landscape-chapter">
    <h2>15. Kontrol Proyeksi Laba Rugi (lanjutan)</h2>
    <h3>Reviewer decision</h3>
    ${renderKeyValueTable(controls.reviewerDecision || {}, {})}
    <h3>Non operating policy</h3>
    ${renderKeyValueTable(controls.nonOperatingPolicy || {}, {})}
    <h3>Presentation assumptions</h3>
    ${renderKeyValueTable(controls.presentationAssumptions || {}, {})}
  </section>

  ${auditChunks
    .map(
      (chunk, index) => `
  <section class="chapter landscape-chapter">
    <h2>15. Kontrol Proyeksi Laba Rugi (audit events${index === 0 ? "" : " lanjutan"})</h2>
    ${renderArrayTable(["Created at", "Actor", "Action", "Field", "Prior value", "New value", "Reason", "Impact"], chunk)}
  </section>`,
    )
    .join("")}`;
}

function renderObjectSummary(title, value) {
  const scalarRows = flattenScalars(value || {});
  if (scalarRows.length === 0) {
    return `<h3>${escapeHtml(title)}</h3><p>Tidak ada input tersimpan pada bagian ini.</p>`;
  }
  return `<h3>${escapeHtml(title)}</h3>${renderScalarTable(scalarRows)}`;
}

function renderKeyValueTable(object, labels) {
  const rows = Object.keys(object || {})
    .sort()
    .map((key) => [labels[key] || key, key, displayValue(object[key])]);
  return renderArrayTable(["Field", "Field aplikasi", "Nilai contoh"], rows);
}

function renderScalarTable(rows) {
  return renderArrayTable(["Field teknis", "Nilai contoh"], rows.map((row) => [row.path, displayValue(row.value)]));
}

function renderArrayTable(headers, rows) {
  if (!rows.length) {
    return "<p>Tidak ada data tersimpan.</p>";
  }
  return `<div class="table-wrap"><table>
    <thead><tr>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("")}</tr></thead>
    <tbody>
      ${rows
        .map(
          (row) =>
            `<tr>${row.map((cell) => `<td>${escapeHtml(displayValue(cell))}</td>`).join("")}</tr>`,
        )
        .join("")}
    </tbody>
  </table></div>`;
}

function flattenScalars(value, prefix = "") {
  if (value === null || typeof value !== "object") {
    return [{ path: prefix || "$", value }];
  }
  if (Array.isArray(value)) {
    return value.flatMap((item, index) => flattenScalars(item, `${prefix}[${index}]`));
  }
  return Object.entries(value).flatMap(([key, child]) => {
    const nextPrefix = prefix ? `${prefix}.${key}` : key;
    return flattenScalars(child, nextPrefix);
  });
}

function displayValue(value) {
  if (value === null || value === undefined) {
    return "";
  }
  if (typeof value === "string") {
    return value;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return JSON.stringify(value);
}

function formatDateTime(value) {
  if (!value) {
    return "";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Asia/Jakarta",
  }).format(date);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function manualCss() {
  return `
    @page {
      size: A4;
      margin: 14mm 12mm 16mm;
    }
    @page manual-landscape {
      size: A4 landscape;
      margin: 10mm 9mm 12mm;
    }
    * {
      box-sizing: border-box;
      font-style: normal !important;
    }
    body {
      margin: 0;
      color: #17211f;
      background: #ffffff;
      font-family: "Helvetica Neue Light", "Helvetica Neue", Helvetica, Arial, sans-serif;
      font-size: 10.5pt;
      font-weight: 300;
      line-height: 1.5;
    }
    h1,
    h2,
    h3,
    h4,
    th,
    strong,
    dt {
      font-weight: 300;
    }
    h1 {
      margin: 12mm 0 6mm;
      max-width: 160mm;
      font-size: 28pt;
      line-height: 1.1;
      letter-spacing: 0;
    }
    h2 {
      margin: 0 0 5mm;
      padding-bottom: 2.5mm;
      border-bottom: 0.35mm solid #123c36;
      color: #123c36;
      font-size: 18pt;
      line-height: 1.2;
      letter-spacing: 0;
    }
    h3 {
      margin: 7mm 0 3mm;
      color: #123c36;
      font-size: 13pt;
      letter-spacing: 0;
    }
    p {
      margin: 0 0 3.5mm;
    }
    .cover {
      display: flex;
      min-height: 260mm;
      flex-direction: column;
      justify-content: center;
      page-break-after: always;
      border-left: 2mm solid #123c36;
      padding-left: 10mm;
    }
    .cover-subtitle {
      max-width: 150mm;
      color: #4a5a55;
      font-size: 13pt;
    }
    .cover-meta {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 4mm;
      max-width: 170mm;
      margin-top: 12mm;
    }
    .cover-meta div {
      border: 0.25mm solid #d5dfdc;
      padding: 4mm;
      background: #f5f8f7;
    }
    dt {
      color: #58706a;
      font-size: 8pt;
      text-transform: uppercase;
    }
    dd {
      margin: 1mm 0 0;
    }
    .eyebrow {
      margin: 0;
      color: #58706a;
      font-size: 8pt;
      text-transform: uppercase;
      letter-spacing: 0.08em;
    }
    .chapter {
      page-break-before: always;
    }
    .landscape-chapter {
      page: manual-landscape;
      font-size: 8.8pt;
      line-height: 1.28;
    }
    .landscape-chapter h2 {
      margin-bottom: 3mm;
      padding-bottom: 2mm;
      font-size: 15pt;
    }
    .landscape-chapter h3 {
      margin: 4mm 0 2mm;
      font-size: 10.5pt;
    }
    .landscape-chapter p {
      margin-bottom: 2.2mm;
    }
    .landscape-chapter .table-wrap {
      margin: 2mm 0 4mm;
    }
    .landscape-chapter th,
    .landscape-chapter td {
      padding: 1.05mm 1.15mm;
    }
    .table-wrap {
      width: 100%;
      overflow: hidden;
      margin: 3mm 0 7mm;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      page-break-inside: auto;
      table-layout: fixed;
    }
    thead {
      display: table-header-group;
    }
    tr {
      page-break-inside: avoid;
    }
    th,
    td {
      border: 0.2mm solid #d5dfdc;
      padding: 1.8mm 2mm;
      text-align: left;
      vertical-align: top;
      overflow-wrap: anywhere;
      word-break: break-word;
    }
    th {
      background: #eef4f2;
      color: #123c36;
    }
    tbody tr:nth-child(even) td {
      background: #fafcfc;
    }
    .screenshot {
      margin: 0 0 9mm;
      page-break-inside: avoid;
    }
    .screenshot img {
      display: block;
      width: 100%;
      border: 0.25mm solid #bfcfca;
    }
    figcaption {
      display: grid;
      gap: 1mm;
      padding: 2.5mm 3mm;
      border: 0.25mm solid #d5dfdc;
      border-top: 0;
      background: #f5f8f7;
      color: #34443f;
    }
    figcaption strong {
      color: #123c36;
      font-size: 11pt;
    }
  `;
}
