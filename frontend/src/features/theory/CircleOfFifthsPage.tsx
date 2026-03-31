import { useState } from 'react'

const MAJOR_KEYS = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'Db', 'Ab', 'Eb', 'Bb', 'F']
const MINOR_KEYS = ['Am', 'Em', 'Bm', 'F#m', 'C#m', 'G#m', 'D#m', 'Bbm', 'Fm', 'Cm', 'Gm', 'Dm']

type KeyInfo = {
  key: string
  relativeMinor: string
  dominant: string
  subdominant: string
  sharps: number
  flats: number
  commonChords: string[]
}

function getKeyInfo(idx: number): KeyInfo {
  const key = MAJOR_KEYS[idx]
  const dominant = MAJOR_KEYS[(idx + 1) % 12]
  const subdominant = MAJOR_KEYS[(idx - 1 + 12) % 12]
  const relativeMinor = MINOR_KEYS[idx]
  const sharps = idx <= 6 ? idx : 0
  const flats = idx > 6 ? 12 - idx : 0

  const chords = [`${key}`, `${MINOR_KEYS[idx]}`, `${dominant}`, `${subdominant}`]

  return { key, relativeMinor, dominant, subdominant, sharps, flats, commonChords: chords }
}

function polarToXY(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

function wedgePath(cx: number, cy: number, r1: number, r2: number, startDeg: number, endDeg: number) {
  const s1 = polarToXY(cx, cy, r1, startDeg)
  const e1 = polarToXY(cx, cy, r1, endDeg)
  const s2 = polarToXY(cx, cy, r2, startDeg)
  const e2 = polarToXY(cx, cy, r2, endDeg)
  return `M ${s1.x} ${s1.y} A ${r1} ${r1} 0 0 1 ${e1.x} ${e1.y} L ${e2.x} ${e2.y} A ${r2} ${r2} 0 0 0 ${s2.x} ${s2.y} Z`
}

export function CircleOfFifthsPage() {
  const [selectedIdx, setSelectedIdx] = useState(0)
  const info = getKeyInfo(selectedIdx)

  const CX = 220
  const CY = 220
  const OUTER_R = 195
  const INNER_R = 135
  const MINOR_R = 95
  const CENTER_R = 55

  return (
    <div className="page-card stack">
      <h2 className="page-title">Circle of Fifths</h2>
      <p className="page-subtitle">Click any key to explore its harmonic relationships.</p>

      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        {/* SVG wheel */}
        <div style={{ flexShrink: 0 }}>
          <svg width={440} height={440} viewBox="0 0 440 440">
            <defs>
              <filter id="glow">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>

            {/* Outer ring: major keys */}
            {MAJOR_KEYS.map((key, i) => {
              const startAngle = i * 30 - 15
              const endAngle = startAngle + 30
              const isSelected = i === selectedIdx
              const isDominant = i === (selectedIdx + 1) % 12
              const isSubdominant = i === (selectedIdx - 1 + 12) % 12
              const textPos = polarToXY(CX, CY, (OUTER_R + INNER_R) / 2, i * 30)

              let fill = '#1a2332'
              if (isSelected) fill = '#7c3aed'
              else if (isDominant) fill = '#2563eb'
              else if (isSubdominant) fill = '#0891b2'

              return (
                <g key={key} onClick={() => setSelectedIdx(i)} style={{ cursor: 'pointer' }}>
                  <path
                    d={wedgePath(CX, CY, OUTER_R, INNER_R, startAngle, endAngle)}
                    fill={fill}
                    stroke="#0d1117"
                    strokeWidth={2}
                    filter={isSelected ? 'url(#glow)' : undefined}
                  />
                  <text
                    x={textPos.x}
                    y={textPos.y + 1}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={isSelected ? 16 : 14}
                    fontWeight={isSelected ? 700 : 600}
                    fill={isSelected || isDominant || isSubdominant ? '#fff' : '#cbd5e1'}
                  >
                    {key}
                  </text>
                </g>
              )
            })}

            {/* Inner ring: relative minor keys */}
            {MINOR_KEYS.map((key, i) => {
              const startAngle = i * 30 - 15
              const endAngle = startAngle + 30
              const isSelected = i === selectedIdx
              const textPos = polarToXY(CX, CY, (INNER_R + MINOR_R) / 2, i * 30)

              return (
                <g key={key} onClick={() => setSelectedIdx(i)} style={{ cursor: 'pointer' }}>
                  <path
                    d={wedgePath(CX, CY, INNER_R, MINOR_R, startAngle, endAngle)}
                    fill={isSelected ? '#5b21b6' : '#111827'}
                    stroke="#0d1117"
                    strokeWidth={2}
                  />
                  <text
                    x={textPos.x}
                    y={textPos.y + 1}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={11}
                    fontWeight={500}
                    fill={isSelected ? '#e9d5ff' : '#64748b'}
                  >
                    {key}
                  </text>
                </g>
              )
            })}

            {/* Center */}
            <circle cx={CX} cy={CY} r={CENTER_R} fill="#0d1117" stroke="#1e293b" strokeWidth={2} />
            <text x={CX} y={CY - 8} textAnchor="middle" fontSize={20} fontWeight={700} fill="#a78bfa">
              {info.key}
            </text>
            <text x={CX} y={CY + 14} textAnchor="middle" fontSize={10} fill="#64748b">
              {info.sharps > 0 ? `${info.sharps} sharp${info.sharps > 1 ? 's' : ''}` : info.flats > 0 ? `${info.flats} flat${info.flats > 1 ? 's' : ''}` : 'no sharps/flats'}
            </text>
          </svg>
        </div>

        {/* Info panel */}
        <div className="stack" style={{ flex: 1, minWidth: 200 }}>
          <div style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', border: '1px solid var(--border)' }}>
            <p className="section-label">Selected Key</p>
            <p style={{ fontSize: '1.8rem', fontWeight: 700 }}>{info.key} Major</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Relative minor: {info.relativeMinor}</p>
          </div>

          <div style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', border: '1px solid var(--border)' }}>
            <p className="section-label">Harmonic Movement</p>
            <div className="stack" style={{ gap: '0.5rem', marginTop: '0.5rem' }}>
              <div className="row">
                <span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: 3, background: '#0891b2' }} />
                <span style={{ fontSize: '0.85rem' }}><strong>{info.subdominant}</strong> — Subdominant (IV)</span>
              </div>
              <div className="row">
                <span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: 3, background: '#7c3aed' }} />
                <span style={{ fontSize: '0.85rem' }}><strong>{info.key}</strong> — Tonic (I)</span>
              </div>
              <div className="row">
                <span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: 3, background: '#2563eb' }} />
                <span style={{ fontSize: '0.85rem' }}><strong>{info.dominant}</strong> — Dominant (V)</span>
              </div>
            </div>
          </div>

          <div style={{ background: 'var(--bg-elevated)', borderRadius: 'var(--radius-lg)', padding: '1.25rem', border: '1px solid var(--border)' }}>
            <p className="section-label">How to use this</p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
              The <strong>dominant (V)</strong> chord creates tension that wants to resolve back to the tonic.
              The <strong>subdominant (IV)</strong> adds smooth contrast.
              Together, <strong>I — IV — V</strong> is the backbone of countless songs.
              Adjacent keys on the circle share 6 of 7 notes, making modulation between them sound natural.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
