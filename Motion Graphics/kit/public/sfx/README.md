# Sound effects

This folder ships empty. The kit's sound system is fully wired, but the actual
audio files are not included: the library this was built with is a commercial
sound pack, and those files are not mine to redistribute.

Everything renders fine without sound. Add your own when you want it scored.

## Add your own

1. Drop `.wav` or `.mp3` files into `public/sfx/lib/`.
2. Run `node scripts/bundle-sfx.mjs` from the project root.

That trims each file to its onset, normalises it to -3 dBFS, measures where the
peak lands, and writes `src/sfxlib.ts`. Templates ask for *roles* (`tick`,
`pop`, `whoosh`, `register`, `riser`…), and `src/sfxpack.ts` maps each role to
one or more of your filenames — edit that one file to re-score everything.

Free sources that allow redistribution: Mixkit, Pixabay, freesound.org (check
each file's licence).

## Pulling from a Drive folder

`scripts/fetch-sfx.mjs` can pull from a public Google Drive folder of your own:

```bash
export SFX_DRIVE_FOLDER=<your-drive-folder-id>
node scripts/fetch-sfx.mjs list
node scripts/fetch-sfx.mjs get whoosh pop tick
```
