#!/usr/bin/env node
// One explicit video approval per invocation. The journal is durable before
// submission so crashes cannot turn an uncertain charge into a silent retry.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { createHash, randomUUID } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const defaults = {
  final: 'bytedance/seedance-2.0/image-to-video',
  draft: 'fal-ai/kling-video/v2.5-turbo/pro/image-to-video',
};
const help = `chain.sh <build-dir> [--from N] [--to N] [--draft]
  Quote only by default: no generator invocation and no filesystem writes.
  --provider fal --model ENDPOINT --frame-mode head-tail|head-only
  --unit-cost USD --price-source 'URL, checked date, exact parameter basis'
  --go --approve-leg N --approval-ref 'actual user approval reference'
  --max-cost USD    Ceiling for ALL recorded attempts plus planned new legs.
  --reroll         One NEW approved attempt of a known rejected/review leg.
  --resume-leg N   Resume local processing of a rendered result; no paid call.
  --recover-leg N --source FILE --recovery-ref TEXT
                   Reconcile an uncertain attempt with its recovered paid result.
  --accept-soft-leg N --review-ref TEXT
                   Accept only a soft (20..30 dB) seam after visual review.

Paid calls require explicit provider/model/price attribution and --approve-leg.
Only fal's image_url/end_image_url 5-second body contract is implemented. For a
model override, verify that contract first and select --frame-mode explicitly.
--draft selects head-only semantics; it never claims tail-lock certification.
--go is not user consent by itself. One invocation submits at most one video.
No automatic rerolls or provider swaps. Billing uncertainty blocks new paid work.
Attempt history: <build>/chain/.scroll-forge-attempts/legNN-attemptNN.json.
Estimates are caller supplied, NOT live-verified or authoritative billing.`;

function fail(message) { throw new Error(message); }
function positiveInt(value, name) {
  if (!/^[1-9]\d*$/.test(value ?? '') || !Number.isSafeInteger(Number(value))) fail(`${name} must be a positive integer`);
  return Number(value);
}
function money(value, name) {
  if (!/^(0|[1-9]\d*)(\.\d{1,6})?$/.test(value ?? '')) fail(`${name} must be a nonnegative USD amount (up to 6 decimals)`);
  const amount = Math.round(Number(value) * 1e6);
  if (!Number.isSafeInteger(amount)) fail(`${name} is too large`);
  return amount;
}
function usd(micros) { return (micros / 1e6).toFixed(6).replace(/0+$/, '').replace(/\.$/, '') || '0'; }
function hash(file) { return createHash('sha256').update(fs.readFileSync(file)).digest('hex'); }
function exists(file) { try { fs.lstatSync(file); return true; } catch (error) { if (error.code === 'ENOENT') return false; throw error; } }
function regular(file) {
  if (!exists(file) || !fs.statSync(file).isFile() || fs.statSync(file).size === 0) fail(`missing or empty file: ${file}`);
}
function run(command, args, options = {}) {
  return spawnSync(command, args, { encoding: 'utf8', maxBuffer: 1024 * 1024, ...options });
}
function syncDirectory(directory) {
  const fd = fs.openSync(directory, 'r');
  try { fs.fsyncSync(fd); } finally { fs.closeSync(fd); }
}
function save(file, value) {
  const temporary = `${file}.${randomUUID()}.next`;
  const fd = fs.openSync(temporary, 'wx', 0o600);
  try { fs.writeFileSync(fd, `${JSON.stringify(value, null, 2)}\n`); fs.fsyncSync(fd); }
  finally { fs.closeSync(fd); }
  fs.renameSync(temporary, file);
  syncDirectory(path.dirname(file));
}

function main() {
  const argv = process.argv.slice(2);
  if (!argv.length || argv.includes('--help') || argv.includes('-h')) { process.stdout.write(`${help}\n`); return; }
  const build = path.resolve(argv.shift());
  const options = {};
  const switches = new Set(['go', 'draft', 'reroll']);
  const values = new Set(['from', 'to', 'provider', 'model', 'frame-mode', 'unit-cost', 'price-source', 'max-cost', 'approve-leg', 'approval-ref', 'resume-leg', 'recover-leg', 'source', 'recovery-ref', 'accept-soft-leg', 'review-ref']);
  while (argv.length) {
    const flag = argv.shift();
    const key = flag.startsWith('--') ? flag.slice(2) : '';
    if (Object.hasOwn(options, key)) fail(`duplicate flag: ${flag}`);
    if (switches.has(key)) options[key] = true;
    else if (values.has(key) && argv[0] && !argv[0].startsWith('--')) options[key] = argv.shift();
    else fail(`unknown flag or missing value: ${flag}`);
  }
  const chain = path.join(build, 'chain');
  if (!exists(chain) || !fs.statSync(chain).isDirectory()) fail(`no chain directory: ${chain}`);
  const anchors = fs.readdirSync(chain).filter(name => /^anchor\d+\.png$/.test(name));
  const nanchors = Math.max(0, ...anchors.map(name => Number(name.match(/\d+/)[0])));
  if (nanchors < 2 || !Number.isSafeInteger(nanchors)) fail('need at least two numbered anchors');
  const from = positiveInt(options.from ?? '1', '--from');
  const to = positiveInt(options.to ?? String(nanchors - 1), '--to');
  if (from > to || to >= nanchors) fail(`invalid selected range ${from}..${to}; available legs 1..${nanchors - 1}`);
  const provider = options.provider ?? null;
  const model = options.model ?? (options.draft ? defaults.draft : null);
  if (provider && provider !== 'fal') fail('only provider fal is supported by this request-body adapter');
  let frameMode = options['frame-mode'];
  if (!frameMode) frameMode = options.draft || model === defaults.draft ? 'head-only' : 'head-tail';
  if (!['head-only', 'head-tail'].includes(frameMode)) fail('--frame-mode must be head-only or head-tail');
  if (options.draft && frameMode !== 'head-only') fail('--draft requires head-only frame mode');
  if (model && !Object.values(defaults).includes(model) && !options['frame-mode']) fail('model override requires explicit --frame-mode after checking its body contract');
  const unit = options['unit-cost'] === undefined ? null : money(options['unit-cost'], '--unit-cost');
  const ceiling = options['max-cost'] === undefined ? null : money(options['max-cost'], '--max-cost');
  const localFlags = ['resume-leg', 'recover-leg', 'accept-soft-leg'].filter(key => options[key]);
  if (localFlags.length > 1 || (localFlags.length && options.go)) fail('choose one local recovery/review mode OR --go');
  if (options.reroll && !options['approve-leg']) fail('--reroll requires --approve-leg, including for a quote');
  const selected = [];
  for (let leg = from; leg <= to; leg += 1) {
    const n = String(leg).padStart(2, '0');
    const head = path.join(chain, `anchor${n}.png`);
    const tail = path.join(chain, `anchor${String(leg + 1).padStart(2, '0')}.png`);
    const promptFile = path.join(chain, `leg${n}.txt`);
    for (const file of [head, tail, promptFile]) regular(file);
    const prompt = fs.readFileSync(promptFile, 'utf8').trim();
    if (!prompt) fail(`empty prompt: ${promptFile}`);
    for (const file of [head, tail]) {
      if (!fs.readFileSync(file).subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) fail(`anchor is not a PNG: ${file}`);
    }
    const inputs = { head: hash(head), tail: hash(tail), prompt: hash(promptFile) };
    selected.push({ leg, n, head, tail, prompt, inputs });
  }
  const journal = path.join(chain, '.scroll-forge-attempts');
  let records = [];
  function readRecords() {
    if (!exists(journal)) return [];
    return fs.readdirSync(journal).filter(name => /^leg\d+-attempt\d+\.json$/.test(name)).map(name => {
      const file = path.join(journal, name);
      const record = JSON.parse(fs.readFileSync(file, 'utf8'));
      if (record.schemaVersion !== 1 || !Number.isSafeInteger(record.reservedMicros) || record.reservedMicros < 0 || !Number.isInteger(record.leg) || !Number.isInteger(record.attempt) || !['submitted', 'uncertain', 'rendered', 'rejected', 'review_required', 'complete'].includes(record.status)) fail(`invalid attempt record: ${file}`);
      return { file, ...record };
    });
  }
  records = readRecords();
  const latest = leg => records.filter(record => record.leg === leg).sort((a, b) => b.attempt - a.attempt)[0];
  const reserved = records.reduce((total, record) => total + record.reservedMicros, 0);
  const pending = selected.filter(item => !latest(item.leg) || (options.reroll && item.leg === Number(options['approve-leg'])));
  const estimate = unit === null ? null : unit * pending.length;
  process.stdout.write(`${JSON.stringify({
    mode: options.go ? 'execute-one-approved-leg' : localFlags[0] ?? 'quote-only', build,
    range: { from, to, count: selected.length }, provider, model, frameMode,
    params: frameMode === 'head-only' ? { duration: '5' } : { duration: '5', resolution: '1080p', aspect_ratio: '16:9', generate_audio: false },
    newLegs: pending.map(item => item.leg), unitCostUSD: unit === null ? null : usd(unit),
    selectedNewEstimateUSD: estimate === null ? null : usd(estimate),
    recordedReservedUSD: usd(reserved), maxCostUSD: ceiling === null ? null : usd(ceiling),
    priceSource: options['price-source'] ?? null,
    priceVerification: 'Caller supplied; independently check current model, provider, parameter basis and bill.',
    attempts: records.map(record => ({ leg: record.leg, attempt: record.attempt, status: record.status })),
  }, null, 2)}\n`);
  if (!options.go && !localFlags.length) {
    process.stdout.write('Quote only — no generator called, no files written. A quote is not approval.\n');
    return;
  }
  const targetLeg = positiveInt(options[localFlags[0] ?? 'approve-leg'], localFlags[0] ?? '--approve-leg');
  const target = selected.find(item => item.leg === targetLeg);
  if (!target) fail('approved/recovery leg must be inside the selected range');
  let previous = latest(targetLeg);
  if (options.go) {
    if (!options.provider || !options.model || !options['price-source']?.trim() || unit === null || unit <= 0 || ceiling === null || !options['approval-ref']?.trim()) fail('--go requires --provider, --model, --unit-cost (>0), --price-source, --max-cost, --approval-ref and --approve-leg');
    if (records.some(record => ['submitted', 'uncertain'].includes(record.status))) fail('unreconciled submitted/uncertain attempt: audit/rejoin that provider request; do not resubmit');
    if (records.some(record => record.leg !== targetLeg && record === latest(record.leg) && ['rejected', 'review_required', 'rendered'].includes(record.status))) fail('a previous leg is not verified; resolve its local processing or seam before new paid work');
    if (previous && !options.reroll) fail(`leg ${targetLeg} already has an attempt (${previous.status}); use its local resume/recovery or an explicitly approved --reroll`);
    if (options.reroll && (!previous || !['rejected', 'review_required'].includes(previous.status))) fail('--reroll is only allowed for a known rejected/review result');
    if (records.some(record => record.approvalRef === options['approval-ref'])) fail('a new paid attempt requires a fresh approval reference, not a reused approval');
    if (reserved + estimate > ceiling) fail(`budget exceeded: recorded attempts plus selected new legs need $${usd(reserved + estimate)}`);
  } else {
    if (!previous) fail('no existing attempt for local recovery');
    if (JSON.stringify(previous.inputs) !== JSON.stringify(target.inputs)) fail('inputs changed since the paid attempt; do not adopt mismatched results');
    if (options['resume-leg'] && previous.status !== 'rendered') fail('--resume-leg requires a rendered result');
    if (options['recover-leg'] && (!['submitted', 'uncertain'].includes(previous.status) || !options.source || !options['recovery-ref']?.trim())) fail('--recover-leg requires an uncertain/submitted attempt, --source and --recovery-ref documenting provider reconciliation');
    if (options['accept-soft-leg'] && (previous.status !== 'review_required' || !options['review-ref']?.trim())) fail('--accept-soft-leg requires a review_required result and --review-ref');
  }

  // Resolve and decode all selected inputs before creating state or spending.
  if (process.env.SCROLLCRAFT_CRF !== undefined && (!/^\d{1,2}$/.test(process.env.SCROLLCRAFT_CRF) || Number(process.env.SCROLLCRAFT_CRF) > 51)) fail('SCROLLCRAFT_CRF must be an integer in 0..51 before generation');
  const capability = run('bash', ['-c', '. "$1"; generation_ffmpeg "scale format select psnr" "libx264 png"', 'generation', path.join(here, 'lib/generation-media.sh')]);
  if (capability.status !== 0) fail(capability.stderr.trim() || 'required FFmpeg capabilities unavailable');
  const ffmpeg = capability.stdout.trim();
  const probe = run('bash', ['-c', '. "$1"; generation_ffprobe "$2"', 'generation', path.join(here, 'lib/generation-media.sh'), ffmpeg]);
  if (probe.status !== 0) fail('ffprobe is required');
  const ffprobe = probe.stdout.trim();
  for (const file of new Set(selected.flatMap(item => [item.head, item.tail]))) {
    if (run(ffmpeg, ['-v', 'error', '-xerror', '-i', file, '-frames:v', '1', '-f', 'null', '-']).status !== 0) fail(`anchor could not be decoded: ${file}`);
  }
  // Freeze the exact validated request bytes before any reservation/submission.
  const headBytes = fs.readFileSync(target.head);
  const tailBytes = fs.readFileSync(target.tail);
  const hashBytes = bytes => createHash('sha256').update(bytes).digest('hex');
  if (hashBytes(headBytes) !== target.inputs.head || hashBytes(tailBytes) !== target.inputs.tail || hash(path.join(chain, `leg${target.n}.txt`)) !== target.inputs.prompt) fail('inputs changed during preflight; quote and approve the new inputs');
  const generator = process.env.GEN_SH ?? path.join(os.homedir(), '.claude/skills/generate/gen.sh');
  if (options.go) { try { fs.accessSync(generator, fs.constants.X_OK); } catch { fail(`executable generator missing: ${generator}`); } }
  const assets = path.join(build, 'assets');
  const outputs = [path.join(assets, `leg${target.n}.mp4`), path.join(assets, `leg${target.n}-m.mp4`)];
  for (const item of selected) {
    const prior = latest(item.leg);
    const plannedOutputs = [path.join(assets, `leg${item.n}.mp4`), path.join(assets, `leg${item.n}-m.mp4`)];
    for (let index = 0; index < plannedOutputs.length; index += 1) {
      if (exists(plannedOutputs[index]) && (!prior?.encodes?.[index]?.sha256 || hash(plannedOutputs[index]) !== prior.encodes[index].sha256 || (options.go && item.leg === targetLeg))) fail(`refusing to overwrite existing output: ${plannedOutputs[index]}`);
    }
  }
  fs.mkdirSync(journal, { recursive: true });
  syncDirectory(chain);
  const lock = path.join(journal, '.lock');
  try { fs.mkdirSync(lock); } catch { fail(`generation lock exists: ${lock}; confirm no process is active before removing only this lock`); }
  try {
    // Another invocation may have completed between our read and acquiring lock.
    const current = readRecords();
    if (JSON.stringify(current) !== JSON.stringify(records)) fail('attempt state changed during preflight; rerun the quote');
    let record = previous;
    const persist = status => {
      record.status = status; record.updatedAt = new Date().toISOString();
      record.events.push({ status, at: record.updatedAt });
      const { file, ...data } = record; save(file, data);
    };
    if (options.go) {
      const attempt = (previous?.attempt ?? 0) + 1;
      record = {
        file: path.join(journal, `leg${target.n}-attempt${String(attempt).padStart(2, '0')}.json`),
        schemaVersion: 1, leg: targetLeg, attempt, attemptId: randomUUID(),
        inputs: target.inputs, provider, model, frameMode,
        reservedMicros: unit, billingStatus: 'unreconciled', approvedMaxMicros: ceiling,
        priceSource: options['price-source'], approvalRef: options['approval-ref'],
        approvedRange: { from, to }, events: [], encodes: [],
      };
      persist('submitted');
      const body = { prompt: target.prompt, image_url: `data:image/png;base64,${headBytes.toString('base64')}`, duration: '5' };
      if (frameMode === 'head-tail') Object.assign(body, { end_image_url: `data:image/png;base64,${tailBytes.toString('base64')}`, resolution: '1080p', aspect_ratio: '16:9', generate_audio: false });
      const generated = run(generator, ['--provider', provider, '--model', model, '--body', '-', '--async', '--project', path.basename(build), '--desc', `leg${target.n}-attempt${attempt}`, '--cost', usd(unit), '--capability', 'generate', '--timeout', '1200'], { input: JSON.stringify(body), stdio: ['pipe', 'pipe', 'inherit'], timeout: 1_260_000 });
      if (generated.status !== 0 || generated.error || !generated.stdout?.trim() || !exists(generated.stdout.trim())) {
        record.failure = 'Generator did not return a confirmed result; billing may have occurred. Audit/rejoin, never silently retry.';
        persist('uncertain'); fail(record.failure);
      }
      record.source = fs.realpathSync(generated.stdout.trim());
      regular(record.source); record.sourceSha256 = hash(record.source);
      record.billingStatus = 'result-returned-estimate-reserved';
      persist('rendered');
    }
    if (options['recover-leg']) {
      const source = path.resolve(options.source); regular(source);
      const probed = run(ffprobe, ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'json', source]);
      if (probed.status !== 0 || !JSON.parse(probed.stdout).streams?.some(stream => stream.width > 0 && stream.height > 0)) fail('recovered source is not readable video');
      record.source = fs.realpathSync(source); record.sourceSha256 = hash(source);
      record.recoveryRef = options['recovery-ref']; record.billingStatus = 'externally-reconciled-result';
      persist('rendered');
    }
    regular(record.source);
    if (hash(record.source) !== record.sourceSha256) fail('source changed since the paid result was recorded');
    if (hash(target.head) !== record.inputs.head || hash(target.tail) !== record.inputs.tail || hash(path.join(chain, `leg${target.n}.txt`)) !== record.inputs.prompt) fail('inputs changed during processing; restore the recorded inputs before local validation');
    const sourceProbe = run(ffprobe, ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'json', record.source]);
    if (sourceProbe.status !== 0 || !JSON.parse(sourceProbe.stdout).streams?.some(stream => stream.width > 0 && stream.height > 0)) {
      record.failure = 'The returned paid result is not a readable video. Retained for audit; a reroll requires a fresh approval.';
      persist('rejected'); fail(record.failure);
    }
    const stage = path.join(journal, `leg${target.n}-attempt${String(record.attempt).padStart(2, '0')}-assets`);
    fs.mkdirSync(stage, { recursive: true });
    const encoded = [path.join(stage, 'desktop.mp4'), path.join(stage, 'mobile.mp4')];
    if (!options['accept-soft-leg']) {
      for (let index = 0; index < encoded.length; index += 1) {
        if (!exists(encoded[index])) {
          const result = run('bash', [path.join(here, 'encode.sh'), record.source, encoded[index], index ? 'mobile' : 'desktop']);
          if (result.status !== 0) fail(`local encode failed; use --resume-leg ${targetLeg}, no new paid call. ${result.stderr.trim()}`);
        }
        if (record.encodes[index]?.sha256 && hash(encoded[index]) !== record.encodes[index].sha256) fail('encoded output changed since recording');
        record.encodes[index] = { path: encoded[index], sha256: hash(encoded[index]) };
        persist('rendered');
      }
      record.seams = [];
      for (const clip of encoded) {
        for (const side of record.frameMode === 'head-tail' ? ['head', 'tail'] : ['head']) {
          const result = run('bash', [path.join(here, 'framelock.sh'), `--${side}`, target[side], '--clip', clip]);
          const status = result.status === 0 ? 'locked' : result.status === 2 ? 'review_required' : 'invalid';
          record.seams.push({ clip, side, status, measurement: result.stdout.trim() });
          process.stdout.write(`${result.stdout || result.stderr}\n`);
        }
      }
      if (record.seams.some(seam => seam.status === 'invalid')) { persist('rejected'); fail('seam validation failed; stopped. Rerolls require a fresh explicit approval and retained history.'); }
      if (record.seams.some(seam => seam.status === 'review_required')) { persist('review_required'); fail('soft seam needs visual review; use --accept-soft-leg with --review-ref or request an approved reroll'); }
    } else record.reviewRef = options['review-ref'];
    for (let index = 0; index < encoded.length; index += 1) {
      regular(encoded[index]);
      if (hash(encoded[index]) !== record.encodes[index]?.sha256) fail('encoded output changed; review is stale');
    }
    fs.mkdirSync(assets, { recursive: true });
    for (let index = 0; index < outputs.length; index += 1) {
      if (!exists(outputs[index])) fs.linkSync(encoded[index], outputs[index]);
      else if (hash(outputs[index]) !== record.encodes[index].sha256) fail(`refusing output overwrite: ${outputs[index]}`);
    }
    record.outputs = outputs; persist('complete');
    process.stdout.write(`Leg ${targetLeg} completed (${record.frameMode}); no further paid calls. Inspect encoded clips before shipping; extract posters from these encoded files.\n`);
  } finally { fs.rmdirSync(lock); }
}

try { main(); } catch (error) { process.stderr.write(`ERROR: ${error.message}\n`); process.exitCode = 1; }
