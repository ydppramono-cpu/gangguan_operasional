# Ringkasan rilis v3.26.0 — 25 Nov 2026

Lanjutan riset web JPL per Daop/Divre, untuk JPL prioritas 190 dan JPL yang paling sering tercatat dalam kejadian. Rilis ini juga memuat seluruh isi v3.25.0, karena v3.25.0 tidak dipasang.

## Riset web JPL: 15 → 54 JPL bersumber
- Cara memilih sasaran:
  - JPL yang paling sering disebut dalam laporan kejadian, dihitung dari uraian Gangguan_Induk per Daop/Divre;
  - JPL prioritas 190 yang bernomor.
- Prioritas 190 tanpa nomor JPL (umumnya Daop 1 Depok–Citayam dan Divre I) tidak dapat dicari di web, sehingga tetap "tidak tercatat".
- Sebaran: Daop 1 14 · Daop 2 3 · Daop 3 3 · Daop 4 3 · Daop 5 5 · Daop 6 3 · Daop 7 8 · Daop 8 4 · Daop 9 5 · Divre I 1 · Divre III 4 · Divre IV 1.
- Setiap baris memuat: nama jalan/lokasi, penjaga, status (mis. ditutup, perlintasan liar, rencana flyover, resmi tak dijaga), catatan, judul sumber, tautan, tanggal terbit, tanggal akses.
- Hanya fakta yang tertulis di sumber yang dicatat. Contoh nomor yang mirip tetapi berbeda: JPL 27 Cilebut–Bogor tidak sama dengan JPL 27 Tanah Tinggi–Tangerang, dan JPL 363A tidak sama dengan JPL 363. Pasangan seperti ini tidak dipakai.
- JPL kejadian terbanyak yang kini punya keterangan web:
  - Daop 3: JPL 93 Haurgeulis, JPL 200 Jl. Slamet Riyadi Krucuk;
  - Daop 4: JPL 5 Jl. Kaligawe, JPL 6 Jl. Madukoro Raya;
  - Daop 5: JPL 501, JPL 540 Jl. Revolusi Karanganyar, JPL 582;
  - Daop 6: JPL 117 Jl. Pakis–Daleman, JPL 349 Jl. Timoho;
  - Daop 7: JPL 90 Jl. Panglima Sudirman Baron, JPL 103;
  - Daop 9: JPL 150 Sumberagung Grati, JPL 166 Curahtulis Tongas, JPL 9 Kalisat–Ledokombo;
  - Divre I: JPL 31 Perbaungan;
  - Divre III: JPL 104 dan 106 Gunung Megang (rencana flyover);
  - Divre IV: JPL 20 Branti–Tegineneng.
  - Dalam uji, 20 kombinasi (wilayah, nomor JPL, petak) dari laporan kejadian bertaut ke temuan riset.
- Belum ditemukan di web: JPL 27 Tanah Tinggi–Tangerang, JPL 118 Lemahabang, JPL 154 Cimindi/Karawang, JPL 363 Purwokerto–Notog, JPL 342 Lempuyangan–Maguwo, JPL 32 Negararatu, dan JPL 32 Leces–Malasan.

## Pencocokan
- Penormalan nomor: nol di depan diabaikan, jadi "04" sama dengan "4".
- Urutan pencocokan:
  1. petak + nomor sama → pasti;
  2. JPL emplasemen yang dicatat per stasiun berlaku juga untuk petak yang berujung di stasiun itu;
  3. laporan emplasemen tanpa petak dicocokkan lewat kode stasiun + nomor, hanya bila hanya ada satu kandidat.
- Kolom "Jalan / lokasi" menampilkan status dari riset web. Ekspor CSV/Excel memuat kolom "Status (riset web)". Profil JPL memuat fakta "Status (riset web)" beserta tautan sumbernya.

## Isi v3.25.0 (ikut terpasang)
RHI resmi kereta/gerbong · spreadsheet Diagnostik (penyusun angka tidak tampil di web/PPT) · Profil rute: diagram lintas berlapis · Pengelola JPL (PM 94/2018) + nama jalan OSM (`jplOsmNow`). Rincian: `ringkasan_rilis_v3250.md`.

## Uji
- `npm run check` lulus.
- `STRICT=1 npm run test:emu` lulus: galat konsol 0, temuan kerapian 0.
- Uji lain yang lulus: akses, alur, switch, rhi, mutu, sim, gapeka, pulau, bq.
