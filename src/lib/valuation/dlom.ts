import type { FinancialStatementSnapshot, FormulaTrace } from "./types";

export type DlomCompanyMarketability = "" | "DLOM Perusahaan tertutup" | "DLOM Perusahaan terbuka";
export type DlomInterestBasis = "" | "Minoritas" | "Mayoritas";

export type DlomFactorId =
  | "licenseEntryBarrier"
  | "scaleEntryBarrier"
  | "dividendPolicy"
  | "profitability"
  | "netIncomeVolatility"
  | "capitalStructure"
  | "liquidity"
  | "salesGrowth"
  | "companyProspect"
  | "managementQuality";

export type DlomFactorOption = {
  label: string;
  score: number;
};

export type DlomFactorDefinition = {
  id: DlomFactorId;
  no: number;
  factor: string;
  prompt: string;
  options: DlomFactorOption[];
  evidenceBasis: string;
};

export type DlomFactorInput = {
  answer: string;
  overrideReason: string;
};

export type DlomBasisInput = {
  companyType: string;
  shareOwnershipType: string;
};

export type DlomBasisOverride = {
  interestBasis: DlomInterestBasis;
  sourceLabel: string;
};

export type DlomState = {
  factors: Record<DlomFactorId, DlomFactorInput>;
  basisOverride: DlomBasisOverride | null;
};

export type DlomRecommendation = {
  answer: string;
  confidence: number;
  evidence: string;
  source: string;
};

export type DlomFactorResult = DlomFactorDefinition & {
  answer: string;
  score: number;
  recommendation: DlomRecommendation;
  isOverride: boolean;
  status: "answered" | "missing";
};

export type DlomCalculation = {
  companyMarketability: DlomCompanyMarketability;
  interestBasis: DlomInterestBasis;
  rangeLabel: string;
  rangeMin: number;
  rangeMax: number;
  rangeSpread: number;
  totalScore: number;
  maxScore: number;
  dlomRate: number;
  companyMarketabilitySource: string;
  interestBasisSource: string;
  status: "Rendah" | "Moderat" | "Tinggi" | "Belum lengkap";
  taxpayerResistance: "Tinggi" | "Moderat" | "Rendah" | "Belum lengkap";
  isComplete: boolean;
  factors: DlomFactorResult[];
  traces: FormulaTrace[];
};

const emptyRecommendation: DlomRecommendation = {
  answer: "",
  confidence: 0,
  evidence: "Belum ada data yang cukup untuk memberi saran otomatis.",
  source: "Manual reviewer judgment",
};

export const workbookUpdateDlomBasisOverride: DlomBasisOverride = {
  interestBasis: "Mayoritas",
  sourceLabel: "Workbook UPDATE DLOM!C31",
};

export const dlomFactorDefinitions: DlomFactorDefinition[] = [
  {
    id: "licenseEntryBarrier",
    no: 1,
    factor: "Entry Barrier Perijinan Usaha",
    prompt: "Apakah terdapat pembatasan perizinan usaha yang memengaruhi minat investor?",
    options: [
      { label: "Ada", score: 0 },
      { label: "Terbatas", score: 0.5 },
      { label: "Tidak Ada", score: 1 },
    ],
    evidenceBasis: "Dokumen izin usaha, regulasi sektor, dan bukti pembatasan pasar.",
  },
  {
    id: "scaleEntryBarrier",
    no: 2,
    factor: "Entry Barrier Skala Ekonomis Usaha",
    prompt: "Apakah industri membutuhkan skala ekonomis besar sehingga calon investor terbatas?",
    options: [
      { label: "Tidak Terbatas", score: 0 },
      { label: "Segmen Tertentu", score: 0.5 },
      { label: "Skala Besar", score: 1 },
    ],
    evidenceBasis: "Karakter industri, kebutuhan modal, kapasitas produksi, dan skala pembanding.",
  },
  {
    id: "dividendPolicy",
    no: 3,
    factor: "Dividen",
    prompt: "Apakah kebijakan dividen diputuskan melalui RUPS dan terdapat pembagian dividen setiap tahun?",
    options: [
      { label: "Ya", score: 0 },
      { label: "Kadang-kadang", score: 0.5 },
      { label: "Tidak Ada", score: 1 },
    ],
    evidenceBasis: "Risalah RUPS, riwayat dividen, dan kebijakan distribusi laba.",
  },
  {
    id: "profitability",
    no: 4,
    factor: "Profitabilitas (EBITDA)",
    prompt: "Apakah profitabilitas perusahaan sesuai dengan rata-rata industri sejenis?",
    options: [
      { label: "Diatas", score: 0 },
      { label: "Rata-rata", score: 0.5 },
      { label: "Dibawah", score: 1 },
    ],
    evidenceBasis: "EBITDA/EBIT margin, margin pembanding industri, dan tren profitabilitas.",
  },
  {
    id: "netIncomeVolatility",
    no: 5,
    factor: "Fluktuasi Laba Bersih",
    prompt: "Apakah laba bersih perusahaan berfluktuasi?",
    options: [
      { label: "Tidak, Meningkat", score: 0 },
      { label: "Sedang, Stabil", score: 0.5 },
      { label: "Ya, Menurun", score: 1 },
    ],
    evidenceBasis: "Laba bersih komersial historis dan arah pertumbuhan laba.",
  },
  {
    id: "capitalStructure",
    no: 6,
    factor: "Struktur Permodalan",
    prompt: "Apakah Debt to Equity Ratio perusahaan sesuai dengan rata-rata industri sejenis?",
    options: [
      { label: "Dibawah", score: 0 },
      { label: "Rata-rata", score: 0.5 },
      { label: "Diatas", score: 1 },
    ],
    evidenceBasis: "Debt to equity ratio dan struktur kapital pembanding.",
  },
  {
    id: "liquidity",
    no: 7,
    factor: "Liquiditas",
    prompt: "Apakah Current Ratio perusahaan sesuai dengan rata-rata industri sejenis?",
    options: [
      { label: "Diatas", score: 0 },
      { label: "Rata-rata", score: 0.5 },
      { label: "Dibawah", score: 1 },
    ],
    evidenceBasis: "Current ratio, saldo aset lancar, dan liabilitas lancar.",
  },
  {
    id: "salesGrowth",
    no: 8,
    factor: "Pertumbuhan Penjualan",
    prompt: "Bagaimana pertumbuhan penjualan perusahaan dibandingkan rata-rata industri sejenis?",
    options: [
      { label: "Lebih Besar", score: 0 },
      { label: "Rata-rata", score: 0.5 },
      { label: "Lebih Kecil", score: 1 },
    ],
    evidenceBasis: "Revenue growth historis dan pembanding sektor.",
  },
  {
    id: "companyProspect",
    no: 9,
    factor: "Prospek Perusahaan dan Industri",
    prompt: "Bagaimana prospek perusahaan maupun industrinya di masa mendatang?",
    options: [
      { label: "Meningkat", score: 0 },
      { label: "Seperti Saat Ini", score: 0.5 },
      { label: "Menurun", score: 1 },
    ],
    evidenceBasis: "Prospek sektor, pipeline bisnis, dan kondisi pasar.",
  },
  {
    id: "managementQuality",
    no: 10,
    factor: "Kualitas Manajemen",
    prompt: "Apakah kualitas manajemen mendukung keberhasilan operasi dan keuangan perusahaan?",
    options: [
      { label: "Ya", score: 0 },
      { label: "Seperti Saat Ini", score: 0.5 },
      { label: "Tidak", score: 1 },
    ],
    evidenceBasis: "Rekam jejak manajemen, tata kelola, dan dokumentasi operasional.",
  },
];

export function createEmptyDlomState(): DlomState {
  return {
    basisOverride: null,
    factors: Object.fromEntries(
      dlomFactorDefinitions.map((factor) => [factor.id, { answer: "", overrideReason: "" }]),
    ) as Record<DlomFactorId, DlomFactorInput>,
  };
}

export function buildSampleDlomState(): DlomState {
  return {
    basisOverride: workbookUpdateDlomBasisOverride,
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
  };
}

export function calculateDlom(state: DlomState, snapshot: FinancialStatementSnapshot, basisInput: DlomBasisInput): DlomCalculation {
  const factors = dlomFactorDefinitions.map((definition): DlomFactorResult => {
    const input = state.factors[definition.id] ?? { answer: "", overrideReason: "" };
    const option = definition.options.find((item) => item.label === input.answer);
    const recommendation = buildRecommendation(definition.id, snapshot);

    return {
      ...definition,
      answer: input.answer,
      score: option?.score ?? 0,
      recommendation,
      isOverride: Boolean(input.answer && recommendation.answer && input.answer !== recommendation.answer),
      status: option ? "answered" : "missing",
    };
  });
  const companyMarketability = deriveDlomCompanyMarketability(basisInput.companyType);
  const interestBasis = state.basisOverride?.interestBasis || deriveDlomInterestBasis(basisInput.shareOwnershipType);
  const range = resolveDlomRange(companyMarketability, interestBasis);
  const totalScore = factors.reduce((sum, factor) => sum + factor.score, 0);
  const maxScore = 10;
  const isComplete = Boolean(range && factors.every((factor) => factor.status === "answered"));
  const rangeMin = range?.min ?? 0;
  const rangeMax = range?.max ?? 0;
  const rangeSpread = Math.max(rangeMax - rangeMin, 0);
  const dlomRate = isComplete ? rangeMin + (totalScore / maxScore) * rangeSpread : 0;
  const status = isComplete ? classifyDlomStatus(dlomRate, rangeMin, rangeMax) : "Belum lengkap";
  const taxpayerResistance = status === "Rendah" ? "Tinggi" : status === "Moderat" ? "Moderat" : status === "Tinggi" ? "Rendah" : "Belum lengkap";

  return {
    companyMarketability,
    interestBasis,
    rangeLabel: range ? `${formatRate(range.min)} - ${formatRate(range.max)}` : "Belum lengkap",
    rangeMin,
    rangeMax,
    rangeSpread,
    totalScore,
    maxScore,
    dlomRate,
    companyMarketabilitySource: "Terhubung dari Jenis Perusahaan",
    interestBasisSource: state.basisOverride?.sourceLabel || "Terhubung dari Jenis Kepemilikan Saham",
    status,
    taxpayerResistance,
    isComplete,
    factors,
    traces: [
      {
        label: "Jumlah skor DLOM",
        formula: "SUM(skor 10 faktor DLOM)",
        value: totalScore,
        valueFormat: "number",
        note: "Setiap faktor mengikuti skor workbook: 0, 0.5, atau 1.",
      },
      {
        label: "Rentang DLOM",
        formula: "DLOM!C32 = lookup kombinasi marketability basis + interest basis",
        value: rangeSpread,
        valueFormat: "percent",
        note: range ? `${companyMarketability} · ${interestBasis} menghasilkan rentang ${formatRate(range.min)} - ${formatRate(range.max)}.` : "Basis DLOM dari Data Awal belum lengkap.",
      },
      {
        label: "DLOM Objek Penilaian",
        formula: "DLOM!F34 = LEFT(C32,3)+(F33/F31*F32)",
        value: dlomRate,
        valueFormat: "percent",
        note: isComplete ? "Hasil ini hanya scenario layer; base AAM/EEM/DCF tetap sebelum DLOM." : "DLOM belum diterapkan sampai seluruh faktor dan basis terisi.",
      },
    ],
  };
}

export function normalizeDlomState(value: DlomState): DlomState {
  const empty = createEmptyDlomState();
  const basisOverride =
    value.basisOverride?.interestBasis === "Minoritas" || value.basisOverride?.interestBasis === "Mayoritas"
      ? {
          interestBasis: value.basisOverride.interestBasis,
          sourceLabel: typeof value.basisOverride.sourceLabel === "string" ? value.basisOverride.sourceLabel : "Workbook DLOM sheet",
        }
      : null;

  return {
    basisOverride,
    factors: Object.fromEntries(
      dlomFactorDefinitions.map((definition) => {
        const input = value.factors[definition.id] ?? empty.factors[definition.id];
        const answer = definition.options.some((option) => option.label === input.answer) ? input.answer : "";

        return [definition.id, { answer, overrideReason: typeof input.overrideReason === "string" ? input.overrideReason : "" }];
      }),
    ) as Record<DlomFactorId, DlomFactorInput>,
  };
}

export function deriveDlomCompanyMarketability(companyType: string): DlomCompanyMarketability {
  if (companyType === "Tertutup") {
    return "DLOM Perusahaan tertutup";
  }

  if (companyType === "Terbuka (Tbk)") {
    return "DLOM Perusahaan terbuka";
  }

  return "";
}

export function deriveDlomInterestBasis(shareOwnershipType: string): DlomInterestBasis {
  if (shareOwnershipType === "Minoritas" || shareOwnershipType === "Mayoritas") {
    return shareOwnershipType;
  }

  return "";
}

function resolveDlomRange(
  companyMarketability: DlomCompanyMarketability,
  interestBasis: DlomInterestBasis,
): { min: number; max: number } | null {
  if (!companyMarketability || !interestBasis) {
    return null;
  }

  if (companyMarketability === "DLOM Perusahaan tertutup" && interestBasis === "Minoritas") {
    return { min: 0.3, max: 0.5 };
  }

  if (companyMarketability === "DLOM Perusahaan tertutup" && interestBasis === "Mayoritas") {
    return { min: 0.2, max: 0.4 };
  }

  if (companyMarketability === "DLOM Perusahaan terbuka" && interestBasis === "Minoritas") {
    return { min: 0.1, max: 0.3 };
  }

  return { min: 0, max: 0.2 };
}

function classifyDlomStatus(rate: number, min: number, max: number): "Rendah" | "Moderat" | "Tinggi" {
  const spread = max - min;

  if (spread <= 0) {
    return rate <= min ? "Rendah" : "Tinggi";
  }

  const relative = (rate - min) / spread;

  if (relative <= 1 / 3) {
    return "Rendah";
  }

  if (relative <= 2 / 3) {
    return "Moderat";
  }

  return "Tinggi";
}

function buildRecommendation(id: DlomFactorId, snapshot: FinancialStatementSnapshot): DlomRecommendation {
  if (id === "profitability") {
    const ebitda = snapshot.ebit + Math.abs(snapshot.depreciation);
    const margin = snapshot.revenue > 0 ? ebitda / snapshot.revenue : 0;
    const answer = margin >= 0.15 ? "Diatas" : margin >= 0.05 ? "Rata-rata" : "Dibawah";

    return {
      answer,
      confidence: snapshot.revenue > 0 ? 0.72 : 0.2,
      evidence: `Proxy EBITDA margin ${formatRate(margin)} dari EBIT + depresiasi terhadap pendapatan.`,
      source: "Income statement snapshot",
    };
  }

  if (id === "capitalStructure") {
    const debtToEquity = snapshot.bookEquity > 0 ? snapshot.totalLiabilities / snapshot.bookEquity : 0;
    const answer = debtToEquity < 0.5 ? "Dibawah" : debtToEquity <= 1 ? "Rata-rata" : "Diatas";

    return {
      answer,
      confidence: snapshot.bookEquity > 0 ? 0.68 : 0.2,
      evidence: `DER proxy ${debtToEquity.toFixed(2)}x dari total liabilitas terhadap ekuitas buku.`,
      source: "Balance sheet snapshot",
    };
  }

  if (id === "liquidity") {
    const currentRatio = snapshot.currentLiabilities > 0 ? snapshot.currentAssets / snapshot.currentLiabilities : 0;
    const answer = currentRatio >= 1.5 ? "Diatas" : currentRatio >= 1 ? "Rata-rata" : "Dibawah";

    return {
      answer,
      confidence: snapshot.currentLiabilities > 0 ? 0.68 : 0.2,
      evidence: `Current ratio proxy ${currentRatio.toFixed(2)}x dari aset lancar terhadap liabilitas lancar.`,
      source: "Balance sheet snapshot",
    };
  }

  if (id === "salesGrowth") {
    const answer = snapshot.revenueGrowth > 0.05 ? "Lebih Besar" : snapshot.revenueGrowth >= 0 ? "Rata-rata" : "Lebih Kecil";

    return {
      answer,
      confidence: snapshot.revenueGrowth !== 0 ? 0.64 : 0.35,
      evidence: `Revenue growth model ${formatRate(snapshot.revenueGrowth)} dari driver historis/asumsi.`,
      source: "EEM/DCF driver",
    };
  }

  if (id === "netIncomeVolatility") {
    const answer = snapshot.commercialNpat > 0 ? "Sedang, Stabil" : "Ya, Menurun";

    return {
      answer,
      confidence: snapshot.commercialNpat !== 0 ? 0.42 : 0.2,
      evidence: "Hanya satu periode aktif tersedia di snapshot; tren multi-periode tetap perlu judgement reviewer.",
      source: "Commercial NPAT snapshot",
    };
  }

  return emptyRecommendation;
}

function formatRate(value: number): string {
  return `${Math.round(value * 100)}%`;
}
