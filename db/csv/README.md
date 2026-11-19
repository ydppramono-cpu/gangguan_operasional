# db/csv — data non-Sheets dalam CSV (UTF-8, koma, header baris 1)

Dibangkitkan oleh `tools/csv/dump_seeds.js` + `tools/csv/export_csv.py` (lihat docstring untuk perintah lengkap).
Daftar tabel, jumlah baris, sumber, kunci, dan SHA-256 ada di `_manifest.csv`. Berkas > 2,8 MB dipecah `_bagN` (header di tiap bagian).
Data yang tinggal di Google Sheets (Gangguan_Induk, THI, RHI, WKP, Passenger, Freight, Hambatan_Jasum, Skema, MASTER GAPEKA,
Sarana SAP, basis data GAPEKA) dicerminkan ke Drive `05_DBEAVER_Mirror_CSV` oleh `platform/Platform.gs` → `mirrorCsv()`.
Peta keseluruhan sumber daya: `db/inventaris_sumber_daya.csv`.

DBeaver: buat koneksi "CSV" (driver Flat files) ke folder ini, atau impor ke DuckDB:
`CREATE TABLE master_stasiun AS SELECT * FROM read_csv_auto('master_stasiun.csv');`
`CREATE TABLE gapeka26_jadwal_dw AS SELECT * FROM read_csv_auto('gapeka26_jadwal_dw_bag*.csv');`
Kolom geometri `wkt` (peta_*) dibaca DuckDB spatial: `ST_GeomFromText(wkt)`. © kontributor OpenStreetMap, ODbL.
