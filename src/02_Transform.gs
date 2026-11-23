/**
 * 02_Transform.gs — mengubah baris Gangguan_Induk menjadi snapshot ringkas (fungsi murni).
 * Output dikirim ke browser apa adanya; semua agregasi dilakukan di browser (Js.Analytics).
 */
var CORE_FIELDS = ['id', 'ym', 'd', 'kelas', 'kategori', 'sub', 'judul', 'wilayah', 'jenis', 'sarana', 'saranaRaw',
  'lokType', 'lokasi', 'lokCode', 'lintas', 'km', 'ka', 'kaNama', 'kaJenis', 'menit', 'cross', 'temperLain', 'komp',
  'jam', 'depo', 'sumber', 'q', 'penyebab', 'kode', 'hm', 'kmv', 'jpl', 'kaVia', 'drv'];

/** drv = daftar isian yang DITURUNKAN dari judul/uraian karena kolom sumbernya kosong (ditampilkan bertanda di dashboard). */

function transformRows_(values, idx, nowYm, kor) {
  kor = kor || {};
  var D = Domain;
  if (!nowYm) { var t = new Date(); nowYm = t.getFullYear() + '-' + ('0' + (t.getMonth() + 1)).slice(-2); }
  // Cari baris judul (baris pertama yang memuat "Kunci asal").
  var h = -1;
  for (var i = 0; i < Math.min(values.length, 10); i++) {
    if (values[i].map(D.txt).indexOf(SOURCE_COLUMNS.kunci) >= 0) { h = i; break; }
  }
  if (h < 0) throw new Error('Kolom "' + SOURCE_COLUMNS.kunci + '" tidak ditemukan di ' + CONFIG.SOURCE_SHEET);
  var head = values[h].map(D.txt), col = {}, missing = [];
  Object.keys(SOURCE_COLUMNS).forEach(function (k) {
    col[k] = head.indexOf(SOURCE_COLUMNS[k]);
    if (col[k] < 0) missing.push(SOURCE_COLUMNS[k]);
  });
  if (missing.length) throw new Error('Kolom hilang: ' + missing.join(', ') + '. Snapshot lama dipertahankan.');
  Object.keys(SOURCE_COLUMNS_OPT).forEach(function (k) { col[k] = head.indexOf(SOURCE_COLUMNS_OPT[k]); });

  var rows = [], narr = {}, seen = {}, units = {}, silang = []; // silang = sarana yang pulau unitnya ≠ pulau kejadian
  var stats = { source: 0, skipped: 0, blank: 0, incomplete: 0, corrected: 0, dateConflict: 0, noDate: 0, badMinutes: 0, dupKey: 0, saranaMatched: 0, saranaAny: 0,
    lokMatched: 0, lokAny: 0, kaMatched: 0, kaAny: 0, review: {} };
  function g(r, k) { return col[k] >= 0 ? r[col[k]] : ''; }
  function flag(name) { stats.review[name] = (stats.review[name] || 0) + 1; }

  for (var r = h + 1; r < values.length; r++) {
    var row = values[r];
    var id = D.txt(g(row, 'kunci'));
    if (!id) { stats.skipped++; continue; }           // baris tanpa kunci asal (baris rusak/bergeser)
    stats.source++;
    if (seen[id]) { stats.dupKey++; flag('Kunci asal ganda'); id = id + '#' + seen[id]; }
    seen[D.txt(g(row, 'kunci'))] = (seen[D.txt(g(row, 'kunci'))] || 0) + 1;

    // Baris kosong total (tanpa judul & wilayah & kategori & subgangguan) = bukan kejadian → tidak dihitung (dicatat).
    if (!D.txt(g(row, 'judul')) && !D.txt(g(row, 'wilayah')) && !D.txt(g(row, 'kategori')) && !D.txt(g(row, 'sub'))) { stats.blank++; flag('Baris kosong (tidak dihitung)'); continue; }
    var q = [];
    var sg = D.signature(g(row, 'judul'), g(row, 'wilayah'), g(row, 'menit'), g(row, 'ket')), kr = kor[sg] || {};
    if (Object.keys(kr).length) stats.corrected++;
    // Tanggal K5: Tanggal kejadian → Hari/Bulan/Tahun → M_KOREKSI (koreksi menang).
    var dTk = col.tanggalKejadian >= 0 ? D.parseTanggal(g(row, 'tanggalKejadian')) : { ym: '' };
    var dHb = D.parseDate(g(row, 'hari'), g(row, 'bulan'), g(row, 'tahun'));
    var dt = dTk.ym ? dTk : dHb;
    if (dTk.ym && dHb.ym && dTk.ym !== dHb.ym) { stats.dateConflict++; q.push('Tanggal bertentangan (Tanggal kejadian ' + dTk.ym + ' vs Bulan/Tahun ' + dHb.ym + ')'); flag('Tanggal bertentangan'); }
    if (kr.tanggal) { var dK = D.parseTanggal(kr.tanggal); if (dK.ym) { dt = dK; q.push('Tanggal dikoreksi (M_KOREKSI)'); } }
    if (dt.ym && dt.ym > nowYm) { dt = { ym: '', y: 0, m: 0, d: 0 }; q.push('Tanggal di masa depan'); flag('Tanggal di masa depan'); stats.noDate++; }
    else if (!dt.ym) { stats.noDate++; q.push('Tanggal tidak valid'); flag('Tanggal tidak valid'); }
    var mn = D.number(g(row, 'menit'));
    if (!mn.ok && D.txt(g(row, 'menit'))) { stats.badMinutes++; q.push('Menit tidak numerik'); flag('Menit tidak numerik'); }

    var drv = [], judul = D.txt(g(row, 'judul')), ketTxt = D.txt(g(row, 'ket')), both = judul + '\n' + ketTxt;
    if (mn.ok && mn.value % 1) { q.push('Menit bukan bilangan bulat'); flag('Menit bukan bilangan bulat'); }
    var sub = D.txt(g(row, 'sub')), kat = D.txt(g(row, 'kategori'));
    if (kr.subgangguan) { sub = kr.subgangguan; q.push('Label dikoreksi (M_KOREKSI)'); }
    var kelas = kr.kelas || D.classify(kat, sub);
    if (kelas === 'belum') {
      // Kategori & Subgangguan kosong: kelas diturunkan dari judul bila polanya tegas (berlabel "diturunkan"); bila tidak, tetap "belum".
      var kt = D.classifyText(judul);
      if (kt) { kelas = kt; drv.push('kelas'); stats.kelasDiturunkan = (stats.kelasDiturunkan || 0) + 1; q.push('Kelas diturunkan dari judul (Kategori & Subgangguan kosong di sumber)'); }
      else { stats.incomplete++; flag('Data belum lengkap'); q.push('Data belum lengkap: Kategori & Subgangguan kosong'); }
    }
    var jenis = D.assetKind(g(row, 'jenisSarana'), sub);

    var cands = D.saranaCandidates(g(row, 'noSarana')), sar = [];
    if (!cands.length) { cands = D.saranaFromText(both).filter(function (c) { return idx.sar[c]; }); if (cands.length) drv.push('sarana'); }
    if (cands.length) {
      stats.saranaAny++;
      cands.forEach(function (c) { if (idx.sar[c]) { sar.push(c); units[c] = [idx.sar[c].cls, idx.sar[c].dipo]; } });
      if (sar.length) stats.saranaMatched++; else { q.push('Nomor sarana tidak dikenal'); flag('Nomor sarana tidak dikenal'); }
      // Nomor yang tidak dikenal tetap disimpan (di belakang) agar riwayat unit KRD/KRL tidak hilang.
      cands.forEach(function (c) { if (sar.indexOf(c) < 0) sar.push(c); });
    }

    var loc = D.location(g(row, 'petak'), g(row, 'stasiun'), idx, g(row, 'wilayah'));
    if (!loc.type || loc.type === 'lain') { var lt = D.locationFromText(judul, idx, g(row, 'wilayah')) || D.locationFromText(ketTxt, idx, g(row, 'wilayah')); if (lt) { loc = lt; drv.push('lokasi'); } }
    if (loc.type) { stats.lokAny++; if (loc.matched) stats.lokMatched++; else { q.push('Lokasi tidak dikenal'); flag('Lokasi tidak dikenal'); } }

    // Pulau kejadian dari wilayah sumber (Daop = Jawa, Divre = Sumatera); dipakai menolak tautan KA/sarana pulau lain.
    var pKej = D.pulauWil(g(row, 'wilayah')) || (loc.code && idx.st[loc.code.split('-')[0]] ? D.pulauWil(idx.st[loc.code.split('-')[0]].region) : '');
    var ka = kr.ka ? D.trainNumber(kr.ka) : D.trainNumber(g(row, 'ka'));
    if (!ka) { ka = D.kaFromText(judul) || D.kaFromText(ketTxt); if (ka) drv.push('ka'); }
    if (ka && pKej === 'Sumatera' && D.pulauKa(ka) !== 'Sumatera') { var kaA = D.kaAwalan(ka, g(row, 'wilayah')); if (kaA) { ka = kaA; drv.push('ka-awalan'); } }
    var lk = ka ? D.trainLookup(ka, idx) : null, kaInfo = lk ? lk.info : null;
    if (kaInfo && pKej && D.pulauKa(ka) && D.pulauKa(ka) !== pKej) {
      kaInfo = null; lk = null; stats.kaBedaPulau = (stats.kaBedaPulau || 0) + 1;
      q.push('Nomor KA ' + ka + ' terdaftar di ' + D.pulauKa(ka) + ', kejadian di ' + pKej + ' (tidak ditautkan)'); flag('Nomor KA beda pulau');
    }
    if (ka) { stats.kaAny++; if (kaInfo) { stats.kaMatched++; if (lk.via) { var vk = /^nomor dasar/.test(lk.via) ? 'kaViaBase' : /^nomor gabungan/.test(lk.via) ? 'kaViaJoint' : 'kaViaTimetable'; stats[vk] = (stats[vk] || 0) + 1; } } }

    var src = D.txt(g(row, 'sumber'));
    var tm = D.parseTime(g(row, 'jam')), jamTxt = D.txt(g(row, 'jam'));
    if (!tm) { tm = D.timeFromText(ketTxt); if (tm) { drv.push('jam'); jamTxt = ('0' + tm.h).slice(-2) + ':' + ('0' + tm.m).slice(-2); } }
    if (tm) stats.timeOk = (stats.timeOk || 0) + 1;
    var kmTxt = D.txt(g(row, 'km'));
    if (!kmTxt) { kmTxt = D.kmFromText(both); if (kmTxt) drv.push('km'); }
    var kmv = D.parseKm(kmTxt);
    var wil = D.region(g(row, 'wilayah'));
    if (!wil && loc.code && idx.st[loc.code.split('-')[0]]) { wil = idx.st[loc.code.split('-')[0]].region; if (wil) drv.push('wilayah'); }
    var depo = D.txt(g(row, 'depo'));
    if (!depo && sar[0] && idx.sar[sar[0]] && idx.sar[sar[0]].dipo) { depo = idx.sar[sar[0]].dipo; drv.push('depo'); }
    var peny = D.txt(g(row, 'penyebab'));
    if (!peny) { peny = D.causeFromText(ketTxt); if (peny) drv.push('penyebab'); }
    var jpl = D.jplNo(judul + ' ' + ketTxt + ' ' + kmTxt);
    if (pKej && sar.length) {
      var tgl = dt.ym ? dt.ym + '-' + ('0' + (dt.d || 1)).slice(-2) : '';
      sar.forEach(function (c) { var pu = D.pulauUnit(idx.sar[c], c, tgl); if (pu && pu !== pKej) silang.push({ ri: rows.length, c: c, p: pKej, tgl: tgl }); });
    }
    var rec = [
      id, dt.ym, dt.d, kelas, D.title(kat) || '', sub, judul, wil,
      jenis, sar.join('|'), D.txt(g(row, 'noSarana')).slice(0, 120),
      loc.type === 'lain' ? '' : loc.type, loc.label, loc.code, loc.lintas, kmTxt.slice(0, 40),
      ka, kaInfo ? kaInfo.name : '', kaInfo ? kaInfo.type : '',
      Math.round(mn.value * 100) / 100, D.crossing(sub), D.temperOther(sub) ? 1 : 0,
      kelas === 'sarana' ? D.component(sub) : '',
      jamTxt, depo, /JASUM/i.test(src) ? 'JASUM' : 'GOOGLE',
      q.concat(D.txt(g(row, 'kualitas')) && !/tanpa temuan/i.test(D.txt(g(row, 'kualitas'))) ? [D.txt(g(row, 'kualitas'))] : []).join('; '),
      peny.slice(0, 200), D.txt(g(row, 'kode')),
      tm ? tm.h * 60 + tm.m : -1, kmv == null ? '' : kmv, jpl, lk ? lk.via : '', drv.join(',')
    ];
    rows.push(rec);
    var ket = D.txt(g(row, 'ket')), tl = D.txt(g(row, 'tindak'));
    if (ket || tl) narr[id] = [ket, tl];
  }
  // Sarana beda pulau: ≥ 2 kejadian unit yang sama di pulau lain = mutasi antarpulau (tautan dipertahankan, dicatat);
  // hanya 1 kejadian = nomor diragukan → dilepas dari kejadian (teks asli tetap di kolom nomor sumber) dan masuk antrean verifikasi.
  var perUnit = {};
  silang.forEach(function (x) { var k = x.c + '|' + x.p; (perUnit[k] = perUnit[k] || []).push(x); });
  stats.saranaMutasi = []; stats.saranaVerifikasi = [];
  Object.keys(perUnit).forEach(function (k) {
    var L = perUnit[k], c = L[0].c, p = L[0].p;
    if (L.length >= 2) {
      var t = L.map(function (x) { return x.tgl; }).filter(Boolean).sort();
      stats.saranaMutasi.push([c, p, t[0] || '', t[t.length - 1] || '', L.length]);
      L.forEach(function (x) { rows[x.ri][26] = (rows[x.ri][26] ? rows[x.ri][26] + '; ' : '') + 'Unit ' + c + ' tercatat mutasi ke ' + p; });
    } else {
      var r = rows[L[0].ri];
      r[9] = String(r[9]).split('|').filter(function (z) { return z && z !== c; }).join('|');
      r[26] = (r[26] ? r[26] + '; ' : '') + 'Nomor sarana ' + c + ' terdaftar di pulau lain (tidak ditautkan, perlu verifikasi)';
      stats.saranaVerifikasi.push([r[0], c, p, L[0].tgl, idx.sar[c] ? idx.sar[c].dipo : '']);
    }
  });
  return { fields: CORE_FIELDS, rows: rows, units: units, narr: narr, stats: stats };
}

/** Ubah isi tab master (nilai mentah 2D) menjadi sumber untuk Domain.buildIndex. */
function mastersFromValues_(kaVals, stVals, pjVals, sarVals, jdVals) {
  var D = Domain;
  function headerRow(vals, label) {
    for (var i = 0; i < Math.min(vals.length, 10); i++) if (vals[i].map(D.txt).indexOf(label) >= 0) return i;
    return -1;
  }
  var src = { stations: [], segments: [], trains: [], sarana: [], timetable: [] };
  var hj = headerRow(jdVals || [], 'No KA');
  if (hj >= 0) {
    var jh = jdVals[hj].map(D.txt), jc = ['No KA', 'Nama KA', 'Relasi', 'Sumber'].map(function (x) { return jh.indexOf(x); }), seenJ = {};
    jdVals.slice(hj + 1).forEach(function (r) {
      var no = D.txt(r[jc[0]]); if (!no || seenJ[no]) return; seenJ[no] = 1;
      src.timetable.push(jc.map(function (i) { return i >= 0 ? r[i] : ''; }));
    });
  }
  var hs = headerRow(stVals, 'Singkatan Stasiun');
  if (hs >= 0) {
    var h = stVals[hs].map(D.txt), c = h.indexOf('Singkatan Stasiun'), n = h.indexOf('Nama Stasiun'), w = h.indexOf('Wilayah Operasi');
    stVals.slice(hs + 1).forEach(function (r) { src.stations.push([r[c], r[n], r[w]]); });
  }
  var hp = headerRow(pjVals, 'Stasiun A');
  if (hp >= 0) {
    var p = pjVals[hp].map(D.txt);
    var ci = ['Daop/Divre', 'Lintas', 'Stasiun A', 'Stasiun B', 'Jarak'].map(function (x) { return p.indexOf(x); });
    pjVals.slice(hp + 1).forEach(function (r) { src.segments.push(ci.map(function (i) { return i >= 0 ? r[i] : ''; })); });
  }
  var hk = headerRow(kaVals, 'No KA');
  if (hk >= 0) {
    var k = kaVals[hk].map(D.txt);
    var kc = [k.indexOf('No KA'), k.indexOf('Nama KA'), k.indexOf('Lintas'), k.indexOf('Pnp/brg')];
    kaVals.slice(hk + 1).forEach(function (r) { src.trains.push(kc.map(function (i) { return i >= 0 ? r[i] : ''; })); });
  }
  var hsr = headerRow(sarVals, 'no_sarana');
  if (hsr >= 0) {
    var s = sarVals[hsr].map(D.txt);
    var sc = [s.indexOf('no_sarana'), s.indexOf('class_desc'), s.indexOf('dipo_name'), s.indexOf('equipment_desc'), s.indexOf('plant')];
    sarVals.slice(hsr + 1).forEach(function (r) { src.sarana.push(sc.map(function (i) { return i >= 0 ? r[i] : ''; })); });
  }
  return src;
}
