export function validateManagedUserId(userId: string): string | null {
  if (!userId) {
    return "Isi NIP Pendek atau ID Pengguna.";
  }

  if (userId.length > 64) {
    return "NIP Pendek atau ID Pengguna maksimal 64 karakter.";
  }

  if (/[\u0000-\u001F\u007F/]/.test(userId)) {
    return "NIP Pendek atau ID Pengguna tidak boleh berisi karakter kontrol atau garis miring.";
  }

  return null;
}
