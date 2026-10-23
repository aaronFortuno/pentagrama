import { normalizePageText } from './engine/page-text-settings.js?v=2.8.1';

// Only presentation choices are defaults. Never copy title/instruction content.
export function textPreferences(value) {
  const normalized = normalizePageText(value);
  return { titleStyle: normalized.titleStyle, instructionsStyle: normalized.instructionsStyle,
    titleAlign: normalized.titleAlign, instructionsAlign: normalized.instructionsAlign,
    footerStyle: normalized.footerStyle, footerAlign: normalized.footerAlign };
}
export function withTextPreferences(settings, preferences) {
  return { ...settings, pageText: { ...settings.pageText, ...textPreferences(preferences) } };
}

// A compact link leaves empty fields unstyled. Their next edit should use this
// browser's defaults, without overriding any formatted content in the link.
export function withEmptyTextPreferences(settings, preferences) {
  const text = normalizePageText(settings.pageText), defaults = textPreferences(preferences);
  for (const field of ['title', 'instructions', 'footer']) if (!text[field].trim()) {
    text[field + 'Style'] = defaults[field + 'Style']; text[field + 'Align'] = defaults[field + 'Align'];
  }
  return { ...settings, pageText: text };
}
