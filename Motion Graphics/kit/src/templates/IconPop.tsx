import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig, spring } from "remotion";
import { theme } from "../theme";
import { Overlay, chipStyle, OverlayPos } from "../Overlay";
import { SfxAt } from "../Sfx";

export type IconPopProps = {
  emoji: string;        // 💡 🔥 ✅ ❌ 🤯 …
  label?: string;       // optional short chip under the emoji
  position?: OverlayPos;
  hold?: number;
  sound?: boolean;
};

export const iconPopDuration = (p: IconPopProps) => 70 + (p.hold ?? 30);

export const IconPop: React.FC<IconPopProps> = ({ emoji, label, position = "top-right", hold: _hold, sound = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const pop = spring({ frame, fps, config: { damping: 10, mass: 0.6, stiffness: 180 } });
  const burst = interpolate(frame, [2, 26], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const lO = label ? interpolate(frame, [16, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;

  return (
    <Overlay position={position}>
      {sound ? <SfxAt frame={2} name="pop" volume={0.45} /> : null}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 22, fontFamily: theme.fontDisplay }}>
        <div style={{ position: "relative", width: 240, height: 240, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {/* burst rays */}
          <svg width={240} height={240} style={{ position: "absolute", inset: 0, opacity: 1 - burst }}>
            {new Array(8).fill(0).map((_, i) => {
              const a = (i / 8) * Math.PI * 2;
              const r0 = 70 + burst * 55, r1 = r0 + 26;
              return (
                <line key={i}
                  x1={120 + Math.cos(a) * r0} y1={120 + Math.sin(a) * r0}
                  x2={120 + Math.cos(a) * r1} y2={120 + Math.sin(a) * r1}
                  stroke={theme.accent} strokeWidth={7} strokeLinecap="round"
                />
              );
            })}
          </svg>
          <span style={{ fontSize: 170, lineHeight: 1, transform: `scale(${pop})`, filter: "drop-shadow(0 16px 40px rgba(3,7,18,0.30))" }}>{emoji}</span>
        </div>
        {label ? (
          <div style={{ ...chipStyle, borderRadius: 22, padding: "16px 30px", opacity: lO, fontWeight: 600, fontSize: 32, letterSpacing: -0.5, color: theme.ink, whiteSpace: "nowrap" }}>
            {label}
          </div>
        ) : null}
      </div>
    </Overlay>
  );
};
