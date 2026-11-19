"""Ekspor semua data yang TIDAK tinggal di Google Sheets menjadi CSV UTF-8 siap DBeaver/BigQuery.

Data yang tinggal di Sheets (Gangguan_Induk, THI, RHI, WKP, Passenger, Freight, Hambatan_Jasum, MASTER GAPEKA,
Sarana SAP, GAPEKA_2025/2026_Basis_Data, ...) diekspor oleh platform/Platform.gs `mirrorCsv()` ke folder Drive
05_DBEAVER_Mirror_CSV — bukan oleh skrip ini.

Pemakaian:
  node tools/csv/dump_seeds.js <kerja>
  python3 tools/csv/export_csv.py --kerja <kerja> --g25 <folder tabel 2025> --g26 <folder tabel 2026> \
      --stasiun <data_station.csv> --karakteristik <data_characteristic_sarana.csv> --keluar <folder csv>
Berkas > 2,8 MB dipecah (_bag1, _bag2, ...) dengan header di setiap bagian (batas unggah Drive lewat konektor).
"""
import argparse, csv, glob, hashlib, io, json, os, re, shutil

ap = argparse.ArgumentParser()
for a in ['kerja', 'g25', 'g26', 'stasiun', 'karakteristik', 'keluar']: ap.add_argument('--' + a, required=True)
ap.add_argument('--list_stasiun', help='CSV LIST STASIUN dari MASTER GAPEKA 2025 (kode_stasiun,nama_stasiun,wilayah,status)')
A = ap.parse_args()
S = json.load(open(os.path.join(A.kerja, 'seeds.json'), encoding='utf-8'))
os.makedirs(A.keluar, exist_ok=True)
MAN = []
LIMIT = 2_800_000

def write(name, header, rows, sumber, kunci):
    buf = io.StringIO(); w = csv.writer(buf, lineterminator='\n'); w.writerow(header)
    n = 0
    for r in rows: w.writerow(['' if v is None else v for v in r]); n += 1
    data = buf.getvalue().encode('utf-8')
    parts = []
    if len(data) <= LIMIT: parts = [(name + '.csv', data)]
    else:
        lines = data.split(b'\n'); head = lines[0] + b'\n'; cur = head; k = 1
        for ln in lines[1:]:
            if not ln: continue
            if len(cur) + len(ln) + 1 > LIMIT: parts.append(('%s_bag%d.csv' % (name, k), cur)); k += 1; cur = head
            cur += ln + b'\n'
        parts.append(('%s_bag%d.csv' % (name, k), cur))
    for fn, b in parts: open(os.path.join(A.keluar, fn), 'wb').write(b)
    MAN.append([name, n, len(header), len(parts), sumber, kunci, hashlib.sha256(data).hexdigest()])

def dec(a, sc):
    x, y = a[0], a[1]; p = [(x / sc, y / sc)]
    for i in range(2, len(a), 2): x += a[i]; y += a[i + 1]; p.append((x / sc, y / sc))
    return p
wkt = lambda p: 'LINESTRING(' + ', '.join('%.5f %.5f' % q for q in p) + ')'

# --- Master tambahan (seed web app) ---
for k, nm, src, key in [('jpl', 'ref_jpl_1404', 'PDF 1404 Titik Perlintasan Sebidang + penanda 190 prioritas', 'No JPL, KM+HM'),
                        ('ops', 'ref_stasiun_dinas_ptdo2025', 'PTDO GAPEKA 2025 Bab IV', 'Kode stasiun'),
                        ('depo', 'ref_depo_ka_2025', 'Buku Duksar / Dinasan GAPEKA 2025', 'Kode stasiun, No KA'),
                        ('rujukan', 'ref_rujukan_pustaka', 'Rujukan media & ilmiah (APA)', 'ID'),
                        ('koreksi', 'ref_koreksi_data', 'Log koreksi data laporan', 'Kunci')]:
    write(nm, S[k]['header'], S[k]['rows'], src, key)

# --- Resor (PETA_WILAYAH transkripsi) ---
R = S['resor']; meta = {m[0]: m for m in R['meta']}
write('ref_resor_jr', ['kode_upt', 'wilayah', 'nama_resor', 'jml_stasiun', 'km_awal', 'km_akhir', 'stasiun'], R['meta'], R['version'], 'kode_upt')
write('ref_resor_stasiun_transkripsi', ['kode_stasiun', 'kode_upt'], list(R['st'].items()), R['version'], 'kode_stasiun')
write('ref_resor_petak', ['petak', 'kode_upt', 'tanda'], [[p, v[0], v[1]] for p, v in R['pj'].items()], R['version'] + " — tanda: b=lintas batas, t=perlu tinjau, u=ujung tak terpetakan", 'petak')

# --- Duksar 2025 ---
D = S['duksar25']; ru = []
for jenis, per in D['units'].items():
    for depo, s in per.items():
        for u in s.split(): ru.append([jenis, depo, u])
write('duksar2025_unit_siap_guna', ['jenis', 'depo', 'nomor_sarana'], ru, D['src'], 'nomor_sarana')
lk = [[d, v.get('book'), v.get('so'), v.get('perbaikan'), v.get('sg'), v.get('kmHari'), v.get('jamEff'), v.get('jamOpr'), v.get('ka')] for d, v in D['lok'].items()]
write('duksar2025_lok_dipo', ['dipo', 'buku', 'siap_operasi', 'perbaikan', 'siap_guna', 'km_per_lok_hari', 'jam_efektif', 'jam_operasi', 'ka_dilayani'], lk, D['src'], 'dipo')
tot = [[w, j] + v for w, per in D['tot'].items() for j, v in per.items()]
write('duksar2025_rekap', ['wilayah', 'jenis'] + D['cols'], tot, D['src'], 'wilayah, jenis')

# --- Peta OSM ---
P = S['peta']
write('peta_stasiun_koordinat', ['kode_stasiun', 'lat', 'lon', 'elevasi_m', 'sumber'], [[k, v[0], v[1], v[2], P['stSrc'][v[3]] if v[3] is not None and v[3] < len(P['stSrc']) else 'interpolasi km LIST PETAK'] for k, v in P['st'].items()], P['version'], 'kode_stasiun')
write('peta_petak_atribut_osm', ['petak', 'km_osm', 'cocok_jarak', 'jml_jembatan', 'panjang_jembatan_m', 'jml_terowongan', 'panjang_terowongan_m', 'persen_elektrifikasi', 'vmax_osm_kmj', 'nama_lintas_osm'],
      [[k] + v[:8] + [P['nm'][v[8]][0] if v[8] is not None and v[8] < len(P['nm']) else ''] for k, v in P['pk'].items()], P['version'] + ' · ' + P['lic'], 'petak')
write('peta_petak_geometri', ['petak', 'wkt'], [[k, wkt(dec(g, 1e4))] for k, g in P['pg'].items()], P['version'] + ' · ' + P['lic'], 'petak')
write('peta_jalur_osm', ['id', 'listrik', 'nama_lintas_osm', 'wkt'], [[i, l[0], P['nm'][l[1]][0] if l[1] < len(P['nm']) else '', wkt(dec(l[2], 1e4))] for i, l in enumerate(P['ln'])], P['version'] + ' · ' + P['lic'], 'id')

# --- GAPEKA 2025 / 2026 (tabel hasil ekstraksi) ---
for th, folder in [('2025', A.g25), ('2026', A.g26)]:
    for f in sorted(glob.glob(os.path.join(folder, '*_%s.csv' % th))):
        nm = os.path.basename(f)[:-4]
        if nm == 'sarana_unit_2026' or '__' in nm: continue   # per-buku = duplikat tabel gabungan
        rows = list(csv.reader(open(f, encoding='utf-8')))
        if len(rows) < 2: continue   # tabel kosong (mis. Duksar 2025 ada di seed tersendiri)
        write('gapeka%s_%s' % (th[2:], nm.replace('_' + th, '')), rows[0], rows[1:], 'GAPEKA %s (buku resmi; ekstraksi tools/gapeka2026)' % th, 'lihat kolom')
rows = list(csv.reader(open(os.path.join(os.path.dirname(__file__), '../../db/gapeka2026/sarana_unit_2026.csv'), encoding='utf-8')))
write('duksar2026_sarana_unit', rows[0], rows[1:], 'Buku Duksar GAPEKA 2026', 'nomor_sarana')

# --- Berkas baru 19 Nov 2026 ---
ST = list(csv.DictReader(open(A.stasiun, encoding='utf-8'), delimiter=';'))
upt = lambda s: (re.search(r'JR\s+(\d+\.\d+)', s) or [None, ''])[1]
write('ref_stasiun_resor_resmi', ['daop_code', 'daop', 'resort_code', 'kode_upt', 'resort_name', 'resort_desc', 'kode_stasiun', 'nama_stasiun', 'lat', 'lon'],
      [[r['daop_code'], r['daop_desc'], r['resort_code'], upt(r['resort_name']), re.sub(r'\s+', ' ', r['resort_name']), r['resort_desc'], r['stasiun'], r['station_name'], r['latitude'], r['longitude']] for r in ST],
      'data_station.csv (ekspor sistem KAI, Daop 4–6, diterima 19 Nov 2026)', 'kode_stasiun')
DROP = {'EXPUJI', 'TGL_SRTF', 'FST_SERTF', ''}   # uji berkala tidak dipakai (keputusan 19 Nov 2026)
U, codes, names = {}, [], {}
for r in csv.DictReader(open(A.karakteristik, encoding='utf-8', errors='replace'), delimiter=';'):
    c = r['char_code']
    if c in DROP: continue
    if c not in names: names[c] = r['char_name']; codes.append(c)
    u = U.setdefault(r['no_sarana'], {'_eq': r['equipment_number'], '_desc': r['equipment_desc']})
    v = r['value_numeric'] if r['value_numeric'] not in ('', '0.0') or not r['value_char'] else r['value_char']
    u[c] = r['value_char'] if r['value_char'] and r['value_char'] != '0,000' and c in ('MRKG', 'MDGENSET', 'SUPR') else v
write('sarana_karakteristik', ['nomor_sarana', 'equipment_number', 'equipment_desc'] + [c.lower() for c in codes],
      [[n, u['_eq'], u['_desc']] + [u.get(c, '') for c in codes] for n, u in sorted(U.items())],
      'data_characteristic_sarana.csv (SAP, diterima 19 Nov 2026); kolom uji berkala dibuang; nama kolom: ' + '; '.join('%s=%s' % (c.lower(), names[c]) for c in codes), 'nomor_sarana')

# --- Master stasiun gabungan ---
off = {r['stasiun']: r for r in ST}
gst, gwil, ka25, ka26 = {}, {}, set(), set()
for th, G in [('2026', S['g26']), ('2025', S['g25'])]:
    for l in G['lintas']:
        for s in l['st']: gst.setdefault(s[0], s[1]); gwil.setdefault(s[0], l['wilayah'])
    for k in G['ka']:
        for p in k['pts']: (ka26 if th == '2026' else ka25).add(p[0])
seedst = dict(R['st'])  # objek kode -> kode_upt
dwn = {}   # nama stasiun dari Buku Daftar Waktu (cadangan bila tidak ada di lembar)
for f in [os.path.join(A.g26, 'jadwal_dw_2026.csv'), os.path.join(A.g25, 'jadwal_dw_2025.csv')]:
    for r in csv.DictReader(open(f, encoding='utf-8')):
        if r['nama_stasiun']: dwn.setdefault(r['kode_stasiun'], r['nama_stasiun'])
LS = {r['kode_stasiun']: r for r in csv.DictReader(open(A.list_stasiun, encoding='utf-8'))} if A.list_stasiun else {}
allc = sorted(set(off) | set(LS) | set(seedst) | set(gst) | set(P['st']) | ka25 | ka26)
out = []
for c in allc:
    o = off.get(c); ps = P['st'].get(c); u = upt(o['resort_name']) if o else seedst.get(c, '')
    m = meta.get(u)
    lat, lon, ks = (o['latitude'], o['longitude'], 'resmi data_station') if o and o['latitude'] else ((ps[0], ps[1], 'peta (' + (P['stSrc'][ps[3]] if ps[3] is not None and ps[3] < len(P['stSrc']) else 'interpolasi') + ')') if ps else ('', '', ''))
    ls = LS.get(c, {})
    out.append([c, (o['station_name'] if o else ls.get('nama_stasiun') or gst.get(c) or dwn.get(c, '')), (o['daop_desc'] if o else (ls.get('wilayah') or (m[1] if m else gwil.get(c, '')))), ls.get('status', ''), u, (m[2] if m else ''),
                'resmi data_station' if o else ('transkripsi PETA_WILAYAH' if c in seedst else ''), lat, lon, ks, ps[2] if ps else '',
                int(c in ka25), int(c in ka26)])
write('master_stasiun', ['kode_stasiun', 'nama_stasiun', 'wilayah', 'status_master', 'kode_upt', 'nama_resor', 'sumber_upt', 'lat', 'lon', 'sumber_koordinat', 'elevasi_m', 'dilayani_gapeka2025', 'dilayani_gapeka2026'],
      out, 'gabungan: data_station (resmi) > LIST STASIUN MASTER GAPEKA 2025 > transkripsi PETA_WILAYAH; nama lembar/DW GAPEKA; koordinat resmi > peta OSM', 'kode_stasiun')

write('_manifest', ['tabel', 'baris', 'kolom', 'berkas', 'sumber', 'kunci', 'sha256'], MAN, '', '')
print('\n'.join('%-36s %7d baris %2d kolom %d berkas' % (m[0], m[1], m[2], m[3]) for m in MAN))
