import { useCallback, useMemo, useRef, useState } from 'react'
import { PianoKeyboard } from '../../components/PianoKeyboard'
import { pianoChords } from './chordData'

const QUALITIES = ['all', 'major', 'minor', 'major7', 'minor7', 'dominant7', 'sus', 'augmented', 'diminished']

const SEMITONES: Record<string, number> = {
  C: -9, 'C#': -8, Db: -8, D: -7, 'D#': -6, Eb: -6, E: -5,
  F: -4, 'F#': -3, Gb: -3, G: -2, 'G#': -1, Ab: -1, A: 0,
  'A#': 1, Bb: 1, B: 2,
}

function noteFreq(note: string, octave: number): number {
  const s = SEMITONES[note] ?? 0
  return 440 * Math.pow(2, s / 12 + (octave - 4))
}

function playChord(notes: string[], octave = 4) {
  const ctx = new AudioContext()
  const masterGain = ctx.createGain()
  masterGain.gain.setValueAtTime(0.25, ctx.currentTime)
  masterGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.6)
  masterGain.connect(ctx.destination)

  for (const note of notes) {
    const osc = ctx.createOscillator()
    osc.type = 'triangle'
    osc.frequency.value = noteFreq(note, octave)
    osc.connect(masterGain)
    osc.start()
    osc.stop(ctx.currentTime + 1.65)
  }
}

export function PianoChordLibraryPage() {
  const [query, setQuery] = useState('')
  const [filterQuality, setFilterQuality] = useState('all')
  const [playingChord, setPlayingChord] = useState<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout>>()

  const filtered = useMemo(
    () =>
      pianoChords.filter((c) => {
        const matchesName = c.name.toLowerCase().includes(query.toLowerCase())
        const matchesQuality = filterQuality === 'all' || c.quality === filterQuality
        return matchesName && matchesQuality
      }),
    [query, filterQuality],
  )

  const handlePlay = useCallback((chordName: string, notes: string[]) => {
    playChord(notes)
    setPlayingChord(chordName)
    clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => setPlayingChord(null), 1600)
  }, [])

  return (
    <div className="page-card stack">
      <h2 className="page-title">Piano Chord Library</h2>
      <p className="page-subtitle">Visual chord reference with mini keyboard diagrams. Click keys or press Play to hear chords.</p>

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
        {filtered.map((chord) => {
          const isPlaying = playingChord === chord.name
          return (
            <div
              key={chord.name}
              style={{
                background: 'var(--bg-elevated)',
                border: `1px solid ${isPlaying ? '#7c3aed' : 'var(--border)'}`,
                borderRadius: 'var(--radius-lg)',
                padding: '1rem',
                transition: 'border-color 0.3s',
              }}
            >
              <div className="row" style={{ marginBottom: '0.5rem', alignItems: 'center' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>{chord.name}</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{chord.notes.join(' · ')}</span>
                <span
                  className="chip"
                  style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem', cursor: 'default' }}
                >
                  {chord.quality}
                </span>
                <button
                  onClick={() => handlePlay(chord.name, chord.notes)}
                  style={{
                    marginLeft: 'auto',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    padding: '0.35rem 0.75rem',
                    borderRadius: 8,
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: '1px solid',
                    transition: 'all 0.2s',
                    background: isPlaying ? '#7c3aed' : 'transparent',
                    borderColor: isPlaying ? '#7c3aed' : 'var(--border)',
                    color: isPlaying ? '#fff' : 'var(--text-secondary)',
                  }}
                >
                  <svg width={14} height={14} viewBox="0 0 24 24" fill="currentColor" stroke="none">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  {isPlaying ? 'Playing…' : 'Play'}
                </button>
              </div>
              <PianoKeyboard
                startOctave={4}
                octaves={1}
                highlightedNotes={chord.notes}
                interactive
              />
            </div>
          )
        })}
        {filtered.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No chords match your search.</p>}
      </div>
    </div>
  )
}
