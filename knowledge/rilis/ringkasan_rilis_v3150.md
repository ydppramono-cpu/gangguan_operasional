# Rilis v3.15.0 — 20 Nov 2026 (Paket A: fondasi data + navbar + unduhan)

## Paket A — data
- **Daftar KA per dipo (Duksar 2025) dibersihkan** (`tools/duksar/bersihkan_ka_dipo.py`): deret 1–23/25 di awal ke-14 dipo (artefak tabel PDF) dibuang; nomor yang pulaunya beda dengan dipo ditolak (KPT 8, TNK 6, THN 14, MDN 2, PD 1; tercatat di `kaDitolak`). Kartu unit tidak lagi menampilkan lok Sumatera "melayani" KA Jawa.
- **Daftar KA depo induk rangkaian** (tab M_DEPO_KA) dibersihkan saat dibaca: nomor Sumatera tanpa awalan diberi awalan wilayah (Divre 1 = U, Divre 2 = B, Divre 3/4 = S) bila ada di Buku Penomoran; nomor Jawa di depo Sumatera ditolak dan dicatat.
- **Aturan pulau** (`src/23_SeedPulau.gs`, dibangkitkan `tools/pulau/build_pulau_seed.py`; `Domain.pulau*`):
  - pulau kejadian = Daop (Jawa) / Divre (Sumatera); pulau KA dari Buku Penomoran 2025 & 2026; pulau unit dari plant SAP (B = Jawa, C = Sumatera), mulai 1 Des 2026 Duksar 2026.
  - "KA 7" di Divre 3 → S7 bila ada; KA Jawa pada kejadian Sumatera (dan sebaliknya) tidak ditautkan.
  - Nomor sarana pulau lain: ≥ 2 kejadian = mutasi (tautan dipertahankan, dicatat); 1 kejadian = dilepas dan masuk antrean verifikasi.
  - Panel baru "Pemeriksaan pulau" di Metodologi (mutasi & antrean verifikasi, bisa diunduh).
- **Kelas diturunkan** dari judul bila Kategori & Subgangguan kosong (berlabel "diturunkan"); yang tidak tegas tetap "belum".
- `master_stasiun.csv`: nama wilayah dibakukan ("DAOP 4 SEMARANG" → "Daop 4"; 132 baris).
- RHI: tab RHI sudah memakai kolom "(pulih)"; berkas RHI_Oktober_sarana yang rusak skala tidak dipakai langsung.

## Paritas laporan (Excel/PDF/PPT)
Jumlah kejadian dan total menit tidak berubah (emulator: 3.000 kejadian, 134.844 menit sebelum = sesudah). Yang bergeser hanya kelas untuk baris yang sebelumnya "belum lengkap" (emulator: 24 baris → Sarana), serta nama KA/sarana pada baris lintas pulau yang kini tidak ditautkan.

## Tampilan
- **Navbar**: satu baris aksi (kembali ikon, judul, cari dengan pintasan "/", status data, notifikasi, switch GAPEKA, menu Unduh) + satu baris filter. Jam jadi tombol + popover; di HP filter dilipat ke tombol "Saring · periode".
- **Unduh**: menu Unduh di navbar (kejadian periode ini CSV, semua kejadian CSV, pusat unduhan Excel/PPT/PDF); setiap kartu bertabel dapat tombol **CSV**; setiap grafik dapat tombol **CSV** data selain PNG.
- `SCHEMA` 13 → snapshot dibangun ulang otomatis setelah tempel.

## Uji
check lulus; test:emu 22 menu × lebar tanpa galat/gulir samping/NaN; test:switch, test:bq, test:akses LULUS; test:marey 0 gagal; **test:pulau** (baru) LULUS; test:alur LULUS.

## Berikutnya (v3.16.0, Paket B)
Laci terpadu unit/petak/KA/pendapatan (data KA Jalan/Batal, Frekuensi, stasiun perhentian, POL OP), alur cerita per menu dengan visual sebagai pemeran utama dan kartu yang lebih sedikit; RHI kereta/gerbong begitu berkasnya dikirim.
