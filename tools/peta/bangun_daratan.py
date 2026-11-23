"""Bangun ulang poligon daratan peta (SEED_PETA.land) dari Natural Earth 1:10m + koridor rel OSM.

Masalah v3.18: daratan Natural Earth disederhanakan ±2 km → stasiun & rel pesisir (Padang, Belawan, Cilacap, Probolinggo)
tampak di laut. Perbaikan: Natural Earth 1:10m land TANPA penyederhanaan kasar, digabung dengan penyangga 0,008° (±0,9 km)
di sekeliling rel OSM & stasiun (generalisasi kartografis: rel selalu digambar di darat), lalu disederhanakan 0,002° (±220 m).
Skala titik 1e3 (SEED_PETA.landScale = 1000; dekoder klien membagi landScale, bawaan lama 100).

Sumber: Natural Earth (domain publik), salinan GeoJSON martynafford/natural-earth-geojson di GitHub.
Pemakaian: python3 -I tools/peta/bangun_daratan.py [berkas ne_10m_land.json]
  (tanpa argumen: unduh ke .scratch/ne_10m_land.json bila belum ada). Butuh shapely.
"""
import json, os, re, sys, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SEED = os.path.join(ROOT, 'src/18_SeedPeta.gs')
URL = 'https://raw.githubusercontent.com/martynafford/natural-earth-geojson/master/10m/physical/ne_10m_land.json'
BBOX = (94.5, -9.2, 116.5, 6.5)   # Sumatera–Jawa–Bali


def dec(a, sc):
    o, x, y = [], a[0], a[1]
    o.append((x / sc, y / sc))
    for i in range(2, len(a), 2):
        x += a[i]; y += a[i + 1]
        o.append((x / sc, y / sc))
    return o


def main():
    from shapely.geometry import shape, box, Point, LineString
    from shapely.ops import unary_union
    src = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, '.scratch/ne_10m_land.json')
    if not os.path.exists(src):
        os.makedirs(os.path.dirname(src), exist_ok=True)
        urllib.request.urlretrieve(URL, src)
    t = open(SEED, encoding='utf-8').read()
    m = re.search(r'var SEED_PETA = (\{.*\});\s*$', t, re.S)
    S = json.loads(m.group(1))
    B = box(*BBOX)
    ne = unary_union([shape(f['geometry']).intersection(B) for f in json.load(open(src))['features']])
    rel = [LineString([(p[0], p[1]) for p in dec(l[2], 1e4)]) for l in S['ln'] if len(l[2]) >= 4]
    st = [Point(v[1], v[0]) for v in S['st'].values() if v]
    G = unary_union([ne, unary_union(rel + st).buffer(0.008)]).simplify(0.002)
    polys = [p for p in (G.geoms if hasattr(G, 'geoms') else [G]) if p.area > 0.0005]
    enc = []
    for p in polys:
        c = [(round(x * 1000), round(y * 1000)) for x, y in p.exterior.coords]
        a = [c[0][0], c[0][1]]
        for i in range(1, len(c)):
            a += [c[i][0] - c[i - 1][0], c[i][1] - c[i - 1][1]]
        enc.append(a)
    S['land'], S['landScale'] = enc, 1000
    S['landLic'] = 'Natural Earth 1:10m land (domain publik) + koridor ±0,9 km di sekitar rel OSM, disederhanakan ±220 m'
    out = t[:m.start(1)] + json.dumps(S, ensure_ascii=False, separators=(',', ':')) + t[m.end(1):]
    open(SEED, 'w', encoding='utf-8').write(out)
    print('daratan: %d poligon, %d titik' % (len(enc), sum(len(a) // 2 for a in enc)))


if __name__ == '__main__':
    main()
