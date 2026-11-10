import React from "react";
import { interpolate, useCurrentFrame, useVideoConfig, spring, Easing } from "remotion";
import { theme, APPLE_EASE } from "../theme";
import { Overlay, chipStyle, OverlayPos } from "../Overlay";
import { SfxAt } from "../Sfx";

export type CaptionPopProps = {
  text: string;         // 2–5 punchy words — the line they just said
  emphasis?: string;    // substring rendered in accent
  emoji?: string;       // optional emoji shown before the text
  position?: OverlayPos;
  hold?: number;        // extra frames to hold on screen
  sound?: boolean;
};

export const captionPopDuration = (p: CaptionPopProps) => 80 + (p.hold ?? 30);

export const CaptionPop: React.FC<CaptionPopProps> = ({ text, emphasis, emoji, position = "bottom", hold: _hold, sound = false }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const pop = spring({ frame, fps, config: { damping: 12, mass: 0.6, stiffness: 160 } });
  const rot = interpolate(pop, [0, 1], [-2.5, 0]);
  const underW = interpolate(frame, [14, 30], [0, 100], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(...APPLE_EASE) });

  let pre = text, mid = "", post = "";
  if (emphasis && text.includes(emphasis)) {
    const i = text.indexOf(emphasis);
    pre = text.slice(0, i); mid = emphasis; post = text.slice(i + emphasis.length);
  }

  return (
    <Overlay position={position}>
      {sound ? <SfxAt frame={2} name="pop" volume={0.4} /> : null}
      <div style={{ ...chipStyle, transform: `scale(${0.7 + pop * 0.3}) rotate(${rot}deg)`, padding: "36px 60px", display: "flex", alignItems: "center", gap: 28, fontFamily: theme.fontDisplay }}>
        {emoji ? <span style={{ fontSize: 76, lineHeight: 1 }}>{emoji}</span> : null}
        <div>
          <div style={{ fontWeight: 700, fontSize: 72, letterSpacing: -1.8, color: theme.ink, whiteSpace: "nowrap", lineHeight: 1.1 }}>
            {pre}
            {mid ? <span style={{ color: theme.accent }}>{mid}</span> : null}
            {post}
          </div>
          <div style={{ width: `${underW}%`, height: 7, borderRadius: 7, background: theme.accent, marginTop: 10 }} />
        </div>
      </div>
    </Overlay>
  );
};
