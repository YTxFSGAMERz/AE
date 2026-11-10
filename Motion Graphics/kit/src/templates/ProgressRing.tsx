import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig, spring, Easing } from "remotion";
import { theme } from "../theme";
import { Card } from "../Card";
import { SfxAt } from "../Sfx";

export type ProgressRingProps = {
  kicker?: string;
  percent: number; // 0–100
  label: string;
  sub?: string;
  sound?: boolean; // whoosh on entrance + chime when the ring lands
};

export const progressRingDuration = () => 160;

export const ProgressRing: React.FC<ProgressRingProps> = ({ kicker, percent, label, sub, sound = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fill = interpolate(frame, [14, 66], [0, percent], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
  const count = Math.round(fill);
  const pop = spring({ frame: frame - 60, fps, config: { damping: 13, mass: 0.6, stiffness: 150 } });
  const numScale = 1 + interpolate(pop, [0, 1], [0, 0.04]);

  const kO = interpolate(frame, [4, 20], [0, 1], { extrapolateRight: "clamp" });
  const lO = interpolate(frame, [56, 72], [0, 1], { extrapolateRight: "clamp" });
  const sO = sub ? interpolate(frame, [70, 86], [0, 1], { extrapolateRight: "clamp" }) : 0;

  const R = 210, STROKE = 34;

  return (
    <Card width={1180} height={760}>
      {sound ? (
        <>
          <SfxAt frame={2} name="whoosh" volume={0.22} />
          <SfxAt frame={62} name="chime" volume={0.35} />
        </>
      ) : null}
      <div style={{ display: "flex", alignItems: "center", gap: 110 }}>
        <div style={{ position: "relative", width: (R + STROKE) * 2, height: (R + STROKE) * 2 }}>
          <svg width={(R + STROKE) * 2} height={(R + STROKE) * 2}>
            <circle cx={R + STROKE} cy={R + STROKE} r={R} fill="none" stroke={theme.hairline} strokeWidth={STROKE} />
            <circle
              cx={R + STROKE} cy={R + STROKE} r={R} fill="none"
              stroke={theme.accent} strokeWidth={STROKE} strokeLinecap="round"
              pathLength={100}
              strokeDasharray={`${Math.max(0.01, fill)} ${100 - Math.max(0.01, fill)}`}
              strokeDashoffset={25}
            />
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${numScale})` }}>
            <span style={{ fontWeight: 700, fontSize: 130, color: theme.ink, fontVariantNumeric: "tabular-nums", letterSpacing: -4 }}>
              {count}<span style={{ fontSize: 72, color: theme.accent }}>%</span>
            </span>
          </div>
        </div>
        <div style={{ maxWidth: 520 }}>
          {kicker ? (
            <div style={{ opacity: kO, fontFamily: theme.fontText, fontWeight: 600, fontSize: 22, letterSpacing: 6, textTransform: "uppercase", color: theme.inkSoft, marginBottom: 18 }}>{kicker}</div>
          ) : null}
          <div style={{ opacity: lO, fontWeight: 600, fontSize: 54, lineHeight: 1.12, letterSpacing: -1, color: theme.ink }}>{label}</div>
          {sub ? <div style={{ opacity: sO, fontFamily: theme.fontText, fontWeight: 400, fontSize: 28, color: theme.inkSoft, marginTop: 16, lineHeight: 1.4 }}>{sub}</div> : null}
        </div>
      </div>
    </Card>
  );
};
