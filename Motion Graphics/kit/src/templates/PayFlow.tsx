import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig, spring, Easing } from "remotion";
import { theme, APPLE_EASE, accentTint } from "../theme";
import { SFProFaces } from "../anim";
import { SfxAt, Land } from "../Sfx";
import { LogoMark } from "../LogoMark";
import { Lucide } from "../Lucide";

/**
 * CUSTOM (hybrid) — a "who pays" mechanism. Three nodes on a line (your user →
 * Puter → your app) with pulses travelling the path; under the middle node an
 * AI-balance meter fills with free credits, drains as the app is used, hits
 * empty, and the USER tops it up. Ends on the developer's card: manage nothing,
 * pay ₹0. Built for the Puter user-pays model but the nodes/labels are props.
 */
export type PayFlowProps = {
  kicker?: string; title?: string;
  user?: string; provider?: string; providerSlug?: string; app?: string;
  meterLabel?: string; freeLabel?: string; emptyLabel?: string; topupLabel?: string;
  youLabel?: string; youValue?: string; costLabel?: string; costValue?: string;
  hold?: number; sound?: boolean;
};
const T = { nodes: 18, links: 52, meter: 86, fill: 96, drain0: 140, drainStep: 26, empty: 232, topup: 252, refill: 262, card: 300 };
export const payFlowDuration = (p: PayFlowProps) => T.card + (p.hold ?? 110);

const Node: React.FC<{ x: number; y: number; t: number; label: string; children: React.ReactNode; hero?: boolean; fps: number }> = ({ x, y, t, label, children, hero, fps }) => {
  const s = spring({ frame: t, fps, config: { damping: 200, mass: 0.8, stiffness: 120 } });
  const o = interpolate(t, [0, 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const size = hero ? 190 : 160;
  return (
    <div style={{ position: "absolute", left: x - size / 2, top: y - size / 2, width: size, opacity: o, transform: `translateY(${interpolate(s, [0, 1], [22, 0])}px) scale(${interpolate(s, [0, 1], [0.9, 1])})`, textAlign: "center" }}>
      <div style={{ width: size, height: size, borderRadius: size * 0.28, background: "#FFFFFF", border: `${hero ? 2 : 1}px solid ${hero ? theme.accent : theme.hairline}`, boxShadow: "0 24px 60px rgba(3,7,18,0.10), 0 6px 18px rgba(3,7,18,0.06)", display: "flex", alignItems: "center", justifyContent: "center" }}>{children}</div>
      <div style={{ marginTop: 18, fontWeight: 600, fontSize: 30, letterSpacing: -0.8, color: theme.ink, whiteSpace: "nowrap" }}>{label}</div>
    </div>
  );
};

export const PayFlow: React.FC<PayFlowProps> = ({ kicker = "Who pays for the AI?", title = "Puter's user-pays model", user = "Your user", provider = "Puter", providerSlug = "puter", app = "Your app", meterLabel = "AI balance", freeLabel = "Free credits", emptyLabel = "Balance over", topupLabel = "User tops up · user pays", youLabel = "You manage", youValue = "Nothing.", costLabel = "Your AI bill", costValue = "₹0", sound = true }) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();
  const endFade = interpolate(frame, [durationInFrames - 16, durationInFrames], [1, 0], { extrapolateLeft: "clamp" });
  const kO = interpolate(frame, [0, 18], [0, 1], { extrapolateRight: "clamp" });
  const kY = interpolate(frame, [0, 18], [14, 0], { extrapolateRight: "clamp", easing: Easing.bezier(...APPLE_EASE) });
  const Y = 420, X = [400, 960, 1520];
  const ease = Easing.bezier(...APPLE_EASE);

  // connectors draw left→right
  const link1 = interpolate(frame, [T.links, T.links + 22], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
  const link2 = interpolate(frame, [T.links + 14, T.links + 36], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
  // balance: fill, then 3 drains, then empty, then refill
  const fillP = interpolate(frame, [T.fill, T.fill + 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
  const drains = [0, 1, 2].map((i) => interpolate(frame, [T.drain0 + i * T.drainStep + 10, T.drain0 + i * T.drainStep + 24], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease }));
  const refill = interpolate(frame, [T.refill, T.refill + 26], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });
  const level = Math.max(0, fillP - drains.reduce((a, d) => a + d, 0) / 3) * (1 - refill) + refill;
  const isEmpty = frame >= T.empty && frame < T.refill + 4;
  const emptyO = interpolate(frame, [T.empty, T.empty + 8, T.refill, T.refill + 8], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const freeO = interpolate(frame, [T.fill + 6, T.fill + 18, T.drain0, T.drain0 + 10], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const topO = interpolate(frame, [T.topup, T.topup + 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const topS = spring({ frame: frame - T.topup, fps, config: { damping: 200, mass: 0.8, stiffness: 130 } });
  const meterS = spring({ frame: frame - T.meter, fps, config: { damping: 200, mass: 0.8, stiffness: 120 } });
  const meterO = interpolate(frame, [T.meter, T.meter + 12], [0, 1], { extrapolateRight: "clamp" });
  const cardS = spring({ frame: frame - T.card, fps, config: { damping: 200, mass: 0.9, stiffness: 110 } });
  const cardO = interpolate(frame, [T.card, T.card + 14], [0, 1], { extrapolateRight: "clamp" });

  // pulses along provider → app while draining; one along user → provider on top-up
  const pulses = [0, 1, 2].map((i) => ({ p: interpolate(frame, [T.drain0 + i * T.drainStep, T.drain0 + i * T.drainStep + 20], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.4, 0, 0.6, 1) }), on: frame >= T.drain0 + i * T.drainStep && frame <= T.drain0 + i * T.drainStep + 20 }));
  const topPulse = { p: interpolate(frame, [T.topup, T.topup + 18], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }), on: frame >= T.topup && frame <= T.topup + 18 };
  const barColor = isEmpty ? theme.danger : theme.accent;

  return (
    <AbsoluteFill style={{ background: theme.paper, fontFamily: theme.fontDisplay, opacity: endFade }}>
      <SFProFaces />
      {sound ? (<>
        {[0, 1, 2].map((i) => <Land key={"n" + i} frame={T.nodes + i * 12} weight={i === 1 ? 0.8 : 0.45} />)}
        <SfxAt frame={T.links + 22} name="whoosh" volume={0.22} />
        <SfxAt frame={T.links + 36} name="whoosh" volume={0.22} />
        <SfxAt frame={T.fill} name="count" volume={0.26} maxFrames={30} />
        <SfxAt frame={T.fill + 8} name="chime" volume={0.35} />
        {[0, 1, 2].map((i) => <SfxAt key={"p" + i} frame={T.drain0 + i * T.drainStep + 20} name="pop" volume={0.28} />)}
        <SfxAt frame={T.empty} name="nope" volume={0.4} />
        <SfxAt frame={T.topup + 4} name="register" volume={0.45} />
        <SfxAt frame={T.card + 6} name="win" volume={0.45} />
      </>) : null}

      <div style={{ position: "absolute", top: 96, width: "100%", textAlign: "center", opacity: kO, transform: `translateY(${kY}px)` }}>
        <div style={{ fontFamily: theme.fontText, fontWeight: 600, fontSize: 24, letterSpacing: 6, textTransform: "uppercase", color: theme.accent }}>{kicker}</div>
        <div style={{ fontWeight: 600, fontSize: 54, letterSpacing: -1.5, color: theme.ink, marginTop: 10 }}>{title}</div>
      </div>

      {/* connectors */}
      <svg style={{ position: "absolute", left: 0, top: 0 }} width={1920} height={1080}>
        {[[X[0] + 95, X[1] - 110, link1], [X[1] + 110, X[2] - 95, link2]].map(([a, b, d], i) => (
          <g key={i}>
            <line x1={a} y1={Y} x2={a + (b - a) * (d as number)} y2={Y} stroke={theme.hairline} strokeWidth={6} strokeLinecap="round" />
            <line x1={a} y1={Y} x2={a + (b - a) * (d as number)} y2={Y} stroke={theme.accent} strokeWidth={3} strokeLinecap="round" opacity={0.6} />
          </g>
        ))}
        {pulses.map((pl, i) => pl.on ? <circle key={i} cx={X[1] + 110 + (X[2] - 95 - X[1] - 110) * pl.p} cy={Y} r={11} fill={theme.accent} /> : null)}
        {topPulse.on ? <circle cx={X[0] + 95 + (X[1] - 110 - X[0] - 95) * topPulse.p} cy={Y} r={11} fill="#16a34a" /> : null}
      </svg>

      <Node x={X[0]} y={Y} t={frame - T.nodes} label={user} fps={fps}><Lucide name="user-round" size={72} color={theme.accentDeep} t={frame - T.nodes} /></Node>
      <Node x={X[1]} y={Y} t={frame - T.nodes - 12} label={provider} fps={fps} hero><LogoMark slug={providerSlug} size={112} t={frame - T.nodes - 12} /></Node>
      <Node x={X[2]} y={Y} t={frame - T.nodes - 24} label={app} fps={fps}><Lucide name="app-window" size={72} color={theme.accentDeep} t={frame - T.nodes - 24} /></Node>

      {/* balance meter */}
      <div style={{ position: "absolute", left: X[1] - 280, top: 600, width: 560, opacity: meterO, transform: `translateY(${interpolate(meterS, [0, 1], [18, 0])}px)`, background: "#FFFFFF", border: `1px solid ${theme.hairline}`, borderRadius: 28, boxShadow: "0 22px 60px rgba(3,7,18,0.08)", padding: "24px 30px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontFamily: theme.fontText, fontWeight: 600, fontSize: 22, letterSpacing: 3, textTransform: "uppercase", color: theme.inkSoft }}>{meterLabel}</div>
          <div style={{ position: "relative", height: 34 }}>
            <div style={{ position: "absolute", right: 0, top: 0, opacity: freeO, background: accentTint(0.12), color: theme.accentDeep, borderRadius: 10, padding: "5px 12px", fontWeight: 600, fontSize: 20, whiteSpace: "nowrap" }}>{freeLabel}</div>
            <div style={{ position: "absolute", right: 0, top: 0, opacity: emptyO, background: "rgba(239,68,68,0.12)", color: theme.danger, borderRadius: 10, padding: "5px 12px", fontWeight: 600, fontSize: 20, whiteSpace: "nowrap" }}>{emptyLabel}</div>
          </div>
        </div>
        <div style={{ marginTop: 16, height: 22, borderRadius: 11, background: "rgba(0,0,0,0.06)", overflow: "hidden" }}>
          <div style={{ width: `${level * 100}%`, height: "100%", background: barColor, borderRadius: 11 }} />
        </div>
        <div style={{ marginTop: 12, fontWeight: 700, fontSize: 30, letterSpacing: -0.8, color: isEmpty ? theme.danger : theme.ink, fontVariantNumeric: "tabular-nums" }}>{Math.round(level * 100)}%</div>
      </div>
      {/* top-up chip above the user→provider link */}
      <div style={{ position: "absolute", left: (X[0] + X[1]) / 2 - 190, top: Y - 92, width: 380, textAlign: "center", opacity: topO, transform: `translateY(${interpolate(topS, [0, 1], [10, 0])}px)` }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "#16a34a", color: "#FFFFFF", borderRadius: 14, padding: "10px 18px", fontWeight: 600, fontSize: 24, whiteSpace: "nowrap", boxShadow: "0 12px 30px rgba(22,163,74,0.3)" }}><Lucide name="wallet" size={26} color="#FFFFFF" />{topupLabel}</div>
      </div>

      {/* developer card */}
      <div style={{ position: "absolute", left: 460, top: 800, width: 1000, height: 150, opacity: cardO, transform: `translateY(${interpolate(cardS, [0, 1], [24, 0])}px)`, background: "#0A0A0C", borderRadius: 30, display: "flex", alignItems: "center", justifyContent: "space-around", padding: "0 40px", boxShadow: "0 30px 80px rgba(3,7,18,0.25)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <Lucide name="circle-check" size={48} color={theme.accentOnDark} />
          <div><div style={{ fontFamily: theme.fontText, fontSize: 20, letterSpacing: 3, textTransform: "uppercase", color: "rgba(245,245,247,0.6)" }}>{youLabel}</div><div style={{ fontWeight: 700, fontSize: 46, letterSpacing: -1.5, color: "#F5F5F7" }}>{youValue}</div></div>
        </div>
        <div style={{ width: 1, height: 80, background: "rgba(255,255,255,0.14)" }} />
        <div><div style={{ fontFamily: theme.fontText, fontSize: 20, letterSpacing: 3, textTransform: "uppercase", color: "rgba(245,245,247,0.6)" }}>{costLabel}</div><div style={{ fontWeight: 700, fontSize: 60, letterSpacing: -2.5, color: theme.accentOnDark, fontVariantNumeric: "tabular-nums" }}>{costValue}</div></div>
      </div>
    </AbsoluteFill>
  );
};
