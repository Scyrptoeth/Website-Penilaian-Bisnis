import type { AccountMappingResult, AccountMappingRule } from "./types";

type StatementContext = "balance_sheet" | "income_statement" | "fixed_asset";

const balanceSheetCategories = new Set([
  "TOTAL_ASSETS",
  "CURRENT_ASSET",
  "CASH_ON_HAND",
  "CASH_ON_BANK",
  "ACCOUNT_RECEIVABLE",
  "EMPLOYEE_RECEIVABLE",
  "INVENTORY",
  "FIXED_ASSET",
  "FIXED_ASSET_ACQUISITION",
  "ACCUMULATED_DEPRECIATION",
  "INTANGIBLE_ASSETS",
  "NON_CURRENT_ASSET",
  "TOTAL_LIABILITIES",
  "CURRENT_LIABILITIES",
  "BANK_LOAN_SHORT_TERM",
  "ACCOUNT_PAYABLE",
  "TAX_PAYABLE",
  "OTHER_PAYABLE",
  "BANK_LOAN_LONG_TERM",
  "NON_CURRENT_LIABILITIES",
  "MODAL_DISETOR",
  "PENAMBAHAN_MODAL_DISETOR",
  "RETAINED_EARNINGS_SURPLUS",
  "RETAINED_EARNINGS_CURRENT_PROFIT",
  "NON_OPERATING_FIXED_ASSETS",
  "EXCESS_CASH",
  "MARKETABLE_SECURITIES",
  "INTEREST_PAYABLE",
  "INTEREST_BEARING_DEBT",
  "SURPLUS_ASSET_CASH",
]);

const incomeStatementCategories = new Set([
  "REVENUE",
  "COST_OF_GOOD_SOLD",
  "SELLING_EXPENSE",
  "GENERAL_ADMINISTRATIVE_OVERHEADS",
  "OPERATING_EXPENSE",
  "DEPRECIATION_EXPENSE",
  "EBIT",
  "COMMERCIAL_NPAT",
  "INTEREST_INCOME",
  "INTEREST_EXPENSE",
  "NON_OPERATING_INCOME",
]);

const fixedAssetCategories = new Set(["FIXED_ASSET", "FIXED_ASSET_ACQUISITION", "ACCUMULATED_DEPRECIATION", "DEPRECIATION_EXPENSE"]);

export const accountMappingRules: AccountMappingRule[] = [
  {
    category: "TOTAL_ASSETS",
    displayName: "Total Assets",
    aliases: ["total assets", "jumlah aset", "total aset", "total aktiva", "jumlah aktiva"],
    includeKeywords: ["total assets", "jumlah aset", "total aset", "total aktiva", "jumlah aktiva", "assets", "aktiva"],
    treatment: "review",
    valuationImpact: ["AAM"],
    reviewNote: "Gunakan sebagai override total assets hanya jika rincian komponen asset tidak tersedia atau sudah direkonsiliasi.",
  },
  {
    category: "CURRENT_ASSET",
    displayName: "Current Asset",
    aliases: ["current asset", "aset lancar", "aktiva lancar", "aset lancar lainnya"],
    includeKeywords: ["current asset", "aset lancar", "aktiva lancar", "lancar", "current"],
    treatment: "review",
    valuationImpact: ["AAM", "working capital support"],
    reviewNote: "Petakan ke kategori current asset yang lebih rinci jika subledger tersedia.",
  },
  {
    category: "CASH_ON_HAND",
    displayName: "Cash on Hand",
    aliases: ["cash on hand", "cash on hands", "kas", "kas kecil", "uang kas", "kas di tangan", "kas tunai"],
    includeKeywords: ["cash on hand", "kas kecil", "uang kas", "kas tunai", "cash", "kas"],
    excludeKeywords: ["bank", "deposito", "deposit"],
    treatment: "review",
    valuationImpact: ["AAM", "surplus asset sensitivity", "minimum operating cash"],
    reviewNote: "Cash on hand dapat menjadi operating cash; tinjau minimum operating cash sebelum seluruhnya diperlakukan sebagai surplus.",
  },
  {
    category: "CASH_ON_BANK",
    displayName: "Cash on Bank / Deposit",
    aliases: ["cash on bank", "bank", "deposito", "deposit", "giro", "rekening bank", "kas bank", "bank danamon"],
    includeKeywords: ["cash on bank", "rekening bank", "kas bank", "bank", "deposito", "deposit", "giro"],
    treatment: "non_operating",
    valuationImpact: ["AAM", "EEM bridge", "DCF bridge", "marketable securities review"],
    reviewNote: "Pisahkan operating bank account dari deposit/investment jika subledger tersedia.",
  },
  {
    category: "EXCESS_CASH",
    displayName: "Excess Cash",
    aliases: ["excess cash", "kas berlebih", "kelebihan kas", "cash surplus operasi"],
    includeKeywords: ["excess", "berlebih", "kelebihan", "surplus"],
    treatment: "non_operating",
    valuationImpact: ["EEM bridge", "DCF bridge", "surplus asset sensitivity"],
    reviewNote: "Perlakukan sebagai non-operating hanya setelah minimum operating cash dipertimbangkan.",
  },
  {
    category: "SURPLUS_ASSET_CASH",
    displayName: "Surplus Asset Cash",
    aliases: ["surplus asset cash", "kas surplus", "surplus kas", "kas non operasional"],
    includeKeywords: ["surplus", "kas", "cash", "non operasional"],
    treatment: "non_operating",
    valuationImpact: ["EEM bridge", "DCF bridge"],
    reviewNote: "Cash-like surplus asset ditambahkan pada EV-to-equity bridge setelah tinjauan operating cash.",
  },
  {
    category: "MARKETABLE_SECURITIES",
    displayName: "Marketable Securities",
    aliases: ["marketable securities", "surat berharga", "efek", "investasi jangka pendek", "deposito investasi"],
    includeKeywords: ["surat berharga", "marketable securities", "marketable", "securities", "efek", "investasi"],
    treatment: "non_operating",
    valuationImpact: ["AAM", "EEM bridge", "DCF bridge"],
    reviewNote: "Umumnya non-operating kecuali dibutuhkan untuk ordinary operations.",
  },
  {
    category: "ACCOUNT_RECEIVABLE",
    displayName: "Account Receivable",
    aliases: ["account receivable", "piutang usaha", "piutang dagang", "trade receivable", "receivable", "accounts receivable"],
    includeKeywords: ["account receivable", "accounts receivable", "piutang usaha", "piutang dagang", "trade receivable", "piutang", "receivable"],
    excludeKeywords: ["karyawan", "employee"],
    treatment: "operating",
    valuationImpact: ["AAM", "working capital", "DCF WC days"],
    reviewNote: "Operating current asset kecuali bukti menunjukkan non-operating receivable.",
  },
  {
    category: "EMPLOYEE_RECEIVABLE",
    displayName: "Employee Receivable",
    aliases: ["employee receivable", "piutang karyawan", "piutang pegawai", "pinjaman karyawan", "pinjaman pegawai"],
    includeKeywords: ["employee receivable", "piutang karyawan", "piutang pegawai", "pinjaman karyawan", "pinjaman pegawai", "karyawan", "pegawai", "employee"],
    treatment: "non_operating",
    valuationImpact: ["AAM", "non-operating asset bridge"],
    reviewNote: "Umumnya dikeluarkan dari operating working capital dan ditambahkan sebagai non-operating asset.",
  },
  {
    category: "INVENTORY",
    displayName: "Inventory",
    aliases: ["inventory", "persediaan", "stock", "stok", "barang persediaan"],
    includeKeywords: ["inventory", "persediaan", "stock", "stok", "barang persediaan"],
    treatment: "operating",
    valuationImpact: ["AAM", "working capital", "DCF WC days"],
    reviewNote: "Operating current asset untuk working capital kecuali ada bukti obsolete/non-operating.",
  },
  {
    category: "FIXED_ASSET",
    displayName: "Fixed Asset",
    aliases: ["fixed asset", "aset tetap", "aktiva tetap", "bangunan mess", "inventaris bangunan mess", "invt bangunan mess", "kendaraan", "alat berat", "tanah", "lahan sawit"],
    includeKeywords: ["fixed asset", "aset tetap", "aktiva tetap", "asset", "aset", "aktiva", "bangunan", "inventaris", "kendaraan", "tanah", "lahan", "alat berat"],
    excludeKeywords: ["perolehan", "acquisition", "purchase", "pembelian", "harga"],
    treatment: "operating",
    valuationImpact: ["AAM", "EEM NTA", "DCF invested capital"],
    reviewNote: "Perlakukan sebagai operating kecuali ada bukti idle atau non-operating fixed assets.",
  },
  {
    category: "NON_OPERATING_FIXED_ASSETS",
    displayName: "Non-Operating Fixed Assets",
    aliases: ["non operating fixed assets", "aset tetap non operasional", "aktiva tetap non operasional", "aset idle", "idle asset"],
    includeKeywords: ["non operating", "non operasional", "idle"],
    treatment: "non_operating",
    valuationImpact: ["AAM", "EEM bridge", "DCF bridge"],
    reviewNote: "Tambahkan di luar operating NTA jika asset idle atau tidak diperlukan untuk earning power.",
  },
  {
    category: "FIXED_ASSET_ACQUISITION",
    displayName: "Fixed Asset Acquisition",
    aliases: ["harga perolehan", "acquisition cost", "purchase fixed asset", "pembelian aset tetap", "perolehan aset tetap", "nilai perolehan aset tetap"],
    includeKeywords: ["harga perolehan", "acquisition cost", "perolehan aset tetap", "perolehan", "acquisition", "purchase", "pembelian"],
    treatment: "operating",
    valuationImpact: ["fixed asset schedule", "AAM support", "DCF capex support"],
    reviewNote: "Gunakan bersama accumulated depreciation untuk menurunkan fixed asset net value jika net value tidak tersedia.",
  },
  {
    category: "ACCUMULATED_DEPRECIATION",
    displayName: "Accumulated Depreciation",
    aliases: ["accumulated depreciation", "akumulasi penyusutan", "akumulasi depresiasi", "acc dep", "akm penyusutan"],
    includeKeywords: ["accumulated depreciation", "akumulasi penyusutan", "akumulasi depresiasi", "akumulasi", "accumulated"],
    treatment: "operating",
    valuationImpact: ["fixed asset schedule", "AAM support", "EEM NTA support"],
    reviewNote: "Kurangkan dari acquisition cost jika fixed asset net value tidak tersedia langsung.",
  },
  {
    category: "DEPRECIATION_EXPENSE",
    displayName: "Depreciation Expense",
    aliases: ["depreciation expense", "depreciation", "depresiasi", "beban penyusutan", "biaya penyusutan", "beban depresiasi", "biaya depresiasi", "penyusutan"],
    includeKeywords: ["depreciation expense", "beban penyusutan", "biaya penyusutan", "beban depresiasi", "biaya depresiasi", "penyusutan", "depreciation", "depresiasi"],
    excludeKeywords: ["akumulasi", "accumulated"],
    treatment: "operating",
    valuationImpact: ["EBIT", "DCF depreciation margin"],
    reviewNote: "Operating non-cash expense untuk EBIT dan proxy DCF maintenance capex.",
  },
  {
    category: "INTANGIBLE_ASSETS",
    displayName: "Intangible Assets",
    aliases: ["intangible assets", "aset tak berwujud", "aktiva tak berwujud", "software", "hak guna", "license", "lisensi"],
    includeKeywords: ["tak berwujud", "intangible", "software", "license", "lisensi", "hak guna"],
    treatment: "review",
    valuationImpact: ["AAM", "NTA exclusion review"],
    reviewNote: "Akui untuk AAM, tetapi tinjau pengecualian dari tangible operating asset base untuk EEM.",
  },
  {
    category: "TOTAL_LIABILITIES",
    displayName: "Total Liabilities",
    aliases: ["total liabilities", "jumlah kewajiban", "total kewajiban", "total liabilitas", "jumlah liabilitas"],
    includeKeywords: ["total liabilities", "jumlah kewajiban", "total kewajiban", "total liabilitas", "jumlah liabilitas", "liabilities"],
    treatment: "liability",
    valuationImpact: ["AAM"],
    reviewNote: "Gunakan sebagai override total liabilities hanya jika rincian komponen liability tidak tersedia atau sudah direkonsiliasi.",
  },
  {
    category: "CURRENT_LIABILITIES",
    displayName: "Current Liabilities",
    aliases: ["current liabilities", "kewajiban lancar", "liabilitas lancar"],
    includeKeywords: ["current liabilities", "kewajiban lancar", "liabilitas lancar"],
    treatment: "liability",
    valuationImpact: ["AAM", "working capital support"],
    reviewNote: "Petakan ke kategori liability yang lebih rinci jika subledger tersedia.",
  },
  {
    category: "ACCOUNT_PAYABLE",
    displayName: "Account Payable",
    aliases: ["account payable", "accounts payable", "utang usaha", "hutang usaha", "utang dagang", "hutang dagang", "trade payable"],
    includeKeywords: ["account payable", "accounts payable", "utang usaha", "hutang usaha", "utang dagang", "hutang dagang", "trade payable", "payable"],
    treatment: "operating",
    valuationImpact: ["AAM", "working capital", "DCF WC days"],
    reviewNote: "Operating current liability untuk working capital.",
  },
  {
    category: "TAX_PAYABLE",
    displayName: "Tax Payable",
    aliases: ["tax payable", "utang pajak", "hutang pajak", "pajak terutang", "pph pasal 29", "ppn"],
    includeKeywords: ["tax payable", "utang pajak", "hutang pajak", "pajak terutang", "pajak", "tax", "pph", "ppn"],
    treatment: "liability",
    valuationImpact: ["AAM", "debt-like sensitivity"],
    reviewNote: "Liability untuk AAM; keluarkan dari operating WC kecuali ada justifikasi khusus.",
  },
  {
    category: "OTHER_PAYABLE",
    displayName: "Other Payable",
    aliases: ["other payable", "utang lain-lain", "hutang lain-lain", "utang lainnya", "hutang lainnya", "accrued expense"],
    includeKeywords: ["other payable", "utang lain", "hutang lain", "utang lainnya", "hutang lainnya", "accrued"],
    treatment: "operating",
    valuationImpact: ["AAM", "working capital", "DCF WC days"],
    reviewNote: "Tinjau apakah merupakan operating payable atau debt-like payable.",
  },
  {
    category: "BANK_LOAN_SHORT_TERM",
    displayName: "Bank Loan - Short Term",
    aliases: ["bank loan short term", "pinjaman bank jangka pendek", "utang bank jangka pendek", "hutang bank jangka pendek"],
    includeKeywords: ["bank", "loan", "pinjaman", "hutang", "utang", "short", "pendek"],
    treatment: "debt",
    valuationImpact: ["interest bearing debt", "EV to equity bridge"],
    reviewNote: "Keluarkan dari operating working capital; kurangkan sebagai debt jika saldo tidak nol.",
  },
  {
    category: "BANK_LOAN_LONG_TERM",
    displayName: "Bank Loan - Long Term",
    aliases: ["bank loan long term", "pinjaman bank jangka panjang", "utang bank jangka panjang", "hutang bank jangka panjang"],
    includeKeywords: ["bank", "loan", "pinjaman", "hutang", "utang", "long", "panjang"],
    treatment: "debt",
    valuationImpact: ["interest bearing debt", "EV to equity bridge"],
    reviewNote: "Keluarkan dari operating working capital; kurangkan sebagai debt jika saldo tidak nol.",
  },
  {
    category: "INTEREST_PAYABLE",
    displayName: "Interest Payable",
    aliases: ["interest payable", "utang bunga", "hutang bunga", "bunga masih harus dibayar", "bunga pinjaman masih harus dibayar", "accrued interest"],
    includeKeywords: ["bunga", "interest", "harus dibayar", "accrued"],
    treatment: "liability",
    valuationImpact: ["AAM", "debt-like liability review"],
    reviewNote: "Liability item; tinjau apakah perlu dimasukkan dalam debt-like adjustments.",
  },
  {
    category: "INTEREST_BEARING_DEBT",
    displayName: "Interest-Bearing Debt",
    aliases: ["interest bearing debt", "interest-bearing debt", "utang berbunga", "hutang berbunga", "pinjaman berbunga"],
    includeKeywords: ["berbunga", "interest bearing", "pinjaman"],
    treatment: "debt",
    valuationImpact: ["EV to equity bridge"],
    reviewNote: "Debt-like financing balance; keluarkan dari operating working capital.",
  },
  {
    category: "MODAL_DISETOR",
    displayName: "Modal Disetor",
    aliases: ["modal disetor", "paid up capital", "paid-up capital", "share capital", "capital stock"],
    includeKeywords: ["modal", "disetor", "capital"],
    excludeKeywords: ["penambahan", "additional", "agio"],
    treatment: "equity",
    valuationImpact: ["balance sheet check", "equity roll-forward"],
    reviewNote: "Equity component untuk rekonsiliasi; jangan gunakan sebagai enterprise-to-equity bridge item.",
  },
  {
    category: "PENAMBAHAN_MODAL_DISETOR",
    displayName: "Penambahan Modal Disetor",
    aliases: ["penambahan modal disetor", "additional paid in capital", "additional paid-in capital", "agio saham"],
    includeKeywords: ["penambahan", "additional", "agio"],
    treatment: "equity",
    valuationImpact: ["balance sheet check", "equity roll-forward"],
    reviewNote: "Equity component; perlakuan cash-flow sebaiknya memakai movement periode, bukan ending balance.",
  },
  {
    category: "RETAINED_EARNINGS_SURPLUS",
    displayName: "Retained Earnings Surplus",
    aliases: ["retained earnings surplus", "saldo laba", "laba ditahan"],
    includeKeywords: ["retained", "saldo laba", "laba ditahan"],
    treatment: "equity",
    valuationImpact: ["balance sheet check"],
    reviewNote: "Equity reconciliation account; bukan operating earning-power driver.",
  },
  {
    category: "RETAINED_EARNINGS_CURRENT_PROFIT",
    displayName: "Retained Earnings Current Profit",
    aliases: ["retained earnings current profit", "laba tahun berjalan", "laba periode berjalan"],
    includeKeywords: ["laba", "berjalan", "current profit"],
    treatment: "equity",
    valuationImpact: ["balance sheet check", "commercial/fiscal basis review"],
    reviewNote: "Tinjau basis commercial versus fiscal sebelum digunakan sebagai earning power.",
  },
  {
    category: "REVENUE",
    displayName: "Revenue",
    aliases: [
      "revenue",
      "sales",
      "net sales",
      "operating revenue",
      "penjualan",
      "penjualan bersih",
      "pendapatan",
      "pendapatan usaha",
      "pendapatan operasional",
      "penghasilan",
      "penghasilan usaha",
      "penghasilan operasional",
      "omzet",
      "omset",
      "peredaran usaha",
    ],
    includeKeywords: [
      "revenue",
      "sales",
      "net sales",
      "operating revenue",
      "penjualan",
      "penjualan bersih",
      "pendapatan usaha",
      "pendapatan operasional",
      "penghasilan usaha",
      "penghasilan operasional",
      "pendapatan",
      "penghasilan",
      "omzet",
      "omset",
      "peredaran usaha",
    ],
    excludeKeywords: ["beban", "biaya", "expense", "cost", "pokok", "interest", "bunga", "lain", "other", "non operating", "jasa giro", "deposito"],
    treatment: "operating",
    valuationImpact: ["DCF forecast driver", "margins"],
    reviewNote: "Gunakan commercial revenue sebagai operating driver.",
  },
  {
    category: "COST_OF_GOOD_SOLD",
    displayName: "Cost of Good Sold",
    aliases: ["cost of good sold", "cost of goods sold", "cogs", "hpp", "beban pokok penjualan", "beban pokok", "harga pokok penjualan", "harga pokok", "pupuk", "obat-obatan", "tbs"],
    includeKeywords: ["cost of good sold", "cost of goods sold", "cogs", "hpp", "beban pokok", "harga pokok", "pokok", "pupuk", "obat", "tbs"],
    treatment: "operating",
    valuationImpact: ["EBIT", "DCF margin"],
    reviewNote: "Operating cost; pertahankan sign convention secara konsisten.",
  },
  {
    category: "SELLING_EXPENSE",
    displayName: "Selling Expense",
    aliases: ["selling expense", "sales expense", "beban penjualan", "biaya penjualan", "selling"],
    includeKeywords: ["selling expense", "sales expense", "beban penjualan", "biaya penjualan", "selling"],
    excludeKeywords: ["revenue", "sales", "pendapatan"],
    treatment: "operating",
    valuationImpact: ["EBIT", "DCF margin"],
    reviewNote: "Operating expense; pertahankan sign convention secara konsisten.",
  },
  {
    category: "GENERAL_ADMINISTRATIVE_OVERHEADS",
    displayName: "General & Administrative Overheads",
    aliases: ["general administrative overheads", "general and administrative", "g&a", "administrasi", "beban administrasi", "biaya administrasi", "beban umum", "biaya umum", "overheads", "bbm", "stnk", "pbb", "notaris"],
    includeKeywords: ["general administrative", "general and administrative", "beban administrasi", "biaya administrasi", "beban umum", "biaya umum", "administrasi", "overhead", "bbm", "stnk", "pbb", "notaris", "listrik", "kantor"],
    treatment: "operating",
    valuationImpact: ["EBIT", "DCF margin"],
    reviewNote: "Operating expense yang mengecualikan financing dan non-operating items.",
  },
  {
    category: "EBIT",
    displayName: "EBIT",
    aliases: ["ebit", "laba usaha", "operating profit", "laba operasi"],
    includeKeywords: ["ebit", "laba usaha", "operating profit", "laba operasi"],
    treatment: "operating",
    valuationImpact: ["NOPLAT", "DCF"],
    reviewNote: "Gunakan commercial EBIT sebagai override ketika komponen income statement tidak lengkap.",
  },
  {
    category: "COMMERCIAL_NPAT",
    displayName: "Commercial NPAT",
    aliases: ["laba bersih komersial", "commercial npat", "net profit after tax", "laba setelah pajak", "laba bersih", "net income"],
    includeKeywords: ["laba bersih komersial", "commercial npat", "net profit after tax", "laba setelah pajak", "laba bersih", "npat", "net profit", "net income"],
    treatment: "operating",
    valuationImpact: ["earning power support", "retained earnings support"],
    reviewNote: "Gunakan commercial profit saja; jangan gunakan fiscal reconciliation sebagai earning power.",
  },
  {
    category: "INTEREST_INCOME",
    displayName: "Interest Income",
    aliases: ["interest income", "pendapatan bunga", "penghasilan bunga", "jasa giro", "bunga deposito", "pendapatan deposito", "penghasilan deposito", "bagi hasil bank"],
    includeKeywords: ["interest income", "pendapatan bunga", "penghasilan bunga", "jasa giro", "bunga deposito", "pendapatan deposito", "penghasilan deposito", "bagi hasil"],
    excludeKeywords: ["beban", "expense", "biaya"],
    treatment: "non_operating",
    valuationImpact: ["NOPLAT exclusion", "surplus asset support"],
    reviewNote: "Keluarkan dari operating NOPLAT; dapat mendukung deposit sebagai surplus asset.",
  },
  {
    category: "INTEREST_EXPENSE",
    displayName: "Interest Expense",
    aliases: ["interest expense", "beban bunga", "biaya bunga", "beban jasa giro", "beban pinjaman", "biaya pinjaman"],
    includeKeywords: ["interest expense", "beban bunga", "biaya bunga", "beban pinjaman", "biaya pinjaman"],
    treatment: "financing",
    valuationImpact: ["NOPLAT exclusion", "debt review"],
    reviewNote: "Keluarkan dari operating NOPLAT dan tinjau apakah related debt tersedia.",
  },
  {
    category: "NON_OPERATING_INCOME",
    displayName: "Non Operating Income",
    aliases: ["non operating income", "non-operating income", "pendapatan lain-lain", "penghasilan lain-lain", "pendapatan lainnya", "penghasilan lainnya", "beban lain-lain", "biaya lain-lain", "other income", "other expense"],
    includeKeywords: ["non operating income", "non-operating income", "pendapatan lain", "penghasilan lain", "beban lain", "biaya lain", "other income", "other expense", "non operating"],
    treatment: "non_operating",
    valuationImpact: ["NOPLAT exclusion", "CFI review"],
    reviewNote: "Keluarkan dari operating earning power.",
  },
];

export function normalizeAccountLabel(label: string): string {
  return label
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\binvt\b/g, "inventaris")
    .replace(/\binv\b/g, "inventaris")
    .replace(/\s+/g, " ")
    .trim();
}

export function mapAccount(sourceLabel: string, statement?: StatementContext): AccountMappingResult {
  const normalizedLabel = normalizeAccountLabel(sourceLabel);

  if (!normalizedLabel) {
    return {
      sourceLabel,
      normalizedLabel,
      category: "UNMAPPED",
      displayName: "Unmapped",
      confidence: 0,
      treatment: "review",
      valuationImpact: ["mapping review"],
      reason: "Nama akun masih kosong.",
      needsReview: true,
    };
  }

  const scored = accountMappingRules.map((rule) => {
    const aliasMatches = rule.aliases.map(normalizeAccountLabel).filter((alias) => containsNormalizedPhrase(normalizedLabel, alias));
    const exactAliasHit = rule.aliases.some((alias) => normalizedLabel === normalizeAccountLabel(alias));
    const aliasHit = aliasMatches.length > 0;
    const includeHits = rule.includeKeywords.filter((keyword) => containsNormalizedPhrase(normalizedLabel, keyword)).length;
    const excluded = rule.excludeKeywords?.some((keyword) => containsNormalizedPhrase(normalizedLabel, keyword)) ?? false;
    const statementCompatible = isStatementCompatible(rule.category, statement);
    const lexicalMatch = aliasHit || includeHits > 0;
    const specificityBoost = Math.min(longestPhraseLength(aliasMatches) * 0.04, 0.16);
    const rawScore = lexicalMatch
      ? (exactAliasHit ? 0.82 : aliasHit ? 0.56 : 0) +
        Math.min(includeHits * 0.11, 0.28) +
        specificityBoost -
        (excluded ? 0.52 : 0) +
        (statementCompatible === true ? 0.06 : 0) -
        (statementCompatible === false ? 0.55 : 0)
      : 0;

    return {
      rule,
      confidence: Math.max(0, Math.min(0.99, rawScore)),
      exactAliasHit,
      aliasHit,
      includeHits,
      excluded,
      lexicalMatch,
      statementCompatible,
    };
  });

  const ranked = scored.sort((a, b) => b.confidence - a.confidence);
  const best = ranked[0];
  const runnerUp = ranked.find((candidate) => candidate.rule.category !== best?.rule.category && candidate.confidence > 0);
  const confidence = best?.confidence ?? 0;
  const rule = best?.rule ?? accountMappingRules[0];
  const ambiguousMatch = Boolean(runnerUp && confidence >= 0.45 && confidence - runnerUp.confidence <= 0.12);

  if (!best || !best.lexicalMatch || confidence === 0) {
    return {
      sourceLabel,
      normalizedLabel,
      category: "UNMAPPED",
      displayName: "Unmapped",
      confidence: 0,
      treatment: "review",
      valuationImpact: ["mapping review"],
      reason: "Tidak ada alias atau keyword yang cocok. Tinjauan kategori manual diperlukan.",
      needsReview: true,
    };
  }

  return {
    sourceLabel,
    normalizedLabel,
    category: rule.category,
    displayName: rule.displayName,
    confidence,
    treatment: rule.treatment,
    valuationImpact: rule.valuationImpact,
    reason: `${best.exactAliasHit ? "Alias persis cocok" : best.aliasHit ? "Alias cocok" : "Keyword cocok"} dengan ${best.includeHits} keyword hit.${
      ambiguousMatch ? ` Kandidat lain dekat: ${runnerUp?.rule.displayName}.` : ""
    } ${rule.reviewNote}`,
    needsReview: confidence < 0.72 || best.excluded || best.statementCompatible === false || ambiguousMatch,
  };
}

function containsNormalizedPhrase(label: string, phrase: string): boolean {
  const normalizedPhrase = normalizeAccountLabel(phrase);

  if (!normalizedPhrase) {
    return false;
  }

  return ` ${label} `.includes(` ${normalizedPhrase} `);
}

function longestPhraseLength(phrases: string[]): number {
  return phrases.reduce((longest, phrase) => Math.max(longest, phrase.split(" ").length - 1), 0);
}

function isStatementCompatible(category: string, statement?: StatementContext): boolean | null {
  if (!statement) {
    return null;
  }

  if (statement === "balance_sheet") {
    return balanceSheetCategories.has(category);
  }

  if (statement === "income_statement") {
    return incomeStatementCategories.has(category);
  }

  return fixedAssetCategories.has(category);
}
