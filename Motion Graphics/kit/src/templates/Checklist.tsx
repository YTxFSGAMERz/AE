import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, spring, Easing } from "remotion";
import { theme, APPLE_EASE, accentTint } from "../theme";
import { SFProFaces } from "../anim";
import { SfxAt } from "../Sfx";

export type CheckItem = { title: string; sub?: string };
export type ChecklistProps = {
  kicker?: string;
  title?: string;
  items: CheckItem[];
  sound?: boolean; // tick per check + chime at the end
};

const START = 26, STAG = 32;
export const checklistDuration = (p: ChecklistProps) => START + p.items.length * STAG + 120;

export const Checklist: React.FC<ChecklistProps> = ({ kicker, title, items, sound = false }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const n = items.length;

  const kO = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: "clamp" });
  const kY = interpolate(frame, [0, 18], [14, 0], { extrapolateRight: "clamp", easing: Easing.bezier(...APPLE_EASE) });
  const endFade = interpolate(frame, [durationInFrames - 16, durationInFrames], [1, 0], { extrapolateLeft: "clamp" });

  const rowH = items.some((i) => i.sub) ? 118 : 96;
  const listH = n * rowH;
  const headerH = kicker || title ? 120 : 0;
  const top = (1080 - listH - headerH) / 2 + headerH;

  return (
    <AbsoluteFill style={{ background: theme.paper, fontFamily: theme.fontDisplay, opacity: endFade }}>
      <SFProFaces />
      {sound ? (
        <>
          {items.map((_, i) => (
            <SfxAt key={i} frame={START + i * STAG + 8} name="tick" volume={0.35} />
          ))}
          <SfxAt frame={START + n * STAG + 14} name="chime" volume={0.3} />
        </>
      ) : null}

      {kicker || title ? (
        <div style={{ position: "absolute", top: top - headerH - 40, width: "100%", textAlign: "center", opacity: kO, transform: `translateY(${kY}px)` }}>
          {kicker ? <div style={{ fontFamily: theme.fontText, fontWeight: 600, fontSize: 24, letterSpacing: 6, textTransform: "uppercase", color: theme.accent }}>{kicker}</div> : null}
          {title ? <div style={{ fontWeight: 600, fontSize: 58, letterSpacing: -1.5, color: theme.ink, marginTop: 12 }}>{title}</div> : null}
        </div>
      ) : null}

      <div style={{ position: "absolute", top, left: "50%", transform: "translateX(-50%)", width: 1040 }}>
        {items.map((item, i) => {
          const b = START + i * STAG;
          const rowO = interpolate(frame, [b, b + 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const rowX = interpolate(frame, [b, b + 14], [40, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(...APPLE_EASE) });
          const boxPop = spring({ frame: frame - (b + 6), fps, config: { damping: 12, mass: 0.5, stiffness: 190 } });
          const checkDraw = interpolate(frame, [b + 8, b + 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(...APPLE_EASE) });
          const checked = frame >= b + 6;
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 34, height: rowH, opacity: rowO, transform: `translateX(${rowX}px)` }}>
              <div
                style={{
                  width: 62, height: 62, borderRadius: 20, flexShrink: 0,
                  transform: `scale(${checked ? 0.8 + boxPop * 0.2 : 1})`,
                  background: checked ? theme.accent : "transparent",
                  border: checked ? "none" : `3px solid ${theme.hairline}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: checked ? "0 10px 28px ${accentTint(0.30)}" : "none",
                }}
              >
                <svg width={34} height={28} viewBox="0 0 34 28">
                  <path
                    d="M 3 15 L 12.5 24 L 31 4"
                    fill="none" stroke="#fff" strokeWidth={5.5} strokeLinecap="round" strokeLinejoin="round"
                    pathLength={1} strokeDasharray={1} strokeDashoffset={1 - checkDraw}
                  />
                </svg>
              </div>
              <div>
                <div style={{ fontWeight: 600, fontSize: 44, letterSpacing: -0.8, color: theme.ink, whiteSpace: "nowrap" }}>{item.title}</div>
                {item.sub ? <div style={{ fontFamily: theme.fontText, fontWeight: 400, fontSize: 25, color: theme.inkSoft, marginTop: 4 }}>{item.sub}</div> : null}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
