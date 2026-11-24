# Ringkasan rilis v3.22.0 — 24 Nov 2026

**Gelombang A "Cepat & rapi"** (pilihan pemilik 24 Nov 2026). Gelombang berikutnya: B peringatan dini (hanya di app) + risiko relatif per petak → C Batubara tuntas → D ruang Pusdal.

## Isi
- **Mutu data per wilayah** (Telusuri → Mutu data):
  - skor kelengkapan isian wajib per Daop/Divre, dibandingkan dengan periode lalu;
  - isian wajib yang paling sering bermasalah;
  - daftar kejadian yang perlu dilengkapi, bisa disaring per wilayah dan per masalah;
  - **Unduh Excel** berisi ringkasan per wilayah dan daftar beserta saran perbaikannya. Tidak menulis ke Sheets.
  - Isian wajib: tanggal, kategori & subgangguan, menit, lokasi, jam. Isian pelengkap (nomor KA di kolomnya, nomor sarana, penyebab, wilayah) tersembunyi secara bawaan.
  - Sinkron kini menandai "Menit kosong". Sebelum sinkron berikutnya, label tetap jujur: "Menit 0 atau kosong".
- **Waktu muat:**
  - setiap respons server membawa lama kerja server;
  - halaman membawa lama perakitan di server;
  - browser menyimpan 10 kali buka terakhir secara lokal (tidak dikirim) dan menampilkannya di Metodologi → "Waktu muat di perangkat ini".
  - Lazy-load **tidak** dikerjakan dulu: hasil ukur di emulator menunjukkan penghematannya hanya ±27% ukuran halaman (369 KB terkompresi). Keputusan menunggu angka produksi.
  - Logo tidak dikompres: cara tanpa mengubah rupa hanya menghemat 1%. Cara palet menghemat 75%, tetapi mengubah piksel tepi (beda maksimal 30 dari 255), jadi tidak dipakai.
- **Tanpa singkatan** di web dan laporan PPT:
  - menit (bukan `'`), kejadian, kegiatan, melebihi program, gangguan prasarana, penumpang, juta, miliar, bulan, detik, tanggal, jumlah;
  - Material/Konstruksi (komponen THI), Reliability, Maintenance index, Umur (tahun).
  - Lebar kolom PPT disesuaikan.
  - Istilah baku tetap dipakai: KA, THI, RHI, WKP, JPL, MoM, YoY, YTD.
- **Navigasi atas:** tab ruang kerja tidak lagi terpotong. Di layar 721–1180 px tab pindah ke baris sendiri.

## Uji
LULUS:
- `npm run check`;
- `test:emu` STRICT (termasuk rute `mutu`);
- `test:sim`, `test:gapeka`, `test:switch`, `test:pulau`, `test:akses`, `test:alur`, `test:bq`;
- `test:mutu` (baru).

Laporan PPT dibuat ulang di emulator: validasi berkas lulus, tidak ada singkatan tersisa pada teks yang diperiksa.
