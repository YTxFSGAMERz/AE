// Fetch official brand marks and bundle them for templates.
//   node scripts/fetch-logo.mjs <name> [<name> ...]         # search svgl.app (official, full colour), fallback Simple Icons
//   node scripts/fetch-logo.mjs <slug>=<svg-or-png-url>     # explicit source (e.g. a logo from the brand's own site/README)
// Saves public/logos/<slug>.svg|png (+ .paths.json for SVG) then regenerates src/logos.ts.
import { writeFile, mkdir } from "node:fs/promises";
import { execSync } from "node:child_process";
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/131 Safari/537.36";
await mkdir("public/logos", { recursive: true });
const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

async function saveSvg(slug, svg, source) {
  const vb = (svg.match(/viewBox="([^"]+)"/) || [])[1] ?? "0 0 24 24";
  const paths = [...svg.matchAll(/<path\b[^>]*>/g)].map((m) => {
    const d = (m[0].match(/\sd="([^"]+)"/) || [])[1];
    const fill = (m[0].match(/\sfill="([^"]+)"/) || [])[1];
    return d ? { d, fill } : null;
  }).filter(Boolean);
  await writeFile(`public/logos/${slug}.svg`, svg);
  await writeFile(`public/logos/${slug}.paths.json`, JSON.stringify({ viewBox: vb, paths, source }, null, 1));
  console.log(`OK ${slug}  (${source})  paths=${paths.length}${/transform=|clip-path=/.test(svg) ? "  [transformed: will pop, not trace]" : ""}`);
}
async function fromUrl(slug, url) {
  const res = await fetch(url, { headers: { "user-agent": UA } });
  if (!res.ok) throw new Error(`HTTP ${res.status} ${url}`);
  if (/\.png(\?|$)/i.test(url) || (res.headers.get("content-type") || "").includes("png")) {
    await writeFile(`public/logos/${slug}.png`, Buffer.from(await res.arrayBuffer()));
    console.log(`OK ${slug}  (png ${url})`);
  } else await saveSvg(slug, await res.text(), url);
}
async function search(name) {
  const slug = slugify(name);
  // 1) svgl.app — official marks, light/dark variants
  try {
    const hits = await (await fetch(`https://api.svgl.app?search=${encodeURIComponent(name)}`)).json();
    const hit = Array.isArray(hits) ? hits.find((h) => slugify(h.title) === slug) ?? hits[0] : null;
    if (hit) {
      const route = typeof hit.route === "string" ? hit.route : hit.route.light ?? hit.route.dark;
      const svg = await (await fetch(route)).text();
      return saveSvg(slug, svg, route);
    }
  } catch (e) { console.log(`svgl miss for ${name}: ${e.message}`); }
  // 2) Simple Icons — mono, single path (CC0)
  const si = await fetch(`https://cdn.jsdelivr.net/npm/simple-icons@13/icons/${slug.replace(/-/g, "")}.svg`);
  if (si.ok) return saveSvg(slug, await si.text(), "simple-icons");
  console.log(`MISS ${name} — try an explicit url: ${slug}=<svg/png url>  (brand site, README, Wikimedia)`);
}
for (const arg of process.argv.slice(2)) {
  const m = arg.match(/^([^=]+)=(https?:.+)$/);
  try { if (m) await fromUrl(slugify(m[1]), m[2]); else await search(arg); } catch (e) { console.log(`ERR ${arg}: ${e.message}`); }
}
execSync("node scripts/bundle-logos.mjs", { stdio: "inherit" });
