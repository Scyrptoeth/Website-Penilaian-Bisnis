export const eemSensitivityContext = {
  base: {
    label: "EEM - skenario dasar",
    formula: "NTA + excess earnings yang dikapitalisasi + aset non-operasional - utang berbunga",
    note:
      "Nilai ekuitas EEM sebelum utang pajak diperlakukan sebagai kewajiban debt-like; utang pajak tetap dikeluarkan dari operating NWC.",
  },
  taxPayableDebtLike: {
    label: "EEM - utang pajak debt-like",
    formula: "EEM skenario dasar - utang pajak",
    note:
      "Skenario pembanding yang mengurangkan utang pajak sebagai kewajiban debt-like; selisih terhadap dasar sama dengan saldo utang pajak.",
  },
  differenceDriver: {
    label: "Driver selisih",
    note: "Poin krusial perbedaan nilai adalah perlakuan utang pajak sebagai pengurang ekuitas satu kali.",
  },
} as const;

export function buildEemTaxPayableDebtLikeNote(formattedTaxPayable: string) {
  return `${eemSensitivityContext.taxPayableDebtLike.note} Driver selisih: ${formattedTaxPayable}.`;
}
