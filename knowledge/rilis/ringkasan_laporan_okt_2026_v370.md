# Web app v3.7.0 — penyelarasan dengan "FIX Laporan Gangguan Operasional Oktober 2026 (Update RHI dan THI terisi)"

Tanggal: 12 Nov 2026 · Aturan K5-2026.11 · Gangguan_Induk ekspor 5 Nov 2026 · THI & WKP dibaca ulang dari database 12 Nov 2026.

## Struktur laporan KAI (52 slide)
- Utama 1–16: Ringkasan · MoM/YoY/YtD · Top 3 · Tren · Matriks · Perlintasan · Peringkat frekuensi & menit (tabel Jan–Okt + kumulatif + Δ peringkat) · Lokasi per daerah · Lokomotif dipantau (+HI 31 Okt) · Sarana berulang (+RHI) · RHI saat gangguan · Daftar pantau · THI × WKP × gangguan per Daop/Divre · Kuadran UPT JR P1–P4 · Eksposur.
- Lampiran: 2025 vs 2026 · Temperan YtD · Wilayah YtD · [Profil Daerah Prioritas] 5 profil · [Rolling-stock Health Index] per tipe, per depo, lokomotif berulang ≥3, komponen · [Track Health Index] 13 Daop/Divre, gangguan prasarana, titik jalan rel & wesel · sumber.

## Definisi (sama di dashboard menu "Kondisi prasarana & sarana" dan unduhan)
- Gangguan prasarana = semua kelas prasarana; JR&wesel = "Jalan Rel – …", track wesel, rel patah/spaten, goyangan, wesel; persinyalan = "Persinyalan/Komunikasi – …".
- WKP jalan rel = rel/las, wesel, bantalan/penambat, geometri; tanggal & wilayah = kolom terverifikasi; melebihi = realisasi > program; andil dari "KA terimbas" (titik = ribuan); realisasi jam akhir < mulai & >12 jam tidak dipakai.
- Resor: stasiun → resornya; petak → stasiun pertama (4 petak diselaraskan dgn acuan: LR-SD 4.2, KPS-SRJ 8.2, TGR-SGJ 9.8, PBR-PBM III.8).
- Prioritas UPT: median THI KAI (83,4); P1 = di bawah median & ≥2 gangguan; P2 = di bawah median & WKP >program ≥5; P3 = di bawah median; P4 = ≥ median & ≥2 gangguan.
- RHI: nilai harian kolom (pulih); unit kejadian = nomor di kolom Nomor sarana yang ada di RHI; status pada tanggal kejadian.
- Komponen sarana KOMP-2 (governor = mesin; generator/control valve/controller = kelistrikan; "per" kata utuh; suling = lainnya).
- Perlintasan: 4 jenis (tanpa "perlintasan ramai"); tabel YtD baris 1 = semua temperan.

## Angka kunci yang identik dengan acuan
RHI: 551 unit, 319/223/9, HI 86,5, reliab 58,3; 32 gangguan lok Okt 13/17/2 (H/M/D), hari-unit 57,5/40,4/2,1%, HI saat terganggu 83,9; per tipe Okt identik; DECLINING 9 unit & ≥3 gangguan (18 unit, 7 teratas) identik.
THI: semua THI wilayah/UPT, UPT <70 (18), median 83,4; gangguan prasarana Mei–Okt per wilayah (n, menit) identik; komponen sarana Okt identik.

## Selisih yang tersisa (dilaporkan ke pengguna)
- Depo lokomotif: v3.7 memakai master Data Sarana (551 unit terpetakan) — acuan memakai depo dari laporan gangguan (250 unit belum tercatat).
- WKP: selisih kecil per wilayah (klasifikasi kegiatan dari teks), mis. Daop 8 Okt 298 vs 314; andil Daop 1 3.375 vs 2.823.
- Kuadran P1 20 UPT vs 21 (pemetaan resor 1.21 PRP); laju gangguan Mei–Okt 244 vs 242.
- Narasi judul/insight dibuat otomatis dari data; tidak identik kata per kata dengan acuan.
