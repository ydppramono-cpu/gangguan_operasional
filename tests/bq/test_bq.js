/**
 * test_bq.js — uji adaptor BigQuery web app (src/22_Bq.gs) tanpa BigQuery sungguhan.
 * Tiruan BigQuery.Jobs mengembalikan isi sheet sintetis emulator dalam bentuk REST BigQuery (semua nilai teks,
 * tanggal ISO, halaman bertoken, jobComplete=false pada panggilan pertama). Yang diuji:
 *   1. Kondisi.build(jalur BigQuery) === Kondisi.build(jalur Sheets)  (bandingKondisi_ → cocok)
 *   2. readKondisiAuto_: KONDISI_SUMBER kosong → Sheets; =bq → BigQuery; BigQuery galat → kembali ke Sheets
 *   3. SQL hanya memakai nama tabel dari daftar tertutup BQ_KOLOM dan BQ_PROJECT yang sah.
 * Catatan: format teks yang dihasilkan tabel eksternal BigQuery atas Sheets TIDAK diuji di sini — itu tugas
 * ujiKondisiBq() di editor Apps Script terhadap data asli.
 */
const assert = require('assert');
const { ctx, run, SS } = require('../emulator/emu.js');
const src = SS['1HmlF2DL4KeHGVSO87aQAKu86dbfrnZohkCA7SsaL3OM'];
const SHEET = { thi: 'THI', rhi: 'RHI', wkp: 'WKP' }, KOLOM = run('BQ_KOLOM'), PAGE = 37;
const p2 = n => String(n).padStart(2, '0');
function teks(v, tipe) {
  if (v === '' || v == null) return null;
  if (v instanceof Date) return v.getFullYear() + '-' + p2(v.getMonth() + 1) + '-' + p2(v.getDate());
  if (tipe === 'N') { const x = typeof v === 'number' ? v : Number(String(v).replace(/\s/g, '').replace(',', '.')); return isFinite(x) ? String(x) : null; }
  return String(v);
}
let calls = [], gagal = false;
function rowsFor(sql) {
  const m = /FROM `([^`]+)\.kai_snap\.([a-z_]+)`/.exec(sql); assert(m, 'SQL tanpa kai_snap: ' + sql);
  const name = m[2], vals = src.getSheetByName(SHEET[name]).getDataRange().getValues(), head = vals[0].map(String);
  const cols = KOLOM[name].map(c => [head.indexOf(c[1]), c[2]]);
  return vals.slice(1).filter(r => r.some(x => x !== '' && x != null)).map(r => ({ f: cols.map(([i, t]) => ({ v: i < 0 ? null : teks(r[i], t) })) }));
}
const jobs = {};
ctx.BigQuery = { Jobs: {
  query(req, proj) {
    calls.push({ proj, sql: req.query }); if (gagal) throw new Error('tiruan: kuota habis');
    const id = 'j' + calls.length; jobs[id] = rowsFor(req.query);
    return { jobReference: { jobId: id }, jobComplete: false };
  },
  getQueryResults(proj, id, opt) {
    const all = jobs[id], start = Number(opt.pageToken || 0), rows = all.slice(start, start + PAGE);
    return { jobComplete: true, rows, pageToken: start + PAGE < all.length ? String(start + PAGE) : undefined };
  } } };
const setP = (k, v) => run(`PropertiesService.getScriptProperties().setProperty(${JSON.stringify(k)}, ${JSON.stringify(v)})`);

// Lembar sintetis emulator lebih tua dari skema (beberapa kolom skema tidak ada). Lembar asli memakai judul skema,
// jadi acuan "Sheets" di uji ini = lembar sintetis yang diproyeksikan ke judul skema (kolom tak ada → kosong).
for (const [k, nm] of Object.entries(SHEET)) {
  const sh = src.getSheetByName(nm), v = sh.getDataRange().getValues(), h = v[0].map(String), ix = KOLOM[k].map(c => h.indexOf(c[1]));
  const proj = [KOLOM[k].map(c => c[1])].concat(v.slice(1).map(r => ix.map(i => (i < 0 ? '' : r[i]))));
  sh.getDataRange = () => ({ getValues: () => proj.map(r => r.slice()), getDisplayValues: () => proj.map(r => r.map(String)) });
}
// 2a. tanpa properti → Sheets
assert.strictEqual(run('readKondisiAuto_().sumber'), 'Google Sheets');
setP('BQ_PROJECT', 'kai-sandbox-uji');
assert.strictEqual(run('readKondisiAuto_().sumber'), 'Google Sheets', 'BQ_PROJECT saja belum mengaktifkan');
setP('KONDISI_SUMBER', 'bq');
// 1. kesetaraan hasil
const r = run(`(function () { var ym = '2026-11', a = Kondisi.build(readKondisi_(), ym, []), b = Kondisi.build(readKondisiBq_(), ym, []);
  return { cmp: bandingKondisi_(a, b), n: { thi: a.thi.length, rhi: b.rhi.length, wkp: b.wkp.length } }; })()`);
console.log('baris sheets/bq:', JSON.stringify(r.cmp.bagian));
assert(r.n.rhi > 0 && r.n.thi > 0 && r.n.wkp > 0, 'data sintetis kosong');
assert(r.cmp.cocok, 'hasil jalur BigQuery berbeda dengan Sheets');
assert(calls.every(c => c.proj === 'kai-sandbox-uji'), 'proyek kueri salah');
assert(calls.some(c => /ORDER BY SAFE_CAST\(baris_sumber/.test(c.sql)), 'urutan baris sumber tidak dipakai');
// 2b. aktif → BigQuery; galat → Sheets
assert.strictEqual(run('readKondisiAuto_().sumber'), 'BigQuery kai_snap');
gagal = true;
assert(/^Google Sheets \(cadangan; BigQuery gagal: tiruan: kuota habis\)$/.test(run('readKondisiAuto_().sumber')));
gagal = false;
// 3. daftar tertutup
assert.throws(() => run("bqSqlTabel_('gangguan_induk; DROP')"), /tidak dikenal/);
setP('BQ_PROJECT', 'x`; DROP TABLE y; --');
assert.throws(() => run("bqSqlTabel_('rhi')"), /BQ_PROJECT tidak sah/);
// sinkron penuh tetap jalan dengan sumber BigQuery dan mencatat sumbernya
setP('BQ_PROJECT', 'kai-sandbox-uji');
const s = run(`(function () { var x = runSync_(true, 'uji-bq'); return x && x.ok; })()`);
assert(s, 'runSync_ gagal dengan KONDISI_SUMBER=bq');
console.log('LULUS — adaptor BigQuery: hasil setara Sheets, cadangan Sheets bekerja, masukan tertutup.');
