# Ringkasan rilis v3.17.0 — tata ulang: 5 ruang kerja, filter kontekstual + tautan, tab dirampingkan

Sesuai keputusan pemilik 23 Nov 2026 (navigasi 5 ruang kerja · halaman bertab dirampingkan · filter kontekstual + tautan).
SCHEMA tetap 14; data dan isi laporan PPT/PDF/Excel tidak berubah.

## Navigasi
- Menu samping 9 butir → **5 ruang kerja**: Ringkasan (Eksekutif · Tren & pola) · Jaringan & prasarana (Wilayah & koridor ·
  Perlintasan & JPL) · Armada (Sarana & armada) · Operasi & pendapatan (Pendapatan terekspos · Grafik perjalanan) · Telusuri.
- Halaman anggota tampil sebagai **sub-navigasi** di kepala halaman; ruang kerja membuka halaman terakhir yang dibuka di dalamnya.
- Metodologi & sumber pindah ke kaki menu samping. Cari dan Unduh tetap di kepala halaman. Tautan lama (`?page=…`) tetap berlaku.

## Filter kontekstual + tautan
- Baris filter: Periode · **Jam & kelas** (panel; angka = filter aktif) · Pembanding (hanya di halaman yang membandingkan) · Wilayah ·
  chip filter aktif yang bisa dihapus (×) · atur ulang · **salin tautan**.
- Filter disembunyikan di halaman yang tidak memakainya (Grafik perjalanan, Metodologi, Unduh, Cari, detail kejadian).
- **URL menyimpan tampilan**: halaman, tab (Armada/Wilayah), periode (`ym` atau `d0`–`d1`), wilayah `w`, kelas `k`, pembanding `cmp`,
  jam `h`. Nilai dari URL divalidasi bentuknya; yang tidak sah diabaikan. Tombol salin tautan memakai alamat /exec dari server
  (`config.url`).

## Kartu pengulang angka dihapus
- Ringkasan → Eksekutif: 4 kartu per kelas (angkanya sama dengan baris "Menit …" pada tabel perbandingan; baris itu kini bisa diklik
  untuk menelusuri kelas).
- Ringkasan → Tren & pola: 4 kartu per kelas (sama dengan tabel di Eksekutif).
- Armada → Ringkasan: kartu "Armada" (sama dengan kartu jenis). Grafik "Gangguan & durasi per bulan" kini lebar penuh tepat
  di bawah kalimat inti dan 3 angka, lalu daftar unit berulang.

## Uji
check · emu 22/22 bersih (desktop & 400 px) · switch · marey · bq · akses · pulau · alur — LULUS.
