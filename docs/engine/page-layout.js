import { FOOTER_SIZE } from './constants.js?v=2.4.0';
import { normalizeSettings, pageDimensions } from './settings.js?v=2.4.0';
import { footerLines } from './footers.js?v=2.4.0';
import { barlinesFit } from './barlines.js?v=2.4.0';
import { clefMetrics, clefsFit } from './clefs.js?v=2.4.0';
import { headerContent } from './page-text.js?v=2.4.0';

export function layoutPage(value, { referenceSettings } = {}) {
  const s = normalizeSettings(value); const { width, height } = pageDimensions(s);
  const clefs = clefMetrics(s);
  const header = headerContent(s);
  const footer = footerLines(s, referenceSettings), footerTop = footer.length ? Math.min(...footer.map(line => line.y - (line.fontSize ?? FOOTER_SIZE))) - 3 : height;
  const contentTop = s.marginTop + Math.max(s.topSpace, header.height), contentBottom = Math.min(height - s.marginBottom, footerTop);
  const notesHeight = s.notes.enabled ? Math.max(0, contentBottom - contentTop) * s.notes.percent / 100 : 0;
  const notesArea = s.notes.enabled ? { left: s.marginLeft, right: width - s.marginRight,
    top: s.notes.position === 'top' ? contentTop : contentBottom - notesHeight,
    bottom: s.notes.position === 'top' ? contentTop + notesHeight : contentBottom } : undefined;
  // Lay out the complete sheet first. A notes reserve crops this geometry;
  // it never changes the pitch, spacing or centering of the original staves.
  const fullTop = contentTop + clefs.above, fullBottom = contentBottom - clefs.below;
  const fullAvailable = fullBottom - fullTop, staffHeight = s.lineSpacing * 4;
  const left = s.marginLeft, right = width - s.marginRight;
  const count = s.mode === 'blocks' ? s.systems * s.blocks.reduce((n, b) => n + b.count, 0) : s.count;
  let needed, gap = 0, positions = [];
  if (s.mode === 'simple') {
    const boundaries = s.group ? Math.floor((count - 1) / s.group) : 0, units = count - 1 + boundaries * (s.spacing - 1);
    needed = count * staffHeight + units;
    gap = units ? Math.max(1, (fullAvailable - count * staffHeight) / units) : 0;
    let y = count === 1 ? (fullTop + fullBottom - staffHeight) / 2 : fullTop;
    for (let i = 0; i < count; i++) { positions.push(y); y += staffHeight + gap * (s.group && (i + 1) % s.group === 0 ? s.spacing : 1); }
  } else {
    const systemHeight = s.blocks.reduce((sum, b, i) => sum + b.count * staffHeight + (b.count - 1) * b.inside + (i < s.blocks.length - 1 ? b.after : 0), 0);
    needed = s.systems * systemHeight + (s.systems - 1) * s.systemGap;
    let y = fullTop + Math.max(0, (fullAvailable - needed) / 2);
    if (count <= 256) for (let system = 0; system < s.systems; system++) {
      for (let i = 0; i < s.blocks.length; i++) {
        const b = s.blocks[i];
        for (let staff = 0; staff < b.count; staff++) { positions.push(y); y += staffHeight + (staff < b.count - 1 ? b.inside : 0); }
        if (i < s.blocks.length - 1) y += b.after;
      }
      if (system < s.systems - 1) y += s.systemGap;
    }
  }
  const fullStaves = positions.map(y => Array.from({ length: 5 }, (_, i) => y + i * s.lineSpacing));
  const notesGap = Math.min(s.marginTop, s.marginBottom);
  const top = notesArea && s.notes.position === 'top' ? notesArea.bottom + notesGap + Math.max(clefs.above, s.thickness / 2) : fullTop;
  const bottom = notesArea && s.notes.position === 'bottom' ? notesArea.top - notesGap - Math.max(clefs.below, s.thickness / 2) : fullBottom;
  const staffIndices = positions.flatMap((y, index) => y + 1e-6 >= top && y + staffHeight <= bottom + 1e-6 ? [index] : []);
  const staves = notesArea ? staffIndices.map(index => fullStaves[index]) : fullStaves;
  const baseNeeded = needed;
  if (notesArea) needed = staves.length ? staves.at(-1)[4] - staves[0][0] : staffHeight;
  const available = bottom - top;
  const valid = header.valid && baseNeeded <= fullAvailable + 1e-6 && right - left > clefs.header && count <= 256 && barlinesFit(s, right - left - clefs.header) && clefsFit(s, fullStaves, clefs) && (!notesArea || staves.length > 0);
  return { ...s, width, height, top, bottom, left, right, available, needed, count, gap, staves,
    ...(notesArea ? { notesArea, notesGap, staffIndices, visibleCount: staves.length, baseNeeded } : {}),
    ...(clefs.header ? { musicLeft: left + clefs.header } : {}), valid,
    overflow: Math.max(0, baseNeeded - fullAvailable, notesArea && !staves.length ? Math.max(staffHeight, needed - available) : 0) };
}
