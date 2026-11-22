# Register Guide — Brand vs Product Rulebooks

Load at Stage 2, keyed off the contract's **Register** field. The register is the single highest-leverage classification in the contract: the same component obeys different laws on a landing page than in a dashboard. Mixed sites (marketing + app) switch registers per surface — the landing page runs brand rules even when the product is the point.

**The test:** does design carry the message (design IS the product — marketing, landing, campaign, portfolio, editorial) or does design carry the user's work (design SERVES the product — app UI, dashboard, tool, admin)?

## 1. Brand register (design IS the product)

The visitor gives you ~8 seconds; the design must *say something* before they read anything.

- **Typography**: expressive display faces earned here — loud serifs, variable-font kinetics, type-as-hero (`awwwards-2026.md` §2). Display ceiling 8rem (statement heroes, overflow-tested). Pair on a contrast axis.
- **Color**: Committed / Full palette / Drenched strategies live here. The category-reflex check matters most here — this register is where sameness dies.
- **Motion**: identity material. Entrance choreography, scroll storytelling, one signature easing motif. MOTION dial typically 5–8. Cinematic moments earn 600–900ms.
- **Layout**: asymmetry, broken grids, deliberate empty zones. VARIANCE typically 6–9.
- **Imagery**: art-directed or none — never generic stock (standing ban). Texture systems, collage, human-evidence elements (`awwwards-2026.md` §1).
- **Copy**: full brand voice; concrete claims with real numbers.
- **Permitted here (banned in product)**: custom cursor, spatial audio (opt-in), easter eggs, experimental navigation, drenched surfaces, WebGL-as-interface (immersion ladder tier 3).
- **Still banned**: everything in `anti-slop.md` §2 — expressiveness is not an exemption.

## 2. Product register (design SERVES the product)

The user came to finish a task; the design wins by disappearing. **Earned familiarity beats strangeness.**

- **Typography**: ONE family (+ mono for data), fixed-rem scale, tighter ratio (1.2 max). Display ceiling 6rem — realistically a product H1 is 1.5–2.5rem. Serif display banned (v1 stance, adopted); expressive faces read as noise over data.
- **Color**: Restrained strategy — tinted neutrals + one accent ≤ 10%. The real palette work is the **semantic state vocabulary**: distinct, systematic colors for hover / focus / active / selected / disabled / error / warning / success / info — defined as tokens at Stage 0.5, not improvised per component.
- **Motion**: state feedback, not decoration. Budget 150–250ms, ease-out, transform/opacity only. No entrance choreography on working screens; motion answers "did my action register?" MOTION dial typically 2–4.
- **Layout**: conventional nav patterns (users navigate from memory), 8px-grid regularity, alignment over surprise. VARIANCE typically 3–5. DENSITY follows the data — cockpit screens (D ≥ 7) drop cards entirely for `divide-y` rows + mono numerals.
- **Component completeness**: every interactive component ships 7 states — default, hover, focus-visible, active, disabled, selected, loading. A missing focus-visible state is a defect, not a style choice.
- **States & hardening**: the `hardening.md` state matrix is ship-blocking here (empty, loading, error, partial, permission).
- **Copy**: terse, functional, zero marketing voice inside the tool (see `ux-copy.md`).
- **Banned here (fine in brand)**: custom cursors, scroll hijacking, parallax on working surfaces, autoplaying motion, drenched backgrounds behind data, decorative glass over content, entrance stagger on every table.

## 3. Quick decision table

| Decision | Brand | Product |
|---|---|---|
| Display face | Expressive, contrast-paired | One family + mono |
| Type ceiling | 8rem (tested) | 6rem (realistically ≤ 2.5rem) |
| Color strategy | Committed → Drenched | Restrained + state vocabulary |
| Motion budget | 300–900ms, choreographed | 150–250ms, feedback-only |
| VARIANCE / MOTION typical | 6–9 / 5–8 | 3–5 / 2–4 |
| Navigation | May experiment | Conventional, memorized |
| Empty states | Rarely apply | Ship-blocking |
| Custom cursor / audio / easter eggs | Earned | Banned |
| Success metric | Feeling + conversion | Task completion speed |

## 4. Contract & validator hooks

- Stage 0 records the register (+ per-surface overrides for mixed sites: "marketing pages: brand; app: product").
- Dials calibrate per register (`intelligence.md` §6 stores separate priors).
- Validator: a brand-register move on a product surface (or vice versa) is the `wrong-register` reject code — check the table above before presenting, not after rejection.

## 5. Multi-offer studios (one identity, several disciplines)

A founder-led studio selling unlike services (software sprints, websites, photography, AI video)
reads as a freelancer menu when each offer gets its own equal card. Instead:

- Name the **one practice** that connects them (the thesis), and let each offer be a way of applying it.
- Lead with **proof, not categories**: one verified project at the first frame beats four service tiles.
- Let the visitor **compose** their need (select offers or "build something like this" from a project)
  and carry that selection into the inquiry, instead of choosing one box.
- Keep offer copy plain: what you get, how long, what it costs or how it is scoped. Real numbers only.
