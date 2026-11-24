/**
 * 28_BatubaraSync.gs — sinkron baca Database_KA_Batubara_Sumsel (keputusan pemilik 24 Nov 2026: sinkron otomatis,
 * DB hanya dibaca, app WTT lama dipensiunkan bertahap). ID DB di Script Properties BB_DB_ID (bukan di kode).
 *
 * Bagian snapshot (gzip+base64, berkas Drive app + CacheService), sama dengan pembagian app WTT agar halaman memuat seperlunya:
 *   core       master, program, SOP, ambang, katalog hambatan, sarana Duksar, dinasan, target KPI, prasarana
 *   perjalanan REAL_PERJALANAN (KELKA)            terminal  REAL_TERMINAL + REAL_THN
 *   hambatan   REAL_HAMBATAN                       jejak     REAL_JEJAK (Rolink, untuk grafik & uji ulang)
 * TIDAK dibaca: REAL_GANGGUAN (salinan Gangguan_Induk → aplikasi ini memakai sumber aslinya), EMPLASEMEN_GAMBAR, PETA_LAPISAN.
 * Pemicu: syncScheduled_ (04_Etl.gs) memanggil Bb.sync(false) tiap putaran; bangun ulang hanya bila DB berubah.
 */
var Bb = (function () {
  var SCHEMA = 1, TZ = 'Asia/Jakarta';
  var PARTS = {
    core: ['CONFIG', 'M_STASIUN', 'M_LINTAS', 'M_PETAK', 'M_TERMINAL', 'M_KA', 'M_MITRA_RELASI', 'M_UPT', 'SOP', 'PRG_TERMINAL', 'PRG_SIKLUS',
      'KATALOG_HAMBATAN', 'AMBANG_SOP', 'KPI_TARGET', 'OTP_RESMI', 'KINERJA_TAHUNAN', 'KINERJA_2026', 'KINERJA_LOSSES', 'DINASAN_AWAK',
      'SARANA_LOK', 'SARANA_RANGKAIAN', 'SARANA_REKAP', 'PROGRAM_KA', 'PRASARANA_PETAK', 'KAPASITAS_LINTAS', 'EMPLASEMEN_JALUR',
      'EMPLASEMEN_SKEMA', 'TEMUAN_REGULASI', 'PUSTAKA', 'ALUR_KEGIATAN'],
    perjalanan: ['REAL_PERJALANAN'],
    terminal: ['REAL_TERMINAL', 'REAL_THN'],
    hambatan: ['REAL_HAMBATAN'],
    jejak: ['REAL_JEJAK']
  };
  var TIME_COLS = /^(brk|dat|brk_prog|brk_real|tiba_prog|tiba_real|jam_[a-z_]+|mulai_dinas|habis_dinas)$/, DATE_COLS = /^(tanggal|tgl_)/;

  function props() { return PropertiesService.getScriptProperties(); }
  function dbId() { return cfg_('BB_DB_ID'); }

  function cell(v, col) {
    if (v === '' || v === null || v === undefined) return null;
    if (Object.prototype.toString.call(v) === '[object Date]') {
      if (TIME_COLS.test(col) || v.getFullYear() < 1901) return Utilities.formatDate(v, TZ, 'HH:mm');
      if (DATE_COLS.test(col)) return Utilities.formatDate(v, TZ, 'yyyy-MM-dd');
      return Utilities.formatDate(v, TZ, 'yyyy-MM-dd HH:mm');
    }
    if (typeof v === 'string') { v = v.trim(); return v === '' ? null : v; }
    return v;
  }
  /** Satu tab → {c: kolom, r: baris}. Tab tidak ada → kosong (tab opsional). */
  function readTab(ss, name) {
    var sh = ss.getSheetByName(name);
    if (!sh) return { c: [], r: [] };
    var lr = sh.getLastRow(), lc = sh.getLastColumn();
    if (lr < 1 || lc < 1) return { c: [], r: [] };
    var v = sh.getRange(1, 1, lr, lc).getValues(), cols = v[0].map(function (h) { return String(h).trim(); });
    while (cols.length && !cols[cols.length - 1]) cols.pop();
    var rows = [];
    for (var i = 1; i < v.length; i++) {
      var out = new Array(cols.length), empty = true;
      for (var j = 0; j < cols.length; j++) { out[j] = cell(v[i][j], cols[j]); if (out[j] !== null) empty = false; }
      if (!empty) rows.push(out);
    }
    return { c: cols, r: rows };
  }

  function pointer() {
    var s = props().getProperty('BB_POINTER'); if (!s) return null;
    try { var p = JSON.parse(s); return p.schema === SCHEMA ? p : null; } catch (e) { return null; }
  }

  /**
   * Bangun snapshot bila DB berubah (atau force). Gagal = snapshot lama tetap dipakai.
   * @return {{ok:boolean, changed?:boolean, version?:string, message?:string}}
   */
  function sync(force) {
    var id = dbId();
    if (!id) return { ok: true, changed: false, message: 'BB_DB_ID belum diisi; halaman Capaian & Siklus Batubara menunggu sinkron (Papan skenario tetap memakai seed GAPEKA).' };
    var upd = DriveApp.getFileById(id).getLastUpdated().getTime(), old = pointer();
    if (!force && old && old.sourceUpdatedMs >= upd) return { ok: true, changed: false };
    var ss = SpreadsheetApp.openById(id), version = Utilities.formatDate(new Date(), TZ, 'yyyyMMdd-HHmmss'), files = {}, counts = {};
    Object.keys(PARTS).forEach(function (part) {
      var t = {};
      PARTS[part].forEach(function (name) { t[name] = readTab(ss, name); counts[name] = t[name].r.length; });
      var b64 = Store.gzB64({ v: version, t: t });
      files[part] = Store.writeBlob('bb-' + part + '-' + version + '.b64', b64);
      Store.cachePut('bb:' + part + ':' + version, b64);
    });
    // Pagar pengaman: realisasi perjalanan tidak boleh turun drastis.
    if (old && old.counts && old.counts.REAL_PERJALANAN && counts.REAL_PERJALANAN < old.counts.REAL_PERJALANAN * 0.8) {
      throw new Error('REAL_PERJALANAN turun dari ' + old.counts.REAL_PERJALANAN + ' ke ' + counts.REAL_PERJALANAN + '; snapshot lama dipertahankan.');
    }
    var p = { schema: SCHEMA, version: version, built: Utilities.formatDate(new Date(), TZ, 'yyyy-MM-dd HH:mm'), sourceUpdatedMs: upd,
      sourceUpdated: Utilities.formatDate(new Date(upd), TZ, 'yyyy-MM-dd HH:mm'), files: files, counts: counts, db: ss.getName() };
    props().setProperty('BB_POINTER', JSON.stringify(p));   // terbit atomik
    if (old && old.files) Object.keys(old.files).forEach(function (k) { try { DriveApp.getFileById(old.files[k]).setTrashed(true); } catch (e) { /* abaikan */ } });
    return { ok: true, changed: true, version: version, counts: counts };
  }

  /** Satu bagian snapshot (base64 gzip). */
  function part(name) {
    var p = pointer();
    if (!p) return null;
    var b64 = Store.cacheGet('bb:' + name + ':' + p.version);
    if (!b64) { b64 = DriveApp.getFileById(p.files[name]).getBlob().getDataAsString(); Store.cachePut('bb:' + name + ':' + p.version, b64); }
    return { version: p.version, built: p.built, sourceUpdated: p.sourceUpdated, db: p.db, counts: p.counts, gz: b64 };
  }

  return { PARTS: PARTS, sync: sync, part: part, pointer: pointer, readTab: readTab };
})();

/**
 * Bagian data ruang kerja Batubara. Masukan divalidasi dengan daftar tertutup.
 * @param {string} name core|perjalanan|terminal|hambatan|jejak
 */
function apiBatubaraPart(name) {
  return guard_(function () {
    if (!Object.prototype.hasOwnProperty.call(Bb.PARTS, name)) throw new Error('Bagian data tidak dikenal.');
    var r = Bb.part(name);
    if (!r) return { ok: true, empty: true, message: 'Data Batubara belum disinkron (Script Property BB_DB_ID).' };
    r.ok = true; return r;
  });
}

/** Editor: sinkron paksa DB Batubara. */
function syncBatubaraNow() { pemilik_(); console.log(JSON.stringify(Bb.sync(true))); }
