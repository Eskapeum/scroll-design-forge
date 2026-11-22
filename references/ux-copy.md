# UX Copy — Microcopy Standards

Load at Stage 4 (copy pass on the winning design). Content is 10% of the Awwwards score but bad copy drags Design and Usability with it. `anti-slop.md` §6 bans the filler ("Elevate", "Seamless", "Unleash", "Next-Gen"); this file is the positive side: what to write instead. For a deep interactive copy overhaul, baton-pass to `/impeccable clarify`.

## 1. Voice vs. Tone

Voice is constant (from the contract's archetype + adjectives); tone adapts to the user's emotional moment:

| Moment | Tone | Example |
|---|---|---|
| Success | Brief, warm, out of the way | "Saved." — not "Congratulations! Your changes have been successfully saved!" |
| Error (user-fixable) | Calm, specific, blame-free | "That card has expired — try another." |
| Error (our fault) | Own it, one apology, action | "Something broke on our end. Your draft is safe — retry?" |
| Destructive confirm | Sober, concrete | "Delete 'Q3 Report'? This can't be undone." |
| Empty/first-run | Orienting, lightly encouraging | "Connect your first account to see cash flow here." |
| Waiting | Narrate progress, no fake cheer | "Analyzing 1,204 transactions…" |
| Marketing/hero | The brand voice at full strength | Concrete claim + specific number beats adjectives |

## 2. Buttons & CTAs

- **Formula: verb + specific object.** "Start free trial", "Export CSV", "Invite your team" — never "Submit", "Click here", "Learn more" (as primary), "Get started" (alone, everywhere).
- The label answers "what happens when I click?" precisely. Dialog buttons repeat the action ("Delete report" / "Keep it"), never "Yes"/"No"/"OK".
- One primary verb per screen. Secondary CTAs de-escalate commitment ("See how it works").
- Marketing CTAs: reduce risk in the microcopy under the button ("Free 14 days · no card"), not inside the label.

## 3. Errors — the 3-part template

**What happened + why (if known) + what to do next.** One sentence each, plain language:

- ✗ "Error 422: Unprocessable entity"
- ✗ "Invalid input"
- ✓ "That email's already registered — sign in instead, or use another address."

Rules: never blame ("you entered an invalid…" → "that doesn't look like a…"), never dead-end (every error names an exit), never jargon (codes go in a collapsible detail, not the headline), preserve the user's input.

## 4. Forms

- **Label above input** (never placeholder-as-label — it vanishes on focus and fails a11y).
- Helper text before the mistake ("8+ characters, one number") beats error text after it.
- Error text below the input, in the error color, referencing the fix.
- Optional fields marked "(optional)" — never mark required with only an asterisk-and-hope.
- Ask in the order humans expect (name → email → the hard question last).

## 5. Empty states & onboarding copy

Structure: **what this space is → why it's valuable → the one action that fills it.** Max 2 sentences + 1 button. First-run copy speaks to outcome ("See where your money goes"), not feature ("Transaction categorization engine").

## 6. Headlines & marketing copy (brand register)

- Benefit-first, 8 words max, concrete over clever: a number, a named outcome, a real object.
- Subheadline does the "how" in ≤ 25 words.
- Section headings are scannable claims, not labels: "Close the books in a day" beats "Features".
- Social proof copy: real-sounding specifics per content realism (`anti-slop.md` §6) — "12,417 finance teams" not "thousands of happy customers".

## 7. Accessibility & translation

- Link/button text meaningful out of context (screen readers list them): "Download 2026 report", never "click here".
- Alt text describes function in context, not pixels ("Revenue trend, up 23% since March").
- Sentence case everywhere (Title Case Is Slower To Read and translates worse).
- Full sentences per string; no concatenated fragments around variables (see `hardening.md` §4).

## 8. Gate 4 Copy Check

```
COPY: {n} strings reviewed
- Buttons: verb+object, no "Submit"/"Learn more" primaries {PASS/FAIL}
- Errors: 3-part template, no codes-as-headlines {PASS/FAIL}
- Empty states: what/why/action structure {PASS/FAIL}
- Filler scan (anti-slop §6): {0 hits required}
- Voice: consistent with contract archetype {PASS/FAIL}
```
