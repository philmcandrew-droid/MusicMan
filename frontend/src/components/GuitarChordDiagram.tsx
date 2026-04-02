type Props = {
  frets: number[]
  name: string
}

const STRINGS = 6
const FRETS = 5
const STR_SPACING = 22
const FRET_SPACING = 28
const PAD_TOP = 28
const PAD_LEFT = 20

export function GuitarChordDiagram({ frets }: Props) {
  const w = PAD_LEFT + (STRINGS - 1) * STR_SPACING + 20
  const h = PAD_TOP + FRETS * FRET_SPACING + 16

  const minFret = Math.min(...frets.filter((f) => f > 0))
  const maxFret = Math.max(...frets.filter((f) => f > 0))
  const startFret = maxFret <= FRETS ? 1 : minFret

  return (
    <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', maxWidth: w, height: 'auto' }}>
      {/* nut */}
      {startFret === 1 && (
        <rect x={PAD_LEFT - 2} y={PAD_TOP - 3} width={(STRINGS - 1) * STR_SPACING + 4} height={5} rx={1} fill="#ccc" />
      )}
      {startFret > 1 && (
        <text x={PAD_LEFT - 14} y={PAD_TOP + FRET_SPACING / 2 + 4} fontSize={10} fill="#94a3b8" textAnchor="middle">
          {startFret}
        </text>
      )}

      {/* fret lines */}
      {Array.from({ length: FRETS + 1 }).map((_, i) => (
        <line
          key={`f${i}`}
          x1={PAD_LEFT}
          y1={PAD_TOP + i * FRET_SPACING}
          x2={PAD_LEFT + (STRINGS - 1) * STR_SPACING}
          y2={PAD_TOP + i * FRET_SPACING}
          stroke="#3a4c8e"
          strokeWidth={1}
        />
      ))}

      {/* strings */}
      {Array.from({ length: STRINGS }).map((_, i) => (
        <line
          key={`s${i}`}
          x1={PAD_LEFT + i * STR_SPACING}
          y1={PAD_TOP}
          x2={PAD_LEFT + i * STR_SPACING}
          y2={PAD_TOP + FRETS * FRET_SPACING}
          stroke="#64748b"
          strokeWidth={1 + (STRINGS - 1 - i) * 0.25}
        />
      ))}

      {/* finger dots / markers */}
      {frets.map((fret, i) => {
        const x = PAD_LEFT + i * STR_SPACING
        if (fret === -1) {
          return (
            <text key={`m${i}`} x={x} y={PAD_TOP - 10} textAnchor="middle" fontSize={12} fontWeight={700} fill="#ef4444">
              x
            </text>
          )
        }
        if (fret === 0) {
          return (
            <circle key={`m${i}`} cx={x} cy={PAD_TOP - 10} r={5} fill="none" stroke="#10b981" strokeWidth={1.5} />
          )
        }
        const adjustedFret = fret - startFret + 1
        const y = PAD_TOP + (adjustedFret - 0.5) * FRET_SPACING
        return <circle key={`m${i}`} cx={x} cy={y} r={7} fill="#8b5cf6" />
      })}
    </svg>
  )
}
