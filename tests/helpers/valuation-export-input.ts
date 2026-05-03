import { buildAamAdjustmentModel, type AamAdjustmentState } from "../../src/lib/valuation/aam-adjustments";
import {
  buildRequiredReturnOnNtaSuggestion,
  calculateWaccAssumption,
} from "../../src/lib/valuation/assumption-calculators";
import { calculateAllMethods } from "../../src/lib/valuation/calculations";
import {
  buildCaseProfileDerived,
  buildFixedAssetScheduleSummary,
  buildSnapshot,
  mapRow,
  type AccountRow,
  type AssumptionState,
  type CaseProfile,
  type FixedAssetScheduleRow,
  type Period,
} from "../../src/lib/valuation/case-model";
import type { DlocPfcState } from "../../src/lib/valuation/dloc-pfc";
import { calculateDlocPfc } from "../../src/lib/valuation/dloc-pfc";
import type { DlomState } from "../../src/lib/valuation/dlom";
import { calculateDlom } from "../../src/lib/valuation/dlom";
import type { ValuationExcelExportInput } from "../../src/lib/valuation/excel-export";
import { formatInputNumber } from "../../src/lib/valuation/format";
import { buildWorkbenchReadiness } from "../../src/lib/valuation/readiness";
import { buildSectionAnalysis } from "../../src/lib/valuation/section-analysis";
import type { TaxSimulationState } from "../../src/lib/valuation/tax-simulation";
import { calculateTaxSimulation } from "../../src/lib/valuation/tax-simulation";
import { buildValidationChecks } from "../../src/lib/valuation/validation-checks";

export type WorkbenchFixtureState = {
  version: number;
  savedAt: string;
  periods: Period[];
  activePeriodId: string;
  rows: AccountRow[];
  isFixedAssetScheduleEnabled: boolean;
  fixedAssetScheduleRows: FixedAssetScheduleRow[];
  aamAdjustments: AamAdjustmentState;
  assumptions: AssumptionState;
  caseProfile: CaseProfile;
  dlom: DlomState;
  dlocPfc: DlocPfcState;
  taxSimulation: TaxSimulationState;
};

export function buildExportInputFromWorkbenchFixture(
  state: WorkbenchFixtureState,
  exportedAt = new Date("2026-05-03T00:00:00.000Z"),
): ValuationExcelExportInput {
  const mappedRows = state.rows.map(mapRow);
  const caseProfileDerived = buildCaseProfileDerived(state.caseProfile);
  const fixedAssetSchedule = buildFixedAssetScheduleSummary(state.periods, state.fixedAssetScheduleRows);
  const accountingSnapshot = buildSnapshot(state.periods, state.activePeriodId, state.rows, state.assumptions, state.fixedAssetScheduleRows);
  const waccResolvedAssumptions = resolveAutoWaccCapitalValues(state.assumptions, {
    debtMarketValue: accountingSnapshot.currentLiabilities + accountingSnapshot.nonCurrentLiabilities || accountingSnapshot.totalLiabilities,
    equityMarketValue: accountingSnapshot.bookEquity,
  });
  const waccCalculation = calculateWaccAssumption(waccResolvedAssumptions);
  const requiredReturnSuggestion = buildRequiredReturnOnNtaSuggestion({
    accountReceivable: accountingSnapshot.accountReceivable,
    employeeReceivable: accountingSnapshot.employeeReceivable,
    inventory: accountingSnapshot.inventory,
    fixedAssetsNet: accountingSnapshot.fixedAssetsNet,
    waccCalculation,
  });
  const resolvedAssumptions = resolveAutoRequiredReturnOnNtaValues(waccResolvedAssumptions, requiredReturnSuggestion);
  const snapshot = buildSnapshot(state.periods, state.activePeriodId, state.rows, resolvedAssumptions, state.fixedAssetScheduleRows);
  const aamAdjustmentModel = buildAamAdjustmentModel(snapshot, state.aamAdjustments);
  const results = calculateAllMethods(snapshot, {
    aam: {
      assetAdjustment: aamAdjustmentModel.assetAdjustmentTotal,
      liabilityAdjustment: aamAdjustmentModel.liabilityAdjustmentTotal,
      missingAdjustmentNotes: aamAdjustmentModel.missingNoteCount,
    },
  });
  const dlomCalculation = calculateDlom(state.dlom, snapshot, state.caseProfile);
  const dlocPfcCalculation = calculateDlocPfc(state.dlocPfc, state.caseProfile);
  const taxSimulationResult = calculateTaxSimulation({
    methods: [results.aam, results.eem, results.dcf],
    dlom: dlomCalculation,
    dlocPfc: dlocPfcCalculation,
    state: state.taxSimulation,
    caseProfile: state.caseProfile,
    caseProfileDerived,
    snapshot,
  });
  const sectionAnalysis = buildSectionAnalysis(state.periods, state.rows, state.assumptions, state.fixedAssetScheduleRows);
  const equityBookComponents =
    snapshot.paidUpCapital +
    snapshot.additionalPaidInCapital +
    snapshot.retainedEarningsSurplus +
    snapshot.retainedEarningsCurrentProfit;
  const balanceSheetGap = results.adjustedTotalAssets - results.adjustedTotalLiabilities - equityBookComponents;
  const validationChecks = buildValidationChecks(
    state.rows,
    mappedRows,
    state.assumptions,
    snapshot,
    balanceSheetGap,
    fixedAssetSchedule,
  );
  const readiness = buildWorkbenchReadiness({
    periods: state.periods,
    rows: state.rows,
    mappedRows,
    assumptions: resolvedAssumptions,
    snapshot,
    fixedAssetSchedule,
    caseProfile: state.caseProfile,
    caseProfileDerived,
    dlocPfc: dlocPfcCalculation,
    taxSimulation: state.taxSimulation,
  });

  return {
    periods: state.periods,
    activePeriodId: state.activePeriodId,
    rows: state.rows,
    mappedRows,
    fixedAssetScheduleRows: state.fixedAssetScheduleRows,
    fixedAssetSchedule,
    assumptions: state.assumptions,
    resolvedAssumptions,
    caseProfile: state.caseProfile,
    caseProfileDerived,
    snapshot,
    aamAdjustmentModel,
    results,
    dlomCalculation,
    dlocPfcCalculation,
    taxSimulation: state.taxSimulation,
    taxSimulationResult,
    sectionAnalysis,
    readiness,
    validationChecks,
    exportedAt,
  };
}

function resolveAutoWaccCapitalValues(
  assumptions: AssumptionState,
  autoCapitalValues: { debtMarketValue: number; equityMarketValue: number },
): AssumptionState {
  return {
    ...assumptions,
    waccDebtMarketValue: assumptions.waccDebtMarketValue.trim() || formatAutoCapitalValue(autoCapitalValues.debtMarketValue),
    waccEquityMarketValue: assumptions.waccEquityMarketValue.trim() || formatAutoCapitalValue(autoCapitalValues.equityMarketValue),
  };
}

function resolveAutoRequiredReturnOnNtaValues(
  assumptions: AssumptionState,
  suggestion: ReturnType<typeof buildRequiredReturnOnNtaSuggestion>,
): AssumptionState {
  const keys = [
    "requiredReturnReceivablesCapacity",
    "requiredReturnInventoryCapacity",
    "requiredReturnFixedAssetCapacity",
    "requiredReturnAdditionalCapacity",
    "requiredReturnAfterTaxDebtCost",
    "requiredReturnEquityCost",
  ] as const;

  return keys.reduce((nextAssumptions, key) => {
    const field = suggestion.fields[key];

    if (!field?.canAutoApply || field.value === null || nextAssumptions[key].trim()) {
      return nextAssumptions;
    }

    return {
      ...nextAssumptions,
      [key]: formatInputNumber(field.value),
    };
  }, assumptions);
}

function formatAutoCapitalValue(value: number): string {
  return value > 0 ? formatInputNumber(value) : "";
}
