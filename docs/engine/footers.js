import { SERVICE_ADDRESS, FOOTER_SIZE } from './constants.js?v=2.3.5';
import { normalizeSettings, pageDimensions } from './settings.js?v=2.3.5';
import { encodeReference } from './references.js?v=2.3.5';
import { footerTextWidth } from './typography.js?v=2.3.5';
import { pageFontText, pageTextWidth } from './page-font.js?v=2.3.5';

export function footerLines(value, referenceSettings) {
  const s = normalizeSettings(value), { width, height } = pageDimensions(s);
  const left = Math.max(2, s.marginLeft), right = width - Math.max(2, s.marginRight);
  const baseline = height - Math.min(9, Math.max(2, s.marginBottom / 2));
  if (s.pageText.footer.trim()) {
    // Three horizontal slots share a fixed baseline. Bound the outer slots so
    // personal text always has space; unusually long content scales, not wraps.
    const available = Math.max(1, right - left), gap = Math.min(4, available / 12);
    const reference = s.reference ? encodeReference(referenceSettings || s) : '';
    const sourceNatural = s.source ? footerTextWidth(SERVICE_ADDRESS) : 0, referenceNatural = reference ? footerTextWidth(reference) : 0;
    const sourceWidth = Math.min(sourceNatural, available * .2), referenceWidth = Math.min(referenceNatural, available * .45);
    const middleLeft = left + (s.source ? sourceWidth + gap : 0), middleRight = right - (reference ? referenceWidth + gap : 0);
    const text = pageFontText(s.pageText.footer.trim());
    const fontSize = Math.min(2.4, Math.max(.01, middleRight - middleLeft) / Math.max(.01, pageTextWidth(text, 1)));
    const textWidth = pageTextWidth(text, fontSize);
    const x = Math.min(middleRight - textWidth / 2, Math.max(middleLeft + textWidth / 2, (left + right) / 2));
    const custom = { text, x, y: baseline, anchor: 'middle', font: 'page', fontSize, role: 'custom-footer' };
    const fit = (natural, width) => natural > width ? { fontSize: FOOTER_SIZE * width / natural } : {};
    return [custom,
      ...(s.source ? [{ text: SERVICE_ADDRESS, x: left, y: baseline, anchor: 'start', ...fit(sourceNatural, sourceWidth) }] : []),
      ...(reference ? [{ text: reference, x: right, y: baseline, anchor: 'end', ...fit(referenceNatural, referenceWidth) }] : [])];
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
