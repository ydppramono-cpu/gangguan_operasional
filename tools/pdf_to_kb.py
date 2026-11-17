"""Ubah PDF/PPTX sumber menjadi teks berhalaman untuk bank kepintaran LLM (Claude/ChatGPT).
Setiap berkas diberi kepala metadata (judul, sumber, SHA-256, tanggal ekstrak) dan penanda '=== Halaman N ===' agar jawaban LLM dapat menyebut halaman.
Pakai: python3 tools/pdf_to_kb.py <keluaran_dir> <berkas...>"""
import sys, os, subprocess, hashlib, datetime, re
out = sys.argv[1]; os.makedirs(out, exist_ok=True)
def sha(p):
    h = hashlib.sha256(); h.update(open(p, 'rb').read()); return h.hexdigest()
def slug(n): return re.sub(r'[^0-9A-Za-z]+', '_', os.path.splitext(os.path.basename(n))[0]).strip('_')[:90]
for p in sys.argv[2:]:
    name = os.path.basename(p); pages = []
    if p.lower().endswith('.pdf'):
        n = int(re.search(r'Pages:\s+(\d+)', subprocess.run(['pdfinfo', p], capture_output=True, text=True).stdout).group(1))
        txt = subprocess.run(['pdftotext', '-layout', p, '-'], capture_output=True, text=True).stdout
        pages = txt.split('\f')[:n]
    elif p.lower().endswith('.pptx'):
        from pptx import Presentation
        for s in Presentation(p).slides:
            t = []
            for sh in s.shapes:
                if sh.has_text_frame: t.append(sh.text_frame.text)
                if getattr(sh, 'has_table', False) and sh.has_table:
                    for r in sh.table.rows: t.append(' | '.join(c.text for c in r.cells))
            pages.append('\n'.join(t))
    hdr = ['# ' + name, '', '- Sumber berkas: ' + name, '- SHA-256: ' + sha(p), '- Diekstrak: ' + datetime.date.today().isoformat() + ' (pdftotext -layout / python-pptx, tanpa koreksi isi)',
           '- Halaman/slide: %d' % len(pages), '- Catatan: teks mentah hasil ekstraksi; tata letak tabel bisa bergeser. Rujuk berkas asli untuk angka penting.', '']
    body = '\n'.join('=== Halaman %d ===\n%s' % (i + 1, re.sub(r'[ \t]+\n', '\n', pg).strip()) for i, pg in enumerate(pages))
    fn = os.path.join(out, slug(name) + '.txt')
    open(fn, 'w', encoding='utf-8').write('\n'.join(hdr) + '\n' + body + '\n')
    print('%8d B  %4d hlm  %s' % (os.path.getsize(fn), len(pages), fn))
