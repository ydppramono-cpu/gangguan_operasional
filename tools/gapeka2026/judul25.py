import json, re, subprocess, os, collections
D = '/home/claude/g25/src/Gapeka 2025/1. Lembar Gapeka 2025 & Legenda PDF/'
def norm(s): return re.sub(r'[^a-z0-9]', '', s.lower())
F = {'Daop 1': 'Daop 1 Jakarta', 'Daop 2': 'Daop 2 Bandung', 'Daop 3': 'Daop 3 Cirebon', 'Daop 4': 'Daop 4 Semarang', 'Daop 5': 'Daop 5 Purwokerto',
     'Daop 6': 'Daop 6 Yogyakarta', 'Daop 7': 'Daop 7 Madiun', 'Daop 8': 'Daop 8 Surabaya', 'Daop 9': 'Daop 9 Jember',
     'Divre I ': 'DIVRE I SUMUT', 'Divre II ': 'DIVRE II SUMBAR', 'Divre III': 'DIVRE III PG', 'Divre IV': 'DIVRE IV TNK'}
pages = {}
for k, v in F.items():
    fn = D + 'Lembar Gapeka 2025 - %s.pdf' % v
    n = int(re.search(r'Pages:\s+(\d+)', subprocess.run(['pdfinfo', fn], capture_output=True, text=True).stdout).group(1))
    for p in range(1, n + 1):
        t = subprocess.run(['pdftotext', '-f', str(p), '-l', str(p), fn, '-'], capture_output=True, text=True).stdout
        tl = sorted({re.sub(r'\s+', ' ', x.strip()) for x in re.findall(r'(?m)^ *([A-Z][A-Z0-9 ]+(?: - [A-Z][A-Z0-9 ]+)+) *$', t)})
        lab = re.findall(r'(?m)^\s*((?:[IVX]+-?\d?[A-F]|\d[A-C]))\s*$', t)
        pages[(k, p)] = dict(file=os.path.basename(fn), titles=tl, label=lab[:1], chars=len(t))
L26 = json.load(open('/home/claude/g26/lembar_judul.json'))
for sh in L26:
    key = next(k for k in F if (sh['wilayah'] + ' ').startswith(k) or sh['wilayah'].startswith(k.strip() + ' '))
    pg = [(p, v) for (k, p), v in pages.items() if k == key]
    alltit = {norm(t) for p, v in pg for t in v['titles']}
    print('==', sh['lembar'], '->', pg[0][1]['file'], 'hal', len(pg), 'teks', sum(v['chars'] for p, v in pg))
    for t in sh['lintas']: print('   ', 'ADA ' if norm(t) in alltit else 'TIDAK', t)
    extra = sorted({t for p, v in pg for t in v['titles'] if norm(t) not in {norm(x) for s in L26 for x in s['lintas']}})
    if extra: print('    judul 2025 lain:', extra)
json.dump({'%s|%d' % k: v for k, v in pages.items()}, open('/home/claude/g25/lembar_pages25.json', 'w'), ensure_ascii=False, indent=0)
