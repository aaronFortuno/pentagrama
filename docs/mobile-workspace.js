// The mobile settings sheet is independent of the printable document and its history.
export function sheetDragOffset({ open, travel, delta }) {
  return Math.max(0, Math.min(travel, (open ? 0 : travel) + delta));
}

// Only the handle owns this gesture; fields, sliders and action buttons keep their input.
export function bindSheetDrag({ handle, enabled, read, move, settle }) {
  let drag, suppressClick = false;
  handle.addEventListener('pointerdown', event => {
    if (!enabled() || !event.isPrimary || event.button !== 0 || event.target.closest('button:not(#toggle-settings)')) return;
    const state = read();
    drag = { ...state, id: event.pointerId, y: event.clientY, delta: 0, moved: false };
    handle.setPointerCapture(event.pointerId);
  });
  handle.addEventListener('pointermove', event => {
    if (drag?.id !== event.pointerId) return;
    drag.delta = event.clientY - drag.y;
    if (!drag.moved && Math.abs(drag.delta) < 6) return;
    drag.moved = true;
    move(sheetDragOffset({ ...drag, delta: drag.delta }));
    event.preventDefault();
  });
  function finish(event) {
    if (drag?.id !== event.pointerId) return;
    const previous = drag; drag = undefined;
    if (previous.moved) {
      const cancelled = event.type !== 'pointerup';
      const threshold = Math.min(36, previous.travel * .2);
      const open = cancelled || Math.abs(previous.delta) < threshold ? previous.open : previous.delta < 0;
      suppressClick = !cancelled;
      settle(open);
    }
    if (handle.hasPointerCapture(event.pointerId)) handle.releasePointerCapture(event.pointerId);
  }
  for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) handle.addEventListener(type, finish);
  handle.addEventListener('click', event => {
    if (suppressClick && event.detail !== 0) { event.preventDefault(); event.stopImmediatePropagation(); }
    suppressClick = false;
  }, true);
}

export function bindMobileWorkspace({ t, onOpen, onClose, root = document } = {}) {
  const get = id => root.getElementById(id), workspace = get('workspace');
  const panel = root.querySelector('.settings'), content = get('settings-content');
  const toggle = get('toggle-settings'), label = get('mobile-settings-label'), stage = get('paper-stage');
  const header = get('settings-header'), actions = panel.querySelector('.settings-top');
  const media = window.matchMedia('(max-width:760px)');
  let open = false;
  function refresh() {
    const action = open ? 'hideSettings' : 'showSettings';
    toggle.dataset.aria = action; toggle.setAttribute('aria-label', t(action));
    label.dataset.i18n = open ? 'settings' : 'showSettings'; label.textContent = t(label.dataset.i18n);
  }
  function measure() {
    if (!media.matches) return;
    const handleHeight = header.offsetHeight + panel.clientTop;
    workspace.style.setProperty('--settings-handle-height', `${handleHeight}px`);
    workspace.style.setProperty('--settings-visible-height', `${open ? panel.offsetHeight : handleHeight}px`);
  }
  function viewport() {
    const visual = window.visualViewport;
    const height = visual && visual.scale === 1 ? visual.height : window.innerHeight;
    root.documentElement.style.setProperty('--mobile-viewport-height', `${height}px`);
    measure();
  }
  function setOpen(value, { focus = false } = {}) {
    panel.classList.remove('sheet-dragging'); panel.style.removeProperty('--sheet-offset');
    const next = media.matches && value;
    if (next !== open) { open = next; if (open) onOpen?.(); else onClose?.(); }
    workspace.dataset.settingsOpen = String(open);
    toggle.setAttribute('aria-expanded', String(open));
    refresh();
    const restoreFocus = focus || content.contains(root.activeElement) || actions.contains(root.activeElement);
    content.inert = media.matches && !open;
    actions.inert = media.matches && !open;
    content.tabIndex = media.matches ? 0 : -1;
    if (media.matches) content.setAttribute('aria-hidden', String(!open)); else content.removeAttribute('aria-hidden');
    if (!open && restoreFocus && media.matches) toggle.focus({ preventScroll: true });
    measure();
  }
  function breakpoint() {
    if (!media.matches) workspace.style.removeProperty('--settings-visible-height');
    setOpen(false); viewport();
  }
  header.addEventListener('click', event => {
    if (!event.target.closest('button:not(#toggle-settings)')) setOpen(!open);
  });
  bindSheetDrag({ handle: header, enabled: () => media.matches,
    read: () => ({ open, travel: Math.max(0, panel.offsetHeight - header.offsetHeight - panel.clientTop) }),
    move(offset) {
      panel.classList.add('sheet-dragging'); panel.style.setProperty('--sheet-offset', `${offset}px`);
      workspace.style.setProperty('--settings-visible-height', `${panel.offsetHeight - offset}px`);
    }, settle: value => setOpen(value) });
  stage.addEventListener('pointerdown', event => {
    if (!open || !event.isPrimary || event.button !== 0) return;
    setOpen(false); event.preventDefault(); event.stopImmediatePropagation();
  }, true);
  root.addEventListener('keydown', event => {
    if (event.key !== 'Escape' || event.defaultPrevented || !open || root.querySelector('dialog[open], [role="combobox"][aria-expanded="true"], #language-button[aria-expanded="true"]')) return;
    event.preventDefault(); setOpen(false, { focus: true });
  });
  media.addEventListener('change', breakpoint);
  const sizes = new ResizeObserver(measure); sizes.observe(panel); sizes.observe(workspace); sizes.observe(header);
  window.visualViewport?.addEventListener('resize', viewport);
  window.addEventListener('resize', viewport);
  breakpoint();
  return { close: () => setOpen(false), refresh, get open() { return open; } };
}
