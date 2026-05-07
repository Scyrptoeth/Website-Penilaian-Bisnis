import type { Metadata } from "next";
import { ValuationPdfReport } from "@/components/valuation-pdf-report";

type ExportPdfPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const defaultTitle = "Export PDF | Penilaian Bisnis II";
const description = "Laporan PDF penilaian valuasi bisnis dari state website aktif.";

export async function generateMetadata({ searchParams }: ExportPdfPageProps): Promise<Metadata> {
  const params = await searchParams;
  const filename = sanitizePdfFilenameParam(params?.filename);

  return {
    title: filename ?? defaultTitle,
    description,
  };
}

export default function ExportPdfPage() {
  return <ValuationPdfReport />;
}

function sanitizePdfFilenameParam(value: string | string[] | undefined): string | null {
  const raw = Array.isArray(value) ? value[0] : value;

  if (!raw) {
    return null;
  }

  const filename = raw.trim();

  if (!/^penilaian-bisnis-[a-z0-9-]+-(aam|eem|dcf|aam-eem-dcf)-\d{4}-\d{2}-\d{2}\.pdf$/.test(filename)) {
    return null;
  }

  return filename;
}
