import { assetCategories, balanceSheetClassificationLabelMap, getEffectiveBalanceSheetClassification, liabilityCategories, equityCategories } from "./balance-sheet-classification";
import { categoryLabelMap } from "./category-options";
import { parseInputNumber, type BalanceSheetClassification, type FixedAssetPeriodAmounts, type FixedAssetScheduleSummary, type MappedRow, type Period } from "./case-model";
import type { AccountCategory } from "./types";

export type BalanceSheetLine = {
  label: string;
  categoryId: AccountCategory | "DERIVED_FIXED_ASSET";
  category: string;
  balanceSheetClassification: BalanceSheetClassification | "";
  source: string;
  values: Record<string, number>;
  affectsTotal?: boolean;
  isDerived?: boolean;
  isOverride?: boolean;
};

export type BalanceSheetSection = {
  title: string;
  lines: BalanceSheetLine[];
  totalLabel: string;
  totalValues: Record<string, number>;
};

export type BalanceSheetView = {
  sections: BalanceSheetSection[];
  totalAssets: Record<string, number>;
  totalLiabilities: Record<string, number>;
  totalEquity: Record<string, number>;
  totalLiabilitiesAndEquity: Record<string, number>;
  balanceGap: Record<string, number>;
  hasRows: boolean;
  hasFixedAssetScheduleLines: boolean;
};

export function buildBalanceSheetView(periods: Period[], mappedRows: MappedRow[], fixedAssetSchedule: FixedAssetScheduleSummary): BalanceSheetView {
  const assetLines: BalanceSheetLine[] = [];
  const liabilityLines: BalanceSheetLine[] = [];
  const equityLines: BalanceSheetLine[] = [];
  const manualFixedAssetAcquisitionValues = zeroPeriodValues(periods);
  const manualAccumulatedDepreciationValues = zeroPeriodValues(periods);
  const explicitFixedAssetNetValues = zeroPeriodValues(periods);
  let hasManualFixedAssetDetail = false;

  mappedRows.forEach((item) => {
    if (item.row.statement !== "balance_sheet" || item.effectiveCategory === "UNMAPPED") {
      return;
    }

    const rawValues = Object.fromEntries(periods.map((period) => [period.id, parseInputNumber(item.row.values[period.id] ?? "")]));
    const values =
      item.effectiveCategory === "ACCUMULATED_DEPRECIATION"
        ? Object.fromEntries(periods.map((period) => [period.id, -Math.abs(rawValues[period.id] ?? 0)]))
        : rawValues;

    if (item.effectiveCategory === "FIXED_ASSET_ACQUISITION") {
      addPeriodValues(manualFixedAssetAcquisitionValues, rawValues, periods);
      hasManualFixedAssetDetail = true;
    }

    if (item.effectiveCategory === "ACCUMULATED_DEPRECIATION") {
      addPeriodValues(
        manualAccumulatedDepreciationValues,
        Object.fromEntries(periods.map((period) => [period.id, Math.abs(rawValues[period.id] ?? 0)])),
        periods,
      );
      hasManualFixedAssetDetail = true;
    }

    if (item.effectiveCategory === "FIXED_ASSET") {
      addPeriodValues(explicitFixedAssetNetValues, rawValues, periods);
    }

    const line: BalanceSheetLine = {
      label: item.row.accountName || categoryLabelMap.get(item.effectiveCategory) || item.effectiveCategory,
      categoryId: item.effectiveCategory,
      category: categoryLabelMap.get(item.effectiveCategory) || item.effectiveCategory,
      balanceSheetClassification: getEffectiveBalanceSheetClassification(item),
      source: "Input akun",
      values,
      affectsTotal: item.effectiveCategory !== "FIXED_ASSET_ACQUISITION" && item.effectiveCategory !== "ACCUMULATED_DEPRECIATION",
      isOverride: item.effectiveCategory === "TOTAL_ASSETS" || item.effectiveCategory === "TOTAL_LIABILITIES",
    };

    if (assetCategories.has(item.effectiveCategory)) {
      assetLines.push(line);
      return;
    }

    if (liabilityCategories.has(item.effectiveCategory)) {
      liabilityLines.push(line);
      return;
    }

    if (equityCategories.has(item.effectiveCategory)) {
      equityLines.push(line);
    }
  });

  if (fixedAssetSchedule.hasInput) {
    assetLines.push(
      buildDerivedFixedAssetLine(
        periods,
        fixedAssetSchedule,
        "Saldo awal",
        "Saldo akhir perolehan",
        (amounts) => amounts.acquisitionEnding,
        false,
      ),
      buildDerivedFixedAssetLine(
        periods,
        fixedAssetSchedule,
        "Akumulasi penyusutan",
        "Kontra aset",
        (amounts) => -amounts.depreciationEnding,
        false,
      ),
      buildDerivedFixedAssetLine(periods, fixedAssetSchedule, "Nilai buku bersih aset tetap", "Aset tetap neto", (amounts) => amounts.netValue),
    );
  }

  if (hasManualFixedAssetDetail) {
    const derivedManualFixedAssetNetValues = Object.fromEntries(
      periods.map((period) => {
        const explicitNet =
          (explicitFixedAssetNetValues[period.id] ?? 0) + (fixedAssetSchedule.hasInput ? (fixedAssetSchedule.totals[period.id]?.netValue ?? 0) : 0);
        const manualNet = Math.max(
          0,
          (manualFixedAssetAcquisitionValues[period.id] ?? 0) - (manualAccumulatedDepreciationValues[period.id] ?? 0),
        );

        return [period.id, explicitNet ? 0 : manualNet];
      }),
    );

    if (hasAnyNonZeroValue(derivedManualFixedAssetNetValues)) {
      assetLines.push({
        label: "Nilai buku bersih aset tetap",
        categoryId: "DERIVED_FIXED_ASSET",
        category: "Aset tetap neto dari rincian",
        balanceSheetClassification: "non_current_asset",
        source: "Input akun",
        values: derivedManualFixedAssetNetValues,
        affectsTotal: true,
        isDerived: true,
      });
    }
  }

  const totalAssets = totalWithOverride(periods, assetLines, "TOTAL_ASSETS");
  const totalLiabilities = totalWithOverride(periods, liabilityLines, "TOTAL_LIABILITIES");
  const totalEquity = sumLineValues(periods, equityLines);
  const totalLiabilitiesAndEquity = Object.fromEntries(
    periods.map((period) => [period.id, (totalLiabilities[period.id] ?? 0) + (totalEquity[period.id] ?? 0)]),
  );
  const balanceGap = Object.fromEntries(
    periods.map((period) => [period.id, (totalAssets[period.id] ?? 0) - (totalLiabilitiesAndEquity[period.id] ?? 0)]),
  );

  return {
    sections: [
      { title: "Aset", lines: assetLines, totalLabel: "Total Aset", totalValues: totalAssets },
      { title: "Liabilitas", lines: liabilityLines, totalLabel: "Total Liabilitas", totalValues: totalLiabilities },
      { title: "Ekuitas", lines: equityLines, totalLabel: "Total Ekuitas", totalValues: totalEquity },
    ],
    totalAssets,
    totalLiabilities,
    totalEquity,
    totalLiabilitiesAndEquity,
    balanceGap,
    hasRows: assetLines.length > 0 || liabilityLines.length > 0 || equityLines.length > 0,
    hasFixedAssetScheduleLines: fixedAssetSchedule.hasInput,
  };
}

export function groupBalanceSheetLines(lines: BalanceSheetLine[]): Array<{ key: string; label: string; lines: BalanceSheetLine[] }> {
  const groupOrder: Array<BalanceSheetClassification | "unclassified"> = [
    "current_asset",
    "non_current_asset",
    "asset_total",
    "current_liability",
    "non_current_liability",
    "liability_total",
    "equity",
    "unclassified",
  ];
  const groupedLines = new Map<string, BalanceSheetLine[]>();

  lines.forEach((line) => {
    const key = line.balanceSheetClassification || "unclassified";
    groupedLines.set(key, [...(groupedLines.get(key) ?? []), line]);
  });

  return Array.from(groupedLines.entries())
    .sort(([left], [right]) => groupOrder.indexOf(left as BalanceSheetClassification | "unclassified") - groupOrder.indexOf(right as BalanceSheetClassification | "unclassified"))
    .map(([key, grouped]) => ({
      key,
      label: key === "unclassified" ? "Belum diklasifikasi" : balanceSheetClassificationLabelMap.get(key as BalanceSheetClassification) ?? key,
      lines: grouped,
    }));
}

function zeroPeriodValues(periods: Period[]): Record<string, number> {
  return Object.fromEntries(periods.map((period) => [period.id, 0]));
}

function addPeriodValues(target: Record<string, number>, values: Record<string, number>, periods: Period[]) {
  periods.forEach((period) => {
    target[period.id] = (target[period.id] ?? 0) + (values[period.id] ?? 0);
  });
}

function hasAnyNonZeroValue(values: Record<string, number>) {
  return Object.values(values).some((value) => Math.abs(value) > 0.000001);
}

function buildDerivedFixedAssetLine(
  periods: Period[],
  fixedAssetSchedule: FixedAssetScheduleSummary,
  label: string,
  category: string,
  getValue: (amounts: FixedAssetPeriodAmounts) => number,
  affectsTotal = true,
): BalanceSheetLine {
  return {
    label,
    categoryId: "DERIVED_FIXED_ASSET",
    category,
    balanceSheetClassification: "non_current_asset",
    source: "Jadwal Aset Tetap",
    values: Object.fromEntries(
      periods.map((period) => [period.id, getValue(fixedAssetSchedule.totals[period.id] ?? emptyFixedAssetAmounts())]),
    ),
    affectsTotal,
    isDerived: true,
  };
}

function totalWithOverride(periods: Period[], lines: BalanceSheetLine[], overrideCategory: AccountCategory): Record<string, number> {
  const overrideLines = lines.filter((line) => line.categoryId === overrideCategory);
  const componentLines = lines.filter((line) => line.categoryId !== overrideCategory && line.affectsTotal !== false);
  const overrideValues = sumLineValues(periods, overrideLines);
  const componentValues = sumLineValues(periods, componentLines);

  return Object.fromEntries(periods.map((period) => [period.id, overrideValues[period.id] || componentValues[period.id] || 0]));
}

function sumLineValues(periods: Period[], lines: BalanceSheetLine[]): Record<string, number> {
  return Object.fromEntries(
    periods.map((period) => [period.id, lines.reduce((sum, line) => sum + (line.values[period.id] ?? 0), 0)]),
  );
}

function emptyFixedAssetAmounts(): FixedAssetPeriodAmounts {
  return {
    acquisitionBeginning: 0,
    acquisitionAdditions: 0,
    acquisitionEnding: 0,
    depreciationBeginning: 0,
    depreciationAdditions: 0,
    depreciationEnding: 0,
    netValue: 0,
  };
}
