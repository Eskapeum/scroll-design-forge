# Assets: direction, provenance and scrubbing

Read this only when selecting, creating or encoding media. A text-led page or a
repair to existing motion does not automatically require new assets.

## 1. Capability and spending contract

Inventory supplied photos, footage, logos and packaging first. Read the active
generation tool's instructions and current model documentation before preparing
requests. Use the available authorized route; [codex.md](codex.md) covers harness
discovery. If using the installed `generate` skill, it owns API fields,
credentials, approval gates and provider accounting. Its helper may be located
at `~/.claude/skills/generate/gen.sh`, but verify it exists.

Before paid generation, record the model, parameters, unit estimate, number of
jobs, possible rerolls and approved ceiling in [the manifest](manifest.md).
Quote the arithmetic and obtain the required authorization. Approval for one
clip is not approval for all retries or a different model/resolution. Stop at
the approved limit, on an ambiguous billed failure, or on a failed quality gate.
Do not automatically retry a potentially charged request.

Prices in an old example are not current quotes. Separate:
- **Estimated cost:** current documented rates times requested work.
- **Recorded charges:** provider or generation ledger entries.
- **Unreconciled attempts:** possibly billed requests whose outcome is uncertain.

For example, six stills at 0.03, two drafts at 0.35 and two finals at 1.51 total
**3.90**, not 3.20. These are arithmetic examples, not current model prices.
Do not scale estimates by a historical account discount or claim a supplied
`--cost` argument proves the amount billed. Reconcile errored calls using the
selected provider's supported audit mechanism before retrying.

Request silent video where supported and strip audio in the final encode.
A refusal is a stop-and-report condition. Do not strip filter-trigger words,
resubmit unchanged requests repeatedly or switch providers to evade a refusal.
A genuinely different, permitted concept can be proposed to the user.

## 2. Art direction and per-shot contracts

Write shared invariants once: real product identity, palette, materials,
lighting relationships, grade and realism. Reuse those invariants consistently.
Do not freeze every shot to the same lens or layout just to make a preamble
byte-identical. Match the output visually, including when supplied assets and
generated assets come from different sources.

For each asset record:
- Role: background under copy, editorial image, product cutout, diagram,
  poster, scrub clip or worldflight leg.
- Real references and provenance; any labeled sample or illustrative content.
- Desktop and mobile framing, actual dimensions and focal point.
- Text-safe region **when copy overlays the image**, not by default.
- Motion before/after state, target duration and acceptable handoff if a clip.

Inspect every selected image and play every clip. Check product consistency,
composition, grade, artifacts, mobile crop and essential content. Do not fill a
page with generated scenes simply to satisfy a device quota.

## 3. Prototype before the complete asset run

For a new ambitious direction, validate a small storyboard and the riskiest
interaction before ordering all final media. A continuous flight needs an
approved probe demonstrating endpoint and motion continuity. Supplied footage
can be used for this proof without generation.

Draft and final models may differ in behavior. A good draft does not prove a
different final model can lock both endpoints. Check the selected model's
current start/end-image support; use a bounded probe for the actual final route.
Neither a seed nor an accepted request guarantees visual reproducibility.

## 4. Scrub clips

A scrubber can stop on any frame and play in reverse. Prefer a coherent camera
move with a stable subject. Avoid accidental cuts, warping, abrupt reversals,
flicker and transient intrusions that become awkward frozen frames. Purposeful
movement can be used when the brief requires it and the prototype proves it.

Example motion brief:

> Continue a slow forward dolly toward the product, keeping the product legible
> throughout. No cuts, zoom snaps, camera shake, warping or flicker. Keep the
> composition usable when paused and when traversed backward.

Add requirements that actually apply to the scene; do not automatically ban
all people or all objects entering the frame. In a chain, describe the entry
and exit camera velocity as well as the endpoints. See [worldflight.md](worldflight.md).

Use as many clips as the content and approved performance budget justify.
Two clips is a useful small-page starting estimate, not a universal maximum.

## 5. Supplied footage

Inspect color space, exposure, frame rate, duration and crop before grading.
Do not assume every supplied clip is flat/log footage or apply one historical
levels correction to every source. Preserve the original. Grade an intermediate
only when needed, using appropriate color management and a visual check.

Trim deliberately, avoid stream-copy cuts for a scrub master, and consider
24–30 fps when higher frame rates add bandwidth without useful detail.
Keep motion-critical content and the product in frame throughout the selected
range. Validate both directions and the first/last frames.

## 6. Encoding and posters

Use `scripts/encode.sh` for dense-GOP H.264 encodes. It strips audio and enables
fast start. Dense keyframes trade bytes for responsive random seeking; profile
real clips rather than claiming a fixed size or guaranteed smoothness.

```bash
bash <skill>/scripts/encode.sh masters/hero.mp4 assets/hero.mp4
bash <skill>/scripts/encode.sh masters/hero.mp4 assets/hero-mobile.mp4 mobile
```

Resolve a capable FFmpeg build consistently with the script, using
`SCROLLCRAFT_FFMPEG` when necessary. Validate the actual filters/encoders needed,
not just the number of filters installed. Keep `ffprobe` available too.

Extract posters from the **final encoded** clip, not from an independently
generated lookalike or its unencoded master. The poster should match the first
frame the browser will present. Keep it visible if decoding or loading fails.

```bash
ffmpeg -i assets/hero.mp4 -frames:v 1 assets/hero-poster.webp
```

Use the resolved FFmpeg executable in place of bare `ffmpeg` where PATH has a
stripped build. Check output size, dimensions, duration, codec, pixel format and
absence of audio. Record hashes in the build manifest when freezing a revision.

## 7. Mobile media

Choose deliberately:
1. A composition whose focal content survives both desktop and portrait crop.
2. A native portrait render or approved crop with a matching portrait poster.
3. An explicitly approved still-based mobile treatment.

A landscape encode labeled “mobile” is not automatically portrait. The existing
mobile encoding preset reduces resolution/GOP; inspect its output ratio.
For a portrait master, use a portrait-specific encode or crop with the focal
point checked first. Never crop away essential product details just to fill
the screen.

Use `data-sc-src-mobile` and a matching `<picture>` poster:
```html
<picture>
  <source media="(max-width: 860px)" srcset="assets/hero-portrait.webp">
  <img class="sc-stage__poster" src="assets/hero-landscape.webp" alt="">
</picture>
<video data-sc-scrub data-sc-src="assets/hero.mp4"
       data-sc-src-mobile="assets/hero-portrait.mp4" muted playsinline></video>
```

Reduced motion and a low-bandwidth fallback must preserve the message and
actions. A poster-only test does not prove a throttled video path works.

## 8. Chains and recovery

`scripts/chain.sh` implements the anchor method, not every camera architecture.
Prepare numbered PNG anchors (`chain/anchor01.png`, `anchor02.png`, …) and one
prompt per leg (`chain/leg01.txt`, …). Leg 1 connects anchors 1 and 2. Quote the
exact range before authorizing work:

```bash
bash <skill>/scripts/chain.sh <build> --from 1 --to 2 \
  --provider fal --model <verified-endpoint> --frame-mode head-tail \
  --unit-cost <current-USD-estimate> --price-source '<source, date, parameters>'
```

A quote calls no generator and writes no files. It reports the selected new-leg
estimate separately from reservations for **all** previous attempts. Prices are
caller-supplied, not live-verified. The bundled adapter supports only the
documented fal five-second `image_url`/`end_image_url` body; verify an endpoint's
current contract before using it. `--draft` uses head-only semantics and cannot
certify a locked tail.

To execute, add `--go --approve-leg 1 --approval-ref '<actual user approval>'
--max-cost <approved-total-USD>`. Supply explicit provider, model, unit estimate,
and price attribution even when using a known model. **One invocation submits
at most one paid leg.** A flag or self-written approval reference is not user
consent. All selected inputs are validated before submission. The ceiling
includes prior attempts, rejected work, and the selected new-leg estimate.

Each attempt has a durable journal under
`chain/.scroll-forge-attempts/leg01-attempt01.json`. The reservation is recorded
before submission; interruption or an ambiguous response blocks further paid
work until reconciled. Keep the journals, originals, and rejected candidates.
Do not delete state to reset the budget or silently overwrite a good encode.

Use the following controls only for their documented state, keeping the target
inside `--from`/`--to` when selecting a range:

| Situation | Action; no implicit additional spending |
|---|---|
| Confirmed result, interrupted local encode | `--resume-leg N` resumes local processing without another request |
| Submitted/uncertain request with a recovered result | Audit/rejoin through the provider, then `--recover-leg N --source <video> --recovery-ref '<reconciliation evidence>'` |
| Soft seam accepted after inspection | `--accept-soft-leg N --review-ref '<visual review evidence>'` |
| Known rejected/soft result needs a new attempt | Requote with `--reroll --approve-leg N`; execution also requires `--go`, a fresh actual approval reference, and a sufficient total ceiling |

An uncertain request cannot be rerolled. A stale `.lock` requires confirming no
chain process is active before removing **only that lock**; preserve journals.
If the provider cannot recover/reconcile the request, report the uncertainty
and stop rather than guessing whether it was billed.

`framelock.sh` compares the exact first or last decoded frame: exit `0` means
PSNR at least 30 dB (including identical-frame `inf`), `2` means a soft 20–30 dB
result requiring review, and `1` means an invalid comparison or a result below
20 dB. The chain checks both ends of both desktop/mobile encodes in head-tail
mode and stops before another paid leg on a failed or unreviewed seam. Head-only
drafts check only the head. These are diagnostic thresholds, not perceptual
guarantees; an invalid seam cannot be overridden using soft acceptance.

A seam metric is a diagnostic, not proof of composition or camera velocity.
Check both neighboring encoded boundary frames visually, forward and backward.
Soft or failed comparisons require a deliberate decision before more spending.
Keep attempts and rejected outputs traceable; never hide their cost.

Run [verification](verify.md) on the actual served build and disclose any
unverified phone behavior, source limitations or deviations from the approved plan.
