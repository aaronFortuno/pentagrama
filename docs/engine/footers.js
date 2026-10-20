import { SERVICE_ADDRESS } from './constants.js?v=2.2.0';
import { normalizeSettings, pageDimensions } from './settings.js?v=2.2.0';
import { encodeReference } from './references.js?v=2.2.0';
import { footerTextWidth } from './typography.js?v=2.2.0';
import { wrapPageText } from './page-font.js?v=2.2.0';

export function footerLines(value, referenceSettings) {
  const s = normalizeSettings(value), { width, height } = pageDimensions(s);
  const left = Math.max(2, s.marginLeft), right = width - Math.max(2, s.marginRight);
  const baseline = height - Math.min(9, Math.max(2, s.marginBottom / 2));
  if (s.pageText.footer.trim()) {
    const available = Math.max(1, right - left), size = 2.4, rows = []; let y = baseline;
    if (s.reference) {
      const chunks = []; let current = '';
      for (const character of encodeReference(referenceSettings || s)) {
        if (current && footerTextWidth(current + character) > available) { chunks.push(current); current = ''; }
        current += character;
      }
      if (current) chunks.push(current);
      chunks.forEach((text, index) => rows.push({ text, x: right, y: y - (chunks.length - index - 1) * 2.9, anchor: 'end' }));
      y -= chunks.length * 2.9 + 1;
    }
    if (s.source) { rows.push({ text: SERVICE_ADDRESS, x: left, y, anchor: 'start' }); y -= 3.4; }
    const chunks = wrapPageText(s.pageText.footer.trim(), available, size);
    const custom = chunks.map((text, index) => ({ text, x: left, y: y - (chunks.length - index - 1) * 3.4, anchor: 'start', font: 'page', fontSize: size, role: 'custom-footer' }));
    return [...custom, ...rows];
  }
  const source = s.source ? [{ text: SERVICE_ADDRESS, x: left, y: baseline, anchor: 'start' }] : [];
  if (!s.reference) return source;
  const reserved = s.source ? footerTextWidth(SERVICE_ADDRESS) + 8 : 0;
  const stacked = right - left - reserved < 12;
  const available = Math.max(1, right - left - (stacked ? 0 : reserved));
  const chunks = []; let line = '';
  for (const character of encodeReference(referenceSettings || s)) {
    if (line && footerTextWidth(line + character) > available) { chunks.push(line); line = ''; }
    line += character;
  }
  if (line) chunks.push(line);
  const lines = chunks.map((text, i) => ({ text, x: right, y: baseline - (chunks.length - i - 1) * 2.9, anchor: 'end' }));
  if (stacked && source.length) source[0].y = baseline - chunks.length * 2.9;
  return [...source, ...lines];
}
