#!/usr/bin/env python3
"""
Whisper-to-HyperFrames Kinetic Subtitle Generator
Bridges Whisper speech transcripts to HyperFrames programmatic motion typography.
"""

import sys
import os
import json
import argparse
from pathlib import Path

def get_studio_root() -> Path:
    current = Path(__file__).resolve().parent
    for parent in [current] + list(current.parents):
        if (parent / "studio").is_dir():
            return parent
    return Path.cwd()

def generate_hyperframes_subtitles(
    json_path: str,
    project_name: str = None,
    width: int = 1920,
    height: int = 1080,
    font_color: str = "#ffffff",
    highlight_color: str = "#fbbf24", # Amber/Gold
    bg_transparent: bool = True
) -> str:
    transcript_file = Path(json_path).resolve()
    if not transcript_file.exists():
        raise FileNotFoundError(f"Transcript JSON not found: {transcript_file}")

    with open(transcript_file, "r", encoding="utf-8") as f:
        data = json.load(f)

    segments = data.get("segments", [])
    if not segments:
        raise ValueError("No segments found in transcript JSON.")

    total_duration = max([seg.get("end", 0.0) for seg in segments]) + 1.0

    root = get_studio_root()
    if project_name is None:
        p_name = f"subs_{transcript_file.stem}"
    else:
        p_name = project_name

    target_dir = root / "studio" / "hyperframes_projects" / p_name
    target_dir.mkdir(parents=True, exist_ok=True)

    # Build HTML and GSAP timeline for karaoke / kinetic captions
    words_html = []
    gsap_anims = []

    for s_idx, seg in enumerate(segments):
        seg_start = seg.get("start", 0.0)
        seg_end = seg.get("end", 0.0)
        seg_duration = max(0.2, seg_end - seg_start)

        words = seg.get("words", [])
        if not words:
            # Fallback to segment text if word timestamps are missing
            w_id = f"seg_{s_idx}"
            words_html.append(
                f'<div id="{w_id}" class="subtitle-card" data-start="{seg_start:.2f}" data-duration="{seg_duration:.2f}">{seg.get("text", "").strip()}</div>'
            )
            gsap_anims.append(
                f'tl.fromTo("#{w_id}", {{ opacity: 0, y: 30, scale: 0.9 }}, {{ opacity: 1, y: 0, scale: 1, duration: 0.25, ease: "back.out(1.7)" }}, {seg_start:.2f});'
            )
            gsap_anims.append(
                f'tl.to("#{w_id}", {{ opacity: 0, y: -20, duration: 0.2, ease: "power2.in" }}, {seg_end:.2f});'
            )
        else:
            group_id = f"grp_{s_idx}"
            spans = []
            for w_idx, w in enumerate(words):
                w_start = w.get("start", seg_start)
                w_end = w.get("end", w_start + 0.2)
                span_id = f"w_{s_idx}_{w_idx}"
                clean_word = w.get("word", "").strip()
                spans.append(f'<span id="{span_id}" class="word">{clean_word}</span>')

                # Highlight animation on exact word hit
                gsap_anims.append(
                    f'tl.fromTo("#{span_id}", {{ color: "{font_color}", scale: 1 }}, {{ color: "{highlight_color}", scale: 1.15, duration: 0.12, ease: "power2.out" }}, {w_start:.2f});'
                )
                gsap_anims.append(
                    f'tl.to("#{span_id}", {{ color: "{font_color}", scale: 1, duration: 0.15, ease: "power2.in" }}, {w_end:.2f});'
                )

            words_html.append(
                f'<div id="{group_id}" class="subtitle-card" data-start="{seg_start:.2f}" data-duration="{seg_duration:.2f}">{" ".join(spans)}</div>'
            )
            gsap_anims.append(
                f'tl.fromTo("#{group_id}", {{ opacity: 0, y: 35, filter: "blur(6px)" }}, {{ opacity: 1, y: 0, filter: "blur(0px)", duration: 0.22, ease: "power3.out" }}, {seg_start:.2f});'
            )
            gsap_anims.append(
                f'tl.to("#{group_id}", {{ opacity: 0, y: -15, filter: "blur(4px)", duration: 0.18, ease: "power2.in" }}, {seg_end:.2f});'
            )

    body_bg = "transparent" if bg_transparent else "#0f172a"
    sub_bg = "rgba(0, 0, 0, 0.65)" if not bg_transparent else "rgba(15, 23, 42, 0.75)"

    html_content = f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width={width}, height={height}" />
  <script src="https://cdn.jsdelivr.net/npm/gsap@3.15.0/dist/gsap.min.js"></script>
  <style>
    * {{
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }}
    html, body {{
      width: {width}px;
      height: {height}px;
      overflow: hidden;
      background: {body_bg};
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }}
    #root {{
      width: 100%;
      height: 100%;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      align-items: center;
      padding-bottom: 90px;
      position: relative;
    }}
    .subtitle-card {{
      position: absolute;
      bottom: 90px;
      background: {sub_bg};
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      padding: 16px 36px;
      border-radius: 24px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
      font-size: 52px;
      font-weight: 800;
      letter-spacing: -0.02em;
      color: {font_color};
      text-align: center;
      max-width: 85%;
      line-height: 1.3;
      border: 1px solid rgba(255, 255, 255, 0.15);
      opacity: 0;
    }}
    .word {{
      display: inline-block;
      margin: 0 6px;
      transform-origin: center center;
    }}
  </style>
</head>
<body>
  <div
    id="root"
    data-composition-id="main"
    data-start="0"
    data-duration="{total_duration:.2f}"
    data-width="{width}"
    data-height="{height}"
  >
    {"\n    ".join(words_html)}
  </div>

  <script>
    window.__timelines = window.__timelines || {{}};
    const tl = gsap.timeline({{ paused: true }});

    {"\n    ".join(gsap_anims)}

    window.__timelines["main"] = tl;
    tl.seek(0);
  </script>
</body>
</html>
"""

    # package.json
    pkg_json = {
        "name": p_name,
        "private": True,
        "type": "module",
        "scripts": {
            "dev": "hyperframes preview",
            "render": "hyperframes render",
            "render-alpha": "hyperframes render --format webm -o overlay.webm"
        }
    }

    # meta.json
    meta_json = {
        "title": f"Kinetic Captions - {transcript_file.stem}",
        "width": width,
        "height": height,
        "fps": 30
    }

    # hyperframes.json
    hf_json = {
        "$schema": "https://hyperframes.heygen.com/schema.json",
        "fps": 30,
        "width": width,
        "height": height
    }

    (target_dir / "index.html").write_text(html_content, encoding="utf-8")
    (target_dir / "package.json").write_text(json.dumps(pkg_json, indent=2), encoding="utf-8")
    (target_dir / "meta.json").write_text(json.dumps(meta_json, indent=2), encoding="utf-8")
    (target_dir / "hyperframes.json").write_text(json.dumps(hf_json, indent=2), encoding="utf-8")

    print(f"\n[Whisper->HyperFrames] Kinetic subtitle project generated at:")
    print(f"  {target_dir}")
    print(f"  Total Duration: {total_duration:.2f}s ({len(segments)} spoken segments)")
    print(f"  Preview command: cd {target_dir} && hyperframes preview")
    print(f"  Render command:  cd {target_dir} && hyperframes render -o subtitles.mp4")

    return str(target_dir)

def main():
    parser = argparse.ArgumentParser(description="Generate HyperFrames kinetic subtitles from Whisper transcript JSON.")
    parser.add_argument("json", help="Path to transcript .json generated by Whisper")
    parser.add_argument("-n", "--name", default=None, help="Project name")
    parser.add_argument("--width", type=int, default=1920, help="Canvas width (default 1920, or 1080 for Reels)")
    parser.add_argument("--height", type=int, default=1080, help="Canvas height (default 1080, or 1920 for Reels)")
    parser.add_argument("--color", default="#ffffff", help="Main font color")
    parser.add_argument("--highlight", default="#fbbf24", help="Spoken word active highlight color")
    parser.add_argument("--opaque", action="store_true", help="Render on dark background instead of transparent")
    args = parser.parse_args()

    generate_hyperframes_subtitles(
        json_path=args.json,
        project_name=args.name,
        width=args.width,
        height=args.height,
        font_color=args.color,
        highlight_color=args.highlight,
        bg_transparent=not args.opaque
    )

if __name__ == "__main__":
    main()
