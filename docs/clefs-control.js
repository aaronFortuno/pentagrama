import { bindSelectControl } from './select-control.js?v=2.2.0';

export function bindClefsControl({ read, change, t, onOpen, root = document }) {
  const get = id => root.getElementById(id), controls = new Map();
  let selection, lastMode;
  const close = () => { for (const control of controls.values()) control.close(); };
  for (const key of ['common', 'position', 'assigned']) {
    const control = bindSelectControl(get(`clef-${key}`), get(`clef-${key}-button`), get(`clef-${key}-menu`), { minWidth: key === 'position' ? 210 : 175, onOpen() {
      onOpen?.(); for (const [other, item] of controls) if (other !== key) item.close();
    } }); controls.set(key, control);
  }
  const edit = patch => change({ clefs: { ...read().clefs, ...patch } });
  get('show-clefs').addEventListener('change', event => edit({ enabled: event.target.checked }));
  get('clefs-uniform').addEventListener('click', () => edit({ mode: 'uniform' }));
  get('clefs-pattern').addEventListener('click', () => edit({ mode: 'pattern' }));
  get('clef-common').addEventListener('change', event => edit({ type: event.target.value }));
  function positions(settings) {
    return settings.mode === 'blocks' ? settings.blocks.flatMap((block, i) => Array.from({ length: block.count }, (_, n) => ({ value: `b${i}-${n}`, label: `${block.label || t('block', { n: i + 1 })} · ${n + 1}`, block: i, position: n })))
      : Array.from({ length: settings.group || settings.count }, (_, n) => ({ value: `s-${n}`, label: String(n + 1), position: n }));
  }
  get('clef-position').addEventListener('change', event => { selection = event.target.value; refresh(); });
  get('clef-assigned').addEventListener('change', event => {
    const settings = read(), item = positions(settings).find(item => item.value === selection);
    if (!item) return;
    const value = event.target.value === 'inherit' ? null : event.target.value;
    const pattern = [...(settings.mode === 'blocks' ? settings.blocks[item.block].clefs || [] : settings.clefs.pattern)];
    while (pattern.length <= item.position) pattern.push(null);
    pattern[item.position] = value;
    if (settings.mode === 'blocks') change({ blocks: settings.blocks.map((block, i) => i === item.block ? { ...block, clefs: pattern } : block) });
    else edit({ pattern });
  });
  function refresh() {
    const settings = read(), clefs = settings.clefs, pattern = clefs.mode === 'pattern';
    get('show-clefs').checked = clefs.enabled;
    const options = get('clefs-options'); options.dataset.enabled = String(clefs.enabled); options.inert = !clefs.enabled; options.setAttribute('aria-hidden', String(!clefs.enabled));
    get('clefs-fields').disabled = !clefs.enabled;
    get('clefs-uniform').setAttribute('aria-pressed', String(!pattern)); get('clefs-pattern').setAttribute('aria-pressed', String(pattern));
    get('clef-uniform-field').hidden = pattern; get('clef-pattern-fields').hidden = !pattern;
    get('clef-common').value = clefs.type;
    const items = positions(settings); if (!items.some(item => item.value === selection)) selection = items[0].value;
    get('clef-position').replaceChildren(...items.map(item => new Option(item.label, item.value)));
    get('clef-position').value = selection;
    const item = items.find(item => item.value === selection);
    get('clef-assigned').options[0].textContent = t('clefInherited', { name: t(`clef_${clefs.type}`) });
    get('clef-assigned').value = (settings.mode === 'blocks' ? settings.blocks[item.block].clefs?.[item.position] : clefs.pattern[item.position]) ?? 'inherit';
    get('clef-pattern-hint').textContent = t(settings.mode === 'blocks' ? 'clefRepeatSystems' : settings.group ? 'clefRepeatGroups' : 'clefEachStaff');
    for (const [key, control] of controls) { get(`clef-${key}-button`).disabled = !clefs.enabled; control.refresh(); }
    if (!clefs.enabled || lastMode !== clefs.mode) close(); lastMode = clefs.mode;
  }
  return { refresh, close };
}
