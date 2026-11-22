---
name: scroll-design-forge
description: "The website design machine: award-level sites and scroll-driven experiences from brief to verified build. Routes every request (create, refine, repair, review), runs 3 human gates plus a spend gate, builds code-native with real browser renders, defaults brand heroes to bold dimensional depth (clean plates, alpha cutouts, atomic readiness), enforces tiered anti-slop bans and zero fiction, wires useful interactions into real inquiries, and proves the final package with PASS/FAIL/INCOMPLETE evidence on desktop, touch phone and reduced motion. Includes the ScrollCraft engine (scrub, pin, pan, reveal, kinetic, parallax), scrubbed video and image sequences, continuous camera journeys, budgeted generation, and studio memory. Triggers on: design this, website design, landing page, hero section, page design, redesign, site build, mockup, visual design, design the UI, scroll animation, scrollytelling, scroll experience, parallax, layered or premium hero, cinematic hero, scrubbed video, camera fly-through, Apple-style page, make this page less generic, this looks like a template, review/critique this site's design, or when SITE.md has unchecked pages. Replaces design-forge, scroll-forge, scroll-craft and website-design-veteran. DO NOT trigger on: database/API/schema/prompt/system/infrastructure design, native mobile UI, or anything non-visual."
version: 5.0.0
license: MIT
---

# Scroll-Design-Forge

One pipeline for every website, from a quiet correct landing page to a scrubbed-video camera
journey. Discovery becomes a **creative thesis** and a living **Design Contract**; the build is
code-native and rendered in a real browser; the **final package** is proven before anyone signs off.

Spectacle is never a quota, but timid is a failure: on brand work the owner wants effects that are
**bold and obvious on first view**.

---

## Rule priority

1. **Non-negotiable:** the request and its authorization; **zero fiction** (no invented customers,
   metrics, testimonials, logos, availability, urgency); accessible interactions; working
   navigation; usable no-JS / failed-media / reduced-motion fallbacks; **anti-slop Tier A**
   (`anti-slop.md` §2 — gradient text, AI-purple/neon glow, decorative glass, hero-metric template,
   identical card rows, eyebrow on every section, 01/02/03 scaffolding, side-stripe borders, text
   overflow, emoji as UI). If the user asks for a Tier A pattern: name it, explain the tell, offer
   the closest compliant alternative.
2. **Conditional contracts:** the chosen motion stack, engine mode, media pipeline, spend approval,
   verification procedure; **Tier B** bans (cream/beige body, pure `#000`) unless the thesis
   justifies them in writing.
3. **Creative defaults:** grammar, palette, type, devices, pacing, dials, lane; the dimensional
   brand hero (`hero-depth.md`). Adapt to the subject. Explicit current user instructions beat
   studio defaults and learned priors.

When a default fights comprehension or accessibility, change the default.

---

## 1. Route, register, gates

Classify before doing anything. Mixed requests: name each scope and route each part.

| Route | Scope | Gates | Writes? |
|---|---|---|---|
| **Create — full** | New site/experience or requested redesign | G1 → G2 → (GP) → G3 | Yes |
| **Create — lite** | New screen/section in an existing system (contract + DESIGN.md exist) | G1-lite (≤3 questions) → (GP) → G3 | Yes |
| **Refine** | Improve a page/section; preserve approved content, brand, architecture | G2 only if the change is substantial → (GP) → G3 | Yes |
| **Repair** | Fix motion, a11y, media, responsive | Reproduce → regression check → fix → verify → G3-lite (one line) | Minimal |
| **Review** | Assess only | None | **No.** Not permission to fix, install, generate, deploy or update a registry |

**Register:** *brand* (design is the product: marketing, portfolio, campaign) or *product* (design
serves the product: app UI, dashboard, tool). **Kind:** *site* (no scroll-driven behaviour; skip the
engine and media chain) or *scroll experience*. Start a site as a site; add scroll devices only
where they serve a beat.

| Gate | Human reviews | Auto-pass? |
|---|---|---|
| **G1 Brief & Truth lock** | Creative thesis, register/kind, real content + proof inventory, asset plan, motion appetite, preset/design-system direction, delegation scope | Only with a complete supplied brief + explicit delegation |
| **G2 Directions & score** | 2 structurally different **rendered** directions (desktop 1440 + phone 390) + beat score | Only under explicit creative delegation **and** no paid generation |
| **GP Risk & spend** (triggered, any route) | Prototype of the riskiest moment (desktop, touch phone, reduced motion; seam frames for chains) + spend request (estimate, ceiling, retries, provider) | **Never** for new spend. Reuse a recorded authorization only within its scope and ceiling. Authorize a paid seam probe before generating it |
| **G3 Ship sign-off** | Final-package verdict, contact sheets, functional test of the primary action, disclosed gaps | **Never**. Local work may finish as "verified, awaiting sign-off". Never deploys unless asked |

Delegation ("use your judgment", "get out of my way") skips interviews and G1/G2 waits: write a
brief labelled `Self-authored under explicit creative delegation`, never invent user quotes. It
never skips GP or G3. The user can force more ceremony ("full", "all gates") or less ("just do it" →
Create-lite). A repair never becomes a redesign; a review never becomes a fix.

Gates use **AskUserQuestion** with the listed options. Free-text answers: map to the closest option,
extract every concrete observation into Accumulated Feedback, confirm in one line.

---

## 2. Session start

1. **Memory** (`intelligence.md`, `state-layout.md`): load the **studio brain**
   `~/.scroll-design-forge/` (slop ledger, proven patterns and prompts, environment lessons, opt-in
   studio defaults such as "bold on first view") and **project state** `.scroll-design-forge/`
   (contract, DESIGN.md, SITE.md, metrics). Open with a 3-line SITUATION and one recommended next
   action. Studio defaults show as one line; client aesthetics never cross projects.
2. **Capability probe** — never infer from the harness name:

| Capability | Detect | If absent |
|---|---|---|
| Verification (Playwright, Chrome) | `node <skill>/scripts/doctor.mjs --mode verify` | Point `SCROLLFORGE_PLAYWRIGHT_ROOT` at an existing `playwright-core` (`~/.npm/_npx/*/node_modules/playwright-core`); installing needs approval. Still none → browser-tool screenshots + manual passes; verdict **INCOMPLETE**, never PASS |
| Renderer for gates | Dev server / browser / screenshot tool | Image-gen comp, then describe-only — declared, never default |
| Web search | Tool present | Research from `~/.scroll-design-forge/reference-library.md`, then logged `research: skipped` |
| Generation / encoding | `doctor.mjs --mode generate` / `--mode encode` | Supplied photos and footage still build. Read the provider's current docs for pricing |
| Stitch MCP | Tool present | Not needed. Code-native is the default; Stitch is an optional static-draft adapter (`sibling-skills.md`) |

`doctor.mjs --mode build` and `workspace.mjs` (no `--ensure`) are always safe. Codex and other
harnesses: `codex.md`.

---

## 3. The workflow

### Step 1 — Brief & truth (→ G1)

Load `discovery-framework.md`. **Gather before asking:** the request, existing pages, DESIGN.md,
SITE.md, brand files, supplied assets, the live site if there is one. Ask only consequential
unanswered questions (first project ≤10, existing system ≤5, coherent brief 0). Brownfield UI with no
DESIGN.md → extract it first (`/impeccable document`), then extend.

Write the contract (`discovery-framework.md` §6) with an **Experience** section:
- **Creative thesis** in one sentence, and "It's the site where ___" (an experience, not a device).
- **Truth inventory:** every claim, number, client, quote and logo with its source; unverified →
  removed or asked. Real work, real photographs and real captures are the primary design material.
- Register, kind, route; what to preserve; the visitor's one next action and its single label.
- Feeling curve (one line per beat: emotion → what causes it) and the one **peak**.
- Asset inventory (owned / to shoot / to generate) with rights; motion appetite; camera for continuous worlds.
- Design-system direction (`design-system-architecture.md`): preset as a written direction, three-layer tokens.

Multi-offer studios: one identity carries every discipline; offers read as one practice, not a
freelancer menu (`register-guide.md`).

### Step 2 — Directions & score (→ G2)

Load `anti-slop.md`, `awwwards-2026.md`, `register-guide.md`; `uniqueness.md` for new structure;
`feel.md` for scroll work; `hero-depth.md` + `approved-collection.md` for brand heroes; the craft
references for this screen type. Research (`research-playbook.md`): ~4 references per screen type
with one observed "steal" each, at least one scroll/motion piece for scroll work.

Before building directions: category-reflex check (`anti-slop.md` §3); one aesthetic lane; predictive
priors from the studio brain. Then build **two structurally different directions in code** (hierarchy,
topology, density, media, interaction premise — never palette swaps), each showing the **first frame
at scrollY=0** and one key transition, rendered at 1440×900 and 390×844. No paid assets yet.

Write the **beat score**, only as many beats and devices as the purpose needs:

| Beat / visitor question | Real content or evidence | Intended impression | Device + reason | Static / phone fallback |
|---|---|---|---|---|

Pick the **motion stack** and record it: native CSS scroll-driven for simple reveals → GSAP +
ScrollTrigger + Lenis in framework projects → ScrollCraft engine for standalone builds. Never two
scroll drivers on one element. Name **one motion identity** (a named easing/transition motif reused
site-wide) and **one signature move** that does useful work (its state carries into the inquiry,
export or next step — `approved-collection.md` §5).

**Generation prompts** (any model, any tool) inject the creative thesis, the contract, the score rows
for this screen, the research patterns, the exclusions (hard constraints + Tier A + content realism)
and accumulated feedback. **No fixed persona or house philosophy** ("Swiss", "less is more"): the
thesis decides whether the page is restrained or loud. Validate every output (`contract-validator.md`)
before showing it: BLOCK → regenerate, FLAG → show with callout.

**Self-critique before any gate** (G2 and G3): look at your own renders (1440 opening, mid-scroll,
390 phone) and fix before showing: display-to-body scale contrast (aim ≥5:1 on brand heroes), silhouette
and type legibility, plane-separation amplitude, typographic tension, density alternating between
loud stages and quiet proof, and handoffs between sections (no dead cut after a pinned act). A clean
`shoot.mjs` exit is not taste.

**G2:** rendered screenshots, "all {N} directives met", diagnostic weighted score (Design 40 ·
Usability 30 · Creativity 20 · Content 10 — a diagnostic, never an award claim), why each interaction
belongs to this subject → **PICK A / PICK B / HYBRID (one merge, then mini-check) / NEITHER**.

### Step 3 — Prove & spend (→ GP, triggered)

Runs in any route that adds a risky device or peak (WebGL, chained video, novel interaction, layered
hero needing plate rebuilding) or needs **any paid generation**. Prototype the riskiest moment; it must
work on touch and keyboard, survive reduced motion, and keep its meaning without animation. Chained
video: one authorized seam probe before the rest. Record estimate, ceiling, retries, provider/model in
`build.json` (`manifest.md`, `assets.md` §1). A failed prototype stops spend. Never route a refused
prompt to another provider.

### Step 4 — Assets & spatial production

Load `assets.md`, `worlds.md`, `hero-depth.md`. Real product, people and place assets for factual
claims; generated imagery never masquerades as evidence; label demos. Brand heroes: layer contract
(`approved-collection.md` §2), clean plates, inspected alpha cutouts, shared contact anchors, exact
posters, separate phone crops. Scrub media by measured budget (`approved-collection.md` §3). Encode with
`scripts/encode.sh` / `framelock.sh` / `knockout.py`; inspect encoded endpoint frames; a failed seam
stops the chain (`scripts/chain.mjs`). Provider calls follow the attempt journal in `assets.md`
(durable task IDs, no overwrite, uncertain billing is not retried blindly).

### Step 5 — Build, harden, wire the real action

Load `taste.md`, `performance-and-craft.md`, `hardening.md`, `ux-copy.md`; `devices.md` /
`worldflight.md` for the engine or `motion-and-interaction.md` for GSAP; `modern-css.md` (CSS before JS).

1. **Static baseline first:** headings, copy, links, labels, reading order and essential evidence work
   with JS off. **Hide nothing until its own controller has initialized**; restore visibility on
   failure or teardown. Video/sequence failure keeps a poster. No essential action depends on hover, a
   hidden timed cue, dragging, or finishing the scroll.
2. **Build location:** standalone → `node <skill>/scripts/workspace.mjs --ensure`, then
   `<workspace>/builds/<name>/` from `references/template.html` + copied `engine/` (never overwrite a
   build). Existing project → its structure; project behaviour in project code; engine fixes need
   explicit skill-maintenance scope.
3. **Brand hero:** first frame complete at scrollY=0 (offer + CTA visible), atomic poster-to-layers
   readiness, bold differential travel, phone recomposed.
4. **The primary action works end to end:** real form with server-side or documented handling,
   validation, no-JS POST (never GET with personal data), confirmation state, selected state carried in.
5. Hardening (`hardening.md` §1–5), copy pass (`ux-copy.md` §8), squint test, build identity +
   revision in `build.json` and page meta (`manifest.md`). Max 3 refine passes before re-rendering a gate.

### Step 6 — Verify the final package (→ G3)

Load `verify.md`; `evaluation.md` for substantial creative work; `integration-nextjs.md` for Next.js.
**Integrate first, then verify** — evidence must come from the package that ships, at its real base URL.

```bash
node <skill>/scripts/serve.mjs --root <build> --manifest <build>/build.json --port 0          # prints the real URL; --lan for a real phone (folder becomes readable on the network)
node <skill>/scripts/shoot.mjs --url <url> --manifest <build>/build.json --out <build>/lab/desktop
node <skill>/scripts/shoot.mjs --url <url> --manifest <build>/build.json --out <build>/lab/mobile --width 390 --height 844   # touch phone context
node <skill>/scripts/shoot.mjs --url <url> --manifest <build>/build.json --out <build>/lab/compact --width 360 --height 640
node <skill>/scripts/shoot.mjs --url <url> --manifest <build>/build.json --out <build>/lab/reduced --reduced-motion
```

Framework projects: run the production build/preview, add the `scroll-forge-build-id` /
`scroll-forge-revision` meta tags (or `--build-id --revision`). Worldflights also run
`scripts/worldflight-assert.mjs`. `shoot.mjs` works on plain HTML and GSAP pages; it checks identity,
fonts actually loaded (`FONT_FALLBACK`), overflow, contrast on the composite, image-sequence frames
(`SEQUENCE_STALLED`), and flags timid motion (`MOTION_TIMID`, diagnostic). `--visual-capture` adds the
pointer-lock guard for pixel capture only.

Then, by hand: **read the contact sheets** (a green exit code proves nothing about composition);
forward/reverse scroll, boundaries, resize, no-JS, failed media, keyboard focus, the primary action and
its consequence (`approved-collection.md` §7); blind comprehension review, then a 60-second cold
**feel check** against the intended curve — a mismatch revises the page or the brief. Missing evidence
is INCOMPLETE, never PASS. Simulated mobile is not a real phone: list what was not tested
(`device-diag.html` for real-device defects).

**G3 — Ship sign-off** (SHIP IT only when all hold, or the user accepts named gaps):
- [ ] `shoot.mjs` PASS at desktop, phone, compact and reduced motion on the final package
- [ ] Contact sheets read; first frame, peak and ending inspected
- [ ] Primary action tested end to end; no false success
- [ ] OG card 1200×630, favicon, real meta description, true structured data, sitemap/robots for standalone
- [ ] Keyboard-only primary flow; dynamic state announced; text on media ≥ 4.5:1
- [ ] Budgets met or deviations recorded (`performance-and-craft.md` §1)

→ **SHIP IT / MINOR FIXES / MAJOR REVISION (back to Step N)**.

### Step 7 — Learn

After each gate verdict, append one metrics row (`metrics-and-retro.md`) with one reject code
(`too-safe · too-loud · too-timid · wrong-register · color-miss · type-miss · layout-miss · motion-miss ·
content-miss · slop-tell · off-contract · identity-miss · perf-concern`). Confidence ladder: 1× observe ·
2× soft prior (confirm) · 3× enforce — **project scope** for client taste; **studio brain** only for
craft, slop tells, proven prompts and environment lessons. New slop tells → `slop-ledger.md`.
After SHIP IT: final contract version, feedback log, next SITE.md screen, factual row in the workspace
fingerprint registry (`templates/FINGERPRINTS.md`) when in scope.

---

## 4. The Design Contract

Template: `discovery-framework.md` §6 (Identity, Audience, Competitive Position, Design System,
**Experience**, Research Directives, Accumulated Feedback, Hard Constraints, Soft Preferences,
Changelog). One living file `.scroll-design-forge/contract/current.md`; a new version only when a gate
advances (`v{N}.md`, changelog line: what, which gate, which feedback). Inject it into every generation.
Never remove a directive without instruction; mark it `[resolved]`. **Contract = intent, `build.json` =
execution**; spend lives only in the manifest. Repair needs only a defect note; Review writes nothing.

---

## 5. Reference map (load on demand, never all at once)

| File | When |
|---|---|
| `discovery-framework.md` | Step 1: gather-first, question bank, preset matrix, camera, cost authority, contract template §6 |
| `design-system-architecture.md` | Step 1: three-layer tokens, DESIGN.md template |
| `register-guide.md` | Steps 1–2: brand vs product rulebooks |
| `research-playbook.md` · `awwwards-2026.md` | Step 2: references, what wins now, saturation watch, lanes |
| `anti-slop.md` | Step 2+ and every validation: dials, Tier A/B bans + exceptions, category reflex, content realism |
| `hero-depth.md` · `approved-collection.md` | Brand heroes, layered composition, rendering method, useful interactions, final-package evidence |
| `uniqueness.md` · `feel.md` | New structure; purpose, peak, pacing, endings |
| `typography-system.md` · `color-and-light.md` · `layout-and-spatial.md` · `component-patterns.md` | Craft per screen type |
| `modern-css.md` · `motion-and-interaction.md` | CSS scroll-driven, view transitions, anchor positioning; GSAP stack |
| `devices.md` · `worldflight.md` | ScrollCraft devices; continuous camera journeys |
| `worlds.md` · `assets.md` | Art direction cohesion; spend contract, attempt journal, encoding, posters, chains |
| `taste.md` · `performance-and-craft.md` · `hardening.md` · `ux-copy.md` | Step 5 |
| `manifest.md` · `verify.md` · `evaluation.md` | Build identity; verification; blind review + feel check |
| `contract-validator.md` | Every generated output |
| `integration-nextjs.md` · `codex.md` · `sibling-skills.md` | Adapters: Next.js, other harnesses, specialist skills (incl. Stitch) |
| `intelligence.md` · `metrics-and-retro.md` · `state-layout.md` · `site-schema.md` | Memory, learning, project state, SITE.md |
| `batch-mode.md` · `recovery-playbook.md` · `quickstart.md` · `examples.md` | ≥5 screens; failures; worked example; history (evidence, not a catalog) |

---

## 6. Standards

**GSAP stack:** `gsap.fromTo()` (never `from()`); `useGSAP` from `@gsap/react`; `gsap.matchMedia` with
`(prefers-reduced-motion: no-preference)` and a reduce branch; package `lenis`; named easing tokens;
never GSAP + Framer Motion in one tree. **ScrollCraft engine:** keep `ScrollCraft`, `sc`, `data-sc-*`;
hide/pin only after the enhancement is ready; `count` only for a real sourced figure. **Both:**
`transform` + `opacity` for continuous motion; `clip-path` profiled; no `transition: all`; hover motion
behind `(hover: hover) and (pointer: fine)`; never capture or lock the cursor.

**Defaults (read the project first):** framework → Next.js App Router / Tailwind v4 + CSS variables /
shadcn / GSAP + ScrollTrigger + Lenis / `next/font` / `next/image`; standalone → `template.html` +
engine + `--sc-*` tokens / self-hosted variable fonts / encoded clips + posters. WebGL (three.js) only
when the subject needs it, with exact posters and a no-WebGL path. Multi-page: native View Transitions
with feature detection, reduced-motion and focus handling. Deploy only when asked.

**Squint test:** blurred, you still find the hero, the primary CTA, 3+ hierarchy levels, alternating
density, one colour story.

**Runtime contracts never renamed:** `ScrollCraft`, `data-sc-*`, `SCROLLFORGE_*` / `SCROLLCRAFT_*`,
`scroll-forge-build-id`, `scroll-forge-revision`, `.scroll-forge-attempts/`.

### Common mistakes

| Mistake | Fix |
|---|---|
| Full gates on a repair; redesigning during a review | Route first (§1) |
| Timid motion on a brand page (8px parallax, slow fades) | Bold differential travel; check `MOTION_TIMID`; read the sheet |
| Flat first frame that only works after scrolling | Offer, CTA and depth visible at scrollY=0 |
| Invented proof ("40% more bookings", fake avatars, "+8 this month") | Truth inventory; real or absent |
| Gate on a description when a renderer exists | G2/G3 review rendered evidence |
| Verifying a dev build, then shipping something else | Verify the final package at its real base URL |
| Reporting INCOMPLETE as PASS | Missing evidence is incomplete; say what was not tested |
| Hiding content behind a class before JS succeeds | Hide only after the controller initializes |
| Signature move that is a recoloured effect | It must do useful work and carry state forward |
| Effects checklist instead of a thesis | One motion identity, one signature move, one peak |
| Paid generation before GP, or bumping the ceiling silently | Stop; ask; record in `build.json` |
| Client taste leaking into another project | Project-scoped priors; studio brain holds craft only |
| Two scroll drivers on one element | One motion stack per page |

---

## Dry-run, handoff, siblings

`--dry-run`: narrate each step without generating or spending; show the injected prompt, validator
criteria, the spend request that would be made and the verification commands.

**Handoff (every route):** artifact path or review findings · scope done · key decisions · estimated vs
recorded spend (and unreconciled attempts) · verdict + evidence paths · untested areas. A local URL is
not a deployment.

Specialists (full tree `sibling-skills.md`): `impeccable document` (brownfield with no DESIGN.md),
`impeccable clarify` (deep copy), `design-review` (visual QA before G3), `generate` / `nano-banana`
(generation after GP, when installed), `gsap-react` + `gsap-scrolltrigger` + `shadcn` (Next.js),
`superpowers:dispatching-parallel-agents` (batch mode). Never invoke `superdesign`, or the retired
`design-forge`, `scroll-forge`, `scroll-craft`, `website-design-veteran`.
