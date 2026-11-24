# Ringkasan rilis v3.20.0 — 24 Nov 2026

**Ruang kerja Batubara — Papan skenario GAPEKA (F1 + sebagian F2).**

Keputusan pemilik 24 Nov 2026:
- gabungan opsi 2+4: app WTT Batubara dipensiunkan bertahap, gangguan tetap dari Gangguan_Induk;
- aturan bila berebut petak bisa dipilih, bawaannya urutan tetap;
- cakupan efek domino: lintas + siklus + terminal + awak;
- skenario disimpan di tautan URL;
- urutan pengerjaan: papan skenario dulu.

## Isi
- **Grafik perjalanan kanvas** per koridor: TMB–Tarahan, TMB–Kertapati, Sukacinta–Kertapati, Lubuk Linggau–Muara Enim.
  - Jendela waktu 00–08/08–16/16–24/24 jam/48 jam.
  - Garis abu-abu = rencana GAPEKA; merah = terdampak; oranye tebal = diubah.
- **Interaksi:**
  - seret garis = geser slot;
  - Shift + seret di stasiun = tahan;
  - formulir tahan/geser/batal;
  - klik KA = tabel rencana vs simulasi per stasiun dengan sebabnya.
- **Mesin efek domino** (`Js.Simulasi`, KAISim): jaringan kejadian–kegiatan, propagasi max-plus, simulasi 2 hari. Batas yang dihitung:
  - waktu tempuh petak dan berhenti;
  - headway jalur ganda;
  - persilangan dan headway jalur tunggal;
  - siklus rangkaian (WTT program terpendek per terminal);
  - nomor KA bersambung di batas Divre (4000 → 4001 di PBRX6);
  - dinasan awak O.20 (GAPEKA 2025).
- **Jalur stasiun** dari M_STASIUN hanya diperiksa, tidak menahan KA.
- **Hasil:** KA terdampak, menit tambahan di tujuan, KA penumpang terdampak, rambatan ke hari berikutnya, stasiun melebihi jalur, rantai sebab-akibat, dan daftar KA terdampak.
- **Mode prioritas:** penumpang > batubara isi > lainnya. Urutan ditukar bila KA prioritas tertahan > 3 mnt; tukar yang membuat kebuntuan dibatalkan.
- **Skenario di URL:** `?page=batubara&kor=TMB-THN&sk=t:4000@TMB:45;g:3100:30;b:3220&urut=p`, divalidasi pola tertutup.
- **Uji ketepatan dasar:** skenario tanpa perubahan = GAPEKA persis, baik untuk 2025 maupun 2026 (`npm run test:sim`). Satu putaran ±100 ms untuk 240 KA × 2 hari.

## Data (tanpa duplikasi)
- Jadwal KA memakai GAPEKA aplikasi (switch global), yang sudah memuat KA penumpang dan KA batubara Sumsel.
- DB Batubara hanya dibaca untuk parameter, lewat salinan `db/sumber/batubara/` → `tools/batubara/build_bb_seed.py` → `db/csv/bb_*.csv` (manifest) + `src/27_SeedBatubara.gs`.
- REAL_GANGGUAN tidak dibaca.
- API baru `apiBatubara()` tanpa masukan.

## Belum (berikutnya)
- **F2 sisa:** batas antrean terminal (jumlah TLS/jalur muat).
- **F3:**
  - uji ulang ke realisasi Rolink (REAL_JEJAK);
  - cari slot kosong untuk KLB;
  - perbandingan 2 skenario.
- **F4:** pindahkan menu WTT lain, lalu app lama pensiun.
