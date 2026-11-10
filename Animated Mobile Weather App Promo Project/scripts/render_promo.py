# Python / FFmpeg Master Renderer
# Project: Animated Mobile Weather App Promo
# Generates 60-Second Full HD 1080p 30fps Video (Final_WeatherApp_Promo.mp4)
# Conforming exactly to the course project specifications.

import os
import sys
import math
import subprocess
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import imageio_ffmpeg

# Paths
BASE_DIR = r"C:\Users\Admin\Documents\GitHub\AE\Animated Mobile Weather App Promo Project"
ASSETS_DIR = os.path.join(BASE_DIR, "assets")
FOOTAGE_PATH = os.path.join(ASSETS_DIR, "footage", "presenter_greenscreen.mp4")
AUDIO_PATH = os.path.join(ASSETS_DIR, "audio", "promo_soundtrack.mp3")
OUTPUT_PATH = os.path.join(BASE_DIR, "Final_WeatherApp_Promo.mp4")

SKY_DAY_PATH = os.path.join(ASSETS_DIR, "images", "sky_day.jpg")
SKY_NIGHT_PATH = os.path.join(ASSETS_DIR, "images", "sky_night.jpg")
CLOUD_PATH = os.path.join(ASSETS_DIR, "images", "cloud_texture.png")

WIDTH = 1920
HEIGHT = 1080
FPS = 30
TOTAL_FRAMES = 1800  # 60.00 seconds

# Easing Helper Functions
def ease_in_out(t):
    t = max(0.0, min(1.0, t))
    return t * t * (3.0 - 2.0 * t)

def ease_out_back(t, s=1.70158):
    t = max(0.0, min(1.0, t)) - 1.0
    return t * t * ((s + 1) * t + s) + 1.0

def clamp(val, min_val, max_val):
    return max(min_val, min(max_val, val))

# Load Fonts
FONT_REGULAR = "C:\\Windows\\Fonts\\segoeui.ttf"
FONT_BOLD = "C:\\Windows\\Fonts\\segoeuib.ttf"
FONT_BLACK = "C:\\Windows\\Fonts\\arialbd.ttf"

def get_font(path, size):
    try:
        return ImageFont.truetype(path, size)
    except:
        return ImageFont.load_default()

font_headline = get_font(FONT_BOLD, 60)
font_title_large = get_font(FONT_BOLD, 56)
font_title_med = get_font(FONT_BOLD, 42)
font_temp = get_font(FONT_BOLD, 52)
font_body = get_font(FONT_REGULAR, 24)
font_body_bold = get_font(FONT_BOLD, 24)
font_caption = get_font(FONT_REGULAR, 19)
font_caption_bold = get_font(FONT_BOLD, 19)
font_btn = get_font(FONT_BOLD, 26)

SCREEN_W = 384
SCREEN_H = 780

# Pre-load and Pre-scale Textures
print("Pre-scaling atmospheric textures...")
sky_day_raw = Image.open(SKY_DAY_PATH).convert("RGBA")
sky_day_pre = sky_day_raw.resize((SCREEN_W, SCREEN_H), Image.Resampling.BILINEAR)

sky_night_raw = Image.open(SKY_NIGHT_PATH).convert("RGBA")
sky_night_pre = sky_night_raw.resize((SCREEN_W, SCREEN_H), Image.Resampling.BILINEAR)

cloud_raw = Image.open(CLOUD_PATH).convert("RGBA")

# Extract and Chroma-Key Green Screen Video Frames
ffmpeg_exe = imageio_ffmpeg.get_ffmpeg_exe()
print("Extracting green screen footage frames...")
gs_cmd = [
    ffmpeg_exe, "-i", FOOTAGE_PATH,
    "-f", "image2pipe", "-vcodec", "rawvideo", "-pix_fmt", "rgb24", "-"
]
gs_proc = subprocess.Popen(gs_cmd, stdout=subprocess.PIPE, stderr=subprocess.DEVNULL)
gs_frames = []
while True:
    raw = gs_proc.stdout.read(1920 * 1080 * 3)
    if not raw or len(raw) < 1920 * 1080 * 3:
        break
    arr = np.frombuffer(raw, dtype=np.uint8).reshape((1080, 1920, 3))
    
    # Chroma Key & Despill
    r = arr[:, :, 0].astype(float)
    g = arr[:, :, 1].astype(float)
    b = arr[:, :, 2].astype(float)
    max_rb = np.maximum(r, b)
    diff = g - max_rb
    
    # Clean chroma key without edge fringe
    is_green = (diff > 8.0) | ((g > 70.0) & (g > r * 1.12) & (g > b * 1.12))
    alpha = np.where(is_green, np.clip(1.0 - (diff - 4.0) / 25.0, 0.0, 1.0), 1.0)
    alpha = np.clip(alpha, 0.0, 1.0)
    
    # Despill green channel
    g_clean = np.where(diff > 0, max_rb, g)
    
    rgba = np.zeros((1080, 1920, 4), dtype=np.uint8)
    rgba[:, :, 0] = r.astype(np.uint8)
    rgba[:, :, 1] = g_clean.astype(np.uint8)
    rgba[:, :, 2] = b.astype(np.uint8)
    rgba[:, :, 3] = (alpha * 255).astype(np.uint8)
    
    # Presenter is positioned on left and points right (crop x: 110 to 1480 to avoid edge artifacts)
    img_rgba = Image.fromarray(rgba, "RGBA")
    pres_cropped = img_rgba.crop((110, 50, 1480, 1080))
    gs_frames.append(pres_cropped)

print(f"Loaded {len(gs_frames)} chroma-keyed presenter frames.")

# Pre-render Phone Chassis & Viewport Mask
PHONE_W = 420
PHONE_H = 840
phone_chassis = Image.new("RGBA", (PHONE_W + 60, PHONE_H + 60), (0, 0, 0, 0))
p_draw = ImageDraw.Draw(phone_chassis)
for offset in range(16, 0, -2):
    alpha = int(75 * (offset / 16.0))
    p_draw.rounded_rectangle(
        [30 - offset, 30 - offset, 30 + PHONE_W + offset, 30 + PHONE_H + offset],
        radius=58 + offset, fill=(0, 0, 0, alpha)
    )
p_draw.rounded_rectangle([30, 30, 30 + PHONE_W, 30 + PHONE_H], radius=56, fill=(24, 28, 38, 255), outline=(71, 85, 105, 255), width=3)
p_draw.rounded_rectangle([30 + PHONE_W // 2 - 60, 45, 30 + PHONE_W // 2 + 60, 68], radius=11, fill=(10, 12, 16, 255))

screen_mask = Image.new("L", (SCREEN_W, SCREEN_H), 0)
s_draw = ImageDraw.Draw(screen_mask)
s_draw.rounded_rectangle([0, 0, SCREEN_W, SCREEN_H], radius=42, fill=255)

# Glassmorphism Card Helper
def apply_glass_card(img, rect, radius, fill_color, outline_color):
    overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
    odraw = ImageDraw.Draw(overlay)
    odraw.rounded_rectangle(rect, radius=radius, fill=fill_color, outline=outline_color, width=1)
    return Image.alpha_composite(img, overlay)

# Start FFmpeg Encoder
print("Starting FFmpeg encoder...")
render_cmd = [
    ffmpeg_exe, "-y",
    "-f", "rawvideo", "-vcodec", "rawvideo",
    "-s", f"{WIDTH}x{HEIGHT}", "-pix_fmt", "rgb24", "-r", str(FPS),
    "-i", "-",
    "-i", AUDIO_PATH,
    "-c:v", "libx264", "-preset", "veryfast", "-crf", "18", "-pix_fmt", "yuv420p",
    "-c:a", "aac", "-b:a", "256k",
    "-t", "60.0",
    "-af", "afade=t=in:ss=0:d=1.5,afade=t=out:st=57.5:d=2.5",
    OUTPUT_PATH
]

encoder = subprocess.Popen(render_cmd, stdin=subprocess.PIPE)
print(f"Rendering {TOTAL_FRAMES} frames (60.0s @ 30fps)...")

for frame_idx in range(TOTAL_FRAMES):
    time_sec = frame_idx / float(FPS)
    
    # Base Studio Stage
    base = Image.new("RGBA", (WIDTH, HEIGHT), (11, 15, 25, 255))
    draw = ImageDraw.Draw(base)
    
    # Ambient Backdrop Glow
    glow_r = 520
    draw.ellipse(
        [WIDTH//2 - glow_r, HEIGHT//2 - glow_r, WIDTH//2 + glow_r, HEIGHT//2 + glow_r],
        fill=(22, 34, 58, 95)
    )

    # =========================================================================
    # PHASE 1: INTRO TRANSITION (0.0s - 8.0s)
    # =========================================================================
    if time_sec < 8.2:
        t = time_sec / 8.0
        # Slab 1 (Sky Blue #38BDF8)
        s1_prog = ease_in_out(min(1.0, time_sec / 1.8))
        if time_sec > 5.5:
            s1_exit = ease_in_out((time_sec - 5.5) / 2.5)
            s1_x = int(WIDTH * 0.5 + s1_exit * 2600)
        else:
            s1_x = int(-1500 + s1_prog * (WIDTH * 0.5 + 1500))
        
        slab1_pts = [
            (s1_x - 1200, -200), (s1_x + 600, -200),
            (s1_x + 200, HEIGHT + 200), (s1_x - 1600, HEIGHT + 200)
        ]
        draw.polygon(slab1_pts, fill=(56, 189, 248, 185))

        # Slab 2 (Indigo #6366F1)
        s2_prog = ease_in_out(min(1.0, max(0.0, (time_sec - 0.3) / 1.8)))
        if time_sec > 5.8:
            s2_exit = ease_in_out((time_sec - 5.8) / 2.2)
            s2_x = int(WIDTH * 0.5 - s2_exit * 2600)
        else:
            s2_x = int(WIDTH + 1500 - s2_prog * (WIDTH + 1500 - WIDTH * 0.5))
        
        slab2_pts = [
            (s2_x - 400, -200), (s2_x + 1100, -200),
            (s2_x + 700, HEIGHT + 200), (s2_x - 800, HEIGHT + 200)
        ]
        draw.polygon(slab2_pts, fill=(99, 102, 241, 195))

        # Teaser Typography
        if 1.5 <= time_sec <= 6.5:
            text_alpha = int(255 * min(1.0, (time_sec - 1.5) / 0.8) * min(1.0, (6.5 - time_sec) / 0.8))
            draw.text((WIDTH//2, HEIGHT//2 - 40), "NEXT-GEN WEATHER EXPERIENCE", font=font_title_med, fill=(255, 255, 255, text_alpha), anchor="mm")
            draw.text((WIDTH//2, HEIGHT//2 + 35), "Precision Forecasts • Real-Time Radar • Fluid Motion", font=font_body, fill=(186, 230, 253, text_alpha), anchor="mm")

    # =========================================================================
    # PHASE 2: LOGO REVEAL & MESSAGE POP-UP (8.0s - 16.0s)
    # =========================================================================
    if 8.0 <= time_sec <= 16.5:
        rel_t = time_sec - 8.0
        logo_alpha = 1.0
        if time_sec > 15.2:
            logo_alpha = max(0.0, (16.2 - time_sec) / 1.0)
            
        reveal_p = clamp(rel_t / 1.5, 0.0, 1.0)
        reveal_e = ease_out_back(reveal_p)
        
        lx = WIDTH // 2
        ly = HEIGHT // 2 - 130
        
        # Logo Badge Canvas
        logo_img = Image.new("RGBA", (360, 240), (0, 0, 0, 0))
        ldraw = ImageDraw.Draw(logo_img)
        
        # Sun
        ldraw.ellipse([180, 20, 300, 140], fill=(252, 199, 44, 255))
        for ray_angle in range(0, 360, 45):
            rad = math.radians(ray_angle + rel_t * 22.0)
            rx1 = 240 + math.cos(rad) * 65
            ry1 = 80 + math.sin(rad) * 65
            rx2 = 240 + math.cos(rad) * 88
            ry2 = 80 + math.sin(rad) * 88
            ldraw.line([(rx1, ry1), (rx2, ry2)], fill=(252, 180, 30, 230), width=4)
            
        # Cloud
        ldraw.ellipse([40, 70, 170, 190], fill=(245, 250, 255, 255))
        ldraw.ellipse([130, 50, 270, 180], fill=(255, 255, 255, 255))
        ldraw.ellipse([210, 80, 320, 185], fill=(235, 245, 255, 255))
        ldraw.rounded_rectangle([80, 110, 290, 190], radius=40, fill=(250, 252, 255, 255))
        
        # Rectangle Mask Path Reveal
        mask_h = int(240 * clamp(rel_t / 1.4, 0.0, 1.0))
        if mask_h < 240:
            mask_crop = Image.new("L", (360, 240), 0)
            mdraw = ImageDraw.Draw(mask_crop)
            mdraw.rectangle([0, 240 - mask_h, 360, 240], fill=255)
            logo_img.putalpha(ImageDraw.Image.composite(logo_img.getchannel('A'), mask_crop, mask_crop))
            
        scale_f = min(1.0, reveal_e)
        if scale_f > 0.05:
            scaled_logo = logo_img.resize((int(360 * scale_f), int(240 * scale_f)), Image.Resampling.BILINEAR)
            base.paste(scaled_logo, (lx - scaled_logo.width // 2, ly - scaled_logo.height // 2), scaled_logo)
            
        title_alpha = int(255 * clamp((rel_t - 0.4) / 0.8, 0.0, 1.0) * logo_alpha)
        if title_alpha > 0:
            draw.text((lx, ly + 140), "AeroWeather", font=font_title_large, fill=(255, 255, 255, title_alpha), anchor="mm")
            draw.text((lx, ly + 200), "Intelligent Hyperlocal Forecasts", font=font_body, fill=(148, 163, 184, title_alpha), anchor="mm")
            
        # Message Pop-Up
        if time_sec >= 11.0:
            pop_t = time_sec - 11.0
            pop_p = clamp(pop_t / 0.8, 0.0, 1.0)
            pop_e = ease_out_back(pop_p)
            
            bw = int(540 * min(1.0, pop_e))
            bh = int(120 * min(1.0, pop_e))
            bx = WIDTH // 2
            by = HEIGHT // 2 + 240
            
            bubble_img = Image.new("RGBA", (bw + 40, bh + 40), (0, 0, 0, 0))
            bdraw = ImageDraw.Draw(bubble_img)
            bdraw.rounded_rectangle([15, 15, bw + 25, bh + 25], radius=28, fill=(0, 0, 0, int(75 * logo_alpha)))
            bdraw.rounded_rectangle([10, 10, bw + 10, bh + 10], radius=26, fill=(255, 255, 255, int(250 * logo_alpha)), outline=(226, 232, 240, int(255 * logo_alpha)), width=2)
            bdraw.polygon([(bw // 2 + 10, 0), (bw // 2 - 12 + 10, 12), (bw // 2 + 12 + 10, 12)], fill=(255, 255, 255, int(250 * logo_alpha)))
            
            base.paste(bubble_img, (bx - bubble_img.width // 2, by - bubble_img.height // 2), bubble_img)
            
            txt_alpha = int(255 * clamp((pop_t - 0.3) / 0.5, 0.0, 1.0) * logo_alpha)
            if txt_alpha > 0 and pop_e > 0.8:
                draw.text((bx, by - 12), "Welcome to the Weather App!", font=font_body_bold, fill=(15, 23, 42, txt_alpha), anchor="mm")
                draw.text((bx, by + 22), "Live radar • Hourly rain alerts • AI forecasts", font=font_caption, fill=(71, 85, 105, txt_alpha), anchor="mm")

    # =========================================================================
    # PHASE 3 & 4: MOBILE SIMULATION & GREEN SCREEN (16.0s - 50.0s)
    # =========================================================================
    if 16.0 <= time_sec <= 59.8:
        # Phone Position Schedule
        # 16s - 37.5s: Centered at x = 960
        # 37.5s - 39.5s: Slides to right x = 1380 for Green Screen presenter on left
        # 49.5s - 51.5s: Slides back to center x = 960 for Outro
        if time_sec < 37.5:
            phone_x = 960
            phone_y = 540
            phone_scale = 1.0
        elif 37.5 <= time_sec <= 39.5:
            slide_p = ease_in_out((time_sec - 37.5) / 2.0)
            phone_x = int(960 + slide_p * 420)
            phone_y = 540
            phone_scale = 1.0 - slide_p * 0.12
        elif 39.5 < time_sec < 49.5:
            phone_x = 1380
            phone_y = 540
            phone_scale = 0.88
        elif 49.5 <= time_sec <= 51.5:
            recenter_p = ease_in_out((time_sec - 49.5) / 2.0)
            phone_x = int(1380 - recenter_p * 420)
            phone_y = int(540 + recenter_p * 50)
            phone_scale = 0.88 - recenter_p * 0.05
        else:
            phone_x = 960
            phone_y = 590
            phone_scale = 0.83
            
        # Entrance slide from bottom at 16s - 17.5s
        if time_sec < 18.0:
            enter_p = ease_out_back(clamp((time_sec - 16.0) / 1.8, 0.0, 1.0))
            phone_y = int(1400 - enter_p * (1400 - 540))

        # Render Inner Phone Screen (384x780)
        screen_img = Image.new("RGBA", (SCREEN_W, SCREEN_H), (15, 23, 42, 255))
        sdraw = ImageDraw.Draw(screen_img)
        
        # Diurnal Phases:
        # A: Morning (16s - 21.5s)
        if time_sec < 21.5:
            for y_i in range(SCREEN_H):
                ratio = y_i / float(SCREEN_H)
                r_col = int(255 * (1.0 - ratio) + 100 * ratio)
                g_col = int(160 * (1.0 - ratio) + 181 * ratio)
                b_col = int(122 * (1.0 - ratio) + 246 * ratio)
                sdraw.line([(0, y_i), (SCREEN_W, y_i)], fill=(r_col, g_col, b_col, 255))
                
            sun_y = int(250 - (time_sec - 16.0) * 8)
            sdraw.ellipse([SCREEN_W//2 - 48, sun_y - 48, SCREEN_W//2 + 48, sun_y + 48], fill=(255, 230, 110, 255))
            
            cw, ch = 320, int(320 * (cloud_raw.height / float(cloud_raw.width)))
            cloud_scaled = cloud_raw.resize((cw, ch), Image.Resampling.BILINEAR)
            screen_img.paste(cloud_scaled, (SCREEN_W//2 - cw//2, sun_y + 15), cloud_scaled)
            
            sdraw.text((SCREEN_W//2, 75), "San Francisco", font=font_body_bold, fill=(255, 255, 255, 255), anchor="mm")
            sdraw.text((SCREEN_W//2, 110), "7:00 AM • Morning", font=font_caption, fill=(240, 245, 255, 240), anchor="mm")
            sdraw.text((SCREEN_W//2, 405), "18°C", font=font_temp, fill=(255, 255, 255, 255), anchor="mm")
            sdraw.text((SCREEN_W//2, 460), "Sunny & Fresh", font=font_body, fill=(245, 250, 255, 240), anchor="mm")
            
            # Glassmorphism Card (Dark translucent tint so white text pops)
            screen_img = apply_glass_card(screen_img, [24, 510, SCREEN_W - 24, 715], radius=22, fill_color=(15, 23, 42, 170), outline_color=(255, 255, 255, 75))
            sdraw = ImageDraw.Draw(screen_img)
            sdraw.text((SCREEN_W//2, 555), "Wind: 8 km/h • Humidity: 65%", font=font_caption_bold, fill=(255, 255, 255, 255), anchor="mm")
            sdraw.text((SCREEN_W//2, 605), "Visibility: 10 km • AQI: 18", font=font_caption, fill=(226, 232, 240, 240), anchor="mm")
            sdraw.text((SCREEN_W//2, 655), "Sunrise: 6:48 AM", font=font_caption, fill=(186, 230, 253, 240), anchor="mm")

        # B: Day (21.5s - 27.0s)
        elif 21.5 <= time_sec < 27.0:
            screen_img.paste(sky_day_pre, (0, 0))
            sdraw = ImageDraw.Draw(screen_img)
            
            sun_angle = (time_sec - 21.5) * 60.0
            sun_cx = SCREEN_W // 2
            sun_cy = 240
            for ray_i in range(0, 360, 45):
                rad = math.radians(ray_i + sun_angle)
                rx1 = sun_cx + math.cos(rad) * 44
                ry1 = sun_cy + math.sin(rad) * 44
                rx2 = sun_cx + math.cos(rad) * 66
                ry2 = sun_cy + math.sin(rad) * 66
                sdraw.line([(rx1, ry1), (rx2, ry2)], fill=(255, 215, 0, 240), width=4)
            sdraw.ellipse([sun_cx - 38, sun_cy - 38, sun_cx + 38, sun_cy + 38], fill=(255, 225, 30, 255))
            
            sdraw.text((SCREEN_W//2, 75), "San Francisco", font=font_body_bold, fill=(255, 255, 255, 255), anchor="mm")
            sdraw.text((SCREEN_W//2, 110), "1:00 PM • Clear Day", font=font_caption, fill=(240, 245, 255, 240), anchor="mm")
            sdraw.text((SCREEN_W//2, 405), "28°C", font=font_temp, fill=(255, 255, 255, 255), anchor="mm")
            sdraw.text((SCREEN_W//2, 460), "Radiant & Clear", font=font_body, fill=(255, 255, 255, 240), anchor="mm")
            
            screen_img = apply_glass_card(screen_img, [24, 510, SCREEN_W - 24, 715], radius=22, fill_color=(15, 23, 42, 175), outline_color=(255, 255, 255, 80))
            sdraw = ImageDraw.Draw(screen_img)
            sdraw.text((SCREEN_W//2, 555), "UV Index: 8 (Very High)", font=font_caption_bold, fill=(255, 220, 50, 255), anchor="mm")
            sdraw.text((SCREEN_W//2, 605), "Humidity: 38% • Pressure: 1014 hPa", font=font_caption, fill=(226, 232, 240, 240), anchor="mm")
            sdraw.text((SCREEN_W//2, 655), "Wind: 14 km/h WNW", font=font_caption, fill=(186, 230, 253, 240), anchor="mm")

        # C: Evening (27.0s - 32.5s)
        elif 27.0 <= time_sec < 32.5:
            for y_i in range(SCREEN_H):
                ratio = y_i / float(SCREEN_H)
                r_col = int(192 * (1.0 - ratio) + 249 * ratio)
                g_col = int(38 * (1.0 - ratio) + 115 * ratio)
                b_col = int(211 * (1.0 - ratio) + 22 * ratio)
                sdraw.line([(0, y_i), (SCREEN_W, y_i)], fill=(r_col, g_col, b_col, 255))
                
            sdraw.ellipse([SCREEN_W//2 - 55, 225, SCREEN_W//2 + 55, 335], fill=(255, 170, 40, 245))
            
            cw, ch = 340, int(340 * (cloud_raw.height / float(cloud_raw.width)))
            cloud_scaled = cloud_raw.resize((cw, ch), Image.Resampling.BILINEAR)
            cloud_offset = int((time_sec - 27.0) * 14)
            screen_img.paste(cloud_scaled, (SCREEN_W//2 - cw//2 + cloud_offset, 255), cloud_scaled)
            
            sdraw.text((SCREEN_W//2, 75), "San Francisco", font=font_body_bold, fill=(255, 255, 255, 255), anchor="mm")
            sdraw.text((SCREEN_W//2, 110), "6:30 PM • Golden Hour", font=font_caption, fill=(255, 245, 235, 240), anchor="mm")
            sdraw.text((SCREEN_W//2, 405), "22°C", font=font_temp, fill=(255, 255, 255, 255), anchor="mm")
            sdraw.text((SCREEN_W//2, 460), "Sunset in 12 mins", font=font_body, fill=(255, 245, 235, 240), anchor="mm")
            
            screen_img = apply_glass_card(screen_img, [24, 510, SCREEN_W - 24, 715], radius=22, fill_color=(15, 23, 42, 175), outline_color=(255, 255, 255, 80))
            sdraw = ImageDraw.Draw(screen_img)
            sdraw.text((SCREEN_W//2, 555), "Sunset: 6:42 PM", font=font_caption_bold, fill=(255, 200, 120, 255), anchor="mm")
            sdraw.text((SCREEN_W//2, 605), "Breeze: 11 km/h • Humidity: 54%", font=font_caption, fill=(226, 232, 240, 240), anchor="mm")
            sdraw.text((SCREEN_W//2, 655), "Cloud Cover: 30%", font=font_caption, fill=(186, 230, 253, 240), anchor="mm")

        # D: Night (32.5s - 60.0s)
        else:
            screen_img.paste(sky_night_pre, (0, 0))
            sdraw = ImageDraw.Draw(screen_img)
            
            moon_cx = SCREEN_W // 2
            moon_cy = 230
            sdraw.ellipse([moon_cx - 38, moon_cy - 38, moon_cx + 38, moon_cy + 38], fill=(235, 245, 255, 255))
            sdraw.ellipse([moon_cx - 20, moon_cy - 48, moon_cx + 46, moon_cy + 28], fill=(15, 23, 42, 255))
            
            sdraw.text((SCREEN_W//2, 75), "San Francisco", font=font_body_bold, fill=(255, 255, 255, 255), anchor="mm")
            sdraw.text((SCREEN_W//2, 110), "10:00 PM • Clear Night", font=font_caption, fill=(203, 213, 225, 240), anchor="mm")
            sdraw.text((SCREEN_W//2, 405), "16°C", font=font_temp, fill=(255, 255, 255, 255), anchor="mm")
            sdraw.text((SCREEN_W//2, 460), "Starry & Calm", font=font_body, fill=(226, 232, 240, 240), anchor="mm")
            
            screen_img = apply_glass_card(screen_img, [24, 510, SCREEN_W - 24, 715], radius=22, fill_color=(15, 23, 42, 180), outline_color=(255, 255, 255, 75))
            sdraw = ImageDraw.Draw(screen_img)
            sdraw.text((SCREEN_W//2, 555), "Air Quality Index: 24 (Good)", font=font_caption_bold, fill=(74, 222, 128, 255), anchor="mm")
            sdraw.text((SCREEN_W//2, 605), "Humidity: 72% • Wind: 5 km/h", font=font_caption, fill=(226, 232, 240, 240), anchor="mm")
            sdraw.text((SCREEN_W//2, 655), "Moon Phase: Waxing Crescent", font=font_caption, fill=(186, 230, 253, 240), anchor="mm")

        # Viewport Masking & Phone Assembly
        screen_img.putalpha(screen_mask)
        phone_full = phone_chassis.copy()
        phone_full.paste(screen_img, (30 + (PHONE_W - SCREEN_W) // 2, 30 + (PHONE_H - SCREEN_H) // 2), screen_img)
        
        if phone_scale != 1.0:
            pw = int(phone_full.width * phone_scale)
            ph = int(phone_full.height * phone_scale)
            phone_scaled = phone_full.resize((pw, ph), Image.Resampling.BILINEAR)
            base.paste(phone_scaled, (phone_x - pw // 2, phone_y - ph // 2), phone_scaled)
        else:
            base.paste(phone_full, (phone_x - phone_full.width // 2, phone_y - phone_full.height // 2), phone_full)

    # =========================================================================
    # PHASE 4: GREEN SCREEN PRESENTER ON LEFT POINTING RIGHT (38.0s - 50.5s)
    # =========================================================================
    if 38.0 <= time_sec <= 50.5 and len(gs_frames) > 0:
        gs_rel = time_sec - 38.0
        video_dur = len(gs_frames) / 29.97
        loop_time = gs_rel % video_dur
        gs_idx = int(loop_time * 29.97) % len(gs_frames)
        
        pres_img = gs_frames[gs_idx]
        pres_alpha = min(1.0, gs_rel / 1.0) * min(1.0, (50.5 - time_sec) / 1.0)
        
        # Position presenter on LEFT side (arm points directly towards the phone on the right)
        pres_x = 420
        pres_y = 620
        
        if pres_alpha > 0.05:
            # Scale presenter nicely
            pw = int(pres_img.width * 0.88)
            ph = int(pres_img.height * 0.88)
            pres_scaled = pres_img.resize((pw, ph), Image.Resampling.BILINEAR)
            
            if pres_alpha < 0.98:
                r_ch, g_ch, b_ch, a_ch = pres_scaled.split()
                a_ch = a_ch.point(lambda p: int(p * pres_alpha))
                pres_scaled = Image.merge("RGBA", (r_ch, g_ch, b_ch, a_ch))
                
            base.paste(pres_scaled, (pres_x - pw // 2, pres_y - ph // 2), pres_scaled)
            
        # Interactive Callout Badges Between Presenter & Phone
        if 40.0 <= time_sec <= 49.5:
            badge_t = time_sec - 40.0
            badge_p = clamp(badge_t / 0.6, 0.0, 1.0)
            badge_e = ease_out_back(badge_p)
            
            bw = int(310 * min(1.0, badge_e))
            bh = int(64 * min(1.0, badge_e))
            bx = 960
            by = 410
            b_alpha = min(1.0, (49.5 - time_sec) / 0.8)
            
            badge_img = Image.new("RGBA", (bw + 20, bh + 20), (0, 0, 0, 0))
            b_draw = ImageDraw.Draw(badge_img)
            b_draw.rounded_rectangle([10, 10, bw + 10, bh + 10], radius=18, fill=(34, 197, 94, int(235 * b_alpha)))
            base.paste(badge_img, (bx - badge_img.width // 2, by - badge_img.height // 2), badge_img)
            
            if badge_e > 0.7:
                draw.text((bx, by), "• LIVE RADAR & ALERTS", font=font_body_bold, fill=(255, 255, 255, int(255 * b_alpha)), anchor="mm")
                
        if 43.5 <= time_sec <= 49.5:
            badge2_t = time_sec - 43.5
            badge2_p = clamp(badge2_t / 0.6, 0.0, 1.0)
            badge2_e = ease_out_back(badge2_p)
            
            bw = int(310 * min(1.0, badge2_e))
            bh = int(64 * min(1.0, badge2_e))
            bx = 960
            by = 495
            b2_alpha = min(1.0, (49.5 - time_sec) / 0.8)
            
            b2_img = Image.new("RGBA", (bw + 20, bh + 20), (0, 0, 0, 0))
            b2_draw = ImageDraw.Draw(b2_img)
            b2_draw.rounded_rectangle([10, 10, bw + 10, bh + 10], radius=18, fill=(56, 189, 248, int(235 * b2_alpha)))
            base.paste(b2_img, (bx - b2_img.width // 2, by - b2_img.height // 2), b2_img)
            
            if badge2_e > 0.7:
                draw.text((bx, by), "★ 99.4% ACCURACY", font=font_body_bold, fill=(15, 23, 42, int(255 * b2_alpha)), anchor="mm")

    # =========================================================================
    # PHASE 5: OUTRO CALL TO ACTION & RESOLUTION (50.5s - 60.0s)
    # =========================================================================
    if time_sec >= 50.5:
        out_t = time_sec - 50.5
        out_p = clamp(out_t / 1.5, 0.0, 1.0)
        out_e = ease_out_back(out_p)
        
        out_alpha = 1.0
        if time_sec > 58.2:
            out_alpha = max(0.0, (60.0 - time_sec) / 1.8)
            
        headline_alpha = int(255 * out_p * out_alpha)
        
        if headline_alpha > 0:
            # Clean headline at top above phone
            draw.text((WIDTH // 2, 70), "Check Weather Anywhere!", font=font_headline, fill=(255, 255, 255, headline_alpha), anchor="mm")
            draw.text((WIDTH // 2, 120), "Hyperlocal precision • Zero ads • Available worldwide", font=font_body, fill=(148, 163, 184, headline_alpha), anchor="mm")
            
            # Button below phone
            btn_w = int(360 * min(1.0, out_e))
            btn_h = int(68 * min(1.0, out_e))
            btn_x = WIDTH // 2
            btn_y = 975
            
            btn_img = Image.new("RGBA", (btn_w + 30, btn_h + 30), (0, 0, 0, 0))
            btndraw = ImageDraw.Draw(btn_img)
            btndraw.rounded_rectangle([15, 15, btn_w + 15, btn_h + 15], radius=26, fill=(0, 0, 0, int(80 * out_alpha)))
            btndraw.rounded_rectangle([10, 10, btn_w + 10, btn_h + 10], radius=24, fill=(56, 189, 248, int(255 * out_alpha)))
            base.paste(btn_img, (btn_x - btn_img.width // 2, btn_y - btn_img.height // 2), btn_img)
            
            if out_e > 0.8:
                draw.text((btn_x, btn_y), "DOWNLOAD NOW", font=font_btn, fill=(11, 15, 25, int(255 * out_alpha)), anchor="mm")
                draw.text((btn_x, btn_y + 52), "Available on iOS & Android", font=font_caption, fill=(148, 163, 184, int(255 * out_alpha)), anchor="mm")

    # Global Fade to Black
    if time_sec > 59.5:
        fade_black = int(255 * (time_sec - 59.5) / 0.5)
        black_overlay = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, fade_black))
        base.paste(black_overlay, (0, 0), black_overlay)

    # Encode frame
    rgb_frame = base.convert("RGB")
    encoder.stdin.write(rgb_frame.tobytes())
    
    if (frame_idx + 1) % 200 == 0:
        pct = int(((frame_idx + 1) / float(TOTAL_FRAMES)) * 100)
        print(f"Rendered frame {frame_idx + 1}/{TOTAL_FRAMES} ({pct}%) - {time_sec:.1f}s")

encoder.stdin.close()
encoder.wait()

print("\nRender completed successfully!")
print(f"Output saved to: {OUTPUT_PATH}")
