import { PAGE_FONT } from '../vendor/page-font-metrics.js?v=2.8.0';
import { HEADER_FONTS } from '../vendor/header-font-metrics.js?v=2.8.0';

export const DEFAULT_PAGE_FACE = 'serif-regular';
export const pageFontKey = (style = {}) => `${style.family || 'serif'}-${style.bold ? 'bold' : 'regular'}${style.italic ? '-italic' : ''}`;
export const pageFontMetrics = (key = DEFAULT_PAGE_FACE) => key === DEFAULT_PAGE_FACE ? PAGE_FONT : HEADER_FONTS[key] || PAGE_FONT;
export function pageFontAppearance(key = DEFAULT_PAGE_FACE) {
  return { family: key.startsWith('sans-') ? 'Pentagrama Sans' : key.startsWith('lora-') ? 'Pentagrama Editorial' : 'Pentagrama Text',
    fallback: key.startsWith('sans-') ? 'sans-serif' : 'serif', weight: pageFontMetrics(key).weight, italic: key.endsWith('-italic') };
}
const tables = new Map();
function characters(key = DEFAULT_PAGE_FACE) {
  if (!tables.has(key)) { const font = pageFontMetrics(key); tables.set(key, new Map(font.characters.map((code, index) => [String.fromCodePoint(code), { cid: index + 1, width: font.widths[index] }]))); }
  return tables.get(key);
}
export const pageFontCharacter = (character, key) => characters(key).get(character) || characters(key).get('?');
export const pageFontText = (text, key) => [...text.normalize('NFC')].map(character => character === '\n' || characters(key).has(character) ? character : '?').join('');
export const pageTextWidth = (text, size, key) => [...text.normalize('NFC')].reduce((sum, character) => sum + pageFontCharacter(character, key).width, 0) * size / 1000;

// Explicit paragraphs and long words are retained: no content is silently cut.
export function wrapPageText(text, width, size, key) {
  const lines = [];
  for (const paragraph of pageFontText(text, key).split('\n')) {
    if (!paragraph.trim()) { lines.push(''); continue; }
    let line = '';
    for (const word of paragraph.trim().split(/\s+/)) {
      const candidate = line ? line + ' ' + word : word;
      if (pageTextWidth(candidate, size, key) <= width) { line = candidate; continue; }
      if (line) { lines.push(line); line = ''; }
      for (const character of word) {
        if (line && pageTextWidth(line + character, size, key) > width) { lines.push(line); line = ''; }
        line += character;
      }
    }
    if (line) lines.push(line);
  }
  return lines;
}
