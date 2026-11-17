// Uji invarian grafik perjalanan: label stasiun tidak rapat/tumpuk, jam per perjalanan tidak mundur. Pemakaian: GZ=jalur/gapekaYY.json.gz node test_marey.js
const fs = require('fs'), vm = require('vm'), zlib = require('zlib');
const src = fs.readFileSync(require('path').resolve(__dirname, '../../src/Js.Marey.html'), 'utf8').replace(/^<script>|<\/script>\s*$/g, '');
vm.runInThisContext(src);
const K = globalThis.KAIM;
const d = K.index(JSON.parse(zlib.gunzipSync(fs.readFileSync(process.env.GZ))));
let fails = 0;
function ok(c, m) { if (!c) { fails++; console.log('GAGAL:', m); } }
// layoutLabels: tidak ada dua label lebih rapat dari gap, untuk semua lintas & tinggi minimum yang dipakai renderer
d.lintas.forEach(l => {
  const km = l.st[l.st.length - 1][2] || 1;
  [0.75, 1.5, 3, 8, 18].forEach(px => {
    const LH = 15, hKm = km * px, hLab = (l.st.length - 1) * LH, H = Math.max(220, Math.ceil(Math.max(hKm, hLab)));
    const ys = l.st.map(s => 34 + s[2] / km * H), r = K.layoutLabels(ys, LH, 34, 34 + H);
    for (let i = 1; i < r.y.length; i++) ok(r.y[i] - r.y[i - 1] >= LH - 1e-6, l.id + ' px' + px + ' label ' + i + ' rapat ' + (r.y[i] - r.y[i - 1]).toFixed(2));
    ok(r.y[0] >= 34 - 1e-6 && r.y[r.y.length - 1] <= 34 + H + 1e-6, l.id + ' keluar batas');
  });
  // tracks: waktu naik monoton di setiap run, km dalam lintas
  K.tracks(d, l, {}).forEach(t => t.runs.forEach(run => {
    for (let i = 1; i < run.length; i++) ok(run[i].t >= run[i - 1].t, l.id + ' KA ' + t.ka.no + ' jam turun ' + K.hms(run[i - 1].t) + '>' + K.hms(run[i].t));
  }));
});
if (d.meta && d.meta.tahun === '2026') {
// cek rinci: KA 9 Argo Wilis pada lintas II-1 berangkat Cikampek? (lewat BD 18:26 datang)
const l2 = d.lintasById['II-1|CIKAMPEK - PADALARANG - ANDIR - BANDUNG - CIBATU - BANJAR'];
const t9 = K.tracks(d, l2, {}).find(t => t.ka.no === '9');
ok(t9 && t9.runs[0].some(p => p.kode === 'BD' && K.hms(p.t) === '18:26'), 'KA 9 datang BD 18:26');
}
console.log('lintas', d.lintas.length, 'KA', d.ka.length, 'gagal', fails);
process.exit(fails ? 1 : 0);
