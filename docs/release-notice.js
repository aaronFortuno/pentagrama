import { iconMarkup } from './icons.js?v=2.0.0';
import { motionOptions } from './motion.js?v=2.0.0';

export const RELEASE_NOTICE_KEY = 'pentagrama.release-notice.v1';
export const RELEASE_NOTICE_DURATION = 12000;

export function shouldAnnounceRelease(release, seen) {
  return Boolean(release.version && release.announcement?.length && seen !== release.version);
}

// One clock drives both expiry and the progress bar. Independent pause reasons
// prevent a mouse exit from restarting a notice that still has keyboard focus.
export function createNoticeTimer({ duration = RELEASE_NOTICE_DURATION, now = () => performance.now(),
  schedule = setTimeout, cancel = clearTimeout, onState = () => {}, onExpire = () => {} } = {}) {
  let remaining = duration, started = now(), timeout, stopped = false;
  const pauses = new Set();
  function report() { onState({ duration, remaining, paused: pauses.size > 0 }); }
  function start() {
    started = now();
    timeout = schedule(() => { stopped = true; remaining = 0; report(); onExpire(); }, remaining);
    report();
  }
  start();
  return {
    pause(reason) {
      if (stopped || pauses.has(reason)) return;
      if (!pauses.size) { remaining = Math.max(0, remaining - (now() - started)); cancel(timeout); }
      pauses.add(reason); report();
    },
    resume(reason) {
      if (stopped || !pauses.delete(reason)) return;
      if (!pauses.size) start();
    },
    stop() { stopped = true; cancel(timeout); },
  };
}

export function bindReleaseNotice({ release, t, openHistory, root = document, storage } = {}) {
  let seen;
  try { storage ??= window.localStorage; seen = storage.getItem(RELEASE_NOTICE_KEY); } catch { /* Storage is optional. */ }
  if (!shouldAnnounceRelease(release, seen)) return;
  const notice = root.createElement('div'); notice.className = 'release-notice';
  notice.setAttribute('role', 'status'); notice.setAttribute('aria-live', 'polite');
  const action = root.createElement('button'); action.type = 'button'; action.className = 'release-notice-content';
  action.setAttribute('aria-haspopup', 'dialog'); action.setAttribute('aria-controls', 'version-dialog');
  const heading = root.createElement('strong'); heading.textContent = `Pentagrama · ${release.version}`; action.append(heading);
  for (const key of release.announcement) {
    const line = root.createElement('span'); line.dataset.i18n = key; line.textContent = t(key); action.append(line);
  }
  const close = root.createElement('button'); close.type = 'button'; close.className = 'icon-button release-notice-close';
  close.dataset.aria = 'close'; close.setAttribute('aria-label', t('close')); close.innerHTML = iconMarkup('x');
  const progress = root.createElement('span'); progress.className = 'release-notice-progress'; progress.setAttribute('aria-hidden', 'true');
  notice.append(action, close, progress); root.body.append(notice);
  const animation = progress.animate([{ transform: 'scaleX(1)' }, { transform: 'scaleX(0)' }], { duration: RELEASE_NOTICE_DURATION, fill: 'forwards' });
  let dismissed = false;
  function dismiss() {
    if (dismissed) return;
    dismissed = true; clock.stop(); animation.pause();
    if (notice.contains(root.activeElement)) root.getElementById('version-button')?.focus({ preventScroll: true });
    notice.classList.remove('visible'); notice.inert = true;
    root.removeEventListener('visibilitychange', visibility);
    setTimeout(() => { animation.cancel(); notice.remove(); }, motionOptions().duration);
  }
  const clock = createNoticeTimer({ onExpire: dismiss, onState({ remaining, paused }) {
    animation.currentTime = RELEASE_NOTICE_DURATION - remaining;
    if (paused || remaining === 0) animation.pause(); else animation.play();
  } });
  function visibility() { if (root.hidden) clock.pause('hidden'); else clock.resume('hidden'); }
  notice.addEventListener('pointerenter', () => clock.pause('pointer'));
  notice.addEventListener('pointerleave', () => clock.resume('pointer'));
  notice.addEventListener('focusin', () => clock.pause('focus'));
  notice.addEventListener('focusout', event => { if (!notice.contains(event.relatedTarget)) clock.resume('focus'); });
  notice.addEventListener('keydown', event => { if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); dismiss(); } });
  close.addEventListener('click', dismiss);
  action.addEventListener('click', () => { dismiss(); openHistory(); });
  root.addEventListener('visibilitychange', visibility); visibility();
  requestAnimationFrame(() => { if (!dismissed) notice.classList.add('visible'); });
  try { storage?.setItem(RELEASE_NOTICE_KEY, release.version); } catch { /* It still works for this page visit. */ }
  return { dismiss };
}
