#!/usr/bin/env python3
"""
Render Master MP4 for Project City Life An Animated Motion Scene.
Uses Adobe After Effects aerender.exe + FFmpeg.
"""
import os, sys, time, subprocess

AERENDER = r"C:\Program Files\Adobe\Adobe After Effects 2026\Support Files\aerender.exe"
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
AEP_PATH = os.path.join(BASE_DIR, "City_Life_AnimatedScene.aep")
OUTPUT_MP4 = os.path.join(BASE_DIR, "City_Life_AnimatedScene.mp4")
TEMP_AVI = os.path.join(BASE_DIR, "City_Life_raw.avi")
AUDIO_PATH = os.path.join(BASE_DIR, "..", "Motion Graphics", "Project files", "coniferous-forest-142569.mp3")

print(f"Rendering: {AEP_PATH} -> {OUTPUT_MP4}")
start = time.time()

# 1. Render comp
cmd_ae = [AERENDER, "-project", AEP_PATH, "-comp", "MASTER_CityLife", "-mfr", "ON", "100", "-output", TEMP_AVI]
res = subprocess.run(cmd_ae, check=True)

# 2. Encode to MP4 with FFmpeg
cmd_ff = ["ffmpeg", "-y", "-i", TEMP_AVI]
if os.path.isfile(AUDIO_PATH):
    cmd_ff += ["-i", AUDIO_PATH, "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18", "-preset", "fast", "-c:a", "aac", "-b:a", "192k", "-shortest"]
else:
    cmd_ff += ["-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18", "-preset", "fast"]
cmd_ff += ["-movflags", "+faststart", OUTPUT_MP4]

subprocess.run(cmd_ff, check=True)
if os.path.exists(TEMP_AVI):
    os.remove(TEMP_AVI)

print(f"✓ Render complete in {time.time() - start:.1f}s -> {OUTPUT_MP4}")
