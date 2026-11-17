"""Matriks Jarak Antar Stasiun (Buku Penomoran GAPEKA 2026) -> urutan stasiun + km kumulatif per lintas.
Mendukung matriks berdampingan (dipotong per jendela kolom) dan baris nilai yang terbungkus."""
import re, json
NUM = re.compile(r'^\d{1,4},\d{1,3}$')
CODE = re.compile(r'^[A-Z][A-Z0-9]{0,5}$')
def clusters(line):
    toks = [(m.start(), m.end(), m.group()) for m in re.finditer(r'\S+', line)]
    out = []
    for t in toks:
        if t[2] == 'O/D': out.append([]); continue
        if out and out[-1] and t[0] - out[-1][-1][1] <= 14: out[-1].append(t)
        else: out.append([t])
    return [o for o in out if o]
def to_f(v):
    a, b = v.split(','); return float(a) + float(b) / (10 ** len(b))
def parse(path, wilayah):
    L = open(path, encoding='utf-8', errors='replace').read().replace('\f', '\n').split('\n')
    start = max([i for i, s in enumerate(L) if 'JARAK ANTAR STASIUN' in s.upper()] or [0])
    out = []
    for i in range(start, len(L)):
        for m in re.finditer(r'O/D', L[i]):
            c = m.start()
            same = [k for k in clusters(L[i]) if k[0][0] > c and all(CODE.match(t[2]) or re.match(r'^X\d$', t[2]) for t in k)]
            if same and (not [k for k in clusters(L[i]) if k[0][0] > c] or [k for k in clusters(L[i]) if k[0][0] > c][0] == same[0]) and same[0][0][0] - c < 30:
                j = i
            else:
                j = i - 1
                while j > start and not L[j][max(0, c - 15):c + 60].strip(): j -= 1
            # klaster header yang berada di kanan O/D
            cl = [k for k in clusters(L[j]) if k[-1][1] > c and k[0][0] >= c - 15 and k[0][0] > (c if j == i else -1)]
            if not cl: continue
            k0 = cl[0]
            ws, we = (c - 2 if j == i else max(0, c - 15)), k0[-1][1] + 14
            # batas kanan: klaster berikutnya di baris header
            nxt = [k for k in clusters(L[j]) if k[0][0] > k0[-1][1]]
            we = min(we + 10, nxt[0][0][0] - 1) if nxt else 10 ** 6
            S = lambda x: L[x][ws:we] if x < len(L) else ''
            idx = []
            for t in range(i + 1, i + 4):
                idx = [int(q) for q in S(t).split() if q.isdigit()]
                if idx: break
            n = max(idx) if idx else 0
            hdr = []
            for t in [t[2] for t in k0]:
                if hdr and (re.match(r'^X\d$', t) or hdr[-1] == 'POS'): hdr[-1] += ' ' + t
                elif CODE.match(t): hdr.append(t)
            if n < 2 or len(hdr) != n:
                print('  lewati', wilayah, i + 1, n, hdr[:5]); continue
            alias = []
            def row(code, no, lo):
                x = lo
                # label baris boleh hilang (kode terbungkus ke baris lain, mis. "KWG" di bawah baris 7)
                pat = re.compile(r'^\s*(?:(' + re.escape(code) + r'|[A-Z][A-Z0-9]{1,5})\s+)?' + str(no) + r'\s+\d{1,4},\d')   # sesudah nomor baris harus angka jarak (bukan baris indeks kolom "1 2 3")
                while x < min(len(L), lo + 4 * n + 12) and not pat.match(S(x)): x += 1
                if x < len(L) and x < lo + 4 * n + 12:
                    lab = pat.match(S(x)).group(1)
                    # label lain hanya dianggap alias bila masih di blok matriks yang sama (belum melewati header O/D matriks lain)
                    if lab and lab != code and not any('O/D' in S(t) for t in range(lo + 1, x)): alias.append((code, lab))
                if x >= len(L) or x >= lo + 4 * n + 12: return None, x
                v = [t for t in S(x).split() if NUM.match(t)]   # label & nomor baris bukan angka berkoma -> tersaring
                y = x + 1
                while len(v) < n - 1 and re.match(r'^\s+[\d,\s]+$', S(y)) and S(y).strip():
                    v += [t for t in S(y).split() if NUM.match(t)]; y += 1
                return v[:n - 1], x
            # km kumulatif = kolom 1 setiap baris r>=2 (jarak stasiun-1 ke stasiun-r); baris 1 untuk cek silang
            km, x, ok = [0.0], i + 1, True
            for r in range(2, n + 1):
                v, x = row(hdr[r - 1], r, x)
                if not v: ok = False; break
                km.append(to_f(v[0]))
            v1, _ = row(hdr[0], 1, i + 1)
            mono = lambda k: len(k) == n and all(k[a] < k[a + 1] for a in range(n - 1))
            k1 = [0.0] + [to_f(v) for v in (v1 or [])]
            if mono(k1):
                if ok and mono(km):
                    beda = [a for a in range(1, n) if abs(k1[a] - km[a]) > 0.011]
                    if beda: print('  catatan: baris-1 vs kolom-1 beda', wilayah, hdr[0], hdr[-1], [(hdr[a], k1[a], km[a]) for a in beda][:4])
                km, ok, sumber = k1, True, 'baris-1'
            else:
                ok, sumber = ok and mono(km), 'kolom-1'
            for a, b in set(alias):
                print('  catatan: header %s tertulis %s di baris (dipakai label baris)' % (a, b), wilayah, i + 1)
                hdr = [b if h == a else h for h in hdr]
            judul = ''
            for t in range(j - 1, max(start, j - 14), -1):
                mm = re.search(r'\b([A-Z]{1,5}\d?(?:\s?X\d)?(?:\s*-\s*[A-Z]{1,5}\d?(?:\s?X\d)?)+)\b', L[t][ws:we + 20])
                if mm and hdr[0].split()[0] in re.split(r'\s*-\s*', mm.group(1)): judul = re.sub(r'\s*-\s*', '-', mm.group(1)); break
            out.append(dict(wilayah=wilayah, kode=hdr, km=[round(k, 3) for k in km], judul=judul or '%s-%s' % (hdr[0], hdr[-1]), valid=ok, sumber=sumber, baris=i + 1))
            if not ok: print('  TIDAK VALID', wilayah, i + 1, hdr[0], hdr[-1], n, len(km))
    # pasangan 2-stasiun yang ditulis sebaris, mis. "JAKG-KPB   0,644"
    seen = {tuple(o['kode']) for o in out}
    for i in range(start, len(L)):
        for mm in re.finditer(r'\b([A-Z]{2,5}\d?)\s?-\s?([A-Z]{2,5}\d?)\s{2,}(\d{1,3},\d{3})\b', L[i]):
            a, b, v = mm.groups()
            if (a, b) in seen or (b, a) in seen: continue
            seen.add((a, b))
            out.append(dict(wilayah=wilayah, kode=[a, b], km=[0.0, round(to_f(v), 3)], judul='%s-%s' % (a, b), valid=True, sumber='pasangan', baris=i + 1))
    return out
if __name__ == '__main__':
    allm = []
    for f, w in [('txt/pen_1.txt', 'Jawa'), ('txt/pen_2.txt', 'Sumut'), ('txt/pen_3.txt', 'Sumbar'), ('txt/pen_4.txt', 'Sumsel')]:
        m = parse(f, w); allm += m
        print(w, 'matriks:', len(m), 'valid:', sum(x['valid'] for x in m), 'stasiun:', sum(len(x['kode']) for x in m))
    json.dump(allm, open('jarak_lintas.json', 'w'), ensure_ascii=False)
    for x in allm: print(x['wilayah'], x['judul'], len(x['kode']), x['km'][-1], x['valid'])
