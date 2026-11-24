# Ringkasan rilis v3.19.0 — 24 Nov 2026

Keputusan pemilik 24 Nov 2026:
- temuan sebagai pita di bawah grafik;
- profil berupa hero dengan grafik terhubung;
- tur dan pusat bantuan dibuat sendiri;
- penggolong "selalu pilih kelas terdekat";
- Batubara dikerjakan sebagai gabungan opsi 2+4 (rancangan terpisah).

## Perbaikan yang dilaporkan pemilik
| Masalah | Perbaikan |
|---|---|
| Jalur peta Medan–Kisaran putus | Tebing Tinggi (TBI) tanpa koordinat dan Laut Tador (LTD) salah letak. Koordinat keduanya kini dihitung dari km lembar GAPEKA di graf rel OSM. |
| Koordinat stasiun keliru | Kosambi/Dawuan tertukar. Larangan (LR) lembar Daop 3 dipisah dari LR Daop 4. Tambak (TBK) Divre I dipisah dari TBK Daop 5. Kode kembar disimpan di `SEED_PETA.stP`. |
| Jalur peta berupa garis lurus | 24 petak tanpa geometri kini mengikuti jalur terpendek rel OSM bila panjangnya ±35% dari km GAPEKA (`SEED_PETA.pgGen`). |
| Stasiun/rel di laut | Daratan dibangun ulang dari Natural Earth 1:10m + koridor ±0,9 km di sekitar rel. Titik rel di laut turun dari 91 menjadi 2. Alat: `tools/peta/bangun_daratan.py`. |
| Burger tidak berfungsi | Satu tombol ☰: di layar lebar menciutkan menu, di layar ≤ 1100 px membuka laci. |
| Panah atas/bawah di tab | Gulir vertikal tab dihilangkan. Legenda grafik tanpa panah gulir: membungkus dan pindah baris bila panjang. |
| Depo "Tidak tercatat" & Balai Yasa ikut peringkat | Tabel dibagi tiga golongan: Depo (berperingkat), Balai Yasa, dan unit tanpa depo di SAP. |
| THI Mei→Okt | Jendela THI di dashboard = 3 bulan terakhir. Laporan PPT tetap memakai seluruh data THI. |
| "Belum lengkap" & ukuran label kelas | Tidak ada lagi kelas "belum". Kejadian tanpa Kategori/Subgangguan mendapat kelas dari pola teks judul/uraian; bila tidak tegas, dari kelas terdekat (Naive Bayes kata, dilatih dari kejadian berkelas sumber). Kelas turunan bertanda * dan keyakinannya ada di kolom Kualitas; < 60% masuk daftar periksa. Label kelas seragam 104 × 22 px. |
| "Nomor tidak ada di GAPEKA / frekuensi tak diketahui" | Nomor KA dicocokkan ke KA bernama sama dan searah (relasi dari Laporan Frekuensi). KA fakultatif dipakai bila hari jalannya tercatat di Laporan KA Jalan/Batal. |
| Baris profil kosong | Isian `dl.kv` yang kosong disembunyikan otomatis (`KAI.tidy`) dengan catatan jumlahnya. Baris persinyalan/material yang selalu kosong dihapus. |

## Fitur baru
- **Pita temuan** (`Js.Pita`)
  - Temuan dan tindakan menempel di bawah grafik/tabel sumbernya, terlipat secara bawaan.
  - Klik temuan → kartu disorot; seri grafik ikut disorot bila ada.
  - Ringkasan menampilkan 3 sorotan yang melompat ke grafiknya; daftar lengkap terlipat.
- **Profil**
  - Kepala profil (hero) dengan garis kelambatan 24 bulan, 4 angka periode dalam satu strip, dan temuan terlipat.
  - Tab Riwayat: grafik bulan, komposisi kelas (donat), pola jam, dan jenis teratas saling menyaring (saring silang) bersama tabel riwayat.
- **Bantuan** (`Js.Help`, `View.Help`)
  - Tombol "?" (juga tombol papan ketik ?) membuka laci berisi Mulai cepat, Panduan per ruang kerja, Alur klik, Glosarium KAI, dan FAQ.
  - Tur sorotan per halaman, otomatis sekali pada kunjungan pertama.
  - Tombol ⓘ pada kartu yang judulnya dikenali.
- **Pemeriksa kerapian**
  - `tests/emulator/shoot.js` kini menelusuri semua tab.
  - Yang diperiksa: teks sisa ("belum ada data", "belum terkelas"), tab bergulir vertikal, label kelas tidak seragam, baris profil kosong, bento tidak rata, dan isi kartu yang melebar.
  - `STRICT=1` membuat pemeriksaan gagal bila ada temuan.
- **Uji koordinat** (`npm run check`): menambah uji jarak lurus petak lembar GAPEKA ≤ 2,2 × km + 2.

## Beban kognitif
- Ringkasan berkurang dari 1 panel temuan besar (± 1.100 px) menjadi 1 baris sorotan (± 60 px).
- Profil: 4 kartu KPI menjadi 1 strip; temuan terlipat.
- Alur klik umum → rinci: Ringkasan → Sorotan → grafik + pita → kejadian → profil (saring silang).

## Data
Tidak ada penulisan ke Sheets tim. Koordinat dikoreksi lewat `db/sumber/koreksi_koordinat_stasiun.csv` (beralasan dan bersumber) melalui alat. SCHEMA tetap 15.
