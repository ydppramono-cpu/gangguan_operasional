# Uji end-to-end tanpa Google (emulator Apps Script)

Menjalankan pipeline server **apa adanya** (`src/*.gs`: runSync_ → Store → apiBootstrap/apiRef/apiNarratives/apiGapeka26)
di Node dengan tiruan SpreadsheetApp/DriveApp/CacheService/PropertiesService/Utilities/LockService,
lalu membuka **Index.html gabungan** di Chromium (Playwright) dengan `google.script.run` tiruan.

Data: **sintetis** — kosakata kolom & nilai mengikuti tab asli (Gangguan_Induk, THI, RHI, WKP, Passenger, Freight),
stasiun/petak/KA dari ekstraksi GAPEKA 2026, sarana dari `db/gapeka2026/sarana_unit_2026.csv`. Angka di tangkapan layar BUKAN data nyata.

```bash
npm i echarts@5.6.0 tabulator-tables@6.3.1 alpinejs@3.17.4   # sekali, di folder ini (CDN dialihkan ke salinan lokal)
G26_DIR=/jalur/ke/g26 node emu.js        # → api.json (hasil fungsi api*)
python3 build.py                          # → app.html (Index gabungan + server tiruan)
W=1440,400 node shoot.js                  # semua menu; atau: node shoot.js ringkasan,tren
```
Laporan: galat JS/Alpine per halaman, scroll horizontal, elemen keluar layar, teks NaN/undefined; tangkapan layar di `shots/`.
