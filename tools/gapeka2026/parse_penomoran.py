"""Daftar KA dari Buku Penomoran GAPEKA 2026 (Jawa, Sumut, Sumbar, Sumsel)."""
import re, json, collections
ROW = re.compile(r'^\s*(\d{1,4})\s+(\S+)\s+([A-Z]+)\s+(.*?)\s+([A-Z][A-Z0-9]*(?:\s?X\d)?(?:-[A-Z][A-Z0-9]*(?:\s?X\d)?)+)\s+(.*?)\s+(\d[\d.,]*)\s+([\d.]+)\s+(\d{1,2}:\d{2})\s+(\d{1,2}:\d{2})\s+(\d{1,2}[.:]\d{2})\s*$')
def parse(path, wilayah):
    kelas, out, miss = '', [], 0
    for i, s in enumerate(open(path, encoding='utf-8', errors='replace').read().replace('\f', '\n').split('\n')):
        m = re.match(r'^\s*KELAS KERETA API\s*:\s*(.+?)(?:\s{2,}|$)', s)
        if m: kelas = m.group(1).strip(); continue
        m = ROW.match(s)
        if m:
            nm = [x for x in re.split(r'\s{2,}', m.group(4).strip()) if x]
            out.append(dict(wilayah=wilayah, kelas=kelas, no=m.group(2), status=m.group(3), nama=nm[0] if nm else '', identitas=nm[1] if len(nm) > 1 else '',
                            lintas=m.group(5).replace(' ', ' '), penyelenggara=m.group(6).strip(), jarak=m.group(7), brk=m.group(9).zfill(5), dat=m.group(10).zfill(5), waktu=m.group(11), baris=i + 1))
        elif re.match(r'^\s*\d{1,4}\s+\S+\s+(REGULER|FAKULTATIF)\b', s): miss += 1; print('  tak terbaca', wilayah, i + 1, s.strip()[:120])
    return out, miss
if __name__ == '__main__':
    allr = []
    for f, w in [('txt/pen_1.txt', 'Jawa'), ('txt/pen_2.txt', 'Sumut'), ('txt/pen_3.txt', 'Sumbar'), ('txt/pen_4.txt', 'Sumsel')]:
        r, miss = parse(f, w); allr += r
        print(w, 'KA:', len(r), 'unik:', len({x['no'] for x in r}), 'tak terbaca:', miss, collections.Counter(x['kelas'] for x in r).most_common(30))
    json.dump(allr, open('penomoran.json', 'w'), ensure_ascii=False)
