import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULTS, SERVICE_ADDRESS, FOOTER_GRAY, FOOTER_SIZE, normalizeSettings, encodeReference, decodeReference, encodeShareHash, decodeShareHash, createLayout, pageDimensions, fitSettings, footerLines, footerTextWidth, renderSheet } from '../docs/layout.js';
import { FOOTER_FONT } from '../docs/vendor/footer-font-metrics.js';
import { FOOTER_FONT_DATA } from '../docs/vendor/footer-font-data.js';
import { createPdf } from '../docs/pdf.js';
import { DEFAULT_TEMPLATES, normalizeLibrary, addTemplate, removeTemplate, restoreDefaults } from '../docs/library.js';
import { LANGUAGES, messages, detectLanguage, translate } from '../docs/i18n.js';
import { previewView } from '../docs/preview.js';
const close = (a, b) => assert.ok(Math.abs(a - b) < 1e-7, `${a} differs from ${b}`);

test('preview fits all paper formats and keeps every edge reachable while panning', () => {
  for (const paper of ['A3', 'A4', 'LETTER']) for (const orientation of ['portrait', 'landscape']) {
    const settings = normalizeSettings({ ...DEFAULTS, paper, orientation }), page = createLayout(settings);
    const viewport = { width: 600, height: 700 }, printed = renderSheet(settings);
    const fitted = previewView(page, viewport, 1, { x: 9000, y: -9000 });
    assert.ok(fitted.width <= viewport.width + 1e-7); assert.ok(fitted.height <= viewport.height + 1e-7);
    close(fitted.x, 0); close(fitted.y, 0);
    const enlarged = previewView(page, viewport, 4, { x: 9000, y: -9000 });
    close(enlarged.width, fitted.width * 4); close(enlarged.height, fitted.height * 4);
    close(enlarged.x + viewport.width / 2, enlarged.width / 2);
    close(-enlarged.y + viewport.height / 2, enlarged.height / 2);
    const reset = previewView(page, viewport, 0, enlarged);
    assert.equal(reset.zoom, 1); close(reset.x, 0); close(reset.y, 0);
    assert.equal(previewView(page, viewport, 10).zoom, 4);
    assert.equal(renderSheet(settings), printed);
  }
});

test('preview clamps offsets after a resize and stays finite in a collapsed viewport', () => {
  const page = { width: 210, height: 297 }, viewport = { width: 1000, height: 300 };
  const view = previewView(page, viewport, 2, { x: 800, y: -800 });
  close(view.x, 0); close(view.y, -150);
  const collapsed = previewView(page, { width: -10, height: 0 }, 4, view);
  close(collapsed.width, 0); close(collapsed.height, 0); close(collapsed.x, 0); close(collapsed.y, 0);
});

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
    assert.deepEqual(createLayout(decodeReference(encodeReference(template.settings))).staves, createLayout({ ...template.settings, pageText: DEFAULTS.pageText }).staves);
    assert.deepEqual(createLayout(decodeShareHash(encodeShareHash(template.settings))).staves, l.staves);
  }
  const orchestra = createLayout(DEFAULT_TEMPLATES.find(t => t.id === 'orchestra').settings);
  assert.equal(orchestra.count, 23); assert.equal(orchestra.width, 297); assert.equal(orchestra.height, 420);
});

test('extra top space reserves blank paper and survives references, links and saved templates', () => {
  assert.equal(normalizeSettings({}).topSpace, 0);
  assert.equal(normalizeSettings({ topSpace: -5 }).topSpace, 0);
  assert.equal(normalizeSettings({ topSpace: Infinity }).topSpace, 0);
  assert.equal(normalizeSettings({ topSpace: 999 }).topSpace, 100);
  for (const paper of ['A4', 'A3', 'LETTER']) for (const orientation of ['portrait', 'landscape']) {
    for (const base of [DEFAULTS, DEFAULT_TEMPLATES.find(t => t.id === 'choir-piano').settings]) for (const topSpace of [0, 30, 60, 100]) {
      const s = normalizeSettings({ ...base, paper, orientation, topSpace }), layout = createLayout(s);
      close(layout.top, 21 + topSpace); close(layout.bottom, layout.height - 21);
      close(layout.available, layout.height - 42 - topSpace);
      assert.equal(layout.valid, layout.needed <= layout.available + 1e-6);
      assert.equal(encodeReference(s).startsWith(topSpace ? 'P3-' : 'P2-'), true);
      assert.deepEqual(decodeReference(encodeReference(s)), { ...s, blocks: s.blocks.map(b => ({ ...b, label: '' })) });
      assert.deepEqual(decodeShareHash(encodeShareHash(s)), s);
      const saved = addTemplate({}, { id: 'title', name: 'Primera pàgina', settings: s });
      assert.equal(normalizeLibrary(saved).saved[0].settings.topSpace, topSpace);
      const fitted = fitSettings(s), fittedLayout = createLayout(fitted);
      assert.equal(fitted.topSpace, topSpace); assert.ok(fittedLayout.valid);
      assert.ok(fittedLayout.staves[0][0] >= 21 + topSpace - 1e-7);
      assert.ok(fittedLayout.staves.at(-1).at(-1) <= layout.height - 21 + 1e-7);
      const svg = renderSheet(fitted), pdf = new TextDecoder().decode(createPdf(fitted));
      const firstLine = Number(/y1="([\d.]+)"/.exec(svg)[1]);
      const firstPdfY = Number(/ m ([\d.]+) ([\d.]+) l S/.exec(pdf)[2]);
      assert.ok(Math.abs(firstPdfY - (fittedLayout.height - firstLine) * 72 / 25.4) < 0.00003);
      assert.ok(!svg.includes('<text ')); assert.ok(!pdf.includes(' Tj'));
    }
  }
  assert.equal(decodeReference('P1-N9-G3-E22-T12').topSpace, 0);
  assert.equal(decodeReference('P2-A4-P-I20-T12-N9-G3-E22').topSpace, 0);
});

test('invalid reference values and oversized inputs are rejected', () => {
  for (const reference of ['', 'P1-N25-G3-E22-T12', 'P1-N9-G1-E22-T12', 'P2-A3-L-I09-T12-N9-G3-E22', 'P2-A4-P-I20-T99-N9-G3-E22', 'P2-A4-P-I20-T12-N65-G0-E22', 'P2-A4-P-I20-T12-S1-J180-B0.80.140', 'P2-A4-P-I20-T12-S1-J180-B2.999.140', 'P2-A4-P-I20-T12-S1-J180-B2.80.140_'.repeat(50), 'P3-A4-P-I20-T12-N9-G3-E22', 'P3-A4-P-I20-T12-H0-N9-G3-E22', 'P3-A4-P-I20-T12-H101-N9-G3-E22', 'P3-A4-P-I20-T12-H030-N9-G3-E22', 'P2-A4-P-I20-T12-H30-N9-G3-E22', '<script>']) assert.throws(() => decodeReference(reference), undefined, reference);
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

test('website footer is opt-in, shares space with long references and leaves the staves unchanged', () => {
  assert.equal(normalizeSettings({}).source, false);
  assert.equal(normalizeSettings({ source: 'true' }).source, false);
  assert.equal(decodeReference('P1-N9-G3-E22-T12').source, false);
  for (const paper of ['A4', 'A3', 'LETTER']) for (const orientation of ['portrait', 'landscape']) {
    const configurations = [DEFAULTS, { ...DEFAULTS, mode: 'blocks', lineSpacing: 1, blocks: Array.from({ length: 24 }, () => ({ label: '', count: 1, inside: 40, after: 1 })) }];
    for (const configuration of configurations) for (const source of [false, true]) for (const reference of [false, true]) {
      const s = normalizeSettings({ ...configuration, paper, orientation, source, reference }), l = createLayout(s);
      assert.ok(l.valid);
      assert.deepEqual(l.staves, createLayout({ ...s, source: false, reference: false }).staves);
      const footer = footerLines(s), address = footer.find(f => f.anchor === 'start'), refs = footer.filter(f => f.anchor === 'end');
      assert.equal(Boolean(address), source);
      assert.equal(refs.map(f => f.text).join(''), reference ? encodeReference(s) : '');
      if (address) { assert.equal(address.text, SERVICE_ADDRESS); assert.equal(address.x, 18); }
      for (const f of footer) {
        const left = f.anchor === 'start' ? f.x : f.x - footerTextWidth(f.text);
        assert.ok(left >= 18 - 1e-7); assert.ok(left + footerTextWidth(f.text) <= l.width - 18 + 1e-7);
        assert.ok(f.y - FOOTER_SIZE > l.bottom); assert.ok(f.y <= l.height - 9);
        if (address && f.anchor === 'end') assert.ok(left >= address.x + footerTextWidth(address.text) + 8 - 1e-7);
      }
      const svg = renderSheet(s), pdf = new TextDecoder().decode(createPdf(s));
      if (source || reference) {
        const color = `#${FOOTER_GRAY.toString(16).repeat(3)}`;
        assert.equal((svg.match(new RegExp(`fill="${color}"`, 'g')) || []).length, footer.length);
        assert.equal((pdf.match(new RegExp(`${(FOOTER_GRAY / 255).toFixed(5).replace('.', '\\.')} g BT`, 'g')) || []).length, footer.length);
        assert.ok(FOOTER_GRAY > 116 && FOOTER_GRAY < 200);
      }
      assert.equal(svg.includes(SERVICE_ADDRESS), source); assert.equal(pdf.includes(SERVICE_ADDRESS), source);
      if (source) assert.match(pdf, /1 0 0 1 51\.02362 [\d.]+ Tm \(pentagrama\.page\)/);
      assert.equal(decodeShareHash(encodeShareHash(s)).source, false);
    }
  }
  const saved = addTemplate({}, { id: 'with-source', name: 'Amb adreça', settings: { ...DEFAULTS, source: true } });
  assert.equal(normalizeLibrary(saved).saved[0].settings.source, true);
});

test('thin serif footers embed their font and use identical advances in SVG and PDF', () => {
  assert.equal(FOOTER_FONT.weight, 100);
  assert.notEqual(footerTextWidth('iiii'), footerTextWidth('WWWW'));
  const s = { ...DEFAULT_TEMPLATES.at(-1).settings, lineSpacing: 1.6, source: true, reference: true, topSpace: 30 };
  const svg = renderSheet(s), pdf = new TextDecoder().decode(createPdf(s)), footer = footerLines(s);
  assert.match(svg, /font-weight="100"/); assert.match(svg, /Pentagrama Footer/);
  assert.match(pdf, /\/Subtype \/TrueType/); assert.match(pdf, /\/FontFile2 7 0 R/);
  assert.ok(pdf.includes(`/BaseFont /${FOOTER_FONT.name}`));
  const embedded = /\/Filter \/ASCIIHexDecode >>\nstream\n([a-f0-9]+)>/.exec(pdf);
  assert.deepEqual(Buffer.from(embedded[1], 'hex'), Buffer.from(FOOTER_FONT_DATA, 'base64'));
  const texts = [...pdf.matchAll(/\/F1 ([\d.]+) Tf 1 0 0 1 ([\d.]+) ([\d.]+) Tm \(([^)]+)\)/g)];
  assert.equal(texts.length, footer.length);
  texts.forEach((match, i) => {
    const f = footer[i], x = f.anchor === 'start' ? f.x : f.x - footerTextWidth(f.text);
    assert.ok(Math.abs(Number(match[1]) - FOOTER_SIZE * 72 / 25.4) < 0.00001);
    assert.ok(Math.abs(Number(match[2]) - x * 72 / 25.4) < 0.00001);
    assert.equal(match[4], f.text);
  });
  const plain = new TextDecoder().decode(createPdf(DEFAULTS));
  assert.ok(!plain.includes('/FontFile2')); assert.ok(!plain.includes('/BaseFont'));
});

test('all supported languages have complete matching messages and automatic region fallback works', () => {
  const placeholders = text => [...new Set(text.match(/\{\w+\}/g) || [])].sort();
  for (const locale of Object.keys(LANGUAGES)) {
    assert.deepEqual(Object.keys(messages[locale]), Object.keys(messages.en));
    for (const key of Object.keys(messages.en)) assert.deepEqual(placeholders(messages[locale][key]), placeholders(messages.en[key]), `${locale}/${key}`);
  }
  assert.equal(detectLanguage('auto', ['de-AT', 'en-US']), 'de'); assert.equal(detectLanguage('ca', ['de-DE']), 'ca'); assert.equal(detectLanguage('auto', ['xx', 'pt-BR']), 'pt'); assert.equal(detectLanguage('auto', ['xx']), 'en');
  assert.equal(translate('ca', 'staffCount', { n: 23 }), '23 pentagrames');
  assert.equal(detectLanguage('auto', ['eu-FR', 'fr-FR']), 'eu');
  assert.equal(detectLanguage('auto', ['gl-ES', 'es-ES']), 'gl');
  assert.equal(detectLanguage('eu', ['en-US']), 'eu');
  assert.equal(translate('eu', 'staffCount', { n: 9 }), '9 pentagrama');
  assert.equal(translate('gl', 'staffCount', { n: 9 }), '9 pentagramas');
});

test('shared layouts retain Unicode block names and reject invalid label payloads', () => {
  const s = normalizeSettings({ ...DEFAULT_TEMPLATES.at(-2).settings, blocks: [{ label: 'Veus ~ "coral" 🎼', count: 4, inside: 12, after: 14 }, { label: 'Piano', count: 2, inside: 6, after: 14 }] });
  const restored = decodeShareHash(encodeShareHash(s));
  assert.deepEqual(restored.blocks, s.blocks); assert.deepEqual(createLayout(restored).staves, createLayout(s).staves);
  assert.equal(decodeShareHash('P1-N9-G3-E22-T12').count, 9);
  assert.throws(() => decodeShareHash(encodeReference(s) + '~%ZZ'));
  assert.throws(() => decodeShareHash(encodeReference(s) + '~' + encodeURIComponent(JSON.stringify(['wrong count']))));
});
