import { useCallback, useEffect, useRef, useState } from 'react'
import { GuitarHeadstock } from './GuitarHeadstock'
import {
  GUITAR_STRINGS,
  createTunerGraph,
  detectPitch,
  disposeTunerGraph,
  findNearestString,
  getSensitivityGain,
  playPluckedReference,
  scaleStringFreq,
  stopReferenceTone,
  type TunerGraph,
} from './tunerAudio'

const SMOOTHING = 0.45

function tuneColor(cents: number): string {
  const a = Math.abs(cents)
  if (a < 5) return '#2dd4a8'
  if (a < 15) return '#f59e0b'
  return '#ef4444'
}

export function TunerPage() {
  const [hz, setHz] = useState<number | null>(null)
  const [note, setNote] = useState('—')
  const [cents, setCents] = useState(0)
  const [running, setRunning] = useState(false)
  const [selectedString, setSelectedString] = useState(5)
  const [playingRefIdx, setPlayingRefIdx] = useState<number | null>(null)
  const [activeString, setActiveString] = useState<number | null>(null)

  const graphRef = useRef<TunerGraph | null>(null)
  const animRef = useRef(0)
  const smoothHzRef = useRef<number | null>(null)
  const smoothCentsRef = useRef(0)

  const displayIdx = running ? (activeString ?? selectedString) : selectedString
  const inTune = running && Math.abs(cents) < 5
  const color = tuneColor(cents)

  const startTuner = useCallback(async () => {
    if (running) return
    try {
      const graph = await createTunerGraph()
      graphRef.current = graph
      graph.inputGain.gain.value = getSensitivityGain()
      setRunning(true)
      smoothHzRef.current = null
      smoothCentsRef.current = 0

      let frame = 0
      const loop = () => {
        const g = graphRef.current
        if (!g) return

        const reading = detectPitch(g, { autoString: true })

        if (reading) {
          const prevHz = smoothHzRef.current
          const smoothedHz = prevHz ? prevHz + SMOOTHING * (reading.hz - prevHz) : reading.hz
          smoothHzRef.current = smoothedHz

          const prevCents = smoothCentsRef.current
          const smoothedCents = prevCents + SMOOTHING * (reading.cents - prevCents)
          smoothCentsRef.current = smoothedCents

          const strIdx = findNearestString(smoothedHz)

          frame++
          if (frame % 2 === 0) {
            setHz(smoothedHz)
            setNote(reading.name)
            setCents(smoothedCents)
            setActiveString(strIdx)
          }
        }

        animRef.current = requestAnimationFrame(loop)
      }
      loop()
    } catch {
      setRunning(false)
    }
  }, [running])

  const stopTuner = useCallback(() => {
    cancelAnimationFrame(animRef.current)
    if (graphRef.current) {
      disposeTunerGraph(graphRef.current)
      graphRef.current = null
    }
    smoothHzRef.current = null
    smoothCentsRef.current = 0
    setRunning(false)
    setHz(null)
    setNote('—')
    setCents(0)
    setActiveString(null)
  }, [])

  const toggleTuner = () => {
    if (running) stopTuner()
    else startTuner()
  }

  const handlePlayRef = (idx: number) => {
    playPluckedReference(scaleStringFreq(GUITAR_STRINGS[idx].freq))
    setPlayingRefIdx(idx)
    setTimeout(() => setPlayingRefIdx(null), 3200)
  }

  useEffect(() => {
    return () => {
      cancelAnimationFrame(animRef.current)
      if (graphRef.current) disposeTunerGraph(graphRef.current)
      stopReferenceTone()
    }
  }, [])

  const barPos = Math.max(0, Math.min(100, 50 + cents))
  const statusText = !running ? '' : inTune ? 'In tune!' : cents < -2 ? 'Too flat' : cents > 2 ? 'Too sharp' : 'Adjust…'

  return (
    <div className="gt-tuner-page">
      <div className="gt-stage">
        <GuitarHeadstock
          strings={GUITAR_STRINGS}
          selectedIdx={selectedString}
          onSelect={setSelectedString}
          onPlayRef={handlePlayRef}
          playingIdx={playingRefIdx}
          activeStringIdx={running ? activeString : null}
          inTune={inTune}
        />

        {running && (
          <div className="gt-feedback">
            <div className="gt-feedback-note" style={{ color }}>{note}</div>
            <div className="gt-feedback-meta">
              <span>{GUITAR_STRINGS[displayIdx].label}{GUITAR_STRINGS[displayIdx].num}</span>
              {hz && <span>{hz.toFixed(1)} Hz</span>}
            </div>
            <div className="gt-bar-track">
              <div className="gt-bar-center" />
              <div className="gt-bar-needle" style={{ left: `${barPos}%`, background: color }} />
            </div>
            <p className="gt-feedback-status" style={{ color }}>{statusText}</p>
          </div>
        )}

        <button
          type="button"
          className={`gt-tap-main${running ? ' listening' : ''}`}
          onClick={toggleTuner}
        >
          {running ? 'Stop tuning' : 'Tap to tune'}
        </button>
      </div>
    </div>
  )
}
