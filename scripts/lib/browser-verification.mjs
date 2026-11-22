// These functions are passed directly to page.evaluate; keep them browser-only.
export function inventoryPage() {
  const inventory = {};
  const selectors = { cues: "[data-sc-cue],[data-sc-copy]", clips: "video[data-sc-scrub],[data-sc-segment] video",
    rails: "[data-sc-pan]", segs: "[data-sc-segment]", stages: "[data-sc-stage],[data-sc-world]",
    wipes: "[data-sc-reveal]", custom: "[data-sc-verify-state]",
    motion: '[data-sc-act="parallax"],[data-sc-act="scrub"],[data-sc-act="pin"],[data-motion-bold]' };
  const generic = !document.querySelector(selectors.cues);
  inventory.textSource = generic ? "visible-text" : "engine-cues";
  if (generic) selectors.cues = `${document.querySelector('main,section') ? ':is(main,section)' : 'body'} :is(h1,h2,h3,p,a,button,label,li)`;
  for (const [kind, selector] of Object.entries(selectors)) {
    const elements = [...document.querySelectorAll(selector)].filter((el) => {
      if (kind !== "cues" || !generic) return true;
      if (!el.textContent.trim() || !el.getClientRects().length) return false;
      for (let p = el; p; p = p.parentElement) {
        const cs = getComputedStyle(p);
        if (cs.display === "none" || cs.visibility !== "visible" || Number(cs.opacity) === 0) return false;
      }
      return true;
    });
    inventory[kind] = elements.map((el, index) => {
      const id = `${kind}-${index}`;
      el.setAttribute(`data-sc-shot-${kind}`, id);
      return { id, elementId: el.id || null, text: (el.textContent || "").trim().replace(/\s+/g, " ").slice(0, 100) };
    });
  }
  return inventory;
}

export function captureState() {
  const list = (kind) => [...document.querySelectorAll(`[data-sc-shot-${kind}]`)];
  const id = (el, kind) => el.getAttribute(`data-sc-shot-${kind}`);
  const opacity = (el) => {
    let value = 1;
    for (let p = el; p; p = p.parentElement) {
      const cs = getComputedStyle(p);
      if (cs.visibility !== "visible" || cs.display === "none") return 0;
      value *= Number(cs.opacity);
    }
    return value;
  };
  const visible = (el) => {
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && r.right > 0 && r.left < innerWidth && r.bottom > 0 && r.top < innerHeight;
  };
  const rect = (el) => {
    const r = el.getBoundingClientRect();
    return [r.x, r.y, r.width, r.height].map(Math.round);
  };
  const painted = (video) => {
    const holder = video.closest("[data-sc-segment],[data-sc-act]") || video;
    const frames = video.getVideoPlaybackQuality?.().totalVideoFrames;
    return holder.classList.contains("sc-has-clip") && !video.error && video.readyState >= 2 &&
      video.videoWidth > 0 && video.videoHeight > 0 && (frames === undefined || frames > 0);
  };
  return {
    viewport: { width: innerWidth, height: innerHeight },
    overflow: Math.max(0, document.documentElement.scrollWidth - innerWidth),
    cues: list("cues").map((el) => {
      const units = [...el.querySelectorAll(".sc-split__i")];
      const o = units.length ? Math.min(...units.map(opacity)) : opacity(el);
      const range = document.createRange();
      range.selectNodeContents(el);
      const overflow = [...range.getClientRects()].some((r) => r.bottom > 0 && r.top < innerHeight && (r.left < -1 || r.right > innerWidth + 1));
      return { id: id(el, "cues"), o: +o.toFixed(3), visible: visible(el), rect: rect(el), overflow, transform: getComputedStyle(el).transform };
    }),
    clips: list("clips").map((el) => {
      const r = el.getBoundingClientRect();
      const area = Math.max(0, Math.min(r.bottom, innerHeight) - Math.max(r.top, 0)) * Math.max(0, Math.min(r.right, innerWidth) - Math.max(r.left, 0));
      return { id: id(el, "clips"), painted: painted(el), t: +(el.currentTime || 0).toFixed(3),
        dur: Number.isFinite(el.duration) ? el.duration : 0, vis: opacity(el) > 0.02 ? +(area / (innerHeight * innerWidth)).toFixed(3) : 0,
        readyState: el.readyState, seeking: el.seeking, error: el.error?.code || null };
    }),
    rails: list("rails").map((el) => ({ id: id(el, "rails"), visible: visible(el) && opacity(el) > 0.02,
      x: Math.round(new DOMMatrixReadOnly(getComputedStyle(el).transform).m41),
      overflow: Math.max(0, el.scrollWidth - (el.closest("[data-sc-stage]") || el.parentElement).clientWidth) })),
    wipes: list("wipes").map((el) => ({ id: id(el, "wipes"), visible: visible(el) && opacity(el) > 0.02, clipPath: getComputedStyle(el).clipPath })),
    stages: list("stages").map((el) => ({ id: id(el, "stages"), visible: visible(el) && opacity(el) > 0.02,
      pinned: el.hasAttribute("data-sc-world") || ["pin", "pan", "scrub"].includes(el.closest("[data-sc-act]")?.dataset.scAct),
      top: Math.round(el.getBoundingClientRect().top) })),
    segs: list("segs").map((el) => ({ id: id(el, "segs"), visible: visible(el), op: +opacity(el).toFixed(3),
      painted: !!el.querySelector("video") && painted(el.querySelector("video")), t: +(el.querySelector("video")?.currentTime || 0).toFixed(3) })),
    custom: list("custom").map((el) => ({ id: id(el, "custom"), visible: visible(el) && opacity(el) > 0.02,
      value: el.dataset.scVerifyState, hold: el.dataset.scVerifyHold === "true" })),
    // Compare local transforms, never bounding-box positions (which include document scroll).
    motion: list("motion").map((el) => ({ id: id(el, "motion"),
      parts: [el, ...el.querySelectorAll('*')].map((part) => {
        const cs = getComputedStyle(part), m = new DOMMatrixReadOnly(cs.transform);
        const box = part.getBoundingClientRect();
        const width = part.offsetWidth ?? box.width, height = part.offsetHeight ?? box.height;
        const translate = (cs.translate || 'none').split(/\s+/), scale = (cs.scale || 'none').split(/\s+/);
        const length = (value, size) => (parseFloat(value) || 0) * (value?.endsWith('%') ? size / 100 : 1);
        const factor = (value) => value && value !== 'none' ? parseFloat(value) * (value.endsWith('%') ? 0.01 : 1) : 1;
        return { x: (m.m41 + length(translate[0], width)) / innerWidth, y: (m.m42 + length(translate[1], height)) / innerHeight,
          scaleX: Math.hypot(m.m11, m.m12, m.m13) * factor(scale[0]), scaleY: Math.hypot(m.m21, m.m22, m.m23) * factor(scale[1] || scale[0]),
          matrix: [m.m11, m.m12, m.m13, m.m21, m.m22, m.m23, m.m31, m.m32, m.m33],
          clipPath: cs.clipPath, width, height };
      }) })),
  };
}

export function fontEvidence() {
  const families = (value) => (value.match(/"[^"]*"|'[^']*'|[^,]+/g) || []).map((s) => s.trim().replace(/^["']|["']$/g, '').toLowerCase());
  const faces = [...document.fonts].map((face) => ({ family: face.family.replace(/^["']|["']$/g, ''), status: face.status,
    weight: face.weight, style: face.style, stretch: face.stretch, unicodeRange: face.unicodeRange }));
  const used = [], walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let node;
  while ((node = walker.nextNode())) {
    const el = node.parentElement;
    if (!node.textContent.trim() || el.closest('script,style,noscript')) continue;
    let visible = true;
    for (let p = el; p; p = p.parentElement) {
      const cs = getComputedStyle(p);
      if (cs.display === 'none' || cs.visibility !== 'visible' || Number(cs.opacity) === 0) { visible = false; break; }
    }
    if (!visible || !el.getClientRects().length) continue;
    const cs = getComputedStyle(el);
    const entry = { tag: el.tagName.toLowerCase(), family: cs.fontFamily, families: families(cs.fontFamily), weight: cs.fontWeight, style: cs.fontStyle };
    if (!used.some((item) => JSON.stringify(item) === JSON.stringify(entry))) used.push(entry);
  }
  const computed = [...document.querySelectorAll('body,h1,h2')].map((el) => ({ tag: el.tagName.toLowerCase(), family: getComputedStyle(el).fontFamily }));
  return { faces, used, computed };
}

export function mediaState() {
  const instances = window.ScrollCraft?.instances || [];
  const records = instances.flatMap((instance) => instance.clips || []).filter((clip) => clip.ready);
  const videos = [...document.querySelectorAll('video[data-sc-scrub],[data-sc-segment] video')];
  const sequences = instances.flatMap((instance, instanceIndex) => (instance.acts || []).flatMap((act, actIndex) => {
    if (!act.seq || !act.live) return [];
    const el = act.seq.el, rect = el.getBoundingClientRect();
    let opacity = 1;
    for (let p = el; p; p = p.parentElement) {
      const cs = getComputedStyle(p);
      if (cs.display === 'none' || cs.visibility !== 'visible') opacity = 0;
      opacity *= Number(cs.opacity);
    }
    const visible = opacity > 0.02 && rect.width > 0 && rect.height > 0 && rect.right > 0 && rect.left < innerWidth && rect.bottom > 0 && rect.top < innerHeight;
    return [{ id: `sequence-${instanceIndex}-${actIndex}`, requested: act.seq.requested, drawn: act.seq.drawn, visible }];
  }));
  return { arrived: records.every((clip) => Math.abs(clip.cur - clip.target) < 0.002 && !clip.el.seeking),
    seeking: videos.some((video) => video.seeking), times: videos.map((video) => video.currentTime.toFixed(3)).join('|'), sequences };
}

export function contrastTargets() {
  const targets = [];
  document.querySelectorAll("[data-sc-shot-cues]").forEach((cue) => {
    const id = cue.getAttribute("data-sc-shot-cues");
    const walker = document.createTreeWalker(cue, NodeFilter.SHOW_TEXT);
    let node;
    while ((node = walker.nextNode())) {
      if (!node.textContent.trim()) continue;
      const el = node.parentElement, cs = getComputedStyle(el);
      let opacity = 1, unsupported = null;
      for (let p = el; p; p = p.parentElement) {
        const style = getComputedStyle(p);
        if (style.display === "none" || style.visibility !== "visible") opacity = 0;
        opacity *= Number(style.opacity);
        if (style.mixBlendMode !== "normal" || style.filter !== "none" || style.backdropFilter !== "none") unsupported = "Blend/filter compositing";
        const matrix = new DOMMatrixReadOnly(style.transform);
        if (Math.abs(matrix.b) > 0.001 || Math.abs(matrix.c) > 0.001) unsupported = "Rotated text";
      }
      if (opacity < 0.85) continue;
      if (opacity < 0.99) unsupported = "Text/group opacity below 0.99";
      if (cs.textShadow !== "none" || cs.webkitTextStrokeWidth !== "0px") unsupported = "Text shadow/stroke";
      const foreground = cs.color.match(/^rgba?\(([^)]+)\)$/)?.[1].split(/[,\s/]+/).filter(Boolean).map(Number);
      if (!foreground || foreground.length < 3 || foreground.some((value) => !Number.isFinite(value))) unsupported = "Unsupported foreground color space";
      const range = document.createRange();
      range.selectNodeContents(node);
      for (const r of range.getClientRects()) {
        const left = Math.max(0, r.left), top = Math.max(0, r.top), right = Math.min(innerWidth, r.right), bottom = Math.min(innerHeight, r.bottom);
        if (right - left < 2 || bottom - top < 2) continue;
        const point = document.elementFromPoint((left + right) / 2, (top + bottom) / 2);
        if (point && !cue.contains(point) && !point.contains(cue)) unsupported = "Text is occluded at sampled center";
        const size = parseFloat(cs.fontSize), weight = parseFloat(cs.fontWeight) || (cs.fontWeight === "bold" ? 700 : 400);
        targets.push({ id, rect: [left, top, right - left, bottom - top], foreground,
          threshold: size >= 24 || (size >= 18.6667 && weight >= 700) ? 3 : 4.5, unsupported });
      }
    }
  });
  return targets;
}

export async function measureContrast({ b64, dpr, targets }) {
  const image = new Image();
  image.src = "data:image/png;base64," + b64;
  await image.decode();
  const canvas = document.createElement("canvas"), ctx = canvas.getContext("2d", { willReadFrequently: true });
  canvas.width = 32; canvas.height = 16;
  ctx.imageSmoothingEnabled = false;
  const luminance = (rgb) => rgb.map((value) => {
    const n = value / 255;
    return n <= 0.04045 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4;
  }).reduce((sum, n, i) => sum + n * [0.2126, 0.7152, 0.0722][i], 0);
  return targets.map((target) => {
    if (target.unsupported) return { id: target.id, status: "ungraded", reason: target.unsupported };
    // Mobile pages without viewport metadata are scaled to fit a wider layout viewport.
    // Read the actual screenshot scale instead of assuming CSS px * devicePixelRatio.
    const sx = image.naturalWidth / innerWidth || dpr, sy = image.naturalHeight / innerHeight || dpr;
    const [left, top, w, h] = target.rect;
    // Fractional crops can interpolate pixels outside the text rectangle, including
    // the white page beyond a scaled element's fill. Sample only whole interior
    // screenshot pixels, without filtering neighboring pixels into the sample.
    const x = Math.ceil(left * sx), y = Math.ceil(top * sy);
    const width = Math.floor((left + w) * sx) - x, height = Math.floor((top + h) * sy) - y;
    if (width < 1 || height < 1) return { id: target.id, status: "ungraded", reason: "Text rectangle has no full screenshot pixels" };
    ctx.clearRect(0, 0, 32, 16);
    ctx.drawImage(image, x, y, width, height, 0, 0, 32, 16);
    const pixels = ctx.getImageData(0, 0, 32, 16).data;
    let worst = Infinity, sum = 0, count = 0;
    for (let i = 0; i < pixels.length; i += 4) {
      const background = Array.from(pixels.slice(i, i + 3));
      // The text-only mask preserves every fill, including translucent own fills.
      // Composite translucent ink over those actual background pixels.
      const alpha = target.foreground[3] ?? 1;
      const foreground = target.foreground.slice(0, 3).map((n, channel) => n * alpha + background[channel] * (1 - alpha));
      const a = luminance(foreground), b = luminance(background);
      const ratio = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
      worst = Math.min(worst, ratio); sum += ratio; count++;
    }
    return { id: target.id, status: "graded", worst: +worst.toFixed(2), mean: +(sum / count).toFixed(2), threshold: target.threshold };
  });
}
