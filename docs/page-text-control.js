import { bindPopoverFocus } from './keyboard-focus.js?v=2.7.1';
import { iconMarkup } from './icons.js?v=2.7.1';
import { showPopover } from './motion.js?v=2.7.1';
import { enhanceNumberInputs } from './number-input.js?v=2.7.1';
import { TEXT_FAMILIES, mmToPoints, pointsToMm } from './engine/text-style.js?v=2.7.1';

const alignments = ['left', 'center', 'right'], icons = ['text-align-start', 'text-align-center', 'text-align-end'];
const fontNames = { serif: 'Noto Serif', sans: 'Noto Sans', lora: 'Editorial' };
const fieldLabels = { title: 'pageTitle', instructions: 'pageInstructions', footer: 'customFooter' };

export function bindPageTextControl({ read, change, t, onOpen, beginEdit, finishEdit }) {
  const $ = id => document.getElementById(id);
  const fields = [['header-title', 'title'], ['header-instructions', 'instructions'], ['custom-footer', 'footer']];
  for (const [id, key] of fields) $(id).addEventListener('input', event => change({ [key]: event.target.value }));
  $('show-name-date').addEventListener('change', event => change({ nameDate: event.target.checked }));
  $('header-front-only').addEventListener('change', event => change({ firstPageOnly: event.target.checked }));
  const buttons = [...document.querySelectorAll('button[data-page-format]')];
  const panel = document.createElement('div'); panel.id = 'text-format-panel'; panel.className = 'text-format-popover scroll-panel'; panel.hidden = true;
  panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-labelledby', 'text-format-heading');
  panel.innerHTML = `<div class="text-format-heading"><h3 id="text-format-heading"></h3><button type="button" class="icon-button" data-format-close>${iconMarkup('x')}</button></div>
    <div class="text-format-fonts" role="group" aria-labelledby="text-font-label"><span id="text-font-label" class="sr-only"></span>${TEXT_FAMILIES.map(family => `<button type="button" data-font-family="${family}" aria-pressed="false"><span class="font-sample" data-family="${family}" aria-hidden="true">Aa</span><span>${fontNames[family]}</span></button>`).join('')}</div>
    <div class="text-format-row"><label for="text-font-size" id="text-size-label"></label><input type="number" id="text-font-size" min="6" max="48" step="0.1" data-increment="1" data-unit="pt"></div>
    <div class="text-format-toolbar"><div class="text-format-toggles" role="group">${['bold', 'italic', 'underline'].map(key => `<button type="button" class="icon-button" data-text-style="${key}" aria-pressed="false">${iconMarkup(key)}</button>`).join('')}</div><div class="text-format-alignments" role="group">${alignments.map((align, i) => `<button type="button" class="icon-button" data-text-align="${align}" aria-pressed="false">${iconMarkup(icons[i])}</button>`).join('')}</div></div>
    <p class="text-format-hint"></p>`;
  document.body.append(panel);
  bindPopoverFocus(panel, { trigger: () => trigger(), close: () => close() });
  const sizeInput = $('text-font-size'); let active;
  const trigger = () => buttons.find(button => button.dataset.pageFormat === active);
  function close(returnFocus = false) {
    if (!active) return;
    const previous = trigger(); active = undefined; previous.setAttribute('aria-expanded', 'false');
    finishEdit?.(); showPopover(panel, false); if (returnFocus) previous.focus({ preventScroll: true });
  }
  function open(button) {
    if (button.dataset.pageFormat === active) { close(true); return; }
    close(); onOpen?.(); active = button.dataset.pageFormat; button.setAttribute('aria-expanded', 'true'); refresh();
    const wasHidden = panel.hidden; panel.hidden = false;
    const rect = button.getBoundingClientRect(), width = Math.min(304, innerWidth - 24);
    panel.style.width = `${width}px`;
    panel.style.left = `${Math.max(12, Math.min(rect.right + 8 + width <= innerWidth - 12 ? rect.right + 8 : rect.right - width, innerWidth - width - 12))}px`;
    panel.style.top = `${Math.max(12, Math.min(rect.top, innerHeight - panel.offsetHeight - 12))}px`;
    panel.hidden = wasHidden; showPopover(panel, true); panel.querySelector('[data-font-family][aria-pressed=true]').focus({ preventScroll: true });
  }
  for (const button of buttons) button.addEventListener('click', () => open(button));
  function updateStyle(patch) {
    if (!active) return;
    const key = active + 'Style'; change({ [key]: { ...read().pageText[key], ...patch } });
  }
  panel.addEventListener('click', event => {
    const button = event.target.closest('button'); if (!button || !active) return;
    if (button.hasAttribute('data-format-close')) { close(true); return; }
    if (button.dataset.fontFamily) { finishEdit?.(); updateStyle({ family: button.dataset.fontFamily }); }
    if (button.dataset.textStyle) { finishEdit?.(); const key = button.dataset.textStyle; updateStyle({ [key]: !read().pageText[active + 'Style'][key] }); }
    if (button.dataset.textAlign) { finishEdit?.(); change({ [active + 'Align']: button.dataset.textAlign }); }
  });
  sizeInput.addEventListener('input', () => {
    if (sizeInput.value === '' || !sizeInput.validity.valid) return;
    beginEdit?.(sizeInput); updateStyle({ size: pointsToMm(Number(sizeInput.value)) });
  });
  for (const type of ['change', 'blur']) sizeInput.addEventListener(type, () => { finishEdit?.(); if (active) sizeInput.value = String(Number(mmToPoints(read().pageText[active + 'Style'].size).toFixed(1))); });
  document.addEventListener('pointerdown', event => { if (active && !panel.contains(event.target) && !trigger()?.contains(event.target)) close(); });
  document.addEventListener('focusin', event => { if (active && !panel.contains(event.target) && !trigger()?.contains(event.target)) close(); });
  panel.addEventListener('keydown', event => { if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); close(true); } });
  document.addEventListener('scroll', event => { if (active && !panel.contains(event.target) && !panel.contains(document.activeElement)) close(true); }, true);
  window.addEventListener('resize', () => close(true));
  function label(element, value) { element.setAttribute('aria-label', value); element.dataset.tooltip = value; }
  function refresh({ force = false } = {}) {
    const settings = read();
    for (const [id, key] of fields) if (force || document.activeElement !== $(id)) $(id).value = settings.pageText[key];
    $('show-name-date').checked = settings.pageText.nameDate;
    $('header-front-only').checked = settings.pageText.firstPageOnly;
    $('header-front-option').hidden = !settings.duplex.enabled;
    for (const button of buttons) label(button, t('formatField', { field: t(fieldLabels[button.dataset.pageFormat]) }));
    if (!active) return;
    const style = settings.pageText[active + 'Style'];
    $('text-format-heading').textContent = t('formatField', { field: t(fieldLabels[active]) });
    $('text-font-label').textContent = t('textTypeface'); $('text-size-label').textContent = t('textSize');
    label(panel.querySelector('[data-format-close]'), t('close'));
    panel.querySelector('.text-format-hint').textContent = t('textStyleSavedHint');
    panel.querySelector('.text-format-toggles').setAttribute('aria-label', t('textStyle'));
    panel.querySelector('.text-format-alignments').setAttribute('aria-label', t('textAlignment'));
    panel.querySelectorAll('[data-font-family]').forEach(button => { button.setAttribute('aria-pressed', String(button.dataset.fontFamily === style.family)); });
    panel.querySelectorAll('[data-text-style]').forEach(button => { label(button, t('text_' + button.dataset.textStyle)); button.setAttribute('aria-pressed', String(style[button.dataset.textStyle])); });
    panel.querySelectorAll('[data-text-align]').forEach(button => { label(button, t('alignment_' + button.dataset.textAlign)); button.setAttribute('aria-pressed', String(button.dataset.textAlign === settings.pageText[active + 'Align'])); });
    if (force || document.activeElement !== sizeInput) sizeInput.value = String(Number(mmToPoints(style.size).toFixed(1)));
    enhanceNumberInputs(panel, t);
  }
  refresh(); return { refresh, close };
}
