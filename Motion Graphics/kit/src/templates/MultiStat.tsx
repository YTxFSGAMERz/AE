import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, spring, Easing } from "remotion";
import { theme, APPLE_EASE } from "../theme";
import { SFProFaces } from "../anim";

export type Stat = { value: number; suffix?: string; prefix?: string; label: string };
export type MultiStatProps = { kicker?: string; title?: string; stats: Stat[] };

export const multiStatDuration = () => 150;

export const MultiStat: React.FC<MultiStatProps> = ({ kicker, title, stats }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const kO = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: "clamp" });
  const kY = interpolate(frame, [0, 18], [14, 0], { extrapolateRight: "clamp", easing: Easing.bezier(...APPLE_EASE) });
  const endFade = interpolate(frame, [durationInFrames - 16, durationInFrames], [1, 0], { extrapolateLeft: "clamp" });

  return (
    <AbsoluteFill style={{ background: theme.paper, fontFamily: theme.fontDisplay, alignItems: "center", justifyContent: "center", opacity: endFade }}>
      <SFProFaces />
      {(kicker || title) && (
        <div style={{ position: "absolute", top: 200, width: "100%", textAlign: "center", opacity: kO, transform: `translateY(${kY}px)` }}>
          {kicker ? <div style={{ fontFamily: theme.fontText, fontWeight: 600, fontSize: 24, letterSpacing: 6, textTransform: "uppercase", color: theme.accent }}>{kicker}</div> : null}
          {title ? <div style={{ fontWeight: 600, fontSize: 58, letterSpacing: -1.5, color: theme.ink, marginTop: 12 }}>{title}</div> : null}
        </div>
      )}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "center", gap: 80 }}>
        {stats.map((s, i) => {
          const b = 20 + i * 16;
          const count = Math.round(interpolate(frame, [b, b + 40], [0, s.value], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }));
          const pop = spring({ frame: frame - b, fps, config: { damping: 16, mass: 0.6, stiffness: 130 } });
          const op = interpolate(frame, [b, b + 14], [0, 1], { extrapolateRight: "clamp" });
          return (
            <div key={i} style={{ opacity: op, transform: `scale(${interpolate(pop, [0, 1], [0.85, 1])})`, textAlign: "center", minWidth: 300 }}>
              <div style={{ fontWeight: 700, fontSize: 150, lineHeight: 1, color: theme.ink, letterSpacing: -4, fontVariantNumeric: "tabular-nums", display: "flex", alignItems: "baseline", justifyContent: "center" }}>
                {s.prefix ? <span style={{ color: theme.inkSoft, fontSize: 90 }}>{s.prefix}</span> : null}
                {count.toLocaleString("en-IN")}
                {s.suffix ? <span style={{ color: theme.accent }}>{s.suffix}</span> : null}
              </div>
              <div style={{ fontFamily: theme.fontText, fontWeight: 500, fontSize: 30, color: theme.inkSoft, marginTop: 14 }}>{s.label}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
