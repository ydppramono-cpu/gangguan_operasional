"""Gabungkan hasil ekstraksi GAPEKA -> gapekaYY.json (dipakai web app: grafik perjalanan / Marey) + tabel datar.
Tahun dari env TAHUN (bawaan 2026); keterangan sumber dari meta_gapeka.json di folder kerja bila ada."""
import json, re, collections, csv, os
TAHUN = os.environ.get('TAHUN', '2026')
META = json.load(open('meta_gapeka.json')) if os.path.exists('meta_gapeka.json') else {}
def sec(t):
    m = re.match(r'^(\d{1,2}):(\d{2})(?::(\d{2}))?$', t or '')
    return int(m.group(1)) * 3600 + int(m.group(2)) * 60 + int(m.group(3) or 0) if m else -1
pen = json.load(open('penomoran.json'))
pmap = {}
for p in pen:
    for n in [p['no']] + p['no'].split('-'): pmap.setdefault(n, p)
def kat(kelas):
    k = kelas.upper()
    if k.startswith('BARANG'): return 'barang'
    if k.startswith('COMMUTER LINE'): return 'krl'
    if any(x in k for x in ('LOKAL', 'FEEDER', 'BANDARA', 'KRD')): return 'lokal'
    if k.startswith('DINAS'): return 'dinas'
    return 'pjj'
lintas = json.load(open('marey_lintas.json'))
dw = json.load(open('dw_jawa.json')); dws = json.load(open('dw_sumatera.json'))
code_ns = {}
for L in lintas:
    for s in L['stasiun']: code_ns[s['kode'].replace(' ', '')] = s['kode']
ka, flat = [], []
names = {}
for book, ks in list(dw.items()) + list(dws.items()):
    for k in ks:
        p = pmap.get(k['no'])
        ver = k.get('status', 'terverifikasi')
        pts = []
        for r in k['rows']:
            c = code_ns.get(r['kode'].replace(' ', ''), r['kode'])
            names.setdefault(c, r['nama'])
            d, b = sec(r['dat']), sec(r['brk'])
            pts.append([c, d, b])
            flat.append([k['no'], k['nama'], k['relasi'], r['urut'], c, r['nama'], r['vmax'], r['dat'], r['brk'], r['ket'], book, ver])
        ka.append(dict(no=k['no'], nama=k['nama'], relasi=k['relasi'], kelas=p['kelas'] if p else '', kat=kat(p['kelas']) if p else 'lainnya',
                       f=1 if (p and p['status'] == 'FAKULTATIF') or k['no'].endswith('F') else 0, src=book, v=1 if ver == 'terverifikasi' else 0, pts=pts))
for L in lintas:
    for s in L['stasiun']:
        if not s['nama'] and s['kode'] in names: s['nama'] = names[s['kode']]
out = dict(meta=dict(tahun=TAHUN, sumber=META.get('sumber', 'GAPEKA 2026 (KP-DJKA 116 Tahun 2026, 30 Oktober 2026); berlaku 1 Desember 2026'),
                     catatan=META.get('catatan', ''), buku=sorted({k['src'] for k in ka}), dibuat=META.get('dibuat', '17 Nov 2026')),
           lintas=[dict(id=L['id'], lembar=L['lembar'], wilayah=L['wilayah'], judul=L['judul'], halaman=L['halaman'], berkas=L['berkas'],
                        sumber=L['sumber_jarak'], js=L.get('judul_sumber', ''), st=[[s['kode'], s['nama'], s['km']] for s in L['stasiun']]) for L in lintas],
           ka=ka)
json.dump(out, open('gapeka%s.json' % TAHUN[2:], 'w'), ensure_ascii=False, separators=(',', ':'))
os.makedirs('tabel', exist_ok=True)
with open('tabel/jadwal_dw_%s.csv' % TAHUN, 'w', newline='', encoding='utf-8') as fh:
    w = csv.writer(fh); w.writerow(['no_ka', 'nama_ka', 'relasi', 'urut', 'kode_stasiun', 'nama_stasiun', 'vmax_kmj', 'datang', 'berangkat', 'keterangan', 'sumber_buku', 'status_verifikasi']); w.writerows(flat)
with open('tabel/penomoran_ka_%s.csv' % TAHUN, 'w', newline='', encoding='utf-8') as fh:
    w = csv.writer(fh); keys = ['wilayah', 'kelas', 'no', 'status', 'nama', 'identitas', 'lintas', 'penyelenggara', 'jarak', 'brk', 'dat', 'waktu']
    w.writerow(['wilayah', 'kelas_ka', 'no_ka', 'status', 'nama_ka', 'nama_identitas', 'lintas', 'penyelenggara', 'jarak_km', 'berangkat', 'datang', 'waktu_tempuh'])
    for p in pen: w.writerow([p[k] for k in keys])
with open('tabel/jarak_lintas_%s.csv' % TAHUN, 'w', newline='', encoding='utf-8') as fh:
    w = csv.writer(fh); w.writerow(['wilayah', 'lintas', 'urut', 'kode_stasiun', 'km_kumulatif', 'sumber'])
    for m in json.load(open('jarak_lintas.json')):
        for i, (c, k) in enumerate(zip(m['kode'], m['km'])): w.writerow([m['wilayah'], m['judul'], i + 1, c, k, m['sumber']])
with open('tabel/lintas_lembar_%s.csv' % TAHUN, 'w', newline='', encoding='utf-8') as fh:
    w = csv.writer(fh); w.writerow(['lembar', 'wilayah', 'judul_lintas', 'urut', 'kode_stasiun', 'nama_stasiun', 'km', 'berkas_lembar'])
    for L in out['lintas']:
        for i, s in enumerate(L['st']): w.writerow([L['lembar'], L['wilayah'], L['judul'], i + 1, s[0], s[1], s[2], L['berkas']])
d = json.load(open('duksar_%s.json' % TAHUN)) if os.path.exists('duksar_%s.json' % TAHUN) else {'rekap': [], 'lok': []}   # Duksar 2025 sudah ada di 17_SeedDuksar.gs
with open('tabel/duksar_rekap_%s.csv' % TAHUN, 'w', newline='', encoding='utf-8') as fh:
    w = csv.writer(fh); w.writerow(['wilayah', 'jenis_sarana', 'siap_guna', 'siap_operasi', 'stamformasi', 'cadangan'])
    for r in d['rekap']: w.writerow([r[k] for k in ['wilayah', 'jenis_sarana', 'siap_guna', 'siap_operasi', 'stamformasi', 'cadangan']])
with open('tabel/duksar_lok_dipo_%s.csv' % TAHUN, 'w', newline='', encoding='utf-8') as fh:
    w = csv.writer(fh); w.writerow(['wilayah', 'dipo', 'jenis_lok', 'siap_guna', 'tsgo', 'tso', 'so'])
    for r in d['lok']: w.writerow([r[k] for k in ['wilayah', 'dipo', 'jenis', 'siap_guna', 'tsgo', 'tso', 'so']])
print('KA', len(ka), collections.Counter(k['kat'] for k in ka), 'terverifikasi', sum(k['v'] for k in ka), 'baris', len(flat))
print('ukuran json', os.path.getsize('gapeka%s.json' % TAHUN[2:]))
for f in sorted(os.listdir('tabel')): print(f, sum(1 for _ in open('tabel/' + f)) - 1)
