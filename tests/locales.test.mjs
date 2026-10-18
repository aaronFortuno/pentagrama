import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { LANGUAGES, translate } from '../docs/i18n.js';
import { languageFromURL, languageURL } from '../docs/language-routing.js';
import { renderLocalizedPage, escapeHTML } from '../tools/build-locales.mjs';
import { RELEASE } from '../tools/site-data.mjs';

const root = new URL('../', import.meta.url), site = 'https://pentagrama.page/';
const source = await readFile(new URL('src/index.html', root), 'utf8');
const codes = Object.keys(LANGUAGES);

test('every published language has translated HTML, a self canonical and reciprocal absolute alternates before JavaScript', async () => {
  for (const locale of codes) {
    const html = await readFile(new URL(`docs/${locale}/index.html`, root), 'utf8');
    assert.equal(html, renderLocalizedPage(source, locale, site));
    assert.ok(html.includes(`<html lang="${locale}">`)); assert.ok(html.includes('<base href="../">'));
    assert.ok(html.includes(`<link rel="canonical" href="${site}${locale}/">`));
    assert.ok(html.includes(`<title>${escapeHTML(translate(locale, 'title'))}</title>`));
    assert.ok(html.includes(`content="${escapeHTML(translate(locale, 'seoDescription'))}"`));
    for (const code of codes) {
      assert.ok(html.includes(`<link rel="alternate" hreflang="${code}" href="${site}${code}/">`));
      assert.ok(html.includes(`href="./${code}/" data-language="${code}"`));
    }
    assert.ok(html.includes(`<link rel="alternate" hreflang="x-default" href="${site}">`));
    for (const [, , key, text] of html.matchAll(/<([a-z][\w-]*)\s[^>]*\bdata-i18n="([^"]+)"[^>]*>([\s\S]*?)<\/\1>/g)) {
      assert.equal(text, escapeHTML(translate(locale, key, { version: RELEASE.version })), `${locale}: ${key}`);
    }
    assert.ok(!html.includes('class="clean-note"')); assert.ok(!html.includes('<!-- localized-head -->'));
  }
});

test('automatic home remains self canonical and sitemap lists home plus every real language URL', async () => {
  const html = await readFile(new URL('docs/index.html', root), 'utf8');
  assert.equal(html, renderLocalizedPage(source, 'ca', site, { automatic: true }));
  assert.ok(html.includes(`<link rel="canonical" href="${site}">`)); assert.ok(html.includes('<base href="./">'));
  const sitemap = await readFile(new URL('docs/sitemap.xml', root), 'utf8');
  const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => match[1]);
  assert.deepEqual(urls, [site, ...codes.map(code => `${site}${code}/`)]);
});

test('localized asset and language links resolve to files for a repository hosted under a subdirectory', async () => {
  const url = new URL('https://example.org/pentagrama/fr/');
  const html = renderLocalizedPage(source, 'fr', 'https://example.org/pentagrama/');
  const base = new URL('../', url);
  for (const [, href] of html.matchAll(/(?:src|href)="(\.\/[^"]+)"/g)) {
    const resolved = new URL(href, base), relative = resolved.pathname.slice('/pentagrama/'.length);
    assert.equal(resolved.origin, base.origin); assert.ok(resolved.pathname.startsWith('/pentagrama/'));
    await access(new URL(`docs/${relative}${resolved.pathname.endsWith('/') ? 'index.html' : ''}`, root));
  }
  assert.ok(html.includes('hreflang="fr" href="https://example.org/pentagrama/fr/"'));
});

test('explicit URLs win over browser preferences, and changing language preserves private fragments and query strings', () => {
  const base = new URL('https://example.org/pentagrama/');
  for (const locale of codes) {
    assert.equal(languageFromURL(`${base}${locale}/`, base), locale);
    assert.equal(languageFromURL(`${base}${locale}/index.html`, base), locale);
  }
  for (const path of ['', 'index.html', 'xx/', 'en/other/', '../en/']) assert.equal(languageFromURL(new URL(path, base), base), undefined);
  const changed = languageURL('de', `${base}fr/?utm_source=test#P3-layout~private-labels`, base);
  assert.equal(changed.href, `${base}de/?utm_source=test#P3-layout~private-labels`);
  assert.throws(() => languageURL('xx', base, base));
});
