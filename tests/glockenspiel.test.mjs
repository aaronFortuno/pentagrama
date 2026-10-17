import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { glockSample, createGlockenspiel, connectLogoSound } from '../docs/glockenspiel.js';

const flush = () => new Promise(resolve => setImmediate(resolve));
class Param {
  value = 0; calls = [];
  setValueAtTime(value, time) { this.value = value; this.calls.push(['set', value, time]); }
  linearRampToValueAtTime(value, time) { this.value = value; this.calls.push(['ramp', value, time]); }
  cancelScheduledValues(time) { this.calls.push(['cancel', time]); }
}
function audioEnvironment() {
  const contexts = [], calls = [];
  const node = () => ({ connect() {}, disconnect() {} });
  class Context {
    state = 'suspended'; currentTime = 10; destination = {}; sources = []; decodes = 0;
    constructor() { contexts.push(this); }
    resume() { this.state = 'running'; return Promise.resolve(); }
    close() { this.state = 'closed'; return Promise.resolve(); }
    createGain() { return { ...node(), gain: new Param() }; }
    createDynamicsCompressor() { return Object.fromEntries([...Object.entries(node()), ...['threshold', 'knee', 'ratio', 'attack', 'release'].map(key => [key, new Param()])]); }
    createBuffer(channels, length, sampleRate) {
      const values = Array.from({ length: channels }, () => new Float32Array(length));
      return { numberOfChannels: channels, length, sampleRate, duration: length / sampleRate, getChannelData: index => values[index], copyToChannel: (data, index) => values[index].set(data) };
    }
    decodeAudioData() { this.decodes++; const buffer = this.createBuffer(1, 2000, 44100); buffer.getChannelData(0).fill(.3, 700); return Promise.resolve(buffer); }
    createBufferSource() {
      const source = { ...node(), playbackRate: new Param(), start(time) { this.startTime = time; }, stop(time) { this.stopTime = time; } };
      this.sources.push(source); return source;
    }
  }
  const env = { AudioContext: Context, fetch: async url => { calls.push(url); return { ok: true, arrayBuffer: async () => new ArrayBuffer(8) }; } };
  return { env, contexts, calls };
}

test('the compact local recordings are traceable and pitch correction reaches every destination at concert tuning', async () => {
  const root = new URL('../docs/vendor/glock/', import.meta.url), manifest = JSON.parse(await readFile(new URL('manifest.json', root)));
  let bytes = 0;
  for (const sample of manifest.samples) {
    const data = await readFile(new URL(sample.file, root)); bytes += data.length;
    assert.equal(createHash('sha256').update(data).digest('hex'), sample.sha256);
    assert.equal(data.readUInt16BE(0) & 0xffe0, 0xffe0); assert.equal(sample.sampleRate, 44100);
    assert.match(sample.pcmSha256, /^[a-f0-9]{64}$/);
  }
  assert.ok(bytes < 250_000);
  for (let midi = 64; midi <= 77; midi++) {
    const sample = glockSample(midi);
    assert.ok(Math.abs(12 * Math.log2(sample.rate)) < 4);
    assert.ok(Math.abs(sample.rootMidi + 12 * Math.log2(sample.rate) - (midi + 24)) < 1e-9);
  }
  assert.throws(() => glockSample(NaN), RangeError);
});

test('warming only fetches; a gesture creates one context and concurrent preparation decodes a sample once', async () => {
  const f = audioEnvironment(), player = createGlockenspiel({ env: f.env });
  assert.equal(f.contexts.length, 0); await player.warm();
  assert.equal(f.contexts.length, 0); assert.equal(f.calls.length, 3); assert.equal(player.play(72), null);
  assert.deepEqual(await Promise.all([player.prepare(72), player.prepare(72)]), [true, true]);
  assert.equal(f.contexts.length, 1); assert.equal(f.contexts[0].decodes, 1); assert.equal(f.calls.length, 3);
  const voice = player.play(72, { when: 12.5 });
  assert.equal(voice.time, 12.5); assert.equal(f.contexts[0].sources[0].startTime, 12.5);
  assert.equal(f.contexts[0].sources[0].buffer.length, 1388);
  assert.equal(f.contexts[0].sources[0].playbackRate.value, glockSample(72).rate);
  assert.equal(player.play(72, { when: NaN }), null);
});

test('visual timing follows the audio device timestamp and falls back without creating a context', async () => {
  const f = audioEnvironment(), player = createGlockenspiel({ env: f.env });
  assert.equal(player.presentationTime, 0); assert.equal(f.contexts.length, 0);
  await player.prepare(67); const context = f.contexts[0];
  assert.equal(player.presentationTime, context.currentTime);
  f.env.performance = { now: () => 1000 };
  context.getOutputTimestamp = () => ({ contextTime: 9.9, performanceTime: 980 });
  assert.ok(Math.abs(player.presentationTime - 9.92) < 1e-9);
  context.getOutputTimestamp = () => ({ contextTime: 12, performanceTime: 980 });
  assert.equal(player.presentationTime, context.currentTime);
});

test('overlapping tails are bounded and stopping or disposing cannot leave scheduled sound behind', async () => {
  const f = audioEnvironment(), player = createGlockenspiel({ env: f.env }); await player.prepare(67);
  for (let i = 0; i < 10; i++) player.play(67);
  assert.equal(f.contexts[0].sources.filter(source => source.stopTime !== undefined).length, 2);
  player.stopAll(); assert.ok(f.contexts[0].sources.every(source => source.stopTime === 10.03));
  player.destroy(); assert.equal(f.contexts[0].state, 'closed'); assert.equal(player.play(67), null); assert.equal(await player.prepare(67), false);
});

test('failed downloads can be retried and unsupported audio never interrupts the visual controller', async () => {
  const f = audioEnvironment(); let failed = true;
  f.env.fetch = async () => { if (failed) throw new Error('offline'); return { ok: true, arrayBuffer: async () => new ArrayBuffer(8) }; };
  const player = createGlockenspiel({ env: f.env });
  assert.equal(await player.prepare(67), false); assert.equal(player.play(67), null);
  failed = false; assert.equal(await player.prepare(67), true); assert.ok(player.play(67));
  const unsupported = createGlockenspiel({ env: {} }); assert.equal(await unsupported.prepare(67), false); assert.equal(unsupported.play(67), null);
});

function connection() {
  const document = Object.assign(new EventTarget(), { hidden: false });
  const button = Object.assign(new EventTarget(), { ownerDocument: document, dataset: {} });
  const waiting = [], played = [], env = Object.assign(new EventTarget(), {
    CustomEvent: class extends Event { constructor(name, options) { super(name, options); this.detail = options.detail; } },
  });
  const player = {
    ready: false, stopped: 0, unlocked: 0, warmed: 0,
    prepare() { return new Promise(resolve => waiting.push(resolve)); },
    isReady() { return this.ready; }, play(midi) { played.push(midi); return { time: 10 }; },
    unlock() { this.unlocked++; }, warm() { this.warmed++; }, stopAll() { this.stopped++; }, destroy() {},
  };
  const controller = connectLogoSound(button, { player, env });
  function emit(phase, sequence = 1, extra = {}) {
    button.dispatchEvent(new env.CustomEvent(`pentagrama:note-${phase}`, { detail: { note: { midi: 67 }, sequence, reducedMotion: false, ...extra } }));
  }
  return { document, button, player, waiting, played, controller, emit };
}

test('sound follows the first landing, never a late download, extra rebound or a hidden page', async () => {
  const f = connection();
  f.button.dispatchEvent(new Event('pointerenter')); assert.equal(f.player.warmed, 1); assert.equal(f.player.unlocked, 0);
  f.button.dispatchEvent(new Event('click')); assert.equal(f.player.unlocked, 1);
  f.emit('start'); f.waiting.shift()(true); await flush(); f.emit('land'); f.emit('land'); f.emit('rest');
  assert.deepEqual(f.played, [67]);
  f.emit('start', 2); f.emit('land', 2); f.waiting.shift()(true); await flush();
  assert.deepEqual(f.played, [67]);
  f.emit('start', 3); f.waiting.shift()(true); await flush(); f.document.hidden = true;
  f.document.dispatchEvent(new Event('visibilitychange')); f.emit('land', 3);
  assert.deepEqual(f.played, [67]); assert.ok(f.player.stopped > 0);
});

test('reduced motion can sound on a deliberate tap after loading, but only the latest tap and never after disposal', async () => {
  const f = connection(), reducedMotion = true;
  f.emit('start', 1, { reducedMotion }); f.emit('land', 1, { reducedMotion }); f.emit('rest', 1, { reducedMotion });
  f.emit('start', 2, { reducedMotion }); f.emit('land', 2, { reducedMotion }); f.emit('rest', 2, { reducedMotion });
  f.waiting[0](true); f.waiting[1](true); await flush(); assert.deepEqual(f.played, [67]);
  f.emit('start', 3, { reducedMotion }); f.emit('land', 3, { reducedMotion }); f.controller.destroy();
  f.waiting[2](true); await flush(); assert.deepEqual(f.played, [67]);
});
