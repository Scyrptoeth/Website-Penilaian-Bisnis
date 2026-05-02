export type AssumptionCandidateStatus = "recommended" | "workbook" | "warning" | "sensitivity" | "manual";

export type AssumptionCandidate = {
  id: string;
  label: string;
  value: number;
  status: AssumptionCandidateStatus;
  source: string;
  formula: string;
  note: string;
  sourceCell?: string;
  requiresReason?: boolean;
};

export type AssumptionReference = {
  label: string;
  treatment: string;
};

export type TaxRateSuggestion = {
  year: number;
  rate: number;
  source: string;
  note: string;
};

export const waccInputReferences: AssumptionReference[] = [
  {
    label: "Utang berbunga",
    treatment: "Pinjaman bank jangka pendek, pinjaman bank jangka panjang, utang bunga, atau utang pasar hanya digunakan untuk mendukung bobot utang.",
  },
  {
    label: "Basis ekuitas",
    treatment: "Modal disetor, tambahan modal disetor, saldo laba, atau nilai pasar ekuitas digunakan untuk mendukung bobot ekuitas.",
  },
  {
    label: "Cost of equity (biaya ekuitas)",
    treatment: "Risk-free rate, beta, equity risk premium, serta premi risiko negara atau perusahaan yang eksplisit.",
  },
  {
    label: "Cost of debt (biaya utang)",
    treatment: "Tingkat pinjaman eksternal atau bukti lender sebelum pajak, lalu disesuaikan dengan tarif pajak aktif.",
  },
];

export const terminalGrowthInputReferences: AssumptionReference[] = [
  {
    label: "Invested capital",
    treatment: "Aset tetap neto ditambah operating working capital sebagai basis kapital operasional.",
  },
  {
    label: "Investasi neto",
    treatment: "Mutasi aset tetap dan operating working capital dapat digunakan sebagai cross-check, bukan input terminal yang di-hardcode.",
  },
  {
    label: "Pertumbuhan berkelanjutan",
    treatment: "Gunakan asumsi jangka panjang industri, inflasi, ROIC, dan reinvestasi; base growth wajib berada di bawah WACC.",
  },
];

export const requiredReturnOnNtaInputReferences: AssumptionReference[] = [
  {
    label: "Operating NTA",
    treatment: "Piutang, persediaan, dan aset tetap mendukung basis aset berwujud yang direview untuk EEM.",
  },
  {
    label: "Kapasitas pinjaman",
    treatment: "Capacity rate yang diinput pengguna mengonversi aset berwujud yang dapat dijaminkan menjadi bauran utang/ekuitas implisit; bila tidak tersedia, gunakan struktur kapital WACC sebagai fallback terdokumentasi.",
  },
  {
    label: "Capital charge",
    treatment: "After-tax debt cost dan tangible-asset equity return menghasilkan required return on NTA.",
  },
];

export function getStatutoryCorporateTaxRateSuggestion(valuationDate: string): TaxRateSuggestion | null {
  const year = readYear(valuationDate);

  if (!year) {
    return null;
  }

  if (year <= 2019) {
    return {
      year,
      rate: 0.25,
      source: "DJP PPh Badan general statutory rate",
      note: "Tarif PPh Badan umum untuk tahun pajak 2019 ke bawah adalah 25%.",
    };
  }

  return {
    year,
    rate: 0.22,
    source: "PP 55/2022 Pasal 64 and DJP guidance",
    note: "Tarif PPh Badan umum tahun pajak 2020 dan seterusnya adalah 22%.",
  };
}

export function buildTaxRateCandidates(valuationDate: string): AssumptionCandidate[] {
  const suggestion = getStatutoryCorporateTaxRateSuggestion(valuationDate);

  if (!suggestion) {
    return [];
  }

  return [
    {
      id: "statutory-general",
      label: `Tarif umum statutory ${suggestion.year}`,
      value: suggestion.rate,
      status: "recommended",
      source: suggestion.source,
      formula: "Tarif PPh Badan umum berdasarkan tahun penilaian",
      note: `${suggestion.note} Fasilitas khusus seperti listed company relief, Pasal 31E, atau PPh final UMKM hanya melalui override beralasan.`,
    },
  ];
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
