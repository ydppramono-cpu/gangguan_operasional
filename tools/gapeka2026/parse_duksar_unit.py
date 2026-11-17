"""Nomor unit sarana siap guna dari Buku Duksar GAPEKA 2026: lokomotif, KRD, kereta, gerbong.
Validasi berlapis: jumlah per baris/kelompok (kolom JUML/SG/JUMLAH di buku), total per dipo/depo, total rekap wilayah.
Nama & NIPP pejabat tidak diekstrak."""
import re, json, collections
BOOKS = [('txt/duk_1.txt', 'Jawa'), ('txt/duk_2.txt', 'Sumatera Utara'), ('txt/duk_3.txt', 'Sumatera Barat'), ('txt/duk_4.txt', 'Sumatera Selatan')]
D26 = json.load(open('duksar_2026.json'))
REKAP = {(r['wilayah'], r['jenis_sarana']): r['siap_guna'] for r in D26['rekap']}
LOKDIPO = collections.defaultdict(int)
for r in D26['lok']: LOKDIPO[(r['wilayah'], r['dipo'], r['jenis'].replace(' ', ''))] += r['siap_guna']
units, issues, checks = [], [], []
NOTES = {}

def partition(items):
    """Bagi baris-baris nomor menjadi kelompok berurutan: tiap kelompok memuat tepat satu baris label (exp != None)
    dan jumlah nomornya = exp. Mengembalikan [(anchor, [(seri, item)])] atau None bila tidak ada solusi unik."""
    idx = [i for i, it in enumerate(items) if it['series'] or it.get('exp') is not None]
    its = [items[i] for i in idx]
    anchors = [i for i, it in enumerate(its) if it.get('exp') is not None]
    n, sols = len(its), []
    def rec(j, a, acc):
        if len(sols) > 1: return
        if j == len(anchors):
            if all(not it['series'] for it in its[a:]): sols.append(list(acc))
            return
        r = anchors[j]
        if a > r: return
        nxt = anchors[j + 1] if j + 1 < len(anchors) else n
        tot = sum(len(it['series']) for it in its[a:r])
        if tot > its[r]['exp']: return
        b, t = r, tot
        while b < nxt:
            t += len(its[b]['series'])
            if t == its[r]['exp']:
                acc.append((a, b)); rec(j + 1, b + 1, acc); acc.pop()
            if t > its[r]['exp']: break
            b += 1
    rec(0, 0, [])
    if len(sols) != 1: return None, len(sols)
    out = []
    for (a, b), r in zip(sols[0], anchors):
        out.append((its[r], [(x, it) for it in its[a:b + 1] for x in it['series']]))
    return out, 1

def assign(items):
    """Baris bernomor tanpa jumlah (exp=None) dititipkan ke anchor: ambil dari atas (tertunda) lalu dari bawah."""
    out, pending, i = [], [], 0
    while i < len(items):
        it = items[i]
        if it.get('exp') is None:
            if it['series']: pending.append(it)
            i += 1; continue
        got = [(x, it) for x in it['series']]
        need = it['exp'] - len(got)
        while pending and need > 0 and len(pending[-1]['series']) <= need:
            p = pending.pop(); got = [(x, p) for x in p['series']] + got; need -= len(p['series'])
        j = i + 1
        while need > 0 and j < len(items) and items[j].get('exp') is None:
            if items[j]['series']:
                got += [(x, items[j]) for x in items[j]['series']]; need -= len(items[j]['series']); items[j]['series'] = []
            j += 1
        out.append((it, got)); i += 1
        if pending: issues.append(('?', 'sisa baris tertunda sebelum anchor', it.get('line'))); pending = []
    return out, pending

def lok(L, W):
    tot = 0
    ROWL = re.compile(r'^\s*([A-Z]{2,4})?\s*(\d{1,2})\s+((?:CC|BB|D)\s?\d{3}[A-Z]?)\s(.*)$')
    for a in [i for i, s in enumerate(L) if re.search(r'LOK(OMOTIF)? SIAP GUNA DI', s)]:
        b = next(i for i in range(a, len(L)) if re.search(r'TOTAL LOK', L[i]))
        hdr = next((s for s in L[a:a + 4] if 'JUML' in s), '')
        jcol = hdr.find('JUML') if hdr else 10 ** 6
        items = []
        for k in range(a + 3, b):
            s = L[k]
            if re.match(r'^\s*([A-Z]{2,4})\s*$', s): items.append(dict(series=[], exp=None, dipo_only=s.strip(), line=k + 1)); continue
            m = ROWL.match(s)
            md = re.match(r'^\s*([A-Z]{2,4})(\s+[\d\s]+)$', s)
            if md and not m:
                items.append(dict(series=[], exp=None, dipo_only=md.group(1), line=k + 1)); s = ' ' * md.start(2) + md.group(2)
            toks = []
            for t in re.finditer(r'\d+', s):   # token 4 digit = dua bagian yang tercetak rapat (mis. 2604 -> 26 04)
                toks += [(t.start(), t.group()[:2]), (t.start() + 2, t.group()[2:])] if len(t.group()) == 4 and t.start() < jcol - 4 else [(t.start(), t.group())]
            if m:
                nums = [(p, t) for p, t in toks if p >= m.start(4)]
                juml = [t for p, t in nums if p >= jcol - 4]
                nums = [t for p, t in nums if p < jcol - 4]
                if len(nums) % 2 and not juml: juml = [nums.pop()]
                jen = re.sub(r'^(CC|BB|D)\s?', r'\1 ', m.group(3))
                items.append(dict(series=['%s %s' % (nums[x], nums[x + 1]) for x in range(0, len(nums) - 1, 2)], exp=int(juml[0]) if juml else None,
                                  no=int(m.group(2)), jenis=jen, dipo=m.group(1) or '', line=k + 1))
            elif toks and re.match(r'^[\s\d]+$', s):
                nums = [t for p, t in toks if p < jcol - 4]
                if [int(t) for t in nums[:5]] == list(range(1, min(5, len(nums)) + 1)): continue   # baris nomor kolom
                if len(nums) % 2: issues.append((W, 'lok', 'baris lanjutan ganjil', k + 1))
                items.append(dict(series=['%s %s' % (nums[x], nums[x + 1]) for x in range(0, len(nums) - 1, 2)], exp=None, line=k + 1))
        # kelompok dipo = baris bernomor 1..n; label dipo bisa di baris sendiri di atas/tengah kelompok
        g = -1
        for it in items:
            if 'jenis' in it and it['no'] == 1: g += 1
            it['g'] = max(g, 0)
        dipo_of = {}
        for idx, it in enumerate(items):
            d = it.get('dipo') or it.get('dipo_only')
            if not d: continue
            gg = it['g']
            if it.get('dipo_only'):
                nxt = next((x for x in items[idx + 1:] if 'jenis' in x), None)
                prv = next((x for x in reversed(items[:idx]) if 'jenis' in x), None)
                if nxt and nxt['no'] == 1 and (prv is None or prv['g'] != nxt['g']) and (prv is None or prv['g'] in dipo_of): gg = nxt['g']
            dipo_of.setdefault(gg, d)
        for it in items:
            if 'jenis' in it:
                it['dipo'] = dipo_of.get(it['g'], '')
                if it['exp'] is None: it['exp'] = LOKDIPO.get((W, it['dipo'], it['jenis'].replace(' ', '')))
        res, _ = assign(items)
        for anc, got in res:
            exp_tab = LOKDIPO.get((W, anc['dipo'], anc['jenis'].replace(' ', '')))
            if len(got) != anc['exp'] or (exp_tab is not None and exp_tab < len(got)):
                issues.append((W, 'lok', '%s %s: %d nomor; buku %s; rekap dipo %s' % (anc['dipo'], anc['jenis'], len(got), anc['exp'], exp_tab)))
            for x, _src in got:
                units.append(dict(wilayah=W, sarana='Lokomotif', dipo=anc['dipo'], jenis=anc['jenis'], kelas='', seri=x, nomor='%s %s' % (anc['jenis'], x), kelompok='', pembangkit='', halaman_baris=anc['line']))
            tot += len(got)
    checks.append((W, 'Lokomotif', tot, REKAP.get((W, 'LOKOMOTIF'))))

SER_KRD = re.compile(r'(?<!\d)(\d) (\d{2}) (\d{2})(?!\d)')
def krd(L, W):
    starts = [i for i, s in enumerate(L) if 'DUKUNGAN KRD' in s]
    tot = 0
    for a in starts:
        b = next(i for i in range(a, len(L)) if re.search(r'JUMLAH KRD DI|JUMLAH DIVRE', L[i]))
        sub = next(s for s in L[a:a + 6] if re.search(r'\bJML\b', s))
        sgc = re.search(r'\bJML\b', sub).start() + 3          # kolom SG-JML
        kh = next((s for s in L[a:a + 6] if 'KETERANGAN' in s), '')
        kc = kh.find('KETERANGAN') - 14 if kh else 10 ** 6
        rows = []
        for k in range(a + 4, b + 1):
            s = L[k]
            if not s.strip(): continue
            left = s[:sgc - 7]
            ser = ['%s %s %s' % m.groups() for m in SER_KRD.finditer(left)]
            cnt = [int(x) for x in re.findall(r'\d+', s[sgc - 7:sgc + 14])]
            lab = SER_KRD.sub(' ', left)
            dipo = re.match(r'^\s{0,6}([A-Z]{2,8})\b', lab)
            jen = re.search(r'\b(KD[EI]?(?:-RB)?(?: ?\d)?(?: AC)?)(?![\w-])', lab[6:42])
            kel = re.search(r'\b(K[123])\b', lab[25:45])
            ket = re.sub(r'^[\d\s]+(?=[A-Za-z])', '', s[kc:].strip()) if len(s) > kc else ''
            if ket and not re.search(r'[A-Za-z]{3}', ket): ket = ''
            rows.append(dict(k=k, series=ser, sg=cnt[0] if (cnt and 'JUMLAH' not in s) else None, ts=cnt[1] if len(cnt) > 1 else None,
                             dipo=dipo.group(1) if dipo and dipo.group(1) not in ('JUMLAH',) else '', jenis=jen.group(1).strip() if jen else '', kelas=kel.group(1) if kel else '',
                             ket=re.sub(r'\s+', ' ', ket), jumlah='JUMLAH' in s))
        items = [dict(series=r['series'], exp=r['sg'], line=r['k'] + 1, row=r) for r in rows if not r['jumlah']]
        res, _ = assign(items)
        for anc, got in res:
            ks = [g[1]['line'] for g in got] + [anc['line']]
            lo, hi = min(ks) - 1, max(ks) + 1
            near = lambda f: min(([r for r in rows if r[f] and not r['jumlah']]), key=lambda r: (0 if lo <= r['k'] + 1 <= hi else 1, abs(r['k'] + 1 - anc['line'])))[f] if any(r[f] for r in rows) else ''
            ra = anc['row']
            dipo = ra['dipo'] or near('dipo'); jen = ra['jenis'] or near('jenis')
            kets = [r['ket'] for r in rows if r['ket'] and lo - 1 <= r['k'] + 1 <= hi + 1]
            ket = ra['ket'] or (kets[0] if kets else '')
            if dipo == 'RAILINK': dipo = 'MDN'   # label pemilik (PT Railink) di atas label dipo MDN
            if len(got) != anc['exp']: issues.append((W, 'krd', 'baris %d: %d nomor vs SG %s' % (anc['line'], len(got), anc['exp'])))
            grp = 'KRD %s · Dipo %s · %d unit / %s TS%s' % (jen, dipo, anc['exp'], ra['ts'], (' · ' + ket) if ket else '')
            for x, src in got:
                kel = src['row']['kelas'] or ra['kelas']
                if not kel:
                    cand = [r for r in rows if r['kelas'] and lo <= r['k'] + 1 <= hi]
                    kel = min(cand, key=lambda r: abs(r['k'] + 1 - src['line']))['kelas'] if cand else ''
                units.append(dict(wilayah=W, sarana='KRD', dipo=dipo, jenis=jen, kelas=kel, seri=x, nomor=('%s %s' % (kel, x)).strip(), kelompok=grp, pembangkit='', halaman_baris=src['line']))
            tot += len(got)
    # keterangan yang tercetak di tengah dua baris jenis yang sama berlaku untuk keduanya
    ku = [u for u in units if u['sarana'] == 'KRD' and u['wilayah'] == W]
    for u in ku:
        if ' · ' in u['kelompok'] and u['kelompok'].count(' · ') == 2:
            mate = [v for v in ku if v['dipo'] == u['dipo'] and v['jenis'] == u['jenis'] and v['kelompok'].count(' · ') == 3 and abs(v['halaman_baris'] - u['halaman_baris']) <= 6]
            if mate: u['kelompok'] += ' · ' + mate[0]['kelompok'].split(' · ')[-1]
    checks.append((W, 'KRD', tot, REKAP.get((W, 'KRD'), 0)))

SER_K = re.compile(r'(?<![\d-])(\d) (\d{2}) ?(\d{2,3})(?![\d-])')
PEMBANGKIT = re.compile(r'^(P|BP|MP\d*|KMP\d*)\b')
def kereta(L, W):
    tot, depo = 0, ''
    k0 = [i for i, s in enumerate(L) if re.search(r'KERETA SIAP GUNA .*GAPEKA', s)]
    k1 = next((i for i in range(k0[-1], len(L)) if re.search(r'KERETA SIAP GUNA \w+\s*$|KETERSEDIAAN|PERAWATAN KERETA', L[i])), len(L)) if k0 else 0
    heads = [i for i in range(k0[0], k1) if re.search(r'D[EI]PO INDUK\s+\S', L[i])] if k0 else []
    for h in heads:
        depo = re.sub(r'\s+', ' ', re.search(r'D[EI]PO INDUK\s+(.+?)\s*$', L[h]).group(1))
        nh = next((x for x in heads if x > h), k1)
        end = next((i for i in range(h + 3, nh) if re.search(r'^\s*JUMLAH\b', L[i])), nh)
        sgl = next((s for s in L[h:h + 12] if re.search(r'\bSG\b', s)), None)
        if sgl is None: continue   # bukan tabel nomor seri (mis. tabel stamformasi)
        sgc = re.search(r'\bSG\b', sgl).start()
        start = next(i for i in range(h, h + 12) if re.match(r'^\s*(KERETA\s+)?1\s+2\s+3\b', L[i])) + 1
        lines = []
        for k in range(start, end):
            t = L[k]
            if not t.strip(): continue
            body = t[:sgc - 2]
            if re.search(r'(?<![\d-])00 \d{2} \d{2}', body):
                issues.append((W, 'kereta', 'salah ketik "00 .." di buku dibaca "0 .."', depo, k + 1)); body = re.sub(r'(?<![\d-])00 (?=\d{2} \d{2})', ' 0 ', body)
            ser = ['%s %s %s' % m.groups() for m in SER_K.finditer(body)]
            ts = re.findall(r'\bTS\.\d+\b', body)   # sel bertulisan "TS.nn": unit milik trainset, nomor seri tidak dicantumkan
            ser += ts
            first = SER_K.search(body)
            lab = body[:first.start()] if first else body
            lab = re.sub(r'\bTS\.\d+\b', ' ', lab)
            mrow = re.match(r'^\s*(\d{1,2})\s+(.*)$', lab)
            sg = [int(x) for x in re.findall(r'\d+', t[sgc - 2:sgc + 5])]
            frag = (mrow.group(2) if mrow else lab).strip()
            # baris jangkar = baris yang punya angka SG (nomor urut kadang tercetak di baris lain)
            lines.append(dict(k=k, series=ser, rowno=int(mrow.group(1)) if mrow else None, frag=frag, sg=sg[0] if sg and (mrow or frag) else None))
        for x in lines:
            if x['sg'] is None: x['rowno'] = None
            elif x['rowno'] is None: x['rowno'] = -1
        rows = [x for x in lines if x['rowno'] is not None]
        for x in lines:   # pecahan label jenis -> baris bernomor terdekat
            if x['rowno'] is None and x['frag'] and not x['series'] or (x['rowno'] is None and x['frag']):
                if rows:
                    near = min(rows, key=lambda r: (abs(r['k'] - x['k']), 0 if r['k'] > x['k'] else 1))
                    near.setdefault('frags', []).append((x['k'], x['frag']))
        for r in rows:
            parts = sorted(r.get('frags', []) + [(r['k'], r['frag'])])
            r['jenis'] = re.sub(r'\s+', ' ', ' '.join(p for _, p in parts if p)).strip()
        items = [dict(series=x['series'], exp=x['sg'] if x['rowno'] is not None else None, line=x['k'] + 1, row=x) for x in lines]
        res, nsol = partition([dict(it, series=list(it['series'])) for it in items])
        if res is None:
            issues.append((W, 'kereta', '%s (baris %d): partisi %s solusi, pakai pembagian terdekat' % (depo, h + 1, nsol)))
            res, _ = assign(items)
        for anc, got in res:
            r = anc['row']
            if len(got) != anc['exp']: issues.append((W, 'kereta', '%s baris %d %s: %d nomor vs SG %s' % (depo, anc['line'], r['jenis'], len(got), anc['exp'])))
            kode = r['jenis'].split(' ')[0] if r['jenis'] else ''
            pb = 'Ya' if PEMBANGKIT.match(r['jenis']) else ''
            for x, src in got:
                units.append(dict(wilayah=W, sarana='Kereta', dipo=depo, jenis=r['jenis'], kelas=kode, seri=x, nomor='%s %s' % (kode, x), kelompok='', pembangkit=pb, halaman_baris=src['line']))
            tot += len(got)
    checks.append((W, 'Kereta', tot, REKAP.get((W, 'KERETA'))))

SER_G = re.compile(r'(?<![\d-])(\d{2}) (\d{2}) ?(\d{2,3})(?![\d,-])')
def gerbong(L, W):
    starts = [i for i, s in enumerate(L) if 'NOMOR GERBONG' in s]
    if not starts: checks.append((W, 'Gerbong', 0, REKAP.get((W, 'GERBONG')))); return
    b0 = max(0, starts[0] - 6)
    while b0 < starts[0] and not re.search(r'GERBONG SIAP GUNA|D[EI]PO INDUK|SUMATERA', L[b0]): b0 += 1
    end = next((i for i in range(starts[-1], len(L)) if re.search(r'TOTAL GERBONG|GERBONG SIAP GUNA\s*$|^\s*REKAP|KETERSEDIAAN', L[i])), len(L))
    st = dict(depo='', region='', blk=[], tot=0, kls='')
    def flush(jtxt, jval):
        blk = st['blk']; ser_lines = [x for x in blk if x['series']]
        st['blk'] = []
        if not ser_lines: return
        txt = re.sub(r'\s+', ' ', ' '.join(x['lab'] for x in blk if x['lab'].strip())).strip()
        mk = re.search(r'\bBM\s*\d+\s*T(?:ON)?\b', txt) or re.search(r'(?<![\w-])\d{2}\s*T(?!\w)(?!.*\bTON\b.*\d{2}\s*T(?!\w))', txt)
        if mk and not mk.group(0).startswith('BM') and re.search(r'\b' + re.escape(mk.group(0)) + r'\b', re.sub(r'G[A-Z-]+\s*\w*\s*\d+\s*TON', '', txt)) is None: mk = None
        kls = (('BM ' if not mk.group(0).startswith('BM') else '') + re.sub(r'\s+', ' ', mk.group(0))) if mk else ''
        jen = (txt[:mk.start()] + ' ' + txt[mk.end():]) if mk else txt
        jen = re.sub(r'\s+', ' ', re.sub(r'(^|\s)\d+(?=\s|$)(?!\s*T(?:ON)?\b)', ' ', jen)).strip()
        jen = re.sub(r'\b(G[A-Z])\s*-\s*', r'\1-', jen)
        if not jen: jen = re.sub(r'\s+\d[\d.]*\s*$', '', re.sub(r'^JU?J?MLAH\s*(TOTAL\s*)?', '', jtxt)).strip()
        st['kls'] = kls
        n = sum(len(x['series']) for x in ser_lines)
        if jval is not None and jval != n: issues.append((W, 'gerbong', '%s %s: %d nomor vs JUMLAH %s' % (st['depo'], jen, n, jval)))
        for x in ser_lines:
            for y in x['series']:
                gk = re.match(r'^\s*(G[A-Z]{1,2})\b', jen)
                units.append(dict(wilayah=W, sarana='Gerbong', dipo=st['depo'] or st['region'], jenis=jen, kelas=kls, seri=y, nomor=((gk.group(1) + ' ') if gk else '') + y, kelompok='', pembangkit='', halaman_baris=x['k'] + 1))
        st['tot'] += n
    for k in range(b0, end):
        t = L[k]
        m = re.search(r'D[EI]PO INDUK\s+(.+?)\s*$', t)
        if m: st['depo'] = re.sub(r'\s+\d+$', '', re.sub(r'\s+', ' ', m.group(1))); continue
        if re.search(r'CATATAN|^\s*~', t): continue
        m = re.search(r'^\s*(SUMATERA [A-Z]+.*\)|DAOP \d+ [A-Z]+)\s*$', t)
        if m: st['region'] = m.group(1).strip(); continue
        if re.search(r'GERBONG SIAP GUNA|NOMOR GERBONG|BERLAKU|^\s*1\s+2\s+3\b', t): continue
        if 'KLASIFIKASI' in t and not ('JUMLAH' in t and 'BERAT' in t): continue
        if 'JUMLAH' in t and 'BERAT' in t: st['jc'], st['bc'] = t.index('JUMLAH') + 6, t.index('BERAT') + 5; continue
        only_num = re.match(r'^\s{100,}(\d[\d.]*)\s*$', t)
        if only_num and st.get('bc') and abs(only_num.end(1) - st['bc']) < abs(only_num.end(1) - st['jc']): only_num = None   # angka kolom BERAT
        if only_num is None and re.match(r'^\s{100,}[\d.,]+\s*$', t): continue
        if re.search(r'\bJUJ?MLAH\b', t) or only_num:
            v = [int(x.group().replace('.', '')) for x in re.finditer(r'\d[\d.]*', t) if x.start() >= 120]
            flush(t.strip(), v[0] if v else None); continue
        if re.search(r'(?<![\d-])\d{4} \d{2,3}(?!\d)', t):
            issues.append((W, 'gerbong', 'nomor tercetak rapat dipisah (mis. 3084 74 -> 30 84 74)', k + 1))
            t = re.sub(r'(?<![\d-])(\d{2})(\d{2}) (\d{2,3})(?!\d)', r'\1 \2 \3', t)
        # salah spasi di buku: "54 221 18" -> 54 22 118 (urutan digit sama). Selain itu dicatat apa adanya + tanda periksa
        def respace(m):
            issues.append((W, 'gerbong', 'spasi nomor dibetulkan %s -> %s %s %s%s' % (m.group(0), m.group(1), m.group(2)[:2], m.group(2)[2], m.group(3)), k + 1))
            new = '%s %s %s%s' % (m.group(1), m.group(2)[:2], m.group(2)[2], m.group(3))
            NOTES[(W, k + 1, new)] = 'tercetak "%s" (spasi bergeser) — dibaca %s' % (m.group(0), new)
            return new
        t = re.sub(r'(?:(?<=\s\s)|(?<=^))(\d{2}) (\d{3}) (\d{2})(?!\d)', respace, t)
        odd = [m.group(0) for m in re.finditer(r'(?:(?<=\s\s)|(?<=^))\d{2} \d{3} \d{3}(?!\d)', t)]
        for o in odd:
            issues.append((W, 'gerbong', 'nomor tak lazim dicatat apa adanya: ' + o, k + 1)); NOTES[(W, k + 1, o)] = 'nomor tercetak tak lazim — periksa dokumen'
        t2 = re.sub(r'(?:(?<=\s\s)|(?<=^))(\d{2}) (\d{3}) (\d{3})(?!\d)', r'\1 #\2 \3', t)
        ms = list(re.finditer(r'(?<![\d-])(\d{2}) #?(\d{2,3}) ?(\d{2,3})(?![\d,-])', t2))
        ser = ['%s %s %s' % m.groups() for m in ms]
        t = t2
        tail = [int(x) for x in re.findall(r'\d+(?:,\d+)?', t[ms[-1].end():]) if ',' not in x] if ms else []
        lab = t[:ms[0].start()] if ms else re.sub(r'\s+\d+(,\d+)?\s*$', '', t)
        if not ms and re.search(r'\S', lab[34:]): continue          # catatan kaki / judul, bukan label kolom
        lab = lab[:34]
        if ser and (not tail or tail[0] != len(ser)): issues.append((W, 'gerbong', 'baris %d: %d nomor vs jumlah baris %s' % (k + 1, len(ser), tail[:1])))
        st['blk'].append(dict(k=k, series=ser, lab=lab))
    flush('', None)
    checks.append((W, 'Gerbong', st['tot'], REKAP.get((W, 'GERBONG'))))

for path, W in BOOKS:
    L = open(path, encoding='utf-8', errors='replace').read().replace('\f', '\n').split('\n')
    lok(L, W)
    krd(L, W)
    kereta(L, W)
    gerbong(L, W)
# ---- penanda per unit
for u in units:
    u['catatan'] = NOTES.get((u['wilayah'], u['halaman_baris'], u['seri']), '')
    if u['seri'].startswith('TS.'): u['catatan'] = 'buku menulis "%s" (anggota trainset), nomor seri tidak dicantumkan' % u['seri']; u['nomor'] = '%s (%s)' % (u['kelas'], u['seri'])
    if u['sarana'] == 'Kereta' and u['pembangkit']: u['catatan'] = (u['catatan'] + '; ' if u['catatan'] else '') + 'kereta pembangkit (%s)' % u['kelas']
    if u['sarana'] == 'KRD': u['catatan'] = (u['catatan'] + '; ' if u['catatan'] else '') + 'tergabung di ' + u['kelompok']
cnt = collections.Counter((u['sarana'], u['nomor']) for u in units if not u['seri'].startswith('TS.'))
for u in units:
    if cnt[(u['sarana'], u['nomor'])] > 1:
        other = [v['wilayah'] + '/' + v['dipo'] for v in units if v is not u and v['sarana'] == u['sarana'] and v['nomor'] == u['nomor']]
        u['catatan'] = (u['catatan'] + '; ' if u['catatan'] else '') + 'nomor yang sama juga tercantum di ' + ', '.join(other)
if __name__ == '__main__':
    for c in checks: print(c, 'OK' if c[2] == c[3] else 'BEDA')
    for x in issues: print('  !', x)
    json.dump(dict(units=units, issues=issues, checks=checks), open('duksar_unit.json', 'w'), ensure_ascii=False)
    print('total unit', len(units), collections.Counter(u['sarana'] for u in units))
    print('duplikat', sum(1 for k, v in cnt.items() if v > 1), [k for k, v in cnt.items() if v > 1][:12])
    print('pembangkit', collections.Counter(u['kelas'] for u in units if u['pembangkit']))
