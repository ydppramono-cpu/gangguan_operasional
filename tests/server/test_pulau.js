/**
 * test_pulau.js — aturan pulau Paket A (audit 20 Nov 2026), dijalankan pada kode .gs asli lewat emulator.
 *  1. Sarana pulau lain, 1 kejadian  → dilepas dari kejadian + masuk antrean verifikasi.
 *  2. Sarana pulau lain, ≥ 2 kejadian → dicatat sebagai mutasi, tautan dipertahankan.
 *  3. "KA 7" di Divre 3 → S7 (awalan wilayah) bila S7 ada di Buku Penomoran.
 *  4. Nomor KA Jawa pada kejadian Divre tanpa padanan berawalan → nama KA tidak ditautkan.
 *  5. Kategori & Subgangguan kosong + judul tegas → kelas diturunkan (berlabel), bukan "belum".
 *  6. Daftar KA depo induk Sumatera: nomor tanpa awalan diberi awalan; nomor Jawa ditolak.
 */
const assert = require('assert');
const { run } = require('../emulator/emu.js');
const out = run(`(function () {
  var D = Domain;
  var idx = D.buildIndex({
    stations: [['KPT', 'Kertapati', 'Divre III'], ['GMR', 'Gambir', 'Daop 1'], ['BKS', 'Bekasi', 'Daop 1']],
    segments: [], timetable: [],
    trains: [['7', 'Argo Bromo Anggrek', 'GMR-SBI', 'PNP'], ['S7', 'Rajabasa', 'KPT-TNK', 'PNP'], ['45', 'Taksaka', 'YK-GMR', 'PNP']],
    sarana: [['CC2061506', 'Lokomotif', 'DEPO LOK YK', '', 'B060'], ['K300936', 'Kereta', 'DEPO KRT TNK', '', 'C032'], ['CC2040902', 'Lokomotif', 'DEPO LOK KPT', '', 'C031']]
  });
  var H = Object.keys(SOURCE_COLUMNS).map(function (k) { return SOURCE_COLUMNS[k]; }).concat(Object.keys(SOURCE_COLUMNS_OPT).map(function (k) { return SOURCE_COLUMNS_OPT[k]; }));
  function row(o) { var r = H.map(function () { return ''; }); Object.keys(o).forEach(function (k) { var i = H.indexOf(SOURCE_COLUMNS[k] || SOURCE_COLUMNS_OPT[k]); if (i >= 0) r[i] = o[k]; }); return r; }
  var n = 0;
  function ev(o) { n++; return row(Object.assign({ kunci: 'T:' + n, tanggalKejadian: '2026-0' + (n % 9 + 1) + '-10', menit: 10, judul: 'uji ' + n, kategori: 'Sarana', sub: 'Lokomotif' }, o)); }
  var vals = [H,
    ev({ wilayah: 'Divre 3', noSarana: 'CC 206 15 06', ka: '3126' }),
    ev({ wilayah: 'Divre 3', noSarana: 'CC2061506', ka: '3551' }),
    ev({ wilayah: 'Daop 3', noSarana: 'K3 0 09 36', ka: '162' }),
    ev({ wilayah: 'Divre 3', ka: '7' }),
    ev({ wilayah: 'Divre 3', ka: '45' }),
    ev({ wilayah: 'Daop 1', ka: '7', kategori: '', sub: '', judul: 'KA 7 tertemper pohon tumbang' })
  ];
  var t = transformRows_(vals, idx, '2026-12');
  var f = t.fields, R = t.rows.map(function (r) { var o = {}; f.forEach(function (k, i) { o[k] = r[i]; }); return o; });
  var dep = buildRef_({ st: [['Singkatan Stasiun', 'Nama Stasiun', 'Wilayah Operasi'], ['MDN', 'Medan', 'Divre I'], ['CPN', 'Cipinang', 'Daop 1']],
    depo: [['Depo', 'Kode stasiun', 'Jenis', 'No KA', 'Sumber'], ['Medan', 'MDN', 'Depo induk rangkaian', '1, 2, 45, U51', 'Duksar (Sumatera)'], ['Cipinang', 'CPN', 'Depo induk rangkaian', '7, 45', 'Duksar (Jawa)']] }).depo;
  return { R: R, stats: { mut: t.stats.saranaMutasi, ver: t.stats.saranaVerifikasi, kaBeda: t.stats.kaBedaPulau, turun: t.stats.kelasDiturunkan }, dep: dep, fields: f };
})()`);
const R = out.R, F = out.fields;
const sarK = F.find(k => /sar/i.test(k) && !/raw|text|sumber/i.test(k)) || F[9];
const kaK = F[16], kaNm = F[17], kelasK = F[3], qK = F[26];
assert.strictEqual(R[0][sarK], 'CC2061506', 'mutasi: tautan dipertahankan (1)');
assert.strictEqual(R[1][sarK], 'CC2061506', 'mutasi: tautan dipertahankan (2)');
assert.strictEqual(JSON.stringify(out.stats.mut.map(m => [m[0], m[1], m[4]])), JSON.stringify([['CC2061506', 'Sumatera', 2]]));
assert.strictEqual(R[2][sarK], '', 'satu kejadian pulau lain: dilepas');
assert(/perlu verifikasi/.test(R[2][qK]));
assert.strictEqual(out.stats.ver.length, 1);
assert.strictEqual(R[3][kaK], 'S7'); assert.strictEqual(R[3][kaNm], 'Rajabasa');
assert.strictEqual(R[4][kaNm], '', 'KA Jawa di Divre tidak ditautkan'); assert(/beda pulau|terdaftar di Jawa/.test(R[4][qK]));
assert.strictEqual(R[5][kelasK], 'alam'); assert(/diturunkan/.test(R[5][qK])); assert.strictEqual(out.stats.turun, 1);
assert.strictEqual(out.dep[0][3], 'U1, U2, U51'); assert(/ditolak \(pulau lain\): 45/.test(out.dep[0][4]));
assert.strictEqual(out.dep[1][3], '7, 45');
console.log('LULUS — aturan pulau: mutasi dipertahankan, nomor diragukan dilepas, awalan KA Sumatera, KA lintas pulau ditolak, kelas diturunkan, daftar depo bersih.');
