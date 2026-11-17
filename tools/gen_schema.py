"""Membangkitkan DDL BigQuery, kamus data, dan konstanta tabel Platform.gs dari db/schema/sumber_tabel.json (satu sumber kebenaran)."""
import json, re, os, unicodedata
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
S = json.load(open(os.path.join(ROOT, 'db/schema/sumber_tabel.json')))

def snake(h):
    h = unicodedata.normalize('NFKD', h).encode('ascii', 'ignore').decode()
    h = h.replace('%', 'pct ').replace('(Rp)', 'rp').replace('&', 'dan')
    h = re.sub(r'[^0-9A-Za-z]+', '_', h).strip('_').lower()
    if re.match(r'^\d', h): h = 'c_' + h
    return h or 'kolom'

def colL(n):
    s = ''
    while n: n, r = divmod(n - 1, 26); s = chr(65 + r) + s
    return s
def rng(t):
    sh = t['sheet'] if re.match(r'^[A-Za-z0-9_]+$', t['sheet']) else "'%s'" % t['sheet']
    return '%s!A:%s' % (sh, colL(len(t['headers'])))

tables = []
for t in S['tables']:
    cols, seen = [], {}
    for h in t['headers']:
        c = snake(h); n = seen.get(c, 0); seen[c] = n + 1
        if n: c = '%s_%d' % (c, n + 1)
        cols.append({'col': c, 'header': h, 'num': h in t.get('num', []), 'date': h in t.get('date', [])})
    tables.append(dict(t, cols=cols, ssid=S['spreadsheets'][t['ss']]['id']))

os.makedirs(os.path.join(ROOT, 'db/bigquery'), exist_ok=True)
P = '${PROJECT}'
ddl = ['-- 10_external_tables.sql — DIBANGKITKAN tools/gen_schema.py. Jangan diedit manual.',
       '-- Tabel eksternal BigQuery yang membaca Google Sheets secara langsung (live). Semua kolom STRING = nilai apa adanya di sheet.',
       '-- Ganti ${PROJECT} dengan ID proyek Google Cloud Anda. Dataset: kai_raw (eksternal) dan kai (view bertipe).', '']
for t in tables:
    ddl.append('-- %s: %s (%s!%s)' % (t['name'], t['desc'], t['ss'], t['sheet']))
    ddl.append('CREATE OR REPLACE EXTERNAL TABLE `%s.kai_raw.%s` (' % (P, t['name']))
    ddl.append(',\n'.join('  %s STRING OPTIONS(description=%s)' % (c['col'], json.dumps(c['header'], ensure_ascii=False)) for c in t['cols']))
    ddl.append(') OPTIONS (format = "GOOGLE_SHEETS", uris = ["https://docs.google.com/spreadsheets/d/%s"], sheet_range = %s, skip_leading_rows = %d, description = %s);'
               % (t['ssid'], json.dumps(rng(t)), t['skip'], json.dumps(t['desc'], ensure_ascii=False)))
    ddl.append('')
open(os.path.join(ROOT, 'db/bigquery/10_external_tables.sql'), 'w').write('\n'.join(ddl))

views = ['-- 20_views.sql — DIBANGKITKAN tools/gen_schema.py. View bertipe di dataset kai (angka & tanggal diurai oleh UDF kai.num / kai.tgl).', '']
for t in tables:
    sel = []
    for c in t['cols']:
        if c['num']: sel.append('  `%s.kai.num`(%s) AS %s' % (P, c['col'], c['col']))
        elif c['date']: sel.append('  `%s.kai.tgl`(%s) AS %s, %s AS %s_teks' % (P, c['col'], c['col'], c['col'], c['col']))
        else: sel.append('  NULLIF(TRIM(%s), "") AS %s' % (c['col'], c['col']))
    first = t['cols'][0]['col']
    views.append('CREATE OR REPLACE VIEW `%s.kai.%s` OPTIONS(description=%s) AS\nSELECT\n%s\nFROM `%s.kai_raw.%s`\nWHERE COALESCE(%s) IS NOT NULL;\n'
                 % (P, t['name'], json.dumps(t['desc'], ensure_ascii=False), ',\n'.join(sel), P, t['name'],
                    ', '.join('NULLIF(TRIM(%s),"")' % c['col'] for c in t['cols'][:3])))
open(os.path.join(ROOT, 'db/bigquery/20_views.sql'), 'w').write('\n'.join(views))

with open(os.path.join(ROOT, 'db/schema/kamus_data.csv'), 'w', encoding='utf-8') as f:
    f.write('tabel,urutan,kolom_sql,judul_sheet,tipe_view,spreadsheet,tab,baris_judul_dilewati,deskripsi_tabel\n')
    for t in tables:
        for i, c in enumerate(t['cols'], 1):
            tp = 'FLOAT64' if c['num'] else 'DATE' if c['date'] else 'STRING'
            row = [t['name'], str(i), c['col'], c['header'], tp, t['ss'], t['sheet'], str(t['skip']), t['desc']]
            f.write(','.join('"%s"' % x.replace('"', '""') for x in row) + '\n')

js = 'var PLATFORM_TABLES = ' + json.dumps([{'name': t['name'], 'ss': t['ssid'], 'sheet': t['sheet'], 'range': rng(t), 'skip': t['skip'], 'desc': t['desc'],
                                              'cols': [[c['col'], c['header'], 'N' if c['num'] else 'D' if c['date'] else 'S'] for c in t['cols']]} for t in tables],
                                            ensure_ascii=False, indent=1) + ';\n'
open(os.path.join(ROOT, 'platform/Tables.gs'), 'w').write('/** Tables.gs — DIBANGKITKAN tools/gen_schema.py dari db/schema/sumber_tabel.json. Jangan diedit manual. */\n' + js)
print('ok', len(tables), 'tabel', sum(len(t['cols']) for t in tables), 'kolom')
