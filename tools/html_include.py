"""Menggabungkan berkas HTML modular (src/*.html) menjadi satu halaman, meniru include() di 07_Main.gs.

Dipakai oleh tools/pack.py (paket tempel manual) dan tools/check_build.py (pemeriksaan sebelum push).
Aturan: penanda include harus persis `<?!= include('Nama'); ?>`; Nama = nama berkas tanpa .html.
"""
import os
import re

INCLUDE_RE = re.compile(r"<\?!= include\('([^']+)'\); \?>")


def expand(src_dir, name, stack=()):
    """Kembalikan isi `name`.html dengan semua include diganti isi berkasnya (rekursif, tanpa siklus)."""
    if name in stack:
        raise ValueError('include melingkar: ' + ' -> '.join(stack + (name,)))
    path = os.path.join(src_dir, name + '.html')
    if not os.path.exists(path):
        raise FileNotFoundError('include tidak ditemukan: %s (dipanggil dari %s)' % (name, stack[-1] if stack else '-'))
    with open(path, encoding='utf-8') as fh:
        text = fh.read()
    return INCLUDE_RE.sub(lambda m: expand(src_dir, m.group(1), stack + (name,)), text)


def used_partials(src_dir, name='Index', seen=None):
    """Himpunan nama parsial yang terjangkau dari `name`."""
    seen = set() if seen is None else seen
    with open(os.path.join(src_dir, name + '.html'), encoding='utf-8') as fh:
        for child in INCLUDE_RE.findall(fh.read()):
            if child not in seen:
                seen.add(child)
                used_partials(src_dir, child, seen)
    return seen
