# scroll-design-forge changelog

## 5.0.0 — 2026-11-22: merged scroll-craft; audited by Codex, Antigravity and Claude

**Process.** Codex audited both skills (file:line evidence, engine + script diff). Antigravity rebutted it.
Claude wrote a synthesis; Codex accepted it with five changes; Antigravity's second run added amplitude,
self-critique and positive craft rules.

**Owner decisions.** Bans split into tiers (Tier A hard, Tier B thesis-justified, listed exceptions). Gates: G1 Brief
& truth, G2 two rendered directions, GP risk & spend (triggered, never auto for new spend), G3 ship sign-off on the
final package (never auto). Delegation may auto-pass G1/G2 only.

**Skill text**
- SKILL.md rewritten (326 lines): 7-step workflow, first-frame standard, truth inventory, one motion identity and one
  useful signature move, no fixed persona in generation prompts, verify after integration, self-critique before gates,
  studio-brain vs project memory, Stitch demoted to an optional adapter.
- New `hero-depth.md` and `approved-collection.md` (from scroll-craft): layer contract, clean plates, alpha cutouts,
  contact anchors, atomic readiness, rendering-method choice, measured scrub-media choice, useful state-carrying
  interactions, phone art direction at 390 and 360, final-package functional evidence. Craft quotas, the 4-of-6
  fingerprint gate, the act-count band and historical pricing were not carried over.
- `anti-slop.md`: tiers + exceptions; centered H1 and in-section rails are creative defaults; content realism can no
  longer suggest invented names or numbers on a shipping page.
- `motion-and-interaction.md`: reveal snippet hides content only after its controller attaches.
- `integration-nextjs.md`: code-native first, no Stitch IDs required, one budget source.
- `discovery-framework.md`: Experience section gains thesis, authorship, truth inventory, feeling curve + peak, first
  frame, Tier B justification, signature move + motion identity. `intelligence.md`: studio vs client memory scope.
  `register-guide.md`: multi-offer studio section.

**Scripts and engine (Codex)**
- `shoot.mjs` works on plain HTML/GSAP pages (engine readiness only awaited when the engine is used; generic text
  inventory); touch phone contexts (isMobile, hasTouch, DPR 2) below 768px; `FONT_FALLBACK` from real FontFace status;
  `SEQUENCE_STALLED` from requested-vs-drawn frame evidence; `MOTION_TIMID` diagnostic; opt-in `--visual-capture`
  pointer-lock guard.
- `serve.mjs --lan` ported with Forge's containment; Windows Edge x86 and per-user Chrome paths in dependencies.
- Engine: sequence frame evidence; WebM decoder priming fix. Contrast sampling uses whole interior pixels.

**Validation:** 51/51 before; **79/79 after, two consecutive runs** (Claude ran them; Codex's sandbox could not start
Chrome). Every file SKILL.md names resolves (`slop-ledger.md` lives in the studio brain by design).

**Follow-ups not done:** tested `engine/primitives/` snippets; Kie.ai provider port (deferred: generation stays
capability-based through the attempt journal); depth-map (2.5D) pipeline.

## 4.0.0 — 2026-11-18: merged design-forge 3.1.0 + scroll-forge

One skill for every website, from a quiet landing page to a scrubbed-video camera journey.

**Decisions (made by the owner at merge time)**
- Name: `scroll-design-forge`. Old skills archived to an archive folder.
- Gates scale by route: Create-full runs every gate; Create-lite 0→2→4→5; Refine 2→5; Repair is reproduce → regression check → fix → verify; Review is read-only.
- Anti-slop bans are **hard** (rule-priority tier 1). scroll-forge's "creative defaults, not bans" now covers every *other* style rule only.

**What changed**
- Rule priority (from scroll-forge) now sits above design-forge's pipeline and settles their contradictions. The new rows in `anti-slop.md` §7 record each settlement: bans vs defaults, motion stack, `count` vs the hero-metric ban, and the retired advice to use a warm off-white body.
- Gates 2–5 review rendered evidence. Gate 5 requires a `shoot.mjs` PASS (or user-accepted INCOMPLETE items) at desktop, mobile and reduced-motion; design-forge's gates previously could pass on descriptions.
- New **Gate P (Prove + spend approval)**. It is triggered by need, not by route: any route that adds a risky scroll device or needs any paid generation must prototype it and get spend approved (recorded in build.json) before building. An independent critic review caught that Refine and Create-lite originally had no spend gate.
- Discovery is in one place. `brief.md` went into `discovery-framework.md`: gather-first, repair and review need no discovery, the continuous-world camera decision, and cost authority. The contract gained an **Experience** section, which replaces BRIEF.md.
- Motion stack decision: native CSS scroll-driven animation, then GSAP + Lenis (framework), then the ScrollCraft engine (standalone). Never two scroll drivers on one element.
- One performance budget table (`performance-and-craft.md` §1) now includes the scroll/media rows that were in `taste.md`.
- `site-design.md` was removed. Its discovery, directions, system and component content duplicated design-forge, and its trend advice (warm off-white bodies, uppercase eyebrows, mesh glow) broke the hard bans.
- `site-craft.md` was reduced to `modern-css.md` (the unique native-CSS techniques). Its principles, anti-patterns and third set of performance targets were removed as duplicates or conflicts.
- `taste.md` now defers to the hard bans. `sibling-skills.md` lists the retired skills and generation siblings. `state-layout.md` documents `builds/` next to `.scroll-design-forge/`.
- State directories were renamed from `.design-forge/` and `~/.design-forge/` to `.scroll-design-forge/` and `~/.scroll-design-forge/`. Neither old directory existed on this machine, so nothing needed migrating.

**Deliberately unchanged (runtime contracts):** the `ScrollCraft` / `sc` / `data-sc-*` engine API, the `SCROLLFORGE_*` environment variables, the `scroll-forge-build-id` / `scroll-forge-revision` meta tags and headers, and `.scroll-forge-attempts/`. Pages already built and the test suite depend on them.

**Validation:** scroll-forge suite, 51/51 passing before and after the merge (runtime, harness, generation), with `SCROLLFORGE_PLAYWRIGHT_ROOT` set to an existing playwright-core. Every reference path named in SKILL.md resolves.

---

# History: design-forge (up to 3.1.0)


### 3.1.0 — 2026-07-16

Audit-driven correctness + capability release (three independent critic audits: coherence, execution reliability, capability gaps).

### Fixed — the skill no longer contradicts itself
- Old reference files taught patterns the anti-slop layer bans: gradient-text recipe (color-and-light), 3-equal-cards icon row and centered cinematic hero (component-patterns), "Jane Doe / Acme / 99.9%" example data, raw `z-index: 9999` snippets (color-and-light, design-system-architecture), unqualified oversized "01" glyphs (layout-and-spatial). All rewritten or register/dial-gated.
- Numeric drift unified: LCP ≤ 2.0s and CLS ≤ 0.05 everywhere; display clamp 6rem product / 8rem brand-statement (register-gated, anti-slop §5); stagger 50–100ms; 65ch default line length.
- Contract path unified: canonical template (with version frontmatter) lives in discovery-framework §6; always `contract/v{N}.md` + `current.md` pointer — never a flat `contract.md`, never in-place edits of `current.md`. SKILL.md and quickstart aligned.
- metrics.json schema aligned across metrics-and-retro, state-layout, and intelligence: 14 fields incl. `reject_reason` (taxonomy code), `reject_detail`, `prediction`, `prediction_hit`. LEARN step now closes the prediction loop (step 0), making prediction accuracy measurable.
- Validator prompt renumbered; saturation watch added as FLAG-level check 7 / prompt item 12.

### Added — execution reliability
- **Capability Report** beside Engine Detection: probes renderer and WebSearch alongside Stitch; describe-only gate fallback (pipeline never stalls at Gate 2 without a renderer); Stage 1 research degradation path (reference library → discovery references → logged skip); trend-refresh failure stamping.
- Code-native validator instruction: scan source for ban signatures (`bg-clip-text bg-gradient-*`, accent stripes, 9999 literals, `h-screen`, banned placeholder strings).
- Batch-mode concurrency rule: subagents never write `~/.design-forge/`; they return `learn_observations` for serial application by the main agent.
- Recovery playbook: anti-slop BLOCK loops, code-native validation loops, trend-refresh failure, global-brain file corruption.
- Context budget: intelligence.md loads once per session; per-gate LEARN is an inline SKILL.md checklist (~21K tokens saved per screen).
- Gate free-text rule: classify to nearest option + extract feedback into the contract.
- Quickstart rewritten to the current pipeline (capability report, dials, lane, LEARN, versioning, retro/).
- state-layout: `retro/` in tree + bootstrap; lifecycle rows for LEARN writes, brain bootstrap, retros.

### Added — capability (from the gap audit vs impeccable)
- `references/hardening.md` — empty/error/loading state taxonomy, i18n expansion + RTL, extreme-input matrix (Stage 4).
- `references/ux-copy.md` — microcopy standards: button formula, error templates, empty-state copy, voice/tone by moment (Stage 4).
- `references/register-guide.md` — brand vs product rulebooks: type, color, motion budgets, state vocabulary, per-register bans (Stage 2).
- Gate 4 UX sub-rubric (heuristic + cognitive-load + persona spot-checks) under the Usability weight.
- Gate 5 ship checks: OG card, favicon, meta description, a11y mini-audit (keyboard walk, SR announcements, tinted-bg contrast).
- Sibling baton-passes: `/impeccable document` (brownfield DESIGN.md extraction), `/impeccable live` (element-level browser iteration), `/impeccable onboard` (product empty states/first-run), `/impeccable clarify` (deep copy pass).
- LICENSE file (MIT), `version:` frontmatter, this changelog.

### 3.0.0 — 2026-07-15
- Anti-slop enforcement layer (`anti-slop.md`): 12 BLOCK-level bans, taste dials, category-reflex check, color commitment axis, content realism — extracted from `impeccable` + `design-taste-frontend-v1`.
- 2026 Awwwards layer (`awwwards-2026.md`): web-researched principles, aesthetic lanes, saturation watch.
- Intelligence & self-learning layer (`intelligence.md`): situation reports, reject taxonomy, confidence ladder, predictive priors, dial calibration, prompt playbook, slop ledger with user-gated self-amendment.
- Engine detection with full code-native fallback (Codex support).

### 2.1.0 — earlier
- 10 new references (validator, recovery, state layout, SITE schema, research playbook, Next.js integration, batch mode, metrics/retro, sibling skills, quickstart); contract versioning; numeric Gate 2 scoring; dry-run mode; GSD integration.

### 2.0.0
- Stitch MCP replaces SuperDesign; Discovery + Design System stages; Design Contract; GSAP migration.

### 1.0.0
- Initial release.

---

# History: scroll-forge (incl. website-design-veteran)


### 2026-11-15: merged website-design-veteran

- Widened scope from scroll-driven pages to all website design. Added a site
  route (no scroll engine required) next to the scroll-experience path.
- Moved the veteran content in as references/site-design.md (philosophy,
  discovery, direction, design system, components) and references/site-craft.md
  (modern CSS, principles, anti-patterns, implementation, example, sources).
  Its bans and trend lists now count as creative defaults under rule priority.
- Archived the old skill and command files to an archive folder.

### 2026-09-04: scoped workflow, resilient runtime and evidence-based gates

- Replaced the fixed interview, novelty quotas and blanket aesthetic bans with
  create/refine/repair/review routes, missing-only questions, conditional
  technical contracts and subject-specific creative choices.
- Added lightweight concept/prototype gates, build identity and approval
  records, independent-review guidance and ten response-only regression briefs.
- Made capability and cost guidance depend on discovered tools and current
  provider contracts; removed refusal-bypass advice and historical pricing or
  harness limitations presented as universal facts.
- Restored readable static/no-JavaScript content, keyboard timeline navigation,
  failed-video posters, responsive copy, bounded image-sequence loading, and a
  scoped mount/destroy lifecycle. Added real-browser regression fixtures.
- Bound verification to the expected build/revision, inventoried hidden cues,
  measured rendered visibility and text rectangles, and introduced explicit
  PASS/FAIL/INCOMPLETE reports with nonzero failed/incomplete exits.
- Rebuilt chain execution around one explicitly approved video attempt,
  preflight, total estimated-cost reservations, durable attempt history and
  local-only recovery. Failed seams stop further spending. Encodes refuse
  overwrite; frame-lock checks use the exact last decoded frame.
- Added browser and offline synthetic-media tests. No paid provider request is
  needed by these suites. Desktop browser tests do not certify physical iOS,
  comprehensive accessibility, human emotion or conversion outcomes.

Independent validation: **51 tests passed, 0 failed, 0 skipped** across runtime,
harness and offline generation. The real-H.264 worldflight integration and
forced video-readiness race both passed three additional repeat runs. Skill
metadata validation, script syntax checks and maintained Markdown links passed.
No live paid-provider integration or physical-phone certification was performed.

#### Historical entries

The entries below preserve past observations and decisions, including claims
and instructions superseded by the revision above. They are **not current
operating guidance**. Follow `SKILL.md` and its maintained references for
capabilities, pricing, authorization, installation and creative constraints.

### 2026-09-04: installed for Codex; Codex builds use Codex's own image generation

`references/codex.md` is the harness fork. On Codex the interview, grammars,
fingerprint gate, feeling curve, device kit, taste floor, engine and markup
contract are unchanged; only the asset lane moves. SKILL.md forks at Bootstrap
step 0 and again at the top of Step 3.

**Assets come from Codex's built-in `image_gen`**, billed to the ChatGPT
subscription — no API key, no per-call USD, no cost gate, no ledger. codex.md
defers to Codex's first-party `imagegen` system skill
(`$CODEX_HOME/skills/.system/imagegen/`) as the authority on how to drive the
tool, rather than re-deriving it, and adds only what scroll-forge needs on top:
the byte-identical style preamble mapped onto imagegen's labeled prompt schema,
naming where the empty space goes because copy sits on these images, and passing
the real brand object as a reference.

Verified live: one still generated from a scroll-forge world preamble came back
on brief — warm key from frame left, deep charcoal and warm amber grade,
negative space in the upper left third for a headline, no text.

**The honest constraint: Codex has no video generation.** That closes `scrub`
acts and the whole worldflight mode, and with them the filmic one-shot and
continuous-world grammars. Nine of the ten device families and six of the eight
grammars build completely. codex.md §4 gives the three routes when a brief needs
a moving camera — the client's own footage, clips generated on the `/generate`
lane elsewhere, or scoring the page without `scrub` — and a hard rule now
forbids quietly shipping a still where the score called for a clip.

**Measured, not assumed:** built-in `image_gen` returns near-ratio sizes topping
out around 1.7k on the long edge (16:9 → 1672x941, 3:2 → 1536x1024, 4:3 →
1448x1086, 1:1 → 1254x1254). Fine for posters and 1080p full-bleed; slightly
soft for a full-bleed hero at 2560px, which is a lane decision to put to the
user rather than to make silently.

**Two install findings, both measured here:**

- **Codex does not pick up symlinked skills.** 0 of 12 symlinked entries in
  `~/.codex/skills` were surfaced; only real directories were. Installed as a
  real directory via `cp -RL`, which makes the Codex copy a snapshot — codex.md
  §0 carries the two-line resync, and it has to be re-run after any change or
  the harnesses drift.
- **A skill added mid-session is not surfaced until Codex restarts.** Codex can
  still read and follow it when pointed at it; it just will not reach for it on
  its own. Verified: Codex read the installed skill and answered correctly on
  the interview length, the image lane, the video gap and the two closed device
  families — while reporting it had found it on disk rather than in its list.

**Frontmatter:** dropped `allowed-tools` (a Claude-specific key that only
widened permissions by its absence, and one fewer harness-specific field on a
two-harness skill) and tightened the description from 1285 to 929 characters
with every trigger phrase kept.

### 2026-09-04: merged with `scroll-world`, renamed `scroll-forge`, assets moved to `/generate`

Two skills became one. `scroll-craft` was already the superset — its engine
carries everything `scroll-world`'s did (blob-URL seeking, seek coalescing, iOS
priming, poster-until-painted) plus act mode, ten device families, eight
grammars, the fingerprint gate and a worldflight mode. `scroll-world`'s engine
additionally generated its own DOM from a config object, which is the exact
anti-pattern this skill's engine header names, so it was dropped rather than
merged.

**Taken from scroll-world**, all of it into the continuous-world route:

- The **camera fork** — fly through the world / one continuous walkthrough /
  locked glide — asked as a follow-up to interview question 7 and recorded as
  `CAMERA`. It decides the architecture; Step 3 implements it rather than
  re-deciding it. worldflight.md §6a.
- The **motion-handoff contract**: the verbatim clauses that make every leg end
  in a slow forward drift and begin by continuing it. Position continuity comes
  from the frame handoff; velocity continuity has no other home but the prompt.
  §6c, with the mid-leg move library and the locked-glide clause.
- The connector prompt template and the actual-rendered-frames law. §6b.
- The refusal ladder for content filters. §6e.
- `scripts/knockout.py`, border-connected background knockout for floating
  scenes, documented under the illustrated set in worlds.md.
- The five **illustrated preambles** (clay, papercraft, glossy toy, claymation,
  neon night) — added to worlds.md **behind the existing ban**, as the gated set
  for genuinely illustrated brands, not as alternatives to the photographic
  eight.
- The model qualification idea, now `scripts/framelock.sh`: one probe clip
  proves the endpoint still frame-locks before a chain is paid for.

**Dropped as provider trivia**, roughly 40% of scroll-world's prose: the
Higgsfield CLI, the Monid backend and its sfs upload dance, Codex stills, the
per-model flag tables, credit arithmetic and the NSFW model-swap ladder. None of
it survives the move to `/generate`.

**Assets now route entirely through the `/generate` skill.** `kie.mjs` is
deleted. `/generate` owns model routing, prices, the cost gate, the spend ledger
and output filing; assets.md now owns only what makes an asset *scrubbable*.

- The load-bearing fact: `bytedance/seedance-2.0/image-to-video` takes
  `image_url` **and** `end_image_url`. A clip pinned at both ends can hold a
  seam, which is what makes a worldflight possible at all. Draft-lane Kling pins
  the head only.
- Local frames go in as data URIs — fal takes them inline, so no upload step.
- `scripts/chain.sh` runs the anchor method end to end: quote first, `--go` to
  render, `--draft` to block the moves on Kling at a quarter of the price,
  `--from N` to resume. It encodes and framelocks each leg as it lands.
- **Corrected an inherited claim.** The anchor method was documented as making
  legs render *in parallel*. `/generate` submits one call at a time and gates
  every video, so it cannot. What it actually buys is **independence**: no leg
  depends on another leg's render, a bad one is rerolled in place, and the run
  resumes anywhere. Recoverability, not wall clock.
- Spend accounting in verify.md switched from credit-balance deltas (which
  overlap between concurrent builds and mis-attribute spend) to `/generate`'s
  per-run ledger, plus a note that `gen.sh --audit` catches runs that were
  charged before the log was written.

**Renamed.** The skill is `scroll-forge`; the workspace default is
`<project root>/scrollforge`, with `SCROLLFORGE_HOME` and `.scrollforge.json`.
`SCROLLCRAFT_HOME`, `.scrollcraft.json` and an existing `scrollcraft/` directory
are all still honoured, so a repo built before the merge keeps its fingerprint
registry instead of starting a second empty one beside it. The engine files, the
`sc` CSS tokens, the `data-sc-*` attributes and the `ScrollCraft` global keep
their names: that is the mechanism's name, not the skill's, and churning it
would rewrite every example for nothing.

`doctor.mjs` now checks for `/generate` and a provider key instead of
`KIE_AI_API_KEY`, and `--probe` reads the ledger instead of spending a call on a
balance check.


### 2026-09-01: skill renamed to `scroll-craft` to match the repo

The repo, the skill and the invocation now share one spelling. The skill was
`scrollcraft` (no dash) while the repo was `scroll-craft`, so the two never
matched. The skill directory, its frontmatter `name`, and the invocation are
now `scroll-craft`: invoke it as `/scroll-craft`.

The engine is deliberately left as `scrollcraft`. The files `scrollcraft.js`
and `scrollcraft.css`, the `.scrollcraft.json` workspace config, the
`SCROLLCRAFT_*` environment variables, and the default `scrollcraft` workspace
folder keep their names. Every build already made copies the engine files by
those names and resolves its workspace by that config, so renaming them would
break existing builds and setups for no real gain. The skill is `scroll-craft`;
its engine is `scrollcraft`.

### 2026-09-01: counters tick up on entry; fade-in documented properly

Asked for directly: "numbers tick up when they come into view." The count
device existed only inside pinned acts, scrubbed by act progress, so a stat
row in an ordinary flow section could not count at all. The flow fade-in
existed, but the devices.md example lacked the `data-sc-in` attribute that
makes it fire.

**Engine, `engine/scrollcraft.js`**

- A `[data-sc-count]` outside any `data-sc-act` now ticks once on entry
  (IntersectionObserver at half visibility, fires once) from the first value
  to the second over `data-sc-count-ms` (default 1400ms), cubic ease-out, same
  `formatNum` rules as the act counter. Reduced motion writes the final value.
  Act counters are unchanged.

**Docs**

- `references/devices.md` §7 gains "Numbers that tick up when they come into
  view", with the pairing rule (counter inside a `data-sc-in` stack).
- §8 example fixed to carry `data-sc-in`, plus "What a premium fade-in is made
  of".

### 2026-09-01: layered scenes documented under `parallax`

Driven by a live homepage rebuilt on a reference site's layered hero. Three
cut-out planes plus the product, rates measured from the reference DOM (far
lags 31%, mid 17%, product 20%, foreground and copy at 1x), and four rounds of
fixes that are now rules: planes solid below their silhouette, a shaped
foreground so the product's button survives the scroll, a faded section floor
over the clip line, `max-width: none` on planes, no transform transition on a
parallaxed element, new filenames for replaced art.

**Docs**

- `references/devices.md` §6 gains "Layered scenes: where the premium feel
  actually comes from".
- `SKILL.md` Step 3 lists "Layer the hero" among the things that decide premium
  versus generated.

### 2026-08-23: iOS clip priming hardened; real-device diagnostic added

Driven by a build whose hero clip sat frozen on the owner's actual iPhone
through four rounds of fixes while every headless probe reported it scrubbing.
The working clip further down the same page was the clue; the only difference
between them was being first.

**Engine, `engine/scrollcraft.js`**

- Each clip is primed at `loadedmetadata`, not only on a later gesture. A
  muted inline `play()` needs no activation outside Low Power Mode; where it
  is rejected, gesture listeners retry per clip until every clip is primed.
  (The previous one-shot first-touch prime lost a race: the reader touches to
  scroll while the hero is still downloading, and the shot was spent on a
  sourceless element.)
- `touchend` and `click` joined the prime listeners. The HTML spec's
  activation-triggering events include `touchend` but not `touchstart`, so a
  Low Power Mode phone gets a valid attempt when the finger lifts.
- The priming flag releases on a 2s timer. iOS may leave a `play()` promise
  pending forever, which jammed the retry permanently.
- A seek stuck past 700ms is re-issued. `tick()` skips a clip while
  `el.seeking` is true, so one hung seek froze that clip for the life of the
  page through the guard meant to protect it.
- The poster reveal fires on a 2.5s timeout as well as on `seeked`, so a clip
  whose `seeked` never arrives cannot stay invisible forever.
- `muted` and `playsInline` are set as properties at load time, not only as
  attributes; iOS treats the two differently.

**Docs and references**

- `references/verify.md`: new sections "The phone is a different machine"
  (what headless cannot see, what the engine now handles on iOS), "Ship the
  diagnostic with the site", and "Ask what differs before asking what's
  broken", plus three failure-table rows. Mobile named a first-class target.
- `references/device-diag.html`: standalone real-device scrub diagnostic.
  Suspect clip loaded two ways beside a known-good clip, MOVING / FROZEN
  verdict per pane, prime results and distinct-frame counts on screen. Edit
  its TESTS array and deploy beside the site on the first mobile report.
- `SKILL.md` Step 5 now states the real-device gap explicitly.

### 2026-08-22: bespoke fixed-stage verification state

Driven by the owner's cold-scroll finding on PHASE: "Nothing happens when I
start scrolling. Like literally nothing's happening in the first couple of
scenes." The first pass had passed mechanically because the experience used
`flow` sections as invisible scroll markers around a page-local fixed stage.
Ordinary flow is deliberately excluded from dead-scroll detection, so the
harness never inspected the stage's visible timeline.

**Harness: `scripts/shoot.mjs`**

- Reads optional `data-sc-verify-state` signatures from bespoke fixed stages
  and includes them in the dead-scroll signature.
- Flow spans carrying a custom state are now checked like pinned spans.
- Reads `data-sc-verify-hold="true"` as an explicit authored hold, including
  resolved closes and deliberately stable reduced-motion frames.
- The contract requires rendered values, not raw scroll progress, so a page
  cannot make a static composition pass by publishing a changing percentage.

**Docs**

- `references/verify.md` documents the custom-state contract, the authored-hold
  escape hatch, the reduced-motion rule, and the failure mode.

**PHASE correction**

- Opening act now moves the split, product scale and position, headline, and
  metadata from the first wheel gestures.
- The frustration act now transfers dominance from the burn state to the
  forgotten state while the seam crosses the cup.
- Act progress no longer clamps early; the close reaches a true 0% divider.
- Dense six-samples-per-act sheets replaced the earlier coarse pass.

### 2026-08-21: worldflight mode and the global smoothed playhead

Driven by the owner's verdict on the act-based continuous world: "awful... you're
literally going from scrolling down to static page and then you start scrolling
down again... weird clear page lines scrolling up... very cheap looking."
Mechanics ported from oso95/scroll-world.

**Engine: `engine/scrollcraft.js`**

- New page mode `data-sc-mode="worldflight"`: one `position: fixed` stage, an
  empty spacer as the only element in document flow, legs mounted for the life
  of the page, and scroll driving only the film timeline and overlay opacity.
- Spacer height is (sum of `data-sc-w` + 1) viewport-heights, set in pixels so
  the track and the `svh`-sized stage share a ruler.
- One-sided crossfade over a `data-sc-seam` band (default 0.12vh): the incoming
  leg fades up while the outgoing one holds opaque underneath, so the page
  ground never shows through a seam. z-index 120 for the current leg, 100 +
  opacity × 10 for the rest. No `src` swapping, ever.
- Per-leg `data-sc-linger`, a monotone dwell remap capped at 0.6 with fixed
  endpoints, so seam frames are never touched.
- Copy windows against the whole track: `hero`, `finale`, or a `from to` pair
  with a plateau. Only transform is `translateY`, capped at 4vh across a window.
  Pointer events gated above opacity 0.5.
- Legs prefetch within ±1.6vh; until a real frame paints, the poster carries a
  push-in (`scale(1.03 + local × 0.14)`).
- Waypoints published as `--sc-seg` / `--sc-segp` plus a bubbling `sc:waypoint`
  event. The engine renders no rail UI.
- Reduced motion: no clip is ever fetched, posters cross-dissolve through the
  same seams and windows, all transforms dropped.
- **Playhead retrofit, all scrub clips everywhere.** Every clip now lives in one
  `playheads` list walked by one rAF loop: lerp 0.18 per frame (`data-sc-lerp`,
  clamped 0.02 to 1, 1.0 under reduced motion), 8ms/20ms deadband, seek coalescing,
  offscreen clips skipped within 0.002. Replaces the act-only 0.16 loop. Act
  behaviour is otherwise untouched.
- iOS priming: one muted play-pause across every clip on the first touch or
  pointer down, so a seeked-but-never-played clip is not left blank.
- `ScrollCraft.instances` collects mount handles, so the harness can ask whether
  the playhead has arrived instead of guessing with a timeout.
- Warns when a worldflight stage does not compute `position: fixed`, the same
  silent failure as an unpinned act one level worse.
- Synced byte-identical to all eight build folders and `cmp`-verified.

**Engine: `engine/scrollcraft.css`**

- `.sc-world`, `.sc-world__seg`, `.sc-world__poster`, `.sc-world__copy`,
  `.sc-world__scrim`, `.sc-world__spacer`, and `[data-sc-copy]` pre-paint state.
- `video[data-sc-scrub].sc-has-clip` lights a leg's clip, since a worldflight
  clip has no ancestor act to light it through.
- Reduced motion drops the poster push-in and the copy drift.

**Harness: `scripts/shoot.mjs`**

- Detects `[data-sc-mode="worldflight"]` and switches sampling to the track:
  per-leg fractions at the same density as per-act, plus four positions across
  every seam.
- `settle()` now waits for the playhead to ARRIVE (|cur - target| < 0.002 and not
  seeking) via `ScrollCraft.instances`, falling back to the old currentTime-goes-
  quiet method. Without this every worldflight frame is shot mid-lerp and no run
  is repeatable.
- Dead scroll for worldflight is no leg advancing `currentTime`, no crossfade
  progress, and no copy-window opacity change across a gap of 0.12vh. Skipped
  under reduced motion, where each leg holds one still frame by design.
- New findings: legs that never reach full opacity, and legs stuck on poster
  (suppressed under reduced motion).
- Cue and contrast passes now cover `[data-sc-copy]` alongside `[data-sc-cue]`.
- The fixed-chrome hide before the contrast shot skips anything inside
  `[data-sc-world]` or `[data-sc-world-copy]`: that stage IS the background
  behind every line and that layer carries the scrim, so hiding them graded the
  copy against the page ground and failed a page that looks fine.

**Docs**

- New `references/worldflight.md`: the mode, its attributes, the track maths,
  the one-sided seam, the copy-window contract, the waypoint contract, the seam
  law for assets (chain on start images only; connector frames via
  `ffmpeg -sseof -0.15` from the ENCODED mp4), GOP 8 / GOP 4, the ±1.6vh
  prefetch window, and a hard-rules table.
- `references/uniqueness.md` §2.4: the continuous-world grammar now REQUIRES
  worldflight mode, and says why, quoting the verdict on the act-based attempt.
- `references/devices.md` §1: new "The playhead is lerped" section covering the
  0.18 rate, the deadband, seek coalescing and `data-sc-lerp`.

**Verification**

- New rig at a local `lab/worldflight-rig/` (3 descent legs,
  hero/mid/finale copy, page-drawn route rail) on port 4520, with
  `lab/worldflight-assert.mjs`: 24/24 assertions pass.
- `shoot.mjs` green on the rig desktop and reduced motion; no dead scroll, all
  three legs reach full opacity and paint a real frame, all copy clears 4.5:1.
- Regression on four act builds (coffee-can 4500, personal-brand 4501, console-saas 4504,
  maison 4507): all green, frame counts and poster counts identical to the
  pre-change baselines, zero console errors, zero weak cues.

### 2026-08-21: consolidation after the showcase trio (descent, airfield, maison)

**Engine: `engine/scrollcraft.js`**

- `focusin` now centres a focused control that sits inside a `[data-sc-act]` when
  its own cue computes under 0.85, with `behavior: 'instant'` because
  `scrollcraft.css` sets `scroll-behavior: smooth` and the default animated a
  multi-screen glide with focus off screen throughout. Promoted from airfield's
  page-local handler and guarded to the act stack. Verified: fixes the `flow`
  case; does **not** fix a pinned act, where the sticky stage means centring
  scrolls backwards out of the act and leaves the cue dark. That residue is
  documented in `verify.md` rather than fixed, because the correct scroll target
  needs an inverse of `dwell()`. (airfield, with the limit measured on descent's
  reported case)
- Synced byte-identical to all eight build folders.

**Harness: `scripts/shoot.mjs`**

- Null guard on the clip's owning act: `(v.closest("[data-sc-act]") ?? v)`. A
  `video[data-sc-scrub]` outside the act stack, which is the legitimate shape for
  a continuous world, threw a `TypeError` and took the whole run down before it
  wrote anything. Confirmed the old expression throws and the new one returns a
  boolean. (descent)

**Encoding: `scripts/encode.sh`**

- CRF is now overridable: fourth positional argument, or `SCROLLCRAFT_CRF`,
  positional winning. Defaults unchanged at 20 desktop / 24 mobile, and the
  echoed summary reports the value used. `assets.md` recommends 22-23 for
  grain-heavy worlds, which previously meant not using the script. (descent)

**Docs: `references/devices.md`**

- §2 `pin`: minimum useful span is ~1.2. At span ≤ 1 a pinned act has one pixel
  of travel, so progress jumps 0 to 1 and every cue and reveal inside it snaps.
  (maison)
- §4 `reveal`: `clip-path` is relative to the border box, so a reveal on type
  with `line-height` below 1 eats the ascenders and descenders and renders a
  figure as a plain bar. Give it room or wrap it. (maison)
- §10 `drift`: documented the scoping rule. Drift belongs to the first act whose
  progress is strictly between 0 and 1, so on a page of short acts several
  qualify at once and the ground lags a full section. Paint grounds per section
  instead, which is what a cutlist or chaptered page wants anyway. (airfield,
  with maison's §2.2 conflict resolved the same way)

**Docs: `references/taste.md`**

- Colour: redefining `--sc-ink` on a subtree does not re-ink text whose `color`
  already computed on `<body>`. Restate `color` on the subtree. (airfield)
- Colour: the "lock the accent" rule gains its exception. A page that hard-cuts
  between light and dark grounds may carry a two-stop accent, one hue at two
  lightnesses keyed to the ground. Still one accent per ground. (maison)
- Text over media: `width`/`height` HTML attributes are presentational hints and
  come in pairs. Overriding only one in CSS lets the other resolve to the
  attribute's pixel value. The reference template ships both, so this is a trap
  the template hands to every build. (maison)

**Docs: `references/uniqueness.md`**

- §2.8 rhythmic cutlist: named the peak collision. The grammar bans `pin` and
  `dwell` while feel.md demands the peak hold. Resolution is to hold in the fixed
  chrome layer and keep every act short and unpinned, generalised to "move the
  peak out of the act stack rather than breaking the grammar". (airfield)

**Docs: `references/verify.md`**

- Cue fade-outs should land between harness sample positions, or the sheet shows
  half-faded type that nothing grades. Fix `rampOut`, not the sampling. (descent)
- Keyboard section rewritten to say exactly what the engine's `focusin` handler
  covers and what it does not, with the pinned-act measurement.
- Six new rows in the failure table for the findings above.
- Credit accounting: per-call sums overstate real spend, same reason the probe
  delta overstates in the other direction.

**Docs: `references/assets.md`**

- seedream's aspect ratios: `16:9`, `9:16` and `3:4` verified working, `4:5`
  rejected with an error that does not list the alternatives. Returned pixel
  dimensions are near the ratio, not exact. (maison)
- Unit costs reframed as published planning rates. Two ledger reconciliations put
  actual debits at roughly 0.4x the per-call sum (1447 vs 530, 2252 vs 856), so
  every budget cap in the skill is conservative and a per-call sum must not be
  reported as measured spend. (orchestrator's ledger reconciliation)

**Verification**

Desktop and reduced-motion harness passes re-run on descent (4505), airfield
(4506) and maison (4507) after the engine sync. All six green: no dead scroll,
all cues clear 4.5:1 at their worst frame, no console errors, no failed
requests, and every clip reports `poster` under reduced motion.

### 2026-08-21: triage of three parallel builds (personal-brand, agency, saas)

**Engine: `engine/scrollcraft.js`**

- `data-sc-count` strips thousands separators before parsing, so a target can be
  written the way it should render (`"0 3,500"`). Previously any real figure
  between 1,000 and 9,999 was unrenderable. (personal-brand, merged from its local patch)

**Engine: `engine/scrollcraft.css`**

- Reduced motion no longer zeroes a `pan` rail into missing content. The stage
  becomes a native `overflow-x: auto` scroll region with proximity snapping, so
  every item stays reachable without motion. (agency and personal-brand both hit it;
  coffee-can and saas both had the hole)
- `.sc-scrim--trail` switches to a bottom band below 860px, where `.sc-copy--trail`
  re-anchors left and spans the full width. It was darkening the corner the copy
  had just left, which guaranteed a mobile contrast failure over any bright clip.
  (saas)
- New `.sc-scrim--band` utility: a bottom band, transparent above 58%, for copy
  that spans the frame. (saas)

**Harness: `scripts/shoot.mjs`**

- Cue opacity reads a kinetic heading through its `.sc-split__i` line units. The
  engine forces the element to 1, so kinetic headlines were reported as peaked on
  frames where every line was at 0. (agency)
- Contrast is direction-aware: the ink is compared to the mean background and
  graded against the darkest patch when it is dark type, the brightest when it is
  light type. A high-key page was being graded against its most lenient possible
  reading. Ported from the working checker personal-brand shipped at
  `lab/min-contrast.mjs`, along with its two corrections: the sampled rect is
  clamped to the viewport, and `position: fixed` chrome is hidden with the text
  because it paints in front of what scrolls under it. (personal-brand)

**Docs**

- `devices.md` §2: only the last act may use a one-value hold cue; a middle act's
  hold stays lit through the un-pin slide and crosses the header. (saas) Plus the
  "ground or greet" rule for any pinned act (agency) and the `"0 1 0 0"` greet-and-hold
  form (agency).
- `devices.md` §3: reduced-motion behaviour of `pan`, and the rail's copy
  constraint (headings are read cropped). (agency, saas)
- `devices.md` §6: `data-sc-parallax` documented in its real unit, hundreds of
  pixels rather than viewport fractions, with usable ranges. (agency)
- `devices.md` §7: `count` is unavailable to concept, fictional and pre-launch
  brands, because every number would be invented. (saas)
- `devices.md` §8: a flow section after a pinned act takes reduced padding. (saas)
- `devices.md` §9 and `references/template.html`: `magnet`, `parallax` and `cue`
  all write `transform` and cannot share an element; `data-sc-rise="0"` is the
  guard. The template taught the collision by example. (personal-brand)
- `assets.md`: a section on real supplied footage (measure with `signalstats`,
  expand levels in the pre-encode intermediate, trim before anyone walks into
  frame, target 24-30fps, never stream-copy). (personal-brand)
- `assets.md`: portrait `<picture>` poster-swap pattern and the hand-written
  ffmpeg portrait/crop recipe, since `encode.sh` has no portrait mode. (agency)
- `assets.md`: grain-heavy worlds run about double the size estimate; measured
  kie.ai unit costs (seedream 5-pro still 28, kling v2-1-pro 5s 160). (agency, saas)
- `worlds.md`: what inverts when the canvas is light (scrim direction, ink over
  media, `--sc-edge`, shadow alphas). (personal-brand) Naming the empty space is now
  stated as a per-shot requirement. (saas)
- `taste.md`: the positive case behind "no full-frame overlay" (corner, band,
  column, and masking the image away from the text), and stepping the hero
  display size down below ~700px. (agency, personal-brand, saas)
- `verify.md`: how the contrast pass now works, its four known limitations,
  checking that reduced motion did not delete content, and the fact that probe
  deltas cannot attribute credit spend when builds run in parallel.

**Deferred, deliberately**

- `kie.mjs probe --since <baseline>` and per-call cost logging. Documented in
  `assets.md` and `verify.md` instead.
- A `portrait` mode for `encode.sh`. The ffmpeg recipe is in `assets.md`.
- Keying harness cue rows by act and element rather than by text, and the 0.85
  opacity gate on the contrast pass. Both are real, neither blocked a build;
  written down in `verify.md` as known limitations.
- Lowering the `--sc-t-4xl` floor. It is a token every build inherits, and the
  fix belongs in a page's own phone media query.

### 2026-08-21, later the same day

- Reduced motion now settles `data-sc-reveal` wipes (`clip-path: none`), the
  same floor the block already applied to parallax, pan and kinetic type. Found
  by the personal-brand build; re-verified green on the three reveal-using builds
  (agency, personal-brand, console-saas).
- `references/uniqueness.md` added: the structure axis. Eight page grammars, a
  mandatory Step 0 interview, a required per-build signature move, and the
  fingerprint gate against the workspace `FINGERPRINTS.md`. Driven by the
  owner's verdict that four builds shared one skeleton.
- Live-surface honesty rule: the labelled-sample-data escape is spelled out
  (console-saas's route to the grammar for a concept product).
- Ground-or-greet extended to any progress-gated content on a pinned act, not
  just engine cues.
- verify.md: two new measured failures (reduced-motion rail snap-centring a
  single wide track; keyboard focus landing off-screen on pinned acts) and the
  note that a shoot.mjs run can take the background server down with it.

### 2026-08-22: the `orrery` build (travel, continuous world)

First run of the skill start-to-finish as a new user would meet it: interview
first, nothing generated until the eight answers existed. Three findings, all
of them things that cost a full iteration to discover.

- **A scrim parented to the copy block is invisible to the contrast pass.**
  `shoot.mjs` hides `[data-sc-copy],[data-sc-copy] *` to photograph the film
  underneath a line, and `visibility: hidden` takes an element's `::before` with
  it. A per-block scrim written as `.copy::before` is therefore never composited
  into the measurement: six blocks reported 1.2-1.9:1 against means of 7-13:1,
  and **strengthening the scrim changed the reported numbers by exactly zero**,
  which is the tell. The identical-numbers-after-a-real-change signature is
  worth knowing on its own. Fix: the scrim must be a **sibling** of the copy
  block. `orrery` mounts one soft plate per block into the copy layer and drives
  its opacity from the block's own inline opacity, so it tracks the engine's
  window for free. Written up in taste.md and verify.md.
- **The worldflight spacer is sized once, inside mount, and a viewport that
  reports height 0 at that moment leaves the page with no scroll track at all.**
  The engine writes `height: 0px`, every mechanical check still passes, and the
  page looks like a frozen still. Seen in an embedded preview pane; a single
  dispatched `resize` corrected it to the exact expected 10.5vh. Page-level fix
  (the engine is not edited): dispatch a resize on `load` and on
  `document.fonts.ready`. That second one also absorbs the reflow when a webfont
  swaps in, which changes every copy block's measured height.
- **`encode.sh` finds a full ffmpeg, but the poster step in `assets.md` calls
  bare `ffmpeg`.** On a machine whose PATH ffmpeg is a stripped build, the
  documented `-frames:v 1 ... poster.webp` fails with "Unable to choose an
  output format", which reads like a filename problem rather than a missing
  muxer. Use the same resolved binary `encode.sh` uses. Also: PSNR seam checks
  need that binary, since the stripped build has no `psnr` filter.

Build notes worth carrying: the owner asked for a "tiny world" that does not
look cheap, which is one word away from the banned clay diorama. Resolving it as
a **handmade physical scale model** shot macro (brass, painted plaster, real
moss, poured resin, sifted sand, visible glue seams) satisfied both, and the
negative list in the preamble did the work. Ten legs chained head-to-tail on
pre-generated anchors rather than sequentially off encoded tails: every joint
came back 28.5-39.8 dB, inside the band `descent` shipped at, and all ten clips
generated **in parallel** instead of in a 45-minute serial chain.

Also confirmed the harness will happily photograph a **different site** if the
port is already occupied by another build's server. `serve.mjs` exits
EADDRINUSE in the background while `shoot.mjs` gets a clean 200 from the
squatter and produces a full, plausible, entirely wrong contact sheet. Check the
served `<title>` before trusting a run.

### Pacing pass, same day (owner note on `orrery`)

> "when you're building fly-through worlds like this, and most of the times when
> you're doing things with scroll, you need to slow it down a bit... it needs to
> feel smoother and consistent."

Two faults hide under "not smooth", and the skill only had guidance for one.

- **Inconsistent pace.** `orrery` shipped its first cut with leg weights from
  0.70 to 0.95vh for identical 5-second clips, a 36% spread in how fast the
  world moved per pixel. Nothing in the skill said to hold `weight / clip
  seconds` constant, so nothing caught it. Now a hard rule in worldflight.md,
  with `orrery` normalised to a 6% spread.
- **Too fast.** The `~1.5vh per 8s` line was being read as a target when it is a
  dead-scroll guardrail. It yields 0.14-0.19vh per second of film, which is
  brisk for a page the reader is steering. worldflight.md §7c now names
  **0.21-0.22vh/s as the floor for a fly-through** and says plainly that
  exceeding the guardrail is fine as long as the harness confirms no dead
  scroll. It did, at both viewport sizes.
- **`data-sc-lerp` 0.18 is the wrong default for this mode.** 0.12 is now the
  documented worldflight value, alongside a wider `data-sc-seam` (~0.16). The
  damping is what removes wheel judder; the weights are what remove the surging.

feel.md §5 gained the exception it was missing: pacing variety is how an act
page carries feeling, and a continuous world is the one grammar where it is
wrong. There the peak carries the shape by being the single long leg.

Also recorded: changing any weight moves every leg boundary, so every
`data-sc-window` must be recomputed and then re-checked against the frame it was
tuned to. `orrery`'s labels were re-verified on screen at Kyoto and Erg Chebbi
after the repace.

---

### Clip time is not cue time (the frozen-clip class)

Reported from a real read of `agency`: "scenes are moving with a
scroll, but then they stop and then the whole site starts to move, so now we're
seeing an image that's still."

A pinned stage is on screen for one viewport **before** its pinned travel starts
and one viewport **after** it ends. Act progress `p` is 0 across the whole entry
slide and 1 across the whole exit slide, so a clip driven by `p` is parked on its
first frame while the stage slides in and on its last frame while it slides out.
The reader scrubs a film, the film stops, and the page then slides a still
photograph past them.

**What changed**

- **The engine now maps clip time across the stage's entire visible life by
  default**, with both ends clamped to scroll that actually exists so a hero at
  document top still starts on frame one and an act near the bottom still reaches
  its last frame. Cues still use `p`, because cues belong to the pin.
  `data-sc-clip-map="travel"` is the opt-out. The old `data-sc-runout` opt-in is
  accepted and ignored: it addressed only the exit half, and it was opt-in, which
  is why three of four builds carrying a scrub act shipped frozen anyway.
- **`shoot.mjs` samples each scrub act's entry and exit slides.** It previously
  sampled pinned acts only at `top + (h - vh) * p`, which never visits either
  slide. That sampling gap is the whole reason this survived four builds of
  verification: the defect lived precisely where the harness never looked.
- **New FROZEN CLIP finding**, graded against stage visibility rather than act
  progress. First/last-frame holds always report; mid-clip holds only report once
  they outlast a plausible `dwell` settle. Skipped under reduced motion.

**Validated, not assumed.** The detector was proven to discriminate before being
trusted: it fires on a clip deliberately opted out with `data-sc-clip-map="travel"`
and stays silent on the clip beside it in the same page.

**Do not pair this with a shorter dwell.** Dwell moves fast at the edges and
settles in the middle, which is exactly the shape the new mapping wants: fast
motion on the two slides, the settle inside the pin where the copy lands.

**Also found, unrelated and pre-existing:** `personal-brand`'s hero paragraph fails
contrast from `y=0` (1.01:1, dark ink over dark foliage in the sky clip). The new
slide sampling surfaced it; the old engine fails it identically, so it is not a
regression from this change.

### 2026-08-22, portability pass (v0.2.0)

The skill assumed one person's repo layout. Five references pointed at
one hardcoded local workspace, so the fingerprint gate and the worked
worldflight rig dead-ended on every other machine. Packaging it as a plugin made
that a real defect rather than a note.

The fix is **not** a second templatised copy of the skill. Two copies drift, and
this one proved it inside a day: five files diverged between the working skill
and its published copy within an hour of the first push. There is one skill, and
it resolves its paths instead of assuming them.

- **`scripts/workspace.mjs`.** Resolves the workspace that holds builds and the
  registry: `SCROLLCRAFT_HOME`, then the nearest `.scrollcraft.json` walking up,
  then `<project root>/scrollcraft`. `--ensure` creates it and seeds an empty
  registry. Builds are `<workspace>/builds/<name>/`, the registry is
  `<workspace>/FINGERPRINTS.md`, and neither is hardcoded anywhere any more.
- **The registry is per-user and starts empty.** The gate exists to stop you
  repeating *yourself*, so a new user's first build has nothing to clear and
  every build after it does. Gating a newcomer against somebody else's twelve
  rows would block them out of grammars they have never used, which is the
  opposite of the point. `templates/FINGERPRINTS.md` is the seed; the author's
  twelve-row table ships separately as `EXAMPLES.md`, explicitly as
  illustration rather than constraint.
- **`scripts/doctor.mjs`.** Preflight, run before the interview. Checks node, a
  full ffmpeg build, playwright, Chrome, the API key and the resolved workspace,
  and separates required failures from optional ones. It exists because the
  three most common setup faults all surface later as misleading errors: a
  stripped ffmpeg reports a missing filter as a syntax error, a missing webp
  muxer reports as a bad filename, and playwright resolves from the wrong
  directory. On the author's machine it correctly picks the 585-filter build
  over the stripped one first on PATH.
- **`scripts/worldflight-assert.mjs` now ships with the skill.** It was
  URL-driven and generic all along, sitting in a lab folder nobody else had.
  Run it against any worldflight page before the contact sheet.
- **The API key is documented as optional in the right place.** Generation costs
  real money; a build from the user's own photos and footage needs no key and no
  spend, and that is now stated as a first-class route in Bootstrap rather than
  implied.

Nothing moved on the author's machine: a two-line `.scrollcraft.json` at the
project root points the workspace at the existing builds folder, so twelve builds and the live registry resolve exactly as before.
