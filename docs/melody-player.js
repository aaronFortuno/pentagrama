import { melodyNote, planMelody } from './melodies.js?v=1.15.1';

// Audio schedules slightly ahead; drawing follows the same output clock.
// A stalled frame never causes a burst of missed notes or an accumulating drift.
export function createMelodyPlayer({ note, player, document, env = globalThis, onState = () => {} }) {
  let generation = 0, frame, control, active = false, disposed = false;
  function stop(reason = 'stopped') {
    generation++; env.cancelAnimationFrame(frame); frame = undefined;
    player.stopAll(); control?.release(); control = undefined;
    if (active) { active = false; onState(reason); }
  }
  async function play(melody) {
    if (disposed || document.hidden) return false;
    stop(); const token = generation;
    active = true; onState('loading', melody);
    try { planMelody(melody, note.current); } catch { stop('unavailable'); return false; }
    // prepare() unlocks synchronously in the user's gesture, before awaiting.
    const ready = await Promise.all([...new Set(melody.notes.filter(n => n.pitch).map(n => n.pitch))].map(pitch => {
      return player.prepare(melodyNote(pitch, 0).midi);
    })).catch(() => []);
    if (token !== generation || disposed || document.hidden) return false;
    if (!ready.length || ready.some(value => !value)) { stop('unavailable'); return false; }
    control = note.takeControl(); player.stopAll();
    const timeline = planMelody(melody, note.current);
    const origin = player.currentTime + .08;
    let scheduled = 0, visible = 0;
    onState('playing', melody);
    function tick() {
      if (token !== generation || document.hidden) return;
      if (!player.isReady(timeline.entries[0].note.midi)) { stop('unavailable'); return; }
      const audioTime = (player.currentTime - origin) * 1000;
      const visualTime = ((player.presentationTime ?? player.currentTime) - origin) * 1000;
      while (scheduled < timeline.entries.length && timeline.entries[scheduled].at <= audioTime + 220) {
        const entry = timeline.entries[scheduled++];
        if (entry.at >= audioTime - 35) player.play(entry.note.midi, { when: origin + entry.at / 1000 });
      }
      while (visible < timeline.entries.length - 1 && timeline.entries[visible + 1].start <= visualTime) visible++;
      const entry = timeline.entries[visible];
      if (visualTime >= entry.start) control.paint(entry.plan, Math.min(entry.plan.duration, visualTime - entry.start));
      if (visualTime >= timeline.duration) {
        control.release(); control = undefined; active = false; frame = undefined; onState('ended', melody); return;
      }
      frame = env.requestAnimationFrame(tick);
    }
    frame = env.requestAnimationFrame(tick); return true;
  }
  const hide = () => { if (document.hidden) stop(); };
  const leave = () => stop();
  document.addEventListener('visibilitychange', hide); env.addEventListener('pagehide', leave); env.addEventListener('beforeprint', leave);
  return {
    play, stop, get active() { return active; },
    destroy() { stop(); disposed = true; document.removeEventListener('visibilitychange', hide); env.removeEventListener('pagehide', leave); env.removeEventListener('beforeprint', leave); },
  };
}
