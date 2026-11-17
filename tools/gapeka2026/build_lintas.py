"""Definisi lintas Marey per judul lembar GAPEKA (2026; juga 2025 lewat masukan di folder kerja g25).
1) Kerangka: rantai matriks "Jarak Antar Stasiun" (Buku Penomoran) antara titik-titik di judul lembar (jarak resmi).
2) Pengisian: stasiun/halte yang tercetak di sumbu lembar di antara dua stasiun matriks disisipkan dengan jarak kolom
   "jarak stasiun ke stasiun" lembar, diskalakan agar total = jarak matriks (selisih dicatat).
3) Bila segmen tidak ada di matriks, dipakai jarak dari lembar (kolom jarak / selisih letak km)."""
import re, json, heapq, collections
def norm(s): return re.sub(r'[^a-z0-9]', '', s.lower())
REG = {'Divre I': 'Sumut', 'Divre II': 'Sumbar', 'Divre III': 'Sumsel', 'Divre IV': 'Sumsel'}
import os
M = [m for m in json.load(open('jarak_lintas.json')) if m['valid']]
# Opsional: hanya kode yang dilayani Daftar Waktu tahun itu yang boleh disisipkan dari sumbu lembar (mencegah halte tahun lain ikut tergambar).
KODE_ADA = set(json.load(open('kode_ada.json'))) if os.path.exists('kode_ada.json') else None
NK = {k: [tuple(x) for x in v] for k, v in json.load(open('nama_kode_multi.json')).items()}
code2name = {}
for k, v in NK.items():
    pass
for lab, ks in list(json.load(open('dw_jawa.json')).items()) + list(json.load(open('dw_sumatera.json')).items()):
    for k in ks:
        for r in k['rows']: code2name.setdefault(r['kode'], r['nama'])
for c, n in json.load(open('code2name.json')).items(): code2name.setdefault(c, n)
ALIAS = {'cirebonprujakan': 'CNP', 'surabayapasarturi': 'SBI', 'surabayagubeng': 'SGU', 'surabayakota': 'SB', 'yogyakartaintairport': 'YIA',
         'adisoemarmo': 'SMO', 'bandarasoekarnohatta': 'BST', 'bandarainternasionalminangkabau': 'BIM', 'prabumulihbarux6': 'PBR X6',
         'prabumulihbarux5': 'PBR X5', 'posindralaya': 'POS IDR', 'kilometertiga': 'KM3', 'rantauprapatbaru': 'RAPB', 'rantauprapat': 'RAP',
         'pondoks5': 'PS5', 'benteng': 'BET', 'segitigamesigit': 'STM', 'kalimas': 'KLM', 'jakartagudang': 'JAKG', 'jakartakota': 'JAKK',
         'anyerkidul': 'CGD', 'tanjungenimbaru': 'TMB', 'muaraenim': 'ME', 'tebingtinggi': 'TBI', 'bandartinggi': 'BDT', 'tanjungbalai': 'TNB',
         'kualatanjung': 'KTJ', 'bandarkalipah': 'BAP', 'pulauaie': 'PLA', 'lubukalung': 'LA', 'lubuklinggau': 'LLG', 'indralaya': 'IDR',
         'panjang': 'PJN', 'tarahan': 'THN', 'muarasatu': 'MSU', 'kutablang': 'KBL', 'sawahlunto': 'SWL', 'gambringan': 'GBN', 'brumbung': 'BBG',
         'karangtalun': 'KRL', 'gumilir': 'GM', 'purworejo': 'PWR', 'kertapati': 'KPT', 'siantar': 'SIR', 'besitang': 'BSG', 'belawan': 'BLW',
         'gresik': 'GS', 'panarukan': 'PN', 'ketapang': 'KTG', 'larangan': 'LR'}
# Kode yang berganti antar-GAPEKA (mis. Benteng: SBE di 2025, BET di 2026) -> alias_tambahan.json di folder kerja.
if os.path.exists('alias_tambahan.json'): ALIAS.update(json.load(open('alias_tambahan.json')))
G = collections.defaultdict(dict)
for m in M:
    for a in range(len(m['kode']) - 1):
        x, y, d = m['kode'][a], m['kode'][a + 1], round(m['km'][a + 1] - m['km'][a], 3)
        if y not in G[x] or G[x][y] > d: G[x][y] = d; G[y][x] = d
# segmen lembar I-3 (kolom letak km, lapisan teks): THB 0,000 · KAT 2,029 · SUDB 2,500 · SUD 2,840 · MRI 6,026
for a, b, d in [('THB', 'KAT', 2.029), ('KAT', 'SUDB', 0.471), ('SUDB', 'SUD', 0.340), ('SUD', 'MRI', 3.186)]:
    G[a].setdefault(b, d); G[b].setdefault(a, d)
def path(a, b):
    dist, prev, pq = {a: 0}, {}, [(0, a)]
    while pq:
        d, u = heapq.heappop(pq)
        if u == b: break
        if d > dist[u]: continue
        for v, w in G[u].items():
            if d + w < dist.get(v, 1e18): dist[v] = d + w; prev[v] = u; heapq.heappush(pq, (d + w, v))
    if b not in dist: return None, None
    p = [b]
    while p[-1] != a: p.append(prev[p[-1]])
    return p[::-1], dist[b]
# ---- sumbu lembar (teks) dengan kode yang diselesaikan per wilayah & ketetanggaan
AXR = json.load(open('lembar_axis2.json'))
def resolve_axis(rows, reg):
    out = []
    for r in rows:
        n = norm(r['nama'])
        cands = [c for w, c in NK.get(n, []) if (w == reg or (reg == 'Jawa' and w == 'Jawa'))] or [c for w, c in NK.get(n, [])]
        cands = list(dict.fromkeys(cands)) or [r['kode']]
        out.append(dict(r, cands=cands))
    for i, r in enumerate(out):
        if len(r['cands']) == 1: r['kode'] = r['cands'][0]; continue
        nb = [out[j]['cands'] for j in (i - 1, i + 1) if 0 <= j < len(out)]
        pick = [c for c in r['cands'] if any(c in G and any(x in G[c] for x in cs) for cs in nb)]
        r['kode'] = (pick or r['cands'])[0]
    return out
def run_between(rows, a, b, dref):
    best = None
    for i, r in enumerate(rows):
        if r['kode'] != a: continue
        for j, q in enumerate(rows):
            if q['kode'] != b or i == j: continue
            run = rows[i:j + 1] if i < j else rows[j:i + 1][::-1]
            codes = [x['kode'] for x in run]
            if len(set(codes)) != len(codes): continue
            ds = seg_d(run)
            if None in ds: continue
            tot = sum(ds)
            if dref and abs(tot - dref) > max(0.6, 0.03 * dref): continue
            key = (0 if i < j else 1, len(run))
            if best is None or key < best[2]: best = (run, ds, key)
    return best[:2] if best else None
def seg_d(run):
    ds = []
    for k in range(len(run) - 1):
        lo = run[k] if run[k]['y'] < run[k + 1]['y'] else run[k + 1]
        if lo.get('jarak_ke_berikut'): ds.append(float(lo['jarak_ke_berikut'])); continue
        try: ds.append(round(abs(float(run[k + 1]['letak']) - float(run[k]['letak'])), 3))
        except ValueError: ds.append(None)
    return ds
L = json.load(open('lembar_judul.json'))
out, masalah, selisih = [], [], []
for sh in L:
    reg = REG.get(sh['lembar'], 'Jawa')
    rows = resolve_axis(AXR.get(sh.get('berkas_sumbu', sh['berkas'])[:-4]) or [], reg)
    if KODE_ADA is not None: rows = [r for r in rows if r['kode'] in KODE_ADA]
    for t in sh['lintas']:
        pts = [s.strip() for s in t.split(' - ')]
        codes = []
        for p in pts:
            n = norm(p); c = ALIAS.get(n)
            if not c and re.fullmatch(r'[A-Z][A-Z0-9]{0,5}', p) and p in G: c = p   # judul ditulis dengan kode stasiun (lembar 2025)
            if not c:
                cs = [c for w, c in NK.get(n, []) if w == reg] or [c for w, c in NK.get(n, [])]
                c = cs[0] if cs else None
            codes.append(c)
        if None in codes:
            masalah.append((sh['lembar'], t, 'nama tak terpetakan: ' + ', '.join(p for p, c in zip(pts, codes) if c is None))); continue
        seq, km, src, ok = [codes[0]], [0.0], collections.Counter(), True
        def add(code, d, how):
            seq.append(code); km.append(round(km[-1] + d, 3)); src[how] += 1
        for a, b in zip(codes, codes[1:]):
            p, dp = path(a, b)
            # jalur matriks yang memutar jauh (mis. segmen tak tercantum) -> pakai sumbu lembar
            rb = run_between(rows, a, b, None) if rows else None
            if p and (not rb or dp <= 1.5 * sum(rb[1])):
                for x, y in zip(p, p[1:]):
                    ins = run_between(rows, x, y, G[x][y]) if rows else None
                    if ins and len(ins[0]) > 2:
                        tot = sum(ins[1]); f = G[x][y] / tot
                        if abs(tot - G[x][y]) > 0.002: selisih.append((sh['lembar'], x, y, round(tot, 3), G[x][y]))
                        for q, d in zip(ins[0][1:], ins[1]): add(q['kode'], d * f, 'matriks+sisipan lembar')
                        for q in ins[0]: code2name.setdefault(q['kode'], q['nama'])
                    else: add(y, G[x][y], 'matriks')
            elif rb:
                for q, d in zip(rb[0][1:], rb[1]): add(q['kode'], d, 'lembar')
                for q in rb[0]: code2name.setdefault(q['kode'], q['nama'])
            else:
                masalah.append((sh['lembar'], t, 'tidak ada jalur %s-%s' % (a, b))); ok = False; break
        if not ok: continue
        if len(set(seq)) != len(seq): masalah.append((sh['lembar'], t, 'stasiun berulang: ' + ' '.join(seq))); continue
        out.append(dict(id='%s|%s' % (sh['lembar'], t), lembar=sh['lembar'], wilayah=sh['wilayah'], judul=t, berkas=sh['berkas'], halaman=sh['halaman'], judul_sumber=sh.get('judul_sumber', ''),
                        sumber_jarak=dict(src), stasiun=[dict(kode=c, nama=code2name.get(c, ''), km=k) for c, k in zip(seq, km)]))
json.dump(out, open('marey_lintas.json', 'w'), ensure_ascii=False)
print('lintas terbentuk:', len(out), '| masalah:', len(masalah), '| selisih total lembar vs matriks:', len(selisih))
for m in masalah: print('  M', m)
for s in selisih[:12]: print('  S', s)
for o in out: print(o['lembar'], '|', o['judul'][:50], '|', len(o['stasiun']), 'st', o['stasiun'][-1]['km'], 'km', o['sumber_jarak'], ' '.join(s['kode'] for s in o['stasiun'])[:90])
