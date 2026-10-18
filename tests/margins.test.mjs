import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULTS, DEFAULT_MARGINS, normalizeSettings, createLayout, fitSettings, encodeReference, decodeReference, encodeShareHash, decodeShareHash, renderSheet, footerLines, FOOTER_SIZE } from '../docs/layout.js';
import { createPdf } from '../docs/pdf.js';
import { DEFAULT_TEMPLATES, addTemplate, normalizeLibrary } from '../docs/library.js';
import { createSettingsHistory } from '../docs/settings-history.js';
import { createResetBaseline } from '../docs/settings-baseline.js';
import { marginPatch, asymmetricMargins } from '../docs/margins-control.js';
import { stepNumberInput } from '../docs/number-input.js';

test('old settings, references and presets retain their original margins and reference versions', () => {
  for (const raw of [{}, null, { marginLeft: NaN, marginRight: '', marginTop: Infinity, marginBottom: null }]) {
    const settings = normalizeSettings(raw);
    for (const [key, expected] of Object.entries(DEFAULT_MARGINS)) assert.equal(settings[key], expected);
  }
  for (const code of ['P1-N9-G3-E22-T12', 'P2-A4-P-I20-T12-N9-G0-E22', 'P3-A4-P-I20-T12-H30-N9-G0-E22']) {
    const layout = createLayout(decodeReference(code));
    assert.equal(layout.left, 18); assert.equal(layout.right, 192);
    assert.equal(layout.top, 21 + layout.topSpace); assert.equal(layout.bottom, 276);
  }
  for (const template of DEFAULT_TEMPLATES) assert.ok(encodeReference(template.settings).startsWith('P2-'));
  assert.equal(normalizeSettings({ marginTop: -1 }).marginTop, 0);
  assert.equal(normalizeSettings({ marginLeft: 101 }).marginLeft, 100);
  assert.equal(normalizeSettings({ marginBottom: 22.7 }).marginBottom, 23);
});

test('asymmetric margins and extra top space share the same physical bounds in SVG and PDF for every format', () => {
  for (const paper of ['A4', 'A3', 'LETTER']) for (const orientation of ['portrait', 'landscape']) {
    for (const base of [DEFAULTS, DEFAULT_TEMPLATES.find(item => item.id === 'choir-piano').settings]) {
      const settings = normalizeSettings({ ...base, paper, orientation, topSpace: 25, marginTop: 12, marginBottom: 30, marginLeft: 11, marginRight: 27 });
      const fitted = fitSettings(settings), layout = createLayout(fitted);
      assert.ok(layout.valid); assert.equal(layout.left, 11); assert.equal(layout.right, layout.width - 27);
      assert.equal(layout.top, 37); assert.equal(layout.bottom, layout.height - 30);
      assert.ok(layout.staves[0][0] >= layout.top - 1e-7);
      assert.ok(layout.staves.at(-1).at(-1) <= layout.bottom + 1e-7);
      for (const key of Object.keys(DEFAULT_MARGINS)) assert.equal(fitted[key], settings[key]);
      const svg = renderSheet(fitted), pdf = new TextDecoder().decode(createPdf(fitted));
      assert.ok(svg.includes(`<line x1="11" x2="${layout.width - 27}"`));
      const coordinates = /([\d.]+) ([\d.]+) m ([\d.]+) ([\d.]+) l S/.exec(pdf).slice(1).map(Number);
      const expected = [11, layout.height - layout.staves[0][0], layout.width - 27, layout.height - layout.staves[0][0]];
      expected.forEach((mm, index) => assert.ok(Math.abs(coordinates[index] - mm * 72 / 25.4) < .00001));
    }
  }
});

test('custom margins round-trip through strict P4 references, shared links, saved templates and reset', () => {
  for (const base of [DEFAULTS, DEFAULT_TEMPLATES.at(-2).settings]) for (const topSpace of [0, 30]) {
    const settings = normalizeSettings({ ...base, marginLeft: 10, marginRight: 25, marginTop: 16, marginBottom: 28, topSpace });
    const code = encodeReference(settings); assert.ok(code.startsWith('P4-'));
    assert.deepEqual(decodeShareHash(encodeShareHash(settings)), settings);
    const saved = normalizeLibrary(addTemplate({}, { id: 'margins', name: 'Marges propis', settings }));
    assert.deepEqual(saved.saved[0].settings, settings);
    const baseline = createResetBaseline(); baseline.fromHash(encodeShareHash(settings));
    assert.deepEqual(baseline.restore(), settings);
    const history = createSettingsHistory(DEFAULTS); history.record(settings);
    assert.deepEqual(history.undo(), DEFAULTS); assert.deepEqual(history.redo(), settings);
    assert.ok(code.length < 600);
  }
  for (const invalid of [
    'P4-A4-P-I20-T12-N9-G0-E22', 'P4-A4-P-I20-T12-M21.18.21.18-N9-G0-E22',
    'P4-A4-P-I20-T12-M21.101.21.18-N9-G0-E22', 'P4-A4-P-I20-T12-M021.10.21.18-N9-G0-E22',
    'P2-A4-P-I20-T12-M21.10.21.18-N9-G0-E22', 'P4-A4-P-I20-T12-H0-M21.10.21.18-N9-G0-E22',
  ]) assert.throws(() => decodeReference(invalid));
});

test('axis edits only change the selected pair and mixed numeric arrows start from the existing side', () => {
  const settings = { ...DEFAULTS, marginLeft: 10, marginRight: 20 };
  assert.ok(asymmetricMargins(settings));
  assert.deepEqual(marginPatch('horizontal', 25), { marginLeft: 25, marginRight: 25 });
  assert.deepEqual(marginPatch('vertical', 15), { marginTop: 15, marginBottom: 15 });
  assert.deepEqual(marginPatch('marginLeft', 12), { marginLeft: 12 });
  assert.equal(asymmetricMargins({ ...settings, ...marginPatch('horizontal', 25) }), false);
  const input = Object.assign(new EventTarget(), { value: '', min: '0', max: '100', step: '1', dataset: { stepBase: '10' } });
  stepNumberInput(input, 1); assert.equal(input.value, '11');
});

test('optional footers respect custom horizontal positions and never overlap the last staff', () => {
  for (const marginBottom of [0, 4, 10, 21, 30]) {
    const settings = { ...DEFAULTS, marginLeft: 12, marginRight: 28, marginBottom, source: true, reference: true };
    const layout = createLayout(settings), footer = footerLines(settings);
    assert.ok(layout.valid); assert.equal(footer[0].x, 12);
    for (const line of footer) {
      if (line.anchor === 'end') assert.equal(line.x, layout.width - 28);
      assert.ok(line.y - FOOTER_SIZE > layout.staves.at(-1).at(-1));
      assert.ok(line.y < layout.height);
    }
  }
  const impossible = { ...DEFAULTS, orientation: 'landscape', marginTop: 100, marginBottom: 100, topSpace: 100 };
  assert.equal(createLayout(impossible).valid, false);
  assert.equal(createLayout(fitSettings(impossible)).valid, false);
  assert.throws(() => createPdf(impossible));
});
