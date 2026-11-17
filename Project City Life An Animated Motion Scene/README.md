# Project: City Life – An Animated Motion Scene

## Brief
A 90-second animated short in After Effects showcasing a lively city environment with a walking character, moving background, neon text, and audio integration.

## Scenes
| # | Scene | Duration |
|---|-------|----------|
| 1 | City Background (buildings, animated clouds, sky gradient) | Full |
| 2 | Walking Character (shape-layer rig, bouncing body, arm/leg cycle) | Full |
| 3 | Neon Text (CITY LIFE + OPEN 24/7, flicker expression, glow) | Full |

## Compositions
- `MASTER_CityLife` — 1920×1080, 30fps, 90s (render target)
- `Scene_01_CityBackground` — City environment
- `Scene_02_Character` — Walk cycle pre-comp (400×400)
- `Scene_03_NeonText` — Neon sign overlays

## Key Techniques
- Shape layer buildings with ADBE Ramp sky gradient
- Character limb animation with `loopOut('cycle')` expressions
- Bouncing body: `Math.sin(time * freq * 2 * Math.PI) * amp`
- Neon flicker: `random(minFlicker, maxFlicker)` on opacity
- ADBE Glo2 effect for neon glow
- 2.5% camera push-in via null object (cinematic drift)

## Build & Run
```powershell
# Option 1: Run via ae_bridge when AE is open
python scripts/ae_bridge.py run_file --file "Project City Life An Animated Motion Scene/scripts/build_project.jsx"

# Option 2: Headless via aerender
"C:\Program Files\Adobe\Adobe After Effects 2026\Support Files\aerender.exe" -r "scripts/build_project.jsx"
```

## Deliverables
- `City_Life_AnimatedScene.aep` — Full project file
- `Final_CityLife.avi` — Render output (then encode to MP4 via FFmpeg)
