import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig, spring, Easing } from "remotion";
import { theme, APPLE_EASE } from "../theme";
import { Card } from "../Card";

export type QuoteProps = { quote: string; author: string; role?: string };
export const quoteDuration = () => 150;

export const Quote: React.FC<QuoteProps> = ({ quote, author, role }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const markS = spring({ frame: frame - 6, fps, config: { damping: 12, mass: 0.5, stiffness: 150 } });
  const qO = interpolate(frame, [16, 40], [0, 1], { extrapolateRight: "clamp" });
  const qY = interpolate(frame, [16, 40], [30, 0], { extrapolateRight: "clamp", easing: Easing.bezier(...APPLE_EASE) });
  const aO = interpolate(frame, [44, 60], [0, 1], { extrapolateRight: "clamp" });
  const aY = interpolate(frame, [44, 60], [16, 0], { extrapolateRight: "clamp", easing: Easing.bezier(...APPLE_EASE) });

  return (
    <Card fullBleed padding={160}>
      <div style={{ maxWidth: 1450, textAlign: "center" }}>
        <div style={{ fontFamily: theme.fontDisplay, fontWeight: 700, fontSize: 200, lineHeight: 0.5, color: theme.accent, transform: `scale(${interpolate(markS, [0, 1], [0.5, 1])})`, height: 90 }}>“</div>
        <div style={{ opacity: qO, transform: `translateY(${qY}px)`, fontWeight: 500, fontSize: 68, lineHeight: 1.25, letterSpacing: -1.2, color: theme.ink }}>{quote}</div>
        <div style={{ opacity: aO, transform: `translateY(${aY}px)`, marginTop: 44 }}>
          <div style={{ fontFamily: theme.fontText, fontWeight: 600, fontSize: 34, color: theme.ink }}>{author}</div>
          {role ? <div style={{ fontFamily: theme.fontText, fontWeight: 400, fontSize: 27, color: theme.inkSoft, marginTop: 4 }}>{role}</div> : null}
        </div>
      </div>
    </Card>
  );
};
