#!/usr/bin/env python3
"""
Render Master MP4 for Project The Journey of a Memory A Motion Story in After Effects.
Uses Adobe After Effects aerender.exe + FFmpeg.
"""
import os, sys, time, subprocess

AERENDER = r"C:\Program Files\Adobe\Adobe After Effects 2026\Support Files\aerender.exe"
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
AEP_PATH = os.path.join(BASE_DIR, "Journey_Of_Memory_MotionStory.aep")
OUTPUT_MP4 = os.path.join(BASE_DIR, "Journey_Of_Memory_MotionStory.mp4")
TEMP_AVI = os.path.join(BASE_DIR, "Journey_Of_Memory_raw.avi")
AUDIO_PATH = os.path.join(BASE_DIR, "..", "Animated Mobile Weather App Promo Project", "assets", "audio", "promo_soundtrack.mp3")

print(f"Rendering: {AEP_PATH} -> {OUTPUT_MP4}")
start = time.time()

cmd_ae = [AERENDER, "-project", AEP_PATH, "-comp", "MASTER_JourneyOfMemory", "-mfr", "ON", "100", "-output", TEMP_AVI]
subprocess.run(cmd_ae, check=True)

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
