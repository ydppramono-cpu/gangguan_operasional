# Ringkasan rilis v3.24.0 — 25 Nov 2026

Keputusan pemilik 25 Nov 2026:
- **Visual:** sistem visual terpadu. Grafik yang sudah ada (mis. Ringkasan) tidak dihilangkan, hanya dipercantik dan diseragamkan.
- **Emplasemen:** lintasan dipetakan dari kemiripan nama titik, berlabel "perkiraan". Emplasemen stasiun dibedakan dari fasilitas bongkar/muat.
- **Capaian:** kartu seperti sebelumnya, dalam satu baris yang dapat digeser.
- **Hari ini:** pilih tanggal, lencana "data s.d." per sumber, dan rantai penyebab per KA.
- **Awak:** beban dan risiko molor akibat terlambat.
- **Gangguan KA batubara:** cerita visual lengkap.
- **Skenario:**
  - batas di terminal = SOP kontrak per KA (SOP ganda dapat dipilih terpendek atau terpanjang);
  - rangkaian bila terlambat dapat dipilih, bawaannya tetap.

## Batubara

### Capaian
- Sepuluh kartu KPI wajib dalam **satu baris yang dapat digeser**: geser dengan sentuh/trackpad atau tombol ‹ ›.
- Label kelompok (Terminal · Perjalanan · Peredaran & stasiun) tertulis di tiap kartu.
- **Label "Rata-rata lambat −334 menit" diganti.** Rata-rata gabungan menjadi negatif karena banyak KA datang lebih awal, sehingga menyesatkan. Kini ditulis terpisah: jumlah KA terlambat beserta rata-ratanya, dan jumlah KA lebih awal beserta rata-ratanya.
  - Perubahan yang sama berlaku pada temuan OTP dan profil relasi.

### Hari ini
- **Pilih tanggal** (‹ › atau kalender).
  - Bawaan = tanggal terakhir yang tercakup **semua** sumber.
  - Dengan data saat ini bawaannya **31 Agu 2026**, karena hambatan harian berakhir 31 Agu.
- **Lencana "data s.d." per sumber:** perjalanan s.d. 30 Sep, terminal s.d. 16 Okt, hambatan s.d. 31 Agu, Gangguan_Induk sesuai data.
  - Sumber yang belum mencakup tanggal terpilih berlencana kuning, dan angkanya ditulis "tidak tercatat", bukan 0.
- **REAL_HAMBATAN baris "Tidak (rekap bulanan)" tidak dipakai di Hari ini.** Baris rekap ini bertanggal tanggal 1, bukan kejadian hari itu. Sebelumnya rekap September (19 baris, 146.771 menit) tampil seolah-olah kejadian 1 Sep.
- **Rantai per KA terlambat:** perjalanan → terminal → hambatan → gangguan, untuk KA yang sama pada tanggal ±1 hari.
  - Terminal: kegiatan muat/bongkar KA itu dibanding SOP kontrak.
  - Hambatan: REAL_HAMBATAN **tidak mencatat nomor KA**, sehingga dikaitkan lewat terminal, jenis kegiatan dan tanggal yang sama (tertulis di layar).
  - Gangguan: Gangguan_Induk dengan nomor KA yang sama.

### Profil terminal: emplasemen interaktif
- Gambar vektor lembar GAPEKA 2025 dan, bila ada, tata letak persinyalan (Tarahan, Sukamenanti, Tigagajah).
  - Gambar yang terpecah ke beberapa baris "bagian" kini digabung.
- **Setiap jalur dapat diklik.** Jalur emplasemen stasiun (biru) dibedakan dari fasilitas terminal bongkar/muat (oranye: TLS, RCD, CY, apron, AF, dermaga, sepur simpang PT).
- **Rincian jalur:** panjang dan keterangan (EMPLASEMEN_JALUR), lalu KA program yang memakai fasilitas itu (PRG_TERMINAL) beserta realisasinya:
  - Tarahan: per nomor RCD dari rekon REAL_THN (median, P85, porsi melewati SOP RCD);
  - fasilitas lain: kegiatan KA yang diprogram di fasilitas itu, berlabel **perkiraan**, karena REAL_TERMINAL tidak mencatat fasilitas nyata.
- **Alur kegiatan** (ALUR_KEGIATAN, dipilih dari M_UPT):
  - langkah bernomor dengan lintasan putus-putus beranimasi;
  - pilihan "lintasan lewat" fasilitas tertentu (mis. TLS III).
- **Tiap langkah menampilkan batas dan realisasi per tahap:**
  - batas = rentang SOP kontrak PROGRAM_KA di lokasi itu;
  - realisasi = median dan P85 REAL_TERMINAL;
  - porsi kegiatan yang melewati SOP relasinya.
- Letak langkah dan garis lintasan = **perkiraan** dari nama titik. Titik yang tidak ada di gambar ditulis "tidak tergambar", tidak ditebak.

### Penyebab › Awak
- **Kartu ringkas:**
  - 264 dinasan KA batubara di 9 UPT crew;
  - porsi dinas malam (22.00–06.00, definisi tampilan);
  - dinasan yang hadir kurang dari 60 menit sebelum berangkat;
  - dinasan paling berisiko molor (perkiraan).
- **Beban per UPT crew:** jam dinas per hari, siang/malam. Klik UPT untuk menyaring semua grafik dan tabel.
- **Peta panas jam bertugas** per UPT × jam.
- **Sebar jam dinas program vs perkiraan P85:** perkiraan = program + keterlambatan datang KA yang sama dari REAL_PERJALANAN.
  - Hanya dinasan yang ujung lintas dinasnya = stasiun tujuan KA: 85 terhubung.
  - 103 dinasan berganti awak di tengah perjalanan, sehingga keterlambatan di titik ganti tidak tercatat.
- **Daftar dinasan menurut risiko molor.**
- **Batas maksimal jam dinas belum ada di DB.** Status "melewati batas" baru aktif setelah regulasi dikirim.

### Penyebab › Gangguan KA batubara (dibuat ulang)
- **Kartu ringkas:**
  - kejadian dan menit;
  - laju per 100 perjalanan KA batubara (REAL_PERJALANAN tidak batal);
  - porsi datang melewati toleransi untuk perjalanan pada hari gangguan, dibanding perjalanan lain;
  - kelas terbesar.
- **Grafik:**
  - laju per bulan;
  - kalender harian;
  - peta strip sepanjang 5 lintas batubara (km M_STASIUN; petak = tengah kedua ujung);
  - Pareto kelas yang dapat diturunkan ke subgangguan;
  - daftar per lintas.
- **Semua saling menyaring:** bulan, tanggal, lintas, kelas dan subgangguan.

### Skenario: pola perputaran rangkaian
- **Batas waktu rangkaian di terminal = SOP kontrak PROGRAM_KA** (pra + inti + pasca) untuk KA isi pasangan PRG_SIKLUS:
  - muat memakai KA isi yang berangkat;
  - bongkar memakai KA isi yang datang;
  - SOP ganda: pilih **Terpendek** atau **Terpanjang**;
  - KA tanpa SOP memakai WTT program (label "tanpa SOP");
  - bila DB Batubara belum disinkron, batas = WTT program terpendek di terminal (seperti sebelumnya).
- **Garis penghubung di baris terminal** muncul untuk KA tersaring atau terpilih, atau semua bila dicentang. Garis ditarik dari KA datang ke KA berangkat lagi:
  - pita = batas SOP, tanda tegak = rangkaian siap;
  - hijau = tersambung;
  - oranye = jadwal program lebih pendek dari SOP;
  - merah = tidak tersambung, karena KA berikutnya terlambat menunggu rangkaian.
- **Tabel "Pola perputaran rangkaian di terminal":** datang dan berangkat (rencana → simulasi), lama di terminal, batas, status.
- **Rangkaian bila terlambat:**
  - **Tetap** (bawaan, mengikuti PRG_SIKLUS);
  - **Tukar**: rangkaian lain dengan kelompok & relasi KA datang yang sama, yang siap paling awal di terminal itu, mengisi slot. Garis putus-putus, berlabel "tukar".
- Skenario tanpa perubahan tetap = GAPEKA persis.
- Pilihan tersimpan di tautan (`sop=maks`, `tk=1`).

## Sistem visual terpadu (seluruh web app)
- **Tema grafik:** satu gaya garis, batang, titik, tooltip, penggeser dan legenda.
- **Interaksi di semua grafik:**
  - seri lain meredup saat satu seri diarahkan;
  - transisi halus saat saringan berubah;
  - tooltip tetap di dalam grafik.
- **Tooltip sumbu waktu:** nilai per seri + ▲▼ dibanding bulan/tanggal sebelumnya, + keterangan sumber dari subjudul kartu.
- **Tabel:**
  - kolom nama bertitik minimum (layar ≥ 720 px);
  - angka tabular rata kanan;
  - baris berselang;
  - teks panjang dibatasi.
- **Garis mini (sparkline):** kolom "Tren 12 bulan" di tabel wilayah.
- **Kartu KPI terangkat saat diarahkan.** Gerak dimatikan bila perangkat meminta gerak dikurangi.

## Uji
- `npm run check` lulus.
- `test:emu STRICT` 0 galat konsol.
- Lulus juga: sim (+ perputaran SOP, tukar rangkaian, emplasemen), gapeka, switch, pulau, akses, alur, bq, mutu, rhi.
- Data sintetis emulator kini memuat emplasemen & alur sintetis (bukan gambar asli).
