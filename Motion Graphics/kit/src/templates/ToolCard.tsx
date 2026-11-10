import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, spring, Easing, Img, staticFile } from "remotion";
import { theme, APPLE_EASE } from "../theme";
import { SFProFaces } from "../anim";
import { SfxAt } from "../Sfx";
import { LogoMark } from "../LogoMark";
import { BrowserFrame } from "../BrowserFrame";
import { DeviceFrame, DEVICE_SCREEN } from "../DeviceFrame";

/**
 * CUSTOM (hybrid) — a tool reveal. Left: the fetched official mark draws in,
 * name, tagline, then points (each may carry small marks; `struck` crosses
 * them out — "no Supabase bill"). Right: the tool's real website in a browser
 * frame, sliding in with a slow drift.
 */
export type ToolPoint = { text: string; sub?: string; logos?: string[]; struck?: boolean };
export type ToolCardProps = { kicker?: string; slug: string; name: string; tagline?: string; points: ToolPoint[]; shot: string; url?: string; device?: "browser" | "laptop" | "phone"; hold?: number; sound?: boolean };

const START = 14, POINT0 = 62, PSTEP = 34;
export const toolCardDuration = (p: ToolCardProps) => POINT0 + p.points.length * PSTEP + (p.hold ?? 120);

export const ToolCard: React.FC<ToolCardProps> = ({ kicker, slug, name, tagline, points, shot, url, device = "browser", sound = true }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const endFade = interpolate(frame, [durationInFrames - 16, durationInFrames], [1, 0], { extrapolateLeft: "clamp" });
  const kO = interpolate(frame, [0, 16], [0, 1], { extrapolateRight: "clamp" });
  const nS = spring({ frame: frame - (START + 10), fps, config: { damping: 200, mass: 0.9, stiffness: 110 } });
  const nO = interpolate(frame, [START + 10, START + 24], [0, 1], { extrapolateRight: "clamp" });
  const fS = spring({ frame: frame - (START + 6), fps, config: { damping: 200, mass: 1, stiffness: 90 } });
  const fO = interpolate(frame, [START + 6, START + 22], [0, 1], { extrapolateRight: "clamp" });
  const drift = interpolate(frame, [0, durationInFrames], [0, -46], { easing: Easing.bezier(0.3, 0, 0.7, 1) });
  const FW = 880, FH = 640;

  return (
    <AbsoluteFill style={{ background: theme.paper, fontFamily: theme.fontDisplay, opacity: endFade }}>
      <SFProFaces />
      {sound ? (<>
        <SfxAt frame={START + 8} name="notify" volume={0.45} />
        <SfxAt frame={START + 14} name="whooshLong" volume={0.25} />
        {points.map((_, i) => <SfxAt key={i} frame={POINT0 + i * PSTEP} name="pop" volume={0.32} />)}
        {points.map((pt, i) => pt.struck ? <SfxAt key={"x" + i} frame={POINT0 + i * PSTEP + 28} name="nope" volume={0.4} /> : null)}
      </>) : null}

      <div style={{ position: "absolute", left: 140, top: 150, width: 760 }}>
        {kicker ? <div style={{ opacity: kO, fontFamily: theme.fontText, fontWeight: 600, fontSize: 24, letterSpacing: 6, textTransform: "uppercase", color: theme.accent }}>{kicker}</div> : null}
        <div style={{ display: "flex", alignItems: "center", gap: 34, marginTop: 34 }}>
          <div style={{ width: 150, height: 150, borderRadius: 40, background: "#FFFFFF", border: `1px solid ${theme.hairline}`, boxShadow: "0 22px 60px rgba(3,7,18,0.10)", display: "flex", alignItems: "center", justifyContent: "center", flex: "0 0 150px" }}>
            <LogoMark slug={slug} size={96} t={frame - START} drawFrames={34} />
          </div>
          <div style={{ opacity: nO, transform: `translateY(${interpolate(nS, [0, 1], [20, 0])}px)` }}>
            <div style={{ fontWeight: 700, fontSize: 76, letterSpacing: -3, color: theme.ink, lineHeight: 1.02, whiteSpace: "nowrap" }}>{name}</div>
            {tagline ? <div style={{ fontFamily: theme.fontText, fontSize: 28, color: theme.inkSoft, marginTop: 8 }}>{tagline}</div> : null}
          </div>
        </div>

        <div style={{ marginTop: 56, display: "flex", flexDirection: "column", gap: 26 }}>
          {points.map((pt, i) => {
            const b = POINT0 + i * PSTEP;
            const s = spring({ frame: frame - b, fps, config: { damping: 200, mass: 0.8, stiffness: 120 } });
            const o = interpolate(frame, [b, b + 14], [0, 1], { extrapolateRight: "clamp" });
            const strike = interpolate(frame, [b + 26, b + 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(...APPLE_EASE) });
            return (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 22, opacity: o, transform: `translateX(${interpolate(s, [0, 1], [-22, 0])}px)` }}>
                <div style={{ width: 10, height: 10, borderRadius: 5, background: theme.accent, flex: "0 0 10px" }} />
                {pt.logos?.length ? (
                  <div style={{ position: "relative", display: "flex", gap: 10, opacity: pt.struck ? 1 - strike * 0.5 : 1 }}>
                    {pt.logos.map((l, k) => (
                      <div key={l} style={{ width: 58, height: 58, borderRadius: 17, background: "#FFFFFF", border: `1px solid ${theme.hairline}`, boxShadow: "0 8px 22px rgba(3,7,18,0.08)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <LogoMark slug={l} size={34} t={frame - (b + 4 + k * 7)} />
                      </div>
                    ))}
                    {pt.struck ? <div style={{ position: "absolute", left: -6, top: "50%", height: 5, width: `calc(${strike * 100}% + 12px)`, background: theme.danger, borderRadius: 3, transform: "rotate(-8deg)", transformOrigin: "left center" }} /> : null}
                  </div>
                ) : null}
                <div>
                  <div style={{ fontWeight: 600, fontSize: 34, letterSpacing: -0.9, color: theme.ink }}>{pt.text}</div>
                  {pt.sub ? <div style={{ fontFamily: theme.fontText, fontSize: 22, color: theme.inkSoft, marginTop: 2 }}>{pt.sub}</div> : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ position: "absolute", left: 960, top: (1080 - FH) / 2, opacity: fO, transform: `translateX(${interpolate(fS, [0, 1], [70, 0])}px) translateY(${interpolate(fS, [0, 1], [20, 0])}px)` }}>
        {device === "browser" ? (
          <BrowserFrame width={FW} height={FH} url={url}>
            <Img src={staticFile(shot)} style={{ width: FW, display: "block", transform: `translateY(${drift}px)` }} />
          </BrowserFrame>
        ) : (
          <div style={{ transform: device === "laptop" ? "scale(0.72)" : "scale(0.8)", transformOrigin: "top left", marginLeft: device === "phone" ? 220 : 0 }}>
            <DeviceFrame kind={device}>
              <Img src={staticFile(shot)} style={{ width: DEVICE_SCREEN[device].w, display: "block", transform: `translateY(${drift}px)` }} />
            </DeviceFrame>
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
