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

const SECTION_ICONS: Record<SectionType, string> = {
  Intro: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3',
  Verse: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 002-2V7',
  'Pre-Chorus': 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
  Chorus: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6',
  Bridge: 'M13 10V3L4 14h7v7l9-11h-7z',
  'Middle 8': 'M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z',
  Solo: 'M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z',
  Outro: 'M21 12a9 9 0 11-18 0 9 9 0 0118 0z M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z',
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
              <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.7, flexShrink: 0 }}><path d={SECTION_ICONS[section]} /></svg>
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

      {/* Color legend */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', padding: '0.75rem', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)' }}>
        {Object.entries(SECTION_META).map(([name, meta]) => (
          <span key={name} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.72rem', fontWeight: 600, color: meta.color, padding: '0.2rem 0.55rem', borderRadius: 'var(--radius-full)', background: `${meta.color}15`, border: `1px solid ${meta.color}30` }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: meta.color }} />
            {name}
          </span>
        ))}
      </div>
    </div>
  )
}
