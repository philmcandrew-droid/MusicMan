"use client"

import { cn } from "@/lib/utils"

interface ChordDiagramProps {
  name: string
  frets: (number | null)[] // 6 strings, null = muted, 0 = open, 1-5 = fret number
  fingers?: (number | null)[] // finger numbers 1-4
  barres?: { fret: number; fromString: number; toString: number }[]
  startFret?: number
  className?: string
}

export function ChordDiagram({
  name,
  frets,
  fingers = [],
  barres = [],
  startFret = 1,
  className,
}: ChordDiagramProps) {
  const stringCount = 6
  const fretCount = 5
  const stringSpacing = 20
  const fretSpacing = 24
  const leftPadding = 30
  const topPadding = 40
  const width = leftPadding + (stringCount - 1) * stringSpacing + 20
  const height = topPadding + fretCount * fretSpacing + 20

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className={cn("w-full h-auto", className)}
    >
      {/* Chord name */}
      <text
        x={width / 2}
        y={16}
        textAnchor="middle"
        className="fill-foreground font-bold text-[14px]"
      >
        {name}
      </text>

      {/* Starting fret indicator */}
      {startFret > 1 && (
        <text
          x={leftPadding - 18}
          y={topPadding + fretSpacing / 2 + 4}
          textAnchor="middle"
          className="fill-muted-foreground text-[10px]"
        >
          {startFret}fr
        </text>
      )}

      {/* Nut (thick line at top if starting at fret 1) */}
      {startFret === 1 && (
        <rect
          x={leftPadding - 2}
          y={topPadding - 4}
          width={(stringCount - 1) * stringSpacing + 4}
          height={4}
          rx={1}
          className="fill-foreground"
        />
      )}

      {/* Fret lines */}
      {Array.from({ length: fretCount + 1 }).map((_, i) => (
        <line
          key={`fret-${i}`}
          x1={leftPadding}
          y1={topPadding + i * fretSpacing}
          x2={leftPadding + (stringCount - 1) * stringSpacing}
          y2={topPadding + i * fretSpacing}
          className="stroke-border"
          strokeWidth={i === 0 && startFret === 1 ? 0 : 1}
        />
      ))}

      {/* String lines */}
      {Array.from({ length: stringCount }).map((_, i) => (
        <line
          key={`string-${i}`}
          x1={leftPadding + i * stringSpacing}
          y1={topPadding}
          x2={leftPadding + i * stringSpacing}
          y2={topPadding + fretCount * fretSpacing}
          className="stroke-muted-foreground"
          strokeWidth={1.5 - i * 0.15}
        />
      ))}

      {/* Barres */}
      {barres.map((barre, i) => {
        const fretY = topPadding + (barre.fret - startFret + 0.5) * fretSpacing
        const fromX = leftPadding + (stringCount - barre.fromString) * stringSpacing
        const toX = leftPadding + (stringCount - barre.toString) * stringSpacing
        return (
          <rect
            key={`barre-${i}`}
            x={Math.min(fromX, toX) - 6}
            y={fretY - 6}
            width={Math.abs(toX - fromX) + 12}
            height={12}
            rx={6}
            className="fill-foreground"
          />
        )
      })}

      {/* Open/Muted indicators and finger dots */}
      {frets.map((fret, stringIndex) => {
        const x = leftPadding + stringIndex * stringSpacing

        if (fret === null) {
          // Muted string (X)
          return (
            <text
              key={`indicator-${stringIndex}`}
              x={x}
              y={topPadding - 12}
              textAnchor="middle"
              className="fill-muted-foreground text-[12px] font-medium"
            >
              ×
            </text>
          )
        }

        if (fret === 0) {
          // Open string (O)
          return (
            <circle
              key={`indicator-${stringIndex}`}
              cx={x}
              cy={topPadding - 14}
              r={5}
              className="fill-none stroke-muted-foreground"
              strokeWidth={1.5}
            />
          )
        }

        // Finger position
        const y = topPadding + (fret - startFret + 0.5) * fretSpacing
        const finger = fingers[stringIndex]

        return (
          <g key={`finger-${stringIndex}`}>
            <circle
              cx={x}
              cy={y}
              r={7}
              className="fill-primary"
            />
            {finger && (
              <text
                x={x}
                y={y + 3.5}
                textAnchor="middle"
                className="fill-primary-foreground text-[9px] font-bold"
              >
                {finger}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}
