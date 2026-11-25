/**
 * 32_JplOsm.gs — nama & kelas jalan di perlintasan sebidang dari OpenStreetMap (keputusan pemilik 25 Nov 2026).
 *
 * Cara kerja (dijalankan pemilik dari editor, sekali; berlanjut sendiri sampai selesai):
 *   jplOsmNow() → untuk setiap petak berpeta (SEED_PETA.pg, geometri rel OSM) ditanyakan ke Overpass API node
 *   railway=level_crossing dalam 40 m dari garis petak beserta jalan (way highway) yang melewatinya. Hasil per perlintasan:
 *   petak (kode urut abjad), urutan dari stasiun pertama kunci itu, fraksi posisi, koordinat, nama/ref/kelas jalan, tag ref/palang/penjaga OSM.
 *   Disimpan di spreadsheet baru "KAI | Perlintasan OSM" (Script Property JPL_OSM_DB_ID) — tab tim tidak disentuh.
 *   Batas waktu Apps Script 6 menit → dikerjakan bertahap; pemicu waktu sekali-jalan melanjutkan otomatis lalu dihapus.
 * Data: © kontributor OpenStreetMap, ODbL 1.0. Overpass dipakai ±1 permintaan per detik (kebijakan pemakaian wajar).
 * Pencocokan ke nomor JPL dilakukan di browser (Js.Ref): ref OSM sama → pasti; satu-satunya perlintasan di petak atau urutan
 * sama dengan daftar JPL → "perkiraan"; selain itu ditampilkan sebagai kandidat.
 */
var JplOsm = (function () {
  var URL = 'https://overpass-api.de/api/interpreter', SHEET = 'OSM_PERLINTASAN', HANDLER = 'jplOsmLanjut_';
  var HEAD = ['petak', 'urut', 'fraksi', 'lat', 'lon', 'osm_node', 'jalan', 'ref_jalan', 'kelas_jalan', 'jalan_lain', 'ref_osm', 'palang', 'dijaga', 'diambil'];

  function decode_(a) { var o = [], x = a[0], y = a[1]; o.push([y / 1e4, x / 1e4]); for (var i = 2; i + 1 < a.length; i += 2) { x += a[i]; y += a[i + 1]; o.push([y / 1e4, x / 1e4]); } return o; }
  function m_(a, b) { var dy = (a[0] - b[0]) * 111320, dx = (a[1] - b[1]) * 111320 * Math.cos(a[0] * Math.PI / 180); return Math.sqrt(dx * dx + dy * dy); }
  /** Proyeksi titik ke polyline: { d (m), t (0..1 sepanjang garis) }. */
  function project_(P, q) {
    var tot = 0, L = []; for (var i = 1; i < P.length; i++) { var l = m_(P[i - 1], P[i]); L.push(l); tot += l; }
    var best = { d: Infinity, t: 0 }, acc = 0;
    for (var j = 1; j < P.length; j++) {
      var a = P[j - 1], b = P[j], kx = 111320 * Math.cos(a[0] * Math.PI / 180), ky = 111320;
      var bx = (b[1] - a[1]) * kx, by = (b[0] - a[0]) * ky, qx = (q[1] - a[1]) * kx, qy = (q[0] - a[0]) * ky, ll = bx * bx + by * by;
      var u = ll ? Math.max(0, Math.min(1, (qx * bx + qy * by) / ll)) : 0, dx = qx - u * bx, dy = qy - u * by, d = Math.sqrt(dx * dx + dy * dy);
      if (d < best.d) best = { d: d, t: tot ? (acc + u * L[j - 1]) / tot : 0 };
      acc += L[j - 1];
    }
    return best;
  }
  function thin_(P, n) { if (P.length <= n) return P; var o = [], s = (P.length - 1) / (n - 1); for (var i = 0; i < n; i++) o.push(P[Math.round(i * s)]); return o; }

  /** Satu petak → baris hasil (tanpa I/O kecuali fetch yang diberikan). fetch(query) → teks JSON Overpass. */
  function petak(key, enc, fetch, today) {
    var P = decode_(enc), Q = thin_(P, 60), around = Q.map(function (p) { return p[0].toFixed(5) + ',' + p[1].toFixed(5); }).join(',');
    var q = '[out:json][timeout:50];node(around:40,' + around + ')[railway=level_crossing]->.c;.c out body;way(bn.c)[highway];out body;';
    var J = JSON.parse(fetch(q)), nodes = [], ways = [];
    (J.elements || []).forEach(function (e) { if (e.type === 'node') nodes.push(e); else if (e.type === 'way') ways.push(e); });
    var byNode = {}; ways.forEach(function (w) { (w.nodes || []).forEach(function (n) { (byNode[n] = byNode[n] || []).push(w); }); });
    var ab = key.split('-'), sk = ab.slice().sort().join('-'), flip = sk !== key;   // kunci petak = kode urut abjad (sama dengan segKey)
    var rows = nodes.map(function (n) {
      var pr = project_(P, [n.lat, n.lon]); if (pr.d > 40) return null; if (flip) pr.t = 1 - pr.t;
      var W = (byNode[n.id] || []).slice().sort(function (a, b) { return (b.tags && b.tags.name ? 1 : 0) - (a.tags && a.tags.name ? 1 : 0); }), w = W[0] || { tags: {} }, t = n.tags || {};
      var other = W.slice(1).map(function (x) { return x.tags && x.tags.name; }).filter(function (s, i, A) { return s && s !== w.tags.name && A.indexOf(s) === i; });
      return [sk, 0, Math.round(pr.t * 1000) / 1000, n.lat, n.lon, n.id, w.tags.name || '', w.tags.ref || '', w.tags.highway || '', other.join('; '),
        t.ref || t.name || '', t['crossing:barrier'] || t['crossing'] || '', t.supervised || '', today];
    }).filter(Boolean).sort(function (a, b) { return a[2] - b[2]; });
    rows.forEach(function (r, i) { r[1] = i + 1; });
    return rows;
  }

  function sheet_() {
    var props = PropertiesService.getScriptProperties(), id = props.getProperty('JPL_OSM_DB_ID'), ss = null;
    if (id) { try { ss = SpreadsheetApp.openById(id); } catch (e) { ss = null; } }
    if (!ss) { ss = SpreadsheetApp.create('KAI | Perlintasan OSM'); props.setProperty('JPL_OSM_DB_ID', ss.getId()); }
    var sh = ss.getSheetByName(SHEET) || ss.insertSheet(SHEET);
    return sh;
  }
  function clearTriggers_() { ScriptApp.getProjectTriggers().forEach(function (t) { if (t.getHandlerFunction() === HANDLER) ScriptApp.deleteTrigger(t); }); }

  /** Kerjakan petak berikutnya sampai ±4,5 menit; simpan posisi; jadwalkan lanjutan bila belum selesai. */
  function step(restart) {
    var props = PropertiesService.getScriptProperties(), keys = Object.keys(SEED_PETA.pg).sort(), st = JSON.parse(props.getProperty('JPL_OSM_STATE') || '{"i":0}');
    var sh = sheet_(), t0 = Date.now(), today = Utilities.formatDate(new Date(), 'Asia/Jakarta', 'yyyy-MM-dd'), err = 0;
    if (restart || !st.i) { sh.clearContents(); sh.getRange(1, 1, 1, HEAD.length).setValues([HEAD]); sh.setFrozenRows(1); st = { i: 0, n: 0, gagal: [] }; }
    var fetch = function (q) {
      var r = UrlFetchApp.fetch(URL, { method: 'post', payload: { data: q }, muteHttpExceptions: true, headers: { 'User-Agent': 'KAI-Dashboard-Gangguan (Apps Script)' } });
      if (r.getResponseCode() !== 200) throw new Error('Overpass ' + r.getResponseCode());
      return r.getContentText();
    };
    while (st.i < keys.length && Date.now() - t0 < 270000) {
      var k = keys[st.i];
      try { var rows = petak(k, SEED_PETA.pg[k], fetch, today); if (rows.length) sh.getRange(sh.getLastRow() + 1, 1, rows.length, HEAD.length).setValues(rows); st.n += rows.length; }
      catch (e) { err++; st.gagal.push(k); if (err > 5) { Utilities.sleep(30000); err = 0; } }
      st.i++; Utilities.sleep(1100);
    }
    var done = st.i >= keys.length;
    props.setProperty('JPL_OSM_STATE', JSON.stringify(done ? { i: 0, n: st.n, gagal: st.gagal, selesai: today } : st));
    clearTriggers_();
    if (!done) ScriptApp.newTrigger(HANDLER).timeBased().after(60 * 1000).create();
    return { petak: st.i, dari: keys.length, perlintasan: st.n, gagal: st.gagal.length, selesai: done };
  }

  /** Baca hasil untuk snapshot (ref.jplOsm). Kosong bila belum pernah diambil. */
  function read() {
    var id = PropertiesService.getScriptProperties().getProperty('JPL_OSM_DB_ID'); if (!id) return [];
    var sh = SpreadsheetApp.openById(id).getSheetByName(SHEET); if (!sh || sh.getLastRow() < 2) return [];
    return sh.getRange(2, 1, sh.getLastRow() - 1, HEAD.length).getValues().map(function (r) { return [String(r[0]), +r[1], +r[2], +r[3], +r[4], String(r[6] || ''), String(r[7] || ''), String(r[8] || ''), String(r[9] || ''), String(r[10] || ''), String(r[11] || ''), String(r[12] || '')]; });
  }
  return { petak: petak, step: step, read: read, project_: project_, decode_: decode_ };
})();

/** Editor: ambil ulang nama jalan perlintasan dari OpenStreetMap (berlanjut otomatis sampai semua petak selesai). */
function jplOsmNow() { pemilik_(); console.log(JSON.stringify(JplOsm.step(true))); }
/** Lanjutan otomatis (pemicu waktu). */
function jplOsmLanjut_() { console.log(JSON.stringify(JplOsm.step(false))); }
