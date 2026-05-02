import { useCallback, useEffect, useRef, useState } from 'react'
import { PitchDetector } from 'pitchy'

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

const GUITAR_STRINGS = [
  { label: 'E', num: 6, freq: 82.41, note: 'E', octave: 2 },
  { label: 'A', num: 5, freq: 110.0, note: 'A', octave: 2 },
  { label: 'D', num: 4, freq: 146.83, note: 'D', octave: 3 },
  { label: 'G', num: 3, freq: 196.0, note: 'G', octave: 3 },
  { label: 'B', num: 2, freq: 246.94, note: 'B', octave: 3 },
  { label: 'E', num: 1, freq: 329.63, note: 'E', octave: 4 },
]

const SMOOTHING = 0.3

function midiFromHz(hz: number) { return 12 * Math.log2(hz / 440) + 69 }
function hzFromMidi(midi: number) { return 440 * Math.pow(2, (midi - 69) / 12) }

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

let refAudioCtx: AudioContext | null = null
let refActiveNodes: { oscs: OscillatorNode[]; gain: GainNode } | null = null

function stopReferenceTone() {
  if (!refActiveNodes || !refAudioCtx) return
  refActiveNodes.gain.gain.setTargetAtTime(0, refAudioCtx.currentTime, 0.05)
  refActiveNodes.oscs.forEach((o) => { try { o.stop(refAudioCtx!.currentTime + 0.2) } catch {} })
  refActiveNodes = null
}

function playReferenceTone(frequency: number) {
  stopReferenceTone()
  if (!refAudioCtx) refAudioCtx = new AudioContext()
  const ctx = refAudioCtx
  if (ctx.state === 'suspended') ctx.resume()

  const masterGain = ctx.createGain()
  masterGain.gain.setValueAtTime(0, ctx.currentTime)
  masterGain.gain.linearRampToValueAtTime(0.7, ctx.currentTime + 0.05)
  masterGain.gain.setValueAtTime(0.7, ctx.currentTime + 2.5)
  masterGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 3.0)
  masterGain.connect(ctx.destination)

  const oscs: OscillatorNode[] = []

  // For low strings (<150 Hz), phone speakers can't reproduce the fundamental
  // well so we play one octave up to be clearly audible
  const playFreq = frequency < 150 ? frequency * 2 : frequency

  const osc = ctx.createOscillator()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(playFreq, ctx.currentTime)
  osc.connect(masterGain)
  osc.start(ctx.currentTime)
  osc.stop(ctx.currentTime + 3.1)
  oscs.push(osc)

  // Gentle second harmonic for a warmer tone, only if it stays audible
  if (playFreq * 2 < 2000) {
    const osc2 = ctx.createOscillator()
    const g2 = ctx.createGain()
    osc2.type = 'sine'
    osc2.frequency.setValueAtTime(playFreq * 2, ctx.currentTime)
    g2.gain.setValueAtTime(0.15, ctx.currentTime)
    osc2.connect(g2)
    g2.connect(masterGain)
    osc2.start(ctx.currentTime)
    osc2.stop(ctx.currentTime + 3.1)
    oscs.push(osc2)
  }

  refActiveNodes = { oscs, gain: masterGain }
  oscs[0].onended = () => { if (refActiveNodes?.oscs[0] === oscs[0]) refActiveNodes = null }
}

export function TunerPage() {
  const [hz, setHz] = useState<number | null>(null)
  const [note, setNote] = useState<string>('—')
  const [octave, setOctave] = useState<number>(4)
  const [cents, setCents] = useState(0)
  const [running, setRunning] = useState(false)
  const [selectedString, setSelectedString] = useState(0)
  const [playingRef, setPlayingRef] = useState(false)
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

  const stopTuner = useCallback(() => {
    cancelAnimationFrame(animRef.current)
    ctxRef.current?.close()
    ctxRef.current = null
    smoothHzRef.current = null
    smoothCentsRef.current = 0
    setRunning(false)
    setHz(null)
    setNote('—')
    setCents(0)
  }, [])

  useEffect(() => {
    return () => {
      cancelAnimationFrame(animRef.current)
      ctxRef.current?.close()
    }
  }, [])

  const handlePlayRef = () => {
    playReferenceTone(GUITAR_STRINGS[selectedString].freq)
    setPlayingRef(true)
    setTimeout(() => setPlayingRef(false), 3000)
  }

  const needleAngle = Math.max(-50, Math.min(50, cents)) * 1.7
  const color = tuneColor(cents)
  const inTune = Math.abs(cents) < 5
  const target = GUITAR_STRINGS[selectedString]

  const CX = 200, CY = 190, R = 155

  return (
    <div className="page-card stack tuner-page">
      <h2 className="page-title">Guitar Tuner</h2>
      <p className="page-subtitle">Play a string and tune until the needle is centered.</p>

      {/* String selector */}
      <div>
        <span className="section-label">Select String</span>
        <div className="tuner-string-cards">
          {GUITAR_STRINGS.map((s, i) => {
            const isTarget = i === selectedString
            const matchesNote = running && note === s.note && octave === s.octave
            const stringInTune = matchesNote && inTune
            return (
              <button
                key={`${s.label}-${s.num}`}
                className={`tuner-string-card${isTarget ? ' active' : ''}${stringInTune ? ' in-tune' : ''}${matchesNote && !stringInTune ? ' matching' : ''}`}
                onClick={() => setSelectedString(i)}
              >
                {isTarget && <span className="tuner-string-dot" />}
                <span className="tuner-string-card-note">{s.label}</span>
                <span className="tuner-string-card-freq">{Math.round(s.freq)} Hz</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Gauge */}
      <div className="tuner-gauge-wrap">
        <svg viewBox="0 0 400 260" className="tuner-gauge">
          {running && inTune && (
            <circle cx={CX} cy={CY} r={R + 20} fill="none" stroke="#10b981" strokeWidth={1.5} opacity={0.15}>
              <animate attributeName="r" values={`${R + 15};${R + 25};${R + 15}`} dur="2s" repeatCount="indefinite" />
            </circle>
          )}
          <path d={arcPath(CX, CY, R, 170, 150)} stroke="#ef4444" strokeWidth={10} fill="none" opacity={0.3} strokeLinecap="round" />
          <path d={arcPath(CX, CY, R, 150, 120)} stroke="#f59e0b" strokeWidth={10} fill="none" opacity={0.3} strokeLinecap="round" />
          <path d={arcPath(CX, CY, R, 120, 60)} stroke="#10b981" strokeWidth={10} fill="none" opacity={running && inTune ? 0.7 : 0.3} strokeLinecap="round" />
          <path d={arcPath(CX, CY, R, 60, 30)} stroke="#f59e0b" strokeWidth={10} fill="none" opacity={0.3} strokeLinecap="round" />
          <path d={arcPath(CX, CY, R, 30, 10)} stroke="#ef4444" strokeWidth={10} fill="none" opacity={0.3} strokeLinecap="round" />
          <path d={arcPath(CX, CY, R - 14, 170, 10)} stroke="#1e293b" strokeWidth={2} fill="none" opacity={0.5} />

          {Array.from({ length: 21 }).map((_, i) => {
            const angle = (10 + i * 8) * (Math.PI / 180)
            const isMajor = i % 5 === 0
            return (
              <line key={i}
                x1={CX + (R - 14) * Math.cos(angle)} y1={CY - (R - 14) * Math.sin(angle)}
                x2={CX + (isMajor ? R - 28 : R - 20) * Math.cos(angle)} y2={CY - (isMajor ? R - 28 : R - 20) * Math.sin(angle)}
                stroke={isMajor ? '#94a3b8' : '#475569'} strokeWidth={isMajor ? 2 : 1} strokeLinecap="round"
              />
            )
          })}

          <text x={CX - R + 18} y={CY + 20} fontSize={11} fill="#64748b" textAnchor="middle" fontWeight={600}>-50</text>
          <text x={CX} y={CY - R + 30} fontSize={10} fill="#64748b" textAnchor="middle" fontWeight={600}>0</text>
          <text x={CX + R - 18} y={CY + 20} fontSize={11} fill="#64748b" textAnchor="middle" fontWeight={600}>+50</text>

          <g style={{ transition: 'transform 0.15s ease-out', transformOrigin: `${CX}px ${CY}px` }} transform={`rotate(${-needleAngle}, ${CX}, ${CY})`}>
            <line x1={CX} y1={CY + 12} x2={CX} y2={CY - R + 30} stroke={color} strokeWidth={2.5} strokeLinecap="round" />
            <circle cx={CX} cy={CY} r={6} fill={color} />
            <circle cx={CX} cy={CY} r={3} fill="#0e1430" />
          </g>

          <text x={CX} y={CY - 40} textAnchor="middle" fontSize={56} fontWeight={800} fill={running ? color : '#334155'} style={{ transition: 'fill 0.2s' }}>{note}</text>
          <text x={CX} y={CY - 6} textAnchor="middle" fontSize={20} fill={running ? color : '#475569'} fontWeight={700}>{running ? Math.round(Math.abs(cents)) : '0'}</text>
          <text x={CX} y={CY + 12} textAnchor="middle" fontSize={10} fill="#64748b" fontWeight={600} letterSpacing="1.5">CENTS</text>
        </svg>

        <div className="tuner-freq-badge">
          <span>{hz ? `${hz.toFixed(1)} Hz` : '— Hz'}</span>
          <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 12h2l3-6 4 12 4-8 3 4h4" /></svg>
        </div>
      </div>

      {running && inTune && <p className="tuner-in-tune">In tune!</p>}

      {/* Action buttons */}
      <div className="tuner-actions">
        {!running ? (
          <button className="btn-primary btn-icon tuner-action-btn" onClick={startTuner}>
            <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /></svg>
            Start Tuner
          </button>
        ) : (
          <button className="btn-icon tuner-action-btn tuner-stop-btn" onClick={stopTuner}>
            <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="1" y1="1" x2="23" y2="23" /><path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" /><path d="M17 16.95A7 7 0 0 1 5 12v-2m14 0v2c0 .76-.12 1.49-.34 2.18" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" /></svg>
            Stop Tuner
          </button>
        )}

        <button
          className={`btn-ghost btn-icon tuner-action-btn${playingRef ? ' tuner-ref-playing' : ''}`}
          onClick={handlePlayRef}
          disabled={playingRef}
        >
          <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" /></svg>
          {playingRef ? `Playing ${target.label}${target.num} (${Math.round(target.freq)} Hz)` : 'Play Reference'}
        </button>
      </div>

      {/* Quick tips */}
      <div className="tuner-tips">
        <h3>Quick Tips</h3>
        <ul>
          <li>Play each string one at a time for best results</li>
          <li>Keep your instrument close to your device's microphone</li>
          <li>Tap "Play Reference" to hear the correct pitch for the selected string</li>
          <li>Green indicator means you're in tune!</li>
        </ul>
      </div>
    </div>
  )
}
