import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, spring, Easing, OffthreadVideo, staticFile } from "remotion";
import { theme, APPLE_EASE } from "../theme";
import { SFProFaces } from "../anim";

/**
 * CUSTOM (hybrid) — real full-bleed footage (fetched stock / official clip) with
 * a slow push-in, a bottom scrim, and kinetic lines landing on top. What an
 * editor does with B-roll + type; the kit's DarkStatement voice on real pixels.
 */
export type FootageStatementProps = { src: string; startFrom?: number; lines: string[]; emphasis?: string; kicker?: string; credit?: string; hold?: number; focus?: "left" | "center" | "right"; grade?: boolean; playbackRate?: number };

const START = 22, PER_LINE = 40;
export const footageStatementDuration = (p: FootageStatementProps) => START + p.lines.length * PER_LINE + (p.hold ?? 70);

export const FootageStatement: React.FC<FootageStatementProps> = ({ src, startFrom = 0, lines, emphasis, kicker, credit, hold = 70, focus = "center", grade = true, playbackRate = 1 }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const endFade = interpolate(frame, [durationInFrames - 16, durationInFrames], [1, 0], { extrapolateLeft: "clamp" });
  const inFade = interpolate(frame, [0, 10], [0, 1], { extrapolateRight: "clamp" });
  const zoom = interpolate(frame, [0, durationInFrames], [1.0, 1.07]);
  const kO = interpolate(frame, [4, 20], [0, 1], { extrapolateRight: "clamp" });

  const renderLine = (text: string) => {
    if (emphasis && text.includes(emphasis)) {
      const i = text.indexOf(emphasis);
      return (<>{text.slice(0, i)}<span style={{ color: theme.accentOnDark }}>{emphasis}</span>{text.slice(i + emphasis.length)}</>);
    }
    return text;
  };

  return (
    <AbsoluteFill style={{ background: "#0A0A0C", fontFamily: theme.fontDisplay, opacity: endFade * inFade }}>
      <SFProFaces />
      <AbsoluteFill style={{ transform: `scale(${zoom})`, filter: grade ? "saturate(0.82) contrast(1.06) brightness(0.96)" : undefined }}>
        <OffthreadVideo src={staticFile(src)} startFrom={startFrom} playbackRate={playbackRate} muted style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: focus === "left" ? "20% 50%" : focus === "right" ? "80% 50%" : "50% 50%" }} />
      </AbsoluteFill>
      {/* grade toward the palette + vignette so the footage reads as ours, not stock */}
      {grade ? <AbsoluteFill style={{ background: theme.accent, opacity: 0.16, mixBlendMode: "soft-light" }} /> : null}
      {grade ? <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, rgba(0,0,0,0) 45%, rgba(0,0,0,0.42) 100%)" }} /> : null}
      {/* scrim: keeps type legible, lets the top of the frame breathe */}
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(10,10,12,0.05) 0%, rgba(10,10,12,0.25) 45%, rgba(10,10,12,0.82) 100%)" }} />
      <div style={{ position: "absolute", left: 140, right: 140, bottom: 150 }}>
        {kicker ? <div style={{ opacity: kO, fontFamily: theme.fontText, fontWeight: 600, fontSize: 24, letterSpacing: 6, textTransform: "uppercase", color: theme.accentOnDark, marginBottom: 22 }}>{kicker}</div> : null}
        {lines.map((l, i) => {
          const b = START + i * PER_LINE;
          const s = spring({ frame: frame - b, fps, config: { damping: 200, mass: 0.9, stiffness: 110 } });
          const o = interpolate(frame, [b, b + 14], [0, 1], { extrapolateRight: "clamp" });
          return (
            <div key={i} style={{ opacity: o, transform: `translateY(${interpolate(s, [0, 1], [34, 0])}px)`, fontWeight: 700, fontSize: 92, lineHeight: 1.06, letterSpacing: -3.2, color: "#F5F5F7", textShadow: "0 6px 30px rgba(0,0,0,0.45)" }}>{renderLine(l)}</div>
          );
        })}
      </div>
      {credit ? <div style={{ position: "absolute", right: 56, bottom: 44, fontFamily: theme.fontText, fontSize: 18, letterSpacing: 1, color: "rgba(245,245,247,0.55)", opacity: kO }}>{credit}</div> : null}
    </AbsoluteFill>
  );
};
