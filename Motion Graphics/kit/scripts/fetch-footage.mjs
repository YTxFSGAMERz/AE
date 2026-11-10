// Free stock footage from Mixkit (free licence, no key, no attribution required).
//   node scripts/fetch-footage.mjs search <keyword>          # lists id | title
//   node scripts/fetch-footage.mjs get <id> [out-name]       # downloads best of 1080/720 into public/footage/
import { writeFile, mkdir } from "node:fs/promises";
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/131 Safari/537.36";
const [cmd, arg, name] = process.argv.slice(2);
if (cmd === "search") {
  const html = await (await fetch(`https://mixkit.co/free-stock-video/${encodeURIComponent(arg)}/`, { headers: { "user-agent": UA } })).text();
  const seen = new Set();
  for (const m of html.matchAll(/href="\/free-stock-video\/[^"]+-(\d+)\/"[^>]*>\s*([^<]{5,120})</g)) {
    if (seen.has(m[1])) continue; seen.add(m[1]);
    console.log(`${m[1]} | ${m[2].trim().replace(/&amp;/g, "&")}`);
  }
} else if (cmd === "get") {
  await mkdir("public/footage", { recursive: true });
  for (const res of [1080, 720]) {
    const r = await fetch(`https://assets.mixkit.co/videos/${arg}/${arg}-${res}.mp4`, { headers: { "user-agent": UA } });
    if (!r.ok) continue;
    const out = `public/footage/${name ?? `mk-${arg}`}.mp4`;
    await writeFile(out, Buffer.from(await r.arrayBuffer()));
    console.log(`saved ${out} (${res}p)`); process.exit(0);
  }
  console.log("MISS"); process.exit(2);
} else console.log("usage: fetch-footage.mjs search <kw> | get <id> [name]");
