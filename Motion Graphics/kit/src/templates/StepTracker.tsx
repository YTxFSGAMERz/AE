import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig, spring } from "remotion";
import { theme } from "../theme";
import { Overlay, OverlayPos } from "../Overlay";

export type StepTrackerProps = {
  step: number;
  total: number;
  label?: string;       // e.g. the name of this step
  position?: OverlayPos;
  hold?: number;
};

// Small corner pill: "STEP 2 / 5 — Validate the idea". Stays up while they talk.
export const stepTrackerDuration = (p: StepTrackerProps) => 110 + (p.hold ?? 60);

export const StepTracker: React.FC<StepTrackerProps> = ({ step, total, label, position = "top-left", hold: _hold }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const pop = spring({ frame: frame - 4, fps, config: { damping: 14, mass: 0.6, stiffness: 160 } });
  const lO = label ? interpolate(frame, [14, 28], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;
  const barP = interpolate(frame, [16, 40], [0, step / total], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <Overlay position={position} inset={80}>
      <div style={{ transform: `scale(${0.8 + pop * 0.2})`, transformOrigin: "top left", background: theme.ink, borderRadius: 26, padding: "22px 34px", boxShadow: "0 20px 60px rgba(3,7,18,0.35)", fontFamily: theme.fontDisplay, display: "flex", flexDirection: "column", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 16 }}>
          <span style={{ fontFamily: theme.fontText, fontWeight: 700, fontSize: 22, letterSpacing: 4, textTransform: "uppercase", color: "rgba(255,255,255,0.55)" }}>Step</span>
          <span style={{ fontWeight: 700, fontSize: 40, color: "#fff", fontVariantNumeric: "tabular-nums" }}>
            {step}<span style={{ color: "rgba(255,255,255,0.45)", fontSize: 30 }}> / {total}</span>
          </span>
          {label ? <span style={{ opacity: lO, fontWeight: 500, fontSize: 30, letterSpacing: -0.5, color: "#fff", marginLeft: 10, whiteSpace: "nowrap" }}>{label}</span> : null}
        </div>
        <div style={{ height: 7, borderRadius: 7, background: "rgba(255,255,255,0.18)", overflow: "hidden" }}>
          <div style={{ width: `${barP * 100}%`, height: "100%", borderRadius: 7, background: theme.accent }} />
        </div>
      </div>
    </Overlay>
  );
};
