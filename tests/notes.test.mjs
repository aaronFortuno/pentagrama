import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeSettings, encodeReference, decodeReference, encodeShareHash, decodeShareHash, fitSettings } from '../docs/layout.js';
import { createDocument, renderSvgPage, renderPrintDocument, createPdfDocument } from '../docs/engine/index.js';
import { normalizeNotes } from '../docs/engine/notes.js';
import { addTemplate, normalizeLibrary } from '../docs/library.js';
import { createResetBaseline } from '../docs/settings-baseline.js';
import { createSettingsHistory } from '../docs/settings-history.js';

const near = (a, b) => assert.ok(Math.abs(a-b) < 1e-6, `${a} != ${b}`);
test('notes default to an inactive bottom dotted area and normalize bounds by pattern', () => {
  assert.deepEqual(normalizeNotes(), { enabled: false, position: 'bottom', percent: 40, pattern: 'dots', spacing: 8 });
  assert.equal(normalizeNotes({ percent: Infinity, spacing: NaN }).percent, 40);
  assert.equal(normalizeNotes({ percent: 99, spacing: 50 }).percent, 70);
  assert.equal(normalizeNotes({ percent: -1, spacing: -1 }).spacing, 6);
  assert.equal(normalizeNotes({ percent: 42 }).percent, 40);
  assert.equal(normalizeNotes({ pattern: 'ruled' }).spacing, 10);
  assert.equal(normalizeNotes({ pattern: 'ruled', spacing: 4 }).spacing, 8);
  assert.equal(normalizeNotes({ pattern: 'ruled', spacing: 99 }).spacing, 12);
  assert.equal(normalizeNotes({ enabled: 'true', pattern: 'invalid' }).enabled, false);
});

test('notes fit inside content margins with a music gap on either side for every format and pattern', () => {
  for (const paper of ['A4', 'A3', 'LETTER']) for (const orientation of ['portrait', 'landscape']) for (const position of ['top', 'bottom']) for (const pattern of ['blank', 'ruled', 'grid', 'dots']) {
    const s = normalizeSettings({ paper, orientation, count: 4, marginLeft: 27, marginRight: 13, marginTop: 15, marginBottom: 19,
      notes: { enabled: true, position, pattern, percent: 40 }, clefs: { enabled: true }, barlines: { enabled: true },
      pageText: { title: 'Harmonia', instructions: 'Pren apunts', nameDate: true, footer: 'Escola' }, reference: true });
    const doc = createDocument(s), page = doc.pages[0], l = page.layout, area = l.notesArea;
    assert.ok(doc.valid); assert.equal(area.left, 27); assert.equal(area.right, l.width - 13);
    assert.ok(area.top >= s.marginTop); assert.ok(area.bottom <= l.height - s.marginBottom);
    const headerBottom = Math.max(...page.scene.filter(e => e.role?.startsWith('header-') || e.role?.startsWith('student-')).map(e=>e.y ?? e.y1));
    assert.ok(area.top > headerBottom);
    if (position === 'bottom') assert.ok(l.staves.at(-1).at(-1) + 6 <= area.top);
    else assert.ok(area.bottom + 6 <= l.staves[0][0]);
    const marks = page.scene.filter(e => e.role?.startsWith('notes-'));
    assert.equal(marks.length > 0, pattern !== 'blank');
    for (const mark of marks) {
      assert.ok(mark.gray >= 180 && mark.gray <= 210);
      for (const x of mark.kind === 'circle' ? [mark.x-mark.radius,mark.x+mark.radius] : [mark.x1,mark.x2]) assert.ok(x>=area.left && x<=area.right);
      for (const y of mark.kind === 'circle' ? [mark.y-mark.radius,mark.y+mark.radius] : [mark.y1,mark.y2]) assert.ok(y>=area.top && y<=area.bottom);
    }
    const ids = page.scene.map(e=>e.id); assert.equal(new Set(ids).size, ids.length);
    assert.deepEqual(createDocument(doc), doc); assert.ok(renderPrintDocument(doc).includes(renderSvgPage(page)));
  }
});

test('reserved percentage measures usable height and follows independent headers and mirrored margins on both faces', () => {
  const s = normalizeSettings({ count: 4, topSpace: 40, marginLeft: 30, marginRight: 12, notes: { enabled: true, percent: 35 },
    pageText: { title: 'Harmonia', firstPageOnly: true }, duplex: { enabled: true, firstPageOnly: true, mirrorMargins: true } });
  const doc = createDocument(s); assert.ok(doc.valid);
  for (const page of doc.pages) {
    const area = page.layout.notesArea, contentTop = page.settings.marginTop + page.settings.topSpace;
    near(area.bottom-area.top, (page.frame.height-page.settings.marginBottom-contentTop)*.35);
  }
  assert.equal(doc.pages[0].layout.notesArea.left, 30); assert.equal(doc.pages[1].layout.notesArea.left, 12);
  assert.ok(doc.pages[1].layout.notesArea.bottom-doc.pages[1].layout.notesArea.top > doc.pages[0].layout.notesArea.bottom-doc.pages[0].layout.notesArea.top);
  const explicit = createDocument({ settings: s, pages: [{}, { settings: { notes: { position: 'top' } } }] });
  assert.equal(explicit.pages[1].settings.notes.enabled, true); assert.equal(explicit.pages[1].settings.notes.position, 'top');
});

test('compact hybrid codes have bounded growth, preserve full geometry and reject noncanonical notes', () => {
  for (const position of ['top', 'bottom']) for (const pattern of ['blank', 'ruled', 'grid', 'dots']) for (const mode of ['simple','blocks']) {
    const s = normalizeSettings({ mode, notes: { enabled: true, position, pattern, percent: 45 }, duplex: { enabled: true },
      clefs: { enabled: true, mode: 'pattern', pattern: ['treble','bass'] }, barlines: { enabled: true, connect: 'solid' },
      marginTop: 19, pageText: { title: 'A'.repeat(100), instructions: 'B'.repeat(500), footer: 'C'.repeat(160) } });
    const code = encodeReference(s), plain = encodeReference({ ...s, notes: {} });
    assert.match(code, /^P9-/); assert.ok(code.length-plain.length<=9);
    assert.deepEqual(decodeReference(code).notes, s.notes); assert.equal(encodeReference(decodeReference(code)), code);
    assert.equal(encodeReference({...s, pageText:{}}),code);
    assert.deepEqual(decodeShareHash(encodeShareHash(s)).notes, s.notes);
    assert.deepEqual(decodeShareHash(encodeShareHash(s)).pageText, s.pageText);
    for (const invalid of [code.replace(/-W.*/,''),code.replace(/-W.*/,'-WB99.D8'),code.replace(/-W.*/,'-WB45.D20'),code+'-WB45.D8']) assert.throws(()=>decodeReference(invalid),/invalidRef/);
  }
});

test('every pattern exports vector marks with matching SVG/PDF coordinates and restores black music strokes', () => {
  for (const pattern of ['blank','ruled','grid','dots']) {
    const doc = createDocument({ count: 5, notes: { enabled: true, pattern }, pageText: { nameDate: true }, duplex: { enabled: true } });
    assert.ok(doc.valid); const page = doc.pages[0], svg = renderSvgPage(page), pdf = new TextDecoder().decode(createPdfDocument(doc));
    const marks = page.scene.filter(e=>e.role?.startsWith('notes-'));
    if (pattern === 'dots') {
      assert.equal((svg.match(/<circle /g)||[]).length, marks.length);
      assert.equal((pdf.match(/h f\n/g)||[]).length, marks.length*2);
      const first=marks[0];assert.ok(svg.includes(`cx="${first.x}" cy="${first.y}" r="${first.radius}"`));
      assert.ok(pdf.includes(`${((first.x+first.radius)*72/25.4).toFixed(5)} ${((page.frame.height-first.y)*72/25.4).toFixed(5)} m`));
    } else if (pattern !== 'blank') {
      assert.ok(svg.includes('stroke="rgb(')); assert.ok(pdf.includes((marks[0].gray/255).toFixed(5)+' G'));
      // Name/date lines follow the gray notes in the scene, so the PDF must restore black.
      assert.ok(pdf.includes('0.00000 G\n'));
    }
    assert.ok(!pdf.includes('/Subtype /Image'));
    const xref=Number(/startxref\n(\d+)/.exec(pdf)[1]);assert.equal(pdf.slice(xref,xref+4),'xref');
  }
});

test('hybrid settings survive templates, undo/redo, reset and fitting without reducing the notes reserve', () => {
  const s=normalizeSettings({ count:64, notes:{enabled:true,percent:60,position:'top',pattern:'grid',spacing:7}, pageText:{title:'Harmonia'} });
  const fitted=fitSettings(s);assert.ok(createDocument(fitted).valid);assert.deepEqual(fitted.notes,s.notes);assert.deepEqual(fitted.pageText,s.pageText);
  const saved=normalizeLibrary(addTemplate({}, {id:'hybrid',name:'Apunts',settings:s}));assert.deepEqual(saved.saved[0].settings.notes,s.notes);
  const history=createSettingsHistory({});history.record(s);history.undo();assert.deepEqual(history.redo(),s);
  const baseline=createResetBaseline();baseline.fromHash(encodeShareHash(s));assert.deepEqual(baseline.restore().notes,s.notes);
  assert.equal(createDocument(s).valid,false);assert.throws(()=>createPdfDocument(createDocument(s)),/layoutInvalid/);
});
