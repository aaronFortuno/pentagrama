import { normalizeSettings } from './settings.js?v=2.8.0';
import { layoutPage } from './page-layout.js?v=2.8.0';
import { barlinesFit, minimumMeasureWidth } from './barlines.js?v=2.8.0';
import { clefSequence, minimumStaffGap } from './clefs.js?v=2.8.0';

function minimumBlockGaps(s) {
  const types = clefSequence(s), counts = s.blocks.map(block => block.count);
  let index = 0;
  const blocks = counts.map((count, i) => {
    const inside = Math.max(1, ...Array.from({ length: count - 1 }, (_, j) => minimumStaffGap(s, types[index + j], types[index + j + 1])));
    const after = i < counts.length - 1 ? minimumStaffGap(s, types[index + count - 1], types[index + count]) : 1;
    index += count; return { inside, after };
  });
  return { blocks, systemGap: s.systems > 1 ? minimumStaffGap(s, types[index - 1], types[index]) : 1 };
}

export function fitSettings(value) {
  let s = normalizeSettings(value);
  const initial = layoutPage(s);
  if (!barlinesFit(s, initial.right - (initial.musicLeft ?? initial.left))) s = normalizeSettings({ ...s, barlines: { ...s.barlines, measures: Math.max(1, Math.floor((initial.right - (initial.musicLeft ?? initial.left) + 1e-6) / minimumMeasureWidth(s))) } });
  if (s.clefs.enabled && s.mode === 'blocks') {
    const minimum = minimumBlockGaps(s), ceil = value => Math.ceil(value * 10 - 1e-6) / 10;
    s = normalizeSettings({ ...s, systemGap: Math.max(s.systemGap, ceil(minimum.systemGap)), blocks: s.blocks.map((block, i) => ({ ...block, inside: Math.max(block.inside, ceil(minimum.blocks[i].inside)), after: Math.max(block.after, ceil(minimum.blocks[i].after)) })) });
  }
  const l = layoutPage(s);
  if (l.valid) return s;
  if (s.mode === 'simple') { while (s.count > 1 && !layoutPage(s).valid) s = normalizeSettings({ ...s, count: s.count - 1 }); return s; }
  const gapCount = s.systems * s.blocks.reduce((sum, b, i) => sum + b.count - 1 + (i < s.blocks.length - 1 ? 1 : 0), 0) + s.systems - 1;
  const maximumLineSpace = Math.floor((l.available - gapCount) / (l.count * 4) * 10) / 10;
  if (maximumLineSpace < 1 || l.count > 256) return s;
  s = { ...s, lineSpacing: Math.min(s.lineSpacing, maximumLineSpace) };
  const minimum = minimumBlockGaps(s), ceil = v => Math.ceil(v * 10 - 1e-6) / 10;
  const scaled = multiplier => ({ ...s, systemGap: Math.max(ceil(minimum.systemGap), Math.floor(s.systemGap * multiplier * 10) / 10), blocks: s.blocks.map((b, i) => ({ ...b, inside: Math.max(ceil(minimum.blocks[i].inside), Math.floor(b.inside * multiplier * 10) / 10), after: Math.max(ceil(minimum.blocks[i].after), Math.floor(b.after * multiplier * 10) / 10) })) });
  let low = 0, high = 1;
  for (let i = 0; i < 40; i++) { const mid = (low + high) / 2; if (layoutPage(scaled(mid)).valid) low = mid; else high = mid; }
  return normalizeSettings(scaled(low));
}
