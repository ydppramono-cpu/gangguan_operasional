#!/usr/bin/env python3
"""
tools/rhi/build_rhi.py — siapkan RHI lokomotif, kereta, gerbong (ekspor harian 22 kolom) untuk Google Sheets.

Masukan : CSV ekspor RHI harian (jenis_sarana, tgl_data, nomor_sarana, … healthy_index, healthy_status, versi_formula).
Keluaran (di --out, JANGAN di repo — data operasional asli):
  rhi_lokomotif.xlsx        satu tab "RHI" = lokomotif harian apa adanya (pengganti tab RHI basis data utama)
  rhi_sarana.xlsx           spreadsheet "KAI | RHI Sarana":
                              Keterangan               asal berkas, SHA-256, jumlah baris, aturan
                              RHI_Kereta               kereta harian apa adanya
                              RHI_Kereta_Bulanan       per unit per bulan (+ status & HI harian dalam satu sel)
                              RHI_Gerbong_Bulanan      idem gerbong (harian per unit tidak muat di Sheets: 18 juta sel)
                              RHI_Harian_Depo          per tanggal × jenis × dipo × tipe: jumlah unit per status, HI rata-rata
  *.csv.gz                  arsip utuh untuk Drive 02_DB/RHI
Aturan: kunci jenis+nomor(tanpa spasi)+tanggal harus unik (ganda → berhenti); HI di luar 0–100 → berhenti;
angka ditulis sebagai bilangan (bukan teks) agar tidak terpengaruh pemisah desimal lokal Sheets.
Pakai: python3 -I tools/rhi/build_rhi.py --out DIR lok.csv kereta.csv gerbong.csv
"""
import argparse, csv, datetime as dt, gzip, hashlib, os, shutil, sys
from collections import defaultdict, OrderedDict
from openpyxl import Workbook

NUM = ['reliability_index', 'maintainability_index', 'availability_index', 'rams_index', 'maintenance_completion_score', 'spare_management_score',
       'maintenance_index', 'age_index', 'onsite_inspection_index', 'real_condition_index', 'condition_index', 'healthy_index']
ST = {'HEALTHY': 'H', 'MONITOR': 'M', 'DECLINING': 'D', 'POOR': 'P', 'CRITICAL': 'C'}


def sha(p):
    h = hashlib.sha256()
    with open(p, 'rb') as f:
        for b in iter(lambda: f.read(1 << 20), b''): h.update(b)
    return h.hexdigest()


def num(v):
    return None if v in ('', None) else float(v)


def read(p):
    rows, seen = [], set()
    with open(p, newline='', encoding='utf-8') as f:
        rd = csv.DictReader(f); head = rd.fieldnames
        for r in rd:
            k = (r['jenis_sarana'], r['nomor_sarana'].replace(' ', '').upper(), r['tgl_data'])
            if k in seen: sys.exit('Kunci ganda: %s' % (k,))
            seen.add(k)
            hi = num(r['healthy_index'])
            if hi is not None and not (0 <= hi <= 100): sys.exit('HI di luar 0–100: %s %s' % (k, hi))
            rows.append(r)
    return head, rows


def cell(h, v):
    if h == 'tgl_data': return dt.date.fromisoformat(v)
    if h in NUM: return num(v)
    if h == 'is_rhi_lengkap': return int(v) if v != '' else None
    return v


def daily_sheet(wb, title, head, rows):
    ws = wb.create_sheet(title); ws.append(head)
    for r in rows: ws.append([cell(h, r[h]) for h in head])


def monthly(rows):
    g = OrderedDict()
    for r in sorted(rows, key=lambda r: (r['nomor_sarana'], r['tgl_data'])):
        no = r['nomor_sarana'].replace(' ', '').upper(); ym = r['tgl_data'][:7]; k = (no, ym)
        x = g.get(k)
        if not x:
            y, m = int(ym[:4]), int(ym[5:]); nd = ((dt.date(y + (m == 12), m % 12 + 1, 1)) - dt.date(y, m, 1)).days
            x = g[k] = {'r': r, 'nd': nd, 'st': ['-'] * nd, 'hi': [''] * nd, 'his': [], 'cnt': defaultdict(int), 'dipo': set(), 'lengkap': 0, 'n': 0}
        d = int(r['tgl_data'][8:]) - 1; hi = num(r['healthy_index']); s = r['healthy_status'].upper()
        x['st'][d] = ST.get(s, '?'); x['hi'][d] = '' if hi is None else ('%g' % hi)
        if hi is not None: x['his'].append(hi)
        x['cnt'][s] += 1; x['dipo'].add(r['dipo']); x['lengkap'] += r['is_rhi_lengkap'] == '1'; x['n'] += 1; x['r'] = r   # r = baris tanggal terakhir
    return g


MHEAD = ['jenis_sarana', 'bulan', 'nomor_sarana', 'tipe_sarana', 'dipo', 'daop', 'dipo_lain_dalam_bulan', 'hari_data', 'hari_rhi_lengkap', 'tgl_akhir',
         'healthy_index_akhir', 'healthy_status_akhir', 'healthy_index_rata', 'healthy_index_min', 'healthy_index_maks',
         'hari_healthy', 'hari_monitor', 'hari_declining', 'hari_poor', 'hari_critical',
         'reliability_index', 'maintainability_index', 'availability_index', 'rams_index', 'maintenance_index', 'age_index',
         'onsite_inspection_index', 'condition_index', 'status_harian', 'healthy_index_harian', 'versi_formula']


def monthly_sheet(wb, title, rows):
    ws = wb.create_sheet(title); ws.append(MHEAD); n = 0
    for (no, ym), x in monthly(rows).items():
        r = x['r']; his = x['his']; other = sorted(x['dipo'] - {r['dipo']})
        ws.append([r['jenis_sarana'], ym, no, r['tipe_sarana'], r['dipo'], r['daop'], ', '.join(other), x['n'], x['lengkap'], dt.date.fromisoformat(r['tgl_data']),
                   num(r['healthy_index']), r['healthy_status'].upper(), round(sum(his) / len(his), 2) if his else None, min(his) if his else None, max(his) if his else None,
                   x['cnt']['HEALTHY'], x['cnt']['MONITOR'], x['cnt']['DECLINING'], x['cnt']['POOR'], x['cnt']['CRITICAL'],
                   num(r['reliability_index']), num(r['maintainability_index']), num(r['availability_index']), num(r['rams_index']), num(r['maintenance_index']),
                   num(r['age_index']), num(r['onsite_inspection_index']), num(r['condition_index']), ''.join(x['st']), ';'.join(x['hi']), r['versi_formula']])
        n += 1
    return n


def depo_sheet(wb, title, groups):
    ws = wb.create_sheet(title)
    ws.append(['tgl_data', 'jenis_sarana', 'dipo', 'daop', 'tipe_sarana', 'unit', 'healthy', 'monitor', 'declining', 'poor', 'critical', 'healthy_index_rata'])
    n = 0
    for rows in groups:
        g = defaultdict(lambda: {'u': 0, 'c': defaultdict(int), 's': 0.0, 'k': 0})
        for r in rows:
            x = g[(r['tgl_data'], r['jenis_sarana'], r['dipo'], r['daop'], r['tipe_sarana'])]
            x['u'] += 1; x['c'][r['healthy_status'].upper()] += 1; hi = num(r['healthy_index'])
            if hi is not None: x['s'] += hi; x['k'] += 1
        for k in sorted(g):
            x = g[k]
            ws.append([dt.date.fromisoformat(k[0]), k[1], k[2], k[3], k[4], x['u'], x['c']['HEALTHY'], x['c']['MONITOR'], x['c']['DECLINING'], x['c']['POOR'], x['c']['CRITICAL'],
                       round(x['s'] / x['k'], 2) if x['k'] else None]); n += 1
    return n


def main():
    ap = argparse.ArgumentParser(); ap.add_argument('--out', required=True); ap.add_argument('files', nargs=3); a = ap.parse_args()
    os.makedirs(a.out, exist_ok=True)
    data = {}
    for p in a.files:
        head, rows = read(p); j = rows[0]['jenis_sarana'].upper(); data[j] = (p, head, rows)
        print(j, len(rows), 'baris', min(r['tgl_data'] for r in rows), '–', max(r['tgl_data'] for r in rows))
    for j, (p, _, _) in data.items():
        dst = os.path.join(a.out, 'rhi_%s_%s.csv.gz' % (j.lower(), 'agt_okt_2026'))
        with open(p, 'rb') as f, gzip.open(dst, 'wb', 9) as g: shutil.copyfileobj(f, g)
    p, head, rows = data['LOKOMOTIF']
    wb = Workbook(write_only=True); daily_sheet(wb, 'RHI', head, rows); wb.save(os.path.join(a.out, 'rhi_lokomotif.xlsx'))
    wb = Workbook(write_only=True); ws = wb.create_sheet('Keterangan')
    pk, hk, rk = data['KERETA']; pg, hg, rg = data['GERBONG']
    daily_sheet(wb, 'RHI_Kereta', hk, rk)
    nk = monthly_sheet(wb, 'RHI_Kereta_Bulanan', rk); ng = monthly_sheet(wb, 'RHI_Gerbong_Bulanan', rg); nd = depo_sheet(wb, 'RHI_Harian_Depo', [rk, rg])
    today = dt.date.today().isoformat()
    for row in [['Hal', 'Isi'],
                ['Dibuat', today + ' oleh tools/rhi/build_rhi.py (repo gangguan_operasional)'],
                ['Sumber kereta', os.path.basename(pk) + ' · ' + str(len(rk)) + ' baris · SHA-256 ' + sha(pk)],
                ['Sumber gerbong', os.path.basename(pg) + ' · ' + str(len(rg)) + ' baris · SHA-256 ' + sha(pg)],
                ['Sumber lokomotif', os.path.basename(data['LOKOMOTIF'][0]) + ' · ' + str(len(data['LOKOMOTIF'][2])) + ' baris · SHA-256 ' + sha(data['LOKOMOTIF'][0]) + ' · disimpan di tab RHI basis data utama'],
                ['Arsip utuh', 'Drive 02_DB_Database/RHI/*.csv.gz (harian semua jenis, apa adanya)'],
                ['RHI_Kereta', 'Kereta harian apa adanya, satu baris = satu unit satu tanggal. Kunci jenis+nomor+tanggal unik.'],
                ['RHI_Kereta_Bulanan / RHI_Gerbong_Bulanan', '%d / %d baris. Satu baris = satu unit satu bulan. Nilai komponen = tanggal terakhir. status_harian: satu huruf per tanggal (H healthy, M monitor, D declining, P poor, C critical, - tidak ada data). healthy_index_harian: nilai per tanggal dipisah titik koma.' % (nk, ng)],
                ['RHI_Harian_Depo', '%d baris. Jumlah unit per status per tanggal × jenis × dipo × tipe, dan rata-rata HI.' % nd],
                ['Mengapa gerbong tidak harian', 'Gerbong harian 823.584 baris × 22 kolom = 18,1 juta sel > batas 10 juta sel per spreadsheet. Harian lengkap ada di arsip Drive.'],
                ['Aturan', 'Jangan sunting tangan; bangkitkan ulang dari berkas ekspor dengan alat di atas. Nomor sarana tanpa spasi (kunci penghubung web app).']]:
        ws.append(row)
    wb.save(os.path.join(a.out, 'rhi_sarana.xlsx'))
    for f in sorted(os.listdir(a.out)): print(f, round(os.path.getsize(os.path.join(a.out, f)) / 1e6, 1), 'MB')


if __name__ == '__main__':
    main()
