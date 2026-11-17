"""Siapkan masukan build_lintas/build_gapeka_seed untuk GAPEKA 2025 dari sumber 2025 yang tersedia."""
import json, collections
# 1) Daftar Waktu 2025: jadwal2025.tsv (hasil ekstraksi DW 2025, seed app v3) -> format dw_*.json
BOOK = {'DW Antar Kota Jawa': ('jawa', 'DW KA Antar Kota Jawa 2025'), 'DW Barang Jawa': ('jawa', 'DW KA Barang Jawa 2025'),
        'DW KRL Jawa': ('jawa', 'DW KA KRL Jawa 2025'), 'DW Perkotaan Jawa': ('jawa', 'DW KA Perkotaan Jawa 2025'),
        'DW Sumatera Utara': ('sum', 'DW KA Sumatera Utara 2025'), 'DW Sumatera Barat': ('sum', 'DW KA Sumatera Barat 2025'),
        'DW Sumatera Selatan': ('sum', 'DW KA Sumatera Selatan 2025')}
out = {'jawa': collections.OrderedDict(), 'sum': collections.OrderedDict()}
cur = {}
for line in open('/home/claude/g26/jadwal2025.tsv', encoding='utf-8'):
    c = line.rstrip('\n').split('\t')
    no, nama, rel, urut, kode, nst, dat, brk, ket, _, src = c[:11]
    reg, book = BOOK[src]
    key = (book, no, rel)
    if key not in cur:
        k = dict(no=no, nama=nama, relasi=rel, rows=[], status='terverifikasi'); cur[key] = k
        out[reg].setdefault(book, []).append(k)
    t = lambda x: (x + ':00') if len(x) == 5 else x
    cur[key]['rows'].append(dict(urut=int(urut), nama=nst, kode=kode, vmax='', dat=t(dat) if dat else '', brk=t(brk) if brk else '', ket=ket))
json.dump(out['jawa'], open('dw_jawa.json', 'w'), ensure_ascii=False)
json.dump(out['sum'], open('dw_sumatera.json', 'w'), ensure_ascii=False)
print('KA Jawa', sum(len(v) for v in out['jawa'].values()), 'Sumatera', sum(len(v) for v in out['sum'].values()))
# kode yang benar-benar dilayani di DW 2025 -> hanya ini yang boleh disisipkan dari sumbu lembar
json.dump(sorted({r['kode'] for d in out.values() for ks in d.values() for k in ks for r in k['rows']}), open('kode_ada.json', 'w'))
# 2) Judul lintas per lembar 2025: teks judul lembar 2025 bila ada; lembar tanpa lapisan teks judul -> judul 2026 (ditandai)
L26 = json.load(open('/home/claude/g26/lembar_judul.json'))
F25 = {'I-1': 'Daop 1 Jakarta', 'I-2': 'Daop 1 Jakarta', 'I-3': 'Daop 1 Jakarta', 'II-1': 'Daop 2 Bandung', 'II-2': 'Daop 2 Bandung', 'III': 'Daop 3 Cirebon',
       'IV': 'Daop 4 Semarang', 'V': 'Daop 5 Purwokerto', 'VI': 'Daop 6 Yogyakarta', 'VII': 'Daop 7 Madiun', 'VIII-1': 'Daop 8 Surabaya', 'VIII-2': 'Daop 8 Surabaya',
       'IX': 'Daop 9 Jember', 'Divre I': 'DIVRE I SUMUT', 'Divre II': 'DIVRE II SUMBAR', 'Divre III': 'DIVRE III PG', 'Divre IV': 'DIVRE IV TNK'}
TEKS25 = {   # judul lintas yang tercetak pada lembar 2025 (pdftotext; lihat tools/judul25.py)
    'I-2': ['JAKK - TPK', 'TPK - KMO', 'JAKK - KMO - JNG', 'JAKK - MRI - JNG', 'JNG - BKS', 'BKS - CKP'],
    'I-3': ['KPB - DU - MRI', 'JAKK - MRI - CTA - BOO', 'BOP - CCR'],
    'VII': ['WK - MR', 'KERTOSONO - WLINGI']}
NOTEXT = {'II-1', 'VI', 'VIII-2'}   # lembar 2025 hasil pindai / judul tidak ada di lapisan teks
L25 = []
for sh in L26:
    s = dict(sh); s['berkas_sumbu'] = sh['berkas']; s['berkas'] = 'Lembar Gapeka 2025 - %s.pdf' % F25[sh['lembar']]
    if sh['lembar'] == 'Divre I': s['lintas'] = [t for t in sh['lintas'] if t != 'MUARA SATU - KUTABLANG']   # tidak tercetak di lembar 2025
    if sh['lembar'] in TEKS25: s['lintas'] = TEKS25[sh['lembar']]
    s['judul_sumber'] = 'mengikuti judul GAPEKA 2026 (lembar 2025 tanpa lapisan teks judul)' if sh['lembar'] in NOTEXT else 'teks lembar GAPEKA 2025'
    L25.append(s)
json.dump(L25, open('lembar_judul.json', 'w'), ensure_ascii=False, indent=0)
