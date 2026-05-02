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
    label: "Interest-bearing debt",
    treatment: "Bank loan short-term, bank loan long-term, interest payable, or market debt used only to support debt weight.",
  },
  {
    label: "Equity base",
    treatment: "Paid-up capital, additional paid-in capital, retained earnings, or market equity used to support equity weight.",
  },
  {
    label: "Cost of equity",
    treatment: "Risk-free rate, beta, equity risk premium, and explicit country or company-specific risk premiums.",
  },
  {
    label: "Cost of debt",
    treatment: "External borrowing rate or lender evidence before tax, then adjusted by the active tax rate.",
  },
];

export const terminalGrowthInputReferences: AssumptionReference[] = [
  {
    label: "Invested capital",
    treatment: "Fixed assets net plus operating working capital as the operating capital base.",
  },
  {
    label: "Net investment",
    treatment: "Movement in fixed assets and operating working capital can be used as a cross-check, not a hardcoded terminal input.",
  },
  {
    label: "Sustainable growth",
    treatment: "Use long-term industry, inflation, ROIC, and reinvestment assumptions; base growth must stay below WACC.",
  },
];

export const requiredReturnOnNtaInputReferences: AssumptionReference[] = [
  {
    label: "Operating NTA",
    treatment: "Receivables, inventory, and fixed assets support the tangible asset base reviewed for EEM.",
  },
  {
    label: "Borrowing capacity",
    treatment: "User-entered capacity rates convert pledgeable tangible assets into an implied debt/equity mix; if unavailable, use WACC capital structure as a documented fallback.",
  },
  {
    label: "Capital charge",
    treatment: "After-tax debt cost and tangible-asset equity return produce the required return on NTA.",
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
