import { bindSelectControl } from './select-control.js?v=2.3.5';
import { barlineThickness } from './engine/barlines.js?v=2.3.5';

// UI adapter only: normalization, placement and export stay in the engine.
export function bindBarlinesControl({ read, change, onOpen, root = document }) {
  const get = id => root.getElementById(id), toggle = get('show-barlines');
  const options = get('barlines-options'), fields = get('barlines-fields');
  const selects = new Map();
  for (const key of ['style', 'connect']) {
    const select = get(`barline-${key}`), button = get(`barline-${key}-button`);
    const control = bindSelectControl(select, button, get(`barline-${key}-menu`), { onOpen() {
      onOpen?.(); for (const [other, item] of selects) if (other !== key) item.close();
    } });
    selects.set(key, control);
    select.addEventListener('change', () => change({ [key]: select.value }));
  }
  toggle.addEventListener('change', () => change({ enabled: toggle.checked }));
  get('barline-auto').addEventListener('click', () => {
    const settings = read(), linked = settings.barlines.thicknessMode === 'staff';
    change({ thicknessMode: linked ? 'custom' : 'staff', ...(linked ? { thickness: barlineThickness(settings) } : {}) });
  });
  for (const key of ['measures', 'thickness']) {
    const input = get(`barline-${key}`);
    input.addEventListener('input', () => { if (input.value !== '' && input.validity.valid) change({ [key]: Number(input.value) }); });
    input.addEventListener('change', () => {
      if (input.value !== '') change({ [key]: Number(input.value) });
      input.value = read().barlines[key];
    });
  }
  const close = () => { for (const control of selects.values()) control.close(); };
  function refresh() {
    const settings = read(), bars = settings.barlines;
    const linked = bars.thicknessMode === 'staff';
    get('barline-auto').setAttribute('aria-pressed', String(linked)); get('barline-thickness').disabled = linked;
    toggle.checked = bars.enabled; options.dataset.enabled = String(bars.enabled);
    options.inert = !bars.enabled; options.setAttribute('aria-hidden', String(!bars.enabled)); fields.disabled = !bars.enabled;
    const canConnect = settings.mode === 'blocks' ? settings.blocks.some(block => block.count > 1) : settings.group > 1;
    get('barline-connect').disabled = !canConnect;
    for (const key of ['measures', 'thickness', 'style', 'connect']) {
      const input = get(`barline-${key}`);
      if (root.activeElement !== input) input.value = key === 'thickness' ? barlineThickness(settings) : bars[key];
      if (selects.has(key)) { get(`barline-${key}-button`).disabled = !bars.enabled || input.disabled; selects.get(key).refresh(); }
    }
    if (!bars.enabled || !canConnect) close();
  }
  return { refresh, close };
}
