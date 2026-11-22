# Scroll-Design-Forge

A [Claude Code](https://claude.com/claude-code) skill for building websites to an award-level standard, from a quiet, correct landing page to a scroll-driven, scrubbed-video camera journey. It routes the request, runs human review gates, builds code-native, verifies the final package in a real browser, and refuses invented proof (fake testimonials, metrics, logos).

Version 5.0.0 merges three earlier skills: **design-forge** (contract-driven, gated design pipeline), **scroll-forge** (scroll engine, media pipeline, real-browser verification) and **scroll-craft** (dimensional brand heroes, final-package evidence).

## What it does

1. **Routes every request** (Create full or lite, Refine, Repair, Review) and runs only the gates that route needs.
2. **Keeps a living Design Contract** that records each decision. Every generation call receives the whole contract, and every output is validated against it.
3. **Enforces tiered anti-slop bans.** Tier A tells (gradient text, AI-purple glow, 01/02/03 scaffolding, identical card rows…) are blocked; Tier B needs a written justification.
4. **Defaults brand heroes to bold dimensional depth**: clean background plates, alpha cutouts, differential travel, atomic poster-to-layers readiness, a complete first frame at scrollY=0.
5. **Includes the ScrollCraft engine**: scrub, pin, pan, reveal, kinetic, parallax, count, flow, pointer and drift devices, plus continuous camera journeys ("worldflight").
6. **Runs a budgeted media pipeline.** It records a spend ceiling, validates one seam probe before paying for a full chain, then encodes video, makes posters and adapts media for mobile.
7. **Verifies in a real browser.** `shoot.mjs` captures desktop, touch phone, compact phone and reduced-motion evidence with a PASS / FAIL / INCOMPLETE verdict; the ship gate needs PASS.
8. **Learns across projects** (reject taxonomy, confidence ladder, predictive priors) while keeping one client's taste out of another client's project.

## Install

```bash
git clone https://github.com/Eskapeum/scroll-design-forge.git ~/.claude/skills/scroll-design-forge
```

Claude Code picks it up on the next session. Invoke it with `/scroll-design-forge`, or just ask for a landing page, hero section, scroll experience or design review.

## Requirements

| Need | For | Notes |
|---|---|---|
| Node.js 18+ | scripts, tests | |
| Google Chrome (or Chromium / Edge) | browser verification | Found automatically on macOS, Linux and Windows |
| `playwright-core` | `shoot.mjs`, browser tests | Not bundled. Point `SCROLLFORGE_PLAYWRIGHT_ROOT` at an existing install, e.g. one from `npx playwright` |
| ffmpeg (full build) | encoding scrub video, posters, generation tests | Optional for sites without video |
| An image/video generation tool | generated assets | Optional. Supplied photos and footage need no key and no spend |

Check your setup:

```bash
node ~/.claude/skills/scroll-design-forge/scripts/doctor.mjs --mode verify
```

## Tests

```bash
SCROLLFORGE_PLAYWRIGHT_ROOT=/path/to/node_modules/playwright-core node --test tests/*.test.mjs
```

If you have run `npx playwright` before, this usually finds one:

```bash
SCROLLFORGE_PLAYWRIGHT_ROOT=$(ls -d ~/.npm/_npx/*/node_modules/playwright-core | head -1) node --test tests/*.test.mjs
```

The full suite is 79 tests (runtime, harness, diagnostics, generation). Without Playwright the browser suites cannot load; Chrome and ffmpeg are needed for the full set. No test makes a paid provider call.

## The pipeline

| Route | Gates |
|---|---|
| Create, full | G1 Brief & truth → G2 two rendered directions → (GP) → G3 ship sign-off |
| Create, lite (new screen in an existing system) | G1-lite → (GP) → G3 |
| Refine | G2 only if substantial → (GP) → G3 |
| Repair | Reproduce, regression check, fix, verify, one-line confirmation |
| Review | None. Read-only findings with evidence |

**GP** (prototype proof plus spend approval) runs on any route that adds a risky scroll device or any paid generation, and never auto-passes for new spend.

## Layout

```
SKILL.md          pipeline, routes, gates, contract, standards
references/       39 on-demand references + 2 HTML fixtures (template, device diagnostics)
engine/           ScrollCraft runtime (scrollcraft.js / .css)
scripts/          doctor, workspace, serve, shoot (verification), encode, framelock, knockout, chain, worldflight-assert
templates/        FINGERPRINTS.md registry template
tests/            node:test suites
evals/            response-only regression briefs
```

## State

- Project design state: `.scroll-design-forge/` (versioned contract, research, metrics, retros)
- Cross-project studio brain: `~/.scroll-design-forge/`
- Standalone builds: `<workspace>/builds/<name>/` (`build.json` manifest, `lab/` verification evidence). The workspace resolves from `SCROLLFORGE_HOME`, then `.scrollforge.json`, then `<project root>/scrollforge`.

Runtime names are stable and intentionally unchanged across versions: the `ScrollCraft` global, `data-sc-*` attributes, `SCROLLFORGE_*` environment variables and `scroll-forge-build-id` / `scroll-forge-revision` meta tags.

## License

MIT. See [LICENSE](LICENSE).
