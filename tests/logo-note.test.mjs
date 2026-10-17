import test from 'node:test';
import assert from 'node:assert/strict';
import { INITIAL_NOTE, logoNote, nextLogoNote, planNoteJump, sampleNoteJump, createLogoNote } from '../docs/logo-note.js';

test('destinations use the three columns and treble staff lines or spaces, without repeating the same note', () => {
  const destinations = new Set();
  for (let index = 0; index < 26; index++) {
    const note = nextLogoNote(INITIAL_NOTE, () => (index + 0.5) / 26);
    assert.notDeepEqual(note, INITIAL_NOTE); destinations.add(`${note.column}:${note.step}`);
    assert.equal(note.y, 23 - note.step * 2); assert.ok([7, 15, 23].includes(note.x));
  }
  assert.equal(destinations.size, 26);
  assert.equal(logoNote({ column: 0, step: 0 }).midi, 64);
  assert.equal(logoNote({ column: 1, step: 5 }).pitch, 'C5');
  assert.throws(() => logoNote({ column: 1, step: 9 }), RangeError);
});

test('gravity slows the ascent and accelerates the descent, with continuous squash and an exact resting destination', () => {
  const to = logoNote({ column: 0, step: 6 }), plan = planNoteJump(INITIAL_NOTE, to);
  const start = sampleNoteJump(plan, 0), prepared = sampleNoteJump(plan, 120), launched = sampleNoteJump(plan, plan.takeoff);
  assert.equal(start.scaleY, 1); assert.ok(prepared.scaleY < 1 && prepared.scaleX > 1);
  assert.ok(launched.scaleY > 1 && launched.scaleX < 1);
  const apex = plan.takeoff + plan.rise;
  const heights = [-90, -60, -30, 0, 30, 60, 90].map(offset => sampleNoteJump(plan, apex + offset).y);
  assert.ok(heights[0] - heights[1] > heights[1] - heights[2]);
  assert.ok(heights[4] - heights[3] < heights[5] - heights[4]);
  for (const boundary of [120, plan.takeoff, plan.touchdown, plan.touchdown + 58, plan.touchdown + 268, plan.duration]) {
    const before = sampleNoteJump(plan, boundary - 0.0001), after = sampleNoteJump(plan, boundary + 0.0001);
    for (const key of ['x', 'y', 'scaleX', 'scaleY']) assert.ok(Math.abs(before[key] - after[key]) < 0.001, `Discontinuity in ${key}`);
  }
  assert.ok(sampleNoteJump(plan, plan.touchdown + 58).scaleY < 0.7);
  assert.deepEqual(sampleNoteJump(plan, plan.duration), { x: to.x, y: to.y, scaleX: 1, scaleY: 1, phase: 'rest' });
});

test('every jump keeps the entire deformed notehead inside the logo', () => {
  const notes = Array.from({ length: 27 }, (_, index) => logoNote({ column: Math.floor(index / 9), step: index % 9 }));
  const halfHeight = Math.hypot(2.7 * Math.sin(Math.PI / 9), 1.8 * Math.cos(Math.PI / 9));
  const halfWidth = Math.hypot(2.7 * Math.cos(Math.PI / 9), 1.8 * Math.sin(Math.PI / 9));
  for (const from of notes) for (const to of notes) {
    const plan = planNoteJump(from, to);
    for (let progress = 0; progress <= 100; progress++) {
      const frame = sampleNoteJump(plan, plan.duration * progress / 100);
      assert.ok(frame.x - halfWidth * frame.scaleX >= 0 && frame.x + halfWidth * frame.scaleX <= 31);
      assert.ok(frame.y - halfHeight * frame.scaleY >= 0 && frame.y + halfHeight * frame.scaleY <= 30);
    }
  }
});

function fixture(reduced = false) {
  const document = Object.assign(new EventTarget(), { hidden: false });
  const position = { setAttribute(name, value) { this[name] = value; } }, body = { ...position };
  const button = Object.assign(new EventTarget(), { ownerDocument: document, dataset: {}, querySelector: selector => selector === '[data-note-position]' ? position : body });
  const callbacks = new Map(), preference = Object.assign(new EventTarget(), { matches: reduced });
  let id = 0;
  const env = Object.assign(new EventTarget(), {
    matchMedia: () => preference,
    requestAnimationFrame: callback => { callbacks.set(++id, callback); return id; },
    cancelAnimationFrame: key => callbacks.delete(key),
    CustomEvent: class extends Event { constructor(name, options) { super(name, options); this.detail = options.detail; } },
  });
  const events = [];
  for (const phase of ['start', 'land', 'rest']) button.addEventListener(`pentagrama:note-${phase}`, event => events.push({ phase, ...event.detail }));
  const controller = createLogoNote(button, { env, random: () => 0 });
  const frame = timestamp => { const pending = [...callbacks.values()]; callbacks.clear(); pending.forEach(callback => callback(timestamp)); };
  return { button, body, position, document, env, preference, callbacks, events, controller, frame };
}

test('rapid activations keep one queued jump and emit one landing per destination, independent of the frame cadence', () => {
  for (const interval of [1000 / 60, 1000 / 144, 250]) {
    const f = fixture(), first = logoNote({ column: 0, step: 7 }), last = logoNote({ column: 1, step: 0 });
    f.controller.jumpTo(first); f.controller.jumpTo(INITIAL_NOTE); f.controller.jumpTo(last);
    for (let time = 0; time < 4000; time += interval) f.frame(time);
    assert.deepEqual(f.events.map(event => event.phase), ['start', 'land', 'rest', 'start', 'land', 'rest']);
    assert.deepEqual(f.events.filter(event => event.phase === 'land').map(event => event.note), [first, last]);
    assert.equal(f.position.transform, `translate(${last.x} ${last.y})`);
    assert.equal(f.body.transform, 'scale(1 1)'); assert.equal(f.callbacks.size, 0);
  }
});

test('reduced motion moves directly to the note and changing the preference stops an active animation', () => {
  const f = fixture(true);
  f.button.dispatchEvent(new Event('click'));
  assert.deepEqual(f.events.map(event => event.phase), ['start', 'land', 'rest']);
  assert.ok(f.events.every(event => event.reducedMotion)); assert.equal(f.callbacks.size, 0);
  f.preference.matches = false; f.controller.jumpTo(INITIAL_NOTE); f.frame(0); f.frame(200);
  f.preference.matches = true; f.preference.dispatchEvent(new Event('change'));
  assert.equal(f.button.dataset.notePhase, 'rest'); assert.equal(f.callbacks.size, 0);
  assert.equal(f.events.at(-1).cancelled, true); assert.equal(f.position.transform, 'translate(23 19)');
});

test('hiding the page drops queued jumps and settles without a delayed landing; destroying detaches the control', () => {
  const f = fixture(), target = logoNote({ column: 0, step: 8 });
  f.controller.jumpTo(target); f.controller.jumpTo(INITIAL_NOTE); f.frame(0); f.frame(200);
  f.document.hidden = true; f.document.dispatchEvent(new Event('visibilitychange'));
  f.frame(5000);
  assert.deepEqual(f.events.map(event => event.phase), ['start', 'rest']);
  assert.equal(f.position.transform, `translate(${target.x} ${target.y})`); assert.equal(f.callbacks.size, 0);
  f.document.hidden = false; f.controller.destroy(); f.button.dispatchEvent(new Event('click'));
  assert.equal(f.controller.jumpTo(INITIAL_NOTE), false); assert.equal(f.events.length, 2);
});
