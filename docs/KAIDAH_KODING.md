# Kaidah penulisan kode — Web App Gangguan Operasional (Google Apps Script)

Dokumen ini adalah standar yang **wajib** diikuti siapa pun (manusia, Claude, ChatGPT, agen IDE) yang mengubah `src/` atau `platform/`.
Semua aturan yang bisa diperiksa mesin diperiksa oleh `npm run check`. Aturan lain diperiksa saat tinjauan pull request.

## 1. Struktur berkas

| Pola nama | Isi | Aturan |
|---|---|---|
| `NN_Nama.gs` (00–18) | Kode server Apps Script (V8) | Satu tanggung jawab per berkas; nomor = urutan muat (`filePushOrder`) |
| `Index.html` | Kerangka halaman | Hanya `<head>`, pustaka CDN berversi pasti, dan `<?!= include('…'); ?>` |
| `Css.*.html` | Satu blok `<style>` | `Css.Tokens` = variabel warna/ukuran; berkas lain hanya memakai token |
| `Ui.*.html` | Aset UI statis (ikon SVG, logo) | Tanpa logika |
| `Js.*.html` | Satu blok `<script>` | Satu modul per berkas, diekspor ke `window.KAI*` |
| `View.*.html` | Satu layar (tab) | Markup Alpine + `x-data` untuk layar itu |
| `Part.*.html` | Potongan markup yang dipakai ulang | Boleh di-include berkali-kali; harus mandiri |

- Include **hanya** dengan bentuk baku `<?!= include('Nama'); ?>` (tanpa `.html`). Penanda template lain (`<? ?>`, `<?= ?>`) tidak dipakai.
- Setiap berkas HTML wajib terjangkau dari `Index` (berkas yatim ditolak oleh `check_build.py`).
- Seed besar (`10_Seed`, `11_SeedJadwal`, `12_SeedRujukan`, `13_AsetLaporan`, `14_SeedResor`, `17_SeedDuksar`, `18_SeedPeta`, `Ui.Logo`) **dibangkitkan alat**, tidak disunting tangan, dan dikecualikan dari lint.

## 2. Penamaan

| Jenis | Gaya | Contoh |
|---|---|---|
| Fungsi publik server (dipanggil browser / editor / pemicu) | `camelCase` tanpa garis bawah | `apiBootstrap`, `syncNow`, `doGet` |
| Fungsi internal server | `camelCase_` (akhiran `_`) | `transformRows_`, `syncScheduled_` |
| Konstanta / konfigurasi | `UPPER_SNAKE_CASE` | `SOURCE_COLUMNS`, `MONTHS_ID` |
| Namespace modul | `PascalCase` | `Domain`, `Store`, `Kondisi` |
| Namespace browser | `window.KAI` (inti) dan `KAIA`, `KAIK`, `KAIP`, `KAIS` (modul `Js.*`) | `KAIA.sum(...)` |
| Variabel sengaja tak dipakai | awali `_` | `_unused` |

Akhiran `_` penting di Apps Script: fungsi berakhiran `_` **tidak bisa** dipanggil lewat `google.script.run` dan tidak tampil di menu Jalankan — ini lapisan keamanan karena web app terbuka untuk umum.

## 3. Kepala berkas dan komentar
- Setiap berkas dimulai dengan kepala: nama berkas, tanggung jawab, dan batasan. Contoh:
  ```js
  /**
   * 01_Domain.gs — fungsi murni untuk menormalkan dan mengklasifikasi kejadian.
   * Bisa diuji di luar Apps Script. Jangan memanggil SpreadsheetApp/DriveApp di file ini.
   */
  ```
  Untuk HTML: `<!-- View.Nama — ringkasan isi. -->` atau komentar pertama di dalam `<style>`/`<script>`.
- Fungsi publik diberi JSDoc singkat (tujuan, masukan, keluaran). Komentar menjelaskan **mengapa**, bukan mengulang kode.
- Bahasa komentar dan teks UI: Bahasa Indonesia baku, memakai istilah operasional KAI (lihat `knowledge/01_KAMUS_ISTILAH.md`).

## 4. Gaya penulisan
- Indentasi 2 spasi, UTF-8, akhir baris LF (`.editorconfig`). Kutip tunggal untuk string JS.
- Pakai `===`/`!==`; `== null` hanya untuk menguji `null`/`undefined` sekaligus.
- Tidak ada variabel/fungsi lokal yang tidak terpakai; kode mati dihapus, bukan dikomentari.
- Regex: tulis karakter khusus dengan escape Unicode (` `), bukan karakter tak kasatmata. Escape yang tidak perlu dihapus.
- Bila sebuah aturan lint sengaja dilanggar, pakai `// eslint-disable-line <aturan> -- alasan`. Alasan wajib.
- Kode server tetap ES5-kompatibel bergaya `var`/`function` seperti kode yang ada (konsisten), kecuali seluruh berkas dimigrasi sekaligus.

## 5. Pemisahan tanggung jawab
- **Fungsi murni** (`01_Domain`, `02_Transform`, `09_Ref`, `15_Kondisi`, `16_Pendapatan`) tidak memanggil layanan Google sehingga bisa diuji di Node.
- **Satu pintu ke browser**: hanya `06_Api.gs`. Semua mengembalikan `{ ok: true, … }` atau `{ ok: false, error }`; galat ditangkap, tidak dilempar ke browser.
- **Konfigurasi** (ID, ambang, aturan klasifikasi) hanya di `00_Config.gs`, tidak ditulis ulang di modul lain.
- **Agregasi berat** dilakukan di browser (`Js.Analytics`), server hanya menyiapkan snapshot ringkas.
- Penulisan ke Sheets memakai `LockService` dan validasi di server; sheet milik pengguna tidak diubah strukturnya.

## 6. Keamanan
- Web app terbuka untuk umum (`ANYONE_ANONYMOUS`, keputusan pemilik 17 Nov 2026). Karena itu:
  - jangan mengirim data pribadi (nama, NIPP, telepon, email) ke browser;
  - fungsi yang mengubah data atau mahal **wajib** berakhiran `_` atau hanya dijalankan dari editor;
  - masukan dari browser selalu divalidasi di server.
- Tidak ada rahasia di repo: kunci, token, kata sandi, `.clasp.json`, `.clasprc.json` (lihat `.gitignore`).
- Pustaka CDN memakai versi pasti (mis. `echarts@5.6.0`), tidak `@latest`.

## 7. Alur perubahan
1. Buat cabang, ubah kode.
2. `npm run check` — wajib lulus (ESLint + `tools/check_build.py`: include, sintaks semua `.gs` dan `<script>`, urutan push).
3. `clasp push`, uji di URL `/dev`, lalu deploy versi baru.
4. Bila tampilan berubah dengan sengaja, perbarui acuan: `python3 tools/check_build.py --perbarui-acuan`.
5. Commit dengan pesan jelas (apa + mengapa), naikkan `APP_VERSION` di `00_Config.gs`, tulis catatan rilis di `knowledge/rilis/`.
6. Pull request ke `main`; GitHub Actions menjalankan pemeriksaan yang sama.

## 8. Alat
| Perintah | Fungsi |
|---|---|
| `npm ci` | Pasang ESLint (lokal, gratis) |
| `npm run lint` | ESLint untuk `.gs` dan `.html` |
| `npm run check` | Lint + pemeriksaan build |
| `npm run pack` | Paket tempel manual di `dist/` (Index.html sudah digabung) |
| `python3 tools/gen_schema.py` | Bangkitkan DDL, kamus data, `platform/Tables.gs` dari `db/schema/sumber_tabel.json` |
