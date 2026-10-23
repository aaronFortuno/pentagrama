// The notes area shares the physical coordinate system of the music, in mm.
export const DEFAULT_NOTES = Object.freeze({ enabled: false, position: 'bottom', percent: 40, pattern: 'dots', spacing: 8, intensity: 2 });
export const notesGray = (pattern, intensity = DEFAULT_NOTES.intensity) => (pattern === 'dots' ? 185 : pattern === 'ruled' ? 190 : 205) - (intensity - 1) * 30;
export function normalizeNotes(value = {}) {
  if (!value || typeof value !== 'object') value = {};
  const number = (v, fallback, min, max) => Math.round(Math.min(max, Math.max(min, v !== null && v !== '' && Number.isFinite(Number(v)) ? Number(v) : fallback)));
  const pattern = ['blank', 'ruled', 'grid', 'dots'].includes(value.pattern) ? value.pattern : 'dots';
  return { enabled: value.enabled === true, position: value.position === 'top' ? 'top' : 'bottom',
    percent: Math.round(number(value.percent, 40, 10, 70) / 5) * 5, pattern, spacing: number(value.spacing, pattern === 'ruled' ? 10 : 8, pattern === 'ruled' ? 8 : 6, pattern === 'ruled' ? 12 : 10), intensity: number(value.intensity, DEFAULT_NOTES.intensity, 1, 5) };
}

export function createNotes(layout, pageId) {
  const area = layout.notesArea, { pattern, spacing, intensity } = layout.notes;
  if (!area || pattern === 'blank' || area.right <= area.left || area.bottom <= area.top) return [];
  const elements = [], ownerId = pageId;
  const add = element => elements.push({ id: `${pageId}/notes/mark-${elements.length + 1}`, ownerId, role: `notes-${pattern}`, ...element });
  const xs = [], ys = [];
  for (let x = area.left + spacing / 2; x <= area.right - spacing / 2 + 1e-6; x += spacing) xs.push(x);
  for (let y = area.top + spacing / 2; y <= area.bottom - spacing / 2 + 1e-6; y += spacing) ys.push(y);
  const gray = notesGray(pattern, intensity);
  if (pattern === 'dots') for (const y of ys) for (const x of xs) add({ kind: 'circle', x, y, radius: .16, gray });
  else {
    for (const y of ys) add({ kind: 'line', x1: area.left, x2: area.right, y1: y, y2: y, strokeWidth: .08, gray });
    if (pattern === 'grid') for (const x of xs) add({ kind: 'line', x1: x, x2: x, y1: area.top, y2: area.bottom, strokeWidth: .08, gray });
  }
  return elements;
}
