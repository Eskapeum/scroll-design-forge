import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { assessFonts, assessSamples, finalVerdict, motionMagnitude } from "../scripts/lib/verification.mjs";
import { captureState, mediaState } from "../scripts/lib/browser-verification.mjs";

const inventory = (extra = {}) => ({ cues: [], clips: [], rails: [], segs: [], ...extra });
const sample = (extra = {}) => ({ i: 0, y: 0, settled: true, cues: [], clips: [], rails: [], stages: [], segs: [], wipes: [], custom: [], contrast: [],
  viewport: { width: 1000, height: 800 }, ...extra });
const part = (extra = {}) => ({ x: 0, y: 0, scaleX: 1, scaleY: 1, width: 1000, height: 800,
  matrix: [1, 0, 0, 0, 1, 0, 0, 0, 1], clipPath: "none", ...extra });
const motion = (extra = {}) => ({ id: "motion-0", parts: [part(extra)] });
const motionAssessment = (last, reduced = false) => assessSamples({ vh: 800, reduced,
  inventory: inventory({ motion: [{ id: "motion-0" }] }),
  samples: [sample({ motion: [motion()] }), sample({ i: 1, y: 800, motion: [last] })] });

test("font fallback requires an unloaded declared family used by visible text", () => {
  const faces = [{ family: "display face", status: "error", weight: "400", style: "normal" },
    { family: "display face", status: "unloaded", weight: "700", style: "normal" },
    { family: "unused face", status: "error", weight: "400", style: "normal" }];
  const findings = assessFonts({ faces, used: [{ families: ["display face", "arial", "sans-serif"] }] });
  assert.equal(findings.length, 1);
  assert.equal(findings[0].code, "FONT_FALLBACK");
  assert.equal(findings[0].severity, "blocker");
  assert.equal(findings[0].family, "display face");
  assert.ok(findings[0].faces.length > 0);
  assert.equal(finalVerdict(findings), "FAIL");
});

test("loaded declared families and undeclared system families avoid false fallback failures", () => {
  const faces = [{ family: "loaded face", status: "loaded" }, { family: "unused face", status: "error" }];
  assert.deepEqual(assessFonts({ faces, used: [{ families: ["loaded face", "arial", "sans-serif"] }] }), []);
  assert.deepEqual(assessFonts({ faces, used: [{ families: ["arial"] }] }), []);
  assert.deepEqual(assessFonts({ faces, used: [] }), []);
});

test("an unloaded later fallback family does not fail text using a system family first", () => {
  const faces = [{ family: "unused", status: "unloaded", weight: "400", style: "normal" }];
  assert.deepEqual(assessFonts({ faces, used: [{ families: ["arial", "Unused"], weight: "400", style: "normal" }] }), []);
  const findings = assessFonts({ faces, used: [{ families: ["Unused", "arial"], weight: "400", style: "normal" }] });
  assert.equal(findings.length, 1);
  assert.equal(findings[0].code, "FONT_FALLBACK");
});

test("a loaded regular face cannot mask a failed bold face used by visible text", () => {
  const faces = [{ family: "display", status: "loaded", weight: "400", style: "normal" },
    { family: "display", status: "error", weight: "700", style: "normal" }];
  assert.deepEqual(assessFonts({ faces, used: [{ families: ["display"], weight: "400", style: "normal" }] }), []);
  const findings = assessFonts({ faces, used: [{ families: ["display"], weight: "700", style: "normal" }] });
  assert.equal(findings.length, 1);
  assert.equal(findings[0].code, "FONT_FALLBACK");
  assert.equal(findings[0].severity, "blocker");
});

test("ordinary document scrolling does not count as declared motion", () => {
  let documentTop = 0;
  const element = { offsetWidth: 1000, offsetHeight: 800, querySelectorAll: () => [],
    getAttribute: () => "motion-0", getBoundingClientRect: () => ({ x: 0, y: documentTop, width: 1000, height: 800 }) };
  const context = vm.createContext({ innerWidth: 1000, innerHeight: 800,
    document: { documentElement: { scrollWidth: 1000 }, querySelectorAll: (selector) => selector === "[data-sc-shot-motion]" ? [element] : [] },
    getComputedStyle: () => ({ transform: "none", clipPath: "none" }),
    DOMMatrixReadOnly: class {
      constructor() { Object.assign(this, { m11: 1, m12: 0, m13: 0, m21: 0, m22: 1, m23: 0, m31: 0, m32: 0, m33: 1, m41: 0, m42: 0 }); }
    },
  });
  const capture = () => JSON.parse(JSON.stringify(vm.runInContext(`(${captureState.toString()})()`, context)));
  const first = capture();
  documentTop = -800;
  const last = capture();
  assert.equal(motionMagnitude(first.motion[0], last.motion[0], first.viewport), 0);
  const result = assessSamples({ inventory: inventory({ motion: [{ id: "motion-0" }] }), vh: 800,
    samples: [sample(first), sample({ ...last, i: 1, y: 800 })] });
  assert.equal(result.findings.length, 1);
  assert.equal(result.findings[0].code, "MOTION_TIMID");
  assert.equal(result.findings[0].severity, "warn");
  assert.equal(finalVerdict(result.findings), "PASS");
});

test("small motion is diagnostic only while substantial translation, scale and clipping pass", () => {
  const timid = motionAssessment(motion({ x: 0.01 }));
  assert.equal(timid.findings[0].code, "MOTION_TIMID");
  assert.equal(timid.findings[0].severity, "warn");
  assert.equal(finalVerdict(timid.findings), "PASS");
  for (const state of [motion({ x: 0.1 }), motion({ scaleX: 1.2, scaleY: 1.2 }), motion({ clipPath: "inset(0% 0% 50% 0%)" })]) {
    assert.ok(motionMagnitude(motion(), state, { width: 1000, height: 800 }) >= 0.04);
    assert.ok(!motionAssessment(state).findings.some((finding) => finding.code === "MOTION_TIMID"));
  }
});

test("SVG-like descendants without offset dimensions do not poison motion measurements", () => {
  const state = motion({ width: undefined, height: undefined });
  assert.equal(motionMagnitude(state, state, { width: 1000, height: 800 }), 0);
  const result = assessSamples({ vh: 800, inventory: inventory({ motion: [{ id: "motion-0" }] }),
    samples: [sample({ motion: [state] }), sample({ i: 1, y: 800, motion: [state] })] });
  assert.equal(result.findings.length, 1);
  assert.equal(result.findings[0].code, "MOTION_TIMID");
  assert.equal(result.findings[0].severity, "warn");
  assert.ok(Number.isFinite(result.findings[0].magnitude));
});

test("reduced motion and a page without scroll travel skip timid-motion warnings", () => {
  assert.deepEqual(motionAssessment(motion(), true).findings, []);
  const result = assessSamples({ vh: 800, inventory: inventory({ motion: [{ id: "motion-0" }] }),
    samples: [sample({ motion: [motion()] }), sample({ i: 1, motion: [motion()] })] });
  assert.deepEqual(result.findings, []);
});

test("sequence mismatch and missing frame evidence fail even when video is settled", () => {
  for (const seq of [{ requested: 4, drawn: 3 }, { requested: 4, drawn: null }, { requested: undefined, drawn: undefined }]) {
    const result = assessSamples({ vh: 800, inventory: inventory(), samples: [sample({ sequences: [{ id: "sequence-0", visible: true, ...seq }] })] });
    assert.equal(result.findings[0].code, "SEQUENCE_STALLED");
    assert.equal(result.findings[0].severity, "blocker");
    assert.equal(finalVerdict(result.findings), "FAIL");
  }
});

test("only changed drawn frames prevent a sequence from being graded as dead scroll", () => {
  const pinned = [{ id: "stage", visible: true, pinned: true, top: 0 }];
  const first = sample({ stages: pinned, sequences: [{ id: "sequence-0", visible: true, requested: 0, drawn: 0 }] });
  const last = sample({ i: 1, y: 800, stages: pinned, sequences: [{ id: "sequence-0", visible: true, requested: 4, drawn: 4 }] });
  assert.deepEqual(assessSamples({ vh: 800, inventory: inventory(), samples: [first, last] }).findings, []);
  const stalled = { ...last, sequences: [{ id: "sequence-0", visible: true, requested: 4, drawn: 0 }] };
  const findings = assessSamples({ vh: 800, inventory: inventory(), samples: [first, stalled] }).findings;
  assert.ok(findings.some((finding) => finding.code === "SEQUENCE_STALLED"));
  assert.ok(findings.some((finding) => finding.code === "DEAD_SCROLL"));
});

test("offscreen sequence changes cannot mask a dead visible pin", () => {
  const pinned = [{ id: "stage", visible: true, pinned: true, top: 0 }];
  const first = sample({ stages: pinned, sequences: [{ id: "sequence-0", visible: false, requested: 0, drawn: 0 }] });
  const last = sample({ i: 1, y: 800, stages: pinned, sequences: [{ id: "sequence-0", visible: false, requested: 4, drawn: 4 }] });
  const findings = assessSamples({ vh: 800, inventory: inventory(), samples: [first, last] }).findings;
  assert.ok(findings.some((finding) => finding.code === "DEAD_SCROLL"));
});

test("media evidence reads active sequence requests and painted frames independently", () => {
  let top = 0, opacity = "1";
  const canvas = { parentElement: null, getBoundingClientRect: () => ({ left: 0, right: 500, top, bottom: top + 400, width: 500, height: 400 }) };
  const act = { live: true, seq: { requested: 5, drawn: 3, el: canvas } };
  const clip = { ready: true, cur: 0, target: 1, el: { seeking: false } };
  const context = vm.createContext({ window: { ScrollCraft: { instances: [{ acts: [act, { live: false, seq: { requested: 9, drawn: 1 } }], clips: [clip] }] } },
    innerWidth: 1000, innerHeight: 800,
    getComputedStyle: () => ({ display: "block", visibility: "visible", opacity }),
    document: { querySelectorAll: () => [] } });
  const read = () => JSON.parse(JSON.stringify(vm.runInContext(`(${mediaState.toString()})()`, context)));
  assert.deepEqual(read().sequences, [{ id: "sequence-0-0", requested: 5, drawn: 3, visible: true }]);
  assert.equal(read().arrived, false);
  clip.cur = 1;
  act.seq.drawn = 5;
  assert.equal(read().arrived, true);
  assert.deepEqual(read().sequences, [{ id: "sequence-0-0", requested: 5, drawn: 5, visible: true }]);
  top = 900;
  assert.equal(read().sequences[0].visible, false);
  top = 0;
  opacity = "0";
  assert.equal(read().sequences[0].visible, false);
});

test("document overflow and readable overflowing text are blockers", () => {
  const wideDocument = assessSamples({ vh: 800, inventory: inventory(), samples: [sample({ overflow: 150 })] });
  assert.ok(wideDocument.findings.some((finding) => finding.code === "TEXT_OVERFLOW" && finding.severity === "blocker"));
  const wideText = assessSamples({ vh: 800, inventory: inventory({ textSource: "visible-text", cues: [{ id: "cue", text: "Long text" }] }),
    samples: [sample({ cues: [{ id: "cue", visible: true, o: 1, overflow: true }], contrast: [{ id: "cue", status: "graded", worst: 21, threshold: 4.5 }] })] });
  assert.equal(wideText.findings.length, 1);
  assert.equal(wideText.findings[0].code, "TEXT_OVERFLOW");
  assert.equal(finalVerdict(wideText.findings), "FAIL");
});
