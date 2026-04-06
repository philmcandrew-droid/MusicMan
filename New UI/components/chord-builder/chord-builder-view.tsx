"use client"

import * as React from "react"
import { Play, RotateCcw, Copy, Check, Home, Volume2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const allNotes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]

const NOTE_FREQ: Record<string, number> = {
  "C": 261.63, "C#": 277.18, "D": 293.66, "D#": 311.13,
  "E": 329.63, "F": 349.23, "F#": 369.99, "G": 392.00,
  "G#": 415.30, "A": 440.00, "A#": 466.16, "B": 493.88,
}

let audioCtx: AudioContext | null = null
function getAudioCtx(): AudioContext {
  if (!audioCtx) audioCtx = new AudioContext()
  return audioCtx
}

function createPianoNote(ctx: AudioContext, freq: number, start: number, dur: number, master: GainNode) {
  const harmonics = [{ m: 1, a: 0.4 }, { m: 2, a: 0.25 }, { m: 3, a: 0.12 }, { m: 4, a: 0.07 }, { m: 5, a: 0.04 }]
  for (const h of harmonics) {
    const osc = ctx.createOscillator()
    const g = ctx.createGain()
    osc.type = "sine"
    osc.frequency.setValueAtTime(freq * h.m, start)
    g.gain.setValueAtTime(0, start)
    g.gain.linearRampToValueAtTime(h.a, start + 0.005)
    g.gain.exponentialRampToValueAtTime(h.a * 0.3, start + dur * 0.5)
    g.gain.exponentialRampToValueAtTime(0.001, start + dur)
    osc.connect(g); g.connect(master)
    osc.start(start); osc.stop(start + dur + 0.05)
  }
}

function playChordFromNotes(noteNames: string[]) {
  const ctx = getAudioCtx()
  if (ctx.state === "suspended") ctx.resume()
  const master = ctx.createGain()
  master.gain.setValueAtTime(0.35, ctx.currentTime)
  master.connect(ctx.destination)
  noteNames.forEach((n, i) => {
    const freq = NOTE_FREQ[n]
    if (freq) createPianoNote(ctx, freq, ctx.currentTime + i * 0.08, 1.8, master)
  })
}

const intervals = [
  { name: "Root", semitones: 0, short: "R" },
  { name: "Minor 2nd", semitones: 1, short: "m2" },
  { name: "Major 2nd", semitones: 2, short: "M2" },
  { name: "Minor 3rd", semitones: 3, short: "m3" },
  { name: "Major 3rd", semitones: 4, short: "M3" },
  { name: "Perfect 4th", semitones: 5, short: "P4" },
  { name: "Tritone", semitones: 6, short: "TT" },
  { name: "Perfect 5th", semitones: 7, short: "P5" },
  { name: "Minor 6th", semitones: 8, short: "m6" },
  { name: "Major 6th", semitones: 9, short: "M6" },
  { name: "Minor 7th", semitones: 10, short: "m7" },
  { name: "Major 7th", semitones: 11, short: "M7" },
]

export function ChordBuilderView() {
  const [rootNote, setRootNote] = React.useState("C")
  const [selectedIntervals, setSelectedIntervals] = React.useState<number[]>([0, 4, 7])
  const [copied, setCopied] = React.useState(false)

  const toggleInterval = (semitones: number) => {
    if (semitones === 0) return
    setSelectedIntervals((prev) =>
      prev.includes(semitones) ? prev.filter((i) => i !== semitones) : [...prev, semitones].sort((a, b) => a - b))
  }

  const getChordNotes = () => {
    const rootIndex = allNotes.indexOf(rootNote)
    return selectedIntervals.map((interval) => allNotes[(rootIndex + interval) % 12])
  }

  const getChordName = () => {
    const sorted = [...selectedIntervals].sort((a, b) => a - b)
    const has3m = sorted.includes(3), has3M = sorted.includes(4)
    const has7m = sorted.includes(10), has7M = sorted.includes(11)
    const has5 = sorted.includes(7), has5d = sorted.includes(6), has5a = sorted.includes(8)
    let name = rootNote
    if (has3m && has5d && !has5) { name += "dim"; if (has7m) name += "7"; else if (has7M) name += "maj7" }
    else if (has3M && has5a && !has5) { name += "aug"; if (has7m) name += "7"; else if (has7M) name += "maj7" }
    else if (has3m) { name += "m"; if (has7M) name += "maj7"; else if (has7m) name += "7" }
    else if (has3M) { if (has7M) name += "maj7"; else if (has7m) name += "7" }
    else if (sorted.includes(5)) { name += "sus4"; if (has7m) name += "7" }
    else if (sorted.includes(2)) { name += "sus2"; if (has7m) name += "7" }
    return name || `${rootNote} (custom)`
  }

  const reset = () => setSelectedIntervals([0, 4, 7])
  const copyChord = () => {
    navigator.clipboard.writeText(`${getChordName()}: ${getChordNotes().join(" - ")}`)
    setCopied(true); setTimeout(() => setCopied(false), 2000)
  }

  const chordNotes = getChordNotes()

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-border/50">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <a href="/" className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-secondary transition-colors" aria-label="Home"><Home className="h-5 w-5" /></a>
          <div><h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Chord Builder</h1>
          <p className="mt-1 text-sm sm:text-base text-muted-foreground">Build custom chords by selecting intervals</p></div>
        </div>
      </div>
      <div className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 overflow-auto">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="p-6 sm:p-8 rounded-2xl bg-card border border-border/50 text-center">
            <p className="text-sm text-muted-foreground mb-2">Your Chord</p>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-primary mb-4">{getChordName()}</h2>
            <p className="text-lg sm:text-xl text-muted-foreground">{chordNotes.join(" - ")}</p>
            <div className="flex justify-center gap-3 mt-6">
              <Button variant="outline" onClick={reset}><RotateCcw className="h-4 w-4 mr-2" />Reset</Button>
              <Button variant="outline" onClick={copyChord}>
                {copied ? <><Check className="h-4 w-4 mr-2" />Copied!</> : <><Copy className="h-4 w-4 mr-2" />Copy</>}
              </Button>
              <Button onClick={() => playChordFromNotes(chordNotes)}>
                <Volume2 className="h-4 w-4 mr-2" />Play
              </Button>
            </div>
          </div>
          <div className="space-y-3">
            <label className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wider">Root Note</label>
            <div className="flex flex-wrap gap-2">
              {allNotes.map((note) => (
                <button key={note} onClick={() => setRootNote(note)}
                  className={cn("w-11 h-11 sm:w-12 sm:h-12 rounded-xl font-semibold text-sm transition-all",
                    rootNote === note ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25" : "bg-secondary text-secondary-foreground hover:bg-secondary/80")}>{note}</button>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <label className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wider">Intervals</label>
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 sm:gap-3">
              {intervals.map((interval) => {
                const isSelected = selectedIntervals.includes(interval.semitones)
                const noteAtInterval = allNotes[(allNotes.indexOf(rootNote) + interval.semitones) % 12]
                return (
                  <button key={interval.semitones} onClick={() => toggleInterval(interval.semitones)} disabled={interval.semitones === 0}
                    className={cn("flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl border transition-all",
                      interval.semitones === 0 ? "bg-primary/20 border-primary/50 cursor-not-allowed"
                        : isSelected ? "bg-primary/20 border-primary shadow-lg shadow-primary/10" : "bg-card border-border/50 hover:border-primary/50")}>
                    <span className={cn("text-lg sm:text-xl font-bold", isSelected ? "text-primary" : "text-foreground")}>{noteAtInterval}</span>
                    <span className="text-xs text-muted-foreground mt-1">{interval.short}</span>
                    <span className="text-[10px] text-muted-foreground/70 mt-0.5 hidden sm:block">{interval.name}</span>
                  </button>
                )
              })}
            </div>
          </div>
          <div className="space-y-3">
            <label className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wider">Quick Presets</label>
            <div className="flex flex-wrap gap-2">
              {[{ name: "Major", intervals: [0,4,7] },{ name: "Minor", intervals: [0,3,7] },{ name: "7th", intervals: [0,4,7,10] },
                { name: "Maj7", intervals: [0,4,7,11] },{ name: "Min7", intervals: [0,3,7,10] },{ name: "Dim", intervals: [0,3,6] },
                { name: "Aug", intervals: [0,4,8] },{ name: "Sus4", intervals: [0,5,7] },{ name: "Sus2", intervals: [0,2,7] },
                { name: "Add9", intervals: [0,2,4,7] }].map((preset) => (
                <button key={preset.name} onClick={() => setSelectedIntervals(preset.intervals)}
                  className="px-3 py-2 rounded-lg bg-secondary text-sm font-medium hover:bg-secondary/80 transition-colors">{preset.name}</button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}