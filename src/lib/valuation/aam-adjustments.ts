import { adjustedTotalAssets, adjustedTotalLiabilities } from "./calculations";
import { parseInputNumber, type FixedAssetScheduleSummary } from "./case-model";
import type { FinancialStatementSnapshot } from "./types";

export type AamAdjustmentEntry = {
  adjustment: string;
  note: string;
};

export type AamAdjustmentState = Record<string, AamAdjustmentEntry>;

export type AamAdjustmentRole = "asset" | "liability" | "equity";

export type AamAdjustmentLine = {
  id: string;
  role: AamAdjustmentRole;
  section: string;
  label: string;
  source: string;
  historical: number;
  adjustmentInput: string;
  adjustment: number;
  adjusted: number;
  note: string;
  requiresNote: boolean;
  isBridgeLine?: boolean;
  isReadOnly?: boolean;
  readOnlyReason?: string;
  isAutoRevaluationLine?: boolean;
};

export type AamEquityReconciliationLine = {
  label: string;
  value: number;
};

export type AamAdjustmentModel = {
  assetLines: AamAdjustmentLine[];
  liabilityLines: AamAdjustmentLine[];
  equityLines: AamAdjustmentLine[];
  historicalAssetTotal: number;
  historicalLiabilityTotal: number;
  historicalEquityTotal: number;
  historicalLiabilityEquityTotal: number;
  historicalBalanceGap: number;
  assetAdjustmentTotal: number;
  liabilityAdjustmentTotal: number;
  equityManualAdjustmentTotal: number;
  equityRevaluationAdjustment: number;
  equityAdjustmentTotal: number;
  liabilityEquityAdjustmentTotal: number;
  adjustedAssetTotal: number;
  adjustedLiabilityTotal: number;
  adjustedBookEquity: number;
  adjustedLiabilityEquityTotal: number;
  adjustedBalanceGap: number;
  historicalEquityValue: number;
  adjustedEquityValue: number;
  bookEquity: number;
  adjustedBookEquityGap: number;
  missingNoteCount: number;
};

type LineDefinition = {
  id: string;
  role: AamAdjustmentRole;
  section: string;
  label: string;
  source: string;
  value: (snapshot: FinancialStatementSnapshot) => number;
};

const fixedAssetScheduleLineIdPrefix = "fixed-asset-schedule:";

const assetDefinitions: LineDefinition[] = [
  {
    id: "cash-on-hand",
    role: "asset",
    section: "Aset lancar",
    label: "Kas di tangan",
    source: "Neraca: Kas di tangan",
    value: (snapshot) => snapshot.cashOnHand,
  },
  {
    id: "cash-on-bank-deposit",
    role: "asset",
    section: "Aset lancar",
    label: "Kas di bank / deposito",
    source: "Neraca: Kas di bank / deposito",
    value: (snapshot) => snapshot.cashOnBankDeposit,
  },
  {
    id: "account-receivable",
    role: "asset",
    section: "Aset lancar",
    label: "Piutang usaha",
    source: "Neraca: Piutang usaha",
    value: (snapshot) => snapshot.accountReceivable,
  },
  {
    id: "employee-receivable",
    role: "asset",
    section: "Aset lancar",
    label: "Piutang karyawan / piutang lain-lain",
    source: "Neraca: Piutang karyawan / piutang lain-lain",
    value: (snapshot) => snapshot.employeeReceivable,
  },
  {
    id: "inventory",
    role: "asset",
    section: "Aset lancar",
    label: "Persediaan",
    source: "Neraca: Persediaan",
    value: (snapshot) => snapshot.inventory,
  },
  {
    id: "marketable-securities",
    role: "asset",
    section: "Aset lancar",
    label: "Surat berharga",
    source: "Neraca: Surat berharga",
    value: (snapshot) => snapshot.marketableSecurities,
  },
  {
    id: "excess-cash",
    role: "asset",
    section: "Aset lancar",
    label: "Kas berlebih",
    source: "Neraca: Kas berlebih",
    value: (snapshot) => snapshot.excessCash,
  },
  {
    id: "surplus-asset-cash",
    role: "asset",
    section: "Aset lancar",
    label: "Kas / aset surplus",
    source: "Neraca: Kas / aset surplus",
    value: (snapshot) => snapshot.surplusAssetCash,
  },
  {
    id: "other-current-assets",
    role: "asset",
    section: "Aset lancar",
    label: "Aset lancar lain-lain",
    source: "Neraca: Aset lancar yang belum terinci",
    value: (snapshot) =>
      residual(
        snapshot.currentAssets,
        snapshot.cashOnHand +
          snapshot.cashOnBankDeposit +
          snapshot.accountReceivable +
          snapshot.employeeReceivable +
          snapshot.inventory +
          snapshot.marketableSecurities +
          snapshot.excessCash +
          snapshot.surplusAssetCash,
      ),
  },
  {
    id: "non-operating-fixed-assets",
    role: "asset",
    section: "Aset tidak lancar",
    label: "Aset tetap non-operasional",
    source: "Neraca: Aset tetap non-operasional",
    value: (snapshot) => snapshot.nonOperatingFixedAssets,
  },
  {
    id: "intangible-assets",
    role: "asset",
    section: "Aset tidak lancar",
    label: "Aset takberwujud",
    source: "Neraca: Aset takberwujud",
    value: (snapshot) => snapshot.intangibleAssets,
  },
  {
    id: "other-non-current-assets",
    role: "asset",
    section: "Aset tidak lancar",
    label: "Aset tidak lancar lain-lain",
    source: "Neraca: Aset tidak lancar yang belum terinci",
    value: (snapshot) =>
      residual(snapshot.nonCurrentAssets, snapshot.fixedAssetsNet + snapshot.nonOperatingFixedAssets + snapshot.intangibleAssets),
  },
];

const liabilityDefinitions: LineDefinition[] = [
  {
    id: "bank-loan-short-term",
    role: "liability",
    section: "Liabilitas lancar",
    label: "Pinjaman bank jangka pendek",
    source: "Neraca: Pinjaman bank jangka pendek",
    value: (snapshot) => snapshot.bankLoanShortTerm,
  },
  {
    id: "account-payable",
    role: "liability",
    section: "Liabilitas lancar",
    label: "Utang usaha",
    source: "Neraca: Utang usaha",
    value: (snapshot) => snapshot.accountPayable,
  },
  {
    id: "tax-payable",
    role: "liability",
    section: "Liabilitas lancar",
    label: "Utang pajak",
    source: "Neraca: Utang pajak",
    value: (snapshot) => snapshot.taxPayable,
  },
  {
    id: "other-payable",
    role: "liability",
    section: "Liabilitas lancar",
    label: "Utang lain-lain",
    source: "Neraca: Utang lain-lain",
    value: (snapshot) => snapshot.otherPayable,
  },
  {
    id: "interest-payable",
    role: "liability",
    section: "Liabilitas lancar",
    label: "Utang bunga",
    source: "Neraca: Utang bunga",
    value: (snapshot) => snapshot.interestPayable,
  },
  {
    id: "other-current-liabilities",
    role: "liability",
    section: "Liabilitas lancar",
    label: "Liabilitas lancar lain-lain",
    source: "Neraca: Liabilitas lancar yang belum terinci",
    value: (snapshot) =>
      residual(
        snapshot.currentLiabilities,
        snapshot.bankLoanShortTerm + snapshot.accountPayable + snapshot.taxPayable + snapshot.otherPayable + snapshot.interestPayable,
      ),
  },
  {
    id: "bank-loan-long-term",
    role: "liability",
    section: "Liabilitas tidak lancar",
    label: "Pinjaman bank jangka panjang",
    source: "Neraca: Pinjaman bank jangka panjang / utang berbunga",
    value: (snapshot) => snapshot.bankLoanLongTerm,
  },
  {
    id: "other-non-current-liabilities",
    role: "liability",
    section: "Liabilitas tidak lancar",
    label: "Liabilitas tidak lancar lain-lain",
    source: "Neraca: Liabilitas tidak lancar yang belum terinci",
    value: (snapshot) => residual(snapshot.nonCurrentLiabilities, snapshot.bankLoanLongTerm),
  },
];

const equityDefinitions: LineDefinition[] = [
  {
    id: "paid-up-capital",
    role: "equity",
    section: "Ekuitas",
    label: "Modal disetor",
    source: "Neraca: Modal disetor",
    value: (snapshot) => snapshot.paidUpCapital,
  },
  {
    id: "additional-paid-in-capital",
    role: "equity",
    section: "Ekuitas",
    label: "Tambahan modal disetor",
    source: "Neraca: Tambahan modal disetor",
    value: (snapshot) => snapshot.additionalPaidInCapital,
  },
  {
    id: "retained-earnings-surplus",
    role: "equity",
    section: "Ekuitas",
    label: "Saldo laba ditahan / defisit",
    source: "Neraca: Saldo laba ditahan / defisit",
    value: (snapshot) => snapshot.retainedEarningsSurplus,
  },
  {
    id: "retained-earnings-current-profit",
    role: "equity",
    section: "Ekuitas",
    label: "Laba tahun berjalan",
    source: "Neraca: Laba tahun berjalan",
    value: (snapshot) => snapshot.retainedEarningsCurrentProfit,
  },
];

export const aamAdjustmentLineIds = new Set([
  ...[...assetDefinitions, ...liabilityDefinitions, ...equityDefinitions].map((definition) => definition.id),
  "fixed-assets-net",
  "asset-total-bridge",
  "liability-total-bridge",
]);

export function isAamAdjustmentLineId(lineId: string): boolean {
  return aamAdjustmentLineIds.has(lineId) || lineId.startsWith(fixedAssetScheduleLineIdPrefix);
}

export function buildAamAdjustmentModel(
  snapshot: FinancialStatementSnapshot,
  adjustments: AamAdjustmentState = {},
  options: { fixedAssetSchedule?: FixedAssetScheduleSummary; activePeriodId?: string } = {},
): AamAdjustmentModel {
  const assetLines = buildLines(buildAssetDefinitions(snapshot, options), snapshot, adjustments);
  const liabilityLines = buildLines(liabilityDefinitions, snapshot, adjustments);
  const manualEquityLines = buildLines(equityDefinitions, snapshot, adjustments);
  const componentAssetTotal = sumLines(assetLines, "historical");
  const componentLiabilityTotal = sumLines(liabilityLines, "historical");
  const historicalAssetTotal = adjustedTotalAssets(snapshot);
  const historicalLiabilityTotal = adjustedTotalLiabilities(snapshot);
  const bookEquity =
    snapshot.paidUpCapital +
    snapshot.additionalPaidInCapital +
    snapshot.retainedEarningsSurplus +
    snapshot.retainedEarningsCurrentProfit;
  const bridgedAssetLines = withBridgeLine({
    lines: assetLines,
    role: "asset",
    section: "Rekonsiliasi aset",
    label: "Selisih ke total aset neraca",
    source: "Total aset historis dikurangi subtotal pos AAM",
    bridgeId: "asset-total-bridge",
    difference: historicalAssetTotal - componentAssetTotal,
    adjustments,
  });
  const bridgedLiabilityLines = withBridgeLine({
    lines: liabilityLines,
    role: "liability",
    section: "Rekonsiliasi liabilitas",
    label: "Selisih ke total liabilitas neraca",
    source: "Total liabilitas historis dikurangi subtotal pos AAM",
    bridgeId: "liability-total-bridge",
    difference: historicalLiabilityTotal - componentLiabilityTotal,
    adjustments,
  });
  const assetAdjustmentTotal = sumLines(bridgedAssetLines, "adjustment");
  const liabilityAdjustmentTotal = sumLines(bridgedLiabilityLines, "adjustment");
  const equityManualAdjustmentTotal = sumLines(manualEquityLines, "adjustment");
  const equityRevaluationAdjustment = assetAdjustmentTotal - liabilityAdjustmentTotal - equityManualAdjustmentTotal;
  const equityLines = [
    ...manualEquityLines,
    buildReadOnlyLine({
      id: "changes-on-asset-revaluation",
      role: "equity",
      section: "Ekuitas",
      label: "Changes on Asset Revaluation",
      source: "AAM: penyeimbang otomatis atas penyesuaian aset, liabilitas, dan ekuitas",
      historical: 0,
      adjustment: equityRevaluationAdjustment,
      note: "Otomatis = penyesuaian aset - penyesuaian liabilitas - penyesuaian ekuitas manual.",
      readOnlyReason: "Read-only; dihitung otomatis dari seluruh penyesuaian AAM.",
      isAutoRevaluationLine: true,
    }),
  ];
  const equityAdjustmentTotal = sumLines(equityLines, "adjustment");
  const adjustedAssetTotal = historicalAssetTotal + assetAdjustmentTotal;
  const adjustedLiabilityTotal = historicalLiabilityTotal + liabilityAdjustmentTotal;
  const adjustedEquityValue = adjustedAssetTotal - adjustedLiabilityTotal;
  const adjustedBookEquity = bookEquity + equityAdjustmentTotal;
  const historicalLiabilityEquityTotal = historicalLiabilityTotal + bookEquity;
  const liabilityEquityAdjustmentTotal = liabilityAdjustmentTotal + equityAdjustmentTotal;
  const adjustedLiabilityEquityTotal = adjustedLiabilityTotal + adjustedBookEquity;
  const historicalBalanceGap = historicalAssetTotal - historicalLiabilityEquityTotal;
  const adjustedBalanceGap = adjustedAssetTotal - adjustedLiabilityEquityTotal;

  return {
    assetLines: bridgedAssetLines,
    liabilityLines: bridgedLiabilityLines,
    equityLines,
    historicalAssetTotal,
    historicalLiabilityTotal,
    historicalEquityTotal: bookEquity,
    historicalLiabilityEquityTotal,
    historicalBalanceGap,
    assetAdjustmentTotal,
    liabilityAdjustmentTotal,
    equityManualAdjustmentTotal,
    equityRevaluationAdjustment,
    equityAdjustmentTotal,
    liabilityEquityAdjustmentTotal,
    adjustedAssetTotal,
    adjustedLiabilityTotal,
    adjustedBookEquity,
    adjustedLiabilityEquityTotal,
    adjustedBalanceGap,
    historicalEquityValue: historicalAssetTotal - historicalLiabilityTotal,
    adjustedEquityValue,
    bookEquity,
    adjustedBookEquityGap: adjustedEquityValue - adjustedBookEquity,
    missingNoteCount: [...bridgedAssetLines, ...bridgedLiabilityLines, ...manualEquityLines].filter((line) => line.requiresNote)
      .length,
  };
}

function buildAssetDefinitions(
  snapshot: FinancialStatementSnapshot,
  { fixedAssetSchedule, activePeriodId }: { fixedAssetSchedule?: FixedAssetScheduleSummary; activePeriodId?: string },
): LineDefinition[] {
  const fixedAssetLines = buildFixedAssetScheduleDefinitions(fixedAssetSchedule, activePeriodId);

  return [
    ...assetDefinitions.slice(0, 9),
    ...(fixedAssetLines.length > 0
      ? fixedAssetLines
      : [
          {
            id: "fixed-assets-net",
            role: "asset" as const,
            section: "Aset tidak lancar",
            label: "Aset tetap neto",
            source: "Neraca / jadwal aset tetap: Aset tetap neto",
            value: () => snapshot.fixedAssetsNet,
          },
        ]),
    ...assetDefinitions.slice(9),
  ];
}

function buildFixedAssetScheduleDefinitions(
  fixedAssetSchedule: FixedAssetScheduleSummary | undefined,
  activePeriodId: string | undefined,
): LineDefinition[] {
  if (!fixedAssetSchedule?.hasInput || !activePeriodId) {
    return [];
  }

  return fixedAssetSchedule.rows.flatMap((computedRow): LineDefinition[] => {
    const label = computedRow.row.assetName.trim();
    const amount = computedRow.amounts[activePeriodId]?.netValue ?? 0;
    const hasRowInput = Object.values(computedRow.row.values).some((periodValues) =>
      Object.values(periodValues).some((value) => value.trim() !== ""),
    );

    if (!label && !hasRowInput && amount === 0) {
      return [];
    }

    return [
      {
        id: `${fixedAssetScheduleLineIdPrefix}${computedRow.row.id}`,
        role: "asset",
        section: "Aset tidak lancar",
        label: label || "Kelas aset tanpa nama",
        source: "Jadwal aset tetap: C. Nilai Buku Neto Aset Tetap",
        value: () => amount,
      },
    ];
  });
}

function buildLines(
  definitions: LineDefinition[],
  snapshot: FinancialStatementSnapshot,
  adjustments: AamAdjustmentState,
): AamAdjustmentLine[] {
  return definitions.map((definition) =>
    buildLine({
      ...definition,
      historical: definition.value(snapshot),
      adjustments,
    }),
  );
}

function buildLine({
  id,
  role,
  section,
  label,
  source,
  historical,
  adjustments,
  isBridgeLine = false,
}: LineDefinition & { historical: number; adjustments: AamAdjustmentState; isBridgeLine?: boolean }): AamAdjustmentLine {
  const entry = adjustments[id] ?? { adjustment: "", note: "" };
  const adjustment = parseInputNumber(entry.adjustment);

  return {
    id,
    role,
    section,
    label,
    source,
    historical,
    adjustmentInput: entry.adjustment,
    adjustment,
    adjusted: historical + adjustment,
    note: entry.note,
    requiresNote: adjustment !== 0 && !entry.note.trim(),
    isBridgeLine,
  };
}

function buildReadOnlyLine({
  id,
  role,
  section,
  label,
  source,
  historical,
  adjustment,
  note,
  readOnlyReason,
  isAutoRevaluationLine = false,
}: {
  id: string;
  role: AamAdjustmentRole;
  section: string;
  label: string;
  source: string;
  historical: number;
  adjustment: number;
  note: string;
  readOnlyReason: string;
  isAutoRevaluationLine?: boolean;
}): AamAdjustmentLine {
  return {
    id,
    role,
    section,
    label,
    source,
    historical,
    adjustmentInput: "",
    adjustment,
    adjusted: historical + adjustment,
    note,
    requiresNote: false,
    isReadOnly: true,
    readOnlyReason,
    isAutoRevaluationLine,
  };
}

function withBridgeLine({
  lines,
  role,
  section,
  label,
  source,
  bridgeId,
  difference,
  adjustments,
}: {
  lines: AamAdjustmentLine[];
  role: AamAdjustmentRole;
  section: string;
  label: string;
  source: string;
  bridgeId: string;
  difference: number;
  adjustments: AamAdjustmentState;
}): AamAdjustmentLine[] {
  if (Math.abs(difference) < 0.5 && !adjustments[bridgeId]?.adjustment.trim() && !adjustments[bridgeId]?.note.trim()) {
    return lines;
  }

  return [
    ...lines,
    buildLine({
      id: bridgeId,
      role,
      section,
      label,
      source,
      historical: difference,
      adjustments,
      isBridgeLine: true,
      value: () => difference,
    }),
  ];
}

function sumLines(lines: AamAdjustmentLine[], key: "historical" | "adjustment"): number {
  return lines.reduce((sum, line) => sum + line[key], 0);
}

function residual(total: number, detailedTotal: number): number {
  const difference = total - detailedTotal;
  return Math.abs(difference) < 0.5 ? 0 : difference;
}
