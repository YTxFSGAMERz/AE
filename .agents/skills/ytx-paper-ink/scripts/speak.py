"""Speak a blank-line narration with the paper-ink performance table.

Usage: py -3.12 speak.py <narration.txt> <out-dir>
Writes narration.wav, line-01.wav ..., and times.json in out-dir.
Cache wavs live in out-dir/cache, keyed by text plus settings.
"""
import hashlib
import json
import sys
from pathlib import Path

import numpy as np
import soundfile as sf

# exaggeration, cfg, temperature, breath after, peak
DEFAULT = (0.40, 0.42, 0.66, 0.38, 0.84)
RULES = [
    ("Are passkeys actually safe?", (0.34, 0.50, 0.58, 1.15, 0.76)),
    ("The passkey worked.", (0.42, 0.44, 0.64, 0.85, 0.82)),
    ("Across the large services", (0.52, 0.38, 0.70, 0.34, 0.92)),
    ("Those sign-ins succeed", (0.50, 0.38, 0.70, 0.32, 0.92)),
    ("And they're quicker.", (0.52, 0.38, 0.72, 0.32, 0.92)),
    ("Read the speed", (0.32, 0.48, 0.62, 0.50, 0.74)),
    ("Because the callers moved.", (0.36, 0.46, 0.62, 0.55, 0.78)),
    ("The call sounds like IT.", (0.34, 0.46, 0.62, 0.58, 0.78)),
    ("A password can be typed", (0.52, 0.38, 0.70, 0.20, 0.90)),
]


def style_for(para):
    for prefix, style in RULES:
        if para.startswith(prefix):
            return style
    return DEFAULT


def digest_for(para, style):
    raw = "v3|" + para + "|" + "|".join(str(x) for x in style)
    return hashlib.sha1(raw.encode("utf-8")).hexdigest()[:16]


def main():
    src = Path(sys.argv[1])
    out = Path(sys.argv[2])
    cache = out / "cache"
    cache.mkdir(parents=True, exist_ok=True)
    paras = [p.strip() for p in src.read_text(encoding="utf-8").split("\n\n") if p.strip()]
    print("paragraphs", len(paras), flush=True)

    missing = [p for p in paras if not (cache / f"{digest_for(p, style_for(p))}.wav").exists()]
    print("missing", len(missing), flush=True)
    if missing:
        import torch
        from chatterbox.tts import ChatterboxTTS

        device = "cuda" if torch.cuda.is_available() else "cpu"
        print("device", device, flush=True)
        model = ChatterboxTTS.from_pretrained(device=device)
        for n, para in enumerate(missing, 1):
            exag, cfg, temp, _breath, _peak = style_for(para)
            print(f"new {n}/{len(missing)}", para[:60], flush=True)
            wav = model.generate(para, exaggeration=exag, cfg_weight=cfg, temperature=temp)
            audio = wav.squeeze().detach().cpu().numpy().astype(np.float32)
            sf.write(cache / f"{digest_for(para, style_for(para))}.wav", audio, model.sr)

    pieces = []
    times = []
    cursor = 0.55
    sr = None
    for i, para in enumerate(paras, 1):
        style = style_for(para)
        _ex, _cfg, _temp, breath, target = style
        audio, file_sr = sf.read(cache / f"{digest_for(para, style)}.wav", dtype="float32")
        if audio.ndim > 1:
            audio = audio[:, 0]
        if sr is None:
            sr = file_sr
            pieces.append(np.zeros(int(0.55 * sr), dtype=np.float32))
        peak = float(np.max(np.abs(audio))) if audio.size else 0.0
        if peak > 0.001:
            audio *= target / peak
        dur = audio.size / sr
        times.append({"i": i, "start": round(cursor, 3), "dur": round(dur, 3), "text": para})
        pieces.append(audio)
        sf.write(out / f"line-{i:02d}.wav", audio, sr)
        cursor += dur
        if i != len(paras):
            pieces.append(np.zeros(int(breath * sr), dtype=np.float32))
            cursor += breath

    full = np.concatenate(pieces)
    peak = float(np.max(np.abs(full))) if full.size else 0.0
    if peak > 0.92:
        full *= 0.92 / peak
    elif 0 < peak < 0.8:
        full *= 0.86 / peak
    sf.write(out / "narration.wav", full, sr)
    (out / "times.json").write_text(
        json.dumps({"sr": sr, "total": round(full.size / sr, 3), "device": "cuda", "lines": times}, indent=2),
        encoding="utf-8",
    )
    print("TOTAL", round(full.size / sr, 3), flush=True)


if __name__ == "__main__":
    main()
