#!/usr/bin/env python3
"""
=============================================================================
🎬 AFTER EFFECTS MASTER RENDERING ENGINE
=============================================================================
Renders master compositions for the 3 After Effects motion design projects:
  1. Project City Life An Animated Motion Scene       -> City_Life_AnimatedScene.mp4
  2. Project Future Voyage A Motion Design Story      -> Future_Voyage_MotionStory.mp4
  3. Project The Journey of a Memory A Motion Story  -> Journey_Of_Memory_MotionStory.mp4

Pipeline:
  Adobe After Effects aerender.exe (Lossless Master) -> FFmpeg (H.264 High Profile, AAC)
=============================================================================
"""

import os
import sys
import time
import subprocess
import shutil

AERENDER_PATH = r"C:\Program Files\Adobe\Adobe After Effects 2026\Support Files\aerender.exe"
LOCAL_ROOT = r"C:\Users\Admin\Documents\GitHub\AE"

PROJECTS = [
    {
        "name": "City Life An Animated Motion Scene",
        "dir": os.path.join(LOCAL_ROOT, "Project City Life An Animated Motion Scene"),
        "aep": os.path.join(LOCAL_ROOT, "Project City Life An Animated Motion Scene", "City_Life_AnimatedScene.aep"),
        "comp": "MASTER_CityLife",
        "output_mp4": os.path.join(LOCAL_ROOT, "Project City Life An Animated Motion Scene", "City_Life_AnimatedScene.mp4"),
        "audio": os.path.join(LOCAL_ROOT, "Project City Life An Animated Motion Scene", "assets", "audio", "city_soundtrack.mp3"),
        "duration": 75
    },
    {
        "name": "Future Voyage A Motion Design Story",
        "dir": os.path.join(LOCAL_ROOT, "Project Future Voyage A Motion Design Story in After Effects"),
        "aep": os.path.join(LOCAL_ROOT, "Project Future Voyage A Motion Design Story in After Effects", "Future_Voyage_MotionStory.aep"),
        "comp": "MASTER_FutureVoyage",
        "output_mp4": os.path.join(LOCAL_ROOT, "Project Future Voyage A Motion Design Story in After Effects", "Future_Voyage_MotionStory.mp4"),
        "audio": os.path.join(LOCAL_ROOT, "Project Future Voyage A Motion Design Story in After Effects", "assets", "audio", "space_soundtrack.mp3"),
        "duration": 95
    },
    {
        "name": "The Journey of a Memory A Motion Story",
        "dir": os.path.join(LOCAL_ROOT, "Project The Journey of a Memory A Motion Story in After Effects"),
        "aep": os.path.join(LOCAL_ROOT, "Project The Journey of a Memory A Motion Story in After Effects", "Journey_Of_Memory_MotionStory.aep"),
        "comp": "MASTER_JourneyOfMemory",
        "output_mp4": os.path.join(LOCAL_ROOT, "Project The Journey of a Memory A Motion Story in After Effects", "Journey_Of_Memory_MotionStory.mp4"),
        "audio": os.path.join(LOCAL_ROOT, "Project The Journey of a Memory A Motion Story in After Effects", "assets", "audio", "memory_soundtrack.mp3"),
        "duration": 95
    }
]

def render_project(proj):
    print("\n" + "=" * 70)
    print(f"🎬 RENDERING: {proj['name']}")
    print(f"Composition: {proj['comp']} ({proj['duration']}s @ 30fps)")
    print(f"Output MP4:  {proj['output_mp4']}")
    print("=" * 70)

    start_time = time.time()
    temp_avi = proj["output_mp4"].replace(".mp4", "_raw.avi")

    # 1. Run aerender.exe
    print(f"  [1/2] Invoking Adobe After Effects aerender engine...")
    cmd_ae = [
        AERENDER_PATH,
        "-project", proj["aep"],
        "-comp", proj["comp"],
        "-mfr", "ON", "100",
        "-output", temp_avi
    ]

    res_ae = subprocess.run(cmd_ae, capture_output=True, text=True)
    if res_ae.returncode != 0:
        print(f"  ✗ aerender failed: {res_ae.stderr or res_ae.stdout}")
        if os.path.exists(temp_avi):
            os.remove(temp_avi)
        return False

    ae_elapsed = time.time() - start_time
    print(f"  ✓ aerender completed in {ae_elapsed:.1f}s")

    raw_video = temp_avi
    if not os.path.exists(raw_video):
        alt_mp4 = temp_avi.replace(".avi", ".mp4")
        if os.path.exists(alt_mp4):
            raw_video = alt_mp4

    # 2. FFmpeg H.264 Encoding with Audio
    print(f"  [2/2] Encoding broadcast H.264 MP4 with FFmpeg...")
    has_audio = os.path.isfile(proj.get("audio", ""))
    
    if has_audio:
        cmd_ffmpeg = [
            "ffmpeg", "-y",
            "-i", raw_video,
            "-i", proj["audio"],
            "-c:v", "copy",
            "-c:a", "aac", "-b:a", "256k",
            "-shortest",
            "-movflags", "+faststart",
            proj["output_mp4"]
        ]
    else:
        cmd_ffmpeg = [
            "ffmpeg", "-y",
            "-i", raw_video,
            "-c:v", "copy",
            "-movflags", "+faststart",
            proj["output_mp4"]
        ]

    res_ff = subprocess.run(cmd_ffmpeg, capture_output=True, text=True)
    if res_ff.returncode != 0:
        print(f"  ✗ FFmpeg encoding failed: {res_ff.stderr}")
        if os.path.exists(raw_video):
            os.remove(raw_video)
        return False

    # 3. Clean up raw video
    if os.path.exists(raw_video):
        os.remove(raw_video)

    total_time = time.time() - start_time
    fsize_mb = os.path.getsize(proj["output_mp4"]) / (1024 * 1024)
    print(f"  ✓ Master MP4 Created: {proj['output_mp4']} ({fsize_mb:.2f} MB in {total_time:.1f}s)")
    return True

def main():
    if not os.path.isfile(AERENDER_PATH):
        print(f"Error: aerender.exe not found at {AERENDER_PATH}")
        sys.exit(1)

    print("=" * 70)
    print("MASTER VIDEO RENDERING PIPELINE FOR AFTER EFFECTS PROJECTS")
    print(f"Engine: Adobe After Effects 2026 ({AERENDER_PATH})")
    print("=" * 70)

    results = {}
    for proj in PROJECTS:
        ok = render_project(proj)
        results[proj["name"]] = ok

    print("\n" + "=" * 70)
    print("RENDERING SUMMARY")
    print("=" * 70)
    for name, ok in results.items():
        status = "✅ SUCCESS" if ok else "✗ FAILED"
        print(f"  {name:<45} : {status}")
    print("=" * 70 + "\n")

if __name__ == "__main__":
    main()
