#!/usr/bin/env node
/**
 * scrollcraft static server.
 *
 * A scrollcraft page cannot be verified from file://. The engine fetches each
 * clip as a Blob, and file:// fetches are blocked by CORS in every browser, so
 * the page silently falls back to posters and looks fine while proving nothing.
 * Serve it.
 *
 *   node serve.mjs --root builds/coffee-can --port 4500
 */
import http from "node:http";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { readIdentity } from "./lib/dependencies.mjs";

const argv = process.argv.slice(2);
const arg = (n, d) => { const i = argv.indexOf(n); return i > -1 && argv[i + 1] ? argv[i + 1] : d; };

const TYPES = {
  ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8", ".json": "application/json",
  ".mp4": "video/mp4", ".webm": "video/webm",
  ".webp": "image/webp", ".png": "image/png", ".jpg": "image/jpeg",
  ".svg": "image/svg+xml", ".woff2": "font/woff2",
};

export function createStaticServer(root, identity = {}) {
  const resolvedRoot = fs.realpathSync(path.resolve(root));
  const contained = (file) => {
    const relative = path.relative(resolvedRoot, file);
    return relative !== ".." && !relative.startsWith(".." + path.sep) && !path.isAbsolute(relative);
  };
  return http.createServer((req, res) => {
    if (!["GET", "HEAD"].includes(req.method)) { res.writeHead(405, { Allow: "GET, HEAD" }).end(); return; }
    let pathname;
    try { pathname = decodeURIComponent(req.url.split("?")[0]); }
    catch { res.writeHead(400).end("bad path"); return; }
    if (pathname.includes("\0") || pathname.includes("\\")) { res.writeHead(400).end("bad path"); return; }
    let file = path.resolve(resolvedRoot, "." + pathname);
    if (!contained(file)) { res.writeHead(403).end("forbidden"); return; }
    try {
      if (fs.statSync(file).isDirectory()) file = path.join(file, "index.html");
      file = fs.realpathSync(file);
      if (!contained(file)) { res.writeHead(403).end("forbidden"); return; }
      const stat = fs.statSync(file);
      if (!stat.isFile()) { res.writeHead(404).end("not found"); return; }
      const headers = { "Content-Type": TYPES[path.extname(file).toLowerCase()] || "application/octet-stream",
        "Content-Length": stat.size, "Cache-Control": "no-store", "Accept-Ranges": "bytes" };
      if (identity.buildId) headers["X-Scroll-Forge-Build-Id"] = identity.buildId;
      if (identity.revision) headers["X-Scroll-Forge-Revision"] = identity.revision;
      let start = 0, end = stat.size - 1, status = 200;
      if (req.headers.range) {
        const match = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
        if (!match || (!match[1] && !match[2])) { res.writeHead(416, { "Content-Range": `bytes */${stat.size}` }).end(); return; }
        if (!match[1]) start = Math.max(0, stat.size - Number(match[2]));
        else { start = Number(match[1]); if (match[2]) end = Math.min(end, Number(match[2])); }
        if (start >= stat.size || start > end) { res.writeHead(416, { "Content-Range": `bytes */${stat.size}` }).end(); return; }
        status = 206;
        headers["Content-Range"] = `bytes ${start}-${end}/${stat.size}`;
        headers["Content-Length"] = end - start + 1;
      }
      res.writeHead(status, headers);
      if (req.method === "HEAD" || !stat.size) { res.end(); return; }
      const stream = fs.createReadStream(file, { start, end });
      stream.on("error", () => res.destroy());
      stream.pipe(res);
    } catch { res.writeHead(404).end("not found"); }
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    if (argv.includes("--help")) {
      console.log("serve.mjs --root DIR [--port 4500] [--lan] [--manifest FILE | --build-id ID --revision REV]\nBinds 127.0.0.1 by default; --lan binds 0.0.0.0 for phone testing. --port 0 chooses a free port.");
      process.exit(0);
    }
    for (let i = 0; i < argv.length; i++) {
      if (argv[i] === "--lan") continue;
      if (!["--root", "--port", "--manifest", "--build-id", "--revision"].includes(argv[i])) throw new Error(`Unknown argument: ${argv[i]}`);
      if (!argv[i + 1] || argv[i + 1].startsWith("--")) throw new Error(`Missing value for ${argv[i]}`);
      i++;
    }
    const root = path.resolve(arg("--root", ".")), port = Number(arg("--port", "4500"));
    if (!Number.isInteger(port) || port < 0 || port > 65535) throw new Error("--port must be an integer from 0 to 65535.");
    const identity = readIdentity({ manifest: arg("--manifest"), buildId: arg("--build-id"), revision: arg("--revision") });
    const server = createStaticServer(root, identity);
    server.on("error", (error) => { console.error(error.message); process.exitCode = 1; });
    const lan = argv.includes("--lan");
    server.listen(port, lan ? "0.0.0.0" : "127.0.0.1", () => {
      const actualPort = server.address().port;
      console.log(`scrollcraft: ${root}\n  http://127.0.0.1:${actualPort}`);
      if (!lan) return;
      for (const addresses of Object.values(os.networkInterfaces())) {
        for (const address of addresses || []) {
          if (address.family === "IPv4" && !address.internal) console.log(`  http://${address.address}:${actualPort}  (LAN)`);
        }
      }
      console.log("  --lan: everything under the root is readable by anyone on this network until you stop the server.");
    });
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
