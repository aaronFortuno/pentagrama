const selector = 'a[href],button,input,textarea,select,summary,[tabindex]';
export function bindSkipLinks(root = document) {
  root.querySelectorAll('a.skip-link').forEach(link => {
    const target = root.getElementById(link.getAttribute('href').split('#').at(-1));
    if (!target) return;
    // A localized page has a shared <base>, and its hash may contain a layout.
    // Move focus without navigating away or replacing that configuration.
    link.href = location.pathname + location.search + '#' + target.id;
    link.addEventListener('click', event => { if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return; event.preventDefault(); target.focus(); });
  });
}
export function tabStops(root) {
  return [...root.querySelectorAll(selector)].filter(element => element.tabIndex >= 0 && !element.matches(':disabled') && !element.closest('[hidden],[inert]') && element.getClientRects().length);
}
// Modeless panels are appended to the body for clipping. Tab still continues
// beside their opener rather than jumping to the end of the document.
export function bindPopoverFocus(panel, { trigger, close }) {
  panel.ownerDocument.addEventListener('wheel', event => {
    if (panel.hidden || panel.inert || !trigger() || panel.contains(event.target)) return;
    const opener = trigger(); close(); opener.focus({ preventScroll: true });
  }, { passive: true });
  panel.addEventListener('keydown', event => {
    if (event.key !== 'Tab') return;
    const stops = tabStops(panel), current = panel.ownerDocument.activeElement;
    if (current !== (event.shiftKey ? stops[0] : stops.at(-1))) return;
    event.preventDefault();
    const opener = trigger(), page = tabStops(panel.ownerDocument).filter(element => !panel.contains(element));
    const next = event.shiftKey ? opener : page[page.indexOf(opener) + 1] || opener;
    close(); next?.focus();
  });
}
