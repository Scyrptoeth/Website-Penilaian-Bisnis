export type TerminalGrowthConfidence = "high" | "medium" | "low";

export type TerminalGrowthQuality = "strong" | "balanced" | "cautious";

export type SectorFinancialEvidence = {
  sector: string;
  totalCompanies: number;
  validCompanies: number;
  positiveProfitRatio: number;
  medianRevenue: number;
  medianNetProfit: number;
  medianNetMargin: number;
  p25NetMargin: number;
  p75NetMargin: number;
};

export type TerminalGrowthSuggestionInput = {
  sector: string;
  revenue: number;
  netProfit: number;
  wacc: number;
  existingDownside?: number | null;
  existingUpside?: number | null;
};

export type TerminalGrowthSuggestion = {
  sourceId: string;
  source: string;
  sourceArtifact: string;
  evidence: SectorFinancialEvidence;
  confidence: TerminalGrowthConfidence;
  quality: TerminalGrowthQuality;
  baseGrowth: number;
  downsideGrowth: number;
  upsideGrowth: number;
  sectorStressGrowth: number;
  sectorUpsideGrowth: number;
  companyRevenueScale: number | null;
  companyNetMargin: number | null;
  reason: string;
};

const sourceArtifact = "Daftar_Saham_IDX_2026-05-01_Yahoo_Statistics_Sector_Comparison_Tolerance_20pct_Revenue_NetProfit_2025.xlsx";

const sectorFinancialEvidence: SectorFinancialEvidence[] = [
  {
    sector: "Basic Materials",
    totalCompanies: 84,
    validCompanies: 81,
    positiveProfitRatio: 0.7654320987654321,
    medianRevenue: 1_500_000_000_000,
    medianNetProfit: 39_100_000_000,
    medianNetMargin: 0.02155887230514096,
    p25NetMargin: 0.004317073170731708,
    p75NetMargin: 0.08015267175572519,
  },
  {
    sector: "Consumer Cyclicals",
    totalCompanies: 121,
    validCompanies: 118,
    positiveProfitRatio: 0.5847457627118644,
    medianRevenue: 372_250_000_000,
    medianNetProfit: 2_800_000_000,
    medianNetMargin: 0.014471115336856712,
    p25NetMargin: -0.1105330785145052,
    p75NetMargin: 0.06424444320473074,
  },
  {
    sector: "Consumer Non-Cyclicals",
    totalCompanies: 102,
    validCompanies: 100,
    positiveProfitRatio: 0.71,
    medianRevenue: 1_250_000_000_000,
    medianNetProfit: 34_400_000_000,
    medianNetMargin: 0.028599754469906827,
    p25NetMargin: -0.011374489795918367,
    p75NetMargin: 0.086569009937431,
  },
  {
    sector: "Energy",
    totalCompanies: 70,
    validCompanies: 70,
    positiveProfitRatio: 0.8428571428571429,
    medianRevenue: 1_650_000_000_000,
    medianNetProfit: 65_000_000_000,
    medianNetMargin: 0.056611205130489,
    p25NetMargin: 0.012067949384642052,
    p75NetMargin: 0.1089750280583614,
  },
  {
    sector: "Financials",
    totalCompanies: 74,
    validCompanies: 73,
    positiveProfitRatio: 0.9315068493150684,
    medianRevenue: 1_700_000_000_000,
    medianNetProfit: 131_700_000_000,
    medianNetMargin: 0.0993076923076923,
    p25NetMargin: 0.047035714285714285,
    p75NetMargin: 0.2159090909090909,
  },
  {
    sector: "Healthcare",
    totalCompanies: 26,
    validCompanies: 26,
    positiveProfitRatio: 0.6923076923076923,
    medianRevenue: 1_750_000_000_000,
    medianNetProfit: 21_950_000_000,
    medianNetMargin: 0.021606707199008635,
    p25NetMargin: -0.025176417422741335,
    p75NetMargin: 0.0846875,
  },
  {
    sector: "Industrials",
    totalCompanies: 53,
    validCompanies: 52,
    positiveProfitRatio: 0.6923076923076923,
    medianRevenue: 352_250_000_000,
    medianNetProfit: 11_500_000_000,
    medianNetMargin: 0.0348,
    p25NetMargin: -0.03939176359406804,
    p75NetMargin: 0.10636506923635636,
  },
  {
    sector: "Infrastructures",
    totalCompanies: 49,
    validCompanies: 47,
    positiveProfitRatio: 0.6382978723404256,
    medianRevenue: 895_500_000_000,
    medianNetProfit: 51_200_000_000,
    medianNetMargin: 0.06863855421686747,
    p25NetMargin: -0.25449120603015074,
    p75NetMargin: 0.15846083550913836,
  },
  {
    sector: "Properties & Real Estate",
    totalCompanies: 72,
    validCompanies: 71,
    positiveProfitRatio: 0.6901408450704225,
    medianRevenue: 127_100_000_000,
    medianNetProfit: 16_000_000_000,
    medianNetMargin: 0.08475,
    p25NetMargin: -0.09346170828779524,
    p75NetMargin: 0.2347640500128899,
  },
  {
    sector: "Technology",
    totalCompanies: 35,
    validCompanies: 35,
    positiveProfitRatio: 0.6571428571428571,
    medianRevenue: 773_600_000_000,
    medianNetProfit: 7_900_000_000,
    medianNetMargin: 0.017894736842105262,
    p25NetMargin: -0.07150048514703687,
    p75NetMargin: 0.06278226283351365,
  },
  {
    sector: "Transportation & Logistic",
    totalCompanies: 33,
    validCompanies: 33,
    positiveProfitRatio: 0.7878787878787878,
    medianRevenue: 231_200_000_000,
    medianNetProfit: 5_300_000_000,
    medianNetMargin: 0.04052511415525114,
    p25NetMargin: 0.00482561965343277,
    p75NetMargin: 0.07271428571428572,
  },
];

export function getSectorFinancialEvidence(sector: string): SectorFinancialEvidence | null {
  const normalizedSector = normalizeSector(sector);

  if (!normalizedSector) {
    return null;
  }

  return sectorFinancialEvidence.find((item) => normalizeSector(item.sector) === normalizedSector) ?? null;
}

export function buildTerminalGrowthSuggestion(input: TerminalGrowthSuggestionInput): TerminalGrowthSuggestion | null {
  const evidence = getSectorFinancialEvidence(input.sector);

  if (!evidence) {
    return null;
  }

  const confidence = getConfidence(evidence.validCompanies);
  const quality = getQuality(evidence);
  const rawBaseGrowth = getRawBaseGrowth(quality);
  const sectorStressGrowth = getSectorStressGrowth(quality);
  const sectorUpsideGrowth = getSectorUpsideGrowth(quality);
  const baseGrowth = capBelowWacc(rawBaseGrowth, input.wacc);
  const validExistingDownside =
    input.existingDownside !== null &&
    input.existingDownside !== undefined &&
    Number.isFinite(input.existingDownside) &&
    input.existingDownside < baseGrowth
      ? input.existingDownside
      : null;
  const validExistingUpside =
    input.existingUpside !== null &&
    input.existingUpside !== undefined &&
    Number.isFinite(input.existingUpside) &&
    input.existingUpside > baseGrowth
      ? input.existingUpside
      : null;
  const downsideGrowth = Math.min(sectorStressGrowth, validExistingDownside ?? sectorStressGrowth);
  const upsideGrowth = capBelowWacc(validExistingUpside ?? sectorUpsideGrowth, input.wacc);
  const companyRevenueScale = input.revenue > 0 ? input.revenue / evidence.medianRevenue : null;
  const companyNetMargin = input.revenue > 0 ? input.netProfit / input.revenue : null;

  return {
    sourceId: `sector-terminal-growth-${slugify(evidence.sector)}`,
    source: "IDX sector revenue/net profit benchmark",
    sourceArtifact,
    evidence,
    confidence,
    quality,
    baseGrowth,
    downsideGrowth,
    upsideGrowth,
    sectorStressGrowth,
    sectorUpsideGrowth,
    companyRevenueScale,
    companyNetMargin,
    reason: buildReason(evidence, confidence, quality, companyRevenueScale, companyNetMargin),
  };
}

export function listSectorFinancialEvidence(): SectorFinancialEvidence[] {
  return sectorFinancialEvidence;
}

function getConfidence(validCompanies: number): TerminalGrowthConfidence {
  if (validCompanies >= 50) {
    return "high";
  }

  if (validCompanies >= 25) {
    return "medium";
  }

  return "low";
}

function getQuality(evidence: SectorFinancialEvidence): TerminalGrowthQuality {
  if (evidence.positiveProfitRatio >= 0.8 && evidence.medianNetMargin >= 0.05) {
    return "strong";
  }

  if (evidence.positiveProfitRatio >= 0.68 && evidence.medianNetMargin >= 0.02) {
    return "balanced";
  }

  return "cautious";
}

function getRawBaseGrowth(quality: TerminalGrowthQuality): number {
  if (quality === "strong") {
    return 0.01;
  }

  if (quality === "balanced") {
    return 0.005;
  }

  return 0;
}

function getSectorStressGrowth(quality: TerminalGrowthQuality): number {
  if (quality === "strong") {
    return -0.015;
  }

  if (quality === "balanced") {
    return -0.03;
  }

  return -0.05;
}

function getSectorUpsideGrowth(quality: TerminalGrowthQuality): number {
  if (quality === "strong") {
    return 0.03;
  }

  if (quality === "balanced") {
    return 0.025;
  }

  return 0.02;
}

function capBelowWacc(value: number, wacc: number): number {
  if (!Number.isFinite(wacc) || wacc <= 0) {
    return value;
  }

  return Math.min(value, Math.max(0, wacc - 0.005));
}

function buildReason(
  evidence: SectorFinancialEvidence,
  confidence: TerminalGrowthConfidence,
  quality: TerminalGrowthQuality,
  companyRevenueScale: number | null,
  companyNetMargin: number | null,
): string {
  const scaleNote = companyRevenueScale === null ? "target revenue belum tersedia" : `target revenue ${formatMultiple(companyRevenueScale)}x median sektor`;
  const marginNote = companyNetMargin === null ? "target net margin belum tersedia" : `target net margin ${formatPercentText(companyNetMargin)}`;

  return [
    `${evidence.sector} sector evidence from ${evidence.validCompanies}/${evidence.totalCompanies} IDX companies.`,
    `Confidence ${confidence}; sector quality ${quality}; profitable peer ratio ${formatPercentText(evidence.positiveProfitRatio)}; median net margin ${formatPercentText(evidence.medianNetMargin)}.`,
    `${scaleNote}; ${marginNote}.`,
    "Base/downside/upside are decision-support suggestions and must remain below WACC.",
  ].join(" ");
}

function normalizeSector(value: string): string {
  return value.trim().toLowerCase();
}

function slugify(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function formatMultiple(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 2,
  }).format(value);
}

function formatPercentText(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "percent",
    maximumFractionDigits: 2,
  }).format(value);
}
