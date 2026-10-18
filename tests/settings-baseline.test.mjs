import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULTS, normalizeSettings, encodeShareHash } from '../docs/layout.js';
import { DEFAULT_TEMPLATES, suggestedTemplateSettings } from '../docs/library.js';
import { createResetBaseline } from '../docs/settings-baseline.js';
import { createSettingsHistory } from '../docs/settings-history.js';

test('a first visit starts with nine ungrouped staves while the trio preset keeps 3+3+3', () => {
  const initial = createResetBaseline().restore();
  assert.equal(initial.count, 9); assert.equal(initial.group, 0);
  assert.equal(initial.reference, false); assert.equal(initial.source, false);
  assert.equal(normalizeSettings({}).group, 0);
  assert.equal(DEFAULT_TEMPLATES.find(template => template.id === 'trio').settings.group, 3);
});

test('every guide or shared template remains the reset point after editing, including orchestral blocks and labels', () => {
  for (const template of DEFAULT_TEMPLATES) {
    const expected = suggestedTemplateSettings(template, key => key);
    const origin = createResetBaseline();
    const draft = origin.fromHash(`#${encodeShareHash(expected)}`, { reference: true, source: false });
    draft.paper = 'LETTER'; draft.count = 27; draft.thickness = .5; draft.topSpace = 90;
    if (draft.blocks.length) { draft.blocks[0].count = 20; draft.blocks[0].label = 'Modified draft'; }
    assert.deepEqual(origin.restore(), { ...expected, reference: true });
    assert.notDeepEqual(origin.restore(), draft);
  }
});

test('personal templates keep independent full snapshots and resetting them remains undoable', () => {
  const personal = normalizeSettings({ ...DEFAULTS, paper: 'A3', orientation: 'landscape', mode: 'blocks', topSpace: 30,
    source: true, reference: true, blocks: [{ label: 'Veus · 日本語', count: 4, inside: 15, after: 17 }, { label: 'Piano', count: 2, inside: 5, after: 10 }] });
  const origin = createResetBaseline(), draft = origin.capture(personal), history = createSettingsHistory(draft);
  draft.blocks[0].label = 'Revised'; draft.blocks[0].inside = 24; draft.reference = false;
  history.record(draft); history.record(origin.restore());
  assert.deepEqual(history.undo(), draft); assert.deepEqual(history.redo(), personal);
  assert.deepEqual(origin.restore(), personal);
  personal.blocks[1].count = 15;
  assert.equal(origin.restore().blocks[1].count, 2);
});

test('invalid incoming references cannot replace the last valid template', () => {
  const origin = createResetBaseline({ ...DEFAULTS, count: 12, group: 2 });
  const prior = origin.restore();
  const blocks = DEFAULT_TEMPLATES.find(template => template.id === 'choir-piano').settings;
  const mismatchedLabels = `#${encodeShareHash(blocks).split('~')[0]}~%5B%22only-one-label%22%5D`;
  for (const hash of ['#broken', '#%E0%A4%A', mismatchedLabels]) {
    assert.throws(() => origin.fromHash(hash));
    assert.deepEqual(origin.restore(), prior);
  }
});

test('a stored starting point survives reopening independently of the edited draft and can be replaced by a new template', () => {
  const first = normalizeSettings({ ...DEFAULTS, count: 6, lineSpacing: 3, thickness: .08 });
  const storedOrigin = JSON.stringify(createResetBaseline(first).restore());
  const editedDraft = { ...first, count: 16, topSpace: 40 };
  const reopened = createResetBaseline(JSON.parse(storedOrigin));
  assert.deepEqual(reopened.restore(), first); assert.notDeepEqual(reopened.restore(), editedDraft);
  const next = normalizeSettings({ ...DEFAULTS, count: 12, group: 4 });
  reopened.capture(next); assert.deepEqual(reopened.restore(), next);
  const shared = reopened.fromHash(encodeShareHash(first), { source: true });
  assert.deepEqual(shared, { ...first, source: true });
  assert.deepEqual(reopened.restore(), shared);
});
