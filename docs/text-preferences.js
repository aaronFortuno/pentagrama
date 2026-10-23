import { normalizePageText } from './engine/page-text-settings.js?v=2.6.0';

// Only presentation choices are defaults. Never copy title/instruction content.
export function textPreferences(value) {
  const normalized = normalizePageText(value);
  return { titleStyle: normalized.titleStyle, instructionsStyle: normalized.instructionsStyle,
    titleAlign: normalized.titleAlign, instructionsAlign: normalized.instructionsAlign };
}
export function withTextPreferences(settings, preferences) {
  return { ...settings, pageText: { ...settings.pageText, ...textPreferences(preferences) } };
}
