import { logoNote, planNoteJump } from './logo-note.js?v=1.10.0';

// Short, monophonic adaptations. Durations use quarter-note beats, not timers.
// Sources, editorial choices and credits: documentation/melodies.md.
const score = text => Object.freeze(text.split(' ').map(token => {
  const [pitch, beats = '1'] = token.split(':');
  return Object.freeze({ pitch: pitch === '-' ? null : pitch, beats: Number(beats) });
}));
const mutopia = id => `https://www.mutopiaproject.org/cgibin/piece-info.cgi?id=${id}`;
export const MELODIES = Object.freeze([
  { id: 'joy', composer: 'Ludwig van Beethoven', work: 'Op. 125 · 1824', tempo: 120, source: mutopia(528),
    notes: score('B4 B4 C5 D5 D5 C5 B4 A4 G4 G4 A4 B4 B4:1.5 A4:0.5 A4:2') },
  { id: 'elise', composer: 'Ludwig van Beethoven', work: 'WoO 59 · 1810', tempo: 108, source: mutopia(931),
    notes: score('E5:0.5 D#5:0.5 E5:0.5 D#5:0.5 E5:0.5 B4:0.5 D5:0.5 C5:0.5 A4:2') },
  { id: 'minuet', composer: 'Christian Petzold', work: 'BWV Anh. 114 · 1725', tempo: 112, source: mutopia(75),
    notes: score('D5 G4:0.5 A4:0.5 B4:0.5 C5:0.5 D5 G4 G4') },
  { id: 'mountain', composer: 'Edvard Grieg', work: 'Peer Gynt · Op. 46, No. 4', tempo: 108, source: mutopia(1888),
    notes: score('G4:0.5 A4:0.5 Bb4:0.5 C5:0.5 D5:0.5 Bb4:0.5 D5:1 C#5:0.5 A4:0.5 C#5:1 C5:0.5 Ab4:0.5 C5:1') },
  { id: 'star', composer: 'Wolfgang Amadeus Mozart', work: 'K. 265', tempo: 124, source: mutopia(2236),
    notes: score('G4 G4 D5 D5 E5 E5 D5:2 C5 C5 B4 B4 A4 A4 G4:2') },
  { id: 'canon', composer: 'Johann Pachelbel', work: 'P. 37', tempo: 60, source: mutopia(2047), credit: 'Michael Fischer v. Mollard · CC BY 4.0',
    notes: score('F#5 E5 D5 C#5 B4 A4 B4 C#5 D5 C#5 B4 A4 G4 F#4 G4 E4:2') },
].map(Object.freeze));

export function melodyNote(pitch, column) {
  const match = /^([A-G])([#b]?)([45])$/.exec(pitch);
  if (!match) throw new RangeError('Invalid melody pitch');
  const [, letter, alteration, octave] = match;
  const step = 'CDEFGAB'.indexOf(letter) + (Number(octave) - 4) * 7 - 2;
  return logoNote({ column, step, accidental: alteration === '#' ? 1 : alteration === 'b' ? -1 : 0 });
}

export function planMelody(melody, from) {
  if (!Number.isFinite(melody.tempo) || melody.tempo < 40 || melody.tempo > 180 || !melody.notes?.length) throw new RangeError('Invalid melody');
  const beat = 60_000 / melody.tempo, entries = [];
  let at = 520, start = 0, current = from, index = 0;
  for (const note of melody.notes) {
    if (!Number.isFinite(note.beats) || note.beats < .5 || note.beats > 4) throw new RangeError('Invalid note duration');
    if (note.pitch) {
      const to = melodyNote(note.pitch, (from.column + ++index) % 3);
      const tail = Math.min(100, note.beats * beat * .25), landingAfter = at - start;
      const plan = planNoteJump(current, to, { duration: landingAfter + tail, landingAfter });
      entries.push(Object.freeze({ at, start, end: at + tail, note: to, plan }));
      current = to; start = at + tail;
    }
    at += note.beats * beat;
  }
  if (!entries.length || at > 30_000) throw new RangeError('Invalid melody length');
  return Object.freeze({ entries: Object.freeze(entries), duration: at });
}
