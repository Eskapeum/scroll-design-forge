#!/usr/bin/env node
// Capability-scoped, read-only preflight. No package installs or provider calls.
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { paths } from "./workspace.mjs";
import { resolvePlaywright, findChrome, findFfmpeg } from "./lib/dependencies.mjs";

const argv = process.argv.slice(2), index = argv.indexOf("--mode");
const mode = index < 0 ? "build" : argv[index + 1];
const modes = ["build", "verify", "encode", "generate", "all"];
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === "--mode") { i++; continue; }
  if (!["--help", "--json", "--probe"].includes(argv[i])) { console.error(`Unknown argument: ${argv[i]}`); process.exit(1); }
}
if (argv.includes("--help")) {
  console.log("doctor.mjs [--mode build|verify|encode|generate|all] [--json] [--probe]\nDefault build requires only Node/workspace. verify checks Playwright, Chrome and sheet filters; encode checks encoding tools; generate checks the external generate lane. --probe reads its local spend ledger only.");
  process.exit(0);
}
if (!modes.includes(mode)) { console.error(`Unknown mode: ${mode}`); process.exit(1); }
const rows = [];
const add = (name, ok, detail) => rows.push({ name, ok, detail });
add("node", Number(process.versions.node.split(".")[0]) >= 18, process.version);
if (["build", "all"].includes(mode)) {
  try { const workspace = paths(); add("workspace", true, `${workspace.workspace} via ${workspace.via}`); }
  catch (error) { add("workspace", false, error.message); }
}
if (["verify", "all"].includes(mode)) {
  try { add("playwright", true, resolvePlaywright().location); }
  catch (error) { add("playwright", false, error.message); }
  const chrome = findChrome();
  add("chrome", !!chrome, chrome || "Set SCROLLCRAFT_CHROME to an installed executable.");
  const ffmpeg = findFfmpeg(["trim", "scale", "tile"]);
  add("contact-sheet filters", !!ffmpeg, ffmpeg || "ffmpeg must provide trim, scale and tile; set SCROLLCRAFT_FFMPEG.");
}
if (["encode", "all"].includes(mode)) {
  const ffmpeg = findFfmpeg(["scale", "format"]);
  add("encoding filters", !!ffmpeg, ffmpeg || "ffmpeg must provide scale and format.");
  if (ffmpeg) {
    const encoders = spawnSync(ffmpeg, ["-hide_banner", "-encoders"], { encoding: "utf8", timeout: 10000 });
    add("H.264 encoder", encoders.status === 0 && /\blibx264\b/.test(encoders.stdout), "libx264 required for scrub encodes.");
  }
  const ffprobe = process.env.SCROLLCRAFT_FFPROBE || (ffmpeg && path.isAbsolute(ffmpeg) ? path.join(path.dirname(ffmpeg), process.platform === "win32" ? "ffprobe.exe" : "ffprobe") : "ffprobe");
  add("ffprobe", spawnSync(ffprobe, ["-version"], { timeout: 10000, stdio: "ignore" }).status === 0, ffprobe);
}
const generateHome = process.env.HOME || process.env.USERPROFILE || "";
const gen = process.env.GEN_SH || path.join(generateHome, ".claude/skills/generate/gen.sh");
if (["generate", "all"].includes(mode)) {
  add("external generation script", fs.existsSync(gen), `${gen}; only needed for the external generation lane, not supplied assets or native image tools.`);
  const keyFile = path.join(generateHome, ".config/generate/keys.env");
  const keys = ["FAL_KEY", "KIE_AI_API_KEY", "WAVESPEED_API_KEY"];
  const envKey = keys.find((key) => !!process.env[key]?.trim());
  const configured = envKey || (fs.existsSync(keyFile) && keys.some((key) => new RegExp(`^\\s*(?:export\\s+)?${key}\\s*=\\s*[\\"']?[^\\s\\"'#]`, "m").test(fs.readFileSync(keyFile, "utf8"))));
  add("provider credential configured", !!configured, "Presence only, not validity; no credentials are printed or requests sent.");
  if (argv.includes("--probe") && fs.existsSync(gen)) {
    const ledger = spawnSync("bash", [gen, "--spent"], { encoding: "utf8", timeout: 10000 });
    add("local spend ledger", ledger.status === 0, ledger.status === 0 ? ledger.stdout.trim() : "Ledger read failed.");
  }
}
const report = { mode, verdict: rows.every((row) => row.ok) ? "PASS" : "FAIL", checks: rows };
if (argv.includes("--json")) console.log(JSON.stringify(report, null, 2));
else {
  console.log(`scroll-forge preflight: ${mode}`);
  rows.forEach((row) => console.log(`${row.ok ? "PASS" : "FAIL"} ${row.name}: ${row.detail}`));
  console.log(report.verdict);
}
process.exitCode = report.verdict === "PASS" ? 0 : 1;
