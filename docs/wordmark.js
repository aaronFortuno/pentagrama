import { motionOptions } from './motion.js?v=2.0.0-alpha.1';

// The red period lives outside both labels and is never replaced or faded out.
export function createWordmark(home, trigger) {
  let generation = 0, animations = [];
  const cancel = () => { for (const animation of animations) animation.cancel(); animations = []; };
  function letters(element, text) {
    element.replaceChildren(...Array.from(text, letter => {
      const span = element.ownerDocument.createElement('span'); span.className = 'wordmark-letter'; span.textContent = letter; return span;
    }));
  }
  async function change(text, { immediate = false } = {}) {
    if (!animations.length && home.hidden === Boolean(text) && (text ? trigger : home).textContent === (text || 'pentagrama')) return;
    const token = ++generation; cancel();
    const source = home.hidden ? trigger : home, target = text ? trigger : home;
    const options = motionOptions(), moving = options.duration && !immediate;
    async function transition(element, opening) {
      const spans = [...element.children], widths = spans.map(span => span.getBoundingClientRect().width);
      animations = spans.map((span, index) => span.animate([
        { width: `${opening ? 0 : widths[index]}px`, opacity: opening ? 0 : 1, transform: opening ? 'translateX(-5px)' : 'none' },
        { width: `${opening ? widths[index] : 0}px`, opacity: opening ? 1 : 0, transform: opening ? 'none' : 'translateX(-5px)' },
      ], { ...options, delay: (opening ? index : spans.length - index - 1) * 18, fill: 'both' }));
      await Promise.all(animations.map(animation => animation.finished.catch(() => {})));
    }
    if (moving) await transition(source, false);
    if (token !== generation) return;
    cancel(); home.hidden = Boolean(text); trigger.hidden = !text;
    letters(target, text || 'pentagrama');
    if (moving) await transition(target, true);
    if (token === generation) cancel();
  }
  letters(home, 'pentagrama');
  return { change, destroy() { generation++; cancel(); } };
}
