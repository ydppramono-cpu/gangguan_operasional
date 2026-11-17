# Kebijakan data

Kebijakan ini disalin dari tab **Skema** spreadsheet *KAI | Basis Data Gangguan dan Hambatan 2025–2026* pada 16 Nov 2026. Yang berlaku adalah isi tab Skema; bila berbeda, ikuti tab Skema.

| Kebijakan | Aturan | Rincian |
|---|---|---|
| Satu sumber tampilan | Gangguan_Induk adalah SSOT dashboard | Sumber Google dan arsip Excel hanya hulu/audit |
| Kesetaraan metrik | Durasi hambatan = Total Andil Kelka | Kolom W adalah satu-satunya angka durasi dashboard |
| Kesetaraan kejadian | Hambatan = gangguan | Tidak ada dashboard Jasum terpisah |
| Keutuhan sumber | Nilai mentah tetap di Google hulu dan arsip Jasum; U utuh, W sama dengan sumber | Field A:W yang awalnya kosong boleh diisi dari bukti tegas; AB menyimpan hash nilai mentah |
| Kecocokan lintas sumber | Kandidat ganda perlu verifikasi | Jangan menggabung kejadian hanya karena tanggal/wilayah sama |
| Pembaruan | Google dan tab arsip Jasum dibaca terjadwal | Suntingan workbook Excel luar tidak masuk otomatis sampai diimpor |
| Rumus alamat | AD = HYPERLINK + MATCH kunci impor | Jangan tulis URL statis per baris |
| Agregat Excel | REKAP asli tetap di workbook | Total regional berbeda granularitas, bukan kejadian baru |
| Constraint data | AA unik; menit negatif/tidak numerik dan tanggal ganjil ditandai, tidak dihapus | Skema yang berubah atau kunci asal ganda menghentikan publikasi snapshot |
| Pemulihan | Snapshot dashboard terakhir dipertahankan bila ETL gagal | Cadangan pra-migrasi 8 Okt 2026; status sinkronisasi wajib dipantau |
| Peninjauan ekstraksi | Kandidat ganda atau lemah tidak diisi otomatis | Admin memverifikasi dari U dan AD |

## Tambahan untuk platform data (16 Nov 2026)
- **Jejak sumber.** Setiap tabel turunan wajib punya jejak sumber: berkas, tab/halaman, baris, dan SHA-256 nilai sumber, atau keterangan sumber di README tabel.
- **Cadangan sebelum menulis.** Setiap penulisan massal ke database harus didahului cadangan. Contoh: pemulihan Passenger/Freight 12 Nov 2026, dengan cadangan di Drive "BACKUP sebelum pemulihan angka Passenger-Freight 2026-11-12".
- **Hak tulis.** Hanya pemilik dan tim yang ditunjuk yang menulis ke `02_DB_Database`. Jalur DBeaver bersifat **baca saja** (view BigQuery dan cermin CSV), sehingga analis tidak dapat mengubah data dari DBeaver.
- **Pembaruan JASUM.** Pembaruan DB JASUM dilakukan pengguna lewat ChatGPT. Setelah itu, sinkronisasi web app dan cermin berjalan otomatis.
- **Lisensi.**
  - Geometri peta: © kontributor OpenStreetMap (ODbL).
  - Garis pantai: Natural Earth (domain publik).
  - Koordinat stasiun berasal dari 4 repositori terbuka (lihat `ref_stasiun_koordinat`).
