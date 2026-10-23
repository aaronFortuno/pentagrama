import { iconMarkup } from './icons.js?v=2.8.0';
import { showPopover } from './motion.js?v=2.8.0';

export function bindSelectControl(select, button, menu, { onOpen, minWidth = 130 } = {}) {
  let open = false, signature, active = select.selectedIndex;
  document.body.append(menu);
  function highlight(index) {
    const options = [...menu.children]; if (!options.length) return;
    active = Math.max(0, Math.min(options.length - 1, index));
    options.forEach((option, n) => {
      option.dataset.active = String(open && n === active);
      option.setAttribute('aria-selected', String(n === (open ? active : select.selectedIndex)));
    });
    const option = options[active];
    if (open) button.setAttribute('aria-activedescendant', option.id);
    if (option.offsetTop < menu.scrollTop) menu.scrollTop = option.offsetTop;
    else if (option.offsetTop + option.offsetHeight > menu.scrollTop + menu.clientHeight) menu.scrollTop = option.offsetTop + option.offsetHeight - menu.clientHeight;
  }
  function setOpen(value, returnFocus = false, index = select.selectedIndex) {
    if (value === open) { if (open) highlight(index); return; }
    open = value; button.setAttribute('aria-expanded', String(open));
    if (open) {
      onOpen?.();
      const rect = button.getBoundingClientRect(), width = Math.max(minWidth, rect.width), height = Math.min(menu.children.length * 38 + 14, innerHeight - 24);
      menu.style.width = Math.min(width, innerWidth - 24) + 'px';
      menu.style.left = Math.max(12, Math.min(rect.left, innerWidth - width - 12)) + 'px';
      menu.style.top = (rect.bottom + 8 + height > innerHeight ? Math.max(12, rect.top - height - 8) : rect.bottom + 8) + 'px';
    } else button.removeAttribute('aria-activedescendant');
    showPopover(menu, open); highlight(index);
    if (returnFocus) button.focus({ preventScroll: true });
  }
  function commit(index = active, returnFocus = true) {
    const option = select.options[index]; if (!option || select.disabled) return;
    const changed = select.value !== option.value;
    select.value = option.value;
    if (changed) select.dispatchEvent(new Event('change', { bubbles: true }));
    refresh(); setOpen(false, returnFocus);
  }
  function refresh() {
    const values = JSON.stringify([...select.options].map(option => option.value));
    if (values !== signature) {
      setOpen(false); menu.replaceChildren(); signature = values;
      for (const [index, option] of [...select.options].entries()) {
        const item = document.createElement('button'); item.type = 'button'; item.tabIndex = -1; item.id = menu.id + '-option-' + index; item.setAttribute('role', 'option');
        item.append(document.createTextNode(option.textContent)); const check = document.createElement('span'); check.innerHTML = iconMarkup('check'); item.append(check);
        item.addEventListener('mousedown', event => event.preventDefault());
        item.addEventListener('click', () => commit(index)); menu.append(item);
      }
    }
    button.querySelector('[data-select-value]').textContent = select.options[select.selectedIndex]?.textContent || '';
    [...menu.children].forEach((option, index) => { option.firstChild.textContent = select.options[index]?.textContent || ''; });
    highlight(open ? active : select.selectedIndex);
  }
  button.addEventListener('click', () => setOpen(!open, false));
  button.addEventListener('keydown', event => {
    if (event.ctrlKey || event.metaKey || event.altKey && event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return;
    if (event.key === 'Tab') { if (open) commit(active, false); return; }
    if (event.key === 'Escape') { if (open) { event.preventDefault(); event.stopPropagation(); setOpen(false); } return; }
    if (['Enter',' '].includes(event.key)) { event.preventDefault(); if (open) commit(); else setOpen(true); return; }
    const next = { ArrowDown: open ? active + 1 : select.selectedIndex, ArrowUp: open ? active - 1 : select.selectedIndex, Home: 0, End: menu.children.length - 1 }[event.key];
    if (next !== undefined) {
      event.preventDefault();
      if (open && event.altKey && event.key === 'ArrowUp') commit();
      else setOpen(true, false, next);
    } else if (event.key.length === 1) {
      const initial = text => text.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase();
      const options = [...select.options], start = open ? active : select.selectedIndex;
      const ordered = options.map((option, index) => ({ option, index })).slice(start + 1).concat(options.map((option, index) => ({ option, index })).slice(0, start + 1));
      const match = ordered.find(({ option }) => initial(option.textContent).startsWith(initial(event.key)));
      if (match) { event.preventDefault(); setOpen(true, false, match.index); }
    }
  });
  document.addEventListener('pointerdown', event => { if (open && !button.contains(event.target) && !menu.contains(event.target)) setOpen(false); });
  document.addEventListener('focusin', event => { if (open && !button.contains(event.target) && !menu.contains(event.target)) setOpen(false); });
  document.addEventListener('scroll', event => { if (open && !menu.contains(event.target) && document.activeElement !== button && !menu.contains(document.activeElement)) setOpen(false, true); }, true);
  document.addEventListener('wheel', event => { if (open && !menu.contains(event.target)) setOpen(false, true); }, { passive: true });
  window.addEventListener('resize', () => setOpen(false, true));
  select.addEventListener('change', refresh); refresh();
  return { refresh, close: () => setOpen(false) };
}
