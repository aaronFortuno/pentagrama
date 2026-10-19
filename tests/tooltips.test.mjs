import test from 'node:test';
import assert from 'node:assert/strict';
import { tooltipPosition } from '../docs/tooltips.js';

test('help labels remain inside narrow viewports at every edge', () => {
  for (const viewport of [{ width: 320, height: 240 }, { width: 1280, height: 720 }]) {
    for (const left of [0, viewport.width / 2, viewport.width - 28]) {
      for (const top of [0, viewport.height / 2, viewport.height - 28]) {
        const size = { width: Math.min(280, viewport.width - 16), height: 64 };
        const position = tooltipPosition({ left, right: left + 28, top, bottom: top + 28 }, size, viewport);
        assert.ok(position.left >= 8); assert.ok(position.top >= 8);
        assert.ok(position.left + size.width <= viewport.width - 8);
        assert.ok(position.top + size.height <= viewport.height - 8);
      }
    }
  }
});

test('labels near the header open below their control and footer labels open above it', () => {
  const size = { width: 140, height: 40 }, viewport = { width: 320, height: 240 };
  const header = { left: 150, right: 178, top: 8, bottom: 36 };
  const footer = { left: 150, right: 178, top: 204, bottom: 232 };
  assert.ok(tooltipPosition(header, size, viewport).top >= header.bottom + 8);
  assert.ok(tooltipPosition(footer, size, viewport).top + size.height <= footer.top - 8);
});
