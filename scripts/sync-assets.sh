#!/bin/bash
# Sync content assets to web app public directory
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
mkdir -p "$ROOT/apps/web/public/content"
find "$ROOT/content/chapters" -name '*.svg' -exec cp {} "$ROOT/apps/web/public/content/" \;

# Generate available chapter IDs manifest
IDS=$(find "$ROOT/content/chapters" -name '*.json' ! -name '*.quiz.json' -exec basename {} .json \; | sort -n | awk '{printf "\"%s\"", $0}' | sed 's/""/", "/g')
echo "[$IDS]" > "$ROOT/content/available.json"
echo "✓ Assets synced"
