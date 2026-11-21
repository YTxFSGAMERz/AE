# SPEC — The Wafer

GOAL: A stranger can say why a desktop memory kit costs several times what it did. The same wafer now feeds AI memory, and that memory takes about three times the wafer per bit.
OUTPUT: HyperFrames, 1920×1080, 30 fps. Local render only. No HeyGen, no cloud render.
TIME: 57.340 s. The narration wav is 54.239 s. A 0.45 s breath sits between the six lines, and the end card holds after one more breath. The voice is the clock. Music sits under it.

LOOK:
- Medium: a copy-stand photograph. One oak bench, one tungsten lamp from the left, a hard shadow to the right. The empty shop is the same light in a different room.
- Plates, full bleed, cropped past the corner mark: assets/box.jpg, box-peel.jpg, box-now.jpg, chip.jpg, wafer.jpg, split.jpg, shelf.jpg, desk.jpg.
- Type is a lower third on a solid ink bar, #f3efe6 on #16130f at 86% opacity. Roboto 700. The figure is 72 px. The line under it is 36 px. Never a full-frame poster. Never orange type.
- Orange exists only inside the photographs: the blank price sticker, the tape on the closed box.
- Motion is a slow push, scale 1 to 1.045, power1.inOut, on a child of the plate. Cuts are cuts. No iris, no color fill, no shared slide-in on the lines.
- Key text inside x 192–1520 and y 120–960.

VOICE: Kokoro `am_adam`, local, speed 1.0, lang en-us. A narrator, not Farhan. Six lines, in assets/narration.txt, spoken to assets/voice/narration.wav. This build returned no phoneme times, so a card inside a line is placed by the length of its sentence, and the price words are biased toward the end of that sentence. The cuts between shots are the measured line boundaries.
MUSIC: MusicGen, local, mode generate. Sparse minor, felt piano and a low string, almost no drums, about 92 bpm, no vocals. Volume about 0.14 under the voice. It thins on the empty shelf and returns for the last line.
EFFECTS: a paper peel if an offline take exists, a soft stamp on $449. Otherwise neither. No whoosh.

NUMBERS, unchanged:
- $80 and $449 are two examples, not one SKU. $449 is the cheapest US 32GB DDR5-6000 listing found 14 Oct 2026.
- 16Gb DDR5 contract about $8.70 in Oct 2025, about $48 in Sep 2026, about 5.5×.
- HBM uses about 3× the wafer per shipped bit versus commodity DDR5.
- Crucial retail shipments ended February 2026. No brand mark in the picture.

SHOTS, locked to assets/voice/times.json:
- 0–7.469 s sticker. Flat sticker, then the corner lifts at 5.118 s on "One example." $80 sits on the empty wood at the right, from 4.15 s.
- 7.469–19.503 s now. The same box, blank orange sticker. $449 from 5.55 s into the shot, on "four hundred and fifty."
- 19.503–34.118 s chip. The package holds bare, then $8.70 at 4.55 s, $48 at 8.75 s, About 5.5× at 12.05 s.
- 34.118–45.512 s wafer. The disc until 4.85 s, then one module beside three packages as "three times" is said.
- 45.512–51.381 s shelf. The hook is already empty. February 2026. The bed thins here.
- 51.381–57.340 s desk. "Your RAM did not get worse." "The wafer left." A breath, then YTxFSGAMERz. The bed returns.

BANNED: flat vector kits, giant price plates, iris wipes, glow, particles, purple gradients, pills, serif display, Inter, Space Grotesk, Instrument Serif, Geist, JetBrains Mono, orange type, fake logos, presenting $80 and $449 as one product.

Films 2 and 3 stay unbuilt in STORYLINES.md.
