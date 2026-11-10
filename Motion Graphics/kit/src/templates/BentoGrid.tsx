import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, spring, Easing } from "remotion";
import { theme, APPLE_EASE, accentTint } from "../theme";
import { SFProFaces } from "../anim";

export type BentoItem = { icon?: string; title: string; sub?: string };
export type BentoGridProps = { kicker?: string; title?: string; sub?: string; items: BentoItem[] };

export const bentoGridDuration = (p: BentoGridProps) => 30 + p.items.length * 18 + 150;

const Icon: React.FC<{ k?: string; color: string }> = ({ k, color }) => {
  const c = { fill: "none", stroke: color, strokeWidth: 2, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (k) {
    case "app": return <svg width="44" height="44" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="16" rx="2.5" {...c} /><line x1="3" y1="9" x2="21" y2="9" {...c} /></svg>;
    case "bolt": return <svg width="44" height="44" viewBox="0 0 24 24"><path d="M13 2 L4 14 H11 L10 22 L20 9 H13 Z" fill={color} stroke="none" /></svg>;
    case "briefcase": return <svg width="44" height="44" viewBox="0 0 24 24"><rect x="3" y="7" width="18" height="13" rx="2.5" {...c} /><path d="M8 7 V5.5 A2 2 0 0 1 10 3.5 H14 A2 2 0 0 1 16 5.5 V7" {...c} /></svg>;
    case "store": return <svg width="44" height="44" viewBox="0 0 24 24"><path d="M4 10 V20 H20 V10" {...c} /><path d="M3 5 H21 L20 10 H4 Z" {...c} /></svg>;
    case "spark": case "idea": return <svg width="44" height="44" viewBox="0 0 24 24"><path d="M9 18 H15 M10 21 H14" {...c} /><path d="M12 3 A6 6 0 0 1 15 14 H9 A6 6 0 0 1 12 3 Z" {...c} /></svg>;
    case "chat": return <svg width="44" height="44" viewBox="0 0 24 24"><path d="M4 5 H20 A1 1 0 0 1 21 6 V16 A1 1 0 0 1 20 17 H9 L4 21 Z" {...c} /></svg>;
    case "chart": return <svg width="44" height="44" viewBox="0 0 24 24"><path d="M4 20 V4 M4 20 H20" {...c} /><path d="M8 16 V12 M12 16 V8 M16 16 V10" {...c} /></svg>;
    case "rocket": return <svg width="44" height="44" viewBox="0 0 24 24"><path d="M12 3 C15 5 16 10 15 14 H9 C8 10 9 5 12 3 Z" {...c} /><path d="M9 14 L6 18 M15 14 L18 18" {...c} /><circle cx="12" cy="9" r="1.5" {...c} /></svg>;
    case "check": return <svg width="44" height="44" viewBox="0 0 24 24"><path d="M5 12.5l4 4 10-10" {...c} strokeWidth={3} /></svg>;
    case "users": return <svg width="44" height="44" viewBox="0 0 24 24"><circle cx="9" cy="8" r="3" {...c} /><path d="M4 20 a5 5 0 0 1 10 0" {...c} /><path d="M16 6 a3 3 0 0 1 0 6 M15 20 a5 5 0 0 0-1-3" {...c} /></svg>;
    default: return <svg width="44" height="44" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5" fill={color} /></svg>;
  }
};

export const BentoGrid: React.FC<BentoGridProps> = ({ kicker, title, sub, items }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const n = items.length;
  const perRow = n <= 3 ? n : n === 4 ? 2 : 3;
  const cardW = perRow >= 3 ? 506 : perRow === 2 ? 600 : 720;
  const cardH = 280;
  const gap = 44;

  // build rows
  const rows: number[][] = [];
  for (let i = 0; i < n; i += perRow) rows.push(Array.from({ length: Math.min(perRow, n - i) }, (_, k) => i + k));
  const totalGridH = rows.length * cardH + (rows.length - 1) * gap;
  const gridTop = 660 - totalGridH / 2; // grid vertically centered around y=660

  const pos: { x: number; y: number }[] = [];
  rows.forEach((row, r) => {
    const rowW = row.length * cardW + (row.length - 1) * gap;
    const startX = (1920 - rowW) / 2;
    row.forEach((idx, c) => { pos[idx] = { x: startX + c * (cardW + gap), y: gridTop + r * (cardH + gap) }; });
  });

  const kO = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: "clamp" });
  const kY = interpolate(frame, [0, 18], [14, 0], { extrapolateRight: "clamp", easing: Easing.bezier(...APPLE_EASE) });
  const hO = interpolate(frame, [8, 26], [0, 1], { extrapolateRight: "clamp" });
  const hY = interpolate(frame, [8, 26], [18, 0], { extrapolateRight: "clamp", easing: Easing.bezier(...APPLE_EASE) });
  const sO = interpolate(frame, [16, 32], [0, 1], { extrapolateRight: "clamp" });
  const endFade = interpolate(frame, [durationInFrames - 16, durationInFrames], [1, 0], { extrapolateLeft: "clamp" });

  return (
    <AbsoluteFill style={{ background: theme.paper, fontFamily: theme.fontDisplay, opacity: endFade }}>
      <SFProFaces />
      <div style={{ position: "absolute", top: 132, width: "100%", textAlign: "center" }}>
        {kicker ? <div style={{ opacity: kO, transform: `translateY(${kY}px)`, fontFamily: theme.fontText, fontWeight: 600, fontSize: 24, letterSpacing: 6, textTransform: "uppercase", color: theme.accent }}>{kicker}</div> : null}
        {title ? <div style={{ opacity: hO, transform: `translateY(${hY}px)`, fontWeight: 600, fontSize: 62, letterSpacing: -1.8, color: theme.ink, marginTop: 14 }}>{title}</div> : null}
        {sub ? <div style={{ opacity: sO, fontFamily: theme.fontText, fontWeight: 400, fontSize: 27, color: theme.inkSoft, marginTop: 12 }}>{sub}</div> : null}
      </div>

      {items.map((m, i) => {
        const s = spring({ frame: frame - (30 + i * 18), fps, config: { damping: 200, mass: 0.8, stiffness: 120 } });
        const op = interpolate(frame, [30 + i * 18, 30 + i * 18 + 14], [0, 1], { extrapolateRight: "clamp" });
        const p = pos[i];
        return (
          <div key={i} style={{ position: "absolute", left: p.x, top: p.y, width: cardW, height: cardH, opacity: op, transform: `translateY(${interpolate(s, [0, 1], [22, 0])}px) scale(${interpolate(s, [0, 1], [0.9, 1])})`, background: "#FFFFFF", borderRadius: 34, border: `1px solid ${theme.hairline}`, boxShadow: "0 26px 60px rgba(3,7,18,0.10), 0 6px 18px rgba(3,7,18,0.06)", padding: "42px 40px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div style={{ width: 84, height: 84, borderRadius: 24, background: accentTint(0.12), display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Icon k={m.icon} color={theme.accentDeep} />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 38, letterSpacing: -1, color: theme.ink }}>{m.title}</div>
              {m.sub ? <div style={{ fontFamily: theme.fontText, fontWeight: 400, fontSize: 25, color: theme.inkSoft, marginTop: 6 }}>{m.sub}</div> : null}
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
