# Lessons from the passkey cuts

These are frames that were wrong in `are-passkeys-actually-safe` v1 through v5. Do not ship them again.

| Time in v5 | What was on screen | Rule now |
| --- | --- | --- |
| 0:28 | "Your PC" was only a key icon. | A PC is a screen and a base. |
| 0:37 | A black square sat in the gutter between the PC and the site for most of the mechanism. | No object lives in the gutter. Hello is a dialog on the PC. |
| 1:45 | The FIDO sheet was a date and an empty body. | That sheet already holds the bar and the number. |
| 3:43 | "Nothing of theirs, yet." faded out before the key row was in, so the card went blank. | The new row is visible before the old line leaves. Same rectangle. |
| 4:22 | The strike ran through "Write down a recovery phrase" and past the words. | The strike is under the phrase, the width of the phrase. |
| 4:32–4:42 | "Opened by you" dropped to "Three checks." in an empty window, then the previous picture vanished again. | Three rows are already in the window. Later lines fill a row. |
| 5:25 and 5:32 | The key sat above the text on Microsoft and on Google. | The icon is inside the row, centered on the text, on every page. |
| Whole film, early cuts | Scene detection at threshold 0.008 found holds of 19 s, 38 s, 40 s, and one of 77 s. A 4 px progress rule and a 28 px square do not read as motion. | Move a large layer for the length of the sentence: a dialog, a row, a bar, a window. |

Also dropped along the way: a password field drawn as a second rectangle on top of the account row. One box. Two subtitles crossfading in one slot. One line at a time. The question and the "This PC" row sharing one position, so the row covered the question. The row waits until the question's line has finished.

After Effects 2026 (`AfterFX.exe` and `AfterFX.com -r`) returned without running the cold-open script. Do not spend another session driving it unless the person asks.
