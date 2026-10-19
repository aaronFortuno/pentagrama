import { normalizeSettings } from './settings.js?v=2.0.0-alpha.2';
import { layoutPage } from './page-layout.js?v=2.0.0-alpha.2';
import { barlinesFit, minimumMeasureWidth } from './barlines.js?v=2.0.0-alpha.2';

export function fitSettings(value) {
  let s = normalizeSettings(value);
  const initial = layoutPage(s);
  if (!barlinesFit(s, initial.right - initial.left)) s = normalizeSettings({ ...s, barlines: { ...s.barlines, measures: Math.max(1, Math.floor((initial.right - initial.left + 1e-6) / minimumMeasureWidth(s.barlines))) } });
  const l = layoutPage(s);
  if (l.valid) return s;
  if (s.mode === 'simple') { while (s.count > 1 && !layoutPage(s).valid) s = normalizeSettings({ ...s, count: s.count - 1 }); return s; }
  const gapCount = s.systems * s.blocks.reduce((sum, b, i) => sum + b.count - 1 + (i < s.blocks.length - 1 ? 1 : 0), 0) + s.systems - 1;
  const maximumLineSpace = Math.floor((l.available - gapCount) / (l.count * 4) * 10) / 10;
  if (maximumLineSpace < 1 || l.count > 256) return s;
  s = { ...s, lineSpacing: Math.min(s.lineSpacing, maximumLineSpace) };
  const scaled = multiplier => ({ ...s, systemGap: Math.max(1, Math.floor(s.systemGap * multiplier * 10) / 10), blocks: s.blocks.map(b => ({ ...b, inside: Math.max(1, Math.floor(b.inside * multiplier * 10) / 10), after: Math.max(1, Math.floor(b.after * multiplier * 10) / 10) })) });
  let low = 0, high = 1;
  for (let i = 0; i < 40; i++) { const mid = (low + high) / 2; if (layoutPage(scaled(mid)).valid) low = mid; else high = mid; }
  return normalizeSettings(scaled(low));
}
