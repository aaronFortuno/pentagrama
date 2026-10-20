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
    assert.equal(l.notesGap, Math.min(s.marginTop, s.marginBottom));
    if (position === 'bottom') assert.ok(l.staves.at(-1).at(-1) + l.notesGap <= area.top);
    else assert.ok(area.bottom + l.notesGap <= l.staves[0][0]);
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

test('a 40% reserve leaves five of nine staves in their original positions and removing it restores all nine', () => {
  for (const position of ['top', 'bottom']) {
    const s = normalizeSettings({ count: 9 }), full = createDocument(s).pages[0];
    const hybrid = createDocument({ ...s, notes: { enabled: true, percent: 40, position } }).pages[0];
    assert.ok(hybrid.valid); assert.equal(hybrid.layout.count, 9); assert.equal(hybrid.layout.visibleCount, 5);
    assert.equal(hybrid.settings.count, 9); assert.equal(hybrid.layout.gap, full.layout.gap);
    const expected = position === 'top' ? [4,5,6,7,8] : [0,1,2,3,4];
    assert.deepEqual(hybrid.layout.staffIndices, expected);
    assert.deepEqual(hybrid.layout.staves, expected.map(index => full.layout.staves[index]));
    const restored = createDocument({ ...hybrid.settings, notes: { ...hybrid.settings.notes, enabled: false } }).pages[0];
    assert.deepEqual(restored.layout.staves, full.layout.staves);
    assert.equal(renderSvgPage(restored), renderSvgPage(full));
  }
});

test('growing notes only removes edge staves, preserving the pitch and spacing of every remaining row', () => {
  for (const group of [0,3]) for (const position of ['top','bottom']) {
    const full = createDocument({ count:9,group }).pages[0];
    let previous = full.layout.staves.map((_,i)=>i);
    for (let percent=10;percent<=70;percent+=5) {
      const page = createDocument({ ...full.settings, notes:{enabled:true,percent,position} }).pages[0];
      assert.ok(page.valid);assert.equal(page.layout.gap,full.layout.gap);
      for (const index of page.layout.staffIndices) assert.ok(previous.includes(index));
      assert.deepEqual(page.layout.staves,page.layout.staffIndices.map(index=>full.layout.staves[index]));
      assert.deepEqual(createDocument({ pages:[page] }).pages[0],page);
      previous=page.layout.staffIndices;
    }
  }
});

test('asymmetric margins determine the separator and original clefs and bar connections survive cropping from either end', () => {
  for (const position of ['top','bottom']) for (const [marginTop,marginBottom] of [[13,29],[29,13],[0,21]]) {
    const s=normalizeSettings({count:9,group:3,marginTop,marginBottom,clefs:{enabled:true,mode:'pattern',pattern:['treble','alto','bass']},barlines:{enabled:true,connect:'dashed'}});
    const full=createDocument(s).pages[0],page=createDocument({...s,notes:{enabled:true,position,percent:40}}).pages[0];
    assert.ok(page.valid);assert.equal(page.layout.notesGap,Math.min(marginTop,marginBottom));
    const rows=p=>p.systems.flatMap(system=>system.blocks.flatMap(block=>block.staves));
    const original=rows(full),visible=rows(page).filter(staff=>staff.lines.length),ids=new Set(visible.map(staff=>staff.id));
    assert.deepEqual(visible.map(staff=>staff.index),page.layout.staffIndices);
    for(const staff of visible){assert.equal(staff.clef,original[staff.index].clef);assert.equal(staff.id,original[staff.index].id);assert.deepEqual(staff.lines,original[staff.index].lines)}
    assert.equal(page.scene.filter(e=>e.role==='barline'&&e.part==='staff').length,visible.length*4);
    for(const line of page.scene.filter(e=>e.role==='barline'&&e.part==='staff'))assert.ok(ids.has(line.ownerId));
    const area=page.layout.notesArea,minGap=Math.min(marginTop,marginBottom);
    for(const glyph of page.scene.filter(e=>e.role==='clef')){
      assert.ok(ids.has(glyph.ownerId));
      const old=full.scene.find(e=>e.id===glyph.id);assert.deepEqual(glyph.commands,old.commands);
      assert.ok(position==='top'?glyph.bounds.top>=area.bottom+minGap-1e-6:glyph.bounds.bottom<=area.top-minGap+1e-6);
    }
    for(const line of page.scene.filter(e=>e.role==='barline'&&e.part==='connection')){
      const block=page.systems.flatMap(system=>system.blocks).find(b=>b.id===line.ownerId),shown=block.staves.filter(staff=>staff.lines.length);
      assert.ok(shown.some(staff=>staff.lines[4]===line.y1));assert.ok(shown.some(staff=>staff.lines[0]===line.y2));
    }
  }
});

test('explicit block spacing and repeated systems stay anchored and references retain the complete base count', () => {
  const s=normalizeSettings({mode:'blocks',systems:3,systemGap:24,blocks:[{label:'Veus',count:2,inside:10,after:15},{label:'Baix',count:1,inside:8,after:12}],reference:true});
  const full=createDocument(s).pages[0];
  for(const position of ['top','bottom']){
    const doc=createDocument({...s,notes:{enabled:true,position,percent:40}}),page=doc.pages[0];assert.ok(doc.valid);
    assert.ok(page.layout.visibleCount<page.layout.count);
    assert.deepEqual(page.layout.staves,page.layout.staffIndices.map(index=>full.layout.staves[index]));
    assert.deepEqual(createDocument(doc),doc);
    const code=page.scene.filter(e=>e.kind==='text'&&e.anchor==='end').map(e=>e.text).join('');
    const restored=decodeReference(code);assert.equal(restored.systems,3);assert.equal(restored.blocks.length,2);
    assert.deepEqual(createDocument(restored).pages[0].layout.staves,page.layout.staves);
    for(const block of page.systems.flatMap(system=>system.blocks))if(!block.staves.some(staff=>staff.lines.length))assert.equal(block.bounds,null);
  }
  const simple=createDocument({count:9,reference:true,notes:{enabled:true,percent:40}}).pages[0];
  const code=simple.scene.filter(e=>e.kind==='text'&&e.anchor==='end').map(e=>e.text).join('');
  assert.equal(decodeReference(code).count,9);assert.equal(simple.layout.visibleCount,5);
});

test('both faces crop their own original geometry and no complete staff remaining blocks export', () => {
  const s=normalizeSettings({count:9,topSpace:40,pageText:{title:'Harmonia',nameDate:true},duplex:{enabled:true,mirrorMargins:true}});
  const full=createDocument(s),doc=createDocument({...s,notes:{enabled:true,percent:40}});
  assert.ok(doc.valid);
  for(let i=0;i<2;i++)assert.deepEqual(doc.pages[i].layout.staves,doc.pages[i].layout.staffIndices.map(index=>full.pages[i].layout.staves[index]));
  assert.ok(doc.pages[0].layout.visibleCount<=doc.pages[1].layout.visibleCount);
  const empty=createDocument({count:1,notes:{enabled:true,percent:70}});
  assert.equal(empty.pages[0].layout.visibleCount,0);assert.equal(empty.valid,false);
  assert.throws(()=>createPdfDocument(empty),/layoutInvalid/);assert.throws(()=>renderPrintDocument(empty),/layoutInvalid/);
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
