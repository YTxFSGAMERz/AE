import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { theme, APPLE_EASE } from "../theme";
import { SFProFaces } from "../anim";
import { SfxAt } from "../Sfx";

export type FocusItem = { title: string; sub?: string; n?: string };
export type FocusListProps = {
  kicker?: string;
  items: FocusItem[];
  step?: number;
  holdLast?: number;
  finalInk?: boolean;
  accent?: string;
  sound?: boolean; // subtle SFX: whoosh per item, chime on final settle
};

const START = 14;
const SETTLE = 26;
const TAIL = 102;
export const focusListDuration = (p: FocusListProps) => {
  const step = p.step ?? 150;
  const holdLast = p.holdLast ?? 120;
  return Math.round(START + (p.items.length - 1) * step + holdLast + SETTLE + TAIL);
};

const LEFT = 240, TOP = 322, ROW = 130, HERO_DY = 46;
const INK = [3, 7, 18], INK_SOFT = [110, 110, 115], NUM_DOCK = [199, 199, 204];
const hexToRgb = (h: string) => { const s = h.replace("#", ""); return [0, 2, 4].map((i) => parseInt(s.slice(i, i + 2), 16)); };
const lerp = (a: number[], b: number[], t: number) => a.map((v, i) => Math.round(interpolate(t, [0, 1], [v, b[i]], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })));
const rgb = (a: number[]) => `rgb(${a.join(",")})`;

export const FocusList: React.FC<FocusListProps> = ({ kicker, items, step = 150, holdLast = 120, finalInk = false, accent = theme.accent, sound = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const ACCENT = hexToRgb(accent);
  const n = items.length;
  const beats = items.map((_, i) => START + i * step);
  const finalBeat = beats[n - 1] + holdLast;
  const dockAt = beats.map((_, i) => (i < n - 1 ? beats[i + 1] : finalBeat));
  const finalizeProg = finalInk ? interpolate(frame, [finalBeat + SETTLE + 4, finalBeat + SETTLE + 34], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;
  const duration = focusListDuration({ items, step, holdLast });
  const endFade = interpolate(frame, [duration - 16, duration], [1, 0], { extrapolateLeft: "clamp" });
  const kO = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const kY = interpolate(frame, [0, 20], [14, 0], { extrapolateRight: "clamp", easing: Easing.bezier(...APPLE_EASE) });

  return (
    <AbsoluteFill style={{ background: theme.paper, fontFamily: theme.fontDisplay, opacity: endFade }}>
      <SFProFaces />
      {sound ? (
        <>
          {beats.map((b, i) => <SfxAt key={"sfx" + i} frame={b} name="whoosh" volume={0.26} />)}
          <SfxAt frame={finalBeat + SETTLE} name="chime" volume={0.5} />
        </>
      ) : null}
      {kicker ? (
        <div style={{ position: "absolute", left: LEFT, top: 150, opacity: kO, transform: `translateY(${kY}px)`, fontFamily: theme.fontText, fontWeight: 600, fontSize: 24, letterSpacing: 6, textTransform: "uppercase", color: accent }}>{kicker}</div>
      ) : null}
      {items.map((it, i) => {
        const num = it.n ?? String(i + 1).padStart(2, "0");
        const appear = interpolate(frame, [beats[i], beats[i] + 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const ent = spring({ frame: frame - beats[i], fps, config: { damping: 200, mass: 0.8, stiffness: 110 } });
        const entY = interpolate(ent, [0, 1], [42, 0]);
        const dock = interpolate(frame, [dockAt[i], dockAt[i] + 26], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(...APPLE_EASE) });
        const dockY = TOP + i * ROW;
        const y = interpolate(dock, [0, 1], [dockY + HERO_DY, dockY]);
        const titleSize = interpolate(dock, [0, 1], [74, 40]);
        const numSize = interpolate(dock, [0, 1], [34, 24]);
        const softTarget = finalInk ? lerp(INK_SOFT, INK, finalizeProg) : INK_SOFT;
        const titleColor = rgb(lerp(INK, softTarget, dock));
        const numColor = rgb(lerp(ACCENT, NUM_DOCK, dock));
        const subOpacity = it.sub ? interpolate(dock, [0, 0.35], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) * appear : 0;
        return (
          <div key={i} style={{ position: "absolute", left: LEFT, top: y, transform: `translateY(calc(-50% + ${entY}px))`, opacity: appear, display: "flex", alignItems: "center", gap: 30 }}>
            <span style={{ fontFamily: theme.fontText, fontWeight: 700, fontSize: numSize, color: numColor, fontVariantNumeric: "tabular-nums", width: 68, flex: "0 0 auto" }}>{num}</span>
            <div style={{ position: "relative" }}>
              <div style={{ fontWeight: 600, fontSize: titleSize, letterSpacing: -1.5, color: titleColor, lineHeight: 1.05, whiteSpace: "nowrap" }}>{it.title}</div>
              {it.sub ? <div style={{ position: "absolute", top: "104%", left: 0, whiteSpace: "nowrap", opacity: subOpacity, fontFamily: theme.fontText, fontWeight: 400, fontSize: 28, color: theme.inkSoft, marginTop: 8 }}>{it.sub}</div> : null}
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
