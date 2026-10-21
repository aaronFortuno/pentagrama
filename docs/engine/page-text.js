import { pageTextWidth, pageFontText, wrapPageText } from './page-font.js?v=2.3.5';
import { pageDimensions } from './settings.js?v=2.3.5';

export const PRINTED_FIELD_LABELS = Object.freeze({ ca: ['Nom', 'Data'], en: ['Name', 'Date'], es: ['Nombre', 'Fecha'],
  de: ['Name', 'Datum'], fr: ['Nom', 'Date'], it: ['Nome', 'Data'], pt: ['Nome', 'Data'], nl: ['Naam', 'Datum'], eu: ['Izena', 'Data'], gl: ['Nome', 'Data'] });

// Physical header geometry only; the interface does not position these fields.
export function headerContent(settings) {
  const s = settings, options = s.pageText, { width } = pageDimensions(s);
  const left = s.marginLeft, right = width - s.marginRight, available = Math.max(0, right - left);
  const elements = []; let cursor = s.marginTop;
  function paragraph(text, size, leading, role, align) {
    if (!text.trim()) return;
    for (const line of wrapPageText(text.trim(), available, size)) {
      cursor += size;
      if (line) elements.push({ kind: 'text', role, text: line, x: align === 'center' ? (left + right) / 2 : align === 'right' ? right : left, y: cursor, anchor: align === 'center' ? 'middle' : align === 'right' ? 'end' : 'start', font: 'page', fontSize: size, gray: 45 });
      cursor += leading - size;
    }
    cursor += 1;
  }
  paragraph(options.title, 6, 8.4, 'header-title', options.titleAlign);
  paragraph(options.instructions, 3.2, 4.6, 'header-instructions', options.instructionsAlign);
  let fields;
  if (options.nameDate) {
    const labels = PRINTED_FIELD_LABELS[options.language], gap = 8, nameWidth = Math.max(0, available - gap) * .74;
    const baseline = cursor + 4, dateLeft = left + nameWidth + gap, size = 3.2;
    fields = [{ label: labels[0] + ':', left, right: left + nameWidth, role: 'student-name' }, { label: labels[1] + ':', left: dateLeft, right, role: 'student-date' }];
    fields.forEach(field => {
      elements.push({ kind: 'text', role: field.role, text: pageFontText(field.label), x: field.left, y: baseline, anchor: 'start', font: 'page', fontSize: size, gray: 65 });
      elements.push({ kind: 'line', role: field.role + '-line', x1: field.left + pageTextWidth(field.label, size) + 2, x2: field.right, y1: baseline + 1, y2: baseline + 1, stroke: '#000', strokeWidth: .1 });
    });
    cursor += 9;
  }
  return { elements, height: elements.length ? cursor - s.marginTop + 4 : 0,
    valid: elements.every(element => element.kind === 'line' ? element.x2 > element.x1 : pageTextWidth(element.text, element.fontSize) <= available + 1e-6) };
}
