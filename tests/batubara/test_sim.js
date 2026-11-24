// Uji mesin efek domino Papan skenario GAPEKA (src/Js.Simulasi.html) dengan data asli seed GAPEKA + SEED_BB.
// Pemakaian: node tests/batubara/test_sim.js
const fs = require('fs'), vm = require('vm'), zlib = require('zlib'), path = require('path'), assert = require('assert');
const S = f => fs.readFileSync(path.resolve(__dirname, '../../src', f), 'utf8');
vm.runInThisContext(S('Js.Simulasi.html').replace(/^<script>|<\/script>\s*$/g, ''));
const Sim = globalThis.KAISim, c = {};
vm.runInNewContext(S('27_SeedBatubara.gs'), c);
const BB = JSON.parse(zlib.gunzipSync(Buffer.from(c.SEED_BB_GZ, 'base64')));
let fails = 0; const ok = (x, m) => { if (!x) { fails++; console.log('GAGAL:', m); } else console.log('ok  ', m); };
['2025', '2026'].forEach(v => {
  const g = {}; vm.runInNewContext(S(v === '2025' ? '20_SeedGapeka25.gs' : '19_SeedGapeka26.gs'), g);
  const G = JSON.parse(zlib.gunzipSync(Buffer.from(g['SEED_GAPEKA' + v.slice(2) + '_GZ'], 'base64')));
  let t0 = Date.now(); const P = Sim.prepare(G, BB, v); const tp = Date.now() - t0;
  t0 = Date.now(); const B = Sim.run(P, []); const tb = Date.now() - t0;
  ok(!B.error, v + ': dasar tanpa siklus graf (' + P.trains.length + ' KA, ' + B.N.length + ' kejadian, siklus ' + B.nSik + ', siapkan ' + tp + ' ms, hitung ' + tb + ' ms)');
  const late = B.trains.filter(x => x.max >= 1);
  ok(late.length === 0, v + ': skenario kosong = GAPEKA persis (KA terlambat: ' + late.slice(0, 5).map(x => x.no + ' ' + x.max + 'm ' + x.cause).join(', ') + ')');
  ok(tb < 1500, v + ': satu putaran < 1,5 dtk');
  // KA batubara isi berangkat dari TMB: tahan 60 menit di TMB
  const k = P.trains.find(t => t.pts[0].c === 'TMB' && /ISI/i.test(t.kelas || t.muat));
  ok(!!k, v + ': ada KA isi dari TMB (' + (k && k.no) + ')');
  const sc = Sim.run(P, [{ jenis: 'tahan', no: k.no, st: 'TMB', m: 60 }]), cmp = Sim.compare(P, B, sc, [{ jenis: 'tahan', no: k.no, st: 'TMB', m: 60 }]);
  const me = sc.trains.find(x => x.no === k.no && x.day === 0);
  ok(me.max >= 59, v + ': KA ' + k.no + ' tertahan ±60 mnt (' + me.max + ')');
  ok(cmp.knock.length >= 1 && !cmp.knock.some(x => x.no === k.no && x.day === 0), v + ': efek domino ke KA lain: ' + cmp.knock.length + ' KA, ' + cmp.menit + ' mnt; sebab ' + [...new Set(cmp.knock.map(x => x.cause))].join('/'));
  ok(sc.links.length >= 1, v + ': rantai sebab-akibat tercatat (' + sc.links.slice(0, 4).map(l => sc.trains[l.a].no + '→' + sc.trains[l.b].no + ' ' + l.ty + '@' + l.st).join(', ') + ')');
  const g2 = Sim.run(P, [{ jenis: 'geser', no: k.no, m: 25 }]);
  ok(!g2.error, v + ': geser 25 mnt berhasil; terdampak ' + Sim.compare(P, B, g2).knock.length + ' KA');
  const pr = Sim.run(P, [{ jenis: 'tahan', no: k.no, st: 'TMB', m: 60 }], { prioritas: true });
  ok(!pr.error, v + ': mode prioritas berjalan (tukar ' + pr.nSwap + ')');
  const bt = Sim.run(P, [{ jenis: 'batal', no: k.no }]);
  ok(!bt.trains.some(x => x.no === k.no), v + ': KA batal tidak disimulasikan');
  const enc = Sim.encode([{ jenis: 'geser', no: '3100', m: 30 }, { jenis: 'tahan', no: '3104', st: 'PBM', m: 15 }, { jenis: 'batal', no: '3220' }]);
  ok(JSON.stringify(Sim.decode(enc)) === JSON.stringify([{ jenis: 'geser', no: '3100', m: 30 }, { jenis: 'tahan', no: '3104', st: 'PBM', m: 15 }, { jenis: 'batal', no: '3220' }]), v + ': kode skenario URL bolak-balik');
  ok(Sim.decode("g:3100:30;<script>;t:x@y:z").length === 1, v + ': kode URL tak sah diabaikan');
  // uji ulang: realisasi buatan = jadwal + 40 mnt sejak stasiun pertama → model harus lebih dekat daripada jadwal saja
  const rows = []; k.pts.slice(0, 6).forEach(p => rows.push({ no: k.no, c: p.c, ra: p.a + 40, rd: p.d + 40 }));
  const bk = Sim.backtest(P, rows);
  ok(bk.n >= 3 && bk.maeModel < bk.maeJadwal, v + ": uji ulang model (" + (bk.maeModel || 0).toFixed(1) + " mnt) lebih dekat dari jadwal (" + (bk.maeJadwal || 0).toFixed(1) + ' mnt)');
  // KLB & slot kosong: slot pertama yang ditemukan → simulasi penuh tidak menunda KA lain di petak (konflik petak = 0)
  const W = Sim.findSlots(P, B, k.no, -600, 600);
  ok(W.length >= 1 && !W.some(w => w.m0 <= 0 && w.m1 >= 0), v + ': slot kosong KLB pola ' + k.no + ': ' + W.length + ' rentang (geser 0 = berbenturan dengan KA pola sendiri)');
  const wm = Math.round((W[0].m0 + W[0].m1) / 2), ek = [{ jenis: 'klb', no: 'KLB-1', pola: k.no, m: wm }], PK = Sim.withKlb(P, ek), SK = Sim.run(PK, ek), CK = Sim.compare(PK, B, SK, ek);
  const petakHit = CK.knock.filter(x => ['headway', 'silang'].includes(x.cause) && x.src >= 0 && SK.trains[x.src].no === 'KLB-1');
  ok(!SK.error && SK.trains.some(x => x.no === 'KLB-1') && petakHit.length === 0, v + ': KLB-1 geser ' + wm + ' mnt berjalan tanpa menunda KA lain di petak (dampak lain: ' + CK.knock.length + ' KA)');
  ok(JSON.stringify(Sim.decode(Sim.encode(ek))) === JSON.stringify(ek), v + ': kode URL KLB bolak-balik');
  // antrean terminal: kapasitas dari dasar → dasar tetap = GAPEKA; kapasitas dipersempit buatan → KA mengantre, tanpa kebuntuan
  const cap = Sim.capOf(B), Bq = Sim.run(P, [], { antrean: cap });
  ok(Object.keys(cap).length >= 3 && Bq.trains.every(x => x.max < 1), v + ': antrean terminal aktif, dasar tetap = GAPEKA (' + Object.keys(cap).length + ' terminal)');
  const c1 = Object.keys(B.term).sort((a, b) => B.term[b].max - B.term[a].max)[0], cap1 = {}; cap1[c1] = Math.max(1, B.term[c1].max - 2);
  const Q1 = Sim.run(P, [], { antrean: cap1 });
  ok(!Q1.error && Q1.nQ >= 1 && Q1.trains.some(x => x.cause === 'antrean'), v + ': kapasitas ' + c1 + ' = ' + cap1[c1] + ' → ' + (Q1.nQ || 0) + ' antrean, puncak ' + (Q1.term && Q1.term[c1].max));
});
console.log(fails ? 'GAGAL ' + fails : 'LULUS');
process.exit(fails ? 1 : 0);
