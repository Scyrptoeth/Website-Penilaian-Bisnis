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
    includeKeywords: ["total", "jumlah", "aset", "assets", "aktiva"],
    treatment: "review",
    valuationImpact: ["AAM"],
    reviewNote: "Use as total assets override only when component-level assets are unavailable or reconciled.",
  },
  {
    category: "CURRENT_ASSET",
    displayName: "Current Asset",
    aliases: ["current asset", "aset lancar", "aktiva lancar"],
    includeKeywords: ["lancar", "current"],
    treatment: "review",
    valuationImpact: ["AAM", "working capital support"],
    reviewNote: "Map to detailed current asset categories when subledger is available.",
  },
  {
    category: "CASH_ON_HAND",
    displayName: "Cash on Hand",
    aliases: ["cash on hand", "cash on hands", "kas", "kas kecil", "uang kas"],
    includeKeywords: ["cash", "kas"],
    excludeKeywords: ["bank", "deposito", "deposit"],
    treatment: "review",
    valuationImpact: ["AAM", "surplus asset sensitivity", "minimum operating cash"],
    reviewNote: "Cash on hand may be operating cash; review minimum operating cash before treating all as surplus.",
  },
  {
    category: "CASH_ON_BANK",
    displayName: "Cash on Bank / Deposit",
    aliases: ["cash on bank", "bank", "deposito", "deposit", "giro", "rekening bank"],
    includeKeywords: ["bank", "deposito", "deposit", "giro"],
    treatment: "non_operating",
    valuationImpact: ["AAM", "EEM bridge", "DCF bridge", "marketable securities review"],
    reviewNote: "Separate operating bank account from deposit/investment when subledger is available.",
  },
  {
    category: "EXCESS_CASH",
    displayName: "Excess Cash",
    aliases: ["excess cash", "kas berlebih", "kelebihan kas", "cash surplus operasi"],
    includeKeywords: ["excess", "berlebih", "kelebihan", "surplus"],
    treatment: "non_operating",
    valuationImpact: ["EEM bridge", "DCF bridge", "surplus asset sensitivity"],
    reviewNote: "Treat as non-operating only when minimum operating cash has been considered.",
  },
  {
    category: "SURPLUS_ASSET_CASH",
    displayName: "Surplus Asset Cash",
    aliases: ["surplus asset cash", "kas surplus", "surplus kas", "kas non operasional"],
    includeKeywords: ["surplus", "kas", "cash", "non operasional"],
    treatment: "non_operating",
    valuationImpact: ["EEM bridge", "DCF bridge"],
    reviewNote: "Cash-like surplus asset added in the EV-to-equity bridge after operating cash review.",
  },
  {
    category: "MARKETABLE_SECURITIES",
    displayName: "Marketable Securities",
    aliases: ["marketable securities", "surat berharga", "efek", "investasi jangka pendek", "deposito investasi"],
    includeKeywords: ["surat berharga", "marketable", "securities", "efek", "investasi"],
    treatment: "non_operating",
    valuationImpact: ["AAM", "EEM bridge", "DCF bridge"],
    reviewNote: "Usually non-operating unless needed for ordinary operations.",
  },
  {
    category: "ACCOUNT_RECEIVABLE",
    displayName: "Account Receivable",
    aliases: ["account receivable", "piutang usaha", "trade receivable", "receivable"],
    includeKeywords: ["piutang", "receivable"],
    excludeKeywords: ["karyawan", "employee"],
    treatment: "operating",
    valuationImpact: ["AAM", "working capital", "DCF WC days"],
    reviewNote: "Operating current asset unless evidence indicates non-operating receivable.",
  },
  {
    category: "EMPLOYEE_RECEIVABLE",
    displayName: "Employee Receivable",
    aliases: ["employee receivable", "piutang karyawan", "piutang pegawai"],
    includeKeywords: ["piutang", "karyawan", "pegawai", "employee"],
    treatment: "non_operating",
    valuationImpact: ["AAM", "non-operating asset bridge"],
    reviewNote: "Usually excluded from operating working capital and added as non-operating asset.",
  },
  {
    category: "INVENTORY",
    displayName: "Inventory",
    aliases: ["inventory", "persediaan", "stock", "stok"],
    includeKeywords: ["inventory", "persediaan", "stock", "stok"],
    treatment: "operating",
    valuationImpact: ["AAM", "working capital", "DCF WC days"],
    reviewNote: "Operating current asset for working capital unless obsolete/non-operating evidence exists.",
  },
  {
    category: "FIXED_ASSET",
    displayName: "Fixed Asset",
    aliases: ["fixed asset", "aset tetap", "aktiva tetap", "bangunan mess", "inventaris bangunan mess", "invt bangunan mess", "kendaraan", "alat berat", "tanah", "lahan sawit"],
    includeKeywords: ["asset", "aset", "aktiva", "bangunan", "inventaris", "kendaraan", "tanah", "lahan", "alat berat"],
    excludeKeywords: ["perolehan", "acquisition", "purchase", "pembelian", "harga"],
    treatment: "operating",
    valuationImpact: ["AAM", "EEM NTA", "DCF invested capital"],
    reviewNote: "Treat as operating unless evidence identifies idle or non-operating fixed assets.",
  },
  {
    category: "NON_OPERATING_FIXED_ASSETS",
    displayName: "Non-Operating Fixed Assets",
    aliases: ["non operating fixed assets", "aset tetap non operasional", "aktiva tetap non operasional", "aset idle", "idle asset"],
    includeKeywords: ["non operating", "non operasional", "idle"],
    treatment: "non_operating",
    valuationImpact: ["AAM", "EEM bridge", "DCF bridge"],
    reviewNote: "Add outside operating NTA when the asset is idle or not required for earning power.",
  },
  {
    category: "FIXED_ASSET_ACQUISITION",
    displayName: "Fixed Asset Acquisition",
    aliases: ["harga perolehan", "acquisition cost", "purchase fixed asset", "pembelian aset tetap", "perolehan aset tetap"],
    includeKeywords: ["perolehan", "acquisition", "purchase", "pembelian"],
    treatment: "operating",
    valuationImpact: ["fixed asset schedule", "AAM support", "DCF capex support"],
    reviewNote: "Use with accumulated depreciation to derive fixed asset net value when net value is unavailable.",
  },
  {
    category: "ACCUMULATED_DEPRECIATION",
    displayName: "Accumulated Depreciation",
    aliases: ["accumulated depreciation", "akumulasi penyusutan", "acc dep", "akm penyusutan"],
    includeKeywords: ["akumulasi", "accumulated", "penyusutan", "depreciation"],
    treatment: "operating",
    valuationImpact: ["fixed asset schedule", "AAM support", "EEM NTA support"],
    reviewNote: "Subtract from acquisition cost if fixed asset net value is not directly available.",
  },
  {
    category: "DEPRECIATION_EXPENSE",
    displayName: "Depreciation Expense",
    aliases: ["depreciation expense", "beban penyusutan", "biaya penyusutan", "penyusutan"],
    includeKeywords: ["penyusutan", "depreciation"],
    excludeKeywords: ["akumulasi", "accumulated"],
    treatment: "operating",
    valuationImpact: ["EBIT", "DCF depreciation margin"],
    reviewNote: "Operating non-cash expense for EBIT and DCF maintenance capex proxy.",
  },
  {
    category: "INTANGIBLE_ASSETS",
    displayName: "Intangible Assets",
    aliases: ["intangible assets", "aset tak berwujud", "aktiva tak berwujud", "software", "hak guna", "license", "lisensi"],
    includeKeywords: ["tak berwujud", "intangible", "software", "license", "lisensi", "hak guna"],
    treatment: "review",
    valuationImpact: ["AAM", "NTA exclusion review"],
    reviewNote: "Recognize for AAM, but review exclusion from tangible operating asset base for EEM.",
  },
  {
    category: "TOTAL_LIABILITIES",
    displayName: "Total Liabilities",
    aliases: ["total liabilities", "jumlah kewajiban", "total kewajiban", "total liabilitas", "jumlah liabilitas"],
    includeKeywords: ["total", "jumlah", "kewajiban", "liabilitas", "liabilities"],
    treatment: "liability",
    valuationImpact: ["AAM"],
    reviewNote: "Use as total liabilities override only when component-level liabilities are unavailable or reconciled.",
  },
  {
    category: "CURRENT_LIABILITIES",
    displayName: "Current Liabilities",
    aliases: ["current liabilities", "kewajiban lancar", "liabilitas lancar"],
    includeKeywords: ["lancar", "liabilitas", "kewajiban"],
    treatment: "liability",
    valuationImpact: ["AAM", "working capital support"],
    reviewNote: "Map to detailed liability categories when subledger is available.",
  },
  {
    category: "ACCOUNT_PAYABLE",
    displayName: "Account Payable",
    aliases: ["account payable", "utang usaha", "hutang usaha", "trade payable"],
    includeKeywords: ["utang usaha", "hutang usaha", "payable"],
    treatment: "operating",
    valuationImpact: ["AAM", "working capital", "DCF WC days"],
    reviewNote: "Operating current liability for working capital.",
  },
  {
    category: "TAX_PAYABLE",
    displayName: "Tax Payable",
    aliases: ["tax payable", "utang pajak", "hutang pajak", "pph pasal 29", "ppn"],
    includeKeywords: ["pajak", "tax", "pph", "ppn"],
    treatment: "liability",
    valuationImpact: ["AAM", "debt-like sensitivity"],
    reviewNote: "Liability for AAM; exclude from operating WC unless specifically justified.",
  },
  {
    category: "OTHER_PAYABLE",
    displayName: "Other Payable",
    aliases: ["other payable", "utang lain-lain", "hutang lain-lain", "accrued expense"],
    includeKeywords: ["utang lain", "hutang lain", "accrued"],
    treatment: "operating",
    valuationImpact: ["AAM", "working capital", "DCF WC days"],
    reviewNote: "Review whether operating payable or debt-like payable.",
  },
  {
    category: "BANK_LOAN_SHORT_TERM",
    displayName: "Bank Loan - Short Term",
    aliases: ["bank loan short term", "pinjaman bank jangka pendek", "utang bank jangka pendek", "hutang bank jangka pendek"],
    includeKeywords: ["bank", "loan", "pinjaman", "hutang", "utang", "short", "pendek"],
    treatment: "debt",
    valuationImpact: ["interest bearing debt", "EV to equity bridge"],
    reviewNote: "Exclude from operating working capital; subtract as debt if balance is nonzero.",
  },
  {
    category: "BANK_LOAN_LONG_TERM",
    displayName: "Bank Loan - Long Term",
    aliases: ["bank loan long term", "pinjaman bank jangka panjang", "utang bank jangka panjang", "hutang bank jangka panjang"],
    includeKeywords: ["bank", "loan", "pinjaman", "hutang", "utang", "long", "panjang"],
    treatment: "debt",
    valuationImpact: ["interest bearing debt", "EV to equity bridge"],
    reviewNote: "Exclude from operating working capital; subtract as debt if balance is nonzero.",
  },
  {
    category: "INTEREST_PAYABLE",
    displayName: "Interest Payable",
    aliases: ["interest payable", "utang bunga", "hutang bunga", "bunga masih harus dibayar", "bunga pinjaman masih harus dibayar", "accrued interest"],
    includeKeywords: ["bunga", "interest", "harus dibayar", "accrued"],
    treatment: "liability",
    valuationImpact: ["AAM", "debt-like liability review"],
    reviewNote: "Liability item; review whether it should be included in debt-like adjustments.",
  },
  {
    category: "INTEREST_BEARING_DEBT",
    displayName: "Interest-Bearing Debt",
    aliases: ["interest bearing debt", "interest-bearing debt", "utang berbunga", "hutang berbunga", "pinjaman berbunga"],
    includeKeywords: ["berbunga", "interest bearing", "pinjaman"],
    treatment: "debt",
    valuationImpact: ["EV to equity bridge"],
    reviewNote: "Debt-like financing balance; exclude from operating working capital.",
  },
  {
    category: "MODAL_DISETOR",
    displayName: "Modal Disetor",
    aliases: ["modal disetor", "paid up capital", "paid-up capital", "share capital", "capital stock"],
    includeKeywords: ["modal", "disetor", "capital"],
    excludeKeywords: ["penambahan", "additional", "agio"],
    treatment: "equity",
    valuationImpact: ["balance sheet check", "equity roll-forward"],
    reviewNote: "Equity component for reconciliation; do not use as enterprise-to-equity bridge item.",
  },
  {
    category: "PENAMBAHAN_MODAL_DISETOR",
    displayName: "Penambahan Modal Disetor",
    aliases: ["penambahan modal disetor", "additional paid in capital", "additional paid-in capital", "agio saham"],
    includeKeywords: ["penambahan", "additional", "agio"],
    treatment: "equity",
    valuationImpact: ["balance sheet check", "equity roll-forward"],
    reviewNote: "Equity component; cash-flow treatment should use period movement, not ending balance.",
  },
  {
    category: "RETAINED_EARNINGS_SURPLUS",
    displayName: "Retained Earnings Surplus",
    aliases: ["retained earnings surplus", "saldo laba", "laba ditahan"],
    includeKeywords: ["retained", "saldo laba", "laba ditahan"],
    treatment: "equity",
    valuationImpact: ["balance sheet check"],
    reviewNote: "Equity reconciliation account; not an operating earning-power driver.",
  },
  {
    category: "RETAINED_EARNINGS_CURRENT_PROFIT",
    displayName: "Retained Earnings Current Profit",
    aliases: ["retained earnings current profit", "laba tahun berjalan", "laba periode berjalan"],
    includeKeywords: ["laba", "berjalan", "current profit"],
    treatment: "equity",
    valuationImpact: ["balance sheet check", "commercial/fiscal basis review"],
    reviewNote: "Review commercial versus fiscal basis before using as earning power.",
  },
  {
    category: "REVENUE",
    displayName: "Revenue",
    aliases: ["revenue", "sales", "penjualan", "pendapatan usaha"],
    includeKeywords: ["revenue", "sales", "penjualan", "pendapatan"],
    excludeKeywords: ["beban", "biaya", "pokok", "interest", "bunga", "lain"],
    treatment: "operating",
    valuationImpact: ["DCF forecast driver", "margins"],
    reviewNote: "Use commercial revenue as operating driver.",
  },
  {
    category: "COST_OF_GOOD_SOLD",
    displayName: "Cost of Good Sold",
    aliases: ["cost of good sold", "cogs", "hpp", "beban pokok", "harga pokok", "pupuk", "obat-obatan", "tbs"],
    includeKeywords: ["cogs", "hpp", "pokok", "pupuk", "obat", "tbs"],
    treatment: "operating",
    valuationImpact: ["EBIT", "DCF margin"],
    reviewNote: "Operating cost; preserve sign convention consistently.",
  },
  {
    category: "SELLING_EXPENSE",
    displayName: "Selling Expense",
    aliases: ["selling expense", "beban penjualan", "biaya penjualan", "selling"],
    includeKeywords: ["selling", "penjualan"],
    excludeKeywords: ["revenue", "sales", "pendapatan"],
    treatment: "operating",
    valuationImpact: ["EBIT", "DCF margin"],
    reviewNote: "Operating expense; preserve sign convention consistently.",
  },
  {
    category: "GENERAL_ADMINISTRATIVE_OVERHEADS",
    displayName: "General & Administrative Overheads",
    aliases: ["general administrative overheads", "g&a", "administrasi", "overheads", "bbm", "stnk", "pbb", "notaris"],
    includeKeywords: ["administrasi", "overhead", "bbm", "stnk", "pbb", "notaris", "listrik", "kantor"],
    treatment: "operating",
    valuationImpact: ["EBIT", "DCF margin"],
    reviewNote: "Operating expense excluding financing and non-operating items.",
  },
  {
    category: "EBIT",
    displayName: "EBIT",
    aliases: ["ebit", "laba usaha", "operating profit", "laba operasi"],
    includeKeywords: ["ebit", "laba usaha", "operating profit", "laba operasi"],
    treatment: "operating",
    valuationImpact: ["NOPLAT", "DCF"],
    reviewNote: "Use commercial EBIT as override when income statement components are incomplete.",
  },
  {
    category: "COMMERCIAL_NPAT",
    displayName: "Commercial NPAT",
    aliases: ["laba bersih komersial", "commercial npat", "net profit after tax", "laba setelah pajak"],
    includeKeywords: ["laba bersih", "npat", "net profit"],
    treatment: "operating",
    valuationImpact: ["earning power support", "retained earnings support"],
    reviewNote: "Use commercial profit only; do not use fiscal reconciliation as earning power.",
  },
  {
    category: "INTEREST_INCOME",
    displayName: "Interest Income",
    aliases: ["interest income", "pendapatan bunga", "jasa giro", "bunga deposito", "bagi hasil bank"],
    includeKeywords: ["interest income", "bunga", "jasa giro", "deposito", "bagi hasil"],
    excludeKeywords: ["beban", "expense", "biaya"],
    treatment: "non_operating",
    valuationImpact: ["NOPLAT exclusion", "surplus asset support"],
    reviewNote: "Exclude from operating NOPLAT; can support deposit as surplus asset.",
  },
  {
    category: "INTEREST_EXPENSE",
    displayName: "Interest Expense",
    aliases: ["interest expense", "beban bunga", "beban jasa giro", "beban pinjaman"],
    includeKeywords: ["interest expense", "beban bunga", "jasa giro", "pinjaman"],
    treatment: "financing",
    valuationImpact: ["NOPLAT exclusion", "debt review"],
    reviewNote: "Exclude from operating NOPLAT and review whether related debt exists.",
  },
  {
    category: "NON_OPERATING_INCOME",
    displayName: "Non Operating Income",
    aliases: ["non operating income", "pendapatan lain-lain", "beban lain-lain", "other income", "other expense"],
    includeKeywords: ["lain", "other", "non operating"],
    treatment: "non_operating",
    valuationImpact: ["NOPLAT exclusion", "CFI review"],
    reviewNote: "Exclude from operating earning power.",
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
      reason: "Account name is blank.",
      needsReview: true,
    };
  }

  const scored = accountMappingRules.map((rule) => {
    const aliasHit = rule.aliases.some((alias) => normalizedLabel.includes(normalizeAccountLabel(alias)));
    const includeHits = rule.includeKeywords.filter((keyword) => normalizedLabel.includes(normalizeAccountLabel(keyword))).length;
    const excluded = rule.excludeKeywords?.some((keyword) => normalizedLabel.includes(normalizeAccountLabel(keyword))) ?? false;
    const statementCompatible = isStatementCompatible(rule.category, statement);
    const rawScore =
      (aliasHit ? 0.55 : 0) +
      Math.min(includeHits * 0.16, 0.4) -
      (excluded ? 0.45 : 0) +
      (statementCompatible === true ? 0.08 : 0) -
      (statementCompatible === false ? 0.65 : 0);

    return {
      rule,
      confidence: Math.max(0, Math.min(0.99, rawScore)),
      aliasHit,
      includeHits,
      excluded,
      statementCompatible,
    };
  });

  const best = scored.sort((a, b) => b.confidence - a.confidence)[0];
  const confidence = best?.confidence ?? 0;
  const rule = best?.rule ?? accountMappingRules[0];

  if (!best || confidence === 0) {
    return {
      sourceLabel,
      normalizedLabel,
      category: "UNMAPPED",
      displayName: "Unmapped",
      confidence: 0,
      treatment: "review",
      valuationImpact: ["mapping review"],
      reason: "No alias or keyword matched. Manual category review is required.",
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
    reason: `${best?.aliasHit ? "Alias match" : "Keyword match"} with ${best?.includeHits ?? 0} keyword hit(s). ${rule.reviewNote}`,
    needsReview: confidence < 0.72 || (best?.excluded ?? false) || best?.statementCompatible === false,
  };
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
