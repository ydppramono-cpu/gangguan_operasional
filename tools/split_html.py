"""Pecah Index.html hasil gabungan menjadi berkas parsial (Css.*, Js.*, Ui.*, View.*, Part.*) + Index.html kerangka dengan <?!= include('…'); ?>.
Batas parsial: komentar kepala '<!-- Nama.Bagian — …' (berlanjut sampai elemen induk ditutup atau kepala berikutnya di kedalaman sama)
dan blok <style>/<script> yang diawali komentar kepala 'Css.X —' / 'Js.X —' / 'Ui.X —' / 'Part.XData —' (tepat satu elemen).
Hasil diverifikasi: menggabungkan ulang semua include harus IDENTIK byte demi byte dengan masukan.
Pakai: python3 tools/split_html.py <Index.html gabungan> <folder keluaran>"""
import re, sys, os
src, out = sys.argv[1], sys.argv[2]
s = open(src, encoding='utf-8').read()
VOID = set('area base br col embed hr img input link meta param source track wbr'.split())
TAG = re.compile(r'<(/?)([a-zA-Z][\w:-]*)((?:\s+[^\s=>/"\']+(?:\s*=\s*(?:"[^"]*"|\'[^\']*\'|[^\s>"\']+))?)*)\s*(/?)>', re.S)
HEAD_CMT = re.compile(r'<!--\s*((?:Ui|View|Part|Css|Js)\.[A-Za-z]+)\s+[—-]')
HEAD_BLK = re.compile(r'\s*/\*\*?\s*\n?\s*\*?\s*((?:Ui|Css|Js|Part)\.[A-Za-z]+)\s+[—-]')

# 1. token: (start, end, kind, name, closing, selfclose)
toks, i = [], 0
while i < len(s):
    if s.startswith('<!--', i):
        j = s.index('-->', i) + 3; toks.append((i, j, 'cmt', None, False, True)); i = j; continue
    if s[i] == '<':
        m = TAG.match(s, i)
        if m:
            name = m.group(2).lower(); closing = m.group(1) == '/'; sc = m.group(4) == '/' or name in VOID
            toks.append((i, m.end(), 'tag', name, closing, sc)); i = m.end()
            if not closing and name in ('script', 'style'):
                j = s.index('</%s>' % name, i); toks.append((i, j, 'raw', name, False, True)); i = j
            continue
    i += 1

# 2. kedalaman tiap token & penanda awal parsial
depth, info = 0, []
for t in toks:
    st, en, kind, name, closing, sc = t
    if kind == 'tag' and closing: depth -= 1; info.append((t, depth)); continue
    info.append((t, depth))
    if kind == 'tag' and not closing and not sc: depth += 1
assert depth == 0, 'HTML tidak seimbang: %d' % depth

starts = []   # (idx_token, name, mode)
for k, (t, d) in enumerate(info):
    st, en, kind, name, closing, sc = t
    if kind == 'cmt':
        m = HEAD_CMT.match(s, st)
        if m: starts.append((k, m.group(1), 'flow'))
    elif kind == 'tag' and not closing and name in ('script', 'style'):
        m = HEAD_BLK.match(s, en)
        if m: starts.append((k, m.group(1), 'block'))
start_idx = {k: (n, mode) for k, n, mode in starts}

def end_of(k, mode):
    d0 = info[k][1]
    if mode == 'block':       # satu elemen: sampai tag penutup pasangannya
        name = info[k][0][3]
        for j in range(k + 1, len(info)):
            t, d = info[j]
            if t[2] == 'tag' and t[4] and t[3] == name and d == d0: return t[1]
    last = info[k][0][1]
    for j in range(k + 1, len(info)):
        t, d = info[j]
        if t[2] == 'tag' and t[4] and d < d0: return last          # induk ditutup
        if d == d0 and j in start_idx: return last                   # kepala parsial berikutnya di kedalaman sama
        if d == d0 and start_idx.get(k, ('', ''))[1] == 'flow' and t[2] == 'tag' and t[3] in ('body', 'head'): return last
        last = t[1] if t[2] != 'raw' else last
    return last

parts = []
for k, n, mode in starts:
    parts.append([info[k][0][0], end_of(k, mode), n])
# 3. pohon: anak = parsial yang tercakup paling dekat
parts.sort(key=lambda p: (p[0], -p[1]))
def render(lo, hi, kids):
    o, pos = [], lo
    for a, b, n in kids:
        o.append(s[pos:a]); o.append("<?!= include('%s'); ?>" % n); pos = b
    o.append(s[pos:hi]); return ''.join(o)
def children(lo, hi):
    res, cur = [], lo
    for p in parts:
        if p[0] >= cur and p[1] <= hi and p[0] >= lo and (p[0], p[1]) != (lo, hi):
            res.append(p); cur = p[1]
    return res
files = {}
def emit(p):
    a, b, n = p; kids = children(a, b); body = render(a, b, kids)
    if n in files and files[n] != body: raise SystemExit('Isi parsial %s berbeda antar kemunculan — tidak dapat dipecah aman' % n)
    files[n] = body
    for c in kids: emit(c)
top = children(0, len(s))
for p in top: emit(p)
files['Index'] = render(0, len(s), top)
# 4. verifikasi gabung ulang
INC = re.compile(r"<\?!= include\('([^']+)'\); \?>")
def expand(n, stack=()):
    return INC.sub(lambda m: expand(m.group(1), stack + (n,)), files[n])
assert expand('Index') == s, 'Gabung ulang TIDAK identik'
os.makedirs(out, exist_ok=True)
for n, body in files.items():
    open(os.path.join(out, n + '.html'), 'w', encoding='utf-8').write(body if body.endswith('\n') or n == 'Index' else body)
print('OK: %d berkas parsial + Index; gabung ulang identik (%d byte)' % (len(files) - 1, len(s)))
for n in sorted(files): print('  %-22s %7d byte' % (n, len(files[n])))
