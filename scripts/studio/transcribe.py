#!/usr/bin/env python3
"""
Audio/Video Transcription Module (powered by OpenAI Whisper)
Video Editing Studio Toolchain
"""

import sys
import os
import json
import argparse
from pathlib import Path

try:
    import whisper
    from whisper.utils import get_writer
except ImportError:
    print("Error: openai-whisper is not installed. Run `pip install openai-whisper`.")
    sys.exit(1)

def get_studio_root() -> Path:
    current = Path(__file__).resolve().parent
    for parent in [current] + list(current.parents):
        if (parent / "studio").is_dir():
            return parent
    return Path.cwd()

def transcribe_media(
    media_path: str,
    output_dir: str = None,
    model_name: str = "base",
    language: str = None,
    word_timestamps: bool = True,
    device: str = "cpu"
) -> dict:
    media_file = Path(media_path).resolve()
    if not media_file.exists():
        raise FileNotFoundError(f"Media file not found: {media_file}")

    root = get_studio_root()
    if output_dir is None:
        target_dir = root / "studio" / "transcripts"
    else:
        target_dir = Path(output_dir)
    target_dir.mkdir(parents=True, exist_ok=True)

    print(f"\n[Studio Whisper] Loading model: '{model_name}' on {device.upper()}...")
    model = whisper.load_model(model_name, device=device)

    print(f"[Studio Whisper] Transcribing: {media_file.name}")
    options = {
        "word_timestamps": word_timestamps,
        "verbose": False
    }
    if language:
        options["language"] = language

    result = model.transcribe(str(media_file), **options)

    stem = media_file.stem
    print(f"[Studio Whisper] Writing formats (srt, vtt, json, txt) to: {target_dir}")

    # Standard writers
    for fmt in ["srt", "vtt", "txt", "tsv"]:
        writer = get_writer(fmt, str(target_dir))
        writer(result, stem)

    # Detailed word-level JSON
    json_path = target_dir / f"{stem}.json"
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(result, f, indent=2, ensure_ascii=False)

    print(f"[Studio Whisper] Done! Transcript saved. Detected language: {result.get('language')}")
    print(f"  SRT:  {target_dir / (stem + '.srt')}")
    print(f"  VTT:  {target_dir / (stem + '.vtt')}")
    print(f"  JSON: {json_path}")

    return {
        "text": result.get("text", "").strip(),
        "language": result.get("language"),
        "segments": result.get("segments", []),
        "output_dir": str(target_dir),
        "stem": stem
    }

def main():
    parser = argparse.ArgumentParser(description="Transcribe media files using Whisper with word-level timestamps.")
    parser.add_argument("input", help="Path to video or audio file (MP4, MKV, WAV, MP3, etc.)")
    parser.add_argument("--model", default="base", choices=["tiny", "base", "small", "medium", "large", "turbo"], help="Whisper model (default: base)")
    parser.add_argument("--lang", default=None, help="Spoken language code (e.g. en, es, fr, de, ja)")
    parser.add_argument("--device", default="cpu", choices=["cpu", "cuda"], help="Inference device")
    parser.add_argument("-o", "--output", default=None, help="Custom output directory")
    args = parser.parse_args()

    transcribe_media(
        media_path=args.input,
        output_dir=args.output,
        model_name=args.model,
        language=args.lang,
        device=args.device
    )

if __name__ == "__main__":
    main()
