import { kluSectorRecords, type KluSectorRecord } from "./klu-sector-data";

export type { KluSectorConfidence, KluSectorRecord } from "./klu-sector-data";

const kluSectorByCode = new Map(kluSectorRecords.map((record) => [record.code, record]));

export function normalizeKluCode(value: string): string {
  return value.replace(/\D/g, "").slice(0, 5);
}

export function getKluSectorRecord(code: string): KluSectorRecord | null {
  return kluSectorByCode.get(normalizeKluCode(code)) ?? null;
}

export function getSectorByKluCode(code: string): string {
  return getKluSectorRecord(code)?.sector ?? "";
}

export function searchKluSectorRecords(query: string, limit = 8): KluSectorRecord[] {
  const normalizedQuery = query.trim().toLowerCase();
  const codeQuery = normalizeKluCode(query);

  if (!normalizedQuery && !codeQuery) {
    return [];
  }

  const matches = kluSectorRecords
    .map((record) => {
      const title = record.title.toLowerCase();
      const codeScore =
        record.code === codeQuery
          ? 0
          : codeQuery && record.code.startsWith(codeQuery)
            ? 1
            : codeQuery && record.code.includes(codeQuery)
              ? 2
              : 9;
      const titleScore = normalizedQuery && title.includes(normalizedQuery) ? 3 : 9;
      const score = Math.min(codeScore, titleScore);

      return { record, score };
    })
    .filter((item) => item.score < 9)
    .sort((a, b) => a.score - b.score || a.record.code.localeCompare(b.record.code));

  return matches.slice(0, limit).map((item) => item.record);
}

export function formatKluOptionLabel(record: KluSectorRecord): string {
  return `${record.code} - ${record.title}`;
}
