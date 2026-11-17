# Project: The Journey of a Memory – A Motion Story in After Effects

## Brief
A 100-second cinematic animation visually representing a memory traveling through space and time — revealing images, flags, footsteps, and fading ghostly visuals.

## Scenes
| # | Scene | Duration | In Master |
|---|-------|----------|-----------|
| 1 | Memory Reveal (masking split, two-mask reveal) | 15s | 0–15s |
| 2 | Flag Animation (shape layers, USA flag, slide in) | 15s | 15–30s |
| 3 | Long Shadow Text (drop shadow animation, motion blur) | 15s | 30–45s |
| 4 | Camera Design Object (AE-native camera shape rig) | 15s | 45–60s |
| 5 | Footsteps Across Map (path animation, opacity sequence) | 15s | 60–75s |
| 6 | Ghostly Memory (blur + turbulent displace, fade to 0) | 15s | 75–90s |
| 7 | Final Composite (end card) | 10s | 90–100s |

## Compositions
- `MASTER_JourneyOfMemory` — 1920×1080, 30fps, 100s
- `Scene_01_MemoryReveal` through `Scene_07_FinalComposite`

## Key Techniques
- Dual mask split reveal on memory image layer
- Shape layer USA flag (red bg, white stripe, blue canton + stars)
- Long shadow via ADBE Drop Shadow with animated distance property
- Camera shape rig: body, lens, glass, shutter button
- Footprints: sequential opacity animation
- Ghost: ADBE Box Blur2 + ADBE Turbulent Displace with time expression
- Lumetri Color grading (warm memory tone)
- 2.5% cinematic camera drift null

## Build & Run
```powershell
python scripts/ae_bridge.py run_file --file "Project The Journey of a Memory A Motion Story in After Effects/scripts/build_project.jsx"
```

## Deliverables
- `Journey_Of_Memory_MotionStory.aep`
- `Final_JourneyOfMemory.avi`
