export function bindPageTextControl({ read, change }) {
  const $ = id => document.getElementById(id);
  const fields = [['header-title', 'title'], ['header-instructions', 'instructions'], ['custom-footer', 'footer']];
  for (const [id, key] of fields) $(id).addEventListener('input', event => change({ [key]: event.target.value }));
  $('show-name-date').addEventListener('change', event => change({ nameDate: event.target.checked }));
  $('header-front-only').addEventListener('change', event => change({ firstPageOnly: event.target.checked }));
  for (const key of ['titleAlign', 'instructionsAlign']) for (const button of document.querySelectorAll(`[data-page-align="${key}"] button`)) {
    button.addEventListener('click', () => change({ [key]: button.dataset.align }));
  }
  function refresh() {
    const settings = read();
    for (const [id, key] of fields) if (document.activeElement !== $(id)) $(id).value = settings.pageText[key];
    $('show-name-date').checked = settings.pageText.nameDate;
    $('header-front-only').checked = settings.pageText.firstPageOnly;
    $('header-front-option').hidden = !settings.duplex.enabled;
    for (const key of ['titleAlign', 'instructionsAlign']) for (const button of document.querySelectorAll(`[data-page-align="${key}"] button`)) {
      button.setAttribute('aria-pressed', String(button.dataset.align === settings.pageText[key]));
    }
  }
  refresh(); return { refresh };
}
