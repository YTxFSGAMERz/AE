import React from "react";
import { Audio, Sequence, staticFile, useVideoConfig } from "remotion";
import { SFX_LIB } from "./sfxlib";
import { SFX_PACK } from "./sfxpack";

export type SfxName = string; // a ROLE from sfxpack, a key from the library, or a bundled name (pop|whoosh|chime|tick)

const pick = (name: string, frame: number) => {
  const v = SFX_PACK[name];
  if (!v) return name;
  if (typeof v === "string") return v;
  return v[Math.abs(Math.round(frame * 7 + name.length)) % v.length]; // deterministic rotation
};

/**
 * One-shot sound at a frame. Resolves role → library file (rotating variants).
 * `align:"peak"` shifts the clip so its loudest moment lands ON the frame (auto for
 * whoosh/riser/strike); `maxFrames` cuts long effects to the visual they accompany;
 * `weight` (0–1) scales volume by importance so a list row is quieter than a total.
 */
export const SfxAt: React.FC<{ frame: number; name: SfxName; volume?: number; weight?: number; align?: "onset" | "peak"; maxFrames?: number }> = ({ frame, name, volume = 0.4, weight = 1, align, maxFrames }) => {
  const { fps } = useVideoConfig();
  const key = pick(name, frame);
  const info = SFX_LIB[key];
  const isRise = /whoosh|swoosh|riser|build|strike|body/.test(name) || /whoosh|swoosh|riser|build/.test(key);
  const mode = align ?? (isRise ? "peak" : "onset");
  const src = info ? info.file : `sfx/${key}.wav`;
  const lenFrames = info ? Math.ceil(info.seconds * fps) + 2 : 30;
  const shift = info && mode === "peak" ? Math.round(info.peakAt * fps) : 0;
  const from = Math.round(frame) - shift;
  const startFrom = from < 0 ? -from : 0;
  const dur = Math.max(1, Math.min(lenFrames - startFrom, maxFrames ?? Infinity));
  const vol = Math.max(0, Math.min(1, volume * (0.55 + 0.45 * weight)));
  return (
    <Sequence from={Math.max(0, from)} durationInFrames={dur} layout="none">
      <Audio src={staticFile(src)} volume={vol} startFrom={startFrom} />
    </Sequence>
  );
};

/** A "landing": tick scaled by weight, plus a soft body whoosh under heavy lands (weight ≥ 0.7). */
export const Land: React.FC<{ frame: number; weight?: number; name?: SfxName }> = ({ frame, weight = 0.5, name = "tick" }) => (
  <>
    <SfxAt frame={frame} name={name} volume={0.36} weight={weight} />
    {weight >= 0.7 ? <SfxAt frame={frame} name="body" volume={0.12 + 0.12 * weight} /> : null}
  </>
);
