# Animated Mobile Weather App Promo Project

An advanced Adobe After Effects master project and comprehensive technical guide demonstrating mobile app simulation, mask-based logo reveals, fluid shape transitions, procedural weather animations, Keylight 1.2 chroma key compositing, motion blur, and rhythm-locked sound design.

---

## 📁 Project Directory Structure

```text
Animated Mobile Weather App Promo Project/
├── Final_WeatherApp_Promo.aep       # Master After Effects Project File (AE 2026)
├── Final_WeatherApp_Promo.mp4       # Exported 60-Second Full HD 1080p 30fps Video
├── README.md                        # Complete Architectural Documentation & Guide
├── Project Animated Mobile Weather App Promo.pdf  # Course Project Specification
├── assets/                          # Curated Media Pipeline from Motion Graphics
│   ├── footage/
│   │   └── presenter_greenscreen.mp4   # 1080p Chroma Key Footage (Gesture Interaction)
│   ├── images/
│   │   ├── phone_frame.png          # Transparent Mobile Device Mockup
│   │   ├── sky_day.jpg              # High-Res Clear Blue Sky Backdrop (5472×3648)
│   │   ├── sky_night.jpg            # Deep Starry Space Backdrop (2560×1700)
│   │   └── cloud_texture.png        # Alpha-Channel Translucent Cloud Overlay
│   └── audio/
│       └── promo_soundtrack.mp3     # Full Synchronized Acoustic Promo Music Track
└── scripts/
    ├── build_project.jsx            # Standalone ExtendScript Builder for After Effects
    └── render_promo.py              # Automated 60fps Full HD Render & Encoding Pipeline
```

---

## 🎬 Project Specifications

| Property | Specification |
| :--- | :--- |
| **Project File** | `Final_WeatherApp_Promo.aep` |
| **Main Composition** | `Weather App Promo` |
| **Resolution** | `1920 × 1080` (Full HD 16:9 Standard) |
| **Frame Rate** | `30.00 fps` |
| **Duration** | `60.00 Seconds` (1801 Frames) |
| **Motion Blur** | Enabled Globally & Per-Layer ($\mathcal{M}$) |
| **Color Depth** | 8-bpc / 16-bpc sRGB Rec.709 |
| **Audio Format** | AAC Stereo, 44.1 kHz, 256 kbps |
| **Video Format** | H.264 High Profile (MP4) @ 15 Mbps Target Bitrate |

---

## ⏱️ Timeline Architecture & Sequence Breakdown

The promotional sequence is architected into five distinct, synchronized phases:

```
00:00          00:08           00:16                          00:38                  00:50        01:00
  |--------------|---------------|------------------------------|----------------------|------------|
      Phase 1         Phase 2                Phase 3                     Phase 4          Phase 5
   Intro Sliding   Masked Logo     Weather Simulation (Mobile)      Green Screen       Outro CTA
    Transition    & Message Pop   Morning -> Day -> Eve -> Night   Keylight Composite & Polish
```

### Phase 1: Intro Cinematic Transition (`00:00` – `00:08`)
* **Backdrop**: Studio charcoal slate `#0B0F19` with soft radial ambient glow `#182640`.
* **Dynamic Slabs**:
  * **Slab 1 (Sky Blue `#38BDF8`)**: Enters from `[-1500, -200]` across a $-22^\circ$ diagonal plane, snaps into center stage at `00:01.8`, holds through `00:05.5`, and wipes offscreen to `[3200, 800]`.
  * **Slab 2 (Indigo `#6366F1`)**: Follows with a 0.3s staggered delay from `[+1500, -200]`, balancing the visual weight.
* **Teaser Typography**:
  * Title: *"NEXT-GEN WEATHER EXPERIENCE"* (Segoe UI Bold, white with opacity ramp).
  * Subtitle: *"Precision Forecasts • Real-Time Radar • Fluid Motion"*.
* **Motion Blur & Easing**: Per-layer motion blur generates high-velocity speed streaks; speed curves set to $75\%$ influence for crisp acceleration and deceleration.

### Phase 2: Masked Logo Reveal & Message Pop-Up (`00:08` – `00:16`)
* **Brand Logo**: Custom vector weather badge combining a radiant golden sun (`#FCC72C`) and organic multi-puff cloud body (`#FAFCFF`).
* **Mask-Based Path Reveal**:
  * A rectangular mask is applied to the logo container layer.
  * `Mask Path` is animated from height 0 (fully concealed) to height 240px (fully unmasked) between `00:08.0` and `00:09.5`.
  * Secondary transform: Scale pop from `0%` to `118%` with an elastic overshoot bounce settling at `100%`.
  * Rotation flair: Spins from $-35^\circ$ to $0^\circ$ synchronized with the mask reveal.
  * Optical styling: Soft glow (`ADBE Glo2`, radius 45, intensity 1.3) and drop shadow (`distance 18`, `softness 30`).
* **Brand Typography**:
  * *"AeroWeather"* (72pt, white) rises vertically from `[960, 520]` to `[960, 485]`.
  * Sub-caption: *"Intelligent Hyperlocal Forecasts"* (24pt, slate grey `#94A3B8`).
* **Message Pop-Up (`00:11.0` – `00:16.0`)**:
  * **Shape Layer**: Translucent white speech bubble (540×120px, 26px corner roundness) with an integrated triangular pointer notch.
  * **Motion**: Pops up from `[960, 710]` to `[960, 660]` with a spring scale bounce (`0%` $\to$ `110%` $\to$ `100%`).
  * **Copy**: *"Welcome to the Weather App!"* with subtext *"Live radar • Hourly rain alerts • AI forecasts"*.

### Phase 3: Mobile Weather App Diurnal Simulation (`00:16` – `00:38`)
Inside an ultra-sleek titanium mobile phone chassis (420×840px, 56px corner radius, chrome rim outline, speaker notch):
1. **Morning Phase (`00:16.0` – `00:21.5`)**:
   - Atmosphere: Peach-to-Sky-Blue sunrise vertical ramp (`#FFA07A` $\to$ `#87CEEB`).
   - Weather Icon: Soft rising morning sun paired with drifting translucent mist clouds (`cloud_texture.png`).
   - UI Metrics: `7:00 AM • 18°C Sunny Morning • Wind 8 km/h • Humidity 65% • San Francisco`.
   - Card: Dark frosted glassmorphism widget with subtle white border.
2. **Day Phase (`00:21.5` – `00:27.0`)**:
   - Atmosphere: Brilliant high-altitude blue sky (`sky_day.jpg`).
   - Weather Icon: Radiant golden sun with 8 procedural geometric rays rotating continuously (`time * 60`).
   - UI Metrics: `1:00 PM • 28°C Clear Day • UV Index: 8 (Very High) • Humidity 38% • Pressure 1014 hPa`.
3. **Evening Phase (`00:27.0` – `00:32.5`)**:
   - Atmosphere: Twilight sunset gradient from magenta `#C026D3` to amber `#F97316`.
   - Weather Icon: Sunset horizon aura with passing warm cloud layers drifting horizontally.
   - UI Metrics: `6:30 PM • 22°C Golden Hour • Sunset: 6:42 PM • Gentle Breeze 11 km/h`.
4. **Night Phase (`00:32.5` – `00:38.0`)**:
   - Atmosphere: Deep interstellar starry space sky (`sky_night.jpg`).
   - Weather Icon: Silvery glowing crescent moon with soft aura.
   - UI Metrics: `10:00 PM • 16°C Clear Night • Air Quality Index: 24 (Good) • Humidity 72%`.
* **Transitions**: Smooth cross-dissolve with position glides between all four diurnal states.

### Phase 4: Green Screen Keylight Composite & Interaction (`00:38` – `00:50`)
* **Chroma Key Footage**: `presenter_greenscreen.mp4` imported and keyed using **Keylight 1.2 (`ADBE Keylight`)**.
  * **Screen Colour**: Calibrated to exact green chroma hue.
  * **Screen Gain & Screen Balance**: Tuned to eliminate green edge spill while preserving hairline details.
  * **Clip Black / White**: Clip Black raised to 8.0, Clip White lowered to 90.0 to create a solid matte without core noise.
  * **Despill Bias**: Enabled to neutralize reflected green light on skin tones and wardrobe.
* **Stage Choreography**:
  * Mobile phone glides from center stage to the right side (`x = 1380`, scaled to 88%).
  * Presenter is composited cleanly on the left side (`x = 420`), with her arm extending and pointing directly toward the mobile weather interface.
* **Interactive Synced Tooltips**:
  * As the presenter gestures, interactive glowing pill badges pop up between her hand and the mobile screen:
    * `00:40.0`: `• LIVE RADAR & ALERTS` (Emerald Green `#22C55E`, spring pop).
    * `00:43.5`: `★ 99.4% ACCURACY` (Sky Blue `#38BDF8`, spring pop).

### Phase 5: Outro Call to Action & Resolution (`00:50` – `01:00`)
* **Stage Convergence**:
  * Phone glides smoothly back to center stage (`x = 960, y = 590`, scale 84%).
* **Outro Headline**:
  * *"Check Weather Anywhere!"* (Bold 60pt, crisp white, centered at `y = 70`).
  * Sub-caption: *"Hyperlocal precision • Zero ads • Available worldwide"* (`y = 120`).
* **Call-to-Action Button**:
  * Rounded button badge: *"DOWNLOAD NOW"* (`#38BDF8` background with slate navy text `#0B0F19`, positioned at `y = 975`).
  * Store availability: *"Available on iOS & Android"*.
* **Resolution**: All elements converge into final brand alignment before a graceful cinematic fade to black at `00:59.8`.

---

## 🛠️ Step-by-Step After Effects Guide

### Step 1: Project Setup
1. Launch Adobe After Effects and create a new project.
2. Go to **Composition > New Composition...** (`Ctrl + N`).
3. Set the composition properties:
   - **Composition Name**: `Weather App Promo`
   - **Preset**: HDTV 1080 30 (1920 × 1080 px)
   - **Pixel Aspect Ratio**: Square Pixels (1.0)
   - **Frame Rate**: `30.00`
   - **Duration**: `00:01:00:00` (1 minute / 1801 frames)
4. Enable global motion blur in the composition timeline header.
5. Save the project as `Final_WeatherApp_Promo.aep` (`Ctrl + S`).

### Step 2: Create Intro Transition
1. Create a background solid: **Layer > New > Solid...** (`Ctrl + Y`), named `02_Stage_Background`, `#0B0F19`.
2. Apply **Effect > Generate > Gradient Ramp** (`ADBE Ramp`) to give a rich studio backdrop.
3. Add a shape layer: **Layer > New > Shape Layer**, named `03a_Intro_Slab_SkyBlue`.
4. Add a Rectangle shape (`2600 × 480 px`, roundness `16 px`) and fill with Sky Blue `#38BDF8`.
5. Rotate the layer to `-22°` and keyframe Position (`P`):
   - `00:00.0`: `[-1500, 300]`
   - `00:01.8`: `[960, 540]`
   - `00:05.5`: `[960, 540]`
   - `00:08.0`: `[3200, 800]`
6. Enable the Motion Blur switch ($\mathcal{M}$) on the layer.
7. Select all keyframes and press `F9` (**Easy Ease**). Open the Graph Editor (`Shift + F3`) and pull bezier handles to $75\%$ influence.
8. Duplicate the slab for `03b_Intro_Slab_Indigo`, tint to Indigo `#6366F1`, and stagger by 10 frames.

### Step 3: Logo Reveal
1. Create a shape layer named `04a_Logo_SunCloud_Badge`.
2. Draw a central ellipse for the sun (`140 × 140 px`, Solar Gold `#FCC72C`) and overlapping circles for the cloud body (`#FAFCFF`).
3. Add a rectangle mask to the layer: Select the layer, choose the **Rectangle Tool** (`Q`), and draw a mask over the logo.
4. Keyframe `Mask Path` under **Masks > Mask 1**:
   - `00:08.0`: Collapse mask height to 0 (bottom edge of logo).
   - `00:09.5`: Expand mask height to fully encompass the logo.
5. Keyframe Scale (`S`) from `0%` to `118%` to `100%` and Rotation (`R`) from `-35°` to `0°`.
6. Apply **Effect > Stylize > Glow** (`ADBE Glo2`) with Radius = 45 and Intensity = 1.3.

### Step 4: Message Pop-Up
1. Create a shape layer named `05a_Speech_Bubble_Shape`.
2. Add a rounded rectangle (`540 × 120 px`, roundness `26 px`) and a 3-point Polystar for the pointer notch.
3. Fill with translucent white `#FFFFFF` (opacity $95\%$).
4. Apply **Effect > Perspective > Drop Shadow** (`distance 20`, `softness 35`, `opacity 30%`).
5. Add text layers: *"Welcome to the Weather App!"* and *"Live radar • Hourly rain alerts • AI forecasts"*.
6. Keyframe Position (`P`) and Scale (`S`) with bouncy spring easing.

### Step 5: Weather Scene Animation
1. Build the mobile phone chassis shape layer: Outer rect (`430 × 860 px`, roundness `56 px`, dark titanium `#181C26`) and inner viewport mask (`394 × 824 px`, roundness `46 px`).
2. Construct 4 diurnal sub-layers parented to the viewport:
   - **Morning**: Soft peach ramp, rising sun, and mist cloud layer.
   - **Day**: `sky_day.jpg` background with rotating 8-point sun (`Rotation = time * 60`).
   - **Evening**: Magenta-to-orange twilight ramp with drifting evening clouds.
   - **Night**: `sky_night.jpg` background with glowing crescent moon.
3. Animate Position and Opacity between phases for smooth 20-frame cross-fades.

### Step 6: Add Green Screen Composite
1. Import `presenter_greenscreen.mp4` via **File > Import > File...** (`Ctrl + I`).
2. Drag footage onto the timeline; set `startTime` to `38.0s` and position at `[420, 620]`.
3. Apply **Effect > Keying > Keylight (1.2)** (`ADBE Keylight`).
4. Click the eyedropper on **Screen Colour** and sample the background green.
5. In Keylight settings:
   - Set **Screen Gain** to `105.0` and **Screen Balance** to `95.0`.
   - Expand **Screen Matte**; adjust **Clip Black** to `8.0` and **Clip White** to `90.0`.
   - Under **Despill Bias**, pick skin tones to neutralize green fringe.
6. Position mobile phone on the right stage (`x = 1380`), allowing the presenter to point directly toward the weather interface.
7. Animate feature callout badges (`• LIVE RADAR & ALERTS`) popping up in sync with the gesture.

### Step 7: Finishing Touches
1. Ensure Motion Blur is checked on all animated layers.
2. Import `promo_soundtrack.mp3` and add audio level keyframes (`-24 dB` $\to$ `0 dB` $\to$ `-48 dB`).
3. Add glassmorphic styling to weather metric cards.
4. Animate the Outro Call to Action: *"Check Weather Anywhere!"* and *"DOWNLOAD NOW"* button.

### Step 8: Render and Export
1. Select composition `Weather App Promo`.
2. Go to **Composition > Add to Render Queue** (`Ctrl + M`).
3. In Output Module Settings:
   - **Format**: `H.264`
   - **Profile**: High
   - **Target Bitrate**: 15 Mbps
   - **Audio Output**: 44.1 kHz, 16-bit Stereo
4. Set Output file path to `Final_WeatherApp_Promo.mp4`.
5. Click **Render**.

---

## ⌨️ Essential After Effects Keyboard Shortcuts

| Shortcut (Windows) | Action | Workflow Function |
| :--- | :--- | :--- |
| `Ctrl + N` | New Composition | Set up 1920×1080 @ 30fps comp |
| `Ctrl + Y` | New Solid Layer | Create stage backdrops and ramps |
| `Q` | Cycle Shape Tools | Toggle Rect, Rounded Rect, Ellipse, Star |
| `Ctrl + T` | Horizontal Text Tool | Create typography layers |
| `P` | Reveal Position | Animate layer translation |
| `S` | Reveal Scale | Animate pop / spring expansion |
| `R` | Reveal Rotation | Animate rotating sun rays and flairs |
| `T` | Reveal Opacity | Control dissolves and fades |
| `U` | Reveal Keyframed Properties | Clean timeline view to active keys |
| `F9` | Apply Easy Ease | Smooth acceleration and deceleration |
| `Shift + F3` | Graph Editor | Inspect and edit speed/value curves |
| `Ctrl + Shift + D` | Split Layer | Cut layers at current time indicator |
| `Ctrl + M` | Add to Render Queue | Prepare export to H.264 MP4 |
| `Ctrl + S` | Save Project | Save `Final_WeatherApp_Promo.aep` |

---

## 🎓 Key Learnings & Core Concepts

1. **Keylight 1.2 Chroma Keying**:
   - The primary challenge in green screen compositing is eliminating edge halo while preserving hair edge transparency.
   - Using **Clip Black** eliminates noise in transparent regions, while **Clip White** guarantees full opacity in the subject.
   - **Despill Bias** replaces green light reflected off the backdrop with complementary warm tones, preventing "green skin".

2. **Mask-Based Vector Reveals**:
   - Animating `Mask Path` decouples the reveal shape from layer scaling, preventing distortion of text and logos during entrance.

3. **Temporal vs. Spatial Easing**:
   - Linear keyframes produce robotic, unnatural movement. Setting temporal ease to $75\%$ influence mimics real-world inertia, where elements accelerate smoothly and settle gently.

4. **Glassmorphism in Motion UI**:
   - Simulated using semi-translucent dark overlays ($15-25\%$ opacity) combined with subtle 1px white strokes ($30-40\%$ opacity) and soft drop shadows, allowing rich atmospheric backgrounds to show through while maintaining text legibility.

5. **ExtendScript Project Automation**:
   - ExtendScript allows 100% programmatic generation of complex After Effects projects, ensuring bit-for-bit reproducibility of compositions, keyframes, effects, and render queue jobs across production environments.
