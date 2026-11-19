/**
 * Platform.gs — "KAI Data Platform Tools" (proyek Apps Script TERPISAH dari web app dashboard).
 *
 * Fungsi:
 *   setupBigQuery()     membuat dataset kai_raw (tabel eksternal → Google Sheets, live) & kai (view bertipe) di BigQuery sandbox,
 *                       mendeteksi cara BigQuery membaca angka (tampilan id_ID atau mentah), lalu memverifikasi jumlah baris & total.
 *   refreshBigQuery()   membuat ulang definisi tabel/view (sandbox menghapus tabel & view setelah 60 hari) — dipicu bulanan.
 *   snapshotBigQuery()  menyalin view kai.* ke tabel asli kai_snap.* (≤15 menit) — untuk DBeaver/klien yang tidak bisa memberi izin Google Drive.
 *   agregatBigQuery()   membangun tabel agregat kai_agg.* (RHI/THI/WKP/Gangguan) dari kai_snap.* — SQL di Agregat.gs (dibangkitkan
 *                       dari db/bigquery/30_agregat.sql) — dipicu harian.
 *   jagaKedaluwarsa()   memperpanjang masa tabel kai_snap.* & kai_agg.* yang mendekati batas 60 hari sandbox — dipicu mingguan.
 *   mirrorCsv()         cermin CSV mesin (angka bertitik desimal, tanggal ISO) ke folder Drive 05_DBEAVER_Mirror_CSV — jalur cadangan DBeaver.
 *   inventarisDrive()   katalog rekursif folder sumber (nama, ID, tipe, ukuran, md5, pemilik, URL) ke spreadsheet katalog.
 *   pasangPemicu()      memasang semua pemicu waktu sekali jalan.
 *
 * Properti skrip (Project Settings → Script properties):
 *   BQ_PROJECT    ID proyek Google Cloud (BigQuery sandbox)   — wajib untuk fungsi BigQuery
 *   CATALOG_ID    ID spreadsheet KAI_Katalog_Data             — wajib untuk log & inventaris
 *   MIRROR_FOLDER ID folder 05_DBEAVER_Mirror_CSV             — bawaan di bawah
 *   INV_FOLDERS   daftar ID folder sumber dipisah koma        — untuk inventarisDrive
 *
 * Biaya: Rp0 — BigQuery sandbox (tanpa kartu kredit; 10 GiB simpanan, 1 TiB kueri/bulan) + kuota Apps Script akun pribadi.
 * Tabel & kolom: Tables.gs (dibangkitkan dari db/schema/sumber_tabel.json). Jangan menulis nama kolom manual di sini.
 */
var PLATFORM = {
  VERSION: '1.1.0',
  LOCATION: 'asia-southeast2',          // Jakarta
  RAW: 'kai_raw', DS: 'kai', SNAP: 'kai_snap', AGG: 'kai_agg',
  JAGA_HARI: 14,                        // perpanjang masa tabel bila sisa < 14 hari (batas sandbox 60 hari)
  MIRROR_FOLDER: '1VwL9xh5SufQ9qC7vcAZof9E3MNDzJY6b',
  TZ: 'Asia/Jakarta',
  TIME_BUDGET_MS: 5 * 60 * 1000,        // batas aman di bawah 6 menit Apps Script
  // Jarak minimum (menit) antar-salinan per tabel — menjaga kuota pemicu akun pribadi (±90 menit/hari).
  // Tabel kejadian disalin tiap 15 menit bila berubah; tabel bulanan/referensi lebih jarang. Ubah lewat properti MIN_MENIT (JSON).
  MIN_MENIT: { gangguan_induk: 15, hambatan_jasum: 15, wkp: 60, _default: 360 }
};
function minMenit_(name) {
  var m = PLATFORM.MIN_MENIT; try { var o = JSON.parse(prop_('MIN_MENIT', '{}')); for (var k in o) m[k] = o[k]; } catch (e) { }
  return m[name] != null ? m[name] : m._default;
}
/** true bila tabel perlu disalin: sumber berubah sejak salinan terakhir DAN jarak minimum sudah lewat. */
function due_(name, lastSrcMs, lastRunMs, srcMs) {
  if (lastSrcMs && lastSrcMs >= srcMs) return false;
  return !lastRunMs || Date.now() - lastRunMs >= minMenit_(name) * 60000;
}

function prop_(k, dflt) { var v = PropertiesService.getScriptProperties().getProperty(k); return v == null || v === '' ? dflt : v; }
function setProp_(k, v) { PropertiesService.getScriptProperties().setProperty(k, String(v)); }
function project_() { var p = prop_('BQ_PROJECT', ''); if (!p) throw new Error('Isi properti skrip BQ_PROJECT dengan ID proyek Google Cloud.'); return p; }

/* ------------------------------------------------------------------ log ------------------------------------------------------------------ */
function log_(langkah, status, rincian) {
  var line = [new Date(), PLATFORM.VERSION, langkah, status, typeof rincian === 'string' ? rincian : JSON.stringify(rincian)];
  console.log(line.join(' | '));
  var id = prop_('CATALOG_ID', ''); if (!id) return;
  try {
    var ss = SpreadsheetApp.openById(id), sh = ss.getSheetByName('Log_Platform') || ss.insertSheet('Log_Platform');
    if (sh.getLastRow() === 0) sh.appendRow(['Waktu', 'Versi', 'Langkah', 'Status', 'Rincian']);
    sh.appendRow(line);
  } catch (e) { console.warn('log gagal: ' + e); }
}

/* --------------------------------------------------------------- BigQuery --------------------------------------------------------------- */
function bq_(sql) {
  var p = project_(), res = BigQuery.Jobs.query({ query: sql, useLegacySql: false, location: PLATFORM.LOCATION, timeoutMs: 60000 }, p), jobId = res.jobReference.jobId;
  while (!res.jobComplete) { Utilities.sleep(1500); res = BigQuery.Jobs.getQueryResults(p, jobId, { location: PLATFORM.LOCATION }); }
  return (res.rows || []).map(function (r) { return r.f.map(function (c) { return c.v; }); });
}
function q_(name) { return '`' + project_() + '.' + name + '`'; }
function sheetRange_(t) {
  var n = t.cols.length, s = '';
  while (n) { var r = (n - 1) % 26; s = String.fromCharCode(65 + r) + s; n = Math.floor((n - 1) / 26); }
  var nm = /^[A-Za-z0-9_]+$/.test(t.sheet) ? t.sheet : "'" + t.sheet.replace(/'/g, "''") + "'";
  return nm + '!A:' + s;
}
function ddlExternal_(t) {
  return 'CREATE OR REPLACE EXTERNAL TABLE ' + q_(PLATFORM.RAW + '.' + t.name) + ' (\n' +
    t.cols.map(function (c) { return '  ' + c[0] + ' STRING OPTIONS(description=' + JSON.stringify(c[1]) + ')'; }).join(',\n') +
    '\n) OPTIONS (format="GOOGLE_SHEETS", uris=["https://docs.google.com/spreadsheets/d/' + t.ss + '"], sheet_range=' + JSON.stringify(sheetRange_(t)) +
    ', skip_leading_rows=' + t.skip + ', description=' + JSON.stringify(t.desc) + ')';
}
function ddlView_(t) {
  var fn = function (n) { return q_(PLATFORM.DS + '.' + n); };
  var sel = t.cols.map(function (c) {
    if (c[2] === 'N') return '  ' + fn('num') + '(' + c[0] + ') AS ' + c[0];
    if (c[2] === 'D') return '  ' + fn('tgl') + '(' + c[0] + ') AS ' + c[0] + ', ' + c[0] + ' AS ' + c[0] + '_teks';
    return '  NULLIF(TRIM(' + c[0] + '), "") AS ' + c[0];
  });
  var nonEmpty = t.cols.slice(0, 3).map(function (c) { return 'NULLIF(TRIM(' + c[0] + '),"")'; }).join(', ');
  return 'CREATE OR REPLACE VIEW ' + fn(t.name) + ' OPTIONS(description=' + JSON.stringify(t.desc) + ') AS\nSELECT\n' + sel.join(',\n') +
    '\nFROM ' + q_(PLATFORM.RAW + '.' + t.name) + '\nWHERE COALESCE(' + nonEmpty + ') IS NOT NULL';
}
function ddlUdf_(mode) {
  // Sama dengan db/bigquery/00_dataset_udf.sql. mode: 'tampilan' (format id_ID) | 'mentah'
  var num = 'CREATE OR REPLACE FUNCTION ' + q_(PLATFORM.DS + '.num') + "(s STRING) RETURNS FLOAT64 AS (CASE WHEN s IS NULL OR TRIM(s) = '' THEN NULL " +
    (mode === 'mentah' ? "WHEN SAFE_CAST(TRIM(s) AS FLOAT64) IS NOT NULL THEN SAFE_CAST(TRIM(s) AS FLOAT64) " : '') +
    "WHEN REGEXP_CONTAINS(s, r',') THEN SAFE_CAST(REPLACE(REPLACE(REGEXP_REPLACE(TRIM(s), r'[^0-9,.\\-]', ''), '.', ''), ',', '.') AS FLOAT64) " +
    "WHEN REGEXP_CONTAINS(TRIM(s), r'^-?\\d{1,3}(\\.\\d{3})+$') THEN SAFE_CAST(REPLACE(TRIM(s), '.', '') AS FLOAT64) " +
    "ELSE SAFE_CAST(REGEXP_REPLACE(TRIM(s), r'[^0-9.\\-]', '') AS FLOAT64) END)";
  var months = [['jan|januari|january', '01'], ['feb|februari|february', '02'], ['mar|maret|march', '03'], ['apr|april', '04'], ['mei|may', '05'], ['jun|juni|june', '06'],
    ['jul|juli|july', '07'], ['agu|agt|agus|agustus|aug|august', '08'], ['sep|sept|september', '09'], ['okt|oktober|oct|october', '10'], ['nov|nopember|november', '11'], ['des|desember|dec|december', '12']];
  var e = "REGEXP_EXTRACT(LOWER(TRIM(s)), r'^\\d{1,2}\\s+[a-z]+\\s+\\d{4}')";
  months.forEach(function (m) { e = "REGEXP_REPLACE(" + e + ", r'\\s(" + m[0] + ")\\s', ' " + m[1] + " ')"; });
  var tgl = 'CREATE OR REPLACE FUNCTION ' + q_(PLATFORM.DS + '.tgl') + "(s STRING) RETURNS DATE AS (CASE WHEN s IS NULL OR TRIM(s) = '' THEN NULL " +
    "WHEN REGEXP_CONTAINS(TRIM(s), r'^\\d{4}-\\d{2}-\\d{2}') THEN SAFE.PARSE_DATE('%Y-%m-%d', SUBSTR(TRIM(s), 1, 10)) " +
    "WHEN REGEXP_CONTAINS(TRIM(s), r'^\\d{4}-\\d{2}$') THEN SAFE.PARSE_DATE('%Y-%m-%d', TRIM(s) || '-01') " +
    "WHEN REGEXP_CONTAINS(TRIM(s), r'^\\d{1,2}/\\d{1,2}/\\d{4}') THEN SAFE.PARSE_DATE('%d/%m/%Y', REGEXP_EXTRACT(TRIM(s), r'^\\d{1,2}/\\d{1,2}/\\d{4}')) " +
    "WHEN REGEXP_CONTAINS(TRIM(s), r'^\\d{5}(\\.\\d+)?$') THEN DATE_ADD(DATE '1899-12-30', INTERVAL CAST(FLOOR(CAST(TRIM(s) AS FLOAT64)) AS INT64) DAY) " +
    "ELSE SAFE.PARSE_DATE('%d %m %Y', " + e + ') END)';
  return [num, tgl];
}
function ensureDataset_(id, desc) {
  var p = project_();
  try { BigQuery.Datasets.get(p, id); }
  catch (e) { BigQuery.Datasets.insert({ datasetReference: { projectId: p, datasetId: id }, location: PLATFORM.LOCATION, description: desc }, p); }
}
/** Bandingkan nilai yang dibaca BigQuery dengan tampilan & nilai mentah sheet untuk memilih mode UDF angka. */
function detectNumMode_() {
  var t = PLATFORM_TABLES.filter(function (x) { return x.name === 'passenger'; })[0];
  var sh = SpreadsheetApp.openById(t.ss).getSheetByName(t.sheet), n = Math.min(30, sh.getLastRow() - t.skip);
  var disp = sh.getRange(t.skip + 1, 2, n, 1).getDisplayValues().map(function (r) { return String(r[0]); });
  var raw = sh.getRange(t.skip + 1, 2, n, 1).getValues().map(function (r) { return String(r[0]); });
  var got = bq_('SELECT ' + t.cols[1][0] + ' FROM ' + q_(PLATFORM.RAW + '.passenger') + ' LIMIT ' + n).map(function (r) { return String(r[0]); });
  var d = 0, m = 0;
  got.forEach(function (v) { if (disp.indexOf(v) >= 0) d++; if (raw.indexOf(v) >= 0) m++; });
  var mode = m >= d ? 'mentah' : 'tampilan';
  log_('deteksi mode angka', 'ok', { mode: mode, cocok_mentah: m, cocok_tampilan: d, contoh_bq: got.slice(0, 3) });
  return mode;
}
function setupBigQuery() {
  var t0 = Date.now();
  ensureDataset_(PLATFORM.RAW, 'Tabel eksternal Google Sheets (nilai apa adanya, STRING) — dibuat Platform.gs');
  ensureDataset_(PLATFORM.DS, 'View bertipe untuk analisis & DBeaver — dibuat Platform.gs');
  PLATFORM_TABLES.forEach(function (t) { bq_(ddlExternal_(t)); });
  var mode = prop_('NUM_MODE', '') || detectNumMode_(); setProp_('NUM_MODE', mode);
  ddlUdf_(mode).forEach(bq_);
  PLATFORM_TABLES.forEach(function (t) { bq_(ddlView_(t)); });
  log_('setupBigQuery', 'ok', { tabel: PLATFORM_TABLES.length, mode: mode, detik: Math.round((Date.now() - t0) / 1000) });
  verifikasiBigQuery();
  setProp_('SNAP_STATE', '{}');   // definisi view baru → salin ulang semua snapshot
}
function refreshBigQuery() {
  try { setupBigQuery(); } catch (e) { log_('refreshBigQuery', 'GAGAL', String(e)); throw e; }
}
/** Jumlah baris view vs baris terisi di sheet, dan total kolom angka utama vs jumlah Apps Script. Selisih ditulis ke Log_Platform. */
function verifikasiBigQuery() {
  var out = [];
  PLATFORM_TABLES.forEach(function (t) {
    try {
      var sh = SpreadsheetApp.openById(t.ss).getSheetByName(t.sheet), last = sh.getLastRow(), n = Math.max(0, last - t.skip);
      var vals = n ? sh.getRange(t.skip + 1, 1, n, Math.min(3, t.cols.length)).getDisplayValues() : [];
      var rowsSheet = vals.filter(function (r) { return r.some(function (x) { return String(x).trim() !== ''; }); }).length;
      var rowsBq = +bq_('SELECT COUNT(*) FROM ' + q_(PLATFORM.DS + '.' + t.name))[0][0];
      var item = { tabel: t.name, baris_sheet: rowsSheet, baris_bq: rowsBq, cocok: rowsSheet === rowsBq };
      var numIdx = -1; t.cols.some(function (c, i) { if (c[2] === 'N') { numIdx = i; return true; } return false; });
      if (numIdx >= 0 && n) {
        var col = sh.getRange(t.skip + 1, numIdx + 1, n, 1).getValues(), s = 0;
        col.forEach(function (r) { if (typeof r[0] === 'number') s += r[0]; });
        var sb = +bq_('SELECT IFNULL(SUM(' + t.cols[numIdx][0] + '),0) FROM ' + q_(PLATFORM.DS + '.' + t.name))[0][0];
        item.kolom = t.cols[numIdx][0]; item.total_sheet_angka = s; item.total_bq = sb;
        item.total_cocok = Math.abs(s - sb) <= Math.max(1e-6, Math.abs(s) * 1e-9) || s === 0;   // s = 0 → kolom tersimpan sebagai teks; dinilai lewat baris
      }
      out.push(item);
    } catch (e) { out.push({ tabel: t.name, galat: String(e) }); }
  });
  var bad = out.filter(function (x) { return x.galat || !x.cocok || x.total_cocok === false; });
  log_('verifikasiBigQuery', bad.length ? 'PERIKSA' : 'ok', out);
  return out;
}

/** Salin setiap view kai.<tabel> ke tabel asli kai_snap.<tabel> (WRITE_TRUNCATE) bila spreadsheet sumbernya berubah.
 *  Tabel asli tidak butuh izin Google Drive saat dikueri, jadi cocok untuk DBeaver dengan akun layanan / ADC. */
function snapshotBigQuery() {
  var lock = LockService.getScriptLock(); if (!lock.tryLock(1000)) return;
  try {
    var p = project_(), t0 = Date.now(), state = JSON.parse(prop_('SNAP_STATE', '{}')), cache = {}, done = [];
    ensureDataset_(PLATFORM.SNAP, 'Salinan tabel asli dari view kai (diperbarui Platform.gs bila sumber berubah)');
    for (var i = 0; i < PLATFORM_TABLES.length; i++) {
      if (Date.now() - t0 > PLATFORM.TIME_BUDGET_MS) break;
      var t = PLATFORM_TABLES[i], upd = cache[t.ss] = cache[t.ss] || DriveApp.getFileById(t.ss).getLastUpdated().getTime();
      var stt = state[t.name] || {};
      if (typeof stt === 'number') stt = { src: stt, run: 0 };
      if (!due_(t.name, stt.src, stt.run, upd)) continue;
      var job = BigQuery.Jobs.insert({ configuration: { query: {
        query: 'SELECT *, CURRENT_TIMESTAMP() AS _disalin_pada FROM ' + q_(PLATFORM.DS + '.' + t.name), useLegacySql: false,
        destinationTable: { projectId: p, datasetId: PLATFORM.SNAP, tableId: t.name }, writeDisposition: 'WRITE_TRUNCATE', createDisposition: 'CREATE_IF_NEEDED' } },
        jobReference: { projectId: p, location: PLATFORM.LOCATION } }, p);
      var id = job.jobReference.jobId;
      while (true) { var st = BigQuery.Jobs.get(p, id, { location: PLATFORM.LOCATION }).status; if (st.state === 'DONE') { if (st.errorResult) throw new Error(t.name + ': ' + st.errorResult.message); break; } Utilities.sleep(1500); }
      state[t.name] = { src: upd, run: Date.now() }; done.push(t.name);
    }
    setProp_('SNAP_STATE', JSON.stringify(state));
    if (done.length) log_('snapshotBigQuery', 'ok', { disalin: done, detik: Math.round((Date.now() - t0) / 1000) });
  } catch (e) { log_('snapshotBigQuery', 'GAGAL', String(e)); throw e; }
  finally { lock.releaseLock(); }
}

/* ---------------------------------------------------------- Agregat & kedaluwarsa ---------------------------------------------------------- */
/** Bangun ulang semua tabel kai_agg.* (CREATE OR REPLACE TABLE … AS SELECT dari kai_snap.*). DDL → sah di sandbox. */
function agregatBigQuery() {
  var lock = LockService.getScriptLock(); if (!lock.tryLock(1000)) return;
  try {
    var t0 = Date.now(), done = [], gagal = [];
    ensureDataset_(PLATFORM.AGG, 'Agregat RHI/THI/WKP/Gangguan dari kai_snap (dibuat Platform.gs → agregatBigQuery)');
    PLATFORM_AGREGAT.forEach(function (a) {
      try { bq_(a.sql.split('${PROJECT}').join(project_())); done.push(a.name); }
      catch (e) { gagal.push(a.name + ': ' + String(e && e.message || e).slice(0, 200)); }
    });
    log_('agregatBigQuery', gagal.length ? 'PERIKSA' : 'ok', { dibangun: done, gagal: gagal, detik: Math.round((Date.now() - t0) / 1000) });
  } finally { lock.releaseLock(); }
}
/** Tabel asli di sandbox dihapus otomatis 60 hari setelah dibuat. Tabel kai_snap.* hanya disalin ulang bila sumbernya
 *  berubah, jadi tabel yang jarang berubah bisa hilang. Fungsi ini memperpanjang masa tabel yang sisa < JAGA_HARI:
 *  1) patch expirationTime = sekarang + 59 hari; 2) bila ditolak, buat ulang tabel dari isinya sendiri (CREATE OR REPLACE TABLE). */
function jagaKedaluwarsa() {
  var p = project_(), batas = Date.now() + PLATFORM.JAGA_HARI * 864e5, baru = String(Date.now() + 59 * 864e5), out = [];
  [PLATFORM.SNAP, PLATFORM.AGG].forEach(function (ds) {
    var tok, list;
    do {
      try { list = BigQuery.Tables.list(p, ds, { maxResults: 200, pageToken: tok }); } catch (e) { return; }   // dataset belum ada
      (list.tables || []).forEach(function (t) {
        var id = t.tableReference.tableId, exp = Number(t.expirationTime || 0);
        if (t.type !== 'TABLE' || !exp || exp > batas) return;
        try { BigQuery.Tables.patch({ expirationTime: baru }, p, ds, id); out.push(ds + '.' + id + ' diperpanjang'); }
        catch (e1) {
          try { bq_('CREATE OR REPLACE TABLE `' + p + '.' + ds + '.' + id + '` AS SELECT * FROM `' + p + '.' + ds + '.' + id + '`'); out.push(ds + '.' + id + ' dibuat ulang'); }
          catch (e2) { out.push(ds + '.' + id + ' GAGAL: ' + String(e2 && e2.message || e2).slice(0, 160)); }
        }
      });
      tok = list.nextPageToken;
    } while (tok);
  });
  log_('jagaKedaluwarsa', out.some(function (x) { return /GAGAL/.test(x); }) ? 'PERIKSA' : 'ok', out.length ? out : 'semua tabel masih > ' + PLATFORM.JAGA_HARI + ' hari');
  return out;
}

/* ------------------------------------------------------------- Cermin CSV ------------------------------------------------------------- */
function csvCell_(v) {
  if (v === null || v === undefined || v === '') return '';
  if (Object.prototype.toString.call(v) === '[object Date]') {
    if (isNaN(v.getTime())) return '';
    var hasTime = v.getHours() || v.getMinutes() || v.getSeconds(), y = v.getFullYear();
    if (y < 1900) return Utilities.formatDate(v, PLATFORM.TZ, 'HH:mm:ss');                     // jam murni (tanggal dasar 1899)
    return Utilities.formatDate(v, PLATFORM.TZ, hasTime ? "yyyy-MM-dd'T'HH:mm:ss" : 'yyyy-MM-dd');
  }
  if (typeof v === 'number') return String(v);
  if (typeof v === 'boolean') return v ? 'true' : 'false';
  var s = String(v);
  return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s;
}
function upsertFile_(folder, name, blob) {
  var it = folder.getFilesByName(name);
  if (it.hasNext()) { var f = it.next(); Drive.Files.update({}, f.getId(), blob); return f.getId(); }
  return folder.createFile(blob).getId();
}
function mirrorCsv() {
  var lock = LockService.getScriptLock(); if (!lock.tryLock(1000)) return;
  try {
    var t0 = Date.now(), folder = DriveApp.getFolderById(prop_('MIRROR_FOLDER', PLATFORM.MIRROR_FOLDER)), done = [], skipped = [], cache = {};
    var start = +prop_('MIRROR_CURSOR', 0), manifest = JSON.parse(prop_('MIRROR_MANIFEST', '{}'));
    for (var i = start; i < PLATFORM_TABLES.length; i++) {
      if (Date.now() - t0 > PLATFORM.TIME_BUDGET_MS) { setProp_('MIRROR_CURSOR', i); log_('mirrorCsv', 'lanjut', { berhenti_di: PLATFORM_TABLES[i].name }); return; }
      var t = PLATFORM_TABLES[i], upd = cache[t.ss] = cache[t.ss] || DriveApp.getFileById(t.ss).getLastUpdated().getTime();
      var mf = manifest[t.name] || {};
      if (!due_(t.name, mf.sumber_ms, mf.ditulis ? Date.parse(mf.ditulis) : 0, upd)) { skipped.push(t.name); continue; }
      var sh = SpreadsheetApp.openById(t.ss).getSheetByName(t.sheet);
      if (!sh) { log_('mirrorCsv', 'PERIKSA', 'tab tidak ditemukan: ' + t.sheet); continue; }
      var n = sh.getLastRow() - t.skip, rows = [t.cols.map(function (c) { return c[0]; }).join(',')];
      if (n > 0) sh.getRange(t.skip + 1, 1, n, t.cols.length).getValues().forEach(function (r) {
        if (r.every(function (x) { return x === '' || x === null; })) return;
        rows.push(r.map(csvCell_).join(','));
      });
      var csv = rows.join('\r\n'), blob = Utilities.newBlob(csv, 'text/csv', t.name + '.csv');
      upsertFile_(folder, t.name + '.csv', blob);
      manifest[t.name] = { baris: rows.length - 1, sumber_ms: upd, ditulis: new Date().toISOString(), sha256: sha256_(csv) };
      done.push(t.name);
    }
    setProp_('MIRROR_CURSOR', 0); setProp_('MIRROR_MANIFEST', JSON.stringify(manifest));
    var man = [['tabel', 'baris', 'sumber_diubah', 'csv_ditulis', 'sha256']];
    Object.keys(manifest).forEach(function (k) { var m = manifest[k]; man.push([k, m.baris, new Date(m.sumber_ms).toISOString(), m.ditulis, m.sha256]); });
    upsertFile_(folder, '_manifest.csv', Utilities.newBlob(man.map(function (r) { return r.join(','); }).join('\r\n'), 'text/csv', '_manifest.csv'));
    if (done.length) log_('mirrorCsv', 'ok', { ditulis: done, tak_berubah: skipped.length, detik: Math.round((Date.now() - t0) / 1000) });
  } finally { lock.releaseLock(); }
}
function sha256_(s) {
  return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, s, Utilities.Charset.UTF_8)
    .map(function (b) { return ('0' + (b & 255).toString(16)).slice(-2); }).join('');
}

/* ---------------------------------------------------------- Inventaris Drive ---------------------------------------------------------- */
/** Menelusuri folder di INV_FOLDERS (rekursif, dapat dilanjutkan bila waktu habis) dan menulis tab Katalog_Drive. */
function inventarisDrive() {
  clearContTrigger_();   // pemicu lanjutan sekali-jalan yang sudah terpakai
  var t0 = Date.now(), ss = SpreadsheetApp.openById(prop_('CATALOG_ID', '')), sh = ss.getSheetByName('Katalog_Drive') || ss.insertSheet('Katalog_Drive');
  var state = JSON.parse(prop_('INV_STATE', 'null') || 'null');
  if (!state) {
    var roots = prop_('INV_FOLDERS', '').split(',').map(function (s) { return s.trim(); }).filter(String);
    if (!roots.length) throw new Error('Isi properti INV_FOLDERS dengan ID folder sumber (dipisah koma).');
    state = { queue: roots.map(function (id) { return { id: id, path: DriveApp.getFolderById(id).getName() }; }), n: 0 };
    sh.clear(); sh.appendRow(['Path', 'Nama', 'ID', 'Tipe MIME', 'Ukuran (byte)', 'MD5', 'Diubah', 'Pemilik', 'URL', 'Dicatat']);
  }
  while (state.queue.length) {
    if (Date.now() - t0 > PLATFORM.TIME_BUDGET_MS) {
      setProp_('INV_STATE', JSON.stringify(state));
      if (!prop_('INV_CONT_TRIGGER', '')) setProp_('INV_CONT_TRIGGER', ScriptApp.newTrigger('inventarisDrive').timeBased().after(60 * 1000).create().getUniqueId());
      log_('inventarisDrive', 'lanjut', { tercatat: state.n, antrean: state.queue.length }); return;
    }
    var q = state.queue.shift(), folder = DriveApp.getFolderById(q.id), out = [];
    var subs = folder.getFolders(); while (subs.hasNext()) { var s = subs.next(); state.queue.push({ id: s.getId(), path: q.path + '/' + s.getName() }); }
    var files = folder.getFiles();
    while (files.hasNext()) {
      var f = files.next(), md5 = '';
      try { md5 = (Drive.Files.get(f.getId(), { fields: 'md5Checksum' }) || {}).md5Checksum || ''; } catch (e) { md5 = ''; }
      var owner = ''; try { owner = f.getOwner() ? f.getOwner().getEmail() : ''; } catch (e) { }
      out.push([q.path, f.getName(), f.getId(), f.getMimeType(), f.getSize(), md5, f.getLastUpdated(), owner, f.getUrl(), new Date()]);
    }
    if (out.length) sh.getRange(sh.getLastRow() + 1, 1, out.length, out[0].length).setValues(out);
    state.n += out.length;
  }
  PropertiesService.getScriptProperties().deleteProperty('INV_STATE');
  clearContTrigger_();
  log_('inventarisDrive', 'ok', { tercatat: state.n });
}

function clearContTrigger_() {
  var id = prop_('INV_CONT_TRIGGER', ''); if (!id) return;
  ScriptApp.getProjectTriggers().forEach(function (tr) { if (tr.getUniqueId() === id) ScriptApp.deleteTrigger(tr); });
  PropertiesService.getScriptProperties().deleteProperty('INV_CONT_TRIGGER');
}

/* -------------------------------------------------------------- Pemicu -------------------------------------------------------------- */
function pasangPemicu() {
  ScriptApp.getProjectTriggers().forEach(function (t) { ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger('mirrorCsv').timeBased().everyMinutes(15).create();
  if (prop_('BQ_PROJECT', '')) ScriptApp.newTrigger('snapshotBigQuery').timeBased().everyMinutes(15).create();
  ScriptApp.newTrigger('refreshBigQuery').timeBased().onMonthDay(1).atHour(2).create();
  if (prop_('BQ_PROJECT', '')) {
    ScriptApp.newTrigger('agregatBigQuery').timeBased().everyDays(1).atHour(4).create();
    ScriptApp.newTrigger('jagaKedaluwarsa').timeBased().onWeekDay(ScriptApp.WeekDay.MONDAY).atHour(3).create();
  }
  ScriptApp.newTrigger('inventarisDrive').timeBased().onWeekDay(ScriptApp.WeekDay.SUNDAY).atHour(3).create();
  log_('pasangPemicu', 'ok', 'mirrorCsv 15 mnt · snapshotBigQuery 15 mnt (bila BQ_PROJECT terisi) · refreshBigQuery tiap tgl 1 · agregatBigQuery harian 04:00 & jagaKedaluwarsa Senin 03:00 (bila BQ_PROJECT terisi) · inventarisDrive Minggu 03:00');
}
