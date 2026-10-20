import { DEFAULTS, normalizeSettings, decodeShareHash } from './layout.js?v=2.3.0';

// A template is a stable starting point, separate from the editable draft and undo history.
export function createResetBaseline(initial = DEFAULTS) {
  let baseline = normalizeSettings(initial);
  const restore = () => normalizeSettings(baseline);
  const capture = value => { baseline = normalizeSettings(value); return restore(); };
  return {
    capture,
    restore,
    fromHash(hash, preferences = {}) {
      // Decode completely before replacing the last valid starting point.
      const value = decodeShareHash(hash.replace(/^#/, ''));
      return capture({ ...value, reference: preferences.reference, source: preferences.source });
    },
  };
}
