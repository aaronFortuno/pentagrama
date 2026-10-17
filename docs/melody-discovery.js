import { MELODIES } from './melodies.js?v=1.10.0';
import { createMelodyPlayer } from './melody-player.js?v=1.10.0';
import { createWordmark } from './wordmark.js?v=1.10.0';
import { openDialog, closeDialog } from './motion.js?v=1.10.0';

export const DISCOVERY_CLICKS = 5;

export function createMelodyDiscovery({ button, note, player, home, trigger, dialog, t, notify }) {
  const document = button.ownerDocument, $ = id => document.getElementById(id);
  const wordmark = createWordmark(home, trigger);
  let clicks = 0, lastClick = 0, selected, next = 0, state = 'idle';
  function refresh({ immediate = true } = {}) {
    const playing = state === 'playing' || state === 'loading';
    button.dataset.melodyState = state;
    button.setAttribute('aria-label', t(playing ? 'stopMelody' : 'jumpNote')); button.title = button.getAttribute('aria-label');
    if (!selected) return;
    const name = t(`melody_${selected.id}_title`);
    trigger.setAttribute('aria-label', t('aboutMelody', { name })); trigger.title = t('aboutMelody', { name });
    wordmark.change(t(`melody_${selected.id}_label`), { immediate });
    $('melody-title').textContent = name;
    $('melody-composer').textContent = `${selected.composer} · ${selected.work}`;
    $('melody-story').textContent = t(`melody_${selected.id}_story`);
    $('melody-reason').textContent = t(`melody_${selected.id}_reason`);
    $('melody-source').href = selected.source;
    $('melody-source').textContent = `Mutopia · ${selected.credit || 'Public Domain'}`;
  }
  const playback = createMelodyPlayer({ note, player, document, onState(value) {
    state = value;
    button.dataset.melodyState = value;
    const playing = value === 'playing' || value === 'loading';
    button.setAttribute('aria-label', t(playing ? 'stopMelody' : 'jumpNote')); button.title = button.getAttribute('aria-label');
    if (value === 'unavailable') notify(t('melodyUnavailable'));
  } });
  function play(melody) {
    selected = melody; clicks = 0; refresh({ immediate: false });
    $('melody-announcement').textContent = t('melodyDiscovered', { name: t(`melody_${melody.id}_title`) });
    return playback.play(melody);
  }
  const click = () => {
    if (playback.active) { playback.stop(); return; }
    const now = Date.now(); clicks = now - lastClick > 12_000 ? 1 : clicks + 1; lastClick = now;
    if (clicks >= DISCOVERY_CLICKS) { const melody = MELODIES[next++ % MELODIES.length]; play(melody); }
    else note.jumpTo();
  };
  const showInfo = () => { if (selected) { playback.stop(); openDialog(dialog); } };
  const closeForPlayback = () => closeDialog(dialog).then(() => button.focus({ preventScroll: true }));
  const replay = () => { closeForPlayback(); play(selected); };
  const another = () => { closeForPlayback(); const index = (MELODIES.indexOf(selected) + 1) % MELODIES.length; next = index + 1; play(MELODIES[index]); };
  const reset = () => {
    playback.stop(); selected = undefined; clicks = 0; closeDialog(dialog); wordmark.change().then(() => home.focus({ preventScroll: true }));
    $('melody-announcement').textContent = '';
  };
  button.addEventListener('click', click); trigger.addEventListener('click', showInfo);
  $('melody-replay').addEventListener('click', replay); $('melody-next').addEventListener('click', another); $('melody-reset').addEventListener('click', reset);
  return {
    refresh,
    destroy() {
      playback.destroy(); wordmark.destroy(); button.removeEventListener('click', click); trigger.removeEventListener('click', showInfo);
      $('melody-replay').removeEventListener('click', replay); $('melody-next').removeEventListener('click', another); $('melody-reset').removeEventListener('click', reset);
    },
  };
}
