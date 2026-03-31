import { useState } from 'react'
import { PianoKeyboard } from '../../components/PianoKeyboard'

const CHROMATIC = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

const FORMULAS: Record<string, { intervals: number[]; label: string }> = {
  major:       { intervals: [0, 4, 7],       label: 'Major' },
  minor:       { intervals: [0, 3, 7],       label: 'Minor' },
  diminished:  { intervals: [0, 3, 6],       label: 'Diminished' },
  augmented:   { intervals: [0, 4, 8],       label: 'Augmented' },
  major7:      { intervals: [0, 4, 7, 11],   label: 'Major 7th' },
  minor7:      { intervals: [0, 3, 7, 10],   label: 'Minor 7th' },
  dominant7:   { intervals: [0, 4, 7, 10],   label: 'Dominant 7th' },
  dim7:        { intervals: [0, 3, 6, 9],    label: 'Diminished 7th' },
  sus2:        { intervals: [0, 2, 7],       label: 'Suspended 2nd' },
  sus4:        { intervals: [0, 5, 7],       label: 'Suspended 4th' },
  add9:        { intervals: [0, 4, 7, 14],   label: 'Add 9' },
  '6th':       { intervals: [0, 4, 7, 9],    label: '6th' },
  minor6:      { intervals: [0, 3, 7, 9],    label: 'Minor 6th' },
  '9th':       { intervals: [0, 4, 7, 10, 14], label: '9th' },
}

const INTERVAL_NAMES: Record<number, string> = {
  0: 'R', 1: 'b2', 2: '2', 3: 'b3', 4: '3', 5: '4', 6: 'b5',
  7: '5', 8: '#5', 9: '6', 10: 'b7', 11: '7', 12: '8',
  13: 'b9', 14: '9',
}

export function PianoChordBuilderPage() {
  const [root, setRoot] = useState('C')
  const [quality, setQuality] = useState('major')
  const [inversion, setInversion] = useState(0)

  const formula = FORMULAS[quality]
  const rootIdx = CHROMATIC.indexOf(root)
  let notes = formula.intervals.map((step) => CHROMATIC[(rootIdx + step) % 12])
  for (let i = 0; i < inversion && i < notes.length; i++) {
    notes = [...notes.slice(1), notes[0]]
  }

  const intervals = formula.intervals.map((step) => INTERVAL_NAMES[step] || `${step}`)

  const chordSymbol = `${root}${quality === 'major' ? '' : quality === 'minor' ? 'm' : quality}`

  return (
    <div className="page-card stack">
      <h2 className="page-title">Interactive Chord Builder</h2>
      <p className="page-subtitle">Select a root and quality, then click the keys to hear them. The keyboard highlights active chord tones.</p>

      <div className="row" style={{ gap: '1rem', flexWrap: 'wrap' }}>
        <div>
          <p className="section-label">Root Note</p>
          <div className="chip-group">
            {CHROMATIC.map((n) => (
              <button key={n} className={`chip${n === root ? ' active' : ''}`} onClick={() => { setRoot(n); setInversion(0) }}>
                {n}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="section-label">Chord Quality</p>
          <div className="chip-group">
            {Object.entries(FORMULAS).map(([key, { label }]) => (
              <button key={key} className={`chip${key === quality ? ' active' : ''}`} onClick={() => { setQuality(key); setInversion(0) }}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chord info */}
      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-lg)', padding: '1rem 1.5rem', border: '1px solid var(--border)' }}>
          <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--accent)' }}>{chordSymbol}</p>
        </div>
        <div className="stack" style={{ gap: '0.3rem' }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            <strong>Notes:</strong> {notes.join(' — ')}
          </p>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            <strong>Intervals:</strong> {intervals.join(' — ')}
          </p>
          <div className="row" style={{ gap: '0.4rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Inversion:</span>
            {Array.from({ length: notes.length }).map((_, i) => (
              <button
                key={i}
                className={`chip${i === inversion ? ' active' : ''}`}
                style={{ padding: '0.2rem 0.6rem', fontSize: '0.75rem' }}
                onClick={() => setInversion(i)}
              >
                {i === 0 ? 'Root' : `${i}${i === 1 ? 'st' : i === 2 ? 'nd' : 'rd'}`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive piano */}
      <PianoKeyboard
        startOctave={3}
        octaves={3}
        highlightedNotes={notes}
        interactive
      />
    </div>
  )
}
