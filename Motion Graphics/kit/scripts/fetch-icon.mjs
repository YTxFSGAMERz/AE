// Lucide icons (ISC) via Iconify, for concept rows in StackTable/PayFlow/custom templates.
//   node scripts/fetch-icon.mjs mic database globe      # names at lucide.dev/icons
import { writeFile, mkdir } from "node:fs/promises";
import { execSync } from "node:child_process";
await mkdir("public/icons", { recursive: true });
for (const n of process.argv.slice(2)) {
  const r = await fetch(`https://api.iconify.design/lucide/${n}.svg?width=48&height=48`);
  const t = r.ok ? await r.text() : "";
  if (!t.startsWith("<svg")) { console.log(`MISS ${n}`); continue; }
  await writeFile(`public/icons/${n}.svg`, t); console.log(`OK ${n}`);
}
execSync("node scripts/bundle-icons.mjs", { stdio: "inherit" });
