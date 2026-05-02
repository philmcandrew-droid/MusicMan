import { useNavigate } from 'react-router-dom'

const features = [
  {
    path: '/tuner',
    title: 'Guitar Tuner',
    desc: 'Tune your guitar with precision.',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M24 4v8M24 36v8M4 24h8M36 24h8" />
        <circle cx="24" cy="24" r="8" />
        <circle cx="24" cy="24" r="16" strokeDasharray="4 4" opacity="0.4" />
      </svg>
    ),
    color: '#10b981',
  },
  {
    path: '/guitar-chords',
    title: 'Guitar Chords',
    desc: 'Browse chords and voicings.',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="10" y="8" width="28" height="32" rx="2" stroke="currentColor" />
        <line x1="10" y1="16" x2="38" y2="16" stroke="currentColor" />
        <line x1="10" y1="24" x2="38" y2="24" stroke="currentColor" />
        <line x1="10" y1="32" x2="38" y2="32" stroke="currentColor" />
        <line x1="18" y1="8" x2="18" y2="40" stroke="currentColor" />
        <line x1="24" y1="8" x2="24" y2="40" stroke="currentColor" />
        <line x1="30" y1="8" x2="30" y2="40" stroke="currentColor" />
        <circle cx="21" cy="20" r="2.5" fill="currentColor" />
        <circle cx="27" cy="28" r="2.5" fill="currentColor" />
        <circle cx="15" cy="28" r="2.5" fill="currentColor" />
      </svg>
    ),
    color: '#8b5cf6',
  },
  {
    path: '/open-tunings',
    title: 'Open Tunings',
    desc: 'Explore open tunings and alternatives.',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M8 12h6M14 8v8M20 10h6M26 6v8M34 11h6M40 7v8" />
        <rect x="6" y="24" width="36" height="18" rx="3" />
        <path d="M14 24v18M22 24v18M30 24v18M38 24v18" />
      </svg>
    ),
    color: '#e879f9',
  },
  {
    path: '/piano-chords',
    title: 'Piano Chords',
    desc: 'Find piano chords and voicings.',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="4" y="8" width="40" height="32" rx="3" stroke="currentColor" />
        <line x1="12" y1="8" x2="12" y2="28" stroke="currentColor" />
        <line x1="20" y1="8" x2="20" y2="28" stroke="currentColor" />
        <line x1="28" y1="8" x2="28" y2="28" stroke="currentColor" />
        <line x1="36" y1="8" x2="36" y2="28" stroke="currentColor" />
        <line x1="4" y1="28" x2="44" y2="28" stroke="currentColor" />
      </svg>
    ),
    color: '#6366f1',
  },
  {
    path: '/piano-builder',
    title: 'Chord Builder',
    desc: 'Build custom chords easily.',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="6" y="6" width="14" height="14" rx="2" />
        <rect x="28" y="6" width="14" height="14" rx="2" />
        <rect x="6" y="28" width="14" height="14" rx="2" />
        <rect x="28" y="28" width="14" height="14" rx="2" />
        <path d="M13 10v6M10 13h6" opacity="0.6" />
      </svg>
    ),
    color: '#f59e0b',
  },
  {
    path: '/song-structure',
    title: 'Song Structure',
    desc: 'Plan and visualise your songs.',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="6" y="10" width="18" height="6" rx="2" />
        <rect x="6" y="21" width="28" height="6" rx="2" />
        <rect x="6" y="32" width="22" height="6" rx="2" />
        <rect x="30" y="32" width="12" height="6" rx="2" />
      </svg>
    ),
    color: '#ec4899',
  },
  {
    path: '/ideas',
    title: 'Idea Capture',
    desc: 'Capture musical ideas on the go.',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 36h12M20 42h8" />
        <path d="M24 6a12 12 0 0 0-7 21.7V32h14v-4.3A12 12 0 0 0 24 6z" />
      </svg>
    ),
    color: '#f97316',
  },
  {
    path: '/circle-of-fifths',
    title: 'Circle of Fifths',
    desc: 'Understand key relationships.',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="24" cy="24" r="18" />
        <circle cx="24" cy="24" r="12" opacity="0.4" />
        <text x="24" y="10" textAnchor="middle" fontSize="7" fill="currentColor" stroke="none" fontWeight="700">C</text>
        <text x="36" y="16" textAnchor="middle" fontSize="6" fill="currentColor" stroke="none" fontWeight="600">G</text>
        <text x="38" y="27" textAnchor="middle" fontSize="6" fill="currentColor" stroke="none" fontWeight="600">D</text>
        <text x="24" y="40" textAnchor="middle" fontSize="6" fill="currentColor" stroke="none" fontWeight="600">F#</text>
        <text x="10" y="27" textAnchor="middle" fontSize="6" fill="currentColor" stroke="none" fontWeight="600">Bb</text>
        <text x="12" y="16" textAnchor="middle" fontSize="6" fill="currentColor" stroke="none" fontWeight="600">F</text>
      </svg>
    ),
    color: '#14b8a6',
  },
  {
    path: '/ai-coach',
    title: 'AI Coach',
    desc: 'AI-powered feedback and guidance.',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="10" y="8" width="28" height="24" rx="6" />
        <circle cx="18" cy="20" r="2.5" fill="currentColor" />
        <circle cx="30" cy="20" r="2.5" fill="currentColor" />
        <path d="M20 26c1.5 1.5 6.5 1.5 8 0" />
        <path d="M16 36v-4M32 36v-4" />
        <path d="M10 40h28" />
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
