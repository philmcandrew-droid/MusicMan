import React, { useCallback } from 'react'

type Props = {
  startOctave?: number
  octaves?: number
  highlightedNotes?: string[]
  onKeyClick?: (note: string) => void
  interactive?: boolean
}

const WHITE_NOTES = ['C', 'D', 'E', 'F', 'G', 'A', 'B']
const BLACK_NOTE_MAP: Record<string, string> = { C: 'C#', D: 'D#', F: 'F#', G: 'G#', A: 'A#' }
const BLACK_OFFSETS: Record<string, number> = { C: 0.62, D: 1.72, F: 3.62, G: 4.68, A: 5.74 }

const WHITE_W = 44
const WHITE_H = 140
const BLACK_W = 28
const BLACK_H = 88

function noteFreq(note: string, octave: number): number {
  const semitones: Record<string, number> = {
    C: -9, 'C#': -8, D: -7, 'D#': -6, E: -5, F: -4,
    'F#': -3, G: -2, 'G#': -1, A: 0, 'A#': 1, B: 2,
  }
  const s = semitones[note] ?? 0
  return 440 * Math.pow(2, s / 12 + (octave - 4))
}

function playTone(freq: number) {
  const ctx = new AudioContext()
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'triangle'
  osc.frequency.value = freq
  gain.gain.setValueAtTime(0.35, ctx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8)
  osc.connect(gain).connect(ctx.destination)
  osc.start()
  osc.stop(ctx.currentTime + 0.85)
}

export function PianoKeyboard({ startOctave = 4, octaves = 2, highlightedNotes = [], onKeyClick, interactive = true }: Props) {
  const totalWhite = octaves * 7
  const svgW = totalWhite * WHITE_W + 2
  const svgH = WHITE_H + 4

  const isHighlighted = useCallback(
    (note: string) => highlightedNotes.some((n) => n === note || n === note.replace('#', '#')),
    [highlightedNotes],
  )

  const handleClick = (noteName: string, oct: number) => {
    if (!interactive) return
    if (onKeyClick) onKeyClick(noteName)
    playTone(noteFreq(noteName, oct))
  }

  const whites: React.ReactElement[] = []
  const blacks: React.ReactElement[] = []

  for (let o = 0; o < octaves; o++) {
    const oct = startOctave + o
    WHITE_NOTES.forEach((note, i) => {
      const x = (o * 7 + i) * WHITE_W + 1
      const full = note
      const hl = isHighlighted(full)
      whites.push(
        <rect
          key={`w-${oct}-${note}`}
          x={x}
          y={1}
          width={WHITE_W - 1}
          height={WHITE_H}
          rx={0}
          ry={0}
          fill={hl ? '#7c3aed' : '#f1f0ec'}
          stroke="#333"
          strokeWidth={0.5}
          style={{ cursor: interactive ? 'pointer' : 'default', transition: 'fill 0.15s' }}
          onClick={() => handleClick(note, oct)}
        />,
      )
      whites.push(
        <text
          key={`wt-${oct}-${note}`}
          x={x + (WHITE_W - 1) / 2}
          y={WHITE_H - 8}
          textAnchor="middle"
          fontSize={10}
          fontWeight={600}
          fill={hl ? '#fff' : '#666'}
          pointerEvents="none"
        >
          {note}{oct}
        </text>,
      )
    })

    Object.entries(BLACK_OFFSETS).forEach(([base, offset]) => {
      const noteName = BLACK_NOTE_MAP[base]
      const x = (o * 7 + offset) * WHITE_W - BLACK_W / 2 + 1
      const hl = isHighlighted(noteName)
      blacks.push(
        <rect
          key={`b-${oct}-${noteName}`}
          x={x}
          y={1}
          width={BLACK_W}
          height={BLACK_H}
          rx={0}
          ry={0}
          fill={hl ? '#a78bfa' : '#1a1a2e'}
          stroke="#111"
          strokeWidth={0.5}
          style={{ cursor: interactive ? 'pointer' : 'default', transition: 'fill 0.15s' }}
          onClick={() => handleClick(noteName, oct)}
        />,
      )
      blacks.push(
        <text
          key={`bt-${oct}-${noteName}`}
          x={x + BLACK_W / 2}
          y={BLACK_H - 8}
          textAnchor="middle"
          fontSize={8}
          fontWeight={600}
          fill={hl ? '#fff' : '#888'}
          pointerEvents="none"
        >
          {noteName}
        </text>,
      )
    })
  }

  return (
    <div style={{ overflowX: 'auto', paddingBottom: 8, WebkitOverflowScrolling: 'touch' }}>
      <svg
        viewBox={`0 0 ${svgW} ${svgH}`}
        style={{ display: 'block', width: '100%', maxWidth: svgW, height: 'auto', minWidth: Math.min(svgW, 280) }}
        preserveAspectRatio="xMidYMid meet"
      >
        <rect width={svgW} height={svgH} rx={8} fill="#0e1430" />
        {whites}
        {blacks}
      </svg>
    </div>
  )
}
