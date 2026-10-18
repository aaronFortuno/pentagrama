import { LANGUAGES } from './i18n.js?v=1.17.0';

// The module root also supports forks served below /repository/ on GitHub Pages.
export function languageFromURL(value, root) {
  const url = new URL(value, root), base = new URL(root);
  if (url.origin !== base.origin || !url.pathname.startsWith(base.pathname)) return;
  const path = url.pathname.slice(base.pathname.length);
  const match = /^([a-z]{2})\/(?:index\.html)?$/.exec(path);
  if (match && Object.hasOwn(LANGUAGES, match[1])) return match[1];
}

export function languageURL(language, value, root) {
  if (!Object.hasOwn(LANGUAGES, language)) throw new Error('Unknown language');
  const url = new URL(value, root);
  url.pathname = new URL(`${language}/`, root).pathname;
  return url;
}
