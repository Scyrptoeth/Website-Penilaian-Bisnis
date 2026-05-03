export type TaxpayerKind = "individual" | "corporate";

export type ProgressiveTaxBracket = {
  upTo: number | null;
  rate: number;
  label: string;
};

export type TaxRateSource = {
  title: string;
  legalBasis: string;
  url: string;
  note: string;
};

export type TaxRateRegime = {
  year: number;
  individualBrackets: ProgressiveTaxBracket[];
  corporateRate: number;
  individualSource: TaxRateSource;
  corporateSource: TaxRateSource;
};

export type TaxYearResolution = {
  requestedYear: number | null;
  appliedYear: number | null;
  isNearestYear: boolean;
  supportedYears: number[];
  regime: TaxRateRegime | null;
};

export type ProgressiveTaxComputationBracket = {
  label: string;
  rate: number;
  taxableAmount: number;
  tax: number;
};

export type TaxComputation = {
  taxpayerKind: TaxpayerKind;
  requestedYear: number | null;
  appliedYear: number | null;
  isNearestYear: boolean;
  taxableIncome: number;
  taxableIncomeRounded: number;
  tax: number;
  effectiveRate: number;
  source: TaxRateSource | null;
  brackets: ProgressiveTaxComputationBracket[];
  label: string;
};

const legacyIndividualSource: TaxRateSource = {
  title: "Tarif PPh Orang Pribadi UU PPh",
  legalBasis: "UU 36/2008 Pasal 17 ayat (1) huruf a",
  url: "https://jdih.kemenkeu.go.id/dok/uu-36-tahun-2008",
  note: "Lapisan tarif OP tahun pajak 2020-2021; simulasi ini memakai PKP langsung tanpa PTKP sesuai desain modul.",
};

const hppIndividualSource: TaxRateSource = {
  title: "Tarif PPh Orang Pribadi UU HPP",
  legalBasis: "UU 7/2021 HPP Pasal 17 ayat (1) huruf a",
  url: "https://www.pajak.go.id/id/mekanisme-penghitungan-pajak-penghasilan-orang-pribadi",
  note: "Lapisan tarif OP tahun pajak 2022-2025; TER PPh 21 tidak dipakai karena simulasi ini memakai PKP langsung tahunan.",
};

const covidCorporateSource: TaxRateSource = {
  title: "Tarif umum PPh Badan 2020-2021",
  legalBasis: "Perppu 1/2020 Pasal 5 jo. UU 2/2020",
  url: "https://www.pajak.go.id/siaran-pers/implementasi-penurunan-tarif-pajak-penghasilan-badan-dalam-penghitungan-pph-pasal-29",
  note: "Tarif tunggal umum 22%; tidak memasukkan fasilitas perseroan terbuka, Pasal 31E, atau PPh final.",
};

const hppCorporateSource: TaxRateSource = {
  title: "Tarif umum PPh Badan UU HPP",
  legalBasis: "UU 7/2021 HPP Pasal 17 ayat (1) huruf b",
  url: "https://pajak.go.id/id/mekanisme-penghitungan-pajak-penghasilan-badan",
  note: "Tarif tunggal umum 22% untuk tahun pajak 2022 dan seterusnya; fasilitas khusus tidak dipakai.",
};

const legacyIndividualBrackets: ProgressiveTaxBracket[] = [
  { upTo: 50_000_000, rate: 0.05, label: "s.d. Rp50.000.000" },
  { upTo: 250_000_000, rate: 0.15, label: ">Rp50.000.000 s.d. Rp250.000.000" },
  { upTo: 500_000_000, rate: 0.25, label: ">Rp250.000.000 s.d. Rp500.000.000" },
  { upTo: null, rate: 0.3, label: ">Rp500.000.000" },
];

const hppIndividualBrackets: ProgressiveTaxBracket[] = [
  { upTo: 60_000_000, rate: 0.05, label: "s.d. Rp60.000.000" },
  { upTo: 250_000_000, rate: 0.15, label: ">Rp60.000.000 s.d. Rp250.000.000" },
  { upTo: 500_000_000, rate: 0.25, label: ">Rp250.000.000 s.d. Rp500.000.000" },
  { upTo: 5_000_000_000, rate: 0.3, label: ">Rp500.000.000 s.d. Rp5.000.000.000" },
  { upTo: null, rate: 0.35, label: ">Rp5.000.000.000" },
];

export const taxRateRegimes: TaxRateRegime[] = [
  {
    year: 2020,
    individualBrackets: legacyIndividualBrackets,
    corporateRate: 0.22,
    individualSource: legacyIndividualSource,
    corporateSource: covidCorporateSource,
  },
  {
    year: 2021,
    individualBrackets: legacyIndividualBrackets,
    corporateRate: 0.22,
    individualSource: legacyIndividualSource,
    corporateSource: covidCorporateSource,
  },
  {
    year: 2022,
    individualBrackets: hppIndividualBrackets,
    corporateRate: 0.22,
    individualSource: hppIndividualSource,
    corporateSource: hppCorporateSource,
  },
  {
    year: 2023,
    individualBrackets: hppIndividualBrackets,
    corporateRate: 0.22,
    individualSource: hppIndividualSource,
    corporateSource: hppCorporateSource,
  },
  {
    year: 2024,
    individualBrackets: hppIndividualBrackets,
    corporateRate: 0.22,
    individualSource: hppIndividualSource,
    corporateSource: hppCorporateSource,
  },
  {
    year: 2025,
    individualBrackets: hppIndividualBrackets,
    corporateRate: 0.22,
    individualSource: hppIndividualSource,
    corporateSource: hppCorporateSource,
  },
];

export function getSupportedTaxYears(): number[] {
  return taxRateRegimes.map((regime) => regime.year);
}

export function resolveTaxRateRegime(requestedYear: number | null): TaxYearResolution {
  const supportedYears = getSupportedTaxYears();

  if (requestedYear === null) {
    return {
      requestedYear,
      appliedYear: null,
      isNearestYear: false,
      supportedYears,
      regime: null,
    };
  }

  const directRegime = taxRateRegimes.find((regime) => regime.year === requestedYear);

  if (directRegime) {
    return {
      requestedYear,
      appliedYear: requestedYear,
      isNearestYear: false,
      supportedYears,
      regime: directRegime,
    };
  }

  const appliedYear = requestedYear < supportedYears[0] ? supportedYears[0] : supportedYears[supportedYears.length - 1];
  const regime = taxRateRegimes.find((item) => item.year === appliedYear) ?? null;

  return {
    requestedYear,
    appliedYear,
    isNearestYear: true,
    supportedYears,
    regime,
  };
}

export function calculateTaxByRegime(taxableIncome: number, taxpayerKind: TaxpayerKind, requestedYear: number | null): TaxComputation {
  const yearResolution = resolveTaxRateRegime(requestedYear);
  const taxableIncomeRounded = roundDownToThousands(Math.max(0, taxableIncome));

  if (!yearResolution.regime || !yearResolution.appliedYear) {
    return {
      taxpayerKind,
      requestedYear,
      appliedYear: null,
      isNearestYear: false,
      taxableIncome,
      taxableIncomeRounded,
      tax: 0,
      effectiveRate: 0,
      source: null,
      brackets: [],
      label: "Tahun pajak belum tersedia; potensi pajak tidak dihitung.",
    };
  }

  if (taxableIncomeRounded <= 0) {
    const source = taxpayerKind === "corporate" ? yearResolution.regime.corporateSource : yearResolution.regime.individualSource;

    return {
      taxpayerKind,
      requestedYear,
      appliedYear: yearResolution.appliedYear,
      isNearestYear: yearResolution.isNearestYear,
      taxableIncome,
      taxableIncomeRounded,
      tax: 0,
      effectiveRate: 0,
      source,
      brackets: [],
      label: "PKP simulasi bernilai nol; tidak ada potensi pajak kurang bayar.",
    };
  }

  if (taxpayerKind === "corporate") {
    const tax = taxableIncomeRounded * yearResolution.regime.corporateRate;

    return {
      taxpayerKind,
      requestedYear,
      appliedYear: yearResolution.appliedYear,
      isNearestYear: yearResolution.isNearestYear,
      taxableIncome,
      taxableIncomeRounded,
      tax,
      effectiveRate: tax / taxableIncomeRounded,
      source: yearResolution.regime.corporateSource,
      brackets: [
        {
          label: "Tarif tunggal umum PPh Badan",
          rate: yearResolution.regime.corporateRate,
          taxableAmount: taxableIncomeRounded,
          tax,
        },
      ],
      label: `Subjek badan: tarif tunggal umum ${formatPercentValue(yearResolution.regime.corporateRate)} untuk tahun pajak ${yearResolution.appliedYear}.`,
    };
  }

  const brackets = calculateProgressiveBrackets(taxableIncomeRounded, yearResolution.regime.individualBrackets);
  const tax = brackets.reduce((total, bracket) => total + bracket.tax, 0);

  return {
    taxpayerKind,
    requestedYear,
    appliedYear: yearResolution.appliedYear,
    isNearestYear: yearResolution.isNearestYear,
    taxableIncome,
    taxableIncomeRounded,
    tax,
    effectiveRate: tax / taxableIncomeRounded,
    source: yearResolution.regime.individualSource,
    brackets,
    label: `Subjek orang pribadi: PKP langsung dikenakan tarif progresif Pasal 17 tahun pajak ${yearResolution.appliedYear}, tanpa PTKP.`,
  };
}

function calculateProgressiveBrackets(taxableIncome: number, brackets: ProgressiveTaxBracket[]): ProgressiveTaxComputationBracket[] {
  let previousCap = 0;

  return brackets.flatMap((bracket) => {
    const upperBound = bracket.upTo ?? Number.POSITIVE_INFINITY;
    const taxableAmount = Math.max(0, Math.min(taxableIncome, upperBound) - previousCap);
    previousCap = upperBound;

    if (taxableAmount <= 0) {
      return [];
    }

    return [
      {
        label: bracket.label,
        rate: bracket.rate,
        taxableAmount,
        tax: taxableAmount * bracket.rate,
      },
    ];
  });
}

function roundDownToThousands(value: number): number {
  return Math.floor(value / 1_000) * 1_000;
}

function formatPercentValue(value: number): string {
  return `${Math.round(value * 100)}%`;
}
