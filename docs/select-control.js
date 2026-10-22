import { iconMarkup } from './icons.js?v=2.4.0';
import { showPopover } from './motion.js?v=2.4.0';

export function bindSelectControl(select, button, menu, { onOpen, minWidth = 130 } = {}) {
  let open = false, signature;
  // The menu lives outside the scrolling sidebar so its edges and focus rings cannot be clipped.
  document.body.append(menu);
  const focus = index => {
    const options = [...menu.children], option = options[(index + options.length) % options.length];
    option?.focus({ preventScroll: true });
    if (option && option.offsetTop < menu.scrollTop) menu.scrollTop = option.offsetTop;
    else if (option && option.offsetTop + option.offsetHeight > menu.scrollTop + menu.clientHeight) menu.scrollTop = option.offsetTop + option.offsetHeight - menu.clientHeight;
  };
  function setOpen(value, returnFocus = false, index = select.selectedIndex) {
    if (value === open) return;
    open = value; button.setAttribute('aria-expanded', String(open));
    if (open) {
      onOpen?.();
      const rect = button.getBoundingClientRect(), width = Math.max(minWidth, rect.width), height = Math.min(menu.children.length * 38 + 14, innerHeight - 24);
      menu.style.width = `${Math.min(width, innerWidth - 24)}px`;
      menu.style.left = `${Math.max(12, Math.min(rect.left, innerWidth - width - 12))}px`;
      menu.style.top = `${rect.bottom + 8 + height > innerHeight ? Math.max(12, rect.top - height - 8) : rect.bottom + 8}px`;
    }
    if (!open && returnFocus) button.focus({ preventScroll: true });
    showPopover(menu, open);
    if (open) focus(index);
  }
  function refresh() {
    const values = JSON.stringify([...select.options].map(option => option.value));
    if (values !== signature) { setOpen(false); buildOptions(); signature = values; }
    button.querySelector('[data-select-value]').textContent = select.options[select.selectedIndex]?.textContent || '';
    [...menu.children].forEach((option, index) => {
      option.firstChild.textContent = select.options[index]?.textContent || '';
      option.setAttribute('aria-selected', String(index === select.selectedIndex));
    });
  }
  function buildOptions() {
    menu.replaceChildren();
    for (const option of select.options) {
    const item = document.createElement('button'); item.type = 'button'; item.tabIndex = -1; item.setAttribute('role', 'option');
    item.append(document.createTextNode(option.textContent)); const check = document.createElement('span'); check.innerHTML = iconMarkup('check'); item.append(check);
    item.addEventListener('click', () => { select.value = option.value; select.dispatchEvent(new Event('change', { bubbles: true })); refresh(); setOpen(false, true); });
      menu.append(item);
    }
  }
  button.addEventListener('click', () => setOpen(!open, open));
  button.addEventListener('keydown', event => {
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End', 'Enter', ' '].includes(event.key)) return;
    event.preventDefault(); setOpen(true, false, event.key === 'Home' ? 0 : event.key === 'End' ? menu.children.length - 1 : select.selectedIndex);
  });
  menu.addEventListener('keydown', event => {
    const index = [...menu.children].indexOf(document.activeElement), next = { ArrowDown: index + 1, ArrowUp: index - 1, Home: 0, End: menu.children.length - 1 }[event.key];
    if (next !== undefined) { event.preventDefault(); focus(next); }
    else if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); setOpen(false, true); }
    else if (event.key === 'Tab') setOpen(false, true);
    else if (event.key.length === 1 && event.key !== ' ') {
      const ordered = [...menu.children].slice(index + 1).concat([...menu.children].slice(0, index + 1));
      const match = ordered.find(option => option.textContent.trim().toLowerCase().startsWith(event.key.toLowerCase()));
      if (match) { event.preventDefault(); match.focus({ preventScroll: true }); }
    }
  });
  document.addEventListener('pointerdown', event => { if (open && !button.contains(event.target) && !menu.contains(event.target)) setOpen(false); });
  document.addEventListener('scroll', event => { if (open && !menu.contains(event.target)) setOpen(false, true); }, true);
  window.addEventListener('resize', () => setOpen(false, true));
  select.addEventListener('change', refresh); refresh();
  return { refresh, close: () => setOpen(false) };
}
