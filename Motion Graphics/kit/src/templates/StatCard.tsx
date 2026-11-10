import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig, spring, Easing } from "remotion";
import { theme, APPLE_EASE } from "../theme";
import { BrandKicker } from "../Brand";
import { Card } from "../Card";
import { SfxAt } from "../Sfx";

export type StatCardProps = {
  kicker?: string;
  value: number;
  suffix?: string;
  label: string;
  sub?: string;
  sound?: boolean; // whoosh on entrance + pop when the number lands
};

export const statCardDuration = () => 140;

export const StatCard: React.FC<StatCardProps> = ({ kicker, value, suffix = "", label, sub, sound = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const count = Math.round(interpolate(frame, [12, 50], [0, value], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }));
  const pop = spring({ frame: frame - 12, fps, config: { damping: 14, mass: 0.6, stiffness: 140 } });
  const numScale = interpolate(pop, [0, 1], [0.8, 1]);

  const kY = interpolate(frame, [4, 20], [16, 0], { extrapolateRight: "clamp", easing: Easing.bezier(...APPLE_EASE) });
  const kO = interpolate(frame, [4, 20], [0, 1], { extrapolateRight: "clamp" });
  const lO = interpolate(frame, [44, 58], [0, 1], { extrapolateRight: "clamp" });
  const lY = interpolate(frame, [44, 58], [14, 0], { extrapolateRight: "clamp", easing: Easing.bezier(...APPLE_EASE) });
  const accentW = interpolate(frame, [50, 70], [0, 240], { extrapolateRight: "clamp", easing: Easing.bezier(...APPLE_EASE) });
  const sO = sub ? interpolate(frame, [62, 78], [0, 1], { extrapolateRight: "clamp" }) : 0;

  return (
    <Card>
      {sound ? (
        <>
          <SfxAt frame={2} name="whoosh" volume={0.22} />
          <SfxAt frame={46} name="pop" volume={0.42} />
        </>
      ) : null}
      <div style={{ opacity: kO, transform: `translateY(${kY}px)`, marginBottom: 12 }}>
        {kicker ? (
          <span style={{ fontFamily: theme.fontText, fontWeight: 600, fontSize: 22, letterSpacing: 6, textTransform: "uppercase", color: theme.inkSoft }}>{kicker}</span>
        ) : (
          <BrandKicker />
        )}
      </div>
      <div style={{ fontWeight: 700, fontSize: 250, lineHeight: 1, color: theme.ink, fontVariantNumeric: "tabular-nums", letterSpacing: -6, transform: `scale(${numScale})`, display: "flex", alignItems: "baseline" }}>
        {count}
        {suffix ? <span style={{ color: theme.accent }}>{suffix}</span> : null}
      </div>
      <div style={{ width: accentW, height: 6, borderRadius: 6, background: theme.accent, marginTop: 6, marginBottom: 24 }} />
      <div style={{ opacity: lO, transform: `translateY(${lY}px)`, fontWeight: 500, fontSize: 46, color: theme.ink, letterSpacing: -0.5 }}>{label}</div>
      {sub ? <div style={{ opacity: sO, fontFamily: theme.fontText, fontWeight: 400, fontSize: 26, color: theme.inkSoft, marginTop: 12 }}>{sub}</div> : null}
    </Card>
  );
};
