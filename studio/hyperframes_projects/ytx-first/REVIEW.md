# Review — The Wafer

57.340 s composition, 1920×1080, 30 fps. Local narrator and a local music bed. Channel name only on the end card.

The delivery file is `renders/the-wafer.mp4`. ffprobe reads 57.367 s, 1920×1080, 30 fps, H.264 and AAC, 64.0 MB. That is one frame past the composition, the last frame held through the encoder.

## Creative calls

Built storyline 1, The Wafer, as photographs on one oak bench. An $80 example sticker peels to a $449 example (Oct 2026). The same contract chip goes from about $8.70 (Oct 2025) to about $48 (Sep 2026), about 5.5×. One wafer, then one desktop module beside three packages. The retail hook is already empty. A closed box sits under an unpressed PLAY. The claim is "Your RAM did not get worse" / "The wafer left".

Not built, still in `STORYLINES.md`: 2 The Quiet Desk (WinAurex idle-RAM numbers) and 3 The Second Key (ML-KEM). The $80 and $449 figures stay labelled "example". They are not one SKU. No Crucial or Corsair mark.

Voice is Kokoro `am_adam` at speed 1.0, a narrator, not Farhan. The six lines are in `assets/narration.txt` and `assets/voice/narration.wav` (54.239 s, with a 0.45 s breath between lines). Music is a local MusicGen bed, sparse minor, felt piano and a low string, looped from a 28 s seed to the film. Its lane is 0.14, and it thins to 0.05 across the empty shelf. No paper-peel or stamp: the offline effect set has neither, so neither was added.

## What was measured, what was only looked at

Measured by `check` (report `86b71c68`): ok, 0 errors. Layout duration 57.34 s, 0 layout issues. Contrast 7/7. Craft sweep 459 samples, 0 findings. Audio clips readable, 0 findings.

Looked at the beat and seam frames in snapshot `19077758`, then the card fix in `c276a751` (4.45 s, 13.32 s, 39.82 s). Decoded the delivery file at 4.45 s, 55.0 s and 56.9 s. The $80 and $449 cards sit on the wood at the upper right. The three packages are all visible. The end card is the channel name with an orange rule. No corner watermark in those frames.

Sound was measured, not heard. `audio` on the mp4: integrated −15.8 LUFS, true peak −1.0 dB, 0 clipped samples. The only silence is the fade from 56.38 s to the end. Kokoro returned no phoneme times, so a card inside a line is placed by sentence length. The cuts between the six shots are the measured line boundaries.

## Weakest shot

The peel. It is a cut from one photograph to the next at 5.118 s, so the sticker jumps rather than lifts. The $80 card also sits on the lid's upper corner. The stick and the blank sticker stay clear.

## Warnings kept on purpose

`timeline_track_too_dense` on `chip.html`, `desk.html`, and `wafer.html`. Each file is one shot plus the cards that belong to it. Splitting them would break the push that has to stay one continuous move.
