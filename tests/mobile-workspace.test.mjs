import test from 'node:test';
import assert from 'node:assert/strict';
import { mobilePreviewSpace } from '../docs/mobile-workspace.js';

test('collapsing mobile settings returns the covered space to the sheet', () => {
  const sizes = { height: 640, panelHeight: 397, handleHeight: 44 };
  const closed = mobilePreviewSpace({ ...sizes, open: false });
  const open = mobilePreviewSpace({ ...sizes, open: true });
  assert.equal(closed.preview + closed.covered, sizes.height);
  assert.equal(open.preview + open.covered, sizes.height);
  assert.equal(closed.preview - open.preview, sizes.panelHeight - sizes.handleHeight);
  assert.ok(open.preview > 200);
});

test('short viewports and keyboard resizing cannot produce negative sheet space', () => {
  for (const height of [0, 80, 240, 720]) {
    for (const open of [false, true]) {
      const result = mobilePreviewSpace({ height, panelHeight: 420, handleHeight: 44, open });
      assert.ok(result.preview >= 0); assert.ok(result.covered >= 0);
      assert.equal(result.preview + result.covered, height);
    }
  }
});
