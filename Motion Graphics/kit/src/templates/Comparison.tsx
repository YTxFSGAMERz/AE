import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { theme, APPLE_EASE, accentTint } from "../theme";
import { SFProFaces } from "../anim";

// left/right cell: true = check, false = cross, string = text
export type CompRow = { label: string; left: boolean | string; right: boolean | string };
export type ComparisonProps = { kicker?: string; leftTitle: string; rightTitle: string; rows: CompRow[] };

export const comparisonDuration = (p: ComparisonProps) => 40 + p.rows.length * 16 + 120;

const TABLE_W = 1360;
const LABEL_W = 720;
const CELL_W = (TABLE_W - LABEL_W) / 2; // 320

const Check = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none"><path d="M5 12.5l4 4 10-10" stroke={theme.accentDeep} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" /></svg>
);
const Cross = () => (
  <svg width="34" height="34" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="#c7c7cc" strokeWidth="3" strokeLinecap="round" /></svg>
);
const cell = (v: boolean | string, accent: boolean) => {
  if (typeof v === "string") return <span style={{ fontFamily: theme.fontText, fontWeight: 600, fontSize: 30, color: accent ? theme.accentDeep : theme.inkSoft }}>{v}</span>;
  return v ? <Check /> : <Cross />;
};

export const Comparison: React.FC<ComparisonProps> = ({ kicker, leftTitle, rightTitle, rows }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const left = (1920 - TABLE_W) / 2;

  const kO = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: "clamp" });
  const kY = interpolate(frame, [0, 18], [14, 0], { extrapolateRight: "clamp", easing: Easing.bezier(...APPLE_EASE) });
  const headO = interpolate(frame, [12, 30], [0, 1], { extrapolateRight: "clamp" });
  const endFade = interpolate(frame, [durationInFrames - 16, durationInFrames], [1, 0], { extrapolateLeft: "clamp" });

  const ROW_H = 108;
  const headY = 300;
  const firstRowY = headY + 96;
  const panelTop = headY - 46;
  const panelH = 96 + rows.length * ROW_H + 40;

  return (
    <AbsoluteFill style={{ background: theme.paper, fontFamily: theme.fontDisplay, opacity: endFade }}>
      <SFProFaces />
      <div style={{ position: "absolute", top: 150, width: "100%", textAlign: "center", opacity: kO, transform: `translateY(${kY}px)`, fontFamily: theme.fontText, fontWeight: 600, fontSize: 24, letterSpacing: 6, textTransform: "uppercase", color: theme.accent }}>{kicker ?? "Why it's different"}</div>

      {/* highlight panel behind the right ("us") column */}
      <div style={{ position: "absolute", left: left + LABEL_W + CELL_W - 20, top: panelTop, width: CELL_W + 40, height: panelH, background: accentTint(0.08), border: `1.5px solid ${accentTint(0.35)}`, borderRadius: 28 }} />

      {/* header */}
      <div style={{ position: "absolute", left, top: headY, width: TABLE_W, display: "flex", alignItems: "center", opacity: headO }}>
        <div style={{ width: LABEL_W }} />
        <div style={{ width: CELL_W, textAlign: "center", fontFamily: theme.fontText, fontWeight: 600, fontSize: 30, color: theme.inkSoft }}>{leftTitle}</div>
        <div style={{ width: CELL_W, textAlign: "center", fontFamily: theme.fontText, fontWeight: 700, fontSize: 32, color: theme.accentDeep }}>{rightTitle}</div>
      </div>

      {/* rows */}
      {rows.map((r, i) => {
        const b = 40 + i * 16;
        const op = interpolate(frame, [b, b + 16], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const x = interpolate(frame, [b, b + 16], [-24, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(...APPLE_EASE) });
        const y = firstRowY + i * ROW_H;
        return (
          <div key={i} style={{ position: "absolute", left, top: y, width: TABLE_W, height: ROW_H, display: "flex", alignItems: "center", opacity: op, transform: `translateX(${x}px)`, borderTop: i === 0 ? "none" : `1px solid ${theme.hairline}` }}>
            <div style={{ width: LABEL_W, fontWeight: 500, fontSize: 38, color: theme.ink, letterSpacing: -0.5 }}>{r.label}</div>
            <div style={{ width: CELL_W, display: "flex", justifyContent: "center" }}>{cell(r.left, false)}</div>
            <div style={{ width: CELL_W, display: "flex", justifyContent: "center" }}>{cell(r.right, true)}</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
