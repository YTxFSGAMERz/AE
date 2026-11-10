import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, spring, Easing } from "remotion";
import { theme, APPLE_EASE } from "../theme";
import { SFProFaces } from "../anim";
import { SfxAt, Land } from "../Sfx";
import { LogoMark } from "../LogoMark";

/**
 * CUSTOM (hybrid) — "the bill that comes to ₹0". Each row = a cost category,
 * its real brand marks (fetched from svgl) drawing in, and a price tag that
 * gets struck through and replaced by ₹0. Ends on a total of ₹0 + FREE stamp.
 * The reverse of ValueStack: instead of value piling up, cost collapses.
 */
export type BillRow = { label: string; sub?: string; logos: string[]; was?: string };
export type LogoBillProps = { kicker?: string; title?: string; rows: BillRow[]; zero?: string; totalLabel?: string; stamp?: string; sound?: boolean };

const START = 34, STEP = 44, ROW_H = 150, COL = 1400, LEFT = (1920 - COL) / 2;
export const logoBillDuration = (p: LogoBillProps) => START + (p.rows.length - 1) * STEP + 60 + 120;

export const LogoBill: React.FC<LogoBillProps> = ({ kicker = "What I'll pay for", title, rows, zero = "₹0", totalLabel = "Total", stamp = "100% FREE", sound = true }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const beats = rows.map((_, i) => START + i * STEP);
  const totalBeat = beats[beats.length - 1] + 60;
  const endFade = interpolate(frame, [durationInFrames - 16, durationInFrames], [1, 0], { extrapolateLeft: "clamp" });
  const kO = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: "clamp" });
  const kY = interpolate(frame, [0, 18], [14, 0], { extrapolateRight: "clamp", easing: Easing.bezier(...APPLE_EASE) });
  const listH = rows.length * ROW_H;
  const top = 540 - listH / 2 - 20;

  // total row
  const tS = spring({ frame: frame - totalBeat, fps, config: { damping: 200, mass: 0.9, stiffness: 110 } });
  const tO = interpolate(frame, [totalBeat, totalBeat + 14], [0, 1], { extrapolateRight: "clamp" });
  const stampS = spring({ frame: frame - (totalBeat + 18), fps, config: { damping: 14, mass: 0.6, stiffness: 220 } });
  const stampO = interpolate(frame, [totalBeat + 18, totalBeat + 24], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: theme.paper, fontFamily: theme.fontDisplay, opacity: endFade }}>
      <SFProFaces />
      {sound ? (
        <>
          {beats.map((b, i) => <Land key={"t" + i} frame={b} weight={0.4 + 0.15 * i} />)}
          {beats.map((b, i) => <SfxAt key={"s" + i} frame={b + 30 + 10} name="strike" volume={0.3} />)}
          {beats.map((b, i) => <SfxAt key={"p" + i} frame={b + 30 + 10} name="pop" volume={0.3} />)}
          <SfxAt frame={totalBeat} name="register" volume={0.45} />
          <SfxAt frame={totalBeat + 18} name="stamp" volume={0.5} />
          <SfxAt frame={totalBeat + 20} name="win" volume={0.35} />
        </>
      ) : null}

      <div style={{ position: "absolute", top: 110, width: "100%", textAlign: "center", opacity: kO, transform: `translateY(${kY}px)` }}>
        <div style={{ fontFamily: theme.fontText, fontWeight: 600, fontSize: 24, letterSpacing: 6, textTransform: "uppercase", color: theme.accent }}>{kicker}</div>
        {title ? <div style={{ fontWeight: 600, fontSize: 54, letterSpacing: -1.5, color: theme.ink, marginTop: 12 }}>{title}</div> : null}
      </div>

      {rows.map((r, i) => {
        const b = beats[i];
        const s = spring({ frame: frame - b, fps, config: { damping: 200, mass: 0.8, stiffness: 120 } });
        const o = interpolate(frame, [b, b + 14], [0, 1], { extrapolateRight: "clamp" });
        const strikeAt = b + 30;
        const strike = interpolate(frame, [strikeAt, strikeAt + 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(...APPLE_EASE) });
        const zS = spring({ frame: frame - (strikeAt + 8), fps, config: { damping: 200, mass: 0.8, stiffness: 140 } });
        const zO = interpolate(frame, [strikeAt + 8, strikeAt + 18], [0, 1], { extrapolateRight: "clamp" });
        const y = top + i * ROW_H;
        return (
          <div key={i} style={{ position: "absolute", left: LEFT, top: y, width: COL, height: ROW_H, opacity: o, transform: `translateY(${interpolate(s, [0, 1], [24, 0])}px)`, display: "flex", alignItems: "center", borderBottom: `1px solid ${theme.hairline}` }}>
            <div style={{ width: 430 }}>
              <div style={{ fontWeight: 600, fontSize: 40, letterSpacing: -1, color: theme.ink }}>{r.label}</div>
              {r.sub ? <div style={{ fontFamily: theme.fontText, fontSize: 24, color: theme.inkSoft, marginTop: 4 }}>{r.sub}</div> : null}
            </div>
            <div style={{ flex: 1, display: "flex", gap: 34, alignItems: "center" }}>
              {r.logos.map((slug, k) => (
                <div key={slug} style={{ width: 92, height: 92, borderRadius: 26, background: "#FFFFFF", border: `1px solid ${theme.hairline}`, boxShadow: "0 12px 30px rgba(3,7,18,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <LogoMark slug={slug} size={56} t={frame - (b + 6 + k * 7)} />
                </div>
              ))}
            </div>
            <div style={{ width: 300, display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 26 }}>
              <div style={{ position: "relative", fontFamily: theme.fontText, fontWeight: 500, fontSize: 30, color: theme.inkSoft, opacity: 1 - strike * 0.55, whiteSpace: "nowrap" }}>
                {r.was ?? "Paid"}
                <div style={{ position: "absolute", left: -4, top: "50%", height: 3, width: `calc(${strike * 100}% + 8px)`, background: theme.danger, borderRadius: 2 }} />
              </div>
              <div style={{ opacity: zO, transform: `translateY(${interpolate(zS, [0, 1], [16, 0])}px) scale(${interpolate(zS, [0, 1], [0.9, 1])})`, fontWeight: 700, fontSize: 44, letterSpacing: -1.5, color: theme.accent, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>{zero}</div>
            </div>
          </div>
        );
      })}

      {/* total */}
      <div style={{ position: "absolute", left: LEFT, top: top + listH + 26, width: COL, height: 120, opacity: tO, transform: `translateY(${interpolate(tS, [0, 1], [24, 0])}px)`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontWeight: 600, fontSize: 44, letterSpacing: -1.2, color: theme.ink }}>{totalLabel}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 40 }}>
          <div style={{ opacity: stampO, transform: `rotate(-8deg) scale(${interpolate(stampS, [0, 1], [1.6, 1])})`, border: `5px solid ${theme.danger}`, color: theme.danger, borderRadius: 16, padding: "8px 22px", fontWeight: 800, fontSize: 34, letterSpacing: 3, textTransform: "uppercase", whiteSpace: "nowrap" }}>{stamp}</div>
          <div style={{ fontWeight: 700, fontSize: 96, letterSpacing: -4, color: theme.ink, fontVariantNumeric: "tabular-nums" }}>{zero}</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
