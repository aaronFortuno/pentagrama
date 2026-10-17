import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULTS, normalizeSettings, encodeReference, decodeReference, encodeShareHash, decodeShareHash, createLayout, pageDimensions, fitSettings, footerLines, renderSheet } from '../docs/layout.js';
import { createPdf } from '../docs/pdf.js';
import { DEFAULT_TEMPLATES, normalizeLibrary, addTemplate, removeTemplate, restoreDefaults } from '../docs/library.js';
import { LANGUAGES, messages, detectLanguage, translate } from '../docs/i18n.js';
const close = (a, b) => assert.ok(Math.abs(a - b) < 1e-7, `${a} differs from ${b}`);

test('every original P1 reference keeps the same A4 geometry', () => {
  for (let count = 1; count <= 24; count++) for (let group = 0; group < count; group++) for (const spacing of [1.2, 2.2, 4]) {
    if (group === 1) continue;
    const s = decodeReference(`P1-N${count}-G${group}-E${Math.round(spacing * 10)}-T12`), l = createLayout(s);
    assert.ok(l.valid); assert.equal(l.staves.length, count); assert.equal(s.lineSpacing, 2);
    const boundaries = group ? Math.floor((count - 1) / group) : 0, units = count - 1 + boundaries * (spacing - 1);
    const gap = units ? (255 - count * 8) / units : 0;
    let y = count === 1 ? 144.5 : 21;
    for (let i = 0; i < count; i++) { l.staves[i].forEach((line, n) => close(line, y + n * 2)); y += 8 + gap * (group && (i + 1) % group === 0 ? spacing : 1); }
  }
});

test('all six page sizes and variable staff sizes stay inside printable bounds or report overflow', () => {
  for (const paper of ['A4', 'A3', 'LETTER']) for (const orientation of ['portrait', 'landscape']) for (const lineSpacing of [1, 1.5, 2, 3, 4]) for (let count = 1; count <= 64; count++) {
    for (const group of new Set([0, 2, 3, 4, 8, count - 1])) {
      const s = normalizeSettings({ ...DEFAULTS, paper, orientation, lineSpacing, count, group }), l = createLayout(s);
      assert.equal(l.staves.length, count);
      assert.equal(l.valid, l.needed <= l.available + 1e-6);
      if (!l.valid) continue;
      assert.ok(l.staves[0][0] >= 21 - 1e-7); assert.ok(l.staves.at(-1).at(-1) <= l.height - 21 + 1e-7);
      l.staves.forEach(staff => { assert.equal(staff.length, 5); for (let i = 1; i < 5; i++) close(staff[i] - staff[i - 1], lineSpacing); });
      for (let i = 1; i < count; i++) close(l.staves[i][0] - l.staves[i - 1][4], l.gap * (s.group && i % s.group === 0 ? s.spacing : 1));
      const restored = createLayout(decodeReference(encodeReference(s))); assert.deepEqual(restored.staves, l.staves);
    }
  }
});

test('SATB and piano retain different millimetre gaps and repeat in the requested order', () => {
  const s = DEFAULT_TEMPLATES.find(t => t.id === 'choir-piano').settings, l = createLayout(s);
  assert.ok(l.valid); assert.equal(l.count, 12); close(l.needed, 226);
  for (const start of [0, 6]) {
    for (let i = 1; i < 4; i++) close(l.staves[start + i][0] - l.staves[start + i - 1][4], 12);
    close(l.staves[start + 4][0] - l.staves[start + 3][4], 14);
    close(l.staves[start + 5][0] - l.staves[start + 4][4], 6);
  }
  close(l.staves[6][0] - l.staves[5][4], 18);
  assert.deepEqual(createLayout(decodeReference(encodeReference(s))).staves, l.staves);
});

test('all suggested templates fit and orchestra includes 23 staves on A3', () => {
  for (const template of DEFAULT_TEMPLATES) {
    const l = createLayout(template.settings); assert.ok(l.valid, template.id);
    assert.deepEqual(createLayout(decodeReference(encodeReference(template.settings))).staves, l.staves);
  }
  const orchestra = createLayout(DEFAULT_TEMPLATES.find(t => t.id === 'orchestra').settings);
  assert.equal(orchestra.count, 23); assert.equal(orchestra.width, 297); assert.equal(orchestra.height, 420);
});

test('invalid reference values and oversized inputs are rejected', () => {
  for (const reference of ['', 'P1-N25-G3-E22-T12', 'P1-N9-G1-E22-T12', 'P2-A3-L-I09-T12-N9-G3-E22', 'P2-A4-P-I20-T99-N9-G3-E22', 'P2-A4-P-I20-T12-N65-G0-E22', 'P2-A4-P-I20-T12-S1-J180-B0.80.140', 'P2-A4-P-I20-T12-S1-J180-B2.999.140', 'P2-A4-P-I20-T12-S1-J180-B2.80.140_'.repeat(50), '<script>']) assert.throws(() => decodeReference(reference), undefined, reference);
  assert.equal(encodeReference(decodeReference(' p1-n9-g3-e22-t12 ')), 'P2-A4-P-I20-T12-N9-G3-E22');
});

test('overflow cannot be exported; explicit fit preserves a valid physical layout', () => {
  for (const s of [{ ...DEFAULTS, count: 64, lineSpacing: 4 }, { ...DEFAULT_TEMPLATES.find(t => t.id === 'choir-piano').settings, systems: 8 }]) {
    assert.equal(createLayout(s).valid, false); assert.throws(() => createPdf(s)); assert.ok(createLayout(fitSettings(s)).valid);
  }
  const impossible = { ...DEFAULTS, mode: 'blocks', systems: 8, blocks: [{ count: 32, inside: 40, after: 60 }] };
  assert.equal(createLayout(fitSettings(impossible)).valid, false);
});

test('clean SVG and PDF contain no visible text and PDF page boxes match every selected format', () => {
  for (const paper of ['A4', 'A3', 'LETTER']) for (const orientation of ['portrait', 'landscape']) {
    const s = { ...DEFAULTS, paper, orientation }, dimensions = pageDimensions(s), svg = renderSheet(s), pdf = new TextDecoder().decode(createPdf(s));
    assert.equal((svg.match(/<line /g) || []).length, 45); assert.equal((svg.match(/<text /g) || []).length, 0); assert.equal((pdf.match(/ l S\n/g) || []).length, 45); assert.ok(!pdf.includes(' Tj'));
    const box = /\/MediaBox \[0 0 ([\d.]+) ([\d.]+)\]/.exec(pdf); assert.ok(box); assert.ok(Math.abs(Number(box[1]) - dimensions.width * 72 / 25.4) < 0.00001); assert.ok(Math.abs(Number(box[2]) - dimensions.height * 72 / 25.4) < 0.00001);
    const xref = Number(/startxref\n(\d+)/.exec(pdf)[1]); assert.equal(pdf.slice(xref, xref + 4), 'xref');
  }
  const annotated = { ...DEFAULT_TEMPLATES.at(-1).settings, reference: true };
  assert.ok(renderSheet(annotated).includes('<text ')); assert.ok(new TextDecoder().decode(createPdf(annotated)).includes(' Tj'));
  assert.equal(footerLines(annotated).map(f => f.text).join(''), encodeReference(annotated));
  const malicious = { ...annotated, blocks: [{ label: '<script>attack()</script>', count: 2, inside: 8, after: 14 }] };
  assert.ok(!renderSheet(malicious).includes('script'));
});

test('restoring hidden suggestions never deletes or modifies personal templates', () => {
  const personal = { id: 'personal', name: 'Coral de prova', settings: DEFAULT_TEMPLATES.at(-2).settings };
  let library = addTemplate({}, personal); library = removeTemplate(library, 'piano', true);
  assert.deepEqual(library.hidden, ['piano']);
  const restored = restoreDefaults(library); assert.deepEqual(restored.hidden, []); assert.deepEqual(restored.saved, library.saved);
  assert.equal(removeTemplate(restored, 'personal').saved.length, 0);
  assert.equal(restored.saved.length, 1);
  const corrupt = normalizeLibrary({ hidden: ['unknown', 'piano', 'piano'], saved: [personal, personal, null, { id: 'bad', name: '' }] });
  assert.equal(corrupt.saved.length, 1); assert.deepEqual(corrupt.hidden, ['piano']);
  const full = { saved: Array.from({ length: 50 }, (_, i) => ({ ...personal, id: String(i) })) }; assert.throws(() => addTemplate(full, personal));
});

test('all eight languages have complete matching messages and automatic region fallback works', () => {
  const placeholders = text => [...new Set(text.match(/\{\w+\}/g) || [])].sort();
  for (const locale of Object.keys(LANGUAGES)) {
    assert.deepEqual(Object.keys(messages[locale]), Object.keys(messages.en));
    for (const key of Object.keys(messages.en)) assert.deepEqual(placeholders(messages[locale][key]), placeholders(messages.en[key]), `${locale}/${key}`);
  }
  assert.equal(detectLanguage('auto', ['de-AT', 'en-US']), 'de'); assert.equal(detectLanguage('ca', ['de-DE']), 'ca'); assert.equal(detectLanguage('auto', ['xx', 'pt-BR']), 'pt'); assert.equal(detectLanguage('auto', ['xx']), 'en');
  assert.equal(translate('ca', 'staffCount', { n: 23 }), '23 pentagrames');
});

test('shared layouts retain Unicode block names and reject invalid label payloads', () => {
  const s = normalizeSettings({ ...DEFAULT_TEMPLATES.at(-2).settings, blocks: [{ label: 'Veus ~ "coral" 🎼', count: 4, inside: 12, after: 14 }, { label: 'Piano', count: 2, inside: 6, after: 14 }] });
  const restored = decodeShareHash(encodeShareHash(s));
  assert.deepEqual(restored.blocks, s.blocks); assert.deepEqual(createLayout(restored).staves, createLayout(s).staves);
  assert.equal(decodeShareHash('P1-N9-G3-E22-T12').count, 9);
  assert.throws(() => decodeShareHash(encodeReference(s) + '~%ZZ'));
  assert.throws(() => decodeShareHash(encodeReference(s) + '~' + encodeURIComponent(JSON.stringify(['wrong count']))));
});
