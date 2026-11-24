/* Uji Js.Mutu (fungsi murni): skor per wilayah, isian wajib vs pelengkap, penanda menit. */
const fs = require('fs'), vm = require('vm'), path = require('path');
vm.runInThisContext(fs.readFileSync(path.join(__dirname, '../../src/Js.Mutu.html'), 'utf8').replace(/^<script>|<\/script>\s*$/g, ''));
let fail = 0; const ok = (c, m) => { console.log((c ? 'ok   ' : 'GAGAL ') + m); if (!c) fail++; };
const R = (o) => Object.assign({ id: Math.random().toString(36).slice(2), wilayah: 'Daop 1', date: '2026-10-01', judul: 'x', ka: '10', menit: 5, lokType: 'stasiun', hm: 600, penyebab: 'p', q: '', drvSet: {} }, o);
const L = [R({}), R({ drvSet: { kelas: 1 } }), R({ hm: -1 }), R({ wilayah: 'Daop 2', menit: 0, q: 'Menit kosong' }), R({ wilayah: 'Daop 2', ka: '' }), R({ wilayah: '' , q: 'Lokasi tidak dikenal' })];
const M = KAIMutu.build(L, [R({})], true);
const d1 = M.rows.find(r => r.w === 'Daop 1'), d2 = M.rows.find(r => r.w === 'Daop 2'), nw = M.rows.find(r => r.w === 'Wilayah tidak tercatat');
ok(d1.n === 3 && d1.ok === 1 && Math.abs(d1.skor - 100 / 3) < 1e-9, 'Daop 1: 1 dari 3 lengkap (kategori & jam kosong = wajib)');
ok(d2.n === 2 && d2.ok === 1 && d2.c.menit === 1 && d2.c.ka === 1, 'Daop 2: menit kosong wajib, nomor KA kosong hanya pelengkap');
ok(nw && nw.c.lokasi === 1 && nw.c.wilayah === 1, 'wilayah kosong dikelompokkan "Wilayah tidak tercatat"');
ok(M.total.n === 6 && M.total.ok === 2 && M.total.skorPrev === 100, 'total & pembanding periode lalu');
ok(M.rows[0].w === 'Daop 1' && M.rows[M.rows.length - 1].w === 'Wilayah tidak tercatat', 'urutan Daop lalu tanpa wilayah');
const M0 = KAIMutu.build([R({ menit: 0 })], [], false);
ok(M0.total.c.menit === 1 && M0.C.find(c => c.k === 'menit').label === 'Menit 0 atau kosong', 'data lama tanpa penanda: label jujur "Menit 0 atau kosong"');
ok(KAIMutu.menitFlagged(L) === true && KAIMutu.menitFlagged([R({})]) === false, 'deteksi penanda menit');
console.log(fail ? 'GAGAL ' + fail : 'LULUS');
process.exit(fail ? 1 : 0);
