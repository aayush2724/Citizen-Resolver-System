#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$REPO_ROOT/attached_assets/stock_images"
DEST="$REPO_ROOT/client/public/images/stock_images"

mkdir -p "$DEST"

if [ ! -d "$SRC" ]; then
  echo "Source directory not found: $SRC"
  exit 1
fi

for f in "$SRC"/*; do
  fn=$(basename "$f")
  if [ -e "$DEST/$fn" ]; then
    echo "Skipping existing file: $fn"
  else
    echo "Moving $fn -> client/public/images/stock_images/"
    mv "$f" "$DEST/"
  fi
done

# remove src if empty
if [ -z "$(ls -A "$SRC")" ]; then
  rmdir "$SRC"
  echo "Removed empty $SRC"
fi

echo "Asset migration complete. Review files in client/public/images/stock_images/ and remove attached_assets/ if empty."
