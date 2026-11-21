# Voice

Local only. Python 3.12:

`C:\Users\Admin\AppData\Local\Programs\Python\Python312\python.exe`

`py -3` on this machine is 3.15 and cannot import the voice stack. Call `py -3.12`.

## Stack

Do not upgrade these. A later install pulled torch off CUDA.

| Package | Pin |
| --- | --- |
| torch, torchaudio | `2.6.0+cu124` |
| chatterbox-tts | 0.1.7 |
| transformers | 5.2.0 (held here by Chatterbox) |
| numpy | 1.26.4 |

CUDA on the NVIDIA GeForce RTX 3050 6GB. Weights are cached under the Hugging Face hub folder `models--ResembleAI--chatterbox`. The machine is not logged in to Hugging Face. That only prints a rate-limit warning.

Kokoro `am_adam` is not this voice. No HeyGen, no cloud TTS.

## Generate

```python
wav = model.generate(paragraph, exaggeration=exag, cfg_weight=cfg, temperature=temp)
```

| Moment | exaggeration | cfg | temperature | breath after | peak |
| --- | --- | --- | --- | --- | --- |
| Opening question | 0.34 | 0.50 | 0.58 | 1.15 s | 0.76 |
| Hook, after the question | 0.42 | 0.44 | 0.64 | 0.85 s | 0.82 |
| Explanation | 0.38–0.42 | 0.42–0.44 | 0.64–0.66 | 0.34–0.40 s | 0.82–0.84 |
| A number | 0.50–0.52 | 0.38 | 0.70 | 0.32 s | 0.92 |
| The call, before the landing | 0.32–0.36 | 0.46–0.48 | 0.60–0.62 | 0.50–0.62 s | 0.76–0.78 |
| Last line | 0.52 | 0.38 | 0.70 | none | 0.90 |

The first paragraph starts at 0.55 s, not at 0. That silence is samples of zeros prepended to the mix, and the first `start` in `times.json` is 0.55.

Cache key is sha1 of `v3|paragraph|exaggeration|cfg|temperature|breath|peak`, first 16 hex chars. Changing any of those must miss the cache. Time the film from wav lengths only. Do not add a sample gap onto a cursor that is already in seconds.

Per-line peak as in the table, then one gain on the full mix: if the peak is above 0.92, scale to 0.92. If it is below 0.80, scale to 0.86. Do not normalize every line to the same peak and then boost the whole file to 0.89. That erases the quiet lines.

The result is still synthesized. Say so. Leave `narration.txt` as the script to record over. Paragraphs are separated by a blank line. Apostrophes are straight quotes. A curly apostrophe misses the cache and desyncs the picture.

`scripts/speak.py` speaks a narration file with this table when the paragraph starts with a known prefix, and the explanation row otherwise.
