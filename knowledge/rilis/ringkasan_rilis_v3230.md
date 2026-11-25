# Ringkasan rilis v3.23.0 — 25 Nov 2026

Keputusan pemilik 25 Nov 2026:
- RHI: arsip utuh + spreadsheet RHI baru; berkas baru menggantikan tab RHI lama (dicadangkan).
- Menu Batubara: alur cerita 4 langkah; KPI utama siklus rangkaian vs program.

## RHI lokomotif, kereta, gerbong (Agu–Okt 2026)

### Data di Drive
- **Tab RHI basis data utama diganti** dengan ekspor lokomotif 22 kolom: 50.784 baris, 552 unit, 1 Agu – 31 Okt.
- **Cadangan lengkap** basis data sebelum penggantian: `02_DB_Database/Cadangan_sebelum_RHI_25Nov2026`.
- **Spreadsheet "KAI | RHI Sarana"** (`02_DB_Database/RHI`, nama berkas `rhi_sarana`):
  - kereta harian 206.908 baris;
  - kereta bulanan 6.747 baris;
  - gerbong bulanan 26.856 baris;
  - harian per depo 19.872 baris.
- **Arsip CSV gzip** ketiga jenis di folder yang sama.
- Gerbong harian per unit (18,1 juta sel) melebihi batas 10 juta sel per spreadsheet. Karena itu gerbong disimpan ringkas per bulan, tetapi status harian per unit tetap ada dalam satu sel per bulan.

### Pemeriksaan
- 0 kunci ganda (jenis + nomor tanpa spasi + tanggal).
- Semua HI di rentang 0–100.
- Satu versi rumus per jenis.

### Web app
- **Status RHI kini 5:** Healthy ≥ 85, Monitor 70–85, Declining 55–70, Poor di bawah 55, Critical (teramati 39,4).
  - Daftar pantau lokomotif = HI di bawah 70.
  - Laporan PPT ikut dihitung dengan Poor/Critical.
- **Kereta & gerbong — tab Kesehatan memakai RHI resmi:**
  - status per unit pada hari terakhir data;
  - per wilayah, dengan perubahan dibanding bulan sebelumnya;
  - status saat gangguan dibanding armada;
  - daftar pantau HI di bawah 70.
  - Skor turunan tetap ada sebagai pembanding.
- **Kartu unit kereta/gerbong:** RHI per bulan dan status pada tanggal kejadian (HI = akhir bulan; HI harian ada di arsip).
- **BigQuery:** skema `rhi` diperbarui ke 22 kolom; agregat memakai `healthy_index` dan menghitung Poor/Critical.

## Batubara: alur 4 langkah
Urutan halaman: **Hari ini → Capaian → Penyebab → Skenario**.
- **Hari ini:**
  - KPI utama: siklus rangkaian per putaran (muat → isi → bongkar → kosong), realisasi vs program GAPEKA, dirata-rata tertimbang jumlah KA, dengan rincian komponen dan tombol ke penyebabnya.
  - Pengecualian pada hari terakhir data:
    - KA melewati toleransi OTP per Divre;
    - kegiatan terminal melewati SOP kontrak;
    - hambatan;
    - gangguan KA batubara.
  - Ditandai "bukan waktu nyata".
- **Capaian:** KPI utama di atas KPI wajib.
- **Penyebab** (dulu "Siklus & terminal"): tab baru **Gangguan KA batubara**. Isinya kejadian Gangguan_Induk yang nomor KA-nya terdaftar di M_KA, mengikuti saringan bulan, wilayah, pemilik, dan muatan. REAL_GANGGUAN tetap tidak dibaca.

## Langkah pemilik
1. Tempel `Code.gs` + `Index.html` → Deploy → New version.
2. Script Properties → `RHI_DB_ID` = ID spreadsheet `rhi_sarana` di `02_DB_Database/RHI`.
3. Jalankan `syncRhiSaranaNow` lalu `syncNow` sekali di editor.

## Uji
LULUS:
- `npm run check`;
- `test:emu` STRICT (rute baru bb-hariini; RHI kereta/gerbong lewat kode server asli atas data sintetis);
- `test:sim`, `test:gapeka`, `test:switch`, `test:pulau`, `test:akses`, `test:alur`, `test:bq`, `test:mutu`;
- `test:rhi` (baru).
