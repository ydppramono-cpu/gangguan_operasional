/**
 * 15_Kondisi.gs — kondisi prasarana & sarana dari tab THI, RHI, WKP (spreadsheet sumber yang sama dengan Gangguan_Induk).
 * Fungsi murni (bisa diuji di luar GAS). Hasil dikirim ke browser sebagai ref.kondisi:
 *   thi  [wilayah, ym, tingkat ('Resor'|'Scope'), resorId, unit, HI, gradeHI, CI, gradeCI, material, konstruksi, geometri,
 *         rel, pelat, penambat, wesel, balas, bantalan, badan, drainase, lingkungan, MI, gradeMI, inspeksi, ppj, mir, wmr,
 *         ppjProg, ppjReal, mirProg, mirReal, wmrProg, wmrReal, mSp, hm, hmMat, hmKons]
 *   rhi  [noSarana, tipe, ym, hari, hiAkhir, hiRata, hiMin, statusAkhir, hariHealthy, hariMonitor, hariDeclining, rams, reliability,
 *         maintainability, availability, mi, ci (kosong bila turunan), onsite, perawatanTerakhir, tglPerawatan, request, terpenuhi, tglAkhir]
 *   wkp  [tgl yyyy-mm-dd, wilayah, kelompok, resorId, lokasi, progMenit, realMenit, andilMenit, uraianSingkat, mulaiProg, akhirProg,
 *         lokasiPetak ('A-B' petak | 'A~B' rentang | 'st:KODE' | ''), mulaiReal, akhirReal]
 * Nilai RHI memakai kolom "(pulih)" bila ada (pemulihan pemisah desimal yang hilang pada ekspor), diverifikasi
 * terhadap ambang healthy_status; nilai mentah > 100 tidak pernah dipakai.
 */
var KONDISI_SHEETS = { thi: 'THI', rhi: 'RHI', wkp: 'WKP' };
var WKP_MONTHS = 13; // bulan WKP yang dikirim ke browser (bulan laporan + 12 bulan sebelumnya)

function readKondisi_() {
  var ss = SpreadsheetApp.openById(cfg_('SOURCE_SPREADSHEET_ID')), out = {};
  Object.keys(KONDISI_SHEETS).forEach(function (k) {
    var sh = ss.getSheetByName(KONDISI_SHEETS[k]);
    out[k] = sh ? sh.getDataRange().getValues() : [];
  });
  return out;
}

var Kondisi = (function () {
  var D = Domain;
  function n(v) { if (v === '' || v == null) return null; var x = D.number(v); return x.ok ? Math.round(x.value * 1000) / 1000 : null; }
  function idx(head, name) { return head.indexOf(name); }
  function resorId(unit) { var m = /JR\s+((?:[IV]+|\d+)\.\d+)/i.exec(D.txt(unit)); return m ? m[1].toUpperCase() : ''; }
  function ymOf(v) {
    if (v instanceof Date && !isNaN(v)) return v.getFullYear() + '-' + ('0' + (v.getMonth() + 1)).slice(-2);
    var s = D.txt(v), m = /^(\d{4})-(\d{2})/.exec(s); if (m) return m[1] + '-' + m[2];
    var t = D.parseTanggal(v); return t.ym || '';
  }
  var MON = { jan: 1, feb: 2, mar: 3, apr: 4, mei: 5, may: 5, jun: 6, jul: 7, agu: 8, agt: 8, aug: 8, sep: 9, okt: 10, oct: 10, nov: 11, des: 12, dec: 12 };
  function dayOf(v) {
    if (v instanceof Date && !isNaN(v)) return v.getFullYear() + '-' + ('0' + (v.getMonth() + 1)).slice(-2) + '-' + ('0' + v.getDate()).slice(-2);
    var s = D.txt(v), m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s);
    if (m) return m[1] + '-' + m[2] + '-' + m[3];
    m = /^(\d{1,2})\s+([A-Za-z]{3})[A-Za-z]*\.?\s+(\d{4})/.exec(s);
    if (m && MON[m[2].toLowerCase()]) return m[3] + '-' + ('0' + MON[m[2].toLowerCase()]).slice(-2) + '-' + ('0' + m[1]).slice(-2);
    var t = D.parseTanggal(v); return t.ym ? t.ym + '-' + ('0' + t.d).slice(-2) : '';
  }
  /** Durasi (Date 1899-12-30, pecahan hari, atau "H:MM[:SS]") → menit. */
  function minutes(v) {
    if (v instanceof Date && !isNaN(v)) {
      var base = new Date(1899, 11, 30).getTime(), d = (v.getTime() - base) / 60000;
      return d >= 0 && d < 7 * 1440 ? Math.round(d) : Math.round(v.getHours() * 60 + v.getMinutes());
    }
    if (typeof v === 'number') return v >= 0 && v < 7 ? Math.round(v * 1440) : null;
    var s = D.txt(v), m = /^(?:(\d+)\s*day[s]?,\s*)?(\d{1,3}):(\d{2})(?::\d{2})?$/.exec(s);
    if (m) return (Number(m[1] || 0) * 1440) + Number(m[2]) * 60 + Number(m[3]);
    return null;
  }
  function hhmm(v) {
    if (v instanceof Date && !isNaN(v)) return ('0' + v.getHours()).slice(-2) + ':' + ('0' + v.getMinutes()).slice(-2);
    var t = D.parseTime(v); return t ? ('0' + t.h).slice(-2) + ':' + ('0' + t.m).slice(-2) : '';
  }

  /* ---------------- THI ---------------- */
  var THI_COLS = ['Healthy Index', 'Grade Healthy Index', 'Condition Index', 'Grade Condition', 'Material', 'Konstruksi', 'Geometri',
    'Material - Rel dan Sambungan Las (30%)', 'Material - Sambungan Pelat (20%)', 'Material - Penambat (15%)', 'Material - Wesel (15%)',
    'Material - Balas/Plinth (10%)', 'Material - Bantalan (10%)', 'Konstruksi - Badan Jalan dan Lereng (50%)', 'Konstruksi - Drainase (30%)',
    'Konstruksi - Lingkungan (20%)', 'Maintenance Index', 'Grade Maintenance', 'Inspeksi Terjadwal', 'PPJ', 'MIR', 'Perawatan Korektif (WMR)',
    'PPJ Program', 'PPJ Realisasi', 'MIR Program', 'MIR Realisasi', 'WMR Program', 'WMR Realisasi', 'Panjang Petak Jalan (mSp)',
    'Jumlah Hektometer', 'Hm Tanpa Kasus Lengkap - Material', 'Hm Tanpa Kasus Lengkap - Konstruksi'];
  var THI_TEXT = { 'Grade Healthy Index': 1, 'Grade Condition': 1, 'Grade Maintenance': 1 };
  function thi(values) {
    if (!values || values.length < 2) return [];
    var h = values[0].map(D.txt), c = THI_COLS.map(function (k) { return idx(h, k); });
    var iw = idx(h, 'Wilayah'), ip = idx(h, 'Periode'), it = idx(h, 'Tingkat'), iu = idx(h, 'Unit'), out = [], seen = {};
    values.slice(1).forEach(function (r) {
      var unit = D.txt(r[iu]), ym = ymOf(r[ip]), wil = D.region(r[iw]); if (!unit || !ym) return;
      var tingkat = D.txt(r[it]) || 'Resor', key = tingkat + '|' + wil + '|' + ym + '|' + unit; if (seen[key]) return; seen[key] = 1;
      if (tingkat === 'Petak') return;   // tingkat petak dikirim ringkas lewat thiPetak()
      var row = [wil, ym, tingkat, tingkat === 'Scope' ? '' : resorId(unit), unit.replace(/\s+/g, ' ')];
      THI_COLS.forEach(function (k, j) { var v = c[j] >= 0 ? r[c[j]] : ''; row.push(THI_TEXT[k] ? D.txt(v) : n(v)); });
      out.push(row);
    });
    return out;
  }

  /** THI tingkat petak (2 bulan terakhir, ringkas): [wilayah, ym, resorId, petak, HI, gradeHI, CI, MI, material, konstruksi, geometri, mSp, idPetak]. */
  var THI_PETAK_MONTHS = 2;
  function thiPetak(values) {
    if (!values || values.length < 2) return [];
    var h = values[0].map(D.txt), I = { w: idx(h, 'Wilayah'), p: idx(h, 'Periode'), t: idx(h, 'Tingkat'), u: idx(h, 'Unit'), hi: idx(h, 'Healthy Index'), g: idx(h, 'Grade Healthy Index'),
      ci: idx(h, 'Condition Index'), mi: idx(h, 'Maintenance Index'), mat: idx(h, 'Material'), kon: idx(h, 'Konstruksi'), geo: idx(h, 'Geometri'), msp: idx(h, 'Panjang Petak Jalan (mSp)'),
      upt: idx(h, 'Kode UPT JR'), id: idx(h, 'ID petak THI') };
    var rows = [], yms = {};
    values.slice(1).forEach(function (r) { if (D.txt(r[I.t]) !== 'Petak') return; var ym = ymOf(r[I.p]); if (ym) { yms[ym] = 1; rows.push([ym, r]); } });
    var keep = Object.keys(yms).sort().slice(-THI_PETAK_MONTHS), out = [];
    rows.forEach(function (x) {
      if (keep.indexOf(x[0]) < 0) return; var r = x[1];
      out.push([D.region(r[I.w]), x[0], I.upt >= 0 ? D.txt(r[I.upt]).toUpperCase() : '', D.txt(r[I.u]).replace(/\s+/g, ' '), n(r[I.hi]), D.txt(r[I.g]), n(r[I.ci]), n(r[I.mi]),
        n(r[I.mat]), n(r[I.kon]), n(r[I.geo]), n(r[I.msp]), I.id >= 0 ? D.txt(r[I.id]) : '']);
    });
    return out;
  }

  /* ---------------- RHI ---------------- */
  function rhi(values) {
    if (!values || values.length < 2) return [];
    var h = values[0].map(D.txt);
    function col(a, b) { var i = idx(h, a); return i >= 0 ? i : idx(h, b); }
    var I = {
      no: idx(h, 'nomor_sarana'), tipe: idx(h, 'tipe_sarana'), tgl: idx(h, 'tgl_data'), pt: idx(h, 'perawatan_terakhir'), tp: idx(h, 'tgl_perawatan'),
      rel: idx(h, 'reliability_index'), mtb: idx(h, 'maintainability_index'), av: idx(h, 'availability_index'), rams: idx(h, 'rams_index'),
      req: idx(h, 'total_request_rows'), ok: idx(h, 'total_terpenuhi'), st: idx(h, 'healthy_status'),
      hi: col('healthy_index (pulih)', 'healthy_index'), ci: col('condition_index (pulih)', 'condition_index'),
      on: col('onsite_inspection_index (pulih)', 'onsite_inspection_index'), mi: col('maintenance_index (pulih)', 'maintenance_index')
    };
    function idxv(r, k) { var v = n(r[I[k]]); return v != null && v <= 100 ? v : null; } // nilai > 100 = rusak, tidak dipakai
    var g = {};
    values.slice(1).forEach(function (r) {
      var no = D.txt(r[I.no]).toUpperCase().replace(/\s+/g, ''), day = dayOf(r[I.tgl]); if (!no || !day) return;
      var ym = day.slice(0, 7), k = no + '|' + ym, x = g[k] = g[k] || { no: no, tipe: D.txt(r[I.tipe]).toUpperCase(), ym: ym, days: 0, his: [], last: null, cnt: { HEALTHY: 0, MONITOR: 0, DECLINING: 0 } };
      var hi = idxv(r, 'hi'), st = D.txt(r[I.st]).toUpperCase();
      x.days++; if (hi != null) x.his.push(hi); if (x.cnt[st] != null) x.cnt[st]++;
      if (!x.last || day >= x.last.day) x.last = { day: day, hi: hi, st: st, rams: n(r[I.rams]), rel: n(r[I.rel]), mtb: n(r[I.mtb]), av: n(r[I.av]), mi: idxv(r, 'mi'),
        ci: idxv(r, 'ci'), on: idxv(r, 'on'), pt: D.txt(r[I.pt]), tp: dayOf(r[I.tp]), req: n(r[I.req]), ok: n(r[I.ok]) };
    });
    return Object.keys(g).sort().map(function (k) {
      var x = g[k], L = x.last, s = x.his.reduce(function (a, b) { return a + b; }, 0);
      return [x.no, x.tipe, x.ym, x.days, L.hi, x.his.length ? Math.round(s / x.his.length * 100) / 100 : null, x.his.length ? Math.min.apply(null, x.his) : null,
        L.st, x.cnt.HEALTHY, x.cnt.MONITOR, x.cnt.DECLINING, L.rams, L.rel, L.mtb, L.av, L.mi, L.ci, L.on, L.pt, L.tp, L.req, L.ok, L.day];
    });
  }
  /** RHI harian bulan terakhir: { ym, n (hari), u: { no: [hiX10 'a,b,..', status 'HMD..', rams, rel, mi, perawatan [[hari, jenis, tgl], ...]] } }.
   *  Dipakai untuk status RHI pada TANGGAL kejadian dan porsi hari-unit per status. */
  function rhiDaily(values) {
    if (!values || values.length < 2) return null;
    var h = values[0].map(D.txt), I = { no: idx(h, 'nomor_sarana'), tgl: idx(h, 'tgl_data'), pt: idx(h, 'perawatan_terakhir'), tp: idx(h, 'tgl_perawatan'),
      rel: idx(h, 'reliability_index'), rams: idx(h, 'rams_index'), st: idx(h, 'healthy_status'),
      hi: idx(h, 'healthy_index (pulih)') >= 0 ? idx(h, 'healthy_index (pulih)') : idx(h, 'healthy_index'),
      mi: idx(h, 'maintenance_index (pulih)') >= 0 ? idx(h, 'maintenance_index (pulih)') : idx(h, 'maintenance_index') };
    var last = '', rows = [];
    values.slice(1).forEach(function (r) { var d = dayOf(r[I.tgl]); if (d) { rows.push([d, r]); if (d > last) last = d; } });
    if (!last) return null;
    var ym = last.slice(0, 7), nd = Number(last.slice(8, 10)), u = {};
    function arr(v) { var a = []; for (var i = 0; i < nd; i++) a.push(v); return a; }
    rows.forEach(function (x) {
      if (x[0].slice(0, 7) !== ym) return;
      var r = x[1], no = D.txt(r[I.no]).toUpperCase().replace(/\s+/g, ''); if (!no) return;
      var o = u[no] = u[no] || { hi: arr(''), st: arr('-'), rams: arr(''), rel: arr(''), mi: arr(''), pt: [] }, di = Number(x[0].slice(8, 10)) - 1;
      var hi = n(r[I.hi]); o.hi[di] = hi != null && hi <= 100 ? Math.round(hi * 100) : '';
      o.st[di] = ({ HEALTHY: 'H', MONITOR: 'M', DECLINING: 'D' })[D.txt(r[I.st]).toUpperCase()] || '-';
      o.rams[di] = n(r[I.rams]); o.rel[di] = n(r[I.rel]); var mi = n(r[I.mi]); o.mi[di] = mi != null && mi <= 100 ? Math.round(mi * 10) : '';
      var pt = D.txt(r[I.pt]), tp = dayOf(r[I.tp]), lp = o.pt[o.pt.length - 1];
      if (!lp || lp[1] !== pt || lp[2] !== tp) o.pt.push([di + 1, pt, tp]);
    });
    var out = {};
    Object.keys(u).forEach(function (no) { var o = u[no]; out[no] = [o.hi.join(','), o.st.join(''), o.rams.join(','), o.rel.join(','), o.mi.join(','), o.pt]; });
    // Rentang multi-bulan (semua tanggal tersedia): dipakai untuk status RHI pada tanggal kejadian di bulan sebelumnya.
    var first = rows.reduce(function (a, x) { return x[0] < a ? x[0] : a; }, last);
    var t0 = Date.UTC(+first.slice(0, 4), +first.slice(5, 7) - 1, +first.slice(8, 10)), span = Math.round((Date.UTC(+last.slice(0, 4), +last.slice(5, 7) - 1, +last.slice(8, 10)) - t0) / 864e5) + 1, mu = {};
    rows.forEach(function (x) {
      var r = x[1], no = D.txt(r[I.no]).toUpperCase().replace(/\s+/g, ''); if (!no) return;
      var o = mu[no] = mu[no] || { hi: [], st: [] }, di = Math.round((Date.UTC(+x[0].slice(0, 4), +x[0].slice(5, 7) - 1, +x[0].slice(8, 10)) - t0) / 864e5);
      if (!o.hi.length) for (var i = 0; i < span; i++) { o.hi.push(''); o.st.push('-'); }
      var hi = n(r[I.hi]); o.hi[di] = hi != null && hi <= 100 ? Math.round(hi * 100) : '';
      o.st[di] = ({ HEALTHY: 'H', MONITOR: 'M', DECLINING: 'D' })[D.txt(r[I.st]).toUpperCase()] || '-';
    });
    var span2 = {}; Object.keys(mu).forEach(function (no) { span2[no] = [mu[no].hi.join(','), mu[no].st.join('')]; });
    return { ym: ym, n: nd, u: out, range: { from: first, to: last, n: span, u: span2 } };
  }

  /* ---------------- WKP ---------------- */
  var WKP_GROUPS = [
    ['wesel', /wesel/i],
    ['rel', /flash\s*butt|ganti\s*rel|penggantian\s*rel|mengganti\s*rel|rel\s*(cacat|aus|patah|retak)|\blas\b|thermit|pengelasan|las\s*popok|las\s*termit/i],
    ['bantalan', /bantalan|penambat|pandrol|e-?clip/i],
    ['geometri', /geometri|\bmtt\b|kpjr|tamping|listring|anglis|kocrotan|kecrotan|balas|ballast|profil|angkat\s*lestring|pecok/i],
    ['badan', /tubuh\s*baan|badan\s*jalan|drainase|lereng|longsor|berm|gorong|talud|saluran/i],
    ['jembatan', /jembatan|\bbh\b|\bjbt\b/i],
    ['sintel', /sinyal|sintel|\blaa\b|listrik\s*aliran\s*atas|kabel|radio|telekomunikasi|\bvdu\b|interlocking/i]
  ];
  function wkpGroup(t) { for (var i = 0; i < WKP_GROUPS.length; i++) if (WKP_GROUPS[i][1].test(t)) return WKP_GROUPS[i][0]; return /jalan\s*rel|\bjj\b|\bjr\b|rel\b/i.test(t) ? 'rel' : 'lain'; }
  /** Andil kelambatan dari teks "KA terimbas": "01 ka / andil 27 mnt", "10 Ka / Andil 1.032 mnt", "5 Ka, andil 244’" atau jumlah
   *  "andil N" per KA (titik = pemisah ribuan). Tiada/NIHIL = 0. */
  function andil(t) {
    t = D.txt(t); if (!t || /^(tiada|nihil|-|0|tidak ada)$/i.test(t)) return 0;
    var num = function (s) { return Number(String(s).replace(/\./g, '')); }, NUM = '(\\d{1,3}(?:\\.\\d{3})+|\\d+)';
    var m = new RegExp('\\d+\\s*ka\\s*[\\/,]?\\s*a[nb]dil\\s*' + NUM, 'i').exec(t); if (m) return num(m[1]);
    var s = 0, re = new RegExp('a[nb]dil\\s*' + NUM, 'ig'), x; while ((x = re.exec(t))) s += num(x[1]);
    return s;
  }
  function hm(v) { var t = hhmm(v), m = /^(\d{2}):(\d{2})$/.exec(t); return m ? Number(m[1]) * 60 + Number(m[2]) : null; }
  /** Resor dari teks WKP: (1) "Resor JR 6.3"; (2) pasangan kode/nama stasiun "Wt - Stl", "(Tly) - (Ngn)", "Manonjaya-Ciamis";
   *  (3) satu stasiun ("Emplasemen Stasiun Cepu", "(Pnm)"). Hanya resor di wilayah yang sama dengan baris yang diterima. */
  function resorFromText(t, wil, byName) {
    var s = String(t), m = /resor\s*(?:jr|jalan\s*rel)?\s*((?:[IV]+|\d+)\.\d+)/i.exec(s);
    function regOf(id) { return /^[IV]+\./.test(id) ? 'Divre ' + { I: 1, II: 2, III: 3, IV: 4 }[id.split('.')[0]] : 'Daop ' + id.split('.')[0]; }
    function ok(id) { return id && (!wil || regOf(id) === wil); }
    if (m && ok(m[1].toUpperCase())) return { id: m[1].toUpperCase(), via: 'teks' };
    function code(tok) {
      var u = tok.toUpperCase().replace(/[^A-Z0-9]/g, ''); if (!u) return '';
      if (SEED_RESOR.st[u]) return u;
      return (byName && byName[u]) || '';
    }
    // pasangan "A - B" (kode atau nama, boleh dalam kurung)
    var re = /\(?([A-Za-z][A-Za-z0-9 ]{0,24}?)\)?\s*[-–]\s*\(?([A-Za-z][A-Za-z0-9]{1,24})\)?/g, x, seen = [];
    while ((x = re.exec(s))) {
      var left = x[1].trim().split(/\s+/), a = code(left[left.length - 1]) || code(left.join('')), b = code(x[2]);
      if (a && b) { var p = SEED_RESOR.pj[a + '-' + b]; if (p && ok(p[0])) return { id: p[0], via: 'petak' }; }
      if (a) seen.push(a); if (b) seen.push(b);
    }
    var re2 = /(?:emplasemen|empl\.?|stasiun|sta\.?|st\.)\s+(?:stasiun\s+)?\(?([A-Za-z][A-Za-z ]{1,24}?)\)?(?=[\s,.;:)]|$)/ig;
    while ((x = re2.exec(s))) { var c = code(x[1]) || code(x[1].split(/\s+/)[0]); if (c) seen.unshift(c); }
    var re3 = /\(([A-Za-z]{1,5})\)/g; while ((x = re3.exec(s))) { var c3 = code(x[1]); if (c3) seen.push(c3); }
    for (var j = 0; j < seen.length; j++) { var id = SEED_RESOR.st[seen[j]]; if (ok(id)) return { id: id, via: 'stasiun' }; }
    return { id: '', via: '' };
  }
  /** Lokasi WKP dari teks: petak "A-B" (kode/nama, divalidasi ke LIST PETAK lewat SEED_RESOR.pj) → "A-B" terurut;
   *  selain itu satu stasiun/emplasemen → "st:KODE"; tidak terbaca → "". Dipakai tab Rute jalur (WKP per petak). */
  function locFromText(t, byName) {
    var s = String(t);
    function code(tok) { var u = String(tok || '').toUpperCase().replace(/[^A-Z0-9]/g, ''); if (!u) return ''; if (SEED_RESOR.st[u]) return u; return (byName && byName[u]) || ''; }
    var re = /\(?([A-Za-z][A-Za-z0-9 ]{0,24}?)\)?\s*[-–]\s*\(?([A-Za-z][A-Za-z0-9]{1,24})\)?/g, x, span = '';
    while ((x = re.exec(s))) {
      var left = x[1].trim().split(/\s+/), a = code(left[left.length - 1]) || code(left.join('')), b = code(x[2]);
      if (a && b && a !== b && SEED_RESOR.pj[a + '-' + b]) return [a, b].sort().join('-');
      if (a && b && a !== b && !span) span = a + '~' + b;   // dua stasiun tidak bersebelahan → rentang, diurai di browser lewat graf petak
    }
    if (span) return span;
    var re2 = /(?:emplasemen|empl\.?|stasiun|sta\.?|st\.)\s+(?:stasiun\s+)?\(?([A-Za-z][A-Za-z ]{1,24}?)\)?(?=[\s,.;:)]|$)/ig;
    while ((x = re2.exec(s))) { var c = code(x[1]) || code(x[1].split(/\s+/)[0]); if (c) return 'st:' + c; }
    return '';
  }
  function wkp(values, nowYm, stByName) {
    if (!values || values.length < 2) return { rows: [], stats: {} };
    var h = values[0].map(D.txt);
    var I = { tgl: idx(h, 'Tanggal'), wil: idx(h, 'Wilayah'), keg: idx(h, 'Jenis kegiatan'), pm: idx(h, 'Program mulai'), pa: idx(h, 'Program akhir'),
      pd: idx(h, 'Program durasi (hari Excel)'), rd: idx(h, 'Realisasi durasi (hari Excel)'), ket: idx(h, 'Keterangan'),
      rm: idx(h, 'Realisasi mulai'), ra: idx(h, 'Realisasi akhir'),
      kl: idx(h, 'KA terimbas - kolom L sumber'), km: idx(h, 'KA terimbas - kolom M sumber'),
      tv: idx(h, 'Tanggal terverifikasi'), wv: idx(h, 'Wilayah terverifikasi') };
    var all = [], stats = { baris: 0, masaDepan: 0, tanpaTanggal: 0, terpetakan: 0, realTakSah: 0, tglTerverifikasi: I.tv >= 0 };
    values.slice(1).forEach(function (r) {
      var keg = D.txt(r[I.keg]); if (!keg) return; stats.baris++;
      // tanggal & wilayah: kolom "terverifikasi" (hasil penelusuran urutan baris) bila ada, selain itu kolom asli
      var day = (I.tv >= 0 && D.txt(r[I.tv]) ? dayOf(r[I.tv]) : '') || dayOf(r[I.tgl]); if (!day) { stats.tanpaTanggal++; return; }
      if (day.slice(0, 7) > nowYm) { stats.masaDepan++; return; }
      var wil = D.region((I.wv >= 0 && D.txt(r[I.wv])) || r[I.wil]);
      var ket = D.txt(r[I.ket]), t = keg + '\n' + ket, rs = resorFromText(t, wil, stByName);
      if (rs.id) stats.terpetakan++;
      var lok = (/lokasi\s*:\s*([^\n]+)/i.exec(ket) || [])[1] || '';
      // realisasi tak sah: jam akhir < jam mulai tetapi durasi > 12 jam (salah ketik jam) → durasi realisasi tidak dipakai
      var real = minutes(r[I.rd]), rm = I.rm >= 0 ? hm(r[I.rm]) : null, ra = I.ra >= 0 ? hm(r[I.ra]) : null;
      if (real != null && rm != null && ra != null && ra < rm && real > 720) { real = null; stats.realTakSah++; }
      all.push([day, wil, wkpGroup(keg), rs.id, D.txt(lok).slice(0, 90), minutes(r[I.pd]), real,
        andil(D.txt(r[I.kl]) + ' ' + D.txt(r[I.km])), keg.replace(/^\d+\.\s*/, '').replace(/\s+/g, ' ').slice(0, 140), hhmm(r[I.pm]), hhmm(r[I.pa]),
        locFromText(lok + '\n' + keg + '\n' + ket, stByName), I.rm >= 0 ? hhmm(r[I.rm]) : '', I.ra >= 0 ? hhmm(r[I.ra]) : '']);
    });
    var yms = all.map(function (x) { return x[0].slice(0, 7); }).sort(), last = yms[yms.length - 1] || nowYm;
    var y = Number(last.slice(0, 4)), m = Number(last.slice(5)) - (WKP_MONTHS - 1); while (m < 1) { m += 12; y--; }
    var from = y + '-' + ('0' + m).slice(-2);
    stats.dikirim = 0;
    var rows = all.filter(function (x) { return x[0].slice(0, 7) >= from; }); stats.dikirim = rows.length; stats.dari = from; stats.sampai = last;
    return { rows: rows, stats: stats };
  }

  function build(raw, nowYm, refSt) {
    var byName = {};
    (refSt || []).forEach(function (s) { byName[D.txt(s[1]).toUpperCase().replace(/[^A-Z]/g, '')] = s[0]; });
    var w = wkp(raw.wkp, nowYm, byName), t = thi(raw.thi), tp = thiPetak(raw.thi), r = rhi(raw.rhi), rd = rhiDaily(raw.rhi);
    return { version: 3, resor: SEED_RESOR, thi: t, thiPetak: tp, rhi: r, rhiDay: rd, wkp: w.rows,
      stats: { thi: t.length, thiPetak: tp.length, rhi: r.length, wkp: w.stats, sumber: 'THI, RHI, WKP (spreadsheet sumber)' } };
  }
  return { build: build, thi: thi, thiPetak: thiPetak, rhi: rhi, rhiDaily: rhiDaily, wkp: wkp, locFromText: locFromText, minutes: minutes, andil: andil, wkpGroup: wkpGroup, resorFromText: resorFromText };
})();
