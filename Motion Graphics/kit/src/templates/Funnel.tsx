import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, spring, Easing } from "remotion";
import { theme, APPLE_EASE } from "../theme";
import { SFProFaces } from "../anim";

export type FunnelStage = { value: number; suffix?: string; label: string };
export type FunnelProps = { kicker?: string; stages: FunnelStage[]; caption?: string };

const BAR_H = 168, GAP = 20, START = 16, STEP = 115, CAP_DELAY = 70;
export const funnelDuration = (p: FunnelProps) => START + (p.stages.length - 1) * STEP + CAP_DELAY + 110;

const BG = ["linear-gradient(90deg,#38bdf8,#0ea5e9)", "linear-gradient(90deg,#0ea5e9,#0284c7)", theme.ink, theme.ink, theme.ink];

export const Funnel: React.FC<FunnelProps> = ({ kicker, stages, caption }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const n = stages.length;
  // widths scale from 1280 down to 480 by rank
  const widths = stages.map((_, i) => interpolate(i, [0, Math.max(n - 1, 1)], [1280, 480]));

  const beats = stages.map((_, i) => START + i * STEP);
  const kO = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const kY = interpolate(frame, [0, 20], [14, 0], { extrapolateRight: "clamp", easing: Easing.bezier(...APPLE_EASE) });
  const capBeat = beats[n - 1] + CAP_DELAY;
  const capO = interpolate(frame, [capBeat, capBeat + 18], [0, 1], { extrapolateRight: "clamp" });
  const capY = interpolate(frame, [capBeat, capBeat + 18], [16, 0], { extrapolateRight: "clamp", easing: Easing.bezier(...APPLE_EASE) });
  const endFade = interpolate(frame, [durationInFrames - 16, durationInFrames], [1, 0], { extrapolateLeft: "clamp" });
  const totalH = n * BAR_H + (n - 1) * GAP;

  return (
    <AbsoluteFill style={{ background: theme.paper, fontFamily: theme.fontDisplay, opacity: endFade, alignItems: "center", justifyContent: "center" }}>
      <SFProFaces />
      {kicker ? <div style={{ position: "absolute", top: 150, opacity: kO, transform: `translateY(${kY}px)`, fontFamily: theme.fontText, fontWeight: 600, fontSize: 24, letterSpacing: 6, textTransform: "uppercase", color: theme.accent }}>{kicker}</div> : null}

      <div style={{ position: "relative", width: 1280, height: totalH, marginTop: 40 }}>
        {stages.map((s, i) => {
          const b = beats[i];
          const grow = spring({ frame: frame - b, fps, config: { damping: 200, mass: 0.9, stiffness: 110 } });
          const scaleX = interpolate(grow, [0, 1], [0, 1]);
          const op = interpolate(frame, [b, b + 12], [0, 1], { extrapolateRight: "clamp" });
          const count = Math.round(interpolate(frame, [b + 4, b + 40], [0, s.value], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }));
          const isLast = i === n - 1;
          return (
            <div key={i} style={{ position: "absolute", top: i * (BAR_H + GAP), left: "50%", transform: `translateX(-50%) scaleX(${scaleX})`, width: widths[i], height: BAR_H, background: BG[Math.min(i, BG.length - 1)], borderRadius: 30, opacity: op, display: "flex", alignItems: "center", justifyContent: "center", gap: 22, boxShadow: "0 24px 60px rgba(3,7,18,0.14)" }}>
              <div style={{ transform: `scaleX(${1 / Math.max(scaleX, 0.001)})`, display: "flex", alignItems: "baseline", gap: 20, whiteSpace: "nowrap" }}>
                <span style={{ fontWeight: 700, fontSize: 96, color: isLast ? theme.accent : "#fff", letterSpacing: -3, fontVariantNumeric: "tabular-nums", lineHeight: 1 }}>{count}{s.suffix ?? ""}</span>
                <span style={{ fontFamily: theme.fontText, fontWeight: 500, fontSize: 34, color: isLast ? theme.inkSoft : "rgba(255,255,255,0.92)" }}>{s.label}</span>
              </div>
            </div>
          );
        })}
      </div>

      {caption ? <div style={{ position: "absolute", bottom: 130, opacity: capO, transform: `translateY(${capY}px)`, fontWeight: 500, fontSize: 40, color: theme.ink, letterSpacing: -0.8 }}>{caption}</div> : null}
    </AbsoluteFill>
  );
};
