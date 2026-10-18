import test from 'node:test';
import assert from 'node:assert/strict';
import { incrementValue, stepNumberInput } from '../docs/number-input.js';
import { DEFAULTS, encodeReference, decodeReference, normalizeSettings } from '../docs/layout.js';
import { createSettingsHistory } from '../docs/settings-history.js';

test('one-millimetre spacing steps keep the precision of imported templates', () => {
  const original = normalizeSettings({ ...DEFAULTS, mode: 'blocks', systems: 2, systemGap: 18.5,
    blocks: [{ label: '', count: 4, inside: 7.3, after: 14.5 }] });
  const restored = decodeReference(encodeReference(original));
  assert.equal(incrementValue(restored.blocks[0].inside, 1), 8.3);
  assert.equal(incrementValue(restored.blocks[0].after, -1), 13.5);
  assert.equal(incrementValue(restored.systemGap, 1), 19.5);
  assert.equal(restored.blocks[0].inside, 7.3);
});

test('fine line controls retain their own steps without floating-point drift', () => {
  assert.equal(incrementValue('0.12', 1, { step: .01 }), .13);
  assert.equal(incrementValue('0.12', -1, { step: .01 }), .11);
  assert.equal(incrementValue('1.6', 1, { step: .1 }), 1.7);
  assert.equal(incrementValue('2.2', -1, { step: .1 }), 2.1);
});

test('increment controls respect bounds and empty edits have a valid starting value', () => {
  assert.equal(incrementValue('32', 1, { min: 1, max: 32 }), 32);
  assert.equal(incrementValue('1', -1, { min: 1, max: 32 }), 1);
  assert.equal(incrementValue('0.49', 1, { step: .03, min: .05, max: .5 }), .5);
  assert.equal(incrementValue('', 1, { min: 1, max: 60 }), 1);
  assert.equal(incrementValue('', -1, { min: 0, max: 100 }), 0);
});

test('each arrow press is undoable independently of a pending typed spacing edit', () => {
  const input = Object.assign(new EventTarget(), { value: '18.5', min: '1', max: '60', step: 'any', dataset: { increment: '1' }, disabled: false });
  const history = createSettingsHistory({ ...DEFAULTS, systemGap: 18 });
  history.record({ ...DEFAULTS, systemGap: 18.5 }, { group: input });
  input.addEventListener('input', () => history.record({ ...DEFAULTS, systemGap: Number(input.value) }, { group: input }));
  input.addEventListener('change', () => history.endGroup());
  stepNumberInput(input, 1); assert.equal(input.value, '19.5');
  stepNumberInput(input, 1); assert.equal(input.value, '20.5');
  assert.equal(history.undo().systemGap, 19.5);
  assert.equal(history.undo().systemGap, 18.5);
  assert.equal(history.undo().systemGap, 18);
  input.disabled = true; stepNumberInput(input, -1); assert.equal(input.value, '20.5');
});
