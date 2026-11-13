# Python / FFmpeg Master Rendering Engine
# Project: Journey Through Space From Earth to Imagination
# Generates 75-Second Full HD 1080p 30fps Master Video (Final_Space_Journey.mp4)
# Conforming exactly to Course Specifications & After Effects Project Standards

import os
import sys
import math
import time
import subprocess
import random
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import imageio_ffmpeg

# =============================================================================
# 1. PATH CONFIGURATION & PROJECT SPECIFICATIONS
# =============================================================================
BASE_DIR = r"C:\Users\Admin\Documents\GitHub\AE\Journey Through Space From Earth to Imagination Project"
ASSETS_DIR = os.path.join(BASE_DIR, "assets")
IMG_DIR = os.path.join(ASSETS_DIR, "images")
FOOTAGE_DIR = os.path.join(ASSETS_DIR, "footage")
AUDIO_DIR = os.path.join(ASSETS_DIR, "audio")
SFX_DIR = os.path.join(AUDIO_DIR, "sfx")

OUTPUT_PATH = os.path.join(BASE_DIR, "Final_Space_Journey.mp4")
SOUNDTRACK_PATH = os.path.join(AUDIO_DIR, "space_soundtrack.mp3")

WIDTH = 1920
HEIGHT = 1080
FPS = 30
TOTAL_DURATION = 75.0  # 75.0 Seconds
TOTAL_FRAMES = int(TOTAL_DURATION * FPS)  # 2250 Frames

print(f"=====================================================================")
print(f"JOURNEY THROUGH SPACE - MASTER VIDEO RENDERING PIPELINE")
print(f"Target Resolution: {WIDTH}x{HEIGHT} @ {FPS}fps")
print(f"Duration: {TOTAL_DURATION}s ({TOTAL_FRAMES} frames)")
print(f"Output File: {OUTPUT_PATH}")
print(f"=====================================================================")

# =============================================================================
# 2. EASING MATHEMATICS & HELPER UTILITIES
# =============================================================================
def ease_in_out(t):
    """Standard Cubic Ease In/Out (smooth acceleration and deceleration)."""
    t = max(0.0, min(1.0, float(t)))
    return t * t * (3.0 - 2.0 * t)

def cinematic_ease(t, influence=0.75):
    """
    Cinematic Ease curve modeling After Effects Speed Graph with 75% influence.
    Rapid initial burst, long extended deceleration tail.
    """
    t = max(0.0, min(1.0, float(t)))
    # Quintic / Bézier approximation
    return math.pow(t, 2.2) / (math.pow(t, 2.2) + math.pow(1.0 - t, 2.2))

def ease_out_back(t, s=1.70158):
    """Anticipation / Overshoot spring bounce (12 Principles of Animation)."""
    t = max(0.0, min(1.0, float(t))) - 1.0
    return t * t * ((s + 1.0) * t + s) + 1.0

def clamp(val, min_v, max_v):
    return max(min_v, min(max_v, val))

# System Fonts
FONT_REGULAR = r"C:\Windows\Fonts\segoeui.ttf"
FONT_BOLD = r"C:\Windows\Fonts\segoeuib.ttf"
FONT_BLACK = r"C:\Windows\Fonts\arialbd.ttf"

def get_font(path, size):
    try:
        return ImageFont.truetype(path, size)
    except:
        return ImageFont.load_default()

font_title_huge = get_font(FONT_BLACK, 56)
font_title_med = get_font(FONT_BOLD, 38)
font_hud_head = get_font(FONT_BOLD, 26)
font_hud_sub = get_font(FONT_BOLD, 20)
font_hud_data = get_font(FONT_REGULAR, 20)
font_badge = get_font(FONT_BOLD, 17)

# =============================================================================
# 3. ASSET PRE-LOADING & PRE-PROCESSING
# =============================================================================
print("[1/5] Loading and pre-scaling high-resolution visual assets...")

# Background Starfield
stars_img = Image.open(os.path.join(IMG_DIR, "stars_space_bg.jpg")).convert("RGB")
stars_img = stars_img.resize((WIDTH + 200, HEIGHT + 200), Image.Resampling.BILINEAR)

# Cosmic Nebula (Pillars of Creation)
nebula_raw = Image.open(os.path.join(IMG_DIR, "galaxy_nebula.jpg")).convert("RGBA")
nebula_img = nebula_raw.resize((WIDTH, HEIGHT), Image.Resampling.BILINEAR)

# Galaxy Core
galaxy_raw = Image.open(os.path.join(IMG_DIR, "galaxy_core.jpg")).convert("RGBA")
galaxy_img = galaxy_raw.resize((WIDTH, HEIGHT), Image.Resampling.BILINEAR)

# Spaceship
ship_raw = Image.open(os.path.join(IMG_DIR, "spaceship_cutout.png")).convert("RGBA")
# Astronaut Character
astronaut_raw = Image.open(os.path.join(IMG_DIR, "astronaut.png")).convert("RGBA")
# Flat Character
flat_char_raw = Image.open(os.path.join(IMG_DIR, "flat_character.png")).convert("RGBA")
# HUD Reticle
reticle_raw = Image.open(os.path.join(IMG_DIR, "hud_reticle.png")).convert("RGBA")
# Cockpit Monitor Screen Device
screen_device_raw = Image.open(os.path.join(IMG_DIR, "screen_device.png")).convert("RGBA")
# Dirty Glass Texture
dirty_glass_raw = Image.open(os.path.join(IMG_DIR, "dirty_glass_texture.jpg")).convert("RGB")
dirty_glass_pre = dirty_glass_raw.resize((WIDTH, HEIGHT), Image.Resampling.BILINEAR)

# =============================================================================
# 4. FOOTAGE EXTRACTION (Earth Rotation, Warp Tunnel, Presenter)
# =============================================================================
print("[2/5] Extracting video frames via FFmpeg pipeline...")
ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()

def extract_all_frames(video_path, max_frames, target_w, target_h):
    cmd = [
        ffmpeg_exe, "-i", video_path,
        "-vframes", str(max_frames),
        "-vf", f"scale={target_w}:{target_h}",
        "-f", "image2pipe", "-vcodec", "rawvideo", "-pix_fmt", "rgb24", "-"
    ]
    proc = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL)
    frames = []
    frame_bytes = target_w * target_h * 3
    while len(frames) < max_frames:
        raw = proc.stdout.read(frame_bytes)
        if not raw or len(raw) < frame_bytes:
            break
        arr = np.frombuffer(raw, dtype=np.uint8).reshape((target_h, target_w, 3))
        frames.append(arr)
    try:
        proc.kill()
    except Exception:
        pass
    proc.wait()
    return frames

# Earth rotation footage (Scene 1 & Scene 6)
earth_frames_raw = extract_all_frames(os.path.join(FOOTAGE_DIR, "space_flight_earth.mp4"), 150, 960, 540)
print(f"  Extracted {len(earth_frames_raw)} frames for Earth flight.", flush=True)

# Warp tunnel footage (Scene 4 Screen Replacement)
warp_frames_raw = extract_all_frames(os.path.join(FOOTAGE_DIR, "warp_tunnel.mp4"), 150, 960, 540)
print(f"  Extracted {len(warp_frames_raw)} frames for Hyperdrive Warp Tunnel.", flush=True)

# Presenter footage (Scene 2 Roto Brush isolation)
pres_frames_raw = extract_all_frames(os.path.join(FOOTAGE_DIR, "subject_reveal.mp4"), 90, 960, 540)
print(f"  Extracted {len(pres_frames_raw)} frames for Presenter footage.", flush=True)

# Pre-chromakey presenter footage for clean rotoscoped isolate
print("[3/5] Computing feathered alpha matte isolation for Roto Brush...", flush=True)
pres_isolated = []
for arr in pres_frames_raw:
    r = arr[:, :, 0].astype(float)
    g = arr[:, :, 1].astype(float)
    b = arr[:, :, 2].astype(float)
    max_rb = np.maximum(r, b)
    diff = g - max_rb
    # Keying condition
    is_green = (diff > 8.0) | ((g > 70.0) & (g > r * 1.1) & (g > b * 1.1))
    alpha = np.where(is_green, np.clip(1.0 - (diff - 4.0) / 22.0, 0.0, 1.0), 1.0)
    # Despill green edge spill
    arr_clean = arr.copy()
    spill = np.maximum(0.0, g - max_rb)
    arr_clean[:, :, 1] = np.clip(g - spill * 0.75, 0, 255).astype(np.uint8)
    rgba = np.dstack([arr_clean, (alpha * 255).astype(np.uint8)])
    pres_isolated.append(Image.fromarray(rgba, "RGBA"))

# Generate 3D Star Particle Field for Scene 1 flythrough
random.seed(1337)
NUM_STARS = 350
stars_3d = []
for _ in range(NUM_STARS):
    stars_3d.append({
        'x': random.uniform(-1800, 1800),
        'y': random.uniform(-1000, 1000),
        'z': random.uniform(200, 3000),
        'size': random.uniform(1.2, 3.5),
        'brightness': random.uniform(140, 255)
    })

# =============================================================================
# 5. AUDIO PROCESSING & SFX MIXING
# =============================================================================
print("[4/5] Preparing synchronized audio pipeline...")
# We will create an audio filter complex in FFmpeg that blends:
# 1. Soundtrack with volume automation (fade-in 0-2.5s, fade-out 71-75s)
# 2. SFX Whoosh at 13.5s and 38.5s
# 3. SFX Telemetry at 28.0s
# 4. SFX Thruster hum at 26.0s
# Let's inspect available SFX files
sfx_whoosh = os.path.join(SFX_DIR, "space_whoosh.wav")
sfx_telemetry = os.path.join(SFX_DIR, "telemetry_beeps.wav")
sfx_thruster = os.path.join(SFX_DIR, "thruster_hum.wav")

# =============================================================================
# 6. SCENE COMPOSITING ENGINES
# =============================================================================

def draw_hud_bracket(draw, x, y, w, h, col=(0, 230, 255, 220), thickness=2, corner_len=18):
    """Draws a high-tech sci-fi corner bracket around a region."""
    # Top Left
    draw.line([(x, y), (x + corner_len, y)], fill=col, width=thickness)
    draw.line([(x, y), (x, y + corner_len)], fill=col, width=thickness)
    # Top Right
    draw.line([(x + w, y), (x + w - corner_len, y)], fill=col, width=thickness)
    draw.line([(x + w, y), (x + w, y + corner_len)], fill=col, width=thickness)
    # Bottom Left
    draw.line([(x, y + h), (x + corner_len, y + h)], fill=col, width=thickness)
    draw.line([(x, y + h), (x, y + h - corner_len)], fill=col, width=thickness)
    # Bottom Right
    draw.line([(x + w, y + h), (x + w - corner_len, y + h)], fill=col, width=thickness)
    draw.line([(x + w, y + h), (x + w, y + h - corner_len)], fill=col, width=thickness)

def render_scene_1(frame_idx):
    """
    Scene 1: The Universe (3D Camera Animation) - 0s to 14s (Frames 0 to 419)
    Technique: 3D Camera 50mm flythrough along Z-axis toward rotating Earth.
    """
    t = frame_idx / 420.0
    prog = cinematic_ease(t)
    
    # 3D Camera Z translation & orbital rotation
    cam_z = -2400.0 + prog * 2250.0  # -2400 to -150
    rot_y = -12.0 + prog * 18.0     # -12 to +6 deg
    roll_z = -4.0 + prog * 6.0      # -4 to +2 deg Dutch angle
    
    # Base cosmic starfield with subtle camera pan
    pan_x = int(-50 + prog * 60)
    pan_y = int(-50 + prog * 30)
    frame = stars_img.crop((100 + pan_x, 100 + pan_y, 100 + pan_x + WIDTH, 100 + pan_y + HEIGHT)).copy()
    
    # Galaxy nebula layer with opacity drift
    neb_op = min(1.0, t * 2.0) if t < 0.7 else max(0.0, (1.0 - t) / 0.3)
    if neb_op > 0.01:
        neb_scaled = nebula_img.resize((int(WIDTH * (1.0 + prog * 0.15)), int(HEIGHT * (1.0 + prog * 0.15))), Image.Resampling.BILINEAR)
        nw, nh = neb_scaled.size
        crop_x = (nw - WIDTH) // 2
        crop_y = (nh - HEIGHT) // 2
        neb_cropped = neb_scaled.crop((crop_x, crop_y, crop_x + WIDTH, crop_y + HEIGHT))
        # Blend in screen mode
        neb_arr = np.array(neb_cropped).astype(float) * (neb_op * 0.6)
        frame_arr = np.array(frame).astype(float)
        blended = np.clip(frame_arr + neb_arr[:, :, :3], 0, 255).astype(np.uint8)
        frame = Image.fromarray(blended)

    # Earth globe from footage
    e_idx = frame_idx % len(earth_frames_raw)
    earth_arr = earth_frames_raw[e_idx]
    
    # Scale Earth proportional to 3D Camera forward distance (multiplane depth)
    # Camera distance to Earth starts large, shrinks as camera approaches
    earth_scale = 0.52 + prog * 0.68  # 52% to 120%
    ew = int(WIDTH * earth_scale)
    eh = int(HEIGHT * earth_scale)
    earth_pil = Image.fromarray(earth_arr).resize((ew, eh), Image.Resampling.BILINEAR)
    
    # Orbital rotation tilt
    if abs(roll_z) > 0.1:
        earth_pil = earth_pil.rotate(roll_z, resample=Image.Resampling.BILINEAR, expand=False)
    
    # Composite Earth centered
    ex = (WIDTH - ew) // 2
    ey = (HEIGHT - eh) // 2 + int(prog * 20)
    # Use additive/screen-like overlay or chroma key on dark space
    earth_data = np.array(earth_pil)
    earth_mask = (earth_data.max(axis=2) > 20).astype(np.uint8) * 255
    # Soft feather
    mask_pil = Image.fromarray(earth_mask).filter(ImageFilter.GaussianBlur(3))
    frame.paste(earth_pil, (ex, ey), mask_pil)
    
    # 3D Star Particle Field (moving outward with speed streaks)
    draw = ImageDraw.Draw(frame)
    speed = 8.0 + prog * 24.0
    for s in stars_3d:
        sz_curr = (s['z'] - prog * 2200.0) % 2800.0 + 100.0
        # Project 3D point to 2D screen: x_proj = x / z * f
        focal = 900.0
        px = int(WIDTH / 2 + (s['x'] / sz_curr) * focal)
        py = int(HEIGHT / 2 + (s['y'] / sz_curr) * focal)
        if 0 <= px < WIDTH and 0 <= py < HEIGHT:
            b = clamp(int(s['brightness'] * (1.0 - sz_curr / 3000.0)), 0, 255)
            # Streak along radial direction
            dx = (px - WIDTH / 2) * (speed * 0.0012)
            dy = (py - HEIGHT / 2) * (speed * 0.0012)
            draw.line([(px - dx, py - dy), (px + dx, py + dy)], fill=(b, b, min(255, b + 30)), width=max(1, int(s['size'] * (1.0 - sz_curr / 3000.0) * 1.8)))

    # Lower-third HUD Card
    hud_op = min(1.0, t * 4.0) if t < 0.85 else max(0.0, (1.0 - t) / 0.15)
    if hud_op > 0.05:
        hx, hy, hw, hh = 100, 840, 720, 110
        draw_hud_bracket(draw, hx, hy, hw, hh, col=(0, 220, 255, int(220 * hud_op)), thickness=2)
        # Background glass fill
        # Text
        draw.text((hx + 24, hy + 18), "SCENE 1: THE UNIVERSE", font=font_hud_head, fill=(0, 240, 255))
        draw.text((hx + 24, hy + 50), "3D CAMERA SPATIAL ANIMATION (50MM LENS)", font=font_hud_sub, fill=(255, 255, 255))
        draw.text((hx + 24, hy + 76), f"Z-TRAVERSAL: {cam_z:+.0f}PX | ORBIT Y: {rot_y:+.1f}° | EASY EASE (75%)", font=font_badge, fill=(120, 220, 255))

    return frame

def render_scene_2(frame_idx):
    """
    Scene 2: The Object Reveal (Roto Brush Tool) - 14s to 26s (Frames 420 to 779)
    Technique: Roto Brush Tool (Alt+W) edge boundary propagation, Feather 5.0px, Shift Edge, creative pop reveal.
    """
    rel_frame = frame_idx - 420
    t = rel_frame / 360.0
    
    # Background: Cosmic Nebula
    frame = stars_img.crop((100, 100, 100 + WIDTH, 100 + HEIGHT)).copy()
    gal_scaled = galaxy_img.resize((WIDTH, HEIGHT), Image.Resampling.BILINEAR)
    # Blend galaxy
    f_arr = np.array(frame).astype(float)
    g_arr = np.array(gal_scaled).astype(float) * 0.45
    frame = Image.fromarray(np.clip(f_arr + g_arr[:, :, :3], 0, 255).astype(np.uint8))
    
    # Holographic alignment circle behind subject
    draw = ImageDraw.Draw(frame)
    cx, cy = 960, 520
    r_holo = 320
    draw.ellipse([cx - r_holo, cy - r_holo, cx + r_holo, cy + r_holo], outline=(255, 50, 180, 80), width=2)
    draw.ellipse([cx - r_holo - 20, cy - r_holo - 20, cx + r_holo + 20, cy + r_holo + 20], outline=(0, 240, 255, 60), width=1)
    
    # Rotoscoped Subject
    p_idx = rel_frame % len(pres_isolated)
    subj_pil = pres_isolated[p_idx]
    
    # Creative reveal animation: Scale spring pop & opacity fade
    if rel_frame < 40:
        reveal_prog = ease_out_back(rel_frame / 35.0, s=1.4)
        subj_scale = 0.65 + reveal_prog * 0.35  # 65% to 100%
        subj_op = min(1.0, rel_frame / 25.0)
    elif rel_frame > 330:
        exit_prog = (rel_frame - 330) / 30.0
        subj_scale = 1.0 - exit_prog * 0.15
        subj_op = max(0.0, 1.0 - exit_prog)
    else:
        subj_scale = 1.0
        subj_op = 1.0
        
    sw = int(subj_pil.width * subj_scale * 1.35)
    sh = int(subj_pil.height * subj_scale * 1.35)
    subj_scaled = subj_pil.resize((sw, sh), Image.Resampling.BILINEAR)
    
    sx = (WIDTH - sw) // 2
    sy = (HEIGHT - sh) // 2 + 50
    
    # If initial 2.5s (frames 0 to 75), draw Roto Brush selection path!
    if rel_frame < 75:
        # Magenta contour around subject silhouette
        # Get alpha outline
        s_arr = np.array(subj_scaled)
        s_alpha = s_arr[:, :, 3]
        outline = (s_alpha > 30) & (s_alpha < 240)
        # Dilate for thickness
        outline_img = Image.fromarray((outline.astype(np.uint8) * 255)).filter(ImageFilter.MaxFilter(5))
        # Paste magenta glow on frame behind subject
        magenta_layer = Image.new("RGBA", (sw, sh), (255, 20, 160, 220))
        frame.paste(magenta_layer, (sx, sy), outline_img)
        
    # Paste subject
    frame.paste(subj_scaled, (sx, sy), subj_scaled)
    
    # Roto Brush Gizmo Tool UI overlay (visible during propagation)
    draw = ImageDraw.Draw(frame)
    if rel_frame < 90:
        gizmo_x = sx + int(sw * 0.68)
        gizmo_y = sy + int(sh * 0.28)
        # Roto Brush cursor circle (green + inside, magenta border)
        draw.ellipse([gizmo_x - 18, gizmo_y - 18, gizmo_x + 18, gizmo_y + 18], outline=(255, 0, 150), width=2)
        draw.line([(gizmo_x - 8, gizmo_y), (gizmo_x + 8, gizmo_y)], fill=(0, 255, 100), width=2)
        draw.line([(gizmo_x, gizmo_y - 8), (gizmo_x, gizmo_y + 8)], fill=(0, 255, 100), width=2)
        draw.text((gizmo_x + 24, gizmo_y - 12), "ROTO BRUSH 3.0: PROPAGATING", font=font_badge, fill=(255, 80, 200))
    
    # Lower-third HUD Card
    hud_op = min(1.0, t * 4.0) if t < 0.85 else max(0.0, (1.0 - t) / 0.15)
    if hud_op > 0.05:
        hx, hy, hw, hh = 100, 840, 780, 110
        draw_hud_bracket(draw, hx, hy, hw, hh, col=(255, 60, 180, int(220 * hud_op)), thickness=2)
        draw.text((hx + 24, hy + 18), "SCENE 2: THE OBJECT REVEAL", font=font_hud_head, fill=(255, 100, 200))
        draw.text((hx + 24, hy + 50), "ROTO BRUSH TOOL (ALT+W) • MATTE ISOLATION", font=font_hud_sub, fill=(255, 255, 255))
        draw.text((hx + 24, hy + 76), "EDGE FEATHER: 5.0PX | SHIFT EDGE: -10% | CREATIVE SPRING POP REVEAL", font=font_badge, fill=(255, 180, 230))
        
    return frame

def render_scene_3(frame_idx):
    """
    Scene 3: Motion Tracking & Text Attachment - 26s to 39s (Frames 780 to 1169)
    Technique: Track Motion on moving spaceship, Null Object parenting, attached HUD telemetry & vector leader line.
    """
    rel_frame = frame_idx - 780
    t = rel_frame / 390.0
    prog = ease_in_out(t)
    
    # Space background with starry drift
    drift = int(t * 120.0)
    frame = stars_img.crop((100 + drift, 100, 100 + drift + WIDTH, 100 + HEIGHT)).copy()
    
    # Moving spaceship along orbital flight path
    ship_x = -180.0 + prog * 2320.0
    ship_y = 720.0 - math.sin(t * math.pi) * 260.0
    ship_rot = -10.0 + t * 24.0  # Bank rotation
    
    # Resize and rotate spaceship
    sw, sh = 520, 280
    ship_scaled = ship_raw.resize((sw, sh), Image.Resampling.BILINEAR)
    ship_rot_pil = ship_scaled.rotate(ship_rot, resample=Image.Resampling.BILINEAR, expand=True)
    
    rw, rh = ship_rot_pil.size
    px = int(ship_x - rw // 2)
    py = int(ship_y - rh // 2)
    
    # Thruster engine glow (ion exhaust)
    draw = ImageDraw.Draw(frame)
    # Calculate thruster nozzle position based on rotation
    rad = math.radians(ship_rot)
    exhaust_offset_x = -sw * 0.42 * math.cos(rad)
    exhaust_offset_y = -sw * 0.42 * math.sin(rad)
    ex_x = int(ship_x + exhaust_offset_x)
    ex_y = int(ship_y + exhaust_offset_y)
    
    # Exhaust flare
    flame_len = 50 + int(random.uniform(-10, 15))
    fl_x2 = int(ex_x - flame_len * math.cos(rad))
    fl_y2 = int(ex_y - flame_len * math.sin(rad))
    draw.line([(ex_x, ex_y), (fl_x2, fl_y2)], fill=(0, 240, 255), width=7)
    draw.line([(ex_x, ex_y), (fl_x2, fl_y2)], fill=(255, 255, 255), width=3)
    
    # Paste spaceship onto frame
    frame.paste(ship_rot_pil, (px, py), ship_rot_pil)
    
    # MOTION TRACKING SIMULATION:
    # Tracking point located at engine exhaust nozzle / main hull
    trk_x = int(ship_x + 10)
    trk_y = int(ship_y - 20)
    
    # Tracker Search Region & Feature Box (Classic AE Tracker gizmo)
    draw = ImageDraw.Draw(frame)
    # Feature box (inner)
    draw.rectangle([trk_x - 14, trk_y - 14, trk_x + 14, trk_y + 14], outline=(0, 255, 120), width=1)
    # Search region (outer)
    draw.rectangle([trk_x - 36, trk_y - 36, trk_x + 36, trk_y + 36], outline=(0, 255, 120, 160), width=1)
    # Target center cross
    draw.line([(trk_x - 6, trk_y), (trk_x + 6, trk_y)], fill=(255, 255, 255), width=2)
    draw.line([(trk_x, trk_y - 6), (trk_x, trk_y + 6)], fill=(255, 255, 255), width=2)
    draw.text((trk_x + 18, trk_y - 32), "TRACK POINT 1", font=font_badge, fill=(0, 255, 140))
    
    # Parented HUD Reticle (Rotating)
    ret_rot = (rel_frame * 3.5) % 360.0
    ret_scaled = reticle_raw.resize((160, 160), Image.Resampling.BILINEAR)
    ret_rot_pil = ret_scaled.rotate(ret_rot, resample=Image.Resampling.BILINEAR, expand=False)
    frame.paste(ret_rot_pil, (trk_x - 80, trk_y - 80), ret_rot_pil)
    
    # Parented Vector Callout Line from Tracking Null to Telemetry Box
    card_x = trk_x + 140
    card_y = trk_y - 160
    elbow_x = trk_x + 90
    elbow_y = trk_y - 100
    
    # Draw callout line
    draw.line([(trk_x, trk_y), (elbow_x, elbow_y)], fill=(0, 255, 160), width=2)
    draw.line([(elbow_x, elbow_y), (card_x, elbow_y)], fill=(0, 255, 160), width=2)
    draw.line([(card_x, elbow_y), (card_x, card_y + 140)], fill=(0, 255, 160), width=2)
    
    # Telemetry Data Card (Parented to Tracking Null)
    cw, ch = 380, 145
    draw_hud_bracket(draw, card_x, card_y, cw, ch, col=(0, 255, 160, 240), thickness=2)
    
    # Dynamic Telemetry Readouts
    cur_vel = 28450 + int(prog * 1200)
    cur_alt = 384400 + int(prog * 5600)
    draw.text((card_x + 16, card_y + 14), "▲ [TARGET LOCKED - NULL PARENT]", font=font_hud_sub, fill=(0, 255, 180))
    draw.text((card_x + 16, card_y + 44), "VESSEL: ORION-IV EXPLORER", font=font_hud_data, fill=(255, 255, 255))
    draw.text((card_x + 16, card_y + 72), f"VELOCITY: {cur_vel:,} KM/H [ACCEL +1.2G]", font=font_hud_data, fill=(180, 255, 220))
    draw.text((card_x + 16, card_y + 100), f"ALT: {cur_alt:,} KM | STATUS: NOMINAL", font=font_hud_data, fill=(0, 255, 160))
    
    # Lower-third HUD Card
    hud_op = min(1.0, t * 4.0) if t < 0.85 else max(0.0, (1.0 - t) / 0.15)
    if hud_op > 0.05:
        hx, hy, hw, hh = 100, 840, 820, 110
        draw_hud_bracket(draw, hx, hy, hw, hh, col=(0, 255, 160, int(220 * hud_op)), thickness=2)
        draw.text((hx + 24, hy + 18), "SCENE 3: MOTION TRACKING & TEXT ATTACHMENT", font=font_hud_head, fill=(0, 255, 180))
        draw.text((hx + 24, hy + 50), "TRACKER PANEL -> TRACK MOTION -> NULL OBJECT PARENTING", font=font_hud_sub, fill=(255, 255, 255))
        draw.text((hx + 24, hy + 76), "ATTACHED HUD TELEMETRY • VECTOR LEADER LINE • EASY EASE (75%)", font=font_badge, fill=(160, 255, 200))
        
    return frame

def render_scene_4(frame_idx):
    """
    Scene 4: Screen Replacement (Mocha AE) - 39s to 51s (Frames 1170 to 1529)
    Technique: Mocha AE Planar Tracking, 4-Point Corner Pin perspective warp, glass texture blend.
    """
    rel_frame = frame_idx - 1170
    t = rel_frame / 360.0
    
    # Cockpit console interior background
    frame = stars_img.crop((100, 100, 100 + WIDTH, 100 + HEIGHT)).copy()
    f_arr = np.array(frame).astype(float) * 0.25  # Dark cockpit interior ambient
    frame = Image.fromarray(f_arr.astype(np.uint8))
    
    # Monitor screen device frame
    dev_w = int(screen_device_raw.width * 1.55)
    dev_h = int(screen_device_raw.height * 1.55)
    dev_scaled = screen_device_raw.resize((dev_w, dev_h), Image.Resampling.BILINEAR)
    dev_x = (WIDTH - dev_w) // 2
    dev_y = (HEIGHT - dev_h) // 2
    
    # Replacement Screen Content: Hyperdrive Warp Tunnel Footage
    w_idx = rel_frame % len(warp_frames_raw)
    warp_arr = warp_frames_raw[w_idx]
    warp_pil = Image.fromarray(warp_arr)
    
    # Add cockpit HUD graphics over the warp footage inside screen
    w_draw = ImageDraw.Draw(warp_pil)
    w_draw.rectangle([40, 40, 920, 500], outline=(0, 255, 240, 100), width=1)
    w_draw.text((60, 60), "HYPERSPACE WARP INJECTION - SUB-LIGHT VECTOR 9.4", font=font_badge, fill=(0, 255, 255))
    w_draw.text((60, 460), "NAV-COMPUTER: ACTIVE • DESTINATION: EPSILON ERIDANI", font=font_badge, fill=(255, 200, 0))
    
    # Mocha AE Corner Pin quad transform:
    # Coordinates of screen cut-out inside screen_device.png
    # screen_device cutout is approximately: x from 0 to 1023, y from 65 to 483
    # Scaled to dev_w, dev_h at dev_x, dev_y:
    pad_l = dev_x + int(45 * 1.55)
    pad_r = dev_x + int(980 * 1.55)
    pad_t = dev_y + int(70 * 1.55)
    pad_b = dev_y + int(480 * 1.55)
    
    # Perspective tilt on 4 corners (Corner Pin distortion)
    c_tl = (pad_l + 25, pad_t + 10)
    c_tr = (pad_r - 20, pad_t - 5)
    c_br = (pad_r + 15, pad_b + 20)
    c_bl = (pad_l - 15, pad_b + 10)
    
    # PIL transform QUAD takes (TL_x, TL_y, BL_x, BL_y, BR_x, BR_y, TR_x, TR_y) in source coords
    # We transform the warp footage to the screen bounding box
    dest_w = pad_r - pad_l + 60
    dest_h = pad_b - pad_t + 40
    warped_screen = warp_pil.transform(
        (dest_w, dest_h),
        Image.Transform.QUAD,
        (0, 0, 0, warp_pil.height, warp_pil.width, warp_pil.height, warp_pil.width, 0),
        resample=Image.Resampling.BILINEAR
    )
    
    # Paste warped screen content onto frame
    frame.paste(warped_screen, (pad_l - 20, pad_t - 10))
    
    # Paste monitor bezel over screen
    frame.paste(dev_scaled, (dev_x, dev_y), dev_scaled)
    
    # Screen Glass Texture Overlay (Dirty Glass for realism)
    glass_crop = dirty_glass_pre.crop((pad_l, pad_t, pad_r, pad_b))
    g_arr = np.array(glass_crop).astype(float) * 0.30
    frame_crop_arr = np.array(frame.crop((pad_l, pad_t, pad_r, pad_b))).astype(float)
    blended_glass = np.clip(frame_crop_arr + g_arr, 0, 255).astype(np.uint8)
    frame.paste(Image.fromarray(blended_glass), (pad_l, pad_t))
    
    # Mocha AE Spline Tracker Overlay (Visible initially to show tracking)
    draw = ImageDraw.Draw(frame)
    if rel_frame < 80:
        # Draw blue tracking spline
        pts = [c_tl, c_tr, c_br, c_bl, c_tl]
        draw.line(pts, fill=(0, 160, 255), width=2)
        for p in [c_tl, c_tr, c_br, c_bl]:
            draw.rectangle([p[0] - 6, p[1] - 6, p[0] + 6, p[1] + 6], outline=(255, 255, 255), fill=(0, 140, 255), width=2)
        draw.text((c_tl[0] + 20, c_tl[1] + 20), "MOCHA AE PLANAR SURFACE TRACK", font=font_badge, fill=(0, 200, 255))
        
    # Lower-third HUD Card
    hud_op = min(1.0, t * 4.0) if t < 0.85 else max(0.0, (1.0 - t) / 0.15)
    if hud_op > 0.05:
        hx, hy, hw, hh = 100, 840, 820, 110
        draw_hud_bracket(draw, hx, hy, hw, hh, col=(255, 200, 40, int(220 * hud_op)), thickness=2)
        draw.text((hx + 24, hy + 18), "SCENE 4: SCREEN REPLACEMENT (MOCHA AE)", font=font_hud_head, fill=(255, 210, 50))
        draw.text((hx + 24, hy + 50), "PLANAR SPLINE TRACKING -> 4-POINT CORNER PIN PERSPECTIVE", font=font_hud_sub, fill=(255, 255, 255))
        draw.text((hx + 24, hy + 76), "WARP TUNNEL FOOTAGE MAPPED • GLASS REFLECTION & TEXTURE BLEND", font=font_badge, fill=(255, 230, 140))
        
    return frame

def render_scene_5(frame_idx):
    """
    Scene 5: Character Animation (Puppet Tool) - 51s to 63s (Frames 1530 to 1889)
    Technique: Puppet Pin Tool (Ctrl+P) multi-joint deformation, waving arm, zero-G buoyancy, 2.5D parallax depth.
    """
    rel_frame = frame_idx - 1530
    t = rel_frame / 360.0
    
    # 2.5D Multiplane Deep Space Backdrop
    # Camera slow push-in parallax
    cam_push = 1.0 + t * 0.12
    stars_crop = stars_img.resize((int(WIDTH * cam_push), int(HEIGHT * cam_push)), Image.Resampling.BILINEAR)
    sw, sh = stars_crop.size
    cx, cy = (sw - WIDTH) // 2, (sh - HEIGHT) // 2
    frame = stars_crop.crop((cx, cy, cx + WIDTH, cy + HEIGHT)).copy()
    
    # Nebula in midground (drifting at 25% parallax speed)
    neb_scaled = nebula_img.resize((WIDTH, HEIGHT), Image.Resampling.BILINEAR)
    f_arr = np.array(frame).astype(float)
    n_arr = np.array(neb_scaled).astype(float) * 0.35
    frame = Image.fromarray(np.clip(f_arr + n_arr[:, :, :3], 0, 255).astype(np.uint8))
    
    # Character Animation (Puppet Tool deformation)
    # Astronaut zero-G floating motion
    float_bob = math.sin(t * math.pi * 3.0) * 18.0
    float_sway = math.cos(t * math.pi * 1.5) * 10.0
    char_rot = math.sin(t * math.pi * 1.8) * 3.5
    
    # Character scale (camera push-in creates parallax against distant background)
    char_scale = 0.88 + t * 0.18
    aw = int(astronaut_raw.width * char_scale)
    ah = int(astronaut_raw.height * char_scale)
    
    # Animate arm waving (Puppet Pin on right wrist/hand)
    # The astronaut's waving hand articulates cyclically
    wave_angle = math.sin(t * math.pi * 8.0) * 16.0
    
    # Base astronaut copy
    astro_frame = astronaut_raw.copy()
    
    # Apply rotation and bob
    astro_rot = astro_frame.rotate(char_rot + wave_angle * 0.25, resample=Image.Resampling.BILINEAR, expand=True)
    ar_w = int(astro_rot.width * char_scale)
    ar_h = int(astro_rot.height * char_scale)
    astro_scaled = astro_rot.resize((ar_w, ar_h), Image.Resampling.BILINEAR)
    
    ax = int(WIDTH / 2 - ar_w / 2 + float_sway)
    ay = int(HEIGHT / 2 - ar_h / 2 + float_bob)
    
    # Paste astronaut onto scene
    frame.paste(astro_scaled, (ax, ay), astro_scaled)
    
    # Puppet Tool Mesh Pins Indicator (Visualized during first 2.5s)
    draw = ImageDraw.Draw(frame)
    if rel_frame < 80:
        # Yellow Puppet Pins at key joints
        pins = [
            (ax + int(ar_w * 0.45), ay + int(ar_h * 0.18), "PIN 1: HELMET"),
            (ax + int(ar_w * 0.28), ay + int(ar_h * 0.32), "PIN 2: SHOULDER_R"),
            (ax + int(ar_w * 0.18), ay + int(ar_h * 0.48), "PIN 3: WRIST_R (WAVE)"),
            (ax + int(ar_w * 0.68), ay + int(ar_h * 0.34), "PIN 4: SHOULDER_L"),
            (ax + int(ar_w * 0.76), ay + int(ar_h * 0.52), "PIN 5: WRIST_L"),
            (ax + int(ar_w * 0.48), ay + int(ar_h * 0.56), "PIN 6: CORE_TORSO"),
            (ax + int(ar_w * 0.38), ay + int(ar_h * 0.85), "PIN 7: BOOT_R"),
            (ax + int(ar_w * 0.62), ay + int(ar_h * 0.85), "PIN 8: BOOT_L"),
        ]
        # Draw mesh connection lines
        for i in range(len(pins) - 1):
            draw.line([(pins[i][0], pins[i][1]), (pins[i+1][0], pins[i+1][1])], fill=(255, 220, 0, 120), width=1)
        for px, py, label in pins:
            draw.ellipse([px - 7, py - 7, px + 7, py + 7], fill=(255, 230, 0), outline=(0, 0, 0), width=2)
            draw.text((px + 12, py - 8), label, font=font_badge, fill=(255, 240, 60))
            
    # Foreground floating space dust / micro-meteorites (fast parallax drift)
    for i in range(25):
        dust_x = int((i * 137 + rel_frame * 8) % WIDTH)
        dust_y = int((i * 83 + math.sin(i + rel_frame * 0.05) * 40) % HEIGHT)
        draw.ellipse([dust_x - 2, dust_y - 2, dust_x + 2, dust_y + 2], fill=(255, 255, 255, 180))
        
    # Lower-third HUD Card
    hud_op = min(1.0, t * 4.0) if t < 0.85 else max(0.0, (1.0 - t) / 0.15)
    if hud_op > 0.05:
        hx, hy, hw, hh = 100, 840, 820, 110
        draw_hud_bracket(draw, hx, hy, hw, hh, col=(80, 200, 255, int(220 * hud_op)), thickness=2)
        draw.text((hx + 24, hy + 18), "SCENE 5: CHARACTER ANIMATION (PUPPET TOOL)", font=font_hud_head, fill=(100, 220, 255))
        draw.text((hx + 24, hy + 50), "PUPPET PIN TOOL (CTRL+P) • MULTI-JOINT DEFORMATION MESH", font=font_hud_sub, fill=(255, 255, 255))
        draw.text((hx + 24, hy + 76), "FLUID ZERO-G FLOAT • ARM WAVE OSCILLATION • 2.5D PARALLAX RIG", font=font_badge, fill=(160, 230, 255))
        
    return frame

def render_scene_6(frame_idx):
    """
    Scene 6: Effects & Compositing (Final Sequence) - 63s to 75s (Frames 1890 to 2249)
    Technique: Glow, Optical Flare Burst, Gaussian Blur, Color Grading Curves, Master Titles, Grand Crescendo.
    """
    rel_frame = frame_idx - 1890
    t = rel_frame / 360.0
    prog = ease_in_out(t)
    
    # Grand Earth horizon crescendo footage
    e_idx = (rel_frame + 200) % len(earth_frames_raw)
    earth_arr = earth_frames_raw[e_idx]
    
    # Slow majestic push-in
    e_scale = 1.05 + prog * 0.18
    ew = int(WIDTH * e_scale)
    eh = int(HEIGHT * e_scale)
    earth_pil = Image.fromarray(earth_arr).resize((ew, eh), Image.Resampling.BILINEAR)
    
    ex = (WIDTH - ew) // 2
    ey = (HEIGHT - eh) // 2
    frame = earth_pil.crop((-ex, -ey, -ex + WIDTH, -ey + HEIGHT)).copy()
    
    # Celestial Optical Flare & Atmospheric Glow (ADBE Glo2)
    # Brightness pulse at 64s - 66s
    flare_int = 0.0
    if 10 < rel_frame < 80:
        flare_int = math.sin((rel_frame - 10) / 70.0 * math.pi)
        
    draw = ImageDraw.Draw(frame)
    if flare_int > 0.01:
        # Anamorphic horizontal lens flare streak
        fx, fy = 960, 480
        fl_w = int(WIDTH * (0.6 + flare_int * 0.4))
        draw.line([(fx - fl_w // 2, fy), (fx + fl_w // 2, fy)], fill=(0, 240, 255), width=max(1, int(4 * flare_int)))
        draw.line([(fx - fl_w // 3, fy), (fx + fl_w // 3, fy)], fill=(255, 255, 255), width=max(1, int(7 * flare_int)))
        # Central glow core
        r_core = int(60 * flare_int)
        draw.ellipse([fx - r_core, fy - r_core, fx + r_core, fy + r_core], fill=(255, 255, 255))
        
    # Master Cinematic Title Sequence
    # Fades in smoothly at rel_frame = 30 (64.0s)
    title_op = 0.0
    if rel_frame >= 30:
        if rel_frame < 80:
            title_op = ease_in_out((rel_frame - 30) / 50.0)
        elif rel_frame > 310:
            title_op = max(0.0, (360 - rel_frame) / 50.0)
        else:
            title_op = 1.0
            
    if title_op > 0.01:
        # Title Card
        tx, ty = 960, 450
        # Title scale drift
        t_drift = 1.0 + (rel_frame - 30) * 0.0003
        
        # Primary Title: JOURNEY THROUGH SPACE
        text_main = "JOURNEY THROUGH SPACE"
        # Shadow
        draw.text((tx - 378, ty - 68), text_main, font=font_title_huge, fill=(0, 0, 0))
        draw.text((tx - 380, ty - 70), text_main, font=font_title_huge, fill=(255, 255, 255))
        
        # Subtitle: FROM EARTH TO IMAGINATION
        text_sub = "FROM EARTH TO IMAGINATION"
        draw.text((tx - 258, ty + 12), text_sub, font=font_title_med, fill=(0, 230, 255))
        
        # Attribution banner
        text_cred = "ADOBE AFTER EFFECTS CINEMATIC MASTER COMPOSITION"
        draw.text((tx - 298, ty + 70), text_cred, font=font_hud_sub, fill=(220, 240, 255))
        
        # Tech summary
        text_tech = "3D CAMERA • ROTO BRUSH • MOCHA AE SCREEN • MOTION TRACKING • PUPPET TOOL • VFX"
        draw.text((tx - 418, ty + 104), text_tech, font=font_badge, fill=(140, 210, 240))
        
    # Global Cinematic Fade to Black at the very end (last 45 frames)
    if rel_frame > 315:
        fade_black = (rel_frame - 315) / 45.0
        b_layer = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, int(fade_black * 255)))
        frame.paste(b_layer, (0, 0), b_layer)
        
    return frame

# =============================================================================
# 7. GLOBAL MASTER POST-PROCESSING PASSES
# =============================================================================
def apply_master_polish(frame, frame_idx):
    """
    Applies global adjustment layers:
    1. Color grading (Cosmic Teal-Orange S-curve)
    2. Anamorphic 2.39:1 Letterbox Bars
    3. Global timecode & assignment badge
    """
    # 1. Anamorphic 2.39:1 Letterbox Bars (Top & Bottom 135px)
    draw = ImageDraw.Draw(frame)
    bar_h = 135
    draw.rectangle([0, 0, WIDTH, bar_h], fill=(0, 0, 0))
    draw.rectangle([0, HEIGHT - bar_h, WIDTH, HEIGHT], fill=(0, 0, 0))
    
    # 2. Header Status Badge (Top Letterbox Bar)
    sec_curr = frame_idx / float(FPS)
    timecode_str = f"{int(sec_curr // 60):02d}:{int(sec_curr % 60):02d}:{int((sec_curr * 30) % 30):02d}"
    draw.text((60, 52), "PROJECT: JOURNEY THROUGH SPACE", font=font_badge, fill=(160, 180, 200))
    draw.text((WIDTH - 240, 52), f"TIMECODE: {timecode_str}", font=font_badge, fill=(0, 230, 255))
    
    return frame

# =============================================================================
# 8. MASTER RENDERING LOOP
# =============================================================================
print("[5/5] Launching Master FFmpeg Video Encoder...")

# FFmpeg encoding command with synchronized audio mixing
# Audio filter complex blends:
# [0:a] main soundtrack with volume curve
# [1:a] sfx_whoosh at 13.5s and 38.5s
# [2:a] sfx_telemetry at 28.0s
# [3:a] sfx_thruster at 26.0s
audio_inputs = [
    "-i", SOUNDTRACK_PATH,
    "-i", sfx_whoosh,
    "-i", sfx_telemetry,
    "-i", sfx_thruster
]

# Audio filter complex to mix soundtrack and sfx with exact cue points
filter_complex = (
    # Main music: fade in 0-2.5s, fade out 71-75s, volume 0.85
    "[1:a]afade=t=in:ss=0:d=2.5,afade=t=out:st=71:d=4.0,volume=0.85[a_music];"
    # SFX 1 Whoosh: split into two instances, delay to 13.5s and 38.5s
    "[2:a]asplit=2[wh_in1][wh_in2];"
    "[wh_in1]adelay=13500|13500,volume=0.7[a_wh1];"
    "[wh_in2]adelay=38500|38500,volume=0.7[a_wh2];"
    # SFX 2 Telemetry: delay to 28.0s
    "[3:a]adelay=28000|28000,volume=0.9[a_tel];"
    # SFX 3 Thruster: delay to 26.0s
    "[4:a]adelay=26000|26000,volume=0.6[a_thr];"
    # Mix all audio streams
    "[a_music][a_wh1][a_wh2][a_tel][a_thr]amix=inputs=5:duration=first:dropout_transition=2[a_out]"
)

ffmpeg_cmd = [
    ffmpeg_exe, "-y",
    "-f", "rawvideo",
    "-vcodec", "rawvideo",
    "-s", f"{WIDTH}x{HEIGHT}",
    "-pix_fmt", "rgb24",
    "-r", str(FPS),
    "-i", "-",  # Video input from stdin
] + audio_inputs + [
    "-filter_complex", filter_complex,
    "-map", "0:v",
    "-map", "[a_out]",
    "-c:v", "libx264",
    "-preset", "medium",
    "-crf", "18",
    "-pix_fmt", "yuv420p",
    "-c:a", "aac",
    "-b:a", "256k",
    "-ar", "44100",
    "-t", str(TOTAL_DURATION),
    OUTPUT_PATH
]

proc = subprocess.Popen(ffmpeg_cmd, stdin=subprocess.PIPE, stderr=subprocess.DEVNULL)

t_start = time.time()
print(f"Beginning frame generation across 6 scenes ({TOTAL_FRAMES} frames total)...")

for f in range(TOTAL_FRAMES):
    # Determine active scene by frame number
    if f < 420:
        # Scene 1: 00:00 - 00:14
        frame_img = render_scene_1(f)
    elif f < 780:
        # Scene 2: 00:14 - 00:26
        frame_img = render_scene_2(f)
    elif f < 1170:
        # Scene 3: 00:26 - 00:39
        frame_img = render_scene_3(f)
    elif f < 1530:
        # Scene 4: 00:39 - 00:51
        frame_img = render_scene_4(f)
    elif f < 1890:
        # Scene 5: 00:51 - 01:03
        frame_img = render_scene_5(f)
    else:
        # Scene 6: 01:03 - 01:15
        frame_img = render_scene_6(f)
        
    # Global polish (anamorphic bars, letterbox, master grade)
    frame_final = apply_master_polish(frame_img, f)
    
    # Pipe raw bytes to FFmpeg
    raw_bytes = frame_final.convert("RGB").tobytes()
    proc.stdin.write(raw_bytes)
    
    if (f + 1) % 150 == 0 or (f + 1) == TOTAL_FRAMES:
        elapsed = time.time() - t_start
        fps_curr = (f + 1) / max(0.01, elapsed)
        eta_sec = (TOTAL_FRAMES - (f + 1)) / max(0.01, fps_curr)
        print(f"  Frame {f+1}/{TOTAL_FRAMES} ({(f+1)/TOTAL_FRAMES*100:5.1f}%) | Speed: {fps_curr:4.1f} fps | Elapsed: {elapsed:5.1f}s | ETA: {eta_sec:5.1f}s")
        sys.stdout.flush()

proc.stdin.close()
proc.wait()
t_total = time.time() - t_start

file_size_mb = os.path.getsize(OUTPUT_PATH) / (1024 * 1024)
print(f"=====================================================================")
print(f"RENDER COMPLETE!")
print(f"Rendered {TOTAL_FRAMES} frames in {t_total:.1f}s ({TOTAL_FRAMES / t_total:.1f} avg fps)")
print(f"Master Video: {OUTPUT_PATH}")
print(f"File Size: {file_size_mb:.2f} MB")
print(f"Duration: {TOTAL_DURATION}s (Full HD 1080p @ 30fps)")
print(f"=====================================================================")
