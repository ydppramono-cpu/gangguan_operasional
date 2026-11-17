"""Parser Buku Daftar Waktu GAPEKA 2026 (Jawa; PDF berteks, pdftotext -layout)."""
import re, sys, json, collections
HDR = re.compile(r'^\s*KA\s+(\S+(?:\s*-\s*\S+)*)\s+\((.+?)\)\s+Relasi\s+(.+?)\s*$')
ROW = re.compile(r'^\s*(\d{1,3})\s+(.+?)\s+\(([A-Z0-9]{1,6})\)\s+(\d{1,3}|-)\s+(Ls|Berh|-|\d{1,2}:\d{2}(?::\d{2})?)\s+(Sb|-|\d{1,2}:\d{2}(?::\d{2})?)\s*(.*)$')
NONAME = re.compile(r'^\s*(\d{1,3})\s+(\d{1,3}|-)\s+(Ls|Berh|-|\d{1,2}:\d{2}(?::\d{2})?)\s+(Sb|-|\d{1,2}:\d{2}(?::\d{2})?)\s*(.*)$')
def parse(path, label):
    L = open(path, encoding='utf-8', errors='replace').read().split('\n')
    out, cur, bad, page = [], None, [], 0
    for i, s in enumerate(L):
        if '\f' in s: page += s.count('\f')
        s = s.replace('\f', '')
        m = HDR.match(s)
        if m:
            nxt = ' '.join(L[i+1:i+4])
            if 'Kecepatan' in nxt or 'Stasiun dan Perhentian' in nxt:
                cur = dict(no=m.group(1).replace(' ', ''), nama=m.group(2).strip(), relasi=re.sub(r'\s*-\s*', '-', m.group(3).strip()), rows=[], page=page + 1)
                out.append(cur)
            continue
        if cur is None: continue
        r = ROW.match(s)
        if r:
            urut = int(r.group(1))
            exp = len(cur['rows']) + 1
            if urut != exp:
                bad.append((label, cur['no'], 'urut %d diharapkan %d' % (urut, exp), i + 1))
            cur['rows'].append(dict(urut=urut, nama=r.group(2).strip(), kode=r.group(3), vmax=r.group(4), dat=r.group(5), brk=r.group(6), ket=re.sub(r'\s+', ' ', r.group(7).strip()), line=i + 1))
        elif NONAME.match(s):
            r = NONAME.match(s)
            nm = (L[i-1].replace('\f', '').strip() + ' ' + L[i+1].replace('\f', '').strip()).strip()
            mc = re.match(r'^(.*?)\s*\(([A-Z0-9]{1,6})\)\s*$', nm)
            urut = int(r.group(1)); exp = len(cur['rows']) + 1
            if not mc or urut != exp:
                bad.append((label, cur['no'], 'nama terbungkus tak terbaca: ' + nm[:80], i + 1)); continue
            cur['rows'].append(dict(urut=urut, nama=mc.group(1).strip(), kode=mc.group(2), vmax=r.group(2), dat=r.group(3), brk=r.group(4), ket=re.sub(r'\s+', ' ', r.group(5).strip()), line=i + 1))
        elif re.match(r'^\s*\d{1,3}\s+\S.*\([A-Z0-9]+\)', s):
            bad.append((label, cur['no'], 'baris tak terbaca: ' + s.strip()[:90], i + 1))
    return out, bad
if __name__ == '__main__':
    res = {}
    for path, label in [('txt/dw1.txt', 'DW KA PNP Intercity Jawa 2026'), ('txt/dw2.txt', 'DW KA Lokal Jawa 2026'), ('txt/dw3.txt', 'DW KA Barang Jawa 2026'), ('txt/dw4.txt', 'DW Commuter Line 2026')]:
        kas, bad = parse(path, label)
        res[label] = kas
        print(label, 'KA:', len(kas), 'baris:', sum(len(k['rows']) for k in kas), 'masalah:', len(bad))
        for b in bad[:8]: print('   ', b)
        empty = [k['no'] for k in kas if len(k['rows']) < 2]
        if empty: print('   KA <2 baris:', empty[:20], len(empty))
    json.dump(res, open('dw_jawa.json', 'w'), ensure_ascii=False)
