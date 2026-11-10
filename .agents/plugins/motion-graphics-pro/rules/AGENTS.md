# Motion Graphics & After Effects Engineering Guidelines

These rules apply when developing scripts, templates, plugins, and animations in this workspace.

---

## 1. After Effects Scripting Standards (ExtendScript / JSX)
- **Always Wrap Scripts in an Undo Group**:
  Wrap all procedural modifications in `app.beginUndoGroup("Action Name")` and `app.endUndoGroup()` to allow single-click undo.
- **Match Names Over Display Names**:
  Never refer to properties or effects by translated UI strings (e.g. `"Ramp"`). Always use official Adobe Match Names (e.g., `"ADBE Ramp"`, `"ADBE SubspaceStabilizer"`, `"ADBE Root Vectors Group"`, `"ADBE Vector Shape - Rect"`).
- **Keyframe Tangents & Easing**:
  Always set temporal ease using `new KeyframeEase(speed, influence)`. Standard cinematic easing uses `speed = 0.0` and `influence = 75.0` to `85.0`.
- **Spatial Tangents for 2D/3D**:
  When easing multidimensional spatial properties (`PropertyValueType.TwoD_SPATIAL` / `ThreeD_SPATIAL`), supply arrays of ease objects corresponding to the property dimensions (`[easeIn, easeIn]`).
- **Null Safety & Item Resolution**:
  Always verify `app.project.activeItem != null` and `app.project.activeItem instanceof CompItem` before operating on timeline layers.

---

## 2. Remotion & Programmatic Motion Standards
- **Frame Rate & Resolution**:
  Standard master composition is 1920×1080 at 30.00 fps. Previews should be generated at identical frame rates to preserve sub-frame kinetic fidelity.
- **Master Export Format**:
  Overlays and graphic elements must render to Apple ProRes 4444 `.mov` with straight alpha channels. Full-frame takeovers may render opaque.
- **Sound Design Crest Alignment**:
  Sound effects must align with visual action on the exact crest frame (e.g. `whoosh` crests 3–5 frames before settling, `shutter` and `pop` align on frame 0 of visual contact).
- **Cinematic Drift & Camera Motion**:
  Never leave full-frame graphics static. Use `Stage` push-in (subtle 2.5% scale increase over composition duration) or floating element drifts to preserve visual life.

---

## 3. Motion Design & Animation Craftsmanship
- **The 12 Principles**:
  Apply anticipation (slight recoil before acceleration), secondary action (overshoot, squash/stretch), and follow-through to all UI and vector animations.
- **Graph Editor Polish**:
  Avoid default linear keyframes or raw `F9` (33% ease) for primary focal elements. Shape speed curves with asymmetrical peaks (rapid rise, extended deceleration).
- **Asset Fidelity**:
  Prefer official vector SVGs and authentic brand marks over generic icon approximations.

---

## 4. Continuous Editing Learning
- **Capture User Preferences**:
  When the user adjusts timing, fonts, easing curves, or asset sources, record the preferred setting into `.agents/memory/motion-preferences.json` and respect it across all subsequent generations.
