# Worldflight: continuous-world architecture

Read only when the approved concept needs one continuous camera journey.
This is a technical mode, not a requirement for every immersive page.
Confirm an authorized clip source, camera intention, mobile treatment and budget
before rendering. The mode is not available from still images alone; a planned
poster-only experience is a different concept and must be described honestly.

## Contents

1. Markup and runtime contract
2. Track, seams and copy windows
3. Camera and asset architectures
4. Motion handoffs and validation
5. Loading, fallback and lifecycle
6. Pacing and verification

## 1. Markup and runtime contract

During enhancement this mode uses one fixed world, persistent leg elements,
a fixed copy layer and a spacer. Do not put act-mode devices inside the same
worldflight root: they use a different timeline. Navigation and controls can
live outside the canvas. Without enhancement, content must have a useful static
reading order; the “spacer-only flow” contract applies to the enhanced mode,
not to accessibility or failure fallbacks.

```html
<div data-sc-mode="worldflight" data-sc-seam="0.12">
  <div data-sc-world>
    <div data-sc-segment data-sc-w="1.3" data-sc-linger="0.2"
         data-sc-waypoint="Surface">
      <img class="sc-world__poster" src="assets/p1.webp" alt="">
      <video data-sc-src="assets/leg1.mp4"
             data-sc-src-mobile="assets/leg1-mobile.mp4" muted playsinline></video>
    </div>
    <div data-sc-segment data-sc-w="1.3" data-sc-waypoint="Arrival">
      <img class="sc-world__poster" src="assets/p2.webp" alt="">
      <video data-sc-src="assets/leg2.mp4"
             data-sc-src-mobile="assets/leg2-mobile.mp4" muted playsinline></video>
    </div>
  </div>
  <div data-sc-world-copy>
    <div class="sc-world__scrim sc-scrim sc-scrim--band" aria-hidden="true"></div>
    <div class="sc-copy sc-copy--lead" data-sc-copy data-sc-window="hero">
      <h1>The journey's opening</h1>
      <p>Essential context remains real text.</p>
    </div>
    <div class="sc-copy sc-copy--trail" data-sc-copy data-sc-window="finale">
      <h2>The arrival</h2>
      <a href="/contact">Contact</a>
    </div>
  </div>
  <div data-sc-spacer aria-hidden="true"></div>
</div>
<script src="scrollcraft.js"></script>
<script>const experience = ScrollCraft.mount(document);</script>
```

Use real destinations and useful copy in a build. Include build identity meta
tags from [manifest.md](manifest.md). The engine reads authored DOM; a manifest
records decisions and evidence, not the page's generated layout.

| Attribute | Location | Meaning |
|---|---|---|
| `data-sc-mode="worldflight"` | mode root | Selects the world timeline |
| `data-sc-seam` | mode root | Crossfade width in viewport-height units; default 0.12, clamp 0.02–0.4 |
| `data-sc-world` | stage | Single enhanced fixed world |
| `data-sc-segment` | leg | Poster and clip container |
| `data-sc-w` | leg | Scroll weight in viewport-height units; default 1.3 |
| `data-sc-linger` | leg | Dwell remap, 0–0.6 |
| `data-sc-waypoint` | leg | Label for the waypoint event |
| `data-sc-world-copy` | layer | Enhanced fixed copy layer |
| `data-sc-copy` | block | Copy controlled by a window |
| `data-sc-window` | block | `hero`, `finale`, or `from to [in [out]]` |
| `data-sc-spacer` | spacer | Runtime-sized scroll track |
| `data-sc-lerp` | mount root or video | Playhead interpolation; default 0.18, clamp 0.02–1 |

A value of 1.3 means 1.3 viewport heights, **not CSS `1.3vh`**.
Use positive leg weights. Changes to weights move copy and navigation boundaries.

## 2. Track, seams and copy

Spacer height is `(sum(weights) + 1) * viewportHeight`. The extra viewport
accounts for the viewport itself: available scroll distance is the sum of the
leg weights. Leg i owns `[c_i, c_i + w_i)`; local progress is
`(trackPosition - c_i) / w_i`, remapped by linger.

Do not independently animate page height or change the stage's fixed-position
contract. Re-measure after relevant layout changes and verify a positive spacer
height. A preview mounted at zero height must recover after it becomes visible.

### Seams

The incoming leg fades over an opaque outgoing leg; the outgoing leg disappears
only after it is covered. Fading both to partial opacity exposes the page ground
and creates a flash. The assets must still agree at the join: blending does not
repair mismatched geometry or camera velocity. Keep clips mounted during the
flight; replacing an active source can invalidate seek state.

### Copy windows

- `hero`: present on entry, fades out during the first leg.
- `finale`: enters during the last leg and holds at the end.
- Numeric windows use fractions of the whole track, with default ramps of 30%
  of the window and a full-opacity plateau. Optional ramp values override them.

Keep essential text legible long enough to read at a normal pace. The engine's
copy motion spans at most 4 CSS vh vertically; this is a bounded mechanism,
not an assertion that every readable page needs moving copy.
Place scrims as siblings of copy blocks so background sampling does not remove
them with the text. Choose scrim shape and colors from composition and contrast,
not a one-accent or one-scrim quota.

Keyboard users must reach every action visibly. Verify focus into late windows
and reverse traversal; opacity and pointer-events alone do not remove a control
from keyboard navigation.

### Route navigation

The engine exposes `--sc-seg`, `--sc-segp`, and a bubbling `sc:waypoint` event
with `{index, count, label, el, progress}`. Build useful navigation from them.
Do not assume a decorative position marker is keyboard-operable navigation.

```js
function updateRoute(event) {
  document.querySelectorAll('.rail__leg').forEach(el => {
    if (+el.dataset.leg === event.detail.index) el.setAttribute('aria-current', 'step');
    else el.removeAttribute('aria-current');
  });
}
addEventListener('sc:waypoint', updateRoute);
```

## 3. Camera and asset architectures

Use the camera intention already present in the brief; ask only if it is
unresolved. Offer meaningful tradeoffs rather than silently selecting it.

| Camera | Feel | Typical asset approach |
|---|---|---|
| Forward walkthrough | Travel through connected spaces | Serial rendered-frame handoff or coherent anchors |
| Locked glide | Stable angle, world moves past | Coherent anchors with constrained rotation |
| Aerial dive and hop | Visit scenes, pull out and travel onward | Dive clips plus connector legs |

A dive/pull-out reverses direction. This may be intentional in a map-like world
but can read as rewinding in a grounded scene. Prototype that transition before
committing the budget. Neither a fixed camera nor a forward path is universally
best; the approved concept decides.

### Serial rendered-frame handoff

Generate and encode a leg, inspect its last frame, then use that exact encoded
frame as the next leg's starting reference. This supports natural continuation
but makes later work dependent on earlier output. A bad handoff must be fixed
before spending on dependent legs.

### Coherent anchors

Author all anchor images as one journey. Leg i uses anchor i as its start and
anchor i+1 as its end, **if the chosen model supports both endpoints**.
This allows local retries, but two anchors can still produce unwanted pullbacks
or morphs. Probe the actual final model. `scripts/chain.sh` implements this
method; it does not generate serial or connector architectures automatically.

### Dive clips and connectors

A connector's start is the previous dive's actual encoded final frame; its end
is the next dive's actual encoded first frame. Do not substitute the scene
stills, which may differ from the clips' rendered views.

```text
dive_i.end ≈ connector.start
connector.end ≈ dive_(i+1).start
```

The relation is visually continuous, not guaranteed pixel identity after codecs.
Use matching mobile endpoints as well, or verify their separate crops.

To extract the exact last decoded frame of a short encoded clip:
```bash
ffmpeg -i assets/leg1.mp4 -vf reverse -frames:v 1 chain/last.png
ffmpeg -i assets/leg2.mp4 -frames:v 1 chain/first.png
```
Reverse buffers frames; for long footage use a bounded extraction workflow and
verify the selected frame is truly the last, rather than assuming an arbitrary
`-sseof` offset identifies it.

## 4. Motion handoffs and validation

Endpoint agreement controls position, not velocity. Describe and inspect both.

For a forward journey, a useful prompt pattern is:
> Continue the same slow forward glide. [Scene-specific movement.] In the final
> second, settle into the same forward drift toward the next opening. Keep the
> subject and geometry coherent, with no accidental cut, shake, warping or flicker.

A locked glide additionally constrains rotation and angle. An aerial connector
describes the intentional pull-out and arrival. These are examples: keep shared
requirements consistent without forcing incompatible clauses onto every camera.

Inspect each boundary and the movement approaching it before further dependent
generation. Run `scripts/framelock.sh` against encoded head/tail frames. Perfect
matches may report infinite PSNR. Codec noise can lower the score without
changing composition; a favorable number does not prove smooth velocity.
Soft comparisons need visual review; failed checks stop the chain. Do not hide
a failed check behind a successful final exit.

A refused request must be reported. Do not retry unchanged prompts, strip trigger
words or switch providers to evade filters. A different permitted concept or
an explicitly approved direct crossfade may be offered. This engine does not
understand a “null connector” configuration object; a changed leg sequence must
be reflected in real markup and re-verified.

## 5. Loading, fallback and lifecycle

Provide a poster and mobile source for every leg that needs one. The runtime
loads nearby clips instead of the whole flight, using Blob URLs to make seeks
independent of range support. A failed load/decoder keeps its poster visible;
a timer is not evidence of a painted frame.

Under reduced motion clips are not fetched, position changes are removed, and
poster/copy states preserve the story. Also test a slow-network normal-motion
run: reduced motion is not a substitute for bandwidth testing.

Use `instance.destroy()` before replacing an experience in a routed application.
Page-local listeners (such as the route example above), observers and animations
need their own cleanup. Test remounts and failed initialization; a static reading
fallback must remain usable if enhancement never starts.

## 6. Pacing and verification

Start with comparable scroll-distance/clip-duration ratios between continuous
legs, then adjust only where the story or camera movement earns the change.
Equal ratios do not prove equal perceived speed. Tune on both wheel and touch;
do not promote an old build's exact lerp or speed into a universal requirement.
A smaller lerp damps more but can lag the hand. Recheck copy windows whenever
weights, duration, linger or seam width changes.

Follow [verify.md](verify.md), including identity-bound normal, mobile and
reduced-motion runs. The specialized check is:

```bash
node <skill>/scripts/worldflight-assert.mjs --url http://127.0.0.1:PORT
```

It should inspect the actual public runtime instance and configured values,
not a private variable from a historical rig. Use its structural/motion
assertions alongside the screenshot report, not as proof of composition,
readability, conversion or real iPhone behavior.

Inspect seams in both directions, ordinary reading-speed motion, late keyboard
actions, the opening and the final held state. Record what was checked,
what failed, and what remains untested in the build's report.
