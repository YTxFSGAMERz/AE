import React from "react";
import { theme } from "./theme";
/**
 * Product moments: a screenshot inside a laptop or phone, drawn in CSS with a
 * slight 3D tilt so it reads as an object, not a rectangle. Children = the
 * screen content (an <Img> / <OffthreadVideo> sized to `screenW`).
 */
export type DeviceKind = "laptop" | "phone";
export const DEVICE_SCREEN: Record<DeviceKind, { w: number; h: number }> = { laptop: { w: 1200, h: 750 }, phone: { w: 360, h: 780 } };

export const DeviceFrame: React.FC<{ kind: DeviceKind; tilt?: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ kind, tilt = 6, children, style }) => {
  const scr = DEVICE_SCREEN[kind];
  const persp: React.CSSProperties = { transform: `perspective(2400px) rotateY(${-tilt}deg) rotateX(${tilt * 0.35}deg)`, transformStyle: "preserve-3d", ...style };
  if (kind === "phone") {
    return (
      <div style={persp}>
        <div style={{ width: scr.w + 28, height: scr.h + 28, borderRadius: 64, background: "#0A0A0C", padding: 14, boxShadow: "0 50px 120px rgba(3,7,18,0.30), inset 0 0 0 2px rgba(255,255,255,0.08)" }}>
          <div style={{ position: "relative", width: scr.w, height: scr.h, borderRadius: 52, overflow: "hidden", background: "#FFFFFF" }}>
            {children}
            <div style={{ position: "absolute", top: 14, left: "50%", transform: "translateX(-50%)", width: 110, height: 30, borderRadius: 15, background: "#0A0A0C" }} />
          </div>
        </div>
      </div>
    );
  }
  return (
    <div style={persp}>
      <div style={{ width: scr.w + 36, borderRadius: "26px 26px 8px 8px", background: "#111114", padding: "18px 18px 12px", boxShadow: "0 50px 120px rgba(3,7,18,0.28), inset 0 0 0 1px rgba(255,255,255,0.08)" }}>
        <div style={{ position: "relative", width: scr.w, height: scr.h, borderRadius: 12, overflow: "hidden", background: "#FFFFFF" }}>{children}</div>
      </div>
      <div style={{ width: scr.w + 220, height: 22, marginLeft: -92, borderRadius: "0 0 22px 22px", background: "linear-gradient(180deg,#D9D9DE,#B9B9C0)", boxShadow: "0 30px 60px rgba(3,7,18,0.18)" }}>
        <div style={{ width: 180, height: 6, margin: "0 auto", borderRadius: "0 0 8px 8px", background: "#9A9AA2" }} />
      </div>
      <div style={{ height: 1, background: theme.hairline }} />
    </div>
  );
};
