import { FOOTER_FONT } from '../vendor/footer-font-metrics.js?v=2.2.0';
import { FOOTER_SIZE } from './constants.js?v=2.2.0';

export function footerTextWidth(text) {
  return [...text].reduce((sum, character) => sum + FOOTER_FONT.widths[character.charCodeAt(0) - 32], 0) * FOOTER_SIZE / 1000;
}
