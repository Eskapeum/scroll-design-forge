# Hardening — States, Edge Cases, i18n

Load at Stage 4 (alongside `performance-and-craft.md`). Gate 4 asks "all states covered?" — this file defines what "all states" means. An Awwwards-grade shipped screen has every state designed, not just the happy path Stitch renders.

## 1. The State Matrix

Every screen with data or interaction ships all applicable states. Design them at Stage 4, not during integration panic:

| State | Design requirement |
|---|---|
| **Ideal** | The Stitch/code-native output — the only state generation gives you for free |
| **Loading** | Skeletons matching final layout geometry (no generic spinners — anti-slop). Shimmer optional at MOTION ≥ 5. Operations > 3s get progress copy that names what's happening |
| **Empty — first use** | Composed moment, not a void: illustration or type moment + one sentence of orientation + the primary action that populates it. This is the user's actual first impression of a product |
| **Empty — cleared** | Lighter than first-use: confirmation tone ("All clear") + how to add more |
| **Empty — no results** | Echo the query, offer the escape (clear filters / broaden), never a dead end |
| **Empty — no permission** | Say who can grant access; never render a broken-looking blank |
| **Error — inline** | At the field/component that failed, in plain language, with the recovery action. Form errors below the input (labels above — see `ux-copy.md`) |
| **Error — page/section** | What failed + what survived + retry affordance. Never a raw error code alone |
| **Partial** | Some data loaded, some failed: render what's available, mark what isn't |
| **Offline/stale** | Timestamp what's shown; make refresh obvious |

Product register: every interactive component also needs its 7 interaction states — default, hover, focus-visible, active, disabled, selected, loading (`register-guide.md`).

## 2. Error Design by Class

| Class | UX treatment |
|---|---|
| Validation (4xx user-fixable) | Inline at the field, specific ("Card expired" not "Invalid input"), preserve everything the user typed |
| Auth (401/403) | Explain the boundary, route to sign-in/request-access; never lose their work |
| Not found (404) | On-brand page with navigation back into the site — a designed page, not a default |
| Server (5xx) | Apologize once, auto-retry with backoff where safe, show a manual retry, keep user data client-side |
| Network/offline | Detect and say so ("You're offline — changes saved locally"), don't blame the user |
| Timeout / long op | After 3s: progress narration; after ~10s: option to background or cancel |

Destructive actions: confirmation names the object ("Delete 'Q3 Report'?"), the consequence, and offers undo where feasible — undo beats confirm.

## 3. Extreme Input Matrix

Test the design (not just the code) against these before Gate 4 sign-off:

- **Long content**: 200-character names, 3-line headings in the nav, a paragraph pasted into a single-line field. Truncate with `text-overflow: ellipsis` + full value on hover/focus, or wrap deliberately — never overflow (anti-slop ban #11).
- **Short/missing content**: one item in the "grid", missing avatar (styled initials, never the egg icon), absent optional fields (collapse the row, don't show "null").
- **Numbers**: 0, negative, 7-digit, currency with decimals — do columns still align (tabular-nums)?
- **Emoji + CJK + RTL strings** inside user content: no layout breakage, no clipped glyphs.

## 4. i18n & RTL (design-time, even if launch is single-locale)

- **Expansion budget**: German/Finnish run +30–40% longer; buttons, tabs, and nav must tolerate it. Never design a button that's exactly as wide as its English label.
- **Logical properties**: `margin-inline-start`, `padding-inline`, `inset-inline-end` — not left/right — so RTL is a `dir="rtl"` flip, not a redesign.
- **Never concatenate copy fragments** around variables; use full templated sentences (translators need whole sentences).
- **Pluralization**: design for "1 item / 2 items / 0 items" as distinct strings.
- **Dates/numbers**: format per locale; don't bake "MM/DD/YYYY" into the design.
- Icons carry meaning across locales better than idioms; text in images is untranslatable — avoid.

## 5. Concurrency & Permissions (product register)

- Two tabs / two users editing: last-write-wins needs a "changed since you loaded" warning; optimistic UI needs visible rollback.
- Every feature has a no-permission rendering (see state matrix) — hide vs. disable is a decision, not an accident: disable + tooltip when discoverability matters, hide when it's noise.

## 6. Gate 4 Hardening Check

Append to the Gate 4 review:

```
HARDENING: {n}/{applicable} states designed
- Loading / empty(×4) / error(inline+page) / partial: {list what exists}
- Extreme input pass: long / missing / numeric / RTL-emoji {PASS/FAIL each}
- Expansion tolerance: buttons+nav survive +40% label length {PASS/FAIL}
Missing states are FLAG-level: ship-blocking for product register, callout for brand register.
```
