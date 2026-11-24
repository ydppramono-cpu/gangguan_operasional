# Ringkasan rilis v3.21.1 — 24 Nov 2026

Permintaan pemilik (24 Nov 2026, 15.32):

1. **Satuan tidak disingkat** di seluruh tampilan web:
   - durasi `4 j 37 m` menjadi `4 jam 37 menit`;
   - `mnt` dan tanda `′` / `'` untuk menit menjadi `menit`;
   - tonase `t` menjadi `ton`.

   Laporan PPT tidak diubah; tetap memakai konvensi laporan.

2. **Saring nama KA di GAPEKA:**
   - Papan skenario punya kolom "Saring KA" (nomor atau nama, mis. "Sindang Marga"). KA yang cocok ditebalkan dan diberi label nomor + nama, garis lain diredupkan, dan muncul chip untuk memilih. Saringan tersimpan di tautan (`q`).
   - Formulir perubahan menerima nama KA. Nama yang cocok dengan beberapa KA memunculkan daftar nomornya.
   - Rute → "KA yang melewati koridor" juga bisa disaring menurut nomor atau nama.

Uji: `npm run check`, `test:emu` STRICT (galat 0, temuan kerapian 0), `test:sim`, `test:switch`, `test:akses`, `test:alur` — LULUS.
