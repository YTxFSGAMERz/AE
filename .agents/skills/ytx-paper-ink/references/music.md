# Music

The bed is a written motif, not a generated song. FluidSynth was not on PATH. MusicGen was not installed on top of Chatterbox, because that stack pins transformers and torch. Do not add either unless the person asks and the pins above stay intact.

`scripts/motif.py` writes the bed.

- 44100 Hz, mono, length = spoken duration + 2.6 s hold.
- D natural minor tones, one every 1.75 s: 146.83, 220, 174.61, 220, 261.63, 196, 174.61, 146.83 Hz.
- A low D2 (73.42 Hz) on even steps.
- Exponential decay, about 2.4 s of tone, 2.2 s fade at the end.
- Peak 0.4. No drums, no vocal, no riser.

On the film the clip's volume lane is the level:

| When | Level |
| --- | --- |
| Open through the figure chapter | 0.16 |
| Across 2 seconds into the call | down to 0.05 |
| Through the call | 0.05 |
| Across 2 seconds into the checks | up to 0.13 |
| Through the end card | 0.13 |

`t` in the lane is seconds from the start of the clip. The clip starts at 0, so `t` is the film clock. Fade in 1.2 s, fade out 2.2 s.

Rebuild the motif when the film length changes. A bed that ends early leaves the last seconds dry.
