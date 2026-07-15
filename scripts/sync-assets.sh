#!/usr/bin/env bash
#
# sync-assets.sh — build content + social assets for the web app.
#
# For every chapter illustration under content/chapters/*/*.svg it emits:
#   - apps/web/public/content/<id>.png   (800px wide, aspect preserved) for the app
#   - apps/web/public/og/mission-<id>.png (exactly 1200x630) for social previews
#
# It also regenerates content/available.json — the manifest of chapter ids that
# have content — which the app reads to decide locked/unlocked state.
#
# OG images are rendered onto a fixed 1200x630 brand-coloured canvas with the
# illustration centred (aspect preserved). This guarantees the dimensions the
# meta tags declare, so crawlers never reject a mis-sized card — plain
# `rsvg-convert --keep-aspect-ratio` cannot guarantee an exact output size.

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

CONTENT_DIR="$ROOT/content/chapters"
CONTENT_OUT="$ROOT/apps/web/public/content"
OG_OUT="$ROOT/apps/web/public/og"

# Brand background for OG letterboxing (parchment). Keep in sync with the app.
OG_BG="#FAF7F2"
OG_W=1200
OG_H=630

# --- Dependency checks -----------------------------------------------------
missing=()
for bin in rsvg-convert jq base64; do
  command -v "$bin" >/dev/null 2>&1 || missing+=("$bin")
done
if [ "${#missing[@]}" -gt 0 ]; then
  echo "✗ Missing required tool(s): ${missing[*]}" >&2
  echo "  Install with: brew install librsvg jq" >&2
  exit 1
fi

mkdir -p "$CONTENT_OUT" "$OG_OUT"

# Temp dir for the OG wrapper SVGs; cleaned up on any exit.
TMP_DIR="$(mktemp -d)"
cleanup() { rm -rf "$TMP_DIR"; }
trap cleanup EXIT

shopt -s nullglob

count=0
for svg in "$CONTENT_DIR"/*/*/*.svg "$CONTENT_DIR"/*/*.svg; do
  [ -f "$svg" ] || continue
  id="$(basename "$svg" .svg)"

  # Content image used inside the app (800px wide, aspect preserved).
  rsvg-convert "$svg" -w 800 --keep-aspect-ratio -o "$CONTENT_OUT/${id}.png"

  # OG image: embed the illustration (base64 data URI, so librsvg actually
  # rasterises it) centred on a fixed brand canvas with aspect preserved.
  b64="$(base64 < "$svg" | tr -d '\n')"
  wrapper="$TMP_DIR/og-${id}.svg"
  cat > "$wrapper" <<EOF
<svg width="$OG_W" height="$OG_H" viewBox="0 0 $OG_W $OG_H" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <rect width="$OG_W" height="$OG_H" fill="$OG_BG"/>
  <image x="0" y="0" width="$OG_W" height="$OG_H" preserveAspectRatio="xMidYMid meet" xlink:href="data:image/svg+xml;base64,$b64"/>
</svg>
EOF
  rsvg-convert "$wrapper" -w "$OG_W" -h "$OG_H" -o "$OG_OUT/mission-${id}.png"

  count=$((count + 1))
done

if [ "$count" -eq 0 ]; then
  echo "✗ No chapter SVGs found under $CONTENT_DIR" >&2
  exit 1
fi

# Manifest of chapter ids that have content (excludes *.quiz.json). Built with
# jq so ids are always valid JSON strings, sorted numerically.
find "$CONTENT_DIR" -name '*.json' ! -name '*.quiz.json' -exec basename {} .json \; \
  | sort -u | jq -R . | jq -s 'sort_by(tonumber? // .)'> "$ROOT/content/available.json"

echo "✓ Converted $count SVG(s) → PNGs in apps/web/public/content/"
echo "✓ Generated $count OG image(s) (${OG_W}x${OG_H}) in apps/web/public/og/"
echo "✓ Generated content/available.json"
