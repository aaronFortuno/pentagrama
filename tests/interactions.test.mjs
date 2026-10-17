import test from 'node:test';
import assert from 'node:assert/strict';
import { bindTouchRange, rangeValueAt } from '../docs/touch-range.js';

class Range extends EventTarget {
  min = '0'; max = '100'; step = '1'; value = '25'; focused = 0;
  getBoundingClientRect() { return { left: 0, width: 214 }; }
  setPointerCapture() {}
  focus() { this.focused++; }
}
function pointer(input, type, x, y, extra = {}) {
  const event = new Event(type, { cancelable: true });
  for (const [key, value] of Object.entries({ pointerType: 'touch', isPrimary: true, pointerId: 1, clientX: x, clientY: y, ...extra })) Object.defineProperty(event, key, { value });
  input.dispatchEvent(event); return event;
}
function range() {
  const input = new Range(), changes = [];
  input.addEventListener('input', () => changes.push(Number(input.value))); bindTouchRange(input);
  return { input, changes };
}

test('touching a range waits until release before applying a deliberate tap', () => {
  const { input, changes } = range();
  assert.equal(pointer(input, 'pointerdown', 167, 50).defaultPrevented, true);
  assert.equal(input.value, '25'); assert.deepEqual(changes, []); assert.equal(input.focused, 0);
  pointer(input, 'pointerup', 167, 50);
  assert.equal(Number(input.value), 80); assert.deepEqual(changes, [80]);
});

test('a vertical scroll starting over a range leaves the paper configuration unchanged', () => {
  const { input, changes } = range();
  pointer(input, 'pointerdown', 167, 50); pointer(input, 'pointermove', 170, 110); pointer(input, 'pointerup', 170, 110);
  assert.equal(input.value, '25'); assert.deepEqual(changes, []); assert.equal(input.focused, 0);
});

test('horizontal touch adjustment starts after the intent threshold and cancellation restores the original value', () => {
  const { input, changes } = range();
  pointer(input, 'pointerdown', 57, 50); pointer(input, 'pointermove', 60, 51);
  assert.deepEqual(changes, []);
  pointer(input, 'pointermove', 107, 52); assert.equal(Number(input.value), 50);
  pointer(input, 'pointercancel', 107, 52); pointer(input, 'pointerup', 167, 52);
  assert.equal(Number(input.value), 25); assert.deepEqual(changes, [50, 25]);
});

test('mouse, keyboard and assistive input retain native behavior, while secondary touches cannot move the range', () => {
  const { input, changes } = range();
  assert.equal(pointer(input, 'pointerdown', 167, 50, { pointerType: 'mouse' }).defaultPrevented, false);
  assert.equal(pointer(input, 'pointerdown', 167, 50, { isPrimary: false }).defaultPrevented, true);
  input.value = '80'; input.dispatchEvent(new Event('input'));
  assert.deepEqual(changes, [80]);
  const key = new Event('keydown', { cancelable: true }); input.dispatchEvent(key); assert.equal(key.defaultPrevented, false);
});

test('touch coordinates respect the thumb bounds, limits and fractional millimetre steps', () => {
  const input = new Range(); input.min = '0.05'; input.max = '0.5'; input.step = '0.01';
  assert.equal(rangeValueAt(input, -50), 0.05); assert.equal(rangeValueAt(input, 300), 0.5);
  assert.equal(rangeValueAt(input, 100), 0.26);
  input.getBoundingClientRect = () => ({ left: 0, width: 0 }); assert.ok(Number.isFinite(rangeValueAt(input, 100)));
});
