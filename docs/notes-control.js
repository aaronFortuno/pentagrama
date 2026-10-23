import { bindSelectControl } from './select-control.js?v=2.7.0';
import { bindTouchRange } from './touch-range.js?v=2.7.0';

export function bindNotesControl({ read, change, onOpen }) {
  const $ = id => document.getElementById(id);
  const menu = bindSelectControl($('notes-pattern'), $('notes-pattern-button'), $('notes-pattern-menu'), { onOpen });
  $('show-notes').addEventListener('change', event => change({ enabled: event.target.checked }));
  bindTouchRange($('notes-percent'));
  for (const position of ['top', 'bottom']) $('notes-' + position).addEventListener('click', () => change({ position }));
  for (const id of ['notes-percent', 'notes-percent-value', 'notes-spacing']) {
    const input = $(id), key = id === 'notes-spacing' ? 'spacing' : 'percent';
    input.addEventListener('input', () => { if (input.value !== '' && input.validity.valid) change({ [key]: Number(input.value) }); });
    input.addEventListener('change', () => { if (input.value !== '') change({ [key]: Number(input.value) }); input.value = read().notes[key]; });
    input.addEventListener('blur', () => { input.value = read().notes[key]; });
  }
  $('notes-pattern').addEventListener('change', event => change({ pattern: event.target.value }));
  function refresh() {
    const notes = read().notes;
    $('show-notes').checked = notes.enabled;
    $('notes-options').dataset.enabled = String(notes.enabled);
    $('notes-options').inert = !notes.enabled; $('notes-options').setAttribute('aria-hidden', String(!notes.enabled));
    $('notes-fields').disabled = !notes.enabled;
    for (const id of ['notes-percent', 'notes-percent-value', 'notes-spacing', 'notes-pattern']) {
      const input = $(id), key = id === 'notes-pattern' ? 'pattern' : id === 'notes-spacing' ? 'spacing' : 'percent';
      if (document.activeElement !== input) input.value = notes[key];
    }
    $('notes-percent').style.setProperty('--progress', `${(notes.percent - 10) / 60 * 100}%`);
    for (const id of ['notes-percent', 'notes-percent-value']) $(id).setAttribute('aria-valuetext', `${notes.percent}%`);
    for (const position of ['top', 'bottom']) $('notes-' + position).setAttribute('aria-pressed', String(notes.position === position));
    $('notes-spacing').min = notes.pattern === 'ruled' ? 8 : 6; $('notes-spacing').max = notes.pattern === 'ruled' ? 12 : 10;
    $('notes-spacing-field').hidden = notes.pattern === 'blank';
    $('notes-pattern-button').disabled = !notes.enabled; menu.refresh();
    if (!notes.enabled) menu.close();
    $('notes-settings-value').textContent = notes.enabled ? `${notes.percent}%` : '';
  }
  return { refresh, close: menu.close };
}
