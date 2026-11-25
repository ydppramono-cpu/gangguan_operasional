# Ringkasan rilis v3.25.0 — 25 Nov 2026

Keputusan pemilik 25 Nov 2026:
- **RHI kereta & gerbong:** hanya RHI resmi. Unit tanpa RHI ditulis "RHI tidak tercatat" dan tidak ikut rata-rata. Skor turunan dihapus dari tampilan.
- **Prasarana (Profil rute):** diagram lintas berlapis.
- **JPL:** nama jalan dari OpenStreetMap ditambah riset web untuk JPL prioritas dan JPL yang punya kejadian. Setiap temuan web bertautan sumber; sisanya "tidak tercatat".
- **Penyusun angka disembunyikan:** hilang dari web app dan PPT, disimpan di spreadsheet Diagnostik. Label "perkiraan" tetap tampil (aturan proyek).

## Armada — RHI resmi
- Kereta dan gerbong memakai RHI dari spreadsheet "KAI | RHI Sarana" (bulan terakhir per unit). Lokomotif tetap dari tab RHI.
- Cakupan terhadap armada SAP: kereta 2.211 dari 2.296 unit, gerbong 8.930 dari 9.222 unit cocok nomor.
- Status 5 kelas: Healthy · Monitor · Declining · Poor · Critical. Kolom depo "H / M / D / P" (P = Poor + Critical).
- Kekuatan depo: unit tanpa RHI tidak dihitung pada komponen kesehatan, dan bobot komponen lain dinormalkan ulang.
- Tab Kesehatan K/G: grafik "RHI × laju gangguan" (kelas < 55, 55–70, 70–85, ≥ 85) dan grafik usia. Kartu skor turunan dan daftar pantau turunan dihapus.

## Penyusun angka → spreadsheet Diagnostik
- Spreadsheet baru "KAI | Diagnostik Web App" (Script Property `DIAG_DB_ID`, dibuat otomatis) ditulis setiap sinkron (`30_Diagnostik.gs`). Tabnya:
  - Mutu_per_wilayah;
  - Perlu_dilengkapi;
  - Rate_pendapatan;
  - Pendapatan_belum_cocok (mis. "Nomor tidak ada di GAPEKA");
  - Sarana_tanpa_depo;
  - Ringkasan.
- Angka di tab tersebut dihitung dengan modul browser yang sama (Js.Analytics, Js.Ref, Js.Mutu, Js.Pendapatan), jadi setara dengan web app.
- Yang dihapus dari web app:
  - halaman Mutu data;
  - tabel rate, "data pendapatan yang belum termatch GAPEKA" dan model bertahap di Pendapatan terekspos;
  - KPI "Rate dipakai";
  - "Catatan kualitas" di kartu kejadian;
  - temuan kelengkapan data.
- Metodologi kini hanya berisi definisi singkat.
- PPT: slide eksposur memakai kotak nilai (bulan lalu, YTD). Rumus rate dan cakupan termatch tidak lagi tampil.

## Profil rute — diagram lintas berlapis
- 8 ubin ringkas di bagian atas: panjang (ganda/tunggal), elektrifikasi, jembatan & terowongan, sebaran THI, JPL, alam, keamanan, struktur.
- Diagram berlapis per petak memuat lapisan berikut, masing-masing dapat dinyalakan atau dimatikan dengan cip:
  - Daop/Divre;
  - jalur ganda/tunggal;
  - elektrifikasi;
  - jembatan & terowongan;
  - KA/hari;
  - gangguan prasarana;
  - WKP;
  - THI petak;
  - JPL;
  - kerentanan alam;
  - rawan keamanan;
  - garis elevasi stasiun.
- Tooltip menampilkan semua lapisan. Km tanpa data elevasi diarsir "elevasi tidak tercatat". Zoom dengan Ctrl + roda atau penggeser.

## JPL — nama jalan, pengelola, penjaga
- **Pengelola (PM 94/2018 Pasal 2)** diturunkan dari kolom "Kategori jalan" M_JPL:
  - jalan nasional → Menteri;
  - jalan provinsi → Gubernur;
  - jalan kabupaten/kota, kecamatan dan desa → Bupati/Wali Kota;
  - jalan khusus (perkebunan, industri, pribadi warga) → badan hukum/lembaga.
  - Kategori kosong (107 JPL) → "tidak tercatat".
- **Riset web:** 15 JPL bersumber, di `db/sumber/jpl_riset_web.csv` → `tools/jpl/build_jpl_riset.py` → `31_SeedJplRiset.gs`. Wilayah yang tercakup:
  - Bekasi–Tambun (Baketrans Kemenhub: 5 JPL dengan nama jalan, koordinat dan penjaga);
  - Jerakah–Semarang Poncol;
  - Sumpiuh–Tambak;
  - Prembun–Kutowinangun;
  - Lempuyangan–Maguwo (JPL 349 Jl. Timoho, dijaga resmi PT KAI);
  - Bagor–Saradan;
  - Baron–Sukomoro (dijaga Dishub Kab. Nganjuk);
  - Indro–Kandangan;
  - Branti–Tegineneng.
- **Catatan:** JPL hasil riset ini tidak ada di daftar 1.404 M_JPL. Temuan riset ditautkan ke titik JPL dari laporan kejadian (petak + nomor JPL sama).
- **OSM:** fungsi editor `jplOsmNow()` (`32_JplOsm.gs`) mengambil perlintasan `railway=level_crossing` dalam 40 m dari garis tiap petak beserta jalan yang melintasinya, lewat Overpass API.
  - Hasil ditulis ke spreadsheet baru "KAI | Perlintasan OSM" (`JPL_OSM_DB_ID`).
  - Pengambilan berlanjut otomatis per ±4,5 menit lewat pemicu sekali jalan, lalu pemicunya terhapus.
  - Pencocokan ke JPL:
    - nomor sama di tag OSM → pasti;
    - satu-satunya perlintasan dan satu-satunya nomor JPL di petak → "perkiraan";
    - selain itu ditampilkan sebagai kandidat.
  - © kontributor OpenStreetMap, ODbL.
- Tampil di tabel Perlintasan (kolom Jalan, Kab/kota, Pengelola), profil JPL (Jalan + tautan peta OSM, Pengelola, Penjaga riset web + sumber) dan tab JPL di profil.

## Uji
- `npm run check` lulus.
- `STRICT=1 npm run test:emu` lulus: galat konsol 0, temuan kerapian 0.
- Uji lain yang lulus: sim, gapeka, switch, pulau, akses (fungsi editor 10), alur, bq, mutu, rhi.

## Langkah pemilik setelah tempel
1. Deploy → New version.
2. Jalankan `diagnostikNow` sekali (spreadsheet Diagnostik dibuat otomatis).
3. Jalankan `jplOsmNow` sekali, izinkan akses URL eksternal, lalu tunggu hingga selesai (berlanjut sendiri).
4. Sinkron berikutnya memasukkan nama jalan OSM ke web app.
