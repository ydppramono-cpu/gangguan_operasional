# Rilis v3.14.0 — 19 Nov 2026 (audit backend & UI, alur umum → rinci)

## Backend
- **Keamanan fungsi editor.** `setupOtomatis`, `syncNow`, `installTrigger`, `showStatus`, `bersihkanSisaV2`, `ujiKondisiBq` sebelumnya dapat dipanggil pengunjung anonim lewat `google.script.run` (web app ANYONE_ANONYMOUS). Kini semuanya memanggil `pemilik_()` dan menolak pemanggil yang bukan pemilik skrip.
- `include(name)` hanya menerima nama parsial baku (`Index`, `Css.*`, `Ui.*`, `Js.*`, `View.*`, `Part.*`).
- Label sumber jadwal mengikuti switch GAPEKA global (rute KA "Daftar Waktu GAPEKA 20xx", KA per jam di kartu unit, perjalanan harian koridor, paparan lalu lintas di temuan). Master stasiun/petak/LIST KA tetap GAPEKA 2025 dan disebut begitu. Teks Metodologi tentang GAPEKA 2026 diperbarui.
- Label lokasi stasiun tidak menggandakan awalan ("Sta. Stasiun …").

## Tampilan
- Gaya lebih tenang: garis warna tebal di sisi kartu angka → penanda kecil di label; latar oranye kartu temuan dihapus; gradien judul ringkasan → warna rata; emoji di chip rujukan dihapus; efek melayang kartu dihapus.
- Tautan (wilayah, lokasi, KA di detail kejadian; lokasi di tabel) bergaris bawah titik.
- Tabel kejadian: sel kosong "–" (tooltip "Tidak tercatat"); kolom Kejadian tanpa pengulangan "KA 123 (nama)" (teks lengkap di tooltip).
- Wilayah & koridor: tabel lokasi muat di kartu (frekuensi/menit menempel pada nama, nama panjang terlipat); tabel lintas kosong diberi keterangan.
- Detail kejadian: tabel "di lokasi/KA yang sama" tidak terpotong.
- **Cari & profil**: tanpa kata kunci kini menampilkan 5 lokasi, KA, dan sarana dengan kelambatan terbesar di periode aktif sebagai titik masuk ke profil.

## Uji
- `npm run check` lulus; `test:emu` 22 menu × lebar tanpa galat/gulir samping/NaN; `test:switch` LULUS; `test:marey` 2025 (63/2.440) & 2026 (64/2.530) 0 gagal; `test:bq` LULUS.
- Baru: `test:akses` — 15 fungsi publik terklasifikasi (9 API terbuka, 6 fungsi editor menolak anonim); `test:alur` — 13 klik Ringkasan → Telusuri → Kejadian → Profil → Kembali, Wilayah → lokasi, Cari → KA, Sarana → kartu unit.
- Emulator memakai nama stasiun asli dari `db/csv/master_stasiun.csv`; tangkapan layar kini tersimpan di `tests/emulator/shots/`.

## Data
- Tidak ada perubahan skema atau tab Sheets. Basis data tidak disentuh.
