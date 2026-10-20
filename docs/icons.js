import { icons } from './vendor/lucide.js?v=2.3.3';

export function iconMarkup(name) {
  if (!Object.hasOwn(icons, name)) throw new Error(`Unknown Lucide icon: ${name}`);
  return `<svg class="lucide" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${icons[name]}</svg>`;
}

export function renderIcons(root = document) {
  root.querySelectorAll('[data-icon]').forEach(element => { element.innerHTML = iconMarkup(element.dataset.icon); });
}
