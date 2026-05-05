export type KluSectorConfidence = "High" | "Medium" | "Low";

export interface KluSectorRecord {
  code: string;
  title: string;
  sector: string;
  confidence: KluSectorConfidence;
  alternativeSector: string;
  reason: string;
  reviewNote: string;
}

export const kluSectorRecords = [
  {
    "code": "01111",
    "title": "PERTANIAN JAGUNG",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Pertanian/peternakan menghasilkan komoditas pangan atau barang primer.",
    "reviewNote": ""
  },
  {
    "code": "01112",
    "title": "PERTANIAN GANDUM",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Pertanian/peternakan menghasilkan komoditas pangan atau barang primer.",
    "reviewNote": ""
  },
  {
    "code": "01113",
    "title": "PERTANIAN KEDELAI",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Pertanian/peternakan menghasilkan komoditas pangan atau barang primer.",
    "reviewNote": ""
  },
  {
    "code": "01114",
    "title": "PERTANIAN KACANG TANAH",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Pertanian/peternakan menghasilkan komoditas pangan atau barang primer.",
    "reviewNote": ""
  },
  {
    "code": "01115",
    "title": "PERTANIAN KACANG HIJAU",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Pertanian/peternakan menghasilkan komoditas pangan atau barang primer.",
    "reviewNote": ""
  },
  {
    "code": "01116",
    "title": "PERTANIAN ANEKA KACANG HORTIKULTURA",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Pertanian/peternakan menghasilkan komoditas pangan atau barang primer.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "01117",
    "title": "PERTANIAN BIJI-BIJIAN PENGHASIL MINYAK MAKAN",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Pertanian/peternakan menghasilkan komoditas pangan atau barang primer.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "01118",
    "title": "PERTANIAN BIJI-BIJIAN PENGHASIL BUKAN MINYAK MAKAN",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Pertanian/peternakan menghasilkan komoditas pangan atau barang primer.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "01119",
    "title": "PERTANIAN SEREALIA LAINNYA, ANEKA KACANG DAN BIJI-BIJIAN PENGHASIL MINYAK LAINNYA",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Pertanian/peternakan menghasilkan komoditas pangan atau barang primer.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "01121",
    "title": "PERTANIAN PADI HIBRIDA",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Pertanian/peternakan menghasilkan komoditas pangan atau barang primer.",
    "reviewNote": ""
  },
  {
    "code": "01122",
    "title": "PERTANIAN PADI INBRIDA",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Pertanian/peternakan menghasilkan komoditas pangan atau barang primer.",
    "reviewNote": ""
  },
  {
    "code": "01131",
    "title": "PERTANIAN HORTIKULTURA SAYURAN DAUN",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Pertanian/peternakan menghasilkan komoditas pangan atau barang primer.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "01132",
    "title": "PERTANIAN HORTIKULTURA BUAH",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Pertanian/peternakan menghasilkan komoditas pangan atau barang primer.",
    "reviewNote": ""
  },
  {
    "code": "01133",
    "title": "PERTANIAN HORTIKULTURA SAYURAN BUAH",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Pertanian/peternakan menghasilkan komoditas pangan atau barang primer.",
    "reviewNote": ""
  },
  {
    "code": "01134",
    "title": "PERTANIAN HORTIKULTURA SAYURAN UMBI",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Pertanian/peternakan menghasilkan komoditas pangan atau barang primer.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "01135",
    "title": "PERTANIAN ANEKA UMBI PALAWIJA",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Pertanian/peternakan menghasilkan komoditas pangan atau barang primer.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "01136",
    "title": "PERTANIAN JAMUR",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Pertanian/peternakan menghasilkan komoditas pangan atau barang primer.",
    "reviewNote": ""
  },
  {
    "code": "01137",
    "title": "PERTANIAN BIT GULA DAN TANAMAN PEMANIS BUKAN TEBU",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Pertanian/peternakan menghasilkan komoditas pangan atau barang primer.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "01139",
    "title": "PERTANIAN SAYURAN, BUAH DAN ANEKA UMBI LAINNYA",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Pertanian/peternakan menghasilkan komoditas pangan atau barang primer.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "01140",
    "title": "PERKEBUNAN TEBU",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Pertanian/peternakan menghasilkan komoditas pangan atau barang primer.",
    "reviewNote": ""
  },
  {
    "code": "01150",
    "title": "PERKEBUNAN TEMBAKAU",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Pertanian/peternakan menghasilkan komoditas pangan atau barang primer.",
    "reviewNote": ""
  },
  {
    "code": "01160",
    "title": "PERTANIAN TANAMAN BERSERAT",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Pertanian/peternakan menghasilkan komoditas pangan atau barang primer.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "01191",
    "title": "PERTANIAN TANAMAN PAKAN TERNAK",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Pertanian/peternakan menghasilkan komoditas pangan atau barang primer.",
    "reviewNote": ""
  },
  {
    "code": "01192",
    "title": "PERBENIHAN TANAMAN PAKAN TERNAK DAN PEMBIBITAN BIT (BUKAN BIT GULA)",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Pertanian/peternakan menghasilkan komoditas pangan atau barang primer.",
    "reviewNote": ""
  },
  {
    "code": "01193",
    "title": "PERTANIAN TANAMAN BUNGA",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Pertanian/peternakan menghasilkan komoditas pangan atau barang primer.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "01194",
    "title": "PERTANIAN PEMBIBITAN TANAMAN BUNGA",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Pertanian/peternakan menghasilkan komoditas pangan atau barang primer.",
    "reviewNote": ""
  },
  {
    "code": "01199",
    "title": "PERTANIAN TANAMAN SEMUSIM LAINNYA YTDL",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Pertanian/peternakan menghasilkan komoditas pangan atau barang primer.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "01210",
    "title": "PERTANIAN BUAH ANGGUR",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Pertanian/peternakan menghasilkan komoditas pangan atau barang primer.",
    "reviewNote": ""
  },
  {
    "code": "01220",
    "title": "PERTANIAN BUAH-BUAHAN TROPIS DAN SUBTROPIS",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Pertanian/peternakan menghasilkan komoditas pangan atau barang primer.",
    "reviewNote": ""
  },
  {
    "code": "01230",
    "title": "PERTANIAN BUAH JERUK",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Pertanian/peternakan menghasilkan komoditas pangan atau barang primer.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "01240",
    "title": "PERTANIAN BUAH APEL DAN BUAH BATU (POME AND STONE FRUITS)",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Pertanian/peternakan menghasilkan komoditas pangan atau barang primer.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "01251",
    "title": "PERTANIAN BUAH BERI",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Pertanian/peternakan menghasilkan komoditas pangan atau barang primer.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "01252",
    "title": "PERTANIAN BUAH BIJI KACANG-KACANGAN",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Pertanian/peternakan menghasilkan komoditas pangan atau barang primer.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "01253",
    "title": "PERTANIAN SAYURAN TAHUNAN",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Pertanian/peternakan menghasilkan komoditas pangan atau barang primer.",
    "reviewNote": ""
  },
  {
    "code": "01259",
    "title": "PERTANIAN BUAH SEMAK LAINNYA",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Pertanian/peternakan menghasilkan komoditas pangan atau barang primer.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "01261",
    "title": "PERKEBUNAN BUAH KELAPA",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Pertanian/peternakan menghasilkan komoditas pangan atau barang primer.",
    "reviewNote": ""
  },
  {
    "code": "01262",
    "title": "PERKEBUNAN BUAH KELAPA SAWIT",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Pertanian/peternakan menghasilkan komoditas pangan atau barang primer.",
    "reviewNote": ""
  },
  {
    "code": "01269",
    "title": "PERKEBUNAN BUAH OLEAGINOUS LAINNYA",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Pertanian/peternakan menghasilkan komoditas pangan atau barang primer.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "01270",
    "title": "PERTANIAN TANAMAN UNTUK BAHAN MINUMAN",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Pertanian/peternakan menghasilkan komoditas pangan atau barang primer.",
    "reviewNote": ""
  },
  {
    "code": "01281",
    "title": "PERKEBUNAN LADA",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Pertanian/peternakan menghasilkan komoditas pangan atau barang primer.",
    "reviewNote": ""
  },
  {
    "code": "01282",
    "title": "PERKEBUNAN CENGKEH",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Pertanian/peternakan menghasilkan komoditas pangan atau barang primer.",
    "reviewNote": ""
  },
  {
    "code": "01283",
    "title": "PERTANIAN CABAI",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Pertanian/peternakan menghasilkan komoditas pangan atau barang primer.",
    "reviewNote": ""
  },
  {
    "code": "01284",
    "title": "PERKEBUNAN TANAMAN AROMATIK/PENYEGAR",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Pertanian/peternakan menghasilkan komoditas pangan atau barang primer.",
    "reviewNote": ""
  },
  {
    "code": "01285",
    "title": "PERTANIAN TANAMAN OBAT ATAU BIOFARMAKA RIMPANG",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Pertanian/peternakan menghasilkan komoditas pangan atau barang primer.",
    "reviewNote": ""
  },
  {
    "code": "01286",
    "title": "PERTANIAN TANAMAN OBAT ATAU BIOFARMAKA NON RIMPANG",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Pertanian/peternakan menghasilkan komoditas pangan atau barang primer.",
    "reviewNote": ""
  },
  {
    "code": "01287",
    "title": "PERTANIAN TANAMAN NARKOTIKA DAN TANAMAN OBAT TERLARANG",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Pertanian/peternakan menghasilkan komoditas pangan atau barang primer.",
    "reviewNote": ""
  },
  {
    "code": "01289",
    "title": "PERTANIAN TANAMAN REMPAH-REMPAH, AROMATIK/PENYEGAR, DAN OBAT LAINNYA",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Pertanian/peternakan menghasilkan komoditas pangan atau barang primer.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "01291",
    "title": "PERKEBUNAN KARET DAN TANAMAN PENGHASIL GETAH LAINNYA",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Pertanian/peternakan menghasilkan komoditas pangan atau barang primer.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "01299",
    "title": "PERTANIAN CEMARA DAN TANAMAN TAHUNAN LAINNYA",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Pertanian/peternakan menghasilkan komoditas pangan atau barang primer.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "01301",
    "title": "PERTANIAN TANAMAN HIAS",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Pertanian/peternakan menghasilkan komoditas pangan atau barang primer.",
    "reviewNote": ""
  },
  {
    "code": "01302",
    "title": "PERTANIAN PENGEMBANGBIAKAN TANAMAN",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Pertanian/peternakan menghasilkan komoditas pangan atau barang primer.",
    "reviewNote": ""
  },
  {
    "code": "01411",
    "title": "PEMBIBITAN DAN BUDIDAYA SAPI POTONG",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Pertanian/peternakan menghasilkan komoditas pangan atau barang primer.",
    "reviewNote": ""
  },
  {
    "code": "01412",
    "title": "PEMBIBITAN DAN BUDIDAYA SAPI PERAH",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Pertanian/peternakan menghasilkan komoditas pangan atau barang primer.",
    "reviewNote": ""
  },
  {
    "code": "01413",
    "title": "PEMBIBITAN DAN BUDIDAYA KERBAU POTONG",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Pertanian/peternakan menghasilkan komoditas pangan atau barang primer.",
    "reviewNote": ""
  },
  {
    "code": "01414",
    "title": "PEMBIBITAN DAN BUDIDAYA KERBAU PERAH",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Pertanian/peternakan menghasilkan komoditas pangan atau barang primer.",
    "reviewNote": ""
  },
  {
    "code": "01420",
    "title": "PETERNAKAN KUDA DAN SEJENISNYA",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Pertanian/peternakan menghasilkan komoditas pangan atau barang primer.",
    "reviewNote": ""
  },
  {
    "code": "01430",
    "title": "PETERNAKAN UNTA DAN SEJENISNYA",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Pertanian/peternakan menghasilkan komoditas pangan atau barang primer.",
    "reviewNote": ""
  },
  {
    "code": "01441",
    "title": "PEMBIBITAN DAN BUDIDAYA DOMBA POTONG",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Pertanian/peternakan menghasilkan komoditas pangan atau barang primer.",
    "reviewNote": ""
  },
  {
    "code": "01442",
    "title": "PEMBIBITAN DAN BUDIDAYA KAMBING POTONG",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Pertanian/peternakan menghasilkan komoditas pangan atau barang primer.",
    "reviewNote": ""
  },
  {
    "code": "01443",
    "title": "PEMBIBITAN DAN BUDIDAYA KAMBING PERAH",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Pertanian/peternakan menghasilkan komoditas pangan atau barang primer.",
    "reviewNote": ""
  },
  {
    "code": "01444",
    "title": "PEMBIBITAN DAN BUDIDAYA DOMBA PERAH",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Pertanian/peternakan menghasilkan komoditas pangan atau barang primer.",
    "reviewNote": ""
  },
  {
    "code": "01445",
    "title": "PRODUKSI BULU DOMBA MENTAH/RAW WOOL",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Pertanian/peternakan menghasilkan komoditas pangan atau barang primer.",
    "reviewNote": ""
  },
  {
    "code": "01450",
    "title": "PETERNAKAN BABI",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Pertanian/peternakan menghasilkan komoditas pangan atau barang primer.",
    "reviewNote": ""
  },
  {
    "code": "01461",
    "title": "BUDIDAYA AYAM RAS PEDAGING",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Pertanian/peternakan menghasilkan komoditas pangan atau barang primer.",
    "reviewNote": ""
  },
  {
    "code": "01462",
    "title": "BUDIDAYA AYAM RAS PETELUR",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Pertanian/peternakan menghasilkan komoditas pangan atau barang primer.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "01463",
    "title": "PEMBIBITAN AYAM LOKAL DAN PERSILANGANNYA",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Pertanian/peternakan menghasilkan komoditas pangan atau barang primer.",
    "reviewNote": ""
  },
  {
    "code": "01464",
    "title": "BUDIDAYA AYAM LOKAL DAN PERSILANGANNYA",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Pertanian/peternakan menghasilkan komoditas pangan atau barang primer.",
    "reviewNote": ""
  },
  {
    "code": "01465",
    "title": "PEMBIBITAN DAN BUDIDAYA ITIK DAN/ATAU BEBEK",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Pertanian/peternakan menghasilkan komoditas pangan atau barang primer.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "01466",
    "title": "PEMBIBITAN DAN BUDIDAYA BURUNG PUYUH",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Pertanian/peternakan menghasilkan komoditas pangan atau barang primer.",
    "reviewNote": ""
  },
  {
    "code": "01467",
    "title": "PEMBIBITAN DAN BUDIDAYA BURUNG MERPATI",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Pertanian/peternakan menghasilkan komoditas pangan atau barang primer.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "01468",
    "title": "PEMBIBITAN AYAM RAS",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Pertanian/peternakan menghasilkan komoditas pangan atau barang primer.",
    "reviewNote": ""
  },
  {
    "code": "01469",
    "title": "PEMBIBITAN DAN BUDIDAYA TERNAK UNGGAS LAINNYA",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Pertanian/peternakan menghasilkan komoditas pangan atau barang primer.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "01491",
    "title": "PEMBIBITAN DAN BUDIDAYA BURUNG UNTA",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Pertanian/peternakan menghasilkan komoditas pangan atau barang primer.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "01492",
    "title": "PENGUSAHAAN KOKON/KEPOMPONG ULAT SUTERA",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Pertanian/peternakan menghasilkan komoditas pangan atau barang primer.",
    "reviewNote": ""
  },
  {
    "code": "01493",
    "title": "PEMBIBITAN DAN BUDIDAYA LEBAH",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Pertanian/peternakan menghasilkan komoditas pangan atau barang primer.",
    "reviewNote": ""
  },
  {
    "code": "01494",
    "title": "PEMBIBITAN DAN BUDIDAYA RUSA",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Pertanian/peternakan menghasilkan komoditas pangan atau barang primer.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "01495",
    "title": "PEMBIBITAN DAN BUDIDAYA KELINCI",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Pertanian/peternakan menghasilkan komoditas pangan atau barang primer.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "01496",
    "title": "PEMBIBITAN DAN BUDIDAYA CACING",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Pertanian/peternakan menghasilkan komoditas pangan atau barang primer.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "01497",
    "title": "PEMBIBITAN DAN BUDIDAYA BURUNG WALET",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Pertanian/peternakan menghasilkan komoditas pangan atau barang primer.",
    "reviewNote": ""
  },
  {
    "code": "01499",
    "title": "PEMBIBITAN DAN BUDIDAYA ANEKA TERNAK LAINNYA",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Pertanian/peternakan menghasilkan komoditas pangan atau barang primer.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "01611",
    "title": "JASA PENGOLAHAN LAHAN",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Pertanian/peternakan menghasilkan komoditas pangan atau barang primer.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "01612",
    "title": "JASA PEMUPUKAN, PENANAMAN BIBIT/BENIH DAN PENGENDALIAN HAMA DAN GULMA",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Pertanian/peternakan menghasilkan komoditas pangan atau barang primer.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "01613",
    "title": "JASA PEMANENAN",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Pertanian/peternakan menghasilkan komoditas pangan atau barang primer.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "01614",
    "title": "JASA PENYEMPROTAN DAN PENYERBUKAN MELALUI UDARA",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Pertanian/peternakan menghasilkan komoditas pangan atau barang primer.",
    "reviewNote": ""
  },
  {
    "code": "01619",
    "title": "JASA PENUNJANG PERTANIAN LAINNYA",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Pertanian/peternakan menghasilkan komoditas pangan atau barang primer.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "01621",
    "title": "JASA PELAYANAN KESEHATAN TERNAK",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Pertanian/peternakan menghasilkan komoditas pangan atau barang primer.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "01622",
    "title": "JASA PERKAWINAN TERNAK",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Pertanian/peternakan menghasilkan komoditas pangan atau barang primer.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "01623",
    "title": "JASA PENETASAN TELUR",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Pertanian/peternakan menghasilkan komoditas pangan atau barang primer.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "01629",
    "title": "JASA PENUNJANG PETERNAKAN LAINNYA",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Pertanian/peternakan menghasilkan komoditas pangan atau barang primer.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "01630",
    "title": "JASA PASCA PANEN",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Pertanian/peternakan menghasilkan komoditas pangan atau barang primer.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "01640",
    "title": "PEMILIHAN BENIH TANAMAN UNTUK PENGEMBANGBIAKAN",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Pertanian/peternakan menghasilkan komoditas pangan atau barang primer.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "01711",
    "title": "PERBURUAN DAN PENANGKAPAN PRIMATA",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Pertanian/peternakan menghasilkan komoditas pangan atau barang primer.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "01712",
    "title": "PERBURUAN DAN PENANGKAPAN MAMALIA",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Pertanian/peternakan menghasilkan komoditas pangan atau barang primer.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "01713",
    "title": "PERBURUAN DAN PENANGKAPAN REPTIL",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Pertanian/peternakan menghasilkan komoditas pangan atau barang primer.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "01714",
    "title": "PERBURUAN DAN PENANGKAPAN BURUNG",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Pertanian/peternakan menghasilkan komoditas pangan atau barang primer.",
    "reviewNote": ""
  },
  {
    "code": "01715",
    "title": "PERBURUAN DAN PENANGKAPAN INSEKTA",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Pertanian/peternakan menghasilkan komoditas pangan atau barang primer.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "01719",
    "title": "PERBURUAN DAN PENANGKAPAN SATWA LIAR LAINNYA",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Pertanian/peternakan menghasilkan komoditas pangan atau barang primer.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "01721",
    "title": "PENANGKARAN PRIMATA",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Pertanian/peternakan menghasilkan komoditas pangan atau barang primer.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "01722",
    "title": "PENANGKARAN MAMALIA",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Pertanian/peternakan menghasilkan komoditas pangan atau barang primer.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "01723",
    "title": "PENANGKARAN REPTIL",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Pertanian/peternakan menghasilkan komoditas pangan atau barang primer.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "01724",
    "title": "PENANGKARAN BURUNG",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Pertanian/peternakan menghasilkan komoditas pangan atau barang primer.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "01725",
    "title": "PENANGKARAN INSEKTA",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Pertanian/peternakan menghasilkan komoditas pangan atau barang primer.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "01726",
    "title": "PENANGKARAN ANGGREK",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Pertanian/peternakan menghasilkan komoditas pangan atau barang primer.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "01727",
    "title": "PENANGKARAN IKAN DAN CORAL/KARANG",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Pertanian/peternakan menghasilkan komoditas pangan atau barang primer.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "01729",
    "title": "PENANGKARAN TUMBUHAN/SATWA LIAR LAINNYA",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Pertanian/peternakan menghasilkan komoditas pangan atau barang primer.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "02111",
    "title": "PEMANFAATAN KAYU HUTAN TANAMAN PADA HUTAN PRODUKSI",
    "sector": "Basic Materials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Kehutanan/penebangan kayu menghasilkan kayu dan bahan baku terkait.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "02112",
    "title": "PEMANFAATAN KAYU HUTAN TANAMAN HASIL REHABILITASI PADA HUTAN PRODUKSI",
    "sector": "Basic Materials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Kehutanan/penebangan kayu menghasilkan kayu dan bahan baku terkait.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "02113",
    "title": "PEMANFAATAN KAYU HUTAN TANAMAN RAKYAT",
    "sector": "Basic Materials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Kehutanan/penebangan kayu menghasilkan kayu dan bahan baku terkait.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "02119",
    "title": "PEMANFAATAN KAYU HUTAN TANAMAN LAINNYA",
    "sector": "Basic Materials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Kehutanan/penebangan kayu menghasilkan kayu dan bahan baku terkait.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "02121",
    "title": "PEMANFAATAN KAYU HUTAN ALAM",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Kehutanan/penebangan kayu menghasilkan kayu dan bahan baku terkait.",
    "reviewNote": ""
  },
  {
    "code": "02122",
    "title": "PEMANFAATAN KAYU HASIL RESTORASI EKOSISTEM PADA HUTAN ALAM",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Kehutanan/penebangan kayu menghasilkan kayu dan bahan baku terkait.",
    "reviewNote": ""
  },
  {
    "code": "02130",
    "title": "PEMANFAATAN HASIL HUTAN BUKAN KAYU",
    "sector": "Basic Materials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Kehutanan/penebangan kayu menghasilkan kayu dan bahan baku terkait.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "02140",
    "title": "PENGUSAHAAN PERBENIHAN TANAMAN KEHUTANAN",
    "sector": "Basic Materials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Kehutanan/penebangan kayu menghasilkan kayu dan bahan baku terkait.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "02201",
    "title": "PEMANENAN KAYU",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Kehutanan/penebangan kayu menghasilkan kayu dan bahan baku terkait.",
    "reviewNote": ""
  },
  {
    "code": "02202",
    "title": "USAHA PEMUNGUTAN KAYU",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Kehutanan/penebangan kayu menghasilkan kayu dan bahan baku terkait.",
    "reviewNote": ""
  },
  {
    "code": "02209",
    "title": "USAHA KEHUTANAN LAINNYA",
    "sector": "Basic Materials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Kehutanan/penebangan kayu menghasilkan kayu dan bahan baku terkait.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "02301",
    "title": "PEMUNGUTAN GETAH KARET",
    "sector": "Basic Materials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Kehutanan/penebangan kayu menghasilkan kayu dan bahan baku terkait.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "02302",
    "title": "PEMUNGUTAN ROTAN",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Kehutanan/penebangan kayu menghasilkan kayu dan bahan baku terkait.",
    "reviewNote": ""
  },
  {
    "code": "02303",
    "title": "PEMUNGUTAN GETAH PINUS",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Kehutanan/penebangan kayu menghasilkan kayu dan bahan baku terkait.",
    "reviewNote": ""
  },
  {
    "code": "02304",
    "title": "PEMUNGUTAN DAUN KAYU PUTIH",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Kehutanan/penebangan kayu menghasilkan kayu dan bahan baku terkait.",
    "reviewNote": ""
  },
  {
    "code": "02305",
    "title": "PEMUNGUTAN KOKON/KEPOMPONG ULAT SUTERA",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Kehutanan/penebangan kayu menghasilkan kayu dan bahan baku terkait.",
    "reviewNote": ""
  },
  {
    "code": "02306",
    "title": "PEMUNGUTAN DAMAR",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Kehutanan/penebangan kayu menghasilkan kayu dan bahan baku terkait.",
    "reviewNote": ""
  },
  {
    "code": "02307",
    "title": "PEMUNGUTAN MADU",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Kehutanan/penebangan kayu menghasilkan kayu dan bahan baku terkait.",
    "reviewNote": ""
  },
  {
    "code": "02308",
    "title": "PEMUNGUTAN BAMBU",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Kehutanan/penebangan kayu menghasilkan kayu dan bahan baku terkait.",
    "reviewNote": ""
  },
  {
    "code": "02309",
    "title": "PEMUNGUTAN BUKAN KAYU LAINNYA",
    "sector": "Basic Materials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Kehutanan/penebangan kayu menghasilkan kayu dan bahan baku terkait.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "02401",
    "title": "JASA PENGGUNAAN KAWASAN HUTAN DI LUAR SEKTOR KEHUTANAN",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Kehutanan/penebangan kayu menghasilkan kayu dan bahan baku terkait.",
    "reviewNote": ""
  },
  {
    "code": "02402",
    "title": "JASA PERLINDUNGAN HUTAN DAN KONSERVASI ALAM",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Kehutanan/penebangan kayu menghasilkan kayu dan bahan baku terkait.",
    "reviewNote": ""
  },
  {
    "code": "02403",
    "title": "JASA REHABILITASI DAN RESTORASI KEHUTANAN SOSIAL",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Kehutanan/penebangan kayu menghasilkan kayu dan bahan baku terkait.",
    "reviewNote": ""
  },
  {
    "code": "02404",
    "title": "JASA KEHUTANAN BIDANG PERENCANAAN KEHUTANAN",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Kehutanan/penebangan kayu menghasilkan kayu dan bahan baku terkait.",
    "reviewNote": ""
  },
  {
    "code": "02409",
    "title": "JASA PENUNJANG KEHUTANAN LAINNYA",
    "sector": "Basic Materials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Kehutanan/penebangan kayu menghasilkan kayu dan bahan baku terkait.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "03111",
    "title": "PENANGKAPAN PISCES/IKAN BERSIRIP DI LAUT",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Perikanan menghasilkan komoditas pangan primer.",
    "reviewNote": ""
  },
  {
    "code": "03112",
    "title": "PENANGKAPAN CRUSTACEA DI LAUT",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Perikanan menghasilkan komoditas pangan primer.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "03113",
    "title": "PENANGKAPAN MOLLUSCA DI LAUT",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Perikanan menghasilkan komoditas pangan primer.",
    "reviewNote": ""
  },
  {
    "code": "03114",
    "title": "PENANGKAPAN/PENGAMBILAN TUMBUHAN AIR DI LAUT",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Perikanan menghasilkan komoditas pangan primer.",
    "reviewNote": ""
  },
  {
    "code": "03115",
    "title": "PENANGKAPAN/PENGAMBILAN INDUK/BENIH IKAN DI LAUT",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Perikanan menghasilkan komoditas pangan primer.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "03116",
    "title": "PENANGKAPAN ECHINODERMATA DI LAUT",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Perikanan menghasilkan komoditas pangan primer.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "03117",
    "title": "PENANGKAPAN COELENTERATA DI LAUT",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Perikanan menghasilkan komoditas pangan primer.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "03118",
    "title": "PENANGKAPAN IKAN HIAS LAUT",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Perikanan menghasilkan komoditas pangan primer.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "03119",
    "title": "PENANGKAPAN BIOTA AIR LAINNYA DI LAUT",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Perikanan menghasilkan komoditas pangan primer.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "03121",
    "title": "PENANGKAPAN PISCES/IKAN BERSIRIP DI PERAIRAN DARAT",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Perikanan menghasilkan komoditas pangan primer.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "03122",
    "title": "PENANGKAPAN CRUSTACEA DI PERAIRAN DARAT",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Perikanan menghasilkan komoditas pangan primer.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "03123",
    "title": "PENANGKAPAN MOLLUSCA DI PERAIRAN DARAT",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Perikanan menghasilkan komoditas pangan primer.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "03124",
    "title": "PENANGKAPAN/PENGAMBILAN TUMBUHAN AIR DI PERAIRAN DARAT",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Perikanan menghasilkan komoditas pangan primer.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "03125",
    "title": "PENANGKAPAN/PENGAMBILAN INDUK/BENIH IKAN DI PERAIRAN DARAT",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Perikanan menghasilkan komoditas pangan primer.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "03126",
    "title": "PENANGKAPAN IKAN HIAS DI PERAIRAN DARAT",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Perikanan menghasilkan komoditas pangan primer.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "03129",
    "title": "PENANGKAPAN BIOTA AIR LAINNYA DI PERAIRAN DARAT",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Perikanan menghasilkan komoditas pangan primer.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "03131",
    "title": "JASA SARANA PRODUKSI PENANGKAPAN IKAN DI LAUT",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Perikanan menghasilkan komoditas pangan primer.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "03132",
    "title": "JASA PRODUKSI PENANGKAPAN IKAN DI LAUT",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Perikanan menghasilkan komoditas pangan primer.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "03133",
    "title": "JASA PASCA PANEN PENANGKAPAN IKAN DI LAUT",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Perikanan menghasilkan komoditas pangan primer.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "03141",
    "title": "JASA SARANA PRODUKSI PENANGKAPAN IKAN DI PERAIRAN DARAT",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Perikanan menghasilkan komoditas pangan primer.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "03142",
    "title": "JASA PRODUKSI PENANGKAPAN IKAN DI PERAIRAN DARAT",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Perikanan menghasilkan komoditas pangan primer.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "03143",
    "title": "JASA PASCA PANEN PENANGKAPAN IKAN DI PERAIRAN DARAT",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Perikanan menghasilkan komoditas pangan primer.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "03151",
    "title": "PENANGKAPAN/PENGAMBILAN IKAN BERSIRIP (PISCES) YANG DILINDUNGI DAN/ATAU TERMASUK DALAM APPENDIKS CITES",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Perikanan menghasilkan komoditas pangan primer.",
    "reviewNote": ""
  },
  {
    "code": "03152",
    "title": "PENANGKAPAN/PENGAMBILAN CRUSTACEA YANG DILINDUNGI DAN/ATAU TERMASUK DALAM APPENDIKS CITES",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Perikanan menghasilkan komoditas pangan primer.",
    "reviewNote": ""
  },
  {
    "code": "03153",
    "title": "PENANGKAPAN/PENGAMBILAN MOLLUSCA YANG DILINDUNGI DAN/ATAU TERMASUK DALAM APPENDIKS CITES",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Perikanan menghasilkan komoditas pangan primer.",
    "reviewNote": ""
  },
  {
    "code": "03154",
    "title": "PENANGKAPAN/PENGAMBILAN COELENTERATA YANG DILINDUNGI DAN/ATAU TERMASUK DALAM APPENDIKS CITES",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Perikanan menghasilkan komoditas pangan primer.",
    "reviewNote": ""
  },
  {
    "code": "03155",
    "title": "PENANGKAPAN/PENGAMBILAN ECHINODERMATA YANG DILINDUNGI DAN/ATAU TERMASUK DALAM APPENDIKS CITES",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Perikanan menghasilkan komoditas pangan primer.",
    "reviewNote": ""
  },
  {
    "code": "03156",
    "title": "PENANGKAPAN/PENGAMBILAN AMPHIBIA YANG DILINDUNGI DAN/ATAU TERMASUK DALAM APPENDIKS CITES",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Perikanan menghasilkan komoditas pangan primer.",
    "reviewNote": ""
  },
  {
    "code": "03157",
    "title": "PENANGKAPAN/PENGAMBILAN REPTILIA YANG DILINDUNGI DAN/ATAU TERMASUK DALAM APPENDIKS CITES",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Perikanan menghasilkan komoditas pangan primer.",
    "reviewNote": ""
  },
  {
    "code": "03158",
    "title": "PENANGKAPAN/PENGAMBILAN MAMALIA YANG DILINDUNGI DAN/ATAU TERMASUK DALAM APPENDIKS CITES",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Perikanan menghasilkan komoditas pangan primer.",
    "reviewNote": ""
  },
  {
    "code": "03159",
    "title": "PENANGKAPAN/PENGAMBILAN ALGAE DAN BIOTA PERAIRAN LAINNYA YANG DILINDUNGI DAN/ATAU TERMASUK DALAM APPENDIKS CITES",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Perikanan menghasilkan komoditas pangan primer.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "03211",
    "title": "PEMBESARAN PISCES/ IKAN BERSIRIP LAUT",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Perikanan menghasilkan komoditas pangan primer.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "03212",
    "title": "PEMBENIHAN IKAN LAUT",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Perikanan menghasilkan komoditas pangan primer.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "03213",
    "title": "BUDIDAYA IKAN HIAS AIR LAUT",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Perikanan menghasilkan komoditas pangan primer.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "03214",
    "title": "BUDIDAYA KARANG (CORAL)",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Perikanan menghasilkan komoditas pangan primer.",
    "reviewNote": ""
  },
  {
    "code": "03215",
    "title": "PEMBESARAN MOLLUSCA LAUT",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Perikanan menghasilkan komoditas pangan primer.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "03216",
    "title": "PEMBESARAN CRUSTACEA LAUT",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Perikanan menghasilkan komoditas pangan primer.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "03217",
    "title": "PEMBESARAN TUMBUHAN AIR LAUT",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Perikanan menghasilkan komoditas pangan primer.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "03219",
    "title": "BUDIDAYA BIOTA AIR LAUT LAINNYA",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Perikanan menghasilkan komoditas pangan primer.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "03221",
    "title": "PEMBESARAN IKAN AIR TAWAR DI KOLAM",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Perikanan menghasilkan komoditas pangan primer.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "03222",
    "title": "PEMBESARAN IKAN AIR TAWAR DI KARAMBA JARING APUNG",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Perikanan menghasilkan komoditas pangan primer.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "03223",
    "title": "PEMBESARAN IKAN AIR TAWAR DI KARAMBA",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Perikanan menghasilkan komoditas pangan primer.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "03224",
    "title": "PEMBESARAN IKAN AIR TAWAR DI SAWAH",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Perikanan menghasilkan komoditas pangan primer.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "03225",
    "title": "BUDIDAYA IKAN HIAS AIR TAWAR",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Perikanan menghasilkan komoditas pangan primer.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "03226",
    "title": "PEMBENIHAN IKAN AIR TAWAR",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Perikanan menghasilkan komoditas pangan primer.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "03227",
    "title": "PEMBESARAN IKAN AIR TAWAR DI KARAMBA JARING TANCAP",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Perikanan menghasilkan komoditas pangan primer.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "03229",
    "title": "BUDIDAYA IKAN AIR TAWAR DI MEDIA LAINNYA",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Perikanan menghasilkan komoditas pangan primer.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "03231",
    "title": "JASA SARANA PRODUKSI BUDIDAYA IKAN LAUT",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Perikanan menghasilkan komoditas pangan primer.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "03232",
    "title": "JASA PRODUKSI BUDIDAYA IKAN LAUT",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Perikanan menghasilkan komoditas pangan primer.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "03233",
    "title": "JASA PASCA PANEN BUDIDAYA IKAN LAUT",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Perikanan menghasilkan komoditas pangan primer.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "03241",
    "title": "JASA SARANA PRODUKSI BUDIDAYA IKAN AIR TAWAR",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Perikanan menghasilkan komoditas pangan primer.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "03242",
    "title": "JASA PRODUKSI BUDIDAYA IKAN AIR TAWAR",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Perikanan menghasilkan komoditas pangan primer.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "03243",
    "title": "JASA PASCA PANEN BUDIDAYA IKAN AIR TAWAR",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Perikanan menghasilkan komoditas pangan primer.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "03251",
    "title": "PEMBESARAN PISCES/IKAN BERSIRIP AIR PAYAU",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Perikanan menghasilkan komoditas pangan primer.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "03252",
    "title": "PEMBENIHAN IKAN AIR PAYAU",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Perikanan menghasilkan komoditas pangan primer.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "03253",
    "title": "PEMBESARAN MOLLUSCA AIR PAYAU",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Perikanan menghasilkan komoditas pangan primer.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "03254",
    "title": "PEMBESARAN CRUSTACEA AIR PAYAU",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Perikanan menghasilkan komoditas pangan primer.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "03255",
    "title": "PEMBESARAN TUMBUHAN AIR PAYAU",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Perikanan menghasilkan komoditas pangan primer.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "03259",
    "title": "BUDIDAYA BIOTA AIR PAYAU LAINNYA",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Perikanan menghasilkan komoditas pangan primer.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "03261",
    "title": "JASA SARANA PRODUKSI BUDIDAYA IKAN AIR PAYAU",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Perikanan menghasilkan komoditas pangan primer.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "03262",
    "title": "JASA PRODUKSI BUDIDAYA IKAN AIR PAYAU",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Perikanan menghasilkan komoditas pangan primer.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "03263",
    "title": "JASA PASCA PANEN BUDIDAYA IKAN AIR PAYAU",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Perikanan menghasilkan komoditas pangan primer.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "03271",
    "title": "PENGEMBANGBIAKAN IKAN BERSIRIP (PISCES) YANG DILINDUNGI DAN/ATAU TERMASUK DALAM APPENDIKS CITES",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Perikanan menghasilkan komoditas pangan primer.",
    "reviewNote": ""
  },
  {
    "code": "03272",
    "title": "PENGEMBANGBIAKAN CRUSTACEA YANG DILINDUNGI DAN/ATAU TERMASUK DALAM APPENDIKS CITES",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Perikanan menghasilkan komoditas pangan primer.",
    "reviewNote": ""
  },
  {
    "code": "03273",
    "title": "PENGEMBANGBIAKAN MOLLUSCA YANG DILINDUNGI DAN/ATAU TERMASUK DALAM APPENDIKS CITES",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Perikanan menghasilkan komoditas pangan primer.",
    "reviewNote": ""
  },
  {
    "code": "03274",
    "title": "PENGEMBANGBIAKAN COELENTERATA YANG DILINDUNGI DAN/ATAU TERMASUK DALAM APPENDIKS CITES",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Perikanan menghasilkan komoditas pangan primer.",
    "reviewNote": ""
  },
  {
    "code": "03275",
    "title": "PENGEMBANGBIAKAN ECHINODERMATA YANG DILINDUNGI DAN/ATAU TERMASUK DALAM APPENDIKS CITES",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Perikanan menghasilkan komoditas pangan primer.",
    "reviewNote": ""
  },
  {
    "code": "03276",
    "title": "PENGEMBANGBIAKAN AMPHIBIA YANG DILINDUNGI DAN/ATAU TERMASUK DALAM APPENDIKS CITES",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Perikanan menghasilkan komoditas pangan primer.",
    "reviewNote": ""
  },
  {
    "code": "03277",
    "title": "PENGEMBANGBIAKAN REPTILIA YANG DILINDUNGI DAN/ATAU TERMASUK DALAM APPENDIKS CITES",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Perikanan menghasilkan komoditas pangan primer.",
    "reviewNote": ""
  },
  {
    "code": "03278",
    "title": "PENGEMBANGBIAKAN MAMALIA YANG DILINDUNGI DAN/ATAU TERMASUK DALAM APPENDIKS CITES",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Perikanan menghasilkan komoditas pangan primer.",
    "reviewNote": ""
  },
  {
    "code": "03279",
    "title": "PENGEMBANGBIAKAN ALGAE DAN BIOTA PERAIRAN LAINNYA YANG DILINDUNGI DAN/ATAU TERMASUK DALAM APPENDIKS CITES",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Perikanan menghasilkan komoditas pangan primer.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "05100",
    "title": "PERTAMBANGAN BATU BARA",
    "sector": "Energy",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Pertambangan minyak/gas/batubara atau jasa penunjang energi masuk Energy.",
    "reviewNote": ""
  },
  {
    "code": "05200",
    "title": "PERTAMBANGAN LIGNIT",
    "sector": "Energy",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Pertambangan minyak/gas/batubara atau jasa penunjang energi masuk Energy.",
    "reviewNote": ""
  },
  {
    "code": "06100",
    "title": "PERTAMBANGAN MINYAK BUMI",
    "sector": "Energy",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Pertambangan minyak/gas/batubara atau jasa penunjang energi masuk Energy.",
    "reviewNote": ""
  },
  {
    "code": "06201",
    "title": "PERTAMBANGAN GAS ALAM",
    "sector": "Energy",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Pertambangan minyak/gas/batubara atau jasa penunjang energi masuk Energy.",
    "reviewNote": ""
  },
  {
    "code": "06202",
    "title": "PENGUSAHAAN TENAGA PANAS BUMI",
    "sector": "Energy",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Pertambangan minyak/gas/batubara atau jasa penunjang energi masuk Energy.",
    "reviewNote": ""
  },
  {
    "code": "07101",
    "title": "PERTAMBANGAN PASIR BESI",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Pertambangan logam, mineral, penggalian, atau jasa penunjang non-energi menghasilkan material dasar.",
    "reviewNote": ""
  },
  {
    "code": "07102",
    "title": "PERTAMBANGAN BIJIH BESI",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Pertambangan logam, mineral, penggalian, atau jasa penunjang non-energi menghasilkan material dasar.",
    "reviewNote": ""
  },
  {
    "code": "07210",
    "title": "PERTAMBANGAN BIJIH URANIUM DAN TORIUM",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Pertambangan logam, mineral, penggalian, atau jasa penunjang non-energi menghasilkan material dasar.",
    "reviewNote": ""
  },
  {
    "code": "07291",
    "title": "PERTAMBANGAN BIJIH TIMAH",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Pertambangan logam, mineral, penggalian, atau jasa penunjang non-energi menghasilkan material dasar.",
    "reviewNote": ""
  },
  {
    "code": "07292",
    "title": "PERTAMBANGAN BIJIH TIMAH HITAM",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Pertambangan logam, mineral, penggalian, atau jasa penunjang non-energi menghasilkan material dasar.",
    "reviewNote": ""
  },
  {
    "code": "07293",
    "title": "PERTAMBANGAN BIJIH BAUKSIT",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Pertambangan logam, mineral, penggalian, atau jasa penunjang non-energi menghasilkan material dasar.",
    "reviewNote": ""
  },
  {
    "code": "07294",
    "title": "PERTAMBANGAN BIJIH TEMBAGA",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Pertambangan logam, mineral, penggalian, atau jasa penunjang non-energi menghasilkan material dasar.",
    "reviewNote": ""
  },
  {
    "code": "07295",
    "title": "PERTAMBANGAN BIJIH NIKEL",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Pertambangan logam, mineral, penggalian, atau jasa penunjang non-energi menghasilkan material dasar.",
    "reviewNote": ""
  },
  {
    "code": "07296",
    "title": "PERTAMBANGAN BIJIH MANGAN",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Pertambangan logam, mineral, penggalian, atau jasa penunjang non-energi menghasilkan material dasar.",
    "reviewNote": ""
  },
  {
    "code": "07299",
    "title": "PERTAMBANGAN BAHAN GALIAN LAINNYA YANG TIDAK MENGANDUNG BIJIH BESI",
    "sector": "Basic Materials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Pertambangan logam, mineral, penggalian, atau jasa penunjang non-energi menghasilkan material dasar.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "07301",
    "title": "PERTAMBANGAN EMAS DAN PERAK",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Pertambangan logam, mineral, penggalian, atau jasa penunjang non-energi menghasilkan material dasar.",
    "reviewNote": ""
  },
  {
    "code": "07309",
    "title": "PERTAMBANGAN BIJIH LOGAM MULIA LAINNYA",
    "sector": "Basic Materials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Pertambangan logam, mineral, penggalian, atau jasa penunjang non-energi menghasilkan material dasar.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "08101",
    "title": "PENGGALIAN BATU HIAS DAN BATU BANGUNAN",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Pertambangan logam, mineral, penggalian, atau jasa penunjang non-energi menghasilkan material dasar.",
    "reviewNote": ""
  },
  {
    "code": "08102",
    "title": "PENGGALIAN BATU KAPUR/GAMPING",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Pertambangan logam, mineral, penggalian, atau jasa penunjang non-energi menghasilkan material dasar.",
    "reviewNote": ""
  },
  {
    "code": "08103",
    "title": "PENGGALIAN KERIKIL/SIRTU",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Pertambangan logam, mineral, penggalian, atau jasa penunjang non-energi menghasilkan material dasar.",
    "reviewNote": ""
  },
  {
    "code": "08104",
    "title": "PENGGALIAN PASIR",
    "sector": "Basic Materials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Pertambangan logam, mineral, penggalian, atau jasa penunjang non-energi menghasilkan material dasar.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "08105",
    "title": "PENGGALIAN TANAH DAN TANAH LIAT",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Pertambangan logam, mineral, penggalian, atau jasa penunjang non-energi menghasilkan material dasar.",
    "reviewNote": ""
  },
  {
    "code": "08106",
    "title": "PENGGALIAN GIPS",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Pertambangan logam, mineral, penggalian, atau jasa penunjang non-energi menghasilkan material dasar.",
    "reviewNote": ""
  },
  {
    "code": "08107",
    "title": "PENGGALIAN TRAS",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Pertambangan logam, mineral, penggalian, atau jasa penunjang non-energi menghasilkan material dasar.",
    "reviewNote": ""
  },
  {
    "code": "08108",
    "title": "PENGGALIAN BATU APUNG",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Pertambangan logam, mineral, penggalian, atau jasa penunjang non-energi menghasilkan material dasar.",
    "reviewNote": ""
  },
  {
    "code": "08109",
    "title": "PENGGALIAN BATU, PASIR DAN TANAH LIAT LAINNYA",
    "sector": "Basic Materials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Pertambangan logam, mineral, penggalian, atau jasa penunjang non-energi menghasilkan material dasar.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "08911",
    "title": "PERTAMBANGAN BELERANG",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Pertambangan logam, mineral, penggalian, atau jasa penunjang non-energi menghasilkan material dasar.",
    "reviewNote": ""
  },
  {
    "code": "08912",
    "title": "PERTAMBANGAN FOSFAT",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Pertambangan logam, mineral, penggalian, atau jasa penunjang non-energi menghasilkan material dasar.",
    "reviewNote": ""
  },
  {
    "code": "08913",
    "title": "PERTAMBANGAN NITRAT",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Pertambangan logam, mineral, penggalian, atau jasa penunjang non-energi menghasilkan material dasar.",
    "reviewNote": ""
  },
  {
    "code": "08914",
    "title": "PERTAMBANGAN YODIUM",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Pertambangan logam, mineral, penggalian, atau jasa penunjang non-energi menghasilkan material dasar.",
    "reviewNote": ""
  },
  {
    "code": "08915",
    "title": "PERTAMBANGAN POTASH (KALIUM KARBONAT)",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Pertambangan logam, mineral, penggalian, atau jasa penunjang non-energi menghasilkan material dasar.",
    "reviewNote": ""
  },
  {
    "code": "08919",
    "title": "PERTAMBANGAN MINERAL, BAHAN KIMIA DAN BAHAN PUPUK LAINNYA",
    "sector": "Basic Materials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Pertambangan logam, mineral, penggalian, atau jasa penunjang non-energi menghasilkan material dasar.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "08920",
    "title": "EKSTRAKSI TANAH GEMUK (PEAT)",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Pertambangan logam, mineral, penggalian, atau jasa penunjang non-energi menghasilkan material dasar.",
    "reviewNote": ""
  },
  {
    "code": "08930",
    "title": "EKSTRAKSI GARAM",
    "sector": "Basic Materials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Pertambangan logam, mineral, penggalian, atau jasa penunjang non-energi menghasilkan material dasar.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "08991",
    "title": "PERTAMBANGAN BATU MULIA",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Pertambangan logam, mineral, penggalian, atau jasa penunjang non-energi menghasilkan material dasar.",
    "reviewNote": ""
  },
  {
    "code": "08992",
    "title": "PENGGALIAN FELDSPAR DAN KALSIT",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Pertambangan logam, mineral, penggalian, atau jasa penunjang non-energi menghasilkan material dasar.",
    "reviewNote": ""
  },
  {
    "code": "08993",
    "title": "PERTAMBANGAN ASPAL ALAM",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Pertambangan logam, mineral, penggalian, atau jasa penunjang non-energi menghasilkan material dasar.",
    "reviewNote": ""
  },
  {
    "code": "08994",
    "title": "PENGGALIAN ASBES",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Pertambangan logam, mineral, penggalian, atau jasa penunjang non-energi menghasilkan material dasar.",
    "reviewNote": ""
  },
  {
    "code": "08995",
    "title": "PENGGALIAN KUARSA/PASIR KUARSA",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Pertambangan logam, mineral, penggalian, atau jasa penunjang non-energi menghasilkan material dasar.",
    "reviewNote": ""
  },
  {
    "code": "08999",
    "title": "PERTAMBANGAN DAN PENGGALIAN LAINNYA YTDL",
    "sector": "Basic Materials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Pertambangan logam, mineral, penggalian, atau jasa penunjang non-energi menghasilkan material dasar.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "09100",
    "title": "AKTIVITAS PENUNJANG PERTAMBANGAN MINYAK BUMI DAN GAS ALAM",
    "sector": "Energy",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Pertambangan minyak/gas/batubara atau jasa penunjang energi masuk Energy.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "09900",
    "title": "AKTIVITAS PENUNJANG PERTAMBANGAN DAN PENGGALIAN LAINNYA",
    "sector": "Basic Materials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Pertambangan logam, mineral, penggalian, atau jasa penunjang non-energi menghasilkan material dasar.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "10110",
    "title": "KEGIATAN RUMAH POTONG DAN PENGEPAKAN DAGING BUKAN UNGGAS",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Divisi 10 industri makanan adalah barang konsumsi primer/non-siklis.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "10120",
    "title": "KEGIATAN RUMAH POTONG DAN PENGEPAKAN DAGING UNGGAS",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 10 industri makanan adalah barang konsumsi primer/non-siklis.",
    "reviewNote": ""
  },
  {
    "code": "10130",
    "title": "INDUSTRI PENGOLAHAN DAN PENGAWETAN PRODUK DAGING DAN DAGING UNGGAS",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 10 industri makanan adalah barang konsumsi primer/non-siklis.",
    "reviewNote": ""
  },
  {
    "code": "10211",
    "title": "INDUSTRI PENGGARAMAN/PENGERINGAN IKAN",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 10 industri makanan adalah barang konsumsi primer/non-siklis.",
    "reviewNote": ""
  },
  {
    "code": "10212",
    "title": "INDUSTRI PENGASAPAN/PEMANGGANGAN IKAN",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 10 industri makanan adalah barang konsumsi primer/non-siklis.",
    "reviewNote": ""
  },
  {
    "code": "10213",
    "title": "INDUSTRI PEMBEKUAN IKAN",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 10 industri makanan adalah barang konsumsi primer/non-siklis.",
    "reviewNote": ""
  },
  {
    "code": "10214",
    "title": "INDUSTRI PEMINDANGAN IKAN",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 10 industri makanan adalah barang konsumsi primer/non-siklis.",
    "reviewNote": ""
  },
  {
    "code": "10215",
    "title": "INDUSTRI PERAGIAN/FERMENTASI IKAN",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 10 industri makanan adalah barang konsumsi primer/non-siklis.",
    "reviewNote": ""
  },
  {
    "code": "10216",
    "title": "INDUSTRI BERBASIS DAGING LUMATAN DAN SURIMI",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 10 industri makanan adalah barang konsumsi primer/non-siklis.",
    "reviewNote": ""
  },
  {
    "code": "10217",
    "title": "INDUSTRI PENDINGINAN/PENGESAN IKAN",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 10 industri makanan adalah barang konsumsi primer/non-siklis.",
    "reviewNote": ""
  },
  {
    "code": "10219",
    "title": "INDUSTRI PENGOLAHAN DAN PENGAWETAN LAINNYA UNTUK IKAN",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Divisi 10 industri makanan adalah barang konsumsi primer/non-siklis.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "10221",
    "title": "INDUSTRI PENGOLAHAN DAN PENGAWETAN IKAN DAN BIOTA AIR (BUKAN UDANG) DALAM KALENG",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Divisi 10 industri makanan adalah barang konsumsi primer/non-siklis.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "10222",
    "title": "INDUSTRI PENGOLAHAN DAN PENGAWETAN UDANG DALAM KALENG",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 10 industri makanan adalah barang konsumsi primer/non-siklis.",
    "reviewNote": ""
  },
  {
    "code": "10291",
    "title": "INDUSTRI PENGGARAMAN/PENGERINGAN BIOTA AIR LAINNYA",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Divisi 10 industri makanan adalah barang konsumsi primer/non-siklis.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "10292",
    "title": "INDUSTRI PENGASAPAN/PEMANGGANGAN BIOTA AIR LAINNYA",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Divisi 10 industri makanan adalah barang konsumsi primer/non-siklis.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "10293",
    "title": "INDUSTRI PEMBEKUAN BIOTA AIR LAINNYA",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Divisi 10 industri makanan adalah barang konsumsi primer/non-siklis.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "10294",
    "title": "INDUSTRI PEMINDANGAN BIOTA AIR LAINNYA",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Divisi 10 industri makanan adalah barang konsumsi primer/non-siklis.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "10295",
    "title": "INDUSTRI PERAGIAN/FERMENTASI BIOTA AIR LAINNYA",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Divisi 10 industri makanan adalah barang konsumsi primer/non-siklis.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "10296",
    "title": "INDUSTRI BERBASIS LUMATAN BIOTA AIR LAINNYA",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Divisi 10 industri makanan adalah barang konsumsi primer/non-siklis.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "10297",
    "title": "INDUSTRI PENDINGINAN/PENGESAN BIOTA AIR LAINNYA",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Divisi 10 industri makanan adalah barang konsumsi primer/non-siklis.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "10298",
    "title": "INDUSTRI PENGOLAHAN RUMPUT LAUT",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Divisi 10 industri makanan adalah barang konsumsi primer/non-siklis.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "10299",
    "title": "INDUSTRI PENGOLAHAN DAN PENGAWETAN LAINNYA UNTUK BIOTA AIR LAINNYA",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Divisi 10 industri makanan adalah barang konsumsi primer/non-siklis.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "10311",
    "title": "INDUSTRI PENGASINAN BUAH-BUAHAN DAN SAYURAN",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 10 industri makanan adalah barang konsumsi primer/non-siklis.",
    "reviewNote": ""
  },
  {
    "code": "10312",
    "title": "INDUSTRI PELUMATAN BUAH-BUAHAN DAN SAYURAN",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 10 industri makanan adalah barang konsumsi primer/non-siklis.",
    "reviewNote": ""
  },
  {
    "code": "10313",
    "title": "INDUSTRI PENGERINGAN BUAH-BUAHAN DAN SAYURAN",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 10 industri makanan adalah barang konsumsi primer/non-siklis.",
    "reviewNote": ""
  },
  {
    "code": "10314",
    "title": "INDUSTRI PEMBEKUAN BUAH-BUAHAN DAN SAYURAN",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 10 industri makanan adalah barang konsumsi primer/non-siklis.",
    "reviewNote": ""
  },
  {
    "code": "10320",
    "title": "INDUSTRI PENGOLAHAN DAN PENGAWETAN BUAH-BUAHAN DAN SAYURAN DALAM KALENG",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 10 industri makanan adalah barang konsumsi primer/non-siklis.",
    "reviewNote": ""
  },
  {
    "code": "10330",
    "title": "INDUSTRI PENGOLAHAN SARI BUAH DAN SAYURAN",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 10 industri makanan adalah barang konsumsi primer/non-siklis.",
    "reviewNote": ""
  },
  {
    "code": "10391",
    "title": "INDUSTRI TEMPE KEDELAI",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Divisi 10 industri makanan adalah barang konsumsi primer/non-siklis.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "10392",
    "title": "INDUSTRI TAHU KEDELAI",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Divisi 10 industri makanan adalah barang konsumsi primer/non-siklis.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "10393",
    "title": "INDUSTRI PENGOLAHAN DAN PENGAWETAN KEDELAI DAN KACANG- KACANGAN LAINNYA SELAIN TAHU DAN TEMPE",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Divisi 10 industri makanan adalah barang konsumsi primer/non-siklis.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "10399",
    "title": "INDUSTRI PENGOLAHAN DAN PENGAWETAN LAINNYA BUAH-BUAHAN DAN SAYURAN BUKAN KACANG-KACANGAN",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Divisi 10 industri makanan adalah barang konsumsi primer/non-siklis.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "10411",
    "title": "INDUSTRI MINYAK MENTAH DAN LEMAK NABATI",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 10 industri makanan adalah barang konsumsi primer/non-siklis.",
    "reviewNote": ""
  },
  {
    "code": "10412",
    "title": "INDUSTRI MARGARINE",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 10 industri makanan adalah barang konsumsi primer/non-siklis.",
    "reviewNote": ""
  },
  {
    "code": "10413",
    "title": "INDUSTRI MINYAK MENTAH DAN LEMAK HEWANI SELAIN IKAN",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 10 industri makanan adalah barang konsumsi primer/non-siklis.",
    "reviewNote": ""
  },
  {
    "code": "10414",
    "title": "INDUSTRI MINYAK IKAN",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Divisi 10 industri makanan adalah barang konsumsi primer/non-siklis.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "10415",
    "title": "INDUSTRI MINYAK GORENG BUKAN MINYAK KELAPA DAN MINYAK KELAPA SAWIT",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Divisi 10 industri makanan adalah barang konsumsi primer/non-siklis.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "10421",
    "title": "INDUSTRI KOPRA",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 10 industri makanan adalah barang konsumsi primer/non-siklis.",
    "reviewNote": ""
  },
  {
    "code": "10422",
    "title": "INDUSTRI MINYAK MENTAH KELAPA",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 10 industri makanan adalah barang konsumsi primer/non-siklis.",
    "reviewNote": ""
  },
  {
    "code": "10423",
    "title": "INDUSTRI MINYAK GORENG KELAPA",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 10 industri makanan adalah barang konsumsi primer/non-siklis.",
    "reviewNote": ""
  },
  {
    "code": "10424",
    "title": "INDUSTRI PELET KELAPA",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 10 industri makanan adalah barang konsumsi primer/non-siklis.",
    "reviewNote": ""
  },
  {
    "code": "10431",
    "title": "INDUSTRI MINYAK MENTAH KELAPA SAWIT (CRUDE PALM OIL)",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 10 industri makanan adalah barang konsumsi primer/non-siklis.",
    "reviewNote": ""
  },
  {
    "code": "10432",
    "title": "INDUSTRI MINYAK MENTAH INTI KELAPA SAWIT (CRUDE PALM KERNEL OIL)",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 10 industri makanan adalah barang konsumsi primer/non-siklis.",
    "reviewNote": ""
  },
  {
    "code": "10433",
    "title": "INDUSTRI PEMISAHAN/FRAKSINASI MINYAK MENTAH KELAPA SAWIT DAN MINYAK MENTAH INTI KELAPA SAWIT",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 10 industri makanan adalah barang konsumsi primer/non-siklis.",
    "reviewNote": ""
  },
  {
    "code": "10434",
    "title": "INDUSTRI PEMURNIAN MINYAK MENTAH KELAPA SAWIT DAN MINYAK MENTAH INTI KELAPA SAWIT",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 10 industri makanan adalah barang konsumsi primer/non-siklis.",
    "reviewNote": ""
  },
  {
    "code": "10435",
    "title": "INDUSTRI PEMISAHAN/FRAKSINASI MINYAK MURNI KELAPA SAWIT",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 10 industri makanan adalah barang konsumsi primer/non-siklis.",
    "reviewNote": ""
  },
  {
    "code": "10436",
    "title": "INDUSTRI PEMISAHAN/FRAKSINASI MINYAK MURNI INTI KELAPA SAWIT",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 10 industri makanan adalah barang konsumsi primer/non-siklis.",
    "reviewNote": ""
  },
  {
    "code": "10437",
    "title": "INDUSTRI MINYAK GORENG KELAPA SAWIT",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 10 industri makanan adalah barang konsumsi primer/non-siklis.",
    "reviewNote": ""
  },
  {
    "code": "10490",
    "title": "INDUSTRI MINYAK MENTAH DAN LEMAK NABATI DAN HEWANI LAINNYA",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Divisi 10 industri makanan adalah barang konsumsi primer/non-siklis.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "10510",
    "title": "INDUSTRI PENGOLAHAN SUSU SEGAR DAN KRIM",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Divisi 10 industri makanan adalah barang konsumsi primer/non-siklis.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "10520",
    "title": "INDUSTRI PENGOLAHAN SUSU BUBUK DAN SUSU KENTAL",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Divisi 10 industri makanan adalah barang konsumsi primer/non-siklis.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "10531",
    "title": "INDUSTRI PENGOLAHAN ES KRIM",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Divisi 10 industri makanan adalah barang konsumsi primer/non-siklis.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "10532",
    "title": "INDUSTRI PENGOLAHAN ES SEJENISNYA YANG DAPAT DIMAKAN (BUKAN ES BATU DAN ES BALOK)",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Divisi 10 industri makanan adalah barang konsumsi primer/non-siklis.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "10590",
    "title": "INDUSTRI PENGOLAHAN PRODUK DARI SUSU LAINNYA",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Divisi 10 industri makanan adalah barang konsumsi primer/non-siklis.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "10611",
    "title": "INDUSTRI PENGGILINGAN GANDUM DAN SERELIA LAINNYA",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Divisi 10 industri makanan adalah barang konsumsi primer/non-siklis.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "10612",
    "title": "INDUSTRI PENGGILINGAN ANEKA KACANG (TERMASUK LEGUMINOUS)",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Divisi 10 industri makanan adalah barang konsumsi primer/non-siklis.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "10613",
    "title": "INDUSTRI PENGGILINGAN ANEKA UMBI DAN SAYURAN (TERMASUK RHIZOMA)",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 10 industri makanan adalah barang konsumsi primer/non-siklis.",
    "reviewNote": ""
  },
  {
    "code": "10614",
    "title": "INDUSTRI TEPUNG CAMPURAN DAN ADONAN TEPUNG",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 10 industri makanan adalah barang konsumsi primer/non-siklis.",
    "reviewNote": ""
  },
  {
    "code": "10615",
    "title": "INDUSTRI MAKANAN SEREAL",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 10 industri makanan adalah barang konsumsi primer/non-siklis.",
    "reviewNote": ""
  },
  {
    "code": "10616",
    "title": "INDUSTRI TEPUNG TERIGU",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 10 industri makanan adalah barang konsumsi primer/non-siklis.",
    "reviewNote": ""
  },
  {
    "code": "10621",
    "title": "INDUSTRI PATI UBI KAYU",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 10 industri makanan adalah barang konsumsi primer/non-siklis.",
    "reviewNote": ""
  },
  {
    "code": "10622",
    "title": "INDUSTRI BERBAGAI MACAM PATI PALMA",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Divisi 10 industri makanan adalah barang konsumsi primer/non-siklis.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "10623",
    "title": "INDUSTRI GLUKOSA DAN SEJENISNYA",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Divisi 10 industri makanan adalah barang konsumsi primer/non-siklis.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "10629",
    "title": "INDUSTRI PATI DAN PRODUK PATI LAINNYA",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Divisi 10 industri makanan adalah barang konsumsi primer/non-siklis.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "10631",
    "title": "INDUSTRI PENGGILINGAN PADI DAN PENYOSOHAN BERAS",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 10 industri makanan adalah barang konsumsi primer/non-siklis.",
    "reviewNote": ""
  },
  {
    "code": "10632",
    "title": "INDUSTRI PENGGILINGAN DAN PEMBERSIHAN JAGUNG",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 10 industri makanan adalah barang konsumsi primer/non-siklis.",
    "reviewNote": ""
  },
  {
    "code": "10633",
    "title": "INDUSTRI TEPUNG BERAS DAN TEPUNG JAGUNG",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 10 industri makanan adalah barang konsumsi primer/non-siklis.",
    "reviewNote": ""
  },
  {
    "code": "10634",
    "title": "INDUSTRI PATI BERAS DAN JAGUNG",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 10 industri makanan adalah barang konsumsi primer/non-siklis.",
    "reviewNote": ""
  },
  {
    "code": "10635",
    "title": "INDUSTRI PEMANIS DARI BERAS DAN JAGUNG",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 10 industri makanan adalah barang konsumsi primer/non-siklis.",
    "reviewNote": ""
  },
  {
    "code": "10636",
    "title": "INDUSTRI MINYAK DARI JAGUNG DAN BERAS",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 10 industri makanan adalah barang konsumsi primer/non-siklis.",
    "reviewNote": ""
  },
  {
    "code": "10710",
    "title": "INDUSTRI PRODUK ROTI DAN KUE",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Divisi 10 industri makanan adalah barang konsumsi primer/non-siklis.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "10721",
    "title": "INDUSTRI GULA PASIR",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Divisi 10 industri makanan adalah barang konsumsi primer/non-siklis.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "10722",
    "title": "INDUSTRI GULA MERAH",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 10 industri makanan adalah barang konsumsi primer/non-siklis.",
    "reviewNote": ""
  },
  {
    "code": "10723",
    "title": "INDUSTRI SIROP",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 10 industri makanan adalah barang konsumsi primer/non-siklis.",
    "reviewNote": ""
  },
  {
    "code": "10729",
    "title": "INDUSTRI PENGOLAHAN GULA LAINNYA BUKAN SIROP",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Divisi 10 industri makanan adalah barang konsumsi primer/non-siklis.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "10731",
    "title": "INDUSTRI KAKAO",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Divisi 10 industri makanan adalah barang konsumsi primer/non-siklis.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "10732",
    "title": "INDUSTRI MAKANAN DARI COKELAT DAN KEMBANG GULA DARI COKLAT",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 10 industri makanan adalah barang konsumsi primer/non-siklis.",
    "reviewNote": ""
  },
  {
    "code": "10733",
    "title": "INDUSTRI MANISAN BUAH-BUAHAN DAN SAYURAN KERING",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Divisi 10 industri makanan adalah barang konsumsi primer/non-siklis.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "10734",
    "title": "INDUSTRI KEMBANG GULA",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 10 industri makanan adalah barang konsumsi primer/non-siklis.",
    "reviewNote": ""
  },
  {
    "code": "10739",
    "title": "INDUSTRI KEMBANG GULA LAINNYA",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Divisi 10 industri makanan adalah barang konsumsi primer/non-siklis.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "10740",
    "title": "INDUSTRI MAKARONI, MIE DAN PRODUK SEJENISNYA",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 10 industri makanan adalah barang konsumsi primer/non-siklis.",
    "reviewNote": ""
  },
  {
    "code": "10750",
    "title": "INDUSTRI MAKANAN DAN MASAKAN OLAHAN",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 10 industri makanan adalah barang konsumsi primer/non-siklis.",
    "reviewNote": ""
  },
  {
    "code": "10761",
    "title": "INDUSTRI PENGOLAHAN KOPI",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Divisi 10 industri makanan adalah barang konsumsi primer/non-siklis.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "10762",
    "title": "INDUSTRI PENGOLAHAN HERBAL (HERB INFUSION)",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 10 industri makanan adalah barang konsumsi primer/non-siklis.",
    "reviewNote": ""
  },
  {
    "code": "10763",
    "title": "INDUSTRI PENGOLAHAN TEH",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 10 industri makanan adalah barang konsumsi primer/non-siklis.",
    "reviewNote": ""
  },
  {
    "code": "10771",
    "title": "INDUSTRI KECAP",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Divisi 10 industri makanan adalah barang konsumsi primer/non-siklis.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "10772",
    "title": "INDUSTRI BUMBU MASAK DAN PENYEDAP MASAKAN",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Divisi 10 industri makanan adalah barang konsumsi primer/non-siklis.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "10773",
    "title": "INDUSTRI PRODUK MASAK DARI KELAPA",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 10 industri makanan adalah barang konsumsi primer/non-siklis.",
    "reviewNote": ""
  },
  {
    "code": "10774",
    "title": "INDUSTRI PENGOLAHAN GARAM",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 10 industri makanan adalah barang konsumsi primer/non-siklis.",
    "reviewNote": ""
  },
  {
    "code": "10779",
    "title": "INDUSTRI PRODUK MASAK LAINNYA",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Divisi 10 industri makanan adalah barang konsumsi primer/non-siklis.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "10791",
    "title": "INDUSTRI MAKANAN BAYI",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Divisi 10 industri makanan adalah barang konsumsi primer/non-siklis.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "10792",
    "title": "INDUSTRI KUE BASAH",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 10 industri makanan adalah barang konsumsi primer/non-siklis.",
    "reviewNote": ""
  },
  {
    "code": "10793",
    "title": "INDUSTRI MAKANAN DARI KEDELE DAN KACANG-KACANGAN LAINNYA BUKAN KECAP, TEMPE DAN TAHU",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Divisi 10 industri makanan adalah barang konsumsi primer/non-siklis.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "10794",
    "title": "INDUSTRI KERUPUK, KERIPIK, PEYEK DAN SEJENISNYA",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Divisi 10 industri makanan adalah barang konsumsi primer/non-siklis.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "10795",
    "title": "INDUSTRI KRIMER NABATI",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 10 industri makanan adalah barang konsumsi primer/non-siklis.",
    "reviewNote": ""
  },
  {
    "code": "10796",
    "title": "INDUSTRI DODOL",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 10 industri makanan adalah barang konsumsi primer/non-siklis.",
    "reviewNote": ""
  },
  {
    "code": "10799",
    "title": "INDUSTRI PRODUK MAKANAN LAINNYA",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Divisi 10 industri makanan adalah barang konsumsi primer/non-siklis.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "10801",
    "title": "INDUSTRI RANSUM MAKANAN HEWAN",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Divisi 10 industri makanan adalah barang konsumsi primer/non-siklis.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "10802",
    "title": "INDUSTRI KONSENTRAT MAKANAN HEWAN",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Divisi 10 industri makanan adalah barang konsumsi primer/non-siklis.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "11010",
    "title": "INDUSTRI MINUMAN BERALKOHOL HASIL DESTILASI",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 11 industri minuman masuk barang konsumsi primer/non-siklis.",
    "reviewNote": ""
  },
  {
    "code": "11020",
    "title": "INDUSTRI MINUMAN BERALKOHOL HASIL FERMENTASI ANGGUR DAN HASIL PERTANIAN LAINNYA",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Divisi 11 industri minuman masuk barang konsumsi primer/non-siklis.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "11031",
    "title": "INDUSTRI MINUMAN BERALKOHOL HASIL FERMENTASI MALT",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 11 industri minuman masuk barang konsumsi primer/non-siklis.",
    "reviewNote": ""
  },
  {
    "code": "11032",
    "title": "INDUSTRI MALT",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Divisi 11 industri minuman masuk barang konsumsi primer/non-siklis.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "11040",
    "title": "INDUSTRI MINUMAN RINGAN",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 11 industri minuman masuk barang konsumsi primer/non-siklis.",
    "reviewNote": ""
  },
  {
    "code": "11051",
    "title": "INDUSTRI AIR KEMASAN",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 11 industri minuman masuk barang konsumsi primer/non-siklis.",
    "reviewNote": ""
  },
  {
    "code": "11052",
    "title": "INDUSTRI AIR MINUM ISI ULANG",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 11 industri minuman masuk barang konsumsi primer/non-siklis.",
    "reviewNote": ""
  },
  {
    "code": "11090",
    "title": "INDUSTRI MINUMAN LAINNYA",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Divisi 11 industri minuman masuk barang konsumsi primer/non-siklis.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "12011",
    "title": "INDUSTRI SIGARET KRETEK TANGAN",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 12 tembakau/rokok termasuk Consumer Non-Cyclicals menurut IDX-IC.",
    "reviewNote": ""
  },
  {
    "code": "12012",
    "title": "INDUSTRI ROKOK PUTIH",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 12 tembakau/rokok termasuk Consumer Non-Cyclicals menurut IDX-IC.",
    "reviewNote": ""
  },
  {
    "code": "12013",
    "title": "INDUSTRI SIGARET KRETEK MESIN",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 12 tembakau/rokok termasuk Consumer Non-Cyclicals menurut IDX-IC.",
    "reviewNote": ""
  },
  {
    "code": "12019",
    "title": "INDUSTRI ROKOK LAINNYA",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Divisi 12 tembakau/rokok termasuk Consumer Non-Cyclicals menurut IDX-IC.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "12091",
    "title": "INDUSTRI PENGERINGAN DAN PENGOLAHAN TEMBAKAU",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 12 tembakau/rokok termasuk Consumer Non-Cyclicals menurut IDX-IC.",
    "reviewNote": ""
  },
  {
    "code": "12099",
    "title": "INDUSTRI BUMBU ROKOK SERTA KELENGKAPAN ROKOK LAINNYA",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Divisi 12 tembakau/rokok termasuk Consumer Non-Cyclicals menurut IDX-IC.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "13111",
    "title": "INDUSTRI PERSIAPAN SERAT TEKSTIL",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Tekstil, pakaian, kulit, dan alas kaki adalah barang konsumen sekunder/siklis.",
    "reviewNote": ""
  },
  {
    "code": "13112",
    "title": "INDUSTRI PEMINTALAN BENANG",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Tekstil, pakaian, kulit, dan alas kaki adalah barang konsumen sekunder/siklis.",
    "reviewNote": ""
  },
  {
    "code": "13113",
    "title": "INDUSTRI PEMINTALAN BENANG JAHIT",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Tekstil, pakaian, kulit, dan alas kaki adalah barang konsumen sekunder/siklis.",
    "reviewNote": ""
  },
  {
    "code": "13121",
    "title": "INDUSTRI PERTENUNAN (BUKAN PERTENUNAN KARUNG GONI DAN KARUNG LAINNYA)",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Tekstil, pakaian, kulit, dan alas kaki adalah barang konsumen sekunder/siklis.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "13122",
    "title": "INDUSTRI KAIN TENUN IKAT",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Tekstil, pakaian, kulit, dan alas kaki adalah barang konsumen sekunder/siklis.",
    "reviewNote": ""
  },
  {
    "code": "13123",
    "title": "INDUSTRI BULU TIRUAN TENUNAN",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Tekstil, pakaian, kulit, dan alas kaki adalah barang konsumen sekunder/siklis.",
    "reviewNote": ""
  },
  {
    "code": "13131",
    "title": "INDUSTRI PENYEMPURNAAN BENANG",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Tekstil, pakaian, kulit, dan alas kaki adalah barang konsumen sekunder/siklis.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "13132",
    "title": "INDUSTRI PENYEMPURNAAN KAIN",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Tekstil, pakaian, kulit, dan alas kaki adalah barang konsumen sekunder/siklis.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "13133",
    "title": "INDUSTRI PENCETAKAN KAIN",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Tekstil, pakaian, kulit, dan alas kaki adalah barang konsumen sekunder/siklis.",
    "reviewNote": ""
  },
  {
    "code": "13134",
    "title": "INDUSTRI BATIK",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Tekstil, pakaian, kulit, dan alas kaki adalah barang konsumen sekunder/siklis.",
    "reviewNote": ""
  },
  {
    "code": "13911",
    "title": "INDUSTRI KAIN RAJUTAN",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Tekstil, pakaian, kulit, dan alas kaki adalah barang konsumen sekunder/siklis.",
    "reviewNote": ""
  },
  {
    "code": "13912",
    "title": "INDUSTRI KAIN SULAMAN",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Tekstil, pakaian, kulit, dan alas kaki adalah barang konsumen sekunder/siklis.",
    "reviewNote": ""
  },
  {
    "code": "13913",
    "title": "INDUSTRI BULU TIRUAN RAJUTAN",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Tekstil, pakaian, kulit, dan alas kaki adalah barang konsumen sekunder/siklis.",
    "reviewNote": ""
  },
  {
    "code": "13921",
    "title": "INDUSTRI BARANG JADI TEKSTIL UNTUK KEPERLUAN RUMAH TANGGA",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Tekstil, pakaian, kulit, dan alas kaki adalah barang konsumen sekunder/siklis.",
    "reviewNote": ""
  },
  {
    "code": "13922",
    "title": "INDUSTRI BARANG JADI TEKSTIL SULAMAN",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Tekstil, pakaian, kulit, dan alas kaki adalah barang konsumen sekunder/siklis.",
    "reviewNote": ""
  },
  {
    "code": "13923",
    "title": "INDUSTRI BANTAL DAN SEJENISNYA",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Tekstil, pakaian, kulit, dan alas kaki adalah barang konsumen sekunder/siklis.",
    "reviewNote": ""
  },
  {
    "code": "13924",
    "title": "INDUSTRI BARANG JADI RAJUTAN DAN SULAMAN",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Tekstil, pakaian, kulit, dan alas kaki adalah barang konsumen sekunder/siklis.",
    "reviewNote": ""
  },
  {
    "code": "13925",
    "title": "INDUSTRI KARUNG GONI",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Tekstil, pakaian, kulit, dan alas kaki adalah barang konsumen sekunder/siklis.",
    "reviewNote": ""
  },
  {
    "code": "13926",
    "title": "INDUSTRI KARUNG BUKAN GONI",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Tekstil, pakaian, kulit, dan alas kaki adalah barang konsumen sekunder/siklis.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "13929",
    "title": "INDUSTRI BARANG JADI TEKSTIL LAINNYA",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Tekstil, pakaian, kulit, dan alas kaki adalah barang konsumen sekunder/siklis.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "13930",
    "title": "INDUSTRI KARPET DAN PERMADANI",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Tekstil, pakaian, kulit, dan alas kaki adalah barang konsumen sekunder/siklis.",
    "reviewNote": ""
  },
  {
    "code": "13941",
    "title": "INDUSTRI TALI",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Tekstil, pakaian, kulit, dan alas kaki adalah barang konsumen sekunder/siklis.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "13942",
    "title": "INDUSTRI BARANG DARI TALI",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Tekstil, pakaian, kulit, dan alas kaki adalah barang konsumen sekunder/siklis.",
    "reviewNote": ""
  },
  {
    "code": "13991",
    "title": "INDUSTRI KAIN PITA (NARROW FABRIC)",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Tekstil, pakaian, kulit, dan alas kaki adalah barang konsumen sekunder/siklis.",
    "reviewNote": ""
  },
  {
    "code": "13992",
    "title": "INDUSTRI YANG MENGHASILKAN KAIN KEPERLUAN INDUSTRI",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Tekstil, pakaian, kulit, dan alas kaki adalah barang konsumen sekunder/siklis.",
    "reviewNote": ""
  },
  {
    "code": "13993",
    "title": "INDUSTRI NON WOVEN (BUKAN TENUNAN)",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Tekstil, pakaian, kulit, dan alas kaki adalah barang konsumen sekunder/siklis.",
    "reviewNote": ""
  },
  {
    "code": "13994",
    "title": "INDUSTRI KAIN BAN",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Tekstil, pakaian, kulit, dan alas kaki adalah barang konsumen sekunder/siklis.",
    "reviewNote": ""
  },
  {
    "code": "13995",
    "title": "INDUSTRI KAPUK",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Tekstil, pakaian, kulit, dan alas kaki adalah barang konsumen sekunder/siklis.",
    "reviewNote": ""
  },
  {
    "code": "13996",
    "title": "INDUSTRI KAIN TULLE DAN KAIN JARING",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Tekstil, pakaian, kulit, dan alas kaki adalah barang konsumen sekunder/siklis.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "13999",
    "title": "INDUSTRI TEKSTIL LAINNYA YTDL",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Tekstil, pakaian, kulit, dan alas kaki adalah barang konsumen sekunder/siklis.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "14111",
    "title": "INDUSTRI PAKAIAN JADI (KONVEKSI) DARI TEKSTIL",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Tekstil, pakaian, kulit, dan alas kaki adalah barang konsumen sekunder/siklis.",
    "reviewNote": ""
  },
  {
    "code": "14112",
    "title": "INDUSTRI PAKAIAN JADI (KONVEKSI) DARI KULIT",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Tekstil, pakaian, kulit, dan alas kaki adalah barang konsumen sekunder/siklis.",
    "reviewNote": ""
  },
  {
    "code": "14120",
    "title": "PENJAHITAN DAN PEMBUATAN PAKAIAN SESUAI PESANAN",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Tekstil, pakaian, kulit, dan alas kaki adalah barang konsumen sekunder/siklis.",
    "reviewNote": ""
  },
  {
    "code": "14131",
    "title": "INDUSTRI PERLENGKAPAN PAKAIAN DARI TEKSTIL",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Tekstil, pakaian, kulit, dan alas kaki adalah barang konsumen sekunder/siklis.",
    "reviewNote": ""
  },
  {
    "code": "14132",
    "title": "INDUSTRI PERLENGKAPAN PAKAIAN DARI KULIT",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Tekstil, pakaian, kulit, dan alas kaki adalah barang konsumen sekunder/siklis.",
    "reviewNote": ""
  },
  {
    "code": "14200",
    "title": "INDUSTRI PAKAIAN JADI DAN BARANG DARI KULIT BERBULU",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Tekstil, pakaian, kulit, dan alas kaki adalah barang konsumen sekunder/siklis.",
    "reviewNote": ""
  },
  {
    "code": "14301",
    "title": "INDUSTRI PAKAIAN JADI RAJUTAN",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Tekstil, pakaian, kulit, dan alas kaki adalah barang konsumen sekunder/siklis.",
    "reviewNote": ""
  },
  {
    "code": "14302",
    "title": "INDUSTRI PAKAIAN JADI SULAMAN/BORDIR",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Tekstil, pakaian, kulit, dan alas kaki adalah barang konsumen sekunder/siklis.",
    "reviewNote": ""
  },
  {
    "code": "14303",
    "title": "INDUSTRI RAJUTAN KAOS KAKI DAN SEJENISNYA",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Tekstil, pakaian, kulit, dan alas kaki adalah barang konsumen sekunder/siklis.",
    "reviewNote": ""
  },
  {
    "code": "15111",
    "title": "INDUSTRI PENGAWETAN KULIT",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Tekstil, pakaian, kulit, dan alas kaki adalah barang konsumen sekunder/siklis.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "15112",
    "title": "INDUSTRI PENYAMAKAN KULIT",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Tekstil, pakaian, kulit, dan alas kaki adalah barang konsumen sekunder/siklis.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "15113",
    "title": "INDUSTRI PENCELUPAN KULIT BULU",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Tekstil, pakaian, kulit, dan alas kaki adalah barang konsumen sekunder/siklis.",
    "reviewNote": ""
  },
  {
    "code": "15114",
    "title": "INDUSTRI KULIT KOMPOSISI",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Tekstil, pakaian, kulit, dan alas kaki adalah barang konsumen sekunder/siklis.",
    "reviewNote": ""
  },
  {
    "code": "15121",
    "title": "INDUSTRI BARANG DARI KULIT DAN KULIT KOMPOSISI UNTUK KEPERLUAN PRIBADI",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Tekstil, pakaian, kulit, dan alas kaki adalah barang konsumen sekunder/siklis.",
    "reviewNote": ""
  },
  {
    "code": "15122",
    "title": "INDUSTRI BARANG DARI KULIT DAN KULIT KOMPOSISI UNTUK KEPERLUAN TEKNIK/INDUSTRI",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Tekstil, pakaian, kulit, dan alas kaki adalah barang konsumen sekunder/siklis.",
    "reviewNote": ""
  },
  {
    "code": "15123",
    "title": "INDUSTRI BARANG DARI KULIT DAN KULIT KOMPOSISI UNTUK KEPERLUAN HEWAN",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Tekstil, pakaian, kulit, dan alas kaki adalah barang konsumen sekunder/siklis.",
    "reviewNote": ""
  },
  {
    "code": "15129",
    "title": "INDUSTRI BARANG DARI KULIT DAN KULIT KOMPOSISI UNTUK KEPERLUAN LAINNYA",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Tekstil, pakaian, kulit, dan alas kaki adalah barang konsumen sekunder/siklis.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "15201",
    "title": "INDUSTRI ALAS KAKI UNTUK KEPERLUAN SEHARI-HARI",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Tekstil, pakaian, kulit, dan alas kaki adalah barang konsumen sekunder/siklis.",
    "reviewNote": ""
  },
  {
    "code": "15202",
    "title": "INDUSTRI SEPATU OLAHRAGA",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Tekstil, pakaian, kulit, dan alas kaki adalah barang konsumen sekunder/siklis.",
    "reviewNote": ""
  },
  {
    "code": "15203",
    "title": "INDUSTRI SEPATU TEKNIK LAPANGAN/KEPERLUAN INDUSTRI",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Tekstil, pakaian, kulit, dan alas kaki adalah barang konsumen sekunder/siklis.",
    "reviewNote": ""
  },
  {
    "code": "15209",
    "title": "INDUSTRI ALAS KAKI LAINNYA",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Tekstil, pakaian, kulit, dan alas kaki adalah barang konsumen sekunder/siklis.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "16101",
    "title": "INDUSTRI PENGGERGAJIAN KAYU",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Kayu, gabus, pulp, dan kertas adalah bahan baku/material menurut IDX-IC.",
    "reviewNote": ""
  },
  {
    "code": "16102",
    "title": "INDUSTRI PENGAWETAN KAYU",
    "sector": "Basic Materials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Kayu, gabus, pulp, dan kertas adalah bahan baku/material menurut IDX-IC.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "16103",
    "title": "INDUSTRI PENGAWETAN ROTAN, BAMBU DAN SEJENISNYA",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Kayu, gabus, pulp, dan kertas adalah bahan baku/material menurut IDX-IC.",
    "reviewNote": ""
  },
  {
    "code": "16104",
    "title": "INDUSTRI PENGOLAHAN ROTAN",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Kayu, gabus, pulp, dan kertas adalah bahan baku/material menurut IDX-IC.",
    "reviewNote": ""
  },
  {
    "code": "16105",
    "title": "INDUSTRI PARTIKEL KAYU DAN SEJENISNYA",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Kayu, gabus, pulp, dan kertas adalah bahan baku/material menurut IDX-IC.",
    "reviewNote": ""
  },
  {
    "code": "16211",
    "title": "INDUSTRI KAYU LAPIS",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Kayu, gabus, pulp, dan kertas adalah bahan baku/material menurut IDX-IC.",
    "reviewNote": ""
  },
  {
    "code": "16212",
    "title": "INDUSTRI KAYU LAPIS LAMINASI, TERMASUK DECORATIVE PLYWOOD",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Kayu, gabus, pulp, dan kertas adalah bahan baku/material menurut IDX-IC.",
    "reviewNote": ""
  },
  {
    "code": "16213",
    "title": "INDUSTRI PANEL KAYU LAINNYA",
    "sector": "Basic Materials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Kayu, gabus, pulp, dan kertas adalah bahan baku/material menurut IDX-IC.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "16214",
    "title": "INDUSTRI VENEER",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Kayu, gabus, pulp, dan kertas adalah bahan baku/material menurut IDX-IC.",
    "reviewNote": ""
  },
  {
    "code": "16215",
    "title": "INDUSTRI KAYU LAMINASI",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Kayu, gabus, pulp, dan kertas adalah bahan baku/material menurut IDX-IC.",
    "reviewNote": ""
  },
  {
    "code": "16221",
    "title": "INDUSTRI BARANG BANGUNAN DARI KAYU",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Kayu, gabus, pulp, dan kertas adalah bahan baku/material menurut IDX-IC.",
    "reviewNote": ""
  },
  {
    "code": "16222",
    "title": "INDUSTRI BANGUNAN PRAFABRIKASI DARI KAYU",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Kayu, gabus, pulp, dan kertas adalah bahan baku/material menurut IDX-IC.",
    "reviewNote": ""
  },
  {
    "code": "16230",
    "title": "INDUSTRI WADAH DARI KAYU",
    "sector": "Basic Materials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Kayu, gabus, pulp, dan kertas adalah bahan baku/material menurut IDX-IC.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "16291",
    "title": "INDUSTRI BARANG ANYAMAN DARI ROTAN DAN BAMBU",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Kayu, gabus, pulp, dan kertas adalah bahan baku/material menurut IDX-IC.",
    "reviewNote": ""
  },
  {
    "code": "16292",
    "title": "INDUSTRI BARANG ANYAMAN DARI TANAMAN BUKAN ROTAN DAN BAMBU",
    "sector": "Basic Materials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Kayu, gabus, pulp, dan kertas adalah bahan baku/material menurut IDX-IC.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "16293",
    "title": "INDUSTRI KERAJINAN UKIRAN DARI KAYU BUKAN MEBELLER",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Kayu, gabus, pulp, dan kertas adalah bahan baku/material menurut IDX-IC.",
    "reviewNote": ""
  },
  {
    "code": "16294",
    "title": "INDUSTRI ALAT DAPUR DARI KAYU, ROTAN DAN BAMBU",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Kayu, gabus, pulp, dan kertas adalah bahan baku/material menurut IDX-IC.",
    "reviewNote": ""
  },
  {
    "code": "16295",
    "title": "INDUSTRI KAYU BAKAR DAN PELET KAYU",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Kayu, gabus, pulp, dan kertas adalah bahan baku/material menurut IDX-IC.",
    "reviewNote": ""
  },
  {
    "code": "16299",
    "title": "INDUSTRI BARANG DARI KAYU, ROTAN, GABUS LAINNYA YTDL",
    "sector": "Basic Materials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Kayu, gabus, pulp, dan kertas adalah bahan baku/material menurut IDX-IC.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "17011",
    "title": "INDUSTRI BUBUR KERTAS (PULP)",
    "sector": "Basic Materials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Kayu, gabus, pulp, dan kertas adalah bahan baku/material menurut IDX-IC.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "17012",
    "title": "INDUSTRI KERTAS BUDAYA",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Kayu, gabus, pulp, dan kertas adalah bahan baku/material menurut IDX-IC.",
    "reviewNote": ""
  },
  {
    "code": "17013",
    "title": "INDUSTRI KERTAS BERHARGA",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Kayu, gabus, pulp, dan kertas adalah bahan baku/material menurut IDX-IC.",
    "reviewNote": ""
  },
  {
    "code": "17014",
    "title": "INDUSTRI KERTAS KHUSUS",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Kayu, gabus, pulp, dan kertas adalah bahan baku/material menurut IDX-IC.",
    "reviewNote": ""
  },
  {
    "code": "17019",
    "title": "INDUSTRI KERTAS LAINNYA",
    "sector": "Basic Materials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Kayu, gabus, pulp, dan kertas adalah bahan baku/material menurut IDX-IC.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "17021",
    "title": "INDUSTRI KERTAS DAN PAPAN KERTAS BERGELOMBANG",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Kayu, gabus, pulp, dan kertas adalah bahan baku/material menurut IDX-IC.",
    "reviewNote": ""
  },
  {
    "code": "17022",
    "title": "INDUSTRI KEMASAN DAN KOTAK DARI KERTAS DAN KARTON",
    "sector": "Basic Materials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Kayu, gabus, pulp, dan kertas adalah bahan baku/material menurut IDX-IC.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "17091",
    "title": "INDUSTRI KERTAS TISSUE",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Kayu, gabus, pulp, dan kertas adalah bahan baku/material menurut IDX-IC.",
    "reviewNote": ""
  },
  {
    "code": "17099",
    "title": "INDUSTRI BARANG DARI KERTAS DAN PAPAN KERTAS LAINNYA YTDL",
    "sector": "Basic Materials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Kayu, gabus, pulp, dan kertas adalah bahan baku/material menurut IDX-IC.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "18111",
    "title": "INDUSTRI PENCETAKAN UMUM",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Percetakan/reproduksi media adalah commercial services/supplies untuk kebutuhan industri.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "18112",
    "title": "INDUSTRI PENCETAKAN KHUSUS",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Percetakan/reproduksi media adalah commercial services/supplies untuk kebutuhan industri.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "18113",
    "title": "INDUSTRI PENCETAKAN 3D PRINTING",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Percetakan/reproduksi media adalah commercial services/supplies untuk kebutuhan industri.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "18120",
    "title": "KEGIATAN JASA PENUNJANG PENCETAKAN",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Percetakan/reproduksi media adalah commercial services/supplies untuk kebutuhan industri.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "18201",
    "title": "REPRODUKSI MEDIA REKAMAN SUARA DAN PIRANTI LUNAK",
    "sector": "Industrials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Percetakan/reproduksi media adalah commercial services/supplies untuk kebutuhan industri.",
    "reviewNote": ""
  },
  {
    "code": "18202",
    "title": "REPRODUKSI MEDIA REKAMAN FILM DAN VIDEO",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Percetakan/reproduksi media adalah commercial services/supplies untuk kebutuhan industri.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "19100",
    "title": "INDUSTRI PRODUK DARI BATU BARA",
    "sector": "Energy",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Produk batu bara dan pengilangan minyak bumi terkait langsung komoditas energi.",
    "reviewNote": ""
  },
  {
    "code": "19211",
    "title": "INDUSTRI BAHAN BAKAR DARI PEMURNIAN DAN PENGILANGAN MINYAK BUMI",
    "sector": "Energy",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Produk batu bara dan pengilangan minyak bumi terkait langsung komoditas energi.",
    "reviewNote": ""
  },
  {
    "code": "19212",
    "title": "INDUSTRI PEMBUATAN MINYAK PELUMAS",
    "sector": "Energy",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Produk batu bara dan pengilangan minyak bumi terkait langsung komoditas energi.",
    "reviewNote": ""
  },
  {
    "code": "19213",
    "title": "INDUSTRI PENGOLAHAN KEMBALI MINYAK PELUMAS BEKAS",
    "sector": "Energy",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Produk batu bara dan pengilangan minyak bumi terkait langsung komoditas energi.",
    "reviewNote": ""
  },
  {
    "code": "19214",
    "title": "INDUSTRI PENGOLAHAN MINYAK PELUMAS BEKAS MENJADI BAHAN BAKAR",
    "sector": "Energy",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Produk batu bara dan pengilangan minyak bumi terkait langsung komoditas energi.",
    "reviewNote": ""
  },
  {
    "code": "19291",
    "title": "INDUSTRI PRODUK DARI HASIL KILANG MINYAK BUMI",
    "sector": "Energy",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Produk batu bara dan pengilangan minyak bumi terkait langsung komoditas energi.",
    "reviewNote": ""
  },
  {
    "code": "19292",
    "title": "INDUSTRI BRIKET BATU BARA",
    "sector": "Energy",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Produk batu bara dan pengilangan minyak bumi terkait langsung komoditas energi.",
    "reviewNote": ""
  },
  {
    "code": "20111",
    "title": "INDUSTRI KIMIA DASAR ANORGANIK KHLOR DAN ALKALI",
    "sector": "Basic Materials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Bahan kimia dan produk kimia umumnya menjadi input/bahan baku industri lain.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "20112",
    "title": "INDUSTRI KIMIA DASAR ANORGANIK GAS INDUSTRI",
    "sector": "Basic Materials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Bahan kimia dan produk kimia umumnya menjadi input/bahan baku industri lain.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "20113",
    "title": "INDUSTRI KIMIA DASAR ANORGANIK PIGMEN",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Bahan kimia dan produk kimia umumnya menjadi input/bahan baku industri lain.",
    "reviewNote": ""
  },
  {
    "code": "20114",
    "title": "INDUSTRI KIMIA DASAR ANORGANIK LAINNYA",
    "sector": "Basic Materials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Bahan kimia dan produk kimia umumnya menjadi input/bahan baku industri lain.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "20115",
    "title": "INDUSTRI KIMIA DASAR ORGANIK YANG BERSUMBER DARI HASIL PERTANIAN",
    "sector": "Basic Materials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Bahan kimia dan produk kimia umumnya menjadi input/bahan baku industri lain.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "20116",
    "title": "INDUSTRI KIMIA DASAR ORGANIK UNTUK BAHAN BAKU ZAT WARNA DAN PIGMEN, ZAT WARNA DAN PIGMEN",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Bahan kimia dan produk kimia umumnya menjadi input/bahan baku industri lain.",
    "reviewNote": ""
  },
  {
    "code": "20117",
    "title": "INDUSTRI KIMIA DASAR ORGANIK YANG BERSUMBER DARI MINYAK BUMI, GAS ALAM DAN BATU BARA",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Bahan kimia dan produk kimia umumnya menjadi input/bahan baku industri lain.",
    "reviewNote": ""
  },
  {
    "code": "20118",
    "title": "INDUSTRI KIMIA DASAR ORGANIK YANG MENGHASILKAN BAHAN KIMIA KHUSUS",
    "sector": "Basic Materials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Bahan kimia dan produk kimia umumnya menjadi input/bahan baku industri lain.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "20119",
    "title": "INDUSTRI KIMIA DASAR ORGANIK LAINNYA",
    "sector": "Basic Materials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Bahan kimia dan produk kimia umumnya menjadi input/bahan baku industri lain.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "20121",
    "title": "INDUSTRI PUPUK ALAM/NON SINTETIS HARA MAKRO PRIMER",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Bahan kimia dan produk kimia umumnya menjadi input/bahan baku industri lain.",
    "reviewNote": ""
  },
  {
    "code": "20122",
    "title": "INDUSTRI PUPUK BUATAN TUNGGAL HARA MAKRO PRIMER",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Bahan kimia dan produk kimia umumnya menjadi input/bahan baku industri lain.",
    "reviewNote": ""
  },
  {
    "code": "20123",
    "title": "INDUSTRI PUPUK BUATAN MAJEMUK HARA MAKRO PRIMER",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Bahan kimia dan produk kimia umumnya menjadi input/bahan baku industri lain.",
    "reviewNote": ""
  },
  {
    "code": "20124",
    "title": "INDUSTRI PUPUK BUATAN CAMPURAN HARA MAKRO PRIMER",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Bahan kimia dan produk kimia umumnya menjadi input/bahan baku industri lain.",
    "reviewNote": ""
  },
  {
    "code": "20125",
    "title": "INDUSTRI PUPUK HARA MAKRO SEKUNDER",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Bahan kimia dan produk kimia umumnya menjadi input/bahan baku industri lain.",
    "reviewNote": ""
  },
  {
    "code": "20126",
    "title": "INDUSTRI PUPUK HARA MIKRO",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Bahan kimia dan produk kimia umumnya menjadi input/bahan baku industri lain.",
    "reviewNote": ""
  },
  {
    "code": "20127",
    "title": "INDUSTRI PUPUK PELENGKAP",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Bahan kimia dan produk kimia umumnya menjadi input/bahan baku industri lain.",
    "reviewNote": ""
  },
  {
    "code": "20128",
    "title": "INDUSTRI MEDIA TANAM",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Bahan kimia dan produk kimia umumnya menjadi input/bahan baku industri lain.",
    "reviewNote": ""
  },
  {
    "code": "20129",
    "title": "INDUSTRI PUPUK LAINNYA",
    "sector": "Basic Materials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Bahan kimia dan produk kimia umumnya menjadi input/bahan baku industri lain.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "20131",
    "title": "INDUSTRI DAMAR BUATAN (RESIN SINTETIS) DAN BAHAN BAKU PLASTIK",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Bahan kimia dan produk kimia umumnya menjadi input/bahan baku industri lain.",
    "reviewNote": ""
  },
  {
    "code": "20132",
    "title": "INDUSTRI KARET BUATAN",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Bahan kimia dan produk kimia umumnya menjadi input/bahan baku industri lain.",
    "reviewNote": ""
  },
  {
    "code": "20211",
    "title": "INDUSTRI BAHAN BAKU PEMBERANTAS HAMA (BAHAN AKTIF)",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Bahan kimia dan produk kimia umumnya menjadi input/bahan baku industri lain.",
    "reviewNote": ""
  },
  {
    "code": "20212",
    "title": "INDUSTRI PEMBERANTAS HAMA (FORMULASI)",
    "sector": "Basic Materials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Bahan kimia dan produk kimia umumnya menjadi input/bahan baku industri lain.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "20213",
    "title": "INDUSTRI ZAT PENGATUR TUMBUH",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Bahan kimia dan produk kimia umumnya menjadi input/bahan baku industri lain.",
    "reviewNote": ""
  },
  {
    "code": "20214",
    "title": "INDUSTRI BAHAN AMELIORAN (PEMBENAH TANAH)",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Bahan kimia dan produk kimia umumnya menjadi input/bahan baku industri lain.",
    "reviewNote": ""
  },
  {
    "code": "20221",
    "title": "INDUSTRI CAT DAN TINTA CETAK",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Bahan kimia dan produk kimia umumnya menjadi input/bahan baku industri lain.",
    "reviewNote": ""
  },
  {
    "code": "20222",
    "title": "INDUSTRI PERNIS (TERMASUK MASTIK)",
    "sector": "Basic Materials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Bahan kimia dan produk kimia umumnya menjadi input/bahan baku industri lain.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "20223",
    "title": "INDUSTRI LAK",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Bahan kimia dan produk kimia umumnya menjadi input/bahan baku industri lain.",
    "reviewNote": ""
  },
  {
    "code": "20231",
    "title": "INDUSTRI SABUN DAN BAHAN PEMBERSIH KEPERLUAN RUMAH TANGGA",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "Basic Materials",
    "reason": "Produk kimia personal care/household non-durable dipetakan ke Consumer Non-Cyclicals.",
    "reviewNote": ""
  },
  {
    "code": "20232",
    "title": "INDUSTRI KOSMETIK UNTUK MANUSIA, TERMASUK PASTA GIGI",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "Basic Materials",
    "reason": "Produk kimia personal care/household non-durable dipetakan ke Consumer Non-Cyclicals.",
    "reviewNote": ""
  },
  {
    "code": "20233",
    "title": "INDUSTRI KOSMETIK UNTUK HEWAN",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "Basic Materials",
    "reason": "Produk kimia personal care/household non-durable dipetakan ke Consumer Non-Cyclicals.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "20234",
    "title": "INDUSTRI PEREKAT GIGI",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Bahan kimia dan produk kimia umumnya menjadi input/bahan baku industri lain.",
    "reviewNote": ""
  },
  {
    "code": "20291",
    "title": "INDUSTRI PEREKAT/LEM",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Bahan kimia dan produk kimia umumnya menjadi input/bahan baku industri lain.",
    "reviewNote": ""
  },
  {
    "code": "20292",
    "title": "INDUSTRI BAHAN PELEDAK",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Bahan kimia dan produk kimia umumnya menjadi input/bahan baku industri lain.",
    "reviewNote": ""
  },
  {
    "code": "20293",
    "title": "INDUSTRI TINTA",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Bahan kimia dan produk kimia umumnya menjadi input/bahan baku industri lain.",
    "reviewNote": ""
  },
  {
    "code": "20294",
    "title": "INDUSTRI MINYAK ATSIRI",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Bahan kimia dan produk kimia umumnya menjadi input/bahan baku industri lain.",
    "reviewNote": ""
  },
  {
    "code": "20295",
    "title": "INDUSTRI KOREK API",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Bahan kimia dan produk kimia umumnya menjadi input/bahan baku industri lain.",
    "reviewNote": ""
  },
  {
    "code": "20296",
    "title": "INDUSTRI MINYAK ATSIRI RANTAI TENGAH",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Bahan kimia dan produk kimia umumnya menjadi input/bahan baku industri lain.",
    "reviewNote": ""
  },
  {
    "code": "20299",
    "title": "INDUSTRI BARANG KIMIA LAINNYA YTDL",
    "sector": "Basic Materials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Bahan kimia dan produk kimia umumnya menjadi input/bahan baku industri lain.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "20301",
    "title": "INDUSTRI SERAT/BENANG/STRIP FILAMEN BUATAN",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Bahan kimia dan produk kimia umumnya menjadi input/bahan baku industri lain.",
    "reviewNote": ""
  },
  {
    "code": "20302",
    "title": "INDUSTRI SERAT STAPEL BUATAN",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Bahan kimia dan produk kimia umumnya menjadi input/bahan baku industri lain.",
    "reviewNote": ""
  },
  {
    "code": "21011",
    "title": "INDUSTRI BAHAN FARMASI UNTUK MANUSIA",
    "sector": "Healthcare",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Farmasi, obat kimia, obat tradisional, dan vaksin termasuk Healthcare.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "21012",
    "title": "INDUSTRI PRODUK FARMASI UNTUK MANUSIA",
    "sector": "Healthcare",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Farmasi, obat kimia, obat tradisional, dan vaksin termasuk Healthcare.",
    "reviewNote": ""
  },
  {
    "code": "21013",
    "title": "INDUSTRI PRODUK FARMASI UNTUK HEWAN",
    "sector": "Healthcare",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Farmasi, obat kimia, obat tradisional, dan vaksin termasuk Healthcare.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "21014",
    "title": "INDUSTRI BAHAN FARMASI UNTUK HEWAN",
    "sector": "Healthcare",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Farmasi, obat kimia, obat tradisional, dan vaksin termasuk Healthcare.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "21015",
    "title": "INDUSTRI ALAT KESEHATAN DALAM SUBGOLONGAN 2101",
    "sector": "Healthcare",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Farmasi, obat kimia, obat tradisional, dan vaksin termasuk Healthcare.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "21021",
    "title": "INDUSTRI BAHAN BAKU OBAT TRADISIONAL UNTUK MANUSIA",
    "sector": "Healthcare",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Farmasi, obat kimia, obat tradisional, dan vaksin termasuk Healthcare.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "21022",
    "title": "INDUSTRI PRODUK OBAT TRADISIONAL UNTUK MANUSIA",
    "sector": "Healthcare",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Farmasi, obat kimia, obat tradisional, dan vaksin termasuk Healthcare.",
    "reviewNote": ""
  },
  {
    "code": "21023",
    "title": "INDUSTRI PRODUK OBAT TRADISIONAL UNTUK HEWAN",
    "sector": "Healthcare",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Farmasi, obat kimia, obat tradisional, dan vaksin termasuk Healthcare.",
    "reviewNote": ""
  },
  {
    "code": "21024",
    "title": "INDUSTRI BAHAN BAKU OBAT TRADISIONAL UNTUK HEWAN",
    "sector": "Healthcare",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Farmasi, obat kimia, obat tradisional, dan vaksin termasuk Healthcare.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "22111",
    "title": "INDUSTRI BAN LUAR DAN BAN DALAM",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "Basic Materials",
    "reason": "Ban/komponen otomotif adalah bagian rantai otomotif Consumer Cyclicals.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "22112",
    "title": "INDUSTRI VULKANISIR BAN",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "Basic Materials",
    "reason": "Ban/komponen otomotif adalah bagian rantai otomotif Consumer Cyclicals.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "22121",
    "title": "INDUSTRI PENGASAPAN KARET",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Karet dan plastik umumnya merupakan material/input untuk industri lain.",
    "reviewNote": ""
  },
  {
    "code": "22122",
    "title": "INDUSTRI REMILLING KARET",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Karet dan plastik umumnya merupakan material/input untuk industri lain.",
    "reviewNote": ""
  },
  {
    "code": "22123",
    "title": "INDUSTRI KARET REMAH (CRUMB RUBBER)",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Karet dan plastik umumnya merupakan material/input untuk industri lain.",
    "reviewNote": ""
  },
  {
    "code": "22191",
    "title": "INDUSTRI BARANG DARI KARET UNTUK KEPERLUAN RUMAH TANGGA",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Karet dan plastik umumnya merupakan material/input untuk industri lain.",
    "reviewNote": ""
  },
  {
    "code": "22192",
    "title": "INDUSTRI BARANG DARI KARET UNTUK KEPERLUAN INDUSTRI",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Karet dan plastik umumnya merupakan material/input untuk industri lain.",
    "reviewNote": ""
  },
  {
    "code": "22193",
    "title": "INDUSTRI BARANG DARI KARET UNTUK KEPERLUAN INFRASTRUKTUR",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "Basic Materials",
    "reason": "Ban/komponen otomotif adalah bagian rantai otomotif Consumer Cyclicals.",
    "reviewNote": ""
  },
  {
    "code": "22194",
    "title": "INDUSTRI BARANG DARI KARET UNTUK KESEHATAN",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Karet dan plastik umumnya merupakan material/input untuk industri lain.",
    "reviewNote": ""
  },
  {
    "code": "22199",
    "title": "INDUSTRI BARANG DARI KARET LAINNYA YTDL",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "Basic Materials",
    "reason": "Ban/komponen otomotif adalah bagian rantai otomotif Consumer Cyclicals.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "22210",
    "title": "INDUSTRI BARANG DARI PLASTIK UNTUK BANGUNAN",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "Basic Materials",
    "reason": "Ban/komponen otomotif adalah bagian rantai otomotif Consumer Cyclicals.",
    "reviewNote": ""
  },
  {
    "code": "22220",
    "title": "INDUSTRI BARANG DARI PLASTIK UNTUK PENGEMASAN",
    "sector": "Basic Materials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Karet dan plastik umumnya merupakan material/input untuk industri lain.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "22230",
    "title": "INDUSTRI PIPA PLASTIK DAN PERLENGKAPANNYA",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Karet dan plastik umumnya merupakan material/input untuk industri lain.",
    "reviewNote": ""
  },
  {
    "code": "22291",
    "title": "INDUSTRI BARANG PLASTIK LEMBARAN",
    "sector": "Basic Materials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Karet dan plastik umumnya merupakan material/input untuk industri lain.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "22292",
    "title": "INDUSTRI PERLENGKAPAN DAN PERALATAN RUMAH TANGGA (TIDAK TERMASUK FURNITUR)",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Karet dan plastik umumnya merupakan material/input untuk industri lain.",
    "reviewNote": ""
  },
  {
    "code": "22293",
    "title": "INDUSTRI BARANG DAN PERALATAN TEKNIK/INDUSTRI DARI PLASTIK",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "Basic Materials",
    "reason": "Ban/komponen otomotif adalah bagian rantai otomotif Consumer Cyclicals.",
    "reviewNote": ""
  },
  {
    "code": "22299",
    "title": "INDUSTRI BARANG PLASTIK LAINNYA YTDL",
    "sector": "Basic Materials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Karet dan plastik umumnya merupakan material/input untuk industri lain.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "23111",
    "title": "INDUSTRI KACA LEMBARAN",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Barang galian bukan logam dan logam dasar adalah material/bahan baku.",
    "reviewNote": ""
  },
  {
    "code": "23112",
    "title": "INDUSTRI KACA PENGAMAN",
    "sector": "Basic Materials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Barang galian bukan logam dan logam dasar adalah material/bahan baku.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "23119",
    "title": "INDUSTRI KACA LAINNYA",
    "sector": "Basic Materials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Barang galian bukan logam dan logam dasar adalah material/bahan baku.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "23121",
    "title": "INDUSTRI PERLENGKAPAN DAN PERALATAN RUMAH TANGGA DARI KACA",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Barang galian bukan logam dan logam dasar adalah material/bahan baku.",
    "reviewNote": ""
  },
  {
    "code": "23122",
    "title": "INDUSTRI ALAT-ALAT LABORATORIUM NON KLINIS, FARMASI DAN KESEHATAN DARI KACA",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Barang galian bukan logam dan logam dasar adalah material/bahan baku.",
    "reviewNote": ""
  },
  {
    "code": "23123",
    "title": "INDUSTRI KEMASAN DARI KACA",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Barang galian bukan logam dan logam dasar adalah material/bahan baku.",
    "reviewNote": ""
  },
  {
    "code": "23124",
    "title": "INDUSTRI ALAT LABORATORIUM KLINIS DARI KACA",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Barang galian bukan logam dan logam dasar adalah material/bahan baku.",
    "reviewNote": ""
  },
  {
    "code": "23129",
    "title": "INDUSTRI BARANG LAINNYA DARI KACA",
    "sector": "Basic Materials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Barang galian bukan logam dan logam dasar adalah material/bahan baku.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "23911",
    "title": "INDUSTRI BATA, MORTAR, SEMEN, DAN SEJENISNYA YANG TAHAN API",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Barang galian bukan logam dan logam dasar adalah material/bahan baku.",
    "reviewNote": ""
  },
  {
    "code": "23919",
    "title": "INDUSTRI BARANG TAHAN API DARI TANAH LIAT/KERAMIK LAINNYA",
    "sector": "Basic Materials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Barang galian bukan logam dan logam dasar adalah material/bahan baku.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "23921",
    "title": "INDUSTRI BATU BATA DARI TANAH LIAT/KERAMIK",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Barang galian bukan logam dan logam dasar adalah material/bahan baku.",
    "reviewNote": ""
  },
  {
    "code": "23922",
    "title": "INDUSTRI GENTENG DARI TANAH LIAT/KERAMIK",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Barang galian bukan logam dan logam dasar adalah material/bahan baku.",
    "reviewNote": ""
  },
  {
    "code": "23923",
    "title": "INDUSTRI PERALATAN SANITER DARI PORSELEN",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Barang galian bukan logam dan logam dasar adalah material/bahan baku.",
    "reviewNote": ""
  },
  {
    "code": "23929",
    "title": "INDUSTRI BAHAN BANGUNAN DARI TANAH LIAT/KERAMIK BUKAN BATU BATA DAN GENTENG",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Barang galian bukan logam dan logam dasar adalah material/bahan baku.",
    "reviewNote": ""
  },
  {
    "code": "23931",
    "title": "INDUSTRI PERLENGKAPAN RUMAH TANGGA DARI PORSELEN",
    "sector": "Basic Materials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Barang galian bukan logam dan logam dasar adalah material/bahan baku.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "23932",
    "title": "INDUSTRI PERLENGKAPAN RUMAH TANGGA DARI TANAH LIAT/KERAMIK",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Barang galian bukan logam dan logam dasar adalah material/bahan baku.",
    "reviewNote": ""
  },
  {
    "code": "23933",
    "title": "INDUSTRI ALAT LABORATORIUM DAN ALAT LISTRIK/TEKNIK DARI PORSELEN",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Barang galian bukan logam dan logam dasar adalah material/bahan baku.",
    "reviewNote": ""
  },
  {
    "code": "23939",
    "title": "INDUSTRI BARANG TANAH LIAT/KERAMIK DAN PORSELEN LAINNYA BUKAN BAHAN BANGUNAN",
    "sector": "Basic Materials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Barang galian bukan logam dan logam dasar adalah material/bahan baku.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "23941",
    "title": "INDUSTRI SEMEN",
    "sector": "Basic Materials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Barang galian bukan logam dan logam dasar adalah material/bahan baku.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "23942",
    "title": "INDUSTRI KAPUR",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Barang galian bukan logam dan logam dasar adalah material/bahan baku.",
    "reviewNote": ""
  },
  {
    "code": "23943",
    "title": "INDUSTRI GIPS",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Barang galian bukan logam dan logam dasar adalah material/bahan baku.",
    "reviewNote": ""
  },
  {
    "code": "23951",
    "title": "INDUSTRI BARANG DARI SEMEN",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Barang galian bukan logam dan logam dasar adalah material/bahan baku.",
    "reviewNote": ""
  },
  {
    "code": "23952",
    "title": "INDUSTRI BARANG DARI KAPUR",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Barang galian bukan logam dan logam dasar adalah material/bahan baku.",
    "reviewNote": ""
  },
  {
    "code": "23953",
    "title": "INDUSTRI BARANG DARI SEMEN DAN KAPUR UNTUK KONSTRUKSI",
    "sector": "Basic Materials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Barang galian bukan logam dan logam dasar adalah material/bahan baku.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "23954",
    "title": "INDUSTRI BARANG DARI GIPS UNTUK KONSTRUKSI",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Barang galian bukan logam dan logam dasar adalah material/bahan baku.",
    "reviewNote": ""
  },
  {
    "code": "23955",
    "title": "INDUSTRI BARANG DARI ASBES UNTUK KEPERLUAN BAHAN BANGUNAN",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Barang galian bukan logam dan logam dasar adalah material/bahan baku.",
    "reviewNote": ""
  },
  {
    "code": "23956",
    "title": "INDUSTRI BARANG DARI ASBES UNTUK KEPERLUAN INDUSTRI",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Barang galian bukan logam dan logam dasar adalah material/bahan baku.",
    "reviewNote": ""
  },
  {
    "code": "23957",
    "title": "INDUSTRI MORTAR ATAU BETON SIAP PAKAI",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Barang galian bukan logam dan logam dasar adalah material/bahan baku.",
    "reviewNote": ""
  },
  {
    "code": "23959",
    "title": "INDUSTRI BARANG DARI SEMEN, KAPUR, GIPS DAN ASBES LAINNYA",
    "sector": "Basic Materials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Barang galian bukan logam dan logam dasar adalah material/bahan baku.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "23961",
    "title": "INDUSTRI BARANG DARI MARMER DAN GRANIT UNTUK KEPERLUAN RUMAH TANGGA DAN PAJANGAN",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Barang galian bukan logam dan logam dasar adalah material/bahan baku.",
    "reviewNote": ""
  },
  {
    "code": "23962",
    "title": "INDUSTRI BARANG DARI MARMER DAN GRANIT UNTUK KEPERLUAN BAHAN BANGUNAN",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Barang galian bukan logam dan logam dasar adalah material/bahan baku.",
    "reviewNote": ""
  },
  {
    "code": "23963",
    "title": "INDUSTRI BARANG DARI BATU UNTUK KEPERLUAN RUMAH TANGGA, PAJANGAN, DAN BAHAN BANGUNAN",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Barang galian bukan logam dan logam dasar adalah material/bahan baku.",
    "reviewNote": ""
  },
  {
    "code": "23969",
    "title": "INDUSTRI BARANG DARI MARMER, GRANIT DAN BATU LAINNYA",
    "sector": "Basic Materials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Barang galian bukan logam dan logam dasar adalah material/bahan baku.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "23990",
    "title": "INDUSTRI BARANG GALIAN BUKAN LOGAM LAINNYA YTDL",
    "sector": "Basic Materials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Barang galian bukan logam dan logam dasar adalah material/bahan baku.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "24101",
    "title": "INDUSTRI BESI DAN BAJA DASAR (IRON AND STEEL MAKING)",
    "sector": "Basic Materials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Barang galian bukan logam dan logam dasar adalah material/bahan baku.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "24102",
    "title": "INDUSTRI PENGGILINGAN BAJA (STEEL ROLLING)",
    "sector": "Basic Materials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Barang galian bukan logam dan logam dasar adalah material/bahan baku.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "24103",
    "title": "INDUSTRI PIPA DAN SAMBUNGAN PIPA DARI BAJA DAN BESI",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Barang galian bukan logam dan logam dasar adalah material/bahan baku.",
    "reviewNote": ""
  },
  {
    "code": "24201",
    "title": "INDUSTRI PEMBUATAN LOGAM DASAR MULIA",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Barang galian bukan logam dan logam dasar adalah material/bahan baku.",
    "reviewNote": ""
  },
  {
    "code": "24202",
    "title": "INDUSTRI PEMBUATAN LOGAM DASAR BUKAN BESI",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Barang galian bukan logam dan logam dasar adalah material/bahan baku.",
    "reviewNote": ""
  },
  {
    "code": "24203",
    "title": "INDUSTRI PENGGILINGAN LOGAM BUKAN BESI",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Barang galian bukan logam dan logam dasar adalah material/bahan baku.",
    "reviewNote": ""
  },
  {
    "code": "24204",
    "title": "INDUSTRI EKSTRUSI LOGAM BUKAN BESI",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Barang galian bukan logam dan logam dasar adalah material/bahan baku.",
    "reviewNote": ""
  },
  {
    "code": "24205",
    "title": "INDUSTRI PIPA DAN SAMBUNGAN PIPA DARI LOGAM BUKAN BESI DAN BAJA",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Barang galian bukan logam dan logam dasar adalah material/bahan baku.",
    "reviewNote": ""
  },
  {
    "code": "24206",
    "title": "INDUSTRI PENGOLAHAN URANIUM DAN BIJIH URANIUM",
    "sector": "Basic Materials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Barang galian bukan logam dan logam dasar adalah material/bahan baku.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "24310",
    "title": "INDUSTRI PENGECORAN BESI DAN BAJA",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Barang galian bukan logam dan logam dasar adalah material/bahan baku.",
    "reviewNote": ""
  },
  {
    "code": "24320",
    "title": "INDUSTRI PENGECORAN LOGAM BUKAN BESI DAN BAJA",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Barang galian bukan logam dan logam dasar adalah material/bahan baku.",
    "reviewNote": ""
  },
  {
    "code": "25111",
    "title": "INDUSTRI BARANG DARI LOGAM BUKAN ALUMINIUM SIAP PASANG UNTUK BANGUNAN",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "Basic Materials",
    "reason": "Barang logam fabrikasi umumnya menjadi produk/komponen industri final.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "25112",
    "title": "INDUSTRI BARANG DARI LOGAM ALUMINIUM SIAP PASANG UNTUK BANGUNAN",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "Basic Materials",
    "reason": "Barang logam fabrikasi umumnya menjadi produk/komponen industri final.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "25113",
    "title": "INDUSTRI KONSTRUKSI BERAT SIAP PASANG DARI BAJA UNTUK BANGUNAN",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "Basic Materials",
    "reason": "Barang logam fabrikasi umumnya menjadi produk/komponen industri final.",
    "reviewNote": ""
  },
  {
    "code": "25119",
    "title": "INDUSTRI BARANG DARI LOGAM SIAP PASANG UNTUK KONSTRUKSI LAINNYA",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "Basic Materials",
    "reason": "Barang logam fabrikasi umumnya menjadi produk/komponen industri final.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "25120",
    "title": "INDUSTRI TANGKI, TANDON AIR DAN WADAH DARI LOGAM",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "Basic Materials",
    "reason": "Barang logam fabrikasi umumnya menjadi produk/komponen industri final.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "25130",
    "title": "INDUSTRI GENERATOR UAP, BUKAN KETEL PEMANAS",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "Basic Materials",
    "reason": "Barang logam fabrikasi umumnya menjadi produk/komponen industri final.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "25200",
    "title": "INDUSTRI SENJATA DAN AMUNISI",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "Basic Materials",
    "reason": "Barang logam fabrikasi umumnya menjadi produk/komponen industri final.",
    "reviewNote": ""
  },
  {
    "code": "25910",
    "title": "INDUSTRI PENEMPAAN, PENGEPRESAN, PENCETAKAN DAN PEMBENTUKAN LOGAM; METALURGI BUBUK",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "Basic Materials",
    "reason": "Barang logam fabrikasi umumnya menjadi produk/komponen industri final.",
    "reviewNote": ""
  },
  {
    "code": "25920",
    "title": "JASA INDUSTRI UNTUK BERBAGAI PENGERJAAN KHUSUS LOGAM DAN BARANG DARI LOGAM",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "Basic Materials",
    "reason": "Barang logam fabrikasi umumnya menjadi produk/komponen industri final.",
    "reviewNote": ""
  },
  {
    "code": "25931",
    "title": "INDUSTRI ALAT POTONG DAN PERKAKAS TANGAN UNTUK PERTANIAN",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "Basic Materials",
    "reason": "Barang logam fabrikasi umumnya menjadi produk/komponen industri final.",
    "reviewNote": ""
  },
  {
    "code": "25932",
    "title": "INDUSTRI ALAT POTONG DAN PERKAKAS TANGAN PERTUKANGAN",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "Basic Materials",
    "reason": "Barang logam fabrikasi umumnya menjadi produk/komponen industri final.",
    "reviewNote": ""
  },
  {
    "code": "25933",
    "title": "INDUSTRI ALAT POTONG DAN PERKAKAS TANGAN YANG DIGUNAKAN DALAM RUMAH TANGGA",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "Basic Materials",
    "reason": "Barang logam fabrikasi umumnya menjadi produk/komponen industri final.",
    "reviewNote": ""
  },
  {
    "code": "25934",
    "title": "INDUSTRI PERALATAN UMUM",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "Basic Materials",
    "reason": "Barang logam fabrikasi umumnya menjadi produk/komponen industri final.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "25940",
    "title": "INDUSTRI EMBER, KALENG, DRUM DAN WADAH SEJENIS DARI LOGAM",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "Basic Materials",
    "reason": "Barang logam fabrikasi umumnya menjadi produk/komponen industri final.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "25951",
    "title": "INDUSTRI BARANG DARI KAWAT",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "Basic Materials",
    "reason": "Barang logam fabrikasi umumnya menjadi produk/komponen industri final.",
    "reviewNote": ""
  },
  {
    "code": "25952",
    "title": "INDUSTRI PAKU, MUR DAN BAUT",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "Basic Materials",
    "reason": "Barang logam fabrikasi umumnya menjadi produk/komponen industri final.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "25991",
    "title": "INDUSTRI BRANKAS, FILLING KANTOR DAN SEJENISNYA",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "Basic Materials",
    "reason": "Barang logam fabrikasi umumnya menjadi produk/komponen industri final.",
    "reviewNote": ""
  },
  {
    "code": "25992",
    "title": "INDUSTRI PERALATAN DAPUR DAN PERALATAN MEJA DARI LOGAM",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "Basic Materials",
    "reason": "Barang logam fabrikasi umumnya menjadi produk/komponen industri final.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "25993",
    "title": "INDUSTRI KEPERLUAN RUMAH TANGGA DARI LOGAM BUKAN PERALATAN DAPUR DAN PERALATAN MEJA",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "Basic Materials",
    "reason": "Barang logam fabrikasi umumnya menjadi produk/komponen industri final.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "25994",
    "title": "INDUSTRI PEMBUATAN PROFIL",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "Basic Materials",
    "reason": "Barang logam fabrikasi umumnya menjadi produk/komponen industri final.",
    "reviewNote": ""
  },
  {
    "code": "25995",
    "title": "INDUSTRI LAMPU DARI LOGAM",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "Basic Materials",
    "reason": "Barang logam fabrikasi umumnya menjadi produk/komponen industri final.",
    "reviewNote": ""
  },
  {
    "code": "25999",
    "title": "INDUSTRI BARANG LOGAM LAINNYA YTDL",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "Basic Materials",
    "reason": "Barang logam fabrikasi umumnya menjadi produk/komponen industri final.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "26110",
    "title": "INDUSTRI TABUNG ELEKTRON DAN KONEKTOR ELEKTRONIK",
    "sector": "Technology",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Komputer, elektronik, optik, perangkat jaringan, dan komponen masuk Technology.",
    "reviewNote": ""
  },
  {
    "code": "26120",
    "title": "INDUSTRI SEMI KONDUKTOR DAN KOMPONEN ELEKTRONIK LAINNYA",
    "sector": "Technology",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Komputer, elektronik, optik, perangkat jaringan, dan komponen masuk Technology.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "26210",
    "title": "INDUSTRI KOMPUTER DAN/ATAU PERAKITAN KOMPUTER",
    "sector": "Technology",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Komputer, elektronik, optik, perangkat jaringan, dan komponen masuk Technology.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "26220",
    "title": "INDUSTRI PERLENGKAPAN KOMPUTER",
    "sector": "Technology",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Komputer, elektronik, optik, perangkat jaringan, dan komponen masuk Technology.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "26310",
    "title": "INDUSTRI PERALATAN TELEPON DAN FAKSIMILI",
    "sector": "Technology",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Komputer, elektronik, optik, perangkat jaringan, dan komponen masuk Technology.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "26320",
    "title": "INDUSTRI PERALATAN KOMUNIKASI TANPA KABEL (WIRELESS)",
    "sector": "Technology",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Komputer, elektronik, optik, perangkat jaringan, dan komponen masuk Technology.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "26391",
    "title": "INDUSTRI KARTU CERDAS (SMART CARD)",
    "sector": "Technology",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Komputer, elektronik, optik, perangkat jaringan, dan komponen masuk Technology.",
    "reviewNote": ""
  },
  {
    "code": "26399",
    "title": "INDUSTRI PERALATAN KOMUNIKASI LAINNYA",
    "sector": "Technology",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Komputer, elektronik, optik, perangkat jaringan, dan komponen masuk Technology.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "26410",
    "title": "INDUSTRI TELEVISI DAN/ATAU PERAKITAN TELEVISI",
    "sector": "Technology",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Komputer, elektronik, optik, perangkat jaringan, dan komponen masuk Technology.",
    "reviewNote": ""
  },
  {
    "code": "26420",
    "title": "INDUSTRI PERALATAN PEREKAM, PENERIMA DAN PENGGANDA AUDIO DAN VIDEO, BUKAN INDUSTRI TELEVISI",
    "sector": "Technology",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Komputer, elektronik, optik, perangkat jaringan, dan komponen masuk Technology.",
    "reviewNote": ""
  },
  {
    "code": "26490",
    "title": "INDUSTRI PERALATAN AUDIO DAN VIDEO ELEKTRONIK LAINNYA",
    "sector": "Technology",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Komputer, elektronik, optik, perangkat jaringan, dan komponen masuk Technology.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "26511",
    "title": "INDUSTRI ALAT UKUR DAN ALAT UJI MANUAL",
    "sector": "Healthcare",
    "confidence": "Medium",
    "alternativeSector": "Technology",
    "reason": "Peralatan elektromedik/alat kesehatan dalam divisi elektronik dipetakan ke Healthcare.",
    "reviewNote": ""
  },
  {
    "code": "26512",
    "title": "INDUSTRI ALAT UKUR DAN ALAT UJI ELEKTRIK",
    "sector": "Technology",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Komputer, elektronik, optik, perangkat jaringan, dan komponen masuk Technology.",
    "reviewNote": ""
  },
  {
    "code": "26513",
    "title": "INDUSTRI ALAT UKUR DAN ALAT UJI ELEKTRONIK",
    "sector": "Technology",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Komputer, elektronik, optik, perangkat jaringan, dan komponen masuk Technology.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "26514",
    "title": "INDUSTRI ALAT UJI DALAM PROSES INDUSTRI",
    "sector": "Technology",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Komputer, elektronik, optik, perangkat jaringan, dan komponen masuk Technology.",
    "reviewNote": ""
  },
  {
    "code": "26520",
    "title": "INDUSTRI ALAT UKUR WAKTU",
    "sector": "Technology",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Komputer, elektronik, optik, perangkat jaringan, dan komponen masuk Technology.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "26601",
    "title": "INDUSTRI PERALATAN IRADIASI/SINAR X, PERLENGKAPAN DAN SEJENISNYA",
    "sector": "Healthcare",
    "confidence": "Medium",
    "alternativeSector": "Technology",
    "reason": "Peralatan elektromedik/alat kesehatan dalam divisi elektronik dipetakan ke Healthcare.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "26602",
    "title": "INDUSTRI PERALATAN ELEKTROMEDIKAL DAN ELEKTROTERAPI",
    "sector": "Healthcare",
    "confidence": "Medium",
    "alternativeSector": "Technology",
    "reason": "Peralatan elektromedik/alat kesehatan dalam divisi elektronik dipetakan ke Healthcare.",
    "reviewNote": ""
  },
  {
    "code": "26710",
    "title": "INDUSTRI PERALATAN FOTOGRAFI",
    "sector": "Technology",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Komputer, elektronik, optik, perangkat jaringan, dan komponen masuk Technology.",
    "reviewNote": ""
  },
  {
    "code": "26791",
    "title": "INDUSTRI KAMERA CINEMATOGRAFI PROYEKTOR DAN PERLENGKAPANNYA",
    "sector": "Technology",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Komputer, elektronik, optik, perangkat jaringan, dan komponen masuk Technology.",
    "reviewNote": ""
  },
  {
    "code": "26792",
    "title": "INDUSTRI TEROPONG DAN INSTRUMEN OPTIK BUKAN KACA MATA",
    "sector": "Technology",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Komputer, elektronik, optik, perangkat jaringan, dan komponen masuk Technology.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "26800",
    "title": "INDUSTRI MEDIA MAGNETIK DAN MEDIA OPTIK",
    "sector": "Technology",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Komputer, elektronik, optik, perangkat jaringan, dan komponen masuk Technology.",
    "reviewNote": ""
  },
  {
    "code": "27111",
    "title": "INDUSTRI MOTOR LISTRIK",
    "sector": "Industrials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Peralatan listrik umumnya adalah produk industri/capital goods.",
    "reviewNote": ""
  },
  {
    "code": "27112",
    "title": "INDUSTRI MESIN PEMBANGKIT LISTRIK",
    "sector": "Industrials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Peralatan listrik umumnya adalah produk industri/capital goods.",
    "reviewNote": ""
  },
  {
    "code": "27113",
    "title": "INDUSTRI PENGUBAH TEGANGAN (TRANSFORMATOR), PENGUBAH ARUS (RECTIFIER) DAN PENGONTROL TEGANGAN (VOLTAGE STABILIZER)",
    "sector": "Industrials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Peralatan listrik umumnya adalah produk industri/capital goods.",
    "reviewNote": ""
  },
  {
    "code": "27120",
    "title": "INDUSTRI PERALATAN PENGONTROL DAN PENDISTRIBUSIAN LISTRIK",
    "sector": "Industrials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Peralatan listrik umumnya adalah produk industri/capital goods.",
    "reviewNote": ""
  },
  {
    "code": "27201",
    "title": "INDUSTRI BATU BATERAI",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Peralatan listrik umumnya adalah produk industri/capital goods.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "27202",
    "title": "INDUSTRI AKUMULATOR LISTRIK",
    "sector": "Industrials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Peralatan listrik umumnya adalah produk industri/capital goods.",
    "reviewNote": ""
  },
  {
    "code": "27203",
    "title": "INDUSTRI BATERAI UNTUK KENDARAAN BERMOTOR LISTRIK",
    "sector": "Industrials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Peralatan listrik umumnya adalah produk industri/capital goods.",
    "reviewNote": ""
  },
  {
    "code": "27310",
    "title": "INDUSTRI KABEL SERAT OPTIK",
    "sector": "Industrials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Peralatan listrik umumnya adalah produk industri/capital goods.",
    "reviewNote": ""
  },
  {
    "code": "27320",
    "title": "INDUSTRI KABEL LISTRIK DAN ELEKTRONIK LAINNYA",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Peralatan listrik umumnya adalah produk industri/capital goods.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "27330",
    "title": "INDUSTRI PERLENGKAPAN KABEL",
    "sector": "Industrials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Peralatan listrik umumnya adalah produk industri/capital goods.",
    "reviewNote": ""
  },
  {
    "code": "27401",
    "title": "INDUSTRI BOLA LAMPU PIJAR, LAMPU PENERANGAN TERPUSAT DAN LAMPU ULTRA VIOLET",
    "sector": "Industrials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Peralatan listrik umumnya adalah produk industri/capital goods.",
    "reviewNote": ""
  },
  {
    "code": "27402",
    "title": "INDUSTRI LAMPU TABUNG GAS (LAMPU PEMBUANG LISTRIK)",
    "sector": "Industrials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Peralatan listrik umumnya adalah produk industri/capital goods.",
    "reviewNote": ""
  },
  {
    "code": "27403",
    "title": "INDUSTRI PERALATAN PENERANGAN UNTUK ALAT TRANSPORTASI",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Peralatan listrik umumnya adalah produk industri/capital goods.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "27404",
    "title": "INDUSTRI LAMPU LED",
    "sector": "Industrials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Peralatan listrik umumnya adalah produk industri/capital goods.",
    "reviewNote": ""
  },
  {
    "code": "27409",
    "title": "INDUSTRI PERALATAN PENERANGAN LAINNYA",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Peralatan listrik umumnya adalah produk industri/capital goods.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "27510",
    "title": "INDUSTRI PERALATAN LISTRIK RUMAH TANGGA",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "Industrials",
    "reason": "Peralatan listrik rumah tangga adalah durable consumer goods.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "27520",
    "title": "INDUSTRI PERALATAN ELEKTROTERMAL RUMAH TANGGA",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "Industrials",
    "reason": "Peralatan listrik rumah tangga adalah durable consumer goods.",
    "reviewNote": ""
  },
  {
    "code": "27530",
    "title": "INDUSTRI PERALATAN PEMANAS DAN MASAK BUKAN LISTRIK RUMAH TANGGA",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "Industrials",
    "reason": "Peralatan listrik rumah tangga adalah durable consumer goods.",
    "reviewNote": ""
  },
  {
    "code": "27900",
    "title": "INDUSTRI PERALATAN LISTRIK LAINNYA",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Peralatan listrik umumnya adalah produk industri/capital goods.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "28111",
    "title": "INDUSTRI MESIN UAP, TURBIN DAN KINCIR",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Mesin dan perlengkapan adalah capital goods/produk industri.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "28112",
    "title": "INDUSTRI MOTOR PEMBAKARAN DALAM",
    "sector": "Industrials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Mesin dan perlengkapan adalah capital goods/produk industri.",
    "reviewNote": ""
  },
  {
    "code": "28113",
    "title": "INDUSTRI KOMPONEN DAN SUKU CADANG MESIN DAN TURBIN",
    "sector": "Industrials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Mesin dan perlengkapan adalah capital goods/produk industri.",
    "reviewNote": ""
  },
  {
    "code": "28120",
    "title": "INDUSTRI PERALATAN TENAGA ZAT CAIR DAN GAS",
    "sector": "Industrials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Mesin dan perlengkapan adalah capital goods/produk industri.",
    "reviewNote": ""
  },
  {
    "code": "28130",
    "title": "INDUSTRI POMPA LAINNYA, KOMPRESOR, KRAN DAN KLEP/KATUP",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Mesin dan perlengkapan adalah capital goods/produk industri.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "28140",
    "title": "INDUSTRI BEARING, RODA GIGI DAN ELEMEN PENGGERAK MESIN",
    "sector": "Industrials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Mesin dan perlengkapan adalah capital goods/produk industri.",
    "reviewNote": ""
  },
  {
    "code": "28151",
    "title": "INDUSTRI OVEN, PERAPIAN DAN TUNGKU PEMBAKAR SEJENIS YANG TIDAK MENGGUNAKAN ARUS LISTRIK",
    "sector": "Industrials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Mesin dan perlengkapan adalah capital goods/produk industri.",
    "reviewNote": ""
  },
  {
    "code": "28152",
    "title": "INDUSTRI OVEN, PERAPIAN DAN TUNGKU PEMBAKAR SEJENIS YANG MENGGUNAKAN ARUS LISTRIK",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Mesin dan perlengkapan adalah capital goods/produk industri.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "28160",
    "title": "INDUSTRI ALAT PENGANGKAT DAN PEMINDAH",
    "sector": "Industrials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Mesin dan perlengkapan adalah capital goods/produk industri.",
    "reviewNote": ""
  },
  {
    "code": "28171",
    "title": "INDUSTRI MESIN KANTOR DAN AKUNTANSI MANUAL",
    "sector": "Industrials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Mesin dan perlengkapan adalah capital goods/produk industri.",
    "reviewNote": ""
  },
  {
    "code": "28172",
    "title": "INDUSTRI MESIN KANTOR DAN AKUNTANSI ELEKTRIK",
    "sector": "Industrials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Mesin dan perlengkapan adalah capital goods/produk industri.",
    "reviewNote": ""
  },
  {
    "code": "28173",
    "title": "INDUSTRI MESIN KANTOR DAN AKUNTANSI ELEKTRONIK",
    "sector": "Industrials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Mesin dan perlengkapan adalah capital goods/produk industri.",
    "reviewNote": ""
  },
  {
    "code": "28174",
    "title": "INDUSTRI MESIN FOTOCOPI",
    "sector": "Industrials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Mesin dan perlengkapan adalah capital goods/produk industri.",
    "reviewNote": ""
  },
  {
    "code": "28179",
    "title": "INDUSTRI MESIN DAN PERALATAN KANTOR LAINNYA",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Mesin dan perlengkapan adalah capital goods/produk industri.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "28180",
    "title": "INDUSTRI PERKAKAS TANGAN YANG DIGERAKKAN TENAGA",
    "sector": "Industrials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Mesin dan perlengkapan adalah capital goods/produk industri.",
    "reviewNote": ""
  },
  {
    "code": "28191",
    "title": "INDUSTRI MESIN UNTUK PEMBUNGKUS, PEMBOTOLAN DAN PENGALENGAN",
    "sector": "Industrials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Mesin dan perlengkapan adalah capital goods/produk industri.",
    "reviewNote": ""
  },
  {
    "code": "28192",
    "title": "INDUSTRI MESIN TIMBANGAN",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Mesin dan perlengkapan adalah capital goods/produk industri.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "28193",
    "title": "INDUSTRI MESIN PENDINGIN",
    "sector": "Industrials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Mesin dan perlengkapan adalah capital goods/produk industri.",
    "reviewNote": ""
  },
  {
    "code": "28199",
    "title": "INDUSTRI MESIN UNTUK KEPERLUAN UMUM LAINNYA YTDL",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Mesin dan perlengkapan adalah capital goods/produk industri.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "28210",
    "title": "INDUSTRI MESIN PERTANIAN DAN KEHUTANAN",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Mesin dan perlengkapan adalah capital goods/produk industri.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "28221",
    "title": "INDUSTRI MESIN DAN PERKAKAS MESIN UNTUK PENGERJAAN LOGAM",
    "sector": "Industrials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Mesin dan perlengkapan adalah capital goods/produk industri.",
    "reviewNote": ""
  },
  {
    "code": "28222",
    "title": "INDUSTRI MESIN DAN PERKAKAS MESIN UNTUK PENGERJAAN KAYU",
    "sector": "Industrials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Mesin dan perlengkapan adalah capital goods/produk industri.",
    "reviewNote": ""
  },
  {
    "code": "28223",
    "title": "INDUSTRI MESIN DAN PERKAKAS MESIN UNTUK PENGERJAAN BAHAN BUKAN LOGAM DAN KAYU",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Mesin dan perlengkapan adalah capital goods/produk industri.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "28224",
    "title": "INDUSTRI MESIN DAN PERKAKAS MESIN UNTUK PENGELASAN YANG MENGGUNAKAN ARUS LISTRIK",
    "sector": "Industrials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Mesin dan perlengkapan adalah capital goods/produk industri.",
    "reviewNote": ""
  },
  {
    "code": "28230",
    "title": "INDUSTRI MESIN METALURGI",
    "sector": "Industrials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Mesin dan perlengkapan adalah capital goods/produk industri.",
    "reviewNote": ""
  },
  {
    "code": "28240",
    "title": "INDUSTRI MESIN PENAMBANGAN, PENGGALIAN DAN KONSTRUKSI",
    "sector": "Industrials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Mesin dan perlengkapan adalah capital goods/produk industri.",
    "reviewNote": ""
  },
  {
    "code": "28250",
    "title": "INDUSTRI MESIN PENGOLAHAN MAKANAN, MINUMAN DAN TEMBAKAU",
    "sector": "Industrials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Mesin dan perlengkapan adalah capital goods/produk industri.",
    "reviewNote": ""
  },
  {
    "code": "28261",
    "title": "INDUSTRI KABINET MESIN JAHIT",
    "sector": "Industrials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Mesin dan perlengkapan adalah capital goods/produk industri.",
    "reviewNote": ""
  },
  {
    "code": "28262",
    "title": "INDUSTRI MESIN JAHIT SERTA MESIN CUCI DAN MESIN PENGERING UNTUK KEPERLUAN NIAGA",
    "sector": "Industrials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Mesin dan perlengkapan adalah capital goods/produk industri.",
    "reviewNote": ""
  },
  {
    "code": "28263",
    "title": "INDUSTRI MESIN TEKSTIL",
    "sector": "Industrials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Mesin dan perlengkapan adalah capital goods/produk industri.",
    "reviewNote": ""
  },
  {
    "code": "28264",
    "title": "INDUSTRI JARUM MESIN JAHIT, RAJUT, BORDIR DAN SEJENISNYA",
    "sector": "Industrials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Mesin dan perlengkapan adalah capital goods/produk industri.",
    "reviewNote": ""
  },
  {
    "code": "28265",
    "title": "INDUSTRI MESIN PENYIAPAN DAN PEMBUATAN PRODUK KULIT",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Mesin dan perlengkapan adalah capital goods/produk industri.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "28291",
    "title": "INDUSTRI MESIN PERCETAKAN",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Mesin dan perlengkapan adalah capital goods/produk industri.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "28292",
    "title": "INDUSTRI MESIN PABRIK KERTAS",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Mesin dan perlengkapan adalah capital goods/produk industri.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "28299",
    "title": "INDUSTRI MESIN KEPERLUAN KHUSUS LAINNYA",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Mesin dan perlengkapan adalah capital goods/produk industri.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "29101",
    "title": "INDUSTRI KENDARAAN BERMOTOR RODA EMPAT ATAU LEBIH",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Kendaraan bermotor dan komponennya termasuk otomotif Consumer Cyclicals.",
    "reviewNote": ""
  },
  {
    "code": "29102",
    "title": "INDUSTRI KENDARAAN MULTIGUNA PEDESAAN",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Kendaraan bermotor dan komponennya termasuk otomotif Consumer Cyclicals.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "29200",
    "title": "INDUSTRI KAROSERI KENDARAAN BERMOTOR RODA EMPAT ATAU LEBIH DAN INDUSTRI TRAILER DAN SEMI TRAILER",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Kendaraan bermotor dan komponennya termasuk otomotif Consumer Cyclicals.",
    "reviewNote": ""
  },
  {
    "code": "29300",
    "title": "INDUSTRI SUKU CADANG DAN AKSESORI KENDARAAN BERMOTOR RODA EMPAT ATAU LEBIH",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Kendaraan bermotor dan komponennya termasuk otomotif Consumer Cyclicals.",
    "reviewNote": ""
  },
  {
    "code": "30111",
    "title": "INDUSTRI KAPAL DAN PERAHU",
    "sector": "Industrials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Kapal, kereta, pesawat, kendaraan militer, dan alat angkutan berat adalah produk industri.",
    "reviewNote": ""
  },
  {
    "code": "30112",
    "title": "INDUSTRI BANGUNAN LEPAS PANTAI DAN BANGUNAN TERAPUNG",
    "sector": "Industrials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Kapal, kereta, pesawat, kendaraan militer, dan alat angkutan berat adalah produk industri.",
    "reviewNote": ""
  },
  {
    "code": "30113",
    "title": "INDUSTRI PERALATAN, PERLENGKAPAN DAN BAGIAN KAPAL",
    "sector": "Industrials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Kapal, kereta, pesawat, kendaraan militer, dan alat angkutan berat adalah produk industri.",
    "reviewNote": ""
  },
  {
    "code": "30120",
    "title": "INDUSTRI PEMBUATAN KAPAL DAN PERAHU UNTUK TUJUAN WISATA ATAU REKREASI DAN OLAHRAGA",
    "sector": "Industrials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Kapal, kereta, pesawat, kendaraan militer, dan alat angkutan berat adalah produk industri.",
    "reviewNote": ""
  },
  {
    "code": "30200",
    "title": "INDUSTRI LOKOMOTIF DAN GERBONG KERETA",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Kapal, kereta, pesawat, kendaraan militer, dan alat angkutan berat adalah produk industri.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "30300",
    "title": "INDUSTRI PESAWAT TERBANG DAN PERLENGKAPANNYA",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Kapal, kereta, pesawat, kendaraan militer, dan alat angkutan berat adalah produk industri.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "30400",
    "title": "INDUSTRI KENDARAAN PERANG",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Kapal, kereta, pesawat, kendaraan militer, dan alat angkutan berat adalah produk industri.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "30911",
    "title": "INDUSTRI SEPEDA MOTOR RODA DUA DAN TIGA",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "Industrials",
    "reason": "Alat angkutan konsumen seperti sepeda/motor masuk Consumer Cyclicals.",
    "reviewNote": ""
  },
  {
    "code": "30912",
    "title": "INDUSTRI KOMPONEN DAN PERLENGKAPAN SEPEDA MOTOR RODA DUA DAN TIGA",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "Industrials",
    "reason": "Alat angkutan konsumen seperti sepeda/motor masuk Consumer Cyclicals.",
    "reviewNote": ""
  },
  {
    "code": "30921",
    "title": "INDUSTRI SEPEDA DAN KURSI RODA TERMASUK BECAK",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "Industrials",
    "reason": "Alat angkutan konsumen seperti sepeda/motor masuk Consumer Cyclicals.",
    "reviewNote": ""
  },
  {
    "code": "30922",
    "title": "INDUSTRI PERLENGKAPAN SEPEDA DAN KURSI RODA TERMASUK BECAK",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "Industrials",
    "reason": "Alat angkutan konsumen seperti sepeda/motor masuk Consumer Cyclicals.",
    "reviewNote": ""
  },
  {
    "code": "30990",
    "title": "INDUSTRI ALAT ANGKUTAN LAINNYA YTDL",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Kapal, kereta, pesawat, kendaraan militer, dan alat angkutan berat adalah produk industri.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "31001",
    "title": "INDUSTRI FURNITUR DARI KAYU",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Furnitur adalah durable household goods/Consumer Cyclicals.",
    "reviewNote": ""
  },
  {
    "code": "31002",
    "title": "INDUSTRI FURNITUR DARI ROTAN DAN ATAU BAMBU",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Furnitur adalah durable household goods/Consumer Cyclicals.",
    "reviewNote": ""
  },
  {
    "code": "31003",
    "title": "INDUSTRI FURNITUR DARI PLASTIK",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Furnitur adalah durable household goods/Consumer Cyclicals.",
    "reviewNote": ""
  },
  {
    "code": "31004",
    "title": "INDUSTRI FURNITUR DARI LOGAM",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Furnitur adalah durable household goods/Consumer Cyclicals.",
    "reviewNote": ""
  },
  {
    "code": "31009",
    "title": "INDUSTRI FURNITUR LAINNYA",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Furnitur adalah durable household goods/Consumer Cyclicals.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "32111",
    "title": "INDUSTRI PERMATA",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "Industrials",
    "reason": "Industri pengolahan lain seperti perhiasan, musik, olahraga, mainan umumnya consumer discretionary.",
    "reviewNote": ""
  },
  {
    "code": "32112",
    "title": "INDUSTRI BARANG PERHIASAN DARI LOGAM MULIA UNTUK KEPERLUAN PRIBADI",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "Industrials",
    "reason": "Industri pengolahan lain seperti perhiasan, musik, olahraga, mainan umumnya consumer discretionary.",
    "reviewNote": ""
  },
  {
    "code": "32113",
    "title": "INDUSTRI BARANG PERHIASAN DARI LOGAM MULIA BUKAN UNTUK KEPERLUAN PRIBADI",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "Industrials",
    "reason": "Industri pengolahan lain seperti perhiasan, musik, olahraga, mainan umumnya consumer discretionary.",
    "reviewNote": ""
  },
  {
    "code": "32114",
    "title": "INDUSTRI BARANG DARI LOGAM MULIA UNTUK KEPERLUAN TEKNIK DAN ATAU LABORATORIUM",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "Industrials",
    "reason": "Industri pengolahan lain seperti perhiasan, musik, olahraga, mainan umumnya consumer discretionary.",
    "reviewNote": ""
  },
  {
    "code": "32115",
    "title": "INDUSTRI PERHIASAN MUTIARA",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "Industrials",
    "reason": "Industri pengolahan lain seperti perhiasan, musik, olahraga, mainan umumnya consumer discretionary.",
    "reviewNote": ""
  },
  {
    "code": "32119",
    "title": "INDUSTRI BARANG LAINNYA DARI LOGAM MULIA",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "Industrials",
    "reason": "Industri pengolahan lain seperti perhiasan, musik, olahraga, mainan umumnya consumer discretionary.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "32120",
    "title": "INDUSTRI PERHIASAN IMITASI DAN BARANG SEJENIS",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "Industrials",
    "reason": "Industri pengolahan lain seperti perhiasan, musik, olahraga, mainan umumnya consumer discretionary.",
    "reviewNote": ""
  },
  {
    "code": "32201",
    "title": "INDUSTRI ALAT MUSIK TRADISIONAL",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "Industrials",
    "reason": "Industri pengolahan lain seperti perhiasan, musik, olahraga, mainan umumnya consumer discretionary.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "32202",
    "title": "INDUSTRI ALAT MUSIK BUKAN TRADISIONAL",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "Industrials",
    "reason": "Industri pengolahan lain seperti perhiasan, musik, olahraga, mainan umumnya consumer discretionary.",
    "reviewNote": ""
  },
  {
    "code": "32300",
    "title": "INDUSTRI ALAT OLAHRAGA",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "Industrials",
    "reason": "Industri pengolahan lain seperti perhiasan, musik, olahraga, mainan umumnya consumer discretionary.",
    "reviewNote": ""
  },
  {
    "code": "32401",
    "title": "INDUSTRI ALAT PERMAINAN",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "Industrials",
    "reason": "Industri pengolahan lain seperti perhiasan, musik, olahraga, mainan umumnya consumer discretionary.",
    "reviewNote": ""
  },
  {
    "code": "32402",
    "title": "INDUSTRI MAINAN ANAK-ANAK",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "Industrials",
    "reason": "Industri pengolahan lain seperti perhiasan, musik, olahraga, mainan umumnya consumer discretionary.",
    "reviewNote": ""
  },
  {
    "code": "32501",
    "title": "INDUSTRI FURNITUR UNTUK OPERASI, PERAWATAN KEDOKTERAN DAN KEDOKTERAN GIGI",
    "sector": "Healthcare",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Alat kedokteran, dental, ortopedi, prostetik, dan kacamata masuk Healthcare.",
    "reviewNote": ""
  },
  {
    "code": "32502",
    "title": "INDUSTRI PERALATAN KEDOKTERAN DAN KEDOKTERAN GIGI, PERLENGKAPAN ORTHOPAEDIC DAN PROSTHETIC",
    "sector": "Healthcare",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Alat kedokteran, dental, ortopedi, prostetik, dan kacamata masuk Healthcare.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "32503",
    "title": "INDUSTRI KACA MATA",
    "sector": "Healthcare",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Alat kedokteran, dental, ortopedi, prostetik, dan kacamata masuk Healthcare.",
    "reviewNote": ""
  },
  {
    "code": "32509",
    "title": "INDUSTRI PERALATAN KEDOKTERAN DAN KEDOKTERAN GIGI SERTA PERLENGKAPAN LAINNYA",
    "sector": "Healthcare",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Alat kedokteran, dental, ortopedi, prostetik, dan kacamata masuk Healthcare.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "32901",
    "title": "INDUSTRI ALAT TULIS DAN GAMBAR TERMASUK PERLENGKAPANNYA",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "Consumer Cyclicals",
    "reason": "Barang rumah tangga tidak tahan lama/keperluan rutin dipetakan ke Consumer Non-Cyclicals.",
    "reviewNote": ""
  },
  {
    "code": "32902",
    "title": "INDUSTRI PITA MESIN TULIS/GAMBAR",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "Industrials",
    "reason": "Industri pengolahan lain seperti perhiasan, musik, olahraga, mainan umumnya consumer discretionary.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "32903",
    "title": "INDUSTRI KERAJINAN YTDL",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "Industrials",
    "reason": "Industri pengolahan lain seperti perhiasan, musik, olahraga, mainan umumnya consumer discretionary.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "32904",
    "title": "INDUSTRI PERALATAN UNTUK PELINDUNG KESELAMATAN",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "Industrials",
    "reason": "Industri pengolahan lain seperti perhiasan, musik, olahraga, mainan umumnya consumer discretionary.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "32905",
    "title": "INDUSTRI SERAT SABUT KELAPA",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "Industrials",
    "reason": "Industri pengolahan lain seperti perhiasan, musik, olahraga, mainan umumnya consumer discretionary.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "32906",
    "title": "INDUSTRI PRODUKSI RADIOISOTOP",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "Industrials",
    "reason": "Industri pengolahan lain seperti perhiasan, musik, olahraga, mainan umumnya consumer discretionary.",
    "reviewNote": ""
  },
  {
    "code": "32907",
    "title": "INDUSTRI FABRIKASI ELEMEN BAKAR URANIUM",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "Industrials",
    "reason": "Industri pengolahan lain seperti perhiasan, musik, olahraga, mainan umumnya consumer discretionary.",
    "reviewNote": ""
  },
  {
    "code": "32909",
    "title": "INDUSTRI PENGOLAHAN LAINNYA YTDL",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "Consumer Cyclicals",
    "reason": "Barang rumah tangga tidak tahan lama/keperluan rutin dipetakan ke Consumer Non-Cyclicals.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "33111",
    "title": "REPARASI PRODUK LOGAM SIAP PASANG UNTUK BANGUNAN, TANGKI, TANDON AIR DAN GENERATOR UAP",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Reparasi/pemasangan mesin dan peralatan adalah jasa pendukung industri.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "33112",
    "title": "REPARASI PRODUK SENJATA DAN AMUNISI",
    "sector": "Industrials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Reparasi/pemasangan mesin dan peralatan adalah jasa pendukung industri.",
    "reviewNote": ""
  },
  {
    "code": "33119",
    "title": "REPARASI PRODUK LOGAM PABRIKASI LAINNYA",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Reparasi/pemasangan mesin dan peralatan adalah jasa pendukung industri.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "33121",
    "title": "REPARASI MESIN UNTUK KEPERLUAN UMUM",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Reparasi/pemasangan mesin dan peralatan adalah jasa pendukung industri.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "33122",
    "title": "REPARASI MESIN UNTUK KEPERLUAN KHUSUS",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Reparasi/pemasangan mesin dan peralatan adalah jasa pendukung industri.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "33131",
    "title": "REPARASI ALAT UKUR, ALAT UJI DAN PERALATAN NAVIGASI DAN PENGONTROL",
    "sector": "Industrials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Reparasi/pemasangan mesin dan peralatan adalah jasa pendukung industri.",
    "reviewNote": ""
  },
  {
    "code": "33132",
    "title": "REPARASI PERALATAN IRADIASI, ELEKTROMEDIS DAN ELEKTROTERAPI",
    "sector": "Industrials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Reparasi/pemasangan mesin dan peralatan adalah jasa pendukung industri.",
    "reviewNote": ""
  },
  {
    "code": "33133",
    "title": "REPARASI PERALATAN FOTOGRAFI DAN OPTIK",
    "sector": "Industrials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Reparasi/pemasangan mesin dan peralatan adalah jasa pendukung industri.",
    "reviewNote": ""
  },
  {
    "code": "33141",
    "title": "REPARASI MOTOR LISTRIK, GENERATOR DAN TRANSFORMATOR",
    "sector": "Industrials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Reparasi/pemasangan mesin dan peralatan adalah jasa pendukung industri.",
    "reviewNote": ""
  },
  {
    "code": "33142",
    "title": "REPARASI BATERAI DAN AKUMULATOR LISTRIK",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Reparasi/pemasangan mesin dan peralatan adalah jasa pendukung industri.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "33149",
    "title": "REPARASI PERALATAN LISTRIK LAINNYA",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Reparasi/pemasangan mesin dan peralatan adalah jasa pendukung industri.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "33151",
    "title": "REPARASI KAPAL, PERAHU DAN BANGUNAN TERAPUNG",
    "sector": "Industrials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Reparasi/pemasangan mesin dan peralatan adalah jasa pendukung industri.",
    "reviewNote": ""
  },
  {
    "code": "33152",
    "title": "REPARASI LOKOMOTIF DAN GERBONG KERETA",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Reparasi/pemasangan mesin dan peralatan adalah jasa pendukung industri.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "33153",
    "title": "REPARASI PESAWAT TERBANG",
    "sector": "Industrials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Reparasi/pemasangan mesin dan peralatan adalah jasa pendukung industri.",
    "reviewNote": ""
  },
  {
    "code": "33159",
    "title": "REPARASI ALAT ANGKUTAN LAINNYA, BUKAN KENDARAAN BERMOTOR",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Reparasi/pemasangan mesin dan peralatan adalah jasa pendukung industri.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "33190",
    "title": "REPARASI PERALATAN LAINNYA",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Reparasi/pemasangan mesin dan peralatan adalah jasa pendukung industri.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "33200",
    "title": "INSTALASI/PEMASANGAN MESIN DAN PERALATAN INDUSTRI",
    "sector": "Industrials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Reparasi/pemasangan mesin dan peralatan adalah jasa pendukung industri.",
    "reviewNote": ""
  },
  {
    "code": "35111",
    "title": "PEMBANGKITAN TENAGA LISTRIK",
    "sector": "Infrastructures",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Pengadaan listrik, gas jaringan, uap, udara dingin adalah utilitas/infrastruktur.",
    "reviewNote": ""
  },
  {
    "code": "35112",
    "title": "TRANSMISI TENAGA LISTRIK",
    "sector": "Infrastructures",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Pengadaan listrik, gas jaringan, uap, udara dingin adalah utilitas/infrastruktur.",
    "reviewNote": ""
  },
  {
    "code": "35113",
    "title": "DISTRIBUSI TENAGA LISTRIK",
    "sector": "Infrastructures",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Pengadaan listrik, gas jaringan, uap, udara dingin adalah utilitas/infrastruktur.",
    "reviewNote": ""
  },
  {
    "code": "35114",
    "title": "PENJUALAN TENAGA LISTRIK",
    "sector": "Infrastructures",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Pengadaan listrik, gas jaringan, uap, udara dingin adalah utilitas/infrastruktur.",
    "reviewNote": ""
  },
  {
    "code": "35115",
    "title": "PEMBANGKIT, TRANSMISI, DISTRIBUSI DAN PENJUALAN TENAGA LISTRIK DALAM SATU KESATUAN USAHA",
    "sector": "Infrastructures",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Pengadaan listrik, gas jaringan, uap, udara dingin adalah utilitas/infrastruktur.",
    "reviewNote": ""
  },
  {
    "code": "35116",
    "title": "PEMBANGKIT, TRANSMISI, DAN PENJUALAN TENAGA LISTRIK DALAM SATU KESATUAN USAHA",
    "sector": "Infrastructures",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Pengadaan listrik, gas jaringan, uap, udara dingin adalah utilitas/infrastruktur.",
    "reviewNote": ""
  },
  {
    "code": "35117",
    "title": "PEMBANGKIT, DISTRIBUSI, DAN PENJUALAN TENAGA LISTRIK DALAM SATU KESATUAN USAHA",
    "sector": "Infrastructures",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Pengadaan listrik, gas jaringan, uap, udara dingin adalah utilitas/infrastruktur.",
    "reviewNote": ""
  },
  {
    "code": "35118",
    "title": "DISTRIBUSI, DAN PENJUALAN TENAGA LISTRIK DALAM SATU KESATUAN USAHA",
    "sector": "Infrastructures",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Pengadaan listrik, gas jaringan, uap, udara dingin adalah utilitas/infrastruktur.",
    "reviewNote": ""
  },
  {
    "code": "35121",
    "title": "PENGOPERASIAN INSTALASI PENYEDIAAN TENAGA LISTRIK",
    "sector": "Infrastructures",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Pengadaan listrik, gas jaringan, uap, udara dingin adalah utilitas/infrastruktur.",
    "reviewNote": ""
  },
  {
    "code": "35122",
    "title": "PENGOPERASIAN INSTALASI PEMANFAATAN TENAGA LISTRIK",
    "sector": "Infrastructures",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Pengadaan listrik, gas jaringan, uap, udara dingin adalah utilitas/infrastruktur.",
    "reviewNote": ""
  },
  {
    "code": "35129",
    "title": "AKTIVITAS PENUNJANG TENAGA LISTRIK LAINNYA",
    "sector": "Infrastructures",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Pengadaan listrik, gas jaringan, uap, udara dingin adalah utilitas/infrastruktur.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "35201",
    "title": "PENGADAAN GAS ALAM DAN BUATAN",
    "sector": "Infrastructures",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Pengadaan listrik, gas jaringan, uap, udara dingin adalah utilitas/infrastruktur.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "35202",
    "title": "DISTRIBUSI GAS ALAM DAN BUATAN",
    "sector": "Infrastructures",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Pengadaan listrik, gas jaringan, uap, udara dingin adalah utilitas/infrastruktur.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "35203",
    "title": "PENGADAAN GAS BIO",
    "sector": "Infrastructures",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Pengadaan listrik, gas jaringan, uap, udara dingin adalah utilitas/infrastruktur.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "35301",
    "title": "PENGADAAN UAP/AIR PANAS DAN UDARA DINGIN",
    "sector": "Infrastructures",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Pengadaan listrik, gas jaringan, uap, udara dingin adalah utilitas/infrastruktur.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "35302",
    "title": "PRODUKSI ES",
    "sector": "Infrastructures",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Pengadaan listrik, gas jaringan, uap, udara dingin adalah utilitas/infrastruktur.",
    "reviewNote": ""
  },
  {
    "code": "36001",
    "title": "PENAMPUNGAN, PENJERNIHAN DAN PENYALURAN AIR MINUM",
    "sector": "Infrastructures",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Pengadaan air dan pengelolaan air limbah adalah utilitas/infrastruktur.",
    "reviewNote": ""
  },
  {
    "code": "36002",
    "title": "PENAMPUNGAN DAN PENYALURAN AIR BAKU",
    "sector": "Infrastructures",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Pengadaan air dan pengelolaan air limbah adalah utilitas/infrastruktur.",
    "reviewNote": ""
  },
  {
    "code": "36003",
    "title": "AKTIVITAS PENUNJANG TREATMENT AIR",
    "sector": "Infrastructures",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Pengadaan air dan pengelolaan air limbah adalah utilitas/infrastruktur.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "37011",
    "title": "PENGUMPULAN AIR LIMBAH TIDAK BERBAHAYA",
    "sector": "Infrastructures",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Pengadaan air dan pengelolaan air limbah adalah utilitas/infrastruktur.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "37012",
    "title": "PENGUMPULAN AIR LIMBAH BERBAHAYA",
    "sector": "Infrastructures",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Pengadaan air dan pengelolaan air limbah adalah utilitas/infrastruktur.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "37021",
    "title": "TREATMENT DAN PEMBUANGAN AIR LIMBAH TIDAK BERBAHAYA",
    "sector": "Infrastructures",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Pengadaan air dan pengelolaan air limbah adalah utilitas/infrastruktur.",
    "reviewNote": ""
  },
  {
    "code": "37022",
    "title": "TREATMENT DAN PEMBUANGAN AIR LIMBAH BERBAHAYA",
    "sector": "Infrastructures",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Pengadaan air dan pengelolaan air limbah adalah utilitas/infrastruktur.",
    "reviewNote": ""
  },
  {
    "code": "38110",
    "title": "PENGUMPULAN LIMBAH DAN SAMPAH TIDAK BERBAHAYA",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "Infrastructures",
    "reason": "Pengelolaan sampah, daur ulang, dan remediasi dekat dengan environmental management/Industrials.",
    "reviewNote": ""
  },
  {
    "code": "38120",
    "title": "PENGUMPULAN LIMBAH BERBAHAYA",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "Infrastructures",
    "reason": "Pengelolaan sampah, daur ulang, dan remediasi dekat dengan environmental management/Industrials.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "38211",
    "title": "TREATMENT DAN PEMBUANGAN LIMBAH DAN SAMPAH TIDAK BERBAHAYA",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "Infrastructures",
    "reason": "Pengelolaan sampah, daur ulang, dan remediasi dekat dengan environmental management/Industrials.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "38212",
    "title": "PRODUKSI KOMPOS SAMPAH ORGANIK",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "Infrastructures",
    "reason": "Pengelolaan sampah, daur ulang, dan remediasi dekat dengan environmental management/Industrials.",
    "reviewNote": ""
  },
  {
    "code": "38220",
    "title": "TREATMENT DAN PEMBUANGAN LIMBAH BERBAHAYA",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "Infrastructures",
    "reason": "Pengelolaan sampah, daur ulang, dan remediasi dekat dengan environmental management/Industrials.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "38301",
    "title": "PEMULIHAN MATERIAL BARANG LOGAM",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "Infrastructures",
    "reason": "Pengelolaan sampah, daur ulang, dan remediasi dekat dengan environmental management/Industrials.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "38302",
    "title": "PEMULIHAN MATERIAL BARANG BUKAN LOGAM",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "Infrastructures",
    "reason": "Pengelolaan sampah, daur ulang, dan remediasi dekat dengan environmental management/Industrials.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "39000",
    "title": "AKTIVITAS REMEDIASI DAN PENGELOLAAN LIMBAH DAN SAMPAH LAINNYA",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "Infrastructures",
    "reason": "Pengelolaan sampah, daur ulang, dan remediasi dekat dengan environmental management/Industrials.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "41011",
    "title": "KONSTRUKSI GEDUNG HUNIAN",
    "sector": "Infrastructures",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Konstruksi gedung, sipil, dan khusus termasuk pembangunan/pengadaan infrastruktur.",
    "reviewNote": ""
  },
  {
    "code": "41012",
    "title": "KONSTRUKSI GEDUNG PERKANTORAN",
    "sector": "Infrastructures",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Konstruksi gedung, sipil, dan khusus termasuk pembangunan/pengadaan infrastruktur.",
    "reviewNote": ""
  },
  {
    "code": "41013",
    "title": "KONSTRUKSI GEDUNG INDUSTRI",
    "sector": "Infrastructures",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Konstruksi gedung, sipil, dan khusus termasuk pembangunan/pengadaan infrastruktur.",
    "reviewNote": ""
  },
  {
    "code": "41014",
    "title": "KONSTRUKSI GEDUNG PERBELANJAAN",
    "sector": "Infrastructures",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Konstruksi gedung, sipil, dan khusus termasuk pembangunan/pengadaan infrastruktur.",
    "reviewNote": ""
  },
  {
    "code": "41015",
    "title": "KONSTRUKSI GEDUNG KESEHATAN",
    "sector": "Infrastructures",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Konstruksi gedung, sipil, dan khusus termasuk pembangunan/pengadaan infrastruktur.",
    "reviewNote": ""
  },
  {
    "code": "41016",
    "title": "KONSTRUKSI GEDUNG PENDIDIKAN",
    "sector": "Infrastructures",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Konstruksi gedung, sipil, dan khusus termasuk pembangunan/pengadaan infrastruktur.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "41017",
    "title": "KONSTRUKSI GEDUNG PENGINAPAN",
    "sector": "Infrastructures",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Konstruksi gedung, sipil, dan khusus termasuk pembangunan/pengadaan infrastruktur.",
    "reviewNote": ""
  },
  {
    "code": "41018",
    "title": "KONSTRUKSI GEDUNG TEMPAT HIBURAN DAN OLAHRAGA",
    "sector": "Infrastructures",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Konstruksi gedung, sipil, dan khusus termasuk pembangunan/pengadaan infrastruktur.",
    "reviewNote": ""
  },
  {
    "code": "41019",
    "title": "KONSTRUKSI GEDUNG LAINNYA",
    "sector": "Infrastructures",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Konstruksi gedung, sipil, dan khusus termasuk pembangunan/pengadaan infrastruktur.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "41020",
    "title": "JASA PEKERJAAN KONSTRUKSI PRAPABRIKASI BANGUNAN GEDUNG",
    "sector": "Infrastructures",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Konstruksi gedung, sipil, dan khusus termasuk pembangunan/pengadaan infrastruktur.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "42101",
    "title": "KONSTRUKSI BANGUNAN SIPIL JALAN",
    "sector": "Infrastructures",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Konstruksi gedung, sipil, dan khusus termasuk pembangunan/pengadaan infrastruktur.",
    "reviewNote": ""
  },
  {
    "code": "42102",
    "title": "KONSTRUKSI BANGUNAN SIPIL JEMBATAN, JALAN LAYANG, FLY OVER, DAN UNDERPASS",
    "sector": "Infrastructures",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Konstruksi gedung, sipil, dan khusus termasuk pembangunan/pengadaan infrastruktur.",
    "reviewNote": ""
  },
  {
    "code": "42103",
    "title": "KONSTRUKSI JALAN REL",
    "sector": "Infrastructures",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Konstruksi gedung, sipil, dan khusus termasuk pembangunan/pengadaan infrastruktur.",
    "reviewNote": ""
  },
  {
    "code": "42104",
    "title": "KONSTRUKSI TEROWONGAN",
    "sector": "Infrastructures",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Konstruksi gedung, sipil, dan khusus termasuk pembangunan/pengadaan infrastruktur.",
    "reviewNote": ""
  },
  {
    "code": "42201",
    "title": "KONSTRUKSI JARINGAN IRIGASI DAN DRAINASE",
    "sector": "Infrastructures",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Konstruksi gedung, sipil, dan khusus termasuk pembangunan/pengadaan infrastruktur.",
    "reviewNote": ""
  },
  {
    "code": "42202",
    "title": "KONSTRUKSI BANGUNAN SIPIL PENGOLAHAN AIR BERSIH",
    "sector": "Infrastructures",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Konstruksi gedung, sipil, dan khusus termasuk pembangunan/pengadaan infrastruktur.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "42203",
    "title": "KONSTRUKSI BANGUNAN SIPIL PRASARANA DAN SARANA SISTEM PENGOLAHAN LIMBAH PADAT, CAIR, DAN GAS",
    "sector": "Infrastructures",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Konstruksi gedung, sipil, dan khusus termasuk pembangunan/pengadaan infrastruktur.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "42204",
    "title": "KONSTRUKSI BANGUNAN SIPIL ELEKTRIKAL",
    "sector": "Infrastructures",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Konstruksi gedung, sipil, dan khusus termasuk pembangunan/pengadaan infrastruktur.",
    "reviewNote": ""
  },
  {
    "code": "42205",
    "title": "KONSTRUKSI BANGUNAN SIPIL TELEKOMUNIKASI UNTUK PRASARANA TRANSPORTASI",
    "sector": "Infrastructures",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Konstruksi gedung, sipil, dan khusus termasuk pembangunan/pengadaan infrastruktur.",
    "reviewNote": ""
  },
  {
    "code": "42206",
    "title": "KONSTRUKSI SENTRAL TELEKOMUNIKASI",
    "sector": "Infrastructures",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Konstruksi gedung, sipil, dan khusus termasuk pembangunan/pengadaan infrastruktur.",
    "reviewNote": ""
  },
  {
    "code": "42207",
    "title": "PEMBUATAN/PENGEBORAN SUMUR AIR TANAH",
    "sector": "Infrastructures",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Konstruksi gedung, sipil, dan khusus termasuk pembangunan/pengadaan infrastruktur.",
    "reviewNote": ""
  },
  {
    "code": "42209",
    "title": "KONSTRUKSI JARINGAN IRIGASI, KOMUNIKASI, DAN LIMBAH LAINNYA",
    "sector": "Infrastructures",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Konstruksi gedung, sipil, dan khusus termasuk pembangunan/pengadaan infrastruktur.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "42911",
    "title": "KONSTRUKSI BANGUNAN PRASARANA SUMBER DAYA AIR",
    "sector": "Infrastructures",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Konstruksi gedung, sipil, dan khusus termasuk pembangunan/pengadaan infrastruktur.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "42912",
    "title": "KONSTRUKSI BANGUNAN PELABUHAN BUKAN PERIKANAN",
    "sector": "Infrastructures",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Konstruksi gedung, sipil, dan khusus termasuk pembangunan/pengadaan infrastruktur.",
    "reviewNote": ""
  },
  {
    "code": "42913",
    "title": "KONSTRUKSI BANGUNAN PELABUHAN PERIKANAN",
    "sector": "Infrastructures",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Konstruksi gedung, sipil, dan khusus termasuk pembangunan/pengadaan infrastruktur.",
    "reviewNote": ""
  },
  {
    "code": "42914",
    "title": "PENGERUKAN",
    "sector": "Infrastructures",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Konstruksi gedung, sipil, dan khusus termasuk pembangunan/pengadaan infrastruktur.",
    "reviewNote": ""
  },
  {
    "code": "42915",
    "title": "KONSTRUKSI BANGUNAN SIPIL MINYAK DAN GAS BUMI",
    "sector": "Infrastructures",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Konstruksi gedung, sipil, dan khusus termasuk pembangunan/pengadaan infrastruktur.",
    "reviewNote": ""
  },
  {
    "code": "42916",
    "title": "KONSTRUKSI BANGUNAN SIPIL PERTAMBANGAN",
    "sector": "Infrastructures",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Konstruksi gedung, sipil, dan khusus termasuk pembangunan/pengadaan infrastruktur.",
    "reviewNote": ""
  },
  {
    "code": "42917",
    "title": "KONSTRUKSI BANGUNAN SIPIL PANAS BUMI",
    "sector": "Infrastructures",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Konstruksi gedung, sipil, dan khusus termasuk pembangunan/pengadaan infrastruktur.",
    "reviewNote": ""
  },
  {
    "code": "42918",
    "title": "KONSTRUKSI BANGUNAN SIPIL FASILITAS OLAH RAGA",
    "sector": "Infrastructures",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Konstruksi gedung, sipil, dan khusus termasuk pembangunan/pengadaan infrastruktur.",
    "reviewNote": ""
  },
  {
    "code": "42919",
    "title": "KONSTRUKSI BANGUNAN SIPIL LAINNYA YTDL",
    "sector": "Infrastructures",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Konstruksi gedung, sipil, dan khusus termasuk pembangunan/pengadaan infrastruktur.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "42921",
    "title": "KONSTRUKSI RESERVOIR PEMBANGKIT LISTRIK TENAGA AIR",
    "sector": "Infrastructures",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Konstruksi gedung, sipil, dan khusus termasuk pembangunan/pengadaan infrastruktur.",
    "reviewNote": ""
  },
  {
    "code": "42922",
    "title": "JASA PEKERJAAN KONSTRUKSI PELINDUNG PANTAI",
    "sector": "Infrastructures",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Konstruksi gedung, sipil, dan khusus termasuk pembangunan/pengadaan infrastruktur.",
    "reviewNote": ""
  },
  {
    "code": "42923",
    "title": "KONSTRUKSI BANGUNAN SIPIL FASILITAS PENGOLAHAN PRODUK KIMIA, PETROKIMIA, FARMASI, DAN INDUSTRI LAINNYA",
    "sector": "Infrastructures",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Konstruksi gedung, sipil, dan khusus termasuk pembangunan/pengadaan infrastruktur.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "42924",
    "title": "KONSTRUKSI BANGUNAN SIPIL FASILITAS MILITER DAN PELUNCURAN SATELIT",
    "sector": "Infrastructures",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Konstruksi gedung, sipil, dan khusus termasuk pembangunan/pengadaan infrastruktur.",
    "reviewNote": ""
  },
  {
    "code": "42929",
    "title": "KONSTRUKSI KHUSUS BANGUNAN SIPIL LAINNYA YTDL",
    "sector": "Infrastructures",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Konstruksi gedung, sipil, dan khusus termasuk pembangunan/pengadaan infrastruktur.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "42930",
    "title": "JASA PEKERJAAN KONSTRUKSI PRAPABRIKASI BANGUNAN SIPIL",
    "sector": "Infrastructures",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Konstruksi gedung, sipil, dan khusus termasuk pembangunan/pengadaan infrastruktur.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "43110",
    "title": "PEMBONGKARAN",
    "sector": "Infrastructures",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Konstruksi gedung, sipil, dan khusus termasuk pembangunan/pengadaan infrastruktur.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "43120",
    "title": "PENYIAPAN LAHAN",
    "sector": "Infrastructures",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Konstruksi gedung, sipil, dan khusus termasuk pembangunan/pengadaan infrastruktur.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "43211",
    "title": "INSTALASI LISTRIK",
    "sector": "Infrastructures",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Konstruksi gedung, sipil, dan khusus termasuk pembangunan/pengadaan infrastruktur.",
    "reviewNote": ""
  },
  {
    "code": "43212",
    "title": "INSTALASI TELEKOMUNIKASI",
    "sector": "Infrastructures",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Konstruksi gedung, sipil, dan khusus termasuk pembangunan/pengadaan infrastruktur.",
    "reviewNote": ""
  },
  {
    "code": "43213",
    "title": "INSTALASI ELEKTRONIKA",
    "sector": "Infrastructures",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Konstruksi gedung, sipil, dan khusus termasuk pembangunan/pengadaan infrastruktur.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "43214",
    "title": "JASA INSTALASI KONSTRUKSI NAVIGASI LAUT, SUNGAI, DAN UDARA",
    "sector": "Infrastructures",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Konstruksi gedung, sipil, dan khusus termasuk pembangunan/pengadaan infrastruktur.",
    "reviewNote": ""
  },
  {
    "code": "43215",
    "title": "INSTALASI SINYAL DAN TELEKOMUNIKASI KERETA API",
    "sector": "Infrastructures",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Konstruksi gedung, sipil, dan khusus termasuk pembangunan/pengadaan infrastruktur.",
    "reviewNote": ""
  },
  {
    "code": "43216",
    "title": "INSTALASI SINYAL DAN RAMBU-RAMBU JALAN RAYA",
    "sector": "Infrastructures",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Konstruksi gedung, sipil, dan khusus termasuk pembangunan/pengadaan infrastruktur.",
    "reviewNote": ""
  },
  {
    "code": "43221",
    "title": "INSTALASI SALURAN AIR (PLAMBING)",
    "sector": "Infrastructures",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Konstruksi gedung, sipil, dan khusus termasuk pembangunan/pengadaan infrastruktur.",
    "reviewNote": ""
  },
  {
    "code": "43222",
    "title": "INSTALASI PEMANAS DAN GEOTERMAL",
    "sector": "Infrastructures",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Konstruksi gedung, sipil, dan khusus termasuk pembangunan/pengadaan infrastruktur.",
    "reviewNote": ""
  },
  {
    "code": "43223",
    "title": "INSTALASI MINYAK DAN GAS",
    "sector": "Infrastructures",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Konstruksi gedung, sipil, dan khusus termasuk pembangunan/pengadaan infrastruktur.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "43224",
    "title": "INSTALASI PENDINGIN DAN VENTILASI UDARA",
    "sector": "Infrastructures",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Konstruksi gedung, sipil, dan khusus termasuk pembangunan/pengadaan infrastruktur.",
    "reviewNote": ""
  },
  {
    "code": "43291",
    "title": "INSTALASI MEKANIKAL",
    "sector": "Infrastructures",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Konstruksi gedung, sipil, dan khusus termasuk pembangunan/pengadaan infrastruktur.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "43292",
    "title": "INSTALASI METEOROLOGI, KLIMATOLOGI DAN GEOFISIKA",
    "sector": "Infrastructures",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Konstruksi gedung, sipil, dan khusus termasuk pembangunan/pengadaan infrastruktur.",
    "reviewNote": ""
  },
  {
    "code": "43293",
    "title": "INSTALASI FASILITAS SUMBER RADIASI PENGION",
    "sector": "Infrastructures",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Konstruksi gedung, sipil, dan khusus termasuk pembangunan/pengadaan infrastruktur.",
    "reviewNote": ""
  },
  {
    "code": "43294",
    "title": "INSTALASI NUKLIR",
    "sector": "Infrastructures",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Konstruksi gedung, sipil, dan khusus termasuk pembangunan/pengadaan infrastruktur.",
    "reviewNote": ""
  },
  {
    "code": "43299",
    "title": "INSTALASI KONSTRUKSI LAINNYA YTDL",
    "sector": "Infrastructures",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Konstruksi gedung, sipil, dan khusus termasuk pembangunan/pengadaan infrastruktur.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "43301",
    "title": "PENGERJAAN PEMASANGAN KACA DAN ALUMUNIUM",
    "sector": "Infrastructures",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Konstruksi gedung, sipil, dan khusus termasuk pembangunan/pengadaan infrastruktur.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "43302",
    "title": "PENGERJAAN LANTAI, DINDING, PERALATAN SANITER DAN PLAFON",
    "sector": "Infrastructures",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Konstruksi gedung, sipil, dan khusus termasuk pembangunan/pengadaan infrastruktur.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "43303",
    "title": "PENGECATAN",
    "sector": "Infrastructures",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Konstruksi gedung, sipil, dan khusus termasuk pembangunan/pengadaan infrastruktur.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "43304",
    "title": "DEKORASI INTERIOR",
    "sector": "Infrastructures",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Konstruksi gedung, sipil, dan khusus termasuk pembangunan/pengadaan infrastruktur.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "43305",
    "title": "DEKORASI EKSTERIOR",
    "sector": "Infrastructures",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Konstruksi gedung, sipil, dan khusus termasuk pembangunan/pengadaan infrastruktur.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "43309",
    "title": "PENYELESAIAN KONSTRUKSI BANGUNAN LAINNYA",
    "sector": "Infrastructures",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Konstruksi gedung, sipil, dan khusus termasuk pembangunan/pengadaan infrastruktur.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "43901",
    "title": "PEMASANGAN PONDASI DAN TIANG PANCANG",
    "sector": "Infrastructures",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Konstruksi gedung, sipil, dan khusus termasuk pembangunan/pengadaan infrastruktur.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "43902",
    "title": "PEMASANGAN PERANCAH (STEIGER)",
    "sector": "Infrastructures",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Konstruksi gedung, sipil, dan khusus termasuk pembangunan/pengadaan infrastruktur.",
    "reviewNote": ""
  },
  {
    "code": "43903",
    "title": "PEMASANGAN RANGKA DAN ATAP/ROOF COVERING",
    "sector": "Infrastructures",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Konstruksi gedung, sipil, dan khusus termasuk pembangunan/pengadaan infrastruktur.",
    "reviewNote": ""
  },
  {
    "code": "43904",
    "title": "PEMASANGAN KERANGKA BAJA",
    "sector": "Infrastructures",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Konstruksi gedung, sipil, dan khusus termasuk pembangunan/pengadaan infrastruktur.",
    "reviewNote": ""
  },
  {
    "code": "43905",
    "title": "PENYEWAAN ALAT KONSTRUKSI DENGAN OPERATOR",
    "sector": "Infrastructures",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Konstruksi gedung, sipil, dan khusus termasuk pembangunan/pengadaan infrastruktur.",
    "reviewNote": ""
  },
  {
    "code": "43909",
    "title": "KONSTRUKSI KHUSUS LAINNYA YTDL",
    "sector": "Infrastructures",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Konstruksi gedung, sipil, dan khusus termasuk pembangunan/pengadaan infrastruktur.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "45101",
    "title": "PERDAGANGAN BESAR MOBIL BARU",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Perdagangan/reparasi mobil dan sepeda motor masuk rantai otomotif Consumer Cyclicals.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "45102",
    "title": "PERDAGANGAN BESAR MOBIL BEKAS",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Perdagangan/reparasi mobil dan sepeda motor masuk rantai otomotif Consumer Cyclicals.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "45103",
    "title": "PERDAGANGAN ECERAN MOBIL BARU",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Perdagangan/reparasi mobil dan sepeda motor masuk rantai otomotif Consumer Cyclicals.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "45104",
    "title": "PERDAGANGAN ECERAN MOBIL BEKAS",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Perdagangan/reparasi mobil dan sepeda motor masuk rantai otomotif Consumer Cyclicals.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "45201",
    "title": "REPARASI MOBIL",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Perdagangan/reparasi mobil dan sepeda motor masuk rantai otomotif Consumer Cyclicals.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "45202",
    "title": "PENCUCIAN DAN SALON MOBIL",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Perdagangan/reparasi mobil dan sepeda motor masuk rantai otomotif Consumer Cyclicals.",
    "reviewNote": ""
  },
  {
    "code": "45301",
    "title": "PERDAGANGAN BESAR SUKU CADANG DAN AKSESORI MOBIL",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Perdagangan/reparasi mobil dan sepeda motor masuk rantai otomotif Consumer Cyclicals.",
    "reviewNote": ""
  },
  {
    "code": "45302",
    "title": "PERDAGANGAN ECERAN SUKU CADANG DAN AKSESORI MOBIL",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Perdagangan/reparasi mobil dan sepeda motor masuk rantai otomotif Consumer Cyclicals.",
    "reviewNote": ""
  },
  {
    "code": "45401",
    "title": "PERDAGANGAN BESAR SEPEDA MOTOR BARU",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Perdagangan/reparasi mobil dan sepeda motor masuk rantai otomotif Consumer Cyclicals.",
    "reviewNote": ""
  },
  {
    "code": "45402",
    "title": "PERDAGANGAN BESAR SEPEDA MOTOR BEKAS",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Perdagangan/reparasi mobil dan sepeda motor masuk rantai otomotif Consumer Cyclicals.",
    "reviewNote": ""
  },
  {
    "code": "45403",
    "title": "PERDAGANGAN ECERAN SEPEDA MOTOR BARU",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Perdagangan/reparasi mobil dan sepeda motor masuk rantai otomotif Consumer Cyclicals.",
    "reviewNote": ""
  },
  {
    "code": "45404",
    "title": "PERDAGANGAN ECERAN SEPEDA MOTOR BEKAS",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Perdagangan/reparasi mobil dan sepeda motor masuk rantai otomotif Consumer Cyclicals.",
    "reviewNote": ""
  },
  {
    "code": "45405",
    "title": "PERDAGANGAN BESAR SUKU CADANG SEPEDA MOTOR DAN AKSESORINYA",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Perdagangan/reparasi mobil dan sepeda motor masuk rantai otomotif Consumer Cyclicals.",
    "reviewNote": ""
  },
  {
    "code": "45406",
    "title": "PERDAGANGAN ECERAN SUKU CADANG SEPEDA MOTOR DAN AKSESORINYA",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Perdagangan/reparasi mobil dan sepeda motor masuk rantai otomotif Consumer Cyclicals.",
    "reviewNote": ""
  },
  {
    "code": "45407",
    "title": "REPARASI DAN PERAWATAN SEPEDA MOTOR",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Perdagangan/reparasi mobil dan sepeda motor masuk rantai otomotif Consumer Cyclicals.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "46100",
    "title": "PERDAGANGAN BESAR ATAS DASAR BALAS JASA (FEE) ATAU KONTRAK",
    "sector": "Industrials",
    "confidence": "Low",
    "alternativeSector": "Consumer Non-Cyclicals; Basic Materials; Energy",
    "reason": "Perdagangan atas dasar balas jasa/kontrak adalah jasa perantara perdagangan B2B yang barangnya tidak spesifik.",
    "reviewNote": "Jika diketahui komoditas dominan, sektor sebaiknya mengikuti barang/jasa akhir yang diperantarai."
  },
  {
    "code": "46201",
    "title": "PERDAGANGAN BESAR PADI DAN PALAWIJA",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Produk yang diperdagangkan adalah pangan, barang pokok, personal care, atau non-durable.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "46202",
    "title": "PERDAGANGAN BESAR BUAH YANG MENGANDUNG MINYAK",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Produk yang diperdagangkan adalah pangan, barang pokok, personal care, atau non-durable.",
    "reviewNote": ""
  },
  {
    "code": "46203",
    "title": "PERDAGANGAN BESAR BUNGA DAN TANAMAN HIAS",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Produk yang diperdagangkan adalah pangan, barang pokok, personal care, atau non-durable.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "46204",
    "title": "PERDAGANGAN BESAR TEMBAKAU RAJANGAN",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Produk yang diperdagangkan adalah pangan, barang pokok, personal care, atau non-durable.",
    "reviewNote": ""
  },
  {
    "code": "46205",
    "title": "PERDAGANGAN BESAR BINATANG HIDUP",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Produk yang diperdagangkan adalah pangan, barang pokok, personal care, atau non-durable.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "46206",
    "title": "PERDAGANGAN BESAR HASIL PERIKANAN",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Produk yang diperdagangkan adalah pangan, barang pokok, personal care, atau non-durable.",
    "reviewNote": ""
  },
  {
    "code": "46207",
    "title": "PERDAGANGAN BESAR HASIL KEHUTANAN DAN PERBURUAN",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Produk yang diperdagangkan berupa material/bahan baku industri.",
    "reviewNote": ""
  },
  {
    "code": "46208",
    "title": "PERDAGANGAN BESAR KULIT DAN KULIT JANGAT",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "Consumer Cyclicals",
    "reason": "Perdagangan besar non-spesifik dipetakan ke jasa distribusi B2B/Industrials.",
    "reviewNote": ""
  },
  {
    "code": "46209",
    "title": "PERDAGANGAN BESAR HASIL PERTANIAN DAN HEWAN HIDUP LAINNYA",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Produk yang diperdagangkan adalah pangan, barang pokok, personal care, atau non-durable.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "46311",
    "title": "PERDAGANGAN BESAR BERAS",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Produk yang diperdagangkan adalah pangan, barang pokok, personal care, atau non-durable.",
    "reviewNote": ""
  },
  {
    "code": "46312",
    "title": "PERDAGANGAN BESAR BUAH-BUAHAN",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Produk yang diperdagangkan adalah pangan, barang pokok, personal care, atau non-durable.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "46313",
    "title": "PERDAGANGAN BESAR SAYURAN",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Produk yang diperdagangkan adalah pangan, barang pokok, personal care, atau non-durable.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "46314",
    "title": "PERDAGANGAN BESAR KOPI, TEH DAN KAKAO",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Produk yang diperdagangkan adalah pangan, barang pokok, personal care, atau non-durable.",
    "reviewNote": ""
  },
  {
    "code": "46315",
    "title": "PERDAGANGAN BESAR MINYAK DAN LEMAK NABATI",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "Consumer Cyclicals",
    "reason": "Perdagangan besar non-spesifik dipetakan ke jasa distribusi B2B/Industrials.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "46319",
    "title": "PERDAGANGAN BESAR BAHAN MAKANAN DAN MINUMAN HASIL PERTANIAN LAINNYA",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Produk yang diperdagangkan adalah pangan, barang pokok, personal care, atau non-durable.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "46321",
    "title": "PERDAGANGAN BESAR DAGING SAPI DAN DAGING SAPI OLAHAN",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Produk yang diperdagangkan adalah pangan, barang pokok, personal care, atau non-durable.",
    "reviewNote": ""
  },
  {
    "code": "46322",
    "title": "PERDAGANGAN BESAR DAGING AYAM DAN DAGING AYAM OLAHAN",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Produk yang diperdagangkan adalah pangan, barang pokok, personal care, atau non-durable.",
    "reviewNote": ""
  },
  {
    "code": "46323",
    "title": "PERDAGANGAN BESAR DAGING DAN DAGING OLAHAN LAINNYA",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Produk yang diperdagangkan adalah pangan, barang pokok, personal care, atau non-durable.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "46324",
    "title": "PERDAGANGAN BESAR HASIL OLAHAN PERIKANAN",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Produk yang diperdagangkan adalah pangan, barang pokok, personal care, atau non-durable.",
    "reviewNote": ""
  },
  {
    "code": "46325",
    "title": "PERDAGANGAN BESAR TELUR DAN HASIL OLAHAN TELUR",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Produk yang diperdagangkan adalah pangan, barang pokok, personal care, atau non-durable.",
    "reviewNote": ""
  },
  {
    "code": "46326",
    "title": "PERDAGANGAN BESAR SUSU DAN PRODUK SUSU",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Produk yang diperdagangkan adalah pangan, barang pokok, personal care, atau non-durable.",
    "reviewNote": ""
  },
  {
    "code": "46327",
    "title": "PERDAGANGAN BESAR MINYAK DAN LEMAK HEWANI",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "Consumer Cyclicals",
    "reason": "Perdagangan besar non-spesifik dipetakan ke jasa distribusi B2B/Industrials.",
    "reviewNote": ""
  },
  {
    "code": "46329",
    "title": "PERDAGANGAN BESAR BAHAN MAKANAN DAN MINUMAN HASIL PETERNAKAN DAN PERIKANAN LAINNYA",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Produk yang diperdagangkan adalah pangan, barang pokok, personal care, atau non-durable.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "46331",
    "title": "PERDAGANGAN BESAR GULA, COKLAT DAN KEMBANG GULA",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Produk yang diperdagangkan adalah pangan, barang pokok, personal care, atau non-durable.",
    "reviewNote": ""
  },
  {
    "code": "46332",
    "title": "PERDAGANGAN BESAR PRODUK ROTI",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "Consumer Cyclicals",
    "reason": "Perdagangan besar non-spesifik dipetakan ke jasa distribusi B2B/Industrials.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "46333",
    "title": "PERDAGANGAN BESAR MINUMAN BERALKOHOL",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Produk yang diperdagangkan adalah pangan, barang pokok, personal care, atau non-durable.",
    "reviewNote": ""
  },
  {
    "code": "46334",
    "title": "PERDAGANGAN BESAR MINUMAN NON ALKOHOL BUKAN SUSU",
    "sector": "Basic Materials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Produk yang diperdagangkan berupa material/bahan baku industri.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "46335",
    "title": "PERDAGANGAN BESAR ROKOK DAN TEMBAKAU",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Produk yang diperdagangkan adalah pangan, barang pokok, personal care, atau non-durable.",
    "reviewNote": ""
  },
  {
    "code": "46339",
    "title": "PERDAGANGAN BESAR MAKANAN DAN MINUMAN LAINNYA",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Produk yang diperdagangkan adalah pangan, barang pokok, personal care, atau non-durable.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "46411",
    "title": "PERDAGANGAN BESAR TEKSTIL",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Produk/jasa yang diperdagangkan adalah barang/jasa konsumen sekunder atau siklis.",
    "reviewNote": ""
  },
  {
    "code": "46412",
    "title": "PERDAGANGAN BESAR PAKAIAN",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Produk/jasa yang diperdagangkan adalah barang/jasa konsumen sekunder atau siklis.",
    "reviewNote": ""
  },
  {
    "code": "46413",
    "title": "PERDAGANGAN BESAR ALAS KAKI",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Produk/jasa yang diperdagangkan adalah barang/jasa konsumen sekunder atau siklis.",
    "reviewNote": ""
  },
  {
    "code": "46414",
    "title": "PERDAGANGAN BESAR BARANG LAINNYA DARI TEKSTIL",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Produk/jasa yang diperdagangkan adalah barang/jasa konsumen sekunder atau siklis.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "46419",
    "title": "PERDAGANGAN BESAR TEKSTIL, PAKAIAN DAN ALAS KAKI LAINNYA",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Produk/jasa yang diperdagangkan adalah barang/jasa konsumen sekunder atau siklis.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "46421",
    "title": "PERDAGANGAN BESAR ALAT TULIS DAN GAMBAR",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "Consumer Cyclicals",
    "reason": "Perdagangan besar non-spesifik dipetakan ke jasa distribusi B2B/Industrials.",
    "reviewNote": ""
  },
  {
    "code": "46422",
    "title": "PERDAGANGAN BESAR BARANG PERCETAKAN DAN PENERBITAN DALAM BERBAGAI BENTUK",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "Consumer Cyclicals",
    "reason": "Perdagangan besar non-spesifik dipetakan ke jasa distribusi B2B/Industrials.",
    "reviewNote": ""
  },
  {
    "code": "46430",
    "title": "PERDAGANGAN BESAR ALAT FOTOGRAFI DAN BARANG OPTIK",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Produk yang diperdagangkan berupa material/bahan baku industri.",
    "reviewNote": ""
  },
  {
    "code": "46441",
    "title": "PERDAGANGAN BESAR OBAT FARMASI UNTUK MANUSIA",
    "sector": "Healthcare",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Perdagangan obat, farmasi, atau alat kesehatan mengikuti sektor Healthcare.",
    "reviewNote": ""
  },
  {
    "code": "46442",
    "title": "PERDAGANGAN BESAR OBAT TRADISIONAL UNTUK MANUSIA",
    "sector": "Healthcare",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Perdagangan obat, farmasi, atau alat kesehatan mengikuti sektor Healthcare.",
    "reviewNote": ""
  },
  {
    "code": "46443",
    "title": "PERDAGANGAN BESAR KOSMETIK UNTUK MANUSIA",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Produk yang diperdagangkan adalah pangan, barang pokok, personal care, atau non-durable.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "46444",
    "title": "PERDAGANGAN BESAR OBAT FARMASI UNTUK HEWAN",
    "sector": "Healthcare",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Perdagangan obat, farmasi, atau alat kesehatan mengikuti sektor Healthcare.",
    "reviewNote": ""
  },
  {
    "code": "46445",
    "title": "PERDAGANGAN BESAR OBAT TRADISIONAL UNTUK HEWAN",
    "sector": "Healthcare",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Perdagangan obat, farmasi, atau alat kesehatan mengikuti sektor Healthcare.",
    "reviewNote": ""
  },
  {
    "code": "46446",
    "title": "PERDAGANGAN BESAR KOSMETIK UNTUK HEWAN",
    "sector": "Basic Materials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Produk yang diperdagangkan berupa material/bahan baku industri.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "46447",
    "title": "PERDAGANGAN BESAR BAHAN FARMASI UNTUK MANUSIA DAN HEWAN",
    "sector": "Healthcare",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Perdagangan obat, farmasi, atau alat kesehatan mengikuti sektor Healthcare.",
    "reviewNote": ""
  },
  {
    "code": "46448",
    "title": "PERDAGANGAN BESAR BAHAN BAKU OBAT TRADISIONAL UNTUK MANUSIA DAN HEWAN",
    "sector": "Healthcare",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Perdagangan obat, farmasi, atau alat kesehatan mengikuti sektor Healthcare.",
    "reviewNote": ""
  },
  {
    "code": "46491",
    "title": "PERDAGANGAN BESAR PERALATAN DAN PERLENGKAPAN RUMAH TANGGA",
    "sector": "Technology",
    "confidence": "Medium",
    "alternativeSector": "Consumer Cyclicals",
    "reason": "Perdagangan komputer, perangkat lunak, elektronik, atau perangkat jaringan mengikuti Technology.",
    "reviewNote": ""
  },
  {
    "code": "46492",
    "title": "PERDAGANGAN BESAR ALAT OLAHRAGA",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Produk/jasa yang diperdagangkan adalah barang/jasa konsumen sekunder atau siklis.",
    "reviewNote": ""
  },
  {
    "code": "46493",
    "title": "PERDAGANGAN BESAR ALAT MUSIK",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Produk yang diperdagangkan berupa material/bahan baku industri.",
    "reviewNote": ""
  },
  {
    "code": "46494",
    "title": "PERDAGANGAN BESAR PERHIASAN DAN JAM",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Produk/jasa yang diperdagangkan adalah barang/jasa konsumen sekunder atau siklis.",
    "reviewNote": ""
  },
  {
    "code": "46495",
    "title": "PERDAGANGAN BESAR ALAT PERMAINAN DAN MAINAN ANAK-ANAK",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Produk/jasa yang diperdagangkan adalah barang/jasa konsumen sekunder atau siklis.",
    "reviewNote": ""
  },
  {
    "code": "46499",
    "title": "PERDAGANGAN BESAR BERBAGAI BARANG DAN PERLENGKAPAN RUMAH TANGGA LAINNYA YTDL",
    "sector": "Basic Materials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Produk yang diperdagangkan berupa material/bahan baku industri.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "46511",
    "title": "PERDAGANGAN BESAR KOMPUTER DAN PERLENGKAPAN KOMPUTER",
    "sector": "Technology",
    "confidence": "Medium",
    "alternativeSector": "Consumer Cyclicals",
    "reason": "Perdagangan komputer, perangkat lunak, elektronik, atau perangkat jaringan mengikuti Technology.",
    "reviewNote": ""
  },
  {
    "code": "46512",
    "title": "PERDAGANGAN BESAR PIRANTI LUNAK",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "Consumer Cyclicals",
    "reason": "Perdagangan besar non-spesifik dipetakan ke jasa distribusi B2B/Industrials.",
    "reviewNote": ""
  },
  {
    "code": "46521",
    "title": "PERDAGANGAN BESAR SUKU CADANG ELEKTRONIK",
    "sector": "Technology",
    "confidence": "Medium",
    "alternativeSector": "Consumer Cyclicals",
    "reason": "Perdagangan komputer, perangkat lunak, elektronik, atau perangkat jaringan mengikuti Technology.",
    "reviewNote": ""
  },
  {
    "code": "46522",
    "title": "PERDAGANGAN BESAR DISKET, FLASH DRIVE, PITA AUDIO DAN VIDEO, CD DAN DVD KOSONG",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "Consumer Cyclicals",
    "reason": "Perdagangan besar non-spesifik dipetakan ke jasa distribusi B2B/Industrials.",
    "reviewNote": ""
  },
  {
    "code": "46523",
    "title": "PERDAGANGAN BESAR PERALATAN TELEKOMUNIKASI",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Produk/jasa yang diperdagangkan adalah barang/jasa konsumen sekunder atau siklis.",
    "reviewNote": ""
  },
  {
    "code": "46530",
    "title": "PERDAGANGAN BESAR MESIN, PERALATAN DAN PERLENGKAPAN PERTANIAN",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Produk yang diperdagangkan berupa material/bahan baku industri.",
    "reviewNote": ""
  },
  {
    "code": "46591",
    "title": "PERDAGANGAN BESAR MESIN KANTOR DAN INDUSTRI PENGOLAHAN, SUKU CADANG DAN PERLENGKAPANNYA",
    "sector": "Technology",
    "confidence": "Medium",
    "alternativeSector": "Consumer Cyclicals",
    "reason": "Perdagangan komputer, perangkat lunak, elektronik, atau perangkat jaringan mengikuti Technology.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "46592",
    "title": "PERDAGANGAN BESAR ALAT TRANSPORTASI LAUT, SUKU CADANG DAN PERLENGKAPANNYA",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Produk/jasa yang diperdagangkan adalah barang/jasa konsumen sekunder atau siklis.",
    "reviewNote": ""
  },
  {
    "code": "46593",
    "title": "PERDAGANGAN BESAR ALAT TRANSPORTASI DARAT (BUKAN MOBIL, SEPEDA MOTOR, DAN SEJENISNYA), SUKU CADANG DAN PERLENGKAPANNYA",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Produk/jasa yang diperdagangkan adalah barang/jasa konsumen sekunder atau siklis.",
    "reviewNote": ""
  },
  {
    "code": "46594",
    "title": "PERDAGANGAN BESAR ALAT TRANSPORTASI UDARA, SUKU CADANG DAN PERLENGKAPANNYA",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Produk/jasa yang diperdagangkan adalah barang/jasa konsumen sekunder atau siklis.",
    "reviewNote": ""
  },
  {
    "code": "46599",
    "title": "PERDAGANGAN BESAR MESIN, PERALATAN DAN PERLENGKAPAN LAINNYA",
    "sector": "Technology",
    "confidence": "Medium",
    "alternativeSector": "Consumer Cyclicals",
    "reason": "Perdagangan komputer, perangkat lunak, elektronik, atau perangkat jaringan mengikuti Technology.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "46610",
    "title": "PERDAGANGAN BESAR BAHAN BAKAR PADAT, CAIR DAN GAS DAN PRODUK YBDI",
    "sector": "Energy",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Perdagangan bahan bakar, minyak/gas, atau batu bara mengikuti sektor Energy.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "46620",
    "title": "PERDAGANGAN BESAR LOGAM DAN BIJIH LOGAM",
    "sector": "Basic Materials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Produk yang diperdagangkan berupa material/bahan baku industri.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "46631",
    "title": "PERDAGANGAN BESAR BARANG LOGAM UNTUK BAHAN KONSTRUKSI",
    "sector": "Basic Materials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Produk yang diperdagangkan berupa material/bahan baku industri.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "46632",
    "title": "PERDAGANGAN BESAR KACA",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Produk yang diperdagangkan berupa material/bahan baku industri.",
    "reviewNote": ""
  },
  {
    "code": "46633",
    "title": "PERDAGANGAN BESAR GENTENG, BATU BATA, UBIN DAN SEJENISNYA DARI TANAH LIAT, KAPUR, SEMEN ATAU KACA",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Produk yang diperdagangkan berupa material/bahan baku industri.",
    "reviewNote": ""
  },
  {
    "code": "46634",
    "title": "PERDAGANGAN BESAR SEMEN, KAPUR, PASIR DAN BATU",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Produk yang diperdagangkan berupa material/bahan baku industri.",
    "reviewNote": ""
  },
  {
    "code": "46635",
    "title": "PERDAGANGAN BESAR BAHAN KONSTRUKSI DARI PORSELEN",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "Consumer Cyclicals",
    "reason": "Perdagangan besar non-spesifik dipetakan ke jasa distribusi B2B/Industrials.",
    "reviewNote": ""
  },
  {
    "code": "46636",
    "title": "PERDAGANGAN BESAR BAHAN KONSTRUKSI DARI KAYU",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Produk yang diperdagangkan berupa material/bahan baku industri.",
    "reviewNote": ""
  },
  {
    "code": "46637",
    "title": "PERDAGANGAN BESAR CAT",
    "sector": "Basic Materials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Produk yang diperdagangkan berupa material/bahan baku industri.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "46638",
    "title": "PERDAGANGAN BESAR BERBAGAI MACAM MATERIAL BANGUNAN",
    "sector": "Basic Materials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Produk yang diperdagangkan berupa material/bahan baku industri.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "46639",
    "title": "PERDAGANGAN BESAR BAHAN KONSTRUKSI LAINNYA",
    "sector": "Basic Materials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Produk yang diperdagangkan berupa material/bahan baku industri.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "46641",
    "title": "PERDAGANGAN BESAR MINERAL BUKAN LOGAM",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Produk yang diperdagangkan berupa material/bahan baku industri.",
    "reviewNote": ""
  },
  {
    "code": "46642",
    "title": "PERDAGANGAN BESAR MINERAL RADIOAKTIF",
    "sector": "Basic Materials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Produk yang diperdagangkan berupa material/bahan baku industri.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "46643",
    "title": "PERDAGANGAN BESAR ZAT RADIOAKTIF DAN PEMBANGKIT RADIASI PENGION",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Produk/jasa yang diperdagangkan adalah barang/jasa konsumen sekunder atau siklis.",
    "reviewNote": ""
  },
  {
    "code": "46651",
    "title": "PERDAGANGAN BESAR BAHAN DAN BARANG KIMIA",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Produk yang diperdagangkan berupa material/bahan baku industri.",
    "reviewNote": ""
  },
  {
    "code": "46652",
    "title": "PERDAGANGAN BESAR PUPUK DAN PRODUK AGROKIMIA",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Produk yang diperdagangkan berupa material/bahan baku industri.",
    "reviewNote": ""
  },
  {
    "code": "46653",
    "title": "PERDAGANGAN BESAR BAHAN BERBAHAYA (B2)",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "Consumer Cyclicals",
    "reason": "Perdagangan besar non-spesifik dipetakan ke jasa distribusi B2B/Industrials.",
    "reviewNote": ""
  },
  {
    "code": "46654",
    "title": "PERDAGANGAN BESAR BAHAN BERBAHAYA DAN BERACUN (B3)",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "Consumer Cyclicals",
    "reason": "Perdagangan besar non-spesifik dipetakan ke jasa distribusi B2B/Industrials.",
    "reviewNote": ""
  },
  {
    "code": "46691",
    "title": "PERDAGANGAN BESAR ALAT LABORATORIUM, ALAT FARMASI DAN ALAT KEDOKTERAN UNTUK MANUSIA",
    "sector": "Healthcare",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Perdagangan obat, farmasi, atau alat kesehatan mengikuti sektor Healthcare.",
    "reviewNote": ""
  },
  {
    "code": "46692",
    "title": "PERDAGANGAN BESAR ALAT LABORATORIUM, ALAT FARMASI DAN ALAT KEDOKTERAN UNTUK HEWAN",
    "sector": "Healthcare",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Perdagangan obat, farmasi, atau alat kesehatan mengikuti sektor Healthcare.",
    "reviewNote": ""
  },
  {
    "code": "46693",
    "title": "PERDAGANGAN BESAR KARET DAN PLASTIK DALAM BENTUK DASAR",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Produk yang diperdagangkan berupa material/bahan baku industri.",
    "reviewNote": ""
  },
  {
    "code": "46694",
    "title": "PERDAGANGAN BESAR KERTAS DAN KARTON",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Produk yang diperdagangkan berupa material/bahan baku industri.",
    "reviewNote": ""
  },
  {
    "code": "46695",
    "title": "PERDAGANGAN BESAR BARANG DARI KERTAS DAN KARTON",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Produk yang diperdagangkan berupa material/bahan baku industri.",
    "reviewNote": ""
  },
  {
    "code": "46696",
    "title": "PERDAGANGAN BESAR BARANG BEKAS DAN SISA-SISA TAK TERPAKAI (SCRAP)",
    "sector": "Basic Materials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Produk yang diperdagangkan berupa material/bahan baku industri.",
    "reviewNote": ""
  },
  {
    "code": "46699",
    "title": "PERDAGANGAN BESAR PRODUK LAINNYA YTDL",
    "sector": "Basic Materials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Produk yang diperdagangkan berupa material/bahan baku industri.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "46900",
    "title": "PERDAGANGAN BESAR BERBAGAI MACAM BARANG",
    "sector": "Industrials",
    "confidence": "Low",
    "alternativeSector": "Consumer Cyclicals; Consumer Non-Cyclicals; Basic Materials",
    "reason": "Perdagangan besar berbagai macam barang tidak menunjukkan eksposur barang dominan.",
    "reviewNote": "Cek komposisi produk/revenue perusahaan."
  },
  {
    "code": "47111",
    "title": "PERDAGANGAN ECERAN BERBAGAI MACAM BARANG YANG UTAMANYA MAKANAN, MINUMAN ATAU TEMBAKAU DI MINIMARKET/SUPERMARKET/HYPERMARKET",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Produk yang diperdagangkan adalah pangan, barang pokok, personal care, atau non-durable.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "47112",
    "title": "PERDAGANGAN ECERAN BERBAGAI MACAM BARANG YANG UTAMANYA MAKANAN, MINUMAN ATAU TEMBAKAU BUKAN DI MINIMARKET/SUPERMARKET/HYPERMARKET (TRADISIONAL)",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Produk yang diperdagangkan adalah pangan, barang pokok, personal care, atau non-durable.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "47191",
    "title": "PERDAGANGAN ECERAN BERBAGAI MACAM BARANG YANG UTAMANYA BUKAN MAKANAN, MINUMAN ATAU TEMBAKAU DI TOSERBA (DEPARTMENT STORE)",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Produk yang diperdagangkan adalah pangan, barang pokok, personal care, atau non-durable.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "47192",
    "title": "PERDAGANGAN ECERAN BERBAGAI MACAM BARANG YANG UTAMANYA BUKAN MAKANAN, MINUMAN ATAU TEMBAKAU (BARANG-BARANG KELONTONG) BUKAN DI TOSERBA (DEPARTMENT STORE)",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Produk yang diperdagangkan adalah pangan, barang pokok, personal care, atau non-durable.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "47211",
    "title": "PERDAGANGAN ECERAN PADI DAN PALAWIJA",
    "sector": "Basic Materials",
    "confidence": "Medium",
    "alternativeSector": "Consumer Cyclicals",
    "reason": "Produk yang diperdagangkan berupa material/bahan baku industri.",
    "reviewNote": ""
  },
  {
    "code": "47212",
    "title": "PERDAGANGAN ECERAN BUAH-BUAHAN",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Produk yang diperdagangkan adalah pangan, barang pokok, personal care, atau non-durable.",
    "reviewNote": ""
  },
  {
    "code": "47213",
    "title": "PERDAGANGAN ECERAN SAYURAN",
    "sector": "Basic Materials",
    "confidence": "Medium",
    "alternativeSector": "Consumer Cyclicals",
    "reason": "Produk yang diperdagangkan berupa material/bahan baku industri.",
    "reviewNote": ""
  },
  {
    "code": "47214",
    "title": "PERDAGANGAN ECERAN HASIL PETERNAKAN",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Produk yang diperdagangkan adalah pangan, barang pokok, personal care, atau non-durable.",
    "reviewNote": ""
  },
  {
    "code": "47215",
    "title": "PERDAGANGAN ECERAN HASIL PERIKANAN",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Produk yang diperdagangkan adalah pangan, barang pokok, personal care, atau non-durable.",
    "reviewNote": ""
  },
  {
    "code": "47216",
    "title": "PERDAGANGAN ECERAN HASIL KEHUTANAN DAN PERBURUAN",
    "sector": "Basic Materials",
    "confidence": "Medium",
    "alternativeSector": "Consumer Cyclicals",
    "reason": "Produk yang diperdagangkan berupa material/bahan baku industri.",
    "reviewNote": ""
  },
  {
    "code": "47219",
    "title": "PERDAGANGAN ECERAN HASIL PERTANIAN LAINNYA",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Produk yang diperdagangkan adalah pangan, barang pokok, personal care, atau non-durable.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "47221",
    "title": "PERDAGANGAN ECERAN MINUMAN BERALKOHOL",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Produk yang diperdagangkan adalah pangan, barang pokok, personal care, atau non-durable.",
    "reviewNote": ""
  },
  {
    "code": "47222",
    "title": "PERDAGANGAN ECERAN MINUMAN TIDAK BERALKOHOL",
    "sector": "Basic Materials",
    "confidence": "Medium",
    "alternativeSector": "Consumer Cyclicals",
    "reason": "Produk yang diperdagangkan berupa material/bahan baku industri.",
    "reviewNote": ""
  },
  {
    "code": "47230",
    "title": "PERDAGANGAN ECERAN KHUSUS ROKOK DAN TEMBAKAU DI TOKO",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Produk yang diperdagangkan adalah pangan, barang pokok, personal care, atau non-durable.",
    "reviewNote": ""
  },
  {
    "code": "47241",
    "title": "PERDAGANGAN ECERAN BERAS",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Produk yang diperdagangkan adalah pangan, barang pokok, personal care, atau non-durable.",
    "reviewNote": ""
  },
  {
    "code": "47242",
    "title": "PERDAGANGAN ECERAN ROTI, KUE KERING, SERTA KUE BASAH DAN SEJENISNYA",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Produk/jasa yang diperdagangkan adalah barang/jasa konsumen sekunder atau siklis.",
    "reviewNote": ""
  },
  {
    "code": "47243",
    "title": "PERDAGANGAN ECERAN KOPI, GULA PASIR DAN GULA MERAH",
    "sector": "Basic Materials",
    "confidence": "Medium",
    "alternativeSector": "Consumer Cyclicals",
    "reason": "Produk yang diperdagangkan berupa material/bahan baku industri.",
    "reviewNote": ""
  },
  {
    "code": "47244",
    "title": "PERDAGANGAN ECERAN TAHU, TEMPE, TAUCO DAN ONCOM",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Produk/jasa yang diperdagangkan adalah barang/jasa konsumen sekunder atau siklis.",
    "reviewNote": ""
  },
  {
    "code": "47245",
    "title": "PERDAGANGAN ECERAN DAGING DAN IKAN OLAHAN",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Produk yang diperdagangkan adalah pangan, barang pokok, personal care, atau non-durable.",
    "reviewNote": ""
  },
  {
    "code": "47249",
    "title": "PERDAGANGAN ECERAN MAKANAN LAINNYA",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Produk yang diperdagangkan adalah pangan, barang pokok, personal care, atau non-durable.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "47301",
    "title": "PERDAGANGAN ECERAN BAHAN BAKAR MINYAK, BAHAN BAKAR GAS (BBG), DAN LIQUEFIED PETROLEUM GAS (LPG) DI SARANA PENGISIAN BAHAN BAKAR TRANSPORTASI DARAT, LAUT, DAN UDARA",
    "sector": "Energy",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Perdagangan bahan bakar, minyak/gas, atau batu bara mengikuti sektor Energy.",
    "reviewNote": ""
  },
  {
    "code": "47302",
    "title": "PERDAGANGAN ECERAN BAHAN BAKAR MINYAK, BAHAN BAKAR GAS (BBG), DAN LIQUEFIED PETROLEUM GAS (LPG) SELAIN DI SARANA PENGISIAN BAHAN BAKAR TRANSPORTASI DARAT, LAUT, DAN UDARA",
    "sector": "Energy",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Perdagangan bahan bakar, minyak/gas, atau batu bara mengikuti sektor Energy.",
    "reviewNote": ""
  },
  {
    "code": "47303",
    "title": "PERDAGANGAN ECERAN MINYAK PELUMAS DI TOKO",
    "sector": "Energy",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Perdagangan bahan bakar, minyak/gas, atau batu bara mengikuti sektor Energy.",
    "reviewNote": ""
  },
  {
    "code": "47411",
    "title": "PERDAGANGAN ECERAN KOMPUTER DAN PERLENGKAPANNYA",
    "sector": "Technology",
    "confidence": "Medium",
    "alternativeSector": "Consumer Cyclicals",
    "reason": "Perdagangan komputer, perangkat lunak, elektronik, atau perangkat jaringan mengikuti Technology.",
    "reviewNote": ""
  },
  {
    "code": "47412",
    "title": "PERDAGANGAN ECERAN PERALATAN VIDEO GAME DAN SEJENISNYA",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "Consumer Non-Cyclicals",
    "reason": "Perdagangan eceran non-spesifik umumnya menjual barang/jasa ke konsumen akhir.",
    "reviewNote": ""
  },
  {
    "code": "47413",
    "title": "PERDAGANGAN ECERAN PIRANTI LUNAK (SOFTWARE)",
    "sector": "Technology",
    "confidence": "Medium",
    "alternativeSector": "Consumer Cyclicals",
    "reason": "Perdagangan komputer, perangkat lunak, elektronik, atau perangkat jaringan mengikuti Technology.",
    "reviewNote": ""
  },
  {
    "code": "47414",
    "title": "PERDAGANGAN ECERAN ALAT TELEKOMUNIKASI",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "Consumer Non-Cyclicals",
    "reason": "Perdagangan eceran non-spesifik umumnya menjual barang/jasa ke konsumen akhir.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "47415",
    "title": "PERDAGANGAN ECERAN MESIN KANTOR",
    "sector": "Technology",
    "confidence": "Medium",
    "alternativeSector": "Consumer Cyclicals",
    "reason": "Perdagangan komputer, perangkat lunak, elektronik, atau perangkat jaringan mengikuti Technology.",
    "reviewNote": ""
  },
  {
    "code": "47420",
    "title": "PERDAGANGAN ECERAN KHUSUS PERALATAN AUDIO DAN VIDEO DI TOKO",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Produk/jasa yang diperdagangkan adalah barang/jasa konsumen sekunder atau siklis.",
    "reviewNote": ""
  },
  {
    "code": "47511",
    "title": "PERDAGANGAN ECERAN TEKSTIL",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Produk/jasa yang diperdagangkan adalah barang/jasa konsumen sekunder atau siklis.",
    "reviewNote": ""
  },
  {
    "code": "47512",
    "title": "PERDAGANGAN ECERAN PERLENGKAPAN RUMAH TANGGA DARI TEKSTIL",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Produk/jasa yang diperdagangkan adalah barang/jasa konsumen sekunder atau siklis.",
    "reviewNote": ""
  },
  {
    "code": "47513",
    "title": "PERDAGANGAN ECERAN PERLENGKAPAN JAHIT MENJAHIT",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "Consumer Non-Cyclicals",
    "reason": "Perdagangan eceran non-spesifik umumnya menjual barang/jasa ke konsumen akhir.",
    "reviewNote": ""
  },
  {
    "code": "47521",
    "title": "PERDAGANGAN ECERAN BARANG LOGAM UNTUK BAHAN KONSTRUKSI",
    "sector": "Basic Materials",
    "confidence": "Medium",
    "alternativeSector": "Consumer Cyclicals",
    "reason": "Produk yang diperdagangkan berupa material/bahan baku industri.",
    "reviewNote": ""
  },
  {
    "code": "47522",
    "title": "PERDAGANGAN ECERAN KACA",
    "sector": "Basic Materials",
    "confidence": "Medium",
    "alternativeSector": "Consumer Cyclicals",
    "reason": "Produk yang diperdagangkan berupa material/bahan baku industri.",
    "reviewNote": ""
  },
  {
    "code": "47523",
    "title": "PERDAGANGAN ECERAN GENTENG, BATU BATA, UBIN DAN SEJENISNYA DARI TANAH LIAT, KAPUR, SEMEN ATAU KACA",
    "sector": "Basic Materials",
    "confidence": "Medium",
    "alternativeSector": "Consumer Cyclicals",
    "reason": "Produk yang diperdagangkan berupa material/bahan baku industri.",
    "reviewNote": ""
  },
  {
    "code": "47524",
    "title": "PERDAGANGAN ECERAN SEMEN, KAPUR, PASIR DAN BATU",
    "sector": "Basic Materials",
    "confidence": "Medium",
    "alternativeSector": "Consumer Cyclicals",
    "reason": "Produk yang diperdagangkan berupa material/bahan baku industri.",
    "reviewNote": ""
  },
  {
    "code": "47525",
    "title": "PERDAGANGAN ECERAN BAHAN KONSTRUKSI DARI PORSELEN",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "Consumer Non-Cyclicals",
    "reason": "Perdagangan eceran non-spesifik umumnya menjual barang/jasa ke konsumen akhir.",
    "reviewNote": ""
  },
  {
    "code": "47526",
    "title": "PERDAGANGAN ECERAN BAHAN KONSTRUKSI DARI KAYU",
    "sector": "Basic Materials",
    "confidence": "Medium",
    "alternativeSector": "Consumer Cyclicals",
    "reason": "Produk yang diperdagangkan berupa material/bahan baku industri.",
    "reviewNote": ""
  },
  {
    "code": "47527",
    "title": "PERDAGANGAN ECERAN CAT, PERNIS DAN LAK",
    "sector": "Basic Materials",
    "confidence": "Medium",
    "alternativeSector": "Consumer Cyclicals",
    "reason": "Produk yang diperdagangkan berupa material/bahan baku industri.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "47528",
    "title": "PERDAGANGAN ECERAN BERBAGAI MACAM MATERIAL BANGUNAN",
    "sector": "Basic Materials",
    "confidence": "Medium",
    "alternativeSector": "Consumer Cyclicals",
    "reason": "Produk yang diperdagangkan berupa material/bahan baku industri.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "47529",
    "title": "PERDAGANGAN ECERAN BAHAN DAN BARANG KONSTRUKSI LAINNYA",
    "sector": "Basic Materials",
    "confidence": "Medium",
    "alternativeSector": "Consumer Cyclicals",
    "reason": "Produk yang diperdagangkan berupa material/bahan baku industri.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "47530",
    "title": "PERDAGANGAN ECERAN KHUSUS KARPET, PERMADANI DAN PENUTUP DINDING DAN LANTAI DI TOKO",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "Consumer Non-Cyclicals",
    "reason": "Perdagangan eceran non-spesifik umumnya menjual barang/jasa ke konsumen akhir.",
    "reviewNote": ""
  },
  {
    "code": "47591",
    "title": "PERDAGANGAN ECERAN FURNITUR",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Produk/jasa yang diperdagangkan adalah barang/jasa konsumen sekunder atau siklis.",
    "reviewNote": ""
  },
  {
    "code": "47592",
    "title": "PERDAGANGAN ECERAN PERALATAN LISTRIK RUMAH TANGGA DAN PERALATAN PENERANGAN DAN PERLENGKAPANNYA",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "Consumer Non-Cyclicals",
    "reason": "Perdagangan eceran non-spesifik umumnya menjual barang/jasa ke konsumen akhir.",
    "reviewNote": ""
  },
  {
    "code": "47593",
    "title": "PERDAGANGAN ECERAN BARANG PECAH BELAH DAN PERLENGKAPAN DAPUR DARI PLASTIK",
    "sector": "Basic Materials",
    "confidence": "Medium",
    "alternativeSector": "Consumer Cyclicals",
    "reason": "Produk yang diperdagangkan berupa material/bahan baku industri.",
    "reviewNote": ""
  },
  {
    "code": "47594",
    "title": "PERDAGANGAN ECERAN BARANG PECAH BELAH DAN PERLENGKAPAN DAPUR DARI BATU ATAU TANAH LIAT",
    "sector": "Basic Materials",
    "confidence": "Medium",
    "alternativeSector": "Consumer Cyclicals",
    "reason": "Produk yang diperdagangkan berupa material/bahan baku industri.",
    "reviewNote": ""
  },
  {
    "code": "47595",
    "title": "PERDAGANGAN ECERAN BARANG PECAH BELAH DAN PERLENGKAPAN DAPUR DARI KAYU, BAMBU ATAU ROTAN",
    "sector": "Basic Materials",
    "confidence": "Medium",
    "alternativeSector": "Consumer Cyclicals",
    "reason": "Produk yang diperdagangkan berupa material/bahan baku industri.",
    "reviewNote": ""
  },
  {
    "code": "47596",
    "title": "PERDAGANGAN ECERAN BARANG PECAH BELAH DAN PERLENGKAPAN DAPUR BUKAN DARI PLASTIK, BATU, TANAH LIAT, KAYU, BAMBU ATAU ROTAN",
    "sector": "Basic Materials",
    "confidence": "Medium",
    "alternativeSector": "Consumer Cyclicals",
    "reason": "Produk yang diperdagangkan berupa material/bahan baku industri.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "47597",
    "title": "PERDAGANGAN ECERAN ALAT MUSIK",
    "sector": "Basic Materials",
    "confidence": "Medium",
    "alternativeSector": "Consumer Cyclicals",
    "reason": "Produk yang diperdagangkan berupa material/bahan baku industri.",
    "reviewNote": ""
  },
  {
    "code": "47599",
    "title": "PERDAGANGAN ECERAN PERALATAN DAN PERLENGKAPAN RUMAH TANGGA LAINNYA YTDL",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Produk yang diperdagangkan adalah pangan, barang pokok, personal care, atau non-durable.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "47611",
    "title": "PERDAGANGAN ECERAN ALAT TULIS MENULIS DAN GAMBAR",
    "sector": "Basic Materials",
    "confidence": "Medium",
    "alternativeSector": "Consumer Cyclicals",
    "reason": "Produk yang diperdagangkan berupa material/bahan baku industri.",
    "reviewNote": ""
  },
  {
    "code": "47612",
    "title": "PERDAGANGAN ECERAN HASIL PENCETAKAN DAN PENERBITAN",
    "sector": "Basic Materials",
    "confidence": "Medium",
    "alternativeSector": "Consumer Cyclicals",
    "reason": "Produk yang diperdagangkan berupa material/bahan baku industri.",
    "reviewNote": ""
  },
  {
    "code": "47620",
    "title": "PERDAGANGAN ECERAN KHUSUS REKAMAN MUSIK DAN VIDEO DI TOKO",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Produk/jasa yang diperdagangkan adalah barang/jasa konsumen sekunder atau siklis.",
    "reviewNote": ""
  },
  {
    "code": "47630",
    "title": "PERDAGANGAN ECERAN KHUSUS PERALATAN OLAHRAGA DI TOKO",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Produk/jasa yang diperdagangkan adalah barang/jasa konsumen sekunder atau siklis.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "47640",
    "title": "PERDAGANGAN ECERAN KHUSUS ALAT PERMAINAN DAN MAINAN ANAK- ANAK DI TOKO",
    "sector": "Basic Materials",
    "confidence": "Medium",
    "alternativeSector": "Consumer Cyclicals",
    "reason": "Produk yang diperdagangkan berupa material/bahan baku industri.",
    "reviewNote": ""
  },
  {
    "code": "47650",
    "title": "PERDAGANGAN ECERAN KERTAS, KERTAS KARTON DAN BARANG DARI KERTAS/KARTON",
    "sector": "Basic Materials",
    "confidence": "Medium",
    "alternativeSector": "Consumer Cyclicals",
    "reason": "Produk yang diperdagangkan berupa material/bahan baku industri.",
    "reviewNote": ""
  },
  {
    "code": "47711",
    "title": "PERDAGANGAN ECERAN PAKAIAN",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Produk/jasa yang diperdagangkan adalah barang/jasa konsumen sekunder atau siklis.",
    "reviewNote": ""
  },
  {
    "code": "47712",
    "title": "PERDAGANGAN ECERAN SEPATU, SANDAL DAN ALAS KAKI LAINNYA",
    "sector": "Healthcare",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Perdagangan obat, farmasi, atau alat kesehatan mengikuti sektor Healthcare.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "47713",
    "title": "PERDAGANGAN ECERAN PELENGKAP PAKAIAN",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Produk/jasa yang diperdagangkan adalah barang/jasa konsumen sekunder atau siklis.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "47714",
    "title": "PERDAGANGAN ECERAN TAS, DOMPET, KOPER, RANSEL DAN SEJENISNYA",
    "sector": "Basic Materials",
    "confidence": "Medium",
    "alternativeSector": "Consumer Cyclicals",
    "reason": "Produk yang diperdagangkan berupa material/bahan baku industri.",
    "reviewNote": ""
  },
  {
    "code": "47721",
    "title": "PERDAGANGAN ECERAN BARANG DAN OBAT FARMASI UNTUK MANUSIA DI APOTIK",
    "sector": "Healthcare",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Perdagangan obat, farmasi, atau alat kesehatan mengikuti sektor Healthcare.",
    "reviewNote": ""
  },
  {
    "code": "47722",
    "title": "PERDAGANGAN ECERAN BARANG DAN OBAT FARMASI UNTUK MANUSIA BUKAN DI APOTIK",
    "sector": "Healthcare",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Perdagangan obat, farmasi, atau alat kesehatan mengikuti sektor Healthcare.",
    "reviewNote": ""
  },
  {
    "code": "47723",
    "title": "PERDAGANGAN ECERAN OBAT TRADISIONAL UNTUK MANUSIA",
    "sector": "Healthcare",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Perdagangan obat, farmasi, atau alat kesehatan mengikuti sektor Healthcare.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "47724",
    "title": "PERDAGANGAN ECERAN KOSMETIK UNTUK MANUSIA",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Produk yang diperdagangkan adalah pangan, barang pokok, personal care, atau non-durable.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "47725",
    "title": "PERDAGANGAN ECERAN ALAT LABORATORIUM, ALAT FARMASI DAN ALAT KESEHATAN UNTUK MANUSIA",
    "sector": "Healthcare",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Perdagangan obat, farmasi, atau alat kesehatan mengikuti sektor Healthcare.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "47726",
    "title": "PERDAGANGAN ECERAN BARANG DAN OBAT FARMASI UNTUK HEWAN DI APOTIK DAN BUKAN DI APOTIK",
    "sector": "Healthcare",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Perdagangan obat, farmasi, atau alat kesehatan mengikuti sektor Healthcare.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "47727",
    "title": "PERDAGANGAN ECERAN OBAT TRADISIONAL UNTUK HEWAN",
    "sector": "Healthcare",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Perdagangan obat, farmasi, atau alat kesehatan mengikuti sektor Healthcare.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "47728",
    "title": "PERDAGANGAN ECERAN KOSMETIK UNTUK HEWAN",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Produk yang diperdagangkan adalah pangan, barang pokok, personal care, atau non-durable.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "47729",
    "title": "PERDAGANGAN ECERAN KHUSUS BARANG DAN OBAT FARMASI, ALAT KEDOKTERAN, PARFUM DAN KOSMETIK LAINNYA",
    "sector": "Healthcare",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Perdagangan obat, farmasi, atau alat kesehatan mengikuti sektor Healthcare.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "47731",
    "title": "PERDAGANGAN ECERAN ALAT FOTOGRAFI DAN PERLENGKAPANNYA",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Produk/jasa yang diperdagangkan adalah barang/jasa konsumen sekunder atau siklis.",
    "reviewNote": ""
  },
  {
    "code": "47732",
    "title": "PERDAGANGAN ECERAN ALAT OPTIK DAN PERLENGKAPANNYA",
    "sector": "Basic Materials",
    "confidence": "Medium",
    "alternativeSector": "Consumer Cyclicals",
    "reason": "Produk yang diperdagangkan berupa material/bahan baku industri.",
    "reviewNote": ""
  },
  {
    "code": "47733",
    "title": "PERDAGANGAN ECERAN KACA MATA",
    "sector": "Basic Materials",
    "confidence": "Medium",
    "alternativeSector": "Consumer Cyclicals",
    "reason": "Produk yang diperdagangkan berupa material/bahan baku industri.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "47734",
    "title": "PERDAGANGAN ECERAN JAM",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "Consumer Non-Cyclicals",
    "reason": "Perdagangan eceran non-spesifik umumnya menjual barang/jasa ke konsumen akhir.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "47735",
    "title": "PERDAGANGAN ECERAN BARANG PERHIASAN",
    "sector": "Basic Materials",
    "confidence": "Medium",
    "alternativeSector": "Consumer Cyclicals",
    "reason": "Produk yang diperdagangkan berupa material/bahan baku industri.",
    "reviewNote": ""
  },
  {
    "code": "47736",
    "title": "PERDAGANGAN ECERAN PERLENGKAPAN PENGENDARA KENDARAAN BERMOTOR",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "Consumer Non-Cyclicals",
    "reason": "Perdagangan eceran non-spesifik umumnya menjual barang/jasa ke konsumen akhir.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "47737",
    "title": "PERDAGANGAN ECERAN PEMBUNGKUS DARI PLASTIK",
    "sector": "Basic Materials",
    "confidence": "Medium",
    "alternativeSector": "Consumer Cyclicals",
    "reason": "Produk yang diperdagangkan berupa material/bahan baku industri.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "47739",
    "title": "PERDAGANGAN ECERAN KHUSUS BARANG BARU LAINNYA YTDL",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Produk yang diperdagangkan adalah pangan, barang pokok, personal care, atau non-durable.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "47741",
    "title": "PERDAGANGAN ECERAN BARANG BEKAS PERLENGKAPAN RUMAH TANGGA",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Produk/jasa yang diperdagangkan adalah barang/jasa konsumen sekunder atau siklis.",
    "reviewNote": ""
  },
  {
    "code": "47742",
    "title": "PERDAGANGAN ECERAN PAKAIAN, ALAS KAKI DAN PELENGKAP PAKAIAN BEKAS",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Produk/jasa yang diperdagangkan adalah barang/jasa konsumen sekunder atau siklis.",
    "reviewNote": ""
  },
  {
    "code": "47743",
    "title": "PERDAGANGAN ECERAN BARANG PERLENGKAPAN PRIBADI BEKAS",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Produk/jasa yang diperdagangkan adalah barang/jasa konsumen sekunder atau siklis.",
    "reviewNote": ""
  },
  {
    "code": "47744",
    "title": "PERDAGANGAN ECERAN BARANG LISTRIK DAN ELEKTRONIK BEKAS",
    "sector": "Technology",
    "confidence": "Medium",
    "alternativeSector": "Consumer Cyclicals",
    "reason": "Perdagangan komputer, perangkat lunak, elektronik, atau perangkat jaringan mengikuti Technology.",
    "reviewNote": ""
  },
  {
    "code": "47745",
    "title": "PERDAGANGAN ECERAN BAHAN KONSTRUKSI DAN SANITASI BEKAS",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "Consumer Non-Cyclicals",
    "reason": "Perdagangan eceran non-spesifik umumnya menjual barang/jasa ke konsumen akhir.",
    "reviewNote": ""
  },
  {
    "code": "47746",
    "title": "PERDAGANGAN ECERAN BARANG ANTIK",
    "sector": "Basic Materials",
    "confidence": "Medium",
    "alternativeSector": "Consumer Cyclicals",
    "reason": "Produk yang diperdagangkan berupa material/bahan baku industri.",
    "reviewNote": ""
  },
  {
    "code": "47749",
    "title": "PERDAGANGAN ECERAN BARANG BEKAS LAINNYA",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "Consumer Non-Cyclicals",
    "reason": "Perdagangan eceran non-spesifik umumnya menjual barang/jasa ke konsumen akhir.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "47751",
    "title": "PERDAGANGAN ECERAN HEWAN PIARAAN (PET ANIMALS)",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "Consumer Non-Cyclicals",
    "reason": "Perdagangan eceran non-spesifik umumnya menjual barang/jasa ke konsumen akhir.",
    "reviewNote": ""
  },
  {
    "code": "47752",
    "title": "PERDAGANGAN ECERAN HEWAN TERNAK",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Produk yang diperdagangkan adalah pangan, barang pokok, personal care, atau non-durable.",
    "reviewNote": ""
  },
  {
    "code": "47753",
    "title": "PERDAGANGAN ECERAN IKAN HIAS",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Produk yang diperdagangkan adalah pangan, barang pokok, personal care, atau non-durable.",
    "reviewNote": ""
  },
  {
    "code": "47754",
    "title": "PERDAGANGAN ECERAN PAKAN TERNAK/UNGGAS/IKAN DAN HEWAN PIARAAN",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Produk yang diperdagangkan adalah pangan, barang pokok, personal care, atau non-durable.",
    "reviewNote": ""
  },
  {
    "code": "47761",
    "title": "PERDAGANGAN ECERAN BUNGA POTONG/FLORIST",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "Consumer Non-Cyclicals",
    "reason": "Perdagangan eceran non-spesifik umumnya menjual barang/jasa ke konsumen akhir.",
    "reviewNote": ""
  },
  {
    "code": "47762",
    "title": "PERDAGANGAN ECERAN TANAMAN DAN BIBIT TANAMAN",
    "sector": "Healthcare",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Perdagangan obat, farmasi, atau alat kesehatan mengikuti sektor Healthcare.",
    "reviewNote": ""
  },
  {
    "code": "47763",
    "title": "PERDAGANGAN ECERAN PUPUK DAN PEMBERANTAS HAMA",
    "sector": "Basic Materials",
    "confidence": "Medium",
    "alternativeSector": "Consumer Cyclicals",
    "reason": "Produk yang diperdagangkan berupa material/bahan baku industri.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "47764",
    "title": "PERDAGANGAN ECERAN PERLENGKAPAN DAN MEDIA TANAMAN HIAS",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Produk/jasa yang diperdagangkan adalah barang/jasa konsumen sekunder atau siklis.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "47771",
    "title": "PERDAGANGAN ECERAN MINYAK TANAH",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "Consumer Non-Cyclicals",
    "reason": "Perdagangan eceran non-spesifik umumnya menjual barang/jasa ke konsumen akhir.",
    "reviewNote": ""
  },
  {
    "code": "47772",
    "title": "PERDAGANGAN ECERAN GAS ELPIJI",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "Consumer Non-Cyclicals",
    "reason": "Perdagangan eceran non-spesifik umumnya menjual barang/jasa ke konsumen akhir.",
    "reviewNote": ""
  },
  {
    "code": "47773",
    "title": "PERDAGANGAN ECERAN BAHAN KIMIA",
    "sector": "Basic Materials",
    "confidence": "Medium",
    "alternativeSector": "Consumer Cyclicals",
    "reason": "Produk yang diperdagangkan berupa material/bahan baku industri.",
    "reviewNote": ""
  },
  {
    "code": "47774",
    "title": "PERDAGANGAN ECERAN AROMATIK/PENYEGAR (MINYAK ATSIRI)",
    "sector": "Basic Materials",
    "confidence": "Medium",
    "alternativeSector": "Consumer Cyclicals",
    "reason": "Produk yang diperdagangkan berupa material/bahan baku industri.",
    "reviewNote": ""
  },
  {
    "code": "47779",
    "title": "PERDAGANGAN ECERAN BAHAN KIMIA, DAN AROMATIK/PENYEGAR (MINYAK ATSIRI), DAN BAHAN BAKAR BUKAN BAHAN BAKAR UNTUK KENDARAAN BERMOTOR LAINNNYA",
    "sector": "Energy",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Perdagangan bahan bakar, minyak/gas, atau batu bara mengikuti sektor Energy.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "47781",
    "title": "PERDAGANGAN ECERAN BARANG KERAJINAN DARI KAYU, BAMBU, ROTAN, PANDAN, RUMPUT DAN SEJENISNYA",
    "sector": "Basic Materials",
    "confidence": "Medium",
    "alternativeSector": "Consumer Cyclicals",
    "reason": "Produk yang diperdagangkan berupa material/bahan baku industri.",
    "reviewNote": ""
  },
  {
    "code": "47782",
    "title": "PERDAGANGAN ECERAN BARANG KERAJINAN DARI KULIT, TULANG, TANDUK, GADING, BULU DAN BINATANG/HEWAN YANG DIAWETKAN",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Produk yang diperdagangkan adalah pangan, barang pokok, personal care, atau non-durable.",
    "reviewNote": ""
  },
  {
    "code": "47783",
    "title": "PERDAGANGAN ECERAN BARANG KERAJINAN DARI LOGAM",
    "sector": "Basic Materials",
    "confidence": "Medium",
    "alternativeSector": "Consumer Cyclicals",
    "reason": "Produk yang diperdagangkan berupa material/bahan baku industri.",
    "reviewNote": ""
  },
  {
    "code": "47784",
    "title": "PERDAGANGAN ECERAN BARANG KERAJINAN DARI KERAMIK",
    "sector": "Basic Materials",
    "confidence": "Medium",
    "alternativeSector": "Consumer Cyclicals",
    "reason": "Produk yang diperdagangkan berupa material/bahan baku industri.",
    "reviewNote": ""
  },
  {
    "code": "47785",
    "title": "PERDAGANGAN ECERAN LUKISAN",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "Consumer Non-Cyclicals",
    "reason": "Perdagangan eceran non-spesifik umumnya menjual barang/jasa ke konsumen akhir.",
    "reviewNote": ""
  },
  {
    "code": "47789",
    "title": "PERDAGANGAN ECERAN BARANG KERAJINAN DAN LUKISAN LAINNYA",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "Consumer Non-Cyclicals",
    "reason": "Perdagangan eceran non-spesifik umumnya menjual barang/jasa ke konsumen akhir.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "47791",
    "title": "PERDAGANGAN ECERAN MESIN PERTANIAN DAN PERLENGKAPANNYA",
    "sector": "Basic Materials",
    "confidence": "Medium",
    "alternativeSector": "Consumer Cyclicals",
    "reason": "Produk yang diperdagangkan berupa material/bahan baku industri.",
    "reviewNote": ""
  },
  {
    "code": "47792",
    "title": "PERDAGANGAN ECERAN MESIN JAHIT DAN PERLENGKAPANNYA",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Produk/jasa yang diperdagangkan adalah barang/jasa konsumen sekunder atau siklis.",
    "reviewNote": ""
  },
  {
    "code": "47793",
    "title": "PERDAGANGAN ECERAN MESIN LAINNYA DAN PERLENGKAPANNYA",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Produk yang diperdagangkan adalah pangan, barang pokok, personal care, atau non-durable.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "47794",
    "title": "PERDAGANGAN ECERAN ALAT TRANSPORTASI DARAT TIDAK BERMOTOR DAN PERLENGKAPANNYA",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "Consumer Non-Cyclicals",
    "reason": "Perdagangan eceran non-spesifik umumnya menjual barang/jasa ke konsumen akhir.",
    "reviewNote": ""
  },
  {
    "code": "47795",
    "title": "PERDAGANGAN ECERAN ALAT TRANSPORTASI AIR DAN PERLENGKAPANNYA",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "Consumer Non-Cyclicals",
    "reason": "Perdagangan eceran non-spesifik umumnya menjual barang/jasa ke konsumen akhir.",
    "reviewNote": ""
  },
  {
    "code": "47796",
    "title": "PERDAGANGAN ECERAN ALAT-ALAT PERTANIAN",
    "sector": "Basic Materials",
    "confidence": "Medium",
    "alternativeSector": "Consumer Cyclicals",
    "reason": "Produk yang diperdagangkan berupa material/bahan baku industri.",
    "reviewNote": ""
  },
  {
    "code": "47797",
    "title": "PERDAGANGAN ECERAN ALAT-ALAT PERTUKANGAN",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "Consumer Non-Cyclicals",
    "reason": "Perdagangan eceran non-spesifik umumnya menjual barang/jasa ke konsumen akhir.",
    "reviewNote": ""
  },
  {
    "code": "47811",
    "title": "PERDAGANGAN ECERAN KAKI LIMA DAN LOS PASAR KOMODITI PADI DAN PALAWIJA",
    "sector": "Basic Materials",
    "confidence": "Medium",
    "alternativeSector": "Consumer Cyclicals",
    "reason": "Produk yang diperdagangkan berupa material/bahan baku industri.",
    "reviewNote": ""
  },
  {
    "code": "47812",
    "title": "PERDAGANGAN ECERAN KAKI LIMA DAN LOS PASAR KOMODITI BUAH- BUAHAN",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Produk yang diperdagangkan adalah pangan, barang pokok, personal care, atau non-durable.",
    "reviewNote": ""
  },
  {
    "code": "47813",
    "title": "PERDAGANGAN ECERAN KAKI LIMA DAN LOS PASAR KOMODITI SAYUR- SAYURAN",
    "sector": "Basic Materials",
    "confidence": "Medium",
    "alternativeSector": "Consumer Cyclicals",
    "reason": "Produk yang diperdagangkan berupa material/bahan baku industri.",
    "reviewNote": ""
  },
  {
    "code": "47814",
    "title": "PERDAGANGAN ECERAN KAKI LIMA DAN LOS PASAR KOMODITI HASIL PETERNAKAN",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Produk yang diperdagangkan adalah pangan, barang pokok, personal care, atau non-durable.",
    "reviewNote": ""
  },
  {
    "code": "47815",
    "title": "PERDAGANGAN ECERAN KAKI LIMA DAN LOS PASAR KOMODITI HASIL PERIKANAN",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Produk yang diperdagangkan adalah pangan, barang pokok, personal care, atau non-durable.",
    "reviewNote": ""
  },
  {
    "code": "47816",
    "title": "PERDAGANGAN ECERAN KAKI LIMA DAN LOS PASAR KOMODITI HASIL KEHUTANAN DAN PERBURUAN",
    "sector": "Basic Materials",
    "confidence": "Medium",
    "alternativeSector": "Consumer Cyclicals",
    "reason": "Produk yang diperdagangkan berupa material/bahan baku industri.",
    "reviewNote": ""
  },
  {
    "code": "47819",
    "title": "PERDAGANGAN ECERAN KAKI LIMA DAN LOS PASAR KOMODITI TANAMAN HIAS DAN HASIL PERTANIAN LAINNYA",
    "sector": "Healthcare",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Perdagangan obat, farmasi, atau alat kesehatan mengikuti sektor Healthcare.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "47821",
    "title": "PERDAGANGAN ECERAN KAKI LIMA DAN LOS PASAR BERAS",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Produk yang diperdagangkan adalah pangan, barang pokok, personal care, atau non-durable.",
    "reviewNote": ""
  },
  {
    "code": "47822",
    "title": "PERDAGANGAN ECERAN KAKI LIMA DAN LOS PASAR ROTI, KUE KERING, KUE BASAH DAN SEJENISNYA",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "Consumer Non-Cyclicals",
    "reason": "Perdagangan eceran non-spesifik umumnya menjual barang/jasa ke konsumen akhir.",
    "reviewNote": ""
  },
  {
    "code": "47823",
    "title": "PERDAGANGAN ECERAN KAKI LIMA DAN LOS PASAR KOPI, GULA PASIR, GULA MERAH DAN SEJENISNYA",
    "sector": "Basic Materials",
    "confidence": "Medium",
    "alternativeSector": "Consumer Cyclicals",
    "reason": "Produk yang diperdagangkan berupa material/bahan baku industri.",
    "reviewNote": ""
  },
  {
    "code": "47824",
    "title": "PERDAGANGAN ECERAN KAKI LIMA DAN LOS PASAR TAHU, TEMPE, TAUCO DAN ONCOM",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "Consumer Non-Cyclicals",
    "reason": "Perdagangan eceran non-spesifik umumnya menjual barang/jasa ke konsumen akhir.",
    "reviewNote": ""
  },
  {
    "code": "47825",
    "title": "PERDAGANGAN ECERAN KAKI LIMA DAN LOS PASAR DAGING OLAHAN DAN IKAN OLAHAN",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Produk yang diperdagangkan adalah pangan, barang pokok, personal care, atau non-durable.",
    "reviewNote": ""
  },
  {
    "code": "47826",
    "title": "PERDAGANGAN ECERAN KAKI LIMA DAN LOS PASAR MINUMAN",
    "sector": "Basic Materials",
    "confidence": "Medium",
    "alternativeSector": "Consumer Cyclicals",
    "reason": "Produk yang diperdagangkan berupa material/bahan baku industri.",
    "reviewNote": ""
  },
  {
    "code": "47827",
    "title": "PERDAGANGAN ECERAN KAKI LIMA DAN LOS PASAR ROKOK DAN TEMBAKAU",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Produk yang diperdagangkan adalah pangan, barang pokok, personal care, atau non-durable.",
    "reviewNote": ""
  },
  {
    "code": "47828",
    "title": "PERDAGANGAN ECERAN KAKI LIMA DAN LOS PASAR PAKAN TERNAK, PAKAN UNGGAS DAN PAKAN IKAN",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Produk yang diperdagangkan adalah pangan, barang pokok, personal care, atau non-durable.",
    "reviewNote": ""
  },
  {
    "code": "47829",
    "title": "PERDAGANGAN ECERAN KAKI LIMA DAN LOS PASAR KOMODITI MAKANAN DAN MINUMAN YTDL",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Produk yang diperdagangkan adalah pangan, barang pokok, personal care, atau non-durable.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "47831",
    "title": "PERDAGANGAN ECERAN KAKI LIMA DAN LOS PASAR TEKSTIL",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Produk/jasa yang diperdagangkan adalah barang/jasa konsumen sekunder atau siklis.",
    "reviewNote": ""
  },
  {
    "code": "47832",
    "title": "PERDAGANGAN ECERAN KAKI LIMA DAN LOS PASAR PAKAIAN",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Produk/jasa yang diperdagangkan adalah barang/jasa konsumen sekunder atau siklis.",
    "reviewNote": ""
  },
  {
    "code": "47833",
    "title": "PERDAGANGAN ECERAN KAKI LIMA DAN LOS PASAR SEPATU, SANDAL DAN ALAS KAKI LAINNYA",
    "sector": "Healthcare",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Perdagangan obat, farmasi, atau alat kesehatan mengikuti sektor Healthcare.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "47834",
    "title": "PERDAGANGAN ECERAN KAKI LIMA DAN LOS PASAR PELENGKAP PAKAIAN DAN BENANG",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Produk/jasa yang diperdagangkan adalah barang/jasa konsumen sekunder atau siklis.",
    "reviewNote": ""
  },
  {
    "code": "47841",
    "title": "PERDAGANGAN ECERAN KAKI LIMA DAN LOS PASAR BAHAN KIMIA",
    "sector": "Basic Materials",
    "confidence": "Medium",
    "alternativeSector": "Consumer Cyclicals",
    "reason": "Produk yang diperdagangkan berupa material/bahan baku industri.",
    "reviewNote": ""
  },
  {
    "code": "47842",
    "title": "PERDAGANGAN ECERAN KAKI LIMA DAN LOS PASAR FARMASI",
    "sector": "Healthcare",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Perdagangan obat, farmasi, atau alat kesehatan mengikuti sektor Healthcare.",
    "reviewNote": ""
  },
  {
    "code": "47843",
    "title": "PERDAGANGAN ECERAN KAKI LIMA DAN LOS PASAR OBAT TRADISIONAL",
    "sector": "Healthcare",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Perdagangan obat, farmasi, atau alat kesehatan mengikuti sektor Healthcare.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "47844",
    "title": "PERDAGANGAN ECERAN KAKI LIMA DAN LOS PASAR KOSMETIK",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Produk yang diperdagangkan adalah pangan, barang pokok, personal care, atau non-durable.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "47845",
    "title": "PERDAGANGAN ECERAN KAKI LIMA DAN LOS PASAR PUPUK DAN PEMBERANTAS HAMA",
    "sector": "Basic Materials",
    "confidence": "Medium",
    "alternativeSector": "Consumer Cyclicals",
    "reason": "Produk yang diperdagangkan berupa material/bahan baku industri.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "47846",
    "title": "PERDAGANGAN ECERAN KAKI LIMA DAN LOS PASAR AROMATIK/PENYEGAR (MINYAK ATSIRI)",
    "sector": "Basic Materials",
    "confidence": "Medium",
    "alternativeSector": "Consumer Cyclicals",
    "reason": "Produk yang diperdagangkan berupa material/bahan baku industri.",
    "reviewNote": ""
  },
  {
    "code": "47849",
    "title": "PERDAGANGAN ECERAN KAKI LIMA DAN LOS PASAR BAHAN KIMIA, FARMASI, KOSMETIK DAN ALAT LABORATORIUM DAN YBDI YTDL",
    "sector": "Healthcare",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Perdagangan obat, farmasi, atau alat kesehatan mengikuti sektor Healthcare.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "47851",
    "title": "PERDAGANGAN ECERAN KAKI LIMA DAN LOS PASAR KACA MATA",
    "sector": "Basic Materials",
    "confidence": "Medium",
    "alternativeSector": "Consumer Cyclicals",
    "reason": "Produk yang diperdagangkan berupa material/bahan baku industri.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "47852",
    "title": "PERDAGANGAN ECERAN KAKI LIMA DAN LOS PASAR BARANG PERHIASAN",
    "sector": "Basic Materials",
    "confidence": "Medium",
    "alternativeSector": "Consumer Cyclicals",
    "reason": "Produk yang diperdagangkan berupa material/bahan baku industri.",
    "reviewNote": ""
  },
  {
    "code": "47853",
    "title": "PERDAGANGAN ECERAN KAKI LIMA DAN LOS PASAR JAM",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "Consumer Non-Cyclicals",
    "reason": "Perdagangan eceran non-spesifik umumnya menjual barang/jasa ke konsumen akhir.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "47854",
    "title": "PERDAGANGAN ECERAN KAKI LIMA DAN LOS PASAR TAS, DOMPET, KOPER, RANSEL DAN SEJENISNYA",
    "sector": "Basic Materials",
    "confidence": "Medium",
    "alternativeSector": "Consumer Cyclicals",
    "reason": "Produk yang diperdagangkan berupa material/bahan baku industri.",
    "reviewNote": ""
  },
  {
    "code": "47855",
    "title": "PERDAGANGAN ECERAN KAKI LIMA DAN LOS PASAR PERLENGKAPAN PENGENDARA SEPEDA MOTOR",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Produk/jasa yang diperdagangkan adalah barang/jasa konsumen sekunder atau siklis.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "47859",
    "title": "PERDAGANGAN ECERAN KAKI LIMA DAN LOS PASAR BARANG KEPERLUAN PRIBADI LAINNYA",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "Consumer Non-Cyclicals",
    "reason": "Perdagangan eceran non-spesifik umumnya menjual barang/jasa ke konsumen akhir.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "47861",
    "title": "PERDAGANGAN ECERAN KAKI LIMA DAN LOS PASAR BARANG ELEKTRONIK",
    "sector": "Technology",
    "confidence": "Medium",
    "alternativeSector": "Consumer Cyclicals",
    "reason": "Perdagangan komputer, perangkat lunak, elektronik, atau perangkat jaringan mengikuti Technology.",
    "reviewNote": ""
  },
  {
    "code": "47862",
    "title": "PERDAGANGAN ECERAN KAKI LIMA DAN LOS PASAR ALAT DAN PERLENGKAPAN LISTRIK",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "Consumer Non-Cyclicals",
    "reason": "Perdagangan eceran non-spesifik umumnya menjual barang/jasa ke konsumen akhir.",
    "reviewNote": ""
  },
  {
    "code": "47863",
    "title": "PERDAGANGAN ECERAN KAKI LIMA DAN LOS PASAR BARANG PECAH BELAH DAN PERLENGKAPAN DAPUR DARI PLASTIK/MELAMIN",
    "sector": "Basic Materials",
    "confidence": "Medium",
    "alternativeSector": "Consumer Cyclicals",
    "reason": "Produk yang diperdagangkan berupa material/bahan baku industri.",
    "reviewNote": ""
  },
  {
    "code": "47864",
    "title": "PERDAGANGAN ECERAN KAKI LIMA DAN LOS PASAR BARANG PECAH BELAH DAN PERLENGKAPAN DAPUR DARI BATU ATAU TANAH LIAT",
    "sector": "Basic Materials",
    "confidence": "Medium",
    "alternativeSector": "Consumer Cyclicals",
    "reason": "Produk yang diperdagangkan berupa material/bahan baku industri.",
    "reviewNote": ""
  },
  {
    "code": "47865",
    "title": "PERDAGANGAN ECERAN KAKI LIMA DAN LOS PASAR BARANG DAN PERLENGKAPAN DAPUR DARI KAYU, BAMBU ATAU ROTAN",
    "sector": "Basic Materials",
    "confidence": "Medium",
    "alternativeSector": "Consumer Cyclicals",
    "reason": "Produk yang diperdagangkan berupa material/bahan baku industri.",
    "reviewNote": ""
  },
  {
    "code": "47866",
    "title": "PERDAGANGAN ECERAN KAKI LIMA DAN LOS PASAR BARANG PECAH BELAH DAN PERLENGKAPAN DAPUR BUKAN DARI PLASTIK, BATU, TANAH LIAT, KAYU, BAMBU ATAU ROTAN",
    "sector": "Basic Materials",
    "confidence": "Medium",
    "alternativeSector": "Consumer Cyclicals",
    "reason": "Produk yang diperdagangkan berupa material/bahan baku industri.",
    "reviewNote": ""
  },
  {
    "code": "47867",
    "title": "PERDAGANGAN ECERAN KAKI LIMA DAN LOS PASAR ALAT KEBERSIHAN",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "Consumer Non-Cyclicals",
    "reason": "Perdagangan eceran non-spesifik umumnya menjual barang/jasa ke konsumen akhir.",
    "reviewNote": ""
  },
  {
    "code": "47869",
    "title": "PERDAGANGAN ECERAN KAKI LIMA DAN LOS PASAR PERLENGKAPAN RUMAH TANGGA LAINNYA",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Produk/jasa yang diperdagangkan adalah barang/jasa konsumen sekunder atau siklis.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "47871",
    "title": "PERDAGANGAN ECERAN KAKI LIMA DAN LOS PASAR KERTAS, KARTON DAN BARANG DARI KERTAS",
    "sector": "Basic Materials",
    "confidence": "Medium",
    "alternativeSector": "Consumer Cyclicals",
    "reason": "Produk yang diperdagangkan berupa material/bahan baku industri.",
    "reviewNote": ""
  },
  {
    "code": "47872",
    "title": "PERDAGANGAN ECERAN KAKI LIMA DAN LOS PASAR ALAT TULIS MENULIS DAN GAMBAR",
    "sector": "Basic Materials",
    "confidence": "Medium",
    "alternativeSector": "Consumer Cyclicals",
    "reason": "Produk yang diperdagangkan berupa material/bahan baku industri.",
    "reviewNote": ""
  },
  {
    "code": "47873",
    "title": "PERDAGANGAN ECERAN KAKI LIMA DAN LOS PASAR HASIL PENCETAKAN DAN PENERBITAN",
    "sector": "Basic Materials",
    "confidence": "Medium",
    "alternativeSector": "Consumer Cyclicals",
    "reason": "Produk yang diperdagangkan berupa material/bahan baku industri.",
    "reviewNote": ""
  },
  {
    "code": "47874",
    "title": "PERDAGANGAN ECERAN KAKI LIMA DAN LOS PASAR ALAT OLAHRAGA DAN ALAT MUSIK",
    "sector": "Basic Materials",
    "confidence": "Medium",
    "alternativeSector": "Consumer Cyclicals",
    "reason": "Produk yang diperdagangkan berupa material/bahan baku industri.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "47875",
    "title": "PERDAGANGAN ECERAN KAKI LIMA DAN LOS PASAR ALAT FOTOGRAFI, ALAT OPTIK DAN PERLENGKAPANNYA",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Produk/jasa yang diperdagangkan adalah barang/jasa konsumen sekunder atau siklis.",
    "reviewNote": ""
  },
  {
    "code": "47876",
    "title": "PERDAGANGAN ECERAN KAKI LIMA DAN LOS PASAR MESIN KANTOR",
    "sector": "Technology",
    "confidence": "Medium",
    "alternativeSector": "Consumer Cyclicals",
    "reason": "Perdagangan komputer, perangkat lunak, elektronik, atau perangkat jaringan mengikuti Technology.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "47877",
    "title": "PERDAGANGAN ECERAN KAKI LIMA DAN LOS PASAR PERALATAN TELEKOMUNIKASI",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "Consumer Non-Cyclicals",
    "reason": "Perdagangan eceran non-spesifik umumnya menjual barang/jasa ke konsumen akhir.",
    "reviewNote": ""
  },
  {
    "code": "47879",
    "title": "PERDAGANGAN ECERAN KAKI LIMA DAN LOS PASAR CAMPURAN KERTAS, KARTON, BARANG DARI KERTAS, ALAT TULIS-MENULIS, ALAT GAMBAR, HASIL PENCETAKAN, PENERBITAN DAN LAINNYA",
    "sector": "Basic Materials",
    "confidence": "Medium",
    "alternativeSector": "Consumer Cyclicals",
    "reason": "Produk yang diperdagangkan berupa material/bahan baku industri.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "47881",
    "title": "PERDAGANGAN ECERAN KAKI LIMA DAN LOS PASAR BARANG KERAJINAN",
    "sector": "Basic Materials",
    "confidence": "Medium",
    "alternativeSector": "Consumer Cyclicals",
    "reason": "Produk yang diperdagangkan berupa material/bahan baku industri.",
    "reviewNote": ""
  },
  {
    "code": "47882",
    "title": "PERDAGANGAN ECERAN KAKI LIMA DAN LOS PASAR MAINAN ANAK-ANAK",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Produk/jasa yang diperdagangkan adalah barang/jasa konsumen sekunder atau siklis.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "47883",
    "title": "PERDAGANGAN ECERAN KAKI LIMA DAN LOS PASAR LUKISAN",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "Consumer Non-Cyclicals",
    "reason": "Perdagangan eceran non-spesifik umumnya menjual barang/jasa ke konsumen akhir.",
    "reviewNote": ""
  },
  {
    "code": "47891",
    "title": "PERDAGANGAN ECERAN KAKI LIMA DAN LOS PASAR HEWAN HIDUP",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "Consumer Non-Cyclicals",
    "reason": "Perdagangan eceran non-spesifik umumnya menjual barang/jasa ke konsumen akhir.",
    "reviewNote": ""
  },
  {
    "code": "47892",
    "title": "PERDAGANGAN ECERAN KAKI LIMA DAN LOS PASAR BAHAN BAKAR MINYAK, GAS, MINYAK PELUMAS DAN BAHAN BAKAR LAINNYA",
    "sector": "Energy",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Perdagangan bahan bakar, minyak/gas, atau batu bara mengikuti sektor Energy.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "47893",
    "title": "PERDAGANGAN ECERAN KAKI LIMA DAN LOS PASAR BARANG ANTIK",
    "sector": "Basic Materials",
    "confidence": "Medium",
    "alternativeSector": "Consumer Cyclicals",
    "reason": "Produk yang diperdagangkan berupa material/bahan baku industri.",
    "reviewNote": ""
  },
  {
    "code": "47894",
    "title": "PERDAGANGAN ECERAN KAKI LIMA DAN LOS PASAR BARANG BEKAS PERLENGKAPAN RUMAH TANGGA",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Produk/jasa yang diperdagangkan adalah barang/jasa konsumen sekunder atau siklis.",
    "reviewNote": ""
  },
  {
    "code": "47895",
    "title": "PERDAGANGAN ECERAN KAKI LIMA DAN LOS PASAR PAKAIAN, ALAS KAKI, PERLENGKAPAN PAKAIAN DAN BARANG PERLENGKAPAN PRIBADI BEKAS",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Produk/jasa yang diperdagangkan adalah barang/jasa konsumen sekunder atau siklis.",
    "reviewNote": ""
  },
  {
    "code": "47896",
    "title": "PERDAGANGAN ECERAN KAKI LIMA DAN LOS PASAR BARANG LISTRIK DAN ELEKTRONIK BEKAS",
    "sector": "Technology",
    "confidence": "Medium",
    "alternativeSector": "Consumer Cyclicals",
    "reason": "Perdagangan komputer, perangkat lunak, elektronik, atau perangkat jaringan mengikuti Technology.",
    "reviewNote": ""
  },
  {
    "code": "47897",
    "title": "PERDAGANGAN ECERAN KAKI LIMA DAN LOS PASAR BARANG BEKAS CAMPURAN",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "Consumer Non-Cyclicals",
    "reason": "Perdagangan eceran non-spesifik umumnya menjual barang/jasa ke konsumen akhir.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "47899",
    "title": "PERDAGANGAN ECERAN KAKI LIMA DAN LOS PASAR BARANG LAINNYA",
    "sector": "Consumer Non-Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Produk yang diperdagangkan adalah pangan, barang pokok, personal care, atau non-durable.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "47911",
    "title": "PERDAGANGAN ECERAN MELALUI MEDIA UNTUK KOMODITI MAKANAN, MINUMAN, TEMBAKAU, KIMIA, FARMASI, KOSMETIK DAN ALAT LABORATORIUM",
    "sector": "Healthcare",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Perdagangan obat, farmasi, atau alat kesehatan mengikuti sektor Healthcare.",
    "reviewNote": ""
  },
  {
    "code": "47912",
    "title": "PERDAGANGAN ECERAN MELALUI MEDIA UNTUK KOMODITI TEKSTIL, PAKAIAN, ALAS KAKI DAN BARANG KEPERLUAN PRIBADI",
    "sector": "Technology",
    "confidence": "Medium",
    "alternativeSector": "Consumer Cyclicals",
    "reason": "Perdagangan komputer, perangkat lunak, elektronik, atau perangkat jaringan mengikuti Technology.",
    "reviewNote": ""
  },
  {
    "code": "47913",
    "title": "PERDAGANGAN ECERAN MELALUI MEDIA UNTUK BARANG PERLENGKAPAN RUMAH TANGGA DAN PERLENGKAPAN DAPUR",
    "sector": "Technology",
    "confidence": "Medium",
    "alternativeSector": "Consumer Cyclicals",
    "reason": "Perdagangan komputer, perangkat lunak, elektronik, atau perangkat jaringan mengikuti Technology.",
    "reviewNote": ""
  },
  {
    "code": "47914",
    "title": "PERDAGANGAN ECERAN MELALUI MEDIA UNTUK BARANG CAMPURAN SEBAGAIMANA TERSEBUT DALAM 47911 S.D. 47913",
    "sector": "Technology",
    "confidence": "Medium",
    "alternativeSector": "Consumer Cyclicals",
    "reason": "Perdagangan komputer, perangkat lunak, elektronik, atau perangkat jaringan mengikuti Technology.",
    "reviewNote": ""
  },
  {
    "code": "47919",
    "title": "PERDAGANGAN ECERAN MELALUI MEDIA UNTUK BERBAGAI MACAM BARANG LAINNYA",
    "sector": "Technology",
    "confidence": "Medium",
    "alternativeSector": "Consumer Cyclicals",
    "reason": "Perdagangan komputer, perangkat lunak, elektronik, atau perangkat jaringan mengikuti Technology.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "47920",
    "title": "PERDAGANGAN ECERAN ATAS DASAR BALAS JASA (FEE) ATAU KONTRAK",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "Consumer Non-Cyclicals",
    "reason": "Perdagangan eceran non-spesifik umumnya menjual barang/jasa ke konsumen akhir.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "47991",
    "title": "PERDAGANGAN ECERAN KELILING KOMODITI MAKANAN DARI HASIL PERTANIAN",
    "sector": "Technology",
    "confidence": "Medium",
    "alternativeSector": "Consumer Cyclicals",
    "reason": "Perdagangan komputer, perangkat lunak, elektronik, atau perangkat jaringan mengikuti Technology.",
    "reviewNote": ""
  },
  {
    "code": "47992",
    "title": "PERDAGANGAN ECERAN KELILING KOMODITI MAKANAN, MINUMAN ATAU TEMBAKAU HASIL INDUSTRI PENGOLAHAN",
    "sector": "Technology",
    "confidence": "Medium",
    "alternativeSector": "Consumer Cyclicals",
    "reason": "Perdagangan komputer, perangkat lunak, elektronik, atau perangkat jaringan mengikuti Technology.",
    "reviewNote": ""
  },
  {
    "code": "47993",
    "title": "PERDAGANGAN ECERAN KELILING BAHAN KIMIA, FARMASI, KOSMETIK DAN ALAT LABORATORIUM",
    "sector": "Healthcare",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Perdagangan obat, farmasi, atau alat kesehatan mengikuti sektor Healthcare.",
    "reviewNote": ""
  },
  {
    "code": "47994",
    "title": "PERDAGANGAN ECERAN KELILING TEKSTIL, PAKAIAN, ALAS KAKI DAN BARANG KEPERLUAN PRIBADI",
    "sector": "Technology",
    "confidence": "Medium",
    "alternativeSector": "Consumer Cyclicals",
    "reason": "Perdagangan komputer, perangkat lunak, elektronik, atau perangkat jaringan mengikuti Technology.",
    "reviewNote": ""
  },
  {
    "code": "47995",
    "title": "PERDAGANGAN ECERAN KELILING PERLENGKAPAN RUMAH TANGGA DAN PERLENGKAPAN DAPUR",
    "sector": "Technology",
    "confidence": "Medium",
    "alternativeSector": "Consumer Cyclicals",
    "reason": "Perdagangan komputer, perangkat lunak, elektronik, atau perangkat jaringan mengikuti Technology.",
    "reviewNote": ""
  },
  {
    "code": "47996",
    "title": "PERDAGANGAN ECERAN KELILING BAHAN BAKAR DAN MINYAK PELUMAS",
    "sector": "Energy",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Perdagangan bahan bakar, minyak/gas, atau batu bara mengikuti sektor Energy.",
    "reviewNote": ""
  },
  {
    "code": "47997",
    "title": "PERDAGANGAN ECERAN KELILING KERTAS, BARANG DARI KERTAS, ALAT TULIS, BARANG CETAKAN, ALAT OLAHRAGA, ALAT MUSIK, ALAT FOTOGRAFI DAN KOMPUTER",
    "sector": "Technology",
    "confidence": "Medium",
    "alternativeSector": "Consumer Cyclicals",
    "reason": "Perdagangan komputer, perangkat lunak, elektronik, atau perangkat jaringan mengikuti Technology.",
    "reviewNote": ""
  },
  {
    "code": "47998",
    "title": "PERDAGANGAN ECERAN KELILING BARANG KERAJINAN, MAINAN ANAK-ANAK DAN LUKISAN",
    "sector": "Technology",
    "confidence": "Medium",
    "alternativeSector": "Consumer Cyclicals",
    "reason": "Perdagangan komputer, perangkat lunak, elektronik, atau perangkat jaringan mengikuti Technology.",
    "reviewNote": ""
  },
  {
    "code": "47999",
    "title": "PERDAGANGAN ECERAN BUKAN DI TOKO, KIOS, KAKI LIMA DAN LOS PASAR LAINNYA YTDL",
    "sector": "Technology",
    "confidence": "Medium",
    "alternativeSector": "Consumer Cyclicals",
    "reason": "Perdagangan komputer, perangkat lunak, elektronik, atau perangkat jaringan mengikuti Technology.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "49110",
    "title": "ANGKUTAN JALAN REL UNTUK PENUMPANG",
    "sector": "Transportation & Logistic",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 49-53 adalah pengangkutan, pergudangan, logistik, pos, dan kurir.",
    "reviewNote": ""
  },
  {
    "code": "49120",
    "title": "ANGKUTAN JALAN REL UNTUK BARANG",
    "sector": "Transportation & Logistic",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Divisi 49-53 adalah pengangkutan, pergudangan, logistik, pos, dan kurir.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "49211",
    "title": "ANGKUTAN BUS ANTARKOTA ANTARPROVINSI (AKAP)",
    "sector": "Transportation & Logistic",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 49-53 adalah pengangkutan, pergudangan, logistik, pos, dan kurir.",
    "reviewNote": ""
  },
  {
    "code": "49212",
    "title": "ANGKUTAN BUS PERBATASAN",
    "sector": "Transportation & Logistic",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 49-53 adalah pengangkutan, pergudangan, logistik, pos, dan kurir.",
    "reviewNote": ""
  },
  {
    "code": "49213",
    "title": "ANGKUTAN BUS ANTARKOTA DALAM PROVINSI (AKDP)",
    "sector": "Transportation & Logistic",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 49-53 adalah pengangkutan, pergudangan, logistik, pos, dan kurir.",
    "reviewNote": ""
  },
  {
    "code": "49214",
    "title": "ANGKUTAN BUS KOTA",
    "sector": "Transportation & Logistic",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 49-53 adalah pengangkutan, pergudangan, logistik, pos, dan kurir.",
    "reviewNote": ""
  },
  {
    "code": "49215",
    "title": "ANGKUTAN BUS LINTAS BATAS NEGARA",
    "sector": "Transportation & Logistic",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 49-53 adalah pengangkutan, pergudangan, logistik, pos, dan kurir.",
    "reviewNote": ""
  },
  {
    "code": "49216",
    "title": "ANGKUTAN BUS KHUSUS",
    "sector": "Transportation & Logistic",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 49-53 adalah pengangkutan, pergudangan, logistik, pos, dan kurir.",
    "reviewNote": ""
  },
  {
    "code": "49219",
    "title": "ANGKUTAN BUS DALAM TRAYEK LAINNYA",
    "sector": "Transportation & Logistic",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Divisi 49-53 adalah pengangkutan, pergudangan, logistik, pos, dan kurir.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "49221",
    "title": "ANGKUTAN BUS PARIWISATA",
    "sector": "Transportation & Logistic",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 49-53 adalah pengangkutan, pergudangan, logistik, pos, dan kurir.",
    "reviewNote": ""
  },
  {
    "code": "49229",
    "title": "ANGKUTAN BUS TIDAK DALAM TRAYEK LAINNYA",
    "sector": "Transportation & Logistic",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Divisi 49-53 adalah pengangkutan, pergudangan, logistik, pos, dan kurir.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "49300",
    "title": "ANGKUTAN MELALUI SALURAN PIPA",
    "sector": "Transportation & Logistic",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Divisi 49-53 adalah pengangkutan, pergudangan, logistik, pos, dan kurir.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "49411",
    "title": "ANGKUTAN PERBATASAN BUKAN BUS, DALAM TRAYEK",
    "sector": "Transportation & Logistic",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 49-53 adalah pengangkutan, pergudangan, logistik, pos, dan kurir.",
    "reviewNote": ""
  },
  {
    "code": "49412",
    "title": "ANGKUTAN ANTARKOTA DALAM PROVINSI (AKDP) BUKAN BUS, DALAM TRAYEK",
    "sector": "Transportation & Logistic",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 49-53 adalah pengangkutan, pergudangan, logistik, pos, dan kurir.",
    "reviewNote": ""
  },
  {
    "code": "49413",
    "title": "ANGKUTAN PERKOTAAN BUKAN BUS, DALAM TRAYEK",
    "sector": "Transportation & Logistic",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 49-53 adalah pengangkutan, pergudangan, logistik, pos, dan kurir.",
    "reviewNote": ""
  },
  {
    "code": "49414",
    "title": "ANGKUTAN PERDESAAN BUKAN BUS, DALAM TRAYEK",
    "sector": "Transportation & Logistic",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 49-53 adalah pengangkutan, pergudangan, logistik, pos, dan kurir.",
    "reviewNote": ""
  },
  {
    "code": "49415",
    "title": "ANGKUTAN DARAT KHUSUS BUKAN BUS",
    "sector": "Transportation & Logistic",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 49-53 adalah pengangkutan, pergudangan, logistik, pos, dan kurir.",
    "reviewNote": ""
  },
  {
    "code": "49419",
    "title": "ANGKUTAN DARAT BUKAN BUS UNTUK PENUMPANG LAINNYA, DALAM TRAYEK",
    "sector": "Transportation & Logistic",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Divisi 49-53 adalah pengangkutan, pergudangan, logistik, pos, dan kurir.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "49421",
    "title": "ANGKUTAN TAKSI",
    "sector": "Transportation & Logistic",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 49-53 adalah pengangkutan, pergudangan, logistik, pos, dan kurir.",
    "reviewNote": ""
  },
  {
    "code": "49422",
    "title": "ANGKUTAN SEWA",
    "sector": "Transportation & Logistic",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Divisi 49-53 adalah pengangkutan, pergudangan, logistik, pos, dan kurir.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "49423",
    "title": "ANGKUTAN TIDAK BERMOTOR UNTUK PENUMPANG",
    "sector": "Transportation & Logistic",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 49-53 adalah pengangkutan, pergudangan, logistik, pos, dan kurir.",
    "reviewNote": ""
  },
  {
    "code": "49424",
    "title": "ANGKUTAN OJEK MOTOR",
    "sector": "Transportation & Logistic",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 49-53 adalah pengangkutan, pergudangan, logistik, pos, dan kurir.",
    "reviewNote": ""
  },
  {
    "code": "49425",
    "title": "ANGKUTAN DARAT WISATA",
    "sector": "Transportation & Logistic",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 49-53 adalah pengangkutan, pergudangan, logistik, pos, dan kurir.",
    "reviewNote": ""
  },
  {
    "code": "49426",
    "title": "ANGKUTAN SEWA KHUSUS",
    "sector": "Transportation & Logistic",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Divisi 49-53 adalah pengangkutan, pergudangan, logistik, pos, dan kurir.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "49429",
    "title": "ANGKUTAN DARAT LAINNYA UNTUK PENUMPANG",
    "sector": "Transportation & Logistic",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Divisi 49-53 adalah pengangkutan, pergudangan, logistik, pos, dan kurir.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "49431",
    "title": "ANGKUTAN BERMOTOR UNTUK BARANG UMUM",
    "sector": "Transportation & Logistic",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 49-53 adalah pengangkutan, pergudangan, logistik, pos, dan kurir.",
    "reviewNote": ""
  },
  {
    "code": "49432",
    "title": "ANGKUTAN BERMOTOR UNTUK BARANG KHUSUS",
    "sector": "Transportation & Logistic",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 49-53 adalah pengangkutan, pergudangan, logistik, pos, dan kurir.",
    "reviewNote": ""
  },
  {
    "code": "49433",
    "title": "ANGKUTAN TIDAK BERMOTOR UNTUK BARANG UMUM",
    "sector": "Transportation & Logistic",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 49-53 adalah pengangkutan, pergudangan, logistik, pos, dan kurir.",
    "reviewNote": ""
  },
  {
    "code": "49441",
    "title": "ANGKUTAN JALAN REL PERKOTAAN",
    "sector": "Transportation & Logistic",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Divisi 49-53 adalah pengangkutan, pergudangan, logistik, pos, dan kurir.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "49442",
    "title": "ANGKUTAN JALAN REL WISATA",
    "sector": "Transportation & Logistic",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 49-53 adalah pengangkutan, pergudangan, logistik, pos, dan kurir.",
    "reviewNote": ""
  },
  {
    "code": "49450",
    "title": "ANGKUTAN JALAN REL LAINNYA",
    "sector": "Transportation & Logistic",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Divisi 49-53 adalah pengangkutan, pergudangan, logistik, pos, dan kurir.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "50111",
    "title": "ANGKUTAN LAUT DALAM NEGERI LINER DAN TRAMPER UNTUK PENUMPANG",
    "sector": "Transportation & Logistic",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Divisi 49-53 adalah pengangkutan, pergudangan, logistik, pos, dan kurir.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "50112",
    "title": "ANGKUTAN LAUT PERAIRAN PELABUHAN DALAM NEGERI UNTUK PENUMPANG",
    "sector": "Transportation & Logistic",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Divisi 49-53 adalah pengangkutan, pergudangan, logistik, pos, dan kurir.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "50113",
    "title": "ANGKUTAN LAUT DALAM NEGERI UNTUK WISATA",
    "sector": "Transportation & Logistic",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 49-53 adalah pengangkutan, pergudangan, logistik, pos, dan kurir.",
    "reviewNote": ""
  },
  {
    "code": "50114",
    "title": "ANGKUTAN LAUT DALAM NEGERI PERINTIS UNTUK PENUMPANG",
    "sector": "Transportation & Logistic",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 49-53 adalah pengangkutan, pergudangan, logistik, pos, dan kurir.",
    "reviewNote": ""
  },
  {
    "code": "50121",
    "title": "ANGKUTAN LAUT LUAR NEGERI LINER DAN TRAMPER UNTUK PENUMPANG",
    "sector": "Transportation & Logistic",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 49-53 adalah pengangkutan, pergudangan, logistik, pos, dan kurir.",
    "reviewNote": ""
  },
  {
    "code": "50122",
    "title": "ANGKUTAN LAUT LUAR NEGERI UNTUK WISATA",
    "sector": "Transportation & Logistic",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 49-53 adalah pengangkutan, pergudangan, logistik, pos, dan kurir.",
    "reviewNote": ""
  },
  {
    "code": "50131",
    "title": "ANGKUTAN LAUT DALAM NEGERI UNTUK BARANG UMUM",
    "sector": "Transportation & Logistic",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 49-53 adalah pengangkutan, pergudangan, logistik, pos, dan kurir.",
    "reviewNote": ""
  },
  {
    "code": "50132",
    "title": "ANGKUTAN LAUT PERAIRAN PELABUHAN DALAM NEGERI UNTUK BARANG",
    "sector": "Transportation & Logistic",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Divisi 49-53 adalah pengangkutan, pergudangan, logistik, pos, dan kurir.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "50133",
    "title": "ANGKUTAN LAUT DALAM NEGERI UNTUK BARANG KHUSUS",
    "sector": "Transportation & Logistic",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 49-53 adalah pengangkutan, pergudangan, logistik, pos, dan kurir.",
    "reviewNote": ""
  },
  {
    "code": "50134",
    "title": "ANGKUTAN LAUT DALAM NEGERI PERINTIS UNTUK BARANG",
    "sector": "Transportation & Logistic",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 49-53 adalah pengangkutan, pergudangan, logistik, pos, dan kurir.",
    "reviewNote": ""
  },
  {
    "code": "50135",
    "title": "ANGKUTAN LAUT DALAM NEGERI PELAYARAN RAKYAT",
    "sector": "Transportation & Logistic",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 49-53 adalah pengangkutan, pergudangan, logistik, pos, dan kurir.",
    "reviewNote": ""
  },
  {
    "code": "50141",
    "title": "ANGKUTAN LAUT LUAR NEGERI UNTUK BARANG UMUM",
    "sector": "Transportation & Logistic",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 49-53 adalah pengangkutan, pergudangan, logistik, pos, dan kurir.",
    "reviewNote": ""
  },
  {
    "code": "50142",
    "title": "ANGKUTAN LAUT LUAR NEGERI UNTUK BARANG KHUSUS",
    "sector": "Transportation & Logistic",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 49-53 adalah pengangkutan, pergudangan, logistik, pos, dan kurir.",
    "reviewNote": ""
  },
  {
    "code": "50143",
    "title": "ANGKUTAN LAUT LUAR NEGERI PELAYARAN RAKYAT",
    "sector": "Transportation & Logistic",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 49-53 adalah pengangkutan, pergudangan, logistik, pos, dan kurir.",
    "reviewNote": ""
  },
  {
    "code": "50211",
    "title": "ANGKUTAN SUNGAI DAN DANAU LINER (TRAYEK TETAP DAN TERATUR) UNTUK PENUMPANG",
    "sector": "Transportation & Logistic",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 49-53 adalah pengangkutan, pergudangan, logistik, pos, dan kurir.",
    "reviewNote": ""
  },
  {
    "code": "50212",
    "title": "ANGKUTAN SUNGAI DAN DANAU TRAMPER (TRAYEK TIDAK TETAP DAN TIDAK TERATUR) UNTUK PENUMPANG",
    "sector": "Transportation & Logistic",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 49-53 adalah pengangkutan, pergudangan, logistik, pos, dan kurir.",
    "reviewNote": ""
  },
  {
    "code": "50213",
    "title": "ANGKUTAN SUNGAI DAN DANAU UNTUK WISATA DAN YBDI",
    "sector": "Transportation & Logistic",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 49-53 adalah pengangkutan, pergudangan, logistik, pos, dan kurir.",
    "reviewNote": ""
  },
  {
    "code": "50214",
    "title": "ANGKUTAN PENYEBERANGAN ANTARPROVINSI UNTUK PENUMPANG",
    "sector": "Transportation & Logistic",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 49-53 adalah pengangkutan, pergudangan, logistik, pos, dan kurir.",
    "reviewNote": ""
  },
  {
    "code": "50215",
    "title": "ANGKUTAN PENYEBERANGAN PERINTIS ANTARPROVINSI UNTUK PENUMPANG",
    "sector": "Transportation & Logistic",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 49-53 adalah pengangkutan, pergudangan, logistik, pos, dan kurir.",
    "reviewNote": ""
  },
  {
    "code": "50216",
    "title": "ANGKUTAN PENYEBERANGAN ANTARKABUPATEN/KOTA UNTUK PENUMPANG",
    "sector": "Transportation & Logistic",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 49-53 adalah pengangkutan, pergudangan, logistik, pos, dan kurir.",
    "reviewNote": ""
  },
  {
    "code": "50217",
    "title": "ANGKUTAN PENYEBERANGAN PERINTIS ANTARKABUPATEN/KOTA UNTUK PENUMPANG",
    "sector": "Transportation & Logistic",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 49-53 adalah pengangkutan, pergudangan, logistik, pos, dan kurir.",
    "reviewNote": ""
  },
  {
    "code": "50218",
    "title": "ANGKUTAN PENYEBERANGAN DALAM KABUPATEN/KOTA UNTUK PENUMPANG",
    "sector": "Transportation & Logistic",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 49-53 adalah pengangkutan, pergudangan, logistik, pos, dan kurir.",
    "reviewNote": ""
  },
  {
    "code": "50219",
    "title": "ANGKUTAN PENYEBERANGAN LAINNYA UNTUK PENUMPANG TERMASUK PENYEBERANGAN ANTARNEGARA",
    "sector": "Transportation & Logistic",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Divisi 49-53 adalah pengangkutan, pergudangan, logistik, pos, dan kurir.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "50221",
    "title": "ANGKUTAN SUNGAI DAN DANAU UNTUK BARANG UMUM DAN/ATAU HEWAN",
    "sector": "Transportation & Logistic",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 49-53 adalah pengangkutan, pergudangan, logistik, pos, dan kurir.",
    "reviewNote": ""
  },
  {
    "code": "50222",
    "title": "ANGKUTAN SUNGAI DAN DANAU UNTUK BARANG KHUSUS",
    "sector": "Transportation & Logistic",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Divisi 49-53 adalah pengangkutan, pergudangan, logistik, pos, dan kurir.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "50223",
    "title": "ANGKUTAN SUNGAI DAN DANAU UNTUK BARANG BERBAHAYA",
    "sector": "Transportation & Logistic",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 49-53 adalah pengangkutan, pergudangan, logistik, pos, dan kurir.",
    "reviewNote": ""
  },
  {
    "code": "50224",
    "title": "ANGKUTAN PENYEBERANGAN UMUM ANTARPROVINSI UNTUK BARANG",
    "sector": "Transportation & Logistic",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 49-53 adalah pengangkutan, pergudangan, logistik, pos, dan kurir.",
    "reviewNote": ""
  },
  {
    "code": "50225",
    "title": "ANGKUTAN PENYEBERANGAN PERINTIS ANTARPROVINSI UNTUK BARANG",
    "sector": "Transportation & Logistic",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 49-53 adalah pengangkutan, pergudangan, logistik, pos, dan kurir.",
    "reviewNote": ""
  },
  {
    "code": "50226",
    "title": "ANGKUTAN PENYEBERANGAN UMUM ANTARKABUPATEN/KOTA UNTUK BARANG",
    "sector": "Transportation & Logistic",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 49-53 adalah pengangkutan, pergudangan, logistik, pos, dan kurir.",
    "reviewNote": ""
  },
  {
    "code": "50227",
    "title": "ANGKUTAN PENYEBERANGAN PERINTIS ANTARKABUPATEN/KOTA UNTUK BARANG",
    "sector": "Transportation & Logistic",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 49-53 adalah pengangkutan, pergudangan, logistik, pos, dan kurir.",
    "reviewNote": ""
  },
  {
    "code": "50228",
    "title": "ANGKUTAN PENYEBERANGAN UMUM DALAM KABUPATEN/KOTA UNTUK BARANG",
    "sector": "Transportation & Logistic",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 49-53 adalah pengangkutan, pergudangan, logistik, pos, dan kurir.",
    "reviewNote": ""
  },
  {
    "code": "50229",
    "title": "ANGKUTAN PENYEBERANGAN LAINNYA UNTUK BARANG TERMASUK PENYEBERANGAN ANTARNEGARA",
    "sector": "Transportation & Logistic",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Divisi 49-53 adalah pengangkutan, pergudangan, logistik, pos, dan kurir.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "51101",
    "title": "ANGKUTAN UDARA NIAGA BERJADWAL DALAM NEGERI UNTUK PENUMPANG ATAU PENUMPANG DAN KARGO",
    "sector": "Transportation & Logistic",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 49-53 adalah pengangkutan, pergudangan, logistik, pos, dan kurir.",
    "reviewNote": ""
  },
  {
    "code": "51102",
    "title": "ANGKUTAN UDARA NIAGA TIDAK BERJADWAL DALAM NEGERI UNTUK PENUMPANG ATAU PENUMPANG DAN KARGO",
    "sector": "Transportation & Logistic",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 49-53 adalah pengangkutan, pergudangan, logistik, pos, dan kurir.",
    "reviewNote": ""
  },
  {
    "code": "51103",
    "title": "ANGKUTAN UDARA NIAGA BERJADWAL LUAR NEGERI UNTUK PENUMPANG ATAU PENUMPANG DAN KARGO",
    "sector": "Transportation & Logistic",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 49-53 adalah pengangkutan, pergudangan, logistik, pos, dan kurir.",
    "reviewNote": ""
  },
  {
    "code": "51104",
    "title": "ANGKUTAN UDARA NIAGA TIDAK BERJADWAL LUAR NEGERI UNTUK PENUMPANG ATAU PENUMPANG DAN KARGO",
    "sector": "Transportation & Logistic",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 49-53 adalah pengangkutan, pergudangan, logistik, pos, dan kurir.",
    "reviewNote": ""
  },
  {
    "code": "51105",
    "title": "ANGKUTAN UDARA NIAGA TIDAK BERJADWAL LAINNYA",
    "sector": "Transportation & Logistic",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Divisi 49-53 adalah pengangkutan, pergudangan, logistik, pos, dan kurir.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "51106",
    "title": "ANGKUTAN UDARA UNTUK OLAHRAGA",
    "sector": "Transportation & Logistic",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 49-53 adalah pengangkutan, pergudangan, logistik, pos, dan kurir.",
    "reviewNote": ""
  },
  {
    "code": "51107",
    "title": "ANGKUTAN UDARA UNTUK WISATA",
    "sector": "Transportation & Logistic",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 49-53 adalah pengangkutan, pergudangan, logistik, pos, dan kurir.",
    "reviewNote": ""
  },
  {
    "code": "51108",
    "title": "ANGKUTAN UDARA BUKAN NIAGA",
    "sector": "Transportation & Logistic",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Divisi 49-53 adalah pengangkutan, pergudangan, logistik, pos, dan kurir.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "51109",
    "title": "ANGKUTAN UDARA UNTUK PENUMPANG LAINNYA",
    "sector": "Transportation & Logistic",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Divisi 49-53 adalah pengangkutan, pergudangan, logistik, pos, dan kurir.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "51201",
    "title": "ANGKUTAN UDARA NIAGA BERJADWAL DALAM NEGERI UNTUK KARGO",
    "sector": "Transportation & Logistic",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 49-53 adalah pengangkutan, pergudangan, logistik, pos, dan kurir.",
    "reviewNote": ""
  },
  {
    "code": "51202",
    "title": "ANGKUTAN UDARA NIAGA TIDAK BERJADWAL DALAM NEGERI UNTUK KARGO",
    "sector": "Transportation & Logistic",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 49-53 adalah pengangkutan, pergudangan, logistik, pos, dan kurir.",
    "reviewNote": ""
  },
  {
    "code": "51203",
    "title": "ANGKUTAN UDARA NIAGA BERJADWAL LUAR NEGERI UNTUK KARGO",
    "sector": "Transportation & Logistic",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 49-53 adalah pengangkutan, pergudangan, logistik, pos, dan kurir.",
    "reviewNote": ""
  },
  {
    "code": "51204",
    "title": "ANGKUTAN UDARA NIAGA TIDAK BERJADWAL LUAR NEGERI UNTUK KARGO",
    "sector": "Transportation & Logistic",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 49-53 adalah pengangkutan, pergudangan, logistik, pos, dan kurir.",
    "reviewNote": ""
  },
  {
    "code": "52101",
    "title": "PERGUDANGAN DAN PENYIMPANAN",
    "sector": "Transportation & Logistic",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 49-53 adalah pengangkutan, pergudangan, logistik, pos, dan kurir.",
    "reviewNote": ""
  },
  {
    "code": "52102",
    "title": "AKTIVITAS COLD STORAGE",
    "sector": "Transportation & Logistic",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Divisi 49-53 adalah pengangkutan, pergudangan, logistik, pos, dan kurir.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "52103",
    "title": "AKTIVITAS BOUNDED WAREHOUSING ATAU WILAYAH KAWASAN BERIKAT",
    "sector": "Transportation & Logistic",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 49-53 adalah pengangkutan, pergudangan, logistik, pos, dan kurir.",
    "reviewNote": ""
  },
  {
    "code": "52104",
    "title": "PENYIMPANAN MINYAK DAN GAS BUMI",
    "sector": "Transportation & Logistic",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 49-53 adalah pengangkutan, pergudangan, logistik, pos, dan kurir.",
    "reviewNote": ""
  },
  {
    "code": "52105",
    "title": "AKTIVITAS PENYIMPANAN B3",
    "sector": "Transportation & Logistic",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 49-53 adalah pengangkutan, pergudangan, logistik, pos, dan kurir.",
    "reviewNote": ""
  },
  {
    "code": "52106",
    "title": "FASILITAS PENYIMPANAN SUMBER RADIASI PENGION",
    "sector": "Transportation & Logistic",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 49-53 adalah pengangkutan, pergudangan, logistik, pos, dan kurir.",
    "reviewNote": ""
  },
  {
    "code": "52107",
    "title": "PENYIMPANAN YANG TERMASUK DALAM NATURALLY OCCURING RADIOACTIVE MATERIAL (NORM)",
    "sector": "Transportation & Logistic",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 49-53 adalah pengangkutan, pergudangan, logistik, pos, dan kurir.",
    "reviewNote": ""
  },
  {
    "code": "52108",
    "title": "PENGELOLA GUDANG SISTEM RESI GUDANG",
    "sector": "Transportation & Logistic",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 49-53 adalah pengangkutan, pergudangan, logistik, pos, dan kurir.",
    "reviewNote": ""
  },
  {
    "code": "52109",
    "title": "PERGUDANGAN DAN PENYIMPANAN LAINNYA",
    "sector": "Transportation & Logistic",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Divisi 49-53 adalah pengangkutan, pergudangan, logistik, pos, dan kurir.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "52211",
    "title": "AKTIVITAS TERMINAL DARAT",
    "sector": "Transportation & Logistic",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 49-53 adalah pengangkutan, pergudangan, logistik, pos, dan kurir.",
    "reviewNote": ""
  },
  {
    "code": "52212",
    "title": "AKTIVITAS STASIUN KERETA API",
    "sector": "Transportation & Logistic",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 49-53 adalah pengangkutan, pergudangan, logistik, pos, dan kurir.",
    "reviewNote": ""
  },
  {
    "code": "52213",
    "title": "AKTIVITAS JALAN TOL",
    "sector": "Transportation & Logistic",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 49-53 adalah pengangkutan, pergudangan, logistik, pos, dan kurir.",
    "reviewNote": ""
  },
  {
    "code": "52214",
    "title": "AKTIVITAS PERPARKIRAN DI BADAN JALAN (ON STREET PARKING)",
    "sector": "Transportation & Logistic",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 49-53 adalah pengangkutan, pergudangan, logistik, pos, dan kurir.",
    "reviewNote": ""
  },
  {
    "code": "52215",
    "title": "AKTIVITAS PERPARKIRAN DI LUAR BADAN JALAN (OFF STREET PARKING)",
    "sector": "Transportation & Logistic",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Divisi 49-53 adalah pengangkutan, pergudangan, logistik, pos, dan kurir.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "52219",
    "title": "AKTIVITAS PENUNJANG ANGKUTAN DARAT LAINNYA",
    "sector": "Transportation & Logistic",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Divisi 49-53 adalah pengangkutan, pergudangan, logistik, pos, dan kurir.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "52221",
    "title": "AKTIVITAS PELAYANAN KEPELABUHANAN LAUT",
    "sector": "Transportation & Logistic",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 49-53 adalah pengangkutan, pergudangan, logistik, pos, dan kurir.",
    "reviewNote": ""
  },
  {
    "code": "52222",
    "title": "AKTIVITAS PELAYANAN KEPELABUHANAN SUNGAI DAN DANAU",
    "sector": "Transportation & Logistic",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 49-53 adalah pengangkutan, pergudangan, logistik, pos, dan kurir.",
    "reviewNote": ""
  },
  {
    "code": "52223",
    "title": "AKTIVITAS PELAYANAN KEPELABUHANAN PENYEBERANGAN",
    "sector": "Transportation & Logistic",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 49-53 adalah pengangkutan, pergudangan, logistik, pos, dan kurir.",
    "reviewNote": ""
  },
  {
    "code": "52224",
    "title": "AKTIVITAS PELABUHAN PERIKANAN",
    "sector": "Transportation & Logistic",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 49-53 adalah pengangkutan, pergudangan, logistik, pos, dan kurir.",
    "reviewNote": ""
  },
  {
    "code": "52225",
    "title": "AKTIVITAS PENGELOLAAN KAPAL",
    "sector": "Transportation & Logistic",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 49-53 adalah pengangkutan, pergudangan, logistik, pos, dan kurir.",
    "reviewNote": ""
  },
  {
    "code": "52229",
    "title": "AKTIVITAS PENUNJANG ANGKUTAN PERAIRAN LAINNYA",
    "sector": "Transportation & Logistic",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Divisi 49-53 adalah pengangkutan, pergudangan, logistik, pos, dan kurir.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "52231",
    "title": "AKTIVITAS KEBANDARUDARAAN",
    "sector": "Transportation & Logistic",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 49-53 adalah pengangkutan, pergudangan, logistik, pos, dan kurir.",
    "reviewNote": ""
  },
  {
    "code": "52232",
    "title": "JASA PELAYANAN NAVIGASI PENERBANGAN",
    "sector": "Transportation & Logistic",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 49-53 adalah pengangkutan, pergudangan, logistik, pos, dan kurir.",
    "reviewNote": ""
  },
  {
    "code": "52240",
    "title": "PENANGANAN KARGO (BONGKAR MUAT BARANG)",
    "sector": "Transportation & Logistic",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Divisi 49-53 adalah pengangkutan, pergudangan, logistik, pos, dan kurir.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "52291",
    "title": "JASA PENGURUSAN TRANSPORTASI (JPT)",
    "sector": "Transportation & Logistic",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 49-53 adalah pengangkutan, pergudangan, logistik, pos, dan kurir.",
    "reviewNote": ""
  },
  {
    "code": "52292",
    "title": "AKTIVITAS EKSPEDISI MUATAN KERETA API DAN EKSPEDISI ANGKUTAN DARAT (EMKA & EAD)",
    "sector": "Transportation & Logistic",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 49-53 adalah pengangkutan, pergudangan, logistik, pos, dan kurir.",
    "reviewNote": ""
  },
  {
    "code": "52293",
    "title": "AKTIVITAS EKSPEDISI MUATAN KAPAL (EMKL)",
    "sector": "Transportation & Logistic",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 49-53 adalah pengangkutan, pergudangan, logistik, pos, dan kurir.",
    "reviewNote": ""
  },
  {
    "code": "52294",
    "title": "AKTIVITAS EKSPEDISI MUATAN PESAWAT UDARA (EMPU)",
    "sector": "Transportation & Logistic",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 49-53 adalah pengangkutan, pergudangan, logistik, pos, dan kurir.",
    "reviewNote": ""
  },
  {
    "code": "52295",
    "title": "ANGKUTAN MULTIMODA",
    "sector": "Transportation & Logistic",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 49-53 adalah pengangkutan, pergudangan, logistik, pos, dan kurir.",
    "reviewNote": ""
  },
  {
    "code": "52296",
    "title": "JASA PENUNJANG ANGKUTAN UDARA",
    "sector": "Transportation & Logistic",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 49-53 adalah pengangkutan, pergudangan, logistik, pos, dan kurir.",
    "reviewNote": ""
  },
  {
    "code": "52297",
    "title": "JASA KEAGENAN KAPAL/AGEN PERKAPALAN PERUSAHAAN PELAYARAN",
    "sector": "Transportation & Logistic",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Divisi 49-53 adalah pengangkutan, pergudangan, logistik, pos, dan kurir.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "52298",
    "title": "AKTIVITAS TALLY MANDIRI",
    "sector": "Transportation & Logistic",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 49-53 adalah pengangkutan, pergudangan, logistik, pos, dan kurir.",
    "reviewNote": ""
  },
  {
    "code": "52299",
    "title": "AKTIVITAS PENUNJANG ANGKUTAN LAINNYA YTDL",
    "sector": "Transportation & Logistic",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Divisi 49-53 adalah pengangkutan, pergudangan, logistik, pos, dan kurir.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "53100",
    "title": "AKTIVITAS POS",
    "sector": "Transportation & Logistic",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 49-53 adalah pengangkutan, pergudangan, logistik, pos, dan kurir.",
    "reviewNote": ""
  },
  {
    "code": "53201",
    "title": "AKTIVITAS KURIR",
    "sector": "Transportation & Logistic",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 49-53 adalah pengangkutan, pergudangan, logistik, pos, dan kurir.",
    "reviewNote": ""
  },
  {
    "code": "53202",
    "title": "AKTIVITAS AGEN KURIR",
    "sector": "Transportation & Logistic",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 49-53 adalah pengangkutan, pergudangan, logistik, pos, dan kurir.",
    "reviewNote": ""
  },
  {
    "code": "55110",
    "title": "HOTEL BINTANG",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Akomodasi, restoran, dan penyediaan makan/minum termasuk hospitality/consumer discretionary.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "55120",
    "title": "HOTEL MELATI",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Akomodasi, restoran, dan penyediaan makan/minum termasuk hospitality/consumer discretionary.",
    "reviewNote": ""
  },
  {
    "code": "55130",
    "title": "PONDOK WISATA",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Akomodasi, restoran, dan penyediaan makan/minum termasuk hospitality/consumer discretionary.",
    "reviewNote": ""
  },
  {
    "code": "55191",
    "title": "PENGINAPAN REMAJA (YOUTH HOSTEL)",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Akomodasi, restoran, dan penyediaan makan/minum termasuk hospitality/consumer discretionary.",
    "reviewNote": ""
  },
  {
    "code": "55192",
    "title": "BUMI PERKEMAHAN, PERSINGGAHAN KARAVAN DAN TAMAN KARAVAN",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Akomodasi, restoran, dan penyediaan makan/minum termasuk hospitality/consumer discretionary.",
    "reviewNote": ""
  },
  {
    "code": "55193",
    "title": "VILA",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Akomodasi, restoran, dan penyediaan makan/minum termasuk hospitality/consumer discretionary.",
    "reviewNote": ""
  },
  {
    "code": "55194",
    "title": "APARTEMEN HOTEL",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Akomodasi, restoran, dan penyediaan makan/minum termasuk hospitality/consumer discretionary.",
    "reviewNote": ""
  },
  {
    "code": "55199",
    "title": "PENYEDIAAN AKOMODASI JANGKA PENDEK LAINNYA",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Akomodasi, restoran, dan penyediaan makan/minum termasuk hospitality/consumer discretionary.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "55900",
    "title": "PENYEDIAAN AKOMODASI LAINNYA",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Akomodasi, restoran, dan penyediaan makan/minum termasuk hospitality/consumer discretionary.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "56101",
    "title": "RESTORAN",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Akomodasi, restoran, dan penyediaan makan/minum termasuk hospitality/consumer discretionary.",
    "reviewNote": ""
  },
  {
    "code": "56102",
    "title": "RUMAH/WARUNG MAKAN",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Akomodasi, restoran, dan penyediaan makan/minum termasuk hospitality/consumer discretionary.",
    "reviewNote": ""
  },
  {
    "code": "56103",
    "title": "KEDAI MAKANAN",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Akomodasi, restoran, dan penyediaan makan/minum termasuk hospitality/consumer discretionary.",
    "reviewNote": ""
  },
  {
    "code": "56104",
    "title": "PENYEDIAAN MAKANAN KELILING/TEMPAT TIDAK TETAP",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Akomodasi, restoran, dan penyediaan makan/minum termasuk hospitality/consumer discretionary.",
    "reviewNote": ""
  },
  {
    "code": "56109",
    "title": "RESTORAN DAN PENYEDIAAN MAKANAN KELILING LAINNYA",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Akomodasi, restoran, dan penyediaan makan/minum termasuk hospitality/consumer discretionary.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "56210",
    "title": "JASA BOGA UNTUK SUATU EVENT TERTENTU (EVENT CATERING)",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Akomodasi, restoran, dan penyediaan makan/minum termasuk hospitality/consumer discretionary.",
    "reviewNote": ""
  },
  {
    "code": "56290",
    "title": "PENYEDIAAN JASA BOGA PERIODE TERTENTU",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Akomodasi, restoran, dan penyediaan makan/minum termasuk hospitality/consumer discretionary.",
    "reviewNote": ""
  },
  {
    "code": "56301",
    "title": "BAR",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Akomodasi, restoran, dan penyediaan makan/minum termasuk hospitality/consumer discretionary.",
    "reviewNote": ""
  },
  {
    "code": "56302",
    "title": "KELAB MALAM ATAU DISKOTEK YANG UTAMANYA MENYEDIAKAN MINUMAN",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Akomodasi, restoran, dan penyediaan makan/minum termasuk hospitality/consumer discretionary.",
    "reviewNote": ""
  },
  {
    "code": "56303",
    "title": "RUMAH MINUM/KAFE",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Akomodasi, restoran, dan penyediaan makan/minum termasuk hospitality/consumer discretionary.",
    "reviewNote": ""
  },
  {
    "code": "56304",
    "title": "KEDAI MINUMAN",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Akomodasi, restoran, dan penyediaan makan/minum termasuk hospitality/consumer discretionary.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "56305",
    "title": "RUMAH/KEDAI OBAT TRADISIONAL",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Akomodasi, restoran, dan penyediaan makan/minum termasuk hospitality/consumer discretionary.",
    "reviewNote": ""
  },
  {
    "code": "56306",
    "title": "PENYEDIAAN MINUMAN KELILING/TEMPAT TIDAK TETAP",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Akomodasi, restoran, dan penyediaan makan/minum termasuk hospitality/consumer discretionary.",
    "reviewNote": ""
  },
  {
    "code": "58110",
    "title": "PENERBITAN BUKU",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "Technology",
    "reason": "Penerbitan buku/media adalah media/consumer discretionary.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "58120",
    "title": "PENERBITAN DIREKTORI DAN MAILING LIST",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "Technology",
    "reason": "Penerbitan buku/media adalah media/consumer discretionary.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "58130",
    "title": "PENERBITAN SURAT KABAR, JURNAL DAN BULETIN ATAU MAJALAH",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "Technology",
    "reason": "Penerbitan buku/media adalah media/consumer discretionary.",
    "reviewNote": ""
  },
  {
    "code": "58190",
    "title": "AKTIVITAS PENERBITAN LAINNYA",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "Technology",
    "reason": "Penerbitan buku/media adalah media/consumer discretionary.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "58200",
    "title": "PENERBITAN PIRANTI LUNAK (SOFTWARE)",
    "sector": "Technology",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Penerbitan perangkat lunak/software masuk Technology.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "59111",
    "title": "AKTIVITAS PRODUKSI FILM, VIDEO DAN PROGRAM TELEVISI OLEH PEMERINTAH",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Produksi film, musik, televisi, radio, dan penyiaran termasuk media/hiburan Consumer Cyclicals.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "59112",
    "title": "AKTIVITAS PRODUKSI FILM, VIDEO DAN PROGRAM TELEVISI OLEH SWASTA",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Produksi film, musik, televisi, radio, dan penyiaran termasuk media/hiburan Consumer Cyclicals.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "59121",
    "title": "AKTIVITAS PASCAPRODUKSI FILM, VIDEO DAN PROGRAM TELEVISI OLEH PEMERINTAH",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Produksi film, musik, televisi, radio, dan penyiaran termasuk media/hiburan Consumer Cyclicals.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "59122",
    "title": "AKTIVITAS PASCAPRODUKSI FILM, VIDEO DAN PROGRAM TELEVISI OLEH SWASTA",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Produksi film, musik, televisi, radio, dan penyiaran termasuk media/hiburan Consumer Cyclicals.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "59131",
    "title": "AKTIVITAS DISTRIBUSI FILM, VIDEO DAN PROGRAM TELEVISI OLEH PEMERINTAH",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Produksi film, musik, televisi, radio, dan penyiaran termasuk media/hiburan Consumer Cyclicals.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "59132",
    "title": "AKTIVITAS DISTRIBUSI FILM, VIDEO DAN PROGRAM TELEVISI OLEH SWASTA",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Produksi film, musik, televisi, radio, dan penyiaran termasuk media/hiburan Consumer Cyclicals.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "59140",
    "title": "AKTIVITAS PEMUTARAN FILM",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Produksi film, musik, televisi, radio, dan penyiaran termasuk media/hiburan Consumer Cyclicals.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "59201",
    "title": "AKTIVITAS PEREKAMAN SUARA",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Produksi film, musik, televisi, radio, dan penyiaran termasuk media/hiburan Consumer Cyclicals.",
    "reviewNote": ""
  },
  {
    "code": "59202",
    "title": "AKTIVITAS PENERBITAN MUSIK DAN BUKU MUSIK",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Produksi film, musik, televisi, radio, dan penyiaran termasuk media/hiburan Consumer Cyclicals.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "60101",
    "title": "PENYIARAN RADIO OLEH PEMERINTAH",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Produksi film, musik, televisi, radio, dan penyiaran termasuk media/hiburan Consumer Cyclicals.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "60102",
    "title": "PENYIARAN RADIO OLEH SWASTA",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Produksi film, musik, televisi, radio, dan penyiaran termasuk media/hiburan Consumer Cyclicals.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "60201",
    "title": "AKTIVITAS PENYIARAN DAN PEMROGRAMAN TELEVISI OLEH PEMERINTAH",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Produksi film, musik, televisi, radio, dan penyiaran termasuk media/hiburan Consumer Cyclicals.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "60202",
    "title": "AKTIVITAS PENYIARAN DAN PEMROGRAMAN TELEVISI OLEH SWASTA",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Produksi film, musik, televisi, radio, dan penyiaran termasuk media/hiburan Consumer Cyclicals.",
    "reviewNote": ""
  },
  {
    "code": "61100",
    "title": "AKTIVITAS TELEKOMUNIKASI DENGAN KABEL",
    "sector": "Infrastructures",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Telekomunikasi adalah infrastruktur jaringan menurut IDX-IC.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "61200",
    "title": "AKTIVITAS TELEKOMUNIKASI TANPA KABEL",
    "sector": "Infrastructures",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Telekomunikasi adalah infrastruktur jaringan menurut IDX-IC.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "61300",
    "title": "AKTIVITAS TELEKOMUNIKASI SATELIT",
    "sector": "Infrastructures",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Telekomunikasi adalah infrastruktur jaringan menurut IDX-IC.",
    "reviewNote": ""
  },
  {
    "code": "61911",
    "title": "JASA PANGGILAN PREMIUM (PREMIUM CALL)",
    "sector": "Infrastructures",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Telekomunikasi adalah infrastruktur jaringan menurut IDX-IC.",
    "reviewNote": ""
  },
  {
    "code": "61912",
    "title": "JASA KONTEN SMS PREMIUM",
    "sector": "Infrastructures",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Telekomunikasi adalah infrastruktur jaringan menurut IDX-IC.",
    "reviewNote": ""
  },
  {
    "code": "61913",
    "title": "JASA INTERNET TELEPONI UNTUK KEPERLUAN PUBLIK (ITKP)",
    "sector": "Infrastructures",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Telekomunikasi adalah infrastruktur jaringan menurut IDX-IC.",
    "reviewNote": ""
  },
  {
    "code": "61914",
    "title": "JASA PANGGILAN TERKELOLA (CALLING CARD)",
    "sector": "Infrastructures",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Telekomunikasi adalah infrastruktur jaringan menurut IDX-IC.",
    "reviewNote": ""
  },
  {
    "code": "61919",
    "title": "JASA NILAI TAMBAH TELEPONI LAINNYA",
    "sector": "Infrastructures",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Telekomunikasi adalah infrastruktur jaringan menurut IDX-IC.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "61921",
    "title": "INTERNET SERVICE PROVIDER",
    "sector": "Infrastructures",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Telekomunikasi adalah infrastruktur jaringan menurut IDX-IC.",
    "reviewNote": ""
  },
  {
    "code": "61922",
    "title": "JASA SISTEM KOMUNIKASI DATA",
    "sector": "Infrastructures",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Telekomunikasi adalah infrastruktur jaringan menurut IDX-IC.",
    "reviewNote": ""
  },
  {
    "code": "61923",
    "title": "JASA TELEVISI PROTOKOL INTERNET (IPTV)",
    "sector": "Infrastructures",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Telekomunikasi adalah infrastruktur jaringan menurut IDX-IC.",
    "reviewNote": ""
  },
  {
    "code": "61924",
    "title": "JASA INTERKONEKSI INTERNET (NAP)",
    "sector": "Infrastructures",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Telekomunikasi adalah infrastruktur jaringan menurut IDX-IC.",
    "reviewNote": ""
  },
  {
    "code": "61929",
    "title": "JASA MULTIMEDIA LAINNYA",
    "sector": "Infrastructures",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Telekomunikasi adalah infrastruktur jaringan menurut IDX-IC.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "61991",
    "title": "AKTIVITAS TELEKOMUNIKASI KHUSUS UNTUK PENYIARAN",
    "sector": "Infrastructures",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Telekomunikasi adalah infrastruktur jaringan menurut IDX-IC.",
    "reviewNote": ""
  },
  {
    "code": "61992",
    "title": "AKTIVITAS TELEKOMUNIKASI KHUSUS UNTUK KEPERLUAN SENDIRI",
    "sector": "Infrastructures",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Telekomunikasi adalah infrastruktur jaringan menurut IDX-IC.",
    "reviewNote": ""
  },
  {
    "code": "61993",
    "title": "AKTIVITAS TELEKOMUNIKASI KHUSUS UNTUK KEPERLUAN PERTAHANAN KEAMANAN",
    "sector": "Infrastructures",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Telekomunikasi adalah infrastruktur jaringan menurut IDX-IC.",
    "reviewNote": ""
  },
  {
    "code": "61994",
    "title": "JASA JUAL KEMBALI JASA TELEKOMUNIKASI",
    "sector": "Infrastructures",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Telekomunikasi adalah infrastruktur jaringan menurut IDX-IC.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "61999",
    "title": "AKTIVITAS TELEKOMUNIKASI LAINNYA YTDL",
    "sector": "Infrastructures",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Telekomunikasi adalah infrastruktur jaringan menurut IDX-IC.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "62011",
    "title": "AKTIVITAS PENGEMBANGAN VIDEO GAME",
    "sector": "Technology",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Pemrograman, konsultasi komputer, data, hosting, portal web, dan jasa informasi digital masuk Technology.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "62012",
    "title": "AKTIVITAS PENGEMBANGAN APLIKASI PERDAGANGAN MELALUI INTERNET (E- COMMERCE)",
    "sector": "Technology",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Pemrograman, konsultasi komputer, data, hosting, portal web, dan jasa informasi digital masuk Technology.",
    "reviewNote": ""
  },
  {
    "code": "62013",
    "title": "AKTIVITAS PEMROGRAMAN DAN PRODUKSI KONTEN MEDIA IMERSIF",
    "sector": "Technology",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Pemrograman, konsultasi komputer, data, hosting, portal web, dan jasa informasi digital masuk Technology.",
    "reviewNote": ""
  },
  {
    "code": "62014",
    "title": "AKTIVITAS PENGEMBANGAN TEKNOLOGI BLOCKCHAIN",
    "sector": "Technology",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Pemrograman, konsultasi komputer, data, hosting, portal web, dan jasa informasi digital masuk Technology.",
    "reviewNote": ""
  },
  {
    "code": "62015",
    "title": "AKTIVITAS PEMROGRAMAN BERBASIS KECERDASAN ARTIFISIAL",
    "sector": "Technology",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Pemrograman, konsultasi komputer, data, hosting, portal web, dan jasa informasi digital masuk Technology.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "62019",
    "title": "AKTIVITAS PEMROGRAMAN KOMPUTER LAINNYA",
    "sector": "Technology",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Pemrograman, konsultasi komputer, data, hosting, portal web, dan jasa informasi digital masuk Technology.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "62021",
    "title": "AKTIVITAS KONSULTASI KEAMANAN INFORMASI",
    "sector": "Technology",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Pemrograman, konsultasi komputer, data, hosting, portal web, dan jasa informasi digital masuk Technology.",
    "reviewNote": ""
  },
  {
    "code": "62022",
    "title": "AKTIVITAS PENYEDIAAN IDENTITAS DIGITAL",
    "sector": "Technology",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Pemrograman, konsultasi komputer, data, hosting, portal web, dan jasa informasi digital masuk Technology.",
    "reviewNote": ""
  },
  {
    "code": "62023",
    "title": "AKTIVITAS PENYEDIAAN SERTIFIKAT ELEKTRONIK DAN LAYANAN YANG MENGGUNAKAN SERTIFIKAT ELEKTRONIK",
    "sector": "Technology",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Pemrograman, konsultasi komputer, data, hosting, portal web, dan jasa informasi digital masuk Technology.",
    "reviewNote": ""
  },
  {
    "code": "62024",
    "title": "AKTIVITAS KONSULTASI DAN PERANCANGAN INTERNET OF THINGS (IOT)",
    "sector": "Technology",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Pemrograman, konsultasi komputer, data, hosting, portal web, dan jasa informasi digital masuk Technology.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "62029",
    "title": "AKTIVITAS KONSULTASI KOMPUTER DAN MANAJEMEN FASILITAS KOMPUTER LAINNYA",
    "sector": "Technology",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Pemrograman, konsultasi komputer, data, hosting, portal web, dan jasa informasi digital masuk Technology.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "62090",
    "title": "AKTIVITAS TEKNOLOGI INFORMASI DAN JASA KOMPUTER LAINNYA",
    "sector": "Technology",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Pemrograman, konsultasi komputer, data, hosting, portal web, dan jasa informasi digital masuk Technology.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "63111",
    "title": "AKTIVITAS PENGOLAHAN DATA",
    "sector": "Technology",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Pemrograman, konsultasi komputer, data, hosting, portal web, dan jasa informasi digital masuk Technology.",
    "reviewNote": ""
  },
  {
    "code": "63112",
    "title": "AKTIVITAS HOSTING DAN YBDI",
    "sector": "Technology",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Pemrograman, konsultasi komputer, data, hosting, portal web, dan jasa informasi digital masuk Technology.",
    "reviewNote": ""
  },
  {
    "code": "63121",
    "title": "PORTAL WEB DAN/ATAU PLATFORM DIGITAL TANPA TUJUAN KOMERSIAL",
    "sector": "Technology",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Pemrograman, konsultasi komputer, data, hosting, portal web, dan jasa informasi digital masuk Technology.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "63122",
    "title": "PORTAL WEB DAN/ATAU PLATFORM DIGITAL DENGAN TUJUAN KOMERSIAL",
    "sector": "Technology",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Pemrograman, konsultasi komputer, data, hosting, portal web, dan jasa informasi digital masuk Technology.",
    "reviewNote": ""
  },
  {
    "code": "63911",
    "title": "AKTIVITAS KANTOR BERITA OLEH PEMERINTAH",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "Technology",
    "reason": "Kantor berita/media informasi lebih dekat ke media Consumer Cyclicals.",
    "reviewNote": ""
  },
  {
    "code": "63912",
    "title": "AKTIVITAS KANTOR BERITA OLEH SWASTA",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "Technology",
    "reason": "Kantor berita/media informasi lebih dekat ke media Consumer Cyclicals.",
    "reviewNote": ""
  },
  {
    "code": "63990",
    "title": "AKTIVITAS JASA INFORMASI LAINNYA YTDL",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "Technology",
    "reason": "Kantor berita/media informasi lebih dekat ke media Consumer Cyclicals.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "64110",
    "title": "BANK SENTRAL",
    "sector": "Financials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 64-66 adalah jasa keuangan, asuransi, dana pensiun, dan penunjangnya.",
    "reviewNote": ""
  },
  {
    "code": "64121",
    "title": "BANK UMUM KONVENSIONAL",
    "sector": "Financials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Divisi 64-66 adalah jasa keuangan, asuransi, dana pensiun, dan penunjangnya.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "64122",
    "title": "BANK UMUM SYARIAH",
    "sector": "Financials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Divisi 64-66 adalah jasa keuangan, asuransi, dana pensiun, dan penunjangnya.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "64123",
    "title": "UNIT USAHA SYARIAH BANK UMUM",
    "sector": "Financials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 64-66 adalah jasa keuangan, asuransi, dana pensiun, dan penunjangnya.",
    "reviewNote": ""
  },
  {
    "code": "64131",
    "title": "BANK PERKREDITAN RAKYAT",
    "sector": "Financials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Divisi 64-66 adalah jasa keuangan, asuransi, dana pensiun, dan penunjangnya.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "64132",
    "title": "BANK PEMBIAYAAN RAKYAT SYARIAH",
    "sector": "Financials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 64-66 adalah jasa keuangan, asuransi, dana pensiun, dan penunjangnya.",
    "reviewNote": ""
  },
  {
    "code": "64141",
    "title": "KOPERASI SIMPAN PINJAM PRIMER (KSP PRIMER)",
    "sector": "Financials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 64-66 adalah jasa keuangan, asuransi, dana pensiun, dan penunjangnya.",
    "reviewNote": ""
  },
  {
    "code": "64142",
    "title": "UNIT SIMPAN PINJAM KOPERASI PRIMER (USP KOPERASI PRIMER)",
    "sector": "Financials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 64-66 adalah jasa keuangan, asuransi, dana pensiun, dan penunjangnya.",
    "reviewNote": ""
  },
  {
    "code": "64143",
    "title": "KOPERASI SIMPAN PINJAM SEKUNDER (KSP SEKUNDER)",
    "sector": "Financials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 64-66 adalah jasa keuangan, asuransi, dana pensiun, dan penunjangnya.",
    "reviewNote": ""
  },
  {
    "code": "64144",
    "title": "UNIT SIMPAN PINJAM KOPERASI SEKUNDER (USP KOPERASI SEKUNDER)",
    "sector": "Financials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 64-66 adalah jasa keuangan, asuransi, dana pensiun, dan penunjangnya.",
    "reviewNote": ""
  },
  {
    "code": "64145",
    "title": "KOPERASI SIMPAN PINJAM DAN PEMBIAYAAN SYARIAH PRIMER (KSPPS PRIMER)",
    "sector": "Financials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 64-66 adalah jasa keuangan, asuransi, dana pensiun, dan penunjangnya.",
    "reviewNote": ""
  },
  {
    "code": "64146",
    "title": "UNIT SIMPAN PINJAM DAN PEMBIAYAAN SYARIAH KOPERASI PRIMER (USPPS KOPERASI PRIMER)",
    "sector": "Financials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 64-66 adalah jasa keuangan, asuransi, dana pensiun, dan penunjangnya.",
    "reviewNote": ""
  },
  {
    "code": "64147",
    "title": "KOPERASI SIMPAN PINJAM DAN PEMBIAYAAN SYARIAH SEKUNDER (KSPPS SEKUNDER)",
    "sector": "Financials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 64-66 adalah jasa keuangan, asuransi, dana pensiun, dan penunjangnya.",
    "reviewNote": ""
  },
  {
    "code": "64148",
    "title": "UNIT SIMPAN PINJAM DAN PEMBIAYAAN SYARIAH KOPERASI SEKUNDER (USPPS KOPERASI SEKUNDER)",
    "sector": "Financials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 64-66 adalah jasa keuangan, asuransi, dana pensiun, dan penunjangnya.",
    "reviewNote": ""
  },
  {
    "code": "64151",
    "title": "LEMBAGA KEUANGAN MIKRO KONVENSIONAL",
    "sector": "Financials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 64-66 adalah jasa keuangan, asuransi, dana pensiun, dan penunjangnya.",
    "reviewNote": ""
  },
  {
    "code": "64152",
    "title": "LEMBAGA KEUANGAN MIKRO SYARIAH",
    "sector": "Financials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 64-66 adalah jasa keuangan, asuransi, dana pensiun, dan penunjangnya.",
    "reviewNote": ""
  },
  {
    "code": "64190",
    "title": "PERANTARA MONETER LAINNYA",
    "sector": "Financials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Divisi 64-66 adalah jasa keuangan, asuransi, dana pensiun, dan penunjangnya.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "64200",
    "title": "AKTIVITAS PERUSAHAAN HOLDING",
    "sector": "Financials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 64-66 adalah jasa keuangan, asuransi, dana pensiun, dan penunjangnya.",
    "reviewNote": ""
  },
  {
    "code": "64300",
    "title": "TRUST, PENDANAAN DAN ENTITAS KEUANGAN SEJENIS",
    "sector": "Financials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Divisi 64-66 adalah jasa keuangan, asuransi, dana pensiun, dan penunjangnya.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "64400",
    "title": "OTORITAS JASA KEUANGAN (OJK)",
    "sector": "Financials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Divisi 64-66 adalah jasa keuangan, asuransi, dana pensiun, dan penunjangnya.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "64500",
    "title": "LEMBAGA PENJAMIN SIMPANAN (LPS)",
    "sector": "Financials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 64-66 adalah jasa keuangan, asuransi, dana pensiun, dan penunjangnya.",
    "reviewNote": ""
  },
  {
    "code": "64911",
    "title": "PERUSAHAAN PEMBIAYAAN KONVENSIONAL",
    "sector": "Financials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 64-66 adalah jasa keuangan, asuransi, dana pensiun, dan penunjangnya.",
    "reviewNote": ""
  },
  {
    "code": "64912",
    "title": "PERUSAHAAN PEMBIAYAAN SYARIAH",
    "sector": "Financials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 64-66 adalah jasa keuangan, asuransi, dana pensiun, dan penunjangnya.",
    "reviewNote": ""
  },
  {
    "code": "64913",
    "title": "UNIT USAHA SYARIAH PERUSAHAAN PEMBIAYAAN",
    "sector": "Financials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 64-66 adalah jasa keuangan, asuransi, dana pensiun, dan penunjangnya.",
    "reviewNote": ""
  },
  {
    "code": "64921",
    "title": "PERGADAIAN KONVENSIONAL",
    "sector": "Financials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 64-66 adalah jasa keuangan, asuransi, dana pensiun, dan penunjangnya.",
    "reviewNote": ""
  },
  {
    "code": "64922",
    "title": "PERGADAIAN SYARIAH",
    "sector": "Financials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 64-66 adalah jasa keuangan, asuransi, dana pensiun, dan penunjangnya.",
    "reviewNote": ""
  },
  {
    "code": "64923",
    "title": "UNIT USAHA SYARIAH PERGADAIAN",
    "sector": "Financials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 64-66 adalah jasa keuangan, asuransi, dana pensiun, dan penunjangnya.",
    "reviewNote": ""
  },
  {
    "code": "64931",
    "title": "PERUSAHAAN MODAL VENTURA KONVENSIONAL",
    "sector": "Financials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 64-66 adalah jasa keuangan, asuransi, dana pensiun, dan penunjangnya.",
    "reviewNote": ""
  },
  {
    "code": "64932",
    "title": "PERUSAHAAN MODAL VENTURA SYARIAH",
    "sector": "Financials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 64-66 adalah jasa keuangan, asuransi, dana pensiun, dan penunjangnya.",
    "reviewNote": ""
  },
  {
    "code": "64933",
    "title": "UNIT USAHA SYARIAH MODAL VENTURA",
    "sector": "Financials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 64-66 adalah jasa keuangan, asuransi, dana pensiun, dan penunjangnya.",
    "reviewNote": ""
  },
  {
    "code": "64941",
    "title": "PERUSAHAAN PEMBIAYAAN INFRASTRUKTUR KONVENSIONAL",
    "sector": "Financials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 64-66 adalah jasa keuangan, asuransi, dana pensiun, dan penunjangnya.",
    "reviewNote": ""
  },
  {
    "code": "64942",
    "title": "PERUSAHAAN PEMBIAYAAN INFRASTRUKTUR SYARIAH",
    "sector": "Financials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 64-66 adalah jasa keuangan, asuransi, dana pensiun, dan penunjangnya.",
    "reviewNote": ""
  },
  {
    "code": "64943",
    "title": "UNIT USAHA SYARIAH PERUSAHAAN PEMBIAYAAN INFRASTRUKTUR",
    "sector": "Financials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 64-66 adalah jasa keuangan, asuransi, dana pensiun, dan penunjangnya.",
    "reviewNote": ""
  },
  {
    "code": "64951",
    "title": "LAYANAN PINJAM MEMINJAM UANG BERBASIS TEKNOLOGI INFORMASI (FINTECH P2P LENDING) KONVENSIONAL",
    "sector": "Financials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 64-66 adalah jasa keuangan, asuransi, dana pensiun, dan penunjangnya.",
    "reviewNote": ""
  },
  {
    "code": "64952",
    "title": "LAYANAN PINJAM MEMINJAM UANG BERBASIS TEKNOLOGI INFORMASI (FINTECH P2P LENDING) SYARIAH",
    "sector": "Financials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 64-66 adalah jasa keuangan, asuransi, dana pensiun, dan penunjangnya.",
    "reviewNote": ""
  },
  {
    "code": "64953",
    "title": "UNIT USAHA SYARIAH LAYANAN PINJAM MEMINJAM UANG BERBASIS TEKNOLOGI INFORMASI (FINTECH P2P LENDING)",
    "sector": "Financials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 64-66 adalah jasa keuangan, asuransi, dana pensiun, dan penunjangnya.",
    "reviewNote": ""
  },
  {
    "code": "64991",
    "title": "LEMBAGA PEMBIAYAAN EKSPOR INDONESIA",
    "sector": "Financials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 64-66 adalah jasa keuangan, asuransi, dana pensiun, dan penunjangnya.",
    "reviewNote": ""
  },
  {
    "code": "64992",
    "title": "PERUSAHAAN PEMBIAYAAN SEKUNDER PERUMAHAN",
    "sector": "Financials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 64-66 adalah jasa keuangan, asuransi, dana pensiun, dan penunjangnya.",
    "reviewNote": ""
  },
  {
    "code": "64999",
    "title": "AKTIVITAS JASA KEUANGAN LAINNYA YTDL, BUKAN ASURANSI DAN DANA PENSIUN",
    "sector": "Financials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Divisi 64-66 adalah jasa keuangan, asuransi, dana pensiun, dan penunjangnya.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "65111",
    "title": "ASURANSI JIWA KONVENSIONAL",
    "sector": "Financials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 64-66 adalah jasa keuangan, asuransi, dana pensiun, dan penunjangnya.",
    "reviewNote": ""
  },
  {
    "code": "65112",
    "title": "ASURANSI JIWA SYARIAH",
    "sector": "Financials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 64-66 adalah jasa keuangan, asuransi, dana pensiun, dan penunjangnya.",
    "reviewNote": ""
  },
  {
    "code": "65113",
    "title": "UNIT SYARIAH ASURANSI JIWA",
    "sector": "Financials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 64-66 adalah jasa keuangan, asuransi, dana pensiun, dan penunjangnya.",
    "reviewNote": ""
  },
  {
    "code": "65121",
    "title": "ASURANSI UMUM KONVENSIONAL",
    "sector": "Financials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 64-66 adalah jasa keuangan, asuransi, dana pensiun, dan penunjangnya.",
    "reviewNote": ""
  },
  {
    "code": "65122",
    "title": "ASURANSI UMUM SYARIAH",
    "sector": "Financials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 64-66 adalah jasa keuangan, asuransi, dana pensiun, dan penunjangnya.",
    "reviewNote": ""
  },
  {
    "code": "65123",
    "title": "UNIT SYARIAH ASURANSI UMUM",
    "sector": "Financials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 64-66 adalah jasa keuangan, asuransi, dana pensiun, dan penunjangnya.",
    "reviewNote": ""
  },
  {
    "code": "65131",
    "title": "PERUSAHAAN PENJAMINAN KONVENSIONAL",
    "sector": "Financials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Divisi 64-66 adalah jasa keuangan, asuransi, dana pensiun, dan penunjangnya.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "65132",
    "title": "PERUSAHAAN PENJAMINAN SYARIAH",
    "sector": "Financials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 64-66 adalah jasa keuangan, asuransi, dana pensiun, dan penunjangnya.",
    "reviewNote": ""
  },
  {
    "code": "65133",
    "title": "UNIT USAHA SYARIAH PERUSAHAAN PENJAMINAN",
    "sector": "Financials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 64-66 adalah jasa keuangan, asuransi, dana pensiun, dan penunjangnya.",
    "reviewNote": ""
  },
  {
    "code": "65211",
    "title": "REASURANSI KONVENSIONAL",
    "sector": "Financials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Divisi 64-66 adalah jasa keuangan, asuransi, dana pensiun, dan penunjangnya.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "65212",
    "title": "REASURANSI SYARIAH",
    "sector": "Financials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 64-66 adalah jasa keuangan, asuransi, dana pensiun, dan penunjangnya.",
    "reviewNote": ""
  },
  {
    "code": "65213",
    "title": "UNIT SYARIAH REASURANSI",
    "sector": "Financials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 64-66 adalah jasa keuangan, asuransi, dana pensiun, dan penunjangnya.",
    "reviewNote": ""
  },
  {
    "code": "65221",
    "title": "PERUSAHAAN PENJAMINAN ULANG KONVENSIONAL",
    "sector": "Financials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 64-66 adalah jasa keuangan, asuransi, dana pensiun, dan penunjangnya.",
    "reviewNote": ""
  },
  {
    "code": "65222",
    "title": "PERUSAHAAN PENJAMINAN ULANG SYARIAH",
    "sector": "Financials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 64-66 adalah jasa keuangan, asuransi, dana pensiun, dan penunjangnya.",
    "reviewNote": ""
  },
  {
    "code": "65311",
    "title": "DANA PENSIUN PEMBERI KERJA KONVENSIONAL",
    "sector": "Financials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 64-66 adalah jasa keuangan, asuransi, dana pensiun, dan penunjangnya.",
    "reviewNote": ""
  },
  {
    "code": "65312",
    "title": "DANA PENSIUN PEMBERI KERJA SYARIAH",
    "sector": "Financials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 64-66 adalah jasa keuangan, asuransi, dana pensiun, dan penunjangnya.",
    "reviewNote": ""
  },
  {
    "code": "65313",
    "title": "UNIT SYARIAH DANA PENSIUN PEMBERI KERJA",
    "sector": "Financials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 64-66 adalah jasa keuangan, asuransi, dana pensiun, dan penunjangnya.",
    "reviewNote": ""
  },
  {
    "code": "65321",
    "title": "DANA PENSIUN LEMBAGA KEUANGAN KONVENSIONAL",
    "sector": "Financials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 64-66 adalah jasa keuangan, asuransi, dana pensiun, dan penunjangnya.",
    "reviewNote": ""
  },
  {
    "code": "65322",
    "title": "DANA PENSIUN LEMBAGA KEUANGAN SYARIAH",
    "sector": "Financials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 64-66 adalah jasa keuangan, asuransi, dana pensiun, dan penunjangnya.",
    "reviewNote": ""
  },
  {
    "code": "66111",
    "title": "BURSA EFEK",
    "sector": "Financials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 64-66 adalah jasa keuangan, asuransi, dana pensiun, dan penunjangnya.",
    "reviewNote": ""
  },
  {
    "code": "66112",
    "title": "LEMBAGA KLIRING DAN PENJAMINAN EFEK",
    "sector": "Financials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 64-66 adalah jasa keuangan, asuransi, dana pensiun, dan penunjangnya.",
    "reviewNote": ""
  },
  {
    "code": "66113",
    "title": "LEMBAGA PENYIMPANAN DAN PENYELESAIAN",
    "sector": "Financials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 64-66 adalah jasa keuangan, asuransi, dana pensiun, dan penunjangnya.",
    "reviewNote": ""
  },
  {
    "code": "66114",
    "title": "LEMBAGA PENILAIAN HARGA EFEK (LPHE)",
    "sector": "Financials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 64-66 adalah jasa keuangan, asuransi, dana pensiun, dan penunjangnya.",
    "reviewNote": ""
  },
  {
    "code": "66115",
    "title": "PENYELENGGARA DANA PERLINDUNGAN PEMODAL (PDPP)",
    "sector": "Financials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 64-66 adalah jasa keuangan, asuransi, dana pensiun, dan penunjangnya.",
    "reviewNote": ""
  },
  {
    "code": "66116",
    "title": "LEMBAGA PENDANAAN EFEK",
    "sector": "Financials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 64-66 adalah jasa keuangan, asuransi, dana pensiun, dan penunjangnya.",
    "reviewNote": ""
  },
  {
    "code": "66117",
    "title": "PENYELENGGARA PASAR ALTERNATIF",
    "sector": "Financials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 64-66 adalah jasa keuangan, asuransi, dana pensiun, dan penunjangnya.",
    "reviewNote": ""
  },
  {
    "code": "66118",
    "title": "PENYELENGGARA PENAWARAN EFEK MELALUI LAYANAN URUN DANA BERBASIS TEKNOLOGI INFORMASI (SECURITIES CROWDFUNDING)",
    "sector": "Financials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 64-66 adalah jasa keuangan, asuransi, dana pensiun, dan penunjangnya.",
    "reviewNote": ""
  },
  {
    "code": "66119",
    "title": "PENYELENGGARA INFRASTRUKTUR PERDAGANGAN DI PASAR MODAL LAINNYA",
    "sector": "Financials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Divisi 64-66 adalah jasa keuangan, asuransi, dana pensiun, dan penunjangnya.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "66121",
    "title": "BURSA BERJANGKA",
    "sector": "Financials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Divisi 64-66 adalah jasa keuangan, asuransi, dana pensiun, dan penunjangnya.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "66122",
    "title": "LEMBAGA KLIRING DAN PENJAMINAN BERJANGKA",
    "sector": "Financials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 64-66 adalah jasa keuangan, asuransi, dana pensiun, dan penunjangnya.",
    "reviewNote": ""
  },
  {
    "code": "66123",
    "title": "BURSA BERJANGKA PENYELENGGARA PASAR FISIK",
    "sector": "Financials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 64-66 adalah jasa keuangan, asuransi, dana pensiun, dan penunjangnya.",
    "reviewNote": ""
  },
  {
    "code": "66124",
    "title": "LEMBAGA KLIRING DAN PENJAMINAN BERJANGKA PENYELENGGARA PASAR FISIK",
    "sector": "Financials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 64-66 adalah jasa keuangan, asuransi, dana pensiun, dan penunjangnya.",
    "reviewNote": ""
  },
  {
    "code": "66131",
    "title": "PENYELENGGARA SARANA PELAKSANAAN TRANSAKSI DI PASAR UANG DAN PASAR VALUTA ASING",
    "sector": "Financials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 64-66 adalah jasa keuangan, asuransi, dana pensiun, dan penunjangnya.",
    "reviewNote": ""
  },
  {
    "code": "66132",
    "title": "CENTRAL COUNTERPARTY TRANSAKSI DERIVATIF SUKU BUNGA DAN NILAI TUKAR",
    "sector": "Financials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 64-66 adalah jasa keuangan, asuransi, dana pensiun, dan penunjangnya.",
    "reviewNote": ""
  },
  {
    "code": "66139",
    "title": "PENYELENGGARA INFRASTRUKTUR PASAR UANG DAN PASAR VALUTA ASING LAINNYA",
    "sector": "Financials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Divisi 64-66 adalah jasa keuangan, asuransi, dana pensiun, dan penunjangnya.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "66141",
    "title": "PENJAMIN EMISI EFEK (UNDERWRITER)",
    "sector": "Financials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 64-66 adalah jasa keuangan, asuransi, dana pensiun, dan penunjangnya.",
    "reviewNote": ""
  },
  {
    "code": "66142",
    "title": "PERANTARA PEDAGANG EFEK (BROKER DEALER)",
    "sector": "Financials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 64-66 adalah jasa keuangan, asuransi, dana pensiun, dan penunjangnya.",
    "reviewNote": ""
  },
  {
    "code": "66143",
    "title": "PERUSAHAAN EFEK DAERAH (PED)",
    "sector": "Financials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 64-66 adalah jasa keuangan, asuransi, dana pensiun, dan penunjangnya.",
    "reviewNote": ""
  },
  {
    "code": "66144",
    "title": "PERANTARA PEDAGANG EFEK UNTUK EFEK BERSIFAT UTANG DAN SUKUK (PPE- EBUS)",
    "sector": "Financials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 64-66 adalah jasa keuangan, asuransi, dana pensiun, dan penunjangnya.",
    "reviewNote": ""
  },
  {
    "code": "66145",
    "title": "AGEN PERANTARA PEDAGANG EFEK",
    "sector": "Financials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 64-66 adalah jasa keuangan, asuransi, dana pensiun, dan penunjangnya.",
    "reviewNote": ""
  },
  {
    "code": "66146",
    "title": "AGEN PENJUAL EFEK REKSA DANA (APERD)",
    "sector": "Financials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 64-66 adalah jasa keuangan, asuransi, dana pensiun, dan penunjangnya.",
    "reviewNote": ""
  },
  {
    "code": "66147",
    "title": "GERAI PENJUALAN EFEK REKSA DANA",
    "sector": "Financials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 64-66 adalah jasa keuangan, asuransi, dana pensiun, dan penunjangnya.",
    "reviewNote": ""
  },
  {
    "code": "66149",
    "title": "PERUSAHAAN EFEK SELAIN MANAJEMEN INVESTASI LAINNYA",
    "sector": "Financials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Divisi 64-66 adalah jasa keuangan, asuransi, dana pensiun, dan penunjangnya.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "66151",
    "title": "PEDAGANG BERJANGKA",
    "sector": "Financials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Divisi 64-66 adalah jasa keuangan, asuransi, dana pensiun, dan penunjangnya.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "66152",
    "title": "PIALANG PERDAGANGAN BERJANGKA",
    "sector": "Financials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Divisi 64-66 adalah jasa keuangan, asuransi, dana pensiun, dan penunjangnya.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "66153",
    "title": "PEDAGANG FISIK KOMODITI",
    "sector": "Financials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 64-66 adalah jasa keuangan, asuransi, dana pensiun, dan penunjangnya.",
    "reviewNote": ""
  },
  {
    "code": "66154",
    "title": "PERANTARA PERDAGANGAN FISIK KOMODITI",
    "sector": "Financials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 64-66 adalah jasa keuangan, asuransi, dana pensiun, dan penunjangnya.",
    "reviewNote": ""
  },
  {
    "code": "66159",
    "title": "PERANTARA PERDAGANGAN BERJANGKA KOMODITI LAINNYA",
    "sector": "Financials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Divisi 64-66 adalah jasa keuangan, asuransi, dana pensiun, dan penunjangnya.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "66160",
    "title": "KEGIATAN PENUKARAN VALUTA ASING (MONEY CHANGER)",
    "sector": "Financials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 64-66 adalah jasa keuangan, asuransi, dana pensiun, dan penunjangnya.",
    "reviewNote": ""
  },
  {
    "code": "66171",
    "title": "PENYELENGGARA SISTEM PERDAGANGAN ALTERNATIF",
    "sector": "Financials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 64-66 adalah jasa keuangan, asuransi, dana pensiun, dan penunjangnya.",
    "reviewNote": ""
  },
  {
    "code": "66172",
    "title": "PENGELOLA SENTRA DANA BERJANGKA",
    "sector": "Financials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 64-66 adalah jasa keuangan, asuransi, dana pensiun, dan penunjangnya.",
    "reviewNote": ""
  },
  {
    "code": "66173",
    "title": "PENASIHAT BERJANGKA",
    "sector": "Financials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Divisi 64-66 adalah jasa keuangan, asuransi, dana pensiun, dan penunjangnya.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "66174",
    "title": "PENGELOLA TEMPAT PENYIMPANAN FISIK KOMODITI",
    "sector": "Financials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 64-66 adalah jasa keuangan, asuransi, dana pensiun, dan penunjangnya.",
    "reviewNote": ""
  },
  {
    "code": "66179",
    "title": "AKTIVITAS PENUNJANG PERDAGANGAN BERJANGKA KOMODITI LAINNYA",
    "sector": "Financials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Divisi 64-66 adalah jasa keuangan, asuransi, dana pensiun, dan penunjangnya.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "66191",
    "title": "BIRO ADMINISTRASI EFEK",
    "sector": "Financials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 64-66 adalah jasa keuangan, asuransi, dana pensiun, dan penunjangnya.",
    "reviewNote": ""
  },
  {
    "code": "66192",
    "title": "KUSTODIAN (CUSTODIAN)",
    "sector": "Financials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 64-66 adalah jasa keuangan, asuransi, dana pensiun, dan penunjangnya.",
    "reviewNote": ""
  },
  {
    "code": "66193",
    "title": "WALI AMANAT (TRUSTEE)",
    "sector": "Financials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 64-66 adalah jasa keuangan, asuransi, dana pensiun, dan penunjangnya.",
    "reviewNote": ""
  },
  {
    "code": "66194",
    "title": "PERUSAHAAN PEMERINGKAT EFEK",
    "sector": "Financials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 64-66 adalah jasa keuangan, asuransi, dana pensiun, dan penunjangnya.",
    "reviewNote": ""
  },
  {
    "code": "66195",
    "title": "AHLI SYARIAH PASAR MODAL (ASPM)",
    "sector": "Financials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 64-66 adalah jasa keuangan, asuransi, dana pensiun, dan penunjangnya.",
    "reviewNote": ""
  },
  {
    "code": "66199",
    "title": "AKTIVITAS PENUNJANG JASA KEUANGAN LAINNYA YTDL",
    "sector": "Financials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Divisi 64-66 adalah jasa keuangan, asuransi, dana pensiun, dan penunjangnya.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "66211",
    "title": "AKTIVITAS PENILAI RISIKO ASURANSI",
    "sector": "Financials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 64-66 adalah jasa keuangan, asuransi, dana pensiun, dan penunjangnya.",
    "reviewNote": ""
  },
  {
    "code": "66212",
    "title": "AKTIVITAS PENILAI KERUGIAN ASURANSI",
    "sector": "Financials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 64-66 adalah jasa keuangan, asuransi, dana pensiun, dan penunjangnya.",
    "reviewNote": ""
  },
  {
    "code": "66221",
    "title": "AKTIVITAS AGEN ASURANSI",
    "sector": "Financials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 64-66 adalah jasa keuangan, asuransi, dana pensiun, dan penunjangnya.",
    "reviewNote": ""
  },
  {
    "code": "66222",
    "title": "AKTIVITAS PIALANG ASURANSI",
    "sector": "Financials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 64-66 adalah jasa keuangan, asuransi, dana pensiun, dan penunjangnya.",
    "reviewNote": ""
  },
  {
    "code": "66223",
    "title": "AKTIVITAS PIALANG REASURANSI",
    "sector": "Financials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 64-66 adalah jasa keuangan, asuransi, dana pensiun, dan penunjangnya.",
    "reviewNote": ""
  },
  {
    "code": "66224",
    "title": "AKTIVITAS AGEN PENJAMIN",
    "sector": "Financials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 64-66 adalah jasa keuangan, asuransi, dana pensiun, dan penunjangnya.",
    "reviewNote": ""
  },
  {
    "code": "66225",
    "title": "AKTIVITAS BROKER PENJAMINAN",
    "sector": "Financials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 64-66 adalah jasa keuangan, asuransi, dana pensiun, dan penunjangnya.",
    "reviewNote": ""
  },
  {
    "code": "66226",
    "title": "AKTIVITAS BROKER PENJAMINAN ULANG",
    "sector": "Financials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 64-66 adalah jasa keuangan, asuransi, dana pensiun, dan penunjangnya.",
    "reviewNote": ""
  },
  {
    "code": "66291",
    "title": "AKTIVITAS KONSULTAN AKTUARIA",
    "sector": "Financials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 64-66 adalah jasa keuangan, asuransi, dana pensiun, dan penunjangnya.",
    "reviewNote": ""
  },
  {
    "code": "66292",
    "title": "AKTIVITAS PEMERINGKAT USAHA MIKRO, KECIL, MENENGAH DAN KOPERASI",
    "sector": "Financials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 64-66 adalah jasa keuangan, asuransi, dana pensiun, dan penunjangnya.",
    "reviewNote": ""
  },
  {
    "code": "66299",
    "title": "AKTIVITAS PENUNJANG ASURANSI, DAN DANA PENSIUN LAINNYA",
    "sector": "Financials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Divisi 64-66 adalah jasa keuangan, asuransi, dana pensiun, dan penunjangnya.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "66311",
    "title": "MANAJER INVESTASI",
    "sector": "Financials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 64-66 adalah jasa keuangan, asuransi, dana pensiun, dan penunjangnya.",
    "reviewNote": ""
  },
  {
    "code": "66312",
    "title": "MANAJER INVESTASI SYARIAH",
    "sector": "Financials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 64-66 adalah jasa keuangan, asuransi, dana pensiun, dan penunjangnya.",
    "reviewNote": ""
  },
  {
    "code": "66321",
    "title": "PENASIHAT INVESTASI PERORANGAN",
    "sector": "Financials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 64-66 adalah jasa keuangan, asuransi, dana pensiun, dan penunjangnya.",
    "reviewNote": ""
  },
  {
    "code": "66322",
    "title": "PENASIHAT INVESTASI BERBENTUK PERUSAHAAN",
    "sector": "Financials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 64-66 adalah jasa keuangan, asuransi, dana pensiun, dan penunjangnya.",
    "reviewNote": ""
  },
  {
    "code": "66390",
    "title": "AKTIVITAS MANAJEMEN DANA LAINNYA",
    "sector": "Financials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Divisi 64-66 adalah jasa keuangan, asuransi, dana pensiun, dan penunjangnya.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "66411",
    "title": "PENYEDIA JASA PEMBAYARAN (PJP)",
    "sector": "Financials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 64-66 adalah jasa keuangan, asuransi, dana pensiun, dan penunjangnya.",
    "reviewNote": ""
  },
  {
    "code": "66412",
    "title": "PENYELENGGARA INFRASTRUKTUR SISTEM PEMBAYARAN (PIP)",
    "sector": "Financials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 64-66 adalah jasa keuangan, asuransi, dana pensiun, dan penunjangnya.",
    "reviewNote": ""
  },
  {
    "code": "66413",
    "title": "PENYELENGGARA PENUNJANG SISTEM PEMBAYARAN",
    "sector": "Financials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 64-66 adalah jasa keuangan, asuransi, dana pensiun, dan penunjangnya.",
    "reviewNote": ""
  },
  {
    "code": "66420",
    "title": "PENYELENGGARA KEGIATAN JASA PENGOLAHAN UANG RUPIAH",
    "sector": "Financials",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 64-66 adalah jasa keuangan, asuransi, dana pensiun, dan penunjangnya.",
    "reviewNote": ""
  },
  {
    "code": "68111",
    "title": "REAL ESTAT YANG DIMILIKI SENDIRI ATAU DISEWA",
    "sector": "Properties & Real Estate",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Divisi 68 adalah real estat, pengelolaan properti, dan jasa penunjangnya.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "68112",
    "title": "PENYEWAAN VENUE PENYELENGGARAAN AKTIFITAS MICE DAN EVENT KHUSUS",
    "sector": "Properties & Real Estate",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 68 adalah real estat, pengelolaan properti, dan jasa penunjangnya.",
    "reviewNote": ""
  },
  {
    "code": "68120",
    "title": "KAWASAN PARIWISATA",
    "sector": "Properties & Real Estate",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 68 adalah real estat, pengelolaan properti, dan jasa penunjangnya.",
    "reviewNote": ""
  },
  {
    "code": "68130",
    "title": "KAWASAN INDUSTRI",
    "sector": "Properties & Real Estate",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Divisi 68 adalah real estat, pengelolaan properti, dan jasa penunjangnya.",
    "reviewNote": ""
  },
  {
    "code": "68200",
    "title": "REAL ESTAT ATAS DASAR BALAS JASA (FEE) ATAU KONTRAK",
    "sector": "Properties & Real Estate",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Divisi 68 adalah real estat, pengelolaan properti, dan jasa penunjangnya.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "69101",
    "title": "AKTIVITAS PENGACARA",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Jasa profesional, ilmiah, teknis, hukum, akuntansi, engineering, dan konsultasi adalah professional services.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "69102",
    "title": "AKTIVITAS KONSULTAN HUKUM",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Jasa profesional, ilmiah, teknis, hukum, akuntansi, engineering, dan konsultasi adalah professional services.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "69103",
    "title": "AKTIVITAS KONSULTAN KEKAYAAN INTELEKTUAL",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Jasa profesional, ilmiah, teknis, hukum, akuntansi, engineering, dan konsultasi adalah professional services.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "69104",
    "title": "AKTIVITAS NOTARIS DAN PEJABAT PEMBUAT AKTA TANAH",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Jasa profesional, ilmiah, teknis, hukum, akuntansi, engineering, dan konsultasi adalah professional services.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "69109",
    "title": "AKTIVITAS HUKUM LAINNYA",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Jasa profesional, ilmiah, teknis, hukum, akuntansi, engineering, dan konsultasi adalah professional services.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "69201",
    "title": "AKTIVITAS AKUNTANSI, PEMBUKUAN DAN PEMERIKSA",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Jasa profesional, ilmiah, teknis, hukum, akuntansi, engineering, dan konsultasi adalah professional services.",
    "reviewNote": ""
  },
  {
    "code": "69202",
    "title": "AKTIVITAS KONSULTASI PAJAK",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Jasa profesional, ilmiah, teknis, hukum, akuntansi, engineering, dan konsultasi adalah professional services.",
    "reviewNote": ""
  },
  {
    "code": "70100",
    "title": "AKTIVITAS KANTOR PUSAT",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Jasa profesional, ilmiah, teknis, hukum, akuntansi, engineering, dan konsultasi adalah professional services.",
    "reviewNote": ""
  },
  {
    "code": "70201",
    "title": "AKTIVITAS KONSULTANSI PARIWISATA",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Jasa profesional, ilmiah, teknis, hukum, akuntansi, engineering, dan konsultasi adalah professional services.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "70202",
    "title": "AKTIVITAS KONSULTANSI TRANSPORTASI",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Jasa profesional, ilmiah, teknis, hukum, akuntansi, engineering, dan konsultasi adalah professional services.",
    "reviewNote": ""
  },
  {
    "code": "70203",
    "title": "AKTIVITAS KEHUMASAN",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Jasa profesional, ilmiah, teknis, hukum, akuntansi, engineering, dan konsultasi adalah professional services.",
    "reviewNote": ""
  },
  {
    "code": "70204",
    "title": "AKTIVITAS KONSULTANSI MANAJEMEN INDUSTRI",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Jasa profesional, ilmiah, teknis, hukum, akuntansi, engineering, dan konsultasi adalah professional services.",
    "reviewNote": ""
  },
  {
    "code": "70209",
    "title": "AKTIVITAS KONSULTASI MANAJEMEN LAINNYA",
    "sector": "Financials",
    "confidence": "Medium",
    "alternativeSector": "Industrials",
    "reason": "Aktivitas profesional terkait keuangan dipetakan ke Financials.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "71101",
    "title": "AKTIVITAS ARSITEKTUR",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Jasa profesional, ilmiah, teknis, hukum, akuntansi, engineering, dan konsultasi adalah professional services.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "71102",
    "title": "AKTIVITAS KEINSINYURAN DAN KONSULTASI TEKNIS YBDI",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Jasa profesional, ilmiah, teknis, hukum, akuntansi, engineering, dan konsultasi adalah professional services.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "71201",
    "title": "JASA SERTIFIKASI",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Jasa profesional, ilmiah, teknis, hukum, akuntansi, engineering, dan konsultasi adalah professional services.",
    "reviewNote": ""
  },
  {
    "code": "71202",
    "title": "JASA PENGUJIAN LABORATORIUM",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Jasa profesional, ilmiah, teknis, hukum, akuntansi, engineering, dan konsultasi adalah professional services.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "71203",
    "title": "JASA INSPEKSI PERIODIK",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Jasa profesional, ilmiah, teknis, hukum, akuntansi, engineering, dan konsultasi adalah professional services.",
    "reviewNote": ""
  },
  {
    "code": "71204",
    "title": "JASA INSPEKSI TEKNIK INSTALASI",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Jasa profesional, ilmiah, teknis, hukum, akuntansi, engineering, dan konsultasi adalah professional services.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "71205",
    "title": "JASA KALIBRASI/METROLOGI",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Jasa profesional, ilmiah, teknis, hukum, akuntansi, engineering, dan konsultasi adalah professional services.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "71206",
    "title": "JASA COMMISSIONING PROSES INDUSTRIAL, QUALITY ASSURANCE (QA), DAN QUALITY CONTROL (QC)",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Jasa profesional, ilmiah, teknis, hukum, akuntansi, engineering, dan konsultasi adalah professional services.",
    "reviewNote": ""
  },
  {
    "code": "71207",
    "title": "JASA KLASIFIKASI KAPAL",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Jasa profesional, ilmiah, teknis, hukum, akuntansi, engineering, dan konsultasi adalah professional services.",
    "reviewNote": ""
  },
  {
    "code": "71208",
    "title": "AKTIVITAS PENGUJIAN DAN ATAU KALIBRASI ALAT KESEHATAN DAN INSPEKSI SARANA PRASARANA KESEHATAN",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Jasa profesional, ilmiah, teknis, hukum, akuntansi, engineering, dan konsultasi adalah professional services.",
    "reviewNote": ""
  },
  {
    "code": "71209",
    "title": "ANALISIS DAN UJI TEKNIS LAINNYA",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Jasa profesional, ilmiah, teknis, hukum, akuntansi, engineering, dan konsultasi adalah professional services.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "72101",
    "title": "PENELITIAN DAN PENGEMBANGAN ILMU PENGETAHUAN ALAM",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Jasa profesional, ilmiah, teknis, hukum, akuntansi, engineering, dan konsultasi adalah professional services.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "72102",
    "title": "PENELITIAN DAN PENGEMBANGAN TEKNOLOGI DAN REKAYASA",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Jasa profesional, ilmiah, teknis, hukum, akuntansi, engineering, dan konsultasi adalah professional services.",
    "reviewNote": ""
  },
  {
    "code": "72103",
    "title": "PENELITIAN DAN PENGEMBANGAN ILMU KEDOKTERAN",
    "sector": "Healthcare",
    "confidence": "Medium",
    "alternativeSector": "Industrials",
    "reason": "Riset kesehatan/biomedis/farmasi masuk Healthcare.",
    "reviewNote": ""
  },
  {
    "code": "72104",
    "title": "PENELITIAN DAN PENGEMBANGAN BIOTEKNOLOGI",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Jasa profesional, ilmiah, teknis, hukum, akuntansi, engineering, dan konsultasi adalah professional services.",
    "reviewNote": ""
  },
  {
    "code": "72105",
    "title": "PENELITIAN DAN PENGEMBANGAN ILMU PERTANIAN, PETERNAKAN, DAN KEHUTANAN",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Jasa profesional, ilmiah, teknis, hukum, akuntansi, engineering, dan konsultasi adalah professional services.",
    "reviewNote": ""
  },
  {
    "code": "72106",
    "title": "PENELITIAN DAN PENGEMBANGAN ILMU PERIKANAN DAN KELAUTAN",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Jasa profesional, ilmiah, teknis, hukum, akuntansi, engineering, dan konsultasi adalah professional services.",
    "reviewNote": ""
  },
  {
    "code": "72107",
    "title": "PENELITIAN DAN PENGEMBANGAN KETENAGANUKLIRAN",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Jasa profesional, ilmiah, teknis, hukum, akuntansi, engineering, dan konsultasi adalah professional services.",
    "reviewNote": ""
  },
  {
    "code": "72109",
    "title": "PENELITIAN DAN PENGEMBANGAN ILMU PENGETAHUAN ALAM DAN TEKNOLOGI REKAYASA LAINNYA",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Jasa profesional, ilmiah, teknis, hukum, akuntansi, engineering, dan konsultasi adalah professional services.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "72201",
    "title": "PENELITIAN DAN PENGEMBANGAN ILMU PENGETAHUAN SOSIAL",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Jasa profesional, ilmiah, teknis, hukum, akuntansi, engineering, dan konsultasi adalah professional services.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "72202",
    "title": "PENELITIAN DAN PENGEMBANGAN LINGUISTIK DAN SASTRA",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Jasa profesional, ilmiah, teknis, hukum, akuntansi, engineering, dan konsultasi adalah professional services.",
    "reviewNote": ""
  },
  {
    "code": "72203",
    "title": "PENELITIAN DAN PENGEMBANGAN AGAMA",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Jasa profesional, ilmiah, teknis, hukum, akuntansi, engineering, dan konsultasi adalah professional services.",
    "reviewNote": ""
  },
  {
    "code": "72204",
    "title": "PENELITIAN DAN PENGEMBANGAN SENI",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Jasa profesional, ilmiah, teknis, hukum, akuntansi, engineering, dan konsultasi adalah professional services.",
    "reviewNote": ""
  },
  {
    "code": "72205",
    "title": "PENELITIAN DAN PENGEMBANGAN PSIKOLOGI",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Jasa profesional, ilmiah, teknis, hukum, akuntansi, engineering, dan konsultasi adalah professional services.",
    "reviewNote": ""
  },
  {
    "code": "72206",
    "title": "PENELITIAN DAN PENGEMBANGAN SEJARAH/CAGAR BUDAYA",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Jasa profesional, ilmiah, teknis, hukum, akuntansi, engineering, dan konsultasi adalah professional services.",
    "reviewNote": ""
  },
  {
    "code": "72209",
    "title": "PENELITIAN DAN PENGEMBANGAN ILMU PENGETAHUAN SOSIAL DAN HUMANIORA LAINNYA.",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Jasa profesional, ilmiah, teknis, hukum, akuntansi, engineering, dan konsultasi adalah professional services.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "73100",
    "title": "PERIKLANAN",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Periklanan dan market research masuk media/advertising Consumer Cyclicals.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "73201",
    "title": "PENELITIAN PASAR",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Periklanan dan market research masuk media/advertising Consumer Cyclicals.",
    "reviewNote": ""
  },
  {
    "code": "73202",
    "title": "JAJAK PENDAPAT MASYARAKAT",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Periklanan dan market research masuk media/advertising Consumer Cyclicals.",
    "reviewNote": ""
  },
  {
    "code": "74111",
    "title": "AKTIVITAS DESAIN ALAT TRANSPORTASI DAN PERMESINAN",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Jasa profesional, ilmiah, teknis, hukum, akuntansi, engineering, dan konsultasi adalah professional services.",
    "reviewNote": ""
  },
  {
    "code": "74112",
    "title": "AKTIVITAS DESAIN PERALATAN RUMAH TANGGA DAN FURNITUR",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Jasa profesional, ilmiah, teknis, hukum, akuntansi, engineering, dan konsultasi adalah professional services.",
    "reviewNote": ""
  },
  {
    "code": "74113",
    "title": "AKTIVITAS DESAIN TEKSTIL, FASHION DAN APPAREL",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Jasa profesional, ilmiah, teknis, hukum, akuntansi, engineering, dan konsultasi adalah professional services.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "74114",
    "title": "AKTIVITAS DESAIN INDUSTRI STRATEGIS DAN PERTAHANAN",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Jasa profesional, ilmiah, teknis, hukum, akuntansi, engineering, dan konsultasi adalah professional services.",
    "reviewNote": ""
  },
  {
    "code": "74115",
    "title": "AKTIVITAS DESAIN ALAT KOMUNIKASI DAN ELEKTRONIKA",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Jasa profesional, ilmiah, teknis, hukum, akuntansi, engineering, dan konsultasi adalah professional services.",
    "reviewNote": ""
  },
  {
    "code": "74116",
    "title": "AKTIVITAS DESAIN PERALATAN OLAHRAGA DAN PERMAINAN",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Jasa profesional, ilmiah, teknis, hukum, akuntansi, engineering, dan konsultasi adalah professional services.",
    "reviewNote": ""
  },
  {
    "code": "74117",
    "title": "AKTIVITAS DESAIN PRODUK KESEHATAN, KOSMETIK DAN PERLENGKAPAN LABORATORIUM",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Jasa profesional, ilmiah, teknis, hukum, akuntansi, engineering, dan konsultasi adalah professional services.",
    "reviewNote": ""
  },
  {
    "code": "74118",
    "title": "AKTIVITAS DESAIN PENGEMASAN",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Jasa profesional, ilmiah, teknis, hukum, akuntansi, engineering, dan konsultasi adalah professional services.",
    "reviewNote": ""
  },
  {
    "code": "74119",
    "title": "AKTIVITAS DESAIN INDUSTRI LAINNYA",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "Industrials",
    "reason": "Jasa kreatif/desain/fotografi lebih dekat ke consumer services/media.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "74120",
    "title": "AKTIVITAS DESAIN INTERIOR",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "Industrials",
    "reason": "Jasa kreatif/desain/fotografi lebih dekat ke consumer services/media.",
    "reviewNote": ""
  },
  {
    "code": "74130",
    "title": "AKTIVITAS DESAIN KOMUNIKASI VISUAL/ DESAIN GRAFIS",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Jasa profesional, ilmiah, teknis, hukum, akuntansi, engineering, dan konsultasi adalah professional services.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "74141",
    "title": "AKTIVITAS DESAIN KHUSUS FILM, VIDEO, PROGRAM TV, ANIMASI DAN KOMIK",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Jasa profesional, ilmiah, teknis, hukum, akuntansi, engineering, dan konsultasi adalah professional services.",
    "reviewNote": ""
  },
  {
    "code": "74142",
    "title": "AKTIVITAS DESAIN KONTEN GAME",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Jasa profesional, ilmiah, teknis, hukum, akuntansi, engineering, dan konsultasi adalah professional services.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "74149",
    "title": "AKTIVITAS DESAIN KONTEN KREATIF LAINYA",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Jasa profesional, ilmiah, teknis, hukum, akuntansi, engineering, dan konsultasi adalah professional services.",
    "reviewNote": ""
  },
  {
    "code": "74201",
    "title": "AKTIVITAS FOTOGRAFI",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "Industrials",
    "reason": "Jasa kreatif/desain/fotografi lebih dekat ke consumer services/media.",
    "reviewNote": ""
  },
  {
    "code": "74202",
    "title": "AKTIVITAS ANGKUTAN UDARA KHUSUS PEMOTRETAN, SURVEI DAN PEMETAAN",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Jasa profesional, ilmiah, teknis, hukum, akuntansi, engineering, dan konsultasi adalah professional services.",
    "reviewNote": ""
  },
  {
    "code": "74311",
    "title": "AKTIVITAS SERTIFIKASI PROFESI PIHAK 1",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Jasa profesional, ilmiah, teknis, hukum, akuntansi, engineering, dan konsultasi adalah professional services.",
    "reviewNote": ""
  },
  {
    "code": "74312",
    "title": "AKTIVITAS SERTIFIKASI PROFESI PIHAK 2",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Jasa profesional, ilmiah, teknis, hukum, akuntansi, engineering, dan konsultasi adalah professional services.",
    "reviewNote": ""
  },
  {
    "code": "74321",
    "title": "AKTIVITAS SERTIFIKASI PROFESI PIHAK 3",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Jasa profesional, ilmiah, teknis, hukum, akuntansi, engineering, dan konsultasi adalah professional services.",
    "reviewNote": ""
  },
  {
    "code": "74322",
    "title": "AKTIVITAS SERTIFIKASI PERSONEL INDEPENDEN",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Jasa profesional, ilmiah, teknis, hukum, akuntansi, engineering, dan konsultasi adalah professional services.",
    "reviewNote": ""
  },
  {
    "code": "74901",
    "title": "AKTIVITAS PENERJEMAH ATAU INTERPRETER",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Jasa profesional, ilmiah, teknis, hukum, akuntansi, engineering, dan konsultasi adalah professional services.",
    "reviewNote": ""
  },
  {
    "code": "74902",
    "title": "AKTIVITAS KONSULTASI BISNIS DAN BROKER BISNIS",
    "sector": "Financials",
    "confidence": "Medium",
    "alternativeSector": "Industrials",
    "reason": "Aktivitas profesional terkait keuangan dipetakan ke Financials.",
    "reviewNote": ""
  },
  {
    "code": "74909",
    "title": "AKTIVITAS PROFESIONAL, ILMIAH DAN TEKNIS LAINNYA YTDL",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "Industrials",
    "reason": "Jasa kreatif/desain/fotografi lebih dekat ke consumer services/media.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "75000",
    "title": "AKTIVITAS KESEHATAN HEWAN",
    "sector": "Healthcare",
    "confidence": "Medium",
    "alternativeSector": "Industrials",
    "reason": "Aktivitas kesehatan hewan dipetakan ke Healthcare sebagai layanan kesehatan non-manusia.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "77100",
    "title": "AKTIVITAS PENYEWAAN DAN SEWA GUNA USAHA TANPA HAK OPSI MOBIL, BUS, TRUK DAN SEJENISNYA",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Penyewaan, ketenagakerjaan, keamanan, cleaning, administrasi kantor, dan penunjang usaha adalah commercial services.",
    "reviewNote": ""
  },
  {
    "code": "77210",
    "title": "AKTIVITAS PENYEWAAN DAN SEWA GUNA USAHA TANPA HAK OPSI ALAT REKREASI DAN OLAHRAGA",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "Industrials",
    "reason": "Penyewaan barang konsumen/rekreasi lebih dekat ke consumer discretionary.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "77220",
    "title": "AKTIVITAS PENYEWAAN KASET VIDEO, CD, VCD/DVD DAN SEJENISNYA",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "Industrials",
    "reason": "Penyewaan barang konsumen/rekreasi lebih dekat ke consumer discretionary.",
    "reviewNote": ""
  },
  {
    "code": "77291",
    "title": "AKTIVITAS PENYEWAAN DAN SEWA GUNA USAHA TANPA HAK OPSI ALAT PESTA",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "Industrials",
    "reason": "Penyewaan barang konsumen/rekreasi lebih dekat ke consumer discretionary.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "77292",
    "title": "AKTIVITAS PENYEWAAN DAN SEWA GUNA USAHA TANPA HAK OPSI BARANG KEPERLUAN RUMAH TANGGA DAN PRIBADI",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "Industrials",
    "reason": "Penyewaan barang konsumen/rekreasi lebih dekat ke consumer discretionary.",
    "reviewNote": ""
  },
  {
    "code": "77293",
    "title": "AKTIVITAS PENYEWAAN DAN SEWA GUNA USAHA TANPA HAK OPSI BARANG HASIL PENCETAKAN DAN PENERBITAN",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "Industrials",
    "reason": "Penyewaan barang konsumen/rekreasi lebih dekat ke consumer discretionary.",
    "reviewNote": ""
  },
  {
    "code": "77294",
    "title": "AKTIVITAS PENYEWAAN DAN SEWA GUNA USAHA TANPA HAK OPSI BUNGA DAN TANAMAN HIAS",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "Industrials",
    "reason": "Penyewaan barang konsumen/rekreasi lebih dekat ke consumer discretionary.",
    "reviewNote": ""
  },
  {
    "code": "77295",
    "title": "AKTIVITAS PENYEWAAN DAN SEWA GUNA USAHA TANPA HAK OPSI ALAT MUSIK",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "Industrials",
    "reason": "Penyewaan barang konsumen/rekreasi lebih dekat ke consumer discretionary.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "77299",
    "title": "AKTIVITAS PENYEWAAN DAN SEWA GUNA USAHA TANPA HAK OPSI BARANG KEPERLUAN RUMAH TANGGA DAN PRIBADI LAINNYA YTDL",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "Industrials",
    "reason": "Penyewaan barang konsumen/rekreasi lebih dekat ke consumer discretionary.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "77311",
    "title": "AKTIVITAS PENYEWAAN DAN SEWA GUNA USAHA TANPA HAK OPSI ALAT TRANSPORTASI DARAT BUKAN KENDARAAN BERMOTOR RODA EMPAT ATAU LEBIH",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Penyewaan, ketenagakerjaan, keamanan, cleaning, administrasi kantor, dan penunjang usaha adalah commercial services.",
    "reviewNote": ""
  },
  {
    "code": "77312",
    "title": "AKTIVITAS PENYEWAAN DAN SEWA GUNA USAHA TANPA HAK OPSI ALAT TRANSPORTASI AIR",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Penyewaan, ketenagakerjaan, keamanan, cleaning, administrasi kantor, dan penunjang usaha adalah commercial services.",
    "reviewNote": ""
  },
  {
    "code": "77313",
    "title": "AKTIVITAS PENYEWAAN DAN SEWA GUNA USAHA TANPA HAK OPSI ALAT TRANSPORTASI UDARA",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Penyewaan, ketenagakerjaan, keamanan, cleaning, administrasi kantor, dan penunjang usaha adalah commercial services.",
    "reviewNote": ""
  },
  {
    "code": "77319",
    "title": "AKTIVITAS PENYEWAAN DAN SEWA GUNA USAHA TANPA HAK OPSI ALAT TRANSPORTASI LAINNYA",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Penyewaan, ketenagakerjaan, keamanan, cleaning, administrasi kantor, dan penunjang usaha adalah commercial services.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "77321",
    "title": "AKTIVITAS PENYEWAAN DAN SEWA GUNA TANPA HAK OPSI ALAT PEREKAMAN GAMBAR & EDITING",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Penyewaan, ketenagakerjaan, keamanan, cleaning, administrasi kantor, dan penunjang usaha adalah commercial services.",
    "reviewNote": ""
  },
  {
    "code": "77322",
    "title": "AKTIVITAS PENYEWAAN DAN SEWA GUNA TANPA HAK OPSI ALAT ALAT BANTU TEKNOLOGI DIGITAL",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Penyewaan, ketenagakerjaan, keamanan, cleaning, administrasi kantor, dan penunjang usaha adalah commercial services.",
    "reviewNote": ""
  },
  {
    "code": "77323",
    "title": "AKTIVITAS PENYEWAAN DAN SEWA GUNA TANPA HAK OPSI ALAT KEBUTUHAN MICE",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Penyewaan, ketenagakerjaan, keamanan, cleaning, administrasi kantor, dan penunjang usaha adalah commercial services.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "77329",
    "title": "AKTIVITAS PENYEWAAN DAN SEWA GUNA TANPA HAK OPSI MESIN DAN PERALATAN INDUSTRI KREATIF LAINNYA",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Penyewaan, ketenagakerjaan, keamanan, cleaning, administrasi kantor, dan penunjang usaha adalah commercial services.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "77391",
    "title": "AKTIVITAS PENYEWAAN DAN SEWA GUNA USAHA TANPA HAK OPSI MESIN DAN PERALATAN INDUSTRI PENGOLAHAN",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Penyewaan, ketenagakerjaan, keamanan, cleaning, administrasi kantor, dan penunjang usaha adalah commercial services.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "77392",
    "title": "AKTIVITAS PENYEWAAN DAN SEWA GUNA USAHA TANPA HAK OPSI MESIN PERTANIAN DAN PERALATANNYA",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Penyewaan, ketenagakerjaan, keamanan, cleaning, administrasi kantor, dan penunjang usaha adalah commercial services.",
    "reviewNote": ""
  },
  {
    "code": "77393",
    "title": "AKTIVITAS PENYEWAAN DAN SEWA GUNA USAHA TANPA HAK OPSI MESIN DAN PERALATAN KONSTRUKSI DAN TEKNIK SIPIL",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Penyewaan, ketenagakerjaan, keamanan, cleaning, administrasi kantor, dan penunjang usaha adalah commercial services.",
    "reviewNote": ""
  },
  {
    "code": "77394",
    "title": "AKTIVITAS PENYEWAAN DAN SEWA GUNA USAHA TANPA HAK OPSI MESIN KANTOR DAN PERALATANNYA",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Penyewaan, ketenagakerjaan, keamanan, cleaning, administrasi kantor, dan penunjang usaha adalah commercial services.",
    "reviewNote": ""
  },
  {
    "code": "77395",
    "title": "AKTIVITAS PENYEWAAN DAN SEWA GUNA TANPA HAK OPSI MESIN PERTAMBANGAN DAN ENERGI SERTA PERALATANNYA",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Penyewaan, ketenagakerjaan, keamanan, cleaning, administrasi kantor, dan penunjang usaha adalah commercial services.",
    "reviewNote": ""
  },
  {
    "code": "77399",
    "title": "AKTIVITAS PENYEWAAN DAN SEWA GUNA USAHA TANPA HAK OPSI MESIN, PERALATAN DAN BARANG BERWUJUD LAINNYA YTDL",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Penyewaan, ketenagakerjaan, keamanan, cleaning, administrasi kantor, dan penunjang usaha adalah commercial services.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "77400",
    "title": "SEWA GUNA USAHA TANPA HAK OPSI INTELEKTUAL PROPERTI, BUKAN KARYA HAK CIPTA",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Penyewaan, ketenagakerjaan, keamanan, cleaning, administrasi kantor, dan penunjang usaha adalah commercial services.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "78101",
    "title": "AKTIVITAS PENYELEKSIAN DAN PENEMPATAN TENAGA KERJA DALAM NEGERI",
    "sector": "Financials",
    "confidence": "Medium",
    "alternativeSector": "Industrials",
    "reason": "Penunjang informasi/kredit/keuangan dipetakan ke Financials.",
    "reviewNote": ""
  },
  {
    "code": "78102",
    "title": "AKTIVITAS PENYELEKSIAN DAN PENEMPATAN TENAGA KERJA LUAR NEGERI",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Penyewaan, ketenagakerjaan, keamanan, cleaning, administrasi kantor, dan penunjang usaha adalah commercial services.",
    "reviewNote": ""
  },
  {
    "code": "78103",
    "title": "AKTIVITAS PENEMPATAN PEKERJA RUMAH TANGGA",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "Industrials",
    "reason": "Penyewaan barang konsumen/rekreasi lebih dekat ke consumer discretionary.",
    "reviewNote": ""
  },
  {
    "code": "78104",
    "title": "AKTIVITAS PENEMPATAN TENAGA KERJA DARING (JOB PORTAL)",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Penyewaan, ketenagakerjaan, keamanan, cleaning, administrasi kantor, dan penunjang usaha adalah commercial services.",
    "reviewNote": ""
  },
  {
    "code": "78200",
    "title": "AKTIVITAS PENYEDIAAN TENAGA KERJA WAKTU TERTENTU",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Penyewaan, ketenagakerjaan, keamanan, cleaning, administrasi kantor, dan penunjang usaha adalah commercial services.",
    "reviewNote": ""
  },
  {
    "code": "78300",
    "title": "PENYEDIAAN SUMBER DAYA MANUSIA DAN MANAJEMEN FUNGSI SUMBER DAYA MANUSIA",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Penyewaan, ketenagakerjaan, keamanan, cleaning, administrasi kantor, dan penunjang usaha adalah commercial services.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "78411",
    "title": "PELATIHAN KERJA TEKNIK PEMERINTAH",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Penyewaan, ketenagakerjaan, keamanan, cleaning, administrasi kantor, dan penunjang usaha adalah commercial services.",
    "reviewNote": ""
  },
  {
    "code": "78412",
    "title": "PELATIHAN KERJA TEKNOLOGI INFORMASI DAN KOMUNIKASI PEMERINTAH",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Penyewaan, ketenagakerjaan, keamanan, cleaning, administrasi kantor, dan penunjang usaha adalah commercial services.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "78413",
    "title": "PELATIHAN KERJA INDUSTRI KREATIF PEMERINTAH",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Penyewaan, ketenagakerjaan, keamanan, cleaning, administrasi kantor, dan penunjang usaha adalah commercial services.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "78414",
    "title": "PELATIHAN KERJA PARIWISATA DAN PERHOTELAN PEMERINTAH",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Penyewaan, ketenagakerjaan, keamanan, cleaning, administrasi kantor, dan penunjang usaha adalah commercial services.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "78415",
    "title": "PELATIHAN KERJA BISNIS DAN MANAJEMEN PEMERINTAH",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Penyewaan, ketenagakerjaan, keamanan, cleaning, administrasi kantor, dan penunjang usaha adalah commercial services.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "78416",
    "title": "PELATIHAN KERJA PEKERJAAN DOMESTIK PEMERINTAH",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "Industrials",
    "reason": "Penyewaan barang konsumen/rekreasi lebih dekat ke consumer discretionary.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "78417",
    "title": "PELATIHAN KERJA PERTANIAN DAN PERIKANAN PEMERINTAH",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Penyewaan, ketenagakerjaan, keamanan, cleaning, administrasi kantor, dan penunjang usaha adalah commercial services.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "78419",
    "title": "PELATIHAN KERJA PEMERINTAH LAINNYA",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Penyewaan, ketenagakerjaan, keamanan, cleaning, administrasi kantor, dan penunjang usaha adalah commercial services.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "78421",
    "title": "PELATIHAN KERJA TEKNIK SWASTA",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Penyewaan, ketenagakerjaan, keamanan, cleaning, administrasi kantor, dan penunjang usaha adalah commercial services.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "78422",
    "title": "PELATIHAN KERJA TEKNOLOGI INFORMASI DAN KOMUNIKASI SWASTA",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Penyewaan, ketenagakerjaan, keamanan, cleaning, administrasi kantor, dan penunjang usaha adalah commercial services.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "78423",
    "title": "PELATIHAN KERJA INDUSTRI KREATIF SWASTA",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Penyewaan, ketenagakerjaan, keamanan, cleaning, administrasi kantor, dan penunjang usaha adalah commercial services.",
    "reviewNote": ""
  },
  {
    "code": "78424",
    "title": "PELATIHAN KERJA PARIWISATA DAN PERHOTELAN SWASTA",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Penyewaan, ketenagakerjaan, keamanan, cleaning, administrasi kantor, dan penunjang usaha adalah commercial services.",
    "reviewNote": ""
  },
  {
    "code": "78425",
    "title": "PELATIHAN KERJA BISNIS DAN MANAJEMEN SWASTA",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Penyewaan, ketenagakerjaan, keamanan, cleaning, administrasi kantor, dan penunjang usaha adalah commercial services.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "78426",
    "title": "PELATIHAN KERJA PEKERJAAN DOMESTIK SWASTA",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "Industrials",
    "reason": "Penyewaan barang konsumen/rekreasi lebih dekat ke consumer discretionary.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "78427",
    "title": "PELATIHAN KERJA PERTANIAN DAN PERIKANAN SWASTA",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Penyewaan, ketenagakerjaan, keamanan, cleaning, administrasi kantor, dan penunjang usaha adalah commercial services.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "78429",
    "title": "PELATIHAN KERJA SWASTA LAINNYA",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Penyewaan, ketenagakerjaan, keamanan, cleaning, administrasi kantor, dan penunjang usaha adalah commercial services.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "78431",
    "title": "PELATIHAN KERJA TEKNIK PERUSAHAAN",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Penyewaan, ketenagakerjaan, keamanan, cleaning, administrasi kantor, dan penunjang usaha adalah commercial services.",
    "reviewNote": ""
  },
  {
    "code": "78432",
    "title": "PELATIHAN KERJA TEKNOLOGI INFORMASI DAN KOMUNIKASI PERUSAHAAN",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Penyewaan, ketenagakerjaan, keamanan, cleaning, administrasi kantor, dan penunjang usaha adalah commercial services.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "78433",
    "title": "PELATIHAN KERJA INDUSTRI KREATIF PERUSAHAAN",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Penyewaan, ketenagakerjaan, keamanan, cleaning, administrasi kantor, dan penunjang usaha adalah commercial services.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "78434",
    "title": "PELATIHAN KERJA PARIWISATA DAN PERHOTELAN PERUSAHAAN",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Penyewaan, ketenagakerjaan, keamanan, cleaning, administrasi kantor, dan penunjang usaha adalah commercial services.",
    "reviewNote": ""
  },
  {
    "code": "78435",
    "title": "PELATIHAN KERJA BISNIS DAN MANAJEMEN PERUSAHAAN",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Penyewaan, ketenagakerjaan, keamanan, cleaning, administrasi kantor, dan penunjang usaha adalah commercial services.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "78436",
    "title": "PELATIHAN KERJA PEKERJAAN DOMESTIK PERUSAHAAN",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "Industrials",
    "reason": "Penyewaan barang konsumen/rekreasi lebih dekat ke consumer discretionary.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "78437",
    "title": "PELATIHAN KERJA PERTANIAN DAN PERIKANAN PERUSAHAAN",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Penyewaan, ketenagakerjaan, keamanan, cleaning, administrasi kantor, dan penunjang usaha adalah commercial services.",
    "reviewNote": ""
  },
  {
    "code": "78439",
    "title": "PELATIHAN KERJA PERUSAHAAN LAINNYA",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Penyewaan, ketenagakerjaan, keamanan, cleaning, administrasi kantor, dan penunjang usaha adalah commercial services.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "79111",
    "title": "AKTIVITAS AGEN PERJALANAN WISATA",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Agen perjalanan dan penunjang pariwisata masuk Consumer Cyclicals.",
    "reviewNote": ""
  },
  {
    "code": "79112",
    "title": "AKTIVITAS AGEN PERJALANAN IBADAH UMROH DAN HAJI KHUSUS",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Agen perjalanan dan penunjang pariwisata masuk Consumer Cyclicals.",
    "reviewNote": ""
  },
  {
    "code": "79119",
    "title": "AKTIVITAS AGEN PERJALANAN LAINNYA",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Agen perjalanan dan penunjang pariwisata masuk Consumer Cyclicals.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "79121",
    "title": "AKTIVITAS BIRO PERJALANAN WISATA",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Agen perjalanan dan penunjang pariwisata masuk Consumer Cyclicals.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "79122",
    "title": "AKTIVITAS BIRO PERJALANAN IBADAH UMROH DAN HAJI KHUSUS",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Agen perjalanan dan penunjang pariwisata masuk Consumer Cyclicals.",
    "reviewNote": ""
  },
  {
    "code": "79129",
    "title": "AKTIVITAS BIRO PERJALANAN LAINNYA",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Agen perjalanan dan penunjang pariwisata masuk Consumer Cyclicals.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "79911",
    "title": "JASA INFORMASI PARIWISATA",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Agen perjalanan dan penunjang pariwisata masuk Consumer Cyclicals.",
    "reviewNote": ""
  },
  {
    "code": "79912",
    "title": "JASA INFORMASI DAYA TARIK WISATA",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Agen perjalanan dan penunjang pariwisata masuk Consumer Cyclicals.",
    "reviewNote": ""
  },
  {
    "code": "79921",
    "title": "JASA PRAMUWISATA",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Agen perjalanan dan penunjang pariwisata masuk Consumer Cyclicals.",
    "reviewNote": ""
  },
  {
    "code": "79922",
    "title": "JASA INTERPRETER WISATA",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Agen perjalanan dan penunjang pariwisata masuk Consumer Cyclicals.",
    "reviewNote": ""
  },
  {
    "code": "79990",
    "title": "JASA RESERVASI LAINNYA YBDI YTDL",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Agen perjalanan dan penunjang pariwisata masuk Consumer Cyclicals.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "80100",
    "title": "AKTIVITAS KEAMANAN SWASTA",
    "sector": "Financials",
    "confidence": "Medium",
    "alternativeSector": "Industrials",
    "reason": "Penunjang informasi/kredit/keuangan dipetakan ke Financials.",
    "reviewNote": ""
  },
  {
    "code": "80200",
    "title": "AKTIVITAS JASA SISTEM KEAMANAN",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Penyewaan, ketenagakerjaan, keamanan, cleaning, administrasi kantor, dan penunjang usaha adalah commercial services.",
    "reviewNote": ""
  },
  {
    "code": "80300",
    "title": "AKTIVITAS PENYELIDIKAN",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Penyewaan, ketenagakerjaan, keamanan, cleaning, administrasi kantor, dan penunjang usaha adalah commercial services.",
    "reviewNote": ""
  },
  {
    "code": "81100",
    "title": "AKTIVITAS PENYEDIA GABUNGAN JASA PENUNJANG FASILITAS",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Penyewaan, ketenagakerjaan, keamanan, cleaning, administrasi kantor, dan penunjang usaha adalah commercial services.",
    "reviewNote": ""
  },
  {
    "code": "81210",
    "title": "AKTIVITAS KEBERSIHAN UMUM BANGUNAN",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Penyewaan, ketenagakerjaan, keamanan, cleaning, administrasi kantor, dan penunjang usaha adalah commercial services.",
    "reviewNote": ""
  },
  {
    "code": "81290",
    "title": "AKTIVITAS KEBERSIHAN BANGUNAN DAN INDUSTRI LAINNYA",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Penyewaan, ketenagakerjaan, keamanan, cleaning, administrasi kantor, dan penunjang usaha adalah commercial services.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "81300",
    "title": "AKTIVITAS PERAWATAN DAN PEMELIHARAAN TAMAN",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "Industrials",
    "reason": "Penyewaan barang konsumen/rekreasi lebih dekat ke consumer discretionary.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "82110",
    "title": "AKTIVITAS PENYEDIA GABUNGAN JASA ADMINISTRASI KANTOR",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Penyewaan, ketenagakerjaan, keamanan, cleaning, administrasi kantor, dan penunjang usaha adalah commercial services.",
    "reviewNote": ""
  },
  {
    "code": "82190",
    "title": "AKTIVITAS FOTOKOPI, PENYIAPAN DOKUMEN DAN AKTIVITAS KHUSUS PENUNJANG KANTOR LAINNYA",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Penyewaan, ketenagakerjaan, keamanan, cleaning, administrasi kantor, dan penunjang usaha adalah commercial services.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "82200",
    "title": "AKTIVITAS CALL CENTRE",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Penyewaan, ketenagakerjaan, keamanan, cleaning, administrasi kantor, dan penunjang usaha adalah commercial services.",
    "reviewNote": ""
  },
  {
    "code": "82301",
    "title": "JASA PENYELENGGARA PERTEMUAN, PERJALANAN INSENTIF, KONFERENSI DAN PAMERAN (MICE)",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Penyewaan, ketenagakerjaan, keamanan, cleaning, administrasi kantor, dan penunjang usaha adalah commercial services.",
    "reviewNote": ""
  },
  {
    "code": "82302",
    "title": "JASA PENYELENGGARA EVENT KHUSUS (SPECIAL EVENT)",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Penyewaan, ketenagakerjaan, keamanan, cleaning, administrasi kantor, dan penunjang usaha adalah commercial services.",
    "reviewNote": ""
  },
  {
    "code": "82911",
    "title": "AKTIVITAS DEBT COLLECTION",
    "sector": "Financials",
    "confidence": "Medium",
    "alternativeSector": "Industrials",
    "reason": "Penunjang informasi/kredit/keuangan dipetakan ke Financials.",
    "reviewNote": ""
  },
  {
    "code": "82912",
    "title": "AKTIVITAS LEMBAGA PENGELOLA INFORMASI PERKREDITAN",
    "sector": "Financials",
    "confidence": "Medium",
    "alternativeSector": "Industrials",
    "reason": "Penunjang informasi/kredit/keuangan dipetakan ke Financials.",
    "reviewNote": ""
  },
  {
    "code": "82920",
    "title": "AKTIVITAS PENGEPAKAN",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Penyewaan, ketenagakerjaan, keamanan, cleaning, administrasi kantor, dan penunjang usaha adalah commercial services.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "82990",
    "title": "AKTIVITAS JASA PENUNJANG USAHA LAINNYA YTDL",
    "sector": "Industrials",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Penyewaan, ketenagakerjaan, keamanan, cleaning, administrasi kantor, dan penunjang usaha adalah commercial services.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "84111",
    "title": "LEMBAGA LEGISLATIF",
    "sector": "Infrastructures",
    "confidence": "Low",
    "alternativeSector": "Industrials",
    "reason": "Administrasi pemerintahan/pertahanan bukan sektor emiten biasa; dipetakan ke layanan publik/infrastruktur kelembagaan.",
    "reviewNote": "Tidak lazim untuk klasifikasi perusahaan tercatat; gunakan hanya jika perlu forced mapping."
  },
  {
    "code": "84112",
    "title": "PENYELENGGARAAN PEMERINTAH NEGARA DAN KESEKRETARIATAN NEGARA",
    "sector": "Infrastructures",
    "confidence": "Low",
    "alternativeSector": "Industrials",
    "reason": "Administrasi pemerintahan/pertahanan bukan sektor emiten biasa; dipetakan ke layanan publik/infrastruktur kelembagaan.",
    "reviewNote": "Tidak lazim untuk klasifikasi perusahaan tercatat; gunakan hanya jika perlu forced mapping."
  },
  {
    "code": "84113",
    "title": "LEMBAGA EKSEKUTIF KEUANGAN, PERPAJAKAN DAN BEA CUKAI",
    "sector": "Infrastructures",
    "confidence": "Low",
    "alternativeSector": "Industrials",
    "reason": "Administrasi pemerintahan/pertahanan bukan sektor emiten biasa; dipetakan ke layanan publik/infrastruktur kelembagaan.",
    "reviewNote": "Tidak lazim untuk klasifikasi perusahaan tercatat; gunakan hanya jika perlu forced mapping."
  },
  {
    "code": "84114",
    "title": "LEMBAGA EKSEKUTIF PERENCANAAN",
    "sector": "Infrastructures",
    "confidence": "Low",
    "alternativeSector": "Industrials",
    "reason": "Administrasi pemerintahan/pertahanan bukan sektor emiten biasa; dipetakan ke layanan publik/infrastruktur kelembagaan.",
    "reviewNote": "Tidak lazim untuk klasifikasi perusahaan tercatat; gunakan hanya jika perlu forced mapping."
  },
  {
    "code": "84115",
    "title": "LEMBAGA PEMERINTAH NON KEMENTRIAN DENGAN TUGAS KHUSUS",
    "sector": "Infrastructures",
    "confidence": "Low",
    "alternativeSector": "Industrials",
    "reason": "Administrasi pemerintahan/pertahanan bukan sektor emiten biasa; dipetakan ke layanan publik/infrastruktur kelembagaan.",
    "reviewNote": "Tidak lazim untuk klasifikasi perusahaan tercatat; gunakan hanya jika perlu forced mapping."
  },
  {
    "code": "84119",
    "title": "KEGIATAN ADMINISTRASI PEMERINTAHAN LAINNYA",
    "sector": "Infrastructures",
    "confidence": "Low",
    "alternativeSector": "Industrials",
    "reason": "Administrasi pemerintahan/pertahanan bukan sektor emiten biasa; dipetakan ke layanan publik/infrastruktur kelembagaan.",
    "reviewNote": "Tidak lazim untuk klasifikasi perusahaan tercatat; gunakan hanya jika perlu forced mapping."
  },
  {
    "code": "84121",
    "title": "ADMINISTRASI PELAYANAN PEMERINTAH BIDANG PENDIDIKAN",
    "sector": "Infrastructures",
    "confidence": "Low",
    "alternativeSector": "Industrials",
    "reason": "Administrasi pemerintahan/pertahanan bukan sektor emiten biasa; dipetakan ke layanan publik/infrastruktur kelembagaan.",
    "reviewNote": "Tidak lazim untuk klasifikasi perusahaan tercatat; gunakan hanya jika perlu forced mapping."
  },
  {
    "code": "84122",
    "title": "ADMINISTRASI PELAYANAN PEMERINTAH BIDANG KESEHATAN",
    "sector": "Infrastructures",
    "confidence": "Low",
    "alternativeSector": "Industrials",
    "reason": "Administrasi pemerintahan/pertahanan bukan sektor emiten biasa; dipetakan ke layanan publik/infrastruktur kelembagaan.",
    "reviewNote": "Tidak lazim untuk klasifikasi perusahaan tercatat; gunakan hanya jika perlu forced mapping."
  },
  {
    "code": "84123",
    "title": "ADMINISTRASI PELAYANAN PEMERINTAH BIDANG PERUMAHAN",
    "sector": "Infrastructures",
    "confidence": "Low",
    "alternativeSector": "Industrials",
    "reason": "Administrasi pemerintahan/pertahanan bukan sektor emiten biasa; dipetakan ke layanan publik/infrastruktur kelembagaan.",
    "reviewNote": "Tidak lazim untuk klasifikasi perusahaan tercatat; gunakan hanya jika perlu forced mapping."
  },
  {
    "code": "84124",
    "title": "ADMINISTRASI PELAYANAN PEMERINTAH BIDANG KESEJAHTERAAN SOSIAL",
    "sector": "Infrastructures",
    "confidence": "Low",
    "alternativeSector": "Industrials",
    "reason": "Administrasi pemerintahan/pertahanan bukan sektor emiten biasa; dipetakan ke layanan publik/infrastruktur kelembagaan.",
    "reviewNote": "Tidak lazim untuk klasifikasi perusahaan tercatat; gunakan hanya jika perlu forced mapping."
  },
  {
    "code": "84125",
    "title": "ADMINISTRASI PELAYANAN PEMERINTAH BIDANG KEAGAMAAN",
    "sector": "Infrastructures",
    "confidence": "Low",
    "alternativeSector": "Industrials",
    "reason": "Administrasi pemerintahan/pertahanan bukan sektor emiten biasa; dipetakan ke layanan publik/infrastruktur kelembagaan.",
    "reviewNote": "Tidak lazim untuk klasifikasi perusahaan tercatat; gunakan hanya jika perlu forced mapping."
  },
  {
    "code": "84126",
    "title": "ADMINISTRASI PELAYANAN PEMERINTAH BIDANG KEBUDAYAAN/KESENIAN/REKREASI/OLAHRAGA",
    "sector": "Infrastructures",
    "confidence": "Low",
    "alternativeSector": "Industrials",
    "reason": "Administrasi pemerintahan/pertahanan bukan sektor emiten biasa; dipetakan ke layanan publik/infrastruktur kelembagaan.",
    "reviewNote": "Tidak lazim untuk klasifikasi perusahaan tercatat; gunakan hanya jika perlu forced mapping."
  },
  {
    "code": "84127",
    "title": "ADMINISTRASI PELAYANAN PEMERINTAH BIDANG LINGKUNGAN HIDUP",
    "sector": "Infrastructures",
    "confidence": "Low",
    "alternativeSector": "Industrials",
    "reason": "Administrasi pemerintahan/pertahanan bukan sektor emiten biasa; dipetakan ke layanan publik/infrastruktur kelembagaan.",
    "reviewNote": "Tidak lazim untuk klasifikasi perusahaan tercatat; gunakan hanya jika perlu forced mapping."
  },
  {
    "code": "84129",
    "title": "ADMINISTRASI PELAYANAN PEMERINTAH BIDANG SOSIAL LAINNYA BUKAN KESEHATAN, PENDIDIKAN, KEAGAMAAN DAN KEBUDAYAAN",
    "sector": "Infrastructures",
    "confidence": "Low",
    "alternativeSector": "Industrials",
    "reason": "Administrasi pemerintahan/pertahanan bukan sektor emiten biasa; dipetakan ke layanan publik/infrastruktur kelembagaan.",
    "reviewNote": "Tidak lazim untuk klasifikasi perusahaan tercatat; gunakan hanya jika perlu forced mapping."
  },
  {
    "code": "84131",
    "title": "KEGIATAN LEMBAGA PEMERINTAHAN BIDANG PERTANIAN",
    "sector": "Infrastructures",
    "confidence": "Low",
    "alternativeSector": "Industrials",
    "reason": "Administrasi pemerintahan/pertahanan bukan sektor emiten biasa; dipetakan ke layanan publik/infrastruktur kelembagaan.",
    "reviewNote": "Tidak lazim untuk klasifikasi perusahaan tercatat; gunakan hanya jika perlu forced mapping."
  },
  {
    "code": "84132",
    "title": "KEGIATAN LEMBAGA PEMERINTAHAN BIDANG PERTAMBANGAN DAN PENGGALIAN, LISTRIK, AIR DAN GAS",
    "sector": "Infrastructures",
    "confidence": "Low",
    "alternativeSector": "Industrials",
    "reason": "Administrasi pemerintahan/pertahanan bukan sektor emiten biasa; dipetakan ke layanan publik/infrastruktur kelembagaan.",
    "reviewNote": "Tidak lazim untuk klasifikasi perusahaan tercatat; gunakan hanya jika perlu forced mapping."
  },
  {
    "code": "84133",
    "title": "KEGIATAN LEMBAGA PEMERINTAHAN BIDANG PERINDUSTRIAN",
    "sector": "Infrastructures",
    "confidence": "Low",
    "alternativeSector": "Industrials",
    "reason": "Administrasi pemerintahan/pertahanan bukan sektor emiten biasa; dipetakan ke layanan publik/infrastruktur kelembagaan.",
    "reviewNote": "Tidak lazim untuk klasifikasi perusahaan tercatat; gunakan hanya jika perlu forced mapping."
  },
  {
    "code": "84134",
    "title": "KEGIATAN LEMBAGA PEMERINTAHAN BIDANG KOMUNIKASI DAN INFORMATIKA",
    "sector": "Infrastructures",
    "confidence": "Low",
    "alternativeSector": "Industrials",
    "reason": "Administrasi pemerintahan/pertahanan bukan sektor emiten biasa; dipetakan ke layanan publik/infrastruktur kelembagaan.",
    "reviewNote": "Tidak lazim untuk klasifikasi perusahaan tercatat; gunakan hanya jika perlu forced mapping."
  },
  {
    "code": "84135",
    "title": "KEGIATAN LEMBAGA PEMERINTAHAN BIDANG KONSTRUKSI",
    "sector": "Infrastructures",
    "confidence": "Low",
    "alternativeSector": "Industrials",
    "reason": "Administrasi pemerintahan/pertahanan bukan sektor emiten biasa; dipetakan ke layanan publik/infrastruktur kelembagaan.",
    "reviewNote": "Tidak lazim untuk klasifikasi perusahaan tercatat; gunakan hanya jika perlu forced mapping."
  },
  {
    "code": "84136",
    "title": "KEGIATAN LEMBAGA PEMERINTAHAN BIDANG PERDAGANGAN DAN PARIWISATA",
    "sector": "Infrastructures",
    "confidence": "Low",
    "alternativeSector": "Industrials",
    "reason": "Administrasi pemerintahan/pertahanan bukan sektor emiten biasa; dipetakan ke layanan publik/infrastruktur kelembagaan.",
    "reviewNote": "Tidak lazim untuk klasifikasi perusahaan tercatat; gunakan hanya jika perlu forced mapping."
  },
  {
    "code": "84137",
    "title": "KEGIATAN LEMBAGA PEMERINTAHAN BIDANG PERHUBUNGAN",
    "sector": "Infrastructures",
    "confidence": "Low",
    "alternativeSector": "Industrials",
    "reason": "Administrasi pemerintahan/pertahanan bukan sektor emiten biasa; dipetakan ke layanan publik/infrastruktur kelembagaan.",
    "reviewNote": "Tidak lazim untuk klasifikasi perusahaan tercatat; gunakan hanya jika perlu forced mapping."
  },
  {
    "code": "84138",
    "title": "KEGIATAN LEMBAGA PEMERINTAHAN BIDANG KETENAGAKERJAAN",
    "sector": "Infrastructures",
    "confidence": "Low",
    "alternativeSector": "Industrials",
    "reason": "Administrasi pemerintahan/pertahanan bukan sektor emiten biasa; dipetakan ke layanan publik/infrastruktur kelembagaan.",
    "reviewNote": "Tidak lazim untuk klasifikasi perusahaan tercatat; gunakan hanya jika perlu forced mapping."
  },
  {
    "code": "84139",
    "title": "KEGIATAN LEMBAGA PEMERINTAHAN UNTUK MENCIPTAKAN EFISIENSI PRODUKSI DAN BISNIS LAINNYA",
    "sector": "Infrastructures",
    "confidence": "Low",
    "alternativeSector": "Industrials",
    "reason": "Administrasi pemerintahan/pertahanan bukan sektor emiten biasa; dipetakan ke layanan publik/infrastruktur kelembagaan.",
    "reviewNote": "Tidak lazim untuk klasifikasi perusahaan tercatat; gunakan hanya jika perlu forced mapping."
  },
  {
    "code": "84210",
    "title": "HUBUNGAN LUAR NEGERI",
    "sector": "Infrastructures",
    "confidence": "Low",
    "alternativeSector": "Industrials",
    "reason": "Administrasi pemerintahan/pertahanan bukan sektor emiten biasa; dipetakan ke layanan publik/infrastruktur kelembagaan.",
    "reviewNote": "Tidak lazim untuk klasifikasi perusahaan tercatat; gunakan hanya jika perlu forced mapping."
  },
  {
    "code": "84221",
    "title": "LEMBAGA PERTAHANAN DAN ANGKATAN BERSENJATA",
    "sector": "Infrastructures",
    "confidence": "Low",
    "alternativeSector": "Industrials",
    "reason": "Administrasi pemerintahan/pertahanan bukan sektor emiten biasa; dipetakan ke layanan publik/infrastruktur kelembagaan.",
    "reviewNote": "Tidak lazim untuk klasifikasi perusahaan tercatat; gunakan hanya jika perlu forced mapping."
  },
  {
    "code": "84222",
    "title": "ANGKATAN DARAT",
    "sector": "Infrastructures",
    "confidence": "Low",
    "alternativeSector": "Industrials",
    "reason": "Administrasi pemerintahan/pertahanan bukan sektor emiten biasa; dipetakan ke layanan publik/infrastruktur kelembagaan.",
    "reviewNote": "Tidak lazim untuk klasifikasi perusahaan tercatat; gunakan hanya jika perlu forced mapping."
  },
  {
    "code": "84223",
    "title": "ANGKATAN UDARA",
    "sector": "Infrastructures",
    "confidence": "Low",
    "alternativeSector": "Industrials",
    "reason": "Administrasi pemerintahan/pertahanan bukan sektor emiten biasa; dipetakan ke layanan publik/infrastruktur kelembagaan.",
    "reviewNote": "Tidak lazim untuk klasifikasi perusahaan tercatat; gunakan hanya jika perlu forced mapping."
  },
  {
    "code": "84224",
    "title": "ANGKATAN LAUT",
    "sector": "Infrastructures",
    "confidence": "Low",
    "alternativeSector": "Industrials",
    "reason": "Administrasi pemerintahan/pertahanan bukan sektor emiten biasa; dipetakan ke layanan publik/infrastruktur kelembagaan.",
    "reviewNote": "Tidak lazim untuk klasifikasi perusahaan tercatat; gunakan hanya jika perlu forced mapping."
  },
  {
    "code": "84231",
    "title": "KEPOLISIAN",
    "sector": "Infrastructures",
    "confidence": "Low",
    "alternativeSector": "Industrials",
    "reason": "Administrasi pemerintahan/pertahanan bukan sektor emiten biasa; dipetakan ke layanan publik/infrastruktur kelembagaan.",
    "reviewNote": "Tidak lazim untuk klasifikasi perusahaan tercatat; gunakan hanya jika perlu forced mapping."
  },
  {
    "code": "84232",
    "title": "PERTAHANAN SIPIL",
    "sector": "Infrastructures",
    "confidence": "Low",
    "alternativeSector": "Industrials",
    "reason": "Administrasi pemerintahan/pertahanan bukan sektor emiten biasa; dipetakan ke layanan publik/infrastruktur kelembagaan.",
    "reviewNote": "Tidak lazim untuk klasifikasi perusahaan tercatat; gunakan hanya jika perlu forced mapping."
  },
  {
    "code": "84233",
    "title": "LEMBAGA PERADILAN",
    "sector": "Infrastructures",
    "confidence": "Low",
    "alternativeSector": "Industrials",
    "reason": "Administrasi pemerintahan/pertahanan bukan sektor emiten biasa; dipetakan ke layanan publik/infrastruktur kelembagaan.",
    "reviewNote": "Tidak lazim untuk klasifikasi perusahaan tercatat; gunakan hanya jika perlu forced mapping."
  },
  {
    "code": "84234",
    "title": "BADAN NASIONAL PENANGGULANGAN BENCANA DAN PEMADAM KEBAKARAN",
    "sector": "Infrastructures",
    "confidence": "Low",
    "alternativeSector": "Industrials",
    "reason": "Administrasi pemerintahan/pertahanan bukan sektor emiten biasa; dipetakan ke layanan publik/infrastruktur kelembagaan.",
    "reviewNote": "Tidak lazim untuk klasifikasi perusahaan tercatat; gunakan hanya jika perlu forced mapping."
  },
  {
    "code": "84300",
    "title": "JAMINAN SOSIAL WAJIB",
    "sector": "Infrastructures",
    "confidence": "Low",
    "alternativeSector": "Industrials",
    "reason": "Administrasi pemerintahan/pertahanan bukan sektor emiten biasa; dipetakan ke layanan publik/infrastruktur kelembagaan.",
    "reviewNote": "Tidak lazim untuk klasifikasi perusahaan tercatat; gunakan hanya jika perlu forced mapping."
  },
  {
    "code": "85111",
    "title": "PENDIDIKAN DASAR/IBTIDAIYAH PEMERINTAH",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Jasa pendidikan termasuk Consumer Cyclicals dalam IDX-IC.",
    "reviewNote": ""
  },
  {
    "code": "85112",
    "title": "PENDIDIKAN MENENGAH PERTAMA/TSANAWIYAH PEMERINTAH",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Jasa pendidikan termasuk Consumer Cyclicals dalam IDX-IC.",
    "reviewNote": ""
  },
  {
    "code": "85121",
    "title": "PENDIDIKAN DASAR/IBTIDAIYAH SWASTA",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Jasa pendidikan termasuk Consumer Cyclicals dalam IDX-IC.",
    "reviewNote": ""
  },
  {
    "code": "85122",
    "title": "PENDIDIKAN MENENGAH PERTAMA/TSANAWIYAH SWASTA",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Jasa pendidikan termasuk Consumer Cyclicals dalam IDX-IC.",
    "reviewNote": ""
  },
  {
    "code": "85131",
    "title": "PENDIDIKAN TAMAN KANAK-KANAK PEMERINTAH",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Jasa pendidikan termasuk Consumer Cyclicals dalam IDX-IC.",
    "reviewNote": ""
  },
  {
    "code": "85132",
    "title": "PENDIDIKAN TAMAN KANAK-KANAK SWASTA/RAUDATUL ATHFAL/BUSTANUL ATHFAL",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Jasa pendidikan termasuk Consumer Cyclicals dalam IDX-IC.",
    "reviewNote": ""
  },
  {
    "code": "85133",
    "title": "PENDIDIKAN KELOMPOK BERMAIN",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Jasa pendidikan termasuk Consumer Cyclicals dalam IDX-IC.",
    "reviewNote": ""
  },
  {
    "code": "85134",
    "title": "PENDIDIKAN TAMAN PENITIPAN ANAK",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Jasa pendidikan termasuk Consumer Cyclicals dalam IDX-IC.",
    "reviewNote": ""
  },
  {
    "code": "85135",
    "title": "PENDIDIKAN TAMAN KANAK-KANAK LUAR BIASA",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Jasa pendidikan termasuk Consumer Cyclicals dalam IDX-IC.",
    "reviewNote": ""
  },
  {
    "code": "85139",
    "title": "PENDIDIKAN ANAK USIA DINI SEJENIS LAINNYA",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Jasa pendidikan termasuk Consumer Cyclicals dalam IDX-IC.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "85141",
    "title": "SATUAN PENDIDIKAN KERJASAMA KELOMPOK BERMAIN",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Jasa pendidikan termasuk Consumer Cyclicals dalam IDX-IC.",
    "reviewNote": ""
  },
  {
    "code": "85142",
    "title": "SATUAN PENDIDIKAN KERJASAMA TAMAN KANAK-KANAK",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Jasa pendidikan termasuk Consumer Cyclicals dalam IDX-IC.",
    "reviewNote": ""
  },
  {
    "code": "85143",
    "title": "SATUAN PENDIDIKAN KERJASAMA PENDIDIKAN DASAR",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Jasa pendidikan termasuk Consumer Cyclicals dalam IDX-IC.",
    "reviewNote": ""
  },
  {
    "code": "85144",
    "title": "SATUAN PENDIDIKAN KERJASAMA PENDIDIKAN MENENGAH PERTAMA",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Jasa pendidikan termasuk Consumer Cyclicals dalam IDX-IC.",
    "reviewNote": ""
  },
  {
    "code": "85151",
    "title": "SATUAN PENDIDIKAN ANAK USIA DINI/PAUD AL-QURAN",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Jasa pendidikan termasuk Consumer Cyclicals dalam IDX-IC.",
    "reviewNote": ""
  },
  {
    "code": "85152",
    "title": "SATUAN PENDIDIKAN MUADALAH/PENDIDIKAN DINIYAH FORMAL ULA",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Jasa pendidikan termasuk Consumer Cyclicals dalam IDX-IC.",
    "reviewNote": ""
  },
  {
    "code": "85153",
    "title": "SATUAN PENDIDIKAN MUADALAH/PENDIDIKAN DINIYAH FORMAL WUSTHA",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Jasa pendidikan termasuk Consumer Cyclicals dalam IDX-IC.",
    "reviewNote": ""
  },
  {
    "code": "85154",
    "title": "SATUAN PENDIDIKAN PESANTREN PENGKAJIAN KITAB KUNING ULA",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Jasa pendidikan termasuk Consumer Cyclicals dalam IDX-IC.",
    "reviewNote": ""
  },
  {
    "code": "85155",
    "title": "SATUAN PENDIDIKAN PESANTREN PENGKAJIAN KITAB KUNING WUSTHA",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Jasa pendidikan termasuk Consumer Cyclicals dalam IDX-IC.",
    "reviewNote": ""
  },
  {
    "code": "85161",
    "title": "SATUAN PENDIDIKAN KEAGAMAAN ANAK USIA DINI",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Jasa pendidikan termasuk Consumer Cyclicals dalam IDX-IC.",
    "reviewNote": ""
  },
  {
    "code": "85162",
    "title": "SATUAN PENDIDIKAN KEAGAMAAN DASAR",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Jasa pendidikan termasuk Consumer Cyclicals dalam IDX-IC.",
    "reviewNote": ""
  },
  {
    "code": "85163",
    "title": "SATUAN PENDIDIKAN KEAGAMAAN MENENGAH PERTAMA",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Jasa pendidikan termasuk Consumer Cyclicals dalam IDX-IC.",
    "reviewNote": ""
  },
  {
    "code": "85210",
    "title": "PENDIDIKAN MENENGAH ATAS/ALIYAH PEMERINTAH",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Jasa pendidikan termasuk Consumer Cyclicals dalam IDX-IC.",
    "reviewNote": ""
  },
  {
    "code": "85220",
    "title": "PENDIDIKAN MENENGAH/ALIYAH SWASTA",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Jasa pendidikan termasuk Consumer Cyclicals dalam IDX-IC.",
    "reviewNote": ""
  },
  {
    "code": "85230",
    "title": "PENDIDIKAN MENENGAH KEJURUAN DAN TEKNIS/ALIYAH KEJURUAN PEMERINTAH",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Jasa pendidikan termasuk Consumer Cyclicals dalam IDX-IC.",
    "reviewNote": ""
  },
  {
    "code": "85240",
    "title": "PENDIDIKAN MENENGAH KEJURUAN/ALIYAH KEJURUAN SWASTA",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Jasa pendidikan termasuk Consumer Cyclicals dalam IDX-IC.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "85251",
    "title": "SATUAN PENDIDIKAN KERJASAMA PENDIDIKAN MENENGAH ATAS",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Jasa pendidikan termasuk Consumer Cyclicals dalam IDX-IC.",
    "reviewNote": ""
  },
  {
    "code": "85252",
    "title": "SATUAN PENDIDIKAN KERJASAMA PENDIDIKAN MENENGAH KEJURUAN",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Jasa pendidikan termasuk Consumer Cyclicals dalam IDX-IC.",
    "reviewNote": ""
  },
  {
    "code": "85261",
    "title": "SATUAN PENDIDIKAN MUADALAH/ PENDIDIKAN DINIYAH FORMAL ULYA",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Jasa pendidikan termasuk Consumer Cyclicals dalam IDX-IC.",
    "reviewNote": ""
  },
  {
    "code": "85262",
    "title": "SATUAN PENDIDIKAN PESANTREN PENGKAJIAN KITAB KUNING ULYA",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Jasa pendidikan termasuk Consumer Cyclicals dalam IDX-IC.",
    "reviewNote": ""
  },
  {
    "code": "85263",
    "title": "SATUAN PENDIDIKAN MUADALAH WUSTHA DAN ULYA BERKESINAMBUNGAN",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Jasa pendidikan termasuk Consumer Cyclicals dalam IDX-IC.",
    "reviewNote": ""
  },
  {
    "code": "85270",
    "title": "SATUAN PENDIDIKAN KEAGAMAAN MENENGAH",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Jasa pendidikan termasuk Consumer Cyclicals dalam IDX-IC.",
    "reviewNote": ""
  },
  {
    "code": "85311",
    "title": "PENDIDIKAN TINGGI AKADEMIK PEMERINTAH",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Jasa pendidikan termasuk Consumer Cyclicals dalam IDX-IC.",
    "reviewNote": ""
  },
  {
    "code": "85312",
    "title": "PENDIDIKAN TINGGI VOKASI DAN PROFESI PEMERINTAH",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Jasa pendidikan termasuk Consumer Cyclicals dalam IDX-IC.",
    "reviewNote": ""
  },
  {
    "code": "85321",
    "title": "PENDIDIKAN TINGGI AKADEMIK SWASTA",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Jasa pendidikan termasuk Consumer Cyclicals dalam IDX-IC.",
    "reviewNote": ""
  },
  {
    "code": "85322",
    "title": "PENDIDIKAN TINGGI VOKASI DAN PROFESI SWASTA",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Jasa pendidikan termasuk Consumer Cyclicals dalam IDX-IC.",
    "reviewNote": ""
  },
  {
    "code": "85331",
    "title": "PENDIDIKAN TINGGI KEAGAMAAN PEMERINTAH",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Jasa pendidikan termasuk Consumer Cyclicals dalam IDX-IC.",
    "reviewNote": ""
  },
  {
    "code": "85332",
    "title": "PENDIDIKAN TINGGI KEAGAMAAN SWASTA",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Jasa pendidikan termasuk Consumer Cyclicals dalam IDX-IC.",
    "reviewNote": ""
  },
  {
    "code": "85340",
    "title": "PENDIDIKAN PESANTREN TINGGI (MA’HAD ALY)",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Jasa pendidikan termasuk Consumer Cyclicals dalam IDX-IC.",
    "reviewNote": ""
  },
  {
    "code": "85410",
    "title": "JASA PENDIDIKAN OLAHRAGA DAN REKREASI",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Jasa pendidikan termasuk Consumer Cyclicals dalam IDX-IC.",
    "reviewNote": ""
  },
  {
    "code": "85420",
    "title": "PENDIDIKAN KEBUDAYAAN",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Jasa pendidikan termasuk Consumer Cyclicals dalam IDX-IC.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "85430",
    "title": "PENDIDIKAN LAINNYA PEMERINTAH",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Jasa pendidikan termasuk Consumer Cyclicals dalam IDX-IC.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "85440",
    "title": "SATUAN PENDIDIKAN KERJASAMA PENDIDIKAN NONFORMAL",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Jasa pendidikan termasuk Consumer Cyclicals dalam IDX-IC.",
    "reviewNote": ""
  },
  {
    "code": "85451",
    "title": "PENDIDIKAN PESANTREN LAINNYA",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Jasa pendidikan termasuk Consumer Cyclicals dalam IDX-IC.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "85452",
    "title": "PENDIDIKAN KEAGAMAAN ISLAM NON FORMAL",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Jasa pendidikan termasuk Consumer Cyclicals dalam IDX-IC.",
    "reviewNote": ""
  },
  {
    "code": "85459",
    "title": "PENDIDIKAN KEAGAMAAN LAINNYA YTDL",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Jasa pendidikan termasuk Consumer Cyclicals dalam IDX-IC.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "85491",
    "title": "JASA PENDIDIKAN MANAJEMEN DAN PERBANKAN",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Jasa pendidikan termasuk Consumer Cyclicals dalam IDX-IC.",
    "reviewNote": ""
  },
  {
    "code": "85492",
    "title": "JASA PENDIDIKAN KOMPUTER (TEKNOLOGI INFORMASI DAN KOMUNIKASI) SWASTA",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Jasa pendidikan termasuk Consumer Cyclicals dalam IDX-IC.",
    "reviewNote": ""
  },
  {
    "code": "85493",
    "title": "PENDIDIKAN BAHASA SWASTA",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Jasa pendidikan termasuk Consumer Cyclicals dalam IDX-IC.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "85494",
    "title": "PENDIDIKAN KESEHATAN SWASTA",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Jasa pendidikan termasuk Consumer Cyclicals dalam IDX-IC.",
    "reviewNote": ""
  },
  {
    "code": "85495",
    "title": "PENDIDIKAN BIMBINGAN BELAJAR DAN KONSELING SWASTA",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Jasa pendidikan termasuk Consumer Cyclicals dalam IDX-IC.",
    "reviewNote": ""
  },
  {
    "code": "85496",
    "title": "PENDIDIKAN AWAK PESAWAT DAN JASA ANGKUTAN UDARA KHUSUS PENDIDIKAN AWAK PESAWAT",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Jasa pendidikan termasuk Consumer Cyclicals dalam IDX-IC.",
    "reviewNote": ""
  },
  {
    "code": "85497",
    "title": "PENDIDIKAN TEKNIK SWASTA",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Jasa pendidikan termasuk Consumer Cyclicals dalam IDX-IC.",
    "reviewNote": ""
  },
  {
    "code": "85498",
    "title": "PENDIDIKAN KERAJINAN DAN INDUSTRI",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Jasa pendidikan termasuk Consumer Cyclicals dalam IDX-IC.",
    "reviewNote": ""
  },
  {
    "code": "85499",
    "title": "PENDIDIKAN LAINNYA SWASTA",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Jasa pendidikan termasuk Consumer Cyclicals dalam IDX-IC.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "85500",
    "title": "KEGIATAN PENUNJANG PENDIDIKAN",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Jasa pendidikan termasuk Consumer Cyclicals dalam IDX-IC.",
    "reviewNote": ""
  },
  {
    "code": "86101",
    "title": "AKTIVITAS RUMAH SAKIT PEMERINTAH",
    "sector": "Healthcare",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Kesehatan manusia dan aktivitas sosial/panti terkait layanan kesehatan/sosial.",
    "reviewNote": ""
  },
  {
    "code": "86102",
    "title": "AKTIVITAS PUSKESMAS",
    "sector": "Healthcare",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Kesehatan manusia dan aktivitas sosial/panti terkait layanan kesehatan/sosial.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "86103",
    "title": "AKTIVITAS RUMAH SAKIT SWASTA",
    "sector": "Healthcare",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Kesehatan manusia dan aktivitas sosial/panti terkait layanan kesehatan/sosial.",
    "reviewNote": ""
  },
  {
    "code": "86104",
    "title": "AKTIVITAS KLINIK PEMERINTAH",
    "sector": "Healthcare",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Kesehatan manusia dan aktivitas sosial/panti terkait layanan kesehatan/sosial.",
    "reviewNote": ""
  },
  {
    "code": "86105",
    "title": "AKTIVITAS KLINIK SWASTA",
    "sector": "Healthcare",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Kesehatan manusia dan aktivitas sosial/panti terkait layanan kesehatan/sosial.",
    "reviewNote": ""
  },
  {
    "code": "86109",
    "title": "AKTIVITAS RUMAH SAKIT LAINNYA",
    "sector": "Healthcare",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Kesehatan manusia dan aktivitas sosial/panti terkait layanan kesehatan/sosial.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "86201",
    "title": "AKTIVITAS PRAKTIK DOKTER",
    "sector": "Healthcare",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Kesehatan manusia dan aktivitas sosial/panti terkait layanan kesehatan/sosial.",
    "reviewNote": ""
  },
  {
    "code": "86202",
    "title": "AKTIVITAS PRAKTIK DOKTER SPESIALIS",
    "sector": "Healthcare",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Kesehatan manusia dan aktivitas sosial/panti terkait layanan kesehatan/sosial.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "86203",
    "title": "AKTIVITAS PRAKTIK DOKTER GIGI",
    "sector": "Healthcare",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Kesehatan manusia dan aktivitas sosial/panti terkait layanan kesehatan/sosial.",
    "reviewNote": ""
  },
  {
    "code": "86901",
    "title": "AKTIVITAS PELAYANAN KESEHATAN YANG DILAKUKAN OLEH TENAGA KESEHATAN SELAIN DOKTER DAN DOKTER GIGI",
    "sector": "Healthcare",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Kesehatan manusia dan aktivitas sosial/panti terkait layanan kesehatan/sosial.",
    "reviewNote": ""
  },
  {
    "code": "86902",
    "title": "AKTIVITAS PELAYANAN KESEHATAN TRADISIONAL",
    "sector": "Healthcare",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Kesehatan manusia dan aktivitas sosial/panti terkait layanan kesehatan/sosial.",
    "reviewNote": ""
  },
  {
    "code": "86903",
    "title": "AKTIVITAS PELAYANAN PENUNJANG KESEHATAN",
    "sector": "Healthcare",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Kesehatan manusia dan aktivitas sosial/panti terkait layanan kesehatan/sosial.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "86904",
    "title": "AKTIVITAS ANGKUTAN KHUSUS PENGANGKUTAN ORANG SAKIT (MEDICAL EVACUATION)",
    "sector": "Healthcare",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Kesehatan manusia dan aktivitas sosial/panti terkait layanan kesehatan/sosial.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "87100",
    "title": "AKTIVITAS SOSIAL DI DALAM PANTI UNTUK PERAWATAN DAN PEMULIHAN KESEHATAN",
    "sector": "Healthcare",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Kesehatan manusia dan aktivitas sosial/panti terkait layanan kesehatan/sosial.",
    "reviewNote": ""
  },
  {
    "code": "87201",
    "title": "AKTIVITAS SOSIAL DI DALAM PANTI UNTUK PENYANDANG DISABILITAS GRAHITA",
    "sector": "Healthcare",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Kesehatan manusia dan aktivitas sosial/panti terkait layanan kesehatan/sosial.",
    "reviewNote": ""
  },
  {
    "code": "87202",
    "title": "AKTIVITAS SOSIAL DI DALAM PANTI UNTUK PENYANDANG DISABILITAS LARAS",
    "sector": "Healthcare",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Kesehatan manusia dan aktivitas sosial/panti terkait layanan kesehatan/sosial.",
    "reviewNote": ""
  },
  {
    "code": "87203",
    "title": "AKTIVITAS SOSIAL DI DALAM PANTI UNTUK KORBAN PENYALAH GUNAAN NARKOTIKA, ALKOHOL , PSIKOTROPIKA DAN ZAT ADIKTIF (NAPZA)",
    "sector": "Healthcare",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Kesehatan manusia dan aktivitas sosial/panti terkait layanan kesehatan/sosial.",
    "reviewNote": ""
  },
  {
    "code": "87301",
    "title": "AKTIVITAS SOSIAL PEMERINTAH DI DALAM PANTI UNTUK LANJUT USIA",
    "sector": "Healthcare",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Kesehatan manusia dan aktivitas sosial/panti terkait layanan kesehatan/sosial.",
    "reviewNote": ""
  },
  {
    "code": "87302",
    "title": "AKTIVITAS SOSIAL SWASTA DI DALAM PANTI UNTUK LANJUT USIA",
    "sector": "Healthcare",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Kesehatan manusia dan aktivitas sosial/panti terkait layanan kesehatan/sosial.",
    "reviewNote": ""
  },
  {
    "code": "87303",
    "title": "AKTIVITAS SOSIAL DI DALAM PANTI UNTUK PENYANDANG DISABILITAS NETRA",
    "sector": "Healthcare",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Kesehatan manusia dan aktivitas sosial/panti terkait layanan kesehatan/sosial.",
    "reviewNote": ""
  },
  {
    "code": "87304",
    "title": "AKTIVITAS SOSIAL DI DALAM PANTI UNTUK PENYANDANG DISABILITAS DAKSA",
    "sector": "Healthcare",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Kesehatan manusia dan aktivitas sosial/panti terkait layanan kesehatan/sosial.",
    "reviewNote": ""
  },
  {
    "code": "87305",
    "title": "AKTIVITAS SOSIAL DI DALAM PANTI UNTUK PENYANDANG DISABILITAS RUNGU WICARA",
    "sector": "Healthcare",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Kesehatan manusia dan aktivitas sosial/panti terkait layanan kesehatan/sosial.",
    "reviewNote": ""
  },
  {
    "code": "87901",
    "title": "AKTIVITAS PANTI ASUHAN PEMERINTAH",
    "sector": "Healthcare",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Kesehatan manusia dan aktivitas sosial/panti terkait layanan kesehatan/sosial.",
    "reviewNote": ""
  },
  {
    "code": "87902",
    "title": "AKTIVITAS PANTI ASUHAN SWASTA",
    "sector": "Healthcare",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Kesehatan manusia dan aktivitas sosial/panti terkait layanan kesehatan/sosial.",
    "reviewNote": ""
  },
  {
    "code": "87903",
    "title": "AKTIVITAS SOSIAL DI DALAM PANTI UNTUK ANAK YANG BERHADAPAN DENGAN HUKUM",
    "sector": "Healthcare",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Kesehatan manusia dan aktivitas sosial/panti terkait layanan kesehatan/sosial.",
    "reviewNote": ""
  },
  {
    "code": "87904",
    "title": "AKTIVITAS SOSIAL DI DALAM PANTI UNTUK BINA REMAJA",
    "sector": "Healthcare",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Kesehatan manusia dan aktivitas sosial/panti terkait layanan kesehatan/sosial.",
    "reviewNote": ""
  },
  {
    "code": "87905",
    "title": "AKTIVITAS SOSIAL DI DALAM PANTI UNTUK PETIRAHAN ANAK",
    "sector": "Healthcare",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Kesehatan manusia dan aktivitas sosial/panti terkait layanan kesehatan/sosial.",
    "reviewNote": ""
  },
  {
    "code": "87906",
    "title": "AKTIVITAS SOSIAL DI DALAM PANTI SOSIAL KARYA WANITA",
    "sector": "Healthcare",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Kesehatan manusia dan aktivitas sosial/panti terkait layanan kesehatan/sosial.",
    "reviewNote": ""
  },
  {
    "code": "87907",
    "title": "AKTIVITAS SOSIAL DI DALAM PANTI GELANDANGAN DAN PENGEMIS",
    "sector": "Healthcare",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Kesehatan manusia dan aktivitas sosial/panti terkait layanan kesehatan/sosial.",
    "reviewNote": ""
  },
  {
    "code": "87909",
    "title": "AKTIVITAS SOSIAL DI DALAM PANTI LAINNYA YTDL",
    "sector": "Healthcare",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Kesehatan manusia dan aktivitas sosial/panti terkait layanan kesehatan/sosial.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "88101",
    "title": "AKTIVITAS SOSIAL PEMERINTAH TANPA AKOMODASI UNTUK LANJUT USIA DAN PENYANDANG DISABILITAS",
    "sector": "Healthcare",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Kesehatan manusia dan aktivitas sosial/panti terkait layanan kesehatan/sosial.",
    "reviewNote": ""
  },
  {
    "code": "88102",
    "title": "AKTIVITAS SOSIAL SWASTA TANPA AKOMODASI UNTUK LANJUT USIA DAN PENYANDANG DISABILITAS",
    "sector": "Healthcare",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Kesehatan manusia dan aktivitas sosial/panti terkait layanan kesehatan/sosial.",
    "reviewNote": ""
  },
  {
    "code": "88911",
    "title": "AKTIVITAS SOSIAL PENGUMPULAN DANA KEISLAMAN",
    "sector": "Healthcare",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Kesehatan manusia dan aktivitas sosial/panti terkait layanan kesehatan/sosial.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "88919",
    "title": "AKTIVITAS SOSIAL PENGUMPULAN DANA LAINNYA",
    "sector": "Healthcare",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Kesehatan manusia dan aktivitas sosial/panti terkait layanan kesehatan/sosial.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "88991",
    "title": "AKTIVITAS SOSIAL PEMERINTAH TANPA AKOMODASI LAINNYA YTDL",
    "sector": "Healthcare",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Kesehatan manusia dan aktivitas sosial/panti terkait layanan kesehatan/sosial.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "88992",
    "title": "AKTIVITAS SOSIAL SWASTA TANPA AKOMODASI LAINNYA YTDL",
    "sector": "Healthcare",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Kesehatan manusia dan aktivitas sosial/panti terkait layanan kesehatan/sosial.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "90011",
    "title": "AKTIVITAS SENI PERTUNJUKAN",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Kesenian, hiburan, perjudian, olahraga, dan rekreasi adalah consumer discretionary.",
    "reviewNote": ""
  },
  {
    "code": "90012",
    "title": "AKTIVITAS PENUNJANG SENI PERTUNJUKAN",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Kesenian, hiburan, perjudian, olahraga, dan rekreasi adalah consumer discretionary.",
    "reviewNote": ""
  },
  {
    "code": "90021",
    "title": "PELAKU KREATIF SENI PERTUNJUKAN",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Kesenian, hiburan, perjudian, olahraga, dan rekreasi adalah consumer discretionary.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "90022",
    "title": "PELAKU KREATIF SENI MUSIK",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Kesenian, hiburan, perjudian, olahraga, dan rekreasi adalah consumer discretionary.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "90023",
    "title": "AKTIVITAS PELAKU KREATIF SENI RUPA",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Kesenian, hiburan, perjudian, olahraga, dan rekreasi adalah consumer discretionary.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "90024",
    "title": "AKTIVITAS PENULIS DAN PEKERJA SASTRA",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Kesenian, hiburan, perjudian, olahraga, dan rekreasi adalah consumer discretionary.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "90025",
    "title": "JURNALIS BERITA INDEPENDEN",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Kesenian, hiburan, perjudian, olahraga, dan rekreasi adalah consumer discretionary.",
    "reviewNote": ""
  },
  {
    "code": "90029",
    "title": "AKTIVITAS PEKERJA SENI DAN PEKERJA KREATIF LAINNYA",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Kesenian, hiburan, perjudian, olahraga, dan rekreasi adalah consumer discretionary.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "90030",
    "title": "AKTIVITAS IMPRESARIAT BIDANG SENI DAN FESTIVAL SENI",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Kesenian, hiburan, perjudian, olahraga, dan rekreasi adalah consumer discretionary.",
    "reviewNote": ""
  },
  {
    "code": "90040",
    "title": "AKTIVITAS OPERASIONAL FASILITAS SENI",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Kesenian, hiburan, perjudian, olahraga, dan rekreasi adalah consumer discretionary.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "90090",
    "title": "AKTIVITAS HIBURAN, SENI DAN KREATIVITAS LAINNYA",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Kesenian, hiburan, perjudian, olahraga, dan rekreasi adalah consumer discretionary.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "91011",
    "title": "PERPUSTAKAAN DAN ARSIP PEMERINTAH",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Kesenian, hiburan, perjudian, olahraga, dan rekreasi adalah consumer discretionary.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "91012",
    "title": "PERPUSTAKAAN DAN ARSIP SWASTA",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Kesenian, hiburan, perjudian, olahraga, dan rekreasi adalah consumer discretionary.",
    "reviewNote": ""
  },
  {
    "code": "91021",
    "title": "MUSEUM YANG DIKELOLA PEMERINTAH",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Kesenian, hiburan, perjudian, olahraga, dan rekreasi adalah consumer discretionary.",
    "reviewNote": ""
  },
  {
    "code": "91022",
    "title": "MUSEUM YANG DIKELOLA SWASTA",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Kesenian, hiburan, perjudian, olahraga, dan rekreasi adalah consumer discretionary.",
    "reviewNote": ""
  },
  {
    "code": "91023",
    "title": "PENINGGALAN SEJARAH/CAGAR BUDAYA YANG DIKELOLA PEMERINTAH",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Kesenian, hiburan, perjudian, olahraga, dan rekreasi adalah consumer discretionary.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "91024",
    "title": "PENINGGALAN SEJARAH/CAGAR BUDAYA YANG DIKELOLA SWASTA",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Kesenian, hiburan, perjudian, olahraga, dan rekreasi adalah consumer discretionary.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "91025",
    "title": "TAMAN BUDAYA",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Kesenian, hiburan, perjudian, olahraga, dan rekreasi adalah consumer discretionary.",
    "reviewNote": ""
  },
  {
    "code": "91029",
    "title": "WISATA BUDAYA LAINNYA",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Kesenian, hiburan, perjudian, olahraga, dan rekreasi adalah consumer discretionary.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "91031",
    "title": "TAMAN KONSERVASI DI LUAR HABITAT ALAMI (EX-SITU)",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Kesenian, hiburan, perjudian, olahraga, dan rekreasi adalah consumer discretionary.",
    "reviewNote": ""
  },
  {
    "code": "91032",
    "title": "TAMAN NASIONAL",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Kesenian, hiburan, perjudian, olahraga, dan rekreasi adalah consumer discretionary.",
    "reviewNote": ""
  },
  {
    "code": "91033",
    "title": "TAMAN HUTAN RAYA",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Kesenian, hiburan, perjudian, olahraga, dan rekreasi adalah consumer discretionary.",
    "reviewNote": ""
  },
  {
    "code": "91034",
    "title": "TAMAN WISATA ALAM",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Kesenian, hiburan, perjudian, olahraga, dan rekreasi adalah consumer discretionary.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "91035",
    "title": "SUAKA MARGASATWA",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Kesenian, hiburan, perjudian, olahraga, dan rekreasi adalah consumer discretionary.",
    "reviewNote": ""
  },
  {
    "code": "91036",
    "title": "TAMAN LAUT",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Kesenian, hiburan, perjudian, olahraga, dan rekreasi adalah consumer discretionary.",
    "reviewNote": ""
  },
  {
    "code": "91037",
    "title": "KAWASAN BURU",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Kesenian, hiburan, perjudian, olahraga, dan rekreasi adalah consumer discretionary.",
    "reviewNote": ""
  },
  {
    "code": "91038",
    "title": "HUTAN LINDUNG",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Kesenian, hiburan, perjudian, olahraga, dan rekreasi adalah consumer discretionary.",
    "reviewNote": ""
  },
  {
    "code": "91039",
    "title": "AKTIVITAS KAWASAN ALAM LAINNYA",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Kesenian, hiburan, perjudian, olahraga, dan rekreasi adalah consumer discretionary.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "92000",
    "title": "AKTIVITAS PERJUDIAN DAN PERTARUHAN",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Kesenian, hiburan, perjudian, olahraga, dan rekreasi adalah consumer discretionary.",
    "reviewNote": ""
  },
  {
    "code": "93111",
    "title": "FASILITAS STADION",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Kesenian, hiburan, perjudian, olahraga, dan rekreasi adalah consumer discretionary.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "93112",
    "title": "FASILITAS SIRKUIT",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Kesenian, hiburan, perjudian, olahraga, dan rekreasi adalah consumer discretionary.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "93113",
    "title": "FASILITAS GELANGGANG/ARENA",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Kesenian, hiburan, perjudian, olahraga, dan rekreasi adalah consumer discretionary.",
    "reviewNote": ""
  },
  {
    "code": "93114",
    "title": "FASILITAS LAPANGAN",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Kesenian, hiburan, perjudian, olahraga, dan rekreasi adalah consumer discretionary.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "93115",
    "title": "FASILITAS OLAHRAGA BELADIRI",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Kesenian, hiburan, perjudian, olahraga, dan rekreasi adalah consumer discretionary.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "93116",
    "title": "FASILITAS PUSAT KEBUGARAN/ FITNESS CENTER",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Kesenian, hiburan, perjudian, olahraga, dan rekreasi adalah consumer discretionary.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "93119",
    "title": "PENGELOLAAN FASILITAS OLAH RAGA LAINNYA",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Kesenian, hiburan, perjudian, olahraga, dan rekreasi adalah consumer discretionary.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "93121",
    "title": "KLUB SEPAK BOLA",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Kesenian, hiburan, perjudian, olahraga, dan rekreasi adalah consumer discretionary.",
    "reviewNote": ""
  },
  {
    "code": "93122",
    "title": "KLUB GOLF",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Kesenian, hiburan, perjudian, olahraga, dan rekreasi adalah consumer discretionary.",
    "reviewNote": ""
  },
  {
    "code": "93123",
    "title": "KLUB RENANG",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Kesenian, hiburan, perjudian, olahraga, dan rekreasi adalah consumer discretionary.",
    "reviewNote": ""
  },
  {
    "code": "93124",
    "title": "KLUB TENIS LAPANGAN",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Kesenian, hiburan, perjudian, olahraga, dan rekreasi adalah consumer discretionary.",
    "reviewNote": ""
  },
  {
    "code": "93125",
    "title": "KLUB TINJU",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Kesenian, hiburan, perjudian, olahraga, dan rekreasi adalah consumer discretionary.",
    "reviewNote": ""
  },
  {
    "code": "93126",
    "title": "KLUB BELA DIRI",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Kesenian, hiburan, perjudian, olahraga, dan rekreasi adalah consumer discretionary.",
    "reviewNote": ""
  },
  {
    "code": "93127",
    "title": "KLUB KEBUGARAN/FITNESS DAN BINARAGA",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Kesenian, hiburan, perjudian, olahraga, dan rekreasi adalah consumer discretionary.",
    "reviewNote": ""
  },
  {
    "code": "93128",
    "title": "KLUB BOWLING",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Kesenian, hiburan, perjudian, olahraga, dan rekreasi adalah consumer discretionary.",
    "reviewNote": ""
  },
  {
    "code": "93129",
    "title": "KLUB OLAHRAGA LAINNYA",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Kesenian, hiburan, perjudian, olahraga, dan rekreasi adalah consumer discretionary.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "93191",
    "title": "PROMOTOR KEGIATAN OLAHRAGA",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Kesenian, hiburan, perjudian, olahraga, dan rekreasi adalah consumer discretionary.",
    "reviewNote": ""
  },
  {
    "code": "93192",
    "title": "OLAHRAGAWAN, JURI DAN WASIT PROFESIONAL",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Kesenian, hiburan, perjudian, olahraga, dan rekreasi adalah consumer discretionary.",
    "reviewNote": ""
  },
  {
    "code": "93193",
    "title": "AKTIVITAS PERBURUAN",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Kesenian, hiburan, perjudian, olahraga, dan rekreasi adalah consumer discretionary.",
    "reviewNote": ""
  },
  {
    "code": "93194",
    "title": "BADAN REGULASI DAN LIGA OLAHRAGA",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Kesenian, hiburan, perjudian, olahraga, dan rekreasi adalah consumer discretionary.",
    "reviewNote": ""
  },
  {
    "code": "93195",
    "title": "AKTIVITAS OLAHRAGA TRADISIONAL",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Kesenian, hiburan, perjudian, olahraga, dan rekreasi adalah consumer discretionary.",
    "reviewNote": ""
  },
  {
    "code": "93199",
    "title": "AKTIVITAS LAINNYA YANG BERKAITAN DENGAN OLAHRAGA",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Kesenian, hiburan, perjudian, olahraga, dan rekreasi adalah consumer discretionary.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "93211",
    "title": "TAMAN REKREASI",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Kesenian, hiburan, perjudian, olahraga, dan rekreasi adalah consumer discretionary.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "93219",
    "title": "AKTIVITAS TAMAN BERTEMA ATAU TAMAN HIBURAN LAINNYA",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Kesenian, hiburan, perjudian, olahraga, dan rekreasi adalah consumer discretionary.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "93221",
    "title": "PEMANDIAN ALAM",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Kesenian, hiburan, perjudian, olahraga, dan rekreasi adalah consumer discretionary.",
    "reviewNote": ""
  },
  {
    "code": "93222",
    "title": "WISATA GUA",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Kesenian, hiburan, perjudian, olahraga, dan rekreasi adalah consumer discretionary.",
    "reviewNote": ""
  },
  {
    "code": "93223",
    "title": "WISATA PETUALANGAN ALAM",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Kesenian, hiburan, perjudian, olahraga, dan rekreasi adalah consumer discretionary.",
    "reviewNote": ""
  },
  {
    "code": "93224",
    "title": "WISATA PANTAI",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Kesenian, hiburan, perjudian, olahraga, dan rekreasi adalah consumer discretionary.",
    "reviewNote": ""
  },
  {
    "code": "93229",
    "title": "DAYA TARIK WISATA ALAM LAINNYA",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Kesenian, hiburan, perjudian, olahraga, dan rekreasi adalah consumer discretionary.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "93231",
    "title": "WISATA AGRO",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Kesenian, hiburan, perjudian, olahraga, dan rekreasi adalah consumer discretionary.",
    "reviewNote": ""
  },
  {
    "code": "93239",
    "title": "DAYA TARIK WISATA BUATAN/BINAAN MANUSIA LAINNYA",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Kesenian, hiburan, perjudian, olahraga, dan rekreasi adalah consumer discretionary.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "93241",
    "title": "ARUNG JERAM",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Kesenian, hiburan, perjudian, olahraga, dan rekreasi adalah consumer discretionary.",
    "reviewNote": ""
  },
  {
    "code": "93242",
    "title": "WISATA SELAM",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Kesenian, hiburan, perjudian, olahraga, dan rekreasi adalah consumer discretionary.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "93243",
    "title": "DERMAGA MARINA",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Kesenian, hiburan, perjudian, olahraga, dan rekreasi adalah consumer discretionary.",
    "reviewNote": ""
  },
  {
    "code": "93244",
    "title": "KOLAM PEMANCINGAN",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Kesenian, hiburan, perjudian, olahraga, dan rekreasi adalah consumer discretionary.",
    "reviewNote": ""
  },
  {
    "code": "93245",
    "title": "WISATA MEMANCING",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Kesenian, hiburan, perjudian, olahraga, dan rekreasi adalah consumer discretionary.",
    "reviewNote": ""
  },
  {
    "code": "93246",
    "title": "AKTIVITAS WISATA AIR",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Kesenian, hiburan, perjudian, olahraga, dan rekreasi adalah consumer discretionary.",
    "reviewNote": ""
  },
  {
    "code": "93249",
    "title": "WISATA TIRTA LAINNYA",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Kesenian, hiburan, perjudian, olahraga, dan rekreasi adalah consumer discretionary.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "93291",
    "title": "KLUB MALAM",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Kesenian, hiburan, perjudian, olahraga, dan rekreasi adalah consumer discretionary.",
    "reviewNote": ""
  },
  {
    "code": "93292",
    "title": "KARAOKE",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Kesenian, hiburan, perjudian, olahraga, dan rekreasi adalah consumer discretionary.",
    "reviewNote": ""
  },
  {
    "code": "93293",
    "title": "USAHA ARENA PERMAINAN",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Kesenian, hiburan, perjudian, olahraga, dan rekreasi adalah consumer discretionary.",
    "reviewNote": ""
  },
  {
    "code": "93294",
    "title": "DISKOTEK",
    "sector": "Consumer Cyclicals",
    "confidence": "High",
    "alternativeSector": "",
    "reason": "Kesenian, hiburan, perjudian, olahraga, dan rekreasi adalah consumer discretionary.",
    "reviewNote": ""
  },
  {
    "code": "93299",
    "title": "AKTIVITAS HIBURAN DAN REKREASI LAINNYA YTDL",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Kesenian, hiburan, perjudian, olahraga, dan rekreasi adalah consumer discretionary.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "94110",
    "title": "AKTIVITAS ORGANISASI BISNIS DAN PENGUSAHA",
    "sector": "Industrials",
    "confidence": "Low",
    "alternativeSector": "Consumer Cyclicals",
    "reason": "Aktivitas keanggotaan/organisasi jasa lain tidak memiliki sektor IDX perusahaan yang langsung setara.",
    "reviewNote": "Cek bentuk entitas dan aktivitas pendapatan utama."
  },
  {
    "code": "94121",
    "title": "AKTIVITAS ORGANISASI ILMU PENGETAHUAN SOSIAL DAN MASYARAKAT",
    "sector": "Industrials",
    "confidence": "Low",
    "alternativeSector": "Consumer Cyclicals",
    "reason": "Aktivitas keanggotaan/organisasi jasa lain tidak memiliki sektor IDX perusahaan yang langsung setara.",
    "reviewNote": "Cek bentuk entitas dan aktivitas pendapatan utama."
  },
  {
    "code": "94122",
    "title": "AKTIVITAS ORGANISASI ILMU PENGETAHUAN ALAM DAN TEKNOLOGI",
    "sector": "Industrials",
    "confidence": "Low",
    "alternativeSector": "Consumer Cyclicals",
    "reason": "Aktivitas keanggotaan/organisasi jasa lain tidak memiliki sektor IDX perusahaan yang langsung setara.",
    "reviewNote": "Cek bentuk entitas dan aktivitas pendapatan utama."
  },
  {
    "code": "94200",
    "title": "AKTIVITAS ORGANISASI BURUH",
    "sector": "Industrials",
    "confidence": "Low",
    "alternativeSector": "Consumer Cyclicals",
    "reason": "Aktivitas keanggotaan/organisasi jasa lain tidak memiliki sektor IDX perusahaan yang langsung setara.",
    "reviewNote": "Cek bentuk entitas dan aktivitas pendapatan utama."
  },
  {
    "code": "94910",
    "title": "AKTIVITAS ORGANISASI KEAGAMAAN",
    "sector": "Industrials",
    "confidence": "Low",
    "alternativeSector": "Consumer Cyclicals",
    "reason": "Aktivitas keanggotaan/organisasi jasa lain tidak memiliki sektor IDX perusahaan yang langsung setara.",
    "reviewNote": "Cek bentuk entitas dan aktivitas pendapatan utama."
  },
  {
    "code": "94920",
    "title": "AKTIVITAS ORGANISASI POLITIK",
    "sector": "Industrials",
    "confidence": "Low",
    "alternativeSector": "Consumer Cyclicals",
    "reason": "Aktivitas keanggotaan/organisasi jasa lain tidak memiliki sektor IDX perusahaan yang langsung setara.",
    "reviewNote": "Cek bentuk entitas dan aktivitas pendapatan utama."
  },
  {
    "code": "94990",
    "title": "AKTIVITAS ORGANISASI KEANGGOTAAN LAINNYA YTDL",
    "sector": "Industrials",
    "confidence": "Low",
    "alternativeSector": "Consumer Cyclicals",
    "reason": "Aktivitas keanggotaan/organisasi jasa lain tidak memiliki sektor IDX perusahaan yang langsung setara.",
    "reviewNote": "Cek bentuk entitas dan aktivitas pendapatan utama."
  },
  {
    "code": "95110",
    "title": "REPARASI KOMPUTER DAN PERALATAN SEJENISNYA",
    "sector": "Technology",
    "confidence": "Medium",
    "alternativeSector": "Consumer Cyclicals",
    "reason": "Reparasi komputer/perangkat komunikasi mengikuti Technology.",
    "reviewNote": ""
  },
  {
    "code": "95120",
    "title": "REPARASI PERALATAN KOMUNIKASI",
    "sector": "Technology",
    "confidence": "Medium",
    "alternativeSector": "Consumer Cyclicals",
    "reason": "Reparasi komputer/perangkat komunikasi mengikuti Technology.",
    "reviewNote": ""
  },
  {
    "code": "95210",
    "title": "REPARASI ALAT-ALAT ELEKTRONIK KONSUMEN",
    "sector": "Technology",
    "confidence": "Medium",
    "alternativeSector": "Consumer Cyclicals",
    "reason": "Reparasi komputer/perangkat komunikasi mengikuti Technology.",
    "reviewNote": ""
  },
  {
    "code": "95220",
    "title": "REPARASI PERALATAN RUMAH TANGGA DAN PERALATAN RUMAH DAN KEBUN",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "Industrials",
    "reason": "Reparasi barang pribadi/rumah tangga adalah jasa konsumen siklis.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "95230",
    "title": "REPARASI ALAS KAKI DAN BARANG DARI KULIT",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "Industrials",
    "reason": "Reparasi barang pribadi/rumah tangga adalah jasa konsumen siklis.",
    "reviewNote": ""
  },
  {
    "code": "95240",
    "title": "REPARASI FURNITUR DAN PERLENGKAPAN RUMAH",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "Industrials",
    "reason": "Reparasi barang pribadi/rumah tangga adalah jasa konsumen siklis.",
    "reviewNote": ""
  },
  {
    "code": "95291",
    "title": "AKTIVITAS VERMAK PAKAIAN",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "Industrials",
    "reason": "Reparasi barang pribadi/rumah tangga adalah jasa konsumen siklis.",
    "reviewNote": ""
  },
  {
    "code": "95299",
    "title": "REPARASI BARANG RUMAH TANGGA DAN PRIBADI LAINNYA",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "Industrials",
    "reason": "Reparasi barang pribadi/rumah tangga adalah jasa konsumen siklis.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "96111",
    "title": "AKTIVITAS PANGKAS RAMBUT",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Jasa perorangan seperti binatu, salon, dan jasa pribadi lain adalah consumer services.",
    "reviewNote": ""
  },
  {
    "code": "96112",
    "title": "AKTIVITAS SALON KECANTIKAN",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Jasa perorangan seperti binatu, salon, dan jasa pribadi lain adalah consumer services.",
    "reviewNote": ""
  },
  {
    "code": "96121",
    "title": "RUMAH PIJAT",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Jasa perorangan seperti binatu, salon, dan jasa pribadi lain adalah consumer services.",
    "reviewNote": ""
  },
  {
    "code": "96122",
    "title": "AKTIVITAS SPA (SANTE PAR AQUA)",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Jasa perorangan seperti binatu, salon, dan jasa pribadi lain adalah consumer services.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "96129",
    "title": "AKTIVITAS KEBUGARAN LAINNYA",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Jasa perorangan seperti binatu, salon, dan jasa pribadi lain adalah consumer services.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "96200",
    "title": "AKTIVITAS PENATU",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Jasa perorangan seperti binatu, salon, dan jasa pribadi lain adalah consumer services.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "96910",
    "title": "AKTIVITAS PEMAKAMAN DAN KEGIATAN YBDI",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Jasa perorangan seperti binatu, salon, dan jasa pribadi lain adalah consumer services.",
    "reviewNote": ""
  },
  {
    "code": "96990",
    "title": "AKTIVITAS JASA PERORANGAN LAINNYA YTDL",
    "sector": "Consumer Cyclicals",
    "confidence": "Medium",
    "alternativeSector": "",
    "reason": "Jasa perorangan seperti binatu, salon, dan jasa pribadi lain adalah consumer services.",
    "reviewNote": "Uraian bersifat residual/umum; cek aktivitas dominan perusahaan jika digunakan untuk analisa emiten."
  },
  {
    "code": "97000",
    "title": "AKTIVITAS RUMAH TANGGA SEBAGAI PEMBERI KERJA DARI PERSONIL DOMESTIK",
    "sector": "Consumer Cyclicals",
    "confidence": "Low",
    "alternativeSector": "Consumer Non-Cyclicals",
    "reason": "Aktivitas rumah tangga/own-use bukan emiten; forced mapping paling dekat ke jasa/konsumsi rumah tangga.",
    "reviewNote": "Tidak lazim untuk klasifikasi perusahaan; review manual jika dipakai."
  },
  {
    "code": "98100",
    "title": "AKTIVITAS YANG MENGHASILKAN BARANG OLEH RUMAH TANGGA YANG DIGUNAKAN UNTUK MEMENUHI KEBUTUHAN SENDIRI",
    "sector": "Consumer Cyclicals",
    "confidence": "Low",
    "alternativeSector": "Consumer Non-Cyclicals",
    "reason": "Aktivitas rumah tangga/own-use bukan emiten; forced mapping paling dekat ke jasa/konsumsi rumah tangga.",
    "reviewNote": "Tidak lazim untuk klasifikasi perusahaan; review manual jika dipakai."
  },
  {
    "code": "98200",
    "title": "AKTIVITAS YANG MENGHASILKAN JASA OLEH RUMAH TANGGA YANG DIGUNAKAN UNTUK MEMENUHI KEBUTUHAN SENDIRI",
    "sector": "Consumer Cyclicals",
    "confidence": "Low",
    "alternativeSector": "Consumer Non-Cyclicals",
    "reason": "Aktivitas rumah tangga/own-use bukan emiten; forced mapping paling dekat ke jasa/konsumsi rumah tangga.",
    "reviewNote": "Tidak lazim untuk klasifikasi perusahaan; review manual jika dipakai."
  },
  {
    "code": "99000",
    "title": "AKTIVITAS BADAN INTERNASIONAL DAN BADAN EKSTRA INTERNASIONAL LAINNYA",
    "sector": "Industrials",
    "confidence": "Low",
    "alternativeSector": "Infrastructures",
    "reason": "Badan internasional bukan emiten; forced mapping paling dekat ke jasa kelembagaan/professional services.",
    "reviewNote": "Tidak lazim untuk klasifikasi perusahaan; review manual jika dipakai."
  }
] satisfies KluSectorRecord[];
