import React from "react";
import { interpolate, Easing, Img, staticFile } from "remotion";
import { LOGOS } from "./logos";
import { theme, APPLE_EASE } from "./theme";

/**
 * A fetched brand mark with draw-on motion: an ink outline traces every path
 * (multi-path safe), then the official full-colour SVG fades in underneath.
 * `t` = local frame since this mark's start. Ported from the news-reel LogoPlate.
 */
export const LogoMark: React.FC<{ slug: string; size: number; t: number; drawFrames?: number; mono?: boolean }> = ({ slug, size, t, drawFrames = 26, mono = false }) => {
  const L = LOGOS[slug];
  if (L?.png) {
    // raster-only mark (no clean SVG) — pop in instead of tracing
    const o = interpolate(t, [0, drawFrames * 0.5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
    const sc = interpolate(t, [0, drawFrames * 0.7], [0.8, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(...APPLE_EASE) });
    return <Img src={staticFile(L.png)} style={{ width: size, height: size, borderRadius: size * 0.22, opacity: o, transform: `scale(${sc})`, display: "block" }} />;
  }
  // Marks whose paths sit inside transformed/clipped groups can't be traced in
  // the root viewBox — pop them instead of drawing a scribble.
  const traceable = !!L && L.paths.length > 0 && !/transform=|clip-path=|<mask|<use/.test(L.svg);
  if (!L) return <div style={{ width: size, height: size, borderRadius: size / 4, background: "rgba(0,0,0,0.06)" }} />;
  const draw = traceable ? interpolate(t, [0, drawFrames], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(...APPLE_EASE) }) : 1;
  const fill = interpolate(t, traceable ? [drawFrames * 0.7, drawFrames * 1.35] : [0, drawFrames * 0.6], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const pop = interpolate(t, [0, drawFrames * 0.6], [0.86, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(...APPLE_EASE) });
  const vb = L.viewBox.split(/\s+/).map(Number);
  const unit = Math.max(vb[2] || 24, vb[3] || 24);
  const sw = unit / 80; // stroke follows the viewBox, not pixels
  return (
    <div style={{ position: "relative", width: size, height: size, transform: `scale(${pop})` }}>
      {/* official colour fill — the SVG as fetched, untouched */}
      <div
        style={{ position: "absolute", inset: 0, opacity: mono ? 0 : fill, lineHeight: 0 }}
        dangerouslySetInnerHTML={{ __html: L.svg.replace(/<svg\b/, `<svg style="width:100%;height:100%;display:block" preserveAspectRatio="xMidYMid meet"`) }}
      />
      {/* ink trace on top, fades as the fill arrives */}
      {traceable ? <svg viewBox={L.viewBox} width={size} height={size} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        {L.paths.map((p, i) => (
          <path key={i} d={p.d} fill={mono ? theme.ink : "none"} fillOpacity={mono ? fill : 0} stroke={theme.ink} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} opacity={1 - fill} />
        ))}
      </svg> : null}
    </div>
  );
};
