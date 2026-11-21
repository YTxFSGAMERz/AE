---
name: ytx-paper-ink
description: >
  Make or revise a YTxFSGAMERz explainer in the paper-and-ink theme used on
  "Are passkeys actually safe?" (HyperFrames, local Chatterbox, written music).
  Use when the user says YTxFSGAMERz, paper and ink, the passkey film, ytx-passkey,
  /ytx-paper-ink, or asks for another video in that exact design, voice, or mix.
---

# YTx paper and ink

This is the production theme for the channel. The worked film is `studio/hyperframes_projects/ytx-passkey`. The upload cut is `renders/are-passkeys-actually-safe-v6.mp4`. Do not overwrite `studio/hyperframes_projects/ytx-first/renders/the-wafer.mp4`.

Open one reference, then build. Do not restate these files inside the composition.

| Need | Read |
| --- | --- |
| Colors, type, windows, what is banned | `references/design.md` |
| What moves, and what must not float or vanish | `references/motion.md` |
| Failures from cuts v1–v6 | `references/lessons.md` |
| Local voice | `references/tts.md` |
| Ticks and the mix | `references/sound.md` |
| The bed | `references/music.md` |
| HyperFrames, GPU, ffmpeg, After Effects | `references/tools.md` |

## Before a full render

Snapshot the frames a person would complain about. A 6-minute render is not the way to discover an empty card. Look at the pictures. Then one delivery render:

```text
node "C:\Users\Admin\.agents\skills\hyperframes\scripts\plugin-cli.mjs" render --quality delivery --gpu -o renders\<name>.mp4
```

Run that from the project folder. PowerShell has no `&&`.

The voice is a local synthesizer. Say so. `narration.txt` is the script a person can record over. Measure the mix. Do not claim it was heard.
