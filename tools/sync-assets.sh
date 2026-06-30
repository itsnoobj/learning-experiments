#!/bin/bash
# Sync content assets (SVGs) to the web app's public directory
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(dirname "$SCRIPT_DIR")"

mkdir -p "$ROOT/apps/web/public/content"

# Copy all SVGs from content chapters to public
find "$ROOT/content/chapters" -name '*.svg' -exec cp {} "$ROOT/apps/web/public/content/" \;

echo "✓ Synced SVGs to apps/web/public/content/"
