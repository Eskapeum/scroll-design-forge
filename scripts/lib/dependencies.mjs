import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

export function resolvePlaywright() {
  const roots = [process.env.SCROLLFORGE_PLAYWRIGHT_ROOT, process.cwd(),
    path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..")].filter(Boolean);
  for (const root of roots) {
    const require = createRequire(path.join(path.resolve(root), "package.json"));
    for (const name of ["playwright-core", "playwright"]) {
      try { return { chromium: require(name).chromium, location: require.resolve(name) }; } catch {}
    }
  }
  throw new Error("Playwright not found in the build or skill. Set SCROLLFORGE_PLAYWRIGHT_ROOT to an existing package root, or install playwright-core with approval.");
}

export function findChrome() {
  const candidates = process.env.SCROLLCRAFT_CHROME ? [process.env.SCROLLCRAFT_CHROME] : [
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
    "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
    ...(process.env.LOCALAPPDATA ? [path.join(process.env.LOCALAPPDATA, "Google/Chrome/Application/chrome.exe")] : []),
    "/usr/bin/google-chrome", "/usr/bin/google-chrome-stable", "/usr/bin/chromium",
    "/usr/bin/chromium-browser", "/snap/bin/chromium",
  ];
  return candidates.find((candidate) => {
    try { fs.accessSync(candidate, fs.constants.X_OK); return fs.statSync(candidate).isFile(); } catch { return false; }
  }) || null;
}

export function findFfmpeg(requiredFilters = []) {
  const windows = [];
  const packages = path.join(process.env.USERPROFILE || process.env.HOME || "", "AppData/Local/Microsoft/WinGet/Packages");
  if (!process.env.SCROLLCRAFT_FFMPEG && fs.existsSync(packages)) {
    for (const name of fs.readdirSync(packages).filter((name) => /^Gyan\.FFmpeg/i.test(name))) {
      const folder = path.join(packages, name);
      if (fs.statSync(folder).isDirectory()) for (const version of fs.readdirSync(folder)) windows.push(path.join(folder, version, "bin/ffmpeg.exe"));
    }
  }
  const candidates = process.env.SCROLLCRAFT_FFMPEG ? [process.env.SCROLLCRAFT_FFMPEG]
    : ["ffmpeg", ...windows, "/opt/homebrew/bin/ffmpeg", "/usr/local/bin/ffmpeg", "/usr/bin/ffmpeg", "/snap/bin/ffmpeg"];
  for (const candidate of candidates) {
    const result = spawnSync(candidate, ["-hide_banner", "-filters"], { encoding: "utf8", timeout: 10000 });
    if (result.status !== 0) continue;
    const available = new Set(result.stdout.split("\n").map((line) => line.trim().split(/\s+/)[1]));
    if (requiredFilters.every((name) => available.has(name))) return candidate;
  }
  return null;
}

export function readIdentity({ manifest, buildId, revision }) {
  const data = manifest ? JSON.parse(fs.readFileSync(path.resolve(manifest), "utf8")) : {};
  if (manifest && data.schemaVersion !== 1) throw new Error("Manifest schemaVersion must be 1.");
  for (const [field, value] of Object.entries({ buildId: buildId || data.buildId, revision: revision || data.revision })) {
    if (value !== undefined && (typeof value !== "string" || !value.trim() || /[\r\n]/.test(value))) throw new Error(`${field} must be a nonempty single-line string.`);
  }
  if (data.assets !== undefined && !Array.isArray(data.assets)) throw new Error("Manifest assets must be an array.");
  return { buildId: buildId || data.buildId || null, revision: revision || data.revision || null,
    manifest: manifest ? path.resolve(manifest) : null, assets: data.assets || [] };
}
