/**
 * 09_Ref.gs — data referensi untuk pencarian & halaman profil (fungsi murni, bisa diuji di luar GAS).
 * Masukan: nilai mentah 2D dari tab master. Keluaran: larik ringkas yang dikirim ke browser apa adanya.
 *   st     [kode, nama, wilayah, status]
 *   pj     [stA, stB, km, lintas, wilayah, jalur]
 *   ka     [no, nama, kelas, pnp/brg, lintas, jarak, jamBer, jamDat, layanan, reg/tamb, rangkaian, kapasitas, klasifikasi, jenis REG/FAK/KLB/PLB]
 *   jpl    [id, antara, noJpl, km teks, km angka, provinsi, kab/kota, kategori jalan, lebar, status, penjaga, wilayah, prioritas190]
 *   jadwal [noKa, kodeStasiun, datang, berangkat, keterangan]   ← opsional (tab M_JADWAL)
 *   fleet  [no, jenis, kelas, depo, mulaiDinas yyyy-mm, pabrikan, kapasitas, kecepatanMaks km/j, beratKosong ton, model]
 */
function buildRef_(raw) {
  var D = Domain;
  function head(vals, label) {
    for (var i = 0; i < Math.min((vals || []).length, 10); i++) if (vals[i].map(D.txt).indexOf(label) >= 0) return i;
    return -1;
  }
  function cols(vals, h, names) {
    var hd = vals[h].map(D.txt);
    return names.map(function (n) { return hd.indexOf(n); });
  }
  function hhmm(v) {
    var t = D.parseTime(v);
    return t ? (t.h < 10 ? '0' : '') + t.h + ':' + (t.m < 10 ? '0' : '') + t.m : '';
  }
  function num(v) { var n = D.number(v); return n.ok ? Math.round(n.value * 1000) / 1000 : null; }
  var out = { st: [], pj: [], ka: [], jpl: [], jadwal: [], ops: [], depo: [], fleet: [], counts: {} };

  var hs = head(raw.st, 'Singkatan Stasiun');
  if (hs >= 0) {
    var c = cols(raw.st, hs, ['Singkatan Stasiun', 'Nama Stasiun', 'Wilayah Operasi', 'Status']);
    raw.st.slice(hs + 1).forEach(function (r) {
      var code = D.txt(r[c[0]]).toUpperCase(); if (!code) return;
      out.st.push([code, D.title(r[c[1]]), D.region(r[c[2]]), c[3] >= 0 ? D.txt(r[c[3]]).toLowerCase() : '']);
    });
  }

  var hp = head(raw.pj, 'Stasiun A');
  if (hp >= 0) {
    var p = cols(raw.pj, hp, ['Stasiun A', 'Stasiun B', 'Jarak', 'Lintas', 'Daop/Divre', 'Ganda/Tunggal']);
    raw.pj.slice(hp + 1).forEach(function (r) {
      var a = D.txt(r[p[0]]).toUpperCase(), b = D.txt(r[p[1]]).toUpperCase(); if (!a || !b) return;
      var km = num(r[p[2]]);
      // Sheet menyimpan 0,940 km sebagai "940" → petak >= 100 km tanpa pemisah dibagi 1.000 (lihat Domain.buildIndex).
      if (km !== null && km >= 100 && /^\d+$/.test(D.txt(r[p[2]]))) km = km / 1000;
      out.pj.push([a, b, km, D.title(r[p[3]]), D.region(r[p[4]]), D.txt(r[p[5]]).toLowerCase()]);
    });
  }

  var hk = head(raw.ka, 'No KA');
  if (hk >= 0) {
    var k = cols(raw.ka, hk, ['No KA', 'Nama KA', 'Kelas KA', 'Pnp/brg', 'Lintas', 'Jarak', 'Jam Ber', 'Jam Dat', 'Jenis Pelayanan', 'Reg/tamb', 'SF', 'Kap TD', 'Klasifikasi KA', 'Jenis KA']);
    var seenKa = {};
    raw.ka.slice(hk + 1).forEach(function (r) {
      var no = D.txt(r[k[0]]).toUpperCase(); if (!no || seenKa[no]) return; seenKa[no] = 1;
      out.ka.push([no, D.title(r[k[1]]), D.txt(r[k[2]]), D.txt(r[k[3]]).toUpperCase(), D.txt(r[k[4]]).toUpperCase().replace(/\s+/g, ''),
        num(r[k[5]]), hhmm(r[k[6]]), hhmm(r[k[7]]), D.txt(r[k[8]]), D.txt(r[k[9]]), k[10] >= 0 ? D.txt(r[k[10]]) : '', k[11] >= 0 ? (num(r[k[11]]) || '') : '', D.txt(r[k[12]]), k[13] >= 0 ? D.txt(r[k[13]]).toUpperCase() : '']);
    });
  }

  var hj = head(raw.jpl, 'No JPL');
  if (hj >= 0) {
    var j = cols(raw.jpl, hj, ['No', 'Antara', 'No JPL', 'KM+HM', 'Provinsi', 'Kabupaten/Kota', 'Kategori jalan', 'Lebar (m)', 'Status JPL', 'Penjaga', 'Daop/Divre', 'Prioritas 190']);
    raw.jpl.slice(hj + 1).forEach(function (r, i) {
      var antara = D.txt(r[j[1]]), kmt = D.txt(r[j[3]]);
      if (!antara && !kmt) return;   // 40 baris sumber memang tanpa kolom "Antara" → tetap disimpan
      out.jpl.push([D.txt(r[j[0]]) || String(i + 1), antara.toUpperCase(), D.txt(r[j[2]]).toUpperCase(), kmt, D.parseKm(kmt.split('-')[0]),
        D.title(r[j[4]]), D.title(r[j[5]]), D.txt(r[j[6]]).toUpperCase(), D.txt(r[j[7]]), D.txt(r[j[8]]).toUpperCase().replace(/\s*-\s*/, ' - '),
        D.txt(r[j[9]]).toUpperCase(), D.region(r[j[10]]), /^(ya|y|1|true)$/i.test(D.txt(r[j[11]])) ? 1 : 0]);
    });
  }

  // Jadwal per KA (Buku Daftar Waktu GAPEKA): [noKa, nama, relasi, sumber, "kode|datang|berangkat|ket|catatan\n..."]
  // ket: A = berangkat awal, Z = datang akhir, H = berhenti, L = langsung, S = berhenti sebentar.
  var hd = head(raw.jadwal, 'No KA');
  if (hd >= 0) {
    var s = cols(raw.jadwal, hd, ['No KA', 'Nama KA', 'Relasi', 'Urut', 'Kode stasiun', 'Datang', 'Berangkat', 'Keterangan', 'Catatan', 'Sumber']);
    var KET = { 'berangkat': 'A', 'datang': 'Z', 'berhenti': 'H', 'langsung': 'L', 'berhenti sebentar': 'S' }, byKa = {}, order = [];
    raw.jadwal.slice(hd + 1).forEach(function (r) {
      var no = D.txt(r[s[0]]).toUpperCase(), st = D.txt(r[s[4]]).toUpperCase(); if (!no || !st) return;
      var k = byKa[no];
      if (!k) { k = byKa[no] = { h: [no, D.txt(r[s[1]]), D.txt(r[s[2]]).toUpperCase(), s[9] >= 0 ? D.txt(r[s[9]]) : ''], rows: [] }; order.push(no); }
      var ket = s[7] >= 0 ? (KET[D.txt(r[s[7]]).toLowerCase()] || D.txt(r[s[7]])) : '';
      k.rows.push([s[3] >= 0 ? Number(D.txt(r[s[3]])) || k.rows.length + 1 : k.rows.length + 1, st, hhmm(r[s[5]]), hhmm(r[s[6]]), ket, s[8] >= 0 ? D.txt(r[s[8]]).replace(/[|\n]/g, ' ') : '']);
    });
    order.forEach(function (no) {
      var k = byKa[no]; k.rows.sort(function (a, b) { return a[0] - b[0]; });
      var n = k.rows.length;
      out.jadwal.push(k.h.concat([k.rows.map(function (x, i) {
        var ket = x[4] || (i === 0 ? 'A' : i === n - 1 ? 'Z' : 'H');
        return [x[1], x[2], x[3], ket, x[5]].join('|');
      }).join('\n')]));
    });
  }
  var ho = head(raw.ops, 'Kode stasiun');
  if (ho >= 0) {
    var o = cols(raw.ops, ho, ['Kode stasiun', 'Jenis', 'Buka', 'Tutup', 'Sumber']);
    raw.ops.slice(ho + 1).forEach(function (r) { var c = D.txt(r[o[0]]).toUpperCase(); if (c) out.ops.push([c, D.txt(r[o[1]]), D.txt(r[o[2]]), D.txt(r[o[3]]), D.txt(r[o[4]])]); });
  }

  var hq = head(raw.depo, 'No KA');
  if (hq >= 0) {
    var q = cols(raw.depo, hq, ['Depo', 'Kode stasiun', 'Jenis', 'No KA', 'Sumber']);
    raw.depo.slice(hq + 1).forEach(function (r) { var n = D.txt(r[q[0]]); if (n) out.depo.push([n, D.txt(r[q[1]]).toUpperCase(), D.txt(r[q[2]]), D.txt(r[q[3]]), D.txt(r[q[4]])]); });
  }

  // Pustaka rujukan eksternal (M_RUJUKAN): [id, jenis, apa, url, tanggal, wilayah, topik, fakta, implikasi, verifikasi]
  out.ruj = [];
  var hr = head(raw.ruj || [], 'Sitasi APA');
  if (hr >= 0) {
    var u = cols(raw.ruj, hr, ['ID', 'Jenis', 'Sitasi APA', 'URL', 'Tanggal terbit', 'Wilayah', 'Topik', 'Fakta kunci', 'Implikasi untuk operasi', 'Status verifikasi', 'Aktif']);
    raw.ruj.slice(hr + 1).forEach(function (r) {
      var apa = D.txt(r[u[2]]); if (!apa || /^(tidak|no|false)$/i.test(D.txt(r[u[10]]))) return;
      out.ruj.push([D.txt(r[u[0]]), D.txt(r[u[1]]), apa, D.txt(r[u[3]]), D.txt(r[u[4]]), D.txt(r[u[5]]), D.txt(r[u[6]]).toLowerCase(), D.txt(r[u[7]]), D.txt(r[u[8]]), D.txt(r[u[9]])]);
    });
  }

  var hf = head(raw.sar, 'no_sarana');
  if (hf >= 0) {
    var f = cols(raw.sar, hf, ['no_sarana', 'catalog_profile', 'class_desc', 'dipo_name', 'mulai_dinas', 'manuf_asset', 'kapasitas', 'characteristics_json', 'manuf_model_number']);
    raw.sar.slice(hf + 1).forEach(function (r) {
      var no = D.key(r[f[0]]), kind = FLEET_KIND[D.txt(r[f[1]]).toUpperCase()];
      if (!no || !kind) return;
      var md = r[f[4]], ym = '';
      if (md instanceof Date) ym = md.getFullYear() + '-' + ('0' + (md.getMonth() + 1)).slice(-2);
      else { var m = /^(\d{4})-(\d{2})/.exec(D.txt(md)) || /^(\d{1,2})[/.](\d{1,2})[/.](\d{4})/.exec(D.txt(md)); if (m) ym = m[1].length === 4 ? m[1] + '-' + m[2] : m[3] + '-' + ('0' + m[2]).slice(-2); }
      // Karakteristik SAP (opsional): kecepatan maks & berat kosong dari characteristics_json.
      var ch = {}, spd = '', bk = '';
      try { ch = f[7] >= 0 && D.txt(r[f[7]]) ? JSON.parse(D.txt(r[f[7]])) : {}; } catch (e) { ch = {}; }
      if (ch.MAXSPEED && +ch.MAXSPEED.number > 0) spd = Math.round(+ch.MAXSPEED.number);
      if (ch.BKOS && +ch.BKOS.number > 0) bk = Math.round(+ch.BKOS.number / 100) / 10;
      out.fleet.push([no, kind, D.txt(r[f[2]]), D.txt(r[f[3]]), ym, D.title(r[f[5]]), f[6] >= 0 ? D.txt(r[f[6]]) : '', spd, bk, f[8] >= 0 ? D.txt(r[f[8]]) : '']);
    });
  }
  out.duksar = typeof SEED_DUKSAR !== 'undefined' ? SEED_DUKSAR : null;   // Buku Dukungan Sarana GAPEKA (17_SeedDuksar.gs)
  out.peta = typeof SEED_PETA !== 'undefined' ? SEED_PETA : null;   // geometri jalur OSM + koordinat stasiun (18_SeedPeta.gs)
  Object.keys(out).forEach(function (key) { if (Array.isArray(out[key])) out.counts[key] = out[key].length; });
  return out;
}

/** Baris awal tab M_JPL (dari daftar "1404 Titik Perlintasan Sebidang Program Peningkatan Keselamatan"). */
var M_JPL_HEADER = ['No', 'Antara', 'No JPL', 'KM+HM', 'Provinsi', 'Kabupaten/Kota', 'Kategori jalan', 'Lebar (m)', 'Status JPL', 'Penjaga', 'Daop/Divre', 'Prioritas 190', 'Sumber'];
var M_JADWAL_HEADER = ['No KA', 'Nama KA', 'Relasi', 'Urut', 'Kode stasiun', 'Nama stasiun', 'Datang', 'Berangkat', 'Keterangan', 'Catatan', 'Sumber'];
var M_OPS_HEADER = ['Kode stasiun', 'Jenis', 'Buka', 'Tutup', 'Sumber'];
var M_DEPO_HEADER = ['Depo', 'Kode stasiun', 'Jenis', 'No KA', 'Sumber'];

/** Baris M_JADWAL dari seed gzip (Buku Daftar Waktu GAPEKA 2025). */
function seedJadwalRows_() {
  var blob = Utilities.newBlob(Utilities.base64Decode(SEED_JADWAL_GZ), 'application/x-gzip', 'jadwal.tsv.gz');
  var text = Utilities.ungzip(blob).getDataAsString('UTF-8');
  return text.split('\n').filter(String).map(function (l) { var a = l.split('\t'); while (a.length < 11) a.push(''); return a.slice(0, 11); });
}

function seedJplRows_() {
  return SEED_JPL.map(function (r) {
    return [r[0], r[1], r[2], r[3], r[4], r[5], r[6], r[7], r[8], r[9], r[10], r[11] ? 'Ya' : 'Tidak',
      'Daftar 1404 titik program peningkatan keselamatan (PDF)'];
  });
}
