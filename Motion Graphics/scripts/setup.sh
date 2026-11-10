#!/bin/bash
# Scaffold a motion-director working project from the kit and copy SF Pro fonts.
# Usage: setup.sh <project-dir>
set -e
DIR="$1"
if [ -z "$DIR" ]; then echo "usage: setup.sh <project-dir>"; exit 1; fi
SKILL_DIR="$(cd "$(dirname "$0")/.." && pwd)"

mkdir -p "$DIR/src" "$DIR/public/fonts" "$DIR/out" "$DIR/props"
cp -R "$SKILL_DIR/kit/." "$DIR/"

FONTS=(SF-Pro-Display-Regular SF-Pro-Display-Medium SF-Pro-Display-Semibold SF-Pro-Display-Bold \
       SF-Pro-Text-Regular SF-Pro-Text-Medium SF-Pro-Text-Semibold SF-Pro-Text-Bold)
for f in "${FONTS[@]}"; do
  for src in "/Library/Fonts/$f.otf" "/System/Library/Fonts/$f.otf" "$HOME/Library/Fonts/$f.otf"; do
    [ -f "$src" ] && cp "$src" "$DIR/public/fonts/" && break
  done
done

cd "$DIR"
[ -d node_modules ] || npm install >/dev/null 2>&1
python3 -c "import cv2" 2>/dev/null || pip3 install --quiet --user opencv-python-headless >/dev/null 2>&1 || echo "note: opencv not installed — face-side.py unavailable"
echo "SETUP DONE: $DIR"
