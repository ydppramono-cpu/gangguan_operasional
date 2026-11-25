/* Uji RHI: 15_Kondisi menerima format ekspor 22 kolom (POOR/CRITICAL), 29_RhiSarana.rowsOf (kunci ganda ditolak), Js.RhiKG.fleet/at. */
const fs = require('fs'), vm = require('vm'), path = require('path');
const S = f => fs.readFileSync(path.join(__dirname, '../../src', f), 'utf8');
const ctx = { console, Math, JSON, Date, Object, Array, String, Number, RegExp, Error, Utilities: { formatDate: (d, tz, f) => d.toISOString().slice(0, f === 'yyyy-MM' ? 7 : 10) } };
vm.createContext(ctx); ['00_Config.gs', '01_Domain.gs', '14_SeedResor.gs', '15_Kondisi.gs', '29_RhiSarana.gs'].forEach(f => vm.runInContext(S(f), ctx, { filename: f }));
let fail = 0; const ok = (c, m) => { console.log((c ? 'ok   ' : 'GAGAL ') + m); if (!c) fail++; };
// 1. Lokomotif: format ekspor baru
const H = 'jenis_sarana,tgl_data,nomor_sarana,tipe_sarana,dipo,daop,reliability_index,maintainability_index,availability_index,rams_index,maintenance_completion_score,spare_management_score,maintenance_index,age_index,onsite_inspection_index,real_condition_index,condition_index,healthy_index,healthy_status,kategori_gold,is_rhi_lengkap,versi_formula'.split(',');
const row = (d, hi, st) => ['LOKOMOTIF', new Date(d + 'T00:00:00'), 'CC 206 15 06', 'CC206', 'DEPO', 'DAOP 1', 80, 20, 40, 60, 100, 87.5, 97.5, 0, 100, '', 70, hi, st, '', 1, 'x'];
const V = [H, row('2026-10-01', 75.68, 'MONITOR'), row('2026-10-02', 52.1, 'POOR'), row('2026-10-03', 39.4, 'CRITICAL')];
const r = vm.runInContext('Kondisi.rhi', ctx)(V), d = vm.runInContext('Kondisi.rhiDaily', ctx)(V);
ok(r.length === 1 && r[0][0] === 'CC2061506' && r[0][4] === 39.4 && r[0][7] === 'CRITICAL' && r[0][23] === 1 && r[0][24] === 1, 'lok format 22 kolom: nomor tanpa spasi, HI akhir, hari Poor & Critical');
ok(d && d.u.CC2061506[1].slice(0, 3) === 'MPC', 'status harian lok: M, P, C');
// 2. Kereta/gerbong bulanan
const MH = ['jenis_sarana', 'bulan', 'nomor_sarana', 'tipe_sarana', 'dipo', 'daop', 'hari_data', 'tgl_akhir', 'healthy_index_akhir', 'healthy_status_akhir', 'healthy_index_rata', 'healthy_index_min', 'rams_index', 'maintenance_index', 'condition_index', 'status_harian'];
const m = (j, no, ym, hi, st, sd) => [j, ym, no, 'T', 'DP', 'DAOP 7', sd.length, ym + '-' + sd.length, hi, st, hi, hi, 60, 80, 70, sd];
const rows = vm.runInContext('RhiS.rowsOf', ctx)([MH, m('KERETA', 'K3 0 16 38', '2026-09', 88, 'HEALTHY', 'HHH'), m('KERETA', 'K301638', '2026-10', 60, 'DECLINING', 'HMDD'), m('GERBONG', 'GB5022297', '2026-10', 50, 'POOR', 'DDP')]);
ok(rows.length === 3 && rows[0][1] === 'K301638' && rows[1][10] === 'D' && rows[2][0] === 'G', 'baris bulanan ringkas (nomor dinormalkan, status huruf)');
let threw = false; try { vm.runInContext('RhiS.rowsOf', ctx)([MH, m('KERETA', 'K1', '2026-10', 90, 'HEALTHY', 'H'), m('KERETA', 'K 1', '2026-10', 90, 'HEALTHY', 'H')]); } catch (e) { threw = /ganda/.test(e.message); }
ok(threw, 'kunci ganda (jenis+nomor+bulan) ditolak');
// 3. Js.RhiKG di "browser"
const w = { KAI: { api: () => Promise.resolve({ ok: true, gz: 'x', version: 'v' }), gunzipJson: () => Promise.resolve({ cols: [], rows }) } };
w.window = w; vm.createContext(w); vm.runInContext(S('Js.RhiKG.html').replace(/^<script>|<\/script>\s*$/g, '').replace(/document\.addEventListener[\s\S]*$/, ''), w);
w.KAIRhiKG.ensure().then(() => {
  const K = w.KAIRhiKG, F = K.fleet('K');
  ok(F.ym === '2026-10' && F.units === 1 && F.cnt.DECLINING === 1 && F.prev.ym === '2026-09' && F.rows[0].w === 'Daop 7', 'armada kereta bulan terakhir + pembanding');
  ok(K.at('K301638', '2026-10-02').st === 'MONITOR' && K.at('K301638', '2026-10-09') === null, 'status pada tanggal kejadian; di luar data = null');
  ok(K.fleet('G').list.length === 1 && K.fleet('G').list[0].st === 'POOR', 'daftar pantau gerbong HI di bawah 70');
  console.log(fail ? 'GAGAL ' + fail : 'LULUS'); process.exit(fail ? 1 : 0);
});
