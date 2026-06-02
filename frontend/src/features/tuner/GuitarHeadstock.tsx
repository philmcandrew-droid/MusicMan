import type { GuitarString } from './tunerAudio'

/** Layout: left pegs E6/A5/D4 (bottom→top), right pegs G3/B2/E1 (bottom→top) — matches mockup. */
const STRING_LAYOUT: { idx: number; side: 'left' | 'right'; row: 0 | 1 | 2 }[] = [
  { idx: 2, side: 'left', row: 0 },
  { idx: 1, side: 'left', row: 1 },
  { idx: 0, side: 'left', row: 2 },
  { idx: 3, side: 'right', row: 0 },
  { idx: 4, side: 'right', row: 1 },
  { idx: 5, side: 'right', row: 2 },
]

type Props = {
  strings: GuitarString[]
  selectedIdx: number
  onSelect: (idx: number) => void
  onPlayRef: (idx: number) => void
  playingIdx: number | null
  activeStringIdx: number | null
  inTune: boolean
}

export function GuitarHeadstock({
  strings,
  selectedIdx,
  onSelect,
  onPlayRef,
  playingIdx,
  activeStringIdx,
  inTune,
}: Props) {
  const handleNoteClick = (idx: number) => {
    onSelect(idx)
    onPlayRef(idx)
  }

  return (
    <div className="gt-scene">
      {/* Note buttons flanking headstock */}
      {STRING_LAYOUT.map(({ idx, side, row }) => {
        const s = strings[idx]
        const isSelected = idx === selectedIdx
        const isActive = idx === activeStringIdx
        const isPlaying = idx === playingIdx
        let state = ''
        if (isPlaying) state = ' playing'
        else if (isActive && inTune) state = ' in-tune'
        else if (isActive) state = ' detecting'
        else if (isSelected) state = ' selected'

        return (
          <button
            key={s.num}
            type="button"
            className={`gt-note-btn gt-note-${side} gt-note-row-${row}${state}`}
            onClick={() => handleNoteClick(idx)}
            aria-label={`${s.label} string reference`}
          >
            {s.label}
          </button>
        )
      })}

      {/* Realistic headstock illustration */}
      <svg viewBox="0 0 320 420" className="gt-headstock-art" aria-hidden="true">
        <defs>
          <linearGradient id="gt-wood" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6b4423" />
            <stop offset="35%" stopColor="#8b5a2b" />
            <stop offset="70%" stopColor="#7a4f28" />
            <stop offset="100%" stopColor="#5c3a1e" />
          </linearGradient>
          <linearGradient id="gt-wood-grain" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.06)" />
            <stop offset="50%" stopColor="rgba(0,0,0,0.04)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.03)" />
          </linearGradient>
          <linearGradient id="gt-chrome" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#e8e8e8" />
            <stop offset="50%" stopColor="#b0b0b0" />
            <stop offset="100%" stopColor="#d8d8d8" />
          </linearGradient>
          <filter id="gt-shadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="4" stdDeviation="6" floodOpacity="0.45" />
          </filter>
        </defs>

        {/* Headstock body */}
        <path
          filter="url(#gt-shadow)"
          d="M95 395 L225 395 L248 55 Q160 8 72 55 Z"
          fill="url(#gt-wood)"
          stroke="#f5f0e6"
          strokeWidth="3"
        />
        <path
          d="M95 395 L225 395 L248 55 Q160 8 72 55 Z"
          fill="url(#gt-wood-grain)"
          stroke="none"
        />
        {/* Grain lines */}
        {[100, 130, 160, 190, 220, 250, 280, 310, 340].map((y) => (
          <line key={y} x1="88" y1={y} x2="232" y2={y + 8} stroke="rgba(0,0,0,0.08)" strokeWidth="1" />
        ))}

        {/* Truss rod cover */}
        <path d="M138 318 Q160 300 182 318 L178 342 Q160 352 142 342 Z" fill="#1a1a1a" stroke="#333" strokeWidth="1" />

        {/* Nut + fretboard */}
        <rect x="108" y="378" width="104" height="10" rx="1" fill="#f0ebe0" stroke="#ccc" strokeWidth="0.5" />
        <rect x="105" y="388" width="110" height="28" rx="2" fill="#3d2817" stroke="#2a1a0f" strokeWidth="1" />
        <line x1="105" y1="404" x2="215" y2="404" stroke="#c0c0c0" strokeWidth="2" />

        {/* Tuning pegs + strings — left: D(4), A(5), E(6) top→bottom; right: G,B,E */}
        {[
          { x: 58, y: 95, side: 'left' },
          { x: 58, y: 175, side: 'left' },
          { x: 58, y: 255, side: 'left' },
          { x: 262, y: 95, side: 'right' },
          { x: 262, y: 175, side: 'right' },
          { x: 262, y: 255, side: 'right' },
        ].map((peg, i) => {
          const nutX = 118 + (i % 3) * 8 + (peg.side === 'right' ? 40 : 0)
          return (
            <g key={i}>
              {/* String */}
              <path
                d={`M ${peg.x} ${peg.y} Q ${peg.side === 'left' ? 80 : 240} ${peg.y + 60} ${nutX} 383`}
                fill="none"
                stroke="#c8c8c8"
                strokeWidth="1.2"
              />
              {/* Peg post */}
              <rect
                x={peg.side === 'left' ? peg.x - 28 : peg.x + 4}
                y={peg.y - 4}
                width={24}
                height={8}
                rx={2}
                fill="url(#gt-chrome)"
                stroke="#888"
                strokeWidth="0.5"
                transform={`rotate(${peg.side === 'left' ? -12 : 12}, ${peg.x}, ${peg.y})`}
              />
              {/* Tuner knob */}
              <circle cx={peg.x} cy={peg.y} r={14} fill="url(#gt-chrome)" stroke="#999" strokeWidth="1" />
              <circle cx={peg.x} cy={peg.y} r={6} fill="#888" />
            </g>
          )
        })}
      </svg>
    </div>
  )
}
