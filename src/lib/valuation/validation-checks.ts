import type { AccountRow, AssumptionState, FixedAssetScheduleSummary, MappedRow } from "./case-model";
import { calculateWaccAssumption } from "./assumption-calculators";
import type { FinancialStatementSnapshot } from "./types";

export type ValidationCheck = {
  label: string;
  ok: boolean;
};

export function buildValidationChecks(
  rows: AccountRow[],
  mappedRows: MappedRow[],
  assumptions: AssumptionState,
  snapshot: FinancialStatementSnapshot,
  balanceSheetGap: number,
  fixedAssetSchedule: FixedAssetScheduleSummary,
): ValidationCheck[] {
  const hasEquityComponents =
    snapshot.paidUpCapital !== 0 ||
    snapshot.additionalPaidInCapital !== 0 ||
    snapshot.retainedEarningsSurplus !== 0 ||
    snapshot.retainedEarningsCurrentProfit !== 0;
  const balanceTolerance = Math.max(1, Math.abs(snapshot.totalAssets) * 0.001);
  const hasManualFixedAssetNet = mappedRows.some((item) => item.effectiveCategory === "FIXED_ASSET");
  const checks = [
    { label: "Akun sudah diinput", ok: rows.length > 0 || fixedAssetSchedule.hasInput },
    {
      label: "Pemetaan siap ditinjau",
      ok: fixedAssetSchedule.hasInput || mappedRows.some((item) => item.effectiveCategory !== "UNMAPPED"),
    },
    { label: "Neraca terisi", ok: snapshot.totalAssets !== 0 || snapshot.totalLiabilities !== 0 },
    { label: "Balance check", ok: !hasEquityComponents || Math.abs(balanceSheetGap) <= balanceTolerance },
    { label: "Laba rugi terisi", ok: snapshot.revenue !== 0 || snapshot.ebit !== 0 },
    { label: "Tax rate", ok: assumptions.taxRate.trim() !== "" },
    { label: "WACC", ok: assumptions.wacc.trim() !== "" || calculateWaccAssumption(assumptions) !== null },
  ];

  if (fixedAssetSchedule.hasInput) {
    checks.push(
      { label: "Jadwal aset tetap otomatis", ok: snapshot.fixedAssetsNet !== 0 },
      { label: "Tidak double count fixed asset", ok: !hasManualFixedAssetNet },
    );
  }

  return checks;
}
