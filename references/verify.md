# Verification: scoped evidence, not a promise about every frame

Run this for changed page behavior. For a review-only request, inspect and report;
do not install dependencies, change the page, generate assets or deploy fixes
without authorization. Match verification effort to the affected behavior.

## 1. Bind the run to the build

A valid response from a port does not prove it serves your page. Record buildId
and revision in [build.json](manifest.md) and matching page meta tags. Freeze
the revision after editing, then start an owned loopback server:

```bash
node <skill>/scripts/doctor.mjs --mode verify
node <skill>/scripts/serve.mjs --root <build> --manifest <build>/build.json --port 0
```

Read the actual URL printed by the server. Keep that process alive with the
host's supported background/session mechanism and close only that owned process
when finished. Do not kill whatever happens to occupy a fixed port.

```bash
node <skill>/scripts/shoot.mjs --url http://127.0.0.1:PORT --manifest <build>/build.json --out <build>/lab/desktop
node <skill>/scripts/shoot.mjs --url http://127.0.0.1:PORT --manifest <build>/build.json --out <build>/lab/mobile --width 390 --height 844
node <skill>/scripts/shoot.mjs --url http://127.0.0.1:PORT --manifest <build>/build.json --out <build>/lab/reduced --reduced-motion
```

`--build-id ID --revision REV` may replace `--manifest`.
The expected identity must match
`<meta name="scroll-forge-build-id" content="ID">` and
`<meta name="scroll-forge-revision" content="REV">`, or corresponding
`x-scroll-forge-build-id` / `x-scroll-forge-revision` response headers.
When both are present, mismatches are errors. Header-only identity attests to
server configuration, not to independently verified file bytes.

Asset hashes in a manifest are provenance records; inspect the report to see
whether they were verified. Do not imply that merely supplying a manifest
verifies every asset hash. A revised page needs a revised identity.

Serve over HTTP; file URLs are unsuitable for this media-loading workflow.
Use a browser with the codecs your actual media requires. Do not assume every
Chromium distribution has identical codec support.

## 2. Read the verdict and coverage

`report.json` contains samples **and** structured findings, inventory, coverage,
identity, console/network diagnostics and contact-sheet status. The final verdict:
- **FAIL:** an observed blocker.
- **INCOMPLETE:** required evidence could not be obtained or identified.
- **PASS:** the implemented checks passed for the reported coverage only.

FAIL and INCOMPLETE exit nonzero. `--report-only` allows an exploratory command
to exit successfully but does not change its verdict. Do not use report-only
as a shipping waiver. A missing contact sheet, missing identity or unsettled
capture must not silently become a clean run.

The harness samples within acts and at worldflight seams. Increase sample
density where needed, and inspect cue boundaries, entry/exit slides, narrow
windows and the beginning/end. Never time fades to avoid the sampling grid.
A transition must be legible when a visitor stops there, including between
the positions the harness happened to capture.

Check the coverage denominator: how many expected cues, clips, acts and text
regions were examined, and which cases were skipped. A clip excluded because it
never painted is a missing/failed media state, not a moving clip.

## 3. Mechanical findings

- **Cue visibility:** expected cues are inventoried before sampling, using
  element identity rather than repeated text strings. A cue never observed
  at a readable plateau needs a failure or an explicit coverage gap.
- **Media:** assert decoding/paint separately from playhead changes. Corrupt
  video, load errors, parked posters and unsettled seeking need clear findings.
- **Dead scroll:** compare visible state belonging to the sampled experience.
  Movement of an offscreen section must not hide a frozen on-screen stage.
- **Pan overflow:** a pinned rail with no overflow is not evidence of useful
  horizontal motion. Prefer normal flow when the content fits rather than
  adding filler solely to create travel.
- **Requests and console:** investigate missing assets and runtime errors even
  if posters make a screenshot look acceptable.

For page-local fixed systems the harness cannot understand, publish
`data-sc-verify-state` as a compact signature of **rendered visible state**.
Do not publish raw scroll progress simply to get a passing result.
`data-sc-verify-hold="true"` can identify a deliberate hold only while it is
active. Explain the purpose of the hold in the brief; still inspect it visually.

## 4. Contrast is a scoped heuristic

The screenshot scanner is not WCAG certification. Its samples approximate
backgrounds under selected cue/copy regions and cannot prove every text run,
font size, alpha stack, blend mode, focus indicator or page-local canvas is
accessible. Report unsupported/unmeasured regions rather than treating them
as clean. Repeated CTA text must not collapse distinct elements.

Use the composited background for translucent fills. A 51% black fill on white
is not solid black. Treat text opacity, descendants with their own color, masks,
fixed foreground overlays and scrims carefully. Where the heuristic is
insufficient, use targeted rendered inspection and an appropriate accessibility
tool or manual measurement.

Keep scrims separate from the text they protect so hiding text for a background
capture does not remove its scrim too. A changed scrim producing byte-identical
measurements is a reason to inspect the measurement, not intensify the scrim.

For the intended conformance level, check body/large text and controls using
their applicable thresholds. A blanket 3:1 floor is not sufficient for ordinary
body copy. Do not ignore low-opacity text if it remains part of the intended
readable state.

## 5. Required manual and interaction passes

Read the actual contact sheet and scroll the live page. Screenshots can show
composition and state differences, but they do not prove smooth timing.

For the affected portions, test:
- Opening message, hierarchy, preserved content and a working next action.
- Tab, Shift+Tab, Enter and focus visibility through late cues, pinned acts,
  worldflight windows and rail items. Pointer-events is not keyboard control.
- Slow scroll, fast flick, reverse scroll, anchor jumps and resize.
- Mobile anchors and crops at relevant breakpoints, not only one phone width.
- Reduced motion with all information/actions reachable, including rail items.
- Blocked JavaScript and failed mount: useful static content and actions.
- Slow/failed media: posters remain visible, no false painted state.
- Mount/destroy/remount for routed integrations.

Do not claim a rendered static poster proves the normal-motion low-bandwidth
path works. Test that path with network throttling or failed requests separately.
Record explicit omissions.

## 6. Real phones and device diagnosis

Headless desktop Chrome at a mobile viewport is not an iPhone test. Real touch,
decoder policy, Low Power Mode and browser chrome can differ.

On a reported device-specific failure, first compare a working and broken clip
on the same device. Inspect source dimensions/codecs, first-touch timing,
load order, priming and error state before changing unrelated layout.

`references/device-diag.html` can compare the build's own clips with a
known-good clip using direct and Blob sources. Inspect and configure its TESTS
array; use it locally or deploy it **only when deployment is authorized**.
Ask for device evidence if the device is unavailable. Do not claim a desktop
fix is verified on a phone you did not test.

Useful media lifecycle checks include:
- a real decoded/presented frame, not just metadata or a seek event;
- `seekable.length` before reading a seekable range;
- actual currentTime movement across the visible band;
- rejected/pending play promises and seek timeouts;
- gesture retries after a source is ready, with bounded recovery.

The engine owns generic lifecycle recovery. Page-local code should not add a
second competing playhead loop to hide a runtime defect.

## 7. Continuous worlds

Run `scripts/worldflight-assert.mjs --url URL` for the architecture contract,
then the identity-bound screenshot passes. Validate the actual configured
instance, not a historical fixture's lerp constant.

Inspect encoded boundary frames and camera velocity on both sides of each seam,
in forward and reverse travel. PSNR is a diagnostic: identical frames can yield
infinity, codec noise can reduce it, and a high number does not establish smooth
motion. Failed checks stop further dependent paid work.

## 8. Independent review and performance

Use [evaluation.md](evaluation.md) for blind artifact review and benchmark briefs.
Report observed comprehension, hierarchy, reachability and distinctiveness
separately from intended emotion. Human emotion and conversion remain untested
unless actual audience evidence exists.

Agree performance budgets for the delivery surface. Measure initial transfer,
media bytes, load timing, layout shift and responsiveness using reproducible
device/network settings. Useful field targets are LCP ≤2.5s, INP ≤200ms and
CLS ≤0.1 at the 75th percentile, segmented by mobile/desktop
([Web Vitals](https://web.dev/articles/vitals)).
A local lab run does not establish field percentiles or real-user INP.

Re-run affected checks after fixes. Final handoff identifies the exact build,
tests and coverage, blockers or waivers, unverified environments, asset route,
and estimated versus recorded spend. A PASS is evidence within those bounds,
not “everything works everywhere.”
