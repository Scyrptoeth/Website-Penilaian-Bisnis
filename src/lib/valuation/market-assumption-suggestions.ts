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
const ojkSbdkUrl = "https://ojk.go.id/id/kanal/perbankan/pages/suku-bunga-dasar.aspx";

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
    bankPerseroInvestmentLoan: 0.1025,
    bankSwastaInvestmentLoan: 0.1075,
    bankUmumInvestmentLoan: 0.105,
  },
  {
    year: 2019,
    equityRiskPremium: 0.07077356826750791,
    ratingBasedDefaultSpread: 0.01591544012647888,
    riskFreeSun: 0.0793,
    bankPerseroInvestmentLoan: 0.0995,
    bankSwastaInvestmentLoan: 0.1045,
    bankUmumInvestmentLoan: 0.102,
  },
  {
    year: 2020,
    equityRiskPremium: 0.065635656450951,
    ratingBasedDefaultSpread: 0.016822031843274077,
    riskFreeSun: 0.0706,
    bankPerseroInvestmentLoan: 0.0895,
    bankSwastaInvestmentLoan: 0.0945,
    bankUmumInvestmentLoan: 0.092,
  },
  {
    year: 2021,
    equityRiskPremium: 0.061224657438831556,
    ratingBasedDefaultSpread: 0.01619664677037467,
    riskFreeSun: 0.0606,
    bankPerseroInvestmentLoan: 0.0825,
    bankSwastaInvestmentLoan: 0.0875,
    bankUmumInvestmentLoan: 0.085,
  },
  {
    year: 2022,
    equityRiskPremium: 0.09226302363259924,
    ratingBasedDefaultSpread: 0.023296788990825688,
    riskFreeSun: 0.0638,
    bankPerseroInvestmentLoan: 0.084,
    bankSwastaInvestmentLoan: 0.089,
    bankUmumInvestmentLoan: 0.0865,
  },
  {
    year: 2023,
    equityRiskPremium: 0.07384654256887045,
    ratingBasedDefaultSpread: 0.020743237044383835,
    riskFreeSun: 0.0692,
    bankPerseroInvestmentLoan: 0.088,
    bankSwastaInvestmentLoan: 0.092,
    bankUmumInvestmentLoan: 0.09,
  },
  {
    year: 2024,
    equityRiskPremium: 0.06871042496765661,
    ratingBasedDefaultSpread: 0.01885748822216712,
    riskFreeSun: 0.0669,
    bankPerseroInvestmentLoan: 0.0895,
    bankSwastaInvestmentLoan: 0.0935,
    bankUmumInvestmentLoan: 0.0915,
  },
  {
    year: 2025,
    equityRiskPremium: 0.06517282699565899,
    ratingBasedDefaultSpread: 0.01885748822216712,
    riskFreeSun: 0.07041,
    bankPerseroInvestmentLoan: 0.0885,
    bankSwastaInvestmentLoan: 0.0925,
    bankUmumInvestmentLoan: 0.0905,
  },
];

export const marketAssumptionSuggestions: MarketAssumptionSuggestion[] = yearlyInputs.map((item) => ({
  year: item.year,
  metrics: {
    equityRiskPremium: metric({
      key: "equityRiskPremium",
      label: "Equity Risk Premium",
      value: item.equityRiskPremium,
      method: "Indonesia total ERP from Damodaran country-risk archive for the valuation year.",
      source: "Damodaran / NYU Stern country risk premium archive",
      sourceUrl: damodaranCountryRiskUrl,
      note: "Market valuation reference, not a statutory Indonesian tax rate.",
    }),
    ratingBasedDefaultSpread: metric({
      key: "ratingBasedDefaultSpread",
      label: "Rating-based default spread",
      value: item.ratingBasedDefaultSpread,
      method: "Moody's rating-based default spread for Indonesia from the same Damodaran country-risk archive.",
      source: "Damodaran / NYU Stern country risk premium archive",
      sourceUrl: damodaranCountryRiskUrl,
      note: "When total ERP already includes country risk, the spread is shown separately for audit support.",
    }),
    riskFreeSun: metric({
      key: "riskFreeSun",
      label: "Risk Free (SUN)",
      value: item.riskFreeSun,
      method: "Annual SUN / Indonesian government bond proxy aligned to valuation-year market evidence.",
      source: "BI SBN market releases and Damodaran currency risk-free files",
      sourceUrl: damodaranRiskFreeUrl,
      note: "Use as a starting point; replace with exact cut-off-date SUN yield when available.",
    }),
    bankPerseroInvestmentLoan: metric({
      key: "bankPerseroInvestmentLoan",
      label: "Bunga Pinjaman Investasi Bank Persero",
      value: item.bankPerseroInvestmentLoan,
      method: "Annual average SBDK investment/corporate lending proxy for state-owned banks.",
      source: "OJK Suku Bunga Dasar Kredit archive",
      sourceUrl: ojkSbdkUrl,
      note: "SBDK excludes borrower-specific risk premium; final lending rate can differ.",
    }),
    bankSwastaInvestmentLoan: metric({
      key: "bankSwastaInvestmentLoan",
      label: "Bunga Pinjaman Investasi Bank Swasta",
      value: item.bankSwastaInvestmentLoan,
      method: "Annual average SBDK investment/corporate lending proxy for private banks.",
      source: "OJK Suku Bunga Dasar Kredit archive",
      sourceUrl: ojkSbdkUrl,
      note: "SBDK excludes borrower-specific risk premium; final lending rate can differ.",
    }),
    bankUmumInvestmentLoan: metric({
      key: "bankUmumInvestmentLoan",
      label: "Bunga Pinjaman Investasi Bank Umum",
      value: item.bankUmumInvestmentLoan,
      method: "Average of state-owned and private-bank investment-loan proxies for the valuation year.",
      source: "OJK Suku Bunga Dasar Kredit archive",
      sourceUrl: ojkSbdkUrl,
      note: "Used as default pre-tax cost of debt support before borrower-specific override.",
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
