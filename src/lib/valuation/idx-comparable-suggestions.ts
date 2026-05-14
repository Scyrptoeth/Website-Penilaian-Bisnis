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

export type IdxComparableDatasetMetadata = {
  id: string;
  sourceName: string;
  sourceUrl: string;
  sourceFile: string;
  processedFile: string;
  asOfDate: string;
  fetchedAtWib: string;
  processedAtWib: string;
  rowCount: number;
  sourceRowCount: number;
  tolerancePercent: number;
  metricBasis: string;
  coverageNote: string;
};

export type IdxComparableDatasetUseStatus = {
  level: "info" | "warning";
  label: string;
  message: string;
};

const qualityPriority: Record<string, number> = {
  "Data Pembanding Bersifat Ideal": 0,
  "Data Pembanding Bersifat Moderat": 1,
  "Bisa Dipertimbangkan sebagai Data Pembanding": 2,
  "Data Pembanding Diatas Rata-Rata Sektor": 3,
  "Data Pembanding Dibawah Rata-Rata Sektor": 4,
};

export const idxComparableDatasetMetadata: IdxComparableDatasetMetadata = {
  id: "idx-yahoo-peer-snapshot-2026-05-01",
  sourceName: "IDX company list + Yahoo Finance key statistics",
  sourceUrl: "https://finance.yahoo.com/quote/BBRI.JK/key-statistics/",
  sourceFile: "Daftar_Saham_IDX_2026-05-01.xlsx",
  processedFile: "Daftar_Saham_IDX_2026-05-01_Yahoo_Statistics_Sector_Comparison_Tolerance_20pct.xlsx",
  asOfDate: "2026-05-01",
  fetchedAtWib: "01/05/2026, 23:59:16",
  processedAtWib: "02/05/2026",
  rowCount: 719,
  sourceRowCount: 957,
  tolerancePercent: 20,
  metricBasis: "Beta 5Y monthly, market cap current, dan total debt MRQ dari Yahoo Finance.",
  coverageNote: "Build saat ini memakai satu snapshot peer IDX; snapshot peer tahunan 2020-2025 belum tersedia.",
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

export function getIdxComparableDatasetUseStatus(valuationDate: string): IdxComparableDatasetUseStatus {
  const normalizedValuationDate = normalizeIsoDate(valuationDate);
  const snapshotDate = idxComparableDatasetMetadata.asOfDate;
  const snapshotLabel = formatIsoDateLabel(snapshotDate);

  if (!normalizedValuationDate) {
    return {
      level: "info",
      label: "Tanggal penilaian belum diisi",
      message: `Peer IDX memakai snapshot ${snapshotLabel}. Isi tanggal penilaian untuk menilai risiko cut-off dan look-ahead.`,
    };
  }

  const valuationLabel = formatIsoDateLabel(normalizedValuationDate);

  if (normalizedValuationDate < snapshotDate) {
    return {
      level: "warning",
      label: "Potensi look-ahead bias",
      message: `Tanggal penilaian ${valuationLabel} mendahului snapshot peer ${snapshotLabel}. Gunakan sebagai saran awal saja atau override dengan bukti peer yang tersedia pada cut-off.`,
    };
  }

  if (normalizedValuationDate > snapshotDate) {
    return {
      level: "warning",
      label: "Snapshot peer perlu pembaruan",
      message: `Tanggal penilaian ${valuationLabel} setelah snapshot peer ${snapshotLabel}. Validasi ulang beta, market cap, dan debt sebelum menjadi basis final.`,
    };
  }

  return {
    level: "info",
    label: "Snapshot sesuai tanggal penilaian",
    message: `Tanggal penilaian sama dengan snapshot peer ${snapshotLabel}. Tetap cek kesesuaian sektor, ukuran, dan struktur kapital pembanding.`,
  };
}

function normalizeSector(value: string): string {
  return value.trim().toLowerCase();
}

function normalizeIsoDate(value: string): string | null {
  const normalized = value.trim();

  return /^\d{4}-\d{2}-\d{2}$/.test(normalized) ? normalized : null;
}

function formatIsoDateLabel(value: string): string {
  const [year, month, day] = value.split("-");
  const monthIndex = Number(month) - 1;
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  const monthLabel = monthNames[monthIndex] ?? month;

  return `${Number(day)} ${monthLabel} ${year}`;
}
