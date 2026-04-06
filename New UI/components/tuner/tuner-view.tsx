"use client"

import * as React from "react"
import { Mic, MicOff, Volume2, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { TunerGauge } from "./tuner-gauge"
import { StringSelector } from "./string-selector"
import { cn } from "@/lib/utils"

const STRING_FREQUENCIES = [82.41, 110.0, 146.83, 196.0, 246.94, 329.63]
const STRING_NAMES = ["E2", "A2", "D3", "G3", "B3", "E4"]
const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]

function frequencyToNoteInfo(freq: number): { name: string; cents: number } {
  const midiNote = 69 + 12 * Math.log2(freq / 440)
  const rounded = Math.round(midiNote)
  const cents = (midiNote - rounded) * 100
  const noteIndex = ((rounded % 12) + 12) % 12
  const octave = Math.floor(rounded / 12) - 1
  return { name: `${NOTE_NAMES[noteIndex]}${octave}`, cents }
}

function yinDetect(buf: Float32Array, sampleRate: number): number {
  const bufferSize = buf.length
  const halfSize = Math.floor(bufferSize / 2)
  const threshold = 0.15

  let rms = 0
  for (let i = 0; i < bufferSize; i++) rms += buf[i] * buf[i]
  rms = Math.sqrt(rms / bufferSize)
  if (rms < 0.008) return -1

  const yinBuf = new Float32Array(halfSize)
  yinBuf[0] = 1
  let runningSum = 0

  for (let tau = 1; tau < halfSize; tau++) {
    let diff = 0
    for (let i = 0; i < halfSize; i++) {
      const d = buf[i] - buf[i + tau]
      diff += d * d
    }
    runningSum += diff
    yinBuf[tau] = runningSum === 0 ? 0 : diff * tau / runningSum
  }

  const minTau = Math.floor(sampleRate / 500)
  const maxTau = Math.floor(sampleRate / 60)

  let tauEstimate = -1
  for (let tau = Math.max(2, minTau); tau < Math.min(halfSize - 1, maxTau); tau++) {
    if (yinBuf[tau] < threshold) {
      while (tau + 1 < halfSize - 1 && yinBuf[tau + 1] < yinBuf[tau]) tau++
      tauEstimate = tau
      break
    }
  }

  if (tauEstimate < 2) return -1

  const s0 = yinBuf[tauEstimate - 1]
  const s1 = yinBuf[tauEstimate]
  const s2 = tauEstimate + 1 < halfSize ? yinBuf[tauEstimate + 1] : s1
  const denom = 2 * s1 - s2 - s0
  const betterTau = denom !== 0 ? tauEstimate + (s2 - s0) / (2 * denom) : tauEstimate

  return sampleRate / betterTau
}

/* ---- Reference tone playback ---- */
let audioCtx: AudioContext | null = null
function getAudioCtx(): AudioContext {
  if (!audioCtx) audioCtx = new AudioContext()
  return audioCtx
}

let activeNodes: { oscs: OscillatorNode[]; gain: GainNode } | null = null

function stopReferenceTone() {
  if (!activeNodes) return
  const ctx = getAudioCtx()
  activeNodes.gain.gain.setTargetAtTime(0, ctx.currentTime, 0.05)
  activeNodes.oscs.forEach((o) => { try { o.stop(ctx.currentTime + 0.2) } catch {} })
  activeNodes = null
}

function playReferenceTone(frequency: number) {
  stopReferenceTone()
  const ctx = getAudioCtx()
  if (ctx.state === "suspended") ctx.resume()
  const masterGain = ctx.createGain()
  masterGain.gain.setValueAtTime(0, ctx.currentTime)
  masterGain.gain.linearRampToValueAtTime(0.45, ctx.currentTime + 0.03)
  masterGain.gain.setValueAtTime(0.45, ctx.currentTime + 2.5)
  masterGain.gain.linearRampToValueAtTime(0, ctx.currentTime + 3.0)
  masterGain.connect(ctx.destination)
  const oscs: OscillatorNode[] = []
  const partials = [
    { freqMult: 1, gain: 0.35, type: "sine" as OscillatorType },
    { freqMult: 2, gain: 0.30, type: "sine" as OscillatorType },
    { freqMult: 3, gain: 0.15, type: "sine" as OscillatorType },
    { freqMult: 4, gain: 0.10, type: "sine" as OscillatorType },
    { freqMult: 5, gain: 0.05, type: "sine" as OscillatorType },
    { freqMult: 6, gain: 0.03, type: "sine" as OscillatorType },
    { freqMult: 0.5, gain: 0.02, type: "sine" as OscillatorType },
  ]
  for (const p of partials) {
    const osc = ctx.createOscillator()
    const g = ctx.createGain()
    osc.type = p.type; osc.frequency.setValueAtTime(frequency * p.freqMult, ctx.currentTime)
    g.gain.setValueAtTime(p.gain, ctx.currentTime)
    osc.connect(g); g.connect(masterGain); osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 3.1)
    oscs.push(osc)
  }
  activeNodes = { oscs, gain: masterGain }
  oscs[0].onended = () => { if (activeNodes?.oscs[0] === oscs[0]) activeNodes = null }
}

/* ---- Component ---- */
export function TunerView() {
  const [isActive, setIsActive] = React.useState(false)
  const [selectedString, setSelectedString] = React.useState(0)
  const [cents, setCents] = React.useState(0)
  const [detectedNote, setDetectedNote] = React.useState<string | undefined>()
  const [isPlayingRef, setIsPlayingRef] = React.useState(false)
  const [detectedFreq, setDetectedFreq] = React.useState<number | null>(null)

  const analyserRef = React.useRef<AnalyserNode | null>(null)
  const micStreamRef = React.useRef<MediaStream | null>(null)
  const micCtxRef = React.useRef<AudioContext | null>(null)
  const rafIdRef = React.useRef<number>(0)
  const historyRef = React.useRef<number[]>([])

  const startMic = React.useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
      })
      micStreamRef.current = stream
      const ctx = new AudioContext()
      micCtxRef.current = ctx
      const source = ctx.createMediaStreamSource(stream)
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 8192
      source.connect(analyser)
      analyserRef.current = analyser

      const buf = new Float32Array(analyser.fftSize)

      const detect = () => {
        analyser.getFloatTimeDomainData(buf)
        const freq = yinDetect(buf, ctx.sampleRate)
        if (freq > 60 && freq < 600) {
          historyRef.current.push(freq)
          if (historyRef.current.length > 5) historyRef.current.shift()
          const sorted = [...historyRef.current].sort((a, b) => a - b)
          const median = sorted[Math.floor(sorted.length / 2)]
          const info = frequencyToNoteInfo(median)
          setDetectedNote(info.name)
          setCents(info.cents)
          setDetectedFreq(median)
        } else {
          if (historyRef.current.length > 0) historyRef.current.pop()
        }
        rafIdRef.current = requestAnimationFrame(detect)
      }
      rafIdRef.current = requestAnimationFrame(detect)
    } catch {
      alert("Could not access microphone. Please grant permission and try again.")
    }
  }, [])

  const stopMic = React.useCallback(() => {
    cancelAnimationFrame(rafIdRef.current)
    micStreamRef.current?.getTracks().forEach((t) => t.stop())
    micStreamRef.current = null
    micCtxRef.current?.close().catch(() => {})
    micCtxRef.current = null
    analyserRef.current = null
    historyRef.current = []
    setCents(0)
    setDetectedNote(undefined)
    setDetectedFreq(null)
  }, [])

  React.useEffect(() => {
    if (isActive) startMic()
    else stopMic()
    return () => stopMic()
  }, [isActive, startMic, stopMic])

  const toggleTuner = () => setIsActive(!isActive)

  const handlePlayReference = () => {
    playReferenceTone(STRING_FREQUENCIES[selectedString])
    setIsPlayingRef(true)
    setTimeout(() => setIsPlayingRef(false), 3000)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-border/50">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <a href="/" className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-secondary transition-colors" aria-label="Home">
            <Home className="h-5 w-5" />
          </a>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Guitar Tuner</h1>
            <p className="mt-1 text-sm sm:text-base text-muted-foreground">
              Play a string and tune until the needle is centered
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 overflow-auto">
        <div className="max-w-3xl mx-auto space-y-8 sm:space-y-12">
          <div className="space-y-3">
            <label className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Select String
            </label>
            <StringSelector selectedString={selectedString} onSelectString={setSelectedString} />
          </div>

          <div className="py-4 sm:py-8">
            <TunerGauge cents={cents} isActive={isActive} detectedNote={detectedNote} />
            {detectedFreq !== null && isActive && (
              <p className="text-center text-xs text-muted-foreground mt-2">
                {detectedFreq.toFixed(1)} Hz
              </p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
            <Button size="lg" onClick={toggleTuner}
              className={cn("w-full sm:w-auto min-w-[200px] h-12 sm:h-14 text-base sm:text-lg font-semibold transition-all duration-300",
                isActive ? "bg-destructive hover:bg-destructive/90 text-destructive-foreground" : "bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25")}>
              {isActive ? <><MicOff className="mr-2 h-5 w-5" />Stop Tuner</> : <><Mic className="mr-2 h-5 w-5" />Start Tuner</>}
            </Button>
            <Button size="lg" variant="outline" onClick={handlePlayReference} disabled={isPlayingRef}
              className={cn("w-full sm:w-auto h-12 sm:h-14 text-base", isPlayingRef && "border-primary text-primary")}>
              <Volume2 className={cn("mr-2 h-5 w-5", isPlayingRef && "animate-pulse")} />
              {isPlayingRef ? `Playing ${STRING_NAMES[selectedString]} (${STRING_FREQUENCIES[selectedString]} Hz)` : "Play Reference"}
            </Button>
          </div>

          <div className="p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-card border border-border/50">
            <h3 className="font-semibold text-sm sm:text-base mb-3">Quick Tips</h3>
            <ul className="space-y-2 text-xs sm:text-sm text-muted-foreground">
              <li className="flex items-start gap-2"><span className="text-primary">&bull;</span>
                <span>Play each string one at a time for best results</span></li>
              <li className="flex items-start gap-2"><span className="text-primary">&bull;</span>
                <span>Keep your instrument close to your device&apos;s microphone</span></li>
              <li className="flex items-start gap-2"><span className="text-primary">&bull;</span>
                <span>Tap &quot;Play Reference&quot; to hear the correct pitch for the selected string</span></li>
              <li className="flex items-start gap-2"><span className="text-primary">&bull;</span>
                <span>Green indicator means you&apos;re in tune!</span></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}