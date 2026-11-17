"""gapekaYY.json -> src/NN_SeedGapekaYY.gs (JSON gzip + base64, dipecah per baris). Pemakaian:
python3 make_seed_gs.py gapeka25.json 2025 ../../src/20_SeedGapeka25.gs "<keterangan sumber satu baris>"
"""
import sys, gzip, base64, os, json
src, tahun, out, ket = sys.argv[1:5]
raw = open(src, 'rb').read(); json.loads(raw)   # pastikan JSON sah
b64 = base64.b64encode(gzip.compress(raw, 9, mtime=0)).decode()
yy = tahun[2:]
lines = [b64[i:i + 4000] for i in range(0, len(b64), 4000)]
with open(out, 'w', encoding='utf-8') as fh:
    fh.write('/**\n * %s — data grafik perjalanan (Marey) GAPEKA %s: lintas per judul lembar + perjalanan KA dari Buku Daftar Waktu.\n' % (os.path.basename(out), tahun))
    fh.write(' * Sumber: %s\n' % ket)
    fh.write(' * Dibangkitkan oleh tools/gapeka2026/build_gapeka_seed.py + make_seed_gs.py — JANGAN disunting manual. Format: JSON gzip + base64.\n */\n')
    fh.write('var SEED_GAPEKA%s_GZ = [\n' % yy + ',\n'.join('"%s"' % l for l in lines) + '\n].join(\'\');\n')
print(out, len(raw), 'bait json ->', len(b64), 'bait base64,', len(lines), 'baris')
