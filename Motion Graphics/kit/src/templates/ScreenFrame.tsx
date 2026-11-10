import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, spring, Easing, Img, staticFile, OffthreadVideo } from "remotion";
import { theme, APPLE_EASE, accentTint } from "../theme";
import { SFProFaces } from "../anim";
import { SfxAt } from "../Sfx";
import { BrowserFrame } from "../BrowserFrame";

/**
 * CUSTOM (hybrid) — a real page as proof. Fetched 1440-css-px screenshot in a
 * big browser frame, optional slow pan, and an accent ring that draws around
 * a region (page CSS px) with a label. The "look, it's really there" shot.
 */
export type Ring = { x: number; y: number; w: number; h: number; label?: string; labelSide?: "right" | "left" | "below" };
export type ScreenFrameProps = { kicker?: string; title?: string; shot?: string; video?: string; videoStartFrom?: number; url?: string; panTo?: number; ring?: Ring; ringAt?: number; ringUntil?: number; hold?: number; sound?: boolean };

const CSS_W = 1440, FW = 1600, SCALE = FW / CSS_W, FH = 760;
export const screenFrameDuration = (p: ScreenFrameProps) => (p.ringAt ?? 40) + 40 + (p.hold ?? 120);

export const ScreenFrame: React.FC<ScreenFrameProps> = ({ kicker, title, shot, video, videoStartFrom = 0, url, panTo = 0, ring, ringAt = 40, ringUntil, sound = true }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const endFade = interpolate(frame, [durationInFrames - 16, durationInFrames], [1, 0], { extrapolateLeft: "clamp" });
  const kO = interpolate(frame, [0, 16], [0, 1], { extrapolateRight: "clamp" });
  const fS = spring({ frame: frame - 6, fps, config: { damping: 200, mass: 1, stiffness: 90 } });
  const fO = interpolate(frame, [6, 22], [0, 1], { extrapolateRight: "clamp" });
  const pan = interpolate(frame, [20, durationInFrames - 20], [0, -panTo * SCALE], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.4, 0, 0.6, 1) });
  const draw = interpolate(frame, [ringAt, ringAt + 28], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(...APPLE_EASE) });
  const lO = interpolate(frame, [ringAt + 20, ringAt + 34], [0, 1], { extrapolateRight: "clamp" });
  const lS = spring({ frame: frame - (ringAt + 20), fps, config: { damping: 200, mass: 0.7, stiffness: 140 } });
  // a recording scrolls under the ring, so on video the ring lives only while its target is on screen
  const rUntil = ringUntil ?? (video ? ringAt + 55 : Infinity);
  const ringO = interpolate(frame, [rUntil, rUntil + 10], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const hasHead = !!(kicker || title);
  const frameTop = hasHead ? 232 : (1080 - FH - 54) / 2;

  return (
    <AbsoluteFill style={{ background: theme.paper, fontFamily: theme.fontDisplay, opacity: endFade }}>
      <SFProFaces />
      {sound ? (<>
        <SfxAt frame={6} name="whooshLong" volume={0.3} />
        <SfxAt frame={22} name="shutter" volume={0.4} />
        {ring ? <SfxAt frame={ringAt + 24} name="whoosh" volume={0.28} /> : null}
        {ring ? <SfxAt frame={ringAt + 22} name="chime" volume={0.4} /> : null}
      </>) : null}
      {hasHead ? (
        <div style={{ position: "absolute", top: 88, width: "100%", textAlign: "center", opacity: kO }}>
          {kicker ? <div style={{ fontFamily: theme.fontText, fontWeight: 600, fontSize: 24, letterSpacing: 6, textTransform: "uppercase", color: theme.accent }}>{kicker}</div> : null}
          {title ? <div style={{ fontWeight: 600, fontSize: 50, letterSpacing: -1.4, color: theme.ink, marginTop: 8 }}>{title}</div> : null}
        </div>
      ) : null}
      <div style={{ position: "absolute", left: (1920 - FW) / 2, top: frameTop, opacity: fO, transform: `translateY(${interpolate(fS, [0, 1], [48, 0])}px) scale(${interpolate(fS, [0, 1], [0.97, 1])})` }}>
        <BrowserFrame width={FW} height={FH + 54} url={url}>
          <div style={{ position: "absolute", left: 0, top: 0, width: FW, transform: `translateY(${pan}px)` }}>
            {video ? <OffthreadVideo src={staticFile(video)} startFrom={videoStartFrom} muted style={{ width: FW, display: "block" }} /> : shot ? <Img src={staticFile(shot)} style={{ width: FW, display: "block" }} /> : null}
            {ring ? (() => {
              const x = ring.x * SCALE - 14, y = ring.y * SCALE - 12, w = ring.w * SCALE + 28, h = ring.h * SCALE + 24;
              const side = ring.labelSide ?? "right";
              const lab: React.CSSProperties = side === "right" ? { left: x + w + 22, top: y + h / 2, transform: `translateY(-50%) translateX(${interpolate(lS, [0, 1], [-12, 0])}px)` }
                : side === "left" ? { right: FW - x + 22, top: y + h / 2, transform: `translateY(-50%) translateX(${interpolate(lS, [0, 1], [12, 0])}px)` }
                : { left: x, top: y + h + 18, transform: `translateY(${interpolate(lS, [0, 1], [-10, 0])}px)` };
              return (<>
                <svg style={{ position: "absolute", left: x, top: y, overflow: "visible", opacity: ringO }} width={w} height={h}>
                  <rect x={0} y={0} width={w} height={h} rx={16} fill={accentTint(0.06)} stroke={theme.accent} strokeWidth={5} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
                </svg>
                {ring.label ? <div style={{ position: "absolute", ...lab, opacity: lO * ringO, background: theme.ink, color: "#FFFFFF", borderRadius: 14, padding: "10px 18px", fontWeight: 600, fontSize: 24, letterSpacing: -0.4, whiteSpace: "nowrap", boxShadow: "0 12px 30px rgba(3,7,18,0.25)" }}>{ring.label}</div> : null}
              </>);
            })() : null}
          </div>
        </BrowserFrame>
      </div>
    </AbsoluteFill>
  );
};
