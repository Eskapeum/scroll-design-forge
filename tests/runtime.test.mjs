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

async function pageFor(t, markup, { javaScriptEnabled = true, reducedMotion = 'no-preference', width = 800, height = 600, mount = true, setup } = {}) {
  const context = await browser.newContext({ javaScriptEnabled, reducedMotion, viewport: { width, height } });
  t.after(() => context.close());
  const page = await context.newPage();
  page.setDefaultTimeout(5000);
  await page.route('https://fixture.test/**', route => route.fulfill({ status: 404, body: 'Fixture resource not supplied' }));
  await page.route('https://fixture.test/', route => route.fulfill({ contentType: 'text/html', body: '<!doctype html>' }));
  await page.goto('https://fixture.test/');
  await page.setContent(`<!doctype html><html><head><style>${css}</style></head><body>${markup}</body></html>`);
  if (setup) await setup(page);
  if (javaScriptEnabled) {
    await page.addScriptTag({ content: js });
    if (mount) await page.evaluate(() => { window.instance = ScrollCraft.mount(document.body); });
  }
  return page;
}

async function visibleControl(page, id) {
  const state = await page.locator(`#${id}`).evaluate(el => {
    const rect = el.getBoundingClientRect();
    let opacity = 1, current = el;
    while (current) { opacity *= Number(getComputedStyle(current).opacity); current = current.parentElement; }
    return { focused: document.activeElement === el, opacity, left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom, width: innerWidth, height: innerHeight };
  });
  assert.equal(state.focused, true, id);
  assert.ok(state.opacity >= 0.99, `${id}: effective opacity ${state.opacity}`);
  assert.ok(state.left >= -1 && state.right <= state.width + 1, `${id}: horizontal bounds ${JSON.stringify(state)}`);
  assert.ok(state.top >= -1 && state.bottom <= state.height + 1, `${id}: vertical bounds ${JSON.stringify(state)}`);
}

const worldMarkup = `<div data-sc-mode="worldflight"><div data-sc-world>
  <div data-sc-segment data-sc-w="1.5"><img class="sc-world__poster" alt="First scene" width="200" height="100"></div>
  <div data-sc-segment data-sc-w="1.5"><img class="sc-world__poster" alt="Last scene" width="200" height="100"></div>
  </div><div data-sc-world-copy>
  <div class="sc-copy sc-copy--center" data-sc-copy data-sc-window="hero"><a id="hero" href="#final">Start here</a></div>
  <div class="sc-copy sc-copy--center" data-sc-copy data-sc-window="finale"><a id="final" href="#hero">Final action</a></div>
  </div><div data-sc-spacer></div></div>`;

test('no JavaScript leaves every cue and world copy in readable document flow', async t => {
  const page = await pageFor(t, `<section data-sc-act="pin"><div data-sc-stage><div class="sc-copy sc-copy--center" data-sc-cue=".5"><a id="pin">Pinned copy</a></div></div></section><p data-sc-in>Flow copy</p>${worldMarkup}`, { javaScriptEnabled: false });
  const states = await page.locator('[data-sc-cue], [data-sc-in], [data-sc-copy], [data-sc-world]').evaluateAll(els => els.map(el => ({ opacity: getComputedStyle(el).opacity, position: getComputedStyle(el).position, height: el.getBoundingClientRect().height })));
  assert.ok(states.every(state => state.opacity === '1' && state.position !== 'fixed' && state.position !== 'absolute' && state.height > 0));
  const boxes = await page.locator('[data-sc-copy]').evaluateAll(els => els.map(el => el.getBoundingClientRect().toJSON()));
  assert.ok(boxes[1].top >= boxes[0].bottom, 'static world copies do not overlap');
});

test('mount failure restores readable markup and does not register an instance', async t => {
  const page = await pageFor(t, '<section data-sc-act="pin"><div data-sc-stage><p data-sc-cue=".4">Readable after failure</p><canvas data-sc-sequence="/frames/{i}.svg:8"></canvas></div></section>', { mount: false });
  const result = await page.evaluate(() => {
    const original = document.body.innerHTML;
    HTMLCanvasElement.prototype.getContext = () => { throw new Error('fixture initialization failure'); };
    let caught = false;
    try { ScrollCraft.mount(document.body); } catch { caught = true; }
    return { caught, restored: document.body.innerHTML === original, count: ScrollCraft.instances.length, opacity: getComputedStyle(document.querySelector('[data-sc-cue]')).opacity };
  });
  assert.deepEqual(result, { caught: true, restored: true, count: 0, opacity: '1' });
});

test('failure during initial layout also removes enhanced styles and pending work', async t => {
  const page = await pageFor(t, '<section data-sc-act="pin"><div data-sc-stage><p data-sc-cue=".4">Readable after layout failure</p></div></section>', { mount: false });
  const result = await page.evaluate(() => {
    const original = document.body.innerHTML;
    const computed = window.getComputedStyle;
    window.getComputedStyle = () => { throw new Error('fixture layout failure'); };
    let caught = false;
    try { ScrollCraft.mount(document.body); } catch { caught = true; }
    window.getComputedStyle = computed;
    return { caught, restored: document.body.innerHTML === original, count: ScrollCraft.instances.length, enhanced: document.body.classList.contains('sc-mounted') };
  });
  assert.deepEqual(result, { caught: true, restored: true, count: 0, enhanced: false });
});

test('failed kinetic initialization restores partially changed owned content', async t => {
  const page = await pageFor(t, '<section data-sc-act="pin"><div data-sc-stage><h1 data-sc-cue="0 .9 0" data-sc-kinetic="words">Original heading</h1></div></section>', { mount: false });
  const result = await page.evaluate(() => {
    const original = document.body.innerHTML, heading = document.querySelector('h1');
    heading.appendChild = () => { throw new Error('fixture split failure'); };
    let message = '';
    try { ScrollCraft.mount(document.body); } catch (error) { message = error.message; }
    return { message, restored: document.body.innerHTML === original, count: ScrollCraft.instances.length };
  });
  assert.deepEqual(result, { message: 'fixture split failure', restored: true, count: 0 });
});

test('Tab and Shift+Tab navigate pinned, flow, and panning controls visibly', async t => {
  const page = await pageFor(t, `<section data-sc-act="pin" data-sc-span="3"><div data-sc-stage><div class="sc-copy sc-copy--center" data-sc-cue=".7 .95"><a id="pinned" href="#">Pinned action</a></div></div></section>
    <section data-sc-act="flow" style="padding:160px 0"><div data-sc-in><div data-sc-cue=".8"><a id="flow" href="#">Flow action</a></div></div></section>
    <section data-sc-act="pan" data-sc-span="4"><div data-sc-stage><div data-sc-pan style="width:2400px"><div style="flex:0 0 800px">One</div><div style="flex:0 0 800px">Two</div><div style="flex:0 0 800px;padding:100px"><a id="pan" href="#">Pan action</a></div></div></div></section>`);
  for (const id of ['pinned', 'flow', 'pan']) { await page.keyboard.press('Tab'); await visibleControl(page, id); }
  await page.keyboard.press('Shift+Tab');
  await visibleControl(page, 'flow');
  await page.keyboard.press('Shift+Tab');
  await visibleControl(page, 'pinned');
});

test('worldflight future and previous actions stay reachable in native tab order', async t => {
  const page = await pageFor(t, worldMarkup);
  await page.keyboard.press('Tab'); await visibleControl(page, 'hero');
  await page.keyboard.press('Tab'); await visibleControl(page, 'final');
  assert.ok(await page.evaluate(() => scrollY > innerHeight));
  await page.keyboard.press('Shift+Tab'); await visibleControl(page, 'hero');
});

test('every mobile copy anchor stays inside a 390px viewport', async t => {
  for (const anchor of ['lead', 'center', 'trail']) {
    const page = await pageFor(t, `<section data-sc-act="pin" data-sc-span="2"><div data-sc-stage><div class="sc-copy sc-copy--${anchor}" data-sc-cue="0 .9 0"><p>Copy spanning the mobile viewport without a negative horizontal translation.</p></div></div></section>`, { width: 390, height: 844 });
    const rect = await page.locator('.sc-copy').boundingBox();
    assert.ok(rect.x >= 0 && rect.x + rect.width <= 390, `${anchor}: ${JSON.stringify(rect)}`);
  }
});

test('corrupt media never claims to paint or hides its poster after the former timeout', async t => {
  const page = await pageFor(t, '<section data-sc-act="scrub" data-sc-span="2"><div data-sc-stage><img class="sc-stage__poster" alt="Fallback" width="200" height="100"><video data-sc-scrub data-sc-src="https://fixture.test/bad.mp4"></video></div></section>', {
    setup: page => page.route('https://fixture.test/bad.mp4', route => route.fulfill({ contentType: 'video/mp4', body: 'not a movie' }))
  });
  await page.waitForFunction(() => instance.clips[0].failed);
  await page.waitForTimeout(2700);
  const status = await page.evaluate(() => ({ painted: instance.clips[0].painted, ready: instance.clips[0].ready, opacity: getComputedStyle(document.querySelector('.sc-stage__poster')).opacity, classes: document.querySelectorAll('.sc-has-clip').length }));
  assert.deepEqual(status, { painted: false, ready: false, opacity: '1', classes: 0 });
});

test('a decoded local video does replace its poster', async t => {
  const page = await pageFor(t, '<section data-sc-act="scrub" data-sc-span="2"><div data-sc-stage><img class="sc-stage__poster" alt="Fallback"><video data-sc-scrub></video></div></section>', { mount: false });
  const source = await page.evaluate(async () => {
    const canvas = document.createElement('canvas'); canvas.width = 64; canvas.height = 64;
    const ctx = canvas.getContext('2d'), stream = canvas.captureStream(20), chunks = [];
    const recorder = new MediaRecorder(stream, { mimeType: 'video/webm' });
    const finished = new Promise(resolve => { recorder.onstop = resolve; });
    recorder.ondataavailable = event => chunks.push(event.data);
    recorder.start();
    for (let i = 0; i < 8; i++) { ctx.fillStyle = i % 2 ? 'red' : 'blue'; ctx.fillRect(0, 0, 64, 64); await new Promise(resolve => setTimeout(resolve, 60)); }
    recorder.stop(); await finished; stream.getTracks().forEach(track => track.stop());
    return URL.createObjectURL(new Blob(chunks, { type: 'video/webm' }));
  });
  await page.evaluate(source => { document.querySelector('video').dataset.scSrc = source; window.instance = ScrollCraft.mount(document.body); }, source);
  await page.waitForFunction(() => instance.clips[0].painted, { timeout: 5000 });
  assert.equal(await page.locator('video').evaluate(el => el.videoWidth), 64);
  const cleanup = await page.evaluate(() => {
    const expected = instance.clips[0].url, revoked = [], revoke = URL.revokeObjectURL;
    URL.revokeObjectURL = url => { revoked.push(url); revoke.call(URL, url); };
    instance.destroy();
    return { revoked: revoked.includes(expected), opacity: getComputedStyle(document.querySelector('.sc-stage__poster')).opacity };
  });
  assert.deepEqual(cleanup, { revoked: true, opacity: '1' });
});

test('sequences paint after delayed load without scrolling, recover missing frames, and stay bounded', async t => {
  let active = 0, peak = 0, requests = 0;
  const page = await pageFor(t, '<section data-sc-act="pin" data-sc-span="4"><div data-sc-stage><canvas data-sc-sequence="https://fixture.test/frames/{i}.svg:100:0"></canvas></div></section>', {
    setup: page => page.route('https://fixture.test/frames/*', async route => {
      active++; requests++; peak = Math.max(peak, active);
      await new Promise(resolve => setTimeout(resolve, 50));
      const index = Number(route.request().url().match(/(\d+)\.svg/)[1]);
      active--;
      await route.fulfill(index === 0 ? { status: 404, body: 'missing' } : { contentType: 'image/svg+xml', body: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16"><rect width="16" height="16" fill="rgb(${index},120,30)"/></svg>` });
    })
  });
  await page.waitForFunction(() => instance.acts[0].seq.drawn >= 1);
  assert.ok(peak <= 3 && requests <= 5, `initial requests ${requests}, concurrency ${peak}`);
  assert.equal(await page.evaluate(() => instance.acts[0].seq.ctx.getImageData(0, 0, 1, 1).data[1]), 120);
  await page.evaluate(() => { scrollTo({ top: 1800, behavior: 'instant' }); instance.read(); });
  await page.waitForFunction(() => instance.acts[0].seq.drawn === 99);
  assert.ok(await page.evaluate(() => Object.keys(instance.acts[0].seq.frames).length <= 12));
  await page.evaluate(() => { scrollTo({ top: 0, behavior: 'instant' }); instance.read(); });
  await page.waitForFunction(() => instance.acts[0].seq.drawn === 1);
  assert.ok(peak <= 3);
});

test('reduced motion never fetches clips and leaves all rail controls reachable', async t => {
  let requests = 0;
  const page = await pageFor(t, `<section data-sc-act="pan" data-sc-span="3"><div data-sc-stage><video data-sc-scrub data-sc-src="https://fixture.test/video"></video><div data-sc-pan style="width:1800px"><div style="flex:0 0 1400px">Intro</div><a id="reduced" href="#">Last rail action</a></div></div></section>`, { reducedMotion: 'reduce', setup: page => page.route('https://fixture.test/video', route => { requests++; return route.abort(); }) });
  await page.keyboard.press('Tab');
  await visibleControl(page, 'reduced');
  assert.equal(requests, 0);
});

test('destroy cancels resources, restores DOM, and permits a clean remount', async t => {
  const page = await pageFor(t, `<section data-sc-act="pin" data-sc-span="2"><div data-sc-stage><h1 data-sc-cue="0 .9 0" data-sc-kinetic="words">Original heading</h1><video data-sc-scrub data-sc-src="https://fixture.test/pending"></video><button data-sc-magnet=".2">Action</button></div></section><p data-sc-count="0 12">12</p>`, { mount: false });
  const result = await page.evaluate(async () => {
    const original = document.body.innerHTML;
    let aborted = false, calls = 0, disconnected = 0;
    const Intersection = window.IntersectionObserver, Resize = window.ResizeObserver;
    window.IntersectionObserver = class extends Intersection { disconnect() { disconnected++; super.disconnect(); } };
    window.ResizeObserver = class extends Resize { disconnect() { disconnected++; super.disconnect(); } };
    window.fetch = (url, { signal }) => new Promise((resolve, reject) => { signal.addEventListener('abort', () => { aborted = true; reject(new DOMException('Aborted', 'AbortError')); }); });
    const originalRAF = window.requestAnimationFrame;
    const pending = new Set();
    window.requestAnimationFrame = callback => { const id = originalRAF(now => { pending.delete(id); calls++; callback(now); }); pending.add(id); return id; };
    const originalCancel = window.cancelAnimationFrame;
    window.cancelAnimationFrame = id => { pending.delete(id); originalCancel(id); };
    const instance = ScrollCraft.mount(document.body);
    const duplicate = ScrollCraft.mount(document.body) === instance;
    instance.destroy(); instance.destroy();
    const restored = document.body.innerHTML;
    dispatchEvent(new Event('resize')); dispatchEvent(new Event('scroll'));
    await new Promise(resolve => setTimeout(resolve, 100));
    const result = { aborted, pending: pending.size, calls, disconnected, restored, original, duplicate, count: ScrollCraft.instances.length, opacity: getComputedStyle(document.querySelector('[data-sc-cue]')).opacity };
    const next = ScrollCraft.mount(document.body); result.remount = ScrollCraft.instances.length === 1 && next !== instance; next.destroy();
    return result;
  });
  assert.equal(result.restored, result.original);
  delete result.restored; delete result.original;
  assert.deepEqual(result, { aborted: true, pending: 0, calls: 0, disconnected: 3, duplicate: true, count: 0, opacity: '1', remount: true });
});

test('destroy preserves application changes on ordinary descendants and the mount root', async t => {
  const page = await pageFor(t, '<p id="app">Application-owned content</p><section data-sc-act="pin"><div data-sc-stage><p data-sc-cue="0 .9 0">Animated content</p></div></section>');
  const result = await page.evaluate(() => {
    const app = document.querySelector('#app');
    app.classList.add('app-selected'); app.style.color = 'red';
    document.body.classList.add('app-open'); document.body.style.backgroundColor = 'blue';
    instance.destroy();
    return { className: app.className, color: app.style.color, rootClass: document.body.className, background: document.body.style.backgroundColor };
  });
  assert.deepEqual(result, { className: 'app-selected', color: 'red', rootClass: 'app-open', background: 'blue' });
});

test('destroy preserves external properties, classes, and attributes on animated nodes', async t => {
  const page = await pageFor(t, '<section data-sc-act="pin" data-sc-span="2"><div data-sc-stage><p id="cue" class="authored" style="opacity:.8" data-sc-cue="0 .9 0">Animated content</p><canvas id="canvas" width="32" height="32" data-sc-sequence="https://fixture.test/missing.svg:1"></canvas></div></section>');
  const result = await page.evaluate(() => {
    const cue = document.querySelector('#cue'), canvas = document.querySelector('#canvas');
    cue.classList.remove('authored'); cue.classList.add('app-selected');
    cue.style.setProperty('color', 'red', 'important'); cue.style.opacity = '.43';
    canvas.width = 77;
    // A further runtime update must not forget the application's latest value.
    instance.layout();
    instance.destroy();
    return { className: cue.className, color: cue.style.color, priority: cue.style.getPropertyPriority('color'), opacity: cue.style.opacity, width: canvas.width, transform: cue.style.transform };
  });
  assert.deepEqual(result, { className: 'app-selected', color: 'red', priority: 'important', opacity: '0.43', width: 77, transform: '' });
});

test('destroy preserves externally replaced or edited kinetic content', async t => {
  const page = await pageFor(t, '<section data-sc-act="pin"><div data-sc-stage><h1 id="replace" data-sc-cue="0 .9 0" data-sc-kinetic="words">Original heading</h1><h2 id="edit" data-sc-cue="0 .9 0" data-sc-kinetic="words">Original second</h2><h2 id="unchanged" data-sc-cue="0 .9 0" data-sc-kinetic="words"><em>Original third</em></h2></div></section>', { mount: false });
  const result = await page.evaluate(() => {
    const originalChild = document.querySelector('#unchanged em');
    const instance = ScrollCraft.mount(document.body);
    const replacement = document.createElement('strong'); replacement.textContent = 'Updated by application';
    document.querySelector('#replace').replaceChildren(replacement);
    document.querySelector('#edit .sc-split__i').textContent = 'Updated';
    instance.destroy();
    return {
      replacementPreserved: document.querySelector('#replace').firstChild === replacement,
      replacement: document.querySelector('#replace').textContent,
      edited: document.querySelector('#edit').textContent,
      originalPreserved: document.querySelector('#unchanged').firstChild === originalChild,
      original: document.querySelector('#unchanged').innerHTML
    };
  });
  assert.deepEqual(result, { replacementPreserved: true, replacement: 'Updated by application', edited: 'Updated second', originalPreserved: true, original: '<em>Original third</em>' });
});

test('hidden mounts recover layout when revealed, and resizing remeasures canvas and tracks', async t => {
  const page = await pageFor(t, '<main style="display:none"><section data-sc-act="pin" data-sc-span="3"><div data-sc-stage><p data-sc-cue="0 .9 0">Content</p><canvas data-sc-sequence="https://fixture.test/{i}.svg:1"></canvas></div></section></main>', { setup: page => page.route('https://fixture.test/*', route => route.abort()) });
  assert.equal(await page.evaluate(() => instance.acts[0].height), 0);
  await page.locator('main').evaluate(el => { el.style.display = 'block'; });
  await page.waitForFunction(() => instance.acts[0].height > 0);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.waitForFunction(() => instance.acts[0].height === 844 * 3);
  assert.equal(await page.locator('canvas').evaluate(el => el.width), 390);
});

test('template kinetic headings are cued and hold at full opacity in mid-window', async t => {
  const template = await readFile(new URL('../references/template.html', import.meta.url), 'utf8');
  const markup = template.match(/<body>([\s\S]*?)<script src=/)[1];
  const page = await pageFor(t, markup, { setup: page => page.route('**/assets/**', route => route.abort()) });
  assert.equal(await page.locator('[data-sc-kinetic]:not([data-sc-cue])').count(), 0);
  const state = await page.evaluate(() => {
    const act = instance.acts[3], point = .5;
    scrollTo({ top: act.top + point * (act.height - innerHeight), behavior: 'instant' }); instance.read();
    return act.cues.filter(cue => cue.kinetic).flatMap(cue => cue.units.map(el => Number(getComputedStyle(el).opacity)));
  });
  assert.ok(state.length > 0 && state.every(opacity => opacity === 1));
});
