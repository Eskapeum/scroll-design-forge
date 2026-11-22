# The approved ten-site standard

Imported from scroll-craft (v5.0.0 merge). Read before planning a premium marketing site,
alongside [hero-depth.md](hero-depth.md). On 2026-09-04 a rebuilt ten-site collection was
approved by the owner after the first collection was rejected as generic, flat and poorly
branded. This is a standard of execution plus worked examples. The next site finds its own
spatial story, structure and useful interaction.

## 1. Establish the actual brand before art direction

Open supplied logos, type, product photography and brand guidelines before generating anything;
filenames are not proof of contents. For an existing product, inspect its current site and docs.
Record audience, offer, platforms, real destinations, and which facts remain uncertain. Never
invent testimonials, availability, pricing or dates.

Research references in the browser, including intermediate scroll states. For each: observed
behaviour, why it works, the principle to adapt. A list of URLs is not research.

## 2. Design the first viewport as a physical composition

Write a layer contract before generating assets:

| Plane | Asset and depth | Independent movement | Contact/occlusion rule |
|---|---|---|---|
| Far environment | Clean background plate | Smallest displacement | No duplicate extracted subject |
| Midground | Architecture, landscape, or a meaningful product surface | Moderate | Establishes scale and distance |
| Focal subject | Real product, alpha cutout, or rendered object | Deliberate travel/rotation | Stays on its support when grounded |
| Near foreground | Cutout, framing element, physical detail | Strongest | Frames the subject; preserves key copy |
| Atmosphere | Light, mist, dust, translucent material if appropriate | Slow, independent | Separation without washing out |
| Typography and controls | Semantic HTML | Stable or carefully staged | Headline and primary action readable |

Use only the planes the scene needs. Write the opening, midpoint and resolved exit in plain
language: scrolling should reveal a spatial relationship or advance the story. Unrelated floating
decorations do not become meaningful because their speeds differ. Fine-pointer response is additive;
never request pointer lock.

## 3. Choose the rendering method for the subject

- **HTML/CSS + genuine alpha imagery** for photographic planes, botanicals, framing, architecture.
- **Real 3D** when rotation, material response, shadows or a lighting control materially improve
  the experience, and only with an accurate model of the actual object or mark (not a primitive).
  WebGL needs exact desktop and phone posters rendered from the final scene, a tested no-WebGL path,
  offscreen pause, capped pixel density, and no permanent `preserveDrawingBuffer`.
- **Video** for authored footage or a shot that needs it, not as a default replacement for planes.
- **Scrub media** is chosen by measured budgets (duration, resolution, frame count, transfer size,
  decoded memory, target-device results): layered planes for heroes; image sequences or dense-GOP
  MP4 when their loading and decoding budgets are shown to work. Neither format guarantees smooth iOS.

Bespoke choreography lives in page code; the engine stays unchanged. For natural-flow (not pinned)
progress, don't divide by `elementHeight - viewportHeight` when they are equal (one-pixel jump);
map motion across an intentional visible interval.

## 4. Produce assets for compositing, then inspect

Specify full subject, camera, consistent light direction, clear silhouette and generous safe
margins; a cropped label or wheel cannot be repaired in CSS. Retain originals. Inspect alpha edges
over light and dark backgrounds and in the actual browser composite. A magenta plate needs keying
and spill removal. Group physically connected elements (a bicycle and its shadow). Paid generation
only through Gate P and the attempt journal (`assets.md`).

## 5. Make the whole page specific to its visitor

Plan the feeling curve, information order, navigation and ending before filling sections. **Give
the visitor agency tied to the offer: selected state carries into examples, exports or inquiries
instead of resetting at the CTA.**

| Approved site (anonymised) | Spatial encounter | Useful interaction or structural lesson |
|---|---|---|
| Online learning community | Independent ridges reveal a real community window | Learning route, labelled community proof, real membership paths |
| Canned coffee drink | A genuine can travels through coffee splash and beans | Lateral flavour collection carries the chosen can into launch interest |
| Voice-AI app | Lime/chrome voice elements resolve into order | Destination dock changes the example |
| Advisory firm | The architectural mark settles into its structure | Side navigation, service ledger, downloadable decision brief |
| Alpine retreat | The alpine landscape becomes the view through a room window | Day planner carries its selection into correspondence |
| Lighting design studio | A modelled pleated lamp responds to light | Object-index drawer, dimmer, collection desk |
| Marine science exhibit | A translucent specimen approaches and passes the viewer | Depth presets update a sourced light-zone model; notebook ending |
| Fragrance house | An amber bottle among botanical planes | Scent composition updates a persistent bookmark and final document |
| Bikepacking brand | A grounded bicycle against terrain and a near ledge | Terrain presets produce a ride dossier and export |
| Night venue | Curtains open behind a reflective record | Opt-in audio stays synchronised; the guest-list form is the invitation |

These are examples, not mandatory grammars. Compare a new build with relevant prior builds using
rendered evidence (`uniqueness.md`); a warning prompts judgment, not rejection. Short galleries,
editorial pages and working surfaces stay short; never add empty pinning or filler for length.

## 6. Art-direct and verify the phone scene separately

Check a typical phone and a compact 360×640. Recompose subject, type, foreground crop, travel and
duration. Keep complete silhouettes where they matter and the full heading. Check sticky-header
offsets and inherited desktop transforms (`rotate: 0deg`, valid units). Verify every intermediate
state; a good phone opening can end with the frame covering its copy. Keyboard focus through a
horizontal rail must bring the panel into view. Persistent trays must not cover form fields or the
submit action with the on-screen keyboard open.

## 7. Visual and functional evidence before delivery

1. Capture opening, several intermediate positions and the resolved hero exit on desktop and phone.
   Sample within each section. Read contact sheets and full-size problem frames.
2. Compare pointer-state screenshots; a changed transform is not proof that pixels changed.
3. Check reduced motion, no-WebGL posters, compact phones, keyboard entry, menus, drawers, reading order.
4. Console errors, failed requests, broken images, links, overflow, contrast on the composite.
   Automated checks supplement judgment; never exclude real copy to get green.
5. **Exercise the real controls and their consequences**: download contents, synchronised
   selections, validation, persisted inquiries, keyboard dialog closure. No false success. Test
   forms against isolated data.
6. No-JS form behaviour: a scripted form must not fall back to a GET that puts personal input in the URL.
7. Fix, rerun the affected checks, keep the original results and say which run supersedes which.
   Never reuse an earlier green verdict for a changed release.
8. **Open the final package at its intended root/base URL** and verify scripts, modules, fonts,
   imagery and server behaviour there. Use `shoot.mjs --visual-capture` (pointer-lock guard) only for pixel capture;
   functional tests run with normal pointer input.

Deliver the final reviewed files, not an earlier generator output (re-running a base builder can
silently discard refinements). Package only needed assets and licences; exclude keys, private
submissions and local databases. State which hosting or integrations remain unconfigured. An
inquiry saved for review is not an email sent, a paid order or a confirmed booking.
