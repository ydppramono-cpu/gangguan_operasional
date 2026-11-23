// Uji data GAPEKA (switch global, Js.Gapeka): seed dapat dibuka & diindeks, jam per perjalanan tidak mundur
// (lewat tengah malam di-unwrap), km stasiun per lintas tidak mundur, baris jadwal lengkap. Pemakaian: node test_gapeka.js 2025|2026
const fs = require('fs'), vm = require('vm'), zlib = require('zlib'), path = require('path');
vm.runInThisContext(fs.readFileSync(path.resolve(__dirname, '../../src/Js.Gapeka.html'), 'utf8').replace(/^<script>|<\/script>\s*$/g, ''));
const K = globalThis.KAIG, th = process.argv[2] || '2026';
const f = { 2025: '20_SeedGapeka25.gs', 2026: '19_SeedGapeka26.gs' }[th], c = {};
vm.runInNewContext(fs.readFileSync(path.resolve(__dirname, '../../src', f), 'utf8'), c);
const d = K.index(JSON.parse(zlib.gunzipSync(Buffer.from(c['SEED_GAPEKA' + th.slice(2) + '_GZ'], 'base64'))));
let fails = 0; const ok = (x, m) => { if (!x) { fails++; if (fails < 20) console.log('GAGAL:', m); } };
ok(K.versiBerlaku('2026-11-30') === '2025' && K.versiBerlaku('2026-12-01') === '2026', 'versi berlaku per tanggal');
d.lintas.forEach(l => { for (let i = 1; i < l.st.length; i++) ok(l.st[i][2] >= l.st[i - 1][2], l.id + ' km mundur di ' + l.st[i][0]); });
d.ka.forEach(k => {
  let prev = -1, off = 0;
  k.pts.forEach(p => [p[1], p[2]].forEach(t => { if (t < 0) return; let u = t + off; if (prev >= 0 && u < prev - 6 * 3600) { off += 86400; u += 86400; } ok(u >= prev - 60, th + ' KA ' + k.no + ' jam mundur di ' + p[0]); prev = Math.max(prev, u); }));
});
const rows = K.jadwalRowsOf(d);
ok(rows.length === d.ka.length && rows.every(r => r[0] && r[4].split('\n').length >= 2), 'baris jadwal lengkap');
console.log('GAPEKA ' + th + ': lintas ' + d.lintas.length + ' · KA ' + d.ka.length + ' · gagal ' + fails);
process.exit(fails ? 1 : 0);
