# Kamus istilah

Istilah di bawah dipakai di database, web app, dan laporan. Definisinya mengikuti pemakaian dalam proyek ini. Ejaan resmi tiap istilah ada di dokumen sumber (lihat `sumber_teks/`).

| Istilah | Arti dalam proyek ini |
|---|---|
| **GAPEKA** | Grafik Perjalanan Kereta Api. GAPEKA 2025 ditetapkan lewat KP-DJKA 224–227 Tahun 2024 (Jawa, Sumbagut, Sumbagbar, Sumbagsel). GAPEKA 2026 berlaku mulai 1 Des 2026. |
| **Daftar Waktu (DW)** | Buku jadwal per KA: urutan stasiun, jam datang/berangkat, serta keterangan berhenti/langsung. |
| **Buku Penomoran** | Nomor KA, relasi, jenis KA, kapasitas lintas, dan daftar jarak. |
| **Duksar** | Buku Dukungan Sarana: sarana siap guna per depo induk dan dinasan lokomotif. |
| **PTDO** | Buku pola/tata dinas operasi stasiun. Bab IV memuat jam dinas tutup stasiun. Disimpan sebagai teks untuk LLM; jam tutup stasiun diekstrak ke `ref_ptdo_2025_stasiun_tutup`. |
| **Malka Rinja** | Buku penyaluran perjalanan KA bila terjadi rintangan jalan (rinja) di suatu lintas, misalnya "Malka Rinja 5 BD–CKP (BC)". Isinya KA yang dialihkan, lintas pengalihan, dan jam. |
| **Dinasan O.20** | Buku dinasan masinis dan asisten masinis. |
| **Lembar GAPEKA** | Grafik perjalanan per Daop/Divre (diagram jarak–waktu). Diarsipkan sebagai gambar, tidak diekstrak. |
| **Emplasemen** | Tata letak jalur dan wesel di stasiun. Gambar teknik disimpan sebagai arsip dan diindeks per stasiun. |
| **Daop / Divre** | Daerah Operasi (Jawa, 1–9) / Divisi Regional (Sumatera, I–IV). |
| **Petak jalan** | Ruas antara dua stasiun bersebelahan, misalnya `CKP-TJS`. Daftarnya ada di LIST PETAK JALAN GAPEKA 2025. |
| **Lintas** | Rangkaian petak; nama di LIST PETAK, misalnya "TEGAL - PEKALONGAN". |
| **Koridor** | Satuan analisis web app (tab Rute jalur): stasiun jangkar yang disambung jalur terpendek GAPEKA. Ada 13 koridor. |
| **UPT JR / Resor** | Unit Pelaksana Teknis Jalan Rel (resor). Pemetaannya dari PETA_WILAYAH (202 resor). |
| **KELKA / Andil Kelka** | Kelambatan KA. Angka durasi dashboard adalah *Total Andil Kelka (menit)*. |
| **Gangguan / Hambatan** | Diperlakukan setara. Hambatan Jasum dipetakan ke Gangguan_Induk. |
| **Imbas** | Kelambatan turunan dari kejadian lain. Dikecualikan dari analisis lokasi titik rawan. |
| **WKP / Window time** | Waktu kerja/perawatan prasarana, dengan program dan realisasi. Sumbernya REKAP WINDOW TIME. |
| **Sela perka** | WKP di sela perjalanan KA tanpa menutup petak penuh. |
| **THI** | Track Health Index (Healthy, Condition, Maintenance Index) per wilayah/resor/petak per bulan. |
| **RHI** | Rolling-stock Health Index harian per sarana. HI ≥ 85 HEALTHY; 70–85 MONITOR; < 70 DECLINING. |
| **SG / SO / SF** | Siap guna / siap operasi / susunan formasi (dari Duksar dan LIST KA). |
| **JPL** | Jalan perlintasan langsung (perlintasan sebidang). Sumbernya daftar 1.404 titik dan 190 titik prioritas. |
| **REG / PLB / FAK / KLB** | Perjalanan reguler / perjalanan lain biasa / fakultatif / kereta luar biasa (kolom Jenis KA). |
| **Pendapatan terekspos (RaR)** | Revenue at Risk tahap 1 (Gross): menit KELKA ÷ 60 × rate per jam. Ini indikator, bukan kerugian. |
