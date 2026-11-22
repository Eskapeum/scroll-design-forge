export function finalVerdict(findings) {
  if (findings.some((finding) => finding.severity === "blocker")) return "FAIL";
  return findings.some((finding) => finding.severity === "incomplete") ? "INCOMPLETE" : "PASS";
}

export function validateIdentity(expected, observed) {
  const findings = [];
  for (const field of ["buildId", "revision"]) {
    if (!expected[field]) {
      findings.push({ code: "IDENTITY_EXPECTATION_MISSING", severity: "incomplete", message: `Supply expected ${field} with --manifest or CLI.` });
      continue;
    }
    const values = [observed.meta?.[field], observed.headers?.[field]].filter(Boolean);
    if (!values.length) findings.push({ code: "IDENTITY_NOT_PUBLISHED", severity: "incomplete", message: `Page/response does not publish ${field}.` });
    else if (values.some((value) => value !== expected[field])) findings.push({ code: "IDENTITY_MISMATCH", severity: "blocker", message: `Expected ${field} ${expected[field]}; observed ${values.join(", ")}.` });
  }
  return findings;
}

export function visibleSignature(sample) {
  return JSON.stringify([
    sample.cues.filter((cue) => cue.visible && cue.o > 0.02).map((cue) => [cue.id, cue.o, cue.rect, cue.transform]),
    sample.clips.filter((clip) => clip.vis > 0.02 && clip.painted).map((clip) => [clip.id, clip.t]),
    sample.rails.filter((rail) => rail.visible).map((rail) => [rail.id, rail.x]),
    sample.wipes.filter((wipe) => wipe.visible),
    sample.stages.filter((stage) => stage.visible).map((stage) => [stage.id, stage.top]),
    sample.segs.filter((seg) => seg.visible && seg.op > 0.002).map((seg) => [seg.id, seg.op, seg.painted ? seg.t : null]),
    sample.custom.filter((state) => state.visible).map((state) => [state.id, state.value]),
    (sample.sequences || []).filter((seq) => seq.visible && seq.drawn >= 0).map((seq) => [seq.id, seq.drawn]),
  ]);
}

export function assessFonts({ faces, used }) {
  const families = [...new Set(used.flatMap((entry) => entry.families))];
  return families.flatMap((family) => {
    const declared = faces.filter((face) => face.family.toLowerCase() === family.toLowerCase());
    const usages = used.filter((entry) => entry.families.some((value) => value.toLowerCase() === family.toLowerCase()));
    // A later, still-unloaded fallback may never have been selected by font matching.
    if (!declared.length || (declared.every((face) => face.status === "unloaded") && !usages.some((entry) => entry.families[0].toLowerCase() === family.toLowerCase()))) return [];
    const failedUsedFace = declared.some((face) => face.status === "error" && usages.some((entry) => {
      const weights = (face.weight || 'normal').replace('normal', '400').replace('bold', '700').split(/\s+/).map(Number);
      const weight = Number(entry.weight);
      return (face.style || 'normal') === (entry.style || 'normal') && weight >= weights[0] && weight <= (weights[1] ?? weights[0]);
    }));
    if (declared.some((face) => face.status === "loaded") && !failedUsedFace) return [];
    return [{ code: "FONT_FALLBACK", severity: "blocker", family,
      message: `Visible text declares ${family}, but its required font face did not reach loaded status.`, faces: declared }];
  });
}

export function motionMagnitude(first, last, viewport) {
  let magnitude = 0;
  for (let i = 0; i < Math.min(first.parts.length, last.parts.length); i++) {
    const a = first.parts[i], b = last.parts[i];
    const size = Math.max(a.width || 0, a.height || 0, b.width || 0, b.height || 0) / Math.max(viewport.width, viewport.height);
    magnitude = Math.max(magnitude, Math.hypot(b.x - a.x, b.y - a.y),
      Math.abs(b.scaleX - a.scaleX) * size, Math.abs(b.scaleY - a.scaleY) * size,
      ...a.matrix.map((value, j) => Math.abs(value - b.matrix[j]) * size));
    if (a.clipPath === b.clipPath) continue;
    const values = (clip) => [...clip.matchAll(/(-?\d*\.?\d+)(%|px)?/g)].map((match) =>
      Number(match[1]) * (match[2] === '%' ? size / 100 : 1 / Math.max(viewport.width, viewport.height)));
    const av = values(a.clipPath), bv = values(b.clipPath);
    if (a.clipPath === 'none' && b.clipPath.startsWith('inset(')) av.push(...bv.map(() => 0));
    if (b.clipPath === 'none' && a.clipPath.startsWith('inset(')) bv.push(...av.map(() => 0));
    // Different shape types cannot be compared numerically; count them as a change.
    if (!av.length || av.length !== bv.length) magnitude = Math.max(magnitude, 1);
    else magnitude = Math.max(magnitude, ...av.map((value, j) => Math.abs(value - bv[j])));
  }
  return magnitude;
}

export function assessSamples({ inventory, samples, vh, reduced = false, world = false }) {
  const findings = [];
  const add = (code, severity, message, extra = {}) => findings.push({ code, severity, message, ...extra });
  const coverage = { samples: samples.length, cuesExpected: inventory.cues.length, cuesVisible: 0,
    contrastGraded: 0, contrastUngraded: 0, clipsExpected: inventory.clips.length, clipsPainted: 0 };
  if (!samples.length) add("NO_SAMPLES", "incomplete", "No scroll samples were captured.");
  for (const sample of samples) {
    if (!sample.settled) add("SEEK_UNSETTLED", "blocker", "Playhead did not settle before capture.", { sample: sample.i, y: sample.y });
    for (const seq of sample.sequences || []) {
      if (!Number.isInteger(seq.requested) || seq.requested !== seq.drawn) add("SEQUENCE_STALLED", "blocker", "Canvas did not draw its requested frame before the settle timeout.", { sample: sample.i, ...seq });
    }
    if (sample.overflow > 1) add("TEXT_OVERFLOW", "blocker", "Document exceeds the viewport width.", { sample: sample.i, pixels: sample.overflow });
  }
  if (!reduced && samples.length > 1 && samples.at(-1).y > samples[0].y) {
    for (const motion of inventory.motion || []) {
      const first = samples[0].motion?.find((item) => item.id === motion.id);
      const last = samples.at(-1).motion?.find((item) => item.id === motion.id);
      if (!first || !last) continue;
      const magnitude = motionMagnitude(first, last, samples[0].viewport);
      if (magnitude < 0.04) add("MOTION_TIMID", "warn", "Declared motion changes by less than 4% of the viewport between first and last samples; review the intended effect.", { id: motion.id, magnitude });
    }
  }
  for (const cue of inventory.cues) {
    const seen = samples.flatMap((sample) => sample.cues.filter((item) => item.id === cue.id && item.visible));
    const peak = Math.max(0, ...seen.map((item) => item.o));
    if (inventory.textSource === "visible-text" && seen.some((item) => item.o >= 0.8 && item.overflow)) add("TEXT_OVERFLOW", "blocker", `Text extends beyond the viewport: ${cue.text}`, { id: cue.id });
    if (peak >= 0.8) coverage.cuesVisible++;
    else add("CUE_NEVER_VISIBLE", "blocker", `Cue never reached readable sampled visibility: ${cue.text}`, { id: cue.id, peak });
    const graded = samples.flatMap((sample) => sample.contrast.filter((item) => item.id === cue.id && item.status === "graded"));
    const ungraded = samples.flatMap((sample) => sample.contrast.filter((item) => item.id === cue.id && item.status === "ungraded"));
    if (graded.length) {
      coverage.contrastGraded++;
      const worst = graded.reduce((a, b) => a.worst / a.threshold < b.worst / b.threshold ? a : b);
      if (worst.worst < worst.threshold) add("CONTRAST_LOW", "blocker", `Sampled contrast ${worst.worst}:1 below ${worst.threshold}:1 for ${cue.text}.`, { id: cue.id, ratio: worst.worst });
    }
    if (!graded.length || ungraded.length) {
      coverage.contrastUngraded++;
      add("CONTRAST_UNGRADED", "incomplete", `Contrast needs manual assessment: ${cue.text}`, { id: cue.id,
        reasons: [...new Set(ungraded.map((item) => item.reason))].concat(!graded.length ? ["No gradeable visible sample"] : []) });
    }
  }
  for (const clip of inventory.clips) {
    const states = samples.flatMap((sample) => sample.clips.filter((item) => item.id === clip.id));
    if (states.some((item) => item.painted && item.vis > 0.02)) coverage.clipsPainted++;
    else if (!reduced) add("CLIP_UNPAINTED", "blocker", "Expected clip never decoded and painted while visible.", { id: clip.id });
    if (reduced) continue;
    let start = null;
    for (let i = 1; i < samples.length; i++) {
      const a = samples[i - 1].clips.find((item) => item.id === clip.id);
      const b = samples[i].clips.find((item) => item.id === clip.id);
      const stuck = a && b && a.painted && b.painted && a.vis >= 0.55 && b.vis >= 0.55 && Math.abs(a.t - b.t) < 0.012;
      if (stuck) {
        start ??= samples[i - 1].y;
        const endpoint = b.t < 0.05 || (b.dur && b.t > b.dur - 0.08);
        if (samples[i].y - start >= vh * (endpoint ? 0.15 : 0.5)) {
          add("CLIP_FROZEN", "blocker", "Decoded clip held still across visible scrolling.", { id: clip.id, from: start, to: samples[i].y });
          break;
        }
      } else start = null;
    }
  }
  for (const rail of inventory.rails) {
    const states = samples.flatMap((sample) => sample.rails.filter((item) => item.id === rail.id && item.visible));
    if (!reduced && states.length && states.every((item) => item.overflow <= 1)) add("PAN_NO_OVERFLOW", "blocker", "Pan rail has no horizontal travel.", { id: rail.id });
  }
  for (let i = 1; !reduced && i < samples.length; i++) {
    const a = samples[i - 1], b = samples[i];
    const pinned = world || a.stages.some((stage) => stage.visible && stage.pinned) || b.stages.some((stage) => stage.visible && stage.pinned);
    const custom = [...a.custom, ...b.custom].some((state) => state.visible);
    if (!pinned && !custom) continue;
    if (a.custom.some((state) => state.visible && state.hold) && b.custom.some((state) => state.visible && state.hold)) continue;
    if (b.y - a.y < vh * (world ? 0.12 : 0.25)) continue;
    if (visibleSignature(a) === visibleSignature(b)) add("DEAD_SCROLL", "blocker", "Visible pinned stage did not change across scroll samples.", { from: a.y, to: b.y });
  }
  for (const segment of inventory.segs) {
    const peak = Math.max(0, ...samples.flatMap((sample) => sample.segs.filter((item) => item.id === segment.id && item.visible).map((item) => item.op)));
    if (peak < 0.99) add("SEGMENT_NEVER_OPAQUE", "blocker", "World segment never reached full sampled opacity.", { id: segment.id, peak });
  }
  return { findings, coverage };
}
