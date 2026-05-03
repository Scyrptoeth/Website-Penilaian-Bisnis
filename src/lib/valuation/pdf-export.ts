import type { ValuationExcelExportInput } from "./excel-export";

export type ValuationPdfExportPayload = {
  schemaVersion: 1;
  generatedAt: string;
  input: ValuationExcelExportInput;
};

export const pdfExportStorageKey = "penilaian-valuasi-bisnis.pdf-export.v1";

export function saveValuationPdfExportPayload(input: ValuationExcelExportInput): ValuationPdfExportPayload {
  const payload: ValuationPdfExportPayload = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    input,
  };

  if (typeof window === "undefined") {
    return payload;
  }

  window.localStorage.setItem(pdfExportStorageKey, JSON.stringify(payload));

  return payload;
}

export function readValuationPdfExportPayload(): ValuationPdfExportPayload | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(pdfExportStorageKey);

    if (!raw) {
      return null;
    }

    const parsed: unknown = JSON.parse(raw);

    if (!isPdfExportPayload(parsed)) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

function isPdfExportPayload(value: unknown): value is ValuationPdfExportPayload {
  if (!value || typeof value !== "object") {
    return false;
  }

  const payload = value as Partial<ValuationPdfExportPayload>;

  return payload.schemaVersion === 1 && typeof payload.generatedAt === "string" && Boolean(payload.input);
}
