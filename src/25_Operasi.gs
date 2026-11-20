/**
 * 25_Operasi.gs — modul Ops: program operasi KA dari SEED_OPS (24_SeedOperasi.gs).
 *   status(ka, tgl)  'J' jalan · 'J:1B' jalan sebagai varian · 'B' batal · '-' tidak berprogram · '' tidak tercatat
 *   hariJ(ka, ym)    jumlah hari berstatus J pada bulan itu (null bila KA tidak ada di laporan bulan itu)
 *   frek(ka)         { km, nama, relasi, jalan, batal } dari Laporan Frekuensi KA 2026
 *   rute(ka)         kode stasiun berurutan (Laporan Stasiun Perhentian GAPEKA 2025)
 *   forRef(rows)     ref.prog untuk browser: km/nama KA reguler, status J/B pada tanggal kejadian, pola operasi
 *   kaDetail(no)     pola harian per bulan untuk satu KA (dipanggil apiKaOps)
 *   hjMap()          hari jalan per KA per bulan (nomor + varian) untuk mesin pendapatan (ref.prog.hj)
 * Status sesudah tanggal cetak (SEED_OPS.cetak) adalah PROGRAM, bukan realisasi; browser wajib memberi label.
 * Fungsi murni kecuali dekompresi (Utilities); bisa diuji di emulator Node.
 */
var Ops = (function () {
  var C = null;
  function unz(b64) { return Utilities.ungzip(Utilities.newBlob(Utilities.base64Decode(b64), 'application/x-gzip', 'x.gz')).getDataAsString('UTF-8'); }
  function k(no) { return Domain.key(no); }
  function load() {
    if (C) return C;
    C = { jb: {}, yms: [], fr: {}, ru: null, cetak: '', vb: {} };
    if (typeof SEED_OPS === 'undefined') return C;
    C.cetak = SEED_OPS.cetak || '';
    unz(SEED_OPS.jbGz).split('\n').forEach(function (l) {
      var a = l.split('\t'); if (a.length < 3) return;
      var m = C.jb[a[0]] = C.jb[a[0]] || {};
      a[2].split(' ').forEach(function (no) { if (no) m[k(no)] = a[1]; });
    });
    C.yms = Object.keys(C.jb).sort();
    // Indeks varian nomor: '1' → ['1', '1B', '1TS', ...] (nomor dasar = nomor tanpa huruf akhiran).
    var seen = {};
    C.yms.forEach(function (ym) { Object.keys(C.jb[ym]).forEach(function (key) { if (seen[key]) return; seen[key] = 1; var b = base(key); if (b) (C.vb[b] = C.vb[b] || []).push(key); }); });
    unz(SEED_OPS.frekGz).split('\n').forEach(function (l) {
      var a = l.split('\t'); if (a.length < 6 || !a[0]) return;
      C.fr[k(a[0])] = { no: a[0], km: a[1] === '' ? null : Number(a[1]), nama: a[2], relasi: a[3], jalan: Number(a[4]) || 0, batal: Number(a[5]) || 0 };
    });
    return C;
  }
  function base(key) { var m = /^([A-Z]{0,2}\d{1,5})[A-Z]{0,3}$/.exec(key); return m ? m[1] : ''; }
  /** Nomor varian KA yang sama (nomor dasar sama, nama KA sama menurut Laporan Frekuensi bila tercatat). */
  function varian(no) {
    var c = load(), key = k(no), f = c.fr[key], L = c.vb[base(key)] || [];
    return L.filter(function (v) { if (v === key) return false; var g = c.fr[v]; return !f || !g || String(f.nama).toUpperCase() === String(g.nama).toUpperCase(); });
  }
  function day(ym, d) { return ym + '-' + ('0' + d).slice(-2); }
  function status1(p, key, tgl) {
    var s = p && p[key]; if (!s) return '';
    var ch = s.charAt(Number(String(tgl).slice(8, 10)) - 1);
    return ch === 'J' || ch === 'B' || ch === '-' ? ch : '';
  }
  /** Status nomor KA pada tanggal. Bila nomor itu batal/tidak tercatat tetapi varian bernama sama berjalan (mis. 1 → 1B), hasilnya 'J:1B'. */
  function status(no, tgl) {
    var c = load(), p = c.jb[String(tgl).slice(0, 7)], key = k(no), s = status1(p, key, tgl);
    if (s === 'J' || !p) return s;
    var f = c.fr[key], rel = function (x) { return f && c.fr[x] && c.fr[x].relasi === f.relasi ? 0 : 1; };
    var v = varian(no).filter(function (x) { return status1(p, x, tgl) === 'J'; }).sort(function (a, b) { return rel(a) - rel(b); })[0];
    return v ? 'J:' + (c.fr[v] ? c.fr[v].no : v) : s;
  }
  function hariJ(no, ym) {
    var p = load().jb[ym], s = p && p[k(no)];
    return s ? s.replace(/[^J]/g, '').length : null;
  }
  function frek(no) { return load().fr[k(no)] || null; }
  function rute(no) {
    var c = load();
    if (!c.ru) {
      c.ru = {};
      if (typeof SEED_OPS !== 'undefined') unz(SEED_OPS.ruteGz).split('\n').forEach(function (l) { var a = l.split('\t'); if (a[0]) c.ru[k(a[0])] = a[1] || ''; });
    }
    var s = c.ru[k(no)]; return s ? s.split(' ').filter(String) : [];
  }
  /** Nomor KA reguler (bukan nomor dinas/KLB berformat D1/…, V4/…, KP/…). */
  function reguler(no) { return /^[A-Z]{0,2}\d{1,5}[A-Z]{0,3}$/.test(String(no)); }

  /** ref.prog: data ringkas untuk browser. rows = baris snapshot (CORE_FIELDS: ym=1, d=2, ka=16). */
  function forRef(rows, extraKa) {
    var c = load(), out = { cetak: c.cetak, yms: c.yms, src: typeof SEED_OPS !== 'undefined' ? SEED_OPS.src : {}, ka: {}, st: {}, pola: typeof SEED_OPS !== 'undefined' ? SEED_OPS.pola : [] };
    // ka: { key: [km, nama, relasi, frekJalan, frekBatal] } — semua nomor reguler di Laporan Frekuensi.
    Object.keys(c.fr).forEach(function (key) { var f = c.fr[key]; if (reguler(f.no)) out.ka[key] = [f.km, f.nama, f.relasi, f.jalan, f.batal]; });
    (extraKa || []).forEach(function (no) { var f = c.fr[k(no)]; if (f) out.ka[k(no)] = [f.km, f.nama, f.relasi, f.jalan, f.batal]; });
    // st: status program KA pada tanggal kejadian (kunci 'KA|yyyy-mm-dd').
    var n = 0, nJ = 0, nB = 0, nX = 0;
    (rows || []).forEach(function (r) {
      var no = r[16], ym = r[1], d = r[2]; if (!no || !ym || !d) return;
      var t = day(ym, d), s = status(no, t); if (!s) return;
      out.st[k(no) + '|' + t] = s; n++; if (s.charAt(0) === 'J') nJ++; else if (s === 'B') nB++; else nX++;
    });
    out.stats = { kejadianBerstatus: n, jalan: nJ, batal: nB, tanpaProgram: nX, kaFrek: Object.keys(c.fr).length, kaRef: Object.keys(out.ka).length };
    return out;
  }
  /**
   * Hari jalan per KA per bulan untuk mesin pendapatan: hari ketika nomor itu ATAU varian bernama sama berstatus J.
   * { keys: 'k1 k2 …', m: { ym: 'n1,n2,…' (kosong = KA tidak ada di laporan bulan itu) }, sum: 'kunci KA Sumatera …', days: { ym: jumlah hari laporan } }
   */
  function hjMap() {
    var c = load(), keys = {}, out = { keys: '', m: {}, sum: '', days: {} };
    c.yms.forEach(function (ym) { Object.keys(c.jb[ym]).forEach(function (key) { if (reguler(key)) keys[key] = 1; }); });
    var K = Object.keys(keys).sort();
    out.keys = K.join(' ');
    out.sum = K.filter(function (key) { return Domain.pulauKa(key) === 'Sumatera'; }).join(' ');
    var vcache = {}; K.forEach(function (key) { vcache[key] = varian(key); });
    c.yms.forEach(function (ym) {
      var p = c.jb[ym], any = null;
      out.m[ym] = K.map(function (key) {
        var L = [key].concat(vcache[key]).map(function (x) { return p[x] || ''; }).filter(String);
        if (!p[key] && !L.length) return '';
        if (!any) any = L[0];
        var n = 0, len = Math.max.apply(null, L.map(function (x) { return x.length; }));
        for (var i = 0; i < len; i++) { for (var j = 0; j < L.length; j++) if (L[j].charAt(i) === 'J') { n++; break; } }
        return String(n);
      }).join(',');
      out.days[ym] = any ? any.length : 0;
    });
    return out;
  }
  /** Pola harian per bulan satu KA: [{ ym, pola, nJ, nB }] + frekuensi + rute. null bila KA tidak dikenal. */
  function kaDetail(no) {
    var c = load(), key = k(no), f = c.fr[key], bulan = [];
    c.yms.forEach(function (ym) {
      var s = c.jb[ym][key]; if (!s) return;
      bulan.push({ ym: ym, pola: s, nJ: s.replace(/[^J]/g, '').length, nB: s.replace(/[^B]/g, '').length });
    });
    if (!f && !bulan.length) return null;
    var vr = varian(no).map(function (v) {
      var b2 = []; c.yms.forEach(function (ym) { var s = c.jb[ym][v]; if (s) b2.push({ ym: ym, pola: s, nJ: s.replace(/[^J]/g, '').length, nB: s.replace(/[^B]/g, '').length }); });
      return { no: c.fr[v] ? c.fr[v].no : v, frek: c.fr[v] || null, bulan: b2 };
    }).filter(function (x) { return x.bulan.some(function (b) { return b.nJ > 0; }); });
    return { no: f ? f.no : String(no), cetak: c.cetak, frek: f, bulan: bulan, rute: rute(no), varian: vr };
  }
  function known(no) { var c = load(), key = k(no); if (c.fr[key]) return true; for (var i = 0; i < c.yms.length; i++) if (c.jb[c.yms[i]][key]) return true; return false; }
  return { status: status, varian: varian, hjMap: hjMap, hariJ: hariJ, frek: frek, rute: rute, forRef: forRef, kaDetail: kaDetail, known: known, reguler: reguler, _load: load };
})();
