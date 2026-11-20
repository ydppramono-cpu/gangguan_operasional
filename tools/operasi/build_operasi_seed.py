"""Membangkitkan src/24_SeedOperasi.gs dari db/csv (hasil tools/operasi/impor_operasi.py). Jangan sunting seed manual.

Isi SEED_OPS:
  cetak   tanggal cetak laporan KA Jalan/Batal (status setelahnya = program, bukan realisasi)
  jbGz    gzip+base64 TSV "ym <tab> pola <tab> no_ka no_ka ..." — KA dikelompokkan per pola harian yang sama (J/B/-/.)
  frekGz  gzip+base64 TSV "no_ka <tab> km <tab> nama <tab> relasi <tab> frek_jalan <tab> frek_batal" (Laporan Frekuensi KA 2026)
  ruteGz  gzip+base64 TSV "no_ka <tab> kode stasiun berurutan (spasi)" (Laporan Stasiun Perhentian GAPEKA 2025; dilewati + berhenti)
  pola    baris pola operasi OMPR2: [no_ka, jenis, nama, kelas, relasi, berangkat, datang, idle, pola, vmaks, lok, stamformasi, depo, grup, isiTurun]
  src     uraian sumber per bagian
Pemakaian: python3 -I tools/operasi/build_operasi_seed.py
"""
import base64, csv, gzip, json, os
from collections import OrderedDict

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
C = lambda n: list(csv.DictReader(open(os.path.join(ROOT, 'db/csv', n), encoding='utf-8')))
gz = lambda t: base64.b64encode(gzip.compress(t.encode('utf-8'), 9, mtime=0)).decode('ascii')
man = {r['tabel']: r for r in csv.DictReader(open(os.path.join(ROOT, 'db/csv/_manifest.csv'), encoding='utf-8'))}

jb = C('ka_jalan_batal_2026.csv')
grp = OrderedDict()
for r in jb:
    grp.setdefault((r['ym'], r['pola']), []).append(r['no_ka'])
jb_tsv = '\n'.join('%s\t%s\t%s' % (k[0], k[1], ' '.join(v)) for k, v in grp.items())
cetak = man['ka_jalan_batal_2026']['sumber'].split('dicetak ')[1][:10]

fr = C('ka_frekuensi_2026.csv')
fr_tsv = '\n'.join('\t'.join([r['no_ka'], r['km'], r['nama_ka'], r['relasi'], r['frek_jalan'], r['frek_batal']]) for r in fr)

ru = C('stasiun_perhentian_2025.csv')
ru_tsv = '\n'.join(r['no_ka'] + '\t' + r['stasiun'] for r in ru)

po = [[r['no_ka'], r['jenis'], r['nama_ka'], r['kelas'], r['relasi'], r['berangkat'], r['datang'], r['posisi_idle'], r['pola'],
       r['vmaks'], r['lok'], r['stamformasi'], r['depo_induk'], int(r['rangkaian']), int(r['isi_turun'])] for r in C('pola_operasi_ompr2.csv')]

seed = {
    'cetak': cetak,
    'src': {k: man[k]['sumber'] for k in ['ka_jalan_batal_2026', 'ka_frekuensi_2026', 'stasiun_perhentian_2025', 'pola_operasi_ompr2']},
    'jbGz': gz(jb_tsv), 'frekGz': gz(fr_tsv), 'ruteGz': gz(ru_tsv), 'pola': po
}
out = ('/**\n * 24_SeedOperasi.gs — DIBANGKITKAN tools/operasi/build_operasi_seed.py dari db/csv. Jangan diedit manual.\n'
       ' * Program operasi KA 2026 (Jalan/Batal per hari, frekuensi & km), rute GAPEKA 2025 (stasiun perhentian), pola operasi OMPR2.\n'
       ' * Dibaca lewat modul Ops (25_Operasi.gs).\n */\n'
       'var SEED_OPS = ' + json.dumps(seed, ensure_ascii=False, separators=(',', ':')) + ';\n')
open(os.path.join(ROOT, 'src/24_SeedOperasi.gs'), 'w', encoding='utf-8').write(out)
print('pola J/B:', len(grp), 'grup ·', len(jb), 'KA-bulan · frek', len(fr), '· rute', len(ru), '· pola op', len(po), '· bait', len(out), '· cetak', cetak)
