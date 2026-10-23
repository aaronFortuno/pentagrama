import { readFileSync } from 'node:fs';

const components = Object.fromEntries(['header', 'footer'].map(name => [name, readFileSync(new URL(`../src/components/site-${name}.html`, import.meta.url), 'utf8').trim()]));

export function composeSiteShell(source) {
  for (const [name, html] of Object.entries(components)) source = source.replace(`<!-- site-${name} -->`, html);
  return source;
}

// Use the generator's localized chrome as the single source for identity,
// support, privacy and release history. Only navigation differs on guide pages.
export function guideChrome(html, locale, links, t) {
  if (!html) throw new Error(`Missing generator shell for ${locale}`);
  let header = html.match(/<header class="site-header">[\s\S]*?<\/header>/)[0];
  header = header.replace(/<button id="logo-note"[^>]*>([\s\S]*?)<\/button>/,
    `<a class="brand-note" href="./${locale}/" aria-label="Pentagrama">$1</a>`)
    .replace('href="./" aria-label="Pentagrama"', `href="./${locale}/" aria-label="Pentagrama"`)
    .replace(/<button id="melody-info"[\s\S]*?<\/button>/, '')
    .replace('<h1 id="page-title">', '<div class="site-tagline">').replace('</h1>', '</div>')
    .replace(/(<div id="language-menu"[^>]*>)[\s\S]*?(<\/div>)/, `$1${links}$2`);
  const footer = html.match(/<footer class="site-footer">[\s\S]*?<\/footer>/)[0]
    .replace(/<a id="template-catalog-link"[^>]*>[\s\S]*?<\/a>/,
      `<a class="template-catalog-link" href="./${locale}/">${t('guideBack')}</a>`);
  const dialogs = ['about', 'version', 'copy', 'backup'].map(id => html.match(new RegExp(`<dialog id="${id}-dialog"[\\s\\S]*?<\\/dialog>`))[0]).join('\n');
  return { header, footer, dialogs, favicon: html.match(/<link rel="icon"[^>]*>/)[0] };
}

