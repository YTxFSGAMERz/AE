import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, spring, Easing } from "remotion";
import { theme, APPLE_EASE, accentTint } from "../theme";
import { SFProFaces } from "../anim";

export type ChapterCardProps = {
  index: number; // chapter / part number
  title: string;
  total?: number; // shows "PART 2 OF 5" when set
  sub?: string;
};

export const chapterCardDuration = () => 130;

export const ChapterCard: React.FC<ChapterCardProps> = ({ index, title, total, sub }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  const endFade = interpolate(frame, [durationInFrames - 16, durationInFrames], [1, 0], { extrapolateLeft: "clamp" });

  // giant watermark number drifts in scale behind everything
  const numO = interpolate(frame, [0, 20], [0, 1], { extrapolateRight: "clamp" });
  const numScale = interpolate(frame, [0, durationInFrames], [1.08, 1], { easing: Easing.bezier(...APPLE_EASE) });

  const kO = interpolate(frame, [10, 26], [0, 1], { extrapolateRight: "clamp" });
  const tPop = spring({ frame: frame - 18, fps, config: { damping: 200, mass: 0.8, stiffness: 120 } });
  const tO = interpolate(frame, [18, 34], [0, 1], { extrapolateRight: "clamp" });
  const ruleW = interpolate(frame, [34, 56], [0, 200], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(...APPLE_EASE) });
  const sO = sub ? interpolate(frame, [46, 62], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : 0;

  return (
    <AbsoluteFill style={{ background: theme.paper, fontFamily: theme.fontDisplay, justifyContent: "center", alignItems: "center", opacity: endFade }}>
      <SFProFaces />
      <div
        style={{
          position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
          opacity: numO, transform: `scale(${numScale})`,
          fontWeight: 800, fontSize: 780, letterSpacing: -30, color: accentTint(0.09),
          fontVariantNumeric: "tabular-nums", lineHeight: 1,
        }}
      >
        {index}
      </div>

      <div style={{ position: "relative", textAlign: "center" }}>
        <div style={{ opacity: kO, fontFamily: theme.fontText, fontWeight: 600, fontSize: 26, letterSpacing: 8, textTransform: "uppercase", color: theme.accent }}>
          {total ? `Part ${index} of ${total}` : `Part ${index}`}
        </div>
        <div style={{ opacity: tO, transform: `translateY(${interpolate(tPop, [0, 1], [30, 0])}px)`, fontWeight: 700, fontSize: 108, letterSpacing: -3, color: theme.ink, marginTop: 26, maxWidth: 1400, lineHeight: 1.05 }}>
          {title}
        </div>
        <div style={{ width: ruleW, height: 7, borderRadius: 7, background: theme.accent, margin: "34px auto 0" }} />
        {sub ? <div style={{ opacity: sO, fontFamily: theme.fontText, fontWeight: 400, fontSize: 30, color: theme.inkSoft, marginTop: 28 }}>{sub}</div> : null}
      </div>
    </AbsoluteFill>
  );
};
