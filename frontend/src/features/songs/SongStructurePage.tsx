import { useState } from 'react'

type SectionType = 'Intro' | 'Verse' | 'Pre-Chorus' | 'Chorus' | 'Bridge' | 'Middle 8' | 'Outro' | 'Solo'

const SECTION_META: Record<SectionType, { color: string; advice: string }> = {
  Intro:        { color: '#6366f1', advice: 'Set the mood and draw the listener in. Keep it focused — a riff, pad, or rhythmic motif that hints at what follows.' },
  Verse:        { color: '#3b82f6', advice: 'Tell the story. Each verse adds lyrical detail while keeping the melody consistent. Build engagement through narrative progression.' },
  'Pre-Chorus': { color: '#0891b2', advice: 'Build tension and anticipation. Use rising melody, harmonic movement, or rhythmic acceleration to propel the listener into the chorus.' },
  Chorus:       { color: '#8b5cf6', advice: 'Deliver the hook. This is the emotional and melodic centrepiece — keep it singable, memorable, and dynamically lifted above the verse.' },
  Bridge:       { color: '#d946ef', advice: 'Offer contrast. Introduce a new chord center, lyric angle, or texture to reset the listener\'s ear before the final payoff.' },
  'Middle 8':   { color: '#f59e0b', advice: 'A brief departure (typically 8 bars) that adds surprise and variety. Change key, rhythm, or instrumentation to keep interest high.' },
  Solo:         { color: '#10b981', advice: 'Feature an instrumental voice. Build from the melodic theme and add expression — serve the song rather than just the player.' },
  Outro:        { color: '#64748b', advice: 'Close with intent. Repeat the hook with fading energy, resolve harmonically, or end abruptly for dramatic effect.' },
}

export function SongStructurePage() {
  const [sections, setSections] = useState<SectionType[]>(['Intro', 'Verse', 'Pre-Chorus', 'Chorus', 'Verse', 'Chorus', 'Bridge', 'Chorus', 'Outro'])
  const [adding, setAdding] = useState<SectionType>('Verse')
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null)

  const removeSection = (i: number) => {
    setSections((prev) => prev.filter((_, idx) => idx !== i))
    setSelectedIdx(null)
  }

  return (
    <div className="page-card stack">
      <h2 className="page-title">Song Builder</h2>
      <p className="page-subtitle">Arrange sections visually and get guidance on how and why to use each one.</p>

      {/* Add controls */}
      <div className="row">
        <select value={adding} onChange={(e) => setAdding(e.target.value as SectionType)} style={{ width: 'auto' }}>
          {Object.keys(SECTION_META).map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <button className="btn-primary btn-icon" onClick={() => setSections((prev) => [...prev, adding])}>
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
          Add Section
        </button>
        <button className="btn-ghost" onClick={() => setSections([])}>Clear All</button>
      </div>

      {/* Timeline */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        {sections.map((section, i) => {
          const meta = SECTION_META[section]
          const isSelected = selectedIdx === i
          return (
            <div
              key={`${section}-${i}`}
              className="section-pill"
              onClick={() => setSelectedIdx(isSelected ? null : i)}
              style={{
                background: isSelected ? meta.color : `${meta.color}20`,
                borderColor: meta.color,
                color: isSelected ? '#fff' : meta.color,
                cursor: 'pointer',
                boxShadow: isSelected ? `0 0 16px ${meta.color}40` : 'none',
              }}
            >
              <span className="idx">{i + 1}</span>
              {section}
              <button className="remove" onClick={(e) => { e.stopPropagation(); removeSection(i) }} title="Remove">
                &times;
              </button>
            </div>
          )
        })}
        {sections.length === 0 && <p style={{ color: 'var(--text-muted)' }}>Add sections above to start building your song.</p>}
      </div>

      {/* Advice panel */}
      {selectedIdx !== null && sections[selectedIdx] && (
        <div style={{
          background: 'var(--bg-elevated)',
          border: `1px solid ${SECTION_META[sections[selectedIdx]].color}50`,
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem',
        }}>
          <p style={{ fontWeight: 700, color: SECTION_META[sections[selectedIdx]].color, marginBottom: '0.4rem' }}>
            Section {selectedIdx + 1}: {sections[selectedIdx]}
          </p>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            {SECTION_META[sections[selectedIdx]].advice}
          </p>
        </div>
      )}

      {/* Quick reference */}
      <details style={{ marginTop: '0.5rem' }}>
        <summary style={{ cursor: 'pointer', color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>
          Section guide — when and why to use each part
        </summary>
        <div style={{ display: 'grid', gap: '0.5rem', marginTop: '0.75rem' }}>
          {Object.entries(SECTION_META).map(([name, meta]) => (
            <div key={name} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start', fontSize: '0.85rem' }}>
              <span style={{ display: 'inline-block', width: 10, height: 10, borderRadius: 3, background: meta.color, marginTop: 6, flexShrink: 0 }} />
              <div>
                <strong style={{ color: meta.color }}>{name}</strong>
                <p style={{ color: 'var(--text-secondary)', margin: 0 }}>{meta.advice}</p>
              </div>
            </div>
          ))}
        </div>
      </details>
    </div>
  )
}
