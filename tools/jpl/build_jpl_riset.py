"""Riset web JPL (db/sumber/jpl_riset_web.csv) → src/31_SeedJplRiset.gs (SEED_JPL_RISET).

Hanya fakta yang tertulis di sumber; tiap baris bertautan sumber & tanggal akses. Tidak ada isian karangan.
Pemakaian: python3 -I tools/jpl/build_jpl_riset.py
"""
import csv, json, os

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SRC = os.path.join(ROOT, 'db/sumber/jpl_riset_web.csv')
OUT = os.path.join(ROOT, 'src/31_SeedJplRiset.gs')
COLS = ['wilayah', 'no_jpl', 'petak', 'km', 'lokasi_jalan', 'penjaga', 'status', 'catatan', 'sumber_judul', 'sumber_url', 'terbit', 'diakses']


def main():
    rows = list(csv.DictReader(open(SRC, encoding='utf-8')))
    for r in rows:
        assert r['sumber_url'].startswith('https://'), 'baris tanpa sumber: ' + json.dumps(r, ensure_ascii=False)
    data = [[r[c].strip() for c in COLS] for r in rows]
    js = ('/**\n * 31_SeedJplRiset.gs — riset web alamat & penjaga JPL (dibuat otomatis oleh tools/jpl/build_jpl_riset.py dari\n'
          ' * db/sumber/jpl_riset_web.csv). Jangan disunting tangan. Kolom: ' + ', '.join(COLS) + '.\n */\n'
          'var SEED_JPL_RISET = ' + json.dumps(data, ensure_ascii=False) + ';\n')
    open(OUT, 'w', encoding='utf-8').write(js)
    print('SEED_JPL_RISET:', len(data), 'baris →', os.path.relpath(OUT, ROOT))


if __name__ == '__main__':
    main()
