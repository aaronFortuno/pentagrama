import { createMelodyPicker } from './melodies.js?v=2.4.1';
import { createMelodyPlayer } from './melody-player.js?v=2.4.1';
import { createWordmark } from './wordmark.js?v=2.4.1';
import { openDialog, closeDialog } from './motion.js?v=2.4.1';

export const DISCOVERY_CLICKS = 5;

export function createMelodyDiscovery({ button, note, player, home, trigger, dialog, t, notify, track = () => {} }) {
  const document = button.ownerDocument, $ = id => document.getElementById(id);
  const wordmark = createWordmark(home, trigger);
  const pickMelody = createMelodyPicker();
  const portrait = $('melody-portrait'), portraitFrame = portrait.closest('figure');
  const portraitReady = () => portrait.classList.add('loaded');
  const portraitFailed = () => { portraitFrame.hidden = true; };
  portrait.addEventListener('load', portraitReady); portrait.addEventListener('error', portraitFailed);
  let clicks = 0, lastClick = 0, selected, state = 'idle', playbackSource = 'discovery';
  const report = (name, data) => { try { track(name, data); } catch { /* Statistics must never interrupt the music. */ } };
  function refresh({ immediate = true } = {}) {
    const playing = state === 'playing' || state === 'loading';
    button.dataset.melodyState = state;
    button.setAttribute('aria-label', t(playing ? 'stopMelody' : 'jumpNote')); button.dataset.tooltip = button.getAttribute('aria-label');
    $('melody-replay').textContent = t(playing ? 'stopMelody' : 'replayMelody');
    if (!selected) return;
    const name = t(`melody_${selected.id}_title`);
    trigger.setAttribute('aria-label', t('aboutMelody', { name })); trigger.dataset.tooltip = t('aboutMelody', { name });
    wordmark.change(t(`melody_${selected.id}_label`), { immediate });
    $('melody-title').textContent = name;
    $('melody-composer').textContent = `${selected.composer} · ${selected.work}`;
    $('melody-story').textContent = t(`melody_${selected.id}_story`);
    $('melody-reason').textContent = t(`melody_${selected.id}_reason`);
    $('melody-source').href = selected.source;
    $('melody-source').textContent = `Mutopia · ${selected.credit || 'Public Domain'}`;
    if (portrait.dataset.composer !== selected.portrait) {
      portraitFrame.hidden = false; portrait.classList.remove('loaded');
      portrait.dataset.composer = selected.portrait; portrait.src = `./portraits/${selected.portrait}.png`;
    }
    portrait.alt = t(selected.portrait === 'petzold' ? 'portraitImagined' : 'portraitAlt', { name: selected.composer });
    $('portrait-caption').hidden = selected.portrait !== 'petzold';
  }
  const playback = createMelodyPlayer({ note, player, document, onState(value, melody) {
    state = value;
    button.dataset.melodyState = value;
    const playing = value === 'playing' || value === 'loading';
    button.setAttribute('aria-label', t(playing ? 'stopMelody' : 'jumpNote')); button.dataset.tooltip = button.getAttribute('aria-label');
    $('melody-replay').textContent = t(playing ? 'stopMelody' : 'replayMelody');
    if (value === 'unavailable') notify(t('melodyUnavailable'));
    if (value === 'playing') report('melody_started', { melody: melody.id, source: playbackSource });
  } });
  function play(melody, source = 'discovery') {
    playbackSource = source;
    selected = melody; clicks = 0; refresh({ immediate: false });
    $('melody-announcement').textContent = t('melodyDiscovered', { name: t(`melody_${melody.id}_title`) });
    return playback.play(melody);
  }
  const click = () => {
    report('logo_clicked');
    if (playback.active) { playback.stop(); return; }
    const now = Date.now(); clicks = now - lastClick > 12_000 ? 1 : clicks + 1; lastClick = now;
    if (clicks >= DISCOVERY_CLICKS) play(pickMelody());
    else note.jumpTo();
  };
  const showInfo = () => { if (selected && !dialog.open) { openDialog(dialog); report('melody_info_opened', { melody: selected.id }); } };
  const replay = () => { if (playback.active) playback.stop(); else play(selected, 'replay'); };
  const another = () => play(pickMelody(), 'next');
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
      portrait.removeEventListener('load', portraitReady); portrait.removeEventListener('error', portraitFailed);
      $('melody-replay').removeEventListener('click', replay); $('melody-next').removeEventListener('click', another); $('melody-reset').removeEventListener('click', reset);
    },
  };
}
