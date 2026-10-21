// Frozen from main db130fe (1.17.2), alongside the legacy layout oracle.
// New catalogue content must not silently change the compatibility samples.
import { DEFAULTS } from './v1-layout.mjs';

export const DEFAULT_TEMPLATES = [
  { id: 'blank', key: 'presetBlank', settings: { ...DEFAULTS, group: 0 } },
  { id: 'piano', key: 'presetPiano', settings: { ...DEFAULTS, count: 12, group: 2 } },
  { id: 'choir', key: 'presetChoir', settings: { ...DEFAULTS, count: 12, group: 4, spacing: 2.6 } },
  { id: 'large', key: 'presetLarge', settings: { ...DEFAULTS, count: 6, group: 0, lineSpacing: 3 } },
  { id: 'trio', key: 'presetTrio', settings: { ...DEFAULTS, count: 9, group: 3 } },
  { id: 'choir-piano', key: 'presetChoirPiano', settings: { ...DEFAULTS, mode: 'blocks', systems: 2, systemGap: 18, blocks: [{ label: 'SATB', count: 4, inside: 12, after: 14 }, { label: 'Piano', count: 2, inside: 6, after: 14 }] } },
  { id: 'orchestra', key: 'presetOrchestra', settings: { ...DEFAULTS, paper: 'A3', mode: 'blocks', lineSpacing: 1.6, blocks: [{ label: '', count: 6, inside: 7, after: 12 }, { label: '', count: 5, inside: 8, after: 14 }, { label: '', count: 3, inside: 10, after: 10 }, { label: 'Harp', count: 2, inside: 5, after: 10 }, { label: 'Piano', count: 2, inside: 5, after: 14 }, { label: '', count: 5, inside: 8, after: 14 }] } },
];
