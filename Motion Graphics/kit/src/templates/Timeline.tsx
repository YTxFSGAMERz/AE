import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, spring, Easing } from "remotion";
import { theme, APPLE_EASE, accentTint } from "../theme";
import { SFProFaces } from "../anim";

export type TimelineItem = { label: string; sub?: string; tag?: string };
export type TimelineProps = { kicker?: string; title?: string; items: TimelineItem[] };

const START = 22, STEP = 46;
export const timelineDuration = (p: TimelineProps) => START + (p.items.length - 1) * STEP + 110;

export const Timeline: React.FC<TimelineProps> = ({ kicker, title, items }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const n = items.length;
  const MARGIN = 300;
  const fullW = 1920 - MARGIN * 2;
  const xs = items.map((_, i) => (n === 1 ? 1920 / 2 : MARGIN + (i * fullW) / (n - 1)));
  const lineY = 560;

  const beats = items.map((_, i) => START + i * STEP);
  const kO = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: "clamp" });
  const kY = interpolate(frame, [0, 18], [14, 0], { extrapolateRight: "clamp", easing: Easing.bezier(...APPLE_EASE) });
  const progressW = interpolate(frame, [START, beats[n - 1] + 16], [0, fullW], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(...APPLE_EASE) });
  const endFade = interpolate(frame, [durationInFrames - 16, durationInFrames], [1, 0], { extrapolateLeft: "clamp" });

  return (
    <AbsoluteFill style={{ background: theme.paper, fontFamily: theme.fontDisplay, opacity: endFade }}>
      <SFProFaces />
      <div style={{ position: "absolute", top: 150, width: "100%", textAlign: "center", opacity: kO, transform: `translateY(${kY}px)` }}>
        {kicker ? <div style={{ fontFamily: theme.fontText, fontWeight: 600, fontSize: 24, letterSpacing: 6, textTransform: "uppercase", color: theme.accent }}>{kicker}</div> : null}
        {title ? <div style={{ fontWeight: 600, fontSize: 58, letterSpacing: -1.5, color: theme.ink, marginTop: 12 }}>{title}</div> : null}
      </div>

      {/* track + progress */}
      <div style={{ position: "absolute", left: MARGIN, top: lineY - 2, width: fullW, height: 4, background: theme.hairline, borderRadius: 4 }} />
      <div style={{ position: "absolute", left: MARGIN, top: lineY - 3, width: progressW, height: 6, background: theme.accent, borderRadius: 6, transformOrigin: "left center" }} />

      {items.map((it, i) => {
        const b = beats[i];
        const s = spring({ frame: frame - b, fps, config: { damping: 14, mass: 0.5, stiffness: 150 } });
        const active = frame >= b;
        const op = interpolate(frame, [b, b + 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const dot = interpolate(s, [0, 1], [0, 1]);
        return (
          <div key={i} style={{ position: "absolute", left: xs[i], top: lineY, transform: "translate(-50%,-50%)" }}>
            <div style={{ width: 30, height: 30, borderRadius: 999, background: active ? theme.accent : "#d5d7db", transform: `translate(-0%,0) scale(${0.4 + dot * 0.6})`, border: "5px solid #FBFBFD", boxShadow: active ? "0 6px 18px ${accentTint(0.4)}" : "none" }} />
            <div style={{ position: "absolute", top: 44, left: "50%", transform: "translateX(-50%)", width: 340, textAlign: "center", opacity: op }}>
              {it.tag ? <div style={{ fontFamily: theme.fontText, fontWeight: 600, fontSize: 22, letterSpacing: 2, textTransform: "uppercase", color: theme.accentDeep, marginBottom: 6 }}>{it.tag}</div> : null}
              <div style={{ fontWeight: 600, fontSize: 38, letterSpacing: -0.8, color: theme.ink, lineHeight: 1.1 }}>{it.label}</div>
              {it.sub ? <div style={{ fontFamily: theme.fontText, fontWeight: 400, fontSize: 24, color: theme.inkSoft, marginTop: 6 }}>{it.sub}</div> : null}
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
