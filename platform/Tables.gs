/** Tables.gs — DIBANGKITKAN tools/gen_schema.py dari db/schema/sumber_tabel.json. Jangan diedit manual. */
var PLATFORM_TABLES = [
 {
  "name": "gangguan_induk",
  "ss": "1HmlF2DL4KeHGVSO87aQAKu86dbfrnZohkCA7SsaL3OM",
  "sheet": "Gangguan_Induk",
  "range": "Gangguan_Induk!A:AI",
  "skip": 1,
  "desc": "SSOT kejadian gangguan & hambatan (dashboard)",
  "cols": [
   [
    "nomor_sumber",
    "Nomor sumber",
    "S"
   ],
   [
    "kode_laporan",
    "Kode laporan",
    "S"
   ],
   [
    "tanggal_kejadian",
    "Tanggal kejadian",
    "D"
   ],
   [
    "hari",
    "Hari",
    "S"
   ],
   [
    "bulan",
    "Bulan",
    "S"
   ],
   [
    "tahun",
    "Tahun",
    "N"
   ],
   [
    "kategori_gangguan",
    "Kategori gangguan",
    "S"
   ],
   [
    "subgangguan",
    "Subgangguan",
    "S"
   ],
   [
    "jenis_sarana",
    "Jenis sarana",
    "S"
   ],
   [
    "nomor_sarana",
    "Nomor sarana",
    "S"
   ],
   [
    "wilayah_kejadian",
    "Wilayah kejadian",
    "S"
   ],
   [
    "depo_induk",
    "Depo induk",
    "S"
   ],
   [
    "wilayah_depo",
    "Wilayah depo",
    "S"
   ],
   [
    "judul_gangguan",
    "Judul gangguan",
    "S"
   ],
   [
    "kode_jenis_gangguan",
    "Kode jenis gangguan",
    "S"
   ],
   [
    "jam_mulai",
    "Jam mulai",
    "S"
   ],
   [
    "stasiun",
    "Stasiun",
    "S"
   ],
   [
    "petak_jalan",
    "Petak jalan",
    "S"
   ],
   [
    "kilometer",
    "Kilometer",
    "S"
   ],
   [
    "nomor_sarana_penolong",
    "Nomor sarana penolong",
    "S"
   ],
   [
    "keterangan_kejadian",
    "Keterangan kejadian",
    "S"
   ],
   [
    "nomor_kereta_api_terkait",
    "Nomor kereta api terkait",
    "S"
   ],
   [
    "total_andil_kelka_menit",
    "Total Andil Kelka (menit)",
    "N"
   ],
   [
    "sumber_data",
    "Sumber data",
    "S"
   ],
   [
    "tab_asal",
    "Tab asal",
    "S"
   ],
   [
    "baris_asal",
    "Baris asal",
    "N"
   ],
   [
    "kunci_asal",
    "Kunci asal",
    "S"
   ],
   [
    "sha_256_sumber",
    "SHA-256 sumber",
    "S"
   ],
   [
    "status_kualitas",
    "Status kualitas",
    "S"
   ],
   [
    "alamat_sumber",
    "Alamat sumber",
    "S"
   ],
   [
    "penyebab_terlapor",
    "Penyebab terlapor",
    "S"
   ],
   [
    "tindak_lanjut_terlapor",
    "Tindak lanjut terlapor",
    "S"
   ],
   [
    "bukti_ekstraksi",
    "Bukti ekstraksi",
    "S"
   ],
   [
    "status_ekstraksi",
    "Status ekstraksi",
    "S"
   ],
   [
    "versi_aturan_ekstraksi",
    "Versi aturan ekstraksi",
    "S"
   ]
  ]
 },
 {
  "name": "hambatan_jasum",
  "ss": "1HmlF2DL4KeHGVSO87aQAKu86dbfrnZohkCA7SsaL3OM",
  "sheet": "Hambatan_Jasum",
  "range": "Hambatan_Jasum!A:U",
  "skip": 1,
  "desc": "Arsip impor REKAP HAMBATAN JASUM (hulu; dipetakan ke gangguan_induk)",
  "cols": [
   [
    "tanggal",
    "Tanggal",
    "D"
   ],
   [
    "lokasi",
    "Lokasi",
    "S"
   ],
   [
    "direktorat",
    "Direktorat",
    "S"
   ],
   [
    "jenis_hambatan",
    "Jenis hambatan",
    "S"
   ],
   [
    "kode",
    "Kode",
    "S"
   ],
   [
    "mulai",
    "Mulai",
    "S"
   ],
   [
    "akhir",
    "Akhir",
    "S"
   ],
   [
    "durasi_hambatan_menit",
    "Durasi hambatan (menit)",
    "N"
   ],
   [
    "keterangan",
    "Keterangan",
    "S"
   ],
   [
    "bulan_asli",
    "Bulan asli",
    "S"
   ],
   [
    "kelompok_kode",
    "Kelompok kode",
    "S"
   ],
   [
    "kolom_l_asli",
    "Kolom L asli",
    "S"
   ],
   [
    "sumber",
    "Sumber",
    "S"
   ],
   [
    "tab_sumber",
    "Tab sumber",
    "S"
   ],
   [
    "baris_sumber",
    "Baris sumber",
    "N"
   ],
   [
    "kunci_jejak",
    "Kunci jejak",
    "S"
   ],
   [
    "sha_256_baris_asli",
    "SHA-256 baris asli",
    "S"
   ],
   [
    "status_kualitas",
    "Status kualitas",
    "S"
   ],
   [
    "jenis_catatan",
    "Jenis catatan",
    "S"
   ],
   [
    "ka_terganggu_sumber",
    "KA terganggu (sumber)",
    "S"
   ],
   [
    "andil_per_ka_sumber_menit",
    "Andil per KA (sumber, menit)",
    "S"
   ]
  ]
 },
 {
  "name": "passenger",
  "ss": "1HmlF2DL4KeHGVSO87aQAKu86dbfrnZohkCA7SsaL3OM",
  "sheet": "Passenger",
  "range": "Passenger!A:Q",
  "skip": 1,
  "desc": "Pendapatan & volume penumpang per KA per bulan",
  "cols": [
   [
    "tanggal_bulan",
    "Tanggal (Bulan)",
    "S"
   ],
   [
    "pendapatan_rp",
    "Pendapatan (Rp)",
    "N"
   ],
   [
    "nomor_ka",
    "Nomor KA",
    "S"
   ],
   [
    "nama_ka",
    "Nama KA",
    "S"
   ],
   [
    "kelas_ka",
    "Kelas KA",
    "S"
   ],
   [
    "relasi_awal_akhir_naik",
    "Relasi (Awal-Akhir Naik)",
    "S"
   ],
   [
    "jumlah_penumpang",
    "Jumlah Penumpang",
    "N"
   ],
   [
    "realisasi_terisi_eko_pnp",
    "Realisasi Terisi EKO (Pnp)",
    "N"
   ],
   [
    "realisasi_terisi_eks_pnp",
    "Realisasi Terisi EKS (Pnp)",
    "N"
   ],
   [
    "realisasi_terisi_bis_pnp",
    "Realisasi Terisi BIS (Pnp)",
    "N"
   ],
   [
    "pct_porsi_eko",
    "% Porsi EKO",
    "S"
   ],
   [
    "pct_porsi_eks",
    "% Porsi EKS",
    "S"
   ],
   [
    "pct_porsi_bis",
    "% Porsi BIS",
    "S"
   ],
   [
    "jenis_ka",
    "Jenis KA",
    "S"
   ],
   [
    "pendapatan_eko_rp",
    "Pendapatan EKO (Rp)",
    "N"
   ],
   [
    "pendapatan_eks_rp",
    "Pendapatan EKS (Rp)",
    "N"
   ],
   [
    "pendapatan_bis_rp",
    "Pendapatan BIS (Rp)",
    "N"
   ]
  ]
 },
 {
  "name": "freight",
  "ss": "1HmlF2DL4KeHGVSO87aQAKu86dbfrnZohkCA7SsaL3OM",
  "sheet": "Freight",
  "range": "Freight!A:I",
  "skip": 1,
  "desc": "Pendapatan & volume barang per Nama KA/komoditas per bulan",
  "cols": [
   [
    "tanggal_bulan",
    "Tanggal (Bulan)",
    "S"
   ],
   [
    "pendapatan_rp",
    "Pendapatan (Rp)",
    "N"
   ],
   [
    "nama_ka",
    "Nama KA",
    "S"
   ],
   [
    "komoditas",
    "Komoditas",
    "S"
   ],
   [
    "komoditas_detail",
    "Komoditas Detail",
    "S"
   ],
   [
    "nama_mitra",
    "Nama Mitra",
    "S"
   ],
   [
    "volume_real_ton",
    "Volume Real (Ton)",
    "N"
   ],
   [
    "relasi",
    "Relasi",
    "S"
   ],
   [
    "tarif_rata_rata_rp_ton",
    "Tarif Rata-rata (Rp/Ton)",
    "N"
   ]
  ]
 },
 {
  "name": "thi",
  "ss": "1HmlF2DL4KeHGVSO87aQAKu86dbfrnZohkCA7SsaL3OM",
  "sheet": "THI",
  "range": "THI!A:AY",
  "skip": 1,
  "desc": "Track Health Index per wilayah/resor/petak per bulan",
  "cols": [
   [
    "wilayah",
    "Wilayah",
    "S"
   ],
   [
    "periode",
    "Periode",
    "S"
   ],
   [
    "bulan",
    "Bulan",
    "S"
   ],
   [
    "tingkat",
    "Tingkat",
    "S"
   ],
   [
    "unit",
    "Unit",
    "S"
   ],
   [
    "healthy_index",
    "Healthy Index",
    "N"
   ],
   [
    "grade_healthy_index",
    "Grade Healthy Index",
    "S"
   ],
   [
    "condition_index",
    "Condition Index",
    "N"
   ],
   [
    "grade_condition",
    "Grade Condition",
    "S"
   ],
   [
    "material",
    "Material",
    "N"
   ],
   [
    "konstruksi",
    "Konstruksi",
    "N"
   ],
   [
    "geometri",
    "Geometri",
    "N"
   ],
   [
    "material_rel_dan_sambungan_las_30pct",
    "Material - Rel dan Sambungan Las (30%)",
    "S"
   ],
   [
    "material_sambungan_pelat_20pct",
    "Material - Sambungan Pelat (20%)",
    "S"
   ],
   [
    "material_penambat_15pct",
    "Material - Penambat (15%)",
    "S"
   ],
   [
    "material_wesel_15pct",
    "Material - Wesel (15%)",
    "S"
   ],
   [
    "material_balas_plinth_10pct",
    "Material - Balas/Plinth (10%)",
    "S"
   ],
   [
    "material_bantalan_10pct",
    "Material - Bantalan (10%)",
    "S"
   ],
   [
    "konstruksi_badan_jalan_dan_lereng_50pct",
    "Konstruksi - Badan Jalan dan Lereng (50%)",
    "S"
   ],
   [
    "konstruksi_drainase_30pct",
    "Konstruksi - Drainase (30%)",
    "S"
   ],
   [
    "konstruksi_lingkungan_20pct",
    "Konstruksi - Lingkungan (20%)",
    "S"
   ],
   [
    "maintenance_index",
    "Maintenance Index",
    "N"
   ],
   [
    "grade_maintenance",
    "Grade Maintenance",
    "S"
   ],
   [
    "inspeksi_terjadwal",
    "Inspeksi Terjadwal",
    "S"
   ],
   [
    "ppj",
    "PPJ",
    "S"
   ],
   [
    "mir",
    "MIR",
    "S"
   ],
   [
    "perawatan_korektif_wmr",
    "Perawatan Korektif (WMR)",
    "S"
   ],
   [
    "ppj_program",
    "PPJ Program",
    "S"
   ],
   [
    "ppj_realisasi",
    "PPJ Realisasi",
    "S"
   ],
   [
    "mir_program",
    "MIR Program",
    "S"
   ],
   [
    "mir_realisasi",
    "MIR Realisasi",
    "S"
   ],
   [
    "wmr_program",
    "WMR Program",
    "S"
   ],
   [
    "wmr_realisasi",
    "WMR Realisasi",
    "S"
   ],
   [
    "panjang_petak_jalan_msp",
    "Panjang Petak Jalan (mSp)",
    "N"
   ],
   [
    "jumlah_hektometer",
    "Jumlah Hektometer",
    "S"
   ],
   [
    "hm_tanpa_kasus_lengkap_material",
    "Hm Tanpa Kasus Lengkap - Material",
    "S"
   ],
   [
    "hm_tanpa_kasus_lengkap_konstruksi",
    "Hm Tanpa Kasus Lengkap - Konstruksi",
    "S"
   ],
   [
    "catatan",
    "Catatan",
    "S"
   ],
   [
    "berkas_sumber",
    "Berkas sumber",
    "S"
   ],
   [
    "tab_sumber",
    "Tab sumber",
    "S"
   ],
   [
    "baris_sumber",
    "Baris sumber",
    "S"
   ],
   [
    "kunci_data",
    "Kunci data",
    "S"
   ],
   [
    "sha_256_nilai_sumber",
    "SHA-256 nilai sumber",
    "S"
   ],
   [
    "kode_upt_jr",
    "Kode UPT JR",
    "S"
   ],
   [
    "unit_resor_referensi_thi",
    "Unit resor (referensi THI)",
    "S"
   ],
   [
    "qc_peta",
    "QC (peta)",
    "S"
   ],
   [
    "kode_jalur_jenis_sumber",
    "Kode jalur/jenis (sumber)",
    "S"
   ],
   [
    "id_petak_thi",
    "ID petak THI",
    "S"
   ],
   [
    "dasar_pemetaan",
    "Dasar pemetaan",
    "S"
   ],
   [
    "halaman_peta_wilayah_1_pdf",
    "Halaman PETA WILAYAH(1).pdf",
    "S"
   ],
   [
    "pembagi_indeks_sumber",
    "Pembagi indeks sumber",
    "S"
   ]
  ]
 },
 {
  "name": "rhi",
  "ss": "1HmlF2DL4KeHGVSO87aQAKu86dbfrnZohkCA7SsaL3OM",
  "sheet": "RHI",
  "range": "RHI!A:AM",
  "skip": 1,
  "desc": "Rolling stock Health Index harian per sarana",
  "cols": [
   [
    "nomor_sarana",
    "nomor_sarana",
    "S"
   ],
   [
    "tipe_sarana",
    "tipe_sarana",
    "S"
   ],
   [
    "tgl_data",
    "tgl_data",
    "D"
   ],
   [
    "perawatan_terakhir",
    "perawatan_terakhir",
    "S"
   ],
   [
    "tgl_perawatan",
    "tgl_perawatan",
    "S"
   ],
   [
    "reliability_index",
    "reliability_index",
    "S"
   ],
   [
    "maintainability_index",
    "maintainability_index",
    "S"
   ],
   [
    "availability_index",
    "availability_index",
    "S"
   ],
   [
    "rams_index",
    "rams_index",
    "N"
   ],
   [
    "total_request_rows",
    "total_request_rows",
    "S"
   ],
   [
    "total_terpenuhi",
    "total_terpenuhi",
    "S"
   ],
   [
    "list_maintenance_realisasi",
    "list_maintenance_realisasi",
    "S"
   ],
   [
    "list_maintenance_seharusnya",
    "list_maintenance_seharusnya",
    "S"
   ],
   [
    "spare_management_score",
    "spare_management_score",
    "S"
   ],
   [
    "maintenance_completion_score",
    "maintenance_completion_score",
    "S"
   ],
   [
    "maintenance_index",
    "maintenance_index",
    "N"
   ],
   [
    "umur_kereta",
    "umur_kereta",
    "S"
   ],
   [
    "age_index",
    "age_index",
    "S"
   ],
   [
    "penalti_open",
    "penalti_open",
    "S"
   ],
   [
    "penalti_lengkap",
    "penalti_lengkap",
    "S"
   ],
   [
    "real_condition_index",
    "real_condition_index",
    "S"
   ],
   [
    "onsite_inspection_index",
    "onsite_inspection_index",
    "S"
   ],
   [
    "condition_index",
    "condition_index",
    "N"
   ],
   [
    "healthy_index",
    "healthy_index",
    "N"
   ],
   [
    "healthy_status",
    "healthy_status",
    "S"
   ],
   [
    "berkas_sumber",
    "Berkas sumber",
    "S"
   ],
   [
    "tab_sumber",
    "Tab sumber",
    "S"
   ],
   [
    "baris_sumber",
    "Baris sumber",
    "S"
   ],
   [
    "kunci_sarana_tanggal",
    "Kunci sarana-tanggal",
    "S"
   ],
   [
    "sha_256_nilai_sumber",
    "SHA-256 nilai sumber",
    "S"
   ],
   [
    "catatan_pemeriksaan",
    "Catatan pemeriksaan",
    "S"
   ],
   [
    "healthy_index_pulih",
    "healthy_index (pulih)",
    "N"
   ],
   [
    "condition_index_pulih",
    "condition_index (pulih)",
    "S"
   ],
   [
    "onsite_inspection_index_pulih",
    "onsite_inspection_index (pulih)",
    "S"
   ],
   [
    "maintenance_index_pulih",
    "maintenance_index (pulih)",
    "S"
   ],
   [
    "umur_kereta_pulih_tahun",
    "umur_kereta (pulih; tahun)",
    "S"
   ],
   [
    "age_index_pulih",
    "age_index (pulih)",
    "S"
   ],
   [
    "pemeriksaan_pemulihan",
    "Pemeriksaan pemulihan",
    "S"
   ],
   [
    "catatan_verifikasi_rumus",
    "Catatan verifikasi rumus",
    "S"
   ]
  ]
 },
 {
  "name": "wkp",
  "ss": "1HmlF2DL4KeHGVSO87aQAKu86dbfrnZohkCA7SsaL3OM",
  "sheet": "WKP",
  "range": "WKP!A:AB",
  "skip": 1,
  "desc": "Window time / WKP (program & realisasi) per wilayah",
  "cols": [
   [
    "nomor_sumber",
    "Nomor sumber",
    "S"
   ],
   [
    "tanggal",
    "Tanggal",
    "D"
   ],
   [
    "wilayah",
    "Wilayah",
    "S"
   ],
   [
    "jenis_kegiatan",
    "Jenis kegiatan",
    "S"
   ],
   [
    "program_mulai",
    "Program mulai",
    "S"
   ],
   [
    "program_akhir",
    "Program akhir",
    "S"
   ],
   [
    "program_durasi_hari_excel",
    "Program durasi (hari Excel)",
    "S"
   ],
   [
    "realisasi_mulai",
    "Realisasi mulai",
    "S"
   ],
   [
    "realisasi_akhir",
    "Realisasi akhir",
    "S"
   ],
   [
    "realisasi_durasi_hari_excel",
    "Realisasi durasi (hari Excel)",
    "S"
   ],
   [
    "keterangan",
    "Keterangan",
    "S"
   ],
   [
    "ka_terimbas_kolom_l_sumber",
    "KA terimbas - kolom L sumber",
    "S"
   ],
   [
    "ka_terimbas_kolom_m_sumber",
    "KA terimbas - kolom M sumber",
    "S"
   ],
   [
    "rumus_waktu_nilai_sumber",
    "Rumus waktu - nilai sumber",
    "S"
   ],
   [
    "sela_perka_nilai_sumber",
    "Sela perka - nilai sumber",
    "S"
   ],
   [
    "durasi_dalam_menit_nilai_sumber",
    "Durasi dalam menit - nilai sumber",
    "N"
   ],
   [
    "berkas_sumber",
    "Berkas sumber",
    "S"
   ],
   [
    "tab_sumber",
    "Tab sumber",
    "S"
   ],
   [
    "baris_sumber",
    "Baris sumber",
    "N"
   ],
   [
    "sha_256_nilai_sumber",
    "SHA-256 nilai sumber",
    "S"
   ],
   [
    "tanggal_terverifikasi",
    "Tanggal terverifikasi",
    "D"
   ],
   [
    "wilayah_terverifikasi",
    "Wilayah terverifikasi",
    "S"
   ],
   [
    "catatan_penelusuran_tanggal",
    "Catatan penelusuran tanggal",
    "S"
   ],
   [
    "baris_tab",
    "Baris tab",
    "S"
   ],
   [
    "tanggal_terkoreksi",
    "Tanggal terkoreksi",
    "D"
   ],
   [
    "wilayah_terkoreksi",
    "Wilayah terkoreksi",
    "S"
   ],
   [
    "kode_aturan",
    "Kode aturan",
    "S"
   ],
   [
    "kode_aturan_penelusuran",
    "Kode aturan penelusuran",
    "S"
   ]
  ]
 },
 {
  "name": "gapeka25_list_ka",
  "ss": "15yHI4aO3abw5D-Hhfmrhf0lk3hGQdWF99DRmv7aOoKI",
  "sheet": "LIST KA",
  "range": "'LIST KA'!A:AV",
  "skip": 3,
  "desc": "LIST KA GAPEKA 2025 (perjalanan, relasi, jadwal ringkas, susunan)",
  "cols": [
   [
    "no_ka",
    "No KA",
    "S"
   ],
   [
    "jenis_ka",
    "Jenis KA",
    "S"
   ],
   [
    "nama_ka",
    "Nama KA",
    "S"
   ],
   [
    "nama_identitas_ka",
    "Nama Identitas KA",
    "S"
   ],
   [
    "lintas",
    "Lintas",
    "S"
   ],
   [
    "jarak",
    "Jarak",
    "N"
   ],
   [
    "jarak_salinan",
    "Jarak (salinan)",
    "S"
   ],
   [
    "jam_ber",
    "Jam Ber",
    "S"
   ],
   [
    "jam_dat",
    "Jam Dat",
    "S"
   ],
   [
    "wp",
    "WP",
    "S"
   ],
   [
    "kol_k",
    "kol_k",
    "S"
   ],
   [
    "wilayah",
    "Wilayah",
    "S"
   ],
   [
    "pnp_brg",
    "Pnp/brg",
    "S"
   ],
   [
    "kelas_ka",
    "Kelas KA",
    "S"
   ],
   [
    "kol_o",
    "kol_o",
    "S"
   ],
   [
    "jenis_pelayanan",
    "Jenis Pelayanan",
    "S"
   ],
   [
    "klasifikasi_ka",
    "Klasifikasi KA",
    "S"
   ],
   [
    "kelas_ka_2",
    "Kelas KA 2",
    "S"
   ],
   [
    "wilayah_2",
    "Wilayah 2",
    "S"
   ],
   [
    "kol_t",
    "kol_t",
    "S"
   ],
   [
    "komersial_pso_perintis",
    "Komersial/PSO/Perintis",
    "S"
   ],
   [
    "kol_v",
    "kol_v",
    "S"
   ],
   [
    "klasifikasi_ka_2",
    "Klasifikasi KA 2",
    "S"
   ],
   [
    "kol_x",
    "kol_x",
    "S"
   ],
   [
    "ber",
    "ber",
    "S"
   ],
   [
    "kol_z",
    "kol_z",
    "S"
   ],
   [
    "kol_aa",
    "kol_aa",
    "S"
   ],
   [
    "kol_ab",
    "kol_ab",
    "S"
   ],
   [
    "kol_ac",
    "kol_ac",
    "S"
   ],
   [
    "kol_ad",
    "kol_ad",
    "S"
   ],
   [
    "dat",
    "dat",
    "S"
   ],
   [
    "kol_af",
    "kol_af",
    "S"
   ],
   [
    "ber_2",
    "Ber",
    "S"
   ],
   [
    "st_ber",
    "St. Ber",
    "S"
   ],
   [
    "daop_divre_ber",
    "Daop/Divre ber",
    "S"
   ],
   [
    "dat_2",
    "Dat",
    "S"
   ],
   [
    "st_dat",
    "St. Dat",
    "S"
   ],
   [
    "daop_divre_dat",
    "Daop/Divre dat",
    "S"
   ],
   [
    "kol_am",
    "kol_am",
    "S"
   ],
   [
    "sf",
    "SF",
    "S"
   ],
   [
    "kap_td",
    "Kap TD",
    "N"
   ],
   [
    "kol_ap",
    "kol_ap",
    "S"
   ],
   [
    "detail_ka",
    "Detail KA",
    "S"
   ],
   [
    "reg_tamb",
    "Reg/tamb",
    "S"
   ],
   [
    "kol_as",
    "kol_as",
    "S"
   ],
   [
    "jenis_layanan_djka",
    "Jenis Layanan (DJKA)",
    "S"
   ],
   [
    "kol_au",
    "kol_au",
    "S"
   ],
   [
    "kol_av",
    "kol_av",
    "S"
   ]
  ]
 },
 {
  "name": "gapeka25_stasiun",
  "ss": "15yHI4aO3abw5D-Hhfmrhf0lk3hGQdWF99DRmv7aOoKI",
  "sheet": "LIST STASIUN",
  "range": "'LIST STASIUN'!A:E",
  "skip": 1,
  "desc": "Daftar stasiun GAPEKA 2025",
  "cols": [
   [
    "id_trainplan",
    "ID Trainplan",
    "S"
   ],
   [
    "singkatan_stasiun",
    "Singkatan Stasiun",
    "S"
   ],
   [
    "nama_stasiun",
    "Nama Stasiun",
    "S"
   ],
   [
    "wilayah_operasi",
    "Wilayah Operasi",
    "S"
   ],
   [
    "status",
    "Status",
    "S"
   ]
  ]
 },
 {
  "name": "gapeka25_petak",
  "ss": "15yHI4aO3abw5D-Hhfmrhf0lk3hGQdWF99DRmv7aOoKI",
  "sheet": "LIST PETAK JALAN",
  "range": "'LIST PETAK JALAN'!A:G",
  "skip": 1,
  "desc": "Daftar petak jalan GAPEKA 2025",
  "cols": [
   [
    "daop_divre",
    "Daop/Divre",
    "S"
   ],
   [
    "lintas",
    "Lintas",
    "S"
   ],
   [
    "stasiun_a",
    "Stasiun A",
    "S"
   ],
   [
    "stasiun_b",
    "Stasiun B",
    "S"
   ],
   [
    "petak_jalan",
    "Petak Jalan",
    "S"
   ],
   [
    "jarak",
    "Jarak",
    "N"
   ],
   [
    "ganda_tunggal",
    "Ganda/Tunggal",
    "S"
   ]
  ]
 },
 {
  "name": "ref_jadwal_dw_2025",
  "ss": "1nQuug9iDE6AeK8ZMRyk1dBbK849GDvLiP8l88kPQ3I0",
  "sheet": "jadwal_dw_2025",
  "range": "jadwal_dw_2025!A:K",
  "skip": 1,
  "desc": "Buku Daftar Waktu GAPEKA 2025 (diekstrak per baris; seed 11_SeedJadwal.gs)",
  "cols": [
   [
    "no_ka",
    "no_ka",
    "S"
   ],
   [
    "nama_ka",
    "nama_ka",
    "S"
   ],
   [
    "relasi",
    "relasi",
    "S"
   ],
   [
    "urut",
    "urut",
    "N"
   ],
   [
    "kode_stasiun",
    "kode_stasiun",
    "S"
   ],
   [
    "nama_stasiun",
    "nama_stasiun",
    "S"
   ],
   [
    "datang",
    "datang",
    "S"
   ],
   [
    "berangkat",
    "berangkat",
    "S"
   ],
   [
    "keterangan",
    "keterangan",
    "S"
   ],
   [
    "catatan",
    "catatan",
    "S"
   ],
   [
    "sumber_buku",
    "sumber_buku",
    "S"
   ]
  ]
 },
 {
  "name": "ref_ptdo_2025_stasiun_tutup",
  "ss": "1nQuug9iDE6AeK8ZMRyk1dBbK849GDvLiP8l88kPQ3I0",
  "sheet": "ptdo_2025_stasiun_tutup",
  "range": "ptdo_2025_stasiun_tutup!A:D",
  "skip": 1,
  "desc": "PTDO GAPEKA 2025 Bab IV (seed 11_SeedJadwal.gs)",
  "cols": [
   [
    "kode_stasiun",
    "kode_stasiun",
    "S"
   ],
   [
    "jenis",
    "jenis",
    "S"
   ],
   [
    "mulai",
    "mulai",
    "S"
   ],
   [
    "akhir",
    "akhir",
    "S"
   ]
  ]
 },
 {
  "name": "ref_depo_ka_2025",
  "ss": "1nQuug9iDE6AeK8ZMRyk1dBbK849GDvLiP8l88kPQ3I0",
  "sheet": "depo_ka_2025",
  "range": "depo_ka_2025!A:E",
  "skip": 1,
  "desc": "Duksar/PTDO GAPEKA 2025 (seed SEED_DEPO_KA)",
  "cols": [
   [
    "depo",
    "depo",
    "S"
   ],
   [
    "kode",
    "kode",
    "S"
   ],
   [
    "jenis",
    "jenis",
    "S"
   ],
   [
    "daftar_ka",
    "daftar_ka",
    "S"
   ],
   [
    "kol_5",
    "kol_5",
    "S"
   ]
  ]
 },
 {
  "name": "ref_jpl",
  "ss": "1nQuug9iDE6AeK8ZMRyk1dBbK849GDvLiP8l88kPQ3I0",
  "sheet": "jpl",
  "range": "jpl!A:L",
  "skip": 1,
  "desc": "Daftar 1.404 titik peningkatan keselamatan perlintasan sebidang (seed SEED_JPL)",
  "cols": [
   [
    "no",
    "no",
    "S"
   ],
   [
    "petak",
    "petak",
    "S"
   ],
   [
    "no_jpl",
    "no_jpl",
    "S"
   ],
   [
    "km",
    "km",
    "S"
   ],
   [
    "provinsi",
    "provinsi",
    "S"
   ],
   [
    "kabupaten_kota",
    "kabupaten_kota",
    "S"
   ],
   [
    "status_jalan",
    "status_jalan",
    "S"
   ],
   [
    "kolom_8",
    "kolom_8",
    "S"
   ],
   [
    "kolom_9",
    "kolom_9",
    "S"
   ],
   [
    "kolom_10",
    "kolom_10",
    "S"
   ],
   [
    "wilayah",
    "wilayah",
    "S"
   ],
   [
    "kolom_12",
    "kolom_12",
    "S"
   ]
  ]
 },
 {
  "name": "ref_resor_meta",
  "ss": "1nQuug9iDE6AeK8ZMRyk1dBbK849GDvLiP8l88kPQ3I0",
  "sheet": "resor_meta",
  "range": "resor_meta!A:G",
  "skip": 1,
  "desc": "PETA_WILAYAH 2026 (transkripsi 10 Nov 2026) (PETA_WILAYAH.pdf)",
  "cols": [
   [
    "kode_resor",
    "kode_resor",
    "S"
   ],
   [
    "wilayah",
    "wilayah",
    "S"
   ],
   [
    "nama",
    "nama",
    "S"
   ],
   [
    "jumlah",
    "jumlah",
    "S"
   ],
   [
    "km_awal",
    "km_awal",
    "S"
   ],
   [
    "km_akhir",
    "km_akhir",
    "S"
   ],
   [
    "cakupan",
    "cakupan",
    "S"
   ]
  ]
 },
 {
  "name": "ref_resor_stasiun",
  "ss": "1nQuug9iDE6AeK8ZMRyk1dBbK849GDvLiP8l88kPQ3I0",
  "sheet": "resor_stasiun",
  "range": "resor_stasiun!A:B",
  "skip": 1,
  "desc": "PETA_WILAYAH 2026 (transkripsi 10 Nov 2026)",
  "cols": [
   [
    "kode_stasiun",
    "kode_stasiun",
    "S"
   ],
   [
    "kode_resor",
    "kode_resor",
    "S"
   ]
  ]
 },
 {
  "name": "ref_resor_petak",
  "ss": "1nQuug9iDE6AeK8ZMRyk1dBbK849GDvLiP8l88kPQ3I0",
  "sheet": "resor_petak",
  "range": "resor_petak!A:C",
  "skip": 1,
  "desc": "PETA_WILAYAH 2026 (transkripsi 10 Nov 2026)",
  "cols": [
   [
    "petak",
    "petak",
    "S"
   ],
   [
    "kode_resor",
    "kode_resor",
    "S"
   ],
   [
    "catatan",
    "catatan",
    "S"
   ]
  ]
 },
 {
  "name": "ref_stasiun_koordinat",
  "ss": "1nQuug9iDE6AeK8ZMRyk1dBbK849GDvLiP8l88kPQ3I0",
  "sheet": "stasiun_koordinat",
  "range": "stasiun_koordinat!A:E",
  "skip": 1,
  "desc": "OSM via enwo02/train-tracker (rail tiles) — diunduh 13 Nov 2026 · © kontributor OpenStreetMap, ODbL 1.0",
  "cols": [
   [
    "kode_stasiun",
    "kode_stasiun",
    "S"
   ],
   [
    "lat",
    "lat",
    "N"
   ],
   [
    "lon",
    "lon",
    "N"
   ],
   [
    "elevasi_m",
    "elevasi_m",
    "N"
   ],
   [
    "sumber_koordinat",
    "sumber_koordinat",
    "S"
   ]
  ]
 },
 {
  "name": "ref_petak_osm",
  "ss": "1nQuug9iDE6AeK8ZMRyk1dBbK849GDvLiP8l88kPQ3I0",
  "sheet": "petak_osm",
  "range": "petak_osm!A:K",
  "skip": 1,
  "desc": "© kontributor OpenStreetMap, ODbL 1.0",
  "cols": [
   [
    "petak",
    "petak",
    "S"
   ],
   [
    "km_osm",
    "km_osm",
    "N"
   ],
   [
    "cocok_jarak_25pct",
    "cocok_jarak_25pct",
    "S"
   ],
   [
    "jumlah_jembatan",
    "jumlah_jembatan",
    "N"
   ],
   [
    "panjang_jembatan_m",
    "panjang_jembatan_m",
    "N"
   ],
   [
    "jumlah_terowongan",
    "jumlah_terowongan",
    "N"
   ],
   [
    "panjang_terowongan_m",
    "panjang_terowongan_m",
    "N"
   ],
   [
    "pct_elektrifikasi",
    "pct_elektrifikasi",
    "N"
   ],
   [
    "vmax_osm_kmj",
    "vmax_osm_kmj",
    "N"
   ],
   [
    "nama_lintas_osm",
    "nama_lintas_osm",
    "S"
   ],
   [
    "wikipedia",
    "wikipedia",
    "S"
   ]
  ]
 },
 {
  "name": "ref_duksar_unit_siap_guna",
  "ss": "1nQuug9iDE6AeK8ZMRyk1dBbK849GDvLiP8l88kPQ3I0",
  "sheet": "duksar_unit_siap_guna",
  "range": "duksar_unit_siap_guna!A:C",
  "skip": 1,
  "desc": "Buku Dukungan Sarana (Duksar) GAPEKA 2025: Jawa (2 Jan 25), Sumbar (2 Jan 25), Sumsel (3 Jan 25), Sumut (2 Jan 25)",
  "cols": [
   [
    "jenis",
    "jenis",
    "S"
   ],
   [
    "depo_induk",
    "depo_induk",
    "S"
   ],
   [
    "nomor_sarana",
    "nomor_sarana",
    "S"
   ]
  ]
 },
 {
  "name": "ref_duksar_lok_depo",
  "ss": "1nQuug9iDE6AeK8ZMRyk1dBbK849GDvLiP8l88kPQ3I0",
  "sheet": "duksar_lok_depo",
  "range": "duksar_lok_depo!A:I",
  "skip": 1,
  "desc": "Buku Dukungan Sarana (Duksar) GAPEKA 2025: Jawa (2 Jan 25), Sumbar (2 Jan 25), Sumsel (3 Jan 25), Sumut (2 Jan 25)",
  "cols": [
   [
    "depo",
    "depo",
    "S"
   ],
   [
    "book",
    "book",
    "N"
   ],
   [
    "siap_operasi",
    "siap_operasi",
    "N"
   ],
   [
    "perbaikan",
    "perbaikan",
    "N"
   ],
   [
    "siap_guna",
    "siap_guna",
    "N"
   ],
   [
    "km_per_hari",
    "km_per_hari",
    "N"
   ],
   [
    "jam_efektif",
    "jam_efektif",
    "N"
   ],
   [
    "jam_operasi",
    "jam_operasi",
    "N"
   ],
   [
    "daftar_ka",
    "daftar_ka",
    "S"
   ]
  ]
 },
 {
  "name": "ref_rujukan",
  "ss": "1nQuug9iDE6AeK8ZMRyk1dBbK849GDvLiP8l88kPQ3I0",
  "sheet": "rujukan",
  "range": "rujukan!A:K",
  "skip": 1,
  "desc": "Rujukan media & ilmiah terverifikasi (seed 12_SeedRujukan.gs)",
  "cols": [
   [
    "id",
    "ID",
    "S"
   ],
   [
    "jenis",
    "Jenis",
    "S"
   ],
   [
    "sitasi_apa",
    "Sitasi APA",
    "S"
   ],
   [
    "url",
    "URL",
    "S"
   ],
   [
    "tanggal_terbit",
    "Tanggal terbit",
    "S"
   ],
   [
    "wilayah",
    "Wilayah",
    "S"
   ],
   [
    "topik",
    "Topik",
    "S"
   ],
   [
    "fakta_kunci",
    "Fakta kunci",
    "S"
   ],
   [
    "implikasi_untuk_operasi",
    "Implikasi untuk operasi",
    "S"
   ],
   [
    "status_verifikasi",
    "Status verifikasi",
    "S"
   ],
   [
    "aktif",
    "Aktif",
    "S"
   ]
  ]
 },
 {
  "name": "ref_koreksi_data",
  "ss": "1nQuug9iDE6AeK8ZMRyk1dBbK849GDvLiP8l88kPQ3I0",
  "sheet": "koreksi_data",
  "range": "koreksi_data!A:I",
  "skip": 1,
  "desc": "Log koreksi data berbukti (seed 12_SeedRujukan.gs)",
  "cols": [
   [
    "tanda_isi",
    "Tanda isi",
    "S"
   ],
   [
    "kunci_asal_saat_dibuat",
    "Kunci asal (saat dibuat)",
    "S"
   ],
   [
    "jenis_koreksi",
    "Jenis koreksi",
    "S"
   ],
   [
    "nilai_baru",
    "Nilai baru",
    "S"
   ],
   [
    "nilai_asli",
    "Nilai asli",
    "S"
   ],
   [
    "bukti",
    "Bukti",
    "S"
   ],
   [
    "diusulkan_oleh",
    "Diusulkan oleh",
    "S"
   ],
   [
    "tanggal",
    "Tanggal",
    "S"
   ],
   [
    "aktif",
    "Aktif",
    "S"
   ]
  ]
 },
 {
  "name": "gapeka26_jadwal_dw",
  "ss": "14Cz2Ovgwa_hoWg1KAbdOcN4JkvrAeoXoR-4NpsY1Ung",
  "sheet": "jadwal_dw_2026",
  "range": "jadwal_dw_2026!A:L",
  "skip": 1,
  "desc": "Daftar Waktu GAPEKA 2026 per KA × stasiun (rencana; dasar pembanding realisasi)",
  "cols": [
   [
    "no_ka",
    "no_ka",
    "S"
   ],
   [
    "nama_ka",
    "nama_ka",
    "S"
   ],
   [
    "relasi",
    "relasi",
    "S"
   ],
   [
    "urut",
    "urut",
    "N"
   ],
   [
    "kode_stasiun",
    "kode_stasiun",
    "S"
   ],
   [
    "nama_stasiun",
    "nama_stasiun",
    "S"
   ],
   [
    "vmax_kmj",
    "vmax_kmj",
    "N"
   ],
   [
    "datang",
    "datang",
    "S"
   ],
   [
    "berangkat",
    "berangkat",
    "S"
   ],
   [
    "keterangan",
    "keterangan",
    "S"
   ],
   [
    "sumber_buku",
    "sumber_buku",
    "S"
   ],
   [
    "status_verifikasi",
    "status_verifikasi",
    "S"
   ]
  ]
 },
 {
  "name": "gapeka26_penomoran_ka",
  "ss": "14Cz2Ovgwa_hoWg1KAbdOcN4JkvrAeoXoR-4NpsY1Ung",
  "sheet": "penomoran_ka_2026",
  "range": "penomoran_ka_2026!A:L",
  "skip": 1,
  "desc": "Buku Penomoran GAPEKA 2026: nomor, kelas, relasi, jam awal/akhir",
  "cols": [
   [
    "wilayah",
    "wilayah",
    "S"
   ],
   [
    "kelas_ka",
    "kelas_ka",
    "S"
   ],
   [
    "no_ka",
    "no_ka",
    "S"
   ],
   [
    "status",
    "status",
    "S"
   ],
   [
    "nama_ka",
    "nama_ka",
    "S"
   ],
   [
    "nama_identitas",
    "nama_identitas",
    "S"
   ],
   [
    "lintas",
    "lintas",
    "S"
   ],
   [
    "penyelenggara",
    "penyelenggara",
    "S"
   ],
   [
    "jarak_km",
    "jarak_km",
    "N"
   ],
   [
    "berangkat",
    "berangkat",
    "S"
   ],
   [
    "datang",
    "datang",
    "S"
   ],
   [
    "waktu_tempuh",
    "waktu_tempuh",
    "S"
   ]
  ]
 },
 {
  "name": "gapeka26_jarak_lintas",
  "ss": "14Cz2Ovgwa_hoWg1KAbdOcN4JkvrAeoXoR-4NpsY1Ung",
  "sheet": "jarak_lintas_2026",
  "range": "jarak_lintas_2026!A:F",
  "skip": 1,
  "desc": "Matriks Jarak Antar Stasiun 2026 (km kumulatif)",
  "cols": [
   [
    "wilayah",
    "wilayah",
    "S"
   ],
   [
    "lintas",
    "lintas",
    "S"
   ],
   [
    "urut",
    "urut",
    "N"
   ],
   [
    "kode_stasiun",
    "kode_stasiun",
    "S"
   ],
   [
    "km_kumulatif",
    "km_kumulatif",
    "N"
   ],
   [
    "sumber",
    "sumber",
    "S"
   ]
  ]
 },
 {
  "name": "gapeka26_lintas_lembar",
  "ss": "14Cz2Ovgwa_hoWg1KAbdOcN4JkvrAeoXoR-4NpsY1Ung",
  "sheet": "lintas_lembar_2026",
  "range": "lintas_lembar_2026!A:H",
  "skip": 1,
  "desc": "Urutan stasiun + km per judul lintas Lembar GAPEKA 2026",
  "cols": [
   [
    "lembar",
    "lembar",
    "S"
   ],
   [
    "wilayah",
    "wilayah",
    "S"
   ],
   [
    "judul_lintas",
    "judul_lintas",
    "S"
   ],
   [
    "urut",
    "urut",
    "N"
   ],
   [
    "kode_stasiun",
    "kode_stasiun",
    "S"
   ],
   [
    "nama_stasiun",
    "nama_stasiun",
    "S"
   ],
   [
    "km",
    "km",
    "N"
   ],
   [
    "berkas_lembar",
    "berkas_lembar",
    "S"
   ]
  ]
 },
 {
  "name": "gapeka26_duksar_rekap",
  "ss": "14Cz2Ovgwa_hoWg1KAbdOcN4JkvrAeoXoR-4NpsY1Ung",
  "sheet": "duksar_rekap_2026",
  "range": "duksar_rekap_2026!A:F",
  "skip": 1,
  "desc": "Duksar 2026: rekap siap guna/operasi per jenis sarana",
  "cols": [
   [
    "wilayah",
    "wilayah",
    "S"
   ],
   [
    "jenis_sarana",
    "jenis_sarana",
    "S"
   ],
   [
    "siap_guna",
    "siap_guna",
    "N"
   ],
   [
    "siap_operasi",
    "siap_operasi",
    "N"
   ],
   [
    "stamformasi",
    "stamformasi",
    "N"
   ],
   [
    "cadangan",
    "cadangan",
    "N"
   ]
  ]
 },
 {
  "name": "gapeka26_duksar_lok_dipo",
  "ss": "14Cz2Ovgwa_hoWg1KAbdOcN4JkvrAeoXoR-4NpsY1Ung",
  "sheet": "duksar_lok_dipo_2026",
  "range": "duksar_lok_dipo_2026!A:G",
  "skip": 1,
  "desc": "Duksar 2026: lokomotif per dipo",
  "cols": [
   [
    "wilayah",
    "wilayah",
    "S"
   ],
   [
    "dipo",
    "dipo",
    "S"
   ],
   [
    "jenis_lok",
    "jenis_lok",
    "S"
   ],
   [
    "siap_guna",
    "siap_guna",
    "N"
   ],
   [
    "tsgo",
    "tsgo",
    "N"
   ],
   [
    "tso",
    "tso",
    "N"
   ],
   [
    "so",
    "so",
    "N"
   ]
  ]
 },
 {
  "name": "gapeka26_sarana_unit",
  "ss": "1L4dh9ADls3xMfsJcoIVPIgo8e5bEga4Y5r5LX6IcFoE",
  "sheet": "sarana_unit_2026",
  "range": "sarana_unit_2026!A:K",
  "skip": 1,
  "desc": "Duksar 2026: nomor unit per sarana (penanda pembangkit & rangkaian KRD/KRL)",
  "cols": [
   [
    "wilayah",
    "wilayah",
    "S"
   ],
   [
    "sarana",
    "sarana",
    "S"
   ],
   [
    "dipo_depo",
    "dipo_depo",
    "S"
   ],
   [
    "jenis",
    "jenis",
    "S"
   ],
   [
    "kelas_klasifikasi",
    "kelas_klasifikasi",
    "S"
   ],
   [
    "nomor_sarana",
    "nomor_sarana",
    "S"
   ],
   [
    "nomor_seri",
    "nomor_seri",
    "S"
   ],
   [
    "kereta_pembangkit",
    "kereta_pembangkit",
    "S"
   ],
   [
    "tergabung_di_krd",
    "tergabung_di_krd",
    "S"
   ],
   [
    "catatan",
    "catatan",
    "S"
   ],
   [
    "baris_teks_sumber",
    "baris_teks_sumber",
    "N"
   ]
  ]
 },
 {
  "name": "gapeka25_jadwal_dw",
  "ss": "1UM8d7CvzhrXl1CeB7J7XNTaw0mcPiWA8-4_2RdZnH-c",
  "sheet": "jadwal_dw_2025",
  "range": "jadwal_dw_2025!A:L",
  "skip": 1,
  "desc": "Daftar Waktu GAPEKA 2025 per KA × stasiun",
  "cols": [
   [
    "no_ka",
    "no_ka",
    "S"
   ],
   [
    "nama_ka",
    "nama_ka",
    "S"
   ],
   [
    "relasi",
    "relasi",
    "S"
   ],
   [
    "urut",
    "urut",
    "N"
   ],
   [
    "kode_stasiun",
    "kode_stasiun",
    "S"
   ],
   [
    "nama_stasiun",
    "nama_stasiun",
    "S"
   ],
   [
    "vmax_kmj",
    "vmax_kmj",
    "S"
   ],
   [
    "datang",
    "datang",
    "S"
   ],
   [
    "berangkat",
    "berangkat",
    "S"
   ],
   [
    "keterangan",
    "keterangan",
    "S"
   ],
   [
    "sumber_buku",
    "sumber_buku",
    "S"
   ],
   [
    "status_verifikasi",
    "status_verifikasi",
    "S"
   ]
  ]
 },
 {
  "name": "gapeka25_penomoran_ka",
  "ss": "1UM8d7CvzhrXl1CeB7J7XNTaw0mcPiWA8-4_2RdZnH-c",
  "sheet": "penomoran_ka_2025",
  "range": "penomoran_ka_2025!A:L",
  "skip": 1,
  "desc": "Buku Penomoran GAPEKA 2025",
  "cols": [
   [
    "wilayah",
    "wilayah",
    "S"
   ],
   [
    "kelas_ka",
    "kelas_ka",
    "S"
   ],
   [
    "no_ka",
    "no_ka",
    "S"
   ],
   [
    "status",
    "status",
    "S"
   ],
   [
    "nama_ka",
    "nama_ka",
    "S"
   ],
   [
    "nama_identitas",
    "nama_identitas",
    "S"
   ],
   [
    "lintas",
    "lintas",
    "S"
   ],
   [
    "penyelenggara",
    "penyelenggara",
    "S"
   ],
   [
    "jarak_km",
    "jarak_km",
    "N"
   ],
   [
    "berangkat",
    "berangkat",
    "S"
   ],
   [
    "datang",
    "datang",
    "S"
   ],
   [
    "waktu_tempuh",
    "waktu_tempuh",
    "S"
   ]
  ]
 },
 {
  "name": "gapeka25_jarak_lintas",
  "ss": "1UM8d7CvzhrXl1CeB7J7XNTaw0mcPiWA8-4_2RdZnH-c",
  "sheet": "jarak_lintas_2025",
  "range": "jarak_lintas_2025!A:F",
  "skip": 1,
  "desc": "Matriks Jarak Antar Stasiun 2025 (km kumulatif)",
  "cols": [
   [
    "wilayah",
    "wilayah",
    "S"
   ],
   [
    "lintas",
    "lintas",
    "S"
   ],
   [
    "urut",
    "urut",
    "N"
   ],
   [
    "kode_stasiun",
    "kode_stasiun",
    "S"
   ],
   [
    "km_kumulatif",
    "km_kumulatif",
    "N"
   ],
   [
    "sumber",
    "sumber",
    "S"
   ]
  ]
 },
 {
  "name": "gapeka25_lintas_lembar",
  "ss": "1UM8d7CvzhrXl1CeB7J7XNTaw0mcPiWA8-4_2RdZnH-c",
  "sheet": "lintas_lembar_2025",
  "range": "lintas_lembar_2025!A:H",
  "skip": 1,
  "desc": "Urutan stasiun + km per judul lintas Lembar GAPEKA 2025",
  "cols": [
   [
    "lembar",
    "lembar",
    "S"
   ],
   [
    "wilayah",
    "wilayah",
    "S"
   ],
   [
    "judul_lintas",
    "judul_lintas",
    "S"
   ],
   [
    "urut",
    "urut",
    "N"
   ],
   [
    "kode_stasiun",
    "kode_stasiun",
    "S"
   ],
   [
    "nama_stasiun",
    "nama_stasiun",
    "S"
   ],
   [
    "km",
    "km",
    "N"
   ],
   [
    "berkas_lembar",
    "berkas_lembar",
    "S"
   ]
  ]
 },
 {
  "name": "skema",
  "ss": "1HmlF2DL4KeHGVSO87aQAKu86dbfrnZohkCA7SsaL3OM",
  "sheet": "Skema",
  "range": "Skema!A:D",
  "skip": 1,
  "desc": "Kamus kolom Gangguan_Induk (kolom, nama kanonis, fungsi, aturan pengisian)",
  "cols": [
   [
    "kolom",
    "Kolom",
    "S"
   ],
   [
    "nama_kanonis",
    "Nama kanonis",
    "S"
   ],
   [
    "fungsi",
    "Fungsi",
    "S"
   ],
   [
    "aturan_pengisian",
    "Aturan pengisian",
    "S"
   ]
  ]
 },
 {
  "name": "sarana_sap",
  "ss": "115j4MRjEKeUkKULyGGhF2pQ4l_OSGhnyBYmZE-pqSc0",
  "sheet": "Sarana_Knowledge",
  "range": "Sarana_Knowledge!A:T",
  "skip": 1,
  "desc": "Referensi sarana SAP per unit: dipo, pabrikan, mulai dinas, karakteristik (JSON)",
  "cols": [
   [
    "asset_key",
    "asset_key",
    "S"
   ],
   [
    "equipment_number",
    "equipment_number",
    "S"
   ],
   [
    "no_sarana",
    "no_sarana",
    "S"
   ],
   [
    "equipment_desc",
    "equipment_desc",
    "S"
   ],
   [
    "catalog_profile",
    "catalog_profile",
    "S"
   ],
   [
    "class_sarana",
    "class_sarana",
    "S"
   ],
   [
    "class_desc",
    "class_desc",
    "S"
   ],
   [
    "dipo_code",
    "dipo_code",
    "S"
   ],
   [
    "dipo_name",
    "dipo_name",
    "S"
   ],
   [
    "plant",
    "plant",
    "S"
   ],
   [
    "lokasi_kepemilikan",
    "lokasi_kepemilikan",
    "S"
   ],
   [
    "manuf_asset",
    "manuf_asset",
    "S"
   ],
   [
    "manuf_model_number",
    "manuf_model_number",
    "S"
   ],
   [
    "manuf_serial_number",
    "manuf_serial_number",
    "S"
   ],
   [
    "kapasitas",
    "kapasitas",
    "N"
   ],
   [
    "mulai_dinas",
    "mulai_dinas",
    "S"
   ],
   [
    "bast_date",
    "bast_date",
    "S"
   ],
   [
    "sys",
    "sys",
    "S"
   ],
   [
    "usr",
    "usr",
    "S"
   ],
   [
    "characteristics_json",
    "characteristics_json",
    "S"
   ]
  ]
 }
];
