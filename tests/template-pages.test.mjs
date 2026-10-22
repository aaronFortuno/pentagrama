import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { LANGUAGES, translate } from '../docs/i18n.js';
import { DEFAULT_TEMPLATES, suggestedTemplateSettings } from '../docs/library.js';
import { decodeShareHash, createLayout, renderSheet } from '../docs/layout.js';
import { PRINTED_FIELD_LABELS } from '../docs/engine/page-text.js';
import { TEMPLATE_GUIDES, templatePath, templateEditorURL, templatePreviewPath, renderTemplatePreview } from '../tools/build-template-pages.mjs';
import { RELEASE } from '../tools/site-data.mjs';

const root = new URL('../docs/', import.meta.url), site = 'https://pentagrama.page/';

test('template pages have real localized HTML, reciprocal alternates and working links before JavaScript', async () => {
  for (const locale of Object.keys(LANGUAGES)) for (const guide of [undefined, ...TEMPLATE_GUIDES]) {
    const path = templatePath(locale, guide), html = await readFile(new URL(`${path}index.html`, root), 'utf8');
    assert.ok(html.includes(`<html lang="${locale}">`));
    assert.ok(html.includes(`<link rel="canonical" href="${site}${path}">`));
    assert.ok(html.includes(`<h1>${translate(locale, guide ? `${guide.prefix}Title` : 'catalogTitle')}</h1>`));
    assert.ok(!html.includes('undefined')); assert.ok(!html.includes('<script>'));
    for (const code of Object.keys(LANGUAGES)) assert.ok(html.includes(`hreflang="${code}" href="${site}${templatePath(code, guide)}"`));
    const base = new URL(guide ? '../../../' : '../../', new URL(path, root));
    for (const [, href] of html.matchAll(/(?:src|href)="(\.\/[^"]+)"/g)) {
      const resolved = new URL(href.replaceAll('&amp;', '&'), base); resolved.hash = ''; resolved.search = '';
      assert.ok(resolved.href.startsWith(root.href));
      await access(resolved.pathname.endsWith('/') ? new URL('index.html', resolved) : resolved);
    }
  }
});

test('all catalogue previews and editor links reuse the sidebar presets and printed language exactly', async () => {
  for (const template of DEFAULT_TEMPLATES) {
    assert.ok(createLayout(template.settings).valid);
    for (const locale of Object.keys(LANGUAGES)) {
      const expected = suggestedTemplateSettings(template, (key, values) => translate(locale, key, values), locale);
      const previewPath = templatePreviewPath(locale, template), svg = await readFile(new URL(previewPath, root), 'utf8');
      assert.equal(svg, renderTemplatePreview(template, locale));
      assert.equal(svg.replace(/<style>[\s\S]*?<\/style>/, ''), renderSheet({ ...expected, source: false, reference: false }));
      if (expected.pageText.nameDate) {
        assert.equal(expected.pageText.language, locale);
        assert.ok(svg.includes('data:font/woff2;base64,'));
        for (const label of PRINTED_FIELD_LABELS[locale]) assert.ok(svg.includes(`>${label}:</text>`));
      } else assert.ok(!svg.includes('<text'));
      const url = templateEditorURL(locale, template, 'https://example.org/repository/');
      assert.equal(url.pathname, `/repository/${locale}/`);
      assert.deepEqual(decodeShareHash(url.hash.slice(1)), expected);
      const catalogue = await readFile(new URL(`${locale}/templates/index.html`, root), 'utf8');
      assert.ok(catalogue.includes(previewPath));
      const card = [...catalogue.matchAll(/<article class="guide-card">[\s\S]*?<\/article>/g)].map(match => match[0]).find(card => card.includes(`id="template-${template.id}"`));
      assert.ok(card);
      assert.equal((card.match(/href="([^"]+)"/g) || []).length, 2);
      assert.equal((card.matchAll(/href="([^"]+)"/g).toArray()).every(match => match[1] === `./${locale}/${url.hash}`), true);
      assert.ok(card.includes('class="guide-card-image"'));
      assert.ok(card.includes(translate(locale, 'openTemplate')));
    }
  }
});

test('every guide shares localized branding and footer dialogs with the editor without duplicate landmarks or IDs', async () => {
  for (const locale of Object.keys(LANGUAGES)) {
    const editor = await readFile(new URL(`${locale}/index.html`, root), 'utf8');
    for (const guide of [undefined, ...TEMPLATE_GUIDES]) {
      const html = await readFile(new URL(`${templatePath(locale, guide)}index.html`, root), 'utf8');
      assert.equal((html.match(/<h1[ >]/g) || []).length, 1);
      const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
      assert.equal(ids.length, new Set(ids).size);
      assert.ok(html.includes('<header class="site-header">'));
      assert.ok(html.includes('<footer class="site-footer">'));
      assert.ok(html.includes(`href="./${locale}/" aria-label="Pentagrama"`));
      assert.equal(html.match(/<svg class="brand-mark"[\s\S]*?<\/svg>/)[0], editor.match(/<svg class="brand-mark"[\s\S]*?<\/svg>/)[0]);
      assert.ok(html.includes(`id="version-button"`)); assert.ok(html.includes(`>${RELEASE.version}</button>`));
      for (const id of ['about', 'version', 'copy']) {
        const pattern = new RegExp(`<dialog id="${id}-dialog"[\\s\\S]*?<\\/dialog>`);
        assert.equal(html.match(pattern)[0], editor.match(pattern)[0]);
      }
      for (const code of Object.keys(LANGUAGES)) {
        assert.ok(html.includes(`href="./${templatePath(code, guide)}" data-language="${code}"`));
      }
      assert.ok(!html.includes('guide-languages')); assert.ok(!html.includes('guide-privacy'));
    }
  }
});

test('template content retains vocal spacing and the six orchestral groups with a printable layout', () => {
  const choir = suggestedTemplateSettings(DEFAULT_TEMPLATES.find(item => item.id === 'choir-piano'), key => translate('ca', key));
  assert.equal(choir.systems, 2); assert.equal(choir.blocks[0].count, 4); assert.equal(choir.blocks[1].count, 2);
  assert.ok(choir.blocks[0].inside > choir.blocks[1].inside); assert.equal(createLayout(choir).count, 12);
  const orchestra = DEFAULT_TEMPLATES.find(item => item.id === 'orchestra');
  assert.equal(orchestra.settings.paper, 'A3'); assert.equal(orchestra.settings.blocks.length, 6);
  assert.equal(createLayout(orchestra.settings).count, 23);
  const layout = createLayout(orchestra.settings);
  assert.equal(layout.lineSpacing, 2);
  assert.ok(layout.needed / layout.available > .98);
  assert.ok(layout.staves[0][0] - layout.top < 3);
  assert.ok(layout.bottom - layout.staves.at(-1)[4] < 3);
});

test('educational presets have name and date, while writing space keeps five uncrowded staves', async () => {
  const large = DEFAULT_TEMPLATES.find(item => item.id === 'large'), notes = DEFAULT_TEMPLATES.find(item => item.id === 'annotations');
  assert.equal(large.settings.pageText.nameDate, true);
  assert.equal(large.settings.lineSpacing, 3); assert.equal(createLayout(large.settings).count, 6);
  const layout = createLayout(notes.settings);
  assert.equal(layout.pageText.nameDate, true); assert.equal(layout.notes.percent, 35);
  assert.equal(layout.notes.pattern, 'dots'); assert.equal(layout.notes.spacing, 8);
  assert.equal(layout.count, 9); assert.equal(layout.visibleCount, 5); assert.ok(layout.valid);
  assert.ok(layout.notesArea.top - layout.staves.at(-1)[4] >= layout.notesGap);
  assert.ok(!layout.source && !layout.reference && !layout.clefs.enabled && !layout.barlines.enabled);
  for (const locale of Object.keys(LANGUAGES)) {
    const html = await readFile(new URL(`${locale}/templates/index.html`, root), 'utf8');
    const card = html.match(/<article class="guide-card">[\s\S]*?id="template-annotations"[\s\S]*?<\/article>/)[0];
    assert.ok(card.includes(translate(locale, 'staffCount', { n: 5 })));
    const guide = TEMPLATE_GUIDES.find(item => item.id === notes.id);
    const detail = await readFile(new URL(`${templatePath(locale, guide)}index.html`, root), 'utf8');
    assert.ok(detail.includes(templateEditorURL(locale, notes, site).hash));
    assert.ok(detail.includes(translate(locale, 'guideWorksheet')));
    assert.ok(!detail.includes(translate(locale, 'guideBlank')));
  }
});
