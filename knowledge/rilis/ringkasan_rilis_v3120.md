# Rilis v3.12.0 — 17 Nov 2026

## Baru
- **Grafik perjalanan: pilihan versi GAPEKA 2025 / 2026.** Bawaan = versi yang berlaku hari ini (GAPEKA 2025 s.d. 30 Nov 2026; GAPEKA 2026 mulai 1 Des 2026). Ganti versi mempertahankan judul lintas yang sama bila ada.
  - GAPEKA 2025: 63 lintas (judul Lembar 2025 + matriks jarak Buku Penomoran 2025), 2.440 perjalanan dari Buku Daftar Waktu 2025. Jam awal/akhir tiap KA konsisten dengan Buku Penomoran 2025 (1.830 cocok langsung, 589 cocok sebagai KA bersambung, 21 segmen tengah KA bernomor berantai).
  - Judul lembar II-1, VI, VIII-2 mengikuti 2026 (lembar 2025 hasil pindai tanpa teks judul) — ditandai di halaman. BOP–CCR & PN–KLT tidak digambar (tidak ada jarak di matriks 2025 / tidak ada KA berjadwal).
- **Basis data**: `02_DB/GAPEKA_2025_Basis_Data` (jadwal 53.422 baris, penomoran 2.708 KA, jarak, lintas lembar). 11 tabel GAPEKA 2025/2026 terdaftar di `db/schema/sumber_tabel.json` → BigQuery/DBeaver (34 tabel). Folder `01_RAW/realisasi_perjalanan` disiapkan untuk CSV realisasi.

## Perbaikan (audit menu inti dengan emulator end-to-end)
- Sidebar tanpa scrollbar; label panjang elipsis.
- Bilah alat grafik tidak lagi menutupi legenda; label median matriks tidak terpotong; sumbu cacah bertik bulat; kurva menit per jam tanpa spline; skala heatmap berlabel.
- Pendapatan terekspos: status mesin rate kini reaktif (sebelumnya tetap "Rate tetap (cadangan)" walau data termuat) dan galat saat data belum termuat dihilangkan; judul kolom cakupan diperjelas.
- Perlintasan: KA/hari kosong tidak terpotong; penghitung tabel kosong tidak dobel.
- Ringkasan: tautan temuan lebih jelas, catatan kelas "belum lengkap".
- Tabel lebar (Tren, Unduh, Metodologi) bergulir di dalam kartu (tidak melebarkan halaman di HP).

## Uji
- `tests/emulator`: pipeline `.gs` asli di Node + Index gabungan di Chromium (11 menu × desktop/400 px: 0 galat JS).
- `tests/marey`: invarian label & jam untuk GAPEKA 2025 dan 2026 (0 gagal). Keluaran parser 2026 tidak berubah setelah perbaikan parser (diuji byte-sama).
