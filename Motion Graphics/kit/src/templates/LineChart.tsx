import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, spring, Easing } from "remotion";
import { theme, APPLE_EASE } from "../theme";
import { SFProFaces } from "../anim";

export type LinePoint = { label: string; value: number };
export type LineChartProps = {
  kicker?: string;
  title?: string;
  points: LinePoint[];
  prefix?: string;
  suffix?: string;
};

const DRAW_START = 26, DRAW_LEN = 70;
export const lineChartDuration = (_p: LineChartProps) => DRAW_START + DRAW_LEN + 130;

export const LineChart: React.FC<LineChartProps> = ({ kicker, title, points, prefix = "", suffix = "" }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const n = points.length;
  const maxV = Math.max(...points.map((p) => p.value));

  const left = 300, right = 1620, baseY = 840, topY = 400;
  const dx = n > 1 ? (right - left) / (n - 1) : 0;
  const pts = points.map((p, i) => ({ x: left + i * dx, y: baseY - (p.value / maxV) * (baseY - topY) }));

  // smooth cubic path through the points
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < n; i++) {
    const cx = (pts[i - 1].x + pts[i].x) / 2;
    d += ` C ${cx} ${pts[i - 1].y}, ${cx} ${pts[i].y}, ${pts[i].x} ${pts[i].y}`;
  }
  const area = `${d} L ${pts[n - 1].x} ${baseY} L ${pts[0].x} ${baseY} Z`;

  const draw = interpolate(frame, [DRAW_START, DRAW_START + DRAW_LEN], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(...APPLE_EASE) });
  const clipW = left - 20 + draw * (right - left + 60);

  const kO = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: "clamp" });
  const kY = interpolate(frame, [0, 18], [14, 0], { extrapolateRight: "clamp", easing: Easing.bezier(...APPLE_EASE) });
  const endFade = interpolate(frame, [durationInFrames - 16, durationInFrames], [1, 0], { extrapolateLeft: "clamp" });

  const last = points[n - 1];
  const endCount = Math.round(interpolate(frame, [DRAW_START + DRAW_LEN * 0.55, DRAW_START + DRAW_LEN + 18], [0, last.value], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }));
  const endPop = spring({ frame: frame - (DRAW_START + DRAW_LEN - 6), fps, config: { damping: 13, mass: 0.6, stiffness: 150 } });
  const fmt = (v: number) => prefix + Math.round(v).toLocaleString("en-IN") + suffix;

  return (
    <AbsoluteFill style={{ background: theme.paper, fontFamily: theme.fontDisplay, opacity: endFade }}>
      <SFProFaces />
      <div style={{ position: "absolute", top: 150, width: "100%", textAlign: "center", opacity: kO, transform: `translateY(${kY}px)` }}>
        {kicker ? <div style={{ fontFamily: theme.fontText, fontWeight: 600, fontSize: 24, letterSpacing: 6, textTransform: "uppercase", color: theme.accent }}>{kicker}</div> : null}
        {title ? <div style={{ fontWeight: 600, fontSize: 58, letterSpacing: -1.5, color: theme.ink, marginTop: 12 }}>{title}</div> : null}
      </div>

      <svg width={1920} height={1080} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <linearGradient id="lc-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={theme.accent} stopOpacity={0.22} />
            <stop offset="100%" stopColor={theme.accent} stopOpacity={0.02} />
          </linearGradient>
          <clipPath id="lc-clip">
            <rect x={0} y={0} width={clipW} height={1080} />
          </clipPath>
        </defs>
        <line x1={left - 40} y1={baseY} x2={right + 40} y2={baseY} stroke={theme.hairline} strokeWidth={2} />
        <g clipPath="url(#lc-clip)">
          <path d={area} fill="url(#lc-area)" />
          <path d={d} fill="none" stroke={theme.accent} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" />
        </g>
        {pts.map((p, i) => {
          const reach = n > 1 ? i / (n - 1) : 0;
          const dot = spring({ frame: frame - (DRAW_START + reach * DRAW_LEN), fps, config: { damping: 15, mass: 0.5, stiffness: 170 } });
          const isLast = i === n - 1;
          return (
            <circle key={i} cx={p.x} cy={p.y} r={(isLast ? 16 : 10) * dot} fill={isLast ? theme.ink : theme.paper} stroke={theme.accent} strokeWidth={isLast ? 0 : 5} />
          );
        })}
      </svg>

      {pts.map((p, i) => {
        const reach = n > 1 ? i / (n - 1) : 0;
        const lO = interpolate(frame, [DRAW_START + reach * DRAW_LEN, DRAW_START + reach * DRAW_LEN + 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        return (
          <div key={i} style={{ position: "absolute", left: p.x - 100, top: baseY + 26, width: 200, textAlign: "center", opacity: lO, fontFamily: theme.fontText, fontWeight: 500, fontSize: 28, color: theme.inkSoft }}>
            {points[i].label}
          </div>
        );
      })}

      <div style={{ position: "absolute", left: pts[n - 1].x - 300, top: pts[n - 1].y - 118, width: 280, textAlign: "right", opacity: Math.min(1, endPop * 1.4), transform: `scale(${interpolate(endPop, [0, 1], [0.85, 1])})`, transformOrigin: "right bottom", fontWeight: 700, fontSize: 72, color: theme.ink, fontVariantNumeric: "tabular-nums", letterSpacing: -2, whiteSpace: "nowrap" }}>
        {fmt(endCount)}
      </div>
    </AbsoluteFill>
  );
};
