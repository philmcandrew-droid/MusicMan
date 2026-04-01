export type GuitarChord = {
  name: string
  notes: string[]
  quality: string
  frets: number[]   // -1 = muted, 0 = open, 1+ = fret number (low E to high E)
}

export type PianoChordEntry = {
  name: string
  notes: string[]
  quality: string
}

export const guitarChords: GuitarChord[] = [
  // ── Major open ──
  { name: 'C',    notes: ['C','E','G'],         quality: 'major',   frets: [-1, 3, 2, 0, 1, 0] },
  { name: 'D',    notes: ['D','F#','A'],         quality: 'major',   frets: [-1, -1, 0, 2, 3, 2] },
  { name: 'E',    notes: ['E','G#','B'],         quality: 'major',   frets: [0, 2, 2, 1, 0, 0] },
  { name: 'F',    notes: ['F','A','C'],          quality: 'major',   frets: [1, 3, 3, 2, 1, 1] },
  { name: 'G',    notes: ['G','B','D'],          quality: 'major',   frets: [3, 2, 0, 0, 0, 3] },
  { name: 'A',    notes: ['A','C#','E'],         quality: 'major',   frets: [-1, 0, 2, 2, 2, 0] },
  { name: 'B',    notes: ['B','D#','F#'],        quality: 'major',   frets: [-1, 2, 4, 4, 4, 2] },

  // ── Minor open ──
  { name: 'Am',   notes: ['A','C','E'],          quality: 'minor',   frets: [-1, 0, 2, 2, 1, 0] },
  { name: 'Bm',   notes: ['B','D','F#'],         quality: 'minor',   frets: [-1, 2, 4, 4, 3, 2] },
  { name: 'Cm',   notes: ['C','Eb','G'],         quality: 'minor',   frets: [-1, 3, 5, 5, 4, 3] },
  { name: 'Dm',   notes: ['D','F','A'],          quality: 'minor',   frets: [-1, -1, 0, 2, 3, 1] },
  { name: 'Em',   notes: ['E','G','B'],          quality: 'minor',   frets: [0, 2, 2, 0, 0, 0] },
  { name: 'Fm',   notes: ['F','Ab','C'],         quality: 'minor',   frets: [1, 3, 3, 1, 1, 1] },
  { name: 'Gm',   notes: ['G','Bb','D'],         quality: 'minor',   frets: [3, 5, 5, 3, 3, 3] },

  // ── Dominant 7th ──
  { name: 'A7',   notes: ['A','C#','E','G'],     quality: '7th',     frets: [-1, 0, 2, 0, 2, 0] },
  { name: 'B7',   notes: ['B','D#','F#','A'],    quality: '7th',     frets: [-1, 2, 1, 2, 0, 2] },
  { name: 'C7',   notes: ['C','E','G','Bb'],     quality: '7th',     frets: [-1, 3, 2, 3, 1, 0] },
  { name: 'D7',   notes: ['D','F#','A','C'],     quality: '7th',     frets: [-1, -1, 0, 2, 1, 2] },
  { name: 'E7',   notes: ['E','G#','B','D'],     quality: '7th',     frets: [0, 2, 0, 1, 0, 0] },
  { name: 'G7',   notes: ['G','B','D','F'],      quality: '7th',     frets: [3, 2, 0, 0, 0, 1] },

  // ── Major 7th ──
  { name: 'Cmaj7', notes: ['C','E','G','B'],     quality: 'maj7',    frets: [-1, 3, 2, 0, 0, 0] },
  { name: 'Dmaj7', notes: ['D','F#','A','C#'],   quality: 'maj7',    frets: [-1, -1, 0, 2, 2, 2] },
  { name: 'Emaj7', notes: ['E','G#','B','D#'],   quality: 'maj7',    frets: [0, 2, 1, 1, 0, 0] },
  { name: 'Fmaj7', notes: ['F','A','C','E'],     quality: 'maj7',    frets: [-1, -1, 3, 2, 1, 0] },
  { name: 'Gmaj7', notes: ['G','B','D','F#'],    quality: 'maj7',    frets: [3, 2, 0, 0, 0, 2] },
  { name: 'Amaj7', notes: ['A','C#','E','G#'],   quality: 'maj7',    frets: [-1, 0, 2, 1, 2, 0] },

  // ── Minor 7th ──
  { name: 'Am7',  notes: ['A','C','E','G'],      quality: 'min7',    frets: [-1, 0, 2, 0, 1, 0] },
  { name: 'Bm7',  notes: ['B','D','F#','A'],     quality: 'min7',    frets: [-1, 2, 0, 2, 0, 2] },
  { name: 'Dm7',  notes: ['D','F','A','C'],      quality: 'min7',    frets: [-1, -1, 0, 2, 1, 1] },
  { name: 'Em7',  notes: ['E','G','B','D'],      quality: 'min7',    frets: [0, 2, 0, 0, 0, 0] },
  { name: 'Gm7',  notes: ['G','Bb','D','F'],     quality: 'min7',    frets: [3, 5, 3, 3, 3, 3] },

  // ── 9th chords ──
  { name: 'A9',   notes: ['A','C#','E','G','B'], quality: '9th',     frets: [-1, 0, 2, 4, 2, 3] },
  { name: 'C9',   notes: ['C','E','G','Bb','D'], quality: '9th',     frets: [-1, 3, 2, 3, 3, 3] },
  { name: 'D9',   notes: ['D','F#','A','C','E'], quality: '9th',     frets: [-1, -1, 0, 2, 1, 0] },
  { name: 'E9',   notes: ['E','G#','B','D','F#'],quality: '9th',     frets: [0, 2, 0, 1, 0, 2] },
  { name: 'G9',   notes: ['G','B','D','F','A'],  quality: '9th',     frets: [3, 0, 0, 0, 0, 1] },
  { name: 'Am9',  notes: ['A','C','E','G','B'],  quality: '9th',     frets: [-1, 0, 2, 4, 1, 0] },
  { name: 'Dm9',  notes: ['D','F','A','C','E'],  quality: '9th',     frets: [-1, -1, 0, 2, 1, 0] },

  // ── 13th chords ──
  { name: 'A13',  notes: ['A','C#','E','G','F#'],quality: '13th',    frets: [-1, 0, 2, 0, 2, 2] },
  { name: 'C13',  notes: ['C','E','G','Bb','A'], quality: '13th',    frets: [-1, 3, 2, 3, 3, 5] },
  { name: 'D13',  notes: ['D','F#','A','C','B'], quality: '13th',    frets: [-1, -1, 0, 2, 1, 2] },
  { name: 'E13',  notes: ['E','G#','B','D','C#'],quality: '13th',    frets: [0, 2, 0, 1, 2, 0] },
  { name: 'G13',  notes: ['G','B','D','F','E'],  quality: '13th',    frets: [3, 2, 0, 0, 0, 0] },

  // ── Moveable barre shapes ──
  { name: 'F barre',   notes: ['F','A','C'],       quality: 'moveable', frets: [1, 3, 3, 2, 1, 1] },
  { name: 'Fm barre',  notes: ['F','Ab','C'],      quality: 'moveable', frets: [1, 3, 3, 1, 1, 1] },
  { name: 'Bb barre',  notes: ['Bb','D','F'],      quality: 'moveable', frets: [6, 8, 8, 7, 6, 6] },
  { name: 'Bbm barre', notes: ['Bb','Db','F'],     quality: 'moveable', frets: [6, 8, 8, 6, 6, 6] },
  { name: 'Ab barre',  notes: ['Ab','C','Eb'],     quality: 'moveable', frets: [4, 6, 6, 5, 4, 4] },
  { name: 'C# barre',  notes: ['C#','F','G#'],     quality: 'moveable', frets: [-1, 4, 6, 6, 6, 4] },
  { name: 'Eb barre',  notes: ['Eb','G','Bb'],     quality: 'moveable', frets: [-1, 6, 8, 8, 8, 6] },

  // ── Jazz voicings ──
  { name: 'Cmaj9',    notes: ['C','E','G','B','D'],    quality: 'jazz', frets: [-1, 3, 2, 4, 3, 0] },
  { name: 'Dm11',     notes: ['D','F','A','C','G'],    quality: 'jazz', frets: [-1, -1, 0, 2, 1, 3] },
  { name: 'Em9',      notes: ['E','G','B','D','F#'],   quality: 'jazz', frets: [0, 2, 0, 0, 0, 2] },
  { name: 'Fmaj9',    notes: ['F','A','C','E','G'],    quality: 'jazz', frets: [-1, -1, 3, 0, 1, 0] },
  { name: 'G13 (jazz)',notes: ['G','B','D','F','E'],    quality: 'jazz', frets: [3, -1, 0, 0, 0, 0] },
  { name: 'Am11',     notes: ['A','C','E','G','D'],    quality: 'jazz', frets: [-1, 0, 0, 0, 1, 0] },
  { name: 'Bbmaj7',   notes: ['Bb','D','F','A'],       quality: 'jazz', frets: [-1, 1, 3, 2, 3, 1] },
  { name: 'Dbmaj7',   notes: ['Db','F','Ab','C'],      quality: 'jazz', frets: [-1, 4, 3, 1, 1, 1] },
  { name: 'Ebmaj7',   notes: ['Eb','G','Bb','D'],      quality: 'jazz', frets: [-1, 6, 5, 3, 3, 3] },
  { name: 'F#m7b5',   notes: ['F#','A','C','E'],       quality: 'jazz', frets: [2, -1, 2, 2, 1, -1] },
  { name: 'Bdim7',    notes: ['B','D','F','Ab'],       quality: 'jazz', frets: [-1, 2, 3, 1, 3, 1] },
  { name: 'C7#9',     notes: ['C','E','G','Bb','D#'],  quality: 'jazz', frets: [-1, 3, 2, 3, 4, 4] },
  { name: 'A7b9',     notes: ['A','C#','E','G','Bb'],  quality: 'jazz', frets: [-1, 0, 2, 0, 2, 1] },
  { name: 'D7#11',    notes: ['D','F#','A','C','G#'],  quality: 'jazz', frets: [-1, -1, 0, 1, 1, 2] },
  { name: 'E7b13',    notes: ['E','G#','B','D','C'],   quality: 'jazz', frets: [0, 2, 0, 1, 1, 0] },
  { name: 'Gm6',      notes: ['G','Bb','D','E'],       quality: 'jazz', frets: [3, -1, 2, 3, 3, 3] },
  { name: 'Am6',      notes: ['A','C','E','F#'],       quality: 'jazz', frets: [-1, 0, 2, 2, 1, 2] },

  // ── Power chords ──
  { name: 'E5',   notes: ['E','B'],              quality: 'power',   frets: [0, 2, 2, -1, -1, -1] },
  { name: 'A5',   notes: ['A','E'],              quality: 'power',   frets: [-1, 0, 2, 2, -1, -1] },
  { name: 'D5',   notes: ['D','A'],              quality: 'power',   frets: [-1, -1, 0, 2, 3, -1] },
  { name: 'G5',   notes: ['G','D'],              quality: 'power',   frets: [3, 5, 5, -1, -1, -1] },
  { name: 'C5',   notes: ['C','G'],              quality: 'power',   frets: [-1, 3, 5, 5, -1, -1] },
  { name: 'F5',   notes: ['F','C'],              quality: 'power',   frets: [1, 3, 3, -1, -1, -1] },
]

export const pianoChords: PianoChordEntry[] = [
  // Major
  { name: 'C Major',  notes: ['C','E','G'],       quality: 'major' },
  { name: 'D Major',  notes: ['D','F#','A'],      quality: 'major' },
  { name: 'E Major',  notes: ['E','G#','B'],      quality: 'major' },
  { name: 'F Major',  notes: ['F','A','C'],       quality: 'major' },
  { name: 'G Major',  notes: ['G','B','D'],       quality: 'major' },
  { name: 'A Major',  notes: ['A','C#','E'],      quality: 'major' },
  { name: 'Bb Major', notes: ['Bb','D','F'],      quality: 'major' },
  { name: 'Eb Major', notes: ['Eb','G','Bb'],     quality: 'major' },
  // Minor
  { name: 'C Minor',  notes: ['C','Eb','G'],      quality: 'minor' },
  { name: 'D Minor',  notes: ['D','F','A'],       quality: 'minor' },
  { name: 'E Minor',  notes: ['E','G','B'],       quality: 'minor' },
  { name: 'A Minor',  notes: ['A','C','E'],       quality: 'minor' },
  { name: 'F Minor',  notes: ['F','Ab','C'],      quality: 'minor' },
  { name: 'G Minor',  notes: ['G','Bb','D'],      quality: 'minor' },
  // 7th
  { name: 'Cmaj7',    notes: ['C','E','G','B'],   quality: 'major7' },
  { name: 'Dm7',      notes: ['D','F','A','C'],   quality: 'minor7' },
  { name: 'Em7',      notes: ['E','G','B','D'],   quality: 'minor7' },
  { name: 'G7',       notes: ['G','B','D','F'],   quality: 'dominant7' },
  { name: 'Am7',      notes: ['A','C','E','G'],   quality: 'minor7' },
  { name: 'Fmaj7',    notes: ['F','A','C','E'],   quality: 'major7' },
  // Sus / Aug / Dim
  { name: 'Csus4',    notes: ['C','F','G'],       quality: 'sus' },
  { name: 'Dsus2',    notes: ['D','E','A'],       quality: 'sus' },
  { name: 'C Aug',    notes: ['C','E','G#'],      quality: 'augmented' },
  { name: 'B Dim',    notes: ['B','D','F'],       quality: 'diminished' },
]
