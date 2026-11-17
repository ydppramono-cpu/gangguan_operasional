"""Parser DW Sumatera 2026 hasil OCR + koreksi terkendali:
- nomor KA dikoreksi HANYA bila cocok unik dengan Buku Penomoran (relasi + jam berangkat awal + jam datang akhir);
- kode stasiun dikoreksi HANYA bila nama stasiun cocok persis dengan kamus (DW/matriks jarak) dan kodenya berbeda;
- setiap koreksi dicatat; baris yang tetap meragukan ditandai."""
import re, json, collections, sys
T = r'(?:\d{1,2}[:.]\d{2}[:.]\d{2}|\d{4}:\d{2}|\d{1,2}[:.]\d{2})'
HDR = re.compile(r'^\s*(?:\d\.\s*)?KA\s+(\S+(?:\s*-\s*\S+)*)\s+\((.+?)\)\s+Relasi\s+(.+?)\s*$')
ROW = re.compile(r'^\s*[|(]?(\d{1,3})\s+(.+?)\s*\(([A-Za-z0-9 ]{1,8})\)\s*(\d{1,3}|-)?\s+(Ls|Berh|-|' + T + r')\s+(Sb|-|\'|' + T + r')\s*(.*)$')
WRAP = re.compile(r'^\s*[|(]?(\d{1,3})\s+([A-Za-z][A-Za-z .]+?)\s+(\d{1,3}|-)\s+(Ls|Berh|-|' + T + r')\s*(Sb|-|\'|' + T + r')?\s*(.*)$')
def fixt(t):
    if not re.match(r'^\d', t): return t
    t = t.replace('.', ':')
    if re.match(r'^\d{4}:\d{2}$', t): t = t[:2] + ':' + t[2:]   # titik dua hilang saat OCR: HHMM:SS
    p = t.split(':')
    return '%02d:%s:%s' % (int(p[0]), p[1], p[2] if len(p) > 2 else '00')
def norm(s): return re.sub(r'[^a-z0-9]', '', s.lower())
def parse(path, label):
    L = open(path, encoding='utf-8', errors='replace').read().split('\n')
    out, cur, bad = [], None, []
    for i, s in enumerate(L):
        m = HDR.match(s)
        if m:
            nxt = ' '.join(L[i + 1:i + 4])
            if 'Kecepatan' in nxt or 'Stasiun' in nxt or 'Perhentian' in nxt:
                cur = dict(no=m.group(1).replace(' ', ''), nama=m.group(2).strip(), relasi=re.sub(r'\s*-\s*', '-', m.group(3).strip()), rows=[], line=i + 1)
                out.append(cur)
            continue
        if cur is None: continue
        r = ROW.match(s)
        if r:
            cur['rows'].append(dict(urut=int(r.group(1)), nama=r.group(2).strip(), kode=r.group(3).strip().upper(), vmax=r.group(4) or '', dat=fixt(r.group(5)), brk=fixt(r.group(6).replace("'", '-')), ket=re.sub(r'\s+', ' ', r.group(7).strip()), line=i + 1))
        elif WRAP.match(s) and re.match(r'^\s*([A-Za-z][A-Za-z .]*?)\s*\(([A-Za-z0-9 ]{1,8})\)\s*$', L[i + 1] if i + 1 < len(L) else ''):
            r = WRAP.match(s); m2 = re.match(r'^\s*([A-Za-z][A-Za-z .]*?)\s*\(([A-Za-z0-9 ]{1,8})\)\s*$', L[i + 1])
            cur['rows'].append(dict(urut=int(r.group(1)), nama=r.group(2).strip() + ' ' + m2.group(1).strip(), kode=m2.group(2).strip().upper(), vmax=r.group(3), dat=fixt(r.group(4)), brk=fixt((r.group(5) or '-').replace("'", '-')), ket=re.sub(r'\s+', ' ', r.group(6).strip()), line=i + 1))
        elif re.match(r'^\s*\d{1,3}\s+[A-Z]', s) and '(' in s:
            bad.append((cur['no'], i + 1, s.strip()[:100]))
    return out, bad
if __name__ == '__main__':
    pen = [p for p in json.load(open('penomoran.json')) if p['wilayah'] != 'Jawa']
    code2name = json.load(open('code2name.json'))
    jar = json.load(open('jarak_lintas.json'))
    known = set(code2name) | {c for m in jar for c in m['kode']}
    nospace = {k.replace(' ', ''): k for k in known}
    name2code = {}
    for c, n in code2name.items(): name2code.setdefault(norm(n), c)
    log = []; res = {}
    for f, label, w in [('txt/ocr_sumut.txt', 'DW KA Divre I Sumut 2026', 'Sumut'), ('txt/ocr_sumbar.txt', 'DW KA Divre II Sumbar 2026', 'Sumbar'), ('txt/ocr_sumsel.txt', 'DW KA Divre III-IV Sumsel 2026', 'Sumsel')]:
        kas, bad = parse(f, label)
        P = [p for p in pen if p['wilayah'] == w]
        pno = {p['no'] for p in P}
        for k in kas:
            # urutan & kelengkapan baris
            k['masalah'] = []
            for a, r in enumerate(k['rows']):
                if r['urut'] != a + 1: k['masalah'].append('urut %d di posisi %d' % (r['urut'], a + 1))
            # koreksi kode stasiun lewat nama
            for r in k['rows']:
                n = norm(r['nama'])
                if r['kode'] not in known and r['kode'].replace(' ', '') in nospace: r['kode'] = nospace[r['kode'].replace(' ', '')]
                if r['kode'] not in known and n in name2code:
                    log.append((label, k['no'], 'kode', r['kode'], name2code[n], r['nama'])); r['kode'] = name2code[n]
                elif r['kode'] not in known:
                    k['masalah'].append('kode tak dikenal %s (%s)' % (r['kode'], r['nama']))
            # koreksi nomor KA lewat penomoran
            fb = next((r['brk'][:5] for r in k['rows'] if re.match(r'\d', r['brk'])), '')
            ld = next((r['dat'][:5] for r in reversed(k['rows']) if re.match(r'\d', r['dat'])), '')
            k['fb'], k['ld'] = fb, ld
            if k['no'] not in pno:
                c = [p for p in P if p['brk'] == fb and p['lintas'].split('-')[0] == k['relasi'].split('-')[0]]
                c = c if len(c) == 1 else [p for p in c if p['dat'] == ld]
                if len(c) == 1:
                    log.append((label, k['no'], 'nomor KA', k['no'], c[0]['no'], k['relasi'])); k['no'] = c[0]['no']
                else: k['masalah'].append('nomor KA tak cocok penomoran (%d kandidat)' % len(c))
        # buang blok duplikat (daftar isi tercetak dua kali) — simpan yang barisnya lengkap
        uniq = collections.OrderedDict()
        for k in kas:
            if k['rows'] and (k['no'] not in uniq or len(k['rows']) > len(uniq[k['no']]['rows'])): uniq[k['no']] = k
        kas = list(uniq.values())
        # validasi jam vs penomoran
        jam, hilang, cocok = [], [], 0
        for p in P:
            parts = [p['no']] if p['no'] in uniq else p['no'].split('-')
            if not all(x in uniq for x in parts):
                if not p['kelas'].startswith('DINAS'): hilang.append(p['no'])
                continue
            fb, ld = uniq[parts[0]]['fb'], uniq[parts[-1]]['ld']
            if fb != p['brk'] or ld != p['dat']: jam.append((p['no'], fb, ld, p['brk'], p['dat']))
            else: cocok += 1
        # status per KA: terverifikasi bila (a) tanpa masalah, (b) jam naik monoton (lintas tengah malam boleh sekali),
        # (c) jam awal/akhir cocok penomoran (langsung atau sebagai bagian nomor gabungan)
        okno = set()
        for p in P:
            parts = [p['no']] if p['no'] in uniq else p['no'].split('-')
            if all(x in uniq for x in parts) and uniq[parts[0]]['fb'] == p['brk'] and uniq[parts[-1]]['ld'] == p['dat']: okno.update(parts)
        def mono(k):
            t = [int(x[:2]) * 3600 + int(x[3:5]) * 60 + int(x[6:8]) for r in k['rows'] for x in (r['dat'], r['brk']) if re.match(r'^\d\d:\d\d:\d\d$', x)]
            turun = sum(1 for a, b in zip(t, t[1:]) if b < a)
            return turun == 0 or (turun == 1 and max(t) - min(t) > 12 * 3600)
        for k in kas:
            if not mono(k): k['masalah'].append('urutan jam tidak naik')
            k['status'] = 'terverifikasi' if (k['no'] in okno and not [m for m in k['masalah'] if not m.startswith('urut ')]) and mono(k) else 'periksa'
        print('   status:', collections.Counter(k['status'] for k in kas))
        res[label] = kas
        print(label, 'KA:', len(kas), 'baris:', sum(len(k['rows']) for k in kas), '| baris OCR gagal:', len(bad), '| blok bermasalah:', sum(1 for k in kas if k['masalah']), '| jam awal-akhir cocok penomoran:', cocok, '| beda:', len(jam), '| KA penomoran (non-dinas) tak ada:', len(hilang), hilang[:15])
        for b in bad[:6]: print('    gagal:', b)
        for k in [k for k in kas if k['masalah']][:6]: print('    masalah:', k['no'], k['masalah'][:3])
        for j in jam[:6]: print('    jam:', j)
    json.dump(res, open('dw_sumatera.json', 'w'), ensure_ascii=False)
    json.dump(log, open('dw_sumatera_koreksi.json', 'w'), ensure_ascii=False, indent=0)
    print('koreksi:', collections.Counter(x[2] for x in log))
