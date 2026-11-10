import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, spring, Easing } from "remotion";
import { theme, APPLE_EASE, accentTint } from "../theme";
import { SFProFaces } from "../anim";
import { SfxAt } from "../Sfx";

export type ValueRow = { title: string; value: number };
export type ValueStackProps = {
  kicker?: string;
  items: ValueRow[];
  price: number;
  priceLabel?: string;
  currency?: string; // symbol, default ₹
  sound?: boolean; // tick per item, whoosh on strike, chime on price reveal
};

const START = 30, STEP = 32, COL = 1080, LEFT = (1920 - COL) / 2;
export const valueStackDuration = (p: ValueStackProps) => {
  const summaryBeat = START + (p.items.length - 1) * STEP + 40;
  return summaryBeat + 90;
};

export const ValueStack: React.FC<ValueStackProps> = ({ kicker = "Everything you get", items, price, priceLabel = "Price today", currency = "₹", sound = false }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const total = items.reduce((a, r) => a + r.value, 0);
  const save = Math.round((1 - price / total) * 100);
  const fmt = (n: number) => currency + Math.round(n).toLocaleString("en-IN");

  const beats = items.map((_, i) => START + i * STEP);
  const summaryBeat = beats[beats.length - 1] + 40;
  const kO = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: "clamp" });
  const kY = interpolate(frame, [0, 18], [14, 0], { extrapolateRight: "clamp", easing: Easing.bezier(...APPLE_EASE) });
  const endFade = interpolate(frame, [durationInFrames - 16, durationInFrames], [1, 0], { extrapolateLeft: "clamp" });

  const reveal = beats.map((b) => interpolate(frame, [b, b + 16], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }));
  const liveTotal = items.reduce((a, r, i) => a + r.value * reveal[i], 0);
  const totalO = interpolate(frame, [START, START + 16], [0, 1], { extrapolateRight: "clamp" });

  const strike = interpolate(frame, [summaryBeat, summaryBeat + 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(...APPLE_EASE) });
  const totalDim = interpolate(frame, [summaryBeat, summaryBeat + 18], [1, 0.4], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const priceSpring = spring({ frame: frame - (summaryBeat + 12), fps, config: { damping: 200, mass: 1, stiffness: 95 } });
  const priceO = interpolate(frame, [summaryBeat + 12, summaryBeat + 30], [0, 1], { extrapolateRight: "clamp" });
  const priceY = interpolate(priceSpring, [0, 1], [40, 0]);
  const priceScale = interpolate(priceSpring, [0, 1], [0.92, 1]);
  const pillO = interpolate(frame, [summaryBeat + 28, summaryBeat + 44], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: theme.paper, fontFamily: theme.fontDisplay, opacity: endFade }}>
      <SFProFaces />
      {sound ? (
        <>
          {beats.map((b, i) => <SfxAt key={"vs" + i} frame={b} name="tick" volume={0.22} />)}
          <SfxAt frame={summaryBeat} name="whoosh" volume={0.3} />
          <SfxAt frame={summaryBeat + 12} name="chime" volume={0.5} />
        </>
      ) : null}
      <div style={{ position: "absolute", top: 118, width: "100%", textAlign: "center", opacity: kO, transform: `translateY(${kY}px)`, fontFamily: theme.fontText, fontWeight: 600, fontSize: 24, letterSpacing: 6, textTransform: "uppercase", color: theme.accent }}>{kicker}</div>

      {items.map((r, i) => {
        const b = beats[i];
        const s = spring({ frame: frame - b, fps, config: { damping: 200, mass: 0.7, stiffness: 120 } });
        const x = interpolate(s, [0, 1], [-28, 0]);
        const y = 224 + i * 82;
        return (
          <div key={i} style={{ position: "absolute", left: LEFT, top: y, width: COL, opacity: reveal[i], transform: `translateX(${x}px)`, display: "flex", alignItems: "center", justifyContent: "space-between", paddingBottom: 20, borderBottom: `1px solid ${theme.hairline}` }}>
            <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
              <div style={{ width: 34, height: 34, borderRadius: 999, background: accentTint(0.14), display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M5 12.5l4 4 10-10" stroke={theme.accentDeep} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </div>
              <span style={{ fontWeight: 500, fontSize: 40, color: theme.ink, letterSpacing: -0.6 }}>{r.title}</span>
            </div>
            <span style={{ fontFamily: theme.fontText, fontWeight: 500, fontSize: 34, color: theme.inkSoft, fontVariantNumeric: "tabular-nums" }}>{fmt(r.value)} value</span>
          </div>
        );
      })}

      <div style={{ position: "absolute", left: LEFT, top: 690, width: COL, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ opacity: totalO * totalDim, display: "flex", alignItems: "baseline", gap: 18 }}>
          <span style={{ fontFamily: theme.fontText, fontWeight: 500, fontSize: 36, color: theme.inkSoft }}>Total value</span>
          <span style={{ position: "relative", fontWeight: 700, fontSize: 60, color: theme.ink, letterSpacing: -1.5, fontVariantNumeric: "tabular-nums" }}>
            {fmt(liveTotal)}
            <span style={{ position: "absolute", left: -6, right: -6, top: "52%", height: 5, borderRadius: 5, background: theme.danger, transform: `scaleX(${strike})`, transformOrigin: "left center" }} />
          </span>
        </div>
        <div style={{ opacity: priceO, transform: `translateY(${priceY}px) scale(${priceScale})`, marginTop: 26, display: "flex", flexDirection: "column", alignItems: "center" }}>
          <span style={{ fontFamily: theme.fontText, fontWeight: 600, fontSize: 26, letterSpacing: 2, textTransform: "uppercase", color: theme.inkSoft }}>{priceLabel}</span>
          <div style={{ display: "flex", alignItems: "center", gap: 26, marginTop: 8 }}>
            <span style={{ fontWeight: 700, fontSize: 132, color: theme.ink, letterSpacing: -3, lineHeight: 1 }}>{fmt(price)}</span>
            <span style={{ opacity: pillO, background: theme.accent, color: "#fff", fontFamily: theme.fontText, fontWeight: 700, fontSize: 30, padding: "12px 24px", borderRadius: 999, whiteSpace: "nowrap" }}>Save {save}%</span>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
