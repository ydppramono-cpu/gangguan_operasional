-- 10_external_tables.sql — DIBANGKITKAN tools/gen_schema.py. Jangan diedit manual.
-- Tabel eksternal BigQuery yang membaca Google Sheets secara langsung (live). Semua kolom STRING = nilai apa adanya di sheet.
-- Ganti ${PROJECT} dengan ID proyek Google Cloud Anda. Dataset: kai_raw (eksternal) dan kai (view bertipe).

-- gangguan_induk: SSOT kejadian gangguan & hambatan (dashboard) (DB!Gangguan_Induk)
CREATE OR REPLACE EXTERNAL TABLE `${PROJECT}.kai_raw.gangguan_induk` (
  nomor_sumber STRING OPTIONS(description="Nomor sumber"),
  kode_laporan STRING OPTIONS(description="Kode laporan"),
  tanggal_kejadian STRING OPTIONS(description="Tanggal kejadian"),
  hari STRING OPTIONS(description="Hari"),
  bulan STRING OPTIONS(description="Bulan"),
  tahun STRING OPTIONS(description="Tahun"),
  kategori_gangguan STRING OPTIONS(description="Kategori gangguan"),
  subgangguan STRING OPTIONS(description="Subgangguan"),
  jenis_sarana STRING OPTIONS(description="Jenis sarana"),
  nomor_sarana STRING OPTIONS(description="Nomor sarana"),
  wilayah_kejadian STRING OPTIONS(description="Wilayah kejadian"),
  depo_induk STRING OPTIONS(description="Depo induk"),
  wilayah_depo STRING OPTIONS(description="Wilayah depo"),
  judul_gangguan STRING OPTIONS(description="Judul gangguan"),
  kode_jenis_gangguan STRING OPTIONS(description="Kode jenis gangguan"),
  jam_mulai STRING OPTIONS(description="Jam mulai"),
  stasiun STRING OPTIONS(description="Stasiun"),
  petak_jalan STRING OPTIONS(description="Petak jalan"),
  kilometer STRING OPTIONS(description="Kilometer"),
  nomor_sarana_penolong STRING OPTIONS(description="Nomor sarana penolong"),
  keterangan_kejadian STRING OPTIONS(description="Keterangan kejadian"),
  nomor_kereta_api_terkait STRING OPTIONS(description="Nomor kereta api terkait"),
  total_andil_kelka_menit STRING OPTIONS(description="Total Andil Kelka (menit)"),
  sumber_data STRING OPTIONS(description="Sumber data"),
  tab_asal STRING OPTIONS(description="Tab asal"),
  baris_asal STRING OPTIONS(description="Baris asal"),
  kunci_asal STRING OPTIONS(description="Kunci asal"),
  sha_256_sumber STRING OPTIONS(description="SHA-256 sumber"),
  status_kualitas STRING OPTIONS(description="Status kualitas"),
  alamat_sumber STRING OPTIONS(description="Alamat sumber"),
  penyebab_terlapor STRING OPTIONS(description="Penyebab terlapor"),
  tindak_lanjut_terlapor STRING OPTIONS(description="Tindak lanjut terlapor"),
  bukti_ekstraksi STRING OPTIONS(description="Bukti ekstraksi"),
  status_ekstraksi STRING OPTIONS(description="Status ekstraksi"),
  versi_aturan_ekstraksi STRING OPTIONS(description="Versi aturan ekstraksi")
) OPTIONS (format = "GOOGLE_SHEETS", uris = ["https://docs.google.com/spreadsheets/d/1HmlF2DL4KeHGVSO87aQAKu86dbfrnZohkCA7SsaL3OM"], sheet_range = "Gangguan_Induk!A:AI", skip_leading_rows = 1, description = "SSOT kejadian gangguan & hambatan (dashboard)");

-- hambatan_jasum: Arsip impor REKAP HAMBATAN JASUM (hulu; dipetakan ke gangguan_induk) (DB!Hambatan_Jasum)
CREATE OR REPLACE EXTERNAL TABLE `${PROJECT}.kai_raw.hambatan_jasum` (
  tanggal STRING OPTIONS(description="Tanggal"),
  lokasi STRING OPTIONS(description="Lokasi"),
  direktorat STRING OPTIONS(description="Direktorat"),
  jenis_hambatan STRING OPTIONS(description="Jenis hambatan"),
  kode STRING OPTIONS(description="Kode"),
  mulai STRING OPTIONS(description="Mulai"),
  akhir STRING OPTIONS(description="Akhir"),
  durasi_hambatan_menit STRING OPTIONS(description="Durasi hambatan (menit)"),
  keterangan STRING OPTIONS(description="Keterangan"),
  bulan_asli STRING OPTIONS(description="Bulan asli"),
  kelompok_kode STRING OPTIONS(description="Kelompok kode"),
  kolom_l_asli STRING OPTIONS(description="Kolom L asli"),
  sumber STRING OPTIONS(description="Sumber"),
  tab_sumber STRING OPTIONS(description="Tab sumber"),
  baris_sumber STRING OPTIONS(description="Baris sumber"),
  kunci_jejak STRING OPTIONS(description="Kunci jejak"),
  sha_256_baris_asli STRING OPTIONS(description="SHA-256 baris asli"),
  status_kualitas STRING OPTIONS(description="Status kualitas"),
  jenis_catatan STRING OPTIONS(description="Jenis catatan"),
  ka_terganggu_sumber STRING OPTIONS(description="KA terganggu (sumber)"),
  andil_per_ka_sumber_menit STRING OPTIONS(description="Andil per KA (sumber, menit)")
) OPTIONS (format = "GOOGLE_SHEETS", uris = ["https://docs.google.com/spreadsheets/d/1HmlF2DL4KeHGVSO87aQAKu86dbfrnZohkCA7SsaL3OM"], sheet_range = "Hambatan_Jasum!A:U", skip_leading_rows = 1, description = "Arsip impor REKAP HAMBATAN JASUM (hulu; dipetakan ke gangguan_induk)");

-- passenger: Pendapatan & volume penumpang per KA per bulan (DB!Passenger)
CREATE OR REPLACE EXTERNAL TABLE `${PROJECT}.kai_raw.passenger` (
  tanggal_bulan STRING OPTIONS(description="Tanggal (Bulan)"),
  pendapatan_rp STRING OPTIONS(description="Pendapatan (Rp)"),
  nomor_ka STRING OPTIONS(description="Nomor KA"),
  nama_ka STRING OPTIONS(description="Nama KA"),
  kelas_ka STRING OPTIONS(description="Kelas KA"),
  relasi_awal_akhir_naik STRING OPTIONS(description="Relasi (Awal-Akhir Naik)"),
  jumlah_penumpang STRING OPTIONS(description="Jumlah Penumpang"),
  realisasi_terisi_eko_pnp STRING OPTIONS(description="Realisasi Terisi EKO (Pnp)"),
  realisasi_terisi_eks_pnp STRING OPTIONS(description="Realisasi Terisi EKS (Pnp)"),
  realisasi_terisi_bis_pnp STRING OPTIONS(description="Realisasi Terisi BIS (Pnp)"),
  pct_porsi_eko STRING OPTIONS(description="% Porsi EKO"),
  pct_porsi_eks STRING OPTIONS(description="% Porsi EKS"),
  pct_porsi_bis STRING OPTIONS(description="% Porsi BIS"),
  jenis_ka STRING OPTIONS(description="Jenis KA"),
  pendapatan_eko_rp STRING OPTIONS(description="Pendapatan EKO (Rp)"),
  pendapatan_eks_rp STRING OPTIONS(description="Pendapatan EKS (Rp)"),
  pendapatan_bis_rp STRING OPTIONS(description="Pendapatan BIS (Rp)")
) OPTIONS (format = "GOOGLE_SHEETS", uris = ["https://docs.google.com/spreadsheets/d/1HmlF2DL4KeHGVSO87aQAKu86dbfrnZohkCA7SsaL3OM"], sheet_range = "Passenger!A:Q", skip_leading_rows = 1, description = "Pendapatan & volume penumpang per KA per bulan");

-- freight: Pendapatan & volume barang per Nama KA/komoditas per bulan (DB!Freight)
CREATE OR REPLACE EXTERNAL TABLE `${PROJECT}.kai_raw.freight` (
  tanggal_bulan STRING OPTIONS(description="Tanggal (Bulan)"),
  pendapatan_rp STRING OPTIONS(description="Pendapatan (Rp)"),
  nama_ka STRING OPTIONS(description="Nama KA"),
  komoditas STRING OPTIONS(description="Komoditas"),
  komoditas_detail STRING OPTIONS(description="Komoditas Detail"),
  nama_mitra STRING OPTIONS(description="Nama Mitra"),
  volume_real_ton STRING OPTIONS(description="Volume Real (Ton)"),
  relasi STRING OPTIONS(description="Relasi"),
  tarif_rata_rata_rp_ton STRING OPTIONS(description="Tarif Rata-rata (Rp/Ton)")
) OPTIONS (format = "GOOGLE_SHEETS", uris = ["https://docs.google.com/spreadsheets/d/1HmlF2DL4KeHGVSO87aQAKu86dbfrnZohkCA7SsaL3OM"], sheet_range = "Freight!A:I", skip_leading_rows = 1, description = "Pendapatan & volume barang per Nama KA/komoditas per bulan");

-- thi: Track Health Index per wilayah/resor/petak per bulan (DB!THI)
CREATE OR REPLACE EXTERNAL TABLE `${PROJECT}.kai_raw.thi` (
  wilayah STRING OPTIONS(description="Wilayah"),
  periode STRING OPTIONS(description="Periode"),
  bulan STRING OPTIONS(description="Bulan"),
  tingkat STRING OPTIONS(description="Tingkat"),
  unit STRING OPTIONS(description="Unit"),
  healthy_index STRING OPTIONS(description="Healthy Index"),
  grade_healthy_index STRING OPTIONS(description="Grade Healthy Index"),
  condition_index STRING OPTIONS(description="Condition Index"),
  grade_condition STRING OPTIONS(description="Grade Condition"),
  material STRING OPTIONS(description="Material"),
  konstruksi STRING OPTIONS(description="Konstruksi"),
  geometri STRING OPTIONS(description="Geometri"),
  material_rel_dan_sambungan_las_30pct STRING OPTIONS(description="Material - Rel dan Sambungan Las (30%)"),
  material_sambungan_pelat_20pct STRING OPTIONS(description="Material - Sambungan Pelat (20%)"),
  material_penambat_15pct STRING OPTIONS(description="Material - Penambat (15%)"),
  material_wesel_15pct STRING OPTIONS(description="Material - Wesel (15%)"),
  material_balas_plinth_10pct STRING OPTIONS(description="Material - Balas/Plinth (10%)"),
  material_bantalan_10pct STRING OPTIONS(description="Material - Bantalan (10%)"),
  konstruksi_badan_jalan_dan_lereng_50pct STRING OPTIONS(description="Konstruksi - Badan Jalan dan Lereng (50%)"),
  konstruksi_drainase_30pct STRING OPTIONS(description="Konstruksi - Drainase (30%)"),
  konstruksi_lingkungan_20pct STRING OPTIONS(description="Konstruksi - Lingkungan (20%)"),
  maintenance_index STRING OPTIONS(description="Maintenance Index"),
  grade_maintenance STRING OPTIONS(description="Grade Maintenance"),
  inspeksi_terjadwal STRING OPTIONS(description="Inspeksi Terjadwal"),
  ppj STRING OPTIONS(description="PPJ"),
  mir STRING OPTIONS(description="MIR"),
  perawatan_korektif_wmr STRING OPTIONS(description="Perawatan Korektif (WMR)"),
  ppj_program STRING OPTIONS(description="PPJ Program"),
  ppj_realisasi STRING OPTIONS(description="PPJ Realisasi"),
  mir_program STRING OPTIONS(description="MIR Program"),
  mir_realisasi STRING OPTIONS(description="MIR Realisasi"),
  wmr_program STRING OPTIONS(description="WMR Program"),
  wmr_realisasi STRING OPTIONS(description="WMR Realisasi"),
  panjang_petak_jalan_msp STRING OPTIONS(description="Panjang Petak Jalan (mSp)"),
  jumlah_hektometer STRING OPTIONS(description="Jumlah Hektometer"),
  hm_tanpa_kasus_lengkap_material STRING OPTIONS(description="Hm Tanpa Kasus Lengkap - Material"),
  hm_tanpa_kasus_lengkap_konstruksi STRING OPTIONS(description="Hm Tanpa Kasus Lengkap - Konstruksi"),
  catatan STRING OPTIONS(description="Catatan"),
  berkas_sumber STRING OPTIONS(description="Berkas sumber"),
  tab_sumber STRING OPTIONS(description="Tab sumber"),
  baris_sumber STRING OPTIONS(description="Baris sumber"),
  kunci_data STRING OPTIONS(description="Kunci data"),
  sha_256_nilai_sumber STRING OPTIONS(description="SHA-256 nilai sumber"),
  kode_upt_jr STRING OPTIONS(description="Kode UPT JR"),
  unit_resor_referensi_thi STRING OPTIONS(description="Unit resor (referensi THI)"),
  qc_peta STRING OPTIONS(description="QC (peta)"),
  kode_jalur_jenis_sumber STRING OPTIONS(description="Kode jalur/jenis (sumber)"),
  id_petak_thi STRING OPTIONS(description="ID petak THI"),
  dasar_pemetaan STRING OPTIONS(description="Dasar pemetaan"),
  halaman_peta_wilayah_1_pdf STRING OPTIONS(description="Halaman PETA WILAYAH(1).pdf"),
  pembagi_indeks_sumber STRING OPTIONS(description="Pembagi indeks sumber")
) OPTIONS (format = "GOOGLE_SHEETS", uris = ["https://docs.google.com/spreadsheets/d/1HmlF2DL4KeHGVSO87aQAKu86dbfrnZohkCA7SsaL3OM"], sheet_range = "THI!A:AY", skip_leading_rows = 1, description = "Track Health Index per wilayah/resor/petak per bulan");

-- rhi: Rolling stock Health Index harian per sarana (DB!RHI)
CREATE OR REPLACE EXTERNAL TABLE `${PROJECT}.kai_raw.rhi` (
  nomor_sarana STRING OPTIONS(description="nomor_sarana"),
  tipe_sarana STRING OPTIONS(description="tipe_sarana"),
  tgl_data STRING OPTIONS(description="tgl_data"),
  perawatan_terakhir STRING OPTIONS(description="perawatan_terakhir"),
  tgl_perawatan STRING OPTIONS(description="tgl_perawatan"),
  reliability_index STRING OPTIONS(description="reliability_index"),
  maintainability_index STRING OPTIONS(description="maintainability_index"),
  availability_index STRING OPTIONS(description="availability_index"),
  rams_index STRING OPTIONS(description="rams_index"),
  total_request_rows STRING OPTIONS(description="total_request_rows"),
  total_terpenuhi STRING OPTIONS(description="total_terpenuhi"),
  list_maintenance_realisasi STRING OPTIONS(description="list_maintenance_realisasi"),
  list_maintenance_seharusnya STRING OPTIONS(description="list_maintenance_seharusnya"),
  spare_management_score STRING OPTIONS(description="spare_management_score"),
  maintenance_completion_score STRING OPTIONS(description="maintenance_completion_score"),
  maintenance_index STRING OPTIONS(description="maintenance_index"),
  umur_kereta STRING OPTIONS(description="umur_kereta"),
  age_index STRING OPTIONS(description="age_index"),
  penalti_open STRING OPTIONS(description="penalti_open"),
  penalti_lengkap STRING OPTIONS(description="penalti_lengkap"),
  real_condition_index STRING OPTIONS(description="real_condition_index"),
  onsite_inspection_index STRING OPTIONS(description="onsite_inspection_index"),
  condition_index STRING OPTIONS(description="condition_index"),
  healthy_index STRING OPTIONS(description="healthy_index"),
  healthy_status STRING OPTIONS(description="healthy_status"),
  berkas_sumber STRING OPTIONS(description="Berkas sumber"),
  tab_sumber STRING OPTIONS(description="Tab sumber"),
  baris_sumber STRING OPTIONS(description="Baris sumber"),
  kunci_sarana_tanggal STRING OPTIONS(description="Kunci sarana-tanggal"),
  sha_256_nilai_sumber STRING OPTIONS(description="SHA-256 nilai sumber"),
  catatan_pemeriksaan STRING OPTIONS(description="Catatan pemeriksaan"),
  healthy_index_pulih STRING OPTIONS(description="healthy_index (pulih)"),
  condition_index_pulih STRING OPTIONS(description="condition_index (pulih)"),
  onsite_inspection_index_pulih STRING OPTIONS(description="onsite_inspection_index (pulih)"),
  maintenance_index_pulih STRING OPTIONS(description="maintenance_index (pulih)"),
  umur_kereta_pulih_tahun STRING OPTIONS(description="umur_kereta (pulih; tahun)"),
  age_index_pulih STRING OPTIONS(description="age_index (pulih)"),
  pemeriksaan_pemulihan STRING OPTIONS(description="Pemeriksaan pemulihan"),
  catatan_verifikasi_rumus STRING OPTIONS(description="Catatan verifikasi rumus")
) OPTIONS (format = "GOOGLE_SHEETS", uris = ["https://docs.google.com/spreadsheets/d/1HmlF2DL4KeHGVSO87aQAKu86dbfrnZohkCA7SsaL3OM"], sheet_range = "RHI!A:AM", skip_leading_rows = 1, description = "Rolling stock Health Index harian per sarana");

-- wkp: Window time / WKP (program & realisasi) per wilayah (DB!WKP)
CREATE OR REPLACE EXTERNAL TABLE `${PROJECT}.kai_raw.wkp` (
  nomor_sumber STRING OPTIONS(description="Nomor sumber"),
  tanggal STRING OPTIONS(description="Tanggal"),
  wilayah STRING OPTIONS(description="Wilayah"),
  jenis_kegiatan STRING OPTIONS(description="Jenis kegiatan"),
  program_mulai STRING OPTIONS(description="Program mulai"),
  program_akhir STRING OPTIONS(description="Program akhir"),
  program_durasi_hari_excel STRING OPTIONS(description="Program durasi (hari Excel)"),
  realisasi_mulai STRING OPTIONS(description="Realisasi mulai"),
  realisasi_akhir STRING OPTIONS(description="Realisasi akhir"),
  realisasi_durasi_hari_excel STRING OPTIONS(description="Realisasi durasi (hari Excel)"),
  keterangan STRING OPTIONS(description="Keterangan"),
  ka_terimbas_kolom_l_sumber STRING OPTIONS(description="KA terimbas - kolom L sumber"),
  ka_terimbas_kolom_m_sumber STRING OPTIONS(description="KA terimbas - kolom M sumber"),
  rumus_waktu_nilai_sumber STRING OPTIONS(description="Rumus waktu - nilai sumber"),
  sela_perka_nilai_sumber STRING OPTIONS(description="Sela perka - nilai sumber"),
  durasi_dalam_menit_nilai_sumber STRING OPTIONS(description="Durasi dalam menit - nilai sumber"),
  berkas_sumber STRING OPTIONS(description="Berkas sumber"),
  tab_sumber STRING OPTIONS(description="Tab sumber"),
  baris_sumber STRING OPTIONS(description="Baris sumber"),
  sha_256_nilai_sumber STRING OPTIONS(description="SHA-256 nilai sumber"),
  tanggal_terverifikasi STRING OPTIONS(description="Tanggal terverifikasi"),
  wilayah_terverifikasi STRING OPTIONS(description="Wilayah terverifikasi"),
  catatan_penelusuran_tanggal STRING OPTIONS(description="Catatan penelusuran tanggal"),
  baris_tab STRING OPTIONS(description="Baris tab"),
  tanggal_terkoreksi STRING OPTIONS(description="Tanggal terkoreksi"),
  wilayah_terkoreksi STRING OPTIONS(description="Wilayah terkoreksi"),
  kode_aturan STRING OPTIONS(description="Kode aturan"),
  kode_aturan_penelusuran STRING OPTIONS(description="Kode aturan penelusuran")
) OPTIONS (format = "GOOGLE_SHEETS", uris = ["https://docs.google.com/spreadsheets/d/1HmlF2DL4KeHGVSO87aQAKu86dbfrnZohkCA7SsaL3OM"], sheet_range = "WKP!A:AB", skip_leading_rows = 1, description = "Window time / WKP (program & realisasi) per wilayah");

-- gapeka25_list_ka: LIST KA GAPEKA 2025 (perjalanan, relasi, jadwal ringkas, susunan) (GAPEKA25!LIST KA)
CREATE OR REPLACE EXTERNAL TABLE `${PROJECT}.kai_raw.gapeka25_list_ka` (
  no_ka STRING OPTIONS(description="No KA"),
  jenis_ka STRING OPTIONS(description="Jenis KA"),
  nama_ka STRING OPTIONS(description="Nama KA"),
  nama_identitas_ka STRING OPTIONS(description="Nama Identitas KA"),
  lintas STRING OPTIONS(description="Lintas"),
  jarak STRING OPTIONS(description="Jarak"),
  jarak_salinan STRING OPTIONS(description="Jarak (salinan)"),
  jam_ber STRING OPTIONS(description="Jam Ber"),
  jam_dat STRING OPTIONS(description="Jam Dat"),
  wp STRING OPTIONS(description="WP"),
  kol_k STRING OPTIONS(description="kol_k"),
  wilayah STRING OPTIONS(description="Wilayah"),
  pnp_brg STRING OPTIONS(description="Pnp/brg"),
  kelas_ka STRING OPTIONS(description="Kelas KA"),
  kol_o STRING OPTIONS(description="kol_o"),
  jenis_pelayanan STRING OPTIONS(description="Jenis Pelayanan"),
  klasifikasi_ka STRING OPTIONS(description="Klasifikasi KA"),
  kelas_ka_2 STRING OPTIONS(description="Kelas KA 2"),
  wilayah_2 STRING OPTIONS(description="Wilayah 2"),
  kol_t STRING OPTIONS(description="kol_t"),
  komersial_pso_perintis STRING OPTIONS(description="Komersial/PSO/Perintis"),
  kol_v STRING OPTIONS(description="kol_v"),
  klasifikasi_ka_2 STRING OPTIONS(description="Klasifikasi KA 2"),
  kol_x STRING OPTIONS(description="kol_x"),
  ber STRING OPTIONS(description="ber"),
  kol_z STRING OPTIONS(description="kol_z"),
  kol_aa STRING OPTIONS(description="kol_aa"),
  kol_ab STRING OPTIONS(description="kol_ab"),
  kol_ac STRING OPTIONS(description="kol_ac"),
  kol_ad STRING OPTIONS(description="kol_ad"),
  dat STRING OPTIONS(description="dat"),
  kol_af STRING OPTIONS(description="kol_af"),
  ber_2 STRING OPTIONS(description="Ber"),
  st_ber STRING OPTIONS(description="St. Ber"),
  daop_divre_ber STRING OPTIONS(description="Daop/Divre ber"),
  dat_2 STRING OPTIONS(description="Dat"),
  st_dat STRING OPTIONS(description="St. Dat"),
  daop_divre_dat STRING OPTIONS(description="Daop/Divre dat"),
  kol_am STRING OPTIONS(description="kol_am"),
  sf STRING OPTIONS(description="SF"),
  kap_td STRING OPTIONS(description="Kap TD"),
  kol_ap STRING OPTIONS(description="kol_ap"),
  detail_ka STRING OPTIONS(description="Detail KA"),
  reg_tamb STRING OPTIONS(description="Reg/tamb"),
  kol_as STRING OPTIONS(description="kol_as"),
  jenis_layanan_djka STRING OPTIONS(description="Jenis Layanan (DJKA)"),
  kol_au STRING OPTIONS(description="kol_au"),
  kol_av STRING OPTIONS(description="kol_av")
) OPTIONS (format = "GOOGLE_SHEETS", uris = ["https://docs.google.com/spreadsheets/d/15yHI4aO3abw5D-Hhfmrhf0lk3hGQdWF99DRmv7aOoKI"], sheet_range = "'LIST KA'!A:AV", skip_leading_rows = 3, description = "LIST KA GAPEKA 2025 (perjalanan, relasi, jadwal ringkas, susunan)");

-- gapeka25_stasiun: Daftar stasiun GAPEKA 2025 (GAPEKA25!LIST STASIUN)
CREATE OR REPLACE EXTERNAL TABLE `${PROJECT}.kai_raw.gapeka25_stasiun` (
  id_trainplan STRING OPTIONS(description="ID Trainplan"),
  singkatan_stasiun STRING OPTIONS(description="Singkatan Stasiun"),
  nama_stasiun STRING OPTIONS(description="Nama Stasiun"),
  wilayah_operasi STRING OPTIONS(description="Wilayah Operasi"),
  status STRING OPTIONS(description="Status")
) OPTIONS (format = "GOOGLE_SHEETS", uris = ["https://docs.google.com/spreadsheets/d/15yHI4aO3abw5D-Hhfmrhf0lk3hGQdWF99DRmv7aOoKI"], sheet_range = "'LIST STASIUN'!A:E", skip_leading_rows = 1, description = "Daftar stasiun GAPEKA 2025");

-- gapeka25_petak: Daftar petak jalan GAPEKA 2025 (GAPEKA25!LIST PETAK JALAN)
CREATE OR REPLACE EXTERNAL TABLE `${PROJECT}.kai_raw.gapeka25_petak` (
  daop_divre STRING OPTIONS(description="Daop/Divre"),
  lintas STRING OPTIONS(description="Lintas"),
  stasiun_a STRING OPTIONS(description="Stasiun A"),
  stasiun_b STRING OPTIONS(description="Stasiun B"),
  petak_jalan STRING OPTIONS(description="Petak Jalan"),
  jarak STRING OPTIONS(description="Jarak"),
  ganda_tunggal STRING OPTIONS(description="Ganda/Tunggal")
) OPTIONS (format = "GOOGLE_SHEETS", uris = ["https://docs.google.com/spreadsheets/d/15yHI4aO3abw5D-Hhfmrhf0lk3hGQdWF99DRmv7aOoKI"], sheet_range = "'LIST PETAK JALAN'!A:G", skip_leading_rows = 1, description = "Daftar petak jalan GAPEKA 2025");

-- ref_jadwal_dw_2025: Buku Daftar Waktu GAPEKA 2025 (diekstrak per baris; seed 11_SeedJadwal.gs) (REF!jadwal_dw_2025)
CREATE OR REPLACE EXTERNAL TABLE `${PROJECT}.kai_raw.ref_jadwal_dw_2025` (
  no_ka STRING OPTIONS(description="no_ka"),
  nama_ka STRING OPTIONS(description="nama_ka"),
  relasi STRING OPTIONS(description="relasi"),
  urut STRING OPTIONS(description="urut"),
  kode_stasiun STRING OPTIONS(description="kode_stasiun"),
  nama_stasiun STRING OPTIONS(description="nama_stasiun"),
  datang STRING OPTIONS(description="datang"),
  berangkat STRING OPTIONS(description="berangkat"),
  keterangan STRING OPTIONS(description="keterangan"),
  catatan STRING OPTIONS(description="catatan"),
  sumber_buku STRING OPTIONS(description="sumber_buku")
) OPTIONS (format = "GOOGLE_SHEETS", uris = ["https://docs.google.com/spreadsheets/d/1nQuug9iDE6AeK8ZMRyk1dBbK849GDvLiP8l88kPQ3I0"], sheet_range = "jadwal_dw_2025!A:K", skip_leading_rows = 1, description = "Buku Daftar Waktu GAPEKA 2025 (diekstrak per baris; seed 11_SeedJadwal.gs)");

-- ref_ptdo_2025_stasiun_tutup: PTDO GAPEKA 2025 Bab IV (seed 11_SeedJadwal.gs) (REF!ptdo_2025_stasiun_tutup)
CREATE OR REPLACE EXTERNAL TABLE `${PROJECT}.kai_raw.ref_ptdo_2025_stasiun_tutup` (
  kode_stasiun STRING OPTIONS(description="kode_stasiun"),
  jenis STRING OPTIONS(description="jenis"),
  mulai STRING OPTIONS(description="mulai"),
  akhir STRING OPTIONS(description="akhir")
) OPTIONS (format = "GOOGLE_SHEETS", uris = ["https://docs.google.com/spreadsheets/d/1nQuug9iDE6AeK8ZMRyk1dBbK849GDvLiP8l88kPQ3I0"], sheet_range = "ptdo_2025_stasiun_tutup!A:D", skip_leading_rows = 1, description = "PTDO GAPEKA 2025 Bab IV (seed 11_SeedJadwal.gs)");

-- ref_depo_ka_2025: Duksar/PTDO GAPEKA 2025 (seed SEED_DEPO_KA) (REF!depo_ka_2025)
CREATE OR REPLACE EXTERNAL TABLE `${PROJECT}.kai_raw.ref_depo_ka_2025` (
  depo STRING OPTIONS(description="depo"),
  kode STRING OPTIONS(description="kode"),
  jenis STRING OPTIONS(description="jenis"),
  daftar_ka STRING OPTIONS(description="daftar_ka"),
  kol_5 STRING OPTIONS(description="kol_5")
) OPTIONS (format = "GOOGLE_SHEETS", uris = ["https://docs.google.com/spreadsheets/d/1nQuug9iDE6AeK8ZMRyk1dBbK849GDvLiP8l88kPQ3I0"], sheet_range = "depo_ka_2025!A:E", skip_leading_rows = 1, description = "Duksar/PTDO GAPEKA 2025 (seed SEED_DEPO_KA)");

-- ref_jpl: Daftar 1.404 titik peningkatan keselamatan perlintasan sebidang (seed SEED_JPL) (REF!jpl)
CREATE OR REPLACE EXTERNAL TABLE `${PROJECT}.kai_raw.ref_jpl` (
  no STRING OPTIONS(description="no"),
  petak STRING OPTIONS(description="petak"),
  no_jpl STRING OPTIONS(description="no_jpl"),
  km STRING OPTIONS(description="km"),
  provinsi STRING OPTIONS(description="provinsi"),
  kabupaten_kota STRING OPTIONS(description="kabupaten_kota"),
  status_jalan STRING OPTIONS(description="status_jalan"),
  kolom_8 STRING OPTIONS(description="kolom_8"),
  kolom_9 STRING OPTIONS(description="kolom_9"),
  kolom_10 STRING OPTIONS(description="kolom_10"),
  wilayah STRING OPTIONS(description="wilayah"),
  kolom_12 STRING OPTIONS(description="kolom_12")
) OPTIONS (format = "GOOGLE_SHEETS", uris = ["https://docs.google.com/spreadsheets/d/1nQuug9iDE6AeK8ZMRyk1dBbK849GDvLiP8l88kPQ3I0"], sheet_range = "jpl!A:L", skip_leading_rows = 1, description = "Daftar 1.404 titik peningkatan keselamatan perlintasan sebidang (seed SEED_JPL)");

-- ref_resor_meta: PETA_WILAYAH 2026 (transkripsi 10 Nov 2026) (PETA_WILAYAH.pdf) (REF!resor_meta)
CREATE OR REPLACE EXTERNAL TABLE `${PROJECT}.kai_raw.ref_resor_meta` (
  kode_resor STRING OPTIONS(description="kode_resor"),
  wilayah STRING OPTIONS(description="wilayah"),
  nama STRING OPTIONS(description="nama"),
  jumlah STRING OPTIONS(description="jumlah"),
  km_awal STRING OPTIONS(description="km_awal"),
  km_akhir STRING OPTIONS(description="km_akhir"),
  cakupan STRING OPTIONS(description="cakupan")
) OPTIONS (format = "GOOGLE_SHEETS", uris = ["https://docs.google.com/spreadsheets/d/1nQuug9iDE6AeK8ZMRyk1dBbK849GDvLiP8l88kPQ3I0"], sheet_range = "resor_meta!A:G", skip_leading_rows = 1, description = "PETA_WILAYAH 2026 (transkripsi 10 Nov 2026) (PETA_WILAYAH.pdf)");

-- ref_resor_stasiun: PETA_WILAYAH 2026 (transkripsi 10 Nov 2026) (REF!resor_stasiun)
CREATE OR REPLACE EXTERNAL TABLE `${PROJECT}.kai_raw.ref_resor_stasiun` (
  kode_stasiun STRING OPTIONS(description="kode_stasiun"),
  kode_resor STRING OPTIONS(description="kode_resor")
) OPTIONS (format = "GOOGLE_SHEETS", uris = ["https://docs.google.com/spreadsheets/d/1nQuug9iDE6AeK8ZMRyk1dBbK849GDvLiP8l88kPQ3I0"], sheet_range = "resor_stasiun!A:B", skip_leading_rows = 1, description = "PETA_WILAYAH 2026 (transkripsi 10 Nov 2026)");

-- ref_resor_petak: PETA_WILAYAH 2026 (transkripsi 10 Nov 2026) (REF!resor_petak)
CREATE OR REPLACE EXTERNAL TABLE `${PROJECT}.kai_raw.ref_resor_petak` (
  petak STRING OPTIONS(description="petak"),
  kode_resor STRING OPTIONS(description="kode_resor"),
  catatan STRING OPTIONS(description="catatan")
) OPTIONS (format = "GOOGLE_SHEETS", uris = ["https://docs.google.com/spreadsheets/d/1nQuug9iDE6AeK8ZMRyk1dBbK849GDvLiP8l88kPQ3I0"], sheet_range = "resor_petak!A:C", skip_leading_rows = 1, description = "PETA_WILAYAH 2026 (transkripsi 10 Nov 2026)");

-- ref_stasiun_koordinat: OSM via enwo02/train-tracker (rail tiles) — diunduh 13 Nov 2026 · © kontributor OpenStreetMap, ODbL 1.0 (REF!stasiun_koordinat)
CREATE OR REPLACE EXTERNAL TABLE `${PROJECT}.kai_raw.ref_stasiun_koordinat` (
  kode_stasiun STRING OPTIONS(description="kode_stasiun"),
  lat STRING OPTIONS(description="lat"),
  lon STRING OPTIONS(description="lon"),
  elevasi_m STRING OPTIONS(description="elevasi_m"),
  sumber_koordinat STRING OPTIONS(description="sumber_koordinat")
) OPTIONS (format = "GOOGLE_SHEETS", uris = ["https://docs.google.com/spreadsheets/d/1nQuug9iDE6AeK8ZMRyk1dBbK849GDvLiP8l88kPQ3I0"], sheet_range = "stasiun_koordinat!A:E", skip_leading_rows = 1, description = "OSM via enwo02/train-tracker (rail tiles) — diunduh 13 Nov 2026 · © kontributor OpenStreetMap, ODbL 1.0");

-- ref_petak_osm: © kontributor OpenStreetMap, ODbL 1.0 (REF!petak_osm)
CREATE OR REPLACE EXTERNAL TABLE `${PROJECT}.kai_raw.ref_petak_osm` (
  petak STRING OPTIONS(description="petak"),
  km_osm STRING OPTIONS(description="km_osm"),
  cocok_jarak_25pct STRING OPTIONS(description="cocok_jarak_25pct"),
  jumlah_jembatan STRING OPTIONS(description="jumlah_jembatan"),
  panjang_jembatan_m STRING OPTIONS(description="panjang_jembatan_m"),
  jumlah_terowongan STRING OPTIONS(description="jumlah_terowongan"),
  panjang_terowongan_m STRING OPTIONS(description="panjang_terowongan_m"),
  pct_elektrifikasi STRING OPTIONS(description="pct_elektrifikasi"),
  vmax_osm_kmj STRING OPTIONS(description="vmax_osm_kmj"),
  nama_lintas_osm STRING OPTIONS(description="nama_lintas_osm"),
  wikipedia STRING OPTIONS(description="wikipedia")
) OPTIONS (format = "GOOGLE_SHEETS", uris = ["https://docs.google.com/spreadsheets/d/1nQuug9iDE6AeK8ZMRyk1dBbK849GDvLiP8l88kPQ3I0"], sheet_range = "petak_osm!A:K", skip_leading_rows = 1, description = "© kontributor OpenStreetMap, ODbL 1.0");

-- ref_duksar_unit_siap_guna: Buku Dukungan Sarana (Duksar) GAPEKA 2025: Jawa (2 Jan 25), Sumbar (2 Jan 25), Sumsel (3 Jan 25), Sumut (2 Jan 25) (REF!duksar_unit_siap_guna)
CREATE OR REPLACE EXTERNAL TABLE `${PROJECT}.kai_raw.ref_duksar_unit_siap_guna` (
  jenis STRING OPTIONS(description="jenis"),
  depo_induk STRING OPTIONS(description="depo_induk"),
  nomor_sarana STRING OPTIONS(description="nomor_sarana")
) OPTIONS (format = "GOOGLE_SHEETS", uris = ["https://docs.google.com/spreadsheets/d/1nQuug9iDE6AeK8ZMRyk1dBbK849GDvLiP8l88kPQ3I0"], sheet_range = "duksar_unit_siap_guna!A:C", skip_leading_rows = 1, description = "Buku Dukungan Sarana (Duksar) GAPEKA 2025: Jawa (2 Jan 25), Sumbar (2 Jan 25), Sumsel (3 Jan 25), Sumut (2 Jan 25)");

-- ref_duksar_lok_depo: Buku Dukungan Sarana (Duksar) GAPEKA 2025: Jawa (2 Jan 25), Sumbar (2 Jan 25), Sumsel (3 Jan 25), Sumut (2 Jan 25) (REF!duksar_lok_depo)
CREATE OR REPLACE EXTERNAL TABLE `${PROJECT}.kai_raw.ref_duksar_lok_depo` (
  depo STRING OPTIONS(description="depo"),
  book STRING OPTIONS(description="book"),
  siap_operasi STRING OPTIONS(description="siap_operasi"),
  perbaikan STRING OPTIONS(description="perbaikan"),
  siap_guna STRING OPTIONS(description="siap_guna"),
  km_per_hari STRING OPTIONS(description="km_per_hari"),
  jam_efektif STRING OPTIONS(description="jam_efektif"),
  jam_operasi STRING OPTIONS(description="jam_operasi"),
  daftar_ka STRING OPTIONS(description="daftar_ka")
) OPTIONS (format = "GOOGLE_SHEETS", uris = ["https://docs.google.com/spreadsheets/d/1nQuug9iDE6AeK8ZMRyk1dBbK849GDvLiP8l88kPQ3I0"], sheet_range = "duksar_lok_depo!A:I", skip_leading_rows = 1, description = "Buku Dukungan Sarana (Duksar) GAPEKA 2025: Jawa (2 Jan 25), Sumbar (2 Jan 25), Sumsel (3 Jan 25), Sumut (2 Jan 25)");

-- ref_rujukan: Rujukan media & ilmiah terverifikasi (seed 12_SeedRujukan.gs) (REF!rujukan)
CREATE OR REPLACE EXTERNAL TABLE `${PROJECT}.kai_raw.ref_rujukan` (
  id STRING OPTIONS(description="ID"),
  jenis STRING OPTIONS(description="Jenis"),
  sitasi_apa STRING OPTIONS(description="Sitasi APA"),
  url STRING OPTIONS(description="URL"),
  tanggal_terbit STRING OPTIONS(description="Tanggal terbit"),
  wilayah STRING OPTIONS(description="Wilayah"),
  topik STRING OPTIONS(description="Topik"),
  fakta_kunci STRING OPTIONS(description="Fakta kunci"),
  implikasi_untuk_operasi STRING OPTIONS(description="Implikasi untuk operasi"),
  status_verifikasi STRING OPTIONS(description="Status verifikasi"),
  aktif STRING OPTIONS(description="Aktif")
) OPTIONS (format = "GOOGLE_SHEETS", uris = ["https://docs.google.com/spreadsheets/d/1nQuug9iDE6AeK8ZMRyk1dBbK849GDvLiP8l88kPQ3I0"], sheet_range = "rujukan!A:K", skip_leading_rows = 1, description = "Rujukan media & ilmiah terverifikasi (seed 12_SeedRujukan.gs)");

-- ref_koreksi_data: Log koreksi data berbukti (seed 12_SeedRujukan.gs) (REF!koreksi_data)
CREATE OR REPLACE EXTERNAL TABLE `${PROJECT}.kai_raw.ref_koreksi_data` (
  tanda_isi STRING OPTIONS(description="Tanda isi"),
  kunci_asal_saat_dibuat STRING OPTIONS(description="Kunci asal (saat dibuat)"),
  jenis_koreksi STRING OPTIONS(description="Jenis koreksi"),
  nilai_baru STRING OPTIONS(description="Nilai baru"),
  nilai_asli STRING OPTIONS(description="Nilai asli"),
  bukti STRING OPTIONS(description="Bukti"),
  diusulkan_oleh STRING OPTIONS(description="Diusulkan oleh"),
  tanggal STRING OPTIONS(description="Tanggal"),
  aktif STRING OPTIONS(description="Aktif")
) OPTIONS (format = "GOOGLE_SHEETS", uris = ["https://docs.google.com/spreadsheets/d/1nQuug9iDE6AeK8ZMRyk1dBbK849GDvLiP8l88kPQ3I0"], sheet_range = "koreksi_data!A:I", skip_leading_rows = 1, description = "Log koreksi data berbukti (seed 12_SeedRujukan.gs)");

-- gapeka26_jadwal_dw: Daftar Waktu GAPEKA 2026 per KA × stasiun (rencana; dasar pembanding realisasi) (G26DB!jadwal_dw_2026)
CREATE OR REPLACE EXTERNAL TABLE `${PROJECT}.kai_raw.gapeka26_jadwal_dw` (
  no_ka STRING OPTIONS(description="no_ka"),
  nama_ka STRING OPTIONS(description="nama_ka"),
  relasi STRING OPTIONS(description="relasi"),
  urut STRING OPTIONS(description="urut"),
  kode_stasiun STRING OPTIONS(description="kode_stasiun"),
  nama_stasiun STRING OPTIONS(description="nama_stasiun"),
  vmax_kmj STRING OPTIONS(description="vmax_kmj"),
  datang STRING OPTIONS(description="datang"),
  berangkat STRING OPTIONS(description="berangkat"),
  keterangan STRING OPTIONS(description="keterangan"),
  sumber_buku STRING OPTIONS(description="sumber_buku"),
  status_verifikasi STRING OPTIONS(description="status_verifikasi")
) OPTIONS (format = "GOOGLE_SHEETS", uris = ["https://docs.google.com/spreadsheets/d/14Cz2Ovgwa_hoWg1KAbdOcN4JkvrAeoXoR-4NpsY1Ung"], sheet_range = "jadwal_dw_2026!A:L", skip_leading_rows = 1, description = "Daftar Waktu GAPEKA 2026 per KA × stasiun (rencana; dasar pembanding realisasi)");

-- gapeka26_penomoran_ka: Buku Penomoran GAPEKA 2026: nomor, kelas, relasi, jam awal/akhir (G26DB!penomoran_ka_2026)
CREATE OR REPLACE EXTERNAL TABLE `${PROJECT}.kai_raw.gapeka26_penomoran_ka` (
  wilayah STRING OPTIONS(description="wilayah"),
  kelas_ka STRING OPTIONS(description="kelas_ka"),
  no_ka STRING OPTIONS(description="no_ka"),
  status STRING OPTIONS(description="status"),
  nama_ka STRING OPTIONS(description="nama_ka"),
  nama_identitas STRING OPTIONS(description="nama_identitas"),
  lintas STRING OPTIONS(description="lintas"),
  penyelenggara STRING OPTIONS(description="penyelenggara"),
  jarak_km STRING OPTIONS(description="jarak_km"),
  berangkat STRING OPTIONS(description="berangkat"),
  datang STRING OPTIONS(description="datang"),
  waktu_tempuh STRING OPTIONS(description="waktu_tempuh")
) OPTIONS (format = "GOOGLE_SHEETS", uris = ["https://docs.google.com/spreadsheets/d/14Cz2Ovgwa_hoWg1KAbdOcN4JkvrAeoXoR-4NpsY1Ung"], sheet_range = "penomoran_ka_2026!A:L", skip_leading_rows = 1, description = "Buku Penomoran GAPEKA 2026: nomor, kelas, relasi, jam awal/akhir");

-- gapeka26_jarak_lintas: Matriks Jarak Antar Stasiun 2026 (km kumulatif) (G26DB!jarak_lintas_2026)
CREATE OR REPLACE EXTERNAL TABLE `${PROJECT}.kai_raw.gapeka26_jarak_lintas` (
  wilayah STRING OPTIONS(description="wilayah"),
  lintas STRING OPTIONS(description="lintas"),
  urut STRING OPTIONS(description="urut"),
  kode_stasiun STRING OPTIONS(description="kode_stasiun"),
  km_kumulatif STRING OPTIONS(description="km_kumulatif"),
  sumber STRING OPTIONS(description="sumber")
) OPTIONS (format = "GOOGLE_SHEETS", uris = ["https://docs.google.com/spreadsheets/d/14Cz2Ovgwa_hoWg1KAbdOcN4JkvrAeoXoR-4NpsY1Ung"], sheet_range = "jarak_lintas_2026!A:F", skip_leading_rows = 1, description = "Matriks Jarak Antar Stasiun 2026 (km kumulatif)");

-- gapeka26_lintas_lembar: Urutan stasiun + km per judul lintas Lembar GAPEKA 2026 (G26DB!lintas_lembar_2026)
CREATE OR REPLACE EXTERNAL TABLE `${PROJECT}.kai_raw.gapeka26_lintas_lembar` (
  lembar STRING OPTIONS(description="lembar"),
  wilayah STRING OPTIONS(description="wilayah"),
  judul_lintas STRING OPTIONS(description="judul_lintas"),
  urut STRING OPTIONS(description="urut"),
  kode_stasiun STRING OPTIONS(description="kode_stasiun"),
  nama_stasiun STRING OPTIONS(description="nama_stasiun"),
  km STRING OPTIONS(description="km"),
  berkas_lembar STRING OPTIONS(description="berkas_lembar")
) OPTIONS (format = "GOOGLE_SHEETS", uris = ["https://docs.google.com/spreadsheets/d/14Cz2Ovgwa_hoWg1KAbdOcN4JkvrAeoXoR-4NpsY1Ung"], sheet_range = "lintas_lembar_2026!A:H", skip_leading_rows = 1, description = "Urutan stasiun + km per judul lintas Lembar GAPEKA 2026");

-- gapeka26_duksar_rekap: Duksar 2026: rekap siap guna/operasi per jenis sarana (G26DB!duksar_rekap_2026)
CREATE OR REPLACE EXTERNAL TABLE `${PROJECT}.kai_raw.gapeka26_duksar_rekap` (
  wilayah STRING OPTIONS(description="wilayah"),
  jenis_sarana STRING OPTIONS(description="jenis_sarana"),
  siap_guna STRING OPTIONS(description="siap_guna"),
  siap_operasi STRING OPTIONS(description="siap_operasi"),
  stamformasi STRING OPTIONS(description="stamformasi"),
  cadangan STRING OPTIONS(description="cadangan")
) OPTIONS (format = "GOOGLE_SHEETS", uris = ["https://docs.google.com/spreadsheets/d/14Cz2Ovgwa_hoWg1KAbdOcN4JkvrAeoXoR-4NpsY1Ung"], sheet_range = "duksar_rekap_2026!A:F", skip_leading_rows = 1, description = "Duksar 2026: rekap siap guna/operasi per jenis sarana");

-- gapeka26_duksar_lok_dipo: Duksar 2026: lokomotif per dipo (G26DB!duksar_lok_dipo_2026)
CREATE OR REPLACE EXTERNAL TABLE `${PROJECT}.kai_raw.gapeka26_duksar_lok_dipo` (
  wilayah STRING OPTIONS(description="wilayah"),
  dipo STRING OPTIONS(description="dipo"),
  jenis_lok STRING OPTIONS(description="jenis_lok"),
  siap_guna STRING OPTIONS(description="siap_guna"),
  tsgo STRING OPTIONS(description="tsgo"),
  tso STRING OPTIONS(description="tso"),
  so STRING OPTIONS(description="so")
) OPTIONS (format = "GOOGLE_SHEETS", uris = ["https://docs.google.com/spreadsheets/d/14Cz2Ovgwa_hoWg1KAbdOcN4JkvrAeoXoR-4NpsY1Ung"], sheet_range = "duksar_lok_dipo_2026!A:G", skip_leading_rows = 1, description = "Duksar 2026: lokomotif per dipo");

-- gapeka26_sarana_unit: Duksar 2026: nomor unit per sarana (penanda pembangkit & rangkaian KRD/KRL) (G26SAR!sarana_unit_2026)
CREATE OR REPLACE EXTERNAL TABLE `${PROJECT}.kai_raw.gapeka26_sarana_unit` (
  wilayah STRING OPTIONS(description="wilayah"),
  sarana STRING OPTIONS(description="sarana"),
  dipo_depo STRING OPTIONS(description="dipo_depo"),
  jenis STRING OPTIONS(description="jenis"),
  kelas_klasifikasi STRING OPTIONS(description="kelas_klasifikasi"),
  nomor_sarana STRING OPTIONS(description="nomor_sarana"),
  nomor_seri STRING OPTIONS(description="nomor_seri"),
  kereta_pembangkit STRING OPTIONS(description="kereta_pembangkit"),
  tergabung_di_krd STRING OPTIONS(description="tergabung_di_krd"),
  catatan STRING OPTIONS(description="catatan"),
  baris_teks_sumber STRING OPTIONS(description="baris_teks_sumber")
) OPTIONS (format = "GOOGLE_SHEETS", uris = ["https://docs.google.com/spreadsheets/d/1L4dh9ADls3xMfsJcoIVPIgo8e5bEga4Y5r5LX6IcFoE"], sheet_range = "sarana_unit_2026!A:K", skip_leading_rows = 1, description = "Duksar 2026: nomor unit per sarana (penanda pembangkit & rangkaian KRD/KRL)");

-- gapeka25_jadwal_dw: Daftar Waktu GAPEKA 2025 per KA × stasiun (G25DB!jadwal_dw_2025)
CREATE OR REPLACE EXTERNAL TABLE `${PROJECT}.kai_raw.gapeka25_jadwal_dw` (
  no_ka STRING OPTIONS(description="no_ka"),
  nama_ka STRING OPTIONS(description="nama_ka"),
  relasi STRING OPTIONS(description="relasi"),
  urut STRING OPTIONS(description="urut"),
  kode_stasiun STRING OPTIONS(description="kode_stasiun"),
  nama_stasiun STRING OPTIONS(description="nama_stasiun"),
  vmax_kmj STRING OPTIONS(description="vmax_kmj"),
  datang STRING OPTIONS(description="datang"),
  berangkat STRING OPTIONS(description="berangkat"),
  keterangan STRING OPTIONS(description="keterangan"),
  sumber_buku STRING OPTIONS(description="sumber_buku"),
  status_verifikasi STRING OPTIONS(description="status_verifikasi")
) OPTIONS (format = "GOOGLE_SHEETS", uris = ["https://docs.google.com/spreadsheets/d/1UM8d7CvzhrXl1CeB7J7XNTaw0mcPiWA8-4_2RdZnH-c"], sheet_range = "jadwal_dw_2025!A:L", skip_leading_rows = 1, description = "Daftar Waktu GAPEKA 2025 per KA × stasiun");

-- gapeka25_penomoran_ka: Buku Penomoran GAPEKA 2025 (G25DB!penomoran_ka_2025)
CREATE OR REPLACE EXTERNAL TABLE `${PROJECT}.kai_raw.gapeka25_penomoran_ka` (
  wilayah STRING OPTIONS(description="wilayah"),
  kelas_ka STRING OPTIONS(description="kelas_ka"),
  no_ka STRING OPTIONS(description="no_ka"),
  status STRING OPTIONS(description="status"),
  nama_ka STRING OPTIONS(description="nama_ka"),
  nama_identitas STRING OPTIONS(description="nama_identitas"),
  lintas STRING OPTIONS(description="lintas"),
  penyelenggara STRING OPTIONS(description="penyelenggara"),
  jarak_km STRING OPTIONS(description="jarak_km"),
  berangkat STRING OPTIONS(description="berangkat"),
  datang STRING OPTIONS(description="datang"),
  waktu_tempuh STRING OPTIONS(description="waktu_tempuh")
) OPTIONS (format = "GOOGLE_SHEETS", uris = ["https://docs.google.com/spreadsheets/d/1UM8d7CvzhrXl1CeB7J7XNTaw0mcPiWA8-4_2RdZnH-c"], sheet_range = "penomoran_ka_2025!A:L", skip_leading_rows = 1, description = "Buku Penomoran GAPEKA 2025");

-- gapeka25_jarak_lintas: Matriks Jarak Antar Stasiun 2025 (km kumulatif) (G25DB!jarak_lintas_2025)
CREATE OR REPLACE EXTERNAL TABLE `${PROJECT}.kai_raw.gapeka25_jarak_lintas` (
  wilayah STRING OPTIONS(description="wilayah"),
  lintas STRING OPTIONS(description="lintas"),
  urut STRING OPTIONS(description="urut"),
  kode_stasiun STRING OPTIONS(description="kode_stasiun"),
  km_kumulatif STRING OPTIONS(description="km_kumulatif"),
  sumber STRING OPTIONS(description="sumber")
) OPTIONS (format = "GOOGLE_SHEETS", uris = ["https://docs.google.com/spreadsheets/d/1UM8d7CvzhrXl1CeB7J7XNTaw0mcPiWA8-4_2RdZnH-c"], sheet_range = "jarak_lintas_2025!A:F", skip_leading_rows = 1, description = "Matriks Jarak Antar Stasiun 2025 (km kumulatif)");

-- gapeka25_lintas_lembar: Urutan stasiun + km per judul lintas Lembar GAPEKA 2025 (G25DB!lintas_lembar_2025)
CREATE OR REPLACE EXTERNAL TABLE `${PROJECT}.kai_raw.gapeka25_lintas_lembar` (
  lembar STRING OPTIONS(description="lembar"),
  wilayah STRING OPTIONS(description="wilayah"),
  judul_lintas STRING OPTIONS(description="judul_lintas"),
  urut STRING OPTIONS(description="urut"),
  kode_stasiun STRING OPTIONS(description="kode_stasiun"),
  nama_stasiun STRING OPTIONS(description="nama_stasiun"),
  km STRING OPTIONS(description="km"),
  berkas_lembar STRING OPTIONS(description="berkas_lembar")
) OPTIONS (format = "GOOGLE_SHEETS", uris = ["https://docs.google.com/spreadsheets/d/1UM8d7CvzhrXl1CeB7J7XNTaw0mcPiWA8-4_2RdZnH-c"], sheet_range = "lintas_lembar_2025!A:H", skip_leading_rows = 1, description = "Urutan stasiun + km per judul lintas Lembar GAPEKA 2025");
