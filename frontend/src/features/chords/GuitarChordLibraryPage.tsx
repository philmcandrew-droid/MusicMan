import { useMemo, useState } from 'react'
import { GuitarChordDiagram } from '../../components/GuitarChordDiagram'
import { PageHero } from '../../components/PageHero'
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

/**
 * Lower score = easier / more open. Favours low fret positions and rewards
 * ringing open strings, so the default voicing is the basic open chord anyone
 * can play rather than a barre shape higher up the neck.
 */
function opennessScore(frets: number[]): number {
  const fretted = frets.filter((f) => f > 0)
  const maxFret = fretted.length ? Math.max(...fretted) : 0
  const openStrings = frets.filter((f) => f === 0).length
  return maxFret * 10 - openStrings
}

export function GuitarChordLibraryPage() {
  const [filterRoot, setFilterRoot] = useState<string | null>(null)
  const [filterQuality, setFilterQuality] = useState<string | null>(null)
  const [filterShape, setFilterShape] = useState<string | null>(null)

  // Changing the key starts fresh: clear type and CAGED position.
  const handleRootChange = (root: string) => {
    setFilterShape(null)
    setFilterQuality(null)
    setFilterRoot((prev) => (prev === root ? null : root))
  }

  // Changing the type clears any CAGED position so options never stack.
  const handleQualityChange = (quality: string) => {
    setFilterShape(null)
    setFilterQuality((prev) => (prev === quality ? null : quality))
  }

  const handleShapeChange = (shape: string) => {
    setFilterShape((prev) => (prev === shape ? null : shape))
  }

  const clearAll = () => {
    setFilterRoot(null)
    setFilterQuality(null)
    setFilterShape(null)
  }

  // CAGED positions only apply to CAGED-capable qualities.
  const showCagedRow =
    filterRoot !== null && (filterQuality === null || CAGED_QUALITIES.has(filterQuality))

  const filtered = useMemo(() => {
    // Nothing is shown until a key is chosen.
    if (filterRoot === null) return []

    let list = guitarChords.filter((c) => {
      if (c.root !== filterRoot) return false
      if (filterQuality !== null && c.quality !== filterQuality) return false
      return true
    })

    if (filterShape !== null) {
      // CAGED drill-down: show only the chosen shape's voicings.
      list = list.filter((c) => c.cagedShape === filterShape)
    } else {
      // Default view: one voicing per chord, choosing the easiest open-position
      // shape (collapse stacked CAGED positions to the basic playable shape).
      const byName = new Map<string, (typeof list)[number]>()
      const order: string[] = []
      for (const c of list) {
        const existing = byName.get(c.name)
        if (!existing) {
          byName.set(c.name, c)
          order.push(c.name)
        } else if (opennessScore(c.frets) < opennessScore(existing.frets)) {
          byName.set(c.name, c)
        }
      }
      list = order.map((name) => byName.get(name)!)
    }

    return list
  }, [filterQuality, filterRoot, filterShape])

  return (
    <div className="page-card stack">
      <PageHero
        variant="guitar-chords"
        title="Guitar Chords"
        subtitle="Pick a key to see every chord in it. Add a type to narrow down, then drill into CAGED positions."
        color="#8b5cf6"
      />

      {/* Key filter */}
      <div className="glass-panel">
        <span className="section-label">Key</span>
        <div className="chip-group">
          {ROOTS.map((r) => (
            <button
              key={r}
              className={`chip${filterRoot === r ? ' active' : ''}`}
              onClick={() => handleRootChange(r)}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Type filter — only relevant once a key is chosen */}
      {filterRoot !== null && (
        <div className="glass-panel">
          <span className="section-label">Type {filterQuality === null && <em style={{ fontWeight: 400, fontStyle: 'normal', color: 'var(--text-muted)' }}>· showing all</em>}</span>
          <div className="chip-group">
            {QUALITIES.map((q) => (
              <button
                key={q}
                className={`chip${q === filterQuality ? ' active' : ''}`}
                onClick={() => handleQualityChange(q)}
              >
                {QUALITY_LABELS[q] ?? q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* CAGED shape filter */}
      {showCagedRow && (
        <div className="glass-panel">
          <span className="section-label">CAGED Position {filterShape === null && <em style={{ fontWeight: 400, fontStyle: 'normal', color: 'var(--text-muted)' }}>· standard voicing</em>}</span>
          <div className="chip-group">
            {CAGED_SHAPES.map((s) => (
              <button
                key={s}
                className={`chip${filterShape === s ? ' active' : ''}`}
                onClick={() => handleShapeChange(s)}
              >
                {s} shape
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results header */}
      {filterRoot !== null && (
        <div className="row" style={{ justifyContent: 'space-between' }}>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            {filtered.length} chord{filtered.length !== 1 ? 's' : ''} in {filterRoot}
            {filterQuality !== null ? ` · ${QUALITY_LABELS[filterQuality] ?? filterQuality}` : ''}
            {filterShape !== null ? ` · ${filterShape} shape` : ''}
          </p>
          <button
            className="btn-ghost"
            style={{ fontSize: '0.72rem', padding: '0.3rem 0.7rem' }}
            onClick={clearAll}
          >
            Clear all
          </button>
        </div>
      )}

      {filterRoot === null && (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>
          Select a key above to browse its chords.
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
        {filtered.length === 0 && filterRoot !== null && (
          <p style={{ color: 'var(--text-muted)', gridColumn: '1/-1' }}>No chords match your filters.</p>
        )}
      </div>
    </div>
  )
}
