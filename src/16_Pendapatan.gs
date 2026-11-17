/**
 * 16_Pendapatan.gs — pembaca tab Passenger & Freight (spreadsheet sumber) untuk rate pendapatan per jam.
 * Fungsi murni (diuji di Node). Hasil dikirim ke browser sebagai ref.pend:
 *   pass [ym, noKa, namaKa, kelas, relasi, jenis (Komersial/PSO), pendapatan, penumpang, eko, eks, bis]
 *   frei [ym, namaKa ('' = tanpa nama KA), komoditas, detail, pendapatan, ton, baris, barisVolume0]
 *   stats { pass: {...}, frei: {...} } — termasuk jumlah sel yang dipulihkan.
 *
 * Pemulihan angka (SAMA dengan pemulihan database 12 Nov 2026; idempoten — data yang sudah bersih tidak berubah):
 *  - Ekspor lama memotong pemisah ribuan: "9,7" = 9.700, "31,513" = 31.513, "960" bisa = 960.000.
 *  - Passenger: kandidat (nilai, nilai×1000) dipilih agar Jumlah = EKO+EKS+BIS dan Pendapatan = ΣPendapatan kelas.
 *    Baris yang seluruh angkanya bulat (ambigu) diputuskan memakai median pendapatan/penumpang KA yang sama.
 *  - Freight: Tarif dan Pendapatan dipilih agar Tarif ≈ Pendapatan ÷ Volume (toleransi pembulatan volume 2 desimal).
 */
var PEND_SHEETS = { pass: 'Passenger', frei: 'Freight' };

function readPendapatan_() {
  var ss = SpreadsheetApp.openById(cfg_('SOURCE_SPREADSHEET_ID')), out = {};
  Object.keys(PEND_SHEETS).forEach(function (k) {
    var sh = ss.getSheetByName(PEND_SHEETS[k]);
    out[k] = sh ? sh.getDataRange().getValues() : [];
  });
  return out;
}

var Pendapatan = (function () {
  var D = Domain;
  /** Nilai sel → angka seperti tersimpan (angka asli, atau teks format Indonesia "1.234.567,89"). */
  function num(v) {
    if (typeof v === 'number') return isFinite(v) ? v : 0;
    var s = D.txt(v).replace(/\s/g, ''); if (!s || s === '-') return 0;
    var neg = s.charAt(0) === '-'; s = s.replace(/^-/, '');
    var x;
    if (s.indexOf(',') >= 0 && s.indexOf('.') >= 0) x = Number(s.replace(/\./g, '').replace(',', '.'));
    else if (/^\d{1,3}(\.\d{3})+$/.test(s)) x = Number(s.replace(/\./g, ''));
    else if (/^\d{1,3}(\.\d{3})*\.\d{1,2}$/.test(s)) { var p = s.split('.'); x = Number(p.slice(0, -1).join('') + '.' + p[p.length - 1]); }
    else x = Number(s.replace(',', '.'));
    if (!isFinite(x)) return 0;
    return neg ? -x : x;
  }
  function isInt(x) { return Math.abs(x - Math.round(x)) < 1e-9; }
  function cands(x) {
    var o = []; if (isInt(x)) o.push(Math.round(x));
    var y = Math.round(x * 1000); if (Math.abs(x * 1000 - y) < 1e-6 && o.indexOf(y) < 0) o.push(y);
    return o;
  }
  function product(list) { var out = [[]]; list.forEach(function (c) { var n = []; out.forEach(function (p) { c.forEach(function (v) { n.push(p.concat([v])); }); }); out = n; }); return out; }
  /** Pilih kombinasi kandidat yang memenuhi total = Σ bagian, dengan perubahan paling sedikit. */
  function solve(vals, money) {
    var sols = product(vals.map(cands)).filter(function (c) { return c[0] === c[1] + c[2] + c[3]; });
    if (!sols.length) return null;
    if (money) { var pl = sols.filter(function (c) { return c.every(function (x) { return x === 0 || x >= 1000; }); }); if (pl.length) sols = pl; }
    function cost(c) { var k = 0; for (var i = 0; i < c.length; i++) if (Math.abs(c[i] - vals[i]) > 1e-9) k++; return k; }
    sols.sort(function (a, b) { return cost(a) - cost(b); });
    return sols[0];
  }
  function ymOf(v) {
    if (v instanceof Date && !isNaN(v)) return v.getFullYear() + '-' + ('0' + (v.getMonth() + 1)).slice(-2);
    var s = D.txt(v), m = /^(\d{4})-(\d{2})/.exec(s); if (m) return m[1] + '-' + m[2];
    var t = D.parseTanggal(v); return t.ym || '';
  }
  function median(a) { var s = a.slice().sort(function (x, y) { return x - y; }), h = s.length >> 1; return s.length % 2 ? s[h] : (s[h - 1] + s[h]) / 2; }

  function pass(values) {
    var st = { rows: 0, pnpFixed: 0, rpFixed: 0, ambig1000: 0, unresolved: 0 };
    if (!values || values.length < 2) return { rows: [], stats: st };
    var h = values[0].map(function (x) { return D.txt(x).replace(/\s+/g, ' '); });
    function col(re) { for (var i = 0; i < h.length; i++) if (re.test(h[i])) return i; return -1; }
    var I = { ym: col(/^Tanggal/i), rev: col(/^Pendapatan \(Rp\)$/i), no: col(/^Nomor KA$/i), nama: col(/^Nama KA$/i), kelas: col(/^Kelas KA$/i),
      rel: col(/^Relasi$/i), pax: col(/^Jumlah Penumpang$/i), eko: col(/Terisi EKO/i), eks: col(/Terisi EKS/i), bis: col(/Terisi BIS/i),
      jenis: col(/^Jenis KA$/i), rEko: col(/^Pendapatan EKO/i), rEks: col(/^Pendapatan EKS/i), rBis: col(/^Pendapatan BIS/i) };
    var rows = [], amb = [];
    values.slice(1).forEach(function (r) {
      var ym = ymOf(r[I.ym]), no = D.txt(r[I.no]).toUpperCase().replace(/\s+/g, ''); if (!ym || !no) return;
      var pv = [I.pax, I.eko, I.eks, I.bis].map(function (i) { return num(r[i]); }), rv = [I.rev, I.rEko, I.rEks, I.rBis].map(function (i) { return num(r[i]); });
      var ps = solve(pv, false), rs = solve(rv, true);
      if (!ps || !rs) st.unresolved++;
      ps = ps || pv.map(Math.round); rs = rs || rv.map(Math.round);
      ps.forEach(function (x, i) { if (Math.abs(x - pv[i]) > 1e-9) st.pnpFixed++; });
      rs.forEach(function (x, i) { if (Math.abs(x - rv[i]) > 1e-9) st.rpFixed++; });
      var row = [ym, no, D.txt(r[I.nama]), D.txt(r[I.kelas]), D.txt(r[I.rel]), D.txt(r[I.jenis]), rs[0], ps[0], ps[1], ps[2], ps[3]];
      var allInt = [I.pax, I.eko, I.eks, I.bis].every(function (i) { return typeof r[i] === 'number' ? isInt(r[i]) : /^\d*$/.test(D.txt(r[i])); });
      rows.push(row); if (allInt) amb.push(row);
    });
    // Baris ambigu (semua angka bulat): ×1000 bila pendapatan/penumpang jauh lebih dekat ke median KA yang sama.
    var ref = {};
    rows.forEach(function (x) { if (amb.indexOf(x) >= 0 || !x[7] || !x[6]) return; (ref[x[2].toUpperCase()] = ref[x[2].toUpperCase()] || []).push(x[6] / x[7]); (ref['#' + x[3]] = ref['#' + x[3]] || []).push(x[6] / x[7]); });
    amb.forEach(function (x) {
      if (!x[7] || !x[6]) return;
      var m = ref[x[2].toUpperCase()] ? median(ref[x[2].toUpperCase()]) : ref['#' + x[3]] ? median(ref['#' + x[3]]) : null; if (!m) return;
      var d1 = Math.abs(Math.log(x[6] / x[7] / m)), d2 = Math.abs(Math.log(x[6] / (x[7] * 1000) / m));
      if (d2 < d1) { for (var i = 7; i <= 10; i++) x[i] = x[i] * 1000; st.ambig1000++; st.pnpFixed += 4; }
    });
    st.rows = rows.length;
    return { rows: rows, stats: st };
  }

  function frei(values) {
    var st = { rows: 0, tarifFixed: 0, revFixed: 0, vol0: 0, vol0Rp: 0, neg: 0, negRp: 0, unresolved: 0 };
    if (!values || values.length < 2) return { rows: [], stats: st };
    var h = values[0].map(function (x) { return D.txt(x).replace(/\s+/g, ' '); });
    function col(re) { for (var i = 0; i < h.length; i++) if (re.test(h[i])) return i; return -1; }
    var I = { ym: col(/^Tanggal/i), rev: col(/^Pendapatan/i), nama: col(/^Nama KA$/i), kom: col(/^Komoditas$/i), det: col(/^Komoditas Detail$/i),
      vol: col(/^Volume/i), tarif: col(/^Tarif/i) };
    var g = {};
    values.slice(1).forEach(function (r) {
      var ym = ymOf(r[I.ym]); if (!ym) return; st.rows++;
      var p = num(r[I.rev]), v = num(r[I.vol]), t = num(r[I.tarif]);
      var pc = p >= 0 ? cands(p) : [p], tc = cands(t), best = null;
      for (var a = 0; a < pc.length && !best; a++) for (var b = 0; b < tc.length && !best; b++) {
        if (v > 0) { var lo = pc[a] / (v + 0.005), hi = pc[a] / Math.max(v - 0.005, 1e-9); if (tc[b] >= lo - 1 && tc[b] <= hi + 1) best = [pc[a], tc[b]]; }
        else if (pc[a] === 0 && tc[b] === 0) best = [pc[a], tc[b]];
      }
      if (!best) { best = [pc[0], tc[0] == null ? 0 : tc[0]]; if (v > 0) st.unresolved++; }
      if (Math.abs(best[0] - p) > 1e-9) st.revFixed++;
      if (Math.abs(best[1] - t) > 1e-9) st.tarifFixed++;
      var rev = best[0], nama = D.txt(r[I.nama]); if (nama === '-') nama = '';
      if (rev < 0) { st.neg++; st.negRp += rev; }
      if (v <= 0 && rev > 0) { st.vol0++; st.vol0Rp += rev; }
      var k = [ym, nama.toUpperCase(), D.txt(r[I.kom]), D.txt(r[I.det])].join('|');
      var o = g[k] = g[k] || [ym, nama, D.txt(r[I.kom]), D.txt(r[I.det]), 0, 0, 0, 0];
      o[4] += rev; o[5] += Math.max(v, 0); o[6]++; if (v <= 0 && rev > 0) o[7]++;
    });
    var rows = Object.keys(g).sort().map(function (k) { var o = g[k]; o[5] = Math.round(o[5] * 100) / 100; return o; });
    return { rows: rows, stats: st };
  }

  function build(raw) {
    var p = pass(raw.pass), f = frei(raw.frei);
    return { version: 1, pass: p.rows, frei: f.rows, stats: { pass: p.stats, frei: f.stats, sumber: 'Tab Passenger & Freight (spreadsheet sumber)' } };
  }
  return { build: build, pass: pass, frei: frei, num: num };
})();
