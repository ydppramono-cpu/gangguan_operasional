/**
 * 06_Api.gs — satu-satunya fungsi yang dipanggil browser lewat google.script.run.
 * Akses terbuka (keputusan 15 Okt 2026: tanpa kode akses/RBAC). Semua mengembalikan { ok:true, ... } atau { ok:false, error }.
 */
function guard_(fn) {
  try { return fn(); }
  catch (e) { return { ok: false, error: String(e && e.message || e) }; }
}

function snapshotOrError_() {
  var p = Store.pointer();
  if (!p) throw new Error('Data belum tersedia. Pemilik app perlu menjalankan setupOtomatis() sekali dari editor.');
  if (!p.meta || p.meta.schema !== CONFIG.SCHEMA) {
    throw new Error('Data sedang disiapkan untuk versi aplikasi baru (otomatis ±15 menit). Pemilik app bisa mempercepat dengan menjalankan syncNow() dari editor.');
  }
  return p;
}

/** Data inti (tanpa uraian) untuk semua halaman. */
function apiBootstrap() {
  return guard_(function () {
    var p = snapshotOrError_();
    return { ok: true, meta: p.meta, status: getStatus_(), core: Store.payload('core'), config: clientConfig_() };
  });
}

/** Uraian kejadian lengkap + tindak lanjut (dimuat terpisah setelah layar pertama tampil). */
function apiNarratives(version) {
  return guard_(function () {
    var p = snapshotOrError_();
    if (version && p.version !== version) return { ok: false, stale: true, error: 'Data baru tersedia. Muat ulang halaman.' };
    return { ok: true, version: p.version, narr: Store.payload('narr') };
  });
}

/** Data referensi: stasiun, petak, KA, JPL, armada, jadwal (dimuat paralel di latar belakang). */
function apiRef(version) {
  return guard_(function () {
    var p = snapshotOrError_();
    if (version && p.version !== version) return { ok: false, stale: true, error: 'Data baru tersedia. Muat ulang halaman.' };
    return { ok: true, version: p.version, ref: Store.payload('ref') };
  });
}

function apiStatus() {
  return guard_(function () {
    var p = Store.pointer(), log = [];
    try { log = JSON.parse(PropertiesService.getScriptProperties().getProperty('CHANGELOG') || '[]'); } catch (e) { log = []; }
    return { ok: true, version: p && p.version, builtAt: p && p.meta && p.meta.builtAt, schemaOk: !!(p && p.meta && p.meta.schema === CONFIG.SCHEMA),
      status: getStatus_(), changelog: log };
  });
}

/** Konfigurasi yang aman dibagikan ke browser (tanpa ID sumber). */
function clientConfig_() {
  return {
    appName: CONFIG.APP_NAME, appVersion: CONFIG.APP_VERSION, rule: CONFIG.RULE_VERSION,
    componentRule: CONFIG.COMPONENT_RULE_VERSION, heavy: CONFIG.THRESHOLD_HEAVY_MIN, top: CONFIG.THRESHOLD_TOP_MIN,
    smallBase: CONFIG.SMALL_BASE, ageWarn: CONFIG.AGE_WARN_YEARS, jplKm: CONFIG.JPL_MATCH_KM, rate: CONFIG.RATE_PER_HOUR, classMeta: CLASS_META,
    crossing: CROSSING_RULES.map(function (c) { return { id: c.id, label: c.label }; }),
    components: COMPONENT_RULES.map(function (c) { return { id: c.id, label: c.label, re: String(c.re) }; })
      .concat([{ id: 'lain', label: 'Lainnya', re: '' }]),
    classRules: CLASS_RULES.map(function (r) { return { kelas: r.kelas, kategori: r.kategori || [], sub: r.sub ? String(r.sub) : '', catatan: r.catatan || '' }; })
  };
}
