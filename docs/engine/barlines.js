// Physical bar boundaries and connectors belong to the scene, independently of
// SVG/PDF. A measure ends at each boundary; the last one closes the right edge.
const doubleGap = bars => Math.max(0.8, bars.thickness * 2 + 0.2);
export const barlineThickness = settings => settings.barlines.thicknessMode === 'staff' ? settings.thickness : settings.barlines.thickness;
const effectiveBars = settings => ({ ...settings.barlines, thickness: barlineThickness(settings) });
export const minimumMeasureWidth = settings => { const bars = effectiveBars(settings); return (bars.style === 'double' ? doubleGap(bars) : 0) + bars.thickness + 1; };
export const barlinesFit = (settings, width) => !settings.barlines.enabled || width + 1e-6 >= settings.barlines.measures * minimumMeasureWidth(settings);

export function createBarlines(layout, systems) {
  const bars = effectiveBars(layout), left = layout.musicLeft ?? layout.left;
  if (!bars.enabled || !barlinesFit(layout, layout.right - left)) return [];
  const elements = [];
  const dash = style => style === 'dashed' ? [1, 0.7] : [];
  for (let measure = 1; measure <= bars.measures; measure++) {
    const edge = left + (layout.right - left) * measure / bars.measures;
    const offsets = bars.style === 'double' ? [-doubleGap(bars) / 2, doubleGap(bars) / 2] : [0];
    // Keep the complete closing stroke inside the configured right margin.
    const center = measure === bars.measures ? layout.right - bars.thickness / 2 - offsets.at(-1) : edge;
    for (const system of systems) for (const block of system.blocks) {
      const staves = block.staves.filter(staff => staff.lines.length);
      for (let index = 0; index < staves.length; index++) {
        const staff = staves[index];
        const add = (part, y1, y2, pattern) => offsets.forEach((offset, stroke) => elements.push({
          id: `${staff.id}/bars/bar-${measure}/${part}-${stroke + 1}`, kind: 'line', role: 'barline',
          ownerId: part === 'staff' ? staff.id : block.id, measure, part,
          x1: center + offset, x2: center + offset, y1, y2, stroke: '#000', strokeWidth: bars.thickness, dash: pattern,
        }));
        add('staff', staff.lines[0], staff.lines.at(-1), dash(bars.style));
        if (index < staves.length - 1 && bars.connect !== 'none') add('connection', staff.lines.at(-1), staves[index + 1].lines[0], dash(bars.connect));
      }
    }
  }
  return elements;
}
