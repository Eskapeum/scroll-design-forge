# Structure and distinctiveness

Read for new creative work or a substantial redesign, not automatically for a
repair. Distinctiveness is useful when it expresses the subject. It does not
outrank comprehension, accessibility, brand recognition, or user intent.

## 1. Separate the design decisions

- **Journey:** what visitors need to understand and do.
- **Grammar:** how the page organizes content and navigation.
- **World:** the visual medium, material, palette, and imagery.
- **Motion:** how changes connect states and support inspection.
- **Impression:** a hypothesis about how those choices may be received.

A new palette alone may leave two pages compositionally indistinguishable.
Conversely, retaining a grammar within one brand can improve consistency.
Compare rendered work, not just names in a table.

## 2. Grammars are starting points

Choose the organizing logic that fits the content. The examples below describe
defaults, not mutually exclusive rule sets. Combine them deliberately when the
result has a clear reading order and coherent interaction model. A documented
variant does not need to pass an exception ritual.

| Grammar | Fits | Useful starting treatment | Main risk to test |
|---|---|---|---|
| Filmic sequence | A linear argument or product reveal | Scene-led opening, purposeful transitions, clear arrival | Long holds can delay comprehension or the action |
| Chaptered editorial | Research, method, founder story, substantial prose | Contents/folio, readable spreads, media with captions | Motion or oversized type can interrupt reading |
| Live surface | Software or a tool best explained by use | Operable demo, sample-data disclosure, functional controls | A simulated surface may be mistaken for a real service |
| Continuous world | A journey where place or spatial progression matters | One enhanced world stage with waypoints | Media cost, seams, decoder performance, inaccessible hidden copy |
| Typographic poster | A strong verbal identity or limited media | Type scale, rhythm, selective transitions | Cropped words, unstable layout, unreadable zoomed/mobile type |
| Gallery / catalog | A collection or range | Consistent factual labels, index, comparable objects | Horizontal movement can hide labels or obstruct browsing |
| Split stage | A meaningful comparison | Matched states, persistent labels, explicit resolution | Phone columns may become too narrow or imply an unsupported winner |
| Rhythmic cutlist | An energetic sequence or event | Short scenes, clear cuts, quickly legible content | Visitors may outrun copy or encounter excessive flashing |

Navigation, hero, and close are separate usability decisions within each grammar.
A filmic page may have jump links. An editorial page may have a CTA button. A
cutlist may use one justified hold. No grammar prohibits an accessible means of
reaching content or completing the task.

**Conditional technical contract:** if using the bundled engine's worldflight
mode, its enhanced state uses the fixed-stage/track model in
[worldflight.md](worldflight.md); do not pretend stacked pinned acts are that
mode. The no-JavaScript and reduced-motion versions may be ordinary readable
flow. Another architecture needs its own proven contract, not the same label.

## 3. Explore concepts before producing assets

For substantial new creative work, sketch two or three meaningfully different
visual concepts with the opening, transition, proof/memorable moment, and close.
Include a phone view. Use supplied imagery, local HTML, or rough storyboards;
do not buy complete asset sets to find out whether the concept works.

Compare:

- Fit to audience, content, brand, and desired action.
- Clarity of the first screen and the available next step.
- Composition, type hierarchy, imagery, pacing, and interaction as rendered.
- Mobile/static feasibility, performance, and implementation risk.
- Cost and rights implications.

A concept needs more than a new name or palette. Explain what the subject makes
possible: assembling real ingredients, comparing an actual workflow, following
a meaningful route, inspecting a material. Honor an already approved direction
and explore only what remains open.

Prototype the riskiest proposed behavior before expanding the asset set. The
prototype can use placeholders, but labels must make its status clear. Test
meaning, touch, keyboard, reduced motion, and a failure state at that stage.

## 4. A signature is optional and subject-specific

A signature moment can be a composition, an unusually clear demonstration, an
interaction, or a well-timed reveal. It need not require bespoke code and need
not be globally unprecedented.

Examples of a meaningful connection:

- A material supplier lets visitors compare the same object in actual finishes.
- A process page assembles a diagram from verified stages.
- A software demo links a trace to the log entries that explain it.
- A route page keeps the current place understandable while the camera moves.

A novelty for its own sake adds implementation risk without necessarily adding
meaning. A familiar interaction well suited to the subject can outperform an
invented control. Do not make users discover a novel gesture just to buy,
contact, navigate, or read. Keep essential meaning on touch and static paths.

## 5. Similarity review, not a quota gate

The workspace registry is `<workspace>/FINGERPRINTS.md`, resolved with
`node <skill>/scripts/workspace.mjs`. Read it if it exists and is relevant.
An absent registry is not a blocker. A review does not create one.

Select comparators by scope:

- **Same brand, new version:** preserve recognizable patterns unless a redesign
  is requested. Compare whether the requested improvement actually happened.
- **Same campaign or site family:** shared grammar and controls may be required.
- **Unrelated brands in recent work:** inspect for accidental reuse of a full
  composition or sequence where the subject deserved a different treatment.
- **Historical examples:** optional inspiration, not restrictions.

Record observations across composition, typography, imagery, sequence/pacing,
and interaction/navigation. Grammar, nav, hero, and close are correlated;
do not count them as independent points or declare novelty from a label change.

Use a concise comparison note:

| Comparator and reason | Observed overlap | Difference relevant to this brief | Decision |
|---|---|---|---|
| Previous version of this brand | Same catalog and checkout structure | Labels now remain readable on phones | Keep intentional reuse |
| Recent unrelated campaign | Nearly identical hero, pacing, and end frame | Only palette differs | Explore a more subject-specific direction |

Separate **brand fit** from **distinctiveness**. A high-similarity warning
requires a reasoned choice, not automatic rejection. Never falsify old entries
to improve the comparison. Add versioned entries after completed builds and
record reuse candidly. Do not claim a grammar, page length, palette, or device
has become unavailable because someone used it.

## 6. Range with coherence

Minimal, dense, editorial, playful, maximalist, brutalist, retro, photographic,
illustrated, or other approaches are available when appropriate. Multi-hue
palettes and repeated layouts can be coherent systems. System fonts or familiar
typefaces are valid choices.

The stable requirements are truthful content, hierarchy, legibility, usable
interaction, and tested performance. [taste.md](taste.md) provides a practical
floor; it does not reduce every family to dark backgrounds and one accent.
