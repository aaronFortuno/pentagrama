import { motionOptions } from './motion.js?v=2.0.0-alpha.4';

export const MARGIN_AXES = Object.freeze({ horizontal: ['marginLeft', 'marginRight'], vertical: ['marginTop', 'marginBottom'] });
export const asymmetricMargins = settings => Object.values(MARGIN_AXES).some(([first, second]) => settings[first] !== settings[second]);
export function marginPatch(field, value) {
  return Object.fromEntries((MARGIN_AXES[field] || [field]).map(key => [key, value]));
}

export function bindMarginsControl({ read, change, t }) {
  const $ = id => document.getElementById(id), toggle = $('margin-mode'), container = $('margin-fields');
  let individual = asymmetricMargins(read()), previousAsymmetric = individual, transition;
  const fields = ['horizontal', 'vertical', 'Top', 'Right', 'Bottom', 'Left'];
  function refresh() {
    const settings = read(), asymmetric = asymmetricMargins(settings);
    if (asymmetric && !previousAsymmetric) individual = true;
    previousAsymmetric = asymmetric;
    $('margin-pairs').hidden = individual; $('margin-sides').hidden = !individual;
    toggle.setAttribute('aria-expanded', String(individual));
    toggle.textContent = t(individual ? 'pairMargins' : 'adjustMargins');
    for (const field of fields) {
      const input = $(`margin-${field.toLowerCase()}`), keys = MARGIN_AXES[field] || [`margin${field}`];
      const mixed = keys.length === 2 && settings[keys[0]] !== settings[keys[1]];
      const value = mixed ? '' : String(settings[keys[0]]);
      input.dataset.stepBase = String(settings[keys[0]]);
      input.placeholder = mixed ? '—' : '';
      if (mixed) input.setAttribute('aria-valuetext', t('mixedMargins'));
      else input.removeAttribute('aria-valuetext');
      input.title = mixed ? t('mixedMargins') : '';
      if (document.activeElement !== input) input.value = value;
    }
  }
  toggle.addEventListener('click', () => {
    transition?.cancel(); const from = container.getBoundingClientRect().height;
    individual = !individual; refresh(); const to = container.getBoundingClientRect().height;
    transition = container.animate([{ height: `${from}px`, opacity: .5 }, { height: `${to}px`, opacity: 1 }], motionOptions());
  });
  for (const field of fields) {
    const input = $(`margin-${field.toLowerCase()}`), key = MARGIN_AXES[field] ? field : `margin${field}`;
    input.addEventListener('input', () => {
      if (input.value !== '' && input.validity.valid) change(marginPatch(key, Number(input.value)));
    });
    input.addEventListener('change', () => {
      if (input.value !== '') change(marginPatch(key, Number(input.value)));
      const keys = MARGIN_AXES[field] || [key], settings = read();
      input.value = keys.length === 2 && settings[keys[0]] !== settings[keys[1]] ? '' : String(settings[keys[0]]);
    });
    input.addEventListener('blur', refresh);
  }
  refresh(); return { refresh };
}
