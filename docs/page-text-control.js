import { iconMarkup } from './icons.js?v=2.3.4';

const alignments = ['left', 'center', 'right'], icons = ['text-align-start', 'text-align-center', 'text-align-end'];

export function bindPageTextControl({ read, change, t }) {
  const $ = id => document.getElementById(id);
  const fields = [['header-title', 'title'], ['header-instructions', 'instructions'], ['custom-footer', 'footer']];
  for (const [id, key] of fields) $(id).addEventListener('input', event => change({ [key]: event.target.value }));
  $('show-name-date').addEventListener('change', event => change({ nameDate: event.target.checked }));
  $('header-front-only').addEventListener('change', event => change({ firstPageOnly: event.target.checked }));
  const alignmentButtons = [...document.querySelectorAll('button[data-page-align]')];
  for (const button of alignmentButtons) {
    const key = button.dataset.pageAlign;
    button.addEventListener('click', () => change({ [key]: alignments[(alignments.indexOf(read().pageText[key]) + 1) % 3] }));
  }
  function refresh() {
    const settings = read();
    for (const [id, key] of fields) if (document.activeElement !== $(id)) $(id).value = settings.pageText[key];
    $('show-name-date').checked = settings.pageText.nameDate;
    $('header-front-only').checked = settings.pageText.firstPageOnly;
    $('header-front-option').hidden = !settings.duplex.enabled;
    for (const button of alignmentButtons) {
      const key = button.dataset.pageAlign, current = settings.pageText[key], index = alignments.indexOf(current);
      button.dataset.align = current;
      const icon = button.querySelector('[data-icon]');
      if (icon.dataset.icon !== icons[index] || !icon.firstElementChild) { icon.dataset.icon = icons[index]; icon.innerHTML = iconMarkup(icons[index]); }
      const label = t('cycleAlignment', { field: t(key === 'titleAlign' ? 'pageTitle' : 'pageInstructions'), current: t('alignment_' + current), next: t('alignment_' + alignments[(index + 1) % 3]) });
      button.setAttribute('aria-label', label); button.dataset.tooltip = label;
    }
  }
  refresh(); return { refresh };
}
