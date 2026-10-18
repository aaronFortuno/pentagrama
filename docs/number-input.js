import { iconMarkup } from './icons.js?v=1.17.0';

// Relative steps preserve imported half/fractional millimetres instead of snapping them away.
export function incrementValue(value, direction, { step = 1, min = -Infinity, max = Infinity } = {}) {
  const current = value === '' ? NaN : Number(value);
  if (!Number.isFinite(current)) return Number.isFinite(min) ? min : 0;
  const next = Number((current + Math.sign(direction) * step).toFixed(8));
  return Math.max(min, Math.min(max, next));
}

const controls = new WeakMap();
export function stepNumberInput(input, direction) {
  if (input.disabled) return;
  // Commit a pending typed edit before recording the incremental action.
  input.dispatchEvent(new Event('change', { bubbles: true }));
  const step = Number(input.dataset.increment || input.step) || 1;
  const next = incrementValue(input.value, direction, { step, min: input.min === '' ? -Infinity : Number(input.min), max: input.max === '' ? Infinity : Number(input.max) });
  if (String(next) === input.value) return;
  input.value = String(next); input.dispatchEvent(new Event('input', { bubbles: true })); input.dispatchEvent(new Event('change', { bubbles: true }));
}
export function enhanceNumberInputs(root, t) {
  root.querySelectorAll('input[type=number]:not(#staff-count)').forEach(input => {
    let control = controls.get(input);
    if (!control) {
      const wrapper = input.closest('.measurement') || document.createElement('div');
      if (!wrapper.classList.contains('measurement')) { input.before(wrapper); wrapper.append(input); }
      wrapper.classList.add('number-control');
      if (input.dataset.unit && !wrapper.querySelector('.number-unit')) {
        const unit = document.createElement('span'); unit.className = 'number-unit'; unit.setAttribute('aria-hidden', 'true'); unit.textContent = input.dataset.unit; wrapper.append(unit);
      }
      wrapper.querySelectorAll(':scope>span').forEach(span => span.classList.add('number-unit'));
      const actions = document.createElement('div'); actions.className = 'number-actions';
      const buttons = [1, -1].map(direction => {
        const button = document.createElement('button'); button.type = 'button'; button.tabIndex = -1;
        button.className = direction > 0 ? 'number-increase' : 'number-decrease'; button.innerHTML = iconMarkup('chevron-down');
        button.setAttribute('aria-controls', input.id);
        const change = () => stepNumberInput(input, direction);
        button.addEventListener('mousedown', event => event.preventDefault());
        button.addEventListener('click', change); actions.append(button);
        return { button, change };
      });
      wrapper.append(actions);
      input.addEventListener('keydown', event => {
        if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown' || event.altKey || event.ctrlKey || event.metaKey) return;
        event.preventDefault(); buttons[event.key === 'ArrowUp' ? 0 : 1].change();
      });
      control = { wrapper, buttons }; controls.set(input, control);
    }
    const label = input.getAttribute('aria-label') || input.labels?.[0]?.textContent || '';
    control.buttons.forEach(({ button }, index) => {
      button.setAttribute('aria-label', t(index === 0 ? 'increaseValue' : 'decreaseValue', { label }));
      button.disabled = input.disabled || input.value !== '' && (index === 0 ? input.max !== '' && Number(input.value) >= Number(input.max) : input.min !== '' && Number(input.value) <= Number(input.min));
    });
  });
}
