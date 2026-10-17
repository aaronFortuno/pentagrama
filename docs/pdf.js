import { createLayout, footerLines } from './layout.js?v=1.3.0';

// A vector page in physical units, with no rasterisation or remote service.
export function createPdf(settings) {
  const l = createLayout(settings); if (!l.valid) throw new Error('layoutInvalid');
  const points = mm => (mm * 72 / 25.4).toFixed(5);
  let commands = `0 G ${points(l.thickness)} w\n`;
  for (const staff of l.staves) for (const y of staff) commands += `${points(18)} ${points(l.height - y)} m ${points(l.width - 18)} ${points(l.height - y)} l S\n`;
  for (const f of footerLines(settings)) {
    const x = f.anchor === 'start' ? f.x : f.x - f.text.length * 1.2;
    commands += `0.455 g BT /F1 ${points(2)} Tf 1 0 0 1 ${points(x)} ${points(l.height - f.y)} Tm (${f.text}) Tj ET\n`;
  }
  const objects = ['<< /Type /Catalog /Pages 2 0 R >>', '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${points(l.width)} ${points(l.height)}] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>`,
    `<< /Length ${commands.length} >>\nstream\n${commands}endstream`, '<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>'];
  let document = '%PDF-1.4\n'; const offsets = [0];
  objects.forEach((object, i) => { offsets.push(document.length); document += `${i + 1} 0 obj\n${object}\nendobj\n`; });
  const crossReference = document.length;
  document += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (const offset of offsets.slice(1)) document += `${String(offset).padStart(10, '0')} 00000 n \n`;
  document += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${crossReference}\n%%EOF\n`;
  return new TextEncoder().encode(document);
}
