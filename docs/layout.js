// Compatibility facade for v1 UI, presets, references and persisted settings.
// Printable geometry lives exclusively in engine/; this file performs no layout.
export * from './engine/constants.js?v=2.5.0';
export { normalizeSettings, pageDimensions } from './engine/settings.js?v=2.5.0';
export { encodeReference, decodeReference, encodeShareHash, decodeShareHash } from './engine/references.js?v=2.5.0';
export { layoutPage as createLayout } from './engine/page-layout.js?v=2.5.0';
export { fitSettings } from './engine/fit.js?v=2.5.0';
export { footerTextWidth } from './engine/typography.js?v=2.5.0';
export { footerLines } from './engine/footers.js?v=2.5.0';
import { createDocument } from './engine/document.js?v=2.5.0';
import { renderSvgPage } from './engine/svg.js?v=2.5.0';
export function renderSheet(value) { return renderSvgPage(createDocument(value).pages[0]); }
