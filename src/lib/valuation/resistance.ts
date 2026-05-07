export type RangePositionStatus = "Rendah" | "Moderat" | "Tinggi";
export type TaxpayerResistanceLevel = "Tinggi" | "Moderat" | "Rendah" | "Belum lengkap";

const HIGH_RESISTANCE_MAX_POSITION = 0.32;
const MODERATE_RESISTANCE_MAX_POSITION = 0.64;

export function classifyRangePositionStatus(rate: number, min: number, max: number): RangePositionStatus {
  const relativePosition = calculateRelativeRangePosition(rate, min, max);

  if (relativePosition <= HIGH_RESISTANCE_MAX_POSITION) {
    return "Rendah";
  }

  if (relativePosition <= MODERATE_RESISTANCE_MAX_POSITION) {
    return "Moderat";
  }

  return "Tinggi";
}

export function classifyTaxpayerResistanceByRangePosition(
  rate: number,
  min: number,
  max: number,
): Exclude<TaxpayerResistanceLevel, "Belum lengkap"> {
  const positionStatus = classifyRangePositionStatus(rate, min, max);

  if (positionStatus === "Rendah") {
    return "Tinggi";
  }

  if (positionStatus === "Moderat") {
    return "Moderat";
  }

  return "Rendah";
}

export function combineTaxpayerResistanceByMatrix(
  dlomResistance: TaxpayerResistanceLevel,
  dlocPfcResistance: TaxpayerResistanceLevel,
): TaxpayerResistanceLevel {
  if (dlomResistance === "Belum lengkap" || dlocPfcResistance === "Belum lengkap") {
    return "Belum lengkap";
  }

  const totalScore = resistanceScore(dlomResistance) + resistanceScore(dlocPfcResistance);

  if (totalScore <= 1) {
    return "Rendah";
  }

  if (totalScore === 2) {
    return "Moderat";
  }

  return "Tinggi";
}

function calculateRelativeRangePosition(rate: number, min: number, max: number): number {
  const spread = max - min;

  if (spread <= 0) {
    return rate <= min ? 0 : 1;
  }

  return clamp((rate - min) / spread, 0, 1);
}

function resistanceScore(resistance: Exclude<TaxpayerResistanceLevel, "Belum lengkap">): number {
  if (resistance === "Rendah") {
    return 0;
  }

  if (resistance === "Moderat") {
    return 1;
  }

  return 2;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
