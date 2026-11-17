#!/bin/bash
# $1 = pdf, $2 = prefix ; OCR halaman per halaman (300 dpi, garis tabel dihapus)
pdf="$1"; pre="$2"; n=$(pdfinfo "$pdf" | awk '/^Pages/{print $2}')
for p in $(seq 1 $n); do
  o=$(printf "%s_%03d" "$pre" $p)
  [ -s "$o.txt" ] && continue
  pdftoppm -r 300 -gray -f $p -l $p -singlefile -png "$pdf" "$o"
  python3 /home/claude/g26/tools/unline.py "$o.png" "$o.u.png"
  tesseract "$o.u.png" "$o" --psm 6 -l ind >/dev/null 2>&1
  rm -f "$o.png" "$o.u.png"
done
echo selesai $pre
