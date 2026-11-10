// Live numbers at render time. Replaces placeholders inside props/*.json strings:
//   {{github-stars:owner/repo}}            → "43.4k"
//   {{github-forks:owner/repo}}            → "4.0k"
//   {{fetch:<url>:<regex-with-one-group>}} → first capture group of the page text
//   {{date}}                               → e.g. 6 Sep 2026
//   node scripts/resolve-props.mjs props/10b-github.json [more...]   (writes back in place; keeps a .src.json copy)
import { readFile, writeFile, copyFile } from "node:fs/promises";
const UA = "Mozilla/5.0";
const k = (n) => (n >= 1000 ? `${(n / 1000).toFixed(1).replace(/\.0$/, "")}k` : String(n));
async function resolve(str) {
  const re = /\{\{(github-stars|github-forks|fetch|date)(?::([^}]*))?\}\}/g;
  let out = str, m;
  while ((m = re.exec(str))) {
    let v = m[0];
    try {
      if (m[1].startsWith("github-")) { const d = await (await fetch(`https://api.github.com/repos/${m[2]}`, { headers: { "user-agent": UA } })).json(); v = k(m[1] === "github-stars" ? d.stargazers_count : d.forks_count); }
      else if (m[1] === "fetch") { const i = m[2].lastIndexOf(":"); const url = m[2].slice(0, i), rx = new RegExp(m[2].slice(i + 1), "i"); const html = (await (await fetch(url, { headers: { "user-agent": UA } })).text()).replace(/<[^>]+>/g, " "); v = (html.match(rx) || [])[1] ?? v; }
      else if (m[1] === "date") v = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
    } catch (e) { console.log(`unresolved ${m[0]}: ${e.message}`); }
    out = out.replace(m[0], v); console.log(`${m[0]} → ${v}`);
  }
  return out;
}
for (const f of process.argv.slice(2)) {
  const src = await readFile(f, "utf8");
  if (!/\{\{/.test(src)) { console.log(`${f}: nothing to resolve`); continue; }
  await copyFile(f, f.replace(/\.json$/, ".src.json")).catch(() => {});
  await writeFile(f, await resolve(src)); console.log(`wrote ${f}`);
}
