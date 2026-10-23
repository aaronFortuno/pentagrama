// CSS and JavaScript share the same timing, including reduced motion.
export function motionOptions() {
  const style = getComputedStyle(document.documentElement), value = style.getPropertyValue('--motion-duration').trim();
  return { duration: (parseFloat(value) || 0) * (value.endsWith('ms') ? 1 : 1000), easing: style.getPropertyValue('--motion-ease').trim() || 'ease' };
}

const motions = new WeakMap();
const dialogFocus = new WeakMap();
function animate(element, frames, done) {
  motions.get(element)?.cancel();
  const animation = element.animate(frames, { ...motionOptions(), fill: 'both' });
  motions.set(element, animation);
  return animation.finished.then(() => {
    if (motions.get(element) !== animation) return;
    motions.delete(element); done?.(); animation.cancel();
  }).catch(() => {});
}

export function openDialog(dialog) {
  const wasOpen = dialog.open, style = wasOpen ? getComputedStyle(dialog) : undefined;
  const from = wasOpen ? { opacity: style.opacity, transform: style.transform } : { opacity: 0, transform: 'translateY(8px) scale(.98)' };
  dialog.dataset.motion = 'opening'; dialog.inert = false;
  if (!wasOpen) {
    dialogFocus.set(dialog, document.activeElement); dialog.setAttribute('aria-modal', 'true'); dialog.showModal();
    const heading = dialog.querySelector('h2,h3');
    if (heading) { heading.tabIndex = -1; heading.focus({ preventScroll: true }); }
  }
  return animate(dialog, [from, { opacity: 1, transform: 'none' }], () => { dialog.dataset.motion = 'open'; });
}

export function closeDialog(dialog) {
  if (!dialog.open || dialog.dataset.motion === 'closing') return Promise.resolve();
  const style = getComputedStyle(dialog), from = { opacity: style.opacity, transform: style.transform };
  dialog.dataset.motion = 'closing'; dialog.inert = true;
  return animate(dialog, [from, { opacity: 0, transform: 'translateY(8px) scale(.98)' }], () => {
    dialog.close(); dialog.inert = false; delete dialog.dataset.motion;
    const previous = dialogFocus.get(dialog); if (previous?.isConnected) previous.focus({ preventScroll: true });
  });
}

export function showPopover(element, visible) {
  const wasHidden = element.hidden, style = wasHidden ? undefined : getComputedStyle(element);
  const from = wasHidden ? { opacity: 0, transform: 'translateY(-6px) scale(.98)' } : { opacity: style.opacity, transform: style.transform };
  element.hidden = false; element.inert = !visible;
  animate(element, [from, visible ? { opacity: 1, transform: 'none' } : { opacity: 0, transform: 'translateY(-6px) scale(.98)' }], () => { element.hidden = !visible; });
}

export function bindAnimatedDetails(details, { onOpen, onChange } = {}) {
  const summary = details.querySelector('summary'), content = document.createElement('div');
  content.className = 'details-content';
  while (summary.nextSibling) content.append(summary.nextSibling);
  details.append(content);
  let expanded = details.open;
  summary.setAttribute('aria-expanded', String(expanded)); content.inert = !expanded;
  function setOpen(opening) {
    if (expanded === opening) return;
    expanded = opening;
    if (opening) onOpen?.();
    onChange?.(opening);
    const from = details.open ? content.getBoundingClientRect().height : 0;
    const opacity = details.open ? getComputedStyle(content).opacity : 0;
    details.open = true; details.dataset.motion = opening ? 'opening' : 'closing'; content.style.overflow = 'hidden';
    summary.setAttribute('aria-expanded', String(opening)); content.inert = !opening;
    if (!opening && content.contains(document.activeElement)) summary.focus({ preventScroll: true });
    const limit = parseFloat(getComputedStyle(content).maxHeight);
    const height = Math.min(content.scrollHeight, Number.isFinite(limit) ? limit : Infinity);
    animate(content, [{ height: `${from}px`, opacity }, { height: `${opening ? height : 0}px`, opacity: opening ? 1 : 0 }], () => {
      details.open = opening; content.style.overflow = ''; delete details.dataset.motion;
    });
  }
  summary.addEventListener('click', event => {
    event.preventDefault(); setOpen(!expanded);
  });
  return { setOpen };
}

// Animate surviving cards into their new positions after library changes.
export function animateReflow(container, change) {
  const { duration, easing } = motionOptions();
  if (!duration || container.closest('[inert]')) { change(); return; }
  const before = new Map([...container.querySelectorAll('[data-motion-key]')].map(element => [element.dataset.motionKey, element.getBoundingClientRect()]));
  change();
  container.querySelectorAll('[data-motion-key]').forEach(element => {
    const previous = before.get(element.dataset.motionKey), current = element.getBoundingClientRect();
    if (previous && (previous.x !== current.x || previous.y !== current.y)) {
      element.animate([{ translate: `${previous.x - current.x}px ${previous.y - current.y}px` }, { translate: '0 0' }], { duration, easing });
    } else if (!previous) element.animate([{ opacity: 0 }, { opacity: 1 }], { duration, easing });
  });
}
