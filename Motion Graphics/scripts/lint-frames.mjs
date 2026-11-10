// Frame lint for rendered shots: samples stills, flags dead space, edge activity
// (possible clipped text) and near-identical consecutive samples (frozen holds),
// and writes a contact sheet. Run BEFORE looking, so you look at the right frames.
//   node scripts/lint-frames.mjs out/<slug>.mov [more...]      → out/lint/<slug>-sheet.png + report
import { execSync, spawnSync } from "node:child_process";
import { mkdirSync } from "node:fs";
const W = 192, H = 108, PAPER = [251, 251, 253];
const near = (px, i, ref, tol = 10) => Math.abs(px[i] - ref[0]) < tol && Math.abs(px[i + 1] - ref[1]) < tol && Math.abs(px[i + 2] - ref[2]) < tol;
for (const f of process.argv.slice(2)) {
  const slug = f.replace(/.*\//, "").replace(/\.\w+$/, "");
  mkdirSync("out/lint", { recursive: true });
  const dur = Number(execSync(`ffprobe -v error -show_entries format=duration -of csv=p=0 "${f}"`).toString());
  const n = Math.max(6, Math.min(12, Math.round(dur)));
  const frames = [];
  for (let i = 0; i < n; i++) {
    const t = (dur * (i + 0.5)) / n;
    const raw = spawnSync("ffmpeg", ["-nostdin", "-v", "error", "-ss", t.toFixed(3), "-i", f, "-frames:v", "1", "-f", "lavfi", "-i", "color=c=0xFBFBFD:s=1920x1080", "-filter_complex", "[1][0]overlay=shortest=1,scale=" + W + ":" + H + ",format=rgb24", "-f", "rawvideo", "-"], { maxBuffer: 1 << 26 }).stdout;
    frames.push({ t, px: raw });
  }
  const notes = [];
  frames.forEach((fr, i) => {
    const px = fr.px; if (!px || px.length < W * H * 3) return;
    let paper = 0, edge = 0, edgeN = 0;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const k = (y * W + x) * 3; const isPaper = near(px, k, PAPER, 14);
      if (isPaper) paper++;
      const onEdge = x < 4 || x >= W - 4 || y < 3 || y >= H - 3;
      if (onEdge) { edgeN++; if (!isPaper && !near(px, k, [10, 10, 12], 14)) edge++; }
    }
    const dead = paper / (W * H), edgeAct = edge / edgeN;
    if (dead > 0.93 && fr.t > 1 && fr.t < dur - 1) notes.push(`t=${fr.t.toFixed(1)}s  DEAD SPACE ${(dead * 100).toFixed(0)}% paper — nothing on screen?`);
    if (edgeAct > 0.25) notes.push(`t=${fr.t.toFixed(1)}s  EDGE ACTIVITY ${(edgeAct * 100).toFixed(0)}% — content touching the frame edge (clipped text/asset?)`);
    if (i > 0) { const prev = frames[i - 1].px; let diff = 0; for (let k = 0; k < px.length; k += 3) if (Math.abs(px[k] - prev[k]) > 8) diff++; const changed = diff / (W * H); if (changed < 0.002 && fr.t < dur - 1.5) notes.push(`t=${fr.t.toFixed(1)}s  FROZEN — <0.2% of pixels changed since ${frames[i - 1].t.toFixed(1)}s (no idle motion?)`); }
  });
  execSync(`ffmpeg -nostdin -v error -y -i "${f}" -f lavfi -i "color=c=0xFBFBFD:s=1920x1080:r=30" -filter_complex "[1][0]overlay=shortest=1,fps=${(n / dur).toFixed(4)},scale=480:-1,tile=${Math.ceil(n / 2)}x2:padding=4:color=0x333333" -frames:v 1 "out/lint/${slug}-sheet.png"`);
  console.log(`== ${slug}  ${dur.toFixed(1)}s  sheet: out/lint/${slug}-sheet.png`);
  console.log(notes.length ? notes.map((x) => "   " + x).join("\n") : "   clean");
}
