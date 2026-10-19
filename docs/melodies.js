import { logoNote, planNoteJump } from './logo-note.js?v=2.0.0-alpha.7';

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
  { id: 'fifth', composer: 'Ludwig van Beethoven', work: 'Op. 67 · I', tempo: 120, source: mutopia(941),
    notes: score('-:0.5 C5:0.5 C5:0.5 C5:0.5 Ab4:4 -:0.5 Bb4:0.5 Bb4:0.5 Bb4:0.5 G4:4') },
  { id: 'serenade', composer: 'Wolfgang Amadeus Mozart', work: 'K. 525 · I · 1787', tempo: 132, source: mutopia(900),
    notes: score('A4 -:0.5 E4:0.5 A4 -:0.5 E4:0.5 A4:0.5 E4:0.5 A4:0.5 C#5:0.5 E5 - D5 -:0.5 B4:0.5 D5 -:0.5 B4:0.5 D5:0.5 B4:0.5 G#4:0.5 B4:0.5 E4 -') },
  { id: 'turkish', composer: 'Wolfgang Amadeus Mozart', work: 'K. 331 · III', tempo: 168, source: mutopia(108),
    notes: score('B4:0.5 A4:0.5 G#4:0.5 A4:0.5 C5 - D5:0.5 C5:0.5 B4:0.5 C5:0.5 E5 - F5:0.5 E5:0.5 D#5:0.5 E5:0.5 B4:0.5 A4:0.5 G#4:0.5 A4:0.5 B4:0.5 A4:0.5 G#4:0.5 A4:1.5') },
  { id: 'bourree', composer: 'Johann Sebastian Bach', work: 'BWV 996 · V', tempo: 132, source: mutopia(1743),
    notes: score('A4:0.5 B4:0.5 C5 B4:0.5 A4:0.5 G#4 A4:0.5 B4:0.5 E4 F#4:0.5 G#4:0.5 A4 G4:0.5 F4:1.5') },
  { id: 'spring', composer: 'Antonio Vivaldi', work: 'RV 269 · Op. 8, No. 1 · 1725', tempo: 156, source: mutopia(301), credit: 'Mutopia 301 · CC BY-SA 3.0',
    notes: score('E4 G#4 G#4 G#4 F#4:0.5 E4:0.5 B4:3 B4:0.5 A4:0.5 G#4 G#4 G#4 F#4:0.5 E4:0.5 B4:3') },
  { id: 'ave', composer: 'Franz Schubert', work: 'D. 839 · Op. 52, No. 6 · 1825', tempo: 100, source: mutopia(1054),
    notes: score('Bb4:3 A4:0.5 Bb4:0.5 D5:3.5 C5:0.5 Bb4:2') },
].map(melody => Object.freeze({ ...melody, portrait: ({
  'Ludwig van Beethoven': 'beethoven', 'Christian Petzold': 'petzold', 'Edvard Grieg': 'grieg',
  'Wolfgang Amadeus Mozart': 'mozart', 'Johann Pachelbel': 'pachelbel', 'Johann Sebastian Bach': 'bach',
  'Antonio Vivaldi': 'vivaldi', 'Franz Schubert': 'schubert',
})[melody.composer] })));

// Every excerpt is heard once per shuffled round; the boundary cannot repeat.
export function createMelodyPicker(catalogue = MELODIES, random = Math.random) {
  if (!catalogue.length) throw new RangeError('Empty melody catalogue');
  let bag = [], previous;
  return () => {
    if (!bag.length) {
      bag = [...catalogue];
      for (let index = bag.length - 1; index > 0; index--) {
        const other = Math.min(index, Math.floor(random() * (index + 1)));
        [bag[index], bag[other]] = [bag[other], bag[index]];
      }
      if (bag.length > 1 && bag.at(-1).id === previous?.id) [bag[0], bag[bag.length - 1]] = [bag.at(-1), bag[0]];
    }
    previous = bag.pop(); return previous;
  };
}

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
      // Long notes and rests hold their position before the next short leap.
      const jumpStart = Math.max(start, at - 700);
      const tail = Math.min(100, note.beats * beat * .25), landingAfter = at - jumpStart;
      const plan = planNoteJump(current, to, { duration: landingAfter + tail, landingAfter });
      entries.push(Object.freeze({ at, start: jumpStart, end: at + tail, note: to, plan }));
      current = to; start = at + tail;
    }
    at += note.beats * beat;
  }
  if (!entries.length || at > 30_000) throw new RangeError('Invalid melody length');
  return Object.freeze({ entries: Object.freeze(entries), duration: at });
}
