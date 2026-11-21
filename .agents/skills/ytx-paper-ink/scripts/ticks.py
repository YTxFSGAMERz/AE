"""Rebuild paper.wav, click.wav, and tone.wav next to this skill."""
from pathlib import Path

import numpy as np
import soundfile as sf

OUT = Path(__file__).resolve().parents[1] / "assets"
OUT.mkdir(parents=True, exist_ok=True)
sr = 44100


def write(name, wave):
    peak = float(np.max(np.abs(wave))) if wave.size else 0.0
    if peak > 0:
        wave = wave * (0.9 / peak)
    sf.write(OUT / name, wave.astype(np.float32), sr)
    print(name, round(len(wave) / sr, 3))


n = int(0.09 * sr)
t = np.arange(n) / sr
noise = np.random.default_rng(7).standard_normal(n)
env = np.exp(-t / 0.012) * (t < 0.07)
paper = np.convolve(noise * env, np.ones(40) / 40, mode="same")
write("paper.wav", paper[:n])

n = int(0.06 * sr)
t = np.arange(n) / sr
click = np.sin(2 * np.pi * 1400 * t) * np.exp(-t / 0.008)
click += 0.35 * np.sin(2 * np.pi * 2800 * t) * np.exp(-t / 0.004)
write("click.wav", click)

n = int(1.15 * sr)
t = np.arange(n) / sr
tone = np.sin(2 * np.pi * 73.42 * t) * np.exp(-t / 0.55)
tone += 0.2 * np.sin(2 * np.pi * 110.0 * t) * np.exp(-t / 0.4)
attack = np.minimum(t / 0.03, 1)
write("tone.wav", tone * attack)
