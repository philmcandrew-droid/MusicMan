import { useCallback, useEffect, useRef, useState } from 'react'
import { PitchDetector } from 'pitchy'

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

const GUITAR_STRINGS = [
  { label: 'E2', note: 'E', octave: 2, freq: 82.41 },
  { label: 'A2', note: 'A', octave: 2, freq: 110.0 },
  { label: 'D3', note: 'D', octave: 3, freq: 146.83 },
  { label: 'G3', note: 'G', octave: 3, freq: 196.0 },
  { label: 'B3', note: 'B', octave: 3, freq: 246.94 },
  { label: 'E4', note: 'E', octave: 4, freq: 329.63 },
]

function midiFromHz(hz: number) {
  return 12 * Math.log2(hz / 440) + 69
}

function hzFromMidi(midi: number) {
  return 440 * Math.pow(2, (midi - 69) / 12)
}

function noteInfo(hz: number) {
  const midi = midiFromHz(hz)
  const rounded = Math.round(midi)
  const name = NOTE_NAMES[((rounded % 12) + 12) % 12]
  const octave = Math.floor(rounded / 12) - 1
  const cents = (midi - rounded) * 100
  const targetHz = hzFromMidi(rounded)
  return { name, octave, cents, targetHz, midi: rounded }
}

function tuneColor(cents: number): string {
  const a = Math.abs(cents)
  if (a < 5) return '#10b981'
  if (a < 15) return '#f59e0b'
  return '#ef4444'
}

function arcPath(cx: number, cy: number, r: number, startDeg: number, endDeg: number) {
  const s = (startDeg * Math.PI) / 180
  const e = (endDeg * Math.PI) / 180
  const x1 = cx + r * Math.cos(s)
  const y1 = cy - r * Math.sin(s)
  const x2 = cx + r * Math.cos(e)
  const y2 = cy - r * Math.sin(e)
  const large = Math.abs(endDeg - startDeg) > 180 ? 1 : 0
  return `M ${x1} ${y1} A ${r} ${r} 0 ${large} 0 ${x2} ${y2}`
}

export function TunerPage() {
  const [hz, setHz] = useState<number | null>(null)
  const [note, setNote] = useState<string>('—')
  const [, setOctave] = useState<number>(4)
  const [cents, setCents] = useState(0)
  const [running, setRunning] = useState(false)
  const [selectedString, setSelectedString] = useState(0)
  const animRef = useRef(0)
  const ctxRef = useRef<AudioContext | null>(null)

  const startTuner = useCallback(async () => {
    if (running) return
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const ctx = new AudioContext()
    ctxRef.current = ctx
    const source = ctx.createMediaStreamSource(stream)
    const analyser = ctx.createAnalyser()
    analyser.fftSize = 4096
    source.connect(analyser)
    const detector = PitchDetector.forFloat32Array(analyser.fftSize)
    const buf = new Float32Array(analyser.fftSize)
    setRunning(true)

    const loop = () => {
      analyser.getFloatTimeDomainData(buf)
      const [pitch, clarity] = detector.findPitch(buf, ctx.sampleRate)
      if (clarity > 0.85 && pitch > 50 && pitch < 1200) {
        const info = noteInfo(pitch)
        setHz(pitch)
        setNote(info.name)
        setOctave(info.octave)
        setCents(info.cents)
      }
      animRef.current = requestAnimationFrame(loop)
    }
    loop()
  }, [running])

  useEffect(() => {
    return () => {
      cancelAnimationFrame(animRef.current)
      ctxRef.current?.close()
    }
  }, [])

  const needleAngle = Math.max(-50, Math.min(50, cents)) * 1.7
  const color = tuneColor(cents)
  const inTune = Math.abs(cents) < 5

  const CX = 200
  const CY = 190
  const R = 155

  return (
    <div className="page-card stack">
      <h2 className="page-title">Guitar Tuner</h2>
      <p className="page-subtitle">Click a string, then play — the gauge shows how close you are to pitch.</p>

      {/* String selector */}
      <div className="row" style={{ justifyContent: 'center', gap: '0.6rem' }}>
        {GUITAR_STRINGS.map((s, i) => {
          const isTarget = i === selectedString
          const stringInTune = running && inTune && note === s.note
          return (
            <button
              key={s.label}
              onClick={() => setSelectedString(i)}
              className="chip"
              style={{
                width: 52,
                height: 52,
                borderRadius: '50%',
                fontSize: '0.85rem',
                background: stringInTune
                  ? '#10b981'
                  : isTarget
                    ? 'var(--accent)'
                    : 'var(--bg-input)',
                borderColor: isTarget ? 'var(--accent)' : 'var(--border-light)',
                color: isTarget || stringInTune ? '#fff' : 'var(--text-secondary)',
                boxShadow: stringInTune
                  ? '0 0 20px rgba(16,185,129,0.5)'
                  : isTarget
                    ? '0 0 14px var(--accent-glow)'
                    : 'none',
              }}
            >
              {s.label}
            </button>
          )
        })}
      </div>

      {/* Gauge */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <svg width={400} height={230} viewBox="0 0 400 230">
          {/* Colored arc zones */}
          <path d={arcPath(CX, CY, R, 170, 150)} stroke="#ef4444" strokeWidth={6} fill="none" opacity={0.35} />
          <path d={arcPath(CX, CY, R, 150, 120)} stroke="#f59e0b" strokeWidth={6} fill="none" opacity={0.35} />
          <path d={arcPath(CX, CY, R, 120, 60)}  stroke="#10b981" strokeWidth={6} fill="none" opacity={0.35} />
          <path d={arcPath(CX, CY, R, 60, 30)}   stroke="#f59e0b" strokeWidth={6} fill="none" opacity={0.35} />
          <path d={arcPath(CX, CY, R, 30, 10)}   stroke="#ef4444" strokeWidth={6} fill="none" opacity={0.35} />

          {/* Tick marks */}
          {Array.from({ length: 21 }).map((_, i) => {
            const angle = (10 + i * 8) * (Math.PI / 180)
            const inner = R - 12
            const outer = i % 5 === 0 ? R - 22 : R - 17
            return (
              <line
                key={i}
                x1={CX + inner * Math.cos(angle)}
                y1={CY - inner * Math.sin(angle)}
                x2={CX + outer * Math.cos(angle)}
                y2={CY - outer * Math.sin(angle)}
                stroke="#475569"
                strokeWidth={i % 5 === 0 ? 2 : 1}
                strokeLinecap="round"
              />
            )
          })}

          {/* Labels */}
          <text x={CX - R + 5} y={CY + 20} fontSize={11} fill="#94a3b8" textAnchor="middle">FLAT</text>
          <text x={CX + R - 5} y={CY + 20} fontSize={11} fill="#94a3b8" textAnchor="middle">SHARP</text>

          {/* Needle */}
          <g transform={`rotate(${-needleAngle}, ${CX}, ${CY})`}>
            <line x1={CX} y1={CY} x2={CX} y2={CY - R + 25} stroke={color} strokeWidth={3} strokeLinecap="round" />
            <circle cx={CX} cy={CY} r={8} fill={color} />
          </g>

          {/* Center ring glow */}
          {running && inTune && (
            <circle cx={CX} cy={CY} r={50} fill="none" stroke="#10b981" strokeWidth={2} opacity={0.4}>
              <animate attributeName="r" values="50;56;50" dur="1.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.4;0.15;0.4" dur="1.5s" repeatCount="indefinite" />
            </circle>
          )}

          {/* Note display */}
          <text x={CX} y={CY - 30} textAnchor="middle" fontSize={48} fontWeight={700} fill={running ? color : '#475569'}>
            {note}
          </text>
          <text x={CX} y={CY - 6} textAnchor="middle" fontSize={13} fill="#94a3b8">
            {hz ? `${hz.toFixed(1)} Hz` : 'Waiting for input...'}
          </text>
          <text x={CX} y={CY + 14} textAnchor="middle" fontSize={12} fill="#64748b">
            {running ? `${cents >= 0 ? '+' : ''}${cents.toFixed(0)} cents` : ''}
          </text>
        </svg>
      </div>

      {!running ? (
        <div style={{ textAlign: 'center' }}>
          <button className="btn-primary btn-icon" onClick={startTuner} style={{ fontSize: '1rem', padding: '0.8rem 2rem' }}>
            <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v4m0 12v4M2 12h4m12 0h4"/></svg>
            Start Tuner
          </button>
        </div>
      ) : (
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
          Listening... play a string to detect pitch
        </p>
      )}
    </div>
  )
}
