# Bank Kepintaran — Dashboard Gangguan Operasional KAI

Dokumen ini adalah titik masuk untuk Claude, ChatGPT, dan anggota tim. Bacalah dokumen ini sebelum menjawab pertanyaan tentang data gangguan, GAPEKA, sarana, prasarana, atau web app.

## Aturan menjawab (wajib)
1. **Jangan mengarang angka.** Setiap angka harus berasal dari salah satu sumber berikut:
   - tabel database (lihat `04_SUMBER_DATA.md`);
   - dokumen di folder `sumber_teks/`, dengan menyebut nama berkas dan halamannya (`=== Halaman N ===`);
   - catatan rilis di `rilis/`.

   Bila sumbernya tidak ada, tulis "belum ada data".
2. **Satu sumber kebenaran (SSOT).**
   - Angka gangguan dan kelambatan berasal dari tab `Gangguan_Induk`, kolom *Total Andil Kelka (menit)*.
   - Tab dan berkas lain hanya hulu atau audit (lihat `03_KEBIJAKAN_DATA.md`).
3. **Sebut periode dan versi.** Contohnya "Okt 2026, data Gangguan_Induk 5 Nov 2026", atau "GAPEKA 2025 (berlaku s.d. 30 Nov 2026)". GAPEKA 2026 berlaku mulai 1 Des 2026.
4. **Bedakan jenis angka.** Pisahkan dengan jelas *realisasi*, *jadwal (GAPEKA)*, *perkiraan/model*, dan *indikator internal*. Contoh indikator internal: skor turunan sarana dan Revenue at Risk tahap 1.
5. **Rumus.** Pakai definisi di `02_DEFINISI_METRIK.md`. Jangan membuat rumus baru tanpa menyebut bahwa itu usulan.
6. **Bahasa.** Pakai Bahasa Indonesia dan istilah operasional KAI (lihat `01_KAMUS_ISTILAH.md`).
7. **Pengetahuan baru.** Temuan, keputusan, atau koreksi baru tidak boleh langsung mengubah dokumen ini. Catat dulu sebagai usulan di tab `KB_Kontribusi` pada spreadsheet *KAI_Katalog_Data*. Setelah diverifikasi, usulan dipindahkan ke dokumen yang sesuai (lihat `05_LOG_KEPUTUSAN.md`).

## Peta dokumen
| Berkas | Isi |
|---|---|
| `01_KAMUS_ISTILAH.md` | Istilah operasional dan singkatan |
| `02_DEFINISI_METRIK.md` | Rumus dan ambang yang dipakai web app dan laporan |
| `03_KEBIJAKAN_DATA.md` | Aturan database: SSOT, jejak sumber, koreksi |
| `04_SUMBER_DATA.md` | Daftar tabel, lokasi spreadsheet, BigQuery, CSV cermin |
| `05_LOG_KEPUTUSAN.md` | Keputusan pengguna dan teknis, bertanggal |
| `06_ANGKA_ACUAN.md` | Angka kunci yang sudah diverifikasi (checksum) |
| `rilis/` | Catatan rilis web app v3.6 s.d. v3.10 |
| `sumber_teks/` (di Drive) | Teks berhalaman dari PTDO, KP-DJKA GAPEKA 2025, Malka Rinja, Dinasan O.20, dan laporan bulanan |
| `prompts/` | Instruksi sistem untuk Proyek Claude dan GPT kustom ChatGPT |

## Lokasi
- **Drive:** `KAI_Data_Platform/03_KNOWLEDGE_Bank_Kepintaran`. Salinan teks juga disimpan di repo `gangguan_operasional/knowledge`.
- **Database:** `KAI_Data_Platform/02_DB_Database` (lihat `04_SUMBER_DATA.md`).
