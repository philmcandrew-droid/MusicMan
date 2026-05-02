import { useMemo, useState } from 'react'
import { GuitarChordDiagram } from '../../components/GuitarChordDiagram'
import { guitarChords } from './chordData'

const ROOTS = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B']

const CAGED_QUALITIES = new Set(['major', 'minor', '7th', 'maj7', 'min7'])

const QUALITIES = ['major', 'minor', '7th', 'maj7', 'min7', 'inversion', '9th', '13th', 'jazz', 'power']

const QUALITY_LABELS: Record<string, string> = {
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

const CAGED_SHAPES = ['C', 'A', 'G', 'E', 'D']

export function GuitarChordLibraryPage() {
  const [filterRoot, setFilterRoot] = useState<string | null>(null)
  const [filterQuality, setFilterQuality] = useState<string | null>(null)
  const [filterShape, setFilterShape] = useState<string | null>(null)

  const hasAnyFilter = filterRoot !== null || filterQuality !== null

  const handleQualityChange = (quality: string | null) => {
    setFilterQuality(quality)
    if (quality !== null && !CAGED_QUALITIES.has(quality)) {
      setFilterShape(null)
    }
  }

  const showCagedRow = filterQuality === null || CAGED_QUALITIES.has(filterQuality)

  const filtered = useMemo(() => {
    if (!hasAnyFilter) return []

    return guitarChords.filter((c) => {
      if (filterQuality !== null && c.quality !== filterQuality) return false
      if (filterRoot !== null && c.root !== filterRoot) return false
      if (filterShape !== null && c.cagedShape !== filterShape) return false
      return true
    })
  }, [hasAnyFilter, filterQuality, filterRoot, filterShape])

  return (
    <div className="page-card stack">
      <h2 className="page-title">Guitar Chord Library</h2>
      <p className="page-subtitle">
        Pick a key and type to browse chords. Narrow by CAGED position.
      </p>

      {/* Key filter */}
      <div>
        <span className="section-label">Key</span>
        <div className="chip-group">
          {ROOTS.map((r) => (
            <button
              key={r}
              className={`chip${filterRoot === r ? ' active' : ''}`}
              onClick={() => setFilterRoot(r === filterRoot ? null : r)}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Type filter */}
      <div>
        <span className="section-label">Type</span>
        <div className="chip-group">
          {QUALITIES.map((q) => (
            <button
              key={q}
              className={`chip${q === filterQuality ? ' active' : ''}`}
              onClick={() => handleQualityChange(q === filterQuality ? null : q)}
            >
              {QUALITY_LABELS[q] ?? q}
            </button>
          ))}
        </div>
      </div>

      {/* CAGED shape filter */}
      {showCagedRow && (
        <div>
          <span className="section-label">CAGED Position</span>
          <div className="chip-group">
            {CAGED_SHAPES.map((s) => (
              <button
                key={s}
                className={`chip${filterShape === s ? ' active' : ''}`}
                onClick={() => setFilterShape(s === filterShape ? null : s)}
              >
                {s} shape
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {hasAnyFilter && (
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            {filtered.length} chord{filtered.length !== 1 ? 's' : ''} shown
          </p>
          <button
            className="btn-ghost"
            style={{ fontSize: '0.72rem', padding: '0.3rem 0.7rem' }}
            onClick={() => {
              setFilterRoot(null)
              setFilterQuality(null)
              setFilterShape(null)
            }}
          >
            Clear all
          </button>
        </div>
      )}

      {!hasAnyFilter && (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>
          Select a key or type above to browse chords.
        </p>
      )}

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
        {filtered.length === 0 && hasAnyFilter && (
          <p style={{ color: 'var(--text-muted)', gridColumn: '1/-1' }}>No chords match your filters.</p>
        )}
      </div>
    </div>
  )
}
