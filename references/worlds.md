# Art direction and asset cohesion

Use when selecting or producing imagery. Start with the brand's real assets,
the page's purpose, and the chosen composition. There is no universal dark
photographic house style.

## Select the medium deliberately

Photography is often useful for showing an actual product, person, or place.
Use genuine assets for factual evidence; generated documentary-looking imagery
must not imply that invented customers, facilities, or outcomes are real.

Illustration, diagrams, physical miniatures, collage, typography, 3D, and clay
can also fit a brief. They do not require a pre-existing illustrated brand.
Make the reason subject-specific and label representations when users could
mistake them for evidence. Avoid a generic diorama merely because it is easy
to generate, just as you would avoid generic stock photography.

## Starting directions

These are editable starting points, not genre restrictions or default prompts.

| Direction | Useful qualities | Example prompt fragment |
|---|---|---|
| Low-key photographic | Material, controlled light, selective detail | One soft side key, deep neutral shadows, visible material grain |
| High-key editorial | Air, shape, measured contrast | Large overhead soft source, pale seamless ground, gentle contact shadow |
| Natural documentary | Real context and imperfect detail | Available light, honest surfaces, natural color, candid framing |
| Hard-light graphic | Color, geometry, strong shadow | Undiffused source, crisp shadow as a shape, saturated ground |
| Macro texture | Close inspection of actual material | Narrow focus plane, grazing light, surface detail at useful scale |
| Architectural | Place, scale, structure | Corrected verticals, raking light, deliberate negative space |
| Nocturne | Practical light and reflection | Night setting, motivated light sources, controlled reflections |
| Technical diagram | Explain structure or relationships | Consistent line weight, orthographic parts, real labels in markup |
| Illustrated / handmade | Expressive simplification or tactile character | A defined drawing/material language matched across objects |
| Typographic / collage | Verbal identity or authored juxtaposition | Real text with a deliberate material or photographic counterpoint |

For a handmade miniature, specify actual materials and scale cues if that is
the intended visual truth. For clay or papercraft, describe the texture and
construction rather than relying on a style label alone. For a diagram,
verify geometry and labels against the actual system.

## Shared direction and shot plans

Write a shared style preamble for a generated set, reuse it consistently, and
version deliberate changes. Useful fields are:

1. Medium, perspective, and lens/scale when applicable.
2. Lighting direction and quality.
3. Palette/grade and material behavior.
4. Texture and degree of realism.
5. Specific exclusions needed for this brief.

Do not assume repeating a prompt guarantees cohesion. Supplied and generated
assets may be combined when the set works visually and their provenance is
clear. Inspect all outputs together before use.

Each shot plan identifies its role, subject, aspect ratio, crop, and text-safe
space when copy overlays media. For example: "subject low and right, calm
negative space upper-left." Phone and desktop crops may require different
compositions. If no text overlays the image, do not waste the composition
reserving a nonexistent copy block.

Keep essential text, labels, logos, and claims in semantic markup or approved
assets rather than generated pixels. If product packaging must be visible,
use approved reference imagery and inspect identity and details in every shot.
Use the actual available tool's reference-image interface; flags differ.

## Asset review before production

Check:

- Product identity, geometry, labeling, and factual implications.
- Consistent or intentionally varied light, grade, materials, and scale.
- Composition with the real copy at desktop and phone dimensions.
- Text/background contrast throughout any planned camera movement.
- Whether the strongest asset actually supports the central message.
- Static poster quality and how failure/reduced-motion versions remain useful.

Cohesion can be achieved by careful selection, grading, re-composition, or
regeneration. Do not automatically buy a reroll when a nondestructive edit
would suffice; do not damage factual product colors to force a grade.

For generation and encoding, use [assets.md](assets.md). Keep originals.
Budget for approved variants and retries before running them. Inspect every
asset that ships; a failed generation or seam gate is a reason to stop the
dependent chain, not to spend more blindly.

## Transparent miniature assets

If a scene needs a transparent background, `scripts/knockout.py` can
flood-fill a uniform border-connected background, preserving interior colors.
Inspect edges and contact shadows; a similar-colored subject near the border
can still be damaged. It writes `<name>.rgba.png` next to each input.

```bash
python3 <skill>/scripts/knockout.py <scene.png>
```

Keep the opaque original for posters or video models whose input contract
does not support alpha. Run this only on authorized local working assets,
and use the selected tool's input requirements rather than assuming every
video provider treats transparency the same way.

## Light and dark grounds

Tune text, scrims, edge highlights, and shadow colors for the actual ground.
A light ground may need a light text panel behind dark text; a dark ground
may need a localized dark scrim. Neither direction is automatic.

Restate computed text color when changing ink tokens on a subtree, as described
in [taste.md](taste.md). Verify the composed foreground/background pairing over
all relevant frames. Automated contrast estimates can be incomplete for
complex compositing; do not treat a green heuristic as proof.
