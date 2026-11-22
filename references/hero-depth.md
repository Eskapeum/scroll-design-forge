# Hero depth and the first frame

Imported from scroll-craft (v5.0.0 merge). Load before planning any brand-register hero
or generating its assets. Read [approved-collection.md](approved-collection.md) with it.

## Standing preference (studio default)

For brand/marketing heroes, **dimensional layering is the default, not a polish pass.**
A beautiful full-screen photograph with one parallax transform and some text fades still
feels flat. Plan a memorable spatial relationship from the start.

- Applies to the **hero** of brand/marketing work, not every section.
- Product/app register (dashboards, tools) defaults to a quiet hero; no invented marketing scene.
- A quiet, typographic or static hero is allowed when the creative thesis says why, in writing
  (Experience section of the contract). Explicit user direction always wins.

## The first frame (scrollY = 0)

The owner wants effects that are **bold and obvious on first view**. Before any scroll, the
opening must already work:

- Visible spatial separation: occlusion, near/far planes, typography interacting with depth.
- The plain-language offer (what this is, for whom) is readable without scrolling.
- The primary action is visible.
- Any ambient motion or pointer response is additive; the still frame is complete on its own.

A flat poster that only becomes interesting after scrolling fails this standard.

## Plan the depth before generating assets

- Identify background, focal subject, foreground and any atmospheric layers. Name what moves
  independently, what overlaps, and what must stay physically connected.
- Give a clear payoff over a short scroll: the camera moves in, the headline recedes behind the
  subject, a second beat appears, the scene settles into the next section.
- Layering must change perceived depth. Stacked elements moving as one image are one plane. Use
  visibly different translation/scale rates, occlusion and near/far relationships.
- Keep the full headline readable. Do not sacrifice comprehension to prove a subject can cover text.

## Prepare real compositing assets

1. **Clean background plate** with the subject removed and the space behind it rebuilt, or the
   moving cutout exposes a duplicate person or a hole.
2. **Genuine alpha cutouts** of subject and foreground. Inspect the alpha channel; a checkerboard
   or white backdrop is not transparency.
3. Preserve framing, scale, light, colour and perspective. Separately generated layers need
   measured alignment.
4. **Shared contact points stay anchored** (person on the rock, product on its plinth). A shared
   translation plus a common contact pivot supports different layer scales without floating.
5. Inspect edges against contrasting backgrounds and through the motion: no matte halos, jagged
   edges, clipped fabric or seams. Keep originals; optimise delivery files without losing alpha.

Plate rebuilding or subject extraction that needs a paid tool goes through **Gate P**.

## Choreograph motion

- One coherent camera idea. Premium = controlled movement and timing, not motion everywhere —
  but **controlled is not timid**. On brand work the change must be unmistakable: a visible state
  change within the first ~150px of scroll, 20–40% differential travel between far and near planes,
  real occlusion, and scale pushes a viewer would notice without being told. If a still from the
  opening and a still from mid-hero look nearly the same, it is too subtle.
- Native sticky scrolling with independently transformed planes gives depth without WebGL or video.
- Copy and CTAs stay semantic HTML with deliberate layer order.
- Composited transforms/opacity, one shared progress value, rAF updates.
- Pointer response is optional and never the only way to experience the hero. Never capture or lock the cursor.
- Pause offscreen work. Reduced motion gets a complete static composition with no extra pinned space.
- **Atomic readiness:** keep the complete poster until every required layer has decoded, then
  switch in one step. If a layer never loads, the poster, proposition and CTA remain usable.

## Art-direct mobile separately

Adjust crop, subject position, contact pivot, type size, layer order, travel and scroll duration.
Type may sit above the subject on phones even when it passes behind it on desktop. Check
390×844 and a compact 360×640. No hidden headline, offscreen subject or horizontal overflow.

## Acceptance

Inspect the opening, an intermediate position, the hero exit, and the phone composition:

- Distinct layers visibly move at different rates (and `MOTION_TIMID` is not reported on declared bold devices).
- No duplicate subjects, holes, halos, floating contacts or seams.
- The opening headline is readable and scrolling changes what the visitor sees or understands.
- The scene resolves cleanly into the next section.
- Phone and motion-off states are complete and usable; assets load; controls work.

A passing build or unit test does not prove the effect is good. If visual verification could not
be performed, say so.

## Approved example: a fashion studio hero

On 2026-09-04 a single-image hero was judged premium but lacking layers. The approved revision had
separate mountains, rear clouds, the woman and red dress, volcanic ground and foreground mist;
different depth rates; a shared foot anchor; type behind the subject; a second scroll beat; and a
gallery-frame transition. It is an example, not a template.
