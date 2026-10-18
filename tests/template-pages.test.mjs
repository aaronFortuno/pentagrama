import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { LANGUAGES, translate } from '../docs/i18n.js';
import { DEFAULT_TEMPLATES, suggestedTemplateSettings } from '../docs/library.js';
import { decodeShareHash, createLayout, renderSheet } from '../docs/layout.js';
import { TEMPLATE_GUIDES, templatePath, templateEditorURL } from '../tools/build-template-pages.mjs';
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

test('all seven catalogue previews and editor links reuse the sidebar presets exactly', async () => {
  for (const template of DEFAULT_TEMPLATES) {
    const svg = await readFile(new URL(`assets/templates/${template.id}.svg`, root), 'utf8');
    assert.equal(svg, renderSheet({ ...template.settings, source: false, reference: false }));
    assert.ok(!svg.includes('<text')); assert.ok(createLayout(template.settings).valid);
    for (const locale of Object.keys(LANGUAGES)) {
      const expected = suggestedTemplateSettings(template, (key, values) => translate(locale, key, values));
      const url = templateEditorURL(locale, template, 'https://example.org/repository/');
      assert.equal(url.pathname, `/repository/${locale}/`);
      assert.deepEqual(decodeShareHash(url.hash.slice(1)), expected);
      const catalogue = await readFile(new URL(`${locale}/templates/index.html`, root), 'utf8');
      assert.ok(catalogue.includes(`assets/templates/${template.id}.svg`));
      if (!TEMPLATE_GUIDES.some(guide => guide.id === template.id)) assert.ok(catalogue.includes(`href="./${locale}/${url.hash}"`));
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
});
