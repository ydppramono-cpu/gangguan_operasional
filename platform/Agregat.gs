/** Agregat.gs — DIBANGKITKAN tools/bigquery/gen_agregat.py dari db/bigquery/30_agregat.sql. Jangan diedit manual. */
var PLATFORM_AGREGAT = [
 {
  "name": "rhi_bulanan",
  "sql": "CREATE OR REPLACE TABLE `${PROJECT}.kai_agg.rhi_bulanan`\nOPTIONS(description=\"RHI per sarana per bulan: hari data, HI (pulih) rata-rata/min/akhir, hari per status\") AS\nWITH d AS (\n  SELECT UPPER(REGEXP_REPLACE(nomor_sarana, r'\\s+', '')) AS nomor_sarana, UPPER(tipe_sarana) AS tipe_sarana, tgl_data,\n         IF(healthy_index_pulih <= 100, healthy_index_pulih, NULL) AS hi, UPPER(healthy_status) AS status, rams_index\n  FROM `${PROJECT}.kai_snap.rhi`\n  WHERE nomor_sarana IS NOT NULL AND tgl_data IS NOT NULL\n)\nSELECT nomor_sarana, ANY_VALUE(tipe_sarana) AS tipe_sarana, FORMAT_DATE('%Y-%m', tgl_data) AS bulan,\n  COUNT(*) AS hari_data, ROUND(AVG(hi), 2) AS hi_rata, MIN(hi) AS hi_min,\n  ARRAY_AGG(STRUCT(tgl_data, hi, status, rams_index) ORDER BY tgl_data DESC LIMIT 1)[OFFSET(0)].hi AS hi_akhir,\n  ARRAY_AGG(STRUCT(tgl_data, hi, status, rams_index) ORDER BY tgl_data DESC LIMIT 1)[OFFSET(0)].status AS status_akhir,\n  ARRAY_AGG(STRUCT(tgl_data, hi, status, rams_index) ORDER BY tgl_data DESC LIMIT 1)[OFFSET(0)].rams_index AS rams_akhir,\n  COUNTIF(status = 'HEALTHY') AS hari_healthy, COUNTIF(status = 'MONITOR') AS hari_monitor, COUNTIF(status = 'DECLINING') AS hari_declining,\n  MAX(tgl_data) AS tgl_terakhir\nFROM d GROUP BY nomor_sarana, bulan"
 },
 {
  "name": "rhi_status_terakhir",
  "sql": "CREATE OR REPLACE TABLE `${PROJECT}.kai_agg.rhi_status_terakhir`\nOPTIONS(description=\"Status RHI terakhir per sarana (baris tanggal terbaru)\") AS\nSELECT x.* FROM (\n  SELECT ARRAY_AGG(STRUCT(UPPER(REGEXP_REPLACE(nomor_sarana, r'\\s+', '')) AS nomor_sarana, UPPER(tipe_sarana) AS tipe_sarana, tgl_data,\n           IF(healthy_index_pulih <= 100, healthy_index_pulih, NULL) AS healthy_index, UPPER(healthy_status) AS healthy_status,\n           rams_index, reliability_index, perawatan_terakhir, tgl_perawatan) ORDER BY tgl_data DESC LIMIT 1)[OFFSET(0)] AS x\n  FROM `${PROJECT}.kai_snap.rhi`\n  WHERE nomor_sarana IS NOT NULL AND tgl_data IS NOT NULL\n  GROUP BY UPPER(REGEXP_REPLACE(nomor_sarana, r'\\s+', ''))\n)"
 },
 {
  "name": "thi_ringkas",
  "sql": "CREATE OR REPLACE TABLE `${PROJECT}.kai_agg.thi_ringkas`\nOPTIONS(description=\"THI per wilayah, periode, tingkat: jumlah unit dan rata-rata indeks (nilai > 100 diabaikan)\") AS\nSELECT wilayah, periode, tingkat, COUNT(*) AS jumlah_baris, COUNT(DISTINCT unit) AS jumlah_unit,\n  ROUND(AVG(IF(healthy_index <= 100, healthy_index, NULL)), 2) AS healthy_index_rata,\n  ROUND(AVG(IF(condition_index <= 100, condition_index, NULL)), 2) AS condition_index_rata,\n  ROUND(AVG(IF(maintenance_index <= 100, maintenance_index, NULL)), 2) AS maintenance_index_rata,\n  ROUND(SUM(panjang_petak_jalan_msp), 3) AS panjang_msp\nFROM `${PROJECT}.kai_snap.thi`\nWHERE unit IS NOT NULL\nGROUP BY wilayah, periode, tingkat"
 },
 {
  "name": "wkp_bulanan",
  "sql": "CREATE OR REPLACE TABLE `${PROJECT}.kai_agg.wkp_bulanan`\nOPTIONS(description=\"WKP per bulan & wilayah (tanggal/wilayah terverifikasi bila ada): jumlah kegiatan, menit nilai sumber\") AS\nSELECT FORMAT_DATE('%Y-%m', COALESCE(tanggal_terverifikasi, tanggal)) AS bulan,\n  COALESCE(wilayah_terverifikasi, wilayah) AS wilayah,\n  COUNT(*) AS jumlah_kegiatan, ROUND(SUM(durasi_dalam_menit_nilai_sumber), 1) AS menit_nilai_sumber\nFROM `${PROJECT}.kai_snap.wkp`\nWHERE jenis_kegiatan IS NOT NULL AND COALESCE(tanggal_terverifikasi, tanggal) IS NOT NULL\nGROUP BY bulan, wilayah"
 },
 {
  "name": "gangguan_bulanan",
  "sql": "CREATE OR REPLACE TABLE `${PROJECT}.kai_agg.gangguan_bulanan`\nOPTIONS(description=\"Gangguan_Induk per bulan, wilayah, kategori: jumlah kejadian dan total andil kelambatan (menit)\") AS\nSELECT FORMAT_DATE('%Y-%m', tanggal_kejadian) AS bulan, wilayah_kejadian AS wilayah, kategori_gangguan,\n  COUNT(*) AS jumlah_kejadian, ROUND(SUM(total_andil_kelka_menit), 1) AS andil_menit\nFROM `${PROJECT}.kai_snap.gangguan_induk`\nWHERE tanggal_kejadian IS NOT NULL\nGROUP BY bulan, wilayah, kategori_gangguan"
 }
];
