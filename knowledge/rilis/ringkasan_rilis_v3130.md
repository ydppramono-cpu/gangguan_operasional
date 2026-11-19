# Rilis v3.13.0 — 19 Nov 2026 (alternatif B, fondasi BigQuery)

## Baru
- **Switch GAPEKA global** (pojok kanan atas) menentukan sumber jadwal untuk semua menu; bawaan = versi yang berlaku hari ini (WIB). GAPEKA 2025 dan 2026 dianalisis masing-masing, tanpa angka selisih.
- **Adaptor BigQuery web app (opsional, mati secara bawaan)** — `src/22_Bq.gs`. Dengan `BQ_PROJECT` + `KONDISI_SUMBER=bq`, THI/RHI/WKP dibaca dari `kai_snap` dalam bentuk yang sama dengan Sheets; bila kueri gagal, ETL otomatis kembali ke Sheets. Sumber tercatat di `ref.kondisi.stats.sumberBaca`. Gangguan_Induk tetap dari Sheets.
  - `ujiKondisiBq()` (editor, pemilik saja): membandingkan hasil Kondisi jalur Sheets vs BigQuery dan judul kolom sheet vs skema. Nyalakan hanya bila "cocok".
- **Platform v1.1**: dataset `kai_agg` (rhi_bulanan, rhi_status_terakhir, thi_ringkas, wkp_bulanan, gangguan_bulanan) dari `db/bigquery/30_agregat.sql`, dibangun harian; `jagaKedaluwarsa` mingguan memperpanjang tabel `kai_snap`/`kai_agg` sebelum batas 60 hari sandbox.
- Skema: kolom WKP "Program durasi (hari Excel)" dan "Realisasi durasi (hari Excel)" bertipe angka (view `kai.wkp` FLOAT64).
- Dokumen: `docs/ARSITEKTUR.md` (alternatif B), `docs/KONTRAK_DATA.md` (kunci, tipe, kesegaran, penulis per tabel). Proyek Claude Code: `CLAUDE.md`, perintah `/uji` `/rilis` `/data-baru` `/fitur`, agen peninjau data & UI.

## Perlu tindakan pemilik
- Manifest web app kini memuat layanan BigQuery v2 + cakupan `auth/bigquery` → saat menempel versi ini, **izinkan ulang** sekali. Tanpa `KONDISI_SUMBER=bq`, perilaku web app sama seperti v3.12.
- Proyek Platform: tempel `Platform.gs` + `Agregat.gs` baru, jalankan `pasangPemicu`.

## Uji
- `npm run check` lulus; `test:emu` 11 menu × desktop/400 px tanpa galat; `test:switch` LULUS; `test:marey` 2025 (63 lintas/2.440 KA) & 2026 (64/2.530) 0 gagal.
- `test:bq` (baru): tiruan BigQuery REST (halaman bertoken, job belum selesai) → hasil Kondisi identik dengan Sheets; cadangan ke Sheets bila galat; nama tabel & proyek tertutup.
- Belum diuji terhadap BigQuery sungguhan (sandbox belum dihubungkan dari lingkungan ini): format teks tabel eksternal diperiksa oleh `ujiKondisiBq()`; sintaks SQL agregat diperiksa parser dialek BigQuery.
