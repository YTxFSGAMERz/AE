import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, Easing } from "remotion";
import { APPLE_EASE } from "./theme";

/**
 * Stage — wraps every composition (see Root.tsx) so each shot gets, without
 * touching the template:
 *   idle life   — a slow 2.5% push-in over the whole clip so a held frame never freezes
 *   enter/exit  — variants the director picks per shot so consecutive cuts don't repeat:
 *                 fade (default) · rise · scale · wipe (left→right mask) · none
 * All three are props on the shot's JSON: { "enter": "wipe", "exit": "fade", "idle": 0.03 }
 */
export type StageProps = { enter?: "fade" | "rise" | "scale" | "wipe" | "none"; exit?: "fade" | "wipe" | "none"; idle?: boolean | number };
const IN = 18, OUT = 16;

export function withStage<P extends object>(C: React.FC<P>, opts: { overlay?: boolean } = {}): React.FC<P & StageProps> {
  const Wrapped: React.FC<P & StageProps> = (props) => {
    const { enter = "fade", exit = "fade", idle = !opts.overlay, ...rest } = props as StageProps & P;
    const frame = useCurrentFrame();
    const { durationInFrames } = useVideoConfig();
    const ease = Easing.bezier(...APPLE_EASE);
    const pIn = interpolate(frame, [0, IN], [0, 1], { extrapolateRight: "clamp", easing: ease });
    const pOut = interpolate(frame, [durationInFrames - OUT, durationInFrames], [0, 1], { extrapolateLeft: "clamp", easing: ease });
    const amount = typeof idle === "number" ? idle : idle ? 0.025 : 0;
    const push = 1 + amount * (frame / Math.max(1, durationInFrames));
    const st: React.CSSProperties = { transformOrigin: "50% 50%" };
    let scale = push, y = 0, opacity = 1, clip: string | undefined;
    if (enter === "rise") { y += (1 - pIn) * 40; opacity *= pIn; }
    if (enter === "scale") { scale *= 1.05 - 0.05 * pIn; opacity *= pIn; }
    if (enter === "wipe") clip = `inset(0 ${(1 - pIn) * 100}% 0 0)`;
    if (enter === "fade" && opts.overlay === true) opacity *= 1; // overlays already spring in; leave them
    if (exit === "wipe") clip = `inset(0 0 0 ${pOut * 100}%)`;
    if (exit === "fade" && opts.overlay) opacity *= 1; // templates carry their own 16f fade
    st.transform = `scale(${scale}) translateY(${y}px)`; st.opacity = opacity; if (clip) st.clipPath = clip;
    return (
      <AbsoluteFill style={{ backgroundColor: "transparent" }}>
        <AbsoluteFill style={st}><C {...(rest as P)} /></AbsoluteFill>
      </AbsoluteFill>
    );
  };
  Wrapped.displayName = `Stage(${C.displayName ?? C.name})`;
  return Wrapped;
}
