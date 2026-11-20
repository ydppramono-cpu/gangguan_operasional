"""Impor laporan operasi KA ke db/csv (sumber mentah tidak disimpan di repo).

Masukan (path berkas .xlsx sebagai argumen; jenis dikenali dari judul lembar):
  Laporan_KA_Jalan_Batal_*.xlsx   (satu berkas per bulan; "Laporan Rekapitulasi Kereta Api Berjalan dan Batal")
  Laporan_Frekuensi_KA_*.xlsx     ("Laporan Frekuensi Kereta Api", km per KA + frekuensi jalan/batal)
  daftar-stasiun-perhentian-*.xlsx ("Laporan Stasiun Perhentian", Gapeka 2025)
  UPDATE_POL_OP_*.xlsx            (pola operasi rangkaian: lok, stamformasi, depo induk)
Keluaran:
  db/csv/ka_jalan_batal_2026.csv   ym, no_ka, nama_ka, relasi, pola (satu huruf per tanggal: J jalan, B batal, - tidak berprogram,
                                   . sel kosong), total_jalan
  db/csv/ka_frekuensi_2026.csv     no_ka, nama_ka, relasi, berangkat, datang, km, frek_jalan, frek_batal, frek_total, km_total, periode
  db/csv/stasiun_perhentian_2025.csv no_ka, nama_ka, relasi, n_dilewati (langsung), n_berhenti, n_berhenti_sb,
                                   stasiun (SEMUA stasiun rute berurutan = dilewati + berhenti, dipisah spasi)
  db/csv/pola_operasi_ompr2.csv    urut, no_ka, jenis, nama_ka, kelas, relasi, berangkat, datang, posisi_idle, pola, vmaks, lok,
                                   stamformasi, depo_induk, rangkaian (nomor grup; pola/lok/stamformasi diisi turun dalam grup), isi_turun
Tanggal cetak laporan (dari nama berkas) dicatat di _manifest.csv kolom sumber: status setelah tanggal cetak adalah PROGRAM, bukan realisasi.
Pemakaian: python3 -I tools/operasi/impor_operasi.py <berkas.xlsx> ...
"""
import csv, hashlib, io, os, re, sys
import openpyxl

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, 'db/csv')
BULAN = {'januari': 1, 'februari': 2, 'maret': 3, 'april': 4, 'mei': 5, 'juni': 6, 'juli': 7, 'agustus': 8,
         'september': 9, 'oktober': 10, 'november': 11, 'desember': 12}


def s(v):
    return '' if v is None else str(v).replace('\xa0', ' ').strip()


def ka(v):
    """Nomor KA apa adanya, huruf besar, tanpa spasi (format laporan: 1, 1B, S7, D1/123)."""
    x = s(v)
    if re.fullmatch(r'\d+\.0', x):
        x = x[:-2]
    return re.sub(r'\s+', '', x).upper()


def rows_of(path):
    wb = openpyxl.load_workbook(path, data_only=True)
    ws = wb.worksheets[0]
    return [list(r) for r in ws.iter_rows(values_only=True)]


def jhm(v):
    if v is None:
        return ''
    if hasattr(v, 'hour'):
        return '%02d:%02d' % (v.hour, v.minute)
    m = re.match(r'(\d{1,2}):(\d{2})', s(v))
    return '%02d:%s' % (int(m.group(1)), m.group(2)) if m else ''


def cetak_dari_nama(path):
    m = re.search(r'_(20\d{2})(\d{2})(\d{2})_\d{6}', os.path.basename(path))
    return '%s-%s-%s' % m.groups() if m else ''


def jalan_batal(paths):
    out, src, cetak = [], [], ''
    for p in paths:
        R = rows_of(p)
        m = re.search(r'01\s+(\w+)\s+(\d{4})\s+s\.d\.\s+(\d{1,2})', s(R[1][0]))
        if not m:
            raise SystemExit('Periode tidak terbaca: ' + p)
        ym = '%s-%02d' % (m.group(2), BULAN[m.group(1).lower()])
        nd = int(m.group(3))
        hdr = R[3]
        c0 = next(i for i, v in enumerate(hdr) if s(v) in ('1', '1.0'))
        for r in R[4:]:
            no = ka(r[1])
            if not no:
                continue
            pola = ''.join((s(x).upper()[:1] if s(x) else '.') for x in r[c0:c0 + nd])
            tot = r[c0 + nd] if len(r) > c0 + nd else ''
            out.append([ym, no, s(r[2]), s(r[3]), pola, '' if tot is None else int(float(tot or 0))])
        src.append(ym)
        cetak = max(cetak, cetak_dari_nama(p))
    out.sort(key=lambda r: (r[0], r[1]))
    return out, sorted(src), cetak


def frekuensi(path):
    R = rows_of(path)
    per = s(R[1][1]).replace('Periode Laporan: ', '')
    hdr = [s(x) for x in R[2]]
    c = {k: hdr.index(k) for k in ['Nomor KA', 'Nama KA', 'Relasi', 'Datang', 'Berangkat', 'KM KA (KM)', 'Frek. Jalan', 'Frek. Batal', 'Frek. Total', 'KM KA Total (KM)']}
    out = []
    for r in R[3:]:
        no = ka(r[c['Nomor KA']])
        if not no:
            continue
        km = re.sub(r'[^0-9.]', '', s(r[c['KM KA (KM)']]))
        num = lambda k: s(r[c[k]]).replace(',', '')
        out.append([no, s(r[c['Nama KA']]), s(r[c['Relasi']]), jhm(r[c['Berangkat']]), jhm(r[c['Datang']]), km,
                    num('Frek. Jalan'), num('Frek. Batal'), num('Frek. Total'), num('KM KA Total (KM)'), per])
    return out, per


def perhentian(paths):
    out, seen = [], set()
    for p in paths:
        R = rows_of(p)
        for r in R[7:]:
            no = ka(r[1])
            if not no or no in seen:
                continue
            n = [int(x) for x in re.findall(r'(\d+)\s*Stasiun', s(r[10]))] + [0, 0, 0]
            st = [x.strip() for x in s(r[15]).split(',') if x.strip()]
            seen.add(no)
            out.append([no, s(r[4]), s(r[9]).replace(' - ', '-'), n[0], n[1], n[2], ' '.join(st)])
    out.sort(key=lambda r: r[0])
    return out


def pola_operasi(path):
    R = rows_of(path)
    out, g, last = [], 0, None
    for r in R[5:]:
        urut, no = s(r[1]), ka(r[2])
        if not no or not re.fullmatch(r'\d+(\.0)?', urut):
            continue
        pola, vmax, lok, stam, depo = s(r[12]), s(r[13]), s(r[14]), s(r[15]), s(r[16])
        turun = 0
        if pola or lok or stam:
            g += 1
            last = [pola, vmax, lok, stam, depo]
        elif last:
            pola, vmax, lok, stam, depo = last
            turun = 1
        out.append([int(float(urut)), no, s(r[3]), s(r[4]), s(r[5]), s(r[6]).replace(' - ', '-'), jhm(r[7]), jhm(r[8]),
                    s(r[11]), pola, vmax, lok, stam, depo, g, turun])
    return out


def tulis(nama, header, rows):
    buf = io.StringIO()
    w = csv.writer(buf, lineterminator='\n')
    w.writerow(header)
    w.writerows(rows)
    p = os.path.join(OUT, nama + '.csv')
    open(p, 'w', encoding='utf-8', newline='').write(buf.getvalue())
    return p


def manifest(nama, n, k, sumber, kunci, path):
    M = os.path.join(OUT, '_manifest.csv')
    mr = list(csv.reader(open(M, encoding='utf-8', newline='')))
    sha = hashlib.sha256(open(path, 'rb').read()).hexdigest()
    row = [nama, str(n), str(k), '1', sumber, kunci, sha]
    for i, r in enumerate(mr):
        if r and r[0] == nama:
            mr[i] = row
            break
    else:
        mr.append(row)
    buf = io.StringIO()
    csv.writer(buf, lineterminator='\n').writerows(mr)
    open(M, 'w', encoding='utf-8', newline='').write(buf.getvalue())


def main(paths):
    jb, fr, ph, po = [], [], [], []
    for p in paths:
        b = os.path.basename(p)
        if 'Jalan_Batal' in b:
            jb.append(p)
        elif 'Frekuensi' in b:
            fr.append(p)
        elif 'perhentian' in b.lower():
            ph.append(p)
        elif 'POL_OP' in b.upper():
            po.append(p)
        else:
            print('dilewati (jenis tidak dikenal):', b)
    if jb:
        rows, yms, cetak = jalan_batal(jb)
        p = tulis('ka_jalan_batal_2026', ['ym', 'no_ka', 'nama_ka', 'relasi', 'pola', 'total_jalan'], rows)
        manifest('ka_jalan_batal_2026', len(rows), 6, 'Laporan Rekapitulasi KA Berjalan dan Batal %s s.d. %s; dicetak %s (status setelah tanggal cetak = program)' % (yms[0], yms[-1], cetak), 'ym, no_ka', p)
        print('KA Jalan/Batal:', len(rows), 'baris,', len(yms), 'bulan, cetak', cetak)
    if fr:
        rows, per = frekuensi(fr[0])
        p = tulis('ka_frekuensi_2026', ['no_ka', 'nama_ka', 'relasi', 'berangkat', 'datang', 'km', 'frek_jalan', 'frek_batal', 'frek_total', 'km_total', 'periode'], rows)
        manifest('ka_frekuensi_2026', len(rows), 11, 'Laporan Frekuensi Kereta Api ' + per + '; dicetak ' + cetak_dari_nama(fr[0]), 'no_ka', p)
        print('Frekuensi:', len(rows), 'KA ·', per)
    if ph:
        rows = perhentian(ph)
        p = tulis('stasiun_perhentian_2025', ['no_ka', 'nama_ka', 'relasi', 'n_dilewati', 'n_berhenti', 'n_berhenti_sb', 'stasiun'], rows)
        manifest('stasiun_perhentian_2025', len(rows), 7, 'Laporan Stasiun Perhentian Gapeka 2025 (%d berkas, dicetak 20 Nov 2026)' % len(ph), 'no_ka', p)
        print('Stasiun perhentian:', len(rows), 'KA')
    if po:
        rows = pola_operasi(po[0])
        p = tulis('pola_operasi_ompr2', ['urut', 'no_ka', 'jenis', 'nama_ka', 'kelas', 'relasi', 'berangkat', 'datang', 'posisi_idle', 'pola', 'vmaks', 'lok', 'stamformasi', 'depo_induk', 'rangkaian', 'isi_turun'], rows)
        manifest('pola_operasi_ompr2', len(rows), 16, 'UPDATE POL OP OMPR2 (pola operasi rangkaian KA penumpang; isi_turun=1 berarti pola/lok/stamformasi mengikuti baris pertama grup)', 'no_ka', p)
        print('Pola operasi:', len(rows), 'KA,', max(r[14] for r in rows), 'grup rangkaian')


if __name__ == '__main__':
    main(sys.argv[1:])
