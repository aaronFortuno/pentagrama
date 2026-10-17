import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { LANGUAGES, translate } from '../docs/i18n.js';
import { RELEASE, SUPPORT, releaseDate } from './site-data.mjs';
import { lightningQr } from './lightning.mjs';

const root = new URL('../', import.meta.url);
const supportQr = lightningQr(SUPPORT.payload).trim();
export const escapeHTML = text => String(text).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]);

export function renderLocalizedPage(source, locale, homepage, { automatic = false } = {}) {
  if (!Object.hasOwn(LANGUAGES, locale)) throw new Error('Unknown language');
  const t = key => {
    const text = translate(locale, key, { version: RELEASE.version });
    if (text === key) throw new Error(`Missing translation: ${key}`);
    return escapeHTML(text);
  };
  const site = new URL(homepage.endsWith('/') ? homepage : `${homepage}/`);
  const url = automatic ? site : new URL(`${locale}/`, site);
  const alternates = Object.keys(LANGUAGES).map(code => `<link rel="alternate" hreflang="${code}" href="${escapeHTML(new URL(`${code}/`, site).href)}">`);
  alternates.push(`<link rel="alternate" hreflang="x-default" href="${escapeHTML(site.href)}">`);
  const head = `<base href="${automatic ? './' : '../'}">\n  <link rel="canonical" href="${escapeHTML(url.href)}">\n  ${alternates.join('\n  ')}`;
  const links = Object.entries(LANGUAGES).map(([code, label]) => `<a href="./${code}/" data-language="${code}" lang="${code}" hreflang="${code}" role="menuitemradio" aria-checked="${code === locale}" tabindex="-1"><span>${escapeHTML(label)}</span><span data-icon="check"></span></a>`).join('');
  let html = source.replace('<html lang="ca">', `<html lang="${locale}">`)
    .replace('<!-- localized-head -->', head).replace('<!-- language-links -->', links)
    .replaceAll('<!-- app-version -->', RELEASE.version)
    .replace('<!-- release-date -->', `<time id="release-date" datetime="${RELEASE.date}">${escapeHTML(releaseDate(locale))}</time>`)
    .replace('<!-- release-changes -->', RELEASE.changes.map(key => `<li data-i18n="${key}">${t(key)}</li>`).join(''))
    .replaceAll('{{lightning-address}}', escapeHTML(SUPPORT.address)).replaceAll('{{lightning-link}}', escapeHTML(SUPPORT.href))
    .replace('<!-- lightning-qr -->', supportQr)
    .replace(/<title>[^<]*<\/title>/, `<title>${t('title')}</title>`)
    .replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${t('seoDescription')}">`);
  // The controlled template only marks text-only elements for replacement.
  html = html.replace(/<([a-z][\w-]*)(\s[^>]*\bdata-i18n="([^"]+)"[^>]*)>[\s\S]*?<\/\1>/g,
    (_, tag, attributes, key) => `<${tag}${attributes}>${t(key)}</${tag}>`);
  html = html.replace(/<[a-z][^>]*>/g, tag => {
    for (const [data, attribute] of [['aria', 'aria-label'], ['title', 'title'], ['placeholder', 'placeholder']]) {
      const key = new RegExp(`\\bdata-${data}="([^"]+)"`).exec(tag)?.[1];
      if (!key) continue;
      const value = `${attribute}="${t(key)}"`, current = new RegExp(` ${attribute}="[^"]*"`);
      tag = current.test(tag) ? tag.replace(current, ` ${value}`) : tag.replace(/>$/, ` ${value}>`);
    }
    return tag;
  });
  return html.replace('<!doctype html>', '<!doctype html>\n<!-- Generated from src/index.html and docs/i18n.js by tools/build-locales.mjs. -->');
}

export async function buildLocalizedPages() {
  const source = await readFile(new URL('src/index.html', root), 'utf8');
  const { homepage } = JSON.parse(await readFile(new URL('package.json', root), 'utf8'));
  await mkdir(new URL('docs/assets/', root), { recursive: true });
  await writeFile(new URL('docs/assets/lightning-qr.svg', root), lightningQr(SUPPORT.payload));
  await writeFile(new URL('docs/release.js', root), `// Generated from package.json and src/release.json.\nexport const RELEASE = Object.freeze(${JSON.stringify(RELEASE)});\n`);
  await writeFile(new URL('docs/index.html', root), renderLocalizedPage(source, 'ca', homepage, { automatic: true }));
  for (const code of Object.keys(LANGUAGES)) {
    const directory = new URL(`docs/${code}/`, root);
    await mkdir(directory, { recursive: true });
    await writeFile(new URL('index.html', directory), renderLocalizedPage(source, code, homepage));
  }
  const site = new URL(homepage.endsWith('/') ? homepage : `${homepage}/`);
  const urls = [site, ...Object.keys(LANGUAGES).map(code => new URL(`${code}/`, site))];
  await writeFile(new URL('docs/sitemap.xml', root), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map(url => `  <url><loc>${escapeHTML(url.href)}</loc></url>`).join('\n')}\n</urlset>\n`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await buildLocalizedPages();
  console.log(`Generated ${Object.keys(LANGUAGES).length} language pages and automatic home`);
}
