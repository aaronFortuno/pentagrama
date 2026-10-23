import { normalizeSettings } from './settings.js?v=2.8.1';

// Physical sides of one sheet, with a left binding edge on its front.
// Keep the shared template separate from these derived page settings.
export function sheetSides(value) {
  const settings = normalizeSettings(value);
  if (!settings.duplex.enabled) return [{ settings }];
  const back = normalizeSettings({ ...settings,
    topSpace: settings.duplex.firstPageOnly ? 0 : settings.topSpace,
    ...(settings.pageText.firstPageOnly ? { pageText: { ...settings.pageText, title: '', instructions: '', nameDate: false } } : {}),
    ...(settings.duplex.mirrorMargins ? { marginLeft: settings.marginRight, marginRight: settings.marginLeft } : {}),
  });
  return [{ id: 'front', settings, referenceSettings: normalizeSettings(settings) },
    { id: 'back', settings: back, referenceSettings: normalizeSettings(settings) }];
}
