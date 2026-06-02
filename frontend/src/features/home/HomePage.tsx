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
  {
    path: '/settings',
    title: 'Settings',
    desc: 'Customise your experience.',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="24" cy="24" r="8" />
        <path d="M24 4v6M24 38v6M4 24h6M38 24h6M9.86 9.86l4.24 4.24M33.9 33.9l4.24 4.24M9.86 38.14l4.24-4.24M33.9 14.1l4.24-4.24" />
      </svg>
    ),
    color: '#64748b',
  },
  {
    path: '/about',
    title: 'Help & About',
    desc: 'FAQs, tips, and app info.',
    icon: (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="24" cy="24" r="18" />
        <path d="M18 18a6 6 0 0 1 11.2 3c0 4-6 4-6 8" />
        <circle cx="24" cy="36" r="1.5" fill="currentColor" />
      </svg>
    ),
    color: '#38bdf8',
  },
]

function SongsterHarp() {
  return (
    <div className="home-logo-mark" aria-hidden="true">
      <svg viewBox="0 0 120 120" fill="none">
        <defs>
          <linearGradient id="songster-gold" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#fbe79a" />
            <stop offset="45%" stopColor="#e8b94a" />
            <stop offset="100%" stopColor="#b9831b" />
          </linearGradient>
          <linearGradient id="songster-green" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1f7a4d" />
            <stop offset="100%" stopColor="#0c3d27" />
          </linearGradient>
          <radialGradient id="songster-sheen" cx="0.35" cy="0.3" r="0.8">
            <stop offset="0%" stopColor="#2fae74" />
            <stop offset="100%" stopColor="#0a3221" />
          </radialGradient>
        </defs>

        {/* Crest ring */}
        <circle cx="60" cy="60" r="55" fill="url(#songster-sheen)" stroke="url(#songster-gold)" strokeWidth="3.5" />
        <circle cx="60" cy="60" r="49" fill="none" stroke="#f7d774" strokeWidth="1" strokeOpacity="0.35" />

        {/* Celtic harp */}
        <g stroke="url(#songster-gold)" strokeLinecap="round">
          {/* Forepillar */}
          <path d="M40 99 C33 73 34 45 47 22" strokeWidth="5" fill="none" />
          {/* Harmonic curve / neck */}
          <path d="M47 22 C60 25 74 31 83 43" strokeWidth="5" fill="none" />
          {/* Soundbox */}
          <path d="M83 43 C89 64 84 88 71 99" strokeWidth="5.5" fill="none" />
          {/* Base */}
          <path d="M40 99 L71 99" strokeWidth="5.5" fill="none" />
        </g>

        {/* Decorative volute at the top of the pillar */}
        <circle cx="47" cy="22" r="4.5" fill="none" stroke="url(#songster-gold)" strokeWidth="2.5" />

        {/* Strings */}
        <g stroke="#f6ead0" strokeWidth="1.1" strokeOpacity="0.85">
          <line x1="50" y1="26" x2="46" y2="96" />
          <line x1="56" y1="28" x2="51" y2="96" />
          <line x1="62" y1="31" x2="56" y2="96" />
          <line x1="68" y1="35" x2="60" y2="96" />
          <line x1="73" y1="39" x2="64" y2="96" />
          <line x1="78" y1="44" x2="68" y2="96" />
        </g>

        {/* Tuning pins along the neck */}
        <g fill="url(#songster-gold)">
          {[
            [50, 26], [56, 28], [62, 31], [68, 35], [73, 39], [78, 44],
          ].map(([cx, cy], i) => (
            <circle key={i} cx={cx} cy={cy} r="1.9" />
          ))}
        </g>

        {/* Shamrock accent */}
        <g transform="translate(60 109)" fill="#3fb87f">
          <circle cx="-4" cy="-1" r="3" />
          <circle cx="4" cy="-1" r="3" />
          <circle cx="0" cy="-5" r="3" />
          <path d="M0 -1 L0 5" stroke="#3fb87f" strokeWidth="1.4" strokeLinecap="round" />
        </g>
      </svg>
    </div>
  )
}

export function HomePage() {
  const navigate = useNavigate()

  return (
    <div className="home-page">
      <div className="home-hero">
        <div className="home-brand">
          <SongsterHarp />
          <div className="home-brand-text">
            <h1 className="home-title">Songster</h1>
            <span className="home-knot" aria-hidden="true">
              <svg viewBox="0 0 120 12" fill="none" preserveAspectRatio="none">
                <path d="M2 6 H40" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M118 6 H80" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M52 6 q4 -5 8 0 q4 5 8 0 q-4 -5 -8 0 q-4 5 -8 0z" stroke="currentColor" strokeWidth="1.5" fill="none" />
                <circle cx="44" cy="6" r="1.6" fill="currentColor" />
                <circle cx="76" cy="6" r="1.6" fill="currentColor" />
              </svg>
            </span>
          </div>
        </div>
        <p className="home-tagline">Your all-in-one music companion</p>
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

      <p className="home-footer">Built by Phil McAndrew &middot; v1.7</p>
    </div>
  )
}
