import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { readFile } from 'node:fs/promises';
import { resolvePlaywright, findChrome } from '../scripts/lib/dependencies.mjs';

const { chromium } = resolvePlaywright();
const css = await readFile(new URL('../engine/scrollcraft.css', import.meta.url), 'utf8');
const js = await readFile(new URL('../engine/scrollcraft.js', import.meta.url), 'utf8');
let browser;
before(async () => { browser = await chromium.launch({ headless: true, executablePath: findChrome() || undefined }); });
after(async () => { await browser?.close(); });

const markup = '<main><section data-sc-act="pin" data-sc-span="3"><div data-sc-stage><h1 data-sc-cue=".4">Readable sequence story</h1><a href="#details">Read details</a><canvas data-sc-sequence="https://frames.test/{i}.svg:5:0"></canvas></div></section><p id="details">The complete explanation remains available.</p></main>';
const frame = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"><rect width="16" height="16" fill="green"/></svg>';

async function fixture(t, { javaScriptEnabled = true, route, mount = true } = {}) {
  const context = await browser.newContext({ javaScriptEnabled, viewport: { width: 800, height: 600 } });
  t.after(() => context.close());
  const page = await context.newPage();
  page.setDefaultTimeout(5000);
  await page.route('https://frames.test/**', route || (request => request.fulfill({ contentType: 'image/svg+xml', body: frame })));
  await page.setContent(`<!doctype html><html><head><style>${css}</style></head><body>${markup}</body></html>`);
  if (javaScriptEnabled) {
    await page.addScriptTag({ content: js });
    if (mount) await page.evaluate(() => { window.instance = ScrollCraft.mount(document.body); });
  }
  return page;
}

const evidence = page => page.evaluate(() => {
  const { requested, drawn } = instance.acts[0].seq;
  return { requested, drawn };
});

test('sequence evidence distinguishes a pending target from the actual frame and settles forward and reverse', async t => {
  let release;
  const pending = new Promise(resolve => { release = resolve; });
  t.after(() => release());
  const page = await fixture(t, { route: async route => {
    if (route.request().url().endsWith('/4.svg')) await pending;
    await route.fulfill({ contentType: 'image/svg+xml', body: frame });
  } });
  await page.waitForFunction(() => instance.acts[0].seq.drawn === 0);
  assert.deepEqual(await evidence(page), { requested: 0, drawn: 0 });
  await page.evaluate(() => { scrollTo({ top: 1200, behavior: 'instant' }); instance.read(); });
  await page.waitForFunction(() => instance.acts[0].seq.requested === 4);
  const waiting = await evidence(page);
  assert.equal(waiting.requested, 4);
  assert.notEqual(waiting.drawn, 4, 'a nearby fallback must not count as the requested frame');
  release();
  await page.waitForFunction(() => instance.acts[0].seq.drawn === instance.acts[0].seq.requested);
  assert.deepEqual(await evidence(page), { requested: 4, drawn: 4 });
  await page.evaluate(() => { scrollTo({ top: 0, behavior: 'instant' }); instance.read(); });
  await page.waitForFunction(() => instance.acts[0].seq.drawn === 0);
  assert.deepEqual(await evidence(page), { requested: 0, drawn: 0 });
});

test('missing requested sequence frame keeps explicit stalled evidence after neighboring frames load', async t => {
  const page = await fixture(t, { route: route => route.fulfill(route.request().url().endsWith('/2.svg')
    ? { status: 404, body: 'missing requested frame' }
    : { contentType: 'image/svg+xml', body: frame }) });
  await page.waitForFunction(() => instance.acts[0].seq.drawn === 0);
  await page.evaluate(() => { scrollTo({ top: 600, behavior: 'instant' }); instance.read(); });
  await page.waitForFunction(() => instance.acts[0].seq.failed.has(2) && instance.acts[0].seq.pending.size === 0);
  const state = await evidence(page);
  assert.equal(state.requested, 2);
  assert.ok(state.drawn >= 0 && state.drawn !== state.requested);
});

async function assertReadable(page) {
  const state = await page.locator('h1').evaluate(el => {
    const rect = el.getBoundingClientRect();
    let opacity = 1;
    for (let parent = el; parent; parent = parent.parentElement) opacity *= Number(getComputedStyle(parent).opacity);
    return { opacity, width: rect.width, height: rect.height, position: getComputedStyle(el).position, text: el.textContent };
  });
  assert.equal(state.opacity, 1);
  assert.ok(state.width > 0 && state.height > 0);
  assert.equal(state.position, 'static');
  assert.equal(state.text, 'Readable sequence story');
  await page.keyboard.press('Tab');
  assert.equal(await page.locator('a').evaluate(el => el === document.activeElement), true);
}

test('sequence fixture retains readable text and an accessible link with JavaScript disabled', async t => {
  await assertReadable(await fixture(t, { javaScriptEnabled: false }));
});

test('sequence initialization failure restores content visibility and keyboard access', async t => {
  const page = await fixture(t, { mount: false });
  const state = await page.evaluate(() => {
    const original = document.body.innerHTML;
    HTMLCanvasElement.prototype.getContext = () => { throw new Error('sequence context unavailable'); };
    let message;
    try { ScrollCraft.mount(document.body); } catch (error) { message = error.message; }
    return { message, restored: document.body.innerHTML === original, instances: ScrollCraft.instances.length, ready: document.documentElement.classList.contains('sc-ready') };
  });
  assert.deepEqual(state, { message: 'sequence context unavailable', restored: true, instances: 0, ready: false });
  await assertReadable(page);
});
