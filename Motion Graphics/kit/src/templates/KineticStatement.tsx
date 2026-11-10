import React from "react";
import { interpolate, useCurrentFrame, Easing } from "remotion";
import { theme, APPLE_EASE } from "../theme";
import { Card } from "../Card";

export type KineticStatementProps = {
  first: string;   // sets up the idea, then dims
  second: string;  // the payoff line that lands
  emphasis?: string; // substring of `second` to bold + accent-underline
};

export const kineticStatementDuration = () => 150;

export const KineticStatement: React.FC<KineticStatementProps> = ({ first, second, emphasis }) => {
  const frame = useCurrentFrame();

  const l1O = interpolate(frame, [6, 24], [0, 1], { extrapolateRight: "clamp" });
  const l1Y = interpolate(frame, [6, 24], [24, 0], { extrapolateRight: "clamp", easing: Easing.bezier(...APPLE_EASE) });
  const l1Dim = interpolate(frame, [48, 64], [1, 0.32], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  const l2O = interpolate(frame, [50, 70], [0, 1], { extrapolateRight: "clamp" });
  const l2Y = interpolate(frame, [50, 70], [28, 0], { extrapolateRight: "clamp", easing: Easing.bezier(...APPLE_EASE) });
  const accentW = interpolate(frame, [74, 96], [0, 430], { extrapolateRight: "clamp", easing: Easing.bezier(...APPLE_EASE) });

  // split second around emphasis for bolding
  let pre = second, mid = "", post = "";
  if (emphasis && second.includes(emphasis)) {
    const i = second.indexOf(emphasis);
    pre = second.slice(0, i);
    mid = emphasis;
    post = second.slice(i + emphasis.length);
  }

  return (
    <Card fullBleed padding={120}>
      <div style={{ maxWidth: 1520, textAlign: "center" }}>
        <div style={{ opacity: l1O * l1Dim, transform: `translateY(${l1Y}px)`, fontWeight: 500, fontSize: 76, lineHeight: 1.1, letterSpacing: -1.5, color: theme.ink }}>
          {first}
        </div>
        <div style={{ opacity: l2O, transform: `translateY(${l2Y}px)`, marginTop: 34, fontWeight: 400, fontSize: 96, lineHeight: 1.05, letterSpacing: -2.5, color: theme.ink }}>
          {pre}
          {mid ? <span style={{ fontWeight: 700 }}>{mid}</span> : null}
          {post}
        </div>
        {emphasis ? <div style={{ width: accentW, height: 8, borderRadius: 8, background: theme.accent, margin: "26px auto 0" }} /> : null}
      </div>
    </Card>
  );
};
