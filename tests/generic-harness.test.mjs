import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { createStaticServer } from "../scripts/serve.mjs";
import { resolvePlaywright, findChrome, findFfmpeg } from "../scripts/lib/dependencies.mjs";

const execute = promisify(execFile);
const skillRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const fixture = (name) => fs.readFileSync(path.join(skillRoot, "tests/fixtures", name), "utf8");
let browserAvailable = !!findChrome() && !!findFfmpeg(["trim", "scale", "tile"]);
try { resolvePlaywright(); } catch { browserAvailable = false; }
const browserTest = (name, fn) => test(name, { timeout: 90000,
  skip: !browserAvailable && "Set SCROLLFORGE_PLAYWRIGHT_ROOT and provide Chrome/ffmpeg for browser fixtures." }, fn);

const html = (body, css = "", script = "") => `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="icon" href="data:,"><style>body{margin:24px;background:white;color:black;font:18px Arial}${css}</style></head><body><main>${body}</main><script>${script}</script></body></html>`;

async function shoot(t, content, extra = []) {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), "scroll-forge-generic-"));
  fs.writeFileSync(path.join(temp, "index.html"), content);
  const server = createStaticServer(temp, { buildId: "generic-fixture", revision: "r1" });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  t.after(async () => { await new Promise((resolve) => server.close(resolve)); fs.rmSync(temp, { recursive: true, force: true }); });
  const out = path.join(temp, "shots");
  const args = [path.join(skillRoot, "scripts/shoot.mjs"), "--url", `http://127.0.0.1:${server.address().port}`, "--out", out,
    "--build-id", "generic-fixture", "--revision", "r1", "--height", "600", "--per-act", "5", "--ready-timeout", "1000", "--settle-timeout", "1000",
    ...(!extra.includes("--width") ? ["--width", "900"] : []), ...extra];
  let exitCode = 0, stdout;
  try { ({ stdout } = await execute(process.execPath, args, { cwd: skillRoot, env: process.env, timeout: 80000, maxBuffer: 1024 * 1024 })); }
  catch (error) { exitCode = error.code; stdout = error.stdout; }
  return { exitCode, stdout, report: JSON.parse(fs.readFileSync(path.join(out, "report.json"), "utf8")) };
}

browserTest("plain HTML without engine markers passes with semantic text coverage", async (t) => {
  const content = fixture("plain.html");
  assert.doesNotMatch(content, /sc-ready|data-sc-|scrollcraft/i);
  const result = await shoot(t, content);
  assert.equal(result.exitCode, 0, result.stdout);
  assert.equal(result.report.verdict, "PASS", result.stdout);
  assert.ok(result.report.inventory.cues.length >= 9);
  assert.equal(result.report.coverage.cuesVisible, result.report.inventory.cues.length);
  assert.equal(result.report.coverage.contrastGraded, result.report.inventory.cues.length);
  assert.ok(!result.report.findings.some((item) => ["ENGINE_NOT_READY", "NO_CUE_COVERAGE"].includes(item.code)));
  assert.equal(result.report.report[0].y, 0);
  assert.ok(result.report.report.length >= 5);
});

browserTest("broken declared font reports FONT_FALLBACK with face status evidence", async (t) => {
  const result = await shoot(t, fixture("broken-font.html"));
  assert.equal(result.exitCode, 1, result.stdout);
  assert.ok(result.report.findings.some((item) => item.code === "FONT_FALLBACK" && item.severity === "blocker"), result.stdout);
  assert.match(JSON.stringify(result.report.fonts), /Broken Fixture Face/);
  assert.match(JSON.stringify(result.report.fonts), /error/);
});

browserTest("plain HTML text overflow fails without engine cues", async (t) => {
  const result = await shoot(t, html("<p>Readable text must fit its viewport.</p>", "p{width:1200px;white-space:nowrap}"));
  assert.equal(result.exitCode, 1, result.stdout);
  assert.ok(result.report.findings.some((item) => item.code === "TEXT_OVERFLOW" && item.severity === "blocker"), result.stdout);
});

browserTest("mobile contrast uses screenshot scale when viewport metadata is absent", async (t) => {
  const content = html("<p>Low contrast text</p>",
    "body{margin:0;-webkit-text-size-adjust:none}p{margin:100px 0 0 600px;width:200px;background:#777;color:white;font-size:16px}")
    .replace('<meta name="viewport" content="width=device-width,initial-scale=1">', "");
  const result = await shoot(t, content, ["--width", "390"]);
  assert.equal(result.exitCode, 1, result.stdout);
  const finding = result.report.findings.find((item) => item.code === "CONTRAST_LOW");
  assert.ok(finding, result.stdout);
  assert.ok(finding.ratio > 4.4 && finding.ratio < 4.6, String(finding.ratio));
});

browserTest("an unused declared font does not fail visible system-font text", async (t) => {
  const result = await shoot(t, html("<h1>System font</h1><p>No missing family is used here.</p>",
    '@font-face{font-family:"Unused Fixture Face";src:url("/unused-font.woff2") format("woff2")}'));
  assert.equal(result.exitCode, 0, result.stdout);
  assert.equal(result.report.verdict, "PASS", result.stdout);
  assert.ok(!result.report.findings.some((item) => item.code === "FONT_FALLBACK"), result.stdout);
  assert.match(JSON.stringify(result.report.fonts), /Unused Fixture Face/i);
});

browserTest("narrow viewport and explicit mobile flag enable real touch emulation", async (t) => {
  const content = html('<p id="device"></p>', "", `document.querySelector('#device').textContent =
    'touch=' + (navigator.maxTouchPoints > 0) + ';coarse=' + matchMedia('(pointer:coarse)').matches +
    ';dpr=' + devicePixelRatio + ';mobile=' + /Mobile/.test(navigator.userAgent);`);
  for (const args of [["--width", "390"], ["--width", "900", "--mobile"]]) {
    const result = await shoot(t, content, args);
    assert.equal(result.exitCode, 0, result.stdout);
    assert.equal(result.report.viewport.isMobile, true);
    assert.equal(result.report.viewport.hasTouch, true);
    assert.equal(result.report.viewport.deviceScaleFactor, 2);
    assert.match(result.report.inventory.cues.map((cue) => cue.text).join(" "), /touch=true;coarse=true;dpr=2;mobile=true/);
  }
});

browserTest("desktop remains non-touch and pointer suppression is opt-in before navigation", async (t) => {
  const content = html('<p id="capture"></p>', "", `document.querySelector('#capture').textContent =
    'nativePointer=' + /\\[native code\\]/.test(Element.prototype.requestPointerLock.toString()) +
    ';touch=' + (navigator.maxTouchPoints > 0);`);
  const normal = await shoot(t, content);
  assert.equal(normal.exitCode, 0, normal.stdout);
  assert.equal(normal.report.viewport.isMobile, false);
  assert.equal(normal.report.viewport.hasTouch, false);
  assert.equal(normal.report.viewport.deviceScaleFactor, 1);
  assert.notEqual(normal.report.visualCapture, true);
  assert.match(normal.report.inventory.cues[0].text, /nativePointer=true;touch=false/);
  const visual = await shoot(t, content, ["--visual-capture"]);
  assert.equal(visual.exitCode, 0, visual.stdout);
  assert.equal(visual.report.visualCapture, true);
  assert.match(visual.report.inventory.cues[0].text, /nativePointer=false;touch=false/);
});

browserTest("shoot settles public canvas sequence records against the requested frame", async (t) => {
  for (const drawn of [2, 5]) {
    const content = html('<p>Readable sequence caption</p><canvas width="200" height="100"></canvas>', "", `
      document.documentElement.classList.add('sc-ready');
      const canvas = document.querySelector('canvas');
      canvas.getContext('2d').fillRect(0, 0, 200, 100);
      window.ScrollCraft = {instances: [{acts: [{live: true, seq: {el: canvas, requested: 5, drawn: ${drawn}}}]}]};`);
    const result = await shoot(t, content, ["--settle-timeout", drawn === 5 ? "1000" : "250"]);
    const stalled = result.report.findings.filter((item) => item.code === "SEQUENCE_STALLED");
    if (drawn !== 5) {
      assert.equal(result.exitCode, 1, result.stdout);
      assert.ok(stalled.length > 0, result.stdout);
      assert.ok(stalled.every((item) => item.severity === "blocker" && item.requested === 5 && item.drawn === 2));
    } else {
      assert.equal(result.exitCode, 0, result.stdout);
      assert.equal(result.report.verdict, "PASS", result.stdout);
      assert.deepEqual(stalled, []);
      assert.ok(result.report.report.every((sample) => sample.settled));
    }
  }
});
