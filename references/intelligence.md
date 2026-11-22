# Intelligence & Self-Learning

The layer that makes Scroll-Design-Forge smarter every project. Load ONCE per invocation (Session Intelligence); per-gate execution uses the inline LEARN checklist in SKILL.md — this file is the full spec, not a per-gate reload.

Design principle: **instruction-driven, not script-driven.** All intelligence here runs by reading state files and reasoning — no node scripts, no hooks, no harness dependencies. The memory and learning mechanics work identically under Claude Code, Codex, or any future harness (unlike script-based approaches that die without their runtime); generation and research capabilities vary by harness and are handled by SKILL.md's Engine Detection + Capability Report, not here.

Everything learned is **evidence with counts, never vibes**. A preference is a claim with N observations behind it, and it graduates through the confidence ladder before it changes behavior.

---

## 1. Memory Layout

**Per-project** (`.scroll-design-forge/` — already defined in `state-layout.md`):
- `contract/` — accumulated decisions (the within-project memory)
- `metrics.json` — every gate decision (JSONL)
- `validator-log.md` — every validation verdict
- `feedback/` — per-screen gate feedback
- `retro/` — periodic synthesis

**Cross-project** (`~/.scroll-design-forge/` — the durable studio brain; create on first write).

**Scope rule (v5):** the studio brain holds craft, slop tells, proven prompts, environment lessons and
opt-in **studio defaults** the owner set for all work (e.g. "bold and obvious on first view",
"dimensional brand heroes"). A **client's** palette, type, dials or preset choices stay in that
project's `.scroll-design-forge/` and are never enforced on another client; at most they appear as a
one-line "last projects leaned X" hint the user can ignore.

| File | Contains | Written by |
|---|---|---|
| `global-preferences.md` | Reject/accept patterns with counts + confidence tier, preset tendencies, register habits | Retro promotion + 3×-rule promotions |
| `dial-calibration.md` | Learned VARIANCE/MOTION/DENSITY priors, global and per-register | Gate 3 picks + gate feedback direction |
| `prompt-playbook.md` | Injection phrasings that produced first-pass validator PASS, keyed by preset × lane × screen-type; plus phrasings that repeatedly failed | Every validator verdict worth keeping |
| `slop-ledger.md` | Candidate NEW tells (not yet in `anti-slop.md`), each with observation count + example | Any rejection whose reason isn't covered by existing rules |
| `reference-library.md` | References that produced ≥7.5 outputs, with the stolen pattern named | Gate 4/5 |
| `preset-performance.csv` | preset × archetype × mean score × n | Retro |
| `trend-freshness.md` | Last re-research date of `awwwards-2026.md` + what changed | Trend refresh (§8) |

## 2. Reject-Reason Taxonomy (controlled vocabulary)

Free-text reject reasons can't be mined. Classify every non-approving gate verdict into exactly one primary code (add free-text detail after the code):

| Code | Meaning |
|---|---|
| `too-safe` | Competent but forgettable; no committed idea |
| `too-loud` | Overstimulating; needs quieter |
| `wrong-register` | Brand treatment on product surface or vice versa |
| `color-miss` | Palette wrong (hue, saturation, strategy level) |
| `type-miss` | Font choice/scale/hierarchy wrong |
| `layout-miss` | Composition, density, or grid wrong |
| `motion-miss` | Too much, too little, or wrong character |
| `content-miss` | Copy, data realism, or content structure wrong |
| `slop-tell` | An AI tell survived (also log WHICH tell → slop ledger if new) |
| `off-contract` | Violated an existing contract directive (validator gap — log to prompt playbook) |
| `identity-miss` | Doesn't feel like the brand (archetype/metaphor miss) |
| `perf-concern` | Too heavy for budget/devices |

`reject_reason` in `metrics.json` = one of these codes. The old free-text goes in a new `reject_detail` field.

## 3. The Confidence Ladder

Every learned pattern carries a tier. Tiers change behavior:

| Tier | Evidence | Behavior |
|---|---|---|
| **Observation** | seen 1× | Logged only. Never acted on. |
| **Soft prior** | seen 2× | Surface it before acting: "You've rejected X twice — avoid it here?" One-line confirm, then apply. |
| **Enforced** | seen 3×+ (or user says "always/never") | Applied silently: injected into prompts, checked by validator. Announced once when promoted, reversible on request. |

Demotion: a single contradicting choice drops an Enforced pattern back to Soft prior (people change; projects differ). Record the contradiction with its context — "rejects serif display (4×) EXCEPT editorial register (2 accepts)" is a *better* pattern, not a broken one. Prefer conditioning a pattern on register/archetype/lane over discarding it.

## 4. Session Intelligence (run at every invocation)

Before Stage 0 — alongside Engine Detection — build a situation report. No scripts: read files, reason, recommend.

1. **Read project state**: `.scroll-design-forge/` (contract version + last changelog entry, SITE.md checked/unchecked rows, last 10 metrics rows, open validator BLOCKs, blocked.md).
2. **Read the brain**: `~/.scroll-design-forge/global-preferences.md`, `dial-calibration.md`, `trend-freshness.md` (skip silently if absent — first run).
3. **Derive the situation** and open with it:

```
SITUATION — {project}
Pipeline: {n}/{total} screens shipped · contract v{N} · last gate: {gate} ({verdict})
Trajectory: Gate-2 scores {…} ({trending up/down}) · regen rate {avg}
Learned priors in play: {top 2-3 enforced/soft patterns relevant to the next screen}
Recommended next: {single best action + why}
```

Recommendation logic (reason over state, no fixed score):
- Unchecked SITE.md rows + no open blocks → next screen, Stage 1.
- Last gate verdict was ADJUST/rejection → resume that stage with the classified reject code addressed.
- 2+ validator BLOCKs for one rule this project → tighten contract before generating anything else.
- 3 screens shipped since last retro → run retro first.
- `trend-freshness.md` older than 90 days → offer trend refresh (§8).
- No `.scroll-design-forge/` at all → Stage 0 discovery (and say so).

This replaces what impeccable does with `context-signals.mjs` — except it also knows the user's cross-project history, not just this repo's git state.

## 5. Predictive Gate Priors (act before generating, not after rejection)

**Before every Stitch call / code-native authoring pass:**
1. Pull Enforced + Soft priors relevant to this screen type, register, and lane.
2. Inject Enforced ones into the prompt's exclusions/directives automatically.
3. Surface Soft ones for a one-line confirm (batched, max 3 — don't interrogate).
4. **State the prediction**: "Based on history, the risk here is `{likely reject code}` — I've countered it by {concrete choice}." Record it in the metrics row (`prediction`), and after the gate record `prediction_hit` (§11 step 0). Misses need no separate log — `prediction_hit: false` rows ARE the record; retro aggregates them (§12).

**At each gate presentation**, include a one-line prior check when relevant: "Note: this direction contains {pattern} which you rejected 2× before — kept because {reason}, flag if wrong."

Never let a Soft/Enforced prior silently overrule an explicit current instruction from the user — explicit always wins, and the contradiction gets logged (§3 demotion rule).

## 6. Dial Calibration (taste, learned numerically)

After every Gate 3 pick and every `bolder/quieter`-flavored feedback:
- Winner had visibly higher/lower VARIANCE than alternatives → nudge the user's VARIANCE prior ±1 in `dial-calibration.md` (same for MOTION via motion feedback, DENSITY via density feedback).
- Store per-register: `product: V5 M4 D6 (n=7) · brand: V8 M7 D3 (n=4)`.
- At Stage 0 of the NEXT project: open with learned dials pre-filled — "Starting dials from your history: V7 M6 D4 — override?" instead of defaults.

## 7. Prompt Playbook (the skill learns to prompt)

The validator already logs verdicts; the playbook closes the loop:
- **First-pass PASS** on a screen → append the prompt's *distinctive phrasings* (not the whole prompt) to `prompt-playbook.md` under `{preset} × {lane} × {screen-type}`.
- **Repeat FLAG/BLOCK on the same directive** (2×) → record the failing phrasing AND the rewrite that finally passed. Next time that directive appears, use the known-good phrasing from the start.
- Before composing any Stitch/code-native prompt: check the playbook for this preset × lane × screen-type and reuse what's proven.

Metric that proves it's working: **first-pass PASS rate should rise across projects** (visible in retro). If it doesn't, the playbook entries are too vague — tighten them.

## 8. Slop Ledger → Skill Self-Amendment (user-gated)

When a rejection is `slop-tell` but the tell is NOT in `anti-slop.md` §2 or `awwwards-2026.md` §7:
1. Append to `~/.scroll-design-forge/slop-ledger.md`: pattern description, example, count=1.
2. At count 2 → treat as Soft prior (§3).
3. At count 3 → **propose a skill edit**: "This tell has now been rejected 3× across projects: {pattern}. Add it permanently to anti-slop.md §2 (BLOCK) or awwwards-2026.md §7 (FLAG)?" On approval, edit the reference file, dating the entry (`added {date}, source: slop-ledger`), and clear the ledger row.

The rulebook itself compounds. Same flow applies in reverse: a §7 saturation-watch item the user *deliberately embraces* repeatedly can be proposed for relaxation.

## 9. Trend Self-Refresh

`awwwards-2026.md` is dated knowledge and marked as such:
- On Session Intelligence, if `~/.scroll-design-forge/trend-freshness.md` says the last refresh is >90 days old (or 3 retros have passed), offer: "Trend file is {n} days old — re-research before this project?"
- Refresh = re-run the research protocol (search current Awwwards winners + trend reports), then update: §7 saturation watch (moves newly commoditized), §8 lanes (new/retired), §1-6 principles if the ground shifted. Stamp `trend-freshness.md` with date + changelog.
- Never silently rewrite history: additions dated, removals struck through with a date, so the file shows trend drift over time.

## 10. Learning-Aware Discovery (Stage 0 gets shorter every project)

Discovery already adapts to what the *project* knows; now it adapts to what the *brain* knows:
- Pre-fill predicted answers from global-preferences + dial-calibration, and ask for **confirmation of deltas** instead of open questions: "Last 3 projects: dark-first, high-contrast accents, V7 M6 D4, no stock photography. Same here, or is this project different?"
- Ask open questions only where the brain has no prior or the project contradicts it.
- First-ever project = full discovery (nothing to predict). By project 3, discovery should be ~5 questions.

## 11. Learning Loop — the per-gate step

Append to every gate procedure (all stages):

```
LEARN (after recording the verdict):
0. Close the prediction loop: the metrics row's `prediction` field = the reject
   risk you stated before generating (§5); `prediction_hit` = whether the actual
   verdict matched it. Never leave these null when a §5 prediction was made.
1. metrics.json row — with taxonomy code in reject_reason (§2)
2. If rejection: is it a repeat? (2× → Soft prior; 3× → Enforced + promote to
   ~/.scroll-design-forge/global-preferences.md now, not at retro)
3. If slop-tell not covered by current rules → slop-ledger (§8)
4. If validator repeat-offense or first-pass PASS → prompt-playbook (§7)
5. If Gate 3 pick or dial-flavored feedback → dial-calibration (§6)
```

Cost control: each step is one line appended to one file; total overhead per gate ≈ 5 short writes. Skip nothing — sparse logs are why systems don't learn.

## 12. Retro Upgrade

Retro (`metrics-and-retro.md`) becomes the *consolidation* pass, not the only learning moment:
- Verify 3×-rule promotions already made mid-project (they happen immediately now).
- Mine what per-gate learning misses: cross-screen patterns (preset × archetype performance, stage duration, score trajectory).
- Compute **first-pass PASS rate** and **prediction accuracy** (predictions made §5 vs. outcomes) — the two numbers that prove the skill is actually getting smarter. Report both trends in every retro.
- Execute pending skill-amendment proposals (§8) the user approved but that weren't applied.

---

## Why this out-learns impeccable (capability comparison)

| Capability | impeccable | Scroll-Design-Forge |
|---|---|---|
| Session-start awareness | `context-signals.mjs` (git + critique snapshots, needs node) | Situation report from full pipeline state + cross-project brain, harness-agnostic (§4) |
| Slop detection | Static regex detector over files | Contract validator + anti-slop scan + **ledger that discovers NEW tells and amends its own rulebook** (§8) |
| Memory scope | Per-project critique history | Per-project contract + durable `~/.scroll-design-forge/` brain across all projects (§1) |
| Prediction | None — reacts to findings | States expected reject risk before generating and counters it (§5) |
| Taste model | None | Numeric dial priors, learned per-register (§6) |
| Prompt improvement | None | Playbook of proven phrasings; first-pass PASS rate tracked (§7) |
| Knowledge freshness | Static reference files | Dated trend file with scheduled re-research (§9) |
| Discovery efficiency | Same questions each project | Confirms predicted answers; shrinks every project (§10) |
| Overfit protection | n/a | Confidence ladder + demotion-with-conditioning (§3) |

Impeccable's learning ceiling is remembering what it critiqued. Scroll-Design-Forge's is a compounding model of the user's taste, its own prompting skill, and a self-amending rulebook — with graduated confidence so it never mistakes one bad Tuesday for a preference.
