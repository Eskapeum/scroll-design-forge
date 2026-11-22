import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import http from "node:http";
import { fileURLToPath } from "node:url";
import { findChrome } from "../scripts/lib/dependencies.mjs";

test("--lan binds all interfaces but still refuses sibling and symlink escapes without opening a socket", async (t) => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), "scroll-forge-lan-"));
  const root = path.join(temp, "site"), sibling = path.join(temp, "site-private");
  fs.mkdirSync(root);
  fs.mkdirSync(sibling);
  fs.writeFileSync(path.join(sibling, "secret"), "private");
  fs.symlinkSync(path.join(sibling, "secret"), path.join(root, "outside"));
  const argv = process.argv, output = [];
  t.after(() => { process.argv = argv; fs.rmSync(temp, { recursive: true, force: true }); });
  t.mock.method(console, "log", (line) => output.push(line));
  t.mock.method(os, "networkInterfaces", () => ({ fixture: [{ family: "IPv4", internal: false, address: "192.0.2.10" }] }));
  let requestedHost;
  t.mock.method(http.Server.prototype, "listen", function (port, host, callback) {
    requestedHost = host;
    assert.equal(port, 0);
    for (const url of ["/%2e%2e/site-private/secret", "/outside"]) {
      const response = { status: null, writeHead(status) { this.status = status; return this; }, end() {} };
      this.emit("request", { method: "GET", url, headers: {} }, response);
      assert.equal(response.status, 403, url);
    }
    this.address = () => ({ port: 45678 });
    callback();
    return this;
  });
  const script = new URL("../scripts/serve.mjs", import.meta.url);
  process.argv = [process.execPath, fileURLToPath(script), "--lan", "--root", root, "--port", "0"];
  await import(script.href);
  assert.equal(requestedHost, "0.0.0.0");
  assert.ok(output.some((line) => line.includes("http://192.0.2.10:45678  (LAN)")));
  assert.ok(output.some((line) => line.includes("readable by anyone on this network")));
});

for (const location of ["C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe", "C:/Users/fixture/AppData/Local/Google/Chrome/Application/chrome.exe"]) {
  test(`browser lookup supports ${location}`, (t) => {
    const chrome = process.env.SCROLLCRAFT_CHROME, local = process.env.LOCALAPPDATA;
    t.after(() => {
      if (chrome === undefined) delete process.env.SCROLLCRAFT_CHROME; else process.env.SCROLLCRAFT_CHROME = chrome;
      if (local === undefined) delete process.env.LOCALAPPDATA; else process.env.LOCALAPPDATA = local;
    });
    delete process.env.SCROLLCRAFT_CHROME;
    process.env.LOCALAPPDATA = "C:/Users/fixture/AppData/Local";
    const expected = location.includes("Users") ? path.join(process.env.LOCALAPPDATA, "Google/Chrome/Application/chrome.exe") : location;
    t.mock.method(fs, "accessSync", (candidate) => { if (candidate !== expected) throw new Error("missing"); });
    t.mock.method(fs, "statSync", () => ({ isFile: () => true }));
    assert.equal(findChrome(), expected);
  });
}
