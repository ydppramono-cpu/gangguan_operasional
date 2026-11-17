"""Sumbu stasiun Lembar GAPEKA 2026 (lapisan teks): urutan stasiun (y), letak km, dan jarak antarstasiun tertulis."""
import re, glob, os, json, collections, sys
sys.path.insert(0, 'tools')
def norm(s): return re.sub(r'[^a-z0-9]', '', s.lower())
KM = re.compile(r'^\d{1,3}[.,]\d{3}$')
def words(fn):
    return [(float(a), float(b), float(c), float(d), w.replace('&amp;', '&')) for a, b, c, d, w in re.findall(r'xMin="([\d.]+)" yMin="([\d.]+)" xMax="([\d.]+)" yMax="([\d.]+)">([^<]*)<', open(fn).read())]
ax = json.load(open('lembar_axis.json'))
out = {}
for fn in sorted(glob.glob('bbox/*.html')):
    key = os.path.basename(fn)[:-5]
    rows = ax.get(key, [])
    if len(rows) < 5: out[key] = None; continue
    W = words(fn)
    nx = collections.Counter(r['x'] for r in rows).most_common(1)[0][0]
    kms = [w for w in W if KM.match(w[4])]
    res = []
    for r in rows:
        if abs(r['x'] - nx) > 6: continue
        let = [w for w in kms if nx - 62 <= w[0] <= nx - 28 and abs((w[1] + w[3]) / 2 - r['y']) < 7]
        res.append(dict(kode=r['kode'], nama=r['nama'], y=r['y'], letak=let[0][4].replace(',', '.') if let else ''))
    # jarak antarstasiun: token di kolom jarak yang y-nya di antara dua baris stasiun berurutan
    jar = [w for w in kms if nx - 84 <= w[0] <= nx - 63]
    for a in range(len(res) - 1):
        y0, y1 = res[a]['y'], res[a + 1]['y']
        c = [w for w in jar if y0 + 2 < (w[1] + w[3]) / 2 < y1 - 2]
        res[a]['jarak_ke_berikut'] = c[0][4].replace(',', '.') if len(c) == 1 else ''
    out[key] = res
    print(key, 'stasiun', len(res), 'letak', sum(1 for r in res if r['letak']), 'jarak', sum(1 for r in res if r.get('jarak_ke_berikut')))
json.dump(out, open('lembar_axis2.json', 'w'), ensure_ascii=False, indent=0)
