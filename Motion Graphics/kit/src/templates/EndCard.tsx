import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig, spring, Easing } from "remotion";
import { theme, APPLE_EASE } from "../theme";
import { BrandKicker } from "../Brand";
import { Card } from "../Card";

export type EndCardProps = { brand?: string; url: string; tagline?: string; tld?: string };

export const endCardDuration = () => 150;

export const EndCard: React.FC<EndCardProps> = ({ brand = "Your Brand", url, tagline, tld = ".com" }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const kO = interpolate(frame, [6, 22], [0, 1], { extrapolateRight: "clamp" });
  const kY = interpolate(frame, [6, 22], [16, 0], { extrapolateRight: "clamp", easing: Easing.bezier(...APPLE_EASE) });
  const s = spring({ frame: frame - 22, fps, config: { damping: 200, mass: 1, stiffness: 100 } });
  const urlO = interpolate(frame, [22, 40], [0, 1], { extrapolateRight: "clamp" });
  const urlY = interpolate(s, [0, 1], [36, 0]);
  const accentW = interpolate(frame, [46, 70], [0, 380], { extrapolateRight: "clamp", easing: Easing.bezier(...APPLE_EASE) });
  const tO = tagline ? interpolate(frame, [58, 74], [0, 1], { extrapolateRight: "clamp" }) : 0;

  // split url into base + tld for accent coloring
  const base = url.endsWith(tld) ? url.slice(0, -tld.length) : url;
  const suffix = url.endsWith(tld) ? tld : "";

  return (
    <Card fullBleed>
      <div style={{ textAlign: "center" }}>
        <div style={{ opacity: kO, transform: `translateY(${kY}px)`, marginBottom: 26 }}><BrandKicker text={brand} size={24} /></div>
        <div style={{ opacity: urlO, transform: `translateY(${urlY}px)`, fontWeight: 600, fontSize: 128, letterSpacing: -4, color: theme.ink, lineHeight: 1 }}>
          {base}<span style={{ color: theme.accent }}>{suffix}</span>
        </div>
        <div style={{ width: accentW, height: 8, borderRadius: 8, background: theme.accent, margin: "34px auto 0" }} />
        {tagline ? <div style={{ opacity: tO, fontFamily: theme.fontText, fontWeight: 500, fontSize: 38, color: theme.inkSoft, marginTop: 34, letterSpacing: -0.3 }}>{tagline}</div> : null}
      </div>
    </Card>
  );
};
