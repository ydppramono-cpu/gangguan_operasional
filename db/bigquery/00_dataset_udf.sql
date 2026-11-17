-- 00_dataset_udf.sql — dataset & fungsi bantu. Dijalankan otomatis oleh platform/Platform.gs (setupBigQuery),
-- atau manual di BigQuery Console setelah mengganti ${PROJECT} dan ${NUM_MODE} ('tampilan' | 'mentah').
CREATE SCHEMA IF NOT EXISTS `${PROJECT}.kai_raw` OPTIONS(location = "asia-southeast2", description = "Tabel eksternal Google Sheets (nilai apa adanya, STRING)");
CREATE SCHEMA IF NOT EXISTS `${PROJECT}.kai` OPTIONS(location = "asia-southeast2", description = "View bertipe untuk analisis & DBeaver");

-- kai.num: teks angka → FLOAT64. Mode 'tampilan' = format Indonesia (titik ribuan, koma desimal, "%"), mode 'mentah' = angka biasa.
CREATE OR REPLACE FUNCTION `${PROJECT}.kai.num`(s STRING) RETURNS FLOAT64 AS (
  CASE
    WHEN s IS NULL OR TRIM(s) = '' THEN NULL
    WHEN '${NUM_MODE}' = 'mentah' AND SAFE_CAST(TRIM(s) AS FLOAT64) IS NOT NULL THEN SAFE_CAST(TRIM(s) AS FLOAT64)
    WHEN REGEXP_CONTAINS(s, r',') THEN SAFE_CAST(REPLACE(REPLACE(REGEXP_REPLACE(TRIM(s), r'[^0-9,.\-]', ''), '.', ''), ',', '.') AS FLOAT64)
    WHEN REGEXP_CONTAINS(TRIM(s), r'^-?\d{1,3}(\.\d{3})+$') THEN SAFE_CAST(REPLACE(TRIM(s), '.', '') AS FLOAT64)
    ELSE SAFE_CAST(REGEXP_REPLACE(TRIM(s), r'[^0-9.\-]', '') AS FLOAT64)
  END
);

-- kai.tgl: teks tanggal → DATE. Menangani 2026-01-15, 2026-01 (hari 1), 15/01/2026, "15 Januari 2026", "01 Okt 2024", nomor seri Excel.
CREATE OR REPLACE FUNCTION `${PROJECT}.kai.tgl`(s STRING) RETURNS DATE AS (
  CASE
    WHEN s IS NULL OR TRIM(s) = '' THEN NULL
    WHEN REGEXP_CONTAINS(TRIM(s), r'^\d{4}-\d{2}-\d{2}') THEN SAFE.PARSE_DATE('%Y-%m-%d', SUBSTR(TRIM(s), 1, 10))
    WHEN REGEXP_CONTAINS(TRIM(s), r'^\d{4}-\d{2}$') THEN SAFE.PARSE_DATE('%Y-%m-%d', TRIM(s) || '-01')
    WHEN REGEXP_CONTAINS(TRIM(s), r'^\d{1,2}/\d{1,2}/\d{4}') THEN SAFE.PARSE_DATE('%d/%m/%Y', REGEXP_EXTRACT(TRIM(s), r'^\d{1,2}/\d{1,2}/\d{4}'))
    WHEN REGEXP_CONTAINS(TRIM(s), r'^\d{5}(\.\d+)?$') THEN DATE_ADD(DATE '1899-12-30', INTERVAL CAST(FLOOR(CAST(TRIM(s) AS FLOAT64)) AS INT64) DAY)
    ELSE SAFE.PARSE_DATE('%d %m %Y', REGEXP_REPLACE(REGEXP_REPLACE(REGEXP_REPLACE(REGEXP_REPLACE(REGEXP_REPLACE(REGEXP_REPLACE(
         REGEXP_REPLACE(REGEXP_REPLACE(REGEXP_REPLACE(REGEXP_REPLACE(REGEXP_REPLACE(REGEXP_REPLACE(
           REGEXP_EXTRACT(LOWER(TRIM(s)), r'^\d{1,2}\s+[a-z]+\s+\d{4}'),
           r'\s(jan|januari|january)\s', ' 01 '), r'\s(feb|februari|february)\s', ' 02 '), r'\s(mar|maret|march)\s', ' 03 '),
           r'\s(apr|april)\s', ' 04 '), r'\s(mei|may)\s', ' 05 '), r'\s(jun|juni|june)\s', ' 06 '), r'\s(jul|juli|july)\s', ' 07 '),
           r'\s(agu|agt|agus|agustus|aug|august)\s', ' 08 '), r'\s(sep|sept|september)\s', ' 09 '), r'\s(okt|oktober|oct|october)\s', ' 10 '),
           r'\s(nov|nopember|november)\s', ' 11 '), r'\s(des|desember|dec|december)\s', ' 12 '))
  END
);
