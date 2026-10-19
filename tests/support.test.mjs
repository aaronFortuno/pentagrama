import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { encodeLnurl, lightningDetails, lightningQr } from '../tools/lightning.mjs';
import { RELEASE, SUPPORT, releaseDate } from '../tools/site-data.mjs';
import { LANGUAGES, translate } from '../docs/i18n.js';
import { RELEASE as publishedRelease, RELEASE_DATES } from '../docs/release.js';
import { compareVersions } from '../tools/release-version.mjs';

test('LNURL encoding matches the published LUD-01 reference vector exactly', () => {
  const url = 'https://service.com/api?q=3fc3645b439ce8e7f2553a69e5267081d96dcd340693afabe04be7b0ccd178df';
  assert.equal(encodeLnurl(url), 'LNURL1DP68GURN8GHJ7UM9WFMXJCM99E3K7MF0V9CXJ0M385EKVCENXC6R2C35XVUKXEFCV5MKVV34X5EKZD3EV56NYD3HXQURZEPEXEJXXEPNXSCRVWFNV9NXZCN9XQ6XYEFHVGCXXCMYXYMNSERXFQ5FNS');
});

test('the visible address, wallet link and local QR share one source with a four-module quiet zone', async () => {
  assert.equal(SUPPORT.address, 'aptswim903@walletofsatoshi.com');
  assert.equal(SUPPORT.url, 'https://walletofsatoshi.com/.well-known/lnurlp/aptswim903');
  assert.equal(SUPPORT.href, `lightning:${SUPPORT.payload}`);
  for (const invalid of ['http://example.org', 'name@example.org/else', 'name@host', 'name@host.org?other']) assert.throws(() => lightningDetails(invalid));
  const svg = await readFile(new URL('../docs/assets/lightning-qr.svg', import.meta.url), 'utf8');
  assert.equal(svg, lightningQr(SUPPORT.payload));
  const size = Number(/viewBox="0 0 (\d+)/.exec(svg)[1]);
  for (const [, x, y] of svg.matchAll(/M(\d+) (\d+)h1v1h-1z/g)) {
    assert.ok(Number(x) >= 4 && Number(y) >= 4 && Number(x) < size - 4 && Number(y) < size - 4);
  }
  assert.ok(!svg.includes('script')); assert.ok(!svg.includes('href='));
});

test('release version, date and summaries stay synchronized in every language before JavaScript', async () => {
  assert.deepEqual(publishedRelease, RELEASE);
  const root = new URL('../docs/', import.meta.url);
  for (const locale of Object.keys(LANGUAGES)) {
    const html = await readFile(new URL(`${locale}/index.html`, root), 'utf8');
    assert.ok(html.includes(`>${RELEASE.version}</button>`));
    assert.ok(html.includes(`<time id="release-date" datetime="${RELEASE.date}">${releaseDate(locale)}</time>`));
    for (const key of [...RELEASE.changes, ...(RELEASE.announcement || [])]) assert.notEqual(translate(locale, key), key);
    assert.ok(html.includes(`href="${SUPPORT.href}"`)); assert.ok(html.includes(`<span id="lightning-address">${SUPPORT.address}</span>`));
    assert.ok(html.includes(lightningQr(SUPPORT.payload).trim()));
    assert.ok(!html.includes('data-i18n="lightningHint"')); assert.ok(!html.includes('input id="lightning-address"'));
  }
});

test('footer history covers each top-level release separately, in order, with dated translated summaries', async () => {
  const entries = [RELEASE, ...RELEASE.history];
  const changelog = await readFile(new URL('../CHANGELOG.md', import.meta.url), 'utf8');
  const versions = [...changelog.matchAll(/^## (\d+\.\d+\.\d+(?:-[\w.-]+)?)/gm)].map(match => match[1]);
  assert.deepEqual(entries.map(entry => entry.version), versions);
  assert.equal(new Set(versions).size, versions.length);
  // The public 2.0.0 release consolidates its seven experimental versions.
  if (versions.includes('2.0.0')) {
    assert.equal(entries.some(entry => entry.version.startsWith('2.0.0-alpha.')), false);
    assert.deepEqual([...changelog.matchAll(/^### (2\.0\.0-alpha\.\d+)/gm)].map(match => match[1]),
      ['7', '6', '5', '4', '3', '2', '1'].map(number => `2.0.0-alpha.${number}`));
  }
  for (let index = 1; index < entries.length; index++) {
    assert.ok(compareVersions(entries[index - 1].version, entries[index].version) > 0);
    assert.ok(entries[index - 1].date >= entries[index].date);
  }
  for (const locale of Object.keys(LANGUAGES)) {
    const html = await readFile(new URL(`../docs/${locale}/index.html`, import.meta.url), 'utf8');
    assert.equal([...html.matchAll(/class="release-entry"/g)].length, entries.length);
    for (const entry of entries) {
      assert.equal(RELEASE_DATES[locale][entry.date], releaseDate(locale, entry.date));
      assert.ok(html.includes(`data-version="${entry.version}"`));
      assert.ok(html.includes(`datetime="${entry.date}">${releaseDate(locale, entry.date)}</time>`));
      for (const key of entry.changes) assert.notEqual(translate(locale, key), key);
    }
  }
});
