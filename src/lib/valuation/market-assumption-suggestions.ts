export type MarketAssumptionMetricKey =
  | "equityRiskPremium"
  | "ratingBasedDefaultSpread"
  | "riskFreeSun"
  | "bankPerseroInvestmentLoan"
  | "bankSwastaInvestmentLoan"
  | "bankUmumInvestmentLoan";

export type MarketAssumptionMetric = {
  key: MarketAssumptionMetricKey;
  label: string;
  value: number;
  method: string;
  source: string;
  sourceUrl: string;
  note: string;
};

export type MarketAssumptionSuggestion = {
  year: number;
  metrics: Record<MarketAssumptionMetricKey, MarketAssumptionMetric>;
};

const damodaranCountryRiskUrl = "https://pages.stern.nyu.edu/adamodar/New_Home_Page/datafile/ctryprem.html";
const damodaranRiskFreeUrl = "https://pages.stern.nyu.edu/~adamodar/pc/datasets/";
const ojkSbdkArchiveUrl = "https://www.ojk.go.id/id/kanal/perbankan/Documents/Pages/Suku-Bunga-Dasar/SBDK%20Juli%202018%20-%20Juni%202025.xlsx";

const yearlyInputs: Array<{
  year: number;
  equityRiskPremium: number;
  ratingBasedDefaultSpread: number;
  riskFreeSun: number;
  bankPerseroInvestmentLoan: number;
  bankSwastaInvestmentLoan: number;
  bankUmumInvestmentLoan: number;
}> = [
  {
    year: 2018,
    equityRiskPremium: 0.08602049147476651,
    ratingBasedDefaultSpread: 0.02147874895541842,
    riskFreeSun: 0.0824,
    bankPerseroInvestmentLoan: 0.102746,
    bankSwastaInvestmentLoan: 0.104415,
    bankUmumInvestmentLoan: 0.104319,
  },
  {
    year: 2019,
    equityRiskPremium: 0.07077356826750791,
    ratingBasedDefaultSpread: 0.01591544012647888,
    riskFreeSun: 0.0793,
    bankPerseroInvestmentLoan: 0.102958,
    bankSwastaInvestmentLoan: 0.104676,
    bankUmumInvestmentLoan: 0.104578,
  },
  {
    year: 2020,
    equityRiskPremium: 0.065635656450951,
    ratingBasedDefaultSpread: 0.016822031843274077,
    riskFreeSun: 0.0706,
    bankPerseroInvestmentLoan: 0.100312,
    bankSwastaInvestmentLoan: 0.096151,
    bankUmumInvestmentLoan: 0.096399,
  },
  {
    year: 2021,
    equityRiskPremium: 0.061224657438831556,
    ratingBasedDefaultSpread: 0.01619664677037467,
    riskFreeSun: 0.0606,
    bankPerseroInvestmentLoan: 0.081562,
    bankSwastaInvestmentLoan: 0.0861,
    bankUmumInvestmentLoan: 0.08582,
  },
  {
    year: 2022,
    equityRiskPremium: 0.09226302363259924,
    ratingBasedDefaultSpread: 0.023296788990825688,
    riskFreeSun: 0.0638,
    bankPerseroInvestmentLoan: 0.08001,
    bankSwastaInvestmentLoan: 0.081358,
    bankUmumInvestmentLoan: 0.081276,
  },
  {
    year: 2023,
    equityRiskPremium: 0.07384654256887045,
    ratingBasedDefaultSpread: 0.020743237044383835,
    riskFreeSun: 0.0692,
    bankPerseroInvestmentLoan: 0.080323,
    bankSwastaInvestmentLoan: 0.085205,
    bankUmumInvestmentLoan: 0.084905,
  },
  {
    year: 2024,
    equityRiskPremium: 0.06871042496765661,
    ratingBasedDefaultSpread: 0.01885748822216712,
    riskFreeSun: 0.0669,
    bankPerseroInvestmentLoan: 0.082196,
    bankSwastaInvestmentLoan: 0.085103,
    bankUmumInvestmentLoan: 0.084923,
  },
  {
    year: 2025,
    equityRiskPremium: 0.06517282699565899,
    ratingBasedDefaultSpread: 0.01885748822216712,
    riskFreeSun: 0.07041,
    bankPerseroInvestmentLoan: 0.085767,
    bankSwastaInvestmentLoan: 0.083734,
    bankUmumInvestmentLoan: 0.083859,
  },
];

export const marketAssumptionSuggestions: MarketAssumptionSuggestion[] = yearlyInputs.map((item) => ({
  year: item.year,
  metrics: {
    equityRiskPremium: metric({
      key: "equityRiskPremium",
      label: "Equity Risk Premium",
      value: item.equityRiskPremium,
      method: "Total ERP Indonesia dari arsip country-risk Damodaran untuk tahun penilaian.",
      source: "Damodaran / NYU Stern country risk premium archive",
      sourceUrl: damodaranCountryRiskUrl,
      note: "Referensi valuasi pasar, bukan tarif pajak statutory Indonesia.",
    }),
    ratingBasedDefaultSpread: metric({
      key: "ratingBasedDefaultSpread",
      label: "Default spread berbasis rating",
      value: item.ratingBasedDefaultSpread,
      method: "Default spread Indonesia berbasis rating Moody's dari arsip country-risk Damodaran yang sama.",
      source: "Damodaran / NYU Stern country risk premium archive",
      sourceUrl: damodaranCountryRiskUrl,
      note: "Saat total ERP sudah mencakup country risk, spread ditampilkan terpisah sebagai dukungan audit.",
    }),
    riskFreeSun: metric({
      key: "riskFreeSun",
      label: "Risk-free rate (SUN)",
      value: item.riskFreeSun,
      method: "Proxy SUN / obligasi pemerintah Indonesia tahunan yang disejajarkan dengan bukti pasar tahun penilaian.",
      source: "BI SBN market releases and Damodaran currency risk-free files",
      sourceUrl: damodaranRiskFreeUrl,
      note: "Gunakan sebagai titik awal; ganti dengan yield SUN tepat pada cut-off date bila tersedia.",
    }),
    bankPerseroInvestmentLoan: metric({
      key: "bankPerseroInvestmentLoan",
      label: "Debt rate Bank Persero",
      value: item.bankPerseroInvestmentLoan,
      method: buildSbdkMethod(item.year, "bank Persero"),
      source: "OJK SBDK archive Juli 2018-Juni 2025",
      sourceUrl: ojkSbdkArchiveUrl,
      note: buildSbdkNote(item.year),
    }),
    bankSwastaInvestmentLoan: metric({
      key: "bankSwastaInvestmentLoan",
      label: "Debt rate Bank Swasta",
      value: item.bankSwastaInvestmentLoan,
      method: buildSbdkMethod(item.year, "bank swasta/non-Persero"),
      source: "OJK SBDK archive Juli 2018-Juni 2025",
      sourceUrl: ojkSbdkArchiveUrl,
      note: buildSbdkNote(item.year),
    }),
    bankUmumInvestmentLoan: metric({
      key: "bankUmumInvestmentLoan",
      label: "Debt rate Bank Umum",
      value: item.bankUmumInvestmentLoan,
      method: buildSbdkMethod(item.year, "seluruh bank umum dalam arsip"),
      source: "OJK SBDK archive Juli 2018-Juni 2025",
      sourceUrl: ojkSbdkArchiveUrl,
      note: buildSbdkNote(item.year),
    }),
  },
}));

export function getSupportedMarketSuggestionYears(): number[] {
  return marketAssumptionSuggestions.map((item) => item.year);
}

export function getMarketAssumptionSuggestion(valuationDate: string): MarketAssumptionSuggestion | null {
  const year = readYear(valuationDate);

  if (!year) {
    return null;
  }

  return marketAssumptionSuggestions.find((item) => item.year === year) ?? null;
}

export function averageInvestmentLoanRate(suggestion: MarketAssumptionSuggestion): number {
  const {
    bankPerseroInvestmentLoan,
    bankSwastaInvestmentLoan,
    bankUmumInvestmentLoan,
  } = suggestion.metrics;

  return (bankPerseroInvestmentLoan.value + bankSwastaInvestmentLoan.value + bankUmumInvestmentLoan.value) / 3;
}

function metric(metricInput: MarketAssumptionMetric): MarketAssumptionMetric {
  return metricInput;
}

function buildSbdkMethod(year: number, groupLabel: string): string {
  const period = year === 2018 ? "Juli-Desember" : year === 2025 ? "Januari-Juni" : "Januari-Desember";

  return `Rata-rata sederhana bulanan SBDK korporasi OJK ${period} ${year} untuk ${groupLabel}; nilai bulanan dirata-ratakan menjadi proxy tahunan.`;
}

function buildSbdkNote(year: number): string {
  const periodNote =
    year === 2025
      ? "Data 2025 memakai periode Januari-Juni yang tersedia di arsip dan diperlakukan sebagai proxy tahunan."
      : year === 2018
        ? "Data 2018 memakai periode Juli-Desember karena arsip dimulai Juli 2018."
        : "Data memakai 12 bulan penuh pada tahun terkait.";

  return `${periodNote} SBDK belum memasukkan premi risiko spesifik debitur, sehingga tetap tampil sebagai saran sistem yang dapat dioverride penilai.`;
}

function readYear(value: string): number | null {
  const trimmed = value.trim();

  if (!trimmed) {
    return null;
  }

  const isoYear = /^(\d{4})-\d{2}-\d{2}$/.exec(trimmed);

  if (isoYear) {
    return Number(isoYear[1]);
  }

  const slashYear = /(?:^|\/)(\d{4})$/.exec(trimmed);

  if (slashYear) {
    return Number(slashYear[1]);
  }

  const anyYear = /\b(19\d{2}|20\d{2})\b/.exec(trimmed);

  return anyYear ? Number(anyYear[1]) : null;
}
