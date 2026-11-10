#!/bin/bash
# Render every approved shot: render-batch.sh <project> <shots.txt>   (lines: "<TemplateId> <slug>")
# Writes out/<slug>.mov (ProRes 4444 + alpha) and out/preview-<slug>.mp4 (H.264 on paper, AAC) per line.
# stdin-safe: every ffmpeg/remotion call reads /dev/null so the list is never swallowed.
cd "$1" || exit 1; LIST="$2"
while read -r tpl slug; do
  [ -z "$tpl" ] && continue
  echo "=== $slug ($tpl)"
  bash ~/.claude/skills/motion-director/scripts/render.sh "$PWD" "$tpl" "props/$slug.json" "$slug" </dev/null 2>&1 | grep -E "RENDERED|Error|rror:"
  ffmpeg -nostdin -v error -y -i "out/$slug.mov" -f lavfi -i "color=c=0xFBFBFD:s=1920x1080:r=30" -filter_complex "[1][0]overlay=shortest=1,format=yuv420p" -c:v libx264 -crf 21 -c:a aac -b:a 192k -ar 48000 "out/preview-$slug.mp4" </dev/null
done < "$LIST"
echo "BATCH DONE"
