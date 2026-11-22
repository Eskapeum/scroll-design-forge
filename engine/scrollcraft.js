/* ============================================================================
   scrollcraft: a scroll-driven interaction runtime
   Derived from scroll-craft by Nate Herk (MIT), github.com/nateherkai/scroll-craft
   ----------------------------------------------------------------------------
   Vanilla JS. Zero dependencies. Zero DOM generation.

   The engine does NOT build your page. You author real, semantic HTML and mark
   it up with data-sc-* attributes; the engine reads them and drives them from a
   single scroll value on a single rAF loop. That is deliberate: a runtime that
   generates its own DOM from a config object makes every site it touches look
   identical, which is the failure mode this replaces.

   ---------------------------------------------------------------------------
   ACTS: the unit of scroll time
   ---------------------------------------------------------------------------
     <section data-sc-act="pin" data-sc-span="2.5"> ... </section>

     data-sc-act   scrub | pin | pan | flow   (default: flow)
     data-sc-clip-map="travel" opts a pinned act OUT of full-life clip mapping.
                   By DEFAULT a scrub clip is mapped across the stage's entire
                   on-screen life, not across its pinned travel, because a pinned
                   stage is visible for a viewport BEFORE the pin begins (sliding
                   up into view) and a viewport AFTER it ends (sliding off the
                   top). Mapped to pinned travel, the clip sits on its first
                   frame through the whole entry and its last frame through the
                   whole exit: the reader watches a still photograph while the
                   page moves. Pair it with data-sc-dwell, which moves quickly at
                   the edges and settles in the middle, so the fast motion lands
                   on the two slides and the settle lands inside the pin where
                   the copy is. data-sc-runout is accepted and ignored; it named
                   the old opt-in for the exit half of this.
     data-sc-span  viewport-heights of scroll this act owns. Pinned devices only
                   (scrub/pin/pan). Default 1.5. The engine sets the outer
                   height and sticks the first .sc-stage / [data-sc-stage] child.

     Every act exposes a normalized progress p (0..1):
       pinned  p = (y - top) / (height - vh)
       flow    p = (y + vh - top) / (height + vh)
     and publishes it as --sc-p on the act element, so CSS can read it too.

   ---------------------------------------------------------------------------
   DEVICES: what p drives
   ---------------------------------------------------------------------------
     data-sc-scrub            on <video>. p scrubs currentTime. Blob-loaded, so
                              it seeks without needing HTTP range support.
     data-sc-sequence="a/{i}.webp:120:1"
                              on <canvas>. p scrubs an image sequence
                              (path template : frameCount : startIndex).
     data-sc-pan="0.6"        on a wide rail inside data-sc-act="pan". p drives
                              horizontal travel. Value = extra travel multiplier.
     data-sc-parallax="-0.2"  translateY by rate * act-progress * viewport.
                              Negative = moves up faster than scroll (recedes).
     data-sc-cue="0.1 0.5"    opacity/rise keyed to p. One value = enter+hold.
                              Two = enter..leave. Optional third/fourth values
                              set the entrance/exit fractions of that window.
     data-sc-kinetic="lines"  lines | words | chars. Splits the element and
                              staggers its reveal across the cue window.
     data-sc-reveal="up"      up | down | left | right | iris. clip-path wipe.
     data-sc-count="0 4200"   number bloom across the cue window. Outside any
                              act it ticks up once on entry instead, over
                              data-sc-count-ms (default 1400).
     data-sc-in               flow-section reveal, fires once on entry via
                              IntersectionObserver (cheaper, and content that
                              re-hides on scroll-up is a defect, not an effect).
                              data-sc-stagger="60" on the parent staggers kids.
     data-sc-drift="#07090c"  page background interpolates toward this colour
                              while the act is on screen.

   ---------------------------------------------------------------------------
   WORLDFLIGHT: the page mode for one continuous flight
   ---------------------------------------------------------------------------
     <div data-sc-mode="worldflight" data-sc-seam="0.12">
       <div data-sc-world>
         <div data-sc-segment data-sc-w="1.4" data-sc-linger="0.3"
              data-sc-waypoint="Approach">
           <img class="sc-world__poster" src="p1.webp" alt="">
           <video data-sc-src="leg1.mp4" data-sc-src-mobile="leg1-m.mp4"></video>
         </div>
         ... more segments, in flight order ...
       </div>
       <div data-sc-world-copy>
         <div class="sc-world__scrim sc-scrim sc-scrim--band"></div>
         <div data-sc-copy data-sc-window="hero"> ... </div>
         <div data-sc-copy data-sc-window="0.34 0.56"> ... </div>
         <div data-sc-copy data-sc-window="finale"> ... </div>
       </div>
       <div data-sc-spacer aria-hidden="true"></div>
     </div>

   Acts cut the page into pinned blocks, which is the right shape for a page of
   chapters and the wrong shape for one continuous camera move: the reader hits
   the end of an act, the stage unsticks, a static page slides past, and the next
   act starts the whole thing again. Worldflight removes the seams by removing
   the blocks. There is ONE fixed stage for the entire page. The only element in
   document flow is a spacer, whose height the engine sets to the sum of the
   segment weights plus one viewport so the last flight can finish. Scroll drives
   the film timeline and the overlay opacity. Nothing else moves.

     data-sc-w        viewport-heights this segment owns. Default 1.3.
     data-sc-linger   dwell remap for this leg only (see lingerEase). Max 0.6.
     data-sc-seam     crossfade band, in viewport-heights of scroll. Default 0.12.
     data-sc-waypoint label published on --sc-seg / the sc:waypoint event, so a
                      page can draw its own route rail. The engine draws none.
     data-sc-window   on a copy block: "hero" | "finale" | "from to [in [out]]"
                      as fractions of the WHOLE track.

   Every clip stays mounted for the life of the page. Segments crossfade by
   opacity over the seam band; nothing ever swaps a src, because a src swap is a
   black frame and a black frame is the cut this mode exists to avoid.

   ---------------------------------------------------------------------------
   POINTER: interactivity that isn't scroll
   ---------------------------------------------------------------------------
     data-sc-tilt="8"         3D tilt toward the pointer, spring-damped, degrees.
     data-sc-magnet="0.35"    element drifts toward the pointer inside its bounds.
     data-sc-spotlight        publishes --sc-mx/--sc-my (0..1) for a light that
                              follows the pointer across the surface.
   All three are gated to (hover: hover) and (pointer: fine) and disabled under
   prefers-reduced-motion. Touch never fires them.

   ---------------------------------------------------------------------------
   REDUCED MOTION
   ---------------------------------------------------------------------------
   Fewer and gentler, not zero. Cues still fade (comprehension survives), but
   translation collapses, video clips are never fetched (the poster holds), and
   pointer devices are inert. A worldflight still tells its whole story: the
   posters cross-dissolve through the same seams and the same copy windows.

   ---------------------------------------------------------------------------
   THE PLAYHEAD
   ---------------------------------------------------------------------------
   Every scrub clip on the page, act or worldflight, is driven by one smoothed
   playhead. Scroll only ever writes a TARGET; a standalone rAF loop walks the
   current time toward it at a fixed fraction per frame (data-sc-lerp, default
   0.18; 1.0 under reduced motion, which is no smoothing at all). Writes are
   gated by a deadband and skipped while the decoder is still seeking. Without
   the smoothing a trackpad flick reads as a stutter, because wheel events do
   not arrive at a constant rate and a 1:1 write reproduces every gap in them.
   ========================================================================== */

(function (global) {
  'use strict';

  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fineMQ = matchMedia('(hover: hover) and (pointer: fine)');
  var smallMQ = matchMedia('(max-width: 860px)');
  var coarse = matchMedia('(hover: none) and (pointer: coarse)').matches;
  var isMobile = function () { return coarse || smallMQ.matches; };

  var clamp = function (x, a, b) { return x < a ? a : x > b ? b : x; };
  var clamp01 = function (x) { return clamp(x, 0, 1); };
  var smooth = function (x) { x = clamp01(x); return x * x * (3 - 2 * x); };
  var lerp = function (a, b, t) { return a + (b - a) * t; };

  // Monotone dwell remap. Settles the camera mid-act (where the copy peaks) and
  // moves quicker at the edges. f(0)=0 and f(1)=1 always, so seam frames between
  // consecutive clips are untouched and the chain stays invisible.
  function dwell(x, L) {
    if (!L) return x;
    L = clamp01(L);
    var c = x - 0.5;
    return (1 - L) * x + L * (4 * c * c * c + 0.5);
  }

  // Same curve, capped harder, and used per worldflight segment. Above ~0.6 the
  // derivative at the midpoint gets low enough that the camera visibly stops
  // dead mid-leg, which reads as a stall rather than a hold. The endpoints are
  // fixed by construction: f(0)=0, f(1)=1, so the first and last frames of every
  // leg are still exactly the frames the seam law matched, and the chain between
  // legs stays invisible no matter how much dwell a leg asks for.
  function lingerEase(x, L) {
    if (!L) return x;
    L = clamp(L, 0, 0.6);
    var c = x - 0.5;
    return (1 - L) * x + L * (4 * c * c * c + 0.5);
  }

  // The lerp is a mechanism, not a taste knob. It is exposed so a page whose
  // clips are unusually short (where 0.18 lags behind the pointer) can tighten
  // it, and it is never read as 0: a 0 lerp is a playhead that never moves.
  function lerpRate(el) {
    var v = parseFloat(el && el.getAttribute && el.getAttribute('data-sc-lerp'));
    return isNaN(v) || v <= 0 ? 0 : clamp(v, 0.02, 1);
  }

  // ---- colour -------------------------------------------------------------
  function parseColor(str) {
    str = (str || '').trim();
    var m = str.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
    if (m) {
      var h = m[1];
      if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
      return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
    }
    m = str.match(/rgba?\(([^)]+)\)/i);
    if (m) {
      var p = m[1].split(/[,\s/]+/).filter(Boolean).map(parseFloat);
      return [p[0], p[1], p[2]];
    }
    return null;
  }
  function mixColor(a, b, t) {
    return 'rgb(' + Math.round(lerp(a[0], b[0], t)) + ',' +
                    Math.round(lerp(a[1], b[1], t)) + ',' +
                    Math.round(lerp(a[2], b[2], t)) + ')';
  }

  // ---- text splitting -----------------------------------------------------
  // Wraps each unit in a masked span so the reveal can slide from behind a clean
  // edge instead of just fading. Lines are measured after layout, so this must
  // run once fonts are ready or the line boxes are wrong.
  function splitText(el, mode) {
    if (el.__scSplit) return el.__scSplit;
    var text = el.textContent;
    var units = [];

    if (mode === 'chars' || mode === 'words') {
      var parts = mode === 'chars' ? Array.from(text) : text.split(/(\s+)/);
      el.textContent = '';
      parts.forEach(function (t) {
        if (/^\s+$/.test(t)) { el.appendChild(document.createTextNode(t)); return; }
        var mask = document.createElement('span');
        mask.className = 'sc-split';
        var inner = document.createElement('span');
        inner.className = 'sc-split__i';
        inner.textContent = t;
        mask.appendChild(inner);
        el.appendChild(mask);
        units.push(inner);
      });
    } else {
      // lines: wrap every word, measure offsetTop, regroup words into line spans
      var words = text.split(/\s+/).filter(Boolean);
      el.textContent = '';
      var probes = words.map(function (w, i) {
        var s = document.createElement('span');
        s.textContent = w;
        el.appendChild(s);
        if (i < words.length - 1) el.appendChild(document.createTextNode(' '));
        return s;
      });
      var lines = [], cur = null, lastTop = null;
      probes.forEach(function (s) {
        var top = s.offsetTop;
        if (lastTop === null || Math.abs(top - lastTop) > 1) { cur = []; lines.push(cur); lastTop = top; }
        cur.push(s.textContent);
      });
      el.textContent = '';
      lines.forEach(function (words, li) {
        var mask = document.createElement('span');
        mask.className = 'sc-split sc-split--line';
        var inner = document.createElement('span');
        inner.className = 'sc-split__i';
        inner.textContent = words.join(' ');
        mask.appendChild(inner);
        el.appendChild(mask);
        // Whitespace between the line spans. Without it the line boxes abut in
        // the text layer, so selecting and copying the heading yields
        // "even whenbreakfast" and a screen reader hears the same.
        if (li < lines.length - 1) el.appendChild(document.createTextNode(' '));
        units.push(inner);
      });
    }
    el.__scSplit = units;
    return units;
  }

  // ---- number formatting --------------------------------------------------
  function formatNum(v, template) {
    var decimals = 0;
    var dot = template.indexOf('.');
    if (dot > -1) decimals = template.length - dot - 1;
    var s = v.toFixed(decimals);
    if (/,/.test(template) || Math.abs(v) >= 10000) {
      var bits = s.split('.');
      bits[0] = bits[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      s = bits.join('.');
    }
    return s;
  }

  // =========================================================================
  function mount(root, opts) {
    root = typeof root === 'string' ? document.querySelector(root) : (root || document);
    opts = opts || {};
    if (!root || !root.querySelectorAll) throw new Error('ScrollCraft.mount requires a DOM root');
    var previous = global.ScrollCraft.instances.find(function (instance) { return instance.root === root; });
    if (previous) return previous;

    var acts = [];
    var worlds = [];
    var drifts = [];
    var playheads = [];
    var scrollEls = [];
    var vh = innerHeight, vw = innerWidth;
    var y = 0, needsLayout = true;
    var progressBar = root.querySelector('[data-sc-progress]');
    var docEl = document.documentElement;
    var scope = root.nodeType === 9 ? docEl : root;
    var destroyed = false, listeners = [], observers = [], rafs = new Set(), timers = new Set();
    var aborter = new AbortController();
    // Track only our own writes, down to individual style properties and class
    // tokens. A routed application may update the same DOM before teardown.
    var mutations = new Map();
    function changes(el) {
      if (!mutations.has(el)) mutations.set(el, {
        styles: new Map(), classes: new Map(), attrs: new Map(), content: null,
        hadStyle: el.hasAttribute('style'), hadClass: el.hasAttribute('class')
      });
      return mutations.get(el);
    }
    function style(el, name, value) {
      var records = changes(el).styles;
      var current = el.style.getPropertyValue(name), priority = el.style.getPropertyPriority(name);
      var record = records.get(name);
      if (!record || current !== record.last || priority !== record.lastPriority) {
        record = { before: current, priority: priority };
        records.set(name, record);
      }
      el.style.setProperty(name, value);
      record.last = el.style.getPropertyValue(name);
      record.lastPriority = el.style.getPropertyPriority(name);
    }
    function classState(el, name, on) {
      var records = changes(el).classes, current = el.classList.contains(name), record = records.get(name);
      if (!record || current !== record.last) { record = { before: current }; records.set(name, record); }
      el.classList.toggle(name, on);
      record.last = on;
    }
    function attribute(el, name, value) {
      var records = changes(el).attrs, current = el.getAttribute(name), record = records.get(name);
      if (!record || current !== record.last) { record = { before: current }; records.set(name, record); }
      if (value === null) el.removeAttribute(name); else el.setAttribute(name, String(value));
      record.last = el.getAttribute(name);
    }
    function sameContent(el, record) {
      return el.textContent === record.text && el.childNodes.length === record.last.length &&
        record.last.every(function (node, index) { return el.childNodes[index] === node; });
    }
    function content(el, change) {
      var owned = changes(el), record = owned.content;
      if (!record || !sameContent(el, record)) {
        record = { before: Array.prototype.slice.call(el.childNodes) };
        owned.content = record;
      }
      try { return change(); }
      finally {
        record.text = el.textContent;
        record.last = Array.prototype.slice.call(el.childNodes);
      }
    }
    function textContent(el, text) { content(el, function () { el.textContent = text; }); }
    function listen(target, name, fn, options) {
      target.addEventListener(name, fn, options);
      listeners.push(function () { target.removeEventListener(name, fn, options); });
    }
    function raf(fn) {
      if (destroyed) return;
      var id = requestAnimationFrame(function (now) {
        rafs.delete(id);
        if (!destroyed) {
          try { fn(now); } catch (error) { destroy(); throw error; }
        }
      });
      rafs.add(id);
      return id;
    }
    function later(fn, ms) {
      var id = setTimeout(function () { timers.delete(id); if (!destroyed) fn(); }, ms);
      timers.add(id);
      return id;
    }
    function destroy() {
      if (destroyed) return;
      destroyed = true;
      aborter.abort();
      listeners.forEach(function (off) { off(); });
      observers.forEach(function (observer) { observer.disconnect(); });
      rafs.forEach(function (id) { cancelAnimationFrame(id); });
      timers.forEach(function (id) { clearTimeout(id); });
      playheads.forEach(function (V) {
        if (V.frameRequest != null && V.el.cancelVideoFrameCallback) V.el.cancelVideoFrameCallback(V.frameRequest);
        V.el.pause();
        if (V.url) {
          if (V.el.getAttribute('src') === V.url) { attribute(V.el, 'src', null); V.el.load(); }
          URL.revokeObjectURL(V.url);
        }
      });
      acts.forEach(function (a) {
        if (a.seq) a.seq.frames.forEach(function (img) {
          if (img) { img.onload = null; img.onerror = null; img.removeAttribute('src'); }
        });
      });
      mutations.forEach(function (owned, el) {
        owned.styles.forEach(function (record, name) {
          if (el.style.getPropertyValue(name) !== record.last || el.style.getPropertyPriority(name) !== record.lastPriority) return;
          if (record.before) el.style.setProperty(name, record.before, record.priority); else el.style.removeProperty(name);
        });
        owned.classes.forEach(function (record, name) {
          if (el.classList.contains(name) === record.last) el.classList.toggle(name, record.before);
        });
        owned.attrs.forEach(function (record, name) {
          if (el.getAttribute(name) !== record.last) return;
          if (record.before === null) el.removeAttribute(name); else el.setAttribute(name, record.before);
        });
        if (!owned.hadStyle && el.getAttribute('style') === '') el.removeAttribute('style');
        if (!owned.hadClass && el.getAttribute('class') === '') el.removeAttribute('class');
        if (owned.content && sameContent(el, owned.content)) el.replaceChildren.apply(el, owned.content.before);
        if (owned.content) delete el.__scSplit;
      });
      var index = global.ScrollCraft.instances.indexOf(api);
      if (index >= 0) global.ScrollCraft.instances.splice(index, 1);
      if (global.ScrollCraft.instances.length) docEl.classList.add('sc-ready');
      else docEl.classList.remove('sc-ready');
    }

    try {

    // One rate for the page, overridable per clip. Read from the mount root, the
    // document element, or the option bag, in that order.
    var LERP = lerpRate(root.nodeType === 1 ? root : null) ||
               lerpRate(docEl) ||
               (opts.lerp > 0 ? clamp(opts.lerp, 0.02, 1) : 0) ||
               0.18;

    // Every scrub clip on the page lives here, whatever drives it. tick() walks
    // this one list, so an act clip and a worldflight leg get the same playhead.
    function makeClip(v, host) {
      var rec = {
        el: v, host: host || v,
        ready: false, loading: false, painted: false,
        cur: 0, target: 0, live: false, stuckAt: 0,
        lerp: lerpRate(v) || LERP
      };
      v.muted = true;
      attribute(v, 'preload', 'none'); attribute(v, 'muted', ''); attribute(v, 'playsinline', '');
      playheads.push(rec);
      return rec;
    }

    // ---- collect acts -----------------------------------------------------
    Array.prototype.forEach.call(root.querySelectorAll('[data-sc-act]'), function (el) {
      var device = el.getAttribute('data-sc-act') || 'flow';
      var pinned = device === 'scrub' || device === 'pin' || device === 'pan';
      var act = {
        el: el,
        device: device,
        pinned: pinned,
        span: parseFloat(el.getAttribute('data-sc-span')) || (pinned ? 1.5 : 0),
        dwell: parseFloat(el.getAttribute('data-sc-dwell')) || 0,
        clipTravel: pinned && el.getAttribute('data-sc-clip-map') === 'travel',
        p: 0, raw: 0, top: 0, height: 0, live: false,
        cues: [], parallax: [], reveals: [], counts: [],
        video: null, seq: null, rail: null
      };

      if (pinned) {
        act.stage = el.querySelector('[data-sc-stage]') || el.querySelector('.sc-stage');
        if (act.stage) classState(act.stage, 'sc-stage', true);
        classState(el, 'sc-act--pinned', true);
      }

      // scrub video
      var v = el.querySelector('video[data-sc-scrub]');
      if (v) act.video = makeClip(v, el);

      // image sequence
      var cv = el.querySelector('canvas[data-sc-sequence]');
      if (cv) {
        var sequenceSpec = cv.getAttribute('data-sc-sequence');
        var parsedSpec = sequenceSpec.match(/^(.*?):(\d+)(?::(-?\d+))?$/);
        var spec = parsedSpec ? parsedSpec.slice(1) : [sequenceSpec, '1', '0'];
        act.seq = {
          el: cv, ctx: cv.getContext('2d', { alpha: false }),
          tpl: spec[0], count: Math.max(1, parseInt(spec[1], 10) || 1), start: parseInt(spec[2], 10) || 0,
          frames: [], failed: new Set(), pending: new Set(), loaded: 0, requested: 0, drawn: -1,
          radius: 4, concurrency: 3
        };
      }

      // horizontal rail
      act.rail = el.querySelector('[data-sc-pan]');
      if (act.rail) act.railExtra = parseFloat(act.rail.getAttribute('data-sc-pan')) || 0;

      // cues
      Array.prototype.forEach.call(el.querySelectorAll('[data-sc-cue]'), function (c) {
        var nums = (c.getAttribute('data-sc-cue') || '').trim().split(/\s+/).map(parseFloat);
        // from [to [rampIn [rampOut]]]
        // rampIn/rampOut are fractions OF THE WINDOW, defaulting to 0.3 each.
        // That leaves a ~40% plateau at full opacity in the middle. Without a
        // plateau a cue is a triangle: it touches opacity 1 for a single
        // instant, so the reader has to stop on exactly the right pixel to see
        // the line at full strength, and every heading reads as slightly faded.
        var cue = {
          el: c,
          from: isNaN(nums[0]) ? 0 : nums[0],
          to: nums.length > 1 && !isNaN(nums[1]) ? nums[1] : null,
          rIn: nums.length > 2 && !isNaN(nums[2]) ? clamp01(nums[2]) : 0.3,
          rOut: nums.length > 3 && !isNaN(nums[3]) ? clamp01(nums[3]) : null,
          rise: parseFloat(c.getAttribute('data-sc-rise')),
          kinetic: c.getAttribute('data-sc-kinetic'),
          units: null, state: -1
        };
        if (cue.rOut === null) cue.rOut = (nums.length > 2 && !isNaN(nums[2])) ? 0.3 : 0.3;
        if (isNaN(cue.rise)) cue.rise = 1;
        act.cues.push(cue);
      });

      // parallax
      Array.prototype.forEach.call(el.querySelectorAll('[data-sc-parallax]'), function (c) {
        act.parallax.push({ el: c, rate: parseFloat(c.getAttribute('data-sc-parallax')) || 0 });
      });

      // reveals
      Array.prototype.forEach.call(el.querySelectorAll('[data-sc-reveal]'), function (c) {
        var nums = (c.getAttribute('data-sc-reveal-at') || '0 0.5').trim().split(/\s+/).map(parseFloat);
        act.reveals.push({ el: c, dir: c.getAttribute('data-sc-reveal') || 'up', from: nums[0] || 0, to: nums[1] || 0.5 });
      });

      // counters
      Array.prototype.forEach.call(el.querySelectorAll('[data-sc-count]'), function (c) {
        var nums = (c.getAttribute('data-sc-count') || '').trim().split(/\s+/);
        var at = (c.getAttribute('data-sc-count-at') || '0.1 0.55').trim().split(/\s+/).map(parseFloat);
        // Strip separators before parsing so the author can write the target
        // exactly as it should render. Without this, "0 3,500" parses the target
        // as 3 (the comma stops parseFloat) and "0 3500" renders "3500", because
        // formatNum only adds separators above 10,000. So any real figure between
        // 1,000 and 9,999 could not be shown the way it is written everywhere
        // else on the page. The template still drives the formatting.
        var num = function (s) { return parseFloat(String(s).replace(/,/g, '')) || 0; };
        act.counts.push({
          el: c, a: num(nums[0]), b: num(nums[1]),
          tpl: nums[1] || '0', from: at[0], to: at[1], last: null
        });
      });

      acts.push(act);

      var d = el.getAttribute('data-sc-drift');
      if (d) { var rgb = parseColor(d); if (rgb) drifts.push({ act: act, rgb: rgb }); }
    });

    // ---- collect worldflights --------------------------------------------
    Array.prototype.forEach.call(root.querySelectorAll('[data-sc-mode="worldflight"]'), function (el) {
      var W = {
        el: el,
        stage: el.querySelector('[data-sc-world]') || el.querySelector('.sc-world'),
        copyLayer: el.querySelector('[data-sc-world-copy]') || el.querySelector('.sc-world__copy'),
        spacer: el.querySelector('[data-sc-spacer]') || el.querySelector('.sc-world__spacer'),
        seam: 0, segs: [], copies: [], total: 0, top: 0, index: -1, checked: false
      };
      var seam = parseFloat(el.getAttribute('data-sc-seam'));
      // A seam wider than the shortest leg would have three clips dissolving at
      // once and no leg ever fully present. Cap it well under that.
      W.seam = isNaN(seam) || seam <= 0 ? 0.12 : clamp(seam, 0.02, 0.4);
      if (W.stage) classState(W.stage, 'sc-world', true);
      if (W.copyLayer) classState(W.copyLayer, 'sc-world__copy', true);
      if (W.spacer) classState(W.spacer, 'sc-world__spacer', true);

      Array.prototype.forEach.call(el.querySelectorAll('[data-sc-segment]'), function (s) {
        var seg = {
          el: s,
          w: parseFloat(s.getAttribute('data-sc-w')) || 1.3,
          linger: clamp(parseFloat(s.getAttribute('data-sc-linger')) || 0, 0, 0.6),
          label: s.getAttribute('data-sc-waypoint') || '',
          poster: s.querySelector('[data-sc-poster]') || s.querySelector('.sc-world__poster') || s.querySelector('img'),
          c0: 0, c1: 0, local: 0, op: -1, z: -1, clip: null
        };
        classState(s, 'sc-world__seg', true);
        if (seg.poster) classState(seg.poster, 'sc-world__poster', true);
        var v = s.querySelector('video');
        if (v) {
          // Mark it as a scrub clip whether or not the author did. Everything
          // downstream, the stylesheet and the verification harness included,
          // finds scrub media by this attribute.
          attribute(v, 'data-sc-scrub', '');
          seg.clip = makeClip(v, s);
        }
        W.segs.push(seg);
      });

      var run = 0;
      W.segs.forEach(function (s) { s.c0 = run; run += Math.max(s.w, 0.1); s.c1 = run; });
      W.total = Math.max(run, 0.001);

      Array.prototype.forEach.call(el.querySelectorAll('[data-sc-copy]'), function (cEl) {
        var spec = (cEl.getAttribute('data-sc-window') || '').trim();
        var q = { el: cEl, from: 0, to: 1, rIn: 0.3, rOut: 0.3, state: -1 };
        var first = W.segs[0], last = W.segs[W.segs.length - 1];
        if (spec === 'hero') {
          // Present the instant the reader lands. A hero that fades IN has to
          // fade in from nothing over an empty first screen, which is the one
          // moment on the page where there is nothing else to look at.
          q.from = 0;
          q.to = first ? (0.62 * first.w) / W.total : 0.3;
          q.rIn = 0; q.rOut = 0.65;
        } else if (spec === 'finale') {
          q.from = last ? (last.c0 + 0.4 * last.w) / W.total : 0.7;
          q.to = 1; q.rIn = 0.55; q.rOut = 0;
        } else {
          var n = spec.split(/\s+/).map(parseFloat);
          q.from = isNaN(n[0]) ? 0 : clamp01(n[0]);
          q.to = (n.length > 1 && !isNaN(n[1])) ? clamp01(n[1]) : clamp01(q.from + 0.18);
          if (n.length > 2 && !isNaN(n[2])) q.rIn = clamp01(n[2]);
          if (n.length > 3 && !isNaN(n[3])) q.rOut = clamp01(n[3]);
        }
        if (q.to <= q.from) q.to = clamp01(q.from + 0.05);
        W.copies.push(q);
      });

      worlds.push(W);
    });

    // ---- flow reveals (fire once) ----------------------------------------
    var io = null;
    if ('IntersectionObserver' in window) {
      io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return;
          var el = e.target;
          classState(el, 'sc-in', true);
          var stagger = parseFloat(el.getAttribute('data-sc-stagger'));
          if (!isNaN(stagger)) {
            Array.prototype.forEach.call(el.children, function (kid, i) {
              style(kid, 'transition-delay', (i * stagger) + 'ms');
              classState(kid, 'sc-in', true);
            });
          }
          io.unobserve(el);
        });
      }, { rootMargin: '0px 0px -12% 0px', threshold: 0.01 });
      observers.push(io);
      Array.prototype.forEach.call(root.querySelectorAll('[data-sc-in]'), function (el) { io.observe(el); });
    } else {
      Array.prototype.forEach.call(root.querySelectorAll('[data-sc-in]'), function (el) { classState(el, 'sc-in', true); });
    }

    // ---- entry counters (fire once) --------------------------------------
    // A [data-sc-count] outside any pinned act is not scrubbed by scroll; it
    // ticks up once when it enters view, over data-sc-count-ms (default 1400).
    // Same formatting rules as the act counter: write the target as it should
    // render. Reduced motion writes the final value and never animates.
    (function () {
      var ease = function (t) { return 1 - Math.pow(1 - t, 3); };
      var num = function (s) { return parseFloat(String(s).replace(/,/g, '')) || 0; };
      var spec = function (c) { return (c.getAttribute('data-sc-count') || '').trim().split(/\s+/); };
      var els = Array.prototype.filter.call(root.querySelectorAll('[data-sc-count]'), function (c) {
        return !c.closest('[data-sc-act]');
      });
      if (!els.length) return;
      function run(c) {
        var nums = spec(c);
        var a = num(nums[0]), b = num(nums[1]), tpl = nums[1] || '0';
        var ms = parseFloat(c.getAttribute('data-sc-count-ms')) || 1400;
        if (reduce || ms <= 0) { textContent(c, formatNum(b, tpl)); return; }
        var t0 = null, last = null;
        function frame(now) {
          if (t0 === null) t0 = now;
          var t = Math.min((now - t0) / ms, 1);
          var out = formatNum(a + (b - a) * ease(t), tpl);
          if (out !== last) { textContent(c, out); last = out; }
          if (t < 1) raf(frame);
        }
        raf(frame);
      }
      els.forEach(function (c) { var n = spec(c); textContent(c, formatNum(num(n[0]), n[1] || '0')); });
      if ('IntersectionObserver' in window) {
        var cio = new IntersectionObserver(function (entries) {
          entries.forEach(function (e) {
            if (!e.isIntersecting) return;
            run(e.target); cio.unobserve(e.target);
          });
        }, { rootMargin: '0px 0px -10% 0px', threshold: 0.5 });
        observers.push(cio);
        els.forEach(function (c) { cio.observe(c); });
      } else {
        els.forEach(run);
      }
    })();

    // ---- layout -----------------------------------------------------------
    function layout() {
      if (destroyed) return;
      vh = innerHeight; vw = innerWidth;
      acts.forEach(function (a) {
        if (a.pinned) style(a.el, 'height', (a.span * 100) + 'vh');
      });
      // The spacer is the whole document flow of a worldflight. Its height is
      // the sum of the leg weights plus one viewport: without that extra screen
      // the track runs out at the moment the last leg reaches p=1, so the last
      // leg's final second is a place the reader can never actually stop.
      // Set in pixels, not vh, because .sc-world is sized in svh on phones and a
      // vh/svh mismatch would put the track and the stage on different rulers.
      worlds.forEach(function (W) {
        if (W.spacer) style(W.spacer, 'height', Math.round((W.total + 1) * vh) + 'px');
      });
      acts.forEach(function (a) {
        var r = a.el.getBoundingClientRect();
        a.top = r.top + scrollY;
        a.height = r.height;
      });
      if (acts.length) {
        acts.forEach(function (a) {
          if (a.seq && a.seq.el) {
            var box = a.seq.el.getBoundingClientRect();
            var dpr = Math.min(devicePixelRatio || 1, 2);
            attribute(a.seq.el, 'width', Math.round(box.width * dpr));
            attribute(a.seq.el, 'height', Math.round(box.height * dpr));
            a.seq.drawn = -1;
          }
        });
      }
      // A pinned act whose stage is not actually sticky fails silently: the
      // stage just scrolls by, the copy cues correctly against a frame nobody
      // can see, and every automated check passes. Any author rule that sets
      // `position` on the stage causes it. Say so.
      acts.forEach(function (a) {
        if (!a.pinned || !a.stage || a.stageChecked) return;
        a.stageChecked = true;
        var pos = getComputedStyle(a.stage).position;
        if (pos !== 'sticky' && pos !== '-webkit-sticky') {
          console.warn('[scrollcraft] act "' + (a.el.id || a.device) + '" will not pin: its stage computes ' +
            'position:' + pos + ', not sticky. Something is overriding .sc-stage.', a.stage);
        }
      });

      worlds.forEach(function (W) {
        W.top = W.el.getBoundingClientRect().top + scrollY;
        if (W.checked) return;
        W.checked = true;
        if (!W.stage) {
          console.warn('[scrollcraft] worldflight has no [data-sc-world] stage; nothing will fly.', W.el);
          return;
        }
        if (!W.spacer) {
          console.warn('[scrollcraft] worldflight has no [data-sc-spacer]; the page has no scroll track.', W.el);
        }
        // The same silent failure as an unpinned act, one level worse: a stage
        // that is not fixed scrolls away and takes the whole page with it, while
        // every progress number still reads correctly.
        var wp = getComputedStyle(W.stage).position;
        if (wp !== 'fixed') {
          console.warn('[scrollcraft] worldflight stage computes position:' + wp + ', not fixed. ' +
            'Something is overriding .sc-world, and the flight will scroll off screen.', W.stage);
        }
      });

      needsLayout = false;
      read();
    }

    // ---- video ------------------------------------------------------------
    function loadVideo(a) { loadClip(a.video); }
    function loadClip(V) {
      // Under reduced motion the clip is never fetched. The poster holds the
      // frame and the copy still cues, so the page reads without the decode.
      if (destroyed || reduce || !V || V.loading || V.failed) return;
      var src = V.el.getAttribute('data-sc-src') ||
                (isMobile() && V.el.getAttribute('data-sc-src-mobile')) ||
                V.el.currentSrc || V.el.src;
      if (isMobile() && V.el.getAttribute('data-sc-src-mobile')) src = V.el.getAttribute('data-sc-src-mobile');
      if (!src) return;
      V.loading = true;
      fetch(src, { signal: aborter.signal }).then(function (r) { if (!r.ok) throw new Error(r.status); return r.blob(); })
        .then(function (blob) {
          if (destroyed) return;
          // Listeners and preload BEFORE src. Assigning src starts the load, so
          // attaching afterwards and then calling load() restarts it and aborts
          // the first request (visible as ERR_ABORTED on the blob URL).
          var updateDuration = function () {
            if (V.ready || !Number.isFinite(V.el.duration) || V.el.duration <= 0) return;
            V.ready = true;
            // Force one seek even when the target is already 0. The reveal is
            // gated on a 'seeked' event, and the raf loop only seeks when the
            // time actually needs to change, so a clip sitting at the very top
            // of its act would never seek, never fire 'seeked', and never
            // replace its poster until the reader scrolled it off zero.
            try { V.el.currentTime = Math.max(V.target * (V.el.duration || 1), 0.001); } catch (e) {}
            read();
          };
          listen(V.el, 'durationchange', updateDuration);
          listen(V.el, 'loadedmetadata', function () {
            updateDuration();
            // Recorded WebM can decode with an initially unknown duration.
            // Priming/presenting a frame must not wait for scrub-ready timing.
            // Prime the decoder the moment the clip can be primed, without
            // waiting for a gesture. A muted inline play() is allowed with no
            // user activation on every platform except a restricted one (Low
            // Power Mode, data saver), and there the rejection is harmless: the
            // gesture listeners below retry on the next real touch.
            primeClip(V);
          });
          // Reveal only once a real frame has painted. iOS keeps a seeked-but-
          // never-played muted video blank, so hiding the poster on metadata
          // alone flashes an empty stage.
          var hasPresentedFrame = !V.el.requestVideoFrameCallback;
          var reveal = function () {
            if (destroyed || V.failed || V.painted || !hasPresentedFrame || V.el.error || V.el.readyState < 2 || !V.el.videoWidth) return;
            V.painted = true;
            classState(V.host, 'sc-has-clip', true);
            classState(V.el, 'sc-has-clip', true);
          };
          if (V.el.requestVideoFrameCallback) {
            V.frameRequest = V.el.requestVideoFrameCallback(function () {
              V.frameRequest = null;
              hasPresentedFrame = true;
              reveal();
            });
          }
          // A compositor callback can arrive while a new seek temporarily drops
          // readyState below HAVE_CURRENT_DATA. Retain that positive frame
          // evidence and retry when decoding settles; never promote a timer or
          // metadata-only event into proof that a frame was presented.
          // Older browsers use loaded pixels plus a data/seek event instead.
          listen(V.el, 'loadeddata', reveal);
          listen(V.el, 'seeked', reveal);
          listen(V.el, 'error', function () {
            V.failed = true; V.ready = false; V.painted = false;
            classState(V.host, 'sc-has-clip', false); classState(V.el, 'sc-has-clip', false);
            if (V.frameRequest != null && V.el.cancelVideoFrameCallback) V.el.cancelVideoFrameCallback(V.frameRequest);
            V.frameRequest = null;
            if (V.url) { URL.revokeObjectURL(V.url); V.url = null; }
          });
          attribute(V.el, 'preload', 'auto');
          V.el.muted = true;            // as a property, not only an attribute
          attribute(V.el, 'playsinline', '');
          V.url = URL.createObjectURL(blob);
          attribute(V.el, 'src', V.url);
        })
        .catch(function () { V.loading = false; V.failed = true; });
    }

    // ---- image sequence ---------------------------------------------------
    function loadSeq(a) {
      var S = a.seq;
      if (destroyed || !S || !S.ctx) return;
      var target = reduce ? 0 : clamp(Math.round(a.p * (S.count - 1)), 0, S.count - 1);
      var radius = reduce ? 0 : S.radius;
      // Keep a sliding window, one last painted fallback, and at most three
      // in-flight images. Decoded full-resolution frames are not a free cache.
      Object.keys(S.frames).forEach(function (key) {
        var i = Number(key);
        if (Math.abs(i - target) > radius && i !== S.drawn && !S.pending.has(i)) {
          S.frames[i].removeAttribute('src');
          delete S.frames[i];
        }
      });
      var candidates = [target];
      for (var offset = 1; offset <= radius; offset++) candidates.push(target + offset, target - offset);
      candidates.forEach(function (i) {
        if (i < 0 || i >= S.count || S.frames[i] || S.failed.has(i) || S.pending.size >= S.concurrency) return;
          var img = new Image();
          img.decoding = 'async';
          S.frames[i] = img;
          S.pending.add(i);
          img.onload = function () {
            if (destroyed) return;
            S.pending.delete(i); S.loaded++;
            drawSeq(a);
            loadSeq(a);
          };
          img.onerror = function () {
            if (destroyed) return;
            S.pending.delete(i); S.failed.add(i); delete S.frames[i];
            drawSeq(a);
            loadSeq(a);
          };
          img.src = S.tpl.replace('{i}', String(S.start + i))
                         .replace('{ii}', String(S.start + i).padStart(2, '0'))
                         .replace('{iii}', String(S.start + i).padStart(3, '0'))
                         .replace('{iiii}', String(S.start + i).padStart(4, '0'));
      });
    }
    function drawSeq(a) {
      var S = a.seq;
      if (destroyed || !S || !S.ctx || !S.frames.length) return;
      var idx = reduce ? 0 : clamp(Math.round(a.p * (S.count - 1)), 0, S.count - 1);
      var available = Object.keys(S.frames).map(Number).filter(function (i) {
        return S.frames[i].complete && S.frames[i].naturalWidth > 0;
      });
      if (!available.length) return;
      idx = available.reduce(function (best, i) { return Math.abs(i - idx) < Math.abs(best - idx) ? i : best; });
      if (idx === S.drawn) return;
      var img = S.frames[idx];
      if (!img || !img.complete || !img.naturalWidth) return;
      var cw = S.el.width, ch = S.el.height;
      // cover fit
      var scale = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
      var w = img.naturalWidth * scale, h = img.naturalHeight * scale;
      S.ctx.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
      S.drawn = idx;
    }

    // ---- worldflight ------------------------------------------------------
    // t is the position along the flight, measured in viewport-heights of
    // scroll, so every number here is in the same unit the author wrote the
    // weights in. There is no per-segment geometry to read: the stage never
    // moves, so nothing needs measuring on scroll.
    function readWorld(W) {
      if (!W.segs.length) return;
      var S = W.seam;
      var t = clamp((y - W.top) / Math.max(vh, 1), 0, W.total);
      var pr = t / W.total;
      var i, s;

      // The current leg is the last one whose crossfade has begun.
      var k = 0;
      for (i = 0; i < W.segs.length; i++) if (t >= W.segs[i].c0 - S / 2) k = i;

      for (i = 0; i < W.segs.length; i++) {
        s = W.segs[i];
        var local = clamp01((t - s.c0) / Math.max(s.w, 0.001));
        s.local = local;

        // Fetch a leg only while it is within reach. Loading the whole flight up
        // front is tens of megabytes before the first frame paints; loading it
        // on arrival means arriving at a poster.
        if (s.clip && t > s.c0 - 1.6 && t < s.c1 + 1.6) loadClip(s.clip);

        // Opacity. The incoming leg fades UP over the outgoing one, which holds
        // at full strength underneath until it is completely covered. Fading
        // both halves of a crossfade is what puts the page ground through the
        // middle of the seam and reads as a flash.
        var op;
        if (i > k) op = 0;
        else if (i === k) op = i === 0 ? 1 : smooth((t - (s.c0 - S / 2)) / S);
        else op = t < s.c1 + S / 2 ? 1 : 0;

        var z = i === k ? 120 : Math.round(100 + op * 10);
        if (op !== s.op) {
          style(s.el, 'opacity', op.toFixed(3));
          // A leg at zero must stop compositing entirely. Six full-bleed video
          // layers all painting at opacity 0 costs the same as painting them.
          style(s.el, 'visibility', op > 0.002 ? 'visible' : 'hidden');
          s.op = op;
        }
        if (z !== s.z) { style(s.el, 'z-index', String(z)); s.z = z; }

        if (s.clip) {
          s.clip.live = op > 0.002;
          s.clip.target = lingerEase(local, s.linger);
        }
        // Until a real frame has painted, the poster carries the move. A still
        // that sits perfectly still while the page scrolls announces itself as a
        // placeholder; a slow push in reads as the camera already flying.
        if (s.poster && !reduce && !(s.clip && s.clip.painted) && op > 0.002) {
          style(s.poster, 'transform', 'scale(' + (1.03 + local * 0.14).toFixed(4) + ')');
        }
      }

      for (var c = 0; c < W.copies.length; c++) {
        var q = W.copies[c];
        var win = Math.max(q.to - q.from, 0.001);
        var inEnd = q.from + win * q.rIn;
        var outStart = q.to - win * q.rOut;
        var vis;
        // A hero declares rIn 0, so inEnd sits exactly on `from` and the ramp
        // branch is skipped: the block is simply present from the first pixel.
        if (pr < q.from) vis = 0;
        else if (pr < inEnd) vis = smooth((pr - q.from) / Math.max(inEnd - q.from, 0.001));
        else if (pr <= outStart) vis = 1;
        else vis = smooth(1 - (pr - outStart) / Math.max(q.to - outStart, 0.001));
        vis = clamp01(vis);
        if (q.el.contains(document.activeElement)) vis = 1;

        // The ONLY transform on the copy side, and it is capped at 4vh across
        // the whole window. Anything larger stops reading as a parallax layer
        // over a moving world and starts reading as a second page scrolling at a
        // different speed, which is the exact cheapness this mode replaces.
        var wp = clamp01((pr - q.from) / win);
        style(q.el, 'opacity', vis.toFixed(3));
        style(q.el, 'transform', reduce ? 'none'
          : 'translate3d(0,' + ((0.5 - wp) * 4).toFixed(2) + 'vh,0)');
        var on = vis > 0.5;
        if (on !== (q.state === 1)) { q.state = on ? 1 : 0; style(q.el, 'pointer-events', on ? 'auto' : 'none'); }
      }

      // Publish the route, draw none of it. A gauge, a map, a leg counter and a
      // set of chapter dots are all the same two numbers, and a runtime that
      // ships one of them ships it to every page that uses this mode.
      var cur = W.segs[k];
      style(W.el, '--sc-seg', String(k));
      style(W.el, '--sc-segp', cur.local.toFixed(4));
      style(docEl, '--sc-seg', String(k));
      style(docEl, '--sc-segp', cur.local.toFixed(4));
      if (k !== W.index) {
        W.index = k;
        try {
          W.el.dispatchEvent(new CustomEvent('sc:waypoint', {
            bubbles: true,
            detail: { index: k, count: W.segs.length, label: cur.label, el: cur.el, progress: pr }
          }));
        } catch (e) {}
      }
    }

    // ---- per-frame scroll read -------------------------------------------
    function read() {
      if (destroyed) return;
      y = scrollY || pageYOffset;
      var driftA = null, driftB = null, driftT = 0;
      var maxY = Math.max((document.documentElement.scrollHeight || 0) - vh, 1);

      for (var i = 0; i < acts.length; i++) {
        var a = acts[i];
        var raw;
        if (a.pinned) {
          var travel = Math.max(a.height - vh, 1);
          raw = clamp01((y - a.top) / travel);
        } else {
          raw = clamp01((y + vh - a.top) / (a.height + vh));
        }
        a.raw = raw;
        a.p = a.dwell ? dwell(raw, a.dwell) : raw;
        if (a.seq) a.seq.requested = reduce ? 0 : clamp(Math.round(a.p * (a.seq.count - 1)), 0, a.seq.count - 1);

        // Clip time is NOT cue time. Cues belong to the pin, so they keep using
        // `p`. The clip belongs to the stage, and the stage is on screen for one
        // viewport before the pin starts and one after it ends. Driving the clip
        // from `p` therefore parks it on frame one for the whole entry slide and
        // on its last frame for the whole exit slide, which is a still
        // photograph moving up the screen under the reader's hand.
        //
        // So map the clip across the stage's entire visible life instead. Both
        // ends are clamped to scroll that actually exists: an act at the top of
        // the document has no entry slide and must still start on frame one, and
        // an act near the bottom must still reach its last frame while the page
        // can still scroll.
        a.vp = a.p;
        if (a.pinned && !a.clipTravel) {
          var startY = a.top - Math.min(vh, a.top);
          var endY = Math.min(a.top + a.height, maxY);
          var vraw = clamp01((y - startY) / Math.max(endY - startY, 1));
          a.vp = a.dwell ? dwell(vraw, a.dwell) : vraw;
        }
        a.live = (y > a.top - vh * 1.25) && (y < a.top + a.height + vh * 1.25);
        style(a.el, '--sc-p', a.p.toFixed(4));

        // Fetch earlier than we drive. A 1080p clip is megabytes, and a reader
        // who scrolls briskly will otherwise arrive at a stage that is still
        // downloading and see a poster where the camera move should be.
        var warm = (y > a.top - vh * 3) && (y < a.top + a.height + vh * 1.5);
        if (warm) {
          if (a.video) loadVideo(a);
          if (a.seq) loadSeq(a);
        }
        if (a.live && a.seq) drawSeq(a);
        if (a.video) { a.video.live = a.live; if (a.video.ready) a.video.target = a.vp; }

        // horizontal rail
        if (a.rail) {
          var over = a.rail.scrollWidth - vw;
          if (over > 0) {
            var extra = over * (a.railExtra || 0);
            style(a.rail, 'transform', 'translate3d(' + (-(over + extra) * a.p).toFixed(2) + 'px,0,0)');
          }
        }

        if (!a.live && !a.el.contains(document.activeElement)) {
          // An act that scrolls out of range must release its cues rather than
          // freezing them at whatever they last were. A "hold" cue left at
          // opacity 1 keeps its element hit-testable and paintable long after
          // its act is gone, which shows up as a stray headline over a later
          // section. Zero once, then leave it alone.
          if (a.parked !== true) {
            for (var z = 0; z < a.cues.length; z++) {
              var pq = a.cues[z];
              style(pq.el, 'opacity', '0');
              style(pq.el, 'pointer-events', 'none');
              pq.state = 0;
              if (pq.units) for (var zu = 0; zu < pq.units.length; zu++) style(pq.units[zu], 'opacity', '0');
            }
            a.parked = true;
          }
          continue;
        }
        a.parked = false;

        // cues
        for (var c = 0; c < a.cues.length; c++) {
          var q = a.cues[c];
          var vis;
          if (q.to === null) {
            vis = smooth((a.p - q.from) / 0.18);
          } else {
            var win = Math.max(q.to - q.from, 0.001);
            var inEnd = q.from + win * q.rIn;        // full opacity from here
            var outStart = q.to - win * q.rOut;      // starts leaving here
            if (a.p < inEnd) vis = smooth((a.p - q.from) / Math.max(inEnd - q.from, 0.001));
            else if (a.p <= outStart) vis = 1;       // the plateau
            else vis = smooth(1 - (a.p - outStart) / Math.max(q.to - outStart, 0.001));
          }
          vis = clamp01(vis);
          if (q.el.contains(document.activeElement)) vis = 1;

          if (q.kinetic) {
            if (!q.units) {
              q.units = content(q.el, function () { return splitText(q.el, q.kinetic); });
              classState(q.el, 'sc-is-split', true);
            }
            var n = q.units.length;
            // Stagger across the reveal window. 0.62 spread leaves the tail of
            // the window for the last unit to finish, so the line lands together
            // rather than trickling.
            for (var u = 0; u < n; u++) {
              var uStart = (u / Math.max(n, 1)) * 0.62;
              var uv = clamp01((vis - uStart) / (1 - 0.62 + 0.001));
              uv = smooth(uv);
              style(q.units[u], 'opacity', uv.toFixed(3));
              style(q.units[u], 'transform', reduce ? 'none'
                : 'translate3d(0,' + ((1 - uv) * 100).toFixed(2) + '%,0)');
            }
            style(q.el, 'opacity', '1');
          } else {
            style(q.el, 'opacity', vis.toFixed(3));
            style(q.el, 'transform', reduce ? 'none'
              : 'translate3d(0,' + ((1 - vis) * 2.4 * q.rise).toFixed(2) + 'vh,0)');
          }
          var on = vis > 0.5;
          if (on !== (q.state === 1)) { q.state = on ? 1 : 0; style(q.el, 'pointer-events', on ? 'auto' : 'none'); }
        }

        // parallax
        if (!reduce) {
          for (var pz = 0; pz < a.parallax.length; pz++) {
            var pp = a.parallax[pz];
            style(pp.el, 'transform', 'translate3d(0,' + (pp.rate * (a.p - 0.5) * 100).toFixed(2) + 'px,0)');
          }
        }

        // reveals
        for (var rv = 0; rv < a.reveals.length; rv++) {
          var R = a.reveals[rv];
          var t = smooth((a.p - R.from) / Math.max(R.to - R.from, 0.001));
          var pct = ((1 - t) * 100).toFixed(2);
          style(R.el, 'clip-path',
            R.dir === 'down' ? 'inset(' + pct + '% 0 0 0)' :
            R.dir === 'left' ? 'inset(0 ' + pct + '% 0 0)' :
            R.dir === 'right' ? 'inset(0 0 0 ' + pct + '%)' :
            R.dir === 'iris' ? 'circle(' + (t * 78).toFixed(2) + '% at 50% 50%)' :
                               'inset(0 0 ' + pct + '% 0)');
        }

        // counters
        for (var ct = 0; ct < a.counts.length; ct++) {
          var K = a.counts[ct];
          var kt = smooth((a.p - K.from) / Math.max(K.to - K.from, 0.001));
          var val = lerp(K.a, K.b, kt);
          var out = formatNum(val, K.tpl);
          if (out !== K.last) { textContent(K.el, out); K.last = out; }
        }
      }

      for (var w = 0; w < worlds.length; w++) readWorld(worlds[w]);

      // background drift
      for (var d = 0; d < drifts.length; d++) {
        var D = drifts[d];
        if (D.act.raw > 0 && D.act.raw < 1) {
          driftA = D; driftT = smooth(D.act.raw / 0.35);
          driftB = drifts[d - 1] || D;
          break;
        }
        if (D.act.raw >= 1) { driftA = D; driftB = D; driftT = 1; }
      }
      if (driftA) {
        style(docEl, '--sc-canvas', mixColor(driftB.rgb, driftA.rgb, driftT));
      }

      if (progressBar) {
        var max = Math.max(document.body.scrollHeight - vh, 1);
        style(progressBar, 'transform', 'scaleX(' + clamp01(y / max).toFixed(4) + ')');
      }
    }

    // ---- video seek loop --------------------------------------------------
    // Split from read() on purpose: seeking is asynchronous and rate-limited by
    // the decoder, while read() must stay cheap enough to run on every scroll
    // event. The lerp here is also what turns a jittery wheel into a glide.
    function tick() {
      // Deadband. A phone decoder cannot service a seek every frame, so asking
      // for one costs more than it shows; 20ms of clip is under a frame of
      // footage anyway.
      var eps = isMobile() ? 0.02 : 0.008;
      for (var i = 0; i < playheads.length; i++) {
        var V = playheads[i];
        if (!V.ready) continue;
        // Never queue a seek while the decoder is still resolving the last one.
        // On a phone a fast flick otherwise piles seeks up and freezes the clip.
        // But a seek that never completes would freeze the clip for the life of
        // the page through this very guard, so a seek stuck past 700ms is
        // re-issued rather than waited on forever.
        if (V.el.seeking) {
          var nw = performance.now();
          if (!V.stuckAt) V.stuckAt = nw;
          else if (nw - V.stuckAt > 700) {
            V.stuckAt = nw;
            try { V.el.currentTime = V.el.currentTime + 0.001; } catch (e) {}
          }
          continue;
        }
        V.stuckAt = 0;
        // An offscreen clip that has already arrived stops costing anything.
        if (!V.live && Math.abs(V.cur - V.target) < 0.002) continue;
        V.cur += (V.target - V.cur) * (reduce ? 1 : V.lerp);
        var dur = V.el.duration || 1;
        var t = clamp(V.cur, 0, 0.999) * dur;
        if (Math.abs(V.el.currentTime - t) > eps) { try { V.el.currentTime = t; } catch (e) {} }
      }
      raf(tick);
    }

    // iOS will not paint a muted video that has never been handed a user
    // gesture, so a clip can be loaded, seeked and still show nothing.
    //
    // This used to fire once, on the first touch, across every playhead. That
    // loses a race it cannot win. The first act's clip is still being fetched
    // when the reader's first touch arrives (they touch the screen in order to
    // scroll, and the clip is megabytes) so play() is called on a video with
    // no source, does nothing, and the one shot is spent. Every later act loads
    // long after that touch, with user activation already granted, and works
    // without ever needing this. That is the exact shape of the bug: the hero
    // frozen, everything below it fine.
    //
    // So: keep listening, prime each clip once it actually has a source, and
    // stop only when they are all done. And force a seek afterwards, because a
    // primed decoder still shows the stale frame until something asks it for a
    // different time, and the deadband in tick() will not ask if the playhead is
    // already where it should be.
    var primedCount = 0;
    function primeClip(V) {
      // priming guards the retry: play() is a promise, and calling it again
      // while the last one is unsettled produces "interrupted by pause" and can
      // leave the element playing.
      if (destroyed || reduce || V.failed || V.primed || V.priming || !V.el.src) return;
      V.priming = true;
      var done = function () {
        if (destroyed) { V.el.pause(); return; }
        V.priming = false;
        if (!V.primed) { V.primed = true; primedCount++; }
        try { V.el.pause(); } catch (e) {}
        // repaint: nudge past the deadband so the next tick writes for real
        try {
          var dur = Number.isFinite(V.el.duration) && V.el.duration > 0 ? V.el.duration : 1;
          V.cur = clamp(V.cur, 0, 0.999);
          V.el.currentTime = clamp(V.cur * dur + 0.05, 0, dur * 0.999);
        } catch (e) {}
      };
      var fail = function () { V.priming = false; };
      // A play() promise is allowed to stay pending forever (iOS does this to a
      // video it has decided not to start). If that happened here, `priming`
      // would jam and no gesture could ever retry, so the flag is released on a
      // timer as well. A late resolution after the release still lands in
      // done(), which is idempotent.
      later(function () { if (V.priming) fail(); }, 2000);
      var pr;
      try { pr = V.el.play(); } catch (e) { fail(); return; }
      if (pr && pr.then) pr.then(done, fail);
      else done();
    }
    function prime() {
      for (var i = 0; i < playheads.length; i++) primeClip(playheads[i]);
      if (playheads.length && primedCount >= playheads.length) {
        removeEventListener('touchstart', prime);
        removeEventListener('touchend', prime);
        removeEventListener('pointerdown', prime);
        removeEventListener('click', prime);
        removeEventListener('scroll', prime);
      }
    }
    // touchend and click are here because the HTML spec's list of activation-
    // triggering events includes touchend but NOT touchstart. A restricted
    // device (Low Power Mode) that rejects the touchstart prime for lacking
    // activation gets a second, valid chance the moment the finger lifts.
    listen(global, 'touchstart', prime, { passive: true });
    listen(global, 'touchend', prime, { passive: true });
    listen(global, 'pointerdown', prime, { passive: true });
    listen(global, 'click', prime, { passive: true });
    listen(global, 'scroll', prime, { passive: true });

    // ---- pointer devices --------------------------------------------------
    var tilts = [], magnets = [], spots = [];
    function initPointer() {
      if (reduce || !fineMQ.matches) return;
      Array.prototype.forEach.call(root.querySelectorAll('[data-sc-tilt]'), function (el) {
        tilts.push({ el: el, max: parseFloat(el.getAttribute('data-sc-tilt')) || 6, x: 0, ty: 0, tx: 0, y: 0 });
      });
      Array.prototype.forEach.call(root.querySelectorAll('[data-sc-magnet]'), function (el) {
        magnets.push({ el: el, k: parseFloat(el.getAttribute('data-sc-magnet')) || 0.3, x: 0, y: 0, tx: 0, ty: 0 });
      });
      Array.prototype.forEach.call(root.querySelectorAll('[data-sc-spotlight]'), function (el) {
        spots.push(el);
      });
      if (!tilts.length && !magnets.length && !spots.length) return;

      listen(global, 'pointermove', function (e) {
        if (e.pointerType !== 'mouse') return;
        for (var i = 0; i < tilts.length; i++) {
          var T = tilts[i], r = T.el.getBoundingClientRect();
          if (r.bottom < -200 || r.top > vh + 200) { T.tx = 0; T.ty = 0; continue; }
          var nx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
          var ny = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
          var inside = Math.abs(nx) < 1.6 && Math.abs(ny) < 1.6;
          T.tx = inside ? clamp(ny, -1, 1) * -T.max : 0;
          T.ty = inside ? clamp(nx, -1, 1) * T.max : 0;
        }
        for (var m = 0; m < magnets.length; m++) {
          var M = magnets[m], mr = M.el.getBoundingClientRect();
          var dx = e.clientX - (mr.left + mr.width / 2);
          var dy = e.clientY - (mr.top + mr.height / 2);
          var near = Math.abs(dx) < mr.width && Math.abs(dy) < mr.height * 2.5;
          M.tx = near ? dx * M.k : 0;
          M.ty = near ? dy * M.k : 0;
        }
        for (var s = 0; s < spots.length; s++) {
          var sr = spots[s].getBoundingClientRect();
          style(spots[s], '--sc-mx', clamp01((e.clientX - sr.left) / sr.width).toFixed(3));
          style(spots[s], '--sc-my', clamp01((e.clientY - sr.top) / sr.height).toFixed(3));
        }
      }, { passive: true });

      (function pointerTick() {
        // Interpolate toward the target rather than tracking the pointer
        // directly. Direct tracking reads as artificial because it carries no
        // momentum; the lerp gives it weight.
        for (var i = 0; i < tilts.length; i++) {
          var T = tilts[i];
          T.x += (T.tx - T.x) * 0.09; T.y += (T.ty - T.y) * 0.09;
          if (Math.abs(T.x) > 0.001 || Math.abs(T.y) > 0.001) {
            style(T.el, 'transform', 'perspective(1100px) rotateX(' + T.x.toFixed(3) + 'deg) rotateY(' + T.y.toFixed(3) + 'deg)');
          }
        }
        for (var m = 0; m < magnets.length; m++) {
          var M = magnets[m];
          M.x += (M.tx - M.x) * 0.12; M.y += (M.ty - M.y) * 0.12;
          style(M.el, 'transform', 'translate3d(' + M.x.toFixed(2) + 'px,' + M.y.toFixed(2) + 'px,0)');
        }
        raf(pointerTick);
      })();
    }

    // ---- wiring -----------------------------------------------------------
    var ticking = false;
    listen(global, 'scroll', function () {
      if (!ticking) { ticking = true; raf(function () { read(); ticking = false; }); }
    }, { passive: true });

    // Keep native tab order. Focusing a future cue navigates its timeline to a
    // readable point; focused ancestors stay visible until focus leaves. Inert
    // alone would remove future calls to action from keyboard navigation.
    function cuePoint(q) {
      if (q.to === null) return clamp01(q.from + 0.18);
      return clamp01(q.from + (q.to - q.from) * (q.rIn + 1 - q.rOut) / 2);
    }
    function rawPoint(p, amount) {
      var lo = 0, hi = 1;
      for (var i = 0; i < 24; i++) {
        var mid = (lo + hi) / 2;
        if (dwell(mid, amount) < p) lo = mid; else hi = mid;
      }
      return (lo + hi) / 2;
    }
    listen(global, 'focusin', function (e) {
      var el = e.target;
      if (!el || !el.closest || !root.contains(el)) return;
      var targetY = null;
      worlds.forEach(function (W) {
        W.copies.forEach(function (q) {
          if (q.el.contains(el) && q.state !== 1) targetY = W.top + cuePoint(q) * W.total * vh;
        });
      });
      acts.forEach(function (a) {
        if (!a.el.contains(el)) return;
        var q = a.cues.find(function (cue) { return cue.el.contains(el); });
        if (q && (q.state !== 1 || !a.live)) {
          var raw = rawPoint(cuePoint(q), a.dwell);
          targetY = a.pinned ? a.top + raw * Math.max(a.height - vh, 1)
            : el.getBoundingClientRect().top + scrollY - vh / 2 + el.getBoundingClientRect().height / 2;
        }
        if (a.rail && a.rail.contains(el) && !reduce) {
          var over = Math.max(a.rail.scrollWidth - vw, 0) * (1 + (a.railExtra || 0));
          var rect = el.getBoundingClientRect(), railRect = a.rail.getBoundingClientRect();
          var panP = over ? clamp01((rect.left - railRect.left + rect.width / 2 - vw / 2) / over) : 0;
          targetY = a.top + rawPoint(panP, a.dwell) * Math.max(a.height - vh, 1);
          // Native focus scrolling can move a clipped rail's scrollLeft as well
          // as our transform, creating a second, unintended horizontal offset.
          if (a.stage) a.stage.scrollLeft = 0;
        }
      });
      if (targetY !== null) scrollTo({ top: targetY, behavior: 'instant' });
      var ancestor = el;
      while (ancestor && root.contains(ancestor)) {
        if (ancestor.matches('[data-sc-in], [data-sc-stagger] > *')) {
          classState(ancestor, 'sc-in', true); style(ancestor, 'transition-delay', '0ms');
        }
        ancestor = ancestor.parentElement;
      }
      read();
    });
    listen(global, 'focusout', function () { raf(read); });

    listen(global, 'resize', function () {
      layout();
    }, { passive: true });
    if ('ResizeObserver' in global) {
      var layoutPending = false;
      var layoutObserver = new ResizeObserver(function () {
        if (!layoutPending) {
          layoutPending = true;
          raf(function () { layoutPending = false; layout(); });
        }
      });
      observers.push(layoutObserver);
      acts.forEach(function (a) { layoutObserver.observe(a.el); });
      worlds.forEach(function (W) { layoutObserver.observe(W.el); });
    }

    if (document.fonts && document.fonts.ready) {
      // Line splitting measures line boxes, so it has to wait for the real face.
      document.fonts.ready.then(function () {
        if (destroyed) return;
        acts.forEach(function (a) { a.cues.forEach(function (q) { if (q.kinetic && q.units) { q.el.__scSplit = null; q.units = null; } }); });
        layout();
      });
    }

    classState(scope, 'sc-mounted', true);
    layout();
    initPointer();
    if (playheads.length && !reduce) raf(tick);
    classState(docEl, 'sc-ready', true);

    var api = { root: root, layout: layout, read: read, destroy: destroy, acts: acts, worlds: worlds, clips: playheads, lerp: LERP };
    global.ScrollCraft.instances.push(api);
    return api;
    } catch (error) {
      destroy();
      throw error;
    }
  }

  // The instance list is not an API for the page. It is how the verification
  // harness reads the real playhead records: a screenshot taken mid-lerp is a
  // frame the page never actually holds, so the harness has to be able to ask
  // whether the playhead has arrived rather than guess with a timeout.
  global.ScrollCraft = { mount: mount, reduce: reduce, instances: [] };
})(window);
