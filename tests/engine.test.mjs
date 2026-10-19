import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import * as legacy from './fixtures/v1-layout.mjs';
import { createPdf as legacyPdf } from './fixtures/v1-pdf.mjs';
import * as current from '../docs/layout.js';
import { createPdf } from '../docs/pdf.js';
import { createDocument, normalizeDocument, renderSvgPage, renderPrintDocument, createPdfDocument } from '../docs/engine/index.js';
import { DEFAULT_TEMPLATES } from '../docs/library.js';
import { parseVersion, compareVersions } from '../tools/release-version.mjs';
import { RELEASE } from '../tools/site-data.mjs';
import { buildPreview } from '../tools/build-preview.mjs';

test('the modular engine exactly matches frozen 1.17.2 settings, geometry, references, SVG and PDF', () => {
  const variants = [];
  for (const template of DEFAULT_TEMPLATES) for (const paper of ['A3', 'A4', 'LETTER']) for (const orientation of ['portrait', 'landscape']) {
    for (const options of [{}, { topSpace: 30, reference: true, source: true }, { marginLeft: 11, marginRight: 29, marginTop: 17, marginBottom: 8 }]) variants.push({ ...template.settings, paper, orientation, ...options });
  }
  let seed = 172;
  const random = max => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed % max; };
  for (let i = 0; i < 150; i++) variants.push({ ...DEFAULT_TEMPLATES[random(DEFAULT_TEMPLATES.length)].settings,
    count: random(66), group: random(12), topSpace: random(101), lineSpacing: 1 + random(31) / 10,
    thickness: .05 + random(46) / 100, marginLeft: random(70), marginRight: random(70), marginTop: random(70), marginBottom: random(70),
    systems: 1 + random(4), reference: Boolean(random(2)), source: Boolean(random(2)) });
  for (const value of variants) {
    assert.deepEqual(current.normalizeSettings(value), legacy.normalizeSettings(value));
    assert.deepEqual(current.createLayout(value), legacy.createLayout(value));
    assert.equal(current.encodeReference(value), legacy.encodeReference(value));
    assert.equal(current.encodeShareHash(value), legacy.encodeShareHash(value));
    assert.deepEqual(current.decodeShareHash(current.encodeShareHash(value)), legacy.decodeShareHash(legacy.encodeShareHash(value)));
    assert.deepEqual(current.fitSettings(value), legacy.fitSettings(value));
    assert.equal(current.renderSheet(value), legacy.renderSheet(value));
    assert.equal(renderSvgPage(createDocument(value).pages[0]), legacy.renderSheet(value));
    if (legacy.createLayout(value).valid) assert.deepEqual(createPdf(value), legacyPdf(value));
    else assert.throws(() => createPdf(value), /layoutInvalid/);
  }
});

test('semantic hierarchy represents ungrouped, partial and repeated groups without changing physical placement', () => {
  const blank = createDocument(current.DEFAULTS).pages[0];
  assert.equal(blank.systems.length, 9);
  const partial = createDocument({ ...current.DEFAULTS, count: 8, group: 3 }).pages[0];
  assert.deepEqual(partial.systems.map(system => system.blocks[0].staves.length), [3, 3, 2]);
  const choir = createDocument(DEFAULT_TEMPLATES.find(template => template.id === 'choir-piano').settings).pages[0];
  assert.equal(choir.systems.length, 2);
  assert.deepEqual(choir.systems.map(system => system.blocks.map(block => block.staves.length)), [[4, 2], [4, 2]]);
  const staves = choir.systems.flatMap(system => system.blocks.flatMap(block => block.staves));
  assert.deepEqual(staves.map(staff => staff.lines), choir.layout.staves);
  const ids = [...staves.map(staff => staff.id), ...choir.scene.map(element => element.id)];
  assert.equal(new Set(ids).size, ids.length);
  for (const line of choir.scene.filter(element => element.kind === 'line')) assert.ok(staves.some(staff => staff.id === line.ownerId));
});

test('document normalization is independent, idempotent and preserves explicit identities across layout changes', () => {
  const value = { schemaVersion: 2, pages: [{ id: 'front', settings: DEFAULT_TEMPLATES.find(template => template.id === 'choir-piano').settings,
    identities: { systems: [{ id: 'opening', blocks: [{ id: 'voices', staves: [{ id: 'soprano' }, { id: 'alto' }, { id: 'tenor' }, { id: 'bass' }] }, { id: 'piano' }] }] } }] };
  const before = JSON.stringify(value), normalized = normalizeDocument(value);
  assert.deepEqual(normalizeDocument(normalized), normalized);
  const document = createDocument(value);
  const edited = structuredClone(value); edited.pages[0].settings.marginLeft = 12; edited.pages[0].settings.topSpace = 30;
  const next = createDocument(edited);
  assert.equal(next.pages[0].systems[0].blocks[0].staves[0].id, document.pages[0].systems[0].blocks[0].staves[0].id);
  assert.notEqual(next.pages[0].systems[0].bounds.top, document.pages[0].systems[0].bounds.top);
  assert.equal(JSON.stringify(value), before);
  assert.deepEqual(createDocument(document), document);
  normalized.pages[0].settings.blocks[0].label = 'changed';
  assert.equal(JSON.stringify(value), before);
});

test('explicit block identities travel with reordered blocks inside a system', () => {
  const settings = current.normalizeSettings({ mode: 'blocks', blocks: [{ label: 'Voices', count: 4, inside: 12, after: 14 }, { label: 'Piano', count: 2, inside: 6, after: 14 }] });
  const identities = { systems: [{ blocks: [{ id: 'voices' }, { id: 'piano' }] }] };
  const first = createDocument({ pages: [{ settings, identities }] }).pages[0];
  const reordered = createDocument({ pages: [{ settings: { ...settings, blocks: [...settings.blocks].reverse() }, identities: { systems: [{ blocks: [...identities.systems[0].blocks].reverse() }] } }] }).pages[0];
  assert.equal(first.systems[0].blocks[1].id, reordered.systems[0].blocks[0].id);
});

test('multiple pages inherit common settings with isolated first-page overrides and shared font resources', () => {
  const value = { schemaVersion: 2, settings: { ...current.DEFAULTS, source: true, reference: true }, pages: [
    { id: 'front', settings: { topSpace: 30 } }, { id: 'back' }, { id: 'a3', settings: { paper: 'A3', orientation: 'landscape' } },
  ] };
  const document = createDocument(value);
  assert.ok(document.valid); assert.equal(document.pages[0].layout.top, 51); assert.equal(document.pages[1].layout.top, 21);
  assert.equal(document.pages[2].frame.width, 420);
  const pdf = new TextDecoder().decode(createPdfDocument(document));
  assert.equal((pdf.match(/\/Type \/Page /g) || []).length, 3);
  assert.ok(pdf.includes('/Kids [3 0 R 5 0 R 7 0 R] /Count 3'));
  assert.equal((pdf.match(/\/FontFile2 /g) || []).length, 1);
  const xref = Number(/startxref\n(\d+)/.exec(pdf)[1]); assert.equal(pdf.slice(xref, xref + 4), 'xref');
  const print = renderPrintDocument(document);
  assert.equal((print.match(/class="print-page"/g) || []).length, 3);
  assert.ok(print.includes('@page pentagrama-3{size:420mm 297mm;margin:0}'));
  for (const page of document.pages) assert.ok(print.includes(renderSvgPage(page)));
  document.pages[0].settings.blocks.push({ count: 2 }); assert.deepEqual(document.pages[1].settings.blocks, []);
});

test('invalid documents and identities fail clearly and an overflowing page prevents partial export', () => {
  for (const value of [{ schemaVersion: 3 }, { pages: [] }, { pages: null }, { pages: Array.from({ length: 33 }, () => ({})) }, { pages: [null] }, { pages: [{ id: 'same' }, { id: 'same' }] }, { pages: [{ id: '<script>' }] },
    { pages: [{ settings: { count: 4, group: 2 }, identities: { systems: [{ id: 'same' }, { id: 'same' }] } }] }]) assert.throws(() => createDocument(value));
  const document = createDocument({ pages: [{ id: 'valid' }, { id: 'invalid', settings: { count: 64, lineSpacing: 4 } }] });
  assert.equal(document.valid, false); assert.equal(document.pages[0].valid, true);
  assert.throws(() => renderPrintDocument(document), /layoutInvalid/); assert.throws(() => createPdfDocument(document), /layoutInvalid/);
  const malformed = createDocument(current.DEFAULTS); malformed.pages[0].scene.push({ kind: 'unsupported' });
  assert.throws(() => renderSvgPage(malformed.pages[0]), /unsupportedSceneElement/);
  assert.throws(() => createPdfDocument(malformed), /unsupportedSceneElement/);
});

test('prerelease versions sort before their final release and preserve the complete footer history', () => {
  for (const value of ['2.0.0-alpha.1', '2.0.0', '1.17.2']) assert.ok(parseVersion(value));
  for (const value of ['2.0', '2.0.0-alpha.01', '02.0.0', '2.0.0-']) assert.throws(() => parseVersion(value));
  assert.ok(compareVersions('2.0.0-alpha.2', '2.0.0-alpha.1') > 0);
  assert.ok(compareVersions('2.0.0-alpha.10', '2.0.0-alpha.2') > 0);
  assert.ok(compareVersions('2.0.0', '2.0.0-alpha.1') > 0);
  assert.ok(compareVersions('2.0.0-alpha.1', '1.17.2') > 0);
});

test('nested browser modules have synchronized cache versions and no missing local imports', async () => {
  const root = new URL('../docs/engine/', import.meta.url);
  for (const file of await readdir(root)) {
    if (!file.endsWith('.js')) continue;
    const source = await readFile(new URL(file, root), 'utf8');
    for (const [, path, version] of source.matchAll(/from ['"](\.{1,2}\/[^'"]+\.js)(?:\?v=([^'"]+))?['"]/g)) {
      assert.equal(version, RELEASE.version, `${file}: ${path}`);
      await readFile(new URL(path, root));
    }
  }
});

test('the publishable preview retains local resources and licenses without production hosting or tracking metadata', async () => {
  const target = await buildPreview();
  const fs = await import('node:fs/promises'), path = await import('node:path');
  const visit = async directory => {
    const entries = await fs.readdir(directory, { withFileTypes: true });
    return (await Promise.all(entries.map(entry => entry.isDirectory() ? visit(path.join(directory, entry.name)) : path.join(directory, entry.name)))).flat();
  };
  const files = await visit(target), htmlFiles = files.filter(file => file.endsWith('.html'));
  assert.equal(htmlFiles.length, 41);
  assert.ok(!files.includes(path.join(target, 'CNAME')));
  assert.ok(!files.includes(path.join(target, 'sitemap.xml')));
  assert.equal(await fs.readFile(path.join(target, 'robots.txt'), 'utf8'), 'User-agent: *\nDisallow: /\n');
  assert.match(await fs.readFile(path.join(target, 'LICENSE'), 'utf8'), /GNU GENERAL PUBLIC LICENSE/);
  for (const file of htmlFiles) {
    const html = await fs.readFile(file, 'utf8');
    assert.match(html, /<meta name="robots" content="noindex, nofollow">/);
    assert.doesNotMatch(html, /name="umami-website-id"/);
    assert.match(html, /blob\/codex\/v2-modular-engine\/CHANGELOG\.md/);
    const base = path.resolve(path.dirname(file), /<base href="([^"]+)"/.exec(html)?.[1] || '.');
    for (const [, asset] of html.matchAll(/(?:src|href)="((?:\.\.?\/)[^"?#]+\.(?:css|js|svg|png|woff2))(?:\?[^"#]*)?"/g)) await fs.access(path.resolve(base, asset));
  }
  const marker = JSON.parse(await fs.readFile(path.join(target, '.pentagrama-preview.json'), 'utf8'));
  assert.equal(marker.version, RELEASE.version); assert.equal(marker.branch, 'codex/v2-modular-engine');
  await fs.access(path.join(target, 'engine/document.js'));
});
