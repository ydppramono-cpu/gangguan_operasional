/**
 * 08_Setup.gs — fungsi yang dijalankan pemilik app dari editor (menu ▶ Jalankan).
 * Pertama kali (atau setelah menempel versi baru): setupOtomatis() → Terapkan → Kelola deployment → Edit → Versi baru.
 */

/** Sekali jalan: pemicu sinkron tiap 15 menit + bangun snapshot sekarang (termasuk membuat Master tambahan JPL/jadwal). */
function setupOtomatis() {
  installTrigger();
  var r = runSync_(true, 'setup');
  console.log(JSON.stringify(r));
  if (!r.ok) throw new Error(r.message);
  console.log('Selesai. Master tambahan (JPL & jadwal): https://docs.google.com/spreadsheets/d/' +
    PropertiesService.getScriptProperties().getProperty('EXTRA_SPREADSHEET_ID') +
    '\nLangkah berikut: Terapkan → Kelola deployment → ✏️ Edit → Versi: "Versi baru" → Terapkan (URL /exec tetap sama).');
}

/** Bangun snapshot sekarang (abaikan pemeriksaan perubahan). */
function syncNow() { console.log(JSON.stringify(runSync_(true, 'editor'))); }

/** Pasang satu pemicu waktu (menghapus pemicu lama milik fungsi yang sama). */
function installTrigger() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'syncScheduled_') ScriptApp.deleteTrigger(t);
  });
  ScriptApp.newTrigger('syncScheduled_').timeBased().everyMinutes(Number(CONFIG.SYNC_EVERY_MINUTES)).create();
}

/** Diagnostik cepat dari editor. */
function showStatus() {
  var p = Store.pointer();
  console.log(JSON.stringify({ version: p && p.version, schema: p && p.meta && p.meta.schema, rows: p && p.meta && p.meta.rows,
    ref: p && p.meta && p.meta.refCounts, status: getStatus_(), masterTambahan: PropertiesService.getScriptProperties().getProperty('EXTRA_SPREADSHEET_ID') }, null, 2));
}

/** Bersihkan sisa versi 2 (kode akses & sesi) — aman dijalankan kapan saja. */
function bersihkanSisaV2() {
  var p = PropertiesService.getScriptProperties();
  ['ACCESS_CODES', 'ACCESS_SALT'].forEach(function (k) { p.deleteProperty(k); });
  console.log('Kode akses v2 dihapus. Spreadsheet log akses lama (jika ada) boleh dihapus manual dari Drive.');
}
