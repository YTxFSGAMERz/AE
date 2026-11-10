import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, spring, Easing } from "remotion";
import { theme, APPLE_EASE } from "../theme";
import { SFProFaces } from "../anim";

export type TitleStrapProps = {
  title: string;
  kicker?: string;
  hold?: number;
};

// Broadcast-style full-width strap along the bottom — for section titles while
// the person keeps talking. Transparent alpha above the strap.
export const titleStrapDuration = (p: TitleStrapProps) => 120 + (p.hold ?? 30);

export const TitleStrap: React.FC<TitleStrapProps> = ({ title, kicker, hold: _hold }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const enter = spring({ frame, fps, config: { damping: 200, mass: 0.8, stiffness: 130 } });
  const exit = interpolate(frame, [durationInFrames - 14, durationInFrames], [0, 1], { extrapolateLeft: "clamp", easing: Easing.bezier(...APPLE_EASE) });
  const y = interpolate(enter, [0, 1], [190, 0]) + exit * 190;
  const accentH = interpolate(frame, [12, 30], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(...APPLE_EASE) });
  const tO = interpolate(frame, [10, 24], [0, 1], { extrapolateRight: "clamp" });
  const tX = interpolate(frame, [10, 24], [26, 0], { extrapolateRight: "clamp", easing: Easing.bezier(...APPLE_EASE) });

  return (
    <AbsoluteFill style={{ backgroundColor: "transparent", justifyContent: "flex-end", fontFamily: theme.fontDisplay }}>
      <SFProFaces />
      <div style={{ transform: `translateY(${y}px)`, background: theme.paper, borderTop: `1px solid ${theme.hairline}`, boxShadow: "0 -20px 60px rgba(3,7,18,0.18)", display: "flex", alignItems: "center", gap: 44, padding: "38px 110px 44px" }}>
        <div style={{ width: 10, height: `${accentH}%`, minHeight: 8, borderRadius: 10, background: theme.accent, alignSelf: "stretch" }} />
        <div style={{ opacity: tO, transform: `translateX(${tX}px)` }}>
          {kicker ? (
            <div style={{ fontFamily: theme.fontText, fontWeight: 600, fontSize: 23, letterSpacing: 6, textTransform: "uppercase", color: theme.accent, marginBottom: 8 }}>{kicker}</div>
          ) : null}
          <div style={{ fontWeight: 700, fontSize: 62, letterSpacing: -1.8, color: theme.ink, lineHeight: 1.05, whiteSpace: "nowrap" }}>{title}</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
