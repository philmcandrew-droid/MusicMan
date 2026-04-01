import { useMemo, useState } from 'react'
import { GuitarChordDiagram } from '../../components/GuitarChordDiagram'
import { guitarChords } from './chordData'

const QUALITIES = ['all', 'major', 'minor', '7th', 'maj7', 'min7', '9th', '13th', 'moveable', 'jazz', 'power']

export function GuitarChordLibraryPage() {
  const [query, setQuery] = useState('')
  const [filterQuality, setFilterQuality] = useState('all')

  const filtered = useMemo(
    () =>
      guitarChords.filter((c) => {
        const matchesName = c.name.toLowerCase().includes(query.toLowerCase())
        const matchesQuality = filterQuality === 'all' || c.quality === filterQuality
        return matchesName && matchesQuality
      }),
    [query, filterQuality],
  )

  return (
    <div className="page-card stack">
      <h2 className="page-title">Guitar Chord Library</h2>
      <p className="page-subtitle">Browse chords with fretboard diagrams. Filter by type or search by name.</p>

      <div className="row" style={{ gap: '0.75rem' }}>
        <input
          aria-label="Search guitar chords"
          placeholder="Search chords..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ maxWidth: 280 }}
        />
        <div className="chip-group">
          {QUALITIES.map((q) => (
            <button key={q} className={`chip${q === filterQuality ? ' active' : ''}`} onClick={() => setFilterQuality(q)}>
              {q === 'all' ? 'All' : q.charAt(0).toUpperCase() + q.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="chord-grid">
        {filtered.map((chord) => (
          <div key={chord.name} className="chord-card">
            <h3>{chord.name}</h3>
            <GuitarChordDiagram frets={chord.frets} name={chord.name} />
            <p className="notes">{chord.notes.join(' · ')}</p>
          </div>
        ))}
        {filtered.length === 0 && <p style={{ color: 'var(--text-muted)', gridColumn: '1/-1' }}>No chords match your search.</p>}
      </div>
    </div>
  )
}
