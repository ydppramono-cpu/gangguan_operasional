# Kontrak data — Dashboard Gangguan Operasional (alternatif B)

Dokumen ini mengikat siapa menulis apa, kunci penghubung, tipe, kesegaran, dan siapa membaca. Daftar tabel di bawah
diturunkan dari `db/schema/sumber_tabel.json` (sumber kebenaran skema); CSV non-Sheets tercatat di `db/csv/_manifest.csv`.
Perubahan skema: ubah `sumber_tabel.json` → `python3 tools/gen_schema.py` → `npm run check` + `npm run test:bq`.

## 1. Aturan umum
1. **Tidak mengarang data.** Angka di UI berasal dari tabel di bawah atau `_manifest.csv`. Data tidak ada → "tidak tercatat" / "–".
   Perkiraan wajib berlabel "perkiraan".
2. Tab milik tim (Gangguan_Induk, THI, RHI, WKP, Passenger, Freight, Hambatan_Jasum) **tidak diubah** oleh alat, web app,
   maupun platform. Penulisan alat hanya ke tab/berkas baru, dengan cadangan lebih dulu.
3. Baris 1 = judul kolom; tidak ada sel gabungan. Judul kolom = nama di `sumber_tabel.json` (dipakai web app & BigQuery).
   Mengganti judul kolom di sheet tanpa memperbarui skema memutus web app; `ujiKondisiBq()` melaporkannya.
4. BigQuery hanya **membaca** Sheets (tabel eksternal) dan menulis dataset miliknya sendiri (`kai_snap`, `kai_agg`).

## 2. Lima kunci penghubung
| Kunci | Bentuk baku | Normalisasi | Dipakai di |
|---|---|---|---|
| Kode stasiun | huruf besar, mis. `KAC` | buang spasi & tanda baca | gangguan, jadwal, petak, resor, master stasiun |
| Petak | `A-B` (kode stasiun asal–tujuan) | urutan sesuai sumber | gangguan, THI petak, WKP, JPL, peta |
| Nomor KA | teks nomor, mis. `7` / `7A` | tanpa spasi | gangguan, GAPEKA 2025/2026, pendapatan |
| Nomor sarana | mis. `K100213` | huruf besar, **tanpa spasi** | gangguan, RHI, SAP, Duksar |
| Kode UPT Resor JR | `4.22` / `II.3` | angka Arab/Romawi + titik | THI, WKP, resor stasiun/petak |

Master stasiun gabungan: `db/csv/master_stasiun.csv` (prioritas data_station > LIST STASIUN > PETA_WILAYAH > Lembar/DW).

## 3. Tipe kolom
| Tipe skema | Sheets | BigQuery `kai.*` | Web app (adaptor `22_Bq.gs`) |
|---|---|---|---|
| teks | apa adanya | `STRING` (dipangkas, kosong → NULL) | teks |
| angka (`num`) | angka atau teks angka id_ID/mentah | `FLOAT64` via UDF `kai.num` | `Number` |
| tanggal (`date`) | Date atau teks tanggal | `DATE` via UDF `kai.tgl` + kolom `<nama>_teks` | teks ISO `YYYY-MM-DD` (jatuh ke teks asli bila tak terurai) |

## 4. Kesegaran & jalur baca
| Pembaca | Gangguan_Induk | THI / RHI / WKP | GAPEKA & referensi |
|---|---|---|---|
| Web app | Sheets, ≤ 15 menit | Sheets ≤ 15 menit; atau `kai_snap` bila `KONDISI_SUMBER=bq` (WKP ≤ 60 menit, THI/RHI ≤ 6 jam) | seed di `src/` (dibangkitkan alat), per versi GAPEKA |
| DBeaver | `kai.*` live / `kai_snap.*` / CSV | sama | `kai.*` / CSV |
| Agregat `kai_agg` | harian | harian | — |

## 5. GAPEKA
GAPEKA 2025 (berlaku 1 Feb 2025) dan 2026 (berlaku 1 Des 2026) disimpan dan dianalisis **masing-masing**. Tidak ada tabel
atau angka selisih/efek 2025→2026. Web app memilih sumber jadwal lewat satu switch global; `apiGapeka(tahun)` menerima
hanya `2025` atau `2026`.

## 5a. Program operasi KA (sejak v3.16.0)
Sumber: Laporan KA Jalan/Batal (Jan–Nov 2026, satu berkas per bulan), Laporan Frekuensi KA 2026, Laporan Stasiun Perhentian
GAPEKA 2025, pola operasi OMPR2. Diimpor `tools/operasi/impor_operasi.py` → `db/csv/ka_jalan_batal_2026.csv`,
`ka_frekuensi_2026.csv`, `stasiun_perhentian_2025.csv`, `pola_operasi_ompr2.csv` → `tools/operasi/build_operasi_seed.py`
→ `src/24_SeedOperasi.gs` (gzip). Modul `Ops` (`25_Operasi.gs`) menghasilkan `ref.prog`:
- `ka` { kunci KA: [km, nama, relasi, frek jalan, frek batal] } untuk nomor reguler; `pola` baris pola operasi.
- `st` { 'KA|yyyy-mm-dd': 'J' | 'J:1B' | 'B' | '-' } hanya untuk tanggal kejadian. `J:1B` = nomor itu batal tetapi varian
  bernama sama (nomor dasar sama) berjalan.
- `hj` hari jalan per KA per bulan (nomor + varian) untuk mesin pendapatan; `hj.sum` = kunci KA Sumatera.
- Status sesudah `cetak` (tanggal cetak laporan) adalah PROGRAM, bukan realisasi; tampilan wajib memberi label.
`apiKaOps(no)` mengembalikan pola harian satu KA; nomor divalidasi pola dan harus tercatat di seed.
Tidak ada log dinasan harian per unit sarana di sumber mana pun: riwayat dinasan unit hanya memuat hari unit tercatat pada kejadian.

## 6. Tabel agregat (`kai_agg`, dari `db/bigquery/30_agregat.sql`)
| Tabel | Butir | Isi |
|---|---|---|
| `rhi_bulanan` | sarana × bulan | hari data, HI (pulih) rata/min/akhir, status & RAMS akhir, hari per status |
| `rhi_status_terakhir` | sarana | baris RHI tanggal terbaru |
| `thi_ringkas` | wilayah × periode × tingkat | jumlah unit, rata-rata HI/CI/MI, panjang mSp |
| `wkp_bulanan` | bulan × wilayah | jumlah kegiatan, menit (nilai sumber) |
| `gangguan_bulanan` | bulan × wilayah × kategori | jumlah kejadian, andil kelambatan (menit) |

Indeks > 100 dianggap rusak dan diabaikan (sama dengan web app). Agregat untuk analisis/DBeaver; web app belum membacanya.

## 7. Daftar tabel (36 tabel)
| Tabel | Spreadsheet · tab | Isi | Kolom | Penulis |
|---|---|---|---|---|
| `gangguan_induk` | DB · `Gangguan_Induk` | SSOT kejadian gangguan & hambatan (dashboard) | 35 | Tim + ETL impor (berbukti) |
| `hambatan_jasum` | DB · `Hambatan_Jasum` | Arsip impor REKAP HAMBATAN JASUM (hulu; dipetakan ke gangguan_induk) | 21 | Pemilik lewat ChatGPT — **jangan disentuh** |
| `passenger` | DB · `Passenger` | Pendapatan & volume penumpang per KA per bulan | 17 | Tim |
| `freight` | DB · `Freight` | Pendapatan & volume barang per Nama KA/komoditas per bulan | 9 | Tim |
| `thi` | DB · `THI` | Track Health Index per wilayah/resor/petak per bulan | 51 | Tim |
| `rhi` | DB · `RHI` | Rolling stock Health Index harian per sarana | 39 | Tim |
| `wkp` | DB · `WKP` | Window time / WKP (program & realisasi) per wilayah | 28 | Tim |
| `gapeka25_list_ka` | GAPEKA25 · `LIST KA` | LIST KA GAPEKA 2025 (perjalanan, relasi, jadwal ringkas, susunan) | 48 | Tim / sumber resmi |
| `gapeka25_stasiun` | GAPEKA25 · `LIST STASIUN` | Daftar stasiun GAPEKA 2025 | 5 | Tim / sumber resmi |
| `gapeka25_petak` | GAPEKA25 · `LIST PETAK JALAN` | Daftar petak jalan GAPEKA 2025 | 7 | Tim / sumber resmi |
| `ref_jadwal_dw_2025` | REF · `jadwal_dw_2025` | Buku Daftar Waktu GAPEKA 2025 (diekstrak per baris; seed 11_SeedJadwal.gs) | 11 | Alat `tools/` (dibangkitkan) |
| `ref_ptdo_2025_stasiun_tutup` | REF · `ptdo_2025_stasiun_tutup` | PTDO GAPEKA 2025 Bab IV (seed 11_SeedJadwal.gs) | 4 | Alat `tools/` (dibangkitkan) |
| `ref_depo_ka_2025` | REF · `depo_ka_2025` | Duksar/PTDO GAPEKA 2025 (seed SEED_DEPO_KA) | 5 | Alat `tools/` (dibangkitkan) |
| `ref_jpl` | REF · `jpl` | Daftar 1.404 titik peningkatan keselamatan perlintasan sebidang (seed SEED_JPL) | 12 | Alat `tools/` (dibangkitkan) |
| `ref_resor_meta` | REF · `resor_meta` | PETA_WILAYAH 2026 (transkripsi 10 Nov 2026) (PETA_WILAYAH.pdf) | 7 | Alat `tools/` (dibangkitkan) |
| `ref_resor_stasiun` | REF · `resor_stasiun` | PETA_WILAYAH 2026 (transkripsi 10 Nov 2026) | 2 | Alat `tools/` (dibangkitkan) |
| `ref_resor_petak` | REF · `resor_petak` | PETA_WILAYAH 2026 (transkripsi 10 Nov 2026) | 3 | Alat `tools/` (dibangkitkan) |
| `ref_stasiun_koordinat` | REF · `stasiun_koordinat` | OSM via enwo02/train-tracker (rail tiles) — diunduh 13 Nov 2026 · © kontributor OpenStreet | 5 | Alat `tools/` (dibangkitkan) |
| `ref_petak_osm` | REF · `petak_osm` | © kontributor OpenStreetMap, ODbL 1.0 | 11 | Alat `tools/` (dibangkitkan) |
| `ref_duksar_unit_siap_guna` | REF · `duksar_unit_siap_guna` | Buku Dukungan Sarana (Duksar) GAPEKA 2025: Jawa (2 Jan 25), Sumbar (2 Jan 25), Sumsel (3 J | 3 | Alat `tools/` (dibangkitkan) |
| `ref_duksar_lok_depo` | REF · `duksar_lok_depo` | Buku Dukungan Sarana (Duksar) GAPEKA 2025: Jawa (2 Jan 25), Sumbar (2 Jan 25), Sumsel (3 J | 9 | Alat `tools/` (dibangkitkan) |
| `ref_rujukan` | REF · `rujukan` | Rujukan media & ilmiah terverifikasi (seed 12_SeedRujukan.gs) | 11 | Alat `tools/` (dibangkitkan) |
| `ref_koreksi_data` | REF · `koreksi_data` | Log koreksi data berbukti (seed 12_SeedRujukan.gs) | 9 | Alat `tools/` (dibangkitkan) |
| `gapeka26_jadwal_dw` | G26DB · `jadwal_dw_2026` | Daftar Waktu GAPEKA 2026 per KA × stasiun (rencana; dasar pembanding realisasi) | 12 | Alat `tools/` (dibangkitkan) |
| `gapeka26_penomoran_ka` | G26DB · `penomoran_ka_2026` | Buku Penomoran GAPEKA 2026: nomor, kelas, relasi, jam awal/akhir | 12 | Alat `tools/` (dibangkitkan) |
| `gapeka26_jarak_lintas` | G26DB · `jarak_lintas_2026` | Matriks Jarak Antar Stasiun 2026 (km kumulatif) | 6 | Alat `tools/` (dibangkitkan) |
| `gapeka26_lintas_lembar` | G26DB · `lintas_lembar_2026` | Urutan stasiun + km per judul lintas Lembar GAPEKA 2026 | 8 | Alat `tools/` (dibangkitkan) |
| `gapeka26_duksar_rekap` | G26DB · `duksar_rekap_2026` | Duksar 2026: rekap siap guna/operasi per jenis sarana | 6 | Alat `tools/` (dibangkitkan) |
| `gapeka26_duksar_lok_dipo` | G26DB · `duksar_lok_dipo_2026` | Duksar 2026: lokomotif per dipo | 7 | Alat `tools/` (dibangkitkan) |
| `gapeka26_sarana_unit` | G26SAR · `sarana_unit_2026` | Duksar 2026: nomor unit per sarana (penanda pembangkit & rangkaian KRD/KRL) | 11 | Alat `tools/` (dibangkitkan) |
| `gapeka25_jadwal_dw` | G25DB · `jadwal_dw_2025` | Daftar Waktu GAPEKA 2025 per KA × stasiun | 12 | Alat `tools/` (dibangkitkan) |
| `gapeka25_penomoran_ka` | G25DB · `penomoran_ka_2025` | Buku Penomoran GAPEKA 2025 | 12 | Alat `tools/` (dibangkitkan) |
| `gapeka25_jarak_lintas` | G25DB · `jarak_lintas_2025` | Matriks Jarak Antar Stasiun 2025 (km kumulatif) | 6 | Alat `tools/` (dibangkitkan) |
| `gapeka25_lintas_lembar` | G25DB · `lintas_lembar_2025` | Urutan stasiun + km per judul lintas Lembar GAPEKA 2025 | 8 | Alat `tools/` (dibangkitkan) |
| `skema` | DB · `Skema` | Kamus kolom Gangguan_Induk (kolom, nama kanonis, fungsi, aturan pengisian) | 4 | Tim |
| `sarana_sap` | SAR · `Sarana_Knowledge` | Referensi sarana SAP per unit: dipo, pabrikan, mulai dinas, karakteristik (JSON) | 20 | Tim / sumber resmi |

Kode spreadsheet: `DB` = KAI | Basis Data Gangguan dan Hambatan 2025–2026, `GAPEKA25` = MASTER GAPEKA 2025, `REF` = KAI_Referensi_Turunan (GAPEKA 2025, peta, Duksar, JPL, resor), `G26DB` = GAPEKA_2026_Basis_Data (02_DB), `G26SAR` = GAPEKA_2026_Sarana_Unit (02_DB), `G25DB` = GAPEKA_2025_Basis_Data (02_DB), `SAR` = KAI | Referensi Sarana Gangguan 2025–2026. ID spreadsheet disimpan di Script Properties dan `platform/Tables.gs`, bukan di kode web app.

## 8. Yang tidak dipakai
- Tanggal uji berkala sarana (EXPUJI) — keputusan 19 Nov 2026; data juga kedaluwarsa.
- Ubin OpenRailwayMap/OSM — kebijakan pemakaian; peta memakai vektor OSM sendiri (© kontributor OpenStreetMap, ODbL).

## 9. DB Batubara (ruang kerja Batubara, v3.21)
| Hal | Ketentuan |
|---|---|
| Sumber | Spreadsheet `Database_KA_Batubara_Sumsel` (milik tim Batubara). ID di Script Property `BB_DB_ID`, **hanya baca**. |
| Dibaca | master/SOP/program (M_*, SOP, PRG_TERMINAL, PRG_SIKLUS, KATALOG_HAMBATAN, AMBANG_SOP, KPI_TARGET, OTP_RESMI, KINERJA_*, DINASAN_AWAK, SARANA_*, PROGRAM_KA, PRASARANA_PETAK, KAPASITAS_LINTAS, EMPLASEMEN_*, TEMUAN_REGULASI, PUSTAKA, ALUR_KEGIATAN) + REAL_PERJALANAN, REAL_TERMINAL, REAL_THN, REAL_HAMBATAN, REAL_JEJAK. **REAL_GANGGUAN tidak dibaca** (gangguan = Gangguan_Induk). |
| Kesegaran | `syncScheduled_` → `Bb.sync(false)` tiap 15 menit bila DB berubah; `syncBatubaraNow()` (editor) memaksa. Snapshot per bagian (core, perjalanan, terminal, hambatan, jejak) gzip di Drive + CacheService. |
| Penjaga | REAL_PERJALANAN turun > 20% dari sinkron sebelumnya → ditolak, snapshot lama dipakai. |
| API | `apiBatubaraPart(name)` — nama dari daftar tertutup; `BB_DB_ID` kosong → `{ok:true, empty:true}`. `apiBatubara()` = parameter Papan skenario dari seed `27_SeedBatubara.gs`. |
| Repo publik | Data realisasi & SOP asli **tidak** masuk repo. Emulator/uji memakai `tests/emulator/bb_fixture.json` dari `tools/batubara/fixture_sintetis.py` (sintetis, benih tetap). |
| Perhitungan | `Js.BbData` (`window.BBK`) = rumus aplikasi WTT lama apa adanya (WTT, WPKA, WPG, OTP, indeks terminal, 8 tahap siklus). |
