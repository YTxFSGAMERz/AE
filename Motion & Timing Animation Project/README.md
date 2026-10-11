# Motion & Timing Animation Project

An Adobe After Effects project and complete master guide demonstrating keyframing, timing control, motion blur, easing curves, footage stabilization, and time remapping.

---

## 📁 Project Directory Structure

```text
Motion & Timing Animation Project/
├── Final_Motion_Project.aep       # Master After Effects Project File (AE 2026)
├── Final_Motion_Project.mp4       # Exported 60-Second Full HD 1080p 30fps Video
├── README.md                      # Complete Project Documentation & Walkthrough
├── assets/
│   └── sample_footage.mp4         # 1080p 30fps Sample Video Clip (Camera Jitter & Motion)
└── scripts/
    └── build_project.jsx          # Automated ExtendScript Builder for After Effects
```

---

## 🎬 Project Specifications

| Property | Setting |
| :--- | :--- |
| **Project Name** | `Final_Motion_Project.aep` |
| **Composition Name** | `Final_Motion_Project` |
| **Resolution** | 1920 × 1080 (Full HD 16:9) |
| **Frame Rate** | 30.00 fps |
| **Duration** | 60.0 Seconds (1801 Frames) |
| **Motion Blur** | Enabled Globally & Per-Layer |
| **Render Template** | H.264 High Profile (MP4) |

---

## ⏱️ Timeline Architecture & Sequence Breakdown

The 60-second video is structured into four distinct, cinematic phases:

```
00:00        00:16           00:36                  00:48        01:00
  |------------|---------------|----------------------|------------|
    Phase 1         Phase 2             Phase 3           Phase 4
  Intro & Shape   Stabilized Clip     Harmonic Orbit      Outro Title
    Dynamics      & Time Remapping      Choreography       & Mastery
```

### Phase 1: Intro Title & Kinetic Shapes (`00:00` - `00:16`)
* **Background Stage (`01_Stage_Background`)**: Light sky blue studio backdrop with subtle radial/linear gradient ramp (`ADBE Ramp`).
* **Title Card (`05_Title_Text` & `06_Subtitle_Text`)**:
  * Title: *"The Art of Motion"* slides smoothly from `[960, 470]` to `[960, 380]` with scale spring pop (`80%` $\to$ `105%` $\to$ `100%`) and opacity fade.
  * Subtitle: *"Motion & Timing Animation Project"* follows with staggered delay.
* **Shape Entrances**:
  1. **Circle (`02_Shape_Circle`)**: Enters from left screen edge at `00:00.5`, scales from `0%` to `120%` to `100%`, rotates across 720°, and bounces toward center stage.
  2. **Square (`03_Shape_Square`)**: Enters from right screen edge at `00:01.0` with rounded corners (28px), spinning from `-180°` to `540°`.
  3. **Triangle (`04_Shape_Triangle`)**: 3-point Polystar entering from bottom at `00:01.5`, sweeping up with rotational spin and scale expansion.

### Phase 2: Footage Stabilization & Time Remapping (`00:17.5` - `00:37.5`)
* **Footage Layer (`07_Footage_Stabilized_TimeRemapped`)**:
  * Source: 12-second HD camera clip (`assets/sample_footage.mp4`).
  * **Warp Stabilizer VFX (`ADBE SubspaceStabilizer`)**: Smoothness tuned to **30.0%** for natural, stable camera motion without synthetic warping.
  * **Time Remapping (`ADBE Time Remapping`)**:
    * **Speed-Up Ramp (`17.5s` $\to$ `20.5s`)**: Advances 4.5s of footage in 3.0s (fast forward).
    * **Dramatic Slow Motion (`20.5s` $\to$ `26.5s`)**: Advances only 1.5s of footage over 6.0 seconds ($\approx 25\%$ playback speed).
    * **Reverse Playback (`26.5s` $\to$ `30.0s`)**: Loops backward from clip timestamp `6.0s` back to `3.5s`.
    * **Normal Resumption (`30.0s` $\to$ `36.5s`)**: Smooth ease back to standard speed through the clip's finale.
* **Feature Callout Badge (`08_Clip_Feature_Label`)**:
  * Overlay text: *"WARP STABILIZER (30%) • TIME REMAPPING"*

### Phase 3: Harmonic Kinetic Symphony (`00:38.0` - `00:48.0`)
* Circle, Square, and Triangle rejoin the canvas in synchronized orbital choreography.
* Demonstrates overlapping action, secondary motion, and dynamic easing curves with full motion blur trails.

### Phase 4: Outro & Resolution (`00:48.0` - `01:00.0`)
* **Outro Title (`09_Outro_Title`)**: *"Mastery of Timing & Motion"* centered at `[960, 410]`.
* **Outro Subtitle (`10_Outro_Subtitle`)**: *"Keyframing • Easing • Motion Blur • Warp Stabilizer • Time Remap"*.
* All geometric shapes gracefully converge to the center before fading out to the clean stage color at `00:59.8`.

---

## ⌨️ Essential After Effects Keyboard Shortcuts

| Action | Shortcut (Windows) | Description |
| :--- | :--- | :--- |
| **Shape Tool** | `Q` | Cycle between Rectangle, Rounded Rect, Ellipse, Polygon, Star |
| **Text Tool** | `Ctrl + T` | Create horizontal text layers |
| **Position Property** | `P` | Reveal layer Position |
| **Scale Property** | `S` | Reveal layer Scale |
| **Rotation Property** | `R` | Reveal layer Rotation |
| **Opacity Property** | `T` | Reveal layer Opacity (Transparency) |
| **All Keyframed Properties** | `U` | Reveal only properties with active keyframes |
| **Easy Ease** | `F9` | Apply ease-in and ease-out curves to selected keyframes |
| **Graph Editor** | `Shift + F3` | Toggle speed and value curve graph editor |
| **Time Remapping** | `Ctrl + Alt + T` | Enable/disable Time Remapping on AV layers |
| **Add to Render Queue** | `Ctrl + M` | Send current composition to Render Queue |
| **Save Project** | `Ctrl + S` | Save After Effects project |

---

## 🎓 Key Learnings & Concepts

1. **Spatial vs. Temporal Keyframes**:
   * Spatial interpolation controls *where* objects move across the 2D plane (Bezier paths).
   * Temporal interpolation controls *when* and *how fast* they get there (speed curves).

2. **Easing & Natural Motion**:
   * Linear keyframes create mechanical, robotic movements.
   * Applying **Easy Ease** (`F9`) sets initial speed to 0 with gradual acceleration and deceleration, mimicking physical mass and inertia.

3. **Motion Blur**:
   * Enables optical shutter simulation based on layer velocity.
   * Requires both per-layer motion blur toggle ($\mathcal{M}$) and composition global motion blur active.

4. **Warp Stabilizer VFX**:
   * Analyzes pixel tracking points between successive frames to counteract camera shake.
   * Setting smoothness to **30%** maintains natural handheld cinematography while eliminating micro-jitter.

5. **Time Remapping**:
   * Decouples composition time from layer source time.
   * Slope of time remap curve:
     * Steeper slope ($>1.0$) = Fast forward / Speed ramp.
     * Shallow slope ($<1.0$) = Slow motion.
     * Negative slope ($<0$) = Reverse playback.
     * Flat horizontal line ($=0$) = Freeze frame.
