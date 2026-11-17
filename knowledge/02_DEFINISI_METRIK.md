# Definisi metrik & rumus

Dokumen ini adalah acuan rumus web app versi 3.10.0. Bila ada perubahan rumus, perbarui dokumen ini dan `05_LOG_KEPUTUSAN.md` pada commit yang sama.

## Gangguan
- **Kejadian** = jumlah baris `Gangguan_Induk` dalam periode.
- **Menit** = Σ `Total Andil Kelka (menit)`.
- **Kelas gangguan:** operasional/layanan/keamanan, sarana, alam, prasarana, dan data belum lengkap. Klasifikasinya mengikuti aturan K5-2026.11 di `01_Domain.gs`.
- **Wilayah sorotan bulanan** dipilih dari gabungan tiga daftar:
  - 3 wilayah dengan menit terbesar;
  - 3 wilayah dengan kejadian terbanyak;
  - wilayah yang melonjak, yaitu menit ≥ 2× bulan lalu dan ≥ 5% dari kelambatan KAI.
- **Gangguan prasarana JR & wesel:** "Jalan Rel – …", track wesel, rel patah/spaten, goyangan, dan wesel.
- **Gangguan persinyalan:** "Persinyalan/Komunikasi – …".

## Prasarana (THI × WKP × gangguan)
- **WKP jalan rel** mencakup rel/las, wesel, bantalan/penambat, dan geometri.
  - Tanggal dan wilayah diambil dari kolom *terverifikasi*.
  - "Melebihi" berarti realisasi lebih lama dari program.
  - Baris dengan jam akhir < mulai dan durasi > 12 jam tidak dipakai.
- **Prioritas UPT** dihitung terhadap median THI KAI (Okt 2026: 83,4):
  - P1 = di bawah median dan ≥ 2 gangguan;
  - P2 = di bawah median dan WKP melebihi program ≥ 5;
  - P3 = di bawah median;
  - P4 = ≥ median dan ≥ 2 gangguan.
- **Status petak di tab Rute jalur** (12 bulan):
  - P1 = gangguan prasarana ≥ 2 dan (THI < 70 atau WKP jalan rel ≤ 1);
  - P2 = ada gangguan tanpa WKP jalan rel;
  - P3 = THI < 70 tanpa gangguan.
- **Jam kosong petak** = 24 jam dikurangi waktu tempuh petak tiap perjalanan harian REG/PLB GAPEKA, ± penyangga 5 menit.
  - Petak ganda juga dihitung per sepur.
  - Rekomendasi WKP memakai jendela ≥ 60 menit, diutamakan pukul 21:00–05:00.

## Sarana
- **RHI:**
  - HI = 0,34·RAMS + 0,33·MI + 0,33·CI. Rumus ini cocok di 5.549 baris yang memuat CI.
  - Status sarana dibaca pada tanggal kejadian. Bila tidak ada data, dipakai RHI terakhir ≤ tanggal kejadian.
- **Skor turunan kereta & gerbong** (indikator internal, *bukan RHI resmi*):
  - Keandalan = 100 − min(100, 15 × kejadian 12 bln + menit 12 bln ÷ 20).
  - Usia = 100 − 2,2 × (usia − 5). Usia > 80 tahun ditandai "periksa".
  - Kesiapan = 100 bila siap guna GAPEKA, 60 bila tidak tercantum, 30 bila di Balai Yasa.
  - Skor = 0,35 usia + 0,45 keandalan + 0,20 kesiapan.
  - Kategori: Baik ≥ 80, Pantau 60–80, Prioritas < 60.
- **Kekuatan depo** = 0,35 kesehatan + 0,30 keandalan + 0,20 porsi armada ≤ 30 th + 0,15 kesiapan GAPEKA.
  - Keandalan dibanding median depo sejenis; nilai 2× median = 0.
  - Peringkat hanya untuk depo dengan ≥ 10 unit.

## Pendapatan
- **Pendapatan terekspos (Gross RaR, tahap 1)** = menit KELKA ÷ 60 × rate per jam, menurut jenis KA dan bulan.
  - Rate penumpang = Σ pendapatan KA termatch ÷ Σ jam perjalanan GAPEKA × hari. Perjalanan REG dan PLB dihitung sekali.
  - Rate barang = Σ pendapatan nama KA ÷ Σ jam semua perjalanan reguler bernama sama × hari.
  - Bulan yang belum lengkap memakai rate acuan (rata-rata tertimbang): penumpang Rp14,4 juta/jam, barang Rp18,3 juta/jam.
  - Tahap 2–4 (Net RaR, kerugian aktual, profit at risk) belum aktif dan perlu sign-off Operasi, Komersial, Keuangan, dan Manajemen Risiko.
- **Pendapatan koridor (Rute jalur):**
  - *penuh* = Σ pendapatan KA yang melewati koridor;
  - *alokasi* = × km KA di koridor ÷ km rute KA.
- **Indeks isian** = penumpang ÷ (kapasitas GAPEKA × hari). Nilainya bisa > 100% karena kursi terjual ulang antar-relasi.
