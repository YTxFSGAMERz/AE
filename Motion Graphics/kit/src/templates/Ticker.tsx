import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { theme, APPLE_EASE } from "../theme";
import { SFProFaces } from "../anim";

export type TickerProps = {
  kicker?: string;
  title?: string;
  items: string[]; // words / brand names / integrations to loop
};

export const tickerDuration = () => 220;

const Row: React.FC<{ items: string[]; y: number; dir: 1 | -1; solid: boolean; frame: number }> = ({ items, y, dir, solid, frame }) => {
  const reps = 4; // enough copies that a 25% shift wraps seamlessly
  const shift = ((frame * 0.11) % 25) * dir; // % of the row's own width
  const content: React.ReactNode[] = [];
  for (let r = 0; r < reps; r++) {
    items.forEach((it, i) => {
      content.push(
        <span key={`${r}-${i}`} style={{ display: "inline-flex", alignItems: "center" }}>
          <span
            style={
              solid
                ? { color: theme.ink }
                : { color: "transparent", WebkitTextStroke: `2.5px ${theme.inkSoft}` }
            }
          >
            {it}
          </span>
          <span style={{ color: theme.accent, margin: "0 44px", fontSize: 40 }}>●</span>
        </span>
      );
    });
  }
  return (
    <div style={{ position: "absolute", top: y, left: 0, right: 0, overflow: "hidden", whiteSpace: "nowrap" }}>
      <div style={{ display: "inline-block", transform: `translateX(${dir === 1 ? -shift : -25 + shift}%)`, fontWeight: 700, fontSize: 92, letterSpacing: -2 }}>
        {content}
      </div>
    </div>
  );
};

export const Ticker: React.FC<TickerProps> = ({ kicker, title, items }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  const kO = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: "clamp" });
  const kY = interpolate(frame, [0, 18], [14, 0], { extrapolateRight: "clamp", easing: Easing.bezier(...APPLE_EASE) });
  const rowsO = interpolate(frame, [8, 26], [0, 1], { extrapolateRight: "clamp" });
  const endFade = interpolate(frame, [durationInFrames - 16, durationInFrames], [1, 0], { extrapolateLeft: "clamp" });

  return (
    <AbsoluteFill style={{ background: theme.paper, fontFamily: theme.fontDisplay, opacity: endFade }}>
      <SFProFaces />
      {kicker || title ? (
        <div style={{ position: "absolute", top: 240, width: "100%", textAlign: "center", opacity: kO, transform: `translateY(${kY}px)` }}>
          {kicker ? <div style={{ fontFamily: theme.fontText, fontWeight: 600, fontSize: 24, letterSpacing: 6, textTransform: "uppercase", color: theme.accent }}>{kicker}</div> : null}
          {title ? <div style={{ fontWeight: 600, fontSize: 58, letterSpacing: -1.5, color: theme.ink, marginTop: 12 }}>{title}</div> : null}
        </div>
      ) : null}

      <div
        style={{
          position: "absolute", inset: 0, opacity: rowsO,
          maskImage: "linear-gradient(90deg, transparent 0%, black 12%, black 88%, transparent 100%)",
          WebkitMaskImage: "linear-gradient(90deg, transparent 0%, black 12%, black 88%, transparent 100%)",
        }}
      >
        <Row items={items} y={470} dir={1} solid frame={frame} />
        <Row items={items} y={630} dir={-1} solid={false} frame={frame} />
      </div>
    </AbsoluteFill>
  );
};
