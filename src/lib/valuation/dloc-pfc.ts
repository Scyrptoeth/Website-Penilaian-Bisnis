import type { CaseProfile } from "./case-model";
import type { FormulaTrace } from "./types";

export type DlocPfcAdjustmentType = "DLOC" | "PFC";
export type DlocPfcCompanyBasis = "Tertutup" | "Terbuka (Tbk)";

export type DlocPfcFactorId =
  | "shareholderAgreement"
  | "minorityShareholderLoss"
  | "controllingShareholderAction"
  | "managementAppointment"
  | "operationalControl";

export type DlocPfcFactorOption = {
  label: string;
  score: number;
};

export type DlocPfcFactorDefinition = {
  id: DlocPfcFactorId;
  no: number;
  factor: string;
  prompt: string;
  options: DlocPfcFactorOption[];
  evidenceBasis: string;
};

export type DlocPfcFactorInput = {
  answer: string;
  overrideReason: string;
};

export type DlocPfcState = {
  factors: Record<DlocPfcFactorId, DlocPfcFactorInput>;
};

export type DlocPfcFactorResult = DlocPfcFactorDefinition & {
  answer: string;
  overrideReason: string;
  score: number;
  status: "answered" | "missing";
  isOverride: boolean;
};

export type DlocPfcCalculation = {
  companyBasis: DlocPfcCompanyBasis | "";
  adjustmentType: DlocPfcAdjustmentType | "";
  rangeLabel: string;
  rangeMin: number;
  rangeMax: number;
  rangeSpread: number;
  totalScore: number;
  maxScore: number;
  unsignedRate: number;
  signedRate: number;
  adjustmentMultiplier: number;
  status: "Rendah" | "Moderat" | "Tinggi" | "Belum lengkap";
  taxpayerResistance: "Tinggi" | "Moderat" | "Rendah" | "Belum lengkap";
  isComplete: boolean;
  factors: DlocPfcFactorResult[];
  traces: FormulaTrace[];
};

export const dlocPfcFactorDefinitions: DlocPfcFactorDefinition[] = [
  {
    id: "shareholderAgreement",
    no: 1,
    factor: "Perjanjian antara Pemegang Saham",
    prompt:
      "Apakah terdapat perjanjian dari pemegang saham yang mengatur posisi dalam susunan manajemen perusahaan tanpa melihat jumlah kepemilikan saham?",
    options: [
      { label: "Ada", score: 0 },
      { label: "Tidak Ada", score: 1 },
    ],
    evidenceBasis: "Perjanjian pemegang saham, akta, risalah RUPS, atau dokumen tata kelola.",
  },
  {
    id: "minorityShareholderLoss",
    no: 2,
    factor: "Kerugian Saham Minoritas",
    prompt: "Besarnya kerugian pemegang saham minoritas dari perusahaan tertutup dibandingkan pemegang saham minoritas perusahaan terbuka.",
    options: [
      { label: "Rendah", score: 0 },
      { label: "Sedang", score: 0.5 },
      { label: "Tinggi", score: 1 },
    ],
    evidenceBasis: "Kondisi likuiditas saham, akses informasi, dan perlindungan hak minoritas.",
  },
  {
    id: "controllingShareholderAction",
    no: 3,
    factor: "Pemegang Saham Pengendali",
    prompt: "Hal-hal yang dilakukan pemegang saham pengendali terhadap perusahaan yang dikendalikan untuk membuat sahamnya lebih menguntungkan.",
    options: [
      { label: "Rendah", score: 0 },
      { label: "Moderat", score: 0.5 },
      { label: "Dominan", score: 1 },
    ],
    evidenceBasis: "Kebijakan pengendali, transaksi afiliasi, dan bukti manfaat kendali.",
  },
  {
    id: "managementAppointment",
    no: 4,
    factor: "Penunjukkan Manajemen",
    prompt: "Apakah manajemen perusahaan ditunjuk oleh pemegang saham mayoritas?",
    options: [
      { label: "Tidak Ada", score: 0 },
      { label: "Sebagian", score: 0.5 },
      { label: "Seluruhnya", score: 1 },
    ],
    evidenceBasis: "Struktur manajemen, keputusan RUPS, dan dokumen penunjukan pengurus.",
  },
  {
    id: "operationalControl",
    no: 5,
    factor: "Pengendalian Operasional Perusahaan",
    prompt: "Apakah pemegang saham mayoritas sebagai pengendali operasional perusahaan?",
    options: [
      { label: "Tidak", score: 0 },
      { label: "Sebagian", score: 0.5 },
      { label: "Ya", score: 1 },
    ],
    evidenceBasis: "Kewenangan operasional, otorisasi transaksi, dan praktik pengambilan keputusan.",
  },
];

export function createEmptyDlocPfcState(): DlocPfcState {
  return {
    factors: Object.fromEntries(
      dlocPfcFactorDefinitions.map((factor) => [factor.id, { answer: "", overrideReason: "" }]),
    ) as Record<DlocPfcFactorId, DlocPfcFactorInput>,
  };
}

export function buildSampleDlocPfcState(): DlocPfcState {
  return {
    factors: {
      shareholderAgreement: { answer: "Ada", overrideReason: "" },
      minorityShareholderLoss: { answer: "Rendah", overrideReason: "" },
      controllingShareholderAction: { answer: "Rendah", overrideReason: "" },
      managementAppointment: { answer: "Sebagian", overrideReason: "" },
      operationalControl: { answer: "Tidak", overrideReason: "" },
    },
  };
}

export function calculateDlocPfc(state: DlocPfcState, caseProfile: CaseProfile): DlocPfcCalculation {
  const companyBasis = resolveCompanyBasis(caseProfile.companyType);
  const adjustmentType = resolveAdjustmentType(caseProfile.shareOwnershipType);
  const range = resolveRange(companyBasis);
  const factors = dlocPfcFactorDefinitions.map((definition): DlocPfcFactorResult => {
    const input = state.factors[definition.id] ?? { answer: "", overrideReason: "" };
    const option = definition.options.find((item) => item.label === input.answer);

    return {
      ...definition,
      answer: input.answer,
      overrideReason: input.overrideReason,
      score: option?.score ?? 0,
      status: option ? "answered" : "missing",
      isOverride: Boolean(input.overrideReason.trim()),
    };
  });
  const totalScore = factors.reduce((sum, factor) => sum + factor.score, 0);
  const maxScore = dlocPfcFactorDefinitions.length;
  const isComplete = Boolean(companyBasis && adjustmentType && range && factors.every((factor) => factor.status === "answered"));
  const rangeMin = range?.min ?? 0;
  const rangeMax = range?.max ?? 0;
  const rangeSpread = Math.max(rangeMax - rangeMin, 0);
  const unsignedRate = isComplete ? rangeMin + (totalScore / maxScore) * rangeSpread : 0;
  const signedRate = adjustmentType === "PFC" ? -unsignedRate : unsignedRate;
  const adjustmentMultiplier = -signedRate;
  const status = isComplete ? classifyStatus(unsignedRate, rangeMin, rangeMax) : "Belum lengkap";
  const taxpayerResistance = classifyTaxpayerResistance(status, signedRate);

  return {
    companyBasis,
    adjustmentType,
    rangeLabel: range ? `${formatRate(range.min)} - ${formatRate(range.max)}` : "Belum lengkap",
    rangeMin,
    rangeMax,
    rangeSpread,
    totalScore,
    maxScore,
    unsignedRate,
    signedRate,
    adjustmentMultiplier,
    status,
    taxpayerResistance,
    isComplete,
    factors,
    traces: [
      {
        label: "Jenis DLOC/PFC",
        formula: "Jenis Kepemilikan Saham: Minoritas = DLOC; Mayoritas = PFC",
        value: signedRate,
        valueFormat: "percent",
        note: adjustmentType
          ? `${caseProfile.shareOwnershipType} menghasilkan ${adjustmentType}; base AAM/EEM/DCF tetap sebelum DLOC/PFC.`
          : "Jenis Kepemilikan Saham di Data Awal belum lengkap.",
      },
      {
        label: "Rentang DLOC/PFC",
        formula: "Jenis Perusahaan: Tertutup = 30%-70%; Terbuka (Tbk) = 20%-35%",
        value: rangeSpread,
        valueFormat: "percent",
        note: range ? `${caseProfile.companyType} menghasilkan rentang ${formatRate(range.min)} - ${formatRate(range.max)}.` : "Jenis Perusahaan di Data Awal belum lengkap.",
      },
      {
        label: "DLOC/PFC Objek Penilaian",
        formula: "Batas bawah + (jumlah skor / maksimum skor x selisih rentang)",
        value: signedRate,
        valueFormat: "percent",
        note: isComplete
          ? `${adjustmentType} ditampilkan sebagai signed rate ${formatRate(signedRate)}; tax simulation memakai multiplier ${formatRate(adjustmentMultiplier)}.`
          : "Rate belum diterapkan sampai Data Awal dan seluruh questionnaire DLOC/PFC lengkap.",
      },
    ],
  };
}

export function normalizeDlocPfcState(value: DlocPfcState): DlocPfcState {
  const empty = createEmptyDlocPfcState();

  return {
    factors: Object.fromEntries(
      dlocPfcFactorDefinitions.map((definition) => {
        const input = value.factors[definition.id] ?? empty.factors[definition.id];
        const answer = definition.options.some((option) => option.label === input.answer) ? input.answer : "";

        return [definition.id, { answer, overrideReason: typeof input.overrideReason === "string" ? input.overrideReason : "" }];
      }),
    ) as Record<DlocPfcFactorId, DlocPfcFactorInput>,
  };
}

function resolveCompanyBasis(companyType: string): DlocPfcCompanyBasis | "" {
  if (companyType === "Tertutup" || companyType === "Terbuka (Tbk)") {
    return companyType;
  }

  return "";
}

function resolveAdjustmentType(shareOwnershipType: string): DlocPfcAdjustmentType | "" {
  if (shareOwnershipType === "Minoritas") {
    return "DLOC";
  }

  if (shareOwnershipType === "Mayoritas") {
    return "PFC";
  }

  return "";
}

function resolveRange(companyBasis: DlocPfcCompanyBasis | ""): { min: number; max: number } | null {
  if (companyBasis === "Tertutup") {
    return { min: 0.3, max: 0.7 };
  }

  if (companyBasis === "Terbuka (Tbk)") {
    return { min: 0.2, max: 0.35 };
  }

  return null;
}

function classifyStatus(rate: number, min: number, max: number): "Rendah" | "Moderat" | "Tinggi" {
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

function classifyTaxpayerResistance(
  status: DlocPfcCalculation["status"],
  signedRate: number,
): DlocPfcCalculation["taxpayerResistance"] {
  if (status === "Belum lengkap" || signedRate === 0) {
    return "Belum lengkap";
  }

  if (status === "Moderat") {
    return "Moderat";
  }

  if (signedRate > 0) {
    return status === "Rendah" ? "Tinggi" : "Rendah";
  }

  return status === "Rendah" ? "Rendah" : "Tinggi";
}

function formatRate(value: number): string {
  return `${Math.round(value * 100)}%`;
}
