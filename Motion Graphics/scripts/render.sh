#!/bin/bash
# Render one shot: render.sh <project-dir> <TemplateId> <props.json> <out-slug>
set -e
DIR="$1"; TPL="$2"; PROPS="$3"; SLUG="$4"
cd "$DIR"
npx remotion render "$TPL" "out/$SLUG.mov" --props="$PROPS" \
  --codec=prores --prores-profile=4444 --pixel-format=yuva444p10le --image-format=png
echo "RENDERED: $DIR/out/$SLUG.mov"
