# Project: Future Voyage – A Motion Design Story in After Effects

## Brief
A 100-second futuristic travel-themed animation combining map animation, holographic interface design, and kinetic text transitions.

## Scenes
| # | Scene | Duration | In Master |
|---|-------|----------|-----------|
| 1 | Map Path Animation (Trim Paths, path marker) | 20s | 0–20s |
| 2 | Interactive Screen (button scale/rotate, cursor click) | 20s | 20–40s |
| 3 | Holographic Map (3D rings, glow, pop-up scale) | 20s | 40–60s |
| 4 | Title Reveal (3D text, Y-rotation, slide in) | 15s | 60–75s |
| 5 | Kinetic Text (hanging anchor, swing in, opacity fade) | 15s | 75–90s |
| 6 | Final Integration (end card) | 10s | 90–100s |

## Compositions
- `MASTER_FutureVoyage` — 1920×1080, 30fps, 100s
- `Scene_01_MapPath` through `Scene_06_FinalIntegration`

## Key Techniques
- ADBE Vector Filter - Trim (Trim Paths) on travel route
- 3D layer rings with Y-rotation and ADBE Glo2
- Button: scale 0→100% + 720° rotation, cursor click scale pop
- Kinetic text: anchor at top, Y rotation 180→0 (hanging swing)
- Lumetri Color adjustment layer for consistent tone
- 2.5% camera push-in drift null

## Build & Run
```powershell
python scripts/ae_bridge.py run_file --file "Project Future Voyage A Motion Design Story in After Effects/scripts/build_project.jsx"
```

## Deliverables
- `Future_Voyage_MotionStory.aep`
- `Final_FutureVoyage.avi`
