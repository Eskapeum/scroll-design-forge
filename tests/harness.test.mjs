import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import http from "node:http";
import { fileURLToPath } from "node:url";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { createStaticServer } from "../scripts/serve.mjs";
import { assessSamples, finalVerdict, validateIdentity, visibleSignature } from "../scripts/lib/verification.mjs";
import { resolvePlaywright, findChrome, findFfmpeg } from "../scripts/lib/dependencies.mjs";

const execute = promisify(execFile), skillRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sample = (overrides = {}) => ({ i: 0, y: 0, settled: true, cues: [], clips: [], rails: [], stages: [], segs: [], wipes: [], custom: [], contrast: [], ...overrides });
const inventory = (overrides = {}) => ({ cues: [], clips: [], rails: [], segs: [], ...overrides });

test("verdict fails blockers, distinguishes incomplete, and passes clean checks", () => {
  assert.equal(finalVerdict([]), "PASS");
  assert.equal(finalVerdict([{ severity: "warning" }]), "PASS");
  assert.equal(finalVerdict([{ severity: "incomplete" }]), "INCOMPLETE");
  assert.equal(finalVerdict([{ severity: "incomplete" }, { severity: "blocker" }]), "FAIL");
});

test("identity requires expectations and rejects any conflicting source", () => {
  assert.equal(validateIdentity({}, {}).length, 2);
  const expected = { buildId: "a", revision: "r1" };
  assert.deepEqual(validateIdentity(expected, { meta: expected }), []);
  assert.equal(validateIdentity(expected, { meta: expected, headers: { ...expected, revision: "r2" } })[0].code, "IDENTITY_MISMATCH");
});

test("opacity-zero duplicate text cues stay separate and unpainted video fails", () => {
  const result = assessSamples({ vh: 900, inventory: inventory({ cues: [{ id: "a", text: "Buy" }, { id: "b", text: "Buy" }], clips: [{ id: "clip" }] }),
    samples: [sample({ cues: [{ id: "a", visible: true, o: 1 }, { id: "b", visible: true, o: 0 }],
      clips: [{ id: "clip", vis: 1, painted: false, t: 0 }], contrast: [{ id: "a", status: "graded", worst: 7, threshold: 4.5 }] })] });
  assert.equal(result.coverage.cuesExpected, 2);
  assert.equal(result.coverage.cuesVisible, 1);
  assert.ok(result.findings.some((finding) => finding.code === "CUE_NEVER_VISIBLE" && finding.id === "b"));
  assert.ok(result.findings.some((finding) => finding.code === "CLIP_UNPAINTED"));
});

test("unsettled seeks and zero pan overflow are blockers", () => {
  const result = assessSamples({ vh: 900, inventory: inventory({ rails: [{ id: "pan" }] }),
    samples: [sample({ settled: false, rails: [{ id: "pan", visible: true, overflow: 0 }] })] });
  assert.deepEqual(result.findings.map((finding) => finding.code).sort(), ["PAN_NO_OVERFLOW", "SEEK_UNSETTLED"]);
});

test("offscreen changing geometry cannot mask a dead visible pin", () => {
  const a = sample({ stages: [{ id: "live", visible: true, pinned: true, top: 0 }, { id: "offscreen", visible: false, pinned: true, top: 2000 }] });
  const b = sample({ ...a, y: 500, stages: [{ ...a.stages[0] }, { ...a.stages[1], top: 1500 }] });
  assert.equal(visibleSignature(a), visibleSignature(b));
  assert.ok(assessSamples({ vh: 900, inventory: inventory(), samples: [a, b] }).findings.some((finding) => finding.code === "DEAD_SCROLL"));
  assert.equal(assessSamples({ vh: 900, reduced: true, inventory: inventory(), samples: [a, b] }).findings.length, 0);
});

test("build doctor does not require video tools and rejects unknown flags", async () => {
  const args = [path.join(skillRoot, "scripts/doctor.mjs"), "--mode", "build", "--json"];
  const { stdout } = await execute(process.execPath, args, { env: { ...process.env, SCROLLCRAFT_FFMPEG: "/missing/ffmpeg", SCROLLCRAFT_CHROME: "/missing/chrome" } });
  const report = JSON.parse(stdout);
  assert.equal(report.verdict, "PASS");
  assert.deepEqual(report.checks.map((check) => check.name), ["node", "workspace"]);
  await assert.rejects(execute(process.execPath, [...args, "--typo"]), (error) => error.code === 1 && error.stderr.includes("Unknown argument"));
});

async function fixtureServer(t, html = "hello") {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), "scroll-forge-harness-"));
  const root = path.join(temp, "site");
  fs.mkdirSync(root);
  fs.writeFileSync(path.join(root, "index.html"), html);
  const server = createStaticServer(root, { buildId: "fixture", revision: "r1" });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  t.after(async () => { await new Promise((resolve) => server.close(resolve)); fs.rmSync(temp, { recursive: true, force: true }); });
  return { temp, root, server, url: `http://127.0.0.1:${server.address().port}` };
}

function rawRequest(url, pathname, headers = {}) {
  const target = new URL(url);
  return new Promise((resolve, reject) => {
    http.get({ hostname: target.hostname, port: target.port, path: pathname, headers }, (response) => {
      let body = "";
      response.on("data", (chunk) => { body += chunk; });
      response.on("end", () => resolve({ status: response.statusCode, headers: response.headers, body }));
    }).on("error", reject);
  });
}

test("server contains sibling paths and symlinks, rejects malformed URLs, and serves ranges", async (t) => {
  const fixture = await fixtureServer(t, "abcdef");
  const sibling = path.join(fixture.temp, "site-private");
  fs.mkdirSync(sibling);
  fs.writeFileSync(path.join(sibling, "secret"), "private");
  fs.symlinkSync(path.join(sibling, "secret"), path.join(fixture.root, "outside"));
  assert.equal((await rawRequest(fixture.url, "/%2e%2e/site-private/secret")).status, 403);
  assert.equal((await rawRequest(fixture.url, "/outside")).status, 403);
  assert.equal((await rawRequest(fixture.url, "/%ZZ")).status, 400);
  const response = await rawRequest(fixture.url, "/", { Range: "bytes=1-3" });
  assert.equal(response.status, 206);
  assert.equal(response.body, "bcd");
  assert.equal(response.headers["x-scroll-forge-build-id"], "fixture");
  assert.equal((await rawRequest(fixture.url, "/", { Range: "bytes=99-" })).status, 416);
  assert.equal(fixture.server.address().address, "127.0.0.1");
});

let browserAvailable = !!findChrome() && !!findFfmpeg(["scale", "tile"]);
try { resolvePlaywright(); } catch { browserAvailable = false; }
const browserTest = (name, fn) => test(name, { skip: !browserAvailable && "Set SCROLLFORGE_PLAYWRIGHT_ROOT and provide Chrome/ffmpeg for browser fixtures.", timeout: 90000 }, fn);
const html = (body, css = "", script = "") => `<!doctype html><html class="sc-ready"><head><link rel="icon" href="data:,"><meta name="scroll-forge-build-id" content="fixture"><meta name="scroll-forge-revision" content="r1"><style>body{margin:0;background:white;color:black;font:16px Arial}section{padding:32px}${css}</style></head><body>${body}<script>${script}</script></body></html>`;

async function shoot(t, content, extra = [], env = {}) {
  const fixture = await fixtureServer(t, content), out = path.join(fixture.temp, "shots");
  const args = [path.join(skillRoot, "scripts/shoot.mjs"), "--url", fixture.url, "--out", out,
    "--build-id", "fixture", "--revision", "r1", "--width", "640", "--height", "480", "--per-act", "2", "--ready-timeout", "1000", "--settle-timeout", "1000", ...extra];
  let exitCode = 0, stdout;
  try { ({ stdout } = await execute(process.execPath, args, { cwd: skillRoot, env: { ...process.env, ...env }, timeout: 80000, maxBuffer: 1024 * 1024 })); }
  catch (error) { exitCode = error.code; stdout = error.stdout; }
  return { ...fixture, exitCode, stdout, report: JSON.parse(fs.readFileSync(path.join(out, "report.json"), "utf8")) };
}

browserTest("real browser writes final PASS after sheet and coverage are complete", async (t) => {
  const result = await shoot(t, html('<section><p data-sc-cue="">Readable content</p></section>'));
  assert.equal(result.exitCode, 0, result.stdout);
  assert.equal(result.report.verdict, "PASS", result.stdout);
  assert.equal(result.report.coverage.cuesVisible, 1);
  assert.equal(result.report.coverage.contrastGraded, 1);
  assert.equal(result.report.contactSheet.status, "complete");
  assert.ok(fs.existsSync(result.report.contactSheet.path));
});

browserTest("real browser inventories invisible CTA and refuses never-decoded video", async (t) => {
  const result = await shoot(t, html('<section><p data-sc-cue="">Buy</p><button data-sc-cue="" style="opacity:0">Buy</button><video data-sc-scrub class="sc-has-clip" style="width:100%;height:300px"></video></section>'));
  assert.equal(result.exitCode, 1, result.stdout);
  assert.equal(result.report.inventory.cues.length, 2);
  assert.ok(result.report.findings.some((finding) => finding.code === "CUE_NEVER_VISIBLE"));
  assert.ok(result.report.findings.some((finding) => finding.code === "CLIP_UNPAINTED"));
});

browserTest("real browser contrast preserves translucent backgrounds and grades small text correctly", async (t) => {
  const result = await shoot(t, html('<section><p data-sc-cue="" style="background:rgba(0,0,0,.51);color:white">Small text over translucent black</p></section>'));
  assert.equal(result.exitCode, 1, result.stdout);
  const finding = result.report.findings.find((item) => item.code === "CONTRAST_LOW");
  assert.ok(finding, result.stdout);
  assert.ok(finding.ratio > 4 && finding.ratio < 4.5, String(finding.ratio));
});

browserTest("unsupported contrast and contact sheet failure yield INCOMPLETE with opt-out exit only", async (t) => {
  const result = await shoot(t, html('<section><p data-sc-cue="" style="filter:blur(.1px)">Filtered text</p></section>'), ["--report-only"], { SCROLLCRAFT_FFMPEG: "/nonexistent/ffmpeg" });
  assert.equal(result.exitCode, 0, result.stdout);
  assert.equal(result.report.verdict, "INCOMPLETE");
  assert.ok(result.report.findings.some((item) => item.code === "CONTRAST_UNGRADED"));
  assert.ok(result.report.findings.some((item) => item.code === "CONTACT_SHEET_MISSING"));
  assert.equal(result.report.contactSheet.status, "incomplete");
});

browserTest("wrong revision fails before sampling an unrelated artifact", async (t) => {
  const result = await shoot(t, html('<p data-sc-cue="">Content</p>').replace('content="r1"', 'content="r2"'));
  assert.equal(result.exitCode, 1, result.stdout);
  assert.ok(result.report.findings.some((item) => item.code === "IDENTITY_MISMATCH"));
  assert.equal(result.report.report.length, 0);
});

browserTest("visible dead pin fails even while offscreen stages move", async (t) => {
  const result = await shoot(t, html('<div data-sc-act="pin"><div data-sc-stage><p data-sc-cue="">Pinned text</p><div data-sc-pan>Short rail</div></div></div><div data-sc-act="pin"><div data-sc-stage>Offscreen</div></div>',
    '[data-sc-act]{height:1800px}[data-sc-stage]{height:480px;position:sticky;top:0;background:white}'));
  assert.equal(result.exitCode, 1, result.stdout);
  assert.ok(result.report.findings.some((item) => item.code === "DEAD_SCROLL"), result.stdout);
  assert.ok(result.report.findings.some((item) => item.code === "PAN_NO_OVERFLOW"), result.stdout);
});

browserTest("public clip records with an unsettled target fail instead of quietly timing out", async (t) => {
  const result = await shoot(t, html('<p data-sc-cue="">Readable</p>', '', 'window.ScrollCraft={instances:[{clips:[{ready:true,cur:0,target:1,el:{seeking:false}}]}]}'), ["--settle-timeout", "150"]);
  assert.equal(result.exitCode, 1, result.stdout);
  assert.ok(result.report.findings.some((item) => item.code === "SEEK_UNSETTLED"), result.stdout);
});

browserTest("missing expected identity and sheet failure exit 2 without report-only", async (t) => {
  const fixture = await fixtureServer(t, html('<p data-sc-cue="">Readable</p>'));
  const out = path.join(fixture.temp, "missing-identity");
  await assert.rejects(execute(process.execPath, [path.join(skillRoot, "scripts/shoot.mjs"), "--url", fixture.url,
    "--out", out, "--per-act", "2"], { env: { ...process.env, SCROLLCRAFT_FFMPEG: "/nonexistent/ffmpeg" }, timeout: 30000 }),
  (error) => error.code === 2);
  const report = JSON.parse(fs.readFileSync(path.join(out, "report.json"), "utf8"));
  assert.equal(report.verdict, "INCOMPLETE");
  assert.ok(report.findings.some((item) => item.code === "IDENTITY_EXPECTATION_MISSING"));
});

async function worldFixture(t, setup = "") {
  const poster = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="64" height="64"%3E%3Crect width="64" height="64" fill="red"/%3E%3C/svg%3E';
  const markup = `<!doctype html><html><head><link rel="icon" href="data:,"><link rel="stylesheet" href="/scrollcraft.css"></head><body data-sc-lerp="0.4">
    <div data-sc-mode="worldflight" data-sc-seam="0.12"><div data-sc-world>
    ${[1, 2].map(() => `<div data-sc-segment data-sc-w="1.5"><img class="sc-world__poster" src='${poster}' alt=""><video data-sc-src="/clip.mp4"></video></div>`).join("")}
    </div><div data-sc-world-copy><div class="sc-copy sc-copy--center" data-sc-copy data-sc-window="hero">Opening copy</div>
    <div class="sc-copy sc-copy--center" data-sc-copy data-sc-window="finale">Final copy</div></div><div data-sc-spacer></div></div>
    <script>${setup}</script><script src="/scrollcraft.js"></script><script>ScrollCraft.mount(document.body)</script></body></html>`;
  const fixture = await fixtureServer(t, markup);
  for (const name of ["scrollcraft.js", "scrollcraft.css"]) fs.copyFileSync(path.join(skillRoot, "engine", name), path.join(fixture.root, name));
  await execute(findFfmpeg(), ["-y", "-v", "error", "-f", "lavfi", "-i", "testsrc2=size=128x128:rate=30", "-t", "2", "-c:v", "libx264", "-g", "1", "-pix_fmt", "yuv420p", path.join(fixture.root, "clip.mp4")]);
  return fixture;
}

browserTest("worldflight assertion uses public instances and accepts a configured nondefault lerp", async (t) => {
  const fixture = await worldFixture(t);
  const out = path.join(fixture.temp, "worldflight.json");
  let stdout = "", code = 0;
  try { ({ stdout } = await execute(process.execPath, [path.join(skillRoot, "scripts/worldflight-assert.mjs"), "--url", fixture.url, "--out", out], { env: process.env, timeout: 80000 })); }
  catch (error) { stdout = error.stdout; code = error.code; }
  const report = JSON.parse(fs.readFileSync(out, "utf8"));
  assert.equal(code, 0, stdout);
  assert.equal(report.verdict, "PASS", stdout);
  assert.ok(report.checks.some((check) => check.name === "lerp rate matches configured rate" && check.passed && check.note === "expected 0.4"));
});

browserTest("a presented video frame during transient seek readiness is not lost forever", async (t) => {
  const fixture = await worldFixture(t, `
    const request = HTMLVideoElement.prototype.requestVideoFrameCallback;
    HTMLVideoElement.prototype.requestVideoFrameCallback = function(callback) {
      return request.call(this, (...args) => {
        Object.defineProperty(this, 'readyState', { value: 1, configurable: true });
        callback(...args);
        delete this.readyState;
        setTimeout(() => this.dispatchEvent(new Event('seeked')), 0);
      });
    };`);
  const { chromium } = resolvePlaywright();
  const browser = await chromium.launch({ executablePath: findChrome(), headless: true });
  t.after(() => browser.close());
  const page = await browser.newPage();
  await page.goto(fixture.url);
  await page.waitForFunction(() => ScrollCraft.instances[0]?.clips[0]?.ready);
  await page.waitForFunction(() => ScrollCraft.instances[0]?.clips[0]?.painted, null, { timeout: 5000 });
  assert.ok(await page.locator('video').first().evaluate((video) => video.readyState >= 2 && video.videoWidth > 0 && video.getVideoPlaybackQuality().totalVideoFrames > 0));
});
