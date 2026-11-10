# Building a custom template (when the catalog doesn't fit)

The catalog is a starting point, not a boundary. If a beat needs a visual the
catalog can't express well, design one. Budget: a custom template is ~120–250
lines and should take one still-verify loop, not five.

## 1. Write the design brief first (in the shot list row)
One sentence each: **what it shows**, **how it moves**, **which real assets it
uses**, **which sounds land where**. Example (PayFlow):
> Three nodes on a line (user → Puter mark → app). A balance meter fills with
> free credits (count ticks), drains as pulses hit the app (pop each), turns red
> at 0% (nope), the user tops it up (register), then a dark card lands "You
> manage: nothing · ₹0" (win).

If you can't write the "how it moves" line, you don't have a graphic yet — go
back to the convention research (how do motion designers usually show this?
timeline / funnel / hub / meter / stack / before-after / map pin / device frame).

## 2. Anatomy of a kit template (copy this shape)
```tsx
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, spring, Easing } from "remotion";
import { theme, APPLE_EASE } from "../theme";
import { SFProFaces } from "../anim";
import { SfxAt } from "../Sfx";
import { LogoMark } from "../LogoMark";     // fetched brand mark, draw-on or pop
import { Lucide } from "../Lucide";         // fetched Lucide icon, recolourable
import { BrowserFrame } from "../BrowserFrame"; // chrome around a screenshot

export type MyProps = { kicker?: string; title?: string; /* ...content props... */ hold?: number; sound?: boolean };
const T = { start: 18, step: 30 };                       // named beats, in frames
export const myDuration = (p: MyProps) => T.start + /* beats */ 120 + (p.hold ?? 110);

export const My: React.FC<MyProps> = ({ kicker, title, hold, sound = true }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const endFade = interpolate(frame, [durationInFrames - 16, durationInFrames], [1, 0], { extrapolateLeft: "clamp" });
  const s = spring({ frame: frame - T.start, fps, config: { damping: 200, mass: 0.8, stiffness: 120 } }); // Apple: no overshoot
  return (
    <AbsoluteFill style={{ background: theme.paper, fontFamily: theme.fontDisplay, opacity: endFade }}>
      <SFProFaces />
      {sound ? <SfxAt frame={T.start} name="tick" volume={0.32} /> : null}
      {/* kicker: SF Pro Text 24 / 600 / letterSpacing 6 / uppercase / theme.accent — title: Display 54 / 600 / -1.5 */}
      {/* content lands with translateY(22→0) + opacity over ~14 frames; numbers count up; single-line text gets whiteSpace:"nowrap" */}
    </AbsoluteFill>
  );
};
```
Register in `src/Root.tsx` (`<Composition id="My" … calculateMetadata={({props}) => ({durationInFrames: myDuration(props as any)})} />`),
then `props/<slug>.json` → still → render like any template.

Overlay (shares the frame with the face): wrap in `<Overlay position=…>` from
`src/Overlay.tsx`, transparent background, `chipStyle` for chips, add `hold`.

## 3. Primitives you get for free
| Primitive | Use | Notes |
|---|---|---|
| `LogoMark slug size t` | any named brand | `t` = local frame; traces then fills; auto-pops for PNG or transformed SVGs |
| `Lucide name size color` | concept icon | fetch with `scripts/fetch-icon.mjs <name>` |
| `BrowserFrame width height url` | screenshots, screen-recs | put an `<Img src={staticFile("shots/x-1600.png")}>` inside; pan by translateY |
| `SfxAt frame name volume weight align maxFrames` | sound | `name` = a ROLE from `sfxpack.ts` (multi-file roles rotate); whoosh/riser/strike auto peak-align |
| `Land frame weight` | a landing | tick scaled by weight + soft body whoosh when weight ≥ 0.7 |
| `Lucide name size color t` | concept icon | pass `t` (local frame) and it DRAWS on |
| `DeviceFrame kind tilt` | laptop / phone product moment | children = screen content at `DEVICE_SCREEN[kind].w` |
| `Stage` (automatic) | idle push-in, enter/exit | wraps every composition in Root; props `enter`, `exit`, `idle` come from the shot JSON |
| `Card` / `Overlay` | floating card / face-side overlay | from the base kit |
| `theme`, `APPLE_EASE` | colours + the easing | paper `#FBFBFD`, ink, inkSoft, accent `#7C3AED` (violet; deep + on-dark tints via `theme.accentDeep` / `theme.accentOnDark`; chip tints via `accentTint(a)`), danger |
| `OffthreadVideo` (remotion) | fetched footage | see FootageStatement for scrim + type over video |

## 4. Motion conventions that keep it on-brand
- Everything lands with a `spring({damping:200})` (no bounce) + 12–16-frame fade.
- Stagger siblings 8–18 frames. A list is one idea per beat, not a wall.
- Numbers count up (interpolate with APPLE_EASE, `tabular-nums`).
- A path/connector **draws**, then a **pulse travels it** — that's how "one thing
  flows through a system" reads.
- A meter/bar **changes state** (fill → drain → empty → refill) rather than showing
  three static bars.
- A beat the presenter returns to is ONE clip that morphs (see StackTable
  `mode:"both"`): the old value fades as the new one lands in the same slot.
- During any hold ≥ 3 s something must still move: a pulse on a connector, a
  screenshot drifting, a cursor, a meter breathing. `Stage` gives the push-in;
  the template gives the life.
- One accent per frame. Strike-throughs are `theme.danger`, success is green
  `#16a34a` only for "money in / done".
- End with 16-frame fade so the editor can cut anywhere near the tail.

## 5. Verify like a hostile viewer
Render 3–4 stills at the beats that matter (`npx remotion still <Id> out/pv.png
--props=props/x.json --frame=N`), tile them, look: text clipped? number on a line?
logo scribbling (transformed SVG → use pop)? ring off target? label over content?
Fix, re-still, THEN render.

## 6. Promote or keep
Reusable across scripts → copy to `~/.claude/skills/motion-director/kit/src/templates/`,
register in `kit/src/Root.tsx`, add one catalog line in SKILL.md. One-off → stays
in the working project.

Worked examples in the kit: `PayFlow.tsx` (mechanism with state), `StackTable.tsx`
(same slide twice), `ToolCard.tsx` (asset-led reveal), `ScreenFrame.tsx` (receipt).
