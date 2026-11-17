"""Ekspor seed yang tertanam di kode (src/*.gs) menjadi tabel referensi (xlsx → Google Sheets 'KAI_Referensi_Turunan').
Tiap tabel diberi kolom sumber agar asal-usul angka dapat ditelusuri. Jalankan: python3 tools/export_seeds.py <keluaran.xlsx>"""
import re, json, gzip, base64, sys, os
from openpyxl import Workbook
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
src = lambda f: open(os.path.join(ROOT, 'src', f), encoding='utf-8').read()

def js_value(text, var):
    m = re.search(r'var %s\s*=\s*' % var, text); i = m.end()
    # ambil literal JSON sampai akhir pernyataan ';' pada kedalaman 0
    depth, j, ins, esc = 0, i, None, False
    while j < len(text):
        c = text[j]
        if ins:
            if esc: esc = False
            elif c == '\\': esc = True
            elif c == ins: ins = None
        elif c in '"\'': ins = c
        elif c in '[{': depth += 1
        elif c in ']}':
            depth -= 1
            if depth == 0: return text[i:j + 1]
        j += 1
    raise ValueError(var)

sheets = {}
# 1. Jadwal Daftar Waktu GAPEKA 2025
t = src('11_SeedJadwal.gs')
gz = ''.join(re.findall(r'"([^"]*)"', re.search(r'var SEED_JADWAL_GZ\s*=\s*\[(.*?)\]\.join', t, re.S).group(1)))
rows = [l.split('\t') for l in gzip.decompress(base64.b64decode(gz)).decode('utf-8').split('\n') if l]
sheets['jadwal_dw_2025'] = (['no_ka', 'nama_ka', 'relasi', 'urut', 'kode_stasiun', 'nama_stasiun', 'datang', 'berangkat', 'keterangan', 'catatan', 'sumber_buku'], rows,
                            'Buku Daftar Waktu GAPEKA 2025 (diekstrak per baris; seed 11_SeedJadwal.gs)')
ptdo = json.loads(js_value(t, 'SEED_PTDO'))
sheets['ptdo_2025_stasiun_tutup'] = (['kode_stasiun', 'jenis', 'mulai', 'akhir'], ptdo, 'PTDO GAPEKA 2025 Bab IV (seed 11_SeedJadwal.gs)')
depo = json.loads(js_value(t, 'SEED_DEPO_KA'))
sheets['depo_ka_2025'] = (['depo', 'kode', 'jenis', 'daftar_ka'] + ['kol_%d' % i for i in range(5, 1 + max(len(r) for r in depo))], depo, 'Duksar/PTDO GAPEKA 2025 (seed SEED_DEPO_KA)')
# 2. JPL
j = json.loads(js_value(src('10_Seed.gs'), 'SEED_JPL'))
sheets['jpl'] = (['no', 'petak', 'no_jpl', 'km', 'provinsi', 'kabupaten_kota', 'status_jalan', 'kolom_8', 'kolom_9', 'kolom_10', 'wilayah', 'kolom_12'][:max(len(r) for r in j)], j,
                 'Daftar 1.404 titik peningkatan keselamatan perlintasan sebidang (seed SEED_JPL)')
# 3. Resor
r = json.loads(js_value(src('14_SeedResor.gs'), 'SEED_RESOR'))
sheets['resor_meta'] = (['kode_resor', 'wilayah', 'nama', 'jumlah', 'km_awal', 'km_akhir', 'cakupan'], r['meta'], r['version'] + ' (PETA_WILAYAH.pdf)')
sheets['resor_stasiun'] = (['kode_stasiun', 'kode_resor'], [[k, v] for k, v in r['st'].items()], r['version'])
sheets['resor_petak'] = (['petak', 'kode_resor', 'catatan'], [[k] + list(v) for k, v in r['pj'].items()], r['version'])
# 4. Peta
p = json.loads(js_value(src('18_SeedPeta.gs'), 'SEED_PETA'))
sheets['stasiun_koordinat'] = (['kode_stasiun', 'lat', 'lon', 'elevasi_m', 'sumber_koordinat'],
                               [[k, v[0], v[1], v[2], p['stSrc'][v[3]]] for k, v in p['st'].items()], p['version'] + ' · ' + p['lic'])
sheets['petak_osm'] = (['petak', 'km_osm', 'cocok_jarak_25pct', 'jumlah_jembatan', 'panjang_jembatan_m', 'jumlah_terowongan', 'panjang_terowongan_m', 'pct_elektrifikasi', 'vmax_osm_kmj', 'nama_lintas_osm', 'wikipedia'],
                       [[k, v[0], v[1], v[2], v[3], v[4], v[5], v[6], v[7], p['nm'][v[8]][0] if v[8] >= 0 else '', p['nm'][v[8]][1] if v[8] >= 0 else ''] for k, v in p['pk'].items()], p['lic'])
# 5. Duksar
d = json.loads(js_value(src('17_SeedDuksar.gs'), 'SEED_DUKSAR'))
units = []
for kind, depos in d['units'].items():
    for depo, nos in depos.items():
        for no in nos.split():
            units.append([kind, depo, no])
sheets['duksar_unit_siap_guna'] = (['jenis', 'depo_induk', 'nomor_sarana'], units, d['src'])
lok = []
for depo, v in d['lok'].items():
    lok.append([depo] + [v.get(k) if not isinstance(v.get(k), list) else ', '.join(map(str, v.get(k))) for k in ['book', 'so', 'perbaikan', 'sg', 'kmHari', 'jamEff', 'jamOpr', 'ka']])
sheets['duksar_lok_depo'] = (['depo', 'book', 'siap_operasi', 'perbaikan', 'siap_guna', 'km_per_hari', 'jam_efektif', 'jam_operasi', 'daftar_ka'], lok, d['src'])
# 6. Rujukan & koreksi
import subprocess
ru = json.loads(subprocess.check_output(['node', '-e', "const vm=require('vm'),fs=require('fs');const c={};vm.createContext(c);vm.runInContext(fs.readFileSync(process.argv[1],'utf8'),c);"
    "console.log(JSON.stringify(vm.runInContext('({h:M_RUJUKAN_HEADER,r:SEED_RUJUKAN,kh:M_KOREKSI_HEADER,k:SEED_KOREKSI})',c)))", os.path.join(ROOT, 'src/12_SeedRujukan.gs')]))
sheets['rujukan'] = (ru['h'], ru['r'], 'Rujukan media & ilmiah terverifikasi (seed 12_SeedRujukan.gs)')
sheets['koreksi_data'] = (ru['kh'], ru['k'], 'Log koreksi data berbukti (seed 12_SeedRujukan.gs)')

wb = Workbook(); ws = wb.active; ws.title = 'README'
ws.append(['tabel', 'jumlah_baris', 'sumber', 'dibuat_oleh'])
for name, (hdr, rows, srcdesc) in sheets.items():
    ws.append([name, len(rows), srcdesc, 'tools/export_seeds.py dari kode v3.10.0'])
    w = wb.create_sheet(name); w.append(hdr)
    for row in rows:
        row = list(row) + [''] * (len(hdr) - len(row))
        w.append(['' if x is None else x for x in row[:len(hdr)]])
    w.freeze_panes = 'A2'
out = sys.argv[1] if len(sys.argv) > 1 else 'KAI_Referensi_Turunan.xlsx'
wb.save(out)
for name, (hdr, rows, s) in sheets.items(): print(name, len(rows))
