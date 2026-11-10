import React from "react";
import { interpolate, Easing } from "remotion";
import { ICONS } from "./icons";
import { APPLE_EASE } from "./theme";
/**
 * Fetched Lucide icon (Iconify) rendered inline, recoloured via currentColor.
 * Pass `t` (local frame) to DRAW it on: every stroke traces in over `drawFrames`.
 */
export const Lucide: React.FC<{ name: string; size: number; color: string; strokeWidth?: number; t?: number; drawFrames?: number }> = ({ name, size, color, strokeWidth = 2, t, drawFrames = 22 }) => {
  const svg = ICONS[name];
  if (!svg) return null;
  let html = svg.replace(/width="\d+"/, `width="${size}"`).replace(/height="\d+"/, `height="${size}"`).replace(/stroke-width="[\d.]+"/g, `stroke-width="${strokeWidth}"`);
  if (t !== undefined) {
    const d = interpolate(t, [0, drawFrames], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(...APPLE_EASE) });
    html = html.replace(/<(path|circle|line|rect|polyline|polygon|ellipse)\b/g, `<$1 pathLength="1" stroke-dasharray="1" stroke-dashoffset="${1 - d}"`);
  }
  return <div style={{ color, lineHeight: 0, width: size, height: size }} dangerouslySetInnerHTML={{ __html: html }} />;
};
