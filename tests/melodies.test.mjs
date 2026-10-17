import test from 'node:test';
import assert from 'node:assert/strict';
import { MELODIES, melodyNote, planMelody } from '../docs/melodies.js';
import { INITIAL_NOTE, sampleNoteJump } from '../docs/logo-note.js';
import { createMelodyPlayer } from '../docs/melody-player.js';
import { messages } from '../docs/i18n.js';

test('six sourced excerpts fit the logo, retain accidentals and have complete translations', () => {
  assert.equal(MELODIES.length, 6); assert.equal(new Set(MELODIES.map(m => m.id)).size, 6);
  assert.equal(melodyNote('D#5', 0).midi, 75); assert.equal(melodyNote('Bb4', 1).midi, 70);
  assert.throws(() => melodyNote('G7', 0), RangeError);
  for (const melody of MELODIES) {
    assert.match(melody.source, /^https:\/\/www.mutopiaproject.org\//);
    const timeline = planMelody(melody, INITIAL_NOTE);
    assert.ok(timeline.duration > 3000 && timeline.duration < 15_000);
    for (const entry of timeline.entries) assert.ok(entry.note.step >= 0 && entry.note.step <= 8);
    for (const locale of Object.values(messages)) for (const key of ['label', 'title', 'story', 'reason']) assert.ok(locale[`melody_${melody.id}_${key}`]);
  }
});

test('musical attacks have exact shared times, with nonoverlapping jumps and continuous landings', () => {
  for (const melody of [...MELODIES, { tempo: 120, notes: [{ pitch: 'E4', beats: .5 }, { pitch: null, beats: 1 }, { pitch: 'D#5', beats: 1.5 }] }]) {
    const timeline = planMelody(melody, INITIAL_NOTE), beat = 60_000 / melody.tempo;
    let at = 520, index = 0, previous;
    for (const note of melody.notes) {
      if (note.pitch) {
        const entry = timeline.entries[index++]; assert.ok(Math.abs(entry.at - at) < 1e-8);
        assert.ok(Math.abs(entry.start + entry.plan.touchdown - at) < 1e-8);
        if (previous) { assert.ok(entry.start >= previous.end); assert.deepEqual(entry.plan.from, previous.note); }
        for (const boundary of [entry.plan.takeoff, entry.plan.touchdown, entry.plan.touchdown + entry.plan.impact, entry.plan.duration]) {
          const a = sampleNoteJump(entry.plan, boundary - .00001), b = sampleNoteJump(entry.plan, boundary + .00001);
          for (const key of ['x', 'y', 'scaleX', 'scaleY']) assert.ok(Math.abs(a[key] - b[key]) < .001);
        }
        previous = entry;
      }
      at += note.beats * beat;
    }
    assert.ok(Math.abs(timeline.duration - at) < 1e-8);
  }
});

function fixture() {
  const document = Object.assign(new EventTarget(), { hidden: false }), callbacks = new Map(), states = [], scheduled = [], painted = [];
  let id = 0, time = 20, releases = 0, stopped = 0;
  const env = Object.assign(new EventTarget(), {
    requestAnimationFrame(callback) { callbacks.set(++id, callback); return id; }, cancelAnimationFrame(id) { callbacks.delete(id); },
  });
  const player = {
    prepare: async () => true, isReady: () => true,
    get currentTime() { return time; }, get presentationTime() { return time - .04; },
    play(midi, { when }) { scheduled.push({ midi, when, requested: time }); }, stopAll() { stopped++; },
  };
  const note = { current: INITIAL_NOTE, takeControl() { return {
    paint(plan, elapsed) { painted.push({ plan, elapsed, time: player.presentationTime }); }, release() { releases++; },
  }; } };
  const controller = createMelodyPlayer({ note, player, document, env, onState: state => states.push(state) });
  function frame(milliseconds) { time = 20 + milliseconds / 1000; const pending = [...callbacks.values()]; callbacks.clear(); for (const callback of pending) callback(milliseconds); }
  return { controller, player, document, env, scheduled, painted, states, callbacks, frame, get releases() { return releases; }, get stopped() { return stopped; } };
}

test('audio keeps the score rhythm while visuals follow the output clock without cumulative drift', async () => {
  for (const cadence of [1000 / 60, 1000 / 144, 48]) {
    const f = fixture(), melody = MELODIES[0], timeline = planMelody(melody, INITIAL_NOTE);
    assert.equal(await f.controller.play(melody), true);
    for (let elapsed = 0; elapsed < timeline.duration + 500; elapsed += cadence) f.frame(elapsed);
    assert.equal(f.scheduled.length, timeline.entries.length);
    f.scheduled.forEach((sound, index) => {
      const entry = timeline.entries[index]; assert.equal(sound.midi, entry.note.midi);
      assert.ok(Math.abs(sound.when - (20.08 + entry.at / 1000)) < 1e-8);
      assert.ok(sound.requested < sound.when);
    });
    const plans = [...new Set(f.painted.map(paint => paint.plan))]; assert.equal(plans.length, timeline.entries.length);
    plans.forEach((plan, index) => {
      const entry = timeline.entries[index], frames = f.painted.filter(paint => paint.plan === plan);
      for (const paint of frames) assert.ok(Math.abs(paint.elapsed - Math.min(plan.duration, (paint.time - 20.08) * 1000 - entry.start)) < 1e-8);
      const contact = frames.find(paint => paint.elapsed >= plan.touchdown);
      assert.ok(contact); assert.ok(Math.abs(contact.time - (20.08 + entry.at / 1000)) < cadence / 1000 + 1e-8);
    });
    assert.deepEqual(f.states, ['loading', 'playing', 'ended']); assert.equal(f.releases, 1); assert.equal(f.callbacks.size, 0);
  }
});

test('cancelling loading or starting a newer request cannot resurrect an old melody', async () => {
  const f = fixture(), waiting = [];
  f.player.prepare = () => new Promise(resolve => waiting.push(resolve));
  const first = f.controller.play(MELODIES[0]); f.controller.stop();
  for (const resolve of waiting.splice(0)) resolve(true);
  assert.equal(await first, false); assert.equal(f.callbacks.size, 0); assert.equal(f.scheduled.length, 0);
  const old = f.controller.play(MELODIES[0]), latest = f.controller.play(MELODIES[1]);
  for (const resolve of waiting) resolve(true);
  assert.equal(await old, false); assert.equal(await latest, true); assert.equal(f.controller.active, true);
  f.controller.destroy(); assert.equal(f.callbacks.size, 0);
});

test('late frames skip missed sounds, while hiding, printing and disposal cancel future notes', async () => {
  const f = fixture(); await f.controller.play(MELODIES[0]); f.frame(2000);
  assert.ok(f.scheduled.length < 4); assert.ok(f.scheduled.every(sound => sound.when >= sound.requested - .035));
  f.document.hidden = true; f.document.dispatchEvent(new Event('visibilitychange'));
  assert.equal(f.controller.active, false); assert.equal(f.callbacks.size, 0); assert.equal(f.releases, 1);
  const count = f.scheduled.length; f.frame(10_000); assert.equal(f.scheduled.length, count);
  f.document.hidden = false; await f.controller.play(MELODIES[0]); f.env.dispatchEvent(new Event('beforeprint'));
  assert.equal(f.controller.active, false); assert.equal(f.callbacks.size, 0);
  f.controller.destroy(); assert.equal(await f.controller.play(MELODIES[0]), false);
});

test('missing recordings, interrupted audio and invalid scores fail cleanly without a silent animation', async () => {
  const f = fixture(); f.player.prepare = async () => false;
  assert.equal(await f.controller.play(MELODIES[0]), false); assert.equal(f.states.at(-1), 'unavailable'); assert.equal(f.callbacks.size, 0);
  f.player.prepare = async () => true; await f.controller.play(MELODIES[0]);
  f.player.isReady = () => false; f.frame(100); assert.equal(f.controller.active, false);
  assert.equal(await f.controller.play({ tempo: NaN, notes: [] }), false); assert.equal(f.callbacks.size, 0);
});
