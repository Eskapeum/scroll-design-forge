import test, { before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const scripts = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../scripts');
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'scroll-forge-generation-test-'));
const ffmpeg = process.env.SCROLLCRAFT_FFMPEG || spawnSync('which', ['ffmpeg'], { encoding: 'utf8' }).stdout.trim();
const ffprobe = process.env.SCROLLCRAFT_FFPROBE || spawnSync('which', ['ffprobe'], { encoding: 'utf8' }).stdout.trim();
const model = 'bytedance/seedance-2.0/image-to-video';
const priced = ['--provider', 'fal', '--model', model, '--unit-cost', '0.75', '--price-source', 'Offline test price; not a live quote'];
const approve = (leg = 1, ref = `test-explicit-approval-${leg}`) => [...priced, '--go', '--approve-leg', String(leg), '--approval-ref', ref, '--max-cost', '10'];
const redClip = path.join(root, 'red.mkv');
const red = path.join(root, 'red.png');
const blue = path.join(root, 'blue.png');
const grayClip = path.join(root, 'gray.mkv');
const soft = path.join(root, 'soft.png');
let fixtureIndex = 0;

function execute(command, args, options = {}) {
  return spawnSync(command, args, { encoding: 'utf8', timeout: 60_000, ...options });
}
function ff(args) {
  const result = execute(ffmpeg, ['-v', 'error', '-n', ...args]);
  assert.equal(result.status, 0, result.stderr);
}
function snapshot(directory) {
  return fs.readdirSync(directory, { recursive: true }).sort().map(name => {
    const file = path.join(directory, name);
    return [name, fs.statSync(file).isFile() ? fs.readFileSync(file).toString('base64') : '<directory>'];
  });
}
function fixture({ anchors = [red, red, red], source = redClip, behavior = 'success' } = {}) {
  const build = path.join(root, `build-${++fixtureIndex}`);
  fs.mkdirSync(path.join(build, 'chain'), { recursive: true });
  for (let index = 0; index < anchors.length; index += 1) {
    fs.copyFileSync(anchors[index], path.join(build, 'chain', `anchor${String(index + 1).padStart(2, '0')}.png`));
    if (index < anchors.length - 1) fs.writeFileSync(path.join(build, 'chain', `leg${String(index + 1).padStart(2, '0')}.txt`), `Move smoothly through scene ${index + 1}.`);
  }
  const calls = path.join(build, 'calls.txt');
  const generator = path.join(build, 'stub-generator.sh');
  fs.writeFileSync(generator, `#!/usr/bin/env bash\nset -eu\nIFS= read -r body || true\nprintf 'call\\n' >> "$TEST_CALLS"\ncase "$TEST_BEHAVIOR" in\n fail) exit 7;;\n killed) kill -KILL "$PPID"; exit 8;;\n badpath) printf '/not-a-result\\n'; exit 0;;\nesac\nprintf '%s\\n' "$TEST_SOURCE"\n`, { mode: 0o755 });
  const env = { ...process.env, GEN_SH: generator, TEST_CALLS: calls, TEST_SOURCE: source, TEST_BEHAVIOR: behavior, SCROLLCRAFT_FFMPEG: ffmpeg, SCROLLCRAFT_FFPROBE: ffprobe };
  const command = (args = [], overrides = {}) => execute(process.execPath, [path.join(scripts, 'chain.mjs'), build, ...args], { env: { ...env, ...overrides } });
  const count = () => fs.existsSync(calls) ? fs.readFileSync(calls, 'utf8').trim().split('\n').length : 0;
  const records = () => {
    const journal = path.join(build, 'chain/.scroll-forge-attempts');
    return fs.existsSync(journal) ? fs.readdirSync(journal).filter(name => name.endsWith('.json')).sort().map(name => JSON.parse(fs.readFileSync(path.join(journal, name), 'utf8'))) : [];
  };
  return { build, command, count, records, env };
}

before(() => {
  assert.ok(ffmpeg && ffprobe, 'offline generation tests require local ffmpeg and ffprobe');
  ff(['-f', 'lavfi', '-i', 'color=c=red:s=64x36:r=60', '-frames:v', '4', '-c:v', 'ffv1', redClip]);
  ff(['-i', redClip, '-frames:v', '1', red]);
  ff(['-f', 'lavfi', '-i', 'color=c=blue:s=64x36:r=60', '-frames:v', '1', blue]);
  ff(['-f', 'lavfi', '-i', 'color=c=0x808080:s=64x36:r=60', '-frames:v', '4', '-c:v', 'ffv1', grayClip]);
  ff(['-f', 'lavfi', '-i', 'color=c=0x707070:s=64x36:r=60', '-frames:v', '1', soft]);
});
after(() => fs.rmSync(root, { recursive: true, force: true }));

test('quote counts only selected range, needs no generator, and writes nothing', () => {
  const f = fixture({ anchors: [red, red, red, red, red] });
  const before = snapshot(f.build);
  const result = f.command(['--from', '2', '--to', '3', ...priced], { GEN_SH: '/nonexistent/generator' });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /"count": 2/);
  assert.match(result.stdout, /"selectedNewEstimateUSD": "1.5"/);
  assert.deepEqual(snapshot(f.build), before);
  assert.equal(f.count(), 0);
});

test('missing later prompt, corrupt anchors, empty prompts and invalid ranges spend zero', () => {
  for (const problem of ['missing', 'corrupt', 'empty', 'zero', 'reverse', 'beyond', 'fraction', 'missing-value']) {
    const f = fixture();
    let args = approve();
    if (problem === 'missing') fs.unlinkSync(path.join(f.build, 'chain/leg02.txt'));
    if (problem === 'corrupt') fs.writeFileSync(path.join(f.build, 'chain/anchor03.png'), Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]));
    if (problem === 'empty') fs.writeFileSync(path.join(f.build, 'chain/leg02.txt'), '  \n');
    if (problem === 'zero') args.push('--from', '0');
    if (problem === 'reverse') args.push('--from', '2', '--to', '1');
    if (problem === 'beyond') args.push('--to', '3');
    if (problem === 'fraction') args.push('--from', '1.2');
    if (problem === 'missing-value') args.push('--from');
    const result = f.command(args);
    assert.notEqual(result.status, 0, problem);
    assert.equal(f.count(), 0, `${problem}: paid call must not happen`);
    assert.equal(f.records().length, 0, `${problem}: no attempt should be reserved`);
  }
});

test('paid execution requires explicit current-price attribution, bounded cost and one-leg approval', () => {
  for (const missing of ['--provider', '--model', '--unit-cost', '--price-source', '--max-cost', '--approval-ref', '--approve-leg']) {
    const f = fixture();
    const args = approve();
    const index = args.indexOf(missing); args.splice(index, 2);
    const result = f.command(args);
    assert.notEqual(result.status, 0, missing);
    assert.equal(f.count(), 0, missing);
  }
  const f = fixture();
  const result = f.command([...approve().slice(0, -2), '--max-cost', '1']);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /budget exceeded/);
  assert.equal(f.count(), 0);
});

test('head and tail seam failures stop the chain, including subsequent invocation', () => {
  for (const anchors of [[blue, red, red], [red, blue, red]]) {
    const f = fixture({ anchors });
    const result = f.command(approve());
    assert.notEqual(result.status, 0, result.stdout);
    assert.match(result.stderr, /seam validation failed/);
    assert.equal(f.count(), 1);
    assert.equal(f.records()[0].status, 'rejected');
    assert.equal(fs.existsSync(path.join(f.build, 'assets/leg01.mp4')), false);
    const next = f.command(approve(2));
    assert.notEqual(next.status, 0);
    assert.match(next.stderr, /previous leg is not verified/);
    assert.equal(f.count(), 1);
  }
});

test('success submits only one video, records hashes and refuses silent repeated submission', () => {
  const f = fixture();
  const result = f.command(approve());
  assert.equal(result.status, 0, result.stderr + result.stdout);
  assert.equal(f.count(), 1);
  assert.equal(f.records()[0].status, 'complete');
  assert.ok(f.records()[0].sourceSha256);
  assert.ok(fs.existsSync(path.join(f.build, 'assets/leg01.mp4')));
  assert.equal(fs.existsSync(path.join(f.build, 'assets/leg02.mp4')), false);
  const repeated = f.command(approve());
  assert.notEqual(repeated.status, 0);
  assert.equal(f.count(), 1);
  const next = f.command(approve(2));
  assert.equal(next.status, 0, next.stderr);
  assert.equal(f.count(), 2);
});

test('custom fal model requires an explicit compatible body mode; head-only never certifies tails', () => {
  const f = fixture({ anchors: [red, blue] });
  const args = approve();
  args[args.indexOf('--model') + 1] = 'example/current-compatible-image-to-video';
  const unspecified = f.command(args);
  assert.notEqual(unspecified.status, 0);
  assert.match(unspecified.stderr, /model override requires explicit --frame-mode/);
  assert.equal(f.count(), 0);
  const result = f.command([...args, '--frame-mode', 'head-only']);
  assert.equal(result.status, 0, result.stderr + result.stdout);
  assert.equal(f.count(), 1);
  assert.equal(f.records()[0].frameMode, 'head-only');
  assert.equal(f.records()[0].seams.length, 2);
  assert.ok(f.records()[0].seams.every(seam => seam.side === 'head'));
});

test('existing outputs and missing local capabilities are rejected before submission', () => {
  const f = fixture();
  fs.mkdirSync(path.join(f.build, 'assets'));
  fs.writeFileSync(path.join(f.build, 'assets/leg02.mp4'), 'existing user artifact in a later planned leg');
  const result = f.command(approve());
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /refusing to overwrite existing output/);
  assert.equal(f.count(), 0);
  const missing = fixture();
  const unavailable = missing.command(approve(), { SCROLLCRAFT_FFMPEG: '/missing/ffmpeg' });
  assert.notEqual(unavailable.status, 0);
  assert.equal(missing.count(), 0);
  assert.equal(missing.records().length, 0);
  const invalidCrf = missing.command(approve(), { SCROLLCRAFT_CRF: '52' });
  assert.notEqual(invalidCrf.status, 0);
  assert.match(invalidCrf.stderr, /SCROLLCRAFT_CRF must/);
  assert.equal(missing.count(), 0);
});

test('failed, missing-result and killed-after-submission attempts refuse all paid retries', () => {
  for (const behavior of ['fail', 'badpath', 'killed']) {
    const f = fixture({ behavior });
    const result = f.command(approve());
    assert.notEqual(result.status, 0, behavior);
    assert.equal(f.count(), 1, behavior);
    assert.ok(['submitted', 'uncertain'].includes(f.records()[0].status), behavior);
    const retry = f.command(approve(2), { TEST_BEHAVIOR: 'success' });
    assert.notEqual(retry.status, 0);
    assert.match(retry.stderr, /unreconciled submitted\/uncertain/);
    assert.equal(f.count(), 1);
    assert.doesNotMatch(JSON.stringify(f.records()), /data:image|base64|FAL_KEY/);
  }
});

test('known rejected reroll preserves history, requires new approval and aggregate ceiling', () => {
  const f = fixture({ anchors: [blue, blue, blue] });
  assert.notEqual(f.command(approve()).status, 0);
  assert.equal(f.count(), 1);
  const quote = f.command([...priced, '--from', '1', '--to', '1', '--reroll', '--approve-leg', '1']);
  assert.equal(quote.status, 0, quote.stderr);
  assert.match(quote.stdout, /"selectedNewEstimateUSD": "0.75"/);
  const reused = f.command([...approve(), '--reroll']);
  assert.notEqual(reused.status, 0);
  assert.match(reused.stderr, /fresh approval reference/);
  const ceiling = f.command([...approve(1, 'reroll-new-approval').slice(0, -2), '--max-cost', '1', '--reroll']);
  assert.notEqual(ceiling.status, 0);
  assert.match(ceiling.stderr, /budget exceeded/);
  assert.equal(f.count(), 1);
  const blueClip = path.join(root, 'blue-reroll.mkv');
  ff(['-f', 'lavfi', '-i', 'color=c=blue:s=64x36:r=60', '-frames:v', '4', '-c:v', 'ffv1', blueClip]);
  const reroll = f.command([...approve(1, 'reroll-new-approval'), '--reroll'], { TEST_SOURCE: blueClip });
  assert.equal(reroll.status, 0, reroll.stderr + reroll.stdout);
  assert.equal(f.count(), 2);
  assert.deepEqual(f.records().map(record => record.status), ['rejected', 'complete']);
  assert.equal(f.records().reduce((sum, record) => sum + record.reservedMicros, 0), 1_500_000);
});

test('uncertain result recovery is local-only and resumes validation', () => {
  const f = fixture({ behavior: 'fail' });
  assert.notEqual(f.command(approve()).status, 0);
  const result = f.command(['--recover-leg', '1', '--source', redClip, '--recovery-ref', 'Provider request reconciled; existing result downloaded']);
  assert.equal(result.status, 0, result.stderr + result.stdout);
  assert.equal(f.count(), 1);
  assert.equal(f.records()[0].status, 'complete');
  assert.match(f.records()[0].recoveryRef, /reconciled/);
});

test('local encode failure preserves the returned source and resumes without another paid call', () => {
  const f = fixture();
  const wrapper = path.join(f.build, 'fail-encode-once.sh');
  fs.writeFileSync(wrapper, '#!/usr/bin/env bash\ncase "$*" in *libx264*) if [ "${TEST_FAIL_ENCODE:-0}" = 1 ]; then exit 9; fi;; esac\nexec "$TEST_REAL_FFMPEG" "$@"\n', { mode: 0o755 });
  const result = f.command(approve(), { SCROLLCRAFT_FFMPEG: wrapper, TEST_REAL_FFMPEG: ffmpeg, TEST_FAIL_ENCODE: '1' });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /local encode failed/);
  assert.equal(f.count(), 1);
  assert.equal(f.records()[0].status, 'rendered');
  const resume = f.command(['--resume-leg', '1']);
  assert.equal(resume.status, 0, resume.stderr + resume.stdout);
  assert.equal(f.count(), 1);
  assert.equal(f.records()[0].status, 'complete');
});

test('a confirmed but unusable result is rejected and retained, never silently regenerated', () => {
  fs.writeFileSync(path.join(root, 'not-video.txt'), 'not a video');
  const f = fixture({ source: path.join(root, 'not-video.txt') });
  const result = f.command(approve());
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /returned paid result is not a readable video/);
  assert.equal(f.records()[0].status, 'rejected');
  assert.equal(f.count(), 1);
  assert.notEqual(f.command(approve()).status, 0);
  assert.equal(f.count(), 1);
});

test('changed anchors cannot be used to reconcile a prior paid attempt', () => {
  const f = fixture({ behavior: 'fail' });
  assert.notEqual(f.command(approve()).status, 0);
  fs.copyFileSync(blue, path.join(f.build, 'chain/anchor01.png'));
  const result = f.command(['--recover-leg', '1', '--source', redClip, '--recovery-ref', 'Provider request reconciled']);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /inputs changed since the paid attempt/);
  assert.equal(f.count(), 1);
  assert.equal(f.records()[0].status, 'uncertain');
});

test('soft seams require an explicit local visual review and are distinct from invalid', () => {
  const f = fixture({ anchors: [soft, soft], source: grayClip });
  const result = f.command(approve());
  assert.notEqual(result.status, 0);
  assert.equal(f.records()[0].status, 'review_required', result.stdout);
  const reviewed = f.command(['--accept-soft-leg', '1', '--review-ref', 'Visually reviewed both variants and both endpoints']);
  assert.equal(reviewed.status, 0, reviewed.stderr);
  assert.equal(f.count(), 1);
  assert.equal(f.records()[0].status, 'complete');
});

test('framelock parses inf and samples the actual final decoded frame, not an offset', () => {
  const same = execute('bash', [path.join(scripts, 'framelock.sh'), '--head', red, '--clip', redClip]);
  assert.equal(same.status, 0, same.stderr + same.stdout);
  assert.match(same.stdout, /inf dB/);
  const clip = path.join(root, 'last-frame-change.mkv');
  const last = path.join(root, 'actual-last.png');
  ff(['-f', 'lavfi', '-i', 'color=c=red:s=64x36:r=60', '-vf', "drawbox=color=blue:t=fill:enable='eq(n,3)'", '-frames:v', '4', '-c:v', 'ffv1', clip]);
  ff(['-i', clip, '-vf', 'select=eq(n\\,3)', '-frames:v', '1', last]);
  const tail = execute('bash', [path.join(scripts, 'framelock.sh'), '--tail', last, '--clip', clip]);
  assert.equal(tail.status, 0, tail.stderr + tail.stdout);
  assert.match(tail.stdout, /last decoded frame \(3\).*inf dB/);
  const wrong = execute('bash', [path.join(scripts, 'framelock.sh'), '--tail', red, '--clip', clip]);
  assert.equal(wrong.status, 1);
  const review = execute('bash', [path.join(scripts, 'framelock.sh'), '--head', soft, '--clip', grayClip]);
  assert.equal(review.status, 2, review.stdout);
});

test('encode rejects invalid modes, invalid CRFs, same path and existing output', () => {
  const output = path.join(root, 'encoded.mp4');
  for (const args of [[redClip, output, 'other'], [redClip, output, 'mobile', '52'], [redClip, output, 'desktop', '-1'], [redClip, output, 'desktop', '20.5'], [redClip, redClip]]) {
    const result = execute('bash', [path.join(scripts, 'encode.sh'), ...args]);
    assert.notEqual(result.status, 0);
    assert.equal(fs.existsSync(output), false);
  }
  const result = execute('bash', [path.join(scripts, 'encode.sh'), redClip, output, 'mobile']);
  assert.equal(result.status, 0, result.stderr);
  const original = fs.readFileSync(output);
  assert.notEqual(execute('bash', [path.join(scripts, 'encode.sh'), redClip, output]).status, 0);
  assert.deepEqual(fs.readFileSync(output), original);
  const stream = JSON.parse(execute(ffprobe, ['-v', 'error', '-select_streams', 'v:0', '-show_streams', '-of', 'json', output]).stdout).streams[0];
  assert.equal(stream.codec_name, 'h264');
  assert.equal(stream.height, 720);
  assert.equal(stream.pix_fmt, 'yuv420p');
});

test('FFmpeg capability checks require named filters and encoders, not total counts', () => {
  const stub = path.join(root, 'capability-ffmpeg.sh');
  fs.writeFileSync(stub, '#!/usr/bin/env bash\ncase "$*" in *-filters*) printf " T.. scale V->V\\n ... format V->V\\n";; *-encoders*) printf " V....D libx264 H.264\\n";; esac\n', { mode: 0o755 });
  const result = execute('bash', ['-c', '. "$1"; generation_ffmpeg "scale format" "libx264"', 'test', path.join(scripts, 'lib/generation-media.sh')], { env: { ...process.env, SCROLLCRAFT_FFMPEG: stub } });
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.stdout.trim(), stub);
  const missing = execute('bash', ['-c', '. "$1"; generation_ffmpeg "scale format psnr" "libx264"', 'test', path.join(scripts, 'lib/generation-media.sh')], { env: { ...process.env, SCROLLCRAFT_FFMPEG: stub } });
  assert.notEqual(missing.status, 0);
  assert.match(missing.stderr, /lacks required filters/);
});
