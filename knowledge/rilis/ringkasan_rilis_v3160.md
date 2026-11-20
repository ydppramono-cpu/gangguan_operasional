# Ringkasan rilis v3.16.0 — Paket B bagian 1: program operasi KA, laci unit & KA, pendapatan hari jalan

Tanggal: 20 Nov 2026 · SCHEMA 14 (snapshot dibangun ulang otomatis setelah ditempel)

## Data baru (dibangkitkan alat, tercatat di `db/csv/_manifest.csv`)
| Tabel | Baris | Sumber |
|---|---|---|
| `ka_jalan_batal_2026` | 61.434 KA-bulan | Laporan KA Jalan/Batal Jan–Nov 2026 (dicetak 20 Nov 2026; sesudahnya = program) |
| `ka_frekuensi_2026` | 14.088 KA | Laporan Frekuensi KA 1 Jan–30 Nov 2026 (km per KA, frek jalan/batal) |
| `stasiun_perhentian_2025` | 7.741 KA | Laporan Stasiun Perhentian GAPEKA 2025 (rute berurutan) |
| `pola_operasi_ompr2` | 256 KA, 146 rangkaian | UPDATE POL OP OMPR2 (lok, stamformasi, depo induk) |

Seed `src/24_SeedOperasi.gs` (gzip, 0,5 MB) + modul `Ops` (`src/25_Operasi.gs`) → `ref.prog`; API baru `apiKaOps(no)` (masukan tertutup).

## Laci nomor sarana (permintaan butir 4)
- Tab "Dinasan" berupa pill diganti tabel **Dinasan & gangguan**: tanggal, no KA, nama, kelas, relasi, km KA, status program hari itu
  (Jalan / Jalan sebagai varian / Batal / Tidak berprogram), RHI & kategori hari itu, gangguan + lokasi, menit.
- Tab baru **Skor per periode**: grafik RHI harian + tabel bulanan RHI, kategori, RHI rata-rata, RAMS, Maintenance, Condition, hari H/M/D,
  gangguan & menit bulan itu.
- Tab **KA depo**: tabel (bukan pill) KA yang dilayani depo menurut Duksar, km, hari jalan/batal 2026, rangkaian pola operasi,
  gangguan unit pada KA itu. Berlabel "rencana", bukan dinasan unit.
- Batas data: log dinasan harian per unit tidak ada di sumber mana pun; baris dinasan = hari unit tercatat pada kejadian.

## Laci KA
- Tab **Program operasi 2026**: kalender Jalan/Batal per tanggal (heatmap) dengan titik kejadian, tabel per bulan (hari jalan,
  batal, tidak berprogram, km jalan, kejadian, kejadian di hari batal). Varian bernama sama (mis. 1 → 1B) ikut dihitung.

## Pendapatan terekspos (butir 7)
- Jam perjalanan × **hari jalan KA** (program operasi) menggantikan × hari kalender.
- Rate kejadian: rate KA itu sendiri (bulan lengkap) → rate jenis KA per **pulau** kejadian → acuan pulau → gabungan.
- Kejadian pada hari KA batal (tanpa varian jalan): pendapatan satu perjalanan sebagai **perkiraan**, terpisah dari RaR.
- Halaman Eksposur menampilkan selisih terhadap metode lama (E.legacy) agar perubahan angka laporan dapat ditelusuri.
- Laporan PPT/PDF memakai metode baru; teks metode diperbarui.

## Uji
check · emu 22/22 bersih · switch · marey (2025 & 2026) · bq · akses (10 API + 6 editor) · pulau · alur — semua LULUS.

## Belum (lanjutan Paket B)
Laci petak terpadu (THI, WKP, JPL, KA lewat dari rute, Jalan/Batal, lingkungan BPS/inaRISK/DEM), alur cerita per menu dengan
kartu lebih sedikit, penyeragaman peta/grafik, RHI kereta & gerbong (menunggu berkas).
