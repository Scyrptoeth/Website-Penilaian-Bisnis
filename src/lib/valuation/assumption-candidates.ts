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

export type TaxRateSuggestion = {
  year: number;
  rate: number;
  source: string;
  note: string;
};

export const waccCandidates: AssumptionCandidate[] = [
  {
    id: "source-discount-rate",
    label: "Source WACC",
    value: 0.11463062037189403,
    status: "recommended",
    source: "Final review base case",
    sourceCell: "DISCOUNT RATE!H10 / STAT_ASSUMPTIONS!B6",
    formula: "Debt weight x after-tax cost of debt + equity weight x cost of equity",
    note: "Dipakai final review sebagai base discount/capitalization rate untuk DCF dan EEM.",
  },
  {
    id: "taxpayer-wacc",
    label: "Taxpayer WACC",
    value: 0.1031,
    status: "warning",
    source: "Workbook taxpayer input",
    sourceCell: "WACC!E22",
    formula: "Hardcoded workbook input",
    note: "Angka menurut Wajib Pajak; tidak boleh dipilih tanpa review sumber eksternal.",
  },
  {
    id: "wacc-formula-row",
    label: "WACC formula row",
    value: 0.1094,
    status: "warning",
    source: "Workbook WACC sheet",
    sourceCell: "WACC!E19:E20",
    formula: "WACC debt row + WACC equity row",
    note: "Audit workbook menemukan isu bobot struktur modal, sehingga kandidat ini perlu direbuild.",
  },
  {
    id: "corrected-spread-sensitivity",
    label: "Spread-added sensitivity",
    value: 0.14869348033569196,
    status: "sensitivity",
    source: "Final review sensitivity",
    sourceCell: "STAT_ASSUMPTIONS!B7",
    formula: "Debt weight x Kd + equity weight x (Rf + beta x ERP + country/default spread)",
    note: "Skenario koreksi jika country/default spread ditambahkan, bukan dikurangkan.",
  },
];

export const terminalGrowthCandidates: AssumptionCandidate[] = [
  {
    id: "base-zero",
    label: "Base 0%",
    value: 0,
    status: "recommended",
    source: "Final review base case",
    sourceCell: "STAT_ASSUMPTIONS!B8",
    formula: "User-confirmed long-term terminal growth",
    note: "Base case final review dikunci 0%; sensitivities tetap ditampilkan terpisah.",
  },
  {
    id: "workbook-reinvestment-growth",
    label: "Workbook reinvestment growth",
    value: -0.06200163015727912,
    status: "sensitivity",
    source: "Workbook growth sheet",
    sourceCell: "GROWTH RATE!B15",
    formula: "Average net investment / invested capital",
    note: "Lebih tepat sebagai sensitivity karena bukan long-term sustainable growth ekonomi/industri.",
  },
  {
    id: "upside-three-percent",
    label: "Upside 3%",
    value: 0.03,
    status: "sensitivity",
    source: "Final review sensitivity",
    formula: "Reviewer scenario",
    note: "Skenario upside untuk membaca sensitivitas terminal value.",
  },
];

export const requiredReturnOnNtaCandidates: AssumptionCandidate[] = [
  {
    id: "borrowing-capacity-return",
    label: "Borrowing capacity return",
    value: 0.08513891435570048,
    status: "recommended",
    source: "Workbook-derived EEM input",
    sourceCell: "BORROWING CAP!F14 / STAT_ASSUMPTIONS!B10",
    formula: "Weighted return from borrowing capacity capital mix",
    note: "Dipakai sebagai required return atas operating net tangible assets dalam EEM.",
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
      label: `Statutory general ${suggestion.year}`,
      value: suggestion.rate,
      status: "recommended",
      source: suggestion.source,
      formula: "General corporate income tax rate by valuation year",
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
