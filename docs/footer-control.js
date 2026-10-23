import { bindPopoverFocus } from './keyboard-focus.js?v=2.8.1';
import { iconMarkup } from './icons.js?v=2.8.1';
import { showPopover } from './motion.js?v=2.8.1';
import { enhanceNumberInputs } from './number-input.js?v=2.8.1';
import { importFooterImage } from './footer-image-upload.js?v=2.8.1';
import { FOOTER_LIBRARY_KEY, normalizeFooterLibrary, saveFooter, deleteFooter, footerSnapshot } from './footer-library.js?v=2.8.1';
import { footerLayoutIcon } from './footer-layout-icons.js?v=2.8.1';

export function bindFooterControl({ read, change, t, notify, onOpen, beginEdit, finishEdit }) {
  const $ = id => document.getElementById(id), input = $('footer-image-file');
  let library = [], active, busy = false;
  const panel = document.createElement('div'); panel.id = 'footer-options-panel'; panel.className = 'text-format-popover footer-options-popover scroll-panel'; panel.hidden = true;
  panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-labelledby', 'footer-options-title');
  panel.innerHTML = `<div class="text-format-heading"><h3 id="footer-options-title"></h3><button type="button" class="icon-button" data-footer-close>${iconMarkup('x')}</button></div>
    <div data-footer-view="image"><div class="text-format-row"><label for="footer-image-height" data-footer-label="footerImageHeight"></label><input type="number" id="footer-image-height" min="3" max="18" step="0.5" data-unit="mm"></div>
    <fieldset class="footer-image-layout"><legend data-footer-label="footerImagePosition"></legend><div class="footer-placement-buttons">${['before', 'after', 'above', 'below'].map(position => `<button type="button" data-image-placement="${position}" aria-pressed="false"></button>`).join('')}</div></fieldset>
    <fieldset class="footer-image-alignment"><legend data-footer-label="footerImageAlign"></legend><div class="footer-align-buttons">${['top', 'middle', 'bottom'].map(align => `<button type="button" data-image-align="${align}" aria-pressed="false"></button>`).join('')}</div></fieldset><p class="text-format-hint" data-footer-label="footerImageMax"></p></div>
    <div data-footer-view="library"><p class="text-format-hint" data-footer-label="footerLibraryHint"></p><div class="footer-saved-list"></div><button type="button" class="button footer-save" data-footer-save>${iconMarkup('save')}<span data-footer-label="footerSave"></span></button><button type="button" class="text-button footer-clear" data-footer-clear data-footer-label="footerClear"></button></div>`;
  document.body.append(panel);
  bindPopoverFocus(panel, { trigger: () => trigger(), close: () => close() });
  const imageTrigger = $('footer-image-options'), libraryTrigger = $('footer-library-button'), size = $('footer-image-height');
  const trigger = () => active === 'image' ? imageTrigger : libraryTrigger;
  const label = (element, text) => { element.setAttribute('aria-label', text); element.dataset.tooltip = text; };
  function loadLibrary() { try { library = normalizeFooterLibrary(JSON.parse(localStorage.getItem(FOOTER_LIBRARY_KEY))); } catch { library = []; } }
  function persist(next, message) {
    try { localStorage.setItem(FOOTER_LIBRARY_KEY, JSON.stringify(next)); library = next; refresh(); notify(t(message)); return true; }
    catch { notify(t('noStorage')); return false; }
  }
  function close(returnFocus = false) {
    if (!active) return;
    const previous = trigger(); active = undefined; previous.setAttribute('aria-expanded', 'false'); showPopover(panel, false);
    if (returnFocus && !previous.hidden) previous.focus({ preventScroll: true });
  }
  function position() {
    const button = trigger(), rect = button.getBoundingClientRect(), width = Math.min(304, innerWidth - 24);
    panel.style.width = `${width}px`;
    panel.style.left = `${Math.max(12, Math.min(rect.right + 8 + width <= innerWidth - 12 ? rect.right + 8 : rect.right - width, innerWidth - width - 12))}px`;
    panel.style.top = `${Math.max(12, Math.min(rect.top, innerHeight - panel.offsetHeight - 12))}px`;
  }
  function open(view) {
    close(); onOpen?.(); active = view; trigger().setAttribute('aria-expanded', 'true'); refresh();
    const wasHidden = panel.hidden; panel.hidden = false; position(); panel.hidden = wasHidden; showPopover(panel, true);
    (view === 'image' ? size : panel.querySelector('[data-footer-close]')).focus({ preventScroll: true });
  }
  function updateImage(patch) { const image = read().pageText.footerImage; if (image) change({ footerImage: { ...image, ...patch } }); }
  $('footer-image-add').addEventListener('click', () => { close(); input.click(); });
  input.addEventListener('change', async () => {
    const file = input.files?.[0]; input.value = ''; if (!file || busy) return;
    busy = true; refresh();
    try { const image = await importFooterImage(file); finishEdit?.(); change({ footerImage: image }); open('image'); }
    catch { notify(t('footerImageInvalid')); }
    finally { busy = false; refresh(); }
  });
  $('footer-image-remove').addEventListener('click', () => { close(); finishEdit?.(); change({ footerImage: null }); $('footer-image-add').focus({ preventScroll: true }); });
  imageTrigger.addEventListener('click', () => active === 'image' ? close() : open('image'));
  libraryTrigger.addEventListener('click', () => active === 'library' ? close() : open('library'));
  size.addEventListener('input', () => { if (size.value && size.validity.valid) { beginEdit?.(size); updateImage({ height: Number(size.value) }); } });
  for (const type of ['change', 'blur']) size.addEventListener(type, () => { finishEdit?.(); if (read().pageText.footerImage) size.value = read().pageText.footerImage.height; });
  panel.addEventListener('click', event => {
    const button = event.target.closest('button'); if (!button) return;
    if (button.hasAttribute('data-footer-close')) close(true);
    if (button.dataset.imagePlacement) { finishEdit?.(); updateImage({ placement: button.dataset.imagePlacement }); }
    if (button.dataset.imageAlign) { finishEdit?.(); updateImage({ align: button.dataset.imageAlign }); }
    if (button.hasAttribute('data-footer-save')) {
      try { persist(saveFooter(library, read().pageText, crypto.randomUUID()), 'footerSaved'); }
      catch (error) { notify(t(error.message)); }
    }
    if (button.dataset.footerApply) {
      const footer = library.find(item => item.id === button.dataset.footerApply);
      if (footer) { finishEdit?.(); change(footerSnapshot(footer)); close(); $('custom-footer').focus({ preventScroll: true }); }
    }
    if (button.dataset.footerDelete) { persist(deleteFooter(library, button.dataset.footerDelete), 'footerDeleted'); panel.querySelector('[data-footer-close]').focus({ preventScroll: true }); }
    if (button.hasAttribute('data-footer-clear')) { persist([], 'footerDeleted'); panel.querySelector('[data-footer-close]').focus({ preventScroll: true }); }
  });
  document.addEventListener('pointerdown', event => { if (active && !panel.contains(event.target) && !trigger().contains(event.target)) close(); });
  document.addEventListener('focusin', event => { if (active && !panel.contains(event.target) && !trigger().contains(event.target)) close(); });
  panel.addEventListener('keydown', event => { if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); close(true); } });
  document.addEventListener('scroll', event => { if (active && !panel.contains(event.target) && !panel.contains(document.activeElement)) close(true); }, true);
  window.addEventListener('resize', () => close(true));
  window.addEventListener('storage', event => { if (event.key === FOOTER_LIBRARY_KEY) { loadLibrary(); refresh(); } });
  function refresh() {
    const options = read().pageText, image = options.footerImage;
    $('footer-image-add').disabled = busy;
    $('footer-image-add').querySelector('span[data-i18n]').textContent = t(image ? 'footerChangeImage' : 'footerAddImage');
    $('footer-image-current').hidden = !image; $('footer-image-local').hidden = !image;
    if (image) { if ($('footer-image-thumb').getAttribute('src') !== image.data) $('footer-image-thumb').src = image.data; $('footer-image-name').textContent = image.name || t('footerImageSettings'); }
    else { $('footer-image-thumb').removeAttribute('src'); if (active === 'image') close(); }
    if (!active) return;
    panel.querySelectorAll('[data-footer-view]').forEach(view => { view.hidden = view.dataset.footerView !== active; });
    $('footer-options-title').textContent = t(active === 'image' ? 'footerImageSettings' : 'savedFooters');
    label(panel.querySelector('[data-footer-close]'), t('close'));
    panel.querySelectorAll('[data-footer-label]').forEach(element => { element.textContent = t(element.dataset.footerLabel); });
    if (active === 'image' && image) {
      if (document.activeElement !== size) size.value = image.height;
      panel.querySelectorAll('[data-image-placement]').forEach(button => { if (!button.firstElementChild) button.innerHTML = footerLayoutIcon(button.dataset.imagePlacement); label(button, t('footerImage_' + button.dataset.imagePlacement)); button.setAttribute('aria-pressed', String(button.dataset.imagePlacement === image.placement)); });
      panel.querySelectorAll('[data-image-align]').forEach(button => { if (!button.firstElementChild) button.innerHTML = footerLayoutIcon(button.dataset.imageAlign); label(button, t('footerAlign_' + button.dataset.imageAlign)); button.setAttribute('aria-pressed', String(button.dataset.imageAlign === image.align)); button.disabled = !options.footer.trim() || ['above', 'below'].includes(image.placement); });
      enhanceNumberInputs(panel, t);
    }
    if (active === 'library') {
      const list = panel.querySelector('.footer-saved-list'); list.replaceChildren();
      for (const item of library) {
        const row = document.createElement('div'); row.className = 'footer-saved-row';
        const apply = document.createElement('button'); apply.type = 'button'; apply.className = 'footer-saved-apply'; apply.dataset.footerApply = item.id;
        const name = item.footer.trim() || item.footerImage?.name || t('footerImageSettings'); label(apply, t('footerApply', { name }));
        if (item.footerImage) { const thumb = document.createElement('img'); thumb.src = item.footerImage.data; thumb.alt = ''; apply.append(thumb); }
        const text = document.createElement('span'); text.textContent = name; apply.append(text);
        const remove = document.createElement('button'); remove.type = 'button'; remove.className = 'icon-button'; remove.dataset.footerDelete = item.id; remove.innerHTML = iconMarkup('trash'); label(remove, t('footerDelete', { name }));
        row.append(apply, remove); list.append(row);
      }
      panel.querySelector('[data-footer-save]').disabled = !options.footer.trim() && !image;
      panel.querySelector('[data-footer-clear]').hidden = !library.length;
    }
  }
  async function ready() { const image = read().pageText.footerImage; if (image) { const element = new Image(); element.src = image.data; await element.decode(); } }
  loadLibrary(); refresh(); return { refresh, close, ready };
}
