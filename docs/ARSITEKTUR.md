# Arsitektur — alternatif B (Google Sheets + Apps Script + BigQuery sandbox), Rp0

Dipilih pemilik 19 Nov 2026. Sheets tetap tempat input tim; Apps Script tetap server web app; BigQuery sandbox
dipakai untuk salinan bertipe, agregat berat, DBeaver, dan (opsional) sumber baca tabel kondisi web app.

```
 Sumber (PDF/XLSX/laporan)          Google Drive "Web App Gangguan Operasional" / KAI_Data_Platform
 ─────────────────────────          ─────────────────────────────────────────────────────────────────────
 GAPEKA 2025/2026, Duksar,   ──►  01_RAW (arsip)  ──  ekstraksi terdokumentasi (tools/*.py)
 THI/RHI/WKP, JASUM, SAP              ▼
                               02_DB  Google Sheets   ◄── input tim · ChatGPT (JASUM, pemilik) · tab turunan alat
                               (Gangguan_Induk, THI, RHI, WKP, Passenger, Freight, Hambatan_Jasum, GAPEKA 2025/2026)
                                      │                                        │
              ┌───────────────────────┘                                        │ dibaca (tabel eksternal)
              ▼                                                                ▼
   Web app (proyek Apps Script #1, src/)                         KAI Data Platform (proyek Apps Script #2, platform/)
   runSync_ tiap 15 menit:                                       BigQuery sandbox (asia-southeast2)
     Gangguan_Induk, master, referensi ← Sheets                    kai_raw   tabel eksternal → Sheets (live)
     THI/RHI/WKP ← Sheets  ATAU  kai_snap (KONDISI_SUMBER=bq) ◄──  kai       view bertipe (UDF kai.num / kai.tgl)
   → snapshot gzip di Drive + CacheService                         kai_snap  tabel asli, disalin bila sumber berubah
   → API api* → HtmlService (Alpine + ECharts + Tabulator)          kai_agg   agregat RHI/THI/WKP/Gangguan (harian)
     switch GAPEKA 2025/2026 global (KAI.gapeka)                         │
                                                                         ├──► DBeaver (baca saja)
                                                                         └──► 05_DBEAVER_Mirror_CSV (cermin CSV ≤15 mnt)
   Kode: GitHub publik ydppramono-cpu/gangguan_operasional → npm run pack → 04_CODE/GAS_tempel_vX.Y.Z → editor GAS
```

## Komponen dan tanggung jawab

| Komponen | Letak | Tugas | Pemicu |
|---|---|---|---|
| ETL web app | `src/04_Etl.gs` `runSync_` | Membaca Sheets (dan opsional BigQuery), membangun snapshot | tiap 15 menit + `syncNow` |
| Adaptor BigQuery web app | `src/22_Bq.gs` | Membaca `kai_snap.thi/rhi/wkp` dalam bentuk sama dengan Sheets; cadangan ke Sheets bila gagal | ikut ETL |
| Peta kolom | `src/21_BqKolom.gs` | Kolom BigQuery ↔ judul sheet (dibangkitkan `tools/gen_schema.py`) | — |
| Definisi tabel & view | `platform/Platform.gs` `setupBigQuery`/`refreshBigQuery` | Membuat ulang `kai_raw` + `kai` (masa view 60 hari) | tiap tgl 1, 02:00 |
| Salinan | `snapshotBigQuery` | `kai.*` → `kai_snap.*` bila sheet berubah (jarak minimum per tabel) | tiap 15 menit |
| Agregat | `agregatBigQuery` + `platform/Agregat.gs` (dari `db/bigquery/30_agregat.sql`) | `kai_snap.*` → `kai_agg.*` | harian 04:00 |
| Penjaga kedaluwarsa | `jagaKedaluwarsa` | Perpanjang tabel `kai_snap`/`kai_agg` yang sisa < 14 hari | Senin 03:00 |
| Cermin CSV | `mirrorCsv` | CSV mesin untuk DBeaver luring | tiap 15 menit |

## Menyalakan BigQuery di web app (opsional, bisa dibatalkan kapan saja)
1. Platform sudah berjalan: `setupBigQuery`, `snapshotBigQuery` sukses (lihat `Log_Platform`), tabel `kai_snap.thi/rhi/wkp` ada.
2. Editor GAS web app → Services → tambah **BigQuery API v2** (manifest `src/appsscript.json` sudah memuatnya), lalu izinkan ulang
   (cakupan baru `https://www.googleapis.com/auth/bigquery`). Akun pemilik harus punya akses ke proyek sandbox.
3. Script Properties web app: `BQ_PROJECT` = ID proyek sandbox.
4. Jalankan `ujiKondisiBq()` dari editor. Hasil `cocok` = Kondisi dari BigQuery identik dengan dari Sheets dan judul kolom sheet
   sesuai skema. Bila `BEDA`, baca log; jangan lanjut.
5. Isi `KONDISI_SUMBER` = `bq`. Hapus properti itu untuk kembali ke Sheets. Sumber yang dipakai tampil di `ref.kondisi.stats.sumberBaca`.

Kesegaran: dengan `KONDISI_SUMBER=bq` data kondisi tertinggal sejauh jarak salinan `kai_snap` (WKP 60 menit, THI/RHI 6 jam;
atur di `MIN_MENIT`). Gangguan_Induk tetap dibaca langsung dari Sheets.

## Batas sandbox BigQuery
- Penyimpanan 10 GiB, kueri 1 TiB per bulan.
- Tabel, view, dan partisi kedaluwarsa 60 hari setelah dibuat → `refreshBigQuery` (view), `agregatBigQuery` (CREATE OR REPLACE)
  dan `jagaKedaluwarsa` (patch masa; bila ditolak, buat ulang dari isinya sendiri).
- Tanpa DML (INSERT/UPDATE/DELETE), streaming, kueri terjadwal, Data Transfer Service. Platform hanya memakai DDL dan job kueri
  dengan tabel tujuan (`WRITE_TRUNCATE`).

Sumber: dokumentasi Google Cloud "Try BigQuery using the sandbox".

## Pilihan untuk DBeaver
| Jalur | Kesegaran | Syarat | Kapan dipakai |
|---|---|---|---|
| BigQuery `kai.*` (view atas Sheets) | Live | Izin Google Drive di driver (`RequestGoogleDriveScope=1`) | Analisis harian |
| BigQuery `kai_snap.*` | ≤ 15 menit (kejadian) – ≤ 6 jam (bulanan) | Tanpa izin Drive | Kueri berat / izin Drive bermasalah |
| BigQuery `kai_agg.*` | Harian | Tanpa izin Drive | Ringkasan bulanan RHI/THI/WKP/Gangguan |
| CSV cermin di Drive | ≤ 15 menit / ≤ 6 jam | Google Drive untuk desktop + driver CSV | Tanpa Google Cloud / luring |

## Kuota Apps Script akun pribadi
Total waktu pemicu harian terbatas (±90 menit). Salinan per tabel hanya dibuat bila sumber berubah (`PLATFORM.MIN_MENIT`),
agregat sekali sehari, penjaga sekali seminggu. Pantau tab `Log_Platform` di `KAI_Katalog_Data`.

Kontrak data (kunci, tabel, siapa menulis, kesegaran): `docs/KONTRAK_DATA.md`.
