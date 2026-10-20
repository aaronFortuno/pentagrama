import { renderSvgPage } from './svg.js?v=2.1.2';

export function renderPrintDocument(document) {
  if (!document.valid) throw new Error('layoutInvalid');
  const rules = document.pages.map((page, index) => `@page pentagrama-${index + 1}{size:${page.frame.width}mm ${page.frame.height}mm;margin:0}`).join('');
  const pages = document.pages.map((page, index) => `<section class="print-page" style="page:pentagrama-${index + 1};width:${page.frame.width}mm;height:${page.frame.height}mm">${renderSvgPage(page)}</section>`).join('');
  return `<style>${rules}</style>${pages}`;
}
