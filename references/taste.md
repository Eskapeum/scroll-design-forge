# Visual and interaction quality

Read when implementing or assessing presentation. Evaluate the rendered result,
including failure states. Brand direction can override stylistic defaults;
truthful content, legibility, usability, and meaningful fallbacks remain required.

**The 12 absolute bans in [anti-slop.md](anti-slop.md) §2 are hard and outrank
everything in this file** (pure `#000000`, the cream/sand body band, gradient
text, AI-purple/neon glow, decorative glass, eyebrow kickers per section,
01/02/03 scaffolding, side-stripe accents, identical card grids, hero-metric
template, text overflow, emoji UI). Where this file says a choice "can be
deliberate", it means within those bans.

## Structure and hierarchy

Use spacing, alignment, size, and contrast to make the main message and action
findable. Group by proximity before adding a container. Repeated cards or
columns are valid when their repeated schema helps comparison; asymmetry is
not inherently better.

Start with the engine's spacing and gutter tokens or the existing design
system. Adjust optically for the actual type and imagery. Phone layouts need
their own spacing, not desktop padding compressed into a narrow width.

Keep document order coherent. Visual reordering must not make keyboard and
screen-reader navigation tell a different story. A headline or control that
overflows is a defect, not expressive typography.

## Typography

Use the brand's available, licensed fonts, or choose a small coherent set.
Two families are often sufficient, not a hard maximum. Familiar fonts, serifs,
system stacks, italic contrast, and punctuation are not prohibited.

Tune tracking, line height, measure, and weight on the render. Body measures
around 45–75 characters can be a useful starting range, but language, font,
zoom, and context matter. Wide lines generally need more leading. Large display
type needs explicit phone and long-word testing.

Use fluid sizing with bounds that fit the minimum supported width. Test real
copy at 200% zoom and reflow near 320 CSS pixels, including long headings and
localized CTA labels. Do not hide overflow to conceal clipped text. Essential
words remain actual selectable, translatable text, not pixels in generated art.

## Color

Give colors semantic roles: canvas, surface, primary/secondary ink, action,
status, and any brand-specific roles. The engine's six base tokens are a
starting system, not a one-accent limit. Multiple hues, off-black, gray, and
layered gradients can be deliberate brand choices (not pure black, the cream
band, neon glow, or gradient text — see the bans above).

Do not communicate status with color alone. Check contrast for each actual
foreground/background pairing and state, including light/dark inversions and
bright/dark moving frames. Use body contrast of at least 4.5:1 and large text
of at least 3:1; essential control boundaries and state indicators should
remain distinguishable at 3:1. These checks alone do not prove full conformance.

A CSS token change does not necessarily recalculate an inherited computed color:

```css
.section--light {
  --sc-ink: #14110c;
  --sc-ink-soft: #4a443a;
  color: var(--sc-ink);
}
```

Restate the property where its token changes. Inspect the actual computed
foreground; do not assume a section's token names describe its rendered colors.

## Text over media and compositing

Prefer a clean text region, an image crop, or a localized scrim that preserves
useful image contrast. A broader overlay is legitimate if the direction needs
it; avoid darkening everything merely because copy placement was unplanned.

Use corner scrims for corner copy, a band for full-width phone copy, or a
separate text column when the image cannot support text reliably. Verify all
used anchors at the minimum phone width, including centered anchors.

Scrim/background opacity is composited through ancestors, gradients, filters,
and media. A single background-color value is not proof of effective contrast.
Treat automated estimates as heuristics when that stack cannot be resolved.
Inspect the darkest or brightest relevant frame according to the text color,
and sample transitions instead of steering them away from test positions.
Follow [verify.md](verify.md) for measurement limits and manual checks.

Retain image width and height attributes for stable aspect ratios. When CSS
changes dimensions, use a coherent pair such as `width: 100%; height: auto`,
or explicit frame dimensions with `object-fit: cover`. Reserving the wrong
height can push content offscreen despite an apparently correct width.

## Depth and surface

Choose depth only when it strengthens composition. Overlap, shadow, edge
light, texture, and relative scale are tools, not required ingredients.
A flat poster can be excellent. Grain, blur, or shadow should not compromise
contrast, create banding, or consume mobile performance for an invisible effect.

Keep related components consistent in radius, elevation, and interaction;
intentional differences should express different roles. Do not rewrite an
existing brand's system merely to evade a perceived template.

## Motion and the static baseline

Write readable semantic HTML first. Essential content and actions must work
with JavaScript blocked, initialization failed, media missing, reduced motion
enabled, or a pointer absent. Apply hiding/pinning only after the relevant
enhancement is ready; preserve a readable flow fallback.

Prefer `transform` and `opacity` for continuous motion; use `clip-path`
selectively and profile it. Avoid `transition: all` and layout-heavy
continuous animation. An exceptional technique needs measured justification,
not an aesthetic exemption from performance.

Keep UI feedback responsive. Short easing around 100–250ms is a useful starting
point; match the actual interaction and reduced-motion preference. Do not
require motion to reveal the focused control, complete a CTA, or learn a fact.

Reduced motion may mean no animation at all. Preserve meaning with stable
images, simultaneous content, or ordinary document flow. Hover motion belongs
behind `(hover: hover) and (pointer: fine)`; provide touch and keyboard access
to any associated information.

## Controls and content

- Use real links for navigation and buttons for actions, with useful names.
- Provide visible focus, a logical tab order, and reachable navigation.
- Invisible controls must not remain surprise tab stops. Revealed controls
  must remain visible when focused, or be excluded until safely available.
- Aim for comfortably spaced 44×44 CSS-pixel touch areas where practical.
  Test smaller inline links in context; do not make all prose links giant.
- Provide appropriate hover, focus, active, disabled, loading, and error states
  for each component. Do not invent meaningless disabled states for links.
- Match labels to the actual action and keep repeated intents recognizable.
  Do not force English-only one-line length limits on localized buttons.
- Label real forms, explain required fields, preserve entered values on error,
  and verify success/failure behavior without sending unauthorized submissions.
- Use supplied/verifiable facts. Label demos and sample data visibly. No
  fabricated testimonials, statistics, certifications, urgency, or logos.

## Mobile and performance budgets

Set budgets before production and measure the actual artifact. The single
budget table lives in [performance-and-craft.md](performance-and-craft.md) §1
(page-level limits plus the scroll/media rows: phone poster, video decoders,
scroll long tasks).

These are starting budgets, not universal standards or an automatic waiver.
Record deviations, rationale, measured impact, and any required approval.
A supplied heavy clip may need encoding, lazy loading, a smaller rendition,
or an explicitly agreed fallback. Do not quietly substitute a still.

If reporting Core Web Vitals, verify current definitions and thresholds from
official guidance. Separate laboratory measurements from real-user field data;
a local run cannot claim a production percentile or conversion improvement.

Test the actual target phone/browser when available: touch, orientation
changes, viewport chrome, memory pressure, and video behavior may differ from
desktop emulation. If unavailable, list those areas as unverified.

## Final visual pass

Inspect first screen, transitions, long content, all anchors, and final state
at desktop and phone sizes. Check hierarchy with detail blurred or reduced,
then read the real copy at normal size. A clean screenshot does not prove
keyboard, media, accessibility, or performance behavior; keep those checks
separate and report their evidence.
