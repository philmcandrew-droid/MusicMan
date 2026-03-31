import { useMemo, useState } from 'react'
import { PianoKeyboard } from '../../components/PianoKeyboard'
import { pianoChords } from './chordData'

const QUALITIES = ['all', 'major', 'minor', 'major7', 'minor7', 'dominant7', 'sus', 'augmented', 'diminished']

export function PianoChordLibraryPage() {
  const [query, setQuery] = useState('')
  const [filterQuality, setFilterQuality] = useState('all')

  const filtered = useMemo(
    () =>
      pianoChords.filter((c) => {
        const matchesName = c.name.toLowerCase().includes(query.toLowerCase())
        const matchesQuality = filterQuality === 'all' || c.quality === filterQuality
        return matchesName && matchesQuality
      }),
    [query, filterQuality],
  )

  return (
    <div className="page-card stack">
      <h2 className="page-title">Piano Chord Library</h2>
      <p className="page-subtitle">Visual chord reference with mini keyboard diagrams. Click keys to hear them.</p>

      <div className="row" style={{ gap: '0.75rem' }}>
        <input
          aria-label="Search piano chords"
          placeholder="Search chords..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ maxWidth: 280 }}
        />
        <div className="chip-group">
          {QUALITIES.map((q) => (
            <button key={q} className={`chip${q === filterQuality ? ' active' : ''}`} onClick={() => setFilterQuality(q)}>
              {q === 'all' ? 'All' : q}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gap: '1rem' }}>
        {filtered.map((chord) => (
          <div
            key={chord.name}
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-lg)',
              padding: '1rem',
            }}
          >
            <div className="row" style={{ marginBottom: '0.5rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>{chord.name}</h3>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{chord.notes.join(' · ')}</span>
              <span
                className="chip"
                style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem', marginLeft: 'auto', cursor: 'default' }}
              >
                {chord.quality}
              </span>
            </div>
            <PianoKeyboard
              startOctave={4}
              octaves={1}
              highlightedNotes={chord.notes}
              interactive
            />
          </div>
        ))}
        {filtered.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No chords match your search.</p>}
      </div>
    </div>
  )
}
