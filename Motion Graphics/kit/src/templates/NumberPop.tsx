import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig, spring } from "remotion";
import { theme } from "../theme";
import { Overlay, chipStyle, OverlayPos } from "../Overlay";
import { SfxAt } from "../Sfx";

export type NumberPopProps = {
  value: string;        // already formatted: "₹1,499", "10×", "250+", "-40%"
  label?: string;
  position?: OverlayPos;
  tone?: "accent" | "ink" | "danger"; // value color
  hold?: number;
  sound?: boolean;
};

export const numberPopDuration = (p: NumberPopProps) => 80 + (p.hold ?? 30);

const TONES = { accent: theme.accent, ink: theme.ink, danger: theme.danger } as const;

export const NumberPop: React.FC<NumberPopProps> = ({ value, label, position = "right", tone = "accent", hold: _hold, sound = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // slam: oversized + blurred → settles
  const slam = spring({ frame, fps, config: { damping: 14, mass: 0.7, stiffness: 200 } });
  const scale = interpolate(slam, [0, 1], [1.6, 1]);
  const blur = interpolate(slam, [0, 0.7, 1], [10, 2, 0]);
  const lO = label ? interpolate(frame, [14, 28], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;

  return (
    <Overlay position={position}>
      {sound ? <SfxAt frame={3} name="pop" volume={0.45} /> : null}
      <div style={{ ...chipStyle, padding: "44px 66px", display: "flex", flexDirection: "column", alignItems: "center", fontFamily: theme.fontDisplay, borderTop: `8px solid ${TONES[tone]}` }}>
        <div style={{ transform: `scale(${scale})`, filter: `blur(${blur}px)`, fontWeight: 800, fontSize: 128, letterSpacing: -4, lineHeight: 1, color: TONES[tone], fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
          {value}
        </div>
        {label ? (
          <div style={{ opacity: lO, marginTop: 18, fontWeight: 500, fontSize: 34, letterSpacing: -0.5, color: theme.inkSoft, whiteSpace: "nowrap" }}>{label}</div>
        ) : null}
      </div>
    </Overlay>
  );
};
