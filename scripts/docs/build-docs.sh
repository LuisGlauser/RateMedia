#!/usr/bin/env bash
# Gera public/docs/word/RateMedia-Documentacao.docx e public/docs/pdf/RateMedia-Documentacao.pdf
# a partir dos arquivos Markdown de public/docs/md. Requer pandoc, Python 3 e Playwright (Chromium).
set -euo pipefail
export LANG=C.UTF-8 LC_ALL=C.UTF-8
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
DOCS="$ROOT/public/docs"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

# Junta os capítulos e troca os SVGs pelos PNGs (melhor compatibilidade com Word/PDF).
for f in "$DOCS"/md/[0-9][0-9]-*.md; do
  sed -e 's#\.\./diagramas/\([a-z0-9-]*\)\.svg#'"$DOCS"'/diagramas/\1.png#g' "$f"
  printf '\n\n'
done > "$TMP/all.md"

META=(--metadata="title=RateMedia — Documentação do Projeto" --metadata="author=Arthur Gaspare Camzano" --metadata="date=$(date +%d/%m/%Y)" --metadata=lang=pt-BR)

# Word
pandoc "$TMP/all.md" -o "$DOCS/word/RateMedia-Documentacao.docx" \
  --toc --toc-depth=2 "${META[@]}" --reference-doc="$ROOT/scripts/docs/reference.docx"

# PDF (HTML estilizado impresso pelo Chromium)
pandoc "$TMP/all.md" -s -o "$TMP/doc.html" --toc --toc-depth=2 "${META[@]}" \
  --css="$ROOT/scripts/docs/print.css" --embed-resources --metadata=toc-title:Sumário
node "$ROOT/scripts/docs/html-to-pdf.mjs" "$TMP/doc.html" "$DOCS/pdf/RateMedia-Documentacao.pdf"
echo "Documentos gerados em $DOCS/word e $DOCS/pdf"
