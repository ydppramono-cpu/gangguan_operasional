---
description: Kerjakan satu fitur web app dari mockup sampai rilis-siap, mengikuti CLAUDE.md dan KAIDAH_KODING.
argument-hint: <deskripsi fitur>
---
Fitur: $ARGUMENTS
1. Baca `CLAUDE.md`, `docs/KAIDAH_KODING.md`, `docs/KONTRAK_DATA.md` dan berkas yang terkait.
2. Tulis rencana singkat: data yang dipakai (tabel + kolom), berkas yang diubah, risiko. Bila keputusan desain belum jelas, tanyakan dengan 2–3 alternatif.
3. Server dulu (fungsi murni bisa diuji di Node), lalu tampilan. Validasi masukan di server dengan daftar tertutup.
4. Tambah/ubah uji di `tests/` bila perilaku baru bisa diuji.
5. Jalankan `/uji`, perbaiki, lalu ringkas perubahan per berkas.
