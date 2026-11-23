/**
 * 01_Domain.gs — fungsi murni (tanpa layanan Google) untuk menormalkan dan mengklasifikasi kejadian.
 * Bisa diuji di luar Apps Script. Jangan memanggil SpreadsheetApp/DriveApp di file ini.
 */
var Domain = (function () {
  function txt(v) { return v == null ? '' : String(v).replace(/\u00a0/g, ' ').trim(); }
  function key(v) { return txt(v).toUpperCase().replace(/[^A-Z0-9]/g, ''); }
  function title(s) {
    return txt(s).toLowerCase().replace(/(^|[\s\-–(/])([a-z])/g, function (m, a, b) { return a + b.toUpperCase(); });
  }

  /** Bulan/Tahun/Hari terpisah → {ym:'2026-09', y, m, d} atau ym '' bila tidak valid. */
  function parseDate(hari, bulan, tahun) {
    var y = parseInt(txt(tahun), 10);
    var m = MONTH_KEYS[txt(bulan).toLowerCase().slice(0, 3)] || 0;
    var d = parseInt(txt(hari), 10);
    if (!(y >= 2020 && y <= 2030) || !m) return { ym: '', y: 0, m: 0, d: 0 };
    if (!(d >= 1 && d <= 31)) d = 0;
    return { ym: y + '-' + (m < 10 ? '0' : '') + m, y: y, m: m, d: d };
  }

  /**
   * Jam mulai → {h, m} atau null. Format yang ditemukan di sumber:
   * "17:53", "1:02", pecahan hari Excel "0,7083333", "18,08" (= 18:08). Serial tanggal "45933" = tanpa jam.
   */
  function parseTime(v) {
    if (v instanceof Date) return { h: v.getHours(), m: v.getMinutes() };
    if (typeof v === 'number') v = String(v).replace('.', ',');
    var s = txt(v);
    if (!s) return null;
    var m = /^(\d{1,2})[:.](\d{2})(?::\d{2})?$/.exec(s);
    if (m && +m[1] < 24 && +m[2] < 60) return { h: +m[1], m: +m[2] };
    m = /^0,(\d+)$/.exec(s);
    if (m) { var mins = Math.round(Number('0.' + m[1]) * 1440); if (mins >= 1440) mins = 1439; return { h: Math.floor(mins / 60), m: mins % 60 }; }
    m = /^(\d{1,2}),(\d{2})$/.exec(s);
    if (m && +m[1] >= 1 && +m[1] < 24 && +m[2] < 60) return { h: +m[1], m: +m[2] };
    return null;
  }

  /** "397+1/2" → 397.15 · "km 86+200" → 86.2 · "10+6/7" → 10.65 · "239+700" → 239.7 · "51+733" → 51.733. */
  function parseKm(v) {
    var s = txt(v).toLowerCase().replace(/^km\.?\s*/, '').replace(/\s/g, '');
    var m = /^(\d{1,4})\+(\d{1,3})(?:\/(\d{1,2}))?/.exec(s);
    if (!m) {
      if (/^\d{1,4}$/.test(s)) return Number(s);
      m = /^(\d{1,4})[,.](\d{1,3})$/.exec(s); if (!m) return null; return Number(m[1]) + Number('0.' + m[2]);
    }
    var km = Number(m[1]), a = m[2];
    if (m[3] != null) return Math.round((km + (Number(a) + 0.5) / 10) * 1000) / 1000; // antara hm a dan hm b
    return Math.round((km + Number(a) / Math.pow(10, a.length)) * 1000) / 1000;
  }

  /** Nomor JPL yang disebut di teks: "JPL 127", "JPL no. 26C", "JPL.98" → "127" / "26C". */
  function jplNo(text) {
    var m = /\bJPL\s*(?:no\.?|nomor)?\s*[.:]?\s*(\d{1,4}[A-Z]?)\b/i.exec(txt(text));
    return m ? m[1].toUpperCase() : '';
  }

  function number(v) {
    if (typeof v === 'number') return isFinite(v) && v >= 0 ? { value: v, ok: true } : { value: 0, ok: false };
    var s = txt(v).replace(/\s/g, '');
    if (!s) return { value: 0, ok: false };
    var n = Number(s.replace(',', '.'));
    return isFinite(n) && n >= 0 ? { value: n, ok: true } : { value: 0, ok: false };
  }

  function region(v) {
    var m = /^(daop|divre)\s*([0-9]+|iv|i{1,3})\b/i.exec(txt(v));
    if (!m) return txt(v);
    var n = { I: 1, II: 2, III: 3, IV: 4 }[m[2].toUpperCase()] || Number(m[2]);
    return (m[1].toLowerCase() === 'daop' ? 'Daop ' : 'Divre ') + n;
  }

  /** Klasifikasi 4 kelas berdasarkan CLASS_RULES (urutan = prioritas). */
  function classify(kategori, sub) {
    var k = txt(kategori).toLowerCase(), s = txt(sub);
    if (!k && !s) return 'belum';
    if (CLASS_BY_KATEGORI[k]) return CLASS_BY_KATEGORI[k];
    for (var i = 0; i < CLASS_RULES.length; i++) if (CLASS_RULES[i].sub.test(s)) return CLASS_RULES[i].kelas;
    return 'operasional';
  }

  /** Tanggal kejadian (Date / serial Excel / "2026-10-15" / "15 Oktober 2026") → {ym,y,m,d} atau ym ''. */
  var BULAN_PANJANG = { januari: 1, februari: 2, maret: 3, april: 4, mei: 5, juni: 6, juli: 7, agustus: 8, september: 9, oktober: 10, november: 11, desember: 12,
    january: 1, february: 2, march: 3, may: 5, june: 6, july: 7, august: 8, october: 10, december: 12 };
  function ymd(y, m, d) {
    if (!(y >= 2020 && y <= 2030) || !(m >= 1 && m <= 12) || !(d >= 1 && d <= 31)) return { ym: '', y: 0, m: 0, d: 0 };
    return { ym: y + '-' + (m < 10 ? '0' : '') + m, y: y, m: m, d: d };
  }
  function parseTanggal(v) {
    if (v instanceof Date && !isNaN(v)) return ymd(v.getFullYear(), v.getMonth() + 1, v.getDate());
    var s = txt(v);
    if (typeof v === 'number' || /^\d{5}(\.0+)?$/.test(s)) {
      var n = Math.floor(Number(s)); if (!(n > 20000 && n < 80000)) return ymd(0, 0, 0);
      var t = new Date(Date.UTC(1899, 11, 30) + n * 864e5); return ymd(t.getUTCFullYear(), t.getUTCMonth() + 1, t.getUTCDate());
    }
    var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(s); if (m) return ymd(+m[1], +m[2], +m[3]);
    m = /(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/.exec(s); if (m && BULAN_PANJANG[m[2].toLowerCase()]) return ymd(+m[3], BULAN_PANJANG[m[2].toLowerCase()], +m[1]);
    return ymd(0, 0, 0);
  }

  /** Tanda isi baris — kunci koreksi yang tidak bergeser saat baris disisipkan (judul|wilayah|menit|uraian). */
  function norm(s, k) { return txt(s).toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, k); }
  function signature(judul, wilayah, menit, ket) {
    var mn = number(menit);
    return norm(judul, 80) + '|' + norm(wilayah, 10) + '|' + (mn.ok ? String(Math.round(mn.value)) : '') + '|' + norm(ket, 40);
  }

  function crossing(sub, judul) {
    var s = txt(sub);
    for (var i = 0; i < CROSSING_RULES.length; i++) if (CROSSING_RULES[i].re.test(s)) return CROSSING_RULES[i].id;
    return '';
  }
  function temperOther(sub) { return TEMPER_OTHER_RE.test(txt(sub)); }

  function component(sub) {
    var s = txt(sub).replace(/^[^-]+-\s*/, ''); // buang awalan "Lokomotif - "
    for (var i = 0; i < COMPONENT_RULES.length; i++) if (COMPONENT_RULES[i].re.test(s)) return COMPONENT_RULES[i].id;
    return 'lain';
  }

  var KIND_MAP = { lokomotif: 'Lokomotif', lok: 'Lokomotif', kereta: 'Kereta', gerbong: 'Gerbong', krd: 'KRD', 'krd kci': 'KRD',
    krl: 'KRL', pembangkit: 'Pembangkit', genset: 'Pembangkit', rangkaian: 'Rangkaian' };
  function assetKind(jenis, sub) {
    var j = txt(jenis).toLowerCase();
    if (KIND_MAP[j]) return KIND_MAP[j];
    var p = txt(sub).split(' - ')[0].toLowerCase();
    if (KIND_MAP[p]) return KIND_MAP[p];
    if (/^kci\b/.test(p)) return 'KRL';
    return '';
  }

  /** "CC 206 13 49 (Cpn), CC2061350" → ["CC2061349","CC2061350"] (belum divalidasi ke master). */
  function saranaCandidates(raw) {
    var s = txt(raw);
    if (!s || s === '-' || /buka baris/i.test(s)) return [];
    s = s.replace(/\([^)]*\)/g, ' ');
    var parts = s.split(/[,;&+]|\bdan\b|\s\/\s|\n/i), out = [];
    parts.forEach(function (p) {
      var t = p.toUpperCase().replace(/\b(LOKO?|LOKOMOTIF|KRDI?|TS|NO)\b\.?/g, ' ');
      var k = t.replace(/[^A-Z0-9]/g, '');
      if (/^\d{7}$/.test(k) && /^20/.test(k)) k = 'CC' + k;          // "206 13 40"
      if (/^C\d{7}$/.test(k)) k = 'C' + k;                            // "C2040902"
      if (/^[A-Z]{1,4}\d{4,9}$/.test(k) && out.indexOf(k) < 0) out.push(k);
    });
    return out;
  }
  function saranaLabel(no) {
    var m = /^(CC|BB|D)(\d{3})(\d{2})(\d{2,3})$/.exec(no);
    return m ? m[1] + ' ' + m[2] + ' ' + m[3] + ' ' + m[4] : no;
  }

  function trainNumber(v) {
    var s = txt(v).toUpperCase();
    if (!s || /^(TIADA|-|0|NIHIL)$/.test(s)) return '';
    var m = /(?:\b(?:KA|PLB)\s*)?\b(\d{1,5}[A-Z]{0,2})\b/.exec(s);
    return m && m[1] !== '0' ? m[1] : '';
  }

  /**
   * Indeks master dari GAPEKA + Referensi Sarana.
   * stations: [[kode, nama, wilayah]], segments: [[wilayah, lintas, a, b, jarak]], trains: [[noKa, nama, relasi, jenis]],
   * sarana: [[no_sarana, class_desc, dipo_name, desc, plant]]
   */
  function buildIndex(src) {
    var idx = { st: {}, stName: {}, seg: {}, ka: {}, sar: {} };
    (src.stations || []).forEach(function (r) {
      var c = key(r[0]); if (!c) return;
      idx.st[c] = { code: txt(r[0]).toUpperCase(), name: title(r[1]), region: region(r[2]) };
      // Nama → DAFTAR kode: nama kembar (Ketapang KTG Daop 9 / KTP Divre 4, Larangan LR/LRA, …) tidak saling menimpa.
      var nk = key(r[1]); if (nk) { var L = idx.stName[nk] = idx.stName[nk] || []; if (L.indexOf(c) < 0) L.push(c); }
    });
    (src.segments || []).forEach(function (r) {
      var a = key(r[2]), b = key(r[3]); if (!a || !b) return;
      var j = number(r[4]), km = j.ok ? j.value : null;
      // Buku Penomoran GAPEKA: KM3–PID 0,940 km tercatat "940" di sheet → petak > 100 km tanpa pemisah dibagi 1.000.
      if (km !== null && km >= 100 && /^\d+$/.test(txt(r[4]))) km = km / 1000;
      idx.seg[[a, b].sort().join('-')] = { lintas: title(r[1]), region: region(r[0]), km: km };
    });
    (src.trains || []).forEach(function (r) {
      var k = key(r[0]); if (!k || idx.ka[k]) return;
      idx.ka[k] = { name: title(r[1]), route: txt(r[2]), type: txt(r[3]).toUpperCase() };
    });
    // Nomor gabungan LIST KA ("92-93", "187-188-189") → tiap nomor perjalanan juga dikenali.
    (src.trains || []).forEach(function (r) {
      var parts = txt(r[0]).split('-'); if (parts.length < 2) return;
      var info = idx.ka[key(r[0])];
      parts.forEach(function (p) { var k = key(p); if (k && !idx.ka[k] && info) idx.ka[k] = { name: info.name, route: info.route, type: info.type, via: 'nomor gabungan ' + txt(r[0]) }; });
    });
    // KA yang hanya ada di Buku Daftar Waktu (mis. Sumatera Barat, KA batubara Divre III).
    (src.timetable || []).forEach(function (r) {
      var k = key(r[0]); if (!k || idx.ka[k]) return;
      idx.ka[k] = { name: title(r[1]), route: txt(r[2]), type: kaTypeFrom(r[3], r[1]), via: 'Daftar Waktu (' + txt(r[3]) + ')' };
    });
    (src.sarana || []).forEach(function (r) {
      var k = key(r[0]); if (!k) return;
      idx.sar[k] = { cls: txt(r[1]), dipo: txt(r[2]), pulau: pulauPlant(r[4]) };
    });
    return idx;
  }

  /** Jenis KA untuk KA yang hanya ada di Daftar Waktu: dari judul buku, atau nama KA angkutan barang. */
  function kaTypeFrom(sumber, nama) {
    var s = txt(sumber), n = txt(nama);
    if (/barang/i.test(s) || /batu ?bara|baratarahan|babaranjang|cargo|kargo|semen|bbm|ketel|peti ?kemas|parcel|pupuk|klinker|kontainer|curah|cpo|kayu|logistik/i.test(n)) return 'BARANG';
    if (/dinas|lok\b|rangkaian/i.test(n)) return 'DINAS';
    return 'PENUMPANG';
  }

  /** Nomor KA kejadian → info LIST KA. Sufiks varian (577A, 29B) dicocokkan ke nomor dasar bila nomor persisnya tidak ada. */
  function trainLookup(no, idx) {
    var k = key(no); if (!k) return null;
    if (idx.ka[k]) return { info: idx.ka[k], via: idx.ka[k].via || '' };
    var m = /^(\d+)[A-Z]$/.exec(k);
    if (m && idx.ka[m[1]]) return { info: idx.ka[m[1]], via: 'nomor dasar ' + m[1] };
    return null;
  }

  /**
   * Kode stasiun dari kode atau nama. Nama kembar diputus dengan wilayah kejadian (sama wilayah → sama pulau);
   * bila tetap lebih dari satu kandidat, hasilnya kosong (tidak menebak).
   */
  function stationCode(v, idx, wil) {
    var k = key(v); if (!k) return '';
    if (idx.st[k]) return k;
    if (idx.stName[k]) return pickByRegion(idx.stName[k], idx, wil);
    return fuzzyStation(k, idx, wil);
  }
  function pickByRegion(L, idx, wil) {
    if (L.length === 1) return L[0];
    var w = region(wil); if (!w) return '';
    var same = L.filter(function (c) { return idx.st[c].region === w; }); if (same.length === 1) return same[0];
    var isl = /^Daop/.test(w) ? 'Daop' : /^Divre/.test(w) ? 'Divre' : '';
    var sameIsl = isl ? L.filter(function (c) { return String(idx.st[c].region).indexOf(isl) === 0; }) : [];
    return sameIsl.length === 1 ? sameIsl[0] : '';
  }
  /** Nama stasiun dengan salah ketik ringan ("BELIMBINGPENDOPO" → Blimbing Pendopo). Hanya bila kandidat terbaik tunggal. */
  function fuzzyStation(k, idx, wil) {
    if (k.length < 6 || /^\d/.test(k)) return '';
    idx._fz = idx._fz || {};
    if (idx._fz[k] === undefined) {
      var max = k.length >= 10 ? 2 : 1, best = '', bestD = 99, tie = false;
      Object.keys(idx.stName).forEach(function (n) {
        if (Math.abs(n.length - k.length) > max) return;
        var d = lev(n, k, max); if (d < bestD) { bestD = d; best = n; tie = false; } else if (d === bestD && n !== best) tie = true;
      });
      idx._fz[k] = bestD <= max && !tie ? best : '';
    }
    return idx._fz[k] ? pickByRegion(idx.stName[idx._fz[k]], idx, wil) : '';
  }
  function lev(a, b, cap) {
    var prev = [], cur, i, j;
    for (j = 0; j <= b.length; j++) prev[j] = j;
    for (i = 1; i <= a.length; i++) {
      cur = [i]; var rowMin = i;
      for (j = 1; j <= b.length; j++) { cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1)); if (cur[j] < rowMin) rowMin = cur[j]; }
      if (rowMin > cap) return cap + 1;
      prev = cur;
    }
    return prev[b.length];
  }

  /* ---------- Penurunan nilai dari judul/uraian (isian kosong) ----------
     Hanya pola yang tegas; bila tidak ada pola yang cocok, nilai tetap kosong (tidak menebak). */
  /** Kelas dari judul bila Kategori & Subgangguan kosong. */
  var TEXT_CLASS = [
    { kelas: 'alam', re: /banjir|longsor|gempa|pohon tumbang|tersambar petir|angin kencang|genangan|gogosan|amblas/i },
    { kelas: 'prasarana', re: /wesel|persinyalan|\bsinyal\b|track (merah|circuit)|rel (patah|spaten)|goyangan|jalan rel|\blaa\b|catenary|jembatan|axle counter|interlocking|kecrotan|bantalan/i },
    { kelas: 'sarana', re: /lokomotif|\blok\b|tenaga (lemah|hilang)|motoring|pembangkit|rem ikat|pengereman|kompresor|\bkrl\b.*gangguan|gangguan.*\b(krl|krd|kereta|gerbong)\b|roda (benjol|aus)|\bac\b/i }
  ];
  function classifyText(judul) {
    var s = txt(judul);
    for (var i = 0; i < TEXT_CLASS.length; i++) if (TEXT_CLASS[i].re.test(s)) return TEXT_CLASS[i].kelas;
    return '';
  }
  function kaFromText(s) {
    var m = /\b(?:KA|PLB|KLB)\s*\.?\s*([A-Z]?\d{1,5}[A-Z]{0,2})\b/i.exec(txt(s));
    return m && m[1] !== '0' ? m[1].toUpperCase() : '';
  }
  function timeFromText(s) {
    var t = txt(s), m = /waktu\s*:?\s*(?:jam\s*)?(\d{1,2})[.:](\d{2})/i.exec(t) || /\bjam\s*(\d{1,2})[.:](\d{2})/i.exec(t);
    return m && +m[1] < 24 && +m[2] < 60 ? { h: +m[1], m: +m[2] } : null;
  }
  function kmFromText(s) {
    var m = /\bkm\.?\s*(\d{1,3}\s*\+\s*\d{1,3}(?:\s*\/\s*\d{1,3})?)/i.exec(txt(s));
    return m ? m[1].replace(/\s+/g, '') : '';
  }
  function saranaFromText(s) {
    var t = txt(s), out = [], re = /\b(CC|BB)\s?(\d{3})\s?(\d{2})\s?(\d{2,3})\b/gi, m;
    while ((m = re.exec(t))) { var k = (m[1] + m[2] + m[3] + m[4]).toUpperCase(); if (out.indexOf(k) < 0) out.push(k); }
    return out;
  }
  function causeFromText(s) {
    var m = /penyebab\s*:\s*([^\n]{3,160})/i.exec(txt(s));
    return m ? m[1].replace(/^[-*\s]+/, '').trim() : '';
  }
  /** Lokasi dari uraian: "petak jalan Malang (Ml) - Malangkota lama (Mlk)" atau "Sta Kesamben (Ksb)". Hanya hasil yang cocok master. */
  function locationFromText(s, idx, wil) {
    var t = txt(s).replace(/\*/g, ' ');
    var NAME = '([A-Za-z][A-Za-z ]{1,28})\\s*(?:\\(([A-Za-z]{1,5})\\))?';
    // Nama bebas bisa diikuti kata lain ("Malangkota lama tertemper") → coba awalan kata terpanjang dulu.
    function st(name, code) {
      var c = code ? stationCode(code, idx, wil) : ''; if (c) return c;
      var w = txt(name).split(/\s+/).slice(0, 4);
      for (var n = w.length; n >= 1; n--) { c = stationCode(w.slice(0, n).join(' '), idx, wil); if (c) return c; }
      return '';
    }
    var pm = new RegExp('petak(?:\\s+jalan)?\\s+(?:sta\\.?\\s*)?' + NAME + '\\s*[-–]\\s*(?:sta\\.?\\s*)?' + NAME, 'i').exec(t);
    if (pm) {
      var a = st(pm[1], pm[2]), b = st(pm[3], pm[4]);
      if (a && b && a !== b) { var l = location(a + '-' + b, '', idx, wil); if (l.matched || l.type) return l; }
    }
    var sm = new RegExp('\\b(?:sta(?:siun)?\\.?|emplasemen(?:\\s+sta\\.?)?)\\s+' + NAME + '(?=[\\s,.;)]|$)', 'i').exec(t);
    if (sm) { var c = st(sm[1], sm[2]); if (c) return location('', c, idx, wil); }
    return null;
  }

  /** Lokasi: petak (A–B) bila ada, selain itu stasiun. */
  function location(petak, stasiun, idx, wil) {
    var p = txt(petak);
    if (p && p !== '-') {
      var parts = p.split(/\s*[-–—]\s*/).filter(Boolean);
      if (parts.length === 2) {
        var a = stationCode(parts[0], idx, wil), b = stationCode(parts[1], idx, wil);
        if (a && b) {
          var seg = idx.seg[[a, b].sort().join('-')] || null;
          return { type: 'petak', code: a + '-' + b, label: idx.st[a].name + ' – ' + idx.st[b].name,
            lintas: seg ? seg.lintas : '', matched: !!seg };
        }
        return { type: 'petak', code: p.toUpperCase(), label: title(parts[0]) + ' – ' + title(parts[1]), lintas: '', matched: false };
      }
    }
    var s = txt(stasiun);
    if (s && s !== '-') {
      var c = stationCode(s, idx, wil);
      if (c) return { type: 'stasiun', code: c, label: 'Sta. ' + String(idx.st[c].name).replace(/^(stasiun|sta\.?)\s+/i, ''), lintas: '', matched: true };
      // Isian bebas yang bukan nama stasiun (mis. "& Alat Pengamanan ...") tidak dijadikan lokasi.
      if (/^[A-Za-z][A-Za-z .'-]{1,23}$/.test(s)) return { type: 'stasiun', code: s.toUpperCase(), label: 'Sta. ' + title(s), lintas: '', matched: false };
      return { type: 'lain', code: '', label: '', lintas: '', matched: false };
    }
    return { type: '', code: '', label: '', lintas: '', matched: false };
  }

  /* ---------------- Pulau (Jawa / Sumatera) — audit 20 Nov 2026 ----------------
   * Tautan KA/sarana ke kejadian hanya sah bila pulaunya sama dengan pulau wilayah kejadian.
   * Acuan: wilayah (Daop = Jawa, Divre = Sumatera); nomor KA Sumatera dari SEED_PULAU (Buku Penomoran 2025/2026);
   * unit sarana: plant SAP (B… = Jawa, C… = Sumatera), dan mulai 1 Des 2026 Duksar 2026 untuk unit yang tercantum. */
  var PUL_ = null;
  function pulauIdx_() {
    if (PUL_) return PUL_;
    PUL_ = { ka: {}, ganda: {}, duk: {}, awalan: {}, berlaku26: '2026-12-01' };
    if (typeof SEED_PULAU !== 'undefined') {
      String(SEED_PULAU.ka || '').split(' ').forEach(function (k) { if (k) PUL_.ka[k] = 1; });
      String(SEED_PULAU.kaGanda || '').split(' ').forEach(function (k) { if (k) PUL_.ganda[k] = 1; });
      String(SEED_PULAU.duk26 || '').split(' ').forEach(function (k) { if (k) PUL_.duk[k] = 1; });
      PUL_.awalan = SEED_PULAU.awalan || {}; PUL_.berlaku26 = SEED_PULAU.berlaku26 || PUL_.berlaku26;
    }
    return PUL_;
  }
  function pulauWil(w) { var r = region(w); return /^Daop /.test(r) ? 'Jawa' : /^Divre /.test(r) ? 'Sumatera' : ''; }
  /** Pulau nomor KA (hanya bermakna untuk nomor yang dikenal LIST KA/Daftar Waktu). '' = tidak pasti (nomor dipakai dua pulau). */
  function pulauKa(no) {
    var k = key(no), P = pulauIdx_(); if (!k || P.ganda[k]) return '';
    if (P.ka[k]) return 'Sumatera';
    var m = /^(\d+)[A-Z]{1,2}$/.exec(k); if (m && P.ka[m[1]]) return 'Sumatera';
    return 'Jawa';
  }
  /** Nomor KA tanpa awalan pada kejadian Sumatera (mis. "KA 7" di Divre 3) → bentuk berawalan bila ada (S7). */
  function kaAwalan(no, wil) {
    var k = key(no), P = pulauIdx_(), a = P.awalan[region(wil)];
    return a && /^\d+[A-Z]?$/.test(k) && P.ka[a + k] ? a + k : '';
  }
  function pulauPlant(p) { var s = txt(p).toUpperCase(); return /^B\d/.test(s) ? 'Jawa' : /^C\d/.test(s) ? 'Sumatera' : ''; }
  /** Pulau unit pada tanggal (yyyy-mm-dd atau yyyy-mm): SAP sebelum 1 Des 2026; sesudahnya Duksar 2026 untuk unit Sumatera yang tercantum. */
  function pulauUnit(info, k, tgl) {
    var P = pulauIdx_(), sap = info ? info.pulau || '' : '';
    if (tgl && String(tgl) >= P.berlaku26 && P.duk[k]) return 'Sumatera';
    return sap;
  }

  return {
    pulauWil: pulauWil, pulauKa: pulauKa, kaAwalan: kaAwalan, pulauPlant: pulauPlant, pulauUnit: pulauUnit,
    txt: txt, key: key, title: title, parseDate: parseDate, parseTanggal: parseTanggal, signature: signature, number: number, region: region,
    classify: classify, crossing: crossing, temperOther: temperOther, component: component,
    assetKind: assetKind, saranaCandidates: saranaCandidates, saranaLabel: saranaLabel,
    trainNumber: trainNumber, buildIndex: buildIndex, location: location, stationCode: stationCode,
    classifyText: classifyText, kaFromText: kaFromText, timeFromText: timeFromText, kmFromText: kmFromText, saranaFromText: saranaFromText,
    causeFromText: causeFromText, locationFromText: locationFromText,
    parseTime: parseTime, parseKm: parseKm, jplNo: jplNo, trainLookup: trainLookup, kaTypeFrom: kaTypeFrom
  };
})();
