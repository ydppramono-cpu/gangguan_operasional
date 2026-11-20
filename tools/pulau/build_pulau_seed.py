"""Membangkitkan src/23_SeedPulau.gs — acuan PULAU (Jawa / Sumatera) untuk nomor KA dan sarana.

Sumber (semuanya di repo):
  db/csv/gapeka25_penomoran_ka.csv, db/csv/gapeka26_penomoran_ka.csv  — kolom `wilayah` (Jawa, Sumsel, Sumut, Sumbar)
  db/csv/duksar2026_sarana_unit.csv                                   — kolom `wilayah` per nomor sarana (alokasi mulai 1 Des 2026)
Isi seed:
  ka:   { nomor KA ternormalisasi -> 'S' }  hanya nomor Sumatera (nomor lain yang dikenal LIST KA = Jawa).
        Nomor gabungan "4000-4001" dipecah. Nomor yang muncul di kedua pulau (mis. bila ada) dicatat di `kaGanda` dan tidak diberi pulau.
  awalan: { 'Divre 1': 'U', 'Divre 2': 'B', 'Divre 3': 'S', 'Divre 4': 'S' }  — awalan nomor KA penumpang Sumatera per Divre
        (Buku Penomoran: Sumut = U, Sumbar = B, Sumsel/Lampung = S).
  duk26: string nomor sarana (dinormalkan tanpa spasi) yang menurut Duksar 2026 berada di Sumatera; berlaku26 = '2026-12-01'.
Pemakaian: python3 tools/pulau/build_pulau_seed.py
"""
import csv, json, os, re
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
norm = lambda s: re.sub(r'[^A-Z0-9]', '', s.upper())
isl = {}
for f in ['gapeka25_penomoran_ka.csv', 'gapeka26_penomoran_ka.csv']:
    for r in csv.DictReader(open(os.path.join(ROOT, 'db/csv', f), encoding='utf-8')):
        p = 'J' if r['wilayah'] == 'Jawa' else 'S'
        for n in r['no_ka'].split('-'):
            k = norm(n)
            if k:
                isl.setdefault(k, set()).add(p)
ganda = sorted(k for k, v in isl.items() if len(v) > 1)
kaS = sorted(k for k, v in isl.items() if v == {'S'})
duk = sorted({norm(r['nomor_sarana']) for r in csv.DictReader(open(os.path.join(ROOT, 'db/csv/duksar2026_sarana_unit.csv'), encoding='utf-8'))
              if r['wilayah'].startswith('Sumatera') and norm(r['nomor_sarana'])})
seed = {
    'src': 'Buku Penomoran KA GAPEKA 2025 & 2026 (kolom wilayah); Buku Dukungan Sarana GAPEKA 2026 (wilayah per unit)',
    'ka': ' '.join(kaS), 'kaGanda': ' '.join(ganda),
    'awalan': {'Divre 1': 'U', 'Divre 2': 'B', 'Divre 3': 'S', 'Divre 4': 'S'},
    'duk26': ' '.join(duk), 'berlaku26': '2026-12-01'
}
out = ('/**\n * 23_SeedPulau.gs — DIBANGKITKAN tools/pulau/build_pulau_seed.py. Jangan diedit manual.\n'
       ' * Acuan pulau: nomor KA Sumatera (Buku Penomoran 2025 & 2026) dan unit sarana Sumatera menurut Duksar 2026 (berlaku 1 Des 2026).\n'
       ' * Dipakai Domain.pulau* untuk menolak tautan KA/sarana yang berbeda pulau dengan wilayah kejadian.\n */\n'
       'var SEED_PULAU = ' + json.dumps(seed, ensure_ascii=False, separators=(',', ':')) + ';\n')
open(os.path.join(ROOT, 'src/23_SeedPulau.gs'), 'w', encoding='utf-8').write(out)
print('KA Sumatera', len(kaS), '· nomor ganda', len(ganda), ganda[:10], '· unit Sumatera Duksar26', len(duk), '· bait', len(out))
