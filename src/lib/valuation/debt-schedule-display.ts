import type { AnalysisRow } from "@/lib/valuation/section-analysis";

export function getDebtScheduleSourceLabel(row: AnalysisRow): string {
  switch (row.sourceType) {
    case "manual":
      return "Input pengguna";
    case "interoperable":
      return "Terhubung ke Neraca";
    case "formula":
      return "Dihitung otomatis";
    case "fallback":
      return "Mengikuti data tersedia";
    default:
      return "Sumber data";
  }
}

export function getDebtScheduleRuleLabel(row: AnalysisRow): string {
  const labels: Record<string, string> = {
    "account-payable": "Saldo utang usaha dari Neraca",
    "tax-payable": "Saldo utang pajak dari Neraca",
    "other-payable": "Saldo utang lain-lain dari Neraca",
    "operating-current-liabilities": "Utang operasi dari payable operasional",
    "short-rate": "Tarif pinjaman untuk jadwal",
    "short-beginning": "Saldo awal mengikuti periode sebelumnya",
    "short-addition": "Penambahan mengikuti perubahan pinjaman di Neraca",
    "short-repayment": "Pembayaran diisi pengguna",
    "short-ending": "Saldo akhir dihitung otomatis",
    "short-interest-payable": "Saldo utang bunga diisi pengguna",
    "long-rate": "Tarif pinjaman untuk jadwal",
    "long-beginning": "Saldo awal jangka panjang",
    "long-addition": "Penambahan diisi pengguna",
    "long-repayment": "Pembayaran diisi pengguna",
    "long-ending": "Saldo akhir dihitung otomatis",
    "long-interest-payable": "Saldo utang bunga diisi pengguna",
    "interest-payable": "Total utang bunga aktif",
    "interest-bearing-debt": "Total pinjaman berbunga aktif",
    "total-debt-schedule": "Total seluruh utang terjadwal",
  };

  return labels[row.key] ?? "Diolah sesuai jadwal utang";
}

export function getDebtScheduleDetailLabel(row: AnalysisRow): string {
  const details: Record<string, string> = {
    "account-payable": "Dipakai konsisten dengan saldo yang sudah dipetakan.",
    "tax-payable": "Tetap terhubung ke saldo utang pajak.",
    "other-payable": "Tetap terhubung ke saldo utang lain-lain.",
    "operating-current-liabilities": "Menggabungkan payable operasional.",
    "short-rate": "Parameter tarif; bukan saldo pokok pinjaman.",
    "short-beginning": "Periode lanjutan mengikuti saldo akhir sebelumnya.",
    "short-addition": "Nilai berubah saat saldo pinjaman di Neraca berubah.",
    "short-repayment": "Gunakan nilai negatif untuk pelunasan.",
    "short-ending": "Terbarui otomatis setelah input terkait berubah.",
    "short-interest-payable": "Masukkan saldo utang bunga jangka pendek.",
    "long-rate": "Parameter tarif; bukan saldo pokok pinjaman.",
    "long-beginning": "Periode pertama dapat diisi; periode berikutnya mengikuti saldo akhir sebelumnya.",
    "long-addition": "Gunakan input jadwal, dengan Neraca sebagai pembanding saat belum diisi.",
    "long-repayment": "Gunakan nilai negatif untuk pelunasan.",
    "long-ending": "Terbarui otomatis setelah input terkait berubah.",
    "long-interest-payable": "Masukkan saldo utang bunga jangka panjang.",
    "interest-payable": "Mengikuti jadwal bunga yang aktif.",
    "interest-bearing-debt": "Menggabungkan pinjaman jangka pendek dan jangka panjang.",
    "total-debt-schedule": "Menggabungkan payable, bunga, dan pinjaman aktif.",
  };

  return details[row.key] ?? "";
}

export function getDebtScheduleSourcePillLabel(sourceType: NonNullable<AnalysisRow["sourceType"]>): string {
  switch (sourceType) {
    case "manual":
      return "Manual";
    case "formula":
      return "Otomatis";
    case "interoperable":
      return "Neraca";
    case "fallback":
      return "Cadangan";
  }
}
