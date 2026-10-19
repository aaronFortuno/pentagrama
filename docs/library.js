import { DEFAULTS, normalizeSettings } from './layout.js?v=2.0.0-alpha.5';

export const DEFAULT_TEMPLATES = [
  { id: 'blank', key: 'presetBlank', settings: { ...DEFAULTS, group: 0 } },
  { id: 'piano', key: 'presetPiano', settings: { ...DEFAULTS, count: 12, group: 2 } },
  { id: 'choir', key: 'presetChoir', settings: { ...DEFAULTS, count: 12, group: 4, spacing: 2.6 } },
  { id: 'large', key: 'presetLarge', settings: { ...DEFAULTS, count: 6, group: 0, lineSpacing: 3 } },
  { id: 'trio', key: 'presetTrio', settings: { ...DEFAULTS, count: 9, group: 3 } },
  { id: 'choir-piano', key: 'presetChoirPiano', settings: { ...DEFAULTS, mode: 'blocks', systems: 2, systemGap: 18, blocks: [{ label: 'SATB', count: 4, inside: 12, after: 14 }, { label: 'Piano', count: 2, inside: 6, after: 14 }] } },
  { id: 'orchestra', key: 'presetOrchestra', settings: { ...DEFAULTS, paper: 'A3', mode: 'blocks', lineSpacing: 1.6, blocks: [{ label: '', count: 6, inside: 7, after: 12 }, { label: '', count: 5, inside: 8, after: 14 }, { label: '', count: 3, inside: 10, after: 10 }, { label: 'Harp', count: 2, inside: 5, after: 10 }, { label: 'Piano', count: 2, inside: 5, after: 14 }, { label: '', count: 5, inside: 8, after: 14 }] } },
];

// Shared by the editor and public template pages: geometry always comes from
// DEFAULT_TEMPLATES, while instrument labels follow the selected language.
export function suggestedTemplateSettings(template, t) {
  const value = normalizeSettings(template.settings);
  if (template.id === 'orchestra') ['woodwinds', 'brass', 'percussion', 'harp', 'presetPiano', 'strings'].forEach((key, i) => { value.blocks[i].label = t(key); });
  if (template.id === 'choir-piano') value.blocks[1].label = t('presetPiano');
  return value;
}

export function normalizeLibrary(value) {
  const ids = new Set();
  return {
    hidden: Array.isArray(value?.hidden) ? [...new Set(value.hidden)].filter(id => DEFAULT_TEMPLATES.some(t => t.id === id)) : [],
    saved: Array.isArray(value?.saved) ? value.saved.slice(0, 50).filter(t => {
      if (!t || typeof t.id !== 'string' || t.id.length > 100 || ids.has(t.id) || typeof t.name !== 'string' || !t.name.trim()) return false;
      ids.add(t.id); return true;
    }).map(t => ({ id: t.id, name: t.name.trim().slice(0, 80), settings: normalizeSettings(t.settings) })) : [],
  };
}
export function addTemplate(library, template) {
  const clean = normalizeLibrary(library); if (clean.saved.length >= 50) throw new Error('libraryFull');
  return normalizeLibrary({ ...clean, saved: [...clean.saved, template] });
}
export function removeTemplate(library, id, suggested = false) {
  const clean = normalizeLibrary(library);
  return suggested ? normalizeLibrary({ ...clean, hidden: [...clean.hidden, id] }) : { ...clean, saved: clean.saved.filter(t => t.id !== id) };
}
export function restoreDefaults(library) { return { ...normalizeLibrary(library), hidden: [] }; }
