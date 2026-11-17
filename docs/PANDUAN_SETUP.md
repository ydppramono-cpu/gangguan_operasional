# Panduan setup (sekali jalan) — semua langkah Rp0

Urutan yang disarankan: **A (GitHub) → B (clasp) → C (Platform Tools) → D (BigQuery) → E (DBeaver) → F (LLM)**.
Langkah A dan B bisa ditunda. C dan F bisa dipakai tanpa BigQuery, karena cermin CSV dan bank kepintaran tetap berjalan.

## A. GitHub (penyimpanan kode)
Repo: **https://github.com/ydppramono-cpu/gangguan_operasional** (pastikan **privat**: Settings → General → Danger Zone → Change visibility).
1. Agar Claude bisa mendorong commit, pasang **Claude GitHub App** untuk repo ini: https://github.com/apps/claude/installations/select_target → pilih akun `ydppramono-cpu` → *Only select repositories* → `gangguan_operasional`.
2. Bila ingin mendorong sendiri, ekstrak `gangguan_operasional_repo.zip`, lalu jalankan:
   ```bash
   cd gangguan_operasional
   git remote set-url origin https://github.com/ydppramono-cpu/gangguan_operasional.git
   git push -u origin main
   ```
3. Buka **Settings → Branches** dan lindungi branch `main` (wajib lewat pull request dan pemeriksaan `check` lulus). Opsional untuk tim kecil.

## B. clasp — menghubungkan repo dengan editor Apps Script
1. Pasang Node.js LTS, lalu jalankan `npm install -g @google/clasp`.
2. Buka https://script.google.com/home/usersettings dan aktifkan **Google Apps Script API**.
3. Jalankan `clasp login`. Browser akan terbuka; login dengan akun pemilik proyek.
4. Di folder repo, salin `.clasp.json.example` menjadi `.clasp.json`. ID proyek web app (`scriptId`) sudah terisi.
5. **Cadangkan dulu kode yang sedang hidup**:
   ```bash
   mkdir ../cadangan-gas && cd ../cadangan-gas
   clasp clone 1NDtUtwUB8ys8MhSkvuv2-k-RgbpzmUSBFCDbOkeRAk5T9P0IQ-7NwoTy
   ```
6. Kembali ke repo, jalankan `npm ci` lalu `npm run check` (harus OK), kemudian `clasp push`.
   - Proyek GAS akan berisi modul `.gs` terpisah (`00_Config` … `18_SeedPeta`) dan berkas HTML parsial (`Index`, `Css.*`, `Js.*`, `View.*`, `Part.*`, `Ui.*`), menggantikan `Code.gs` dan `Index.html` gabungan.
   - **Hapus** `Code.gs` lama di editor bila masih ada setelah push, agar fungsi tidak terdefinisi dua kali.
   - Urutan berkas diatur oleh `filePushOrder`.
7. Di editor Apps Script, buka **Terapkan → Kelola deployment → Edit → Versi baru**.
8. Buka web app dan pastikan halaman tampil normal. Bila bermasalah, `clasp push` dari folder cadangan.

Tanpa clasp, Anda tetap bisa memakai cara lama: `python3 tools/pack.py dist/`, lalu tempel 6 berkas di `dist/` ke editor GAS. `dist/Index.html` sudah berupa satu berkas utuh (semua parsial digabung).

## C. Proyek "KAI Data Platform Tools" (Apps Script terpisah)
1. Buka https://script.new. Ganti nama proyek menjadi **KAI Data Platform Tools**, lalu pindahkan proyek ke folder Drive `KAI_Data_Platform/04_CODE_Source`.
2. Buat tiga berkas dengan isi dari repo:
   - `Tables.gs` dari `platform/Tables.gs`;
   - `Platform.gs` dari `platform/Platform.gs`;
   - manifest. Aktifkan dulu **Project Settings → Show "appsscript.json"**, lalu tempel isi `platform/appsscript.json`.
3. Buka **Project Settings → Script properties** dan isi:
   | Properti | Nilai |
   |---|---|
   | `CATALOG_ID` | `1H7lD5LXgm_OKnXjlBF4Jv7sDC4INyO29nFaPq6EeFkw` |
   | `INV_FOLDERS` | `16f-r6V11xdhQ3A0o27ntM8ZIYXJPLvj-,1jl7AcNRPmffYmsFhowfT9mDjyfYo3cXu,16jgUA2n72m7hllpsHW0UL7N9xQ3kRsuJ,1nAaK58GCIs1P9my3jd2TpBYkFNctyUlU` |
   | `BQ_PROJECT` | diisi setelah langkah D |
4. Jalankan `mirrorCsv` sekali dan berikan izin yang diminta.
   - Folder `05_DBEAVER_Mirror_CSV` akan terisi 23 berkas CSV dan `_manifest.csv`.
   - Tabel besar bisa butuh 2–3 kali jalan. Fungsi ini otomatis melanjutkan dari tabel terakhir.
5. Jalankan `inventarisDrive` sekali. Tab `Katalog_Drive` di katalog akan terisi, dan fungsi ini melanjutkan sendiri bila waktunya habis.
6. Jalankan `pasangPemicu` sekali. Pemicu yang dipasang:
   - cermin CSV tiap 15 menit, bila sumber berubah;
   - snapshot BigQuery tiap 15 menit, bila `BQ_PROJECT` terisi;
   - penyegaran BigQuery tiap tanggal 1;
   - inventaris tiap Minggu.

## D. BigQuery sandbox (gratis, tanpa kartu kredit)
1. Buka https://console.cloud.google.com/bigquery dengan akun pemilik, lalu buat proyek baru, misalnya `kai-data-platform`. Lewati penagihan; banner "Sandbox" akan muncul.
2. Salin **Project ID** ke properti `BQ_PROJECT` (langkah C3).
3. Jalankan `setupBigQuery`. Fungsi ini akan:
   - membuat dataset `kai_raw`, `kai`, dan `kai_snap` (lokasi Jakarta, `asia-southeast2`);
   - membuat 23 tabel eksternal;
   - mendeteksi format angka;
   - membuat fungsi `kai.num` dan `kai.tgl` serta view;
   - memverifikasi jumlah baris dan total.
4. Periksa tab `Log_Platform`. Langkah `verifikasiBigQuery` harus berstatus **ok**. Bila **PERIKSA**, lihat tabel mana yang selisih.
5. Jalankan `pasangPemicu` lagi agar pemicu snapshot ikut terpasang.
6. Bagikan akses ke anggota tim di **IAM**:
   - peran **BigQuery Data Viewer** dan **BigQuery Job User** di proyek;
   - akses **Viewer** ke spreadsheet di `02_DB` (dibutuhkan untuk `kai.*` yang live).

## E. DBeaver (Community, gratis)
**Jalur 1 — BigQuery (disarankan)**
1. Buat koneksi baru: **Database → New Connection → Google BigQuery**, lalu unduh driver bila diminta.
2. Isi **Project**: ID proyek dari langkah D.
3. Di **Driver properties**:
   - `OAuthType` = `1`, untuk login akun Google masing-masing;
   - `RequestGoogleDriveScope` = `1`, wajib agar view `kai.*` dapat membaca Google Sheets.
4. Uji koneksi, lalu jalankan:
   ```sql
   SELECT wilayah_kejadian, COUNT(*) n, SUM(total_andil_kelka_menit) menit
   FROM kai.gangguan_induk
   WHERE tanggal_kejadian >= DATE '2026-10-01' AND tanggal_kejadian < DATE '2026-11-01'
   GROUP BY 1 ORDER BY menit DESC;
   ```
5. Bila izin Drive gagal, pakai dataset `kai_snap`. Nama tabelnya sama dan tidak butuh izin Drive.

**Jalur 2 — CSV cermin (tanpa Google Cloud)**
1. Pasang **Google Drive untuk desktop**. Tandai folder `KAI_Data_Platform/05_DBEAVER_Mirror_CSV` sebagai *Available offline*.
2. Di DBeaver, buat koneksi **CSV** (Flat files) dan arahkan ke folder tersebut. Setiap berkas `.csv` akan muncul sebagai tabel.
3. Kesegaran data dapat dilihat di `_manifest.csv` (kolom `csv_ditulis`).

Koneksi DBeaver bersifat baca saja. Penulisan data tetap lewat Google Sheets.

## F. Bank kepintaran (Claude & ChatGPT)
1. **Claude.** Di Proyek "Dashboard Gangguan Operasional", tempel `knowledge/prompts/instruksi_claude_project.md` ke instruksi proyek, lalu tambahkan berkas `knowledge/*.md` dan `knowledge/rilis/*.md`.
2. **ChatGPT.** Buat GPT kustom sesuai `knowledge/prompts/instruksi_chatgpt_gpt.md`.
3. **Teks sumber berhalaman** (PTDO, KP-DJKA, Malka Rinja, Dinasan O.20, laporan) ada di Drive `03_KNOWLEDGE_Bank_Kepintaran/sumber_teks`.
4. **Menambah kepintaran.** Catat usulan di tab `KB_Kontribusi`. Usulan yang terverifikasi dipindahkan ke berkas `knowledge/` yang sesuai (lewat commit) dan diunggah ulang ke Proyek/GPT.

## Catatan keamanan (perlu keputusan pemilik)
- **Akses web app.** Manifest web app `executeAs: USER_DEPLOYING` dan `access: ANYONE_ANONYMOUS`: siapa pun yang memegang URL dapat membuka dashboard tanpa login. Ini **keputusan pemilik (17 Nov 2026: "semua orang bisa akses web app")**. Konsekuensinya: jangan menampilkan data pribadi (nama/NIPP/nomor telepon) di web app, dan jangan menaruh URL di tempat publik bila tidak dimaksudkan.
- **Repo.** Repo GitHub harus privat. Jangan commit `.clasp.json` yang berisi token (token clasp tersimpan di `~/.clasprc.json`, di luar repo).
- **Kata sandi.** Jangan pernah membagikan kata sandi akun Google di percakapan. Gunakan OAuth (login lewat browser).
