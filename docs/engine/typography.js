import { FOOTER_FONT } from '../vendor/footer-font-metrics.js?v=2.3.5';
import { FOOTER_SIZE } from './constants.js?v=2.3.5';

export function footerTextWidth(text, size = FOOTER_SIZE) {
  return [...text].reduce((sum, character) => sum + FOOTER_FONT.widths[character.charCodeAt(0) - 32], 0) * size / 1000;
}
