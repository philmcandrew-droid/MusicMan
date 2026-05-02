import { useMemo, useState } from 'react'
import { GuitarChordDiagram } from '../../components/GuitarChordDiagram'
import { openTuningChords, TUNINGS } from './openTuningData'

const QUALITY_LABELS: Record<string, string> = {
  major: 'Major',
  minor: 'Minor',
  '7th': '7th',
  maj7: 'Maj7',
  min7: 'Min7',
  sus4: 'Sus4',
  power: 'Power',
}

export function OpenTuningChordPage() {
  const [selectedTuning, setSelectedTuning] = useState(TUNINGS[0].id)

  const tuningInfo = TUNINGS.find((t) => t.id === selectedTuning)!

  const chords = useMemo(
    () => openTuningChords.filter((c) => c.tuning === selectedTuning),
    [selectedTuning],
  )

  return (
    <div className="page-card stack">
      <h2 className="page-title">Open Tuning Chords</h2>
      <p className="page-subtitle">
        Chord voicings for alternate and open tunings. Select a tuning to browse shapes.
      </p>

      {/* Tuning selector */}
      <div>
        <span className="section-label">Tuning</span>
        <div className="chip-group">
          {TUNINGS.map((t) => (
            <button
              key={t.id}
              className={`chip${selectedTuning === t.id ? ' active' : ''}`}
              onClick={() => setSelectedTuning(t.id)}
            >
              {t.name}
            </button>
          ))}
        </div>
      </div>

      {/* Tuning info banner */}
      <div className="tuning-banner">
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true" style={{ opacity: 0.3, flexShrink: 0 }}>
          <path d="M16 2C16 2 12 8 12 16c0 6 2 12 4 14 2-2 4-8 4-14 0-8-4-14-4-14z" stroke="currentColor" strokeWidth="1.5" fill="none" />
          <circle cx="16" cy="24" r="5" stroke="currentColor" strokeWidth="1.5" />
          <line x1="11" y1="24" x2="21" y2="24" stroke="currentColor" strokeWidth="0.5" opacity="0.5" />
        </svg>
        <div>
          <span className="tuning-banner-name">{tuningInfo.name}</span>
          <span className="tuning-banner-strings">{tuningInfo.label}</span>
        </div>
      </div>

      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
        {chords.length} chord{chords.length !== 1 ? 's' : ''} shown
      </p>

      {/* Chord grid */}
      <div className="chord-grid">
        {chords.map((chord) => (
          <div key={chord.id} className="chord-card">
            <h3>{chord.name}</h3>
            <span className="tuning-quality-badge">{QUALITY_LABELS[chord.quality] ?? chord.quality}</span>
            <GuitarChordDiagram frets={chord.frets} name={chord.name} />
            <p className="notes">{chord.notes.join(' · ')}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
