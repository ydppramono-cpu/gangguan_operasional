# Ringkasan rilis v3.16.1 — perbaikan cepat UI (hasil penilaian 23 Nov 2026)

Keputusan pemilik 23 Nov 2026: navigasi 5 ruang kerja · halaman tetap bertab tetapi dirampingkan · filter kontekstual + tautan URL ·
urutan: perbaikan cepat (rilis ini) → tata ulang besar → laci petak & lingkungan. SCHEMA tetap 14; data dan laporan PPT/PDF/Excel tidak berubah.

## Diperbaiki
- **Gulir halaman terkunci di atas grafik**: zoom 'inside' ECharts menangkap roda mouse. Kini zoom/geser hanya di tampilan besar; di halaman
  hanya slider untuk sumbu > 31 kategori.
- **Bilah alat grafik** 6 ikon → 2: tampilan besar + menu unduh (PNG, CSV, atur ulang geser).
- **Grafik kekuatan depo**: tanpa sumbu ganda; batang horizontal satu sumbu, warna rentang berlegenda, laju gangguan per 100 unit pada label.
- **Status kesehatan** seragam "Healthy / Monitor / Declining" di tabel, kartu, dan grafik halaman Sarana (nilai data tetap).
- **Nomor sarana** seragam berformat "CC 201 83 48" di tab Kesehatan.
- **Tabel Daftar unit**: angka dan status tidak lagi menempel ("71,6 · Monitor").
- **Klasemen depo**: nama depo tidak terpotong ("Tanjungkarang (TNK)", nama lengkap di tooltip); sel kosong "–" (tidak lagi "Tidak tercatat" bertumpuk).

## Duplikat dihapus
- Profil unit: tabel "Riwayat gangguan" dihapus; tabel "Dinasan & gangguan" kini memuat SEMUA kejadian yang mencantumkan unit
  (jumlahnya sama dengan "Seluruh data"), lengkap dengan jam, lokasi, wilayah, kelas.
- Sarana → Ringkasan: kartu "Frekuensi/Kelambatan tertinggi" per periode (sama dengan tabel Unit berulang).
- Sarana → Kesehatan: tabel "Kondisi lokomotif per depo" (sama dengan tab Depo & Balai Yasa).
- Menu samping "Cari & profil" dan "Unduh" (sama dengan kotak cari dan tombol Unduh di header; halamannya tetap ada).

## Temuan otomatis sesuai konteks
- Profil satu unit tidak lagi menampilkan temuan tingkat armada (unit berulang, usia armada, komposisi kelas).
- Di halaman profil/detail, rekomendasi umum tanpa rujukan disembunyikan; temuannya tetap.

## Filter
- Chip kelas (Operasional/Sarana/Alam/Prasarana) disembunyikan di Sarana, Grafik perjalanan, Metodologi, Unduh — kecuali bila filter kelas sedang aktif.

## Uji
check · emu 22/22 bersih · switch · alur · akses — LULUS. Roda mouse di atas grafik menggulir halaman (diuji Playwright).
