# gangguan_operasional — Dashboard Gangguan Operasional & KAI Data Platform

Gangguan operasional KAI Daop 1 sampai Divre 4.

Repo ini adalah sumber kebenaran untuk **kode web app** (Google Apps Script), **skema database**, **alat platform data**, dan **bank kepintaran LLM**. Paket zip yang ditempel manual hanyalah hasil build dari repo ini.

```
src/            Kode web app modular — didorong ke GAS dengan clasp
                  *.gs  : 00_Config … 18_SeedPeta (server)
                  *.html: Index (kerangka) + Css.* · Ui.* · Js.* · View.* · Part.* (digabung lewat include())
platform/       Proyek Apps Script terpisah "KAI Data Platform Tools": BigQuery (live), snapshot, cermin CSV, inventaris Drive
db/schema/      sumber_tabel.json (SATU sumber definisi tabel), kamus_data.csv (dibangkitkan)
db/bigquery/    DDL BigQuery: 00_dataset_udf.sql, 10_external_tables.sql, 20_views.sql (dibangkitkan)
knowledge/      Bank kepintaran untuk Claude & ChatGPT (panduan, istilah, rumus, kebijakan, sumber, keputusan, angka acuan, rilis, prompt)
tools/          gen_schema.py · export_seeds.py · pdf_to_kb.py · pack.py · check_build.py · html_include.py · split_html.py · module_order.json
docs/           PANDUAN_SETUP.md (langkah sekali jalan) · ARSITEKTUR.md · KAIDAH_KODING.md (standar penulisan kode)
```

## Prinsip
1. **Data ditulis di satu tempat**, yaitu Google Sheets milik pemilik. BigQuery, cermin CSV, dan DBeaver hanya membaca.
2. **Definisi tabel di satu tempat**, yaitu `db/schema/sumber_tabel.json`. Setelah mengubahnya, jalankan `python3 tools/gen_schema.py`. DDL, kamus data, dan `platform/Tables.gs` ikut diperbarui.
3. **Jejak sumber pada setiap angka** (berkas, tab, baris, dan SHA-256). Lihat `knowledge/03_KEBIJAKAN_DATA.md`.
4. **Biaya Rp0.** Semua komponen memakai layanan gratis: Google Drive/Sheets, Apps Script, BigQuery sandbox, GitHub privat, DBeaver Community, dan clasp.
5. **Tidak ada rahasia di repo.** Tidak boleh ada kunci akun layanan, token, atau kata sandi. ID spreadsheet bukan rahasia, tetapi repo harus tetap **privat**.

## Alur kerja harian
| Peran | Langkah |
|---|---|
| Pengembang | ubah `src/` → `npm run check` (lint + build) → `clasp push` → uji → Deploy versi baru → commit + catatan rilis di `knowledge/rilis/` |
| Analis | DBeaver → BigQuery `kai` (live) / `kai_snap` (≤15 mnt) / CSV cermin |
| Tim & LLM | Pertanyaan ke Proyek Claude / GPT ChatGPT. Temuan baru dicatat di tab `KB_Kontribusi`, ditinjau, lalu masuk ke `knowledge/` |

## Pemeriksaan kode
```bash
npm ci            # sekali, memasang ESLint (gratis, lokal)
npm run check     # ESLint + tools/check_build.py (include, sintaks, urutan push)
```
GitHub Actions menjalankan pemeriksaan yang sama pada setiap push/pull request (`.github/workflows/check.yml`). Aturan lengkap: `docs/KAIDAH_KODING.md`.

## Versi
- Web app: v3.10.0 (13 Nov 2026). Lihat `knowledge/rilis/`.
- Platform: 1.0.0 (16 Nov 2026).
