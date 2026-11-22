# Metrics & Retro

What Scroll-Design-Forge measures, where it writes it, and how to review it.

## Metrics file

Path: `.scroll-design-forge/metrics.json` (JSONL, append-only).

### Row schema

```json
{
  "ts": "ISO-8601",
  "screen": "home",
  "stage": 2,
  "gate": "GATE_2",
  "verdict": "GOOD_DIRECTION|ADJUST|WRONG_DIRECTION|APPROVE|...",
  "duration_sec": 180,
  "stitch_calls": 1,
  "regenerations": 0,
  "awwwards_score": 6.8,
  "validator_blocks": 0,
  "validator_flags": 1,
  "reject_reason": null,
  "reject_detail": null,
  "prediction": null,
  "prediction_hit": null
}
```

`reject_reason` MUST be a taxonomy code from `intelligence.md` §2 (`too-safe`, `too-loud`, `wrong-register`, `color-miss`, `type-miss`, `layout-miss`, `motion-miss`, `content-miss`, `slop-tell`, `off-contract`, `identity-miss`, `perf-concern`) — free text goes in `reject_detail`. `prediction` is the reject risk stated before generating (intelligence.md §5); `prediction_hit` records whether the actual verdict matched it.

Stage 5 SHIP IT row also includes:
```json
{ "shipped": true, "contract_version": 7, "feedback_rounds_total": 4 }
```

## What to track per gate

| Field | Required at | Purpose |
|---|---|---|
| `duration_sec` | every gate | Identify slow stages |
| `stitch_calls` | every Stitch-invoking stage | Cost tracking |
| `regenerations` | Stages 2, 3, 4 | Contract / prompt quality |
| `validator_blocks` / `validator_flags` | every Stitch output | Contract strictness tuning |
| `awwwards_score` | Gate 2, Gate 4, Gate 5 | Quality trajectory |
| `reject_reason` | any non-approving verdict | Pattern detection |

## Retro trigger

Run retro automatically:
- Every 3 shipped screens
- End of project (all `SITE.md` rows marked `[x]`)
- On demand via `/scroll-design-forge retro` if available

## Retro output

Writes `.scroll-design-forge/retro/{ISO-8601}.md`:

```markdown
# Retro — {date}

## Volume
- Screens shipped: {n}
- Total duration: {h} hours
- Total Stitch calls: {n}
- Average regenerations per screen: {avg}

## Quality trajectory
- Gate 2 scores: {mean} (range {min}-{max})
- Gate 4 scores: {mean}
- Gate 5 scores: {mean}
- SOTD-eligible screens (≥8.0): {count}

## Slowest stages
1. {stage} — {avg duration}
2. ...

## Most-common reject reasons (from reject_reason)
- {reason_1}: {count}
- {reason_2}: {count}

## Validator heat map
- Most-triggered BLOCK rules: ...
- Most-triggered FLAG rules: ...

## Learning health (proves the skill is getting smarter)
- First-pass validator PASS rate: {n}% (prev retro: {n}%)  ← should rise
- Prediction accuracy (prediction_hit rate): {n}% (prev: {n}%)  ← should rise
- Discovery questions asked this project: {n} (prev project: {n})  ← should fall
- Promotions made mid-project: {list}
- Pending skill amendments (slop-ledger at 3×): {list}

## Action items (auto-suggested)
- [ ] If regenerations > 2 on average → tighten contract exclusions
- [ ] If Gate 2 score consistently < 6 → revisit research playbook
- [ ] If specific BLOCK rule fires >3×  → add to hard constraints
- [ ] If a preset produced <7.5 average → deprecate for this archetype
- [ ] If first-pass PASS rate flat/falling → prompt-playbook entries too vague; tighten
- [ ] If prediction accuracy < 50% → priors are noise; audit global-preferences tiers
- [ ] Execute approved-but-unapplied skill amendments (intelligence.md §8)
```

## Cross-project learning

**Promotion is immediate, not retro-batched**: the 3×-rule (`intelligence.md` §3) promotes a pattern to `~/.scroll-design-forge/global-preferences.md` at the gate where the third observation lands. Retro *verifies* promotions and mines what per-gate learning can't see (cross-screen patterns, trajectories).

The full `~/.scroll-design-forge/` brain (schemas in `intelligence.md` §1):

- `global-preferences.md` — reject/accept patterns with counts + confidence tier
- `dial-calibration.md` — learned VARIANCE/MOTION/DENSITY priors, per-register
- `prompt-playbook.md` — proven prompt phrasings by preset × lane × screen-type
- `slop-ledger.md` — candidate new tells en route to a skill amendment
- `reference-library.md` — reference URLs that produced ≥7.5 outputs
- `preset-performance.csv` — preset × archetype × mean score
- `trend-freshness.md` — last `awwwards-2026.md` re-research date

These seed Stage 0 (learning-aware discovery) and Stage 1 on future projects.

## `global-preferences.md` schema

```markdown
# Global Design Preferences — {user}

## Reject patterns (soft priors — confirm before enforcing)
- **Purple gradients on fintech** (rejected 3/3 times in fintech projects)
- **Stock photography in marketing heroes** (rejected 5/5 times)
- **Sidebar navigation on marketing pages** (rejected 2/2 times)

## Accept patterns
- **Editorial serif + mono numerical data** (accepted 4/4 times)
- **Aged-gold accents over warm neutrals** (accepted 3/3 times)

## Preset tendencies
- Prefers LUXURY and KINETIC for fintech/premium
- Rejects NEUMORPHISM universally
```

## Retro cadence rule of thumb

| Project size | Retro frequency |
|---|---|
| 1–3 screens   | End of project only |
| 4–10 screens  | Every 3 screens + end |
| 10+ screens   | Every 3 screens + midpoint + end |

## Using metrics during the pipeline

The skill should peek at metrics before each gate:
- Before Gate 2: show last 3 screens' Gate 2 scores ("trending up/down")
- Before Gate 4: show validator heat map for this session
- Before advancing past a gate: if user has rejected same pattern 2× → warn before generating

## Retention

- `metrics.json`: keep forever (JSONL — grows slowly)
- `retro/*.md`: keep forever
- `validator-log.md`: rotate annually (archive to `.scroll-design-forge/archive/{year}/`)
