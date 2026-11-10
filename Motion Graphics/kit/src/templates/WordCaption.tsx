import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, spring } from "remotion";
import { theme, accentTint } from "../theme";
import { SFProFaces } from "../anim";
import { SfxAt } from "../Sfx";

/**
 * OVERLAY — word-by-word kinetic caption for the two or three lines worth
 * quoting. Words pop in sequence; `emphasis` words get an accent pill. Handles
 * Devanagari (falls back to the system Devanagari face) so Hindi lines work.
 */
export type WordCaptionProps = { text: string; emphasis?: string[]; wordStep?: number; hold?: number; position?: "bottom" | "center"; size?: number; sound?: boolean };
export const wordCaptionDuration = (p: WordCaptionProps) => 10 + p.text.split(/\s+/).length * (p.wordStep ?? 6) + (p.hold ?? 50) + 14;

export const WordCaption: React.FC<WordCaptionProps> = ({ text, emphasis = [], wordStep = 6, position = "bottom", size = 64, sound = true }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const words = text.split(/\s+/);
  const endFade = interpolate(frame, [durationInFrames - 14, durationInFrames], [1, 0], { extrapolateLeft: "clamp" });
  const strip = (x: string) => x.replace(/[.,!?।:;"“”]/g, "").toLowerCase();
  const isEm = (w: string) => emphasis.some((e) => strip(w) === strip(e));
  return (
    <AbsoluteFill style={{ backgroundColor: "transparent", justifyContent: position === "bottom" ? "flex-end" : "center", alignItems: "center", padding: position === "bottom" ? "0 120px 140px" : "0 120px", opacity: endFade }}>
      <SFProFaces />
      {sound ? words.map((w, i) => (i % 2 === 0 ? <SfxAt key={i} frame={10 + i * wordStep} name="type" volume={0.14} /> : null)) : null}
      {sound ? emphasis.length ? words.map((w, i) => (isEm(w) ? <SfxAt key={"e" + i} frame={10 + i * wordStep} name="pop" volume={0.3} /> : null)) : null : null}
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: `${size * 0.2}px ${size * 0.28}px`, maxWidth: 1500, fontFamily: `${theme.fontDisplay}, "Kohinoor Devanagari", "Devanagari Sangam MN", sans-serif`, fontWeight: 700, fontSize: size, letterSpacing: -size * 0.03, lineHeight: 1.15 }}>
        {words.map((w, i) => {
          const b = 10 + i * wordStep;
          const s = spring({ frame: frame - b, fps, config: { damping: 200, mass: 0.6, stiffness: 160 } });
          const o = interpolate(frame, [b, b + 6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const em = isEm(w);
          return (
            <span key={i} style={{ display: "inline-block", opacity: o, transform: `translateY(${interpolate(s, [0, 1], [18, 0])}px) scale(${interpolate(s, [0, 1], [0.9, 1])})`, color: em ? "#FFFFFF" : theme.ink, background: em ? theme.accent : "rgba(251,251,253,0.92)", padding: `${size * 0.08}px ${size * 0.26}px`, borderRadius: size * 0.28, boxShadow: em ? `0 12px 30px ${accentTint(0.35)}` : "0 12px 30px rgba(3,7,18,0.18)", whiteSpace: "nowrap" }}>{w}</span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
