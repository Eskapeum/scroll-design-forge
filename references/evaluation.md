# Independent evaluation

Use for substantial creative work, a significant skill revision, or an explicit
review. Keep implementation, runtime verification, and independent assessment
as separate passes with separate evidence.

## 1. Blind artifact review

Give a separate reviewer the artifact identity/URL, target device constraints,
and only the raw content they need. Do not provide the author's intended
emotional curve, proposed conclusion, self-rating, or explanation of the
signature before the first pass.

Ask the reviewer to inspect desktop and phone views, then report:

1. What is offered, and who appears to be the audience?
2. What evidence supports the main claim? What appears to be sample or invented?
3. What can a visitor do next, and can they find and operate it?
4. Which moment or composition is most distinctive, and why?
5. Where is content confusing, hard to read, inaccessible, slow, or unnecessary?

Each finding needs an observed state, screenshot, selector, or reproduction
step. A screenshot-only reviewer must not claim keyboard, decoder, or real
phone behavior. Keep the runtime harness report separate; a reviewer cannot
approve away a failed technical check.

After recording this first pass, disclose the brief and compare observations
to its purpose. Resolve discrepancies with evidence. A finding may justify
changing the artifact, clarifying an assumption, or revising an approved intent;
do not force observations to match the original hypothesis.

An agent's account is not proof that visitors felt awe, trust, or delight.
User emotion, recall, task completion, and conversion need appropriately
collected human evidence. If no independent reviewer is available, label the
author's inspection as self-review and report independent assessment missing.

## 2. Skill regression briefs

[../evals/briefs.json](../evals/briefs.json) contains plan-level cases for
checking the skill's decisions without paid generations or production writes.
These cases test behavior, not exact phrases or headings.

For each case:

1. Start an independent context with the current skill and only the case's
   `request`, `context`, and `allowedActions`.
2. Ask for the requested plan, diagnosis approach, or review approach in the
   response. Do not reveal `reviewerChecks` or `failureConditions`.
3. Do not run generation, deployment, account operations, dependency installs,
   live form submissions, or project/registry writes. Fictional case context
   is benchmark input, not a claim about the local machine.
4. Save the complete response in a test-only temporary directory if a record
   is needed; keep fixture output outside user projects.
5. A separate reviewer compares that response to the withheld checks. Quote
   concrete plan decisions and explain failures. Missing decisions are
   incomplete, not silently inferred.
6. Compare the previous and revised skill on the same cases when possible.
   Record skill version/content hash, case ID, response, verdict, and evidence.

A plan-level pass does not prove that generated pages work or look good.
Use the engine/harness regression fixtures and blind artifact review for those.
Do not claim a case was executed merely because its JSON parsed.

### Local regression suites

Run from the skill directory after engine, tooling or generation-pipeline edits:

```bash
node scripts/doctor.mjs --mode verify
node scripts/doctor.mjs --mode encode
node --test tests/*.test.mjs
```

Use an already installed Playwright package; if it is outside normal module
resolution, set `SCROLLFORGE_PLAYWRIGHT_ROOT` to the package's containing project.
`SCROLLCRAFT_CHROME`, `SCROLLCRAFT_FFMPEG` and `SCROLLCRAFT_FFPROBE` can select
existing executables. Missing dependencies are not permission to install them.

The suites use temporary fixtures, local HTTP servers, a real desktop browser,
synthetic media and a stub generator. They make no paid generation requests and
do not modify production builds. Report actual passed/failed/skipped counts;
these fixtures do not replace checking the delivered page or a physical phone.

## 3. Verdicts and release criteria

Use `PASS`, `FAIL`, or `INCOMPLETE` per case/check. A material scope violation,
invented factual claim, unauthorized expense, concealed media substitution,
or dependence on inaccessible essential content is a failure regardless of
creative quality. Missing raw artifacts, unsupported capabilities, or unrun
checks are incomplete when they prevent a conclusion.

For a substantial skill revision, exercise contrasting routes and constraints:
a new expressive page, a quiet/limited-budget page, an existing-page refinement,
a targeted repair, review-only work, repeated same-brand grammar, and a
continuous journey. Include surprising cases rather than optimizing for one
expected wording.

Evaluate the plans on:

- Correct route and preservation of scope.
- Missing-only clarification and truthful handling of assumptions.
- Appropriate concepts and risk prototype before costly production.
- Subject-specific decisions and justified reuse.
- Real-asset and capability awareness, spending/stop conditions.
- Static, phone, keyboard, reduced-motion, and failure-state plans.
- Honest evidence and independent-review limits.

Run repeated trials for consequential or previously flaky decisions when
practical. Report the number of trials, failures, and unexecuted cases.
Do not turn benchmark scores into claims about real visitor response.
