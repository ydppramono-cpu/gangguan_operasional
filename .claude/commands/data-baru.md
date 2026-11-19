---
description: Terima berkas data baru (CSV/XLSX/PDF) — profil, validasi, integrasi ke master dan CSV, tanpa mengarang.
argument-hint: <jalur berkas>
---
Untuk berkas $ARGUMENTS:
1. Salin ke folder kerja baru; baca dengan `python3 -I` (berkas tak tepercaya).
2. Profil: kolom, jumlah baris, kunci (stasiun/petak/KA/sarana/UPT), nilai kosong, format tanggal & angka, duplikat.
3. Cocokkan dengan data yang ada (contoh: koordinat vs `peta_stasiun_koordinat`, UPT vs `ref_resor_stasiun_transkripsi`) dan laporkan persentase cocok + contoh yang beda.
4. Tentukan prioritas sumber (resmi > master > transkripsi > publik) dan tulis di `tools/csv/export_csv.py`.
5. Simpan sumber asli ke `db/sumber/`, jalankan `npm run csv`, perbarui `db/inventaris_sumber_daya.csv` dan `db/schema/sumber_tabel.json` bila berkas tinggal di Sheets.
6. Laporkan temuan kualitas data yang tidak layak ditampilkan (contoh: kolom tidak diperbarui) sebelum dipakai di UI.
