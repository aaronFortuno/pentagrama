import { normalizePageText } from './engine/page-text-settings.js?v=2.5.0';

export const FOOTER_LIBRARY_KEY = 'pentagrama.footers.v1', MAX_SAVED_FOOTERS = 8;
export function footerSnapshot(value) {
  const text = normalizePageText(value);
  return { footer: text.footer, footerImage: text.footerImage };
}
export function normalizeFooterLibrary(value) {
  if (!Array.isArray(value)) return [];
  const ids = new Set();
  return value.slice(0, MAX_SAVED_FOOTERS).flatMap(item => {
    if (!item || typeof item.id !== 'string' || !/^[\w-]{1,80}$/.test(item.id) || ids.has(item.id)) return [];
    const footer = footerSnapshot(item);
    if (!footer.footer.trim() && !footer.footerImage) return [];
    ids.add(item.id); return [{ id: item.id, ...footer }];
  });
}
export function saveFooter(library, value, id) {
  const clean = normalizeFooterLibrary(library), footer = footerSnapshot(value);
  if (!footer.footer.trim() && !footer.footerImage) throw new Error('emptyFooter');
  const existing = clean.find(item => JSON.stringify(footerSnapshot(item)) === JSON.stringify(footer));
  if (existing) return clean;
  if (clean.length >= MAX_SAVED_FOOTERS) throw new Error('footerLibraryFull');
  return normalizeFooterLibrary([...clean, { id, ...footer }]);
}
export const deleteFooter = (library, id) => normalizeFooterLibrary(library).filter(item => item.id !== id);
