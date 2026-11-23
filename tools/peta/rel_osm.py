"""Graf jaringan rel OSM dari SEED_PETA.ln — jalur terpendek antar titik, interpolasi km, potongan geometri petak.

Dipakai tools/peta/koreksi_koordinat.py. Fungsi murni (tanpa I/O); koordinat [lat, lon].
Garis OSM tersimpan sebagai potongan-potongan (ln); ujung potongan yang berjarak < SAMBUNG_M disambung menjadi satu simpul.
"""
import heapq
import math

SAMBUNG_M = 40      # ujung potongan OSM yang berjarak < 40 m dianggap tersambung
SNAP_KM = 1.5       # stasiun boleh berjarak ≤ 1,5 km dari rel OSM terdekat


def km(a, b):
    return 111.2 * math.hypot(a[0] - b[0], (a[1] - b[1]) * math.cos(math.radians((a[0] + b[0]) / 2)))


def decode(a, sc=1e4):
    o, x, y = [], a[0], a[1]
    o.append((y / sc, x / sc))
    for i in range(2, len(a), 2):
        x += a[i]; y += a[i + 1]
        o.append((y / sc, x / sc))
    return o


def encode(pts, sc=1e4):
    c = [(round(p[1] * sc), round(p[0] * sc)) for p in pts]
    a = [c[0][0], c[0][1]]
    for i in range(1, len(c)):
        a += [c[i][0] - c[i - 1][0], c[i][1] - c[i - 1][1]]
    return a


class Graf:
    def __init__(self, ln):
        self.pt, self.adj = [], []
        cell = {}

        def node(p):
            gx, gy = int(p[0] / 0.0005), int(p[1] / 0.0005)
            for dx in (-1, 0, 1):
                for dy in (-1, 0, 1):
                    for i in cell.get((gx + dx, gy + dy), ()):
                        if km(self.pt[i], p) * 1000 < SAMBUNG_M:
                            return i
            self.pt.append(p); self.adj.append([])
            cell.setdefault((gx, gy), []).append(len(self.pt) - 1)
            return len(self.pt) - 1
        for l in ln:
            P = decode(l[2])
            prev = None
            for p in P:
                i = node(p)
                if prev is not None and prev != i:
                    w = km(self.pt[prev], self.pt[i])
                    self.adj[prev].append((i, w)); self.adj[i].append((prev, w))
                prev = i

    def snap(self, p):
        best, bd = None, 1e9
        for i, q in enumerate(self.pt):
            d = km(p, q)
            if d < bd:
                best, bd = i, d
        return (best, bd) if bd <= SNAP_KM else (None, bd)

    def path(self, a, b, batas_km=None):
        """Jalur terpendek simpul a → b (Dijkstra). Kembali (daftar titik, panjang km) atau (None, None)."""
        D, prev, Q = {a: 0.0}, {}, [(0.0, a)]
        while Q:
            d, u = heapq.heappop(Q)
            if u == b:
                break
            if d > D.get(u, 1e18) or (batas_km and d > batas_km):
                continue
            for v, w in self.adj[u]:
                nd = d + w
                if nd < D.get(v, 1e18):
                    D[v] = nd; prev[v] = u; heapq.heappush(Q, (nd, v))
        if b not in D:
            return None, None
        o, u = [b], b
        while u != a:
            u = prev[u]; o.append(u)
        return [self.pt[i] for i in reversed(o)], D[b]


def titik_pada(pts, f):
    """Titik pada polilin di fraksi panjang f (0–1)."""
    L = [0.0]
    for i in range(1, len(pts)):
        L.append(L[-1] + km(pts[i - 1], pts[i]))
    t = max(0.0, min(1.0, f)) * L[-1]
    for i in range(1, len(pts)):
        if L[i] >= t:
            seg = L[i] - L[i - 1] or 1
            r = (t - L[i - 1]) / seg
            return (pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * r, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * r)
    return pts[-1]
