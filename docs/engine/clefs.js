import { CLEF_GLYPHS } from '../vendor/clef-glyphs.js?v=2.3.3';

export const CLEF_TYPES = Object.freeze(['none', 'treble', 'bass', 'alto', 'tenor']);
const definitions = { treble: ['gClef', 3], bass: ['fClef', 1], alto: ['cClef', 2], tenor: ['cClef', 1] };
export function normalizeClefPattern(value, limit) {
  const pattern = Array.isArray(value) ? Array.from(value.slice(0, limit), type => CLEF_TYPES.includes(type) ? type : null) : [];
  while (pattern.at(-1) === null) pattern.pop();
  return pattern;
}
export function clefForStaff(settings, blockIndex, position, index) {
  const c = settings.clefs;
  if (!c.enabled) return 'none';
  if (c.mode === 'uniform') return c.type;
  return (settings.mode === 'blocks' ? settings.blocks[blockIndex].clefs?.[position] : c.pattern[settings.group ? index % settings.group : index]) ?? c.type;
}
export function clefSequence(settings) {
  return settings.mode === 'blocks'
    ? Array.from({ length: settings.systems }, () => settings.blocks.flatMap((block, i) => Array.from({ length: block.count }, (_, n) => clefForStaff(settings, i, n, n)))).flat()
    : Array.from({ length: settings.count }, (_, i) => clefForStaff(settings, 0, settings.group ? i % settings.group : i, i));
}
export function clefExtent(type, spacing) {
  if (type === 'none') return { above: 0, below: 0, width: 0 };
  const [name, anchor] = definitions[type], box = CLEF_GLYPHS[name].bounds;
  return { above: Math.max(0, -(anchor + box.top) * spacing), below: Math.max(0, (anchor + box.bottom - 4) * spacing), width: (box.right - box.left) * spacing };
}
export function clefMetrics(settings) {
  const types = clefSequence(settings), extents = types.map(type => clefExtent(type, settings.lineSpacing));
  const width = Math.max(0, ...extents.map(box => box.width));
  return { types, above: Math.max(0, ...extents.map(box => box.above)), below: Math.max(0, ...extents.map(box => box.below)), header: width ? width + 1.6 * settings.lineSpacing : 0 };
}
export function minimumStaffGap(settings, previous, next) {
  const a = clefExtent(previous, settings.lineSpacing), b = clefExtent(next, settings.lineSpacing);
  return Math.max(1, a.below + b.above + (a.below || b.above ? 0.5 : 0));
}
export function clefsFit(settings, staves, metrics) {
  return staves.every((staff, i) => !i || staff[0] - staves[i - 1][4] + 1e-6 >= minimumStaffGap(settings, metrics.types[i - 1], metrics.types[i]));
}
export function createClefs(layout, systems) {
  const paths = [];
  for (const system of systems) for (const block of system.blocks) for (const staff of block.staves) {
    if (!staff.lines.length || staff.clef === 'none') continue;
    const [name, anchor] = definitions[staff.clef], glyph = CLEF_GLYPHS[name], scale = layout.lineSpacing;
    const x = layout.left + 0.6 * scale - glyph.bounds.left * scale, y = staff.lines[anchor];
    const commands = glyph.commands.map(([operation, ...values]) => [operation, ...values.map((value, index) => value * scale + (index % 2 ? y : x))]);
    paths.push({ id: `${staff.id}/clef`, kind: 'path', role: 'clef', ownerId: staff.id, clef: staff.clef, commands,
      bounds: { left: x + glyph.bounds.left * scale, right: x + glyph.bounds.right * scale, top: y + glyph.bounds.top * scale, bottom: y + glyph.bounds.bottom * scale } });
  }
  return paths;
}
