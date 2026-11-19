/**
 * 22_Bq.gs — Adaptor BigQuery (opsional) untuk tabel kondisi THI / RHI / WKP (alternatif B).
 *
 * Aktif hanya bila Script Properties:  BQ_PROJECT = ID proyek BigQuery sandbox  DAN  KONDISI_SUMBER = bq
 * serta layanan lanjutan BigQuery (v2) aktif di proyek Apps Script ini. Selain itu — atau bila kueri gagal — ETL
 * memakai jalur lama readKondisi_() (Google Sheets). Sumber yang dipakai dicatat di ref.kondisi.stats.sumberBaca.
 *
 * Membaca tabel salinan kai_snap.<tabel> (dibuat & diperbarui platform/Platform.gs → snapshotBigQuery) dengan alias
 * kolom = judul sheet asli (peta di 21_BqKolom.gs), sehingga Kondisi.build menerima bentuk yang sama dengan
 * getDataRange().getValues(): baris 1 judul, nilai teks/angka, tanggal ISO. Tidak ada angka yang dihitung di sini.
 *
 * Sebelum menyalakan KONDISI_SUMBER=bq jalankan ujiKondisiBq() dari editor: membandingkan hasil Kondisi.build
 * jalur Sheets vs BigQuery dan menulis selisihnya ke log. Nyalakan hanya bila "cocok".
 */
var BQ_CFG = { LOCATION: 'asia-southeast2', SNAP: 'kai_snap', TIMEOUT_MS: 60000, POLL_MS: 1500, MAX_POLL: 40 };

function bqProject_() { return PropertiesService.getScriptProperties().getProperty('BQ_PROJECT') || ''; }
function bqTersedia_() { return !!bqProject_() && typeof BigQuery !== 'undefined'; }
function bqAktif_() {
  var s = String(PropertiesService.getScriptProperties().getProperty('KONDISI_SUMBER') || '').trim().toLowerCase();
  return s === 'bq' && bqTersedia_();
}

/** Kueri SQL standar → array baris (array nilai teks; null → ''). Mengikuti halaman hasil sampai habis. */
function bqQuery_(sql) {
  var p = bqProject_(), res = BigQuery.Jobs.query({ query: sql, useLegacySql: false, location: BQ_CFG.LOCATION, timeoutMs: BQ_CFG.TIMEOUT_MS }, p);
  var job = res.jobReference.jobId, n = 0;
  while (!res.jobComplete) {
    if (++n > BQ_CFG.MAX_POLL) throw new Error('Kueri BigQuery melewati batas waktu.');
    Utilities.sleep(BQ_CFG.POLL_MS);
    res = BigQuery.Jobs.getQueryResults(p, job, { location: BQ_CFG.LOCATION });
  }
  var out = [];
  function add(rows) { (rows || []).forEach(function (r) { out.push(r.f.map(function (c) { return c.v == null ? '' : c.v; })); }); }
  add(res.rows);
  while (res.pageToken) { res = BigQuery.Jobs.getQueryResults(p, job, { location: BQ_CFG.LOCATION, pageToken: res.pageToken }); add(res.rows); }
  return out;
}

/** SELECT untuk satu tabel kondisi: kolom tanggal → teks ISO (jatuh ke teks asli bila tak terurai), angka → teks. */
function bqSqlTabel_(name) {
  var cols = BQ_KOLOM[name]; if (!cols) throw new Error('Tabel kondisi tidak dikenal: ' + name);
  if (!/^[a-z0-9_-]+$/i.test(bqProject_())) throw new Error('BQ_PROJECT tidak sah.');
  var sel = cols.map(function (c) {
    if (c[2] === 'D') return 'COALESCE(CAST(' + c[0] + ' AS STRING), ' + c[0] + '_teks)';
    if (c[2] === 'N') return 'CAST(' + c[0] + ' AS STRING)';
    return c[0];
  });
  // Urutan baris mengikuti baris sumber (setara urutan sheet) agar "baris terakhir" sama dengan jalur Sheets.
  var ord = cols.some(function (c) { return c[0] === 'baris_sumber'; }) ? ' ORDER BY SAFE_CAST(baris_sumber AS FLOAT64), ' + cols[0][0] : '';
  return 'SELECT ' + sel.join(', ') + ' FROM `' + bqProject_() + '.' + BQ_CFG.SNAP + '.' + name + '`' + ord;
}
/** Baris 1 = judul sheet; kolom angka dikembalikan sebagai Number (setara getValues), lainnya teks. */
function bqTabelMentah_(name) {
  var cols = BQ_KOLOM[name];
  var rows = bqQuery_(bqSqlTabel_(name)).map(function (r) {
    return r.map(function (v, i) { if (cols[i][2] !== 'N' || v === '') return v; var x = Number(v); return isFinite(x) ? x : v; });
  });
  return [cols.map(function (c) { return c[1]; })].concat(rows);
}
/** Bentuk sama dengan readKondisi_(): { thi: values, rhi: values, wkp: values }. */
function readKondisiBq_() {
  var out = {};
  Object.keys(KONDISI_SHEETS).forEach(function (k) { out[k] = bqTabelMentah_(k); });
  return out;
}
/** Dipakai ETL: { raw, sumber }. Kegagalan BigQuery tidak menghentikan sinkron — jatuh ke Sheets. */
function readKondisiAuto_() {
  if (!bqAktif_()) return { raw: readKondisi_(), sumber: 'Google Sheets' };
  try { return { raw: readKondisiBq_(), sumber: 'BigQuery kai_snap' }; }
  catch (e) {
    console.warn('BigQuery kondisi gagal, kembali ke Sheets: ' + e);
    return { raw: readKondisi_(), sumber: 'Google Sheets (cadangan; BigQuery gagal: ' + String(e && e.message || e).slice(0, 160) + ')' };
  }
}

/** Ringkasan perbandingan dua hasil Kondisi.build (baris diurutkan agar urutan tidak memengaruhi). */
function bandingKondisi_(a, b) {
  function canon(rows) { return (rows || []).map(function (r) { return JSON.stringify(r); }).sort(); }
  var out = { cocok: true, bagian: {} };
  ['thi', 'thiPetak', 'rhi', 'wkp'].forEach(function (k) {
    var x = canon(a[k]), y = canon(b[k]), sx = {}, beda = [];
    x.forEach(function (s) { sx[s] = (sx[s] || 0) + 1; });
    y.forEach(function (s) { if (sx[s]) sx[s]--; else beda.push('+bq ' + s); });
    Object.keys(sx).forEach(function (s) { for (var i = 0; i < sx[s]; i++) beda.push('-sheets ' + s); });
    out.bagian[k] = { sheets: x.length, bq: y.length, selisih: beda.length, contoh: beda.slice(0, 5) };
    if (beda.length) out.cocok = false;
  });
  var da = JSON.stringify(a.rhiDay || null), db = JSON.stringify(b.rhiDay || null);
  out.bagian.rhiDay = { sama: da === db }; if (da !== db) out.cocok = false;
  return out;
}

/** Judul kolom sheet asli vs skema (sumber_tabel.json). Kolom skema yang tidak ada di sheet membuat hasil berbeda. */
function bqCekJudul_() {
  var ss = SpreadsheetApp.openById(cfg_('SOURCE_SPREADSHEET_ID'));
  return Object.keys(KONDISI_SHEETS).map(function (k) {
    var sh = ss.getSheetByName(KONDISI_SHEETS[k]), h = sh ? sh.getRange(1, 1, 1, sh.getLastColumn()).getValues()[0].map(String) : [];
    var sk = BQ_KOLOM[k].map(function (c) { return c[1]; });
    return { tabel: k, hilang: sk.filter(function (x) { return h.indexOf(x) < 0; }), tambahan: h.filter(function (x) { return x && sk.indexOf(x) < 0; }) };
  });
}
/** Jalankan dari editor (pemilik). Membandingkan jalur Sheets vs BigQuery; tidak mengubah data apa pun. */
function ujiKondisiBq() {
  var act = '', eff = '';
  try { act = Session.getActiveUser().getEmail(); eff = Session.getEffectiveUser().getEmail(); } catch (e) { }
  if (!act || act !== eff) throw new Error('Hanya pemilik skrip (dari editor Apps Script).');
  if (!bqTersedia_()) throw new Error('BQ_PROJECT belum diisi atau layanan lanjutan BigQuery belum aktif.');
  var ym = Utilities.formatDate(new Date(), 'Asia/Jakarta', 'yyyy-MM'), m = readMasters_(), x = readExtra_();
  var st = buildRef_({ ka: m.ka, st: m.st, pj: m.pj, sar: m.sar, jpl: x.jpl, jadwal: x.jadwal, ops: x.ops, depo: x.depo, ruj: x.ruj }).st;
  var t0 = Date.now(), a = Kondisi.build(readKondisi_(), ym, st), t1 = Date.now(), b = Kondisi.build(readKondisiBq_(), ym, st), t2 = Date.now();
  var r = bandingKondisi_(a, b); r.kolom = bqCekJudul_(); if (r.kolom.some(function (x) { return x.hilang.length; })) r.cocok = false;
  r.detik = { sheets: Math.round((t1 - t0) / 100) / 10, bigquery: Math.round((t2 - t1) / 100) / 10 };
  console.log(JSON.stringify(r, null, 1));
  return r.cocok ? 'cocok — KONDISI_SUMBER=bq aman dinyalakan' : 'BEDA — periksa log sebelum menyalakan KONDISI_SUMBER=bq';
}
