import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig, spring, Easing } from "remotion";
import { theme, APPLE_EASE } from "../theme";
import { Overlay, chipStyle, OverlayPos } from "../Overlay";
import { SfxAt } from "../Sfx";

export type SideNotesProps = {
  kicker?: string;
  items: string[];      // short lines — they appear as the speaker enumerates
  position?: OverlayPos; // put it on the side the face ISN'T
  step?: number;        // frames between items (default 26)
  hold?: number;        // extra hold after the last item
  sound?: boolean;
};

export const sideNotesDuration = (p: SideNotesProps) => 20 + p.items.length * (p.step ?? 26) + 70 + (p.hold ?? 0);

export const SideNotes: React.FC<SideNotesProps> = ({ kicker, items, position = "right", step = 26, hold: _hold, sound = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const fromLeft = typeof position === "string" && position.includes("left");

  return (
    <Overlay position={position}>
      <div style={{ display: "flex", flexDirection: "column", gap: 20, alignItems: fromLeft ? "flex-start" : "flex-end", fontFamily: theme.fontDisplay }}>
        {kicker ? (
          <div style={{ opacity: interpolate(frame, [4, 18], [0, 1], { extrapolateRight: "clamp" }), fontFamily: theme.fontText, fontWeight: 600, fontSize: 22, letterSpacing: 5, textTransform: "uppercase", color: "#fff", textShadow: "0 2px 14px rgba(3,7,18,0.5)", marginBottom: 4 }}>
            {kicker}
          </div>
        ) : null}
        {items.map((it, i) => {
          const b = 20 + i * step;
          const pop = spring({ frame: frame - b, fps, config: { damping: 15, mass: 0.6, stiffness: 150 } });
          const o = interpolate(frame, [b, b + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const x = interpolate(pop, [0, 1], [fromLeft ? -40 : 40, 0]);
          return (
            <div key={i} style={{ opacity: o, transform: `translateX(${x}px)` }}>
              {sound ? <SfxAt frame={b + 2} name="tick" volume={0.3} /> : null}
              <div style={{ ...chipStyle, borderRadius: 24, padding: "22px 34px", display: "flex", alignItems: "center", gap: 20 }}>
                <div style={{ width: 14, height: 14, borderRadius: 14, background: theme.accent, flexShrink: 0 }} />
                <span style={{ fontWeight: 600, fontSize: 36, letterSpacing: -0.5, color: theme.ink, whiteSpace: "nowrap" }}>{it}</span>
              </div>
            </div>
          );
        })}
      </div>
    </Overlay>
  );
};
