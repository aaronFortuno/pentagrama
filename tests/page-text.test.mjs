import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeSettings, encodeReference, decodeReference, encodeShareHash, decodeShareHash, fitSettings, footerLines, footerTextWidth, FOOTER_SIZE, SERVICE_ADDRESS } from '../docs/layout.js';
import { createDocument, renderSvgPage, renderPrintDocument, createPdfDocument } from '../docs/engine/index.js';
import { normalizePageText, PAGE_TEXT_LIMITS } from '../docs/engine/page-text-settings.js';
import { headerContent, PRINTED_FIELD_LABELS } from '../docs/engine/page-text.js';
import { pageTextWidth, pageFontText, wrapPageText } from '../docs/engine/page-font.js';
import { PAGE_FONT } from '../docs/vendor/page-font-metrics.js';
import { addTemplate, normalizeLibrary } from '../docs/library.js';
import { createResetBaseline } from '../docs/settings-baseline.js';
import { createSettingsHistory } from '../docs/settings-history.js';

const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-5, `${a} != ${b}`);
const sample = { title: 'Educació musical · Aarón', instructions: 'Escriu una melodia en 3/4.\nUtilitza negres, blanques i silencis.', nameDate: true, footer: 'Escola de Música Lluís Millet — curs 2026/27' };

test('page text normalization is bounded, preserves editing spaces and supports every printed field language', () => {
  assert.equal(normalizePageText({ title: 'Música ' }).title, 'Música ');
  assert.equal(normalizePageText({ title: 'Cafe\u0301\n\u0000' }).title, 'Café ');
  for (const [key, max] of Object.entries(PAGE_TEXT_LIMITS)) assert.equal([...normalizePageText({ [key]: 'a'.repeat(max + 1) })[key]].length, max);
  assert.equal(normalizePageText(null).nameDate, false);
  assert.equal(normalizePageText({ language: 'invalid' }).language, 'ca');
  for (const labels of Object.values(PRINTED_FIELD_LABELS)) for (const label of labels) assert.equal(pageFontText(label), label);
  for (const text of ['Educació musical', 'Aarón Fortuño', 'École · François', 'Müller – Weiß', 'Íñigo', 'Orquestra de corda', 'Καλό', 'Музыка']) {
    assert.equal(pageFontText(text), text); assert.ok(pageTextWidth(text, 3.2) > 0);
  }
  assert.equal(PAGE_FONT.weight, 200);
  assert.deepEqual(wrapPageText('Un\n\nDos', 100, 3.2), ['Un', '', 'Dos']);
  const long = wrapPageText('Moltllarg'.repeat(20), 12, 3.2);
  assert.equal(long.join(''), 'Moltllarg'.repeat(20)); assert.ok(long.every(line => pageTextWidth(line, 3.2) <= 12));
});

test('headers reserve physical space and give the name a larger writing area than the date in all languages and formats', () => {
  for (const language of Object.keys(PRINTED_FIELD_LABELS)) for (const paper of ['A4', 'A3', 'LETTER']) for (const orientation of ['portrait', 'landscape']) {
    const s = normalizeSettings({ paper, orientation, count: 6, pageText: { ...sample, language } });
    const doc = createDocument(s), page = doc.pages[0], header = headerContent(s);
    assert.equal(doc.valid, true); assert.ok(page.layout.top > s.marginTop);
    const fields = header.elements.filter(element => element.kind === 'line');
    assert.equal(fields.length, 2); assert.ok(fields[0].x2 - fields[0].x1 > 2 * (fields[1].x2 - fields[1].x1));
    const texts = header.elements.filter(element => element.kind === 'text');
    assert.ok(texts.some(element => element.text === PRINTED_FIELD_LABELS[language][0] + ':'));
    assert.ok(texts.some(element => element.text === PRINTED_FIELD_LABELS[language][1] + ':'));
    assert.ok(fields.every(element => element.y1 + 3 < page.layout.staves[0][0]));
    assert.equal(createDocument({ ...s, topSpace: 80 }).pages[0].layout.top, s.marginTop + 80);
    const print = renderPrintDocument(doc); assert.ok(print.includes(renderSvgPage(page)));
    assert.deepEqual(createDocument(doc), doc);
  }
});

test('header-only front, extra top space and footer placement are independent across both sides', () => {
  for (const firstPageOnly of [true, false]) for (const extraFrontOnly of [true, false]) {
    const s = normalizeSettings({ topSpace: 50, marginLeft: 29, marginRight: 12, pageText: { ...sample, firstPageOnly }, duplex: { enabled: true, mirrorMargins: true, firstPageOnly: extraFrontOnly } });
    const doc = createDocument(s), [front, back] = doc.pages;
    assert.equal(front.scene.filter(element => element.role === 'header-title').length, 1);
    assert.equal(back.scene.filter(element => element.role === 'header-title').length, firstPageOnly ? 0 : 1);
    assert.equal(back.settings.topSpace, extraFrontOnly ? 0 : 50);
    assert.equal(front.scene.find(element => element.role === 'custom-footer').text, sample.footer);
    assert.equal(back.scene.find(element => element.role === 'custom-footer').text, sample.footer);
    assert.equal(back.scene.find(element => element.role === 'custom-footer').anchor, 'middle');
    near(back.scene.find(element => element.role === 'custom-footer').x, (back.layout.left + back.layout.right) / 2);
    assert.equal(s.pageText.title, sample.title);
    assert.deepEqual(createDocument(doc), doc);
  }
});

test('geometry codes exclude all page text while full shares retain Unicode, alignment and named blocks', () => {
  for (const mode of ['simple', 'blocks']) for (const enabled of [true, false]) {
    const s = normalizeSettings({ mode, count: 9, group: 3, blocks: [{ label: 'Veus i piano', count: 4, inside: 10, after: 14 }], pageText: sample,
      duplex: { enabled, mirrorMargins: true }, clefs: { enabled: true }, barlines: { enabled: true, connect: 'dashed' } });
    const code = encodeReference(s); assert.doesNotMatch(code, /^P8-/);
    assert.equal(encodeReference(decodeReference(code)), code); assert.equal(decodeReference(code).pageText.title, '');
    assert.equal(encodeReference({ ...s, pageText: {} }), code);
    assert.equal(encodeReference({ ...s, pageText: { nameDate: true, titleAlign: 'right', firstPageOnly: false, language: 'eu', footer: 'Different' }, source: true, reference: true }), code);
    assert.deepEqual(decodeShareHash(encodeShareHash(s)).pageText, s.pageText);
    if (mode === 'blocks') assert.equal(decodeShareHash(encodeShareHash(s)).blocks[0].label, 'Veus i piano');
    assert.equal(encodeReference(decodeReference(code.match(/.{1,70}/g).join('\n'))), code);
    for (const malformed of [code + '-Qabc', code + '-Q%%%%']) assert.throws(() => decodeReference(malformed), /invalidRef/);
  }
  for (const code of ['P1-N9-G3-E22-T12', 'P2-A4-P-I20-T12-N9-G0-E22', 'P7-A4-P-I20-T12-N9-G0-E22-DF.M']) assert.equal(decodeReference(code).pageText.title, '');
  const blank = normalizeSettings({ pageText: { titleAlign: 'center', firstPageOnly: false, language: 'eu' } });
  assert.deepEqual(decodeShareHash(encodeShareHash(blank)).pageText, blank.pageText);
});

test('historical P8 text references remain importable without being generated or printed again', () => {
  const tuple = [sample.title, sample.instructions, true, true, 'ca', sample.footer];
  const payload = Buffer.from(JSON.stringify(tuple), 'utf8').toString('base64url');
  const code = 'P8-A4-P-I20-T12-N9-G0-E22-Q' + payload;
  const restored = decodeReference(code);
  assert.equal(restored.pageText.title, sample.title); assert.equal(restored.pageText.footer, sample.footer);
  assert.equal(encodeReference(restored), 'P2-A4-P-I20-T12-N9-G0-E22');
  assert.deepEqual(decodeShareHash(code).pageText, restored.pageText);
  for (const malformed of [code.replace(/-Q.*/, ''), code + '-Qabc', code.replace(/-Q.*/, '-Q%%%%'), code.replace(/^P8/, 'P7')]) assert.throws(() => decodeReference(malformed), /invalidRef/);
});

test('title and instructions have independent physical alignment in SVG, PDF and full shares', () => {
  for (const titleAlign of ['left', 'center', 'right']) for (const instructionsAlign of ['left', 'center', 'right']) {
    const s = normalizeSettings({ marginLeft: 25, marginRight: 13, pageText: { ...sample, titleAlign, instructionsAlign } });
    assert.deepEqual(decodeShareHash(encodeShareHash(s)).pageText, s.pageText);
    const doc = createDocument(s), page = doc.pages[0], pdf = new TextDecoder().decode(createPdfDocument(doc));
    const commands = [...pdf.matchAll(/\/F2 ([\d.]+) Tf 1 0 0 1 ([\d.]+) ([\d.]+) Tm <([0-9a-f]+)>/g)];
    const text = page.scene.filter(element => element.font === 'page');
    for (const [role, align] of [['header-title', titleAlign], ['header-instructions', instructionsAlign]]) {
      const item = text.find(element => element.role === role), index = text.indexOf(item);
      assert.equal(item.anchor, { left: 'start', center: 'middle', right: 'end' }[align]);
      assert.equal(item.x, align === 'left' ? 25 : align === 'right' ? 197 : 111);
      const x = item.x - pageTextWidth(item.text, item.fontSize) * (align === 'center' ? .5 : align === 'right' ? 1 : 0);
      near(Number(commands[index][2]), x * 72 / 25.4);
      assert.ok(renderSvgPage(page).includes(`text-anchor="${item.anchor}"`));
    }
  }
});

test('personal footers coexist with source and complete references without overlapping staves', () => {
  const s = normalizeSettings({ reference: true, source: true, marginBottom: 2, pageText: sample, duplex: { enabled: true, mirrorMargins: true } });
  const doc = createDocument(s), reference = encodeReference(s); assert.equal(doc.valid, true);
  for (const page of doc.pages) {
    const footers = footerLines(page.settings, page.referenceSettings);
    assert.equal(footers.filter(line => line.anchor === 'end').map(line => line.text).join(''), reference);
    assert.equal(decodeReference(reference).pageText.title, '');
    for (const line of footers) { assert.ok(line.y < page.frame.height); assert.ok(line.y - (line.fontSize || 2.2) > page.layout.staves.at(-1).at(-1)); }
  }
});

test('custom text, source and reference share one fixed baseline without wrapping or overlap in every format', () => {
  for (const paper of ['A4','A3','LETTER']) for (const orientation of ['portrait','landscape']) for (const source of [false,true]) for (const reference of [false,true]) {
    for (const [marginLeft,marginRight] of [[18,18],[31,12],[80,85]]) for (const text of ['Escola de Música', 'Música · '.repeat(20)]) {
      const s=normalizeSettings({paper,orientation,source,reference,marginLeft,marginRight,pageText:{footer:text},duplex:{enabled:true,mirrorMargins:true}});
      const doc=createDocument(s);
      for(const page of doc.pages){
        const rows=footerLines(page.settings,page.referenceSettings),baseline=page.frame.height-Math.min(9,Math.max(2,s.marginBottom/2));
        assert.equal(rows.length,1+Number(source)+Number(reference));assert.ok(rows.every(row=>row.y===baseline));
        const custom=rows.find(row=>row.role==='custom-footer');assert.equal(custom.text,s.pageText.footer.trim());assert.equal(custom.anchor,'middle');
        if(!source&&!reference)near(custom.x,(page.layout.left+page.layout.right)/2);
        if(source)assert.equal(rows.find(row=>row.text===SERVICE_ADDRESS).x,page.layout.left);
        if(reference)assert.equal(rows.find(row=>row.anchor==='end').text,encodeReference(s));
        const bounds=rows.map(row=>{
          const size=row.fontSize??FOOTER_SIZE,width=row.font==='page'?pageTextWidth(row.text,size):footerTextWidth(row.text,size);
          assert.ok(Number.isFinite(size)&&size>0&&size<=2.4);assert.ok(!row.text.includes('\n'));
          const left=row.x-width*(row.anchor==='middle'?.5:row.anchor==='end'?1:0);return{left,right:left+width};
        }).sort((a,b)=>a.left-b.left);
        for(let i=0;i<bounds.length;i++){assert.ok(bounds[i].left>=page.layout.left-1e-6);assert.ok(bounds[i].right<=page.layout.right+1e-6);if(i)assert.ok(bounds[i-1].right<=bounds[i].left+1e-6)}
      }
    }
  }
});

test('scaled footer references use their effective font size in both SVG and PDF anchoring', () => {
  const doc=createDocument({count:4,marginLeft:70,marginRight:80,source:true,reference:true,pageText:{footer:'Escola de Música · '.repeat(8)},duplex:{enabled:true,mirrorMargins:true}});
  assert.ok(doc.valid);
  const pdf=new TextDecoder().decode(createPdfDocument(doc)),points=v=>(v*72/25.4).toFixed(5);
  for(const page of doc.pages){
    const svg=renderSvgPage(page),reference=page.scene.find(e=>e.kind==='text'&&e.anchor==='end');assert.ok(reference.fontSize<FOOTER_SIZE);
    const x=reference.x-footerTextWidth(reference.text,reference.fontSize);
    assert.ok(svg.includes(`text-anchor="end" font-family="'Pentagrama Footer',serif" font-size="${reference.fontSize}"`));
    assert.ok(pdf.includes(`/F1 ${points(reference.fontSize)} Tf 1 0 0 1 ${points(x)} ${points(page.frame.height-reference.y)} Tm (${reference.text}) Tj`));
  }
});

test('templates, undo/redo, reset and fitting retain the complete personalized sheet', () => {
  const s = normalizeSettings({ pageText: sample });
  const saved = normalizeLibrary(addTemplate({}, { id: 'school', name: 'Activitat', settings: s }));
  assert.deepEqual(saved.saved[0].settings.pageText, s.pageText);
  const history = createSettingsHistory({}); history.record(s); history.undo(); assert.deepEqual(history.redo(), s);
  const baseline = createResetBaseline(); baseline.fromHash(encodeShareHash(s)); assert.deepEqual(baseline.restore().pageText, s.pageText);
  const fitted = fitSettings({ ...s, count: 64, lineSpacing: 4 }); assert.equal(createDocument(fitted).valid, true); assert.deepEqual(fitted.pageText, s.pageText);
});

test('personalized SVG escapes text and Unicode PDF shares its font and maps accents back to readable text', () => {
  const doc = createDocument({ pageText: { ...sample, title: 'Música <script> & "Nom"' }, reference: true, duplex: { enabled: true } });
  const svg = renderSvgPage(doc.pages[0]), pdfBytes = createPdfDocument(doc), pdf = new TextDecoder().decode(pdfBytes);
  assert.ok(svg.includes('&lt;script> &amp; &quot;Nom&quot;')); assert.ok(!svg.includes('<script>'));
  assert.ok(svg.includes("'Pentagrama Text'")); assert.ok(svg.includes('font-weight="200"'));
  assert.ok(pdf.includes('/Subtype /Type0')); assert.ok(pdf.includes('/ToUnicode')); assert.ok(pdf.includes('/CIDToGIDMap'));
  for (const code of ['00f3', '00ed', '00fa', '00f1']) assert.ok(pdf.includes('> <' + code + '>'));
  assert.equal((pdf.match(/\/FontFile2 /g) || []).length, 2); // Legacy reference + shared Unicode font.
  const xref = Number(/startxref\n(\d+)/.exec(pdf)[1]); assert.equal(pdf.slice(xref, xref + 4), 'xref');
  const commands = [...pdf.matchAll(/\/F2 ([\d.]+) Tf 1 0 0 1 ([\d.]+) ([\d.]+) Tm <([0-9a-f]+)>/g)];
  assert.ok(commands.length >= 6);
  const first = doc.pages[0].scene.find(element => element.font === 'page'); near(Number(commands[0][1]), first.fontSize * 72 / 25.4);
  const off = createDocument({}); assert.ok(!renderSvgPage(off.pages[0]).includes('<text')); assert.ok(!new TextDecoder().decode(createPdfDocument(off)).includes('/ToUnicode'));
});
