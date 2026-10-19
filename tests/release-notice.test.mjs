import test from 'node:test';
import assert from 'node:assert/strict';
import { createNoticeTimer, shouldAnnounceRelease, RELEASE_NOTICE_DURATION } from '../docs/release-notice.js';

function timer() {
  let time = 0, expires = 0, id = 0;
  const pending = new Map(), states = [];
  const clock = createNoticeTimer({ now: () => time, schedule(callback, delay) { pending.set(++id, { callback, at: time + delay }); return id; },
    cancel: id => pending.delete(id), onState: state => states.push(state), onExpire: () => expires++ });
  function advance(delta) {
    const end = time + delta;
    while (true) {
      const next = [...pending].sort((a, b) => a[1].at - b[1].at)[0];
      if (!next || next[1].at > end) break;
      pending.delete(next[0]); time = next[1].at; next[1].callback();
    }
    time = end;
  }
  return { clock, advance, states, get expires() { return expires; }, get pending() { return pending.size; } };
}

test('release notices are opt-in and do not reappear for a version already seen', () => {
  const release = { version: '2.0.0', announcement: ['one', 'two'] };
  assert.equal(shouldAnnounceRelease(release), true);
  assert.equal(shouldAnnounceRelease(release, '1.17.2'), true);
  assert.equal(shouldAnnounceRelease(release, '2.0.0'), false);
  assert.equal(shouldAnnounceRelease({ version: '2.0.1' }, '2.0.0'), false);
  assert.equal(shouldAnnounceRelease({ version: '2.0.1', announcement: [] }), false);
});

test('the notice and its progress bar share exactly twelve seconds of active reading time', () => {
  const t = timer();
  assert.deepEqual(t.states[0], { duration: RELEASE_NOTICE_DURATION, remaining: 12000, paused: false });
  t.advance(11999); assert.equal(t.expires, 0);
  t.advance(1); assert.equal(t.expires, 1);
  assert.equal(t.states.at(-1).remaining, 0); assert.equal(t.pending, 0);
  t.advance(50000); assert.equal(t.expires, 1);
});

test('hover, focus and background pauses are independent and cannot shorten the remaining time', () => {
  const t = timer(); t.advance(3000);
  t.clock.pause('pointer'); t.clock.pause('pointer'); t.clock.pause('focus'); t.clock.pause('hidden');
  assert.equal(t.states.at(-1).remaining, 9000); assert.equal(t.pending, 0);
  t.advance(60000); t.clock.resume('pointer'); t.advance(60000); t.clock.resume('hidden');
  assert.equal(t.expires, 0); assert.equal(t.pending, 0);
  t.clock.resume('focus'); assert.equal(t.pending, 1);
  t.advance(4000); t.clock.pause('hidden');
  assert.equal(t.states.at(-1).remaining, 5000);
  t.advance(90000); t.clock.resume('hidden'); t.advance(4999); assert.equal(t.expires, 0);
  t.advance(1); assert.equal(t.expires, 1);
});

test('opening history or dismissing the notice cancels expiry, including while paused', () => {
  for (const paused of [false, true]) {
    const t = timer(); t.advance(1000); if (paused) t.clock.pause('focus');
    t.clock.stop(); t.clock.resume('focus'); t.clock.pause('pointer');
    t.advance(60000); assert.equal(t.pending, 0); assert.equal(t.expires, 0);
  }
});
