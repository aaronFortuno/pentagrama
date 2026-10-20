import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeSettings, encodeReference, decodeReference, encodeShareHash, decodeShareHash, fitSettings } from '../docs/layout.js';
import { createDocument, normalizeDocument, renderSvgPage, renderPrintDocument, createPdfDocument } from '../docs/engine/index.js';
import { createSettingsHistory } from '../docs/settings-history.js';
import { createResetBaseline } from '../docs/settings-baseline.js';
import { addTemplate, normalizeLibrary } from '../docs/library.js';
import { spreadMode, spreadView } from '../docs/preview.js';
import { bookMargins } from '../docs/margins-control.js';
const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-6, `${a} != ${b}`);

test('two derived sides preserve common settings, resolve top space and mirror physical margins without mutation', () => {
  for (const paper of ['A4', 'A3', 'LETTER']) for (const orientation of ['portrait', 'landscape']) {
    for (const firstPageOnly of [false, true]) for (const mirrorMargins of [false, true]) {
      const s = normalizeSettings({ paper, orientation, count: 6, topSpace: 35, marginLeft: 28, marginRight: 12,
        duplex: { enabled: true, firstPageOnly, mirrorMargins }, clefs: { enabled: true }, barlines: { enabled: true } });
      const before = JSON.stringify(s), doc = createDocument(s), [front, back] = doc.pages;
      assert.equal(doc.pages.length, 2); assert.equal(front.id, 'front'); assert.equal(back.id, 'back');
      assert.equal(doc.valid, true); assert.equal(front.settings.topSpace, 35);
      assert.equal(back.settings.topSpace, firstPageOnly ? 0 : 35);
      assert.equal(front.layout.left, 28); assert.equal(back.layout.left, mirrorMargins ? 12 : 28);
      assert.equal(back.settings.marginRight, mirrorMargins ? 28 : 12);
      assert.equal(front.layout.count, back.layout.count);
      assert.equal(front.scene.filter(e => e.role === 'clef').length, back.scene.filter(e => e.role === 'clef').length);
      assert.equal(JSON.stringify(s), before);
      assert.deepEqual(createDocument(doc), doc);
      assert.deepEqual(normalizeDocument(normalizeDocument(s)), normalizeDocument(s));
      back.settings.clefs.pattern.push('bass'); assert.equal(front.settings.clefs.pattern.length, 0);
    }
  }
});

test('duplex printing and PDF contain two complete vector pages, while single-side output stays unchanged', () => {
  for (const paper of ['A4', 'A3', 'LETTER']) for (const orientation of ['portrait', 'landscape']) {
    const single = createDocument({ paper, orientation });
    const off = createDocument({ paper, orientation, duplex: { enabled: false, firstPageOnly: false, mirrorMargins: true } });
    assert.equal(single.pages.length, 1); assert.equal(renderSvgPage(single.pages[0]), renderSvgPage(off.pages[0]));
    const doc = createDocument({ paper, orientation, duplex: { enabled: true } });
    const print = renderPrintDocument(doc), pdf = new TextDecoder().decode(createPdfDocument(doc));
    assert.equal((print.match(/class="print-page"/g) || []).length, 2);
    assert.equal((pdf.match(/\/Type \/Page /g) || []).length, 2);
    assert.match(pdf, /\/Count 2/);
    for (const page of doc.pages) {
      assert.ok(print.includes(renderSvgPage(page)));
      assert.ok(print.includes(`size:${page.frame.width}mm ${page.frame.height}mm`));
      assert.ok(!renderSvgPage(page).includes('<text'));
    }
  }
});

test('both printed configuration references recreate the common template, including mirrored margins and front-only space', () => {
  const s = normalizeSettings({ topSpace: 30, marginLeft: 27, marginRight: 11, reference: true, source: true,
    duplex: { enabled: true, mirrorMargins: true }, clefs: { enabled: true, mode: 'pattern', pattern: ['treble', 'bass'] } });
  const doc = createDocument(s), reference = encodeReference(s);
  assert.match(reference, /^P7-/);
  for (const page of doc.pages) {
    const footers = page.scene.filter(e => e.kind === 'text' && e.anchor === 'end');
    assert.equal(footers.map(e => e.text).join(''), reference);
    const restored = createDocument(decodeReference(footers.map(e => e.text).join('')));
    assert.equal(restored.pages.length, 2); assert.equal(restored.pages[0].settings.marginLeft, 27);
    assert.equal(restored.pages[1].settings.marginLeft, 11); assert.equal(restored.pages[1].settings.topSpace, 0);
  }
});

test('P7 preserves active duplex options, clef patterns, barlines and named blocks, and rejects malformed suffixes', () => {
  for (const firstPageOnly of [false, true]) for (const mirrorMargins of [false, true]) for (const mode of ['simple', 'blocks']) {
    const s = normalizeSettings({ mode, topSpace: 12, marginLeft: 25, marginRight: 12,
      blocks: [{ label: 'Veus à quatre', count: 4, inside: 12, after: 14, clefs: ['treble', null, 'alto', 'bass'] }],
      clefs: { enabled: true, mode: 'pattern', type: 'treble', pattern: mode === 'simple' ? ['treble', 'bass'] : [] },
      barlines: { enabled: true, style: 'double', connect: 'dashed' }, duplex: { enabled: true, firstPageOnly, mirrorMargins } });
    const code = encodeReference(s), restored = decodeShareHash(encodeShareHash(s));
    assert.equal(encodeReference(decodeReference(code)), code); assert.deepEqual(restored.duplex, s.duplex);
    if (mode === 'blocks') assert.deepEqual(restored.blocks, s.blocks);
    assert.deepEqual(restored.clefs, s.clefs);
    for (const invalid of [code.replace(/-D.*$/, ''), code + '-DF.M', code.replace(/-D.*$/, '-DX.M'), code.replace(/^P7/, 'P6')]) assert.throws(() => decodeReference(invalid), /invalidRef/);
  }
});

test('saved templates, undo/redo, reset and fitting preserve the shared two-side configuration', () => {
  const s = normalizeSettings({ topSpace: 45, marginLeft: 30, marginRight: 10, duplex: { enabled: true, mirrorMargins: true } });
  const library = normalizeLibrary(addTemplate({}, { id: 'duplex', name: 'Dues cares', settings: s }));
  assert.deepEqual(library.saved[0].settings, s);
  const history = createSettingsHistory({}); history.record(s);
  assert.equal(history.undo().duplex.enabled, false); assert.deepEqual(history.redo(), s);
  const baseline = createResetBaseline(); baseline.capture(s); assert.deepEqual(baseline.restore(), s);
  const oversized = { ...s, count: 64, lineSpacing: 4 };
  assert.equal(createDocument(oversized).valid, false);
  assert.throws(() => renderPrintDocument(createDocument(oversized)), /layoutInvalid/);
  const fitted = fitSettings(oversized); assert.deepEqual(fitted.duplex, s.duplex);
  assert.equal(createDocument(fitted).valid, true);
});

test('explicit document pages remain explicit rather than being duplicated by duplex defaults', () => {
  const doc = createDocument({ settings: { duplex: { enabled: true, firstPageOnly: false } }, pages: [{ id: 'one', settings: { duplex: { mirrorMargins: true } } }] });
  assert.equal(doc.pages.length, 1);
  assert.deepEqual(doc.pages[0].settings.duplex, { enabled: true, firstPageOnly: false, mirrorMargins: true });
  assert.deepEqual(normalizeSettings(null).duplex, { enabled: false, firstPageOnly: true, mirrorMargins: false });
});

test('the editor uses binding margins automatically without losing legacy P7 references or single-side margins', () => {
  const legacy = normalizeSettings({ marginLeft: 30, marginRight: 12, duplex: { enabled: true, mirrorMargins: false } });
  const code = encodeReference(legacy), decoded = decodeReference(code);
  assert.equal(decoded.duplex.mirrorMargins, false);
  const editable = bookMargins(decoded), doc = createDocument(editable);
  assert.equal(editable.duplex.mirrorMargins, true); assert.equal(decoded.duplex.mirrorMargins, false);
  assert.equal(doc.pages[0].layout.left, 30); assert.equal(doc.pages[1].settings.marginRight, 30);
  assert.deepEqual(bookMargins(normalizeSettings({ ...legacy, duplex: { enabled: false } })), normalizeSettings({ ...legacy, duplex: { enabled: false } }));
  assert.equal(encodeReference(decodeReference(encodeReference(editable))), encodeReference(editable));
});

test('desktop spreads fit side by side and portrait tablet spreads fit vertically', () => {
  const pages = [{ width: 210, height: 297 }, { width: 210, height: 297 }];
  for (const [screen, viewport, mode] of [[{ width: 1280, height: 720 }, { width: 850, height: 530 }, 'row'],
    [{ width: 900, height: 1280 }, { width: 550, height: 1080 }, 'column']]) {
    assert.equal(spreadMode(screen), mode);
    const view = spreadView(pages, viewport, 1, undefined, { mode, labelHeight: 22 });
    assert.ok(view.width <= viewport.width + 1e-6); assert.ok(view.height <= viewport.height + 1e-6);
    assert.equal(mode === 'row' ? view.pages[1].top : view.pages[1].left, mode === 'row' ? 22 : 0);
    assert.ok(mode === 'row' ? view.pages[0].left > view.pages[1].width : view.pages[1].top - 22 > view.pages[0].top + view.pages[0].height);
    for (const frame of view.pages) { assert.ok(frame.top >= 22); assert.ok(frame.top + frame.height <= view.height + 1e-6); }
    near(view.x, 0); near(view.y, 0);
  }
});

test('mobile fits the right-hand front at 86% width with a visible back edge on the left; both pages remain reachable', () => {
  for (const width of [282, 352, 700]) for (const page of [{ width: 210, height: 297 }, { width: 420, height: 297 }]) {
    const viewport = { width, height: 480 }, pages = [page, page];
    assert.equal(spreadMode({ width: 390, height: 844 }), 'peek');
    const options = { mode: 'peek', labelHeight: 22 };
    const initial = spreadView(pages, viewport, 1, undefined, options);
    near(initial.pages[0].width / width, .86); near(initial.top, 0);
    near(initial.left + initial.pages[0].left, width * .14);
    near(initial.left + initial.pages[0].left + initial.pages[0].width, width);
    assert.ok(initial.left < 0); assert.equal(initial.pages[1].left, 0);
    assert.ok(initial.left + initial.pages[1].width > 0);
    assert.equal(initial.canPan, true);
    for (const zoom of [1, 2, 4]) {
      const end = spreadView(pages, viewport, zoom, { x: -99999, y: -99999 }, options);
      near(end.left + end.width, width); near(end.top + end.height, Math.min(480, end.height));
      const start = spreadView(pages, viewport, zoom, { x: 99999, y: 99999 }, options);
      near(start.left, 0); near(start.top, 0);
    }
    const reset = spreadView(pages, viewport, 1, undefined, options); assert.deepEqual(reset, initial);
  }
});
