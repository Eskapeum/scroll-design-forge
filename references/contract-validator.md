# Contract Validator

Formalized post-generation check run against **every** Stitch output before it reaches the user.

## Severity Model

| Severity | Meaning | Action |
|---|---|---|
| **BLOCK** | Directly violates a Hard Constraint, identity rule, or exclusion | Regenerate. Never show to user. |
| **FLAG**  | Deviates from a Soft Preference or research directive | Show to user, annotate the deviation, offer regenerate/accept |
| **PASS**  | Matches directive within tolerance | Silent OK |

## Check Order

Run in this order; short-circuit on BLOCK only if the whole output is unrecoverable.

### 1. Identity checks (BLOCK on miss)
- **Preset fingerprint:** output's visual language matches declared preset (e.g., Luxury = dark + serif + generous whitespace; Win98 = pixel borders)
- **Archetype match:** emotional register aligns with contract archetype (no "playful" elements in a "sovereign" brand)

### 2. Design system — strict equality (BLOCK on miss)
- **Primary color:** hex exact match OR ΔE2000 ≤ 3 against declared primary
- **Display font:** font-family name exact match (case-insensitive)
- **Body font:** font-family name exact match
- **Border radius:** value matches declared bucket (`ROUND_FOUR`=4px, `ROUND_EIGHT`=8px, `ROUND_TWELVE`=12px, `ROUND_FULL`=9999px)
- **Color mode:** LIGHT/DARK matches contract

### 3. Hard Constraints & Exclusions (BLOCK on any hit)
- **Keyword scan** the rendered description / DOM for user-defined exclusion terms
- **Component scan:** if contract says "no sidebar" and output contains a vertical nav >20% width → BLOCK
- **Pattern scan:** if contract says "no stock photography" and output embeds generic hero photo → BLOCK

### 3b. Anti-slop scan (BLOCK on any hit)
- **Absolute bans:** scan output for each of the 12 bans in `anti-slop.md` §2 (side-stripes, gradient text, decorative glass, hero-metric template, identical card grids, per-section eyebrows, numbered scaffolding, cream/sand default bg, AI purple/neon, pure #000, text overflow, emoji UI)
- **Taste dials:** layout symmetry vs contract VARIANCE, card usage vs DENSITY, motion presence vs MOTION
- **Content realism:** scan copy for banned names, round fake numbers, slop brand names, filler words (`anti-slop.md` §6)

These run even when the contract is silent — they are standing exclusions, not user preferences.

**Code-native mode:** the output under validation is code, so scan the source directly for ban signatures — `background-clip: text` with a gradient (or `bg-clip-text bg-gradient-*`), `border-left`/`border-right` > 1px accent stripes, raw `z-index: 999/9999` literals, `#000000`, `h-screen` on full-height sections, banned placeholder strings ("John Doe", "Acme", round marketing numbers) — in addition to judging the rendered/described result.

### 4. Research directives (FLAG on miss)
- Each research directive listed in contract should be visible in the output
- Score: `directives_present / directives_total`. ≥ 0.75 = PASS, 0.5–0.75 = FLAG, < 0.5 = BLOCK

### 5. Accumulated feedback (FLAG on miss)
- Every prior gate's feedback bullet that's still active should be reflected
- Active feedback = not marked `[resolved]` in contract changelog

### 6. Soft preferences (FLAG only)
- Deviations noted but do not block advancement

### 7. 2026 saturation watch (FLAG only)
- Scan for the commoditized moves in `awwwards-2026.md` §7 (flat linear gradients, bento-as-differentiator, hyper-polished AI sheen, decorative WebGL blobs, trend soup ≥3 lanes, uniform scroll-fade-up)
- A hit is acceptable ONLY with an explicit contract justification; otherwise FLAG with the §7 item named

## Automated Validator Prompt (for LLM self-check)

Use this exact structure when asking Claude to validate output:

```
You are a Contract Validator. You will check a Stitch-generated design
against a Design Contract and return a structured verdict.

=== DESIGN CONTRACT ===
{paste full contract}

=== STITCH OUTPUT (DESCRIPTION OR DOM) ===
{paste output}

=== YOUR TASK ===
For each category below, return PASS / FLAG / BLOCK with a one-line reason.

1. Identity & preset fingerprint
2. Primary color (hex match or ΔE ≤ 3)
3. Display font (name match)
4. Body font (name match)
5. Border radius (bucket match)
6. Color mode (LIGHT/DARK)
7. Hard constraints & exclusions (list any hits)
8. Anti-slop scan (12 absolute bans + taste dials + content realism — see anti-slop.md; list any hits)
9. Research directives (X of Y present)
10. Accumulated feedback (X of Y reflected)
11. Soft preferences (deviations)
12. 2026 saturation watch (awwwards-2026.md §7 hits without contract justification)

Overall verdict:
- BLOCK if any of 1-8 is BLOCK, or if 9-10 combined score < 0.5
- FLAG  if any of 9-12 is FLAG and 1-8 all PASS
- PASS  otherwise

Return as JSON:
{
  "checks": [ {"name": "...", "verdict": "...", "reason": "..."}, ... ],
  "overall": "BLOCK|FLAG|PASS",
  "blocker_summary": "..." | null
}
```

## Thresholds & Tolerances

| Dimension | Tolerance |
|---|---|
| Color ΔE2000 | ≤ 3 for primary, ≤ 5 for neutrals |
| Font family | Exact name match (ignore weight/style) |
| Radius | ±1px allowed for visual rounding |
| Spacing | ±8px within section; system-scale multiples enforced |
| Typography scale | Exact steps from declared scale (no off-scale sizes) |

## When BLOCK happens

1. Record the block reason in `.scroll-design-forge/validator-log.md`
2. Regenerate with the block reason injected as an additional exclusion
3. After 2 consecutive BLOCKs for the same reason → escalate via `recovery-playbook.md`

## When FLAG happens

Present to user with explicit callout:
```
GATE X — Validation Report

PASS: {list}
FLAG: {list with reasons}
BLOCK: none

Proceed with FLAGs, or regenerate to fix?
[ACCEPT] [REGENERATE] [REVISE SPECIFIC FLAG]
```

## Validator Output → Contract Update

Append to `.scroll-design-forge/validator-log.md`:
```
## {timestamp} — Stage {N}
- Verdict: {PASS/FLAG/BLOCK}
- Blocks: {list or none}
- Flags: {list or none}
- Action: {accepted / regenerated / escalated}
```

Over time this log reveals systemic prompt weaknesses (patterns of repeat FLAGs → tighten contract or preset).
