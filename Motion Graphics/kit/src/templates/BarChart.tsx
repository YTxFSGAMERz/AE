import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, spring, Easing } from "remotion";
import { theme, APPLE_EASE } from "../theme";
import { SFProFaces } from "../anim";

export type Bar = { label: string; value: number };
export type BarChartProps = { kicker?: string; title?: string; bars: Bar[]; suffix?: string; prefix?: string; highlightMax?: boolean };

const START = 24, STAG = 12;
export const barChartDuration = (p: BarChartProps) => START + p.bars.length * STAG + 130;

export const BarChart: React.FC<BarChartProps> = ({ kicker, title, bars, suffix = "", prefix = "", highlightMax = true }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const n = bars.length;
  const maxV = Math.max(...bars.map((b) => b.value));
  const maxIdx = bars.findIndex((b) => b.value === maxV);

  const baseY = 860, maxBarH = 470, barW = Math.min(200, 1200 / n);
  const gap = barW * 0.6;
  const totalW = n * barW + (n - 1) * gap;
  const startX = (1920 - totalW) / 2;

  const kO = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: "clamp" });
  const kY = interpolate(frame, [0, 18], [14, 0], { extrapolateRight: "clamp", easing: Easing.bezier(...APPLE_EASE) });
  const endFade = interpolate(frame, [durationInFrames - 16, durationInFrames], [1, 0], { extrapolateLeft: "clamp" });
  const fmt = (v: number) => prefix + Math.round(v).toLocaleString("en-IN") + suffix;

  return (
    <AbsoluteFill style={{ background: theme.paper, fontFamily: theme.fontDisplay, opacity: endFade }}>
      <SFProFaces />
      <div style={{ position: "absolute", top: 150, width: "100%", textAlign: "center", opacity: kO, transform: `translateY(${kY}px)` }}>
        {kicker ? <div style={{ fontFamily: theme.fontText, fontWeight: 600, fontSize: 24, letterSpacing: 6, textTransform: "uppercase", color: theme.accent }}>{kicker}</div> : null}
        {title ? <div style={{ fontWeight: 600, fontSize: 58, letterSpacing: -1.5, color: theme.ink, marginTop: 12 }}>{title}</div> : null}
      </div>

      {/* baseline */}
      <div style={{ position: "absolute", left: startX - 40, top: baseY, width: totalW + 80, height: 2, background: theme.hairline }} />

      {bars.map((bar, i) => {
        const b = START + i * STAG;
        const grow = spring({ frame: frame - b, fps, config: { damping: 200, mass: 0.8, stiffness: 110 } });
        const h = interpolate(grow, [0, 1], [0, (bar.value / maxV) * maxBarH]);
        const count = Math.round(interpolate(frame, [b, b + 34], [0, bar.value], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }));
        const op = interpolate(frame, [b, b + 12], [0, 1], { extrapolateRight: "clamp" });
        const x = startX + i * (barW + gap);
        const isMax = highlightMax && i === maxIdx;
        return (
          <div key={i} style={{ position: "absolute", left: x, top: baseY - h, width: barW, height: h, opacity: op }}>
            <div style={{ position: "absolute", top: -60, width: "100%", textAlign: "center", fontWeight: 700, fontSize: 40, color: isMax ? theme.accentDeep : theme.ink, fontVariantNumeric: "tabular-nums" }}>{fmt(count)}</div>
            <div style={{ width: "100%", height: "100%", borderRadius: "16px 16px 0 0", background: isMax ? theme.ink : "linear-gradient(180deg,#38bdf8,#0ea5e9)" }} />
            <div style={{ position: "absolute", top: h + 22, width: "100%", textAlign: "center", fontFamily: theme.fontText, fontWeight: 500, fontSize: 28, color: theme.inkSoft }}>{bar.label}</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
