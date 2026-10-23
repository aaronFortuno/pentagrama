import test from 'node:test';
import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';
import { normalizeSettings, encodeReference, encodeShareHash, decodeShareHash, DEFAULTS } from '../docs/layout.js';
import { createDocument, renderSvgPage, renderPrintDocument, createPdfDocument } from '../docs/engine/index.js';
import { DEFAULT_TITLE_STYLE, DEFAULT_INSTRUCTIONS_STYLE, TEXT_FAMILIES, normalizeTextStyle, pointsToMm, mmToPoints } from '../docs/engine/text-style.js';
import { encodePageText, decodePageText, normalizePageText, hasPageTextSettings, sharedPageText } from '../docs/engine/page-text-settings.js';
import { pageFontKey, pageFontMetrics, pageFontAppearance, pageTextWidth, pageFontText } from '../docs/engine/page-font.js';
import { pageTextHex } from '../docs/engine/page-font-pdf.js';
import { HEADER_FONTS } from '../docs/vendor/header-font-metrics.js';
import { HEADER_FONT_DATA } from '../docs/vendor/header-font-data.js';
import { textPreferences, withTextPreferences, withEmptyTextPreferences } from '../docs/text-preferences.js';
import { addTemplate, normalizeLibrary } from '../docs/library.js';
import { createSettingsHistory } from '../docs/settings-history.js';
import { createResetBaseline } from '../docs/settings-baseline.js';
const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-5, `${a} != ${b}`);
const title = 'Educació musical · Àlbum';
const instructions = 'Íñigo · François · Müller · Iñaki · Galiza · Ç · Œ';

test('text styles have bounded physical sizes, strict options and independent defaults', () => {
  assert.deepEqual(normalizePageText({}).titleStyle, DEFAULT_TITLE_STYLE);
  assert.deepEqual(normalizePageText({}).instructionsStyle, DEFAULT_INSTRUCTIONS_STYLE);
  assert.equal(hasPageTextSettings({}), false);
  for (const value of [null, '', false, []]) assert.deepEqual(normalizeTextStyle(value), DEFAULT_TITLE_STYLE);
  assert.deepEqual(normalizeTextStyle({ family: '<script>', size: Infinity, bold: 'true', italic: 1, underline: [] }), DEFAULT_TITLE_STYLE);
  assert.equal(normalizeTextStyle({ size: -1 }).size, 2.12); assert.equal(normalizeTextStyle({ size: 100 }).size, 16.93);
  const a = normalizeSettings({}), b = normalizeSettings({}); a.pageText.titleStyle.bold = true;
  assert.equal(b.pageText.titleStyle.bold, false); assert.equal(b.pageText.instructionsStyle.bold, false);
  near(mmToPoints(25.4), 72); near(pointsToMm(72), 25.4);
});

test('all real font faces cover the site languages and have local webfonts and Unicode programs', async () => {
  for (const family of TEXT_FAMILIES) for (const bold of [false, true]) for (const italic of [false, true]) {
    const key = pageFontKey({ family, bold, italic }), font = pageFontMetrics(key);
    assert.equal(font.weight, bold ? 700 : family === 'serif' ? 200 : 400);
    assert.equal(pageFontAppearance(key).italic, italic);
    assert.equal(pageFontText(title + instructions, key), title + instructions);
    const bytes = Buffer.from(key === 'serif-regular' ? (await import('../docs/vendor/page-font-data.js')).PAGE_FONT_DATA : HEADER_FONT_DATA[key], 'base64');
    assert.equal(bytes.readUInt32BE(0), 0x00010000);
    assert.ok(font.characters.length === font.widths.length && font.characters.length === font.glyphs.length);
    if (key !== 'serif-regular') {
      assert.ok(HEADER_FONTS[key]); await access(new URL(`../docs/vendor/header-${key}.woff2`, import.meta.url));
      if (italic) assert.ok(font.italicAngle < 0);
      if (family === 'lora') assert.ok(font.name.startsWith('PentagramaEditorial-'));
    }
  }
});

test('the interactive editor does not load PDF font programs', async () => {
  const visited = new Set();
  async function visit(url) {
    url.search = ''; if (visited.has(url.href)) return; visited.add(url.href);
    const source = await readFile(url, 'utf8');
    for (const [, path] of source.matchAll(/from ['"]((?:\.{1,2}\/)[^'"]+\.js)(?:\?v=[^'"]+)?['"]/g)) await visit(new URL(path, url));
  }
  await visit(new URL('../docs/app.js', import.meta.url));
  assert.ok(![...visited].some(path => /(?:header-font-data|page-font-data|footer-font-data)\.js$/.test(path)));
});

test('every face, alignment and underline shares measured placement across SVG, print and embedded PDF', () => {
  const points = value => (value * 72 / 25.4).toFixed(5);
  for (const family of TEXT_FAMILIES) for (const bold of [false, true]) for (const italic of [false, true]) for (const align of ['left', 'center', 'right']) {
    const style = { family, size: pointsToMm(22), bold, italic, underline: true };
    const doc = createDocument({ count: 5, marginLeft: 25, marginRight: 16, pageText: { title, instructions, titleAlign: align, titleStyle: style, instructionsStyle: { family: 'sans', size: pointsToMm(12) }, nameDate: true } });
    assert.ok(doc.valid); const page = doc.pages[0], line = page.scene.find(e => e.role === 'header-title');
    const key = pageFontKey(style), width = pageTextWidth(title, style.size, key), x = line.x - width * (align === 'center' ? .5 : align === 'right' ? 1 : 0);
    const underline = page.scene.find(e => e.role === 'header-title-underline');
    near(underline.x1, x); near(underline.x2, x + width); assert.ok(underline.y1 > line.y);
    assert.ok(underline.x1 >= page.layout.left - 1e-6 && underline.x2 <= page.layout.right + 1e-6);
    const svg = renderSvgPage(page), pdf = new TextDecoder().decode(createPdfDocument(doc));
    const face = pageFontAppearance(key);
    assert.ok(svg.includes(`font-family="'${face.family}',${face.fallback}" font-size="${style.size}" font-weight="${face.weight}"${italic ? ' font-style="italic"' : ''}`));
    assert.ok(renderPrintDocument(doc).includes(svg));
    const faces = new Set(page.scene.filter(e => e.font === 'page').map(e => e.fontFace || 'serif-regular'));
    const font = 'F' + ([...faces].indexOf(key) + 2);
    assert.ok(pdf.includes(`/${font} ${points(style.size)} Tf 1 0 0 1 ${points(x)} ${points(page.frame.height - line.y)} Tm <${pageTextHex(title, key)}>`));
    assert.ok(pdf.includes(`/BaseFont /${pageFontMetrics(key).name}`));
    assert.ok(pdf.includes(`${points(underline.x1)} ${points(page.frame.height - underline.y1)} m ${points(underline.x2)} ${points(page.frame.height - underline.y2)} l S`));
    assert.equal((pdf.match(/\/Subtype \/Type0/g) || []).length, faces.size);
  }
});

test('formatting changes wrapping and reserved space, with no text truncation and normal overflow protection', () => {
  const settings = { count: 4, pageText: { title, instructions: instructions.repeat(5), titleStyle: { family: 'lora', size: 12, bold: true }, instructionsStyle: { family: 'sans', size: 6, italic: true, underline: true } } };
  const doc = createDocument(settings); assert.ok(doc.valid);
  const page = doc.pages[0], lines = page.scene.filter(e => e.role === 'header-instructions');
  assert.ok(lines.length > 1);
  for (const line of lines) assert.ok(pageTextWidth(line.text, line.fontSize, line.fontFace) <= page.layout.right - page.layout.left);
  const huge = createDocument({ ...settings, pageText: { ...settings.pageText, instructions: 'Activitat '.repeat(50), instructionsStyle: { size: 16.93 } } });
  assert.equal(huge.valid, false); assert.throws(() => createPdfDocument(huge), /layoutInvalid/);
});

test('formatted shares extend canonical tuples without changing old links or geometry references', () => {
  for (const family of TEXT_FAMILIES) {
    const s = normalizeSettings({ pageText: { title, instructions, titleStyle: { family, size: 8, bold: true, italic: true, underline: true }, instructionsStyle: { family: 'sans', size: 4.2 }, instructionsAlign: 'right' } });
    assert.deepEqual(decodeShareHash(encodeShareHash(s)), s);
    assert.deepEqual(decodePageText(encodePageText(s.pageText)), s.pageText);
    assert.equal(JSON.parse(Buffer.from(encodePageText(s.pageText), 'base64url')).length, 10);
    assert.equal(encodeReference(s), encodeReference({ ...s, pageText: {} }));
  }
  for (const length of [6, 8]) {
    const values = ['Legacy', '', false, true, 'ca', '', ...(length === 8 ? ['right', 'left'] : [])];
    const encoded = Buffer.from(JSON.stringify(values)).toString('base64url');
    assert.equal(encodePageText(decodePageText(encoded)), encoded);
  }
  const values = ['Title', '', false, true, 'ca', '', 'left', 'left', ['INVALID', 8, false, false, false], ['serif', 3.2, false, false, false]];
  assert.throws(() => decodePageText(Buffer.from(JSON.stringify(values)).toString('base64url')), /invalidRef/);
  assert.equal(encodeShareHash(DEFAULTS).includes('~'), false);
});

test('templates, history, reset and explicit-page inheritance retain independent formatting', () => {
  const settings = normalizeSettings({ pageText: { title, titleStyle: { family: 'lora', bold: true, size: 8 }, instructionsStyle: { family: 'sans', italic: true, underline: true } } });
  const library = normalizeLibrary(addTemplate({}, { id: 'test', name: 'Test', settings }));
  assert.deepEqual(library.saved[0].settings, settings);
  const history = createSettingsHistory({}); history.record(settings); history.undo(); assert.deepEqual(history.redo(), settings);
  const reset = createResetBaseline(); reset.fromHash(encodeShareHash(settings)); assert.deepEqual(reset.restore(), normalizeSettings({ ...settings, pageText: sharedPageText(settings.pageText) }));
  assert.deepEqual(createResetBaseline(settings).restore(), settings);
  const doc = createDocument({ settings, pages: [{ settings: { pageText: { titleStyle: { italic: true } } } }, { settings: { pageText: { title: 'Other' } } }] });
  assert.equal(doc.pages[0].settings.pageText.titleStyle.family, 'lora'); assert.equal(doc.pages[0].settings.pageText.titleStyle.bold, true);
  assert.equal(doc.pages[0].settings.pageText.titleStyle.italic, true); assert.equal(doc.pages[1].settings.pageText.titleStyle.italic, false);
});

test('browser defaults contain only formatting and apply to new suggested sheets without changing saved snapshots', () => {
  const original = normalizeSettings({ pageText: { title: 'PRIVATE', instructions: 'PRIVATE', nameDate: true, footer: 'PRIVATE', titleStyle: { family: 'lora', bold: true, size: 9 }, instructionsAlign: 'right' } });
  const preferences = textPreferences(original.pageText);
  assert.equal(JSON.stringify(preferences).includes('PRIVATE'), false);
  assert.deepEqual(Object.keys(preferences), ['titleStyle', 'instructionsStyle', 'titleAlign', 'instructionsAlign', 'footerStyle', 'footerAlign']);
  const fresh = normalizeSettings(withTextPreferences(DEFAULTS, preferences));
  assert.equal(fresh.pageText.title, ''); assert.equal(fresh.pageText.nameDate, false); assert.equal(fresh.pageText.titleStyle.family, 'lora');
  assert.equal(fresh.pageText.instructionsAlign, 'right');
  const next = textPreferences({ ...preferences, instructionsStyle: { family: 'sans', size: 5 } });
  assert.deepEqual(next.titleStyle, preferences.titleStyle); assert.equal(next.instructionsStyle.family, 'sans');
  const own = decodeShareHash(encodeShareHash(original)); assert.deepEqual(own, original);
  assert.equal(original.pageText.title, 'PRIVATE');
});


test('footer typography shares measured SVG, print and PDF placement, with bounded source and reference slots', () => {
  for (const family of TEXT_FAMILIES) for (const align of ['left','center','right']) {
    const s = normalizeSettings({ count: 4, source: true, reference: true, marginBottom: 0, pageText: { footer: title, footerAlign: align, footerStyle: { family, size: 8, bold: true, italic: true, underline: true } } });
    const doc = createDocument(s); assert.ok(doc.valid);
    const page = doc.pages[0], line = page.scene.find(e => e.role === 'custom-footer'), underline = page.scene.find(e => e.role === 'custom-footer-underline');
    const width = pageTextWidth(line.text, line.fontSize, line.fontFace);
    near(underline.x1, line.x - width / 2); near(underline.x2, line.x + width / 2);
    assert.ok(underline.y1 + underline.strokeWidth / 2 < page.frame.height);
    assert.ok(line.y - line.fontSize > page.layout.staves.at(-1)[4] + 2.9);
    const svg = renderSvgPage(page), pdf = new TextDecoder().decode(createPdfDocument(doc));
    assert.ok(svg.includes('font-style="italic"')); assert.ok(renderPrintDocument(doc).includes(svg));
    assert.ok(pdf.includes('/BaseFont /' + pageFontMetrics(line.fontFace).name));
    assert.ok(pdf.includes(pageTextHex(title, line.fontFace)));
    assert.equal(encodeReference(s), encodeReference({...s,pageText:{}}));
  }
});

test('footer styles survive shared links, saved snapshots, defaults and nested document overrides', () => {
  const s=normalizeSettings({pageText:{footer:'Escola',footerAlign:'right',footerStyle:{family:'sans',size:4,bold:true,underline:true}}});
  assert.deepEqual(decodeShareHash(encodeShareHash(s)),s);
  assert.equal(JSON.parse(Buffer.from(encodePageText(s.pageText),'base64url')).length,12);
  const prefs=textPreferences(s.pageText), fresh=normalizeSettings(withTextPreferences(DEFAULTS,prefs));
  assert.deepEqual(fresh.pageText.footerStyle,s.pageText.footerStyle);assert.equal(fresh.pageText.footer,'');assert.equal(fresh.pageText.footerAlign,'right');
  const doc=createDocument({settings:s,pages:[{settings:{pageText:{footerStyle:{italic:true}}}},{settings:{}}]});
  assert.equal(doc.pages[0].settings.pageText.footerStyle.bold,true);assert.equal(doc.pages[0].settings.pageText.footerStyle.italic,true);
  assert.equal(doc.pages[1].settings.pageText.footerStyle.italic,false);
});


test('the reported empty Trio link compacts to geometry while old payloads remain readable',()=>{
 const old='P2-A4-P-I20-T12-N9-G3-E22~%7B%22t%22%3A%22WyIiLCIiLGZhbHNlLHRydWUsImNhIiwiIiwiY2VudGVyIiwibGVmdCIsWyJsb3JhIiw2LHRydWUsdHJ1ZSxmYWxzZV0sWyJsb3JhIiwzLjkyLGZhbHNlLHRydWUsZmFsc2VdXQ%22%7D';
 const original=decodeShareHash(old),short=encodeShareHash(original);assert.equal(short,'P2-A4-P-I20-T12-N9-G3-E22');
 assert.equal(original.pageText.titleStyle.family,'lora');assert.equal(original.pageText.instructionsStyle.italic,true);
 const before=createDocument(original),after=createDocument(decodeShareHash(short));assert.equal(renderSvgPage(before.pages[0]),renderSvgPage(after.pages[0]));assert.deepEqual(createPdfDocument(before),createPdfDocument(after));
});

test('only content-bearing text fields and named blocks extend shared links, without mutating stored templates',()=>{
 for(const field of ['title','instructions','footer'])for(const family of TEXT_FAMILIES)for(const nameDate of [false,true]){
  const original=normalizeSettings({mode:'blocks',pageText:{[field]:'Educació · Íñigo',titleStyle:{family,bold:true},instructionsStyle:{family,italic:true},footerStyle:{family,underline:true},titleAlign:'right',instructionsAlign:'center',footerAlign:'left',language:'eu',nameDate,firstPageOnly:false}});
  const snapshot=JSON.stringify(original),hash=encodeShareHash(original),restored=decodeShareHash(hash);
  assert.deepEqual(restored.pageText,sharedPageText(original.pageText));assert.equal(restored.pageText[field],original.pageText[field]);
  assert.equal(restored.pageText[field+'Style'].family,family);assert.equal(JSON.stringify(original),snapshot);
  assert.ok(!decodeURIComponent(hash).includes('"b"'));
  const before=createDocument(original),after=createDocument(restored);assert.equal(renderSvgPage(before.pages[0]),renderSvgPage(after.pages[0]));
 }
 const empty=normalizeSettings({mode:'blocks',pageText:{title:'  ',instructions:'\n ',footer:' ',language:'de',firstPageOnly:false,titleAlign:'right',footerStyle:{family:'lora',size:5}}});assert.equal(encodeShareHash(empty),encodeReference(empty));
 empty.blocks[1].label='Piano';const restored=decodeShareHash(encodeShareHash(empty));assert.equal(restored.blocks[0].label,'');assert.equal(restored.blocks[1].label,'Piano');
 const library=normalizeLibrary(addTemplate({}, {id:'empty-style',name:'Test',settings:empty}));assert.deepEqual(library.saved[0].settings,empty);
});

test('compact links use local preferences only for empty fields and preserve the linked content format',()=>{
 const preferences=textPreferences({titleStyle:{family:'sans',bold:true},instructionsStyle:{family:'lora',italic:true},footerAlign:'right',footerStyle:{size:5}});
 const sheet=normalizeSettings({pageText:{title:'Shared title',titleStyle:{family:'lora',size:8,underline:true}}});
 const original=JSON.stringify(sheet),restored=normalizeSettings(withEmptyTextPreferences(decodeShareHash(encodeShareHash(sheet)),preferences));
 assert.deepEqual(restored.pageText.titleStyle,sheet.pageText.titleStyle);assert.deepEqual(restored.pageText.instructionsStyle,preferences.instructionsStyle);assert.deepEqual(restored.pageText.footerStyle,preferences.footerStyle);assert.equal(restored.pageText.footerAlign,'right');
 assert.equal(restored.pageText.instructions,'');assert.equal(JSON.stringify(sheet),original);
});
