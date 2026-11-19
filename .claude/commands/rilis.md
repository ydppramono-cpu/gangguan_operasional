---
description: Siapkan rilis versi baru web app (versi, catatan, paket tempel GAS, commit).
argument-hint: <versi, mis. 3.13.0>
---
Rilis versi $ARGUMENTS:
1. Pastikan `/uji` lulus.
2. Naikkan `CONFIG.APP_VERSION` di `src/00_Config.gs` dan `version` di `package.json`. Naikkan `CONFIG.SCHEMA` hanya bila bentuk snapshot berubah.
3. Tulis `knowledge/rilis/ringkasan_rilis_v$ARGUMENTS.md`: Baru, Perbaikan, Data, Uji, Cara tempel. Fakta saja; angka harus bisa ditelusuri.
4. `npm run pack`; perbarui `dist/CARA_TEMPEL.txt` (berkas mana yang berubah).
5. Commit dengan pesan Indonesia ringkas, push ke `main`.
6. Sebutkan berkas di `dist/` yang harus diunggah ke Drive `04_CODE/GAS_tempel_v$ARGUMENTS` dan langkah Deploy → New version.
