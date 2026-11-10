import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, spring, Easing } from "remotion";
import { theme, APPLE_EASE, accentTint } from "../theme";
import { SFProFaces } from "../anim";

export type Step = { title: string; sub?: string };
export type StepFlowProps = {
  kicker?: string;
  title?: string;
  steps: Step[];
};

const START = 30, STAG = 26;
export const stepFlowDuration = (p: StepFlowProps) => START + p.steps.length * STAG + 130;

export const StepFlow: React.FC<StepFlowProps> = ({ kicker, title, steps }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const n = steps.length;

  const y = 560, node = 104;
  const totalW = Math.min(1560, n * 420);
  const startX = (1920 - totalW) / 2;
  const dx = n > 1 ? totalW / (n - 1) : 0;
  const xs = steps.map((_, i) => (n > 1 ? startX + i * dx : 960));

  const kO = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: "clamp" });
  const kY = interpolate(frame, [0, 18], [14, 0], { extrapolateRight: "clamp", easing: Easing.bezier(...APPLE_EASE) });
  const endFade = interpolate(frame, [durationInFrames - 16, durationInFrames], [1, 0], { extrapolateLeft: "clamp" });

  // accent line flows left → right, arriving at node i at frame START + i*STAG
  const lineP = interpolate(frame, [START, START + (n - 1) * STAG], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

  return (
    <AbsoluteFill style={{ background: theme.paper, fontFamily: theme.fontDisplay, opacity: endFade }}>
      <SFProFaces />
      <div style={{ position: "absolute", top: 170, width: "100%", textAlign: "center", opacity: kO, transform: `translateY(${kY}px)` }}>
        {kicker ? <div style={{ fontFamily: theme.fontText, fontWeight: 600, fontSize: 24, letterSpacing: 6, textTransform: "uppercase", color: theme.accent }}>{kicker}</div> : null}
        {title ? <div style={{ fontWeight: 600, fontSize: 58, letterSpacing: -1.5, color: theme.ink, marginTop: 12 }}>{title}</div> : null}
      </div>

      {n > 1 ? (
        <>
          <div style={{ position: "absolute", left: xs[0], top: y - 2, width: totalW, height: 4, borderRadius: 4, background: theme.hairline }} />
          <div style={{ position: "absolute", left: xs[0], top: y - 2, width: totalW * lineP, height: 4, borderRadius: 4, background: theme.accent }} />
        </>
      ) : null}

      {steps.map((s, i) => {
        const b = START + i * STAG;
        const popIn = spring({ frame: frame - b, fps, config: { damping: 14, mass: 0.6, stiffness: 150 } });
        const on = frame >= b;
        const tO = interpolate(frame, [b + 6, b + 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        const tY = interpolate(frame, [b + 6, b + 20], [14, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(...APPLE_EASE) });
        return (
          <div key={i} style={{ position: "absolute", left: xs[i] - 210, top: y - node / 2, width: 420, display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div
              style={{
                width: node, height: node, borderRadius: node,
                transform: `scale(${0.5 + popIn * 0.5})`,
                background: on ? theme.accent : theme.paper,
                border: on ? "none" : `3px solid ${theme.hairline}`,
                boxShadow: on ? "0 12px 34px ${accentTint(0.35)}" : "none",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: on ? "#fff" : theme.inkSoft, fontWeight: 700, fontSize: 44, fontVariantNumeric: "tabular-nums",
              }}
            >
              {i + 1}
            </div>
            <div style={{ opacity: tO, transform: `translateY(${tY}px)`, marginTop: 30, textAlign: "center" }}>
              <div style={{ fontWeight: 600, fontSize: 38, letterSpacing: -0.5, color: theme.ink, whiteSpace: "nowrap" }}>{s.title}</div>
              {s.sub ? <div style={{ fontFamily: theme.fontText, fontWeight: 400, fontSize: 25, color: theme.inkSoft, marginTop: 8, lineHeight: 1.35, maxWidth: 360 }}>{s.sub}</div> : null}
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
