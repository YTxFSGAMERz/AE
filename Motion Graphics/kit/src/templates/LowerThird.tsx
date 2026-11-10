import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, spring, Easing } from "remotion";
import { theme, APPLE_EASE } from "../theme";
import { SFProFaces } from "../anim";

// Transparent overlay — a name tag for talking-head footage. Slides in bottom-left,
// holds, slides out. Render as ProRes 4444 alpha and drop over your footage.
export type LowerThirdProps = { name: string; role?: string };
export const lowerThirdDuration = () => 150;

export const LowerThird: React.FC<LowerThirdProps> = ({ name, role }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const inS = spring({ frame: frame - 6, fps, config: { damping: 200, mass: 0.8, stiffness: 120 } });
  const out = interpolate(frame, [durationInFrames - 20, durationInFrames], [0, 1], { extrapolateLeft: "clamp", easing: Easing.bezier(...APPLE_EASE) });
  const x = interpolate(inS, [0, 1], [-60, 0]) - out * 60;
  const op = interpolate(frame, [6, 20], [0, 1], { extrapolateRight: "clamp" }) * (1 - out);
  const barH = interpolate(inS, [0, 1], [0, 118]);
  const nameO = interpolate(frame, [14, 28], [0, 1], { extrapolateRight: "clamp" });
  const roleO = interpolate(frame, [22, 36], [0, 1], { extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ backgroundColor: "transparent" }}>
      <SFProFaces />
      <div style={{ position: "absolute", left: 140, bottom: 150, opacity: op, transform: `translateX(${x}px)`, display: "flex", alignItems: "center", gap: 28 }}>
        <div style={{ width: 8, height: barH, background: theme.accent, borderRadius: 8 }} />
        <div style={{ background: "rgba(251,251,253,0.96)", borderRadius: 24, boxShadow: "0 24px 60px rgba(3,7,18,0.20)", padding: "26px 44px 26px 34px" }}>
          <div style={{ opacity: nameO, fontFamily: theme.fontDisplay, fontWeight: 600, fontSize: 56, letterSpacing: -1, color: theme.ink, lineHeight: 1 }}>{name}</div>
          {role ? <div style={{ opacity: roleO, fontFamily: theme.fontText, fontWeight: 500, fontSize: 30, color: theme.inkSoft, marginTop: 8 }}>{role}</div> : null}
        </div>
      </div>
    </AbsoluteFill>
  );
};
