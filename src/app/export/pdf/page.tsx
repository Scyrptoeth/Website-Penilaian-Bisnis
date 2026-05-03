import type { Metadata } from "next";
import { ValuationPdfReport } from "@/components/valuation-pdf-report";

export const metadata: Metadata = {
  title: "Export PDF | Penilaian Bisnis II",
  description: "Laporan PDF penilaian valuasi bisnis dari state website aktif.",
};

export default function ExportPdfPage() {
  return <ValuationPdfReport />;
}
