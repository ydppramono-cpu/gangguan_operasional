"""Terapkan koreksi koordinat stasiun ke src/18_SeedPeta.gs, lalu uji kewajaran semua koordinat.

Sumber koreksi (urut prioritas):
  a. db/sumber/data_station_daop4-6.csv (data stasiun resmi; ';'): koordinat resmi menggantikan koordinat peta bila selisih > 1 km.
  b. db/sumber/koreksi_koordinat_stasiun.csv (kode, lat, lon, alasan, sumber) — setiap baris wajib beralasan dan bersumber.
Uji (gagal = keluar kode 1):
  1. Pulau koordinat sesuai wilayah stasiun (Daop = Jawa, Divre = Sumatera) di db/csv/master_stasiun.csv.
  2. Tidak ada dua kode stasiun berbeda dengan koordinat identik (tanda penggabungan berdasarkan nama, mis. KTG/KTP "Ketapang").
  3. Setiap stasiun pada rute Laporan Stasiun Perhentian berjarak ≤ 30 km dari salah satu tetangga rutenya.
Pemakaian: python3 -I tools/peta/koreksi_koordinat.py [--cek]   (--cek: hanya uji, tanpa menulis)
Saat menulis, koordinat db/csv/master_stasiun.csv ikut disamakan (beserta sha256 di _manifest.csv).
"""
import csv, hashlib, io, json, math, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SEED = os.path.join(ROOT, 'src/18_SeedPeta.gs')
LABEL = 'koreksi terdokumentasi (db/sumber/koreksi_koordinat_stasiun.csv)'


def load_seed():
    t = open(SEED, encoding='utf-8').read()
    m = re.search(r'var SEED_PETA = (\{.*\});\s*$', t, re.S)
    return t, m, json.loads(m.group(1))


def apply():
    t, m, S = load_seed()
    if LABEL not in S['stSrc']:
        S['stSrc'].append(LABEL)
    si = S['stSrc'].index(LABEL)
    n = 0
    RES = 'resmi data_station (db/sumber/data_station_daop4-6.csv)'
    if RES not in S['stSrc']:
        S['stSrc'].append(RES)
    ri = S['stSrc'].index(RES)
    for r in csv.DictReader(open(os.path.join(ROOT, 'db/sumber/data_station_daop4-6.csv'), encoding='utf-8'), delimiter=';'):
        k = r['stasiun'].strip()
        if not r['latitude'] or k not in S['st']:
            continue
        o = S['st'][k]; nw = (float(r['latitude']), float(r['longitude']))
        if km(o, nw) > 1:
            S['st'][k] = [round(nw[0], 6), round(nw[1], 6), o[2], ri]
            print('resmi: %s %s %.1f km' % (k, r['station_name'], km(o, nw)))
            n += 1
    for r in csv.DictReader(open(os.path.join(ROOT, 'db/sumber/koreksi_koordinat_stasiun.csv'), encoding='utf-8')):
        if not r['alasan'].strip() or not r['sumber'].strip():
            raise SystemExit('Koreksi tanpa alasan/sumber: ' + r['kode_stasiun'])
        old = S['st'].get(r['kode_stasiun'])
        new = [float(r['lat']), float(r['lon']), old[2] if old and old[3] == si else None, si]
        if old != new:
            S['st'][r['kode_stasiun']] = new
            n += 1
    out = t[:m.start(1)] + json.dumps(S, ensure_ascii=False, separators=(',', ':')) + t[m.end(1):]
    open(SEED, 'w', encoding='utf-8').write(out)
    print('koreksi diterapkan:', n)
    master()


def master():
    """Samakan koordinat db/csv/master_stasiun.csv dengan koreksi terdokumentasi (tanpa mengekspor ulang seluruh CSV)."""
    P = os.path.join(ROOT, 'db/csv/master_stasiun.csv')
    rows = list(csv.reader(open(P, encoding='utf-8', newline='')))
    h = rows[0]; ik, ila, ilo, isr = h.index('kode_stasiun'), h.index('lat'), h.index('lon'), h.index('sumber_koordinat')
    K = {r['kode_stasiun']: r for r in csv.DictReader(open(os.path.join(ROOT, 'db/sumber/koreksi_koordinat_stasiun.csv'), encoding='utf-8'))}
    n = 0
    for r in rows[1:]:
        k = K.get(r[ik])
        if k and (r[ila] != k['lat'] or r[ilo] != k['lon']):
            r[ila], r[ilo], r[isr] = k['lat'], k['lon'], 'koreksi: ' + k['sumber']
            n += 1
    if not n:
        return
    buf = io.StringIO(); csv.writer(buf, lineterminator='\n').writerows(rows)
    open(P, 'w', encoding='utf-8', newline='').write(buf.getvalue())
    M = os.path.join(ROOT, 'db/csv/_manifest.csv')
    mr = list(csv.reader(open(M, encoding='utf-8', newline='')))
    sha = hashlib.sha256(open(P, 'rb').read()).hexdigest()
    for r in mr:
        if r and r[0] == 'master_stasiun':
            r[-1] = sha
    buf = io.StringIO(); csv.writer(buf, lineterminator='\n').writerows(mr)
    open(M, 'w', encoding='utf-8', newline='').write(buf.getvalue())
    print('master_stasiun.csv: %d koordinat dikoreksi' % n)


def km(a, b):
    return 111 * math.hypot(a[0] - b[0], (a[1] - b[1]) * math.cos(math.radians(a[0])))


def check():
    _, _, S = load_seed()
    st = S['st']
    M = {r['kode_stasiun']: r for r in csv.DictReader(open(os.path.join(ROOT, 'db/csv/master_stasiun.csv'), encoding='utf-8'))}
    err = []

    def pulau(lat, lon):
        if 105.0 <= lon <= 114.7 and -9 <= lat <= -5.8:
            return 'Jawa'
        if 95 <= lon <= 106.2 and -6.0 <= lat <= 6:
            return 'Sumatera'
        return 'luar'
    for k, v in st.items():
        w = (M.get(k) or {}).get('wilayah', '')
        want = 'Jawa' if w.startswith('Daop') else 'Sumatera' if w.startswith('Divre') else ''
        if want and pulau(v[0], v[1]) != want:
            err.append('pulau: %s (%s) di %s, koordinat %s' % (k, w, pulau(v[0], v[1]), v[:2]))
    seenM = {}
    for k, r in M.items():
        if r.get('lat'):
            key = (round(float(r['lat']), 5), round(float(r['lon']), 5))
            if key in seenM:
                err.append('kembar (master_stasiun.csv): %s dan %s berkoordinat sama %s' % (seenM[key], k, key))
            seenM[key] = k
    seen = {}
    for k, v in st.items():
        key = (round(v[0], 5), round(v[1], 5))
        if key in seen:
            err.append('kembar: %s dan %s berkoordinat sama %s' % (seen[key], k, key))
        seen[key] = k
    P = os.path.join(ROOT, 'db/csv/stasiun_perhentian_2025.csv')
    if os.path.exists(P):
        near = {}
        for r in csv.DictReader(open(P, encoding='utf-8')):
            s = r['stasiun'].split()
            for i, x in enumerate(s):
                if x not in st:
                    continue
                for j in (i - 1, i + 1):
                    if 0 <= j < len(s) and s[j] in st:
                        near[x] = min(near.get(x, 1e9), km(st[x], st[s[j]]))
        for x, d in near.items():
            if d > 30:
                err.append('jauh: %s berjarak %.0f km dari tetangga rute terdekat' % (x, d))
    for e in err:
        print('GAGAL', e)
    print('uji koordinat:', 'LULUS' if not err else '%d masalah' % len(err), '·', len(st), 'stasiun')
    return not err


if __name__ == '__main__':
    if '--cek' not in sys.argv:
        apply()
    sys.exit(0 if check() else 1)
