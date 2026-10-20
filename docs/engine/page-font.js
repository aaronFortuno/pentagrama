import { PAGE_FONT } from '../vendor/page-font-metrics.js?v=2.3.3';

const characters = new Map(PAGE_FONT.characters.map((code, index) => [String.fromCodePoint(code), { cid: index + 1, width: PAGE_FONT.widths[index] }]));
export const pageFontCharacter = character => characters.get(character) || characters.get('?');
export const pageFontText = text => [...text.normalize('NFC')].map(character => character === '\n' || characters.has(character) ? character : '?').join('');
export const pageTextWidth = (text, size) => [...text.normalize('NFC')].reduce((sum, character) => sum + pageFontCharacter(character).width, 0) * size / 1000;

// Explicit paragraphs and long words are retained: no content is silently cut.
export function wrapPageText(text, width, size) {
  const lines = [];
  for (const paragraph of pageFontText(text).split('\n')) {
    if (!paragraph.trim()) { lines.push(''); continue; }
    let line = '';
    for (const word of paragraph.trim().split(/\s+/)) {
      const candidate = line ? line + ' ' + word : word;
      if (pageTextWidth(candidate, size) <= width) { line = candidate; continue; }
      if (line) { lines.push(line); line = ''; }
      for (const character of word) {
        if (line && pageTextWidth(line + character, size) > width) { lines.push(line); line = ''; }
        line += character;
      }
    }
    if (line) lines.push(line);
  }
  return lines;
}
