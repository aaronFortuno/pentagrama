import { analytics } from './analytics.js?v=2.0.1';
import { LANGUAGES, translate } from './i18n.js?v=2.0.1';
import { renderIcons } from './icons.js?v=2.0.1';
import { openDialog, showPopover } from './motion.js?v=2.0.1';
import { bindSiteDialogs } from './site-chrome.js?v=2.0.1';

const $ = id => document.getElementById(id), locale = document.documentElement.lang;
const t = key => translate(locale, key);
let toastTimer;
function toast(text) {
  $('toast').textContent = text; $('toast').classList.add('visible');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => $('toast').classList.remove('visible'), 3500);
}
async function copy(text) {
  try { await navigator.clipboard.writeText(text); toast(t('copied')); return true; }
  catch { $('copy-text').value = text; openDialog($('copy-dialog')); $('copy-text').focus(); $('copy-text').select(); return false; }
}
renderIcons();
bindSiteDialogs({ t, copy, toast });

const trigger = $('language-button'), menu = $('language-menu');
const languages = [...menu.querySelectorAll('[data-language]')];
let menuOpen = false;
trigger.dataset.tooltip = `${t('language')} · ${LANGUAGES[locale]}`;
function focusLanguage(link) { link?.focus({ preventScroll: true }); link?.scrollIntoView({ block: 'nearest' }); }
function setOpen(open, focus) {
  if (menuOpen === open) return;
  menuOpen = open; trigger.setAttribute('aria-expanded', String(open)); showPopover(menu, open);
  if (open) focusLanguage(focus || languages.find(link => link.dataset.language === locale));
}
function close(focus = false) { if (focus) trigger.focus({ preventScroll: true }); setOpen(false); }
trigger.addEventListener('click', () => menuOpen ? close(true) : setOpen(true));
trigger.addEventListener('keydown', event => {
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') { event.preventDefault(); setOpen(true, event.key === 'ArrowDown' ? languages[0] : languages.at(-1)); }
  if (event.key === 'Escape') { event.preventDefault(); close(true); }
});
menu.addEventListener('keydown', event => {
  const index = languages.indexOf(document.activeElement);
  const next = { ArrowDown: (index + 1) % languages.length, ArrowUp: (index + languages.length - 1) % languages.length, Home: 0, End: languages.length - 1 }[event.key];
  if (next !== undefined) { event.preventDefault(); focusLanguage(languages[next]); }
  else if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); close(true); }
  else if (event.key === 'Tab') close(true);
  else if (event.key === ' ') { event.preventDefault(); document.activeElement?.click(); }
  else if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
    const initial = text => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()[0];
    const ordered = [...languages.slice(index + 1), ...languages.slice(0, index + 1)];
    const link = ordered.find(item => initial(item.textContent) === initial(event.key));
    if (link) { event.preventDefault(); focusLanguage(link); }
  }
});
menu.addEventListener('click', event => {
  const link = event.target.closest('[data-language]');
  if (!link || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  try { localStorage.setItem('pentagrama.language.v1', JSON.stringify(link.dataset.language)); } catch { /* Navigation also works without storage. */ }
});
document.addEventListener('pointerdown', event => { if (menuOpen && !event.target.closest('.language-control')) close(); });
analytics.init(document.querySelector('meta[name="umami-website-id"]')?.content);
