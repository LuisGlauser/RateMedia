#!/usr/bin/env bash
# Publica a pasta wiki/ na Wiki do GitHub.
# Antes, ative a Wiki em Settings → Features e crie a primeira página pelo site.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
REMOTE="${1:-https://github.com/LuisGlauser/RateMedia.wiki.git}"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
git clone --depth 1 "$REMOTE" "$TMP"
find "$TMP" -maxdepth 1 -name '*.md' -delete
cp "$ROOT"/wiki/*.md "$TMP"/
cd "$TMP"
git add -A
git commit -m "docs: atualiza wiki" || { echo "Nada para atualizar."; exit 0; }
git push
