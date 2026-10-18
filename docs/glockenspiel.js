import { GLOCK_SAMPLES, TRANSPOSE } from './vendor/glock/bank.js?v=1.15.0';

export function glockSample(midi) {
  if (!Number.isFinite(midi) || midi < 0 || midi > 127) throw new RangeError('Invalid MIDI note');
  const pitch = midi + TRANSPOSE;
  const sample = GLOCK_SAMPLES.reduce((nearest, value) => Math.abs(value.rootMidi - pitch) < Math.abs(nearest.rootMidi - pitch) ? value : nearest);
  return { ...sample, rate: 2 ** ((pitch - sample.rootMidi) / 12) };
}

// MP3 encoders add a small lead-in. Remove it once after decoding, while keeping
// 2 ms before the recorded attack, so the clink coincides with the visual contact.
function trimLeadIn(context, buffer) {
  const channel = buffer.getChannelData(0), limit = Math.min(channel.length, Math.ceil(buffer.sampleRate * .12));
  let first = 0;
  while (first < limit && Math.abs(channel[first]) < .001) first++;
  if (first === limit) return buffer;
  first = Math.max(0, first - Math.round(buffer.sampleRate * .002));
  if (!first) return buffer;
  const trimmed = context.createBuffer(buffer.numberOfChannels, buffer.length - first, buffer.sampleRate);
  for (let index = 0; index < buffer.numberOfChannels; index++) trimmed.copyToChannel(buffer.getChannelData(index).subarray(first), index);
  return trimmed;
}

export function createGlockenspiel({ env = globalThis } = {}) {
  let context, output, disposed = false, resuming;
  const files = new Map(), buffers = new Map(), decoding = new Map(), voices = new Set();
  function file(sample) {
    if (!files.has(sample.url)) {
      const request = Promise.resolve().then(() => env.fetch(sample.url, { credentials: 'omit', cache: 'force-cache' }))
        .then(response => { if (!response.ok) throw new Error('Sample unavailable'); return response.arrayBuffer(); })
        .catch(error => { files.delete(sample.url); throw error; });
      files.set(sample.url, request);
    }
    return files.get(sample.url);
  }
  function unlock() {
    if (disposed) return Promise.resolve(false);
    try {
      if (!context) {
        const AudioContext = env.AudioContext || env.webkitAudioContext;
        if (!AudioContext) return Promise.resolve(false);
        context = new AudioContext({ latencyHint: 'interactive' });
        output = context.createGain(); output.gain.value = 1;
        const limiter = context.createDynamicsCompressor();
        limiter.threshold.value = -10; limiter.knee.value = 8; limiter.ratio.value = 4;
        limiter.attack.value = .003; limiter.release.value = .2;
        output.connect(limiter); limiter.connect(context.destination);
      }
      if (context.state === 'running') return Promise.resolve(true);
      if (!resuming) resuming = context.resume().then(() => context.state === 'running').catch(() => false).finally(() => { resuming = undefined; });
      return resuming;
    } catch { return Promise.resolve(false); }
  }
  async function prepare(midi) {
    const sample = glockSample(midi), resumed = unlock();
    if (!context || disposed) return false;
    if (!buffers.has(sample.url) && !decoding.has(sample.url)) {
      const request = file(sample).then(bytes => context.decodeAudioData(bytes.slice(0)))
        .then(buffer => { if (disposed) return false; buffers.set(sample.url, trimLeadIn(context, buffer)); return true; })
        .catch(() => false).finally(() => decoding.delete(sample.url));
      decoding.set(sample.url, request);
    }
    const ready = buffers.has(sample.url) || await decoding.get(sample.url);
    return Boolean(ready && await resumed && !disposed);
  }
  function play(midi, { when = 0, volume = .18 } = {}) {
    if (disposed || context?.state !== 'running') return null;
    const sample = glockSample(midi), buffer = buffers.get(sample.url);
    if (!buffer || !Number.isFinite(when) || !Number.isFinite(volume)) return null;
    const time = Math.max(context.currentTime, when), source = context.createBufferSource(), gain = context.createGain();
    source.buffer = buffer; source.playbackRate.setValueAtTime(sample.rate, time);
    gain.gain.setValueAtTime(0, time); gain.gain.linearRampToValueAtTime(Math.max(0, Math.min(.3, volume)), time + .002);
    source.connect(gain); gain.connect(output);
    const voice = {
      time, stopped: false,
      stop() {
        if (voice.stopped) return; voice.stopped = true;
        const now = context.currentTime;
        gain.gain.cancelScheduledValues(now); gain.gain.setValueAtTime(gain.gain.value, now);
        gain.gain.linearRampToValueAtTime(0, now + .025); source.stop(now + .03);
      },
    };
    source.onended = () => { voices.delete(voice); source.disconnect(); gain.disconnect(); };
    if (voices.size >= 8) [...voices].find(value => !value.stopped)?.stop();
    voices.add(voice); source.start(time);
    return voice;
  }
  return {
    unlock, prepare, play,
    isReady(midi) { return !disposed && context?.state === 'running' && buffers.has(glockSample(midi).url); },
    warm() { return disposed ? Promise.resolve([]) : Promise.allSettled(GLOCK_SAMPLES.map(file)); },
    stopAll() { for (const voice of voices) voice.stop(); },
    get currentTime() { return context?.currentTime || 0; },
    // Match animation to the samples reaching the output, including device latency.
    get presentationTime() {
      const stamp = context?.getOutputTimestamp?.();
      if (stamp?.performanceTime > 0 && Number.isFinite(stamp.contextTime) && env.performance?.now) {
        return Math.max(0, Math.min(context.currentTime, stamp.contextTime + (env.performance.now() - stamp.performanceTime) / 1000));
      }
      return context?.currentTime || 0;
    },
    destroy() { disposed = true; this.stopAll(); context?.close().catch(() => {}); },
  };
}

export function connectLogoSound(button, { player = createGlockenspiel(), env = globalThis } = {}) {
  const pending = new Map(), document = button.ownerDocument;
  let disposed = false;
  const warm = () => { player.warm(); };
  const unlock = () => { player.unlock(); };
  const sound = (note, sequence, request) => {
    request.active = false; pending.delete(sequence);
    if (document.hidden || disposed) return;
    const voice = player.play(note.midi);
    if (voice) button.dispatchEvent(new env.CustomEvent('pentagrama:note-sound', { bubbles: true, detail: { note, sequence, time: voice.time } }));
  };
  const start = event => {
    const { note, sequence, reducedMotion } = event.detail;
    for (const [id, previous] of pending) if (previous.landed) { previous.active = false; pending.delete(id); }
    const request = { ready: player.isReady(note.midi), active: true, reducedMotion, landed: false };
    pending.set(sequence, request); button.dataset.noteAudio = 'loading';
    player.prepare(note.midi).then(ready => {
      if (!request.active || disposed) return;
      request.ready = ready; button.dataset.noteAudio = ready ? 'ready' : 'unavailable';
      if (ready && request.landed && reducedMotion) sound(note, sequence, request);
      else if (!ready) { request.active = false; pending.delete(sequence); }
    }).catch(() => { request.active = false; pending.delete(sequence); if (!disposed) button.dataset.noteAudio = 'unavailable'; });
  };
  const land = event => {
    const { note, sequence } = event.detail, request = pending.get(sequence);
    if (!request) return;
    request.landed = true;
    // With reduced motion there is no flight to wait for loading. Only the
    // latest deliberate tap may play when ready; no pending melody is replayed.
    if (!request.ready && request.reducedMotion) return;
    // Do not replay a delayed download after the visual impact has passed.
    if (request.ready) sound(note, sequence, request);
    else { request.active = false; pending.delete(sequence); button.dataset.noteAudio = 'unavailable'; }
  };
  const rest = event => {
    const request = pending.get(event.detail.sequence);
    if (request?.reducedMotion && request.landed && !event.detail.cancelled) return;
    if (request) request.active = false;
    pending.delete(event.detail.sequence);
    if (event.detail.cancelled) player.stopAll();
  };
  const leave = () => { for (const request of pending.values()) request.active = false; pending.clear(); player.stopAll(); };
  const silence = () => { if (document.hidden) leave(); };
  button.dataset.noteAudio = 'idle';
  for (const name of ['pointerenter', 'pointerdown', 'focusin']) button.addEventListener(name, warm);
  button.addEventListener('click', unlock);
  button.addEventListener('pentagrama:note-start', start);
  button.addEventListener('pentagrama:note-land', land);
  button.addEventListener('pentagrama:note-rest', rest);
  document.addEventListener('visibilitychange', silence);
  env.addEventListener('pagehide', leave);
  return {
    destroy() {
      disposed = true; for (const request of pending.values()) request.active = false; pending.clear();
      for (const name of ['pointerenter', 'pointerdown', 'focusin']) button.removeEventListener(name, warm);
      button.removeEventListener('click', unlock);
      button.removeEventListener('pentagrama:note-start', start);
      button.removeEventListener('pentagrama:note-land', land);
      button.removeEventListener('pentagrama:note-rest', rest);
      document.removeEventListener('visibilitychange', silence);
      env.removeEventListener('pagehide', leave); player.destroy();
    },
  };
}
