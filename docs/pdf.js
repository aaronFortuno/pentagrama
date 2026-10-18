import { createLayout, footerLines, footerTextWidth, FOOTER_GRAY, FOOTER_SIZE } from './layout.js?v=1.17.1';
import { FOOTER_FONT } from './vendor/footer-font-metrics.js?v=1.17.1';
import { FOOTER_FONT_DATA } from './vendor/footer-font-data.js?v=1.17.1';

let fontProgram;
function embeddedFont() {
  if (!fontProgram) {
    const bytes = atob(FOOTER_FONT_DATA);
    fontProgram = { length: bytes.length, hex: [...bytes].map(byte => byte.charCodeAt(0).toString(16).padStart(2, '0')).join('') + '>' };
  }
  return fontProgram;
}

// A vector page in physical units, with no rasterisation or remote service.
export function createPdf(settings) {
  const l = createLayout(settings); if (!l.valid) throw new Error('layoutInvalid');
  const points = mm => (mm * 72 / 25.4).toFixed(5);
  let commands = `0 G ${points(l.thickness)} w\n`;
  for (const staff of l.staves) for (const y of staff) commands += `${points(18)} ${points(l.height - y)} m ${points(l.width - 18)} ${points(l.height - y)} l S\n`;
  const footer = footerLines(settings);
  for (const f of footer) {
    const x = f.anchor === 'start' ? f.x : f.x - footerTextWidth(f.text);
    commands += `${(FOOTER_GRAY / 255).toFixed(5)} g BT /F1 ${points(FOOTER_SIZE)} Tf 1 0 0 1 ${points(x)} ${points(l.height - f.y)} Tm (${f.text}) Tj ET\n`;
  }
  const objects = ['<< /Type /Catalog /Pages 2 0 R >>', '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${points(l.width)} ${points(l.height)}] /Resources << ${footer.length ? '/Font << /F1 5 0 R >>' : ''} >> /Contents 4 0 R >>`,
    `<< /Length ${commands.length} >>\nstream\n${commands}endstream`];
  if (footer.length) {
    const font = embeddedFont();
    objects.push(`<< /Type /Font /Subtype /TrueType /BaseFont /${FOOTER_FONT.name} /FirstChar 32 /LastChar 126 /Widths [${FOOTER_FONT.widths.join(' ')}] /Encoding /WinAnsiEncoding /FontDescriptor 6 0 R >>`,
      `<< /Type /FontDescriptor /FontName /${FOOTER_FONT.name} /Flags 34 /FontBBox [${FOOTER_FONT.bbox.join(' ')}] /ItalicAngle 0 /Ascent ${FOOTER_FONT.ascent} /Descent ${FOOTER_FONT.descent} /CapHeight ${FOOTER_FONT.capHeight} /StemV 25 /FontFile2 7 0 R >>`,
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
