"use client"

import * as React from "react"
import { Play, Volume2, Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const notes = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
const chordTypes = ["Major", "Minor", "7th", "Maj7", "Min7", "Dim", "Aug", "9th", "Sus2", "Sus4"]

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

function createPianoNote(ctx: AudioContext, freq: number, startTime: number, duration: number, masterGain: GainNode) {
  const harmonics = [
    { mult: 1,   amp: 0.40 },
    { mult: 2,   amp: 0.25 },
    { mult: 3,   amp: 0.12 },
    { mult: 4,   amp: 0.07 },
    { mult: 5,   amp: 0.04 },
    { mult: 6,   amp: 0.02 },
  ]

  for (const h of harmonics) {
    const osc = ctx.createOscillator()
    const noteGain = ctx.createGain()

    osc.type = "sine"
    osc.frequency.setValueAtTime(freq * h.mult, startTime)

    noteGain.gain.setValueAtTime(0, startTime)
    noteGain.gain.linearRampToValueAtTime(h.amp, startTime + 0.005)
    noteGain.gain.exponentialRampToValueAtTime(h.amp * 0.6, startTime + 0.08)
    noteGain.gain.exponentialRampToValueAtTime(h.amp * 0.3, startTime + duration * 0.5)
    noteGain.gain.exponentialRampToValueAtTime(0.001, startTime + duration)

    osc.connect(noteGain)
    noteGain.connect(masterGain)
    osc.start(startTime)
    osc.stop(startTime + duration + 0.05)
  }
}

function playChordNotes(noteNames: string[], arpeggiate: boolean) {
  const ctx = getAudioCtx()
  if (ctx.state === "suspended") ctx.resume()

  const masterGain = ctx.createGain()
  masterGain.gain.setValueAtTime(0.35, ctx.currentTime)
  masterGain.connect(ctx.destination)

  const duration = arpeggiate ? 1.5 : 2.0
  noteNames.forEach((n, i) => {
    const freq = NOTE_FREQ[n]
    if (!freq) return
    const offset = arpeggiate ? i * 0.12 : 0
    createPianoNote(ctx, freq, ctx.currentTime + offset, duration, masterGain)
  })
}

function playSingleNote(noteName: string) {
  const freq = NOTE_FREQ[noteName]
  if (!freq) return
  const ctx = getAudioCtx()
  if (ctx.state === "suspended") ctx.resume()
  const masterGain = ctx.createGain()
  masterGain.gain.setValueAtTime(0.4, ctx.currentTime)
  masterGain.connect(ctx.destination)
  createPianoNote(ctx, freq, ctx.currentTime, 1.2, masterGain)
}

interface PianoKeyProps {
  note: string
  isBlack: boolean
  isHighlighted: boolean
  position: number
}

function PianoKey({ note, isBlack, isHighlighted, position }: PianoKeyProps) {
  return (
    <button
      onClick={() => playSingleNote(note)}
      className={cn(
        "relative transition-all duration-150 active:scale-95",
        isBlack
          ? cn(
              "absolute z-10 w-6 sm:w-8 h-20 sm:h-28 -ml-3 sm:-ml-4 rounded-b-md",
              isHighlighted
                ? "bg-primary shadow-lg shadow-primary/50"
                : "bg-foreground hover:bg-foreground/80"
            )
          : cn(
              "w-8 sm:w-12 h-32 sm:h-44 rounded-b-lg border border-border/50",
              isHighlighted
                ? "bg-primary/20 border-primary"
                : "bg-card hover:bg-card/80"
            )
      )}
      style={isBlack ? { left: `${position}px` } : undefined}
    >
      {!isBlack && (
        <span className={cn("absolute bottom-2 left-1/2 -translate-x-1/2 text-xs font-medium",
          isHighlighted ? "text-primary" : "text-muted-foreground")}>{note}</span>
      )}
    </button>
  )
}

export function PianoChordsView() {
  const [selectedRoot, setSelectedRoot] = React.useState("C")
  const [selectedType, setSelectedType] = React.useState("Major")

  const getChordNotes = (root: string, type: string): string[] => {
    const rootIndex = notes.indexOf(root)
    let intervals: number[]
    switch (type) {
      case "Major": intervals = [0, 4, 7]; break
      case "Minor": intervals = [0, 3, 7]; break
      case "7th": intervals = [0, 4, 7, 10]; break
      case "Maj7": intervals = [0, 4, 7, 11]; break
      case "Min7": intervals = [0, 3, 7, 10]; break
      case "Dim": intervals = [0, 3, 6]; break
      case "Aug": intervals = [0, 4, 8]; break
      case "9th": intervals = [0, 4, 7, 10, 14]; break
      case "Sus2": intervals = [0, 2, 7]; break
      case "Sus4": intervals = [0, 5, 7]; break
      default: intervals = [0, 4, 7]
    }
    return intervals.map((i) => notes[(rootIndex + i) % 12])
  }

  const highlightedNotes = getChordNotes(selectedRoot, selectedType)
  const whiteKeys = ["C", "D", "E", "F", "G", "A", "B"]
  const blackKeys = [
    { note: "C#", after: "C" }, { note: "D#", after: "D" },
    { note: "F#", after: "F" }, { note: "G#", after: "G" }, { note: "A#", after: "A" },
  ]

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-border/50">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <a href="/" className="flex h-9 w-9 items-center justify-center rounded-lg hover:bg-secondary transition-colors" aria-label="Home">
            <Home className="h-5 w-5" />
          </a>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Piano Chords</h1>
            <p className="mt-1 text-sm sm:text-base text-muted-foreground">Learn piano chords with visual keyboard guidance</p>
          </div>
        </div>
      </div>

      <div className="flex-1 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 overflow-auto">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wider">Root Note</label>
              <div className="flex flex-wrap gap-2">
                {notes.map((note) => (
                  <button key={note} onClick={() => setSelectedRoot(note)}
                    className={cn("w-10 h-10 sm:w-12 sm:h-12 rounded-lg font-semibold text-sm transition-all",
                      selectedRoot === note ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25" : "bg-secondary text-secondary-foreground hover:bg-secondary/80")}>{note}</button>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <label className="text-xs sm:text-sm font-medium text-muted-foreground uppercase tracking-wider">Chord Type</label>
              <div className="flex flex-wrap gap-2">
                {chordTypes.map((type) => (
                  <button key={type} onClick={() => setSelectedType(type)}
                    className={cn("px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg font-medium text-sm transition-all",
                      selectedType === type ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25" : "bg-secondary text-secondary-foreground hover:bg-secondary/80")}>{type}</button>
                ))}
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6 rounded-2xl bg-card border border-border/50">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold">{selectedRoot} {selectedType}</h2>
                <p className="text-sm text-muted-foreground">Notes: {highlightedNotes.join(" - ")}</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={() => playChordNotes(highlightedNotes, false)}>
                  <Volume2 className="h-4 w-4 mr-2" />Listen
                </Button>
                <Button size="sm" onClick={() => playChordNotes(highlightedNotes, true)}>
                  <Play className="h-4 w-4 mr-2" />Play
                </Button>
              </div>
            </div>
            <div className="relative flex justify-center overflow-x-auto py-4">
              <div className="relative flex">
                {whiteKeys.map((note, index) => {
                  const blackKey = blackKeys.find((bk) => bk.after === note)
                  const keyWidth = typeof window !== "undefined" && window.innerWidth < 640 ? 32 : 48
                  return (
                    <div key={note} className="relative">
                      <PianoKey note={note} isBlack={false} isHighlighted={highlightedNotes.includes(note)} position={0} />
                      {blackKey && <PianoKey note={blackKey.note} isBlack={true} isHighlighted={highlightedNotes.includes(blackKey.note)} position={(index + 1) * keyWidth - (keyWidth / 2)} />}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          <div className="p-4 sm:p-6 rounded-xl sm:rounded-2xl bg-card border border-border/50">
            <h3 className="font-semibold text-sm sm:text-base mb-3">Fingering Guide</h3>
            <div className="grid grid-cols-5 gap-2 sm:gap-4 text-center">
              {[1, 2, 3, 4, 5].map((finger) => (
                <div key={finger} className="space-y-1">
                  <div className={cn("w-8 h-8 sm:w-10 sm:h-10 rounded-full mx-auto flex items-center justify-center text-sm font-bold",
                    finger <= highlightedNotes.length ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground")}>{finger}</div>
                  <p className="text-xs text-muted-foreground">
                    {finger === 1 ? "Thumb" : finger === 2 ? "Index" : finger === 3 ? "Middle" : finger === 4 ? "Ring" : "Pinky"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}