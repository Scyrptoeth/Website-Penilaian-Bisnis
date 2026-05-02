import type { RequiredReturnOnNtaCalculation, WaccCalculation } from "./assumption-calculators";
import type { FormulaTrace, FinancialStatementSnapshot } from "./types";
import { valuationDriverGovernancePolicy } from "./valuation-driver-governance-policy";

export type AssumptionGovernanceLevel = "ok" | "review" | "critical";

export type AssumptionGovernanceTarget = "wacc" | "eemDcfAssumptions" | "valuationEemDcf";

export type AssumptionGovernanceItem = {
  id: string;
  label: string;
  valueLabel: string;
  level: AssumptionGovernanceLevel;
  message: string;
  action: string;
  target: AssumptionGovernanceTarget;
};

export type AssumptionGovernanceResult = {
  level: AssumptionGovernanceLevel;
  title: string;
  summary: string;
  items: AssumptionGovernanceItem[];
  criticalCount: number;
  reviewCount: number;
};

export type AssumptionGovernanceInput = {
  snapshot: FinancialStatementSnapshot;
  waccCalculation: WaccCalculation | null;
  requiredReturnCalculation: RequiredReturnOnNtaCalculation | null;
  dcfTraces: FormulaTrace[];
  hasRevenueGrowthOverride: boolean;
};

export function buildAssumptionGovernance({
  snapshot,
  waccCalculation,
  requiredReturnCalculation,
  dcfTraces,
  hasRevenueGrowthOverride,
}: AssumptionGovernanceInput): AssumptionGovernanceResult {
  const items: AssumptionGovernanceItem[] = [];
  const capitalizationSpread = snapshot.wacc - snapshot.terminalGrowth;
  const explicitPv = getTraceValue(dcfTraces, "Explicit PV of FCFF");
  const terminalPv = getTraceValue(dcfTraces, "PV terminal value");
  const terminalWeight = terminalPv > 0 && explicitPv + terminalPv !== 0 ? terminalPv / (explicitPv + terminalPv) : 0;

  if (snapshot.wacc > 0 && snapshot.wacc < valuationDriverGovernancePolicy.wacc.minimumReviewableRate) {
    items.push({
      id: "wacc-low",
      label: "WACC reasonableness",
      valueLabel: formatPercentText(snapshot.wacc),
      level: "critical",
      message: "Smart suggestion menghasilkan WACC rendah untuk valuasi EEM/DCF. Nilai ini tidak boleh dianggap base case final tanpa review beta, comparable, dan risk premium.",
      action: "Review WACC comparable, beta, company-specific risk premium, dan capital structure.",
      target: "wacc",
    });
  }

  if (waccCalculation && waccCalculation.beta > 0 && waccCalculation.beta < valuationDriverGovernancePolicy.wacc.lowBetaThreshold) {
    items.push({
      id: "wacc-low-beta",
      label: "Comparable beta",
      valueLabel: formatNumberText(waccCalculation.beta),
      level: "critical",
      message: "Relevered beta dari smart comparable sangat rendah. Ini dapat menekan cost of equity dan memperbesar DCF/EEM.",
      action: "Ganti atau validasi comparable, atau gunakan beta override dengan bukti.",
      target: "wacc",
    });
  }

  if (waccCalculation && waccCalculation.costOfEquity < waccCalculation.afterTaxCostOfDebt) {
    items.push({
      id: "wacc-ke-below-kd",
      label: "Cost of equity vs debt",
      valueLabel: `${formatPercentText(waccCalculation.costOfEquity)} Ke / ${formatPercentText(waccCalculation.afterTaxCostOfDebt)} Kd`,
      level: "critical",
      message: "Cost of equity berada di bawah after-tax cost of debt. Secara governance, ini perlu review kuat sebelum menjadi base WACC.",
      action: "Review beta, risk premium, dan country/company risk adjustment.",
      target: "wacc",
    });
  }

  if (capitalizationSpread <= 0 || capitalizationSpread < valuationDriverGovernancePolicy.terminalGrowth.minimumCapitalizationSpread) {
    items.push({
      id: "capitalization-spread",
      label: "EEM capitalization spread",
      valueLabel: capitalizationSpread > 0 ? formatPercentText(capitalizationSpread) : "Tidak valid",
      level: "critical",
      message: "WACC dikurangi terminal growth terlalu sempit, sehingga excess earnings dan terminal value menjadi sangat sensitif.",
      action: "Naikkan kualitas WACC atau turunkan/justifikasi terminal growth sebelum memakai hasil sebagai base case.",
      target: "eemDcfAssumptions",
    });
  }

  if (!hasRevenueGrowthOverride && snapshot.revenueGrowth > valuationDriverGovernancePolicy.revenueGrowth.highAutoGrowthThreshold) {
    items.push({
      id: "auto-revenue-growth",
      label: "Revenue growth auto-driver",
      valueLabel: formatPercentText(snapshot.revenueGrowth),
      level: "critical",
      message: "Revenue growth masih otomatis dari CAGR historis dan berada di atas ambang governance. Ini bukan base projection yang cukup tanpa normalisasi.",
      action: "Gunakan growth override berbasis normalized forecast, sektor, atau memo proyeksi.",
      target: "eemDcfAssumptions",
    });
  } else if (snapshot.revenueGrowth > valuationDriverGovernancePolicy.revenueGrowth.extremeOverrideGrowthThreshold) {
    items.push({
      id: "manual-revenue-growth-high",
      label: "Revenue growth override",
      valueLabel: formatPercentText(snapshot.revenueGrowth),
      level: "review",
      message: "Revenue growth override tinggi. Sistem menerima input, tetapi reviewer harus melihat basis proyeksi.",
      action: "Dokumentasikan basis growth override dan uji downside.",
      target: "eemDcfAssumptions",
    });
  }

  if (terminalWeight > valuationDriverGovernancePolicy.dcf.highTerminalValueWeightThreshold) {
    items.push({
      id: "terminal-weight",
      label: "DCF terminal dependence",
      valueLabel: formatPercentText(terminalWeight),
      level: "critical",
      message: "DCF terlalu bergantung pada terminal value. Ini biasanya menandakan WACC/growth/terminal growth perlu governance ketat.",
      action: "Review WACC, revenue growth, terminal growth, dan bandingkan no-incremental-WC/downside scenario.",
      target: "valuationEemDcf",
    });
  }

  if (!requiredReturnCalculation || requiredReturnCalculation.basis !== "capacity_evidence") {
    items.push({
      id: "nta-return-fallback",
      label: "Required return on NTA basis",
      valueLabel: requiredReturnCalculation?.basisLabel ?? "Belum dihitung",
      level: "critical",
      message: "Required return on NTA memakai fallback, bukan capacity evidence. Ini membuat EEM berbeda material dari capacity-based workbook.",
      action: "Isi capacity evidence atau dokumentasikan fallback sebagai provisional/sensitivity.",
      target: "eemDcfAssumptions",
    });
  }

  if (items.length === 0) {
    items.push({
      id: "governance-clear",
      label: "Assumption governance",
      valueLabel: "Tidak ada isu material",
      level: "ok",
      message: "Smart suggestion dan driver aktif melewati governance threshold awal.",
      action: "Tetap dokumentasikan bukti final dalam laporan.",
      target: "valuationEemDcf",
    });
  }

  const criticalCount = items.filter((item) => item.level === "critical").length;
  const reviewCount = items.filter((item) => item.level === "review").length;
  const level: AssumptionGovernanceLevel = criticalCount > 0 ? "critical" : reviewCount > 0 ? "review" : "ok";

  return {
    level,
    title: level === "critical" ? "High-risk smart suggestion" : level === "review" ? "Review required" : "Governance clear",
    summary:
      level === "critical"
        ? "Smart auto suggestion boleh dipakai untuk kalkulasi sementara, tetapi belum defensible sebagai base case tanpa perbaikan/review asumsi."
        : level === "review"
          ? "Asumsi aktif dapat dihitung, tetapi membutuhkan dokumentasi reviewer sebelum final."
          : "Asumsi aktif melewati threshold awal dan tetap perlu bukti pendukung final.",
    items,
    criticalCount,
    reviewCount,
  };
}

function getTraceValue(traces: FormulaTrace[], label: string): number {
  return traces.find((trace) => trace.label === label)?.value ?? 0;
}

function formatPercentText(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "percent",
    maximumFractionDigits: 2,
  }).format(value);
}

function formatNumberText(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 3,
  }).format(value);
}
