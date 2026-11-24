/**
 * 04_Etl.gs — membaca sumber, membangun snapshot, dan menerbitkannya.
 * Dipanggil oleh pemicu waktu (syncScheduled_) dan editor (syncNow).
 * Gagal di tengah jalan = snapshot lama tetap dipakai.
 */
function readSheet_(spreadsheetId, sheetName) {
  var ss = SpreadsheetApp.openById(spreadsheetId);
  var sh = sheetName ? ss.getSheetByName(sheetName) : ss.getSheets()[0];
  if (!sh) throw new Error('Tab "' + sheetName + '" tidak ditemukan di ' + ss.getName());
  return sh.getDataRange().getValues();
}

/**
 * Spreadsheet "Master tambahan" milik app: M_JPL, M_JADWAL, M_STASIUN_OPS.
 * Dibuat otomatis bila belum ada; tab yang kosong diisi dari seed (10_Seed.gs, 11_SeedJadwal.gs).
 * Setelah terisi, tab-tab inilah sumbernya — perbaikan cukup di Sheets, tanpa menyentuh kode.
 */
function extraSpreadsheet_() {
  var p = PropertiesService.getScriptProperties(), ss = null;
  var id = cfg_('EXTRA_SPREADSHEET_ID');
  if (id) { try { ss = SpreadsheetApp.openById(id); } catch (e) { console.warn('Master tambahan tidak bisa dibuka, dibuat ulang: ' + e); } }
  if (!ss) { ss = SpreadsheetApp.create('KAI Dashboard v3 — Master tambahan (JPL, jadwal, stasiun)'); p.setProperty('EXTRA_SPREADSHEET_ID', ss.getId()); }
  ensureTab_(ss, CONFIG.EXTRA_SHEETS.jpl, M_JPL_HEADER, seedJplRows_);
  ensureTab_(ss, CONFIG.EXTRA_SHEETS.jadwal, M_JADWAL_HEADER, seedJadwalRows_);
  ensureTab_(ss, CONFIG.EXTRA_SHEETS.ops, M_OPS_HEADER, function () { return SEED_PTDO.map(function (r) { return r.concat(['PTDO GAPEKA 2025 Bab IV']); }); });
  ensureTab_(ss, CONFIG.EXTRA_SHEETS.depo, M_DEPO_HEADER, function () { return SEED_DEPO_KA; });
  mergeSeedById_(ensureTab_(ss, CONFIG.EXTRA_SHEETS.ruj, M_RUJUKAN_HEADER, seedRujukanRows_), seedRujukanRows_());
  ensureTab_(ss, CONFIG.EXTRA_SHEETS.koreksi, M_KOREKSI_HEADER, function () { return SEED_KOREKSI.map(function (r) { return r.slice(); }); });
  var first = ss.getSheetByName('Sheet1') || ss.getSheetByName('Lembar1');
  if (first && ss.getSheets().length > 1 && first.getLastRow() === 0) ss.deleteSheet(first);
  return ss;
}

/** Buat tab bila belum ada; isi dari seed bila hanya berisi judul (atau kosong). Semua sel teks (@) agar "05:16" tidak berubah jadi waktu. */
function ensureTab_(ss, name, header, seedFn) {
  var sh = ss.getSheetByName(name);
  if (!sh) { sh = ss.insertSheet(name); }
  if (sh.getLastRow() > 1) return sh;
  var rows = [header].concat(seedFn());
  if (sh.getMaxRows() < rows.length) sh.insertRowsAfter(sh.getMaxRows(), rows.length - sh.getMaxRows());
  if (sh.getMaxColumns() < header.length) sh.insertColumnsAfter(sh.getMaxColumns(), header.length - sh.getMaxColumns());
  sh.getRange(1, 1, rows.length, header.length).setNumberFormat('@');
  for (var i = 0; i < rows.length; i += 5000) {
    var part = rows.slice(i, i + 5000);
    sh.getRange(i + 1, 1, part.length, header.length).setValues(part);
  }
  sh.setFrozenRows(1);
  return sh;
}

/** Tambahkan baris seed yang ID-nya (kolom A) belum ada di tab — baris yang sudah diubah pengguna tidak disentuh. */
function mergeSeedById_(sh, rows) {
  var have = {}, vals = sh.getDataRange().getValues();
  vals.forEach(function (r) { have[String(r[0]).trim()] = 1; });
  var add = rows.filter(function (r) { return !have[String(r[0]).trim()]; });
  if (!add.length) return 0;
  var start = Math.max(sh.getLastRow(), 1) + 1, w = add[0].length;
  if (sh.getMaxRows() < start + add.length - 1) sh.insertRowsAfter(sh.getMaxRows(), start + add.length - 1 - sh.getMaxRows());
  sh.getRange(start, 1, add.length, w).setNumberFormat('@');
  sh.getRange(start, 1, add.length, w).setValues(add);
  return add.length;
}

function readExtra_() {
  var ss = extraSpreadsheet_(), out = { jpl: [], jadwal: [], ops: [], depo: [], ruj: [], koreksi: [] };
  [['jpl', CONFIG.EXTRA_SHEETS.jpl], ['jadwal', CONFIG.EXTRA_SHEETS.jadwal], ['ops', CONFIG.EXTRA_SHEETS.ops], ['depo', CONFIG.EXTRA_SHEETS.depo], ['ruj', CONFIG.EXTRA_SHEETS.ruj], ['koreksi', CONFIG.EXTRA_SHEETS.koreksi]].forEach(function (x) {
    var sh = ss.getSheetByName(x[1]); if (sh) out[x[0]] = sh.getDataRange().getDisplayValues();
  });
  return out;
}

function readMasters_() {
  var g = cfg_('GAPEKA_SPREADSHEET_ID'), names = CONFIG.GAPEKA_SHEETS;
  return {
    ka: readSheet_(g, names.ka), st: readSheet_(g, names.stasiun), pj: readSheet_(g, names.petak),
    sar: readSheet_(cfg_('SARANA_SPREADSHEET_ID'), null)
  };
}

function sourceUpdatedAt_() {
  var t = DriveApp.getFileById(cfg_('SOURCE_SPREADSHEET_ID')).getLastUpdated().getTime();
  var x = cfg_('EXTRA_SPREADSHEET_ID');
  if (x) { try { t = Math.max(t, DriveApp.getFileById(x).getLastUpdated().getTime()); } catch (e) { } }
  return t;
}

/** Bangun & terbitkan snapshot. force=true mengabaikan pemeriksaan "tidak ada perubahan". */
function runSync_(force, trigger) {
  var props = PropertiesService.getScriptProperties();
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(1000)) return { ok: false, busy: true, message: 'Sinkronisasi lain sedang berjalan.' };
  var started = Date.now();
  try {
    var prev = Store.pointer();
    var stale = !prev || !prev.meta || prev.meta.schema !== CONFIG.SCHEMA; // versi app baru → bangun ulang
    var updated = sourceUpdatedAt_();
    var last = Number(props.getProperty('SOURCE_UPDATED_AT') || 0);
    if (!force && !stale && updated <= last) {
      setStatus_({ ok: true, at: started, trigger: trigger, message: 'Tidak ada perubahan sumber.', ms: Date.now() - started });
      return { ok: true, changed: false };
    }
    var m = readMasters_(), extra = readExtra_();
    var idx = Domain.buildIndex(mastersFromValues_(m.ka, m.st, m.pj, m.sar, extra.jadwal));
    var values = readSheet_(cfg_('SOURCE_SPREADSHEET_ID'), cfg_('SOURCE_SHEET'));
    var out = transformRows_(values, idx, null, koreksiMap_(extra.koreksi));
    var ref = buildRef_({ ka: m.ka, st: m.st, pj: m.pj, sar: m.sar, jpl: extra.jpl, jadwal: extra.jadwal, ops: extra.ops, depo: extra.depo, ruj: extra.ruj });
    // Kondisi prasarana & sarana (THI, RHI, WKP). Opsional: kegagalan tidak menahan snapshot gangguan.
    try {
      var kb = readKondisiAuto_();   // 22_Bq.gs: BigQuery bila KONDISI_SUMBER=bq, selain itu Google Sheets
      ref.kondisi = Kondisi.build(kb.raw, Utilities.formatDate(new Date(), 'Asia/Jakarta', 'yyyy-MM'), ref.st);
      ref.kondisi.stats.sumberBaca = kb.sumber;
    }
    catch (ek) { ref.kondisi = { version: 1, error: String(ek && ek.message || ek), thi: [], rhi: [], wkp: [], resor: SEED_RESOR }; }
    // Pendapatan (Passenger & Freight) → rate pendapatan per jam. Opsional, sama seperti kondisi.
    try { ref.pend = Pendapatan.build(readPendapatan_()); }
    catch (ep) { ref.pend = { version: 1, error: String(ep && ep.message || ep), pass: [], frei: [], stats: {} }; }

    // Program operasi KA (24_SeedOperasi.gs): km, status Jalan/Batal pada tanggal kejadian, pola operasi. Opsional.
    try { ref.prog = Ops.forRef(out.rows); ref.prog.hj = Ops.hjMap(); }
    catch (eo) { ref.prog = { error: String(eo && eo.message || eo), ka: {}, st: {}, pola: [] }; }

    // Pagar pengaman: jangan terbitkan bila jumlah baris turun drastis.
    if (prev && prev.meta && prev.meta.rows && out.rows.length < prev.meta.rows * 0.8) {
      throw new Error('Jumlah baris turun dari ' + prev.meta.rows + ' ke ' + out.rows.length + '. Periksa sumber; snapshot lama dipertahankan.');
    }
    var version = Utilities.formatDate(new Date(), 'Asia/Jakarta', 'yyyyMMdd-HHmmss');
    var yms = out.rows.map(function (r) { return r[1]; }).filter(String).sort();
    var meta = {
      version: version, builtAt: Date.now(), sourceUpdatedAt: updated, rows: out.rows.length,
      firstYm: yms[0] || '', lastYm: yms[yms.length - 1] || '', rule: CONFIG.RULE_VERSION,
      componentRule: CONFIG.COMPONENT_RULE_VERSION, stats: out.stats, app: CONFIG.APP_VERSION, schema: CONFIG.SCHEMA,
      refCounts: ref.counts, byYm: byYm_(out.rows)
    };
    logChange_(prev, meta);
    Store.publish(version, { fields: out.fields, rows: out.rows, units: out.units }, out.narr, ref, meta);
    props.setProperty('SOURCE_UPDATED_AT', String(updated));
    setStatus_({ ok: true, at: started, trigger: trigger, message: 'Snapshot ' + version + ' terbit: ' + out.rows.length + ' kejadian, ' +
      ref.counts.jpl + ' JPL, ' + ref.counts.ka + ' KA, ' + ref.counts.jadwal + ' jadwal KA, ' + ref.counts.fleet + ' sarana.', ms: Date.now() - started });
    return { ok: true, changed: true, version: version, rows: out.rows.length, ref: ref.counts };
  } catch (e) {
    setStatus_({ ok: false, at: started, trigger: trigger, message: String(e && e.message || e), ms: Date.now() - started });
    return { ok: false, message: String(e && e.message || e) };
  } finally {
    lock.releaseLock();
  }
}

function setStatus_(s) { PropertiesService.getScriptProperties().setProperty('SYNC_STATUS', JSON.stringify(s)); }
function getStatus_() {
  var s = PropertiesService.getScriptProperties().getProperty('SYNC_STATUS');
  return s ? JSON.parse(s) : null;
}

/** Target pemicu waktu. */
function syncScheduled_() {
  runSync_(false, 'jadwal');
  // DB Batubara (28_BatubaraSync.gs): terpisah agar kegagalannya tidak menahan snapshot gangguan.
  try { var b = Bb.sync(false); if (b.changed) console.log('Batubara: snapshot ' + b.version); } catch (e) { console.warn('Sinkron Batubara gagal: ' + e); }
}


/** Ringkasan per bulan { ym: [kejadian, menit] } — dipakai untuk mendeteksi perubahan data antar-snapshot. */
function byYm_(rows) {
  var o = {};
  rows.forEach(function (r) { var ym = r[1] || '(tanpa tanggal)', m = Number(r[19]) || 0; var x = o[ym] = o[ym] || [0, 0]; x[0]++; x[1] += m; });
  Object.keys(o).forEach(function (k) { o[k][1] = Math.round(o[k][1]); });
  return o;
}

/**
 * Catatan pembaruan (12 terakhir) di Script Properties → ditampilkan sebagai notifikasi lonceng di dashboard.
 * Isi: waktu, jumlah kejadian, selisih kejadian & menit, dan bulan yang berubah.
 */
function logChange_(prev, meta) {
  var props = PropertiesService.getScriptProperties(), log = [];
  try { log = JSON.parse(props.getProperty('CHANGELOG') || '[]'); } catch (e) { log = []; }
  var pb = prev && prev.meta && prev.meta.byYm, nb = meta.byYm, months = [];
  if (pb) {
    var keys = {}; Object.keys(pb).concat(Object.keys(nb)).forEach(function (k) { keys[k] = 1; });
    Object.keys(keys).forEach(function (k) {
      var a = pb[k] || [0, 0], b = nb[k] || [0, 0];
      if (a[0] !== b[0] || a[1] !== b[1]) months.push({ ym: k, dn: b[0] - a[0], dm: b[1] - a[1], n: b[0], m: b[1] });
    });
    months.sort(function (x, y) { return y.ym < x.ym ? -1 : 1; });
  }
  var sum = function (o) { return Object.keys(o || {}).reduce(function (a, k) { return [a[0] + o[k][0], a[1] + o[k][1]]; }, [0, 0]); };
  var t0 = sum(pb), t1 = sum(nb);
  log.unshift({ version: meta.version, at: meta.builtAt, rows: meta.rows, app: meta.app,
    kind: !pb ? 'awal' : (prev.meta.app !== meta.app ? 'aplikasi' : 'data'),
    dRows: pb ? t1[0] - t0[0] : 0, dMenit: pb ? t1[1] - t0[1] : 0, months: months.slice(0, 8), monthsChanged: months.length });
  var txt = JSON.stringify(log.slice(0, 12));
  while (txt.length > 8500 && log.length > 1) { log.pop(); txt = JSON.stringify(log.slice(0, 12)); }
  props.setProperty('CHANGELOG', txt);
}
