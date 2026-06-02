export type GuitarChord = {
  id: string
  name: string
  root: string
  notes: string[]
  quality: string
  frets: number[]
  cagedShape?: string
  inversion?: string
}

export type PianoChordEntry = {
  name: string
  root: string
  notes: string[]
  quality: string
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const ALL_ROOTS = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'] as const

const SEMITONE: Record<string, number> = {
  C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4,
  F: 5, 'F#': 6, Gb: 6, G: 7, 'G#': 8, Ab: 8,
  A: 9, 'A#': 10, Bb: 10, B: 11,
}

const SHARP_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
const FLAT_NOTES  = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']
const USE_FLATS   = new Set(['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb'])

function noteAt(semitone: number, root: string): string {
  const idx = ((semitone % 12) + 12) % 12
  return USE_FLATS.has(root) ? FLAT_NOTES[idx] : SHARP_NOTES[idx]
}

function shiftFrets(template: number[], shift: number): number[] {
  return template.map((f) => (f === -1 ? -1 : f + shift))
}

function buildNotes(root: string, intervals: number[]): string[] {
  const r = SEMITONE[root]
  return intervals.map((i) => noteAt(r + i, root))
}

/* ------------------------------------------------------------------ */
/*  CAGED shape templates  (open-position voicings)                    */
/*  rootSemitone = semitone of the root note in the open template      */
/* ------------------------------------------------------------------ */

type ShapeTemplate = { frets: number[]; rootSemitone: number }

const MAJOR_SHAPES: Record<string, ShapeTemplate> = {
  C: { frets: [-1, 3, 2, 0, 1, 0], rootSemitone: 0 },
  A: { frets: [-1, 0, 2, 2, 2, 0], rootSemitone: 9 },
  G: { frets: [3, 2, 0, 0, 0, 3], rootSemitone: 7 },
  E: { frets: [0, 2, 2, 1, 0, 0], rootSemitone: 4 },
  D: { frets: [-1, -1, 0, 2, 3, 2], rootSemitone: 2 },
}

const MINOR_SHAPES: Record<string, ShapeTemplate> = {
  C: { frets: [-1, 3, 1, 0, 1, -1], rootSemitone: 0 },
  A: { frets: [-1, 0, 2, 2, 1, 0], rootSemitone: 9 },
  G: { frets: [3, 1, 0, 0, 3, 3], rootSemitone: 7 },
  E: { frets: [0, 2, 2, 0, 0, 0], rootSemitone: 4 },
  D: { frets: [-1, -1, 0, 2, 3, 1], rootSemitone: 2 },
}

const DOM7_SHAPES: Record<string, ShapeTemplate> = {
  C: { frets: [-1, 3, 2, 3, 1, 0], rootSemitone: 0 },
  A: { frets: [-1, 0, 2, 0, 2, 0], rootSemitone: 9 },
  G: { frets: [3, 2, 0, 0, 0, 1], rootSemitone: 7 },
  E: { frets: [0, 2, 0, 1, 0, 0], rootSemitone: 4 },
  D: { frets: [-1, -1, 0, 2, 1, 2], rootSemitone: 2 },
}

const MAJ7_SHAPES: Record<string, ShapeTemplate> = {
  C: { frets: [-1, 3, 2, 0, 0, 0], rootSemitone: 0 },
  A: { frets: [-1, 0, 2, 1, 2, 0], rootSemitone: 9 },
  G: { frets: [3, 2, 0, 0, 0, 2], rootSemitone: 7 },
  E: { frets: [0, 2, 1, 1, 0, 0], rootSemitone: 4 },
  D: { frets: [-1, -1, 0, 2, 2, 2], rootSemitone: 2 },
}

const MIN7_SHAPES: Record<string, ShapeTemplate> = {
  C: { frets: [-1, 3, 1, 3, 1, 3], rootSemitone: 0 },
  A: { frets: [-1, 0, 2, 0, 1, 0], rootSemitone: 9 },
  G: { frets: [3, 1, 0, 0, 3, 1], rootSemitone: 7 },
  E: { frets: [0, 2, 0, 0, 0, 0], rootSemitone: 4 },
  D: { frets: [-1, -1, 0, 2, 1, 1], rootSemitone: 2 },
}

/* ------------------------------------------------------------------ */
/*  CAGED generator                                                    */
/* ------------------------------------------------------------------ */

interface QualityConfig {
  shapes: Record<string, ShapeTemplate>
  quality: string
  suffix: string
  intervals: number[]
}

const QUALITY_CONFIGS: QualityConfig[] = [
  { shapes: MAJOR_SHAPES, quality: 'major',  suffix: '',     intervals: [0, 4, 7] },
  { shapes: MINOR_SHAPES, quality: 'minor',  suffix: 'm',    intervals: [0, 3, 7] },
  { shapes: DOM7_SHAPES,  quality: '7th',    suffix: '7',    intervals: [0, 4, 7, 10] },
  { shapes: MAJ7_SHAPES,  quality: 'maj7',   suffix: 'maj7', intervals: [0, 4, 7, 11] },
  { shapes: MIN7_SHAPES,  quality: 'min7',   suffix: 'm7',   intervals: [0, 3, 7, 10] },
]

function generateCAGED(): GuitarChord[] {
  const chords: GuitarChord[] = []

  for (const { shapes, quality, suffix, intervals } of QUALITY_CONFIGS) {
    for (const root of ALL_ROOTS) {
      const rootSem = SEMITONE[root]
      const notes = buildNotes(root, intervals)

      for (const [shape, template] of Object.entries(shapes)) {
        const shift = ((rootSem - template.rootSemitone) + 12) % 12
        chords.push({
          id: `${root}${suffix}-${shape}`,
          name: `${root}${suffix}`,
          root,
          notes,
          quality,
          frets: shiftFrets(template.frets, shift),
          cagedShape: shape,
        })
      }
    }
  }

  return chords
}

/* ------------------------------------------------------------------ */
/*  Triad inversion generator                                          */
/*  Generates 1st & 2nd inversions on two common string sets           */
/* ------------------------------------------------------------------ */

const STRING_OPEN_SEMITONES = [4, 9, 2, 7, 11, 4] // E A D G B E

const STRING_SETS: { indices: [number, number, number]; label: string }[] = [
  { indices: [2, 3, 4], label: 'DGB' },
  { indices: [3, 4, 5], label: 'GBE' },
]

function fretForNote(noteSemitone: number, stringIndex: number): number {
  return ((noteSemitone - STRING_OPEN_SEMITONES[stringIndex]) % 12 + 12) % 12
}

function generateInversions(): GuitarChord[] {
  const chords: GuitarChord[] = []

  const triadConfigs = [
    { suffix: '', intervals: [0, 4, 7], quality: 'inversion' },
    { suffix: 'm', intervals: [0, 3, 7], quality: 'inversion' },
  ]

  for (const { suffix, intervals, quality } of triadConfigs) {
    for (const root of ALL_ROOTS) {
      const rootSem = SEMITONE[root]
      const notes = buildNotes(root, intervals)

      for (const { indices, label } of STRING_SETS) {
        // 1st inversion: 3rd in bass, 5th in middle, root on top
        const bassNote1 = noteAt(rootSem + intervals[1], root)
        const frets1: number[] = Array(6).fill(-1)
        frets1[indices[0]] = fretForNote(rootSem + intervals[1], indices[0])
        frets1[indices[1]] = fretForNote(rootSem + intervals[2], indices[1])
        frets1[indices[2]] = fretForNote(rootSem + intervals[0], indices[2])

        chords.push({
          id: `${root}${suffix}-inv1-${label}`,
          name: `${root}${suffix}/${bassNote1}`,
          root,
          notes,
          quality,
          frets: frets1,
          inversion: '1st',
        })

        // 2nd inversion: 5th in bass, root in middle, 3rd on top
        const bassNote2 = noteAt(rootSem + intervals[2], root)
        const frets2: number[] = Array(6).fill(-1)
        frets2[indices[0]] = fretForNote(rootSem + intervals[2], indices[0])
        frets2[indices[1]] = fretForNote(rootSem + intervals[0], indices[1])
        frets2[indices[2]] = fretForNote(rootSem + intervals[1], indices[2])

        chords.push({
          id: `${root}${suffix}-inv2-${label}`,
          name: `${root}${suffix}/${bassNote2}`,
          root,
          notes,
          quality,
          frets: frets2,
          inversion: '2nd',
        })
      }
    }
  }

  return chords
}

/* ------------------------------------------------------------------ */
/*  Specialty voicings  (jazz, 9th, 13th, power)                       */
/* ------------------------------------------------------------------ */

const specialChords: GuitarChord[] = [
  // ── 9th chords ──
  { id: 'A9',  name: 'A9',  root: 'A', notes: ['A','C#','E','G','B'],  quality: '9th', frets: [-1, 0, 2, 4, 2, 3] },
  { id: 'C9',  name: 'C9',  root: 'C', notes: ['C','E','G','Bb','D'],  quality: '9th', frets: [-1, 3, 2, 3, 3, 3] },
  { id: 'D9',  name: 'D9',  root: 'D', notes: ['D','F#','A','C','E'],  quality: '9th', frets: [-1, -1, 0, 2, 1, 0] },
  { id: 'E9',  name: 'E9',  root: 'E', notes: ['E','G#','B','D','F#'], quality: '9th', frets: [0, 2, 0, 1, 0, 2] },
  { id: 'G9',  name: 'G9',  root: 'G', notes: ['G','B','D','F','A'],   quality: '9th', frets: [3, 0, 0, 0, 0, 1] },
  { id: 'Am9', name: 'Am9', root: 'A', notes: ['A','C','E','G','B'],   quality: '9th', frets: [-1, 0, 2, 4, 1, 0] },
  { id: 'Dm9', name: 'Dm9', root: 'D', notes: ['D','F','A','C','E'],   quality: '9th', frets: [-1, -1, 0, 2, 1, 0] },

  // ── 13th chords ──
  { id: 'A13', name: 'A13', root: 'A', notes: ['A','C#','E','G','F#'], quality: '13th', frets: [-1, 0, 2, 0, 2, 2] },
  { id: 'C13', name: 'C13', root: 'C', notes: ['C','E','G','Bb','A'],  quality: '13th', frets: [-1, 3, 2, 3, 3, 5] },
  { id: 'D13', name: 'D13', root: 'D', notes: ['D','F#','A','C','B'],  quality: '13th', frets: [-1, -1, 0, 2, 1, 2] },
  { id: 'E13', name: 'E13', root: 'E', notes: ['E','G#','B','D','C#'], quality: '13th', frets: [0, 2, 0, 1, 2, 0] },
  { id: 'G13', name: 'G13', root: 'G', notes: ['G','B','D','F','E'],   quality: '13th', frets: [3, 2, 0, 0, 0, 0] },

  // ── Jazz voicings ──
  { id: 'Cmaj9-j',   name: 'Cmaj9',   root: 'C',  notes: ['C','E','G','B','D'],     quality: 'jazz', frets: [-1, 3, 2, 4, 3, 0] },
  { id: 'Dm11-j',    name: 'Dm11',    root: 'D',  notes: ['D','F','A','C','G'],     quality: 'jazz', frets: [-1, -1, 0, 2, 1, 3] },
  { id: 'Em9-j',     name: 'Em9',     root: 'E',  notes: ['E','G','B','D','F#'],    quality: 'jazz', frets: [0, 2, 0, 0, 0, 2] },
  { id: 'Fmaj9-j',   name: 'Fmaj9',   root: 'F',  notes: ['F','A','C','E','G'],     quality: 'jazz', frets: [-1, -1, 3, 0, 1, 0] },
  { id: 'G13-j',     name: 'G13',     root: 'G',  notes: ['G','B','D','F','E'],     quality: 'jazz', frets: [3, -1, 0, 0, 0, 0] },
  { id: 'Am11-j',    name: 'Am11',    root: 'A',  notes: ['A','C','E','G','D'],     quality: 'jazz', frets: [-1, 0, 0, 0, 1, 0] },
  { id: 'Bbmaj7-j',  name: 'Bbmaj7',  root: 'Bb', notes: ['Bb','D','F','A'],        quality: 'jazz', frets: [-1, 1, 3, 2, 3, 1] },
  { id: 'C#maj7-j',  name: 'C#maj7',  root: 'C#', notes: ['C#','F','G#','C'],       quality: 'jazz', frets: [-1, 4, 3, 1, 1, 1] },
  { id: 'Ebmaj7-j',  name: 'Ebmaj7',  root: 'Eb', notes: ['Eb','G','Bb','D'],       quality: 'jazz', frets: [-1, 6, 5, 3, 3, 3] },
  { id: 'F#m7b5-j',  name: 'F#m7b5',  root: 'F#', notes: ['F#','A','C','E'],        quality: 'jazz', frets: [2, -1, 2, 2, 1, -1] },
  { id: 'Bdim7-j',   name: 'Bdim7',   root: 'B',  notes: ['B','D','F','Ab'],        quality: 'jazz', frets: [-1, 2, 3, 1, 3, 1] },
  { id: 'C7#9-j',    name: 'C7#9',    root: 'C',  notes: ['C','E','G','Bb','D#'],   quality: 'jazz', frets: [-1, 3, 2, 3, 4, 4] },
  { id: 'A7b9-j',    name: 'A7b9',    root: 'A',  notes: ['A','C#','E','G','Bb'],   quality: 'jazz', frets: [-1, 0, 2, 0, 2, 1] },
  { id: 'D7#11-j',   name: 'D7#11',   root: 'D',  notes: ['D','F#','A','C','G#'],   quality: 'jazz', frets: [-1, -1, 0, 1, 1, 2] },
  { id: 'E7b13-j',   name: 'E7b13',   root: 'E',  notes: ['E','G#','B','D','C'],    quality: 'jazz', frets: [0, 2, 0, 1, 1, 0] },
  { id: 'Gm6-j',     name: 'Gm6',     root: 'G',  notes: ['G','Bb','D','E'],        quality: 'jazz', frets: [3, -1, 2, 3, 3, 3] },
  { id: 'Am6-j',     name: 'Am6',     root: 'A',  notes: ['A','C','E','F#'],        quality: 'jazz', frets: [-1, 0, 2, 2, 1, 2] },

  // ── Power chords ──
  { id: 'E5',  name: 'E5',  root: 'E', notes: ['E','B'],  quality: 'power', frets: [0, 2, 2, -1, -1, -1] },
  { id: 'A5',  name: 'A5',  root: 'A', notes: ['A','E'],  quality: 'power', frets: [-1, 0, 2, 2, -1, -1] },
  { id: 'D5',  name: 'D5',  root: 'D', notes: ['D','A'],  quality: 'power', frets: [-1, -1, 0, 2, 3, -1] },
  { id: 'G5',  name: 'G5',  root: 'G', notes: ['G','D'],  quality: 'power', frets: [3, 5, 5, -1, -1, -1] },
  { id: 'C5',  name: 'C5',  root: 'C', notes: ['C','G'],  quality: 'power', frets: [-1, 3, 5, 5, -1, -1] },
  { id: 'F5',  name: 'F5',  root: 'F', notes: ['F','C'],  quality: 'power', frets: [1, 3, 3, -1, -1, -1] },
]

/* ------------------------------------------------------------------ */
/*  Export                                                              */
/* ------------------------------------------------------------------ */

export const guitarChords: GuitarChord[] = [
  ...generateCAGED(),
  ...generateInversions(),
  ...specialChords,
]

/* ------------------------------------------------------------------ */
/*  Easiest open-position guitar voicing for a built chord             */
/*  Used by the Chord Builder to show the basic shape "anyone can      */
/*  play" for the chord the user is building.                          */
/* ------------------------------------------------------------------ */

export type OpenGuitarVoicing = {
  name: string
  frets: number[]
  /** true when it uses open strings and stays within the first few frets */
  isOpen: boolean
}

// Map the Chord Builder quality keys to the available CAGED shape sets.
const BUILDER_GUITAR_SHAPES: Record<string, { shapes: Record<string, ShapeTemplate>; suffix: string }> = {
  major:     { shapes: MAJOR_SHAPES, suffix: '' },
  minor:     { shapes: MINOR_SHAPES, suffix: 'm' },
  dominant7: { shapes: DOM7_SHAPES,  suffix: '7' },
  major7:    { shapes: MAJ7_SHAPES,  suffix: 'maj7' },
  minor7:    { shapes: MIN7_SHAPES,  suffix: 'm7' },
}

/**
 * Returns the easiest playable open-position voicing for a chord, or null when
 * no simple guitar shape exists for that quality. Among the five CAGED shapes
 * we favour the one with the lowest frets and the most open strings.
 */
export function getOpenGuitarChord(root: string, builderQuality: string): OpenGuitarVoicing | null {
  const cfg = BUILDER_GUITAR_SHAPES[builderQuality]
  if (!cfg) return null

  const rootSem = SEMITONE[root]
  if (rootSem === undefined) return null

  let best: { frets: number[]; score: number } | null = null
  for (const template of Object.values(cfg.shapes)) {
    const shift = ((rootSem - template.rootSemitone) + 12) % 12
    const frets = shiftFrets(template.frets, shift)
    const fretted = frets.filter((f) => f > 0)
    const maxFret = fretted.length ? Math.max(...fretted) : 0
    const openStrings = frets.filter((f) => f === 0).length
    // Prefer a low top fret, then more ringing open strings.
    const score = maxFret * 10 - openStrings
    if (!best || score < best.score) best = { frets, score }
  }
  if (!best) return null

  const topFret = Math.max(0, ...best.frets.filter((f) => f > 0))
  const isOpen = best.frets.some((f) => f === 0) && topFret <= 4

  return { name: `${root}${cfg.suffix}`, frets: best.frets, isOpen }
}

/* ------------------------------------------------------------------ */
/*  Piano chords  — generated for every root and quality               */
/* ------------------------------------------------------------------ */

export const PIANO_ROOTS = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'] as const

type PianoQualityConfig = {
  quality: string
  suffix: string
  intervals: number[]
}

// Order here defines the order chords appear within a key.
const PIANO_QUALITIES: PianoQualityConfig[] = [
  { quality: 'major',      suffix: '',     intervals: [0, 4, 7] },
  { quality: 'minor',      suffix: 'm',    intervals: [0, 3, 7] },
  { quality: 'major7',     suffix: 'maj7', intervals: [0, 4, 7, 11] },
  { quality: 'minor7',     suffix: 'm7',   intervals: [0, 3, 7, 10] },
  { quality: 'dominant7',  suffix: '7',    intervals: [0, 4, 7, 10] },
  { quality: 'sus',        suffix: 'sus2', intervals: [0, 2, 7] },
  { quality: 'sus',        suffix: 'sus4', intervals: [0, 5, 7] },
  { quality: 'augmented',  suffix: 'aug',  intervals: [0, 4, 8] },
  { quality: 'diminished', suffix: 'dim',  intervals: [0, 3, 6] },
]

function generatePianoChords(): PianoChordEntry[] {
  const chords: PianoChordEntry[] = []
  for (const root of PIANO_ROOTS) {
    for (const { quality, suffix, intervals } of PIANO_QUALITIES) {
      chords.push({
        name: `${root}${suffix}`,
        root,
        notes: buildNotes(root, intervals),
        quality,
      })
    }
  }
  return chords
}

export const pianoChords: PianoChordEntry[] = generatePianoChords()
