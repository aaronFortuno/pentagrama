import { FOOTER_SIZE } from './constants.js?v=2.0.0-alpha.5';
import { normalizeSettings, pageDimensions } from './settings.js?v=2.0.0-alpha.5';
import { footerLines } from './footers.js?v=2.0.0-alpha.5';
import { barlinesFit } from './barlines.js?v=2.0.0-alpha.5';
import { clefMetrics, clefsFit } from './clefs.js?v=2.0.0-alpha.5';

export function layoutPage(value) {
  const s = normalizeSettings(value); const { width, height } = pageDimensions(s);
  const clefs = clefMetrics(s);
  const footer = footerLines(s), footerTop = footer.length ? Math.min(...footer.map(line => line.y)) - FOOTER_SIZE - 3 : height;
  const top = s.marginTop + s.topSpace + clefs.above, bottom = Math.min(height - s.marginBottom, footerTop) - clefs.below, available = bottom - top, staffHeight = s.lineSpacing * 4;
  const left = s.marginLeft, right = width - s.marginRight;
  const count = s.mode === 'blocks' ? s.systems * s.blocks.reduce((n, b) => n + b.count, 0) : s.count;
  let needed, gap = 0, positions = [];
  if (s.mode === 'simple') {
    const boundaries = s.group ? Math.floor((count - 1) / s.group) : 0, units = count - 1 + boundaries * (s.spacing - 1);
    needed = count * staffHeight + units;
    gap = units ? Math.max(1, (available - count * staffHeight) / units) : 0;
    let y = count === 1 ? (top + bottom - staffHeight) / 2 : top;
    for (let i = 0; i < count; i++) { positions.push(y); y += staffHeight + gap * (s.group && (i + 1) % s.group === 0 ? s.spacing : 1); }
  } else {
    const systemHeight = s.blocks.reduce((sum, b, i) => sum + b.count * staffHeight + (b.count - 1) * b.inside + (i < s.blocks.length - 1 ? b.after : 0), 0);
    needed = s.systems * systemHeight + (s.systems - 1) * s.systemGap;
    let y = top + Math.max(0, (available - needed) / 2);
    if (count <= 256) for (let system = 0; system < s.systems; system++) {
      for (let i = 0; i < s.blocks.length; i++) {
        const b = s.blocks[i];
        for (let staff = 0; staff < b.count; staff++) { positions.push(y); y += staffHeight + (staff < b.count - 1 ? b.inside : 0); }
        if (i < s.blocks.length - 1) y += b.after;
      }
      if (system < s.systems - 1) y += s.systemGap;
    }
  }
  const staves = positions.map(y => Array.from({ length: 5 }, (_, i) => y + i * s.lineSpacing));
  return { ...s, width, height, top, bottom, left, right, available, needed, count, gap, staves, ...(clefs.header ? { musicLeft: left + clefs.header } : {}), valid: needed <= available + 1e-6 && right - left > clefs.header && count <= 256 && barlinesFit(s, right - left - clefs.header) && clefsFit(s, staves, clefs), overflow: Math.max(0, needed - available) };
}
