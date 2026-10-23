import { PAPER_SIZES, DEFAULT_MARGINS, DEFAULT_BARLINES } from './constants.js?v=2.8.0';
import { CLEF_TYPES, normalizeClefPattern } from './clefs.js?v=2.8.0';
import { normalizePageText } from './page-text-settings.js?v=2.8.0';
import { normalizeNotes } from './notes.js?v=2.8.0';

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
const round = v => Math.round(v * 10) / 10;
const numeric = (v, fallback, min, max) => clamp(Number.isFinite(Number(v)) && v !== null && v !== '' ? Number(v) : fallback, min, max);

export function normalizeSettings(value = {}) {
  if (!value || typeof value !== 'object') value = {};
  const count = Math.round(numeric(value.count, 9, 1, 64));
  let group = Math.round(numeric(value.group, 0, 0, 63));
  if (group < 2 || group >= count) group = 0;
  const blocks = Array.isArray(value.blocks) ? value.blocks.slice(0, 24).filter(b => b && typeof b === 'object').map(b => ({
    label: typeof b.label === 'string' ? b.label.trim().slice(0, 60) : '',
    count: Math.round(numeric(b.count, 2, 1, 32)), inside: round(numeric(b.inside, 8, 1, 40)), after: round(numeric(b.after, 14, 1, 60)),
    ...(normalizeClefPattern(b.clefs, 32).length ? { clefs: normalizeClefPattern(b.clefs, 32) } : {}),
  })) : [];
  const bars = value.barlines && typeof value.barlines === 'object' ? value.barlines : {};
  const clefs = value.clefs && typeof value.clefs === 'object' ? value.clefs : {};
  const duplex = value.duplex && typeof value.duplex === 'object' ? value.duplex : {};
  return {
    count, group, spacing: round(numeric(value.spacing, 2.2, 1.2, 4)), thickness: Math.round(numeric(value.thickness, 0.12, 0.05, 0.5) * 100) / 100,
    reference: value.reference === true, source: value.source === true, paper: Object.hasOwn(PAPER_SIZES, value.paper) ? value.paper : 'A4', orientation: value.orientation === 'landscape' ? 'landscape' : 'portrait',
    lineSpacing: round(numeric(value.lineSpacing, 2, 1, 4)), topSpace: Math.round(numeric(value.topSpace, 0, 0, 100)), mode: value.mode === 'blocks' ? 'blocks' : 'simple', systems: Math.round(numeric(value.systems, 1, 1, 8)), systemGap: round(numeric(value.systemGap, 18, 1, 60)),
    ...Object.fromEntries(Object.entries(DEFAULT_MARGINS).map(([key, fallback]) => [key, Math.round(numeric(value[key], fallback, 0, 100))])),
    blocks: blocks.length ? blocks : value.mode === 'blocks' ? [{ label: '', count: 4, inside: 12, after: 14 }, { label: '', count: 2, inside: 6, after: 14 }] : [],
    barlines: {
      enabled: bars.enabled === true, measures: Math.round(numeric(bars.measures, DEFAULT_BARLINES.measures, 1, 16)),
      style: ['single', 'double', 'dashed'].includes(bars.style) ? bars.style : DEFAULT_BARLINES.style,
      thickness: Math.round(numeric(bars.thickness, DEFAULT_BARLINES.thickness, 0.05, 0.6) * 100) / 100,
      thicknessMode: bars.thicknessMode === 'custom' || bars.thicknessMode === undefined && Object.hasOwn(bars, 'thickness') ? 'custom' : 'staff',
      connect: ['none', 'solid', 'dashed'].includes(bars.connect) ? bars.connect : DEFAULT_BARLINES.connect,
    },
    clefs: { enabled: clefs.enabled === true, type: CLEF_TYPES.includes(clefs.type) ? clefs.type : 'treble', mode: clefs.mode === 'pattern' ? 'pattern' : 'uniform', pattern: normalizeClefPattern(clefs.pattern, 64) },
    duplex: { enabled: duplex.enabled === true, firstPageOnly: duplex.firstPageOnly !== false, mirrorMargins: duplex.mirrorMargins === true },
    pageText: normalizePageText(value.pageText),
    notes: normalizeNotes(value.notes),
  };
}

export function pageDimensions(value) {
  const s = normalizeSettings(value); const [short, long] = PAPER_SIZES[s.paper];
  return s.orientation === 'landscape' ? { width: long, height: short } : { width: short, height: long };
}
