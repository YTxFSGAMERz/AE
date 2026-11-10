# Hybrid motion graphics — fetchable asset sources (researched 2026-09-06)

Goal: stop relying only on code-drawn shapes. When the script names a real thing,
put the real thing on screen and give it motion. Everything below was probed
live from this machine: free, no API key, scriptable.

## Tier 1 — use these by default

| Asset | Source | How | Notes |
|---|---|---|---|
| Brand logos (official, full colour, multi-path SVG) | **svgl.app** | `api.svgl.app?search=<name>` → `svgl.app/library/<file>.svg` | Best quality. Has light/dark variants + wordmarks. `scripts/fetch-logo.mjs` saves svg + paths.json; `scripts/bundle-logos.mjs` embeds into `src/logos.ts`. |
| Brand logos (mono, 3000+ slugs, CC0) | **Simple Icons** via jsDelivr / `cdn.simpleicons.org/<slug>/<hex>` | single path `d` | Fallback when svgl lacks a brand. reel-generator already has `fetch-brands.mjs`. |
| Colour logos + 200k icons | **Iconify** `api.iconify.design/logos/<name>.svg`, `/lucide/<name>.svg` | plain GET | `logos:` set = colour brand marks; `lucide:` = UI icons. |
| Official logos / photos (open licence) | **Wikimedia Commons** search API + `upload.wikimedia.org` | needs a real User-Agent | Good for older/press logos, flags, maps. |
| Local library | `news-reels/public/assets/logos/` | 127 marks already as `.paths.json` | Same JSON shape as ours — copy directly. |
| Real website screenshots (chrome-free, 2–3×) | **Playwright + system Chrome** | `reel-generator/scripts/fetch-web.mjs screenshot <url>` or `news-reels/tools/capture.mjs screenshot --selector` | Pair with a device-frame template. x.com blocks headless. |
| Scripted screen recordings (30fps webm) | `news-reels/tools/capture.mjs record --script actions.json` | | For "watch me click through the app" beats. |
| og:image marketing art | `fetch-web.mjs ogimage <url>` | | Launch posts, product pages. |
| Free stock footage | **Mixkit** (`mixkit.co/free-stock-video/<kw>/` → `assets.mixkit.co/videos/<id>/<id>-1080.mp4`) | `scripts/fetch-footage.mjs search/get` | Free licence, commercial OK, no attribution required (we credit anyway). Not every clip has 1080. |
| Free stock footage (alt) | **Coverr** | search page exposes direct mp4 CDN links | Many AI-generated clips now; grade with a frame strip. |
| Stock photos | **Unsplash** direct `images.unsplash.com/photo-<id>?w=1920` | needs a known photo id (search API needs a key) | |
| Flat illustrations | **unDraw** `cdn.undraw.co/illustrations/<name>.svg` | recolour `#6c63ff` → accent | Open licence. |
| Official product footage | **YouTube via yt-dlp** (`ytsearchN:` → official channel) | cut with ffmpeg, keep @credit on screen | The news-reel scout order applies: official → creator demos (credited). |

## Needs a free API key (not wired yet)
Pexels video/photo (`api.pexels.com`, 401 without key), Pixabay (400 without key),
LottieFiles (403 to scripts; download JSON manually, use Remotion `@remotion/lottie`).

## Also available but "generated", not fetched
Higgsfield MCP (`generate_image` / `generate_video`) — AI B-roll when no real
clip exists. Costs credits; state the count up front (reel-generator rule).

## How editors actually use these (the rules we followed here)
1. **Real thing > pictogram.** A named tool gets its official mark; the mark gets
   motion (ink trace → colour fill, staggered), never a static paste.
2. **Footage + type, not type alone,** for human/emotional thesis lines: full-bleed
   clip, slow push-in, bottom scrim, kinetic lines. Credit small in a corner.
3. **Keep code-only templates for information** (numbers, lists, chapters, overlays
   beside the face). Hybrid shots are for proof and feeling.
4. **Verify what a fetched asset literally shows** (frame strip) before binding it
   to a beat — same rule as the news-reel manifest.
5. **Licence + credit** recorded per asset (svgl = official brand assets, use
   nominatively; Mixkit = free licence).

## New templates in this project
- `LogoBill` — cost categories × real logos × strike-through → ₹0 + FREE stamp.
- `FootageStatement` — full-bleed fetched footage + DarkStatement-style lines.
- `src/LogoMark.tsx` — reusable draw-on brand mark (ported from news-reel LogoPlate).

## Part 2 additions (tools section of the script)
New templates:
- `StackTable` — "the slide" used twice: mode `cost` (Lucide icon rows, ₹ count-ups,
  monthly total) and mode `free` (same rows, real tool marks draw in, ₹0 total).
- `ToolCard` — tool reveal: official mark + name + points (small marks, optional
  strike-through) beside the tool's real website in a browser frame.
- `ScreenFrame` — a real page as proof: fetched 1440-css-px screenshot in a big
  browser frame, optional pan, accent ring drawn around a region + label.
- `src/BrowserFrame.tsx`, `src/Lucide.tsx` (Iconify Lucide icons), `scripts/bundle-icons.mjs`.

Lessons:
- **Screenshots:** news-reels `tools/capture.mjs screenshot --scale 2 --width 1440`
  worked; reel-generator's `fetch-web.mjs` is missing `playwright-core` in its
  template. Google search results render fine headless (no consent wall) with `hl=en`.
- **Ring coordinates:** run `capture.mjs probe <url> --scale 1` and use the CSS-px
  rects it prints; the template converts (frame width / 1440). Don't eyeball.
- **Marks with `transform=`/`clip-path` groups (e.g. Antigravity) cannot be
  path-traced** in the root viewBox — LogoMark detects this and pops them instead.
- **Raster-only marks** (Puter: white-stroke SVG for dark UI + a PNG from their
  README) go through a `PNG_LOGOS` map and pop in.
- **Do not pan a shot whose ring target is near the top** — the target scrolls out.
- Puter's own marketing page (developer.puter.com: "backend with auth, storage,
  database, AI Gateway") is the receipt for the "two jobs" claim; the GitHub page
  (43.4k stars, AGPL-3.0) is the receipt for "open source"; Vercel pricing (Hobby $0)
  for "free hosting".

## Sound: the user's SFX library (2026-09-06)
Source: Google Drive folder "250+ Sound Effects"
(your own public Drive folder) — three
subfolders (200 / 44 / 26 effects). Public, so files download with
`https://drive.google.com/uc?export=download&id=<fileId>`; the listing comes from
`drive.google.com/embeddedfolderview?id=<folder>#list` (no auth needed).

Curated 63 into `public/sfx/lib/` (whooshes, pops, clicks, dings, impacts,
risers, counting, cash register, shutter, typing, nope/reverse). Each was:
- trimmed to its onset (several had 1–5 s of dead air — the raw files are NOT
  frame-alignable as-is), peak-normalised to -3 dBFS, capped at 3 s (7 s for
  loops/risers), given a 200 ms fade-out;
- indexed in `public/sfx/lib/index.json` with `seconds` and `peakAt` (time of the
  loudest sample) → bundled to `src/sfxlib.ts`.

`src/sfxpack.ts` maps ROLES → files (tick, pop, whoosh, whooshLong, strike, chime,
success, win, notify, impact, stamp, register, count, shutter, riser, nope, type).
`SfxAt` resolves role → file; whoosh/riser/strike roles are **peak-aligned** (the
crest lands on the frame), hits are onset-aligned; `maxFrames` cuts loops to the
visual they accompany (count-up ticks stop when the number stops).

Scoring rules used: one sound per visual event, never per frame; volumes 0.28–0.5
(the VO needs headroom); a "money" moment (₹ total) gets register + win, a stamp
gets the thud, a page/receipt landing gets the shutter, a strike-through gets a
swipe, a crossed-out tool gets "nope".

## Added 2026-09-06 (second pass)
- **Screen recordings** — `scripts/capture.mjs record <url> <out.mp4> --duration=6 --script=actions.json`.
  Deterministic frame-stepped capture through the system Chrome (ported from the
  news-reels tool): actions `scroll {px}`, `move/hover/click {selector | x,y}`,
  `type {selector,text}`, times in seconds, coords in page CSS px. Selectors that
  aren't visible are skipped with a note instead of aborting. Output is H.264 at
  page-css × scale (2880×1800 by default) → ScreenFrame `video`.
- **Mobile screenshots** — `capture.mjs screenshot <url> <out.png> --mobile`
  (390×844 iPhone viewport, 3×) → ToolCard `device:"phone"`.
- **Face side** — `python3 scripts/face-side.py <footage> --t 3` (OpenCV YuNet,
  model bundled as `scripts/yunet.onnx`; setup.sh installs opencv-python-headless
  user-level if missing). Apple's Vision route was tried first but this Mac's
  Command Line Tools have a broken Swift module map, and Chrome's FaceDetector is
  not exposed in headless mode.
- **Live numbers** — `scripts/resolve-props.mjs` replaces `{{github-stars:o/r}}`,
  `{{github-forks:o/r}}`, `{{fetch:url:regex}}`, `{{date}}` inside props JSON
  (keeps a `.src.json` copy). Run right before rendering a receipt shot.
- **Frame lint** — `scripts/lint-frames.mjs out/<slug>.mov` samples the clip,
  flags dead space / edge activity / frozen holds, writes a contact sheet.
