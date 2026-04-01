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

const SMOOTHING = 0.3

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
  const [octave, setOctave] = useState<number>(4)
  const [cents, setCents] = useState(0)
  const [running, setRunning] = useState(false)
  const [selectedString, setSelectedString] = useState(0)
  const animRef = useRef(0)
  const ctxRef = useRef<AudioContext | null>(null)
  const smoothHzRef = useRef<number | null>(null)
  const smoothCentsRef = useRef(0)

  const startTuner = useCallback(async () => {
    if (running) return
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    const ctx = new AudioContext()
    ctxRef.current = ctx
    const source = ctx.createMediaStreamSource(stream)
    const analyser = ctx.createAnalyser()
    analyser.fftSize = 8192
    analyser.smoothingTimeConstant = 0.8
    source.connect(analyser)
    const detector = PitchDetector.forFloat32Array(analyser.fftSize)
    const buf = new Float32Array(analyser.fftSize)
    setRunning(true)

    let frameCount = 0

    const loop = () => {
      analyser.getFloatTimeDomainData(buf)
      const [pitch, clarity] = detector.findPitch(buf, ctx.sampleRate)
      if (clarity > 0.92 && pitch > 50 && pitch < 1200) {
        const prev = smoothHzRef.current
        const smoothed = prev ? prev + SMOOTHING * (pitch - prev) : pitch
        smoothHzRef.current = smoothed

        const info = noteInfo(smoothed)
        const prevCents = smoothCentsRef.current
        const smoothedCents = prevCents + SMOOTHING * (info.cents - prevCents)
        smoothCentsRef.current = smoothedCents

        frameCount++
        if (frameCount % 3 === 0) {
          setHz(smoothed)
          setNote(info.name)
          setOctave(info.octave)
          setCents(smoothedCents)
        }
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
  const target = GUITAR_STRINGS[selectedString]

  const CX = 200
  const CY = 190
  const R = 155

  return (
    <div className="page-card stack">
      <h2 className="page-title">Guitar Tuner</h2>
      <p className="page-subtitle">Select a string, play it, and tune until the needle is centered green.</p>

      {/* String selector */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
        {GUITAR_STRINGS.map((s, i) => {
          const isTarget = i === selectedString
          const matchesNote = running && note === s.note && octave === s.octave
          const stringInTune = matchesNote && inTune
          return (
            <button
              key={s.label}
              onClick={() => setSelectedString(i)}
              style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                fontSize: '0.82rem',
                fontWeight: 700,
                border: '2px solid',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                lineHeight: 1.15,
                transition: 'all 0.2s ease',
                background: stringInTune
                  ? '#10b981'
                  : matchesNote
                    ? 'rgba(245,158,11,0.2)'
                    : isTarget
                      ? 'var(--accent)'
                      : 'var(--bg-input)',
                borderColor: stringInTune
                  ? '#10b981'
                  : matchesNote
                    ? '#f59e0b'
                    : isTarget
                      ? 'var(--accent)'
                      : 'var(--border-light)',
                color: isTarget || stringInTune ? '#fff' : matchesNote ? '#f59e0b' : 'var(--text-secondary)',
                boxShadow: stringInTune
                  ? '0 0 24px rgba(16,185,129,0.5)'
                  : matchesNote
                    ? '0 0 16px rgba(245,158,11,0.3)'
                    : isTarget
                      ? '0 0 14px var(--accent-glow)'
                      : 'none',
              }}
            >
              <span>{s.note}</span>
              <span style={{ fontSize: '0.6rem', opacity: 0.7 }}>{s.freq.toFixed(0)} Hz</span>
            </button>
          )
        })}
      </div>

      {/* Target string info */}
      {running && (
        <div style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Target: <strong style={{ color: 'var(--text-primary)' }}>{target.label}</strong> ({target.freq.toFixed(2)} Hz)
          {hz && (
            <span style={{ marginLeft: '1rem' }}>
              Detected: <strong style={{ color }}>{note}{octave}</strong> ({hz.toFixed(1)} Hz)
            </span>
          )}
        </div>
      )}

      {/* Gauge */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <svg width={400} height={240} viewBox="0 0 400 240" style={{ maxWidth: '100%' }}>
          {/* Background glow when in tune */}
          {running && inTune && (
            <circle cx={CX} cy={CY} r={R + 20} fill="none" stroke="#10b981" strokeWidth={1.5} opacity={0.15}>
              <animate attributeName="r" values={`${R + 15};${R + 25};${R + 15}`} dur="2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.15;0.05;0.15" dur="2s" repeatCount="indefinite" />
            </circle>
          )}

          {/* Colored arc zones — thicker, more visible */}
          <path d={arcPath(CX, CY, R, 170, 150)} stroke="#ef4444" strokeWidth={10} fill="none" opacity={0.3} strokeLinecap="round" />
          <path d={arcPath(CX, CY, R, 150, 120)} stroke="#f59e0b" strokeWidth={10} fill="none" opacity={0.3} strokeLinecap="round" />
          <path d={arcPath(CX, CY, R, 120, 60)}  stroke="#10b981" strokeWidth={10} fill="none" opacity={running && inTune ? 0.6 : 0.3} strokeLinecap="round" />
          <path d={arcPath(CX, CY, R, 60, 30)}   stroke="#f59e0b" strokeWidth={10} fill="none" opacity={0.3} strokeLinecap="round" />
          <path d={arcPath(CX, CY, R, 30, 10)}   stroke="#ef4444" strokeWidth={10} fill="none" opacity={0.3} strokeLinecap="round" />

          {/* Inner thin arc for refinement */}
          <path d={arcPath(CX, CY, R - 14, 170, 10)} stroke="#1e293b" strokeWidth={2} fill="none" opacity={0.5} />

          {/* Tick marks */}
          {Array.from({ length: 21 }).map((_, i) => {
            const angle = (10 + i * 8) * (Math.PI / 180)
            const isMajor = i % 5 === 0
            const inner = R - 14
            const outer = isMajor ? R - 28 : R - 20
            return (
              <line
                key={i}
                x1={CX + inner * Math.cos(angle)}
                y1={CY - inner * Math.sin(angle)}
                x2={CX + outer * Math.cos(angle)}
                y2={CY - outer * Math.sin(angle)}
                stroke={isMajor ? '#94a3b8' : '#475569'}
                strokeWidth={isMajor ? 2 : 1}
                strokeLinecap="round"
              />
            )
          })}

          {/* Labels */}
          <text x={CX - R + 12} y={CY + 24} fontSize={11} fill="#94a3b8" textAnchor="middle" fontWeight={600}>FLAT</text>
          <text x={CX} y={CY + 24} fontSize={10} fill="#475569" textAnchor="middle">0</text>
          <text x={CX + R - 12} y={CY + 24} fontSize={11} fill="#94a3b8" textAnchor="middle" fontWeight={600}>SHARP</text>

          {/* Needle with smooth CSS transition */}
          <g style={{ transition: 'transform 0.15s ease-out', transformOrigin: `${CX}px ${CY}px` }} transform={`rotate(${-needleAngle}, ${CX}, ${CY})`}>
            <line x1={CX} y1={CY + 12} x2={CX} y2={CY - R + 30} stroke={color} strokeWidth={2.5} strokeLinecap="round" />
            <circle cx={CX} cy={CY} r={6} fill={color} />
            <circle cx={CX} cy={CY} r={3} fill="#0e1430" />
          </g>

          {/* Note display */}
          <text x={CX} y={CY - 35} textAnchor="middle" fontSize={52} fontWeight={800} fill={running ? color : '#334155'} style={{ transition: 'fill 0.2s' }}>
            {note}
          </text>
          <text x={CX} y={CY - 10} textAnchor="middle" fontSize={14} fill="#94a3b8" fontWeight={500}>
            {hz ? `${hz.toFixed(1)} Hz` : 'Waiting for input…'}
          </text>
          <text x={CX} y={CY + 8} textAnchor="middle" fontSize={13} fill={running ? color : '#475569'} fontWeight={600} style={{ transition: 'fill 0.2s' }}>
            {running ? `${cents >= 0 ? '+' : ''}${cents.toFixed(0)} cents` : ''}
          </text>
        </svg>
      </div>

      {/* In-tune celebration */}
      {running && inTune && (
        <p style={{ textAlign: 'center', color: '#10b981', fontWeight: 700, fontSize: '1rem', margin: 0 }}>
          In tune!
        </p>
      )}

      {!running ? (
        <div style={{ textAlign: 'center' }}>
          <button className="btn-primary btn-icon" onClick={startTuner} style={{ fontSize: '1rem', padding: '0.8rem 2rem' }}>
            <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v4m0 12v4M2 12h4m12 0h4"/></svg>
            Start Tuner
          </button>
        </div>
      ) : (
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
          Listening… play a string to detect pitch
        </p>
      )}
    </div>
  )
}
