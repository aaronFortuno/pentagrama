import { PAGE_FONT_DATA } from '../vendor/page-font-data.js?v=2.4.1';
import { HEADER_FONT_DATA } from '../vendor/header-font-data.js?v=2.4.1';
import { pageFontCharacter, pageFontMetrics, DEFAULT_PAGE_FACE } from './page-font.js?v=2.4.1';

const hex4 = value => value.toString(16).padStart(4, '0');
const hexBytes = bytes => [...bytes].map(byte => byte.charCodeAt(0).toString(16).padStart(2, '0')).join('') + '>';
export const pageTextHex = (text, key) => [...text].map(character => hex4(pageFontCharacter(character, key).cid)).join('');
const cached = new Map();
function programs(key) {
  if (cached.has(key)) return cached.get(key);
  const font = pageFontMetrics(key), bytes = atob(key === DEFAULT_PAGE_FACE ? PAGE_FONT_DATA : HEADER_FONT_DATA[key]);
  const mappings = font.characters.map((code, index) => `<${hex4(index + 1)}> <${hex4(code)}>`);
  let cmap = '/CIDInit /ProcSet findresource begin\n12 dict begin\nbegincmap\n/CIDSystemInfo << /Registry (Adobe) /Ordering (UCS) /Supplement 0 >> def\n/CMapName /PentagramaTextUnicode def\n/CMapType 2 def\n1 begincodespacerange\n<0000> <ffff>\nendcodespacerange\n';
  for (let index = 0; index < mappings.length; index += 100) {
    const chunk = mappings.slice(index, index + 100); cmap += chunk.length + ' beginbfchar\n' + chunk.join('\n') + '\nendbfchar\n';
  }
  cmap += 'endcmap\nCMapName currentdict /CMap defineresource pop\nend\nend\n';
  const value = { font: hexBytes(bytes), length: bytes.length, cmap, glyphs: '0000' + font.glyphs.map(hex4).join('') + '>' };
  cached.set(key, value); return value;
}
export function pageFontObjects(id, key = DEFAULT_PAGE_FACE) {
  const p = programs(key), f = pageFontMetrics(key), flags = 32 + (key.startsWith('sans-') ? 0 : 2) + (key.endsWith('-italic') ? 64 : 0);
  return [
    `<< /Type /Font /Subtype /Type0 /BaseFont /${f.name} /Encoding /Identity-H /DescendantFonts [${id + 1} 0 R] /ToUnicode ${id + 4} 0 R >>`,
    `<< /Type /Font /Subtype /CIDFontType2 /BaseFont /${f.name} /CIDSystemInfo << /Registry (Adobe) /Ordering (Identity) /Supplement 0 >> /FontDescriptor ${id + 2} 0 R /DW 1000 /W [1 [${f.widths.join(' ')}]] /CIDToGIDMap ${id + 5} 0 R >>`,
    `<< /Type /FontDescriptor /FontName /${f.name} /Flags ${flags} /FontBBox [${f.bbox.join(' ')}] /ItalicAngle ${f.italicAngle || 0} /Ascent ${f.ascent} /Descent ${f.descent} /CapHeight ${f.capHeight} /StemV ${f.weight === 700 ? 80 : 40} /FontFile2 ${id + 3} 0 R >>`,
    `<< /Length ${p.font.length} /Length1 ${p.length} /Filter /ASCIIHexDecode >>\nstream\n${p.font}\nendstream`,
    `<< /Length ${p.cmap.length} >>\nstream\n${p.cmap}endstream`,
    `<< /Length ${p.glyphs.length} /Filter /ASCIIHexDecode >>\nstream\n${p.glyphs}\nendstream`,
  ];
}
