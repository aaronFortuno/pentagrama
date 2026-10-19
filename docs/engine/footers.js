import { SERVICE_ADDRESS } from './constants.js?v=2.0.0-alpha.2';
import { normalizeSettings, pageDimensions } from './settings.js?v=2.0.0-alpha.2';
import { encodeReference } from './references.js?v=2.0.0-alpha.2';
import { footerTextWidth } from './typography.js?v=2.0.0-alpha.2';

export function footerLines(value) {
  const s = normalizeSettings(value), { width, height } = pageDimensions(s);
  const left = Math.max(2, s.marginLeft), right = width - Math.max(2, s.marginRight);
  const baseline = height - Math.min(9, Math.max(2, s.marginBottom / 2));
  const source = s.source ? [{ text: SERVICE_ADDRESS, x: left, y: baseline, anchor: 'start' }] : [];
  if (!s.reference) return source;
  const reserved = s.source ? footerTextWidth(SERVICE_ADDRESS) + 8 : 0;
  const stacked = right - left - reserved < 12;
  const available = Math.max(1, right - left - (stacked ? 0 : reserved));
  const chunks = []; let line = '';
  for (const character of encodeReference(s)) {
    if (line && footerTextWidth(line + character) > available) { chunks.push(line); line = ''; }
    line += character;
  }
  if (line) chunks.push(line);
  const lines = chunks.map((text, i) => ({ text, x: right, y: baseline - (chunks.length - i - 1) * 2.9, anchor: 'end' }));
  if (stacked && source.length) source[0].y = baseline - chunks.length * 2.9;
  return [...source, ...lines];
}
