# Tools

Work from the HyperFrames project folder. On this machine that film is:

`C:\Users\Admin\Documents\GitHub\AE\studio\hyperframes_projects\ytx-passkey`

The CLI, every time:

```text
node "C:\Users\Admin\.agents\skills\hyperframes\scripts\plugin-cli.mjs"
```

Do not upgrade it in the middle of a film. PowerShell 5.1 has no `&&`. Chain with `;`.

## Picture

| Job | Command |
| --- | --- |
| Still frames | `snapshot --at 28,105,223,262` |
| Delivery | `render --quality delivery --gpu -o renders\<name>.mp4` |
| Loudness | `audio renders\<name>.mp4 --only loudness --json` |

`--gpu` is NVENC encode. The browser captures on the RTX 3050 when Chrome's GPU probe reports `NVIDIA GeForce RTX 3050`. `--chroma-subsampling 444` is rejected with `--gpu`. A flat paper film encodes small. Check a frame before calling the type soft. Screenshot capture is what completed. The experimental fast path turned itself off.

`ffmpeg` and `ffprobe` are on PATH. Scene changes:

```text
ffmpeg -i film.mp4 -vf "select='gt(scene,0.008)',showinfo" -f null -
```

A gap over a second at that threshold means the large shapes did not move. A 28 px mark will not close the gap. Grab the complained-about times with `-ss` and look at the png.

## Clocks

`scripts/speak.py` writes `times.json` with `start` and `dur` per paragraph. Bake those into `data-start`, `data-duration`, and `const B` before rendering. If the narration text does not change, do not re-speak. Changing a picture does not require a new voice.

## GPU

NVIDIA GeForce RTX 3050 6GB Laptop GPU, PCI device 25AC. Encode and the voice both use it. Do not run a render while Chatterbox is generating. The AMD iGPU is not the capture device for this channel.

## After Effects

After Effects 2026 is installed. `AfterFX.exe -r` and `AfterFX.com -r` did not execute the cold-open script. There is no `.aep`. HyperFrames is the finish. Do not retry After Effects unless the person asks.

## What not to touch

- `ytx-first\renders\the-wafer.mp4`
- A finished mp4, when making a new cut. Write `vN+1`.
- torch, if the only goal is a new picture.
