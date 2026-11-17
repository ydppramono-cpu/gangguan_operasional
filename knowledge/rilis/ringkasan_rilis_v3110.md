# Dashboard Gangguan Operasional v3.11.0: GAPEKA 2026 & grafik perjalanan (17 Nov 2026)

## Data baru: GAPEKA 2026 (KP-DJKA 116 Tahun 2026, 30 Okt 2026; berlaku 1 Des 2026)
Spreadsheet `02_DB/GAPEKA_2026_Basis_Data` (ID `14Cz2Ovgwa_hoWg1KAbdOcN4JkvrAeoXoR-4NpsY1Ung`):

| Tab | Baris | Sumber & mutu |
|---|---|---|
| jadwal_dw_2026 | 56.330 | Jawa (4 buku, 2.117 KA): lapisan teks PDF; 100% KA cocok daftar isi, jam awal–akhir 100% cocok Buku Penomoran (4 KA beda 1 menit antara daftar isi dan isi buku: 53, 170-167, 287, 312-313 — isi buku dipakai). Sumatera (3 buku, 413 KA): OCR; 272 KA terverifikasi (jam awal–akhir cocok Penomoran), 141 KA `periksa` |
| penomoran_ka_2026 | 2.829 | Buku Penomoran 4 wilayah, termasuk KA dinas |
| jarak_lintas_2026 | 666 | Matriks Jarak Antar Stasiun (62 matriks/pasangan, semua lolos cek km naik & baris terakhir) |
| lintas_lembar_2026 | 693 | 64 judul lintas Lembar GAPEKA → urutan stasiun + km |
| duksar_rekap_2026 | 14 | Rekap Dukungan Pendinasan Sarana per wilayah (lok, KRD, kereta, gerbong) |
| duksar_lok_dipo_2026 | 37 | Rekap ketersediaan lok per dipo; jumlah SG/TSGO/TSO/SO cocok baris JUMLAH tiap buku |

Catatan sumber: KA dinas hanya ada di Penomoran (tidak di Daftar Waktu). Lintas Panarukan–Kalisat tidak punya jarak di Penomoran. Segmen Tanahabang–Manggarai diambil dari kolom letak km Lembar I-3.

## Fitur baru: Grafik perjalanan (GAPEKA)
- Menu Analisis → **Grafik perjalanan (GAPEKA)**: diagram Marey waktu × km per **judul lintas** lembar (64 lintas, dikelompokkan per lembar; ada pencarian lintas/stasiun).
- Filter: jam mulai + rentang (2/4/8/12/24 jam, setara halaman lembar), jenis KA (PJJ, lokal/bandara, KRL, barang, dinas), hanya terverifikasi, sorot nomor KA, skala km, unduh PNG.
- Tanpa tumpang tindih: label stasiun direlaksasi (garis penunjuk ke km asli, tinggi kanvas menyesuaikan), nomor KA hanya ditulis bila tidak bertabrakan, label jam dijaga di dalam kanvas. Diuji otomatis pada 64 lintas × desktop/400 px: 0 tumpang tindih.
- Data statis di `19_SeedGapeka26.gs` (dibuka di browser), tidak bergantung snapshot gangguan.

## Alat
`tools/gapeka2026/` — pengurai DW (teks & OCR), Penomoran, matriks jarak, Duksar, sumbu lembar, pembangun lintas & seed.
