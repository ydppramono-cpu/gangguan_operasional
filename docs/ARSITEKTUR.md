# Arsitektur KAI Data Platform (Rp0)

```
 Sumber (PDF/XLSX/laporan)            Google Drive pemilik: KAI_Data_Platform
 ─────────────────────────            ───────────────────────────────────────────────────────────────
 GAPEKA 2025/2026, Duksar,   ──►  01_RAW (arsip; folder Drive asli dirujuk lewat ID, tidak disalin ulang)
 THI/RHI/WKP, JASUM, SAP...           │ ekstraksi terdokumentasi (tools/*.py, Platform ETL web app)
                                      ▼
                               02_DB  Google Sheets  ◄── penulisan: web app ETL · ChatGPT (JASUM) · tim
                               ├─ Basis Data Gangguan (SSOT)
                               ├─ MASTER GAPEKA 2025
                               └─ KAI_Referensi_Turunan (seed web app sebagai tabel)
                                      │ dibaca (tanpa menyalin)              │ disalin terjadwal
                                      ▼                                      ▼
                     BigQuery sandbox: kai_raw (eksternal, live)     05_DBEAVER_Mirror_CSV (≤15 mnt)
                                       kai (view bertipe)            + _manifest.csv (baris, SHA-256)
                                       kai_snap (tabel asli ≤15 mnt)
                                      │                                      │
                                      └──────────────► DBeaver ◄─────────────┘   (baca saja)

                               03_KNOWLEDGE (Markdown + teks berhalaman)  ──► Proyek Claude · GPT ChatGPT
                               00_ADMIN/KAI_Katalog_Data (katalog, kamus, KB_Kontribusi, log)
                               04_CODE  ◄── GitHub privat gangguan_operasional ──► clasp ──► Apps Script (web app)
```

## Pilihan untuk DBeaver
| Jalur | Kesegaran | Syarat | Kapan dipakai |
|---|---|---|---|
| BigQuery `kai.*` (view atas Sheets) | Live (setiap kueri membaca Sheets) | Proyek BigQuery sandbox; koneksi DBeaver memberi izin Google Drive (`RequestGoogleDriveScope=1`) dan login akun Google sendiri | Analisis harian tim |
| BigQuery `kai_snap.*` (tabel asli) | ≤ 15 menit (tabel kejadian), ≤ 6 jam (tabel bulanan) | Proyek BigQuery sandbox; tanpa izin Drive | Bila izin Drive di driver bermasalah, atau kueri berat |
| CSV cermin di Drive | ≤ 15 menit / ≤ 6 jam | Google Drive untuk desktop + driver CSV DBeaver | Tanpa Google Cloud sama sekali / luring |

## Batas sandbox BigQuery yang harus diingat
- Penyimpanan maksimal 10 GiB dan kueri 1 TiB per bulan.
- Tabel, view, dan partisi kedaluwarsa otomatis setelah 60 hari. Karena itu `refreshBigQuery` dijalankan tiap tanggal 1 untuk membuat ulang semuanya.
- DML (INSERT/UPDATE/DELETE), streaming, dan Data Transfer Service tidak tersedia. Platform ini tidak memakai fitur-fitur tersebut.

Sumber: dokumentasi Google Cloud "Try BigQuery using the sandbox".

## Kuota Apps Script akun pribadi
Total waktu pemicu harian terbatas. Karena itu salinan dijadwalkan per tabel (`PLATFORM.MIN_MENIT`) dan hanya dibuat bila spreadsheet sumber berubah. Pantau tab `Log_Platform`.
