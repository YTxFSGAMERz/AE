import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig, spring } from "remotion";
import { theme } from "../theme";
import { Overlay, OverlayPos } from "../Overlay";
import { SfxAt } from "../Sfx";

export type StampBadgeProps = {
  text: string;         // "SOLD OUT", "FREE", "24H ONLY"
  tone?: "accent" | "danger" | "ink";
  angle?: number;       // resting rotation in degrees
  position?: OverlayPos;
  hold?: number;
  sound?: boolean;
};

export const stampBadgeDuration = (p: StampBadgeProps) => 70 + (p.hold ?? 30);

const TONES = { accent: theme.accent, danger: theme.danger, ink: theme.ink } as const;

export const StampBadge: React.FC<StampBadgeProps> = ({ text, tone = "danger", angle = -8, position = "center", hold: _hold, sound = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const c = TONES[tone];

  // stamp slam: big → down onto the frame, tiny recoil
  const slam = spring({ frame: frame - 2, fps, config: { damping: 15, mass: 0.9, stiffness: 260 } });
  const scale = interpolate(slam, [0, 1], [2.4, 1]);
  const o = interpolate(slam, [0, 0.4], [0, 1], { extrapolateRight: "clamp" });

  return (
    <Overlay position={position}>
      {sound ? <SfxAt frame={4} name="pop" volume={0.5} /> : null}
      <div
        style={{
          opacity: o,
          transform: `rotate(${angle}deg) scale(${scale})`,
          border: `10px solid ${c}`,
          borderRadius: 22,
          padding: "20px 46px",
          background: "rgba(251,251,253,0.92)",
          boxShadow: "0 24px 70px rgba(3,7,18,0.25)",
          fontFamily: theme.fontDisplay,
          fontWeight: 800,
          fontSize: 88,
          letterSpacing: 6,
          textTransform: "uppercase",
          color: c,
          whiteSpace: "nowrap",
          lineHeight: 1,
        }}
      >
        {text}
      </div>
    </Overlay>
  );
};
