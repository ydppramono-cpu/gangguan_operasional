"""Membakukan kolom `wilayah` di db/csv/master_stasiun.csv tanpa membangun ulang semua CSV.

Aturan sama dengan wil_baku() di export_csv.py: 'DAOP 4 SEMARANG' → 'Daop 4', 'Divre I Sumatera Utara' → 'Divre 1'.
Pemakaian: python3 tools/csv/baku_wilayah.py   (idempoten)
"""
import csv, io, os, re
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
P = os.path.join(ROOT, 'db/csv/master_stasiun.csv')
ROM = {'I': 1, 'II': 2, 'III': 3, 'IV': 4}
def baku(w):
    m = re.match(r'\s*(daop|divre)\s*([0-9]+|IV|I{1,3})\b', w or '', re.I)
    if not m: return w or ''
    return ('Daop ' if m.group(1).lower() == 'daop' else 'Divre ') + str(ROM.get(m.group(2).upper()) or int(m.group(2)))
rows = list(csv.reader(open(P, encoding='utf-8', newline='')))
i = rows[0].index('wilayah'); n = 0
for r in rows[1:]:
    b = baku(r[i])
    if b != r[i]: r[i] = b; n += 1
buf = io.StringIO(); csv.writer(buf, lineterminator='\n').writerows(rows)
open(P, 'w', encoding='utf-8', newline='').write(buf.getvalue())
import hashlib
M = os.path.join(ROOT, 'db/csv/_manifest.csv'); mr = list(csv.reader(open(M, encoding='utf-8', newline='')))
for r in mr:
    if r and r[0] == 'master_stasiun': r[-1] = hashlib.sha256(open(P, 'rb').read()).hexdigest()
buf = io.StringIO(); csv.writer(buf, lineterminator='\n').writerows(mr); open(M, 'w', encoding='utf-8', newline='').write(buf.getvalue())
print('baris dibakukan:', n, '· manifest diperbarui')
