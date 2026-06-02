import type { CSSProperties, ReactNode } from 'react'

export type HeroVariant =
  | 'guitar-chords'
  | 'open-tunings'
  | 'piano-chords'
  | 'chord-builder'
  | 'song-structure'
  | 'circle-of-fifths'
  | 'ideas'
  | 'ai-coach'
  | 'settings'
  | 'about'

type Props = {
  variant: HeroVariant
  title: string
  subtitle: string
  color: string
}

/**
 * A captivating section header: title + subtitle paired with a large
 * illustration that literally depicts what the section does.
 */
export function PageHero({ variant, title, subtitle, color }: Props) {
  return (
    <div className="page-hero" style={{ '--hero-color': color } as CSSProperties}>
      <div className="page-hero-copy">
        <h2 className="page-hero-title">{title}</h2>
        <p className="page-hero-sub">{subtitle}</p>
      </div>
      <div className="page-hero-art" aria-hidden="true">
        {ART[variant]}
      </div>
    </div>
  )
}

const ART: Record<HeroVariant, ReactNode> = {
  // Fretboard with a chord shape pressed
  'guitar-chords': (
    <svg viewBox="0 0 120 96" fill="none">
      <rect x="30" y="6" width="60" height="84" rx="5" fill="rgba(255,255,255,0.04)" stroke="var(--hero-color)" strokeOpacity="0.45" strokeWidth="2" />
      <rect x="30" y="6" width="60" height="7" rx="3" fill="var(--hero-color)" fillOpacity="0.55" />
      {[26, 46, 66].map((y) => (
        <line key={y} x1="30" y1={y} x2="90" y2={y} stroke="var(--hero-color)" strokeOpacity="0.25" strokeWidth="1.5" />
      ))}
      {[42, 54, 66, 78].map((x) => (
        <line key={x} x1={x} y1="6" x2={x} y2="90" stroke="currentColor" strokeOpacity="0.35" strokeWidth="1.3" />
      ))}
      {[
        [42, 36], [54, 56], [66, 36], [78, 56],
      ].map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="5.5" fill="var(--hero-color)" />
      ))}
      <circle cx="30" cy="36" r="3" stroke="var(--hero-color)" strokeWidth="1.5" />
    </svg>
  ),

  // Headstock with pegs being turned to alternate notes
  'open-tunings': (
    <svg viewBox="0 0 120 96" fill="none">
      <path d="M52 14 Q60 6 68 14 L66 82 Q60 90 54 82 Z" fill="rgba(255,255,255,0.04)" stroke="var(--hero-color)" strokeOpacity="0.5" strokeWidth="2" />
      {[24, 44, 64].map((y, i) => (
        <g key={y}>
          <circle cx="34" cy={y} r="7" fill="var(--hero-color)" fillOpacity={0.25 + i * 0.12} stroke="var(--hero-color)" strokeWidth="1.5" />
          <rect x="40" y={y - 1.5} width="14" height="3" rx="1.5" fill="var(--hero-color)" fillOpacity="0.6" />
          <circle cx="86" cy={y + 8} r="7" fill="var(--hero-color)" fillOpacity={0.18 + i * 0.12} stroke="var(--hero-color)" strokeWidth="1.5" />
          <rect x="66" y={y + 6.5} width="14" height="3" rx="1.5" fill="var(--hero-color)" fillOpacity="0.6" />
        </g>
      ))}
      <text x="34" y={92} textAnchor="middle" fontSize="9" fontWeight="700" fill="currentColor" fillOpacity="0.6">D A D</text>
    </svg>
  ),

  // Piano keys with a chord highlighted and sound radiating
  'piano-chords': (
    <svg viewBox="0 0 120 96" fill="none">
      {[18, 32, 46, 60, 74, 88, 102].map((x, i) => (
        <rect key={x} x={x} y="20" width="13" height="56" rx="2" fill={[0, 2, 4].includes(i) ? 'var(--hero-color)' : 'rgba(255,255,255,0.9)'} stroke="rgba(0,0,0,0.25)" strokeWidth="0.8" />
      ))}
      {[27, 41, 69, 83].map((x) => (
        <rect key={x} x={x} y="20" width="9" height="34" rx="1.5" fill="#1a1a1a" />
      ))}
      <path d="M104 14 q8 -4 8 -10" stroke="var(--hero-color)" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
      <path d="M100 12 q12 -5 12 -14" stroke="var(--hero-color)" strokeWidth="2" strokeLinecap="round" opacity="0.3" />
    </svg>
  ),

  // Interval blocks stacking up to build a chord
  'chord-builder': (
    <svg viewBox="0 0 120 96" fill="none">
      {[
        { y: 64, w: 70, label: 'R' },
        { y: 44, w: 56, label: '3' },
        { y: 24, w: 42, label: '5' },
      ].map((b, i) => (
        <g key={i}>
          <rect x={25} y={b.y} width={b.w} height="16" rx="4" fill="var(--hero-color)" fillOpacity={0.85 - i * 0.22} />
          <text x={25 + b.w / 2} y={b.y + 12} textAnchor="middle" fontSize="10" fontWeight="800" fill="#fff">{b.label}</text>
        </g>
      ))}
      <path d="M95 30 v40" stroke="var(--hero-color)" strokeWidth="2" strokeDasharray="3 3" opacity="0.5" />
      <path d="M90 36 l5 -8 5 8" fill="var(--hero-color)" opacity="0.6" />
    </svg>
  ),

  // Song arrangement timeline: intro / verse / chorus blocks + waveform
  'song-structure': (
    <svg viewBox="0 0 120 96" fill="none">
      {[
        { x: 12, w: 18, c: 0.4 },
        { x: 33, w: 26, c: 0.6 },
        { x: 62, w: 22, c: 1 },
        { x: 87, w: 22, c: 0.6 },
      ].map((b, i) => (
        <rect key={i} x={b.x} y="22" width={b.w} height="20" rx="4" fill="var(--hero-color)" fillOpacity={b.c} />
      ))}
      <line x1="12" y1="58" x2="109" y2="58" stroke="currentColor" strokeOpacity="0.2" strokeWidth="1.5" />
      {Array.from({ length: 22 }).map((_, i) => {
        const h = 6 + Math.abs(Math.sin(i * 0.9)) * 22
        return <rect key={i} x={12 + i * 4.5} y={58 - h / 2} width="2.4" height={h} rx="1.2" fill="var(--hero-color)" fillOpacity="0.55" />
      })}
    </svg>
  ),

  // Circle of fifths wheel
  'circle-of-fifths': (
    <svg viewBox="0 0 120 96" fill="none">
      <g transform="translate(60 48)">
        {Array.from({ length: 12 }).map((_, i) => {
          const a0 = (i * 30 - 90 - 15) * (Math.PI / 180)
          const a1 = (i * 30 - 90 + 15) * (Math.PI / 180)
          const r1 = 22
          const r2 = 40
          const x1 = Math.cos(a0) * r1, y1 = Math.sin(a0) * r1
          const x2 = Math.cos(a0) * r2, y2 = Math.sin(a0) * r2
          const x3 = Math.cos(a1) * r2, y3 = Math.sin(a1) * r2
          const x4 = Math.cos(a1) * r1, y4 = Math.sin(a1) * r1
          return (
            <path
              key={i}
              d={`M${x1} ${y1} L${x2} ${y2} A40 40 0 0 1 ${x3} ${y3} L${x4} ${y4} A22 22 0 0 0 ${x1} ${y1} Z`}
              fill="var(--hero-color)"
              fillOpacity={i === 0 ? 0.9 : 0.12 + (i % 3) * 0.08}
              stroke="var(--hero-color)"
              strokeOpacity="0.4"
              strokeWidth="0.6"
            />
          )
        })}
        <circle r="18" fill="rgba(0,0,0,0.25)" stroke="var(--hero-color)" strokeWidth="1.5" />
        <text textAnchor="middle" dy="5" fontSize="14" fontWeight="800" fill="var(--hero-color)">C</text>
      </g>
    </svg>
  ),

  // Microphone with sound waves + recorded waveform
  'ideas': (
    <svg viewBox="0 0 120 96" fill="none">
      <rect x="46" y="14" width="20" height="40" rx="10" fill="var(--hero-color)" fillOpacity="0.85" />
      <path d="M40 44 a16 16 0 0 0 32 0" stroke="var(--hero-color)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <line x1="56" y1="60" x2="56" y2="70" stroke="var(--hero-color)" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="46" y1="70" x2="66" y2="70" stroke="var(--hero-color)" strokeWidth="2.5" strokeLinecap="round" />
      {Array.from({ length: 7 }).map((_, i) => {
        const h = 8 + Math.abs(Math.sin(i * 1.3)) * 26
        return <rect key={i} x={80 + i * 5} y={48 - h / 2} width="2.6" height={h} rx="1.3" fill="var(--hero-color)" fillOpacity="0.5" />
      })}
    </svg>
  ),

  // Chat bubble with a music note and AI sparkles
  'ai-coach': (
    <svg viewBox="0 0 120 96" fill="none">
      <path d="M28 22 h64 a8 8 0 0 1 8 8 v28 a8 8 0 0 1 -8 8 h-40 l-14 12 v-12 h-2 a8 8 0 0 1 -8 -8 v-28 a8 8 0 0 1 8 -8 z" fill="rgba(255,255,255,0.04)" stroke="var(--hero-color)" strokeOpacity="0.55" strokeWidth="2" />
      <path d="M52 36 v18" stroke="var(--hero-color)" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M52 36 l16 -4 v18" stroke="var(--hero-color)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <circle cx="48" cy="54" r="5" fill="var(--hero-color)" />
      <circle cx="64" cy="50" r="5" fill="var(--hero-color)" />
      <path d="M86 14 l2.5 5.5 5.5 2.5 -5.5 2.5 -2.5 5.5 -2.5 -5.5 -5.5 -2.5 5.5 -2.5 z" fill="var(--hero-color)" opacity="0.8" />
    </svg>
  ),

  // Sliders / equaliser controls for settings
  settings: (
    <svg viewBox="0 0 120 96" fill="none">
      {[
        { x: 36, t: 0.3 },
        { x: 60, t: 0.6 },
        { x: 84, t: 0.45 },
      ].map((s, i) => (
        <g key={i}>
          <line x1={s.x} y1="18" x2={s.x} y2="78" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" strokeLinecap="round" />
          <circle cx={s.x} cy={18 + s.t * 60} r="8" fill="var(--hero-color)" stroke="rgba(0,0,0,0.2)" strokeWidth="1" />
        </g>
      ))}
    </svg>
  ),

  // Help: lifebuoy / question with a book
  about: (
    <svg viewBox="0 0 120 96" fill="none">
      <circle cx="60" cy="48" r="30" fill="rgba(255,255,255,0.04)" stroke="var(--hero-color)" strokeOpacity="0.5" strokeWidth="2" />
      <circle cx="60" cy="48" r="13" fill="none" stroke="var(--hero-color)" strokeOpacity="0.5" strokeWidth="2" />
      {[45, 135, 225, 315].map((deg) => {
        const a = deg * (Math.PI / 180)
        return (
          <line
            key={deg}
            x1={60 + Math.cos(a) * 13}
            y1={48 + Math.sin(a) * 13}
            x2={60 + Math.cos(a) * 30}
            y2={48 + Math.sin(a) * 30}
            stroke="var(--hero-color)"
            strokeOpacity="0.5"
            strokeWidth="2"
          />
        )
      })}
      <path d="M55 44 a5 5 0 0 1 9 2.5 c0 3.2 -4.5 3.2 -4.5 6.5" stroke="var(--hero-color)" strokeWidth="2.4" fill="none" strokeLinecap="round" />
      <circle cx="59.5" cy="58" r="1.7" fill="var(--hero-color)" />
    </svg>
  ),
}
