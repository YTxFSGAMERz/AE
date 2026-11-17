#!/usr/bin/env python3
"""
Video Downloader Module (powered by yt-dlp)
Video Editing Studio Toolchain
"""

import sys
import os
import argparse
from pathlib import Path

try:
    import yt_dlp
except ImportError:
    print("Error: yt-dlp is not installed. Run `pip install yt-dlp`.")
    sys.exit(1)

def get_studio_root() -> Path:
    current = Path(__file__).resolve().parent
    for parent in [current] + list(current.parents):
        if (parent / "studio").is_dir():
            return parent
    return Path.cwd()

def download_media(
    url: str,
    output_dir: str = None,
    audio_only: bool = False,
    resolution: str = "1080",
    audio_format: str = "mp3",
    keep_metadata: bool = True
) -> dict:
    root = get_studio_root()
    if output_dir is None:
        target_dir = root / "studio" / ("audio" if audio_only else "raw")
    else:
        target_dir = Path(output_dir)
    target_dir.mkdir(parents=True, exist_ok=True)

    outtmpl = str(target_dir / "%(title).200B-%(id)s.%(ext)s")

    ydl_opts = {
        "outtmpl": outtmpl,
        "quiet": False,
        "no_warnings": False,
        "nocheckcertificate": True,
    }

    if audio_only:
        ydl_opts.update({
            "format": "bestaudio/best",
            "postprocessors": [{
                "key": "FFmpegExtractAudio",
                "preferredcodec": audio_format,
                "preferredquality": "320",
            }],
        })
    else:
        # Video with resolution ceiling (e.g. 1080p, 2160p) + best audio
        res_filter = f"[height<={resolution}]" if resolution and resolution.isdigit() else ""
        ydl_opts.update({
            "format": f"bestvideo{res_filter}+bestaudio/best{res_filter}/best",
            "merge_output_format": "mp4",
        })

    if keep_metadata:
        ydl_opts.update({
            "writethumbnail": True,
            "writeinfojson": False,
        })

    print(f"\n[Studio Download] Starting fetch: {url}")
    print(f"Target directory: {target_dir}")
    print(f"Mode: {'Audio only (' + audio_format + ')' if audio_only else f'Video (max {resolution}p)'}")

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=True)
        filename = ydl.prepare_filename(info)
        if audio_only:
            base, _ = os.path.splitext(filename)
            filename = f"{base}.{audio_format}"

    print(f"[Studio Download] Done! File saved to: {filename}")
    return {"file": filename, "title": info.get("title"), "duration": info.get("duration")}

def main():
    parser = argparse.ArgumentParser(description="Download video/audio for the studio using yt-dlp.")
    parser.add_argument("url", help="Media URL (YouTube, Vimeo, Twitch, etc.)")
    parser.add_argument("--audio", action="store_true", help="Download audio only (default MP3 320kbps)")
    parser.add_argument("--format", default="mp3", choices=["mp3", "wav", "m4a", "flac"], help="Audio export format")
    parser.add_argument("--res", default="1080", help="Max video height (e.g. 720, 1080, 1440, 2160, best)")
    parser.add_argument("-o", "--output", default=None, help="Custom output directory")
    args = parser.parse_args()

    download_media(
        url=args.url,
        output_dir=args.output,
        audio_only=args.audio,
        resolution=args.res,
        audio_format=args.format
    )

if __name__ == "__main__":
    main()
