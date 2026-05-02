import { adjustedTotalAssets, adjustedTotalLiabilities } from "./calculations";
import { parseInputNumber } from "./case-model";
import type { FinancialStatementSnapshot } from "./types";

export type AamAdjustmentEntry = {
  adjustment: string;
  note: string;
};

export type AamAdjustmentState = Record<string, AamAdjustmentEntry>;

export type AamAdjustmentRole = "asset" | "liability";

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
};

export type AamEquityReconciliationLine = {
  label: string;
  value: number;
};

export type AamAdjustmentModel = {
  assetLines: AamAdjustmentLine[];
  liabilityLines: AamAdjustmentLine[];
  equityLines: AamEquityReconciliationLine[];
  historicalAssetTotal: number;
  historicalLiabilityTotal: number;
  assetAdjustmentTotal: number;
  liabilityAdjustmentTotal: number;
  adjustedAssetTotal: number;
  adjustedLiabilityTotal: number;
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

const assetDefinitions: LineDefinition[] = [
  {
    id: "cash-on-hand",
    role: "asset",
    section: "Aset lancar",
    label: "Kas di tangan",
    source: "Neraca: CASH_ON_HAND",
    value: (snapshot) => snapshot.cashOnHand,
  },
  {
    id: "cash-on-bank-deposit",
    role: "asset",
    section: "Aset lancar",
    label: "Kas di bank / deposito",
    source: "Neraca: CASH_ON_BANK",
    value: (snapshot) => snapshot.cashOnBankDeposit,
  },
  {
    id: "account-receivable",
    role: "asset",
    section: "Aset lancar",
    label: "Piutang usaha",
    source: "Neraca: ACCOUNT_RECEIVABLE",
    value: (snapshot) => snapshot.accountReceivable,
  },
  {
    id: "employee-receivable",
    role: "asset",
    section: "Aset lancar",
    label: "Piutang karyawan / piutang lain-lain",
    source: "Neraca: EMPLOYEE_RECEIVABLE",
    value: (snapshot) => snapshot.employeeReceivable,
  },
  {
    id: "inventory",
    role: "asset",
    section: "Aset lancar",
    label: "Persediaan",
    source: "Neraca: INVENTORY",
    value: (snapshot) => snapshot.inventory,
  },
  {
    id: "marketable-securities",
    role: "asset",
    section: "Aset lancar",
    label: "Surat berharga",
    source: "Neraca: MARKETABLE_SECURITIES",
    value: (snapshot) => snapshot.marketableSecurities,
  },
  {
    id: "excess-cash",
    role: "asset",
    section: "Aset lancar",
    label: "Kas berlebih",
    source: "Neraca: EXCESS_CASH",
    value: (snapshot) => snapshot.excessCash,
  },
  {
    id: "surplus-asset-cash",
    role: "asset",
    section: "Aset lancar",
    label: "Kas / aset surplus",
    source: "Neraca: SURPLUS_ASSET_CASH",
    value: (snapshot) => snapshot.surplusAssetCash,
  },
  {
    id: "other-current-assets",
    role: "asset",
    section: "Aset lancar",
    label: "Aset lancar lain-lain",
    source: "Neraca: CURRENT_ASSET yang belum terinci",
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
    id: "fixed-assets-net",
    role: "asset",
    section: "Aset tidak lancar",
    label: "Aset tetap neto",
    source: "Neraca / jadwal aset tetap: FIXED_ASSET",
    value: (snapshot) => snapshot.fixedAssetsNet,
  },
  {
    id: "non-operating-fixed-assets",
    role: "asset",
    section: "Aset tidak lancar",
    label: "Aset tetap non-operasional",
    source: "Neraca: NON_OPERATING_FIXED_ASSETS",
    value: (snapshot) => snapshot.nonOperatingFixedAssets,
  },
  {
    id: "intangible-assets",
    role: "asset",
    section: "Aset tidak lancar",
    label: "Aset takberwujud",
    source: "Neraca: INTANGIBLE_ASSETS",
    value: (snapshot) => snapshot.intangibleAssets,
  },
  {
    id: "other-non-current-assets",
    role: "asset",
    section: "Aset tidak lancar",
    label: "Aset tidak lancar lain-lain",
    source: "Neraca: NON_CURRENT_ASSET yang belum terinci",
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
    source: "Neraca: BANK_LOAN_SHORT_TERM",
    value: (snapshot) => snapshot.bankLoanShortTerm,
  },
  {
    id: "account-payable",
    role: "liability",
    section: "Liabilitas lancar",
    label: "Utang usaha",
    source: "Neraca: ACCOUNT_PAYABLE",
    value: (snapshot) => snapshot.accountPayable,
  },
  {
    id: "tax-payable",
    role: "liability",
    section: "Liabilitas lancar",
    label: "Utang pajak",
    source: "Neraca: TAX_PAYABLE",
    value: (snapshot) => snapshot.taxPayable,
  },
  {
    id: "other-payable",
    role: "liability",
    section: "Liabilitas lancar",
    label: "Utang lain-lain",
    source: "Neraca: OTHER_PAYABLE",
    value: (snapshot) => snapshot.otherPayable,
  },
  {
    id: "interest-payable",
    role: "liability",
    section: "Liabilitas lancar",
    label: "Utang bunga",
    source: "Neraca: INTEREST_PAYABLE",
    value: (snapshot) => snapshot.interestPayable,
  },
  {
    id: "other-current-liabilities",
    role: "liability",
    section: "Liabilitas lancar",
    label: "Liabilitas lancar lain-lain",
    source: "Neraca: CURRENT_LIABILITIES yang belum terinci",
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
    source: "Neraca: BANK_LOAN_LONG_TERM / INTEREST_BEARING_DEBT",
    value: (snapshot) => snapshot.bankLoanLongTerm,
  },
  {
    id: "other-non-current-liabilities",
    role: "liability",
    section: "Liabilitas tidak lancar",
    label: "Liabilitas tidak lancar lain-lain",
    source: "Neraca: NON_CURRENT_LIABILITIES yang belum terinci",
    value: (snapshot) => residual(snapshot.nonCurrentLiabilities, snapshot.bankLoanLongTerm),
  },
];

export const aamAdjustmentLineIds = new Set([
  ...[...assetDefinitions, ...liabilityDefinitions].map((definition) => definition.id),
  "asset-total-bridge",
  "liability-total-bridge",
]);

export function buildAamAdjustmentModel(
  snapshot: FinancialStatementSnapshot,
  adjustments: AamAdjustmentState = {},
): AamAdjustmentModel {
  const assetLines = buildLines(assetDefinitions, snapshot, adjustments);
  const liabilityLines = buildLines(liabilityDefinitions, snapshot, adjustments);
  const componentAssetTotal = sumLines(assetLines, "historical");
  const componentLiabilityTotal = sumLines(liabilityLines, "historical");
  const historicalAssetTotal = adjustedTotalAssets(snapshot);
  const historicalLiabilityTotal = adjustedTotalLiabilities(snapshot);
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
  const adjustedAssetTotal = historicalAssetTotal + assetAdjustmentTotal;
  const adjustedLiabilityTotal = historicalLiabilityTotal + liabilityAdjustmentTotal;
  const bookEquity =
    snapshot.paidUpCapital +
    snapshot.additionalPaidInCapital +
    snapshot.retainedEarningsSurplus +
    snapshot.retainedEarningsCurrentProfit;

  return {
    assetLines: bridgedAssetLines,
    liabilityLines: bridgedLiabilityLines,
    equityLines: [
      { label: "Modal disetor", value: snapshot.paidUpCapital },
      { label: "Tambahan modal disetor", value: snapshot.additionalPaidInCapital },
      { label: "Saldo laba ditahan", value: snapshot.retainedEarningsSurplus },
      { label: "Laba tahun berjalan", value: snapshot.retainedEarningsCurrentProfit },
      { label: "Ekuitas buku", value: bookEquity },
    ],
    historicalAssetTotal,
    historicalLiabilityTotal,
    assetAdjustmentTotal,
    liabilityAdjustmentTotal,
    adjustedAssetTotal,
    adjustedLiabilityTotal,
    historicalEquityValue: historicalAssetTotal - historicalLiabilityTotal,
    adjustedEquityValue: adjustedAssetTotal - adjustedLiabilityTotal,
    bookEquity,
    adjustedBookEquityGap: adjustedAssetTotal - adjustedLiabilityTotal - bookEquity,
    missingNoteCount: [...bridgedAssetLines, ...bridgedLiabilityLines].filter((line) => line.requiresNote).length,
  };
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
