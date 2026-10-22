import { DEFAULT_TITLE_STYLE, DEFAULT_INSTRUCTIONS_STYLE, normalizeTextStyle, sameTextStyle, textStyleTuple, textStyleFromTuple } from './text-style.js?v=2.5.0';
import { normalizeFooterImage } from './raster-image.js?v=2.5.0';
export const PAGE_TEXT_LIMITS = Object.freeze({ title: 100, instructions: 500, footer: 160 });
export const PAGE_TEXT_LANGUAGES = Object.freeze(['ca', 'en', 'es', 'de', 'fr', 'it', 'pt', 'nl', 'eu', 'gl']);
export const DEFAULT_PAGE_TEXT = Object.freeze({ title: '', instructions: '', nameDate: false, firstPageOnly: true, language: 'ca', footer: '', titleAlign: 'left', instructionsAlign: 'left', titleStyle: DEFAULT_TITLE_STYLE, instructionsStyle: DEFAULT_INSTRUCTIONS_STYLE, footerImage: null });
const alignment = value => ['left', 'center', 'right'].includes(value) ? value : 'left';

function clean(value, maximum, multiline = false) {
  if (typeof value !== 'string') return '';
  const text = value.toWellFormed().normalize('NFC').replace(/\r\n?/g, '\n').replace(/[\u0000-\u0008\u000B-\u001F\u007F]/g, '').replace(/\t/g, ' ');
  return [...(multiline ? text : text.replace(/\n/g, ' '))].slice(0, maximum).join('');
}
export function normalizePageText(value = {}) {
  if (!value || typeof value !== 'object') value = {};
  return { title: clean(value.title, PAGE_TEXT_LIMITS.title), instructions: clean(value.instructions, PAGE_TEXT_LIMITS.instructions, true),
    nameDate: value.nameDate === true, firstPageOnly: value.firstPageOnly !== false,
    language: PAGE_TEXT_LANGUAGES.includes(value.language) ? value.language : 'ca', footer: clean(value.footer, PAGE_TEXT_LIMITS.footer),
    titleAlign: alignment(value.titleAlign), instructionsAlign: alignment(value.instructionsAlign),
    titleStyle: normalizeTextStyle(value.titleStyle, DEFAULT_TITLE_STYLE), instructionsStyle: normalizeTextStyle(value.instructionsStyle, DEFAULT_INSTRUCTIONS_STYLE), footerImage: normalizeFooterImage(value.footerImage) };
}
export const hasPageText = value => Boolean(value.title.trim() || value.instructions.trim() || value.nameDate || value.footer.trim());
export function hasPageTextSettings(value) {
  const normalized = normalizePageText(value);
  return JSON.stringify(normalized) !== JSON.stringify(DEFAULT_PAGE_TEXT);
}

export function encodePageText(value) {
  const s = normalizePageText(value), values = [s.title, s.instructions, s.nameDate, s.firstPageOnly, s.language, s.footer];
  const styled = !sameTextStyle(s.titleStyle, DEFAULT_TITLE_STYLE) || !sameTextStyle(s.instructionsStyle, DEFAULT_INSTRUCTIONS_STYLE);
  if (styled || s.titleAlign !== 'left' || s.instructionsAlign !== 'left') values.push(s.titleAlign, s.instructionsAlign);
  if (styled) values.push(textStyleTuple(s.titleStyle), textStyleTuple(s.instructionsStyle));
  const json = JSON.stringify(values);
  return btoa(String.fromCharCode(...new TextEncoder().encode(json))).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
}
export function decodePageText(payload) {
  if (typeof payload !== 'string' || !/^[A-Za-z0-9_-]+$/.test(payload) || payload.length > 10000) throw new Error('invalidRef');
  const bytes = Uint8Array.from(atob(payload.replaceAll('-', '+').replaceAll('_', '/')), c => c.charCodeAt(0));
  const values = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
  if (!Array.isArray(values) || ![6, 8, 10].includes(values.length) || ![0, 1, 4, 5].every(i => typeof values[i] === 'string') || ![2, 3].every(i => typeof values[i] === 'boolean')) throw new Error('invalidRef');
  const normalized = normalizePageText({ title: values[0], instructions: values[1], nameDate: values[2], firstPageOnly: values[3], language: values[4], footer: values[5], titleAlign: values[6], instructionsAlign: values[7],
    ...(values.length === 10 ? { titleStyle: textStyleFromTuple(values[8]), instructionsStyle: textStyleFromTuple(values[9]) } : {}) });
  if (encodePageText(normalized) !== payload || !hasPageTextSettings(normalized)) throw new Error('invalidRef');
  return normalized;
}
