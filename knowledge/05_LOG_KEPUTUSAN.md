# Log keputusan

Format setiap entri: tanggal, keputusan, alasan atau sumber. Entri ditulis paling baru di atas.

| Tanggal | Keputusan | Alasan / sumber |
|---|---|---|
| 17 Nov 2026 | GAPEKA 2026 diekstrak ke `GAPEKA_2026_Basis_Data`; data OCR Sumatera diberi status `terverifikasi`/`periksa` (koreksi hanya bila cocok unik dengan Penomoran, tidak menebak). Grafik perjalanan memakai judul lintas lembar sebagai filter | Arahan pengguna 17 Nov: lanjutkan GAPEKA 2026, diagram Marey sesuai lembar, tanpa elemen bertumpuk |
| 17 Nov 2026 | Akses web app tetap `ANYONE_ANONYMOUS` (siapa pun dengan URL, tanpa login) | Keputusan pengguna: "semua orang bisa akses web app" |
| 17 Nov 2026 | Folder `KAI_Data_Platform` dan proyek GAS web app dipindah ke folder Drive "Web App Gangguan Operasional"; repo kode = GitHub `ydppramono-cpu/gangguan_operasional` | Arahan pengguna 17 Nov |
| 17 Nov 2026 | Standar kode: ESLint + `tools/check_build.py` wajib lulus sebelum `clasp push`; `Index.html` dipecah menjadi parsial `Css/Ui/Js/View/Part` lewat `include()` (hasil gabung identik dengan v3.10.0 kecuali perbaikan lint) | Arahan pengguna: kode sesuai kaidah penulisan yang baik dan benar |
| 16 Nov 2026 | Platform data: Drive pemilik sebagai penyimpanan utama; Sheets sebagai sumber tulis; BigQuery sandbox (Rp0) dan cermin CSV untuk DBeaver; GitHub + clasp untuk kode; bank kepintaran Markdown untuk Claude & ChatGPT | Arahan pengguna: simpan di Drive, tim memakai, pembaruan live, Rp0 |
| 16 Nov 2026 | PTDO tidak diekstrak penuh; masuk LLM sebagai teks berhalaman. Jam tutup stasiun Bab IV tetap jadi tabel | Arahan pengguna |
| 16 Nov 2026 | Berkas GAPEKA 2026 (Lembar, DW, Penomoran, Duksar) diterima. Ekstraksi DW, Penomoran, dan Duksar 2026 menjadi prioritas P1 sebelum 1 Des 2026 | Unggahan pengguna 16 Nov |
| 13 Nov 2026 | Tab Rute jalur: satuan rute = koridor + drill ke KA; profitabilitas = pendapatan saja; peta gratis tanpa API key dan tanpa ubin | Jawaban pengguna |
| 13 Nov 2026 | Sarana dibagi Lokomotif/Kereta/Gerbong; KRL belum dihitung; dinasan memakai proksi dari Duksar | Jawaban pengguna |
| 12 Nov 2026 | Angka Passenger/Freight di DB dipulihkan (dengan cadangan) | Instruksi pengguna "pulihkan di database dan di web app" |
| 12 Nov 2026 | Revenue at Risk tahap 1 (Gross) saja; tahap 2–4 menunggu sign-off lintas fungsi | Best practice manajemen risiko |
| 16 Okt 2026 | Acuan angka = Gangguan_Induk; pendapatan terekspos = jenis KA dari LIST KA × rate bulanan; varian "Imbas" digabung (bisa dipisah) | Keputusan pengguna (Metodologi v3.8) |
| 8 Okt 2026 | Cadangan spreadsheet sebelum migrasi | Tab Skema |

## Cara menambah keputusan
1. Tulis usulan di `KB_Kontribusi` (spreadsheet katalog).
2. Setelah disetujui pemilik, tambahkan baris di tabel atas.
3. Bila keputusan mengubah rumus, perbarui juga `02_DEFINISI_METRIK.md` dan catatan rilis.
