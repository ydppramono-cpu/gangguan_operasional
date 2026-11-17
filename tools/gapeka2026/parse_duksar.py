"""Buku Dukungan Sarana (Duksar) GAPEKA 2026: rekap per jenis sarana & rekap ketersediaan lokomotif per dipo.
Nama dan NIPP pejabat penandatangan sengaja TIDAK diekstrak."""
import re, json
books = [('txt/duk_1.txt', 'Jawa'), ('txt/duk_2.txt', 'Sumatera Utara'), ('txt/duk_3.txt', 'Sumatera Barat'), ('txt/duk_4.txt', 'Sumatera Selatan')]
rekap, lok = [], []
for f, w in books:
    L = open(f, encoding='utf-8', errors='replace').read().replace('\f', '\n').split('\n')
    i0 = next(i for i, s in enumerate(L) if 'REKAP DUKUNGAN PENDINASAN SARANA' in s)
    for s in L[i0:i0 + 25]:
        m = re.match(r'^\s*(\d)\s+(LOKOMOTIF|KRD|KRDE|KRL|KERETA|GERBONG|[A-Z][A-Z ]+?)\s{2,}(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s*$', s)
        if m: rekap.append(dict(wilayah=w, jenis_sarana=m.group(2).strip(), siap_guna=int(m.group(3)), siap_operasi=int(m.group(4)), stamformasi=int(m.group(5)), cadangan=int(m.group(6))))
    i1 = next(i for i, s in enumerate(L) if 'REKAP KETERSEDIAAN LOKOMOTIF' in s)
    hdrline = next(s for s in L[i1:i1 + 6] if 'TSGO' in s)
    sec = []
    for s in L[i1 + 2:i1 + 80]:
        if re.search(r'JUMLAH|TOTAL', s): break
        sec.append(s)
    ROWX = re.compile(r'^\s*([A-Z]{2,4})?\s*(\d)?\s+((?:CC|BB|D)\s?\d{3}[A-Z]?)\s+(\d+)\s*(.*)$')
    starts = [k for k, s in enumerate(sec) if ROWX.match(s) and ROWX.match(s).group(2) == '1']
    for gi, st in enumerate(starts):
        en = starts[gi + 1] if gi + 1 < len(starts) else len(sec)
        lo = st - 1 if st > 0 and re.match(r'^\s*([A-Z]{2,4})\s*$', sec[st - 1]) and (gi == 0 or st - 1 >= starts[gi - 1] + 1) else st
        span = sec[lo:en]
        d = ''
        for s in span:
            m = ROWX.match(s); md = re.match(r'^\s*([A-Z]{2,4})\s*$', s)
            if m and m.group(1): d = m.group(1); break
            if md: d = md.group(1); break
        for s in sec[st:en]:
            m = ROWX.match(s)
            if m: lok.append(dict(hdr=hdrline, wilayah=w, dipo=d, jenis=m.group(3), siap_guna=int(m.group(4)), rest=[int(x) for x in m.group(5).split()], line=s))
# TSGO/TSO/SO: posisi kolom berbeda-beda; simpan angka sisa apa adanya, dan cek SO = siap_guna - TSGO - TSO bila 3 angka
out = []
for x in lok:
    r = x['rest']
    rec = dict(wilayah=x['wilayah'], dipo=x['dipo'], jenis=x['jenis'], siap_guna=x['siap_guna'], tsgo=None, tso=None, so=None, catatan='')
    if len(r) == 3 and r[0] + r[1] + r[2] == x['siap_guna']: rec.update(tsgo=r[0], tso=r[1], so=r[2])
    elif len(r) == 1 and r[0] == x['siap_guna']: rec.update(tsgo=0, tso=0, so=r[0])
    elif len(r) == 2:
        # salah satu TSGO/TSO kosong: tentukan dari posisi kolom pada teks
        rec.update(so=r[1]); rec['catatan'] = 'TSGO/TSO dari posisi kolom'
        pos = [m.end() for m in re.finditer(r'\d+', x['line'])][-2]
        h = x['hdr']; p_tsgo, p_tso = h.index('TSGO') + 4, h.index('TSO ', h.index('TSGO') + 4) + 3
        v = x['siap_guna'] - r[1]
        if v != r[0]: rec['catatan'] = 'periksa: jumlah tidak cocok'
        elif abs(pos - p_tsgo) < abs(pos - p_tso): rec.update(tsgo=v, tso=0)
        else: rec.update(tsgo=0, tso=v)
    else: rec['catatan'] = 'periksa: ' + ' '.join(map(str, r))
    out.append(rec)
for o in out: o.pop('_pos', None)
json.dump(dict(rekap=rekap, lok=out), open('duksar_2026.json', 'w'), ensure_ascii=False, indent=0)
for r in rekap: print(r)
import collections
for w in [b[1] for b in books]:
    xs = [o for o in out if o['wilayah'] == w]
    print(w, 'baris lok:', len(xs), 'siap guna:', sum(o['siap_guna'] for o in xs), 'SO:', sum(o['so'] or 0 for o in xs), 'periksa:', [o for o in xs if o['catatan'].startswith('periksa')][:3])
    print('   ', [(o['dipo'], o['jenis'], o['siap_guna'], o['tsgo'], o['tso'], o['so']) for o in xs][:30])
