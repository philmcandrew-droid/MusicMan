export type OpenTuningChord = {
  id: string
  name: string
  root: string
  notes: string[]
  quality: string
  frets: number[]
  tuning: string
}

export type TuningInfo = {
  id: string
  name: string
  label: string
  strings: string[]
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const ALL_ROOTS = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'] as const

const SEM: Record<string, number> = {
  C: 0, 'C#': 1, Db: 1, D: 2, Eb: 3, E: 4, F: 5,
  'F#': 6, Gb: 6, G: 7, Ab: 8, A: 9, Bb: 10, B: 11,
}

const SHARP = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
const FLAT  = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B']
const USE_FLATS = new Set(['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb'])

function noteAt(sem: number, root: string): string {
  const i = ((sem % 12) + 12) % 12
  return USE_FLATS.has(root) ? FLAT[i] : SHARP[i]
}

function buildNotes(root: string, intervals: number[]): string[] {
  const r = SEM[root]
  return intervals.map((iv) => noteAt(r + iv, root))
}

/* ------------------------------------------------------------------ */
/*  Interval maps per quality                                          */
/* ------------------------------------------------------------------ */

const INTERVALS: Record<string, number[]> = {
  major: [0, 4, 7],
  minor: [0, 3, 7],
  '7th': [0, 4, 7, 10],
  maj7: [0, 4, 7, 11],
  min7: [0, 3, 7, 10],
  sus4: [0, 5, 7],
  power: [0, 7],
}

const SUFFIX: Record<string, string> = {
  major: '', minor: 'm', '7th': '7', maj7: 'maj7', min7: 'm7', sus4: 'sus4', power: '5',
}

/* ------------------------------------------------------------------ */
/*  Tuning definitions                                                 */
/*                                                                     */
/*  shapes: fret offsets relative to the barre position.               */
/*  Each shape modifies specific strings to change the chord quality.  */
/* ------------------------------------------------------------------ */

type TuningDef = {
  id: string
  name: string
  label: string
  strings: string[]
  rootSemitone: number
  shapes: Record<string, number[]>
}

const TUNING_DEFS: TuningDef[] = [
  {
    id: 'open-d',
    name: 'Open D',
    label: 'D A D F# A D',
    strings: ['D', 'A', 'D', 'F#', 'A', 'D'],
    rootSemitone: 2,
    shapes: {
      major: [0, 0, 0, 0, 0, 0],
      minor: [0, 0, 0, -1, 0, 0],
      '7th': [0, 0, 0, 0, 0, -2],
      maj7:  [0, 0, 0, 0, 0, -1],
      min7:  [0, 0, 0, -1, 0, -2],
    },
  },
  {
    id: 'open-g',
    name: 'Open G',
    label: 'D G D G B D',
    strings: ['D', 'G', 'D', 'G', 'B', 'D'],
    rootSemitone: 7,
    shapes: {
      major: [0, 0, 0, 0, 0, 0],
      minor: [0, 0, 0, 0, -1, 0],
      '7th': [0, 0, 0, -2, 0, 0],
      maj7:  [0, 0, 0, -1, 0, 0],
      min7:  [0, 0, 0, -2, -1, 0],
    },
  },
  {
    id: 'open-e',
    name: 'Open E',
    label: 'E B E G# B E',
    strings: ['E', 'B', 'E', 'G#', 'B', 'E'],
    rootSemitone: 4,
    shapes: {
      major: [0, 0, 0, 0, 0, 0],
      minor: [0, 0, 0, -1, 0, 0],
      '7th': [0, 0, 0, 0, 0, -2],
      maj7:  [0, 0, 0, 0, 0, -1],
      min7:  [0, 0, 0, -1, 0, -2],
    },
  },
  {
    id: 'open-a',
    name: 'Open A',
    label: 'E A E A C# E',
    strings: ['E', 'A', 'E', 'A', 'C#', 'E'],
    rootSemitone: 9,
    shapes: {
      major: [0, 0, 0, 0, 0, 0],
      minor: [0, 0, 0, 0, -1, 0],
      '7th': [0, 0, 0, -2, 0, 0],
      maj7:  [0, 0, 0, -1, 0, 0],
      min7:  [0, 0, 0, -2, -1, 0],
    },
  },
  {
    id: 'open-c',
    name: 'Open C',
    label: 'C G C G C E',
    strings: ['C', 'G', 'C', 'G', 'C', 'E'],
    rootSemitone: 0,
    shapes: {
      major: [0, 0, 0, 0, 0, 0],
      minor: [0, 0, 0, 0, 0, -1],
      '7th': [0, 0, -2, 0, 0, 0],
      maj7:  [0, 0, -1, 0, 0, 0],
      min7:  [0, 0, -2, 0, 0, -1],
    },
  },
  {
    id: 'dadgad',
    name: 'DADGAD',
    label: 'D A D G A D',
    strings: ['D', 'A', 'D', 'G', 'A', 'D'],
    rootSemitone: 2,
    shapes: {
      sus4:  [0, 0, 0, 0, 0, 0],
      major: [0, 0, 0, -1, 0, 0],
      minor: [0, 0, 0, -2, 0, 0],
      '7th': [0, 0, 0, -1, 0, -2],
      min7:  [0, 0, 0, -2, 0, -2],
    },
  },
]

/* ------------------------------------------------------------------ */
/*  Generator for barre-based tunings                                  */
/* ------------------------------------------------------------------ */

function generateBarreChords(): OpenTuningChord[] {
  const chords: OpenTuningChord[] = []

  for (const tuning of TUNING_DEFS) {
    for (const [quality, offsets] of Object.entries(tuning.shapes)) {
      const intervals = INTERVALS[quality]
      const suffix = SUFFIX[quality] ?? quality

      for (const root of ALL_ROOTS) {
        const barre = ((SEM[root] - tuning.rootSemitone) + 12) % 12
        const frets = offsets.map((o) => {
          const f = barre + o
          return f < 0 ? -1 : f
        })

        const notes = buildNotes(root, intervals)

        chords.push({
          id: `${tuning.id}-${root}${suffix}-${quality}`,
          name: `${root}${suffix}`,
          root,
          notes,
          quality,
          frets,
          tuning: tuning.id,
        })
      }
    }
  }

  return chords
}

/* ------------------------------------------------------------------ */
/*  Drop D  — uses its own shape set (power chords + common voicings) */
/* ------------------------------------------------------------------ */

const DROP_D_ID = 'drop-d'

function generateDropDChords(): OpenTuningChord[] {
  const chords: OpenTuningChord[] = []

  // Power chords: barre bottom 3 strings, mute top 3
  for (const root of ALL_ROOTS) {
    const barre = ((SEM[root] - 2) + 12) % 12
    chords.push({
      id: `${DROP_D_ID}-${root}5-power`,
      name: `${root}5`,
      root,
      notes: buildNotes(root, INTERVALS.power),
      quality: 'power',
      frets: [barre, barre, barre, -1, -1, -1],
      tuning: DROP_D_ID,
    })
  }

  // Full-chord voicings (common shapes)
  const manual: Omit<OpenTuningChord, 'tuning'>[] = [
    { id: 'dd-D',    name: 'D',    root: 'D',  notes: ['D','F#','A'],       quality: 'major', frets: [0, 0, 0, 2, 3, 2] },
    { id: 'dd-Dm',   name: 'Dm',   root: 'D',  notes: ['D','F','A'],        quality: 'minor', frets: [0, 0, 0, 2, 3, 1] },
    { id: 'dd-D7',   name: 'D7',   root: 'D',  notes: ['D','F#','A','C'],   quality: '7th',   frets: [0, 0, 0, 2, 1, 2] },
    { id: 'dd-E',    name: 'E',    root: 'E',  notes: ['E','G#','B'],       quality: 'major', frets: [2, 2, 2, 1, 0, 0] },
    { id: 'dd-Em',   name: 'Em',   root: 'E',  notes: ['E','G','B'],        quality: 'minor', frets: [2, 2, 2, 0, 0, 0] },
    { id: 'dd-F',    name: 'F',    root: 'F',  notes: ['F','A','C'],        quality: 'major', frets: [3, 3, 3, 2, 1, 1] },
    { id: 'dd-Fm',   name: 'Fm',   root: 'F',  notes: ['F','Ab','C'],       quality: 'minor', frets: [3, 3, 3, 1, 1, 1] },
    { id: 'dd-G',    name: 'G',    root: 'G',  notes: ['G','B','D'],        quality: 'major', frets: [5, 5, 5, 4, 3, 3] },
    { id: 'dd-Gm',   name: 'Gm',   root: 'G',  notes: ['G','Bb','D'],       quality: 'minor', frets: [5, 5, 5, 3, 3, 3] },
    { id: 'dd-A',    name: 'A',    root: 'A',  notes: ['A','C#','E'],       quality: 'major', frets: [7, 0, 2, 2, 2, 0] },
    { id: 'dd-Am',   name: 'Am',   root: 'A',  notes: ['A','C','E'],        quality: 'minor', frets: [7, 0, 2, 2, 1, 0] },
    { id: 'dd-Bb',   name: 'Bb',   root: 'Bb', notes: ['Bb','D','F'],       quality: 'major', frets: [8, 1, 3, 3, 3, 1] },
    { id: 'dd-B',    name: 'B',    root: 'B',  notes: ['B','D#','F#'],      quality: 'major', frets: [9, 2, 4, 4, 4, 2] },
    { id: 'dd-C',    name: 'C',    root: 'C',  notes: ['C','E','G'],        quality: 'major', frets: [10, 3, 2, 0, 1, 0] },
    { id: 'dd-Cm',   name: 'Cm',   root: 'C',  notes: ['C','Eb','G'],       quality: 'minor', frets: [10, 3, 5, 5, 4, 3] },
  ]

  for (const c of manual) {
    chords.push({ ...c, tuning: DROP_D_ID })
  }

  return chords
}

/* ------------------------------------------------------------------ */
/*  Exports                                                            */
/* ------------------------------------------------------------------ */

export const TUNINGS: TuningInfo[] = [
  ...TUNING_DEFS.map((t) => ({ id: t.id, name: t.name, label: t.label, strings: t.strings })),
  { id: DROP_D_ID, name: 'Drop D', label: 'D A D G B E', strings: ['D', 'A', 'D', 'G', 'B', 'E'] },
]

export const openTuningChords: OpenTuningChord[] = [
  ...generateBarreChords(),
  ...generateDropDChords(),
]
