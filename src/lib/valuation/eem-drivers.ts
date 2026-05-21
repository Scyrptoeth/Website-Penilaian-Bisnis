import type { AamAdjustmentLine, AamAdjustmentModel } from "./aam-adjustments";
import type { EemOptions } from "./calculations";
import type { FixedAssetScheduleSummary } from "./case-model";
import type { SectionAnalysis } from "./section-analysis";

type EemDriverInput = {
  activePeriodId: string;
  aamAdjustmentModel: AamAdjustmentModel;
  sectionAnalysis: SectionAnalysis;
  fixedAssetSchedule: FixedAssetScheduleSummary;
};

const excludedCashAssetLineIds = new Set(["cash-on-hand", "cash-on-bank-deposit"]);
const excludedDebtLiabilityLineIds = new Set(["bank-loan-short-term", "bank-loan-long-term"]);

export type EemDriverSummary = Required<Pick<
  EemOptions,
  | "adjustedAssetsExcludingCash"
  | "adjustedLiabilitiesExcludingDebt"
  | "depreciationAddBack"
  | "currentAssetMovement"
  | "currentLiabilityMovement"
  | "capitalExpenditures"
>>;

export function buildEemDriverSummary({
  activePeriodId,
  aamAdjustmentModel,
  sectionAnalysis,
  fixedAssetSchedule,
}: EemDriverInput): EemDriverSummary {
  const excludedAdjustedCash = sumAdjustedLines(aamAdjustmentModel.assetLines, excludedCashAssetLineIds);
  const excludedAdjustedDebt = sumAdjustedLines(aamAdjustmentModel.liabilityLines, excludedDebtLiabilityLineIds);
  const periodAnalysis = sectionAnalysis.periodAnalyses.find((item) => item.period.id === activePeriodId);
  const fixedAssetAmounts = fixedAssetSchedule.totals[activePeriodId];
  const depreciationAddBack = fixedAssetSchedule.hasInput
    ? Math.abs(fixedAssetAmounts?.depreciationAdditions ?? 0)
    : periodAnalysis?.depreciationAddback ?? 0;
  const acquisitionAdditions = fixedAssetSchedule.hasInput
    ? Math.abs(fixedAssetAmounts?.acquisitionAdditions ?? 0)
    : periodAnalysis?.capitalExpenditure ?? 0;

  return {
    adjustedAssetsExcludingCash: aamAdjustmentModel.adjustedAssetTotal - excludedAdjustedCash,
    adjustedLiabilitiesExcludingDebt: aamAdjustmentModel.adjustedLiabilityTotal - excludedAdjustedDebt,
    depreciationAddBack,
    currentAssetMovement: readCashFlowStatementValue(sectionAnalysis, "oca-change", activePeriodId),
    currentLiabilityMovement: readCashFlowStatementValue(sectionAnalysis, "ocl-change", activePeriodId),
    capitalExpenditures: -acquisitionAdditions,
  };
}

export function buildEemCalculationOptions(
  input: EemDriverInput & Pick<
    EemOptions,
    "capitalizationRate" | "returnOnTangibleAsset" | "returnOnTangibleAssetLabel" | "returnOnTangibleAssetSource"
  >,
): EemOptions {
  return {
    ...buildEemDriverSummary(input),
    capitalizationRate: input.capitalizationRate,
    returnOnTangibleAsset: input.returnOnTangibleAsset,
    returnOnTangibleAssetLabel: input.returnOnTangibleAssetLabel,
    returnOnTangibleAssetSource: input.returnOnTangibleAssetSource,
  };
}

function sumAdjustedLines(lines: AamAdjustmentLine[], ids: Set<string>): number {
  return lines.reduce((total, line) => total + (ids.has(line.id) ? line.adjusted : 0), 0);
}

function readCashFlowStatementValue(sectionAnalysis: SectionAnalysis, key: string, periodId: string): number {
  return sectionAnalysis.cashFlowStatementRows.find((row) => row.key === key)?.values[periodId] ?? 0;
}
