import idxComparables from "./idx-comparables.json";

export type IdxComparableQuality =
  | "Data Pembanding Bersifat Ideal"
  | "Data Pembanding Bersifat Moderat"
  | "Bisa Dipertimbangkan sebagai Data Pembanding"
  | "Data Pembanding Diatas Rata-Rata Sektor"
  | "Data Pembanding Dibawah Rata-Rata Sektor";

export type IdxComparableCompany = {
  comparable: string;
  sector: string;
  betaLevered: number | null;
  marketCap: number | null;
  debt: number | null;
  quality: IdxComparableQuality | string;
};

const qualityPriority: Record<string, number> = {
  "Data Pembanding Bersifat Ideal": 0,
  "Data Pembanding Bersifat Moderat": 1,
  "Bisa Dipertimbangkan sebagai Data Pembanding": 2,
  "Data Pembanding Diatas Rata-Rata Sektor": 3,
  "Data Pembanding Dibawah Rata-Rata Sektor": 4,
};

export const idxComparableCompanies = idxComparables as IdxComparableCompany[];

export function getIdxComparablesBySector(sector: string): IdxComparableCompany[] {
  const normalizedSector = normalizeSector(sector);

  if (!normalizedSector) {
    return [];
  }

  return idxComparableCompanies.filter((company) => normalizeSector(company.sector) === normalizedSector);
}

export function getSuggestedIdxComparables(sector: string, limit = 3): IdxComparableCompany[] {
  return getIdxComparablesBySector(sector)
    .filter((company) => company.quality === "Data Pembanding Bersifat Ideal" || company.quality === "Data Pembanding Bersifat Moderat")
    .sort((first, second) => getQualityPriority(first.quality) - getQualityPriority(second.quality))
    .slice(0, limit);
}

export function formatIdxComparableLabel(company: IdxComparableCompany): string {
  return `${company.comparable} (${company.quality})`;
}

export function findIdxComparableByLabel(sector: string, label: string): IdxComparableCompany | null {
  const normalizedLabel = label.trim();

  if (!normalizedLabel) {
    return null;
  }

  return (
    getIdxComparablesBySector(sector).find(
      (company) => formatIdxComparableLabel(company) === normalizedLabel || company.comparable === normalizedLabel,
    ) ?? null
  );
}

function getQualityPriority(quality: string): number {
  return qualityPriority[quality] ?? 99;
}

function normalizeSector(value: string): string {
  return value.trim().toLowerCase();
}
