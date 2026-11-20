"""Membersihkan daftar "KA yang dilayani" per dipo lokomotif di src/17_SeedDuksar.gs (Duksar GAPEKA 2025).

Masalah (audit 20 Nov 2026):
  1. Ke-14 dipo diawali deret 1, 2, 3, … n (n = 23–25) yang identik di semua dipo, Jawa maupun Sumatera:
     artefak ekstraksi tabel PDF (nomor kolom/baris), bukan nomor KA.
  2. Di dipo Sumatera beberapa nomor tersisa adalah nomor KA Jawa (mis. 38, 45, 201) — tidak ada KA Sumatera
     bernomor itu di Buku Penomoran GAPEKA 2025, sehingga tidak bisa diberi awalan S/U/B dengan yakin.
Aturan (deterministik, idempoten — selalu mulai dari `kaAsli`):
  a. Buang deret awal yang persis 1..n bila n >= 20.
  b. Nomor dipertahankan bila pulau/wilayahnya menurut gapeka25_penomoran_ka = buku dipo.
  c. Bila tidak, dan nomor berawalan wilayah (S/U/B + nomor) ada di wilayah buku itu, pakai bentuk berawalan.
  d. Selain itu nomor ditolak dan dicatat di `kaDitolak` (tetap terlihat di Metodologi, tidak dipakai menautkan).
Pemakaian: python3 tools/duksar/bersihkan_ka_dipo.py   (lalu npm run check, uji, dan bandingkan diff seed)
"""
import csv, json, os, re
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SEED = os.path.join(ROOT, 'src/17_SeedDuksar.gs')
PRE = {'Sumsel': 'S', 'Sumut': 'U', 'Sumbar': 'B'}

P = {}
for r in csv.DictReader(open(os.path.join(ROOT, 'db/csv/gapeka25_penomoran_ka.csv'), encoding='utf-8')):
    for n in r['no_ka'].split('-'):
        P.setdefault(n.strip().upper(), r['wilayah'])

s = open(SEED, encoding='utf-8').read()
a, b = s.index('{'), s.rindex('}') + 1
d = json.loads(s[a:b])
lap = {}
for dipo, v in d['lok'].items():
    asli = v.get('kaAsli', v['ka'])
    L = asli.split()
    k = 0
    while k < len(L) and L[k] == str(k + 1):
        k += 1
    if k < 20:
        k = 0
    keep, tolak = [], []
    for x in L[k:]:
        X = x.upper()
        w = v['book']
        if P.get(X) == w:
            keep.append(x)
        elif w in PRE and P.get(PRE[w] + X) == w:
            keep.append(PRE[w] + X)
        else:
            tolak.append(x)
    v['kaAsli'] = asli
    v['ka'] = ' '.join(keep)
    v['kaDitolak'] = ' '.join(tolak)
    v['kaArtefak'] = k
    lap[dipo] = (v['book'], k, len(keep), len(tolak))
d['catatanKa'] = ('Daftar KA per dipo dibersihkan tools/duksar/bersihkan_ka_dipo.py: deret 1..n di awal (artefak tabel PDF) dibuang, '
                  'nomor yang pulau/wilayahnya tidak sama dengan buku dipo ditolak (kaDitolak), awalan S/U/B ditambahkan bila nomor berawalan ada di wilayah itu.')
out = s[:a] + json.dumps(d, ensure_ascii=False, separators=(',', ':')) + s[b:]
open(SEED, 'w', encoding='utf-8').write(out)
for k, v in lap.items():
    print('%-4s %-6s artefak=%2d dipakai=%3d ditolak=%d' % ((k,) + v))
