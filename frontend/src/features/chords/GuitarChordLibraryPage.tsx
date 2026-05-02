import { useMemo, useState } from 'react'
import { GuitarChordDiagram } from '../../components/GuitarChordDiagram'
import { guitarChords } from './chordData'

const ROOTS = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B']
const QUALITIES = ['all', 'major', 'minor', '7th', 'maj7', 'min7', 'inversion', '9th', '13th', 'jazz', 'power']
const CAGED_SHAPES = ['C', 'A', 'G', 'E', 'D']

const QUALITY_LABELS: Record<string, string> = {
  all: 'All',
  major: 'Major',
  minor: 'Minor',
  '7th': '7th',
  maj7: 'Maj7',
  min7: 'Min7',
  inversion: 'Inversions',
  '9th': '9th',
  '13th': '13th',
  jazz: 'Jazz',
  power: 'Power',
}

export function GuitarChordLibraryPage() {
  const [query, setQuery] = useState('')
  const [filterRoot, setFilterRoot] = useState('all')
  const [filterQuality, setFilterQuality] = useState('all')
  const [filterShape, setFilterShape] = useState('all')

  const filtered = useMemo(
    () =>
      guitarChords.filter((c) => {
        if (query && !c.name.toLowerCase().includes(query.toLowerCase())) return false
        if (filterQuality !== 'all' && c.quality !== filterQuality) return false
        if (filterRoot !== 'all' && c.root !== filterRoot) return false
        if (filterShape !== 'all' && c.cagedShape !== filterShape) return false
        return true
      }),
    [query, filterQuality, filterRoot, filterShape],
  )

  return (
    <div className="page-card stack">
      <h2 className="page-title">Guitar Chord Library</h2>
      <p className="page-subtitle">
        Browse chords with fretboard diagrams. Filter by key, type, or CAGED position.
      </p>

      <div className="row" style={{ gap: '0.75rem' }}>
        <input
          aria-label="Search guitar chords"
          placeholder="Search chords..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ maxWidth: 280 }}
        />
      </div>

      {/* Quality filter */}
      <div>
        <span className="section-label">Type</span>
        <div className="chip-group">
          {QUALITIES.map((q) => (
            <button
              key={q}
              className={`chip${q === filterQuality ? ' active' : ''}`}
              onClick={() => setFilterQuality(q)}
            >
              {QUALITY_LABELS[q] ?? q}
            </button>
          ))}
        </div>
      </div>

      {/* Root key filter */}
      <div>
        <span className="section-label">Key</span>
        <div className="chip-group">
          <button
            className={`chip${filterRoot === 'all' ? ' active' : ''}`}
            onClick={() => setFilterRoot('all')}
          >
            All
          </button>
          {ROOTS.map((r) => (
            <button
              key={r}
              className={`chip${filterRoot === r ? ' active' : ''}`}
              onClick={() => setFilterRoot(r)}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* CAGED shape filter */}
      <div>
        <span className="section-label">CAGED Position</span>
        <div className="chip-group">
          <button
            className={`chip${filterShape === 'all' ? ' active' : ''}`}
            onClick={() => setFilterShape('all')}
          >
            All
          </button>
          {CAGED_SHAPES.map((s) => (
            <button
              key={s}
              className={`chip${filterShape === s ? ' active' : ''}`}
              onClick={() => setFilterShape(s)}
            >
              {s} shape
            </button>
          ))}
        </div>
      </div>

      <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
        {filtered.length} chord{filtered.length !== 1 ? 's' : ''} shown
      </p>

      <div className="chord-grid">
        {filtered.map((chord) => (
          <div key={chord.id} className="chord-card">
            <h3>{chord.name}</h3>
            <div className="chord-badges">
              {chord.cagedShape && <span className="caged-badge">{chord.cagedShape} shape</span>}
              {chord.inversion && <span className="inv-badge">{chord.inversion} inv</span>}
            </div>
            <GuitarChordDiagram frets={chord.frets} name={chord.name} />
            <p className="notes">{chord.notes.join(' · ')}</p>
          </div>
        ))}
        {filtered.length === 0 && (
          <p style={{ color: 'var(--text-muted)', gridColumn: '1/-1' }}>No chords match your filters.</p>
        )}
      </div>
    </div>
  )
}
