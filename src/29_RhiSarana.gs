/**
 * 29_RhiSarana.gs — RHI kereta & gerbong dari spreadsheet "KAI | RHI Sarana" (keputusan pemilik 25 Nov 2026).
 * ID spreadsheet di Script Properties RHI_DB_ID (bukan di kode). Hanya dibaca.
 * Sumber tab (dibangkitkan tools/rhi/build_rhi.py): RHI_Kereta_Bulanan, RHI_Gerbong_Bulanan — satu baris = satu unit satu bulan,
 * status_harian = satu huruf per tanggal (H/M/D/P/C/-). Kereta harian lengkap (tab RHI_Kereta) tidak dibaca web app (berat; untuk tim/DBeaver).
 * Lokomotif tetap dari tab RHI basis data utama (15_Kondisi.gs).
 * Keluaran snapshot (gzip+base64, berkas Drive app + CacheService), dimuat browser saat perlu (apiRhiSarana):
 *   { v, built, sourceUpdated, db, cols: [...], rows: [[jenis 'K'|'G', nomor, tipe, bulan, dipo, daop, hari, hiAkhir, hiRata, hiMin,
 *     statusAkhir 'H'|'M'|'D'|'P'|'C', rams, mi, ci, tglAkhir, statusHarian], ...] }
 */
var RhiS = (function () {
  var SCHEMA = 1, TZ = 'Asia/Jakarta', TABS = ['RHI_Kereta_Bulanan', 'RHI_Gerbong_Bulanan'];
  var COLS = ['jenis', 'nomor', 'tipe', 'bulan', 'dipo', 'daop', 'hari', 'hiAkhir', 'hiRata', 'hiMin', 'statusAkhir', 'rams', 'mi', 'ci', 'tglAkhir', 'statusHarian'];
  var ST = { HEALTHY: 'H', MONITOR: 'M', DECLINING: 'D', POOR: 'P', CRITICAL: 'C' };
  function props() { return PropertiesService.getScriptProperties(); }
  function pointer() { var s = props().getProperty('RHI_POINTER'); if (!s) return null; try { var p = JSON.parse(s); return p.schema === SCHEMA ? p : null; } catch (e) { return null; } }
  function num(v) { if (v === '' || v == null) return null; var x = Domain.number(v); return x.ok && x.value >= 0 && x.value <= 100 ? Math.round(x.value * 100) / 100 : null; }
  function ymOf(v) { if (Object.prototype.toString.call(v) === '[object Date]') return Utilities.formatDate(v, TZ, 'yyyy-MM'); var m = /^(\d{4})-(\d{2})/.exec(String(v)); return m ? m[1] + '-' + m[2] : ''; }
  function dayOf(v) { if (Object.prototype.toString.call(v) === '[object Date]') return Utilities.formatDate(v, TZ, 'yyyy-MM-dd'); var m = /^(\d{4}-\d{2}-\d{2})/.exec(String(v)); return m ? m[1] : ''; }

  /** Baris tab bulanan → baris ringkas. Fungsi murni (diuji di Node). */
  function rowsOf(values) {
    if (!values || values.length < 2) return [];
    var h = values[0].map(function (x) { return String(x).trim(); }), I = {};
    ['jenis_sarana', 'nomor_sarana', 'tipe_sarana', 'bulan', 'dipo', 'daop', 'hari_data', 'healthy_index_akhir', 'healthy_index_rata', 'healthy_index_min',
      'healthy_status_akhir', 'rams_index', 'maintenance_index', 'condition_index', 'tgl_akhir', 'status_harian'].forEach(function (k) { I[k] = h.indexOf(k); });
    if (I.nomor_sarana < 0 || I.bulan < 0 || I.status_harian < 0) throw new Error('Kolom RHI bulanan tidak lengkap (nomor_sarana, bulan, status_harian).');
    var out = [], seen = {};
    for (var i = 1; i < values.length; i++) {
      var r = values[i], no = Domain.txt(r[I.nomor_sarana]).toUpperCase().replace(/\s+/g, ''), ym = ymOf(r[I.bulan]); if (!no || !ym) continue;
      var j = Domain.txt(r[I.jenis_sarana]).toUpperCase().charAt(0), k = j + no + ym;
      if (seen[k]) throw new Error('Baris ganda RHI ' + no + ' ' + ym + '; snapshot lama dipertahankan.');
      seen[k] = 1;
      out.push([j, no, Domain.txt(r[I.tipe_sarana]), ym, Domain.txt(r[I.dipo]), Domain.txt(r[I.daop]), Number(r[I.hari_data]) || 0,
        num(r[I.healthy_index_akhir]), num(r[I.healthy_index_rata]), num(r[I.healthy_index_min]), ST[Domain.txt(r[I.healthy_status_akhir]).toUpperCase()] || '',
        num(r[I.rams_index]), num(r[I.maintenance_index]), num(r[I.condition_index]), dayOf(r[I.tgl_akhir]), Domain.txt(r[I.status_harian]).toUpperCase().replace(/[^HMDPC-]/g, '-')]);
    }
    return out;
  }

  function sync(force) {
    var id = cfg_('RHI_DB_ID');
    if (!id) return { ok: true, changed: false, message: 'RHI_DB_ID belum diisi; RHI kereta & gerbong belum tampil.' };
    var upd = DriveApp.getFileById(id).getLastUpdated().getTime(), old = pointer();
    if (!force && old && old.sourceUpdatedMs >= upd) return { ok: true, changed: false };
    var ss = SpreadsheetApp.openById(id), rows = [], counts = {};
    TABS.forEach(function (t) { var sh = ss.getSheetByName(t), v = sh ? sh.getDataRange().getValues() : []; var r = rowsOf(v); counts[t] = r.length; rows = rows.concat(r); });
    if (old && old.n && rows.length < old.n * 0.8) throw new Error('Baris RHI kereta/gerbong turun dari ' + old.n + ' ke ' + rows.length + '; snapshot lama dipertahankan.');
    var version = Utilities.formatDate(new Date(), TZ, 'yyyyMMdd-HHmmss');
    var b64 = Store.gzB64({ v: version, cols: COLS, rows: rows });
    var file = Store.writeBlob('rhikg-' + version + '.b64', b64); Store.cachePut('rhikg:' + version, b64);
    var p = { schema: SCHEMA, version: version, built: Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd HH:mm'), sourceUpdatedMs: upd,
      sourceUpdated: Utilities.formatDate(new Date(upd), TZ, 'yyyy-MM-dd HH:mm'), file: file, n: rows.length, counts: counts, db: ss.getName() };
    props().setProperty('RHI_POINTER', JSON.stringify(p));
    if (old && old.file) { try { DriveApp.getFileById(old.file).setTrashed(true); } catch (e) { /* abaikan */ } }
    return { ok: true, changed: true, version: version, counts: counts };
  }

  function payload() {
    var p = pointer(); if (!p) return null;
    var b64 = Store.cacheGet('rhikg:' + p.version);
    if (!b64) { b64 = DriveApp.getFileById(p.file).getBlob().getDataAsString(); Store.cachePut('rhikg:' + p.version, b64); }
    return { version: p.version, built: p.built, sourceUpdated: p.sourceUpdated, db: p.db, counts: p.counts, gz: b64 };
  }
  return { sync: sync, payload: payload, rowsOf: rowsOf, COLS: COLS };
})();

/** RHI kereta & gerbong (bulanan per unit + status harian). Tanpa masukan. */
function apiRhiSarana() {
  return guard_(function () {
    var r = RhiS.payload();
    if (!r) return { ok: true, empty: true, message: 'RHI kereta & gerbong belum disinkron (Script Property RHI_DB_ID).' };
    r.ok = true; return r;
  });
}

/** Editor: sinkron paksa RHI kereta & gerbong. */
function syncRhiSaranaNow() { pemilik_(); console.log(JSON.stringify(RhiS.sync(true))); }
