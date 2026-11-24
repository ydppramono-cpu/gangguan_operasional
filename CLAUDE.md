# CLAUDE.md — KAI Dashboard Gangguan Operasional

Web app Google Apps Script (GAS) untuk analisis gangguan operasional PT KAI. Pemilik: tim Pusdal/Operasi.
Bahasa UI, komentar, commit, dan dokumentasi: **Bahasa Indonesia**. Istilah KAI dipakai apa adanya (petak, emplasemen, WKP, Daop/Divre, UPT Resor JR, GAPEKA, Duksar).

## Aturan yang tidak boleh dilanggar
1. **Jangan mengarang data.** Setiap angka di UI berasal dari tabel yang tercatat di `db/schema/sumber_tabel.json` atau `db/csv/_manifest.csv`. Bila data tidak ada: tampilkan "tidak tercatat"/"–", bukan perkiraan. Perkiraan wajib berlabel "perkiraan".
2. **Seed dan CSV dibangkitkan alat**, tidak disunting tangan: `src/1x_Seed*.gs`, `src/2x_Seed*.gs` (termasuk `24_SeedOperasi.gs`), `db/csv/*`. Ubah skrip di `tools/`, jalankan ulang, bandingkan hasil.
3. **Tanpa rahasia di repo** (repo PUBLIK). ID spreadsheet/folder masuk Script Properties; `.clasp.json` diabaikan git.
4. **Fungsi publik server = yang boleh dipanggil browser** (tanpa akhiran `_`). Semua masukan dari browser divalidasi di server dengan daftar tertutup (contoh `apiGapeka(tahun)`).
5. Akses web app ANYONE_ANONYMOUS (keputusan pemilik). Nama petugas di uraian kejadian boleh tampil (keputusan 19 Nov 2026). Tanggal uji berkala sarana TIDAK dipakai.
6. Jangan mengubah tab Sheets milik tim (Gangguan_Induk, THI, RHI, WKP, Passenger, Freight, Hambatan_Jasum). Data JASUM diperbarui pemilik lewat ChatGPT — jangan disentuh. Tulis ke tab/berkas baru; cadangkan sebelum menulis.
7. Ikuti `docs/KAIDAH_KODING.md` (struktur berkas, penamaan, kepala berkas, Alpine/ECharts).

## Arsitektur (alternatif B, dipilih 19 Nov 2026)
Google Sheets (input tim) → GAS server (`src/*.gs`: ETL `runSync_` tiap 15 menit, snapshot gzip di Drive + CacheService, API `api*`) → tampilan HtmlService (`src/Index.html` + parsial `Css./Ui./Js./View./Part.*`, Alpine.js + ECharts + Tabulator).
BigQuery sandbox (`platform/`): tabel eksternal atas Sheets + salinan berkala + agregat berat (RHI/THI/WKP); dipakai web app (bila diaktifkan) dan DBeaver. Batas sandbox: 10 GB, 1 TB kueri/bulan, tabel kedaluwarsa 60 hari (pemicu memuat ulang), tanpa DML/kueri terjadwal.
Rincian: `docs/ARSITEKTUR.md`, kontrak data: `docs/KONTRAK_DATA.md`.

## Kelas & temuan (v3.19)
Kategori & Subgangguan kosong → kelas diturunkan (pola teks, lalu kelas terdekat), bertanda * + keyakinan; tidak ada kelas "belum". Temuan tampil sebagai pita di bawah grafik sumbernya (`Js.Pita` MAP: src.label → `rute:kartu`); Ringkasan = 3 sorotan. Bantuan: `Js.Help` (tur, panduan, glosarium, FAQ).

## Lima kunci penghubung data
kode stasiun · petak `A-B` · nomor KA · nomor sarana (dinormalkan tanpa spasi) · kode UPT Resor JR (`4.22`). Master stasiun gabungan: `db/csv/master_stasiun.csv`.

## GAPEKA
GAPEKA 2025 (berlaku 1 Feb 2025) dan 2026 (berlaku 1 Des 2026) dianalisis **masing-masing**, tidak dihitung selisihnya. Satu switch global di pojok kanan atas (`KAI.gapeka`) menentukan sumber jadwal untuk semua menu; bawaan = versi yang berlaku hari ini (WIB).

## Peta
Wilayah & koridor memakai peta vektor OSM sendiri (dasar P1: `SEED_PETA`, © kontributor OpenStreetMap, ODbL). Ubin OpenRailwayMap/OSM tidak dipakai (kebijakan pemakaian).

## Perintah
- `npm run check` — ESLint + `tools/check_build.py` (include, sintaks, urutan push) + uji koordinat stasiun (`tools/peta/koreksi_koordinat.py --cek`: pulau, koordinat kembar seperti KTG/KTP Ketapang, jarak tetangga rute). Wajib lulus sebelum commit.
- `npm run test:emu` — pipeline .gs asli di Node + semua menu (dan semua tab) di Chromium desktop/400 px, termasuk pemeriksa kerapian (teks sisa, tab bergulir, label kelas, bento, baris kosong); `STRICT=1` = gagal bila ada temuan (data sintetis dari seed repo; pustaka di `tests/emulator/node_modules`).
- `npm run test:gapeka` — data GAPEKA 2025 & 2026 untuk switch global (seed terbaca, jam tidak mundur, km lintas urut, baris jadwal lengkap). Grafik Marey dihapus v3.18.0.
- `npm run test:switch` — switch GAPEKA global: bawaan, ganti ke 2026, kembali ke 2025 (setelah `test:emu` membangun app.html).
- `npm run test:pulau` — aturan pulau Paket A (mutasi, nomor diragukan, awalan KA Sumatera, KA lintas pulau, kelas diturunkan, daftar depo).
- `npm run test:akses` / `npm run test:alur` — fungsi publik terkunci; alur klik umum → rinci.
- `npm run test:bq` — adaptor BigQuery web app (`src/22_Bq.gs`) dengan tiruan BigQuery: hasil Kondisi setara Sheets, cadangan ke Sheets, masukan tertutup.
- `python3 -I tools/peta/koreksi_koordinat.py` — koreksi koordinat (CSV beralasan; `interpolasi` = km lembar GAPEKA di graf rel OSM; kode kembar `KODE@wilayah`) + geometri petak dari graf rel OSM. `python3 tools/peta/bangun_daratan.py` — daratan peta (Natural Earth 10m + koridor rel).
- `python3 tools/bigquery/gen_agregat.py` — bangkitkan `platform/Agregat.gs` dari `db/bigquery/30_agregat.sql`.
- `npm run pack` — paket tempel editor GAS di `dist/` (Code.gs, Index.html utuh, seed terpisah).
- `npm run csv` — ekspor ulang CSV non-Sheets ke `db/csv` (lihat docstring `tools/csv/export_csv.py`).
- `python3 -I tools/operasi/impor_operasi.py <xlsx…>` lalu `python3 -I tools/operasi/build_operasi_seed.py` — program operasi KA (Jalan/Batal, frekuensi/km, stasiun perhentian, pola operasi) → `db/csv` → `src/24_SeedOperasi.gs`.
Perintah proyek Claude Code: `/uji`, `/rilis`, `/data-baru`, `/fitur` (`.claude/commands`). Agen: `peninjau-data`, `peninjau-ui` (`.claude/agents`).

## Rilis
Naikkan `CONFIG.APP_VERSION` (00_Config.gs) + `package.json`; tulis `knowledge/rilis/ringkasan_rilis_vX.Y.Z.md`; `npm run check` + uji; `npm run pack`; commit (pesan Indonesia, ringkas) + push; unggah `dist/` ke Drive `04_CODE/GAS_tempel_vX.Y.Z`; pemilik menempel ke editor GAS lalu Deploy → New version. Naikkan `CONFIG.SCHEMA` hanya bila bentuk snapshot berubah.

## Lokasi penting (ID tidak rahasia, tetapi jangan dipakai di kode — pakai Script Properties)
Drive induk "Web App Gangguan Operasional" · `KAI_Data_Platform/02_DB` (basis data utama, GAPEKA 2025/2026) · `04_CODE` (paket tempel) · `05_DBEAVER_Mirror_CSV` (CSV).
