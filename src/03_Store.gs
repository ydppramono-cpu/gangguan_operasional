/**
 * 03_Store.gs — penyimpanan snapshot: berkas gzip di folder Drive milik app + salinan di CacheService.
 * Browser menerima string base64 gzip lalu membukanya sendiri (DecompressionStream).
 */
var Store = (function () {
  var CHUNK = 90000; // < 100 KB per kunci CacheService

  function props() { return PropertiesService.getScriptProperties(); }

  function folder() {
    var id = props().getProperty('SNAPSHOT_FOLDER_ID');
    if (id) { try { return DriveApp.getFolderById(id); } catch (e) { /* dibuat ulang */ } }
    var f = DriveApp.createFolder('KAI Dashboard v2 — Snapshot (jangan dibagikan)');
    props().setProperty('SNAPSHOT_FOLDER_ID', f.getId());
    return f;
  }

  function gzB64(obj) {
    var blob = Utilities.newBlob(JSON.stringify(obj), 'application/json');
    return Utilities.base64Encode(Utilities.gzip(blob).getBytes());
  }

  /** Simpan berkas (menimpa isi berkas lama bila ada) dan kembalikan ID. */
  function writeFile(name, b64) {
    var f = folder(), it = f.getFilesByName(name), blob = Utilities.newBlob(b64, 'text/plain', name);
    if (it.hasNext()) { var file = it.next(); file.setContent(b64); return file.getId(); }
    return f.createFile(blob).getId();
  }
  function readFile(id) { return DriveApp.getFileById(id).getBlob().getDataAsString(); }

  function cachePut(key, str) {
    var c = CacheService.getScriptCache(), n = Math.ceil(str.length / CHUNK), m = {};
    for (var i = 0; i < n; i++) m[CONFIG.CACHE_PREFIX + key + ':' + i] = str.slice(i * CHUNK, (i + 1) * CHUNK);
    m[CONFIG.CACHE_PREFIX + key + ':n'] = String(n);
    try { c.putAll(m, 21600); } catch (e) { console.warn('cache penuh: ' + e); }
  }
  function cacheGet(key) {
    var c = CacheService.getScriptCache(), n = Number(c.get(CONFIG.CACHE_PREFIX + key + ':n') || 0);
    if (!n) return null;
    var keys = []; for (var i = 0; i < n; i++) keys.push(CONFIG.CACHE_PREFIX + key + ':' + i);
    var got = c.getAll(keys), parts = [];
    for (var j = 0; j < n; j++) { if (got[keys[j]] == null) return null; parts.push(got[keys[j]]); }
    return parts.join('');
  }

  /** Publikasi atomik: tulis berkas dulu, lalu ganti penunjuk versi. */
  function publish(version, core, narr, ref, meta) {
    var coreB64 = gzB64(core), narrB64 = gzB64(narr), refB64 = gzB64(ref);
    var coreId = writeFile('core-' + version + '.b64', coreB64);
    var narrId = writeFile('narr-' + version + '.b64', narrB64);
    var refId = writeFile('ref-' + version + '.b64', refB64);
    var pointer = { version: version, coreId: coreId, narrId: narrId, refId: refId, meta: meta };
    var old = props().getProperty('SNAPSHOT_POINTER');
    props().setProperty('SNAPSHOT_POINTER', JSON.stringify(pointer));
    cachePut('core:' + version, coreB64);
    cachePut('narr:' + version, narrB64);
    cachePut('ref:' + version, refB64);
    // Bersihkan berkas versi lama (simpan satu versi sebelumnya untuk pemulihan).
    if (old) {
      try {
        var prev = JSON.parse(old), keep = {};
        [coreId, narrId, refId, prev.coreId, prev.narrId, prev.refId].forEach(function (id) { if (id) keep[id] = 1; });
        var files = folder().getFiles();
        while (files.hasNext()) { var f = files.next(); if (/^(core|narr|ref)-/.test(f.getName()) && !keep[f.getId()]) f.setTrashed(true); }
      } catch (e) { console.warn('pembersihan: ' + e); }
    }
    return pointer;
  }

  function pointer() {
    var p = props().getProperty('SNAPSHOT_POINTER');
    return p ? JSON.parse(p) : null;
  }

  function payload(kind) {
    var p = pointer(); if (!p) return null;
    var k = kind + ':' + p.version, hit = cacheGet(k);
    if (hit) return hit;
    var id = { core: p.coreId, narr: p.narrId, ref: p.refId }[kind];
    if (!id) return null;
    var data = readFile(id);
    cachePut(k, data);
    return data;
  }

  return { publish: publish, pointer: pointer, payload: payload, gzB64: gzB64, cachePut: cachePut, cacheGet: cacheGet };
})();
