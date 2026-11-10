---
name: motion-editor-learning
description: Continuous learning and adaptive memory engine for motion graphics and video editing. Records user editing preferences, stylistic choices, pacing rules, critique feedback, and custom expression patterns to continuously master the user's specific artistic voice and project standards. Use when the user gives feedback on animations, corrects timing or design choices, asks the agent to remember an editing style, or requests an audit of learned preferences.
---

# Motion Editor Continuous Learning & Adaptive Mastery

This skill provides an autonomous learning and memory engine that enables the agent to continuously observe, record, and master the user's unique editing style, timing preferences, animation curves, and project standards.

---

## 1. The Continuous Learning Engine Architecture

As you pair program and direct motion graphics with the user, the learning engine executes a four-stage loop:

```
┌────────────────────────────────────────────────────────┐
│  1. Signal Observation                                 │
│  • Detects user feedback, corrections, and style choices│
│  • Tracks parameter overrides (ease %, fonts, cuts)     │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│  2. Distillation & Rule Extraction                     │
│  • Translates feedback into explicit design constraints │
│  • Discards one-off quirks; codifies enduring patterns │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│  3. Persistent Knowledge Base                          │
│  • Writes to `.agents/memory/motion-preferences.json`   │
│  • Updates `.agents/rules/motion-preferences.md`       │
└──────────────────────────┬─────────────────────────────┘
                           │
                           ▼
┌────────────────────────────────────────────────────────┐
│  4. Proactive Application                              │
│  • Automatically applies learned taste to next scripts, │
│    Remotion templates, easing curves, and shot lists   │
└────────────────────────────────────────────────────────┘
```

---

## 2. Preference Dimensions Tracked

The learning engine captures rules across 7 core motion disciplines:

### A. Timing, Pacing & Easing
- **Ease Intensity**: Default temporal ease influence (e.g. user prefers snappy $85\%$ over subtle $65\%$).
- **Keyframe Velocity**: Overshoot damping, bounce frequencies, settling times.
- **Scene Rhythm**: Average shot hold duration (e.g. quick $2.5\text{s}$ punchy cuts vs $6\text{s}$ cinematic holds).
- **Stagger Intervals**: Number of frames between list item entrances (e.g. 3 frames vs 6 frames).

### B. Typography & Text Hierarchy
- **Primary & Secondary Typefaces**: Preferred font families (e.g. SF Pro Display, Helvetica Neue, Inter).
- **Tracking & Kerning**: Standard tracking values for all-caps kickers vs body text.
- **Text Case Rules**: Title Case vs UPPERCASE for headlines and badges.

### C. Color Palettes & Contrast
- **Base Canvas Tone**: Pure dark `#0A0A0C` vs warm dark `#121214` vs Apple off-white `#FBFBFD`.
- **Accent Tones**: Primary brand hex values, highlight gradients, strike-through colors.
- **Contrast Ratios**: Minimum WCAG text readability standards.

### D. Sound Design & Audio Pacing
- **SFX Density**: Minimalist (only major transitions) vs High-Energy (sound on every list item and number increment).
- **Master Peak Ceiling**: Peak audio headroom threshold (e.g. $-6\text{ dBFS}$ for voiceover clearance).
- **Sound Palette Character**: Crisp digital clicks vs deep cinematic impacts and risers.

### E. Layer & Project Architecture
- **Composition Conventions**: Naming schemes (e.g. `01_Intro_Title`, `02_Feature_Grid`).
- **Color Label Coding**: Blue for graphics, Yellow for text, Magenta for nulls, Peach for solids.
- **Folder Organization**: Placement of footage, pre-comps, audio, and solids in Project panel.

### F. Expression & Rigging Preferences
- **Expression Engines**: Modern JavaScript (`javascript-1.0`) vs Legacy ExtendScript.
- **Controller Setup**: Slider controls on dedicated null layers vs effect parade on self.
- **Bounce Formulas**: Mathematical damping equations favored for spring physics.

### G. Render & Export Specifications
- **Master Codec**: Apple ProRes 4444 (straight alpha) vs Animation vs Avid DNxHR.
- **Preview Encoding**: MP4 H.264 CRF rate and bitrates for client review.

---

## 3. Persistent Memory Schema

Learned data is stored in `.agents/memory/motion-preferences.json`:

```json
{
  "version": "1.0.0",
  "lastUpdated": "2026-11-11T00:50:00Z",
  "timing": {
    "defaultEaseInfluence": 80.0,
    "defaultEaseSpeed": 0.0,
    "springDamping": 200,
    "springStiffness": 220,
    "standardStaggerFrames": 4,
    "minHoldSeconds": 3.0
  },
  "typography": {
    "headlineFont": "SF Pro Display",
    "bodyFont": "SF Pro Text",
    "kickerTracking": 80,
    "headlineTracking": -10,
    "uppercaseKickers": true
  },
  "color": {
    "canvasDefault": "#FBFBFD",
    "primaryAccent": "#7C3AED",
    "deepAccent": "#6D28D9",
    "darkCanvas": "#09090B"
  },
  "audio": {
    "sfxDensity": "balanced",
    "peakCeilingDb": -6.0,
    "favoriteWhoosh": "whooshLong"
  },
  "render": {
    "masterCodec": "ProRes 4444",
    "alphaMode": "straight",
    "defaultFps": 30.0,
    "defaultResolution": [1920, 1080]
  },
  "learnedFeedbackLog": [
    {
      "timestamp": "2026-11-11T00:50:00Z",
      "context": "Lower third title card",
      "userCorrection": "Make the easing punchier and stop using neon green",
      "ruleExtracted": "Increased default ease influence to 80%; restricted palette to violet accents"
    }
  ]
}
```

---

## 4. Active Reflection Protocol (How the Agent Learns)

Whenever the user provides critique or requests an adjustment:
1. **Acknowledge the Feedback**:
   Pinpoint the exact creative parameter being modified (e.g. *"Noted: adjusting the entrance stagger from 6 frames to 3 frames for a snappier rhythm."*).
2. **Execute the Immediate Revision**:
   Update the script, Remotion template, or composition right away.
3. **Commit the Learning**:
   Append the lesson to `learnedFeedbackLog` and update the relevant property in `.agents/memory/motion-preferences.json`.
4. **Apply Forward**:
   In all subsequent tasks, reference the updated preference automatically without requiring the user to repeat the instruction.

---

## 5. Workflows & Triggers

- **"Review learned preferences"**:
  Reads `.agents/memory/motion-preferences.json` and presents a concise breakdown of the user's established design profile.
- **"Learn this project's style"**:
  Analyzes the active composition's keyframe curves, font choices, and colors, saving them as the new project baseline.
- **"Reset editing memory"**:
  Resets preferences back to studio defaults after user confirmation.
