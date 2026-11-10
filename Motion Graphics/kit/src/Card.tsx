import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { theme, APPLE_EASE } from "./theme";
import { SFProFaces } from "./anim";

// Floating Apple-white card on a transparent canvas, or full-bleed takeover.
export const Card: React.FC<{
  children: React.ReactNode;
  width?: number;
  height?: number;
  fullBleed?: boolean;
  padding?: number;
}> = ({ children, width = 1180, height = 640, fullBleed = false, padding = 0 }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const enter = spring({ frame, fps, config: { damping: 200, mass: 0.8, stiffness: 120 } });
  const opacity = interpolate(frame, [0, 12], [0, 1], { extrapolateRight: "clamp" });
  const exit = interpolate(frame, [durationInFrames - 16, durationInFrames], [1, 0], { extrapolateLeft: "clamp", easing: Easing.bezier(...APPLE_EASE) });
  const scale = fullBleed ? 1 : interpolate(enter, [0, 1], [0.94, 1]) * interpolate(exit, [0, 1], [0.98, 1]);

  return (
    <AbsoluteFill style={{ backgroundColor: "transparent", justifyContent: "center", alignItems: "center" }}>
      <SFProFaces />
      <div
        style={{
          opacity: opacity * exit,
          transform: `scale(${scale})`,
          width: fullBleed ? "100%" : width,
          height: fullBleed ? "100%" : height,
          background: theme.paper,
          borderRadius: fullBleed ? 0 : 56,
          border: fullBleed ? "none" : `1px solid ${theme.hairline}`,
          boxShadow: fullBleed ? "none" : "0 40px 120px rgba(3,7,18,0.18), 0 8px 30px rgba(3,7,18,0.10)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding,
          fontFamily: theme.fontDisplay,
        }}
      >
        {children}
      </div>
    </AbsoluteFill>
  );
};
