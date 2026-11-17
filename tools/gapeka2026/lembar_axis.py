"""Sumbu stasiun tiap Lembar GAPEKA 2026: nama stasiun (dicocokkan ke kamus nama DW), letak km, posisi y."""
import re, glob, os, json, collections
def norm(s): return re.sub(r'[^a-z0-9]', '', s.lower())
def words(fn):
    return [(float(a), float(b), float(c), float(d), w.replace('&amp;', '&')) for a, b, c, d, w in re.findall(r'xMin="([\d.]+)" yMin="([\d.]+)" xMax="([\d.]+)" yMax="([\d.]+)">([^<]*)<', open(fn).read())]
KM = re.compile(r'^\d{1,3}[.,]\d{3}$')
names = {}
for k in sum(json.load(open('dw_jawa.json')).values(), []):
    for r in k['rows']: names.setdefault(norm(r['nama']), (r['nama'], r['kode']))
for l in open('jadwal2025.tsv', encoding='utf-8'):
    c = l.split('\t')
    if len(c) > 5: names.setdefault(norm(c[5]), (c[5], c[4]))
def lines(W, xmax=520):
    """Kelompokkan kata di kiri halaman per baris (y tengah ±3)."""
    L = []
    for w in sorted([w for w in W if w[0] < xmax], key=lambda w: (w[1] + w[3]) / 2):
        yc = (w[1] + w[3]) / 2
        if L and abs(L[-1][0] - yc) < 3.5: L[-1][1].append(w)
        else: L.append([yc, [w]])
    return [(y, sorted(ws, key=lambda w: w[0])) for y, ws in L]
out = {}
for fn in sorted(glob.glob('bbox/*.html')):
    W = words(fn); rows = []
    for y, ws in lines(W):
        txt = [w for w in ws if not KM.match(w[4]) and not re.match(r'^[\d*.,/-]+$', w[4])]
        best = None
        for i in range(len(txt)):
            for j in range(i + 1, min(len(txt), i + 6) + 1):
                n = norm(''.join(w[4] for w in txt[i:j]))
                if n in names and (best is None or j - i > best[1] - best[0]): best = (i, j, n)
        if not best: continue
        x0 = txt[best[0]][0]
        km = [w for w in ws if KM.match(w[4]) and w[2] <= x0 + 2]
        km = max(km, key=lambda w: w[0]) if km else None
        rows.append(dict(y=round(y, 1), nama=' '.join(w[4] for w in txt[best[0]:best[1]]), kode=names[best[2]][1], km=km[4].replace(',', '.') if km else '', x=round(x0)))
    out[os.path.basename(fn)[:-5]] = rows
    print(os.path.basename(fn), len(rows), 'tanpa km:', sum(1 for r in rows if not r['km']))
json.dump(out, open('lembar_axis.json', 'w'), ensure_ascii=False, indent=0)
