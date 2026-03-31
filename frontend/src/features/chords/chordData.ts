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
  // Major
  { name: 'C',   notes: ['C','E','G'],        quality: 'major',  frets: [-1, 3, 2, 0, 1, 0] },
  { name: 'D',   notes: ['D','F#','A'],       quality: 'major',  frets: [-1, -1, 0, 2, 3, 2] },
  { name: 'E',   notes: ['E','G#','B'],       quality: 'major',  frets: [0, 2, 2, 1, 0, 0] },
  { name: 'F',   notes: ['F','A','C'],        quality: 'major',  frets: [1, 3, 3, 2, 1, 1] },
  { name: 'G',   notes: ['G','B','D'],        quality: 'major',  frets: [3, 2, 0, 0, 0, 3] },
  { name: 'A',   notes: ['A','C#','E'],       quality: 'major',  frets: [-1, 0, 2, 2, 2, 0] },
  { name: 'B',   notes: ['B','D#','F#'],      quality: 'major',  frets: [-1, 2, 4, 4, 4, 2] },
  // Minor
  { name: 'Am',  notes: ['A','C','E'],        quality: 'minor',  frets: [-1, 0, 2, 2, 1, 0] },
  { name: 'Bm',  notes: ['B','D','F#'],       quality: 'minor',  frets: [-1, 2, 4, 4, 3, 2] },
  { name: 'Cm',  notes: ['C','Eb','G'],       quality: 'minor',  frets: [-1, 3, 5, 5, 4, 3] },
  { name: 'Dm',  notes: ['D','F','A'],        quality: 'minor',  frets: [-1, -1, 0, 2, 3, 1] },
  { name: 'Em',  notes: ['E','G','B'],        quality: 'minor',  frets: [0, 2, 2, 0, 0, 0] },
  { name: 'Fm',  notes: ['F','Ab','C'],       quality: 'minor',  frets: [1, 3, 3, 1, 1, 1] },
  { name: 'Gm',  notes: ['G','Bb','D'],       quality: 'minor',  frets: [3, 5, 5, 3, 3, 3] },
  // 7th
  { name: 'A7',  notes: ['A','C#','E','G'],   quality: '7th',    frets: [-1, 0, 2, 0, 2, 0] },
  { name: 'B7',  notes: ['B','D#','F#','A'],  quality: '7th',    frets: [-1, 2, 1, 2, 0, 2] },
  { name: 'C7',  notes: ['C','E','G','Bb'],   quality: '7th',    frets: [-1, 3, 2, 3, 1, 0] },
  { name: 'D7',  notes: ['D','F#','A','C'],   quality: '7th',    frets: [-1, -1, 0, 2, 1, 2] },
  { name: 'E7',  notes: ['E','G#','B','D'],   quality: '7th',    frets: [0, 2, 0, 1, 0, 0] },
  { name: 'G7',  notes: ['G','B','D','F'],    quality: '7th',    frets: [3, 2, 0, 0, 0, 1] },
  // Power chords
  { name: 'E5',  notes: ['E','B'],            quality: 'power',  frets: [0, 2, 2, -1, -1, -1] },
  { name: 'A5',  notes: ['A','E'],            quality: 'power',  frets: [-1, 0, 2, 2, -1, -1] },
  { name: 'D5',  notes: ['D','A'],            quality: 'power',  frets: [-1, -1, 0, 2, 3, -1] },
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
