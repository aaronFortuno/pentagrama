import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULTS, normalizeSettings } from '../docs/layout.js';
import { createSettingsHistory, historyShortcut } from '../docs/settings-history.js';

test('undo and redo restore complete independent configurations, including blocks and footer choices', () => {
  const original = normalizeSettings(DEFAULTS), history = createSettingsHistory(original);
  assert.equal(history.canUndo, false); assert.equal(history.canRedo, false);
  assert.equal(history.undo(), undefined); assert.equal(history.redo(), undefined);
  const blocks = normalizeSettings({ ...original, paper: 'A3', mode: 'blocks', source: true, reference: true,
    topSpace: 28, blocks: [{ label: 'Veus', count: 4, inside: 12, after: 14 }, { label: 'Piano', count: 2, inside: 6, after: 14 }] });
  history.record(blocks); blocks.blocks[0].label = 'Changed outside history';
  assert.deepEqual(history.undo(), original);
  const restored = history.redo(); assert.equal(restored.blocks[0].label, 'Veus'); assert.equal(restored.source, true);
  restored.blocks[0].count = 30;
  assert.deepEqual(history.undo(), original); assert.equal(history.redo().blocks[0].count, 4);
});

test('a continuous slider gesture is one undo step; the next gesture stays separate', () => {
  const history = createSettingsHistory(DEFAULTS), slider = {};
  for (const thickness of [.15, .2, .25, .3]) history.record({ ...DEFAULTS, thickness }, { group: slider });
  history.endGroup();
  for (const thickness of [.32, .4]) history.record({ ...DEFAULTS, thickness }, { group: slider });
  assert.equal(history.undo().thickness, .3); assert.equal(history.undo().thickness, .12);
  assert.equal(history.canUndo, false); assert.equal(history.redo().thickness, .3); assert.equal(history.redo().thickness, .4);
});

test('a cancelled gesture returning to its starting value leaves no phantom undo step', () => {
  const history = createSettingsHistory(DEFAULTS), slider = {};
  history.record({ ...DEFAULTS, thickness: .3 }, { group: slider });
  history.record(DEFAULTS, { group: slider }); history.endGroup();
  assert.equal(history.canUndo, false); assert.equal(history.canRedo, false);
});

test('new edits after undo discard the abandoned future and no-op rendering keeps redo available', () => {
  const history = createSettingsHistory(DEFAULTS);
  history.record({ ...DEFAULTS, count: 10 }); history.record({ ...DEFAULTS, count: 11 });
  const prior = history.undo(); assert.equal(prior.count, 10);
  assert.equal(history.record(prior), false); assert.equal(history.canRedo, true);
  history.record({ ...prior, orientation: 'landscape' }); assert.equal(history.canRedo, false);
  assert.equal(history.undo().orientation, 'portrait'); assert.equal(history.redo().count, 10);
});

test('history is bounded and reset, imported layouts and fitted configurations remain ordinary undoable states', () => {
  const history = createSettingsHistory(DEFAULTS, { limit: 3 });
  for (const count of [10, 11, 12, 13, 14]) history.record({ ...DEFAULTS, count });
  assert.equal(history.undo().count, 13); assert.equal(history.undo().count, 12); assert.equal(history.undo().count, 11);
  assert.equal(history.undo(), undefined); assert.equal(history.redo().count, 12);
  history.record(DEFAULTS); assert.equal(history.undo().count, 12); assert.deepEqual(history.redo(), normalizeSettings(DEFAULTS));
});

test('keyboard shortcuts support Control and Command while preserving native editing and dialogs', () => {
  const event = { key: 'z', ctrlKey: true };
  assert.equal(historyShortcut(event), 'undo'); assert.equal(historyShortcut({ ...event, shiftKey: true }), 'redo');
  assert.equal(historyShortcut({ key: 'Z', metaKey: true }), 'undo');
  assert.equal(historyShortcut({ key: 'y', ctrlKey: true }), 'redo');
  for (const extra of [{ altKey: true }, { defaultPrevented: true }, { ctrlKey: false }, { target: { isContentEditable: true } }, { target: { closest: () => ({}) } }]) assert.equal(historyShortcut({ ...event, ...extra }), undefined);
  assert.equal(historyShortcut({ ...event, target: { closest: () => null } }), 'undo');
});
