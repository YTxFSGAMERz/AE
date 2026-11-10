---
name: remotion-motion-kit
description: Master guide and workflows for programmatic motion graphics with React, TypeScript, and Remotion. Covers the template catalog (StatCard, ValueStack, ScreenFrame, PayFlow, ToolCard, kinetic type), reusable primitives (Brand, Card, Stage, LogoMark, Lucide), sound design orchestration (sfxpack), automated asset scouting (Playwright, SVGL, YuNet face detection), and batch ProRes 4444 rendering. Use when creating programmatic motion graphics, batch rendering video assets, or designing Remotion templates.
---

# Remotion Motion Graphics Kit

This skill provides the complete production pipeline for programmatic video creation and automated motion graphics synthesis using React, TypeScript, and Remotion.

---

## 1. Declarative Time & Animation Foundations

Unlike keyframe-based timelines, Remotion renders video as pure functions of frame numbers:

```tsx
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";

export const KineticElement: React.FC<{ title: string }> = ({ title }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Snappy Apple-style spring (damping: 200, mass: 0.5)
  const scale = spring({
    frame,
    fps,
    config: { damping: 200, mass: 0.5, stiffness: 200 },
  });

  // Smooth opacity fade over first 12 frames
  const opacity = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: "clamp" });

  return (
    <div style={{ transform: `scale(${scale})`, opacity }}>
      <h1>{title}</h1>
    </div>
  );
};
```

---

## 2. Core Primitives (`kit/src/`)

- **`Stage` (`Stage.tsx`)**: Wraps all full-frame compositions. Provides cinematic camera push-in ($+2.5\%$ scale drift across duration) and manages entrance/exit transitions (`fade`, `rise`, `scale`, `wipe`).
- **`Card` & `Overlay`**: Unified background styling, border radius, subtle shadows, and positioning for overlays vs full-screen takeovers.
- **`BrowserFrame` & `DeviceFrame`**: Renders responsive simulated Safari/Chrome browser windows, MacBooks, and mobile frames with optional 3D camera tilts.
- **`LogoMark` (`LogoMark.tsx`)**: Renders official vector brand marks with pop animations or animated stroke trace.
- **`Lucide` (`Lucide.tsx`)**: Procedural vector line drawing for concept icons.

---

## 3. Template Catalog & Usage Matrix

### A. Data & Metrics
- **`StatCard`**: Single hero metric with label, kicker, and count-up animation.
- **`MultiStat`**: 2–4 parallel statistics comparing benchmarks.
- **`ProgressRing`**: Radial gauge with animated percentage fill.
- **`LineChart` / `BarChart`**: Animated coordinate charts with progressive line drawing.

### B. Lists & Workflows
- **`FocusList`**: Staggered list where active item highlights and previous items dim.
- **`StepFlow`**: Sequential process cards with connecting directional arrows.
- **`BentoGrid`**: Modern multi-tile grid displaying complementary features.
- **`Checklist`**: Verified criteria with animated checkmark stamps.

### C. Commercial, Tech & Product Proof
- **`ScreenFrame`**: Real website proof with coordinates-targeted highlight ring (`probe` coordinates).
- **`ToolCard`**: Product reveal: official logo, tagline, feature tags, and screenshot.
- **`LogoBill`**: Price calculation table: rows of services struck through to ₹0 / $0.
- **`PayFlow`**: Money flow mechanism diagram: nodes, animated pulses, and balance meter.
- **`ValueStack`**: Offer stack with total value tally and final discounted price.

### D. Overlays (Alpha-channel face companion)
- **`CaptionPop`**, **`SideNotes`**, **`StepTracker`**, **`HighlightRing`**, **`StampBadge`**, **`LowerThird`**.

---

## 4. Automated Asset Scouting Pipeline (`scripts/`)

Before rendering, fetch real-world visual assets rather than placeholder shapes:

```bash
# 1. Fetch Official SVG Brand Logos (SVGL + Simple Icons)
node scripts/fetch-logo.mjs supabase vercel figma stripe

# 2. Capture Real Website Proof (Playwright headless Chrome)
node scripts/capture.mjs screenshot https://github.com/HeyPuter/puter public/shots/puter-github.png
node scripts/capture.mjs probe https://github.com/HeyPuter/puter  # Outputs CSS rects for highlight rings

# 3. Record Smooth 30fps Interaction Clip
node scripts/capture.mjs record https://puter.com public/shots/demo.mp4 --duration=5 --script=actions.json

# 4. Detect Presenter Face Side (for automatic overlay placement)
python scripts/face-side.py presenter-raw.mp4 --t 3
# Output: {"side":"left", "overlay":"right"} -> Set overlay position to "right"
```

---

## 5. Sound Design Engine (`sfxpack.ts`)

Every visual event must be paired with an audio role. Sound effects are trimmed, normalized to $-3\text{ dBFS}$, and peak-aligned:

| Audio Role | Trigger Event | SFX Character |
| :--- | :--- | :--- |
| `tick` | List row appears, node settles | Subtle, crisp pop |
| `pop` | Chip, pill, or badge appears | Organic bubble/wood pop |
| `whoosh` / `whooshLong` | Major card fly-in, screen transition | Air swoosh (crest-aligned) |
| `shutter` | Web page or photo settle | Camera shutter click |
| `register` | Pricing reveal, discount applied | Cash register / coin drop |
| `count` | Digital number counter incrementing | Fast rotary ticking |
| `stamp` | Approved / Verified / Strike badge | Heavy rubber stamp thud |
| `chime` / `win` | Completion, victory, final balance | Harmonic bell chime |

---

## 6. Batch Rendering & Quality Control

### Batch Render Command
```bash
# shots.txt contains lines of: "<TemplateId> <slug>"
bash scripts/render-batch.sh "<project-dir>" shots.txt
```
This produces:
- `out/<slug>.mov`: **Apple ProRes 4444** master file with straight alpha channel and embedded SFX.
- `out/preview-<slug>.mp4`: H.264 preview with AAC audio for rapid review.

### Quality Linting (`lint-frames.mjs`)
After rendering, execute frame analysis:
```bash
node scripts/lint-frames.mjs out/<slug>.mov
```
Flags:
- Dead screen space ($>40\%$ empty area).
- Elements touching frame safe zones ($<32\text{px}$ from edge).
- Unintended frozen holds ($>15$ identical consecutive frames).
