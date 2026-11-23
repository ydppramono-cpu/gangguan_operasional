"""Terapkan koreksi koordinat stasiun ke src/18_SeedPeta.gs, lalu uji kewajaran semua koordinat.

Sumber koreksi (urut prioritas):
  a. db/sumber/data_station_daop4-6.csv (data stasiun resmi; ';'): koordinat resmi menggantikan koordinat peta bila selisih > 1 km.
  b. db/sumber/koreksi_koordinat_stasiun.csv (kode, lat, lon, alasan, sumber) — setiap baris wajib beralasan dan bersumber.
     lat = "interpolasi": koordinat dihitung dari km lembar GAPEKA 2025 di antara dua stasiun tetangga berkoordinat baik,
     menyusuri jalur terpendek graf rel OSM (tools/peta/rel_osm.py); bila tidak ada jalur OSM → garis lurus antar tetangga.
     kode "TBK@Sumatera" / "LR@Daop 3": kode kembar (Tambak Daop 5 vs Divre I; Larangan Daop 4 vs lembar Daop 3)
     → disimpan di SEED_PETA.stP[kode][pulau atau wilayah]; peta memakai koordinat sesuai wilayah petak.
  c. Geometri petak: petak lembar GAPEKA tanpa geometri OSM (pg) diberi jalur terpendek graf rel OSM bila panjangnya ±35% km petak
     (dicatat di SEED_PETA.pgGen); selebihnya tetap tanpa garis (bukan garis lurus karangan).
Uji (gagal = keluar kode 1):
  1. Pulau koordinat sesuai wilayah stasiun (Daop = Jawa, Divre = Sumatera) di db/csv/master_stasiun.csv.
  2. Tidak ada dua kode stasiun berbeda dengan koordinat identik (tanda penggabungan berdasarkan nama, mis. KTG/KTP "Ketapang").
  3. Setiap stasiun pada rute Laporan Stasiun Perhentian berjarak ≤ 30 km dari salah satu tetangga rutenya.
  4. Petak berurutan di lembar GAPEKA 2025: jarak lurus ≤ 2,2 × km petak (+2 km) — menangkap koordinat salah letak/tertukar.
Pemakaian: python3 -I tools/peta/koreksi_koordinat.py [--cek]   (--cek: hanya uji, tanpa menulis)
Saat menulis, koordinat db/csv/master_stasiun.csv ikut disamakan (beserta sha256 di _manifest.csv).
"""
import csv, hashlib, io, json, math, os, re, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import rel_osm  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SEED = os.path.join(ROOT, 'src/18_SeedPeta.gs')
LABEL = 'koreksi terdokumentasi (db/sumber/koreksi_koordinat_stasiun.csv)'
LABEL_I = 'interpolasi km lembar GAPEKA di graf rel OSM'
LABEL_L = 'interpolasi km lembar GAPEKA, garis lurus antar tetangga (perkiraan)'
KOR = os.path.join(ROOT, 'db/sumber/koreksi_koordinat_stasiun.csv')
LEMBAR = os.path.join(ROOT, 'db/csv/gapeka25_lintas_lembar.csv')


def pulau_wil(w):
    return 'Sumatera' if str(w).startswith('Divre') else 'Jawa' if str(w).strip() else ''


def lintas():
    """Urutan stasiun per lintas lembar GAPEKA 2025: [(pulau, [(kode, km), ...]), ...]."""
    L = {}
    for r in csv.DictReader(open(LEMBAR, encoding='utf-8')):
        try:
            k = float(r['km'])
        except ValueError:
            continue
        L.setdefault((r['wilayah'], r['judul_lintas']), []).append((int(r['urut']), r['kode_stasiun'], k))
    return [(pulau_wil(w), [(c, k) for _, c, k in sorted(v)], wil_baku(w)) for (w, _), v in L.items()]


def wil_baku(w):
    """'Daop 3 Cirebon' / 'Divre I Sumatera Utara' → 'Daop 3' / 'Divre 1'."""
    m = re.match(r'(Daop|Divre)\s+([0-9]+|IV|I{1,3})', str(w))
    if not m:
        return ''
    n = {'I': 1, 'II': 2, 'III': 3, 'IV': 4}.get(m.group(2), m.group(2))
    return '%s %s' % (m.group(1), n)


def koord(S, kode, pulau, wil=''):
    """Koordinat stasiun sesuai wilayah/pulau petak (stP untuk kode kembar)."""
    P = (S.get('stP') or {}).get(kode, {})
    return P.get(wil) or P.get(pulau) or S['st'].get(kode)


def interpolasi(S, G, kode, pulau, tunda):
    """Koordinat stasiun dari km lembar di antara tetangga berkoordinat baik. Kembali (lat, lon, label) atau None."""
    for pl, seq, wl in lintas():
        if pulau not in (pl, wl):
            continue
        idx = [i for i, (c, _) in enumerate(seq) if c == kode]
        if not idx:
            continue
        i = idx[0]
        ok = lambda c: c not in tunda and koord(S, c, pl, wl)
        a = next((j for j in range(i - 1, -1, -1) if ok(seq[j][0])), None)
        b = next((j for j in range(i + 1, len(seq)) if ok(seq[j][0])), None)
        if a is None or b is None:
            continue
        A, B = koord(S, seq[a][0], pl, wl)[:2], koord(S, seq[b][0], pl, wl)[:2]
        dk = abs(seq[b][1] - seq[a][1]) or 1
        f = abs(seq[i][1] - seq[a][1]) / dk
        na, da = G.snap(A); nb, db = G.snap(B)
        if na is not None and nb is not None:
            P, L = G.path(na, nb, batas_km=dk * 2 + 5)
            if P and 0.65 * dk <= L <= 1.5 * dk:
                q = rel_osm.titik_pada(P, f)
                return round(q[0], 5), round(q[1], 5), LABEL_I
        return round(A[0] + (B[0] - A[0]) * f, 5), round(A[1] + (B[1] - A[1]) * f, 5), LABEL_L
    return None


def geometri_petak(S, G):
    """Petak lembar tanpa pg → jalur terpendek graf rel OSM bila panjangnya ±35% km petak."""
    S['pgGen'] = []
    n = 0
    for pl, seq, wl in lintas():
        for (a, ka), (b, kb) in zip(seq, seq[1:]):
            d = abs(kb - ka)
            if d <= 0 or (a + '-' + b) in S['pg'] or (b + '-' + a) in S['pg']:
                continue
            A, B = koord(S, a, pl, wl), koord(S, b, pl, wl)
            if not A or not B:
                continue
            na, _ = G.snap(A[:2]); nb, _ = G.snap(B[:2])
            if na is None or nb is None or na == nb:
                continue
            P, L = G.path(na, nb, batas_km=d * 2 + 5)
            if P and 0.65 * d <= L <= 1.35 * d:
                P = [tuple(A[:2])] + P + [tuple(B[:2])]
                S['pg'][a + '-' + b] = rel_osm.encode(P)
                S['pgGen'].append(a + '-' + b)
                n += 1
    print('geometri petak dari graf rel OSM:', n)


def load_seed():
    t = open(SEED, encoding='utf-8').read()
    m = re.search(r'var SEED_PETA = (\{.*\});\s*$', t, re.S)
    return t, m, json.loads(m.group(1))


M_WIL = {r['kode_stasiun']: r['wilayah'] for r in csv.DictReader(open(os.path.join(ROOT, 'db/csv/master_stasiun.csv'), encoding='utf-8'))}
HITUNG = {}


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
    for lb in (LABEL_I, LABEL_L):
        if lb not in S['stSrc']:
            S['stSrc'].append(lb)
    rows = list(csv.DictReader(open(KOR, encoding='utf-8')))
    tunda = set(r['kode_stasiun'].split('@')[0] for r in rows if r['lat'].strip() == 'interpolasi')
    G = rel_osm.Graf(S['ln'])
    global HITUNG
    HITUNG = {}
    # Koreksi tetap dulu, lalu interpolasi (urut km agar tetangga yang sudah dihitung bisa dipakai).
    for r in sorted(rows, key=lambda r: r['lat'].strip() == 'interpolasi'):
        if not r['alasan'].strip() or not r['sumber'].strip():
            raise SystemExit('Koreksi tanpa alasan/sumber: ' + r['kode_stasiun'])
        kode, _, pl = r['kode_stasiun'].partition('@')
        if r['lat'].strip() == 'interpolasi':
            q = interpolasi(S, G, kode, pl or pulau_wil(M_WIL.get(kode, '')), tunda - {kode})  # pl = pulau atau wilayah
            if not q:
                raise SystemExit('Interpolasi gagal (tetangga lembar tanpa koordinat): ' + r['kode_stasiun'])
            new = [q[0], q[1], None, S['stSrc'].index(q[2])]
            tunda.discard(kode)
            print('interpolasi: %s → %.5f, %.5f (%s)' % (r['kode_stasiun'], q[0], q[1], q[2]))
        else:
            old = S['st'].get(kode)
            new = [float(r['lat']), float(r['lon']), old[2] if old and old[3] == si else None, si]
        if pl:
            S.setdefault('stP', {}).setdefault(kode, {})[pl] = new
            n += 1
            continue
        HITUNG[kode] = new
        if S['st'].get(kode) != new:
            S['st'][kode] = new
            n += 1
    geometri_petak(S, G)
    out = t[:m.start(1)] + json.dumps(S, ensure_ascii=False, separators=(',', ':')) + t[m.end(1):]
    open(SEED, 'w', encoding='utf-8').write(out)
    print('koreksi diterapkan:', n)
    master()


def master():
    """Samakan koordinat db/csv/master_stasiun.csv dengan koreksi terdokumentasi (tanpa mengekspor ulang seluruh CSV)."""
    P = os.path.join(ROOT, 'db/csv/master_stasiun.csv')
    rows = list(csv.reader(open(P, encoding='utf-8', newline='')))
    h = rows[0]; ik, ila, ilo, isr = h.index('kode_stasiun'), h.index('lat'), h.index('lon'), h.index('sumber_koordinat')
    K = {r['kode_stasiun']: r for r in csv.DictReader(open(KOR, encoding='utf-8')) if '@' not in r['kode_stasiun']}
    n = 0
    for r in rows[1:]:
        k = K.get(r[ik])
        if not k:
            continue
        v = HITUNG.get(r[ik])
        lat, lon = (('%.5f' % v[0]).rstrip('0'), ('%.5f' % v[1]).rstrip('0')) if v else (k['lat'], k['lon'])
        if r[ila] != lat or r[ilo] != lon:
            r[ila], r[ilo], r[isr] = lat, lon, 'koreksi: ' + k['sumber']
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
    for pl, seq, wl in lintas():
        for (a, ka), (b, kb) in zip(seq, seq[1:]):
            A, B = koord(S, a, pl, wl), koord(S, b, pl, wl)
            d = abs(kb - ka)
            if A and B and d > 0 and km(A, B) > 2.2 * d + 2:
                err.append('lembar: petak %s-%s %.1f km di GAPEKA, jarak lurus %.0f km (koordinat salah letak/tertukar?)' % (a, b, d, km(A, B)))
    for e in err:
        print('GAGAL', e)
    print('uji koordinat:', 'LULUS' if not err else '%d masalah' % len(err), '·', len(st), 'stasiun')
    return not err


if __name__ == '__main__':
    if '--cek' not in sys.argv:
        apply()
    sys.exit(0 if check() else 1)
