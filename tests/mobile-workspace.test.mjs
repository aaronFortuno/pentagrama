import test from 'node:test';
import assert from 'node:assert/strict';
import { bindSheetDrag, sheetDragOffset } from '../docs/mobile-workspace.js';
import { previewView } from '../docs/preview.js';

test('mobile preview fits width at the top for every paper orientation, independently of the sheet overlay', () => {
  for (const page of [{ width: 210, height: 297 }, { width: 297, height: 210 }, { width: 297, height: 420 }, { width: 216, height: 279 }]) {
    const viewport = { width: 352, height: 640 };
    const initial = previewView(page, viewport, 1, { x: 0, y: 0 }, { fitWidth: true });
    assert.equal(initial.width, viewport.width); assert.equal(initial.y, 0);
    const panned = previewView(page, viewport, 3, { x: 9999, y: -9999 }, { fitWidth: true });
    assert.equal(panned.x, (panned.width - viewport.width) / 2);
    assert.equal(panned.y, Math.min(0, viewport.height - panned.height));
    const reset = previewView(page, viewport, 1, { x: 0, y: 0 }, { fitWidth: true });
    assert.deepEqual(reset, initial);
    assert.ok(initial.width > 300);
  }
});

test('fit-width paper can pan vertically at 100% in a short mobile viewport', () => {
  const page = { width: 210, height: 297 }, viewport = { width: 352, height: 290 };
  const view = previewView(page, viewport, 1, { x: 99, y: -999 }, { fitWidth: true });
  assert.equal(view.canPan, true); assert.equal(view.x, 0);
  assert.equal(view.y, viewport.height - view.height);
  assert.equal(previewView(page, viewport, 1, { x: 0, y: 999 }, { fitWidth: true }).y, 0);
});

class Handle extends EventTarget {
  captured = false;
  setPointerCapture() { this.captured = true; }
  hasPointerCapture() { return this.captured; }
  releasePointerCapture() { this.captured = false; }
}
function gesture() {
  const handle = new Handle(), offsets = [], states = [];
  let open = false, enabled = true;
  bindSheetDrag({ handle, enabled: () => enabled, read: () => ({ open, travel: 350 }), move: offset => offsets.push(offset), settle: value => { open = value; states.push(value); } });
  function send(type, y, extra = {}) {
    const event = new Event(type, { cancelable: true });
    for (const [key, value] of Object.entries({ isPrimary: true, button: 0, pointerId: 1, clientY: y, detail: 1, ...extra })) Object.defineProperty(event, key, { value });
    handle.closest = () => extra.action === true;
    handle.dispatchEvent(event); return event;
  }
  return { handle, offsets, states, send, disable: () => { enabled = false; } };
}

test('the sheet follows a deliberate drag and snaps open or closed without a second click', () => {
  const g = gesture();
  g.send('pointerdown', 500); g.send('pointermove', 497); assert.deepEqual(g.offsets, []);
  g.send('pointermove', 420); assert.deepEqual(g.offsets, [270]);
  g.send('pointerup', 420); assert.deepEqual(g.states, [true]);
  assert.equal(g.send('click', 420).defaultPrevented, true);
  assert.equal(g.send('click', 420).defaultPrevented, false);
  g.send('pointerdown', 200); g.send('pointermove', 290); assert.equal(g.offsets.at(-1), 90);
  g.send('pointerup', 290); assert.deepEqual(g.states, [true, false]);
});

test('taps, short drags, cancellations, secondary pointers and desktop input cannot unexpectedly open the sheet', () => {
  const g = gesture();
  g.send('pointerdown', 300); g.send('pointerup', 300); assert.deepEqual(g.states, []);
  g.send('pointerdown', 300); g.send('pointermove', 285); g.send('pointerup', 285); assert.equal(g.states.at(-1), false);
  g.send('pointerdown', 300); g.send('pointermove', 100); g.send('pointercancel', 100); assert.equal(g.states.at(-1), false);
  assert.equal(g.send('click', 100, { detail: 0 }).defaultPrevented, false);
  const count = g.offsets.length;
  g.send('pointerdown', 300, { action: true }); g.send('pointermove', 100); assert.equal(g.offsets.length, count);
  g.send('pointerdown', 300, { isPrimary: false }); g.send('pointermove', 100); assert.equal(g.offsets.length, count);
  g.disable(); g.send('pointerdown', 300); g.send('pointermove', 100); assert.equal(g.offsets.length, count);
  assert.equal(g.handle.captured, false);
});

test('dragging cannot move the sheet beyond either resting position', () => {
  assert.equal(sheetDragOffset({ open: false, travel: 350, delta: -900 }), 0);
  assert.equal(sheetDragOffset({ open: true, travel: 350, delta: 900 }), 350);
});
