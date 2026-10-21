import { DEFAULTS, normalizeSettings, encodeReference, decodeReference, encodeShareHash, createLayout, fitSettings, renderSheet } from './layout.js?v=2.3.5';
import { MIN_ZOOM, MAX_ZOOM, spreadMode, spreadView } from './preview.js?v=2.3.5';
import { LANGUAGES, orderedLanguages, detectLanguage, translate } from './i18n.js?v=2.3.5';
import { DEFAULT_TEMPLATES, suggestedTemplateSettings, normalizeLibrary, storedTemplatePresence, addTemplate, removeTemplate, restoreDefaults } from './library.js?v=2.3.5';
import { iconMarkup, renderIcons } from './icons.js?v=2.3.5';
import { animateReflow, openDialog, closeDialog, showPopover, bindAnimatedDetails } from './motion.js?v=2.3.5';
import { bindTouchRange } from './touch-range.js?v=2.3.5';
import { analytics, configurationMetrics } from './analytics.js?v=2.3.5';
import { createLogoNote } from './logo-note.js?v=2.3.5';
import { connectLogoSound, createGlockenspiel } from './glockenspiel.js?v=2.3.5';
import { createMelodyDiscovery } from './melody-discovery.js?v=2.3.5';
import { createSettingsHistory, historyShortcut } from './settings-history.js?v=2.3.5';
import { createResetBaseline } from './settings-baseline.js?v=2.3.5';
import { enhanceNumberInputs } from './number-input.js?v=2.3.5';
import { bindSelectControl } from './select-control.js?v=2.3.5';
import { languageFromURL, languageURL } from './language-routing.js?v=2.3.5';
import { bindSiteDialogs } from './site-chrome.js?v=2.3.5';
import { bindMarginsControl, bookMargins } from './margins-control.js?v=2.3.5';
import { bindNotesControl } from './notes-control.js?v=2.3.5';
import { bindPageTextControl } from './page-text-control.js?v=2.3.5';
import { bindClefsControl } from './clefs-control.js?v=2.3.5';
import { bindBarlinesControl } from './barlines-control.js?v=2.3.5';
import { bindMobileWorkspace } from './mobile-workspace.js?v=2.3.5';
import { createDocument } from './engine/document.js?v=2.3.5';
import { renderSvgPage } from './engine/svg.js?v=2.3.5';
import { renderPrintDocument } from './engine/print.js?v=2.3.5';
import { RELEASE, RELEASE_DATES } from './release.js?v=2.3.5';

const $ = id => document.getElementById(id);
const SETTINGS_KEY = 'pentagrama.settings.v2', BASELINE_KEY = 'pentagrama.settings-baseline.v1', LIBRARY_KEY = 'pentagrama.library.v1', LANGUAGE_KEY = 'pentagrama.language.v1', SIDEBAR_KEY = 'pentagrama.sidebar.v1';
function read(key, fallback) { try { const value = localStorage.getItem(key); return value ? JSON.parse(value) : fallback; } catch { return fallback; } }
function write(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch { return false; } }
function editorSettings(value) { return bookMargins(normalizeSettings(value)); }
let settings = editorSettings(read(SETTINGS_KEY, read('pentagrama.settings.v1', DEFAULTS)));
const resetBaseline = createResetBaseline(editorSettings(read(BASELINE_KEY, DEFAULTS)));
let handledHash;
let library = normalizeLibrary(read(LIBRARY_KEY, {}));
let languageChoice = read(LANGUAGE_KEY, 'auto');
if (!Object.hasOwn(LANGUAGES, languageChoice)) languageChoice = 'auto';
const siteRoot = new URL('./', import.meta.url);
// Keep relative portraits and license links stable after an in-place language switch.
document.querySelector('base').href = siteRoot.href;
const preferredLanguage = () => detectLanguage(languageChoice, navigator.languages || [navigator.language]);
let language = languageFromURL(location.href, siteRoot) || preferredLanguage();
let templatesOpen = false, languageOpen = false, toastTimer, layout, score;
let melodyDiscovery, mobileWorkspace;
let settingsHistory, historyGroup;
let previewZoom = MIN_ZOOM, previewPan = { x: 0, y: 0 }, previewSize = '', drag;
const noticeTimers = new Map();
const zoomModifier = /Mac|iPhone|iPad/i.test(navigator.platform) ? '⌘' : 'Ctrl';
const t = (key, variables) => translate(language, key, { version: RELEASE.version, ...variables });
const number = value => new Intl.NumberFormat(language, { maximumFractionDigits: 2 }).format(value);
const staffCount = count => t(count === 1 ? 'oneStaff' : 'staffCount', { n: count });
const paperName = paper => paper === 'LETTER' ? t('paperLetter') : paper;

function toast(message) {
  $('toast').textContent = message; $('toast').classList.add('visible');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => $('toast').classList.remove('visible'), 3500);
}
function translatePage() {
  hideZoomHint();
  document.documentElement.lang = language; document.title = t('title');
  document.querySelector('meta[name=description]').content = t('seoDescription');
  document.querySelector('link[rel=canonical]').href = new URL(languageFromURL(location.href, siteRoot) ? `${language}/` : './', document.querySelector('link[hreflang=x-default]').href).href;
  document.querySelectorAll('[data-i18n]').forEach(element => { element.textContent = t(element.dataset.i18n); });
  document.querySelectorAll('[data-aria]').forEach(element => {
    element.setAttribute('aria-label', t(element.dataset.aria));
    if (element.matches('button.icon-button, .stepper button')) element.dataset.tooltip = t(element.dataset.aria);
  });
  document.querySelectorAll('[data-title]').forEach(element => { element.dataset.tooltip = t(element.dataset.title); });
  document.querySelectorAll('[data-placeholder]').forEach(element => { element.placeholder = t(element.dataset.placeholder); });
  document.querySelectorAll('#version-dialog time[datetime]').forEach(time => {
    time.textContent = RELEASE_DATES[language]?.[time.getAttribute('datetime')] ?? time.textContent;
  });
  $('language-menu').replaceChildren();
  for (const [code, label] of orderedLanguages(language)) {
    const button = node('a'); button.href = languageURL(code, location.href, siteRoot).href; button.dataset.language = code; button.lang = code; button.hreflang = code; button.tabIndex = -1;
    button.setAttribute('role', 'menuitemradio'); button.setAttribute('aria-checked', String(code === language));
    const check = node('span'); check.innerHTML = iconMarkup('check');
    button.append(node('span', '', label), check); $('language-menu').append(button);
  }
  $('language-button').dataset.tooltip = `${t('language')} · ${LANGUAGES[language]}`;
  $('template-catalog-link').href = new URL(`${language}/templates/`, siteRoot).href;
  melodyDiscovery?.refresh();
  mobileWorkspace?.refresh();
  enhanceNumberInputs(document.querySelector('.settings'), t);
}
function setValue(id, value) { if ($(id).value !== String(value)) $(id).value = value; }
const measurements = [['thickness', 'thickness-value', 'thickness', 'mm'], ['line-spacing', 'line-spacing-value', 'lineSpacing', 'mm'], ['group-spacing', 'spacing-value', 'spacing', '×'], ['top-space', 'top-space-value', 'topSpace', 'mm']];
function bindNumber(id, key) {
  $(id).addEventListener('input', event => { if (event.target.value !== '' && event.target.validity.valid) update(key, Number(event.target.value)); });
  $(id).addEventListener('change', event => { if (event.target.value !== '') update(key, Number(event.target.value)); event.target.value = settings[key]; });
  $(id).addEventListener('blur', event => { event.target.value = settings[key]; });
}
function updateRange(element) { element.style.setProperty('--progress', `${(Number(element.value) - Number(element.min)) / (Number(element.max) - Number(element.min)) * 100}%`); }
function fitPreview() {
  if (!score) return;
  const mode = spreadMode({ width: window.innerWidth, height: window.innerHeight });
  const size = score.pages.map(page => page.frame.width + 'x' + page.frame.height).join(':') + ':' + mode;
  if (previewSize !== size) { previewZoom = MIN_ZOOM; previewPan = { x: 0, y: 0 }; previewSize = size; }
  const stage = $('paper-stage'), style = getComputedStyle(stage);
  const width = stage.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
  const height = stage.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom);
  const fitWidth = mode === 'peek';
  const labelHeight = score.pages.length > 1 ? 22 : 0;
  const view = spreadView(score.pages.map(page => page.frame), { width, height }, previewZoom, previewPan, { mode, fitWidth, labelHeight });
  previewPan = { x: view.x, y: view.y };
  const spread = $('preview-spread');
  spread.style.width = view.width + 'px'; spread.style.height = view.height + 'px';
  spread.style.left = parseFloat(style.paddingLeft) + view.left + 'px';
  spread.style.top = parseFloat(style.paddingTop) + view.top + 'px';
  view.pages.forEach((frame, index) => {
    const paper = $(index ? 'preview-back' : 'preview-paper');
    for (const key of ['left', 'top', 'width', 'height']) paper.style[key] = frame[key] + 'px';
    const label = $(index ? 'preview-back-label' : 'preview-front-label');
    const labelLeft = Math.max(frame.left, -view.left);
    const labelWidth = Math.max(0, Math.min(frame.left + frame.width, width - view.left) - labelLeft);
    label.hidden = score.pages.length === 1 || labelWidth < 90;
    label.style.left = labelLeft + 'px'; label.style.top = frame.top - labelHeight + 'px'; label.style.width = labelWidth + 'px';
  });
  const binding = $('preview-binding'); binding.hidden = score.pages.length === 1;
  if (!binding.hidden) {
    const front = view.pages[0], back = view.pages[1], edge = back.left + back.width;
    binding.style.left = edge - 12 + 'px'; binding.style.top = front.top + 'px';
    binding.style.width = front.left - edge + 24 + 'px'; binding.style.height = front.height + 'px';
  }
  $('book-view-label').hidden = score.pages.length === 1 || mode !== 'row';
  stage.dataset.zoomed = String(view.canPan); stage.dataset.spread = score.pages.length > 1 ? mode : 'single';
  const resetKey = fitWidth ? score.pages.length > 1 ? 'previewFitSides' : 'previewFitWidth' : score.pages.length > 1 ? 'previewFitBook' : 'previewReset';
  $('zoom-reset').dataset.aria = resetKey; $('zoom-reset').dataset.title = resetKey;
  $('zoom-reset').setAttribute('aria-label', t(resetKey)); $('zoom-reset').dataset.tooltip = t(resetKey);
  $('zoom-value').textContent = number(Math.round(previewZoom * 100)) + '%';
  document.querySelector('.zoom-controls').dataset.orientation = settings.orientation;
  $('zoom-out').disabled = previewZoom <= MIN_ZOOM; $('zoom-in').disabled = previewZoom >= MAX_ZOOM;
}
function zoomPreview(value) {
  hideZoomHint();
  const next = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, value));
  const ratio = next / previewZoom;
  previewPan = next === MIN_ZOOM ? { x: 0, y: 0 } : { x: previewPan.x * ratio, y: previewPan.y * ratio };
  previewZoom = next; fitPreview(); showNotice('zoom-value', 1800);
}
function hideNotice(id) { clearTimeout(noticeTimers.get(id)); $(id).classList.remove('visible'); $(id).setAttribute('aria-hidden', 'true'); }
function showNotice(id, duration) {
  clearTimeout(noticeTimers.get(id)); $(id).classList.add('visible'); $(id).setAttribute('aria-hidden', 'false');
  noticeTimers.set(id, setTimeout(() => hideNotice(id), duration));
}
function hideZoomHint() { hideNotice('zoom-hint'); }
function showZoomHint() {
  const hint = $('zoom-hint');
  if (!hint.classList.contains('visible')) hint.textContent = t('scrollZoomHint', { key: zoomModifier });
  showNotice('zoom-hint', 2200);
}
function node(tag, className, text) { const element = document.createElement(tag); if (className) element.className = className; if (text !== undefined) element.textContent = text; return element; }
function icon(name, title, action, index) { const button = node('button', 'icon-button'); button.innerHTML = iconMarkup(name); button.type = 'button'; button.dataset.tooltip = title; button.setAttribute('aria-label', title); button.dataset.action = action; button.dataset.index = index; return button; }

function renderBlocks() {
  $('block-list').replaceChildren();
  settings.blocks.forEach((block, index) => {
    const card = node('div', 'block-card'), heading = node('div', 'block-heading');
    const name = node('input'); name.type = 'text'; name.value = block.label; name.maxLength = 60; name.placeholder = t('block', { n: index + 1 }); name.setAttribute('aria-label', `${t('blockName')} ${index + 1}`); name.dataset.field = 'label'; name.dataset.index = index;
    const up = icon('arrow-up', t('moveUp'), 'up', index), down = icon('arrow-down', t('moveDown'), 'down', index), remove = icon('trash', t('remove'), 'remove', index);
    up.disabled = index === 0; down.disabled = index === settings.blocks.length - 1; remove.disabled = settings.blocks.length === 1;
    heading.append(name, up, down, remove); card.append(heading);
    const fields = node('div', 'block-fields');
    for (const [key, labelKey, shortKey, max] of [['count', 'blockCount', 'blockCount', 32], ['inside', 'inside', 'insideShort', 40], ['after', 'after', 'afterShort', 60]]) {
      const field = node('div', 'block-field'), label = node('label', '', t(shortKey)), input = node('input');
      input.id = `block-${index}-${key}`; label.htmlFor = input.id; label.dataset.tooltip = t(labelKey);
      input.type = 'number'; input.min = 1; input.max = max; input.step = key === 'count' ? '1' : 'any'; input.dataset.increment = '1'; input.inputMode = key === 'count' ? 'numeric' : 'decimal';
      if (key !== 'count') input.dataset.unit = 'mm';
      input.value = block[key]; input.dataset.field = key; input.dataset.index = index;
      input.setAttribute('aria-label', `${t('block', { n: index + 1 })}: ${t(labelKey)}`);
      if (key === 'after' && index === settings.blocks.length - 1) input.disabled = true;
      field.append(label, input); fields.append(field);
    }
    card.append(fields); $('block-list').append(card);
  });
  $('add-block').disabled = settings.blocks.length >= 24;
}

function updateBlockFields() {
  $('block-list').querySelectorAll('.block-card').forEach((card, index) => {
    card.querySelectorAll('.block-fields input').forEach(input => {
      const disabled = input.dataset.field === 'inside' && settings.blocks[index].count === 1 || input.dataset.field === 'after' && index === settings.blocks.length - 1;
      input.disabled = disabled; input.closest('.block-field').classList.toggle('inactive', disabled);
    });
  });
}

function templateSettings(template, suggested) {
  return suggested ? suggestedTemplateSettings(template, t, language) : normalizeSettings(template.settings);
}
function renderLibrary(animate = true) { const change = () => {
  const saved = $('saved-templates'), suggested = $('suggested-templates'); saved.replaceChildren(); suggested.replaceChildren();
  $('saved-section').hidden = !library.saved.length;
  const visibleSuggested = DEFAULT_TEMPLATES.filter(template => !library.hidden.includes(template.id));
  $('suggested-title').hidden = !library.saved.length || !visibleSuggested.length;
  $('empty-library').hidden = library.saved.length > 0 || visibleSuggested.length > 0;
  let detailIndex = 0;
  function card(template, isSuggested) {
    const name = isSuggested ? t(template.key) : template.name, s = templateSettings(template, isSuggested), l = createLayout(s);
    const wrapper = node('div', 'template-card'), load = node('button', 'template-load'); load.type = 'button'; load.dataset.action = 'load'; load.dataset.id = template.id; load.dataset.suggested = String(isSuggested); load.setAttribute('aria-label', name);
    wrapper.dataset.motionKey = `${isSuggested ? 'suggested' : 'saved'}-${template.id}`;
    const thumbnail = node('span', 'template-thumb'); thumbnail.setAttribute('aria-hidden', 'true'); thumbnail.innerHTML = renderSheet({ ...s, reference: false, source: false }).replace('aria-hidden="true">', 'aria-hidden="true"><rect width="100%" height="100%" fill="#fff"/>');
    if (s.notes.enabled) thumbnail.classList.add('template-thumb--whole');
    const copy = node('span', 'template-copy'), detail = node('span', 'template-description', `${paperName(s.paper)} · ${staffCount(l.visibleCount ?? l.count)} · ${number(s.lineSpacing)} mm`);
    detail.id = `template-details-${detailIndex++}`; load.setAttribute('aria-describedby', detail.id); copy.append(node('span', 'template-name', name), detail);
    load.append(thumbnail, copy);
    const actions = node('div', 'template-actions'), share = icon('share-2', `${t('share')}: ${name}`, 'share', 0), remove = icon('trash', `${t('remove')}: ${name}`, 'delete', 0);
    for (const button of [share, remove]) { button.dataset.id = template.id; button.dataset.suggested = String(isSuggested); }
    actions.append(share, remove); wrapper.append(load, actions); return wrapper;
  }
  library.saved.forEach(template => saved.append(card(template, false)));
  visibleSuggested.forEach(template => suggested.append(card(template, true)));
}; if (animate && templatesOpen) animateReflow($('templates-library'), change); else change(); }

function render({ blocks = false, templates = false, record = true } = {}) {
  settings = editorSettings(settings);
  if (settings.pageText.nameDate) settings.pageText.language = language;
  score = createDocument(settings);
  const page = score.pages[0]; layout = page.layout;
  const visibleCount = layout.visibleCount ?? layout.count;
  if (record) settingsHistory?.record(settings, { group: historyGroup });
  $('undo-button').disabled = !settingsHistory?.canUndo; $('redo-button').disabled = !settingsHistory?.canRedo;
  setValue('paper-size', settings.paper); setValue('staff-count', settings.count);
  document.querySelector('label[for=staff-count]').textContent = t(settings.notes.enabled ? 'baseStaves' : 'blockCount');
  for (const [id, key] of [['systems', 'systems'], ['system-gap', 'systemGap']]) if (document.activeElement !== $(id)) setValue(id, settings[key]);
  for (const [rangeId, valueId, key, unit] of measurements) {
    setValue(rangeId, settings[key]);
    if (document.activeElement !== $(valueId)) setValue(valueId, settings[key]);
    for (const id of [rangeId, valueId]) $(id).setAttribute('aria-valuetext', `${number(settings[key])} ${unit}`);
    updateRange($(rangeId));
  }
  $('portrait-button').setAttribute('aria-pressed', String(settings.orientation === 'portrait')); $('landscape-button').setAttribute('aria-pressed', String(settings.orientation === 'landscape'));
  $('simple-mode').setAttribute('aria-pressed', String(settings.mode === 'simple')); $('blocks-mode').setAttribute('aria-pressed', String(settings.mode === 'blocks'));
  $('simple-controls').hidden = settings.mode !== 'simple'; $('blocks-controls').hidden = settings.mode !== 'blocks';
  $('decrease-count').disabled = settings.count <= 1; $('increase-count').disabled = settings.count >= 64;
  $('group-size').replaceChildren(new Option(t('noGroup'), '0'));
  for (let i = 2; i < settings.count; i++) $('group-size').add(new Option(t('groupEvery', { n: i }), String(i)));
  $('group-size').value = settings.group; $('group-size').disabled = settings.count < 3; $('group-button').disabled = settings.count < 3;
  if (settings.mode !== 'simple' || settings.count < 3) groupControl.close();
  $('group-spacing-control').hidden = !settings.group; $('system-gap').disabled = settings.systems === 1; $('system-gap-field').hidden = settings.systems === 1;
  $('show-reference').checked = settings.reference; $('show-source').checked = settings.source; $('current-reference').value = encodeReference(settings);
  $('toggle-duplex').setAttribute('aria-pressed', String(settings.duplex.enabled));
  $('duplex-count').textContent = settings.duplex.enabled ? '2' : '1';
  $('toggle-duplex').dataset.tooltip = t(settings.duplex.enabled ? 'twoSides' : 'oneSide');
  for (const id of ['preview-front-label', 'preview-back-label']) $(id).hidden = !settings.duplex.enabled;
  $('first-page-option').hidden = !settings.duplex.enabled;
  $('first-page-only').checked = settings.duplex.firstPageOnly;
  for (let index = 0; index < 2; index++) {
    const paper = $(index ? 'preview-back' : 'preview-paper'), face = score.pages[index];
    paper.hidden = !face; paper.innerHTML = face ? renderSvgPage(face) : '';
    if (face) paper.setAttribute('aria-label', (settings.duplex.enabled ? t(index ? 'backSide' : 'frontSide') + ' · ' : '') + paperName(settings.paper) + ' · ' + staffCount(face.layout.visibleCount ?? face.layout.count) + ' · ' + t('lineSpacing') + ': ' + number(settings.lineSpacing) + ' mm' + (face.settings.topSpace ? ' · ' + t('topSpace') + ': ' + number(face.settings.topSpace) + ' mm' : '') + (settings.barlines.enabled ? ' · ' + t('measuresPerStaff') + ': ' + number(settings.barlines.measures) : '') + (settings.clefs.enabled ? ' · ' + t('clefs') + ': ' + (settings.clefs.mode === 'uniform' ? t('clef_' + settings.clefs.type) : t('clefPattern')) : ''));
  }
  $('print-root').innerHTML = score.valid ? renderPrintDocument(score) : '';
  const grouping = settings.mode === 'blocks' ? t('blocks') : settings.group ? t('groupEvery', { n: settings.group }) : t('none');
  $('layout-summary').textContent = `${staffCount(visibleCount)} · ${grouping} · ${number(settings.thickness)} mm`;
  $('layout-summary').dataset.tooltip = $('layout-summary').textContent;
  $('paper-dimensions').textContent = `${paperName(settings.paper)} · ${number(layout.width)} × ${number(layout.height)} mm${settings.duplex.enabled ? ' · ' + t('twoSides') : ''}`;
  $('page-settings-value').textContent = `${paperName(settings.paper)} · ${t(settings.orientation)}${settings.duplex.enabled ? ' · 2' : ''}`;
  $('staves-settings-value').textContent = visibleCount !== layout.count ? `${number(visibleCount)} / ${number(layout.count)}` : number(layout.count);
  $('staves-settings-value').dataset.tooltip = `${staffCount(visibleCount)} · ${grouping}`;
  $('notation-settings-value').textContent = t(settings.clefs.enabled || settings.barlines.enabled ? 'settingsNotationOn' : 'settingsNotationOff');
  $('layout-warning').hidden = score.valid; $('print-button').disabled = !score.valid;
  $('fit-button').disabled = !createDocument(fitSettings(settings)).valid;
  document.documentElement.style.setProperty('--page-width', `${layout.width}mm`); document.documentElement.style.setProperty('--page-height', `${layout.height}mm`);
  $('print-page-style').textContent = `@page{size:${layout.width}mm ${layout.height}mm;margin:0}`;
  $('workspace').dataset.templatesOpen = String(templatesOpen); $('templates-panel').inert = !templatesOpen; $('templates-panel').setAttribute('aria-hidden', String(!templatesOpen)); $('toggle-templates').setAttribute('aria-expanded', String(templatesOpen));
  if (blocks) renderBlocks(); updateBlockFields(); if (templates) renderLibrary(false);
  marginsControl.refresh(); barlinesControl.refresh(); clefsControl.refresh(); pageTextControl.refresh(); notesControl.refresh(); groupControl.refresh(); enhanceNumberInputs(document.querySelector('.settings'), t); paperControl.refresh();
  write(SETTINGS_KEY, settings); write(BASELINE_KEY, resetBaseline.restore()); fitPreview();
}

function setTemplatesOpen(value) {
  if (value) { setLanguageOpen(false); mobileWorkspace?.close(); }
  templatesOpen = value; render({ templates: value });
  if (value) $('close-templates').focus({ preventScroll: true });
}
function setLanguageOpen(value, focus = 'selected') {
  if (value === languageOpen) return;
  if (value) { paperControl.close(); barlinesControl.close(); clefsControl.close(); notesControl.close(); groupControl.close(); }
  languageOpen = value; $('language-button').setAttribute('aria-expanded', String(value)); showPopover($('language-menu'), value);
  if (value) {
    const buttons = [...$('language-menu').querySelectorAll('[data-language]')];
    focusLanguage(focus === 'first' ? buttons[0] : focus === 'last' ? buttons.at(-1) : buttons.find(button => button.dataset.language === language));
  }
}
function focusLanguage(button) {
  button.focus({ preventScroll: true });
  const menu = $('language-menu');
  if (button.offsetTop < menu.scrollTop) menu.scrollTop = button.offsetTop;
  else if (button.offsetTop + button.offsetHeight > menu.scrollTop + menu.clientHeight) menu.scrollTop = button.offsetTop + button.offsetHeight - menu.clientHeight;
}
function closeLanguageMenu(returnFocus = false) { if (returnFocus) $('language-button').focus({ preventScroll: true }); setLanguageOpen(false); }
function update(key, value, options) { settings[key] = value; render(options); }
function finishHistoryGroup() { historyGroup = undefined; settingsHistory?.endGroup(); }
function travelHistory(direction) {
  finishHistoryGroup();
  const restored = settingsHistory[direction](); if (!restored) return;
  if (document.activeElement?.matches('input')) document.activeElement.blur();
  settings = restored; render({ blocks: true, record: false });
}
function persistLibrary(successMessage) { const persisted = write(LIBRARY_KEY, library); renderLibrary(); toast(t(persisted ? successMessage : 'noStorage')); return persisted; }
async function copy(text) {
  try { await navigator.clipboard.writeText(text); toast(t('copied')); return true; }
  catch { $('copy-text').value = text; if (!$('copy-dialog').open) openDialog($('copy-dialog')); $('copy-text').focus(); $('copy-text').select(); return false; }
}
function selectStartingLayout(value) {
  finishHistoryGroup();
  settings = resetBaseline.capture(editorSettings(value));
  const url = new URL(location.href); url.hash = encodeShareHash(settings);
  if (url.href !== location.href) history.replaceState(history.state, '', url);
  handledHash = location.hash;
}
function restoreFromHash({ initial = false } = {}) {
  handledHash = location.hash;
  if (initial && !handledHash) return true;
  finishHistoryGroup();
  try {
    settings = handledHash ? resetBaseline.capture(editorSettings(resetBaseline.fromHash(handledHash, settings))) : resetBaseline.capture(DEFAULTS);
    return true;
  } catch { return false; }
}
function restoreLocation() {
  const nextLanguage = languageFromURL(location.href, siteRoot) || preferredLanguage();
  const changedHash = location.hash !== handledHash;
  if (!changedHash && nextLanguage === language) return;
  const restored = !changedHash || restoreFromHash();
  language = nextLanguage; closeLanguageMenu(); translatePage(); render({ blocks: true, templates: true, record: changedHash });
  if (changedHash) toast(t(restored ? 'restored' : 'invalidRef'));
}

$('language-button').addEventListener('click', () => { if (languageOpen) closeLanguageMenu(true); else setLanguageOpen(true); });
$('language-button').addEventListener('keydown', event => {
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); setLanguageOpen(true, event.key === 'ArrowDown' ? 'first' : 'last'); }
  if (event.key === 'Escape' && languageOpen) { event.preventDefault(); event.stopPropagation(); closeLanguageMenu(true); }
});
$('language-menu').addEventListener('click', event => {
  const button = event.target.closest('a[data-language]'); if (!button || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  closeLanguageMenu(true); languageChoice = button.dataset.language; language = detectLanguage(languageChoice); write(LANGUAGE_KEY, languageChoice);
  const url = languageURL(language, location.href, siteRoot);
  if (url.href !== location.href) history.pushState(null, '', url);
  translatePage(); render({ blocks: true, templates: true, record: false });
});
$('language-menu').addEventListener('keydown', event => {
  const buttons = [...$('language-menu').querySelectorAll('[data-language]')], index = buttons.indexOf(document.activeElement);
  const next = { ArrowDown: (index + 1) % buttons.length, ArrowUp: (index + buttons.length - 1) % buttons.length, Home: 0, End: buttons.length - 1 }[event.key];
  if (next !== undefined) { event.preventDefault(); focusLanguage(buttons[next]); }
  else if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); closeLanguageMenu(true); }
  else if (event.key === ' ') { event.preventDefault(); document.activeElement?.click(); }
  else if (event.key === 'Tab') closeLanguageMenu(true);
  else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
    const initial = text => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()[0];
    const ordered = [...buttons.slice(index + 1), ...buttons.slice(0, index + 1)], button = ordered.find(item => initial(item.textContent) === initial(event.key));
    if (button) { event.preventDefault(); focusLanguage(button); }
  }
});
document.addEventListener('pointerdown', event => { if (languageOpen && !event.target.closest('.language-control')) closeLanguageMenu(); });
// A drag or a field edit is one step; discrete buttons remain separate steps.
const settingsPanel = document.querySelector('.settings');
settingsPanel.addEventListener('input', event => {
  if (event.target.matches('input[type=range],input[type=number],input[data-field=label],.page-text-field')) historyGroup = event.target;
}, true);
for (const type of ['change', 'focusout', 'pointercancel', 'lostpointercapture']) settingsPanel.addEventListener(type, finishHistoryGroup);
$('undo-button').addEventListener('click', () => travelHistory('undo'));
$('redo-button').addEventListener('click', () => travelHistory('redo'));
document.addEventListener('keydown', event => {
  const direction = historyShortcut(event);
  if (direction && !document.querySelector('dialog[open]')) { event.preventDefault(); travelHistory(direction); }
});
const paperControl = bindSelectControl($('paper-size'), $('paper-button'), $('paper-menu'), { onOpen: () => { closeLanguageMenu(); barlinesControl.close(); clefsControl.close(); notesControl.close(); groupControl.close(); } });
const barlinesControl = bindBarlinesControl({ read: () => settings, change: patch => update('barlines', { ...settings.barlines, ...patch }), onOpen: () => { closeLanguageMenu(); paperControl.close(); clefsControl.close(); notesControl.close(); groupControl.close(); } });
const clefsControl = bindClefsControl({ read: () => settings, change: patch => { settings = { ...settings, ...patch }; render(); }, t, onOpen: () => { closeLanguageMenu(); paperControl.close(); barlinesControl.close(); notesControl.close(); groupControl.close(); } });
const groupControl = bindSelectControl($('group-size'), $('group-button'), $('group-menu'), { onOpen: () => { closeLanguageMenu(); paperControl.close(); barlinesControl.close(); clefsControl.close(); notesControl.close(); } });
const marginsControl = bindMarginsControl({ read: () => settings, change: patch => { settings = { ...settings, ...patch }; render(); }, t });
const notesControl = bindNotesControl({ read: () => settings, change: patch => update('notes', { ...settings.notes, ...patch }), onOpen: () => { closeLanguageMenu(); paperControl.close(); barlinesControl.close(); clefsControl.close(); groupControl.close(); } });
const pageTextControl = bindPageTextControl({ read: () => settings, change: patch => update('pageText', { ...settings.pageText, ...patch, language }), t });
$('toggle-duplex').addEventListener('click', () => update('duplex', { ...settings.duplex, enabled: !settings.duplex.enabled }));
$('first-page-only').addEventListener('change', event => update('duplex', { ...settings.duplex, firstPageOnly: event.target.checked }));
$('paper-size').addEventListener('change', event => update('paper', event.target.value));
$('portrait-button').addEventListener('click', () => update('orientation', 'portrait'));
$('landscape-button').addEventListener('click', () => update('orientation', 'landscape'));
for (const [rangeId, valueId, key] of measurements) {
  bindTouchRange($(rangeId));
  $(rangeId).addEventListener('input', event => update(key, Number(event.target.value)));
  bindNumber(valueId, key);
}
$('group-size').addEventListener('change', event => update('group', Number(event.target.value)));
$('show-reference').addEventListener('change', event => update('reference', event.target.checked));
$('show-source').addEventListener('change', event => update('source', event.target.checked));
$('staff-count').addEventListener('input', event => { const n = Number(event.target.value); if (event.target.value && Number.isInteger(n) && n >= 1 && n <= 64) update('count', n); });
$('staff-count').addEventListener('change', event => { if (event.target.value !== '') settings.count = Number(event.target.value); render(); });
$('decrease-count').addEventListener('click', () => update('count', settings.count - 1));
$('increase-count').addEventListener('click', () => update('count', settings.count + 1));
$('simple-mode').addEventListener('click', () => update('mode', 'simple'));
$('blocks-mode').addEventListener('click', () => update('mode', 'blocks', { blocks: true }));
$('block-list').addEventListener('input', event => {
  const { field, index } = event.target.dataset; if (!field || !settings.blocks[index]) return;
  if (field !== 'label' && event.target.value === '') return;
  settings.blocks[index][field] = field === 'label' ? event.target.value : Number(event.target.value); render();
});
for (const type of ['change', 'focusout']) $('block-list').addEventListener(type, event => { const { field, index } = event.target.dataset; if (field && settings.blocks[index]) event.target.value = settings.blocks[index][field]; });
$('block-list').addEventListener('click', event => {
  const button = event.target.closest('button[data-action]'); if (!button) return;
  const index = Number(button.dataset.index), action = button.dataset.action;
  if (action === 'remove' && settings.blocks.length > 1) settings.blocks.splice(index, 1);
  else if (action === 'up' && index > 0) [settings.blocks[index - 1], settings.blocks[index]] = [settings.blocks[index], settings.blocks[index - 1]];
  else if (action === 'down' && index < settings.blocks.length - 1) [settings.blocks[index + 1], settings.blocks[index]] = [settings.blocks[index], settings.blocks[index + 1]];
  render({ blocks: true });
});
$('add-block').addEventListener('click', () => { if (settings.blocks.length < 24) settings.blocks.push({ label: '', count: 2, inside: 8, after: 14 }); render({ blocks: true }); });
for (const [id, key] of [['systems', 'systems'], ['system-gap', 'systemGap']]) bindNumber(id, key);
$('fit-button').addEventListener('click', () => { settings = fitSettings(settings); render({ blocks: true }); });
$('reset-button').addEventListener('click', () => {
  finishHistoryGroup(); settings = resetBaseline.restore();
  $('restore-message').textContent = ''; $('restore-message').classList.remove('error');
  $('reference-input').value = ''; $('reference-input').removeAttribute('aria-invalid');
  render({ blocks: true }); toast(t('resetDone'));
});
$('restore-form').addEventListener('submit', event => {
  event.preventDefault();
  try { const restored = decodeReference($('reference-input').value); selectStartingLayout({ ...restored, ...(!/^P8-/i.test($('reference-input').value.trim()) ? { pageText: settings.pageText } : {}), reference: settings.reference, source: settings.source }); render({ blocks: true }); $('restore-message').textContent = t('restored'); $('restore-message').classList.remove('error'); $('reference-input').removeAttribute('aria-invalid'); }
  catch { $('restore-message').textContent = t('invalidRef'); $('restore-message').classList.add('error'); $('reference-input').setAttribute('aria-invalid', 'true'); }
});
$('copy-reference').addEventListener('click', () => copy(encodeReference(settings)));
function shareLayout(value, kind = 'current') { const url = new URL(location.href); url.search = ''; url.hash = encodeShareHash(value); analytics.track('share_requested', { kind }); copy(url.href); }
$('share-template').addEventListener('click', () => shareLayout(settings));
$('toggle-templates').addEventListener('click', () => setTemplatesOpen(!templatesOpen));
$('close-templates').addEventListener('click', () => { setTemplatesOpen(false); $('toggle-templates').focus({ preventScroll: true }); });
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && templatesOpen && !document.querySelector('dialog[open]')) {
    setTemplatesOpen(false); $('toggle-templates').focus({ preventScroll: true });
  }
});
$('save-template').addEventListener('click', () => { $('template-name').value = ''; $('save-message').textContent = ''; openDialog($('save-dialog')); $('template-name').focus(); });
$('save-form').addEventListener('submit', async event => {
  event.preventDefault(); const name = $('template-name').value.trim(); if (!name) return;
  try { library = addTemplate(library, { id: crypto.randomUUID(), name, settings }); if (persistLibrary('templateSaved')) { selectStartingLayout(settings); analytics.track('template_saved', { kind: 'personal', ...configurationMetrics(settings, language, true) }); } await closeDialog($('save-dialog')); setTemplatesOpen(true); }
  catch (error) { $('save-message').textContent = t(error.message); $('save-message').classList.add('error'); }
});
$('templates-panel').addEventListener('click', event => {
  const button = event.target.closest('button[data-id]'); if (!button) return;
  const suggested = button.dataset.suggested === 'true', id = button.dataset.id;
  if (button.dataset.action === 'delete') {
    const group = $(suggested ? 'suggested-templates' : 'saved-templates'), index = [...group.children].indexOf(button.closest('.template-card'));
    library = removeTemplate(library, id, suggested); persistLibrary('templateRemoved');
    (group.children[Math.min(index, group.children.length - 1)]?.querySelector('.template-load') || $('restore-defaults')).focus(); return;
  }
  const template = (suggested ? DEFAULT_TEMPLATES : library.saved).find(item => item.id === id); if (!template) return;
  const value = templateSettings(template, suggested);
  if (button.dataset.action === 'share') { shareLayout(value, suggested ? 'suggested' : 'personal'); return; }
  selectStartingLayout(value);
  render({ blocks: true });
  analytics.track('template_applied', { kind: suggested ? 'suggested' : 'personal', ...(suggested ? { template: id } : {}) });
});
$('restore-defaults').addEventListener('click', () => { library = restoreDefaults(library); persistLibrary('defaultsRestored'); });
bindSiteDialogs({ t, copy, toast });
const settingsAccordion = $('settings-accordion'), settingsDetails = new Map();
const rememberedSection = read(SIDEBAR_KEY, 'staves-settings');
const activeSection = rememberedSection === null || [...settingsAccordion.children].some(details => details.id === rememberedSection) ? rememberedSection : 'staves-settings';
for (const details of settingsAccordion.children) {
  details.open = details.id === activeSection;
  settingsDetails.set(details, bindAnimatedDetails(details, { onOpen() {
    for (const [other, controller] of settingsDetails) if (other !== details) controller.setOpen(false);
    closeLanguageMenu(); paperControl.close(); barlinesControl.close(); clefsControl.close(); notesControl.close(); groupControl.close();
  }, onChange(opening) { write(SIDEBAR_KEY, opening ? details.id : null); } }));
}
// Reserve every heading before giving the open section the remaining height.
// Only its contents scroll when a long block layout exceeds the viewport.
function sizeSettingsAccordion() {
  const headings = [...settingsDetails.keys()].reduce((height, details) => height + details.querySelector('summary').getBoundingClientRect().height + 1, 0);
  settingsAccordion.style.setProperty('--settings-headings-height', `${headings}px`);
  settingsAccordion.style.setProperty('--settings-content-height', `${Math.max(0, settingsAccordion.clientHeight - headings)}px`);
}
const settingsResize = new ResizeObserver(sizeSettingsAccordion);
settingsResize.observe(settingsAccordion);
for (const details of settingsDetails.keys()) settingsResize.observe(details.querySelector('summary'));
$('zoom-in').addEventListener('click', () => zoomPreview(previewZoom * 1.25));
$('zoom-out').addEventListener('click', () => zoomPreview(previewZoom / 1.25));
$('zoom-reset').addEventListener('click', () => zoomPreview(MIN_ZOOM));
$('paper-stage').addEventListener('wheel', event => {
  const delta = event.deltaY || event.deltaX; if (!delta) return;
  if (!event.ctrlKey && !event.metaKey) { showZoomHint(); return; }
  event.preventDefault(); zoomPreview(previewZoom * (delta < 0 ? 1.1 : 1 / 1.1));
}, { passive: false });
$('paper-stage').addEventListener('pointerdown', event => {
  if ($('paper-stage').dataset.zoomed !== 'true' || !event.isPrimary || event.button !== 0) return;
  hideZoomHint();
  const stage = $('paper-stage');
  drag = { id: event.pointerId, x: event.clientX, y: event.clientY, pan: { ...previewPan } };
  stage.setPointerCapture(event.pointerId); stage.classList.add('dragging'); stage.focus({ preventScroll: true }); event.preventDefault();
});
$('paper-stage').addEventListener('pointermove', event => {
  if (!drag || drag.id !== event.pointerId) return;
  previewPan = { x: drag.pan.x + event.clientX - drag.x, y: drag.pan.y + event.clientY - drag.y }; fitPreview();
});
function stopDragging(event) { if (drag?.id === event.pointerId) { drag = undefined; $('paper-stage').classList.remove('dragging'); } }
['pointerup', 'pointercancel', 'lostpointercapture'].forEach(type => $('paper-stage').addEventListener(type, stopDragging));
$('paper-stage').addEventListener('keydown', event => {
  if (event.key === 'Home' || event.key === '0') { event.preventDefault(); zoomPreview(MIN_ZOOM); return; }
  if (event.key === '+' || event.key === '=') { event.preventDefault(); zoomPreview(previewZoom * 1.25); return; }
  if (event.key === '-') { event.preventDefault(); zoomPreview(previewZoom / 1.25); return; }
  if ($('paper-stage').dataset.zoomed !== 'true') return;
  const move = { ArrowLeft: [40, 0], ArrowRight: [-40, 0], ArrowUp: [0, 40], ArrowDown: [0, -40] }[event.key];
  if (move) { event.preventDefault(); previewPan.x += move[0]; previewPan.y += move[1]; fitPreview(); }
});
$('print-button').addEventListener('click', async () => { document.activeElement?.blur(); render(); if (!score.valid) return; await document.fonts.ready; if (score.valid) { analytics.track('print_requested', configurationMetrics(settings, language, storedTemplatePresence(() => localStorage.getItem(LIBRARY_KEY)))); window.print(); } });
window.addEventListener('beforeprint', () => render());
window.addEventListener('hashchange', restoreLocation);
window.addEventListener('popstate', restoreLocation);
window.addEventListener('storage', event => { if (event.key === LIBRARY_KEY) { library = normalizeLibrary(read(LIBRARY_KEY, {})); renderLibrary(); } });
mobileWorkspace = bindMobileWorkspace({ t, onOpen() {
  if (templatesOpen) setTemplatesOpen(false);
  closeLanguageMenu(); paperControl.close(); barlinesControl.close(); clefsControl.close(); notesControl.close(); groupControl.close();
}, onClose() { paperControl.close(); barlinesControl.close(); clefsControl.close(); notesControl.close(); groupControl.close(); } });
new ResizeObserver(fitPreview).observe($('paper-stage'));
restoreFromHash({ initial: true });
if (settings.pageText.nameDate) settings.pageText.language = language;
settingsHistory = createSettingsHistory(settings); renderIcons(); translatePage(); render({ blocks: true, templates: true });
const logoPlayer = createGlockenspiel(), logoNote = createLogoNote($('logo-note'), { interactive: false });
connectLogoSound($('logo-note'), { player: logoPlayer });
melodyDiscovery = createMelodyDiscovery({ button: $('logo-note'), note: logoNote, player: logoPlayer,
  home: $('brand-home'), trigger: $('melody-info'), dialog: $('melody-dialog'), t, notify: toast, track: analytics.track });
analytics.init(document.querySelector('meta[name="umami-website-id"]')?.content);
