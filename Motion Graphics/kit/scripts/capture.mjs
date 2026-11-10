// Real-web receipts with the SYSTEM Chrome via playwright-core (no browser download, no keys).
//   node scripts/capture.mjs screenshot <url> <out.png> [--width=1440] [--height=900] [--scale=2] [--full] [--selector=css] [--wait=ms] [--dark] [--hide=css,css]
//   node scripts/capture.mjs screenshot <url> <out.png> --mobile   # iPhone viewport → DeviceFrame "phone"
//   node scripts/capture.mjs probe <url>                 # prints CSS-px rects of headings/main/article/images → ring coordinates
//   node scripts/capture.mjs ogimage <url> <out>         # download the page's og:image
//   node scripts/capture.mjs record <url> <out.mp4> [--duration=6] [--script=actions.json] [--width=1440] [--height=900] [--scale=2]
//        deterministic 30fps screen recording (scroll / move / hover / click / type), H.264 mp4 — feed to ScreenFrame `video`
// Output PNG is also resampled to 1600px wide as <out>-1600.png (what ScreenFrame/ToolCard load).
import { chromium } from "playwright-core";
import { writeFile, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { execSync } from "node:child_process";
const [cmd, url, outArg, ...rest] = process.argv.slice(2);
const flags = Object.fromEntries(rest.map((f) => { const m = f.match(/^--([^=]+)(?:=(.*))?$/); return m ? [m[1], m[2] ?? true] : [f, true]; }));
const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
const CHROME = ["/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "/Applications/Chromium.app/Contents/MacOS/Chromium", "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge"];
const CONSENT = ["#onetrust-accept-btn-handler", "#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll", "button[aria-label*='Accept' i]", "button:has-text('Accept all')", "button:has-text('Accept')", "button:has-text('I agree')"];
const HIDE = ["#onetrust-consent-sdk", "#CybotCookiebotDialog", "[class*='cookie-banner']", "[id*='cookie-banner']", "[id*='consent-banner']", "[class*='usercentrics']", ".qc-cmp2-container"];
if (!cmd || !url) { console.log("usage: capture.mjs screenshot|probe|ogimage|record <url> [out] [flags]"); process.exit(1); }

if (cmd === "ogimage") {
  const html = await (await fetch(url, { headers: { "user-agent": UA } })).text();
  const m = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
  if (!m) { console.log("NO og:image"); process.exit(2); }
  const img = new URL(m[1], url).href; const out = resolve(outArg);
  await mkdir(dirname(out), { recursive: true });
  await writeFile(out, Buffer.from(await (await fetch(img, { headers: { "user-agent": UA } })).arrayBuffer()));
  console.log(`saved ${out}  (${img})`); process.exit(0);
}

const fs = await import("node:fs");
const executablePath = CHROME.find((p) => fs.existsSync(p));
if (!executablePath) { console.log("No system Chrome/Chromium/Edge found"); process.exit(3); }
const mobile = !!flags.mobile; // --mobile = iPhone viewport + UA → feed DeviceFrame kind "phone"
const width = Number(flags.width ?? (mobile ? 390 : 1440)), height = Number(flags.height ?? (mobile ? 844 : 900)), scale = Number(flags.scale ?? (mobile ? 3 : 2));
const browser = await chromium.launch({ executablePath, headless: true });
try {
  const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: scale, userAgent: mobile ? "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1" : UA, isMobile: mobile, hasTouch: mobile, colorScheme: flags.dark ? "dark" : "light", locale: "en-US" });
  const page = await ctx.newPage();
  await page.goto(url, { waitUntil: "networkidle", timeout: 60000 }).catch(() => {});
  await page.waitForTimeout(Number(flags.wait ?? 2500));
  for (const sel of CONSENT) { try { const b = page.locator(sel).first(); if (await b.isVisible({ timeout: 300 })) { await b.click({ timeout: 1000 }); break; } } catch {} }
  const hide = [...HIDE, ...(flags.hide ? String(flags.hide).split(",") : [])];
  await page.addStyleTag({ content: hide.map((s) => `${s}{display:none!important}`).join("\n") }).catch(() => {});
  if (cmd === "probe") {
    const rows = await page.evaluate(() => {
      const out = []; const push = (tag, el) => { const r = el.getBoundingClientRect(); if (r.width > 0 && r.height > 0) out.push(`${tag.padEnd(8)} x=${Math.round(r.left + scrollX)} y=${Math.round(r.top + scrollY)} w=${Math.round(r.width)} h=${Math.round(r.height)}  "${(el.innerText || el.alt || "").trim().slice(0, 70).replace(/\n/g, " ")}"`); };
      for (const t of ["h1", "h2", "h3", "main", "article", "table", "pre", "img", "video", "button"]) document.querySelectorAll(t).forEach((el, i) => i < 25 && push(t, el));
      return out;
    });
    console.log(`title: ${await page.title()}`); console.log(rows.join("\n")); process.exit(0);
  }
  if (cmd === "record") {
    // Frame-stepped recorder (ported from news-reels/tools/capture.mjs): the choreography
    // advances exactly 1/30 s per captured frame, so the clip is perfectly smooth.
    const FPS = 30, S = scale, out = resolve(outArg ?? "clip.mp4"); await mkdir(dirname(out), { recursive: true });
    const os = await import("node:os"), pathm = await import("node:path");
    const tmp = fs.mkdtempSync(pathm.join(os.tmpdir(), "md-rec-"));
    await page.setViewportSize({ width: width * S, height: height * S });
    if (S !== 1) { await page.evaluate((z) => (document.documentElement.style.zoom = String(z)), S); await page.waitForTimeout(600); }
    const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    const duration = Number(flags.duration ?? 6);
    let actions;
    if (flags.script) {
      actions = JSON.parse(fs.readFileSync(String(flags.script), "utf8")).map((a) => ({ ...a, t: a.t ?? 0, dur: a.duration != null ? a.duration / 1000 : ({ scroll: 1.5, move: 0.7, hover: 0.7, click: 0.15, type: 0 }[a.action] ?? 0.5), px: a.px != null ? a.px * S : undefined, x: a.x != null && !a.selector ? a.x * S : a.x, y: a.y != null && !a.selector ? a.y * S : a.y })).sort((a, b) => a.t - b.t);
    } else {
      const scrollable = await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight);
      const hold = Math.min(0.8, duration * 0.1), sd = duration - 2 * hold;
      const px = Math.max(0, Math.min(scrollable, sd * 220 * S));
      actions = px > 0 ? [{ action: "scroll", t: hold, dur: sd, px }] : [];
    }
    const cdp = await ctx.newCDPSession(page);
    const total = Math.round(duration * FPS);
    let base = await page.evaluate(() => window.scrollY), mouse = { x: 0, y: 0 }, dirty = false;
    const center = async (sel) => { try { const b = await page.locator(sel).first().boundingBox({ timeout: 3000 }); if (b) return { x: b.x + b.width / 2, y: b.y + b.height / 2 }; } catch {} console.log(`record: selector not visible, skipped: ${sel}`); return null; };
    for (let k = 0; k < total; k++) {
      const t = k / FPS; let sy = base;
      for (const a of actions) {
        if (a.done || t < a.t) continue;
        if (!a.started) {
          a.started = true;
          if (["move", "hover", "click"].includes(a.action)) { const c = a.selector ? await center(a.selector) : { x: a.x, y: a.y }; if (!c) { a.done = true; continue; } a.tx = c.x; a.ty = c.y; a.fx = mouse.x; a.fy = mouse.y; }
          if (a.action === "scroll") a.from = sy;
          if (a.action === "type") { if (a.selector) await page.locator(a.selector).first().click(); a.chars = [...(a.text ?? "")]; a.typed = 0; a.delay = (a.delay ?? 55) / 1000; }
        }
        const p = a.dur > 0 ? Math.min(1, (t - a.t) / a.dur) : 1;
        if (a.action === "scroll") { sy = a.from + a.px * ease(p); base = sy; if (p >= 1) a.done = true; }
        else if (a.action === "move" || a.action === "hover" || a.action === "click") {
          const e = ease(p); mouse = { x: a.fx + (a.tx - a.fx) * e, y: a.fy + (a.ty - a.fy) * e }; dirty = true;
          if (p >= 1) { if (a.action === "click") await page.mouse.click(a.tx, a.ty); a.done = true; }
        } else if (a.action === "type") {
          const want = Math.min(a.chars.length, Math.floor((t - a.t) / Math.max(a.delay, 1 / FPS)) + 1);
          while (a.typed < want) await page.keyboard.type(a.chars[a.typed++]);
          if (a.typed >= a.chars.length) a.done = true;
        } else a.done = true;
      }
      await page.evaluate((y) => window.scrollTo(0, y), sy);
      if (dirty) { await page.mouse.move(mouse.x, mouse.y); dirty = false; }
      const shot = await cdp.send("Page.captureScreenshot", { format: "jpeg", quality: 92, optimizeForSpeed: true });
      fs.writeFileSync(pathm.join(tmp, `f-${String(k).padStart(5, "0")}.jpg`), Buffer.from(shot.data, "base64"));
    }
    execSync(`ffmpeg -nostdin -y -v error -framerate ${FPS} -i "${pathm.join(tmp, "f-%05d.jpg")}" -c:v libx264 -crf 17 -pix_fmt yuv420p -an "${out}"`);
    fs.rmSync(tmp, { recursive: true, force: true });
    console.log(`saved ${out}  ${width * S}x${height * S}  ${duration}s @ ${FPS}fps  (${total} frames; page css ${width}x${height})`);
    await browser.close(); process.exit(0);
  }
  const out = resolve(outArg ?? "shot.png"); await mkdir(dirname(out), { recursive: true });
  if (flags.selector) { const el = page.locator(String(flags.selector)).first(); await el.scrollIntoViewIfNeeded(); await el.screenshot({ path: out }); }
  else await page.screenshot({ path: out, fullPage: !!flags.full });
  console.log(`saved ${out}`);
  if (!mobile) { try { execSync(`sips -Z 1600 --resampleWidth 1600 "${out}" --out "${out.replace(/\.png$/, "-1600.png")}"`, { stdio: "ignore" }); console.log(`saved ${out.replace(/\.png$/, "-1600.png")}  (ScreenFrame/ToolCard size)`); } catch {} }
} finally { await browser.close(); }
