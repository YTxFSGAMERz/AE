// Pull sound effects from the user's Drive library into public/sfx/lib/ — trimmed to
// onset, peak-normalised to -3 dBFS, capped, indexed with crest time — then bundle.
//   node scripts/fetch-sfx.mjs list [filter]             # list library files (id | name)
//   node scripts/fetch-sfx.mjs get <id-or-name> [...]    # download + process + bundle
//   node scripts/fetch-sfx.mjs reindex                   # re-analyse public/sfx/lib/*.wav
// Needs ffmpeg on PATH. The Drive folder is public: no auth.
import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import { execSync, spawnSync } from "node:child_process";
const FOLDER = process.env.SFX_DRIVE_FOLDER || ""; // set to your own public Drive folder id
const UA = "Mozilla/5.0";
const LIB = "public/sfx/lib";
const [cmd, ...args] = process.argv.slice(2);
if (!FOLDER) { console.error("Set SFX_DRIVE_FOLDER to a public Google Drive folder id of your own sound effects, or just drop .wav files into public/sfx/lib/ and run: node scripts/bundle-sfx.mjs"); process.exit(1); }
const listFolder = async (id) => {
  const html = await (await fetch(`https://drive.google.com/embeddedfolderview?id=${id}#list`, { headers: { "user-agent": UA } })).text();
  const items = [...html.matchAll(/<div class="flip-entry" id="entry-([^"]+)".*?flip-entry-title">([^<]*)</gs)].map((m) => ({ id: m[1], name: m[2].normalize("NFKC").replace(/​/g, "").trim() }));
  const subs = [...new Set([...html.matchAll(/folders\/([A-Za-z0-9_-]+)/g)].map((m) => m[1]))].filter((s) => s !== id);
  for (const s of subs) items.push(...(await listFolder(s)));
  return items.filter((i) => !/\.(mp4|txt)$/i.test(i.name));
};
const analyse = (file) => {
  const pcm = spawnSync("ffmpeg", ["-nostdin", "-v", "error", "-i", file, "-ac", "1", "-ar", "48000", "-f", "f32le", "-"], { maxBuffer: 1 << 28 }).stdout;
  const a = new Float32Array(pcm.buffer, pcm.byteOffset, pcm.length >> 2);
  let peak = 1e-9, pk = 0; for (let i = 0; i < a.length; i++) { const v = Math.abs(a[i]); if (v > peak) { peak = v; pk = i; } }
  let onset = 0; for (let i = 0; i < a.length; i++) if (Math.abs(a[i]) > peak * 0.12) { onset = i; break; }
  let end = a.length; for (let i = a.length - 1; i >= 0; i--) if (Math.abs(a[i]) > peak * 0.02) { end = i; break; }
  return { onset: onset / 48000, end: end / 48000, peak, peakAt: pk / 48000 };
};
const process1 = async (src, base) => {
  const { onset, end, peak } = analyse(src);
  const cap = /riser|build|count|digit|loading|typing|typewriter|writing|transfer|download/i.test(base) ? 7 : 3;
  const dur = Math.min(end - onset, cap);
  const gain = Math.pow(10, -3 / 20) / peak;
  const out = `${LIB}/${base}.wav`;
  execSync(`ffmpeg -nostdin -v error -y -ss ${Math.max(0, onset - 0.008).toFixed(4)} -t ${(dur + 0.25).toFixed(3)} -i "${src}" -ac 2 -ar 48000 -af "volume=${gain.toFixed(4)},afade=t=out:st=${(dur + 0.05).toFixed(3)}:d=0.2" -c:a pcm_s16le "${out}"`);
  return out;
};
const reindex = async () => {
  const idx = {};
  for (const f of (await readdir(LIB)).filter((f) => f.endsWith(".wav"))) {
    const { end, peakAt } = analyse(`${LIB}/${f}`);
    idx[f.replace(".wav", "")] = { file: `sfx/lib/${f}`, seconds: Math.round((end + 0.05) * 1000) / 1000, peakAt: Math.round(peakAt * 1000) / 1000 };
  }
  await writeFile(`${LIB}/index.json`, JSON.stringify(idx, null, 1));
  execSync("node scripts/bundle-sfx.mjs", { stdio: "inherit" });
};
await mkdir(LIB, { recursive: true });
if (cmd === "list") {
  const items = await listFolder(FOLDER); const f = (args[0] ?? "").toLowerCase();
  for (const i of items) if (!f || i.name.toLowerCase().includes(f)) console.log(`${i.id} | ${i.name}`);
} else if (cmd === "get") {
  const items = await listFolder(FOLDER);
  for (const q of args) {
    const it = items.find((i) => i.id === q) ?? items.find((i) => i.name.toLowerCase().includes(q.toLowerCase()));
    if (!it) { console.log(`MISS ${q}`); continue; }
    const base = it.name.replace(/\.(wav|mp3)$/i, "").toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/_?(sound_effect.*|sfx_producer|hd)_?$/g, "").replace(/(^_|_$)/g, "");
    const tmp = `/tmp/sfx-${it.id}`;
    execSync(`curl -s -L -A "${UA}" -o "${tmp}" "https://drive.google.com/uc?export=download&id=${it.id}"`);
    console.log(`processed ${await process1(tmp, base)}  ← ${it.name}`);
  }
  await reindex();
} else if (cmd === "reindex") await reindex();
else console.log("usage: fetch-sfx.mjs list [filter] | get <id-or-name> ... | reindex");
