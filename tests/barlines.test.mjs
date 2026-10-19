import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULTS, normalizeSettings, createLayout, fitSettings, encodeReference, decodeReference, encodeShareHash, decodeShareHash, renderSheet } from '../docs/layout.js';
import { createDocument, renderSvgPage, renderPrintDocument, createPdfDocument } from '../docs/engine/index.js';
import { DEFAULT_TEMPLATES, addTemplate, normalizeLibrary } from '../docs/library.js';
import { createSettingsHistory } from '../docs/settings-history.js';
import { createResetBaseline } from '../docs/settings-baseline.js';
const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-4, `${a} differs from ${b}`);
const enabled = patch => ({ enabled: true, measures: 4, thickness: .16, style: 'single', connect: 'none', ...patch });
const bars = page => page.scene.filter(element => element.role === 'barline');

test('barlines are opt-in, normalize bounded independent values and leave old codes unchanged', () => {
  const a = normalizeSettings(DEFAULTS), b = normalizeSettings(DEFAULTS);
  assert.equal(a.barlines.enabled, false); a.barlines.measures = 8; assert.equal(b.barlines.measures, 4);
  for (const value of [null, false, 'invalid', []]) assert.equal(normalizeSettings({ barlines: value }).barlines.enabled, false);
  const invalid = normalizeSettings({ barlines: { enabled: 'true', measures: 100, thickness: -1, style: 'repeat', connect: 'all' } });
  assert.deepEqual(invalid.barlines, { enabled: false, measures: 16, thickness: .05, thicknessMode: 'custom', style: 'single', connect: 'none' });
  assert.equal(normalizeSettings({ barlines: enabled({ measures: 3.7, thickness: .179 }) }).barlines.thickness, .18);
  for (const code of ['P1-N9-G3-E22-T12', 'P2-A4-P-I20-T12-N9-G0-E22', 'P3-A4-P-I20-T12-H30-N9-G0-E22', 'P4-A4-P-I20-T12-M16.28.16.10-N9-G0-E22']) {
    const settings = decodeReference(code); assert.equal(settings.barlines.enabled, false); assert.equal(bars(createDocument(settings).pages[0]).length, 0);
    if (!code.startsWith('P1')) assert.equal(encodeReference(settings), code);
  }
});

test('four measures have three inner boundaries and one closing boundary, with no unwanted opening line', () => {
  const page = createDocument({ count: 1, barlines: enabled() }).pages[0], verticals = bars(page);
  assert.equal(verticals.length, 4);
  [61.5, 105, 148.5, 191.92].forEach((x, index) => {
    const line = verticals[index]; near(line.x1, x); near(line.x2, x);
    near(line.y1, page.layout.staves[0][0]); near(line.y2, page.layout.staves[0][4]);
    assert.equal(line.measure, index + 1); assert.equal(line.ownerId, page.systems[0].blocks[0].staves[0].id);
  });
  assert.equal(bars(createDocument({ count: 1, barlines: enabled({ measures: 1 }) }).pages[0]).length, 1);
});

function pdfLines(bytes, height) {
  const text = new TextDecoder().decode(bytes), lines = []; let width, dash = [];
  for (const command of text.split('\n')) {
    let match;
    if ((match = /^(?:0 G )?([\d.]+) w$/.exec(command))) width = Number(match[1]) * 25.4 / 72;
    else if ((match = /^\[([\d. ]*)\] 0 d$/.exec(command))) dash = match[1] ? match[1].split(' ').map(v => Number(v) * 25.4 / 72) : [];
    else if ((match = /^(-?[\d.]+) (-?[\d.]+) m (-?[\d.]+) (-?[\d.]+) l S$/.exec(command))) {
      const [x1, y1, x2, y2] = match.slice(1).map(v => Number(v) * 25.4 / 72);
      lines.push({ x1, y1: height - y1, x2, y2: height - y2, width, dash });
    }
  }
  return lines;
}

test('every style and connection shares physical geometry, stroke widths and dash patterns in SVG, print and PDF', () => {
  for (const template of DEFAULT_TEMPLATES) for (const paper of ['A4', 'A3', 'LETTER']) for (const orientation of ['portrait', 'landscape']) for (const style of ['single', 'double', 'dashed']) for (const connect of ['none', 'solid', 'dashed']) {
    const value = { ...template.settings, paper, orientation, barlines: enabled({ style, connect, measures: 5, thickness: .23 }) };
    const document = createDocument(value), page = document.pages[0];
    assert.deepEqual(page.layout.staves, createLayout({ ...value, barlines: { enabled: false } }).staves);
    if (!document.valid) { assert.throws(() => createPdfDocument(document), /layoutInvalid/); continue; }
    const expected = page.scene.filter(item => item.kind === 'line');
    const svg = renderSvgPage(page), serialized = [...svg.matchAll(/<line ([^>]+)\/>/g)];
    const pdf = pdfLines(createPdfDocument(document), page.frame.height);
    assert.equal(pdf.length, expected.length); assert.equal(serialized.length, expected.length);
    assert.ok(renderPrintDocument(document).includes(svg)); assert.equal(svg, renderSheet(value));
    const staffStrokes = bars(page).filter(line => line.part === 'staff');
    assert.equal(staffStrokes.length, page.layout.count * 5 * (style === 'double' ? 2 : 1));
    expected.forEach((line, index) => {
      const attrs = Object.fromEntries([...serialized[index][1].matchAll(/([\w-]+)="([^"]*)"/g)].map(match => match.slice(1)));
      for (const key of ['x1', 'y1', 'x2', 'y2']) { near(pdf[index][key], line[key]); near(Number(attrs[key]), line[key]); }
      near(pdf[index].width, line.strokeWidth); near(Number(attrs['stroke-width'] || page.layout.thickness), line.strokeWidth);
      const pattern = line.dash || [], svgDash = attrs['stroke-dasharray']?.split(' ').map(Number) || [];
      assert.equal(pdf[index].dash.length, pattern.length); assert.deepEqual(svgDash, pattern);
      pattern.forEach((value, i) => near(pdf[index].dash[i], value));
      if (line.role === 'barline') { assert.ok(line.x1 - line.strokeWidth / 2 >= page.layout.left - 1e-6); assert.ok(line.x1 + line.strokeWidth / 2 <= page.layout.right + 1e-6); }
    });
    assert.equal(new Set(page.scene.map(element => element.id)).size, page.scene.length);
  }
});

test('connections stay within blocks and systems, including partial groups and repeated SATB plus piano', () => {
  const settings = { mode: 'blocks', systems: 2, blocks: [{ count: 4, inside: 12, after: 18 }, { count: 2, inside: 6, after: 14 }], barlines: enabled({ connect: 'dashed' }) };
  const page = createDocument(settings).pages[0], connectors = bars(page).filter(line => line.part === 'connection');
  assert.equal(connectors.length, 32);
  for (const system of page.systems) for (const block of system.blocks) {
    const own = connectors.filter(line => line.ownerId === block.id); assert.equal(own.length, (block.staves.length - 1) * 4);
    for (const line of own) assert.ok(block.staves.slice(0, -1).some((staff, i) => line.y1 === staff.lines[4] && line.y2 === block.staves[i + 1].lines[0]));
  }
  const partial = createDocument({ count: 5, group: 2, barlines: enabled({ connect: 'solid' }) }).pages[0];
  assert.equal(bars(partial).filter(line => line.part === 'connection').length, 8);
  const ungrouped = createDocument({ count: 5, group: 0, barlines: enabled({ connect: 'solid' }) }).pages[0];
  assert.equal(bars(ungrouped).filter(line => line.part === 'connection').length, 0);
});

test('P5 references and Unicode shared templates round-trip every barline style and reject ambiguous or out-of-range codes', () => {
  for (const template of DEFAULT_TEMPLATES) for (const style of ['single', 'double', 'dashed']) for (const connect of ['none', 'solid', 'dashed']) for (const margins of [{}, { marginTop: 5, marginRight: 29, marginLeft: 10, topSpace: 30 }]) {
    const settings = normalizeSettings({ ...template.settings, ...margins, barlines: enabled({ style, connect, measures: 7, thickness: .21 }) });
    const code = encodeReference(settings); assert.match(code, /^P5-/);
    assert.deepEqual(decodeReference(code), { ...settings, blocks: settings.blocks.map(block => ({ ...block, label: '' })) });
    assert.deepEqual(decodeShareHash(encodeShareHash(settings)), settings);
  }
  const valid = encodeReference({ barlines: enabled() });
  for (const code of [valid.replace('-V4.', '-V0.'), valid.replace('-V4.', '-V17.'), valid.replace('-V4.', '-V04.'), valid.replace('.S.16.', '.X.16.'), valid.replace('.16.', '.61.'), valid.replace('.16.', '.0.'), valid.replace('.N', '.X'), valid.replace('P5-', 'P2-'), valid.replace(/-V.+$/, ''), valid + '-V4.S.16.N']) assert.throws(() => decodeReference(code), /invalidRef/);
});

test('saved templates, reset points and undo/redo retain complete independent barline options', () => {
  const settings = normalizeSettings({ group: 3, barlines: enabled({ style: 'double', connect: 'dashed', measures: 6 }) });
  const library = addTemplate({}, { id: 'bars', name: 'Amb compassos', settings });
  const restored = normalizeLibrary(JSON.parse(JSON.stringify(library))).saved[0].settings;
  assert.deepEqual(restored, settings); restored.barlines.measures = 3; assert.equal(settings.barlines.measures, 6);
  const reset = createResetBaseline(settings), history = createSettingsHistory(settings);
  const changed = normalizeSettings({ ...settings, barlines: { ...settings.barlines, enabled: false, thickness: .3 } });
  history.record(changed); assert.deepEqual(history.undo(), settings); assert.deepEqual(history.redo(), changed);
  assert.deepEqual(reset.restore(), settings); assert.deepEqual(reset.fromHash(encodeShareHash(settings), DEFAULTS), settings);
  assert.match(encodeReference(changed), /^P2-/); assert.equal(changed.barlines.measures, 6);
});

test('barlines respect extremely narrow content bounds and explicit fit reduces only the requested measure count', () => {
  const settings = normalizeSettings({ marginLeft: 100, marginRight: 100, barlines: enabled({ measures: 16, style: 'double', thickness: .6 }) });
  const invalid = createDocument(settings); assert.equal(invalid.valid, false); assert.equal(bars(invalid.pages[0]).length, 0);
  assert.throws(() => renderPrintDocument(invalid), /layoutInvalid/);
  const fitted = fitSettings(settings); assert.equal(fitted.barlines.measures, 3); assert.equal(fitted.count, settings.count);
  assert.ok(createDocument(fitted).valid); assert.equal(fitted.barlines.style, 'double'); assert.equal(fitted.marginRight, 100);
});

test('page overrides inherit barline options without changing other pages or optional footer references', () => {
  const value = { settings: { group: 3, source: true, reference: true, barlines: enabled({ style: 'double', connect: 'dashed' }) }, pages: [{ settings: { barlines: { measures: 2 }, topSpace: 25 } }, { settings: { barlines: { style: 'dashed' } } }] };
  const document = createDocument(value); assert.equal(document.valid, true);
  assert.equal(document.pages[0].settings.barlines.measures, 2); assert.equal(document.pages[0].settings.barlines.style, 'double');
  assert.equal(document.pages[1].settings.barlines.measures, 4); assert.equal(document.pages[1].settings.barlines.connect, 'dashed');
  assert.deepEqual(createDocument(document), document);
  for (const page of document.pages) {
    const reference = page.scene.filter(element => element.kind === 'text' && element.anchor === 'end').map(line => line.text).join('');
    assert.equal(reference, encodeReference(page.settings));
  }
  const pdf = new TextDecoder().decode(createPdfDocument(document)); assert.equal((pdf.match(/\/Type \/Page /g) || []).length, 2);
  assert.equal((pdf.match(/\/FontFile2 /g) || []).length, 1); assert.ok(pdf.includes('[] 0 d'));
});
