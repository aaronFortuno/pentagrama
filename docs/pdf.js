// Compatibility entry point: the UI and older callers still pass one settings object.
import { createDocument } from './engine/document.js?v=2.0.0-alpha.5';
import { createPdfDocument } from './engine/pdf.js?v=2.0.0-alpha.5';
export function createPdf(settings) { return createPdfDocument(createDocument(settings)); }
export { createPdfDocument };
