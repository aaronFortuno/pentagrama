(() => {
  const promo = document.querySelector('#project-promo');
  if (!promo) return;
  const progress = promo.querySelector('.promo-progress');
  const link = promo.querySelector('a');
  const close = promo.querySelector('.promo-close');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const arrival = [
    { opacity: 0, transform: 'translate(18px, 12px)' },
    { opacity: 1, transform: 'translate(0, 0)' },
  ];
  let countdown;
  let entrance;
  let leaving = false;

  function updateCountdown() {
    if (!countdown || leaving || countdown.playState === 'finished') return;
    if (document.hidden || promo.matches(':hover, :focus-within')) countdown.pause();
    else countdown.play();
  }

  function dismiss() {
    if (leaving) return;
    leaving = true;
    countdown?.cancel();
    document.removeEventListener('visibilitychange', updateCountdown);
    if (promo.contains(document.activeElement)) document.querySelector(promo.dataset.returnFocus)?.focus({ preventScroll: true });
    promo.inert = true;
    const current = getComputedStyle(promo);
    const start = { opacity: current.opacity, transform: current.transform };
    entrance?.cancel();
    const exit = promo.animate([start, arrival[0]], {
      duration: reducedMotion.matches ? 0 : 230, easing: 'ease-in', fill: 'forwards',
    });
    exit.finished.then(() => { promo.hidden = true; });
  }

  function show() {
    promo.hidden = false;
    entrance = promo.animate(arrival, { duration: reducedMotion.matches ? 0 : 260, easing: 'ease-out' });
    countdown = progress.animate([{ transform: 'scaleX(1)' }, { transform: 'scaleX(0)' }], {
      duration: 12_000, fill: 'forwards',
    });
    countdown.finished.then(dismiss, () => {});
    document.addEventListener('visibilitychange', updateCountdown);
    updateCountdown();
  }

  const schedule = () => setTimeout(show, 1000);
  if (document.readyState === 'complete') schedule();
  else window.addEventListener('load', schedule, { once: true });
  promo.addEventListener('pointerenter', updateCountdown);
  promo.addEventListener('pointerleave', updateCountdown);
  promo.addEventListener('focusin', updateCountdown);
  promo.addEventListener('focusout', () => requestAnimationFrame(updateCountdown));
  promo.addEventListener('keydown', event => {
    if (event.key !== 'Escape') return;
    event.preventDefault();
    dismiss();
  });
  link.addEventListener('click', dismiss);
  close.addEventListener('click', dismiss);
})();
