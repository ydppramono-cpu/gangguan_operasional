"""Data SINTETIS ruang kerja Batubara untuk emulator & uji (tests/emulator/bb_fixture.json). Bukan data operasi.

Realisasi (REAL_*), SOP, ambang, katalog hambatan dan target dibangkitkan acak (benih tetap) mengikuti kolom asli DB Batubara;
master yang sudah publik di repo (M_KA, M_STASIUN, PRG_TERMINAL, PRG_SIKLUS, PRASARANA_PETAK, EMPLASEMEN_JALUR, DINASAN_AWAK,
M_TERMINAL) dipakai apa adanya dari db/sumber/batubara/. Data realisasi asli TIDAK boleh masuk repo publik.
Pemakaian: python3 -I tools/batubara/fixture_sintetis.py
"""
import csv, json, os, random, re

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SRC = os.path.join(ROOT, 'db/sumber/batubara')
rnd = random.Random(20261124)
NUM = re.compile(r'^-?\d+(,\d+)?$')


def tab(name):
    rows = list(csv.reader(open(os.path.join(SRC, name + '.csv'), encoding='utf-8')))
    c = rows[0]
    keep_text = {'no_ka', 'ka_dat', 'ka_ber', 'kode', 'jalur', 'rangkaian', 'urut'}
    out = []
    for r in rows[1:]:
        o = []
        for j, col in enumerate(c):
            v = r[j].strip() if j < len(r) else ''
            o.append(None if v == '' else v if col in keep_text or not NUM.match(v) else (float(v.replace(',', '.')) if ',' in v else int(v)))
        out.append(o)
    return {'c': c, 'r': out}


def T(c, r):
    return {'c': c, 'r': r}


def hm(m):
    m = int(m) % 1440
    return '%02d:%02d' % (m // 60, m % 60)


def main():
    core = {n: tab(n) for n in ['M_KA', 'M_STASIUN', 'PRG_TERMINAL', 'PRG_SIKLUS', 'PRASARANA_PETAK', 'EMPLASEMEN_JALUR', 'DINASAN_AWAK', 'M_TERMINAL']}
    ka = [dict(zip(core['M_KA']['c'], r)) for r in core['M_KA']['r']]
    st = {r[0]: dict(zip(core['M_STASIUN']['c'], r)) for r in core['M_STASIUN']['r']}
    core['CONFIG'] = T(['kunci', 'nilai'], [['app_nama', 'DATA SINTETIS (emulator)'], ['bobot_kinerja_terminal', '25,25,25,25']])
    core['M_LINTAS'] = T(['id', 'divre', 'nama', 'stasiun'], [
        ['D3-1', 'DIVRE III', 'Kertapati – Prabumulih Baru X6', 'KPT,KAS,SIG,POSIDR,PYK,SDN,GLB,KED,LEB,PBM,PBRX6'],
        ['D3-2', 'DIVRE III', 'Prabumulih Baru X6 – Tanjungenim Baru', 'PBRX6,PNM,NRU,BIB,GNM,PNG,UJM,MRL,ME,TMB'],
        ['D3-3', 'DIVRE III', 'Muara Enim – Lubuk Linggau', 'ME,MLI,BJI,MRP,SCT,LT,BGM,SUA,SNA,TI,MSL,KOP,LLG'],
        ['D4-1', 'DIVRE IV', 'Tarahan – Prabumulih Baru X6', 'THN,SKN,GR,TNK,LAR,GDR,RJS,BTI,TGI,RGS,BKI,HJP,SLS,BBA,KAG,CMS,KB,CEP,KTP,NRR,TLY,NGN,BBU,GHM,TJO,WAY,WAP,MP,SGT,GLS,SPC,KMK,BTA,TJH,LBT,BLT,KPY,BIK,DAN,LRM,PNW,TLB,MET,KBU,PGG,ASM,SKU,TJR,PBRX5,PBRX6']])
    pk = core['PRASARANA_PETAK']
    core['M_PETAK'] = T(['id', 'divre', 'lintas', 'dari', 'ke', 'km_dari', 'km_ke', 'jarak_km', 'v_maks', 'lereng_maks_permil', 'jari_min_m', 'jalur_ganda', 'batas_kecepatan'],
                        [[r[3], r[0], r[1], r[4], r[5], None, None, r[9], r[11], None, None, r[6] == 'ganda', None] for r in pk['r']])
    rels = sorted({k['relasi'] for k in ka if k['muatan'] == 'Isi' and k['relasi']})
    sop = []
    for rel in rels:
        a, b = rel.split('-')[0], rel.split('-')[-1]
        for lok, keg, m in [(a, 'Pra Muat', 30), (a, 'Muat', 180), (a, 'Purna Muat', 40), (b, 'Pra Bongkar', 30), (b, 'Bongkar', 150), (b, 'Purna Bongkar', 40)]:
            sop.append(['MITRA SINTETIS', rel, a + ' - ' + b, lok, lok, None, keg, m + rnd.randint(-10, 10), 'SINTETIS'])
    core['SOP'] = T(['mitra', 'relasi', 'relasi_kode', 'lokasi_muat_bongkar', 'kode_lokasi_muat_bongkar', 'keterangan', 'jenis_kegiatan', 'menit', 'sumber'], sop)
    core['AMBANG_SOP'] = T(['kode', 'kelompok', 'ambang', 'min_menit', 'max_menit', 'warna', 'dokumen', 'dipakai_untuk'], [
        ['PTDO-H', 'PTDO', 'Tepat/awal', None, 0, '#16A34A', 'SINTETIS', 'kategori'], ['PTDO-K', 'PTDO', '1–30 mnt', 1, 30, '#CA8A04', 'SINTETIS', 'kategori'],
        ['PTDO-M', 'PTDO', '> 30 mnt', 31, None, '#DC2626', 'SINTETIS', 'kategori']])
    kat = [['PM01', 'MUAT', 'PRA', 'PRA MUAT', 'Antri muat (sintetis)', 'Metode/Kapasitas', 'SISTEM', 'Allowance', ''],
           ['MT01', 'MUAT', 'INTI', 'MUAT', 'Material tipis (sintetis)', 'Material', 'PEMILIK/PENGELOLA', 'Non-allowance', ''],
           ['MT02', 'MUAT', 'INTI', 'MUAT', 'Gangguan alat muat (sintetis)', 'Mesin/Fasilitas', 'PEMILIK/PENGELOLA', 'Non-allowance', ''],
           ['PB01', 'BONGKAR', 'PRA', 'PRA BONGKAR', 'Antri bongkar (sintetis)', 'Metode/Kapasitas', 'SISTEM', 'Allowance', ''],
           ['BB01', 'BONGKAR', 'INTI', 'BONGKAR', 'Gangguan alat bongkar (sintetis)', 'Mesin/Fasilitas', 'PEMILIK/PENGELOLA', 'Non-allowance', ''],
           ['PS01', 'BONGKAR', 'PASCA', 'PASCA BONGKAR', 'Tunggu lok (sintetis)', 'Manusia', 'KAI', 'Non-allowance', '']]
    core['KATALOG_HAMBATAN'] = T(['kode_std', 'jenis', 'fase', 'tahap', 'nama', 'akar', 'pic', 'sifat', 'contoh_kode_asal'], kat)
    core['KPI_TARGET'] = T(['kode', 'kpi', 'divre', 'ukuran', 'nilai', 'satuan', 'arah', 'sumber'], [])
    for n in ['M_MITRA_RELASI', 'OTP_RESMI', 'KINERJA_TAHUNAN', 'KINERJA_2026', 'KINERJA_LOSSES', 'SARANA_LOK', 'SARANA_REKAP', 'PROGRAM_KA',
              'KAPASITAS_LINTAS', 'TEMUAN_REGULASI', 'PUSTAKA']:
        core[n] = T([], [])
    # Emplasemen SINTETIS (gambar buatan, bukan lembar GAPEKA) agar emulator menguji Part.BbEmplasemen & Js.Emplasemen.
    core['M_UPT'] = T(['lokasi', 'terminal', 'nama', 'angkutan', 'jenis', 'relasi', 'fasilitas', 'catatan_sop', 'skema_kode'],
                      [['TMB', 'TMB', 'Terminal sintetis TMB', 'PTBA', 'MUAT', 'SINTETIS', 'SINTETIS', 'SINTETIS', 'TMB']])
    sk = {'w': 400, 'h': 160, 'paths': [
        {'d': 'M40 40L380 40', 'w': 2, 'f': None, 's': '#000000', 'da': 0},
        {'d': 'M60 60L360 60M80 80L340 80', 'w': 2, 'f': None, 's': '#000000', 'da': 0},
        {'d': 'M40 40C20 40 10 120 40 120L120 120', 'w': 2, 'f': None, 's': '#000000', 'da': 0},
        {'d': 'M100 100L300 100', 'w': 2, 'f': None, 's': '#000000', 'da': 0}],
        'text': [['I-900', 150, 44, 10, 0, 1, 1], ['II-800', 150, 64, 10, 0, 1, 1], ['III-700', 150, 84, 10, 0, 1, 1], ['4-300', 150, 104, 10, 0, 1, 0],
                 ['TLS I', 20, 130, 8, 0, 0, 0], ['TLS III', 120, 130, 8, 0, 0, 0], ['Me', 382, 36, 12, 0, 0, 0], ['Tmb', 200, 20, 12, 0, 0, 0]],
        'tracks': [{'j': 'I', 'm': 900, 'p': [0], 'ket': ''}]}
    core['EMPLASEMEN_SKEMA'] = T(['id', 'kode', 'jenis', 'judul', 'sumber', 'bagian', 'data'],
                                 [['SK-TMB', 'TMB', 'skema', 'Skema SINTETIS (emulator)', 'SINTETIS', 1, json.dumps(sk)[:200]],
                                  ['SK-TMB', 'TMB', 'skema', 'Skema SINTETIS (emulator)', 'SINTETIS', 2, json.dumps(sk)[200:]]])
    core['ALUR_KEGIATAN'] = T(['tipe', 'urut', 'tahap', 'langkah', 'titik', 'kode_hambatan', 'keterangan'], [
        ['muat_tls', 1, 'pra_muat', 'Langkah sintetis 1', 'arah,jterima', 'PM01', 'SINTETIS'],
        ['muat_tls', 2, 'pra_muat', 'Langkah sintetis 2', 'jterima,tls12,tls34', 'PM01', 'SINTETIS'],
        ['muat_tls', 3, 'muat', 'Langkah sintetis 3', 'tls12,tls34', 'MT01', 'SINTETIS'],
        ['muat_tls', 4, 'pasca_muat', 'Langkah sintetis 4', 'jlangsir,ppka', 'PA01', 'SINTETIS'],
        ['muat_tls', 5, 'pasca_muat', 'Langkah sintetis 5', 'arah,ppka', 'PA01', 'SINTETIS']])
    core['SARANA_RANGKAIAN'] = T(['tahun', 'nama_ka', 'no_ka', 'relasi', 'jenis_lok', 'km_tempuh_per_grb', 'sf', 'jenis_gerbong', 'kebutuhan_gerbong', 'rangkaian', 'ka_per_hari', 'kapasitas_ton_hari', 'komoditi', 'sumber'],
                                 [[2025, 'SINTETIS', '', rel, 'CC 205', 0, 0, 'KKBW', 60, 8, 4, 0, 'Batubara', 'SINTETIS'] for rel in rels])

    # ---- realisasi sintetis: Jan–Sep 2026 ----
    per, ter, ham, jej = [], [], [], []
    k25 = [k for k in ka if k['versi'] == 'GAPEKA 2025' and k['brk'] and k['dat'] and k['wp_menit']]
    for m in range(1, 10):
        for d in range(1, 29, 3):
            tgl = '2026-%02d-%02d' % (m, d)
            for k in k25:
                if rnd.random() < 0.55:
                    continue
                b0 = int(k['brk'][:2]) * 60 + int(k['brk'][3:]); wp = int(float(k['wp_menit']))
                batal = rnd.random() < 0.12
                lb = int(rnd.gauss(-60, 90)); lama = max(30, int(wp * rnd.uniform(0.9, 1.35)))
                lt = lb + lama - wp
                per.append([tgl, k['no_ka'], k['asal'], k['tujuan'], k['muatan'], k['grup_kelka'], hm(b0), hm(b0 + lb), hm(b0 + wp), hm(b0 + lb + lama),
                            None if batal else lb, None if batal else lt, wp, None if batal else lama, 'Ya' if batal else None])
                if k['muatan'] == 'Isi' and not batal and rnd.random() < 0.6:
                    sm, sb = k['relasi'].split('-')[0], k['relasi'].split('-')[-1]
                    v = [rnd.randint(10, 90), rnd.randint(120, 260), rnd.randint(20, 90), rnd.randint(10, 120), rnd.randint(100, 260), rnd.randint(20, 120)]
                    t0 = '%s %s' % (tgl, hm(b0 - 300))
                    ter.append(['BAM-S', 'BAB-S', k['no_ka'].split('-')[0], k['nama_ka'], sm + '-' + sb, sm, sb, None, t0, t0, t0, t0, t0, t0, t0] + v)
                    for _ in range(rnd.randint(0, 2)):
                        kk = rnd.choice(kat)
                        ham.append([tgl, tgl[:7], 'Ya', 'PTBA' if sm == 'TMB' else 'SWASTA', sm if kk[1] == 'MUAT' else sb, kk[1], kk[2], kk[3], kk[0], kk[4], kk[5], None, None,
                                    k['no_ka'].split('-')[0], 1, rnd.randint(10, 180), 'uraian sintetis', kk[6], kk[7], 'SINTETIS'])
    # jejak sintetis: 3 tanggal, jadwal PRG_JADWAL GAPEKA 2025 + kelambatan acak yang menumpuk
    jd = {}
    for r in csv.DictReader(open(os.path.join(SRC, 'PRG_JADWAL.csv'), encoding='utf-8')):
        if r['versi'] == 'GAPEKA 2025':
            jd.setdefault(r['no_ka_segmen'], []).append(r)
    def mins(x):
        m = re.match(r'^(\d{1,2}):(\d{2})$', x or '')
        return int(m.group(1)) * 60 + int(m.group(2)) if m else None
    for tgl in ['2026-09-02', '2026-09-03', '2026-09-04']:
        for no, L in list(jd.items())[:120]:
            L = sorted(L, key=lambda r: int(r['urut'])); dl = rnd.randint(-30, 40); prev = None; km = 0
            for r in L:
                b = mins(r['brk']); d = mins(r['dat']) if r['dat'] not in ('Ls', '') else None
                if b is None: continue
                if prev is not None and b < prev - 600: b += 1440
                prev = b; dl += rnd.choice([0, 0, 0, 2, 5, -3])
                jej.append([tgl, no, '', '', r['stasiun'], km, None if d is None else d + dl, b + dl, d, b]); km += 5
    jcols = ['tanggal', 'no_ka', 'nama_ka', 'muatan', 'stasiun', 'jarak_km', 'dtg_real', 'brk_real', 'dtg_prog', 'brk_prog']
    tcols = ['id_bam', 'id_bab', 'no_ka', 'nama_ka', 'relasi', 'stasiun_muat', 'stasiun_bongkar', 'datang_kosong', 'mulai_muat', 'selesai_muat', 'berangkat_isi', 'datang_isi',
             'mulai_bongkar', 'selesai_bongkar', 'berangkat_kosong', 'pra_muat', 'muat', 'pasca_muat', 'pra_bongkar', 'bongkar', 'pasca_bongkar']
    out = {
        'core': {'v': 'sintetis', 't': core},
        'perjalanan': {'v': 'sintetis', 't': {'REAL_PERJALANAN': T(['tanggal', 'no_ka', 'asal', 'tujuan', 'muatan', 'grup', 'brk_prog', 'brk_real', 'tiba_prog', 'tiba_real', 'lambat_brk', 'lambat_tiba', 'lama_prog', 'lama_real', 'batal'], per)}},
        'terminal': {'v': 'sintetis', 't': {'REAL_TERMINAL': T(tcols, ter), 'REAL_THN': T(['no_ka', 'rangkaian', 'tgl_berangkat_tmb', 'jam_berangkat_tmb', 'dpi', 'tgl_tiba_thn', 'jam_tiba_thn', 'rcd', 'gerbong', 'tonase', 'wtt', 'buang_angin', 'langsir_isi', 'bongkar', 'langsir_kosong', 'pemeriksaan', 'pra_bongkar', 'pasca_bongkar', 'sop_bongkar_rcd'], [])}},
        'hambatan': {'v': 'sintetis', 't': {'REAL_HAMBATAN': T(['tanggal', 'periode', 'tanggal_tercatat', 'angkutan', 'lokasi', 'jenis', 'fase', 'tahap', 'kode_std', 'nama_std', 'akar', 'cy', 'mitra', 'no_ka', 'frek', 'menit', 'uraian', 'pic', 'sifat', 'sumber'], ham)}},
        'jejak': {'v': 'sintetis', 't': {'REAL_JEJAK': T(jcols, jej)}}}
    p = os.path.join(ROOT, 'tests/emulator/bb_fixture.json')
    json.dump(out, open(p, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    print('fixture sintetis: perjalanan %d · terminal %d · hambatan %d · %d KB' % (len(per), len(ter), len(ham), os.path.getsize(p) // 1024))


if __name__ == '__main__':
    main()
