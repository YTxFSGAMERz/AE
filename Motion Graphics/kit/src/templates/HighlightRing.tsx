import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { theme, APPLE_EASE, accentTint } from "../theme";
import { SFProFaces } from "../anim";
import { chipStyle } from "../Overlay";

export type HighlightRingProps = {
  // region to circle, in 1920×1080 coordinates
  x?: number; y?: number; w?: number; h?: number;
  radius?: number;
  label?: string;
  labelSide?: "above" | "below";
};

// Draws an animated rounded-rect ring around a screen region — for overlaying
// on screen recordings ("look at THIS part"). Transparent everywhere else.
export const highlightRingDuration = () => 130;

export const HighlightRing: React.FC<HighlightRingProps> = ({ x = 560, y = 250, w = 800, h = 560, radius = 28, label, labelSide = "below" }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const draw = interpolate(frame, [4, 34], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(...APPLE_EASE) });
  const pulse = 1 + Math.sin(Math.max(0, frame - 34) / 9) * 0.006;
  const lO = label ? interpolate(frame, [26, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;
  const endFade = interpolate(frame, [durationInFrames - 14, durationInFrames], [1, 0], { extrapolateLeft: "clamp" });

  const cx = x + w / 2, cy = y + h / 2;

  return (
    <AbsoluteFill style={{ backgroundColor: "transparent", fontFamily: theme.fontDisplay, opacity: endFade }}>
      <SFProFaces />
      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, transform: `scale(${pulse})`, transformOrigin: `${cx}px ${cy}px` }}>
        <rect
          x={x} y={y} width={w} height={h} rx={radius}
          fill="none" stroke={theme.accent} strokeWidth={9} strokeLinecap="round"
          pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw}
          style={{ filter: "drop-shadow(0 6px 26px ${accentTint(0.45)})" }}
        />
      </svg>
      {label ? (
        <div style={{ position: "absolute", left: cx, top: labelSide === "below" ? y + h + 34 : y - 34, transform: `translate(-50%, ${labelSide === "below" ? 0 : -100}%)`, opacity: lO }}>
          <div style={{ ...chipStyle, borderRadius: 22, padding: "16px 30px", fontWeight: 600, fontSize: 32, letterSpacing: -0.5, color: theme.ink, whiteSpace: "nowrap" }}>{label}</div>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
