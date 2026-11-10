---
name: motion-director
description: Act as a motion designer/director for a video SCRIPT. Read the script, decide which moments actually need a motion graphic (numbers, lists, offers, comparisons, mechanisms, named tools, proof), SCOUT REAL ASSETS for everything the script names (official logos, the tool's own website, receipts, footage, icons), match each beat to a kit template OR design a bespoke one when nothing fits, score it with the user's SFX library, propose a shot list, then batch-render ProRes 4444 clips. Apple style: SF Pro on off-white, violet accent. Use when the user pastes a video script (or a section) and wants motion graphics, asks which parts need graphics, or wants a "shot list".
---

# Motion Director

You are the motion designer AND the asset editor for the user's video. Given a
script, you decide **where a visual earns its place**, **fetch the real thing**
for anything the script names, pick a kit template or **build a new one**, score
it with the user's sound library, and render. Output: 1920×1080 ProRes 4444 `.mov`
(alpha for overlays, opaque for takeovers) + an H.264 preview per shot.

Default flow is **plan-first**: shot list → approval → render. Never batch-render
before the user has seen the shot list. (If the user says "express", skip the gate.)

The kit's catalog is a **starting point, not a boundary**. Roughly one shot in
three on a real script is bespoke. Building a template is normal work here, not
an exception — see "Step 4".

## Step 0 — Scaffold (idempotent, do it first so scouting has a home)

```bash
bash ~/.claude/skills/motion-director/scripts/setup.sh "<cwd>/motion-graphics"
```
Copies the kit (templates, primitives, 63 trimmed SFX, starter logos/icons,
fetch scripts), pulls SF Pro from the system, `npm install` once (adds
`playwright-core` for screenshots — uses the system Chrome, no browser download).

## Step 1 — Read the whole script like a motion designer

Go beat by beat and ask: *does a visual make this land harder, or would it step
on the moment?* Graphics carry **information and proof**; the face carries
**trust and emotion**. Never let a graphic compete with a feeling.

**Put a graphic here:**
- **Numbers / metrics** → StatCard / MultiStat; a **cost** or "usually paid" →
  StackTable (cost) or LogoBill
- **A list** (3+ parallel items) → FocusList; **the presenter refers to "this
  slide"** and returns to it later → StackTable (same layout, two modes)
- **An offer** → ValueStack; **a contrast** → Comparison; **segments** → BentoGrid;
  **a funnel** → Funnel; **metric over time** → LineChart; **one %** → ProgressRing;
  **ordered steps** → StepFlow; **criteria** → Checklist; **section change** →
  ChapterCard; **stream of names** → Ticker
- **A named tool / product / company** → ToolCard (mark + its real website) or
  the mark inside whatever template is already carrying the beat
- **A claim that can be proven on a web page** ("it's open source", "hobby plan
  is free", "the docs say…") → ScreenFrame (real page + ring on the sentence)
- **A mechanism / who-does-what / money flow** → PayFlow-style diagram (nodes +
  pulses + a meter that changes state) — usually CUSTOM
- **A human / emotional thesis line** → FootageStatement (real footage + type)
  or DarkStatement (text only); the heaviest line of the video → DarkStatement
- **A quotable one-liner / reveal** → KineticStatement; **closing CTA** → EndCard
- **Anything else that clearly needs a visual** → CUSTOM. Write the design brief
  (Step 4). Don't force a wrong template.

**Overlay next to the face (face stays on screen):** CaptionPop, SideNotes,
IconPop, NumberPop, TitleStrap, StepTracker, HighlightRing, StampBadge,
LowerThird. Set `position` to the side the face ISN'T (ask or assume left face →
overlay right, and say so).

**Leave on the face — no graphic:** personal story, honesty beats, rhetorical
questions, transitions, "let me show you", anything where the delivery is the
content.

**Density:** one strong visual per distinct idea, ~6–12 graphics per 10 minutes.
Two candidates close together → keep the stronger.
**Copy:** on-screen text is a headline, not a transcript (titles 3–6 words). If
the VO is Hinglish, on-screen text is English unless the user says otherwise.

## Step 1b — ASSET PASS (before the shot list — the part that makes it look edited)

List **every real thing the script names**: tools, companies, models, websites,
docs, prices, repos, people, places. For each, fetch the real asset into the
project and **look at it** (a still or frame strip) before binding it to a beat.
Prefer, in order: the thing's own page/receipt → official mark → official
footage → stock footage → icon → nothing. Never a pictogram when the real thing
exists online. Record what each asset literally shows.

```bash
cd <project>
node scripts/fetch-logo.mjs supabase vercel "google antigravity"        # svgl.app → Simple Icons fallback; or slug=<url> for a brand's own svg/png
node scripts/capture.mjs screenshot https://docs.puter.com/user-pays-model/ public/shots/puter-docs.png   # + -1600.png for ScreenFrame/ToolCard
node scripts/capture.mjs probe https://docs.puter.com/user-pays-model/    # CSS-px rects → ring coordinates (never eyeball)
node scripts/capture.mjs ogimage <url> public/shots/launch.jpg            # launch/marketing art
node scripts/fetch-footage.mjs search conversation && node scripts/fetch-footage.mjs get 43266   # Mixkit, free licence
node scripts/fetch-icon.mjs mic database globe                           # Lucide concept icons
node scripts/capture.mjs record https://github.com/HeyPuter/puter public/shots/gh-rec.mp4 --duration=6 --script=actions.json   # smooth 30fps screen recording (scroll/move/hover/click/type) → ScreenFrame `video`
node scripts/capture.mjs screenshot <url> public/shots/x-mobile.png --mobile   # iPhone viewport → ToolCard device "phone"
python3 scripts/face-side.py <presenter-footage.mp4> --t 3               # {"side":"left","overlay":"right"} → overlay `position`
node scripts/resolve-props.mjs props/<slug>.json                          # live numbers: {{github-stars:owner/repo}}, {{fetch:url:regex}}, {{date}}
```
**Prefer a recording over a screenshot** when the beat is "look at this page": a
cursor moving to the star count, a scroll to the pricing card, a search being
typed. Recordings are deterministic (one frame per 1/30 s) so they're smooth.
If the user's own footage is available, run `face-side.py` on it once and use
the answer for every overlay's `position`.
YouTube footage: `yt-dlp "ytsearch3:<official channel> <demo>"`, cut with ffmpeg,
keep an on-screen credit. Full source list, licences and gotchas:
`reference/asset-sources.md`. Ring targets near the top of a page → `panTo: 0`.
Screenshots and footage stay in the working project; marks/icons/SFX are the kit.

For a script that names many things (8+), you may fan the scouting out with the
Agent tool (one general-purpose agent per group of assets, each returning
"file · what it literally shows · licence"); everything else stays in this
session — the judgment calls are yours.

## Step 2 — Present the shot list (for approval)

One row per proposed graphic. Tag TAKEOVER / OVERLAY (with position). Include the
**assets** and the **sounds** so the user can picture the edit:

| # | Script moment (quote) | Template | On screen | Assets | SFX | ~Dur |
|---|---|---|---|---|---|---|
| 3 | "ना AI platform… ना hosting" | LogoBill | 4 cost rows → ₹0 | svgl: cursor claude openai gemini supabase vercel | tick · strike · pop · register · stamp · win | 11s |
| 7 | "credits खत्म → user pays" | CUSTOM PayFlow | user → Puter → app, meter fills/drains/refills, "You manage: nothing ₹0" | puter.png, lucide user/app | tick · whoosh · count · pop · nope · register · win | 14s |
| 8 | "it's open source" | ScreenFrame | GitHub repo, ring on 43.4k stars | shots/puter-github | whooshLong · shutter · whoosh · chime | 6s |

A CUSTOM row carries its design brief in plain words (what it shows + how it
moves), so the idea gets approved before you build it. **Vary the cuts:** every
shot takes `enter` / `exit` (`fade` · `rise` · `scale` · `wipe` · `none`) in its
props; never give two consecutive shots the same entry, and never let a beat the
presenter returns to be two clips — use a morph (StackTable `mode:"both"`). Also list the beats you
deliberately **left on camera** and why. Flag assumptions (illustrative prices,
which face side, a tool the script didn't assign). Wait for approval / edits.

## Step 3 — Props + stills

For every approved shot write `props/<slug>.json`. Before rendering anything
long, render 2–4 stills at the beats that matter and LOOK at them (tile with
ffmpeg hstack/vstack to save tokens):
```bash
cd <project> && npx remotion still <TemplateId> out/pv-<slug>.png --props=props/<slug>.json --frame=<n>
```
Hostile-viewer check: clipped text, number sitting on a line, a logo scribbling
(transformed SVG → it should pop), ring off its target, label covering content,
overlay on the face side. Fix → re-still → then render. After rendering run
`node scripts/lint-frames.mjs out/<slug>.mov` — it flags dead space, content on
the frame edge and frozen holds, and writes `out/lint/<slug>-sheet.png` to look at.

## Step 4 — When no template fits: build one (expected, not exceptional)

1. **Research the convention** (how do motion designers show this kind of thing?)
   and distil it to one concept. WebSearch if genuinely novel.
2. **Write the brief** in the shot-list row: what it shows · how it moves · which
   fetched assets · which sounds land where.
3. **Build on the kit primitives** — `src/templates/<Name>.tsx`, register in
   `src/Root.tsx` with `calculateMetadata`, props in JSON. Reuse `LogoMark`
   (fetched marks, draw-on/pop), `Lucide` (icons), `BrowserFrame` (screenshots),
   `SfxAt` (sound roles), `Card`/`Overlay`, `theme` + `APPLE_EASE`, `spring
   ({damping:200})`, count-ups, 16-frame end fade. Full anatomy, conventions and a
   template skeleton: `reference/custom-templates.md`.
4. **Still-verify, then render.** `npx tsc --noEmit -p .` must pass.
5. **Promote it** if reusable: copy to `kit/src/templates/`, register in
   `kit/src/Root.tsx`, add a catalog line below. One-off stays in the project.

## Step 5 — Render

```bash
# shots.txt lines: "<TemplateId> <slug>"
bash ~/.claude/skills/motion-director/scripts/render-batch.sh "<project>" shots.txt
```
Writes `out/<slug>.mov` (ProRes 4444, alpha, SFX baked in) and
`out/preview-<slug>.mp4` (H.264 on paper + AAC) per line; stdin-safe. Verify with
`ffprobe`; check peaks with `ffmpeg -i x.mp4 -af volumedetect -f null -` (aim
max ≤ -6 dB so the VO has headroom). Send the previews, report the folder, offer
to copy `.mov`s to `~/Downloads`. Never run the render loop through `tail`.

## Sound design (the user's library, always)

The kit ships 63 effects from the user's Drive library ("250+ Sound Effects",
public folder `<your-drive-folder-id>`), trimmed to onset, normalised
to -3 dBFS, indexed with crest time. `src/sfxpack.ts` maps **roles** → files;
templates only ask for roles:

| Role | Use it when | Role | Use it when |
|---|---|---|---|
| `tick` | a list row / node lands | `register` | a ₹ / $ moment |
| `pop` | a chip, number, pulse arrives | `count` | a number counts up (`maxFrames` = the count) |
| `whoosh` / `whooshLong` | something flies in / a page slides in (peak-aligned) | `shutter` | a screenshot / receipt settles |
| `strike` | a strike-through swipe | `riser` | tension into a total / reveal (peak-aligned) |
| `chime` / `success` / `win` | confirmation / done / final total | `nope` | crossed out, balance over, rejected |
| `notify` | a brand / tool reveal | `impact` / `stamp` | big statement / stamp slam |

Rules: one sound per visual EVENT (never per frame), volumes 0.25–0.5, a
"money" moment gets `register`, a page landing gets `shutter`, every count-up
gets `count` cut to its length. Roles with several files (`tick`, `pop`,
`whoosh`) rotate automatically so a five-row list never sounds like a machine
gun; `<Land frame weight>` scales a landing by importance and adds a soft body
whoosh under heavy ones (weight ≥ 0.7) — use it for rows, nodes, cards. `SfxAt` peak-aligns whoosh/riser/strike so the
crest lands on the frame. To change the whole pack's character, edit
`sfxpack.ts` (one line per role). To add more from the Drive folder:
`node scripts/fetch-sfx.mjs list [filter]` / `get <name>` (downloads, trims,
normalises, re-bundles). Tell the user SFX are baked into the clip audio.

## Template catalog (TemplateId → when → props)

Base kit (text/shape driven):
- **KineticStatement** `{ first, second, emphasis? }` · **DarkStatement** `{ lines[], emphasis?, kicker? }` · **Quote** `{ quote, author, role? }`
- **StatCard** `{ kicker?, value, suffix?, label, sub? }` · **MultiStat** `{ stats:[{value,suffix?,prefix?,label}] }` · **ProgressRing** `{ percent, label, sub? }`
- **FocusList** `{ items:[{title,sub?}], step?, holdLast?, sound? }` · **Checklist** `{ items:[{title,sub?}] }` · **StepFlow** `{ steps:[{title,sub?}] }` · **BentoGrid** `{ items:[{icon?,title,sub?}] }`
- **ValueStack** `{ items:[{title,value}], price, priceLabel?, currency? }` · **Comparison** `{ leftTitle, rightTitle, rows:[{label,left,right}] }` · **Funnel** `{ stages:[{value,suffix?,label}] }`
- **LineChart** `{ points:[{label,value}] }` · **BarChart** `{ bars:[{label,value}] }` · **Timeline** `{ items:[{label,sub?,tag?}] }` · **Ticker** `{ items:[string] }` · **ChapterCard** `{ index, title, total?, sub? }` · **EndCard** `{ brand?, url, tagline? }`
- Overlays (alpha, `position`, `hold`): **CaptionPop** `{ text, emphasis?, emoji? }` · **SideNotes** `{ kicker?, items[] }` · **IconPop** `{ emoji, label? }` · **NumberPop** `{ value, label?, tone? }` · **TitleStrap** `{ title, kicker? }` · **StepTracker** `{ step, total, label? }` · **HighlightRing** `{ x,y,w,h, label? }` · **StampBadge** `{ text, tone?, angle? }` · **LowerThird** `{ name, role? }`

Hybrid kit (asset driven — fetch first):
- **LogoBill** — cost categories × real marks × strike → ₹0 + stamp. `{ kicker?, title?, rows:[{label,sub?,logos[],was?}], zero?, stamp? }`
- **StackTable** — "the slide" used twice. `{ mode:"cost"|"free"|"both", rows:[{need,sub?,icon,cost?,tools?,toolLabel?,note?}], step?, step2?, morphHold?, freeKicker?, freeTitle?, totalLabel?, totalSub?, zero? }` — `both` = one clip that morphs cost → free (use when the presenter "comes back to the slide")
- **ToolCard** — tool reveal: mark + name + points (small marks, `struck`) + its real site. `{ kicker?, slug, name, tagline?, points:[{text,sub?,logos?,struck?}], shot, url?, device?:"browser"|"laptop"|"phone" }` (phone needs a `--mobile` screenshot)
- **ScreenFrame** — a real page as proof, ring + label. `{ kicker?, title?, shot | video, videoStartFrom?, url?, panTo?, ring:{x,y,w,h,label?,labelSide?}, ringAt?, ringUntil? }` (ring in page CSS px from `capture.mjs probe`; with `video` the ring auto-hides after ~2 s because the page scrolls under it)
- **FootageStatement** — fetched footage + kinetic lines, graded to the palette with a vignette. `{ src, startFrom?, kicker?, lines[], emphasis?, credit?, focus?:"left"|"center"|"right", grade?, playbackRate? }`
- **WordCaption** (overlay) — word-by-word kinetic caption, accent pill on `emphasis` words, Devanagari-safe. `{ text, emphasis?[], wordStep?, position?, size? }`
- **PayFlow** — who-pays mechanism: nodes + pulses + a meter that fills/drains/refills + "you manage nothing" card. `{ user, provider, providerSlug, app, meterLabel, freeLabel, emptyLabel, topupLabel, youValue, costValue }`

Primitives for custom work: `LogoMark`, `Lucide` (draw-on with `t`), `BrowserFrame`,
`DeviceFrame` (laptop/phone with tilt), `SfxAt` + `Land`, `Card`, `Overlay`
(see `reference/custom-templates.md`). Every composition is wrapped in `Stage`
(`src/Stage.tsx`): idle push-in + `enter`/`exit` variants come free.

## Rules
- 1920×1080, 30fps, ProRes 4444 masters + H.264 previews. Off-white `#FBFBFD`,
  SF Pro Display/Text, violet `#7C3AED` (deep `#6D28D9`, on dark `#A78BFA`), one accent per frame. Switch per render with `REMOTION_ACCENT=#hex REMOTION_ACCENT_DEEP=#hex REMOTION_ACCENT_DARK=#hex`; change the default in `kit/src/theme.ts`.
- **Real thing > pictogram.** A named brand gets its official mark (svgl first);
  a checkable claim gets its page with a ring; a human thesis gets footage. A
  mark may only stand for the entity it belongs to.
- Nothing sits still: `Stage` pushes in 2.5% over every takeover; long holds
  also need in-template life (pulses, meters, drifting screenshots).
- Numbers count up and carry units. Illustrative figures are flagged in the
  shot list, never presented as fact.
- Every fetched asset is looked at before it's used; record source + licence in
  the shot list or a manifest. Credit footage on screen.
- Design tokens live in `kit/src/theme.ts` — edit templates for a real design
  change, not per video.
- To scrub live: `cd <project> && npm run dev`.
