export function bindPageTextControl({ read, change }) {
  const $ = id => document.getElementById(id);
  const fields = [['header-title', 'title'], ['header-instructions', 'instructions'], ['custom-footer', 'footer']];
  for (const [id, key] of fields) $(id).addEventListener('input', event => change({ [key]: event.target.value }));
  $('show-name-date').addEventListener('change', event => change({ nameDate: event.target.checked }));
  $('header-front-only').addEventListener('change', event => change({ firstPageOnly: event.target.checked }));
  function refresh() {
    const settings = read();
    for (const [id, key] of fields) if (document.activeElement !== $(id)) $(id).value = settings.pageText[key];
    $('show-name-date').checked = settings.pageText.nameDate;
    $('header-front-only').checked = settings.pageText.firstPageOnly;
    $('header-front-option').hidden = !settings.duplex.enabled;
  }
  refresh(); return { refresh };
}
