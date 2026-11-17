# Dashboard Gangguan Operasional v3.9.0: Sarana & armada per jenis (13 Nov 2026)

## Struktur menu Sarana & armada
- Tiga tab besar: **Lokomotif** (575 unit), **Kereta** (2.255 unit), **Gerbong** (9.221 unit). KRL dan KRD belum dihitung.
- Setiap tab punya empat sub-tab yang sama:
  - **Ringkasan**: alur baca, KPI, unit terganggu tertinggi, unit berulang, gangguan dan durasi per bulan, jenis gangguan berulang, komponen.
  - **Kesehatan × gangguan**:
    - Lokomotif memakai RHI resmi, termasuk status RHI pada tanggal kejadian.
    - Kereta dan gerbong memakai skor turunan dengan label "bukan RHI resmi". Kolom RHI resmi akan terisi otomatis begitu datanya ditambahkan.
  - **Depo & Balai Yasa**: klasemen kekuatan depo, kesiapan menurut GAPEKA, dan unit yang sedang di Balai Yasa.
  - **Daftar unit**: pencarian, rating, dan ekspor Excel.
- Kartu unit, terbuka saat nomor sarana diklik: atribut skala 1–20 dan rating; form 6 bulan; spesifikasi dari SAP (kapasitas, kecepatan maksimum, berat kosong, model); status GAPEKA; riwayat gangguan; perawatan dari RHI; proksi dinasan dari Buku Duksar; tren RHI harian (khusus lokomotif).
- Kartu kekuatan depo, di halaman profil depo: indeks kekuatan dan peringkat; empat komponen penyusun indeks; statistik dinasan lok (SO, unit untuk perbaikan, km per lok per hari, jam dinas, KA yang dilayani); komposisi armada; unit terberat.

## Data baru: Buku Dukungan Sarana GAPEKA 2025
- Diekstrak dari 4 buku: Jawa, Sumbar, Sumsel, Sumut. Disimpan di `17_SeedDuksar.gs`.
- Nomor sarana siap guna yang cocok dengan SAP:

  | Jenis | Cocok SAP | Jumlah di buku |
  |---|---|---|
  | Lokomotif | 499 | 505 |
  | Kereta | 1.975 | 2.091 |
  | Gerbong | 7.948 | 8.335 |

- Dinasan lok tersedia untuk 14 depo. SG per depo sama dengan angka di buku, misalnya CPN 45, SDT 58, KPT 84, TNK 88.

## Rumus (indikator internal)
- Keandalan = 100 − min(100, 15 × kejadian 12 bln + menit 12 bln ÷ 20).
- Usia = 100 − 2,2 × (usia − 5).
- Kesiapan = 100 bila siap guna, 60 bila tidak tercantum di GAPEKA, 30 bila di Balai Yasa.
- Skor turunan = 0,35 usia + 0,45 keandalan + 0,20 kesiapan.
- Kekuatan depo = 0,35 kesehatan + 0,30 keandalan (dibanding median depo sejenis) + 0,20 porsi armada ≤ 30 tahun + 0,15 kesiapan.
- Usia di atas 80 tahun ditandai "periksa", karena tanggal mulai dinas di SAP kemungkinan salah.

## Belum / menyusul
- GAPEKA 2026 (berlaku 1 Des 2026): dikerjakan setelah berkas dari pengguna tersedia.
- Riwayat perawatan lengkap butuh SAP PM.
- Dinasan harian per unit butuh data dinasan.
- RHI kereta dan gerbong belum ada di database.
