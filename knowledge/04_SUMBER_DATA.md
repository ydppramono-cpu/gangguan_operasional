# Sumber data & lokasi tabel

Semua lokasi berikut ada di Drive pemilik, di folder `KAI_Data_Platform`. Tabel yang sama dapat dibuka lewat tiga jalur, dan isinya sama:

1. **Google Sheets**, sebagai sumber utama (tempat data ditulis);
2. **BigQuery**, dataset `kai_raw` (STRING, live) dan `kai` (view bertipe), untuk DBeaver dan SQL;
3. **CSV cermin** di `05_DBEAVER_Mirror_CSV`, diperbarui setiap 15 menit bila sumber berubah, untuk DBeaver tanpa Google Cloud.

## Spreadsheet

| Kode | Nama | ID |
|---|---|---|
| DB | KAI | Basis Data Gangguan dan Hambatan 2025–2026 | `1HmlF2DL4KeHGVSO87aQAKu86dbfrnZohkCA7SsaL3OM` |
| GAPEKA25 | MASTER GAPEKA 2025 | `15yHI4aO3abw5D-Hhfmrhf0lk3hGQdWF99DRmv7aOoKI` |
| REF | KAI_Referensi_Turunan (GAPEKA 2025, peta, Duksar, JPL, resor) | `1nQuug9iDE6AeK8ZMRyk1dBbK849GDvLiP8l88kPQ3I0` |
| KATALOG | KAI_Katalog_Data (katalog berkas, kamus data, kontribusi pengetahuan, log) | `1H7lD5LXgm_OKnXjlBF4Jv7sDC4INyO29nFaPq6EeFkw` |

## Tabel

| Tabel (SQL) | Spreadsheet → tab | Isi |
|---|---|---|
| `gangguan_induk` | DB → Gangguan_Induk | SSOT kejadian gangguan & hambatan (dashboard) |
| `hambatan_jasum` | DB → Hambatan_Jasum | Arsip impor REKAP HAMBATAN JASUM (hulu; dipetakan ke gangguan_induk) |
| `passenger` | DB → Passenger | Pendapatan & volume penumpang per KA per bulan |
| `freight` | DB → Freight | Pendapatan & volume barang per Nama KA/komoditas per bulan |
| `thi` | DB → THI | Track Health Index per wilayah/resor/petak per bulan |
| `rhi` | DB → RHI | Rolling stock Health Index harian per sarana |
| `wkp` | DB → WKP | Window time / WKP (program & realisasi) per wilayah |
| `gapeka25_list_ka` | GAPEKA25 → LIST KA | LIST KA GAPEKA 2025 (perjalanan, relasi, jadwal ringkas, susunan) |
| `gapeka25_stasiun` | GAPEKA25 → LIST STASIUN | Daftar stasiun GAPEKA 2025 |
| `gapeka25_petak` | GAPEKA25 → LIST PETAK JALAN | Daftar petak jalan GAPEKA 2025 |
| `ref_jadwal_dw_2025` | REF → jadwal_dw_2025 | Buku Daftar Waktu GAPEKA 2025 (diekstrak per baris; seed 11_SeedJadwal.gs) |
| `ref_ptdo_2025_stasiun_tutup` | REF → ptdo_2025_stasiun_tutup | PTDO GAPEKA 2025 Bab IV (seed 11_SeedJadwal.gs) |
| `ref_depo_ka_2025` | REF → depo_ka_2025 | Duksar/PTDO GAPEKA 2025 (seed SEED_DEPO_KA) |
| `ref_jpl` | REF → jpl | Daftar 1.404 titik peningkatan keselamatan perlintasan sebidang (seed SEED_JPL) |
| `ref_resor_meta` | REF → resor_meta | PETA_WILAYAH 2026 (transkripsi 10 Nov 2026) (PETA_WILAYAH.pdf) |
| `ref_resor_stasiun` | REF → resor_stasiun | PETA_WILAYAH 2026 (transkripsi 10 Nov 2026) |
| `ref_resor_petak` | REF → resor_petak | PETA_WILAYAH 2026 (transkripsi 10 Nov 2026) |
| `ref_stasiun_koordinat` | REF → stasiun_koordinat | OSM via enwo02/train-tracker (rail tiles) — diunduh 13 Nov 2026 · © kontributor OpenStreetMap, ODbL 1.0 |
| `ref_petak_osm` | REF → petak_osm | © kontributor OpenStreetMap, ODbL 1.0 |
| `ref_duksar_unit_siap_guna` | REF → duksar_unit_siap_guna | Buku Dukungan Sarana (Duksar) GAPEKA 2025: Jawa (2 Jan 25), Sumbar (2 Jan 25), Sumsel (3 Jan 25), Sumut (2 Jan 25) |
| `ref_duksar_lok_depo` | REF → duksar_lok_depo | Buku Dukungan Sarana (Duksar) GAPEKA 2025: Jawa (2 Jan 25), Sumbar (2 Jan 25), Sumsel (3 Jan 25), Sumut (2 Jan 25) |
| `ref_rujukan` | REF → rujukan | Rujukan media & ilmiah terverifikasi (seed 12_SeedRujukan.gs) |
| `ref_koreksi_data` | REF → koreksi_data | Log koreksi data berbukti (seed 12_SeedRujukan.gs) |

Daftar setiap kolom (nama SQL, judul asli, dan tipe) ada di tab `Kamus_Data` spreadsheet katalog dan di berkas `db/schema/kamus_data.csv`.

## Data yang tertanam di kode web app (seed)
Data berikut tertanam di kode web app sebagai seed, dan diekspor ke spreadsheet REF agar dapat dikueri:

- **Jadwal Daftar Waktu GAPEKA 2025:** 53.422 baris.
- **Duksar:** 10.422 nomor sarana siap guna, dan dinasan lok untuk 14 depo.
- **JPL:** 1.404 titik.
- **Resor:** 202 resor, 697 stasiun, 1.344 arah petak.
- **Koordinat:** 618 stasiun.
- **Atribut OSM:** 635 petak.
- **Rujukan:** 52 rujukan dan 20 koreksi berbukti.

Bila seed diubah di kode, jalankan ulang `tools/export_seeds.py`, lalu unggah ulang hasilnya.
