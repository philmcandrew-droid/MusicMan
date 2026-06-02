import { PitchDetector } from 'pitchy'

export const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

export type GuitarString = {
  label: string
  num: number
  freq: number
  note: string
  octave: number
}

export const GUITAR_STRINGS: GuitarString[] = [
  { label: 'E', num: 6, freq: 82.41, note: 'E', octave: 2 },
  { label: 'A', num: 5, freq: 110.0, note: 'A', octave: 2 },
  { label: 'D', num: 4, freq: 146.83, note: 'D', octave: 3 },
  { label: 'G', num: 3, freq: 196.0, note: 'G', octave: 3 },
  { label: 'B', num: 2, freq: 246.94, note: 'B', octave: 3 },
  { label: 'E', num: 1, freq: 329.63, note: 'E', octave: 4 },
]

export function getReferenceA(): number {
  const saved = localStorage.getItem('musicman-reference-a')
  const n = saved ? Number(saved) : 440
  return Number.isFinite(n) && n >= 430 && n <= 450 ? n : 440
}

export function getSensitivityGain(): number {
  const saved = localStorage.getItem('musicman-tuner-sensitivity')
  const n = saved ? Number(saved) : 75
  const pct = Number.isFinite(n) ? Math.max(0, Math.min(100, n)) : 75
  // 1.5x at 0%, up to 4.5x at 100%
  return 1.5 + (pct / 100) * 3
}

export function scaleStringFreq(baseFreq: number, refA = getReferenceA()): number {
  return baseFreq * (refA / 440)
}

export function midiFromHz(hz: number) {
  return 12 * Math.log2(hz / getReferenceA()) + 69
}

export function hzFromMidi(midi: number) {
  return getReferenceA() * Math.pow(2, (midi - 69) / 12)
}

export function noteInfo(hz: number) {
  const midi = midiFromHz(hz)
  const rounded = Math.round(midi)
  const name = NOTE_NAMES[((rounded % 12) + 12) % 12]
  const octave = Math.floor(rounded / 12) - 1
  const cents = (midi - rounded) * 100
  return { name, octave, cents, midi: rounded }
}

/** Snap detected pitch to nearest harmonic of the target string (helps low E on phone mics). */
export function alignPitchToTarget(hz: number, targetHz: number): number {
  let best = hz
  let bestCents = Infinity
  for (const factor of [0.25, 0.5, 1, 2, 4]) {
    const candidate = hz * factor
    const cents = 1200 * Math.log2(candidate / targetHz)
    if (Math.abs(cents) < Math.abs(bestCents)) {
      bestCents = cents
      best = candidate
    }
  }
  return Math.abs(bestCents) <= 45 ? best : hz
}

export function findNearestString(hz: number, strings = GUITAR_STRINGS): number {
  let bestIdx = 0
  let bestCents = Infinity
  strings.forEach((s, i) => {
    const target = scaleStringFreq(s.freq)
    for (const factor of [0.5, 1, 2]) {
      const cents = Math.abs(1200 * Math.log2((hz * factor) / target))
      if (cents < bestCents) {
        bestCents = cents
        bestIdx = i
      }
    }
  })
  return bestIdx
}

export type TunerGraph = {
  ctx: AudioContext
  stream: MediaStream
  analyser: AnalyserNode
  detector: ReturnType<typeof PitchDetector.forFloat32Array>
  buffer: Float32Array
  inputGain: GainNode
}

export async function createTunerGraph(): Promise<TunerGraph> {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: {
      echoCancellation: false,
      noiseSuppression: false,
      autoGainControl: false,
      channelCount: 1,
    },
  })

  const ctx = new AudioContext()
  const source = ctx.createMediaStreamSource(stream)

  const inputGain = ctx.createGain()
  inputGain.gain.value = getSensitivityGain()

  const highPass = ctx.createBiquadFilter()
  highPass.type = 'highpass'
  highPass.frequency.value = 60
  highPass.Q.value = 0.7

  const analyser = ctx.createAnalyser()
  analyser.fftSize = 8192
  analyser.smoothingTimeConstant = 0.4

  source.connect(inputGain)
  inputGain.connect(highPass)
  highPass.connect(analyser)

  const buffer = new Float32Array(analyser.fftSize)
  const detector = PitchDetector.forFloat32Array(analyser.fftSize)

  return { ctx, stream, analyser, detector, buffer, inputGain }
}

export function rms(buf: Float32Array): number {
  let sum = 0
  for (let i = 0; i < buf.length; i++) sum += buf[i] * buf[i]
  return Math.sqrt(sum / buf.length)
}

export type PitchReading = {
  hz: number
  cents: number
  name: string
  octave: number
  clarity: number
  volume: number
}

export function detectPitch(
  graph: TunerGraph,
  options: {
    targetStringIdx?: number
    autoString?: boolean
    clarityThreshold?: number
  } = {},
): PitchReading | null {
  const { analyser, detector, buffer, ctx } = graph
  analyser.getFloatTimeDomainData(buffer as Float32Array<ArrayBuffer>)

  const volume = rms(buffer)
  if (volume < 0.002) return null

  const [rawPitch, clarity] = detector.findPitch(buffer, ctx.sampleRate)
  const threshold = options.clarityThreshold ?? Math.max(0.72, 0.92 - getSensitivityGain() * 0.08)

  if (clarity < threshold || rawPitch < 55 || rawPitch > 1400) return null

  let hz = rawPitch
  let stringIdx = options.targetStringIdx ?? 0

  if (options.autoString) {
    stringIdx = findNearestString(hz)
  }

  if (options.targetStringIdx !== undefined || options.autoString) {
    const target = scaleStringFreq(GUITAR_STRINGS[stringIdx].freq)
    hz = alignPitchToTarget(hz, target)
  }

  const info = noteInfo(hz)
  const targetHz = scaleStringFreq(GUITAR_STRINGS[stringIdx].freq)
  const cents = 1200 * Math.log2(hz / targetHz)

  return {
    hz,
    cents,
    name: info.name,
    octave: info.octave,
    clarity,
    volume,
  }
}

export function disposeTunerGraph(graph: TunerGraph) {
  graph.stream.getTracks().forEach((t) => t.stop())
  graph.ctx.close()
}

/* ---- Plucked-string reference (Karplus-Strong style, not sine/MIDI) ---- */

let refCtx: AudioContext | null = null
let refStopTimer = 0

function getRefCtx(): AudioContext {
  if (!refCtx) refCtx = new AudioContext()
  if (refCtx.state === 'suspended') refCtx.resume()
  return refCtx
}

function buildPluckBuffer(ctx: AudioContext, frequency: number): AudioBuffer {
  const sampleRate = ctx.sampleRate
  const period = Math.max(2, Math.round(sampleRate / frequency))
  const duration = 3.2
  const length = Math.floor(sampleRate * duration)
  const buffer = ctx.createBuffer(1, length, sampleRate)
  const data = buffer.getChannelData(0)

  const noiseLen = period * 2
  for (let i = 0; i < noiseLen; i++) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (period * 0.35))
  }

  for (let i = noiseLen; i < length; i++) {
    data[i] = (data[i - period] + data[i - period + 1]) * 0.496
  }

  return buffer
}

export function stopReferenceTone() {
  clearTimeout(refStopTimer)
}

export function playPluckedReference(frequency: number, durationSec = 3.2) {
  stopReferenceTone()
  const ctx = getRefCtx()

  const source = ctx.createBufferSource()
  source.buffer = buildPluckBuffer(ctx, frequency)

  const body = ctx.createBiquadFilter()
  body.type = 'peaking'
  body.frequency.value = Math.min(frequency * 2.5, 3200)
  body.Q.value = 1.2
  body.gain.value = 4

  const warmth = ctx.createBiquadFilter()
  warmth.type = 'lowpass'
  warmth.frequency.value = Math.min(frequency * 12, 9000)
  warmth.Q.value = 0.5

  const master = ctx.createGain()
  master.gain.setValueAtTime(0, ctx.currentTime)
  master.gain.linearRampToValueAtTime(0.95, ctx.currentTime + 0.02)
  master.gain.setValueAtTime(0.95, ctx.currentTime + durationSec - 0.4)
  master.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationSec)

  source.connect(body)
  body.connect(warmth)
  warmth.connect(master)
  master.connect(ctx.destination)

  source.start()
  source.stop(ctx.currentTime + durationSec + 0.05)

  refStopTimer = window.setTimeout(() => {}, durationSec * 1000)
}
