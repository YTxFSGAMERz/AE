import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, spring, Easing } from "remotion";
import { theme, APPLE_EASE, accentTint } from "../theme";
import { SFProFaces } from "../anim";
import { SfxAt, Land } from "../Sfx";
import { LogoMark } from "../LogoMark";
import { Lucide } from "../Lucide";

/**
 * CUSTOM (hybrid) — "the slide" the presenter refers to twice. Rows = what the
 * app needs (Lucide icon + label). mode "cost": typical paid price counts up per
 * row → monthly total. mode "free": the real free tool's mark draws in per row
 * → ₹0 total. Same layout both times so the return reads as the same slide.
 */
export type StackRow = { need: string; sub?: string; icon?: string; cost?: number; tools?: string[]; toolLabel?: string; note?: string };
export type StackTableProps = { kicker?: string; title?: string; mode: "cost" | "free" | "both"; morphHold?: number; step2?: number; freeTitle?: string; freeKicker?: string; rows: StackRow[]; step?: number; totalLabel?: string; totalSub?: string; zero?: string; currency?: string; sound?: boolean; hold?: number };

const START = 30, ROW_H = 118, COL = 1480, LEFT = (1920 - COL) / 2;
const fillStart = (p: StackTableProps) => {
  const step = p.step ?? (p.mode === "cost" ? 90 : 60);
  return p.mode === "cost" ? START + (p.rows.length - 1) * step + step : START + 30;
};
const fillStep = (p: StackTableProps) => (p.mode === "cost" ? 18 : (p.step ?? 60));
const totalBeat = (p: StackTableProps) => fillStart(p) + (p.rows.length - 1) * fillStep(p) + 40;
const morphAt = (p: StackTableProps) => totalBeat({ ...p, mode: "cost" }) + (p.morphHold ?? 90);
const freeStart = (p: StackTableProps) => morphAt(p) + 30;
const freeTotal = (p: StackTableProps) => freeStart(p) + (p.rows.length - 1) * (p.step2 ?? 50) + 40;
export const stackTableDuration = (p: StackTableProps) => (p.mode === "both" ? freeTotal(p) : totalBeat(p)) + (p.hold ?? 150);

export const StackTable: React.FC<StackTableProps> = (p) => {
  const { kicker: kicker0, title: title0, mode: mode0, rows, totalLabel = "Per month", totalSub: totalSub0, zero = "₹0", currency = "₹", sound = true } = p;
  const frame = useCurrentFrame();
  const both = mode0 === "both";
  const mAt = both ? morphAt(p) : Infinity;
  const morph = both ? interpolate(frame, [mAt, mAt + 24], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(...APPLE_EASE) }) : 0;
  const mode: "cost" | "free" = both && frame >= mAt + 12 ? "free" : both ? "cost" : mode0;
  const kicker = both && frame >= mAt + 12 ? (p.freeKicker ?? "Same slide, free tools") : kicker0;
  const title = both && frame >= mAt + 12 ? (p.freeTitle ?? "The completely free setup") : title0;
  const totalSub = both && frame >= mAt + 12 ? "every tool on its free tier" : totalSub0;
  const swapO = both ? 1 - Math.sin(morph * Math.PI) : 1; // header dips at the crossfade midpoint
  const { fps, durationInFrames } = useVideoConfig();
  const rowStep = p.step ?? (mode === "cost" ? 90 : 60);
  const pm = { ...p, mode } as StackTableProps;
  const rowBeat = (i: number) => (both ? START + i * (p.step ?? 90) : mode === "cost" ? START + i * rowStep : START + i * 8);
  const fillBeat = (i: number) => (both && mode === "free" ? freeStart(p) + i * (p.step2 ?? 50) : fillStart(pm) + i * fillStep(pm));
  const tBeat = both && mode === "free" ? freeTotal(p) : totalBeat(pm);
  const fillStartNow = both && mode === "free" ? freeStart(p) : fillStart(pm);
  const endFade = interpolate(frame, [durationInFrames - 16, durationInFrames], [1, 0], { extrapolateLeft: "clamp" });
  const kO = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: "clamp" });
  const kY = interpolate(frame, [0, 18], [14, 0], { extrapolateRight: "clamp", easing: Easing.bezier(...APPLE_EASE) });
  const listH = rows.length * ROW_H;
  const top = 250;
  const fmt = (n: number) => currency + Math.round(n).toLocaleString("en-IN");
  const total = rows.reduce((a, r) => a + (r.cost ?? 0), 0);
  const tS = spring({ frame: frame - tBeat, fps, config: { damping: 200, mass: 0.9, stiffness: 110 } });
  const tO = interpolate(frame, [tBeat, tBeat + 14], [0, 1], { extrapolateRight: "clamp" });
  const tCount = interpolate(frame, [tBeat, tBeat + 40], [0, total], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(...APPLE_EASE) });
  const subO = interpolate(frame, [tBeat + 30, tBeat + 46], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: theme.paper, fontFamily: theme.fontDisplay, opacity: endFade }}>
      <SFProFaces />
      {sound ? (<>
        {rows.map((_, i) => <Land key={"r" + i} frame={rowBeat(i)} weight={0.4 + 0.1 * (i / rows.length)} />)}
        {both ? <SfxAt frame={mAt} name="whooshLong" volume={0.3} /> : null}
        {both ? rows.map((_, i) => <SfxAt key={"fp" + i} frame={freeStart(p) + i * (p.step2 ?? 50)} name="pop" volume={0.32} />) : null}
        {both ? <SfxAt frame={freeTotal(p) + 6} name="win" volume={0.5} /> : null}
        {mode === "cost"
          ? rows.map((_, i) => <SfxAt key={"c" + i} frame={fillBeat(i)} name="count" volume={0.28} maxFrames={26} />)
          : rows.map((_, i) => <SfxAt key={"n" + i} frame={fillBeat(i)} name="pop" volume={0.32} />)}
        {mode === "cost" ? <SfxAt frame={tBeat} name="riser" volume={0.3} /> : null}
        {mode === "cost" ? <SfxAt frame={tBeat} name="count" volume={0.3} maxFrames={40} /> : null}
        <SfxAt frame={tBeat + (mode === "cost" ? 40 : 6)} name={mode === "cost" ? "register" : "win"} volume={0.5} />
      </>) : null}

      <div style={{ position: "absolute", top: 104, width: "100%", textAlign: "center", opacity: kO * swapO, transform: `translateY(${kY}px)` }}>
        {kicker ? <div style={{ fontFamily: theme.fontText, fontWeight: 600, fontSize: 24, letterSpacing: 6, textTransform: "uppercase", color: theme.accent }}>{kicker}</div> : null}
        {title ? <div style={{ fontWeight: 600, fontSize: 54, letterSpacing: -1.5, color: theme.ink, marginTop: 10 }}>{title}</div> : null}
      </div>

      {rows.map((r, i) => {
        const b = rowBeat(i), fb = fillBeat(i);
        const s = spring({ frame: frame - b, fps, config: { damping: 200, mass: 0.8, stiffness: 120 } });
        const o = interpolate(frame, [b, b + 14], [0, 1], { extrapolateRight: "clamp" });
        const fS = spring({ frame: frame - fb, fps, config: { damping: 200, mass: 0.8, stiffness: 130 } });
        const fO = interpolate(frame, [fb, fb + 12], [0, 1], { extrapolateRight: "clamp" });
        const count = interpolate(frame, [fb, fb + 26], [0, r.cost ?? 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(...APPLE_EASE) });
        const focus = mode === "cost" && frame < fillStartNow ? interpolate(frame, [b, b + 14], [0.35, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 1;
        return (
          <div key={i} style={{ position: "absolute", left: LEFT, top: top + i * ROW_H, width: COL, height: ROW_H, opacity: o, transform: `translateY(${interpolate(s, [0, 1], [22, 0])}px)`, display: "flex", alignItems: "center", borderBottom: `1px solid ${theme.hairline}` }}>
            <div style={{ width: 66, height: 66, borderRadius: 20, background: accentTint(0.12), display: "flex", alignItems: "center", justifyContent: "center", marginRight: 28, opacity: focus }}>
              <Lucide name={r.icon ?? "sparkles"} size={36} color={theme.accentDeep} strokeWidth={2.2} t={frame - b} />
            </div>
            <div style={{ width: 520, opacity: focus }}>
              <div style={{ fontWeight: 600, fontSize: 38, letterSpacing: -1, color: theme.ink }}>{r.need}</div>
              {r.sub ? <div style={{ fontFamily: theme.fontText, fontSize: 23, color: theme.inkSoft, marginTop: 3 }}>{r.sub}</div> : null}
            </div>
            <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 22, opacity: fO, transform: `translateY(${interpolate(fS, [0, 1], [14, 0])}px)` }}>
              {mode === "free" && r.tools ? (<>
                {r.tools.map((slug, k) => (
                  <div key={slug} style={{ width: 78, height: 78, borderRadius: 22, background: "#FFFFFF", border: `1px solid ${theme.hairline}`, boxShadow: "0 10px 26px rgba(3,7,18,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <LogoMark slug={slug} size={48} t={frame - (fb + k * 8)} />
                  </div>
                ))}
                <div>
                  {r.toolLabel ? <div style={{ fontWeight: 600, fontSize: 32, letterSpacing: -0.8, color: theme.ink }}>{r.toolLabel}</div> : null}
                  {r.note ? <div style={{ fontFamily: theme.fontText, fontSize: 21, color: theme.inkSoft, marginTop: 2 }}>{r.note}</div> : null}
                </div>
              </>) : null}
            </div>
            <div style={{ width: 280, textAlign: "right", opacity: fO, transform: `translateY(${interpolate(fS, [0, 1], [14, 0])}px)`, fontWeight: 700, fontSize: 44, letterSpacing: -1.5, fontVariantNumeric: "tabular-nums", color: mode === "cost" ? theme.ink : theme.accent, whiteSpace: "nowrap" }}>
              {mode === "cost" ? fmt(count) : zero}
              {mode === "cost" ? <span style={{ fontFamily: theme.fontText, fontWeight: 500, fontSize: 22, color: theme.inkSoft, marginLeft: 6 }}>/mo</span> : null}
            </div>
          </div>
        );
      })}

      <div style={{ position: "absolute", left: LEFT, top: top + listH + 22, width: COL, height: 110, opacity: tO * (both && mode === "cost" ? 1 - morph : 1), transform: `translateY(${interpolate(tS, [0, 1], [22, 0])}px)`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontWeight: 600, fontSize: 44, letterSpacing: -1.2, color: theme.ink }}>{totalLabel}</div>
          {totalSub ? <div style={{ fontFamily: theme.fontText, fontSize: 24, color: theme.inkSoft, marginTop: 4, opacity: subO }}>{totalSub}</div> : null}
        </div>
        <div style={{ fontWeight: 700, fontSize: 96, letterSpacing: -4, color: mode === "cost" ? theme.danger : theme.accent, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>{mode === "cost" ? fmt(tCount) : zero}</div>
      </div>
    </AbsoluteFill>
  );
};
