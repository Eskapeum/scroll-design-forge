# Anti-Slop Enforcement

Extracted UVP from `impeccable` (v3.8) and `design-taste-frontend-v1`. Load at Stage 2+ (before writing any Stitch prompt) and during every contract validation. Purpose: guarantee no output could make someone say "AI made that."

Scroll-Design-Forge's contract enforces what the user *chose*. This file enforces what nobody should ever get *by default* — the statistical reflexes of AI design.

---

## 1. Taste Dials

Three numeric dials, set at Gate 0 (discovery) and recorded in the Design Contract under `## Design System`. They parameterize every Stitch prompt.

| Dial | Range | Default | Meaning |
|---|---|---|---|
| **VARIANCE** | 1–10 | 7 | 1 = perfect symmetry · 10 = artsy chaos |
| **MOTION** | 1–10 | 6 | 1 = static · 10 = cinematic physics |
| **DENSITY** | 1–10 | 4 | 1 = art gallery · 10 = pilot cockpit |

### Level behavior

**VARIANCE**
- 1–3: centered layouts, strict 12-col symmetrical grids, equal paddings.
- 4–7: offset compositions — negative margins, varied image aspect ratios, left-aligned headers over centered data.
- 8–10: masonry, fractional grids (`2fr 1fr 1fr`), massive deliberate empty zones.
- **VARIANCE > 4 → default away from a centered hero/H1** (split-screen, left-aligned content / right asset, asymmetric whitespace). A centered H1 stays available when the creative thesis calls for it (a creative default, not a ban).
- **Mobile override:** asymmetric layouts collapse to a single column below 768px. **The page itself never scrolls horizontally.** An intentional horizontal rail inside a section (snap, visible affordance, keyboard focus brings panels into view) is allowed.

**MOTION**
- 1–3: `:hover`/`:active` states only.
- 4–7: CSS transitions (`cubic-bezier(0.16, 1, 0.3, 1)`), load-in cascades, transform/opacity only.
- 8–10: scroll choreography, parallax, perpetual micro-interactions (breathing status dots, shimmer, marquee) — GSAP + ScrollTrigger per the skill's animation standards.

**DENSITY**
- 1–3: huge section gaps, everything expensive and airy.
- 4–7: standard app spacing.
- 8–10: **cards BANNED** — separate data with `border-t` / `divide-y` / negative space only; monospace for all numbers.

Preset interplay: dials refine the preset, never fight it (Luxury naturally sits at low density; Newsprint at higher density). If a user request implies a dial change ("make it wilder" → VARIANCE up), update the contract, don't just wing the one screen.

---

## 2. Bans (v5 tiers, owner decision 2026-11-22)

**Tier A — hard (BLOCK, never shown): #1–7, #9, #11, #12 below, plus zero fiction** (no invented
statistics, logos, testimonials, client names, availability or urgency). If the user explicitly asks
for one, name the ban, explain the tell, offer the closest compliant alternative.

**Tier B — blocked unless the creative thesis justifies it in writing: #8 (cream/sand/beige body)
and #10 (pure `#000000`).** Record the one-sentence justification in the contract's Experience
section; the validator then treats it as PASS.

**Legitimate exceptions (never BLOCK):** numbers on a real ordered sequence (process steps, a
timeline) where order carries information (#7); a comparison table or pricing tiers whose
repetition is the point (#5); one named kicker as a deliberate brand system (#6).

Explicit current user instructions outrank studio defaults and learned priors, but not Tier A.

1. **Side-stripe borders** — `border-left/right` > 1px as a colored accent on cards, callouts, alerts. Rewrite with full borders, background tints, leading icons, or nothing.
2. **Gradient text** — `background-clip: text` over a gradient. Solid color; emphasis via weight or size.
3. **Glassmorphism as default** — blur/glass used decoratively. Rare and purposeful, or nothing. When genuinely used: 1px inner border (`border-white/10`) + inset highlight to simulate real edge refraction — never bare `backdrop-blur`.
4. **The hero-metric template** — big number, small label, supporting stats, gradient accent.
5. **Identical card grids** — same-sized icon + heading + text cards repeated. Includes the generic **3-equal-cards feature row**: use a 2-col zig-zag, asymmetric grid, a ledger/list, or an in-section rail instead.
6. **Eyebrow kickers on every section** — the tiny uppercase tracked label ("ABOUT" / "PROCESS") above each heading is the most saturated AI scaffold of all. ONE named kicker as a deliberate brand system = voice; an eyebrow per section = AI grammar.
7. **Numbered section markers as scaffolding (01 / 02 / 03)** — numbers earn their place only when the section IS a real sequence and order carries information.
8. **The cream/sand/beige default background** — the warm-neutral band (OKLCH L 0.84–0.97, C < 0.06, hue 40–100) as body bg, whatever it's named (`--paper`, `--linen`, `--parchment`…). "Warm brand" is carried by accent + type + imagery, not a warm-tinted near-white. Alternatives: a committed saturated body color, a chroma-0 true off-white, or a darker brand-hue mid-tone. (Preset-assigned warm backgrounds above L 0.97 — e.g. Playful `#FFF7ED`, Hand-draw `#FFFBEB` — sit outside the banned band and are permitted when the preset was a deliberate Gate 0.5 choice.)
9. **AI purple / neon glow** — purple-blue gradients, glowing buttons, neon accents. Neutral bases (zinc/slate) + one high-contrast singular accent.
10. **Pure black `#000000`** — use off-black (zinc-950 / charcoal / near-black in the brand's hue).
11. **Text overflowing its container** — long headline words + large clamp + narrow grid. Test the actual copy at every breakpoint; the viewport is part of the design.
12. **Emojis as UI** — never in markup, content, or alt text. Real icons (Phosphor/Radix) or clean SVG, with one globally consistent strokeWidth.

---

## 3. The Category-Reflex Check

Run before finalizing any direction (Stage 2 prompt-writing) — two altitudes; the second catches what the first misses:

- **First-order:** could someone guess the theme + palette from the category alone? ("meditation app" → sage green + cream; "fintech" → navy + gold; "dev tool" → dark mode + neon). If yes → it's the first training-data reflex. Rework.
- **Second-order:** could someone guess the aesthetic family from category-plus-anti-reference? ("AI tool that's not SaaS-cream → editorial-typographic"; "fintech that's not navy-gold → terminal dark mode"). That's the trap one tier deeper. Rework until neither answer is obvious.

**Dark vs light is never a default.** Before choosing, write one sentence of physical scene: who uses this, where, under what ambient light, in what mood. If the sentence doesn't force the answer, add detail until it does. Record the sentence in the contract.

---

## 4. Color Strategy Commitment Axis

Pick a strategy before picking colors; record it in the contract:

| Strategy | Definition | When |
|---|---|---|
| **Restrained** | tinted neutrals + one accent ≤ 10% of surface | product UI default |
| **Committed** | one saturated color carries 30–60% of the surface | identity-driven pages |
| **Full palette** | 3–4 named roles, each deliberate | campaigns; data viz |
| **Drenched** | the surface IS the color | brand heroes, statements |

Rules: OKLCH throughout. Max 1 accent for Restrained; accent saturation < 80%. One palette for the whole project — never fluctuate between warm and cool grays. Tinted neutrals: 0.005–0.015 chroma toward the *brand's own hue*, not toward "warmth" by reflex. Gray text on colored bg looks washed out — use a darker shade of the bg's own hue or a transparency of the text color.

---

## 5. Numeric Floors & Ceilings

| Rule | Value |
|---|---|
| Body text contrast | ≥ 4.5:1 (placeholders too — not the muted-gray default) |
| Large text contrast | ≥ 3:1 |
| Body line length | 65ch default (65–75ch acceptable range) |
| Display clamp() max | ≤ 6rem (~96px) for product register. Brand-register statement heroes (type IS the hero, minimal imagery) may go to 8rem IF the heading passes the overflow test at every breakpoint |
| Display letter-spacing floor | ≥ -0.04em |
| Headings | `text-wrap: balance` on h1–h3; `text-wrap: pretty` on prose |
| Full-height sections | `min-h-[100dvh]`, never `h-screen` (iOS Safari jump) |
| Animation properties | transform + opacity only (blur/clip-path/mask allowed when material to the effect AND smooth) |
| Z-index | semantic scale only (dropdown → sticky → backdrop → modal → toast → tooltip); never raw 999/9999 literals in element styles — every layer resolves to a named token from the scale |

Font pairing: pair on a contrast axis (serif + sans, geometric + humanist) or use one family in multiple weights — never two similar-but-different sans. Reveal animations must enhance an already-visible default; never gate content visibility on a class-triggered transition (hidden tabs/headless renderers ship the section blank).

---

## 6. Content Realism (the "Jane Doe" effect)

Applies to every generated screen — placeholder content is design. **Truth outranks realism:** on a
shipping page, every name, number, client, quote and logo is real and sourced, or it is absent.
Realistic invented sample data is allowed only in visibly labelled demos and product-UI mockups
(e.g. "Sample data"), never presented as fact.

- **No generic names**: "John Doe", "Sarah Chen", "Jack Su". Real people with permission; in a labelled demo, specific plausible names.
- **No fake round numbers**: `99.99%`, `50%`, `1234567`. Real figures with a source; in a labelled demo, organic data.
- **No startup slop names**: "Acme", "Nexus", "SmartFlow". Real clients with permission, or a labelled fictional brand in a demo.
- **No filler copy**: "Elevate", "Seamless", "Unleash", "Next-Gen". Concrete verbs, real claims.
- **No egg avatars**: no generic SVG user icons for avatars — believable photo placeholders or deliberate styled initials.
- **Reliable image placeholders**: `https://picsum.photos/seed/{string}/800/600`, never Unsplash hotlinks.
- **Full interaction cycle in product UI**: loading (skeleton matching layout, not spinners), empty states (composed, showing how to populate), inline errors, tactile `:active` feedback (`scale-[0.98]`).

---

## 7. Resolved Conflicts (deliberate Scroll-Design-Forge stances)

Where the source skills disagree with Scroll-Design-Forge or each other, these stances win:

| Topic | Sources | Scroll-Design-Forge stance |
|---|---|---|
| Eyebrow kicker | `component-patterns.md` hero formula includes one; impeccable calls it the top AI tell | Allowed ONCE per site as a named brand system, if at all. Never per-section. The hero formula's eyebrow slot is optional and counts as the one. |
| Inter | v1 bans outright; typography-system allows as body | Keep: body-only, never display. |
| Custom cursor | Craft Checklist recommends; v1 bans | Register-gated: allowed on brand/campaign/portfolio sites (design IS the product); banned in product UI, dashboards, tools (design SERVES the product). |
| Serif fonts | v1 bans on dashboards | Adopted: serif display belongs to editorial/brand registers; product UI/dashboards use sans + mono pairings. |
| Framer Motion specifics | v1 is Framer-first | Concepts adopted (spring physics, stagger orchestration, layout transitions, perpetual micro-interactions); implementation stays GSAP per Animation Standards. Never mix GSAP and Framer Motion in one component tree. |
| Bans vs creative defaults (v5 merge, 2026-11-22) | Codex: make all bans advisory; Antigravity: keep them hard; owner chose the split | §2 Tier A hard, Tier B thesis-justified, listed exceptions never block. Every *other* style rule (centered copy, em dashes, repetition, familiar grammars, multiple accents) stays a creative default. |
| scroll-craft quotas (v5 merge) | Craft: 4+ device families, no repeats, 4-of-6 fingerprint gate, act-count band, largest-span peak, "no scroll cue" ban | Retired as rules. Pacing, peak and variety are judged on rendered evidence (`feel.md`, `uniqueness.md`). Repetition can establish identity. |
| Dimensional hero (v5 merge) | Craft: layered hero baseline; Forge: a quiet page can win | Brand-register heroes default to dimensional depth (`hero-depth.md`); a quiet hero needs a written thesis reason. Product register defaults quiet. |
| Motion stack (merge) | design-forge: GSAP + Lenis always; scroll-forge: ScrollCraft engine | Framework projects (Next/Astro/Vite) → GSAP + ScrollTrigger + Lenis. Standalone builds → ScrollCraft engine (`devices.md`), no GSAP/Lenis on the same page. Simple reveals → native CSS scroll-driven animation (`modern-css.md`) first. Never two scroll drivers on one element. |
| Count device vs hero-metric ban (merge) | engine `count` device animates numbers; §2.4 bans the hero-metric template | `count` is allowed for a real, sourced figure inside a narrative beat. Big-number + small-label + supporting-stats + gradient row is still BLOCK, animated or not. |
| Warm off-white advice (merge) | website-design-veteran recommended warm off-white bodies | Retired: it lands in the §2.8 cream band. Use chroma-0 off-white, a committed body color, or a dark brand mid-tone. |

The register question — *is design the product (marketing, landing, portfolio) or does design serve the product (app UI, dashboard, tool)?* — should be answered at Gate 0 and recorded in the contract; several rules above key off it.

---

## 8. Validator Integration

Add to the contract-validator run (BLOCK-level, check 3b — see `contract-validator.md`):

```
3b. Anti-slop scan
- §2 Tier A: BLOCK on any hit (respect the listed exceptions)
- §2 Tier B: BLOCK unless the contract records a thesis justification
- Taste dials §1: layout symmetry vs VARIANCE, card usage vs DENSITY, motion presence vs MOTION
- Content realism §6: scan copy for banned names/numbers/filler words
```

Log hits to `.scroll-design-forge/validator-log.md` like any other BLOCK. Two consecutive BLOCKs for the same tell → tighten the Stitch prompt's EXPLICIT EXCLUSIONS with that tell named verbatim.

## 9. The Final Test

If someone could look at the interface and say "AI made that" without doubt, it failed — regardless of how well it matches the contract. Contract compliance is necessary; taste is what this file adds.
