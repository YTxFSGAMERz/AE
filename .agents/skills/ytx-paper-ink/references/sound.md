# Sound

Three ticks, written in numpy, not a catalog. The wavs are in `assets/` next to this skill. `scripts/ticks.py` rebuilds them.

| File | Length | What it is | Volume on the film |
| --- | --- | --- | --- |
| `paper.wav` | 0.09 s | Noise burst, decay 0.012 s, seed 7 | 0.40–0.45, when a sheet lands |
| `click.wav` | 0.06 s | 1400 Hz plus a 2800 Hz partial | 0.35, when a key or a row arrives |
| `tone.wav` | 1.15 s | D2 73.42 Hz plus a quiet A2, slow decay | 0.28, once, when the call becomes two columns |

They share one audio lane because they do not overlap. Each clip has an id, `class="clip"`, `data-start`, `data-duration`, `data-track-index`, `data-volume`. No `crossorigin`. No GSAP volume tween on a clip that also has a volume lane.

Do not put a whoosh on every cut. The progress rule is silent.

## Mix

Voice on its own lane at `data-volume="1"`, fade in 0.05 s, fade out 0.2 s. The bed is a different lane. A volume lane multiplies `data-volume`, so the bed's `data-volume` stays 1 and the lane holds the level.

Targets, measured on the rendered file, not by ear:

- Integrated loudness about −16 LUFS. The passkey cuts landed at −16.3 to −16.4.
- True peak −1.0 dBTP.
- Clipping count 0.
- Mean volume around −19.5 dB.

```text
node "<plugin-cli>" audio renders\<film>.mp4 --only loudness --json
```

Say the mix was measured and not heard. If the bed buries the voice or the peak clips, fix the lane and render once.
