// Compatibility entry point: the UI and older callers still pass one settings object.
import { createDocument } from './engine/document.js?v=2.1.2';
import { createPdfDocument } from './engine/pdf.js?v=2.1.2';
export function createPdf(settings) { return createPdfDocument(createDocument(settings)); }
export { createPdfDocument };
