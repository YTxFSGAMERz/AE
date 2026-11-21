"""Write the D-minor bed. Usage: py -3.12 motif.py <seconds> <out.wav>"""
import sys
from pathlib import Path

import numpy as np
import soundfile as sf

seconds = float(sys.argv[1]) if len(sys.argv) > 1 else 60.0
out = Path(sys.argv[2]) if len(sys.argv) > 2 else Path("motif.wav")

sr = 44100
n = int(seconds * sr)
mix = np.zeros(n, dtype=np.float64)
high = [146.83, 220.00, 174.61, 220.00, 261.63, 196.00, 174.61, 146.83]


def tone(freq, start, amp, decay):
    i0 = int(start * sr)
    length = int(2.4 * sr)
    i1 = min(n, i0 + length)
    if i0 >= n:
        return
    local = np.arange(i1 - i0) / sr
    env = np.exp(-local / decay) * (1 - np.exp(-local / 0.018))
    wave = (
        np.sin(2 * np.pi * freq * local)
        + 0.28 * np.sin(2 * np.pi * freq * 2.003 * local)
        + 0.08 * np.sin(2 * np.pi * freq * 3.01 * local)
    )
    mix[i0:i1] += amp * env * wave


i = 0
start = 0.2
while start < seconds - 1.5:
    tone(high[i % len(high)], start, 0.22, 1.15)
    if i % 2 == 0:
        tone(73.42, start, 0.11, 1.4)
    i += 1
    start += 1.75

fade = int(2.2 * sr)
if fade < n:
    mix[-fade:] *= np.linspace(1, 0, fade)
peak = float(np.max(np.abs(mix))) if mix.size else 0.0
if peak > 0:
    mix *= 0.4 / peak
sf.write(out, mix.astype(np.float32), sr)
print(out, round(n / sr, 2), "peak", round(float(np.max(np.abs(mix))), 3))
