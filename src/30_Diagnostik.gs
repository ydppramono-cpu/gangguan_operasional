/**
 * 30_Diagnostik.gs — penyusun angka & daftar "perlu dilengkapi" untuk TIM (keputusan pemilik 25 Nov 2026).
 * Web app & PPT hanya menampilkan data; bagian penyusun (pendapatan yang belum cocok ke GAPEKA, rate & cakupan per bulan,
 * mutu data per wilayah, kejadian yang perlu dilengkapi, sarana tanpa depo di SAP) ditulis ke spreadsheet terpisah
 * "KAI | Diagnostik Web App" (dibuat sekali; ID disimpan di Script Property DIAG_DB_ID). Tab milik tim tidak disentuh.
 *
 * Satu sumber rumus: modul browser murni (Js.Analytics, Js.Ref, Js.Mutu, Js.Pendapatan) dijalankan juga di server,
 * sehingga angka di sheet = angka mesin web app. Diperbarui setiap snapshot baru (runSync_), atau manual: diagnostikNow().
 */
var Diag = (function () {
  var MODS = ['Js.Analytics', 'Js.Ref', 'Js.Mutu', 'Js.Pendapatan'];

  /**
   * Teks modul: berkas parsial (proyek clasp) atau, di paket tempel (Index.html utuh), blok <script> yang kepalanya "* Js.X —".
   */
  var idx_ = null;
  function source_(n) {
    try { return HtmlService.createHtmlOutputFromFile(n).getContent(); } catch (e) { /* paket tempel: tidak ada berkas parsial */ }
    if (idx_ == null) idx_ = HtmlService.createHtmlOutputFromFile('Index').getContent();
    var at = idx_.indexOf('\n * ' + n + ' —'); if (at < 0) throw new Error('Modul ' + n + ' tidak ditemukan di Index.html');
    var a = idx_.lastIndexOf('<script>', at), b = idx_.indexOf('</script>', at);
    return idx_.slice(a, b + 9);
  }
  /** Muat modul browser murni ke objek root (window tiruan). */
  function modules_(src) {
    var root = {}; root.KAI = { tc: function (s) { return s; } };
    MODS.forEach(function (n) {
      var code = String((src || source_)(n)).replace(/^\s*<script>/, '').replace(/<\/script>\s*$/, '');
      new Function('window', 'globalThis', 'KAI', code)(root, root, root.KAI);
    });
    return root;
  }

  function ymOf_(d) { return Utilities.formatDate(d || new Date(), 'Asia/Jakarta', 'yyyy-MM'); }
  function ymShift_(ym, n) { var y = +ym.slice(0, 4), m = +ym.slice(5, 7) - 1 + n; y += Math.floor(m / 12); m = ((m % 12) + 12) % 12; return y + '-' + (m < 9 ? '0' : '') + (m + 1); }
  function r1_(v) { return v == null || isNaN(v) ? '' : Math.round(v * 10) / 10; }

  /**
   * Bangun tabel diagnostik (fungsi murni terhadap data snapshot).
   * @param {{fields:Array, rows:Array}} core  data inti snapshot · @param {Object} ref referensi snapshot (apiRef)
   * @return {Object<string, Array<Array>>} nama tab → baris (baris 1 = judul kolom)
   */
  function build(core, ref, opt) {
    opt = opt || {};
    var M = modules_(opt.src), now = opt.ym || ymOf_(), today = opt.today || Utilities.formatDate(new Date(), 'Asia/Jakarta', 'yyyy-MM-dd');
    var all = M.KAIA.prepare(core.fields, core.rows), out = {};
    // ---- Mutu data per wilayah: 12 bulan terakhir data ----
    var last = all.reduce(function (a, r) { return r.ym > a ? r.ym : a; }, ''), from = last ? ymShift_(last, -11) : '';
    var L = all.filter(function (r) { return r.ym && r.ym >= from && r.ym <= last; }), flag = M.KAIMutu.menitFlagged(all), Q = M.KAIMutu.build(L, [], flag);
    var C = Q.C;
    out.Mutu_per_wilayah = [['Wilayah', 'Kejadian', 'Lengkap (isian wajib)', 'Skor kelengkapan (%)'].concat(C.map(function (c) { return c.label + (c.wajib ? ' (wajib)' : ''); }))]
      .concat(Q.rows.concat([Q.total]).map(function (o) { return [o.w, o.n, o.ok, r1_(o.skor)].concat(C.map(function (c) { return o.c[c.k] || 0; })); }));
    var lab = {}, sar = {}; C.forEach(function (c) { lab[c.k] = c.label; sar[c.k] = c.saran; });
    var iss = Q.issues.slice().sort(function (a, b) { return (b.r.date || '').localeCompare(a.r.date || ''); });
    out.Perlu_dilengkapi = [['Tanggal', 'Wilayah', 'Nomor KA', 'Judul', 'Masalah', 'Isian wajib bermasalah', 'Saran perbaikan', 'Catatan kualitas', 'ID kejadian']]
      .concat(iss.slice(0, 20000).map(function (x) { return [x.r.date || '', x.r.wilayah || '', x.r.ka || '', x.r.judul || '', x.k.map(function (k) { return lab[k]; }).join('; '), x.wajib ? 'Ya' : 'Tidak',
        x.k.map(function (k) { return sar[k]; }).join(' '), x.r.q || '', x.r.id]; }));
    // ---- Pendapatan: rate & cakupan per bulan, data yang belum cocok ke GAPEKA (GAPEKA 2025 = tab jadwal snapshot) ----
    if (ref && ref.pend && !ref.pend.error) {
      var R = M.KAIRef.build(Object.assign({}, ref, { gapekaLabel: 'GAPEKA 2025' }), { today: today }), X = M.KAIP.build(R, R.pend, now);
      var by = {}; X.P.list.forEach(function (o) { (by[o.ym] = by[o.ym] || {}).p = o; }); X.B.list.forEach(function (o) { (by[o.ym] = by[o.ym] || {}).b = o; });
      out.Rate_pendapatan = [['Bulan', 'Rate KA penumpang (Rp/jam)', 'Cakupan pendapatan penumpang (%)', 'KA penumpang cocok', 'Rate KA barang (Rp/jam)', 'Cakupan pendapatan barang (%)', 'KA barang cocok', 'Perjalanan KA barang', 'Status bulan']]
        .concat(Object.keys(by).sort().reverse().map(function (y) { var p = by[y].p, b = by[y].b, part = (p && p.partial) || (b && b.partial);
          return [y, p && p.rate ? Math.round(p.rate) : '', p ? r1_(p.cov * 100) : '', p ? p.nKa : '', b && b.rate ? Math.round(b.rate) : '', b ? r1_(b.cov * 100) : '', b ? b.nKa : '', b ? b.trips : '', part ? 'Belum lengkap → rate acuan' : 'Lengkap']; }))
        .concat([[], ['Rate acuan penumpang', X.P.ref ? Math.round(X.P.ref) : '', 'bulan ' + X.P.refFrom + ' s.d. ' + X.P.refTo], ['Rate acuan barang', X.B.ref ? Math.round(X.B.ref) : '', 'bulan ' + X.B.refFrom + ' s.d. ' + X.B.refTo]]);
      out.Pendapatan_belum_cocok = [['Data', 'Nomor KA', 'Nama KA', 'Alasan', 'Baris', 'Pendapatan (Rp)']]
        .concat(X.unmatchedP.map(function (u) { return ['Passenger', u.no || '', u.nama || '', u.why, u.n, Math.round(u.rev)]; }))
        .concat(X.unmatchedB.map(function (u) { return ['Freight', '', u.nama || '', u.why, u.n, Math.round(u.rev)]; }));
    }
    // ---- Sarana tanpa depo di Referensi Sarana SAP ----
    var F = (ref && ref.fleet) || [];
    out.Sarana_tanpa_depo = [['Nomor sarana', 'Jenis', 'Kelas']].concat(F.filter(function (f) { return /^(Lokomotif|Kereta|Gerbong)$/.test(f[1] || '') && !String(f[3] || '').trim(); }).map(function (f) { return [f[0], f[1], f[2] || '']; }));
    out.Ringkasan = [['Bagian', 'Baris', 'Keterangan'],
      ['Mutu_per_wilayah', Q.rows.length, 'Gangguan_Induk ' + from + ' s.d. ' + last + ' · skor = kejadian tanpa masalah isian wajib ÷ semua kejadian'],
      ['Perlu_dilengkapi', iss.length, 'kejadian dengan ≥ 1 masalah isian (maks 20.000 baris terbaru ditulis)'],
      ['Rate_pendapatan', out.Rate_pendapatan ? out.Rate_pendapatan.length - 4 : 0, 'rate per jam & cakupan pencocokan Passenger/Freight ke GAPEKA 2025'],
      ['Pendapatan_belum_cocok', out.Pendapatan_belum_cocok ? out.Pendapatan_belum_cocok.length - 1 : 0, 'tidak masuk rate; lengkapi di GAPEKA/LIST KA agar ikut terhitung'],
      ['Sarana_tanpa_depo', out.Sarana_tanpa_depo.length - 1, 'unit lokomotif/kereta/gerbong tanpa depo di Referensi Sarana SAP'],
      ['Diperbarui', today, 'otomatis setiap snapshot baru; manual: diagnostikNow() di editor']];
    return out;
  }

  /** Tulis ke spreadsheet diagnostik (dibuat sekali). Setiap tab ditimpa utuh. */
  function write(tabs) {
    var props = PropertiesService.getScriptProperties(), id = props.getProperty('DIAG_DB_ID'), ss = null;
    if (id) { try { ss = SpreadsheetApp.openById(id); } catch (e) { ss = null; } }
    if (!ss) { ss = SpreadsheetApp.create('KAI | Diagnostik Web App'); props.setProperty('DIAG_DB_ID', ss.getId()); }
    var order = ['Ringkasan', 'Mutu_per_wilayah', 'Perlu_dilengkapi', 'Rate_pendapatan', 'Pendapatan_belum_cocok', 'Sarana_tanpa_depo'];
    order.forEach(function (n) {
      var rows = tabs[n]; if (!rows) return;
      var w = rows.reduce(function (m, r) { return Math.max(m, r.length); }, 1), data = rows.map(function (r) { var o = r.slice(); while (o.length < w) o.push(''); return o; });
      var sh = ss.getSheetByName(n) || ss.insertSheet(n);
      sh.clearContents();
      if (data.length) sh.getRange(1, 1, data.length, w).setValues(data);
      sh.setFrozenRows(1);
    });
    var def = ss.getSheetByName('Sheet1') || ss.getSheetByName('Lembar1'); if (def && ss.getSheets().length > 1 && !def.getLastRow()) ss.deleteSheet(def);
    return { id: ss.getId(), tabs: order.filter(function (n) { return tabs[n]; }).map(function (n) { return n + ' ' + (tabs[n].length - 1); }) };
  }

  /** Dari snapshot terbit: baca payload inti & referensi lalu tulis. */
  function run() {
    var p = Store.pointer(); if (!p) throw new Error('Snapshot belum ada.');
    var dec = function (gz) { return JSON.parse(Utilities.ungzip(Utilities.newBlob(Utilities.base64Decode(gz), 'application/x-gzip')).getDataAsString()); };
    var core = dec(Store.payload('core')), ref = dec(Store.payload('ref'));
    return write(build(core, ref));
  }
  return { build: build, write: write, run: run, modules_: modules_ };
})();

/** Editor: perbarui spreadsheet diagnostik sekarang. */
function diagnostikNow() { pemilik_(); console.log(JSON.stringify(Diag.run())); }
