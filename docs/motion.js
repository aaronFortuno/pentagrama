// Animate surviving cards into their new positions after library changes.
// CSS and JavaScript share the same duration and easing, including reduced motion.
export function animateReflow(container, change) {
  const style = getComputedStyle(document.documentElement), duration = parseFloat(style.getPropertyValue('--motion-duration')) || 0;
  if (!duration || container.closest('[inert]')) { change(); return; }
  const before = new Map([...container.querySelectorAll('[data-motion-key]')].map(element => [element.dataset.motionKey, element.getBoundingClientRect()]));
  change();
  const easing = style.getPropertyValue('--motion-ease').trim();
  container.querySelectorAll('[data-motion-key]').forEach(element => {
    const previous = before.get(element.dataset.motionKey), current = element.getBoundingClientRect();
    if (previous && (previous.x !== current.x || previous.y !== current.y)) {
      element.animate([{ translate: `${previous.x - current.x}px ${previous.y - current.y}px` }, { translate: '0 0' }], { duration, easing });
    } else if (!previous) element.animate([{ opacity: 0 }, { opacity: 1 }], { duration, easing });
  });
}
