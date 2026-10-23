import { DEFAULTS, normalizeSettings } from './layout.js?v=2.7.0';
import { LANGUAGES } from './i18n.js?v=2.7.0';
import { normalizeLibrary } from './library.js?v=2.7.0';
import { normalizeFooterLibrary } from './footer-library.js?v=2.7.0';
import { textPreferences, withTextPreferences } from './text-preferences.js?v=2.7.0';

export const BACKUP_FORMAT = 'pentagrama-user-backup', BACKUP_SCHEMA = 2, BACKUP_MAX_BYTES = 16 * 1024 * 1024;
export const PROFILE_KEYS = Object.freeze({ settings: 'pentagrama.settings.v2', baseline: 'pentagrama.settings-baseline.v1', templates: 'pentagrama.library.v1', footers: 'pentagrama.footers.v1', language: 'pentagrama.language.v1', sidebar: 'pentagrama.sidebar.v1', text: 'pentagrama.text-preferences.v1', excluded: 'umami.disabled' });
export const PROFILE_REVISION_KEY = 'pentagrama.profile-revision.v1';
const sections = ['page-settings', 'staves-settings', 'notes-settings', 'notation-settings', 'footer-settings', 'code-details'];
const language = value => value === 'auto' || Object.hasOwn(LANGUAGES, value) ? value : 'auto';
const sidebar = value => value === null || sections.includes(value) ? value : 'staves-settings';
const fail = () => { throw new Error('backupInvalid'); };
const ordered = value => Array.isArray(value) ? value.map(ordered) : value && typeof value === 'object' ? Object.fromEntries(Object.keys(value).sort().map(key => [key, ordered(value[key])])) : value;
const same = (a, b) => JSON.stringify(ordered(a)) === JSON.stringify(ordered(b));
function safe(value, depth = 0) {
  if (depth > 32 || Array.isArray(value) && value.length > 512) fail();
  if (!value || typeof value !== 'object') return;
  for (const key of Object.keys(value)) { if (['__proto__', 'prototype', 'constructor'].includes(key)) fail(); safe(value[key], depth + 1); }
}
function normalizeProfile(value) {
  const p = value.preferences || {};
  return { settings: normalizeSettings(value.settings), baseline: normalizeSettings(value.baseline), templates: normalizeLibrary(value.templates), footers: normalizeFooterLibrary(value.footers),
    preferences: { language: language(p.language), sidebar: sidebar(p.sidebar), text: textPreferences(p.text), analyticsExcluded: p.analyticsExcluded === true } };
}
export function readUserProfile(storage, overrides = {}) {
  const read = (key, fallback) => { try { const raw = storage.getItem(key); return raw === null ? fallback : JSON.parse(raw); } catch { return fallback; } };
  const text = textPreferences(read(PROFILE_KEYS.text, {})), defaults = withTextPreferences(DEFAULTS, text);
  let excluded = false; try { excluded = storage.getItem(PROFILE_KEYS.excluded) === 'true'; } catch {}
  return normalizeProfile({ settings: read(PROFILE_KEYS.settings, read('pentagrama.settings.v1', defaults)), baseline: read(PROFILE_KEYS.baseline, defaults), templates: read(PROFILE_KEYS.templates, {}), footers: read(PROFILE_KEYS.footers, []),
    preferences: { language: read(PROFILE_KEYS.language, 'auto'), sidebar: read(PROFILE_KEYS.sidebar, 'staves-settings'), text, analyticsExcluded: excluded }, ...overrides });
}
export function createUserBackup(profile, appVersion, now = new Date()) {
  return { format: BACKUP_FORMAT, schemaVersion: BACKUP_SCHEMA, appVersion, createdAt: now.toISOString(), data: normalizeProfile(profile) };
}
export function parseUserBackup(text) {
  if (typeof text !== 'string' || new TextEncoder().encode(text).length > BACKUP_MAX_BYTES) fail();
  try {
    const value = JSON.parse(text.replace(/^\uFEFF/, '')); safe(value);
    if (!value || value.format !== BACKUP_FORMAT) fail();
    if (![1, BACKUP_SCHEMA].includes(value.schemaVersion)) { if (Number.isInteger(value.schemaVersion) && value.schemaVersion > BACKUP_SCHEMA) throw new Error('backupUnsupported'); fail(); }
    if (Object.keys(value).sort().join() !== 'appVersion,createdAt,data,format,schemaVersion' || !/^\d+\.\d+\.\d+(?:-[\w.]+)?$/.test(value.appVersion) || typeof value.createdAt !== 'string' || !Number.isFinite(Date.parse(value.createdAt)) || !value.data || typeof value.data !== 'object') fail();
    // Version 1 predates footer typography. Add only the two new defaults;
    // every pre-existing field still undergoes the strict, lossless comparison.
    if (value.schemaVersion === 1) {
      const defaults = textPreferences({});
      const extend = text => { if (text && typeof text === 'object' && !Array.isArray(text)) for (const key of ['footerStyle', 'footerAlign']) if (!Object.hasOwn(text, key)) text[key] = structuredClone(defaults[key]); };
      extend(value.data.settings?.pageText); extend(value.data.baseline?.pageText);
      for (const item of value.data.templates?.saved || []) extend(item.settings?.pageText);
      for (const item of value.data.footers || []) extend(item);
      extend(value.data.preferences?.text); value.schemaVersion = BACKUP_SCHEMA;
    }
    const profile = normalizeProfile(value.data);
    // Never silently truncate a template, discard a damaged logo or clamp a value.
    if (!same(profile, value.data)) fail();
    return { ...value, data: profile };
  } catch (error) { if (error.message === 'backupUnsupported') throw error; fail(); }
}
export function restoreUserBackup(storage, backup, revision = crypto.randomUUID()) {
  const verified = parseUserBackup(JSON.stringify(backup)), profile = verified.data;
  const keys = [...Object.values(PROFILE_KEYS), PROFILE_REVISION_KEY], before = new Map();
  try {
    for (const key of keys) before.set(key, storage.getItem(key));
    // Check write access before removing anything, including a full storage area.
    const probe = keys.find(key => before.get(key) !== null);
    if (probe) storage.setItem(probe, before.get(probe));
    else { storage.setItem(PROFILE_REVISION_KEY, 'probe'); storage.removeItem(PROFILE_REVISION_KEY); }
  } catch { throw new Error('backupStorageError'); }
  // Restoring a file never re-enables analytics that this browser had excluded.
  profile.preferences.analyticsExcluded ||= before.get(PROFILE_KEYS.excluded) === 'true';
  const values = new Map([
    [PROFILE_KEYS.settings, JSON.stringify(profile.settings)], [PROFILE_KEYS.baseline, JSON.stringify(profile.baseline)],
    [PROFILE_KEYS.templates, JSON.stringify(profile.templates)], [PROFILE_KEYS.footers, JSON.stringify(profile.footers)],
    [PROFILE_KEYS.language, JSON.stringify(profile.preferences.language)], [PROFILE_KEYS.sidebar, JSON.stringify(profile.preferences.sidebar)],
    [PROFILE_KEYS.text, JSON.stringify(profile.preferences.text)], [PROFILE_KEYS.excluded, profile.preferences.analyticsExcluded ? 'true' : null],
    [PROFILE_REVISION_KEY, revision],
  ]);
  try {
    for (const key of keys) storage.removeItem(key);
    for (const [key, value] of values) if (value !== null) storage.setItem(key, value);
  } catch {
    try { for (const key of keys) storage.removeItem(key); for (const [key, value] of before) if (value !== null) storage.setItem(key, value); }
    catch { const error = new Error('backupRecoveryError'); error.previousProfile = readUserProfile({ getItem: key => before.get(key) ?? null }); throw error; }
    throw new Error('backupStorageError');
  }
  return profile;
}
