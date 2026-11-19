"""Membangkitkan platform/Agregat.gs dari db/bigquery/30_agregat.sql (satu sumber kebenaran SQL agregat).

Pemakaian:  python3 tools/bigquery/gen_agregat.py
Setiap pernyataan (dipisah ';' di akhir baris) menjadi satu entri PLATFORM_AGREGAT berisi nama tabel dan SQL
dengan penampung ${PROJECT} (diganti Platform.gs saat dijalankan).
"""
import json, os, re
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sql = open(os.path.join(ROOT, 'db/bigquery/30_agregat.sql'), encoding='utf-8').read()
body = '\n'.join(l for l in sql.splitlines() if not l.lstrip().startswith('--'))
out = []
for st in re.split(r';\s*\n', body):
    st = st.strip().rstrip(';').strip()
    if not st: continue
    m = re.search(r'TABLE `\$\{PROJECT\}\.kai_agg\.([a-z0-9_]+)`', st)
    if not m: raise SystemExit('pernyataan tanpa tabel kai_agg: ' + st[:80])
    out.append({'name': m.group(1), 'sql': st})
open(os.path.join(ROOT, 'platform/Agregat.gs'), 'w', encoding='utf-8').write(
    '/** Agregat.gs — DIBANGKITKAN tools/bigquery/gen_agregat.py dari db/bigquery/30_agregat.sql. Jangan diedit manual. */\n'
    'var PLATFORM_AGREGAT = ' + json.dumps(out, ensure_ascii=False, indent=1) + ';\n')
print('ok', len(out), 'agregat:', ', '.join(o['name'] for o in out))
