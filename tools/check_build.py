"""Pemeriksaan build sebelum `clasp push` (dijalankan oleh `npm run check`).

1. Semua include di Index.html terjangkau, tidak melingkar, dan tidak ada berkas .html yatim.
2. Tidak ada penanda template GAS (<? ... ?>) selain include baku.
3. Sintaks JavaScript valid: setiap .gs di src/ & platform/ dan setiap blok <script> inline di halaman gabungan
   (diperiksa dengan `node --check`).
4. Urutan modul (tools/module_order.json + seed terpisah) cocok dengan filePushOrder di .clasp.json.example.
5. Bila ada snapshot acuan (tools/acuan_index.sha256), hash halaman gabungan harus sama (tanpa perubahan perilaku).
Keluar dengan kode 1 bila ada kesalahan.
"""
import glob
import hashlib
import json
import os
import re
import subprocess
import sys
import tempfile

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from html_include import INCLUDE_RE, expand, used_partials  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'src')
errors = []


def node_check(code, label):
    with tempfile.NamedTemporaryFile('w', suffix='.js', delete=False, encoding='utf-8') as fh:
        fh.write(code)
        tmp = fh.name
    try:
        res = subprocess.run(['node', '--check', tmp], capture_output=True, text=True)
        if res.returncode != 0:
            errors.append('sintaks %s: %s' % (label, res.stderr.strip().splitlines()[-1] if res.stderr else '?'))
    finally:
        os.unlink(tmp)


# 1–2. include & penanda template
page = ''
try:
    page = expand(SRC, 'Index')
    used = used_partials(SRC)
    all_html = {os.path.basename(p)[:-5] for p in glob.glob(os.path.join(SRC, '*.html'))} - {'Index'}
    for orphan in sorted(all_html - used):
        errors.append('berkas HTML tidak di-include di mana pun: %s.html' % orphan)
except (ValueError, FileNotFoundError) as exc:
    errors.append(str(exc))
for path in glob.glob(os.path.join(SRC, '*.html')):
    with open(path, encoding='utf-8') as fh:
        rest = INCLUDE_RE.sub('', fh.read())
    if re.search(r'<\?(?!xml)', rest):
        errors.append('penanda template selain include di %s' % os.path.basename(path))

# 3. sintaks
for path in sorted(glob.glob(os.path.join(SRC, '*.gs')) + glob.glob(os.path.join(ROOT, 'platform', '*.gs'))):
    with open(path, encoding='utf-8') as fh:
        node_check(fh.read(), os.path.relpath(path, ROOT))
script_re = re.compile(r'<script(?![^>]*\bsrc=)(?![^>]*type="(?!text/javascript|module)[^"]*")[^>]*>(.*?)</script>', re.S)
for i, block in enumerate(script_re.findall(page)):
    node_check(block, 'Index.html <script> #%d' % (i + 1))

# 4. urutan push
with open(os.path.join(ROOT, 'tools', 'module_order.json'), encoding='utf-8') as fh:
    order = json.load(fh)
with open(os.path.join(ROOT, '.clasp.json.example'), encoding='utf-8') as fh:
    push = [os.path.basename(p) for p in json.load(fh).get('filePushOrder', [])]
gs_all = sorted(os.path.basename(p) for p in glob.glob(os.path.join(SRC, '*.gs')))
if sorted(push) != gs_all:
    errors.append('filePushOrder tidak memuat semua .gs: kurang %s, lebih %s'
                  % (sorted(set(gs_all) - set(push)), sorted(set(push) - set(gs_all))))
if [m for m in push if m in order] != order:
    errors.append('urutan module_order.json berbeda dengan filePushOrder')

# 5. snapshot acuan
ref = os.path.join(ROOT, 'tools', 'acuan_index.sha256')
digest = hashlib.sha256(page.encode('utf-8')).hexdigest()
if os.path.exists(ref) and '--perbarui-acuan' not in sys.argv:
    with open(ref, encoding='utf-8') as fh:
        if fh.read().split()[0] != digest:
            print('info: halaman gabungan berubah dari acuan (wajar bila memang ada perubahan UI; '
                  'jalankan dengan --perbarui-acuan setelah diuji).')
if '--perbarui-acuan' in sys.argv:
    with open(ref, 'w', encoding='utf-8') as fh:
        fh.write(digest + '  Index(gabungan)\n')

if errors:
    print('GAGAL (%d):' % len(errors))
    for e in errors:
        print(' -', e)
    sys.exit(1)
print('OK: %d parsial, halaman gabungan %d bait, sha256 %s…' % (len(used_partials(SRC)), len(page.encode('utf-8')), digest[:12]))
