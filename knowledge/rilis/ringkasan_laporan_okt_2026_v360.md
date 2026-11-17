# Ringkasan Laporan Gangguan Operasional Oktober 2026 — web app v3.6.0 (aturan K5-2026.11)

Snapshot dihitung dari Gangguan_Induk pada 10 Nov 2026. Angkanya sama dengan deck "Oktober 2026 v3 FIX".

## Angka utama Oktober 2026

| Ukuran | Kejadian | Menit |
|---|---|---|
| Total | 255 | 14.483 |
| Ops/layanan/keamanan | 114 | 6.698 |
| Sarana | 99 | 5.402 |
| Alam | 14 | 983 |
| Prasarana | 20 | 1.257 |
| Data belum lengkap | 8 | 143 |

Pembanding: September 2026 316 kejadian / 14.109 menit; Oktober 2025 494 kejadian / 55.921 menit.

## Peringkat dan wilayah sorotan
Peringkat menit Oktober: Divre 4 (4.317), Daop 1 (2.644), Daop 4 (1.243), Divre 2 (1.225), Daop 6 (962).

Wilayah sorotan = 3 kelambatan terbesar + 3 frekuensi terbanyak + lonjakan (menit ≥ 2× bulan lalu dan ≥ 5% kelambatan KAI): Divre 4, Daop 1, Daop 4, Daop 6, Divre 2.

## Prasarana: THI Oktober 2026 (tingkat Scope) × gangguan jalan rel/wesel/track × WKP
- THI terendah: Divre 3 76,7 (komponen terlemah: perawatan korektif/WMR 46,3); berikutnya Daop 2 77,4 dan Daop 1 79,6.
- UPT JR dengan THI < 70: 18 dari 202.
- Kuadran prioritas (THI < 70 dan ada gangguan, 6 bulan): 6 UPT — 1.10 CKR, 4.8 KBD, 1.23 RK, III.11 BIB, III.12 GNM, 2.8 KAC.
- Gangguan jalan rel/wesel/track Oktober: 13 kejadian / 644 menit. Mei–Oktober: 95 kejadian / 4.100 menit.
- WKP Oktober: 2.124 kegiatan jalan rel; 237 melebihi program; andil kelambatan di rekap WKP 27.076 menit (terbesar Divre 3 10.308 menit); di Gangguan_Induk hanya 1 kejadian "melebihi waktu" (88 menit).

## Sarana: RHI lokomotif Oktober 2026 × gangguan
- Status: 551 unit — 319 HEALTHY, 223 MONITOR, 9 DECLINING.
- Gangguan per 100 unit: HEALTHY 5,3; MONITOR 10,3; DECLINING 11,1.
- Cakupan: 32 dari 32 gangguan lokomotif bernomor unit ada di RHI.

## Data yang diubah (hanya tab THI, RHI, WKP)
- THI: ditambah 78 baris tingkat "Scope" (nilai resmi per Daop/Divre, sheet Ringkasan Bulanan). Baris Resor (1.212 baris) sudah cocok 100% dengan 13 berkas sumber.
- RHI: kolom "(pulih)" diverifikasi. HI cocok ambang status di 100% baris. HI = 0,34·RAMS + 0,33·MI + 0,33·CI cocok di 5.549 baris yang memuat CI. Ditambah kolom AM: koreksi age_index untuk 620 baris (CC2019901/02, CC2039801–18), dan catatan umur belum terverifikasi untuk CC2052134.
- WKP: tidak diubah. Aplikasi menandai 50 baris bertanggal di masa depan (Jan 2027) dan baris yang lokasinya di luar wilayah tertulis.

## Pemetaan petak/stasiun ke UPT JR
Sumber: PETA_WILAYAH.pdf (202 resor), di 14_SeedResor.gs. 697 kode stasiun terpetakan. Dari petak GAPEKA: 435 di dalam satu resor, 197 melintasi batas resor dan dialokasikan menurut km, 16 perlu ditinjau.
