import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { DEFAULTS, normalizeSettings, createLayout, fitSettings, encodeReference, decodeReference, encodeShareHash, decodeShareHash } from '../docs/layout.js';
import { createDocument, renderSvgPage, renderPrintDocument, createPdfDocument } from '../docs/engine/index.js';
import { barlineThickness } from '../docs/engine/barlines.js';
import { CLEF_GLYPHS } from '../docs/vendor/clef-glyphs.js';
import { DEFAULT_TEMPLATES, addTemplate, normalizeLibrary } from '../docs/library.js';
import { createSettingsHistory } from '../docs/settings-history.js';
import { createResetBaseline } from '../docs/settings-baseline.js';
const types = page => page.systems.flatMap(system => system.blocks.flatMap(block => block.staves.map(staff => staff.clef)));
const near = (a, b) => assert.ok(Math.abs(a - b) < 1e-5, `${a} differs from ${b}`);

test('new barlines follow staff thickness while legacy absolute widths retain their printed result', () => {
  for (const thickness of [.05, .12, .27, .5]) {
    const s = normalizeSettings({ thickness, barlines: { enabled: true } });
    assert.equal(s.barlines.thicknessMode, 'staff'); assert.equal(barlineThickness(s), thickness);
    assert.ok(createDocument(s).pages[0].scene.filter(line => line.role === 'barline').every(line => line.strokeWidth === thickness));
    assert.match(encodeReference(s), /^P6-.*-V4\.S\.A\.N$/);
    assert.equal(decodeReference(encodeReference(s)).barlines.thicknessMode, 'staff');
  }
  const old = decodeReference('P5-A4-P-I20-T12-N9-G3-E22-V4.S.16.D');
  assert.equal(old.barlines.thicknessMode, 'custom'); assert.equal(barlineThickness({ ...old, thickness: .3 }), .16);
  assert.equal(encodeReference(old), 'P5-A4-P-I20-T12-N9-G3-E22-V4.S.16.D');
  assert.equal(normalizeSettings({ barlines: { enabled: true, thickness: .25 } }).barlines.thicknessMode, 'custom');
});

test('clefs are opt-in, have bounded independent patterns and default templates remain clean', () => {
  for (const template of DEFAULT_TEMPLATES) assert.equal(createDocument(template.settings).pages[0].scene.filter(e => e.kind === 'path').length, 0);
  const a = normalizeSettings(DEFAULTS), b = normalizeSettings(DEFAULTS); a.clefs.pattern.push('bass'); assert.deepEqual(b.clefs.pattern, []);
  const invalid = normalizeSettings({ clefs: { enabled: 'true', mode: 'other', type: 'invalid', pattern: ['bass', '<script>', null] } });
  assert.deepEqual(invalid.clefs, { enabled: false, type: 'treble', mode: 'uniform', pattern: ['bass'] });
  const big = normalizeSettings({ clefs: { pattern: Array(100).fill('bass') }, mode: 'blocks', blocks: [{ clefs: Array(100).fill('tenor') }] });
  assert.equal(big.clefs.pattern.length, 64); assert.equal(big.blocks[0].clefs.length, 32);
  assert.deepEqual(normalizeSettings({ clefs: { pattern: Array(4) } }).clefs.pattern, []);
});

test('treble, treble, bass repeats within each group, including partial groups; ungrouped positions address the page', () => {
  const clefs = { enabled: true, mode: 'pattern', type: 'treble', pattern: [null, null, 'bass'] };
  assert.deepEqual(types(createDocument({ count: 8, group: 3, clefs }).pages[0]), ['treble','treble','bass','treble','treble','bass','treble','treble']);
  assert.deepEqual(types(createDocument({ count: 8, group: 0, clefs }).pages[0]), ['treble','treble','bass','treble','treble','treble','treble','treble']);
  const none = createDocument({ count: 3, clefs: { ...clefs, pattern: ['none', 'alto', 'tenor'] } }).pages[0];
  assert.deepEqual(types(none), ['none', 'alto', 'tenor']); assert.equal(none.scene.filter(e => e.kind === 'path').length, 2);
});

test('block-specific clefs repeat with systems and travel with reordered blocks, independently of their labels', () => {
  const s = normalizeSettings({ mode: 'blocks', systems: 2, clefs: { enabled: true, mode: 'pattern' }, blocks: [
    { label: 'Veus', count: 4, inside: 12, after: 14, clefs: [null,null,null,'bass'] },
    { label: 'Piano', count: 2, inside: 6, after: 14, clefs: [null,'bass'] },
  ] });
  assert.deepEqual(types(createDocument(s).pages[0]), Array(2).fill(['treble','treble','treble','bass','treble','bass']).flat());
  s.blocks.reverse(); s.blocks[0].label = 'Changed';
  assert.deepEqual(types(createDocument(s).pages[0]), Array(2).fill(['treble','bass','treble','treble','treble','bass']).flat());
});

test('official Bravura outlines retain provenance and physical bounds from its metadata', async () => {
  const source = JSON.parse(await readFile(new URL('../tools/vendor/bravura-source.json', import.meta.url)));
  const font = await readFile(new URL('../tools/vendor/Bravura.otf', import.meta.url));
  assert.equal(createHash('sha256').update(font).digest('hex'), source.fontSha256);
  const metadata = JSON.parse(await readFile(new URL('../tools/vendor/bravura_metadata.json', import.meta.url)));
  for (const [name, glyph] of Object.entries(CLEF_GLYPHS)) {
    near(glyph.bounds.left, metadata.glyphBBoxes[name].bBoxSW[0]); near(glyph.bounds.right, metadata.glyphBBoxes[name].bBoxNE[0]);
    near(glyph.bounds.top, -metadata.glyphBBoxes[name].bBoxNE[1]); near(glyph.bounds.bottom, -metadata.glyphBBoxes[name].bBoxSW[1]);
    assert.ok(glyph.commands.some(([op]) => op === 'C')); assert.ok(glyph.commands.every(([op, ...values]) => ['M','L','C','Z'].includes(op) && values.every(Number.isFinite)));
  }
  assert.match(await readFile(new URL('../docs/vendor/bravura-OFL.txt', import.meta.url), 'utf8'), /SIL OPEN FONT LICENSE/);
});

test('all clefs remain inside physical margins and barlines share the writing area after the widest clef', () => {
  for (const paper of ['A4','A3','LETTER']) for (const orientation of ['portrait','landscape']) for (const spacing of [1,2,4]) for (const type of ['treble','bass','alto','tenor']) {
    const s = { paper, orientation, lineSpacing: spacing, count: 4, topSpace: 10, marginLeft: 11, marginRight: 17, marginTop: 12, marginBottom: 8,
      clefs: { enabled: true, type }, barlines: { enabled: true, connect: 'none' } };
    const doc = createDocument(s), page = doc.pages[0]; assert.ok(doc.valid);
    const paths = page.scene.filter(e => e.kind === 'path'); assert.equal(paths.length, 4);
    for (const path of paths) {
      assert.ok(path.bounds.left >= 11); assert.ok(path.bounds.right < page.layout.musicLeft);
      assert.ok(path.bounds.top >= 22 - 1e-5); assert.ok(path.bounds.bottom <= page.frame.height - 8 + 1e-5);
      const line = page.scene.find(line => line.role === 'barline' && line.ownerId === path.ownerId); assert.ok(line.x1 > path.bounds.right);
    }
    const expected = page.layout.musicLeft + (page.layout.right - page.layout.musicLeft) / 4;
    near(page.scene.find(line => line.role === 'barline').x1, expected);
    assert.ok(renderPrintDocument(doc).includes(renderSvgPage(page)));
  }
});

test('filled SVG and PDF paths use the same curves, coordinates and anchors without requiring a music font at runtime', () => {
  const doc = createDocument({ count: 4, clefs: { enabled: true, mode: 'pattern', pattern: ['treble','bass','alto','tenor'] } }), page = doc.pages[0];
  const svg = renderSvgPage(page), pdf = new TextDecoder().decode(createPdfDocument(doc));
  const svgPaths = [...svg.matchAll(/<path d="([^"]+)"/g)];
  const paths = page.scene.filter(e => e.kind === 'path');
  paths.forEach((path, index) => {
    const commands = [...svgPaths[index][1].matchAll(/([MLCZ])([^MLCZ]*)/g)].map(match => [match[1], ...(match[2].trim() ? match[2].trim().split(/\s+/).map(Number) : [])]);
    assert.equal(commands.length, path.commands.length);
    commands.forEach(([op,...values], i) => { assert.equal(op,path.commands[i][0]); values.forEach((value,j)=>near(value,path.commands[i][j+1])); });
    const staff = page.systems.flatMap(system=>system.blocks.flatMap(block=>block.staves)).find(staff=>staff.id===path.ownerId);
    const [glyph, anchor] = {treble:['gClef',3],bass:['fClef',1],alto:['cClef',2],tenor:['cClef',1]}[staff.clef];
    near(path.bounds.top,staff.lines[anchor]+CLEF_GLYPHS[glyph].bounds.top*2);
  });
  assert.equal((svg.match(/<path /g) || []).length, 4); assert.doesNotMatch(svg, /font-family=/); assert.doesNotMatch(pdf, /\/FontFile/);
  const actual = [...pdf.matchAll(/^([\d. -]+) ([mlc])$/gm)].filter(match => !match[0].includes(' l S'));
  const expected = page.scene.filter(e => e.kind === 'path').flatMap(path => path.commands.filter(([op]) => op !== 'Z'));
  // Staff commands contain a complete move/line/stroke on one line; only glyphs match this form.
  assert.equal(actual.length, expected.length);
  expected.forEach(([op,...values], i) => {
    assert.equal(actual[i][2], op.toLowerCase());
    const points = actual[i][1].trim().split(/\s+/).map(Number);
    values.forEach((value, n) => near(points[n] * 25.4 / 72, n % 2 ? page.frame.height - value : value));
  });
  const invalid = createDocument({ count: 1, clefs: { enabled: true } }); invalid.pages[0].scene.find(e => e.kind === 'path').commands.push(['X',0,0]);
  assert.throws(() => createPdfDocument(invalid), /unsupportedPathCommand/);
  assert.throws(() => renderSvgPage(invalid.pages[0]), /unsupportedPathCommand/);
});

test('clef collisions invalidate crowded layouts and explicit fit creates enough room inside blocks', () => {
  const s = { mode: 'blocks', systems: 1, blocks: [{ count: 4, inside: 1 }], clefs: { enabled: true } };
  assert.equal(createLayout(s).valid, false); assert.throws(() => createPdfDocument(createDocument(s)), /layoutInvalid/);
  const fitted = fitSettings(s); assert.ok(createLayout(fitted).valid); assert.ok(fitted.blocks[0].inside >= 6.5);
  const narrow = createDocument({ marginLeft:100, marginRight:100, lineSpacing:4, clefs:{enabled:true} }); assert.equal(narrow.valid, false);
});

test('P6 codes, shared links, templates, history, reset and page inheritance preserve clef patterns and width modes', () => {
  const variants = [
    { count:9, group:3, clefs:{enabled:true,mode:'pattern',pattern:[null,null,'bass']} },
    { mode:'blocks', systems:2, blocks:[{label:'Veus',count:4,clefs:[null,null,null,'bass']},{label:'Piano',count:2,clefs:[null,'bass']}], clefs:{enabled:true,mode:'pattern'} },
    { clefs:{enabled:true,type:'tenor'}, barlines:{enabled:true,thickness:.2} },
    { barlines:{enabled:true} },
  ];
  for (const value of variants) {
    const s = normalizeSettings({ ...value, marginLeft:10, topSpace:15 }); assert.match(encodeReference(s), /^P6-/);
    assert.deepEqual(decodeShareHash(encodeShareHash(s)), s);
    const history=createSettingsHistory(s), reset=createResetBaseline(s), library=addTemplate({}, {id:'clefs',name:'Claus',settings:s});
    history.record({...s,clefs:{...s.clefs,enabled:!s.clefs.enabled}}); assert.deepEqual(history.undo(),s);
    assert.deepEqual(reset.fromHash(encodeShareHash(s),DEFAULTS),s); assert.deepEqual(normalizeLibrary(JSON.parse(JSON.stringify(library))).saved[0].settings,s);
    const doc=createDocument({settings:s,pages:[{settings:{clefs:{type:'bass'}}},{}]}); assert.equal(doc.pages[1].settings.clefs.type,s.clefs.type);
    assert.deepEqual(createDocument(doc),doc);
  }
  for(const code of ['P6-A4-P-I20-T12-N9-G3-E22-KU.X','P6-A4-P-I20-T12-N9-G3-E22-KP.G.B.IIF','P6-A4-P-I20-T12-N9-G3-E22-KU.G.S.IIF','P5-A4-P-I20-T12-N9-G3-E22-V4.S.A.N']) assert.throws(()=>decodeReference(code),/invalidRef/);
  const extensive = normalizeSettings({mode:'blocks',blocks:Array.from({length:24},()=>({count:32,clefs:Array(32).fill('tenor')})),clefs:{enabled:true,mode:'pattern'}});
  assert.ok(encodeReference(extensive).length>600); assert.ok(encodeReference(extensive).length<1600);
  assert.deepEqual(decodeShareHash(encodeShareHash(extensive)),extensive);
});
