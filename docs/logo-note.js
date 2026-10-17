// The logo has its own physical timing; ordinary UI transitions stay at 220 ms.
const COLUMNS = [7, 15, 23];
const PITCHES = [['E4', 64], ['F4', 65], ['G4', 67], ['A4', 69], ['B4', 71], ['C5', 72], ['D5', 74], ['E5', 76], ['F5', 77]];
const GRAVITY = 0.00017; // SVG units / ms², shared by the jump and its small rebound.
const PREPARE = 120, LAUNCH = 40, IMPACT = 58, REBOUND = 210, SETTLE = 150;
const HEAD_HEIGHT = Math.hypot(2.7 * Math.sin(Math.PI / 9), 1.8 * Math.cos(Math.PI / 9));
const smooth = value => value * value * (3 - 2 * value);
const mix = (a, b, amount) => a + (b - a) * amount;

export function logoNote({ column, step }) {
  if (!Number.isInteger(column) || column < 0 || column > 2 || !Number.isInteger(step) || step < 0 || step > 8) throw new RangeError('Invalid logo note');
  const [pitch, midi] = PITCHES[step];
  return Object.freeze({ column, step, x: COLUMNS[column], y: 23 - step * 2, pitch, midi });
}

export const INITIAL_NOTE = logoNote({ column: 2, step: 2 });

export function nextLogoNote(current, random = Math.random) {
  const previous = current.column * 9 + current.step;
  let index = Math.min(25, Math.max(0, Math.floor(random() * 26)));
  if (index >= previous) index++;
  return logoNote({ column: Math.floor(index / 9), step: index % 9 });
}

export function planNoteJump(from, to) {
  const apex = Math.max(3.6, Math.min(from.y, to.y) - 5.5 - Math.abs(to.x - from.x) * 0.08);
  const rise = Math.sqrt(2 * (from.y - apex) / GRAVITY), fall = Math.sqrt(2 * (to.y - apex) / GRAVITY);
  const flight = rise + fall, takeoff = PREPARE + LAUNCH, touchdown = takeoff + flight;
  return { from, to, rise, flight, takeoff, touchdown, duration: touchdown + IMPACT + REBOUND + SETTLE };
}

// Sampling by elapsed time keeps the same trajectory at 60, 120 or 144 Hz.
export function sampleNoteJump(plan, elapsed) {
  const { from, to, takeoff, touchdown, duration } = plan;
  let x = from.x, y = from.y, scaleY = 1, phase = 'rest';
  if (elapsed < PREPARE) {
    phase = 'prepare'; scaleY = mix(1, 0.68, smooth(Math.max(0, elapsed) / PREPARE));
  } else if (elapsed < takeoff) {
    phase = 'launch'; scaleY = mix(0.68, 1.18, smooth((elapsed - PREPARE) / LAUNCH));
  } else if (elapsed < touchdown) {
    const time = elapsed - takeoff, progress = time / plan.flight;
    phase = time < plan.rise ? 'rise' : 'fall';
    x = mix(from.x, to.x, progress);
    y = from.y - GRAVITY * plan.rise * time + GRAVITY * time * time / 2;
    scaleY = time < plan.rise
      ? mix(1.18, 1, smooth(time / plan.rise))
      : mix(1, 1.1, smooth((time - plan.rise) / (plan.flight - plan.rise)));
  } else {
    x = to.x; y = to.y;
    const time = elapsed - touchdown;
    if (time < IMPACT) {
      phase = 'impact'; scaleY = mix(1.1, 0.66, smooth(time / IMPACT));
    } else if (time < IMPACT + REBOUND) {
      phase = 'rebound'; const progress = (time - IMPACT) / REBOUND;
      y -= GRAVITY * REBOUND * REBOUND / 2 * progress * (1 - progress);
      scaleY = progress < 0.24
        ? mix(0.66, 1.12, smooth(progress / 0.24))
        : mix(1.12, 1.06, smooth((progress - 0.24) / 0.76));
    } else if (elapsed < duration) {
      phase = 'settle'; const progress = (time - IMPACT - REBOUND) / SETTLE;
      scaleY = 1 + 0.06 * Math.cos(progress * Math.PI * 3) * (1 - progress) ** 2;
    }
  }
  const scaleX = 1 + (1 - scaleY) * (scaleY < 1 ? 0.85 : 0.65);
  // Squash around the bottom of the tilted notehead, so it rests on its landing.
  return { x, y: y + HEAD_HEIGHT * (1 - scaleY), scaleX, scaleY, phase };
}

export function createLogoNote(button, { random = Math.random, env = globalThis } = {}) {
  const position = button.querySelector('[data-note-position]'), body = button.querySelector('[data-note-body]');
  const document = button.ownerDocument, preference = env.matchMedia('(prefers-reduced-motion: reduce)');
  let current = INITIAL_NOTE, active, request = null, queued = false, queuedNote, disposed = false, sequence = 0;
  const paint = frame => {
    position.setAttribute('transform', `translate(${frame.x} ${frame.y})`);
    body.setAttribute('transform', `scale(${frame.scaleX} ${frame.scaleY})`);
    button.dataset.notePhase = frame.phase;
  };
  const rest = note => paint({ ...note, scaleX: 1, scaleY: 1, phase: 'rest' });
  const emit = (phase, jump, extra = {}) => button.dispatchEvent(new env.CustomEvent(`pentagrama:note-${phase}`, {
    bubbles: true, detail: Object.freeze({ note: jump.plan.to, sequence: jump.sequence, reducedMotion: jump.reducedMotion, ...extra }),
  }));
  function finish(cancelled = false) {
    if (!active) return;
    env.cancelAnimationFrame(request); request = null;
    const jump = active; active = undefined; current = jump.plan.to; rest(current);
    emit('rest', jump, { cancelled });
    if (queued && !cancelled) { const next = queuedNote; queued = false; queuedNote = undefined; jumpTo(next); }
    else { queued = false; queuedNote = undefined; }
  }
  function tick(timestamp) {
    if (!active) return;
    const jump = active; jump.started ??= timestamp;
    const elapsed = timestamp - jump.started;
    paint(sampleNoteJump(jump.plan, elapsed));
    if (!jump.landed && elapsed >= jump.plan.touchdown) { jump.landed = true; emit('land', jump); }
    if (active !== jump) return;
    if (elapsed >= jump.plan.duration) finish();
    else request = env.requestAnimationFrame(tick);
  }
  function jumpTo(destination) {
    if (disposed || document.hidden) return false;
    const target = destination ? logoNote(destination) : undefined;
    // Keep at most one next jump. Repeated clicks cannot interrupt an airborne note.
    if (active) { queued = true; queuedNote = target; return true; }
    const to = target || nextLogoNote(current, random);
    const jump = { plan: planNoteJump(current, to), sequence: ++sequence, reducedMotion: preference.matches, landed: false };
    active = jump; emit('start', jump);
    if (active !== jump) return true;
    if (jump.reducedMotion) { rest(to); jump.landed = true; emit('land', jump); finish(); }
    else { paint(sampleNoteJump(jump.plan, 0)); request = env.requestAnimationFrame(tick); }
    return true;
  }
  const click = () => jumpTo();
  const visibility = () => { if (document.hidden) finish(true); };
  const reduce = () => { if (preference.matches) finish(true); };
  const leave = () => finish(true);
  rest(current);
  button.addEventListener('click', click);
  document.addEventListener('visibilitychange', visibility);
  preference.addEventListener('change', reduce);
  env.addEventListener('pagehide', leave);
  return {
    jumpTo,
    destroy() {
      disposed = true; finish(true);
      button.removeEventListener('click', click);
      document.removeEventListener('visibilitychange', visibility);
      preference.removeEventListener('change', reduce);
      env.removeEventListener('pagehide', leave);
    },
  };
}
