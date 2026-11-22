# Quickstart — Your First Screen in 5 Minutes

A worked example: **luxury-fintech dashboard hero** for an imaginary product "Ledger".

## 0. Session intelligence + capability report

First invocation, no `.scroll-design-forge/`, no `~/.scroll-design-forge/` brain yet → situation report is one line ("fresh project, fresh brain, full discovery ahead"). Probe capabilities: Stitch MCP present? → `engine: stitch`. (Absent → `engine: code-native`; renderer and WebSearch fallbacks per SKILL.md's Capability Report.)

## 0b. State bootstrap

```
mkdir -p .scroll-design-forge/{contract,research,feedback,retro,init/brand-assets}
touch SITE.md DESIGN.md
```

`SITE.md` (minimal):
```yaml
---
project: ledger
version: 0.1
---

# Pages
- [ ] home :: landing :: convert-trial :: P0
- [ ] pricing :: marketing :: convert-paid :: P1
- [ ] dashboard :: product :: retain :: P2
```

## 1. Stage 0 — Discovery (3 questions, not 15)

DESIGN.md is empty and the brain is fresh → ask the minimum to produce a contract:

- Brand: *"Ledger is a private-banking-grade P&L tool for indie fund managers."*
- Three adjectives: *"sovereign, precise, quiet."*
- Anti-preferences: *"No neon. No '3D glass'. No stock photography."*

Derive the new contract fields:
- **Register:** product (design SERVES the tool) — but the landing page itself runs brand rules
- **Taste dials:** V6 · M4 · D5 (quiet + precise pulls VARIANCE and MOTION below default)
- **Color mode scene:** *"A fund manager at 11pm reviewing positions in a dim office"* → DARK, forced by the scene
- **Color strategy:** Committed (aged-gold carries the identity moments)

Map to preset: **Luxury** (dark + serif + high contrast + editorial whitespace).

Write `.scroll-design-forge/contract/v1.md` from the **canonical template in `discovery-framework.md` §6** (includes the version frontmatter), then point `contract/current.md` at it. Run the LEARN step: append the Gate 0 metrics row.

## 2. Stage 0.5 — Design System (one Stitch call)

```
create_design_system({
  preset: "LUXURY",
  colorMode: "DARK",
  customColor: "#C9A55A",      // aged-gold primary
  headlineFont: "PLAYFAIR_DISPLAY",
  bodyFont: "INTER",            // body only — never display (anti-slop stance)
  roundness: "ROUND_FOUR",
  colorVariant: "TONAL_SPOT",
  designMd: "<paste contract identity + hard constraints>"
})
```

Save the returned IDs (and the `engine` field) to `.scroll-design-forge/stitch.json`. (Code-native mode: skip the call; DESIGN.md tokens are the system of record.) Gate 0.5 APPROVE → write `contract/v2.md`, repoint `current.md`, LEARN row.

## 3. Stage 1 — Research (4 refs, 1 paragraph each)

Save to `.scroll-design-forge/research/home.md`:
```markdown
# Research: home
1. linear.app — green: restrained gradient stage, editorial spacing
2. mercury.com — green: serif display + mono numerical data pairing
3. arc.net — green: cinematic scroll reveal, yellow: too playful for us
4. studio.design (aspirational) — green: micro-type pairings, density

Saturation check (awwwards-2026 §7): none of the stolen patterns are commoditized moves.
Synthesis: editorial dark stage, aged-gold accent only on numbers,
serif display + mono numerals, one cinematic hero scroll reveal.
```

(No WebSearch? Degrade: reference library → the user's discovery references → logged skip.)

## 4. Stage 2 — Explore (one Stitch call with full contract)

Load `anti-slop.md` + `awwwards-2026.md`. Run the category-reflex check (*"fintech → navy+gold+serif" is the reflex; aged-gold-on-near-black with mono data is our subversion — pass*), pick the aesthetic lane (**dark-precision**), record it in the contract.

Use the **Contract Injection Template** in `SKILL.md` — it auto-includes the 12 anti-slop bans, content-realism rules, and the dials (V6/M4/D5). Output must match:
- primary `#C9A55A` (exact)
- fonts: Playfair Display (display) + Inter (body)
- zero neon, zero 3D glass, zero stock photos
- realistic placeholder data (`$2,847,203.18`, "Meridian Capital" — never "Acme", never `99.9%`)

Run the validator (see `contract-validator.md`, including check 3b anti-slop scan). Any BLOCK → regenerate before the user ever sees it. Gate 2 → LEARN row (with `prediction`/`prediction_hit`).

## 5. Stage 3 → 5 — Iterate / Refine / Integrate

**Every gate advance writes a NEW `contract/v{N+1}.md` and repoints `current.md` — never edit `current.md` in place.** Each gate ends with the LEARN step (inline checklist in SKILL.md).

When the user says `SHIP IT` at Gate 5:
1. Mark `home` complete in `SITE.md`
2. Append the SHIP IT metrics row (`shipped: true`, `contract_version`, `feedback_rounds_total`)
3. Write `feedback/home.md`
4. Announce next screen (`pricing`)

After 3 shipped screens: retro → `.scroll-design-forge/retro/{date}.md`, promotions to `~/.scroll-design-forge/`.

---

## Copy-paste skeleton

```
.scroll-design-forge/
├── contract/
│   ├── v1.md                 (frozen at Gate 0)
│   ├── v2.md                 (frozen at Gate 0.5)
│   └── current.md            -> v2.md  (symlink or pointer file)
├── research/
│   └── home.md
├── feedback/
│   └── home.md
├── retro/                    (first retro after 3 shipped screens)
├── stitch.json               ({"engine": "stitch", ...ids})
├── metrics.json              (JSONL, one row per gate — full 14-field schema)
├── validator-log.md
└── init/
    └── brand-assets/         (optional user-supplied)
```
