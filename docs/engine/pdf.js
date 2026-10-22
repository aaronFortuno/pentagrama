import { FOOTER_FONT } from '../vendor/footer-font-metrics.js?v=2.4.0';
import { FOOTER_FONT_DATA } from '../vendor/footer-font-data.js?v=2.4.0';
import { footerTextWidth } from './typography.js?v=2.4.0';
import { validatePath } from './path-data.js?v=2.4.0';
import { pageTextWidth, DEFAULT_PAGE_FACE } from './page-font.js?v=2.4.0';
import { pageTextHex, pageFontObjects } from './page-font-pdf.js?v=2.4.0';

let fontProgram;
function embeddedFont() {
  if (!fontProgram) {
    const bytes = atob(FOOTER_FONT_DATA);
    fontProgram = { length: bytes.length, hex: [...bytes].map(byte => byte.charCodeAt(0).toString(16).padStart(2, '0')).join('') + '>' };
  }
  return fontProgram;
}


const points = mm => (mm * 72 / 25.4).toFixed(5);
const escapedText = text => text.replaceAll('\\', '\\\\').replaceAll('(', '\\(').replaceAll(')', '\\)');

function pageCommands(page, fontNames) {
  let commands = `0 G ${points(page.layout.thickness)} w\n`;
  let strokeWidth = page.layout.thickness, dash = '', strokeGray = 0;
  for (const element of page.scene) {
    if (element.kind === 'line') {
      const gray = element.gray ?? 0;
      if (gray !== strokeGray) { strokeGray = gray; commands += `${(gray / 255).toFixed(5)} G\n`; }
      if (element.strokeWidth !== strokeWidth) { strokeWidth = element.strokeWidth; commands += `${points(strokeWidth)} w\n`; }
      const nextDash = (element.dash || []).map(points).join(' ');
      if (nextDash !== dash) { dash = nextDash; commands += `[${dash}] 0 d\n`; }
      commands += `${points(element.x1)} ${points(page.frame.height - element.y1)} m ${points(element.x2)} ${points(page.frame.height - element.y2)} l S\n`;
    } else if (element.kind === 'circle') {
      const { x, y, radius: r } = element, k = r * .552284749831;
      commands += `${(element.gray / 255).toFixed(5)} g\n${points(x + r)} ${points(page.frame.height - y)} m\n`;
      for (const values of [[x+r,y+k,x+k,y+r,x,y+r], [x-k,y+r,x-r,y+k,x-r,y], [x-r,y-k,x-k,y-r,x,y-r], [x+k,y-r,x+r,y-k,x+r,y]]) {
        commands += values.map((value, index) => points(index % 2 ? page.frame.height - value : value)).join(' ') + ' c\n';
      }
      commands += 'h f\n';
    } else if (element.kind === 'path') {
      commands += '0 g\n';
      for (const [operation, ...values] of validatePath(element.commands)) {
        if (operation === 'Z') { commands += 'h\n'; continue; }
        if (!['M', 'L', 'C'].includes(operation)) throw new Error('unsupportedPathCommand');
        const coordinates = values.map((value, index) => points(index % 2 ? page.frame.height - value : value));
        commands += coordinates.join(' ') + ` ${operation === 'M' ? 'm' : operation === 'L' ? 'l' : 'c'}\n`;
      }
      commands += 'f\n';
    } else if (element.kind === 'text') {
      const key = element.fontFace || DEFAULT_PAGE_FACE;
      const width = element.font === 'page' ? pageTextWidth(element.text, element.fontSize, key) : footerTextWidth(element.text, element.fontSize);
      const x = element.anchor === 'start' ? element.x : element.x - width * (element.anchor === 'middle' ? .5 : 1);
      const text = element.font === 'page' ? `<${pageTextHex(element.text, key)}>` : `(${escapedText(element.text)})`;
      commands += `${(element.gray / 255).toFixed(5)} g BT /${element.font === 'page' ? fontNames.get(key) : 'F1'} ${points(element.fontSize)} Tf 1 0 0 1 ${points(x)} ${points(page.frame.height - element.y)} Tm ${text} Tj ET\n`;
    } else throw new Error('unsupportedSceneElement');
  }
  return commands;
}

export function createPdfDocument(value) {
  if (!value.valid || !value.pages.length) throw new Error('layoutInvalid');
  const usesFont = value.pages.some(page => page.scene.some(element => element.kind === 'text' && element.font !== 'page'));
  const faces = [...new Set(value.pages.flatMap(page => page.scene.filter(e => e.kind === 'text' && e.font === 'page').map(e => e.fontFace || DEFAULT_PAGE_FACE)))];
  const fontNames = new Map(faces.map((face, index) => [face, 'F' + (index + 2)]));
  const fontId = 3 + value.pages.length * 2;
  const pageFontId = fontId + (usesFont ? 3 : 0);
  const kids = value.pages.map((_, index) => `${3 + index * 2} 0 R`).join(' ');
  const objects = ['<< /Type /Catalog /Pages 2 0 R >>', `<< /Type /Pages /Kids [${kids}] /Count ${value.pages.length} >>`];
  value.pages.forEach((page, index) => {
    const commands = pageCommands(page, fontNames), contentId = 4 + index * 2;
    const usedFaces = new Set(page.scene.filter(e => e.kind === 'text' && e.font === 'page').map(e => e.fontFace || DEFAULT_PAGE_FACE));
    const fonts = [page.scene.some(element => element.kind === 'text' && element.font !== 'page') ? '/F1 ' + fontId + ' 0 R' : '', ...faces.flatMap((face, i) => usedFaces.has(face) ? `/${fontNames.get(face)} ${pageFontId + i * 6} 0 R` : [])].filter(Boolean).join(' ');
    objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${points(page.frame.width)} ${points(page.frame.height)}] /Resources << ${fonts ? '/Font << ' + fonts + ' >>' : ''} >> /Contents ${contentId} 0 R >>`,
      `<< /Length ${commands.length} >>\nstream\n${commands}endstream`);
  });
  if (usesFont) {
    const font = embeddedFont();
    objects.push(`<< /Type /Font /Subtype /TrueType /BaseFont /${FOOTER_FONT.name} /FirstChar 32 /LastChar 126 /Widths [${FOOTER_FONT.widths.join(' ')}] /Encoding /WinAnsiEncoding /FontDescriptor ${fontId + 1} 0 R >>`,
      `<< /Type /FontDescriptor /FontName /${FOOTER_FONT.name} /Flags 34 /FontBBox [${FOOTER_FONT.bbox.join(' ')}] /ItalicAngle 0 /Ascent ${FOOTER_FONT.ascent} /Descent ${FOOTER_FONT.descent} /CapHeight ${FOOTER_FONT.capHeight} /StemV 25 /FontFile2 ${fontId + 2} 0 R >>`,
      `<< /Length ${font.hex.length} /Length1 ${font.length} /Filter /ASCIIHexDecode >>\nstream\n${font.hex}\nendstream`);
  }
  faces.forEach((face, index) => objects.push(...pageFontObjects(pageFontId + index * 6, face)));
  let document = '%PDF-1.4\n'; const offsets = [0];
  objects.forEach((object, i) => { offsets.push(document.length); document += `${i + 1} 0 obj\n${object}\nendobj\n`; });
  const crossReference = document.length;
  document += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const offset of offsets.slice(1)) document += `${String(offset).padStart(10, '0')} 00000 n \n`;
  document += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${crossReference}\n%%EOF\n`;
  return new TextEncoder().encode(document);
}
