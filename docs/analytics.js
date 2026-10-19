import { LANGUAGES as SUPPORTED_LANGUAGES } from './i18n.js?v=2.0.0-alpha.5';

const DOMAIN = 'pentagrama.page';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EVENTS = new Set(['print_requested', 'template_applied', 'template_saved', 'share_requested', 'logo_clicked', 'melody_started', 'melody_info_opened']);
const MELODY_IDS = new Set(['joy', 'elise', 'minuet', 'mountain', 'star', 'canon', 'fifth', 'serenade', 'turkish', 'bourree', 'spring', 'ave']);
const LANGUAGES = new Set(Object.keys(SUPPORTED_LANGUAGES));
const CAMPAIGN_KEYS = ['utm_source', 'utm_medium', 'utm_campaign'];

function eventData(name, source = {}) {
  source = source && typeof source === 'object' ? source : {};
  const data = {};
  if (name === 'print_requested') {
    if (['A3', 'A4', 'LETTER'].includes(source.paper)) data.paper = source.paper;
    if (['simple', 'blocks'].includes(source.mode)) data.mode = source.mode;
    if (LANGUAGES.has(source.language)) data.language = source.language;
  }
  if (['template_applied', 'template_saved', 'share_requested'].includes(name)
    && ['current', 'suggested', 'personal'].includes(source.kind)) data.kind = source.kind;
  if (['melody_started', 'melody_info_opened'].includes(name) && MELODY_IDS.has(source.melody)) data.melody = source.melody;
  if (name === 'melody_started' && ['discovery', 'replay', 'next'].includes(source.source)) data.source = source.source;
  return data;
}

// Shared URLs contain user-written block names. Never forward their fragment,
// free-form parameters, page title, template names or other arbitrary properties.
export function sanitizePayload(type, payload) {
  if (type !== 'event' || !payload || !UUID.test(payload.website)) return false;
  if (payload.name && !EVENTS.has(payload.name)) return false;
  let url;
  try { url = new URL(payload.url || '/', `https://${DOMAIN}`); } catch { return false; }
  if (url.hostname !== DOMAIN) return false;
  const campaign = new URLSearchParams();
  for (const key of CAMPAIGN_KEYS) {
    const value = url.searchParams.get(key);
    if (value && /^[a-z0-9_-]{1,64}$/i.test(value)) campaign.set(key, value);
  }
  const safe = {
    website: payload.website, hostname: DOMAIN,
    url: url.pathname + (campaign.size ? `?${campaign}` : ''), title: 'Pentagrama',
  };
  if (typeof payload.language === 'string' && /^[a-z]{2,3}(?:-[a-z0-9]{2,8})*$/i.test(payload.language)) safe.language = payload.language;
  if (typeof payload.screen === 'string' && /^\d{1,5}x\d{1,5}$/.test(payload.screen)) safe.screen = payload.screen;
  try {
    const referrer = new URL(payload.referrer);
    if (['https:', 'http:'].includes(referrer.protocol)) safe.referrer = referrer.origin;
  } catch { /* No referrer is valid for direct visits. */ }
  if (payload.name) { safe.name = payload.name; safe.data = eventData(payload.name, payload.data); }
  return safe;
}

export function createAnalytics(env = globalThis) {
  let pagePreference, configured = false;
  // The switch represents the user's saved choice, not browser-wide signals.
  // A fresh browser has no manual exclusion, even when DNT/GPC blocks tracking.
  function userExcluded() {
    if (pagePreference !== undefined) return pagePreference;
    try { return env.localStorage?.getItem('umami.disabled') === 'true'; } catch { return false; }
  }
  function browserPrivacyEnabled() {
    return env.navigator?.doNotTrack === '1' || env.doNotTrack === '1'
      || env.navigator?.globalPrivacyControl === true;
  }
  function excluded() { return userExcluded() || browserPrivacyEnabled(); }
  function setExcluded(value) {
    pagePreference = Boolean(value);
    try {
      if (value) env.localStorage.setItem('umami.disabled', 'true');
      else env.localStorage.removeItem('umami.disabled');
      return true;
    } catch { return false; }
  }
  function init(websiteId) {
    if (env.location?.hostname !== DOMAIN || !UUID.test(websiteId || '') || excluded()) return false;
    if (configured) return true;
    try {
      env.pentagramaBeforeSend = (type, payload) => excluded() ? false : sanitizePayload(type, payload);
      const script = env.document.createElement('script');
      script.id = 'pentagrama-analytics'; script.async = true;
      script.src = 'https://cloud.umami.is/script.js';
      script.dataset.websiteId = websiteId;
      script.dataset.domains = DOMAIN;
      script.dataset.excludeHash = 'true';
      script.dataset.doNotTrack = 'true';
      script.dataset.beforeSend = 'pentagramaBeforeSend';
      env.document.head.append(script); configured = true;
      return true;
    } catch { return false; }
  }
  function track(name, properties = {}) {
    if (!configured || env.location?.hostname !== DOMAIN || excluded() || !EVENTS.has(name) || typeof env.umami?.track !== 'function') return false;
    try {
      Promise.resolve(env.umami.track(name, eventData(name, properties))).catch(() => {});
      return true;
    } catch { return false; }
  }
  return { init, track, excluded, userExcluded, browserPrivacyEnabled, setExcluded };
}

export const analytics = createAnalytics();
