import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, spring, Easing } from "remotion";
import { theme, APPLE_EASE } from "../theme";
import { SFProFaces } from "../anim";

export type DarkStatementProps = {
  lines: string[]; // each line lands on its own beat
  emphasis?: string; // substring anywhere in the lines to render in accent
  kicker?: string;
};

// Dark-mode kinetic takeover — the dramatic sibling of KineticStatement.
const START = 16, PER_LINE = 42;
export const darkStatementDuration = (p: DarkStatementProps) => START + p.lines.length * PER_LINE + 80;

const DARK = { bg: "#0A0A0C", text: "#F5F5F7", soft: "#6E6E73", accent: theme.accentOnDark };

export const DarkStatement: React.FC<DarkStatementProps> = ({ lines, emphasis, kicker }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const n = lines.length;

  const kO = interpolate(frame, [2, 18], [0, 1], { extrapolateRight: "clamp" });
  const endFade = interpolate(frame, [durationInFrames - 16, durationInFrames], [1, 0], { extrapolateLeft: "clamp" });
  const lastB = START + (n - 1) * PER_LINE;

  const renderLine = (text: string) => {
    if (emphasis && text.includes(emphasis)) {
      const i = text.indexOf(emphasis);
      return (
        <>
          {text.slice(0, i)}
          <span style={{ color: DARK.accent }}>{emphasis}</span>
          {text.slice(i + emphasis.length)}
        </>
      );
    }
    return text;
  };

  return (
    <AbsoluteFill style={{ background: DARK.bg, fontFamily: theme.fontDisplay, justifyContent: "center", alignItems: "center", opacity: endFade }}>
      <SFProFaces />
      {/* subtle vignette so the center glows */}
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 62% 55% at 50% 46%, rgba(56,189,248,0.07), transparent 70%)" }} />

      <div style={{ maxWidth: 1560, textAlign: "center", position: "relative" }}>
        {kicker ? (
          <div style={{ opacity: kO, fontFamily: theme.fontText, fontWeight: 600, fontSize: 24, letterSpacing: 8, textTransform: "uppercase", color: DARK.soft, marginBottom: 44 }}>{kicker}</div>
        ) : null}
        {lines.map((line, i) => {
          const b = START + i * PER_LINE;
          const pop = spring({ frame: frame - b, fps, config: { damping: 16, mass: 0.7, stiffness: 130 } });
          const o = interpolate(frame, [b, b + 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const isLast = i === n - 1;
          // earlier lines dim once the next line lands; the last line stays hot
          const dim = isLast ? 1 : interpolate(frame, [b + PER_LINE, b + PER_LINE + 14], [1, 0.38], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const blur = interpolate(pop, [0, 1], [10, 0]);
          const y = interpolate(pop, [0, 1], [34, 0]);
          return (
            <div
              key={i}
              style={{
                opacity: o * dim,
                transform: `translateY(${y}px) scale(${interpolate(pop, [0, 1], [0.96, 1])})`,
                filter: `blur(${blur}px)`,
                fontWeight: isLast ? 700 : 500,
                fontSize: isLast ? 104 : 78,
                lineHeight: 1.08,
                letterSpacing: isLast ? -3 : -1.5,
                color: DARK.text,
                marginTop: i === 0 ? 0 : 30,
              }}
            >
              {renderLine(line)}
            </div>
          );
        })}
        <div style={{ width: interpolate(frame, [lastB + 18, lastB + 40], [0, 380], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(...APPLE_EASE) }), height: 8, borderRadius: 8, background: DARK.accent, margin: "40px auto 0" }} />
      </div>
    </AbsoluteFill>
  );
};
