# Dashboard Gangguan Operasional v3.8.0 — catatan rilis (13 Nov 2026)

## 1. Database (dipulihkan 12 Nov 2026)
- Cadangan: Drive "BACKUP sebelum pemulihan angka Passenger-Freight 2026-11-12".
- Passenger: angka ribuan yang terpotong saat ekspor dipulihkan (contoh "9,7" → 9.700; "31,513" → 31.513; Rp960 → Rp960.000).
  - Diuji dengan Jumlah = EKO+EKS+BIS dan Pendapatan = ΣPendapatan kelas; selisih 0 baris.
  - 7 baris ambigu diputuskan dengan median pendapatan/penumpang KA yang sama.
- Freight:
  - 1.195 tarif dan 2 pendapatan dipulihkan, diuji dengan Tarif ≈ Pendapatan ÷ Volume.
  - Kolom B, G dan I yang sebelumnya bertipe teks diubah menjadi angka.
- Checksum sheet sama dengan hasil lokal: Σ penumpang 52.009.142; Σ pendapatan penumpang Rp10.107.944.757.017; Σ pendapatan barang Rp10.139.478.581.105; Σ volume 59.624.422,65 ton.
- Tidak diubah karena tidak dapat diverifikasi: 77 baris Freight berpendapatan dengan volume 0, dan 3 baris koreksi negatif.
- Web app memakai aturan yang sama saat membaca (`16_Pendapatan.gs`). Data mentah lama dan data DB baru menghasilkan output identik. Pada data bersih, 0 sel dipulihkan.

## 2. Pendapatan terekspos (Revenue at Risk, tahap 1 = Gross RaR)
- Rumus: RaR = menit KELKA ÷ 60 × rate per jam, sesuai jenis KA dan bulan kejadian.
- Rate KA penumpang per bulan = Σ pendapatan KA termatch ÷ Σ jam perjalanan KA termatch.
  - Pencocokan nomor KA ke GAPEKA: persis, nomor gabungan, atau nomor dasar varian. Perjalanan PLB dipakai.
  - Perjalanan FAK, KLB dan KA tambahan tidak dipakai karena frekuensinya tidak diketahui.
  - Durasi perjalanan dihitung dari GAPEKA × hari dalam bulan.
- Rate KA barang per bulan = Σ pendapatan komoditas KA termatch ÷ Σ jam semua perjalanan reguler bernama sama di GAPEKA × hari.
- Bulan yang belum lengkap (bulan berjalan, atau sebelum Jan 2026) memakai rate acuan, yaitu rata-rata tertimbang bulan lengkap: penumpang Rp14,4 juta/jam; barang Rp18,3 juta/jam.
- Hasil Jan–Agu 2026 dari DB: total Rp55,0 M (penumpang Rp39,6 M, 79,3% menit KA termatch; barang Rp15,4 M, 92,4% menit termatch).
- Selisih dengan contoh validasi (Rp163,8 M): (1) kejadian banjir Pekalongan 19 Jan 2026 (85.382 menit) tercatat sebagai KA 109 Fajar Utama YK, KA penumpang (Rp17,4 M), bukan KA barang; (2) rate barang GAPEKA ≈ Rp15–20 juta/jam vs ≈ Rp64 juta/jam di contoh (setara satu perjalanan per nama KA, padahal GAPEKA mencatat 230+ perjalanan reguler untuk ±42 nama KA).
- Pendapatan belum termatch GAPEKA ditampilkan: KA tambahan 7xxx; KA barang Baratambang, Barabau, Uji Coba; baris tanpa nama KA (batubara Rp412,9 M; kiriman hantaran Rp162,9 M).
- Model bertahap:

  | Tahap | Rumus | Status |
  |---|---|---|
  | 1. Gross RaR | menit KELKA ÷ 60 × rate | Aktif |
  | 2. Net RaR | Gross × faktor dampak | Belum |
  | 3. Kerugian aktual | refund + kompensasi + pembatalan + SLA + klaim − terpulihkan | Belum |
  | 4. Profit at risk | × contribution margin | Belum |

  Sebelum dipakai sebagai kerugian, perlu sign-off Operasi, Komersial, Keuangan dan Manajemen Risiko.

## 3. Struktur menu
- Menu "Kondisi prasarana & sarana" dihapus.
- **Wilayah & koridor**: tab Peringkat wilayah & koridor; tab Kondisi prasarana (THI × WKP × gangguan, per UPT JR, kuadran P1–P4, tabel petak THI terendah dari tingkat Petak).
- **Sarana & armada**: tab Gangguan sarana; tab Kesehatan lokomotif (RHI); tab Armada, depo & usia. RHI kini multi-bulan (16 Agu–31 Okt). Bulan tanpa RHI memakai RHI terakhir ≤ tanggal kejadian, dengan label "RHI per 31 Okt".
- Tautan lama `?page=kondisi` dialihkan otomatis ke tab yang sesuai.
- Standar tampilan: angka Indonesia di semua label dan tooltip grafik; legenda tidak menimpa ikon; label versi di sidebar mengikuti APP_VERSION; lebar 400 px tanpa gulir horizontal.
- Uji: Playwright pada 1500 px dan 400 px, 0 galat konsol.

## 4. Unduhan PPT/PDF
- Struktur tetap. Slide eksposur diganti menjadi "Pendapatan terekspos" (rate bulan berjalan; cakupan pencocokan; Pareto Rp; tahap lanjut menuju kerugian aktual).
- Angka THI/RHI mengikuti DB terbaru. THI Okt berubah dari v3.7: median 83,4; P1 = 20 UPT.
