# Ringkasan rilis v3.18.0 — peta koridor, grafik Marey dihapus, grafik Armada baru, penyegaran tampilan

Tanggal: 23 Nov 2026 · SCHEMA 15 (snapshot & referensi dibangun ulang otomatis). **Wajib tempel ulang SeedPeta.gs** (koordinat KTG).

## 1. Peta koridor & stasiun bernama sama
- **Akar masalah**: Ketapang KTG (Banyuwangi, Daop 9) memakai koordinat Ketapang KTP (Lampung, Divre 4) karena sumber koordinat
  digabung menurut nama. Peta "Lintas timur Jawa" melebar ke Sumatera dan menggambar garis putus Ketapang–Jember lintas laut.
- Koreksi terdokumentasi `db/sumber/koreksi_koordinat_stasiun.csv`: KTG = −8,1455; 114,3974 (ujung timur geometri OSM
  "Jalur Kereta Api Kalisat–Ketapang"). Diterapkan ke `src/18_SeedPeta.gs` dan `db/csv/master_stasiun.csv` oleh
  `tools/peta/koreksi_koordinat.py` (kini juga memperbarui master + sha256 manifest).
- Uji koordinat masuk `npm run check`: pulau sesuai wilayah, tidak ada dua kode berkoordinat identik (seed & master),
  jarak ke tetangga rute ≤ 30 km.
- Pencocokan nama stasiun di ETL (`01_Domain.gs`): nama kembar (Ketapang KTG/KTP, Larangan LR/LRA, Karangsari, Gedangan,
  Serdang, …) tidak lagi saling menimpa; diputus dengan wilayah kejadian (sama wilayah → sama pulau); bila tetap ganda: kosong,
  tidak menebak. (Perubahan ini ditemukan belum ter-commit di salinan kerja 23 Nov 17.29–17.31, ditinjau, lalu dirilis.)
- Peta koridor: petak tanpa geometri OSM hanya digambar garis lurus bila jarak lurus ≤ maks(15 km, 3 × panjang petak);
  selebihnya tidak digambar dan disebut di catatan bawah peta.

## 2. Grafik perjalanan (Marey) dihapus
- Menu, tab Rute (kartu Marey), mesin gambar, dan uji Marey dihapus. Data GAPEKA tetap (switch global, KA lewat, profil):
  modul `Js.Gapeka` (KAIG). `npm run test:marey` → `npm run test:gapeka` (seed terbaca, jam tidak mundur, km urut).
- Ruang kerja "Operasi & pendapatan" → **Pendapatan**. Tautan lama `?page=gapeka` dibuka di Wilayah & koridor → Rute.

## 3. Grafik Armada
- Ringkasan: area bergradasi (kejadian/bulan, penanda bulan tertinggi) + garis putus menit per kejadian; **treemap** kelompok komponen.
- Kesehatan: status RHI → **batang 100% bertumpuk** (armada vs saat gangguan); kondisi per tipe → **gelembung kuadran**
  (x RHI rata-rata, y gangguan/100 unit, ukuran = unit, warna = porsi Monitor+Declining, garis median).
- Depo: **lollipop** dengan warna rentang berlegenda. Distribusi skor/usia (kereta/gerbong): batang membulat bergradasi + garis laju.

## 4. Tampilan & keseragaman
- Token baru: tinggi kontrol 34/32 px, baris tabel 40 px, kepala tabel 36 px, radius kontrol 9 px; tabel biasa & Tabulator setara.
- Menu samping bergradasi, item 42 px berpenanda pil + garis oranye; bilah atas tembus pandang (blur); kotak cari membulat.
- Kartu: satu radius, garis lembut, bayangan halus, kartu yang bisa diklik terangkat saat diarahkan.
- Ponsel: KPI 2 kolom. Penghitung "Menampilkan n baris" hanya pada tabel berhalaman.

## Uji
check (+ uji koordinat) · emu 20/20 bersih (desktop & 400 px) · switch · gapeka · bq · akses · pulau · alur — LULUS.
