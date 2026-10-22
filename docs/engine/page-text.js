import { pageTextWidth, pageFontText, wrapPageText, pageFontKey, DEFAULT_PAGE_FACE } from './page-font.js?v=2.4.1';
import { pageDimensions } from './settings.js?v=2.4.1';

export const PRINTED_FIELD_LABELS = Object.freeze({ ca: ['Nom', 'Data'], en: ['Name', 'Date'], es: ['Nombre', 'Fecha'],
  de: ['Name', 'Datum'], fr: ['Nom', 'Date'], it: ['Nome', 'Data'], pt: ['Nome', 'Data'], nl: ['Naam', 'Datum'], eu: ['Izena', 'Data'], gl: ['Nome', 'Data'] });

// Physical header geometry only; the interface does not position these fields.
export function headerContent(settings) {
  const s = settings, options = s.pageText, { width } = pageDimensions(s);
  const left = s.marginLeft, right = width - s.marginRight, available = Math.max(0, right - left);
  const elements = []; let cursor = s.marginTop;
  function paragraph(text, style, lineHeight, role, align) {
    if (!text.trim()) return;
    const size = style.size, leading = size * lineHeight, face = pageFontKey(style);
    for (const line of wrapPageText(text.trim(), available, size, face)) {
      cursor += size;
      if (line) {
        const x = align === 'center' ? (left + right) / 2 : align === 'right' ? right : left, anchor = align === 'center' ? 'middle' : align === 'right' ? 'end' : 'start';
        elements.push({ kind: 'text', role, text: line, x, y: cursor, anchor, font: 'page', fontSize: size, gray: 45, ...(face !== DEFAULT_PAGE_FACE ? { fontFace: face } : {}) });
        if (style.underline) {
          const width = pageTextWidth(line, size, face), start = x - width * (anchor === 'middle' ? .5 : anchor === 'end' ? 1 : 0);
          elements.push({ kind: 'line', role: role + '-underline', x1: start, x2: start + width, y1: cursor + size * .14, y2: cursor + size * .14, stroke: '#000', strokeWidth: Math.max(.1, size / 24), gray: 45 });
        }
      }
      cursor += leading - size;
    }
    cursor += 1;
  }
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
  paragraph(options.title, options.titleStyle, 1.4, 'header-title', options.titleAlign);
  paragraph(options.instructions, options.instructionsStyle, 4.6 / 3.2, 'header-instructions', options.instructionsAlign);
  return { elements, height: elements.length ? cursor - s.marginTop + 4 : 0,
    valid: elements.every(element => element.kind === 'line' ? element.x2 > element.x1 : pageTextWidth(element.text, element.fontSize, element.fontFace) <= available + 1e-6) };
}
