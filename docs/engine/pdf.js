import { FOOTER_FONT } from '../vendor/footer-font-metrics.js?v=2.1.2';
import { FOOTER_FONT_DATA } from '../vendor/footer-font-data.js?v=2.1.2';
import { footerTextWidth } from './typography.js?v=2.1.2';
import { validatePath } from './path-data.js?v=2.1.2';

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

function pageCommands(page) {
  let commands = `0 G ${points(page.layout.thickness)} w\n`;
  let strokeWidth = page.layout.thickness, dash = '';
  for (const element of page.scene) {
    if (element.kind === 'line') {
      if (element.strokeWidth !== strokeWidth) { strokeWidth = element.strokeWidth; commands += `${points(strokeWidth)} w\n`; }
      const nextDash = (element.dash || []).map(points).join(' ');
      if (nextDash !== dash) { dash = nextDash; commands += `[${dash}] 0 d\n`; }
      commands += `${points(element.x1)} ${points(page.frame.height - element.y1)} m ${points(element.x2)} ${points(page.frame.height - element.y2)} l S\n`;
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
      const x = element.anchor === 'start' ? element.x : element.x - footerTextWidth(element.text);
      commands += `${(element.gray / 255).toFixed(5)} g BT /F1 ${points(element.fontSize)} Tf 1 0 0 1 ${points(x)} ${points(page.frame.height - element.y)} Tm (${escapedText(element.text)}) Tj ET\n`;
    } else throw new Error('unsupportedSceneElement');
  }
  return commands;
}

export function createPdfDocument(value) {
  if (!value.valid || !value.pages.length) throw new Error('layoutInvalid');
  const usesFont = value.pages.some(page => page.scene.some(element => element.kind === 'text'));
  const fontId = 3 + value.pages.length * 2;
  const kids = value.pages.map((_, index) => `${3 + index * 2} 0 R`).join(' ');
  const objects = ['<< /Type /Catalog /Pages 2 0 R >>', `<< /Type /Pages /Kids [${kids}] /Count ${value.pages.length} >>`];
  value.pages.forEach((page, index) => {
    const commands = pageCommands(page), contentId = 4 + index * 2;
    const hasText = page.scene.some(element => element.kind === 'text');
    objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${points(page.frame.width)} ${points(page.frame.height)}] /Resources << ${hasText ? '/Font << /F1 ' + fontId + ' 0 R >>' : ''} >> /Contents ${contentId} 0 R >>`,
      `<< /Length ${commands.length} >>\nstream\n${commands}endstream`);
  });
  if (usesFont) {
    const font = embeddedFont();
    objects.push(`<< /Type /Font /Subtype /TrueType /BaseFont /${FOOTER_FONT.name} /FirstChar 32 /LastChar 126 /Widths [${FOOTER_FONT.widths.join(' ')}] /Encoding /WinAnsiEncoding /FontDescriptor ${fontId + 1} 0 R >>`,
      `<< /Type /FontDescriptor /FontName /${FOOTER_FONT.name} /Flags 34 /FontBBox [${FOOTER_FONT.bbox.join(' ')}] /ItalicAngle 0 /Ascent ${FOOTER_FONT.ascent} /Descent ${FOOTER_FONT.descent} /CapHeight ${FOOTER_FONT.capHeight} /StemV 25 /FontFile2 ${fontId + 2} 0 R >>`,
      `<< /Length ${font.hex.length} /Length1 ${font.length} /Filter /ASCIIHexDecode >>\nstream\n${font.hex}\nendstream`);
  }
  let document = '%PDF-1.4\n'; const offsets = [0];
  objects.forEach((object, i) => { offsets.push(document.length); document += `${i + 1} 0 obj\n${object}\nendobj\n`; });
  const crossReference = document.length;
  document += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const offset of offsets.slice(1)) document += `${String(offset).padStart(10, '0')} 00000 n \n`;
  document += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${crossReference}\n%%EOF\n`;
  return new TextEncoder().encode(document);
}
