#!/usr/bin/env python3
"""
Video Editing Toolkit (powered by FFmpeg)
Core Video Editing Operations: Trim, Concat, Subtitle Burning, Aspect Ratio Conversion, Proxy Gen
"""

import sys
import os
import subprocess
import argparse
from pathlib import Path

def get_studio_root() -> Path:
    current = Path(__file__).resolve().parent
    for parent in [current] + list(current.parents):
        if (parent / "studio").is_dir():
            return parent
    return Path.cwd()

def run_ffmpeg(cmd: list, desc: str = "Processing") -> bool:
    print(f"\n[Video Toolkit] {desc}...")
    # Add winget links path if not present in env
    env = os.environ.copy()
    user_links = r"C:\Users\Admin\AppData\Local\Microsoft\WinGet\Links"
    if user_links not in env.get("PATH", ""):
        env["PATH"] = f"{user_links};{env.get('PATH', '')}"

    result = subprocess.run(cmd, env=env)
    if result.returncode != 0:
        print(f"[Video Toolkit] Error: FFmpeg failed with exit code {result.returncode}")
        return False
    return True

def trim_video(input_path: str, start: str, end: str, output_path: str = None, reencode: bool = False) -> str:
    inp = Path(input_path).resolve()
    if output_path is None:
        out = inp.parent / f"{inp.stem}_trim_{start.replace(':', '.')}_{end.replace(':', '.')}.mp4"
    else:
        out = Path(output_path).resolve()

    if reencode:
        cmd = ["ffmpeg", "-y", "-ss", start, "-to", end, "-i", str(inp),
               "-c:v", "libx264", "-crf", "18", "-preset", "fast", "-c:a", "aac", "-b:a", "192k", str(out)]
    else:
        # Fast copy
        cmd = ["ffmpeg", "-y", "-ss", start, "-to", end, "-i", str(inp),
               "-c", "copy", str(out)]

    if run_ffmpeg(cmd, f"Trimming '{inp.name}' from {start} to {end}"):
        print(f"[Video Toolkit] Saved trimmed video: {out}")
        return str(out)
    return ""

def concat_videos(input_paths: list, output_path: str = None) -> str:
    if not input_paths:
        print("No files provided for concatenation.")
        return ""

    first = Path(input_paths[0]).resolve()
    if output_path is None:
        root = get_studio_root()
        out = root / "studio" / "renders" / f"concat_{first.stem}.mp4"
    else:
        out = Path(output_path).resolve()
    out.parent.mkdir(parents=True, exist_ok=True)

    # Write concat list file
    list_file = out.parent / "_concat_list.txt"
    with open(list_file, "w", encoding="utf-8") as f:
        for p in input_paths:
            resolved = Path(p).resolve().as_posix()
            f.write(f"file '{resolved}'\n")

    cmd = ["ffmpeg", "-y", "-f", "concat", "-safe", "0", "-i", str(list_file),
           "-c", "copy", str(out)]
    success = run_ffmpeg(cmd, f"Concatenating {len(input_paths)} files")
    if list_file.exists():
        list_file.unlink()

    if success:
        print(f"[Video Toolkit] Concatenated video saved to: {out}")
        return str(out)
    return ""

def to_vertical_reels(input_path: str, output_path: str = None) -> str:
    """Converts 16:9 landscape to 9:16 vertical (1080x1920) with blurred cinematic background."""
    inp = Path(input_path).resolve()
    if output_path is None:
        root = get_studio_root()
        out = root / "studio" / "renders" / f"{inp.stem}_vertical_9x16.mp4"
    else:
        out = Path(output_path).resolve()
    out.parent.mkdir(parents=True, exist_ok=True)

    # Filter graph: Scale & blur background to fill 1080x1920, overlay sharp fit video in center
    filter_complex = (
        "[0:v]scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920,"
        "boxblur=20:5[bg];"
        "[0:v]scale=1080:-1:force_original_aspect_ratio=decrease[fg];"
        "[bg][fg]overlay=(W-w)/2:(H-h)/2[outv]"
    )

    cmd = ["ffmpeg", "-y", "-i", str(inp),
           "-filter_complex", filter_complex,
           "-map", "[outv]", "-map", "0:a?",
           "-c:v", "libx264", "-crf", "18", "-preset", "fast",
           "-c:a", "aac", "-b:a", "192k", str(out)]

    if run_ffmpeg(cmd, f"Converting '{inp.name}' to 9:16 vertical with blurred backdrop"):
        print(f"[Video Toolkit] Vertical Reel/Short saved to: {out}")
        return str(out)
    return ""

def burn_subtitles(video_path: str, srt_path: str, output_path: str = None, font_size: int = 18) -> str:
    """Burns SRT subtitles onto video with high-visibility styling (yellow/white with outline)."""
    vid = Path(video_path).resolve()
    srt = Path(srt_path).resolve()
    if output_path is None:
        root = get_studio_root()
        out = root / "studio" / "renders" / f"{vid.stem}_subtitled.mp4"
    else:
        out = Path(output_path).resolve()
    out.parent.mkdir(parents=True, exist_ok=True)

    # Escape path for FFmpeg subtitles filter
    escaped_srt = str(srt).replace("\\", "/").replace(":", "\\:")
    sub_style = f"subtitles='{escaped_srt}':force_style='FontName=Arial,FontSize={font_size},PrimaryColour=&H00FFFFFF,OutlineColour=&H00000000,BorderStyle=3,Outline=2,Shadow=1,MarginV=30'"

    cmd = ["ffmpeg", "-y", "-i", str(vid),
           "-vf", sub_style,
           "-c:v", "libx264", "-crf", "18", "-preset", "fast",
           "-c:a", "copy", str(out)]

    if run_ffmpeg(cmd, f"Burning subtitles from '{srt.name}' onto '{vid.name}'"):
        print(f"[Video Toolkit] Subtitled master video saved to: {out}")
        return str(out)
    return ""

def extract_audio(video_path: str, format: str = "wav", output_path: str = None) -> str:
    vid = Path(video_path).resolve()
    if output_path is None:
        root = get_studio_root()
        out = root / "studio" / "audio" / f"{vid.stem}.{format}"
    else:
        out = Path(output_path).resolve()
    out.parent.mkdir(parents=True, exist_ok=True)

    cmd = ["ffmpeg", "-y", "-i", str(vid), "-vn"]
    if format == "wav":
        cmd.extend(["-acodec", "pcm_s16le", "-ar", "16000", "-ac", "1", str(out)])
    else:
        cmd.extend(["-c:a", "libmp3lame", "-b:a", "320k", str(out)])

    if run_ffmpeg(cmd, f"Extracting audio track from '{vid.name}'"):
        print(f"[Video Toolkit] Audio extracted to: {out}")
        return str(out)
    return ""

def create_proxy(video_path: str, output_path: str = None) -> str:
    vid = Path(video_path).resolve()
    if output_path is None:
        out = vid.parent / f"{vid.stem}_proxy_720p.mp4"
    else:
        out = Path(output_path).resolve()

    cmd = ["ffmpeg", "-y", "-i", str(vid),
           "-vf", "scale=-2:720",
           "-c:v", "libx264", "-preset", "ultrafast", "-crf", "23",
           "-c:a", "aac", "-b:a", "128k", str(out)]

    if run_ffmpeg(cmd, f"Generating 720p proxy for '{vid.name}'"):
        print(f"[Video Toolkit] Proxy generated: {out}")
        return str(out)
    return ""

def change_speed(video_path: str, speed_factor: float, output_path: str = None) -> str:
    vid = Path(video_path).resolve()
    if output_path is None:
        out = vid.parent / f"{vid.stem}_{speed_factor}x.mp4"
    else:
        out = Path(output_path).resolve()

    pts = 1.0 / speed_factor
    cmd = ["ffmpeg", "-y", "-i", str(vid),
           "-filter_complex", f"[0:v]setpts={pts}*PTS[v];[0:a]atempo={speed_factor}[a]",
           "-map", "[v]", "-map", "[a]",
           "-c:v", "libx264", "-crf", "18", "-preset", "fast", str(out)]

    if run_ffmpeg(cmd, f"Changing playback speed to {speed_factor}x"):
        print(f"[Video Toolkit] Adjusted speed video: {out}")
        return str(out)
    return ""

def main():
    parser = argparse.ArgumentParser(description="FFmpeg-powered Video Editing Toolkit.")
    subparsers = parser.add_subparsers(dest="action", required=True)

    # Trim
    trim_p = subparsers.add_parser("trim", help="Cut clip from start to end")
    trim_p.add_argument("input", help="Input video")
    trim_p.add_argument("--start", required=True, help="Start time (e.g. 00:01:15 or 75)")
    trim_p.add_argument("--end", required=True, help="End time (e.g. 00:02:30 or 150)")
    trim_p.add_argument("-o", "--output", default=None, help="Output path")
    trim_p.add_argument("--reencode", action="store_true", help="Re-encode for frame-exact cuts")

    # Concat
    cat_p = subparsers.add_parser("concat", help="Merge multiple videos")
    cat_p.add_argument("inputs", nargs="+", help="Input videos in order")
    cat_p.add_argument("-o", "--output", default=None, help="Output path")

    # Vertical
    vert_p = subparsers.add_parser("vertical", help="Convert 16:9 to 9:16 vertical Reel/Short")
    vert_p.add_argument("input", help="Input video")
    vert_p.add_argument("-o", "--output", default=None, help="Output path")

    # Burn subs
    subs_p = subparsers.add_parser("burn-subs", help="Burn SRT subtitles onto video")
    subs_p.add_argument("input", help="Input video")
    subs_p.add_argument("--srt", required=True, help="Path to .srt subtitle file")
    subs_p.add_argument("--font-size", type=int, default=18, help="Subtitle font size (default 18)")
    subs_p.add_argument("-o", "--output", default=None, help="Output path")

    # Audio extract
    aud_p = subparsers.add_parser("extract-audio", help="Extract audio from video")
    aud_p.add_argument("input", help="Input video")
    aud_p.add_argument("--format", default="wav", choices=["wav", "mp3"], help="Audio format")
    aud_p.add_argument("-o", "--output", default=None, help="Output path")

    # Proxy
    proxy_p = subparsers.add_parser("proxy", help="Create lightweight 720p proxy")
    proxy_p.add_argument("input", help="Input video")
    proxy_p.add_argument("-o", "--output", default=None, help="Output path")

    # Speed
    speed_p = subparsers.add_parser("speed", help="Change playback speed")
    speed_p.add_argument("input", help="Input video")
    speed_p.add_argument("--factor", type=float, required=True, help="Speed multiplier (e.g. 1.25, 1.5, 2.0)")
    speed_p.add_argument("-o", "--output", default=None, help="Output path")

    args = parser.parse_args()

    if args.action == "trim":
        trim_video(args.input, args.start, args.end, args.output, args.reencode)
    elif args.action == "concat":
        concat_videos(args.inputs, args.output)
    elif args.action == "vertical":
        to_vertical_reels(args.input, args.output)
    elif args.action == "burn-subs":
        burn_subtitles(args.input, args.srt, args.output, args.font_size)
    elif args.action == "extract-audio":
        extract_audio(args.input, args.format, args.output)
    elif args.action == "proxy":
        create_proxy(args.input, args.output)
    elif args.action == "speed":
        change_speed(args.input, args.factor, args.output)

if __name__ == "__main__":
    main()
