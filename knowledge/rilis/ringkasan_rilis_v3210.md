# Ringkasan rilis v3.21.0 — 24 Nov 2026

**Ruang kerja Batubara lengkap — pengganti aplikasi WTT lama (F2 + F3).**

Keputusan pemilik 24 Nov 2026:
- struktur: 3 halaman cerita (Capaian · Siklus & terminal · Papan skenario) + 3 profil (terminal, relasi, rangkaian);
- data: sinkron otomatis dari DB Batubara (ETL 15 menit, `BB_DB_ID` di Script Properties, hanya baca);
- layar GAPEKA 2025 vs 2026 tidak dibawa; dipakai switch global;
- awak/lok/rangkaian masuk profil rangkaian dan tab Awak di Siklus.

## Isi
- **Sinkron DB Batubara** (`28_BatubaraSync.gs`): bagian core, perjalanan, terminal, hambatan, jejak.
  - Hanya membaca bila DB berubah.
  - REAL_PERJALANAN yang turun > 20% ditolak.
  - REAL_GANGGUAN tidak dibaca.
  - API `apiBatubaraPart` memakai daftar tertutup; `syncBatubaraNow()` hanya untuk editor.
- **Capaian:** jawaban pertama (on track/tidak) lalu WTT muat/bongkar, WPKA, WPG, dan OTP terhadap SOP/target. Rumus WTT lama dipindahkan apa adanya ke `Js.BbData` (BBK).
- **Siklus & terminal**, dengan tab:
  - 8 tahap siklus;
  - kinerja terminal (indeks 4 komponen);
  - hambatan & PIC;
  - awak.
- **Profil** terminal, relasi, dan rangkaian: kepala profil + grafik yang saling menyaring (klik bulan).
- **Papan skenario:**
  - **Antrean jalur terminal** (bawaan aktif): KA menunggu di sinyal masuk bila semua jalur terisi. Kapasitas = jumlah jalur M_STASIUN, atau puncak GAPEKA bila lebih besar, sehingga skenario dasar tetap sama dengan GAPEKA.
  - **KLB:** salinan KA pola yang digeser. **Cari slot kosong** memberi kandidat tanpa benturan petak; setiap kandidat diverifikasi simulasi penuh (KLB tepat waktu, dampak ke KA lain tidak bertambah).
  - **Simpan sebagai A:** membandingkan dua skenario berdampingan; A tersimpan di tautan (`skA`).
  - **Realisasi:** jejak Rolink (REAL_JEJAK) digambar dan model diuji ulang. Mode putar ulang tidak memakai batas siklus, sambung, dan awak karena di lapangan rangkaian dan awak sering dipertukarkan.
- **Bantuan:** tur dan panduan untuk halaman Batubara, serta kartu Metodologi "Batubara — WTT & Papan skenario".

## Uji ulang model
Diuji pada satu bulan REAL_JEJAK (data asli, angka rinci di dokumen project, tidak di repo publik).
- Versi pertama (kelambatan pertama → "tahan" + batas siklus) lebih buruk dari jadwal saja.
- Versi rilis (simpangan pertama → geser, mode putar ulang) lebih dekat ke realisasi daripada jadwal saja, tetapi selisihnya masih besar. Karena itu model dipakai untuk membandingkan skenario, bukan meramal jam; batasan ini tertulis di layar.

## Belum (berikutnya)
- Lensa Batubara (Divre III/IV + KA batubara) di halaman gangguan/JPL yang sudah ada.
- Lapisan peta kapasitas petak dan indeks terminal.
- Daftar paritas sebelum aplikasi WTT lama dipensiunkan.

## Langkah pemilik
1. Tempel `Code.gs` + `Index.html` (seed tidak berubah dari v3.20).
2. Script Properties → tambah `BB_DB_ID` = ID spreadsheet Database_KA_Batubara_Sumsel.
3. Di editor jalankan `syncBatubaraNow` sekali (izinkan akses baca), lalu Deploy → New version.

## Uji
Semua uji berikut LULUS:
- `npm run check`;
- `test:emu` STRICT (termasuk batubara, bb-capaian, bb-siklus di desktop/400 px);
- `test:sim`, `test:gapeka`, `test:switch`, `test:pulau`, `test:akses`, `test:alur`, `test:bq`.
