# State Layout — `.scroll-design-forge/` Directory Schema

Canonical directory + file contract for every project using Scroll-Design-Forge.

## Tree

```
.scroll-design-forge/
├── contract/
│   ├── v1.md                     # frozen at Gate 0
│   ├── v2.md                     # frozen at Gate 0.5
│   ├── v3.md                     # frozen at Gate 1
│   ├── v{N}.md                   # one per gate advancement
│   └── current.md                # symlink to latest v{N}.md
│
├── research/
│   └── {screen}.md               # one per screen, format from research-playbook.md
│
├── feedback/
│   └── {screen}.md               # final feedback log after Gate 5 SHIP IT
│
├── retro/
│   └── {ISO-8601}.md             # every 3 shipped screens + project end (metrics-and-retro.md)
│
├── validator-log.md              # append-only, one entry per generated output (Stitch or code-native)
├── metrics.json                  # append-only JSONL, one row per gate decision
├── stitch.json                   # engine + project/design-system IDs
├── blocked.md                    # only exists if pipeline is paused
│
└── init/
    ├── brand-assets/             # user-supplied logos, fonts, photography
    ├── competitors.md            # optional pre-populated competitor notes
    └── voice.md                  # optional brand voice / copy guidelines
```

### Build artifacts (separate from design state)

Design *decisions* live in `.scroll-design-forge/`. Build *execution* lives with the build:

```
<project or workspace>/builds/<name>/   # standalone builds only (workspace.mjs --ensure); framework projects build in place
├── build.json                    # manifest.md: build id + revision, assets, spend approvals, gates passed
├── index.html                    # adapted from references/template.html
├── scrollcraft.{js,css}          # copied engine (never edited per project)
├── media/                        # encoded clips + posters (assets.md §6)
├── chain/.scroll-forge-attempts/ # paid-generation attempt journal (protocol name kept)
└── lab/{desktop,mobile,reduced}/ # shoot.mjs evidence + report.json — what Gates 2–5 review
```

The contract's **Experience** section points at `build.json`; the manifest never duplicates contract prose and the contract never duplicates the spend ledger.

## File schemas

### `contract/v{N}.md`
Full Markdown document per the template in `SKILL.md` + `## Changelog` section.

```markdown
---
version: {N}
frozen_at_gate: {gate_id}
frozen_on: {ISO-8601}
prev_version: v{N-1}
---

# Design Contract: {project}

{body per template}

## Changelog
- **Gate 0 (v1)**: initial capture from discovery
- **Gate 0.5 (v2)**: design system locked
- **Gate 1 (v3)**: research directives added
- **Gate N (vN+1)**: {summary of what changed}
```

Immutable once written. Edits create a new `v{N+1}.md` and repoint `current.md`.

### `stitch.json`
```json
{
  "engine": "stitch",
  "projectId": "...",
  "designSystemId": "...",
  "preset": "LUXURY",
  "colorMode": "DARK",
  "customColor": "#C9A55A",
  "headlineFont": "PLAYFAIR_DISPLAY",
  "bodyFont": "INTER",
  "roundness": "ROUND_FOUR",
  "colorVariant": "TONAL_SPOT",
  "createdAt": "2026-04-15T12:00:00Z",
  "screens": {
    "home":      { "screenId": "...", "lastUpdated": "..." },
    "pricing":   { "screenId": "...", "lastUpdated": "..." }
  }
}
```

`engine` is `"stitch"` or `"code-native"` (set by Engine Detection in SKILL.md — code-native when the Stitch MCP tools are absent, e.g. under Codex). In code-native mode only `engine` and `preset` (as a style direction) are meaningful; `screens` maps names to source file paths instead of screenIds:
```json
{ "engine": "code-native", "preset": "LUXURY",
  "screens": { "home": { "file": "src/app/page.tsx", "lastUpdated": "..." } } }
```

### `metrics.json`
JSONL, one row per gate decision. Canonical schema in `metrics-and-retro.md` (14 fields — `reject_reason` must be a taxonomy code from `intelligence.md` §2; `prediction`/`prediction_hit` close the §5 loop; Gate 5 SHIP IT rows add `shipped`, `contract_version`, `feedback_rounds_total`):
```json
{"ts":"2026-04-15T12:00:00Z","screen":"home","stage":0,"gate":"GATE_0","verdict":"APPROVE","duration_sec":420,"stitch_calls":0,"regenerations":0,"awwwards_score":null,"validator_blocks":0,"validator_flags":0,"reject_reason":null,"reject_detail":null,"prediction":null,"prediction_hit":null}
{"ts":"2026-04-15T12:15:00Z","screen":"home","stage":2,"gate":"GATE_2","verdict":"ADJUST","duration_sec":180,"stitch_calls":1,"regenerations":0,"awwwards_score":6.8,"validator_blocks":0,"validator_flags":1,"reject_reason":"type-miss","reject_detail":"display font feels too corporate","prediction":"color-miss","prediction_hit":false}
```

### `validator-log.md`
Append-only markdown, format per `contract-validator.md`.

### `blocked.md`
Only present when pipeline paused:
```markdown
# BLOCKED — {ISO-8601}
Screen: {screen}
Stage: {N}
Symptom: {...}
Attempted: {...}
Next human step: {...}
Last-good contract: contract/v{N}.md
```

### `feedback/{screen}.md`
```markdown
# Feedback Log — {screen}
Shipped: {ISO-8601}

## Gate 0  — {verdict}
- {bullets}

## Gate 0.5 — {verdict}
- {bullets}

## Gate 1–5 — {verdicts}

## Post-ship notes
- {what worked, what we'd change}
```

## Lifecycle

| Event | Files touched |
|---|---|
| Project init  | create `.scroll-design-forge/`, `init/` (optional), `stitch.json` with `engine` field (Engine Detection) |
| Gate 0 APPROVE | write `contract/v1.md`, repoint `current.md`, append metrics |
| Gate 0.5 APPROVE | update `stitch.json`, write `contract/v2.md`, repoint `current.md` |
| Generation call (Stitch or code-native) | append to `validator-log.md` |
| Gate N advance | write `contract/v{N+1}.md`, repoint `current.md`, append metrics |
| Every gate — LEARN step (`intelligence.md` §11) | append full metrics row (incl. `prediction`/`prediction_hit`); on repeat patterns, write `~/.scroll-design-forge/{global-preferences,slop-ledger,prompt-playbook,dial-calibration}.md` |
| First-ever LEARN write on a machine | `mkdir -p ~/.scroll-design-forge/` (bootstrap the brain) |
| Every 3 shipped screens / project end | write `.scroll-design-forge/retro/{ISO-8601}.md` |
| Gate 5 SHIP IT | write `feedback/{screen}.md`, mark `SITE.md` complete |
| Block | write `blocked.md`, pause all file writes until resolved |

## Init command

```bash
# bootstrap:
mkdir -p .scroll-design-forge/{contract,research,feedback,retro,init/brand-assets}
: > .scroll-design-forge/stitch.json
: > .scroll-design-forge/metrics.json
: > .scroll-design-forge/validator-log.md
```

## `.gitignore` recommendation

Tracking everything in `.scroll-design-forge/` gives you full reproducibility, but secrets-free.
- **Track:** everything except `stitch.json` API IDs if you consider them sensitive
- **Ignore:** `init/brand-assets/*.psd`, large binaries, if they don't belong in git

Default `.gitignore` snippet:
```
# scroll-design-forge
.scroll-design-forge/init/brand-assets/*.psd
.scroll-design-forge/init/brand-assets/*.sketch
.scroll-design-forge/init/brand-assets/*.fig
```

## Safety rails

- Never overwrite a frozen `v{N}.md`. Always bump version.
- Never delete `validator-log.md` entries. Append-only.
- `current.md` is a symlink. If filesystem doesn't support symlinks, use a file with content `v{N}.md` as pointer; skill reads the pointer then the target.
