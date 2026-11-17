#!/usr/bin/env python3
"""
Scene Detection & Video Splitter (powered by PySceneDetect + FFmpeg)
Video Editing Studio Toolchain
"""

import sys
import os
import subprocess
import argparse
from pathlib import Path

try:
    from scenedetect import open_video, SceneManager
    from scenedetect.detectors import ContentDetector, AdaptiveDetector
    from scenedetect.video_splitter import split_video_ffmpeg
except ImportError:
    print("Error: scenedetect is not installed. Run `pip install scenedetect[opencv]`.")
    sys.exit(1)

def get_studio_root() -> Path:
    current = Path(__file__).resolve().parent
    for parent in [current] + list(current.parents):
        if (parent / "studio").is_dir():
            return parent
    return Path.cwd()

def split_scenes(
    video_path: str,
    output_dir: str = None,
    threshold: float = 27.0,
    min_scene_len: float = 1.0,
    generate_thumbnails: bool = True
) -> list:
    video_file = Path(video_path).resolve()
    if not video_file.exists():
        raise FileNotFoundError(f"Video file not found: {video_file}")

    root = get_studio_root()
    if output_dir is None:
        target_dir = root / "studio" / "clips" / video_file.stem
    else:
        target_dir = Path(output_dir)
    target_dir.mkdir(parents=True, exist_ok=True)

    print(f"\n[Studio SceneSplit] Analyzing video: {video_file.name}")
    print(f"Sensitivity threshold: {threshold}, Min scene length: {min_scene_len}s")

    video = open_video(str(video_file))
    scene_manager = SceneManager()
    scene_manager.add_detector(ContentDetector(threshold=threshold, min_scene_len=int(min_scene_len * video.frame_rate)))

    print("[Studio SceneSplit] Detecting scene cuts...")
    scene_manager.detect_scenes(video, show_progress=True)
    scene_list = scene_manager.get_scene_list()

    print(f"[Studio SceneSplit] Detected {len(scene_list)} scene(s).")
    if not scene_list:
        print("No scene cuts detected; video may be a continuous single take.")
        return []

    print(f"[Studio SceneSplit] Splitting scenes into: {target_dir}")
    split_video_ffmpeg(
        input_video_path=str(video_file),
        scene_list=scene_list,
        output_dir=str(target_dir),
        output_file_template="$VIDEO_NAME-Scene-$SCENE_NUMBER.mp4",
        show_progress=True
    )

    if generate_thumbnails:
        print("[Studio SceneSplit] Generating scene thumbnail posters...")
        for i, (start_time, end_time) in enumerate(scene_list, 1):
            sec = start_time.get_seconds() + 0.1
            thumb_path = target_dir / f"{video_file.stem}-Scene-{i:03d}-thumb.jpg"
            cmd = [
                "ffmpeg", "-y", "-ss", str(sec), "-i", str(video_file),
                "-vframes", "1", "-q:v", "2", str(thumb_path)
            ]
            subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)

    print(f"[Studio SceneSplit] Done! {len(scene_list)} clips created in {target_dir}")
    return scene_list

def main():
    parser = argparse.ArgumentParser(description="Split video into individual scene clips using content-aware detection.")
    parser.add_argument("input", help="Path to raw video file")
    parser.add_argument("--threshold", type=float, default=27.0, help="Cut detection sensitivity (lower = more sensitive, default 27.0)")
    parser.add_argument("--min-len", type=float, default=1.0, help="Minimum scene length in seconds (default 1.0)")
    parser.add_argument("-o", "--output", default=None, help="Custom output directory")
    parser.add_argument("--no-thumbs", action="store_true", help="Skip thumbnail generation")
    args = parser.parse_args()

    split_scenes(
        video_path=args.input,
        output_dir=args.output,
        threshold=args.threshold,
        min_scene_len=args.min_len,
        generate_thumbnails=not args.no_thumbs
    )

if __name__ == "__main__":
    main()
