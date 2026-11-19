-- 20_views.sql — DIBANGKITKAN tools/gen_schema.py. View bertipe di dataset kai (angka & tanggal diurai oleh UDF kai.num / kai.tgl).

CREATE OR REPLACE VIEW `${PROJECT}.kai.gangguan_induk` OPTIONS(description="SSOT kejadian gangguan & hambatan (dashboard)") AS
SELECT
  NULLIF(TRIM(nomor_sumber), "") AS nomor_sumber,
  NULLIF(TRIM(kode_laporan), "") AS kode_laporan,
  `${PROJECT}.kai.tgl`(tanggal_kejadian) AS tanggal_kejadian, tanggal_kejadian AS tanggal_kejadian_teks,
  NULLIF(TRIM(hari), "") AS hari,
  NULLIF(TRIM(bulan), "") AS bulan,
  `${PROJECT}.kai.num`(tahun) AS tahun,
  NULLIF(TRIM(kategori_gangguan), "") AS kategori_gangguan,
  NULLIF(TRIM(subgangguan), "") AS subgangguan,
  NULLIF(TRIM(jenis_sarana), "") AS jenis_sarana,
  NULLIF(TRIM(nomor_sarana), "") AS nomor_sarana,
  NULLIF(TRIM(wilayah_kejadian), "") AS wilayah_kejadian,
  NULLIF(TRIM(depo_induk), "") AS depo_induk,
  NULLIF(TRIM(wilayah_depo), "") AS wilayah_depo,
  NULLIF(TRIM(judul_gangguan), "") AS judul_gangguan,
  NULLIF(TRIM(kode_jenis_gangguan), "") AS kode_jenis_gangguan,
  NULLIF(TRIM(jam_mulai), "") AS jam_mulai,
  NULLIF(TRIM(stasiun), "") AS stasiun,
  NULLIF(TRIM(petak_jalan), "") AS petak_jalan,
  NULLIF(TRIM(kilometer), "") AS kilometer,
  NULLIF(TRIM(nomor_sarana_penolong), "") AS nomor_sarana_penolong,
  NULLIF(TRIM(keterangan_kejadian), "") AS keterangan_kejadian,
  NULLIF(TRIM(nomor_kereta_api_terkait), "") AS nomor_kereta_api_terkait,
  `${PROJECT}.kai.num`(total_andil_kelka_menit) AS total_andil_kelka_menit,
  NULLIF(TRIM(sumber_data), "") AS sumber_data,
  NULLIF(TRIM(tab_asal), "") AS tab_asal,
  `${PROJECT}.kai.num`(baris_asal) AS baris_asal,
  NULLIF(TRIM(kunci_asal), "") AS kunci_asal,
  NULLIF(TRIM(sha_256_sumber), "") AS sha_256_sumber,
  NULLIF(TRIM(status_kualitas), "") AS status_kualitas,
  NULLIF(TRIM(alamat_sumber), "") AS alamat_sumber,
  NULLIF(TRIM(penyebab_terlapor), "") AS penyebab_terlapor,
  NULLIF(TRIM(tindak_lanjut_terlapor), "") AS tindak_lanjut_terlapor,
  NULLIF(TRIM(bukti_ekstraksi), "") AS bukti_ekstraksi,
  NULLIF(TRIM(status_ekstraksi), "") AS status_ekstraksi,
  NULLIF(TRIM(versi_aturan_ekstraksi), "") AS versi_aturan_ekstraksi
FROM `${PROJECT}.kai_raw.gangguan_induk`
WHERE COALESCE(NULLIF(TRIM(nomor_sumber),""), NULLIF(TRIM(kode_laporan),""), NULLIF(TRIM(tanggal_kejadian),"")) IS NOT NULL;

CREATE OR REPLACE VIEW `${PROJECT}.kai.hambatan_jasum` OPTIONS(description="Arsip impor REKAP HAMBATAN JASUM (hulu; dipetakan ke gangguan_induk)") AS
SELECT
  `${PROJECT}.kai.tgl`(tanggal) AS tanggal, tanggal AS tanggal_teks,
  NULLIF(TRIM(lokasi), "") AS lokasi,
  NULLIF(TRIM(direktorat), "") AS direktorat,
  NULLIF(TRIM(jenis_hambatan), "") AS jenis_hambatan,
  NULLIF(TRIM(kode), "") AS kode,
  NULLIF(TRIM(mulai), "") AS mulai,
  NULLIF(TRIM(akhir), "") AS akhir,
  `${PROJECT}.kai.num`(durasi_hambatan_menit) AS durasi_hambatan_menit,
  NULLIF(TRIM(keterangan), "") AS keterangan,
  NULLIF(TRIM(bulan_asli), "") AS bulan_asli,
  NULLIF(TRIM(kelompok_kode), "") AS kelompok_kode,
  NULLIF(TRIM(kolom_l_asli), "") AS kolom_l_asli,
  NULLIF(TRIM(sumber), "") AS sumber,
  NULLIF(TRIM(tab_sumber), "") AS tab_sumber,
  `${PROJECT}.kai.num`(baris_sumber) AS baris_sumber,
  NULLIF(TRIM(kunci_jejak), "") AS kunci_jejak,
  NULLIF(TRIM(sha_256_baris_asli), "") AS sha_256_baris_asli,
  NULLIF(TRIM(status_kualitas), "") AS status_kualitas,
  NULLIF(TRIM(jenis_catatan), "") AS jenis_catatan,
  NULLIF(TRIM(ka_terganggu_sumber), "") AS ka_terganggu_sumber,
  NULLIF(TRIM(andil_per_ka_sumber_menit), "") AS andil_per_ka_sumber_menit
FROM `${PROJECT}.kai_raw.hambatan_jasum`
WHERE COALESCE(NULLIF(TRIM(tanggal),""), NULLIF(TRIM(lokasi),""), NULLIF(TRIM(direktorat),"")) IS NOT NULL;

CREATE OR REPLACE VIEW `${PROJECT}.kai.passenger` OPTIONS(description="Pendapatan & volume penumpang per KA per bulan") AS
SELECT
  NULLIF(TRIM(tanggal_bulan), "") AS tanggal_bulan,
  `${PROJECT}.kai.num`(pendapatan_rp) AS pendapatan_rp,
  NULLIF(TRIM(nomor_ka), "") AS nomor_ka,
  NULLIF(TRIM(nama_ka), "") AS nama_ka,
  NULLIF(TRIM(kelas_ka), "") AS kelas_ka,
  NULLIF(TRIM(relasi_awal_akhir_naik), "") AS relasi_awal_akhir_naik,
  `${PROJECT}.kai.num`(jumlah_penumpang) AS jumlah_penumpang,
  `${PROJECT}.kai.num`(realisasi_terisi_eko_pnp) AS realisasi_terisi_eko_pnp,
  `${PROJECT}.kai.num`(realisasi_terisi_eks_pnp) AS realisasi_terisi_eks_pnp,
  `${PROJECT}.kai.num`(realisasi_terisi_bis_pnp) AS realisasi_terisi_bis_pnp,
  NULLIF(TRIM(pct_porsi_eko), "") AS pct_porsi_eko,
  NULLIF(TRIM(pct_porsi_eks), "") AS pct_porsi_eks,
  NULLIF(TRIM(pct_porsi_bis), "") AS pct_porsi_bis,
  NULLIF(TRIM(jenis_ka), "") AS jenis_ka,
  `${PROJECT}.kai.num`(pendapatan_eko_rp) AS pendapatan_eko_rp,
  `${PROJECT}.kai.num`(pendapatan_eks_rp) AS pendapatan_eks_rp,
  `${PROJECT}.kai.num`(pendapatan_bis_rp) AS pendapatan_bis_rp
FROM `${PROJECT}.kai_raw.passenger`
WHERE COALESCE(NULLIF(TRIM(tanggal_bulan),""), NULLIF(TRIM(pendapatan_rp),""), NULLIF(TRIM(nomor_ka),"")) IS NOT NULL;

CREATE OR REPLACE VIEW `${PROJECT}.kai.freight` OPTIONS(description="Pendapatan & volume barang per Nama KA/komoditas per bulan") AS
SELECT
  NULLIF(TRIM(tanggal_bulan), "") AS tanggal_bulan,
  `${PROJECT}.kai.num`(pendapatan_rp) AS pendapatan_rp,
  NULLIF(TRIM(nama_ka), "") AS nama_ka,
  NULLIF(TRIM(komoditas), "") AS komoditas,
  NULLIF(TRIM(komoditas_detail), "") AS komoditas_detail,
  NULLIF(TRIM(nama_mitra), "") AS nama_mitra,
  `${PROJECT}.kai.num`(volume_real_ton) AS volume_real_ton,
  NULLIF(TRIM(relasi), "") AS relasi,
  `${PROJECT}.kai.num`(tarif_rata_rata_rp_ton) AS tarif_rata_rata_rp_ton
FROM `${PROJECT}.kai_raw.freight`
WHERE COALESCE(NULLIF(TRIM(tanggal_bulan),""), NULLIF(TRIM(pendapatan_rp),""), NULLIF(TRIM(nama_ka),"")) IS NOT NULL;

CREATE OR REPLACE VIEW `${PROJECT}.kai.thi` OPTIONS(description="Track Health Index per wilayah/resor/petak per bulan") AS
SELECT
  NULLIF(TRIM(wilayah), "") AS wilayah,
  NULLIF(TRIM(periode), "") AS periode,
  NULLIF(TRIM(bulan), "") AS bulan,
  NULLIF(TRIM(tingkat), "") AS tingkat,
  NULLIF(TRIM(unit), "") AS unit,
  `${PROJECT}.kai.num`(healthy_index) AS healthy_index,
  NULLIF(TRIM(grade_healthy_index), "") AS grade_healthy_index,
  `${PROJECT}.kai.num`(condition_index) AS condition_index,
  NULLIF(TRIM(grade_condition), "") AS grade_condition,
  `${PROJECT}.kai.num`(material) AS material,
  `${PROJECT}.kai.num`(konstruksi) AS konstruksi,
  `${PROJECT}.kai.num`(geometri) AS geometri,
  NULLIF(TRIM(material_rel_dan_sambungan_las_30pct), "") AS material_rel_dan_sambungan_las_30pct,
  NULLIF(TRIM(material_sambungan_pelat_20pct), "") AS material_sambungan_pelat_20pct,
  NULLIF(TRIM(material_penambat_15pct), "") AS material_penambat_15pct,
  NULLIF(TRIM(material_wesel_15pct), "") AS material_wesel_15pct,
  NULLIF(TRIM(material_balas_plinth_10pct), "") AS material_balas_plinth_10pct,
  NULLIF(TRIM(material_bantalan_10pct), "") AS material_bantalan_10pct,
  NULLIF(TRIM(konstruksi_badan_jalan_dan_lereng_50pct), "") AS konstruksi_badan_jalan_dan_lereng_50pct,
  NULLIF(TRIM(konstruksi_drainase_30pct), "") AS konstruksi_drainase_30pct,
  NULLIF(TRIM(konstruksi_lingkungan_20pct), "") AS konstruksi_lingkungan_20pct,
  `${PROJECT}.kai.num`(maintenance_index) AS maintenance_index,
  NULLIF(TRIM(grade_maintenance), "") AS grade_maintenance,
  NULLIF(TRIM(inspeksi_terjadwal), "") AS inspeksi_terjadwal,
  NULLIF(TRIM(ppj), "") AS ppj,
  NULLIF(TRIM(mir), "") AS mir,
  NULLIF(TRIM(perawatan_korektif_wmr), "") AS perawatan_korektif_wmr,
  NULLIF(TRIM(ppj_program), "") AS ppj_program,
  NULLIF(TRIM(ppj_realisasi), "") AS ppj_realisasi,
  NULLIF(TRIM(mir_program), "") AS mir_program,
  NULLIF(TRIM(mir_realisasi), "") AS mir_realisasi,
  NULLIF(TRIM(wmr_program), "") AS wmr_program,
  NULLIF(TRIM(wmr_realisasi), "") AS wmr_realisasi,
  `${PROJECT}.kai.num`(panjang_petak_jalan_msp) AS panjang_petak_jalan_msp,
  NULLIF(TRIM(jumlah_hektometer), "") AS jumlah_hektometer,
  NULLIF(TRIM(hm_tanpa_kasus_lengkap_material), "") AS hm_tanpa_kasus_lengkap_material,
  NULLIF(TRIM(hm_tanpa_kasus_lengkap_konstruksi), "") AS hm_tanpa_kasus_lengkap_konstruksi,
  NULLIF(TRIM(catatan), "") AS catatan,
  NULLIF(TRIM(berkas_sumber), "") AS berkas_sumber,
  NULLIF(TRIM(tab_sumber), "") AS tab_sumber,
  NULLIF(TRIM(baris_sumber), "") AS baris_sumber,
  NULLIF(TRIM(kunci_data), "") AS kunci_data,
  NULLIF(TRIM(sha_256_nilai_sumber), "") AS sha_256_nilai_sumber,
  NULLIF(TRIM(kode_upt_jr), "") AS kode_upt_jr,
  NULLIF(TRIM(unit_resor_referensi_thi), "") AS unit_resor_referensi_thi,
  NULLIF(TRIM(qc_peta), "") AS qc_peta,
  NULLIF(TRIM(kode_jalur_jenis_sumber), "") AS kode_jalur_jenis_sumber,
  NULLIF(TRIM(id_petak_thi), "") AS id_petak_thi,
  NULLIF(TRIM(dasar_pemetaan), "") AS dasar_pemetaan,
  NULLIF(TRIM(halaman_peta_wilayah_1_pdf), "") AS halaman_peta_wilayah_1_pdf,
  NULLIF(TRIM(pembagi_indeks_sumber), "") AS pembagi_indeks_sumber
FROM `${PROJECT}.kai_raw.thi`
WHERE COALESCE(NULLIF(TRIM(wilayah),""), NULLIF(TRIM(periode),""), NULLIF(TRIM(bulan),"")) IS NOT NULL;

CREATE OR REPLACE VIEW `${PROJECT}.kai.rhi` OPTIONS(description="Rolling stock Health Index harian per sarana") AS
SELECT
  NULLIF(TRIM(nomor_sarana), "") AS nomor_sarana,
  NULLIF(TRIM(tipe_sarana), "") AS tipe_sarana,
  `${PROJECT}.kai.tgl`(tgl_data) AS tgl_data, tgl_data AS tgl_data_teks,
  NULLIF(TRIM(perawatan_terakhir), "") AS perawatan_terakhir,
  NULLIF(TRIM(tgl_perawatan), "") AS tgl_perawatan,
  NULLIF(TRIM(reliability_index), "") AS reliability_index,
  NULLIF(TRIM(maintainability_index), "") AS maintainability_index,
  NULLIF(TRIM(availability_index), "") AS availability_index,
  `${PROJECT}.kai.num`(rams_index) AS rams_index,
  NULLIF(TRIM(total_request_rows), "") AS total_request_rows,
  NULLIF(TRIM(total_terpenuhi), "") AS total_terpenuhi,
  NULLIF(TRIM(list_maintenance_realisasi), "") AS list_maintenance_realisasi,
  NULLIF(TRIM(list_maintenance_seharusnya), "") AS list_maintenance_seharusnya,
  NULLIF(TRIM(spare_management_score), "") AS spare_management_score,
  NULLIF(TRIM(maintenance_completion_score), "") AS maintenance_completion_score,
  `${PROJECT}.kai.num`(maintenance_index) AS maintenance_index,
  NULLIF(TRIM(umur_kereta), "") AS umur_kereta,
  NULLIF(TRIM(age_index), "") AS age_index,
  NULLIF(TRIM(penalti_open), "") AS penalti_open,
  NULLIF(TRIM(penalti_lengkap), "") AS penalti_lengkap,
  NULLIF(TRIM(real_condition_index), "") AS real_condition_index,
  NULLIF(TRIM(onsite_inspection_index), "") AS onsite_inspection_index,
  `${PROJECT}.kai.num`(condition_index) AS condition_index,
  `${PROJECT}.kai.num`(healthy_index) AS healthy_index,
  NULLIF(TRIM(healthy_status), "") AS healthy_status,
  NULLIF(TRIM(berkas_sumber), "") AS berkas_sumber,
  NULLIF(TRIM(tab_sumber), "") AS tab_sumber,
  NULLIF(TRIM(baris_sumber), "") AS baris_sumber,
  NULLIF(TRIM(kunci_sarana_tanggal), "") AS kunci_sarana_tanggal,
  NULLIF(TRIM(sha_256_nilai_sumber), "") AS sha_256_nilai_sumber,
  NULLIF(TRIM(catatan_pemeriksaan), "") AS catatan_pemeriksaan,
  `${PROJECT}.kai.num`(healthy_index_pulih) AS healthy_index_pulih,
  NULLIF(TRIM(condition_index_pulih), "") AS condition_index_pulih,
  NULLIF(TRIM(onsite_inspection_index_pulih), "") AS onsite_inspection_index_pulih,
  NULLIF(TRIM(maintenance_index_pulih), "") AS maintenance_index_pulih,
  NULLIF(TRIM(umur_kereta_pulih_tahun), "") AS umur_kereta_pulih_tahun,
  NULLIF(TRIM(age_index_pulih), "") AS age_index_pulih,
  NULLIF(TRIM(pemeriksaan_pemulihan), "") AS pemeriksaan_pemulihan,
  NULLIF(TRIM(catatan_verifikasi_rumus), "") AS catatan_verifikasi_rumus
FROM `${PROJECT}.kai_raw.rhi`
WHERE COALESCE(NULLIF(TRIM(nomor_sarana),""), NULLIF(TRIM(tipe_sarana),""), NULLIF(TRIM(tgl_data),"")) IS NOT NULL;

CREATE OR REPLACE VIEW `${PROJECT}.kai.wkp` OPTIONS(description="Window time / WKP (program & realisasi) per wilayah") AS
SELECT
  NULLIF(TRIM(nomor_sumber), "") AS nomor_sumber,
  `${PROJECT}.kai.tgl`(tanggal) AS tanggal, tanggal AS tanggal_teks,
  NULLIF(TRIM(wilayah), "") AS wilayah,
  NULLIF(TRIM(jenis_kegiatan), "") AS jenis_kegiatan,
  NULLIF(TRIM(program_mulai), "") AS program_mulai,
  NULLIF(TRIM(program_akhir), "") AS program_akhir,
  `${PROJECT}.kai.num`(program_durasi_hari_excel) AS program_durasi_hari_excel,
  NULLIF(TRIM(realisasi_mulai), "") AS realisasi_mulai,
  NULLIF(TRIM(realisasi_akhir), "") AS realisasi_akhir,
  `${PROJECT}.kai.num`(realisasi_durasi_hari_excel) AS realisasi_durasi_hari_excel,
  NULLIF(TRIM(keterangan), "") AS keterangan,
  NULLIF(TRIM(ka_terimbas_kolom_l_sumber), "") AS ka_terimbas_kolom_l_sumber,
  NULLIF(TRIM(ka_terimbas_kolom_m_sumber), "") AS ka_terimbas_kolom_m_sumber,
  NULLIF(TRIM(rumus_waktu_nilai_sumber), "") AS rumus_waktu_nilai_sumber,
  NULLIF(TRIM(sela_perka_nilai_sumber), "") AS sela_perka_nilai_sumber,
  `${PROJECT}.kai.num`(durasi_dalam_menit_nilai_sumber) AS durasi_dalam_menit_nilai_sumber,
  NULLIF(TRIM(berkas_sumber), "") AS berkas_sumber,
  NULLIF(TRIM(tab_sumber), "") AS tab_sumber,
  `${PROJECT}.kai.num`(baris_sumber) AS baris_sumber,
  NULLIF(TRIM(sha_256_nilai_sumber), "") AS sha_256_nilai_sumber,
  `${PROJECT}.kai.tgl`(tanggal_terverifikasi) AS tanggal_terverifikasi, tanggal_terverifikasi AS tanggal_terverifikasi_teks,
  NULLIF(TRIM(wilayah_terverifikasi), "") AS wilayah_terverifikasi,
  NULLIF(TRIM(catatan_penelusuran_tanggal), "") AS catatan_penelusuran_tanggal,
  NULLIF(TRIM(baris_tab), "") AS baris_tab,
  `${PROJECT}.kai.tgl`(tanggal_terkoreksi) AS tanggal_terkoreksi, tanggal_terkoreksi AS tanggal_terkoreksi_teks,
  NULLIF(TRIM(wilayah_terkoreksi), "") AS wilayah_terkoreksi,
  NULLIF(TRIM(kode_aturan), "") AS kode_aturan,
  NULLIF(TRIM(kode_aturan_penelusuran), "") AS kode_aturan_penelusuran
FROM `${PROJECT}.kai_raw.wkp`
WHERE COALESCE(NULLIF(TRIM(nomor_sumber),""), NULLIF(TRIM(tanggal),""), NULLIF(TRIM(wilayah),"")) IS NOT NULL;

CREATE OR REPLACE VIEW `${PROJECT}.kai.gapeka25_list_ka` OPTIONS(description="LIST KA GAPEKA 2025 (perjalanan, relasi, jadwal ringkas, susunan)") AS
SELECT
  NULLIF(TRIM(no_ka), "") AS no_ka,
  NULLIF(TRIM(jenis_ka), "") AS jenis_ka,
  NULLIF(TRIM(nama_ka), "") AS nama_ka,
  NULLIF(TRIM(nama_identitas_ka), "") AS nama_identitas_ka,
  NULLIF(TRIM(lintas), "") AS lintas,
  `${PROJECT}.kai.num`(jarak) AS jarak,
  NULLIF(TRIM(jarak_salinan), "") AS jarak_salinan,
  NULLIF(TRIM(jam_ber), "") AS jam_ber,
  NULLIF(TRIM(jam_dat), "") AS jam_dat,
  NULLIF(TRIM(wp), "") AS wp,
  NULLIF(TRIM(kol_k), "") AS kol_k,
  NULLIF(TRIM(wilayah), "") AS wilayah,
  NULLIF(TRIM(pnp_brg), "") AS pnp_brg,
  NULLIF(TRIM(kelas_ka), "") AS kelas_ka,
  NULLIF(TRIM(kol_o), "") AS kol_o,
  NULLIF(TRIM(jenis_pelayanan), "") AS jenis_pelayanan,
  NULLIF(TRIM(klasifikasi_ka), "") AS klasifikasi_ka,
  NULLIF(TRIM(kelas_ka_2), "") AS kelas_ka_2,
  NULLIF(TRIM(wilayah_2), "") AS wilayah_2,
  NULLIF(TRIM(kol_t), "") AS kol_t,
  NULLIF(TRIM(komersial_pso_perintis), "") AS komersial_pso_perintis,
  NULLIF(TRIM(kol_v), "") AS kol_v,
  NULLIF(TRIM(klasifikasi_ka_2), "") AS klasifikasi_ka_2,
  NULLIF(TRIM(kol_x), "") AS kol_x,
  NULLIF(TRIM(ber), "") AS ber,
  NULLIF(TRIM(kol_z), "") AS kol_z,
  NULLIF(TRIM(kol_aa), "") AS kol_aa,
  NULLIF(TRIM(kol_ab), "") AS kol_ab,
  NULLIF(TRIM(kol_ac), "") AS kol_ac,
  NULLIF(TRIM(kol_ad), "") AS kol_ad,
  NULLIF(TRIM(dat), "") AS dat,
  NULLIF(TRIM(kol_af), "") AS kol_af,
  NULLIF(TRIM(ber_2), "") AS ber_2,
  NULLIF(TRIM(st_ber), "") AS st_ber,
  NULLIF(TRIM(daop_divre_ber), "") AS daop_divre_ber,
  NULLIF(TRIM(dat_2), "") AS dat_2,
  NULLIF(TRIM(st_dat), "") AS st_dat,
  NULLIF(TRIM(daop_divre_dat), "") AS daop_divre_dat,
  NULLIF(TRIM(kol_am), "") AS kol_am,
  NULLIF(TRIM(sf), "") AS sf,
  `${PROJECT}.kai.num`(kap_td) AS kap_td,
  NULLIF(TRIM(kol_ap), "") AS kol_ap,
  NULLIF(TRIM(detail_ka), "") AS detail_ka,
  NULLIF(TRIM(reg_tamb), "") AS reg_tamb,
  NULLIF(TRIM(kol_as), "") AS kol_as,
  NULLIF(TRIM(jenis_layanan_djka), "") AS jenis_layanan_djka,
  NULLIF(TRIM(kol_au), "") AS kol_au,
  NULLIF(TRIM(kol_av), "") AS kol_av
FROM `${PROJECT}.kai_raw.gapeka25_list_ka`
WHERE COALESCE(NULLIF(TRIM(no_ka),""), NULLIF(TRIM(jenis_ka),""), NULLIF(TRIM(nama_ka),"")) IS NOT NULL;

CREATE OR REPLACE VIEW `${PROJECT}.kai.gapeka25_stasiun` OPTIONS(description="Daftar stasiun GAPEKA 2025") AS
SELECT
  NULLIF(TRIM(id_trainplan), "") AS id_trainplan,
  NULLIF(TRIM(singkatan_stasiun), "") AS singkatan_stasiun,
  NULLIF(TRIM(nama_stasiun), "") AS nama_stasiun,
  NULLIF(TRIM(wilayah_operasi), "") AS wilayah_operasi,
  NULLIF(TRIM(status), "") AS status
FROM `${PROJECT}.kai_raw.gapeka25_stasiun`
WHERE COALESCE(NULLIF(TRIM(id_trainplan),""), NULLIF(TRIM(singkatan_stasiun),""), NULLIF(TRIM(nama_stasiun),"")) IS NOT NULL;

CREATE OR REPLACE VIEW `${PROJECT}.kai.gapeka25_petak` OPTIONS(description="Daftar petak jalan GAPEKA 2025") AS
SELECT
  NULLIF(TRIM(daop_divre), "") AS daop_divre,
  NULLIF(TRIM(lintas), "") AS lintas,
  NULLIF(TRIM(stasiun_a), "") AS stasiun_a,
  NULLIF(TRIM(stasiun_b), "") AS stasiun_b,
  NULLIF(TRIM(petak_jalan), "") AS petak_jalan,
  `${PROJECT}.kai.num`(jarak) AS jarak,
  NULLIF(TRIM(ganda_tunggal), "") AS ganda_tunggal
FROM `${PROJECT}.kai_raw.gapeka25_petak`
WHERE COALESCE(NULLIF(TRIM(daop_divre),""), NULLIF(TRIM(lintas),""), NULLIF(TRIM(stasiun_a),"")) IS NOT NULL;

CREATE OR REPLACE VIEW `${PROJECT}.kai.ref_jadwal_dw_2025` OPTIONS(description="Buku Daftar Waktu GAPEKA 2025 (diekstrak per baris; seed 11_SeedJadwal.gs)") AS
SELECT
  NULLIF(TRIM(no_ka), "") AS no_ka,
  NULLIF(TRIM(nama_ka), "") AS nama_ka,
  NULLIF(TRIM(relasi), "") AS relasi,
  `${PROJECT}.kai.num`(urut) AS urut,
  NULLIF(TRIM(kode_stasiun), "") AS kode_stasiun,
  NULLIF(TRIM(nama_stasiun), "") AS nama_stasiun,
  NULLIF(TRIM(datang), "") AS datang,
  NULLIF(TRIM(berangkat), "") AS berangkat,
  NULLIF(TRIM(keterangan), "") AS keterangan,
  NULLIF(TRIM(catatan), "") AS catatan,
  NULLIF(TRIM(sumber_buku), "") AS sumber_buku
FROM `${PROJECT}.kai_raw.ref_jadwal_dw_2025`
WHERE COALESCE(NULLIF(TRIM(no_ka),""), NULLIF(TRIM(nama_ka),""), NULLIF(TRIM(relasi),"")) IS NOT NULL;

CREATE OR REPLACE VIEW `${PROJECT}.kai.ref_ptdo_2025_stasiun_tutup` OPTIONS(description="PTDO GAPEKA 2025 Bab IV (seed 11_SeedJadwal.gs)") AS
SELECT
  NULLIF(TRIM(kode_stasiun), "") AS kode_stasiun,
  NULLIF(TRIM(jenis), "") AS jenis,
  NULLIF(TRIM(mulai), "") AS mulai,
  NULLIF(TRIM(akhir), "") AS akhir
FROM `${PROJECT}.kai_raw.ref_ptdo_2025_stasiun_tutup`
WHERE COALESCE(NULLIF(TRIM(kode_stasiun),""), NULLIF(TRIM(jenis),""), NULLIF(TRIM(mulai),"")) IS NOT NULL;

CREATE OR REPLACE VIEW `${PROJECT}.kai.ref_depo_ka_2025` OPTIONS(description="Duksar/PTDO GAPEKA 2025 (seed SEED_DEPO_KA)") AS
SELECT
  NULLIF(TRIM(depo), "") AS depo,
  NULLIF(TRIM(kode), "") AS kode,
  NULLIF(TRIM(jenis), "") AS jenis,
  NULLIF(TRIM(daftar_ka), "") AS daftar_ka,
  NULLIF(TRIM(kol_5), "") AS kol_5
FROM `${PROJECT}.kai_raw.ref_depo_ka_2025`
WHERE COALESCE(NULLIF(TRIM(depo),""), NULLIF(TRIM(kode),""), NULLIF(TRIM(jenis),"")) IS NOT NULL;

CREATE OR REPLACE VIEW `${PROJECT}.kai.ref_jpl` OPTIONS(description="Daftar 1.404 titik peningkatan keselamatan perlintasan sebidang (seed SEED_JPL)") AS
SELECT
  NULLIF(TRIM(no), "") AS no,
  NULLIF(TRIM(petak), "") AS petak,
  NULLIF(TRIM(no_jpl), "") AS no_jpl,
  NULLIF(TRIM(km), "") AS km,
  NULLIF(TRIM(provinsi), "") AS provinsi,
  NULLIF(TRIM(kabupaten_kota), "") AS kabupaten_kota,
  NULLIF(TRIM(status_jalan), "") AS status_jalan,
  NULLIF(TRIM(kolom_8), "") AS kolom_8,
  NULLIF(TRIM(kolom_9), "") AS kolom_9,
  NULLIF(TRIM(kolom_10), "") AS kolom_10,
  NULLIF(TRIM(wilayah), "") AS wilayah,
  NULLIF(TRIM(kolom_12), "") AS kolom_12
FROM `${PROJECT}.kai_raw.ref_jpl`
WHERE COALESCE(NULLIF(TRIM(no),""), NULLIF(TRIM(petak),""), NULLIF(TRIM(no_jpl),"")) IS NOT NULL;

CREATE OR REPLACE VIEW `${PROJECT}.kai.ref_resor_meta` OPTIONS(description="PETA_WILAYAH 2026 (transkripsi 10 Nov 2026) (PETA_WILAYAH.pdf)") AS
SELECT
  NULLIF(TRIM(kode_resor), "") AS kode_resor,
  NULLIF(TRIM(wilayah), "") AS wilayah,
  NULLIF(TRIM(nama), "") AS nama,
  NULLIF(TRIM(jumlah), "") AS jumlah,
  NULLIF(TRIM(km_awal), "") AS km_awal,
  NULLIF(TRIM(km_akhir), "") AS km_akhir,
  NULLIF(TRIM(cakupan), "") AS cakupan
FROM `${PROJECT}.kai_raw.ref_resor_meta`
WHERE COALESCE(NULLIF(TRIM(kode_resor),""), NULLIF(TRIM(wilayah),""), NULLIF(TRIM(nama),"")) IS NOT NULL;

CREATE OR REPLACE VIEW `${PROJECT}.kai.ref_resor_stasiun` OPTIONS(description="PETA_WILAYAH 2026 (transkripsi 10 Nov 2026)") AS
SELECT
  NULLIF(TRIM(kode_stasiun), "") AS kode_stasiun,
  NULLIF(TRIM(kode_resor), "") AS kode_resor
FROM `${PROJECT}.kai_raw.ref_resor_stasiun`
WHERE COALESCE(NULLIF(TRIM(kode_stasiun),""), NULLIF(TRIM(kode_resor),"")) IS NOT NULL;

CREATE OR REPLACE VIEW `${PROJECT}.kai.ref_resor_petak` OPTIONS(description="PETA_WILAYAH 2026 (transkripsi 10 Nov 2026)") AS
SELECT
  NULLIF(TRIM(petak), "") AS petak,
  NULLIF(TRIM(kode_resor), "") AS kode_resor,
  NULLIF(TRIM(catatan), "") AS catatan
FROM `${PROJECT}.kai_raw.ref_resor_petak`
WHERE COALESCE(NULLIF(TRIM(petak),""), NULLIF(TRIM(kode_resor),""), NULLIF(TRIM(catatan),"")) IS NOT NULL;

CREATE OR REPLACE VIEW `${PROJECT}.kai.ref_stasiun_koordinat` OPTIONS(description="OSM via enwo02/train-tracker (rail tiles) — diunduh 13 Nov 2026 · © kontributor OpenStreetMap, ODbL 1.0") AS
SELECT
  NULLIF(TRIM(kode_stasiun), "") AS kode_stasiun,
  `${PROJECT}.kai.num`(lat) AS lat,
  `${PROJECT}.kai.num`(lon) AS lon,
  `${PROJECT}.kai.num`(elevasi_m) AS elevasi_m,
  NULLIF(TRIM(sumber_koordinat), "") AS sumber_koordinat
FROM `${PROJECT}.kai_raw.ref_stasiun_koordinat`
WHERE COALESCE(NULLIF(TRIM(kode_stasiun),""), NULLIF(TRIM(lat),""), NULLIF(TRIM(lon),"")) IS NOT NULL;

CREATE OR REPLACE VIEW `${PROJECT}.kai.ref_petak_osm` OPTIONS(description="© kontributor OpenStreetMap, ODbL 1.0") AS
SELECT
  NULLIF(TRIM(petak), "") AS petak,
  `${PROJECT}.kai.num`(km_osm) AS km_osm,
  NULLIF(TRIM(cocok_jarak_25pct), "") AS cocok_jarak_25pct,
  `${PROJECT}.kai.num`(jumlah_jembatan) AS jumlah_jembatan,
  `${PROJECT}.kai.num`(panjang_jembatan_m) AS panjang_jembatan_m,
  `${PROJECT}.kai.num`(jumlah_terowongan) AS jumlah_terowongan,
  `${PROJECT}.kai.num`(panjang_terowongan_m) AS panjang_terowongan_m,
  `${PROJECT}.kai.num`(pct_elektrifikasi) AS pct_elektrifikasi,
  `${PROJECT}.kai.num`(vmax_osm_kmj) AS vmax_osm_kmj,
  NULLIF(TRIM(nama_lintas_osm), "") AS nama_lintas_osm,
  NULLIF(TRIM(wikipedia), "") AS wikipedia
FROM `${PROJECT}.kai_raw.ref_petak_osm`
WHERE COALESCE(NULLIF(TRIM(petak),""), NULLIF(TRIM(km_osm),""), NULLIF(TRIM(cocok_jarak_25pct),"")) IS NOT NULL;

CREATE OR REPLACE VIEW `${PROJECT}.kai.ref_duksar_unit_siap_guna` OPTIONS(description="Buku Dukungan Sarana (Duksar) GAPEKA 2025: Jawa (2 Jan 25), Sumbar (2 Jan 25), Sumsel (3 Jan 25), Sumut (2 Jan 25)") AS
SELECT
  NULLIF(TRIM(jenis), "") AS jenis,
  NULLIF(TRIM(depo_induk), "") AS depo_induk,
  NULLIF(TRIM(nomor_sarana), "") AS nomor_sarana
FROM `${PROJECT}.kai_raw.ref_duksar_unit_siap_guna`
WHERE COALESCE(NULLIF(TRIM(jenis),""), NULLIF(TRIM(depo_induk),""), NULLIF(TRIM(nomor_sarana),"")) IS NOT NULL;

CREATE OR REPLACE VIEW `${PROJECT}.kai.ref_duksar_lok_depo` OPTIONS(description="Buku Dukungan Sarana (Duksar) GAPEKA 2025: Jawa (2 Jan 25), Sumbar (2 Jan 25), Sumsel (3 Jan 25), Sumut (2 Jan 25)") AS
SELECT
  NULLIF(TRIM(depo), "") AS depo,
  `${PROJECT}.kai.num`(book) AS book,
  `${PROJECT}.kai.num`(siap_operasi) AS siap_operasi,
  `${PROJECT}.kai.num`(perbaikan) AS perbaikan,
  `${PROJECT}.kai.num`(siap_guna) AS siap_guna,
  `${PROJECT}.kai.num`(km_per_hari) AS km_per_hari,
  `${PROJECT}.kai.num`(jam_efektif) AS jam_efektif,
  `${PROJECT}.kai.num`(jam_operasi) AS jam_operasi,
  NULLIF(TRIM(daftar_ka), "") AS daftar_ka
FROM `${PROJECT}.kai_raw.ref_duksar_lok_depo`
WHERE COALESCE(NULLIF(TRIM(depo),""), NULLIF(TRIM(book),""), NULLIF(TRIM(siap_operasi),"")) IS NOT NULL;

CREATE OR REPLACE VIEW `${PROJECT}.kai.ref_rujukan` OPTIONS(description="Rujukan media & ilmiah terverifikasi (seed 12_SeedRujukan.gs)") AS
SELECT
  NULLIF(TRIM(id), "") AS id,
  NULLIF(TRIM(jenis), "") AS jenis,
  NULLIF(TRIM(sitasi_apa), "") AS sitasi_apa,
  NULLIF(TRIM(url), "") AS url,
  NULLIF(TRIM(tanggal_terbit), "") AS tanggal_terbit,
  NULLIF(TRIM(wilayah), "") AS wilayah,
  NULLIF(TRIM(topik), "") AS topik,
  NULLIF(TRIM(fakta_kunci), "") AS fakta_kunci,
  NULLIF(TRIM(implikasi_untuk_operasi), "") AS implikasi_untuk_operasi,
  NULLIF(TRIM(status_verifikasi), "") AS status_verifikasi,
  NULLIF(TRIM(aktif), "") AS aktif
FROM `${PROJECT}.kai_raw.ref_rujukan`
WHERE COALESCE(NULLIF(TRIM(id),""), NULLIF(TRIM(jenis),""), NULLIF(TRIM(sitasi_apa),"")) IS NOT NULL;

CREATE OR REPLACE VIEW `${PROJECT}.kai.ref_koreksi_data` OPTIONS(description="Log koreksi data berbukti (seed 12_SeedRujukan.gs)") AS
SELECT
  NULLIF(TRIM(tanda_isi), "") AS tanda_isi,
  NULLIF(TRIM(kunci_asal_saat_dibuat), "") AS kunci_asal_saat_dibuat,
  NULLIF(TRIM(jenis_koreksi), "") AS jenis_koreksi,
  NULLIF(TRIM(nilai_baru), "") AS nilai_baru,
  NULLIF(TRIM(nilai_asli), "") AS nilai_asli,
  NULLIF(TRIM(bukti), "") AS bukti,
  NULLIF(TRIM(diusulkan_oleh), "") AS diusulkan_oleh,
  NULLIF(TRIM(tanggal), "") AS tanggal,
  NULLIF(TRIM(aktif), "") AS aktif
FROM `${PROJECT}.kai_raw.ref_koreksi_data`
WHERE COALESCE(NULLIF(TRIM(tanda_isi),""), NULLIF(TRIM(kunci_asal_saat_dibuat),""), NULLIF(TRIM(jenis_koreksi),"")) IS NOT NULL;

CREATE OR REPLACE VIEW `${PROJECT}.kai.gapeka26_jadwal_dw` OPTIONS(description="Daftar Waktu GAPEKA 2026 per KA × stasiun (rencana; dasar pembanding realisasi)") AS
SELECT
  NULLIF(TRIM(no_ka), "") AS no_ka,
  NULLIF(TRIM(nama_ka), "") AS nama_ka,
  NULLIF(TRIM(relasi), "") AS relasi,
  `${PROJECT}.kai.num`(urut) AS urut,
  NULLIF(TRIM(kode_stasiun), "") AS kode_stasiun,
  NULLIF(TRIM(nama_stasiun), "") AS nama_stasiun,
  `${PROJECT}.kai.num`(vmax_kmj) AS vmax_kmj,
  NULLIF(TRIM(datang), "") AS datang,
  NULLIF(TRIM(berangkat), "") AS berangkat,
  NULLIF(TRIM(keterangan), "") AS keterangan,
  NULLIF(TRIM(sumber_buku), "") AS sumber_buku,
  NULLIF(TRIM(status_verifikasi), "") AS status_verifikasi
FROM `${PROJECT}.kai_raw.gapeka26_jadwal_dw`
WHERE COALESCE(NULLIF(TRIM(no_ka),""), NULLIF(TRIM(nama_ka),""), NULLIF(TRIM(relasi),"")) IS NOT NULL;

CREATE OR REPLACE VIEW `${PROJECT}.kai.gapeka26_penomoran_ka` OPTIONS(description="Buku Penomoran GAPEKA 2026: nomor, kelas, relasi, jam awal/akhir") AS
SELECT
  NULLIF(TRIM(wilayah), "") AS wilayah,
  NULLIF(TRIM(kelas_ka), "") AS kelas_ka,
  NULLIF(TRIM(no_ka), "") AS no_ka,
  NULLIF(TRIM(status), "") AS status,
  NULLIF(TRIM(nama_ka), "") AS nama_ka,
  NULLIF(TRIM(nama_identitas), "") AS nama_identitas,
  NULLIF(TRIM(lintas), "") AS lintas,
  NULLIF(TRIM(penyelenggara), "") AS penyelenggara,
  `${PROJECT}.kai.num`(jarak_km) AS jarak_km,
  NULLIF(TRIM(berangkat), "") AS berangkat,
  NULLIF(TRIM(datang), "") AS datang,
  NULLIF(TRIM(waktu_tempuh), "") AS waktu_tempuh
FROM `${PROJECT}.kai_raw.gapeka26_penomoran_ka`
WHERE COALESCE(NULLIF(TRIM(wilayah),""), NULLIF(TRIM(kelas_ka),""), NULLIF(TRIM(no_ka),"")) IS NOT NULL;

CREATE OR REPLACE VIEW `${PROJECT}.kai.gapeka26_jarak_lintas` OPTIONS(description="Matriks Jarak Antar Stasiun 2026 (km kumulatif)") AS
SELECT
  NULLIF(TRIM(wilayah), "") AS wilayah,
  NULLIF(TRIM(lintas), "") AS lintas,
  `${PROJECT}.kai.num`(urut) AS urut,
  NULLIF(TRIM(kode_stasiun), "") AS kode_stasiun,
  `${PROJECT}.kai.num`(km_kumulatif) AS km_kumulatif,
  NULLIF(TRIM(sumber), "") AS sumber
FROM `${PROJECT}.kai_raw.gapeka26_jarak_lintas`
WHERE COALESCE(NULLIF(TRIM(wilayah),""), NULLIF(TRIM(lintas),""), NULLIF(TRIM(urut),"")) IS NOT NULL;

CREATE OR REPLACE VIEW `${PROJECT}.kai.gapeka26_lintas_lembar` OPTIONS(description="Urutan stasiun + km per judul lintas Lembar GAPEKA 2026") AS
SELECT
  NULLIF(TRIM(lembar), "") AS lembar,
  NULLIF(TRIM(wilayah), "") AS wilayah,
  NULLIF(TRIM(judul_lintas), "") AS judul_lintas,
  `${PROJECT}.kai.num`(urut) AS urut,
  NULLIF(TRIM(kode_stasiun), "") AS kode_stasiun,
  NULLIF(TRIM(nama_stasiun), "") AS nama_stasiun,
  `${PROJECT}.kai.num`(km) AS km,
  NULLIF(TRIM(berkas_lembar), "") AS berkas_lembar
FROM `${PROJECT}.kai_raw.gapeka26_lintas_lembar`
WHERE COALESCE(NULLIF(TRIM(lembar),""), NULLIF(TRIM(wilayah),""), NULLIF(TRIM(judul_lintas),"")) IS NOT NULL;

CREATE OR REPLACE VIEW `${PROJECT}.kai.gapeka26_duksar_rekap` OPTIONS(description="Duksar 2026: rekap siap guna/operasi per jenis sarana") AS
SELECT
  NULLIF(TRIM(wilayah), "") AS wilayah,
  NULLIF(TRIM(jenis_sarana), "") AS jenis_sarana,
  `${PROJECT}.kai.num`(siap_guna) AS siap_guna,
  `${PROJECT}.kai.num`(siap_operasi) AS siap_operasi,
  `${PROJECT}.kai.num`(stamformasi) AS stamformasi,
  `${PROJECT}.kai.num`(cadangan) AS cadangan
FROM `${PROJECT}.kai_raw.gapeka26_duksar_rekap`
WHERE COALESCE(NULLIF(TRIM(wilayah),""), NULLIF(TRIM(jenis_sarana),""), NULLIF(TRIM(siap_guna),"")) IS NOT NULL;

CREATE OR REPLACE VIEW `${PROJECT}.kai.gapeka26_duksar_lok_dipo` OPTIONS(description="Duksar 2026: lokomotif per dipo") AS
SELECT
  NULLIF(TRIM(wilayah), "") AS wilayah,
  NULLIF(TRIM(dipo), "") AS dipo,
  NULLIF(TRIM(jenis_lok), "") AS jenis_lok,
  `${PROJECT}.kai.num`(siap_guna) AS siap_guna,
  `${PROJECT}.kai.num`(tsgo) AS tsgo,
  `${PROJECT}.kai.num`(tso) AS tso,
  `${PROJECT}.kai.num`(so) AS so
FROM `${PROJECT}.kai_raw.gapeka26_duksar_lok_dipo`
WHERE COALESCE(NULLIF(TRIM(wilayah),""), NULLIF(TRIM(dipo),""), NULLIF(TRIM(jenis_lok),"")) IS NOT NULL;

CREATE OR REPLACE VIEW `${PROJECT}.kai.gapeka26_sarana_unit` OPTIONS(description="Duksar 2026: nomor unit per sarana (penanda pembangkit & rangkaian KRD/KRL)") AS
SELECT
  NULLIF(TRIM(wilayah), "") AS wilayah,
  NULLIF(TRIM(sarana), "") AS sarana,
  NULLIF(TRIM(dipo_depo), "") AS dipo_depo,
  NULLIF(TRIM(jenis), "") AS jenis,
  NULLIF(TRIM(kelas_klasifikasi), "") AS kelas_klasifikasi,
  NULLIF(TRIM(nomor_sarana), "") AS nomor_sarana,
  NULLIF(TRIM(nomor_seri), "") AS nomor_seri,
  NULLIF(TRIM(kereta_pembangkit), "") AS kereta_pembangkit,
  NULLIF(TRIM(tergabung_di_krd), "") AS tergabung_di_krd,
  NULLIF(TRIM(catatan), "") AS catatan,
  `${PROJECT}.kai.num`(baris_teks_sumber) AS baris_teks_sumber
FROM `${PROJECT}.kai_raw.gapeka26_sarana_unit`
WHERE COALESCE(NULLIF(TRIM(wilayah),""), NULLIF(TRIM(sarana),""), NULLIF(TRIM(dipo_depo),"")) IS NOT NULL;

CREATE OR REPLACE VIEW `${PROJECT}.kai.gapeka25_jadwal_dw` OPTIONS(description="Daftar Waktu GAPEKA 2025 per KA × stasiun") AS
SELECT
  NULLIF(TRIM(no_ka), "") AS no_ka,
  NULLIF(TRIM(nama_ka), "") AS nama_ka,
  NULLIF(TRIM(relasi), "") AS relasi,
  `${PROJECT}.kai.num`(urut) AS urut,
  NULLIF(TRIM(kode_stasiun), "") AS kode_stasiun,
  NULLIF(TRIM(nama_stasiun), "") AS nama_stasiun,
  NULLIF(TRIM(vmax_kmj), "") AS vmax_kmj,
  NULLIF(TRIM(datang), "") AS datang,
  NULLIF(TRIM(berangkat), "") AS berangkat,
  NULLIF(TRIM(keterangan), "") AS keterangan,
  NULLIF(TRIM(sumber_buku), "") AS sumber_buku,
  NULLIF(TRIM(status_verifikasi), "") AS status_verifikasi
FROM `${PROJECT}.kai_raw.gapeka25_jadwal_dw`
WHERE COALESCE(NULLIF(TRIM(no_ka),""), NULLIF(TRIM(nama_ka),""), NULLIF(TRIM(relasi),"")) IS NOT NULL;

CREATE OR REPLACE VIEW `${PROJECT}.kai.gapeka25_penomoran_ka` OPTIONS(description="Buku Penomoran GAPEKA 2025") AS
SELECT
  NULLIF(TRIM(wilayah), "") AS wilayah,
  NULLIF(TRIM(kelas_ka), "") AS kelas_ka,
  NULLIF(TRIM(no_ka), "") AS no_ka,
  NULLIF(TRIM(status), "") AS status,
  NULLIF(TRIM(nama_ka), "") AS nama_ka,
  NULLIF(TRIM(nama_identitas), "") AS nama_identitas,
  NULLIF(TRIM(lintas), "") AS lintas,
  NULLIF(TRIM(penyelenggara), "") AS penyelenggara,
  `${PROJECT}.kai.num`(jarak_km) AS jarak_km,
  NULLIF(TRIM(berangkat), "") AS berangkat,
  NULLIF(TRIM(datang), "") AS datang,
  NULLIF(TRIM(waktu_tempuh), "") AS waktu_tempuh
FROM `${PROJECT}.kai_raw.gapeka25_penomoran_ka`
WHERE COALESCE(NULLIF(TRIM(wilayah),""), NULLIF(TRIM(kelas_ka),""), NULLIF(TRIM(no_ka),"")) IS NOT NULL;

CREATE OR REPLACE VIEW `${PROJECT}.kai.gapeka25_jarak_lintas` OPTIONS(description="Matriks Jarak Antar Stasiun 2025 (km kumulatif)") AS
SELECT
  NULLIF(TRIM(wilayah), "") AS wilayah,
  NULLIF(TRIM(lintas), "") AS lintas,
  `${PROJECT}.kai.num`(urut) AS urut,
  NULLIF(TRIM(kode_stasiun), "") AS kode_stasiun,
  `${PROJECT}.kai.num`(km_kumulatif) AS km_kumulatif,
  NULLIF(TRIM(sumber), "") AS sumber
FROM `${PROJECT}.kai_raw.gapeka25_jarak_lintas`
WHERE COALESCE(NULLIF(TRIM(wilayah),""), NULLIF(TRIM(lintas),""), NULLIF(TRIM(urut),"")) IS NOT NULL;

CREATE OR REPLACE VIEW `${PROJECT}.kai.gapeka25_lintas_lembar` OPTIONS(description="Urutan stasiun + km per judul lintas Lembar GAPEKA 2025") AS
SELECT
  NULLIF(TRIM(lembar), "") AS lembar,
  NULLIF(TRIM(wilayah), "") AS wilayah,
  NULLIF(TRIM(judul_lintas), "") AS judul_lintas,
  `${PROJECT}.kai.num`(urut) AS urut,
  NULLIF(TRIM(kode_stasiun), "") AS kode_stasiun,
  NULLIF(TRIM(nama_stasiun), "") AS nama_stasiun,
  `${PROJECT}.kai.num`(km) AS km,
  NULLIF(TRIM(berkas_lembar), "") AS berkas_lembar
FROM `${PROJECT}.kai_raw.gapeka25_lintas_lembar`
WHERE COALESCE(NULLIF(TRIM(lembar),""), NULLIF(TRIM(wilayah),""), NULLIF(TRIM(judul_lintas),"")) IS NOT NULL;

CREATE OR REPLACE VIEW `${PROJECT}.kai.skema` OPTIONS(description="Kamus kolom Gangguan_Induk (kolom, nama kanonis, fungsi, aturan pengisian)") AS
SELECT
  NULLIF(TRIM(kolom), "") AS kolom,
  NULLIF(TRIM(nama_kanonis), "") AS nama_kanonis,
  NULLIF(TRIM(fungsi), "") AS fungsi,
  NULLIF(TRIM(aturan_pengisian), "") AS aturan_pengisian
FROM `${PROJECT}.kai_raw.skema`
WHERE COALESCE(NULLIF(TRIM(kolom),""), NULLIF(TRIM(nama_kanonis),""), NULLIF(TRIM(fungsi),"")) IS NOT NULL;

CREATE OR REPLACE VIEW `${PROJECT}.kai.sarana_sap` OPTIONS(description="Referensi sarana SAP per unit: dipo, pabrikan, mulai dinas, karakteristik (JSON)") AS
SELECT
  NULLIF(TRIM(asset_key), "") AS asset_key,
  NULLIF(TRIM(equipment_number), "") AS equipment_number,
  NULLIF(TRIM(no_sarana), "") AS no_sarana,
  NULLIF(TRIM(equipment_desc), "") AS equipment_desc,
  NULLIF(TRIM(catalog_profile), "") AS catalog_profile,
  NULLIF(TRIM(class_sarana), "") AS class_sarana,
  NULLIF(TRIM(class_desc), "") AS class_desc,
  NULLIF(TRIM(dipo_code), "") AS dipo_code,
  NULLIF(TRIM(dipo_name), "") AS dipo_name,
  NULLIF(TRIM(plant), "") AS plant,
  NULLIF(TRIM(lokasi_kepemilikan), "") AS lokasi_kepemilikan,
  NULLIF(TRIM(manuf_asset), "") AS manuf_asset,
  NULLIF(TRIM(manuf_model_number), "") AS manuf_model_number,
  NULLIF(TRIM(manuf_serial_number), "") AS manuf_serial_number,
  `${PROJECT}.kai.num`(kapasitas) AS kapasitas,
  NULLIF(TRIM(mulai_dinas), "") AS mulai_dinas,
  NULLIF(TRIM(bast_date), "") AS bast_date,
  NULLIF(TRIM(sys), "") AS sys,
  NULLIF(TRIM(usr), "") AS usr,
  NULLIF(TRIM(characteristics_json), "") AS characteristics_json
FROM `${PROJECT}.kai_raw.sarana_sap`
WHERE COALESCE(NULLIF(TRIM(asset_key),""), NULLIF(TRIM(equipment_number),""), NULLIF(TRIM(no_sarana),"")) IS NOT NULL;
