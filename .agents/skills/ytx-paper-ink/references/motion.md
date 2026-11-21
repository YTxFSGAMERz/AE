# Motion

Motion follows the sentence. The object the voice names is the thing that moves, and it is still moving when that sentence ends. The next sentence starts the next object in the same slot.

## Easing

| Kind | Ease | Length |
| --- | --- | --- |
| Arrive | `expo.out` or `power3.out` | about 0.45 s |
| Travel | `power2.inOut` | the rest of the clause |
| Leave | `power2.in` | shorter than the arrival |
| A rule that draws | `none` or `power2.out` | the length of the phrase |

`back.out` is rare. Do not bounce UI. Do not fade the whole frame. Opacity is for a part that arrives.

GSAP timelines are paused. `fromTo` on a later beat uses `immediateRender: false`. Do not tween `display`, `visibility`, or `autoAlpha` on a `.clip`. Animate a child of the clip. Do not tween `left`, `top`, `width`, or `height`. One subtitle occupies a slot. Swap with `tl.set`, not a crossfade of two lines on top of each other.

## What a sentence does

- A question writes the title. No second object covers it.
- A password types dots into one field, then a strike. The passkey row is that same field, not a second box on top.
- Windows Hello opens a Security dialog on the PC. PIN boxes fill while the PIN line is spoken. The dialog closes when that idea is done.
- A number counts while the figure is spoken. The bar draws with the count. The source sheet already contains the bar. It is not a date alone.
- A list names items one at a time, on the word.
- A check fills its row. Earlier rows stay.

## Channel furniture

A 4 px ink rule at left 160, top 1004, width 1600, `scaleX` from 0 to 1 across the whole film, ease `none`. It is a progress mark. It is not the motion of the scene. A scene that only has this rule is a still slide.

## HyperFrames clips

Class `clip`, `data-start`, `data-duration`, `data-track-index`. Beats use `data-beat` and `data-until`. `SCENE_END` means the host ends. Host ids match the composition root id and the timeline key. Asset paths are `assets/...`. No `Date.now`, no `Math.random`, no network, no `repeat: -1`.
