---
description: Jalankan semua pemeriksaan sebelum commit (lint, build, emulator semua menu, uji Marey, switch GAPEKA, adaptor BigQuery) dan laporkan galat.
---
Jalankan berurutan dan hentikan di langkah pertama yang gagal:
1. `npm run check`
2. `npm run test:marey`
3. `npm run test:emu` (desktop 1440 dan 400 px). Laporkan per menu: galat JS/Alpine, scroll horizontal, elemen keluar layar, teks NaN/undefined.
4. `npm run test:switch` dan `npm run test:bq`.
5. Buka tangkapan layar menu yang diubah di `tests/emulator/shots/` dan periksa tumpang tindih label, legenda tertutup, tabel melebar.
Ringkas hasil dalam tabel (menu × status). Jangan memperbaiki apa pun tanpa menyebut sebabnya. $ARGUMENTS
