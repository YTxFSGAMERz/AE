# Design

1920×1080. 30 fps. Paper, printed. Not a glow reel and not a purple product kit. The file `AE/.agents/memory/motion-preferences.json` is a different kit (SF Pro, violet, whooshes). Do not apply it to this channel.

## Color

| Role | Hex | Use |
| --- | --- | --- |
| Ground | `#f3efe6` | Page background. Flat. No gradient, no grain. |
| Ink | `#16130f` | Type, rules, borders, the PC, the print bar. |
| Mute | `#6b645c` | Secondary lines. |
| Hairline | `#d9d2c5` | Empty tracks, dividers that are not ink. |
| Amber | `#c45c12` | A shape only: a left bar, a rule under the channel name. Never amber type. |
| Wash | `#f3ddc8` | The row behind an amber key or a second device. Type on it stays ink. |

## Type

Roboto, loaded by the HyperFrames compiler. Do not set type in an image model.

| Role | Size / weight |
| --- | --- |
| Body | 32 / 400 |
| Labels | 28 / 500 |
| Hook and last line | 44 / 700 |
| Numbers | 64 / 700, or 72 when the number is the hero |
| Channel, end card | 56 / 700 |
| Corner name, every frame | 28 / 700 |

Safe box: x 160–1760, y 120–960. The corner name sits at left 160, top 36, so it clears the windows. It is on screen from frame 0 through the last frame. It is not spoken.

Radius is 0. The only shadow is the print shadow on a window: 10 px right, 10 px down, 0 blur, ink at full opacity.

## Windows

A window is a sheet with a 4 px ink border, an 88 px ink header, and a body. Header type is paper `#f3efe6`.

A PC is a screen and a base, drawn in ink. It is not a key icon. A key is a separate object: round bow, straight shaft, two teeth. Amber only when the key is not this PC.

A strike is a 4 px ink rule under the words, the width of the phrase. It does not cut through the letters and it does not run into empty space past the phrase.

A row that replaces another row occupies the same rectangle. The old line stays until the new row is already visible. The card does not go empty between them.

Nothing is parked in the gutter between two cards. A challenge is a Windows Security dialog on the PC side ("Making sure it's you", six PIN boxes), not a loose square.

The checks live in one "Opened by you" window. Three rows are already drawn. The next sentence fills a row. It does not clear the window to one line.

Account rows that show a key put the icon inside the row, vertically centered with the text. The same alignment on every page. Microsoft, Google, and This PC use the published control names. No logo artwork. No hostname the viewer is told to type. No recovery phrase, no command, no attack step.

## Banned

Generated photographs. Image-model lettering. Dark void. Glow. Neon. Purple gradient. Glass. Pill chips. Italic accent words. "01 / 02" labels. Three floating cards with no window. Corner brackets. A logo in the corner besides the channel name. A whoosh on every cut. Iris wipes. Full-frame color fills. Orange type. Vendor marks.
