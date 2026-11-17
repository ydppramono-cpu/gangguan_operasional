# Dashboard Gangguan Operasional v3.10.0 — catatan rilis (13 Nov 2026)

## Tab baru: Wilayah & koridor → Rute jalur
- **13 koridor**:
  - Jawa: Utara, Selatan, Priangan, Semarang–Solo, Merak, Bogor–Sukabumi–Padalarang, Kediri–Malang, Timur, Kroya–Cilacap.
  - Sumatera: Sumut, Sumbar, Sumsel, Babaranjang.
  - Cara bentuk koridor: stasiun jangkar disambung jalur terpendek graf LIST PETAK GAPEKA 2025.
- **Urutan stasiun & wilayah**:
  - Diagram lintas per petak, dengan baris Daop/Divre, ganda/tunggal, KA/hari, gangguan prasarana, WKP, THI petak, keamanan, alam.
  - Pita wilayah dilengkapi km per Daop/Divre.
- **KA lewat & pendapatan (apa adanya, tanpa skor produktivitas)**:
  - Penuh = seluruh pendapatan KA yang lewat.
  - Alokasi = × km di koridor ÷ km rute KA.
  - Peringkat 12 bln (alokasi): Babaranjang Rp 6.335,5 M · Selatan Rp 5.783,9 M · Utara Rp 4.753,6 M · Sumsel Rp 3.787,3 M · Priangan Rp 578,2 M.
  - Indeks isian = penumpang ÷ (kapasitas GAPEKA × hari), dipakai untuk menandai KA kurang terisi.
- **WKP, gangguan & jam kosong**:
  - WKP dipetakan ke petak dari teks lokasi (97% baris).
  - Jam kosong per petak dan per sepur (petak ganda) dihitung dari GAPEKA ± 5 menit.
  - Petak diberi status P1/P2/P3.
  - Rekomendasi WKP memakai jendela ≥ 60 menit (diutamakan malam). Bila WKP sudah rutin tetapi gangguan berulang, rekomendasinya evaluasi/perbaikan permanen.
- **Grafik perjalanan (Marey)**: seluruh perjalanan harian; pita hijau = jam kosong petak terpilih.
- **Peta**:
  - Vektor tertanam: OSM ODbL + Natural Earth, tanpa ubin, tanpa kunci API, aman dari blokir proxy.
  - 618/661 stasiun petak berkoordinat (diuji ≤ 1,5 km dari rel).
  - Atribut jembatan/terowongan/elektrifikasi/vmax hanya dari 593 petak yang panjang OSM-nya cocok ±25%.
- **Profil rute**:
  - Struktur & UPT Resor, bangunan & elektrifikasi, THI & topografi.
  - Elevasi 148 stasiun; 5 nilai salah ketik sumber dibuang, mis. Bekasi 419 m.
  - Kerentanan alam, rawan keamanan.
  - Riset publik bersumber: Notog, Kebasen, Sasaksaat, Cikubang, reaktivasi Cipatat–Padalarang.
  - Persinyalan & jenis material: "belum ada data" (tidak diperkirakan).

## Teknis
- **Paket 6 file**: Code.gs, SeedJadwal.gs, AsetLaporan.gs, **SeedPeta.gs (baru)**, Index.html, appsscript.json.
- **ETL WKP**: kolom baru lokasiPetak / mulai & akhir realisasi.
- **Versi**: SCHEMA 12, sehingga snapshot dibangun ulang otomatis.
- **Uji**: Playwright 1500 px & 400 px, 0 galat konsol, tanpa gulir horizontal.
