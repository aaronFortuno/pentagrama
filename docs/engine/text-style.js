export const TEXT_FAMILIES = Object.freeze(['serif', 'sans', 'lora']);
// Physical millimetres internally, points in the formatting panel.
export const DEFAULT_TITLE_STYLE = Object.freeze({ family: 'serif', size: 6, bold: false, italic: false, underline: false });
export const DEFAULT_INSTRUCTIONS_STYLE = Object.freeze({ ...DEFAULT_TITLE_STYLE, size: 3.2 });
export const mmToPoints = value => value * 72 / 25.4;
export const pointsToMm = value => Math.round(value * 25.4 / 72 * 100) / 100;
export function normalizeTextStyle(value, fallback = DEFAULT_TITLE_STYLE) {
  value = value && typeof value === 'object' ? value : {};
  return { family: TEXT_FAMILIES.includes(value.family) ? value.family : fallback.family,
    size: typeof value.size === 'number' && Number.isFinite(value.size) ? Math.round(Math.max(2.12, Math.min(16.93, value.size)) * 100) / 100 : fallback.size,
    bold: value.bold === true, italic: value.italic === true, underline: value.underline === true };
}
export const sameTextStyle = (a, b) => Object.keys(DEFAULT_TITLE_STYLE).every(key => a[key] === b[key]);
export const textStyleTuple = style => [style.family, style.size, style.bold, style.italic, style.underline];
export function textStyleFromTuple(value) {
  if (!Array.isArray(value) || value.length !== 5 || typeof value[0] !== 'string' || typeof value[1] !== 'number' || !value.slice(2).every(v => typeof v === 'boolean')) throw new Error('invalidRef');
  return { family: value[0], size: value[1], bold: value[2], italic: value[3], underline: value[4] };
}
