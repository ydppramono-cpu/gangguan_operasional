-- 30_agregat.sql — agregat berat RHI / THI / WKP / Gangguan di dataset kai_agg (alternatif B). DITULIS TANGAN (sumber kebenaran).
-- Dibaca tools/bigquery/gen_agregat.py → platform/Agregat.gs; dijalankan agregatBigQuery() (pemicu harian).
-- Sumber: tabel asli kai_snap.* (salinan view kai.*), bukan tabel eksternal, agar kueri murah dan tidak membaca ulang Sheets.
-- CREATE OR REPLACE TABLE = DDL (diizinkan di sandbox; DML tidak) dan sekaligus memperbarui masa kedaluwarsa 60 hari.
-- Semua angka = hasil hitung langsung dari kolom sumber; tidak ada nilai perkiraan. Nilai indeks > 100 dianggap rusak (sama dengan web app).

CREATE OR REPLACE TABLE `${PROJECT}.kai_agg.rhi_bulanan`
OPTIONS(description="RHI lokomotif per sarana per bulan: hari data, HI rata-rata/min/akhir, hari per status (ekspor 22 kolom sejak 25 Nov 2026)") AS
WITH d AS (
  SELECT UPPER(REGEXP_REPLACE(nomor_sarana, r'\s+', '')) AS nomor_sarana, UPPER(tipe_sarana) AS tipe_sarana, tgl_data,
         IF(healthy_index <= 100, healthy_index, NULL) AS hi, UPPER(healthy_status) AS status, rams_index
  FROM `${PROJECT}.kai_snap.rhi`
  WHERE nomor_sarana IS NOT NULL AND tgl_data IS NOT NULL
)
SELECT nomor_sarana, ANY_VALUE(tipe_sarana) AS tipe_sarana, FORMAT_DATE('%Y-%m', tgl_data) AS bulan,
  COUNT(*) AS hari_data, ROUND(AVG(hi), 2) AS hi_rata, MIN(hi) AS hi_min,
  ARRAY_AGG(STRUCT(tgl_data, hi, status, rams_index) ORDER BY tgl_data DESC LIMIT 1)[OFFSET(0)].hi AS hi_akhir,
  ARRAY_AGG(STRUCT(tgl_data, hi, status, rams_index) ORDER BY tgl_data DESC LIMIT 1)[OFFSET(0)].status AS status_akhir,
  ARRAY_AGG(STRUCT(tgl_data, hi, status, rams_index) ORDER BY tgl_data DESC LIMIT 1)[OFFSET(0)].rams_index AS rams_akhir,
  COUNTIF(status = 'HEALTHY') AS hari_healthy, COUNTIF(status = 'MONITOR') AS hari_monitor, COUNTIF(status = 'DECLINING') AS hari_declining,
  COUNTIF(status = 'POOR') AS hari_poor, COUNTIF(status = 'CRITICAL') AS hari_critical,
  MAX(tgl_data) AS tgl_terakhir
FROM d GROUP BY nomor_sarana, bulan;

CREATE OR REPLACE TABLE `${PROJECT}.kai_agg.rhi_status_terakhir`
OPTIONS(description="Status RHI terakhir per sarana (baris tanggal terbaru)") AS
SELECT x.* FROM (
  SELECT ARRAY_AGG(STRUCT(UPPER(REGEXP_REPLACE(nomor_sarana, r'\s+', '')) AS nomor_sarana, UPPER(tipe_sarana) AS tipe_sarana, tgl_data,
           IF(healthy_index <= 100, healthy_index, NULL) AS healthy_index, UPPER(healthy_status) AS healthy_status,
           rams_index, reliability_index, dipo, daop) ORDER BY tgl_data DESC LIMIT 1)[OFFSET(0)] AS x
  FROM `${PROJECT}.kai_snap.rhi`
  WHERE nomor_sarana IS NOT NULL AND tgl_data IS NOT NULL
  GROUP BY UPPER(REGEXP_REPLACE(nomor_sarana, r'\s+', ''))
);

CREATE OR REPLACE TABLE `${PROJECT}.kai_agg.thi_ringkas`
OPTIONS(description="THI per wilayah, periode, tingkat: jumlah unit dan rata-rata indeks (nilai > 100 diabaikan)") AS
SELECT wilayah, periode, tingkat, COUNT(*) AS jumlah_baris, COUNT(DISTINCT unit) AS jumlah_unit,
  ROUND(AVG(IF(healthy_index <= 100, healthy_index, NULL)), 2) AS healthy_index_rata,
  ROUND(AVG(IF(condition_index <= 100, condition_index, NULL)), 2) AS condition_index_rata,
  ROUND(AVG(IF(maintenance_index <= 100, maintenance_index, NULL)), 2) AS maintenance_index_rata,
  ROUND(SUM(panjang_petak_jalan_msp), 3) AS panjang_msp
FROM `${PROJECT}.kai_snap.thi`
WHERE unit IS NOT NULL
GROUP BY wilayah, periode, tingkat;

CREATE OR REPLACE TABLE `${PROJECT}.kai_agg.wkp_bulanan`
OPTIONS(description="WKP per bulan & wilayah (tanggal/wilayah terverifikasi bila ada): jumlah kegiatan, menit nilai sumber") AS
SELECT FORMAT_DATE('%Y-%m', COALESCE(tanggal_terverifikasi, tanggal)) AS bulan,
  COALESCE(wilayah_terverifikasi, wilayah) AS wilayah,
  COUNT(*) AS jumlah_kegiatan, ROUND(SUM(durasi_dalam_menit_nilai_sumber), 1) AS menit_nilai_sumber
FROM `${PROJECT}.kai_snap.wkp`
WHERE jenis_kegiatan IS NOT NULL AND COALESCE(tanggal_terverifikasi, tanggal) IS NOT NULL
GROUP BY bulan, wilayah;

CREATE OR REPLACE TABLE `${PROJECT}.kai_agg.gangguan_bulanan`
OPTIONS(description="Gangguan_Induk per bulan, wilayah, kategori: jumlah kejadian dan total andil kelambatan (menit)") AS
SELECT FORMAT_DATE('%Y-%m', tanggal_kejadian) AS bulan, wilayah_kejadian AS wilayah, kategori_gangguan,
  COUNT(*) AS jumlah_kejadian, ROUND(SUM(total_andil_kelka_menit), 1) AS andil_menit
FROM `${PROJECT}.kai_snap.gangguan_induk`
WHERE tanggal_kejadian IS NOT NULL
GROUP BY bulan, wilayah, kategori_gangguan;
