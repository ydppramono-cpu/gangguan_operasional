"""Basis data Papan skenario GAPEKA (ruang kerja Batubara) → db/csv/bb_*.csv + src/27_SeedBatubara.gs. Jangan sunting seed manual.

Sumber: salinan tab Database_KA_Batubara_Sumsel_v3.2 (hanya dibaca; disalin 24 Nov 2026) di db/sumber/batubara/*.csv:
  PRASARANA_PETAK (jalur tunggal/ganda, waktu tempuh, headway — Data_Prasarana_GAPEKA_2026 Master 2),
  M_STASIUN (jumlah jalur emplasemen), PRG_SIKLUS & PRG_TERMINAL (rangkaian datang → berangkat + WTT program),
  M_KA (kelompok, muatan, jenis KA batubara), DINASAN_AWAK (Buku Dinasan O.20 GAPEKA 2025).
Jadwal KA TIDAK diambil dari DB Batubara: memakai GAPEKA aplikasi ini (switch global, SEED_GAPEKA25/26), yang memuat KA
penumpang & KA batubara pada lintas yang sama — tanpa data ganda.

Isi SEED_BB (gzip+base64 JSON):
  st   {kode: [nama, n_jalur|null, peran, terminal]}           kode dinormalkan (tanpa spasi, huruf besar)
  pk   {"A-B": [jalur 1|2, wp_menit, headway_menit, km, blok]}
  cor  [{id, n, st:[kode...]}]                                  koridor grafik (urutan stasiun pada lembar)
  sik  {"2025"|"2026": [[terminal, ka_dat, ka_ber, wtt_menit]]} sambungan rangkaian (siklus) program
  wtt  {"2025"|"2026": {terminal: wtt_minimum}}                 WTT program terpendek di terminal itu (dasar batas siklus)
  ka   {"2025"|"2026": {no_ka: [nama, kelompok, muatan, jenis]}}
  sam  {"2025"|"2026": [[no_ka_gabung, no_a, no_b]]}             nomor KA bersambung (M_KA "4000-4001": satu perjalanan)
  din  [[no_ka, upt, kode, mulai, habis, jam_dinas_menit]]       hanya GAPEKA 2025 (buku dinasan yang tersedia)
Pemakaian: python3 -I tools/batubara/build_bb_seed.py
"""
import base64, csv, gzip, hashlib, io, json, os, re

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SRC = os.path.join(ROOT, 'db/sumber/batubara')
OUT = os.path.join(ROOT, 'db/csv')
DB = 'Database_KA_Batubara_Sumsel_v3.2 (salinan baca 24 Nov 2026)'
R = lambda n: list(csv.DictReader(open(os.path.join(SRC, n + '.csv'), encoding='utf-8')))
norm = lambda s: re.sub(r'\s+', '', str(s or '')).upper()
num = lambda s: float(str(s).replace('.', '').replace(',', '.')) if re.match(r'^-?[\d.]+(,\d+)?$', str(s).strip()) else None
VER = lambda v: '2026' if '2026' in v else '2025'


def hm(s):
    m = re.match(r'^(\d{1,2}):(\d{2})$', str(s).strip())
    return int(m.group(1)) * 60 + int(m.group(2)) if m else None


def tulis(nama, head, rows, sumber, kunci):
    p = os.path.join(OUT, nama + '.csv')
    buf = io.StringIO()
    w = csv.writer(buf, lineterminator='\n')
    w.writerow(head)
    w.writerows(rows)
    open(p, 'w', encoding='utf-8', newline='').write(buf.getvalue())
    M = os.path.join(OUT, '_manifest.csv')
    mr = list(csv.reader(open(M, encoding='utf-8', newline='')))
    row = [nama, str(len(rows)), str(len(head)), '1', sumber, kunci, hashlib.sha256(open(p, 'rb').read()).hexdigest()]
    for i, r in enumerate(mr):
        if r and r[0] == nama:
            mr[i] = row
            break
    else:
        mr.append(row)
    b2 = io.StringIO()
    csv.writer(b2, lineterminator='\n').writerows(mr)
    open(M, 'w', encoding='utf-8', newline='').write(b2.getvalue())


def main():
    st = {}
    for r in R('M_STASIUN'):
        n = num(r.get('n_jalur'))
        st[norm(r['kode'])] = [r['nama'], int(n) if n else None, r.get('peran', ''), r.get('terminal', '')]
    pk = {}
    for r in R('PRASARANA_PETAK'):
        a, b = norm(r['stasiun_a']), norm(r['stasiun_b'])
        pk[a + '-' + b] = [2 if r['jalur'].strip().lower() == 'ganda' else 1, num(r['wp_menit']), num(r['headway_dipakai']), num(r['jarak_km']), r['blok']]
    tulis('bb_prasarana_petak', ['petak', 'jalur', 'wp_menit', 'headway_menit', 'jarak_km', 'blok'],
          [[k] + v for k, v in pk.items()], DB + ' tab PRASARANA_PETAK (Data_Prasarana_GAPEKA_2026 Master 2)', 'petak')
    tulis('bb_stasiun', ['kode', 'nama', 'n_jalur', 'peran', 'terminal'], [[k] + v for k, v in st.items()],
          DB + ' tab M_STASIUN (n_jalur kosong/0 = tidak tercatat)', 'kode')

    sik = {'2025': {}, '2026': {}}
    for r in R('PRG_SIKLUS'):
        w = num(r['wtt'])
        if r['ka_dat'] and r['ka_ber'] and w is not None:
            sik[VER(r['versi'])][(norm(r['terminal']), r['ka_dat'].strip(), r['ka_ber'].strip())] = int(w)
    for r in R('PRG_TERMINAL'):
        w = num(r['wtt'])
        if r['ka_dat'] and r['ka_ber'] and w is not None:
            sik[VER(r['versi'])].setdefault((norm(r['stasiun']), r['ka_dat'].strip(), r['ka_ber'].strip()), int(w))
    wmin = {v: {} for v in sik}
    for v, d in sik.items():
        for (t, _, _), w in d.items():
            if w > 0:
                wmin[v][t] = min(wmin[v].get(t, w), w)
    rows = [[v, t, a, b, w] for v, d in sik.items() for (t, a, b), w in sorted(d.items())]
    tulis('bb_siklus', ['versi', 'terminal', 'ka_dat', 'ka_ber', 'wtt_menit'], rows, DB + ' tab PRG_SIKLUS + PRG_TERMINAL', 'versi, terminal, ka_dat, ka_ber')

    ka = {'2025': {}, '2026': {}}
    sam = {'2025': [], '2026': []}
    for r in R('M_KA'):
        parts = [x.strip() for x in r['no_ka'].split('-') if x.strip()]
        for no in parts + ([r['no_ka'].strip()] if len(parts) > 1 else []):
            ka[VER(r['versi'])][no] = [r['nama_ka'], r['kelompok'], r['muatan'], r['jenis']]
        if len(parts) == 2:   # satu perjalanan, nomor berganti di batas Divre (mis. 4000 TMB–PBRX6 → 4001 PBRX6–THN)
            sam[VER(r['versi'])].append([r['no_ka'].strip(), parts[0], parts[1]])

    din = []
    for r in R('DINASAN_AWAK'):
        m0, m1 = hm(r['mulai_dinas']), hm(r['habis_dinas'])
        jd = hm(r['jam_dinas'])
        if m0 is None or m1 is None or jd is None:
            continue
        din.append([r['no_ka'].strip(), r['upt_crew'], r['kode'], m0, m1, jd])
    tulis('bb_dinasan_awak_2025', ['no_ka', 'upt_crew', 'kode', 'mulai_menit', 'habis_menit', 'jam_dinas_menit'], din,
          DB + ' tab DINASAN_AWAK (Buku Dinasan Masinis O.20 GAPEKA 2025)', 'upt_crew, kode, no_ka')

    cor = [
        {'id': 'TMB-THN', 'n': 'Tanjungenim Baru – Tarahan', 'st': 'TMB ME MRL UJM PNG GNM BIB NRU PNM PBRX6 PBRX5 TJR SKU ASM PGG KBU MET TLB PNW LRM DAN BIK KPY BLT LBT TJH BTA KMK SPC GLS SGT MP WAP WAY TJO GHM BBU NGN TLY NRR KTP CEP KB CMS KAG BBA SLS HJP BKI RGS TGI BTI RJS GDR LAR TNK GR SKN THN'},
        {'id': 'TMB-KPT', 'n': 'Tanjungenim Baru – Kertapati', 'st': 'TMB ME MRL UJM PNG GNM BIB NRU PNM PBRX6 PBM LEB KED GLB SDN PYK POSIDR SIG KAS KPT'},
        {'id': 'SCT-KPT', 'n': 'Sukacinta – Kertapati', 'st': 'SCT MRP BJI MLI ME MRL UJM PNG GNM BIB NRU PNM PBRX6 PBM LEB KED GLB SDN PYK POSIDR SIG KAS KPT'},
        {'id': 'LLG-ME', 'n': 'Lubuk Linggau – Muara Enim', 'st': 'LLG KOP MSL TI SNA SUA BGM LT SCT MRP BJI MLI ME'}]
    for c in cor:
        c['st'] = c['st'].split()
    seed = {'db': DB, 'st': st, 'pk': pk, 'cor': cor,
            'sik': {v: [[t, a, b, w] for (t, a, b), w in sorted(d.items())] for v, d in sik.items()},
            'wtt': wmin, 'ka': ka, 'sam': sam, 'din': din}
    gz = base64.b64encode(gzip.compress(json.dumps(seed, ensure_ascii=False, separators=(',', ':')).encode('utf-8'), 9, mtime=0)).decode('ascii')
    open(os.path.join(ROOT, 'src/27_SeedBatubara.gs'), 'w', encoding='utf-8').write(
        '/**\n * 27_SeedBatubara.gs — DIBANGKITKAN tools/batubara/build_bb_seed.py; jangan disunting manual.\n'
        ' * Parameter Papan skenario GAPEKA (prasarana petak, jalur stasiun, siklus rangkaian, WTT, dinasan awak) dari ' + DB + '.\n */\n'
        'var SEED_BB_GZ = ' + json.dumps(gz) + ';\n')
    print('SEED_BB: %d stasiun · %d petak · siklus 2025/2026 %d/%d · dinasan %d · %d KB' % (
        len(st), len(pk), len(seed['sik']['2025']), len(seed['sik']['2026']), len(din), len(gz) // 1024))


if __name__ == '__main__':
    main()
