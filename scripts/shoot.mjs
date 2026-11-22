#!/usr/bin/env node
// Sample scroll states, produce evidence, and fail closed on defects or gaps.
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { resolvePlaywright, findChrome, findFfmpeg, readIdentity } from "./lib/dependencies.mjs";
import { assessSamples, assessFonts, finalVerdict, validateIdentity } from "./lib/verification.mjs";
import { inventoryPage, captureState, contrastTargets, measureContrast, fontEvidence, mediaState } from "./lib/browser-verification.mjs";

const argv = process.argv.slice(2);
const arg = (name, fallback) => { const i = argv.indexOf(name); return i >= 0 ? argv[i + 1] : fallback; };
if (argv.includes("--help")) {
  console.log("shoot.mjs --url URL --out DIR --manifest build-manifest.json\n  [--build-id ID --revision REV] [--per-act 6] [--width 1440 --height 900]\n  [--mobile] [--visual-capture] [--reduced-motion] [--report-only]\n  [--settle-timeout 4000] [--ready-timeout 15000]\nWidths below 768 imply --mobile. --visual-capture suppresses pointer lock/capture.\nExit: 0 PASS, 1 FAIL, 2 INCOMPLETE; --report-only returns 0 but preserves verdict.");
  process.exit(0);
}
const OUT = path.resolve(arg("--out", "lab/shots"));
fs.mkdirSync(OUT, { recursive: true });
const result = {
  schemaVersion: 2, startedAt: new Date().toISOString(), url: arg("--url", "http://127.0.0.1:4500"),
  verdict: "INCOMPLETE", findings: [], inventory: { cues: [], clips: [], rails: [], segs: [] },
  coverage: {}, report: [], consoleErrors: [], failed: [], contactSheet: { status: "incomplete" },
  limitations: ["Sampled laboratory checks, not WCAG certification or proof of smooth motion.",
    "Contrast is a 32x16 pixel-per-text-rectangle heuristic; gradients, clipping, antialiasing and unsampled transitions need visual review.",
    "Real devices, keyboard interaction, no-JavaScript fallback, meaning and composition require separate checks.",
    "Manifest asset hashes are recorded but not validated by this browser harness."],
};
let browser;
try {
  const valueFlags = new Set(["--url", "--out", "--manifest", "--build-id", "--revision", "--width", "--height", "--per-act", "--steps", "--settle-timeout", "--ready-timeout"]);
  for (let i = 0; i < argv.length; i++) {
    if (["--reduced-motion", "--report-only", "--mobile", "--visual-capture"].includes(argv[i])) continue;
    if (!valueFlags.has(argv[i])) throw new Error(`Unknown argument: ${argv[i]}`);
    if (!argv[i + 1] || argv[i + 1].startsWith("--")) throw new Error(`Missing value for ${argv[i]}`);
    i++;
  }
  const width = Number(arg("--width", "1440")), height = Number(arg("--height", "900"));
  const perAct = Number(arg("--per-act", arg("--steps", "6")));
  const settleTimeout = Number(arg("--settle-timeout", "4000"));
  const readyTimeout = Number(arg("--ready-timeout", "15000"));
  if (![width, height, perAct, settleTimeout, readyTimeout].every((n) => Number.isInteger(n) && n > 0) || perAct < 2) throw new Error("Dimensions/timeouts must be positive integers; --per-act must be at least 2.");
  const reduced = argv.includes("--reduced-motion");
  const mobile = width < 768 || argv.includes("--mobile"), dpr = mobile ? 2 : 1;
  const userAgent = mobile ? "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Mobile Safari/537.36" : undefined;
  result.viewport = { width, height, deviceScaleFactor: dpr, isMobile: mobile, hasTouch: mobile, reducedMotion: reduced };
  result.visualCapture = argv.includes("--visual-capture");
  result.expectedIdentity = readIdentity({ manifest: arg("--manifest"), buildId: arg("--build-id"), revision: arg("--revision") });
  const { chromium } = resolvePlaywright();
  const chrome = findChrome();
  if (!chrome) throw new Error("Installed Chrome not found. Set SCROLLCRAFT_CHROME to its executable.");
  browser = await chromium.launch({ executablePath: chrome, headless: true });
  const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: dpr, isMobile: mobile, hasTouch: mobile,
    userAgent, reducedMotion: reduced ? "reduce" : "no-preference" });
  if (result.visualCapture) {
    await page.addInitScript(() => {
      Element.prototype.requestPointerLock = function () { return Promise.reject(new Error("Native pointer lock disabled during visual capture")); };
      Element.prototype.setPointerCapture = function () {};
      Element.prototype.releasePointerCapture = function () {};
      Document.prototype.exitPointerLock = function () {};
    });
    result.limitations.push("Visual capture mode suppressed pointer lock and pointer capture before navigation; pointer interactions were not functionally verified.");
  }
  page.on("console", (message) => { if (message.type() === "error") result.consoleErrors.push(message.text()); });
  page.on("pageerror", (error) => result.consoleErrors.push(String(error)));
  page.on("requestfailed", (request) => result.failed.push({ url: request.url(), error: request.failure()?.errorText }));
  page.on("response", (response) => { if (response.status() >= 400) result.failed.push({ url: response.url(), status: response.status() }); });
  const response = await page.goto(result.url, { waitUntil: "domcontentloaded", timeout: readyTimeout });
  result.servedUrl = page.url();
  result.observedIdentity = {
    headers: { buildId: response?.headers()["x-scroll-forge-build-id"], revision: response?.headers()["x-scroll-forge-revision"] },
    meta: await page.evaluate(() => ({ buildId: document.querySelector('meta[name="scroll-forge-build-id"]')?.content,
      revision: document.querySelector('meta[name="scroll-forge-revision"]')?.content })),
  };
  result.findings.push(...validateIdentity(result.expectedIdentity, result.observedIdentity));
  if (result.findings.some((finding) => finding.code === "IDENTITY_MISMATCH")) throw new Error("Refusing to grade a different build/revision.");
  result.usesEngine = await page.evaluate(() => !!document.querySelector('[data-sc-act],[data-sc-mode]') ||
    [...document.scripts].some((script) => /scrollcraft/i.test(script.src + ' ' + script.textContent)));
  if (result.usesEngine) {
    try { await page.waitForSelector("html.sc-ready", { state: "attached", timeout: readyTimeout }); }
    catch { result.findings.push({ code: "ENGINE_NOT_READY", severity: "incomplete", message: "Engine ready marker was not observed; fallback DOM is still inventoried." }); }
  }
  Object.assign(result.viewport, await page.evaluate(() => ({ userAgent: navigator.userAgent, maxTouchPoints: navigator.maxTouchPoints,
    layoutWidth: innerWidth, layoutHeight: innerHeight })));
  const waitFonts = () => page.evaluate(async (timeout) => {
    await Promise.race([document.fonts.ready, new Promise((_, reject) => setTimeout(() => reject(new Error("Font load timeout")), timeout))]);
  }, readyTimeout);
  await waitFonts();
  result.fonts = await page.evaluate(fontEvidence);
  result.inventory = await page.evaluate(inventoryPage);
  if (!result.inventory.cues.length) result.findings.push({ code: "NO_CUE_COVERAGE", severity: "incomplete", message: "No engine cues or visible semantic text blocks were inventoried; readability and contrast were not assessed." });
  result.doc = await page.evaluate(() => ({ height: Math.max(document.body.scrollHeight, document.documentElement.scrollHeight), vh: innerHeight,
    world: !!document.querySelector('[data-sc-mode="worldflight"]'), acts: [...document.querySelectorAll("[data-sc-act]")].map((el) => el.dataset.scAct) }));
  const positions = await page.evaluate((count) => {
    const max = Math.max(0, Math.max(document.body.scrollHeight, document.documentElement.scrollHeight) - innerHeight);
    if (!document.querySelector('[data-sc-act],[data-sc-mode]')) {
      const stops = Math.max(count, Math.ceil(max / (innerHeight * 0.8)) + 1);
      return Array.from({ length: stops }, (_, i) => Math.round(max * i / (stops - 1))).filter((y, i, ys) => i === 0 || y !== ys[i - 1]);
    }
    const out = [0, max], fractions = Array.from({ length: count }, (_, i) => 0.02 + (i / (count - 1)) * 0.96);
    document.querySelectorAll("[data-sc-act]").forEach((el) => {
      const top = el.getBoundingClientRect().top + scrollY, h = el.offsetHeight;
      const pinned = ["pin", "pan", "scrub"].includes(el.dataset.scAct);
      const position = (p) => pinned ? top + (h - innerHeight) * p : top - innerHeight + (h + innerHeight) * p;
      fractions.forEach((p) => out.push(position(p)));
      el.querySelectorAll("[data-sc-cue]").forEach((cue) => {
        const values = cue.dataset.scCue.split(/\s+/).map(Number).filter(Number.isFinite);
        values.forEach((p) => [-0.03, 0, 0.03].forEach((delta) => out.push(position(Math.max(0, Math.min(1, p + delta))))));
        if (values.length > 1) out.push(position((values[0] + values[1]) / 2));
      });
      if (el.dataset.scAct === "scrub") [0.6, 0.75, 0.9].forEach((v) => { out.push(top - innerHeight * (1 - v), top + h - innerHeight * v); });
    });
    document.querySelectorAll('[data-sc-mode="worldflight"]').forEach((root) => {
      const top = root.getBoundingClientRect().top + scrollY, seam = parseFloat(root.dataset.scSeam) || 0.12;
      let sum = 0;
      root.querySelectorAll("[data-sc-segment]").forEach((seg) => {
        const weight = parseFloat(seg.dataset.scW) || 1.3;
        fractions.forEach((p) => out.push(top + (sum + weight * p) * innerHeight));
        sum += weight;
        [-0.5, -0.2, 0, 0.2, 0.5].forEach((p) => out.push(top + (sum + p * seam) * innerHeight));
      });
      root.querySelectorAll("[data-sc-copy]").forEach((cue) => {
        const values = (cue.dataset.scWindow || "").split(/\s+/).map(Number).filter(Number.isFinite);
        values.forEach((p) => [-0.015, 0, 0.015].forEach((delta) => out.push(top + (p + delta) * sum * innerHeight)));
        if (values.length > 1) out.push(top + ((values[0] + values[1]) / 2) * sum * innerHeight);
      });
    });
    if (!document.querySelector("[data-sc-act],[data-sc-mode='worldflight']")) fractions.forEach((p) => out.push(max * p));
    return [...new Set(out.map((y) => Math.round(Math.max(0, Math.min(max, y)))))].sort((a, b) => a - b);
  }, perAct);
  async function settle() {
    const until = Date.now() + settleTimeout;
    let previous = null, stable = 0, state;
    while (Date.now() < until) {
      state = await page.evaluate(mediaState);
      const signature = JSON.stringify([state.times, state.sequences]);
      if (state.arrived && !state.seeking && state.sequences.every((seq) => Number.isInteger(seq.requested) && seq.requested === seq.drawn) && previous === signature) stable++; else stable = 0;
      if (stable >= 3) return { settled: true, sequences: state.sequences };
      previous = signature;
      await page.waitForTimeout(60);
    }
    return { settled: false, sequences: state?.sequences || [] };
  }
  for (const [i, y] of positions.entries()) {
    await page.evaluate((top) => scrollTo({ top, behavior: "instant" }), y);
    await page.waitForTimeout(100);
    const { settled, sequences } = await settle();
    await waitFonts();
    const state = await page.evaluate(captureState);
    const fonts = await page.evaluate(fontEvidence);
    fonts.used = [...new Map([...result.fonts.used, ...fonts.used].map((entry) => [JSON.stringify(entry), entry])).values()];
    result.fonts = fonts;
    await page.screenshot({ path: path.join(OUT, `${String(i).padStart(2, "0")}.png`) });
    const targets = await page.evaluate(contrastTargets);
    const mask = await page.addStyleTag({ content: "[data-sc-shot-cues],[data-sc-shot-cues] *{color:transparent!important;-webkit-text-fill-color:transparent!important;text-shadow:none!important;-webkit-text-stroke-color:transparent!important}" });
    let contrast;
    try {
      const b64 = (await page.screenshot({ type: "png" })).toString("base64");
      contrast = await page.evaluate(measureContrast, { b64, dpr, targets });
    } finally { await mask.evaluate((element) => element.remove()); }
    result.report.push({ i, y, pct: Math.round(100 * y / Math.max(1, result.doc.height - result.doc.vh)), settled, sequences, contrast, ...state });
    console.log(`${String(i).padStart(2, "0")}.png y=${y} settled=${settled}`);
  }
  const assessment = assessSamples({ inventory: result.inventory, samples: result.report, vh: result.doc.vh, reduced, world: result.doc.world });
  result.findings.push(...assessment.findings, ...assessFonts(result.fonts));
  result.coverage = assessment.coverage;
  result.coverage.assetHashes = { status: "not-checked", declared: result.expectedIdentity.assets.length };
  if (result.consoleErrors.length) result.findings.push({ code: "BROWSER_ERRORS", severity: "blocker", message: `${result.consoleErrors.length} browser error(s); see consoleErrors.` });
  if (result.failed.length) result.findings.push({ code: "REQUEST_FAILURES", severity: "blocker", message: `${result.failed.length} failed request(s); see failed.` });
  const ffmpeg = findFfmpeg(["trim", "scale", "tile"]);
  if (!ffmpeg) throw new Error("Contact sheet requires ffmpeg with trim, scale and tile filters.");
  const columns = Math.min(5, result.report.length), rows = Math.ceil(result.report.length / columns);
  const sheetPath = path.join(OUT, "sheet.png");
  const sheet = spawnSync(ffmpeg, ["-y", "-v", "error", "-i", path.join(OUT, "%02d.png"),
    "-vf", `trim=end_frame=${result.report.length},scale=520:-1,tile=${columns}x${rows}`, "-frames:v", "1", sheetPath], { encoding: "utf8", timeout: 60000 });
  if (sheet.status !== 0 || !fs.existsSync(sheetPath)) throw new Error(`Contact sheet failed: ${sheet.error?.message || sheet.stderr || sheet.status}`);
  result.contactSheet = { status: "complete", path: sheetPath };
} catch (error) {
  result.findings.push({ code: "HARNESS_INCOMPLETE", severity: "incomplete", message: error.message });
} finally {
  if (browser) await browser.close().catch((error) => result.findings.push({ code: "BROWSER_CLOSE_FAILED", severity: "incomplete", message: error.message }));
  if (result.consoleErrors.length && !result.findings.some((item) => item.code === "BROWSER_ERRORS")) result.findings.push({ code: "BROWSER_ERRORS", severity: "blocker", message: "Browser errors occurred; see consoleErrors." });
  if (result.failed.length && !result.findings.some((item) => item.code === "REQUEST_FAILURES")) result.findings.push({ code: "REQUEST_FAILURES", severity: "blocker", message: "Requests failed; see failed." });
  if (result.contactSheet.status !== "complete") result.findings.push({ code: "CONTACT_SHEET_MISSING", severity: "incomplete", message: "No contact sheet was completed for this run." });
  result.verdict = finalVerdict(result.findings);
  result.finishedAt = new Date().toISOString();
  fs.writeFileSync(path.join(OUT, "report.json"), JSON.stringify(result, null, 2) + "\n");
  for (const finding of result.findings) console.log(`${finding.severity.toUpperCase()} ${finding.code}: ${finding.message}`);
  console.log(`${result.verdict}: ${path.join(OUT, "report.json")}`);
  process.exitCode = argv.includes("--report-only") || result.verdict === "PASS" ? 0 : result.verdict === "FAIL" ? 1 : 2;
}
