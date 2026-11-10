import React from "react";
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { APPLE_EASE } from "./theme";
import { SFProFaces } from "./anim";

// Anchored overlay on a fully transparent canvas — for graphics that share the
// frame with a talking head. Springs in from the nearest edge, fades+slides out.
export type OverlayPos =
  | "left" | "right" | "top" | "bottom" | "center"
  | "top-left" | "top-right" | "bottom-left" | "bottom-right";

const ANCHOR: Record<OverlayPos, { justify: string; align: string; dx: number; dy: number }> = {
  left:           { justify: "flex-start", align: "center",     dx: -60, dy: 0 },
  right:          { justify: "flex-end",   align: "center",     dx: 60,  dy: 0 },
  top:            { justify: "center",     align: "flex-start", dx: 0,   dy: -60 },
  bottom:         { justify: "center",     align: "flex-end",   dx: 0,   dy: 60 },
  center:         { justify: "center",     align: "center",     dx: 0,   dy: 40 },
  "top-left":     { justify: "flex-start", align: "flex-start", dx: -60, dy: 0 },
  "top-right":    { justify: "flex-end",   align: "flex-start", dx: 60,  dy: 0 },
  "bottom-left":  { justify: "flex-start", align: "flex-end",   dx: -60, dy: 0 },
  "bottom-right": { justify: "flex-end",   align: "flex-end",   dx: 60,  dy: 0 },
};

export const Overlay: React.FC<{
  children: React.ReactNode;
  position?: OverlayPos;
  inset?: number; // safe margin from the frame edges
}> = ({ children, position = "right", inset = 100 }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const a = ANCHOR[position];

  const enter = spring({ frame, fps, config: { damping: 200, mass: 0.7, stiffness: 130 } });
  const opacity = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: "clamp" });
  const exit = interpolate(frame, [durationInFrames - 14, durationInFrames], [1, 0], { extrapolateLeft: "clamp", easing: Easing.bezier(...APPLE_EASE) });
  const x = interpolate(enter, [0, 1], [a.dx, 0]) + (1 - exit) * a.dx * 0.5;
  const y = interpolate(enter, [0, 1], [a.dy, 0]) + (1 - exit) * a.dy * 0.5;

  return (
    <AbsoluteFill style={{ backgroundColor: "transparent", flexDirection: "row", justifyContent: a.justify, alignItems: a.align, padding: inset }}>
      <SFProFaces />
      <div style={{ opacity: opacity * exit, transform: `translate(${x}px, ${y}px)` }}>{children}</div>
    </AbsoluteFill>
  );
};

// Shared chip look for overlay elements — white card, hairline, soft shadow.
export const chipStyle: React.CSSProperties = {
  background: "#FBFBFD",
  border: "1px solid rgba(0,0,0,0.08)",
  borderRadius: 32,
  boxShadow: "0 24px 70px rgba(3,7,18,0.22), 0 6px 20px rgba(3,7,18,0.12)",
};
