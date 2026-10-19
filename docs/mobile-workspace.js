// The mobile settings sheet is independent of the printable document and its history.
export function mobilePreviewSpace({ height, panelHeight, handleHeight, open }) {
  const available = Math.max(0, height);
  const covered = Math.min(available, Math.max(0, open ? panelHeight : handleHeight));
  return { covered, preview: available - covered };
}

export function bindMobileWorkspace({ t, onOpen, onClose, root = document } = {}) {
  const get = id => root.getElementById(id), workspace = get('workspace');
  const panel = root.querySelector('.settings'), content = get('settings-content');
  const toggle = get('toggle-settings'), label = get('mobile-settings-label'), stage = get('paper-stage');
  const media = window.matchMedia('(max-width:760px)');
  let open = false;
  function refresh() {
    const action = open ? 'hideSettings' : 'showSettings';
    toggle.dataset.aria = action; toggle.setAttribute('aria-label', t(action));
    label.dataset.i18n = open ? 'settings' : 'showSettings'; label.textContent = t(label.dataset.i18n);
  }
  function measure() {
    if (!media.matches) return;
    const handleHeight = toggle.offsetHeight + panel.clientTop;
    workspace.style.setProperty('--settings-handle-height', `${handleHeight}px`);
    const space = mobilePreviewSpace({ height: workspace.clientHeight, panelHeight: panel.offsetHeight, handleHeight, open });
    workspace.style.setProperty('--settings-visible-height', `${space.covered}px`);
  }
  function viewport() {
    const visual = window.visualViewport;
    const height = visual && visual.scale === 1 ? visual.height : window.innerHeight;
    root.documentElement.style.setProperty('--mobile-viewport-height', `${height}px`);
    measure();
  }
  function setOpen(value, { focus = false } = {}) {
    const next = media.matches && value;
    if (next !== open) { open = next; if (open) onOpen?.(); else onClose?.(); }
    workspace.dataset.settingsOpen = String(open);
    toggle.setAttribute('aria-expanded', String(open));
    refresh();
    const restoreFocus = focus || content.contains(root.activeElement);
    content.inert = media.matches && !open;
    content.tabIndex = media.matches ? 0 : -1;
    if (media.matches) content.setAttribute('aria-hidden', String(!open)); else content.removeAttribute('aria-hidden');
    if (!open && restoreFocus && media.matches) toggle.focus({ preventScroll: true });
    measure();
  }
  function breakpoint() {
    if (!media.matches) workspace.style.removeProperty('--settings-visible-height');
    setOpen(false); viewport();
  }
  toggle.addEventListener('click', () => setOpen(!open));
  stage.addEventListener('pointerdown', event => {
    if (!open || !event.isPrimary || event.button !== 0) return;
    setOpen(false); event.preventDefault(); event.stopImmediatePropagation();
  }, true);
  root.addEventListener('keydown', event => {
    if (event.key !== 'Escape' || event.defaultPrevented || !open || root.querySelector('dialog[open], [role="combobox"][aria-expanded="true"], #language-button[aria-expanded="true"]')) return;
    event.preventDefault(); setOpen(false, { focus: true });
  });
  media.addEventListener('change', breakpoint);
  const sizes = new ResizeObserver(measure); sizes.observe(panel); sizes.observe(workspace); sizes.observe(toggle);
  window.visualViewport?.addEventListener('resize', viewport);
  window.addEventListener('resize', viewport);
  breakpoint();
  return { close: () => setOpen(false), refresh, get open() { return open; } };
}
