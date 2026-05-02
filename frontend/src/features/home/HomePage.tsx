import { useNavigate } from 'react-router-dom'

const features = [
  {
    path: '/tuner',
    title: 'Guitar Tuner',
    desc: 'Tune your guitar with real-time pitch detection. Supports standard tuning with visual cents meter.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2v20M2 12a10 10 0 0 1 10-10M22 12a10 10 0 0 0-10-10" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    ),
    color: '#10b981',
  },
  {
    path: '/guitar-chords',
    title: 'Guitar Chord Library',
    desc: '430+ chords across all 12 keys with full CAGED positions, inversions, jazz voicings, and power chords.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 3l5 5-2.5 2.5L16 8M2 22l4.5-4.5M8.5 13.5l2-2" />
        <path d="M9.5 9a5 5 0 0 0-1 7.5 5 5 0 0 0 7.5-1l2-2a5 5 0 0 0 0-7 5 5 0 0 0-7 0l-1.5 2.5z" />
      </svg>
    ),
    color: '#8b5cf6',
  },
  {
    path: '/open-tunings',
    title: 'Open Tuning Chords',
    desc: 'Chord shapes for Open D, G, E, A, C, DADGAD, and Drop D tunings with barre and voicing diagrams.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 6h4M6 2v8M10 4h4M14 1v6M18 5h4M22 2v6" />
        <rect x="2" y="12" width="20" height="10" rx="2" />
        <path d="M6 12v10M10 12v10M14 12v10M18 12v10" />
      </svg>
    ),
    color: '#e879f9',
  },
  {
    path: '/piano-chords',
    title: 'Piano Chord Library',
    desc: 'Visual piano keyboard showing major, minor, 7th, sus, augmented, and diminished chords.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="M6 4v10M10 4v10M14 4v10M18 4v10" />
        <path d="M2 14h20" />
      </svg>
    ),
    color: '#6366f1',
  },
  {
    path: '/piano-builder',
    title: 'Chord Builder',
    desc: 'Build any chord from scratch. Pick a root note and interval formula to hear and see the result.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
    color: '#f59e0b',
  },
  {
    path: '/song-structure',
    title: 'Song Structure',
    desc: 'Plan your arrangements with drag-and-drop sections \u2014 verse, chorus, bridge, and more.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 18V5l12-2v13" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="18" cy="16" r="3" />
      </svg>
    ),
    color: '#ec4899',
  },
  {
    path: '/ideas',
    title: 'Idea Capture',
    desc: 'Jot down lyrics, riff ideas, or record voice memos on the fly with full playback and seeking.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 18h6M10 22h4" />
        <path d="M12 2a7 7 0 0 0-4 12.7V17h8v-2.3A7 7 0 0 0 12 2z" />
      </svg>
    ),
    color: '#f97316',
  },
  {
    path: '/circle-of-fifths',
    title: 'Circle of Fifths',
    desc: 'Interactive music theory reference. Explore key signatures, relative minors, and chord relationships.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
    ),
    color: '#14b8a6',
  },
  {
    path: '/ai-coach',
    title: 'AI Coach',
    desc: 'Get personalised tips on technique, theory, practice routines, and songwriting from an AI assistant.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l3 7h7l-5.5 4 2 7L12 16l-6.5 4 2-7L2 9h7z" />
      </svg>
    ),
    color: '#a78bfa',
  },
]

export function HomePage() {
  const navigate = useNavigate()

  return (
    <div className="home-page">
      <div className="home-hero">
        <h1 className="home-title">MusicMan</h1>
        <p className="home-tagline">Your all-in-one musician assistant</p>
        <p className="home-subtitle">
          Tune, learn chords, build songs, capture ideas, and sharpen your theory &mdash; all in one place.
        </p>
      </div>

      <div className="home-grid">
        {features.map((f) => (
          <button
            key={f.path}
            className="home-feature-card"
            onClick={() => navigate(f.path)}
            style={{ '--feature-color': f.color } as React.CSSProperties}
          >
            <div className="home-feature-icon">{f.icon}</div>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </button>
        ))}
      </div>

      <p className="home-footer">Built by Phil McAndrew</p>
    </div>
  )
}
