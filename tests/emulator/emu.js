// Emulator GAS minimal untuk menjalankan pipeline server dashboard di Node (data sintetis, kosakata nyata).
const fs = require('fs'), vm = require('vm'), zlib = require('zlib'), path = require('path'), crypto = require('crypto');
const SRC = path.resolve(__dirname, '../../src'), G26 = process.env.G26_DIR || path.resolve(__dirname, '../../../g26');   // G26_DIR: hasil ekstraksi tools/gapeka2026 (jarak_lintas.json, penomoran.json)
let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
const pick = a => a[Math.floor(rnd() * a.length)];

// ---------- Spreadsheet tiruan ----------
function mkSheet(name, rows) {
  const sh = {
    rows, name,
    getName: () => name, getLastRow: () => rows.length, getLastColumn: () => rows.reduce((m, r) => Math.max(m, r.length), 0),
    getMaxRows: () => Math.max(rows.length, 1000), getMaxColumns: () => Math.max(sh.getLastColumn(), 26),
    insertRowsAfter() {}, insertColumnsAfter() {}, setFrozenRows() {},
    getDataRange() { const w = sh.getLastColumn(); return rng(1, 1, rows.length, w); },
    getRange(r, c, n, m) { return rng(r, c, n || 1, m || 1); },
    appendRow(r) { rows.push(r.slice()); }
  };
  function rng(r, c, n, m) {
    const get = disp => { const out = []; for (let i = 0; i < n; i++) { const row = rows[r - 1 + i] || []; const o = []; for (let j = 0; j < m; j++) { let v = row[c - 1 + j]; if (v === undefined) v = ''; o.push(disp ? (v instanceof Date ? v.toISOString().slice(0, 10) : String(v)) : v); } out.push(o); } return out; };
    return { getValues: () => get(false), getDisplayValues: () => get(true), setNumberFormat() { return this; },
      setValues(v) { v.forEach((row, i) => { rows[r - 1 + i] = rows[r - 1 + i] || []; row.forEach((x, j) => rows[r - 1 + i][c - 1 + j] = x); }); return this; } };
  }
  return sh;
}
function mkSS(id, name, tabs) {
  const ss = { tabs, getId: () => id, getName: () => name, getSheets: () => Object.values(tabs),
    getSheetByName: n => tabs[n] || null, insertSheet: n => (tabs[n] = mkSheet(n, [])), deleteSheet: s => { delete tabs[s.name]; } };
  return ss;
}
// ---------- Data sintetis ----------
// Data acuan: hasil ekstraksi GAPEKA (G26_DIR) bila ada; bila tidak, diturunkan dari seed 19_SeedGapeka26.gs di repo.
let lintas, pen;
if (fs.existsSync(G26 + '/jarak_lintas.json')) {
  lintas = JSON.parse(fs.readFileSync(G26 + '/jarak_lintas.json'));
  pen = JSON.parse(fs.readFileSync(G26 + '/penomoran.json'));
} else {
  const c = {}; vm.runInNewContext(fs.readFileSync(SRC + '/19_SeedGapeka26.gs', 'utf8'), c);
  const g = JSON.parse(zlib.gunzipSync(Buffer.from(c.SEED_GAPEKA26_GZ, 'base64')));
  lintas = g.lintas.map(l => ({ judul: l.judul, wilayah: /^Daop/.test(l.wilayah) ? 'Jawa' : 'Sumatera', kode: l.st.map(x => x[0]), km: l.st.map(x => x[2]) }));
  pen = g.ka.map(k => ({ no: k.no, nama: k.nama, lintas: k.relasi, kelas: k.kelas || '', status: k.f ? 'FAKULTATIF' : 'REGULER' }));
}
const st = {}, seg = [];
lintas.forEach((l, li) => { const d = l.wilayah === 'Jawa' ? 'DAOP ' + (1 + li % 9) : 'DIVRE ' + ['I', 'II', 'III', 'IV'][li % 4];
  l.kode.forEach((k, i) => { if (!st[k]) st[k] = d; if (i) seg.push([d, l.judul, l.kode[i - 1], k, Math.round((l.km[i] - l.km[i - 1]) * 1000) / 1000]); }); });
// Nama stasiun asli dari master gabungan repo (db/csv/master_stasiun.csv); kode tanpa nama tetap memakai kodenya.
const NAMA = Object.fromEntries(fs.readFileSync(path.resolve(__dirname, '../../db/csv/master_stasiun.csv'), 'utf8').trim().split('\n').slice(1).map(l => l.split(',')).map(c => [c[0], c[1]]));
const stRows = [['Singkatan Stasiun', 'Nama Stasiun', 'Wilayah Operasi']].concat(Object.keys(st).map(k => [k, NAMA[k] || k, st[k]]));
const pjRows = [['Daop/Divre', 'Lintas', 'Stasiun A', 'Stasiun B', 'Jarak']].concat(seg);
const kaRows = [['No KA', 'Nama KA', 'Lintas', 'Pnp/brg']].concat(pen.map(p => [p.no, p.nama, p.lintas, /barang|BB|Peti/i.test(p.kelas) ? 'Barang' : 'Penumpang']));
const sarCsv = fs.readFileSync(path.resolve(__dirname, '../../db/gapeka2026/sarana_unit_2026.csv'), 'utf8').trim().split('\n').slice(1).map(l => l.split(','));
const CP = { Lokomotif: 'CPLK01', Kereta: 'CPKR01', Gerbong: 'CPGB01', KRL: 'CPKL01', KRD: 'CPKD01' };
const sarRows = [['no_sarana', 'catalog_profile', 'class_desc', 'dipo_name', 'mulai_dinas', 'manuf_asset', 'kapasitas', 'characteristics_json', 'manuf_model_number', 'equipment_desc']].concat(sarCsv.map((r, i) => [r[5].replace(/\s+/g, ''), CP[r[1]] || 'CPKR01', r[3], r[2], new Date(1985 + (i % 40), i % 12, 1), ['INKA', 'GE', 'CRRC'][i % 3], r[1] === 'Kereta' ? 80 : '', i % 5 ? '' : '{"MAXSPEED":{"number":"120"}}', r[3], r[1]]));
const lok = sarCsv.filter(r => r[1] === 'Lokomotif').map(r => r[5]), ker = sarCsv.filter(r => r[1] === 'Kereta').map(r => r[5]), ger = sarCsv.filter(r => r[1] === 'Gerbong').map(r => r[5]);
const SUBS = [
  ['Sarana', 'Lokomotif - Gangguan PC Open', 'Lokomotif', lok], ['Sarana', 'Lokomotif - Gangguan tenaga lemah', 'Lokomotif', lok],
  ['Sarana', 'Lokomotif - Gangguan radiator', 'Lokomotif', lok], ['Sarana', 'Kereta - Gangguan AC', 'Kereta', ker],
  ['Sarana', 'Pembangkit - Gangguan Radiator Pembangkit', 'Kereta', ker], ['Sarana', 'Gerbong - Gangguan roda Gerbong', 'Gerbong', ger],
  ['Sarana', 'KRD - Gangguan engine KRD', 'KRD', ['KRDI K3 3 09 17']], ['Anak Perusahaan & Eksternal', 'KCI - Gangguan pintu KRD', 'KRL', []],
  ['Anak Perusahaan & Eksternal', 'Eksternal - Ka tertemper kendaraan roda 4', '', []], ['Anak Perusahaan & Eksternal', 'Eksternal - Kendaraan mogok di perlintasan', '', []],
  ['Eksternal', 'Eksternal - Ka tertemper sepeda motor', '', []], ['Anak Perusahaan & Eksternal', 'Eksternal - Penumpang sakit dalam perjalanan', '', []],
  ['Kamtib', 'Pelemparan batu', '', []], ['Kamtib', 'Pencurian - Pencurian Kabel', '', []],
  ['Sintelis', 'Persinyalan - Gangguan Persinyalan Elektrik (Peralatan luar)', '', []], ['Jalan & Jembatan', 'Jalan Rel - Gangguan goyangan keras', '', []],
  ['Jalan & Jembatan', 'Gangguan rel patah', '', []], ['', 'Pengendalian - Kelambatan Ka karena Faktor Pengendalian waktu pekerjaan perawatan prasarana', '', []],
  ['Operasi', 'Perencanaan - Kelambatan karena persilangan', '', []], ['Alam', 'Pohon tumbang', '', []], ['Alam', 'Banjir', '', []], ['', '', '', []]];
const SEED_JPL_SRC = fs.readFileSync(SRC + '/10_Seed.gs', 'utf8');
const jplKm = [...SEED_JPL_SRC.matchAll(/\[\d+,"[^"]*","(\d+)","(\d+\+\d+)"/g)].slice(0, 300).map(m => [m[1], m[2]]);
const HEAD = ['Nomor sumber', 'Kode laporan', 'Tanggal kejadian', 'Hari', 'Bulan', 'Tahun', 'Kategori gangguan', 'Subgangguan', 'Jenis sarana', 'Nomor sarana', 'Wilayah kejadian', 'Depo induk', 'Wilayah depo', 'Judul gangguan', 'Kode jenis gangguan', 'Jam mulai', 'Stasiun', 'Petak jalan', 'Kilometer', 'Nomor sarana penolong', 'Keterangan kejadian', 'Nomor kereta api terkait', 'Total Andil Kelka (menit)', 'Sumber data', 'Tab asal', 'Baris asal', 'Kunci asal', 'SHA-256 sumber', 'Status kualitas', 'Alamat sumber', 'Penyebab terlapor', 'Tindak lanjut terlapor', 'Bukti ekstraksi', 'Status ekstraksi', 'Versi aturan ekstraksi'];
const BLN = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
const N = Number(process.env.EMU_ROWS || 3000), gRows = [HEAD];
const d0 = Date.UTC(2025, 0, 1), d1 = Date.UTC(2026, 9, 31), stCodes = Object.keys(st);
for (let i = 0; i < N; i++) {
  const t = d0 + Math.floor(rnd() * (d1 - d0) / 864e5) * 864e5, dt = new Date(t), serial = Math.round(t / 864e5) + 25569;
  const s = pick(SUBS), code = pick(stCodes), wil = st[code].replace('DAOP', 'Daop').replace('DIVRE', 'Divre');
  const menit = Math.max(1, Math.round(Math.exp(2.3 + rnd() * 2.6))), ka = pick(pen), cross = /perlintasan|tertemper/.test(s[1]);
  const jk = cross && rnd() < .7 ? pick(jplKm) : null, sar = s[3].length ? pick(s[3]) : '';
  gRows.push([i + 1, serial + wil + i, serial, dt.getUTCDate(), BLN[dt.getUTCMonth()], dt.getUTCFullYear(), s[0], s[1], s[2], rnd() < .8 ? sar.replace(/ /g, rnd() < .5 ? '' : ' ') : '',
    wil, s[2] ? 'Dipo ' + code : '', wil, (cross ? 'KA ' + ka.no + ' ' : 'KA ' + ka.no + ' (' + ka.nama + ') ') + s[1].replace(/^.*? - /, ''), i, Math.round(rnd() * 1e4) / 1e4,
    rnd() < .6 ? code : '', rnd() < .4 ? code + '-' + pick(stCodes) : '', jk ? jk[1] : (rnd() < .3 ? Math.floor(rnd() * 400) + '+' + Math.floor(rnd() * 9) : ''), '',
    'Uraian sintetis kejadian ' + (i + 1) + ' di ' + code + '.', ka.no + (rnd() < .2 ? ', ' + pick(pen).no : ''), rnd() < .03 ? '' : menit,
    'REKAP GANGGUAN INPUTAN V2', 'Sheet1', i + 2, 'GOOGLE:' + (i + 2), crypto.createHash('sha256').update(String(i)).digest('hex'), 'Tanpa temuan otomatis', 'Buka baris asli',
    rnd() < .3 ? 'Penyebab sintetis ' + i : '', rnd() < .3 ? 'Tindak lanjut sintetis ' + i : '', '{}', 'Tidak ada kandidat', 'e2']);
}
// Kondisi & pendapatan (format kolom sesuai tab asli; nilai sintetis)
const thiHead = ['Wilayah', 'Periode', 'Bulan', 'Tingkat', 'Unit', 'Healthy Index', 'Grade Healthy Index', 'Condition Index', 'Grade Condition', 'Material', 'Konstruksi', 'Geometri', 'Material - Rel dan Sambungan Las (30%)', 'Material - Sambungan Pelat (20%)', 'Material - Penambat (15%)', 'Material - Wesel (15%)', 'Material - Balas/Plinth (10%)', 'Material - Bantalan (10%)', 'Konstruksi - Badan Jalan dan Lereng (50%)', 'Konstruksi - Drainase (30%)', 'Konstruksi - Lingkungan (20%)', 'Maintenance Index', 'Grade Maintenance', 'Inspeksi Terjadwal', 'PPJ', 'MIR', 'Perawatan Korektif (WMR)', 'PPJ Program', 'PPJ Realisasi', 'MIR Program', 'MIR Realisasi', 'WMR Program', 'WMR Realisasi', 'Panjang Petak Jalan (mSp)', 'Jumlah Hektometer', 'Hm Tanpa Kasus Lengkap - Material'];
const grade = v => v >= 85 ? 'Sangat Baik' : v >= 70 ? 'Baik' : v >= 55 ? 'Cukup' : v >= 40 ? 'Waspada' : 'Kritis';
const thi = [thiHead], units = ['UPT JR 1.1 JAKK', 'UPT JR 1.2 TPK', 'UPT JR 1.3 PSE', 'UPT JR 1.4 MRI', 'UPT JR 1.5 THB', 'UPT JR 9.1 JR', 'UPT JR 9.2 KLT', 'UPT JR 6.1 YK'];
for (let m = 0; m < 12; m++) { const y = m < 2 ? 2025 : 2026, mo = m < 2 ? 11 + m : m - 1, per = y + '-' + String(mo).padStart(2, '0');
  units.forEach(u => { const v = () => Math.round((40 + rnd() * 60) * 10) / 10, h = v(), c = v(), mi = v();
    thi.push(['DAOP ' + u.match(/JR (\d)/)[1], per, BLN[mo - 1] + ' ' + y, 'Resor', u, h, grade(h), c, grade(c), v(), v(), v(), v(), v(), v(), v(), v(), v(), 100, v(), v(), mi, grade(mi), v(), v(), v(), 0, 3807, 2147, 174, 50, 0, 0, 38348, 85, 7]); }); }
const rhiHead = ['nomor_sarana', 'tipe_sarana', 'tgl_data', 'perawatan_terakhir', 'tgl_perawatan', 'reliability_index', 'maintainability_index', 'availability_index', 'rams_index', 'total_request_rows', 'total_terpenuhi', 'list_maintenance_realisasi', 'list_maintenance_seharusnya', 'spare_management_score', 'maintenance_completion_score', 'maintenance_index', 'umur_kereta', 'age_index', 'penalti_open', 'penalti_lengkap', 'real_condition_index', 'onsite_inspection_index', 'condition_index', 'healthy_index', 'healthy_status', 'Berkas sumber'];
const rhi = [rhiHead]; ker.slice(0, 60).forEach(k => { for (let d = 1; d <= 10; d++) { const h = Math.round((50 + rnd() * 50) * 100) / 100;
  rhi.push([k.replace(/ /g, ''), k.split(' ')[0], new Date(Date.UTC(2026, 9, d)), 'P12 (Tahunan)', new Date(Date.UTC(2025, 11, 30)), 60, 20, 4, 84, 8, 6, 'P1 (Bulanan)', 'P1', 7500, 100, 95, 30 * rnd(), 0, '', '', '', 88, 61, h, h > 80 ? 'SEHAT' : h > 65 ? 'MONITOR' : 'KRITIS', 'RHI Lengkap.xlsx']); } });
const wkpHead = ['Nomor sumber', 'Tanggal', 'Wilayah', 'Jenis kegiatan', 'Program mulai', 'Program akhir', 'Program durasi (hari Excel)', 'Realisasi mulai', 'Realisasi akhir', 'Realisasi durasi (hari Excel)', 'Keterangan', 'KA terimbas - kolom L sumber', 'KA terimbas - kolom M sumber', 'Rumus waktu - nilai sumber', 'Sela perka - nilai sumber', 'Durasi dalam menit - nilai sumber', 'Berkas sumber', 'Tab sumber', 'Baris sumber', 'SHA-256 nilai sumber', 'Tanggal terverifikasi', 'Wilayah terverifikasi', 'Catatan penelusuran tanggal', 'Baris tab', 'Tanggal terkoreksi', 'Wilayah terkoreksi', 'Kode aturan', 'Kode aturan penelusuran (database sumber tidak diubah)'];
const wkp = [wkpHead]; for (let i = 0; i < 1500; i++) { const t = new Date(Date.UTC(2025, 9, 1) + Math.floor(rnd() * 395) * 864e5), w = 'DAOP ' + (1 + Math.floor(rnd() * 9)), dur = 30 + Math.floor(rnd() * 180);
  wkp.push([i + 1, t, w, (i % 4 + 1) + '. Window time pekerjaan JJ sintetis (D/' + i + ')\n\nLokasi : Jalur Hilir KMO-KPB ', '00:30', '03:30', 0.125, '00:30', '03:00', dur / 1440, 'Lokasi : sintetis', '', rnd() < .8 ? 'TIADA' : 'KA ' + pick(pen).no, 1, '', dur / 1440, 'REKAP WINDOW TIME .xlsx', 'TEMPAT INPUT', i + 4, 'x', t, w, '', i, t, w, 'U1', '']); }
const passHead = ['Tanggal (Bulan)', 'Pendapatan (Rp)', 'Nomor KA', 'Nama KA', 'Kelas KA', 'Relasi\n (Awal-Akhir Naik)', 'Jumlah\n Penumpang', 'Realisasi Terisi\n EKO (Pnp)', 'Realisasi Terisi\n EKS (Pnp)', 'Realisasi Terisi\n BIS (Pnp)', '% Porsi\n EKO', '% Porsi\n EKS', '% Porsi\n BIS', 'Jenis KA', 'Pendapatan\n EKO (Rp)', 'Pendapatan\n EKS (Rp)', 'Pendapatan\n BIS (Rp)'];
const pass = [passHead], frei = [['Tanggal (Bulan)', 'Pendapatan (Rp)', 'Nama KA', 'Komoditas', 'Komoditas Detail', 'Nama Mitra', 'Volume Real (Ton)', 'Relasi', 'Tarif Rata-rata\n (Rp/Ton)']];
const pnp = pen.filter(p => p.status === 'REGULER').slice(0, 200);
for (let m = 1; m <= 9; m++) { const per = '2026-0' + m; pnp.forEach(p => { const r = Math.round(rnd() * 8e9), n = Math.round(r / 250000);
  pass.push([per, r, p.no, p.nama.toUpperCase(), 'EKS', p.lintas, n, 0, n, 0, '0,0%', '100,0%', '0,0%', 'Komersial', 0, r, 0]); });
  ['Baratarahan', 'Barapati', 'Barasimpang', 'Petikemas Sintetis'].forEach((k, i) => frei.push([per, Math.round(rnd() * 5e11), k, i < 3 ? 'Batu Bara' : 'Petikemas', 'x', 'PT MITRA ' + i, 1e5 * (1 + rnd()), 'TMB-THN', 120000])); }

const SS = {
  '1HmlF2DL4KeHGVSO87aQAKu86dbfrnZohkCA7SsaL3OM': mkSS('src', 'Sumber', { Gangguan_Induk: mkSheet('Gangguan_Induk', gRows), THI: mkSheet('THI', thi), RHI: mkSheet('RHI', rhi), WKP: mkSheet('WKP', wkp), Passenger: mkSheet('Passenger', pass), Freight: mkSheet('Freight', frei) }),
  '15yHI4aO3abw5D-Hhfmrhf0lk3hGQdWF99DRmv7aOoKI': mkSS('gap', 'GAPEKA', { 'LIST KA': mkSheet('LIST KA', kaRows), 'LIST STASIUN': mkSheet('LIST STASIUN', stRows), 'LIST PETAK JALAN': mkSheet('LIST PETAK JALAN', pjRows) }),
  '115j4MRjEKeUkKULyGGhF2pQ4l_OSGhnyBYmZE-pqSc0': mkSS('sar', 'Sarana', { Sheet1: mkSheet('Sheet1', sarRows) })
};
// ---------- Layanan ----------
const props = {}, cache = {}, files = {}; let fid = 0;
function blob(bytes, type, name) { bytes = Buffer.isBuffer(bytes) ? bytes : Array.isArray(bytes) ? Buffer.from(bytes.map(x => x & 255)) : Buffer.from(String(bytes), 'utf8');
  return { getBytes: () => bytes, getDataAsString: () => bytes.toString('utf8'), getContentType: () => type, setContentType(t) { type = t; return this; }, getName: () => name, setName(n) { name = n; return this; } }; }
function mkFile(name, b) { const id = 'f' + (++fid); files[id] = { id, name, data: b.getBytes(), trashed: false };
  return fileObj(id); }
function fileObj(id) { const f = files[id]; if (!f) throw new Error('no file ' + id);
  return { getId: () => id, getName: () => f.name, getBlob: () => blob(f.data), setContent(s) { f.data = Buffer.from(s); return this; }, setTrashed(v) { f.trashed = v; }, getLastUpdated: () => new Date(2026, 10, 17) }; }
const folder = { getId: () => 'fold1', getFilesByName(n) { const l = Object.values(files).filter(f => f.name === n && !f.trashed); let i = 0; return { hasNext: () => i < l.length, next: () => fileObj(l[i++].id) }; }, createFile: b => mkFile(b.getName(), b) };
const ctx = {
  console: { log() {}, warn: (...a) => process.env.EMU_V && console.warn(...a), error: (...a) => console.error(...a), info() {} }, JSON, Date, Math, Object, Array, String, Number, RegExp, Error, parseInt, parseFloat, isNaN, isFinite, encodeURIComponent, decodeURIComponent,
  PropertiesService: { getScriptProperties: () => ({ getProperty: k => props[k] ?? null, setProperty: (k, v) => { props[k] = String(v); }, deleteProperty: k => { delete props[k]; }, getProperties: () => ({ ...props }) }) },
  LockService: { getScriptLock: () => ({ tryLock: () => true, waitLock() {}, releaseLock() {} }) },
  CacheService: { getScriptCache: () => ({ get: k => cache[k] ?? null, put: (k, v) => { cache[k] = v; }, putAll: m => Object.assign(cache, m), getAll: ks => Object.fromEntries(ks.map(k => [k, cache[k]])), remove: k => { delete cache[k]; }, removeAll: ks => ks.forEach(k => delete cache[k]) }) },
  DriveApp: { getFileById: id => { if (SS[id] || id.startsWith('extra')) return { getLastUpdated: () => new Date(2026, 10, 17) }; return fileObj(id); }, getFolderById: () => folder, createFolder: () => folder },
  SpreadsheetApp: { openById: id => { if (!SS[id]) throw new Error('Spreadsheet ' + id + ' tidak ada'); return SS[id]; }, create: n => (SS['extra1'] = mkSS('extra1', n, { Sheet1: mkSheet('Sheet1', []) })) },
  Utilities: {
    newBlob: (d, t, n) => blob(d, t, n), gzip: b => blob(zlib.gzipSync(b.getBytes()), 'application/x-gzip'), ungzip: b => blob(zlib.gunzipSync(b.getBytes())),
    base64Encode: b => Buffer.from(Array.isArray(b) ? b.map(x => x & 255) : b).toString('base64'), base64Decode: s => [...Buffer.from(s, 'base64')].map(x => x > 127 ? x - 256 : x),
    formatDate(d, tz, f) { const j = new Date(d.getTime() + 7 * 3600e3), p = n => String(n).padStart(2, '0');
      return f.replace('yyyy', j.getUTCFullYear()).replace('MM', p(j.getUTCMonth() + 1)).replace('dd', p(j.getUTCDate())).replace('HH', p(j.getUTCHours())).replace('mm', p(j.getUTCMinutes())).replace('ss', p(j.getUTCSeconds())); },
    computeDigest: (a, s) => [...crypto.createHash('sha256').update(String(s)).digest()].map(x => x > 127 ? x - 256 : x), DigestAlgorithm: { SHA_256: 'sha256' }, Charset: { UTF_8: 'utf8' }, sleep() {}, getUuid: () => crypto.randomUUID()
  },
  HtmlService: {}, ScriptApp: {}, Session: { getActiveUser: () => ({ getEmail: () => process.env.EMU_USER || '' }), getEffectiveUser: () => ({ getEmail: () => 'pemilik@contoh.id' }) }
};
vm.createContext(ctx);
fs.readdirSync(SRC).filter(f => f.endsWith('.gs')).sort().forEach(f => vm.runInContext(fs.readFileSync(path.join(SRC, f), 'utf8'), ctx, { filename: f }));
module.exports = { ctx, run: code => vm.runInContext(code, ctx), SS };
if (require.main === module) {
  const t = Date.now(), r = vm.runInContext('runSync_(true, "uji")', ctx);
  console.log('runSync_', JSON.stringify(r), (Date.now() - t) + ' ms'); console.log('status', props.SYNC_STATUS);
  const out = {}; ['apiBootstrap()', 'apiNarratives()', 'apiRef()', 'apiStatus()', 'apiGapeka26()', 'apiBatubara()'].forEach(c => { out[c.replace('()', '')] = vm.runInContext(c, ctx); });
  out.apiGapeka = { __byArg: true, '2025': vm.runInContext('apiGapeka("2025")', ctx), '2026': vm.runInContext('apiGapeka("2026")', ctx), x: vm.runInContext('apiGapeka("1999")', ctx) };
  // apiBatubaraPart: data SINTETIS (tools/batubara/fixture_sintetis.py) — server asli membaca DB Batubara lewat BB_DB_ID.
  try {
    const fx = JSON.parse(fs.readFileSync(path.join(__dirname, 'bb_fixture.json'), 'utf8'));
    out.apiBatubaraPart = { __byArg: true };
    Object.keys(fx).forEach(k => { out.apiBatubaraPart[k] = { ok: true, version: 'sintetis', built: '2026-11-24 00:00', sourceUpdated: '2026-11-24 00:00', db: 'DATA SINTETIS (emulator)', counts: {}, gz: zlib.gzipSync(Buffer.from(JSON.stringify(fx[k]))).toString('base64') }; });
  } catch (eb) { console.log('fixture Batubara tidak ada: ' + eb.message); }
  console.log('apiGapeka 2025', out.apiGapeka['2025'].ok, '2026', out.apiGapeka['2026'].ok, 'tahun tak dikenal ditolak:', out.apiGapeka.x.ok === false);
  // apiKaOps: jawaban per nomor KA yang muncul di snapshot (+ satu nomor tak dikenal untuk uji penolakan).
  try {
    const core = JSON.parse(zlib.gunzipSync(Buffer.from(out.apiBootstrap.core, 'base64')).toString('utf8')), iKa = core.fields.indexOf('ka'), kas = {};
    core.rows.forEach(r => { if (r[iKa]) kas[String(r[iKa])] = 1; });
    out.apiKaOps = { __byArg: true, 'x;1': vm.runInContext('apiKaOps("x;1")', ctx) };
    Object.keys(kas).forEach(k => { const v = vm.runInContext('apiKaOps(' + JSON.stringify(k) + ')', ctx); if (v.ok) out.apiKaOps[k] = v; });
    console.log('apiKaOps', Object.keys(out.apiKaOps).length - 1, 'KA · nomor tak dikenal ditolak:', out.apiKaOps['x;1'].ok === false);
  } catch (e) { console.log('apiKaOps dilewati:', e.message); }
  Object.entries(out).forEach(([k, v]) => console.log(k, v.ok, v.error || '', JSON.stringify(v).length));
  fs.writeFileSync(__dirname + '/api.json', JSON.stringify(out));
}
