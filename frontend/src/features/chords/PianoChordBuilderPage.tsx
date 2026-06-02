import { useState } from 'react'
import { PageHero } from '../../components/PageHero'
import { PianoKeyboard } from '../../components/PianoKeyboard'
import { GuitarChordDiagram } from '../../components/GuitarChordDiagram'
import { getOpenGuitarChord } from './chordData'

const CHROMATIC = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

type Formula = { intervals: number[]; label: string; suffix: string }

const FORMULAS: Record<string, Formula> = {
  major:      { intervals: [0, 4, 7],        label: 'Major',          suffix: '' },
  minor:      { intervals: [0, 3, 7],        label: 'Minor',          suffix: 'm' },
  diminished: { intervals: [0, 3, 6],        label: 'Diminished',     suffix: 'dim' },
  augmented:  { intervals: [0, 4, 8],        label: 'Augmented',      suffix: 'aug' },
  major7:     { intervals: [0, 4, 7, 11],    label: 'Major 7th',      suffix: 'maj7' },
  minor7:     { intervals: [0, 3, 7, 10],    label: 'Minor 7th',      suffix: 'm7' },
  dominant7:  { intervals: [0, 4, 7, 10],    label: 'Dominant 7th',   suffix: '7' },
  dim7:       { intervals: [0, 3, 6, 9],     label: 'Diminished 7th', suffix: 'dim7' },
  sus2:       { intervals: [0, 2, 7],        label: 'Suspended 2nd',  suffix: 'sus2' },
  sus4:       { intervals: [0, 5, 7],        label: 'Suspended 4th',  suffix: 'sus4' },
  add9:       { intervals: [0, 4, 7, 14],    label: 'Add 9',          suffix: 'add9' },
  '6th':      { intervals: [0, 4, 7, 9],     label: '6th',            suffix: '6' },
  minor6:     { intervals: [0, 3, 7, 9],     label: 'Minor 6th',      suffix: 'm6' },
  '9th':      { intervals: [0, 4, 7, 10, 14], label: '9th',           suffix: '9' },
}

const INTERVAL_NAMES: Record<number, string> = {
  0: 'Root', 1: 'b2', 2: '2', 3: 'b3', 4: '3', 5: '4', 6: 'b5',
  7: '5', 8: '#5', 9: '6', 10: 'b7', 11: '7', 12: '8',
  13: 'b9', 14: '9',
}

const SEMITONE: Record<string, number> = {
  C: 0, 'C#': 1, D: 2, 'D#': 3, E: 4, F: 5,
  'F#': 6, G: 7, 'G#': 8, A: 9, 'A#': 10, B: 11,
}

function noteFreq(note: string, octave: number): number {
  const s = (SEMITONE[note] ?? 0) - 9
  return 440 * Math.pow(2, s / 12 + (octave - 4))
}

/** Play the chord tones in an ascending voicing from the (possibly inverted) bass. */
function playChord(notes: string[]) {
  const ctx = new AudioContext()
  const master = ctx.createGain()
  const now = ctx.currentTime
  master.gain.setValueAtTime(0.0001, now)
  master.gain.exponentialRampToValueAtTime(0.26, now + 0.02)
  master.gain.exponentialRampToValueAtTime(0.001, now + 1.9)
  master.connect(ctx.destination)

  let octave = 4
  let prev = -1
  for (const note of notes) {
    const pc = SEMITONE[note] ?? 0
    if (pc <= prev) octave += 1
    prev = pc
    const osc = ctx.createOscillator()
    osc.type = 'triangle'
    osc.frequency.value = noteFreq(note, octave)
    osc.connect(master)
    osc.start(now)
    osc.stop(now + 1.95)
  }
  setTimeout(() => ctx.close().catch(() => {}), 2200)
}

export function PianoChordBuilderPage() {
  const [root, setRoot] = useState('C')
  const [quality, setQuality] = useState('major')
  const [inversion, setInversion] = useState(0)

  const formula = FORMULAS[quality]
  const rootIdx = CHROMATIC.indexOf(root)

  // Chord tones in root position, paired with their interval label.
  const rootPositionTones = formula.intervals.map((step) => ({
    note: CHROMATIC[(rootIdx + step) % 12],
    interval: INTERVAL_NAMES[step] ?? `${step}`,
  }))

  // Apply inversion by rotating the tones.
  let tones = rootPositionTones
  for (let i = 0; i < inversion && i < tones.length; i++) {
    tones = [...tones.slice(1), tones[0]]
  }
  const notes = tones.map((t) => t.note)

  const chordSymbol = `${root}${formula.suffix}`
  const bass = notes[0]
  const displaySymbol = inversion > 0 ? `${chordSymbol}/${bass}` : chordSymbol

  // Easiest open-position guitar shape for the chord (root + type only).
  const guitarVoicing = getOpenGuitarChord(root, quality)

  const inversionLabels = ['Root', '1st', '2nd', '3rd', '4th']

  return (
    <div className="page-card stack">
      <PageHero
        variant="chord-builder"
        title="Chord Builder"
        subtitle="Build any chord in three steps: pick a root, choose a type, then hear it and try inversions."
        color="#f59e0b"
      />

      {/* Step 1 — root */}
      <div className="builder-step">
        <div className="builder-step-head">
          <span className="builder-step-num">1</span>
          <div>
            <h3>Choose a root note</h3>
            <p>The note your chord is built on.</p>
          </div>
        </div>
        <div className="chip-group">
          {CHROMATIC.map((n) => (
            <button key={n} className={`chip${n === root ? ' active' : ''}`} onClick={() => { setRoot(n); setInversion(0) }}>
              {n}
            </button>
          ))}
        </div>
      </div>

      {/* Step 2 — quality */}
      <div className="builder-step">
        <div className="builder-step-head">
          <span className="builder-step-num">2</span>
          <div>
            <h3>Choose a chord type</h3>
            <p>Each type stacks a different set of intervals on top of the root.</p>
          </div>
        </div>
        <div className="chip-group">
          {Object.entries(FORMULAS).map(([key, { label }]) => (
            <button key={key} className={`chip${key === quality ? ' active' : ''}`} onClick={() => { setQuality(key); setInversion(0) }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Step 3 — result */}
      <div className="builder-step">
        <div className="builder-step-head">
          <span className="builder-step-num">3</span>
          <div>
            <h3>Your chord</h3>
            <p>Hear it, see its notes, and try inversions.</p>
          </div>
        </div>

        <div className="builder-result">
          <div className="builder-symbol">
            <span className="builder-symbol-text">{displaySymbol}</span>
            <span className="builder-symbol-label">{formula.label}{inversion > 0 ? ` · ${inversionLabels[inversion]} inversion` : ''}</span>
          </div>

          <button className="builder-play" onClick={() => playChord(notes)}>
            <svg width={18} height={18} viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M8 5v14l11-7z" /></svg>
            Play chord
          </button>
        </div>

        {/* Chord tones with interval labels */}
        <div className="builder-tones">
          {tones.map((t, i) => (
            <div key={i} className={`builder-tone${i === 0 ? ' bass' : ''}`}>
              <span className="builder-tone-note">{t.note}</span>
              <span className="builder-tone-interval">{t.interval}</span>
            </div>
          ))}
        </div>

        {/* Inversion selector */}
        <div className="builder-inversions">
          <span className="section-label">Inversion</span>
          <div className="chip-group">
            {Array.from({ length: notes.length }).map((_, i) => (
              <button
                key={i}
                className={`chip${i === inversion ? ' active' : ''}`}
                onClick={() => setInversion(i)}
              >
                {inversionLabels[i] ?? `${i}th`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Basic open guitar shape anyone can play */}
      <div className="builder-guitar">
        <div className="builder-guitar-head">
          <span className="section-label">On guitar</span>
          {guitarVoicing && (
            <span className="builder-guitar-tag">
              {guitarVoicing.isOpen ? 'Open chord' : 'Easiest shape'}
            </span>
          )}
        </div>
        {guitarVoicing ? (
          <div className="builder-guitar-diagram">
            <GuitarChordDiagram frets={guitarVoicing.frets} name={guitarVoicing.name} />
            <div className="builder-guitar-legend">
              <span><b>{chordSymbol}</b> — the basic open-position shape</span>
              <span className="builder-guitar-key">
                <span className="lg lg-x">×</span> don't play &nbsp;·&nbsp;
                <span className="lg lg-o">○</span> open string &nbsp;·&nbsp;
                <span className="lg lg-dot" /> finger
              </span>
            </div>
          </div>
        ) : (
          <p className="builder-hint">
            This chord type doesn't have a simple open guitar shape — browse the Guitar Chords library for full voicings.
          </p>
        )}
      </div>

      {/* Interactive piano */}
      <span className="section-label">On piano</span>
      <PianoKeyboard
        startOctave={3}
        octaves={3}
        highlightedNotes={notes}
        interactive
      />
      <p className="builder-hint">Tip: the highlighted keys are your chord tones — tap any key to hear it on its own.</p>
    </div>
  )
}
