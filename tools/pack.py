"""Bangun paket tempel-manual dari src/ untuk yang tidak memakai clasp.

Hasil di <folder_keluaran> (bawaan: dist/):
  Code.gs          gabungan modul .gs sesuai tools/module_order.json
  SeedJadwal.gs, AsetLaporan.gs, SeedPeta.gs   seed besar (berkas terpisah)
  Index.html       SATU berkas: semua include parsial sudah digabung
  appsscript.json  manifest

Pakai: python3 tools/pack.py [folder_keluaran]
"""
import json
import os
import shutil
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from html_include import expand  # noqa: E402

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'src')
SEPARATE = [('11_SeedJadwal.gs', 'SeedJadwal.gs'), ('13_AsetLaporan.gs', 'AsetLaporan.gs'),
            ('18_SeedPeta.gs', 'SeedPeta.gs'), ('19_SeedGapeka26.gs', 'SeedGapeka26.gs'), ('20_SeedGapeka25.gs', 'SeedGapeka25.gs'), ('appsscript.json', 'appsscript.json')]


def read(name):
    with open(os.path.join(SRC, name), encoding='utf-8') as fh:
        return fh.read()


CARA_TEMPEL = """Paket tempel manual editor Google Apps Script — Web App Gangguan Operasional v{v}
=====================================================================================
Dibangun dari repo GitHub ydppramono-cpu/gangguan_operasional (tools/pack.py); isi identik dengan src/.
Catatan rilis: knowledge/rilis/ringkasan_rilis_v{vn}.md

Di editor Apps Script web app:
1. Cadangkan dulu: File > Make a copy (atau unduh tiap berkas lama).
2. Ganti isi berkas berikut dengan isi berkas bernama sama di paket ini
   (buat berkas baru bila belum ada; .gs = "Script", .html = "HTML"):
     Code.gs            semua modul server ({first} ... {last}, {n} modul)
     SeedJadwal.gs      data jadwal GAPEKA 2025
     AsetLaporan.gs     aset laporan
     SeedPeta.gs        data peta
     SeedGapeka26.gs    data grafik perjalanan GAPEKA 2026
     SeedGapeka25.gs    data grafik perjalanan GAPEKA 2025
     Index.html         seluruh tampilan (satu berkas utuh, tanpa include)
   appsscript.json : Project Settings > centang "Show appsscript.json", lalu samakan isinya.
                     Sejak v3.13.0 memuat layanan lanjutan BigQuery v2 + cakupan auth/bigquery:
                     editor akan meminta IZIN ULANG sekali (Run fungsi apa saja, mis. showStatus).
                     Tanpa properti KONDISI_SUMBER=bq web app tetap membaca Sheets seperti sebelumnya.
3. Bila proyek memakai berkas modular hasil clasp push (00_Config.gs, Css.*, Js.* ...), JANGAN campur:
   pilih salah satu cara (modular via clasp ATAU paket ini).
4. Simpan, lalu Deploy > Manage deployments > Edit > Version: New version > Deploy.
5. Opsional BigQuery: ikuti docs/ARSITEKTUR.md bagian "Menyalakan BigQuery di web app" (ujiKondisiBq dulu).
"""


def main():
    out = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ROOT, 'dist')
    os.makedirs(out, exist_ok=True)
    with open(os.path.join(ROOT, 'tools', 'module_order.json'), encoding='utf-8') as fh:
        order = json.load(fh)
    version = read('00_Config.gs').split("APP_VERSION: '")[1].split("'")[0]
    header = ('/**\n * KAI Dashboard Gangguan Operasional v%s — gabungan %d modul dari repo gangguan_operasional/src '
              '(tools/pack.py).\n * Wajib bersama SeedJadwal.gs, AsetLaporan.gs, SeedPeta.gs, SeedGapeka26.gs dan SeedGapeka25.gs.\n */\n') % (version, len(order))
    body = ''.join('\n// ===== MODUL %s =====\n%s' % (m, read(m)) for m in order)
    with open(os.path.join(out, 'Code.gs'), 'w', encoding='utf-8') as fh:
        fh.write(header + body)
    with open(os.path.join(out, 'Index.html'), 'w', encoding='utf-8') as fh:
        fh.write(expand(SRC, 'Index'))
    for src_name, dst_name in SEPARATE:
        shutil.copy(os.path.join(SRC, src_name), os.path.join(out, dst_name))
    with open(os.path.join(out, 'CARA_TEMPEL.txt'), 'w', encoding='utf-8') as fh:
        fh.write(CARA_TEMPEL.format(v=version, vn=version.replace('.', ''), first=order[0][:-3], last=order[-1][:-3], n=len(order)))
    print('paket v%s -> %s %s' % (version, out, sorted(os.listdir(out))))


if __name__ == '__main__':
    main()
