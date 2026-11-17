import re, json
D = json.load(open('dw_jawa.json'))
files = {'DW KA PNP Intercity Jawa 2026': 'dw1', 'DW KA Lokal Jawa 2026': 'dw2', 'DW KA Barang Jawa 2026': 'dw3', 'DW Commuter Line 2026': 'dw4'}
TOC = re.compile(r"^\s*\d{1,4}\s+(\d[\dA-Z]*(?:-\d[\dA-Z]*)*)\s+.*?\s(\d{2}:\d{2})\s+(\d{2}:\d{2})(?:\s+[\d\s'-]{1,12})?\s*$")
tot = {}
for label, f in files.items():
    toc = {}
    for s in open('txt/%s.txt' % f, encoding='utf-8', errors='replace'):
        m = TOC.match(s.replace('\f', ''))
        if m: toc.setdefault(m.group(1), (m.group(2), m.group(3)))
    kas = {}
    for k in D[label]: kas.setdefault(k['no'], k)
    dup = len(D[label]) - len(kas)
    def has(n):
        return n in kas or all(c in kas for c in n.split('-'))
    miss = [n for n in toc if not has(n)]
    comp = {c for n in toc for c in n.split('-')}
    extra = [n for n in kas if n not in toc and n not in comp]
    mism = []
    for n, (b, d) in toc.items():
        parts = [kas.get(c) for c in ([n] if n in kas else n.split('-'))]
        if not all(parts): continue
        fb = next((r['brk'] for r in parts[0]['rows'] if re.match(r'\d', r['brk'])), '')[:5]
        ld = next((r['dat'] for r in reversed(parts[-1]['rows']) if re.match(r'\d', r['dat'])), '')[:5]
        if fb != b or ld != d: mism.append((n, b, d, fb, ld))
    print(label, '| daftar isi:', len(toc), '| terbaca:', len(kas), '| duplikat blok:', dup, '| tidak terbaca:', len(miss), miss[:10], '| tak di daftar isi:', len(extra), extra[:10], '| jam beda:', len(mism), mism[:6])
