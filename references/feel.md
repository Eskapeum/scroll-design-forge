# Impression and pacing

Use for narrative design, not as a mandatory stage of a targeted repair.
Intended emotion is a design hypothesis. An agent can assess observable
composition and clarity; it cannot establish what real visitors felt.

## 1. Start with purpose

The journey describes what visitors need to understand and do. Intended
impressions support that journey; they never override truthful content,
comprehension, accessibility, or a clear action.

A useful score connects content to its delivery:

| Visitor need | Intended impression | Observable design cause |
|---|---|---|
| Understand what the product combines | Clarity | Real ingredients shown next to the finished product |
| Inspect evidence | Confidence | Legible source-linked claims and an operable comparison |
| Choose the right variant | Ease | Consistent labels and direct links, available without motion |

Treat words such as delight, trust, or awe as intentions, not measured outcomes.
Two adjacent sections can have the same intention if both carry useful content.
Do not delete specifications, evidence, or necessary context to manufacture an
emotional contrast.

## 2. A memorable moment, when it helps

A substantial expressive page often benefits from one memorable or proof
moment. Describe the before and after, why it belongs to this subject, and what
visitors understand from it. A simple demonstration can be stronger than a
large visual effect.

For example: a process diagram resolves into the actual finished object, or
changing a real input makes a software result understandable. These are not
requirements for every page; a concise catalog or repair may need no peak.

Allocate attention and budget where they improve the brief. The memorable
moment need not occupy the most scroll distance, be the largest visual change,
or use the only clip. A short reveal, readable static comparison, or quiet
ending may do the job better. Multiple useful highlights are not automatically
a defect.

Prototype the highest-risk behavior early. If its desktop version carries the
meaning but touch, static, or reduced-motion visitors cannot understand it,
redesign the delivery before producing the full asset set.

## 3. Pacing earns its distance

Scroll distance is not time: visitors move at different speeds, use keyboards,
jump through navigation, or disable motion. Do not assume that a long span
guarantees reading or that every visitor experiences the entire sequence.

- Let readers reach essential information without a forced performance.
- Hold a state when inspection benefits; use ordinary flow for text that needs
  natural reading. Avoid delaying a CTA solely to create drama.
- Repetition can establish comparison or rhythm. Variation should have a reason.
- Author quiet intervals deliberately, document their bounds and purpose, and
  test whether they look like failed loading. They do not excuse missing copy
  or frozen expected media.
- Evaluate fast, slow, reverse, and interrupted scrolling, not only one
  choreographed recording.
- For a continuous camera, test the perceived pace across encoded leg
  boundaries; any intentional speed change needs smooth handoffs.

Length follows the content and measured usability. There is no universal act
count or viewport-height budget. Record actual travel and justify unusually
long holds. In descriptions, say "viewport-heights" for multiples of a viewport;
CSS `1vh` is only one percent of viewport height.

## 4. Participation without obstructing use

Optional pointer, dwell, or velocity effects can make an experience responsive,
but meaning and essential controls must survive without them.

Examples include subtle environmental parallax, an optional annotation on
inspection, or a route trace that also provides real navigation. If the effect
is decorative, disable it for reduced motion; if it conveys information,
provide a stable equivalent. Gate hover-only behavior to fine pointers without
removing access to information on touch.

Avoid effects that make reading harder as visitors scroll faster, and avoid
surprising motion that cannot be disabled. A novel close gesture is not a
replacement for a recognizable link, button, or form.

## 5. Resolve the ending

The page should end with useful content still visible and an understandable
next step, if the task calls for one. A footer, plain link, conventional button,
or completed comparison can all be valid endings. The important property is
resolution and usability, not a prescribed composition.

Test the exact bottom position, keyboard arrival, reverse scroll, and direct
navigation. Never rely on an exit fade that makes the final content or CTA
disappear. Retain essential legal, contact, or supporting information.

## 6. Independent assessment

Use [evaluation.md](evaluation.md) after runtime verification. A separate
reviewer first inspects the artifact without the intended curve. Ask what is
offered, what evidence exists, what action is available, what moment stands out,
and where reading or interaction becomes difficult.

Then compare those observations to the intended journey. A mismatch may expose
an implementation failure, an unclear brief, or an unsupported assumption; it
does not prove the page or brief is automatically wrong. Resolve it with
evidence and record a changed intention explicitly.

The author's own inspection is useful, but it is not a blind review. If an
independent pass is unavailable, say so. Do not write a fabricated "felt curve",
assert a visitor emotion, or claim improved conversion without real user data.
